/**
 * CHEAPSHARK - Agregador de ofertas de juegos (API real)
 * 
 * CheapShark es una API GRATUITA que agrega precios de todas las tiendas.
 * Cuando upperPrice=0, devuelve juegos 100% gratis.
 * Esta es la fuente MAS CONFIABLE porque tiene API real.
 */

import { ScannedGame, ScanResult, GameSource, FREE_GAME_PRICING, DeliveryType } from '../types';

const CHEAPSHARK_API = 'https://www.cheapshark.com/api/1.0';

const STORE_NAMES: Record<string, string> = {
  '1': 'Steam', '2': 'GamersGate', '3': 'GreenManGaming', '7': 'GOG',
  '8': 'Origin', '11': 'Humble Bundle', '13': 'Uplay', '15': 'Fanatical',
  '21': 'WinGameStore', '23': 'GameBillet', '24': 'Voidu',
  '25': 'Epic Games', '27': 'Gamesplanet', '28': 'Nuuvem',
  '29': 'DLGamer', '30': 'IndieGala', '31': 'Blowtorch',
};

export async function scanCheapShark(): Promise<ScanResult> {
  const startTime = Date.now();
  const games: ScannedGame[] = [];

  try {
    // Obtener juegos 100% gratis de todas las tiendas
    const response = await fetch(
      `${CHEAPSHARK_API}/deals?upperPrice=0&pageSize=30&pageNumber=0`,
      {
        headers: {
          'User-Agent': 'DigiStore/1.0 (scanner@digistore.com)',
          'Accept': 'application/json',
        },
        next: { revalidate: 1800 },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const deals = await response.json() as any[];

    for (const deal of deals) {
      const title = deal.title || 'Juego sin titulo';
      const storeId = String(deal.storeID || '1');
      const storeName = STORE_NAMES[storeId] || 'Unknown';
      const steamAppId = deal.steamAppID;
      const metacritic = deal.metacriticScore;

      // Determinar plataforma
      const platform = storeId === '1' ? ['Steam', 'PC'] :
                       storeId === '7' ? ['GOG', 'PC'] :
                       storeId === '25' ? ['Epic Games'] :
                       ['PC'];

      // Tipo de entrega
      const deliveryType: DeliveryType = (storeId === '1' || storeId === '7') ? 'key' : 'claim-link';

      // Precio original estimado (metacritic da pistas de calidad)
      const estimatedOriginal = metacritic > 70 ? 29.99 : metacritic > 50 ? 19.99 : 9.99;

      games.push({
        id: `cheapshark-${deal.dealID}`,
        sourceId: String(deal.dealID),
        source: 'steam' as GameSource, // CheapShark reutilizamos como source genérica
        title,
        description: `Juego 100% GRATIS en ${storeName}. Metacritic: ${metacritic || 'N/A'}. Enlace directo a la oferta.`,
        imageUrl: deal.thumb || '',
        originalPrice: estimatedOriginal,
        sellPrice: FREE_GAME_PRICING.calculate(estimatedOriginal, deliveryType),
        deliveryType,
        platform,
        genre: [],
        claimUrl: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
        claimInstructions: `1. Haz clic en el enlace de reclamacion
2. Sera redirigido a ${storeName}
3. Reclama o agrega el juego a tu cuenta
4. Si es clave Steam, la recibira directamente`,
        stock: 0,
        unlimitedStock: true,
        status: 'active',
        startDate: new Date().toISOString(),
        scannedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        tags: ['free', storeName.toLowerCase().replace(/\s+/g, '-'), 'aggregated', 'verified-free'],
        rating: metacritic ? Math.max(1, metacritic / 20) : undefined,
      });
    }

    return {
      source: 'steam' as GameSource,
      sourceName: 'CheapShark Aggregator',
      success: true,
      gamesFound: games,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error('[CheapShark Scanner] Error:', error.message);
    return {
      source: 'steam' as GameSource,
      sourceName: 'CheapShark Aggregator',
      success: false,
      gamesFound: [],
      error: error.message,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  }
}
