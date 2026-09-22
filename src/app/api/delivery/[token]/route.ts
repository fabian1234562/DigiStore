/**
 * ═══════════════════════════════════════════════════════════════
 * SISTEMA DE ENTREGA AUTOMÁTICA - DigiStore
 * ═══════════════════════════════════════════════════════════════
 *
 * GET /api/delivery/[token]
 *   Página de descarga (sin revelar URL original del archivo).
 *   Si el token es válido (creado por webhook de MercadoPago), muestra
 *   página HTML con botón "Descargar ahora".
 *
 * GET /api/delivery/[token]?download=1
 *   Fuerza la descarga del archivo binario directamente (Content-Disposition: attachment).
 *
 * POST /api/delivery/create
 *   Generar link de entrega (uso interno, normalmente llamado por el webhook).
 */

import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

// Base de datos temporal en memoria (compartida con webhook via globalThis)
declare global {
  // eslint-disable-next-line no-var
  var deliveryLinks: Map<string, any> | undefined;
}

if (!globalThis.deliveryLinks) {
  globalThis.deliveryLinks = new Map();
}
const deliveryLinks = globalThis.deliveryLinks as Map<string, any>;

const LINK_DURATION_HOURS = 24;
const MAX_DOWNLOADS = 5;

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * GET /api/delivery/[token]
 * Muestra página de descarga al cliente (sin revelar URL original)
 * Si ?download=1, sirve el archivo binario directamente.
 */
export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  const token = params.token;
  const url = new URL(request.url);
  const forceDownload = url.searchParams.get('download') === '1';

  const link = deliveryLinks.get(token);

  if (!link) {
    return new NextResponse(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Link expirado - DigiStore</title><style>
      body{font-family:-apple-system,sans-serif;background:linear-gradient(135deg,#6d28d9,#4f46e5);min-height:100vh;display:flex;align-items:center;justify-content:center;margin:0;padding:20px}
      .container{background:white;border-radius:24px;padding:40px;max-width:500px;text-align:center;color:#1e1b4b}
      h1{margin:0 0 8px;color:#dc2626}
      a{color:#6d28d9;text-decoration:none}
    </style></head><body><div class="container"><h1>Link expirado</h1><p>El link de descarga ya no es válido o ya fue usado el máximo de veces.</p><p>Si crees que es un error, contacta <a href="mailto:soporte@digistore.com">soporte@digistore.com</a></p></div></body></html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  if (Date.now() > link.expiresAt) {
    deliveryLinks.delete(token);
    return new NextResponse(`<!DOCTYPE html><html lang="es"><head><title>Link expirado</title><style>body{font-family:sans-serif;background:#6d28d9;min-height:100vh;display:flex;align-items:center;justify-content:center;margin:0;color:white;text-align:center}</style></head><body><h1>Link expirado</h1><p>El link ya superó las 24 horas de validez.</p></body></html>`, { headers: { 'Content-Type': 'text/html' } });
  }

  if (link.downloads >= link.maxDownloads) {
    return new NextResponse(`<!DOCTYPE html><html lang="es"><head><title>Límite alcanzado</title><style>body{font-family:sans-serif;background:#6d28d9;min-height:100vh;display:flex;align-items:center;justify-content:center;margin:0;color:white;text-align:center}</style></head><body><h1>Límite de descargas alcanzado</h1><p>Ya usaste las ${link.maxDownloads} descargas permitidas.</p></body></html>`, { headers: { 'Content-Type': 'text/html' } });
  }

  // ── Force download: servir archivo binario directamente ──
  if (forceDownload) {
    const fileName: string = link.fileName;
    const format: string = link.deliveryFormat || 'pdf';
    const filePath = path.join(process.cwd(), 'public', 'downloads', fileName);

    try {
      const fileBuffer = await fs.readFile(filePath);
      const mime = format === 'pdf' ? 'application/pdf' : 'application/zip';
      link.downloads++;

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': mime,
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': String(fileBuffer.length),
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    } catch (err) {
      console.error('[Delivery] Error reading file:', err);
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  }

  // ── Página HTML con botón de descarga ──
  link.downloads++;
  const remaining = link.maxDownloads - link.downloads;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Descarga: ${escapeHtml(link.productName)} - DigiStore</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;background:linear-gradient(135deg,#6d28d9,#4f46e5);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.container{background:white;border-radius:24px;padding:40px;max-width:500px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.15);text-align:center}
.logo{width:64px;height:64px;background:linear-gradient(135deg,#6d28d9,#4f46e5);border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:32px}
h1{color:#1e1b4b;font-size:24px;margin-bottom:8px}
.product-name{color:#6d28d9;font-weight:700;margin-bottom:24px;word-wrap:break-word}
.download-btn{display:inline-block;background:linear-gradient(135deg,#059669,#10b981);color:white;padding:16px 48px;border-radius:12px;text-decoration:none;font-weight:700;font-size:18px;margin:16px 0;box-shadow:0 4px 12px rgba(16,185,129,0.3);transition:transform 0.2s}
.download-btn:hover{transform:scale(1.05)}
.info{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:20px 0;text-align:left;font-size:14px;color:#166534;line-height:1.6}
.info strong{color:#14532d}
.timer{color:#6b7280;font-size:13px;margin-top:16px}
.support{margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb;font-size:13px;color:#6b7280}
.support a{color:#6d28d9;text-decoration:none}
.warn{background:#fef3c7;border:1px solid #fde68a;color:#92400e;padding:10px;border-radius:8px;margin-top:12px;font-size:13px}
</style>
</head>
<body>
<div class="container">
<div class="logo">🎮</div>
<h1>¡Tu descarga está lista!</h1>
<p class="product-name">${escapeHtml(link.productName)}</p>
<div class="info">
<strong>✅ Compra confirmada</strong><br>
Gracias por tu compra. Tu producto está listo para descargar.<br><br>
<strong>📝 Instrucciones:</strong><br>
1. Haz clic en "Descargar ahora"<br>
2. Guarda el archivo en tu computadora<br>
3. Ábrelo con tu visor de PDF o descomprime el ZIP<br>
4. ¡Listo! Disfruta de tu producto<br><br>
<strong>🛠️ Soporte técnico:</strong> 30 días incluidos<br>
<strong>⏰ Link válido por:</strong> ${LINK_DURATION_HOURS} horas<br>
<strong>⏬ Descargas restantes:</strong> ${remaining}
</div>
<a href="?download=1" class="download-btn" target="_blank" rel="noopener noreferrer">⬇ Descargar ahora</a>
${remaining <= 2 ? '<div class="warn">⚠️ Te quedan pocas descargas. Guarda el archivo esta vez.</div>' : ''}
<div class="support">¿Problemas con la descarga?<br><a href="mailto:soporte@digistore.com">soporte@digistore.com</a></div>
</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

/**
 * POST /api/delivery/create
 * Crea un link de entrega (llamado después del pago confirmado).
 * Útil para uso manual/admin. El webhook de MercadoPago lo usa internamente.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, productName, downloadUrl, email, fileName, deliveryFormat } = body;

    if (!productId || !productName || !email) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const token = createHash('sha256')
      .update(`${productId}-${email}-${Date.now()}-${Math.random()}`)
      .digest('hex')
      .substring(0, 32);

    deliveryLinks.set(token, {
      productId,
      productName,
      downloadUrl: downloadUrl || null,
      fileName: fileName || null,
      deliveryFormat: deliveryFormat || 'pdf',
      email,
      createdAt: Date.now(),
      expiresAt: Date.now() + (LINK_DURATION_HOURS * 60 * 60 * 1000),
      downloads: 0,
      maxDownloads: MAX_DOWNLOADS,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const fullUrl = `${baseUrl}/api/delivery/${token}`;

    return NextResponse.json({
      success: true,
      deliveryUrl: fullUrl,
      token,
      message: `Link generado. Válido por ${LINK_DURATION_HOURS} horas.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
