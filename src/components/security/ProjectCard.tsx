'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Star, GitFork, Calendar, ExternalLink, BookOpen,
  Download, Loader2, CheckCircle2, Package, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SecurityProject } from '@/app/api/security/search/route';
import {
  getCategoryImage,
  getCategoryLabel,
  getCategoryEmoji,
} from '@/lib/security-images';

/**
 * Mapa de colores por lenguaje de programación (subconjunto de GitHub colors).
 * Si un lenguaje no está aquí, se usa un color gris neutro.
 */
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
  Scala: '#c22d40',
  Lua: '#000080',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
  Clojure: '#db5855',
  Perl: '#0298c3',
  R: '#198CE7',
  Julia: '#a270Ba',
  Zig: '#ec915c',
  Nim: '#37775b',
  PowerShell: '#012456',
  Dockerfile: '#384d54',
  Makefile: '#427819',
  Jupyter: '#DA5B0B',
};

function getLanguageColor(lang: string | null): string {
  if (!lang) return '#71717a';
  return LANGUAGE_COLORS[lang] || '#71717a';
}

interface ActivityStatus {
  label: string;
  className: string;
  dot: string;
}

function getActivityStatus(lastUpdate: string, archived: boolean): ActivityStatus {
  if (archived) {
    return {
      label: 'Archivado',
      className: 'bg-gray-800/80 text-gray-300 border-gray-700',
      dot: 'bg-gray-400',
    };
  }
  const days = (Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24);
  if (days <= 30) {
    return {
      label: 'Activo',
      className: 'bg-emerald-950/60 text-emerald-300 border-emerald-800',
      dot: 'bg-emerald-400',
    };
  }
  if (days <= 180) {
    return {
      label: 'Actualizado reciente',
      className: 'bg-sky-950/60 text-sky-300 border-sky-800',
      dot: 'bg-sky-400',
    };
  }
  if (days <= 365) {
    return {
      label: 'Mantenido',
      className: 'bg-amber-950/60 text-amber-300 border-amber-800',
      dot: 'bg-amber-400',
    };
  }
  return {
    label: 'Inactivo',
    className: 'bg-gray-800/60 text-gray-400 border-gray-700',
    dot: 'bg-gray-500',
  };
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

function timeAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (days < 1) return 'hoy';
  if (days < 30) return `hace ${days}d`;
  if (days < 365) return `hace ${Math.floor(days / 30)}m`;
  return `hace ${Math.floor(days / 365)}a`;
}

/* ══════════════════════════════════════════════════════════════
   LICENSE STATUS — best-effort detection from license name string.
   The server uses the authoritative SPDX key in /api/security/analyze.
   ══════════════════════════════════════════════════════════════ */
interface LicenseBadge {
  emoji: string;
  label: string;
  className: string;
}

function detectLicenseBadge(licenseName: string | null): LicenseBadge {
  if (!licenseName) {
    return {
      emoji: '🔴',
      label: 'Sin licencia',
      className: 'bg-red-950/70 text-red-300 border-red-800',
    };
  }
  const n = licenseName.toLowerCase();

  // Permissive
  if (
    /^(\bmit\b|apache|bsd|isc|unlicense|0bsd|cc0|zlib|boost|wtfpl|gpl|gnu general public)/.test(
      n,
    ) ||
    n.includes('gnu general public license') ||
    n === 'gpl-2.0' ||
    n === 'gpl-3.0'
  ) {
    return {
      emoji: '🟢',
      label: 'Redistribuible',
      className: 'bg-emerald-950/70 text-emerald-300 border-emerald-800',
    };
  }
  // Review
  if (/lgpl|mpl|agpl|epl|cddl|eupl|cc-by|cc by|artistic|polyform/.test(n)) {
    return {
      emoji: '🟡',
      label: 'Revisar',
      className: 'bg-amber-950/70 text-amber-300 border-amber-800',
    };
  }
  // Unknown / forbidden
  return {
    emoji: '🔴',
    label: 'No distribuir',
    className: 'bg-red-950/70 text-red-300 border-red-800',
  };
}

/**
 * Genera un SVG data URL PREMIUM como fallback visual.
 * Diseño: gradiente + grid + glow + icono de escudo/candado + nombre grande.
 */
function generateFallbackSvg(project: SecurityProject): string {
  const initials = project.name
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');

  const hash = project.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = hash % 360;
  const bg1 = `hsl(${hue}, 70%, 20%)`;
  const bg2 = `hsl(${(hue + 40) % 360}, 70%, 10%)`;
  const accent = `hsl(${hue}, 90%, 65%)`;
  const accentDim = `hsl(${hue}, 60%, 40%)`;

  const topics = (project.topics || []).join(' ').toLowerCase();
  let emoji = '🛡';
  if (topics.includes('osint')) emoji = '🔍';
  else if (topics.includes('ctf')) emoji = '🎯';
  else if (topics.includes('pentest') || topics.includes('red-team')) emoji = '🔴';
  else if (topics.includes('forensic')) emoji = '🔬';
  else if (topics.includes('crypto')) emoji = '🔐';
  else if (topics.includes('network')) emoji = '📡';
  else if (topics.includes('web') || topics.includes('bug-bounty')) emoji = '🌐';
  else if (topics.includes('malware')) emoji = '🧪';
  else if (topics.includes('wireless') || topics.includes('wifi')) emoji = '📶';
  else if (topics.includes('cloud')) emoji = '☁';
  else if (topics.includes('automation')) emoji = '🤖';
  else if (topics.includes('reverse')) emoji = '🧠';
  else if (topics.includes('privacy')) emoji = '⚫';

  const safeName = project.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').slice(0, 28);
  const safeAuthor = project.fullName.split('/')[0]
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .slice(0, 24);
  const safeLang = (project.language || 'Code').replace(/&/g, '&amp;').slice(0, 20);
  const starsStr = project.stars >= 1000 ? `${(project.stars / 1000).toFixed(0)}K★` : `${project.stars}★`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    </pattern>
    <pattern id="diag" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="20" height="10" fill="rgba(255,255,255,0.025)"/>
    </pattern>
    <radialGradient id="glow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="600" height="360" fill="url(#bg)"/>
  <rect width="600" height="360" fill="url(#grid)"/>
  <rect width="600" height="360" fill="url(#diag)"/>
  <rect width="600" height="360" fill="url(#glow)"/>
  <circle cx="300" cy="120" r="80" fill="rgba(255,255,255,0.06)" stroke="${accentDim}" stroke-width="2"/>
  <text x="300" y="100" font-size="60" text-anchor="middle">${emoji}</text>
  <text x="300" y="150" font-family="monospace" font-size="32" font-weight="bold" fill="${accent}" text-anchor="middle">${initials}</text>
  <text x="300" y="230" font-family="sans-serif" font-size="30" font-weight="800" fill="white" text-anchor="middle">${safeName}</text>
  <text x="300" y="260" font-family="monospace" font-size="16" fill="rgba(255,255,255,0.6)" text-anchor="middle">@${safeAuthor}</text>
  <rect x="200" y="280" width="200" height="28" rx="14" fill="rgba(255,255,255,0.08)" stroke="${accentDim}" stroke-width="1"/>
  <text x="300" y="299" font-family="monospace" font-size="13" fill="rgba(255,255,255,0.7)" text-anchor="middle">${safeLang} · ⭐ ${starsStr}</text>
  <rect x="20" y="20" width="90" height="24" rx="12" fill="${accent}" fill-opacity="0.2" stroke="${accentDim}" stroke-width="1"/>
  <text x="65" y="36" font-family="monospace" font-size="11" font-weight="700" fill="${accent}" text-anchor="middle">SECURITY</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

interface ProjectCardProps {
  project: SecurityProject;
  onOpen?: (project: SecurityProject) => void;
  /** True if this project has been imported into the DigiStore catalog */
  imported?: boolean;
  /** Notifies parent when import status changes (so parent can refresh catalog) */
  onImportedChange?: (repo: string, imported: boolean) => void;
}

type ImportState = 'idle' | 'loading' | 'success' | 'error';

export function ProjectCard({ project, onOpen, imported = false, onImportedChange }: ProjectCardProps) {
  // Image fallback chain:
  //   1. GitHub OpenGraph (best — shows repo README banner)
  //   2. Category-themed local image (real photo, eye-catching)
  //   3. Owner avatar (zoomed-in)
  //   4. Generated SVG (last resort)
  const [ogError, setOgError] = useState(false);
  const [catError, setCatError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const [importState, setImportState] = useState<ImportState>('idle');
  const [importMessage, setImportMessage] = useState<string>('');
  const [localImported, setLocalImported] = useState<boolean>(imported);

  const activity = useMemo(
    () => getActivityStatus(project.lastUpdate, project.archived),
    [project.lastUpdate, project.archived],
  );

  const langColor = useMemo(() => getLanguageColor(project.language), [project.language]);
  const licenseBadge = useMemo(() => detectLicenseBadge(project.license), [project.license]);

  const ogUrl = project.ogImage || `https://opengraph.githubassets.com/1/${project.fullName}`;
  const avatarUrl = `${project.ownerAvatar}&s=600`;
  const categoryImageUrl = getCategoryImage(project.category);
  const categoryLabel = getCategoryLabel(project.category);
  const categoryEmoji = getCategoryEmoji(project.category);
  const fallbackSvg = useMemo(() => generateFallbackSvg(project), [project]);

  // Show in priority order
  const showOg      = !ogError;
  const showCat     = ogError && !catError;
  const showAvatar  = ogError && catError && !avatarError;
  const showFallback = ogError && catError && avatarError;

  const isImported = localImported;

  const handleClick = () => {
    if (onOpen) onOpen(project);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  /* ── Import handler ── */
  const handleImport = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (importState === 'loading' || isImported) return;
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
          setLocalImported(true);
          setImportMessage(data.message || 'Importado correctamente.');
          onImportedChange?.(project.fullName, true);
        } else {
          setImportState('error');
          setImportMessage(data.error || data.detail || 'No se pudo importar.');
        }
      } catch (err) {
        setImportState('error');
        setImportMessage(err instanceof Error ? err.message : 'Error de red.');
      }
    },
    [importState, isImported, project.fullName, onImportedChange],
  );

  /* ── Download handler — fetch the ZIP and trigger a browser download ── */
  const handleDownload = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isImported) return;
      // Find the project id from the catalog API. Since the search ProjectCard
      // only knows the repo slug, we look it up there.
      try {
        const catRes = await fetch(
          `/api/security/catalog?q=${encodeURIComponent(project.fullName)}`,
          { cache: 'no-store' },
        );
        const catData = await catRes.json();
        const found = (catData.projects || []).find(
          (p: { repo: string }) => p.repo === project.fullName.toLowerCase(),
        );
        if (!found) {
          setImportMessage('Proyecto no encontrado en el catálogo.');
          setImportState('error');
          return;
        }
        // Trigger ZIP download via direct browser navigation
        window.location.href = `/api/security/download/${found.id}`;
      } catch (err) {
        setImportMessage(err instanceof Error ? err.message : 'Error al descargar.');
        setImportState('error');
      }
    },
    [isImported, project.fullName],
  );

  return (
    <article
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="article"
      tabIndex={0}
      className={cn(
        'group relative bg-gray-900/80 rounded-2xl overflow-hidden border border-gray-800',
        'hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/10',
        'transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col',
        'focus:outline-none focus:ring-2 focus:ring-violet-500/50',
      )}
    >
      {/* Preview image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-950">
        {showOg && (
          <img
            src={ogUrl}
            alt={`Preview de ${project.name}`}
            width={600}
            height={375}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setOgError(true)}
          />
        )}
        {showCat && (
          <img
            src={categoryImageUrl}
            alt={`${categoryLabel} — ${project.name}`}
            width={600}
            height={375}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setCatError(true)}
          />
        )}
        {showAvatar && (
          <img
            src={avatarUrl}
            alt={`Avatar de ${project.fullName}`}
            width={600}
            height={375}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setAvatarError(true)}
          />
        )}
        {showFallback && (
          <img
            src={fallbackSvg}
            alt={`Tarjeta de ${project.name}`}
            width={600}
            height={375}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent pointer-events-none" />

        {/* Top badges: activity + license */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2 pointer-events-none">
          <div className="flex flex-col items-start gap-1">
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md',
                activity.className,
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full', activity.dot)} />
              {activity.label}
            </span>
            <span
              title={`Categoría: ${categoryLabel}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-violet-500/20 text-violet-200 border-violet-400/50 backdrop-blur-md"
            >
              <span aria-hidden="true">{categoryEmoji}</span>
              <span className="hidden sm:inline">{categoryLabel}</span>
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            {project.stars >= 10000 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border bg-amber-500/20 text-amber-300 border-amber-500/40 backdrop-blur-md">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                Top
              </span>
            )}
            {/* License badge */}
            <span
              title={`${project.license || 'Sin licencia'} — ${licenseBadge.label}`}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md',
                licenseBadge.className,
              )}
            >
              <span aria-hidden="true">{licenseBadge.emoji}</span>
              <span className="hidden sm:inline">{licenseBadge.label}</span>
            </span>
            {isImported && (
              <span
                title="Importado en DigiStore"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border bg-violet-500/30 text-violet-200 border-violet-400/50 backdrop-blur-md"
              >
                <Package className="w-2.5 h-2.5" />
                Importado
              </span>
            )}
          </div>
        </div>

        {/* Author + language at bottom of image */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <img
              src={project.ownerAvatar}
              alt=""
              width={20}
              height={20}
              className="w-5 h-5 rounded-full ring-2 ring-gray-900/50 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="text-[11px] text-gray-300 font-medium truncate max-w-[140px]">
              {project.fullName.split('/')[0]}
            </span>
          </div>
          {project.language && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-900/80 text-gray-200 border border-gray-700 backdrop-blur-md">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: langColor }}
                aria-hidden="true"
              />
              {project.language}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5 flex flex-col gap-2.5 flex-1">
        <h3 className="font-bold text-sm text-white line-clamp-1 leading-tight group-hover:text-violet-300 transition-colors">
          {project.name}
        </h3>
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed flex-1">
          {project.description}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-1">
          <span className="inline-flex items-center gap-1 font-medium" title={`${project.stars} estrellas`}>
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            {formatNumber(project.stars)}
          </span>
          <span className="inline-flex items-center gap-1 font-medium" title={`${project.forks} forks`}>
            <GitFork className="w-3 h-3 text-gray-500" />
            {formatNumber(project.forks)}
          </span>
          <span className="inline-flex items-center gap-1 font-medium" title={new Date(project.lastUpdate).toLocaleString()}>
            <Calendar className="w-3 h-3 text-gray-500" />
            {timeAgo(project.lastUpdate)}
          </span>
          {project.license && (
            <span
              className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 bg-gray-800/60 border border-gray-700 px-1.5 py-0.5 rounded-md max-w-[120px] truncate"
              title={project.license}
            >
              <BookOpen className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">{project.license}</span>
            </span>
          )}
        </div>

        {/* Import status / message */}
        {importState === 'error' && importMessage && (
          <div className="flex items-start gap-1.5 text-[10px] text-red-300 bg-red-950/40 border border-red-900/60 rounded-lg px-2 py-1.5">
            <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{importMessage}</span>
          </div>
        )}
        {importState === 'success' && importMessage && (
          <div className="flex items-start gap-1.5 text-[10px] text-emerald-300 bg-emerald-950/40 border border-emerald-900/60 rounded-lg px-2 py-1.5">
            <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{importMessage}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2 mt-1 border-t border-gray-800">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 border border-violet-600/40 transition-colors"
            aria-label={`Ver proyecto ${project.name}`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Ver
          </button>

          {isImported ? (
            <button
              onClick={handleDownload}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 transition-colors"
              aria-label={`Descargar ${project.name}`}
              title="Descargar ZIP desde DigiStore"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar
            </button>
          ) : (
            <button
              onClick={handleImport}
              disabled={importState === 'loading'}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg bg-fuchsia-600/30 hover:bg-fuchsia-600/50 text-fuchsia-200 border border-fuchsia-500/40 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label={`Importar ${project.name} a DigiStore`}
              title="Importar a DigiStore (requiere licencia redistribuible)"
            >
              {importState === 'loading' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Importando…
                </>
              ) : importState === 'success' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Importado
                </>
              ) : (
                <>
                  <Package className="w-3.5 h-3.5" />
                  Importar
                </>
              )}
            </button>
          )}

          <a
            href={project.url}
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

export default ProjectCard;
