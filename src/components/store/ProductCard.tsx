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
  const savings = product.originalPrice
    ? (product.originalPrice - product.price).toFixed(2)
    : 0;

  return (
    <div className="group relative rounded-lg border border-[#e2e8f0] bg-white overflow-hidden hover:shadow-md transition-shadow">
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
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center bg-white shadow cursor-pointer transition-colors ${liked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-500' : ''}`} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/tienda/producto/${product.id}`); }}
            className="w-8 h-8 rounded-full bg-white shadow text-gray-600 flex items-center justify-center hover:text-teal-600 cursor-pointer transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* Brand / Platform */}
        <p className="text-[10px] text-[#64748b] uppercase tracking-wider font-semibold">
          {product.platform} ({product.reviews.toLocaleString()})
        </p>
        {/* Title */}
        <h3
          className="text-sm font-semibold leading-snug line-clamp-2 mt-1 cursor-pointer text-gray-900 hover:text-teal-600 transition-colors"
          onClick={() => router.push(`/tienda/producto/${product.id}`)}
        >
          {product.name}
        </h3>
        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold text-gray-800">{product.rating}</span>
          </div>
          <span className="text-[10px] text-gray-400">
            {product.sold >= 1000 ? `${(product.sold / 1000).toFixed(0)}K` : product.sold} vendidos
          </span>
        </div>
        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-[#111]">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
          )}
          {discount > 0 && savings && (
            <span className="text-[10px] bg-teal-50 text-teal-700 font-semibold px-1.5 py-0.5 rounded">
              -${savings}
            </span>
          )}
        </div>
        {/* Add to cart */}
        <Button
          size="sm"
          className="w-full mt-3 h-9 gap-1.5 cursor-pointer bg-teal-600 hover:bg-teal-700 text-white border-0 rounded-lg text-xs font-semibold transition-colors"
          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Agregar al carrito
        </Button>
      </div>
    </div>
  );
}
