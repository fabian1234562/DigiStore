'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Package, Upload, Check, X, Loader2, ShieldCheck, AlertTriangle,
  Trash2, RefreshCw, FileArchive, Hash, HardDrive, Plus, Lock,
  Download, Eye, ToggleLeft, ToggleRight, Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  is_free: boolean;
  image?: string;
  iconEmoji?: string;
  version: string;
  file_name?: string;
  file_size: number;
  file_type?: string;
  storage_key?: string;
  sha256?: string;
  download_enabled: boolean;
  distribution_allowed: boolean;
  verified: boolean;
  tags: string[];
  badge?: string;
  createdAt: string;
}

// Clave por defecto. En producción cambiar en Vercel > Settings > Environment Variables
// ADMIN_SECRET_KEY=tu-clave-segura-aqui
const ADMIN_KEY_DEFAULT = 'digistore-admin-change-this-in-production';

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function shortHash(hash?: string): string {
  if (!hash || hash.length < 16) return hash || '—';
  return `${hash.substring(0, 8)}…${hash.substring(hash.length - 8)}`;
}

export default function AdminProductsPage() {
  const [adminKey, setAdminKey] = useState(ADMIN_KEY_DEFAULT);
  const [authed, setAuthed] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/products', {
        headers: { 'x-admin-key': adminKey },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setProducts(data.products || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  // Auto-login con la clave por defecto
  useEffect(() => {
    if (adminKey && !authed) {
      setAuthed(true);
    }
  }, [adminKey, authed]);

  useEffect(() => {
    if (authed) loadProducts();
  }, [authed, loadProducts]);

  // Verificar auth
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) return;
    setAuthed(true);
  };

  const handleApiResponse = (ok: boolean, message: string) => {
    setToast({ type: ok ? 'success' : 'error', message });
    setTimeout(() => setToast(null), 4000);
    if (ok) loadProducts();
  };

  // Subir archivo
  const handleUpload = async (product: Product, file: File, version?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (version) formData.append('version', version);

    try {
      const res = await fetch(`/api/admin/products/${product.id}/upload`, {
        method: 'POST',
        headers: { 'x-admin-key': adminKey },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);
      handleApiResponse(true, `Archivo subido. SHA-256: ${data.file.sha256.substring(0, 16)}…`);
    } catch (err) {
      handleApiResponse(false, err instanceof Error ? err.message : 'Error subiendo archivo');
    }
  };

  // Verificar producto
  const handleVerify = async (product: Product) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}/verify`, {
        method: 'POST',
        headers: {
          'x-admin-key': adminKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ verified: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);
      handleApiResponse(true, `Verificado: SHA-256 coincide ✓`);
    } catch (err) {
      handleApiResponse(false, err instanceof Error ? err.message : 'Error verificando');
    }
  };

  // Toggle flags
  const handleToggle = async (product: Product, field: 'download_enabled' | 'distribution_allowed') => {
    try {
      const newValue = !product[field];
      const res = await fetch(`/api/admin/products/${product.id}/toggle`, {
        method: 'POST',
        headers: {
          'x-admin-key': adminKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ [field]: newValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);
      handleApiResponse(true, `${field === 'download_enabled' ? 'Descarga' : 'Distribución'} ${newValue ? 'activada' : 'desactivada'}`);
    } catch (err) {
      handleApiResponse(false, err instanceof Error ? err.message : 'Error');
    }
  };

  // ─── DOWNLOAD DIRECTO (admin) ───
  // Genera token temporal y descarga el archivo real
  const handleDownload = async (product: Product) => {
    try {
      showToast('success', `Generando link de descarga para ${product.name}...`);
      const res = await fetch(`/api/admin/products/${product.id}/download`, {
        method: 'POST',
        headers: { 'x-admin-key': adminKey },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);

      // Abrir URL de descarga directa en nueva pestaña
      // El navegador descargará el archivo automáticamente (Content-Disposition: attachment)
      const downloadUrl = `/api/download/${data.token}/file`;
      window.open(downloadUrl, '_blank');

      showToast('success', `Descargando ${data.fileName} (${(data.fileSize / 1024 / 1024).toFixed(1)} MB)`);
    } catch (err) {
      handleApiResponse(false, err instanceof Error ? err.message : 'Error al descargar');
    }
  };

  // Eliminar producto
  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Eliminar "${product.name}"? Esto también borra el archivo del storage.`)) return;
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);
      handleApiResponse(true, 'Producto eliminado');
      setSelectedProduct(null);
    } catch (err) {
      handleApiResponse(false, err instanceof Error ? err.message : 'Error');
    }
  };

  // Crear producto
  const handleCreate = async (data: any) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'x-admin-key': adminKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || result.error);
      handleApiResponse(true, `Producto "${data.name}" creado`);
      setShowCreate(false);
    } catch (err) {
      handleApiResponse(false, err instanceof Error ? err.message : 'Error');
    }
  };

  // ─── Pantalla login ───
  if (!authed) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900/80 border border-gray-800 rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center mb-3">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold">Panel Admin</h1>
            <p className="text-xs text-gray-400 mt-1">Ingresa tu clave de administrador</p>
          </div>
          <form onSubmit={handleAuth}>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Admin Secret Key
            </label>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="digistore-admin-..."
              autoFocus
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:border-violet-500 focus:outline-none font-mono"
            />
            <button
              type="submit"
              className="w-full mt-4 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 rounded-lg transition-colors"
            >
              Acceder
            </button>
          </form>
          <p className="text-[10px] text-gray-500 mt-4 text-center">
            Valor por defecto: <code className="text-amber-300">{ADMIN_KEY_DEFAULT}</code>
            <br />
            <span className="text-red-400">Cámbialo en producción vía ADMIN_SECRET_KEY env var</span>
          </p>
        </div>
      </main>
    );
  }

  // ─── Pantalla principal ───
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <Package className="w-6 h-6 text-violet-400" />
              Administrar Productos
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              {products.length} productos · {products.filter(p => p.verified && p.download_enabled && p.distribution_allowed).length} descargables
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadProducts}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition-colors"
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              Refrescar
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-sm font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo producto
            </button>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, slug o categoría..."
          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm placeholder:text-gray-600 focus:border-violet-500 focus:outline-none mb-4"
        />

        {/* Error */}
        {error && (
          <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-3 mb-4 text-sm text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Products table */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 border-b border-gray-800">
              <tr className="text-left text-xs uppercase tracking-wider text-gray-400">
                <th className="p-3">Producto</th>
                <th className="p-3">Archivo</th>
                <th className="p-3">Verif.</th>
                <th className="p-3">Descarga</th>
                <th className="p-3">Distrib.</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                    Cargando productos...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    No hay productos. Crea uno nuevo con el botón de arriba.
                  </td>
                </tr>
              )}
              {filtered.map((product) => {
                const canDownload = product.verified && product.download_enabled && product.distribution_allowed;
                return (
                  <tr key={product.id} className="hover:bg-gray-900/60">
                    <td className="p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 text-lg">
                          {product.iconEmoji || '📦'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">{product.name}</p>
                          <p className="text-[10px] text-gray-500 font-mono">{product.slug}</p>
                          <p className="text-[10px] text-gray-500">{product.category} · {product.is_free ? 'GRATIS' : `$${product.price}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      {product.file_name ? (
                        <div>
                          <p className="text-xs text-gray-300 truncate max-w-[140px]" title={product.file_name}>
                            {product.file_name}
                          </p>
                          <p className="text-[10px] text-gray-500">{formatBytes(product.file_size)} · v{product.version}</p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-600">— sin archivo —</span>
                      )}
                    </td>
                    <td className="p-3">
                      {product.verified ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-gray-600" />
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggle(product, 'download_enabled')}
                        title={product.download_enabled ? 'Desactivar descarga' : 'Activar descarga'}
                      >
                        {product.download_enabled ? (
                          <ToggleRight className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-600" />
                        )}
                      </button>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggle(product, 'distribution_allowed')}
                        title={product.distribution_allowed ? 'Quitar autorización' : 'Autorizar distribución'}
                      >
                        {product.distribution_allowed ? (
                          <ToggleRight className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-600" />
                        )}
                      </button>
                    </td>
                    <td className="p-3">
                      {canDownload ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <Check className="w-3 h-3" /> DESCARGABLE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-800 text-gray-400 border border-gray-700">
                          NO DISPONIBLE
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-1 justify-end items-center">
                        {/* BOTÓN DESCARGAR — siempre visible si el producto es descargable */}
                        {canDownload && (
                          <button
                            onClick={() => handleDownload(product)}
                            title={`Descargar ${product.name} (${(product.file_size / 1024 / 1024).toFixed(1)} MB)`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-md shadow-emerald-500/20 mr-2"
                          >
                            <Download className="w-3.5 h-3.5" />
                            DESCARGAR
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedProduct(product)}
                          title="Ver detalles / subir archivo"
                          className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleVerify(product)}
                          title="Verificar integridad"
                          className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-emerald-400"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          title="Eliminar"
                          className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed bottom-6 right-6 z-[200] max-w-md px-4 py-3 rounded-xl shadow-2xl border flex items-start gap-3',
          toast.type === 'success'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
            : 'bg-red-50 border-red-300 text-red-800'
        )}>
          {toast.type === 'success' ? (
            <Check className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          )}
          <div className="flex-1 text-sm leading-snug">{toast.message}</div>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-700 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Product detail modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          adminKey={adminKey}
          onClose={() => setSelectedProduct(null)}
          onUpload={(file, version) => handleUpload(selectedProduct, file, version)}
          onVerify={() => handleVerify(selectedProduct)}
          onToggle={(field) => handleToggle(selectedProduct, field)}
          onChanged={() => loadProducts()}
        />
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateProductModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════
   Product Detail Modal
   ══════════════════════════════════════════════════════════════ */
function ProductDetailModal({
  product, adminKey, onClose, onUpload, onVerify, onToggle, onChanged,
}: {
  product: Product;
  adminKey: string;
  onClose: () => void;
  onUpload: (file: File, version?: string) => void;
  onVerify: () => void;
  onToggle: (field: 'download_enabled' | 'distribution_allowed') => void;
  onChanged: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [version, setVersion] = useState(product.version);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await onUpload(file, version);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white p-2">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 mb-6">
          <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center text-2xl">
            {product.iconEmoji || '📦'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white">{product.name}</h2>
            <p className="text-xs text-gray-500 font-mono">{product.slug}</p>
          </div>
        </div>

        {/* File info */}
        <div className="bg-gray-950/50 border border-gray-800 rounded-xl p-4 mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <FileArchive className="w-3.5 h-3.5" /> Archivo actual
          </h3>
          {product.file_name ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Nombre:</span>
                <span className="text-white font-medium">{product.file_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tamaño:</span>
                <span className="text-white">{formatBytes(product.file_size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tipo:</span>
                <span className="text-white">{product.file_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Versión:</span>
                <span className="text-white">{product.version}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">SHA-256:</span>
                <code className="text-[10px] text-amber-300 font-mono" title={product.sha256}>
                  {shortHash(product.sha256)}
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Storage key:</span>
                <code className="text-[10px] text-gray-500 font-mono">{product.storage_key}</code>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500">Sin archivo asociado</p>
          )}
        </div>

        {/* Upload new file */}
        <div className="bg-violet-950/30 border border-violet-900/50 rounded-xl p-4 mb-4">
          <h3 className="text-xs font-bold text-violet-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" /> Subir / reemplazar archivo
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0.0"
              className="bg-gray-950 border border-gray-700 rounded px-2 py-1 text-xs w-24 font-mono"
            />
            <input
              ref={fileRef}
              type="file"
              onChange={handleFileSelect}
              disabled={uploading}
              className="flex-1 text-xs text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-violet-600 file:text-white file:font-bold file:cursor-pointer file:hover:bg-violet-700"
            />
          </div>
          {uploading && (
            <p className="text-xs text-violet-300 flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" /> Subiendo y calculando SHA-256...
            </p>
          )}
          <p className="text-[10px] text-gray-500 mt-2">
            Máximo 50MB. El SHA-256 se calcula automáticamente.
          </p>
        </div>

        {/* Verification status */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className={cn(
            'border rounded-lg p-3 text-center',
            product.verified ? 'bg-emerald-950/40 border-emerald-800' : 'bg-gray-900 border-gray-800'
          )}>
            <ShieldCheck className={cn('w-5 h-5 mx-auto mb-1', product.verified ? 'text-emerald-400' : 'text-gray-600')} />
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Verificado</p>
            <p className={cn('text-xs font-bold', product.verified ? 'text-emerald-300' : 'text-gray-500')}>
              {product.verified ? 'SÍ' : 'NO'}
            </p>
          </div>
          <div className={cn(
            'border rounded-lg p-3 text-center cursor-pointer',
            product.download_enabled ? 'bg-emerald-950/40 border-emerald-800' : 'bg-gray-900 border-gray-800'
          )} onClick={() => onToggle('download_enabled')}>
            <ToggleRight className={cn('w-5 h-5 mx-auto mb-1', product.download_enabled ? 'text-emerald-400' : 'text-gray-600')} />
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Descarga</p>
            <p className={cn('text-xs font-bold', product.download_enabled ? 'text-emerald-300' : 'text-gray-500')}>
              {product.download_enabled ? 'ACTIVA' : 'OFF'}
            </p>
          </div>
          <div className={cn(
            'border rounded-lg p-3 text-center cursor-pointer',
            product.distribution_allowed ? 'bg-emerald-950/40 border-emerald-800' : 'bg-gray-900 border-gray-800'
          )} onClick={() => onToggle('distribution_allowed')}>
            <Check className={cn('w-5 h-5 mx-auto mb-1', product.distribution_allowed ? 'text-emerald-400' : 'text-gray-600')} />
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Distrib.</p>
            <p className={cn('text-xs font-bold', product.distribution_allowed ? 'text-emerald-300' : 'text-gray-500')}>
              {product.distribution_allowed ? 'SÍ' : 'NO'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onVerify}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2 rounded-lg"
          >
            <ShieldCheck className="w-4 h-4" /> Verificar integridad
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Create Product Modal
   ══════════════════════════════════════════════════════════════ */
function CreateProductModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: any) => void }) {
  const [form, setForm] = useState({
    slug: '',
    name: '',
    description: '',
    category: 'hacking',
    price: 0,
    is_free: true,
    iconEmoji: '📦',
    version: '1.0.0',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug || !form.name || !form.description) return;
    onCreate(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white p-2">
          <X className="w-4 h-4" />
        </button>
        <h2 className="text-xl font-bold text-white mb-4">Nuevo producto</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Slug (único)</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
              placeholder="mi-producto"
              required
              className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Mi producto"
              required
              className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descripción del producto..."
              required
              rows={3}
              className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Categoría</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm"
              >
                <option value="hacking">Hacking</option>
                <option value="games">Juegos</option>
                <option value="apps">Apps</option>
                <option value="test">Test</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Precio USD</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                disabled={form.is_free}
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm disabled:opacity-50"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_free}
              onChange={(e) => setForm({ ...form, is_free: e.target.checked, price: e.target.checked ? 0 : form.price })}
              className="rounded"
            />
            Producto gratis
          </label>
          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 rounded-lg"
          >
            Crear producto
          </button>
          <p className="text-[10px] text-gray-500">
            Después de crear, podrás subir el archivo desde el detalle del producto.
          </p>
        </form>
      </div>
    </div>
  );
}
