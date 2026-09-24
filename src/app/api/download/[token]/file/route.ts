import { NextResponse } from 'next/server';
import { verifyDelivery, recordDownload, getClientIp, getUserAgent } from '@/lib/delivery';
import { readFile, isRemoteStorageKey, getRemoteUrl } from '@/lib/storage';

/**
 * GET /api/download/[token]/file
 *
 * Sirve el archivo binario REAL asociado al token.
 *
 * Estrategia:
 *   - Storage local: leer de /public/downloads/private/, servir buffer
 *   - Storage remoto ("remote:https://..."): stream directo desde la URL
 *     (evita cargar archivos grandes en memoria)
 *
 * Para archivos remotos grandes (>50MB), Vercel puede cortar la response.
 * Es mejor usar redirect 302 a la URL original cuando el archivo es muy grande.
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

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
    const err = errorMap[verification.error || ''] || { message: 'Error', status: 500 };
    return NextResponse.json(
      { success: false, error: verification.error, message: err.message },
      { status: err.status },
    );
  }

  const delivery = verification.delivery;

  // Si storage_key es remoto Y el archivo es grande (>50MB),
  // hacer redirect 302 a la URL original (más eficiente en Vercel serverless)
  if (isRemoteStorageKey(delivery.storageKey)) {
    const remoteUrl = getRemoteUrl(delivery.storageKey);
    const fileSize = delivery.fileSize || 0;

    // Para archivos > 50MB, redirigir directamente (Vercel limita response bodies)
    if (fileSize > 50 * 1024 * 1024) {
      // Registrar descarga
      const ipAddress = getClientIp(request);
      const userAgent = getUserAgent(request);
      recordDownload(token, {
        ipAddress,
        userAgent,
        bytesServed: fileSize,
      }).catch((err) => console.error('[download/file] record error:', err));

      // Redirect 302 a la URL remota — el navegador descarga directamente
      return NextResponse.redirect(remoteUrl, 302);
    }

    // Para archivos pequeños/medianos, descargar y servir como attachment
    try {
      const fileBuffer = await readFile(delivery.storageKey);

      // Registrar descarga
      const ipAddress = getClientIp(request);
      const userAgent = getUserAgent(request);
      recordDownload(token, {
        ipAddress,
        userAgent,
        bytesServed: fileBuffer.length,
      }).catch((err) => console.error('[download/file] record error:', err));

      const safeFileName = delivery.fileName || `digi-store-${delivery.productId}.bin`;

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': delivery.fileType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${safeFileName}"`,
          'Content-Length': String(fileBuffer.length),
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'X-Content-SHA256': delivery.sha256 || '',
        },
      });
    } catch (err) {
      console.error('[download/file] Error fetching remote:', err);
      // Fallback: redirigir a la URL remota
      return NextResponse.redirect(remoteUrl, 302);
    }
  }

  // Storage local: leer de /public/downloads/private/
  let fileBuffer: Buffer;
  try {
    fileBuffer = await readFile(delivery.storageKey);
  } catch (err) {
    console.error('[download/file] Error reading local file:', err);
    return NextResponse.json(
      { success: false, error: 'file_not_found_in_storage' },
      { status: 500 },
    );
  }

  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);
  recordDownload(token, {
    ipAddress,
    userAgent,
    bytesServed: fileBuffer.length,
  }).catch((err) => console.error('[download/file] record error:', err));

  const safeFileName = delivery.fileName || `digi-store-${delivery.productId}.bin`;

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': delivery.fileType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${safeFileName}"`,
      'Content-Length': String(fileBuffer.length),
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'X-Content-SHA256': delivery.sha256 || '',
    },
  });
}
