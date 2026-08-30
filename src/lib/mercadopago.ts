/**
 * INTEGRACIÓN MERCADOPAGO - PASARELA DE PAGOS REAL
 * 
 * FLUJO COMPLETO:
 * 1. Cliente agrega productos al carrito
 * 2. Al pagar, se crea una "Preference" en MercadoPago
 * 3. Cliente es redirigido a la página de pago de MercadoPago
 * 4. Cliente paga con tarjeta, PSE, Nequi, Baloto, efectivo, etc.
 * 5. MercadoPago envía un webhook a /api/payments/webhook
 * 6. El webhook confirma el pago → ordena al proveedor → entrega códigos
 * 
 * CONFIGURACIÓN:
 * 1. Crea cuenta en https://www.mercadopago.com.co
 * 2. Ve a Tu Negocio > Configuración > Credenciales
 * 3. Obtén el ACCESS_TOKEN (producción)
 * 4. Configura MERCADOPAGO_ACCESS_TOKEN en variables de entorno
 * 5. Configura el webhook URL: https://tudominio.com/api/payments/webhook
 */

import MercadoPago from 'mercadopago';

let mpClient: MercadoPago | null = null;

function getMercadoPagoClient(): MercadoPago {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error(
      'MERCADOPAGO_ACCESS_TOKEN no está configurado. ' +
      'Crea tu cuenta en https://www.mercadopago.com.co y configura la variable de entorno.'
    );
  }

  if (!mpClient) {
    mpClient = new MercadoPago({
      accessToken,
      options: {
        sandbox: process.env.MERCADOPAGO_MODE === 'sandbox', // true para pruebas
      },
    });
  }

  return mpClient;
}

export interface PaymentItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  platform: string;
}

export interface CreatePaymentResult {
  success: boolean;
  initPoint?: string;      // URL para redirigir al cliente
  sandboxInitPoint?: string; // URL de sandbox
  preferenceId?: string;
  error?: string;
  message?: string;
}

/**
 * Crear preferencia de pago en MercadoPago
 * Retorna la URL de pago para redirigir al cliente
 */
export async function createPaymentPreference(params: {
  items: PaymentItem[];
  email: string;
  orderId: string;
}): Promise<CreatePaymentResult> {
  try {
    const mp = getMercadoPagoClient();

    const total = params.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const preference = await mp.preferences.create({
      items: params.items.map((item) => ({
        id: item.id,
        title: item.name,
        unit_price: Math.round(item.price * 100) / 100,
        quantity: item.quantity,
        currency_id: 'USD',
        category: item.category,
      })),
      payer: {
        email: params.email,
        name: 'Cliente DigiStore',
      },
      back_urls: {
        success: `${baseUrl}/tienda?payment=success&order=${params.orderId}`,
        failure: `${baseUrl}/tienda?payment=failure&order=${params.orderId}`,
        pending: `${baseUrl}/tienda?payment=pending&order=${params.orderId}`,
      },
      auto_return: 'approved',
      external_reference: params.orderId,
      notification_url: `${baseUrl}/api/payments/webhook`,
      statement_descriptor: 'DIGISTORE',
      metadata: {
        orderId: params.orderId,
        email: params.email,
        itemCount: params.items.length,
        total,
      },
    });

    return {
      success: true,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
      preferenceId: preference.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'payment_error',
      message: `Error al crear pago: ${error.message}`,
    };
  }
}

/**
 * Verificar estado de un pago por ID
 */
export async function getPaymentStatus(paymentId: string) {
  try {
    const mp = getMercadoPagoClient();
    const payment = await mp.payments.findById(Number(paymentId));
    return payment;
  } catch (error: any) {
    throw new Error(`Error verificando pago ${paymentId}: ${error.message}`);
  }
}

/**
 * Procesar webhook de MercadoPago
 * Retorna los datos relevantes del pago
 */
export function processWebhookPayload(body: any): {
  action: string;
  paymentId: string;
  externalRef: string;
  status: string;
} | null {
  // MercadoPago envía diferentes tipos de notificaciones
  if (body.type === 'payment') {
    const paymentId = body.data?.id;
    if (!paymentId) return null;

    return {
      action: 'payment',
      paymentId: String(paymentId),
      externalRef: '', // Se obtiene al consultar el pago
      status: '', // Se obtiene al consultar el pago
    };
  }

  return null;
}

export type { MercadoPago };