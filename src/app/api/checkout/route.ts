import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { items, email } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 });
  }

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  }

  const orderId = `DG-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const total = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);

  // Simulated successful order
  return NextResponse.json({
    success: true,
    orderId,
    total,
    message: '¡Pedido procesado con éxito! Recibirás tus productos digitales en tu email.',
    estimatedDelivery: 'Entrega instantánea a tu correo electrónico',
  });
}
