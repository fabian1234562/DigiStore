'use client';

import dynamic from 'next/dynamic';
import { useStore, PRODUCTS, CATEGORIES } from '@/lib/store';
import { ProductCard } from '@/components/store/ProductCard';
const CartDrawer = dynamic(() => import('@/components/store/CartDrawer').then(m => ({ default: m.CartDrawer })), { ssr: false });
const AuthDialog = dynamic(() => import('@/components/auth/AuthDialog').then(m => ({ default: m.AuthDialog })), { ssr: false });
import { AIChatWidget } from '@/components/store/AIChatWidget';
import {
  ShoppingCart, Search, Zap, Shield, Sparkles, LogIn,
  Flame, Heart, Star,
  ChevronDown, SlidersHorizontal, Gamepad2, Tv, Gift, AppWindow, RefreshCw,
  Truck, Tag, MapPin, Menu, ChevronRight, GitCompare, Sun, Moon, Globe,
  Filter, X,
} from 'lucide-react';
import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════════ */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Gamepad2, Tv, Gift, AppWindow, RefreshCw,
};

const sortOptions = [
  { value: 'popular', label: 'Mas vendidos' },
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'price-asc', label: 'Menor precio' },
  { value: 'price-desc', label: 'Mayor precio' },
  { value: 'newest', label: 'Mas recientes' },
];

const priceRanges = [
  { label: 'Menos de $5', min: 0, max: 5 },
  { label: '$5 - $10', min: 5, max: 10 },
  { label: '$10 - $20', min: 10, max: 20 },
  { label: '$20 - $50', min: 20, max: 50 },
  { label: 'Mas de $50', min: 50, max: Infinity },
];

const ratingOptions = [4, 3, 2, 1];

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
   HEADER — yellow gradient, logo, search, icons (EXACT homepage clone)
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
  const catIcons: Record<string, React.ReactNode> = {
    gaming: <Gamepad2 className="w-3.5 h-3.5" />,
    streaming: <Tv className="w-3.5 h-3.5" />,
    giftcards: <Gift className="w-3.5 h-3.5" />,
    software: <AppWindow className="w-3.5 h-3.5" />,
    subscriptions: <RefreshCw className="w-3.5 h-3.5" />,
  };

  return (
    <nav className="bg-amber-500/95 border-t border-amber-300/40 backdrop-blur-sm sm:sticky sm:top-[98px] z-40">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1.5">
          <Link
            href="/tienda?sort=popular"
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
   FOOTER — bg-[#212529], 4 columns, email subscribe, copyright
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
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
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
   SIDEBAR — w-56, sticky, border-r, Z Shop filter style
   ══════════════════════════════════════════════════════════════ */
function Sidebar({ selectedCategory, onSelectCategory, selectedPriceRange, onSelectPriceRange, selectedRating, onSelectRating, onSaleOnly, onToggleSale }: {
  selectedCategory: string; onSelectCategory: (cat: string) => void;
  selectedPriceRange: number; onSelectPriceRange: (idx: number) => void;
  selectedRating: number; onSelectRating: (r: number) => void;
  onSaleOnly: boolean; onToggleSale: () => void;
}) {
  return (
    <aside className="hidden lg:block w-56 shrink-0 border-r border-gray-100 bg-white">
      <div className="sticky top-[104px] max-h-[calc(100vh-104px)] overflow-y-auto p-4 space-y-6">
        {/* Categoria */}
        <div>
          <h3 className="uppercase tracking-wider font-bold text-xs mb-3 text-gray-800">Categoria</h3>
          <div className="space-y-1">
            <button
              onClick={() => onSelectCategory('all')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Todos
              </span>
              <span className="text-[10px] opacity-70">{PRODUCTS.length}</span>
            </button>
            {CATEGORIES.map((cat) => {
              const IconComp = iconMap[cat.icon];
              const count = PRODUCTS.filter((p) => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {IconComp && <IconComp className="w-3.5 h-3.5" />}
                    {cat.name}
                  </span>
                  <span className="text-[10px] opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rango de Precio */}
        <div>
          <h3 className="uppercase tracking-wider font-bold text-xs mb-3 text-gray-800">Rango de Precio</h3>
          <div className="space-y-1">
            {priceRanges.map((range, idx) => (
              <button
                key={idx}
                onClick={() => onSelectPriceRange(idx)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedPriceRange === idx
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calificacion */}
        <div>
          <h3 className="uppercase tracking-wider font-bold text-xs mb-3 text-gray-800">Calificacion</h3>
          <div className="space-y-1">
            {ratingOptions.map((r) => (
              <button
                key={r}
                onClick={() => onSelectRating(r)}
                className={`w-full flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedRating === r
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < r ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
                <span>{r === 4 ? 'y mas' : 'y mas'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* En oferta — toggle */}
        <div>
          <h3 className="uppercase tracking-wider font-bold text-xs mb-3 text-gray-800">Ofertas</h3>
          <button
            onClick={onToggleSale}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              onSaleOnly
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Flame className="w-3.5 h-3.5" />
              En oferta
            </span>
            <div className={`w-9 h-5 rounded-full relative transition-colors ${onSaleOnly ? 'bg-amber-500' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${onSaleOnly ? 'left-[18px]' : 'left-0.5'}`} />
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ══════════════════════════════════════════════════════════════
   MOBILE FILTERS DRAWER
   ══════════════════════════════════════════════════════════════ */
function MobileFilters({
  selectedCategory, onSelectCategory, selectedPriceRange, onSelectPriceRange,
  selectedRating, onSelectRating, onSaleOnly, onToggleSale, onClose,
}: {
  selectedCategory: string; onSelectCategory: (cat: string) => void;
  selectedPriceRange: number; onSelectPriceRange: (idx: number) => void;
  selectedRating: number; onSelectRating: (r: number) => void;
  onSaleOnly: boolean; onToggleSale: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      {/* Drawer */}
      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-sm font-bold text-gray-900">Filtros</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4 space-y-6">
          {/* Categoria */}
          <div>
            <h3 className="uppercase tracking-wider font-bold text-xs mb-3 text-gray-800">Categoria</h3>
            <div className="space-y-1">
              <button
                onClick={() => onSelectCategory('all')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Todos
                </span>
                <span className="text-[10px] opacity-70">{PRODUCTS.length}</span>
              </button>
              {CATEGORIES.map((cat) => {
                const IconComp = iconMap[cat.icon];
                const count = PRODUCTS.filter((p) => p.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {IconComp && <IconComp className="w-3.5 h-3.5" />}
                      {cat.name}
                    </span>
                    <span className="text-[10px] opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rango de Precio */}
          <div>
            <h3 className="uppercase tracking-wider font-bold text-xs mb-3 text-gray-800">Rango de Precio</h3>
            <div className="space-y-1">
              {priceRanges.map((range, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectPriceRange(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedPriceRange === idx
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calificacion */}
          <div>
            <h3 className="uppercase tracking-wider font-bold text-xs mb-3 text-gray-800">Calificacion</h3>
            <div className="space-y-1">
              {ratingOptions.map((r) => (
                <button
                  key={r}
                  onClick={() => onSelectRating(r)}
                  className={`w-full flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedRating === r
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < r ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                  <span>y mas</span>
                </button>
              ))}
            </div>
          </div>

          {/* En oferta */}
          <div>
            <h3 className="uppercase tracking-wider font-bold text-xs mb-3 text-gray-800">Ofertas</h3>
            <button
              onClick={onToggleSale}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                onSaleOnly
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5" />
                En oferta
              </span>
              <div className={`w-9 h-5 rounded-full relative transition-colors ${onSaleOnly ? 'bg-amber-500' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${onSaleOnly ? 'left-[18px]' : 'left-0.5'}`} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SHOP CONTENT — main logic with Suspense for useSearchParams
   ══════════════════════════════════════════════════════════════ */
function ShopContent() {
  const searchParams = useSearchParams();
  const { sortBy, setSortBy } = useStore();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria') || 'all');
  const [selectedPriceRange, setSelectedPriceRange] = useState(-1);
  const [selectedRating, setSelectedRating] = useState(0);
  const [onSaleOnly, setOnSaleOnly] = useState(searchParams.get('ofertas') === 'true');
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...PRODUCTS];
    if (selectedCategory !== 'all') result = result.filter((p) => p.category === selectedCategory);
    if (selectedPriceRange >= 0) {
      const range = priceRanges[selectedPriceRange];
      result = result.filter((p) => p.price >= range.min && p.price < range.max);
    }
    if (selectedRating > 0) result = result.filter((p) => p.rating >= selectedRating);
    if (onSaleOnly) result = result.filter((p) => p.originalPrice && p.originalPrice > p.price);
    switch (sortBy) {
      case 'popular': result.sort((a, b) => b.sold - a.sold); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
    }
    return result;
  }, [selectedCategory, selectedPriceRange, selectedRating, onSaleOnly, sortBy]);

  const currentSortLabel = sortOptions.find((s) => s.value === sortBy)?.label || 'Mas vendidos';
  const categoryName = selectedCategory !== 'all' ? CATEGORIES.find((c) => c.id === selectedCategory)?.name : null;
  const hasActiveFilters = selectedCategory !== 'all' || selectedPriceRange >= 0 || selectedRating > 0 || onSaleOnly;

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedPriceRange(-1);
    setSelectedRating(0);
    setOnSaleOnly(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA]">
      <AnnouncementBar />
      <Header />
      <CategoryNav />

      <main className="flex-1">
        {/* Breadcrumb bar */}
        <div className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 py-2.5 flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/tienda" className="hover:text-gray-600 transition-colors">Tienda</Link>
            {categoryName && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-700 font-medium">{categoryName}</span>
              </>
            )}
          </div>
        </div>

        {/* Main content: sidebar + product grid */}
        <div className="mx-auto max-w-7xl px-3 sm:px-6 py-6 flex gap-6">
          {/* Desktop Sidebar */}
          <Sidebar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedPriceRange={selectedPriceRange}
            onSelectPriceRange={setSelectedPriceRange}
            selectedRating={selectedRating}
            onSelectRating={setSelectedRating}
            onSaleOnly={onSaleOnly}
            onToggleSale={() => setOnSaleOnly(!onSaleOnly)}
          />

          {/* Product Area */}
          <div className="flex-1 min-w-0">
            {/* Top bar: count + sort + mobile filter button */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                {/* Mobile filter button */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:border-amber-300 transition-colors"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Filtros
                  {hasActiveFilters && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  )}
                </button>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">{filtered.length}</span>{' '}
                  productos encontrados
                </p>
              </div>

              {/* Sort dropdown */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:border-amber-300 transition-colors"
                >
                  {currentSortLabel}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortBy(opt.value);
                            setSortOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                            sortBy === opt.value
                              ? 'bg-amber-50 text-amber-700 font-semibold'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Active filters tags (mobile-friendly) */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-medium text-amber-700">
                    {CATEGORIES.find((c) => c.id === selectedCategory)?.name}
                    <button onClick={() => setSelectedCategory('all')} className="ml-0.5 hover:text-amber-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedPriceRange >= 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-medium text-amber-700">
                    {priceRanges[selectedPriceRange].label}
                    <button onClick={() => setSelectedPriceRange(-1)} className="ml-0.5 hover:text-amber-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedRating > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-medium text-amber-700">
                    {selectedRating}+ estrellas
                    <button onClick={() => setSelectedRating(0)} className="ml-0.5 hover:text-amber-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {onSaleOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-medium text-amber-700">
                    En oferta
                    <button onClick={() => setOnSaleOnly(false)} className="ml-0.5 hover:text-amber-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
                >
                  Limpiar todo
                </button>
              </div>
            )}

            {/* Product Grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <SlidersHorizontal className="w-12 h-12 text-gray-200 mb-4" />
                <p className="text-sm font-semibold text-gray-800">No se encontraron productos</p>
                <p className="text-xs text-gray-400 mt-1">Intenta ajustar los filtros o buscar otro termino.</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <MobileFilters
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedPriceRange={selectedPriceRange}
          onSelectPriceRange={setSelectedPriceRange}
          selectedRating={selectedRating}
          onSelectRating={setSelectedRating}
          onSaleOnly={onSaleOnly}
          onToggleSale={() => setOnSaleOnly(!onSaleOnly)}
          onClose={() => setMobileFiltersOpen(false)}
        />
      )}

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

/* ══════════════════════════════════════════════════════════════
   PAGE EXPORT — wrapped in Suspense for useSearchParams
   ══════════════════════════════════════════════════════════════ */
export default function TiendaPage() {
  return <Suspense><ShopContent /></Suspense>;
}
