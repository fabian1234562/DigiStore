/**
 * GAME SCANNER TYPES
 * 
 * The scanner finds digital products available at low prices
 * and publishes them in the store at $1-$5 USD.
 */

/** Source where the product was found */
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

/** Delivery type for the product */
export type DeliveryType =
  | 'key'          // Activation key for Steam/Epic
  | 'claim-link'   // Link to claim on platform
  | 'drm-free'     // Direct download without DRM
  | 'account'      // Requires platform account
  | 'app'          // Mobile app
  | 'software';    // Software license

/** Status of the scanned product */
export type ScanStatus =
  | 'active'       // Available
  | 'expiring'     // Ending soon (last 24h)
  | 'expired'      // No longer available
  | 'claimed'      // Key obtained
  | 'error';       // Scan error

/** Scanned product from a source */
export interface ScannedGame {
  id: string;                    // Unique ID in DigiStore
  sourceId: string;              // ID in the original source
  source: GameSource;            // Where it comes from
  title: string;                 // Product name
  description: string;           // Short description
  longDescription?: string;      // Long description
  imageUrl: string;              // Cover image URL
  originalPrice: number;         // Original price in store (USD)
  sellPrice: number;             // Our selling price ($1.99-$4.99)
  deliveryType: DeliveryType;    // How it's delivered
  platform: string[];            // ['Steam', 'Epic', 'GOG', etc.]
  genre: string[];               // ['Action', 'RPG', etc.]
  claimUrl?: string;             // URL to claim (if applicable)
  claimInstructions?: string;    // Claim instructions
  stock: number;                 // Keys available (0 = unlimited for claim-link)
  unlimitedStock: boolean;       // If claim-link, never runs out
  status: ScanStatus;            // Current status
  startDate: string;             // When it became available
  endDate?: string;              // When it expires
  scannedAt: string;             // When it was scanned
  lastChecked: string;           // Last check time
  tags: string[];                // Additional tags
  rating?: number;               // Product rating (0-5)
  publisher?: string;            // Publisher
  developer?: string;            // Developer
  size?: string;                 // Product size
  systemRequirements?: {         // Minimum requirements
    os?: string;
    cpu?: string;
    ram?: string;
    gpu?: string;
    storage?: string;
  };
}

/** Scan result from a single source */
export interface ScanResult {
  source: GameSource;
  sourceName: string;
  success: boolean;
  gamesFound: ScannedGame[];
  error?: string;
  scannedAt: string;
  duration: number;              // Time taken to scan (ms)
}

/** Full scan summary */
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
  estimatedValue: number;        // Total value if all products sell
}

/** Pricing configuration for products */
export const DIGISTORE_PRICING = {
  defaultPrice: 3.99,            // Default price
  premiumPrice: 4.99,            // For products with original price > $20
  budgetPrice: 2.99,             // For products with original price < $5
  appPrice: 1.99,                // For apps/software
  
  // Threshold for premium price
  premiumThreshold: 20,
  
  // Threshold for budget price
  budgetThreshold: 5,
  
  /** Calculate selling price based on original price */
  calculate(originalPrice: number, type: DeliveryType): number {
    if (type === 'app' || type === 'software') return this.appPrice;
    if (originalPrice >= this.premiumThreshold) return this.premiumPrice;
    if (originalPrice < this.budgetThreshold) return this.budgetPrice;
    return this.defaultPrice;
  },
  
  /** Format price */
  format(price: number): string {
    return `$${price.toFixed(2)} USD`;
  },
};

/** Legacy alias for backward compatibility */
export const FREE_GAME_PRICING = DIGISTORE_PRICING;

/** Source info */
export interface SourceInfo {
  id: GameSource;
  name: string;
  url: string;
  icon: string;                  // Lucide icon name
  color: string;                 // Source color
  description: string;
  scanFrequency: string;         // 'hourly', 'daily', 'weekly'
}

/** All available sources */
export const GAME_SOURCES: SourceInfo[] = [
  {
    id: 'epic-games',
    name: 'Epic Games Store',
    url: 'https://store.epicgames.com/en-US/free-games',
    icon: 'Gamepad2',
    color: '#0078F2',
    description: 'Weekly game promotions from Epic Games',
    scanFrequency: 'weekly',
  },
  {
    id: 'gog',
    name: 'GOG.com',
    url: 'https://www.gog.com/en/games?price=free',
    icon: 'Disc',
    color: '#A348A6',
    description: 'DRM-less games and classic titles',
    scanFrequency: 'weekly',
  },
  {
    id: 'steam',
    name: 'Steam',
    url: 'https://store.steampowered.com/genre/Free%20to%20Play/',
    icon: 'Monitor',
    color: '#1B2838',
    description: 'Digital game deals and promotions on Steam',
    scanFrequency: 'daily',
  },
  {
    id: 'indiegala',
    name: 'IndieGala',
    url: 'https://www.indiegala.com/giveaways',
    icon: 'Gift',
    color: '#E8453C',
    description: 'Promotional games and bundles from IndieGala',
    scanFrequency: 'daily',
  },
  {
    id: 'fanatical',
    name: 'Fanatical',
    url: 'https://www.fanatical.com/en/free',
    icon: 'Flame',
    color: '#FF6B00',
    description: 'Bundle deals and promotions from Fanatical',
    scanFrequency: 'weekly',
  },
  {
    id: 'humble',
    name: 'Humble Bundle',
    url: 'https://www.humblebundle.com/store/free',
    icon: 'Heart',
    color: '#CC0000',
    description: 'Promotional games from Humble Bundle',
    scanFrequency: 'weekly',
  },
  {
    id: 'prime-gaming',
    name: 'Prime Gaming',
    url: 'https://gaming.amazon.com/home',
    icon: 'Crown',
    color: '#00A8E1',
    description: 'Games included with Amazon Prime',
    scanFrequency: 'monthly',
  },
  {
    id: 'software',
    name: 'Software Deals',
    url: 'https://giveawayoftheday.com/',
    icon: 'Monitor',
    color: '#6366F1',
    description: 'Software licenses, antivirus, VPN and tools',
    scanFrequency: 'daily',
  },
  {
    id: 'apple',
    name: 'Apple App Store',
    url: 'https://apps.apple.com/us/genre/ios/id36',
    icon: 'Smartphone',
    color: '#000000',
    description: 'Featured iOS apps and games of the week',
    scanFrequency: 'weekly',
  },
];
