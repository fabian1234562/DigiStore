'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Search, X, Loader2, ExternalLink, BookOpen, ArrowLeft, ArrowRight,
  Flame, Star, Sparkles, Clock, Heart, Download, Shield,
} from 'lucide-react';

const SharedHeader = dynamic(() => import('@/components/store/SharedHeader').then(m => ({ default: m.SharedHeader })), { ssr: false });
const ProductDetailModal = dynamic(() => import('@/components/store/ProductDetailModal').then(m => ({ default: m.ProductDetailModal })), { ssr: false });

interface ScannedGame {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  originalPrice: number;
  sellPrice: number;
  claimUrl?: string;
  claimInstructions?: string;
  platform: string[];
  tags: string[];
  genre: string[];
  rating: number;
  source: string;
  status: string;
}

interface ProductForDetail {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory: string;
  image: string;
  rating: number;
  reviews: number;
  sold: number;
  deliveryTime: string;
  platform: string;
  region: string;
  tags: string[];
  stock: number;
  featured: boolean;
}

/* ══════════════════════════════════════════════════════════════
   BOOK CARD — card premium para libros clasicos
   ══════════════════════════════════════════════════════════════ */
function BookCard({ book, onView }: { book: ScannedGame; onView: (b: ScannedGame) => void }) {
  // Extraer autor y año de la descripcion o titulo
  const titleMatch = book.title.match(/(.+?)\s*\((\d{4})\)$/);
  const cleanTitle = titleMatch ? titleMatch[1] : book.title;
  const year = titleMatch ? titleMatch[2] : '';
  const authorMatch = book.description.match(/Autor:\s*([^\.]+)/);
  const author = authorMatch ? authorMatch[1].trim() : 'Autor clásico';
  const langMatch = book.description.match(/Idioma:\s*(\w+)/);
  const lang = langMatch ? langMatch[1] : 'es';

  return (
    <div
      onClick={() => onView(book)}
      className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-premium-lg hover:-translate-y-1 border border-amber-100 hover:border-amber-200"
    >
      <div className="relative aspect-[3/4] bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 overflow-hidden">
        {/* Portada estilizada */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <BookOpen className="w-12 h-12 text-amber-700 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-serif font-bold text-base text-amber-900 line-clamp-3 leading-tight mb-1">
            {cleanTitle}
          </h3>
          {year && <span className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">({year})</span>}
          <div className="mt-2 h-px w-12 bg-amber-400/40" />
          <p className="text-[10px] text-amber-800/80 mt-2 line-clamp-1 italic">{author}</p>
        </div>
        {/* Pattern decorativo */}
        <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,amber-900_8px,amber-900_9px)]" />
        {/* Badge 100% LEGAL */}
        <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-lg uppercase">
          Legal
        </span>
        {/* Badge idioma */}
        <span className="absolute top-2 right-2 bg-amber-700 text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-lg uppercase">
          {lang}
        </span>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider truncate">Clásico</span>
          {book.rating >= 4 && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-bold">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {book.rating}
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">
          {book.description.split('. Autor:')[0]}
        </p>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-50">
          <span className="text-xs font-black text-emerald-600">GRATIS</span>
          <span className="text-[10px] text-amber-700 flex items-center gap-1 font-semibold">
            <Download className="w-3 h-3" /> Leer
          </span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   BOOK DETAIL MODAL
   ══════════════════════════════════════════════════════════════ */
function BookDetailModal({ book, onClose }: { book: ScannedGame | null; onClose: () => void }) {
  if (!book) return null;
  const titleMatch = book.title.match(/(.+?)\s*\((\d{4})\)$/);
  const cleanTitle = titleMatch ? titleMatch[1] : book.title;
  const year = titleMatch ? titleMatch[2] : '';
  const author = book.description.match(/Autor:\s*([^\.]+)/)?.[1]?.trim() || 'Autor clásico';
  const lang = book.description.match(/Idioma:\s*(\w+)/)?.[1] || 'es';
  const descOnly = book.description.split('. Autor:')[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-amber-200 shadow-premium-lg my-8" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
        </button>

        {/* Header con portada */}
        <div className="relative bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 p-6 rounded-t-2xl">
          <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,amber-900_8px,amber-900_9px)] rounded-t-2xl" />
          <div className="relative flex gap-4">
            {/* Mini portada */}
            <div className="w-24 h-32 shrink-0 bg-white rounded-lg shadow-md flex flex-col items-center justify-center p-2 text-center border border-amber-200">
              <BookOpen className="w-6 h-6 text-amber-700 mb-1" />
              <p className="text-[10px] font-bold text-amber-900 line-clamp-3 leading-tight">{cleanTitle}</p>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex gap-1.5 mb-2 flex-wrap">
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full">
                  100% Legal · Dominio Público
                </span>
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full">
                  {lang === 'es' ? 'Español' : lang === 'en' ? 'Inglés' : lang.toUpperCase()}
                </span>
                {year && (
                  <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-1 rounded-full">
                    {year}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-amber-900 leading-tight mb-1">
                {cleanTitle}
              </h2>
              <p className="text-sm text-amber-800 font-medium italic">por {author}</p>
              {book.rating >= 4 && (
                <div className="flex items-center gap-1 mt-2">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= book.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                  ))}
                  <span className="text-[10px] text-amber-700 font-semibold ml-1">Clásico universal</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sinopsis</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{descOnly}</p>
          </div>

          {book.claimInstructions && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
              <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Download className="w-3.5 h-3.5" /> Cómo descargarlo gratis
              </h4>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">{book.claimInstructions}</pre>
            </div>
          )}

          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-800 text-sm">¿Por qué es gratis y legal?</h4>
                <p className="mt-1 text-xs text-emerald-700 leading-relaxed">
                  Los derechos de autor ya expiraron (autor fallecido hace más de 70 años). Es <strong>dominio público</strong> según la ley internacional. Project Gutenberg lo ofrece gratis para todo el mundo.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <div>
              <div className="text-2xl font-black text-emerald-600">$0.00</div>
              <div className="text-xs text-gray-500">Descarga gratis · Sin registro</div>
            </div>
            <div className="flex gap-2">
              {book.claimUrl && (
                <a
                  href={book.claimUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-amber-300 hover:border-amber-400 hover:bg-amber-50 px-4 py-2.5 text-sm text-amber-700 font-semibold transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Project Gutenberg
                </a>
              )}
              <Link
                href="/tienda"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 px-5 py-2.5 text-sm font-bold text-white transition shadow-md"
              >
                Ver tienda <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE — /libros
   ══════════════════════════════════════════════════════════════ */
export default function LibrosPage() {
  const [books, setBooks] = useState<ScannedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState<ScannedGame | null>(null);
  const [filterLang, setFilterLang] = useState<'all' | 'es' | 'en'>('all');

  const loadBooks = useCallback(async () => {
    try {
      const res = await fetch('/api/scanner/results?filter=free');
      const data = await res.json();
      if (data.success) {
        const allGames: ScannedGame[] = data.games || [];
        // Solo libros clasicos
        const onlyBooks = allGames.filter(g => g.genre && g.genre.includes('Libro Clásico'));
        setBooks(onlyBooks);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadBooks(); }, [loadBooks]);

  const filteredBooks = useMemo(() => books.filter(b => {
    if (filterLang !== 'all') {
      const langMatch = b.description.match(/Idioma:\s*(\w+)/);
      const lang = langMatch ? langMatch[1] : '';
      if (lang !== filterLang) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return b.title.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q);
    }
    return true;
  }), [books, filterLang, search]);

  const handleView = (b: ScannedGame) => setSelectedBook(b);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-amber-50/30">
      <SharedHeader activePage="books" />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-700 via-orange-700 to-amber-800 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,white,transparent_60%)]" />
        <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_15px,white_15px,white_16px)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 animate-fade-in">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full mb-3 shadow-lg">
                <BookOpen className="w-3.5 h-3.5 text-amber-200" />
                Dominio Público · 100% Legal
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight mb-2">
                Libros Clásicos <span className="text-amber-200">GRATIS</span>
              </h1>
              <p className="text-sm sm:text-base text-white/85 max-w-xl">
                {books.length} clásicos universales de dominio público. Don Quijote, Hamlet, Frankenstein, Drácula y más. Descargas legales desde Project Gutenberg.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                📚 {books.length} Libros
              </span>
              <span className="bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                ⚖️ 100% Legal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título o autor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl bg-white border border-gray-200 py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400 hover:text-gray-700" />
              </button>
            )}
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setFilterLang('all')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition ${filterLang === 'all' ? 'bg-amber-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterLang('es')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition ${filterLang === 'es' ? 'bg-amber-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              🇪🇸 Español
            </button>
            <button
              onClick={() => setFilterLang('en')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition ${filterLang === 'en' ? 'bg-amber-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              🇬🇧 Inglés
            </button>
          </div>
        </div>

        {/* Grid de libros */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Cargando libros clásicos...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-amber-200 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron libros</p>
            <button onClick={() => { setSearch(''); setFilterLang('all'); }} className="mt-3 text-amber-600 text-sm font-semibold hover:underline">
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-3">
              Mostrando <strong className="text-gray-700">{filteredBooks.length}</strong> libros clásicos
              {(search || filterLang !== 'all') && (
                <button onClick={() => { setSearch(''); setFilterLang('all'); }} className="ml-2 text-amber-600 hover:underline">limpiar</button>
              )}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {filteredBooks.map(book => (
                <BookCard key={book.id} book={book} onView={handleView} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="relative bg-gradient-to-b from-[#2a1a0e] to-[#0a0a0f] text-white mt-12 overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_20%_30%,white,transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                <BookOpen className="w-4.5 h-4.5 text-white" style={{ width: '18px', height: '18px' }} />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-200">DigiStore · Libros Clásicos</p>
                <p className="text-[10px] text-gray-500">Dominio público · 100% legal</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <Link href="/" className="hover:text-amber-300 transition-colors">Inicio</Link>
              <span>·</span>
              <Link href="/juegos-gratis" className="hover:text-emerald-300 transition-colors">Juegos</Link>
              <span>·</span>
              <Link href="/apps-open-source" className="hover:text-blue-300 transition-colors">Apps</Link>
              <span>·</span>
              <Link href="/tienda" className="hover:text-rose-300 transition-colors">Tienda</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal */}
      <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      <ProductDetailModal />
    </div>
  );
}
