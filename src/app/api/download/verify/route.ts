import { NextResponse } from 'next/server';
import { verifyDelivery } from '@/lib/delivery';

/**
 * GET /api/download/verify?token=...
 *
 * Verifica un token de descarga SIN servir el archivo.
 * Lo usa la página /download/[token] para mostrar la UI antes
 * de disparar la descarga.
 *
 * Response:
 *   {
 *     "success": true,
 *     "delivery": {
 *       "productName": "...",
 *       "fileName": "...",
 *       "fileType": "...",
 *       "fileSize": 12345,
 *       "version": "1.0.0",
 *       "sha256": "abc...",
 *       "userEmail": "user@email.com",
 *       "expiresAt": "2024-...",
 *       "downloadsCount": 0,
 *       "maxDownloads": 5,
 *       "remaining": 5
 *     }
 *   }
 */

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'missing_token' },
      { status: 400 },
    );
  }

  const verification = await verifyDelivery(token);

  if (!verification.valid || !verification.delivery) {
    return NextResponse.json({
      success: false,
      error: verification.error || 'unknown_error',
    });
  }

  // NO devolver el storageKey ni datos sensibles
  return NextResponse.json({
    success: true,
    delivery: {
      productName: verification.delivery.productName,
      fileName: verification.delivery.fileName,
      fileType: verification.delivery.fileType,
      fileSize: verification.delivery.fileSize,
      version: verification.delivery.version,
      sha256: verification.delivery.sha256,
      userEmail: verification.delivery.userEmail,
      expiresAt: verification.delivery.expiresAt.toISOString(),
      downloadsCount: verification.delivery.downloadsCount,
      maxDownloads: verification.delivery.maxDownloads,
      remaining: verification.delivery.remaining,
    },
  });
}
