/**
 * ITCH.IO - Scraper de juegos indie gratis
 * 
 * itch.io tiene cientos de juegos indie gratuitos.
 * Pagina: https://itch.io/games/free
 * Estructura: data-game_id + link con slug
 */

import { ScannedGame, ScanResult, GameSource, FREE_GAME_PRICING, DeliveryType } from '../types';

export async function scanItchio(): Promise<ScanResult> {
  const startTime = Date.now();
  const games: ScannedGame[] = [];

  try {
    const response = await fetch('https://itch.io/games/free', {
      headers: { 'User-Agent': 'DigiStore/1.0 (scanner@digistore.com)' },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Extraer game cells: data-game_id + href con slug
    const cellRegex = /data-game-id="(\d+)"[\s\S]{0,1500}?href="(https:\/\/[\w-]+\.itch\.io\/[\w-]+)"/g;
    const seen = new Set<string>();
    let match;

    while ((match = cellRegex.exec(html)) !== null) {
      const gameId = match[1];
      const url = match[2];

      if (seen.has(gameId)) continue;
      seen.add(gameId);

      // El titulo viene del slug del URL
      const slug = url.split('/').pop() || '';
      const title = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

      // Buscar imagen cerca del game_id
      const pos = html.indexOf(`data-game-id="${gameId}"`);
      const snippet = pos > 0 ? html.substring(pos, pos + 600) : '';
      const imgMatch = snippet.match(/src="(https:\/\/img\.itch\.zone[^"]+)"/);
      const imageUrl = imgMatch ? imgMatch[1].replace(/%[0-9a-fA-F]+$/, '') : '';

      games.push({
        id: `itchio-${gameId}`,
        sourceId: gameId,
        source: 'steam' as GameSource,
        title,
        description: `Juego indie 100% gratis en itch.io. Juego independiente creado por un desarrollador individual. Descarga directa, sin DRM.`,
        imageUrl: imageUrl || `https://img.itch.zone/aW1n/${gameId}/315x250.png`,
        originalPrice: 4.99,
        sellPrice: FREE_GAME_PRICING.calculate(4.99, 'drm-free' as DeliveryType),
        deliveryType: 'drm-free' as DeliveryType,
        platform: ['PC', 'itch.io'],
        genre: ['Indie'],
        claimUrl: url,
        claimInstructions: `1. Visita el enlace del juego en itch.io\n2. Haz clic en "Download" o "No thanks, just take me to the downloads"\n3. El juego se descarga directamente a tu PC\n4. Sin DRM, sin cuenta requerida`,
        stock: 0,
        unlimitedStock: true,
        status: 'active',
        startDate: new Date().toISOString(),
        scannedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        tags: ['free', 'itchio', 'indie', 'drm-free', 'pc', 'no-account'],
      });

      if (games.length >= 20) break;
    }

    return {
      source: 'steam' as GameSource,
      sourceName: 'itch.io (Indie Games)',
      success: true,
      gamesFound: games,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error('[itch.io Scanner] Error:', error.message);
    return {
      source: 'steam' as GameSource,
      sourceName: 'itch.io (Indie Games)',
      success: false,
      gamesFound: [],
      error: error.message,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  }
}
