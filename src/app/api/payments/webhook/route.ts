import { NextResponse } from 'next/server';
import { getPaymentStatus } from '@/lib/mercadopago';
import { createHash } from 'crypto';

interface PendingOrder {
  orderId: string;
  email: string;
  items: any[];
  total: number;
  status: string;
  paymentMethod?: string;
  createdAt: string;
}

if (!(globalThis as any).completedOrders) {
  (globalThis as any).completedOrders = {};
}

// In-memory delivery links (token → product info)
if (!(globalThis as any).deliveryLinks) {
  (globalThis as any).deliveryLinks = new Map();
}

const LINK_DURATION_HOURS = 24;
const MAX_DOWNLOADS = 5;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

/**
 * Crea un link de entrega firmado para un producto descargable.
 * El link apunta a /api/delivery/[token] que sirve el archivo.
 */
function createDeliveryLink(
  email: string,
  item: { id: string; name: string; fileName?: string; deliveryFormat?: string },
): { token: string; url: string } {
  const token = createHash('sha256')
    .update(`${item.id}-${email}-${Date.now()}-${Math.random()}`)
    .digest('hex')
    .substring(0, 32);

  const deliveryLinks = (globalThis as any).deliveryLinks as Map<string, any>;
  deliveryLinks.set(token, {
    productId: item.id,
    productName: item.name,
    fileName: item.fileName,
    deliveryFormat: item.deliveryFormat,
    email,
    createdAt: Date.now(),
    expiresAt: Date.now() + LINK_DURATION_HOURS * 60 * 60 * 1000,
    downloads: 0,
    maxDownloads: MAX_DOWNLOADS,
  });

  return { token, url: `${BASE_URL}/api/delivery/${token}` };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.type !== 'payment' || !body.data?.id) {
      return NextResponse.json({ ok: true, message: 'Evento ignorado' });
    }

    const paymentId = String(body.data.id);
    console.log(`[Webhook] Pago recibido: ${paymentId}`);

    let payment: any;
    try {
      payment = await getPaymentStatus(paymentId);
    } catch (err: any) {
      console.error(`[Webhook] Error consultando pago: ${err.message}`);
      return NextResponse.json({ ok: false, error: 'payment_fetch_error' }, { status: 500 });
    }

    if (payment.status !== 'approved') {
      return NextResponse.json({ ok: true, message: `Pago ${payment.status}, no procesado` });
    }

    const externalRef = payment.external_reference;
    const payerEmail = payment.payer?.email || '';
    const pendingOrders = (globalThis as any).pendingOrders as Record<string, PendingOrder>;
    const order = pendingOrders?.[externalRef];

    if (!order) {
      console.error(`[Webhook] Orden no encontrada: ${externalRef}`);
      return NextResponse.json({ ok: true, message: 'Orden no encontrada' });
    }

    const completedOrders = (globalThis as any).completedOrders as Record<string, any>;
    if (completedOrders[externalRef]) {
      return NextResponse.json({ ok: true, message: 'Orden ya procesada' });
    }

    // Procesar todos los items (juegos gratis escaneados o productos propios de hacking)
    const deliveries = [];

    for (const item of order.items) {
      // Detectar tipo de item:
      // - Producto de hacking propio: item.deliveryType === 'download'
      // - Juego gratis escaneado: item.scannedGameData o item._scannedGame
      if (item.deliveryType === 'download' && item.fileName) {
        // PRODUCTO PROPIO DE HACKING — generar link de entrega
        const { token, url } = createDeliveryLink(payerEmail || order.email, item);

        deliveries.push({
          success: true,
          productId: item.id,
          productName: item.name,
          type: 'download',
          typeLabel: 'Producto Digital - Descarga',
          icon: 'Download',
          details: [
            { label: 'Producto', value: item.name },
            { label: 'Formato', value: (item.deliveryFormat || 'pdf').toUpperCase() },
            { label: 'Tipo de entrega', value: 'Archivo descargable' },
            { label: 'Descargas permitidas', value: `${MAX_DOWNLOADS} (válido ${LINK_DURATION_HOURS}h)` },
            { label: 'Tu ganancia', value: `$${item.price.toFixed(2)} USD (100%)` },
          ],
          instructions:
            '1. Haz clic en "Descargar ahora" en el link que te enviamos\n' +
            '2. Guarda el archivo en tu computadora\n' +
            '3. Ábrelo con tu visor de PDF o descomprime el ZIP\n' +
            '4. ¡Listo! Disfruta tu producto',
          downloadUrl: url,
          downloadToken: token,
          expiresAt: new Date(Date.now() + LINK_DURATION_HOURS * 60 * 60 * 1000).toISOString(),
        });
      } else {
        // JUEGO GRATIS ESCANEADO (comportamiento anterior)
        const gameData = item.scannedGameData || item._scannedGame;
        deliveries.push({
          success: true,
          productId: item.id,
          productName: item.name,
          type: 'free-game',
          typeLabel: 'Juego Gratis - Entrega Inmediata',
          icon: 'Gamepad2',
          details: [
            { label: 'Juego', value: item.name },
            { label: 'Plataforma', value: gameData?.platform?.join(', ') || item.platform || 'PC' },
            { label: 'Tipo de entrega', value: gameData?.deliveryType === 'key' ? 'Clave digital' : gameData?.deliveryType === 'drm-free' ? 'DRM-Free' : 'Link de reclamacion' },
            ...(gameData?.claimUrl ? [{ label: 'Link de reclamacion', value: gameData.claimUrl }] : []),
            { label: 'Tu ganancia', value: `$${item.price.toFixed(2)} USD (100%)` },
          ],
          instructions: gameData?.claimInstructions || `1. Ve a la plataforma correspondiente\n2. Crea cuenta si no tienes\n3. Reclama el juego usando el link proporcionado\n4. El juego se agregara a tu biblioteca`,
          claimUrl: gameData?.claimUrl,
        });
      }
    }

    const successfulDeliveries = deliveries.filter((d: any) => d.success);
    const orderResult = {
      orderId: externalRef,
      paymentId,
      total: order.total,
      email: payerEmail || order.email,
      date: new Date().toISOString(),
      paymentMethod: payment.payment_method_id || 'mercadopago',
      paymentStatus: 'approved',
      deliveries,
      success: successfulDeliveries.length > 0,
      message: successfulDeliveries.length > 0
        ? `Pedido completado! ${successfulDeliveries.length} producto(s) entregado(s).`
        : 'No se pudieron entregar los productos.',
    };

    completedOrders[externalRef] = orderResult;
    delete pendingOrders[externalRef];

    console.log(`[Webhook] Orden ${externalRef}: ${successfulDeliveries.length}/${deliveries.length} entregados`);

    // Aquí en producción se enviaría email con los links de entrega.
    // Por ahora el frontend puede consultar /api/payments/webhook?order=ORDER_ID
    // para obtener los links generados.

    return NextResponse.json({ ok: true, processed: true, orderId: externalRef });
  } catch (error: any) {
    console.error(`[Webhook] Error: ${error.message}`);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('order');
  if (!orderId) return NextResponse.json({ error: 'Falta parametro order' }, { status: 400 });
  const completedOrders = (globalThis as any).completedOrders as Record<string, any>;
  const result = completedOrders?.[orderId];
  if (!result) return NextResponse.json({ success: false, status: 'not_found', message: 'Orden no encontrada' });
  return NextResponse.json(result);
}
