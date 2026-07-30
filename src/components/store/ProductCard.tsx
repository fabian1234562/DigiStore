'use client';

import { Product, useStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Zap, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';

function getTagIcon(tag: string) {
  switch (tag) {
    case 'popular': return <Zap className="w-3 h-3" />;
    case 'oferta': return <TrendingUp className="w-3 h-3" />;
    case 'mas vendido': return <Award className="w-3 h-3" />;
    case 'mejor margen': return <TrendingUp className="w-3 h-3" />;
    default: return null;
  }
}

function getTagStyle(tag: string) {
  switch (tag) {
    case 'popular': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'oferta': return 'bg-red-100 text-red-700 border-red-200';
    case 'mas vendido': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'tendencia': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'premium': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'mejor margen': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    default: return 'bg-muted text-muted-foreground';
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
  const { addToCart } = useStore();
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="h-full overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 group bg-card">
        <div className="relative overflow-hidden bg-gradient-to-br from-muted/80 to-muted">
          <img
            src={product.image}
            alt={product.name}
            className="aspect-[4/3] w-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => { const el = e.currentTarget; el.style.display = 'none'; if (el.nextElementSibling) (el.nextElementSibling as HTMLElement).style.display = 'flex'; }}
          />
          <div className="aspect-[4/3] w-full items-center justify-center text-6xl absolute inset-0 bg-muted hidden">
            {getPlatformEmoji(product.platform)}
          </div>
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              -{discount}%
            </div>
          )}
          {product.featured && (
            <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
              <Star className="w-3 h-3" /> TOP
            </div>
          )}
        </div>
        <CardContent className="p-4 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {product.description}
          </p>
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className={`text-[10px] px-1.5 py-0 ${getTagStyle(tag)}`}>
                {getTagIcon(tag)}
                <span className="ml-0.5 capitalize">{tag}</span>
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="font-medium text-foreground">{product.rating}</span>
            </div>
            <span>({product.reviews.toLocaleString()})</span>
            <span className="mx-1">·</span>
            <Zap className="w-3 h-3 text-emerald-500" />
            <span>{product.sold.toLocaleString()} vendidos</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>📍 {product.region}</span>
            <span className="mx-1">·</span>
            <span>⚡ {product.deliveryTime}</span>
          </div>
          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => addToCart(product)}
              className="h-8 gap-1.5 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="text-xs">Agregar</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
