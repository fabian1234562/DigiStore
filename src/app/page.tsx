"use client";

import { useStore, PRODUCTS } from '@/lib/store';
import { CategoryBar } from '@/components/store/CategoryBar';
import { ProductGrid } from '@/components/store/ProductGrid';
import { CartDrawer } from '@/components/store/CartDrawer';
import { FeaturedCard } from '@/components/store/FeaturedCard';
import { ProductDetail } from '@/components/store/ProductDetail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthDialog } from '@/components/auth/AuthDialog';
import {
  ShoppingCart, Search, Zap, Shield, Globe, Clock, Star,
  LogIn, LogOut, ArrowRight, Sparkles, CreditCard, Headphones, BadgeCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' } }),
};

function HeroShowcase() {
  const p1 = PRODUCTS[0];
  const p2 = PRODUCTS[20];
  const p3 = PRODUCTS[23];
  const p4 = PRODUCTS[5];
  const d2 = Math.round(((p2.originalPrice! - p2.price) / p2.originalPrice!) * 100);
  const d4 = Math.round(((p4.originalPrice! - p4.price) / p4.originalPrice!) * 100);

  const cards = [
    { p: p1, label: 'Gaming', priceColor: 'text-violet-400', badge: 'Entrega instantanea', badgeColor: 'bg-emerald-500/20 text-emerald-400', top: 'top-0 right-4', w: 'w-48', rot: 'rotate-3' },
    { p: p2, label: 'Streaming', priceColor: 'text-fuchsia-400', badge: `-${d2}%`, badgeColor: 'bg-amber-500/20 text-amber-400', top: 'top-16 left-0', w: 'w-44', rot: '-rotate-6' },
    { p: p3, label: 'Gift Card', priceColor: 'text-sky-400', badge: 'TOP', badgeColor: 'bg-violet-500/20 text-violet-400', top: 'bottom-16 right-12', w: 'w-40', rot: 'rotate-2' },
    { p: p4, label: 'Gaming', priceColor: 'text-amber-400', badge: `-${d4}%`, badgeColor: 'bg-red-500/20 text-red-400', top: 'bottom-0 left-8', w: 'w-44', rot: '-rotate-3' },
  ];

  return (
    <div className="relative h-[420px]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/15 rounded-full blur-[100px]" />
      <div className="absolute top-1/3 left-1/3 w-[200px] h-[200px] bg-fuchsia-500/10 rounded-full blur-[80px]" />
      {cards.map((c, i) => (
        <div
          key={c.p.id}
          className={`absolute ${c.top} ${c.w} rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/40 ${c.rot} hover:rotate-0 transition-transform duration-700`}
        >
          <img src={c.p.image} alt="" className="w-full aspect-[4/3] object-cover" />
          <div className="bg-white/[0.06] backdrop-blur-md p-2.5">
            <p className="text-[10px] text-white/50">{c.label}</p>
            <p className="text-xs font-semibold truncate">{c.p.name}</p>
            <div className="flex items-center justify-between mt-1">
              <span className={`text-sm font-bold ${c.priceColor}`}>${c.p.price.toFixed(2)}</span>
              <span className={`text-[9px ${c.badgeColor} px-1.5 py-0.5 rounded`}>{c.badge}</span>
            </div>
          </div>
        </div>
      ))}
      <div className="absolute top-8 left-1/3 w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
      <div className="absolute top-1/2 right-0 w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
      <div className="absolute top-1/3 right-1/3 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
    </div>
  );
}

export default function Home() {
  const { cartCount, setCartOpen, user, setUser, searchQuery, setSearchQuery, sortBy, setSortBy } = useStore();
  const totalSold = PRODUCTS.reduce((s, p) => s + p.sold, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-background/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center shadow-lg shadow-primary/25">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-base tracking-tight">Digi</span><span className="font-bold text-base tracking-tight text-primary">Store</span>
            </div>
          </a>
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <Input placeholder="Buscar juegos, streaming, gift cards..." className="pl-10 h-10 text-sm bg-white/[0.04] border-white/[0.06] focus:border-primary/40 focus:bg-white/[0.06] placeholder:text-muted-foreground/50 rounded-xl transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-medium leading-none">{user.name}</span>
                  <span className="text-[10px] text-muted-foreground leading-none mt-0.5">{user.email}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setUser(null)} className="h-9 w-9 cursor-pointer hover:bg-white/[0.06]">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer hover:bg-white/[0.06] text-muted-foreground" onClick={() => useStore.getState().setAuthOpen(true)}>
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Ingresar</span>
              </Button>
            )}
            <Button variant="outline" size="sm" className="relative gap-2 cursor-pointer bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] hover:border-primary/30 rounded-xl" onClick={() => setCartOpen(true)}>
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Carrito</span>
              {cartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-primary/30">{cartCount()}</span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.15),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(139,92,246,0.08),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_20%_80%,rgba(99,102,241,0.06),transparent)]" />
          </div>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20">
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
              {/* Left */}
              <div className="flex-1 text-center lg:text-left space-y-6 max-w-2xl">
                <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                  <Sparkles className="w-4 h-4" /><span>Entrega instantanea a tu email</span>
                </motion.div>
                <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]">
                  Tu tienda de{' '}
                  <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-300 bg-clip-text text-transparent">productos digitales</span>
                  <br className="hidden sm:block" />favoritos
                </motion.h1>
                <motion.p variants={fadeUp} custom={2} className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Gaming, streaming, software y gift cards al mejor precio. Activacion inmediata, soporte 24/7 y garantia en cada compra.
                </motion.p>
                <motion.div variants={fadeUp} custom={3} className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
                  <Button size="lg" className="gap-2 cursor-pointer rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-violet-600/25 h-12 px-8 text-sm font-semibold" onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}>
                    Explorar Tienda <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
                <motion.div variants={fadeUp} custom={4} className="flex flex-wrap justify-center lg:justify-start gap-6 pt-4">
                  <div className="text-center"><p className="text-xl font-bold">{(totalSold / 1000).toFixed(0)}K+</p><p className="text-[11px] text-muted-foreground">Ventas exitosas</p></div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="text-center"><p className="text-xl font-bold">4.7★</p><p className="text-[11px] text-muted-foreground">Calificacion</p></div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="text-center"><p className="text-xl font-bold">24/7</p><p className="text-[11px] text-muted-foreground">Soporte</p></div>
                </motion.div>
              </div>
              {/* Right */}
              <div className="flex-1 max-w-md w-full hidden lg:block">
                <HeroShowcase />
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BAND */}
        <section className="border-y border-white/[0.04] bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[{ icon: Zap, label: 'Entrega Instantanea', desc: 'Recibe tu producto en segundos', color: 'text-violet-400' }, { icon: Shield, label: 'Pago 100% Seguro', desc: 'Encriptacion de punta a punta', color: 'text-emerald-400' }, { icon: Headphones, label: 'Soporte 24/7', desc: 'Siempre disponibles para ti', color: 'text-amber-400' }, { icon: BadgeCheck, label: 'Garantia 30 Dias', desc: 'Reemplazo o reembolso total', color: 'text-sky-400' }].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div><p className="text-sm font-semibold">{item.label}</p><p className="text-[11px] text-muted-foreground">{item.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1"><div className="w-1 h-6 rounded-full bg-gradient-to-b from-violet-400 to-fuchsia-400" /><h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Productos Destacados</h2></div>
              <p className="text-sm text-muted-foreground ml-3">Los mas vendidos con los mejores precios del mercado</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRODUCTS.filter(p => p.featured).slice(0, 4).map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}>
                <FeaturedCard product={product} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* ALL PRODUCTS */}
        <section id="productos" className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1"><div className="w-1 h-6 rounded-full bg-gradient-to-b from-sky-400 to-violet-400" /><h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Todos los Productos</h2></div>
              <p className="text-sm text-muted-foreground ml-3">Explora nuestro catalogo completo de productos digitales</p>
            </div>
          </div>
          <div className="space-y-5">
            <CategoryBar />
            <ProductGrid />
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/90 via-fuchsia-600/80 to-violet-700/90" />
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              <div className="relative px-8 py-12 sm:px-16 sm:py-16 text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">Precios imposibles de encontrar<br className="hidden sm:block" /> en otro lado</h2>
                  <p className="text-white/70 max-w-xl mx-auto leading-relaxed">Mas de {(totalSold / 1000).toFixed(0)}K clientes confian en nosotros. Productos digitales con entrega instantanea, soporte real y garantia total en cada compra.</p>
                  <Button size="lg" className="mt-4 gap-2 cursor-pointer rounded-xl bg-white text-violet-700 hover:bg-white/90 border-0 shadow-xl h-12 px-8 text-sm font-bold" onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}>
                    Ver Todos los Productos <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.04] bg-white/[0.01] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="col-span-2 sm:col-span-1 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center"><Zap className="w-4.5 h-4.5 text-white" /></div>
                <div><span className="font-bold text-base tracking-tight">Digi</span><span className="font-bold text-base tracking-tight text-primary">Store</span></div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Tu tienda de confianza para productos digitales. Gaming, streaming, software y mas con entrega inmediata.</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-foreground">Productos</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">{['Gaming', 'Streaming', 'Gift Cards', 'Software', 'Suscripciones'].map((item) => <li key={item} className="hover:text-foreground transition-colors cursor-pointer">{item}</li>)}</ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-foreground">Soporte</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">{['Centro de ayuda', 'Chat en vivo', 'Garantias', 'Metodos de pago', 'Preguntas frecuentes'].map((item) => <li key={item} className="hover:text-foreground transition-colors cursor-pointer">{item}</li>)}</ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-foreground">Legal</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">{['Terminos de servicio', 'Privacidad', 'Devoluciones', 'Contacto'].map((item) => <li key={item} className="hover:text-foreground transition-colors cursor-pointer">{item}</li>)}</ul>
            </div>
          </div>
          <div className="border-t border-white/[0.04] mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-muted-foreground">2025 DigiStore. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /><span>Pagos seguros</span></div>
              <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /><span>Envio global</span></div>
            </div>
          </div>
        </div>
      </footer>

      <CartDrawer />
      <ProductDetail />
      <AuthDialog />
    </div>
  );
}
