/**
 * INTERFAZ COMÚN DE PROVEEDORES
 * 
 * Todos los proveedores implementan esta misma interfaz.
 * Así el comparador puede consultar todos por igual
 * y siempre elegir el más barato.
 */

export interface SupplierProduct {
  supplierId: string;        // 'reloadly' | 'foxreload' | 'fazercards' | 'xsolla'
  supplierProductId: any;    // ID del producto en el proveedor
  name: string;              // Nombre del producto
  brand: string;             // Marca: 'Netflix', 'Steam', etc.
  faceValue: number;         // Valor facial: 10, 25, 50...
  costPrice: number;         // Lo que te cobra el proveedor (TU costo)
  currency: string;          // USD, EUR, etc.
  discountPercent: number;   // % descuento del proveedor vs valor facial
  inStock: boolean;
  deliveryMethod: 'code' | 'key' | 'topup';
  region?: string;
}

export interface OrderResult {
  success: boolean;
  code?: string;             // El código real entregado
  pin?: string;
  transactionId?: string;
  status?: string;
  error?: string;
  deliveryData?: Record<string, string>;
}

export interface SupplierConfig {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;          // 1 = primera opción, 2 = segunda, etc.
}

/**
 * Todo proveedor DEBE implementar esta interfaz
 */
export interface ISupplier {
  readonly id: string;
  readonly name: string;
  readonly enabled: boolean;

  /** Buscar productos por marca y valor facial */
  search(brand: string, faceValue: number, country?: string): Promise<SupplierProduct[]>;

  /** Ordenar un producto y obtener el código real */
  order(params: {
    supplierProductId: any;
    quantity: number;
    email: string;
    customIdentifier?: string;
  }): Promise<OrderResult>;

  /** Verificar estado de una orden */
  getOrderStatus(transactionId: string): Promise<OrderResult>;
}

/**
 * Mapeo de producto DigiStore → búsqueda en proveedores
 */
export interface ProductMapping {
  brand: string;            // 'Netflix', 'Google Play', 'Steam', etc.
  faceValue: number;         // 10, 15, 25, 50, 100
  country?: string;         // 'US', 'CO', etc.
  category: string;         // 'gaming', 'giftcards', 'streaming', etc.
}