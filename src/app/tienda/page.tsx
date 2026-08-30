"use client";

import { useStore, PRODUCTS, CATEGORIES, Product } from '@/lib/store';
import { ProductCard } from '@/components/store/ProductCard';
import { CartDrawer } from '@/components/store/CartDrawer';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ShoppingCart, Search, Zap, Shield, Sparkles, LogIn, LogOut,
  ArrowRight, CreditCard, Flame, Heart, Star,
  ChevronDown, SlidersHorizontal, Gamepad2, Tv, Gift, AppWindow, RefreshCw,
} from 'lucide-react';
import { useState, useMemo, Suspense } from 'react';
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
    <div className="bg-[#111827] text-white text-xs py-2.5 px-4 text-center font-medium">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
        <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-teal-400" /> Entrega instantanea</span>
        <span className="text-white/30">|</span>
        <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-teal-400" /> Pago seguro</span>
        <span className="text-white/30">|</span>
        <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-teal-400" /> Codigo <span className="font-bold bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded">DIGI10</span> para 10% off</span>
      </div>
    </div>
  );
}

/* ── Header ── */
function Header() {
  const { cartCount, setCartOpen, user, setUser, searchQuery, setSearchQuery } = useStore();
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#e2e8f0] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-lg bg-[#0d9488] flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-shadow">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight hidden sm:block text-[#111]">
            Digi<span className="text-[#0d9488]">Store</span>
          </span>
        </Link>
        <div className="flex-1 max-w-2xl">
          <div className="relative flex">
            <select className="hidden sm:block h-10 text-xs bg-[#f1f5f9] border border-r-0 border-[#e2e8f0] rounded-l-lg px-2 text-[#64748b] focus:outline-none appearance-none cursor-pointer">
              <option>Todos</option>
              <option>Gaming</option>
              <option>Streaming</option>
              <option>Gift Cards</option>
              <option>Software</option>
              <option>Suscripciones</option>
            </select>
            <Input
              placeholder="Buscar productos digitales..."
              className="h-10 text-sm bg-white border-[#e2e8f0] focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488]/20 sm:rounded-l-none border-r-0 text-[#111] placeholder:text-[#94a3b8]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button className="h-10 px-5 rounded-l-none bg-amber-500 hover:bg-amber-600 border-0 cursor-pointer rounded-r-lg">
              <Search className="w-4 h-4 text-white" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-3">
          {user ? (
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#f1f5f9] cursor-pointer transition-colors"
              onClick={() => setUser(null)}
            >
              <div className="w-7 h-7 rounded-full bg-[#0d9488]/10 flex items-center justify-center text-xs font-bold text-[#0d9488]">
                {user.name.charAt(0)}
              </div>
              <span className="text-xs font-medium hidden lg:block text-[#111]">Hola, {user.name}</span>
            </button>
          ) : (
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[#f1f5f9] cursor-pointer transition-colors"
              onClick={() => useStore.getState().setAuthOpen(true)}
            >
              <LogIn className="w-4 h-4 text-[#64748b]" />
              <span className="hidden lg:inline text-xs font-medium text-[#64748b]">Ingresar</span>
            </button>
          )}
          <button className="relative p-2 rounded-lg hover:bg-[#f1f5f9] cursor-pointer transition-colors">
            <Heart className="w-5 h-5 text-[#64748b]" />
          </button>
          <button
            className="relative p-2 rounded-lg hover:bg-[#f1f5f9] cursor-pointer transition-colors"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="w-5 h-5 text-[#64748b]" />
            {cartCount() > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#0d9488] text-white text-[9px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                {cartCount()}
              </span>
            )}
          </button>
        </div>
      </div>
      <div className="border-t border-[#e2e8f0] bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center gap-1 overflow-x-auto">
          <Link
            href="/tienda"
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#111] hover:bg-white hover:shadow-sm transition-all whitespace-nowrap"
          >
            Todo
          </Link>
          {CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              href={`/tienda?cat=${cat.id}`}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-[#64748b] hover:bg-white hover:shadow-sm hover:text-[#111] transition-all whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href="/tienda?sort=price-asc"
            className="px-3 py-1.5 rounded-full text-xs font-bold text-orange-600 hover:bg-orange-50 transition-all whitespace-nowrap flex items-center gap-1"
          >
            <Flame className="w-3 h-3" /> Ofertas
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ── Sidebar ── */
function Sidebar({
  selectedCategory,
  onSelectCategory,
  selectedPriceRange,
  onSelectPriceRange,
  selectedRating,
  onSelectRating,
  onSaleOnly,
  onToggleSale,
}: {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedPriceRange: number;
  onSelectPriceRange: (idx: number) => void;
  selectedRating: number;
  onSelectRating: (r: number) => void;
  onSaleOnly: boolean;
  onToggleSale: () => void;
}) {
  return (
    <aside className="hidden lg:block w-56 shrink-0 border-r border-[#e2e8f0] bg-white">
      <div className="sticky top-[104px] max-h-[calc(100vh-104px)] overflow-y-auto p-4 space-y-6">
        {/* Category */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#111] mb-3">Categoria</h3>
          <div className="space-y-1">
            <button
              onClick={() => onSelectCategory('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${selectedCategory === 'all' ? 'bg-[#0d9488]/10 text-[#0d9488]' : 'text-[#64748b] hover:bg-[#f1f5f9]'}`}
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Todos
              </span>
              <span className="text-[10px]">{PRODUCTS.length}</span>
            </button>
            {CATEGORIES.map(cat => {
              const IconComp = iconMap[cat.icon];
              const count = PRODUCTS.filter(p => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${selectedCategory === cat.id ? 'bg-[#0d9488]/10 text-[#0d9488]' : 'text-[#64748b] hover:bg-[#f1f5f9]'}`}
                >
                  <span className="flex items-center gap-2">
                    {IconComp && <IconComp className="w-3.5 h-3.5" />}
                    {cat.name}
                  </span>
                  <span className="text-[10px]">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#111] mb-3">Rango de Precio</h3>
          <div className="space-y-1">
            {priceRanges.map((range, idx) => (
              <button
                key={idx}
                onClick={() => onSelectPriceRange(idx)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${selectedPriceRange === idx ? 'bg-[#0d9488]/10 text-[#0d9488]' : 'text-[#64748b] hover:bg-[#f1f5f9]'}`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#111] mb-3">Calificacion</h3>
          <div className="space-y-1">
            {ratingOptions.map(r => (
              <button
                key={r}
                onClick={() => onSelectRating(r)}
                className={`w-full flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${selectedRating === r ? 'bg-[#0d9488]/10 text-[#0d9488]' : 'text-[#64748b] hover:bg-[#f1f5f9]'}`}
              >
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < r ? 'text-amber-400 fill-amber-400' : 'text-[#e2e8f0]'}`} />
                  ))}
                </div>
                <span>& {r === 4 ? 'mas' : `+`}</span>
              </button>
            ))}
          </div>
        </div>

        {/* On Sale Toggle */}
        <div>
          <button
            onClick={onToggleSale}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition-colors border ${onSaleOnly ? 'bg-red-50 border-red-200 text-red-600' : 'border-[#e2e8f0] text-[#64748b] hover:bg-[#f1f5f9]'}`}
          >
            <span className="flex items-center gap-2">
              <Flame className="w-3.5 h-3.5" />
              En oferta
            </span>
            <div className={`w-8 h-4.5 rounded-full relative transition-colors ${onSaleOnly ? 'bg-red-500' : 'bg-[#e2e8f0]'}`}>
              <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${onSaleOnly ? 'left-[17px]' : 'left-0.5'}`} />
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="bg-[#111827] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#0d9488] flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-base">
                Digi<span className="text-[#2dd4bf]">Store</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Tu tienda de confianza para productos digitales al mejor precio con entrega instantanea.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-white">Productos</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {['Gaming', 'Streaming', 'Gift Cards', 'Software', 'Suscripciones'].map(item => (
                <li key={item} className="hover:text-white transition-colors cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-white">Soporte</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {['Centro de ayuda', 'Chat en vivo', 'Garantias', 'Metodos de pago'].map(item => (
                <li key={item} className="hover:text-white transition-colors cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-white">Legal</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {['Terminos de servicio', 'Privacidad', 'Devoluciones', 'Contacto'].map(item => (
                <li key={item} className="hover:text-white transition-colors cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500">2025 DigiStore. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Pagos seguros
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Envio global
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── Shop Content (needs searchParams) ── */
function ShopContent() {
  const searchParams = useSearchParams();
  const { searchQuery, sortBy, setSortBy } = useStore();

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('cat') || 'all');
  const [selectedPriceRange, setSelectedPriceRange] = useState(-1);
  const [selectedRating, setSelectedRating] = useState(0);
  const [onSaleOnly, setOnSaleOnly] = useState(searchParams.get('sort') === 'price-asc');
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...PRODUCTS];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.platform.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (selectedPriceRange >= 0) {
      const range = priceRanges[selectedPriceRange];
      result = result.filter(p => p.price >= range.min && p.price < range.max);
    }

    if (selectedRating > 0) {
      result = result.filter(p => p.rating >= selectedRating);
    }

    if (onSaleOnly) {
      result = result.filter(p => p.originalPrice && p.originalPrice > p.price);
    }

    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.sold - a.sold);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, selectedPriceRange, selectedRating, onSaleOnly, sortBy]);

  const currentSortLabel = sortOptions.find(s => s.value === sortBy)?.label || 'Mas vendidos';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-[#e2e8f0] bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-[#64748b]">
            <Link href="/" className="hover:text-[#111] transition-colors">Home</Link>
            <span className="text-[#e2e8f0]">/</span>
            <span className="text-[#111] font-medium">Tienda</span>
          </div>
        </div>

        {/* Content: Sidebar + Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
          {/* Sidebar */}
          <Sidebar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedPriceRange={selectedPriceRange}
            onSelectPriceRange={setSelectedPriceRange}
            selectedRating={selectedRating}
            onSelectRating={setSelectedRating}
            onSaleOnly={onSaleOnly}
            onToggleSale={() => setOnSaleOnly(!onSaleOnly)}
          />

          {/* Product Grid Area */}
          <div className="flex-1 min-w-0">
            {/* Sort + Count Bar */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-[#64748b]">
                <span className="font-semibold text-[#111]">{filtered.length}</span> productos encontrados
              </p>
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#e2e8f0] bg-white text-xs font-medium text-[#111] hover:border-[#0d9488] transition-colors cursor-pointer"
                >
                  {currentSortLabel}
                  <ChevronDown className={`w-3.5 h-3.5 text-[#64748b] transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#e2e8f0] rounded-lg shadow-lg z-20 py-1">
                    {sortOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-xs cursor-pointer transition-colors ${sortBy === opt.value ? 'bg-[#0d9488]/10 text-[#0d9488] font-semibold' : 'text-[#64748b] hover:bg-[#f1f5f9]'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <SlidersHorizontal className="w-12 h-12 text-[#e2e8f0] mb-4" />
                <p className="text-sm font-semibold text-[#111]">No se encontraron productos</p>
                <p className="text-xs text-[#64748b] mt-1">Intenta ajustar los filtros o buscar otro termino.</p>
                <button
                  onClick={() => { setSelectedCategory('all'); setSelectedPriceRange(-1); setSelectedRating(0); setOnSaleOnly(false); }}
                  className="mt-4 text-xs text-[#0d9488] hover:text-[#0f766e] font-medium cursor-pointer transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
      <AuthDialog />
    </div>
  );
}

/* ── Main Page with Suspense ── */
export default function TiendaPage() {
  return (
    <Suspense>
      <ShopContent />
    </Suspense>
  );
}
