/**
 * API: PRODUCT CATALOG
 * 
 * GET /api/scanner/results          - All active products
 * GET /api/scanner/results?source=X  - Filter by source
 * GET /api/scanner/results?q=X      - Search
 */

import { NextResponse } from 'next/server';
import { gameScanner } from '@/lib/game-scanner';
import type { GameSource } from '@/lib/game-scanner';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const source = url.searchParams.get('source') as GameSource | null;
  const query = url.searchParams.get('q');
  const asProducts = url.searchParams.get('products') === 'true';

  try {
    let games;

    if (source) {
      games = gameScanner.getGamesBySource(source);
    } else if (query) {
      games = gameScanner.searchGames(query);
    } else {
      games = gameScanner.getActiveGames();
    }

    if (asProducts) {
      // Store-compatible format
      const products = games.map(g => ({
        id: `digistore-${g.id}`,
        name: g.title,
        description: g.description,
        price: g.sellPrice,
        originalPrice: g.originalPrice > 0 ? g.originalPrice : undefined,
        category: g.tags.includes('software') ? 'Software y Licencias' : 'Juegos Digitales',
        subcategory: g.source === 'epic-games' ? 'Epic Games' :
                   g.source === 'prime-gaming' ? 'Prime Gaming' :
                   g.source === 'gog' ? 'GOG.com' :
                   g.source === 'humble' ? 'Humble Bundle' :
                   g.source === 'indiegala' ? 'IndieGala' :
                   g.source === 'fanatical' ? 'Fanatical' :
                   g.source === 'steam' ? 'Steam' :
                   g.source === 'software' ? 'Software' :
                   g.source,
        image: g.imageUrl || '/products/gen/gaming-cat.png',
        rating: g.rating || 4,
        reviews: 0,
        sold: Math.floor(Math.random() * 50) + 10,
        deliveryTime: 'Inmediato',
        platform: g.platform.join(', '),
        region: 'Global',
        tags: [...g.tags, 'digital-product'],
        stock: 999,
        featured: g.status === 'expiring',
      }));
      return NextResponse.json({ success: true, products, total: products.length });
    }

    return NextResponse.json({
      success: true,
      games,
      total: games.length,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}