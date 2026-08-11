'use client';

import { useStore, Product } from '@/lib/store';
import { getProductVisual } from '@/lib/product-visuals';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Zap } from 'lucide-react';

export function FeaturedCard({ product }: { product: Product }) {
  const { addToCart, setSelectedProduct, setProductDetailOpen } = useStore();
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const visual = getProductVisual(product.category, product.platform);

  return (
    <div
      className="relative rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-primary/30 hover:bg-white/[0.05] transition-all duration-300 group cursor-pointer overflow-hidden"
      onClick={() => { setSelectedProduct(product); setProductDetailOpen(true); }}
    >
      {/* Visual */ }
      <div className={`relative overflow-hidden bg-gradient-to-br ${visual.gradient}`} style={{ backgroundImage: visual.bgPattern }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.05] rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />

        <div className="relative aspect-[16/10] w-full flex items-center justify-center">
          <div className="text-center">
            <span className="text-6xl drop-shadow-2xl block mb-2 group-hover:scale-110 transition-transform duration-500">{visual.icon}</span>
            <p className="text-white/60 text-[10px] font-medium uppercase tracking-[0.2em]">{product.platform}</p>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/10">
            -{discount}%
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider">{product.platform}</p>
            <h3 className="text-sm font-bold text-white line-clamp-1 mt-0.5">{product.name}</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="font-medium text-white">{product.rating}</span>
          </div>
        </div>
      </div>

      {/* Content */ }
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
