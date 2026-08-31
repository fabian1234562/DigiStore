'use client';

import { useStore } from '@/lib/store';
import dynamic from 'next/dynamic';
const CartDrawer = dynamic(() => import('@/components/store/CartDrawer').then(m => ({ default: m.CartDrawer })), { ssr: false });
const AuthDialog = dynamic(() => import('@/components/auth/AuthDialog').then(m => ({ default: m.AuthDialog })), { ssr: false });
import {
  ShoppingCart, Search, Zap, Shield, Headphones, LogIn,
  ArrowRight, Sparkles, CreditCard, Flame, Heart, Star,
  ChevronLeft, ChevronRight, Truck, RotateCcw, Globe, Tag,
  Menu, MapPin, ChevronDown, Eye, GitCompare, Sun, Moon,
  Gamepad2, Crown, Clock, Package, Check, Send,
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
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
   ANNOUNCEMENT BAR — mismo diseño original
   ══════════════════════════════════════════════════════════════ */
function AnnouncementBar() {
  return (
    <div className="bg-[#212529] text-white text-xs" style={{ height: '34px' }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between h-full px-3 sm:px-6">
        <div className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Entrega instantanea en pedidos digitales</span>
          <span className="sm:hidden">Entrega instantanea</span>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            100% Ganancia en juegos gratis
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
   HEADER — mismo diseño original
   ══════════════════════════════════════════════════════════════ */
function Header() {
  const { cartOpen, setCartOpen, authOpen, setAuthOpen, cartCount } = useStore();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <header className={`sticky top-0 z-50 bg-white border-b transition-shadow ${scrolled ? 'shadow-md' : ''}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-3 sm:px-6 py-3">
        <div className="flex items-center gap-3">
          <button className="lg:hidden" onClick={() => setMobileMenu(!mobileMenu)}><Menu className="w-6 h-6" /></button>
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent hidden sm:inline">DigiStore</span>
          </Link>
        </div>
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-violet-600 transition-colors">Inicio</Link>
          <Link href="/juegos-gratis" className="hover:text-violet-600 transition-colors flex items-center gap-1">Juegos Gratis <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">100%</span></Link>
          <Link href="/tienda" className="hover:text-violet-600 transition-colors">Tienda</Link>
        </nav>
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-full hover:bg-gray-100" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="w-5 h-5" />
            {cartCount() > 0 && <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount()}</span>}
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => setAuthOpen(true)}><LogIn className="w-5 h-5" /></button>
        </div>
      </div>
      {mobileMenu && (
        <div className="lg:hidden border-t bg-white px-4 py-3 space-y-3">
          <Link href="/" className="block text-sm font-medium text-gray-700 hover:text-violet-600" onClick={() => setMobileMenu(false)}>Inicio</Link>
          <Link href="/juegos-gratis" className="block text-sm font-medium text-gray-700 hover:text-violet-600 flex items-center gap-1" onClick={() => setMobileMenu(false)}>Juegos Gratis <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">100%</span></Link>
          <Link href="/tienda" className="block text-sm font-medium text-gray-700 hover:text-violet-600" onClick={() => setMobileMenu(false)}>Tienda</Link>
        </div>
      )}
    </header>
  );
}

/* ══════════════════════════════════════════════════════════════
   HERO CAROUSEL — rediseñado para escáner de juegos gratis
   ══════════════════════════════════════════════════════════════ */
function HeroCarousel({ gamesCount, valueTotal }: { gamesCount: number; valueTotal: number }) {
  const slides = [
    { title: 'Juegos Gratis Escaneados', sub: `${gamesCount} juegos encontrados en tiempo real`, desc: 'Escaneamos Epic Games, Prime Gaming, GOG, Steam y mas. Te los vendemos al mejor precio con 100% ganancia.', cta: 'Ver Juegos Gratis', href: '/juegos-gratis', gradient: 'from-violet-600 via-purple-600 to-indigo-700', icon: Crown },
    { title: 'Ganancia del 100%', sub: `Valor total: $${valueTotal.toFixed(0)}`, desc: 'Productos obtenidos gratis y revendidos. Sin inventario, sin proveedores, sin riesgo. Puro beneficio.', cta: 'Ir a la Tienda', href: '/tienda', gradient: 'from-emerald-500 via-teal-500 to-cyan-600', icon: Zap },
    { title: 'Entrega Instantanea', sub: 'Pago aprobado = juego entregado', desc: 'MercadoPago, PayPal y Bitcoin disponibles. Recibe instrucciones de reclamo inmediatas tras pagar.', cta: 'Comprar Ahora', href: '/juegos-gratis', gradient: 'from-amber-500 via-orange-500 to-red-500', icon: Send },
  ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <div className="relative overflow-hidden">
      <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${current * 100}%)` }}>
        {slides.map((s, i) => (
          <div key={i} className="min-w-full">
            <div className={`bg-gradient-to-br ${s.gradient} text-white`}>
              <div className="mx-auto max-w-7xl px-3 sm:px-6 py-12 md:py-20 flex items-center min-h-[280px] md:min-h-[340px]">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-sm font-medium px-3 py-1 rounded-full mb-4">
                    <s.icon className="w-4 h-4" /> {s.sub}
                  </div>
                  <h1 className="text-3xl md:text-5xl font-extrabold mb-3 leading-tight">{s.title}</h1>
                  <p className="text-sm md:text-base text-white/80 mb-6 leading-relaxed">{s.desc}</p>
                  <Link href={s.href} className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors text-sm">
                    {s.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'bg-white w-8' : 'bg-white/40'}`} />
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FEATURE ICONS — mismo diseño original
   ══════════════════════════════════════════════════════════════ */
function FeatureIcons() {
  const features = [
    { icon: Zap, title: '100% Ganancia', desc: 'Productos gratis revendidos', color: 'text-amber-500' },
    { icon: Shield, title: 'Pago Seguro', desc: 'MercadoPago, PayPal, Crypto', color: 'text-emerald-500' },
    { icon: Send, title: 'Entrega al Instante', desc: 'Instrucciones inmediatas', color: 'text-blue-500' },
    { icon: Headphones, title: 'Soporte 24/7', desc: 'Siempre disponibles', color: 'text-violet-500' },
  ];
  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {features.map((f) => (
          <div key={f.title} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <f.icon className={`w-8 h-8 ${f.color} shrink-0`} />
            <div><p className="font-semibold text-sm">{f.title}</p><p className="text-xs text-gray-500">{f.desc}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PRODUCT CARD — diseño adaptado para juegos del escáner
   ══════════════════════════════════════════════════════════════ */
function GameCard({ game, compact = false }: { game: GameProduct; compact?: boolean }) {
  const { setSelectedProduct, setProductDetailOpen, addToCart } = useStore();
  const discount = game.originalPrice && game.originalPrice > 0
    ? Math.round((1 - game.price / game.originalPrice) * 100) : 0;

  const handleBuy = () => {
    addToCart(game as any);
  };

  return (
    <div className={`group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${compact ? 'w-64 shrink-0' : ''}`}>
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
        <img src={game.image} alt={game.name} width={616} height={353} decoding="async" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
        )}
        <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">GRATIS</span>
      </div>
      <div className="p-3 sm:p-4">
        <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider mb-1">{game.subcategory}</p>
        <h3 className="font-bold text-sm leading-tight mb-1.5 line-clamp-2 group-hover:text-violet-600 transition-colors">{game.name}</h3>
        {!compact && <p className="text-xs text-gray-500 line-clamp-2 mb-2">{game.description}</p>}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-violet-600">${game.price.toFixed(2)}</span>
            {game.originalPrice && game.originalPrice > game.price && (
              <span className="text-xs text-gray-400 line-through">${game.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <button onClick={handleBuy} className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
            Comprar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECCIONES DE PRODUCTOS — cargados del escáner
   ══════════════════════════════════════════════════════════════ */
function FeaturedGames({ games }: { games: GameProduct[] }) {
  const featured = games.filter(g => (g.originalPrice || 0) >= 20).slice(0, 8);
  if (featured.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold">Juegos Premium</h2>
          <p className="text-sm text-gray-500">Los mejores juegos gratis con mayor valor original</p>
        </div>
        <Link href="/juegos-gratis" className="text-sm font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1">
          Ver todos <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {featured.map(g => <GameCard key={g.id} game={g} />)}
      </div>
    </section>
  );
}

function DealsGames({ games }: { games: GameProduct[] }) {
  const deals = games.filter(g => g.price <= 2.99).slice(0, 10);
  if (deals.length === 0) return null;
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl md:text-2xl font-extrabold">Ofertas del Dia</h2>
          </div>
          <p className="text-sm text-gray-500">Juegos desde $1.99 — ganancia directa</p>
        </div>
        <Link href="/tienda" className="text-sm font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1">
          Ver mas <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="relative">
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {deals.map(g => <GameCard key={g.id} game={g} compact />)}
        </div>
      </div>
    </section>
  );
}

function NewGames({ games }: { games: GameProduct[] }) {
  const recent = [...games].slice(0, 8);
  if (recent.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold">Recien Escaneados</h2>
          <p className="text-sm text-gray-500">Los ultimos juegos agregados a la tienda</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {recent.map(g => <GameCard key={g.id} game={g} />)}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   CTA BANNERS — mismo estilo original
   ══════════════════════════════════════════════════════════════ */
function CTABanners() {
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 py-8">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white p-6 md:p-8">
          <Crown className="absolute right-4 bottom-4 w-24 h-24 text-white/10" />
          <h3 className="text-xl font-extrabold mb-2">Escaneo en Tiempo Real</h3>
          <p className="text-sm text-white/80 mb-4">Buscamos juegos gratis en 7 plataformas y los agregamos automaticamente a la tienda.</p>
          <Link href="/juegos-gratis" className="inline-flex items-center gap-1.5 bg-white text-violet-700 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            Explorar <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 md:p-8">
          <Zap className="absolute right-4 bottom-4 w-24 h-24 text-white/10" />
          <h3 className="text-xl font-extrabold mb-2">100% Ganancia</h3>
          <p className="text-sm text-white/80 mb-4">Productos obtenidos gratis. Cada venta es ganancia pura sin costos de inventario.</p>
          <Link href="/tienda" className="inline-flex items-center gap-1.5 bg-white text-emerald-700 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            Ver Tienda <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   TRUST STRIP — mismo diseño original
   ══════════════════════════════════════════════════════════════ */
function TrustStrip() {
  const items = [
    { icon: Shield, text: 'Pago Seguro' },
    { icon: Clock, text: 'Entrega Inmediata' },
    { icon: Globe, text: 'Juegos Globales' },
    { icon: RotateCcw, text: 'Garantia' },
  ];
  return (
    <div className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
          {items.map(i => (
            <div key={i.text} className="flex items-center gap-2 text-sm text-gray-600">
              <i.icon className="w-5 h-5 text-violet-500" />
              <span className="font-medium">{i.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER — mismo diseño original
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
            <p className="text-xs text-gray-400 leading-relaxed">Juegos digitales al mejor precio. Escaneamos plataformas y te traemos los mejores juegos gratis.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Navegacion</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link href="/juegos-gratis" className="hover:text-white transition-colors">Juegos Gratis</Link></li>
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

  return (
    <div className="min-h-screen bg-gray-50/50">
      <AnnouncementBar />
      <Header />
      <HeroCarousel gamesCount={gamesCount} valueTotal={valueTotal} />
      <FeatureIcons />
      {loading ? (
        <div className="mx-auto max-w-7xl px-3 sm:px-6 py-20 text-center">
          <div className="animate-spin w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Cargando juegos escaneados...</p>
        </div>
      ) : (
        <>
          <DealsGames games={games} />
          <FeaturedGames games={games} />
          <CTABanners />
          <NewGames games={games} />
        </>
      )}
      <TrustStrip />
      <Footer />
      <CartDrawer />
      <AuthDialog />
    </div>
  );
}
