import { NextResponse } from 'next/server';
import { PRODUCTS, CATEGORIES } from '@/lib/store';

export async function GET() {
  const data = CATEGORIES.map(cat => ({
    id: cat.id,
    name: cat.name,
    count: PRODUCTS.filter(p => p.category === cat.id).length,
    totalSold: PRODUCTS.filter(p => p.category === cat.id).reduce((s, p) => s + p.sold, 0),
  }));
  return NextResponse.json(data);
}
