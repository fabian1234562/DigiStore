/**
 * PRODUCTS — CRUD de productos digitales con verificación.
 *
 * MODO DUAL:
 *   - Si DATABASE_URL configurada → usa Prisma (DB)
 *   - Si NO → usa fallback catalog (generado desde SEED_GAMES)
 *
 * Reglas de descarga:
 *   verified + download_enabled + distribution_allowed = true
 */

import { db, isDbAvailable } from '@/lib/db';
import {
  getFallbackProductById,
  getFallbackProductBySlug,
  listFallbackDownloadableProducts,
  getFallbackCatalog,
} from '@/lib/fallback-catalog';

export interface ProductInput {
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  subcategory?: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  is_free: boolean;
  image?: string;
  iconEmoji?: string;
  version?: string;
  tags?: string[];
  featured?: boolean;
  badge?: string;
  source?: string;
  claimUrl?: string;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  longDescription?: string;
  category?: string;
  subcategory?: string;
  price?: number;
  originalPrice?: number;
  is_free?: boolean;
  image?: string;
  iconEmoji?: string;
  version?: string;
  tags?: string[];
  featured?: boolean;
  badge?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  storage_key?: string;
  sha256?: string;
  download_enabled?: boolean;
  distribution_allowed?: boolean;
  verified?: boolean;
}

/**
 * Crea un producto. Solo funciona con DB.
 */
export async function createProduct(input: ProductInput) {
  if (!isDbAvailable()) {
    throw new Error('Database not available. Set DATABASE_URL to create products.');
  }
  return await db!.product.create({
    data: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      longDescription: input.longDescription || null,
      category: input.category,
      subcategory: input.subcategory || null,
      price: input.price,
      originalPrice: input.originalPrice || null,
      currency: input.currency || 'USD',
      is_free: input.is_free,
      image: input.image || null,
      iconEmoji: input.iconEmoji || null,
      version: input.version || '1.0.0',
      tags: JSON.stringify(input.tags || []),
      featured: input.featured || false,
      badge: input.badge || null,
      source: input.source || null,
      claimUrl: input.claimUrl || null,
      download_enabled: false,
      distribution_allowed: false,
      verified: false,
    },
  });
}

/**
 * Lista todos los productos.
 */
export async function listProducts(filter?: {
  category?: string;
  is_free?: boolean;
  verified?: boolean;
  download_enabled?: boolean;
}) {
  if (!isDbAvailable()) {
    const catalog = await getFallbackCatalog();
    return catalog.filter((p) => {
      if (filter?.category && p.category !== filter.category) return false;
      if (filter?.is_free !== undefined && p.is_free !== filter.is_free) return false;
      if (filter?.verified !== undefined && p.verified !== filter.verified) return false;
      if (filter?.download_enabled !== undefined && p.download_enabled !== filter.download_enabled) return false;
      return true;
    });
  }

  const where: any = {};
  if (filter?.category) where.category = filter.category;
  if (filter?.is_free !== undefined) where.is_free = filter.is_free;
  if (filter?.verified !== undefined) where.verified = filter.verified;
  if (filter?.download_enabled !== undefined) where.download_enabled = filter.download_enabled;

  return await db!.product.findMany({ where, orderBy: { createdAt: 'desc' } });
}

/**
 * Obtiene un producto por ID.
 */
export async function getProductById(id: string) {
  if (!isDbAvailable()) {
    return await getFallbackProductById(id);
  }
  return await db!.product.findUnique({ where: { id } });
}

/**
 * Obtiene un producto por slug.
 */
export async function getProductBySlug(slug: string) {
  if (!isDbAvailable()) {
    return await getFallbackProductBySlug(slug);
  }
  return await db!.product.findUnique({ where: { slug } });
}

/**
 * Lista productos descargables.
 */
export async function listDownloadableProducts(filter?: {
  category?: string;
  is_free?: boolean;
}) {
  if (!isDbAvailable()) {
    return await listFallbackDownloadableProducts(filter);
  }

  const where: any = {
    verified: true,
    download_enabled: true,
    distribution_allowed: true,
  };
  if (filter?.category) where.category = filter.category;
  if (filter?.is_free !== undefined) where.is_free = filter.is_free;

  return await db!.product.findMany({ where, orderBy: { createdAt: 'desc' } });
}

/**
 * Actualiza un producto. Solo funciona con DB.
 */
export async function updateProduct(id: string, update: ProductUpdate) {
  if (!isDbAvailable()) {
    throw new Error('Database not available. Cannot update products in fallback mode.');
  }

  const data: any = { ...update };
  if (update.tags) {
    data.tags = JSON.stringify(update.tags);
  }

  return await db!.product.update({ where: { id }, data });
}

/**
 * Elimina un producto.
 */
export async function deleteProduct(id: string): Promise<boolean> {
  if (!isDbAvailable()) return false;

  try {
    await db!.product.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

/**
 * Verifica si un producto puede ser descargado.
 */
export function canBeDownloaded(product: any): boolean {
  return !!(
    product &&
    product.verified === true &&
    product.download_enabled === true &&
    product.distribution_allowed === true
  );
}

/**
 * Marca producto como verificado. Solo DB.
 */
export async function markProductVerified(id: string, sha256: string) {
  if (!isDbAvailable()) return null;
  return await db!.product.update({ where: { id }, data: { verified: true, sha256 } });
}

/**
 * Activa/desactiva descarga.
 */
export async function setDownloadEnabled(id: string, enabled: boolean) {
  if (!isDbAvailable()) return null;
  return await db!.product.update({ where: { id }, data: { download_enabled: enabled } });
}

/**
 * Marca/desmarca distribución.
 */
export async function setDistributionAllowed(id: string, allowed: boolean) {
  if (!isDbAvailable()) return null;
  return await db!.product.update({ where: { id }, data: { distribution_allowed: allowed } });
}

/**
 * Asocia archivo a producto.
 */
export async function attachFileToProduct(
  id: string,
  fileInfo: {
    fileName: string;
    fileSize: number;
    fileType: string;
    storageKey: string;
    sha256: string;
    version?: string;
  },
) {
  if (!isDbAvailable()) return null;
  return await db!.product.update({
    where: { id },
    data: {
      file_name: fileInfo.fileName,
      file_size: fileInfo.fileSize,
      file_type: fileInfo.fileType,
      storage_key: fileInfo.storageKey,
      sha256: fileInfo.sha256,
      version: fileInfo.version || '1.0.0',
      verified: true,
    },
  });
}

/**
 * Stats de descargas.
 */
export async function getProductStats(id: string) {
  if (!isDbAvailable()) return null;

  const deliveries = await db!.delivery.findMany({
    where: { product_id: id },
    include: { download_logs: true },
  });

  return {
    totalDeliveries: deliveries.length,
    totalDownloads: deliveries.reduce((sum, d) => sum + d.downloads_count, 0),
    lastDownload: deliveries
      .flatMap((d) => d.download_logs)
      .sort((a, b) => b.downloaded_at.getTime() - a.downloaded_at.getTime())[0]?.downloaded_at || null,
    activeTokens: deliveries.filter((d) => !d.invalidated && d.expires_at > new Date()).length,
  };
}
