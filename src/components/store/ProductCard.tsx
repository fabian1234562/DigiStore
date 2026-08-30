'use client';

import { Product, useStore } from '@/lib/store';
import { Star, ShoppingCart, Heart, Eye, GitCompare } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

function formatSold(count: number): string {
  if (count >= 1000) {
    const k = count / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return String(count);
}

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const [liked, setLiked] = useState(false);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Image Area */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
            -{discount}%
          </span>
        )}

        {/* Heart / Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors flex items-center justify-center"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              liked ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`}
          />
        </button>

        {/* Hover Overlay — Vista rapida + Comparar */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          <Link
            href={`/tienda/producto/${product.id}`}
            className="bg-white rounded-md px-3 py-1.5 text-xs font-medium text-zinc-900 shadow-sm hover:bg-gray-100 transition-colors flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            Vista rapida
          </Link>
          <button className="bg-white rounded-md px-3 py-1.5 text-xs font-medium text-zinc-900 shadow-sm hover:bg-gray-100 transition-colors flex items-center gap-1">
            <GitCompare className="w-3 h-3" />
            Comparar
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3.5">
        {/* Brand / Platform line */}
        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
          {product.platform} ({product.reviews.toLocaleString()})
        </p>

        {/* Title */}
        <Link href={`/tienda/producto/${product.id}`}>
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 mt-1 hover:text-amber-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating + Sold */}
        <div className="flex items-center gap-1 mt-1.5">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-xs font-semibold">{product.rating}</span>
          <span className="text-[10px] text-gray-400">
            {formatSold(product.sold)} vendidos
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-base font-bold">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
          }}
          className="mt-3 w-full h-10 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}
