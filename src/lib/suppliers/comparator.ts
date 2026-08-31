/**
 * MOTOR DE COMPARACIÓN DE PRECIOS
 * 
 * Consulta TODOS los proveedores habilitados al mismo tiempo,
 * compara precios y SIEMPRE elige el más barato.
 * 
 * Ejemplo con Steam $50:
 *   Reloadly:    $46.00 (8% descuento)  → ganancia: $3.99
 *   FoxReload:  $43.50 (13% descuento) → ganancia: $6.49 ← GANADOR
 *   FazerCards: $44.00 (12% descuento) → ganancia: $5.99
 *   Xsolla:     $42.00 (16% descuento) → ganancia: $7.99 ← GANADOR si está disponible
 * 
 * El sistema automáticamente elige Xsolla o FoxReload
 * porque dan más ganancia.
 */

import { ISupplier, SupplierProduct, OrderResult, ProductMapping } from './types';
import { FoxReloadSupplier } from './foxreload';
import { FazerCardsSupplier } from './fazercards';
import { XsollaSupplier } from './xsolla';
import { searchProducts as reloadlySearch, orderGiftCard as reloadlyOrder } from '@/lib/reloadly';

// Todos los proveedores disponibles (orden: prioridad)
const ALL_SUPPLIERS: ISupplier[] = [
  XsollaSupplier,      // 1° - Mejor para gaming (10-20% descuento)
  FoxReloadSupplier,    // 2° - Mejor para gift cards (8-15% descuento)
  FazerCardsSupplier,   // 3° - Mayor variedad (5-15% descuento)
];

// Reloadly como wrapper para integrarlo al mismo sistema
const ReloadlyWrapper: ISupplier = {
  id: 'reloadly',
  name: 'Reloadly',
  get enabled() { return !!(process.env.RELOADLY_CLIENT_ID && process.env.RELOADLY_CLIENT_SECRET); },

  async search(brand: string, faceValue: number, country?: string): Promise<SupplierProduct[]> {
    const products = await reloadlySearch(brand, country || 'US');
    return products
      .filter((p: any) => {
        const fv = p.displayedFaceValue || p.minRecipientDenomination || 0;
        return Math.abs(fv - faceValue) < 2;
      })
      .map((p: any) => {
        const fv = p.displayedFaceValue || p.minRecipientDenomination || faceValue;
        return {
          supplierId: 'reloadly',
          supplierProductId: p.productId,
          name: p.productName || `${brand} $${fv}`,
          brand: p.brand?.brandName || brand,
          faceValue: fv,
          costPrice: p.price,
          currency: p.currencyCode || 'USD',
          discountPercent: p.discountPercentage || 0,
          inStock: true,
          deliveryMethod: 'code',
          region: country || p.country?.isoName || 'US',
        };
      });
  },

  async order(params: { supplierProductId: any; quantity: number; email: string; customIdentifier?: string }): Promise<OrderResult> {
    try {
      const result = await reloadlyOrder({
        productId: params.supplierProductId,
        countryId: 'US',
        currencyCode: 'USD',
        quantity: params.quantity,
        unitPrice: 0, // se ignora, Reloadly usa el precio del producto
        recipientEmail: params.email,
        senderName: 'DigiStore',
        customIdentifier: params.customIdentifier,
      });
      const code = result.code || result.pin || '';
      return {
        success: !!(code || result.status === 'SUCCESS' || result.status === 'SUCCESSFUL'),
        code,
        pin: result.pin,
        transactionId: String(result.transactionId || ''),
        status: result.status,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getOrderStatus(transactionId: string): Promise<OrderResult> {
    try {
      const result = await reloadlyOrder({
        productId: 0,
        countryId: 'US',
        currencyCode: 'USD',
        quantity: 0,
        unitPrice: 0,
        recipientEmail: '',
        senderName: 'DigiStore',
        customIdentifier: transactionId,
      } as any);
      return { success: result.status === 'SUCCESS', transactionId, status: result.status };
    } catch (err: any) {
      return { success: false, error: err.message, transactionId };
    }
  },
};

// Lista completa con Reloadly al final (menor prioridad)
const SUPPLIERS: ISupplier[] = [...ALL_SUPPLIERS, ReloadlyWrapper];

export interface BestPriceResult {
  productId: string;          // ID del producto en DigiStore (ej: gc17)
  brand: string;
  faceValue: number;
  cheapest: SupplierProduct | null;   // El más barato de todos
  allOffers: SupplierProduct[];      // Ofertas de todos los proveedores
  savingsVsReloadly: number;         // Cuánto más ganas vs usar solo Reloadly
  estimatedProfitCOP: number;        // Ganancia estimada en COP
}

/**
 * COMPARAR PRECIOS ENTRE TODOS LOS PROVEEDORES
 * Consulta todos en paralelo y retorna el más barato.
 */
export async function findBestPrice(mapping: ProductMapping): Promise<BestPriceResult> {
  const enabledSuppliers = SUPPLIERS.filter(s => s.enabled);

  if (enabledSuppliers.length === 0) {
    return {
      productId: '',
      brand: mapping.brand,
      faceValue: mapping.faceValue,
      cheapest: null,
      allOffers: [],
      savingsVsReloadly: 0,
      estimatedProfitCOP: 0,
    };
  }

  // Consultar TODOS los proveedores EN PARALELO
  const results = await Promise.allSettled(
    enabledSuppliers.map(async (supplier) => {
      try {
        const products = await supplier.search(mapping.brand, mapping.faceValue, mapping.country);
        return { supplier, products };
      } catch (err: any) {
        console.warn(`[Comparator] ${supplier.name} failed: ${err.message}`);
        return { supplier, products: [] as SupplierProduct[] };
      }
    })
  );

  // Recolectar todas las ofertas
  const allOffers: SupplierProduct[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allOffers.push(...result.value.products);
    }
  }

  // Filtrar solo los que tienen stock
  const available = allOffers.filter(p => p.inStock);

  // Ordenar por precio más barato PRIMERO
  available.sort((a, b) => a.costPrice - b.costPrice);

  // El más barato
  const cheapest = available[0] || null;

  // Calcular ahorro vs Reloadly
  const reloadlyOffer = allOffers.find(p => p.supplierId === 'reloadly');
  let savingsVsReloadly = 0;
  if (cheapest && reloadlyOffer) {
    savingsVsReloadly = Math.round((reloadlyOffer.costPrice - cheapest.costPrice) * 100) / 100;
  }

  // Ganancia estimada en COP (tasa aproximada)
  const USD_TO_COP = 3990;
  const estimatedProfitCOP = cheapest
    ? Math.round((mapping.faceValue - cheapest.costPrice) * USD_TO_COP)
    : 0;

  return {
    productId: '',
    brand: mapping.brand,
    faceValue: mapping.faceValue,
    cheapest,
    allOffers: available,
    savingsVsReloadly,
    estimatedProfitCOP,
  };
}

/**
 * ORDENAR desde el proveedor más barato
 * Si falla el más barato, intenta con el segundo, y así sucesivamente.
 */
export async function orderFromCheapest(params: {
  offers: SupplierProduct[];
  quantity: number;
  email: string;
  customIdentifier: string;
}): Promise<{ result: OrderResult; supplierUsed: string }> {
  // Ya vienen ordenadas de más barato a más caro
  for (const offer of params.offers) {
    const supplier = SUPPLIERS.find(s => s.id === offer.supplierId);
    if (!supplier) continue;

    try {
      console.log(`[Comparator] Ordering ${offer.brand} $${offer.faceValue} from ${supplier.name} at $${offer.costPrice}`);
      const result = await supplier.order({
        supplierProductId: offer.supplierProductId,
        quantity: params.quantity,
        email: params.email,
        customIdentifier: params.customIdentifier,
      });

      if (result.success) {
        return { result, supplierUsed: supplier.name };
      }
      console.warn(`[Comparator] ${supplier.name} failed, trying next...`);
    } catch (err: any) {
      console.warn(`[Comparator] ${supplier.name} error: ${err.message}, trying next...`);
    }
  }

  return {
    result: { success: false, error: 'Todos los proveedores fallaron' },
    supplierUsed: 'none',
  };
}

/**
 * Obtener proveedores habilitados
 */
export function getEnabledSuppliers(): { id: string; name: string }[] {
  return SUPPLIERS.filter(s => s.enabled).map(s => ({ id: s.id, name: s.name }));
}

/**
 * Comparar precios de TODOS los productos mapeados
 * (para ver la ganancia total potencial)
 */
export async function compareAllProducts(): Promise<BestPriceResult[]> {
  const { PRODUCT_MAP } = await import('@/lib/reloadly');
  const results: BestPriceResult[] = [];

  // Agrupar búsquedas por marca para no repetir
  const searches = new Map<string, { brand: string; faceValue: number; country: string; ids: string[] }>();

  for (const [id, mapping] of Object.entries(PRODUCT_MAP)) {
    const key = `${mapping.reloadlyBrand}-${mapping.faceValue}`;
    if (!searches.has(key)) {
      searches.set(key, {
        brand: mapping.reloadlyBrand,
        faceValue: mapping.faceValue,
        country: mapping.countryIso,
        ids: [],
      });
    }
    searches.get(key)!.ids.push(id);
  }

  for (const [key, search] of searches) {
    try {
      const best = await findBestPrice({
        brand: search.brand,
        faceValue: search.faceValue,
        country: search.country,
        category: '',
      });

      for (const id of search.ids) {
        results.push({ ...best, productId: id });
      }
    } catch {
      for (const id of search.ids) {
        results.push({
          productId: id,
          brand: search.brand,
          faceValue: search.faceValue,
          cheapest: null,
          allOffers: [],
          savingsVsReloadly: 0,
          estimatedProfitCOP: 0,
        });
      }
    }
  }

  return results;
}
