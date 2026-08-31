/**
 * XSOLLA - El mejor para GAMING (10-20% descuento)
 * 
 * Especializado en: V-Bucks, Robux, PUBG UC, game keys,
 * suscripciones de Xbox/PlayStation, top-ups de juegos móviles.
 * 
 * Registro: https://xsolla.com/for/resellers → Apply → obtén Merchant ID + API Key
 * Docs: https://developers.xsolla.com/api
 * 
 * Descuentos estimados: 10-20% en gaming (el mejor de todos para juegos)
 */

import { ISupplier, SupplierProduct, OrderResult } from './types';

const XSOLLA_BASE = 'https://store.xsolla.com/api/v2';

let cachedToken: { token: string; expiresAt: number } | null = null;

function isConfigured(): boolean {
  return !!(process.env.XSOLLA_MERCHANT_ID && process.env.XSOLLA_API_KEY);
}

async function authenticate(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const merchantId = process.env.XSOLLA_MERCHANT_ID!;
  const apiKey = process.env.XSOLLA_API_KEY!;

  const res = await fetch(`${XSOLLA_BASE}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ merchant_id: merchantId, api_key: apiKey }),
  });

  if (!res.ok) throw new Error(`Xsolla auth failed: ${res.status}`);
  const data = await res.json();
  cachedToken = {
    token: data.access_token || data.jwt,
    expiresAt: Date.now() + 3600 * 1000, // Xsolla tokens duran ~1h
  };
  return cachedToken.token;
}

export const XsollaSupplier: ISupplier = {
  id: 'xsolla',
  name: 'Xsolla',
  get enabled() { return isConfigured(); },

  async search(brand: string, faceValue: number, country?: string): Promise<SupplierProduct[]> {
    const token = await authenticate();
    const params = new URLSearchParams({
      locale: 'en',
      currency: 'USD',
    });

    const res = await fetch(`${XSOLLA_BASE}/project/items/virtual_items?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) throw new Error(`Xsolla search failed: ${res.status}`);
    const data = await res.json();
    const items = data.items || [];

    return items
      .filter((p: any) => {
        const name = (p.name?.en || p.name || '').toLowerCase();
        if (!name.includes(brand.toLowerCase()) && !(p.sku || '').toLowerCase().includes(brand.toLowerCase())) return false;
        const price = parseFloat(p.price?.amount || p.wholesale_price?.amount || '0');
        return price > 0 && Math.abs(price - faceValue) < faceValue * 0.5;
      })
      .map((p: any) => {
        const price = parseFloat(p.price?.amount || p.wholesale_price?.amount || '0');
        const fv = p.face_value || faceValue;
        return {
          supplierId: 'xsolla',
          supplierProductId: p.sku || p.id,
          name: p.name?.en || p.name || `${brand} $${fv}`,
          brand: p.brand || brand,
          faceValue: fv,
          costPrice: price,
          currency: p.price?.currency || 'USD',
          discountPercent: fv > 0 ? Math.round(((fv - price) / fv) * 10000) / 100 : 0,
          inStock: p.quantity !== 0,
          deliveryMethod: 'code',
          region: country || 'US',
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

    const res = await fetch(`${XSOLLA_BASE}/order/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sku: params.supplierProductId,
        quantity: params.quantity,
        customer_email: params.email,
        external_ref: params.customIdentifier,
        currency: 'USD',
        country: 'US',
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Xsolla order failed: ${err}` };
    }

    const data = await res.json();
    return {
      success: data.status === 'done' || data.status === 'paid',
      code: data.code || data.pin,
      transactionId: String(data.order_id || data.id || ''),
      status: data.status,
    };
  },

  async getOrderStatus(transactionId: string): Promise<OrderResult> {
    const token = await authenticate();
    const res = await fetch(`${XSOLLA_BASE}/order/${transactionId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Xsolla status failed: ${res.status}`);
    const data = await res.json();
    return {
      success: data.status === 'done' || data.status === 'paid',
      code: data.code || data.pin,
      transactionId,
      status: data.status,
    };
  },
};
