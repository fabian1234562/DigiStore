"use client";

import { useStore, PRODUCTS, CATEGORIES } from '@/lib/store';
import { CartDrawer } from '@/components/store/CartDrawer';
import { ProductCard } from '@/components/store/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthDialog } from '@/components/auth/AuthDialog';
import {
  ShoppingCart, Search, Zap, Shield, Globe, Clock,
  LogIn, LogOut, ArrowRight, Sparkles, CreditCard, Headphones, BadgeCheck,
  Gamepad2, Tv, Gift, AppWindow, RefreshCw, Flame, Star, Users, TrendingUp,
  Truck, RotateCcw, ChevronLeft, ChevronRight, Heart, Package,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

/* ── Announcement Bar ── */
function AnnouncementBar() {
  return (
    <div className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 text-white text-xs py-2 px-4 text-center font-medium">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
        <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Entrega instantanea por email</span>
        <span className="hidden sm:inline text-white/30">|</span>
        <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Pago 100% seguro</span>
        <span className="hidden sm:inline text-white/30">|</span>
        <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Usa el codigo <span className="font-bold bg-white/20 px-1.5 py-0.5 rounded">DIGI10</span> para 10% de descuento</span>
      </div>
    </div>
  );
}

/* ── Header ── */
function Header() {
  const { cartCount, setCartOpen, user, setUser, searchQuery, setSearchQuery } = useStore();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-background/95 backdrop-blur-xl">
      {/* Top bar */}
      <div className="border-b border-white/[0.04] hidden md:block">
        <div className="max-w-7xl mx-auto px-6 h-8 flex items-center justify-end gap-5 text-[11px] text-muted-foreground/60">
          <span className="hover:text-foreground cursor-pointer transition-colors">Mi cuenta</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Mis ordenes</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Soporte</span>
        </div>
      </div>
      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight hidden sm:block">Digi<span className="text-gradient">Store</span></span>
        </Link>

        <div className="flex-1 max-w-2xl">
          <div className="relative flex">
            <Input
              placeholder="Buscar productos digitales..."
              className="h-10 text-sm bg-white/[0.04] border-white/[0.08] focus:border-violet-500/40 rounded-l-lg rounded-r-none border-r-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline" className="h-10 px-4 rounded-l-none border-l-0 bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] cursor-pointer">
              <Search className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {user ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-colors" onClick={() => setUser(null)}>
              <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400">{user.name.charAt(0)}</div>
              <span className="text-xs font-medium hidden lg:block">Hola, {user.name}</span>
            </div>
          ) : (
            <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-white/[0.04]" onClick={() => useStore.getState().setAuthOpen(true)}>
              <LogIn className="w-4 h-4" />
              <span className="hidden lg:inline text-xs">Ingresar</span>
            </Button>
          )}
          <Button variant="ghost" size="sm" className="relative gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-white/[0.04]" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline text-xs">Carrito</span>
            {cartCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center min-w-[18px] h-[18px]">{cartCount()}</span>
            )}
          </Button>
        </div>
      </div>
      {/* Category nav */}
      <div className="border-t border-white/[0.04] hidden md:block">
        <div className="max-w-7xl mx-auto px-6 h-10 flex items-center gap-1 overflow-x-auto">
          <Link href="/tienda" className="px-3 py-1.5 rounded-md text-xs font-medium text-foreground hover:bg-white/[0.06] transition-colors whitespace-nowrap">Todo</Link>
          {CATEGORIES.map(cat => (
            <Link key={cat.id} href={`/tienda?cat=${cat.id}`} className="px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors whitespace-nowrap">
              {cat.name}
            </Link>
          ))}
          <Link href="/tienda?sort=price-asc" className="px-3 py-1.5 rounded-md text-xs font-bold text-amber-400 hover:bg-amber-400/10 transition-colors whitespace-nowrap flex items-center gap-1">
            <Flame className="w-3 h-3" /> Ofertas
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ── Hero Carousel ── */
const heroSlides = [
  { title: 'Gaming al mejor precio', subtitle: 'V-Bucks, Robux, Valorant Points y mas. Codigos oficiales con entrega instantanea.', cta: 'Explorar Gaming', href: '/tienda?cat=gaming', gradient: 'from-violet-900/90 via-purple-900/80 to-indigo-900/90', emoji: '🎮' },
  { title: 'Tarjetas de Regalo', subtitle: 'Steam, PlayStation, Xbox, Nintendo, Google Play. Saldo oficial al instante.', cta: 'Ver Gift Cards', href: '/tienda?cat=giftcards', gradient: 'from-amber-900/90 via-orange-900/80 to-red-900/90', emoji: '🎁' },
  { title: 'Streaming Oficial', subtitle: 'Netflix, Spotify, Disney+, YouTube Premium. Codigos de gift card oficiales.', cta: 'Ver Streaming', href: '/tienda?cat=streaming', gradient: 'from-red-900/90 via-pink-900/80 to-rose-900/90', emoji: '📺' },
];

function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const next = useCallback(() => setCurrent(c => (c + 1) % heroSlides.length), []);
  const prev = useCallback(() => setCurrent(c => (c - 1 + heroSlides.length) % heroSlides.length), []);

  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next]);

  const slide = heroSlides[current];

  return (
    <div className="relative h-[280px] sm:h-[360px] lg:h-[420px] overflow-hidden bg-gradient-to-br {slide.gradient}">
      {/* Background image with overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-purple-950 to-fuchsia-950" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-violet-500/15 rounded-full blur-[120px]" />
      <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-fuchsia-500/10 rounded-full blur-[100px]" />

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center">
        <div className="max-w-xl space-y-5">
          <div className="text-5xl sm:text-6xl">{slide.emoji}</div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">{slide.title}</h1>
          <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-md">{slide.subtitle}</p>
          <Link href={slide.href}>
            <Button size="lg" className="gap-2 cursor-pointer bg-white text-violet-700 hover:bg-white/90 border-0 rounded-lg h-11 px-8 text-sm font-bold shadow-xl transition-all hover:scale-[1.02]">
              {slide.cta} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Carousel controls */}
      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors cursor-pointer border border-white/10">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors cursor-pointer border border-white/10">
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {heroSlides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === current ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`} />
        ))}
      </div>
    </div>
  );
}

/* ── Trust Badges ── */
function TrustBadges() {
  const badges = [
    { icon: Zap, title: 'Entrega Instantanea', desc: 'Codigo al instante por email' },
    { icon: Shield, title: 'Pago 100% Seguro', desc: 'Encriptacion de 256 bits' },
    { icon: Headphones, title: 'Soporte 24/7', desc: 'Siempre disponibles para ti' },
    { icon: RotateCcw, title: 'Garantia 30 Dias', desc: 'Devolucion sin preguntas' },
  ];
  return (
    <div className="border-b border-white/[0.04] bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {badges.map((b, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
              <b.icon className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold">{b.title}</p>
              <p className="text-[11px] text-muted-foreground/60">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Category Grid ── */
const catIcons: Record<string, string> = { gaming: '🎮', streaming: '📺', giftcards: '🎁', software: '💻', subscriptions: '🔄' };

function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">Explora por Categoria</h2>
        <Link href="/tienda" className="text-sm text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 transition-colors">
          Ver todo <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {CATEGORIES.map(cat => {
          const count = PRODUCTS.filter(p => p.category === cat.id).length;
          return (
            <Link key={cat.id} href={`/tienda?cat=${cat.id}`} className="group">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-violet-500/20 p-4 sm:p-5 text-center transition-all duration-300 cursor-pointer">
                <div className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">{catIcons[cat.id]}</div>
                <p className="text-xs sm:text-sm font-semibold">{cat.name}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">{count} productos</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ── Deals Section (horizontal scroll) ── */
function DealsSection() {
  const deals = [...PRODUCTS]
    .filter(p => p.originalPrice)
    .sort((a, b) => ((b.originalPrice! - b.price) / b.originalPrice!) - ((a.originalPrice! - a.price) / a.originalPrice!))
    .slice(0, 10);

  return (
    <section className="border-t border-white/[0.04] bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold">Ofertas del Dia</h2>
            <span className="text-xs font-medium text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-md">Tiempo limitado</span>
          </div>
          <Link href="/tienda?sort=price-asc" className="text-sm text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 transition-colors">
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-none">
          {deals.map(p => {
            const disc = Math.round(((p.originalPrice! - p.price) / p.originalPrice!) * 100);
            return (
              <Link key={p.id} href={`/tienda/producto/${p.id}`} className="snap-start shrink-0 w-[200px] sm:w-[220px] group">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-violet-500/20 transition-all duration-300 cursor-pointer">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">-{disc}%</div>
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">{p.platform}</p>
                    <p className="text-xs font-semibold line-clamp-2 mt-1 group-hover:text-violet-400 transition-colors">{p.name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-bold">${p.price.toFixed(2)}</span>
                      <span className="text-[10px] text-muted-foreground/40 line-through">${p.originalPrice!.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Featured Products Grid ── */
function FeaturedProducts() {
  const featured = [...PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 8);
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Productos Destacados</h2>
          <p className="text-sm text-muted-foreground/60 mt-0.5">Seleccionados para ti</p>
        </div>
        <Link href="/tienda" className="text-sm text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 transition-colors">
          Ver mas <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {featured.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

/* ── CTA Banner ── */
function CTABanner() {
  const totalSold = PRODUCTS.reduce((s, p) => s + p.sold, 0);
  return (
    <section className="border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="rounded-2xl overflow-hidden relative bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 p-8 sm:p-14 text-center">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative space-y-4">
            <p className="text-xs text-white/50 font-medium uppercase tracking-widest">Mas de {(totalSold / 1000).toFixed(0)}K clientes confian en nosotros</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">Los mejores precios en productos digitales</h2>
            <p className="text-sm text-white/60 max-w-lg mx-auto">Entrega inmediata, soporte real 24/7 y garantia total en cada compra.</p>
            <Link href="/tienda">
              <Button size="lg" className="mt-2 gap-2 cursor-pointer bg-white text-violet-700 hover:bg-white/90 border-0 rounded-lg h-11 px-8 text-sm font-bold shadow-xl transition-all hover:scale-[1.02]">
                Ir a la Tienda <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="border-t border-white/[0.04] bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-base">Digi<span className="text-gradient">Store</span></span>
            </div>
            <p className="text-xs text-muted-foreground/60 leading-relaxed">Tu tienda de confianza para productos digitales al mejor precio.</p>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Productos</h4>
            <ul className="space-y-2 text-xs text-muted-foreground/60">
              {['Gaming', 'Streaming', 'Gift Cards', 'Software', 'Suscripciones'].map(item => (
                <li key={item} className="hover:text-foreground transition-colors cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Soporte</h4>
            <ul className="space-y-2 text-xs text-muted-foreground/60">
              {['Centro de ayuda', 'Chat en vivo', 'Garantias', 'Metodos de pago'].map(item => (
                <li key={item} className="hover:text-foreground transition-colors cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Legal</h4>
            <ul className="space-y-2 text-xs text-muted-foreground/60">
              {['Terminos de servicio', 'Privacidad', 'Devoluciones', 'Contacto'].map(item => (
                <li key={item} className="hover:text-foreground transition-colors cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.04] mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground/40">2025 DigiStore. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground/40">
            <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Pagos seguros</span>
            <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Envio global</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── MAIN PAGE ── */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <HeroCarousel />
        <TrustBadges />
        <CategoryGrid />
        <DealsSection />
        <FeaturedProducts />
        <CTABanner />
      </main>
      <Footer />
      <CartDrawer />
      <AuthDialog />
    </div>
  );
}
