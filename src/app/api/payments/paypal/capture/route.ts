/**
 * API: CAPTURAR PAGO PAYPAL
 * Completa el pago de PayPal y entrega los productos
 */
import { NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/payments/paypal';

interface PendingOrder {
  orderId: string;
  email: string;
  items: any[];
  total: number;
  status: string;
  paymentMethod?: string;
  createdAt: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paypalOrderId, orderId } = body;

    if (!paypalOrderId) {
      return NextResponse.json({ error: 'Falta paypalOrderId' }, { status: 400 });
    }

    // Capturar el pago en PayPal
    const result = await capturePayPalOrder(paypalOrderId);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error });
    }

    // Obtener la orden pendiente y entregar productos
    const pendingOrders = (globalThis as any).pendingOrders as Record<string, PendingOrder>;
    const order = orderId ? pendingOrders?.[orderId] : null;

    if (order && orderId) {
      const completedOrders = (globalThis as any).completedOrders || {};
      (globalThis as any).completedOrders = completedOrders;

      const deliveries = order.items.map((item: any) => {
        const gameData = item.scannedGameData || item._scannedGame;
        return {
          success: true,
          productId: item.id,
          productName: item.name,
          type: 'free-game',
          typeLabel: 'Producto Digital - Entrega Inmediata',
          icon: 'Gamepad2',
          details: [
            { label: 'Producto', value: item.name },
            { label: 'Plataforma', value: gameData?.platform?.join(', ') || item.platform || 'PC' },
            { label: 'Tipo de entrega', value: gameData?.deliveryType === 'key' ? 'Clave digital' : 'Link de reclamacion' },
            ...(gameData?.claimUrl ? [{ label: 'Link de reclamacion', value: gameData.claimUrl }] : []),
            { label: 'Precio pagado', value: `$${item.price.toFixed(2)} USD` },
          ],
          instructions: gameData?.claimInstructions || `1. Ve a la plataforma correspondiente\n2. Crea cuenta si no tienes\n3. Reclama el producto usando el link\n4. Se agregara a tu biblioteca`,
          claimUrl: gameData?.claimUrl,
        };
      });

      const orderResult = {
        orderId,
        paymentId: result.transactionId,
        total: order.total,
        email: order.email,
        date: new Date().toISOString(),
        paymentMethod: 'paypal',
        paymentStatus: 'completed',
        deliveries,
        success: deliveries.length > 0,
        message: `Pedido completado! ${deliveries.length} producto(s) entregados.`,
      };

      completedOrders[orderId] = orderResult;
      delete pendingOrders[orderId];

      return NextResponse.json({
        success: true,
        transactionId: result.transactionId,
        message: 'Pago capturado y productos entregados',
      });
    }

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      message: 'Pago capturado exitosamente',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token') as string;
    if (!token) return NextResponse.json({ error: 'Falta token de PayPal' }, { status: 400 });

    const result = await capturePayPalOrder(token);
    if (!result.success) return NextResponse.json({ success: false, error: result.error });

    return NextResponse.json({ success: true, transactionId: result.transactionId, message: 'Pago capturado exitosamente' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
