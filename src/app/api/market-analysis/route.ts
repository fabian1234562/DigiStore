import { NextResponse } from 'next/server';
import { getScannedGamesAsProducts } from '@/lib/game-scanner';

export async function GET() {
  const products = getScannedGamesAsProducts();
  const bySource: Record<string, { count: number; revenue: number; avgPrice: number }> = {};
  for (const p of products) {
    const src = p.subcategory || 'Otro';
    if (!bySource[src]) bySource[src] = { count: 0, revenue: 0, avgPrice: 0 };
    bySource[src].count++;
    bySource[src].revenue += p.price;
  }
  for (const key in bySource) {
    bySource[key].avgPrice = bySource[key].revenue / bySource[key].count;
  }
  return NextResponse.json(Object.entries(bySource).map(([id, d]) => ({ id, name: id, count: d.count, totalSold: d.count * 25, avgRevenue: d.avgPrice })));
}