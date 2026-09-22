import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * GET /api/cards/[productId]
 *
 * Devuelve la tarjeta de activación PDF de un producto gratis.
 * El cliente hace click en "Reclamar" → se descarga este PDF directamente
 * (con Content-Disposition: attachment para forzar descarga, no abrir en navegador).
 *
 * El PDF contiene:
 *  - QR code con el link directo de descarga del producto
 *  - Instrucciones claras simplificadas
 *  - Link clickable (steam://, https://, etc.)
 *  - Metadata (fecha, producto ID, fuente)
 */

const CARDS_DIR = path.join(process.cwd(), 'public', 'downloads', 'cards');

export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const productId = params.productId;

  // Sanitize: only allow alphanumeric, dash, underscore
  if (!/^[a-zA-Z0-9_-]+$/.test(productId)) {
    return NextResponse.json(
      { error: 'invalid_product_id' },
      { status: 400 }
    );
  }

  const cardPath = path.join(CARDS_DIR, `${productId}.pdf`);

  try {
    const fileBuffer = await fs.readFile(cardPath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="digi-store-${productId}.pdf"`,
        'Content-Length': String(fileBuffer.length),
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: 'card_not_found',
        message: `No se encontró tarjeta para el producto: ${productId}`,
      },
      { status: 404 }
    );
  }
}
