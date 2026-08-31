/**
 * TIPOS DEL ESCÁNER DE JUEGOS GRATIS
 * 
 * El escáner busca juegos que se regalan en internet
 * y los publica en la tienda a $3-4 USD.
 * Costo = $0, ganancia = 100% del precio de venta.
 */

/** Fuente de donde se obtuvo el juego gratis */
export type GameSource =
  | 'epic-games'
  | 'gog'
  | 'steam'
  | 'indiegala'
  | 'fanatical'
  | 'humble'
  | 'prime-gaming'
  | 'software'
  | 'apple';

/** Tipo de entrega del juego */
export type DeliveryType =
  | 'key'          // Clave Steam/Epic que se entrega directamente
  | 'claim-link'   // Link para reclamar en la plataforma
  | 'drm-free'     // Descarga directa sin DRM
  | 'account'      // Se necesita cuenta de la plataforma
  | 'app'          // Aplicación móvil gratis
  | 'software';    // Software gratis

/** Estado del juego escaneado */
export type ScanStatus =
  | 'active'       // Disponible para reclamar
  | 'expiring'     // Próximo a expirar (últimas 24h)
  | 'expired'      // Ya no está gratis
  | 'claimed'      // Ya fue reclamado (tenemos la clave)
  | 'error';       // Error al escanear

/** Juego escaneado de una fuente */
export interface ScannedGame {
  id: string;                    // ID único en DigiStore
  sourceId: string;              // ID en la fuente original
  source: GameSource;            // De dónde viene
  title: string;                 // Nombre del juego
  description: string;           // Descripción corta
  longDescription?: string;      // Descripción larga
  imageUrl: string;              // URL de la imagen/portada
  originalPrice: number;         // Precio original en la tienda (USD)
  sellPrice: number;             // Precio al que lo vendemos ($3.99)
  deliveryType: DeliveryType;    // Cómo se entrega
  platform: string[];            // ['Steam', 'Epic', 'GOG', etc.]
  genre: string[];               // ['Action', 'RPG', etc.]
  claimUrl?: string;             // URL para reclamar (si aplica)
  claimInstructions?: string;    // Instrucciones de reclamación
  stock: number;                 // Claves disponibles (0 = ilimitado si es claim-link)
  unlimitedStock: boolean;       // Si es claim-link, no se agota
  status: ScanStatus;            // Estado actual
  startDate: string;             // Cuándo empezó a ser gratis
  endDate?: string;              // Cuándo deja de ser gratis
  scannedAt: string;             // Cuándo fue escaneado
  lastChecked: string;           // Última verificación
  tags: string[];                // Tags adicionales
  rating?: number;               // Rating del juego (0-5)
  publisher?: string;            // Editora
  developer?: string;            // Desarrollador
  size?: string;                 // Tamaño del juego
  systemRequirements?: {         // Requisitos mínimos
    os?: string;
    cpu?: string;
    ram?: string;
    gpu?: string;
    storage?: string;
  };
}

/** Resultado de un escaneo */
export interface ScanResult {
  source: GameSource;
  sourceName: string;
  success: boolean;
  gamesFound: ScannedGame[];
  error?: string;
  scannedAt: string;
  duration: number;              // ms que tomó el escaneo
}

/** Resumen completo del escaneo */
export interface ScanSummary {
  totalGames: number;
  activeGames: number;
  expiringGames: number;
  sources: Record<GameSource, {
    name: string;
    status: 'success' | 'error';
    gamesFound: number;
  }>;
  lastScanAt: string;
  totalScans: number;
  estimatedValue: number;        // Valor total de los juegos si se venden todos
}

/** Configuración de precio para juegos gratis */
export const FREE_GAME_PRICING = {
  defaultPrice: 3.99,            // Precio por defecto
  premiumPrice: 4.99,            // Para juegos con precio original > $20
  budgetPrice: 2.99,             // Para juegos con precio original < $5
  appPrice: 1.99,                // Para apps/software
  
  // Umbral para precio premium
  premiumThreshold: 20,
  
  // Umbral para precio budget
  budgetThreshold: 5,
  
  /** Calcular precio de venta según el precio original */
  calculate(originalPrice: number, type: DeliveryType): number {
    if (type === 'app' || type === 'software') return this.appPrice;
    if (originalPrice >= this.premiumThreshold) return this.premiumPrice;
    if (originalPrice < this.budgetThreshold) return this.budgetPrice;
    return this.defaultPrice;
  },
  
  /** Formatear precio */
  format(price: number): string {
    return `$${price.toFixed(2)} USD`;
  },
};

/** Info de la fuente */
export interface SourceInfo {
  id: GameSource;
  name: string;
  url: string;
  icon: string;                  // Nombre del icono de Lucide
  color: string;                 // Color de la fuente
  description: string;
  scanFrequency: string;         // 'hourly', 'daily', 'weekly'
}

/** Todas las fuentes disponibles */
export const GAME_SOURCES: SourceInfo[] = [
  {
    id: 'epic-games',
    name: 'Epic Games Store',
    url: 'https://store.epicgames.com/en-US/free-games',
    icon: 'Gamepad2',
    color: '#0078F2',
    description: 'Juegos gratis cada semana en Epic Games',
    scanFrequency: 'weekly',
  },
  {
    id: 'gog',
    name: 'GOG.com',
    url: 'https://www.gog.com/en/games?price=free',
    icon: 'Disc',
    color: '#A348A6',
    description: 'Juegos gratis y antiguos sin DRM',
    scanFrequency: 'weekly',
  },
  {
    id: 'steam',
    name: 'Steam',
    url: 'https://store.steampowered.com/genre/Free%20to%20Play/',
    icon: 'Monitor',
    color: '#1B2838',
    description: 'Juegos gratuitos y promociones en Steam',
    scanFrequency: 'daily',
  },
  {
    id: 'indiegala',
    name: 'IndieGala',
    url: 'https://www.indiegala.com/giveaways',
    icon: 'Gift',
    color: '#E8453C',
    description: 'Sorteos y juegos gratis de IndieGala',
    scanFrequency: 'daily',
  },
  {
    id: 'fanatical',
    name: 'Fanatical',
    url: 'https://www.fanatical.com/en/free',
    icon: 'Flame',
    color: '#FF6B00',
    description: 'Juegos gratis de Fanatical',
    scanFrequency: 'weekly',
  },
  {
    id: 'humble',
    name: 'Humble Bundle',
    url: 'https://www.humblebundle.com/store/free',
    icon: 'Heart',
    color: '#CC0000',
    description: 'Juegos gratis de Humble Bundle',
    scanFrequency: 'weekly',
  },
  {
    id: 'prime-gaming',
    name: 'Prime Gaming',
    url: 'https://gaming.amazon.com/home',
    icon: 'Crown',
    color: '#00A8E1',
    description: 'Juegos gratis con Amazon Prime',
    scanFrequency: 'monthly',
  },
  {
    id: 'software',
    name: 'Software Gratis',
    url: 'https://giveawayoftheday.com/',
    icon: 'Monitor',
    color: '#6366F1',
    description: 'Licencias de software, antivirus, VPN y herramientas gratis',
    scanFrequency: 'daily',
  },
  {
    id: 'apple',
    name: 'Apple App Store',
    url: 'https://apps.apple.com/us/genre/ios/id36',
    icon: 'Smartphone',
    color: '#000000',
    description: 'Apps y juegos iOS gratis de la semana',
    scanFrequency: 'weekly',
  },
];
