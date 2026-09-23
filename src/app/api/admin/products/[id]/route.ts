import { NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/lib/products';
import { deleteFile } from '@/lib/storage';

/**
 * GET /api/admin/products/[id]
 *   Obtiene un producto específico con stats.
 *
 * PUT /api/admin/products/[id]
 *   Actualiza campos del producto.
 *
 * DELETE /api/admin/products/[id]
 *   Elimina producto + archivo del storage.
 */

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'digistore-admin-change-this-in-production';

function checkAuth(request: Request): boolean {
  return request.headers.get('x-admin-key') === ADMIN_KEY;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return NextResponse.json({ error: 'product_not_found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    product: {
      ...product,
      tags: (() => {
        try { return JSON.parse(product.tags); } catch { return []; }
      })(),
      canBeDownloaded:
        product.verified && product.download_enabled && product.distribution_allowed,
    },
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const updated = await updateProduct(id, body);
    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return NextResponse.json({ error: 'product_not_found' }, { status: 404 });
  }

  // Eliminar archivo del storage si existe
  if (product.storage_key) {
    await deleteFile(product.storage_key);
  }

  const deleted = await deleteProduct(id);

  return NextResponse.json({
    success: deleted,
    message: deleted ? 'Producto eliminado' : 'No se pudo eliminar',
  });
}
