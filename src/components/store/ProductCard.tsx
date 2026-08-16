'use client';

import { Product, useStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Zap, TrendingUp, Award, Eye } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
  const { addToCart } = useStore();
  const router = useRouter();
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleClick = () => {
    router.push(`/tienda/producto/${product.id}`);
  };

  return (
    <div
      className="h-full rounded-2xl glass card-glow group cursor-pointer overflow-hidden relative"
      onClick={handleClick}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <div className="aspect-[4/3] w-full relative">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        </div>

        {/* Top gradient */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/10">
            -{discount}%
          </div>
        )}

        {/* Featured badge */}
        {product.featured && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-amber-400/30 shadow-lg shadow-amber-500/20">
            <Star className="w-2.5 h-2.5" /> TOP
          </div>
        )}

        {/* Delivery badge */}
        <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[9px] font-medium px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
          <Zap className="w-2.5 h-2.5 text-emerald-400" />
          {product.deliveryTime}
        </div>

        {/* Hover overlay with view button */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Eye className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col gap-2 sm:gap-2.5">
        <h3 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground/50 line-clamp-2 leading-relaxed hidden sm:block">
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
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-muted-foreground/60">
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-foreground/80">{product.rating}</span>
          </div>
          <span className="text-white/10">|</span>
          <span>{product.reviews.toLocaleString()} resenas</span>
          <span className="text-white/10">|</span>
          <span className="text-emerald-400/80 font-medium">{product.sold >= 1000 ? `${(product.sold / 1000).toFixed(0)}K` : product.sold.toLocaleString()} vendidos</span>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between mt-auto pt-2 sm:pt-2.5 border-t border-white/[0.04]">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-extrabold text-foreground price-tag">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-[10px] sm:text-[11px] text-muted-foreground/40 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
            className="h-8 sm:h-9 gap-1.5 cursor-pointer bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 hover:border-primary text-xs font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Agregar</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
