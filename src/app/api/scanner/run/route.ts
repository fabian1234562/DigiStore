/**
 * API: EJECUTAR ESCÁNEO DE JUEGOS GRATIS
 * 
 * POST /api/scanner/run          - Escanear todas las fuentes
 * POST /api/scanner/run?source=X  - Escanear una fuente específica
 */

import { NextResponse } from 'next/server';
import { gameScanner, runFullScan } from '@/lib/game-scanner';
import type { GameSource } from '@/lib/game-scanner';

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const source = url.searchParams.get('source') as GameSource | null;

    if (gameScanner.getIsScanning()) {
      return NextResponse.json({
        success: false,
        error: 'scan_in_progress',
        message: 'Ya hay un escaneo en progreso. Espera unos segundos.',
      });
    }

    if (source) {
      // Escanear una fuente específica
      const result = await gameScanner.scanSource(source);
      return NextResponse.json({
        success: true,
        result,
        summary: gameScanner.getSummary(),
      });
    }

    // Escaneo completo
    const scanResult = await runFullScan();

    return NextResponse.json({
      success: true,
      ...scanResult,
    });
  } catch (error: any) {
    console.error('[Scanner API] Error:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    isScanning: gameScanner.getIsScanning(),
    lastScan: gameScanner.getSummary().lastScanAt,
    message: 'Usa POST para iniciar un escaneo',
  });
}