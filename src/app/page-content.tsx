'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Zap, Shield, Download, Key, Gift, Star, Flame, TrendingUp,
  Gamepad2, Smartphone, CreditCard, Crown, Sparkles, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SharedHeader = dynamic(() => import('@/components/store/SharedHeader').then(m => ({ default: m.SharedHeader })), { ssr: false });

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  subcategory: string;
  image: string;
  badge: string;
  delivery_type: string;
  featured: boolean;
  tags: string[];
}

const CATEGORY_ICONS: Record<string, any> = {
  'Juegos PC': Gamepad2,
  'Juegos Móvil': Smartphone,
  'Fortnite': Flame,
  'Gacha': Sparkles,
  'Skins': Crown,
  'Tarjetas de Regalo': Gift,
  'Suscripciones': CreditCard,
  'Fútbol': TrendingUp,
  'Game Currency': Zap,
};

const CATEGORY_ORDER = [
  'Fortnite', 'Juegos PC', 'Juegos Móvil', 'Gacha', 'Skins',
  'Fútbol', 'Tarjetas de Regalo', 'Suscripciones', 'Game Currency',
];

export default function PageContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/products', {
          headers: { 'x-admin-key': 'digistore-admin-change-this-in-production' },
        });
        const data = await res.json();
        if (data.success && data.products) {
          setProducts(data.products);
        }
      } catch (e) {
        // fallback: productos estáticos
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Agrupar por categoría
  const byCategory: Record<string, Product[]> = {};
  for (const p of products) {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  }

  const featured = products.filter(p => p.featured).slice(0, 8);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-950 to-black text-white">
      <SharedHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-fuchsia-900/20 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.15),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-200 text-xs font-bold mb-6">
            <Zap className="w-3.5 h-3.5" />
            Entrega instantánea · Pagos seguros
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
            Tu tienda de <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">juegos digitales</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto mb-8">
            V-Bucks, Robux, Free Fire, FIFA Points, Steam Cards y más.
            Claves de activación entregadas al instante tras tu compra.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="#productos" className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-violet-500/30">
              <Flame className="w-5 h-5" />
              Ver productos
            </a>
            <Link href="/mis-compras" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold px-6 py-3 rounded-xl transition-all border border-gray-700">
              <Download className="w-5 h-5" />
              Mis compras
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y border-gray-800/50 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Zap, title: 'Entrega instantánea', desc: 'Recibe tu clave al instante' },
              { icon: Shield, title: 'Pago 100% seguro', desc: 'MercadoPago, PayPal, Crypto' },
              { icon: Key, title: 'Claves legítimas', desc: 'Proveedores autorizados' },
              { icon: Star, title: 'Soporte 24/7', desc: 'Atención al cliente' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-violet-300" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{item.title}</p>
                    <p className="text-[10px] text-gray-400">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DESTACADOS */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-2 mb-5">
            <Flame className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-extrabold">🔥 Más vendidos</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* PRODUCTOS POR CATEGORÍA */}
      <div id="productos" className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-gray-400 text-sm">Cargando productos...</p>
          </div>
        ) : (
          CATEGORY_ORDER
            .filter(cat => byCategory[cat] && byCategory[cat].length > 0)
            .map(category => {
              const Icon = CATEGORY_ICONS[category] || Package;
              const items = byCategory[category];
              return (
                <section key={category} className="py-8">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 border border-violet-500/30 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-violet-300" />
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-white">{category}</h2>
                      <p className="text-[11px] text-gray-500">{items.length} productos</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {items.map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
                </section>
              );
            })
        )}
      </div>

      {/* FOOTER */}
      <footer className="border-t border-gray-800/50 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center">
          <p className="text-xs text-gray-500 mb-2">
            © {new Date().getFullYear()} DigiStore — Productos digitales al instante
          </p>
          <div className="flex justify-center gap-4 text-[11px] text-gray-600">
            <Link href="/mis-compras" className="hover:text-violet-400">Mis compras</Link>
            <Link href="/admin/products" className="hover:text-violet-400">Admin</Link>
            <Link href="/juegos-gratis" className="hover:text-violet-400">Juegos gratis</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);
  const discount = product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const isKey = product.delivery_type === 'KEY';

  return (
    <Link href={`/producto/${product.id}`} className="group block">
      <div className="bg-gray-900/60 rounded-xl overflow-hidden border border-gray-800 hover:border-violet-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10">
        {/* Imagen */}
        <div className="relative aspect-[4/3] bg-gray-950 overflow-hidden">
          {!imgError ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-900/40 to-fuchsia-900/40">
              <Gamepad2 className="w-10 h-10 text-gray-700" />
            </div>
          )}
          {/* Badge */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-violet-600/80 text-white backdrop-blur-sm">
              {product.badge}
            </span>
            {discount > 0 && (
              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-600/80 text-white backdrop-blur-sm">
                -{discount}%
              </span>
            )}
          </div>
          {/* Delivery type indicator */}
          <div className="absolute top-2 right-2">
            {isKey ? (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/80 text-white backdrop-blur-sm flex items-center gap-0.5">
                <Key className="w-2.5 h-2.5" /> CLAVE
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-500/80 text-white backdrop-blur-sm flex items-center gap-0.5">
                <Download className="w-2.5 h-2.5" /> ARCHIVO
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-violet-300 transition-colors">
            {product.name}
          </h3>
          <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
            {product.description}
          </p>
          <div className="flex items-end justify-between mt-2">
            <div>
              {product.originalPrice > product.price && (
                <p className="text-[9px] text-gray-600 line-through">${product.originalPrice.toFixed(2)}</p>
              )}
              <p className="text-base font-extrabold text-white">
                ${product.price.toFixed(2)}
                <span className="text-[9px] text-gray-500 ml-0.5 font-normal">USD</span>
              </p>
            </div>
            <span className="text-[9px] text-violet-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              Ver <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Need to import Package for fallback icon
import { Package } from 'lucide-react';
