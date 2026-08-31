/**
 * INDIEGALA - Scraper de sorteos y juegos gratis
 * 
 * IndieGala tiene sorteos diarios de juegos con claves Steam.
 * Parseamos el HTML de la página de giveaways.
 */

import { ScannedGame, ScanResult, GameSource, FREE_GAME_PRICING, DeliveryType } from '../types';

export async function scanIndieGala(): Promise<ScanResult> {
  const startTime = Date.now();
  const games: ScannedGame[] = [];

  try {
    const response = await fetch('https://www.indiegala.com/giveaways', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Extraer juegos del HTML - IndieGala usa data attributes
    // Buscamos los contenedores de juegos
    const gameBlocks = html.match(/data-id=\"(\d+)\"/g) || [];
    const titles = html.match(/giveaway-title[^>]*>([^<]+)</g) || [];
    const images = html.match(/src=\"(https:\/\/cdn\/[^"]+(?:jpg|png|webp))/gi) || [];
    const timeLeft = html.match(/countdown[^>]*data-time=\"(\d+)\"/g) || [];

    // Procesar cada bloque de juego encontrado
    for (let i = 0; i < Math.min(gameBlocks.length, 10); i++) {
      const gameId = gameBlocks[i]?.match(/\d+/)?.[0] || String(i);
      const title = titles[i]?.replace(/<[^>]+>/g, '').trim() || `IndieGala Giveaway #${i + 1}`;
      const image = images[i]?.replace(/src=\"/i, '').replace(/\"$/i, '') || '';
      const time = timeLeft[i]?.match(/\d+/)?.[0];
      
      // Convertir timestamp Unix a fecha si existe
      const endDate = time ? new Date(Number(time) * 1000).toISOString() : undefined;

      games.push({
        id: `indiegala-${gameId}`,
        sourceId: gameId,
        source: 'indiegala' as GameSource,
        title,
        description: `Juego gratis de IndieGala. Posiblemente incluye clave Steam.`,
        imageUrl: image,
        originalPrice: 0, // No sabemos el precio original
        sellPrice: FREE_GAME_PRICING.calculate(9.99, 'key' as DeliveryType),
        deliveryType: 'key' as DeliveryType,
        platform: ['Steam', 'PC'],
        genre: ['Indie'],
        claimUrl: `https://www.indiegala.com/giveaway/${gameId}`,
        claimInstructions: '1. Crea cuenta en IndieGala si no tienes\n2. Ve al enlace del sorteo\n3. Sigue las instrucciones para reclamar tu clave Steam\n4. La clave puede requerir completar tareas opcionales',
        stock: 0,
        unlimitedStock: true,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate,
        scannedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        tags: ['free', 'indiegala', 'giveaway', 'steam-key', 'indie'],
      });
    }

    // Si el parsing HTML no funcionó, intentar con datos de respaldo
    if (games.length === 0) {
      // Generar entrada genérica basada en que la página existe
      games.push({
        id: 'indiegala-daily',
        sourceId: 'daily',
        source: 'indiegala' as GameSource,
        title: 'IndieGala Daily Giveaway',
        description: 'Sorteo diario de IndieGala. Suele incluir claves Steam de juegos indie. Visita la página para ver el juego actual.',
        imageUrl: '',
        originalPrice: 0,
        sellPrice: 3.99,
        deliveryType: 'key' as DeliveryType,
        platform: ['Steam', 'PC'],
        genre: ['Indie'],
        claimUrl: 'https://www.indiegala.com/giveaways',
        claimInstructions: '1. Crea cuenta en IndieGala\n2. Ve a la sección de Giveaways\n3. Participa en el sorteo diario\n4. Si ganas, recibes una clave Steam por email',
        stock: 0,
        unlimitedStock: true,
        status: 'active',
        startDate: new Date().toISOString(),
        scannedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        tags: ['free', 'indiegala', 'giveaway', 'steam-key'],
      });
    }

    return {
      source: 'indiegala',
      sourceName: 'IndieGala',
      success: true,
      gamesFound: games,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error('[IndieGala Scanner] Error:', error.message);
    return {
      source: 'indiegala',
      sourceName: 'IndieGala',
      success: false,
      gamesFound: [],
      error: error.message,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  }
}