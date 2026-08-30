"use client";

import { useParams, useRouter } from 'next/navigation';
import { PRODUCTS, CATEGORIES, useStore, Product } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { CartDrawer } from '@/components/store/CartDrawer';
import { AuthDialog } from '@/components/auth/AuthDialog';
import {
  ShoppingCart, Star, Zap, Shield,
  CheckCircle2, Package, ArrowLeft, ArrowRight,
  Truck, RotateCcw, Heart, Share2, Minus, Plus,
  Search, LogIn, LogOut, Sparkles, CreditCard,
  MapPin, Menu, ChevronDown, GitCompare, Sun, Moon, Globe,
  Tag, ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

function getDeliveryInfo(product: Product) {
  const cat = product.category;
  const amount = product.name.match(/\$(\d+)/)?.[1];
  if (cat === 'gaming') {
    const isKey = product.name.toLowerCase().includes('key');
    if (isKey) return { typeLabel: 'Clave de Activacion / Game Key', whatYouReceive: ['Clave de activacion oficial unica', 'Se vincula permanentemente a tu cuenta de ' + product.platform, 'Instrucciones paso a paso para activar', 'Soporte tecnico por 30 dias'], howItWorks: ['Recibes la clave al instante tras el pago', 'Vas a la pagina oficial de ' + product.platform, 'Inicias sesion con tu cuenta personal', 'Vas a \"Canjear Codigo\" e ingresas la clave'] };
    return { typeLabel: 'Codigo de Recarga Oficial', whatYouReceive: ['Codigo de recarga oficial unico', 'Producto: ' + product.name, 'Se canjea directamente en tu cuenta personal de ' + product.platform, 'Instrucciones de canje incluidas'], howItWorks: ['Recibes el codigo al instante tras el pago', 'Abres ' + product.platform + ' o su pagina oficial', 'Inicias sesion con tu propia cuenta', 'Vas a la seccion de \"Canjear Codigo\" e ingresas el codigo'] };
  }
  if (cat === 'streaming' || cat === 'giftcards') return { typeLabel: 'Tarjeta de Regalo Oficial', whatYouReceive: ['Codigo de tarjeta de regalo oficial de ' + product.platform, 'Monto: ' + (amount ? '$' + amount : 'N/A') + ' USD', 'Se canjea en tu propia cuenta de ' + product.platform, 'Sin fecha de expiracion'], howItWorks: ['Recibes el codigo al instante tras el pago', 'Vas a la pagina oficial de ' + product.platform, 'Inicias sesion con tu propia cuenta', 'Ingresas el codigo y el saldo se agrega inmediatamente'] };
  if (cat === 'software') return { typeLabel: 'Clave de Licencia Oficial (Product Key)', whatYouReceive: ['Product Key / Clave de activacion original de ' + product.platform, 'Activacion online valida a traves del servidor oficial', '1 activacion por clave (1 dispositivo)', 'Instrucciones de descarga e instalacion paso a paso'], howItWorks: ['Recibes la Product Key al instante tras el pago', 'Descargas el software desde la pagina oficial del fabricante', 'Durante la instalacion, ingresas la clave cuando te lo pida', 'Activas en linea y listo: software original completo y activado'] };
  return { typeLabel: 'Codigo de Suscripcion Oficial', whatYouReceive: ['Codigo de suscripcion oficial de ' + product.platform, 'Producto: ' + product.name, 'Se canjea en tu cuenta personal existente', 'Sin renovacion automatica'], howItWorks: ['Recibes el codigo al instante tras el pago', 'Vas a la pagina oficial de ' + product.platform, 'Inicias sesion con tu cuenta y canjeas el codigo', 'La suscripcion se activa inmediatamente en tu cuenta'] };
}

function Header() {
  const { cartCount, setCartOpen, user, setUser, searchQuery, setSearchQuery } = useStore();
  const [darkMode, setDarkMode] = useState(false);
  const toggleDark = () => { setDarkMode(!darkMode); document.documentElement.classList.toggle('dark'); };
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-zinc-900 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:gap-4 sm:px-6 sm:py-3">
          <Link href="/" className="flex shrink-0 items-center gap-1.5 transition-transform hover:scale-[1.02]">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-zinc-900 text-amber-400 shadow-md"><span className="text-lg font-black">D</span></div>
            <div className="hidden sm:block leading-none"><div className="text-lg font-black tracking-tight">DigiStore</div><div className="text-[10px] font-medium text-zinc-700">Productos digitales al instante</div></div>
          </Link>
          <div className="relative flex-1">
            <div className="flex items-stretch overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-amber-200/60 focus-within:ring-2 focus-within:ring-amber-500">
              <input type="text" placeholder="Buscar productos, marcas y categorias..." className="h-10 w-full border-0 bg-transparent px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <button className="h-10 bg-amber-400 px-3 hover:bg-amber-500 transition-colors cursor-pointer"><Search className="w-[18px] h-[18px] text-zinc-900" /></button>
            </div>
          </div>
          {user ? (
            <button className="hidden md:flex flex-col items-start rounded-md px-2 py-1 hover:bg-amber-300/40 transition-colors cursor-pointer" onClick={() => setUser(null)}><span className="text-[10px] leading-none">Hola, {user.name}</span><span className="flex items-center gap-0.5 text-xs font-semibold">Cerrar sesion <ChevronDown className="w-3 h-3" /></span></button>
          ) : (
            <button className="hidden md:flex flex-col items-start rounded-md px-2 py-1 hover:bg-amber-300/40 transition-colors cursor-pointer" onClick={() => useStore.getState().setAuthOpen(true)}><span className="text-[10px] leading-none">Hola, Inicia sesion</span><span className="flex items-center gap-0.5 text-xs font-semibold">Cuenta <ChevronDown className="w-3 h-3" /></span></button>
          )}
          <button onClick={toggleDark} className="inline-flex items-center justify-center size-9 rounded-md hover:bg-amber-300/40 transition-colors cursor-pointer">
            <Sun className={`w-[18px] h-[18px] rotate-0 scale-100 transition-all ${darkMode ? '-rotate-90 scale-0' : ''}`} />
            <Moon className={`w-[18px] h-[18px] absolute rotate-90 scale-0 transition-all ${darkMode ? 'rotate-0 scale-100' : ''}`} />
          </button>
          <button className="relative hidden sm:grid h-10 w-10 place-items-center rounded-md hover:bg-amber-300/40 transition-colors cursor-pointer"><GitCompare className="w-5 h-5" /></button>
          <button className="relative hidden sm:grid h-10 w-10 place-items-center rounded-md hover:bg-amber-300/40 transition-colors cursor-pointer"><Heart className="w-5 h-5" /></button>
          <button className="relative flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-amber-300/40 transition-colors cursor-pointer" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="w-[22px] h-[22px]" /><span className="hidden text-xs font-semibold sm:block">Carrito</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-zinc-900 text-white">
      <div className="mx-auto max-w-7xl px-3 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-500 text-zinc-900 shadow-md"><span className="text-lg font-black">D</span></div>
              <div className="leading-none"><div className="text-lg font-black tracking-tight">DigiStore</div><div className="text-[10px] font-medium text-zinc-400">Productos digitales al instante</div></div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">Tu tienda de confianza para productos digitales al mejor precio con entrega instantanea.</p>
          </div>
          <div className="space-y-3"><h4 className="text-sm font-semibold">Productos</h4><ul className="space-y-2 text-xs text-zinc-400">{CATEGORIES.map(c => (<li key={c.id}><Link href={`/tienda?cat=${c.id}`} className="hover:text-white transition-colors">{c.name}</Link></li>))}</ul></div>
          <div className="space-y-3"><h4 className="text-sm font-semibold">Soporte</h4><ul className="space-y-2 text-xs text-zinc-400">{['Centro de ayuda', 'Chat en vivo', 'Garantias', 'Metodos de pago'].map(i => (<li key={i} className="hover:text-white transition-colors cursor-pointer">{i}</li>))}</ul></div>
          <div className="space-y-3"><h4 className="text-sm font-semibold">Legal</h4><ul className="space-y-2 text-xs text-zinc-400">{['Terminos de servicio', 'Privacidad', 'Devoluciones', 'Contacto'].map(i => (<li key={i} className="hover:text-white transition-colors cursor-pointer">{i}</li>))}</ul></div>
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

export default function ProductoPage() {
  const params = useParams();
  const { addToCart, setCartOpen } = useStore();
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);
  const productId = params.id as string;
  const product = PRODUCTS.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-amber-50/40 via-background to-background">
        <Package className="w-16 h-16 text-zinc-200 mb-4" />
        <h1 className="text-xl font-bold">Producto no encontrado</h1>
        <p className="text-sm text-muted-foreground mt-2">El producto que buscas no existe.</p>
        <Link href="/tienda"><span className="mt-6 inline-flex items-center gap-2 rounded-md bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors cursor-pointer"><ArrowLeft className="w-4 h-4" /> Volver a la Tienda</span></Link>
      </div>
    );
  }

  const delivery = getDeliveryInfo(product);
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const savings = product.originalPrice ? (product.originalPrice - product.price).toFixed(2) : null;
  const categoryData = CATEGORIES.find(c => c.id === product.category);
  const relatedProducts = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const handleAddToCart = () => { for (let i = 0; i < qty; i++) addToCart(product); setCartOpen(true); };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-amber-50/40 via-background to-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link><span>/</span>
            <Link href="/tienda" className="hover:text-foreground transition-colors">Tienda</Link><span>/</span>
            <span>{categoryData?.name}</span><span>/</span>
            <span className="text-foreground line-clamp-1 max-w-[200px] sm:max-w-none">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* LEFT: Image */}
            <div className="lg:col-span-5">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-card">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                {discount > 0 && <div className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-lg">-{discount}%</div>}
              </div>
              <div className="mt-3 flex gap-3">
                {[0, 1, 2].map(i => (<button key={i} className={`w-20 h-20 rounded-lg border-2 overflow-hidden cursor-pointer transition-colors ${i === 0 ? 'border-amber-400' : 'border-border hover:border-amber-300'}`}><img src={product.image} alt="" className="w-full h-full object-cover" /></button>))}
              </div>
            </div>

            {/* RIGHT: Info */}
            <div className="lg:col-span-7 space-y-4">
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">{product.platform}</p>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{product.name}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">{[1, 2, 3, 4, 5].map(s => (<Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-zinc-200'}`} />))}</div>
                  <span className="text-sm font-semibold">{product.rating}</span>
                  <span className="text-xs text-muted-foreground">({product.reviews.toLocaleString()} resenas)</span>
                </div>
                <span className="text-zinc-200">|</span>
                <span className="text-xs text-muted-foreground">{product.sold.toLocaleString()} vendidos</span>
              </div>
              <div className="border-t border-border" />
              <div className="flex items-end gap-3 flex-wrap">
                <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
                {product.originalPrice && <span className="text-lg text-muted-foreground line-through mb-0.5">${product.originalPrice.toFixed(2)}</span>}
                {savings && <span className="mb-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Ahorras ${savings} USD</span>}
              </div>
              <div className="flex flex-wrap gap-4 py-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700"><Truck className="w-4 h-4 text-emerald-600" /> Entrega inmediata</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700"><RotateCcw className="w-4 h-4 text-emerald-600" /> 30 dias garantia</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Producto oficial</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              <div className="flex items-center gap-2"><span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600"><CheckCircle2 className="w-4 h-4" /> En stock</span></div>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center rounded-lg border border-border">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="flex h-10 w-10 items-center justify-center rounded-l-lg hover:bg-muted transition-colors cursor-pointer"><Minus className="w-4 h-4 text-muted-foreground" /></button>
                  <span className="flex h-10 w-12 items-center justify-center border-x border-border text-sm font-semibold">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="flex h-10 w-10 items-center justify-center rounded-r-lg hover:bg-muted transition-colors cursor-pointer"><Plus className="w-4 h-4 text-muted-foreground" /></button>
                </div>
                <button onClick={handleAddToCart} className="flex flex-1 items-center justify-center gap-2 h-12 rounded-md bg-zinc-900 px-4 text-sm font-bold text-white hover:bg-zinc-800 transition-colors cursor-pointer">
                  <ShoppingCart className="w-5 h-5" /> Agregar al carrito
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Subtotal: <span className="font-semibold text-foreground">${(product.price * qty).toFixed(2)}</span></p>
              <div className="flex items-center gap-2 pt-1">
                <button onClick={() => setLiked(!liked)} className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${liked ? 'border-red-300 bg-red-50 text-red-600' : 'border-border hover:bg-muted text-muted-foreground'}`}><Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-500' : ''}`} />{liked ? 'En favoritos' : 'Agregar a favoritos'}</button>
                <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted cursor-pointer transition-colors"><Share2 className="w-3.5 h-3.5" /> Compartir</button>
              </div>
              <div className="mt-2 rounded-lg border border-border bg-muted/30 p-4">
                <div className="mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /><p className="text-sm font-semibold">Entrega inmediata</p></div>
                <p className="text-xs leading-relaxed text-muted-foreground">Recibiras tu codigo al instante tras el pago. Si no lo recibes en los primeros 5 minutos, contacta a nuestro soporte 24/7 y te ayudaremos de inmediato.</p>
              </div>
            </div>
          </div>

          {/* Full width sections */}
          <div className="mt-10 space-y-8">
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <h2 className="mb-5 flex items-center gap-2.5 text-lg font-bold"><Zap className="w-5 h-5 text-amber-500" />Que recibiras</h2>
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-5">
                <p className="mb-3 text-sm font-semibold">Tipo de entrega: {delivery.typeLabel}</p>
                <div className="space-y-2.5">{delivery.whatYouReceive.map((item, i) => (<div key={i} className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 w-4 h-4 shrink-0 text-amber-500" /><span className="text-sm text-muted-foreground">{item}</span></div>))}</div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <h2 className="mb-5 flex items-center gap-2.5 text-lg font-bold"><ArrowRight className="w-5 h-5 text-muted-foreground" />Como funciona</h2>
              <div className="space-y-4">{delivery.howItWorks.map((step, i) => (<div key={i} className="flex items-start gap-4"><div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">{i + 1}</div><p className="pt-0.5 text-sm leading-relaxed text-muted-foreground">{step}</p></div>))}</div>
            </div>
            <div className="flex items-start gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
              <Shield className="mt-0.5 w-6 h-6 shrink-0 text-emerald-600" />
              <div><p className="font-bold text-emerald-700">Garantia y Soporte</p><p className="mt-1.5 text-sm leading-relaxed text-emerald-600/80">Todos nuestros productos incluyen garantia de 30 dias. Si tienes cualquier problema con tu compra, nuestro equipo de soporte esta disponible 24/7 para ayudarte con la activacion o reemplazo del codigo.</p></div>
            </div>
            {relatedProducts.length > 0 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold">Productos Relacionados</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {relatedProducts.map(p => (
                    <Link key={p.id} href={`/tienda/producto/${p.id}`} className="group overflow-hidden rounded-lg border border-border bg-card hover:shadow-md transition-all">
                      <div className="relative aspect-square w-full bg-zinc-100"><img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>
                      <div className="p-3">
                        <p className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">{p.platform}</p>
                        <h3 className="mt-0.5 line-clamp-2 text-xs font-semibold group-hover:text-amber-600 transition-colors">{p.name}</h3>
                        <div className="mt-1.5 flex items-center gap-2"><span className="text-sm font-bold">${p.price.toFixed(2)}</span>{p.originalPrice && <span className="text-[10px] text-muted-foreground line-through">${p.originalPrice.toFixed(2)}</span>}</div>
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
