'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck, Lock, Loader2, ExternalLink, Star, GitFork,
  Package, AlertTriangle, CheckCircle2, X, RefreshCw, Search as SearchIcon,
  Scale, Calendar, FileText, Trash2, Eye, EyeOff, Bug,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SharedHeader = dynamic(
  () => import('@/components/store/SharedHeader').then((m) => ({ default: m.SharedHeader })),
  { ssr: false },
);

const ADMIN_KEY = 'digistore-admin-2024';

interface SecurityProject {
  id: number;
  name: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  language: string | null;
  lastUpdate: string;
  license: string | null;
  topics: string[];
  url: string;
  ownerAvatar: string;
  archived: boolean;
  category: string;
  ogImage?: string;
}

interface ImportedProject {
  id: string;
  repo: string;
  name: string;
  author: string;
  licenseName: string | null;
  licenseStatus: 'permissive' | 'review' | 'forbidden';
  licenseEmoji: string;
  canRedistribute: boolean;
  stars: number;
  forks: number;
  language: string | null;
  lastUpdate: string;
  importedAt: string;
}

interface LicenseAnalysis {
  emoji: string;
  label: string;
  name: string;
  canRedistribute: boolean;
}

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 1) return 'hoy';
  if (days < 30) return `hace ${days}d`;
  if (days < 365) return `hace ${Math.floor(days / 30)}m`;
  return `hace ${Math.floor(days / 365)}a`;
}

function detectLicenseStatus(name: string | null): { emoji: string; label: string; className: string } {
  if (!name) return { emoji: '🔴', label: 'Sin licencia', className: 'bg-red-950/60 text-red-300 border-red-800' };
  const n = name.toLowerCase();
  if (/^(\bmit\b|apache|bsd|isc|unlicense|0bsd|cc0|zlib|boost|wtfpl|gpl|gnu general public)/.test(n) || n.includes('gnu general public license')) {
    return { emoji: '🟢', label: 'Redistribuible', className: 'bg-emerald-950/60 text-emerald-300 border-emerald-800' };
  }
  if (/lgpl|mpl|agpl|epl|cddl|eupl|cc-by|cc by|artistic|polyform/.test(n)) {
    return { emoji: '🟡', label: 'Revisar', className: 'bg-amber-950/60 text-amber-300 border-amber-800' };
  }
  return { emoji: '🔴', label: 'No distribuir', className: 'bg-red-950/60 text-red-300 border-red-800' };
}

export default function AdminSecurityPage() {
  const searchParams = useSearchParams();
  const urlKey = searchParams?.get('key') || '';
  const isAuthorized = urlKey === ADMIN_KEY;

  const [discovered, setDiscovered] = useState<SecurityProject[]>([]);
  const [loadingDiscovered, setLoadingDiscovered] = useState(true);
  const [discoveredError, setDiscoveredError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const [imported, setImported] = useState<ImportedProject[]>([]);
  const [autoImport, setAutoImport] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Local set of "rejected" repo slugs (cosmetic only — hides from list)
  const [rejected, setRejected] = useState<Set<string>>(new Set());

  // Per-project loading/analysis state
  const [importing, setImporting] = useState<Set<string>>(new Set());
  const [importMessages, setImportMessages] = useState<Record<string, { type: 'success' | 'error'; msg: string }>>({});
  const [licenseInspect, setLicenseInspect] = useState<Record<string, LicenseAnalysis>>({});
  const [inspecting, setInspecting] = useState<Set<string>>(new Set());

  /* ── Fetch discovered projects (uses /api/security/search) ── */
  const loadDiscovered = useCallback(async () => {
    setLoadingDiscovered(true);
    setDiscoveredError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      if (category && category !== 'all') params.set('category', category);
      params.set('sort', 'stars');
      params.set('per_page', '24');
      const res = await fetch(`/api/security/search?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.success) {
        setDiscovered(data.projects || []);
      } else {
        setDiscoveredError(data.error || 'Error al buscar proyectos.');
      }
    } catch (e) {
      setDiscoveredError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoadingDiscovered(false);
    }
  }, [search, category]);

  /* ── Fetch admin settings + imported list ── */
  const loadAdminState = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch(`/api/security/admin?key=${ADMIN_KEY}`, { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.success) {
        setAutoImport(data.autoImport);
        setImported(data.imported || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      loadDiscovered();
      loadAdminState();
    }
  }, [isAuthorized, loadDiscovered, loadAdminState]);

  /* ── Import a project ── */
  const handleImport = useCallback(async (p: SecurityProject) => {
    const slug = p.fullName;
    if (importing.has(slug)) return;
    setImporting((prev) => new Set(prev).add(slug));
    try {
      const res = await fetch('/api/security/import', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ repo: slug }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setImportMessages((prev) => ({ ...prev, [slug]: { type: 'success', msg: data.message || 'Importado.' } }));
        loadAdminState();
      } else {
        setImportMessages((prev) => ({ ...prev, [slug]: { type: 'error', msg: data.error || data.detail || 'No se pudo importar.' } }));
      }
    } catch (e) {
      setImportMessages((prev) => ({ ...prev, [slug]: { type: 'error', msg: e instanceof Error ? e.message : 'Error de red.' } }));
    } finally {
      setImporting((prev) => { const n = new Set(prev); n.delete(slug); return n; });
    }
  }, [importing, loadAdminState]);

  /* ── Reject a discovered project (cosmetic hide) ── */
  const handleReject = useCallback((p: SecurityProject) => {
    setRejected((prev) => new Set(prev).add(p.fullName));
  }, []);

  /* ── Inspect license via /api/security/analyze ── */
  const handleInspectLicense = useCallback(async (p: SecurityProject) => {
    const slug = p.fullName;
    if (inspecting.has(slug) || licenseInspect[slug]) return;
    setInspecting((prev) => new Set(prev).add(slug));
    try {
      const res = await fetch('/api/security/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ repo: slug }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.analysis?.license) {
        setLicenseInspect((prev) => ({
          ...prev,
          [slug]: {
            emoji: data.analysis.license.emoji,
            label: data.analysis.license.label,
            name: data.analysis.license.name || '—',
            canRedistribute: data.analysis.license.canRedistribute,
          },
        }));
      }
    } catch {
      // ignore
    } finally {
      setInspecting((prev) => { const n = new Set(prev); n.delete(slug); return n; });
    }
  }, [inspecting, licenseInspect]);

  /* ── Toggle auto-import ── */
  const toggleAutoImport = useCallback(async () => {
    const next = !autoImport;
    setAutoImport(next); // optimistic
    try {
      await fetch(`/api/security/admin?key=${ADMIN_KEY}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ autoImport: next }),
      });
    } catch {
      setAutoImport(!next); // revert
    }
  }, [autoImport]);

  /* ── Delete an imported project ── */
  const handleDeleteImported = useCallback(async (id: string) => {
    try {
      await fetch(`/api/security/admin?key=${ADMIN_KEY}&id=${id}`, { method: 'DELETE' });
      loadAdminState();
    } catch {
      // ignore
    }
  }, [loadAdminState]);

  // Filter discovered to hide rejected
  const visibleDiscovered = useMemo(
    () => discovered.filter((p) => !rejected.has(p.fullName)),
    [discovered, rejected],
  );

  const importedSet = useMemo(
    () => new Set(imported.map((p) => p.repo.toLowerCase())),
    [imported],
  );

  /* ═══ NOT AUTHORIZED ═══ */
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
        <SharedHeader activePage="security" />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-900/60 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2">Acceso restringido</h1>
            <p className="text-sm text-gray-400 mb-6">
              Esta área es solo para administradores. Necesitas la clave de acceso en la URL.
            </p>
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 mb-5 text-left">
              <p className="text-xs text-gray-500 mb-1">Formato requerido:</p>
              <code className="text-xs text-violet-300 font-mono break-all">
                /admin/security?key=********
              </code>
            </div>
            <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-semibold transition-colors">
              Volver al inicio
            </Link>
          </div>
        </main>
      </div>
    );
  }

  /* ═══ AUTHORIZED ═══ */
  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
      <SharedHeader activePage="security" />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link href="/security" className="inline-flex items-center gap-2 text-gray-400 hover:text-violet-300 text-sm font-medium mb-2 transition-colors">
              <X className="w-4 h-4" /> Volver a Security
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-violet-400" />
              Panel Admin · DigiStore Security
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Gestiona proyectos descubiertos, importa al catálogo y controla la distribución.
            </p>
          </div>

          {/* Stats + auto-import toggle */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs font-bold px-3 py-2 rounded-xl">
              <Package className="w-3.5 h-3.5" />
              {imported.length} importados
            </span>
            <span className="inline-flex items-center gap-1.5 bg-gray-900/80 border border-gray-800 text-gray-300 text-xs font-bold px-3 py-2 rounded-xl">
              <Bug className="w-3.5 h-3.5 text-violet-400" />
              {visibleDiscovered.length} descubiertos
            </span>
            <button
              onClick={toggleAutoImport}
              disabled={loadingSettings}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-50',
                autoImport
                  ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                  : 'bg-gray-900/80 border-gray-800 text-gray-400 hover:text-white',
              )}
              title="Auto-importar proyectos con licencia redistribuible"
            >
              {autoImport ? <CheckCircle2 className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              Auto-import: {autoImport ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => { loadDiscovered(); loadAdminState(); }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 border border-violet-500/40 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {/* Search + filter controls */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') loadDiscovered(); }}
              placeholder="Buscar proyectos en GitHub (ej. sherlock, nuclei, osint)..."
              className="w-full rounded-xl bg-gray-900/80 border border-gray-800 py-3 pl-10 pr-4 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20 transition-colors"
            />
          </div>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); }}
            className="appearance-none rounded-xl bg-gray-900/80 border border-gray-800 py-3 pl-4 pr-9 text-sm text-gray-200 cursor-pointer outline-none focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20 transition-colors"
          >
            <option value="all" className="bg-gray-900">Todas</option>
            <option value="osint" className="bg-gray-900">OSINT</option>
            <option value="ctf" className="bg-gray-900">CTF</option>
            <option value="red-team" className="bg-gray-900">Red Team</option>
            <option value="blue-team" className="bg-gray-900">Blue Team</option>
            <option value="bug-bounty" className="bg-gray-900">Bug Bounty</option>
            <option value="digital-forensics" className="bg-gray-900">Forensics</option>
            <option value="privacy" className="bg-gray-900">Privacy</option>
            <option value="network-security" className="bg-gray-900">Network</option>
            <option value="cloud-security" className="bg-gray-900">Cloud</option>
            <option value="malware-analysis" className="bg-gray-900">Malware</option>
            <option value="cryptography" className="bg-gray-900">Crypto</option>
            <option value="web-security" className="bg-gray-900">Web</option>
            <option value="reverse-engineering" className="bg-gray-900">Reverse Eng.</option>
            <option value="soc-siem" className="bg-gray-900">SOC / SIEM</option>
          </select>
          <button
            onClick={loadDiscovered}
            disabled={loadingDiscovered}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white transition-colors shadow-lg shadow-violet-500/20"
          >
            {loadingDiscovered ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
            Buscar
          </button>
        </div>

        {discoveredError && (
          <div className="rounded-2xl bg-red-950/30 border border-red-900/50 p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-200 text-sm font-semibold mb-1">Error al cargar proyectos</p>
            <p className="text-red-300/70 text-xs mb-3">{discoveredError}</p>
            <button onClick={loadDiscovered} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors">Reintentar</button>
          </div>
        )}

        {/* Discovered projects table */}
        <section className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-200 flex items-center gap-2">
              <Bug className="w-4 h-4 text-violet-400" /> Proyectos descubiertos
            </h2>
            <span className="text-xs text-gray-500">{visibleDiscovered.length} mostrados</span>
          </div>

          {loadingDiscovered ? (
            <div className="p-10 text-center">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-400">Buscando en GitHub…</p>
            </div>
          ) : visibleDiscovered.length === 0 ? (
            <div className="p-10 text-center">
              <Bug className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400 font-semibold">Sin proyectos</p>
              <p className="text-xs text-gray-500 mt-1">Prueba con otra búsqueda o categoría.</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-900/80 sticky top-0 z-10">
                  <tr className="text-left text-[10px] uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-2.5 font-semibold">Proyecto</th>
                    <th className="px-4 py-2.5 font-semibold hidden md:table-cell">Licencia</th>
                    <th className="px-4 py-2.5 font-semibold hidden lg:table-cell">Stats</th>
                    <th className="px-4 py-2.5 font-semibold hidden lg:table-cell">Update</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {visibleDiscovered.map((p) => {
                    const isImported = importedSet.has(p.fullName.toLowerCase());
                    const lic = detectLicenseStatus(p.license);
                    const inspection = licenseInspect[p.fullName];
                    const msg = importMessages[p.fullName];
                    const isLoading = importing.has(p.fullName);
                    const isInspecting = inspecting.has(p.fullName);

                    return (
                      <tr key={p.id} className="hover:bg-gray-900/50 transition-colors">
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <img
                              src={p.ownerAvatar}
                              alt=""
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full ring-2 ring-gray-900/50 shrink-0"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <a
                                  href={p.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-bold text-white hover:text-violet-300 transition-colors truncate"
                                  title={p.fullName}
                                >
                                  {p.name}
                                </a>
                                {isImported && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800 shrink-0">
                                    <Package className="w-2.5 h-2.5" /> Importado
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 font-mono truncate max-w-[260px]">{p.fullName}</p>
                              <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5 max-w-[320px]">{p.description}</p>
                              {p.language && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" /> {p.language}
                                </span>
                              )}
                              {msg && (
                                <p className={cn('text-[10px] mt-1 flex items-center gap-1', msg.type === 'success' ? 'text-emerald-300' : 'text-red-300')}>
                                  {msg.type === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                  <span className="line-clamp-2">{msg.msg}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top hidden md:table-cell">
                          <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border', lic.className)}>
                            <span aria-hidden="true">{lic.emoji}</span>
                            <span className="truncate max-w-[120px]">{p.license || 'Sin licencia'}</span>
                          </span>
                          {inspection && (
                            <p className="text-[10px] text-gray-500 mt-1.5">
                              {inspection.emoji} {inspection.label}<br />
                              <span className="font-mono">{inspection.name}</span>
                              <br />
                              <span className={inspection.canRedistribute ? 'text-emerald-400' : 'text-red-400'}>
                                {inspection.canRedistribute ? 'Redistribuible' : 'No redistribuible'}
                              </span>
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top hidden lg:table-cell">
                          <div className="flex flex-col gap-0.5 text-[11px] text-gray-400">
                            <span className="inline-flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              {p.stars >= 1000 ? `${(p.stars / 1000).toFixed(1)}k` : p.stars}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <GitFork className="w-3 h-3 text-gray-500" />
                              {p.forks >= 1000 ? `${(p.forks / 1000).toFixed(1)}k` : p.forks}
                            </span>
                            <span className="inline-flex items-center gap-1 text-gray-500">
                              <Scale className="w-3 h-3" />
                              {p.archived ? 'Archivado' : 'Activo'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top hidden lg:table-cell">
                          <span className="inline-flex items-center gap-1 text-[11px] text-gray-400" title={new Date(p.lastUpdate).toLocaleString()}>
                            <Calendar className="w-3 h-3 text-gray-500" />
                            {timeAgo(p.lastUpdate)}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleImport(p)}
                              disabled={isLoading || isImported}
                              className={cn(
                                'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors',
                                isImported
                                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800 cursor-default'
                                  : 'bg-fuchsia-600/20 hover:bg-fuchsia-600/40 text-fuchsia-300 border-fuchsia-600/40 disabled:opacity-50 disabled:cursor-not-allowed',
                              )}
                              title="Importar al catálogo DigiStore"
                            >
                              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Package className="w-3 h-3" />}
                              {isImported ? 'Importado' : 'Importar'}
                            </button>
                            <button
                              onClick={() => handleReject(p)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
                              title="Rechazar (ocultar de la lista)"
                            >
                              <X className="w-3 h-3" /> Rechazar
                            </button>
                            <button
                              onClick={() => handleInspectLicense(p)}
                              disabled={isInspecting || !!inspection}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 border border-violet-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Ver licencia (vía GitHub API)"
                            >
                              {isInspecting ? <Loader2 className="w-3 h-3 animate-spin" /> : inspection ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              Licencia
                            </button>
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
                              title="Ver repo en GitHub"
                            >
                              <ExternalLink className="w-3 h-3" /> Repo
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Imported projects list */}
        <section className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-200 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" /> Catálogo importado ({imported.length})
            </h2>
            <span className="text-xs text-gray-500">Almacenado en memoria (serverless)</span>
          </div>
          {imported.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400 font-semibold">Catálogo vacío</p>
              <p className="text-xs text-gray-500 mt-1">Importa proyectos desde la lista superior.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800 max-h-[400px] overflow-y-auto">
              {imported.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-900/50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-600/40 to-teal-600/40 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://github.com/${p.repo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-white hover:text-emerald-300 transition-colors truncate text-sm"
                      >
                        {p.name}
                      </a>
                      <span className="text-[10px] text-gray-500 font-mono truncate">@{p.author}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10px] text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        {p.stars >= 1000 ? `${(p.stars / 1000).toFixed(1)}k` : p.stars}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <GitFork className="w-2.5 h-2.5" />
                        {p.forks}
                      </span>
                      <span className={cn(
                        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border font-bold',
                        p.licenseStatus === 'permissive'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                          : p.licenseStatus === 'review'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                            : 'bg-red-950/60 text-red-300 border-red-800',
                      )}>
                        <span aria-hidden="true">{p.licenseEmoji}</span>
                        {p.licenseName || 'Sin licencia'}
                      </span>
                      <span className="text-gray-600">·</span>
                      <span>Importado {timeAgo(p.importedAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`/api/security/download/${p.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-600/40 transition-colors"
                      title="Descargar ZIP"
                    >
                      <FileText className="w-3 h-3" /> ZIP
                    </a>
                    <button
                      onClick={() => handleDeleteImported(p.id)}
                      className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-red-950/40 hover:bg-red-950/70 text-red-300 border border-red-900/60 transition-colors"
                      title="Eliminar del catálogo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="relative mt-12 bg-gray-950 border-t border-gray-800">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-[11px] text-gray-600">
            Panel administrativo · DigiStore Security · Acceso protegido por clave URL
          </p>
        </div>
      </footer>
    </div>
  );
}
