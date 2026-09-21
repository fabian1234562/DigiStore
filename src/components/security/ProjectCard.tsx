'use client';

import { useState, useMemo } from 'react';
import { Star, GitFork, Calendar, ExternalLink, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SecurityProject } from '@/app/api/security/search/route';

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

/**
 * Genera un SVG data URL como fallback visual cuando no hay imagen disponible.
 * El SVG muestra el nombre del proyecto, autor y un emoji según categoría.
 */
function generateFallbackSvg(project: SecurityProject): string {
  const initials = project.name
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');

  // Color base derivado del nombre (hash simple → hue)
  const hash = project.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = hash % 360;
  const bg1 = `hsl(${hue}, 60%, 25%)`;
  const bg2 = `hsl(${(hue + 40) % 360}, 60%, 15%)`;
  const accent = `hsl(${hue}, 80%, 60%)`;

  const safeName = project.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').slice(0, 28);
  const safeAuthor = project.fullName.split('/')[0]
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .slice(0, 24);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="600" height="360" fill="url(#bg)"/>
  <rect width="600" height="360" fill="url(#grid)"/>
  <circle cx="300" cy="140" r="60" fill="rgba(255,255,255,0.08)" stroke="${accent}" stroke-width="2"/>
  <text x="300" y="160" font-family="monospace" font-size="44" font-weight="bold" fill="${accent}" text-anchor="middle">${initials}</text>
  <text x="300" y="240" font-family="sans-serif" font-size="28" font-weight="bold" fill="white" text-anchor="middle">${safeName}</text>
  <text x="300" y="275" font-family="monospace" font-size="16" fill="rgba(255,255,255,0.7)" text-anchor="middle">@${safeAuthor}</text>
  <rect x="20" y="20" width="80" height="22" rx="11" fill="rgba(255,255,255,0.12)"/>
  <text x="60" y="35" font-family="monospace" font-size="11" fill="rgba(255,255,255,0.85)" text-anchor="middle">SECURITY</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

interface ProjectCardProps {
  project: SecurityProject;
  onOpen?: (project: SecurityProject) => void;
}

export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const activity = useMemo(
    () => getActivityStatus(project.lastUpdate, project.archived),
    [project.lastUpdate, project.archived],
  );

  const langColor = useMemo(() => getLanguageColor(project.language), [project.language]);

  // Imagen: intentamos owner avatar grande, si falla generamos SVG card.
  const avatarUrl = `${project.ownerAvatar}&s=600`;
  const fallbackSvg = useMemo(() => generateFallbackSvg(project), [project]);

  const handleClick = () => {
    if (onOpen) onOpen(project);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

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
        {!avatarError && !imgError ? (
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
        ) : (
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

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2 pointer-events-none">
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md',
              activity.className,
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', activity.dot)} />
            {activity.label}
          </span>
          {project.stars >= 10000 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border bg-amber-500/20 text-amber-300 border-amber-500/40 backdrop-blur-md">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              Top
            </span>
          )}
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
            Ver proyecto
          </button>
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
            GitHub
          </a>
        </div>
      </div>
    </article>
  );
}

export default ProjectCard;
