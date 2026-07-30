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
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQuantity, clearCart, cartTotal } = useStore();
  const [email, setEmail] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderResult, setOrderResult] = useState<{ success: boolean; orderId?: string; message?: string } | null>(null);

  const handleCheckout = async () => {
    if (!email) return;
    setCheckingOut(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          items: cart.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderResult(data);
        clearCart();
      }
    } catch {
      setOrderResult({ success: false, message: 'Error al procesar el pedido' });
    }
    setCheckingOut(false);
  };

  const closeAndReset = () => {
    setCartOpen(false);
    setTimeout(() => {
      setOrderResult(null);
      setEmail('');
    }, 300);
  };

  return (
    <Sheet open={cartOpen} onOpenChange={closeAndReset}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Tu Carrito
            {cart.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({cart.reduce((c, i) => c + i.quantity, 0)} items)
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {orderResult?.success ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6"
            >
              <Zap className="w-10 h-10 text-emerald-600" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2">¡Pedido Exitoso!</h3>
            <p className="text-sm text-muted-foreground mb-1">Orden: {orderResult.orderId}</p>
            <p className="text-sm text-muted-foreground mb-6">{orderResult.message}</p>
            <Button onClick={closeAndReset} className="cursor-pointer">
              Seguir Comprando <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground/20 mb-4" />
                  <p className="text-muted-foreground text-sm">Tu carrito está vacío</p>
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
                        {item.product.platform === 'Fortnite' ? '🎯' :
                         item.product.platform === 'Spotify' ? '🎵' :
                         item.product.platform === 'Netflix' ? '🎬' :
                         item.product.platform === 'Steam' ? '🎮' :
                         item.product.platform === 'Windows' ? '🪟' :
                         item.product.platform === 'Xbox' ? '🟢' :
                         item.product.platform === 'YouTube' ? '▶️' :
                         item.product.platform === 'Microsoft' ? '📊' : '📦'}
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
                      <span>${cartTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Envío</span>
                      <span className="text-emerald-600 font-medium">Gratis</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-lg">${cartTotal().toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-sm"
                    />
                    <Button
                      className="w-full gap-2 cursor-pointer"
                      size="lg"
                      disabled={!email || checkingOut}
                      onClick={handleCheckout}
                    >
                      {checkingOut ? (
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          Pagar Ahora
                        </>
                      )}
                    </Button>
                    <p className="text-[10px] text-muted-foreground text-center">
                      Pago seguro · Entrega instantánea · Garantía de reembolso
                    </p>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
