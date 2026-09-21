'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft, Star, GitFork, AlertCircle, Calendar, Scale,
  ExternalLink, BookOpen, Bookmark, BookmarkCheck, Loader2,
  ShieldCheck, Tag, Globe, Activity, Download, Package,
  AlertTriangle, CheckCircle2, FileText, Code2, Clock,
} from 'lucide-react';
import { ProjectCard } from '@/components/security/ProjectCard';
import type { SecurityProject } from '@/app/api/security/search/route';
import { cn } from '@/lib/utils';

const SharedHeader = dynamic(
  () => import('@/components/store/SharedHeader').then((m) => ({ default: m.SharedHeader })),
  { ssr: false },
);

const SAVED_KEY = 'digistore-security-saved';

interface AnalyzeResult {
  repo: string;
  name: string;
  description: string;
  author: string;
  license: {
    key: string | null;
    name: string | null;
    status: 'permissive' | 'review' | 'forbidden';
    label: string;
    emoji: string;
    canRedistribute: boolean;
  };
  stars: number;
  forks: number;
  openIssues: number;
  language: string | null;
  lastUpdate: string;
  createdAt: string;
  topics: string[];
  readmeContent: string;
  releaseVersion: string | null;
  fileSize: number;
  fileCount: number;
  archived: boolean;
  homepage: string | null;
  repoUrl: string;
  ownerAvatar: string;
  imageUrl: string;
  category: string;
}

function loadSaved(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch { return {}; }
}
function persistSaved(map: Record<string, boolean>) {
  try { window.localStorage.setItem(SAVED_KEY, JSON.stringify(map)); } catch { /* ignore */ }
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}
function formatBytes(bytes: number): string {
  if (!bytes || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
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
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', Go: '#00ADD8',
  Rust: '#dea584', Java: '#b07219', Kotlin: '#A97BFF', C: '#555555',
  'C++': '#f34b7d', 'C#': '#178600', Ruby: '#701516', PHP: '#4F5D95',
  Swift: '#F05138', Shell: '#89e051', HTML: '#e34c26', CSS: '#563d7c',
  Vue: '#41b883', Dart: '#00B4AB', Lua: '#000080',
};

function generateHeroSvg(name: string, fullName: string): string {
  const initials = name.replace(/[^a-zA-Z0-9]/g, ' ').trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('');
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = hash % 360;
  const bg1 = `hsl(${hue}, 60%, 25%)`;
  const bg2 = `hsl(${(hue + 40) % 360}, 60%, 12%)`;
  const accent = `hsl(${hue}, 80%, 60%)`;
  const safeName = name.replace(/&/g, '&amp;').replace(/</g, '&lt;').slice(0, 32);
  const safeAuthor = (fullName.split('/')[0] || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').slice(0, 28);
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
  const isImportedFlag = searchParams?.get('imported') === '1';

  const [project, setProject] = useState<SecurityProject | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null);
  const [similar, setSimilar] = useState<SecurityProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Imported project id (catalog id, e.g. "ds-owner-repo") — needed for download
  const [importedProjectId, setImportedProjectId] = useState<string | null>(null);
  const [importState, setImportState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState<string>('');

  const [ogError, setOgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});

  /* ── Load project (basic) + similar ── */
  const loadProject = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL('/api/security/project', window.location.origin);
      if (owner) url.searchParams.set('owner', owner);
      else if (id) url.searchParams.set('id', id);
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`);
      setProject(data.project);
      setSimilar(data.similar || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [id, owner]);

  /* ── Load analysis (README + license + release + contents) ── */
  const loadAnalysis = useCallback(async (repoSlug: string) => {
    setAnalysisLoading(true);
    try {
      const res = await fetch('/api/security/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ repo: repoSlug }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAnalysis(data.analysis);
      }
      // If analysis fails, we just don't show README — not a fatal error
    } catch {
      // ignore
    } finally {
      setAnalysisLoading(false);
    }
  }, []);

  /* ── Check if this project is already imported (look up catalog id) ── */
  const checkImported = useCallback(async (repoSlug: string) => {
    try {
      const res = await fetch(`/api/security/catalog?q=${encodeURIComponent(repoSlug)}`, { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.success) {
        const found = (data.projects || []).find((p: { repo: string }) => p.repo === repoSlug.toLowerCase());
        if (found) setImportedProjectId(found.id);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadProject(); }, [loadProject]);

  useEffect(() => {
    if (project) {
      loadAnalysis(project.fullName);
      checkImported(project.fullName);
    }
  }, [project, loadAnalysis, checkImported]);

  useEffect(() => { setSavedMap(loadSaved()); }, []);

  const isSaved = project ? !!savedMap[project.id] : false;
  const toggleSave = useCallback(() => {
    if (!project) return;
    setSavedMap((prev) => {
      const next = { ...prev, [project.id]: !prev[project.id] };
      persistSaved(next);
      return next;
    });
  }, [project]);

  /* ── Import handler ── */
  const handleImport = useCallback(async () => {
    if (!project || importState === 'loading' || importedProjectId) return;
    setImportState('loading');
    setImportMessage('');
    try {
      const res = await fetch('/api/security/import', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ repo: project.fullName }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setImportState('success');
        setImportMessage(data.message || 'Importado correctamente.');
        setImportedProjectId(data.projectId || null);
        checkImported(project.fullName);
      } else {
        setImportState('error');
        setImportMessage(data.error || data.detail || 'No se pudo importar.');
      }
    } catch (err) {
      setImportState('error');
      setImportMessage(err instanceof Error ? err.message : 'Error de red.');
    }
  }, [project, importState, importedProjectId, checkImported]);

  /* ── Download handler ── */
  const handleDownload = useCallback(() => {
    if (!importedProjectId) return;
    window.location.href = `/api/security/download/${importedProjectId}`;
  }, [importedProjectId]);

  /* ── Scroll to README ── */
  const scrollToReadme = useCallback(() => {
    document.getElementById('readme-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  /* ── Hero image (Open Graph → avatar → SVG) ── */
  const heroImg = useMemo(() => {
    if (!project) return '';
    if (!ogError) {
      return `https://opengraph.githubassets.com/1/${project.fullName}`;
    }
    if (!avatarError) return `${project.ownerAvatar}&s=1200`;
    return generateHeroSvg(project.name, project.fullName);
  }, [project, ogError, avatarError]);

  /* ── License info (prefer analysis, fall back to project.license) ── */
  const licenseInfo = useMemo(() => {
    if (analysis?.license) {
      return {
        name: analysis.license.name || 'Sin licencia',
        status: analysis.license.status,
        label: analysis.license.label,
        emoji: analysis.license.emoji,
        canRedistribute: analysis.license.canRedistribute,
      };
    }
    // Fallback: derive from project.license name string
    const name = project?.license || null;
    if (!name) {
      return { name: 'Sin licencia', status: 'forbidden' as const, label: 'No distribuir', emoji: '🔴', canRedistribute: false };
    }
    const n = name.toLowerCase();
    if (/^(\bmit\b|apache|bsd|isc|unlicense|0bsd|cc0|zlib|boost|wtfpl|gpl|gnu general public)/.test(n) || n.includes('gnu general public license')) {
      return { name, status: 'permissive' as const, label: 'Redistribución permitida', emoji: '🟢', canRedistribute: true };
    }
    if (/lgpl|mpl|agpl|epl|cddl|eupl|cc-by|cc by|artistic|polyform/.test(n)) {
      return { name, status: 'review' as const, label: 'Revisar condiciones', emoji: '🟡', canRedistribute: false };
    }
    return { name, status: 'forbidden' as const, label: 'No distribuir', emoji: '🔴', canRedistribute: false };
  }, [analysis, project]);

  const licenseBadgeClass =
    licenseInfo.status === 'permissive'
      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
      : licenseInfo.status === 'review'
        ? 'bg-amber-950/60 text-amber-300 border-amber-800'
        : 'bg-red-950/60 text-red-300 border-red-800';

  /* ── README markdown components (sanitized — no raw HTML, no scripts) ── */
  const markdownComponents = useMemo(() => ({
    a: ({ node, href, children, ...props }: { node?: unknown; href?: string; children?: React.ReactNode } & Record<string, unknown>) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-violet-400 hover:text-violet-300 underline underline-offset-2"
        {...props}
      >
        {children}
      </a>
    ),
    img: ({ node, src, alt, ...props }: { node?: unknown; src?: string; alt?: string } & Record<string, unknown>) => {
      let imgSrc = src || '';
      // Convert relative paths to raw.githubusercontent.com URLs
      if (typeof src === 'string' && !src.startsWith('http') && project) {
        const cleaned = src.replace(/^\.?\//, '');
        imgSrc = `https://raw.githubusercontent.com/${project.fullName}/HEAD/${cleaned}`;
      }
      return (
        <img
          src={imgSrc}
          alt={alt || ''}
          loading="lazy"
          className="max-w-full h-auto rounded-lg border border-gray-800 my-3"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          {...props}
        />
      );
    },
    h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-2xl font-extrabold text-white mt-6 mb-3">{children}</h1>,
    h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-xl font-bold text-white mt-5 mb-2 pb-1 border-b border-gray-800">{children}</h2>,
    h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-lg font-bold text-gray-100 mt-4 mb-2">{children}</h3>,
    h4: ({ children }: { children?: React.ReactNode }) => <h4 className="text-base font-bold text-gray-200 mt-3 mb-1.5">{children}</h4>,
    p: ({ children }: { children?: React.ReactNode }) => <p className="text-sm text-gray-300 leading-relaxed my-2">{children}</p>,
    ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc list-inside text-sm text-gray-300 my-2 space-y-1">{children}</ul>,
    ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal list-inside text-sm text-gray-300 my-2 space-y-1">{children}</ol>,
    li: ({ children }: { children?: React.ReactNode }) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-4 border-violet-500/50 pl-4 my-3 text-sm text-gray-400 italic bg-gray-900/40 py-2 rounded-r-lg">{children}</blockquote>
    ),
    code: ({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode } & Record<string, unknown>) => {
      // react-markdown v10 may not pass `inline` — fall back to content-based detection
      const content = Array.isArray(children) ? children.join('') : String(children ?? '');
      const isBlock = !inline && (content.includes('\n') || (!!className && className.includes('language-')));
      if (isBlock) {
        return (
          <code className={`block text-cyan-200 text-xs font-mono ${className || ''}`} {...props}>
            {children}
          </code>
        );
      }
      return (
        <code className="px-1.5 py-0.5 rounded bg-gray-800 text-violet-300 text-[0.85em] font-mono" {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children }: { children?: React.ReactNode }) => (
      <pre className="overflow-x-auto my-3 p-4 rounded-lg bg-gray-950 border border-gray-800">{children}</pre>
    ),
    table: ({ children }: { children?: React.ReactNode }) => (
      <div className="overflow-x-auto my-3"><table className="w-full text-sm border border-gray-800 rounded-lg overflow-hidden">{children}</table></div>
    ),
    thead: ({ children }: { children?: React.ReactNode }) => <thead className="bg-gray-900">{children}</thead>,
    th: ({ children }: { children?: React.ReactNode }) => <th className="border border-gray-800 px-3 py-2 text-left text-gray-200 font-bold">{children}</th>,
    td: ({ children }: { children?: React.ReactNode }) => <td className="border border-gray-800 px-3 py-2 text-gray-300">{children}</td>,
    hr: () => <hr className="border-gray-800 my-5" />,
    input: ({ checked, ...props }: { checked?: boolean } & Record<string, unknown>) => (
      <input type="checkbox" checked={checked} readOnly className="mr-2 accent-violet-500" {...props} />
    ),
  }), [project]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
      <SharedHeader activePage="security" />

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
              <button onClick={loadProject} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors">Reintentar</button>
              <Link href="/security" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-semibold transition-colors">Volver</Link>
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
                alt={`Preview de ${project.name}`}
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => { if (!ogError) setOgError(true); else setAvatarError(true); }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 bg-violet-500/20 border border-violet-500/40 text-violet-200 text-[10px] font-bold px-2 py-1 rounded-full mb-2 backdrop-blur-md">
                    <ShieldCheck className="w-3 h-3" /> Open Source · Security
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{project.name}</h1>
                  <p className="text-sm text-gray-300 font-mono mt-1">{project.fullName}</p>
                </div>
                {analysis?.releaseVersion && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-xs font-bold backdrop-blur-md shrink-0">
                    <Tag className="w-3 h-3" /> {analysis.releaseVersion}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
              {/* Download (only if imported + license allows) OR Import button */}
              {importedProjectId ? (
                licenseInfo.canRedistribute ? (
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <Download className="w-4 h-4" /> Descargar
                  </button>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed"
                    title="La licencia no permite redistribución"
                  >
                    <AlertTriangle className="w-4 h-4" /> Sin descarga
                  </button>
                )
              ) : (
                <button
                  onClick={handleImport}
                  disabled={importState === 'loading'}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-700 hover:to-violet-700 text-white transition-all shadow-lg shadow-fuchsia-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {importState === 'loading' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Importando…</>
                  ) : importState === 'success' ? (
                    <><CheckCircle2 className="w-4 h-4" /> Importado</>
                  ) : (
                    <><Package className="w-4 h-4" /> Importar a DigiStore</>
                  )}
                </button>
              )}

              <button
                onClick={scrollToReadme}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-800 transition-colors"
              >
                <BookOpen className="w-4 h-4" /> Documentación
              </button>

              <button
                onClick={toggleSave}
                className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isSaved
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-gray-900 text-gray-200 border border-gray-800 hover:border-amber-500/40 hover:text-amber-300'
                }`}
                aria-pressed={isSaved}
              >
                {isSaved ? <><BookmarkCheck className="w-4 h-4" /> Guardado</> : <><Bookmark className="w-4 h-4" /> Guardar</>}
              </button>

              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-800 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Repositorio
              </a>
            </div>

            {/* Import status message */}
            {importState !== 'idle' && importMessage && (
              <div className={cn(
                'mb-6 rounded-xl px-4 py-3 text-sm flex items-start gap-2 border',
                importState === 'success'
                  ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-200'
                  : importState === 'error'
                    ? 'bg-red-950/40 border-red-900/60 text-red-200'
                    : 'bg-gray-900/60 border-gray-800 text-gray-300',
              )}>
                {importState === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                <span>{importMessage}</span>
              </div>
            )}

            {/* License banner */}
            <div className={cn('rounded-2xl border p-4 mb-6 flex items-start gap-3', licenseBadgeClass)}>
              <span className="text-2xl shrink-0" aria-hidden="true">{licenseInfo.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">
                  {licenseInfo.emoji} {licenseInfo.label}
                </p>
                <p className="text-xs opacity-80 mt-0.5">
                  Licencia detectada: <strong className="font-mono">{licenseInfo.name}</strong>
                  {licenseInfo.canRedistribute
                    ? ' — DigiStore puede redistribuir este proyecto.'
                    : licenseInfo.status === 'review'
                      ? ' — Revisa los términos antes de distribuir.'
                      : ' — No se puede distribuir automáticamente.'}
                </p>
              </div>
              <a
                href={`https://choosealicense.com/licenses/${licenseInfo.name?.toLowerCase().replace(/\s/g, '-')}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold underline underline-offset-2 hover:opacity-80 shrink-0"
              >
                Ver términos
              </a>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-1"><Star className="w-3.5 h-3.5 fill-amber-400" /> Stars</div>
                <div className="text-xl font-bold text-white">{formatNumber(project.stars)}</div>
              </div>
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold mb-1"><GitFork className="w-3.5 h-3.5" /> Forks</div>
                <div className="text-xl font-bold text-white">{formatNumber(project.forks)}</div>
              </div>
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold mb-1"><AlertCircle className="w-3.5 h-3.5" /> Issues</div>
                <div className="text-xl font-bold text-white">{formatNumber(project.openIssues)}</div>
              </div>
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1"><Activity className="w-3.5 h-3.5" /> Estado</div>
                <div className="text-xl font-bold text-white">{project.archived ? 'Archivado' : 'Activo'}</div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 mb-6">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Descripción</h2>
              <p className="text-gray-200 leading-relaxed text-sm sm:text-base">{project.description}</p>
            </div>

            {/* Meta info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-3 bg-gray-900/40 border border-gray-800 rounded-xl p-4">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: LANGUAGE_COLORS[project.language || ''] || '#71717a' }} />
                <div className="min-w-0"><div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Lenguaje</div><div className="text-sm font-bold text-white truncate">{project.language || 'No especificado'}</div></div>
              </div>
              <div className="flex items-center gap-3 bg-gray-900/40 border border-gray-800 rounded-xl p-4">
                <Scale className="w-4 h-4 text-violet-400 shrink-0" />
                <div className="min-w-0"><div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Licencia</div><div className="text-sm font-bold text-white truncate">{licenseInfo.name}</div></div>
              </div>
              <div className="flex items-center gap-3 bg-gray-900/40 border border-gray-800 rounded-xl p-4">
                <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
                <div className="min-w-0"><div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Última actualización</div><div className="text-sm font-bold text-white truncate">{timeAgo(project.lastUpdate)}</div></div>
              </div>
              <div className="flex items-center gap-3 bg-gray-900/40 border border-gray-800 rounded-xl p-4">
                <Tag className="w-4 h-4 text-fuchsia-400 shrink-0" />
                <div className="min-w-0"><div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Categoría</div><div className="text-sm font-bold text-white truncate capitalize">{project.category.replace(/-/g, ' ')}</div></div>
              </div>
              {analysis && (
                <>
                  <div className="flex items-center gap-3 bg-gray-900/40 border border-gray-800 rounded-xl p-4">
                    <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="min-w-0"><div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Archivos (raíz)</div><div className="text-sm font-bold text-white truncate">{analysis.fileCount}</div></div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-900/40 border border-gray-800 rounded-xl p-4">
                    <Code2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="min-w-0"><div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Tamaño aprox.</div><div className="text-sm font-bold text-white truncate">{formatBytes(analysis.fileSize)}</div></div>
                  </div>
                </>
              )}
              {project.homepage && (
                <div className="flex items-center gap-3 bg-gray-900/40 border border-gray-800 rounded-xl p-4">
                  <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                  <a href={project.homepage} target="_blank" rel="noopener noreferrer" className="min-w-0 hover:text-blue-300 transition-colors">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Homepage</div>
                    <div className="text-sm font-bold text-white truncate underline underline-offset-2">{project.homepage.replace(/^https?:\/\//, '')}</div>
                  </a>
                </div>
              )}
              {analysis?.createdAt && (
                <div className="flex items-center gap-3 bg-gray-900/40 border border-gray-800 rounded-xl p-4">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="min-w-0"><div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Creado</div><div className="text-sm font-bold text-white truncate">{timeAgo(analysis.createdAt)}</div></div>
                </div>
              )}
            </div>

            {/* Topics */}
            {project.topics.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Topics</h2>
                <div className="flex flex-wrap gap-2">
                  {project.topics.map((t) => (
                    <span key={t} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-500/10 border border-violet-500/30 text-violet-300">#{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* README section */}
            <section id="readme-section" className="mb-10 scroll-mt-20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-xl shrink-0">📖</div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-violet-300 leading-tight">README.md</h2>
                  <p className="text-xs text-gray-500">Documentación del proyecto (renderizada, sin ejecución de código)</p>
                </div>
              </div>
              <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 sm:p-6">
                {analysisLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-400 py-6 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" /> Cargando README desde GitHub…
                  </div>
                ) : analysis?.readmeContent ? (
                  <div className="max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {analysis.readmeContent}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm font-semibold">Sin README disponible</p>
                    <p className="text-gray-500 text-xs mt-1">Este repositorio no tiene un archivo README, o no se pudo cargar.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Similar projects */}
            {similar.length > 0 && (
              <section className="mt-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-xl">🔗</div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-fuchsia-300 leading-tight">Proyectos similares</h2>
                    <p className="text-xs text-gray-500">Otros proyectos de la misma categoría</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {similar.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      onOpen={(proj) => router.push(`/security/project/${proj.id}?owner=${encodeURIComponent(proj.fullName)}`)}
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
            DigiStore solo redistribuye ZIPs de proyectos con licencias permisivas — no se ejecuta ni modifica el código original.
          </p>
        </div>
      </footer>
    </div>
  );
}
