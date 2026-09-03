'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Clock, Zap, CheckCircle2, AlertTriangle, Loader2, Activity,
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
  // Cron: 0 */6 * * *  → 00:00, 06:00, 12:00, 18:00 UTC
  const now = new Date();
  const hours = [0, 6, 12, 18, 24, 30];
  const nextH = hours.find(h => h > now.getUTCHours()) ?? 24 + 0;
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), nextH, 0, 0));
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
      // El endpoint devuelve { success, summary, isScanning, totalGamesInStore }
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
      <div className="bg-violet-50 border-y animate-pulse">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 py-3">
          <div className="h-4 w-64 bg-violet-100 rounded" />
        </div>
      </div>
    );
  }

  /* ═══ VARIANT: INLINE BANNER (dentro de la página de tienda) ═══ */
  if (variant === 'inline') {
    return (
      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border-y">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <div className={`w-2 h-2 rounded-full ${summary?.isScanning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="font-semibold text-gray-700">
                {summary?.isScanning ? 'Escaneando productos...' : `${summary?.totalGames ?? 0} productos activos`}
              </span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-600 hidden sm:inline">
                <Clock className="w-3 h-3 inline mr-1" />
                Último escaneo: <strong className="text-gray-800">{timeAgo(summary?.lastScanAt ?? null)}</strong>
              </span>
              <span className="text-gray-400 hidden md:inline">·</span>
              <span className="text-gray-600 hidden md:inline">
                <Activity className="w-3 h-3 inline mr-1" />
                Próx. escaneo automático: <strong className="text-violet-600">{nextScanIn()}</strong>
              </span>
            </div>
            {showManualTrigger && (
              <button
                onClick={triggerScan}
                disabled={triggering || summary?.isScanning}
                className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                {triggering || summary?.isScanning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                {triggering || summary?.isScanning ? 'Escaneando...' : 'Escanear ahora'}
              </button>
            )}
          </div>
          {lastResult && (
            <div className={`mt-2 text-xs flex items-center gap-1.5 ${lastResult.ok ? 'text-emerald-700' : 'text-rose-700'}`}>
              {lastResult.ok ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              {lastResult.msg}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ═══ VARIANT: CARD (para el panel admin) ═══ */
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${summary?.isScanning ? 'bg-amber-100' : 'bg-emerald-100'}`}>
            <Activity className={`w-4 h-4 ${summary?.isScanning ? 'text-amber-600 animate-pulse' : 'text-emerald-600'}`} />
          </div>
          <h3 className="font-bold text-sm">Estado del Escáner</h3>
        </div>
        {showManualTrigger && (
          <button
            onClick={triggerScan}
            disabled={triggering || summary?.isScanning}
            className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            {triggering || summary?.isScanning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            {triggering || summary?.isScanning ? 'Escaneando...' : 'Escanear ahora'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Productos activos</p>
          <p className="text-xl font-black text-gray-900">{summary?.totalGames ?? 0}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Valor estimado</p>
          <p className="text-xl font-black text-emerald-600">${(summary?.estimatedValue ?? 0).toFixed(0)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Último escaneo</p>
          <p className="text-xs font-bold text-gray-700">{timeAgo(summary?.lastScanAt ?? null)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Próximo auto</p>
          <p className="text-xs font-bold text-violet-600">{nextScanIn()}</p>
        </div>
      </div>

      <div className="text-[10px] text-gray-500 border-t pt-3">
        <Zap className="w-3 h-3 inline mr-1 text-amber-500" />
        Cron configurado cada <strong>6 horas</strong> (00:00, 06:00, 12:00, 18:00 UTC) vía Vercel Cron.
      </div>

      {lastResult && (
        <div className={`mt-3 text-xs flex items-center gap-1.5 p-2 rounded ${lastResult.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          {lastResult.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          {lastResult.msg}
        </div>
      )}

      {error && (
        <div className="mt-3 text-xs text-rose-600 bg-rose-50 p-2 rounded flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}
    </div>
  );
}

export default ScannerStatus;
