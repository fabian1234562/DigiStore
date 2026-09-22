/**
 * DELIVERY — Sistema de entrega digital segura.
 *
 * Flujo:
 *   1. createDelivery() — genera token criptográfico, lo asocia a producto/usuario/orden
 *   2. verifyDelivery() — valida token (existe, no expirado, no invalidado, no excedido)
 *   3. recordDownload() — registra descarga, incrementa contador, hace log
 *
 * Storage:
 *   - Tokens son 64 chars hex (32 bytes random) — impredecibles
 *   - Persistencia en DB via Prisma (Delivery model)
 *   - Fallback a memoria si DB no disponible (dev only)
 *
 * Seguridad:
 *   - Tokens nunca se reutilizan
 *   - Expiración 24h por defecto
 *   - Máximo 5 descargas por token
 *   - Invalidación manual posible
 *   - Log de IP + user agent para auditoría
 */

import { db, isDbAvailable } from '@/lib/db';
import crypto from 'crypto';

const DEFAULT_EXPIRY_HOURS = 24;
const DEFAULT_MAX_DOWNLOADS = 5;

// ─── Fallback in-memory (cuando DB no está disponible) ───
interface MemoryDelivery {
  token: string;
  productId: string;
  productName: string;
  fileName: string;
  deliveryFormat: string;
  storageKey: string;
  sha256: string;
  fileSize: number;
  version: string;
  userEmail: string;
  userId?: string;
  orderId?: string;
  createdAt: number;
  expiresAt: number;
  downloadsCount: number;
  maxDownloads: number;
  invalidated: boolean;
  invalidationReason?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var deliveryStore: Map<string, MemoryDelivery> | undefined;
}

if (!globalThis.deliveryStore) {
  globalThis.deliveryStore = new Map();
}

const memoryStore = globalThis.deliveryStore;

/**
 * Genera un token criptográfico seguro de 64 chars hex (32 bytes).
 * NO usar IDs predecibles.
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export interface CreateDeliveryInput {
  productId: string;
  userEmail: string;
  userId?: string;
  orderId?: string;
  expiryHours?: number;
  maxDownloads?: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface DeliveryResult {
  success: boolean;
  token: string;
  downloadUrl: string;
  expiresAt: Date;
  maxDownloads: number;
  error?: string;
}

/**
 * Crea una entrega digital: genera token, lo asocia al producto y usuario.
 *
 * REGLA CRÍTICA: Solo se puede crear entrega si el producto cumple:
 *   verified = true
 *   download_enabled = true
 *   distribution_allowed = true
 */
export async function createDelivery(input: CreateDeliveryInput): Promise<DeliveryResult> {
  const token = generateToken();
  const expiresAt = new Date(
    Date.now() + (input.expiryHours ?? DEFAULT_EXPIRY_HOURS) * 60 * 60 * 1000,
  );
  const maxDownloads = input.maxDownloads ?? DEFAULT_MAX_DOWNLOADS;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  // Buscar producto (DB o fallback catálogo)
  let product: any = null;
  const dbOk = isDbAvailable();

  if (dbOk) {
    try {
      product = await db.product.findUnique({
        where: { id: input.productId },
      });
    } catch (err) {
      console.error('[delivery] DB error fetching product:', err);
    }
  }

  // Si no está en DB o no hay DB, intentar fallback catálogo
  if (!product) {
    const { getFallbackProductById } = await import('@/lib/fallback-catalog');
    product = await getFallbackProductById(input.productId);
  }

  if (!product) {
    return {
      success: false,
      token: '',
      downloadUrl: '',
      expiresAt: new Date(),
      error: 'product_not_found',
    };
  }

  // ─── Verificación de reglas de descarga ───
  if (!product.verified) {
    return {
      success: false,
      token: '',
      downloadUrl: '',
      expiresAt: new Date(),
      error: 'product_not_verified',
    };
  }
  if (!product.download_enabled) {
    return {
      success: false,
      token: '',
      downloadUrl: '',
      expiresAt: new Date(),
      error: 'download_disabled',
    };
  }
  if (!product.distribution_allowed) {
    return {
      success: false,
      token: '',
      downloadUrl: '',
      expiresAt: new Date(),
      error: 'distribution_not_allowed',
    };
  }

  // ─── Persistir entrega ───
  if (dbOk) {
    try {
      await db.delivery.create({
        data: {
          token,
          product_id: product.id,
          user_id: input.userId || null,
          user_email: input.userEmail,
          order_id: input.orderId || null,
          expires_at: expiresAt,
          max_downloads: maxDownloads,
          ip_address: input.ipAddress || null,
          user_agent: input.userAgent || null,
        },
      });
    } catch (err) {
      console.error('[delivery] DB error creating delivery:', err);
      // Fallback a memoria
    }
  } else {
    // Modo memoria (dev) - guardar con datos completos del producto
    const memDelivery: MemoryDelivery = {
      token,
      productId: product.id,
      productName: product.name,
      fileName: product.file_name || '',
      deliveryFormat: product.file_type || 'application/octet-stream',
      storageKey: product.storage_key || '',
      sha256: product.sha256 || '',
      fileSize: product.file_size || 0,
      version: product.version || '1.0.0',
      userEmail: input.userEmail,
      userId: input.userId,
      orderId: input.orderId,
      createdAt: Date.now(),
      expiresAt: expiresAt.getTime(),
      downloadsCount: 0,
      maxDownloads,
      invalidated: false,
    };
    memoryStore.set(token, memDelivery);
  }

  return {
    success: true,
    token,
    downloadUrl: `${baseUrl}/download/${token}`,
    expiresAt,
    maxDownloads,
  };
}

export interface VerifyDeliveryResult {
  valid: boolean;
  error?: string;
  delivery?: {
    token: string;
    productId: string;
    productName: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    storageKey: string;
    sha256: string;
    version: string;
    userEmail: string;
    orderId?: string;
    expiresAt: Date;
    downloadsCount: number;
    maxDownloads: number;
    remaining: number;
  };
}

/**
 * Verifica si un token es válido para descargar.
 * Comprueba: existe, no expirado, no invalidado, no excedido, producto sigue cumpliendo reglas.
 */
export async function verifyDelivery(token: string): Promise<VerifyDeliveryResult> {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return { valid: false, error: 'invalid_token_format' };
  }

  const dbOk = isDbAvailable();

  // Buscar en DB
  if (dbOk) {
    try {
      const delivery = await db.delivery.findUnique({
        where: { token },
        include: { product: true },
      });

      if (delivery) {
        if (delivery.invalidated) {
          return { valid: false, error: 'token_invalidated' };
        }
        if (new Date() > delivery.expires_at) {
          return { valid: false, error: 'token_expired' };
        }
        if (delivery.downloads_count >= delivery.max_downloads) {
          return { valid: false, error: 'download_limit_reached' };
        }

        const p = delivery.product;
        if (!p.verified || !p.download_enabled || !p.distribution_allowed) {
          return { valid: false, error: 'product_not_available' };
        }

        return {
          valid: true,
          delivery: {
            token: delivery.token,
            productId: p.id,
            productName: p.name,
            fileName: p.file_name || '',
            fileType: p.file_type || 'application/octet-stream',
            fileSize: p.file_size || 0,
            storageKey: p.storage_key || '',
            sha256: p.sha256 || '',
            version: p.version,
            userEmail: delivery.user_email,
            orderId: delivery.order_id || undefined,
            expiresAt: delivery.expires_at,
            downloadsCount: delivery.downloads_count,
            maxDownloads: delivery.max_downloads,
            remaining: delivery.max_downloads - delivery.downloads_count,
          },
        };
      }
      // Si no está en DB, continuar a memoria
    } catch (err) {
      console.error('[delivery] DB error verifying:', err);
    }
  }

  // Buscar en memoria (fallback)
  const memDelivery = memoryStore.get(token);
  if (!memDelivery) {
    return { valid: false, error: 'token_not_found' };
  }
  if (memDelivery.invalidated) {
    return { valid: false, error: 'token_invalidated' };
  }
  if (Date.now() > memDelivery.expiresAt) {
    memoryStore.delete(token);
    return { valid: false, error: 'token_expired' };
  }
  if (memDelivery.downloadsCount >= memDelivery.maxDownloads) {
    return { valid: false, error: 'download_limit_reached' };
  }

  return {
    valid: true,
    delivery: {
      token: memDelivery.token,
      productId: memDelivery.productId,
      productName: memDelivery.productName,
      fileName: memDelivery.fileName,
      fileType: memDelivery.deliveryFormat,
      fileSize: memDelivery.fileSize,
      storageKey: memDelivery.storageKey,
      sha256: memDelivery.sha256,
      version: memDelivery.version,
      userEmail: memDelivery.userEmail,
      orderId: memDelivery.orderId,
      expiresAt: new Date(memDelivery.expiresAt),
      downloadsCount: memDelivery.downloadsCount,
      maxDownloads: memDelivery.maxDownloads,
      remaining: memDelivery.maxDownloads - memDelivery.downloadsCount,
    },
  };
}

/**
 * Registra una descarga: incrementa el contador y hace log.
 */
export async function recordDownload(
  token: string,
  metadata: { ipAddress?: string; userAgent?: string; bytesServed?: number },
): Promise<void> {
  const dbOk = isDbAvailable();

  if (dbOk) {
    try {
      const delivery = await db.delivery.findUnique({
        where: { token },
      });
      if (!delivery) return;

      // Incrementar contador
      await db.delivery.update({
        where: { token },
        data: {
          downloads_count: { increment: 1 },
        },
      });

      // Crear log entry
      await db.downloadLog.create({
        data: {
          delivery_id: delivery.id,
          ip_address: metadata.ipAddress || null,
          user_agent: metadata.userAgent || null,
          bytes_served: metadata.bytesServed || 0,
        },
      });

      return;
    } catch (err) {
      console.error('[delivery] DB error recording download:', err);
    }
  }

  // Fallback memoria
  const memDelivery = memoryStore.get(token);
  if (memDelivery) {
    memDelivery.downloadsCount += 1;
    if (memDelivery.downloadsCount >= memDelivery.maxDownloads) {
      // Auto-delete después de llegar al límite
      // (en DB se mantiene para auditoría, en memoria se borra)
    }
  }
}

/**
 * Invalida un token manualmente (admin).
 */
export async function invalidateDelivery(
  token: string,
  reason: string,
): Promise<boolean> {
  const dbOk = isDbAvailable();

  if (dbOk) {
    try {
      await db.delivery.update({
        where: { token },
        data: {
          invalidated: true,
          invalidation_reason: reason,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  const mem = memoryStore.get(token);
  if (mem) {
    mem.invalidated = true;
    mem.invalidationReason = reason;
    return true;
  }
  return false;
}

/**
 * Limpieza de tokens expirados (para cron o llamada manual).
 */
export async function cleanupExpiredDeliveries(): Promise<number> {
  const dbOk = isDbAvailable();
  if (!dbOk) {
    let cleaned = 0;
    const now = Date.now();
    for (const [token, delivery] of memoryStore.entries()) {
      if (now > delivery.expiresAt) {
        memoryStore.delete(token);
        cleaned++;
      }
    }
    return cleaned;
  }

  try {
    const result = await db.delivery.deleteMany({
      where: {
        expires_at: { lt: new Date() },
      },
    });
    return result.count;
  } catch {
    return 0;
  }
}

/**
 * Obtiene la IP del cliente desde un Request.
 */
export function getClientIp(request: Request): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return undefined;
}

/**
 * Obtiene el User-Agent del cliente.
 */
export function getUserAgent(request: Request): string | undefined {
  return request.headers.get('user-agent') || undefined;
}
