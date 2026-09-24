import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * GET /api/products/hacking
 *
 * Sirve el catálogo de productos propios de hacking de DigiStore.
 * Lee /public/downloads/products.json (manifest generado).
 */

export const dynamic = 'force-static';
export const revalidate = 3600; // 1 hora

export interface HackingProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: 'hacking';
  subcategory: string;
  price: number;
  originalPrice: number;
  currency: string;
  image: string;
  icon_emoji: string;
  rating: number;
  reviews: number;
  sold: number;
  deliveryType: 'download';
  deliveryFormat: 'pdf' | 'zip';
  fileName: string;
  fileSize: string;
  deliveryTime: string;
  platform: string;
  region: string;
  tags: string[];
  featured: boolean;
  badge: string;
  features: string[];
}

export async function GET() {
  try {
    const manifestPath = path.join(
      process.cwd(),
      'public',
      'downloads',
      'products.json',
    );
    const raw = await fs.readFile(manifestPath, 'utf-8');
    const data = JSON.parse(raw);
    const products = (data.products || []) as HackingProduct[];

    return NextResponse.json(
      { success: true, products, total: products.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown_error';
    return NextResponse.json(
      { success: false, error: 'cannot_load_products', detail: message },
      { status: 500 },
    );
  }
}
