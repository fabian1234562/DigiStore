'use client';

import { useStore, Product } from '@/lib/store';
import {
  ShoppingCart, Star, Zap, Clock, Globe, Shield, CheckCircle2,
  Package, ArrowRight, X, Info, Monitor, Heart, Share2,
  Play, ChevronLeft, ChevronRight, Sparkles, Send, Eye,
  Download, Tag, ThumbsUp, Users,
} from 'lucide-react';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

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

// Generate YouTube search URL for a game trailer
function getTrailerSearchUrl(name: string): string {
  const q = encodeURIComponent(name + ' official trailer gameplay');
  return `https://www.youtube.com/results?search_query=${q}`;
}

// Generate additional "screenshot" URLs by varying Steam CDN image types
function getExtraImages(product: GameProduct): string[] {
  const images: string[] = [product.image];
  
  // If it's a Steam CDN image, generate header and library variants
  if (product.image.includes('cdn.akamai.steamstatic.com/steam/apps/')) {
    const match = product.image.match(/steam\/apps\/(\d+)/);
    if (match) {
      const appId = match[1];
      images.push(
        `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`,
        `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`,
        `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/capsule_231x87.jpg`,
      );
    }
  }
  
  return images;
}

function getDeliveryInfo(product: Product) {
  const cat = product.category;
  const isSoftware = cat === 'Software y Licencias' || product.tags?.includes('software');
  const isGame = cat === 'Juegos Gratis' || cat === 'gaming';

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
   MINI PRODUCT CARD (para recomendaciones)
   ══════════════════════════════════════════════════════════════ */
function MiniProductCard({ game, onClick }: { game: GameProduct; onClick: () => void }) {
  const discount = game.originalPrice && game.originalPrice > 0
    ? Math.round((1 - game.price / game.originalPrice) * 100) : 0;
  return (
    <button onClick={onClick} className="group text-left bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 w-full">
      <div className="relative aspect-[4/3] bg-gray-900 overflow-hidden">
        <img src={game.image} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" width={200} height={150} />
        {discount > 0 && <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">-{discount}%</span>}
        <span className="absolute top-1.5 right-1.5 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">GRATIS</span>
      </div>
      <div className="p-2">
        <p className="text-[10px] text-violet-600 font-bold uppercase tracking-wider mb-0.5">{game.subcategory}</p>
        <h4 className="font-bold text-xs line-clamp-1 group-hover:text-violet-600 transition-colors">{game.name}</h4>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm font-black text-violet-600">${game.price.toFixed(2)}</span>
          {game.originalPrice && game.originalPrice > game.price && (
            <span className="text-[10px] text-gray-400 line-through">${game.originalPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   IMAGE GALLERY
   ══════════════════════════════════════════════════════════════ */
function ImageGallery({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [failed, setFailed] = useState<Set<number>>(new Set());

  const validImages = useMemo(() => 
    images.filter((_, i) => !failed.has(i)),
    [failed, images]
  );

  const handleImgError = (idx: number) => {
    setFailed(prev => new Set(prev).add(idx));
  };

  // Auto-advance to next valid image
  useEffect(() => {
    if (validImages.length <= 1) return;
    const t = setInterval(() => {
      setCurrent(c => (c + 1) % validImages.length);
    }, 4000);
    return () => clearInterval(t);
  }, [validImages.length]);

  if (validImages.length === 0) {
    return (
      <div className="aspect-video w-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        <Monitor className="w-16 h-16 text-gray-600" />
      </div>
    );
  }

  const displayImages = validImages.length > 0 ? validImages : [images[0]];
  const currentImage = displayImages[current % displayImages.length];

  return (
    <div className="space-y-2">
      {/* Main image */}
      <div className="relative aspect-video w-full bg-gray-900 rounded-xl overflow-hidden group/gallery">
        <img
          src={currentImage}
          alt="Product screenshot"
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="eager"
          decoding="async"
          width={616}
          height={353}
          onError={() => handleImgError(current)}
        />
        {displayImages.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((current - 1 + displayImages.length) % displayImages.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrent((current + 1) % displayImages.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
        {/* Image counter */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {current + 1} / {displayImages.length}
          </div>
        )}
      </div>
      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {displayImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`shrink-0 w-16 h-10 rounded-lg overflow-hidden border-2 transition-all ${i === current ? 'border-violet-500 ring-2 ring-violet-500/30' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" width={64} height={40} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PRODUCT DETAIL COMPONENT
   ══════════════════════════════════════════════════════════════ */
export function ProductDetail() {
  const { selectedProduct, productDetailOpen, setProductDetailOpen, setSelectedProduct, addToCart, setCartOpen } = useStore();
  const [allProducts, setAllProducts] = useState<GameProduct[]>([]);
  const [imageTab, setImageTab] = useState<'images' | 'video'>('images');
  const overlayRef = useRef<HTMLDivElement>(null);

  // Fetch all products for recommendations
  useEffect(() => {
    if (productDetailOpen) {
      fetch('/api/scanner/results?products=true')
        .then(r => r.json())
        .then(d => { if (d.success) setAllProducts(d.games || d.products || []); })
        .catch(() => {});
    }
  }, [productDetailOpen]);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && productDetailOpen) {
        setProductDetailOpen(false);
        setTimeout(() => setSelectedProduct(null), 300);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [productDetailOpen, setProductDetailOpen, setSelectedProduct]);

  // Lock body scroll when open
  useEffect(() => {
    if (productDetailOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [productDetailOpen]);

  const close = useCallback(() => {
    setProductDetailOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  }, [setProductDetailOpen, setSelectedProduct]);

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    addToCart(selectedProduct);
    close();
    setTimeout(() => setCartOpen(true), 300);
  };

  const navigateToProduct = useCallback((product: GameProduct) => {
    setSelectedProduct(product as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setSelectedProduct]);

  if (!selectedProduct || !productDetailOpen) return null;

  const product = selectedProduct as unknown as GameProduct;
  const delivery = getDeliveryInfo(selectedProduct);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const savings = product.originalPrice ? (product.originalPrice - product.price).toFixed(2) : null;
  const extraImages = getExtraImages(product);
  const isSoftware = product.category === 'Software y Licencias' || product.tags?.includes('software');

  // Recommendations: products with matching tags, same category, or similar price range
  const recommendations = useMemo(() => {
    if (allProducts.length === 0) return [];
    return allProducts
      .filter(g => g.id !== product.id)
      .map(g => {
        let score = 0;
        // Same category bonus
        if (g.category === product.category) score += 3;
        // Matching tags bonus
        const commonTags = g.tags.filter(t => product.tags.includes(t));
        score += commonTags.length * 2;
        // Same source bonus
        if (g.subcategory === product.subcategory) score += 2;
        // Similar price range
        if (Math.abs(g.price - product.price) <= 1) score += 1;
        return { game: g, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(r => r.game);
  }, [allProducts, product]);

  const trailerUrl = getTrailerSearchUrl(product.name);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
      
      {/* Modal */}
      <div ref={overlayRef} className="relative z-10 w-full max-w-4xl mx-4 my-4 sm:my-8 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={close}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto flex-1">
          {/* Hero image area with discount badge */}
          <div className="relative">
            <ImageGallery images={extraImages} />
            {discount > 0 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
                -{discount}% OFF
              </div>
            )}
            <span className="absolute top-3 right-14 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-lg">
              GRATIS
            </span>
          </div>

          {/* Image / Video tabs */}
          <div className="px-4 sm:px-6 pt-4">
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
              <button
                onClick={() => setImageTab('images')}
                className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-all ${imageTab === 'images' ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Eye className="w-3.5 h-3.5" /> Imagenes
              </button>
              <a
                href={trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setImageTab('video')}
                className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-all ${imageTab === 'video' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Play className="w-3.5 h-3.5" /> Video Trailer
              </a>
            </div>
          </div>

          {/* Content area: two columns on desktop */}
          <div className="px-4 sm:px-6 py-5">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* LEFT: Product info */}
              <div className="flex-1 space-y-5">
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.slice(0, 6).map(tag => (
                    <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100">
                      {tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">{product.name}</h2>
                  <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5" />
                    {product.subcategory} &middot; {product.platform}
                  </p>
                </div>

                {/* Rating and stats */}
                <div className="flex items-center gap-5 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= product.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <span className="font-bold ml-1">{product.rating}</span>
                    <span className="text-gray-400">({product.reviews.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{product.sold.toLocaleString()} vendidos</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{product.stock > 100 ? 'Stock ilimitado' : `${product.stock} disponibles`}</span>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* DESCRIPTION - Full and prominent */}
                <div className="space-y-3">
                  <h3 className="font-bold text-base flex items-center gap-2 text-gray-900">
                    <Info className="w-4 h-4 text-violet-500" />
                    Descripcion del Producto
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                  {isSoftware && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                      <p className="text-sm font-bold text-blue-800 flex items-center gap-2">
                        <Download className="w-4 h-4" /> Software Original con Licencia
                      </p>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        Este producto es un software original con licencia valida. Recibiras una clave de activacion (Product Key) que podras utilizar para activar la version completa del software. La licencia es personal e intransferible, valida para 1 dispositivo. Incluye todas las funcionalidades del producto y actualizaciones oficiales durante el periodo de la licencia.
                      </p>
                    </div>
                  )}
                  {!isSoftware && (
                    <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 space-y-2">
                      <p className="text-sm font-bold text-violet-800 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Juego Gratis — 100% Ganancia
                      </p>
                      <p className="text-xs text-violet-700 leading-relaxed">
                        Este juego fue obtenido gratuitamente de {product.subcategory}. Al comprar, recibiras las instrucciones paso a paso para reclamarlo y agregarlo permanentemente a tu cuenta personal. El juego es 100% original, se descarga directamente desde la plataforma oficial y es tuyo para siempre. Sin costos ocultos, sin suscripciones.
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick info grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <Clock className="w-5 h-5 mx-auto mb-1.5 text-blue-500" />
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Entrega</p>
                    <p className="text-xs font-bold text-gray-800">{product.deliveryTime}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <Globe className="w-5 h-5 mx-auto mb-1.5 text-purple-500" />
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Region</p>
                    <p className="text-xs font-bold text-gray-800">{product.region}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <Package className="w-5 h-5 mx-auto mb-1.5 text-emerald-500" />
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Stock</p>
                    <p className="text-xs font-bold text-gray-800">{product.stock > 100 ? 'Ilimitado' : product.stock}</p>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* What you receive */}
                <div className="space-y-3">
                  <h3 className="font-bold text-base flex items-center gap-2 text-gray-900">
                    <Package className="w-4 h-4 text-violet-500" />
                    Que recibiras al comprar
                  </h3>
                  <div className={`rounded-xl border p-4 ${delivery.color}`}>
                    <p className="text-sm font-bold mb-3">Tipo de entrega: {delivery.typeLabel}</p>
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

                {/* How it works */}
                <div className="space-y-3">
                  <h3 className="font-bold text-base flex items-center gap-2 text-gray-900">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    Como funciona la entrega
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    {delivery.howItWorks.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guarantee */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Garantia y Soporte 24/7</p>
                    <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                      Todos nuestros productos incluyen garantia de 30 dias. Si tienes cualquier problema con tu compra, nuestro equipo de soporte esta disponible 24/7 para ayudarte con la activacion o reemplazo.
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT: Price + Buy + Actions */}
              <div className="w-full lg:w-72 shrink-0">
                <div className="sticky top-4 space-y-4">
                  {/* Price card */}
                  <div className="bg-gray-50 rounded-2xl p-5 border">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-black text-violet-600">${product.price.toFixed(2)}</span>
                      <span className="text-sm text-gray-400">USD</span>
                    </div>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                        <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
                      </div>
                    )}
                    {savings && (
                      <p className="text-xs text-emerald-600 font-semibold mb-3">Ahorras ${savings} USD</p>
                    )}
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 text-sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Agregar al Carrito
                    </button>
                    <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Pago seguro</span>
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Instantaneo</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 30 dias</span>
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                      <Heart className="w-3.5 h-3.5" /> Favorito
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                      <Share2 className="w-3.5 h-3.5" /> Compartir
                    </button>
                  </div>

                  {/* Payment methods */}
                  <div className="bg-gray-50 rounded-2xl p-4 border">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Metodos de pago</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600">
                        <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-600">MP</div>
                        MercadoPago
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600">
                        <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-700">PP</div>
                        PayPal
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600">
                        <div className="w-5 h-5 rounded bg-amber-100 flex items-center justify-center text-[8px] font-bold text-amber-600">B</div>
                        Bitcoin
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600">
                        <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center text-[8px] font-bold text-emerald-600">U</div>
                        USDT
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RECOMMENDATIONS SECTION */}
            {recommendations.length > 0 && (
              <>
                <hr className="border-gray-100 my-6" />
                <div className="space-y-4 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900">Productos Similares</h3>
                      <p className="text-xs text-gray-500">Basados en &ldquo;{product.name}&rdquo; — te pueden interesar</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {recommendations.map(g => (
                      <MiniProductCard key={g.id} game={g} onClick={() => navigateToProduct(g)} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}