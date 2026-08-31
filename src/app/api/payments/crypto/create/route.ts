/**
 * API: CREAR PAGO CRYPTO
 */
import { NextResponse } from 'next/server';
import { createCryptoPayment, isCryptoConfigured, getCryptoRates, getAvailableCryptos } from '@/lib/payments/crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, email, crypto } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Carrito vacio' }, { status: 400 });
    }
    if (!crypto || !['BTC', 'ETH', 'USDT', 'USDC'].includes(crypto)) {
      return NextResponse.json({ error: 'Criptomoneda no valida' }, { status: 400 });
    }
    if (!isCryptoConfigured()) {
      return NextResponse.json({ success: false, error: 'crypto_not_configured', message: 'Crypto no configurado.' });
    }

    const orderId = `DG-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const totalUsd = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    if (!globalThis.pendingOrders) (globalThis as any).pendingOrders = {};
    (globalThis as any).pendingOrders[orderId] = {
      orderId, email, items, total: totalUsd,
      status: 'pending_payment', paymentMethod: 'crypto', crypto,
      createdAt: new Date().toISOString(),
    };

    const result = await createCryptoPayment({ orderId, amountUsd: totalUsd, crypto });
    if (!result.success) return NextResponse.json({ success: false, error: result.error, message: result.message });

    const rates = await getCryptoRates();
    return NextResponse.json({ success: true, orderId, payment: result.payment, rates, availableCryptos: getAvailableCryptos() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ configured: isCryptoConfigured(), available: getAvailableCryptos() });
}
