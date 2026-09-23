import { NextResponse } from 'next/server';
import { createDelivery } from '@/lib/delivery';
import { getProductById, canBeDownloaded } from '@/lib/products';

/**
 * POST /api/admin/products/[id]/download
 *
 * Genera un link de descarga temporal para que el ADMIN
 * pueda probar la descarga del producto sin pasar por el
 * flujo de pago.
 *
 * El link es válido por 24h, hasta 5 descargas.
 * Usa el mismo sistema de delivery que los clientes.
 */

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

  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json({ error: 'product_not_found' }, { status: 404 });
  }

  if (!canBeDownloaded(product)) {
    return NextResponse.json({
      error: 'product_not_downloadable',
      message: 'El producto no tiene archivo asociado o no está verificado.',
    }, { status: 403 });
  }

  // Crear delivery con email del admin
  const result = await createDelivery({
    productId: id,
    userEmail: 'admin@digistore.local',
    userId: 'admin',
    orderId: `ADMIN-TEST-${Date.now()}`,
    expiryHours: 24,
    maxDownloads: 5,
    ipAddress: undefined,
    userAgent: 'admin-panel',
  });

  if (!result.success) {
    return NextResponse.json({
      success: false,
      error: result.error,
    }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    downloadUrl: result.downloadUrl,
    directDownloadUrl: `${result.downloadUrl}/file`.replace('/download/', '/api/download/') + '/file',
    token: result.token,
    expiresAt: result.expiresAt.toISOString(),
    maxDownloads: result.maxDownloads,
    fileName: (product as any).file_name,
    fileSize: (product as any).file_size,
  });
}
