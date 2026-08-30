import { NextResponse } from 'next/server';
import { PRODUCT_MAP, searchProducts, orderGiftCard } from '@/lib/reloadly';

/**
 * CHECKOUT CON PROVEEDOR REAL (Reloadly)
 *
 * FLUJO:
 * 1. El cliente paga (Stripe/MercadoPago - pendiente)
 * 2. Esta API ordena el código REAL de Reloadly
 * 3. Se entrega el código real al cliente
 *
 * REQUISITO: Variables de entorno configuradas:
 *   RELOADLY_CLIENT_ID=tu_client_id
 *   RELOADLY_CLIENT_SECRET=tu_client_secret
 *
 * Para obtenerlas: https://www.reloadly.com → Dashboard → API Settings
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

    // Verificar que Reloadly está configurado
    if (!process.env.RELOADLY_CLIENT_ID || !process.env.RELOADLY_CLIENT_SECRET) {
      return NextResponse.json({
        success: false,
        error: 'supplier_not_configured',
        message: 'El proveedor de productos aún no está configurado. Necesitas registrar una cuenta gratuita en https://www.reloadly.com y configurar RELOADLY_CLIENT_ID y RELOADLY_CLIENT_SECRET como variables de entorno en tu proyecto Vercel.',
        setupUrl: 'https://www.reloadly.com',
      });
    }

    const orderId = `DG-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const deliveries = [];
    let total = 0;

    for (const item of items) {
      const mapping = PRODUCT_MAP[item.id];
      total += item.price * item.quantity;

      if (!mapping) {
        // Producto sin mapeo a Reloadly - informar al cliente
        deliveries.push({
          success: false,
          productId: item.id,
          productName: item.name,
          message: 'Este producto aún no está disponible para entrega automática. Contacta soporte.',
        });
        continue;
      }

      try {
        // 1. Buscar el producto real en Reloadly
        const products = await searchProducts(mapping.reloadlyBrand, mapping.countryIso);
        
        // Encontrar el producto con el valor facial correcto
        const match = products.find((p) => {
          const fv = p.displayedFaceValue || p.minRecipientDenomination;
          return Math.abs(fv - mapping.faceValue) < 1;
        });

        if (!match) {
          deliveries.push({
            success: false,
            productId: item.id,
            productName: item.name,
            message: `Producto ${mapping.reloadlyBrand} $${mapping.faceValue} no disponible actualmente. Intenta otro monto o contacta soporte.`,
          });
          continue;
        }

        // 2. Ordenar el código REAL de Reloadly
        for (let i = 0; i < item.quantity; i++) {
          const order = await orderGiftCard({
            productId: match.productId,
            countryId: mapping.countryIso,
            currencyCode: mapping.currencyCode,
            quantity: 1,
            unitPrice: match.price,
            recipientEmail: email,
            senderName: 'DigiStore',
            customIdentifier: `${orderId}-${item.id}-${i}`,
          });

          // 3. Extraer el código real entregado por Reloadly
          const realCode = order.code || order.pin || '';

          if (order.status === 'SUCCESS' || order.status === 'SUCCESSFUL' || realCode) {
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
                { label: 'Vigencia', value: order.validUntil || 'Sin fecha de expiración' },
                { label: 'Orden Reloadly', value: String(order.transactionId) },
              ],
              instructions: getRedemptionInstructions(mapping.reloadlyBrand, mapping.faceValue),
            });
          } else {
            deliveries.push({
              success: false,
              productId: item.id,
              productName: item.name,
              message: `Error del proveedor: ${order.status}. Tu pago fue procesado pero el código falló. Contacta soporte con orden ${orderId}.`,
            });
          }
        }
      } catch (err: any) {
        deliveries.push({
          success: false,
          productId: item.id,
          productName: item.name,
          message: `Error al obtener el código: ${err.message}. Tu pago fue procesado - contacta soporte.`,
        });
      }
    }

    const successfulDeliveries = deliveries.filter((d: any) => d.success);
    const failedDeliveries = deliveries.filter((d: any) => !d.success);

    return NextResponse.json({
      success: successfulDeliveries.length > 0,
      orderId,
      total,
      email,
      date: new Date().toISOString(),
      message: successfulDeliveries.length > 0
        ? `¡Pedido procesado! ${successfulDeliveries.length} producto(s) entregados con código real.`
        : 'No se pudieron entregar los productos. Contacta soporte.',
      deliveries,
      deliveryMethods: {
        email: `Códigos reales enviados a ${email} y mostrados abajo`,
        account: 'Los códigos son reales y se pueden canjear directamente en la plataforma correspondiente',
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'server_error',
      message: error.message,
    });
  }
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
