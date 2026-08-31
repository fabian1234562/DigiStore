/**
 * STEAM - Scraper de promociones y juegos gratuitos
 * 
 * Steam tiene juegos F2P permanentes y promociones temporales.
 * Usamos la Store API de Steam.
 */

import { ScannedGame, ScanResult, GameSource, FREE_GAME_PRICING, DeliveryType } from '../types';

const STEAM_API = 'https://store.steampowered.com/api';

interface SteamApp {
  id: number;
  name: string;
  type: string;
  is_free: boolean;
  header_image?: string;
  capsule_image?: string;
  short_description?: string;
  detailed_description?: string;
  developers?: string[];
  publishers?: string[];
  platforms?: { windows: boolean; mac: boolean; linux: boolean };
  metacritic?: { score: number };
  price_overview?: {
    currency: string;
    initial: number;
    final: number;
    discount_percent: number;
    final_formatted: string;
  };
  genres?: { id: number; description: string }[];
  categories?: { id: number; description: string }[];
  release_date?: { coming_soon: boolean; date: string };
}

interface SteamSpecials {
  [appId: string]: {
    id: number;
    name: string;
    original_price: number;
    final_price: number;
    discount_percent: number;
    currency: string;
    header_image: string;
    type: string;
    is_free: boolean;
  };
}

/** Obtener categorías destacadas (incluye specials/gratuitos) */
async function getFeaturedFree(): Promise<ScannedGame[]> {
  const games: ScannedGame[] = [];

  try {
    const response = await fetch(`${STEAM_API}/featuredcategories/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) return games;

    const data = await response.json() as any;

    // Buscar en specials y free games
    const specialItems = data.specials?.items || [];
    const freeItems = (data.specials?.items || []).filter((i: any) => 
      i.is_free || i.final_price === 0 || i.discount_percent === 100
    );

    for (const item of [...freeItems.slice(0, 10), ...specialItems.slice(0, 10)]) {
      const isFree = item.is_free || item.final_price === 0 || item.discount_percent === 100;
      const originalPrice = item.original_price / 100; // Steam usa centavos

      games.push({
        id: `steam-${item.id}`,
        sourceId: String(item.id),
        source: 'steam' as GameSource,
        title: item.name || 'Juego sin título',
        description: `Juego ${isFree ? 'gratuito' : `con ${item.discount_percent}% descuento`} en Steam`,
        imageUrl: item.header_image || item.small_capsule_image || '',
        originalPrice,
        sellPrice: isFree 
          ? FREE_GAME_PRICING.calculate(originalPrice, 'claim-link' as DeliveryType)
          : 0, // No vendemos juegos con descuento parcial aquí
        deliveryType: 'claim-link' as DeliveryType,
        platform: ['Steam', 'PC'],
        genre: [],
        claimUrl: `https://store.steampowered.com/app/${item.id}/`,
        claimInstructions: isFree
          ? '1. Ve a Steam y crea cuenta si no tienes\n2. Instala Steam en tu PC\n3. El juego es Free to Play - solo instálalo\n4. También puedes instalarlo desde tu navegador'
          : '',
        stock: 0,
        unlimitedStock: true,
        status: 'active',
        scannedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        tags: isFree ? ['free', 'steam', 'f2p', 'pc'] : ['deal', 'steam', 'pc'],
      });
    }
  } catch (error: any) {
    console.error('[Steam Scanner] Error en featured:', error.message);
  }

  return games;
}

/** Obtener juegos F2P populares */
async function getFreeToPlay(): Promise<ScannedGame[]> {
  const games: ScannedGame[] = [];

  try {
    // Steam tag para F2P
    const response = await fetch(
      `${STEAM_API}/storefront/?cc=US&l=english&f=free&category1=998`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) return games;

    const data = await response.json() as any;
    const items = data.items || [];

    for (const item of items.slice(0, 15)) {
      games.push({
        id: `steam-f2p-${item.id}`,
        sourceId: String(item.id),
        source: 'steam' as GameSource,
        title: item.name || 'Juego F2P',
        description: (item.small_description || '').substring(0, 200),
        imageUrl: item.large_capsule_image || item.header_image || '',
        originalPrice: 0,
        sellPrice: FREE_GAME_PRICING.calculate(0, 'claim-link' as DeliveryType),
        deliveryType: 'claim-link' as DeliveryType,
        platform: ['Steam', 'PC'],
        genre: [],
        claimUrl: `https://store.steampowered.com/app/${item.id}/`,
        claimInstructions: '1. Ve a Steam y crea cuenta si no tienes\n2. Busca el juego en la tienda\n3. Haz clic en "Play Game" para instalar\n4. El juego es 100% gratuito',
        stock: 0,
        unlimitedStock: true,
        status: 'active',
        scannedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        tags: ['free', 'steam', 'f2p', 'pc'],
      });
    }
  } catch (error: any) {
    console.error('[Steam Scanner] Error en F2P:', error.message);
  }

  return games;
}

export async function scanSteam(): Promise<ScanResult> {
  const startTime = Date.now();
  let allGames: ScannedGame[] = [];

  try {
    // Ejecutar ambos scans en paralelo
    const [featuredGames, f2pGames] = await Promise.all([
      getFeaturedFree(),
      getFreeToPlay(),
    ]);

    // Combinar y deduplicar por ID
    const seen = new Set<string>();
    for (const game of [...featuredGames, ...f2pGames]) {
      if (!seen.has(game.id)) {
        seen.add(game.id);
        allGames.push(game);
      }
    }

    return {
      source: 'steam',
      sourceName: 'Steam',
      success: true,
      gamesFound: allGames,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error('[Steam Scanner] Error:', error.message);
    return {
      source: 'steam',
      sourceName: 'Steam',
      success: false,
      gamesFound: [],
      error: error.message,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  }
}
