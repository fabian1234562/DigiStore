'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Clock, Zap, CheckCircle2, AlertTriangle, Loader2, Activity,
  Database, TrendingUp, Radar, Sparkles,
} from 'lucide-react';

interface ScanSummary {
  isScanning: boolean;
  lastScanAt: string | null;
  totalGames: number;
  totalSources: number;
  estimatedValue: number;
  sources?: Record<string, {
    name: string;
    status: 'idle' | 'scanning' | 'success' | 'error';
    gamesFound: number;
    lastScan?: string;
  }>;
}

interface ScannerStatusProps {
  /** 'inline' = banner horizontal (dentro del flujo de la página) | 'card' = tarjeta compacta */
  variant?: 'inline' | 'card';
  /** Mostrar botón "Escanear ahora" */
  showManualTrigger?: boolean;
  /** Auto-refresh cada N segundos */
  refreshIntervalSec?: number;
}

function timeAgo(isoDate: string | null): string {
  if (!isoDate) return 'nunca';
  const diff = Date.now() - new Date(isoDate).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'hace un momento';
  if (min < 60) return `hace ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `hace ${hr}h ${min % 60}m`;
  const days = Math.floor(hr / 24);
  return `hace ${days}d`;
}

function nextScanIn(): string {
  // Cron: 30 6 * * *  → 06:30 UTC todos los dias
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 6, 30, 0));
  if (next.getTime() < now.getTime()) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  const diffMs = next.getTime() - now.getTime();
  const hr = Math.floor(diffMs / 3600000);
  const min = Math.floor((diffMs % 3600000) / 60000);
  return `en ${hr}h ${min}m`;
}

export function ScannerStatus({
  variant = 'inline',
  showManualTrigger = true,
  refreshIntervalSec = 30,
}: ScannerStatusProps) {
  const [summary, setSummary] = useState<ScanSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/scanner/summary', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const s = data.summary || {};
      setSummary({
        isScanning: data.isScanning ?? false,
        lastScanAt: s.lastScanAt ?? null,
        totalGames: s.totalGames ?? data.totalGamesInStore ?? 0,
        totalSources: s.sources ? Object.keys(s.sources).length : 0,
        estimatedValue: s.estimatedValue ?? 0,
        sources: s.sources,
      });
      setError(null);
    } catch (e: any) {
      setError(e.message || 'No se pudo cargar el estado');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    if (refreshIntervalSec > 0) {
      const id = setInterval(fetchStatus, refreshIntervalSec * 1000);
      return () => clearInterval(id);
    }
  }, [fetchStatus, refreshIntervalSec]);

  const triggerScan = async () => {
    if (triggering || summary?.isScanning) return;
    setTriggering(true);
    setLastResult(null);
    try {
      const res = await fetch('/api/scanner/run', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setLastResult({ ok: true, msg: `Escaneo completado: ${data.newProductsFound ?? 0} productos nuevos` });
        await fetchStatus();
      } else if (data.error === 'scan_in_progress') {
        setLastResult({ ok: false, msg: 'Ya hay un escaneo en progreso, espera...' });
      } else {
        setLastResult({ ok: false, msg: data.error || 'Error al escanear' });
      }
    } catch (e: any) {
      setLastResult({ ok: false, msg: e.message || 'Error de red' });
    } finally {
      setTriggering(false);
      setTimeout(() => setLastResult(null), 5000);
    }
  };

  /* ═══ Loading skeleton ═══ */
  if (loading) {
    return variant === 'card' ? (
      <div className="rounded-2xl border bg-white p-5 animate-pulse">
        <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
        <div className="h-3 w-48 bg-gray-100 rounded" />
      </div>
    ) : (
      <div className="bg-gradient-to-r from-violet-100 to-indigo-100 border-y animate-pulse">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 py-3">
          <div className="h-12 w-full bg-white/50 rounded-xl" />
        </div>
      </div>
    );
  }

  const isScanning = summary?.isScanning || triggering;
  const totalProducts = summary?.totalGames ?? 0;
  const lastScan = timeAgo(summary?.lastScanAt ?? null);
  const nextScan = nextScanIn();
  const totalValue = summary?.estimatedValue ?? 0;

  /* ═══ VARIANT: INLINE BANNER — rediseñado ═══ */
  if (variant === 'inline') {
    return (
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#1e3a8a] border-y border-indigo-300/20">
        {/* Pattern decorativo */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,white,transparent_40%)]" />
        <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,white_10px,white_11px)]" />

        {/* Animated glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-3 sm:px-6 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">

            {/* Lado izquierdo: Stats con icono radar animado */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Radar icon con animación */}
              <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isScanning ? 'bg-amber-400/20 border border-amber-400/40' : 'bg-emerald-400/20 border border-emerald-400/40'}`}>
                <Radar className={`w-5 h-5 ${isScanning ? 'text-amber-300 animate-spin' : 'text-emerald-300'}`} style={{ animationDuration: '2s' }} />
                {isScanning && (
                  <span className="absolute inset-0 rounded-xl border-2 border-amber-400/40 animate-ping" />
                )}
              </div>

              {/* Stats principales */}
              <div className="flex items-center gap-3 sm:gap-5">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-violet-200/70 font-semibold leading-none mb-0.5">
                    {isScanning ? 'Escaneando' : 'Productos'}
                  </span>
                  <span className="text-base sm:text-lg font-black text-white leading-none flex items-center gap-1">
                    {isScanning ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    {isScanning ? 'en vivo' : totalProducts}
                  </span>
                </div>

                <div className="hidden sm:flex flex-col border-l border-white/20 pl-4">
                  <span className="text-[10px] uppercase tracking-wider text-violet-200/70 font-semibold leading-none mb-0.5 flex items-center gap-1">
                    <Database className="w-3 h-3" /> Valor
                  </span>
                  <span className="text-base font-black text-amber-300 leading-none">
                    ${totalValue.toFixed(0)}
                  </span>
                </div>

                <div className="hidden md:flex flex-col border-l border-white/20 pl-4">
                  <span className="text-[10px] uppercase tracking-wider text-violet-200/70 font-semibold leading-none mb-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Último
                  </span>
                  <span className="text-sm font-bold text-white leading-none">
                    {lastScan}
                  </span>
                </div>

                <div className="hidden lg:flex flex-col border-l border-white/20 pl-4">
                  <span className="text-[10px] uppercase tracking-wider text-violet-200/70 font-semibold leading-none mb-0.5 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Próximo
                  </span>
                  <span className="text-sm font-bold text-emerald-300 leading-none">
                    {nextScan}
                  </span>
                </div>
              </div>
            </div>

            {/* Lado derecho: Botón + status indicator */}
            <div className="flex items-center gap-2">
              {/* Status dot */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                <div className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wider">
                  {isScanning ? 'Live' : 'Ready'}
                </span>
              </div>

              {showManualTrigger && (
                <button
                  onClick={triggerScan}
                  disabled={isScanning}
                  className="group relative inline-flex items-center gap-1.5 bg-white hover:bg-violet-50 disabled:opacity-60 text-violet-700 text-xs font-bold px-3.5 py-2 rounded-lg transition-all shadow-lg hover:shadow-violet-500/30 hover:scale-105 disabled:hover:scale-100"
                >
                  {isScanning ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                  )}
                  <span className="hidden sm:inline">
                    {isScanning ? 'Escaneando...' : 'Escanear ahora'}
                  </span>
                  <Sparkles className="w-3 h-3 hidden lg:inline text-amber-500" />
                </button>
              )}
            </div>
          </div>

          {/* Mensaje de resultado */}
          {lastResult && (
            <div className={`mt-2.5 text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${lastResult.ok ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' : 'bg-rose-500/20 text-rose-200 border border-rose-400/30'}`}>
              {lastResult.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {lastResult.msg}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-2 text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/20 text-rose-200 border border-rose-400/30">
              <AlertTriangle className="w-3.5 h-3.5" />
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ═══ VARIANT: CARD (para admin) — rediseñado ═══ */
  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-200/50 bg-gradient-to-br from-white via-violet-50/30 to-indigo-50/30 p-5 shadow-sm">
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-200/20 rounded-full blur-3xl -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-200/20 rounded-full blur-3xl -ml-12 -mb-12" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-md ${isScanning ? 'bg-amber-100' : 'bg-emerald-100'}`}>
              <Radar className={`w-4.5 h-4.5 ${isScanning ? 'text-amber-600 animate-spin' : 'text-emerald-600'}`} style={{ animationDuration: '2s', width: '18px', height: '18px' }} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">Escáner DigiStore</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                {isScanning ? 'En progreso' : 'Activo · Listo'}
              </p>
            </div>
          </div>
          {showManualTrigger && (
            <button
              onClick={triggerScan}
              disabled={isScanning}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105"
            >
              {isScanning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              {isScanning ? 'Escaneando' : 'Escanear ahora'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <Database className="w-3 h-3 text-violet-600" />
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Productos activos</p>
            </div>
            <p className="text-2xl font-black text-gray-900">{totalProducts}</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Valor estimado</p>
            </div>
            <p className="text-2xl font-black text-emerald-600">${totalValue.toFixed(0)}</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3 h-3 text-amber-600" />
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Último escaneo</p>
            </div>
            <p className="text-sm font-bold text-gray-700">{lastScan}</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <Activity className="w-3 h-3 text-violet-600" />
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Próximo auto</p>
            </div>
            <p className="text-sm font-bold text-violet-600">{nextScan}</p>
          </div>
        </div>

        <div className="text-[10px] text-gray-500 border-t border-indigo-100 pt-3 flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-amber-500" />
          Auto-escaneo diario a las <strong className="text-gray-700">06:30 UTC</strong> vía Vercel Cron
        </div>

        {lastResult && (
          <div className={`mt-3 text-xs flex items-center gap-1.5 p-2.5 rounded-lg ${lastResult.ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {lastResult.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {lastResult.msg}
          </div>
        )}

        {error && (
          <div className="mt-3 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg flex items-center gap-1.5 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default ScannerStatus;
