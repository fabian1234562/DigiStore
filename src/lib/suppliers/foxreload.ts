/**
 * FOXRELOAD - Proveedor con mejores descuentos para gaming
 * 
 * Precios "below-market" con descuentos por volumen.
 * Especialmente fuerte en: Steam, PlayStation, Xbox, Nintendo, gaming.
 * 
 * Registro: https://foxreload.com → Sign Up → obtén API Key
 * Docs: https://foxreload.com/en/docs
 * 
 * Descuentos estimados: 8-15% (mejor que Reloadly en gaming)
 */

import { ISupplier, SupplierProduct, OrderResult } from './types';

const FOXRELOAD_BASE = 'https://api.foxreload.com/v1';

interface FoxReloadAuth {
  token: string;
  expiresAt: number;
}

let cachedAuth: FoxReloadAuth | null = null;

function getConfig() {
  return {
    apiKey: process.env.FOXRELOAD_API_KEY || '',
    apiSecret: process.env.FOXRELOAD_API_SECRET || '',
  };
}

function isConfigured(): boolean {
  const { apiKey, apiSecret } = getConfig();
  return !!(apiKey && apiSecret);
}

async function authenticate(): Promise<string> {
  if (cachedAuth && Date.now() < cachedAuth.expiresAt) {
    return cachedAuth.token;
  }

  const { apiKey, apiSecret } = getConfig();
  const res = await fetch(`${FOXRELOAD_BASE}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey, api_secret: apiSecret }),
  });

  if (!res.ok) throw new Error(`FoxReload auth failed: ${res.status}`);
  const data = await res.json();
  cachedAuth = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return data.access_token;
}

export const FoxReloadSupplier: ISupplier = {
  id: 'foxreload',
  name: 'FoxReload',
  get enabled() { return isConfigured(); },

  async search(brand: string, faceValue: number, country?: string): Promise<SupplierProduct[]> {
    const token = await authenticate();
    const params = new URLSearchParams({
      search: brand,
      type: 'gift_card',
    });
    if (country) params.set('region', country);

    const res = await fetch(`${FOXRELOAD_BASE}/products?${params}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    });

    if (!res.ok) throw new Error(`FoxReload search failed: ${res.status}`);
    const data = await res.json();
    const products = data.products || data || [];

    return products
      .filter((p: any) => {
        const fv = p.face_value || p.denomination || p.faceValue || 0;
        return Math.abs(fv - faceValue) < 2;
      })
      .map((p: any) => {
        const fv = p.face_value || p.denomination || p.faceValue || faceValue;
        const cost = p.price || p.wholesale_price || p.cost || fv;
        return {
          supplierId: 'foxreload',
          supplierProductId: p.id || p.product_id,
          name: p.name || p.product_name || `${brand} $${fv}`,
          brand: p.brand || brand,
          faceValue: fv,
          costPrice: cost,
          currency: p.currency || 'USD',
          discountPercent: fv > 0 ? Math.round(((fv - cost) / fv) * 10000) / 100 : 0,
          inStock: p.in_stock !== false && p.stock !== 0,
          deliveryMethod: 'code',
          region: country || p.region || 'US',
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

    const res = await fetch(`${FOXRELOAD_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        product_id: params.supplierProductId,
        quantity: params.quantity,
        customer_email: params.email,
        reference_id: params.customIdentifier,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `FoxReload order failed: ${err}` };
    }

    const data = await res.json();
    const code = data.code || data.pin || data.card_code || '';
    return {
      success: !!(code || data.status === 'completed' || data.status === 'success'),
      code,
      pin: data.pin,
      transactionId: String(data.id || data.transaction_id || ''),
      status: data.status,
    };
  },

  async getOrderStatus(transactionId: string): Promise<OrderResult> {
    const token = await authenticate();
    const res = await fetch(`${FOXRELOAD_BASE}/orders/${transactionId}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`FoxReload status failed: ${res.status}`);
    const data = await res.json();
    return {
      success: data.status === 'completed' || data.status === 'success',
      code: data.code || data.pin,
      transactionId: String(transactionId),
      status: data.status,
    };
  },
};