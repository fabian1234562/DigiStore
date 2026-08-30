import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { items, email, userId } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 });
  }

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  }

  const total = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);

  // La pasarela de pagos aún no está conectada.
  // Los códigos digitales reales se entregarán DESPUÉS del pago real
  // a través de un proveedor autorizado de productos digitales.
  return NextResponse.json({
    success: false,
    error: 'payment_not_configured',
    message: 'La pasarela de pagos aún no está configurada. Próximamente podrás pagar y recibir tus códigos digitales reales.',
    total,
  });
}
