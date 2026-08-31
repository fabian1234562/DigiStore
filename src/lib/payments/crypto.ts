/**
 * CRYPTO PAYMENTS - Sistema de pagos con Bitcoin/Criptomonedas
 * 
 * MODELO SIMPLE (sin procesador de pago crypto):
 * 1. Se genera una dirección BTC (o se usa una fija) + monto exacto
 * 2. Se muestra QR code con la dirección
 * 3. El cliente envía el pago
 * 4. El sistema verifica la transacción vía blockchain API
 * 5. Se entrega el producto
 * 
 * Para producción, se recomienda usar:
 * - BitPay API (bitpay.com)
 * - Coinbase Commerce
 * - NOWPayments
 */

interface CryptoPayment {
  id: string;
  orderId: string;
  crypto: 'BTC' | 'ETH' | 'USDT' | 'USDC';
  address: string;
  amount: number;
  amountUsd: number;
  status: 'pending' | 'confirming' | 'completed' | 'expired';
  txHash?: string;
  createdAt: string;
  expiresAt: string;
}

// Tasas de conversión aproximadas (en producción, usar API en tiempo real)
const CRYPTO_RATES: Record<string, number> = {
  BTC: 65000,  // ~$65,000 USD por BTC
  ETH: 3500,   // ~$3,500 USD por ETH
  USDT: 1,     // 1:1 con USD
  USDC: 1,     // 1:1 con USD
};

// Direcciones de recepción (configurar con las tuyas)
const WALLET_ADDRESSES: Record<string, string> = {
  BTC: process.env.CRYPTO_BTC_ADDRESS || '',
  ETH: process.env.CRYPTO_ETH_ADDRESS || '',
  USDT: process.env.CRYPTO_USDT_ADDRESS || '',
  USDC: process.env.CRYPTO_USDC_ADDRESS || '',
};

// Almacenamiento temporal de pagos crypto
if (!globalThis.cryptoPayments) {
  (globalThis as any).cryptoPayments = {};
}

/** Obtener tasa de crypto en tiempo real */
async function getCryptoRate(crypto: string): Promise<number> {
  try {
    // Usar CoinGecko API (gratuita, sin API key)
    const ids: Record<string, string> = {
      BTC: 'bitcoin', ETH: 'ethereum', USDT: 'tether', USDC: 'usd-coin',
    };
    const id = ids[crypto];
    if (!id) return CRYPTO_RATES[crypto] || 1;

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`,
      { next: { revalidate: 300 } }
    );
    if (response.ok) {
      const data = await response.json();
      const rate = data[id]?.usd;
      if (rate) {
        CRYPTO_RATES[crypto] = rate;
        return rate;
      }
    }
  } catch (e) {
    console.error('[Crypto] Error obteniendo tasa:', e);
  }
  return CRYPTO_RATES[crypto] || 1;
}

/** Crear pago crypto */
export async function createCryptoPayment(params: {
  orderId: string;
  amountUsd: number;
  crypto: 'BTC' | 'ETH' | 'USDT' | 'USDC';
}): Promise<{
  success: boolean;
  payment?: CryptoPayment;
  error?: string;
  message?: string;
}> {
  const address = WALLET_ADDRESSES[params.crypto];
  if (!address) {
    return {
      success: false,
      error: 'crypto_not_configured',
      message: `Dirección de ${params.crypto} no configurada. Agrega CRYPTO_${params.crypto}_ADDRESS a las variables de entorno.`,
    };
  }

  const rate = await getCryptoRate(params.crypto);
  const cryptoAmount = params.amountUsd / rate;

  const payment: CryptoPayment = {
    id: `crypto-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    orderId: params.orderId,
    crypto: params.crypto,
    address,
    amount: Math.round(cryptoAmount * 100000000) / 100000000, // 8 decimales para BTC
    amountUsd: params.amountUsd,
    status: 'pending',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hora para pagar
  };

  // Guardar
  const payments = (globalThis as any).cryptoPayments as Record<string, CryptoPayment>;
  payments[payment.id] = payment;

  return {
    success: true,
    payment: {
      ...payment,
      // Redondear según la crypto
      amount: params.crypto === 'BTC'
        ? Math.round(cryptoAmount * 100000000) / 100000000
        : Math.round(cryptoAmount * 1000000) / 1000000,
    },
  };
}

/** Verificar estado de un pago crypto */
export function getCryptoPaymentStatus(paymentId: string): CryptoPayment | null {
  const payments = (globalThis as any).cryptoPayments as Record<string, CryptoPayment>;
  const payment = payments[paymentId];
  if (!payment) return null;

  // Verificar si expiró
  if (payment.status === 'pending' && new Date(payment.expiresAt) < new Date()) {
    payment.status = 'expired';
    payments[paymentId] = payment;
  }

  return payment;
}

/** Marcar pago como completado (manual o webhook) */
export function completeCryptoPayment(paymentId: string, txHash: string): boolean {
  const payments = (globalThis as any).cryptoPayments as Record<string, CryptoPayment>;
  const payment = payments[paymentId];
  if (!payment) return false;

  payment.status = 'completed';
  payment.txHash = txHash;
  payments[paymentId] = payment;
  return true;
}

/** Obtener tasas actuales */
export async function getCryptoRates(): Promise<Record<string, number>> {
  const rates: Record<string, number> = {};
  for (const crypto of Object.keys(CRYPTO_RATES)) {
    rates[crypto] = await getCryptoRate(crypto);
  }
  return rates;
}

/** Verificar si crypto está configurado */
export function isCryptoConfigured(): boolean {
  return !!(process.env.CRYPTO_BTC_ADDRESS || process.env.CRYPTO_ETH_ADDRESS || process.env.CRYPTO_USDT_ADDRESS);
}

/** Obtener cryptos disponibles */
export function getAvailableCryptos() {
  return Object.entries(WALLET_ADDRESSES)
    .filter(([, addr]) => addr)
    .map(([symbol, address]) => ({
      symbol,
      address,
      name: {
        BTC: 'Bitcoin', ETH: 'Ethereum', USDT: 'Tether (USDT)', USDC: 'USD Coin',
      }[symbol] || symbol,
      icon: {
        BTC: 'bitcoin', ETH: 'ethereum', USDT: 'tether', USDC: 'circle-dollar',
      }[symbol] || 'circle-dollar',
      rate: CRYPTO_RATES[symbol],
    }));
}