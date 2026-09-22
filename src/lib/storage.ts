/**
 * STORAGE — Manejo de archivos digitales privados.
 *
 * Arquitectura:
 *   /public/downloads/private/[sha256]/[filename]
 *
 * Seguridad:
 *   - Los archivos NO se sirven directamente desde /public/downloads/private/*
 *   - El frontend NUNCA ve la URL real del archivo
 *   - Todo acceso se hace vía /api/download/[token]/file que verifica el token
 *   - El directorio /public/downloads/private/ no se lista
 *
 * Para producción con archivos grandes (>50MB):
 *   - Migrar a Vercel Blob Storage o AWS S3 con URLs firmadas
 *   - El storage_key del Product será entonces el blob URL o S3 key
 *   - La función getFileStream() deberá adaptarse al provider
 */

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const STORAGE_ROOT = path.join(process.cwd(), 'public', 'downloads', 'private');

/**
 * Calcula el SHA-256 de un buffer.
 */
export function calculateSha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Genera un storage_key único para un archivo basado en su SHA-256.
 * El storage_key es el path relativo dentro del storage privado.
 *
 * Ejemplo: "ab/cd/abcdef1234.../manual-pentesting-web.pdf"
 *
 * Los primeros 2 niveles (ab/cd) son para evitar demasiados archivos
 * en un mismo directorio (mejora el rendimiento del FS).
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
  // Prevenir path traversal: el storage_key no debe contener ..
  if (storageKey.includes('..')) {
    throw new Error('storage_key inválido');
  }
  return path.join(STORAGE_ROOT, storageKey);
}

/**
 * Guarda un archivo en el storage privado.
 *
 * @param buffer - contenido del archivo
 * @param fileName - nombre original del archivo
 * @returns objeto con storage_key, sha256, size
 */
export async function saveFile(
  buffer: Buffer,
  fileName: string,
): Promise<{
  storageKey: string;
  sha256: string;
  size: number;
  mimeType: string;
}> {
  const sha256 = calculateSha256(buffer);
  const storageKey = generateStorageKey(sha256, fileName);
  const absolutePath = getAbsolutePath(storageKey);

  // Crear directorio si no existe
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });

  // Verificar si ya existe un archivo con el mismo SHA (dedupe)
  try {
    await fs.access(absolutePath);
    // Ya existe, no need to write again
  } catch {
    // No existe, escribir
    await fs.writeFile(absolutePath, buffer);
  }

  const mimeType = detectMimeType(fileName);

  return {
    storageKey,
    sha256,
    size: buffer.length,
    mimeType,
  };
}

/**
 * Lee un archivo del storage privado como Buffer.
 */
export async function readFile(storageKey: string): Promise<Buffer> {
  const absolutePath = getAbsolutePath(storageKey);
  return await fs.readFile(absolutePath);
}

/**
 * Verifica que un archivo existe y su SHA-256 coincide con el esperado.
 * Útil para auditoría: comprobar que el archivo no fue modificado.
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
    // Intentar limpiar directorios vacíos
    const dir = path.dirname(absolutePath);
    try {
      await fs.rmdir(dir);
      await fs.rmdir(path.dirname(dir));
      await fs.rmdir(path.dirname(path.dirname(dir)));
    } catch {
      // Directorio no vacío, no importa
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Detecta el MIME type según la extensión del archivo.
 */
export function detectMimeType(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    zip: 'application/zip',
    rar: 'application/vnd.rar',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',
    bz2: 'application/x-bzip2',
    xz: 'application/x-xz',
    exe: 'application/vnd.microsoft.portable-executable',
    msi: 'application/x-msi',
    dmg: 'application/x-apple-diskimage',
    pkg: 'application/x-newton-compatible-pkg',
    deb: 'application/vnd.debian.binary-package',
    rpm: 'application/x-rpm',
    AppImage: 'application/vnd.appimage',
    epub: 'application/epub+zip',
    mobi: 'application/x-mobipocket-ebook',
    azw3: 'application/vnd.amazon.ebook',
    mp4: 'video/mp4',
    mkv: 'video/x-matroska',
    mp3: 'audio/mpeg',
    flac: 'audio/flac',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    html: 'text/html',
    json: 'application/json',
    txt: 'text/plain',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Formatea un tamaño de bytes a string legible.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
