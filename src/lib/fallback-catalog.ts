/**
 * CATÁLOGO FALLBACK — Productos disponibles sin DB.
 *
 * Cuando DATABASE_URL no está configurada (Vercel sin DB),
 * este catálogo hardcodeado sirve los productos con sus
 * storage_keys reales (calculados en el seed local).
 *
 * En producción con Postgres configurado, este catálogo
 * se ignora y se usa la DB.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { calculateSha256 } from './storage';

export interface FallbackProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice: number;
  currency: string;
  is_free: boolean;
  image: string;
  iconEmoji: string;
  version: string;
  tags: string[];
  featured: boolean;
  badge: string;
  // Archivo
  file_name: string;
  file_size: number;
  file_type: string;
  storage_key: string;
  sha256: string;
  // Flags
  verified: boolean;
  download_enabled: boolean;
  distribution_allowed: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Catálogo estático con productos precargados.
 * Los storage_keys y sha256 son los calculados en el seed.
 */
const STATIC_CATALOG: FallbackProduct[] = [
  {
    id: 'fallback-manual-pentesting',
    slug: 'manual-pentesting-web',
    name: 'Manual de Pentesting Web',
    description: 'Guía completa para auditar y explotar aplicaciones web modernas',
    longDescription: 'Manual profesional de 30+ páginas cubriendo metodologías (PTES, OWASP WSTG), HTTP a fondo, OWASP Top 10 con explotación detallada, SQLi/XSS/CSRF/SSRF/IDOR.',
    category: 'hacking',
    subcategory: 'pentesting',
    price: 24.99,
    originalPrice: 49.99,
    currency: 'USD',
    is_free: false,
    image: '/images/security/red-team.jpg',
    iconEmoji: '📕',
    version: '1.0.0',
    tags: ['pentesting', 'web-security', 'owasp', 'manual', 'pdf'],
    featured: true,
    badge: 'MÁS VENDIDO',
    file_name: 'manual-pentesting-web.pdf',
    file_size: 80943,
    file_type: 'application/pdf',
    // Estos valores se calculan al hacer el seed. Si no coinciden,
    // el archivo se re-calcula al primer request.
    storage_key: '',
    sha256: '',
    verified: true,
    download_enabled: true,
    distribution_allowed: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'fallback-guia-osint',
    slug: 'guia-osint-practica',
    name: 'Guía OSINT Práctica',
    description: 'Open Source Intelligence: de la teoría a la investigación real',
    longDescription: 'Guía práctica de OSINT con casos de uso reales. Ciclo de inteligencia, marco legal, investigación de personas y empresas.',
    category: 'hacking',
    subcategory: 'osint',
    price: 14.99,
    originalPrice: 29.99,
    currency: 'USD',
    is_free: false,
    image: '/images/security/osint.jpg',
    iconEmoji: '🔍',
    version: '1.0.0',
    tags: ['osint', 'investigation', 'recon', 'pdf'],
    featured: true,
    badge: 'POPULAR',
    file_name: 'guia-osint-practica.pdf',
    file_size: 73558,
    file_type: 'application/pdf',
    storage_key: '',
    sha256: '',
    verified: true,
    download_enabled: true,
    distribution_allowed: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'fallback-pack-scripts',
    slug: 'pack-scripts-python',
    name: 'Pack 12 Scripts Python para Hacking Ético',
    description: 'Herramientas listas para usar en tus pentests',
    longDescription: 'Pack de 12 scripts Python profesionales: port scanner, subdomain enum, dir bruter, hash cracker, SQLi/XSS scanner.',
    category: 'hacking',
    subcategory: 'tools',
    price: 9.99,
    originalPrice: 19.99,
    currency: 'USD',
    is_free: false,
    image: '/images/security/malware-analysis.jpg',
    iconEmoji: '🐍',
    version: '1.0.0',
    tags: ['python', 'scripts', 'tools', 'zip'],
    featured: true,
    badge: 'MEJOR VALOR',
    file_name: 'pack-scripts-python.zip',
    file_size: 13822,
    file_type: 'application/zip',
    storage_key: '',
    sha256: '',
    verified: true,
    download_enabled: true,
    distribution_allowed: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'fallback-cheatsheet',
    slug: 'cheatsheet-hacking',
    name: 'Cheatsheet Hacking Esencial',
    description: 'Referencia rápida de comandos, payloads y herramientas',
    longDescription: 'Cheatsheet de una sola página con todos los comandos esenciales.',
    category: 'hacking',
    subcategory: 'cheatsheet',
    price: 4.99,
    originalPrice: 9.99,
    currency: 'USD',
    is_free: false,
    image: '/images/security/cryptography.jpg',
    iconEmoji: '⚡',
    version: '1.0.0',
    tags: ['cheatsheet', 'reference', 'pdf'],
    featured: false,
    badge: 'BARATO',
    file_name: 'cheatsheet-hacking.pdf',
    file_size: 68580,
    file_type: 'application/pdf',
    storage_key: '',
    sha256: '',
    verified: true,
    download_enabled: true,
    distribution_allowed: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'fallback-test-snake',
    slug: 'test-premium-snake',
    name: 'Snake Premium (Test)',
    description: 'Juego HTML5 clásico - Producto de prueba',
    longDescription: 'Juego Snake en HTML5. Producto de prueba para auditar el flujo completo.',
    category: 'test',
    subcategory: 'game',
    price: 0.99,
    originalPrice: 4.99,
    currency: 'USD',
    is_free: false,
    image: '/images/security/general.jpg',
    iconEmoji: '🐍',
    version: '1.0.0',
    tags: ['test', 'demo', 'juego', 'html5'],
    featured: false,
    badge: 'TEST - FLUJO DE PAGO',
    file_name: 'test-premium-snake.zip',
    file_size: 4226,
    file_type: 'application/zip',
    storage_key: '',
    sha256: '',
    verified: true,
    download_enabled: true,
    distribution_allowed: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

/**
 * Cache de productos con storage_key/sha256 calculados.
 * Se calcula al primer acceso (lazy).
 */
let catalogCache: FallbackProduct[] | null = null;

/**
 * Devuelve el catálogo fallback con storage_key y sha256 calculados.
 * Si los productos ya tienen storage_key (de un seed previo), los usa.
 * Si no, los calcula al vuelo leyendo de /public/downloads/.
 */
export async function getFallbackCatalog(): Promise<FallbackProduct[]> {
  if (catalogCache) return catalogCache;

  const catalog: FallbackProduct[] = [];

  for (const product of STATIC_CATALOG) {
    let p = { ...product };

    // Si no tiene storage_key, calcularla leyendo el archivo
    if (!p.storage_key || !p.sha256) {
      try {
        const filePath = path.join(process.cwd(), 'public', 'downloads', p.file_name);
        const buffer = await fs.readFile(filePath);
        const sha256 = calculateSha256(buffer);
        // Generar storage_key desde sha256
        const part1 = sha256.substring(0, 2);
        const part2 = sha256.substring(2, 4);
        const safeName = p.file_name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storageKey = path.join(part1, part2, sha256, safeName);

        // Guardar en storage privado si no existe
        const privatePath = path.join(process.cwd(), 'public', 'downloads', 'private', storageKey);
        try {
          await fs.access(privatePath);
        } catch {
          await fs.mkdir(path.dirname(privatePath), { recursive: true });
          await fs.writeFile(privatePath, buffer);
        }

        p.sha256 = sha256;
        p.storage_key = storageKey;
        p.file_size = buffer.length;
      } catch (err) {
        console.error(`[fallback] Error loading ${p.file_name}:`, err);
      }
    }

    catalog.push(p);
  }

  catalogCache = catalog;
  return catalog;
}

/**
 * Busca un producto por ID en el catálogo fallback.
 */
export async function getFallbackProductById(id: string): Promise<FallbackProduct | null> {
  const catalog = await getFallbackCatalog();
  return catalog.find((p) => p.id === id || p.slug === id) || null;
}

/**
 * Busca un producto por slug.
 */
export async function getFallbackProductBySlug(slug: string): Promise<FallbackProduct | null> {
  const catalog = await getFallbackCatalog();
  return catalog.find((p) => p.slug === slug) || null;
}

/**
 * Lista productos descargables del catálogo fallback.
 */
export async function listFallbackDownloadableProducts(filter?: {
  category?: string;
  is_free?: boolean;
}): Promise<FallbackProduct[]> {
  const catalog = await getFallbackCatalog();
  return catalog.filter((p) => {
    if (!p.verified || !p.download_enabled || !p.distribution_allowed) return false;
    if (filter?.category && p.category !== filter.category) return false;
    if (filter?.is_free !== undefined && p.is_free !== filter.is_free) return false;
    return true;
  });
}
