'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, Star, GitFork, AlertCircle, Calendar, Scale,
  ExternalLink, BookOpen, Bookmark, BookmarkCheck, Loader2,
  ShieldCheck, Tag, Globe, Activity,
} from 'lucide-react';
import { ProjectCard } from '@/components/security/ProjectCard';
import type { SecurityProject } from '@/app/api/security/search/route';

const SharedHeader = dynamic(
  () => import('@/components/store/SharedHeader').then((m) => ({ default: m.SharedHeader })),
  { ssr: false },
);

const SAVED_KEY = 'digistore-security-saved';

function loadSaved(): Record<number, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as Record<number, boolean>) : {};
  } catch {
    return {};
  }
}

function persistSaved(map: Record<number, boolean>) {
  try {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 1) return 'hoy';
  if (days < 30) return `hace ${days} día${days === 1 ? '' : 's'}`;
  if (days < 365) return `hace ${Math.floor(days / 30)} mes(es)`;
  return `hace ${Math.floor(days / 365)} año(s)`;
}

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  Java: '#b07219',
  Kotlin: '#A97BFF',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Dart: '#00B4AB',
  Lua: '#000080',
};

function generateHeroSvg(project: SecurityProject): string {
  const initials = project.name
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
  const hash = project.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = hash % 360;
  const bg1 = `hsl(${hue}, 60%, 25%)`;
  const bg2 = `hsl(${(hue + 40) % 360}, 60%, 12%)`;
  const accent = `hsl(${hue}, 80%, 60%)`;
  const safeName = project.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').slice(0, 32);
  const safeAuthor = (project.fullName.split('/')[0] || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .slice(0, 28);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="500" viewBox="0 0 1200 500">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="500" fill="url(#bg)"/>
  <rect width="1200" height="500" fill="url(#grid)"/>
  <circle cx="600" cy="200" r="80" fill="rgba(255,255,255,0.06)" stroke="${accent}" stroke-width="3"/>
  <text x="600" y="230" font-family="monospace" font-size="60" font-weight="bold" fill="${accent}" text-anchor="middle">${initials}</text>
  <text x="600" y="330" font-family="sans-serif" font-size="44" font-weight="bold" fill="white" text-anchor="middle">${safeName}</text>
  <text x="600" y="375" font-family="monospace" font-size="20" fill="rgba(255,255,255,0.7)" text-anchor="middle">@${safeAuthor}</text>
  <rect x="30" y="30" width="120" height="28" rx="14" fill="rgba(255,255,255,0.12)"/>
  <text x="90" y="49" font-family="monospace" font-size="14" fill="rgba(255,255,255,0.85)" text-anchor="middle">SECURITY</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function SecurityProjectPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = params?.id;
  const owner = searchParams?.get('owner') || '';

  const [project, setProject] = useState<SecurityProject | null>(null);
  const [similar, setSimilar] = useState<SecurityProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [avatarError, setAvatarError] = useState(false);
  const [savedMap, setSavedMap] = useState<Record<number, boolean>>({});

  const readmeUrl = useMemo(() => {
    if (!project) return '';
    return `https://github.com/${project.fullName}#readme`;
  }, [project]);

  const loadProject = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL('/api/security/project', window.location.origin);
      if (owner) url.searchParams.set('owner', owner);
      else if (id) url.searchParams.set('id', id);
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setProject(data.project);
      setSimilar(data.similar || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [id, owner]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  useEffect(() => {
    setSavedMap(loadSaved());
  }, []);

  const isSaved = project ? !!savedMap[project.id] : false;

  const toggleSave = useCallback(() => {
    if (!project) return;
    setSavedMap((prev) => {
      const next = { ...prev, [project.id]: !prev[project.id] };
      persistSaved(next);
      return next;
    });
  }, [project]);

  const heroImg = project
    ? !avatarError
      ? `${project.ownerAvatar}&s=1200`
      : generateHeroSvg(project)
    : '';

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
      <SharedHeader activePage="home" />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link
          href="/security"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-violet-300 text-sm font-medium mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a Security
        </Link>

        {/* LOADING */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="aspect-[12/5] rounded-2xl bg-gray-900 border border-gray-800" />
            <div className="h-8 w-2/3 rounded-lg bg-gray-900" />
            <div className="h-4 w-1/2 rounded bg-gray-900" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-gray-900 border border-gray-800" />
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-gray-900" />
              <div className="h-4 w-5/6 rounded bg-gray-900" />
              <div className="h-4 w-4/6 rounded bg-gray-900" />
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-2xl bg-red-950/30 border border-red-900/50 p-6 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-200 text-sm font-semibold mb-1">No se pudo cargar el proyecto</p>
            <p className="text-red-300/70 text-xs mb-4">{error}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={loadProject}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
              >
                Reintentar
              </button>
              <Link
                href="/security"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-semibold transition-colors"
              >
                Volver
              </Link>
            </div>
          </div>
        )}

        {/* PROJECT DETAILS */}
        {!loading && !error && project && (
          <div className="animate-fade-in">
            {/* Hero image */}
            <div className="relative aspect-[12/5] sm:aspect-[12/4] rounded-2xl overflow-hidden border border-gray-800 bg-gray-950 mb-6">
              <img
                src={heroImg}
                alt={`Avatar de ${project.fullName}`}
                fill
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => setAvatarError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 bg-violet-500/20 border border-violet-500/40 text-violet-200 text-[10px] font-bold px-2 py-1 rounded-full mb-2 backdrop-blur-md">
                    <ShieldCheck className="w-3 h-3" /> Open Source · Security
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    {project.name}
                  </h1>
                  <p className="text-sm text-gray-300 font-mono mt-1">{project.fullName}</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
              <button
                onClick={toggleSave}
                className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isSaved
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-gray-900 text-gray-200 border border-gray-800 hover:border-amber-500/40 hover:text-amber-300'
                }`}
                aria-pressed={isSaved}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4" /> Guardado
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" /> Guardar
                  </>
                )}
              </button>

              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white transition-all shadow-lg shadow-violet-500/20"
              >
                <ExternalLink className="w-4 h-4" /> Abrir en GitHub
              </a>

              <a
                href={readmeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-800 transition-colors"
              >
                <BookOpen className="w-4 h-4" /> Ver README
              </a>

              {project.homepage && (
                <a
                  href={project.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-800 transition-colors"
                >
                  <Globe className="w-4 h-4" /> Web
                </a>
              )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> Stars
                </div>
                <div className="text-xl font-bold text-white">{formatNumber(project.stars)}</div>
              </div>
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold mb-1">
                  <GitFork className="w-3.5 h-3.5" /> Forks
                </div>
                <div className="text-xl font-bold text-white">{formatNumber(project.forks)}</div>
              </div>
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold mb-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Issues
                </div>
                <div className="text-xl font-bold text-white">{formatNumber(project.openIssues)}</div>
              </div>
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
                  <Activity className="w-3.5 h-3.5" /> Estado
                </div>
                <div className="text-xl font-bold text-white">
                  {project.archived ? 'Archivado' : 'Activo'}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 mb-6">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                Descripción
              </h2>
              <p className="text-gray-200 leading-relaxed text-sm sm:text-base">
                {project.description}
              </p>
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-3 bg-gray-900/40 border border-gray-800 rounded-xl p-4">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: LANGUAGE_COLORS[project.language || ''] || '#71717a' }}
                />
                <div className="min-w-0">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                    Lenguaje
                  </div>
                  <div className="text-sm font-bold text-white truncate">
                    {project.language || 'No especificado'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-900/40 border border-gray-800 rounded-xl p-4">
                <Scale className="w-4 h-4 text-violet-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                    Licencia
                  </div>
                  <div className="text-sm font-bold text-white truncate">
                    {project.license || 'No especificada'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-900/40 border border-gray-800 rounded-xl p-4">
                <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                    Última actualización
                  </div>
                  <div className="text-sm font-bold text-white truncate">
                    {timeAgo(project.lastUpdate)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-900/40 border border-gray-800 rounded-xl p-4">
                <Tag className="w-4 h-4 text-fuchsia-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                    Categoría
                  </div>
                  <div className="text-sm font-bold text-white truncate capitalize">
                    {project.category.replace(/-/g, ' ')}
                  </div>
                </div>
              </div>
            </div>

            {/* Topics */}
            {project.topics.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Topics
                </h2>
                <div className="flex flex-wrap gap-2">
                  {project.topics.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-500/10 border border-violet-500/30 text-violet-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Similar projects */}
            {similar.length > 0 && (
              <section className="mt-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-xl">
                    🔗
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-fuchsia-300 leading-tight">
                      Proyectos similares
                    </h2>
                    <p className="text-xs text-gray-500">Otros proyectos de la misma categoría</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {similar.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      onOpen={(proj) =>
                        router.push(
                          `/security/project/${proj.id}?owner=${encodeURIComponent(proj.fullName)}`,
                        )
                      }
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative mt-12 bg-gray-950 border-t border-gray-800">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-[11px] text-gray-600">
            ⚠️ Herramienta open source con fines educativos. Úsala de forma ética y solo donde tengas permiso.
          </p>
        </div>
      </footer>
    </div>
  );
}
