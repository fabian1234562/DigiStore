  'use client';

import { useStore } from '@/lib/store';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Zap,
  ArrowRight,
  KeyRound,
  Ticket,
  ShieldCheck,
  Copy,
  Check,
  Mail,
  UserCircle,
  ChevronDown,
  ChevronUp,
  FileDown,
  AlertCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeliveryDetail {
  label: string;
  value: string;
}

interface DeliveryItem {
  success?: boolean;
  type?: string;
  typeLabel?: string;
  icon?: string;
  productName: string;
  details?: DeliveryDetail[];
  instructions?: string;
  message?: string;
  productId?: string;
}

interface OrderResult {
  success: boolean;
  error?: string;
  orderId?: string;
  message?: string;
  total?: number;
  email?: string;
  date?: string;
  paymentMethod?: string;
  deliveries?: DeliveryItem[];
  deliveryMethods?: {
    email: string;
    account: string;
  };
  setupUrl?: string;
}

function DeliveryIcon({ icon, className }: { icon: string; className?: string }) {
  if (icon === 'KeyRound') return <KeyRound className={className || 'w-5 h-5'} />;
  if (icon === 'Ticket') return <Ticket className={className || 'w-5 h-5'} />;
  if (icon === 'ShieldCheck') return <ShieldCheck className={className || 'w-5 h-5'} />;
  return <CreditCard className={className || 'w-5 h-5'} />;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer"
      title="Copiar"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
    </button>
  );
}

function DeliveryCard({ delivery, index }: { delivery: DeliveryItem; index: number }) {
  const [expanded, setExpanded] = useState(true);
  const isFailed = delivery.success === false;

  const typeColor = isFailed ? 'text-red-600 bg-red-50 border-red-200' : 'text-purple-600 bg-purple-50 border-purple-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="border border-border rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${typeColor}`}>
            {isFailed ? <AlertCircle className="w-4 h-4" /> : <DeliveryIcon icon={delivery.icon || 'Ticket'} className="w-4 h-4" />}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">{delivery.productName}</p>
            <p className="text-xs text-muted-foreground">{isFailed ? 'No disponible' : delivery.typeLabel}</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {isFailed ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs text-red-700 leading-relaxed">{delivery.message}</p>
                </div>
              ) : (
                <>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    {delivery.details?.map((d, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{d.label}</span>
                        <div className="flex items-center gap-1.5 flex-1 justify-end">
                          <span className="text-xs font-mono font-semibold text-right break-all text-purple-700">
                            {d.value}
                          </span>
                          <CopyButton text={d.value} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {delivery.instructions && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide mb-1.5">Como activar tu producto</p>
                      <pre className="text-xs text-emerald-800 whitespace-pre-wrap font-sans leading-relaxed">{delivery.instructions}</pre>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function OrderSuccess({ result }: { result: OrderResult }) {
  const handleCopyAll = () => {
    if (!result.deliveries) return;
    const successDeliveries = result.deliveries.filter(d => d.success !== false && d.details);
    const text = successDeliveries.map(d => {
      const details = d.details!.map(det => `${det.label}: ${det.value}`).join('\n');
      return `=== ${d.productName} ===\nTipo: ${d.typeLabel}\n${details}\n\nInstrucciones:\n${d.instructions}`;
    }).join('\n\n---\n\n');
    navigator.clipboard.writeText(`Orden: ${result.orderId}\nFecha: ${result.date}\nTotal: $${result.total?.toFixed(2)}\nEmail: ${result.email}\n\n${text}`);
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 self-center"
      >
        <Zap className="w-8 h-8 text-emerald-600" />
      </motion.div>

      <h3 className="text-xl font-bold text-center mb-1">Pedido Exitoso</h3>
      <p className="text-sm text-muted-foreground text-center mb-4">{result.message || 'Tus productos digitales están listos'}</p>

      <div className="bg-muted/50 rounded-lg p-3 mb-4 space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Orden</span>
          <span className="font-mono font-semibold">{result.orderId}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Fecha</span>
          <span>{result.date ? new Date(result.date).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' }) : ''}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Total</span>
          <span className="font-bold text-emerald-600">${result.total?.toFixed(2)} USD</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Pago</span>
          <span className="font-mono text-xs">{result.paymentMethod || 'MercadoPago'}</span>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Ticket className="w-4 h-4 text-purple-600" />
          <p className="text-[10px] font-semibold text-purple-700 uppercase tracking-wide">Tus Codigos Reales</p>
        </div>
        <p className="text-xs text-purple-600">Cada codigo fue obtenido directamente del proveedor oficial y es 100% real y canjeable.</p>
      </div>

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Productos ({result.deliveries?.length || 0})</p>
          <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 px-2 cursor-pointer" onClick={handleCopyAll}>
            <FileDown className="w-3 h-3" /> Copiar Todo
          </Button>
        </div>
        <ScrollArea className="max-h-[40vh]">
          <div className="space-y-2 pr-2">
            {result.deliveries?.map((d, i) => (
              <DeliveryCard key={i} delivery={d} index={i} />
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="mt-auto space-y-2">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <p className="text-[10px] font-semibold text-blue-700">Codigos enviados por email</p>
          </div>
          <p className="text-[10px] text-blue-600">Tambien puedes encontrar los codigos en tu email de compra.</p>
        </div>
      </div>
    </div>
  );
}

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQuantity, clearCart, cartTotal } = useStore();
  const [email, setEmail] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  // Al abrir el drawer, verificar si hay resultado de pago en la URL
  useEffect(() => {
    if (cartOpen) return;
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const orderId = params.get('order');

    if (paymentStatus === 'success' && orderId) {
      // Consultar resultado de la orden
      fetchOrderResult(orderId);
      // Limpiar URL
      window.history.replaceState({}, '', '/tienda');
    }
  }, [cartOpen]);

  const fetchOrderResult = async (orderId: string) => {
    setCheckingOut(true);
    try {
      const res = await fetch(`/api/payments/webhook?order=${orderId}`);
      const data = await res.json();
      if (data.success) {
        setOrderResult(data);
        clearCart();
        setCartOpen(true);
      }
    } catch {
      // Silenciar - el webhook puede tardar unos segundos
      setTimeout(() => fetchOrderResult(orderId), 3000);
    }
    setCheckingOut(false);
  };

  const handleCheckout = async () => {
    if (!email) return;
    setCheckingOut(true);
    setConfigError(null);

    try {
      // Crear pago en MercadoPago
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          items: cart.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            category: item.product.category,
            platform: item.product.platform,
          })),
        }),
      });

      const data = await res.json();

      if (data.success && data.paymentUrl) {
        // Redirigir a MercadoPago para que el cliente pague
        window.location.href = data.paymentUrl;
        return; // No cerrar el drawer ni limpiar el carrito aún
      }

      if (data.error === 'payment_not_configured') {
        setConfigError(data.setupUrl || 'https://www.mercadopago.com.co');
        setOrderResult({
          success: false,
          message: data.message,
          setupUrl: data.setupUrl,
        });
      } else {
        setOrderResult({
          success: false,
          message: data.message || 'Error al procesar el pago',
        });
      }
    } catch {
      setOrderResult({ success: false, message: 'Error de conexion. Intenta de nuevo.' });
    }

    setCheckingOut(false);
  };

  const closeAndReset = () => {
    setCartOpen(false);
    setTimeout(() => {
      setOrderResult(null);
      setEmail('');
      setConfigError(null);
    }, 300);
  };

  const total = cartTotal();

  return (
    <Sheet open={cartOpen} onOpenChange={closeAndReset}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="flex items-center gap-2">
            {orderResult?.success ? (
              <Zap className="w-5 h-5 text-emerald-600" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
            {orderResult?.success ? 'Entrega de Productos' : 'Tu Carrito'}
            {!orderResult && cart.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({cart.reduce((c, i) => c + i.quantity, 0)} items)
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {orderResult?.success ? (
          <OrderSuccess result={orderResult} />
        ) : orderResult && !orderResult.success ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">Configuracion Requerida</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {orderResult.message || 'La pasarela de pagos necesita ser configurada para procesar tu compra.'}
            </p>
            {configError && (
              <a
                href={configError}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                Configurar cuenta MercadoPago
              </a>
            )}
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground/20 mb-4" />
                  <p className="text-muted-foreground text-sm">Tu carrito esta vacio</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {cart.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-3 py-4"
                    >
                      <div className="w-14 h-14 rounded-lg bg-muted/80 flex items-center justify-center text-2xl shrink-0">
                        {item.product.platform === 'Fortnite' ? '\uD83C\uDFAF' :
                         item.product.platform === 'Spotify' ? '\uD83C\DFB5' :
                         item.product.platform === 'Netflix' ? '\uD83C\DFAC' :
                         item.product.platform === 'Steam' ? '\uD83C\DFAE' :
                         item.product.platform === 'Xbox' ? '\uD83D\DFE2' :
                         item.product.platform === 'YouTube' ? '\u25B6\uFE0F' :
                         item.product.platform === 'Microsoft' ? '\uD83D\uDCCA' : '\uD83D\uDCE6'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{item.product.platform}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">${(item.product.price * item.quantity).toFixed(2)}</span>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="w-6 h-6 rounded-md hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </ScrollArea>

            {cart.length > 0 && (
              <>
                <Separator />
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Envio</span>
                      <span className="text-emerald-600 font-medium">Gratis</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-lg">${total.toFixed(2)} USD</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="tu@email.com - para recibir tus codigos"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-sm"
                    />
                    <Button
                      className="w-full gap-2 cursor-pointer bg-[#009ee3] hover:bg-[#0086c1]"
                      size="lg"
                      disabled={!email || checkingOut}
                      onClick={handleCheckout}
                    >
                      {checkingOut ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          Pagar con MercadoPago
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                    <div className="flex items-center justify-center gap-3 pt-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Pago seguro
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Entrega instantanea
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <KeyRound className="w-3 h-3" /> Codigos reales
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {orderResult?.success && (
          <SheetFooter className="p-4 border-t">
            <Button onClick={closeAndReset} className="w-full gap-2 cursor-pointer">
              Seguir Comprando <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
