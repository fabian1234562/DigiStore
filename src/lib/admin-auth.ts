/**
 * ADMIN AUTH — Validación segura de claves administrativas.
 *
 * REGLA CRÍTICA:
 *   En producción (NODE_ENV=production), si ADMIN_SECRET_KEY no está configurado
 *   o tiene el valor por defecto, se BLOQUEA el acceso administrativo.
 *
 * Uso:
 *   import { checkAdminAuth } from '@/lib/admin-auth';
 *
 *   const authResult = checkAdminAuth(request);
 *   if (!authResult.ok) {
 *     return NextResponse.json({ error: authResult.error }, { status: authResult.status });
 *   }
 */

const DEFAULT_ADMIN_KEY = 'digistore-admin-change-this-in-production';

export interface AdminAuthResult {
  ok: boolean;
  error?: string;
  status?: number;
}

/**
 * Valida que el request tenga autorización admin válida.
 *
 * En producción:
 *   - Si ADMIN_SECRET_KEY no está configurado → bloquea
 *   - Si ADMIN_SECRET_KEY es el valor por defecto → bloquea
 *   - Si la clave enviada no coincide → bloquea
 *
 * En desarrollo:
 *   - Permite el valor por defecto para facilitar pruebas
 */
export function checkAdminAuth(request: Request): AdminAuthResult {
  const envKey = process.env.ADMIN_SECRET_KEY;
  const isProduction = process.env.NODE_ENV === 'production';

  // En producción, validar que la clave esté configurada y no sea el default
  if (isProduction) {
    if (!envKey) {
      return {
        ok: false,
        error: 'admin_key_not_configured',
        status: 500,
      };
    }
    if (envKey === DEFAULT_ADMIN_KEY) {
      return {
        ok: false,
        error: 'admin_key_is_default_change_it',
        status: 500,
      };
    }
  }

  // Obtener clave del request
  const providedKey = request.headers.get('x-admin-key');
  const effectiveKey = envKey || DEFAULT_ADMIN_KEY;

  if (!providedKey || providedKey !== effectiveKey) {
    return {
      ok: false,
      error: 'unauthorized',
      status: 401,
    };
  }

  return { ok: true };
}

/**
 * Devuelve la clave admin efectiva (para uso interno).
 * NO exportar al frontend.
 */
export function getAdminKey(): string {
  return process.env.ADMIN_SECRET_KEY || DEFAULT_ADMIN_KEY;
}
