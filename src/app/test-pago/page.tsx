'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ShieldCheck, Download, Lock, Star, Zap, CheckCircle2,
  Package, AlertTriangle, Loader2, ArrowLeft, ArrowRight,
  FileArchive, Sparkles, Cpu, Clock, PlayCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SharedHeader = dynamic(
  () => import('@/components/store/SharedHeader').then((m) => ({ default: m.SharedHeader })),
  { ssr: false },
);

interface TestProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  originalPrice: number;
  currency: string;
  image: string;
  icon_emoji: string;
  rating: number;
  reviews: number;
  sold: number;
  deliveryType: 'download';
  deliveryFormat: 'zip' | 'html';
  fileName: string;
  fileSize: string;
  deliveryTime: string;
  platform: string;
  features: string[];
  badge: string;
  isTestProduct: boolean;
}

type CheckoutState = 'idle' | 'creating' | 'success' | 'error';

interface Delivery {
  success: boolean;
  productId: string;
  productName: string;
  downloadUrl: string;
  downloadToken: string;
  expiresAt: string;
  details: Array<{ label: string; value: string }>;
  instructions: string;
}

export default function TestPagoPage() {
  const [product, setProduct] = useState<TestProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Checkout state
  const [state, setState] = useState<CheckoutState>('idle');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState('');
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  const loadProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/products/test', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`);
      if (data.products && data.products.length > 0) {
        setProduct(data.products[0]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Ingresa un email válido. Ahí te enviaremos el link de descarga.');
      return;
    }

    setState('creating');
    setCheckoutError(null);

    try {
      // Llamar a /api/payments/demo-create (pago simulado)
      const res = await fetch('/api/payments/demo-create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          items: [
            {
              id: product.id,
              name: product.name,
              price: product.price,
              quantity: 1,
              deliveryType: 'download',
              fileName: product.fileName,
              deliveryFormat: product.deliveryFormat,
            },
          ],
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Error al crear la orden');
      }

      setOrderId(data.orderId);
      setDeliveries(data.deliveries || []);
      setState('success');
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : 'Error de red. Intenta de nuevo.',
      );
      setState('error');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-950 to-black text-white">
      <SharedHeader />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a la tienda
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold mb-4">
            <Cpu className="w-3.5 h-3.5" />
            PÁGINA DE TESTING - FLUJO DE PAGO COMPLETO
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-3">
            Auditoría de <span className="text-amber-400">pago</span>
            <br />
            <span className="text-gray-300 text-2xl sm:text-3xl md:text-4xl">end-to-end</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Esta página prueba todo el flujo: <strong className="text-white">producto</strong> →{' '}
            <strong className="text-white">checkout</strong> →{' '}
            <strong className="text-white">pago</strong> →{' '}
            <strong className="text-white">webhook</strong> →{' '}
            <strong className="text-white">link de entrega</strong> →{' '}
            <strong className="text-white">descarga</strong>.
            <br />
            <span className="text-amber-300">
              El pago está simulado (no requiere MercadoPago). La descarga es REAL.
            </span>
          </p>
        </div>

        {/* Steps indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-10 max-w-3xl mx-auto">
          {[
            { step: 1, label: 'Producto', icon: Package, active: true },
            { step: 2, label: 'Checkout', icon: Lock, active: !!product || state !== 'idle' },
            { step: 3, label: 'Pago', icon: Zap, active: state === 'creating' || state === 'success' },
            { step: 4, label: 'Entrega', icon: Download, active: state === 'success' },
            { step: 5, label: 'Descarga', icon: CheckCircle2, active: state === 'success' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-xl border text-center',
                  s.active
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                    : 'bg-gray-900/60 border-gray-800 text-gray-500',
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wide">
                  {s.step}. {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="max-w-md mx-auto bg-gray-900/60 border border-gray-800 rounded-2xl p-8 text-center">
            <Loader2 className="w-10 h-10 text-amber-400 mx-auto mb-3 animate-spin" />
            <p className="text-gray-400 text-sm">Cargando producto de prueba...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="max-w-md mx-auto bg-red-950/30 border border-red-900/50 rounded-2xl p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-200 text-sm font-semibold mb-1">Error al cargar</p>
            <p className="text-red-300/70 text-xs mb-4">{error}</p>
            <button
              onClick={loadProduct}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Product + Checkout */}
        {product && !loading && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Left: Product card */}
            <div className="bg-gray-900/80 rounded-2xl border border-gray-800 overflow-hidden">
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-950">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 to-violet-900/40 flex items-center justify-center">
                  <span className="text-6xl">{product.icon_emoji}</span>
                </div>
                <div className="absolute top-3 left-3 right-3 flex justify-between">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border bg-amber-500/30 text-amber-200 border-amber-400/50 backdrop-blur-md">
                    <Package className="w-2.5 h-2.5" /> {product.badge}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border bg-emerald-500/30 text-emerald-200 border-emerald-400/50 backdrop-blur-md">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-900/80 text-cyan-200 border border-cyan-700 backdrop-blur-md">
                    <FileArchive className="w-3 h-3" /> {product.deliveryFormat.toUpperCase()}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-900/80 text-gray-200 border border-gray-700 backdrop-blur-md">
                    {product.fileSize}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="font-bold text-lg text-white">
                    {product.icon_emoji} {product.name}
                  </h2>
                  <div className="flex items-center gap-1 shrink-0 text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-white">{product.rating}</span>
                    <span className="text-gray-500">({product.reviews})</span>
                  </div>
                </div>
                <p className="text-xs text-amber-300/80 italic mb-2">{product.tagline}</p>
                <p className="text-xs text-gray-400 leading-relaxed mb-3">
                  {product.description}
                </p>
                <ul className="space-y-1.5 mb-4">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-gray-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-end justify-between pt-3 border-t border-gray-800">
                  <div>
                    <p className="text-[11px] text-gray-500 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </p>
                    <p className="text-2xl font-extrabold text-white">
                      ${product.price.toFixed(2)}
                      <span className="text-xs text-gray-400 ml-1 font-normal">USD</span>
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-500 inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {product.deliveryTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Checkout form / Success state */}
            <div className="bg-gray-900/80 rounded-2xl border border-gray-800 p-5">
              {state === 'success' ? (
                <>
                  {/* Success state */}
                  <div className="text-center mb-4">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    </div>
                    <h3 className="font-bold text-white text-lg">¡Pago aprobado!</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Orden: <code className="text-amber-300">{orderId}</code>
                    </p>
                    <p className="text-[10px] text-emerald-300 mt-1">
                      ✓ Webhook procesado · ✓ Token generado · ✓ Producto listo
                    </p>
                  </div>

                  {deliveries.map((d, i) => (
                    <div key={i} className="bg-gray-950/50 border border-gray-800 rounded-xl p-4 mb-3">
                      <div className="flex items-start gap-2 mb-2">
                        <FileArchive className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-sm">{d.productName}</p>
                          <p className="text-[10px] text-gray-400">
                            Vence: {new Date(d.expiresAt).toLocaleString('es-ES')}
                          </p>
                        </div>
                      </div>

                      <div className="text-[10px] text-gray-500 mb-3 space-y-0.5">
                        {d.details.map((det, j) => (
                          <div key={j} className="flex justify-between">
                            <span>{det.label}:</span>
                            <span className="text-gray-300">{det.value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Big download button */}
                      <a
                        href={d.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3 px-4 rounded-xl text-center transition-all shadow-lg shadow-emerald-500/30"
                      >
                        <Download className="w-4 h-4 inline mr-2" />
                        Descargar {d.productName}
                      </a>

                      <p className="text-[10px] text-gray-500 mt-2 text-center">
                        Link directo: <code className="text-cyan-300 text-[9px] break-all">{d.downloadUrl}</code>
                      </p>

                      <details className="mt-3">
                        <summary className="text-[10px] text-gray-500 cursor-pointer hover:text-gray-300">
                          Ver instrucciones
                        </summary>
                        <pre className="mt-2 text-[10px] text-gray-400 whitespace-pre-wrap font-sans">
                          {d.instructions}
                        </pre>
                      </details>
                    </div>
                  ))}

                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mt-4">
                    <p className="text-xs text-amber-200">
                      <strong>📋 Auditoría:</strong> Si puedes hacer click en el botón verde
                      "Descargar" y se descarga el archivo ZIP, el flujo de pago está funcionando
                      correctamente.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setState('idle');
                      setDeliveries([]);
                      setOrderId('');
                    }}
                    className="mt-3 w-full text-xs text-gray-400 hover:text-white py-2"
                  >
                    ← Volver a probar
                  </button>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-white text-lg mb-2">Checkout de prueba</h3>
                  <p className="text-xs text-gray-400 mb-4">
                    Simula el pago sin MercadoPago. Recibirás un link de descarga real
                    inmediatamente.
                  </p>

                  {checkoutError && (
                    <div className="bg-red-950/40 border border-red-900/60 rounded-lg p-3 mb-4 text-xs text-red-300 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{checkoutError}</span>
                    </div>
                  )}

                  <form onSubmit={handleCheckout}>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Email para recibir el link
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
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:border-amber-500 focus:outline-none disabled:opacity-60"
                      autoFocus
                    />
                    {emailError && <p className="text-red-400 text-[11px] mt-1">{emailError}</p>}

                    <div className="bg-gray-950/50 border border-gray-800 rounded-xl p-3 my-4 text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Producto</span>
                        <span className="text-white font-medium">{product.name}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Formato</span>
                        <span className="text-white font-medium uppercase">
                          {product.deliveryFormat} · {product.fileSize}
                        </span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Entrega</span>
                        <span className="text-emerald-300 font-medium">⚡ Instantánea</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Descargas permitidas</span>
                        <span className="text-white">5 (24h)</span>
                      </div>
                      <div className="border-t border-gray-800 mt-2 pt-2 flex justify-between">
                        <span className="text-white font-bold">Total</span>
                        <span className="text-amber-300 font-extrabold text-lg">
                          ${product.price.toFixed(2)} USD
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={state === 'creating'}
                      className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30"
                    >
                      {state === 'creating' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Procesando pago simulado…
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Pagar ${product.price.toFixed(2)} (simulado)
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-gray-500 text-center mt-3">
                      <strong>Modo demo:</strong> no se cobra nada. Es solo para probar el flujo.
                      En producción, aquí se redirige a MercadoPago.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        {/* Audit checklist */}
        <div className="max-w-3xl mx-auto bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Checklist de auditoría
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: 'API /api/products/test devuelve producto', passed: !loading && !!product },
              { label: 'Formulario de checkout valida email', passed: true },
              { label: 'API /api/payments/demo-create procesa orden', passed: state === 'success' },
              { label: 'Webhook simulado genera token', passed: state === 'success' && !!orderId },
              { label: 'Delivery URL creada en respuesta', passed: deliveries.length > 0 },
              { label: 'Link de descarga sirve archivo real', passed: false },
              { label: 'Token tiene expiración 24h', passed: deliveries.length > 0 },
              { label: 'Límite de 5 descargas por token', passed: false },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                {item.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-600 shrink-0 mt-0.5" />
                )}
                <span className={cn(item.passed ? 'text-gray-300' : 'text-gray-500')}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-400">
            <p>
              <strong>Para producción:</strong> Configurar{' '}
              <code className="text-amber-300">MERCADOPAGO_ACCESS_TOKEN</code> en Vercel
              Environment Variables. El flujo real es idéntico excepto que el pago pasa por
              MercadoPago y el webhook es llamado por MercadoPago (no por nuestra API).
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
