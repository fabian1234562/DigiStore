/**
 * PRODUCTS — CRUD de productos digitales con verificación.
 *
 * Reglas de descarga (para mostrar botón [DESCARGAR]):
 *   verified = true
 *   download_enabled = true
 *   distribution_allowed = true
 *
 * Las 3 condiciones deben cumplirse simultáneamente.
 */

import { db } from '@/lib/db';

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
  // Archivo
  file_name?: string;
  file_size?: number;
  file_type?: string;
  storage_key?: string;
  sha256?: string;
  // Flags
  download_enabled?: boolean;
  distribution_allowed?: boolean;
  verified?: boolean;
}

/**
 * Verifica si DB está disponible.
 */
async function isDbAvailable(): Promise<boolean> {
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

/**
 * Crea un producto nuevo.
 */
export async function createProduct(input: ProductInput) {
  const dbOk = await isDbAvailable();
  if (!dbOk) {
    throw new Error('Database not available. Set DATABASE_URL env var.');
  }

  return await db.product.create({
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
      // Por defecto, sin archivo ni verificación
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
  const dbOk = await isDbAvailable();
  if (!dbOk) {
    return [];
  }

  const where: any = {};
  if (filter?.category) where.category = filter.category;
  if (filter?.is_free !== undefined) where.is_free = filter.is_free;
  if (filter?.verified !== undefined) where.verified = filter.verified;
  if (filter?.download_enabled !== undefined) where.download_enabled = filter.download_enabled;

  return await db.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Obtiene un producto por ID.
 */
export async function getProductById(id: string) {
  const dbOk = await isDbAvailable();
  if (!dbOk) return null;

  return await db.product.findUnique({
    where: { id },
  });
}

/**
 * Obtiene un producto por slug.
 */
export async function getProductBySlug(slug: string) {
  const dbOk = await isDbAvailable();
  if (!dbOk) return null;

  return await db.product.findUnique({
    where: { slug },
  });
}

/**
 * Lista productos disponibles para descarga (cumplen las 3 condiciones).
 */
export async function listDownloadableProducts(filter?: {
  category?: string;
  is_free?: boolean;
}) {
  const dbOk = await isDbAvailable();
  if (!dbOk) return [];

  const where: any = {
    verified: true,
    download_enabled: true,
    distribution_allowed: true,
  };
  if (filter?.category) where.category = filter.category;
  if (filter?.is_free !== undefined) where.is_free = filter.is_free;

  return await db.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Actualiza un producto.
 */
export async function updateProduct(id: string, update: ProductUpdate) {
  const dbOk = await isDbAvailable();
  if (!dbOk) {
    throw new Error('Database not available');
  }

  const data: any = { ...update };
  if (update.tags) {
    data.tags = JSON.stringify(update.tags);
  }

  return await db.product.update({
    where: { id },
    data,
  });
}

/**
 * Elimina un producto.
 */
export async function deleteProduct(id: string): Promise<boolean> {
  const dbOk = await isDbAvailable();
  if (!dbOk) return false;

  try {
    await db.product.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

/**
 * Verifica si un producto puede ser descargado.
 * Las 3 condiciones deben cumplirse simultáneamente.
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
 * Marca un producto como verificado (después de calcular SHA-256, etc).
 */
export async function markProductVerified(id: string, sha256: string) {
  const dbOk = await isDbAvailable();
  if (!dbOk) return null;

  return await db.product.update({
    where: { id },
    data: {
      verified: true,
      sha256,
    },
  });
}

/**
 * Activa o desactiva la descarga de un producto.
 */
export async function setDownloadEnabled(id: string, enabled: boolean) {
  const dbOk = await isDbAvailable();
  if (!dbOk) return null;

  return await db.product.update({
    where: { id },
    data: { download_enabled: enabled },
  });
}

/**
 * Marca o desmarca la autorización de distribución.
 */
export async function setDistributionAllowed(id: string, allowed: boolean) {
  const dbOk = await isDbAvailable();
  if (!dbOk) return null;

  return await db.product.update({
    where: { id },
    data: { distribution_allowed: allowed },
  });
}

/**
 * Asocia un archivo a un producto (después de subirlo al storage).
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
  const dbOk = await isDbAvailable();
  if (!dbOk) return null;

  return await db.product.update({
    where: { id },
    data: {
      file_name: fileInfo.fileName,
      file_size: fileInfo.fileSize,
      file_type: fileInfo.fileType,
      storage_key: fileInfo.storageKey,
      sha256: fileInfo.sha256,
      version: fileInfo.version || '1.0.0',
      verified: true, // Auto-verificar al tener SHA-256
    },
  });
}

/**
 * Obtiene estadísticas de descargas de un producto.
 */
export async function getProductStats(id: string) {
  const dbOk = await isDbAvailable();
  if (!dbOk) return null;

  const deliveries = await db.delivery.findMany({
    where: { product_id: id },
    include: {
      download_logs: true,
    },
  });

  const totalDeliveries = deliveries.length;
  const totalDownloads = deliveries.reduce((sum, d) => sum + d.downloads_count, 0);
  const lastDownload = deliveries
    .flatMap((d) => d.download_logs)
    .sort((a, b) => b.downloaded_at.getTime() - a.downloaded_at.getTime())[0];

  return {
    totalDeliveries,
    totalDownloads,
    lastDownload: lastDownload?.downloaded_at || null,
    activeTokens: deliveries.filter(
      (d) => !d.invalidated && d.expires_at > new Date(),
    ).length,
  };
}
