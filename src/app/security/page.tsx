'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck, Flame, Sparkles, Wrench, Target, AlertTriangle,
  Loader2, Github, ArrowLeft, ArrowRight, Lock, Bug, Cpu,
} from 'lucide-react';
import { ProjectCard } from '@/components/security/ProjectCard';
import { SearchBar, type SecuritySort } from '@/components/security/SearchBar';
import type { SecurityProject } from '@/app/api/security/search/route';

const SharedHeader = dynamic(
  () => import('@/components/store/SharedHeader').then((m) => ({ default: m.SharedHeader })),
  { ssr: false },
);

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
  accent: string; // tailwind text color
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-xl shrink-0`}>
        <span aria-hidden="true">{emoji}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h2 className={`text-lg sm:text-xl font-extrabold ${accent} leading-tight`}>{title}</h2>
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
function EmptyState() {
  return (
    <div className="rounded-2xl bg-gray-900/40 border border-gray-800 p-10 text-center">
      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-800 flex items-center justify-center">
        <Bug className="w-6 h-6 text-gray-500" />
      </div>
      <p className="text-gray-300 text-sm font-semibold">Sin resultados</p>
      <p className="text-gray-500 text-xs mt-1">Prueba con otra búsqueda o cambia los filtros.</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE — /security
   ══════════════════════════════════════════════════════════════ */
export default function SecurityPage() {
  const router = useRouter();

  // Section data
  const [trending, setTrending] = useState<SecurityProject[]>([]);
  const [recent, setRecent] = useState<SecurityProject[]>([]);
  const [ctf, setCtf] = useState<SecurityProject[]>([]);
  const [hacking, setHacking] = useState<SecurityProject[]>([]);

  const [loadingSections, setLoadingSections] = useState(true);
  const [sectionError, setSectionError] = useState<string | null>(null);

  // Search mode
  const [searchResults, setSearchResults] = useState<SecurityProject[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(1);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useState<{
    q: string;
    category: string;
    sort: SecuritySort;
  }>({ q: '', category: 'all', sort: 'trending' });

  const searchActive = searchParams.q !== '' || searchParams.category !== 'all';
  const hasMore = searchResults.length < searchTotal;

  const searchSeq = useRef(0);

  /* ── Fetch helper ── */
  const fetchProjects = useCallback(
    async (params: {
      q?: string;
      category?: string;
      sort?: SecuritySort;
      per_page?: number;
      page?: number;
    }): Promise<{ projects: SecurityProject[]; totalCount: number } | null> => {
      const url = new URL('/api/security/search', window.location.origin);
      if (params.q) url.searchParams.set('q', params.q);
      if (params.category && params.category !== 'all')
        url.searchParams.set('category', params.category);
      if (params.sort) url.searchParams.set('sort', params.sort);
      url.searchParams.set('per_page', String(params.per_page ?? 12));
      url.searchParams.set('page', String(params.page ?? 1));

      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      return { projects: data.projects, totalCount: data.totalCount };
    },
    [],
  );

  /* ── Load all sections in parallel on mount ── */
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
      const m = e instanceof Error ? e.message : 'Error desconocido';
      setSectionError(m);
    } finally {
      setLoadingSections(false);
    }
  }, [fetchProjects]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  /* ── Search handler (debounced by SearchBar) ── */
  const handleSearchChange = useCallback(
    (params: { q: string; category: string; sort: SecuritySort }) => {
      setSearchParams(params);
      setSearchPage(1);
    },
    [],
  );

  /* ── Run search when params change ── */
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
        if (seq !== searchSeq.current) return; // stale
        setSearchResults(res?.projects ?? []);
        setSearchTotal(res?.totalCount ?? 0);
      })
      .catch((e) => {
        if (seq !== searchSeq.current) return;
        const m = e instanceof Error ? e.message : 'Error desconocido';
        setSearchError(m);
      })
      .finally(() => {
        if (seq === searchSeq.current) setLoadingSearch(false);
      });
  }, [searchParams, searchActive, fetchProjects]);

  /* ── Load more (pagination) ── */
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
      const m = e instanceof Error ? e.message : 'Error desconocido';
      setSearchError(m);
    } finally {
      setLoadingSearch(false);
    }
  };

  /* ── Open project detail ── */
  const openProject = useCallback(
    (p: SecurityProject) => {
      router.push(`/security/project/${p.id}?owner=${encodeURIComponent(p.fullName)}`);
    },
    [router],
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
      <SharedHeader activePage="home" />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden border-b border-gray-800">
        {/* Background grid + glow */}
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
                Explora herramientas, proyectos y recursos de ciberseguridad open source de GitHub.
                Pentesting, OSINT, CTF, forense, criptografía y más — directo desde la fuente.
              </p>
            </div>

            {/* Stats badges */}
            <div className="flex flex-wrap gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 bg-gray-900/80 border border-gray-800 text-gray-300 text-xs font-bold px-3 py-2 rounded-xl">
                <Github className="w-3.5 h-3.5 text-violet-400" />
                GitHub API
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-900/80 border border-gray-800 text-gray-300 text-xs font-bold px-3 py-2 rounded-xl">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Solo 100+ ⭐
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-900/80 border border-gray-800 text-gray-300 text-xs font-bold px-3 py-2 rounded-xl">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                Cache 10 min
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-7">
            <SearchBar
              onChange={handleSearchChange}
              loading={loadingSearch}
              resultsCount={searchActive ? searchTotal : undefined}
            />
          </div>
        </div>
      </section>

      {/* ═══ MAIN ═══ */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* ── SEARCH RESULTS MODE ── */}
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
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {searchResults.map((p) => (
                    <ProjectCard key={p.id} project={p} onOpen={openProject} />
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
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
                        </>
                      ) : (
                        <>
                          Cargar más <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        ) : (
          /* ── BROWSE MODE: 4 sections ── */
          <>
            {sectionError ? (
              <ErrorState message={sectionError} onRetry={loadSections} />
            ) : (
              <>
                {/* 🔥 Trending */}
                <section>
                  <SectionHeader
                    emoji="🔥"
                    title="Trending Security Projects"
                    subtitle="Los proyectos con más estrellas y actividad reciente"
                    accent="text-amber-300"
                    icon={
                      <Flame className="w-5 h-5 text-amber-400 shrink-0" />
                    }
                  />
                  {loadingSections ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {trending.map((p) => (
                        <ProjectCard key={p.id} project={p} onOpen={openProject} />
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
                      {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {recent.slice(0, 8).map((p) => (
                        <ProjectCard key={p.id} project={p} onOpen={openProject} />
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
                      {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {ctf.map((p) => (
                        <ProjectCard key={p.id} project={p} onOpen={openProject} />
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
                      {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {hacking.map((p) => (
                        <ProjectCard key={p.id} project={p} onOpen={openProject} />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </>
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
                <p className="text-[10px] text-gray-500">Cybersecurity · Open Source · 100% legal</p>
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
            Úsalas de forma ética y solo en sistemas donde tengas permiso explícito. DigiStore no se hace responsable del mal uso.
          </p>
        </div>
      </footer>
    </div>
  );
}
