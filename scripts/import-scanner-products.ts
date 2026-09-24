/**
 * IMPORT SCANNER PRODUCTS — Importa los 172 productos de SEED_GAMES
 * a la DB / fallback catalog del panel admin.
 */

// Cargar .env explícitamente (Bun no lo hace automáticamente en scripts)
import { config } from 'dotenv';
config();

import { db } from '../src/lib/db';
import { SEED_GAMES } from '../src/lib/game-scanner/seed-data';
import type { ScannedGame } from '../src/lib/game-scanner';

function isDbAvailable(): boolean {
  return db !== null;
}

function calculateSellPrice(originalPrice: number): number {
  if (originalPrice >= 20) return 4.99;
  if (originalPrice >= 10) return 3.99;
  if (originalPrice >= 5) return 2.99;
  return 1.99;
}

function detectCategory(game: ScannedGame): string {
  if (game.source === 'software') return 'apps';
  if (game.source === 'epic-games' || game.source === 'steam' || game.source === 'gog' ||
      game.source === 'prime-gaming' || game.source === 'humble' || game.source === 'indiegala' ||
      game.source === 'fanatical') return 'games';
  return 'other';
}

function detectSubcategory(game: ScannedGame): string {
  if (game.genre && game.genre.length > 0) return game.genre[0];
  return game.source;
}

async function importProduct(game: ScannedGame) {
  const claimUrl = game.claimUrl || '';
  const isOpenSource = claimUrl.includes('github.com/') && claimUrl.includes('/releases');
  const isSteam = claimUrl.includes('store.steampowered.com');
  const isEpic = claimUrl.includes('epicgames.com');
  const isHoyoverse = claimUrl.includes('hoyoverse.com');
  const isGog = claimUrl.includes('gog.com');

  const sellPrice = calculateSellPrice(game.originalPrice);
  const category = detectCategory(game);
  const subcategory = detectSubcategory(game);

  // ─── Determinar flags según tipo ───
  let verified = false;
  let download_enabled = false;
  let distribution_allowed = false;
  let source = 'scanner';
  let badge = '';

  if (isOpenSource) {
    verified = true;
    download_enabled = true;
    distribution_allowed = true;
    source = 'github';
    badge = 'OPEN SOURCE';
  } else if (isSteam) {
    source = 'steam';
    badge = 'STEAM';
  } else if (isEpic) {
    source = 'epic';
    badge = 'EPIC';
  } else if (isHoyoverse) {
    source = 'hoyoverse';
    badge = 'HOYOVERSE';
  } else if (isGog) {
    source = 'gog';
    badge = 'GOG';
  } else {
    source = game.source;
    badge = game.source.toUpperCase();
  }

  // ─── Insertar en DB si está disponible ───
  if (isDbAvailable()) {
    try {
      // Verificar si ya existe (por slug que derive del id)
      const slug = game.id.toLowerCase();
      const existing = await db.product.findUnique({ where: { slug } });
      if (existing) {
        return { id: game.id, status: 'skipped', reason: 'already exists' };
      }

      await db.product.create({
        data: {
          slug,
          name: game.title,
          description: game.description,
          longDescription: game.description,
          category,
          subcategory,
          price: sellPrice,
          originalPrice: game.originalPrice,
          currency: 'USD',
          is_free: false, // Siempre de pago en DigiStore ($1-$5)
          image: game.imageUrl,
          iconEmoji: '📦',
          version: '1.0.0',
          tags: JSON.stringify(game.tags || []),
          featured: false,
          badge,
          source,
          claimUrl,
          // Sin archivo físico (storage_key null)
          // - Para open source, /api/installers/[productId] lo descarga de GitHub on-demand
          // - Para Steam/Epic, no se puede hostear
          file_name: null,
          file_size: 0,
          file_type: null,
          storage_key: null,
          sha256: null,
          verified,
          download_enabled,
          distribution_allowed,
        },
      });

      return { id: game.id, status: isOpenSource ? 'imported_verified' : 'imported_pending_audit', source };
    } catch (err) {
      return { id: game.id, status: 'error', reason: err instanceof Error ? err.message : 'unknown' };
    }
  }

  return { id: game.id, status: 'no_db', reason: 'DB not available, will use fallback catalog at runtime' };
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 IMPORT SCANNER PRODUCTS');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`📊 Total productos en SEED_GAMES: ${SEED_GAMES.length}`);
  console.log(`📊 DB disponible: ${isDbAvailable() ? 'SÍ' : 'NO (usar fallback en runtime)'}\n`);

  // Si no hay DB, no podemos importar nada aquí — el fallback-catalog.ts
  // los generará automáticamente en runtime cuando se acceda a /admin/products
  if (!isDbAvailable()) {
    console.log('⚠️  No hay DB disponible.');
    console.log('   En Vercel sin DATABASE_URL, el panel admin usa el fallback-catalog.ts');
    console.log('   que se genera automáticamente con los productos del seed-data.');
    console.log('');
    console.log('   Para importar productos a la DB:');
    console.log('   1. Configurar DATABASE_URL (Postgres recomendado)');
    console.log('   2. bunx prisma db push');
    console.log('   3. bunx tsx scripts/import-scanner-products.ts');
    console.log('');
    console.log('   Por ahora, el panel admin se llena automáticamente con SEED_GAMES.');
    return;
  }

  let imported = 0;
  let verified = 0;
  let pendingAudit = 0;
  let skipped = 0;
  let errors = 0;

  const results: any[] = [];

  for (let i = 0; i < SEED_GAMES.length; i++) {
    const game = SEED_GAMES[i];
    const result = await importProduct(game);
    results.push(result);

    if (result.status === 'imported_verified') {
      verified++;
      imported++;
    } else if (result.status === 'imported_pending_audit') {
      pendingAudit++;
      imported++;
    } else if (result.status === 'skipped') {
      skipped++;
    } else if (result.status === 'error') {
      errors++;
    }

    if ((i + 1) % 20 === 0) {
      console.log(`   [${i + 1}/${SEED_GAMES.length}] procesados...`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ IMPORT COMPLETADO');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📊 Total procesados:    ${SEED_GAMES.length}`);
  console.log(`📊 Importados nuevos:  ${imported}`);
  console.log(`   - Verificados (open source): ${verified}`);
  console.log(`   - Pendientes de auditoría:   ${pendingAudit}`);
  console.log(`📊 Skipped (ya existían): ${skipped}`);
  console.log(`📊 Errores:             ${errors}`);

  if (errors > 0) {
    console.log('\n❌ Errores:');
    results.filter(r => r.status === 'error').slice(0, 5).forEach(r => {
      console.log(`   - ${r.id}: ${r.reason}`);
    });
  }

  console.log('\n📋 PRÓXIMOS PASOS:');
  console.log('   1. Ve a https://digi-store-cxss.vercel.app/admin/products');
  console.log('   2. Inicia sesión con la admin key');
  console.log('   3. Revisa los productos pendientes (no verificados)');
  console.log('   4. Para productos open source, prueba la descarga directamente');
  console.log('   5. Activa download_enabled y distribution_allowed según tu criterio');
}

main()
  .catch((err) => {
    console.error('Error en import:', err);
    process.exit(1);
  })
  .finally(async () => {
    if (isDbAvailable()) await db.$disconnect();
  });
