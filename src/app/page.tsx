'use client';

import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import dynamic from 'next/dynamic';
const CartDrawer = dynamic(() => import('@/components/store/CartDrawer').then(m => ({ default: m.CartDrawer })), { ssr: false });
const AuthDialog = dynamic(() => import('@/components/auth/AuthDialog').then(m => ({ default: m.AuthDialog })), { ssr: false });
const ProductDetail = dynamic(() => import('@/components/store/ProductDetail').then(m => ({ default: m.ProductDetail })), { ssr: false });

import { Component, type ReactNode } from 'react';
import {
  ShoppingCart, Search, Zap, Shield, Headphones, LogIn,
  ArrowRight, Sparkles, CreditCard, Flame, Heart, Star,
  ChevronLeft, ChevronRight, Truck, RotateCcw, Globe, Tag,
  Menu, Eye, Gamepad2, Crown, Clock, Package, Check, Send,
  Monitor, Download, Sword, Puzzle, Car, Target, Users, TrendingUp,
  MousePointerClick, Gift, DollarSign, Percent, Layers, Cpu, Languages,
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';

/* ══════════════════════════════════════════════════════════════
   ERROR BOUNDARY — Previene que errores crasheen toda la pagina
   ══════════════════════════════════════════════════════════════ */
interface ErrorBoundaryState { hasError: boolean; error: Error | null; }
class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error('[ErrorBoundary]', error, info.componentStack); }
  render() {
    if (this.state.hasError) return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <p className="text-4xl mb-4">!</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Algo salio mal</h2>
          <p className="text-sm text-gray-500 mb-6">Hubo un error al cargar este contenido. Intenta recargar la pagina.</p>
          <button onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            className="bg-violet-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-violet-700 transition-colors">
            Recargar Pagina
          </button>
        </div>
      </div>
    );
    return this.props.children;
  }
}
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
    <div className="bg-[#212529] text-white text-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between h-9 px-3 sm:px-6">
        <div className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Entrega instantanea en pedidos digitales</span>
          <span className="sm:hidden">Entrega instantanea</span>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Juegos y software desde $1 USD
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Usa DIGI10 para 10% OFF
          </span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HEADER
   ══════════════════════════════════════════════════════════════ */
function Header() {
  const { cartOpen, setCartOpen, authOpen, setAuthOpen, cartCount, lang, setLang } = useStore();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b transition-shadow ${scrolled ? 'shadow-lg' : ''}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-3 sm:px-6 py-3">
        <div className="flex items-center gap-3">
          <button className="lg:hidden" onClick={() => setMobileMenu(!mobileMenu)}><Menu className="w-6 h-6" /></button>
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent hidden sm:inline">DigiStore</span>
          </Link>
        </div>
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-violet-600 transition-colors px-3 py-2 rounded-lg hover:bg-violet-50">Inicio</Link>
          <Link href="/tienda" className="hover:text-violet-600 transition-colors flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-violet-50">Tienda <span className="bg-violet-100 text-violet-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">OFERTAS</span></Link>
        </nav>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full hover:bg-gray-100 transition-colors text-xs font-bold text-gray-600" title={lang === 'es' ? 'Switch to English' : 'Cambiar a Espanol'}>
            <Languages className="w-4 h-4" />
            <span>{lang === 'es' ? 'EN' : 'ES'}</span>
          </button>
          <button className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="w-5 h-5" />
            {cartCount() > 0 && <span className="absolute -top-0.5 -right-0.5 bg-violet-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">{cartCount()}</span>}
          </button>
          <button className="p-2.5 rounded-full hover:bg-gray-100 transition-colors" onClick={() => setAuthOpen(true)}><LogIn className="w-5 h-5" /></button>
        </div>
      </div>
      {mobileMenu && (
        <div className="lg:hidden border-t bg-white px-4 py-3 space-y-1">
          <Link href="/" className="block text-sm font-medium text-gray-700 hover:text-violet-600 hover:bg-violet-50 px-3 py-2 rounded-lg" onClick={() => setMobileMenu(false)}>Inicio</Link>
          <Link href="/tienda" className="block text-sm font-medium text-gray-700 hover:text-violet-600 hover:bg-violet-50 px-3 py-2 rounded-lg flex items-center gap-1" onClick={() => setMobileMenu(false)}>Tienda <span className="bg-violet-100 text-violet-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">OFERTAS</span></Link>
        </div>
      )}
    </header>
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
      title: 'Juegos y Software Digital',
      desc: `${gamesCount} productos escaneados de Epic Games, Prime Gaming, GOG, Steam y mas. Juegos + licencias de software a los mejores precios.`,
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/1364780/capsule_616x353.jpg',
      originalPrice: valueTotal,
      sellPrice: 0,
      gradient: 'from-emerald-950/95 via-teal-950/90 to-green-950/80',
      badge: `${gamesCount} PRODUCTOS`,
      badgeColor: 'bg-emerald-500',
      cta: 'Ver Tienda',
      href: '/tienda',
    },
    {
      title: 'Precios Inmejorables',
      desc: `Valor total en mercado: $${valueTotal.toFixed(0)} USD. Productos digitales escaneados y ofrecidos a precios desde $1 USD. Sin inventario, sin riesgo.`,
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
      title: 'Juegos y Software Digital',
      desc: `${gamesCount} productos escaneados de Epic Games, Prime Gaming, GOG, Steam y mas. Precios desde $1 USD.`,
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/1364780/capsule_616x353.jpg',
      originalPrice: valueTotal,
      sellPrice: 0,
      gradient: 'from-violet-950/95 via-indigo-950/90 to-purple-950/80',
      badge: `${gamesCount} PRODUCTOS`,
      badgeColor: 'bg-amber-500',
      cta: 'Explorar',
      href: '/tienda',
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

      <div className="relative mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center min-h-[420px] md:min-h-[500px] gap-8 py-12 md:py-16">
          {/* Left: Text content */}
          <div className="flex-1 text-white max-w-xl">
            <div className={`inline-flex items-center gap-1.5 ${slide.badgeColor} text-white text-[11px] font-bold px-3 py-1 rounded-full mb-5 tracking-wide`}>
              <Sparkles className="w-3.5 h-3.5" />
              {slide.badge}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-[1.1] drop-shadow-xl">{slide.title}</h1>
            <p className="text-sm sm:text-base text-white/85 mb-8 leading-relaxed drop-shadow-md max-w-md">{slide.desc}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={slide.href} className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-7 py-3.5 rounded-xl hover:bg-gray-100 transition-all text-sm shadow-2xl hover:scale-105">
                {slide.cta} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/tienda" className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-white/25 transition-all text-sm border border-white/20">
                <Eye className="w-4 h-4" /> Ver Tienda
              </Link>
            </div>
          </div>

          {/* Right: Featured product image card */}
          {topGame && (
            <div className="w-full lg:w-[360px] shrink-0">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 group">
                <div className="aspect-[16/10] bg-gray-800">
                  <img src={topGame.image} alt={topGame.name} width={616} height={353}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="eager" fetchPriority="high" decoding="async" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-0.5">{topGame.subcategory}</p>
                      <h3 className="text-white font-bold text-sm line-clamp-1">{topGame.name}</h3>
                    </div>
                    <div className="text-right">
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
      title: 'Precios Bajos',
      desc: `Los mejores precios en productos digitales. Juegos y software escaneados desde multiples plataformas. $${valueTotal.toFixed(0)} USD en valor de mercado.`,
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/1504530/capsule_616x353.jpg',
      gradient: 'from-violet-600 via-purple-600 to-indigo-700',
      stat: `$${valueTotal.toFixed(0)}`,
      statLabel: 'Valor Mercado',
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
      href: '/tienda',
    },
    {
      icon: Download,
      title: 'Catalogo Digital',
      desc: `Escaneamos 8 plataformas automaticamente. ${gamesCount} productos siempre disponibles a los mejores precios.`,
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/1147560/capsule_616x353.jpg',
      gradient: 'from-amber-500 via-orange-500 to-red-600',
      stat: `${gamesCount}`,
      statLabel: 'Productos',
      cta: 'Ver Tienda',
      href: '/tienda',
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
function GameCard({ game, compact = false, onSelect }: { game: GameProduct; compact?: boolean; onSelect?: (g: GameProduct) => void }) {
  const addToCart = useStore(s => s.addToCart);
  const discount = game.originalPrice && game.originalPrice > 0
    ? Math.round((1 - game.price / game.originalPrice) * 100) : 0;

  const handleClick = () => {
    if (onSelect) onSelect(game);
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
function FeaturedSection({ games, title, subtitle, icon: Icon, filterFn, href, ctaText, columns = 4, onSelect }: {
  games: GameProduct[];
  title: string;
  subtitle: string;
  icon: React.ElementType;
  filterFn: (g: GameProduct) => boolean;
  href: string;
  ctaText: string;
  columns?: number;
  onSelect?: (g: GameProduct) => void;
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
        {items.map(g => <GameCard key={g.id} game={g} onSelect={onSelect} />)}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   OFERTAS DEL DIA — Scroll horizontal con cards compactos
   ══════════════════════════════════════════════════════════════ */
function DealsCarousel({ games, onSelect }: { games: GameProduct[]; onSelect?: (g: GameProduct) => void }) {
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
          {deals.map(g => <GameCard key={g.id} game={g} compact onSelect={onSelect} />)}
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
            <h3 className="text-2xl sm:text-3xl font-black mb-2">Los mejores precios en digital</h3>
            <p className="text-sm text-white/75 leading-relaxed">{gamesCount} productos disponibles. Escaneo automatico de 8 plataformas. Precios desde $1 USD.</p>
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
function Recommendations({ games, currentGame, onSelect }: { games: GameProduct[]; currentGame: GameProduct | null; onSelect?: (g: GameProduct) => void }) {
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
        {related.map(g => <GameCard key={g.id} game={g} onSelect={onSelect} />)}
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
    <footer className="bg-[#212529] text-white">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center"><Gamepad2 className="w-5 h-5" /></div>
              <span className="font-bold">DigiStore</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">Juegos y software digital al mejor precio. Escaneamos plataformas y te traemos los mejores productos digitales a precios desde $1 USD.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Navegacion</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link href="/tienda" className="hover:text-white transition-colors">Tienda</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Fuentes</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>Epic Games Store</li>
              <li>Prime Gaming</li>
              <li>GOG.com</li>
              <li>Steam</li>
              <li>Humble Bundle</li>
              <li>IndieGala</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Pagos</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>MercadoPago</li>
              <li>PayPal</li>
              <li>Bitcoin / USDT</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} DigiStore. Todos los derechos reservados.</p>
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
  const [loading, setLoading] = useState(true);
  const [lastViewed, setLastViewed] = useState<GameProduct | null>(null);

  const loadGames = useCallback(async () => {
    try {
      const res = await fetch('/api/scanner/results?products=true');
      const data = await res.json();
      if (data.success) setGames(data.games || data.products || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadGames(); }, [loadGames]);

  const gamesCount = games.length;
  const valueTotal = games.reduce((s, g) => s + (g.originalPrice || 0), 0);

  // Product selected for detail view (local state, not zustand)
  const [selectedGame, setSelectedGame] = useState<GameProduct | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openDetail = useCallback((game: GameProduct) => {
    setLastViewed(game);
    setSelectedGame(game);
    setDetailOpen(true);
  }, []);

  const closeDetail = useCallback(() => {
    setDetailOpen(false);
    setTimeout(() => setSelectedGame(null), 300);
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
          <DealsCarousel games={games} onSelect={openDetail} />
          <FeaturedSection games={games} title="Juegos Premium" subtitle="Los mejores juegos con mayor valor original — hasta $39.99" icon={Crown} filterFn={g => (g.originalPrice || 0) >= 20} href="/tienda" ctaText="Ver todos" onSelect={openDetail} />
          <FeaturedSection games={games} title="Accion y Aventura" subtitle="Juegos de accion, combate y aventuras emocionantes" icon={Sword} filterFn={g => g.tags.some(t => ['action', 'adventure', 'fighting'].includes(t))} href="/tienda" ctaText="Ver mas" onSelect={openDetail} />
          <FeaturedSection games={games} title="RPG y Estrategia" subtitle="Mundos abiertos, rol por turnos y estrategia profunda" icon={Crown} filterFn={g => g.tags.some(t => ['rpg', 'strategy', 'tower-defense', 'simulation'].includes(t))} href="/tienda" ctaText="Ver mas" onSelect={openDetail} />
          <FeaturedSection games={games} title="Software y Licencias" subtitle="Antivirus, VPN, utilidades y mas — a los mejores precios" icon={Monitor} filterFn={g => g.category === 'Software y Licencias' || g.tags.some(t => ['software', 'utility', 'tools'].includes(t))} href="/tienda" ctaText="Ver software" columns={5} onSelect={openDetail} />
          <BigCTABanner gamesCount={gamesCount} valueTotal={valueTotal} />
          <FeaturedSection games={games} title="Recien Escaneados" subtitle="Los ultimos productos agregados a la tienda" icon={Sparkles} filterFn={() => true} href="/tienda" ctaText="Ver todos" onSelect={openDetail} />
          {lastViewed && <Recommendations games={games} currentGame={lastViewed} onSelect={openDetail} />}
        </>
      )}

      <PaymentMethods />
      <TrustStrip />
      <Footer />
      <ErrorBoundary>
        <CartDrawer />
        <AuthDialog />
        {selectedGame && detailOpen && <ProductDetail product={selectedGame} onClose={closeDetail} allProducts={games} />}
      </ErrorBoundary>
    </div>
  );
}