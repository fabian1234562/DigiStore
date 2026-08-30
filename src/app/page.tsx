'use client';

import { useStore, PRODUCTS, CATEGORIES } from '@/lib/store';
import dynamic from 'next/dynamic';
const CartDrawer = dynamic(() => import('@/components/store/CartDrawer').then(m => ({ default: m.CartDrawer })), { ssr: false });
const AuthDialog = dynamic(() => import('@/components/auth/AuthDialog').then(m => ({ default: m.AuthDialog })), { ssr: false });
import { AIChatWidget } from '@/components/store/AIChatWidget';
import {
  ShoppingCart, Search, Zap, Shield, Headphones, LogIn,
  ArrowRight, Sparkles, CreditCard, Flame, Heart, Star,
  ChevronLeft, ChevronRight, Truck, RotateCcw, Globe, Tag,
  Menu, MapPin, ChevronDown, Eye, GitCompare, Sun, Moon,
  Gamepad2, Tv, Gift, AppWindow, RefreshCw,
  Package, Check, Send, Crown, Clock, KeyRound, Ticket,
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

/* ══════════════════════════════════════════════════════════════
   ANNOUNCEMENT BAR — bg-[#212529], white text, 12px, ~34px
   ══════════════════════════════════════════════════════════════ */
function AnnouncementBar() {
  return (
    <div className="bg-[#212529] text-white text-xs" style={{ height: '34px' }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between h-full px-3 sm:px-6">
        <div className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Envio gratis en pedidos digitales</span>
          <span className="sm:hidden">Envio gratis</span>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Pago seguro 100%
          </span>
          <span className="text-white/60">|</span>
          <span className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            Codigo: <span className="font-semibold text-amber-400">DIGI10</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Enviamos a todo el mundo</span>
          <span className="sm:hidden">Global</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HEADER — yellow gradient, logo, search, icons
   ══════════════════════════════════════════════════════════════ */
function Header() {
  const { setAuthOpen, setCartOpen, cartCount, user } = useStore();
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const count = cartCount();

  return (
    <header className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 sticky top-0 z-50 shadow-md">
      <div className="mx-auto max-w-7xl flex items-center gap-3 sm:gap-4 px-3 sm:px-6 py-3">
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-1.5 rounded-md hover:bg-amber-600/30 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu className="w-5 h-5 text-gray-800" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-lg font-extrabold text-gray-900 tracking-tight">DigiStore</span>
            <span className="text-[9px] text-gray-700 font-medium -mt-0.5">Productos digitales al instante</span>
          </div>
          <span className="sm:hidden text-lg font-extrabold text-gray-900">DigiStore</span>
        </Link>

        {/* Location selector - hidden on small mobile */}
        <button className="hidden md:flex items-center gap-1 text-xs font-medium text-gray-800 hover:text-gray-900 transition-colors shrink-0">
          <MapPin className="w-4 h-4" />
          <span>Latam</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {/* Search bar */}
        <div className="flex-1 max-w-2xl hidden sm:flex">
          <div className="flex w-full rounded-lg overflow-hidden ring-1 ring-amber-200/60">
            <input
              type="text"
              placeholder="Buscar productos digitales..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3.5 py-2 text-sm bg-white text-gray-800 placeholder-gray-400 outline-none min-w-0"
            />
            <button className="px-4 bg-amber-400 hover:bg-amber-500 transition-colors flex items-center gap-1.5">
              <Search className="w-4 h-4 text-gray-800" />
              <span className="text-xs font-semibold text-gray-800 hidden md:inline">Buscar</span>
            </button>
          </div>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Theme toggle */}
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-full hover:bg-amber-600/30 transition-colors hidden sm:flex"
          >
            {dark ? <Sun className="w-5 h-5 text-gray-800" /> : <Moon className="w-5 h-5 text-gray-800" />}
          </button>

          {/* Compare */}
          <button className="p-2 rounded-full hover:bg-amber-600/30 transition-colors hidden lg:flex relative">
            <GitCompare className="w-5 h-5 text-gray-800" />
          </button>

          {/* Wishlist */}
          <button className="p-2 rounded-full hover:bg-amber-600/30 transition-colors relative">
            <Heart className="w-5 h-5 text-gray-800" />
          </button>

          {/* Account */}
          <button
            onClick={() => setAuthOpen(true)}
            className="hidden sm:flex items-center gap-1.5 p-1.5 rounded-full hover:bg-amber-600/30 transition-colors"
          >
            <LogIn className="w-5 h-5 text-gray-800" />
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-[10px] text-gray-600">Hola, {user?.name || 'Inicia sesion'}</span>
              <span className="text-xs font-semibold text-gray-900">Cuenta</span>
            </div>
          </button>

          {/* Cart */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 rounded-full hover:bg-amber-600/30 transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-gray-800" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {count > 9 ? '9+' : count}
              </span>
            )}
            <span className="hidden lg:inline text-xs font-semibold text-gray-900 ml-1">Carrito</span>
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="sm:hidden px-3 pb-3">
        <div className="flex w-full rounded-lg overflow-hidden ring-1 ring-amber-200/60">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-white text-gray-800 placeholder-gray-400 outline-none"
          />
          <button className="px-3 bg-amber-400 hover:bg-amber-500 transition-colors">
            <Search className="w-4 h-4 text-gray-800" />
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="lg:hidden bg-amber-400 border-t border-amber-300/40 px-3 pb-3">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setAuthOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-amber-500/40 text-sm font-medium text-gray-800 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Iniciar sesion / Cuenta
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-amber-500/40 text-sm font-medium text-gray-800 transition-colors">
              <Heart className="w-4 h-4" />
              Mi lista de deseos
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-amber-500/40 text-sm font-medium text-gray-800 transition-colors">
              <GitCompare className="w-4 h-4" />
              Comparar productos
            </button>
            <button
              onClick={() => setDark(!dark)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-amber-500/40 text-sm font-medium text-gray-800 transition-colors"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              Cambiar tema
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

/* ══════════════════════════════════════════════════════════════
   CATEGORY NAV — amber-500/95, border-t, 12px, font-medium 500
   ══════════════════════════════════════════════════════════════ */
function CategoryNav() {
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const catIcons: Record<string, React.ReactNode> = {
    gaming: <Gamepad2 className="w-3.5 h-3.5" />,
    streaming: <Tv className="w-3.5 h-3.5" />,
    giftcards: <Gift className="w-3.5 h-3.5" />,
    software: <AppWindow className="w-3.5 h-3.5" />,
    subscriptions: <RefreshCw className="w-3.5 h-3.5" />,
  };

  return (
    <nav className="bg-amber-500/95 border-t border-amber-300/40 backdrop-blur-sm sticky top-[72px] z-40">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1.5">
          <Link
            href="/tienda"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold text-gray-900 whitespace-nowrap hover:bg-amber-400/60 transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-900" />
            Mas vendido
          </Link>
          <Link
            href="/tienda"
            className="px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-900 whitespace-nowrap hover:bg-amber-400/60 transition-colors shrink-0"
          >
            Todo
          </Link>
          <div className="w-px h-4 bg-amber-600/40 mx-0.5 shrink-0" />
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/tienda?categoria=${cat.id}`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-900 whitespace-nowrap hover:bg-amber-400/60 transition-colors shrink-0"
              onMouseEnter={() => setHoveredCat(cat.id)}
              onMouseLeave={() => setHoveredCat(null)}
            >
              {catIcons[cat.icon]}
              {cat.name}
            </Link>
          ))}
          <div className="w-px h-4 bg-amber-600/40 mx-0.5 shrink-0" />
          <Link
            href="/tienda?ofertas=true"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold text-red-700 whitespace-nowrap hover:bg-amber-400/60 transition-colors shrink-0"
          >
            <Flame className="w-3.5 h-3.5" />
            Ofertas
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════════
   HERO CAROUSEL — rounded-2xl, auto-rotate every 5s
   ══════════════════════════════════════════════════════════════ */
const heroSlides = [
  {
    bg: 'from-pink-500 to-rose-600',
    badge: 'NUEVO',
    title: 'Gaming Digital',
    subtitle: 'V-Bucks, Robux y mas. Codigos al instante.',
    cta: 'Comprar ahora',
    ctaColor: 'text-rose-600',
    emoji: '🎮',
  },
  {
    bg: 'from-violet-600 to-purple-700',
    badge: 'OFERTA',
    title: 'Streaming Premium',
    subtitle: 'Netflix, Spotify, Disney+ con descuentos exclusivos.',
    cta: 'Ver ofertas',
    ctaColor: 'text-violet-600',
    emoji: '🎬',
  },
  {
    bg: 'from-emerald-500 to-teal-600',
    badge: 'DESTACADO',
    title: 'Gift Cards',
    subtitle: 'PlayStation, Xbox, Nintendo, Steam y muchas mas.',
    cta: 'Explorar',
    ctaColor: 'text-emerald-600',
    emoji: '🎁',
  },
  {
    bg: 'from-amber-500 to-orange-600',
    badge: 'HOT',
    title: 'Suscripciones',
    subtitle: 'Discord Nitro, YouTube Premium, Canva Pro y mas.',
    cta: 'Descubrir',
    ctaColor: 'text-amber-600',
    emoji: '👑',
  },
];

function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = heroSlides.length;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const next = useCallback(() => setCurrent((p) => (p + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + total) % total), [total]);

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(next, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next, isPaused]);

  const slide = heroSlides[current];

  return (
    <section
      className="mx-auto max-w-7xl px-3 sm:px-6 mt-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative rounded-2xl overflow-hidden">
        {/* Slides container */}
        <div className="relative h-[180px] sm:h-[260px] md:h-[320px] lg:h-[380px]">
          {heroSlides.map((s, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={s.title}
              className={`absolute inset-0 bg-gradient-to-r ${s.bg} transition-all duration-700 ease-in-out flex items-center ${
                i === current ? 'opacity-100 translate-x-0' : i < current ? 'opacity-0 -translate-x-8' : 'opacity-0 translate-x-8'
              }`}
              aria-hidden={i !== current}
            >
              <div className="px-5 sm:px-10 md:px-14 lg:px-16 max-w-xl z-10">
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full mb-2 sm:mb-3 uppercase tracking-wider">
                  {s.badge}
                </span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-1.5 sm:mb-2">
                  {s.title}
                </h2>
                <p className="text-white/90 text-xs sm:text-sm md:text-base mb-4 sm:mb-5 max-w-md line-clamp-2 sm:line-clamp-none">
                  {s.subtitle}
                </p>
                <button className={`bg-white ${s.ctaColor} px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-1.5 sm:gap-2`}>
                  {s.cta}
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
              <div className="absolute right-6 sm:right-10 md:right-16 bottom-4 text-7xl sm:text-8xl md:text-9xl opacity-20 select-none">
                {s.emoji}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prev}
          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-6 bg-white' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   FEATURE ICONS — 4 white cards with shadow-sm
   ══════════════════════════════════════════════════════════════ */
const features = [
  {
    icon: <Zap className="w-5 h-5 text-amber-500" />,
    title: 'Entrega Instantanea',
    subtitle: 'Recibe tu codigo al momento de comprar',
    bg: 'bg-amber-50',
  },
  {
    icon: <Shield className="w-5 h-5 text-emerald-500" />,
    title: 'Pago Seguro',
    subtitle: 'Transacciones protegidas y encriptadas',
    bg: 'bg-emerald-50',
  },
  {
    icon: <Headphones className="w-5 h-5 text-blue-500" />,
    title: 'Soporte 24/7',
    subtitle: 'Estamos aqui para ayudarte siempre',
    bg: 'bg-blue-50',
  },
  {
    icon: <RotateCcw className="w-5 h-5 text-rose-500" />,
    title: 'Garantia de Reembolso',
    subtitle: '30 dias para devolver si no estas satisfecho',
    bg: 'bg-rose-50',
  },
];

function FeatureIcons() {
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 mt-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {features.map((f, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5 flex items-start gap-3 sm:gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 rounded-full ${f.bg} flex items-center justify-center shrink-0`}>
              {f.icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{f.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   CATEGORY GRID — horizontal scroll mobile, grid desktop
   ══════════════════════════════════════════════════════════════ */
const categoryEmojis: Record<string, string> = {
  gaming: '🎮',
  streaming: '📺',
  giftcards: '🎁',
  software: '💻',
  subscriptions: '🔄',
};

const extraCategories = [
  { id: 'vbucks', name: 'V-Bucks', emoji: '🔫' },
  { id: 'robux', name: 'Robux', emoji: '🧱' },
  { id: 'netflix', name: 'Netflix', emoji: '🎬' },
  { id: 'spotify', name: 'Spotify', emoji: '🎵' },
  { id: 'playstation', name: 'PlayStation', emoji: '🎮' },
  { id: 'xbox', name: 'Xbox', emoji: '🟢' },
  { id: 'steam', name: 'Steam', emoji: '💧' },
  { id: 'nintendo', name: 'Nintendo', emoji: '🍄' },
  { id: 'discord', name: 'Discord Nitro', emoji: '💬' },
  { id: 'youtube', name: 'YouTube Premium', emoji: '▶️' },
];

function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Comprar por categoria</h2>
        <Link
          href="/tienda"
          className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
        >
          Ver todo
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 lg:grid lg:grid-cols-6 lg:overflow-visible lg:pb-0">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/tienda?categoria=${cat.id}`}
            className="flex-shrink-0 w-[110px] sm:w-[130px] bg-white rounded-xl border border-gray-100 p-4 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-200 group"
          >
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
              {categoryEmojis[cat.id] || '📦'}
            </div>
            <span className="text-[13px] font-medium text-gray-800 group-hover:text-amber-600 transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
        {extraCategories.map((cat) => (
          <Link
            key={cat.id}
            href={`/tienda?categoria=${cat.id}`}
            className="flex-shrink-0 w-[110px] sm:w-[130px] bg-white rounded-xl border border-gray-100 p-4 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-200 group"
          >
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
              {cat.emoji}
            </div>
            <span className="text-[13px] font-medium text-gray-800 group-hover:text-amber-600 transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   PRODUCT CARD — reusable for Deals, Featured, New Arrivals
   ══════════════════════════════════════════════════════════════ */
function ProductCard({ product, compact = false }: { product: typeof PRODUCTS[0]; compact?: boolean }) {
  const { addToCart } = useStore();
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const [wished, setWished] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 group flex flex-col">
      {/* Image area */}
      <Link href={`/tienda/producto/${product.id}`} className="relative block overflow-hidden bg-gray-50" style={{ aspectRatio: compact ? '4/3' : '1/1' }}>
        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md z-10">
            -{discount}%
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setWished(!wished);
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 hover:bg-white transition-colors shadow-sm"
        >
          <Heart className={`w-4 h-4 transition-colors ${wished ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>

        {/* Image */}
        {!imgError ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Package className="w-12 h-12 text-gray-300" />
          </div>
        )}

        {/* Hover overlay with Quick View & Compare */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center gap-2 pb-3">
          <Link
            href={`/tienda/producto/${product.id}`}
            className="bg-white text-gray-800 text-[11px] font-semibold px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-gray-100 transition-colors"
          >
            <Eye className="w-3 h-3" />
            Vista rapida
          </Link>
          <button className="bg-white text-gray-800 text-[11px] font-semibold px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-gray-100 transition-colors">
            <GitCompare className="w-3 h-3" />
            Comparar
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1">
        {/* Platform / Subcategory */}
        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
          {product.platform || product.subcategory}
        </span>

        {/* Title */}
        <Link href={`/tienda/producto/${product.id}`}>
          <h3 className="text-sm font-semibold text-gray-900 mt-1 line-clamp-2 hover:text-amber-600 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center gap-0.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-gray-700">{product.rating}</span>
          </div>
          <span className="text-[11px] text-gray-400">
            ({product.reviews.toLocaleString('es')})
          </span>
          {product.sold > 0 && (
            <span className="text-[11px] text-gray-400">
              · {product.sold >= 1000 ? `${(product.sold / 1000).toFixed(1)}k` : product.sold} vendidos
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-base font-bold text-gray-900">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>

        {/* Delivery time */}
        {product.deliveryTime && (
          <div className="flex items-center gap-1 mt-1.5">
            <Zap className="w-3 h-3 text-emerald-500" />
            <span className="text-[11px] text-emerald-600 font-medium">{product.deliveryTime}</span>
          </div>
        )}

        {/* Add to cart */}
        <button
          onClick={() => addToCart(product)}
          className="mt-3 w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg h-10 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DEALS SECTION — rose-50/50 bg, horizontal scroll, Flame icon
   ══════════════════════════════════════════════════════════════ */
function DealsSection() {
  const deals = PRODUCTS.filter((p) => p.originalPrice && p.originalPrice > p.price).slice(0, 12);

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 mt-8">
      <div className="bg-rose-50/50 rounded-xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Flame className="w-6 h-6 text-red-500" />
            <h2 className="text-xl sm:text-2xl font-bold text-rose-700">Ofertas del dia</h2>
            <span className="bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Tiempo limitado
            </span>
          </div>
          <Link
            href="/tienda?ofertas=true"
            className="text-sm font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            Ver mas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {deals.map((p) => (
            <div key={p.id} className="flex-shrink-0 w-[170px] sm:w-[210px]">
              <ProductCard product={p} compact />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   FEATURED PRODUCTS — 2/3/4 col grid
   ══════════════════════════════════════════════════════════════ */
function FeaturedProducts() {
  const featured = PRODUCTS.filter((p) => p.featured).slice(0, 8);

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Productos destacados</h2>
        <Link
          href="/tienda"
          className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
        >
          Ver mas
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {featured.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   CTA BANNERS — Z Prime (violet) + Trade-in (amber)
   ══════════════════════════════════════════════════════════════ */
function CTABanners() {
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 mt-8">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Z Prime banner */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 overflow-hidden relative">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -right-2 -bottom-2 w-20 h-20 bg-white/10 rounded-full" />
          <div className="flex-1 z-10">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-amber-300" />
              <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">DigiStore Prime</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
              Ahorra hasta un 20% extra
            </h3>
            <p className="text-white/80 text-sm mb-4">
              Suscribete a DigiStore Prime y obtén descuentos exclusivos en todos los productos digitales.
            </p>
            <button className="bg-white text-violet-600 px-5 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2">
              Probar gratis
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="text-7xl sm:text-8xl opacity-30 select-none z-0">
            👑
          </div>
        </div>

        {/* Trade-in banner */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 overflow-hidden relative">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -right-2 -bottom-2 w-20 h-20 bg-white/10 rounded-full" />
          <div className="flex-1 z-10">
            <div className="flex items-center gap-2 mb-2">
              <Ticket className="w-6 h-6 text-white" />
              <span className="text-white/90 text-xs font-bold uppercase tracking-wider">Cupones</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
              Cupones disponibles hoy
            </h3>
            <p className="text-white/80 text-sm mb-4">
              Usa el codigo DIGI10 y obtén 10% de descuento en tu primera compra. ¡No te lo pierdas!
            </p>
            <button className="bg-white text-amber-600 px-5 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2">
              Canjear cupon
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="text-7xl sm:text-8xl opacity-30 select-none z-0">
            🎟️
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   NEW ARRIVALS
   ══════════════════════════════════════════════════════════════ */
function NewArrivals() {
  const arrivals = PRODUCTS.filter((p) => p.tags?.includes('nuevo') || p.sold < 500).slice(0, 8);
  const fallback = arrivals.length < 4 ? PRODUCTS.filter((p) => !p.featured).slice(0, 8) : arrivals;
  const items = fallback.length >= 4 ? fallback : PRODUCTS.slice(8, 16);

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Nuevos ingresos</h2>
        </div>
        <Link
          href="/tienda"
          className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
        >
          Ver mas
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER — bg-[#212529], 4 columns, email subscribe, social
   ══════════════════════════════════════════════════════════════ */
function Footer() {
  const [email, setEmail] = useState('');

  return (
    <footer className="bg-[#212529] text-gray-300 mt-12">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Logo + description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-lg font-extrabold text-white">DigiStore</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Tu tienda de productos digitales de confianza. Codigos instantaneos, los mejores precios y atencion 24/7.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-amber-500 flex items-center justify-center transition-colors group">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-amber-500 flex items-center justify-center transition-colors group">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-amber-500 flex items-center justify-center transition-colors group">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-amber-500 flex items-center justify-center transition-colors group">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Productos */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Productos</h4>
            <ul className="space-y-2.5">
              <li><Link href="/tienda?categoria=gaming" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Gaming</Link></li>
              <li><Link href="/tienda?categoria=streaming" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Tarjetas Streaming</Link></li>
              <li><Link href="/tienda?categoria=giftcards" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Gift Cards</Link></li>
              <li><Link href="/tienda?categoria=software" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Software</Link></li>
              <li><Link href="/tienda?categoria=subscriptions" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Suscripciones</Link></li>
              <li><Link href="/tienda?ofertas=true" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Ofertas</Link></li>
            </ul>
          </div>

          {/* Column 3: Soporte */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Soporte</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Centro de ayuda</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Como comprar</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Como redimir codigos</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Politica de reembolso</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Contacto</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Column 4: Legal + Email */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2.5 mb-6">
              <li><a href="#" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Terminos y condiciones</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Politica de privacidad</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Cookies</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Aviso legal</a></li>
            </ul>

            {/* Email subscribe */}
            <h4 className="text-white font-semibold text-sm mb-2">Recibe ofertas</h4>
            <p className="text-xs text-gray-400 mb-3">Suscribete y recibe descuentos exclusivos.</p>
            <div className="flex rounded-lg overflow-hidden">
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-gray-800 border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-amber-500 transition-colors"
              />
              <button className="px-3 bg-amber-500 hover:bg-amber-600 transition-colors flex items-center">
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700/50 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} DigiStore. Todos los derechos reservados. Productos digitales al instante.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Pago seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gray-700 rounded px-2 py-1 text-[10px] text-gray-300 font-medium">VISA</div>
              <div className="bg-gray-700 rounded px-2 py-1 text-[10px] text-gray-300 font-medium">MC</div>
              <div className="bg-gray-700 rounded px-2 py-1 text-[10px] text-gray-300 font-medium">AMEX</div>
              <div className="bg-gray-700 rounded px-2 py-1 text-[10px] text-gray-300 font-medium">PayPal</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}



/* ══════════════════════════════════════════════════════════════
   TRUST STRIP — simple trust badges above footer
   ══════════════════════════════════════════════════════════════ */
function TrustStrip() {
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 mt-8 mb-4">
      <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-medium text-gray-700">Productos 100% oficiales</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">Pagos seguros SSL</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-medium text-gray-700">Entrega instantanea</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-violet-500" />
          <span className="text-sm font-medium text-gray-700">Garantia de compra</span>
        </div>
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-rose-500" />
          <span className="text-sm font-medium text-gray-700">Soporte 24/7</span>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE — assembling all sections
   ══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAFAFA' }}>
      <AnnouncementBar />
      <Header />
      <CategoryNav />
      <main className="flex-1">
        <HeroCarousel />
        <FeatureIcons />
        <CategoryGrid />
        <DealsSection />
        <FeaturedProducts />
        <CTABanners />
        <NewArrivals />
        <TrustStrip />
      </main>

      <Footer />
      <AIChatWidget />
      <CartDrawer />
      <AuthDialog />

      {/* Custom scrollbar hide utility */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
