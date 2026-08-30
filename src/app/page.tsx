'use client';

import { useStore, PRODUCTS, CATEGORIES } from '@/lib/store';
import { CartDrawer } from '@/components/store/CartDrawer';
import { ProductCard } from '@/components/store/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthDialog } from '@/components/auth/AuthDialog';
import {
  ShoppingCart, Search, Zap, Shield, Headphones, LogIn, LogOut,
  ArrowRight, Sparkles, CreditCard, Flame, Heart,
  ChevronLeft, ChevronRight, RotateCcw, Globe, Tag,
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

/* ── Announcement Bar ── */
function AnnouncementBar() {
  return (
    <div className="bg-[#111827] text-white text-xs py-2.5 px-4 text-center font-medium">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
        <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-teal-400" /> Entrega instantanea</span>
        <span className="text-white/30">|</span>
        <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-teal-400" /> Pago seguro</span>
        <span className="text-white/30">|</span>
        <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-teal-400" /> Codigo <span className="font-bold bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded">DIGI10</span> para 10% off</span>
      </div>
    </div>
  );
}

/* ── Header ── */
function Header() {
  const { cartCount, setCartOpen, user, setUser, searchQuery, setSearchQuery } = useStore();
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#e2e8f0] shadow-sm">
      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-lg bg-[#0d9488] flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-shadow">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight hidden sm:block text-[#111]">
            Digi<span className="text-[#0d9488]">Store</span>
          </span>
        </Link>

        {/* Search Bar - Amazon style with yellow/amber button */}
        <div className="flex-1 max-w-2xl">
          <div className="relative flex">
            <select className="hidden sm:block h-10 text-xs bg-[#f1f5f9] border border-r-0 border-[#e2e8f0] rounded-l-lg px-2 text-[#64748b] focus:outline-none appearance-none cursor-pointer">
              <option>Todos</option>
              <option>Gaming</option>
              <option>Streaming</option>
              <option>Gift Cards</option>
              <option>Software</option>
              <option>Suscripciones</option>
            </select>
            <Input
              placeholder="Buscar productos digitales..."
              className="h-10 text-sm bg-white border-[#e2e8f0] focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488]/20 sm:rounded-l-none border-r-0 text-[#111] placeholder:text-[#94a3b8]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button className="h-10 px-5 rounded-l-none bg-amber-500 hover:bg-amber-600 border-0 cursor-pointer rounded-r-lg">
              <Search className="w-4 h-4 text-white" />
            </Button>
          </div>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-1 sm:gap-3">
          {user ? (
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#f1f5f9] cursor-pointer transition-colors"
              onClick={() => setUser(null)}
            >
              <div className="w-7 h-7 rounded-full bg-[#0d9488]/10 flex items-center justify-center text-xs font-bold text-[#0d9488]">
                {user.name.charAt(0)}
              </div>
              <span className="text-xs font-medium hidden lg:block text-[#111]">Hola, {user.name}</span>
            </button>
          ) : (
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[#f1f5f9] cursor-pointer transition-colors"
              onClick={() => useStore.getState().setAuthOpen(true)}
            >
              <LogIn className="w-4 h-4 text-[#64748b]" />
              <span className="hidden lg:inline text-xs font-medium text-[#64748b]">Ingresar</span>
            </button>
          )}
          <button className="relative p-2 rounded-lg hover:bg-[#f1f5f9] cursor-pointer transition-colors">
            <Heart className="w-5 h-5 text-[#64748b]" />
          </button>
          <button
            className="relative p-2 rounded-lg hover:bg-[#f1f5f9] cursor-pointer transition-colors"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="w-5 h-5 text-[#64748b]" />
            {cartCount() > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#0d9488] text-white text-[9px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                {cartCount()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category nav pills */}
      <div className="border-t border-[#e2e8f0] bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center gap-1 overflow-x-auto">
          <Link
            href="/tienda"
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#111] hover:bg-white hover:shadow-sm transition-all whitespace-nowrap"
          >
            Todo
          </Link>
          {CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              href={`/tienda?cat=${cat.id}`}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-[#64748b] hover:bg-white hover:shadow-sm hover:text-[#111] transition-all whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href="/tienda?sort=price-asc"
            className="px-3 py-1.5 rounded-full text-xs font-bold text-orange-600 hover:bg-orange-50 transition-all whitespace-nowrap flex items-center gap-1"
          >
            <Flame className="w-3 h-3" /> Ofertas
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ── Hero Carousel ── */
const heroSlides = [
  {
    title: 'Gaming al mejor precio',
    subtitle: 'V-Bucks, Robux, Valorant Points y mas. Codigos oficiales con entrega instantanea.',
    cta: 'Explorar Gaming',
    href: '/tienda?cat=gaming',
    image: '/products/gen/g1.png',
    gradient: 'from-teal-900/85 via-teal-800/75 to-emerald-900/85',
  },
  {
    title: 'Gift Cards Oficiales',
    subtitle: 'PlayStation, Xbox, Steam, Nintendo, Google Play. Saldo oficial al instante.',
    cta: 'Ver Gift Cards',
    href: '/tienda?cat=giftcards',
    image: '/products/gen/gc1.png',
    gradient: 'from-amber-900/85 via-orange-800/75 to-red-900/85',
  },
  {
    title: 'Streaming Oficial',
    subtitle: 'Netflix, Spotify, Disney+, YouTube Premium. Codigos de gift card oficiales.',
    cta: 'Ver Streaming',
    href: '/tienda?cat=streaming',
    image: '/products/gen/s1.png',
    gradient: 'from-rose-900/85 via-pink-800/75 to-fuchsia-900/85',
  },
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
    <div className="relative h-[280px] sm:h-[360px] lg:h-[420px] overflow-hidden">
      {/* Background image */}
      <img
        src={slide.image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center">
        <div className="max-w-xl space-y-5">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            {slide.title}
          </h1>
          <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-md">
            {slide.subtitle}
          </p>
          <Link href={slide.href}>
            <Button
              size="lg"
              className="gap-2 cursor-pointer bg-[#0d9488] hover:bg-[#0f766e] text-white border-0 rounded-lg h-11 px-8 text-sm font-bold shadow-lg shadow-teal-900/30 transition-all hover:scale-[1.02]"
            >
              {slide.cta} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Carousel controls */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition-colors cursor-pointer border border-white/20"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition-colors cursor-pointer border border-white/20"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              i === current ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60 w-2'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Trust Badges ── */
function TrustBadges() {
  const badges = [
    { icon: Zap, title: 'Entrega instantanea', desc: 'Codigo al instante por email' },
    { icon: Shield, title: 'Pago seguro', desc: 'Encriptacion de 256 bits' },
    { icon: Headphones, title: 'Soporte 24/7', desc: 'Siempre disponibles para ti' },
    { icon: RotateCcw, title: 'Garantia 30 dias', desc: 'Devolucion sin preguntas' },
  ];
  return (
    <div className="bg-[#f8fafc] border-b border-[#e2e8f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {badges.map((b, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#0d9488]/10 flex items-center justify-center shrink-0">
              <b.icon className="w-5 h-5 text-[#0d9488]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111]">{b.title}</p>
              <p className="text-[11px] text-[#64748b]">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Category Grid ── */
const catEmojis: Record<string, string> = {
  gaming: '🎮',
  streaming: '📺',
  giftcards: '🎁',
  software: '💻',
  subscriptions: '🔄',
};

function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#111]">Comprar por Categoria</h2>
        <Link
          href="/tienda"
          className="text-sm text-[#0d9488] hover:text-[#0f766e] font-medium flex items-center gap-1 transition-colors"
        >
          Ver todo <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4">
        {CATEGORIES.map(cat => {
          const count = PRODUCTS.filter(p => p.category === cat.id).length;
          return (
            <Link key={cat.id} href={`/tienda?cat=${cat.id}`} className="group">
              <div className="rounded-xl border border-[#e2e8f0] bg-white hover:shadow-lg p-4 sm:p-5 text-center transition-all duration-300 cursor-pointer">
                <div className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                  {catEmojis[cat.id]}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#111]">{cat.name}</p>
                <p className="text-[10px] text-[#64748b] mt-0.5">{count} productos</p>
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const deals = [...PRODUCTS]
    .filter(p => p.originalPrice)
    .sort((a, b) => ((b.originalPrice! - b.price) / b.originalPrice!) - ((a.originalPrice! - a.price) / a.originalPrice!))
    .slice(0, 12);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -240, behavior: 'smooth' });
  };
  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 240, behavior: 'smooth' });
  };

  return (
    <section className="bg-[#f8fafc] border-y border-[#e2e8f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#111]">Ofertas del Dia</h2>
            <span className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
              <Flame className="w-3 h-3 inline mr-0.5 -mt-0.5" />
              Tiempo limitado
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/tienda?sort=price-asc"
              className="text-sm text-[#0d9488] hover:text-[#0f766e] font-medium flex items-center gap-1 transition-colors"
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-[#e2e8f0] flex items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors hidden sm:flex"
          >
            <ChevronLeft className="w-4 h-4 text-[#64748b]" />
          </button>
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {deals.map(p => {
              const disc = Math.round(((p.originalPrice! - p.price) / p.originalPrice!) * 100);
              return (
                <Link
                  key={p.id}
                  href={`/tienda/producto/${p.id}`}
                  className="snap-start shrink-0 w-[200px] sm:w-[220px] group"
                >
                  <div className="rounded-xl border border-[#e2e8f0] bg-white overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#f8fafc]">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        -{disc}%
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] text-[#64748b] uppercase tracking-wider font-medium">{p.platform}</p>
                      <p className="text-xs font-semibold line-clamp-2 mt-1 text-[#111] group-hover:text-[#0d9488] transition-colors">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-bold text-[#111]">${p.price.toFixed(2)}</span>
                        <span className="text-[10px] text-[#94a3b8] line-through">${p.originalPrice!.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-[#e2e8f0] flex items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors hidden sm:flex"
          >
            <ChevronRight className="w-4 h-4 text-[#64748b]" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── Featured Products Grid ── */
function FeaturedProducts() {
  const featured = PRODUCTS.filter(p => p.featured).slice(0, 8);
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#111]">Productos Destacados</h2>
          <p className="text-sm text-[#64748b] mt-0.5">Seleccionados para ti</p>
        </div>
        <Link
          href="/tienda"
          className="text-sm text-[#0d9488] hover:text-[#0f766e] font-medium flex items-center gap-1 transition-colors"
        >
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="rounded-2xl overflow-hidden relative bg-gradient-to-br from-[#0d9488] via-teal-600 to-emerald-600 p-8 sm:p-14 text-center">
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative space-y-4">
          <p className="text-xs text-white/60 font-medium uppercase tracking-widest">
            Mas de {(totalSold / 1000).toFixed(0)}K clientes confian en nosotros
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Los mejores precios en productos digitales
          </h2>
          <p className="text-sm text-white/80 max-w-lg mx-auto">
            Entrega inmediata, soporte real 24/7 y garantia total en cada compra.
          </p>
          <Link href="/tienda">
            <Button
              size="lg"
              className="mt-2 gap-2 cursor-pointer bg-white text-[#0d9488] hover:bg-gray-50 border-0 rounded-lg h-11 px-8 text-sm font-bold shadow-lg transition-all hover:scale-[1.02]"
            >
              Ir a la Tienda <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="bg-[#111827] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#0d9488] flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-base">
                Digi<span className="text-[#2dd4bf]">Store</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Tu tienda de confianza para productos digitales al mejor precio con entrega instantanea.
            </p>
          </div>

          {/* Productos */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-white">Productos</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {['Gaming', 'Streaming', 'Gift Cards', 'Software', 'Suscripciones'].map(item => (
                <li key={item} className="hover:text-white transition-colors cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>

          {/* Soporte */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-white">Soporte</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {['Centro de ayuda', 'Chat en vivo', 'Garantias', 'Metodos de pago'].map(item => (
                <li key={item} className="hover:text-white transition-colors cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-white">Legal</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {['Terminos de servicio', 'Privacidad', 'Devoluciones', 'Contacto'].map(item => (
                <li key={item} className="hover:text-white transition-colors cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500">2025 DigiStore. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Pagos seguros
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Envio global
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── MAIN PAGE ── */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
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
