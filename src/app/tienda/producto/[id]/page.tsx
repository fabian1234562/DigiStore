"use client";

import { useParams } from 'next/navigation';
import { PRODUCTS, CATEGORIES, useStore, Product } from '@/lib/store';
import { CartDrawer } from '@/components/store/CartDrawer';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { AIChatWidget } from '@/components/store/AIChatWidget';
import {
  ShoppingCart, Star, Zap, Shield,
  CheckCircle2, Package, ArrowLeft, Truck, RotateCcw,
  Heart, Share2, Minus, Plus, Search,
  LogIn, MapPin, Menu, ChevronDown, GitCompare,
  Sun, Moon, Globe, Tag, ShieldCheck,
  CreditCard, ChevronRight, Sparkles, ArrowRight, Send,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

/* ── Delivery Info Helper ── */
function getDeliveryInfo(product: Product) {
  const cat = product.category;
  const amount = product.name.match(/\$(\d+)/)?.[1];
  if (cat === 'gaming') {
    const isKey = product.name.toLowerCase().includes('key');
    if (isKey)
      return {
        typeLabel: 'Clave de Activacion / Game Key',
        whatYouReceive: [
          'Clave de activacion oficial unica',
          'Se vincula permanentemente a tu cuenta de ' + product.platform,
          'Instrucciones paso a paso para activar',
          'Soporte tecnico por 30 dias',
        ],
        howItWorks: [
          'Recibes la clave al instante tras el pago',
          'Vas a la pagina oficial de ' + product.platform,
          'Inicias sesion con tu cuenta personal',
          'Vas a "Canjear Codigo" e ingresas la clave',
        ],
      };
    return {
      typeLabel: 'Codigo de Recarga Oficial',
      whatYouReceive: [
        'Codigo de recarga oficial unico',
        'Producto: ' + product.name,
        'Se canjea directamente en tu cuenta personal de ' + product.platform,
        'Instrucciones de canje incluidas',
      ],
      howItWorks: [
        'Recibes el codigo al instante tras el pago',
        'Abres ' + product.platform + ' o su pagina oficial',
        'Inicias sesion con tu propia cuenta',
        'Vas a la seccion de "Canjear Codigo" e ingresas el codigo',
      ],
    };
  }
  if (cat === 'streaming' || cat === 'giftcards')
    return {
      typeLabel: 'Tarjeta de Regalo Oficial',
      whatYouReceive: [
        'Codigo de tarjeta de regalo oficial de ' + product.platform,
        'Monto: ' + (amount ? '$' + amount : 'N/A') + ' USD',
        'Se canjea en tu propia cuenta de ' + product.platform,
        'Sin fecha de expiracion',
      ],
      howItWorks: [
        'Recibes el codigo al instante tras el pago',
        'Vas a la pagina oficial de ' + product.platform,
        'Inicias sesion con tu propia cuenta',
        'Ingresas el codigo y el saldo se agrega inmediatamente',
      ],
    };
  if (cat === 'software')
    return {
      typeLabel: 'Clave de Licencia Oficial (Product Key)',
      whatYouReceive: [
        'Product Key / Clave de activacion original de ' + product.platform,
        'Activacion online valida a traves del servidor oficial',
        '1 activacion por clave (1 dispositivo)',
        'Instrucciones de descarga e instalacion paso a paso',
      ],
      howItWorks: [
        'Recibes la Product Key al instante tras el pago',
        'Descargas el software desde la pagina oficial del fabricante',
        'Durante la instalacion, ingresas la clave cuando te lo pida',
        'Activas en linea y listo: software original completo y activado',
      ],
    };
  return {
    typeLabel: 'Codigo de Suscripcion Oficial',
    whatYouReceive: [
      'Codigo de suscripcion oficial de ' + product.platform,
      'Producto: ' + product.name,
      'Se canjea en tu cuenta personal existente',
      'Sin renovacion automatica',
    ],
    howItWorks: [
      'Recibes el codigo al instante tras el pago',
      'Vas a la pagina oficial de ' + product.platform,
      'Inicias sesion con tu cuenta y canjeas el codigo',
      'La suscripcion se activa inmediatamente en tu cuenta',
    ],
  };
}

/* ── Announcement Bar ── */
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

/* ── Header (Yellow) — matches homepage responsive behavior ── */
function Header() {
  const { cartCount, setCartOpen, user, setUser, searchQuery, setSearchQuery, setAuthOpen } =
    useStore();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const count = cartCount();

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 sticky top-0 z-50 shadow-md">
      <div className="mx-auto max-w-7xl flex items-center gap-3 sm:gap-4 px-3 sm:px-6 py-3">
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-1.5 rounded-md hover:bg-amber-600/30 transition-colors"
          onClick={() => setMobileMenu(!mobileMenu)}
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

        {/* Location selector — hidden on small mobile */}
        <button className="hidden md:flex items-center gap-1 text-xs font-medium text-gray-800 hover:text-gray-900 transition-colors shrink-0">
          <MapPin className="w-4 h-4" />
          <span>Latam</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {/* Search bar — hidden on mobile */}
        <div className="flex-1 max-w-2xl hidden sm:flex">
          <div className="flex w-full rounded-lg overflow-hidden ring-1 ring-amber-200/60">
            <input
              type="text"
              placeholder="Buscar productos digitales..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3.5 py-2 text-sm bg-white text-gray-800 placeholder-gray-400 outline-none min-w-0"
            />
            <Link href={`/tienda?q=${encodeURIComponent(searchQuery)}`}>
              <button className="px-4 bg-amber-400 hover:bg-amber-500 transition-colors flex items-center gap-1.5">
                <Search className="w-4 h-4 text-gray-800" />
                <span className="text-xs font-semibold text-gray-800 hidden md:inline">Buscar</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Theme toggle */}
          <button
            onClick={toggleDark}
            className="p-2 rounded-full hover:bg-amber-600/30 transition-colors hidden sm:flex"
          >
            {darkMode ? <Sun className="w-5 h-5 text-gray-800" /> : <Moon className="w-5 h-5 text-gray-800" />}
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
          {user ? (
            <button
              onClick={() => setUser(null)}
              className="hidden sm:flex items-center gap-1.5 p-1.5 rounded-full hover:bg-amber-600/30 transition-colors"
            >
              <LogIn className="w-5 h-5 text-gray-800" />
              <div className="hidden md:flex flex-col items-start leading-tight">
                <span className="text-[10px] text-gray-600">Hola, {user.name}</span>
                <span className="text-xs font-semibold text-gray-900">Cerrar sesion</span>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="hidden sm:flex items-center gap-1.5 p-1.5 rounded-full hover:bg-amber-600/30 transition-colors"
            >
              <LogIn className="w-5 h-5 text-gray-800" />
              <div className="hidden md:flex flex-col items-start leading-tight">
                <span className="text-[10px] text-gray-600">Hola, Inicia sesion</span>
                <span className="text-xs font-semibold text-gray-900">Cuenta</span>
              </div>
            </button>
          )}

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-white text-gray-800 placeholder-gray-400 outline-none"
          />
          <button className="px-3 bg-amber-400 hover:bg-amber-500 transition-colors">
            <Search className="w-4 h-4 text-gray-800" />
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenu && (
        <div className="lg:hidden bg-amber-400 border-t border-amber-300/40 px-3 pb-3">
          <div className="flex flex-col gap-1">
            <Link
              href="/tienda"
              onClick={() => setMobileMenu(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-amber-500/40 text-sm font-medium text-gray-800 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Ver toda la tienda
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/tienda?categoria=${cat.id}`}
                onClick={() => setMobileMenu(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-amber-500/40 text-sm font-medium text-gray-800 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
            <div className="h-px bg-amber-500/60 my-1" />
            {user ? (
              <button
                onClick={() => { setUser(null); setMobileMenu(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-amber-500/40 text-sm font-medium text-gray-800 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Cerrar sesion ({user.name})
              </button>
            ) : (
              <button
                onClick={() => { setAuthOpen(true); setMobileMenu(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-amber-500/40 text-sm font-medium text-gray-800 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Iniciar sesion / Cuenta
              </button>
            )}
            <button
              onClick={toggleDark}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-amber-500/40 text-sm font-medium text-gray-800 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              Cambiar tema
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

/* ── Footer (Dark) — matches homepage ── */
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
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-amber-500 flex items-center justify-center transition-colors group">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
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
              {CATEGORIES.map((cat) => (
                <li key={cat.id}><Link href={`/tienda?categoria=${cat.id}`} className="text-sm text-gray-400 hover:text-amber-400 transition-colors">{cat.name}</Link></li>
              ))}
            </ul>
          </div>

          {/* Column 3: Soporte */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Soporte</h4>
            <ul className="space-y-2.5">
              {['Centro de ayuda', 'Como comprar', 'Como redimir codigos', 'Politica de reembolso', 'Contacto', 'FAQ'].map((item) => (
                <li key={item}><a href="#" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal + Email */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2.5 mb-6">
              {['Terminos y condiciones', 'Politica de privacidad', 'Cookies', 'Aviso legal'].map((item) => (
                <li key={item}><a href="#" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">{item}</a></li>
              ))}
            </ul>
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

/* ── Main Page ── */
export default function ProductoPage() {
  const params = useParams();
  const { addToCart, setCartOpen } = useStore();
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);
  const [selectedThumb, setSelectedThumb] = useState(0);
  const productId = params.id as string;
  const product = PRODUCTS.find((p) => p.id === productId);

  /* ── Product Not Found ── */
  if (!product) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-amber-50/40 via-[#FAFAFA] to-[#FAFAFA]">
        <AnnouncementBar />
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-24">
          <Package className="w-16 h-16 text-zinc-200 mb-4" />
          <h1 className="text-xl font-bold">Producto no encontrado</h1>
          <p className="text-sm text-gray-500 mt-2">
            El producto que buscas no existe o fue removido.
          </p>
          <Link href="/tienda">
            <span className="mt-6 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" /> Volver a la Tienda
            </span>
          </Link>
        </div>
        <Footer />
        <CartDrawer />
        <AuthDialog />
      </div>
    );
  }

  const delivery = getDeliveryInfo(product);
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;
  const savings = product.originalPrice
    ? (product.originalPrice - product.price).toFixed(2)
    : null;
  const categoryData = CATEGORIES.find((c) => c.id === product.category);
  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id,
  ).slice(0, 8);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setCartOpen(true);
  };

  /* Thumbnail images: use the main image for all 3 (simulated gallery) */
  const thumbnails = [product.image, product.image, product.image];

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-zinc-100 bg-white">
          <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-6">
            <nav className="flex items-center gap-1.5 text-[12px] text-gray-400 flex-wrap">
              <Link href="/" className="hover:text-gray-600 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link
                href="/tienda"
                className="hover:text-gray-600 transition-colors"
              >
                Tienda
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600">{categoryData?.name}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600 font-medium line-clamp-1 max-w-[200px] sm:max-w-none">
                {product.name}
              </span>
            </nav>
          </div>
        </div>

        {/* ─── 3-Column Product Detail ─── */}
        <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* ── LEFT COLUMN: Image Gallery (~30%) ── */}
            <div className="lg:col-span-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-zinc-200 bg-white">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300"
                />
                {discount > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-lg">
                    -{discount}%
                  </div>
                )}
              </div>
              <div className="mt-3 flex gap-3">
                {thumbnails.map((thumb, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedThumb(i)}
                    className={`w-20 h-20 rounded-lg border-2 overflow-hidden cursor-pointer transition-colors ${i === selectedThumb ? 'border-amber-400 ring-1 ring-amber-400/30' : 'border-zinc-200 hover:border-amber-300'}`}
                  >
                    <img
                      src={thumb}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* ── CENTER COLUMN: Product Info (~45%) ── */}
            <div className="lg:col-span-5 space-y-4">
              {/* Platform / Brand */}
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                {product.platform}
              </p>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                {product.name}
              </h1>

              {/* Rating row */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-zinc-200'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">{product.rating}</span>
                  <button className="text-xs text-blue-500 hover:text-blue-600 hover:underline transition-colors cursor-pointer">
                    ({product.reviews.toLocaleString()} resenas)
                  </button>
                </div>
                <span className="text-zinc-200">|</span>
                <span className="text-xs text-gray-500">
                  {product.sold.toLocaleString()} vendidos
                </span>
              </div>

              {/* Tags */}
              {product.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-500 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-zinc-200" />

              {/* Price section */}
              <div className="space-y-1.5">
                <div className="flex items-end gap-3 flex-wrap">
                  <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-400 line-through mb-0.5">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="mb-1 rounded-md bg-pink-100 text-pink-700 px-2 py-0.5 text-sm font-medium">
                      -{discount}%
                    </span>
                  )}
                </div>
                {savings && (
                  <p className="text-sm font-medium text-pink-600">
                    Ahorras ${savings}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  Incluye todos los impuestos
                </p>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-500 leading-relaxed">
                {product.description}
              </p>

              {/* Stock */}
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-600">En stock</span>
              </div>

              {/* Quantity + Subtotal */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center rounded-lg border border-zinc-200 bg-white">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-l-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4 text-gray-500" />
                  </button>
                  <span className="flex h-10 w-12 items-center justify-center border-x border-zinc-200 text-sm font-semibold">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-r-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <span className="text-sm">
                  Subtotal:{' '}
                  <span className="font-bold">
                    ${(product.price * qty).toFixed(2)}
                  </span>
                </span>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="flex w-full items-center justify-center gap-2 h-12 rounded-lg bg-zinc-900 px-4 text-sm font-bold text-white hover:bg-zinc-800 active:scale-[0.98] transition-all cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5" />
                Agregar al carrito
              </button>

              {/* Favorite / Share Row */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-xs font-medium cursor-pointer transition-colors ${liked ? 'border-red-300 bg-red-50 text-red-600' : 'border-zinc-200 bg-white hover:bg-gray-50 text-gray-500'}`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${liked ? 'fill-red-500 text-red-500' : ''}`}
                  />
                  {liked ? 'En favoritos' : 'Agregar a favoritos'}
                </button>
                <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors">
                  <Share2 className="w-3.5 h-3.5" />
                  Compartir
                </button>
              </div>

              {/* Delivery Banner */}
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <p className="text-sm font-bold">Entrega inmediata</p>
                </div>
                <p className="text-xs leading-relaxed text-gray-500">
                  Recibiras tu codigo al instante tras el pago. Si no lo recibes
                  en los primeros 5 minutos, contacta a nuestro soporte 24/7 y te
                  ayudaremos de inmediato.
                </p>
              </div>
            </div>

            {/* ── RIGHT COLUMN: Sidebar (~25%) ── */}
            <div className="lg:col-span-3 space-y-5">
              {/* Specifications Card */}
              <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
                <div className="border-b border-zinc-100 px-5 py-4">
                  <h3 className="text-sm font-bold">Especificaciones</h3>
                </div>
                <div className="divide-y divide-zinc-100">
                  <div className="flex items-center justify-between px-5 py-3">
                    <span className="text-xs text-gray-400">Plataforma</span>
                    <span className="text-xs font-medium text-gray-900">
                      {product.platform}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3">
                    <span className="text-xs text-gray-400">Region</span>
                    <span className="text-xs font-medium text-gray-900">
                      {product.region}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3">
                    <span className="text-xs text-gray-400">Tipo de entrega</span>
                    <span className="text-xs font-medium text-gray-900">
                      Digital
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3">
                    <span className="text-xs text-gray-400">Categoria</span>
                    <span className="text-xs font-medium text-gray-900">
                      {categoryData?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3">
                    <span className="text-xs text-gray-400">Stock</span>
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <CheckCircle2 className="w-3 h-3" />
                      Disponible
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Bottom Full-Width Sections ─── */}
          <div className="mt-10 space-y-8">
            {/* Que recibiras */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
              <h2 className="mb-5 flex items-center gap-2.5 text-lg font-bold">
                <Zap className="w-5 h-5 text-amber-500" />
                Que recibiras
              </h2>
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-5">
                <p className="mb-3 text-sm font-semibold">
                  Tipo de entrega: {delivery.typeLabel}
                </p>
                <div className="space-y-2.5">
                  {delivery.whatYouReceive.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 w-4 h-4 shrink-0 text-amber-500" />
                      <span className="text-sm text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Como funciona */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
              <h2 className="mb-5 flex items-center gap-2.5 text-lg font-bold">
                <ArrowRight className="w-5 h-5 text-gray-400" />
                Como funciona
              </h2>
              <div className="space-y-4">
                {delivery.howItWorks.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                      {i + 1}
                    </div>
                    <p className="pt-0.5 text-sm leading-relaxed text-gray-600">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Guarantee Banner */}
            <div className="flex items-start gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
              <Shield className="mt-0.5 w-6 h-6 shrink-0 text-emerald-600" />
              <div>
                <p className="font-bold text-emerald-700">
                  Garantia y Soporte
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-emerald-600/80">
                  Todos nuestros productos incluyen garantia de 30 dias. Si
                  tienes cualquier problema con tu compra, nuestro equipo de
                  soporte esta disponible 24/7 para ayudarte con la activacion o
                  reemplazo del codigo.
                </p>
              </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Productos Relacionados</h2>
                  <Link
                    href={`/tienda?cat=${product.category}`}
                    className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    Ver todos <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {relatedProducts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/tienda/producto/${p.id}`}
                      className="group overflow-hidden rounded-xl border border-zinc-200 bg-white hover:shadow-md transition-all"
                    >
                      <div className="relative aspect-square w-full bg-zinc-100">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {p.originalPrice && p.originalPrice > p.price && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            -
                            {Math.round(
                              ((p.originalPrice - p.price) / p.originalPrice) * 100,
                            )
                            }%
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] uppercase tracking-wider font-medium text-gray-400">
                          {p.platform}
                        </p>
                        <h3 className="mt-0.5 line-clamp-2 text-xs font-semibold group-hover:text-amber-600 transition-colors">
                          {p.name}
                        </h3>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="text-sm font-bold">
                            ${p.price.toFixed(2)}
                          </span>
                          {p.originalPrice && (
                            <span className="text-[10px] text-gray-400 line-through">
                              ${p.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <AIChatWidget />
      <CartDrawer />
      <AuthDialog />
    </div>
  );
}
