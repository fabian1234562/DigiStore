/**
 * API: AUTO-SCAN CRON ENDPOINT
 * 
 * Vercel Cron ejecuta este endpoint automáticamente cada 6 horas.
 * También puede ser llamado manualmente vía POST.
 * 
 * - Cada 6 horas: Escanea todas las fuentes + trending
 * - Los nuevos productos se agregan automáticamente al inventario
 * - Los productos expirados se marcan como inactivos
 */

import { NextResponse } from 'next/server';
import { gameScanner } from '@/lib/game-scanner/scanner';
import { scanTrending } from '@/lib/game-scanner/sources/trending';

/** Cron secret para autenticar peticiones de Vercel Cron */
const CRON_SECRET = process.env.CRON_SECRET || 'digistore-cron-2024';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel Hobby max = 10s, Pro = 60s

/** GET - Estado del auto-scan (llamado por Vercel Cron) */
export async function GET(request: Request) {
  // Verificar que es Vercel Cron quien llama
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    // Permitir sin auth en desarrollo
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    console.log('[Auto-Scan] Iniciando escaneo automático programado...');
    const scanStart = Date.now();

    // 1. Ejecutar escaneo completo de todas las fuentes
    const scanResults = await gameScanner.scanAll();
    
    // 2. Escanear productos trending
    const trendingResult = await scanTrending();
    if (trendingResult.success && trendingResult.gamesFound.length > 0) {
      gameScanner.addScanResult(trendingResult);
    }

    // 3. Limpiar productos expirados
    const allGames = gameScanner.getActiveGames();
    let expiredCount = 0;
    for (const game of allGames) {
      if (game.endDate && new Date(game.endDate) < new Date()) {
        game.status = 'expired';
        expiredCount++;
      }
    }

    // 4. Obtener resumen actualizado
    const summary = gameScanner.getSummary();
    const totalDuration = Date.now() - scanStart;

    const report = {
      success: true,
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      sourcesScanned: scanResults.length + 1, // +1 por trending
      newProductsFound: scanResults.reduce((sum, r) => sum + r.gamesFound.length, 0) + trendingResult.gamesFound.length,
      trendingProducts: trendingResult.gamesFound.length,
      expiredCleaned: expiredCount,
      totalActiveProducts: summary.totalGames,
      estimatedValue: `$${summary.estimatedValue.toFixed(2)}`,
      sources: Object.entries(summary.sources).map(([key, val]) => ({
        source: key,
        name: val.name,
        status: val.status,
        products: val.gamesFound,
      })),
    };

    console.log(`[Auto-Scan] Completado en ${(totalDuration / 1000).toFixed(1)}s. ${report.newProductsFound} productos encontrados, ${report.totalActiveProducts} activos.`);

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('[Auto-Scan] Error:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/** POST - Forzar escaneo manual (desde admin o botón) */
export async function POST(request: Request) {
  try {
    // Permitir POST sin auth para uso del admin
    console.log('[Auto-Scan] Escaneo manual forzado...');
    
    const body = await request.json().catch(() => ({}));
    const sourcesOnly = body.sourcesOnly || false;

    if (sourcesOnly) {
      // Solo escanear fuentes existentes (no trending)
      const results = await gameScanner.scanAll();
      const summary = gameScanner.getSummary();
      return NextResponse.json({
        success: true,
        type: 'sources_only',
        results: results.length,
        totalActive: summary.totalGames,
        timestamp: new Date().toISOString(),
      });
    }

    // Escaneo completo + trending
    const scanResults = await gameScanner.scanAll();
    const trendingResult = await scanTrending();
    if (trendingResult.success) {
      gameScanner.addScanResult(trendingResult);
    }

    const summary = gameScanner.getSummary();
    return NextResponse.json({
      success: true,
      type: 'full',
      sourceResults: scanResults.length,
      trendingFound: trendingResult.gamesFound.length,
      totalActive: summary.totalGames,
      estimatedValue: `$${summary.estimatedValue.toFixed(2)}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
