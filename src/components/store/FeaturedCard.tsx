'use client';

import { useStore, Product } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Zap } from 'lucide-react';

export function FeaturedCard({ product }: { product: Product }) {
  const { addToCart, setSelectedProduct, setProductDetailOpen } = useStore();
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      className="relative rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-primary/30 hover:bg-white/[0.05] transition-all duration-300 group cursor-pointer overflow-hidden"
      onClick={() => { setSelectedProduct(product); setProductDetailOpen(true); }}
    >
      {/* Image with gradient overlay */}
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="aspect-[16/10] w-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg shadow-red-500/20">
            -{discount}%
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">{product.platform}</p>
            <h3 className="text-sm font-bold text-white line-clamp-1 mt-0.5">{product.name}</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-white/70 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="font-medium text-white">{product.rating}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 text-[10px] text-emerald-400">
            <Zap className="w-3 h-3" />
            <span className="font-medium">{product.sold.toLocaleString()} vendidos</span>
          </div>
          <span className="text-white/10">|</span>
          <span className="text-[10px] text-muted-foreground">{product.deliveryTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-[10px] text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <Button
            size="sm"
            className="h-8 gap-1 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 border-0 rounded-lg text-xs font-medium shadow-lg shadow-primary/20"
            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
          >
            <ShoppingCart className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
