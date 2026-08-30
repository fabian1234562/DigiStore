"use client";

import { useParams, useRouter } from 'next/navigation';
import { PRODUCTS, CATEGORIES, useStore, Product } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { CartDrawer } from '@/components/store/CartDrawer';
import {
  ShoppingCart, Star, Zap, Shield, ShieldCheck,
  CheckCircle2, Package, ArrowLeft, ArrowRight,
  Truck, RotateCcw, Heart, Share2, Minus, Plus,
  Search, LogIn, LogOut, Sparkles, CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

function getDeliveryInfo(product: Product) {
  const cat = product.category;
  const amount = product.name.match(/\$(\d+)/)?.[1];

  if (cat === 'gaming') {
    const isKey = product.name.toLowerCase().includes('key');
    if (isKey) {
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
    }
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

  if (cat === 'streaming' || cat === 'giftcards') {
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
  }

  if (cat === 'software') {
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
  }

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

/* ── Header (same style as homepage) ── */
function Header() {
  const { cartCount, setCartOpen, user, setUser, searchQuery, setSearchQuery } = useStore();
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#e2e8f0] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-lg bg-[#0d9488] flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-shadow">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight hidden sm:block text-[#111]">
            Digi<span className="text-[#0d9488]">Store</span>
          </span>
        </Link>
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
    </header>
  );
}

/* ── Footer (same as homepage) ── */
function Footer() {
  return (
    <footer className="bg-[#111827] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
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
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-white">Productos</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {['Gaming', 'Streaming', 'Gift Cards', 'Software', 'Suscripciones'].map(item => (
                <li key={item} className="hover:text-white transition-colors cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-white">Soporte</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {['Centro de ayuda', 'Chat en vivo', 'Garantias', 'Metodos de pago'].map(item => (
                <li key={item} className="hover:text-white transition-colors cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>
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
              <Sparkles className="w-3.5 h-3.5" /> Envio global
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function ProductoPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, setCartOpen } = useStore();
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);

  const productId = params.id as string;
  const product = PRODUCTS.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Package className="w-16 h-16 text-[#e2e8f0] mb-4" />
        <h1 className="text-xl font-bold text-[#111]">Producto no encontrado</h1>
        <p className="text-sm text-[#64748b] mt-2">El producto que buscas no existe.</p>
        <Link href="/tienda">
          <Button className="mt-6 gap-2 cursor-pointer bg-[#0d9488] hover:bg-[#0f766e] text-white">
            <ArrowLeft className="w-4 h-4" /> Volver a la Tienda
          </Button>
        </Link>
      </div>
    );
  }

  const delivery = getDeliveryInfo(product);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const savings = product.originalPrice ? (product.originalPrice - product.price).toFixed(2) : null;
  const categoryData = CATEGORIES.find(c => c.id === product.category);
  const relatedProducts = PRODUCTS
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setCartOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#64748b] mb-6 flex-wrap">
            <Link href="/" className="hover:text-[#111] transition-colors">Home</Link>
            <span className="text-[#e2e8f0]">/</span>
            <Link href="/tienda" className="hover:text-[#111] transition-colors">Tienda</Link>
            <span className="text-[#e2e8f0]">/</span>
            <span className="text-[#64748b]">{categoryData?.name}</span>
            <span className="text-[#e2e8f0]">/</span>
            <span className="text-[#111] line-clamp-1 max-w-[200px] sm:max-w-none">{product.name}</span>
          </nav>

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* LEFT col-span-5: Image */}
            <div className="lg:col-span-5">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-[#e2e8f0] bg-white">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                {discount > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-lg">
                    -{discount}%
                  </div>
                )}
              </div>
              {/* Thumbnails row */}
              <div className="flex gap-3 mt-3">
                {[0, 1, 2].map(i => (
                  <button
                    key={i}
                    className={`w-20 h-20 rounded-lg border-2 overflow-hidden cursor-pointer transition-colors ${i === 0 ? 'border-[#0d9488]' : 'border-[#e2e8f0] hover:border-[#0d9488]/50'}`}
                  >
                    <img src={product.image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT col-span-7: Info */}
            <div className="lg:col-span-7 space-y-4">
              {/* Platform in uppercase gray */}
              <p className="text-xs text-[#64748b] uppercase tracking-wider font-semibold">
                {product.platform}
              </p>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-[#111]">
                {product.name}
              </h1>

              {/* Rating stars + count + sold count */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-[#e2e8f0]'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-[#111]">{product.rating}</span>
                  <span className="text-xs text-[#64748b]">({product.reviews.toLocaleString()} resenas)</span>
                </div>
                <span className="text-[#e2e8f0]">|</span>
                <span className="text-xs text-[#64748b]">{product.sold.toLocaleString()} vendidos</span>
              </div>

              {/* Divider */}
              <div className="border-t border-[#e2e8f0]" />

              {/* Price block */}
              <div className="flex items-end gap-3 flex-wrap">
                <span className="text-3xl font-bold text-[#111]">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-lg text-[#94a3b8] line-through mb-0.5">${product.originalPrice.toFixed(2)}</span>
                )}
                {savings && (
                  <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-medium mb-1">
                    Ahorras ${savings} USD
                  </span>
                )}
              </div>

              {/* Delivery badges in green/teal */}
              <div className="flex flex-wrap gap-4 py-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <Truck className="w-4 h-4 text-emerald-600" /> Entrega inmediata
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <RotateCcw className="w-4 h-4 text-emerald-600" /> 30 dias garantia
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <Shield className="w-4 h-4 text-emerald-600" /> Producto oficial
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-[#64748b] leading-relaxed">
                {product.description}
              </p>

              {/* Stock status */}
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" /> En stock
                </span>
              </div>

              {/* Quantity selector + Add to Cart */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center border border-[#e2e8f0] rounded-lg">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-[#f1f5f9] cursor-pointer transition-colors rounded-l-lg"
                  >
                    <Minus className="w-4 h-4 text-[#64748b]" />
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center text-sm font-semibold text-[#111] border-x border-[#e2e8f0]">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-[#f1f5f9] cursor-pointer transition-colors rounded-r-lg"
                  >
                    <Plus className="w-4 h-4 text-[#64748b]" />
                  </button>
                </div>
                <Button
                  size="lg"
                  className="flex-1 gap-2 cursor-pointer h-12 bg-[#0d9488] hover:bg-[#0f766e] text-white border-0 rounded-lg text-sm font-bold transition-colors"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-5 h-5" /> Agregar al carrito
                </Button>
              </div>

              {/* Subtotal */}
              <p className="text-xs text-[#64748b]">
                Subtotal:{' '}
                <span className="font-semibold text-[#111]">${(product.price * qty).toFixed(2)}</span>
              </p>

              {/* Wishlist + Share buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                    liked
                      ? 'border-red-300 bg-red-50 text-red-600'
                      : 'border-[#e2e8f0] hover:bg-[#f1f5f9] text-[#64748b]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-500' : ''}`} />
                  {liked ? 'En favoritos' : 'Agregar a favoritos'}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#e2e8f0] hover:bg-[#f1f5f9] text-xs font-medium text-[#64748b] cursor-pointer transition-colors">
                  <Share2 className="w-3.5 h-3.5" /> Compartir
                </button>
              </div>

              {/* Delivery info box */}
              <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-[#0d9488]" />
                  <p className="text-sm font-semibold text-[#111]">Entrega inmediata</p>
                </div>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Recibiras tu codigo al instante tras el pago. Si no lo recibes en los primeros 5 minutos, contacta a nuestro soporte 24/7 y te ayudaremos de inmediato.
                </p>
              </div>
            </div>
          </div>

          {/* FULL WIDTH SECTIONS */}
          <div className="mt-10 space-y-8">
            {/* Que recibiras */}
            <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 sm:p-8">
              <h2 className="text-lg font-bold text-[#111] flex items-center gap-2.5 mb-5">
                <Zap className="w-5 h-5 text-[#0d9488]" />
                Que recibiras
              </h2>
              <div className="rounded-lg border border-[#0d9488]/20 bg-[#f0fdfa] p-5">
                <p className="text-sm font-semibold text-[#111] mb-3">
                  Tipo de entrega: {delivery.typeLabel}
                </p>
                <div className="space-y-2.5">
                  {delivery.whatYouReceive.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-[#0d9488] shrink-0" />
                      <span className="text-sm text-[#64748b]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Como funciona */}
            <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 sm:p-8">
              <h2 className="text-lg font-bold text-[#111] flex items-center gap-2.5 mb-5">
                <ArrowRight className="w-5 h-5 text-[#64748b]" />
                Como funciona
              </h2>
              <div className="space-y-4">
                {delivery.howItWorks.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-[#0d9488]/10 text-[#0d9488] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-[#64748b] leading-relaxed pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Garantia - green bg */}
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 sm:p-8 flex items-start gap-4">
              <Shield className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-700">Garantia y Soporte</p>
                <p className="text-sm text-emerald-600/80 mt-1.5 leading-relaxed">
                  Todos nuestros productos incluyen garantia de 30 dias. Si tienes cualquier problema con tu compra, nuestro equipo de soporte esta disponible 24/7 para ayudarte con la activacion o reemplazo del codigo.
                </p>
              </div>
            </div>

            {/* Productos Relacionados */}
            {relatedProducts.length > 0 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-[#111]">Productos Relacionados</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {relatedProducts.map(p => (
                    <Link
                      key={p.id}
                      href={`/tienda/producto/${p.id}`}
                      className="group rounded-xl border border-[#e2e8f0] bg-white overflow-hidden hover:shadow-md transition-all duration-300"
                    >
                      <div className="relative aspect-square w-full bg-[#f8fafc]">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] text-[#64748b] uppercase tracking-wider font-medium">{p.platform}</p>
                        <h3 className="text-xs font-semibold line-clamp-2 mt-0.5 text-[#111] group-hover:text-[#0d9488] transition-colors">
                          {p.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-sm font-bold text-[#111]">${p.price.toFixed(2)}</span>
                          {p.originalPrice && (
                            <span className="text-[10px] text-[#94a3b8] line-through">${p.originalPrice.toFixed(2)}</span>
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
    </div>
  );
}
