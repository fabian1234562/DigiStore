import { NextResponse } from 'next/server';
import {
  getAdminSettings,
  setAdminSettings,
  listImportedProjects,
  removeImportedProject,
  getImportedProject,
} from '@/lib/security-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Admin API — protected by a simple URL-key check (?key=...).
 *
 * GET  /api/security/admin?key=KEY
 *   Returns: { autoImport, importedCount, imported: [...] }
 *
 * POST /api/security/admin?key=KEY
 *   Body: { autoImport?: boolean }
 *   Updates admin settings (in-memory).
 *
 * DELETE /api/security/admin?key=KEY&id=PROJECT_ID
 *   Removes an imported project from the catalog.
 */
const ADMIN_KEY = 'digistore-admin-2024';

function isAuthorized(request: Request): boolean {
  const url = new URL(request.url);
  return url.searchParams.get('key') === ADMIN_KEY;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }
  const settings = getAdminSettings();
  const imported = listImportedProjects();
  return NextResponse.json({
    success: true,
    autoImport: settings.autoImport,
    importedCount: imported.length,
    imported,
  });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }
  let body: { autoImport?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido.' }, { status: 400 });
  }
  const next = setAdminSettings({
    autoImport: typeof body.autoImport === 'boolean' ? body.autoImport : undefined,
  });
  return NextResponse.json({ success: true, settings: next });
}

export async function DELETE(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Parámetro "id" requerido.' }, { status: 400 });
  }
  if (!getImportedProject(id)) {
    return NextResponse.json({ error: 'Proyecto no encontrado.' }, { status: 404 });
  }
  removeImportedProject(id);
  return NextResponse.json({ success: true, message: 'Proyecto eliminado del catálogo.' });
}
