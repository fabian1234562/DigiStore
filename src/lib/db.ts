import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Crea el Prisma client solo si DATABASE_URL está configurada.
 * En Vercel sin DATABASE_URL, devolvemos null y usamos fallback en memoria.
 */
function createPrismaClient(): PrismaClient | null {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  } catch (err) {
    console.error('[db] Failed to create Prisma client:', err);
    return null;
  }
}

export const db = globalForPrisma.prisma ?? createPrismaClient()!;

if (process.env.NODE_ENV !== 'production' && db) {
  globalForPrisma.prisma = db;
}

/**
 * Verifica si la DB está disponible.
 */
export function isDbAvailable(): boolean {
  return db !== null;
}
