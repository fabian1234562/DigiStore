import { NextResponse } from 'next/server';
import { getPaymentStatus } from '@/lib/mercadopago';

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

    // Procesar todos los items (juegos gratis escaneados)
    const deliveries = [];

    for (const item of order.items) {
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
        ? `Pedido completado! ${successfulDeliveries.length} juego(s) entregados con instrucciones de reclamo.`
        : 'No se pudieron entregar los productos.',
    };

    completedOrders[externalRef] = orderResult;
    delete pendingOrders[externalRef];

    console.log(`[Webhook] Orden ${externalRef}: ${successfulDeliveries.length}/${deliveries.length} entregados`);

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
