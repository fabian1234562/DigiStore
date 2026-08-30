"use client";

import { useParams } from 'next/navigation';
import { PRODUCTS, CATEGORIES, useStore, Product } from '@/lib/store';
import { CartDrawer } from '@/components/store/CartDrawer';
import { AuthDialog } from '@/components/auth/AuthDialog';
import {
  ShoppingCart, Star, Zap, Shield,
  CheckCircle2, Package, ArrowLeft, Truck, RotateCcw,
  Heart, Share2, Minus, Plus, Search,
  LogIn, MapPin, Menu, ChevronDown, GitCompare,
  Sun, Moon, Globe, Tag, ShieldCheck, MessageCircle,
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
    <div className="bg-zinc-900 text-zinc-100 text-[11px] sm:text-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-1 sm:px-6">
        <div className="flex items-center gap-1.5">
          <Truck className="w-3 h-3 text-amber-400" />
          <span className="hidden sm:inline">Entrega instantanea en pedidos digitales</span>
          <span className="sm:hidden">Entrega instantanea</span>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" /> Pago seguro
          </span>
          <span className="flex items-center gap-1">
            <Tag className="w-3 h-3 text-amber-400" /> Usa{' '}
            <b className="text-amber-300">DIGI10</b> para 10% off
          </span>
        </div>
        <div className="flex items-center gap-2 text-zinc-300">
          <span>
            Envio: <b className="text-white">Global</b>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Header (Yellow) ── */
function Header() {
  const { cartCount, setCartOpen, user, setUser, searchQuery, setSearchQuery } =
    useStore();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-zinc-900 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:gap-4 sm:px-6 sm:py-3">
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="inline-flex items-center justify-center size-9 md:hidden rounded-md hover:bg-amber-300/40 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1.5 transition-transform hover:scale-[1.02]"
          >
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-zinc-900 text-amber-400 shadow-md">
              <span className="text-lg font-black">D</span>
            </div>
            <div className="hidden sm:block leading-none">
              <div className="text-lg font-black tracking-tight">DigiStore</div>
              <div className="text-[10px] font-medium text-zinc-700">
                Productos digitales al instante
              </div>
            </div>
          </Link>
          <div className="hidden lg:flex items-center gap-1 rounded-md px-2 py-1 hover:bg-amber-300/40 cursor-default">
            <MapPin className="w-4 h-4" />
            <div className="leading-tight">
              <div className="text-[10px] text-zinc-700">Entrega a</div>
              <div className="text-xs font-semibold">Todo el mundo</div>
            </div>
          </div>
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
                <button className="h-10 bg-amber-400 px-3 hover:bg-amber-500 transition-colors cursor-pointer">
                  <Search className="w-[18px] h-[18px] text-zinc-900" />
                </button>
              </Link>
            </div>
          </div>
          {user ? (
            <button
              className="hidden md:flex flex-col items-start rounded-md px-2 py-1 hover:bg-amber-300/40 transition-colors cursor-pointer"
              onClick={() => setUser(null)}
            >
              <span className="text-[10px] leading-none">Hola, {user.name}</span>
              <span className="flex items-center gap-0.5 text-xs font-semibold">
                Cerrar sesion <ChevronDown className="w-3 h-3" />
              </span>
            </button>
          ) : (
            <button
              className="hidden md:flex flex-col items-start rounded-md px-2 py-1 hover:bg-amber-300/40 transition-colors cursor-pointer"
              onClick={() => useStore.getState().setAuthOpen(true)}
            >
              <span className="text-[10px] leading-none">Hola, Inicia sesion</span>
              <span className="flex items-center gap-0.5 text-xs font-semibold">
                Cuenta <ChevronDown className="w-3 h-3" />
              </span>
            </button>
          )}
          <button
            onClick={toggleDark}
            className="inline-flex items-center justify-center size-9 rounded-md hover:bg-amber-300/40 transition-colors cursor-pointer"
          >
            <Sun
              className={`w-[18px] h-[18px] rotate-0 scale-100 transition-all ${darkMode ? '-rotate-90 scale-0' : ''}`}
            />
            <Moon
              className={`w-[18px] h-[18px] absolute rotate-90 scale-0 transition-all ${darkMode ? 'rotate-0 scale-100' : ''}`}
            />
          </button>
          <button className="relative hidden sm:grid h-10 w-10 place-items-center rounded-md hover:bg-amber-300/40 transition-colors cursor-pointer">
            <GitCompare className="w-5 h-5" />
          </button>
          <button className="relative hidden sm:grid h-10 w-10 place-items-center rounded-md hover:bg-amber-300/40 transition-colors cursor-pointer">
            <Heart className="w-5 h-5" />
          </button>
          <button
            className="relative flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-amber-300/40 transition-colors cursor-pointer"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="w-[22px] h-[22px]" />
            {cartCount() > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {cartCount()}
              </span>
            )}
            <span className="hidden text-xs font-semibold sm:block">Carrito</span>
          </button>
        </div>
      </div>
      <div className="border-t border-amber-300/40 bg-amber-500/95">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-3 py-1.5 sm:px-6 scrollbar-none">
          <Link
            href="/tienda?sort=popular"
            className="flex shrink-0 items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-zinc-900 hover:bg-amber-300/50 transition-colors"
          >
            <Sparkles className="w-3 h-3" /> Mas vendido
          </Link>
          <Link
            href="/tienda"
            className="shrink-0 rounded px-2 py-1 text-xs font-medium text-zinc-900 hover:bg-amber-300/50 transition-colors"
          >
            Todo
          </Link>
          {CATEGORIES.map((cat) => (
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
      {mobileMenu && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border-b border-zinc-200 shadow-lg md:hidden">
          <div className="px-4 py-3 space-y-1">
            <Link
              href="/tienda"
              onClick={() => setMobileMenu(false)}
              className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-100"
            >
              Todo
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/tienda?cat=${cat.id}`}
                onClick={() => setMobileMenu(false)}
                className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-100"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

/* ── Footer (Dark) ── */
function Footer() {
  return (
    <footer className="bg-zinc-900 text-white">
      <div className="mx-auto max-w-7xl px-3 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-500 text-zinc-900 shadow-md">
                <span className="text-lg font-black">D</span>
              </div>
              <div className="leading-none">
                <div className="text-lg font-black tracking-tight">DigiStore</div>
                <div className="text-[10px] font-medium text-zinc-400">
                  Productos digitales al instante
                </div>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tu tienda de confianza para productos digitales al mejor precio
              con entrega instantanea a todo el mundo.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Productos</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/tienda?cat=${cat.id}`}
                    className="hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Soporte</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              {['Centro de ayuda', 'Chat en vivo', 'Garantias', 'Metodos de pago'].map(
                (item) => (
                  <li
                    key={item}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Legal</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              {['Terminos de servicio', 'Privacidad', 'Devoluciones', 'Contacto'].map(
                (item) => (
                  <li
                    key={item}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-zinc-500">
            2025 DigiStore. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
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

              {/* Help Widget */}
              <div className="rounded-xl border border-purple-100 bg-purple-50 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                  <h3 className="text-sm font-bold text-purple-700">
                    Necesitas ayuda?
                  </h3>
                </div>
                <p className="text-xs leading-relaxed text-purple-500 mb-4">
                  Nuestro equipo de expertos esta disponible 24/7 para resolver
                  cualquier duda sobre tu compra, activacion o garantia.
                </p>
                <button className="flex w-full items-center justify-center gap-2 h-10 rounded-lg border-2 border-purple-300 bg-white text-sm font-semibold text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-colors cursor-pointer">
                  <Send className="w-4 h-4" />
                  Chatea con un experto
                </button>
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
      <CartDrawer />
      <AuthDialog />
    </div>
  );
}
