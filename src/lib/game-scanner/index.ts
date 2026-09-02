/**
 * DIGITAL PRODUCT SCANNER - Main exports
 */
export { gameScanner, runFullScan, getScannedGamesAsProducts } from './scanner';
export type { ScannedGame, ScanResult, ScanSummary, GameSource, DeliveryType, SourceInfo } from './types';
export { GAME_SOURCES, DIGISTORE_PRICING, FREE_GAME_PRICING } from './types';