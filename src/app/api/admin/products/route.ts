import { NextResponse } from 'next/server';
import { listProducts, createProduct } from '@/lib/products';

<<<<<<< HEAD
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
=======
const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'digistore-admin-change-this-in-production';

function checkAuth(request: Request): boolean {
  return request.headers.get('x-admin-key') === ADMIN_KEY;
>>>>>>> 7456423 (feat: panel admin muestra TODOS los productos del scanner + import script)
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
<<<<<<< HEAD
    category: category || undefined,
=======
    category,
>>>>>>> 7456423 (feat: panel admin muestra TODOS los productos del scanner + import script)
    is_free: isFree === 'true' ? true : isFree === 'false' ? false : undefined,
    verified: verified === 'true' ? true : verified === 'false' ? false : undefined,
  });

<<<<<<< HEAD
  // Parsear tags JSON
  const formatted = products.map((p: any) => ({
    ...p,
    tags: (() => {
      try { return JSON.parse(p.tags); } catch { return []; }
    })(),
  }));

  return NextResponse.json({ success: true, products: formatted });
=======
  const formatted = products.map((p: any) => ({
    ...p,
    tags: (() => {
      try { return typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags; } catch { return []; }
    })(),
    canBeDownloaded: !!(p.verified && p.download_enabled && p.distribution_allowed),
  }));

  return NextResponse.json({ success: true, products: formatted, total: formatted.length });
>>>>>>> 7456423 (feat: panel admin muestra TODOS los productos del scanner + import script)
}

export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

<<<<<<< HEAD
    // Validación mínima
    if (!body.slug || !body.name || !body.description || !body.category) {
      return NextResponse.json(
        { error: 'missing_required_fields', message: 'slug, name, description y category son requeridos' },
=======
    if (!body.slug || !body.name || !body.description || !body.category) {
      return NextResponse.json(
        { error: 'missing_required_fields', message: 'slug, name, description, category requeridos' },
>>>>>>> 7456423 (feat: panel admin muestra TODOS los productos del scanner + import script)
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
<<<<<<< HEAD
      currency: body.currency || 'USD',
=======
>>>>>>> 7456423 (feat: panel admin muestra TODOS los productos del scanner + import script)
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
<<<<<<< HEAD
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
=======
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
>>>>>>> 7456423 (feat: panel admin muestra TODOS los productos del scanner + import script)
  }
}
