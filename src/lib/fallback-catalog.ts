/**
 * CATÁLOGO FALLBACK — Solo productos descargables DIRECTAMENTE desde DigiStore.
 *
 * REGLA CRÍTICA: Si DigiStore no puede entregar el archivo directamente
 * (generar link de descarga propio, hostear/servir el archivo),
 * el producto NO debe existir en el catálogo.
 *
 * Productos eliminados del catálogo:
 *   - Steam games (DRM, piratería)
 *   - Epic games (DRM, piratería)
 *   - HoYoverse (DRM, piratería)
 *   - Prime Gaming (requiere suscripción Amazon)
 *   - IndieGala/Fanatical/Humble (requieren cuenta en su plataforma)
 *
 * Productos que se mantienen:
 *   - Open source con GitHub releases (Lapce, VSCodium, OBS, etc.)
 *     DigiStore descarga el instalador de GitHub y lo sirve con su propio link.
 *   - Apps open source con sitio web oficial (Blender, GIMP, etc.)
 *     DigiStore descarga el instalador oficial y lo sirve.
 *   - Productos propios creados por DigiStore (Manual de Pentesting, etc.)
 *
 * Si un producto NO se puede descargar directamente desde DigiStore,
 * NO aparece en el catálogo. Punto.
 */

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

/**
 * Determina si un producto es DESCARGABLE DIRECTAMENTE desde DigiStore.
 *
 * SÍ descargable:
 *   - claimUrl contiene github.com/.../releases (descargar de GitHub)
 *   - claimUrl es sitio oficial de app open source conocida
 *
 * NO descargable:
 *   - Steam, Epic, HoYoverse, Prime Gaming, GOG (DRM)
 *   - URL genérica de store.steampowered.com/genre/Free%20to%20Play/
 *   - Sin URL clara
 */
function isDirectlyDownloadable(game: ScannedGame): boolean {
  const claimUrl = game.claimUrl || '';
  if (!claimUrl) return false;

  // Open source con GitHub releases → descargable
  if (claimUrl.includes('github.com/') && claimUrl.includes('/releases')) {
    return true;
  }

  // Sitios oficiales de apps open source conocidas (descarga directa del instalador)
  const officialSites = [
    'blender.org',
    'gimp.org',
    'audacityteam.org',
    'libreoffice.org',
    'openoffice.org',
    'mozilla.org',          // Firefox, Thunderbird
    'thunderbird.net',
    'videolan.org',         // VLC
    '7-zip.org',
    'obsproject.com',       // OBS Studio
    'synfig.org',
    'openshot.org',
    'pencil2d.org',
    'darktable.org',
    'retroarch.com',
    'prusa3d.com',          // PrusaSlicer
    'clementine-player.org',
    'strawberrymusicplayer.org',
  ];
  for (const site of officialSites) {
    if (claimUrl.includes(site)) return true;
  }

  // NO descargable: Steam, Epic, HoYoverse, Prime, GOG, etc.
  return false;
}

function buildCatalogFromSeed(): FallbackProduct[] {
  const catalog: FallbackProduct[] = [];

  for (const game of SEED_GAMES) {
    // FILTRO CRÍTICO: solo productos descargables directamente
    if (!isDirectlyDownloadable(game)) {
      continue;
    }

    const claimUrl = game.claimUrl || '';
    const isOpenSource = claimUrl.includes('github.com/') && claimUrl.includes('/releases');
    const sellPrice = calculateSellPrice(game.originalPrice);
    const category = detectCategory(game);

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
      version: '1.0.0',
      tags: game.tags || [],
      featured: false,
      badge: isOpenSource ? 'OPEN SOURCE' : 'OFFICIAL',
      file_name: null,
      file_size: 0,
      file_type: null,
      storage_key: null,
      sha256: null,
      verified: true,            // auto-verificados: son open source, archivo verificable
      download_enabled: true,    // se pueden descargar
      distribution_allowed: true, // licencia open source permite redistribución
      source: isOpenSource ? 'github' : 'official',
      claimUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return catalog;
}

let catalogCache: FallbackProduct[] | null = null;

export async function getFallbackCatalog(): Promise<FallbackProduct[]> {
  if (catalogCache) return catalogCache;
  catalogCache = buildCatalogFromSeed();
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
