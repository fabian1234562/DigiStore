'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  MessageCircle, Send, Bot, User, Sparkles, ShoppingCart,
  ArrowLeft, X, Minimize2, Zap, Shield, Clock, Tag, ChevronRight,
  Headphones, Package, Star, CreditCard, TrendingUp, Gift,
  Gamepad2, Tv, AppWindow, RefreshCw, ArrowRight, Check,
  Flame, BadgePercent, Store, Search, Heart, Truck,
} from 'lucide-react';
import Link from 'next/link';
import { PRODUCTS, CATEGORIES } from '@/lib/store';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  time?: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  gaming: <Gamepad2 className="w-5 h-5" />,
  streaming: <Tv className="w-5 h-5" />,
  giftcards: <Gift className="w-5 h-5" />,
  software: <AppWindow className="w-5 h-5" />,
  subscriptions: <RefreshCw className="w-5 h-5" />,
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  gaming: 'from-purple-600 via-pink-500 to-rose-500',
  streaming: 'from-red-600 via-orange-500 to-amber-500',
  giftcards: 'from-amber-500 via-yellow-500 to-orange-400',
  software: 'from-cyan-600 via-blue-500 to-indigo-500',
  subscriptions: 'from-violet-600 via-purple-500 to-fuchsia-500',
};

const CATEGORY_BG: Record<string, string> = {
  gaming: 'bg-purple-50 border-purple-100 hover:bg-purple-100',
  streaming: 'bg-red-50 border-red-100 hover:bg-red-100',
  giftcards: 'bg-amber-50 border-amber-100 hover:bg-amber-100',
  software: 'bg-cyan-50 border-cyan-100 hover:bg-cyan-100',
  subscriptions: 'bg-violet-50 border-violet-100 hover:bg-violet-100',
};

function getTimestamp() {
  const now = new Date();
  return now.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showPulse, setShowPulse] = useState(true);

  // Derived product data for welcome screen
  const featuredProducts = useMemo(() => {
    return [...PRODUCTS]
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 4);
  }, []);

  const hotDeals = useMemo(() => {
    return PRODUCTS.filter((p) => p.originalPrice && p.originalPrice > p.price)
      .sort((a, b) => ((b.originalPrice! - b.price) / b.originalPrice!) - ((a.originalPrice! - a.price) / a.originalPrice!))
      .slice(0, 3);
  }, []);

  const categoryStats = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      ...cat,
      count: PRODUCTS.filter((p) => p.category === cat.id).length,
      topProduct: PRODUCTS.filter((p) => p.category === cat.id).sort((a, b) => b.sold - a.sold)[0],
    }));
  }, []);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, loading]);

  useEffect(() => {
    if (open && !minimized && inputRef.current) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open, minimized]);

  useEffect(() => {
    if (open) setShowPulse(false);
  }, [open]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || loading) return;
    setInput('');
    const time = getTimestamp();
    setMsgs((p) => [...p, { role: 'user', content: t, time }]);
    setLoading(true);
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...msgs, { role: 'user', content: t }] }),
      });
      const d = await r.json();
      setMsgs((p) => [
        ...p,
        { role: 'assistant', content: d.content || 'Lo siento, no pude procesar tu mensaje.', time: getTimestamp() },
      ]);
    } catch {
      setMsgs((p) => [
        ...p,
        { role: 'assistant', content: 'Error de conexion. Intenta de nuevo.', time: getTimestamp() },
      ]);
    }
    setLoading(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };
  const handleOpen = () => {
    setOpen(true);
    setMinimized(false);
  };
  const handleClose = () => {
    setOpen(false);
    setMinimized(false);
  };

  // ==================== FLOATING BUTTON ====================
  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-5 right-5 z-50 group relative"
        aria-label="Abrir chat con asistente"
      >
        {showPulse && (
          <span className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping" />
        )}
        <span className="relative flex items-center justify-center w-[60px] h-[60px] bg-gradient-to-br from-purple-600 via-purple-600 to-indigo-700 rounded-full shadow-xl shadow-purple-600/30 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-purple-600/40 group-hover:scale-110 active:scale-95">
          <MessageCircle className="w-7 h-7 text-white" strokeWidth={1.8} />
        </span>
        {/* Tooltip */}
        <span className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none shadow-xl">
          Chatea con un experto 💬
          <span className="absolute top-full right-5 w-2.5 h-2.5 bg-gray-900 rotate-45 -mt-1.5" />
        </span>
      </button>
    );
  }

  // ==================== CHAT WINDOW ====================
  return (
    <div
      className={
        isMobile
          ? 'fixed inset-0 z-50 flex flex-col bg-white'
          : minimized
            ? 'fixed bottom-5 right-5 z-50 flex flex-col'
            : 'fixed bottom-5 right-5 z-50 w-[420px] max-h-[640px] bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-200/80 flex flex-col overflow-hidden'
      }
    >
      {/* ==================== HEADER ==================== */}
      <div className="bg-gradient-to-r from-[#1a1025] via-[#2d1b4e] to-[#1a1025] text-white px-5 py-3.5 flex items-center justify-between shrink-0 relative overflow-hidden">
        {/* Animated bg pattern */}
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #a78bfa 1px, transparent 1px), radial-gradient(circle at 75% 30%, #c084fc 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        {/* Glow accent */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="flex items-center gap-3.5 relative z-10">
          <div className="relative">
            <div className="w-11 h-11 bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Bot className="w-5.5 h-5.5" strokeWidth={1.8} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#1a1025]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[15px] tracking-tight">DigiStore AI</span>
              <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-400/25 rounded-full text-[10px] font-bold text-emerald-300 flex items-center gap-1 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                En linea
              </span>
            </div>
            <span className="text-[11px] text-purple-300/80 font-medium">Experto en productos digitales</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 relative z-10">
          {!isMobile && (
            <button onClick={() => setMinimized(!minimized)} className="p-2 rounded-xl hover:bg-white/10 transition-colors" aria-label="Minimizar">
              <Minimize2 className={`w-4 h-4 transition-transform ${minimized ? 'rotate-180' : ''}`} />
            </button>
          )}
          <button onClick={handleClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors" aria-label="Cerrar chat">
            {isMobile ? <ArrowLeft className="w-5 h-5" /> : <X className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ==================== MINIMIZED VIEW ==================== */}
      {minimized && !isMobile ? (
        <div className="bg-white border border-gray-200/80 rounded-b-2xl p-3.5 shadow-xl cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setMinimized(false)}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">DigiStore AI</p>
              <p className="text-[11px] text-gray-500 truncate">
                {msgs.length > 0 ? `${msgs.length} mensajes` : 'Haz tu pregunta aqui...'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      ) : (
        <>
          {/* ==================== MESSAGES AREA ==================== */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#f8f7fc]">
            {msgs.length === 0 ? (
              <div className="flex flex-col h-full">
                {/* WELCOME HERO */}
                <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 px-5 pt-5 pb-6 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 60%, white 1px, transparent 1px), radial-gradient(circle at 70% 25%, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                  <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full mb-3 border border-white/10">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span className="text-[11px] font-semibold text-purple-100">Asistente Inteligente</span>
                    </div>
                    <h2 className="text-white font-extrabold text-lg leading-tight mb-1.5">
                      Hola! Soy tu experto
                    </h2>
                    <p className="text-purple-200/90 text-[12px] leading-relaxed max-w-[280px] mx-auto">
                      Conozco todos nuestros {PRODUCTS.length}+ productos digitales. Preguntame lo que necesites.
                    </p>
                  </div>
                </div>

                {/* TRUST BADGES */}
                <div className="flex items-center justify-center gap-5 py-3 bg-white border-b border-gray-100">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                    <div className="w-6 h-6 bg-amber-50 rounded-lg flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <span>Entrega instantanea</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                    <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <span>Garantia 30 dias</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                    <div className="w-6 h-6 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 text-purple-500" />
                    </div>
                    <span>24/7</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
                  {/* CATEGORIES GRID */}
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <Store className="w-4 h-4 text-gray-400" />
                      <span className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Explora por Categoria</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {categoryStats.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => send(`Que productos de ${cat.name} tienen?`)}
                          className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 ${CATEGORY_BG[cat.id]}`}
                        >
                          <div className={`w-10 h-10 bg-gradient-to-br ${CATEGORY_GRADIENTS[cat.id]} rounded-xl flex items-center justify-center shadow-sm text-white`}>
                            {CATEGORY_ICONS[cat.id]}
                          </div>
                          <span className="text-[10px] font-bold text-gray-700 leading-tight text-center">{cat.name}</span>
                          <span className="text-[9px] text-gray-400 font-medium">{cat.count} items</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* TRENDING PRODUCTS */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Tendencias</span>
                      </div>
                      <Link
                        href="/tienda"
                        onClick={handleClose}
                        className="flex items-center gap-0.5 text-[11px] font-semibold text-purple-600 hover:text-purple-700"
                      >
                        Ver todos <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                      {featuredProducts.map((p) => (
                        <Link
                          key={p.id}
                          href={`/tienda/producto/${p.id}`}
                          onClick={handleClose}
                          className="min-w-[140px] max-w-[140px] bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
                        >
                          <div className="relative h-[90px] bg-gray-100 overflow-hidden">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {p.originalPrice && p.originalPrice > p.price && (
                              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-md flex items-center gap-0.5">
                                <Flame className="w-2.5 h-2.5" />
                                -{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%
                              </span>
                            )}
                          </div>
                          <div className="p-2.5">
                            <p className="text-[11px] font-semibold text-gray-800 truncate leading-tight">{p.name}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <StarRating rating={p.rating} />
                              <span className="text-[9px] text-gray-400">({p.sold.toLocaleString()})</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className="text-[13px] font-extrabold text-gray-900">${p.price.toFixed(2)}</span>
                              {p.originalPrice && p.originalPrice > p.price && (
                                <span className="text-[10px] text-gray-400 line-through">${p.originalPrice.toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* HOT DEALS BANNER */}
                  {hotDeals.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <BadgePercent className="w-4 h-4 text-red-500" />
                        <span className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Ofertas del Dia</span>
                      </div>
                      <div className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 rounded-xl p-3.5 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                        <div className="relative z-10 space-y-2.5">
                          {hotDeals.map((p) => (
                            <Link
                              key={p.id}
                              href={`/tienda/producto/${p.id}`}
                              onClick={handleClose}
                              className="flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-lg p-2 hover:bg-white/25 transition-colors group"
                            >
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-10 h-10 rounded-lg object-cover border border-white/20"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-white truncate">{p.name}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-[12px] font-extrabold text-white">${p.price.toFixed(2)}</span>
                                  <span className="text-[10px] text-white/60 line-through">${p.originalPrice!.toFixed(2)}</span>
                                  <span className="px-1.5 py-0.5 bg-white/25 rounded text-[9px] font-bold text-white">
                                    -{Math.round(((p.originalPrice! - p.price) / p.originalPrice!) * 100)}%
                                  </span>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* QUICK ACTIONS */}
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <Zap className="w-4 h-4 text-purple-500" />
                      <span className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Acciones Rapidas</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => send('Cuales son los productos mas vendidos?')}
                        className="flex items-center gap-2.5 text-[11px] font-semibold text-gray-700 bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-200 px-3 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-left group"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center shrink-0 group-hover:from-purple-200 group-hover:to-indigo-200 transition-colors">
                          <TrendingUp className="w-4 h-4 text-purple-600" />
                        </div>
                        <span>Mas vendidos</span>
                      </button>
                      <button
                        onClick={() => send('Que ofertas tienen hoy?')}
                        className="flex items-center gap-2.5 text-[11px] font-semibold text-gray-700 bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-200 px-3 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-left group"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center shrink-0 group-hover:from-orange-200 group-hover:to-red-200 transition-colors">
                          <Flame className="w-4 h-4 text-orange-600" />
                        </div>
                        <span>Ofertas de hoy</span>
                      </button>
                      <button
                        onClick={() => send('Que gift cards tienen disponibles?')}
                        className="flex items-center gap-2.5 text-[11px] font-semibold text-gray-700 bg-white hover:bg-amber-50 border border-gray-200 hover:border-amber-200 px-3 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-left group"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-lg flex items-center justify-center shrink-0 group-hover:from-amber-200 group-hover:to-yellow-200 transition-colors">
                          <Gift className="w-4 h-4 text-amber-600" />
                        </div>
                        <span>Gift Cards</span>
                      </button>
                      <button
                        onClick={() => send('Que metodos de pago aceptan?')}
                        className="flex items-center gap-2.5 text-[11px] font-semibold text-gray-700 bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 px-3 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-left group"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center shrink-0 group-hover:from-emerald-200 group-hover:to-teal-200 transition-colors">
                          <CreditCard className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span>Metodos de pago</span>
                      </button>
                      <button
                        onClick={() => send('Como funciona la entrega de productos?')}
                        className="flex items-center gap-2.5 text-[11px] font-semibold text-gray-700 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-200 px-3 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-left group"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center shrink-0 group-hover:from-blue-200 group-hover:to-cyan-200 transition-colors">
                          <Truck className="w-4 h-4 text-blue-600" />
                        </div>
                        <span>Como funciona</span>
                      </button>
                      <button
                        onClick={() => send('Tienen garantia? Que pasa si hay un problema?')}
                        className="flex items-center gap-2.5 text-[11px] font-semibold text-gray-700 bg-white hover:bg-rose-50 border border-gray-200 hover:border-rose-200 px-3 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-left group"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-rose-100 to-pink-100 rounded-lg flex items-center justify-center shrink-0 group-hover:from-rose-200 group-hover:to-pink-200 transition-colors">
                          <Shield className="w-4 h-4 text-rose-600" />
                        </div>
                        <span>Garantia</span>
                      </button>
                    </div>
                  </div>

                  {/* PROMO CODE BANNER */}
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-3.5 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
                    <div className="relative z-10 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                        <Tag className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-white">Codigo de descuento</p>
                        <p className="text-[10px] text-gray-400">Usa este codigo en tu compra</p>
                      </div>
                      <div className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg shrink-0">
                        <span className="text-sm font-extrabold text-amber-300 tracking-wider">DIGI10</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ==================== ACTIVE CHAT MESSAGES ==================== */
              <div className="p-4 space-y-3">
                {msgs.map((m, i) => (
                  <div key={i} className={m.role === 'user' ? 'flex gap-2.5 justify-end' : 'flex gap-2.5 justify-start'}>
                    {m.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <Bot className="w-4 h-4 text-white" strokeWidth={1.8} />
                      </div>
                    )}
                    <div className="max-w-[82%] flex flex-col">
                      <div
                        className={
                          'rounded-2xl px-4 py-3 text-[13px] leading-relaxed ' +
                          (m.role === 'user'
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-lg shadow-sm'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-lg shadow-sm')
                        }
                      >
                        {m.content.split('\n').map((l, j) => (
                          <p key={j} className={j > 0 ? 'mt-2' : ''}>{l}</p>
                        ))}
                      </div>
                      {m.time && (
                        <span className={`text-[10px] mt-1 ${m.role === 'user' ? 'text-right pr-1' : 'pl-1'} text-gray-400`}>
                          {m.time}
                        </span>
                      )}
                    </div>
                    {m.role === 'user' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2.5 justify-start">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-white" strokeWidth={1.8} />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-lg px-4 py-3.5 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-[11px] text-gray-400 font-medium">Escribiendo...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ==================== QUICK ACTION BAR (during chat) ==================== */}
          {msgs.length >= 2 && !loading && (
            <div className="px-3 py-2 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto no-scrollbar">
              <Link
                href="/tienda"
                onClick={handleClose}
                className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 px-3 py-2 rounded-lg whitespace-nowrap hover:from-amber-100 hover:to-orange-100 transition-all shadow-sm"
              >
                <ShoppingCart className="w-3.5 h-3.5" /> Ver tienda
              </Link>
              <button
                onClick={() => send('Que ofertas tienen ahora mismo?')}
                className="flex items-center gap-1.5 text-[11px] font-bold text-purple-700 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80 px-3 py-2 rounded-lg whitespace-nowrap hover:from-purple-100 hover:to-indigo-100 transition-all shadow-sm"
              >
                <Flame className="w-3.5 h-3.5" /> Ofertas
              </button>
              <button
                onClick={() => send('Que gift cards tienen disponibles?')}
                className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 px-3 py-2 rounded-lg whitespace-nowrap hover:from-emerald-100 hover:to-teal-100 transition-all shadow-sm"
              >
                <Gift className="w-3.5 h-3.5" /> Gift Cards
              </button>
              <button
                onClick={() => send('Como puedo contactar soporte?')}
                className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/80 px-3 py-2 rounded-lg whitespace-nowrap hover:from-blue-100 hover:to-cyan-100 transition-all shadow-sm"
              >
                <Headphones className="w-3.5 h-3.5" /> Soporte
              </button>
            </div>
          )}

          {/* ==================== INPUT BAR ==================== */}
          <form onSubmit={submit} className="px-3 py-3 bg-white border-t border-gray-100 shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-1.5 focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregunta sobre productos, ofertas..."
                disabled={loading}
                className="flex-1 py-2 text-[13px] bg-transparent outline-none disabled:opacity-50 placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-9 h-9 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-200 disabled:to-gray-300 text-white rounded-xl flex items-center justify-center transition-all shadow-sm hover:shadow-md disabled:shadow-none shrink-0 active:scale-90 disabled:active:scale-100"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-[9px] text-gray-400 font-medium">
                <Check className="w-3 h-3 text-emerald-400" /> Entrega instantanea
              </span>
              <span className="flex items-center gap-1 text-[9px] text-gray-400 font-medium">
                <Shield className="w-3 h-3 text-emerald-400" /> Compra segura
              </span>
              <span className="flex items-center gap-1 text-[9px] text-gray-400 font-medium">
                <Heart className="w-3 h-3 text-red-400" /> 145+ productos
              </span>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
