import { NextResponse } from 'next/server';
import { MARKET_DATA } from '@/lib/store';

export async function GET() {
  return NextResponse.json(MARKET_DATA);
}
