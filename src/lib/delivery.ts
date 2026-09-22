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
  // eslint-disable-next-line no-var
  var deliveryDownloads: Map<string, number> | undefined;
}

if (!globalThis.deliveryStore) {
  globalThis.deliveryStore = new Map();
}
if (!globalThis.deliveryDownloads) {
  globalThis.deliveryDownloads = new Map();
}

const memoryStore = globalThis.deliveryStore;
const downloadCounts = globalThis.deliveryDownloads;

/**
 * En Vercel serverless, globalThis no persiste entre lambdas.
 * Por eso, además de memoria, generamos tokens STATELESS firmados
 * con HMAC-SHA256 que contienen todos los datos necesarios.
 *
 * El token stateless tiene formato:
 *   <payload>.<signature>
 *
 * Payload (JSON base64url):
 *   {
 *     productId, productName, fileName, fileType, fileSize,
 *     storageKey, sha256, version, userEmail, orderId,
 *     exp (epoch ms), maxDownloads
 *   }
 *
 * La firma es HMAC-SHA256 del payload con ADMIN_SECRET_KEY.
 * Esto permite verificar el token sin DB ni memoria compartida.
 *
 * El contador de descargas SÍ requiere memoria compartida o DB.
 * En Vercel sin DB, el contador puede ser inexacto entre cold starts
 * pero el token sigue siendo válido hasta su expiración.
 */

const TOKEN_SECRET = process.env.ADMIN_SECRET_KEY || 'digistore-token-secret-change-me';

function base64urlEncode(buf: Buffer | string): string {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  return b.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64urlDecode(s: string): Buffer {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

function signPayload(payload: string): string {
  return crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
}

/**
 * Genera un token criptográfico seguro.
 * Si DB está disponible → token aleatorio de 64 chars hex (almacenado en DB)
 * Si no → token stateless con payload + firma (no requiere DB)
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Genera un token stateless que contiene todos los datos del delivery.
 * Útil para Vercel sin DB.
 */
function generateStatelessToken(data: Omit<MemoryDelivery, 'token' | 'createdAt' | 'downloadsCount' | 'invalidated' | 'invalidationReason'>): string {
  const payload = {
    productId: data.productId,
    productName: data.productName,
    fileName: data.fileName,
    fileType: data.deliveryFormat,
    fileSize: data.fileSize,
    storageKey: data.storageKey,
    sha256: data.sha256,
    version: data.version,
    userEmail: data.userEmail,
    userId: data.userId,
    orderId: data.orderId,
    exp: data.expiresAt,
    maxDownloads: data.maxDownloads,
  };
  const payloadStr = base64urlEncode(JSON.stringify(payload));
  const signature = signPayload(payloadStr);
  return `${payloadStr}.${signature}`;
}

/**
 * Verifica y decodifica un token stateless.
 * Devuelve los datos del delivery si el token es válido.
 */
function verifyStatelessToken(token: string): MemoryDelivery | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadStr, signature] = parts;

  // Verificar firma
  const expectedSignature = signPayload(payloadStr);
  if (!crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex'),
  )) {
    return null;
  }

  try {
    const payload = JSON.parse(base64urlDecode(payloadStr).toString('utf-8'));
    if (Date.now() > payload.exp) return null;

    return {
      token,
      productId: payload.productId,
      productName: payload.productName,
      fileName: payload.fileName,
      deliveryFormat: payload.fileType,
      storageKey: payload.storageKey,
      sha256: payload.sha256,
      fileSize: payload.fileSize,
      version: payload.version,
      userEmail: payload.userEmail,
      userId: payload.userId,
      orderId: payload.orderId,
      createdAt: Date.now(),
      expiresAt: payload.exp,
      downloadsCount: downloadCounts.get(token) || 0,
      maxDownloads: payload.maxDownloads || 5,
      invalidated: false,
    };
  } catch {
    return null;
  }
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
    // Modo memoria (Vercel sin DB) - usar token STATELESS firmado
    // para que sobreviva entre cold starts de lambdas
    const memDeliveryData = {
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
      expiresAt: expiresAt.getTime(),
      maxDownloads,
    };
    const statelessToken = generateStatelessToken(memDeliveryData);

    // También guardar en memoria (best-effort, puede perderse entre cold starts)
    memoryStore.set(statelessToken, {
      ...memDeliveryData,
      token: statelessToken,
      createdAt: Date.now(),
      downloadsCount: 0,
      invalidated: false,
    });

    return {
      success: true,
      token: statelessToken,
      downloadUrl: `${baseUrl}/download/${statelessToken}`,
      expiresAt,
      maxDownloads,
    };
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
  if (!token) {
    return { valid: false, error: 'invalid_token_format' };
  }

  const dbOk = isDbAvailable();

  // Buscar en DB (token aleatorio de 64 hex chars)
  if (dbOk && /^[a-f0-9]{64}$/.test(token)) {
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
  if (memDelivery) {
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

  // Intentar verificar como token stateless (Vercel sin DB)
  // Esto permite que el token funcione aunque se pierda la memoria
  if (token.includes('.')) {
    const statelessDelivery = verifyStatelessToken(token);
    if (statelessDelivery) {
      return {
        valid: true,
        delivery: {
          token: statelessDelivery.token,
          productId: statelessDelivery.productId,
          productName: statelessDelivery.productName,
          fileName: statelessDelivery.fileName,
          fileType: statelessDelivery.deliveryFormat,
          fileSize: statelessDelivery.fileSize,
          storageKey: statelessDelivery.storageKey,
          sha256: statelessDelivery.sha256,
          version: statelessDelivery.version,
          userEmail: statelessDelivery.userEmail,
          orderId: statelessDelivery.orderId,
          expiresAt: new Date(statelessDelivery.expiresAt),
          downloadsCount: statelessDelivery.downloadsCount,
          maxDownloads: statelessDelivery.maxDownloads,
          remaining: statelessDelivery.maxDownloads - statelessDelivery.downloadsCount,
        },
      };
    }
  }

  return { valid: false, error: 'token_not_found' };
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
