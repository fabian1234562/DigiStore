/**
 * Genera tarjetas de activación PDF on-demand para cualquier producto.
 *
 * Usa pdf-lib para crear el PDF y qrcode para generar el QR code PNG embebido.
 * No requiere pre-generación — se llama al vuelo desde la API.
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as qr from 'qrcode';
import type { ScannedGame } from '@/lib/game-scanner';

// ─────────────────────────────────────────────────────────────────────────────
// Brand colors as RGB (pdf-lib uses 0-1 range)
// ─────────────────────────────────────────────────────────────────────────────
const BRAND = {
  primary: rgb(0.427, 0.157, 0.851),    // #6d28d9
  dark:    rgb(0.118, 0.106, 0.294),    // #1e1b4b
  accent:  rgb(0.063, 0.596, 0.510),    // #10b981
  bgLight: rgb(0.961, 0.953, 1.000),    // #f5f3ff
  gray:    rgb(0.278, 0.333, 0.412),    // #475569
  lightGray: rgb(0.886, 0.910, 0.937),  // #e2e8f0
  black:   rgb(0.118, 0.161, 0.231),    // #1e293b
  white:   rgb(1, 1, 1),
};

export interface CardData {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  source?: string;
  genre?: string;
  platform?: string[];
  originalPrice?: number;
  imageUrl?: string;
  claimInstructions?: string;
}

/**
 * Convierte un ScannedGame a CardData.
 */
export function scannedGameToCardData(game: ScannedGame): CardData {
  return {
    id: game.id,
    title: game.title,
    description: game.description,
    downloadUrl: game.claimUrl || '',
    source: game.source,
    genre: Array.isArray(game.genre) ? game.genre[0] : (game.genre as unknown as string) || '',
    platform: game.platform,
    originalPrice: game.originalPrice,
    imageUrl: game.imageUrl,
    claimInstructions: game.claimInstructions,
  };
}

/**
 * Genera un QR code como PNG bytes (data URL).
 */
async function generateQrPng(url: string): Promise<Uint8Array> {
  const buffer = await qr.toBuffer(url, {
    type: 'png',
    margin: 1,
    width: 300,
    color: {
      dark: '#1e1b4b',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'L',
  });
  return new Uint8Array(buffer);
}

/**
 * Sanitiza texto para que sea válido en pdf-lib con StandardFonts (WinAnsi).
 * Elimina emojis y caracteres no soportados, manteniendo acentos latinos.
 */
function sanitizeForPdf(text: string): string {
  if (!text) return '';
  return text
    // Reemplazar emojis comunes con texto plano
    .replace(/🎮/g, '[GAME]')
    .replace(/📥/g, '[DL]')
    .replace(/🔗/g, '[URL]')
    .replace(/📋/g, '[INFO]')
    .replace(/✅/g, '[OK]')
    .replace(/⚠️/g, '[!]')
    .replace(/🛠️?/g, '[TOOL]')
    .replace(/⏰/g, '[TIME]')
    .replace(/⏬/g, '[DOWN]')
    .replace(/📝/g, '[NOTE]')
    .replace(/🚀/g, '[GO]')
    .replace(/⭐/g, '*')
    .replace(/✨/g, '')
    .replace(/🎨/g, '')
    .replace(/🔴/g, '[!]')
    .replace(/🟢/g, '[OK]')
    .replace(/🟡/g, '[?]')
    .replace(/●/g, '*')
    // Eliminar cualquier caracter fuera de Latin-1 / WinAnsi
    .replace(/[^\x00-\xFF\u20AC]/g, '?');
}

/**
 * Trunca texto a un máximo de caracteres, añadiendo "..." si se corta.
 */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3) + '...';
}

/**
 * Divide un texto largo en líneas que caben en un ancho determinado (caracteres aprox).
 */
function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    if ((current + ' ' + w).trim().length > maxCharsPerLine) {
      if (current) lines.push(current.trim());
      current = w;
    } else {
      current = (current + ' ' + w).trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Genera la tarjeta de activación PDF.
 * Devuelve Uint8Array con los bytes del PDF.
 */
export async function generateActivationCardPdf(data: CardData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`DigiStore - Tarjeta de Activación - ${data.title}`);
  pdfDoc.setAuthor('DigiStore');
  pdfDoc.setSubject('Tarjeta de activación digital');
  pdfDoc.setCreator('DigiStore');
  pdfDoc.setProducer('DigiStore');

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

  // A4: 595.28 x 841.89 puntos
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const marginX = 50;
  let y = height - 50;

  // ─── Header ───
  // NOTE: No usamos emojis en el PDF porque StandardFonts (WinAnsi) no los soporta.
  // Los acentos latinos (á, é, í, ó, ú, ñ) SÍ funcionan en WinAnsi.
  page.drawText('DigiStore', {
    x: width / 2 - fontBold.widthOfTextAtSize('DigiStore', 22) / 2,
    y,
    size: 22,
    font: fontBold,
    color: BRAND.primary,
  });
  y -= 18;
  page.drawText('Tarjeta de Activación Digital', {
    x: width / 2 - font.widthOfTextAtSize('Tarjeta de Activación Digital', 10) / 2,
    y,
    size: 10,
    font,
    color: BRAND.gray,
  });
  y -= 12;

  // Línea separadora
  page.drawLine({
    start: { x: marginX, y },
    end: { x: width - marginX, y },
    thickness: 1.2,
    color: BRAND.primary,
  });
  y -= 28;

  // ─── Título del producto ───
  const titleLines = wrapText(sanitizeForPdf(truncate(data.title, 76)), 38);
  for (const line of titleLines.slice(0, 2)) {
    page.drawText(line, {
      x: width / 2 - fontBold.widthOfTextAtSize(line, 18) / 2,
      y,
      size: 18,
      font: fontBold,
      color: BRAND.dark,
    });
    y -= 22;
  }

  // Subtítulo: género + plataforma
  const subtitleParts: string[] = [];
  if (data.genre) subtitleParts.push(sanitizeForPdf(data.genre));
  if (data.platform && data.platform.length > 0) {
    subtitleParts.push(sanitizeForPdf(data.platform.join(', ')));
  }
  if (subtitleParts.length > 0) {
    const subtitle = sanitizeForPdf(subtitleParts.join(' - '));
    page.drawText(subtitle, {
      x: width / 2 - font.widthOfTextAtSize(subtitle, 11) / 2,
      y,
      size: 11,
      font,
      color: BRAND.gray,
    });
    y -= 18;
  }

  // Precio
  if (data.originalPrice && data.originalPrice > 0) {
    const priceText = `Valor original: $${data.originalPrice.toFixed(2)} USD   100% GRATIS`;
    page.drawText(priceText, {
      x: width / 2 - fontBold.widthOfTextAtSize(priceText, 11) / 2,
      y,
      size: 11,
      font: fontBold,
      color: BRAND.dark,
    });
    y -= 16;
    // "100% GRATIS" en verde
    const gratisWidth = fontBold.widthOfTextAtSize('100% GRATIS', 11);
    const totalWidth = fontBold.widthOfTextAtSize(priceText, 11);
    const gratisX = width / 2 - totalWidth / 2 + (totalWidth - gratisWidth);
    page.drawText('100% GRATIS', {
      x: gratisX,
      y,
      size: 11,
      font: fontBold,
      color: BRAND.accent,
    });
  } else {
    const gratisText = '* 100% GRATIS';
    page.drawText(gratisText, {
      x: width / 2 - fontBold.widthOfTextAtSize(gratisText, 11) / 2,
      y,
      size: 11,
      font: fontBold,
      color: BRAND.accent,
    });
  }
  y -= 25;

  // ─── Descripción ───
  const descLines = wrapText(sanitizeForPdf(truncate(data.description, 380)), 75);
  for (const line of descLines) {
    page.drawText(line, {
      x: marginX,
      y,
      size: 10,
      font,
      color: BRAND.black,
    });
    y -= 14;
  }
  y -= 12;

  // ─── Sección "Cómo descargar" ───
  // Línea divisoria
  page.drawLine({
    start: { x: marginX, y },
    end: { x: width - marginX, y },
    thickness: 0.5,
    color: BRAND.lightGray,
  });
  y -= 14;
  page.drawText('Cómo descargar', {
    x: marginX,
    y,
    size: 13,
    font: fontBold,
    color: BRAND.primary,
  });
  y -= 20;

  // ─── QR code + instrucciones ───
  let qrBytes: Uint8Array | null = null;
  if (data.downloadUrl) {
    try {
      qrBytes = await generateQrPng(data.downloadUrl);
    } catch (err) {
      console.error('[Card] QR generation failed:', err);
    }
  }

  const qrSize = 130;
  const qrX = marginX + 10;
  const qrY = y - qrSize;

  if (qrBytes) {
    const qrImage = await pdfDoc.embedPng(qrBytes);
    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });
  }

  // Instrucciones a la derecha del QR
  const instrX = qrX + qrSize + 25;
  let instrY = y - 4;
  const instrLines = [
    { text: '1.', bold: true, size: 11 },
    { text: ' Escanea el QR con tu celular', bold: false, size: 11 },
    { text: 'o', bold: false, size: 11 },
    { text: '2.', bold: true, size: 11 },
    { text: ' Visita directamente el link', bold: false, size: 11 },
    { text: '3.', bold: true, size: 11 },
    { text: ' Descarga el archivo', bold: false, size: 11 },
    { text: '4.', bold: true, size: 11 },
    { text: ' Ejecuta el instalador', bold: false, size: 11 },
    { text: '5.', bold: true, size: 11 },
    { text: ' ¡Listo!', bold: false, size: 11 },
  ];
  for (const line of instrLines) {
    page.drawText(line.text, {
      x: instrX,
      y: instrY,
      size: line.size,
      font: line.bold ? fontBold : font,
      color: BRAND.dark,
    });
    instrY -= 16;
  }

  y = Math.min(qrY, instrY) - 18;

  // ─── Link directo clickable ───
  if (data.downloadUrl) {
    page.drawText('Enlace directo:', {
      x: marginX,
      y,
      size: 8,
      font: fontBold,
      color: BRAND.gray,
    });
    y -= 14;

    // Truncar URL si es muy larga
    const urlText = truncate(data.downloadUrl, 70);
    const linkWidth = fontMono.widthOfTextAtSize(urlText, 9);

    // Link annotation (clickeable)
    const linkAnnotation = pdfDoc.context.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [marginX, y - 2, marginX + linkWidth, y + 12],
      Border: [0, 0, 0],
      A: { Type: 'Action', S: 'URI', URI: data.downloadUrl },
    });
    const linkAnnotationRef = pdfDoc.context.register(linkAnnotation);
    page.node.addAnnotation(linkAnnotationRef);

    page.drawText(urlText, {
      x: marginX,
      y,
      size: 9,
      font: fontMono,
      color: BRAND.primary,
    });

    y -= 22;
  }

  // ─── Instrucciones detalladas del producto ───
  if (data.claimInstructions) {
    page.drawText('Instrucciones detalladas:', {
      x: marginX,
      y,
      size: 8,
      font: fontBold,
      color: BRAND.gray,
    });
    y -= 14;

    const cleanInstr = sanitizeForPdf(data.claimInstructions.replace(/\\n/g, '\n').trim());
    const instrLinesArr = cleanInstr.split('\n').filter(l => l.trim());
    for (const line of instrLinesArr.slice(0, 8)) {
      const cleanLine = line.trim();
      if (cleanLine) {
        page.drawText('•', {
          x: marginX,
          y,
          size: 9,
          font: fontBold,
          color: BRAND.primary,
        });
        page.drawText(sanitizeForPdf(truncate(cleanLine, 78)), {
          x: marginX + 14,
          y,
          size: 9,
          font,
          color: BRAND.black,
        });
        y -= 13;
      }
    }
    y -= 8;
  }

  // ─── Footer con metadata ───
  y -= 20;
  page.drawLine({
    start: { x: marginX, y },
    end: { x: width - marginX, y },
    thickness: 0.4,
    color: BRAND.lightGray,
  });
  y -= 16;

  const today = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const metadata: Array<[string, string]> = [
    ['Producto ID', sanitizeForPdf(truncate(data.id, 35))],
    ['Fuente', sanitizeForPdf(data.source || 'DigiStore')],
    ['Fecha de descarga', today],
    ['Licencia', 'Open Source / Free-to-Play'],
  ];

  let metaY = y;
  for (const [label, value] of metadata) {
    page.drawText(label, {
      x: marginX,
      y: metaY,
      size: 8,
      font: fontBold,
      color: BRAND.gray,
    });
    page.drawText(value, {
      x: marginX + 90,
      y: metaY,
      size: 9,
      font,
      color: BRAND.dark,
    });
    metaY -= 13;
  }

  // Footer text
  metaY -= 20;
  page.drawText(
    '© DigiStore — Tarjeta generada para descarga gratuita. ' +
    'El producto se entrega directamente desde la fuente oficial.',
    {
      x: width / 2 - font.widthOfTextAtSize(
        '© DigiStore — Tarjeta generada para descarga gratuita. ' +
        'El producto se entrega directamente desde la fuente oficial.',
        7.5
      ) / 2,
      y: metaY,
      size: 7.5,
      font,
      color: BRAND.gray,
    }
  );

  return await pdfDoc.save();
}
