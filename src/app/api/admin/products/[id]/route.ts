import { NextResponse } from 'next/server';
<<<<<<< HEAD
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

=======
import {
  getProductById,
  updateProduct,
  deleteProduct,
  setDownloadEnabled,
  setDistributionAllowed,
} from '@/lib/products';
import { deleteFile } from '@/lib/storage';

>>>>>>> 7456423 (feat: panel admin muestra TODOS los productos del scanner + import script)
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
<<<<<<< HEAD

  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return NextResponse.json({ error: 'product_not_found' }, { status: 404 });
  }
=======
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return NextResponse.json({ error: 'product_not_found' }, { status: 404 });
>>>>>>> 7456423 (feat: panel admin muestra TODOS los productos del scanner + import script)

  return NextResponse.json({
    success: true,
    product: {
      ...product,
      tags: (() => {
<<<<<<< HEAD
        try { return JSON.parse(product.tags); } catch { return []; }
      })(),
      canBeDownloaded:
        product.verified && product.download_enabled && product.distribution_allowed,
=======
        try { return typeof (product as any).tags === 'string' ? JSON.parse((product as any).tags) : (product as any).tags; } catch { return []; }
      })(),
      canBeDownloaded: !!(product as any).verified && (product as any).download_enabled && (product as any).distribution_allowed,
>>>>>>> 7456423 (feat: panel admin muestra TODOS los productos del scanner + import script)
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
<<<<<<< HEAD

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
=======
  const { id } = await params;
  try {
    const body = await request.json();
    const updated = await updateProduct(id, body);
    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
>>>>>>> 7456423 (feat: panel admin muestra TODOS los productos del scanner + import script)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
<<<<<<< HEAD

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
=======
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return NextResponse.json({ error: 'product_not_found' }, { status: 404 });

  if ((product as any).storage_key) {
    await deleteFile((product as any).storage_key);
  }

  const deleted = await deleteProduct(id);
  return NextResponse.json({ success: deleted });
>>>>>>> 7456423 (feat: panel admin muestra TODOS los productos del scanner + import script)
}
