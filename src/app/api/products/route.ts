import { NextResponse } from 'next/server';
import { PRODUCTS } from '@/lib/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'all';
  const subcategory = searchParams.get('subcategory') || 'all';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'popular';

  let filtered = [...PRODUCTS];

  if (category !== 'all') {
    filtered = filtered.filter((p) => p.category === category);
  }
  if (subcategory !== 'all') {
    filtered = filtered.filter((p) => p.subcategory === subcategory);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.platform.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  switch (sort) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case 'popular':
    default:
      filtered.sort((a, b) => b.sold - a.sold);
      break;
  }

  return NextResponse.json({ products: filtered, total: filtered.length });
}
