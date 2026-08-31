/**
 * PAYPAL - Integración de pagos
 * 
 * Soporta pagos con PayPal (saldo, tarjeta, etc.)
 * Usa PayPal REST API v2.
 */

const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

interface PayPalAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayPalOrder {
  id: string;
  status: string;
  purchase_units: any[];
  links: any[];
}

/** Obtener access token de PayPal */
async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal no configurado. Necesitas PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET.');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal auth error: ${error}`);
  }

  const data = await response.json() as PayPalAccessToken;
  return data.access_token;
}

/** Crear orden de pago en PayPal */
export async function createPayPalOrder(params: {
  items: { name: string; quantity: number; price: number }[];
  email: string;
  orderId: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<{
  success: boolean;
  orderId?: string;
  approvalUrl?: string;
  error?: string;
  message?: string;
}> {
  try {
    const accessToken = await getAccessToken();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const totalAmount = params.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: params.orderId,
          description: `DigiStore Order ${params.orderId}`,
          amount: {
            currency_code: 'USD',
            value: totalAmount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: totalAmount.toFixed(2),
              },
            },
          },
          items: params.items.map(item => ({
            name: item.name.substring(0, 127),
            unit_amount: {
              currency_code: 'USD',
              value: item.price.toFixed(2),
            },
            quantity: String(item.quantity),
            category: 'DIGITAL_GOODS',
          })),
        }],
        application_context: {
          brand_name: 'DigiStore',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          return_url: `${baseUrl}${params.returnUrl}?orderId=${params.orderId}&paymentMethod=paypal`,
          cancel_url: `${baseUrl}${params.cancelUrl}?orderId=${params.orderId}`,
        },
      }),
    });

    if (!order.ok) {
      const error = await order.text();
      throw new Error(`PayPal order error: ${error}`);
    }

    const orderData = await order.json() as PayPalOrder;
    const approvalLink = orderData.links?.find(l => l.rel === 'approve');

    return {
      success: true,
      orderId: orderData.id,
      approvalUrl: approvalLink?.href,
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'paypal_error',
      message: error.message,
    };
  }
}

/** Capturar pago de PayPal (después de aprobación del usuario) */
export async function capturePayPalOrder(paypalOrderId: string): Promise<{
  success: boolean;
  status?: string;
  transactionId?: string;
  error?: string;
}> {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json() as PayPalOrder;

    if (data.status === 'COMPLETED') {
      return {
        success: true,
        status: 'completed',
        transactionId: data.purchase_units?.[0]?.payments?.captures?.[0]?.id,
      };
    }

    return {
      success: false,
      error: `PayPal status: ${data.status}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/** Verificar si PayPal está configurado */
export function isPayPalConfigured(): boolean {
  return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}
