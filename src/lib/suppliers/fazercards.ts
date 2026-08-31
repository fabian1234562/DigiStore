/**
 * FAZERCARDS - 10,000+ productos, API moderna
 * 
 * Proveedor con la mayor variedad de productos.
 * Bueno para: gift cards, gaming, suscripciones.
 * 
 * Registro: https://reseller.fazercards.com → Sign Up → obtén API Key
 * Descuentos estimados: 5-15% (volumen)
 */

import { ISupplier, SupplierProduct, OrderResult } from './types';

const FAZER_BASE = 'https://api.fazercards.com/v2';

let cachedToken: { token: string; expiresAt: number } | null = null;

function isConfigured(): boolean {
  return !!(process.env.FAZERCARDS_API_KEY);
}

async function authenticate(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const apiKey = process.env.FAZERCARDS_API_KEY!;
  const res = await fetch(`${FAZER_BASE}/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify({ grant_type: 'client_credentials' }),
  });

  if (!res.ok) throw new Error(`FazerCards auth failed: ${res.status}`);
  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return data.access_token;
}

export const FazerCardsSupplier: ISupplier = {
  id: 'fazercards',
  name: 'FazerCards',
  get enabled() { return isConfigured(); },

  async search(brand: string, faceValue: number, country?: string): Promise<SupplierProduct[]> {
    const token = await authenticate();
    const params = new URLSearchParams({
      q: brand,
      type: 'gift_card',
    });
    if (country) params.set('country', country);

    const res = await fetch(`${FAZER_BASE}/products?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-API-Key': process.env.FAZERCARDS_API_KEY!,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) throw new Error(`FazerCards search failed: ${res.status}`);
    const data = await res.json();
    const items = data.items || data.products || data || [];

    return items
      .filter((p: any) => {
        const fv = p.face_value || p.value || p.denomination || 0;
        return Math.abs(fv - faceValue) < 2;
      })
      .map((p: any) => {
        const fv = p.face_value || p.value || p.denomination || faceValue;
        const cost = p.wholesale_price || p.price || fv;
        return {
          supplierId: 'fazercards',
          supplierProductId: p.id || p.sku,
          name: p.name || p.title || `${brand} $${fv}`,
          brand: p.brand_name || brand,
          faceValue: fv,
          costPrice: cost,
          currency: p.currency || 'USD',
          discountPercent: fv > 0 ? Math.round(((fv - cost) / fv) * 10000) / 100 : 0,
          inStock: p.in_stock !== false,
          deliveryMethod: 'code',
          region: country || p.country_code || 'US',
        };
      });
  },

  async order(params: {
    supplierProductId: any;
    quantity: number;
    email: string;
    customIdentifier?: string;
  }): Promise<OrderResult> {
    const token = await authenticate();

    const res = await fetch(`${FAZER_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-API-Key': process.env.FAZERCARDS_API_KEY!,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        product_id: params.supplierProductId,
        quantity: params.quantity,
        customer_email: params.email,
        reference: params.customIdentifier,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `FazerCards order failed: ${err}` };
    }

    const data = await res.json();
    const code = data.code || data.pin || data.card_code || '';
    return {
      success: !!(code || data.status === 'delivered' || data.status === 'completed'),
      code,
      pin: data.pin,
      transactionId: String(data.order_id || data.id || ''),
      status: data.status,
    };
  },

  async getOrderStatus(transactionId: string): Promise<OrderResult> {
    const token = await authenticate();
    const res = await fetch(`${FAZER_BASE}/orders/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-API-Key': process.env.FAZERCARDS_API_KEY!,
      },
    });
    if (!res.ok) throw new Error(`FazerCards status failed: ${res.status}`);
    const data = await res.json();
    return {
      success: data.status === 'delivered' || data.status === 'completed',
      code: data.code || data.pin,
      transactionId,
      status: data.status,
    };
  },
};
