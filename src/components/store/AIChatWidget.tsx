'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Sparkles, ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK = [
  '¿Que productos tienen?',
  '¿Como funciona la entrega?',
  '¿Tienen ofertas hoy?',
  '¿Que gift cards venden?',
];

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs]);

  useEffect(() => {
    if (open && inputRef.current) setTimeout(() => inputRef.current.focus(), 100);
  }, [open]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || loading) return;
    setInput('');
    setMsgs(p => [...p, { role: 'user', content: t }]);
    setLoading(true);
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...msgs, { role: 'user', content: t }] }),
      });
      const d = await r.json();
      setMsgs(p => [...p, { role: 'assistant', content: d.content || 'Lo siento, no pude procesar tu mensaje.' }]);
    } catch {
      setMsgs(p => [...p, { role: 'assistant', content: 'Error de conexion. Intenta de nuevo.' }]);
    }
    setLoading(false);
  };

  const submit = (e: React.FormEvent) => { e.preventDefault(); send(input); };

  const closeBtn = (
    <button onClick={() => setOpen(false)} className="hover:bg-white/10 rounded-full p-1.5 transition-colors" aria-label="Cerrar chat">
      {isMobile
        ? <ArrowLeft className="w-5 h-5" />
        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      }
    </button>
  );

  if (open) {
    return (
      <div
        className={isMobile
          ? 'fixed inset-0 z-50 bg-white flex flex-col'
          : 'fixed bottom-5 right-5 z-50 w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col'}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-sm block leading-tight">Asistente DigiStore</span>
              <span className="text-[11px] text-purple-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                En linea
              </span>
            </div>
          </div>
          {closeBtn}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {msgs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Sparkles className="w-7 h-7 text-purple-600" />
              </div>
              <p className="font-semibold text-gray-800 text-sm">Hola, soy tu asistente</p>
              <p className="text-xs text-gray-500 mt-1 mb-4">Conozco todos nuestros productos digitales. Preguntame lo que quieras.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK.map(q => (
                  <button key={q} onClick={() => send(q)} className="text-[11px] font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-full transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            msgs.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex gap-2 justify-end' : 'flex gap-2 justify-start'}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-purple-600" />
                  </div>
                )}
                <div className={
                  'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ' +
                  (m.role === 'user' ? 'bg-purple-600 text-white rounded-br-md' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm')
                }>
                  {m.content.split('\n').map((l, j) => (
                    <p key={j} className={j > 0 ? 'mt-1.5' : ''}>{l}</p>
                  ))}
                </div>
                {m.role === 'user' && (
                  <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-purple-600" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick actions after first response */}
        {msgs.length === 2 && !loading && (
          <div className="px-4 py-2 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto scrollbar-none">
            <Link href="/tienda" onClick={() => setOpen(false)} className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-amber-100 transition-colors">
              <ShoppingCart className="w-3 h-3" /> Ver tienda
            </Link>
            <button onClick={() => send('¿Que ofertas tienen ahora mismo?')} className="text-[11px] font-medium text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-purple-100 transition-colors">
              Ver ofertas
            </button>
          </div>
        )}

        {/* Input */}
        <form onSubmit={submit} className="px-3 py-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Preguntame sobre productos..."
            disabled={loading}
            className="flex-1 px-3.5 py-2.5 text-sm bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-10 h-10 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center gap-2 px-4 py-3 sm:px-5 sm:py-3.5 transition-all hover:scale-105 active:scale-95"
      aria-label="Abrir chat"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="text-sm font-semibold hidden sm:inline">Chat</span>
    </button>
  );
}
