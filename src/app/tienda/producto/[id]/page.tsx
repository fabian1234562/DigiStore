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
} from 'lucide-react';
import Link from 'next/link';

function getDeliveryInfo(product: Product) {
  const cat = product.category;
  const amount = product.name.match(/\$(\d+)/)?.[1];

  if (cat === 'gaming') {
    const isKey = product.name.toLowerCase().includes('key') || product.name.toLowerCase().includes('game key');
    if (isKey) {
      return {
        type: 'key',
        typeLabel: 'Clave de Activacion / Game Key',
        icon: ShieldCheck,
        color: 'text-blue-600 bg-blue-50 border-blue-200',
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
      type: 'code',
      typeLabel: 'Codigo de Recarga Oficial',
      icon: Ticket,
      color: 'text-violet-600 bg-violet-50 border-violet-200',
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

  if (cat === 'streaming') {
    return {
      type: 'giftcard',
      typeLabel: 'Tarjeta de Regalo Oficial',
      icon: Ticket,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      whatYouReceive: [
        'Codigo de tarjeta de regalo oficial de ' + product.platform,
        `Monto: ${amount ? '$' + amount : 'N/A'} USD`,
        'Se canjea en tu propia cuenta de ' + product.platform,
        'Sin fecha de expiracion',
      ],
      howItWorks: [
        'Recibes el codigo al instante tras el pago',
        'Vas a la pagina oficial de ' + product.platform + ' y busca "Canjear" o "Redeem"',
        'Inicias sesion con tu propia cuenta',
        'Ingresas el codigo y el saldo se agrega a tu cuenta inmediatamente',
      ],
    };
  }

  if (cat === 'giftcards') {
    return {
      type: 'giftcard',
      typeLabel: 'Tarjeta de Regalo Oficial',
      icon: Ticket,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      whatYouReceive: [
        'Codigo de tarjeta de regalo oficial de ' + product.platform,
        `Monto: ${amount ? '$' + amount : 'N/A'} USD`,
        'Valido para agregar saldo en ' + product.platform,
        'Sin fecha de expiracion - Usalo cuando quieras',
      ],
      howItWorks: [
        'Recibes el codigo al instante tras el pago',
        'Abres la tienda de ' + product.platform + ' (Steam, PlayStation, Xbox, etc.)',
        'Vas a "Canjear Codigo" o "Agregar Saldo"',
        'Ingresas el codigo y el saldo se acredita inmediatamente en tu cuenta',
      ],
    };
  }

  if (cat === 'software') {
    return {
      type: 'license',
      typeLabel: 'Clave de Licencia Oficial (Product Key)',
      icon: ShieldCheck,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      whatYouReceive: [
        'Product Key / Clave de activacion original de ' + product.platform,
        'Activacion online valida a traves del servidor oficial',
        '1 activacion por clave (1 dispositivo)',
        'Instrucciones de descarga e instalacion paso a paso',
      ],
      howItWorks: [
        'Recibes la Product Key al instante tras el pago',
        'Descargas el software desde la pagina oficial del fabricante (gratis)',
        'Durante la instalacion, ingresas la clave cuando te lo pida',
        'Activas en linea y listo: software original completo y activado',
      ],
    };
  }

  return {
    type: 'code',
    typeLabel: 'Codigo de Suscripcion Oficial',
    icon: Ticket,
    color: 'text-violet-600 bg-violet-50 border-violet-200',
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

function getTagStyle(tag: string) {
  switch (tag) {
    case 'popular': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'oferta': return 'bg-red-100 text-red-700 border-red-200';
    case 'mas vendido': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'tendencia': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'premium': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'mejor margen': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    default: return 'bg-muted text-muted-foreground';
  }
}

export default function ProductoPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, setCartOpen } = useStore();

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

  const features = [
    { icon: Ticket, text: 'Recibes un codigo oficial unico al instante tras tu compra' },
    { icon: Monitor, text: 'Se canjea en tu propia cuenta personal de ' + product.platform },
    { icon: Globe, text: 'Region: ' + product.region + ' - ' + (product.region === 'Global' ? 'Sin restricciones geograficas' : 'Verifica compatibilidad con tu region') },
    { icon: Clock, text: 'Entrega inmediata: ' + product.deliveryTime.toLowerCase() },
    { icon: Shield, text: 'Producto 100% oficial y legitimo con garantia de 30 dias' },
  ];
  if (product.originalPrice) {
    const saveAmt = (product.originalPrice - product.price).toFixed(2);
    features.push({ icon: Zap, text: 'Ahorras $' + saveAmt + ' USD comparado con el precio oficial' });
  }

  const categoryData = CATEGORIES.find(c => c.id === product.category);

  // Related products
  const relatedProducts = PRODUCTS
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product);
    setCartOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background noise">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full glass-strong border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs">Volver</span>
          </button>
          <Link href="/tienda" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-primary/25">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold text-sm tracking-tight">Digi<span className="text-gradient">Store</span></span>
          </Link>
          <div className="w-16" />
        </div>
      </header>

      {/* PRODUCT DETAIL */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60 mb-6">
            <Link href="/tienda" className="hover:text-foreground transition-colors">Tienda</Link>
            <span>/</span>
            <span>{categoryData?.name}</span>
            <span>/</span>
            <span className="text-foreground/80 line-clamp-1">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            {/* LEFT - Image */}
            <div className="space-y-4">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden glass border border-white/[0.06]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized={true}
                />
                {discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl shadow-lg">
                    -{discount}% OFF
                  </div>
                )}
                {product.featured && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3" /> DESTACADO
                  </div>
                )}
              </div>

              {/* Tags debajo de imagen */}
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className={`text-xs px-2.5 py-1 ${getTagStyle(tag)}`}>
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* RIGHT - Info */}
            <div className="space-y-6">
              {/* Title & Meta */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-black leading-tight">{product.name}</h1>
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                  <span className="text-primary font-medium">{product.platform}</span>
                  <span className="text-white/10">|</span>
                  <span>{product.subcategory}</span>
                  <span className="text-white/10">|</span>
                  <span>{product.region}</span>
                </p>
              </div>

              {/* Rating & Sales */}
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-bold">{product.rating}</span>
                  <span className="text-xs text-muted-foreground">({product.reviews.toLocaleString()} resenas)</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span>{product.sold.toLocaleString()} vendidos</span>
                </div>
              </div>

              <Separator className="bg-white/[0.06]" />

              {/* Price Block */}
              <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-foreground">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground/50 line-through mb-1">${product.originalPrice.toFixed(2)}</span>
                )}
                {savings && (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-xs mb-1.5">
                    Ahorras ${savings} USD
                  </Badge>
                )}
              </div>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl glass border border-white/[0.06] p-3.5 text-center">
                  <Clock className="w-5 h-5 mx-auto mb-1.5 text-blue-400" />
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Entrega</p>
                  <p className="text-xs font-bold mt-0.5">{product.deliveryTime}</p>
                </div>
                <div className="rounded-xl glass border border-white/[0.06] p-3.5 text-center">
                  <Globe className="w-5 h-5 mx-auto mb-1.5 text-purple-400" />
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Region</p>
                  <p className="text-xs font-bold mt-0.5">{product.region}</p>
                </div>
                <div className="rounded-xl glass border border-white/[0.06] p-3.5 text-center">
                  <Package className="w-5 h-5 mx-auto mb-1.5 text-emerald-400" />
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Stock</p>
                  <p className="text-xs font-bold mt-0.5">{product.stock} disponibles</p>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                size="lg"
                className="w-full gap-2 cursor-pointer h-14 text-base font-bold rounded-xl"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5" />
                Agregar al Carrito - ${product.price.toFixed(2)} USD
              </Button>

              <div className="flex items-center justify-center gap-5 text-xs text-muted-foreground/50">
                <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Pago seguro</span>
                <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Entrega instantanea</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Garantia 30 dias</span>
              </div>
            </div>
          </div>

          {/* DESCRIPTION SECTION - Full width below */}
          <div className="mt-10 space-y-8">
            {/* Descripcion del Producto */}
            <div className="rounded-2xl glass border border-white/[0.06] p-6 sm:p-8 space-y-5">
              <h2 className="text-xl font-bold flex items-center gap-2.5">
                <Info className="w-5 h-5 text-primary" />
                Descripcion del Producto
              </h2>
              <p className="text-sm text-foreground/90 leading-relaxed text-justify">
                {product.description}
              </p>
              <div className="bg-white/[0.03] rounded-xl p-5 space-y-3 border border-white/[0.04]">
                {features.map((feat, i) => {
                  const FeatIcon = feat.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <FeatIcon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                      <span className="text-sm text-foreground/80 leading-relaxed">{feat.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Que recibiras */}
            <div className="rounded-2xl glass border border-white/[0.06] p-6 sm:p-8 space-y-5">
              <h2 className="text-xl font-bold flex items-center gap-2.5">
                <DeliveryIcon className={`w-5 h-5 ${delivery.color.split(' ')[0]}`} />
                Que recibiras al comprar
              </h2>
              <div className={`rounded-xl border p-5 ${delivery.color} bg-opacity-50`}>
                <p className="text-sm font-bold mb-3">Tipo de entrega: {delivery.typeLabel}</p>
                <div className="space-y-2.5">
                  {delivery.whatYouReceive.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Como funciona */}
            <div className="rounded-2xl glass border border-white/[0.06] p-6 sm:p-8 space-y-5">
              <h2 className="text-xl font-bold flex items-center gap-2.5">
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                Como funciona la entrega
              </h2>
              <div className="bg-white/[0.03] rounded-xl p-5 space-y-4 border border-white/[0.04]">
                {delivery.howItWorks.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Garantia */}
            <div className="rounded-2xl glass border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8 flex items-start gap-4">
              <Shield className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-base font-bold text-emerald-400">Garantia y Soporte</p>
                <p className="text-sm text-foreground/70 mt-2 leading-relaxed">
                  Todos nuestros productos incluyen garantia de 30 dias. Si tienes cualquier problema con tu compra, nuestro equipo de soporte esta disponible 24/7 para ayudarte con la activacion o reemplazo del codigo.
                </p>
              </div>
            </div>

            {/* Productos Relacionados */}
            {relatedProducts.length > 0 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold">Productos Relacionados</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {relatedProducts.map(p => (
                    <Link
                      key={p.id}
                      href={`/tienda/producto/${p.id}`}
                      className="group rounded-xl glass border border-white/[0.06] overflow-hidden hover:border-primary/20 transition-all duration-300"
                    >
                      <div className="relative aspect-square w-full">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized={true}
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors">{p.name}</h3>
                        <p className="text-sm font-bold mt-1.5">${p.price.toFixed(2)}</p>
                        {p.originalPrice && (
                          <span className="text-[10px] text-muted-foreground/40 line-through">${p.originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.04] bg-white/[0.01] mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <Link href="/tienda" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary via-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-extrabold text-sm">Digi<span className="text-gradient">Store</span></span>
            </Link>
            <p className="text-xs text-muted-foreground/40">2025 DigiStore. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      <CartDrawer />
    </div>
  );
}