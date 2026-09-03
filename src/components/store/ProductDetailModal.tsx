'use client';

/**
 * ═══════════════════════════════════════════════════════════════
 * ProductDetailModal — Wrapper que conecta ProductDetail con el store
 * ═══════════════════════════════════════════════════════════════
 *
 * El componente ProductDetail requiere props `product` y `onClose`.
 * Pero tanto el home como la tienda lo usan con setSelectedProduct
 * y setProductDetailOpen del store. Este wrapper hace de puente:
 * lee del store y renderiza ProductDetail con las props correctas.
 *
 * Uso: <ProductDetailModal />  (sin props — lee todo del store)
 *
 * Recomendaciones: trae /api/scanner/results?products=true para
 * pasarle allProducts a ProductDetail y que muestre "Productos Similares".
 */

import { useStore, Product } from '@/lib/store';
import { ProductDetail } from './ProductDetail';
import { useEffect, useState } from 'react';

interface GameProduct extends Product {
  // Alias de campos que ProductDetail espera
  [key: string]: any;
}

export function ProductDetailModal() {
  const selectedProduct = useStore(s => s.selectedProduct);
  const productDetailOpen = useStore(s => s.productDetailOpen);
  const setProductDetailOpen = useStore(s => s.setProductDetailOpen);
  const [allProducts, setAllProducts] = useState<GameProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Cuando se abre el modal, cargar productos para recomendaciones
  useEffect(() => {
    if (!productDetailOpen || !selectedProduct) return;
    if (allProducts.length > 0) return; // ya cargados
    setLoadingProducts(true);
    fetch('/api/scanner/results?products=true')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setAllProducts(data.products || data.games || []);
        }
      })
      .catch(err => console.error('[ProductDetailModal] fetch error:', err))
      .finally(() => setLoadingProducts(false));
  }, [productDetailOpen, selectedProduct, allProducts.length]);

  if (!productDetailOpen || !selectedProduct) return null;

  return (
    <ProductDetail
      product={selectedProduct as any}
      onClose={() => setProductDetailOpen(false)}
      allProducts={allProducts}
    />
  );
}

export default ProductDetailModal;
