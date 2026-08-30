import { NextResponse } from 'next/server';
import { createPaymentPreference } from '@/lib/mercadopago';

/**
 * CREAR PAGO - Genera preferencia de MercadoPago
 * 
 * El frontend llama a esta API con los items del carrito.
 * Retorna la URL de MercadoPago para redirigir al cliente.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, email } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 });
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    // Verificar que MercadoPago está configurado
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'payment_not_configured',
        message:
          'La pasarela de pagos aún no está configurada. Necesitas crear una cuenta en https://www.mercadopago.com.co y configurar MERCADOPAGO_ACCESS_TOKEN como variable de entorno.',
        setupUrl: 'https://www.mercadopago.com.co',
      });
    }

    // Generar ID de orden único
    const orderId = `DG-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Guardar la orden pendiente para que el webhook sepa qué entregar
    // En producción esto iría a una base de datos
    const pendingOrder = {
      orderId,
      email,
      items,
      total: items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
    };

    // Guardar en almacenamiento temporal (en producción: base de datos)
    // Usamos globalThis para persistir entre requests en el mismo servidor
    if (!globalThis.pendingOrders) {
      (globalThis as any).pendingOrders = {};
    }
    (globalThis as any).pendingOrders[orderId] = pendingOrder;

    // Crear la preferencia de pago en MercadoPago
    const result = await createPaymentPreference({
      items,
      email,
      orderId,
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: result.message,
      });
    }

    return NextResponse.json({
      success: true,
      orderId,
      paymentUrl: process.env.MERCADOPAGO_MODE === 'sandbox'
        ? result.sandboxInitPoint
        : result.initPoint,
      preferenceId: result.preferenceId,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'server_error',
      message: error.message,
    });
  }
}
