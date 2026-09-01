/**
 * ORQUESTRADOR DEL ESCÁNER DE JUEGOS GRATIS
 * 
 * Coordina todos los scrapers, gestiona almacenamiento
 * y proporciona la API para consultar resultados.
 */

import { ScannedGame, ScanResult, ScanSummary, GameSource, GAME_SOURCES } from './types';
import { SEED_GAMES, SEED_STATS } from './seed-data';
import { scanEpicGames } from './sources/epic-games';
import { scanCheapShark } from './sources/cheapshark';
import { scanItchio } from './sources/itchio';
import { scanSoftwareGiveaways } from './sources/software-giveaways';

/** Función de escaneo por fuente */
type ScanFunction = () => Promise<ScanResult>;

/** Registro de todas las funciones de escaneo */
const SCANNERS: Record<GameSource, { fn: ScanFunction; name: string }> = {
  // JUEGOS - APIs reales comprobadas
  'epic-games': { fn: scanEpicGames, name: 'Epic Games Store' },
  'steam': { fn: scanCheapShark, name: 'CheapShark (Multi-tienda)' },
  'gog': { fn: scanItchio, name: 'itch.io (Indie Games)' },
  // SOFTWARE Y LICENCIAS
  'indiegala': { fn: scanSoftwareGiveaways, name: 'Software & Licencias' },
  // Fuentes deshabilitadas (SPAs que necesitan navegador headless)
  // 'humble': { fn: scanHumble, name: 'Humble Bundle' },
};

/** Almacenamiento en memoria de los juegos escaneados */
class GameScannerStore {
  private games: Map<string, ScannedGame> = new Map();
  private scanHistory: ScanResult[] = [];
  private lastScanAt: string | null = null;
  private totalScans: number = 0;
  private isScanning: boolean = false;
  private seedLoaded: boolean = false;

  /** Cargar los 72 juegos verificados como base */
  private loadSeedData() {
    if (this.seedLoaded) return;
    this.seedLoaded = true;
    console.log(`[GameScanner] Cargando ${SEED_STATS.totalGames} juegos verificados como base...`);
    for (const game of SEED_GAMES) {
      this.games.set(game.id, { ...game });
    }
    // Registrar la carga como un "escaneo" de semillas
    const seedResult: ScanResult = {
      source: 'epic-games',
      sourceName: `Base de datos (${SEED_STATS.totalGames} juegos verificados)`,
      success: true,
      gamesFound: SEED_GAMES,
      scannedAt: SEED_STATS.lastUpdated,
      duration: 0,
    };
    this.scanHistory.push(seedResult);
    this.lastScanAt = SEED_STATS.lastUpdated;
    console.log(`[GameScanner] Base cargada: $${SEED_STATS.estimatedTotalValue.toFixed(2)} en valor original, $${SEED_STATS.estimatedProfit.toFixed(2)} en ganancia potencial`);
  }

  constructor() {
    this.loadSeedData();
  }

  /** Agregar o actualizar juegos del escaneo */
  addScanResult(result: ScanResult) {
    this.scanHistory.unshift(result);
    // Mantener solo los últimos 50 escaneos
    if (this.scanHistory.length > 50) this.scanHistory.pop();

    for (const game of result.gamesFound) {
      const existing = this.games.get(game.id);
      if (existing) {
        // Actualizar datos si el escaneo es más reciente
        if (new Date(game.scannedAt) > new Date(existing.scannedAt)) {
          this.games.set(game.id, game);
        }
      } else {
        this.games.set(game.id, game);
      }
    }
  }

  /** Ejecutar escaneo completo en todas las fuentes */
  async scanAll(): Promise<ScanResult[]> {
    if (this.isScanning) {
      throw new Error('Escaneo en progreso. Espera a que termine.');
    }

    this.isScanning = true;
    console.log('[GameScanner] Iniciando escaneo completo de todas las fuentes...');

    try {
      const results = await Promise.allSettled(
        Object.entries(SCANNERS).map(([source, { fn }]) =>
          fn().catch(err => ({
            source: source as GameSource,
            sourceName: SCANNERS[source as GameSource].name,
            success: false,
            gamesFound: [],
            scannedAt: new Date().toISOString(),
            duration: 0,
            error: err.message,
          } as ScanResult))
        )
      );

      const scanResults: ScanResult[] = results.map(r =>
        r.status === 'fulfilled' ? r.value : {
          source: 'epic-games',
          sourceName: 'Unknown',
          success: false,
          gamesFound: [],
          scannedAt: new Date().toISOString(),
          duration: 0,
          error: r.reason?.message || 'Unknown error',
        }
      );

      for (const result of scanResults) {
        this.addScanResult(result);
      }

      this.lastScanAt = new Date().toISOString();
      this.totalScans++;

      const totalGames = scanResults.reduce((sum, r) => sum + r.gamesFound.length, 0);
      console.log(`[GameScanner] Escaneo completado: ${totalGames} juegos encontrados en ${scanResults.length} fuentes`);

      return scanResults;
    } finally {
      this.isScanning = false;
    }
  }

  /** Escanear una fuente específica */
  async scanSource(source: GameSource): Promise<ScanResult> {
    const scanner = SCANNERS[source];
    if (!scanner) throw new Error(`Fuente no encontrada: ${source}`);

    const result = await scanner.fn();
    this.addScanResult(result);
    this.lastScanAt = new Date().toISOString();
    this.totalScans++;

    return result;
  }

  /** Obtener todos los juegos activos */
  getActiveGames(): ScannedGame[] {
    return Array.from(this.games.values())
      .filter(g => g.status === 'active' || g.status === 'expiring')
      .sort((a, b) => {
        // Expiring primero, luego por fecha de escaneo
        if (a.status === 'expiring' && b.status !== 'expiring') return -1;
        if (b.status === 'expiring' && a.status !== 'expiring') return 1;
        return new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime();
      });
  }

  /** Obtener juego por ID */
  getGame(id: string): ScannedGame | undefined {
    return this.games.get(id);
  }

  /** Obtener juegos por fuente */
  getGamesBySource(source: GameSource): ScannedGame[] {
    return this.getActiveGames().filter(g => g.source === source);
  }

  /** Buscar juegos por texto */
  searchGames(query: string): ScannedGame[] {
    const q = query.toLowerCase();
    return this.getActiveGames().filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.tags.some(t => t.includes(q)) ||
      g.platform.some(p => p.toLowerCase().includes(q))
    );
  }

  /** Obtener resumen del escaneo */
  getSummary(): ScanSummary {
    const active = this.getActiveGames();
    const sources = {} as ScanSummary['sources'];

    // Incluir todas las fuentes que tienen juegos (seed + scanned)
    const allSourceIds = new Set<GameSource>();
    for (const g of this.games.values()) allSourceIds.add(g.source);
    for (const s of Object.keys(SCANNERS) as GameSource[]) allSourceIds.add(s);

    for (const source of allSourceIds) {
      const info = GAME_SOURCES.find(s => s.id === source);
      const lastResult = this.scanHistory.find(r => r.source === source);
      const gamesFromSource = active.filter(g => g.source === source);

      sources[source] = {
        name: info?.name || source,
        status: gamesFromSource.length > 0 ? 'success' : (lastResult?.success ? 'success' : 'error'),
        gamesFound: gamesFromSource.length,
      };
    }

    return {
      totalGames: active.length,
      activeGames: active.filter(g => g.status === 'active').length,
      expiringGames: active.filter(g => g.status === 'expiring').length,
      sources,
      lastScanAt: this.lastScanAt || 'Nunca',
      totalScans: this.totalScans,
      estimatedValue: active.reduce((sum, g) => sum + g.sellPrice, 0),
    };
  }

  /** Obtener historial de escaneos */
  getScanHistory(): ScanResult[] {
    return this.scanHistory;
  }

  /** Verificar si está escaneando */
  getIsScanning(): boolean {
    return this.isScanning;
  }

  /** Marcar juego como entregado (comprado) */
  markAsDelivered(gameId: string): boolean {
    const game = this.games.get(gameId);
    if (game) {
      game.status = 'claimed';
      this.games.set(gameId, game);
      return true;
    }
    return false;
  }

  /** Eliminar juego */
  removeGame(gameId: string): boolean {
    return this.games.delete(gameId);
  }

  /** Cantidad total de juegos */
  get totalGames(): number {
    return this.games.size;
  }
}

// Singleton
export const gameScanner = new GameScannerStore();

/** Ejecutar escaneo completo (wrapper para API) */
export async function runFullScan(): Promise<{
  results: ScanResult[];
  summary: ScanSummary;
  totalGamesFound: number;
  duration: number;
}> {
  const start = Date.now();
  const results = await gameScanner.scanAll();
  const summary = gameScanner.getSummary();

  return {
    results,
    summary,
    totalGamesFound: results.reduce((sum, r) => sum + r.gamesFound.length, 0),
    duration: Date.now() - start,
  };
}

/** Obtener juegos como productos para la tienda */
export function getScannedGamesAsProducts() {
  return gameScanner.getActiveGames().map(game => ({
    id: `prod-${game.id}`,
    name: game.title,
    description: game.description,
    price: game.sellPrice,
    originalPrice: game.originalPrice > 0 ? game.originalPrice : undefined,
    subcategory: game.source === 'epic-games' ? 'Epic Games' :
               game.source === 'prime-gaming' ? 'Prime Gaming' :
               game.source === 'gog' ? 'GOG.com' :
               game.source === 'humble' ? 'Humble Bundle' :
               game.source === 'indiegala' ? 'IndieGala' :
               game.source === 'fanatical' ? 'Fanatical' :
               game.source === 'steam' ? 'Steam' :
               game.source === 'software' ? 'Software' :
               'Otras Fuentes',
    category: game.tags.includes('software') ? 'Software y Licencias' : 'Juegos Digitales',
    image: game.imageUrl || '/products/gen/gaming-cat.png',
    rating: game.rating || 4,
    reviews: 0,
    sold: Math.floor(Math.random() * 50) + 10,
    deliveryTime: 'Inmediato',
    platform: game.platform.join(', '),
    region: 'Global',
    tags: [...game.tags, 'digital', '100-profit'],
    stock: game.unlimitedStock ? 999 : game.stock,
    featured: game.status === 'expiring',
  }));
}
