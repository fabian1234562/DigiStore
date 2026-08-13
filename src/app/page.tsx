"use client";

import { useStore, PRODUCTS } from '@/lib/store';
import { CartDrawer } from '@/components/store/CartDrawer';
import { FeaturedCard } from '@/components/store/FeaturedCard';
import { ProductCard } from '@/components/store/ProductCard';
import { ProductDetail } from '@/components/store/ProductDetail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthDialog } from '@/components/auth/AuthDialog';
import {
  ShoppingCart, Search, Zap, Shield, Globe, Clock,
  LogIn, LogOut, ArrowRight, Sparkles, CreditCard, Headphones, BadgeCheck,
  Gamepad2, Tv, Gift, AppWindow, RefreshCw, Flame, Star, Users, TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' } }),
};

/* ── Animated Marquee Band ── */
const marqueeItems = [
  { icon: Zap, text: 'Entrega Instantanea' },
  { icon: Shield, text: 'Pago 100% Seguro' },
  { icon: Headphones, text: 'Soporte 24/7' },
  { icon: BadgeCheck, text: 'Garantia 30 Dias' },
  { icon: Globe, text: 'Disponible en todo el mundo' },
  { icon: Users, text: 'Mas de 850K clientes' },
  { icon: CreditCard, text: 'Todos los metodos de pago' },
  { icon: Sparkles, text: 'Productos verificados' },
];

function MarqueeBand() {
  return (
    <div className="relative overflow-hidden border-y border-white/[0.04] bg-white/[0.01] py-3">
      <div className="marquee-track">
        {[...marqueeItems, ...marqueeItems].map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-6 shrink-0">
            <item.icon className="w-3.5 h-3.5 text-primary/60" />
            <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">{item.text}</span>
            <span className="text-white/10 ml-4">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Hero Showcase Cards ── */
function HeroShowcase() {
  const featured = PRODUCTS.filter(p => p.featured).sort((a, b) => b.sold - a.sold);
  const p1 = featured[0], p2 = featured[3], p3 = featured[6], p4 = featured[9];
  if (!p1 || !p2 || !p3 || !p4) return null;

  const d2 = Math.round(((p2.originalPrice! - p2.price) / p2.originalPrice!) * 100);
  const d4 = Math.round(((p4.originalPrice! - p4.price) / p4.originalPrice!) * 100);

  const cards = [
    { p: p1, label: 'TOP VENTAS', badge: 'Entrega instantanea', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', top: 'top-0 right-4', w: 'w-52', rot: 'rotate-3' },
    { p: p2, label: 'OFERTA', badge: `-${d2}% DESCUENTO`, badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30', top: 'top-16 left-0', w: 'w-44', rot: '-rotate-6' },
    { p: p3, label: 'POPULAR', badge: 'TENDENCIA', badgeColor: 'bg-violet-500/20 text-violet-400 border-violet-500/30', top: 'bottom-16 right-8', w: 'w-40', rot: 'rotate-2' },
    { p: p4, label: 'NUEVO', badge: `-${d4}%`, badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30', top: 'bottom-0 left-6', w: 'w-44', rot: '-rotate-3' },
  ];

  return (
    <div className="relative h-[300px] sm:h-[400px] lg:h-[460px]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/3 left-1/4 w-[200px] h-[200px] bg-fuchsia-500/8 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[150px] h-[150px] bg-cyan-500/8 rounded-full blur-[80px]" />
      {cards.map((c, i) => (
        <div
          key={c.p.id}
          className={`absolute ${c.top} ${c.w} rounded-2xl overflow-hidden glass-strong shadow-2xl shadow-black/50 ${c.rot} hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer group`}
        >
          <div className="relative aspect-[4/3] overflow-hidden">
            <img src={c.p.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className={`absolute top-2 left-2 text-[8px] font-bold px-2 py-0.5 rounded-md border ${c.badgeColor} backdrop-blur-sm`}>{c.badge}</div>
          </div>
          <div className="glass p-2.5">
            <p className="text-[9px] text-white/40 font-semibold tracking-wider uppercase">{c.label}</p>
            <p className="text-xs font-bold truncate mt-0.5">{c.p.name}</p>
            <p className="text-sm font-extrabold text-gradient price-tag mt-1">${c.p.price.toFixed(2)}</p>
          </div>
        </div>
      ))}
      {[...Array(6)].map((_, i) => (
        <div key={i} className={`absolute w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse`} style={{
          top: `${15 + i * 15}%`, left: `${10 + i * 16}%`, animationDelay: `${i * 0.5}s`
        }} />
      ))}
    </div>
  );
}

/* ── Category Data ── */
const categoryData = [
  { id: 'gaming', name: 'Gaming', Icon: Gamepad2, gradient: 'from-violet-600/20 to-fuchsia-600/20', textColor: 'text-violet-400', borderColor: 'border-violet-500/20', hoverGlow: 'hover:shadow-violet-500/10' },
  { id: 'streaming', name: 'Streaming', Icon: Tv, gradient: 'from-red-600/20 to-orange-600/20', textColor: 'text-red-400', borderColor: 'border-red-500/20', hoverGlow: 'hover:shadow-red-500/10' },
  { id: 'giftcards', name: 'Gift Cards', Icon: Gift, gradient: 'from-amber-600/20 to-yellow-600/20', textColor: 'text-amber-400', borderColor: 'border-amber-500/20', hoverGlow: 'hover:shadow-amber-500/10' },
  { id: 'software', name: 'Software', Icon: AppWindow, gradient: 'from-cyan-600/20 to-blue-600/20', textColor: 'text-cyan-400', borderColor: 'border-cyan-500/20', hoverGlow: 'hover:shadow-cyan-500/10' },
  { id: 'subscriptions', name: 'Suscripciones', Icon: RefreshCw, gradient: 'from-emerald-600/20 to-teal-600/20', textColor: 'text-emerald-400', borderColor: 'border-emerald-500/20', hoverGlow: 'hover:shadow-emerald-500/10' },
];

export default function Home() {
  const { cartCount, setCartOpen, user, setUser, searchQuery, setSearchQuery } = useStore();
  const totalSold = PRODUCTS.reduce((s, p) => s + p.sold, 0);
  const topSelling = [...PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col bg-background noise">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 w-full glass-strong border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="#" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 group-hover:scale-105 transition-all duration-300">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-base tracking-tight">Digi</span><span className="font-extrabold text-base tracking-tight text-gradient">Store</span>
            </div>
          </Link>
          <div className="flex-1 max-w-lg">
            <div className="relative group/search">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 group-focus-within/search:text-primary/60 transition-colors" />
              <Input placeholder="Buscar juegos, streaming, gift cards..." className="pl-10 h-10 text-sm bg-white/[0.03] border-white/[0.06] focus:border-primary/30 focus:bg-white/[0.05] focus:shadow-[0_0_20px_oklch(0.72_0.24_290/0.08)] placeholder:text-muted-foreground/40 rounded-xl transition-all duration-300" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
            <Button variant="outline" size="sm" className="relative gap-2 cursor-pointer glass hover:bg-white/[0.06] hover:border-primary/30 rounded-xl transition-all duration-300 group" onClick={() => setCartOpen(true)}>
              <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Carrito</span>
              {cartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-violet-600/40 animate-[bounce_1s_ease-in-out_infinite]">{cartCount()}</span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        {/* ── HERO ── */}
        <section className="relative overflow-hidden">
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[120px] float" />
            <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[100px] float-delay" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-600/5 rounded-full blur-[80px] float-slow" />
          </div>
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              {/* Left - Text */}
              <div className="flex-1 text-center lg:text-left space-y-7 max-w-2xl">
                <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-primary/20 text-primary text-sm font-medium">
                  <Sparkles className="w-4 h-4" /><span>Entrega instantanea a tu email</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </motion.div>
                <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08]">
                  Tu tienda de{' '}
                  <span className="text-gradient">productos digitales</span>
                  <br className="hidden sm:block" />favoritos
                </motion.h1>
                <motion.p variants={fadeUp} custom={2} className="text-base sm:text-lg text-muted-foreground/80 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Gaming, streaming, software y gift cards al mejor precio. Activacion inmediata, soporte 24/7 y garantia en cada compra.
                </motion.p>
                <motion.div variants={fadeUp} custom={3} className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
                  <Link href="/tienda">
                    <Button size="lg" className="gap-2 cursor-pointer rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-violet-500 text-white border-0 shadow-xl shadow-violet-600/25 hover:shadow-violet-500/40 h-12 px-8 text-sm font-bold transition-all duration-300 hover:scale-[1.02]">
                      Explorar Tienda <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/tienda?sort=price-asc">
                    <Button size="lg" variant="outline" className="gap-2 cursor-pointer rounded-xl glass hover:bg-white/[0.06] hover:border-primary/30 h-12 px-8 text-sm font-medium transition-all duration-300">
                      <Flame className="w-4 h-4 text-amber-400" /> Ofertas
                    </Button>
                  </Link>
                </motion.div>
                {/* Stats */}
                <motion.div variants={fadeUp} custom={4} className="flex flex-wrap justify-center lg:justify-start gap-8 pt-4">
                  {[
                    { value: `${(totalSold / 1000).toFixed(0)}K+`, label: 'Ventas exitosas' },
                    { value: '4.9 ★', label: 'Calificacion promedio' },
                    { value: '24/7', label: 'Soporte en linea' },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <p className="text-xl font-extrabold text-foreground">{stat.value}</p>
                      <p className="text-[11px] text-muted-foreground/60 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </motion.div>
              </div>
              {/* Right - Cards */}
              <div className="flex-1 max-w-md w-full hidden lg:block">
                <HeroShowcase />
              </div>
            </div>
          </div>
        </section>

        {/* ── MARQUEE TRUST BAND ── */}
        <MarqueeBand />

        {/* ── CATEGORY SHORTCUTS ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-primary to-fuchsia-500" />
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Explora por Categoria</h2>
            </div>
            <p className="text-sm text-muted-foreground/60 ml-3">Encuentra exactamente lo que buscas</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categoryData.map((cat, i) => {
              const count = PRODUCTS.filter(p => p.category === cat.id).length;
              return (
                <Link key={cat.id} href={`/tienda?cat=${cat.id}`} className="group">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className={`relative rounded-2xl bg-gradient-to-br ${cat.gradient} border ${cat.borderColor} p-5 hover:border-primary/30 transition-all duration-300 cursor-pointer card-glow ${cat.hoverGlow} overflow-hidden`}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/[0.03] to-transparent rounded-bl-full" />
                    <cat.Icon className={`w-8 h-8 ${cat.textColor} mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`} />
                    <h3 className="text-sm font-bold">{cat.name}</h3>
                    <p className="text-[11px] text-muted-foreground/60 mt-0.5">{count} productos</p>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── TOP SELLING ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-orange-400 to-red-500" />
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Mas Vendidos</h2>
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-sm text-muted-foreground/60 ml-3">Los productos que mas compran nuestros clientes</p>
            </div>
            <Link href="/tienda?sort=popular" className="text-sm text-primary/80 hover:text-primary font-medium flex items-center gap-1 transition-colors group">
              Ver todos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topSelling.slice(0, 4).map((product) => (
              <FeaturedCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ── BEST DEALS ── */}
        <section className="border-t border-white/[0.04] bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-6 rounded-full bg-gradient-to-b from-amber-400 to-red-400" />
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Mejores Ofertas</h2>
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-sm text-muted-foreground/60 ml-3">Descuentos impresionantes en productos seleccionados</p>
              </div>
              <Link href="/tienda?sort=price-asc" className="text-sm text-primary/80 hover:text-primary font-medium flex items-center gap-1 transition-colors group">
                Ver todas <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...PRODUCTS]
                .filter(p => p.originalPrice)
                .sort((a, b) => ((b.originalPrice! - b.price) / b.originalPrice!) - ((a.originalPrice! - a.price) / a.originalPrice!))
                .slice(0, 4)
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </div>
        </section>

        {/* ── NEW PRODUCTS ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-emerald-400 to-cyan-400" />
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Nuevos Productos</h2>
                <Star className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-sm text-muted-foreground/60 ml-3">Los productos mas recientes agregados a la tienda</p>
            </div>
            <Link href="/tienda" className="text-sm text-primary/80 hover:text-primary font-medium flex items-center gap-1 transition-colors group">
              Ver tienda <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRODUCTS.slice(-8).reverse().slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            <Link href="/tienda" className="h-full rounded-2xl glass hover:border-primary/30 hover:bg-white/[0.04] transition-all duration-300 group flex flex-col items-center justify-center min-h-[340px] gap-4 card-glow">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-300">
                <ArrowRight className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-bold text-sm">Ver todos los productos</p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">{PRODUCTS.length} productos disponibles</p>
              </div>
            </Link>
          </div>
        </section>

        {/* ── CTA SECTION ── */}
        <section className="border-t border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="relative rounded-3xl overflow-hidden gradient-border">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-900/95 via-fuchsia-900/90 to-violet-800/95" />
              <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-fuchsia-500/20 rounded-full blur-[100px]" />
              <div className="absolute -bottom-20 -left-20 w-[250px] h-[250px] bg-violet-500/20 rounded-full blur-[80px]" />
              <div className="relative px-8 py-14 sm:px-16 sm:py-20 text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/70 text-xs font-medium">
                    <TrendingUp className="w-3.5 h-3.5" /> Mas de {(totalSold / 1000).toFixed(0)}K clientes confian en nosotros
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                    Precios imposibles de encontrar<br className="hidden sm:block" /> en otro lado
                  </h2>
                  <p className="text-white/60 max-w-xl mx-auto leading-relaxed">Productos digitales con entrega instantanea, soporte real y garantia total en cada compra. No te arriesgues con otras tiendas.</p>
                  <Link href="/tienda">
                    <Button size="lg" className="mt-2 gap-2 cursor-pointer rounded-xl bg-white text-violet-700 hover:bg-white/90 border-0 shadow-2xl shadow-black/20 h-13 px-10 text-sm font-extrabold transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl">
                      Ir a la Tienda <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.04] bg-white/[0.01] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="col-span-2 sm:col-span-1 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-primary/25">
                  <Zap className="w-4.5 h-4.5 text-white" />
                </div>
                <div><span className="font-extrabold text-base tracking-tight">Digi</span><span className="font-extrabold text-base tracking-tight text-gradient">Store</span></div>
              </div>
              <p className="text-xs text-muted-foreground/60 leading-relaxed">Tu tienda de confianza para productos digitales. Gaming, streaming, software y mas con entrega inmediata.</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-foreground">Productos</h4>
              <ul className="space-y-2 text-xs text-muted-foreground/60">{['Gaming', 'Streaming', 'Gift Cards', 'Software', 'Suscripciones'].map((item) => <li key={item} className="hover:text-foreground transition-colors cursor-pointer">{item}</li>)}</ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-foreground">Soporte</h4>
              <ul className="space-y-2 text-xs text-muted-foreground/60">{['Centro de ayuda', 'Chat en vivo', 'Garantias', 'Metodos de pago', 'Preguntas frecuentes'].map((item) => <li key={item} className="hover:text-foreground transition-colors cursor-pointer">{item}</li>)}</ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-foreground">Legal</h4>
              <ul className="space-y-2 text-xs text-muted-foreground/60">{['Terminos de servicio', 'Privacidad', 'Devoluciones', 'Contacto'].map((item) => <li key={item} className="hover:text-foreground transition-colors cursor-pointer">{item}</li>)}</ul>
            </div>
          </div>
          <div className="border-t border-white/[0.04] mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-muted-foreground/50">2025 DigiStore. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground/50">
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
