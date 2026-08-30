'use client';

import { Product, useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Zap, Heart, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group relative rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-violet-500/20 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300">
      {/* Image */}
      <div
        className="relative aspect-[4/3] overflow-hidden cursor-pointer"
        onClick={() => router.push(`/tienda/producto/${product.id}`)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            -{discount}%
          </div>
        )}
        {/* Hover actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <button
            onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm border cursor-pointer transition-colors ${liked ? 'bg-red-500/90 border-red-400/50 text-white' : 'bg-black/40 border-white/20 text-white hover:bg-black/60'}`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-white' : ''}`} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/tienda/producto/${product.id}`); }}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-black/60 cursor-pointer transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
        {/* Delivery badge */}
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10">
          <Zap className="w-2.5 h-2.5 text-emerald-400" />
          {product.deliveryTime}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* Platform / Brand */}
        <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-semibold">{product.platform} ({product.reviews.toLocaleString()})</p>
        {/* Title */}
        <h3
          className="text-xs sm:text-sm font-semibold leading-snug line-clamp-2 mt-1 cursor-pointer hover:text-violet-400 transition-colors"
          onClick={() => router.push(`/tienda/producto/${product.id}`)}
        >
          {product.name}
        </h3>
        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold">{product.rating}</span>
          </div>
          <span className="text-[10px] text-muted-foreground/40">{product.sold >= 1000 ? `${(product.sold / 1000).toFixed(0)}K` : product.sold} vendidos</span>
        </div>
        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base sm:text-lg font-bold">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground/40 line-through">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
        {/* Add to cart */}
        <Button
          size="sm"
          className="w-full mt-3 h-8 gap-1.5 cursor-pointer bg-violet-600 hover:bg-violet-500 text-white border-0 rounded-lg text-xs font-semibold transition-all duration-300"
          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Agregar al carrito
        </Button>
      </div>
    </div>
  );
}
