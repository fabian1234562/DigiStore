'use client';

import { useStore, Product } from '@/lib/store';
import {
  ShoppingCart, Star, Zap, Clock, Globe, Shield, CheckCircle2,
  Package, ArrowRight, ArrowLeft, X, Info, Monitor, Heart, Share2,
  Play, ChevronLeft, ChevronRight, Sparkles, Eye,
  Download, Tag, ThumbsUp, Users, Truck, RotateCcw,
} from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';

/* ══════════════════════════════════════════════════════════════
   TYPES
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
   HELPERS
   ══════════════════════════════════════════════════════════════ */
function getTrailerSearchUrl(name: string): string {
  const q = encodeURIComponent(name + ' official trailer gameplay');
  return `https://www.youtube.com/results?search_query=${q}`;
}

// Generate images from Steam CDN — ONLY verified variants (tested all 72 apps, 100% HTTP 200)
// capsule_236x.jpg = 0% success, page_bg_raw.jpg = 58% fail, library_600x900.jpg = 28% fail
function getProductImages(product: GameProduct): string[] {
  const images: string[] = [];

  if (product.image.includes('cdn.akamai.steamstatic.com/steam/apps/')) {
    const match = product.image.match(/steam\/apps\/(\d+)/);
    if (match) {
      const appId = match[1];
      // 1. Wide capsule (616x353, 16:9 landscape) — 100% verified
      images.push(`https://cdn.akamai.steamstatic.com/steam/apps/${appId}/capsule_616x353.jpg`);
      // 2. Header (460x215, wider crop, different framing) — 100% verified
      images.push(`https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`);
      // 3. Small capsule (231x87, compact banner) — 100% verified
      images.push(`https://cdn.akamai.steamstatic.com/steam/apps/${appId}/capsule_231x87.jpg`);
    }
  } else {
    // For non-Steam images (software products with z-cdn URLs)
    images.push(product.image);
  }

  return [...new Set(images)];
}

function getDeliveryInfo(product: GameProduct) {
  const cat = product.category;
  const isSoftware = cat === 'Software y Licencias' || product.tags?.includes('software');

  if (isSoftware) {
    return {
      typeLabel: 'Licencia de Software (Product Key)',
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      whatYouReceive: [
        'Product Key / Clave de activacion original',
        'Activacion online valida a traves del servidor oficial',
        '1 activacion por clave (1 dispositivo)',
        'Instrucciones de descarga e instalacion paso a paso',
        'Soporte tecnico por 30 dias',
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
    typeLabel: 'Link de Reclamo + Instrucciones',
    color: 'bg-violet-50 border-violet-200 text-violet-800',
    whatYouReceive: [
      'Link directo para reclamar el juego gratis',
      'Instrucciones paso a paso para canjear en ' + product.platform,
      'El juego se vincula permanentemente a tu cuenta',
      'Descarga inmediata desde la plataforma oficial',
      'Soporte tecnico por 30 dias',
    ],
    howItWorks: [
      'Recibes las instrucciones al instante tras el pago',
      'Haces clic en el link de reclamo proporcionado',
      'Inicias sesion con tu cuenta personal de la plataforma',
      'El juego se agrega a tu biblioteca permanentemente',
    ],
  };
}

/* ══════════════════════════════════════════════════════════════
   IMAGE GALLERY — Full-width hero style with thumbnails
   ══════════════════════════════════════════════════════════════ */
function ImageGallery({ images, productName }: { images: string[]; productName: string }) {
  const [current, setCurrent] = useState(0);
  const [failed, setFailed] = useState<Set<number>>(new Set());
  const [imgLoaded, setImgLoaded] = useState(false);

  const validImages = useMemo(() => {
    return images.filter((_, i) => !failed.has(i));
  }, [failed, images]);

  const handleImgError = (idx: number) => {
    setFailed(prev => new Set(prev).add(idx));
  };

  useEffect(() => {
    setCurrent(0);
    setFailed(new Set());
    setImgLoaded(false);
  }, [productName]);

  // Auto-advance gallery
  useEffect(() => {
    if (validImages.length <= 1) return;
    const t = setInterval(() => {
      setCurrent(c => {
        const next = (c + 1) % validImages.length;
        setImgLoaded(false);
        return next;
      });
    }, 5000);
    return () => clearInterval(t);
  }, [validImages.length]);

  if (validImages.length === 0) {
    return (
      <div className="aspect-[21/9] w-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        <Monitor className="w-20 h-20 text-gray-600" />
      </div>
    );
  }

  const displayImages = validImages;
  const currentImage = displayImages[current % displayImages.length];

  return (
    <div className="space-y-3">
      {/* Main image — full width, large */}
      <div className="relative w-full bg-gray-900 rounded-2xl overflow-hidden group/gallery shadow-2xl aspect-[21/9]">
        <img
          src={currentImage}
          alt={`${productName} - imagen ${current + 1}`}
          className={`w-full h-full object-cover transition-all duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="eager"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          onError={() => handleImgError(current)}
        />
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          </div>
        )}
        {/* Navigation arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={() => { setCurrent((current - 1 + displayImages.length) % displayImages.length); setImgLoaded(false); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-all hover:bg-black/70 hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setCurrent((current + 1) % displayImages.length); setImgLoaded(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-all hover:bg-black/70 hover:scale-110"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        {/* Image counter badge */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg">
            {current + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails strip */}
      {displayImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-2 px-1">
          {displayImages.map((img, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setImgLoaded(false); }}
              className={`shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${i === current ? 'border-violet-500 ring-2 ring-violet-500/30 shadow-lg' : 'border-transparent opacity-50 hover:opacity-90'}`}
            >
              <img src={img} alt="" className="w-20 h-11 object-cover" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MINI PRODUCT CARD (para recomendaciones)
   ══════════════════════════════════════════════════════════════ */
function MiniProductCard({ game, onClick }: { game: GameProduct; onClick: () => void }) {
  const discount = game.originalPrice && game.originalPrice > 0
    ? Math.round((1 - game.price / game.originalPrice) * 100) : 0;
  return (
    <button onClick={onClick} className="group text-left bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-full">
      <div className="relative aspect-[4/3] bg-gray-900 overflow-hidden">
        <img src={game.image} alt={game.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" decoding="async" width={200} height={150} />
        {discount > 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow">-{discount}%</span>}
        <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow">GRATIS</span>
      </div>
      <div className="p-3">
        <p className="text-[10px] text-violet-600 font-bold uppercase tracking-wider mb-1">{game.subcategory}</p>
        <h4 className="font-bold text-sm line-clamp-1 group-hover:text-violet-600 transition-colors">{game.name}</h4>
        <div className="flex items-center justify-between mt-2">
          <span className="text-base font-black text-violet-600">${game.price.toFixed(2)}</span>
          {game.originalPrice && game.originalPrice > game.price && (
            <span className="text-xs text-gray-400 line-through">${game.originalPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PRODUCT DETAIL — FULL SCREEN PROFESSIONAL PAGE
   ══════════════════════════════════════════════════════════════ */
export function ProductDetail({ product: initialProduct, onClose, allProducts: initialProducts }: { product: GameProduct; onClose: () => void; allProducts?: GameProduct[] }) {
  const addToCart = useStore(s => s.addToCart);
  const setCartOpen = useStore(s => s.setCartOpen);
  const [allProducts] = useState<GameProduct[]>(initialProducts || []);
  const [currentProduct, setCurrentProduct] = useState<GameProduct>(initialProduct);
  const [imageTab, setImageTab] = useState<'images' | 'video'>('images');
  const [mobileBuyFixed, setMobileBuyFixed] = useState(false);

  // Listen for scroll to show/hide mobile buy bar
  useEffect(() => {
    const handleScroll = () => {
      setMobileBuyFixed(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Reset when product changes
  useEffect(() => {
    setCurrentProduct(initialProduct);
    setImageTab('images');
    window.scrollTo({ top: 0 });
  }, [initialProduct.id]);

  const handleAddToCart = () => {
    addToCart(currentProduct as any);
    onClose();
    setTimeout(() => setCartOpen(true), 300);
  };

  const navigateToProduct = useCallback((nextProduct: GameProduct) => {
    setCurrentProduct(nextProduct);
    setImageTab('images');
    window.scrollTo({ top: 0 });
  }, []);

  const recommendations = useMemo(() => {
    if (allProducts.length === 0) return [];
    return allProducts
      .filter(g => g.id !== currentProduct.id)
      .map(g => {
        let score = 0;
        if (g.category === currentProduct.category) score += 3;
        const commonTags = g.tags.filter(t => currentProduct.tags.includes(t));
        score += commonTags.length * 2;
        if (g.subcategory === currentProduct.subcategory) score += 2;
        if (Math.abs(g.price - currentProduct.price) <= 1) score += 1;
        return { game: g, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(r => r.game);
  }, [allProducts, currentProduct]);

  const trailerUrl = getTrailerSearchUrl(currentProduct.name);
  const delivery = getDeliveryInfo(currentProduct);
  const discount = currentProduct.originalPrice
    ? Math.round(((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100)
    : 0;
  const savings = currentProduct.originalPrice ? (currentProduct.originalPrice - currentProduct.price).toFixed(2) : null;
  const productImages = getProductImages(currentProduct);
  const isSoftware = currentProduct.category === 'Software y Licencias' || currentProduct.tags?.includes('software');

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      {/* ═══ TOP NAV BAR ═══ */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 py-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-violet-600 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline">Volver a la tienda</span>
          </button>

          <div className="flex-1 text-center px-4">
            <h1 className="text-sm sm:text-base font-bold text-gray-800 truncate max-w-md mx-auto">{currentProduct.name}</h1>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-red-100 flex items-center justify-center transition-colors group"
          >
            <X className="w-4 h-4 text-gray-500 group-hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* ═══ SCROLLABLE CONTENT ═══ */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-8">

          {/* ═══ IMAGE GALLERY SECTION ═══ */}
          <div className="relative">
            <ImageGallery images={productImages} productName={currentProduct.name} />
            {/* Discount badge overlaid on gallery */}
            {discount > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-black px-4 py-2 rounded-xl shadow-xl">
                -{discount}% OFF
              </div>
            )}
          </div>

          {/* ═══ IMAGE / VIDEO TABS ═══ */}
          <div className="flex gap-1 bg-gray-100 rounded-2xl p-1.5 w-fit">
            <button
              onClick={() => setImageTab('images')}
              className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all ${imageTab === 'images' ? 'bg-white text-violet-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Eye className="w-4 h-4" /> Imagenes ({productImages.length})
            </button>
            <a
              href={trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setImageTab('video')}
              className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all ${imageTab === 'video' ? 'bg-white text-red-500 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Play className="w-4 h-4" /> Video Trailer
            </a>
          </div>

          {/* ═══ MAIN CONTENT: TWO COLUMNS ═══ */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* LEFT COLUMN — Product info */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {currentProduct.tags.slice(0, 8).map(tag => (
                  <span key={tag} className="text-xs font-bold px-3 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-100">
                    {tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, ' ')}
                  </span>
                ))}
              </div>

              {/* Title + Category */}
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-tight mb-3">{currentProduct.name}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5 font-semibold text-violet-600">
                    <Tag className="w-4 h-4" />
                    {currentProduct.subcategory}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span>{currentProduct.platform}</span>
                  <span className="text-gray-300">|</span>
                  <span>{currentProduct.region}</span>
                </div>
              </div>

              {/* Rating + Stats row */}
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-5 h-5 ${s <= currentProduct.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <span className="font-bold text-gray-800">{currentProduct.rating}</span>
                  <span className="text-sm text-gray-400">({currentProduct.reviews.toLocaleString()} resenas)</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{currentProduct.sold.toLocaleString()} vendidos</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{currentProduct.stock > 100 ? 'Stock ilimitado' : `${currentProduct.stock} disponibles`}</span>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* ═══ DESCRIPTION ═══ */}
              <div className="space-y-4">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <Info className="w-5 h-5 text-violet-500" />
                  Descripcion del Producto
                </h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  {currentProduct.description}
                </p>
                {isSoftware && (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3">
                    <p className="text-base font-bold text-blue-800 flex items-center gap-2">
                      <Download className="w-5 h-5" /> Software Original con Licencia
                    </p>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      Este producto es un software original con licencia valida. Recibiras una clave de activacion (Product Key) que podras utilizar para activar la version completa del software. La licencia es personal e intransferible, valida para 1 dispositivo. Incluye todas las funcionalidades del producto y actualizaciones oficiales durante el periodo de la licencia.
                    </p>
                  </div>
                )}
                {!isSoftware && (
                  <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5 space-y-3">
                    <p className="text-base font-bold text-violet-800 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" /> Juego Gratis — 100% Ganancia
                    </p>
                    <p className="text-sm text-violet-700 leading-relaxed">
                      Este juego fue obtenido gratuitamente de {currentProduct.subcategory}. Al comprar, recibiras las instrucciones paso a paso para reclamarlo y agregarlo permanentemente a tu cuenta personal. El juego es 100% original, se descarga directamente desde la plataforma oficial y es tuyo para siempre. Sin costos ocultos, sin suscripciones.
                    </p>
                  </div>
                )}
              </div>

              {/* Quick info grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Entrega</p>
                  <p className="text-sm font-bold text-gray-800 mt-1">{currentProduct.deliveryTime}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <Globe className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Region</p>
                  <p className="text-sm font-bold text-gray-800 mt-1">{currentProduct.region}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <Package className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Stock</p>
                  <p className="text-sm font-bold text-gray-800 mt-1">{currentProduct.stock > 100 ? 'Ilimitado' : currentProduct.stock}</p>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* ═══ WHAT YOU RECEIVE ═══ */}
              <div className="space-y-4">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-violet-500" />
                  Que recibiras al comprar
                </h3>
                <div className={`rounded-2xl border p-5 ${delivery.color}`}>
                  <p className="text-base font-bold mb-4">Tipo de entrega: {delivery.typeLabel}</p>
                  <div className="space-y-3">
                    {delivery.whatYouReceive.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 opacity-70" />
                        <span className="text-sm leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ═══ HOW IT WORKS ═══ */}
              <div className="space-y-4">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                  Como funciona la entrega
                </h3>
                <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                  {delivery.howItWorks.map((step, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 text-sm font-black flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ═══ GUARANTEE ═══ */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4">
                <Shield className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-base font-bold text-emerald-800">Garantia y Soporte 24/7</p>
                  <p className="text-sm text-emerald-700 mt-2 leading-relaxed">
                    Todos nuestros productos incluyen garantia de 30 dias. Si tienes cualquier problema con tu compra, nuestro equipo de soporte esta disponible 24/7 para ayudarte con la activacion o reemplazo.
                  </p>
                </div>
              </div>

              {/* ═══ TRUST STRIP ═══ */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Shield, text: 'Pago Seguro', desc: 'Encriptacion SSL' },
                  { icon: Zap, text: 'Entrega Inmediata', desc: '< 1 minuto' },
                  { icon: Truck, text: 'Digital 100%', desc: 'Sin envios fisicos' },
                  { icon: RotateCcw, text: 'Garantia 30 Dias', desc: 'Reembolso total' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{item.text}</p>
                      <p className="text-[10px] text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN — Price + Buy (sticky) */}
            <div className="w-full lg:w-80 xl:w-96 shrink-0">
              <div className="sticky top-20 space-y-5">
                {/* Price card */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-black text-violet-600">${currentProduct.price.toFixed(2)}</span>
                    <span className="text-base text-gray-400 font-medium">USD</span>
                  </div>
                  {currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base text-gray-400 line-through">${currentProduct.originalPrice.toFixed(2)}</span>
                      <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-lg">-{discount}%</span>
                    </div>
                  )}
                  {savings && (
                    <p className="text-sm text-emerald-600 font-semibold mb-4">Ahorras ${savings} USD</p>
                  )}
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2.5 text-base"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Agregar al Carrito
                  </button>
                  <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Pago seguro</span>
                    <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Instantaneo</span>
                    <span className="flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> 30 dias</span>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
                    <Heart className="w-4 h-4" /> Favorito
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
                    <Share2 className="w-4 h-4" /> Compartir
                  </button>
                </div>

                {/* Payment methods */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Metodos de pago aceptados</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'MercadoPago', bg: 'bg-blue-100', text: 'text-blue-700', abbr: 'MP' },
                      { name: 'PayPal', bg: 'bg-blue-50', text: 'text-blue-600', abbr: 'PP' },
                      { name: 'Bitcoin', bg: 'bg-amber-100', text: 'text-amber-700', abbr: 'BTC' },
                      { name: 'USDT', bg: 'bg-emerald-100', text: 'text-emerald-700', abbr: 'USDT' },
                    ].map(m => (
                      <div key={m.name} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center text-[10px] font-black ${m.text}`}>{m.abbr}</div>
                        <span className="text-sm font-semibold text-gray-700">{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery type info */}
                <div className={`rounded-2xl border p-4 ${delivery.color}`}>
                  <p className="text-sm font-bold mb-1">{delivery.typeLabel}</p>
                  <p className="text-xs opacity-80">Entrega automatica tras confirmar el pago</p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ RECOMMENDATIONS SECTION ═══ */}
          {recommendations.length > 0 && (
            <>
              <hr className="border-gray-200" />
              <div className="space-y-5 pb-8">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">Productos Similares</h3>
                    <p className="text-sm text-gray-500">Basados en &ldquo;{currentProduct.name}&rdquo; — te pueden interesar</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {recommendations.map(g => (
                    <MiniProductCard key={g.id} game={g} onClick={() => navigateToProduct(g)} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══ MOBILE FIXED BUY BAR ═══ */}
      {mobileBuyFixed && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">{currentProduct.name}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-violet-600">${currentProduct.price.toFixed(2)}</span>
              {currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price && (
                <span className="text-xs text-gray-400 line-through">${currentProduct.originalPrice.toFixed(2)}</span>
              )}
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-violet-500/25 flex items-center gap-2 text-sm whitespace-nowrap"
          >
            <ShoppingCart className="w-4 h-4" />
            Comprar
          </button>
        </div>
      )}
    </div>
  );
}