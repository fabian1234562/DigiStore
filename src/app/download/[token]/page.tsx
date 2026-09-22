'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Download, ShieldCheck, FileArchive, Clock, Hash, HardDrive,
  CheckCircle2, AlertTriangle, Loader2, RefreshCw, Zap, Package,
  XCircle, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeliveryInfo {
  productName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  version: string;
  sha256: string;
  userEmail: string;
  expiresAt: string;
  downloadsCount: number;
  maxDownloads: number;
  remaining: number;
}

type State =
  | { status: 'loading' }
  | { status: 'ok'; delivery: DeliveryInfo }
  | { status: 'error'; code: string; message: string };

const ERROR_MESSAGES: Record<string, { title: string; description: string; icon: any; color: string }> = {
  invalid_token_format: {
    title: 'Enlace inválido',
    description: 'El formato del enlace no es correcto. Verifica que copiaste el enlace completo.',
    icon: AlertTriangle,
    color: 'text-amber-400',
  },
  token_not_found: {
    title: 'Enlace no encontrado',
    description: 'Este enlace no existe o ya fue eliminado. Si crees que es un error, contacta soporte@digistore.com',
    icon: XCircle,
    color: 'text-red-400',
  },
  token_invalidated: {
    title: 'Enlace invalidado',
    description: 'Este enlace fue invalidado por el administrador. Si crees que es un error, contacta soporte@digistore.com',
    icon: XCircle,
    color: 'text-red-400',
  },
  token_expired: {
    title: 'Enlace expirado',
    description: 'El enlace ha superado las 24 horas de validez. Solicita uno nuevo.',
    icon: Clock,
    color: 'text-amber-400',
  },
  download_limit_reached: {
    title: 'Límite de descargas alcanzado',
    description: 'Ya usaste las 5 descargas permitidas para este enlace. Solicita uno nuevo.',
    icon: AlertTriangle,
    color: 'text-amber-400',
  },
  product_not_available: {
    title: 'Producto no disponible',
    description: 'El producto ya no está disponible para descarga. Contacta soporte@digistore.com',
    icon: Package,
    color: 'text-red-400',
  },
  server_error: {
    title: 'Error del servidor',
    description: 'Algo salió mal. Intenta de nuevo en unos minutos.',
    icon: AlertTriangle,
    color: 'text-red-400',
  },
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatExpiry(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (diffHours <= 0) return `${diffMins} minutos`;
  return `${diffHours}h ${diffMins}m`;
}

function shortHash(hash: string): string {
  if (!hash || hash.length < 16) return hash || '—';
  return `${hash.substring(0, 8)}…${hash.substring(hash.length - 8)}`;
}

export default function DownloadPage() {
  const params = useParams();
  const token = params?.token as string;
  const [state, setState] = useState<State>({ status: 'loading' });
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<'idle' | 'started' | 'done' | 'error'>('idle');

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`/api/download/verify?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (data.success && data.delivery) {
          setState({ status: 'ok', delivery: data.delivery });
        } else {
          setState({
            status: 'error',
            code: data.error || 'server_error',
            message: data.message || '',
          });
        }
      } catch (err) {
        setState({
          status: 'error',
          code: 'server_error',
          message: err instanceof Error ? err.message : 'network_error',
        });
      }
    }
    verify();
  }, [token]);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadProgress('started');
    try {
      // Usar window.location para forzar la descarga del archivo
      // El navegador maneja Content-Disposition: attachment automáticamente
      window.location.href = `/api/download/${token}/file`;

      // Esperar un poco y marcar como hecho
      setTimeout(() => {
        setDownloadProgress('done');
        setDownloading(false);
      }, 2000);
    } catch (err) {
      setDownloadProgress('error');
      setDownloading(false);
    }
  };

  // ─── Loading state ───
  if (state.status === 'loading') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-950 to-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-400 mx-auto mb-3 animate-spin" />
          <p className="text-gray-400 text-sm">Verificando enlace de descarga…</p>
        </div>
      </main>
    );
  }

  // ─── Error state ───
  if (state.status === 'error') {
    const errInfo = ERROR_MESSAGES[state.code] || ERROR_MESSAGES.server_error;
    const Icon = errInfo.icon;
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-950 to-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900/80 border border-gray-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-800 flex items-center justify-center">
            <Icon className={cn('w-8 h-8', errInfo.color)} />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">{errInfo.title}</h1>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">{errInfo.description}</p>
          <div className="bg-gray-950/50 border border-gray-800 rounded-lg p-3 mb-6">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Código de error</p>
            <code className="text-xs text-amber-300 font-mono">{state.code}</code>
          </div>
          <div className="flex flex-col gap-2">
            <a
              href="mailto:soporte@digistore.com"
              className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-colors"
            >
              Contactar soporte
            </a>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 text-gray-400 hover:text-white text-sm py-2"
            >
              ← Volver a DigiStore
            </a>
          </div>
        </div>
      </main>
    );
  }

  // ─── Success state ───
  const delivery = state.delivery;
  const isExpiringSoon = new Date(delivery.expiresAt).getTime() - Date.now() < 2 * 60 * 60 * 1000;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-950 to-black text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 md:py-16">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            ENTREGA VERIFICADA
          </div>
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/30">
            <Package className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
            Tu producto está listo
          </h1>
          <p className="text-gray-400 text-sm">
            Todo está verificado. Haz clic en descargar para obtener tu archivo.
          </p>
        </div>

        {/* Product info card */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 border border-violet-500/30 flex items-center justify-center shrink-0">
              <FileArchive className="w-7 h-7 text-violet-300" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-white text-lg leading-tight">{delivery.productName}</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Versión {delivery.version}
              </p>
            </div>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-950/50 border border-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                <FileArchive className="w-3 h-3" />
                <span className="uppercase tracking-wider text-[10px] font-bold">Archivo</span>
              </div>
              <p className="text-white font-medium truncate">{delivery.fileName}</p>
            </div>

            <div className="bg-gray-950/50 border border-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                <HardDrive className="w-3 h-3" />
                <span className="uppercase tracking-wider text-[10px] font-bold">Tamaño</span>
              </div>
              <p className="text-white font-medium">{formatBytes(delivery.fileSize)}</p>
            </div>

            <div className="bg-gray-950/50 border border-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                <Hash className="w-3 h-3" />
                <span className="uppercase tracking-wider text-[10px] font-bold">SHA-256</span>
              </div>
              <p className="text-white font-mono text-[10px]" title={delivery.sha256}>
                {shortHash(delivery.sha256)}
              </p>
            </div>

            <div className="bg-gray-950/50 border border-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                <Clock className="w-3 h-3" />
                <span className="uppercase tracking-wider text-[10px] font-bold">Expira en</span>
              </div>
              <p className={cn(
                'font-medium',
                isExpiringSoon ? 'text-amber-300' : 'text-white'
              )}>
                {formatExpiry(delivery.expiresAt)}
              </p>
            </div>
          </div>

          {/* Verification badges */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-800">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <CheckCircle2 className="w-3 h-3" /> Producto verificado
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <CheckCircle2 className="w-3 h-3" /> Distribución autorizada
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40">
              <ShieldCheck className="w-3 h-3" /> Integridad SHA-256
            </span>
          </div>
        </div>

        {/* Download info */}
        <div className="bg-violet-950/30 border border-violet-900/50 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <div className="text-xs text-violet-200 leading-relaxed">
              <p className="font-bold mb-1">Descargas restantes: <span className="text-white">{delivery.remaining}</span> de {delivery.maxDownloads}</p>
              <p>El enlace expira en <strong className="text-white">{formatExpiry(delivery.expiresAt)}</strong>. Si necesitas más descargas, contacta soporte.</p>
            </div>
          </div>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={cn(
            'w-full inline-flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-lg transition-all',
            'shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed',
            downloadProgress === 'done'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-emerald-500/30'
              : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-violet-500/30',
          )}
        >
          {downloading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Iniciando descarga…
            </>
          ) : downloadProgress === 'done' ? (
            <>
              <CheckCircle2 className="w-6 h-6" />
              Descarga iniciada
            </>
          ) : (
            <>
              <Download className="w-6 h-6" />
              DESCARGAR AHORA
            </>
          )}
        </button>

        {downloadProgress === 'done' && (
          <p className="text-center text-xs text-gray-400 mt-3">
            Si la descarga no empezó automáticamente,{' '}
            <a
              href={`/api/download/${token}/file`}
              className="text-violet-300 hover:underline font-semibold"
            >
              haz clic aquí
            </a>
          </p>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500 mb-2">
            Tu descarga está protegida. El archivo se sirve desde DigiStore.
          </p>
          <a href="/" className="text-xs text-violet-300 hover:underline">
            ← Volver a DigiStore
          </a>
        </div>
      </div>
    </main>
  );
}
