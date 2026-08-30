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
  Truck, Tag, MapPin, Menu, ChevronRight, GitCompare, Sun, Moon, Globe,
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
    <div className="bg-zinc-900 text-zinc-100 text-[11px] sm:text-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-1 sm:px-6">
        <div className="flex items-center gap-1.5">
          <Truck className="w-3 h-3 text-amber-400" />
          <span className="hidden sm:inline">Entrega instantanea en pedidos digitales</span>
          <span className="sm:hidden">Entrega instantanea</span>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-400" /> Pago seguro</span>
          <span className="flex items-center gap-1"><Tag className="w-3 h-3 text-amber-400" /> Usa <b className="text-amber-300">DIGI10</b> para 10% off</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-300">
          <span>Envio: <b className="text-white">Global</b></span>
        </div>
      </div>
    </div>
  );
}

/* ── Header — same as homepage ── */
function Header() {
  const { cartCount, setCartOpen, user, setUser, searchQuery, setSearchQuery } = useStore();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-zinc-900 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:gap-4 sm:px-6 sm:py-3">
          <button onClick={() => setMobileMenu(!mobileMenu)} className="inline-flex items-center justify-center size-9 md:hidden rounded-md hover:bg-amber-300/40 transition-colors cursor-pointer">
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex shrink-0 items-center gap-1.5 transition-transform hover:scale-[1.02]">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-zinc-900 text-amber-400 shadow-md">
              <span className="text-lg font-black">D</span>
            </div>
            <div className="hidden sm:block leading-none">
              <div className="text-lg font-black tracking-tight">DigiStore</div>
              <div className="text-[10px] font-medium text-zinc-700">Productos digitales al instante</div>
            </div>
          </Link>
          <div className="hidden lg:flex items-center gap-1 rounded-md px-2 py-1 hover:bg-amber-300/40 cursor-default">
            <MapPin className="w-4 h-4" />
            <div className="leading-tight">
              <div className="text-[10px] text-zinc-700">Entrega a</div>
              <div className="text-xs font-semibold">Todo el mundo</div>
            </div>
          </div>
          <div className="relative flex-1">
            <div className="flex items-stretch overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-amber-200/60 focus-within:ring-2 focus-within:ring-amber-500">
              <input type="text" placeholder="Buscar productos, marcas y categorias..." className="h-10 w-full border-0 bg-transparent px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <Link href={`/tienda?q=${encodeURIComponent(searchQuery)}`}>
                <button className="h-10 bg-amber-400 px-3 hover:bg-amber-500 transition-colors cursor-pointer"><Search className="w-[18px] h-[18px] text-zinc-900" /></button>
              </Link>
            </div>
          </div>
          {user ? (
            <button className="hidden md:flex flex-col items-start rounded-md px-2 py-1 hover:bg-amber-300/40 transition-colors cursor-pointer" onClick={() => setUser(null)}>
              <span className="text-[10px] leading-none">Hola, {user.name}</span>
              <span className="flex items-center gap-0.5 text-xs font-semibold">Cerrar sesion <ChevronDown className="w-3 h-3" /></span>
            </button>
          ) : (
            <button className="hidden md:flex flex-col items-start rounded-md px-2 py-1 hover:bg-amber-300/40 transition-colors cursor-pointer" onClick={() => useStore.getState().setAuthOpen(true)}>
              <span className="text-[10px] leading-none">Hola, Inicia sesion</span>
              <span className="flex items-center gap-0.5 text-xs font-semibold">Cuenta <ChevronDown className="w-3 h-3" /></span>
            </button>
          )}
          <button onClick={toggleDark} className="inline-flex items-center justify-center size-9 rounded-md hover:bg-amber-300/40 transition-colors cursor-pointer">
            <Sun className={`w-[18px] h-[18px] rotate-0 scale-100 transition-all ${darkMode ? '-rotate-90 scale-0' : ''}`} />
            <Moon className={`w-[18px] h-[18px] absolute rotate-90 scale-0 transition-all ${darkMode ? 'rotate-0 scale-100' : ''}`} />
          </button>
          <button className="relative hidden sm:grid h-10 w-10 place-items-center rounded-md hover:bg-amber-300/40 transition-colors cursor-pointer"><GitCompare className="w-5 h-5" /></button>
          <button className="relative hidden sm:grid h-10 w-10 place-items-center rounded-md hover:bg-amber-300/40 transition-colors cursor-pointer"><Heart className="w-5 h-5" /></button>
          <button className="relative flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-amber-300/40 transition-colors cursor-pointer" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="w-[22px] h-[22px]" />
            <span className="hidden text-xs font-semibold sm:block">Carrito</span>
          </button>
        </div>
      </div>
      <div className="border-t border-amber-300/40 bg-amber-500/95">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-3 py-1.5 sm:px-6 scrollbar-none">
          <Link href="/tienda?sort=popular" className="flex shrink-0 items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-zinc-900 hover:bg-amber-300/50 transition-colors"><Sparkles className="w-3 h-3" /> Mas vendido</Link>
          <Link href="/tienda" className={`shrink-0 rounded px-2 py-1 text-xs font-medium text-zinc-900 hover:bg-amber-300/50 transition-colors`}>Todo</Link>
          {CATEGORIES.map(cat => (
            <Link key={cat.id} href={`/tienda?cat=${cat.id}`} className="shrink-0 rounded px-2 py-1 text-xs font-medium text-zinc-900 hover:bg-amber-300/50 transition-colors">{cat.name}</Link>
          ))}
          <Link href="/tienda?onSale=true" className="shrink-0 rounded px-2 py-1 text-xs font-medium text-zinc-900 hover:bg-amber-300/50 transition-colors">Ofertas</Link>
        </div>
      </div>
      {mobileMenu && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border-b border-zinc-200 shadow-lg md:hidden">
          <div className="px-4 py-3 space-y-1">
            <Link href="/tienda" onClick={() => setMobileMenu(false)} className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-100">Todo</Link>
            {CATEGORIES.map(cat => (
              <Link key={cat.id} href={`/tienda?cat=${cat.id}`} onClick={() => setMobileMenu(false)} className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-100">{cat.name}</Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

/* ── Sidebar ── */
function Sidebar({ selectedCategory, onSelectCategory, selectedPriceRange, onSelectPriceRange, selectedRating, onSelectRating, onSaleOnly, onToggleSale }: {
  selectedCategory: string; onSelectCategory: (cat: string) => void;
  selectedPriceRange: number; onSelectPriceRange: (idx: number) => void;
  selectedRating: number; onSelectRating: (r: number) => void;
  onSaleOnly: boolean; onToggleSale: () => void;
}) {
  return (
    <aside className="hidden lg:block w-56 shrink-0 border-r border-border bg-card">
      <div className="sticky top-[104px] max-h-[calc(100vh-104px)] overflow-y-auto p-4 space-y-6">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3">Categoria</h3>
          <div className="space-y-1">
            <button onClick={() => onSelectCategory('all')} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${selectedCategory === 'all' ? 'bg-amber-100 text-amber-700 font-semibold' : 'text-muted-foreground hover:bg-muted'}`}>
              <span className="flex items-center gap-2"><SlidersHorizontal className="w-3.5 h-3.5" /> Todos</span>
              <span className="text-[10px]">{PRODUCTS.length}</span>
            </button>
            {CATEGORIES.map(cat => {
              const IconComp = iconMap[cat.icon];
              const count = PRODUCTS.filter(p => p.category === cat.id).length;
              return (
                <button key={cat.id} onClick={() => onSelectCategory(cat.id)} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${selectedCategory === cat.id ? 'bg-amber-100 text-amber-700 font-semibold' : 'text-muted-foreground hover:bg-muted'}`}>
                  <span className="flex items-center gap-2">{IconComp && <IconComp className="w-3.5 h-3.5" />}{cat.name}</span>
                  <span className="text-[10px]">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3">Rango de Precio</h3>
          <div className="space-y-1">
            {priceRanges.map((range, idx) => (
              <button key={idx} onClick={() => onSelectPriceRange(idx)} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${selectedPriceRange === idx ? 'bg-amber-100 text-amber-700 font-semibold' : 'text-muted-foreground hover:bg-muted'}`}>{range.label}</button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3">Calificacion</h3>
          <div className="space-y-1">
            {ratingOptions.map(r => (
              <button key={r} onClick={() => onSelectRating(r)} className={`w-full flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${selectedRating === r ? 'bg-amber-100 text-amber-700 font-semibold' : 'text-muted-foreground hover:bg-muted'}`}>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < r ? 'text-amber-400 fill-amber-400' : 'text-zinc-200'}`} />
                  ))}
                </div>
                <span>& {r === 4 ? 'mas' : `+`}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <button onClick={onToggleSale} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition-colors border ${onSaleOnly ? 'bg-red-50 border-red-200 text-red-600' : 'border-border text-muted-foreground hover:bg-muted'}`}>
            <span className="flex items-center gap-2"><Flame className="w-3.5 h-3.5" /> En oferta</span>
            <div className={`w-8 h-4.5 rounded-full relative transition-colors ${onSaleOnly ? 'bg-red-500' : 'bg-zinc-200'}`}>
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
    <footer className="bg-zinc-900 text-white">
      <div className="mx-auto max-w-7xl px-3 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-500 text-zinc-900 shadow-md"><span className="text-lg font-black">D</span></div>
              <div className="leading-none">
                <div className="text-lg font-black tracking-tight">DigiStore</div>
                <div className="text-[10px] font-medium text-zinc-400">Productos digitales al instante</div>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">Tu tienda de confianza para productos digitales al mejor precio con entrega instantanea a todo el mundo.</p>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Productos</h4>
            <ul className="space-y-2 text-xs text-zinc-400">{CATEGORIES.map(cat => (<li key={cat.id}><Link href={`/tienda?cat=${cat.id}`} className="hover:text-white transition-colors">{cat.name}</Link></li>))}</ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Soporte</h4>
            <ul className="space-y-2 text-xs text-zinc-400">{['Centro de ayuda', 'Chat en vivo', 'Garantias', 'Metodos de pago'].map(item => (<li key={item} className="hover:text-white transition-colors cursor-pointer">{item}</li>))}</ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Legal</h4>
            <ul className="space-y-2 text-xs text-zinc-400">{['Terminos de servicio', 'Privacidad', 'Devoluciones', 'Contacto'].map(item => (<li key={item} className="hover:text-white transition-colors cursor-pointer">{item}</li>))}</ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-zinc-500">2025 DigiStore. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Pagos seguros</span>
            <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Envio global</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── Shop Content ── */
function ShopContent() {
  const searchParams = useSearchParams();
  const { searchQuery, sortBy, setSortBy } = useStore();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('cat') || 'all');
  const [selectedPriceRange, setSelectedPriceRange] = useState(-1);
  const [selectedRating, setSelectedRating] = useState(0);
  const [onSaleOnly, setOnSaleOnly] = useState(searchParams.get('onSale') === 'true');
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...PRODUCTS];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.platform.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)));
    }
    if (selectedCategory !== 'all') result = result.filter(p => p.category === selectedCategory);
    if (selectedPriceRange >= 0) { const range = priceRanges[selectedPriceRange]; result = result.filter(p => p.price >= range.min && p.price < range.max); }
    if (selectedRating > 0) result = result.filter(p => p.rating >= selectedRating);
    if (onSaleOnly) result = result.filter(p => p.originalPrice && p.originalPrice > p.price);
    switch (sortBy) {
      case 'popular': result.sort((a, b) => b.sold - a.sold); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
    }
    return result;
  }, [searchQuery, selectedCategory, selectedPriceRange, selectedRating, onSaleOnly, sortBy]);

  const currentSortLabel = sortOptions.find(s => s.value === sortBy)?.label || 'Mas vendidos';

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-amber-50/40 via-background to-background">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <div className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Tienda</span>
            {selectedCategory !== 'all' && <><span>/</span><span className="text-foreground font-medium">{CATEGORIES.find(c => c.id === selectedCategory)?.name}</span></>}
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 flex gap-6">
          <Sidebar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} selectedPriceRange={selectedPriceRange} onSelectPriceRange={setSelectedPriceRange} selectedRating={selectedRating} onSelectRating={setSelectedRating} onSaleOnly={onSaleOnly} onToggleSale={() => setOnSaleOnly(!onSaleOnly)} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{filtered.length}</span> productos encontrados</p>
              <div className="relative">
                <button onClick={() => setSortOpen(!sortOpen)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-xs font-medium hover:border-amber-300 transition-colors cursor-pointer">
                  {currentSortLabel} <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-lg shadow-lg z-20 py-1">
                    {sortOptions.map(opt => (
                      <button key={opt.value} onClick={() => { setSortBy(opt.value); setSortOpen(false); }} className={`w-full text-left px-3 py-2 text-xs cursor-pointer transition-colors ${sortBy === opt.value ? 'bg-amber-100 text-amber-700 font-semibold' : 'text-muted-foreground hover:bg-muted'}`}>{opt.label}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">{filtered.map(product => (<ProductCard key={product.id} product={product} />))}</div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <SlidersHorizontal className="w-12 h-12 text-zinc-200 mb-4" />
                <p className="text-sm font-semibold">No se encontraron productos</p>
                <p className="text-xs text-muted-foreground mt-1">Intenta ajustar los filtros o buscar otro termino.</p>
                <button onClick={() => { setSelectedCategory('all'); setSelectedPriceRange(-1); setSelectedRating(0); setOnSaleOnly(false); }} className="mt-4 text-xs text-amber-600 hover:text-amber-700 font-medium cursor-pointer">Limpiar filtros</button>
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

export default function TiendaPage() {
  return <Suspense><ShopContent /></Suspense>;
}
