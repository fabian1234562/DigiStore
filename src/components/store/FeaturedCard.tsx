'use client';

import { useStore, Product } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Zap, Eye } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function FeaturedCard({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const router = useRouter();
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      className="relative rounded-2xl glass card-glow group cursor-pointer overflow-hidden"
      onClick={() => { router.push(`/tienda/producto/${product.id}`); }}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <div className="aspect-[16/10] w-full relative">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/10">
            -{discount}%
          </div>
        )}
        {/* Hover view button */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
          <Eye className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider">{product.platform}</p>
            <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 mt-0.5">{product.name}</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-white">{product.rating}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
            <Zap className="w-3 h-3" />
            <span>{product.sold >= 1000 ? `${(product.sold / 1000).toFixed(0)}K` : product.sold.toLocaleString()} vendidos</span>
          </div>
          <span className="text-white/10 hidden sm:inline">|</span>
          <span className="text-[10px] text-muted-foreground/50 hidden sm:inline">{product.deliveryTime}</span>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-extrabold price-tag">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-[10px] text-muted-foreground/40 line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <Button
            size="sm"
            className="h-8 sm:h-9 gap-1 cursor-pointer bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 border-0 rounded-xl text-xs font-semibold shadow-lg shadow-violet-600/20 hover:shadow-violet-500/30 transition-all duration-300"
            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
          >
            <ShoppingCart className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
