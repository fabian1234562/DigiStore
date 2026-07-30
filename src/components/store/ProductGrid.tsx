'use client';

import { useStore, Product } from '@/lib/store';
import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { PackageSearch } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export function ProductGrid() {
  const { selectedCategory, selectedSubcategory, searchQuery, sortBy } = useStore();

  const params = new URLSearchParams();
  if (selectedCategory !== 'all') params.set('category', selectedCategory);
  if (selectedSubcategory !== 'all') params.set('subcategory', selectedSubcategory);
  if (searchQuery) params.set('search', searchQuery);
  if (sortBy) params.set('sort', sortBy);

  const { data, isLoading } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ['products', selectedCategory, selectedSubcategory, searchQuery, sortBy],
    queryFn: () => fetch(`/api/products?${params.toString()}`).then(r => r.json()),
  });

  const products = data?.products ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 p-4 space-y-3">
            <Skeleton className="aspect-[4/3] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
