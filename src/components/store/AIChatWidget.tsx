'use client';

import { useState, useRef, useEffect } from 'react';
import {
  MessageCircle, Send, Bot, User, Sparkles, ShoppingCart,
  ArrowLeft, X, Minimize2, Zap, Shield, Clock, Tag, ChevronRight,
  Headphones, Package, Star, CreditCard,
} from 'lucide-react';
import Link from 'next/link';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  time?: string;
}

const QUICK_REPLIES = [
  { label: 'Productos populares', icon: <Star className="w-3.5 h-3.5" />, query: 'Cuales son los productos mas vendidos?' },
  { label: 'Ofertas de hoy', icon: <Tag className="w-3.5 h-3.5" />, query: 'Que ofertas tienen hoy?' },
  { label: 'Como funciona', icon: <Zap className="w-3.5 h-3.5" />, query: 'Como funciona la entrega de productos?' },
  { label: 'Gift cards', icon: <Package className="w-3.5 h-3.5" />, query: 'Que gift cards tienen disponibles?' },
  { label: 'Metodos de pago', icon: <CreditCard className="w-3.5 h-3.5" />, query: 'Que metodos de pago aceptan?' },
  { label: 'Garantia y soporte', icon: <Shield className="w-3.5 h-3.5" />, query: 'Tienen garantia? Que pasa si hay un problema?' },
];

function getTimestamp() {
  const now = new Date();
  return now.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
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
    setMsgs(p => [...p, { role: 'user', content: t, time }]);
    setLoading(true);
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...msgs, { role: 'user', content: t }] }),
      });
      const d = await r.json();
      setMsgs(p => [...p, { role: 'assistant', content: d.content || 'Lo siento, no pude procesar tu mensaje.', time: getTimestamp() }]);
    } catch {
      setMsgs(p => [...p, { role: 'assistant', content: 'Error de conexion. Intenta de nuevo.', time: getTimestamp() }]);
    }
    setLoading(false);
  };

  const submit = (e: React.FormEvent) => { e.preventDefault(); send(input); };
  const handleOpen = () => { setOpen(true); setMinimized(false); };
  const handleClose = () => { setOpen(false); setMinimized(false); };

  // Floating Button
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
        <span className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-600 via-purple-600 to-indigo-700 rounded-full shadow-lg shadow-purple-500/30 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-purple-500/40 group-hover:scale-105 active:scale-95">
          <MessageCircle className="w-6 h-6 text-white" strokeWidth={2} />
        </span>
        <span className="absolute bottom-full right-0 mb-2.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
          Chatea con un experto
          <span className="absolute top-full right-4 w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
        </span>
      </button>
    );
  }

  // Chat Window
  return (
    <div
      className={
        isMobile
          ? 'fixed inset-0 z-50 flex flex-col bg-white'
          : minimized
            ? 'fixed bottom-5 right-5 z-50 flex flex-col'
            : 'fixed bottom-5 right-5 z-50 w-[400px] max-h-[600px] bg-white rounded-2xl shadow-2xl shadow-purple-900/10 border border-gray-200/80 flex flex-col overflow-hidden'
      }
    >
      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight">Asistente DigiStore</span>
              <span className="px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-[10px] font-semibold text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Online
              </span>
            </div>
            <span className="text-[11px] text-purple-200/80">Experto en productos digitales</span>
          </div>
        </div>
        <div className="flex items-center gap-1 relative z-10">
          {!isMobile && (
            <button onClick={() => setMinimized(!minimized)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Minimizar">
              <Minimize2 className={`w-4 h-4 transition-transform ${minimized ? 'rotate-180' : ''}`} />
            </button>
          )}
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Cerrar chat">
            {isMobile ? <ArrowLeft className="w-5 h-5" /> : <X className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MINIMIZED VIEW */}
      {minimized && !isMobile ? (
        <div className="bg-white border border-gray-200/80 rounded-b-2xl p-3 shadow-xl cursor-pointer" onClick={() => setMinimized(false)}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">Chat con experto</p>
              <p className="text-[10px] text-gray-500 truncate">
                {msgs.length > 0 ? `${msgs.length} mensajes` : 'Haz tu pregunta aqui...'}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      ) : (
        <>
          {/* MESSAGES AREA */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100/50">
            {msgs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6 py-8">
                <div className="relative mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-9 h-9 text-purple-600" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg flex items-center justify-center shadow-md">
                    <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 text-base">Hola, soy tu asistente</h3>
                <p className="text-xs text-gray-500 mt-1 mb-5 max-w-[260px] leading-relaxed">
                  Conozco todos nuestros 145+ productos digitales. Preguntame lo que necesites.
                </p>
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Zap className="w-3 h-3 text-amber-500" /><span>Entrega instantanea</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Shield className="w-3 h-3 text-emerald-500" /><span>Garantia 30 dias</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Clock className="w-3 h-3 text-purple-500" /><span>Soporte 24/7</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full max-w-[320px]">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q.label}
                      onClick={() => send(q.query)}
                      className="flex items-center gap-2 text-[11px] font-medium text-gray-700 bg-white hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 border border-gray-200 px-3 py-2.5 rounded-xl transition-all duration-150 shadow-sm hover:shadow-md text-left"
                    >
                      <span className="text-purple-500 shrink-0">{q.icon}</span>
                      <span className="truncate">{q.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {msgs.map((m, i) => (
                  <div key={i} className={m.role === 'user' ? 'flex gap-2.5 justify-end' : 'flex gap-2.5 justify-start'}>
                    {m.role === 'assistant' && (
                      <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className="max-w-[82%] flex flex-col">
                      <div className={
                        'rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ' +
                        (m.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-lg shadow-sm'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-lg shadow-sm')
                      }>
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
                      <div className="w-7 h-7 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2.5 justify-start">
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-lg px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-[11px] text-gray-400 ml-1">Escribiendo...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* QUICK ACTION BAR */}
          {msgs.length >= 2 && !loading && (
            <div className="px-3 py-2 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto scrollbar-none">
              <Link href="/tienda" onClick={handleClose} className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 px-3 py-1.5 rounded-lg whitespace-nowrap hover:from-amber-100 hover:to-orange-100 transition-all shadow-sm">
                <ShoppingCart className="w-3.5 h-3.5" /> Ver tienda
              </Link>
              <button onClick={() => send('Que ofertas tienen ahora mismo?')} className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-700 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80 px-3 py-1.5 rounded-lg whitespace-nowrap hover:from-purple-100 hover:to-indigo-100 transition-all shadow-sm">
                <Tag className="w-3.5 h-3.5" /> Ver ofertas
              </button>
              <button onClick={() => send('Como puedo contactar soporte?')} className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 px-3 py-1.5 rounded-lg whitespace-nowrap hover:from-emerald-100 hover:to-teal-100 transition-all shadow-sm">
                <Headphones className="w-3.5 h-3.5" /> Soporte
              </button>
            </div>
          )}

          {/* INPUT BAR */}
          <form onSubmit={submit} className="px-3 py-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm bg-gray-100/80 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white border border-transparent focus:border-purple-200 disabled:opacity-50 placeholder:text-gray-400 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-200 disabled:to-gray-200 text-white rounded-xl flex items-center justify-center transition-all shadow-sm hover:shadow-md disabled:shadow-none shrink-0 active:scale-95 disabled:active:scale-100"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
