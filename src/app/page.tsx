'use client';

import { useStore, PRODUCTS, CATEGORIES } from '@/lib/store';
import { CartDrawer } from '@/components/store/CartDrawer';
import { AuthDialog } from '@/components/auth/AuthDialog';
import {
  ShoppingCart, Search, Zap, Shield, Headphones, LogIn,
  ArrowRight, Sparkles, CreditCard, Flame, Heart, Star,
  ChevronLeft, ChevronRight, Truck, RotateCcw, Globe, Tag,
  Menu, MapPin, DollarSign, ChevronDown, Eye, GitCompare, Sun, Moon,
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

/* ══════════════════════════════════════════════════
   ANNOUNCEMENT BAR — exact Z Shop style: bg-zinc-900
   ══════════════════════════════════════════════════ */
function AnnouncementBar() {
  return (
    <div className="bg-zinc-900 text-zinc-100 text-[11px] sm:text-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-1 sm:px-6">
        <div className="flex items-center gap-1.5">
          <Truck className="w-3 h-3 text-amber-400" />
          <span className="hidden sm:inline">Entrega instantanea en pedidos digitales</span>
          <span className="sm:hidden">Entrega instantanea</span>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            Pago seguro
          </span>
          <span className="flex items-center gap-1">
            <Tag className="w-3 h-3 text-amber-400" />
            Usa el codigo <b className="text-amber-300">DIGI10</b> para 10% off
          </span>
        </div>
        <div className="flex items-center gap-2 text-zinc-300">
          <span>Envio: <b className="text-white">Global</b></span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   HEADER — 2-row amber gradient, exact Z Shop layout
   ══════════════════════════════════════════════════ */
function Header() {
  const { cartCount, setCartOpen, user, setUser, searchQuery, setSearchQuery } = useStore();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Row 1 — Amber gradient bar */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-zinc-900 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:gap-4 sm:px-6 sm:py-3">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="inline-flex items-center justify-center size-9 md:hidden rounded-md hover:bg-amber-300/40 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo — Z Shop style black square + text */}
          <Link href="/" className="flex shrink-0 items-center gap-1.5 transition-transform hover:scale-[1.02]">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-zinc-900 text-amber-400 shadow-md">
              <span className="text-lg font-black">D</span>
            </div>
            <div className="hidden sm:block leading-none">
              <div className="text-lg font-black tracking-tight">DigiStore</div>
              <div className="text-[10px] font-medium text-zinc-700">Productos digitales al instante</div>
            </div>
          </Link>

          {/* Deliver to — hidden on small screens */}
          <div className="hidden lg:flex items-center gap-1 rounded-md px-2 py-1 text-zinc-900 hover:bg-amber-300/40 cursor-default">
            <MapPin className="w-4 h-4" />
            <div className="leading-tight">
              <div className="text-[10px] text-zinc-700">Entrega a</div>
              <div className="text-xs font-semibold">Todo el mundo</div>
            </div>
          </div>

          {/* Search bar — exact Z Shop style with amber button */}
          <div className="relative flex-1">
            <div className="flex items-stretch overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-amber-200/60 focus-within:ring-2 focus-within:ring-amber-500">
              <input
                type="text"
                placeholder="Buscar productos, marcas y categorias..."
                className="h-10 w-full border-0 bg-transparent px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Link href={`/tienda?q=${encodeURIComponent(searchQuery)}`}>
                <button className="h-10 bg-amber-400 px-3 hover:bg-amber-500 transition-colors cursor-pointer" aria-label="Search">
                  <Search className="w-[18px] h-[18px] text-zinc-900" />
                </button>
              </Link>
            </div>
          </div>

          {/* Sign in — Z Shop dropdown style */}
          {user ? (
            <button
              className="hidden md:flex flex-col items-start rounded-md px-2 py-1 hover:bg-amber-300/40 transition-colors cursor-pointer"
              onClick={() => setUser(null)}
            >
              <span className="text-[10px] leading-none">Hola, {user.name}</span>
              <span className="flex items-center gap-0.5 text-xs font-semibold">Cerrar sesion <ChevronDown className="w-3 h-3" /></span>
            </button>
          ) : (
            <button
              className="hidden md:flex flex-col items-start rounded-md px-2 py-1 hover:bg-amber-300/40 transition-colors cursor-pointer"
              onClick={() => useStore.getState().setAuthOpen(true)}
            >
              <span className="text-[10px] leading-none">Hola, Inicia sesion</span>
              <span className="flex items-center gap-0.5 text-xs font-semibold">Cuenta <ChevronDown className="w-3 h-3" /></span>
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleDark}
            className="inline-flex items-center justify-center size-9 rounded-md hover:bg-amber-300/40 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            <Sun className={`w-[18px] h-[18px] rotate-0 scale-100 transition-all ${darkMode ? '-rotate-90 scale-0' : ''}`} />
            <Moon className={`w-[18px] h-[18px] absolute rotate-90 scale-0 transition-all ${darkMode ? 'rotate-0 scale-100' : ''}`} />
          </button>

          {/* Compare — hidden on small */}
          <button className="relative hidden sm:grid h-10 w-10 place-items-center rounded-md hover:bg-amber-300/40 transition-colors cursor-pointer" aria-label="Compare">
            <GitCompare className="w-5 h-5" />
          </button>

          {/* Wishlist */}
          <button className="relative hidden sm:grid h-10 w-10 place-items-center rounded-md hover:bg-amber-300/40 transition-colors cursor-pointer" aria-label="Wishlist">
            <Heart className="w-5 h-5" />
          </button>

          {/* Cart — Z Shop style with label */}
          <button
            className="relative flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-amber-300/40 transition-colors cursor-pointer"
            onClick={() => setCartOpen(true)}
            aria-label={`Cart with ${cartCount()} items`}
          >
            <div className="relative">
              <ShoppingCart className="w-[22px] h-[22px]" />
            </div>
            <span className="hidden text-xs font-semibold sm:block">Carrito</span>
            {cartCount() > 0 && (
              <span className="absolute -top-0.5 right-0 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center sm:hidden">
                {cartCount()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Row 2 — Category nav, amber-500/95 background */}
      <div className="border-t border-amber-300/40 bg-amber-500/95">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-3 py-1.5 sm:px-6 scrollbar-none">
          <Link
            href="/tienda?sort=popular"
            className="flex shrink-0 items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-zinc-900 hover:bg-amber-300/50 transition-colors"
          >
            <Sparkles className="w-3 h-3" /> Mas vendido
          </Link>
          <Link href="/tienda" className="shrink-0 rounded px-2 py-1 text-xs font-medium text-zinc-900 hover:bg-amber-300/50 transition-colors">Todo</Link>
          {CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              href={`/tienda?cat=${cat.id}`}
              className="shrink-0 rounded px-2 py-1 text-xs font-medium text-zinc-900 hover:bg-amber-300/50 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href="/tienda?onSale=true"
            className="shrink-0 rounded px-2 py-1 text-xs font-medium text-zinc-900 hover:bg-amber-300/50 transition-colors"
          >
            Ofertas
          </Link>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenu && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border-b border-zinc-200 shadow-lg md:hidden">
          <div className="px-4 py-3 space-y-1">
            <Link href="/tienda" onClick={() => setMobileMenu(false)} className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-100">Todo</Link>
            {CATEGORIES.map(cat => (
              <Link key={cat.id} href={`/tienda?cat=${cat.id}`} onClick={() => setMobileMenu(false)} className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-100">{cat.name}</Link>
            ))}
            <Link href="/tienda?onSale=true" onClick={() => setMobileMenu(false)} className="block px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50">Ofertas</Link>
            {!user && (
              <button onClick={() => { useStore.getState().setAuthOpen(true); setMobileMenu(false); }} className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-100">Iniciar sesion</button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

/* ══════════════════════════════════════════════════
   TRUST BADGES — Card style with amber accents
   ══════════════════════════════════════════════════ */
function TrustBadges() {
  const badges = [
    { icon: Truck, title: 'Entrega Instantanea', desc: 'Codigo al instante' },
    { icon: Shield, title: 'Pago Seguro', desc: 'Encriptacion 256-bit' },
    { icon: Headphones, title: 'Soporte 24/7', desc: 'Siempre disponibles' },
    { icon: CreditCard, title: 'Devolucion Facil', desc: '30 dias garantia' },
  ];
  return (
    <div className="mb-5 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
      {badges.map((b, i) => (
        <div key={i} className="flex h-full flex-col items-center gap-2.5 rounded-xl border border-border/60 bg-gradient-to-br from-card to-amber-50/30 p-2.5 shadow-sm transition-colors hover:border-amber-300/60 sm:p-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700">
            <b.icon className="w-4 h-4" />
          </div>
          <div className="leading-tight text-center">
            <div className="text-xs font-semibold sm:text-sm">{b.title}</div>
            <div className="hidden text-[10px] text-muted-foreground sm:block">{b.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   HERO CAROUSEL — Gradient slides, badge, CTA, image
   ══════════════════════════════════════════════════ */
const heroSlides = [
  {
    title: 'Gaming al mejor precio',
    subtitle: 'V-Bucks, Robux, Valorant Points y mas. Codigos oficiales con entrega instantanea.',
    cta: 'Explorar Gaming',
    href: '/tienda?cat=gaming',
    image: '/products/gen/g1.png',
    badge: 'Mega Gaming Sale',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    title: 'Gift Cards Oficiales',
    subtitle: 'PlayStation, Xbox, Steam, Nintendo, Google Play. Saldo oficial al instante.',
    cta: 'Ver Gift Cards',
    href: '/tienda?cat=giftcards',
    image: '/products/gen/gc1.png',
    badge: 'Tarjetas Oficiales',
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    title: 'Streaming Premium',
    subtitle: 'Netflix, Spotify, Disney+, YouTube Premium. Codigos de gift card oficiales.',
    cta: 'Ver Streaming',
    href: '/tienda?cat=streaming',
    image: '/products/gen/s1.png',
    badge: 'Entretenimiento',
    gradient: 'from-emerald-500 to-teal-500',
  },
];

function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const next = useCallback(() => setCurrent(c => (c + 1) % heroSlides.length), []);

  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next]);

  const slide = heroSlides[current];

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl shadow-md">
      {/* Slides container */}
      <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${current * 100}%)` }}>
        {heroSlides.map((s, i) => (
          <div key={i} className="relative min-w-full">
            <div className={`relative flex min-h-[260px] flex-col justify-end overflow-hidden bg-gradient-to-br ${s.gradient} p-6 sm:min-h-[340px] sm:p-10 md:flex-row md:items-center md:justify-between`}>
              {/* Text content */}
              <div className="relative z-10 max-w-md text-white">
                <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-md border border-transparent bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-white/30">
                  <Sparkles className="mr-1 w-3 h-3" />
                  {s.badge}
                </span>
                <h1 className="mb-2 text-2xl font-black leading-tight drop-shadow sm:text-4xl">{s.title}</h1>
                <p className="mb-4 text-sm text-white/90 sm:text-base">{s.subtitle}</p>
                <Link href={s.href}>
                  <span className="inline-flex h-9 items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-md transition-colors hover:bg-zinc-100 cursor-pointer">
                    {s.cta} <ArrowRight className="ml-1 w-4 h-4" />
                  </span>
                </Link>
              </div>

              {/* Right image — Z Shop style with ring */}
              <div className="relative mt-4 hidden h-56 w-56 overflow-hidden rounded-2xl shadow-2xl ring-4 ring-white/20 sm:block md:h-72 md:w-72">
                <div className="absolute inset-0 overflow-hidden bg-white/10">
                  <img
                    alt={s.title}
                    decoding="async"
                    className="object-cover transition-transform duration-500 hover:scale-[1.04]"
                    src={s.image}
                    style={{ position: 'absolute', height: '100%', width: '100%', inset: 0 }}
                  />
                </div>
              </div>

              {/* Decorative blurs */}
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute right-1/3 top-1/2 h-24 w-24 rounded-full bg-white/10 blur-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Dots — exact Z Shop style */}
      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   CATEGORY GRID — Emoji buttons, Z Shop style
   ══════════════════════════════════════════════════ */
const catEmojis: Record<string, string> = {
  gaming: '\ud83c\udfae',
  streaming: '\ud83d\udcfa',
  giftcards: '\ud83c\udf81',
  software: '\ud83d\udcbb',
  subscriptions: '\ud83d\udd04',
};

function CategoryGrid() {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold sm:text-xl">Comprar por categoria</h2>
        <Link href="/tienda" className="flex items-center gap-1.5 rounded-md px-3 h-8 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
          Ver todo <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:gap-3">
        {CATEGORIES.map(cat => (
          <Link
            key={cat.id}
            href={`/tienda?cat=${cat.id}`}
            className="flex shrink-0 flex-col items-center gap-2 rounded-xl border border-border/60 bg-gradient-to-br from-card to-amber-50/30 p-4 shadow-sm transition-all hover:border-amber-300/60 hover:shadow-md sm:p-5 cursor-pointer min-w-[100px] sm:min-w-[120px]"
          >
            <span className="text-2xl sm:text-3xl">{catEmojis[cat.id]}</span>
            <span className="text-xs font-semibold text-center">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   DEALS SECTION — Horizontal scroll, discount badges
   ══════════════════════════════════════════════════ */
function DealsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const deals = [...PRODUCTS]
    .filter(p => p.originalPrice)
    .sort((a, b) => ((b.originalPrice! - b.price) / b.originalPrice!) - ((a.originalPrice! - a.price) / a.originalPrice!))
    .slice(0, 12);

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold sm:text-xl">Ofertas del dia</h2>
          <span className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
            Tiempo limitado
          </span>
        </div>
        <Link href="/tienda?onSale=true" className="flex items-center gap-1.5 rounded-md px-3 h-8 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
          Ver todas <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-none"
        >
          {deals.map(p => {
            const disc = Math.round(((p.originalPrice! - p.price) / p.originalPrice!) * 100);
            return (
              <Link
                key={p.id}
                href={`/tienda/producto/${p.id}`}
                className="snap-start shrink-0 w-[180px] sm:w-[200px] group cursor-pointer"
              >
                <div className="flex gap-3 rounded-xl border border-border/60 p-2.5 transition-all hover:shadow-md hover:border-amber-300/60">
                  {/* Image + Discount badge */}
                  <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="text-xs font-bold text-white">-{disc}%</span>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="flex flex-col justify-between min-w-0 py-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{p.platform}</span>
                    <span className="text-xs font-semibold line-clamp-2 group-hover:text-amber-600 transition-colors">{p.name}</span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-sm font-bold">${p.price.toFixed(2)}</span>
                      <span className="text-[10px] text-muted-foreground line-through">${p.originalPrice!.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   FEATURED PRODUCTS — Z Shop card grid with hover
   ══════════════════════════════════════════════════ */
function FeaturedProducts() {
  const { addToCart } = useStore();
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const featured = PRODUCTS.filter(p => p.featured).slice(0, 8);

  const toggleWish = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold sm:text-xl">Productos destacados</h2>
          <p className="text-sm text-muted-foreground">Seleccionados para ti</p>
        </div>
        <Link href="/tienda" className="flex items-center gap-1.5 rounded-md px-3 h-8 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
          Ver mas <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {featured.map(p => {
          const disc = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
          return (
            <div key={p.id} className="group rounded-lg border border-border/60 bg-card overflow-hidden hover:shadow-md transition-all">
              {/* Image with hover overlay */}
              <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 cursor-pointer" onClick={() => window.location.href = `/tienda/producto/${p.id}`}>
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {/* Wishlist heart — top right */}
                <button
                  onClick={(e) => toggleWish(p.id, e)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors cursor-pointer"
                >
                  <Heart className={`w-4 h-4 transition-colors ${wishlist.has(p.id) ? 'fill-red-500 text-red-500' : 'text-zinc-500 hover:text-red-400'}`} />
                </button>

                {/* Hover overlay — Quick View + Compare */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Link href={`/tienda/producto/${p.id}`} className="flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 shadow-sm hover:bg-zinc-100 transition-colors">
                    <Eye className="w-3 h-3" /> Vista rapida
                  </Link>
                  <button className="flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 shadow-sm hover:bg-zinc-100 transition-colors cursor-pointer">
                    <GitCompare className="w-3 h-3" /> Comparar
                  </button>
                </div>
              </div>

              {/* Content — Z Shop style */}
              <div className="p-3">
                {/* Brand + Sold count */}
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  <span>{p.platform}</span>
                  <span>({p.reviews.toLocaleString()})</span>
                </div>

                {/* Title */}
                <h3
                  className="text-sm font-semibold leading-snug line-clamp-2 mt-1 cursor-pointer hover:text-amber-600 transition-colors"
                  onClick={() => window.location.href = `/tienda/producto/${p.id}`}
                >
                  {p.name}
                </h3>

                {/* Rating + Sold */}
                <div className="flex items-center gap-1 mt-1.5">
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-semibold">{p.rating}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {p.sold >= 1000 ? `${(p.sold / 1000).toFixed(0)}K` : p.sold} vendidos
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-base font-bold">${p.price.toFixed(2)}</span>
                  {p.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through">${p.originalPrice.toFixed(2)}</span>
                  )}
                </div>

                {/* Add to cart — Z Shop style */}
                <button
                  onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Agregar al carrito
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   CTA BANNER — Gradient section
   ══════════════════════════════════════════════════ */
function CTABanner() {
  const totalSold = PRODUCTS.reduce((s, p) => s + p.sold, 0);
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 sm:p-14 text-center text-white">
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      <div className="relative space-y-4">
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
          <Flame className="w-3 h-3" /> Mas de {(totalSold / 1000).toFixed(0)}K clientes confian en nosotros
        </span>
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
          Los mejores precios en productos digitales
        </h2>
        <p className="mx-auto max-w-lg text-sm text-zinc-400">
          Entrega inmediata, soporte real 24/7 y garantia total en cada compra. Codigos oficiales 100% legitimos.
        </p>
        <Link href="/tienda">
          <span className="inline-flex h-11 items-center gap-2 rounded-md bg-amber-500 px-8 text-sm font-bold text-zinc-900 shadow-lg transition-all hover:bg-amber-400 hover:scale-[1.02] cursor-pointer">
            Ir a la Tienda <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   FOOTER — Multi-column, Z Shop style
   ══════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="bg-zinc-900 text-white">
      <div className="mx-auto max-w-7xl px-3 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-500 text-zinc-900 shadow-md">
                <span className="text-lg font-black">D</span>
              </div>
              <div className="leading-none">
                <div className="text-lg font-black tracking-tight">DigiStore</div>
                <div className="text-[10px] font-medium text-zinc-400">Productos digitales al instante</div>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tu tienda de confianza para productos digitales al mejor precio con entrega instantanea a todo el mundo.
            </p>
          </div>

          {/* Productos */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Productos</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              {CATEGORIES.map(cat => (
                <li key={cat.id}>
                  <Link href={`/tienda?cat=${cat.id}`} className="hover:text-white transition-colors">{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Soporte */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Soporte</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              {['Centro de ayuda', 'Chat en vivo', 'Garantias', 'Metodos de pago'].map(item => (
                <li key={item} className="hover:text-white transition-colors cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Legal</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              {['Terminos de servicio', 'Privacidad', 'Devoluciones', 'Contacto'].map(item => (
                <li key={item} className="hover:text-white transition-colors cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-zinc-500">2025 DigiStore. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Pagos seguros</span>
            <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Envio global</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════
   MAIN PAGE — Z Shop layout wrapper
   ══════════════════════════════════════════════════ */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-amber-50/40 via-background to-background">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 pb-16 sm:pb-0">
        <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
          <TrustBadges />
          <HeroCarousel />
          <CategoryGrid />
          <DealsSection />
          <FeaturedProducts />
          <CTABanner />
        </div>
      </main>
      <Footer />
      <CartDrawer />
      <AuthDialog />
    </div>
  );
}
