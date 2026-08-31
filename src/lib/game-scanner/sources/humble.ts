/**
 * HUMBLE BUNDLE - Scraper de juegos gratis
 * 
 * Humble Bundle tiene una sección de juegos gratuitos.
 */

import { ScannedGame, ScanResult, GameSource, FREE_GAME_PRICING, DeliveryType } from '../types';

export async function scanHumble(): Promise<ScanResult> {
  const startTime = Date.now();
  const games: ScannedGame[] = [];

  try {
    const response = await fetch('https://www.humblebundle.com/store/free', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();

    // Extraer datos del HTML usando patrones conocidos de Humble
    const jsonData = html.match(/<script[^>]*>\s*window\.machine_offer_data\s*=\s*({.+?})\s*<\/script>/s);
    
    if (jsonData) {
      try {
        const offers = JSON.parse(jsonData[1]);
        const offerKeys = Object.keys(offers);
        
        for (const key of offerKeys.slice(0, 10)) {
          const offer = offers[key];
          if (!offer || !offer.human_name) continue;
          
          const isFree = offer.current_price?.amount === 0 || offer.is_free;
          if (!isFree) continue;

          const image = offer.standard_carousel_image || offer.hero_image || '';
          
          games.push({
            id: `humble-${key}`,
            sourceId: key,
            source: 'humble' as GameSource,
            title: offer.human_name,
            description: (offer.short_marketing_blurb || offer.detailed_marketing_blurb || '').substring(0, 200),
            imageUrl: image,
            originalPrice: offer.retail_price?.amount || 0,
            sellPrice: FREE_GAME_PRICING.calculate(offer.retail_price?.amount || 0, 'key' as DeliveryType),
            deliveryType: 'key' as DeliveryType,
            platform: ['Steam', 'PC'],
            genre: (offer.developer_tags || []).slice(0, 3),
            claimUrl: `https://www.humblebundle.com/store/${offer.machine_name}`,
            claimInstructions: '1. Crea cuenta en Humble Bundle\n2. Ve al enlace del juego gratis\n3. Haz clic en "Add to cart" y luego "Checkout for $0"\n4. Recibe tu clave Steam en tu biblioteca Humble',
            stock: 0,
            unlimitedStock: true,
            status: 'active',
            startDate: new Date().toISOString(),
            scannedAt: new Date().toISOString(),
            lastChecked: new Date().toISOString(),
            tags: ['free', 'humble', 'steam-key'],
          });
        }
      } catch (e) {
        console.error('[Humble Scanner] Error parsing JSON:', e);
      }
    }

    // Fallback si no se encontró JSON
    if (games.length === 0) {
      const titles = html.match(/human_name[^>]*>[^<]*([A-Z][^<]{3,50})</gi) || [];
      const images = html.match(/(https:\/\/[\w.-]+humblebundle\.com[\w\/.-]+\.(?:jpg|png|webp))/gi) || [];

      for (let i = 0; i < Math.min(titles.length, 5); i++) {
        const title = titles[i]?.replace(/<[^>]+>/g, '').trim() || `Humble Free #${i + 1}`;
        games.push({
          id: `humble-fallback-${i}`,
          sourceId: String(i),
          source: 'humble' as GameSource,
          title,
          description: 'Juego gratis de Humble Bundle. Puede requerir cuenta Humble.',
          imageUrl: images[i] || '',
          originalPrice: 0,
          sellPrice: 3.99,
          deliveryType: 'key' as DeliveryType,
          platform: ['Steam', 'PC'],
          genre: ['Various'],
          claimUrl: 'https://www.humblebundle.com/store/free',
          claimInstructions: '1. Crea cuenta en Humble Bundle\n2. Ve a la sección Free\n3. Reclama los juegos disponibles',
          stock: 0,
          unlimitedStock: true,
          status: 'active',
          startDate: new Date().toISOString(),
          scannedAt: new Date().toISOString(),
          lastChecked: new Date().toISOString(),
          tags: ['free', 'humble', 'steam-key'],
        });
      }
    }

    if (games.length === 0) {
      games.push({
        id: 'humble-free-section',
        sourceId: 'free',
        source: 'humble' as GameSource,
        title: 'Humble Bundle Free Games',
        description: 'Humble Bundle ofrece juegos gratis periódicamente. Visita la sección free para ver lo disponible.',
        imageUrl: '',
        originalPrice: 0,
        sellPrice: 3.99,
        deliveryType: 'key' as DeliveryType,
        platform: ['Steam', 'PC'],
        genre: ['Various'],
        claimUrl: 'https://www.humblebundle.com/store/free',
        claimInstructions: '1. Visita humblebundle.com/store/free\n2. Crea cuenta si no tienes\n3. Reclama los juegos gratis disponibles\n4. Recibe claves Steam en tu biblioteca',
        stock: 0,
        unlimitedStock: true,
        status: 'active',
        startDate: new Date().toISOString(),
        scannedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        tags: ['free', 'humble', 'steam-key'],
      });
    }

    return {
      source: 'humble',
      sourceName: 'Humble Bundle',
      success: true,
      gamesFound: games,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error('[Humble Scanner] Error:', error.message);
    return {
      source: 'humble',
      sourceName: 'Humble Bundle',
      success: false,
      gamesFound: [],
      error: error.message,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  }
}