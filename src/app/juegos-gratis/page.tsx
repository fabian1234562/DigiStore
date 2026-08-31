'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search, Zap, Shield, Truck, Star, RefreshCw, Gamepad2, ExternalLink,
  Clock, Flame, ArrowRight, Filter, X, Loader2, Eye, ShoppingCart,
  Monitor, Gift, Heart, Crown, Disc, Smartphone, Tag, CreditCard, Wallet,
  CircleDollarSign, Bitcoin, Copy, Check, AlertCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { GAME_SOURCES } from '@/lib/game-scanner';
import type { ScannedGame, GameSource } from '@/lib/game-scanner';

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

type PaymentMethod = 'mercadopago' | 'paypal' | 'crypto-btc' | 'crypto-eth' | 'crypto-usdt';

const PAYMENT_OPTIONS: { id: PaymentMethod; name: string; sub: string; icon: LucideIcon; gradient: string; badge: string }[] = [
  { id: 'mercadopago', name: 'MercadoPago', sub: 'Efectivo, tarjeta, Nequi, Baloto', icon: CreditCard, gradient: 'from-blue-600 to-cyan-600', badge: 'Colombia' },
  { id: 'paypal', name: 'PayPal', sub: 'Tarjeta, saldo PayPal', icon: Wallet, gradient: 'from-amber-500 to-yellow-500', badge: 'Global' },
  { id: 'crypto-btc', name: 'Bitcoin', sub: 'BTC on-chain', icon: Bitcoin, gradient: 'from-orange-500 to-amber-500', badge: 'Crypto' },
  { id: 'crypto-eth', name: 'USDT / Ethereum', sub: 'USDT o ETH', icon: CircleDollarSign, gradient: 'from-indigo-500 to-purple-500', badge: 'Crypto' },
];

export default function JuegosGratisPage() {
  const [games, setGames] = useState<ScannedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<GameSource | 'all'>('all');
  const [selectedGame, setSelectedGame] = useState<ScannedGame | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutGame, setCheckoutGame] = useState<ScannedGame | null>(null);
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cryptoInfo, setCryptoInfo] = useState<any>(null);
  const [copied, setCopied] = useState(false);

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

  useEffect(() => {
    loadGames();
  }, []);

  const filteredGames = games.filter(g => {
    if (selectedSource !== 'all' && g.source !== selectedSource) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return g.title.toLowerCase().includes(q) || g.tags.some(t => t.includes(q));
    }
    return true;
  });

  const handleBuy = (game: ScannedGame) => {
    setCheckoutGame(game);
    setShowCheckout(true);
    setPaymentMethod(null);
    setCryptoInfo(null);
  };

  const processPayment = async () => {
    if (!paymentMethod || !checkoutGame || !email) return;
    setProcessing(true);

    try {
      const items = [{ name: checkoutGame.title, quantity: 1, price: checkoutGame.sellPrice, id: `free-${checkoutGame.id}`, category: 'Juegos Gratis' }];

      if (paymentMethod === 'mercadopago') {
        const res = await fetch('/api/payments/create', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items, email }),
        });
        const data = await res.json();
        if (data.success && data.paymentUrl) window.location.href = data.paymentUrl;
        else alert(data.message || 'Error al crear pago');
      } else if (paymentMethod === 'paypal') {
        const res = await fetch('/api/payments/paypal/create', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items, email }),
        });
        const data = await res.json();
        if (data.success && data.approvalUrl) window.location.href = data.approvalUrl;
        else alert(data.message || 'Error con PayPal');
      } else if (paymentMethod.startsWith('crypto')) {
        const crypto = paymentMethod === 'crypto-btc' ? 'BTC' : paymentMethod === 'crypto-eth' ? 'ETH' : 'USDT';
        const res = await fetch('/api/payments/crypto/create', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items, email, crypto }),
        });
        const data = await res.json();
        if (data.success) { setCryptoInfo(data.payment); }
        else alert(data.message || 'Error con crypto');
      }
    } catch (e: any) { alert('Error: ' + e.message); }
    finally { setProcessing(false); }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* HERO */}
      <div className="relative overflow-hidden bg-gradient-to-b from-purple-900/40 via-[#0d1117] to-[#0d1117]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.15),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex items-center gap-2 rounded-full bg-purple-500/20 px-4 py-1.5 text-sm text-purple-300">
              <Zap className="w-4 h-4" /> Escaneo Real en Tiempo Real
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">Juegos GRATIS</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-gray-400">
              Escaneamos las mejores plataformas de internet que regalan juegos.
              Los encontramos por ti y te los vendemos al mejor precio.
              <span className="font-bold text-green-400"> 100% ganancia.</span>
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button onClick={() => handleScan()} disabled={scanning}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:shadow-purple-500/40 disabled:opacity-50">
                {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                {scanning ? 'Escaneando...' : 'Escanear Ahora'}
              </button>
              <Link href="/tienda" className="flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-semibold text-gray-300 transition hover:bg-white/5">
                <Tag className="w-5 h-5" /> Tienda Principal
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      {summary && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Juegos', value: summary.totalGames, icon: Gamepad2, color: 'text-purple-400' },
              { label: 'Fuentes', value: Object.values(summary.sources).filter((s: any) => s.status === 'success').length, icon: Zap, color: 'text-green-400' },
              { label: 'Expirando', value: summary.expiringGames, icon: Clock, color: 'text-amber-400' },
              { label: 'Valor Total', value: `$${summary.estimatedValue.toFixed(0)}`, icon: Flame, color: 'text-pink-400' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <div><div className="text-xl font-bold">{stat.value}</div><div className="text-xs text-gray-500">{stat.label}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Buscar juegos..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-gray-500 hover:text-white" /></button>}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelectedSource('all')} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${selectedSource === 'all' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>Todas</button>
            {GAME_SOURCES.filter(s => ['epic-games','prime-gaming','gog','humble','indiegala','fanatical','steam'].includes(s.id)).map(source => {
              const Icon = sourceIcons[source.id] || Gamepad2;
              const label = source.name.split(' ')[0];
              return (<button key={source.id} onClick={() => setSelectedSource(source.id as GameSource)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${selectedSource === source.id ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                <Icon className="w-3.5 h-3.5" />{label}
              </button>);
            })}
          </div>
        </div>
      </div>

      {/* GAME GRID */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /><p className="mt-4 text-gray-400">Escaneando fuentes de juegos gratis...</p></div>
        ) : filteredGames.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Gamepad2 className="w-16 h-16 text-gray-700" /><h3 className="mt-4 text-xl font-semibold text-gray-400">No se encontraron juegos</h3>
            <button onClick={() => handleScan()} className="mt-4 flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700"><RefreshCw className="w-4 h-4" />Escanear Fuentes</button>
          </div>
        ) : (<>
          <p className="mb-4 text-sm text-gray-500">{filteredGames.length} juego{filteredGames.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredGames.map(game => {
              const SrcIcon = sourceIcons[game.source] || Gamepad2;
              return (
                <div key={game.id} className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
                  {game.status === 'expiring' && (<div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-bold text-white"><Clock className="w-3 h-3" />Expirando</div>)}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full bg-green-500/90 px-2 py-0.5 text-[10px] font-bold text-white"><Zap className="w-3 h-3" />100% Ganancia</div>
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                    {game.imageUrl ? (<img src={game.imageUrl} alt={game.title} width={616} height={353} decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" onError={e => { (e.target as HTMLImageElement).src = '/products/gen/gaming-cat.png'; }} />) : (<div className="flex h-full items-center justify-center"><SrcIcon className="w-12 h-12 text-gray-700" /></div>)}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <div className="text-2xl font-extrabold text-green-400">${game.sellPrice.toFixed(2)}</div>
                      {game.originalPrice > 0 && (<div className="text-xs text-gray-400 line-through">${game.originalPrice.toFixed(2)}</div>)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white line-clamp-2 text-sm leading-tight">{game.title}</h3>
                    <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">{game.description}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-gray-400">{game.platform[0]}</span>
                      <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-gray-400">{game.deliveryType === 'key' ? 'Clave' : game.deliveryType === 'drm-free' ? 'DRM-Free' : 'Reclamar'}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-[10px] text-green-400">Disponible</span></div>
                      <div className="flex items-center gap-1"><SrcIcon className="w-3.5 h-3.5 text-gray-600" /><span className="text-[10px] text-gray-600">{GAME_SOURCES.find(s => s.id === game.source)?.name}</span></div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => handleBuy(game)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-2 text-xs font-semibold text-white transition hover:shadow-lg hover:shadow-purple-500/25">
                        <ShoppingCart className="w-3.5 h-3.5" /> Comprar ${game.sellPrice.toFixed(2)}
                      </button>
                      <button onClick={() => setSelectedGame(game)} className="rounded-xl border border-white/10 p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"><Eye className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>)}
      </div>

      {/* GAME DETAIL MODAL */}
      {selectedGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedGame(null)}>
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#161b22] border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedGame(null)} className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"><X className="w-5 h-5" /></button>
            {selectedGame.imageUrl && (<div className="relative aspect-video"><img src={selectedGame.imageUrl} alt={selectedGame.title} className="h-full w-full object-cover" onError={e => { (e.target as HTMLImageElement).src = '/products/gen/gaming-cat.png'; }} /><div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-transparent to-transparent" /></div>)}
            <div className="p-6">
              <h2 className="text-2xl font-extrabold">{selectedGame.title}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedGame.platform.map(p => (<span key={p} className="rounded-md bg-purple-500/20 px-2 py-1 text-xs text-purple-300">{p}</span>))}
                <span className="rounded-md bg-green-500/20 px-2 py-1 text-xs text-green-300">{selectedGame.deliveryType === 'key' ? 'Clave' : selectedGame.deliveryType === 'drm-free' ? 'DRM-Free' : 'Link'}</span>
              </div>
              <p className="mt-4 text-sm text-gray-400 leading-relaxed">{selectedGame.description}</p>
              {selectedGame.claimInstructions && (
                <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-4">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Como obtenerlo</h4>
                  <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-400 leading-relaxed font-sans">{selectedGame.claimInstructions}</pre>
                </div>
              )}
              <div className="mt-6 flex items-center justify-between">
                <div><div className="text-3xl font-extrabold text-green-400">${selectedGame.sellPrice.toFixed(2)}</div><div className="text-xs text-gray-500">Ganancia: ${selectedGame.sellPrice.toFixed(2)} (100%)</div></div>
                <div className="flex gap-2">
                  {selectedGame.claimUrl && (<a href={selectedGame.claimUrl} target="_blank" className="flex items-center gap-1 rounded-xl border border-white/10 px-4 py-2.5 text-xs text-gray-400 transition hover:bg-white/5 hover:text-white"><ExternalLink className="w-3.5 h-3.5" />Fuente</a>)}
                  <button onClick={() => { handleBuy(selectedGame); setSelectedGame(null); }} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 text-sm font-bold text-white"><ShoppingCart className="w-4 h-4" />Comprar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {showCheckout && checkoutGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowCheckout(false)}>
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#161b22] border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => { setShowCheckout(false); setCryptoInfo(null); }} className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"><X className="w-5 h-5" /></button>
            <div className="p-6">
              <h3 className="text-xl font-extrabold">Comprar Juego</h3>
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3">
                {checkoutGame.imageUrl ? <img src={checkoutGame.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover" onError={e => { (e.target as HTMLImageElement).src = '/products/gen/gaming-cat.png'; }} /> : <div className="w-16 h-16 rounded-lg bg-gray-800 flex items-center justify-center"><Gamepad2 className="w-8 h-8 text-gray-600" /></div>}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{checkoutGame.title}</h4>
                  <div className="text-xs text-gray-500">{checkoutGame.platform.join(', ')}</div>
                  <div className="mt-1 text-lg font-extrabold text-green-400">${checkoutGame.sellPrice.toFixed(2)}</div>
                </div>
              </div>

              {/* Email */}
              <div className="mt-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email para entrega</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com"
                  className="mt-1.5 w-full rounded-xl bg-white/5 border border-white/10 py-2.5 px-4 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500" />
              </div>

              {/* Payment Methods */}
              {!cryptoInfo ? (<>
                <div className="mt-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Metodo de Pago</label>
                  <div className="mt-2 space-y-2">
                    {PAYMENT_OPTIONS.map(pm => (
                      <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                        className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition ${paymentMethod === pm.id ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${pm.gradient} text-white`}><pm.icon className="w-4 h-4" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2"><span className="font-semibold text-sm">{pm.name}</span><span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-gray-500">{pm.badge}</span></div>
                          <span className="text-xs text-gray-500">{pm.sub}</span>
                        </div>
                        {paymentMethod === pm.id && <Check className="w-5 h-5 text-purple-400" />}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={processPayment} disabled={!paymentMethod || !email || processing}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-3.5 font-bold text-white shadow-lg shadow-green-500/25 disabled:opacity-50">
                  {processing ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />Procesando...</span> : `Pagar $${checkoutGame.sellPrice.toFixed(2)}`}
                </button>
              </>) : (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">Enviar {cryptoInfo.crypto}</span>
                    <span className="text-xs text-amber-400">Expira en 60 min</span>
                  </div>
                  <div className="rounded-lg bg-black/30 p-3 font-mono text-xs break-all">
                    {cryptoInfo.address}
                    <button onClick={() => { navigator.clipboard.writeText(cryptoInfo.address); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="ml-2 text-purple-400 hover:text-purple-300">
                      {copied ? <Check className="inline w-3.5 h-3.5" /> : <Copy className="inline w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-extrabold text-green-400">{cryptoInfo.amount} {cryptoInfo.crypto}</div>
                    <div className="text-xs text-gray-500">= ${cryptoInfo.amountUsd.toFixed(2)} USD</div>
                  </div>
                  <p className="text-[10px] text-gray-500 text-center">Envia exactamente esta cantidad. La transaccion se verificara.</p>
                </div>
              )}

              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-600"><Shield className="w-3.5 h-3.5" />Pago seguro y encriptado</div>
            </div>
          </div>
        </div>
      )}

      {/* HOW IT WORKS */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold">Como Funciona</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { icon: RefreshCw, title: 'Escaneamos', desc: 'Nuestro sistema escanea en tiempo real 7+ plataformas que regalan juegos: Epic Games, GOG, Steam, IndieGala, Fanatical, Humble Bundle, Prime Gaming.' },
            { icon: Gamepad2, title: 'Publicamos', desc: 'Los juegos se publican a $1.99-$4.99 USD. Costo para nosotros: $0. Tu ganancia: 100% del precio de venta.' },
            { icon: Zap, title: 'Tu Ganas', desc: 'Acepta pagos via MercadoPago (efectivo, Nequi, Baloto), PayPal (internacional) o Bitcoin/Crypto. Entrega inmediata.' },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20 text-purple-400"><item.icon className="w-6 h-6" /></div>
              <h3 className="mt-4 font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer link */}
      <div className="text-center pb-8">
        <Link href="/tienda" className="text-sm text-purple-400 hover:text-purple-300 transition">Volver a la tienda principal</Link>
      </div>
    </div>
  );
}
