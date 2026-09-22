import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { SEED_GAMES } from '@/lib/game-scanner/seed-data';
import { scannedGameToCardData, generateActivationCardPdf } from '@/lib/generate-card';

/**
 * GET /api/cards/[productId]
 *
 * Devuelve la tarjeta de activación PDF de un producto gratis.
 *
 * Estrategia:
 *   1. Si el PDF ya existe pre-generado en /public/downloads/cards/, lo sirve (rápido)
 *   2. Si no, busca el producto en SEED_GAMES y genera el PDF on-demand
 *   3. Si no lo encuentra, devuelve 404
 *
 * Content-Disposition: attachment fuerza la descarga (no abre en el navegador).
 */

const CARDS_DIR = path.join(process.cwd(), 'public', 'downloads', 'cards');

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  // Sanitize: only allow alphanumeric, dash, underscore
  if (!productId || !/^[a-zA-Z0-9_-]+$/.test(productId)) {
    return NextResponse.json(
      { error: 'invalid_product_id', productId },
      { status: 400 }
    );
  }

  // 1. Intentar servir PDF pre-generado (rápido)
  const preGenPath = path.join(CARDS_DIR, `${productId}.pdf`);
  try {
    const fileBuffer = await fs.readFile(preGenPath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="digi-store-${productId}.pdf"`,
        'Content-Length': String(fileBuffer.length),
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    // No existe pre-generado — continuar a generación on-demand
  }

  // 2. Buscar en SEED_GAMES y generar on-demand
  const game = SEED_GAMES.find(g => g.id === productId);
  if (!game) {
    return NextResponse.json(
      {
        error: 'card_not_found',
        message: `No se encontró tarjeta para el producto: ${productId}`,
      },
      { status: 404 }
    );
  }

  try {
    const cardData = scannedGameToCardData(game);

    // Si no hay downloadUrl, fallback a un genérico por source
    if (!cardData.downloadUrl) {
      const source = game.source;
      const fallbacks: Record<string, string> = {
        'epic-games': 'https://store.epicgames.com/en-US/free-games',
        'steam': 'https://store.steampowered.com/genre/Free%20to%20Play/',
        'gog': 'https://www.gog.com/en/games?price=free',
        'prime-gaming': 'https://gaming.amazon.com/home',
        'humble': 'https://www.humblebundle.com/store/free',
        'indiegala': 'https://www.indiegala.com/giveaways',
        'fanatical': 'https://www.fanatical.com/en/free',
        'software': 'https://giveawayoftheday.com/',
      };
      cardData.downloadUrl = fallbacks[source] || 'https://store.steampowered.com/genre/Free%20to%20Play/';
    }

    const pdfBytes = await generateActivationCardPdf(cardData);

    // Intentar guardar en disco para próximas veces (no falla si no puede)
    try {
      await fs.mkdir(CARDS_DIR, { recursive: true });
      await fs.writeFile(preGenPath, pdfBytes);
    } catch {
      // best-effort, no importa si falla
    }

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="digi-store-${productId}.pdf"`,
        'Content-Length': String(pdfBytes.length),
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    console.error('[cards] Error generating PDF on-demand:', err);
    return NextResponse.json(
      {
        error: 'generation_failed',
        message: err instanceof Error ? err.message : 'unknown_error',
      },
      { status: 500 }
    );
  }
}
