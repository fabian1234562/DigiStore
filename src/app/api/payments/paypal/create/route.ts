/**
 * API: CREAR PAGO PAYPAL
 */
import { NextResponse } from 'next/server';
import { createPayPalOrder, isPayPalConfigured } from '@/lib/payments/paypal';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, email } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Carrito vacio' }, { status: 400 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalido' }, { status: 400 });
    }
    if (!isPayPalConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'payment_not_configured',
        message: 'PayPal no configurado. Necesitas PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET.',
        setupUrl: 'https://developer.paypal.com',
      });
    }

    const orderId = `DG-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    if (!globalThis.pendingOrders) (globalThis as any).pendingOrders = {};
    (globalThis as any).pendingOrders[orderId] = {
      orderId, email, items,
      total: items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
      status: 'pending_payment', paymentMethod: 'paypal',
      createdAt: new Date().toISOString(),
    };

    const result = await createPayPalOrder({ items, email, orderId, returnUrl: '/tienda?payment=success', cancelUrl: '/tienda?payment=cancelled' });
    if (!result.success) return NextResponse.json({ success: false, error: result.error, message: result.message });

    return NextResponse.json({ success: true, orderId, paypalOrderId: result.orderId, approvalUrl: result.approvalUrl });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
