"use client";

import { useStore, CATEGORIES, PRODUCTS } from '@/lib/store';
import { CategoryBar } from '@/components/store/CategoryBar';
import { ProductGrid } from '@/components/store/ProductGrid';
import { CartDrawer } from '@/components/store/CartDrawer';
import { MarketAnalysis } from '@/components/store/MarketAnalysis';
import { FeaturedCard } from '@/components/store/FeaturedCard';
import { ProductDetail } from '@/components/store/ProductDetail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AuthDialog } from '@/components/auth/AuthDialog';
import {
  ShoppingCart,
  Search,
  Zap,
  Shield,
  Globe,
  Clock,
  ArrowDown,
  Star,
  BarChart3,
  TrendingUp,
  LogIn,
  LogOut,
  User,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const { cartCount, setCartOpen, authOpen, setAuthOpen, user, setUser, searchQuery, setSearchQuery, sortBy, setSortBy } = useStore();
  const totalItems = PRODUCTS.length;
  const totalSold = PRODUCTS.reduce((s, p) => s + p.sold, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:block">DigiStore</span>
          </a>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos, plataformas..."
                className="pl-9 h-9 text-sm bg-muted/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => document.getElementById('mercado')?.scrollIntoView({ behavior: 'smooth' })} className="hidden sm:flex">
              <BarChart3 className="w-4 h-4" />
            </Button>
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-medium leading-none">{user.name}</span>
                  <span className="text-[10px] text-muted-foreground leading-none mt-0.5">{user.email}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setUser(null)} className="h-9 w-9 cursor-pointer">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer" onClick={() => setAuthOpen(true)}>
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Ingresar</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="relative gap-2 cursor-pointer"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Carrito</span>
              {cartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount()}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(var(--primary),0.08),transparent_50%)]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6 max-w-3xl mx-auto"
            >
              <Badge variant="secondary" className="gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Envío a todo el mundo · Entrega instantánea
              </Badge>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                Tu Tienda de{' '}
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Productos Digitales
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Gaming, streaming, software, gift cards y más. Los mejores precios con entrega inmediata a tu email.
                <br className="hidden sm:block" />
                Precios de reventa con alta rentabilidad basados en análisis de mercado real.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Button size="lg" className="gap-2 cursor-pointer" onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}>
                  <Zap className="w-4 h-4" /> Ver Productos
                </Button>
                <Button size="lg" variant="outline" className="gap-2 cursor-pointer" onClick={() => document.getElementById('mercado')?.scrollIntoView({ behavior: 'smooth' })}>
                  <TrendingUp className="w-4 h-4" /> Análisis de Mercado
                </Button>
              </div>
              <div className="flex flex-wrap justify-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-500" /> Pago seguro</div>
                <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-500" /> Entrega instantánea</div>
                <div className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-purple-500" /> Global</div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-border/40 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-bold">{totalItems}</p>
                <p className="text-xs text-muted-foreground">Productos disponibles</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold">{CATEGORIES.length}</p>
                <p className="text-xs text-muted-foreground">Categorías</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold">{(totalSold / 1000).toFixed(0)}K+</p>
                <p className="text-xs text-muted-foreground">Ventas totales</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold">4.7★</p>
                <p className="text-xs text-muted-foreground">Calificación promedio</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Productos Destacados
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Los más vendidos y con mejor precio del mercado</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {PRODUCTS.filter(p => p.featured).slice(0, 4).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <FeaturedCard product={product} />
              </motion.div>
            ))}
          </div>
        </section>

        <section id="productos" className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 sm:pb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Todos los Productos</h2>
              <p className="text-sm text-muted-foreground mt-1">Explora nuestro catálogo completo</p>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Más populares</SelectItem>
                <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
                <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
                <SelectItem value="rating">Mejor valorados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <CategoryBar />
            <ProductGrid />
          </div>
        </section>

        <section className="bg-muted/30 border-y border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <MarketAnalysis />
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 sm:p-12 text-center text-primary-foreground space-y-4"
          >
            <h2 className="text-2xl sm:text-3xl font-bold">¿Listo para empezar a vender?</h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto">
              Los productos digitales tienen márgenes de hasta 95%. Empieza hoy con nuestra guía de análisis de mercado y descubre las mejores oportunidades.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="cursor-pointer"
              onClick={() => document.getElementById('mercado')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver Análisis Completo <ArrowDown className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-border/40 bg-muted/20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="font-bold">DigiStore</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tu tienda de productos digitales de confianza. Gaming, streaming, software y más con entrega instantánea a todo el mundo.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Categorías</h4>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <Badge key={c.id} variant="secondary" className="text-xs">{c.name}</Badge>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Información</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>Entrega instantánea por email</li>
                <li>Pago seguro encriptado</li>
                <li>Garantía de reembolso 30 días</li>
                <li>Soporte 24/7 por chat</li>
                <li>Disponible en todos los países</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 mt-6 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-xs text-muted-foreground">© 2025 DigiStore. Todos los derechos reservados.</p>
            <p className="text-xs text-muted-foreground">Productos digitales con análisis de mercado actualizado</p>
          </div>
        </div>
      </footer>

      <CartDrawer />
      <ProductDetail />
      <AuthDialog />
    </div>
  );
}

