'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Package, Download, Key, ExternalLink, Loader2, AlertTriangle,
  CheckCircle2, Clock, FileArchive, ShieldCheck, ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SharedHeader = dynamic(
  () => import('@/components/store/SharedHeader').then((m) => ({ default: m.SharedHeader })),
  { ssr: false },
);

interface PurchaseItem {
  order_id: string;
  order_status: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  delivery_type: string; // FILE, KEY, OFFICIAL_ACCESS
  price: number;
  quantity: number;
  status: string; // pending, delivered, revoked
  // Para FILE:
  delivery_token?: string;
  download_url?: string;
  file_name?: string;
  file_size?: number;
  sha256?: string;
  version?: string;
  expires_at?: string;
  downloads_count?: number;
  max_downloads?: number;
  // Para KEY:
  license_key?: string;
  activation_instructions?: string;
  platform?: string;
  // Para OFFICIAL_ACCESS:
  official_url?: string;
  access_instructions?: string;
  // Metadata
  image?: string;
  purchased_at: string;
}

export default function MisComprasPage() {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/my-purchases', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar compras');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (item: PurchaseItem) => {
    if (!item.delivery_token) return;
    try {
      // Abrir la URL de descarga en nueva pestaña
      window.open(`/api/download/${item.delivery_token}/file`, '_blank');
      setToast({ type: 'success', message: `Descargando ${item.file_name || item.product_name}...` });
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setToast({ type: 'error', message: 'Error al iniciar descarga' });
      setTimeout(() => setToast(null), 4000);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-950 to-black text-white">
        <SharedHeader />
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <Loader2 className="w-8 h-8 text-violet-400 mx-auto mb-3 animate-spin" />
          <p className="text-gray-400 text-sm">Cargando tus compras...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-950 to-black text-white">
        <SharedHeader />
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="bg-red-950/30 border border-red-900/50 rounded-2xl p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-200 text-sm font-semibold mb-1">Error</p>
            <p className="text-red-300/70 text-xs mb-4">{error}</p>
            <button onClick={loadPurchases} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold">
              Reintentar
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-950 to-black text-white">
        <SharedHeader />
        <div className="max-w-5xl mx-auto px-4 py-12">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> Volver a la tienda
          </Link>
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-700" />
            <h2 className="text-xl font-bold text-white mb-2">No tienes compras todavía</h2>
            <p className="text-gray-400 text-sm mb-6">Cuando compres un producto, aparecerá aquí.</p>
            <Link href="/" className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm">
              Explorar productos
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Agrupar por orden
  const orders = items.reduce((acc, item) => {
    if (!acc[item.order_id]) acc[item.order_id] = [];
    acc[item.order_id].push(item);
    return acc;
  }, {} as Record<string, PurchaseItem[]>);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-950 to-black text-white">
      <SharedHeader />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a la tienda
        </Link>

        <h1 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-2">
          <Package className="w-6 h-6 text-violet-400" />
          Mis Compras
        </h1>

        {Object.entries(orders).map(([orderId, orderItems]) => (
          <div key={orderId} className="mb-8">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-800">
              <div>
                <p className="text-xs text-gray-500">Orden</p>
                <code className="text-xs text-amber-300 font-mono">{orderId}</code>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Estado</p>
                <span className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold',
                  orderItems[0].order_status === 'completed' || orderItems[0].order_status === 'paid'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                )}>
                  {orderItems[0].order_status === 'completed' || orderItems[0].order_status === 'paid' ? (
                    <><CheckCircle2 className="w-3 h-3" /> PAGADO</>
                  ) : (
                    <><Clock className="w-3 h-3" /> {orderItems[0].order_status}</>
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {orderItems.map((item, idx) => (
                <PurchaseCard key={idx} item={item} onDownload={handleDownload} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <div className={cn(
          'fixed bottom-6 right-6 z-[200] max-w-md px-4 py-3 rounded-xl shadow-2xl border flex items-start gap-3',
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'
        )}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />}
          <div className="flex-1 text-sm">{toast.message}</div>
        </div>
      )}
    </main>
  );
}

function PurchaseCard({ item, onDownload }: { item: PurchaseItem; onDownload: (item: PurchaseItem) => void }) {
  const formatBytes = (bytes?: number) => {
    if (!bytes) return '—';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 flex items-start gap-4">
      {/* Imagen / icono */}
      <div className="w-16 h-16 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
        ) : (
          <Package className="w-8 h-8 text-gray-600" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-white text-sm">{item.product_name}</h3>
        <div className="flex flex-wrap gap-2 mt-1 text-[10px] text-gray-400">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> {formatDate(item.purchased_at)}
          </span>
          {item.version && (
            <span className="inline-flex items-center gap-1">
              v{item.version}
            </span>
          )}
          {item.file_size && item.delivery_type === 'FILE' && (
            <span className="inline-flex items-center gap-1">
              <FileArchive className="w-3 h-3" /> {formatBytes(item.file_size)}
            </span>
          )}
        </div>

        {/* Badge tipo de entrega */}
        <div className="mt-2">
          {item.delivery_type === 'FILE' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40">
              <FileArchive className="w-3 h-3" /> Archivo digital
            </span>
          )}
          {item.delivery_type === 'KEY' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Key className="w-3 h-3" /> Clave / Licencia
            </span>
          )}
          {item.delivery_type === 'OFFICIAL_ACCESS' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
              <ExternalLink className="w-3 h-3" /> Acceso oficial
            </span>
          )}
        </div>

        {/* Para KEY: mostrar la clave */}
        {item.delivery_type === 'KEY' && item.license_key && (
          <div className="mt-3 bg-amber-950/30 border border-amber-900/50 rounded-lg p-3">
            <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider mb-1">Tu clave:</p>
            <code className="text-amber-200 text-sm font-mono break-all">{item.license_key}</code>
            {item.activation_instructions && (
              <p className="text-[11px] text-gray-400 mt-2">{item.activation_instructions}</p>
            )}
          </div>
        )}

        {/* Para OFFICIAL_ACCESS: mostrar instrucciones */}
        {item.delivery_type === 'OFFICIAL_ACCESS' && (
          <div className="mt-3 bg-blue-950/30 border border-blue-900/50 rounded-lg p-3">
            {item.access_instructions && (
              <p className="text-[11px] text-blue-200">{item.access_instructions}</p>
            )}
          </div>
        )}

        {/* Para FILE: info de descargas restantes */}
        {item.delivery_type === 'FILE' && item.max_downloads && (
          <p className="text-[10px] text-gray-500 mt-2">
            Descargas restantes: {item.max_downloads - (item.downloads_count || 0)} de {item.max_downloads}
          </p>
        )}
      </div>

      {/* Botón de acción */}
      <div className="shrink-0">
        {item.delivery_type === 'FILE' && item.delivery_token && (
          <button
            onClick={() => onDownload(item)}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-violet-500/30"
          >
            <Download className="w-4 h-4" />
            DESCARGAR
          </button>
        )}
        {item.delivery_type === 'KEY' && item.license_key && (
          <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-2.5 rounded-lg border border-emerald-500/40">
            <CheckCircle2 className="w-4 h-4" />
            ENTREGADO
          </span>
        )}
        {item.delivery_type === 'OFFICIAL_ACCESS' && item.official_url && (
          <a
            href={item.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            ACCEDER
          </a>
        )}
        {item.status === 'pending' && (
          <span className="inline-flex items-center gap-1 bg-gray-800 text-gray-400 text-xs font-bold px-3 py-2.5 rounded-lg">
            <Clock className="w-4 h-4" />
            PENDIENTE
          </span>
        )}
      </div>
    </div>
  );
}
