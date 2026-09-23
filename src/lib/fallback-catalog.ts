/**
 * CATÁLOGO FALLBACK — Solo productos descargables DIRECTAMENTE desde DigiStore.
 *
 * Cada producto en el catálogo tiene un archivo asociado:
 *   - storage_key local: si el archivo está en /public/downloads/private/
 *   - storage_key remoto: "remote:https://..." → fetch on-demand al servir
 *
 * La metadata (filename, size, type, download_url) se carga desde
 * /public/downloads/metadata.json al primer request.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { SEED_GAMES } from '@/lib/game-scanner/seed-data';
import type { ScannedGame } from '@/lib/game-scanner';

export interface FallbackProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice: number;
  currency: string;
  is_free: boolean;
  image: string;
  iconEmoji: string;
  version: string;
  tags: string[];
  featured: boolean;
  badge: string;
  file_name: string | null;
  file_size: number;
  file_type: string | null;
  storage_key: string | null;
  sha256: string | null;
  verified: boolean;
  download_enabled: boolean;
  distribution_allowed: boolean;
  source: string;
  claimUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProductMetadata {
  file_name: string;
  file_size: number;
  file_type: string;
  download_url: string;
  sha256: string | null;
  version: string;
  note?: string;
}

function calculateSellPrice(originalPrice: number): number {
  if (originalPrice >= 20) return 4.99;
  if (originalPrice >= 10) return 3.99;
  if (originalPrice >= 5) return 2.99;
  return 1.99;
}

function detectCategory(game: ScannedGame): string {
  if (game.source === 'software') return 'apps';
  return 'other';
}

function isDirectlyDownloadable(game: ScannedGame): boolean {
  const claimUrl = game.claimUrl || '';
  if (!claimUrl) return false;

  // Solo productos con GitHub releases: esos SÍ tienen URL directa
  // al instalador binario verificable (asset URL de GitHub).
  // Los sitios oficiales (blender.org, gimp.org, etc.) NO se incluyen
  // porque sus URLs de descarga cambian y requieren scraping del HTML.
  if (claimUrl.includes('github.com/') && claimUrl.includes('/releases')) {
    return true;
  }

  return false;
}

let catalogCache: FallbackProduct[] | null = null;
let metadataCache: Record<string, ProductMetadata> | null = null;

/**
 * Carga el archivo metadata.json desde /public/downloads/.
 * Si no existe, retorna objeto vacío.
 */
async function loadMetadata(): Promise<Record<string, ProductMetadata>> {
  if (metadataCache) return metadataCache;

  const metadataPath = path.join(process.cwd(), 'public', 'downloads', 'metadata.json');
  try {
    const raw = await fs.readFile(metadataPath, 'utf-8');
    const data = JSON.parse(raw);
    metadataCache = (data.products || {}) as Record<string, ProductMetadata>;
  } catch {
    metadataCache = {};
  }
  return metadataCache;
}

function buildCatalogFromSeed(): FallbackProduct[] {
  // Esta función se llama de forma síncrona, no puede esperar metadata
  // Por eso buildCatalogWithMetadata es la versión async correcta
  return [];
}

/**
 * Construye el catálogo completo con metadata de archivos cargada async.
 *
 * REGLA CRÍTICA: Solo se incluyen productos que tienen metadata real
 * (file_size > 0, download_url válida). Si un producto no tiene metadata,
 * NO aparece en el catálogo. Punto.
 */
async function buildCatalogWithMetadata(): Promise<FallbackProduct[]> {
  const metadata = await loadMetadata();
  const catalog: FallbackProduct[] = [];

  for (const game of SEED_GAMES) {
    if (!isDirectlyDownloadable(game)) continue;

    const claimUrl = game.claimUrl || '';
    const isOpenSource = claimUrl.includes('github.com/') && claimUrl.includes('/releases');
    const sellPrice = calculateSellPrice(game.originalPrice);
    const category = detectCategory(game);

    // Buscar metadata del archivo
    const fileMeta = metadata[game.id];

    // FILTRO CRÍTICO: si no hay metadata real (file_size > 0), NO se incluye
    if (!fileMeta || fileMeta.file_size === 0 || !fileMeta.download_url) {
      continue;
    }

    const file_name = fileMeta.file_name;
    const file_size = fileMeta.file_size;
    const file_type = fileMeta.file_type;
    const storage_key = `remote:${fileMeta.download_url}`;
    const sha256 = fileMeta.sha256;
    const version = fileMeta.version || '1.0.0';

    catalog.push({
      id: game.id,
      slug: game.id.toLowerCase(),
      name: game.title,
      description: game.description,
      longDescription: game.description,
      category,
      subcategory: (game.genre && game.genre[0]) || game.source,
      price: sellPrice,
      originalPrice: game.originalPrice,
      currency: 'USD',
      is_free: false,
      image: game.imageUrl,
      iconEmoji: '📦',
      version,
      tags: game.tags || [],
      featured: false,
      badge: isOpenSource ? 'OPEN SOURCE' : 'OFFICIAL',
      file_name,
      file_size,
      file_type,
      storage_key,
      sha256,
      verified: true,
      download_enabled: true,
      distribution_allowed: true,
      source: isOpenSource ? 'github' : 'official',
      claimUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return catalog;
}

export async function getFallbackCatalog(): Promise<FallbackProduct[]> {
  if (catalogCache) return catalogCache;
  catalogCache = await buildCatalogWithMetadata();
  return catalogCache;
}

export async function getFallbackProductById(id: string): Promise<FallbackProduct | null> {
  const catalog = await getFallbackCatalog();
  return catalog.find((p) => p.id === id || p.slug === id) || null;
}

export async function getFallbackProductBySlug(slug: string): Promise<FallbackProduct | null> {
  const catalog = await getFallbackCatalog();
  return catalog.find((p) => p.slug === slug) || null;
}

export async function listFallbackDownloadableProducts(filter?: {
  category?: string;
  is_free?: boolean;
}): Promise<FallbackProduct[]> {
  const catalog = await getFallbackCatalog();
  return catalog.filter((p) => {
    if (!p.verified || !p.download_enabled || !p.distribution_allowed) return false;
    if (filter?.category && p.category !== filter.category) return false;
    if (filter?.is_free !== undefined && p.is_free !== filter.is_free) return false;
    return true;
  });
}

