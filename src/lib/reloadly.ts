/**
 * Reloadly Gift Card API Integration
 * 
 * Proveedor REAL de productos digitales.
 * Registro gratis en: https://www.reloadly.com
 * Docs: https://developers.reloadly.com/gift-cards/introduction
 * 
 * FLUJO:
 * 1. Creas cuenta en reloadly.com (gratis)
 * 2. Obtienes CLIENT_ID y CLIENT_SECRET del dashboard
 * 3. Los pones como variables de entorno (RELOADLY_CLIENT_ID, RELOADLY_CLIENT_SECRET)
 * 4. La API obtiene access token, busca el producto y ordena el código real
 */

const RELOADLY_BASE = 'https://giftcards.reloadly.com';
const AUTH_BASE = 'https://auth.reloadly.com';

let cachedToken: { token: string; expiresAt: number } | null = null;

interface ReloadlyToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface ReloadlyProduct {
  productId: number;
  productName: string;
  brand: {
    brandId: number;
    brandName: string;
    logoUrl: string;
  };
  country: {
    isoName: string;
    name: string;
  };
  denominationType: string;
  minRecipientDenomination: number;
  maxRecipientDenomination: number;
  senderFee: number;
  discountPercentage: number;
  displayedFaceValue: number;
  price: number;
  currencyCode: string;
}

interface ReloadlyOrderRequest {
  productId: number;
  countryId: string;
  currencyCode: string;
  quantity: number;
  unitPrice: number;
  customIdentifier?: string;
  senderName: string;
  recipientEmail?: string;
  recipientPhone?: string;
}

interface ReloadlyOrderResponse {
  transactionId: number;
  referenceId: string;
  status: string;
  productId: number;
  productName: string;
  countryName: string;
  quantity: number;
  unitPrice: number;
  totalFee: number;
  discount: number;
  currencyCode: string;
  code?: string;
  pin?: string;
  validUntil?: string;
}

/**
 * Obtener access token de Reloadly usando OAuth2
 */
async function getAccessToken(): Promise<string> {
  const clientId = process.env.RELOADLY_CLIENT_ID;
  const clientSecret = process.env.RELOADLY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'RELOADLY_CLIENT_ID y RELOADLY_CLIENT_SECRET no están configurados. ' +
      'Regístrate en https://www.reloadly.com y configura las variables de entorno.'
    );
  }

  // Reutilizar token cacheado
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${AUTH_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    next: { revalidate: 0 } as any,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error autenticando con Reloadly: ${res.status} - ${err}`);
  }

  const data: ReloadlyToken = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000, // renovar 60s antes
  };

  return data.access_token;
}

/**
 * Buscar productos por nombre de marca en Reloadly
 */
export async function searchProducts(brandName: string, countryIso?: string): Promise<ReloadlyProduct[]> {
  const token = await getAccessToken();
  const params = new URLSearchParams();
  if (brandName) params.set('brandName', brandName);
  if (countryIso) params.set('countryIso', countryIso);

  const res = await fetch(`${RELOADLY_BASE}/v1/products?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/com.reloadly.giftcards.v1+json',
    },
    next: { revalidate: 0 } as any,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error buscando productos: ${res.status} - ${err}`);
  }

  const data = await res.json();
  return data.content || data || [];
}

/**
 * Obtener un producto específico por ID de Reloadly
 */
export async function getProduct(productId: number): Promise<ReloadlyProduct> {
  const token = await getAccessToken();

  const res = await fetch(`${RELOADLY_BASE}/v1/products/${productId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/com.reloadly.giftcards.v1+json',
    },
    next: { revalidate: 0 } as any,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error obteniendo producto ${productId}: ${res.status} - ${err}`);
  }

  return await res.json();
}

/**
 * Ordenar una gift card REAL de Reloadly
 * Retorna el código real que el cliente puede canjear
 */
export async function orderGiftCard(order: {
  productId: number;
  countryId: string;
  currencyCode: string;
  quantity: number;
  unitPrice: number;
  recipientEmail: string;
  senderName?: string;
  customIdentifier?: string;
}): Promise<ReloadlyOrderResponse> {
  const token = await getAccessToken();

  const body: ReloadlyOrderRequest = {
    productId: order.productId,
    countryId: order.countryId,
    currencyCode: order.currencyCode,
    quantity: order.quantity,
    unitPrice: order.unitPrice,
    recipientEmail: order.recipientEmail,
    senderName: order.senderName || 'DigiStore',
    customIdentifier: order.customIdentifier || `DG-${Date.now()}`,
  };

  const res = await fetch(`${RELOADLY_BASE}/v1/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/com.reloadly.giftcards.v1+json',
    },
    body: JSON.stringify(body),
    next: { revalidate: 0 } as any,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error ordenando gift card: ${res.status} - ${err}`);
  }

  return await res.json();
}

/**
 * Verificar el estado de una orden
 */
export async function getOrderStatus(transactionId: number): Promise<ReloadlyOrderResponse> {
  const token = await getAccessToken();

  const res = await fetch(`${RELOADLY_BASE}/v1/orders/transactions/${transactionId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/com.reloadly.giftcards.v1+json',
    },
    next: { revalidate: 0 } as any,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error verificando orden ${transactionId}: ${res.status} - ${err}`);
  }

  return await res.json();
}

/**
 * Mapeo de productos de DigiStore a marcas de Reloadly
 * 
 * IMPORTANTE: Los productId son de PRUEBA.
 * Una vez tengas tu cuenta Reloadly, usa searchProducts() 
 * para encontrar los IDs reales de cada producto.
 * 
 * Ejemplo: await searchProducts('Google Play', 'CO') para buscar Google Play en Colombia
 */
export const PRODUCT_MAP: Record<string, {
  reloadlyBrand: string;
  countryIso: string;
  currencyCode: string;
  faceValue: number;
}> = {
  // ── GIFT CARDS ──
  gc17: { reloadlyBrand: 'Google Play', countryIso: 'US', currencyCode: 'USD', faceValue: 10 },
  gc18: { reloadlyBrand: 'Google Play', countryIso: 'US', currencyCode: 'USD', faceValue: 25 },
  gc19: { reloadlyBrand: 'Google Play', countryIso: 'US', currencyCode: 'USD', faceValue: 50 },
  gc1:  { reloadlyBrand: 'PlayStation', countryIso: 'US', currencyCode: 'USD', faceValue: 10 },
  gc2:  { reloadlyBrand: 'PlayStation', countryIso: 'US', currencyCode: 'USD', faceValue: 25 },
  gc3:  { reloadlyBrand: 'PlayStation', countryIso: 'US', currencyCode: 'USD', faceValue: 50 },
  gc4:  { reloadlyBrand: 'PlayStation', countryIso: 'US', currencyCode: 'USD', faceValue: 100 },
  gc5:  { reloadlyBrand: 'Xbox', countryIso: 'US', currencyCode: 'USD', faceValue: 15 },
  gc6:  { reloadlyBrand: 'Xbox', countryIso: 'US', currencyCode: 'USD', faceValue: 25 },
  gc7:  { reloadlyBrand: 'Xbox', countryIso: 'US', currencyCode: 'USD', faceValue: 50 },
  gc8:  { reloadlyBrand: 'Xbox', countryIso: 'US', currencyCode: 'USD', faceValue: 100 },
  gc9:  { reloadlyBrand: 'Nintendo', countryIso: 'US', currencyCode: 'USD', faceValue: 10 },
  gc10: { reloadlyBrand: 'Nintendo', countryIso: 'US', currencyCode: 'USD', faceValue: 20 },
  gc11: { reloadlyBrand: 'Nintendo', countryIso: 'US', currencyCode: 'USD', faceValue: 35 },
  gc12: { reloadlyBrand: 'Nintendo', countryIso: 'US', currencyCode: 'USD', faceValue: 50 },
  gc13: { reloadlyBrand: 'Steam', countryIso: 'US', currencyCode: 'USD', faceValue: 10 },
  gc14: { reloadlyBrand: 'Steam', countryIso: 'US', currencyCode: 'USD', faceValue: 20 },
  gc15: { reloadlyBrand: 'Steam', countryIso: 'US', currencyCode: 'USD', faceValue: 50 },
  gc16: { reloadlyBrand: 'Steam', countryIso: 'US', currencyCode: 'USD', faceValue: 100 },
  gc20: { reloadlyBrand: 'Apple', countryIso: 'US', currencyCode: 'USD', faceValue: 15 },
  gc21: { reloadlyBrand: 'Apple', countryIso: 'US', currencyCode: 'USD', faceValue: 25 },
  gc22: { reloadlyBrand: 'Apple', countryIso: 'US', currencyCode: 'USD', faceValue: 50 },
  gc23: { reloadlyBrand: 'Epic Games', countryIso: 'US', currencyCode: 'USD', faceValue: 10 },
  gc24: { reloadlyBrand: 'Epic Games', countryIso: 'US', currencyCode: 'USD', faceValue: 25 },

  // ── STREAMING ──
  s1:  { reloadlyBrand: 'Netflix', countryIso: 'US', currencyCode: 'USD', faceValue: 15 },
  s2:  { reloadlyBrand: 'Netflix', countryIso: 'US', currencyCode: 'USD', faceValue: 25 },
  s3:  { reloadlyBrand: 'Netflix', countryIso: 'US', currencyCode: 'USD', faceValue: 30 },
  s4:  { reloadlyBrand: 'Netflix', countryIso: 'US', currencyCode: 'USD', faceValue: 50 },
  s5:  { reloadlyBrand: 'Netflix', countryIso: 'US', currencyCode: 'USD', faceValue: 60 },
  s6:  { reloadlyBrand: 'Netflix', countryIso: 'US', currencyCode: 'USD', faceValue: 100 },
  s7:  { reloadlyBrand: 'Spotify', countryIso: 'US', currencyCode: 'USD', faceValue: 10 },
  s8:  { reloadlyBrand: 'Spotify', countryIso: 'US', currencyCode: 'USD', faceValue: 30 },
  s9:  { reloadlyBrand: 'Spotify', countryIso: 'US', currencyCode: 'USD', faceValue: 60 },
  s10: { reloadlyBrand: 'Disney', countryIso: 'US', currencyCode: 'USD', faceValue: 20 },
  s11: { reloadlyBrand: 'Disney', countryIso: 'US', currencyCode: 'USD', faceValue: 50 },
  s12: { reloadlyBrand: 'Disney', countryIso: 'US', currencyCode: 'USD', faceValue: 100 },
  s13: { reloadlyBrand: 'HBO', countryIso: 'US', currencyCode: 'USD', faceValue: 15 },
  s14: { reloadlyBrand: 'HBO', countryIso: 'US', currencyCode: 'USD', faceValue: 30 },
  s15: { reloadlyBrand: 'HBO', countryIso: 'US', currencyCode: 'USD', faceValue: 50 },
  s16: { reloadlyBrand: 'Hulu', countryIso: 'US', currencyCode: 'USD', faceValue: 15 },
  s17: { reloadlyBrand: 'Hulu', countryIso: 'US', currencyCode: 'USD', faceValue: 30 },
  s18: { reloadlyBrand: 'Apple', countryIso: 'US', currencyCode: 'USD', faceValue: 15 },
  s19: { reloadlyBrand: 'Apple', countryIso: 'US', currencyCode: 'USD', faceValue: 25 },
  s20: { reloadlyBrand: 'Apple', countryIso: 'US', currencyCode: 'USD', faceValue: 50 },
  s21: { reloadlyBrand: 'Paramount', countryIso: 'US', currencyCode: 'USD', faceValue: 20 },
  s22: { reloadlyBrand: 'Paramount', countryIso: 'US', currencyCode: 'USD', faceValue: 50 },
  s23: { reloadlyBrand: 'Crunchyroll', countryIso: 'US', currencyCode: 'USD', faceValue: 25 },
  s24: { reloadlyBrand: 'Crunchyroll', countryIso: 'US', currencyCode: 'USD', faceValue: 50 },
  s25: { reloadlyBrand: 'Amazon', countryIso: 'US', currencyCode: 'USD', faceValue: 25 },
  s26: { reloadlyBrand: 'Amazon', countryIso: 'US', currencyCode: 'USD', faceValue: 50 },
  s27: { reloadlyBrand: 'Amazon', countryIso: 'US', currencyCode: 'USD', faceValue: 100 },
  s28: { reloadlyBrand: 'Peacock', countryIso: 'US', currencyCode: 'USD', faceValue: 20 },
  s29: { reloadlyBrand: 'Peacock', countryIso: 'US', currencyCode: 'USD', faceValue: 50 },
  s30: { reloadlyBrand: 'Star+', countryIso: 'CO', currencyCode: 'USD', faceValue: 25 },

  // ── SUBSCRIPTIONS (gift cards) ──
  sub1: { reloadlyBrand: 'Discord', countryIso: 'US', currencyCode: 'USD', faceValue: 10 },
  sub2: { reloadlyBrand: 'Discord', countryIso: 'US', currencyCode: 'USD', faceValue: 30 },
  sub7: { reloadlyBrand: 'Canva', countryIso: 'US', currencyCode: 'USD', faceValue: 30 },
  sub8: { reloadlyBrand: 'Canva', countryIso: 'US', currencyCode: 'USD', faceValue: 120 },
  sub13: { reloadlyBrand: 'Spotify', countryIso: 'US', currencyCode: 'USD', faceValue: 10 },
  sub14: { reloadlyBrand: 'Spotify', countryIso: 'US', currencyCode: 'USD', faceValue: 30 },
  sub19: { reloadlyBrand: 'Canva', countryIso: 'US', currencyCode: 'USD', faceValue: 60 },
  sub20: { reloadlyBrand: 'Discord', countryIso: 'US', currencyCode: 'USD', faceValue: 3 },

  // ── GAMING (gift cards / top-ups disponibles via Reloadly) ──
  g1:  { reloadlyBrand: 'Fortnite', countryIso: 'US', currencyCode: 'USD', faceValue: 10 },
  g2:  { reloadlyBrand: 'Fortnite', countryIso: 'US', currencyCode: 'USD', faceValue: 25 },
  g3:  { reloadlyBrand: 'Fortnite', countryIso: 'US', currencyCode: 'USD', faceValue: 40 },
  g4:  { reloadlyBrand: 'Fortnite', countryIso: 'US', currencyCode: 'USD', faceValue: 100 },
  g5:  { reloadlyBrand: 'Roblox', countryIso: 'US', currencyCode: 'USD', faceValue: 10 },
  g6:  { reloadlyBrand: 'Roblox', countryIso: 'US', currencyCode: 'USD', faceValue: 20 },
  g7:  { reloadlyBrand: 'Roblox', countryIso: 'US', currencyCode: 'USD', faceValue: 50 },
  g13: { reloadlyBrand: 'League of Legends', countryIso: 'US', currencyCode: 'USD', faceValue: 10 },
  g14: { reloadlyBrand: 'League of Legends', countryIso: 'US', currencyCode: 'USD', faceValue: 25 },
  g15: { reloadlyBrand: 'Genshin Impact', countryIso: 'US', currencyCode: 'USD', faceValue: 5 },
  g16: { reloadlyBrand: 'Genshin Impact', countryIso: 'US', currencyCode: 'USD', faceValue: 15 },
  g17: { reloadlyBrand: 'Apex Legends', countryIso: 'US', currencyCode: 'USD', faceValue: 10 },
  g18: { reloadlyBrand: 'Apex Legends', countryIso: 'US', currencyCode: 'USD', faceValue: 20 },
  g19: { reloadlyBrand: 'PUBG Mobile', countryIso: 'US', currencyCode: 'USD', faceValue: 10 },
  g20: { reloadlyBrand: 'PUBG Mobile', countryIso: 'US', currencyCode: 'USD', faceValue: 25 },
  g21: { reloadlyBrand: 'Free Fire', countryIso: 'US', currencyCode: 'USD', faceValue: 10 },
  g22: { reloadlyBrand: 'Free Fire', countryIso: 'US', currencyCode: 'USD', faceValue: 50 },
  g23: { reloadlyBrand: 'Clash Royale', countryIso: 'US', currencyCode: 'USD', faceValue: 15 },
  g24: { reloadlyBrand: 'Mobile Legends', countryIso: 'US', currencyCode: 'USD', faceValue: 10 },
  g25: { reloadlyBrand: 'Mobile Legends', countryIso: 'US', currencyCode: 'USD', faceValue: 25 },
  g26: { reloadlyBrand: 'Brawl Stars', countryIso: 'US', currencyCode: 'USD', faceValue: 5 },
  g27: { reloadlyBrand: 'Brawl Stars', countryIso: 'US', currencyCode: 'USD', faceValue: 20 },
  g32: { reloadlyBrand: 'Call of Duty', countryIso: 'US', currencyCode: 'USD', faceValue: 10 },
  g33: { reloadlyBrand: 'Call of Duty', countryIso: 'US', currencyCode: 'USD', faceValue: 25 },
  g37: { reloadlyBrand: 'EA FC', countryIso: 'US', currencyCode: 'USD', faceValue: 20 },
  g38: { reloadlyBrand: 'EA FC', countryIso: 'US', currencyCode: 'USD', faceValue: 50 },
  g39: { reloadlyBrand: 'Clash of Clans', countryIso: 'US', currencyCode: 'USD', faceValue: 15 },
  g40: { reloadlyBrand: 'Clash of Clans', countryIso: 'US', currencyCode: 'USD', faceValue: 50 },
  g43: { reloadlyBrand: 'Overwatch', countryIso: 'US', currencyCode: 'USD', faceValue: 10 },
  g44: { reloadlyBrand: 'Overwatch', countryIso: 'US', currencyCode: 'USD', faceValue: 50 },
  g45: { reloadlyBrand: 'Rocket League', countryIso: 'US', currencyCode: 'USD', faceValue: 10 },
  g46: { reloadlyBrand: 'Rocket League', countryIso: 'US', currencyCode: 'USD', faceValue: 20 },
  g47: { reloadlyBrand: 'Destiny', countryIso: 'US', currencyCode: 'USD', faceValue: 10 },
  g49: { reloadlyBrand: 'Clash Royale', countryIso: 'US', currencyCode: 'USD', faceValue: 50 },
};

export type { ReloadlyProduct, ReloadlyOrderResponse };
