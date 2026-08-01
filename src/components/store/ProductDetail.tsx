'use client';

import { useStore, Product } from '@/lib/store';
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
  KeyRound,
  Ticket,
  ShieldCheck,
  CheckCircle2,
  Package,
  ArrowRight,
  X,
  Info,
  Monitor,
  Smartphone,
  Users,
  Download,
  Wifi,
  Tv,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function getDeliveryInfo(product: Product) {
  const cat = product.category;
  const name = product.name.toLowerCase();

  if (cat === 'streaming' || (cat === 'accounts' && name.includes('cuenta'))) {
    return {
      type: 'credentials',
      typeLabel: 'Credenciales de Acceso',
      icon: KeyRound,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      whatYouReceive: [
        'Email y contrasena de la cuenta',
        'Acceso Premium completo',
        product.name.includes('3 Meses') ? 'Vigencia de 3 meses' : 'Vigencia de 1 mes',
        'Instrucciones de activacion',
      ],
      howItWorks: [
        'Recibes las credenciales al instante tras el pago',
        'Vas a la plataforma (Netflix, Spotify, etc.)',
        'Inicias sesion con el email y contrasena proporcionados',
        'Listo: ya tienes acceso a todo el contenido premium',
      ],
    };
  }

  if (cat === 'giftcards') {
    return {
      type: 'giftcard',
      typeLabel: 'Codigo de Tarjeta de Regalo',
      icon: Ticket,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      whatYouReceive: [
        'Codigo de tarjeta de regalo unico',
        `Monto: ${product.name.match(/\$(\d+)/)?.[0] || 'N/A'} USD`,
        'Valido para agregar saldo en la tienda',
        'Sin fecha de expiracion',
      ],
      howItWorks: [
        'Recibes el codigo al instante tras el pago',
        'Abres la tienda correspondiente (Steam, PlayStation, etc.)',
        'Vas a "Canjear Codigo" o "Agregar Saldo"',
        'Ingresas el codigo y el saldo se acredita inmediatamente',
      ],
    };
  }

  if (cat === 'software') {
    return {
      type: 'license',
      typeLabel: 'Clave de Licencia (Product Key)',
      icon: ShieldCheck,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      whatYouReceive: [
        'Product Key original de ' + product.platform,
        'Activacion online valida',
        '1 activacion por clave',
        'Instrucciones de instalacion paso a paso',
      ],
      howItWorks: [
        'Recibes la Product Key al instante tras el pago',
        'Descargas el software desde el sitio oficial gratis',
        'Durante la instalacion, ingresas la clave cuando te lo pida',
        'Activas en linea y listo: software original completo',
      ],
    };
  }

  if (name.includes('minecraft') && name.includes('cuenta')) {
    return {
      type: 'credentials',
      typeLabel: 'Cuenta Premium',
      icon: KeyRound,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      whatYouReceive: [
        'Email y contrasena de la cuenta premium',
        'Acceso completo a Minecraft Java Edition',
        'Posibilidad de jugar en linea en cualquier servidor',
        'Acceso al launcher oficial',
      ],
      howItWorks: [
        'Recibes las credenciales al instante tras el pago',
        'Vas a minecraft.net e inicias sesion',
        'Descargas el launcher oficial de Minecraft',
        'Juega en linea con todos los beneficios premium',
      ],
    };
  }

  if (name.includes('discord nitro')) {
    return {
      type: 'giftcard',
      typeLabel: 'Codigo de Activacion',
      icon: Ticket,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      whatYouReceive: [
        'Codigo de activacion de Discord Nitro',
        '3 meses de Discord Nitro completo',
        'Emojis personalizados y stickers globales',
        'Mejor calidad de streaming y upload',
      ],
      howItWorks: [
        'Recibes el codigo al instante tras el pago',
        'Abres Discord > Configuracion de Usuario > Gift Inventory',
        'Haces clic en "Canjear Codigo"',
        'Ingresas el codigo y disfrutas 3 meses de Nitro',
      ],
    };
  }

  if (name.includes('youtube premium')) {
    return {
      type: 'credentials',
      typeLabel: 'Credenciales de Acceso',
      icon: KeyRound,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      whatYouReceive: [
        'Email y contrasena de la cuenta',
        'YouTube Premium + YouTube Music incluidos',
        'Sin anuncios en ningun video',
        'Descarga ilimitada de videos por 3 meses',
      ],
      howItWorks: [
        'Recibes las credenciales al instante tras el pago',
        'Abres YouTube en tu navegador o app',
        'Inicias sesion con el email y contrasena proporcionados',
        'YouTube Premium se activa automaticamente',
      ],
    };
  }

  if (name.includes('game pass')) {
    return {
      type: 'giftcard',
      typeLabel: 'Codigo de Canje',
      icon: Ticket,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      whatYouReceive: [
        'Codigo de canje de Game Pass Ultimate',
        '1 mes de acceso completo',
        'Consola + PC + Cloud Gaming',
        'Incluye EA Play',
      ],
      howItWorks: [
        'Recibes el codigo al instante tras el pago',
        'Vas a xbox.com/redeem',
        'Inicias sesion con tu cuenta de Microsoft',
        'Ingresas el codigo y Game Pass Ultimate se activa',
      ],
    };
  }

  return {
    type: 'giftcard',
    typeLabel: 'Codigo Digital',
    icon: Ticket,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    whatYouReceive: [
      'Codigo de canje unico',
      'Producto: ' + product.name,
      'Plataforma: ' + product.platform,
      'Region: ' + product.region,
    ],
    howItWorks: [
      'Recibes el codigo al instante tras el pago',
      'Abres la plataforma correspondiente',
      'Buscas la opcion de canjear codigo',
      'Ingresas el codigo y tu producto se activa al instante',
    ],
  };
}

function getProductFeatures(product: Product): { icon: React.ElementType; text: string }[] {
  const cat = product.category;
  const name = product.name.toLowerCase();
  const features: { icon: React.ElementType; text: string }[] = [];

  if (cat === 'gaming') {
    if (name.includes('v-bucks') || name.includes('vbucks')) {
      const amount = name.includes('2800') ? '2,800' : '1,000';
      features.push(
        { icon: Zap, text: `${amount} V-Bucks para gastar en la tienda de Fortnite` },
        { icon: Monitor, text: 'Compatible con PC, PlayStation, Xbox, Switch y Movil' },
        { icon: ShoppingCart, text: 'Compra skins, pases de batalla, emotes y items del Item Shop' },
        { icon: Users, text: 'Se activa directamente en tu cuenta de Epic Games' },
        { icon: Clock, text: 'Entrega inmediata: recibe tus V-Bucks en minutos' },
      );
    } else if (name.includes('robux')) {
      const amount = name.includes('1700') ? '1,700' : '800';
      features.push(
        { icon: Zap, text: `${amount} Robux cargados a tu cuenta de Roblox` },
        { icon: Monitor, text: 'Funciona en PC, Mac, iOS, Android y Xbox' },
        { icon: ShoppingCart, text: 'Compra game passes, accesorios, ropa y items de juegos' },
        { icon: Users, text: 'Personaliza tu avatar con los items mas exclusivos' },
        { icon: Clock, text: 'Entrega inmediata directa a tu cuenta' },
      );
    } else if (name.includes('pase de batalla')) {
      features.push(
        { icon: Star, text: '100 niveles de recompensas exclusivas de la temporada' },
        { icon: Zap, text: 'Skins unicas, emotes, wraps y objetos de contrapartida' },
        { icon: Monitor, text: 'Compatible con todas las plataformas de Fortnite' },
        { icon: Download, text: 'Desbloquea el estilo alternativo del skin del pase al nivel 100' },
        { icon: Clock, text: 'Vigencia durante toda la temporada actual' },
      );
    } else if (name.includes('fifa') || name.includes('ea fc') || name.includes('monedas fifa')) {
      features.push(
        { icon: Zap, text: '2,800 monedas para FIFA/EA FC Ultimate Team' },
        { icon: ShoppingCart, text: 'Compra jugadores en el mercado de transferencias' },
        { icon: Users, text: 'Mejora tu equipo con jugadores top y estrellas' },
        { icon: Monitor, text: 'Compatible con PS4, PS5, Xbox y PC' },
        { icon: Clock, text: 'Entrega en 5-30 minutos por metodo seguro' },
      );
    } else if (name.includes('valorant')) {
      features.push(
        { icon: Star, text: 'Skin legendaria con efectos especiales unicos (VFX)' },
        { icon: Zap, text: 'Animacion de inspeccion, kill animation y finisher' },
        { icon: Monitor, text: 'Funciona en todas las armas disponibles' },
        { icon: Users, text: 'Skin visible para todos los jugadores en partida' },
        { icon: Shield, text: 'Garantia de activacion en tu cuenta de Riot' },
      );
    } else if (name.includes('minecraft')) {
      features.push(
        { icon: KeyRound, text: 'Cuenta premium full con acceso a Java Edition' },
        { icon: Users, text: 'Juega en cualquier servidor multijugador online' },
        { icon: Monitor, text: 'Acceso al launcher oficial de Minecraft' },
        { icon: Download, text: 'Skins personalizadas y capa de jugador incluidas' },
        { icon: Shield, text: 'Acceso completo y sin restricciones' },
      );
    } else if (name.includes('league of legends') || name.includes('rp ')) {
      features.push(
        { icon: Zap, text: '1,380 Riot Points para League of Legends' },
        { icon: ShoppingCart, text: 'Desbloquea campeones, skins y chromas exclusivos' },
        { icon: Monitor, text: 'Compatible con PC (cliente oficial de LoL)' },
        { icon: Star, text: 'Ideal para comprar el pase de batalla o cajas Hextech' },
        { icon: Clock, text: 'Entrega inmediata a tu cuenta de Riot' },
      );
    } else if (name.includes('genshin')) {
      features.push(
        { icon: Star, text: 'Cristales Genesis para hacer deseos (Gacha)' },
        { icon: Zap, text: 'Posibilidad de obtener personajes 5 estrellas y armas legendarias' },
        { icon: Monitor, text: 'Compatible con PC, iOS, Android y PlayStation' },
        { icon: Users, text: 'Mejora tu equipo con los mejores personajes y armas' },
        { icon: Clock, text: 'Entrega inmediata a tu cuenta de HoYoverse' },
      );
    } else if (name.includes('apex')) {
      features.push(
        { icon: Zap, text: '1,000 Monedas de Apex Legends' },
        { icon: ShoppingCart, text: 'Desbloquea skins de armas, legendas y trail effects' },
        { icon: Star, text: 'Compra el Pase de Batalla y objetos de la tienda' },
        { icon: Monitor, text: 'Funciona en PS4, PS5, Xbox, PC y Switch' },
        { icon: Clock, text: 'Entrega inmediata a tu cuenta de EA' },
      );
    } else if (name.includes('pubg')) {
      features.push(
        { icon: Zap, text: '600 UC (Unlimited Cash) para PUBG Mobile' },
        { icon: ShoppingCart, text: 'Compra el Royal Pass, skins y items exclusivos' },
        { icon: Smartphone, text: 'Compatible con Android e iOS' },
        { icon: Star, text: 'Mejora tu armario con las skins mas raras' },
        { icon: Clock, text: 'Entrega inmediata a tu cuenta de PUBG Mobile' },
      );
    } else if (name.includes('warzone') || name.includes('cod')) {
      features.push(
        { icon: KeyRound, text: 'Cuenta con todos los DLCs y paquetes de CoD desbloqueados' },
        { icon: Zap, text: 'Acceso a todos los mapas, modos y armas' },
        { icon: Monitor, text: 'Compatible con Warzone, Multiplayer y Zombies' },
        { icon: Users, text: 'Incluye boost de nivel y items exclusivos' },
        { icon: Shield, text: 'Cuenta verificada y funcional al 100%' },
      );
    } else if (name.includes('free fire')) {
      features.push(
        { icon: Zap, text: '1,000 Diamantes para Free Fire' },
        { icon: ShoppingCart, text: 'Desbloquea personajes, skins de armas y el Pase Elite' },
        { icon: Smartphone, text: 'Compatible con Android e iOS' },
        { icon: Star, text: 'Evolve personajes y obten habilidades unicas' },
        { icon: Clock, text: 'Entrega inmediata a tu cuenta' },
      );
    } else if (name.includes('among us')) {
      features.push(
        { icon: Star, text: 'Todas las skins, sombreros, mascotas y nombres desbloqueados' },
        { icon: Users, text: 'Cuenta con cosméticos completos del juego' },
        { icon: Monitor, text: 'Compatible con PC, Movil y Switch' },
        { icon: Wifi, text: 'Juega online con amigos con tu estilo unico' },
        { icon: Shield, text: 'Cuenta verificada y funcional' },
      );
    } else if (name.includes('clash royale')) {
      features.push(
        { icon: Zap, text: '1,400 Gemas para Clash Royale' },
        { icon: ShoppingCart, text: 'Desbloquea cofres magicos y acelera tiempos' },
        { icon: Star, text: 'Mejora tus cartas al maximo nivel mas rapido' },
        { icon: Smartphone, text: 'Compatible con Android e iOS' },
        { icon: Clock, text: 'Entrega inmediata a tu cuenta de Supercell' },
      );
    } else if (name.includes('mobile legends')) {
      features.push(
        { icon: Zap, text: '400 Diamantes para Mobile Legends: Bang Bang' },
        { icon: ShoppingCart, text: 'Compra heroes, skins epicas y legendarias' },
        { icon: Star, text: 'Participa en el Magic Wheel y gana premios' },
        { icon: Smartphone, text: 'Compatible con Android e iOS' },
        { icon: Clock, text: 'Entrega inmediata a tu cuenta' },
      );
    } else if (name.includes('brawl stars')) {
      features.push(
        { icon: Zap, text: '170 Gemas para Brawl Stars' },
        { icon: ShoppingCart, text: 'Desbloquea el Brawl Pass y cajas mega de personajes' },
        { icon: Star, text: 'Obten nuevos Brawlers y mejoralos' },
        { icon: Smartphone, text: 'Compatible con Android e iOS' },
        { icon: Clock, text: 'Entrega inmediata a tu cuenta de Supercell' },
      );
    } else {
      features.push(
        { icon: Zap, text: product.description },
        { icon: Monitor, text: `Plataforma: ${product.platform}` },
        { icon: Globe, text: `Region: ${product.region} - Compatible con todos los dispositivos` },
        { icon: Clock, text: `Tiempo de entrega: ${product.deliveryTime}` },
        { icon: Shield, text: 'Garantia de activacion o reemplazo' },
      );
    }
  } else if (cat === 'streaming') {
    const plat = product.platform;
    features.push(
      { icon: Tv, text: `Acceso completo a ${plat} con calidad premium` },
      { icon: Monitor, text: 'Compatible con Smart TV, PC, Movil, Tablet y Consolas' },
      { icon: Users, text: 'Multiples pantallas simultaneas segun el plan' },
      { icon: Download, text: 'Descarga contenido para verlo sin conexion' },
      { icon: Wifi, text: 'Sin anuncios - Experiencia 100% premium' },
    );
    if (name.includes('3 meses') || name.includes('3 Meses')) {
      features.push({ icon: Clock, text: 'Vigencia de 3 meses completos desde la activacion' });
    } else {
      features.push({ icon: Clock, text: 'Vigencia de 1 mes completo desde la activacion' });
    }
  } else if (cat === 'giftcards') {
    const amount = product.name.match(/\$(\d+)/)?.[1] || 'N/A';
    features.push(
      { icon: Ticket, text: `Tarjeta de regalo de $${amount} USD para ${product.platform}` },
      { icon: ShoppingCart, text: 'Compra juegos, DLC, suscripciones y contenido digital' },
      { icon: Monitor, text: 'Se canjea directamente en la tienda oficial' },
      { icon: Shield, text: 'Codigo original y verificado - Sin riesgo de activacion' },
      { icon: Clock, text: 'Sin fecha de expiracion - Usalo cuando quieras' },
    );
  } else if (cat === 'software') {
    features.push(
      { icon: ShieldCheck, text: `Licencia original y valida de ${product.platform}` },
      { icon: Download, text: 'Descarga el software desde la pagina oficial del fabricante' },
      { icon: Monitor, text: 'Activacion online con un solo clic' },
      { icon: Shield, text: '1 dispositivo por clave - Activacion garantizada' },
      { icon: Clock, text: 'Clave de por vida o segun el periodo contratado' },
    );
  } else if (cat === 'subscriptions') {
    features.push(
      { icon: Zap, text: `Suscripcion completa a ${product.platform}` },
      { icon: Monitor, text: 'Acceso inmediato a todas las funciones premium' },
      { icon: Star, text: 'Funciones exclusivas no disponibles en la version gratuita' },
      { icon: Users, text: 'Ideal para trabajo, estudio o entretenimiento' },
      { icon: Clock, text: `Duracion: ${product.name.includes('3') ? '3 meses' : product.name.includes('1 Ano') || product.name.includes('1 ano') || product.name.includes('12 Meses') ? '1 ano' : '1 mes'}` },
    );
  } else {
    features.push(
      { icon: Info, text: product.description },
      { icon: Monitor, text: `Plataforma: ${product.platform}` },
      { icon: Globe, text: `Region: ${product.region}` },
      { icon: Clock, text: `Entrega: ${product.deliveryTime}` },
      { icon: Shield, text: 'Garantia de 30 dias' },
    );
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
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { const el = e.currentTarget; el.style.display = 'none'; if (el.nextElementSibling) (el.nextElementSibling as HTMLElement).style.display = 'flex'; }}
              />
              <div className="w-full h-full items-center justify-center text-8xl absolute inset-0 bg-muted hidden">
                📦
              </div>
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
