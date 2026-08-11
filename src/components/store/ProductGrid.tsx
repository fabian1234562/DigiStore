'use client';

import { useStore, PRODUCTS, Product } from '@/lib/store';
import { ProductCard } from './ProductCard';
import { PackageSearch } from 'lucide-react';
import { useMemo } from 'react';

function sortProducts(products: Product[], sortBy: string): Product[] {
  const sorted = [...products];
  switch (sortBy) {
    case 'popular': return sorted.sort((a, b) => b.sold - a.sold);
    case 'rating': return sorted.sort((a, b) => b.rating - a.rating);
    case 'price-asc': return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc': return sorted.sort((a, b) => b.price - a.price);
    default: return sorted;
  }
}

export function ProductGrid() {
  const { selectedCategory, selectedSubcategory, searchQuery, sortBy } = useStore();

  const products = useMemo(() => {
    let filtered = PRODUCTS;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (selectedSubcategory !== 'all') {
      filtered = filtered.filter(p => p.subcategory === selectedSubcategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.platform.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return sortProducts(filtered, sortBy);
  }, [selectedCategory, selectedSubcategory, searchQuery, sortBy]);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <PackageSearch className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">No se encontraron productos</h3>
        <p className="text-sm text-muted-foreground/70 mt-1">Intenta con otra categoría o término de búsqueda</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">{products.length} productos encontrados</p>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
