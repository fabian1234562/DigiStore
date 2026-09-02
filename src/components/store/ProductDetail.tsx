'use client';

import { useStore, Product } from '@/lib/store';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
  X,
  Info,
  Monitor,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        'Descargas el software desde la pagina oficial del fabricante (sin costo adicional)',
        'Durante la instalacion, ingresas la clave cuando te lo pida',
        'Activas en linea y listo: software original completo y activado',
      ],
    };
  }

  // Subscriptions - all are codes/gift codes
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

function getProductFeatures(product: Product): { icon: React.ElementType; text: string }[] {
  const features: { icon: React.ElementType; text: string }[] = [];
  features.push(
    { icon: Ticket, text: 'Recibes un codigo oficial unico al instante tras tu compra' },
    { icon: Monitor, text: 'Se canjea en tu propia cuenta personal de ' + product.platform },
    { icon: Globe, text: 'Region: ' + product.region + ' - ' + (product.region === 'Global' ? 'Sin restricciones geograficas' : 'Verifica compatibilidad con tu region') },
    { icon: Clock, text: 'Entrega inmediata: ' + product.deliveryTime.toLowerCase() },
    { icon: Shield, text: 'Producto 100% oficial y legitimo con garantia de 30 dias' },
  );
  if (product.originalPrice) {
    const savings = (product.originalPrice - product.price).toFixed(2);
    features.push({ icon: Zap, text: 'Ahorras $' + savings + ' USD comparado con el precio oficial' });
  }
  return features;
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

export function ProductDetail() {
  const { selectedProduct, productDetailOpen, setProductDetailOpen, setSelectedProduct, addToCart, setCartOpen } = useStore();

  if (!selectedProduct) return null;

  const product = selectedProduct;
  const delivery = getDeliveryInfo(product);
  const features = getProductFeatures(product);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const savings = product.originalPrice ? (product.originalPrice - product.price).toFixed(2) : null;
  const DeliveryIcon = delivery.icon;

  const handleAddToCart = () => {
    addToCart(product);
    setProductDetailOpen(false);
    setSelectedProduct(null);
    setTimeout(() => setCartOpen(true), 300);
  };

  return (
    <Dialog open={productDetailOpen} onOpenChange={(open) => { if (!open) { setProductDetailOpen(false); setTimeout(() => setSelectedProduct(null), 300); } }}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 max-h-[90vh] overflow-hidden">
        <div className="overflow-y-auto">
          {/* Imagen */}
          <div className="relative">
            <div className="aspect-video sm:aspect-[16/9] w-full bg-gradient-to-br from-muted to-muted/80 relative overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized={true}
              />
            </div>
            <button
              onClick={() => { setProductDetailOpen(false); setTimeout(() => setSelectedProduct(null), 300); }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            {discount > 0 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg">
                -{discount}% OFF
              </div>
            )}
          </div>

          <div className="p-6 space-y-5">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="outline" className={`text-xs px-2 py-0.5 ${getTagStyle(tag)}`}>
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </Badge>
              ))}
            </div>

            {/* Titulo */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold leading-tight">{product.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{product.platform} · {product.subcategory}</p>
            </div>

            {/* Rating y ventas */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-semibold">{product.rating}</span>
                <span className="text-muted-foreground">({product.reviews.toLocaleString()} resenas)</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span>{product.sold.toLocaleString()} vendidos</span>
              </div>
            </div>

            <Separator />

            {/* DESCRIPCION DEL PRODUCTO - Seccion principal y visible */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                Descripcion del Producto
              </h3>
              <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                {product.description}
              </p>
              <div className="bg-muted/50 rounded-xl p-4 space-y-2.5">
                {features.map((feat, i) => {
                  const FeatIcon = feat.icon;
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      <FeatIcon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                      <span className="text-sm text-foreground/80 leading-relaxed">{feat.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info rapida */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Clock className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                <p className="text-[10px] text-muted-foreground">Entrega</p>
                <p className="text-xs font-semibold">{product.deliveryTime}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Globe className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                <p className="text-[10px] text-muted-foreground">Region</p>
                <p className="text-xs font-semibold">{product.region}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Package className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
                <p className="text-[10px] text-muted-foreground">Stock</p>
                <p className="text-xs font-semibold">{product.stock} disponibles</p>
              </div>
            </div>

            <Separator />

            {/* Que recibiras */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <DeliveryIcon className={`w-5 h-5 ${delivery.color.split(' ')[0]}`} />
                Que recibiras al comprar
              </h3>
              <div className={`rounded-xl border p-4 ${delivery.color}`}>
                <p className="text-sm font-semibold mb-3">Tipo de entrega: {delivery.typeLabel}</p>
                <div className="space-y-2">
                  {delivery.whatYouReceive.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Como funciona */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                Como funciona la entrega
              </h3>
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                {delivery.howItWorks.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Garantia */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">Garantia y Soporte</p>
                <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                  Todos nuestros productos incluyen garantia de 30 dias. Si tienes cualquier problema con tu compra, nuestro equipo de soporte esta disponible 24/7 para ayudarte con la activacion o reemplazo.
                </p>
              </div>
            </div>

            <Separator />

            {/* Precio y boton de compra */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-primary">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
                )}
              </div>
              {savings && (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                  Ahorras ${savings} USD
                </Badge>
              )}
            </div>

            <Button
              size="lg"
              className="w-full gap-2 cursor-pointer h-12 text-base"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-5 h-5" />
              Agregar al Carrito - ${product.price.toFixed(2)} USD
            </Button>

            <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Pago seguro</span>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Entrega instantanea</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Garantia 30 dias</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
