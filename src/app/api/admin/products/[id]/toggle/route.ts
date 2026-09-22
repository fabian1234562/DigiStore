import { NextResponse } from 'next/server';
import { getProductById, setDownloadEnabled, setDistributionAllowed } from '@/lib/products';

/**
 * POST /api/admin/products/[id]/toggle
 *
 * Cambia los flags de descarga del producto.
 *
 * Body:
 *   { "download_enabled": true/false, "distribution_allowed": true/false }
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
  const body = await request.json();

  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json({ error: 'product_not_found' }, { status: 404 });
  }

  if (typeof body.download_enabled === 'boolean') {
    await setDownloadEnabled(id, body.download_enabled);
  }
  if (typeof body.distribution_allowed === 'boolean') {
    await setDistributionAllowed(id, body.distribution_allowed);
  }

  const updated = await getProductById(id);

  return NextResponse.json({
    success: true,
    product: {
      id: updated?.id,
      name: updated?.name,
      verified: updated?.verified,
      download_enabled: updated?.download_enabled,
      distribution_allowed: updated?.distribution_allowed,
      canBeDownloaded:
        updated?.verified && updated?.download_enabled && updated?.distribution_allowed,
    },
  });
}
