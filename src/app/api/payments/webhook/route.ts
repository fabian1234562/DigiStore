import { NextResponse } from 'next/server';
import { getPaymentStatus } from '@/lib/mercadopago';
import { PRODUCT_MAP } from '@/lib/reloadly';
import { findBestPrice, orderFromCheapest, getEnabledSuppliers } from '@/lib/suppliers';

/**
 * WEBHOOK DE MERCADOPAGO - MÚLTIPLES PROVEEDORES
 * 
 * FLUJO:
 * 1. Recibe notificación de pago aprobado
 * 2. Consulta detalles del pago a MercadoPago
 * 3. Obtiene la orden pendiente
 * 4. Para CADA producto: consulta TODOS los proveedores en paralelo
 * 5. Elige el MÁS BARATO
 * 6. Ordena el código real desde ese proveedor
 * 7. Si falla, intenta con el siguiente más barato (fallback automático)
 * 8. Almacena los códigos para entrega al cliente
 */

interface PendingOrder {
  orderId: string;
  email: string;
  items: any[];
  total: number;
  status: string;
  paymentMethod?: string;
  createdAt: string;
}

if (!globalThis.completedOrders) {
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

    // 1. Consultar pago en MercadoPago
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
    console.log(`[Webhook] Proveedores activos: ${getEnabledSuppliers().map(s => s.name).join(', ') || 'NINGUNO'}`);

    if (paymentStatus !== 'approved') {
      return NextResponse.json({ ok: true, message: `Pago ${paymentStatus}, no procesado` });
    }

    // 2. Obtener orden pendiente
    const pendingOrders = (globalThis as any).pendingOrders as Record<string, PendingOrder>;
    const order = pendingOrders?.[externalRef];

    if (!order) {
      console.error(`[Webhook] Orden no encontrada: ${externalRef}`);
      return NextResponse.json({ ok: true, message: 'Orden no encontrada (puede ser duplicada)' });
    }

    const completedOrders = (globalThis as any).completedOrders as Record<string, any>;
    if (completedOrders[externalRef]) {
      return NextResponse.json({ ok: true, message: 'Orden ya procesada' });
    }

    // 3. Ordenar códigos usando el PROVEEDOR MÁS BARATO
    const deliveries = [];

    for (const item of order.items) {
      // ═══ JUEGOS GRATIS (free-game) ═══
      if (item.id?.startsWith('free-') || item.category === 'Juegos Gratis') {
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
            { label: 'Plataforma', value: gameData?.platform?.join(', ') || 'N/A' },
            { label: 'Tipo de entrega', value: gameData?.deliveryType === 'key' ? 'Clave digital' : gameData?.deliveryType === 'drm-free' ? 'DRM-Free' : 'Link de reclamacion' },
            ...(gameData?.claimUrl ? [{ label: 'Link de reclamacion', value: gameData.claimUrl }] : []),
            { label: 'Tu ganancia', value: `$${item.price.toFixed(2)} USD (100%)` },
          ],
          instructions: gameData?.claimInstructions || `1. Ve a la plataforma correspondiente\n2. Crea cuenta si no tienes\n3. Reclama el juego usando el link proporcionado\n4. El juego se agregara a tu biblioteca`,
          claimUrl: gameData?.claimUrl,
        });
        continue;
      }

      // ═══ GIFT CARDS NORMALES (Reloadly / proveedores) ═══
      const mapping = PRODUCT_MAP[item.id];

      if (!mapping) {
        deliveries.push({
          success: false,
          productId: item.id,
          productName: item.name,
          message: 'Producto sin mapeo a proveedores. Contacta soporte.',
        });
        continue;
      }

      try {
        // CONSULTAR TODOS LOS PROVEEDORES EN PARALELO y elegir el más barato
        const bestPrice = await findBestPrice({
          brand: mapping.reloadlyBrand,
          faceValue: mapping.faceValue,
          country: mapping.countryIso,
          category: item.category || '',
        });

        if (!bestPrice.cheapest) {
          deliveries.push({
            success: false,
            productId: item.id,
            productName: item.name,
            message: `${mapping.reloadlyBrand} $${mapping.faceValue} no disponible en ningún proveedor. Contacta soporte.`,
          });
          continue;
        }

        const cheapest = bestPrice.cheapest;
        console.log(`[Webhook] ${mapping.reloadlyBrand} $${mapping.faceValue}: mejor precio $${cheapest.costPrice} (${cheapest.supplierId}) - ${bestPrice.allOffers.length} ofertas`);

        // Ordenar desde el más barato, con fallback automático al siguiente
        for (let i = 0; i < item.quantity; i++) {
          const { result, supplierUsed } = await orderFromCheapest({
            offers: bestPrice.allOffers,
            quantity: 1,
            email: payerEmail || order.email,
            customIdentifier: `${externalRef}-${item.id}-${i}`,
          });

          if (result.success) {
            const realCode = result.code || result.pin || '';
            deliveries.push({
              success: true,
              productId: item.id,
              productName: item.name,
              type: 'giftcard',
              typeLabel: `Código Real - ${supplierUsed}`,
              icon: 'Ticket',
              details: [
                { label: 'Código de Tarjeta', value: realCode },
                { label: 'Monto', value: `$${mapping.faceValue} USD` },
                { label: 'Plataforma', value: mapping.reloadlyBrand },
                { label: 'Proveedor', value: supplierUsed },
                { label: 'Costo Proveedor', value: `$${cheapest.costPrice} USD` },
                { label: 'Tu Ganancia', value: `$${(mapping.faceValue - cheapest.costPrice).toFixed(2)} USD` },
                { label: 'Vigencia', value: 'Sin fecha de expiración' },
                { label: 'Orden Proveedor', value: result.transactionId || '' },
              ],
              instructions: getRedemptionInstructions(mapping.reloadlyBrand, mapping.faceValue),
            });
          } else {
            deliveries.push({
              success: false,
              productId: item.id,
              productName: item.name,
              message: `Error de proveedor: ${result.error}. Pago aprobado - contacta soporte con orden ${externalRef}.`,
            });
          }
        }
      } catch (err: any) {
        deliveries.push({
          success: false,
          productId: item.id,
          productName: item.name,
          message: `Error al buscar proveedor: ${err.message}. Pago aprobado - contacta soporte.`,
        });
      }
    }

    const successfulDeliveries = deliveries.filter((d: any) => d.success);

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
        ? `¡Pedido completado! ${successfulDeliveries.length} producto(s) entregados con código real (mejor proveedor seleccionado automáticamente).`
        : 'No se pudieron entregar los productos. Contacta soporte.',
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
    'Canva': `1. Ve a canva.com/gift desde tu navegador\n2. Inicia sesión con tu cuenta de Canva\n3. Ingresa el código y el crédito se agregará`,
    'Epic Games': `1. Abre la Epic Games Store\n2. Ve a tu perfil > Canjear código\n3. Ingresa el código y el saldo se agregará`,
    'League of Legends': `1. Abre la tienda de League of Legends\n2. Ve a la sección de códigos\n3. Ingresa el código y los RP se agregarán`,
  };
  return instructions[brand] || `1. Ve a la página oficial de ${brand}\n2. Busca la opción de canjear código o agregar saldo\n3. Ingresa el código y el saldo se acreditará en tu cuenta`;
}