/**
 * EPIC GAMES STORE - Scraper de juegos gratis
 * 
 * Epic Games regala 1-2 juegos cada semana (jueves a jueves).
 * Usamos su API pública GraphQL para obtener los juegos actuales.
 */

import { ScannedGame, ScanResult, GameSource, FREE_GAME_PRICING, DeliveryType } from '../types';

const EPIC_API = 'https://store-site-backend-static.ak.epicgames.com';
const COUNTRY = 'US';
const LOCALE = 'en-US';

interface EpicPromotion {
  promotions: {
    upcoming: any[];
    active: any[];
  };
}

interface EpicGame {
  id: string;
  title: string;
  description: string;
  keyImages: { type: string; url: string }[];
  price: {
    totalPrice: {
      discountPrice: number;
      originalPrice: number;
      fmtPrice: {
        originalPrice: string;
        discountPrice: string;
        interimPrice: string;
      };
    };
  };
  offerMappings?: any[];
  catalogNs: { mappings: { pageSlug: string; productSlug: string }[] }[];
  meta?: any;
}

export async function scanEpicGames(): Promise<ScanResult> {
  const startTime = Date.now();
  const games: ScannedGame[] = [];

  try {
    // Obtener promociones activas y próximas
    const url = `${EPIC_API}/freeGamesPromotions?locale=${LOCALE}&country=${COUNTRY}&allowCountries=${COUNTRY}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 3600 }, // Cache 1 hora
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as { data: EpicPromotion };
    const promotions = data.data?.promotions;

    if (!promotions) {
      throw new Error('No se encontraron promociones');
    }

    // Procesar juegos ACTIVOS (gratis ahora)
    for (const promo of [...promotions.active, ...promotions.upcoming]) {
      const game = promo.product as EpicGame | undefined;
      if (!game) continue;

      // Solo juegos con precio 0 o que estarán gratis
      const price = game.price?.totalPrice;
      const isFree = price?.discountPrice === 0 || price?.originalPrice === 0;
      
      if (!isFree) continue;

      // Obtener la imagen principal
      const keyImage = game.keyImages?.find(
        (img: any) => img.type === 'DieselStoreFrontWide' || img.type === 'OfferImageWide'
      ) || game.keyImages?.[0];

      // Slug del juego para enlace
      const slug = game.catalogNs?.mappings?.[0]?.pageSlug || game.offerMappings?.[0]?.pageSlug || '';

      // Fecha de fin
      const endDate = promo.end_date || null;

      // Determinar estado
      const isActive = promotions.active.includes(promo);
      const now = new Date();
      const end = endDate ? new Date(endDate) : null;
      let status: ScannedGame['status'] = 'active';
      if (end && (end.getTime() - now.getTime()) < 24 * 60 * 60 * 1000) {
        status = 'expiring';
      }

      const originalPrice = price?.originalPrice || 0;

      games.push({
        id: `epic-${game.id}`,
        sourceId: game.id,
        source: 'epic-games' as GameSource,
        title: game.title || 'Juego sin título',
        description: (game.description || '').substring(0, 200),
        imageUrl: keyImage?.url || '',
        originalPrice: originalPrice > 0 ? originalPrice / 100 : 0, // Epic usa centavos
        sellPrice: FREE_GAME_PRICING.calculate(originalPrice / 100, 'claim-link'),
        deliveryType: 'claim-link' as DeliveryType,
        platform: ['Epic Games'],
        genre: [],
        claimUrl: slug ? `https://store.epicgames.com/en-US/p/${slug}` : 'https://store.epicgames.com/en-US/free-games',
        claimInstructions: '1. Ve a la Epic Games Store (necesitas cuenta gratuita)\n2. Haz clic en "Get" para reclamar el juego\n3. El juego se agregará a tu biblioteca de Epic Games\n4. Descárgalo cuando quieras desde el launcher de Epic',
        stock: 0,
        unlimitedStock: true,
        status,
        startDate: promo.start_date || new Date().toISOString(),
        endDate: endDate || undefined,
        scannedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        tags: ['free', 'epic-games', 'weekly'],
      });
    }

    return {
      source: 'epic-games',
      sourceName: 'Epic Games Store',
      success: true,
      gamesFound: games,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error('[EpicGames Scanner] Error:', error.message);
    return {
      source: 'epic-games',
      sourceName: 'Epic Games Store',
      success: false,
      gamesFound: [],
      error: error.message,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  }
}
