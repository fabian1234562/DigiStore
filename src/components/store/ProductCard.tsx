'use client';

import { Product, useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Heart, Eye, GitCompare } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const [liked, setLiked] = useState(false);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group rounded-lg border border-border/60 bg-card overflow-hidden hover:shadow-md transition-all">
      {/* Image with hover overlay */}
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 cursor-pointer">
        <Link href={`/tienda/producto/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            -{discount}%
          </div>
        )}

        {/* Wishlist heart — always visible on hover */}
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors cursor-pointer"
        >
          <Heart className={`w-4 h-4 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-zinc-500 hover:text-red-400'}`} />
        </button>

        {/* Hover overlay — Quick View + Compare */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Link
            href={`/tienda/producto/${product.id}`}
            className="flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 shadow-sm hover:bg-zinc-100 transition-colors"
          >
            <Eye className="w-3 h-3" /> Vista rapida
          </Link>
          <button className="flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 shadow-sm hover:bg-zinc-100 transition-colors cursor-pointer">
            <GitCompare className="w-3 h-3" /> Comparar
          </button>
        </div>
      </div>

      {/* Content — Z Shop style */}
      <div className="p-3">
        {/* Brand + Sold count */}
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
          <span>{product.platform}</span>
          <span>({product.reviews.toLocaleString()})</span>
        </div>

        {/* Title */}
        <Link href={`/tienda/producto/${product.id}`}>
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 mt-1 hover:text-amber-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating + Sold */}
        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold">{product.rating}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {product.sold >= 1000 ? `${(product.sold / 1000).toFixed(0)}K` : product.sold} vendidos
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-base font-bold">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <ShoppingCart className="w-3.5 h-3.5" /> Agregar al carrito
        </button>
      </div>
    </div>
  );
}
