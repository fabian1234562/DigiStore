/**
 * API: RESUMEN DEL ESCÁNER
 */

import { NextResponse } from 'next/server';
import { gameScanner } from '@/lib/game-scanner';

export async function GET() {
  const summary = gameScanner.getSummary();
  const history = gameScanner.getScanHistory().slice(0, 10);

  return NextResponse.json({
    success: true,
    summary,
    history,
    isScanning: gameScanner.getIsScanning(),
    totalGamesInStore: gameScanner.totalGames,
  });
}