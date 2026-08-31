import { NextResponse } from 'next/server';
import { getScannedGamesAsProducts } from '@/lib/game-scanner';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'popular';
  const source = searchParams.get('source') || '';

  let products = getScannedGamesAsProducts();

  if (source) {
    products = products.filter(p => p.subcategory?.toLowerCase().includes(source.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.platform || '').toLowerCase().includes(q)
    );
  }

  switch (sort) {
    case 'price-asc': products.sort((a, b) => a.price - b.price); break;
    case 'price-desc': products.sort((a, b) => b.price - a.price); break;
    case 'rating': products.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
  }

  return NextResponse.json({ products, total: products.length });
}
