/**
 * API: ESTADO PAGO CRYPTO
 */
import { NextResponse } from 'next/server';
import { getCryptoPaymentStatus, completeCryptoPayment } from '@/lib/payments/crypto';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const paymentId = url.searchParams.get('payment');
  if (!paymentId) return NextResponse.json({ error: 'Falta payment ID' }, { status: 400 });

  const payment = getCryptoPaymentStatus(paymentId);
  if (!payment) return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 });

  return NextResponse.json({ success: true, payment });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentId, txHash } = body;
    if (!paymentId || !txHash) return NextResponse.json({ error: 'Faltan parametros' }, { status: 400 });

    const success = completeCryptoPayment(paymentId, txHash);
    if (success) return NextResponse.json({ success: true, message: 'Pago completado' });
    return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
