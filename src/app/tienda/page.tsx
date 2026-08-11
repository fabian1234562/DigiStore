"use client";

import { useStore, PRODUCTS, CATEGORIES, SUBCATEGORIES } from '@/lib/store';
import { CategoryBar } from '@/components/store/CategoryBar';
import { ProductGrid } from '@/components/store/ProductGrid';
import { CartDrawer } from '@/components/store/CartDrawer';
import { ProductDetail } from '@/components/store/ProductDetail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthDialog } from '@/components/auth/AuthDialog';
import {
  ShoppingCart, Search, Zap, ArrowLeft, SlidersHorizontal, ChevronDown,
  Gamepad2, Tv, UserCircle, Gift, AppWindow, RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Gamepad2, Tv, UserCircle, Gift, AppWindow, RefreshCw,
};

const sortOptions = [
  { value: 'popular', label: 'Mas vendidos' },
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'price-asc', label: 'Menor precio' },
  { value: 'price-desc', label: 'Mayor precio' },
];

function TiendaContent() {
  const searchParams = useSearchParams();
  const {
    cartCount, setCartOpen, user, setUser,
    searchQuery, setSearchQuery, sortBy, setSortBy,
    selectedCategory, selectedSubcategory, setSelectedCategory, setSelectedSubcategory,
  } = useStore();
  const [showFilters, setShowFilters] = useState(false);

  // Handle URL params for initial category/sort
  useEffect(() => {
    const cat = searchParams.get('cat');
    const sort = searchParams.get('sort');
    if (cat) setSelectedCategory(cat);
    if (sort) setSortBy(sort);
  }, [searchParams, setSelectedCategory, setSortBy]);

  const activeCategory = CATEGORIES.find(c => c.id === selectedCategory);
  const totalProducts = PRODUCTS.length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-background/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Inicio</span>
            </Link>
            <div className="w-px h-6 bg-white/[0.06]" />
            <Link href="#" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center shadow-lg shadow-primary/25">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-sm tracking-tight">Digi</span><span className="font-bold text-sm tracking-tight text-primary">Store</span>
              </div>
            </Link>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <Input
                placeholder="Buscar productos..."
                className="pl-10 h-9 text-sm bg-white/[0.04] border-white/[0.06] focus:border-primary/40 focus:bg-white/[0.06] placeholder:text-muted-foreground/50 rounded-xl transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
                  <span className="text-xs text-muted-foreground">Salir</span>
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost" size="sm"
                className="gap-1.5 cursor-pointer hover:bg-white/[0.06] text-muted-foreground"
                onClick={() => useStore.getState().setAuthOpen(true)}
              >
                <span className="text-xs">Ingresar</span>
              </Button>
            )}
            <Button
              variant="outline" size="sm"
              className="relative gap-2 cursor-pointer bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] hover:border-primary/30 rounded-xl"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Carrito</span>
              {cartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                  {cartCount()}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* PAGE BANNER */}
      <div className="relative overflow-hidden border-b border-white/[0.04]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.12),transparent)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Tienda{' '}
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Completa</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {totalProducts} productos digitales disponibles con entrega inmediata
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline" size="sm"
                className={`gap-2 cursor-pointer rounded-xl text-xs ${showFilters ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white/[0.04] border-white/[0.08]'}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filtros
              </Button>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] rounded-xl px-3 py-2 pr-8 text-xs text-foreground cursor-pointer focus:outline-none focus:border-primary/30 transition-all"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-[#1a1520] text-foreground">{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Category pills */}
          <div className="mt-5">
            <CategoryBar />
          </div>

          {/* Active filter info */}
          <AnimatePresence>
            {selectedCategory !== 'all' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Filtrando por:</span>
                  {activeCategory && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                      {(() => { const Icon = iconMap[activeCategory.icon]; return Icon ? <Icon className="w-3 h-3" /> : null; })()}
                      {activeCategory.name}
                    </span>
                  )}
                  {selectedSubcategory !== 'all' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/[0.08] text-foreground text-xs font-medium border border-white/[0.1]">
                      {selectedSubcategory}
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
                      &quot;{searchQuery}&quot;
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* SIDEBAR + GRID LAYOUT */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex gap-6">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-24 space-y-4">
                {/* Category Stats */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categorias</h3>
                  <div className="space-y-1">
                    {CATEGORIES.map(cat => {
                      const count = PRODUCTS.filter(p => p.category === cat.id).length;
                      const Icon = iconMap[cat.icon];
                      const isActive = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => useStore.getState().setSelectedCategory(isActive ? 'all' : cat.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                            isActive
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-transparent'
                          }`}
                        >
                          {Icon && <Icon className="w-3.5 h-3.5" />}
                          <span className="flex-1 text-left">{cat.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${isActive ? 'bg-primary/20' : 'bg-white/[0.06]'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Trending Tags */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tendencias</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {['Mas vendidos', 'Ofertas', 'Gaming', 'Streaming', 'Skins'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag.toLowerCase())}
                        className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-muted-foreground hover:text-foreground hover:bg-white/[0.06] hover:border-white/[0.1] transition-all cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Ranges */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rango de Precio</h3>
                  <div className="space-y-1.5">
                    {[{ label: 'Menos de $5', max: 5 }, { label: '$5 - $15', min: 5, max: 15 }, { label: '$15 - $30', min: 15, max: 30 }, { label: 'Mas de $30', min: 30 }].map(range => (
                      <button
                        key={range.label}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all cursor-pointer"
                        onClick={() => {
                          if (range.min) {
                            setSortBy('price-asc');
                          }
                        }}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Product Area */}
            <div className="flex-1 min-w-0">
              <ProductGrid />
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.04] bg-white/[0.01] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm">DigiStore</span>
            </div>
            <p className="text-xs text-muted-foreground">
              2025 DigiStore. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      <CartDrawer />
      <ProductDetail />
      <AuthDialog />
    </div>
  );
}

export default function TiendaPage() {
  return (
    <Suspense>
      <TiendaContent />
    </Suspense>
  );
}
