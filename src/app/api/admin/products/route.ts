import { NextResponse } from 'next/server';
import { listProducts, createProduct } from '@/lib/products';

/**
 * GET /api/admin/products
 * Lista todos los productos.
 *
 * POST /api/admin/products
 * Crea un nuevo producto.
 *
 * Requiere header: x-admin-key con valor de ADMIN_SECRET_KEY
 */

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'digistore-admin-change-this-in-production';

function checkAuth(request: Request): boolean {
  const authKey = request.headers.get('x-admin-key');
  return authKey === ADMIN_KEY;
}

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const category = url.searchParams.get('category') || undefined;
  const isFree = url.searchParams.get('is_free');
  const verified = url.searchParams.get('verified');

  const products = await listProducts({
    category: category || undefined,
    is_free: isFree === 'true' ? true : isFree === 'false' ? false : undefined,
    verified: verified === 'true' ? true : verified === 'false' ? false : undefined,
  });

  // Parsear tags JSON y calcular canBeDownloaded
  const formatted = products.map((p: any) => ({
    ...p,
    tags: (() => {
      try { return typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags || []); } catch { return []; }
    })(),
    canBeDownloaded: !!(p.verified && p.download_enabled && p.distribution_allowed),
  }));

  return NextResponse.json({ success: true, products: formatted, total: formatted.length });
}

export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validación mínima
    if (!body.slug || !body.name || !body.description || !body.category) {
      return NextResponse.json(
        { error: 'missing_required_fields', message: 'slug, name, description y category son requeridos' },
        { status: 400 },
      );
    }

    const product = await createProduct({
      slug: body.slug,
      name: body.name,
      description: body.description,
      longDescription: body.longDescription,
      category: body.category,
      subcategory: body.subcategory,
      price: body.price || 0,
      originalPrice: body.originalPrice,
      currency: body.currency || 'USD',
      is_free: body.is_free || false,
      image: body.image,
      iconEmoji: body.iconEmoji,
      version: body.version || '1.0.0',
      tags: body.tags || [],
      featured: body.featured || false,
      badge: body.badge,
      source: body.source,
      claimUrl: body.claimUrl,
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
