'use client';

import { useStore } from '@/lib/store';
import dynamic from 'next/dynamic';
const CartDrawer = dynamic(() => import('@/components/store/CartDrawer').then(m => ({ default: m.CartDrawer })), { ssr: false });
const AuthDialog = dynamic(() => import('@/components/auth/AuthDialog').then(m => ({ default: m.AuthDialog })), { ssr: false });
const ProductDetail = dynamic(() => import('@/components/store/ProductDetailModal').then(m => ({ default: m.ProductDetailModal })), { ssr: false });
const ScannerStatus = dynamic(() => import('@/components/store/ScannerStatus').then(m => ({ default: m.ScannerStatus })), { ssr: false });
const SharedHeader = dynamic(() => import('@/components/store/SharedHeader').then(m => ({ default: m.SharedHeader })), { ssr: false });
import {
  ShoppingCart, Search, Zap, Shield, LogIn, Menu, ArrowRight,
  Gamepad2, Crown, Filter, X, Star, Send, SlidersHorizontal, Heart,
  Flame, TrendingUp, Sparkles, Eye, Tag, Shield as ShieldIcon,
  Lock, HardDrive, Wrench, Save, Wifi, Palette, Video, Cpu,
} from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { normalizeProductPricing } from '@/lib/pricing';

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

// Tabs principales: Juegos | Software
type MainTab = 'juegos' | 'software' | 'all';

// Categorías de juegos (basadas en fuentes reales)
const JUEGOS_CATEGORIES = [
  { id: 'all', name: 'Todos', icon: Gamepad2 },
  { id: 'Epic Games', name: 'Epic Games', icon: Flame },
  { id: 'Prime Gaming', name: 'Prime Gaming', icon: Crown },
  { id: 'GOG.com', name: 'GOG.com', icon: Tag },
  { id: 'Humble Bundle', name: 'Humble Bundle', icon: Heart },
  { id: 'IndieGala', name: 'IndieGala', icon: Sparkles },
  { id: 'Fanatical', name: 'Fanatical', icon: TrendingUp },
  { id: 'Steam', name: 'Steam', icon: Gamepad2 },
];

// Categorías de software (las MÁS VIRALES primero)
const SOFTWARE_CATEGORIES = [
  { id: 'all', name: 'Todos', icon: Shield },
  // IA - lo más viral primero
  { id: 'IA Clonación de Voz', name: '🎤 IA Voz', icon: Cpu },
  { id: 'IA Face Swap', name: '👤 IA Face Swap', icon: Cpu },
  { id: 'IA Generación de Video', name: '🎬 IA Video', icon: Video },
  { id: 'IA Generación de Imagen', name: '🎨 IA Imagen', icon: Palette },
  { id: 'IA Texto a Voz', name: '🗣 IA TTS', icon: Cpu },
  { id: 'IA Chat Local', name: '🤖 IA Chat', icon: Cpu },
  { id: 'IA Transcripción', name: '📝 IA Transcripción', icon: Cpu },
  { id: 'IA Lip Sync', name: '👄 IA Lip Sync', icon: Cpu },
  // Hackeo ético - segundo más viral
  { id: 'Hackeo Ético', name: '🛡 Hackeo Ético', icon: Shield },
  // Software tradicional
  { id: 'Antivirus', name: '🛡 Antivirus', icon: Shield },
  { id: 'VPN', name: '🔐 VPN', icon: Lock },
  { id: 'Utilidad', name: '🔧 Utilidades', icon: Wrench },
  { id: 'Backup', name: '💾 Backup', icon: Save },
  { id: 'Privacidad', name: '🔒 Privacidad', icon: Lock },
  { id: 'Editor de código', name: '💻 Código', icon: Cpu },
  { id: 'Edición de video', name: '🎬 Video', icon: Video },
  { id: 'Edición de audio', name: '🎵 Audio', icon: Video },
  { id: 'Edición de imagen', name: '🎨 Imagen', icon: Palette },
  { id: 'Ofimática', name: '📊 Ofimática', icon: Save },
  { id: '3D Modeling', name: '🧊 3D', icon: Cpu },
  { id: 'Reproductor multimedia', name: '▶ Player', icon: Video },
  { id: 'Navegador web', name: '🌐 Browser', icon: Wifi },
];

function StoreHeader() {
  // Use shared premium header - ahora con activePage='store'
  return <SharedHeader activePage="store" />;
}

function StoreFooter() {
  return (
    <footer className="relative bg-gradient-to-b from-[#0f0a1e] via-[#1a1333] to-[#0a0a0f] text-white mt-12 overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_20%_30%,white,transparent_40%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-glow-violet">
              <Gamepad2 className="w-4.5 h-4.5 text-white" style={{ width: '18px', height: '18px' }} />
            </div>
            <div>
              <p className="text-sm font-bold text-gradient-violet">DigiStore</p>
              <p className="text-[10px] text-gray-500">Productos digitales al mejor precio</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <Link href="/" className="hover:text-violet-300 transition-colors">Inicio</Link>
            <span>·</span>
            <Link href="/juegos-gratis" className="hover:text-emerald-300 transition-colors">Juegos Gratis</Link>
            <span>·</span>
            <Link href="/tienda" className="hover:text-amber-300 transition-colors">Tienda</Link>
          </div>
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} DigiStore</p>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════
   PRODUCT CARD — Premium responsive, click abre detalle
   ══════════════════════════════════════════════════════════════ */
function StoreCard({ game }: { game: GameProduct }) {
  const { addToCart, setSelectedProduct, setProductDetailOpen } = useStore();
  const discount = game.originalPrice && game.originalPrice > game.price
    ? Math.round((1 - game.price / game.originalPrice) * 100) : 0;

  const openDetail = () => {
    setSelectedProduct(game as any);
    setProductDetailOpen(true);
  };

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-violet-200 hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col"
      onClick={openDetail}
    >
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
        <img
          src={game.image}
          alt={game.name}
          width={616}
          height={353}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={e => { (e.target as HTMLImageElement).src = '/products/gen/gaming-cat.png'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {discount > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg">
            -{discount}%
          </span>
        )}
        {/* Badge DIGISTORE */}
        <span className="absolute top-2.5 right-2.5 bg-violet-600/95 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-lg uppercase tracking-wider">
          DigiStore
        </span>
        {/* Hover overlay con eye icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <Eye className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
      <div className="p-3 sm:p-3.5 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-1.5">
          <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider truncate">{game.subcategory}</p>
          {game.rating >= 4 && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
        </div>
        <h3 className="font-bold text-sm leading-tight mb-1.5 line-clamp-2 group-hover:text-violet-700 transition-colors">
          {game.name}
        </h3>
        {/* DESCRIPCIÓN visible (2 líneas) */}
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed flex-1 hidden sm:block">
          {game.description}
        </p>
        <div className="flex items-center justify-between mt-auto gap-2">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-base sm:text-lg font-black text-violet-600">${game.price.toFixed(2)}</span>
            {game.originalPrice && game.originalPrice > game.price && (
              <span className="text-[10px] sm:text-xs text-gray-400 line-through">${game.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); addToCart(game as any); }}
            className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition-all hover:scale-105 shadow-md shadow-violet-500/20 whitespace-nowrap shrink-0"
          >
            + Carrito
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECCIÓN DE RECOMENDACIONES — igual estilo que el home
   ══════════════════════════════════════════════════════════════ */
function RecommendationSection({
  games,
  title,
  subtitle,
  icon: Icon,
  filterFn,
  accentColor = 'violet',
}: {
  games: GameProduct[];
  title: string;
  subtitle: string;
  icon: React.ElementType;
  filterFn: (g: GameProduct) => boolean;
  accentColor?: 'violet' | 'amber' | 'emerald' | 'rose';
}) {
  const items = useMemo(() => games.filter(filterFn).slice(0, 8), [games, filterFn]);
  if (items.length === 0) return null;

  const colorMap: Record<string, string> = {
    violet: 'from-violet-600 to-indigo-600',
    amber: 'from-amber-500 to-orange-600',
    emerald: 'from-emerald-500 to-teal-600',
    rose: 'from-rose-500 to-pink-600',
  };

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[accentColor]} flex items-center justify-center shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(game => (
          <StoreCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}

export default function TiendaPage() {
  const [games, setGames] = useState<GameProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [mainTab, setMainTab] = useState<MainTab>('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);

  const loadGames = useCallback(async () => {
    try {
      const res = await fetch('/api/scanner/results?products=true&filter=paid');
      const data = await res.json();
      if (data.success) {
        const raw: GameProduct[] = data.games || data.products || [];
        const normalized = raw.map(g => normalizeProductPricing(g as any));
        setGames(normalized);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadGames(); }, [loadGames]);

  // Productos por tab principal
  const juegosProducts = useMemo(() => games.filter(g => g.category !== 'Software y Licencias'), [games]);
  const softwareProducts = useMemo(() => games.filter(g => g.category === 'Software y Licencias'), [games]);

  // Tabs disponibles según el tab principal
  const currentCategories = mainTab === 'juegos' ? JUEGOS_CATEGORIES
                          : mainTab === 'software' ? SOFTWARE_CATEGORIES
                          : [{ id: 'all', name: 'Todos', icon: Gamepad2 }];

  const currentProducts = mainTab === 'juegos' ? juegosProducts
                       : mainTab === 'software' ? softwareProducts
                       : games;

  const filtered = currentProducts
    .filter(g => activeCategory === 'all' || g.subcategory === activeCategory)
    .filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      // Por defecto: ordenar por popularidad (rating * 1000 + sold)
      if (sortBy === 'popular' || sortBy === 'default') {
        const scoreA = (a.rating || 0) * 1000 + (a.sold || 0);
        const scoreB = (b.rating || 0) * 1000 + (b.sold || 0);
        return scoreB - scoreA;
      }
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  // Recomendaciones (solo de los productos del tab actual) - ordenadas por popularidad real
  const topSelling = useMemo(() => 
    [...currentProducts]
      .sort((a, b) => ((b.rating || 0) * 1000 + (b.sold || 0)) - ((a.rating || 0) * 1000 + (a.sold || 0)))
      .slice(0, 12), [currentProducts]);
  const topRated = useMemo(() => 
    [...currentProducts]
      .filter(g => (g.rating || 0) >= 4)
      .sort((a, b) => ((b.rating || 0) * 1000 + (b.sold || 0)) - ((a.rating || 0) * 1000 + (a.sold || 0)))
      .slice(0, 12), [currentProducts]);
  const expiringSoon = useMemo(() => 
    currentProducts.filter(g => g.featured)
      .sort((a, b) => (b.originalPrice || 0) - (a.originalPrice || 0))
      .slice(0, 12), [currentProducts]);

  const hasActiveSearch = search || activeCategory !== 'all' || sortBy !== 'popular' || mainTab !== 'all';

  return (
    <div className="min-h-screen bg-gray-50/50">
      <StoreHeader />

      {/* Hero Banner premium */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-700 to-purple-800 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,white,transparent_50%)]" />
        <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,white_20px,white_21px)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 animate-fade-in">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full mb-3 shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Productos Premium · Precios $1 a $5
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight mb-2">Tienda Digital</h1>
              <p className="text-sm sm:text-base text-white/85">
                {games.length} productos · Precios $1.00 - $4.99 · Entrega inmediata
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                🎮 {juegosProducts.length} Juegos
              </span>
              <span className="bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                💾 {softwareProducts.length} Software
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scanner Status bar — visible & actionable */}
      <ScannerStatus variant="inline" />

      {/* ═══ TABS PRINCIPALES: Juegos | Software | Todo ═══ */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-3 sm:px-6">
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => { setMainTab('all'); setActiveCategory('all'); }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                mainTab === 'all'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              Todo
              <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{games.length}</span>
            </button>
            <button
              onClick={() => { setMainTab('juegos'); setActiveCategory('all'); }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                mainTab === 'juegos'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Flame className="w-4 h-4" />
              Juegos
              <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{juegosProducts.length}</span>
            </button>
            <button
              onClick={() => { setMainTab('software'); setActiveCategory('all'); }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                mainTab === 'software'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Shield className="w-4 h-4" />
              Software
              <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{softwareProducts.length}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ RECOMENDACIONES — productos más virales primero ═══ */}
      {!hasActiveSearch && !loading && (
        <>
          <RecommendationSection
            games={topSelling}
            title="🔥 Más Populares"
            subtitle="Los productos más vendidos y virales de DigiStore"
            icon={Flame}
            filterFn={() => true}
            accentColor="rose"
          />
          <RecommendationSection
            games={topRated}
            title="⭐ Mejor Valorados"
            subtitle="Calificación 4+ estrellas garantizada"
            icon={Star}
            filterFn={(g) => (g.rating || 0) >= 4}
            accentColor="violet"
          />
          <RecommendationSection
            games={expiringSoon}
            title="💎 Mayor Valor"
            subtitle="Productos con mayor valor original"
            icon={TrendingUp}
            filterFn={(g) => g.featured}
            accentColor="amber"
          />
        </>
      )}

      {/* ═══ CATÁLOGO COMPLETO con filtros ═══ */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-60 shrink-0">
            <div className="bg-white rounded-2xl border p-4 space-y-4 sticky top-20">
              <h3 className="font-bold text-sm flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Categorías</h3>
              <div>
                <div className="mt-1.5 space-y-1">
                  {currentCategories.map(c => {
                    const Icon = c.icon;
                    const count = c.id === 'all'
                      ? currentProducts.length
                      : currentProducts.filter(g => g.subcategory === c.id).length;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setActiveCategory(c.id)}
                        className={`flex items-center gap-2 justify-between w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                          activeCategory === c.id
                            ? 'bg-violet-100 text-violet-700 font-semibold'
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{c.name}</span>
                        </span>
                        <span className="text-[10px] text-gray-400 ml-2 shrink-0">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Ordenar</label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="mt-1.5 w-full text-sm border rounded-lg px-3 py-2 bg-white">
                  <option value="popular">Más vendidos</option>
                  <option value="price-asc">Precio: menor a mayor</option>
                  <option value="price-desc">Precio: mayor a menor</option>
                  <option value="rating">Mejor valorados</option>
                </select>
              </div>
              <div className="pt-3 border-t">
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  💡 Todos los productos entre <strong className="text-violet-600">$1.00</strong> y <strong className="text-violet-600">$4.99</strong> USD
                </p>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Buscar productos..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
              </div>
              <button onClick={() => setShowFilters(true)} className="lg:hidden p-2.5 border rounded-xl hover:bg-gray-100"><Filter className="w-5 h-5" /></button>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Cargando productos...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <Gamepad2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron productos</p>
                <button onClick={() => { setSearch(''); setActiveCategory('all'); setSortBy('popular'); }}
                  className="mt-4 text-violet-600 text-sm font-semibold hover:underline">
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-500">
                    Mostrando <strong className="text-gray-700">{filtered.length}</strong> productos
                    {hasActiveSearch && <button onClick={() => { setSearch(''); setActiveCategory('all'); setSortBy('popular'); }} className="ml-2 text-violet-600 hover:underline">limpiar</button>}
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(game => (
                    <StoreCard key={game.id} game={game} />
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Filtros</h3>
              <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Categoría</label>
                <div className="mt-1.5 space-y-1">
                  {currentCategories.map(c => {
                    const Icon = c.icon;
                    return (
                      <button key={c.id} onClick={() => { setActiveCategory(c.id); setShowFilters(false); }}
                        className={`flex items-center gap-2 block w-full text-left text-sm px-3 py-1.5 rounded-lg ${activeCategory === c.id ? 'bg-violet-100 text-violet-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}`}>
                        <Icon className="w-3.5 h-3.5" /> {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Ordenar</label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="mt-1.5 w-full text-sm border rounded-lg px-3 py-2 bg-white">
                  <option value="popular">Más vendidos</option>
                  <option value="price-asc">Precio: menor a mayor</option>
                  <option value="price-desc">Precio: mayor a menor</option>
                  <option value="rating">Mejor valorados</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      <StoreFooter />
      <CartDrawer />
      <AuthDialog />
      <ProductDetail />
    </div>
  );
}
