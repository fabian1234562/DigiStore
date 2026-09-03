'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Search, X, Loader2, ExternalLink, ArrowLeft, ArrowRight,
  Star, Download, Shield, Code, Cpu, Video, Palette, Music,
  Folder, Mail, Globe, Zap, Image,
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

/* ══════════════════════════════════════════════════════════════
   APP CARD — card premium para apps open source
   ══════════════════════════════════════════════════════════════ */
function AppCard({ app, onView }: { app: ScannedGame; onView: (a: ScannedGame) => void }) {
  // Detectar categoria por genre
  const genre = app.genre && app.genre.length > 0 ? app.genre[0] : 'Software';
  const categoryColor = getCategoryColor(genre);

  // Extraer nombre oficial de la descripción
  const officialMatch = app.description.match(/Software oficial:\s*([^\.]+)/);
  const officialName = officialMatch ? officialMatch[1].trim() : app.title;

  return (
    <div
      onClick={() => onView(app)}
      className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-premium-lg hover:-translate-y-1 border border-blue-100 hover:border-blue-200"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600">
        {/* Imagen SVG personalizada de la app */}
        <img
          src={app.imageUrl}
          alt={app.title}
          width={616}
          height={353}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Overlay sutil */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/30 via-transparent to-transparent opacity-50 pointer-events-none" />
        {/* Badge OPEN SOURCE */}
        <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-lg uppercase">
          Open Source
        </span>
        {/* Badge Free */}
        <span className="absolute top-2 right-2 bg-white text-blue-700 text-[9px] font-bold px-2 py-1 rounded-md shadow-lg uppercase">
          Free
        </span>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider truncate">{genre}</span>
          {app.rating >= 4 && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-bold">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {app.rating}
            </span>
          )}
        </div>
        <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight mt-1">
          {app.title}
        </h3>
        <p className="text-[10px] text-blue-700 font-medium line-clamp-1 mt-0.5">{officialName}</p>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-50">
          <span className="text-xs font-black text-emerald-600">GRATIS</span>
          <span className="text-[10px] text-blue-700 flex items-center gap-1 font-semibold">
            <Download className="w-3 h-3" /> Descargar
          </span>
        </div>
      </div>
    </div>
  );
}

function getCategoryIcon(genre: string): React.ComponentType<{ className?: string }> {
  const g = genre.toLowerCase();
  if (g.includes('video') || g.includes('stream')) return Video;
  if (g.includes('audio') || g.includes('música') || g.includes('musica') || g.includes('partitura')) return Music;
  if (g.includes('imagen') || g.includes('fotograf') || g.includes('pintura') || g.includes('vector')) return Palette;
  if (g.includes('código') || g.includes('codigo') || g.includes('engine')) return Code;
  if (g.includes('navegador')) return Globe;
  if (g.includes('email')) return Mail;
  if (g.includes('compresión') || g.includes('ftp') || g.includes('usb')) return Folder;
  return Cpu;
}

function getCategoryColor(genre: string): string {
  const g = genre.toLowerCase();
  if (g.includes('video')) return 'bg-gradient-to-br from-rose-500 to-red-600';
  if (g.includes('audio')) return 'bg-gradient-to-br from-purple-500 to-pink-600';
  if (g.includes('imagen') || g.includes('fotograf') || g.includes('pintura')) return 'bg-gradient-to-br from-orange-500 to-amber-600';
  if (g.includes('código') || g.includes('engine')) return 'bg-gradient-to-br from-emerald-500 to-green-600';
  if (g.includes('navegador')) return 'bg-gradient-to-br from-indigo-500 to-blue-600';
  if (g.includes('email')) return 'bg-gradient-to-br from-cyan-500 to-blue-600';
  return 'bg-gradient-to-br from-violet-500 to-purple-600';
}

/* ══════════════════════════════════════════════════════════════
   APP DETAIL MODAL
   ══════════════════════════════════════════════════════════════ */
function AppDetailModal({ app, onClose }: { app: ScannedGame | null; onClose: () => void }) {
  if (!app) return null;
  const genre = app.genre && app.genre.length > 0 ? app.genre[0] : 'Software';
  const officialMatch = app.description.match(/Software oficial:\s*([^\.]+)/);
  const officialName = officialMatch ? officialMatch[1].trim() : app.title;
  const webMatch = app.description.match(/Descarga desde\s*(https?:\/\/[^\s\.]+)/);
  const webUrl = webMatch ? webMatch[1] : '';
  const descOnly = app.description.split('. Software oficial:')[0];
  const Icon = getCategoryIcon(genre);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-blue-200 shadow-premium-lg my-8" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
        </button>

        {/* Header con app icon */}
        <div className="relative bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 p-6 rounded-t-2xl">
          <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,white_8px,white_9px)] rounded-t-2xl" />
          <div className="relative flex gap-4">
            <div className={`w-20 h-20 shrink-0 rounded-2xl ${getCategoryColor(genre)} flex items-center justify-center shadow-lg`}>
              <Icon className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex gap-1.5 mb-2 flex-wrap">
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full">
                  100% Open Source
                </span>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full">
                  {genre}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-1">{app.title}</h2>
              <p className="text-sm text-white/90 font-medium">{officialName}</p>
              {app.rating >= 4 && (
                <div className="flex items-center gap-1 mt-2">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= app.rating ? 'text-amber-300 fill-amber-300' : 'text-white/30'}`} />
                  ))}
                  <span className="text-[10px] text-white font-semibold ml-1">Software libre recomendado</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descripción</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{descOnly}</p>
          </div>

          {app.claimInstructions && (
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
              <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Download className="w-3.5 h-3.5" /> Cómo descargarlo e instalarlo
              </h4>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">{app.claimInstructions}</pre>
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
                  Es software <strong>open source</strong> con licencia libre (GPL, MIT, Apache, etc.). Cualquiera puede descargarlo, usarlo y modificarlo gratis. Lo distribuimos desde la web oficial del proyecto.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <div>
              <div className="text-2xl font-black text-emerald-600">$0.00</div>
              <div className="text-xs text-gray-500">Descarga gratis · Sin límites</div>
            </div>
            <div className="flex gap-2">
              {app.claimUrl && (
                <a
                  href={app.claimUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-blue-300 hover:border-blue-400 hover:bg-blue-50 px-4 py-2.5 text-sm text-blue-700 font-semibold transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Web oficial
                </a>
              )}
              <Link
                href="/tienda"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-5 py-2.5 text-sm font-bold text-white transition shadow-md"
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
   PAGE — /apps-open-source
   ══════════════════════════════════════════════════════════════ */
export default function AppsOpenSourcePage() {
  const [apps, setApps] = useState<ScannedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<ScannedGame | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const loadApps = useCallback(async () => {
    try {
      const res = await fetch('/api/scanner/results?filter=free');
      const data = await res.json();
      if (data.success) {
        const allGames: ScannedGame[] = data.games || [];
        // Solo apps open source (con tag 'open-source')
        const onlyApps = allGames.filter(g => g.tags && g.tags.includes('open-source'));
        setApps(onlyApps);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadApps(); }, [loadApps]);

  // Categorías únicas
  const categories = useMemo(() => {
    const set = new Set<string>();
    apps.forEach(a => {
      if (a.genre && a.genre.length > 0) set.add(a.genre[0]);
    });
    return Array.from(set).sort();
  }, [apps]);

  const filteredApps = useMemo(() => apps.filter(a => {
    if (filterCategory !== 'all') {
      const genre = a.genre && a.genre.length > 0 ? a.genre[0] : '';
      if (genre !== filterCategory) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q);
    }
    return true;
  }), [apps, filterCategory, search]);

  const handleView = (a: ScannedGame) => setSelectedApp(a);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-blue-50/30">
      <SharedHeader activePage="apps" />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,white,transparent_60%)]" />
        <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_15px,white_15px,white_16px)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 animate-fade-in">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full mb-3 shadow-lg">
                <Code className="w-3.5 h-3.5 text-cyan-200" />
                Software Libre · 100% Legal
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight mb-2">
                Apps Open Source <span className="text-cyan-200">GRATIS</span>
              </h1>
              <p className="text-sm sm:text-base text-white/85 max-w-xl">
                {apps.length} aplicaciones open source reales y verificadas. GIMP, LibreOffice, VLC, Firefox, OBS Studio y más. Descargas desde webs oficiales.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                💾 {apps.length} Apps
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
              placeholder="Buscar app open source..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl bg-white border border-gray-200 py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400 hover:text-gray-700" />
              </button>
            )}
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="rounded-xl bg-white border border-gray-200 py-2.5 px-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 cursor-pointer"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Grid de apps */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Cargando apps open source...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-20">
            <Code className="w-16 h-16 text-blue-200 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron apps</p>
            <button onClick={() => { setSearch(''); setFilterCategory('all'); }} className="mt-3 text-blue-600 text-sm font-semibold hover:underline">
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-3">
              Mostrando <strong className="text-gray-700">{filteredApps.length}</strong> apps open source
              {(search || filterCategory !== 'all') && (
                <button onClick={() => { setSearch(''); setFilterCategory('all'); }} className="ml-2 text-blue-600 hover:underline">limpiar</button>
              )}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {filteredApps.map(app => (
                <AppCard key={app.id} app={app} onView={handleView} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="relative bg-gradient-to-b from-[#0a1428] to-[#0a0a0f] text-white mt-12 overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_20%_30%,white,transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Code className="w-4.5 h-4.5 text-white" style={{ width: '18px', height: '18px' }} />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-200">DigiStore · Apps Open Source</p>
                <p className="text-[10px] text-gray-500">Software libre · 100% legal</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <Link href="/" className="hover:text-blue-300 transition-colors">Inicio</Link>
              <span>·</span>
              <Link href="/juegos-gratis" className="hover:text-emerald-300 transition-colors">Juegos</Link>
              <span>·</span>
              <Link href="/libros" className="hover:text-amber-300 transition-colors">Libros</Link>
              <span>·</span>
              <Link href="/tienda" className="hover:text-rose-300 transition-colors">Tienda</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal */}
      <AppDetailModal app={selectedApp} onClose={() => setSelectedApp(null)} />
      <ProductDetailModal />
    </div>
  );
}
