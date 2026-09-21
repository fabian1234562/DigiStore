'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck, Flame, Sparkles, Wrench, Target, AlertTriangle,
  Loader2, Github, ArrowLeft, ArrowRight, Lock, Bug, Cpu,
  Package, Download, Search as SearchIcon, ExternalLink,
} from 'lucide-react';
import { ProjectCard } from '@/components/security/ProjectCard';
import { SearchBar, type SecuritySort } from '@/components/security/SearchBar';
import type { SecurityProject } from '@/app/api/security/search/route';
import { cn } from '@/lib/utils';

const SharedHeader = dynamic(
  () => import('@/components/store/SharedHeader').then((m) => ({ default: m.SharedHeader })),
  { ssr: false },
);

/* ══════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════ */
interface ImportedProject {
  id: string;
  repo: string;
  name: string;
  description: string;
  author: string;
  licenseKey: string | null;
  licenseName: string | null;
  licenseStatus: 'permissive' | 'review' | 'forbidden';
  licenseLabel: string;
  licenseEmoji: string;
  canRedistribute: boolean;
  stars: number;
  forks: number;
  language: string | null;
  category: string;
  topics: string[];
  imageUrl: string;
  ownerAvatar: string;
  repoUrl: string;
  homepage: string | null;
  releaseVersion: string | null;
  fileSize: number;
  fileCount: number;
  readmeContent: string;
  lastUpdate: string;
  archived: boolean;
  importedAt: string;
  hasDownload: boolean;
}

type Tab = 'discover' | 'catalog';

/* ══════════════════════════════════════════════════════════════
   SKELETON CARD
   ══════════════════════════════════════════════════════════════ */
function SkeletonCard() {
  return (
    <div className="bg-gray-900/60 rounded-2xl overflow-hidden border border-gray-800 animate-pulse">
      <div className="aspect-[16/10] bg-gray-800/70" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-4 w-2/3 rounded bg-gray-800" />
        <div className="h-3 w-full rounded bg-gray-800/70" />
        <div className="h-3 w-4/5 rounded bg-gray-800/70" />
        <div className="flex gap-3 pt-2">
          <div className="h-3 w-12 rounded bg-gray-800/70" />
          <div className="h-3 w-12 rounded bg-gray-800/70" />
          <div className="h-3 w-16 rounded bg-gray-800/70" />
        </div>
        <div className="flex gap-2 pt-2 border-t border-gray-800">
          <div className="h-7 flex-1 rounded-lg bg-gray-800/70" />
          <div className="h-7 w-20 rounded-lg bg-gray-800/70" />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION HEADER
   ══════════════════════════════════════════════════════════════ */
function SectionHeader({
  icon,
  emoji,
  title,
  subtitle,
  accent,
}: {
  icon?: React.ReactNode;
  emoji: string;
  title: string;
  subtitle?: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-xl shrink-0">
        <span aria-hidden="true">{emoji}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h2 className={cn('text-lg sm:text-xl font-extrabold leading-tight', accent)}>{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{subtitle}</p>}
      </div>
      {icon}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ERROR STATE
   ══════════════════════════════════════════════════════════════ */
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl bg-red-950/30 border border-red-900/50 p-6 text-center">
      <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
      <p className="text-red-200 text-sm font-semibold mb-1">Error al cargar proyectos</p>
      <p className="text-red-300/70 text-xs mb-4 max-w-md mx-auto">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
      >
        Reintentar
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   EMPTY STATE
   ══════════════════════════════════════════════════════════════ */
function EmptyState({ title = 'Sin resultados', message = 'Prueba con otra búsqueda o cambia los filtros.' }: { title?: string; message?: string }) {
  return (
    <div className="rounded-2xl bg-gray-900/40 border border-gray-800 p-10 text-center">
      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-800 flex items-center justify-center">
        <Bug className="w-6 h-6 text-gray-500" />
      </div>
      <p className="text-gray-300 text-sm font-semibold">{title}</p>
      <p className="text-gray-500 text-xs mt-1">{message}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CATALOG CARD — for imported projects (download button)
   ══════════════════════════════════════════════════════════════ */
function CatalogCard({ project, onOpen }: { project: ImportedProject; onOpen: (p: ImportedProject) => void }) {
  const [downloading, setDownloading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloading) return;
    setDownloading(true);
    // Browser-native ZIP download via direct navigation
    window.location.href = `/api/security/download/${project.id}`;
    // Reset after a beat (the browser leaves the page; on return, state resets)
    setTimeout(() => setDownloading(false), 4000);
  };

  const licenseClass =
    project.licenseStatus === 'permissive'
      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
      : project.licenseStatus === 'review'
        ? 'bg-amber-950/70 text-amber-300 border-amber-800'
        : 'bg-red-950/70 text-red-300 border-red-800';

  return (
    <article
      onClick={() => onOpen(project)}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(project); } }}
      className={cn(
        'group relative bg-gray-900/80 rounded-2xl overflow-hidden border border-gray-800',
        'hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10',
        'transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col',
        'focus:outline-none focus:ring-2 focus:ring-emerald-500/50',
      )}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-950">
        {!imgError ? (
          <img
            src={project.imageUrl}
            alt={`Preview de ${project.name}`}
            width={600}
            height={375}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-gray-900 flex items-center justify-center">
            <Package className="w-12 h-12 text-emerald-500/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent pointer-events-none" />

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border bg-emerald-500/20 text-emerald-200 border-emerald-500/40 backdrop-blur-md">
            <Package className="w-2.5 h-2.5" /> Importado
          </span>
          <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md', licenseClass)}>
            <span aria-hidden="true">{project.licenseEmoji}</span>
            <span className="hidden sm:inline">{project.licenseLabel}</span>
          </span>
        </div>

        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <img
              src={project.ownerAvatar}
              alt=""
              width={20}
              height={20}
              className="w-5 h-5 rounded-full ring-2 ring-gray-900/50 shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span className="text-[11px] text-gray-300 font-medium truncate max-w-[140px]">
              {project.author}
            </span>
          </div>
          {project.releaseVersion && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-900/80 text-cyan-200 border border-gray-700 backdrop-blur-md">
              {project.releaseVersion}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5 flex flex-col gap-2.5 flex-1">
        <h3 className="font-bold text-sm text-white line-clamp-1 leading-tight group-hover:text-emerald-300 transition-colors">
          {project.name}
        </h3>
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed flex-1">
          {project.description}
        </p>

        <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-1">
          <span className="inline-flex items-center gap-1 font-medium" title={`${project.stars} estrellas`}>
            <Sparkles className="w-3 h-3 text-amber-400" />
            {project.stars >= 1000 ? `${(project.stars / 1000).toFixed(1)}k` : project.stars}
          </span>
          {project.language && (
            <span className="inline-flex items-center gap-1 font-medium text-gray-300">
              {project.language}
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 bg-gray-800/60 border border-gray-700 px-1.5 py-0.5 rounded-md max-w-[120px] truncate" title={project.licenseName || ''}>
            <span className="truncate">{project.licenseName || 'Sin licencia'}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 pt-2 mt-1 border-t border-gray-800">
          <button
            onClick={handleDownload}
            disabled={downloading || !project.canRedistribute}
            className={cn(
              'flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg border transition-colors',
              project.canRedistribute
                ? 'bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border-emerald-500/40'
                : 'bg-gray-800/60 text-gray-500 border-gray-700 cursor-not-allowed',
            )}
            aria-label={`Descargar ${project.name}`}
            title={project.canRedistribute ? 'Descargar ZIP' : 'Licencia no redistribuible'}
          >
            {downloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Descargando…
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" /> Descargar
              </>
            )}
          </button>
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors"
            aria-label={`Abrir ${project.name} en GitHub`}
            title="Abrir en GitHub"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE — /security
   ══════════════════════════════════════════════════════════════ */
export default function SecurityPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('discover');

  // Section data (discover)
  const [trending, setTrending] = useState<SecurityProject[]>([]);
  const [recent, setRecent] = useState<SecurityProject[]>([]);
  const [ctf, setCtf] = useState<SecurityProject[]>([]);
  const [hacking, setHacking] = useState<SecurityProject[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [sectionError, setSectionError] = useState<string | null>(null);

  // Search mode (discover)
  const [searchResults, setSearchResults] = useState<SecurityProject[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(1);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<{
    q: string; category: string; sort: SecuritySort;
  }>({ q: '', category: 'all', sort: 'trending' });
  const searchActive = searchParams.q !== '' || searchParams.category !== 'all';
  const hasMore = searchResults.length < searchTotal;
  const searchSeq = useRef(0);

  // Catalog (imported projects) — fetched on mount and on tab switch
  const [imported, setImported] = useState<ImportedProject[]>([]);
  const [loadingImported, setLoadingImported] = useState(true);
  const [catalogQuery, setCatalogQuery] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('all');

  // Set of imported repo slugs (for marking ProjectCards in Discover mode)
  const importedSet = useRef<Set<string>>(new Set());

  const fetchProjects = useCallback(
    async (params: {
      q?: string; category?: string; sort?: SecuritySort; per_page?: number; page?: number;
    }): Promise<{ projects: SecurityProject[]; totalCount: number } | null> => {
      const url = new URL('/api/security/search', window.location.origin);
      if (params.q) url.searchParams.set('q', params.q);
      if (params.category && params.category !== 'all') url.searchParams.set('category', params.category);
      if (params.sort) url.searchParams.set('sort', params.sort);
      url.searchParams.set('per_page', String(params.per_page ?? 12));
      url.searchParams.set('page', String(params.page ?? 1));
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`);
      return { projects: data.projects, totalCount: data.totalCount };
    },
    [],
  );

  const loadSections = useCallback(async () => {
    setLoadingSections(true);
    setSectionError(null);
    try {
      const [t, r, c, h] = await Promise.all([
        fetchProjects({ sort: 'trending', per_page: 12 }),
        fetchProjects({ sort: 'updated', per_page: 12 }),
        fetchProjects({ category: 'ctf', sort: 'stars', per_page: 8 }),
        fetchProjects({ category: 'red-team', sort: 'stars', per_page: 8 }),
      ]);
      setTrending(t?.projects ?? []);
      setRecent(r?.projects ?? []);
      setCtf(c?.projects ?? []);
      setHacking(h?.projects ?? []);
    } catch (e) {
      setSectionError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoadingSections(false);
    }
  }, [fetchProjects]);

  const loadImported = useCallback(async () => {
    setLoadingImported(true);
    try {
      const res = await fetch('/api/security/catalog', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.success) {
        setImported(data.projects || []);
        importedSet.current = new Set(
          (data.projects || []).map((p: ImportedProject) => p.repo.toLowerCase()),
        );
      } else {
        setImported([]);
      }
    } catch {
      setImported([]);
    } finally {
      setLoadingImported(false);
    }
  }, []);

  useEffect(() => {
    loadSections();
    loadImported();
  }, [loadSections, loadImported]);

  const handleSearchChange = useCallback(
    (params: { q: string; category: string; sort: SecuritySort }) => {
      setSearchParams(params);
      setSearchPage(1);
    },
    [],
  );

  useEffect(() => {
    if (!searchActive) {
      setSearchResults([]);
      setSearchTotal(0);
      setSearchError(null);
      return;
    }
    const seq = ++searchSeq.current;
    setLoadingSearch(true);
    setSearchError(null);
    fetchProjects({
      q: searchParams.q || undefined,
      category: searchParams.category,
      sort: searchParams.sort,
      per_page: 24,
      page: 1,
    })
      .then((res) => {
        if (seq !== searchSeq.current) return;
        setSearchResults(res?.projects ?? []);
        setSearchTotal(res?.totalCount ?? 0);
      })
      .catch((e) => {
        if (seq !== searchSeq.current) return;
        setSearchError(e instanceof Error ? e.message : 'Error desconocido');
      })
      .finally(() => { if (seq === searchSeq.current) setLoadingSearch(false); });
  }, [searchParams, searchActive, fetchProjects]);

  const handleLoadMore = async () => {
    if (loadingSearch || !hasMore) return;
    const nextPage = searchPage + 1;
    setLoadingSearch(true);
    try {
      const res = await fetchProjects({
        q: searchParams.q || undefined,
        category: searchParams.category,
        sort: searchParams.sort,
        per_page: 24,
        page: nextPage,
      });
      if (res) {
        setSearchResults((prev) => [...prev, ...res.projects]);
        setSearchPage(nextPage);
        setSearchTotal(res.totalCount);
      }
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoadingSearch(false);
    }
  };

  const openProject = useCallback(
    (p: SecurityProject) => {
      router.push(`/security/project/${p.id}?owner=${encodeURIComponent(p.fullName)}`);
    },
    [router],
  );

  const openImported = useCallback(
    (p: ImportedProject) => {
      router.push(`/security/project/${p.id}?owner=${encodeURIComponent(p.repo)}&imported=1`);
    },
    [router],
  );

  /* Notify from ProjectCard when a project becomes imported */
  const handleImportedChange = useCallback((_repo: string, _imported: boolean) => {
    // Refresh the imported list so the Descargables section updates
    loadImported();
  }, [loadImported]);

  // Filtered catalog view
  const filteredCatalog = imported.filter((p) => {
    if (catalogCategory !== 'all' && p.category !== catalogCategory) return false;
    if (catalogQuery.trim()) {
      const q = catalogQuery.trim().toLowerCase();
      const hay = [p.name, p.description, p.author, p.repo, ...(p.topics || [])].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  // Top 6 imported for the "Descargables" section in discover mode
  const topImported = imported.slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
      <SharedHeader activePage="security" />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.18),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.06] bg-[repeating-linear-gradient(0deg,transparent,transparent_24px,#fff_24px,#fff_25px),repeating-linear-gradient(90deg,transparent,transparent_24px,#fff_24px,#fff_25px)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-violet-300 text-sm font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 animate-fade-in">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 text-violet-300 text-[11px] font-bold px-3 py-1.5 rounded-full mb-3 shadow-lg shadow-violet-500/10">
                <Lock className="w-3.5 h-3.5" />
                Cybersecurity · Open Source · 100% Legal
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-2">
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  DigiStore Security
                </span>
              </h1>
              <p className="text-sm sm:text-base text-gray-400 max-w-xl leading-relaxed">
                Descubre, importa y distribuye proyectos de ciberseguridad open source. Análisis
                automático de licencia, README y descarga ZIP directa desde GitHub.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 bg-gray-900/80 border border-gray-800 text-gray-300 text-xs font-bold px-3 py-2 rounded-xl">
                <Github className="w-3.5 h-3.5 text-violet-400" />
                GitHub API
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-900/80 border border-gray-800 text-gray-300 text-xs font-bold px-3 py-2 rounded-xl">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Licencia verificada
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-900/80 border border-gray-800 text-gray-300 text-xs font-bold px-3 py-2 rounded-xl">
                <Package className="w-3.5 h-3.5 text-fuchsia-400" />
                {imported.length} importados
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-900/80 border border-gray-800 text-gray-300 text-xs font-bold px-3 py-2 rounded-xl">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                Cache 30 min
              </span>
            </div>
          </div>

          {/* ═══ TABS ═══ */}
          <div className="mt-7 flex gap-1.5 p-1.5 bg-gray-900/60 border border-gray-800 rounded-2xl w-full sm:w-fit">
            <button
              onClick={() => setTab('discover')}
              className={cn(
                'flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
                tab === 'discover'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800',
              )}
              aria-pressed={tab === 'discover'}
            >
              <SearchIcon className="w-4 h-4" />
              🔎 Descubrir
            </button>
            <button
              onClick={() => { setTab('catalog'); loadImported(); }}
              className={cn(
                'flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
                tab === 'catalog'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800',
              )}
              aria-pressed={tab === 'catalog'}
            >
              <Package className="w-4 h-4" />
              📦 Catálogo DigiStore
              {imported.length > 0 && (
                <span className="bg-emerald-500/20 text-emerald-200 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {imported.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ═══ MAIN ═══ */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {tab === 'discover' ? (
          <>
            {/* Search bar (discover mode) */}
            <div>
              <SearchBar
                onChange={handleSearchChange}
                loading={loadingSearch}
                resultsCount={searchActive ? searchTotal : undefined}
              />
            </div>

            {searchActive ? (
              <section>
                <SectionHeader
                  emoji="🔎"
                  title="Resultados de búsqueda"
                  subtitle={
                    searchParams.category !== 'all'
                      ? `Categoría: ${searchParams.category}`
                      : `Búsqueda: "${searchParams.q}"`
                  }
                  accent="text-violet-300"
                />
                {searchError ? (
                  <ErrorState message={searchError} onRetry={() => setSearchParams({ ...searchParams })} />
                ) : loadingSearch && searchResults.length === 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : searchResults.length === 0 ? (
                  <EmptyState />
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {searchResults.map((p) => (
                        <ProjectCard
                          key={p.id}
                          project={p}
                          onOpen={openProject}
                          imported={importedSet.current.has(p.fullName.toLowerCase())}
                          onImportedChange={handleImportedChange}
                        />
                      ))}
                    </div>
                    {hasMore && (
                      <div className="flex justify-center mt-8">
                        <button
                          onClick={handleLoadMore}
                          disabled={loadingSearch}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors shadow-lg shadow-violet-500/20"
                        >
                          {loadingSearch ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Cargando…</>
                          ) : (
                            <>Cargar más <ArrowRight className="w-4 h-4" /></>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </section>
            ) : (
              <>
                {sectionError ? (
                  <ErrorState message={sectionError} onRetry={loadSections} />
                ) : (
                  <>
                    {/* 📦 Descargables (imported) — show first as the bridge */}
                    <section>
                      <SectionHeader
                        emoji="📦"
                        title="Descargables en DigiStore"
                        subtitle="Proyectos importados y listos para descargar como ZIP"
                        accent="text-emerald-300"
                        icon={
                          <button
                            onClick={() => { setTab('catalog'); loadImported(); }}
                            className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-1 transition-colors"
                          >
                            Ver todos <ArrowRight className="w-3 h-3" />
                          </button>
                        }
                      />
                      {loadingImported ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                      ) : topImported.length === 0 ? (
                        <div className="rounded-2xl bg-gray-900/40 border border-gray-800 border-dashed p-8 text-center">
                          <Package className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-300 text-sm font-semibold mb-1">
                            Aún no hay proyectos importados
                          </p>
                          <p className="text-gray-500 text-xs">
                            Explora los proyectos siguientes y haz clic en <strong className="text-fuchsia-300">Importar</strong> para añadirlos al catálogo.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {topImported.map((p) => (
                            <CatalogCard key={p.id} project={p} onOpen={openImported} />
                          ))}
                        </div>
                      )}
                    </section>

                    {/* 🔥 Trending */}
                    <section>
                      <SectionHeader
                        emoji="🔥"
                        title="Trending Security Projects"
                        subtitle="Los proyectos con más estrellas y actividad reciente"
                        accent="text-amber-300"
                        icon={<Flame className="w-5 h-5 text-amber-400 shrink-0" />}
                      />
                      {loadingSections ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {trending.map((p) => (
                            <ProjectCard
                              key={p.id}
                              project={p}
                              onOpen={openProject}
                              imported={importedSet.current.has(p.fullName.toLowerCase())}
                              onImportedChange={handleImportedChange}
                            />
                          ))}
                        </div>
                      )}
                    </section>

                    {/* 🆕 Recently discovered */}
                    <section>
                      <SectionHeader
                        emoji="🆕"
                        title="Descubiertos recientemente"
                        subtitle="Repositorios actualizados en las últimas semanas"
                        accent="text-sky-300"
                        icon={<Sparkles className="w-5 h-5 text-sky-400 shrink-0" />}
                      />
                      {loadingSections ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {recent.slice(0, 8).map((p) => (
                            <ProjectCard
                              key={p.id}
                              project={p}
                              onOpen={openProject}
                              imported={importedSet.current.has(p.fullName.toLowerCase())}
                              onImportedChange={handleImportedChange}
                            />
                          ))}
                        </div>
                      )}
                    </section>

                    {/* 🎯 CTF & Cyber Labs */}
                    <section>
                      <SectionHeader
                        emoji="🎯"
                        title="CTF & Cyber Labs"
                        subtitle="Plataformas y retos Capture The Flag para practicar"
                        accent="text-emerald-300"
                        icon={<Target className="w-5 h-5 text-emerald-400 shrink-0" />}
                      />
                      {loadingSections ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {ctf.map((p) => (
                            <ProjectCard
                              key={p.id}
                              project={p}
                              onOpen={openProject}
                              imported={importedSet.current.has(p.fullName.toLowerCase())}
                              onImportedChange={handleImportedChange}
                            />
                          ))}
                        </div>
                      )}
                    </section>

                    {/* 🛠️ Ethical Hacking Tools */}
                    <section>
                      <SectionHeader
                        emoji="🛠️"
                        title="Ethical Hacking Tools"
                        subtitle="Herramientas de pentesting y red team para hacking ético"
                        accent="text-rose-300"
                        icon={<Wrench className="w-5 h-5 text-rose-400 shrink-0" />}
                      />
                      {loadingSections ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {hacking.map((p) => (
                            <ProjectCard
                              key={p.id}
                              project={p}
                              onOpen={openProject}
                              imported={importedSet.current.has(p.fullName.toLowerCase())}
                              onImportedChange={handleImportedChange}
                            />
                          ))}
                        </div>
                      )}
                    </section>
                  </>
                )}
              </>
            )}
          </>
        ) : (
          /* ═══ CATALOG TAB ═══ */
          <section>
            <SectionHeader
              emoji="📦"
              title="Catálogo DigiStore"
              subtitle="Proyectos importados y listos para descargar. Solo se incluyen proyectos con licencia redistribuible."
              accent="text-emerald-300"
              icon={<Package className="w-5 h-5 text-emerald-400 shrink-0" />}
            />

            {/* Search + category filter for catalog */}
            <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" aria-hidden="true" />
                <input
                  type="search"
                  value={catalogQuery}
                  onChange={(e) => setCatalogQuery(e.target.value)}
                  placeholder="Buscar en el catálogo importado..."
                  aria-label="Buscar en catálogo"
                  className="w-full rounded-xl bg-gray-900/80 border border-gray-800 py-3 pl-10 pr-4 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                />
              </div>
              <select
                value={catalogCategory}
                onChange={(e) => setCatalogCategory(e.target.value)}
                aria-label="Filtrar por categoría"
                className="appearance-none rounded-xl bg-gray-900/80 border border-gray-800 py-3 pl-4 pr-9 text-sm text-gray-200 cursor-pointer outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
              >
                <option value="all" className="bg-gray-900">Todas las categorías</option>
                <option value="osint" className="bg-gray-900">OSINT</option>
                <option value="ctf" className="bg-gray-900">CTF</option>
                <option value="red-team" className="bg-gray-900">Red Team</option>
                <option value="blue-team" className="bg-gray-900">Blue Team</option>
                <option value="bug-bounty" className="bg-gray-900">Bug Bounty</option>
                <option value="digital-forensics" className="bg-gray-900">Digital Forensics</option>
                <option value="privacy" className="bg-gray-900">Privacy</option>
                <option value="network-security" className="bg-gray-900">Network Security</option>
                <option value="cloud-security" className="bg-gray-900">Cloud Security</option>
                <option value="malware-analysis" className="bg-gray-900">Malware Analysis</option>
                <option value="cryptography" className="bg-gray-900">Cryptography</option>
                <option value="web-security" className="bg-gray-900">Web Security</option>
                <option value="reverse-engineering" className="bg-gray-900">Reverse Engineering</option>
                <option value="soc-siem" className="bg-gray-900">SOC / SIEM</option>
              </select>
            </div>

            {loadingImported ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filteredCatalog.length === 0 ? (
              <EmptyState
                title={imported.length === 0 ? 'Catálogo vacío' : 'Sin resultados'}
                message={
                  imported.length === 0
                    ? 'Ve a la pestaña "Descubrir" e importa proyectos con licencia redistribuible.'
                    : 'Prueba con otra búsqueda o cambia la categoría.'
                }
              />
            ) : (
              <>
                <p className="text-xs text-gray-500 mb-4">
                  Mostrando <strong className="text-emerald-300">{filteredCatalog.length}</strong> de{' '}
                  <strong>{imported.length}</strong> proyectos importados.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredCatalog.map((p) => (
                    <CatalogCard key={p.id} project={p} onOpen={openImported} />
                  ))}
                </div>
              </>
            )}
          </section>
        )}
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative mt-12 bg-gray-950 border-t border-gray-800">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-4 h-4 text-white" style={{ width: '18px', height: '18px' }} />
              </div>
              <div>
                <p className="text-sm font-bold text-violet-300">DigiStore Security</p>
                <p className="text-[10px] text-gray-500">Discovery · Import · Distribution</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <Link href="/" className="hover:text-violet-300 transition-colors">Inicio</Link>
              <span>·</span>
              <Link href="/juegos-gratis" className="hover:text-emerald-300 transition-colors">Juegos</Link>
              <span>·</span>
              <Link href="/apps-open-source" className="hover:text-blue-300 transition-colors">Apps</Link>
              <span>·</span>
              <Link href="/tienda" className="hover:text-rose-300 transition-colors">Tienda</Link>
            </div>
          </div>
          <p className="mt-5 text-[11px] text-gray-600 text-center sm:text-left">
            ⚠️ Las herramientas aquí listadas son open source y se proporcionan solo con fines educativos y de investigación.
            Úsalas de forma ética y solo en sistemas donde tengas permiso explícito. DigiStore solo redistribuye proyectos
            con licencias que lo permiten (MIT, Apache, BSD, GPL, etc.) — los repositorios con licencias restrictivas
            (AGPL, MPL, LGPL) se marcan para revisión manual. No se ejecuta ni modifica el código original.
          </p>
        </div>
      </footer>
    </div>
  );
}
