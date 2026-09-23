'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ShieldCheck, Download, Lock, Star, Zap, CheckCircle2,
  Package, AlertTriangle, Loader2, ArrowLeft, Clock,
  FileText, FileArchive, ChevronRight, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HackingProduct } from '@/app/api/products/hacking/route';

const SharedHeader = dynamic(
  () => import('@/components/store/SharedHeader').then((m) => ({ default: m.SharedHeader })),
  { ssr: false },
);

/* ══════════════════════════════════════════════════════════════
   TRUST BADGES — sección debajo del hero
   ══════════════════════════════════════════════════════════════ */
function TrustBar() {
  const items = [
    { icon: <Zap className="w-5 h-5" />, text: 'Entrega instantánea', sub: 'Tras el pago, link generado' },
    { icon: <Lock className="w-5 h-5" />, text: 'Pago seguro', sub: 'MercadoPago / PayPal / Crypto' },
    { icon: <Download className="w-5 h-5" />, text: '5 descargas permitidas', sub: 'Válido por 24 horas' },
    { icon: <CheckCircle2 className="w-5 h-5" />, text: 'Soporte 30 días', sub: 'Email directo al equipo' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto mb-10">
      {items.map((it, i) => (
        <div
          key={i}
          className="flex flex-col items-center text-center p-3 rounded-xl bg-gray-900/60 border border-gray-800"
        >
          <div className="w-10 h-10 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center mb-2">
            {it.icon}
          </div>
          <p className="text-sm font-bold text-white">{it.text}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{it.sub}</p>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HERO
   ══════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <div className="text-center mb-10">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-200 text-xs font-bold mb-4">
        <ShieldCheck className="w-3.5 h-3.5" />
        DigiStore Security
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-3">
        Productos de hacking <span className="text-violet-400">profesionales</span>
        <br />
        <span className="text-gray-300 text-2xl sm:text-3xl md:text-4xl">listos para descargar</span>
      </h1>
      <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
        Manuales, guías prácticas, scripts y cheatsheets para pentesters, bug bounty hunters
        y profesionales de la seguridad. Todo el contenido es propio, verificado y se entrega
        automáticamente al confirmar tu pago.
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SKELETON CARD
   ══════════════════════════════════════════════════════════════ */
function SkeletonCard() {
  return (
    <div className="bg-gray-900/60 rounded-2xl overflow-hidden border border-gray-800 animate-pulse">
      <div className="aspect-[16/10] bg-gray-800/70" />
      <div className="p-4 space-y-2.5">
        <div className="h-5 w-3/4 rounded bg-gray-800" />
        <div className="h-3 w-full rounded bg-gray-800/70" />
        <div className="h-3 w-5/6 rounded bg-gray-800/70" />
        <div className="flex justify-between pt-3">
          <div className="h-8 w-24 rounded-lg bg-gray-800/70" />
          <div className="h-8 w-28 rounded-lg bg-violet-900/40" />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PRODUCT CARD
   ══════════════════════════════════════════════════════════════ */
function ProductCard({
  product,
  onBuy,
  buying,
}: {
  product: HackingProduct;
  onBuy: (p: HackingProduct) => void;
  buying: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  return (
    <article
      className={cn(
        'group relative bg-gray-900/80 rounded-2xl overflow-hidden border border-gray-800',
        'hover:border-violet-500/60 hover:shadow-2xl hover:shadow-violet-500/10',
        'transition-all duration-300 hover:-translate-y-1 flex flex-col',
      )}
    >
      {/* Preview image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-950">
        {!imgError ? (
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900 to-gray-900 flex items-center justify-center">
            <span className="text-6xl">{product.icon_emoji}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent pointer-events-none" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border bg-violet-500/30 text-violet-200 border-violet-400/50 backdrop-blur-md">
            <Package className="w-2.5 h-2.5" />
            {product.badge}
          </span>
          {discount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border bg-emerald-500/30 text-emerald-200 border-emerald-400/50 backdrop-blur-md">
              -{discount}%
            </span>
          )}
        </div>

        {/* Format badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-900/80 text-cyan-200 border border-cyan-700 backdrop-blur-md">
            {product.deliveryFormat === 'pdf' ? (
              <FileText className="w-3 h-3" />
            ) : (
              <FileArchive className="w-3 h-3" />
            )}
            {product.deliveryFormat.toUpperCase()}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-900/80 text-gray-200 border border-gray-700 backdrop-blur-md">
            {product.fileSize}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Title + rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base text-white leading-tight group-hover:text-violet-300 transition-colors">
            {product.icon_emoji} {product.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0 text-xs text-gray-300">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold">{product.rating}</span>
            <span className="text-gray-500">({product.reviews})</span>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-xs text-violet-300/80 italic">{product.tagline}</p>

        {/* Description */}
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
          {product.description}
        </p>

        {/* Features mini list */}
        <ul className="space-y-1 mt-1">
          {product.features.slice(0, 3).map((f, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] text-gray-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* Stats */}
        <div className="flex items-center gap-3 text-[11px] text-gray-500 pt-1 mt-auto">
          <span className="inline-flex items-center gap-1">
            <Download className="w-3 h-3" />
            {product.sold} vendidos
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {product.deliveryTime}
          </span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between gap-2 pt-3 border-t border-gray-800">
          <div>
            {product.originalPrice > product.price && (
              <p className="text-[11px] text-gray-500 line-through">${product.originalPrice.toFixed(2)}</p>
            )}
            <p className="text-2xl font-extrabold text-white">
              ${product.price.toFixed(2)}
              <span className="text-xs text-gray-400 ml-1 font-normal">USD</span>
            </p>
          </div>
          <button
            onClick={() => onBuy(product)}
            disabled={buying}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 text-sm font-bold py-2.5 px-5 rounded-xl',
              'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500',
              'text-white shadow-lg shadow-violet-500/30 transition-all',
              'disabled:opacity-60 disabled:cursor-not-allowed',
            )}
          >
            {buying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando…
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Comprar
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════════════════════════
   ERROR STATE
   ══════════════════════════════════════════════════════════════ */
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl bg-red-950/30 border border-red-900/50 p-8 text-center max-w-md mx-auto">
      <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
      <p className="text-red-200 text-sm font-semibold mb-1">Error al cargar productos</p>
      <p className="text-red-300/70 text-xs mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
      >
        Reintentar
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CHECKOUT MODAL
   ══════════════════════════════════════════════════════════════ */
type CheckoutState = 'idle' | 'creating' | 'redirect' | 'error';

function CheckoutModal({
  product,
  onClose,
  onConfirm,
  state,
  error,
}: {
  product: HackingProduct | null;
  onClose: () => void;
  onConfirm: (email: string) => void;
  state: CheckoutState;
  error: string | null;
}) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (product) {
      setEmail('');
      setEmailError('');
    }
  }, [product]);

  if (!product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Ingresa un email válido. Ahí te enviaremos el link de descarga.');
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-2xl border border-gray-800 max-w-md w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white p-2"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className="flex items-start gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-2xl shrink-0">
            {product.icon_emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-lg leading-tight">{product.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{product.tagline}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-950/50 rounded-xl p-3 mb-4 border border-gray-800">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Producto</span>
            <span className="text-white font-medium">${product.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Formato</span>
            <span className="text-white font-medium uppercase">{product.deliveryFormat} · {product.fileSize}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Entrega</span>
            <span className="text-emerald-300 font-medium">⚡ Instantánea tras pago</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Descargas</span>
            <span className="text-white font-medium">5 permitidas (24h)</span>
          </div>
          <div className="border-t border-gray-800 mt-2 pt-2 flex justify-between">
            <span className="text-white font-bold">Total</span>
            <span className="text-violet-300 font-extrabold text-lg">${product.price.toFixed(2)} USD</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-900/60 rounded-lg p-3 mb-4 text-xs text-red-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {state === 'redirect' ? (
          <div className="text-center py-4">
            <Loader2 className="w-8 h-8 text-violet-400 mx-auto animate-spin mb-3" />
            <p className="text-white text-sm font-semibold">Redirigiendo a MercadoPago…</p>
            <p className="text-gray-400 text-xs mt-1">No cierres esta ventana.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Email para recibir el link de descarga
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              placeholder="tu@email.com"
              disabled={state === 'creating'}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:border-violet-500 focus:outline-none disabled:opacity-60"
              autoFocus
            />
            {emailError && <p className="text-red-400 text-[11px] mt-1">{emailError}</p>}

            <button
              type="submit"
              disabled={state === 'creating'}
              className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-500/30"
            >
              {state === 'creating' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando orden…
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Pagar ${product.price.toFixed(2)} con MercadoPago
                </>
              )}
            </button>

            <p className="text-[10px] text-gray-500 text-center mt-3">
              Al continuar aceptas los términos. Pago seguro procesado por MercadoPago.
              Recibirás tu link de descarga por email automáticamente tras confirmar el pago.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════════════════ */
export default function SecurityPage() {
  const [products, setProducts] = useState<HackingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Checkout state
  const [selectedProduct, setSelectedProduct] = useState<HackingProduct | null>(null);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>('idle');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/products/hacking', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setProducts(data.products || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleBuy = useCallback((p: HackingProduct) => {
    setSelectedProduct(p);
    setCheckoutState('idle');
    setCheckoutError(null);
  }, []);

  const handleCheckout = useCallback(
    async (email: string) => {
      if (!selectedProduct) return;
      setCheckoutState('creating');
      setCheckoutError(null);

      try {
        const res = await fetch('/api/payments/create', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            email,
            items: [
              {
                id: selectedProduct.id,
                name: selectedProduct.name,
                price: selectedProduct.price,
                quantity: 1,
                deliveryType: 'download',
                fileName: selectedProduct.fileName,
                deliveryFormat: selectedProduct.deliveryFormat,
              },
            ],
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          // Manejar caso especial: MercadoPago no configurado
          if (data.error === 'payment_not_configured') {
            setCheckoutError(
              'La pasarela de pago aún no está configurada. Contacta a soporte@digistore.com para pagar por transferencia.',
            );
            setCheckoutState('idle');
            return;
          }
          throw new Error(data.message || data.error || 'Error al crear la orden');
        }

        // Redirigir a MercadoPago
        setCheckoutState('redirect');
        setPurchasingId(selectedProduct.id);

        if (data.paymentUrl) {
          // pequeño delay para que el usuario vea el mensaje
          setTimeout(() => {
            window.location.href = data.paymentUrl;
          }, 800);
        } else {
          throw new Error('No se recibió URL de pago');
        }
      } catch (err) {
        setCheckoutError(
          err instanceof Error ? err.message : 'Error de red. Intenta de nuevo.',
        );
        setCheckoutState('idle');
      }
    },
    [selectedProduct],
  );

  const handleCloseCheckout = useCallback(() => {
    setSelectedProduct(null);
    setCheckoutState('idle');
    setCheckoutError(null);
    setPurchasingId(null);
  }, []);

  const featured = products.filter((p) => p.featured);
  const rest = products.filter((p) => !p.featured);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-950 to-black text-white">
      <SharedHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a la tienda
        </Link>

        <Hero />
        <TrustBar />

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadProducts} />
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay productos disponibles todavía.</p>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-extrabold text-white">Destacados</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {featured.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onBuy={handleBuy}
                      buying={purchasingId === p.id && checkoutState === 'creating'}
                    />
                  ))}
                </div>
              </section>
            )}

            {rest.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-violet-400" />
                  <h2 className="text-lg font-extrabold text-white">Más productos</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {rest.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onBuy={handleBuy}
                      buying={purchasingId === p.id && checkoutState === 'creating'}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* FAQ / How it works */}
        <section className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-xl font-extrabold text-white text-center mb-6">
            ¿Cómo funciona la compra?
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                step: '1',
                title: 'Elige el producto',
                desc: 'Selecciona el manual, script o cheatsheet que necesites y haz clic en Comprar.',
                icon: <Package className="w-5 h-5" />,
              },
              {
                step: '2',
                title: 'Paga con MercadoPago',
                desc: 'Usa tarjetas, PSE, Nequi, efectivo o transferencia. Pago 100% seguro.',
                icon: <Lock className="w-5 h-5" />,
              },
              {
                step: '3',
                title: 'Recibe tu link',
                desc: 'Al confirmar el pago, te enviamos un link único de descarga a tu email.',
                icon: <Download className="w-5 h-5" />,
              },
              {
                step: '4',
                title: 'Descarga y disfruta',
                desc: 'Hasta 5 descargas en 24 horas. Soporte técnico por email por 30 días.',
                icon: <CheckCircle2 className="w-5 h-5" />,
              },
            ].map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl bg-gray-900/60 border border-gray-800"
              >
                <div className="w-10 h-10 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center shrink-0">
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-violet-300 font-bold mb-0.5">Paso {s.step}</p>
                  <p className="text-sm font-semibold text-white mb-1">{s.title}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 shrink-0 mt-2" />
              </div>
            ))}
          </div>
        </section>

        {/* Footer note */}
        <div className="mt-16 text-center text-xs text-gray-500 max-w-2xl mx-auto">
          <p className="mb-2">
            <ShieldCheck className="w-4 h-4 inline-block mr-1 -mt-0.5" />
            Todos los productos son propios de DigiStore y se entregan digitalmente.
          </p>
          <p>
            ¿Dudas? <a href="mailto:soporte@digistore.com" className="text-violet-300 hover:underline">soporte@digistore.com</a>
            {' '}·{' '}
            <Link href="/" className="text-violet-300 hover:underline">Volver a la tienda</Link>
          </p>
        </div>
      </div>

      {/* Checkout modal */}
      <CheckoutModal
        product={selectedProduct}
        onClose={handleCloseCheckout}
        onConfirm={handleCheckout}
        state={checkoutState}
        error={checkoutError}
      />
    </main>
  );
}
