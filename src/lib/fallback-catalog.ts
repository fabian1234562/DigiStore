/**
 * CATÁLOGO FALLBACK — Productos disponibles sin DB.
 *
 * Cuando DATABASE_URL no está configurada (Vercel sin DB),
 * este catálogo generado desde SEED_GAMES sirve TODOS los
 * productos del scanner en el panel admin.
 *
 * Reglas:
 *   - Open source (github.com/.../releases): verified + descargable
 *   - Steam/Epic/HoYoverse: pendientes de auditoría
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
  if (['epic-games', 'steam', 'gog', 'prime-gaming', 'humble', 'indiegala', 'fanatical'].includes(game.source)) return 'games';
  return 'other';
}

function buildCatalogFromSeed(): FallbackProduct[] {
  const catalog: FallbackProduct[] = [];

  for (const game of SEED_GAMES) {
    const claimUrl = game.claimUrl || '';
    const isOpenSource = claimUrl.includes('github.com/') && claimUrl.includes('/releases');
    const isSteam = claimUrl.includes('store.steampowered.com');
    const isEpic = claimUrl.includes('epicgames.com');
    const isHoyoverse = claimUrl.includes('hoyoverse.com');

    const sellPrice = calculateSellPrice(game.originalPrice);
    const category = detectCategory(game);

    let verified = false;
    let download_enabled = false;
    let distribution_allowed = false;
    let source = 'scanner';
    let badge = '';

    if (isOpenSource) {
      verified = true;
      download_enabled = true;
      distribution_allowed = true;
      source = 'github';
      badge = 'OPEN SOURCE';
    } else if (isSteam) {
      source = 'steam';
      badge = 'STEAM';
    } else if (isEpic) {
      source = 'epic';
      badge = 'EPIC';
    } else if (isHoyoverse) {
      source = 'hoyoverse';
      badge = 'HOYOVERSE';
    } else {
      source = game.source;
      badge = game.source.toUpperCase();
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
      version: '1.0.0',
      tags: game.tags || [],
      featured: false,
      badge,
      file_name: null,
      file_size: 0,
      file_type: null,
      storage_key: null,
      sha256: null,
      verified,
      download_enabled,
      distribution_allowed,
      source,
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
