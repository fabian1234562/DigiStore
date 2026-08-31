/**
 * GOG.COM - Scraper de juegos gratis
 * 
 * GOG tiene una seccion de juegos gratuitos permanentes
 * y ocasionalmente regala juegos de pago.
 */

import { ScannedGame, ScanResult, GameSource, FREE_GAME_PRICING, DeliveryType } from '../types';

const GOG_API = 'https://api.gog.com/v2';

interface GOGProduct {
  id: number;
  title: string;
  slug: string;
  coverHorizontal: string;
  price: {
    finalMoney: { amount: number; currency: string };
    baseMoney: { amount: number; currency: string };
    discountPercentage: number;
    isFree: boolean;
  };
  summary?: string;
  rating?: number;
  genres?: string[];
  releaseDate?: string;
}

export async function scanGOG(): Promise<ScanResult> {
  const startTime = Date.now();
  const games: ScannedGame[] = [];

  try {
    const response = await fetch(
      `${GOG_API}/products?order=popularity:desc&price=free&mediaType=game&page=1&limit=20`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        next: { revalidate: 7200 },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as { products: GOGProduct[] };
    const products = data.products || [];

    for (const product of products) {
      const originalPrice = product.price?.baseMoney?.amount || 0;
      const isFree = product.price?.isFree || product.price?.finalMoney?.amount === 0;
      
      if (!isFree) continue;

      games.push({
        id: `gog-${product.id}`,
        sourceId: String(product.id),
        source: 'gog' as GameSource,
        title: product.title || 'Juego sin titulo',
        description: (product.summary || '').substring(0, 200),
        imageUrl: product.coverHorizontal || 'https://cdn.gog.com/content/system/images/gog-logo.png',
        originalPrice,
        sellPrice: FREE_GAME_PRICING.calculate(originalPrice, 'drm-free' as DeliveryType),
        deliveryType: 'drm-free' as DeliveryType,
        platform: ['GOG', 'PC'],
        genre: product.genres || ['Indie'],
        claimUrl: product.slug ? `https://www.gog.com/en/game/${product.slug}` : 'https://www.gog.com/en/games?price=free',
        claimInstructions: '1. Ve a GOG.com (necesitas cuenta gratuita)\n2. Haz clic en "Add to library" para reclamar el juego\n3. El juego se agrega a tu biblioteca GOG\n4. Puedes descargarlo cuando quieras, sin DRM',
        stock: 0,
        unlimitedStock: true,
        status: 'active',
        startDate: product.releaseDate || new Date().toISOString(),
        scannedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        tags: ['free', 'gog', 'drm-free', 'pc'],
        rating: product.rating ? (product.rating / 2) : undefined,
      });
    }

    return {
      source: 'gog',
      sourceName: 'GOG.com',
      success: true,
      gamesFound: games,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error('[GOG Scanner] Error:', error.message);
    return {
      source: 'gog',
      sourceName: 'GOG.com',
      success: false,
      gamesFound: [],
      error: error.message,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  }
}
