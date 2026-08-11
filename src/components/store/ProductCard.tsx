'use client';

import { Product, useStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Zap, TrendingUp, Award } from 'lucide-react';
import Image from 'next/image';

function getTagIcon(tag: string) {
  switch (tag) {
    case 'popular': return <Zap className="w-2.5 h-2.5" />;
    case 'oferta': return <TrendingUp className="w-2.5 h-2.5" />;
    case 'mas vendido': return <Award className="w-2.5 h-2.5" />;
    case 'mejor margen': return <TrendingUp className="w-2.5 h-2.5" />;
    default: return null;
  }
}

function getTagStyle(tag: string) {
  switch (tag) {
    case 'popular': return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
    case 'oferta': return 'bg-red-500/15 text-red-400 border-red-500/20';
    case 'mas vendido': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
    case 'tendencia': return 'bg-violet-500/15 text-violet-400 border-violet-500/20';
    case 'premium': return 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/20';
    case 'mejor margen': return 'bg-sky-500/15 text-sky-400 border-sky-500/20';
    default: return 'bg-white/5 text-muted-foreground border-white/10';
  }
}

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, setSelectedProduct, setProductDetailOpen } = useStore();
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      className="h-full rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-primary/30 hover:bg-white/[0.05] transition-all duration-300 group cursor-pointer overflow-hidden"
      onClick={() => { setSelectedProduct(product); setProductDetailOpen(true); }}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <div className="aspect-[4/3] w-full relative">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Top gradient overlay */}
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/10">
            -{discount}%
          </div>
        )}

        {/* Featured badge */}
        {product.featured && (
          <div className="absolute top-3 right-3 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-amber-400/30">
            <Star className="w-2.5 h-2.5" /> TOP
          </div>
        )}

        {/* Delivery time */}
        <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-sm text-white text-[9px] font-medium px-2 py-0.5 rounded-md border border-white/10">
          {product.deliveryTime}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col gap-2 sm:gap-2.5">
        <h3 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground line-clamp-2 leading-relaxed hidden sm:block">
          {product.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {product.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className={`text-[8px] sm:text-[9px] px-1.5 py-0 ${getTagStyle(tag)}`}>
              {getTagIcon(tag)}
              <span className="ml-0.5 capitalize">{tag}</span>
            </Badge>
          ))}
        </div>

        {/* Rating & sold */}
        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-muted-foreground">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="font-medium text-foreground">{product.rating}</span>
          <span className="hidden sm:inline">({product.reviews.toLocaleString()})</span>
          <span className="mx-0.5 text-white/10 hidden sm:inline">|</span>
          <Zap className="w-3 h-3 text-emerald-400" />
          <span>{product.sold >= 1000 ? `${(product.sold / 1000).toFixed(0)}K` : product.sold.toLocaleString()}</span>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between mt-auto pt-2 sm:pt-2.5 border-t border-white/[0.04]">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-bold text-foreground">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-[10px] sm:text-[11px] text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
            className="h-7 sm:h-8 gap-1.5 cursor-pointer bg-primary/10 text-primary hover:bg-primary/20 border-0 text-xs font-medium rounded-lg"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
