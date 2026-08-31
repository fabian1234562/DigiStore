/**
 * FANATICAL - Scraper de juegos gratis
 * 
 * Fanatical ocasionalmente regala juegos y tiene secciones free.
 */

import { ScannedGame, ScanResult, GameSource, FREE_GAME_PRICING, DeliveryType } from '../types';

export async function scanFanatical(): Promise<ScanResult> {
  const startTime = Date.now();
  const games: ScannedGame[] = [];

  try {
    const response = await fetch('https://www.fanatical.com/api/algolia/query', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        requests: [{
          indexName: 'prod_fanatical_products',
          query: '',
          params: 'filters=price_usd=0&hitsPerPage=20&facets=[]',
        }],
      }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      // Fallback: intentar con la pagina web
      const pageResponse = await fetch('https://www.fanatical.com/en/free', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        next: { revalidate: 3600 },
      });

      if (!pageResponse.ok) throw new Error(`HTTP ${response.status}`);

      const html = await pageResponse.text();
      const titles = html.match(/"name":"([^"]+)"/g)?.slice(0, 10) || [];
      const images = html.match(/"img":"([^"]+)"/g)?.slice(0, 10) || [];
      const slugs = html.match(/"slug":"([^"]+)"/g)?.slice(0, 10) || [];

      for (let i = 0; i < titles.length; i++) {
        const title = titles[i]?.match(/"name":"([^"]+)"/)?.[1] || `Fanatical Free #${i + 1}`;
        const image = images[i]?.match(/"img":"([^"]+)"/)?.[1] || '';
        const slug = slugs[i]?.match(/"slug":"([^"]+)"/)?.[1] || '';

        games.push({
          id: `fanatical-${slug || i}`,
          sourceId: slug || String(i),
          source: 'fanatical' as GameSource,
          title,
          description: 'Juego gratis de Fanatical. Puede incluir clave Steam.',
          imageUrl: image,
          originalPrice: 0,
          sellPrice: FREE_GAME_PRICING.calculate(9.99, 'key' as DeliveryType),
          deliveryType: 'key' as DeliveryType,
          platform: ['Steam', 'PC'],
          genre: ['Indie', 'Action'],
          claimUrl: slug ? `https://www.fanatical.com/en/${slug}` : 'https://www.fanatical.com/en/free',
          claimInstructions: '1. Crea cuenta en Fanatical si no tienes\n2. Ve al enlace del juego gratis\n3. Agrega el juego a tu cuenta\n4. Descarga la clave Steam cuando este disponible',
          stock: 0,
          unlimitedStock: true,
          status: 'active',
          startDate: new Date().toISOString(),
          scannedAt: new Date().toISOString(),
          lastChecked: new Date().toISOString(),
          tags: ['free', 'fanatical', 'steam-key'],
        });
      }

      if (games.length === 0) {
        games.push({
          id: 'fanatical-free-section',
          sourceId: 'free',
          source: 'fanatical' as GameSource,
          title: 'Fanatical Free Games',
          description: 'Fanatical ofrece juegos gratis periodicamente. Visita la seccion free para ver lo disponible ahora.',
          imageUrl: '',
          originalPrice: 0,
          sellPrice: 3.99,
          deliveryType: 'key' as DeliveryType,
          platform: ['Steam', 'PC'],
          genre: ['Various'],
          claimUrl: 'https://www.fanatical.com/en/free',
          claimInstructions: '1. Visita Fanatical.com\n2. Ve a la seccion Free\n3. Reclama los juegos disponibles\n4. Recibe claves Steam directas',
          stock: 0,
          unlimitedStock: true,
          status: 'active',
          startDate: new Date().toISOString(),
          scannedAt: new Date().toISOString(),
          lastChecked: new Date().toISOString(),
          tags: ['free', 'fanatical', 'steam-key'],
        });
      }

      return {
        source: 'fanatical',
        sourceName: 'Fanatical',
        success: true,
        gamesFound: games,
        scannedAt: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
    }

    // Procesar respuesta del API
    const data = await response.json() as any;
    const hits = data.results?.[0]?.hits || [];

    for (const hit of hits.slice(0, 20)) {
      games.push({
        id: `fanatical-${hit.objectID || hit.slug}`,
        sourceId: String(hit.objectID || hit.slug),
        source: 'fanatical' as GameSource,
        title: hit.name || 'Juego sin titulo',
        description: (hit.description || hit.steam_description || '').substring(0, 200),
        imageUrl: hit.img || hit.image || '',
        originalPrice: 0,
        sellPrice: FREE_GAME_PRICING.calculate(9.99, 'key' as DeliveryType),
        deliveryType: 'key' as DeliveryType,
        platform: ['Steam', 'PC'],
        genre: hit.genres?.split(',') || ['Indie'],
        claimUrl: hit.slug ? `https://www.fanatical.com/en/${hit.slug}` : 'https://www.fanatical.com/en/free',
        claimInstructions: '1. Crea cuenta en Fanatical\n2. Ve al enlace del juego\n3. Reclama tu clave Steam gratuita',
        stock: 0,
        unlimitedStock: true,
        status: 'active',
        startDate: new Date().toISOString(),
        scannedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        tags: ['free', 'fanatical', 'steam-key'],
      });
    }

    return {
      source: 'fanatical',
      sourceName: 'Fanatical',
      success: true,
      gamesFound: games,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error('[Fanatical Scanner] Error:', error.message);
    return {
      source: 'fanatical',
      sourceName: 'Fanatical',
      success: false,
      gamesFound: [],
      error: error.message,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  }
}
