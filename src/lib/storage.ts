/**
 * STORAGE — Manejo de archivos digitales privados.
 *
 * Arquitectura:
 *   - Archivos locales: /public/downloads/private/[sha256]/[filename]
 *   - Archivos remotos: storage_key = "remote:https://..."
 *     Se descargan on-demand al servir, no se persisten localmente
 *
 * El storage_key NUNCA se expone al frontend.
 */

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const STORAGE_ROOT = path.join(process.cwd(), 'public', 'downloads', 'private');

/**
 * Calcula SHA-256 de un buffer.
 */
export function calculateSha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Verifica si un storage_key es remoto (URL).
 */
export function isRemoteStorageKey(storageKey: string | null | undefined): boolean {
  if (!storageKey) return false;
  return storageKey.startsWith('remote:');
}

/**
 * Extrae la URL de un storage_key remoto.
 */
export function getRemoteUrl(storageKey: string): string {
  return storageKey.replace(/^remote:/, '');
}

/**
 * Genera un storage_key único para un archivo local basado en su SHA-256.
 */
export function generateStorageKey(sha256: string, fileName: string): string {
  if (!sha256 || sha256.length < 4) {
    throw new Error('SHA-256 inválido para generar storage_key');
  }
  const part1 = sha256.substring(0, 2);
  const part2 = sha256.substring(2, 4);
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return path.join(part1, part2, sha256, safeName);
}

/**
 * Devuelve el path absoluto en el filesystem para un storage_key.
 */
export function getAbsolutePath(storageKey: string): string {
  if (storageKey.includes('..')) {
    throw new Error('storage_key inválido');
  }
  return path.join(STORAGE_ROOT, storageKey);
}

/**
 * Guarda un archivo en el storage privado.
 */
export async function saveFile(
  buffer: Buffer,
  fileName: string,
): Promise<{ storageKey: string; sha256: string; size: number; mimeType: string }> {
  const sha256 = calculateSha256(buffer);
  const storageKey = generateStorageKey(sha256, fileName);
  const absolutePath = getAbsolutePath(storageKey);

  await fs.mkdir(path.dirname(absolutePath), { recursive: true });

  try {
    await fs.access(absolutePath);
  } catch {
    await fs.writeFile(absolutePath, buffer);
  }

  return {
    storageKey,
    sha256,
    size: buffer.length,
    mimeType: detectMimeType(fileName),
  };
}

/**
 * Lee un archivo del storage.
 * Soporta:
 *   - Local: storage_key normal (path relativo dentro de STORAGE_ROOT)
 *   - Remoto: storage_key = "remote:https://..." → fetch on-demand
 *
 * Para archivos remotos, descarga el binario en cada request.
 * No se cachea en disco (efímero en Vercel serverless).
 */
export async function readFile(storageKey: string): Promise<Buffer> {
  // Caso remoto
  if (isRemoteStorageKey(storageKey)) {
    const url = getRemoteUrl(storageKey);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'DigiStore-Downloader/1.0' },
      redirect: 'follow',
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch remote file: ${res.status} ${res.statusText}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  // Caso local
  const absolutePath = getAbsolutePath(storageKey);
  return await fs.readFile(absolutePath);
}

/**
 * Verifica integridad de un archivo.
 */
export async function verifyFileIntegrity(
  storageKey: string,
  expectedSha256: string,
): Promise<{
  exists: boolean;
  sha256Matches: boolean;
  actualSha256: string | null;
  size: number | null;
}> {
  const absolutePath = getAbsolutePath(storageKey);
  try {
    const buffer = await fs.readFile(absolutePath);
    const actualSha256 = calculateSha256(buffer);
    return {
      exists: true,
      sha256Matches: actualSha256 === expectedSha256,
      actualSha256,
      size: buffer.length,
    };
  } catch {
    return {
      exists: false,
      sha256Matches: false,
      actualSha256: null,
      size: null,
    };
  }
}

/**
 * Elimina un archivo del storage.
 */
export async function deleteFile(storageKey: string): Promise<boolean> {
  const absolutePath = getAbsolutePath(storageKey);
  try {
    await fs.unlink(absolutePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detecta MIME type según extensión.
 */
export function detectMimeType(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    zip: 'application/zip',
    exe: 'application/vnd.microsoft.portable-executable',
    msi: 'application/x-msi',
    dmg: 'application/x-apple-diskimage',
    pkg: 'application/x-newton-compatible-pkg',
    deb: 'application/vnd.debian.binary-package',
    rpm: 'application/x-rpm',
    AppImage: 'application/vnd.appimage',
    html: 'text/html',
    json: 'application/json',
    txt: 'text/plain',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Formatea bytes a string legible.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
