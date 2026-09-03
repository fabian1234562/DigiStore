'use client';

import { useStore } from '@/lib/store';
import dynamic from 'next/dynamic';
const CartDrawer = dynamic(() => import('@/components/store/CartDrawer').then(m => ({ default: m.CartDrawer })), { ssr: false });
const AuthDialog = dynamic(() => import('@/components/auth/AuthDialog').then(m => ({ default: m.AuthDialog })), { ssr: false });
const ProductDetail = dynamic(() => import('@/components/store/ProductDetailModal').then(m => ({ default: m.ProductDetailModal })), { ssr: false });
import {
  ShoppingCart, Search, Zap, Shield, Headphones, LogIn,
  ArrowRight, Sparkles, CreditCard, Flame, Heart, Star, X,
  ChevronLeft, ChevronRight, Truck, RotateCcw, Globe, Tag,
  Menu, Eye, Gamepad2, Crown, Clock, Package, Check, Send,
  Monitor, Download, Sword, Puzzle, Car, Target, Users, TrendingUp,
  MousePointerClick, Gift, DollarSign, Percent, Layers, Cpu, BookOpen,
  Wallet, Bitcoin,
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';

/* ══════════════════════════════════════════════════════════════
   TIPOS
   ══════════════════════════════════════════════════════════════ */
interface GameProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory: string;
  image: string;
  rating: number;
  reviews: number;
  sold: number;
  deliveryTime: string;
  platform: string;
  region: string;
  tags: string[];
  stock: number;
  featured: boolean;
}

/* ══════════════════════════════════════════════════════════════
   ANNOUNCEMENT BAR
   ══════════════════════════════════════════════════════════════ */
function AnnouncementBar() {
  return (
    <div className="bg-gradient-to-r from-violet-950 via-indigo-950 to-purple-950 text-white text-xs relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white,transparent_50%)]" />
      <div className="relative mx-auto flex max-w-7xl items-center justify-between h-9 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline font-medium">Entrega instantánea en pedidos digitales</span>
          <span className="sm:hidden font-medium">Entrega instantánea</span>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <span className="flex items-center gap-1.5 font-medium">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            100% productos verificados
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Precios desde <strong className="text-amber-300">$1</strong></span>
          </span>
        </div>
        <span className="md:hidden flex items-center gap-1 font-bold text-amber-300">
          $1+
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HEADER — Premium responsive
   ══════════════════════════════════════════════════════════════ */
function Header() {
  const { cartOpen, setCartOpen, authOpen, setAuthOpen, cartCount } = useStore();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  // Cerrar menu mobile con Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenu(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Bloquear scroll del body cuando menu mobile esta abierto
  useEffect(() => {
    if (mobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenu]);

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass shadow-premium border-b border-violet-100/50'
          : 'bg-white border-b border-transparent'
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
          {/* Lado izquierdo: Logo + Botón menu mobile */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-violet-50 transition-colors"
              onClick={() => setMobileMenu(true)}
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-105 group-hover:rotate-3 transition-transform">
                <Gamepad2 className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white" style={{ width: '20px', height: '20px' }} />
                {/* Glow interior */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-extrabold leading-none text-gradient-violet">DigiStore</span>
                <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium leading-none mt-0.5 hidden sm:block">Productos Digitales</span>
              </div>
            </Link>
          </div>

          {/* Centro: Nav desktop con 4 items */}
          <nav className="hidden lg:flex items-center gap-0.5 text-sm font-medium">
            <Link href="/" className="px-3.5 py-2 rounded-lg text-gray-700 hover:text-violet-700 hover:bg-violet-50 transition-colors">Inicio</Link>
            <Link href="/juegos-gratis?tab=juegos" className="px-3.5 py-2 rounded-lg text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-1.5">
              Juegos
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">F2P</span>
            </Link>
            <Link href="/apps-open-source" className="px-3.5 py-2 rounded-lg text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Apps
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">33</span>
            </Link>
            <Link href="/tienda" className="px-3.5 py-2 rounded-lg text-gray-700 hover:text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-1.5">
              Tienda
              <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">$1+</span>
            </Link>
          </nav>

          {/* Lado derecho: Cart + Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              className="relative p-2.5 rounded-xl hover:bg-violet-50 transition-colors group"
              onClick={() => setCartOpen(true)}
              aria-label="Abrir carrito"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-violet-700 transition-colors" />
              {cartCount() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-violet-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white animate-fade-in">
                  {cartCount()}
                </span>
              )}
            </button>
            <button
              className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-105"
              onClick={() => setAuthOpen(true)}
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Entrar</span>
            </button>
            <button
              className="sm:hidden p-2.5 rounded-xl hover:bg-violet-50 transition-colors"
              onClick={() => setAuthOpen(true)}
              aria-label="Iniciar sesion"
            >
              <LogIn className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </header>

      {/* ═══ Mobile menu overlay (drawer premium) ═══ */}
      {mobileMenu && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          {/* Backdrop con blur */}
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileMenu(false)}
          />
          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-white shadow-premium-lg flex flex-col animate-slide-up">
            {/* Header del drawer */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-extrabold text-gradient-violet">DigiStore</span>
              </div>
              <button
                onClick={() => setMobileMenu(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Cerrar menu"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            {/* Items del menu */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                onClick={() => setMobileMenu(false)}
              >
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-violet-600" />
                </div>
                Inicio
              </Link>
              <Link
                href="/juegos-gratis?tab=juegos"
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                onClick={() => setMobileMenu(false)}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Gift className="w-4 h-4 text-emerald-600" />
                </div>
                Juegos Gratis
                <span className="ml-auto bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">F2P</span>
              </Link>
              <Link
                href="/apps-open-source"
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                onClick={() => setMobileMenu(false)}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Download className="w-4 h-4 text-blue-600" />
                </div>
                Apps Open Source
                <span className="ml-auto bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">33</span>
              </Link>
              <Link
                href="/tienda"
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                onClick={() => setMobileMenu(false)}
              >
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                  <Tag className="w-4 h-4 text-rose-600" />
                </div>
                Tienda
                <span className="ml-auto bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">$1+</span>
              </Link>
            </nav>
            {/* Footer del drawer */}
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => { setMobileMenu(false); setAuthOpen(true); }}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-md"
              >
                <LogIn className="w-4 h-4" /> Entrar / Registrarse
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


/* ══════════════════════════════════════════════════════════════
   HERO PRINCIPAL — Grande, impactante, con imagen de fondo +
     imagen del producto destacado visible
   ══════════════════════════════════════════════════════════════ */
function HeroSection({ games, gamesCount, valueTotal }: { games: GameProduct[]; gamesCount: number; valueTotal: number }) {
  const topGame = games.length > 0 ? games.reduce((a, b) => (b.originalPrice || 0) > (a.originalPrice || 0) ? b : a) : null;
  const [current, setCurrent] = useState(0);

  const heroSlides = topGame ? [
    {
      title: topGame.name,
      desc: topGame.description,
      image: topGame.image,
      originalPrice: topGame.originalPrice,
      sellPrice: topGame.price,
      gradient: 'from-violet-950/95 via-indigo-950/90 to-purple-950/80',
      badge: 'DESTACADO DE LA SEMANA',
      badgeColor: 'bg-amber-500',
      cta: 'Ver Detalle',
      href: '#',
    },
    {
      title: 'Juegos y Software Gratis',
      desc: `Escaneamos ${gamesCount} productos en Epic Games, Prime Gaming, GOG, Steam y mas. Juegos + licencias de software con 100% ganancia para ti.`,
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/1364780/capsule_616x353.jpg',
      originalPrice: valueTotal,
      sellPrice: 0,
      gradient: 'from-emerald-950/95 via-teal-950/90 to-green-950/80',
      badge: `${gamesCount} PRODUCTOS GRATIS`,
      badgeColor: 'bg-emerald-500',
      cta: 'Ver Juegos Gratis',
      href: '/juegos-gratis',
    },
    {
      title: 'Ganancia del 100%',
      desc: `Valor total: $${valueTotal.toFixed(0)} USD. Productos obtenidos gratis y revendidos sin inventario, sin proveedores, sin riesgo. Puro beneficio.`,
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/1408650/capsule_616x353.jpg',
      originalPrice: valueTotal,
      sellPrice: 0,
      gradient: 'from-amber-950/95 via-orange-950/90 to-red-950/80',
      badge: 'SIN INVENTARIO',
      badgeColor: 'bg-orange-500',
      cta: 'Ir a la Tienda',
      href: '/tienda',
    },
  ] : [
    {
      title: 'Juegos y Software Gratis',
      desc: `Escaneamos ${gamesCount} productos en Epic Games, Prime Gaming, GOG, Steam y mas.`,
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/1364780/capsule_616x353.jpg',
      originalPrice: valueTotal,
      sellPrice: 0,
      gradient: 'from-violet-950/95 via-indigo-950/90 to-purple-950/80',
      badge: `${gamesCount} PRODUCTOS`,
      badgeColor: 'bg-amber-500',
      cta: 'Explorar',
      href: '/juegos-gratis',
    },
  ];

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % heroSlides.length), 6000);
    return () => clearInterval(t);
  }, [heroSlides.length]);

  const slide = heroSlides[current];
  const discount = slide.originalPrice && slide.originalPrice > 0 && slide.sellPrice > 0
    ? Math.round((1 - slide.sellPrice / slide.originalPrice) * 100) : 0;

  return (
    <div className="relative overflow-hidden bg-gray-900">
      <div className="absolute inset-0">
        <img src={slide.image} alt="" className="w-full h-full object-cover transition-opacity duration-1000" loading="eager" />
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center min-h-[480px] sm:min-h-[500px] lg:min-h-[560px] gap-6 lg:gap-10 py-10 sm:py-14 lg:py-16">
          {/* Left: Text content */}
          <div className="flex-1 text-white max-w-xl animate-fade-in">
            <div className={`inline-flex items-center gap-1.5 ${slide.badgeColor} text-white text-[10px] sm:text-[11px] font-bold px-3 py-1.5 rounded-full mb-5 tracking-wide shadow-lg`}>
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {slide.badge}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-[1.1] drop-shadow-xl">
              {slide.title}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-white/85 mb-6 sm:mb-8 leading-relaxed drop-shadow-md max-w-md line-clamp-3 sm:line-clamp-none">
              {slide.desc}
            </p>
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <Link
                href={slide.href}
                className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl hover:bg-violet-50 transition-all text-sm shadow-2xl hover:scale-105"
              >
                {slide.cta} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tienda"
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white font-semibold px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl hover:bg-white/25 transition-all text-sm border border-white/20"
              >
                <Eye className="w-4 h-4" /> Ver Tienda
              </Link>
            </div>
          </div>

          {/* Right: Featured product image card */}
          {topGame && (
            <div className="w-full lg:w-[360px] shrink-0 animate-slide-up">
              <div className="relative rounded-2xl overflow-hidden shadow-premium-lg border border-white/10 group">
                <div className="aspect-[16/10] bg-gray-800">
                  <img src={topGame.image} alt={topGame.name} width={616} height={353}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="eager" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-0.5">{topGame.subcategory}</p>
                      <h3 className="text-white font-bold text-sm line-clamp-1">{topGame.name}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400 line-through">${(topGame.originalPrice || 0).toFixed(2)}</p>
                      <p className="text-lg font-black text-emerald-400">${topGame.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {heroSlides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-white w-8' : 'bg-white/30 hover:bg-white/50 w-2.5'}`} />
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CATEGORÍAS — Barra horizontal con iconos e imágenes
   ══════════════════════════════════════════════════════════════ */
function CategoryBar({ games }: { games: GameProduct[] }) {
  const categories = [
    { name: 'Todos', icon: Layers, href: '/tienda', image: 'https://cdn.akamai.steamstatic.com/steam/apps/1364780/capsule_616x353.jpg', count: games.length },
    { name: 'Accion', icon: Sword, href: '/tienda', image: 'https://cdn.akamai.steamstatic.com/steam/apps/1426210/capsule_616x353.jpg', count: games.filter(g => g.tags.some(t => t.includes('action'))).length },
    { name: 'RPG', icon: Crown, href: '/tienda', image: 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/capsule_616x353.jpg', count: games.filter(g => g.tags.some(t => t.includes('rpg'))).length },
    { name: 'Aventura', icon: Puzzle, href: '/tienda', image: 'https://cdn.akamai.steamstatic.com/steam/apps/1659420/capsule_616x353.jpg', count: games.filter(g => g.tags.some(t => t.includes('adventure'))).length },
    { name: 'Carreras', icon: Car, href: '/tienda', image: 'https://cdn.akamai.steamstatic.com/steam/apps/1551360/capsule_616x353.jpg', count: games.filter(g => g.tags.some(t => t.includes('racing'))).length },
    { name: 'Estrategia', icon: Target, href: '/tienda', image: 'https://cdn.akamai.steamstatic.com/steam/apps/1147560/capsule_616x353.jpg', count: games.filter(g => g.tags.some(t => t.includes('strategy'))).length },
    { name: 'Indie', icon: Heart, href: '/tienda', image: 'https://cdn.akamai.steamstatic.com/steam/apps/1057090/capsule_616x353.jpg', count: games.filter(g => g.tags.some(t => t.includes('indie'))).length },
    { name: 'Software', icon: Monitor, href: '/tienda', image: 'https://cdn.akamai.steamstatic.com/steam/apps/736260/capsule_616x353.jpg', count: games.filter(g => g.category === 'Software y Licencias').length },
  ];

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 py-6">
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {categories.map((cat) => (
          <Link key={cat.name} href={cat.href} className="group flex flex-col items-center gap-2 py-3 px-2 rounded-2xl hover:bg-violet-50 transition-all hover:shadow-md">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" loading="lazy" width={100} height={100} decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <cat.icon className="absolute bottom-1 right-1 w-4 h-4 text-white drop-shadow-md" />
            </div>
            <div className="text-center">
              <p className="text-[11px] sm:text-xs font-bold text-gray-700 group-hover:text-violet-600 transition-colors">{cat.name}</p>
              <p className="text-[9px] text-gray-400">{cat.count}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   FEATURES VISUALES — 100% Ganancia, Entrega, etc. con imágenes
   ══════════════════════════════════════════════════════════════ */
function FeatureBanners({ gamesCount, valueTotal }: { gamesCount: number; valueTotal: number }) {
  const features = [
    {
      icon: DollarSign,
      title: '100% Ganancia',
      desc: `Productos obtenidos gratis y revendidos. Sin inventario, sin riesgo. $${valueTotal.toFixed(0)} USD en valor total.`,
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/1504530/capsule_616x353.jpg',
      gradient: 'from-violet-600 via-purple-600 to-indigo-700',
      stat: `$${valueTotal.toFixed(0)}`,
      statLabel: 'Valor Total',
      cta: 'Ir a Tienda',
      href: '/tienda',
    },
    {
      icon: Send,
      title: 'Entrega Instantanea',
      desc: 'Pago aprobado = producto entregado al instante. MercadoPago, PayPal, Bitcoin y USDT disponibles 24/7.',
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/1408650/capsule_616x353.jpg',
      gradient: 'from-emerald-600 via-teal-600 to-green-700',
      stat: '< 1 min',
      statLabel: 'Tiempo Entrega',
      cta: 'Comprar Ahora',
      href: '/juegos-gratis',
    },
    {
      icon: Download,
      title: 'Juegos y Software Gratis',
      desc: `Escaneamos 8 plataformas automaticamente. ${gamesCount} productos siempre disponibles sin costo.`,
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/1147560/capsule_616x353.jpg',
      gradient: 'from-amber-500 via-orange-500 to-red-600',
      stat: `${gamesCount}`,
      statLabel: 'Productos',
      cta: 'Ver Juegos Gratis',
      href: '/juegos-gratis',
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 py-4">
      <div className="grid md:grid-cols-3 gap-4">
        {features.map((f) => (
          <Link key={f.title} href={f.href} className="group relative overflow-hidden rounded-2xl min-h-[220px] block">
            {/* Background image */}
            <img src={f.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" decoding="async" />
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-90`} />
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1),transparent_50%)]" />
            
            <div className="relative h-full flex flex-col justify-between p-5 sm:p-6 min-h-[220px]">
              <div>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm mb-3">
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white mb-2 drop-shadow-lg">{f.title}</h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed line-clamp-3">{f.desc}</p>
              </div>
              <div className="flex items-end justify-between mt-4">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-white">{f.stat}</p>
                  <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider font-semibold">{f.statLabel}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-lg group-hover:scale-105 transition-transform shadow-lg">
                  {f.cta} <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   PRODUCT CARD — Con descripción visible, al click abre detalle
   ══════════════════════════════════════════════════════════════ */
function GameCard({ game, compact = false, onShowDetail }: { game: GameProduct; compact?: boolean; onShowDetail?: (g: GameProduct) => void }) {
  const { addToCart, setSelectedProduct, setProductDetailOpen } = useStore();
  const discount = game.originalPrice && game.originalPrice > 0
    ? Math.round((1 - game.price / game.originalPrice) * 100) : 0;

  const handleClick = () => {
    if (onShowDetail) {
      onShowDetail(game);
    } else {
      setSelectedProduct(game as any);
      setProductDetailOpen(true);
    }
  };

  return (
    <div className={`group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer ${compact ? 'w-64 shrink-0' : ''}`}
      onClick={handleClick}>
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
        <img src={game.image} alt={game.name} width={616} height={353} decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {discount > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg">-{discount}%</span>
        )}
        <span className="absolute top-2.5 right-2.5 bg-violet-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg">DIGISTORE</span>
        {/* Hover overlay with eye icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
      <div className="p-3.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">{game.subcategory}</p>
          {game.rating >= 4 && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
        </div>
        <h3 className="font-bold text-sm leading-tight mb-1.5 line-clamp-2 group-hover:text-violet-600 transition-colors">{game.name}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{game.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-violet-600">${game.price.toFixed(2)}</span>
            {game.originalPrice && game.originalPrice > game.price && (
              <span className="text-xs text-gray-400 line-through">${game.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <button onClick={(e) => { e.stopPropagation(); addToCart(game as any); }}
            className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-all hover:scale-105 shadow-md shadow-violet-500/20">
            Comprar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECCION DE PRODUCTOS DESTACADOS
   ══════════════════════════════════════════════════════════════ */
function FeaturedSection({ games, title, subtitle, icon: Icon, filterFn, href, ctaText, columns = 4 }: {
  games: GameProduct[];
  title: string;
  subtitle: string;
  icon: React.ElementType;
  filterFn: (g: GameProduct) => boolean;
  href: string;
  ctaText: string;
  columns?: number;
}) {
  const items = games.filter(filterFn).slice(0, 8);
  if (items.length === 0) return null;
  const colClass = columns === 5 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">{title}</h2>
            <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>
        <Link href={href} className="text-sm font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 group">
          {ctaText} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <div className={`grid ${colClass} gap-4`}>
        {items.map(g => <GameCard key={g.id} game={g} />)}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   OFERTAS DEL DIA — Scroll horizontal con cards compactos
   ══════════════════════════════════════════════════════════════ */
function DealsCarousel({ games }: { games: GameProduct[] }) {
  const deals = games.filter(g => g.price <= 2.99).slice(0, 12);
  if (deals.length === 0) return null;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollL, setCanScrollL] = useState(false);
  const [canScrollR, setCanScrollR] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollL(el.scrollLeft > 10);
    setCanScrollR(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir: 'l' | 'r') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'l' ? -300 : 300, behavior: 'smooth' });
  };

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Ofertas del Dia</h2>
            <p className="text-xs sm:text-sm text-gray-500">Juegos desde $1.99 — ganancia directa</p>
          </div>
        </div>
        <Link href="/tienda" className="text-sm font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 group">
          Ver mas <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <div className="relative group/carousel">
        {canScrollL && (
          <button onClick={() => scroll('l')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-xl border flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-gray-50">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div ref={scrollRef} onScroll={checkScroll} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {deals.map(g => <GameCard key={g.id} game={g} compact />)}
        </div>
        {canScrollR && (
          <button onClick={() => scroll('r')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-xl border flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-gray-50">
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   FREE GAMES SECTION — Juegos 100% GRATIS para reclamar
   ══════════════════════════════════════════════════════════════ */
function FreeGamesSection({ freeGames }: { freeGames: GameProduct[] }) {
  // Top 8 más populares por rating + sold
  const popularFree = useMemo(
    () => [...freeGames]
      .sort((a, b) => ((b.rating || 0) * 1000 + (b.sold || 0)) - ((a.rating || 0) * 1000 + (a.sold || 0)))
      .slice(0, 8),
    [freeGames]
  );
  if (popularFree.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 py-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700 p-6 sm:p-8 shadow-xl">
        {/* Pattern decorativo */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,white,transparent_60%)]" />
        <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_15px,white_15px,white_16px)]" />

        <div className="relative">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3">
                <Gift className="w-3.5 h-3.5" /> 100% GRATIS · CORTESÍA DIGISTORE
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 flex items-center gap-2">
                <Flame className="w-7 h-7 text-amber-300" />
                Juegos Gratis Más Populares
              </h2>
              <p className="text-sm text-white/85">
                {freeGames.length} productos gratis para reclamar · Sin costo, sin trucos · Te regalamos los más jugados del mundo
              </p>
            </div>
            <Link href="/juegos-gratis"
              className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-50 transition-all shadow-lg hover:scale-105 text-sm whitespace-nowrap">
              Ver todos los {freeGames.length} gratis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Grid de juegos gratis */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {popularFree.map(game => (
              <FreeGameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   FREE GAME CARD — Card compacta para juegos gratis (estilo emerald)
   ══════════════════════════════════════════════════════════════ */
function FreeGameCard({ game }: { game: GameProduct }) {
  const { setSelectedProduct, setProductDetailOpen } = useStore();
  const handleClick = () => {
    setSelectedProduct(game as any);
    setProductDetailOpen(true);
  };
  return (
    <div
      onClick={handleClick}
      className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] bg-gray-800 overflow-hidden">
        <img
          src={game.image}
          alt={game.name}
          width={616}
          height={353}
          decoding="async"
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={e => { (e.target as HTMLImageElement).src = '/products/gen/gaming-cat.png'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {/* Badge 100% GRATIS */}
        <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg">
          100% GRATIS
        </span>
        {/* Rating */}
        {game.rating >= 4 && (
          <span className="absolute top-2 right-2 bg-amber-400 text-gray-900 text-[10px] font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-gray-900" /> {game.rating}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
          {game.subcategory}
        </p>
        <h3 className="font-bold text-sm leading-tight mb-1 line-clamp-2 text-gray-900 group-hover:text-emerald-700 transition-colors">
          {game.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-base font-black text-emerald-600">$0.00</span>
          <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
            <Gift className="w-3 h-3" /> Reclamar
          </span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   GRAN BANNER CTA — Imagen de fondo, estadísticas, CTA
   ══════════════════════════════════════════════════════════════ */
function BigCTABanner({ gamesCount, valueTotal }: { gamesCount: number; valueTotal: number }) {
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 py-4">
      <div className="relative overflow-hidden rounded-3xl min-h-[200px]">
        <img src="https://cdn.akamai.steamstatic.com/steam/apps/736260/capsule_616x353.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/95 via-indigo-900/90 to-purple-900/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(99,102,241,0.3),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-6 sm:px-10 py-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-white max-w-lg">
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-[11px] font-bold text-white px-3 py-1 rounded-full mb-3 tracking-wide">
              <TrendingUp className="w-3.5 h-3.5" /> NEGOCIO DIGITAL SIN INVERSION
            </div>
            <h3 className="text-2xl sm:text-3xl font-black mb-2">Empieza a vender hoy mismo</h3>
            <p className="text-sm text-white/75 leading-relaxed">{gamesCount} productos listos para revender. Escaneo automatico de 8 plataformas. 100% ganancia, 0 inversion.</p>
          </div>
          <div className="flex items-center gap-6 sm:gap-8 shrink-0">
            <div className="text-center text-white">
              <p className="text-3xl sm:text-4xl font-black">{gamesCount}</p>
              <p className="text-[10px] uppercase tracking-wider text-white/60 font-bold">Productos</p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center text-white">
              <p className="text-3xl sm:text-4xl font-black">${valueTotal.toFixed(0)}</p>
              <p className="text-[10px] uppercase tracking-wider text-white/60 font-bold">Valor USD</p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <Link href="/tienda" className="bg-white text-violet-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-gray-100 transition-all hover:scale-105 shadow-xl whitespace-nowrap">
              Empezar <ArrowRight className="w-4 h-4 inline" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   RECOMENDACIONES — Productos relacionados con etiquetas
   ══════════════════════════════════════════════════════════════ */
function Recommendations({ games, currentGame }: { games: GameProduct[]; currentGame: GameProduct | null }) {
  if (!currentGame) return null;
  const related = games
    .filter(g => g.id !== currentGame.id && g.tags.some(t => currentGame.tags.includes(t)))
    .slice(0, 4);
  if (related.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 py-6 border-t bg-gray-50/50">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Recomendaciones</h2>
          <p className="text-xs sm:text-sm text-gray-500">Productos similares a &ldquo;{currentGame.name}&rdquo;</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {related.map(g => <GameCard key={g.id} game={g} />)}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   METODOS DE PAGO
   ══════════════════════════════════════════════════════════════ */
function PaymentMethods() {
  const methods = [
    { name: 'MercadoPago', color: 'from-blue-600 to-cyan-500', icon: CreditCard },
    { name: 'PayPal', color: 'from-blue-700 to-blue-500', icon: Shield },
    { name: 'Bitcoin', color: 'from-amber-500 to-orange-500', icon: TrendingUp },
    { name: 'USDT', color: 'from-emerald-500 to-teal-500', icon: DollarSign },
  ];
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 py-6">
      <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Metodos de pago aceptados</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {methods.map(m => (
          <div key={m.name} className={`flex items-center gap-2 bg-gradient-to-r ${m.color} text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg`}>
            <m.icon className="w-4 h-4" />
            {m.name}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   TRUST STRIP
   ══════════════════════════════════════════════════════════════ */
function TrustStrip() {
  const items = [
    { icon: Shield, text: 'Pago Seguro', desc: 'Encriptacion SSL' },
    { icon: Zap, text: 'Entrega Inmediata', desc: '< 1 minuto' },
    { icon: Globe, text: 'Juegos Globales', desc: '8 plataformas' },
    { icon: RotateCcw, text: 'Garantia 30 Dias', desc: 'Reembolso total' },
  ];
  return (
    <div className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map(i => (
            <div key={i.text} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-colors">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <i.icon className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{i.text}</p>
                <p className="text-[10px] text-gray-400">{i.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER
   ══════════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-[#0f0a1e] via-[#1a1333] to-[#0a0a0f] text-white overflow-hidden">
      {/* Pattern decorativo */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_20%_30%,white,transparent_40%)]" />
      <div className="absolute inset-0 opacity-3 bg-[repeating-linear-gradient(45deg,transparent,transparent_30px,white_30px,white_31px)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-glow-violet group-hover:scale-105 transition-transform">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-extrabold text-gradient-violet">DigiStore</span>
            </Link>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xs">
              Juegos y software digital al mejor precio. Escaneamos plataformas y te traemos los mejores productos, gratis y premium.
            </p>
            <div className="flex gap-2 mt-4">
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-500/30">
                100% Verificado
              </span>
              <span className="bg-violet-500/20 text-violet-300 text-[10px] font-bold px-2 py-1 rounded-full border border-violet-500/30">
                $1 - $5
              </span>
            </div>
          </div>

          {/* Navegación */}
          <div>
            <h4 className="font-bold text-sm mb-3 text-white">Navegación</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-400">
              <li><Link href="/" className="hover:text-violet-300 transition-colors flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> Inicio</Link></li>
              <li><Link href="/juegos-gratis" className="hover:text-emerald-300 transition-colors flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> Juegos Gratis <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full">100%</span></Link></li>
              <li><Link href="/tienda" className="hover:text-amber-300 transition-colors flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> Tienda <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full">$1+</span></Link></li>
            </ul>
          </div>

          {/* Fuentes */}
          <div>
            <h4 className="font-bold text-sm mb-3 text-white">Fuentes escaneadas</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-400">
              <li className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Epic Games Store</li>
              <li className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Prime Gaming</li>
              <li className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> GOG.com</li>
              <li className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Steam</li>
              <li className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Humble Bundle</li>
              <li className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> IndieGala</li>
            </ul>
          </div>

          {/* Pagos */}
          <div>
            <h4 className="font-bold text-sm mb-3 text-white">Métodos de pago</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-400">
              <li className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-blue-400" /> MercadoPago</li>
              <li className="flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5 text-amber-400" /> PayPal</li>
              <li className="flex items-center gap-1.5"><Bitcoin className="w-3.5 h-3.5 text-orange-400" /> Bitcoin / USDT</li>
            </ul>
            <div className="mt-4 inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2.5 py-1.5 rounded-full">
              <Shield className="w-3 h-3" /> Pago Seguro y Encriptado
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 sm:mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} DigiStore. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-violet-400" />
            Productos digitales al mejor precio
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const [games, setGames] = useState<GameProduct[]>([]);
  const [freeGames, setFreeGames] = useState<GameProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastViewed, setLastViewed] = useState<GameProduct | null>(null);

  const loadGames = useCallback(async () => {
    try {
      // Cargar pagos (para mostrar) y gratis (sección separada)
      const [paidRes, freeRes] = await Promise.all([
        fetch('/api/scanner/results?products=true&filter=paid'),
        fetch('/api/scanner/results?products=true&filter=free'),
      ]);
      const paidData = await paidRes.json();
      const freeData = await freeRes.json();
      if (paidData.success) setGames(paidData.games || paidData.products || []);
      if (freeData.success) setFreeGames(freeData.games || freeData.products || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadGames(); }, [loadGames]);

  const gamesCount = games.length;
  const valueTotal = games.reduce((s, g) => s + (g.originalPrice || 0), 0);
  const freeGamesCount = freeGames.length;

  const handleShowDetail = useCallback((game: GameProduct) => {
    setLastViewed(game);
    const { setSelectedProduct, setProductDetailOpen } = useStore.getState();
    setSelectedProduct(game as any);
    setProductDetailOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <AnnouncementBar />
      <Header />
      <HeroSection games={games} gamesCount={gamesCount} valueTotal={valueTotal} />
      <CategoryBar games={games} />
      <FeatureBanners gamesCount={gamesCount} valueTotal={valueTotal} />

      {loading ? (
        <div className="mx-auto max-w-7xl px-3 sm:px-6 py-20 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-500 text-sm font-medium">Cargando {gamesCount} productos escaneados...</p>
        </div>
      ) : (
        <>
          <DealsCarousel games={games} />
          <FeaturedSection
            games={games}
            title="Juegos Premium"
            subtitle="Los mejores juegos gratis con mayor valor original — hasta $39.99"
            icon={Crown}
            filterFn={g => (g.originalPrice || 0) >= 20}
            href="/tienda"
            ctaText="Ver todos"
          />
          <FeaturedSection
            games={games}
            title="Accion y Aventura"
            subtitle="Juegos de accion, combate y aventuras emocionantes"
            icon={Sword}
            filterFn={g => g.tags.some(t => ['action', 'adventure', 'fighting'].includes(t))}
            href="/tienda"
            ctaText="Ver mas"
          />
          <FeaturedSection
            games={games}
            title="RPG y Estrategia"
            subtitle="Mundos abiertos, rol por turnos y estrategia profunda"
            icon={Crown}
            filterFn={g => g.tags.some(t => ['rpg', 'strategy', 'tower-defense', 'simulation'].includes(t))}
            href="/tienda"
            ctaText="Ver mas"
          />
          <FeaturedSection
            games={games}
            title="Software y Licencias"
            subtitle="Antivirus, VPN, utilidades y mas — todo gratis"
            icon={Monitor}
            filterFn={g => g.category === 'Software y Licencias' || g.tags.some(t => ['software', 'utility', 'tools'].includes(t))}
            href="/tienda"
            ctaText="Ver software"
            columns={5}
          />

          {/* ═══ SECCIÓN NUEVA: Juegos Gratis Más Populares ═══ */}
          <FreeGamesSection freeGames={freeGames} />

          <BigCTABanner gamesCount={gamesCount} valueTotal={valueTotal} />
          <FeaturedSection
            games={games}
            title="Recien Escaneados"
            subtitle="Los ultimos productos agregados a la tienda"
            icon={Sparkles}
            filterFn={() => true}
            href="/juegos-gratis"
            ctaText="Ver todos"
          />
          {lastViewed && <Recommendations games={games} currentGame={lastViewed} />}
        </>
      )}

      <PaymentMethods />
      <TrustStrip />
      <Footer />
      <CartDrawer />
      <AuthDialog />
      <ProductDetail />
    </div>
  );
}// trigger 1788458808
// trigger redeploy 1788462466
