/**
 * SEED — Poblar la DB con los productos iniciales.
 *
 * Ejecutar con: bunx tsx scripts/seed-products.ts
 *
 * Crea 5 productos en la DB:
 *   1. Manual de Pentesting Web ($24.99) - con archivo PDF ya subido
 *   2. Guía OSINT Práctica ($14.99) - con archivo PDF ya subido
 *   3. Pack 12 Scripts Python ($9.99) - con archivo ZIP ya subido
 *   4. Cheatsheet Hacking Esencial ($4.99) - con archivo PDF ya subido
 *   5. Snake Premium (Test) ($0.99) - con archivo ZIP ya subido
 *
 * Para cada producto:
 *   - Lee el archivo de /public/downloads/
 *   - Calcula SHA-256
 *   - Lo guarda en /public/downloads/private/[sha256]/[name]
 *   - Crea el Product en DB con storage_key, sha256, verified=true
 *   - Marca download_enabled=true y distribution_allowed=true
 */

import { db } from '../src/lib/db';
import { saveFile, calculateSha256 } from '../src/lib/storage';
import { promises as fs } from 'fs';
import path from 'path';

interface SeedProduct {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice: number;
  is_free: boolean;
  iconEmoji: string;
  image: string;
  version: string;
  badge: string;
  featured: boolean;
  tags: string[];
  source: string;
  fileName: string;
  sourcePath: string; // path dentro de /public/downloads/
}

const SEED_PRODUCTS: SeedProduct[] = [
  {
    slug: 'manual-pentesting-web',
    name: 'Manual de Pentesting Web',
    description: 'Guía completa para auditar y explotar aplicaciones web modernas',
    longDescription: 'Manual profesional de 30+ páginas cubriendo metodologías (PTES, OWASP WSTG), HTTP a fondo, OWASP Top 10 con explotación detallada, SQLi/XSS/CSRF/SSRF/IDOR, bypass de WAF, post-explotación y reporte profesional con CVSS. Incluye plantillas de reporte y cheatsheet de payloads.',
    category: 'hacking',
    subcategory: 'pentesting',
    price: 24.99,
    originalPrice: 49.99,
    is_free: false,
    iconEmoji: '📕',
    image: '/images/security/red-team.jpg',
    version: '1.0.0',
    badge: 'MÁS VENDIDO',
    featured: true,
    tags: ['pentesting', 'web-security', 'owasp', 'sql-injection', 'xss', 'ethical-hacking', 'manual', 'pdf'],
    source: 'manual',
    fileName: 'manual-pentesting-web.pdf',
    sourcePath: 'manual-pentesting-web.pdf',
  },
  {
    slug: 'guia-osint-practica',
    name: 'Guía OSINT Práctica',
    description: 'Open Source Intelligence: de la teoría a la investigación real',
    longDescription: 'Guía práctica de OSINT con casos de uso reales. Ciclo de inteligencia, marco legal, investigación de personas (email, username pivoting, redes sociales), investigación de empresas y dominios, geolocalización de imágenes, búsqueda en dark web y anonimato del investigador.',
    category: 'hacking',
    subcategory: 'osint',
    price: 14.99,
    originalPrice: 29.99,
    is_free: false,
    iconEmoji: '🔍',
    image: '/images/security/osint.jpg',
    version: '1.0.0',
    badge: 'POPULAR',
    featured: true,
    tags: ['osint', 'investigation', 'recon', 'intelligence', 'privacy', 'pdf'],
    source: 'manual',
    fileName: 'guia-osint-practica.pdf',
    sourcePath: 'guia-osint-practica.pdf',
  },
  {
    slug: 'pack-scripts-python',
    name: 'Pack 12 Scripts Python para Hacking Ético',
    description: 'Herramientas listas para usar en tus pentests y auditorías',
    longDescription: 'Pack de 12 scripts Python profesionales: port scanner multihilo, enumerador de subdominios vía crt.sh, brute forcer de directorios, auditor de headers HTTP, crackeador de hashes, scanner de SQLi y XSS, WHOIS, DNS enum, screenshot tool, email validator, wordlist generator.',
    category: 'hacking',
    subcategory: 'tools',
    price: 9.99,
    originalPrice: 19.99,
    is_free: false,
    iconEmoji: '🐍',
    image: '/images/security/malware-analysis.jpg',
    version: '1.0.0',
    badge: 'MEJOR VALOR',
    featured: true,
    tags: ['python', 'scripts', 'tools', 'automation', 'pentesting', 'zip'],
    source: 'manual',
    fileName: 'pack-scripts-python.zip',
    sourcePath: 'pack-scripts-python.zip',
  },
  {
    slug: 'cheatsheet-hacking',
    name: 'Cheatsheet Hacking Esencial',
    description: 'Referencia rápida de comandos, payloads y herramientas',
    longDescription: 'Cheatsheet de una sola página con todos los comandos esenciales: reconocimiento (WHOIS, DNS, subdominios), escaneo de puertos (nmap, masscan), web hacking (SQLi, XSS, ffuf, nuclei), reverse shells por lenguaje, privilege escalation en Linux.',
    category: 'hacking',
    subcategory: 'cheatsheet',
    price: 4.99,
    originalPrice: 9.99,
    is_free: false,
    iconEmoji: '⚡',
    image: '/images/security/cryptography.jpg',
    version: '1.0.0',
    badge: 'BARATO',
    featured: false,
    tags: ['cheatsheet', 'reference', 'commands', 'quick-reference', 'pdf'],
    source: 'manual',
    fileName: 'cheatsheet-hacking.pdf',
    sourcePath: 'cheatsheet-hacking.pdf',
  },
  {
    slug: 'test-premium-snake',
    name: 'Snake Premium (Test)',
    description: 'Juego HTML5 clásico - Producto de prueba',
    longDescription: 'Juego Snake en HTML5. Producto de prueba para auditar el flujo de compra → pago → entrega → descarga de DigiStore.',
    category: 'test',
    subcategory: 'game',
    price: 0.99,
    originalPrice: 4.99,
    is_free: false,
    iconEmoji: '🐍',
    image: '/images/security/general.jpg',
    version: '1.0.0',
    badge: 'TEST - FLUJO DE PAGO',
    featured: false,
    tags: ['test', 'demo', 'juego', 'html5', 'prueba'],
    source: 'manual',
    fileName: 'test-premium-snake.zip',
    sourcePath: 'test-premium-snake.zip',
  },
];

async function seed() {
  console.log('🌱 Iniciando seed de productos...\n');

  for (const p of SEED_PRODUCTS) {
    console.log(`📦 Procesando: ${p.name}`);

    // Verificar si ya existe
    const existing = await db.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      console.log(`   ⚠️  Ya existe, saltando (usa --force para re-crear)\n`);
      continue;
    }

    // Leer archivo fuente
    const sourceFilePath = path.join(process.cwd(), 'public', 'downloads', p.sourcePath);
    let buffer: Buffer;
    try {
      buffer = await fs.readFile(sourceFilePath);
      console.log(`   📄 Archivo leído: ${p.fileName} (${buffer.length} bytes)`);
    } catch (err) {
      console.error(`   ❌ No se encontró el archivo: ${sourceFilePath}`);
      continue;
    }

    // Calcular SHA-256
    const sha256 = calculateSha256(buffer);
    console.log(`   🔐 SHA-256: ${sha256.substring(0, 16)}…`);

    // Guardar en storage privado
    const fileInfo = await saveFile(buffer, p.fileName);
    console.log(`   💾 Storage key: ${fileInfo.storageKey}`);

    // Crear producto en DB
    const product = await db.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        longDescription: p.longDescription,
        category: p.category,
        subcategory: p.subcategory,
        price: p.price,
        originalPrice: p.originalPrice,
        currency: 'USD',
        is_free: p.is_free,
        image: p.image,
        iconEmoji: p.iconEmoji,
        version: p.version,
        tags: JSON.stringify(p.tags),
        featured: p.featured,
        badge: p.badge,
        source: p.source,
        file_name: p.fileName,
        file_size: fileInfo.size,
        file_type: fileInfo.mimeType,
        storage_key: fileInfo.storageKey,
        sha256: fileInfo.sha256,
        // Marcar como descargable
        verified: true,
        download_enabled: true,
        distribution_allowed: true,
      },
    });

    console.log(`   ✅ Producto creado en DB: ${product.id}\n`);
  }

  console.log('═══════════════════════════════════════');
  console.log('✅ Seed completado!');
  console.log('═══════════════════════════════════════');

  // Verificación
  const total = await db.product.count();
  const downloadable = await db.product.count({
    where: {
      verified: true,
      download_enabled: true,
      distribution_allowed: true,
    },
  });
  console.log(`📊 Total productos: ${total}`);
  console.log(`📊 Descargables: ${downloadable}`);
}

seed()
  .catch((err) => {
    console.error('Error en seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
