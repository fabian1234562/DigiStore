'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Search, Zap, Shield, RefreshCw, Gamepad2, ExternalLink,
  Clock, Flame, ArrowLeft, ArrowRight, Filter, X, Loader2, Eye,
  Monitor, Gift, Heart, Crown, Disc, Smartphone, Tag,
  Sparkles, TrendingUp, Star, ShoppingBag, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { GAME_SOURCES } from '@/lib/game-scanner';
import type { ScannedGame, GameSource } from '@/lib/game-scanner';
import { useStore } from '@/lib/store';

const ProductDetailModal = dynamic(() => import('@/components/store/ProductDetailModal').then(m => ({ default: m.ProductDetailModal })), { ssr: false });

type LucideIcon = React.ComponentType<{ className?: string }>;
const sourceIcons: Record<string, LucideIcon> = {
  'epic-games': Gamepad2,
  'gog': Disc,
  'steam': Monitor,
  'indiegala': Gift,
  'fanatical': Flame,
  'humble': Heart,
  'prime-gaming': Crown,
  'apple': Smartphone,
};

interface ProductForDetail {
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
   HEADER — con botón "Volver" bien visible
   ══════════════════════════════════════════════════════════════ */
function Header() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const { setCartOpen, setAuthOpen, cartCount } = useStore();
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent hidden sm:inline">DigiStore</span>
          </Link>
          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full hidden sm:inline-flex items-center gap-1">
            <Zap className="w-3 h-3" /> 100% GRATIS
          </span>
        </div>
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-violet-600 transition-colors px-3 py-2 rounded-lg hover:bg-violet-50">Inicio</Link>
          <Link href="/juegos-gratis" className="text-violet-600 bg-violet-50 px-3 py-2 rounded-lg flex items-center gap-1">
            Juegos Gratis <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">100%</span>
          </Link>
          <Link href="/tienda" className="hover:text-violet-600 transition-colors px-3 py-2 rounded-lg hover:bg-violet-50">Tienda</Link>
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={() => setCartOpen(true)} className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors">
            <ShoppingBag className="w-5 h-5 text-gray-700" />
            {cartCount() > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-violet-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                {cartCount()}
              </span>
            )}
          </button>
          <button onClick={() => setAuthOpen(true)} className="hidden sm:inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            Entrar
          </button>
          <button className="lg:hidden p-2 rounded-full hover:bg-gray-100" onClick={() => setMobileMenu(!mobileMenu)}>
            <Filter className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
      {mobileMenu && (
        <div className="lg:hidden border-t bg-white px-4 py-3 space-y-1">
          <Link href="/" className="block text-sm font-medium text-gray-700 hover:text-violet-600 hover:bg-violet-50 px-3 py-2 rounded-lg" onClick={() => setMobileMenu(false)}>Inicio</Link>
          <Link href="/juegos-gratis" className="block text-sm font-medium text-violet-600 bg-violet-50 px-3 py-2 rounded-lg" onClick={() => setMobileMenu(false)}>Juegos Gratis</Link>
          <Link href="/tienda" className="block text-sm font-medium text-gray-700 hover:text-violet-600 hover:bg-violet-50 px-3 py-2 rounded-lg" onClick={() => setMobileMenu(false)}>Tienda</Link>
        </div>
      )}
    </header>
  );
}

/* ══════════════════════════════════════════════════════════════
   PRODUCT CARD — gratis, con valor mostrado
   ══════════════════════════════════════════════════════════════ */
function FreeProductCard({
  game,
  onClaim,
  onView,
}: {
  game: ScannedGame;
  onClaim: (g: ScannedGame) => void;
  onView: (g: ScannedGame) => void;
}) {
  const SrcIcon = sourceIcons[game.source] || Gamepad2;
  const isExpiring = game.status === 'expiring';
  const originalPrice = game.originalPrice > 0 ? game.originalPrice : 0;
  const savings = originalPrice; // Lo que se ahorra el cliente = precio original completo

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden" onClick={() => onView(game)}>
        {game.imageUrl ? (
          <img src={game.imageUrl} alt={game.title} width={616} height={353} decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy"
            onError={e => { (e.target as HTMLImageElement).src = '/products/gen/gaming-cat.png'; }} />
        ) : (
          <div className="flex h-full items-center justify-center"><SrcIcon className="w-12 h-12 text-gray-700" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {/* Badge 100% GRATIS */}
        <span className="absolute top-2.5 left-2.5 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
          <Zap className="w-3 h-3" /> GRATIS
        </span>
        {/* Badge de descuento del valor */}
        {originalPrice > 0 && (
          <span className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg">
            Vale ${originalPrice.toFixed(0)}
          </span>
        )}
        {/* Badge expirando */}
        {isExpiring && (
          <span className="absolute bottom-2.5 left-2.5 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1 animate-pulse">
            <Clock className="w-3 h-3" /> Expira pronto
          </span>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
      <div className="p-3.5 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-1.5">
          <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">
            {GAME_SOURCES.find(s => s.id === game.source)?.name || game.source}
          </p>
        </div>
        <h3 className="font-bold text-sm leading-tight mb-1.5 line-clamp-2 group-hover:text-violet-600 transition-colors">
          {game.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed flex-1">{game.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-emerald-600">$0.00</span>
            {originalPrice > 0 && <span className="text-xs text-gray-400 line-through">${originalPrice.toFixed(2)}</span>}
          </div>
          <button onClick={() => onClaim(game)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-all hover:scale-105 shadow-md shadow-emerald-500/20 flex items-center gap-1">
            <Gift className="w-3.5 h-3.5" /> Reclamar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CLAIM MODAL — Cómo reclamar el juego gratis
   ══════════════════════════════════════════════════════════════ */
function ClaimModal({ game, onClose }: { game: ScannedGame | null; onClose: () => void }) {
  if (!game) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
        </button>
        {game.imageUrl && (
          <div className="relative aspect-video">
            <img src={game.imageUrl} alt={game.title} className="h-full w-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = '/products/gen/gaming-cat.png'; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" /> 100% GRATIS
            </span>
            {game.originalPrice > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
                Vale ${game.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">{game.title}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {game.platform.map(p => (
              <span key={p} className="rounded-md bg-violet-100 text-violet-700 px-2 py-1 text-xs font-semibold">{p}</span>
            ))}
            <span className="rounded-md bg-gray-100 text-gray-600 px-2 py-1 text-xs font-semibold">
              {game.deliveryType === 'key' ? 'Clave Steam' : game.deliveryType === 'drm-free' ? 'DRM-Free' : 'Link de reclamo'}
            </span>
          </div>
          <p className="mt-4 text-sm text-gray-600 leading-relaxed">{game.description}</p>

          {game.claimInstructions && (
            <div className="mt-5 rounded-xl bg-violet-50 border border-violet-200 p-4">
              <h4 className="text-xs font-bold text-violet-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Gift className="w-3.5 h-3.5" /> Cómo reclamarlo gratis
              </h4>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">{game.claimInstructions}</pre>
            </div>
          )}

          <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-800 text-sm">¿Cómo funciona?</h4>
                <p className="mt-1 text-xs text-emerald-700 leading-relaxed">
                  Te llevamos el juego gratis como muestra de cortesía. Solo pagas los productos premium en la tienda ($1-$5). Sin trucos, sin costos ocultos.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <div>
              <div className="text-3xl font-black text-emerald-600">$0.00</div>
              <div className="text-xs text-gray-500">Ahorro: ${game.originalPrice.toFixed(2)}</div>
            </div>
            <div className="flex gap-2">
              {game.claimUrl && (
                <a href={game.claimUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 px-4 py-2.5 text-sm text-gray-700 transition">
                  <ExternalLink className="w-3.5 h-3.5" /> Ver fuente
                </a>
              )}
              <Link href="/tienda"
                className="flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 px-5 py-2.5 text-sm font-bold text-white transition">
                  Ver tienda <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════════════════ */
export default function JuegosGratisPage() {
  const [games, setGames] = useState<ScannedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<GameSource | 'all'>('all');
  const [selectedGame, setSelectedGame] = useState<ScannedGame | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const { setSelectedProduct, setProductDetailOpen } = useStore();

  const loadGames = useCallback(async () => {
    try {
      const res = await fetch('/api/scanner/results');
      const data = await res.json();
      if (data.success) {
        setGames(data.games);
      }
    } catch (e) { console.error(e); }
    try {
      const res = await fetch('/api/scanner/summary');
      const data = await res.json();
      if (data.success) setSummary(data.summary);
    } catch (e) { /* ok */ }
    setLoading(false);
  }, []);

  const handleScan = async (source?: GameSource) => {
    setScanning(true);
    try {
      const url = source ? `/api/scanner/run?source=${source}` : '/api/scanner/run';
      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await loadGames();
      }
    } catch (e) { console.error(e); }
    finally { setScanning(false); }
  };

  useEffect(() => { loadGames(); }, [loadGames]);

  // Filtro: solo productos que sean REALMENTE gratis (status active o expiring)
  const freeGames = useMemo(() => games.filter(g =>
    g.status === 'active' || g.status === 'expiring'
  ), [games]);

  const filteredGames = useMemo(() => freeGames.filter(g => {
    if (selectedSource !== 'all' && g.source !== selectedSource) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.tags.some(t => t.includes(q));
    }
    return true;
  }), [freeGames, selectedSource, searchQuery]);

  // Top 4 productos destacados (con mayor valor original) para mostrar como "Gancho"
  const featured = useMemo(() =>
    [...freeGames]
      .sort((a, b) => (b.originalPrice || 0) - (a.originalPrice || 0))
      .slice(0, 4)
  , [freeGames]);

  // Handle claim (mostrar modal con instrucciones)
  const handleClaim = (game: ScannedGame) => setSelectedGame(game);
  // Handle view (abrir ProductDetail completo del store)
  const handleView = (game: ScannedGame) => {
    setSelectedProduct({
      id: `free-${game.id}`,
      name: game.title,
      description: game.description,
      price: 0,
      originalPrice: game.originalPrice > 0 ? game.originalPrice : undefined,
      category: 'Juegos Gratis',
      subcategory: GAME_SOURCES.find(s => s.id === game.source)?.name || game.source,
      image: game.imageUrl || '/products/gen/gaming-cat.png',
      rating: game.rating || 4,
      reviews: 0,
      sold: 0,
      deliveryTime: 'Inmediato',
      platform: game.platform.join(', '),
      region: 'Global',
      tags: [...game.tags, 'gratis', 'free', '100-gratis'],
      stock: 999,
      featured: game.status === 'expiring',
    } as any);
    setProductDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/50 via-white to-white">
      <Header />

      {/* ═══ HERO ═══ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-700 to-purple-800 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(236,72,153,0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-3 sm:px-6 py-10 sm:py-14">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-400/20 backdrop-blur-sm border border-emerald-300/30 text-emerald-100 px-3 py-1.5 rounded-full text-sm font-semibold mb-4">
                <Sparkles className="w-4 h-4" /> Cortesía de DigiStore
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-[1.1]">
                Juegos <span className="bg-gradient-to-r from-emerald-300 to-amber-300 bg-clip-text text-transparent">100% GRATIS</span>
                <br />para ti
              </h1>
              <p className="text-base sm:text-lg text-white/85 mb-6 max-w-2xl leading-relaxed">
                Escaneamos Epic Games, Steam, GOG, Prime Gaming y otras plataformas que regalan juegos de calidad.
                Te los entregamos como cortesía — sin costo, sin trucos.
                Si quieres más, visita nuestra <Link href="/tienda" className="font-bold text-amber-300 hover:underline">tienda premium</Link> con productos desde $1.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <button onClick={() => handleScan()} disabled={scanning}
                  className="inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-6 py-3 rounded-xl hover:bg-violet-50 transition shadow-2xl disabled:opacity-50">
                  {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {scanning ? 'Escaneando...' : 'Escanear ahora'}
                </button>
                <Link href="/tienda"
                  className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/25 transition border border-white/20">
                  Ver tienda premium <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            {/* Stats card */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-2xl">
                <p className="text-xs uppercase tracking-wider text-white/70 font-semibold mb-4">Resumen del escaneo</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-2xl font-black text-emerald-300">{freeGames.length}</div>
                    <div className="text-[10px] text-white/60 uppercase">Productos gratis</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-amber-300">${freeGames.reduce((sum, g) => sum + (g.originalPrice || 0), 0).toFixed(0)}</div>
                    <div className="text-[10px] text-white/60 uppercase">Valor total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-violet-200">{summary?.totalScans ?? 0}</div>
                    <div className="text-[10px] text-white/60 uppercase">Escaneos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-pink-300">{freeGames.filter(g => g.status === 'expiring').length}</div>
                    <div className="text-[10px] text-white/60 uppercase">Por expirar</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ FEATURED — Top 4 productos con más valor ═══ */}
      {featured.length > 0 && !searchQuery && selectedSource === 'all' && (
        <section className="mx-auto max-w-7xl px-3 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">🔥 Más valiosos ahora</h2>
                <p className="text-xs text-gray-500">Productos premium regalados esta semana</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(game => (
              <FreeProductCard key={game.id} game={game} onClaim={handleClaim} onView={handleView} />
            ))}
          </div>
        </section>
      )}

      {/* ═══ FILTROS ═══ */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar juegos gratis..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-white border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400 hover:text-gray-700" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelectedSource('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${selectedSource === 'all' ? 'bg-violet-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              Todas
            </button>
            {GAME_SOURCES.filter(s => ['epic-games','prime-gaming','gog','humble','indiegala','fanatical','steam'].includes(s.id)).map(source => {
              const Icon = sourceIcons[source.id] || Gamepad2;
              const label = source.name.split(' ')[0];
              return (
                <button key={source.id} onClick={() => setSelectedSource(source.id as GameSource)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${selectedSource === source.id ? 'bg-violet-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ GRID DE JUEGOS ═══ */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Escaneando juegos gratis...</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Gamepad2 className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No se encontraron juegos gratis</h3>
            <p className="text-sm text-gray-400 mb-4">Intenta cambiar los filtros o escanear de nuevo</p>
            <button onClick={() => handleScan()} disabled={scanning}
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
              <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} /> Escanear ahora
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-500">
                Mostrando <strong className="text-gray-700">{filteredGames.length}</strong> juegos gratis
                {(searchQuery || selectedSource !== 'all') && (
                  <button onClick={() => { setSearchQuery(''); setSelectedSource('all'); }}
                    className="ml-2 text-violet-600 hover:underline">limpiar filtros</button>
                )}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredGames.map(game => (
                <FreeProductCard key={game.id} game={game} onClaim={handleClaim} onView={handleView} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ═══ CÓMO FUNCIONA ═══ */}
      <section className="bg-gradient-to-b from-white to-violet-50/50">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Cómo funciona</h2>
            <p className="mt-2 text-sm text-gray-500">Es realmente gratis. Sin letra chica.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: RefreshCw,
                title: '1. Escaneamos',
                desc: 'Nuestro sistema revisa cada 6 horas Epic Games, Steam, GOG, Prime Gaming, IndieGala, Fanatical y más. Encontramos los juegos que están regalando HOY.',
                color: 'from-violet-500 to-indigo-600',
              },
              {
                icon: Gift,
                title: '2. Te lo regalamos',
                desc: 'Sin trampa. Te damos el link de reclamo + instrucciones paso a paso. Lo canjeas en tu cuenta de Epic/Steam/GOG y queda tuyo para siempre.',
                color: 'from-emerald-500 to-teal-600',
              },
              {
                icon: ShoppingBag,
                title: '3. Quieres más? Visita la tienda',
                desc: 'En la tienda encontrarás más productos premium (V-Bucks, gift cards, software, suscripciones) entre $1 y $5. Calidad garantizada al mejor precio.',
                color: 'from-amber-500 to-orange-600',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition">
                <div className={`mx-auto w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg mb-4`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="bg-[#212529] text-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 py-10 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold mb-3">¿Listo para más?</h2>
          <p className="text-sm text-gray-400 mb-5 max-w-2xl mx-auto">
            Visita nuestra tienda premium con cientos de productos digitales desde $1.
            Gaming, software, gift cards, V-Bucks, Robux y mucho más.
          </p>
          <Link href="/tienda"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-violet-500/25">
            Ir a la tienda <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-black text-gray-500">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 py-6 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} DigiStore — Productos digitales al mejor precio. Hecho con 💜 para la comunidad gamer.</p>
        </div>
      </footer>

      {/* ═══ MODAL: Cómo reclamar ═══ */}
      <ClaimModal game={selectedGame} onClose={() => setSelectedGame(null)} />

      {/* ═══ MODAL: ProductDetail completo (compartido con tienda) ═══ */}
      <ProductDetailModal />
    </div>
  );
}
