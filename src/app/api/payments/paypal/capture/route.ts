/**
 * API: CAPTURAR PAGO PAYPAL
 */
import { NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/payments/paypal';

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
