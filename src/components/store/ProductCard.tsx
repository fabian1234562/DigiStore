'use client';

import { Product, useStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Zap, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';

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

function getPlatformEmoji(platform: string) {
  const map: Record<string, string> = {
    'Fortnite': '🎯', 'Roblox': '🧱', 'Valorant': '🔫', 'Minecraft': '⛏️',
    'League of Legends': '⚔️', 'Genshin Impact': '⭐', 'EA FC 25': '⚽',
    'Netflix': '🎬', 'Spotify': '🎵', 'Disney+': '🏰', 'HBO Max': '📺',
    'Crunchyroll': '🎌', 'Steam': '🎮', 'PlayStation': '🎮', 'Xbox': '🟢',
    'Nintendo': '🔴', 'Google Play': '▶️', 'Apple': '🍎', 'Windows': '🪟',
    'Microsoft': '📊', 'NordVPN': '🔒', 'YouTube': '▶️', 'Discord': '💬',
  };
  return map[platform] || '📦';
}

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, setSelectedProduct, setProductDetailOpen } = useStore();
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -6 }}
    >
      <div
        className="h-full rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-primary/30 hover:bg-white/[0.05] transition-all duration-300 group cursor-pointer overflow-hidden"
        onClick={() => { setSelectedProduct(product); setProductDetailOpen(true); }}
      >
        {/* Image */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white/[0.04] to-white/[0.01]">
          <img
            src={product.image}
            alt={product.name}
            className="aspect-[4/3] w-full object-cover group-hover:scale-108 transition-transform duration-700"
            loading="lazy"
            onError={(e) => { const el = e.currentTarget; el.style.display = 'none'; if (el.nextElementSibling) (el.nextElementSibling as HTMLElement).style.display = 'flex'; }}
          />
          <div className="aspect-[4/3] w-full items-center justify-center text-6xl absolute inset-0 bg-white/[0.02] hidden">
            {getPlatformEmoji(product.platform)}
          </div>
          {/* Gradient overlay on image bottom */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/80 to-transparent" />
          {/* Discount badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg shadow-red-500/20">
              -{discount}%
            </div>
          )}
          {/* Featured badge */}
          {product.featured && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg shadow-amber-500/20">
              <Star className="w-2.5 h-2.5" /> TOP
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-2.5">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className={`text-[9px] px-1.5 py-0 ${getTagStyle(tag)}`}>
                {getTagIcon(tag)}
                <span className="ml-0.5 capitalize">{tag}</span>
              </Badge>
            ))}
          </div>

          {/* Rating & sold */}
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="font-medium text-foreground">{product.rating}</span>
            <span>({product.reviews.toLocaleString()})</span>
            <span className="mx-0.5 text-white/10">|</span>
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>{product.sold.toLocaleString()}</span>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-white/[0.04]">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-foreground">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-[11px] text-muted-foreground line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <Button
              size="sm"
              onClick={(e) => { e.stopPropagation(); addToCart(product); }}
              className="h-8 gap-1.5 cursor-pointer bg-primary/10 text-primary hover:bg-primary/20 border-0 text-xs font-medium rounded-lg"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Agregar</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
