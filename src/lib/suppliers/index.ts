/**
 * SISTEMA DE MÚLTIPLES PROVEEDORES
 * 
 * Exporta todo lo necesario para que el checkout y webhook
 * siempre usen el proveedor más barato.
 */

export type { ISupplier, SupplierProduct, OrderResult, ProductMapping, SupplierConfig } from './types';
export { FoxReloadSupplier } from './foxreload';
export { FazerCardsSupplier } from './fazercards';
export { XsollaSupplier } from './xsolla';
export { findBestPrice, orderFromCheapest, getEnabledSuppliers, compareAllProducts } from './comparator';
export type { BestPriceResult } from './comparator';