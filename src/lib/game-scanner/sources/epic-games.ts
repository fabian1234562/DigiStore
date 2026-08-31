/**
 * EPIC GAMES STORE - Scraper de juegos gratis
 * 
 * Epic Games regala 1-2 juegos cada semana (jueves a jueves).
 * La API devuelve: data.Catalog.searchStore.elements
 * Cada elemento con discountPrice=0 esta gratis.
 */

import { ScannedGame, ScanResult, GameSource, FREE_GAME_PRICING, DeliveryType } from '../types';

const EPIC_API = 'https://store-site-backend-static.ak.epicgames.com';
const COUNTRY = 'US';
const LOCALE = 'en-US';

export async function scanEpicGames(): Promise<ScanResult> {
  const startTime = Date.now();
  const games: ScannedGame[] = [];

  try {
    const url = `${EPIC_API}/freeGamesPromotions?locale=${LOCALE}&country=${COUNTRY}&allowCountries=${COUNTRY}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as any;

    // Estructura actual: data.Catalog.searchStore.elements
    const elements: any[] = data?.data?.Catalog?.searchStore?.elements || [];

    for (const el of elements) {
      const title = el.title || 'Juego sin titulo';
      const totalPrice = el.price?.totalPrice || {};
      const discountPrice = totalPrice.discountPrice; // 0 = gratis
      const originalPrice = totalPrice.originalPrice || 0; // en centavos

      // Solo procesar juegos GRATIS (discountPrice === 0)
      if (discountPrice !== undefined && discountPrice !== 0) continue;
      // Si no tiene precio, verificar que tenga promocion activa
      const hasPromo = el.promotions?.promotionalOffers?.some((po: any) =>
        po.offers?.some((o: any) => {
          const now = new Date();
          const start = new Date(o.startDate);
          const end = new Date(o.endDate);
          return now >= start && now <= end;
        })
      );
      if (discountPrice === undefined && !hasPromo) continue;

      // Imagen principal
      const keyImages = el.keyImages || [];
      const wideImg = keyImages.find((i: any) => i.type === 'OfferImageWide' || i.type === 'DieselStoreFrontWide');
      const tallImg = keyImages.find((i: any) => i.type === 'OfferImageTall' || i.type === 'Thumbnail');
      const imageUrl = wideImg?.url || tallImg?.url || keyImages[0]?.url || '';

      // Slug para enlace
      const catalogNs = el.catalogNs?.mappings?.[0] || {};
      const slug = catalogNs.pageSlug || '';

      // Fechas de promocion
      let startDate = new Date().toISOString();
      let endDate: string | undefined;
      for (const po of el.promotions?.promotionalOffers || []) {
        for (const o of po.offers || []) {
          if (o.startDate) startDate = o.startDate;
          if (o.endDate) endDate = o.endDate;
        }
      }

      // Verificar si esta proximo a expirar (24h)
      const now = new Date();
      const end = endDate ? new Date(endDate) : null;
      const status: ScannedGame['status'] = (end && (end.getTime() - now.getTime()) < 24 * 60 * 60 * 1000) ? 'expiring' : 'active';

      // Precio original en USD (Epic usa centavos)
      const origPriceUsd = originalPrice > 0 ? originalPrice / 100 : 0;

      games.push({
        id: `epic-${el.id || slug}`,
        sourceId: String(el.id || ''),
        source: 'epic-games' as GameSource,
        title,
        description: (el.description || '').substring(0, 200) || `Juego gratis en Epic Games Store. Precio original: $${origPriceUsd}`,
        imageUrl,
        originalPrice: origPriceUsd,
        sellPrice: FREE_GAME_PRICING.calculate(origPriceUsd, 'claim-link' as DeliveryType),
        deliveryType: 'claim-link' as DeliveryType,
        platform: ['Epic Games'],
        genre: [],
        claimUrl: slug ? `https://store.epicgames.com/en-US/p/${slug}` : 'https://store.epicgames.com/en-US/free-games',
        claimInstructions: '1. Ve a la Epic Games Store (necesitas cuenta gratuita)\n2. Haz clic en "Get" para reclamar el juego\n3. El juego se agregara a tu biblioteca de Epic Games\n4. Descargalo cuando quieras desde el launcher de Epic',
        stock: 0,
        unlimitedStock: true,
        status,
        startDate,
        endDate,
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
