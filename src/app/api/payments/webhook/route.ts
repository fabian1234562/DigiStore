import { NextResponse } from 'next/server';
import { getPaymentStatus } from '@/lib/mercadopago';
import { PRODUCT_MAP, searchProducts, orderGiftCard } from '@/lib/reloadly';

/**
 * WEBHOOK DE MERCADOPAGO
 * 
 * MercadoPago llama a este endpoint cada vez que un pago cambia de estado.
 * 
 * FLUJO:
 * 1. Recibe notificación de pago aprobado
 * 2. Consulta los detalles del pago a MercadoPago
 * 3. Obtiene la orden pendiente (guardada al crear el pago)
 * 4. Ordena los códigos REALES al proveedor (Reloadly)
 * 5. Almacena los códigos para que el cliente los vea
 * 
 * IMPORTANTE: Este webhook DEBE estar configurado en tu dashboard de MercadoPago:
 * URL: https://tudominio.com/api/payments/webhook
 * Evento: payment
 */

interface PendingOrder {
  orderId: string;
  email: string;
  items: any[];
  total: number;
  status: string;
  createdAt: string;
}

// Almacenamiento temporal de entregas (en producción: base de datos)
if (!globalThis.completedOrders) {
  (globalThis as any).completedOrders = {};
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // MercadoPago envía { type: 'payment', data: { id: 123 } }
    if (body.type !== 'payment' || !body.data?.id) {
      return NextResponse.json({ ok: true, message: 'Evento ignorado' });
    }

    const paymentId = String(body.data.id);
    console.log(`[Webhook] Pago recibido: ${paymentId}`);

    // 1. Consultar detalles del pago a MercadoPago
    let payment: any;
    try {
      payment = await getPaymentStatus(paymentId);
    } catch (err: any) {
      console.error(`[Webhook] Error consultando pago: ${err.message}`);
      return NextResponse.json({ ok: false, error: 'payment_fetch_error' }, { status: 500 });
    }

    const paymentStatus = payment.status;
    const externalRef = payment.external_reference;
    const payerEmail = payment.payer?.email || '';

    console.log(`[Webhook] Estado: ${paymentStatus}, Orden: ${externalRef}, Email: ${payerEmail}`);

    // Solo procesar pagos aprobados
    if (paymentStatus !== 'approved') {
      return NextResponse.json({ ok: true, message: `Pago ${paymentStatus}, no procesado` });
    }

    // 2. Obtener la orden pendiente
    const pendingOrders = (globalThis as any).pendingOrders as Record<string, PendingOrder>;
    const order = pendingOrders?.[externalRef];

    if (!order) {
      console.error(`[Webhook] Orden no encontrada: ${externalRef}`);
      return NextResponse.json({ ok: true, message: 'Orden no encontrada (puede ser duplicada)' });
    }

    // Verificar que no ya fue procesada
    const completedOrders = (globalThis as any).completedOrders as Record<string, any>;
    if (completedOrders[externalRef]) {
      return NextResponse.json({ ok: true, message: 'Orden ya procesada' });
    }

    // 3. Ordenar códigos REALES al proveedor (Reloadly)
    const deliveries = [];

    for (const item of order.items) {
      const mapping = PRODUCT_MAP[item.id];

      if (!mapping) {
        deliveries.push({
          success: false,
          productId: item.id,
          productName: item.name,
          message: 'Producto sin mapeo al proveedor. Contacta soporte.',
        });
        continue;
      }

      try {
        // Buscar producto real en Reloadly
        const products = await searchProducts(mapping.reloadlyBrand, mapping.countryIso);
        const match = products.find((p: any) => {
          const fv = p.displayedFaceValue || p.minRecipientDenomination;
          return Math.abs(fv - mapping.faceValue) < 1;
        });

        if (!match) {
          deliveries.push({
            success: false,
            productId: item.id,
            productName: item.name,
            message: `Producto ${mapping.reloadlyBrand} $${mapping.faceValue} no disponible. Contacta soporte.`,
          });
          continue;
        }

        // Ordenar el código real
        for (let i = 0; i < item.quantity; i++) {
          const realOrder = await orderGiftCard({
            productId: match.productId,
            countryId: mapping.countryIso,
            currencyCode: mapping.currencyCode,
            quantity: 1,
            unitPrice: match.price,
            recipientEmail: payerEmail || order.email,
            senderName: 'DigiStore',
            customIdentifier: `${externalRef}-${item.id}-${i}`,
          });

          const realCode = realOrder.code || realOrder.pin || '';

          if (realOrder.status === 'SUCCESS' || realOrder.status === 'SUCCESSFUL' || realCode) {
            deliveries.push({
              success: true,
              productId: item.id,
              productName: item.name,
              type: 'giftcard',
              typeLabel: 'Tarjeta de Regalo - Código Real',
              icon: 'Ticket',
              details: [
                { label: 'Código de Tarjeta', value: realCode },
                { label: 'Monto', value: `$${mapping.faceValue} USD` },
                { label: 'Plataforma', value: mapping.reloadlyBrand },
                { label: 'Vigencia', value: realOrder.validUntil || 'Sin fecha de expiración' },
                { label: 'Orden Proveedor', value: String(realOrder.transactionId) },
              ],
              instructions: getRedemptionInstructions(mapping.reloadlyBrand, mapping.faceValue),
            });
          } else {
            deliveries.push({
              success: false,
              productId: item.id,
              productName: item.name,
              message: `Error del proveedor: ${realOrder.status}. Pago aprobado pero código falló. Contacta soporte con orden ${externalRef}.`,
            });
          }
        }
      } catch (err: any) {
        deliveries.push({
          success: false,
          productId: item.id,
          productName: item.name,
          message: `Error al obtener código: ${err.message}. Pago aprobado - contacta soporte.`,
        });
      }
    }

    const successfulDeliveries = deliveries.filter((d: any) => d.success);

    // 4. Guardar resultado de la orden
    const orderResult = {
      orderId: externalRef,
      paymentId,
      total: order.total,
      email: payerEmail || order.email,
      date: new Date().toISOString(),
      paymentMethod: payment.payment_method_id || 'mercadopago',
      paymentStatus: paymentStatus,
      deliveries,
      success: successfulDeliveries.length > 0,
      message: successfulDeliveries.length > 0
        ? `¡Pedido completado! ${successfulDeliveries.length} producto(s) entregados con código real.`
        : 'No se pudieron entregar los productos. Contacta soporte.',
    };

    completedOrders[externalRef] = orderResult;

    // Limpiar orden pendiente
    delete pendingOrders[externalRef];

    console.log(`[Webhook] Orden ${externalRef} procesada: ${successfulDeliveries.length}/${deliveries.length} entregados`);

    return NextResponse.json({ ok: true, processed: true, orderId: externalRef });
  } catch (error: any) {
    console.error(`[Webhook] Error: ${error.message}`);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

/**
 * GET - Permite al frontend consultar el resultado de una orden
 * Usa query param ?order=DG-xxxxx
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('order');

  if (!orderId) {
    return NextResponse.json({ error: 'Falta parámetro order' }, { status: 400 });
  }

  const completedOrders = (globalThis as any).completedOrders as Record<string, any>;
  const result = completedOrders?.[orderId];

  if (!result) {
    return NextResponse.json({
      success: false,
      status: 'not_found',
      message: 'Orden no encontrada o aún en proceso',
    });
  }

  return NextResponse.json(result);
}

function getRedemptionInstructions(brand: string, faceValue: number): string {
  const instructions: Record<string, string> = {
    'Google Play': `1. Abre la Play Store en tu dispositivo Android\n2. Toca tu foto de perfil > Pagos y suscripciones > Canjear código\n3. Ingresa el código y el saldo de $${faceValue} se agregará a tu cuenta`,
    'Netflix': `1. Ve a netflix.com/redeem desde tu navegador\n2. Inicia sesión con tu cuenta de Netflix\n3. Ingresa el código y el saldo se aplicará a tu suscripción`,
    'Spotify': `1. Ve a spotify.com/redeem desde tu navegador\n2. Inicia sesión con tu cuenta de Spotify\n3. Ingresa el código y el saldo se agregará a tu cuenta`,
    'PlayStation': `1. Ve a la PlayStation Store desde tu consola o navegador\n2. Ve a tu perfil > Canjear código\n3. Ingresa el código y el saldo se agregará a tu wallet`,
    'Xbox': `1. Ve a microsoft.com/redeem desde tu navegador\n2. Inicia sesión con tu cuenta de Microsoft/Xbox\n3. Ingresa el código y el saldo se agregará a tu cuenta`,
    'Steam': `1. Abre Steam en tu PC\n2. Ve a Juegos > Canjear un producto en Steam\n3. Ingresa el código y el saldo se agregará a tu wallet de Steam`,
    'Nintendo': `1. Ve a nintendo.eshop.com/redeem desde tu navegador\n2. Inicia sesión con tu cuenta de Nintendo\n3. Ingresa el código y el saldo se agregará`,
    'Apple': `1. Abre la App Store en tu dispositivo Apple\n2. Toca tu foto de perfil > Canjear tarjeta de regalo\n3. Ingresa el código y el saldo se agregará a tu Apple ID`,
    'Fortnite': `1. Abre Fortnite en tu dispositivo\n2. Ve a la tienda dentro del juego > Canjear código\n3. Ingresa el código y los V-Bucks se agregarán a tu cuenta`,
    'Roblox': `1. Ve a roblox.com/redeem desde tu navegador\n2. Inicia sesión con tu cuenta de Roblox\n3. Ingresa el código y los Robux se agregarán a tu cuenta`,
    'Disney': `1. Ve a disneyplus.com/redeem desde tu navegador\n2. Inicia sesión con tu cuenta de Disney+\n3. Ingresa el código y el saldo se aplicará`,
    'HBO': `1. Ve a hbomax.com/redeem desde tu navegador\n2. Inicia sesión con tu cuenta\n3. Ingresa el código y se aplicará a tu suscripción`,
    'Discord': `1. Abre Discord > Configuración de Usuario > Inventario de regalos\n2. Haz clic en Canjear Código\n3. Ingresa el código y Nitro se activará`,
    'Amazon': `1. Ve a amazon.com/gc/redeem desde tu navegador\n2. Inicia sesión con tu cuenta de Amazon\n3. Ingresa el código y el saldo se agregará`,
  };
  return instructions[brand] || `1. Ve a la página oficial de ${brand}\n2. Busca la opción de canjear código o agregar saldo\n3. Ingresa el código y el saldo se acreditará en tu cuenta`;
}