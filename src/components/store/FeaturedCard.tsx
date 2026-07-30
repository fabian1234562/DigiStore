'use client';

import { useStore, Product } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

export function FeaturedCard({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const emojiMap: Record<string, string> = {
    'Fortnite': '🎯', 'Roblox': '🧱', 'Valorant': '🔫', 'Minecraft': '⛏️',
    'Genshin Impact': '⭐', 'Netflix': '🎬', 'Spotify': '🎵', 'Steam': '🎮',
    'Windows': '🪟', 'Microsoft': '📊', 'Xbox': '🟢', 'YouTube': '▶️',
  };

  return (
    <div className="rounded-xl border border-border/50 p-4 hover:border-primary/30 hover:shadow-lg transition-all duration-300 bg-card group">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 group-hover:scale-110 transition-transform bg-muted">
          <img src={product.image} alt={product.platform} className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            {discount > 0 && (
              <Badge className="shrink-0 bg-red-500 text-white text-[10px] h-5">-{discount}%</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{product.platform} · {product.deliveryTime}</p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 cursor-pointer" onClick={() => addToCart(product)}>
              <ShoppingCart className="w-3 h-3" /> Agregar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
