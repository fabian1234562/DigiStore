/**
 * ═══════════════════════════════════════════════════════════════
 * DIGISTORE PRICING — Normaliza TODOS los precios al rango $1-$5
 * ═══════════════════════════════════════════════════════════════
 *
 * Política comercial DigiStore:
 *   - TODOS los productos se venden entre $1.99 y $4.99 USD.
 *   - El "originalPrice" es el precio de referencia (ej: Steam, Epic).
 *   - El "sellPrice" es lo que cobra DigiStore.
 *   - La ganancia es 100% (productos obtenidos gratis / arbitraje).
 *
 * Tiers:
 *   originalPrice >= $50  →  $4.99  (Premium AAA)
 *   originalPrice >= $20  →  $3.99  (AA / Mid)
 *   originalPrice >= $10  →  $2.99  (Indie / Buen precio)
 *   originalPrice >= $5   →  $1.99  (Barato)
 *   originalPrice >= $0   →  $1.00  (Mínimo)
 *
 * Cualquier producto del escáner pasa por acá para garantizar consistencia.
 */

export const MIN_PRICE = 1;
export const MAX_PRICE = 5;
export const PRICE_TIERS = [
  { minOriginal: 50, sellPrice: 5.00, label: 'Premium AAA / IA / Security' },
  { minOriginal: 20, sellPrice: 3.99, label: 'AA / Mid' },
  { minOriginal: 10, sellPrice: 2.99, label: 'Indie / Buen precio' },
  { minOriginal: 5,  sellPrice: 1.99, label: 'Barato' },
  { minOriginal: 0,  sellPrice: 1.00, label: 'Mínimo' },
] as const;

/**
 * Calcula el precio de venta DigiStore basado en el precio original.
 * Garantiza que SIEMPRE cae en el rango [$1.00, $5.00].
 */
export function calcDigiStorePrice(originalPrice: number): number {
  const safe = Number.isFinite(originalPrice) && originalPrice > 0 ? originalPrice : 0;
  for (const tier of PRICE_TIERS) {
    if (safe >= tier.minOriginal) {
      return tier.sellPrice;
    }
  }
  return 1.00;
}

/**
 * Normaliza un producto "suelto" (que viene del escáner) para que
 * tenga price y originalPrice dentro de la política DigiStore.
 */
export function normalizeProductPricing<T extends { price: number; originalPrice?: number }>(
  product: T
): T & { price: number; originalPrice: number; discountPct: number; tierLabel: string } {
  const original = product.originalPrice && product.originalPrice > 0
    ? product.originalPrice
    : product.price;

  // Si ambos son 0 (producto gratis sin referencia), asignamos $9.99 como original
  const refOriginal = original > 0 ? original : 9.99;
  const sellPrice = calcDigiStorePrice(refOriginal);

  const tier = PRICE_TIERS.find(t => refOriginal >= t.minOriginal) || PRICE_TIERS[PRICE_TIERS.length - 1];

  const discountPct = refOriginal > sellPrice
    ? Math.round((1 - sellPrice / refOriginal) * 100)
    : 0;

  return {
    ...product,
    price: sellPrice,
    originalPrice: refOriginal,
    discountPct,
    tierLabel: tier.label,
  };
}

/**
 * Normaliza un array completo de productos.
 */
export function normalizeProductArrayPricing<T extends { price: number; originalPrice?: number }>(
  products: T[]
): (T & { price: number; originalPrice: number; discountPct: number; tierLabel: string })[] {
  return products.map(normalizeProductPricing);
}

/**
 * Verifica si un precio cumple la política.
 */
export function isPriceCompliant(price: number): boolean {
  return price >= MIN_PRICE && price <= MAX_PRICE;
}
