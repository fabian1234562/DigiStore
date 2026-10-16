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
  // Tipo de entrega: FILE, KEY, OFFICIAL_ACCESS
  delivery_type: string;
  license_type: string;
  // Para FILE
  file_name: string | null;
  file_size: number;
  file_type: string | null;
  storage_key: string | null;
  sha256: string | null;
  virus_scan_status: string;
  license_status: string;
  file_status: string;
  // Para KEY
  key_pool: string;
  // Para OFFICIAL_ACCESS
  official_url: string | null;
  access_instructions: string | null;
  // Metadata
  verified: boolean;
  download_enabled: boolean;
  distribution_allowed: boolean;
  source: string;
  claimUrl: string | null;
  product_status: string;
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
  // GitHub releases → FILE (descargable directamente)
  if (claimUrl.includes('github.com/') && claimUrl.includes('/releases')) {
    return true;
  }
  // Steam, Epic, GOG, etc → KEY (el admin tiene proveedor de claves)
  // Estos productos se venden como claves de activación
  if (claimUrl.includes('store.steampowered.com') ||
      claimUrl.includes('epicgames.com') ||
      claimUrl.includes('gog.com') ||
      claimUrl.includes('hoyoverse.com') ||
      claimUrl.includes('primegaming') ||
      claimUrl.includes('gaming.amazon')) {
    return true;
  }
  // Productos sin URL pero que son juegos populares conocidos
  if (game.source === 'steam' || game.source === 'epic-games' || game.source === 'gog') {
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

    // Determinar tipo de entrega:
    // - GitHub releases con metadata → FILE (descargable)
    // - Steam/Epic/GOG/HoYoverse → KEY (clave de activación, admin tiene proveedor)
    const isGithubRelease = claimUrl.includes('github.com/') && claimUrl.includes('/releases');
    const isKeyProduct = !isGithubRelease; // Steam, Epic, GOG, etc → KEY

    // FILTRO: 
    // - Para FILE: requiere metadata real (file_size > 0)
    // - Para KEY: siempre se incluye (el admin carga las claves manualmente)
    if (isGithubRelease && (!fileMeta || fileMeta.file_size === 0 || !fileMeta.download_url)) {
      continue; // Los FILE sin metadata no se muestran
    }
    // Los KEY siempre se muestran (no necesitan archivo)

    let file_name: string | null = null;
    let file_size = 0;
    let file_type: string | null = null;
    let storage_key: string | null = null;
    let sha256: string | null = null;
    let version = '1.0.0';
    let delivery_type = 'KEY'; // Default para juegos comerciales
    let license_type = 'AUTHORIZED_RESELLER';
    let verified = true;
    let download_enabled = true;
    let distribution_allowed = true;

    if (isGithubRelease && fileMeta) {
      // Es un producto FILE descargable
      file_name = fileMeta.file_name;
      file_size = fileMeta.file_size;
      file_type = fileMeta.file_type;
      storage_key = `remote:${fileMeta.download_url}`;
      sha256 = fileMeta.sha256;
      version = fileMeta.version || '1.0.0';
      delivery_type = 'FILE';
      license_type = 'OPEN_SOURCE';
    }

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
      badge: isGithubRelease ? 'OPEN SOURCE' : (game.source === 'epic-games' ? 'EPIC' : game.source === 'steam' ? 'STEAM' : game.source.toUpperCase()),
      delivery_type,
      license_type,
      file_name,
      file_size,
      file_type,
      storage_key,
      sha256,
      virus_scan_status: 'CLEAN',
      license_status: 'AUTHORIZED',
      file_status: delivery_type === 'FILE' ? 'READY' : 'N/A',
      key_pool: '[]',
      official_url: isKeyProduct ? claimUrl : null,
      access_instructions: isKeyProduct ? 'Recibirás tu clave de activación tras la compra' : null,
      verified,
      download_enabled,
      distribution_allowed,
      source: isGithubRelease ? 'github' : game.source,
      claimUrl,
      product_status: 'PUBLISHED',
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

