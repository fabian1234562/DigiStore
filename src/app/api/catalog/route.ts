import { NextResponse } from 'next/server';
import { listProducts } from '@/lib/products';

/**
 * GET /api/catalog
 *
 * API PÚBLICA (sin auth) que sirve el catálogo de productos.
 * No requiere admin key.
 *
 * Usado por la página de inicio para mostrar juegos populares.
 */

export async function GET() {
  try {
    const products = await listProducts();
    const formatted = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice || 0,
      category: p.category,
      subcategory: p.subcategory || '',
      image: p.image || '/products/fortnite.png',
      badge: p.badge || '',
      delivery_type: p.delivery_type || 'KEY',
      featured: p.featured || false,
      tags: (() => {
        try { return typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags || []); } catch { return []; }
      })(),
      rating: p.rating || 5,
      reviews: p.reviews || 0,
      sold: p.sold || 0,
      deliveryTime: 'Instantáneo',
      platform: (p.claimUrl || '').includes('epic') ? 'Epic Games' :
                (p.claimUrl || '').includes('steam') ? 'Steam' :
                (p.claimUrl || '').includes('gog') ? 'GOG' : 'Multi',
      region: 'Global',
      stock: 999,
    }));
    return NextResponse.json({ success: true, products: formatted, total: formatted.length });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'failed', products: [] });
  }
}
