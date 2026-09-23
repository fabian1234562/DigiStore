import { NextResponse } from 'next/server';
<<<<<<< HEAD
import {
  getProductById,
  updateProduct,
  setDownloadEnabled,
  setDistributionAllowed,
  markProductVerified,
} from '@/lib/products';
import { verifyFileIntegrity } from '@/lib/storage';

/**
 * POST /api/admin/products/[id]/verify
 *
 * Verifica la integridad del archivo (re-calcula SHA-256) y marca
 * el producto como verificado.
 *
 * Body opcional:
 *   { "verified": true/false, "downloadEnabled": true/false, "distributionAllowed": true/false }
 *
 * Si no se envía body, solo verifica integridad del archivo.
 */

=======
import { getProductById, markProductVerified } from '@/lib/products';
import { verifyFileIntegrity } from '@/lib/storage';

>>>>>>> 7456423 (feat: panel admin muestra TODOS los productos del scanner + import script)
const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'digistore-admin-change-this-in-production';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authKey = request.headers.get('x-admin-key');
  if (authKey !== ADMIN_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = await params;
<<<<<<< HEAD

  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json(
      { error: 'product_not_found' },
      { status: 404 },
    );
  }

  // Si no tiene storage_key, no hay archivo que verificar
  if (!product.storage_key || !product.sha256) {
    return NextResponse.json({
      success: false,
      error: 'no_file_attached',
      message: 'El producto no tiene archivo asociado. Sube un archivo primero.',
    });
  }

  // Verificar integridad del archivo
  const integrity = await verifyFileIntegrity(product.storage_key, product.sha256);
=======
  const product = await getProductById(id);
  if (!product) return NextResponse.json({ error: 'product_not_found' }, { status: 404 });

  if (!(product as any).storage_key || !(product as any).sha256) {
    return NextResponse.json({
      success: false,
      error: 'no_file_attached',
      message: 'El producto no tiene archivo. Sube uno primero.',
    });
  }

  const integrity = await verifyFileIntegrity((product as any).storage_key, (product as any).sha256);
>>>>>>> 7456423 (feat: panel admin muestra TODOS los productos del scanner + import script)

  if (!integrity.exists) {
    return NextResponse.json({
      success: false,
      error: 'file_missing_in_storage',
<<<<<<< HEAD
      message: 'El archivo no existe en el storage. Puede haber sido eliminado.',
=======
      message: 'El archivo no existe en el storage.',
>>>>>>> 7456423 (feat: panel admin muestra TODOS los productos del scanner + import script)
    });
  }

  if (!integrity.sha256Matches) {
    return NextResponse.json({
      success: false,
      error: 'integrity_check_failed',
<<<<<<< HEAD
      message: `El SHA-256 actual no coincide con el registrado. El archivo fue modificado.`,
      expected: product.sha256,
      actual: integrity.actualSha256,
    });
  }

  // Si el request trae flags, actualizarlos
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    // Body vacío, solo verificar
  }

  if (typeof body.verified === 'boolean') {
    await markProductVerified(id, product.sha256);
  }
  if (typeof body.downloadEnabled === 'boolean') {
    await setDownloadEnabled(id, body.downloadEnabled);
  }
  if (typeof body.distributionAllowed === 'boolean') {
    await setDistributionAllowed(id, body.distributionAllowed);
=======
      message: 'El SHA-256 no coincide. El archivo fue modificado.',
    });
  }

  let body: any = {};
  try { body = await request.json(); } catch {}
  if (typeof body.verified === 'boolean') {
    await markProductVerified(id, (product as any).sha256);
>>>>>>> 7456423 (feat: panel admin muestra TODOS los productos del scanner + import script)
  }

  const updated = await getProductById(id);

  return NextResponse.json({
    success: true,
    verified: true,
    integrity: {
      sha256: integrity.actualSha256,
      matches: integrity.sha256Matches,
      size: integrity.size,
    },
    product: {
      id: updated?.id,
      name: updated?.name,
<<<<<<< HEAD
      verified: updated?.verified,
      download_enabled: updated?.download_enabled,
      distribution_allowed: updated?.distribution_allowed,
      canBeDownloaded:
        updated?.verified && updated?.download_enabled && updated?.distribution_allowed,
    },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authKey = request.headers.get('x-admin-key');
  if (authKey !== ADMIN_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return NextResponse.json({ error: 'product_not_found' }, { status: 404 });
  }

  if (!product.storage_key || !product.sha256) {
    return NextResponse.json({
      success: true,
      hasFile: false,
      message: 'Producto sin archivo asociado',
    });
  }

  const integrity = await verifyFileIntegrity(product.storage_key, product.sha256);

  return NextResponse.json({
    success: true,
    hasFile: integrity.exists,
    integrity: {
      sha256: integrity.actualSha256,
      matches: integrity.sha256Matches,
      size: integrity.size,
=======
      verified: (updated as any)?.verified,
      download_enabled: (updated as any)?.download_enabled,
      distribution_allowed: (updated as any)?.distribution_allowed,
      canBeDownloaded: !!((updated as any)?.verified && (updated as any)?.download_enabled && (updated as any)?.distribution_allowed),
>>>>>>> 7456423 (feat: panel admin muestra TODOS los productos del scanner + import script)
    },
  });
}
