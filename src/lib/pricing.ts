/**
 * SISTEMA DE PRECIOS - MODELO DE REVENTA
 * 
 * MODELO DE NEGOCIO:
 * El proveedor (Reloadly) compra gift cards al por mayor y te las vende
 * CON DESCUENTO debajo del valor facial. Ese descuento es tu ganancia.
 * 
 * EJEMPLO NETFLIX (en COP):
 *   - Valor facial tarjeta Netflix: $15 USD (~$60.000 COP)
 *   - Reloadly te cobra:       $13.20 USD (~$52.800 COP)  [12% descuento]
 *   - Tú vendes al precio de mercado: $14.99 USD (~$59.960 COP)
 *   - TU GANANCIA:                $1.79 USD (~$7.160 COP) por venta
 * 
 * EJEMPLO GOOGLE PLAY $10 (en COP):
 *   - Valor facial:  $10 USD (~$40.000 COP)
 *   - Reloadly te cobra: $9.30 USD (~$37.200 COP)  [7% descuento]
 *   - Tú vendes a:     $9.99 USD (~$39.960 COP)
 *   - TU GANANCIA:      $0.69 USD (~$2.760 COP) por venta
 * 
 * REGLA DE ORO:
 * - NUNCA vender MÁS CARO que el valor facial del producto
 * - El precio de venta = valor facial o ligeramente debajo
 * - La ganancia = valor facial - costo del proveedor
 * - El descuento del proveedor varía por producto (2% a 15%)
 * 
 * CONFIGURACIÓN:
 * - DISCOUNT_FACTOR: qué porcentaje del descuento del proveedor te quedas tú
 *   1.0 = te quedas TODO el descuento (vendes al valor facial exacto)
 *   0.8 = te quedas 80% del descuento (vendes 2% más barato que facial = más competitivo)
 * - MIN_PROFIT_COP: ganancia mínima en pesos colombianos para que valga la pena
 */

// ═══════════════════════════════════════════════════════
// CONFIGURACIÓN DE PRECIOS - AJUSTA AQUÍ
// ═══════════════════════════════════════════════════════

// Tasa de cambio aproximada USD → COP (actualizar periódicamente)
export const USD_TO_COP = 3990;

// Factor de descuento: qué porcentaje del descuento del proveedor te quedas
// 1.0 = vendes al precio facial exacto (máxima ganancia)
// 0.85 = vendes 15% más barato que el facial (más ventas, menos ganancia por unidad)
// 0.9 = equilibrio recomendado: un poco más barato que la competencia
export const DISCOUNT_FACTOR = 0.92;

// Ganancia mínima en COP para vender un producto
// Si el descuento del proveedor no da al menos esta ganancia, no se vende
// $1.000 COP ≈ $0.25 USD
export const MIN_PROFIT_USD = 0.30;

// Redondeo de precios para que se vean "limpios" (ej: $9.99 en vez de $10.12)
// Valores comunes: 0.99, 0.95, 0.90 o 1.00 (sin redondeo psicológico)
export const PRICE_ENDING = 0.99;

// ═══════════════════════════════════════════════════════

/**
 * Calcular precio de venta usando el modelo de reventa.
 * 
 * El precio de venta se calcula así:
 * 1. El proveedor da un precio con descuento (costPrice)
 * 2. El valor facial es lo que vale el producto en el mercado (faceValue)
 * 3. El descuento total = faceValue - costPrice
 * 4. Tú te quedas DISCOUNT_FACTOR de ese descuento
 * 5. El resto se lo pasas al cliente como descuento
 * 6. Precio final = faceValue - (descuento × (1 - DISCOUNT_FACTOR))
 */
export function calculateSellPrice(
  costPrice: number,  // Lo que te cobra el proveedor
  faceValue: number,  // Valor facial (precio de mercado)
  _category?: string
): number {
  const totalDiscount = faceValue - costPrice;
  
  // Si el proveedor te cobra MÁS que el valor facial, no hay ganancia posible
  if (totalDiscount <= 0) {
    return faceValue; // vender al precio facial sin ganancia
  }
  
  // Tú te quedas DISCOUNT_FACTOR del descuento
  const yourDiscount = totalDiscount * DISCOUNT_FACTOR;
  const customerDiscount = totalDiscount * (1 - DISCOUNT_FACTOR);
  
  // Precio de venta = valor facial - lo que le descuentas al cliente
  let sellPrice = faceValue - customerDiscount;
  
  // Aplicar redondeo psicológico
  sellPrice = Math.floor(sellPrice) + PRICE_ENDING;
  if (sellPrice >= faceValue) {
    sellPrice = faceValue; // nunca vender más caro que el facial
  }
  
  // Verificar ganancia mínima
  const profit = sellPrice - costPrice;
  if (profit < MIN_PROFIT_USD) {
    // Si no hay ganancia mínima, vender al facial de todas formas
    // (a veces vale la pena por volumen)
    sellPrice = Math.min(faceValue, Math.floor(faceValue) + PRICE_ENDING);
  }
  
  return Math.round(sellPrice * 100) / 100;
}

/**
 * Calcular la ganancia en USD
 */
export function calculateProfit(sellPrice: number, costPrice: number): number {
  return Math.round((sellPrice - costPrice) * 100) / 100;
}

/**
 * Calcular ganancia en COP
 */
export function calculateProfitCOP(sellPrice: number, costPrice: number): number {
  return Math.round((sellPrice - costPrice) * USD_TO_COP);
}

/**
 * Calcular el margen de ganancia (%)
 */
export function calculateMargin(sellPrice: number, costPrice: number): number {
  if (costPrice <= 0) return 0;
  return Math.round(((sellPrice - costPrice) / costPrice) * 10000) / 100;
}

/**
 * Convertir USD a COP
 */
export function usdToCop(usd: number): number {
  return Math.round(usd * USD_TO_COP);
}

/**
 * Convertir COP a USD
 */
export function copToUsd(cop: number): number {
  return Math.round((cop / USD_TO_COP) * 100) / 100;
}

/**
 * Precio "original" para mostrar el descuento visual
 * Es el valor facial del producto (lo que vale en el mercado)
 */
export function getMarketPrice(faceValue: number): number {
  return faceValue;
}

/**
 * Obtener resumen COMPLETO de pricing para un producto
 * Incluye todo lo que necesitas para tomar decisiones
 */
export function getPricingSummary(costPrice: number, faceValue: number, category?: string) {
  const sellPrice = calculateSellPrice(costPrice, faceValue, category);
  const profit = calculateProfit(sellPrice, costPrice);
  const profitCOP = calculateProfitCOP(sellPrice, costPrice);
  const margin = calculateMargin(sellPrice, costPrice);
  const supplierDiscount = costPrice > 0 
    ? Math.round(((faceValue - costPrice) / faceValue) * 10000) / 100 
    : 0;
  
  return {
    // Del proveedor
    costPrice: Math.round(costPrice * 100) / 100,        // Lo que pagas al proveedor (USD)
    costPriceCOP: usdToCop(costPrice),                     // Lo que pagas al proveedor (COP)
    supplierDiscount,                                      // % descuento del proveedor
    
    // Del mercado
    faceValue,                                             // Valor facial (USD)
    faceValueCOP: usdToCop(faceValue),                     // Valor facial (COP)
    
    // Precio de venta
    sellPrice,                                             // A qué precio vendes (USD)
    sellPriceCOP: usdToCop(sellPrice),                     // A qué precio vendes (COP)
    
    // Ganancia
    profit,                                                // Ganancia por unidad (USD)
    profitCOP,                                             // Ganancia por unidad (COP)
    margin,                                                // % margen de ganancia
    
    // Descuento que le das al cliente
    customerSavings: Math.round((faceValue - sellPrice) * 100) / 100,
    customerSavingsCOP: usdToCop(faceValue - sellPrice),
  };
}

/**
 * Formatear precio USD
 */
export function formatPriceUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatear precio COP
 */
export function formatPriceCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Ejemplos de cómo funciona el sistema (para reference)
 */
export const PRICING_EXAMPLES = [
  {
    product: 'Netflix Gift Card $15',
    faceValue: 15,
    supplierCost: 13.20,
    sellPrice: 14.99,
    profit: 1.79,
    profitCOP: 7160,
    margin: 13.6,
    supplierDiscount: 12.0,
  },
  {
    product: 'Google Play $10',
    faceValue: 10,
    supplierCost: 9.30,
    sellPrice: 9.99,
    profit: 0.69,
    profitCOP: 2760,
    margin: 7.4,
    supplierDiscount: 7.0,
  },
  {
    product: 'Steam Wallet $50',
    faceValue: 50,
    supplierCost: 46.00,
    sellPrice: 49.99,
    profit: 3.99,
    profitCOP: 15960,
    margin: 8.7,
    supplierDiscount: 8.0,
  },
  {
    product: 'PlayStation $25',
    faceValue: 25,
    supplierCost: 23.00,
    sellPrice: 24.99,
    profit: 1.99,
    profitCOP: 7960,
    margin: 8.7,
    supplierDiscount: 8.0,
  },
];
