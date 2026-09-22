import { NextResponse } from 'next/server';
import { createDelivery, getClientIp, getUserAgent } from '@/lib/delivery';
import { getProductById, canBeDownloaded } from '@/lib/products';

/**
 * POST /api/download/create
 *
 * Crea una entrega digital: genera token criptográfico y devuelve URL interna.
 *
 * Body:
 *   {
 *     "productId": "abc123",
 *     "email": "user@email.com",
 *     "userId": "optional",
 *     "orderId": "optional - si fue compra",
 *     "expiryHours": 24,  // opcional
 *     "maxDownloads": 5   // opcional
 *   }
 *
 * Response:
 *   {
 *     "success": true,
 *     "downloadUrl": "https://digi-store.../download/abc123...",
 *     "token": "abc123...",
 *     "expiresAt": "2024-..."
 *   }
 *
 * REGLA: Si el producto no cumple las 3 condiciones
 * (verified, download_enabled, distribution_allowed), NO se crea entrega.
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, email, userId, orderId, expiryHours, maxDownloads } = body;

    // Validación de inputs
    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'invalid_product_id' },
        { status: 400 },
      );
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'invalid_email' },
        { status: 400 },
      );
    }

    // Verificar producto existe y es descargable
    const product = await getProductById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'product_not_found' },
        { status: 404 },
      );
    }

    if (!canBeDownloaded(product)) {
      return NextResponse.json(
        {
          success: false,
          error: 'product_not_available_for_download',
          message: 'El producto no está disponible para descarga en este momento.',
          reasons: [
            !product.verified && 'producto_no_verificado',
            !product.download_enabled && 'descarga_deshabilitada',
            !product.distribution_allowed && 'distribucion_no_autorizada',
          ].filter(Boolean),
        },
        { status: 403 },
      );
    }

    // Si el producto NO es gratis, requerir orderId (compra confirmada)
    if (!product.is_free && !orderId) {
      return NextResponse.json(
        {
          success: false,
          error: 'order_required',
          message: 'Este producto requiere una orden de compra confirmada.',
        },
        { status: 403 },
      );
    }

    // Crear entrega
    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);

    const result = await createDelivery({
      productId,
      userEmail: email,
      userId: userId || undefined,
      orderId: orderId || undefined,
      expiryHours,
      maxDownloads,
      ipAddress,
      userAgent,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      downloadUrl: result.downloadUrl,
      token: result.token,
      expiresAt: result.expiresAt.toISOString(),
      maxDownloads: result.maxDownloads,
      product: {
        id: product.id,
        name: product.name,
        version: product.version,
        fileSize: product.file_size,
        fileType: product.file_type,
        sha256: product.sha256,
      },
    });
  } catch (error: any) {
    console.error('[download/create] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'server_error',
        message: error.message,
      },
      { status: 500 },
    );
  }
}
