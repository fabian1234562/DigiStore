/**
 * API: RECALCULAR PRECIOS EN LOTE
 *
 * POST /api/scanner/price-recalc
 *
 * Aplica la política de precios de DigiStore ($1.00 - $5.00 USD)
 * a TODOS los productos actualmente en memoria del escáner.
 *
 * Política:
 *   originalPrice >= $50  →  $4.99
 *   originalPrice >= $20  →  $3.99
 *   originalPrice >= $10  →  $2.99
 *   originalPrice >= $5   →  $1.99
 *   otro                  →  $1.00
 *
 * Útil cuando se han agregado productos nuevos del escáner y no cumplen
 * el rango comercial de DigiStore.
 */

import { NextResponse } from 'next/server';
import { gameScanner } from '@/lib/game-scanner';
import { calcDigiStorePrice, isPriceCompliant } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const allGames = gameScanner.getActiveGames();
    let updated = 0;
    let skipped = 0;
    const changes: Array<{
      id: string;
      title: string;
      oldPrice: number;
      newPrice: number;
      originalPrice: number;
    }> = [];

    for (const game of allGames) {
      const originalPrice = game.originalPrice > 0 ? game.originalPrice : 0;
      const newPrice = calcDigiStorePrice(originalPrice);

      if (Math.abs(game.sellPrice - newPrice) > 0.001) {
        changes.push({
          id: game.id,
          title: game.title,
          oldPrice: game.sellPrice,
          newPrice,
          originalPrice,
        });
        game.sellPrice = newPrice;
        updated++;
      } else {
        skipped++;
      }
    }

    const summary = gameScanner.getSummary();

    return NextResponse.json({
      success: true,
      message: `Recálculo de precios completado`,
      totalProcessed: allGames.length,
      updated,
      skipped,
      range: { min: 1.00, max: 5.00 },
      newEstimatedValue: summary.estimatedValue,
      changesPreview: changes.slice(0, 10),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Price Recalc] Error:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const allGames = gameScanner.getActiveGames();
    const nonCompliant = allGames.filter(g => !isPriceCompliant(g.sellPrice));

    return NextResponse.json({
      success: true,
      totalProducts: allGames.length,
      compliantCount: allGames.length - nonCompliant.length,
      nonCompliantCount: nonCompliant.length,
      nonCompliantPreview: nonCompliant.slice(0, 10).map(g => ({
        id: g.id,
        title: g.title,
        currentPrice: g.sellPrice,
        suggestedPrice: calcDigiStorePrice(g.originalPrice),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
