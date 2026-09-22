import { NextResponse } from 'next/server';
import { verifyDelivery, recordDownload, getClientIp, getUserAgent } from '@/lib/delivery';
import { readFile } from '@/lib/storage';

/**
 * GET /api/download/[token]/file
 *
 * Sirve el archivo binario REAL asociado al token.
 *
 * Verifica:
 *   1. Token existe
 *   2. No está expirado
 *   3. No está invalidado
 *   4. No se superó el límite de descargas
 *   5. Producto cumple reglas (verified, download_enabled, distribution_allowed)
 *
 * Si todo OK:
 *   - Lee el archivo del storage privado
 *   - Sirve con Content-Disposition: attachment (fuerza descarga)
 *   - Registra la descarga (log + contador)
 *
 * Si falla:
 *   - 404 con JSON explicando el error
 *   - El frontend decide cómo mostrarlo
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  // Verificar token
  const verification = await verifyDelivery(token);

  if (!verification.valid || !verification.delivery) {
    const errorMap: Record<string, { message: string; status: number }> = {
      invalid_token_format: { message: 'Token inválido', status: 400 },
      token_not_found: { message: 'Enlace no encontrado', status: 404 },
      token_invalidated: { message: 'Enlace invalidado', status: 403 },
      token_expired: { message: 'Enlace expirado', status: 410 },
      download_limit_reached: { message: 'Límite de descargas alcanzado', status: 403 },
      product_not_available: { message: 'Producto no disponible', status: 404 },
    };
    const err = errorMap[verification.error || ''] || {
      message: 'Error desconocido',
      status: 500,
    };
    return NextResponse.json(
      { success: false, error: verification.error, message: err.message },
      { status: err.status },
    );
  }

  const delivery = verification.delivery;

  // Leer archivo del storage
  let fileBuffer: Buffer;
  try {
    fileBuffer = await readFile(delivery.storageKey);
  } catch (err) {
    console.error('[download/file] Error reading file:', err);
    return NextResponse.json(
      { success: false, error: 'file_not_found_in_storage' },
      { status: 500 },
    );
  }

  // Registrar la descarga (no bloqueante)
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);
  recordDownload(token, {
    ipAddress,
    userAgent,
    bytesServed: fileBuffer.length,
  }).catch((err) => {
    console.error('[download/file] Error recording download:', err);
  });

  // Servir el archivo con Content-Disposition: attachment
  const safeFileName = delivery.fileName || `digi-store-${delivery.productId}.bin`;

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': delivery.fileType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${safeFileName}"`,
      'Content-Length': String(fileBuffer.length),
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      // X-SHA256 para que el cliente pueda verificar integridad
      'X-Content-SHA256': delivery.sha256 || '',
    },
  });
}
