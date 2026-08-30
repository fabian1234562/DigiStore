/**
 * SISTEMA DE PRECIOS CON MARGEN DE GANANCIA
 * 
 * Cómo funciona:
 * 1. El proveedor (Reloadly) te vende a precio de costo (con descuento incluido)
 * 2. Tú agregas un margen de ganancia (%) encima del costo
 * 3. El precio final se muestra al cliente
 * 
 * Ejemplo:
 *   - Tarjeta Google Play $10 USD
 *   - Reloadly te cobra: $9.50 (5% descuento del proveedor)
 *   - Tu margen: 15%
 *   - Precio al cliente: $9.50 × 1.15 = $10.93 USD
 *   - Tu ganancia: $10.93 - $9.50 = $1.43 USD por venta
 * 
 * CONFIGURACIÓN: Ajusta los márgenes por categoría en MARKUP_BY_CATEGORY
 * Los márgenes están en decimal (0.15 = 15%)
 */

// Margen de ganancia por categoría (ajustable)
// Estos márgenes son COMPETITIVOS pero rentables
export const MARKUP_BY_CATEGORY: Record<string, number> = {
  gaming: 0.18,       // 18% - Gaming tiene buena demanda
  giftcards: 0.12,    // 12% - Gift cards son competitivas, margen bajo pero volumen alto
  streaming: 0.15,    // 15% - Streaming tiene buen volumen
  subscriptions: 0.20, // 20% - Suscripciones premium, mayor margen
  software: 0.22,     // 22% - Software tiene margen más alto
};

// Margen por defecto si la categoría no está listada
const DEFAULT_MARKUP = 0.15; // 15%

// Precio mínimo de venta (para productos muy baratos, redondear hacia arriba)
const MIN_SELL_PRICE = 1.99;

/**
 * Calcular precio de venta basado en el costo del proveedor
 */
export function calculateSellPrice(costPrice: number, category: string): number {
  const markup = MARKUP_BY_CATEGORY[category] || DEFAULT_MARKUP;
  const sellPrice = costPrice * (1 + markup);
  
  // Redondear a 2 decimales
  const rounded = Math.round(sellPrice * 100) / 100;
  
  // Aplicar precio mínimo
  return Math.max(rounded, MIN_SELL_PRICE);
}

/**
 * Calcular la ganancia por producto
 */
export function calculateProfit(sellPrice: number, costPrice: number): number {
  return Math.round((sellPrice - costPrice) * 100) / 100;
}

/**
 * Calcular el margen real (porcentaje)
 */
export function calculateMargin(sellPrice: number, costPrice: number): number {
  if (costPrice <= 0) return 0;
  return Math.round(((sellPrice - costPrice) / costPrice) * 10000) / 100; // 2 decimales
}

/**
 * Calcular precio con descuento (para mostrar "originalPrice")
 * Agrega un precio original ficticio ligeramente más alto para efecto psicológico
 */
export function calculateOriginalPrice(sellPrice: number, category: string): number {
  const originalMarkup = (MARKUP_BY_CATEGORY[category] || DEFAULT_MARKUP) + 0.08; // 8% más
  const original = sellPrice * (1 + 0.08);
  return Math.round(original * 100) / 100;
}

/**
 * Obtener resumen de pricing para un producto
 */
export function getPricingSummary(costPrice: number, category: string) {
  const sellPrice = calculateSellPrice(costPrice, category);
  const profit = calculateProfit(sellPrice, costPrice);
  const margin = calculateMargin(sellPrice, costPrice);
  const originalPrice = calculateOriginalPrice(sellPrice, category);
  
  return {
    costPrice: Math.round(costPrice * 100) / 100,
    sellPrice,
    originalPrice,
    profit,
    margin, // porcentaje
    markup: MARKUP_BY_CATEGORY[category] || DEFAULT_MARKUP,
  };
}

/**
 * Formatear precio para mostrar
 */
export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
