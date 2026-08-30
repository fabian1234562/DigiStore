"use client";

import { useParams, useRouter } from 'next/navigation';
import { PRODUCTS, CATEGORIES, useStore, Product } from '@/lib/store';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CartDrawer } from '@/components/store/CartDrawer';
import {
  ShoppingCart,
  Star,
  Zap,
  Clock,
  Globe,
  Shield,
  Ticket,
  ShieldCheck,
  CheckCircle2,
  Package,
  ArrowRight,
  ArrowLeft,
  Info,
  Monitor,
  Truck,
  RotateCcw,
  Heart,
  Share2,
  Minus,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

function getDeliveryInfo(product: Product) {
  const cat = product.category;
  const amount = product.name.match(/\$(\d+)/)?.[1];

  if (cat === 'gaming') {
    const isKey = product.name.toLowerCase().includes('key');
    if (isKey) {
      return {
        typeLabel: 'Clave de Activacion / Game Key',
        icon: ShieldCheck,
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
      icon: Ticket,
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
      icon: Ticket,
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
      icon: ShieldCheck,
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
    icon: Ticket,
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Package className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-xl font-bold">Producto no encontrado</h1>
        <p className="text-sm text-muted-foreground mt-2">El producto que buscas no existe.</p>
        <Link href="/tienda">
          <Button className="mt-6 gap-2 cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Volver a la Tienda
          </Button>
        </Link>
      </div>
    );
  }

  const delivery = getDeliveryInfo(product);
  const DeliveryIcon = delivery.icon;
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-background/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs">Volver</span>
          </button>
          <Link href="/tienda" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg">Digi<span className="text-gradient">Store</span></span>
          </Link>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-muted-foreground/50 mb-6">
            <Link href="/tienda" className="hover:text-foreground transition-colors">Tienda</Link>
            <span>/</span>
            <span>{categoryData?.name}</span>
            <span>/</span>
            <span className="text-foreground/70 line-clamp-1">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* LEFT - Image Section */}
            <div className="lg:col-span-5">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02]">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                {discount > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-lg">-{discount}%</div>
                )}
              </div>
            </div>

            {/* RIGHT - Info Section */}
            <div className="lg:col-span-7 space-y-5">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {product.featured && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">Destacado</span>
                )}
                {product.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-medium text-muted-foreground/60 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-md capitalize">{tag}</span>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">{product.rating}</span>
                  <span className="text-xs text-muted-foreground/50">({product.reviews.toLocaleString()} resenas)</span>
                </div>
                <span className="text-muted-foreground/20">|</span>
                <span className="text-xs text-muted-foreground/50">{product.sold.toLocaleString()} vendidos</span>
              </div>

              {/* Divider */}
              <div className="border-t border-white/[0.06]" />

              {/* Price Block */}
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground/40 line-through mb-0.5">${product.originalPrice.toFixed(2)}</span>
                )}
                {savings && (
                  <span className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-md font-medium mb-1">Ahorras ${savings} USD</span>
                )}
              </div>

              {/* Delivery badges */}
              <div className="flex flex-wrap gap-4 py-2">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground/70"><Truck className="w-4 h-4 text-violet-400" /> Entrega instantanea</span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground/70"><RotateCcw className="w-4 h-4 text-violet-400" /> 30 dias de garantia</span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground/70"><Shield className="w-4 h-4 text-violet-400" /> Producto oficial</span>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground/80 leading-relaxed">{product.description}</p>

              {/* Stock & Region */}
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> En stock - entrega hoy</span>
                <span className="text-muted-foreground/40">|</span>
                <span className="text-muted-foreground/60">Region: {product.region}</span>
              </div>

              {/* Quantity + Add to Cart */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center border border-white/[0.08] rounded-lg">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-white/[0.04] cursor-pointer transition-colors rounded-l-lg"><Minus className="w-4 h-4" /></button>
                  <span className="w-12 h-10 flex items-center justify-center text-sm font-semibold border-x border-white/[0.08]">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white/[0.04] cursor-pointer transition-colors rounded-r-lg"><Plus className="w-4 h-4" /></button>
                </div>
                <Button size="lg" className="flex-1 gap-2 cursor-pointer h-11 bg-violet-600 hover:bg-violet-500 text-white border-0 rounded-lg text-sm font-bold transition-all" onClick={handleAddToCart}>
                  <ShoppingCart className="w-4 h-4" /> Agregar al carrito
                </Button>
              </div>

              {/* Subtotal */}
              <p className="text-xs text-muted-foreground/50">Subtotal: <span className="font-semibold text-foreground">${(product.price * qty).toFixed(2)}</span></p>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button onClick={() => setLiked(!liked)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${liked ? 'border-red-500/30 bg-red-500/10 text-red-400' : 'border-white/[0.08] hover:bg-white/[0.04] text-muted-foreground'}`}>
                  <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-400' : ''}`} /> {liked ? 'En favoritos' : 'Agregar a favoritos'}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.08] hover:bg-white/[0.04] text-xs font-medium text-muted-foreground cursor-pointer transition-colors">
                  <Share2 className="w-3.5 h-3.5" /> Compartir
                </button>
              </div>

              {/* Delivery info box */}
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-violet-400" />
                  <p className="text-sm font-semibold">Entrega inmediata</p>
                </div>
                <p className="text-xs text-muted-foreground/60 leading-relaxed">Recibiras tu codigo al instante tras el pago. Si no lo recibes en los primeros 5 minutos, contacta a nuestro soporte 24/7 y te ayudaremos de inmediato.</p>
              </div>
            </div>
          </div>

          {/* FULL WIDTH SECTIONS */}
          <div className="mt-10 space-y-8">
            {/* Que recibiras */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-6 sm:p-8">
              <h2 className="text-lg font-bold flex items-center gap-2.5 mb-5">
                <DeliveryIcon className="w-5 h-5 text-violet-400" />
                Que recibiras al comprar
              </h2>
              <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-5">
                <p className="text-sm font-semibold mb-3">Tipo de entrega: {delivery.typeLabel}</p>
                <div className="space-y-2.5">
                  {delivery.whatYouReceive.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-violet-400 shrink-0" />
                      <span className="text-sm text-muted-foreground/80">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Como funciona */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-6 sm:p-8">
              <h2 className="text-lg font-bold flex items-center gap-2.5 mb-5">
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                Como funciona la entrega
              </h2>
              <div className="space-y-4">
                {delivery.howItWorks.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                    <p className="text-sm text-muted-foreground/80 leading-relaxed pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Garantia */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8 flex items-start gap-4">
              <Shield className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-400">Garantia y Soporte</p>
                <p className="text-sm text-muted-foreground/70 mt-1.5 leading-relaxed">Todos nuestros productos incluyen garantia de 30 dias. Si tienes cualquier problema con tu compra, nuestro equipo de soporte esta disponible 24/7 para ayudarte con la activacion o reemplazo del codigo.</p>
              </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold">Productos Relacionados</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {relatedProducts.map(p => (
                    <Link key={p.id} href={`/tienda/producto/${p.id}`} className="group rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-violet-500/20 transition-all duration-300">
                      <div className="relative aspect-square w-full">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">{p.platform}</p>
                        <h3 className="text-xs font-semibold line-clamp-2 mt-0.5 group-hover:text-violet-400 transition-colors">{p.name}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-sm font-bold">${p.price.toFixed(2)}</span>
                          {p.originalPrice && <span className="text-[10px] text-muted-foreground/40 line-through">${p.originalPrice.toFixed(2)}</span>}
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

      {/* Footer */}
      <footer className="border-t border-white/[0.04] bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-muted-foreground/40">2025 DigiStore. Todos los derechos reservados.</p>
        </div>
      </footer>

      <CartDrawer />
    </div>
  );
}
