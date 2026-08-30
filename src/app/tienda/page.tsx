"use client";

import { useStore, PRODUCTS, CATEGORIES, SUBCATEGORIES, Product } from '@/lib/store';
import { ProductCard } from '@/components/store/ProductCard';
import { CartDrawer } from '@/components/store/CartDrawer';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart, Search, Zap, Shield, Sparkles, Truck,
  LogIn, ChevronDown, X, SlidersHorizontal, Star, PackageSearch,
  Gamepad2, Tv, Gift, AppWindow, RefreshCw, Flame,
} from 'lucide-react';
import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Gamepad2, Tv, Gift, AppWindow, RefreshCw,
};

const sortOptions = [
  { value: 'popular', label: 'Mas vendidos' },
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'price-asc', label: 'Menor precio' },
  { value: 'price-desc', label: 'Mayor precio' },
  { value: 'newest', label: 'Mas recientes' },
];

const priceRanges = [
  { label: 'Menos de $5', min: 0, max: 5 },
  { label: '$5 - $10', min: 5, max: 10 },
  { label: '$10 - $20', min: 10, max: 20 },
  { label: '$20 - $50', min: 20, max: 50 },
  { label: 'Mas de $50', min: 50, max: Infinity },
];

const ratingOptions = [4, 3, 2, 1];

/* ── Announcement Bar ── */
function AnnouncementBar() {
  return (
    <div className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 text-white text-xs py-2 px-4 text-center font-medium">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
        <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Entrega instantanea por email</span>
        <span className="hidden sm:inline text-white/30">|</span>
        <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Pago 100% seguro</span>
        <span className="hidden sm:inline text-white/30">|</span>
        <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Usa el codigo <span className="font-bold bg-white/20 px-1.5 py-0.5 rounded">DIGI10</span> para 10% de descuento</span>
      </div>
    </div>
  );
}

/* ── Header ── */
function Header() {
  const { cartCount, setCartOpen, user, setUser, searchQuery, setSearchQuery } = useStore();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-background/95 backdrop-blur-xl">
      {/* Top bar */}
      <div className="border-b border-white/[0.04] hidden md:block">
        <div className="max-w-7xl mx-auto px-6 h-8 flex items-center justify-end gap-5 text-[11px] text-muted-foreground/60">
          <span className="hover:text-foreground cursor-pointer transition-colors">Mi cuenta</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Mis ordenes</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Soporte</span>
        </div>
      </div>
      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight hidden sm:block">Digi<span className="text-gradient">Store</span></span>
        </Link>

        <div className="flex-1 max-w-2xl">
          <div className="relative flex">
            <Input
              placeholder="Buscar productos digitales..."
              className="h-10 text-sm bg-white/[0.04] border-white/[0.08] focus:border-violet-500/40 rounded-l-lg rounded-r-none border-r-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline" className="h-10 px-4 rounded-l-none border-l-0 bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] cursor-pointer">
              <Search className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {user ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-colors" onClick={() => setUser(null)}>
              <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400">{user.name.charAt(0)}</div>
              <span className="text-xs font-medium hidden lg:block">Hola, {user.name}</span>
            </div>
          ) : (
            <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-white/[0.04]" onClick={() => useStore.getState().setAuthOpen(true)}>
              <LogIn className="w-4 h-4" />
              <span className="hidden lg:inline text-xs">Ingresar</span>
            </Button>
          )}
          <Button variant="ghost" size="sm" className="relative gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-white/[0.04]" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline text-xs">Carrito</span>
            {cartCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px]">{cartCount()}</span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}

/* ── Category Navigation Bar ── */
function CategoryNavBar({ selectedCategory, onCategoryChange }: { selectedCategory: string; onCategoryChange: (id: string) => void }) {
  return (
    <div className="border-b border-white/[0.04] bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-1 overflow-x-auto py-2.5 scrollbar-none" aria-label="Categorias">
          <button
            onClick={() => onCategoryChange('all')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
              selectedCategory === 'all'
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-transparent text-muted-foreground border-white/[0.06] hover:border-violet-500/30 hover:text-foreground'
            }`}
          >
            Todo
          </button>
          {CATEGORIES.map(cat => {
            const Icon = iconMap[cat.icon];
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-transparent text-muted-foreground border-white/[0.06] hover:border-violet-500/30 hover:text-foreground'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {cat.name}
              </button>
            );
          })}
          <button
            onClick={() => onCategoryChange('on-sale')}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer border ${
              selectedCategory === 'on-sale'
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-transparent text-amber-400 border-white/[0.06] hover:border-amber-400/30 hover:bg-amber-400/5'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Ofertas
          </button>
        </nav>
      </div>
    </div>
  );
}

/* ── Desktop Sidebar Filters ── */
function FilterSidebar({
  selectedCategory,
  onCategoryChange,
  selectedPriceRange,
  onPriceRangeChange,
  selectedRating,
  onRatingChange,
  onSaleOnly,
  onOnSaleChange,
  selectedSubcategory,
  onSubcategoryChange,
}: {
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
  selectedPriceRange: number | null;
  onPriceRangeChange: (index: number | null) => void;
  selectedRating: number | null;
  onRatingChange: (rating: number | null) => void;
  onSaleOnly: boolean;
  onOnSaleChange: (val: boolean) => void;
  selectedSubcategory: string;
  onSubcategoryChange: (sub: string) => void;
}) {
  const subcategories = selectedCategory !== 'all' && selectedCategory !== 'on-sale' ? SUBCATEGORIES[selectedCategory] || [] : [];

  return (
    <aside className="hidden lg:block w-56 shrink-0">
      <div className="sticky top-[140px] space-y-4">
        {/* Category Filter */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <h3 className="text-xs font-semibold mb-3 text-foreground">Categorias</h3>
          <div className="space-y-0.5">
            <button
              onClick={() => onCategoryChange('all')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-violet-600/10 text-violet-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
              }`}
            >
              <span>Todos</span>
              <span className="text-[10px] text-muted-foreground/60">{PRODUCTS.length}</span>
            </button>
            {CATEGORIES.map(cat => {
              const count = PRODUCTS.filter(p => p.category === cat.id).length;
              const Icon = iconMap[cat.icon];
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(isActive ? 'all' : cat.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-violet-600/10 text-violet-400'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                  <span className="flex-1 text-left truncate">{cat.name}</span>
                  <span className="text-[10px] text-muted-foreground/60">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subcategory Filter (when a category is selected) */}
        {subcategories.length > 0 && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h3 className="text-xs font-semibold mb-3 text-foreground">Subcategoria</h3>
            <div className="space-y-0.5">
              <button
                onClick={() => onSubcategoryChange('all')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  selectedSubcategory === 'all'
                    ? 'bg-violet-600/10 text-violet-400 font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                }`}
              >
                Todos
              </button>
              {subcategories.map(sub => (
                <button
                  key={sub}
                  onClick={() => onSubcategoryChange(sub === selectedSubcategory ? 'all' : sub)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer truncate ${
                    selectedSubcategory === sub
                      ? 'bg-violet-600/10 text-violet-400 font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price Range Filter */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <h3 className="text-xs font-semibold mb-3 text-foreground">Rango de Precio</h3>
          <div className="space-y-0.5">
            <button
              onClick={() => onPriceRangeChange(null)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                selectedPriceRange === null
                  ? 'bg-violet-600/10 text-violet-400 font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
              }`}
            >
              Todos
            </button>
            {priceRanges.map((range, i) => (
              <button
                key={range.label}
                onClick={() => onPriceRangeChange(selectedPriceRange === i ? null : i)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  selectedPriceRange === i
                    ? 'bg-violet-600/10 text-violet-400 font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <h3 className="text-xs font-semibold mb-3 text-foreground">Calificacion</h3>
          <div className="space-y-0.5">
            <button
              onClick={() => onRatingChange(null)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                selectedRating === null
                  ? 'bg-violet-600/10 text-violet-400 font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
              }`}
            >
              Todas
            </button>
            {ratingOptions.map(r => (
              <button
                key={r}
                onClick={() => onRatingChange(selectedRating === r ? null : r)}
                className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  selectedRating === r
                    ? 'bg-violet-600/10 text-violet-400 font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < r ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`}
                    />
                  ))}
                </div>
                <span>&{r === 1 ? 'mas' : ''}</span>
              </button>
            ))}
          </div>
        </div>

        {/* On Sale Toggle */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-semibold text-foreground">Solo en oferta</span>
            <button
              role="switch"
              aria-checked={onSaleOnly}
              onClick={() => onOnSaleChange(!onSaleOnly)}
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer ${
                onSaleOnly ? 'bg-violet-600' : 'bg-white/10'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  onSaleOnly ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </label>
        </div>
      </div>
    </aside>
  );
}

/* ── Mobile Filter Sheet (simplified) ── */
function MobileFilterBar({
  onOpen,
  sortBy,
  onSortChange,
  resultCount,
}: {
  onOpen: () => void;
  sortBy: string;
  onSortChange: (s: string) => void;
  resultCount: number;
}) {
  return (
    <div className="lg:hidden flex items-center justify-between gap-3 border-b border-white/[0.04] bg-white/[0.01] px-4 py-2.5">
      <button
        onClick={onOpen}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-xs font-medium text-muted-foreground hover:text-foreground hover:border-white/[0.12] transition-colors cursor-pointer"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Filtros
      </button>
      <span className="text-xs text-muted-foreground/60">{resultCount} resultados</span>
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="appearance-none bg-white/[0.02] border border-white/[0.06] rounded-lg px-2.5 py-1.5 pr-7 text-xs text-foreground cursor-pointer focus:outline-none focus:border-violet-500/40"
        >
          {sortOptions.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-background text-foreground">{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/50 pointer-events-none" />
      </div>
    </div>
  );
}

/* ── Active Filters Bar ── */
function ActiveFilters({
  selectedCategory,
  onClearCategory,
  selectedSubcategory,
  onClearSubcategory,
  selectedPriceRange,
  onClearPriceRange,
  selectedRating,
  onClearRating,
  onSaleOnly,
  onClearOnSale,
  searchQuery,
  onClearSearch,
  onClearAll,
  hasAnyFilter,
}: {
  selectedCategory: string;
  onClearCategory: () => void;
  selectedSubcategory: string;
  onClearSubcategory: () => void;
  selectedPriceRange: number | null;
  onClearPriceRange: () => void;
  selectedRating: number | null;
  onClearRating: () => void;
  onSaleOnly: boolean;
  onClearOnSale: () => void;
  searchQuery: string;
  onClearSearch: () => void;
  onClearAll: () => void;
  hasAnyFilter: boolean;
}) {
  if (!hasAnyFilter) return null;

  const activeCat = selectedCategory !== 'all' ? CATEGORIES.find(c => c.id === selectedCategory) : null;

  return (
    <div className="flex items-center gap-2 flex-wrap py-3">
      {searchQuery && (
        <Badge variant="secondary" className="gap-1 text-[11px] cursor-pointer hover:bg-secondary/80" onClick={onClearSearch}>
          Busqueda: &quot;{searchQuery}&quot;
          <X className="w-3 h-3" />
        </Badge>
      )}
      {activeCat && (
        <Badge variant="secondary" className="gap-1 text-[11px] cursor-pointer hover:bg-secondary/80" onClick={onClearCategory}>
          {activeCat.name}
          <X className="w-3 h-3" />
        </Badge>
      )}
      {selectedSubcategory !== 'all' && (
        <Badge variant="secondary" className="gap-1 text-[11px] cursor-pointer hover:bg-secondary/80" onClick={onClearSubcategory}>
          {selectedSubcategory}
          <X className="w-3 h-3" />
        </Badge>
      )}
      {selectedPriceRange !== null && (
        <Badge variant="secondary" className="gap-1 text-[11px] cursor-pointer hover:bg-secondary/80" onClick={onClearPriceRange}>
          {priceRanges[selectedPriceRange].label}
          <X className="w-3 h-3" />
        </Badge>
      )}
      {selectedRating !== null && (
        <Badge variant="secondary" className="gap-1 text-[11px] cursor-pointer hover:bg-secondary/80" onClick={onClearRating}>
          {selectedRating}+ estrellas
          <X className="w-3 h-3" />
        </Badge>
      )}
      {onSaleOnly && (
        <Badge variant="secondary" className="gap-1 text-[11px] cursor-pointer hover:bg-secondary/80" onClick={onClearOnSale}>
          En oferta
          <X className="w-3 h-3" />
        </Badge>
      )}
      {hasAnyFilter && (
        <button onClick={onClearAll} className="text-[11px] text-violet-400 hover:text-violet-300 font-medium cursor-pointer transition-colors">
          Limpiar todo
        </button>
      )}
    </div>
  );
}

/* ── Product Grid ── */
function ProductGridSection({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <PackageSearch className="w-16 h-16 text-muted-foreground/20 mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">No se encontraron productos</h3>
        <p className="text-sm text-muted-foreground/60 mt-1">Intenta con otra categoria o termino de busqueda</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="border-t border-white/[0.04] bg-white/[0.01] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-base">Digi<span className="text-gradient">Store</span></span>
            </div>
            <p className="text-xs text-muted-foreground/60 leading-relaxed">Tu tienda de confianza para productos digitales al mejor precio.</p>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Productos</h4>
            <ul className="space-y-2 text-xs text-muted-foreground/60">
              {['Gaming', 'Streaming', 'Gift Cards', 'Software', 'Suscripciones'].map(item => (
                <li key={item} className="hover:text-foreground transition-colors cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Soporte</h4>
            <ul className="space-y-2 text-xs text-muted-foreground/60">
              {['Centro de ayuda', 'Chat en vivo', 'Garantias', 'Metodos de pago'].map(item => (
                <li key={item} className="hover:text-foreground transition-colors cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Legal</h4>
            <ul className="space-y-2 text-xs text-muted-foreground/60">
              {['Terminos de servicio', 'Privacidad', 'Devoluciones', 'Contacto'].map(item => (
                <li key={item} className="hover:text-foreground transition-colors cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.04] mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground/40">2025 DigiStore. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
/* ── Main Content ── */
function TiendaContent() {
  const searchParams = useSearchParams();
  const {
    cartCount, setCartOpen, user, setUser,
    searchQuery, setSearchQuery, sortBy, setSortBy,
    selectedCategory, selectedSubcategory,
    setSelectedCategory, setSelectedSubcategory,
  } = useStore();

  // Local filter state
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync URL params
  useEffect(() => {
    const cat = searchParams.get('cat');
    const sort = searchParams.get('sort');
    if (cat) setSelectedCategory(cat);
    if (sort) setSortBy(sort);
  }, [searchParams, setSelectedCategory, setSortBy]);

  // Handle category change (also from "Ofertas" pill)
  const handleCategoryChange = (id: string) => {
    if (id === 'on-sale') {
      setSelectedCategory('all');
      setOnSaleOnly(true);
    } else {
      setSelectedCategory(id);
      setOnSaleOnly(false);
    }
  };

  // Filter and sort products
  const products = useMemo(() => {
    let filtered = [...PRODUCTS];

    // Category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Subcategory
    if (selectedSubcategory !== 'all') {
      filtered = filtered.filter(p => p.subcategory === selectedSubcategory);
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.platform.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Price range
    if (selectedPriceRange !== null) {
      const range = priceRanges[selectedPriceRange];
      filtered = filtered.filter(p => p.price >= range.min && p.price < range.max);
    }

    // Rating
    if (selectedRating !== null) {
      filtered = filtered.filter(p => p.rating >= selectedRating);
    }

    // On sale
    if (onSaleOnly) {
      filtered = filtered.filter(p => p.originalPrice !== undefined && p.originalPrice > p.price);
    }

    // Sort
    switch (sortBy) {
      case 'popular': filtered.sort((a, b) => b.sold - a.sold); break;
      case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
      case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
      default: break;
    }

    return filtered;
  }, [selectedCategory, selectedSubcategory, searchQuery, sortBy, selectedPriceRange, selectedRating, onSaleOnly]);

  // Active filter checks
  const hasAnyFilter = selectedCategory !== 'all' || selectedSubcategory !== 'all' || searchQuery !== '' || selectedPriceRange !== null || selectedRating !== null || onSaleOnly;

  const clearAll = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSearchQuery('');
    setSelectedPriceRange(null);
    setSelectedRating(null);
    setOnSaleOnly(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AnnouncementBar />
      <Header />
      <CategoryNavBar selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />

      <main className="flex-1">
        {/* Mobile filter bar + sort */}
        <MobileFilterBar
          onOpen={() => setMobileFiltersOpen(true)}
          sortBy={sortBy}
          onSortChange={setSortBy}
          resultCount={products.length}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex gap-6">
            {/* Desktop Sidebar */}
            <FilterSidebar
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              selectedPriceRange={selectedPriceRange}
              onPriceRangeChange={setSelectedPriceRange}
              selectedRating={selectedRating}
              onRatingChange={setSelectedRating}
              onSaleOnly={onSaleOnly}
              onOnSaleChange={setOnSaleOnly}
              selectedSubcategory={selectedSubcategory}
              onSubcategoryChange={setSelectedSubcategory}
            />

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar (desktop) */}
              <div className="hidden lg:flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">
                  {selectedCategory !== 'all'
                    ? `${CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Tienda'} — `
                    : 'Todos los productos — '}
                  <span className="font-medium text-foreground">{products.length} resultados</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Ordenar por:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-1.5 pr-7 text-xs text-foreground cursor-pointer focus:outline-none focus:border-violet-500/40"
                    >
                      {sortOptions.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-background text-foreground">{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/50 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Active filters */}
              <ActiveFilters
                selectedCategory={selectedCategory}
                onClearCategory={() => setSelectedCategory('all')}
                selectedSubcategory={selectedSubcategory}
                onClearSubcategory={() => setSelectedSubcategory('all')}
                selectedPriceRange={selectedPriceRange}
                onClearPriceRange={() => setSelectedPriceRange(null)}
                selectedRating={selectedRating}
                onClearRating={() => setSelectedRating(null)}
                onSaleOnly={onSaleOnly}
                onClearOnSale={() => setOnSaleOnly(false)}
                searchQuery={searchQuery}
                onClearSearch={() => setSearchQuery('')}
                onClearAll={clearAll}
                hasAnyFilter={hasAnyFilter}
              />

              {/* Product grid */}
              <ProductGridSection products={products} />
            </div>
          </div>
        </div>

        {/* Mobile Filters Overlay */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] bg-background border-t border-white/[0.06] rounded-t-2xl overflow-y-auto">
              <div className="sticky top-0 bg-background border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Filtros</h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-1 hover:bg-white/[0.06] rounded-lg cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-6">
                {/* Mobile: Category */}
                <div>
                  <h4 className="text-xs font-semibold mb-2">Categoria</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { handleCategoryChange('all'); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                        selectedCategory === 'all' ? 'bg-violet-600 text-white border-violet-600' : 'border-white/[0.06] text-muted-foreground hover:border-violet-500/30'
                      }`}
                    >
                      Todo
                    </button>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => { handleCategoryChange(cat.id); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          selectedCategory === cat.id ? 'bg-violet-600 text-white border-violet-600' : 'border-white/[0.06] text-muted-foreground hover:border-violet-500/30'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile: Subcategory */}
                {selectedCategory !== 'all' && SUBCATEGORIES[selectedCategory] && (
                  <div>
                    <h4 className="text-xs font-semibold mb-2">Subcategoria</h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedSubcategory('all')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          selectedSubcategory === 'all' ? 'bg-violet-600 text-white border-violet-600' : 'border-white/[0.06] text-muted-foreground hover:border-violet-500/30'
                        }`}
                      >
                        Todos
                      </button>
                      {SUBCATEGORIES[selectedCategory].map(sub => (
                        <button
                          key={sub}
                          onClick={() => setSelectedSubcategory(sub === selectedSubcategory ? 'all' : sub)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                            selectedSubcategory === sub ? 'bg-violet-600 text-white border-violet-600' : 'border-white/[0.06] text-muted-foreground hover:border-violet-500/30'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobile: Price Range */}
                <div>
                  <h4 className="text-xs font-semibold mb-2">Rango de Precio</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedPriceRange(null)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                        selectedPriceRange === null ? 'bg-violet-600 text-white border-violet-600' : 'border-white/[0.06] text-muted-foreground hover:border-violet-500/30'
                      }`}
                    >
                      Todos
                    </button>
                    {priceRanges.map((range, i) => (
                      <button
                        key={range.label}
                        onClick={() => setSelectedPriceRange(selectedPriceRange === i ? null : i)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          selectedPriceRange === i ? 'bg-violet-600 text-white border-violet-600' : 'border-white/[0.06] text-muted-foreground hover:border-violet-500/30'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile: Rating */}
                <div>
                  <h4 className="text-xs font-semibold mb-2">Calificacion</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedRating(null)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                        selectedRating === null ? 'bg-violet-600 text-white border-violet-600' : 'border-white/[0.06] text-muted-foreground hover:border-violet-500/30'
                      }`}
                    >
                      Todas
                    </button>
                    {ratingOptions.map(r => (
                      <button
                        key={r}
                        onClick={() => setSelectedRating(selectedRating === r ? null : r)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          selectedRating === r ? 'bg-violet-600 text-white border-violet-600' : 'border-white/[0.06] text-muted-foreground hover:border-violet-500/30'
                        }`}
                      >
                        {r}+
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile: On Sale Toggle */}
                <div>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-semibold">Solo en oferta</span>
                    <button
                      role="switch"
                      aria-checked={onSaleOnly}
                      onClick={() => setOnSaleOnly(!onSaleOnly)}
                      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer ${
                        onSaleOnly ? 'bg-violet-600' : 'bg-white/10'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                          onSaleOnly ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </label>
                </div>
              </div>

              {/* Mobile Filters Footer */}
              <div className="sticky bottom-0 bg-background border-t border-white/[0.06] px-4 py-3 flex gap-3">
                <Button variant="outline" className="flex-1 cursor-pointer" onClick={clearAll}>
                  Limpiar
                </Button>
                <Button className="flex-1 cursor-pointer bg-violet-600 hover:bg-violet-500" onClick={() => setMobileFiltersOpen(false)}>
                  Ver {products.length} resultados
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <CartDrawer />
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
