/**
 * PRIME GAMING - Scraper de juegos gratis con Amazon Prime
 * 
 * Prime Gaming incluye juegos gratis mensuales para suscriptores Prime.
 */

import { ScannedGame, ScanResult, GameSource, FREE_GAME_PRICING, DeliveryType } from '../types';

export async function scanPrimeGaming(): Promise<ScanResult> {
  const startTime = Date.now();
  const games: ScannedGame[] = [];

  try {
    // Prime Gaming tiene una API interna que usan en su SPA
    const response = await fetch('https://gaming.amazon.com/api/game-help', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 7200 },
    });

    // Intentar obtener datos de la página principal
    const mainResponse = await fetch('https://gaming.amazon.com/home', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 },
    });

    if (!mainResponse.ok) throw new Error(`HTTP ${mainResponse.status}`);

    const html = await mainResponse.text();

    // Extraer datos JSON embebidos en la página
    const dataMatch = html.match(/__NEXT_DATA__[^>]*>(.+?)<\/script>/s);
    
    if (dataMatch) {
      try {
        const nextData = JSON.parse(dataMatch[1]);
        const gameOffers = nextData?.props?.pageProps?.games || [];
        
        for (const game of gameOffers.slice(0, 10)) {
          const title = game.product?.title || game.title || 'Prime Gaming Game';
          const image = game.product?.image || game.image || '';
          const isGame = game.contentType === 'GAME';
          
          games.push({
            id: `prime-${game.id || game.contentId || Math.random().toString(36).substr(2, 8)}`,
            sourceId: String(game.id || game.contentId),
            source: 'prime-gaming' as GameSource,
            title,
            description: `Juego ${isGame ? 'PC' : 'in-game'} gratis con Amazon Prime Gaming. Se necesita suscripción activa de Prime.`,
            imageUrl: image.startsWith('http') ? image : `https:${image}`,
            originalPrice: 0,
            sellPrice: FREE_GAME_PRICING.calculate(9.99, 'claim-link' as DeliveryType),
            deliveryType: 'claim-link' as DeliveryType,
            platform: isGame ? ['PC'] : ['Various'],
            genre: [],
            claimUrl: `https://gaming.amazon.com/home`,
            claimInstructions: '1. Necesitas suscripción activa de Amazon Prime\n2. Ve a gaming.amazon.com\n3. Inicia sesión con tu cuenta Amazon\n4. Haz clic en "Claim" en el juego que quieras\n5. Si es juego PC, recibirás clave o se enlazará a tu cuenta',
            stock: 0,
            unlimitedStock: true,
            status: 'active',
            startDate: new Date().toISOString(),
            scannedAt: new Date().toISOString(),
            lastChecked: new Date().toISOString(),
            tags: ['free', 'prime-gaming', 'amazon', isGame ? 'pc-game' : 'in-game-content'],
          });
        }
      } catch (e) {
        console.error('[Prime Gaming Scanner] Error parsing data:', e);
      }
    }

    // Fallback genérico
    if (games.length === 0) {
      games.push({
        id: 'prime-gaming-monthly',
        sourceId: 'monthly',
        source: 'prime-gaming' as GameSource,
        title: 'Prime Gaming - Juegos del Mes',
        description: 'Amazon Prime Gaming regala juegos PC y contenido in-game cada mes. Incluye suscripción a Twitch con emotes y más.',
        imageUrl: '',
        originalPrice: 0,
        sellPrice: 3.99,
        deliveryType: 'claim-link' as DeliveryType,
        platform: ['PC', 'Various'],
        genre: ['Various'],
        claimUrl: 'https://gaming.amazon.com/home',
        claimInstructions: '1. Necesitas Amazon Prime activo\n2. Visita gaming.amazon.com\n3. Inicia sesión\n4. Reclama los juegos y contenido disponibles\n5. Los juegos PC se vinculan a tu cuenta o dan clave Steam',
        stock: 0,
        unlimitedStock: true,
        status: 'active',
        startDate: new Date().toISOString(),
        scannedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        tags: ['free', 'prime-gaming', 'amazon', 'monthly'],
      });
    }

    return {
      source: 'prime-gaming',
      sourceName: 'Prime Gaming',
      success: true,
      gamesFound: games,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error('[Prime Gaming Scanner] Error:', error.message);
    return {
      source: 'prime-gaming',
      sourceName: 'Prime Gaming',
      success: false,
      gamesFound: [],
      error: error.message,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  }
}
