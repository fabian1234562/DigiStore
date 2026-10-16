/**
 * CATÁLOGO FALLBACK — 50 productos organizados por categoría.
 *
 * Categorías:
 *   - Juegos PC (Steam keys)
 *   - Juegos Móvil (Free Fire, PUBG, etc.)
 *   - Skins (CS2, Fortnite)
 *   - Game Currency (V-Bucks, Robux, etc.)
 *   - Tarjetas de Regalo (Steam, etc.)
 *   - Suscripciones (Netflix, Spotify, Discord)
 *   - Juegos Open Source (FILE descargables)
 */

import { promises as fs } from 'fs';
import path from 'path';
import { SEED_GAMES } from '@/lib/game-scanner/seed-data';
import type { ScannedGame } from '@/lib/game-scanner';

export interface FallbackProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice: number;
  currency: string;
  is_free: boolean;
  image: string;
  iconEmoji: string;
  version: string;
  tags: string[];
  featured: boolean;
  badge: string;
  delivery_type: string;
  license_type: string;
  file_name: string | null;
  file_size: number;
  file_type: string | null;
  storage_key: string | null;
  sha256: string | null;
  virus_scan_status: string;
  license_status: string;
  file_status: string;
  key_pool: string;
  official_url: string | null;
  access_instructions: string | null;
  verified: boolean;
  download_enabled: boolean;
  distribution_allowed: boolean;
  source: string;
  claimUrl: string | null;
  product_status: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductMetadata {
  file_name: string;
  file_size: number;
  file_type: string;
  download_url: string;
  sha256: string | null;
  version: string;
  note?: string;
}

interface CatalogEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice: number;
  image: string;
  badge: string;
  delivery_type: string;
  license_type: string;
  tags: string[];
  platform: string[];
  featured: boolean;
}

// ═══════════════════════════════════════════════════════════════
// CATÁLOGO CURADO — 50 productos bien organizados
// ═══════════════════════════════════════════════════════════════

const CATALOG: CatalogEntry[] = [
  // ─── JUEGOS PC MÁS VENDIDOS ───
  { id: 'key-minecraft-java', name: 'Minecraft Java Edition', description: 'Clave para Minecraft Java. El juego más vendido de la historia (300M+ copias). Canjea en minecraft.net.', category: 'Juegos PC', subcategory: 'Sandbox', price: 4.99, originalPrice: 29.95, image: '/products/minecraft.png', badge: 'MOJANG', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['minecraft','sandbox','viral','pc'], platform: ['PC','Mac','Linux'], featured: true },
  { id: 'key-gta-v', name: 'GTA V (Grand Theft Auto V)', description: 'Clave Steam para GTA V. 195M+ copias vendidas. Historia + GTA Online.', category: 'Juegos PC', subcategory: 'Action', price: 4.99, originalPrice: 29.99, image: '/products/gta-v.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['gta','action','open-world','viral'], platform: ['PC','PS5','Xbox'], featured: true },
  { id: 'key-cs2', name: 'Counter-Strike 2', description: 'Clave Steam para CS2. El FPS #1 del mundo. 1.5M jugadores concurrentes. Skins, competitive.', category: 'Juegos PC', subcategory: 'FPS', price: 1.99, originalPrice: 0, image: '/products/counter-strike-2.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['cs2','csgo','fps','competitive','viral'], platform: ['PC'], featured: true },
  { id: 'key-valorant', name: 'Valorant', description: 'Clave Riot para Valorant. FPS táctico #1. 20M+ jugadores. Skins, agents, ranked.', category: 'Juegos PC', subcategory: 'FPS', price: 1.99, originalPrice: 0, image: '/products/valorant.png', badge: 'RIOT', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['valorant','fps','riot','viral'], platform: ['PC'], featured: true },
  { id: 'key-lol', name: 'League of Legends', description: 'Clave Riot para LoL. El MOBA #1 del mundo. 180M+ jugadores. Skins, campeones.', category: 'Juegos PC', subcategory: 'MOBA', price: 1.99, originalPrice: 0, image: '/products/league-of-legends.png', badge: 'RIOT', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['lol','moba','riot','viral'], platform: ['PC'], featured: true },
  { id: 'key-elden-ring', name: 'Elden Ring', description: 'Clave Steam para Elden Ring. GOTY 2022. 25M+ copias. Open world RPG by FromSoftware.', category: 'Juegos PC', subcategory: 'RPG', price: 4.99, originalPrice: 59.99, image: '/products/fortnite.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['elden-ring','rpg','fromsoftware','viral'], platform: ['PC','PS5','Xbox'], featured: true },
  { id: 'key-bg3', name: "Baldur's Gate 3", description: 'Clave Steam para BG3. GOTY 2023. 15M+ copias. RPG por turnos. D&D.', category: 'Juegos PC', subcategory: 'RPG', price: 4.99, originalPrice: 59.99, image: '/products/fortnite.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['baldurs-gate','rpg','dnd','viral'], platform: ['PC','PS5','Xbox'], featured: true },
  { id: 'key-cyberpunk', name: 'Cyberpunk 2077', description: 'Clave Steam para Cyberpunk 2077. RPG open world. Keanu Reeves. 25M+ copias.', category: 'Juegos PC', subcategory: 'RPG', price: 4.99, originalPrice: 59.99, image: '/products/fortnite.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['cyberpunk','rpg','cdpr','viral'], platform: ['PC','PS5','Xbox'], featured: false },
  { id: 'key-hogwarts', name: 'Hogwarts Legacy', description: 'Clave Steam para Hogwarts Legacy. RPG del mundo de Harry Potter. 22M+ copias.', category: 'Juegos PC', subcategory: 'RPG', price: 4.99, originalPrice: 59.99, image: '/products/fortnite.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['hogwarts','harry-potter','rpg','viral'], platform: ['PC','PS5','Xbox'], featured: false },
  { id: 'key-palworld', name: 'Palworld', description: 'Clave Steam para Palworld. Pokémon con armas. 15M+ copias en 1 mes. Viral.', category: 'Juegos PC', subcategory: 'Survival', price: 4.99, originalPrice: 29.99, image: '/products/fortnite.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['palworld','survival','pokemon','viral'], platform: ['PC','Xbox'], featured: true },
  { id: 'key-helldivers2', name: 'Helldivers 2', description: 'Clave Steam para Helldivers 2. Co-op shooter. 12M+ copias en 3 meses. Viral.', category: 'Juegos PC', subcategory: 'Co-op Shooter', price: 4.99, originalPrice: 39.99, image: '/products/fortnite.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['helldivers','coop','shooter','viral'], platform: ['PC','PS5'], featured: false },
  { id: 'key-stardew', name: 'Stardew Valley', description: 'Clave Steam para Stardew Valley. Farming sim. 30M+ copias. Adictivo.', category: 'Juegos PC', subcategory: 'Simulation', price: 3.99, originalPrice: 14.99, image: '/products/fortnite.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['stardew','farming','simulation','viral'], platform: ['PC','Mac','Mobile','Switch'], featured: false },
  { id: 'key-hades2', name: 'Hades II', description: 'Clave Steam para Hades II. Roguelike. Secuela del GOTY Hades. Muy esperado.', category: 'Juegos PC', subcategory: 'Roguelike', price: 4.99, originalPrice: 29.99, image: '/products/fortnite.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['hades','roguelike','viral'], platform: ['PC'], featured: false },
  { id: 'key-monsterhunter', name: 'Monster Hunter World', description: 'Clave Steam para MHW. Caza monstruos. 25M+ copias. Co-op 4 jugadores.', category: 'Juegos PC', subcategory: 'Action RPG', price: 4.99, originalPrice: 29.99, image: '/products/fortnite.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['monster-hunter','action','coop','viral'], platform: ['PC','PS5','Xbox'], featured: false },
  { id: 'key-deadcells', name: 'Dead Cells', description: 'Clave Steam para Dead Cells. Roguelike metroidvania. 10M+ copias. Adictivo.', category: 'Juegos PC', subcategory: 'Roguelike', price: 3.99, originalPrice: 24.99, image: '/products/fortnite.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['dead-cells','roguelike','metroidvania'], platform: ['PC','Mobile','Switch'], featured: false },
  { id: 'key-itakestwo', name: 'It Takes Two', description: 'Clave Steam para It Takes Two. Co-op GOTY 2021. 16M+ copias. Parejas.', category: 'Juegos PC', subcategory: 'Co-op', price: 4.99, originalPrice: 39.99, image: '/products/fortnite.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['it-takes-two','coop','viral'], platform: ['PC','PS5','Xbox','Switch'], featured: false },
  { id: 'key-civ6', name: 'Civilization VI', description: 'Clave Steam para Civ VI. Estrategia 4X. 11M+ copias. "Un turno más".', category: 'Juegos PC', subcategory: 'Strategy', price: 4.99, originalPrice: 59.99, image: '/products/fortnite.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['civ6','civilization','strategy','4x'], platform: ['PC','Mac','Mobile','Switch'], featured: false },
  { id: 'key-diablo4', name: 'Diablo IV', description: 'Clave Battle.net para Diablo IV. ARPG. 12M+ copias. Loot infinito. Season pass.', category: 'Juegos PC', subcategory: 'ARPG', price: 4.99, originalPrice: 69.99, image: '/products/diablo-iv.svg', badge: 'BLIZZARD', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['diablo','arpg','blizzard','viral'], platform: ['PC','PS5','Xbox'], featured: true },
  { id: 'key-cod', name: 'Call of Duty: Modern Warfare III', description: 'Clave Steam para COD MW3. FPS militar. Campaña + Multiplayer + Warzone.', category: 'Juegos PC', subcategory: 'FPS', price: 4.99, originalPrice: 69.99, image: '/products/call-of-duty.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['cod','call-of-duty','fps','viral'], platform: ['PC','PS5','Xbox'], featured: true },
  { id: 'key-apex', name: 'Apex Legends', description: 'Clave Steam para Apex Legends. Battle Royale FPS. 100M+ jugadores.', category: 'Juegos PC', subcategory: 'Battle Royale', price: 1.99, originalPrice: 0, image: '/products/apex-legends.svg', badge: 'EA', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['apex','battle-royale','fps','viral'], platform: ['PC','PS5','Xbox','Switch'], featured: true },

  // ─── JUEGOS MÓVIL MÁS VENDIDOS ───
  { id: 'key-freefire-100', name: 'Free Fire - 100 Diamantes', description: '100 Diamantes para Free Fire. 1B+ descargas. Compra skins, personajes.', category: 'Juegos Móvil', subcategory: 'Free Fire', price: 1.99, originalPrice: 0.99, image: '/products/free-fire.svg', badge: 'GARENA', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['free-fire','diamonds','mobile','viral'], platform: ['Android','iOS'], featured: true },
  { id: 'key-freefire-520', name: 'Free Fire - 520 Diamantes', description: '520 Diamantes para Free Fire. Mejor valor. Skins, personajes.', category: 'Juegos Móvil', subcategory: 'Free Fire', price: 2.99, originalPrice: 4.99, image: '/products/free-fire.svg', badge: 'GARENA', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['free-fire','diamonds','mobile','viral'], platform: ['Android','iOS'], featured: true },
  { id: 'key-freefire-1080', name: 'Free Fire - 1080 Diamantes', description: '1080 Diamantes para Free Fire. Más barato por diamante.', category: 'Juegos Móvil', subcategory: 'Free Fire', price: 3.99, originalPrice: 9.99, image: '/products/free-fire.svg', badge: 'GARENA', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['free-fire','diamonds','mobile','viral'], platform: ['Android','iOS'], featured: false },
  { id: 'key-pubg-60', name: 'PUBG Mobile - 60 UC', description: '60 UC para PUBG Mobile. 1B+ descargas. Skins, Royale Pass.', category: 'Juegos Móvil', subcategory: 'PUBG', price: 1.99, originalPrice: 0.99, image: '/products/pubg-mobile.svg', badge: 'PUBG', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['pubg','uc','mobile','viral'], platform: ['Android','iOS'], featured: true },
  { id: 'key-pubg-325', name: 'PUBG Mobile - 325 UC', description: '325 UC para PUBG Mobile. Skins, Royale Pass.', category: 'Juegos Móvil', subcategory: 'PUBG', price: 2.99, originalPrice: 4.99, image: '/products/pubg-mobile.svg', badge: 'PUBG', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['pubg','uc','mobile','viral'], platform: ['Android','iOS'], featured: false },
  { id: 'key-roblox-400', name: 'Roblox - 400 Robux', description: '400 Robux para Roblox. 200M+ jugadores mensuales. Avatar, game passes.', category: 'Juegos Móvil', subcategory: 'Roblox', price: 1.99, originalPrice: 4.99, image: '/products/roblox.png', badge: 'ROBLOX', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['roblox','robux','mobile','viral'], platform: ['PC','Mac','Mobile','Xbox'], featured: true },
  { id: 'key-roblox-800', name: 'Roblox - 800 Robux', description: '800 Robux para Roblox. Mejor valor. Avatar, game passes.', category: 'Juegos Móvil', subcategory: 'Roblox', price: 2.99, originalPrice: 9.99, image: '/products/roblox.png', badge: 'ROBLOX', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['roblox','robux','mobile','viral'], platform: ['PC','Mac','Mobile','Xbox'], featured: true },
  { id: 'key-roblox-1700', name: 'Roblox - 1700 Robux', description: '1700 Robux para Roblox. Mejor precio por Robux.', category: 'Juegos Móvil', subcategory: 'Roblox', price: 4.99, originalPrice: 19.99, image: '/products/roblox.png', badge: 'ROBLOX', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['roblox','robux','mobile','viral'], platform: ['PC','Mac','Mobile','Xbox'], featured: false },
  { id: 'key-clash-gems', name: 'Clash of Clans - 500 Gems', description: '500 Gems para Clash of Clans. 500M+ descargas. Acelera, compra recursos.', category: 'Juegos Móvil', subcategory: 'Clash', price: 1.99, originalPrice: 4.99, image: '/products/clash-of-clans.svg', badge: 'SUPERCELL', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['clash-of-clans','gems','mobile','viral'], platform: ['Android','iOS'], featured: false },
  { id: 'key-mobilelegends', name: 'Mobile Legends - 500 Diamonds', description: '500 Diamonds para Mobile Legends. MOBA #1 en móvil. 1B+ descargas. Skins, héroes.', category: 'Juegos Móvil', subcategory: 'MLBB', price: 1.99, originalPrice: 4.99, image: '/products/mobile-legends.svg', badge: 'MOONTON', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['mobile-legends','diamonds','moba','mobile','viral'], platform: ['Android','iOS'], featured: true },
  { id: 'key-clashroyale', name: 'Clash Royale - 500 Gems', description: '500 Gems para Clash Royale. CCG + RTS. 500M+ descargas. Skins, cofres.', category: 'Juegos Móvil', subcategory: 'Clash Royale', price: 1.99, originalPrice: 4.99, image: '/products/clash-royale.svg', badge: 'SUPERCELL', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['clash-royale','gems','mobile','viral'], platform: ['Android','iOS'], featured: false },

  // ─── FORTNITE (el más viral) ───
  { id: 'key-fortnite-1000', name: 'Fortnite - 1000 V-Bucks', description: '1000 V-Bucks para Fortnite. 500M+ jugadores. Skins, battle pass, bailes.', category: 'Fortnite', subcategory: 'V-Bucks', price: 2.99, originalPrice: 9.99, image: '/products/fortnite.png', badge: 'EPIC', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['fortnite','v-bucks','currency','epic','viral'], platform: ['PC','PS5','Xbox','Switch','Mobile'], featured: true },
  { id: 'key-fortnite-2800', name: 'Fortnite - 2800 V-Bucks', description: '2800 V-Bucks para Fortnite. Mejor valor. Skins, battle pass.', category: 'Fortnite', subcategory: 'V-Bucks', price: 4.99, originalPrice: 24.99, image: '/products/fortnite.png', badge: 'EPIC', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['fortnite','v-bucks','currency','epic','viral'], platform: ['PC','PS5','Xbox','Switch','Mobile'], featured: true },
  { id: 'key-fortnite-5000', name: 'Fortnite - 5000 V-Bucks', description: '5000 V-Bucks para Fortnite. Máximo valor. Skins premium, battle pass + extras.', category: 'Fortnite', subcategory: 'V-Bucks', price: 4.99, originalPrice: 39.99, image: '/products/fortnite.png', badge: 'EPIC', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['fortnite','v-bucks','currency','epic','viral'], platform: ['PC','PS5','Xbox','Switch','Mobile'], featured: false },

  // ─── GENSHIN / HONKAI (gacha viral) ───
  { id: 'key-genshin-980', name: 'Genshin Impact - 980 Crystals', description: '980 Genesis Crystals para Genshin. 200M+ jugadores. Personajes, armas.', category: 'Gacha', subcategory: 'Genshin', price: 3.99, originalPrice: 14.99, image: '/products/genshin-impact.png', badge: 'HOYOVERSE', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['genshin','crystals','currency','gacha','viral'], platform: ['PC','PS5','Mobile'], featured: true },
  { id: 'key-genshin-3280', name: 'Genshin Impact - 3280 Crystals', description: '3280 Genesis Crystals para Genshin. Mejor valor. Personajes 5 estrellas.', category: 'Gacha', subcategory: 'Genshin', price: 4.99, originalPrice: 49.99, image: '/products/genshin-impact.png', badge: 'HOYOVERSE', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['genshin','crystals','currency','gacha','viral'], platform: ['PC','PS5','Mobile'], featured: true },
  { id: 'key-honkai-980', name: 'Honkai Star Rail - 980 Stellar Jade', description: '980 Stellar Jade para Honkai Star Rail. 100M+ jugadores. Personajes, conos de luz.', category: 'Gacha', subcategory: 'Honkai', price: 3.99, originalPrice: 14.99, image: '/products/honkai-star-rail.svg', badge: 'HOYOVERSE', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['honkai','stellar-jade','currency','gacha','viral'], platform: ['PC','Mobile'], featured: true },
  { id: 'key-honkai-3280', name: 'Honkai Star Rail - 3280 Stellar Jade', description: '3280 Stellar Jade para Honkai. Mejor valor. Personajes 5 estrellas.', category: 'Gacha', subcategory: 'Honkai', price: 4.99, originalPrice: 49.99, image: '/products/honkai-star-rail.svg', badge: 'HOYOVERSE', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['honkai','stellar-jade','currency','gacha','viral'], platform: ['PC','Mobile'], featured: false },

  // ─── SKINS ───
  { id: 'key-skin-cs2-ak', name: 'CS2 Skin - AK-47 Redline', description: 'Skin AK-47 | Redline (FT) para CS2. La skin más popular de CS. Trade en Steam.', category: 'Skins', subcategory: 'CS2', price: 1.99, originalPrice: 15.00, image: '/products/counter-strike-2.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['cs2','csgo','skin','ak47','viral'], platform: ['PC'], featured: true },
  { id: 'key-skin-cs2-awp', name: 'CS2 Skin - AWP Asiimov', description: 'Skin AWP | Asiimov (FT) para CS2. La skin de AWP más vendida. Trade en Steam.', category: 'Skins', subcategory: 'CS2', price: 3.99, originalPrice: 50.00, image: '/products/counter-strike-2.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['cs2','csgo','skin','awp','asiimov','viral'], platform: ['PC'], featured: true },
  { id: 'key-skin-fortnite', name: 'Fortnite - Skin Bundle Exclusivo', description: 'Bundle de skins para Fortnite. 2 skins + back bling + pickaxe + 500 V-Bucks.', category: 'Skins', subcategory: 'Fortnite', price: 3.99, originalPrice: 24.99, image: '/products/fortnite.png', badge: 'EPIC', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['fortnite','skin','bundle','epic','viral'], platform: ['PC','PS5','Xbox','Switch','Mobile'], featured: true },
  { id: 'key-skin-valorant', name: 'Valorant - Skin Bundle Prime', description: 'Bundle de skins Prime para Valorant. 5 skins de armas premium + extras.', category: 'Skins', subcategory: 'Valorant', price: 3.99, originalPrice: 70.00, image: '/products/valorant.png', badge: 'RIOT', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['valorant','skin','bundle','riot','viral'], platform: ['PC'], featured: false },

  // ─── TARJETAS DE REGALO ───
  { id: 'key-steam-10', name: 'Steam Gift Card - $10', description: 'Tarjeta Steam $10 USD. Compra cualquier juego en Steam.', category: 'Tarjetas de Regalo', subcategory: 'Steam', price: 3.99, originalPrice: 10.00, image: '/products/steam.png', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['steam','gift-card','wallet','viral'], platform: ['PC'], featured: true },
  { id: 'key-steam-25', name: 'Steam Gift Card - $25', description: 'Tarjeta Steam $25 USD. Compra cualquier juego.', category: 'Tarjetas de Regalo', subcategory: 'Steam', price: 4.99, originalPrice: 25.00, image: '/products/steam.png', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['steam','gift-card','wallet','viral'], platform: ['PC'], featured: true },
  { id: 'key-googleplay-10', name: 'Google Play Gift Card - $10', description: 'Tarjeta Google Play $10. Compra apps, juegos, películas.', category: 'Tarjetas de Regalo', subcategory: 'Google Play', price: 3.99, originalPrice: 10.00, image: '/products/google-play.svg', badge: 'GOOGLE', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['google-play','gift-card','android','viral'], platform: ['Android'], featured: false },
  { id: 'key-psn-10', name: 'PlayStation Gift Card - $10', description: 'Tarjeta PSN $10. Compra juegos, DLC, PS Plus.', category: 'Tarjetas de Regalo', subcategory: 'PlayStation', price: 3.99, originalPrice: 10.00, image: '/products/playstation.png', badge: 'PSN', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['playstation','psn','gift-card','viral'], platform: ['PS5','PS4'], featured: false },
  { id: 'key-xbox-10', name: 'Xbox Gift Card - $10', description: 'Tarjeta Xbox $10. Compra juegos, DLC, Game Pass.', category: 'Tarjetas de Regalo', subcategory: 'Xbox', price: 3.99, originalPrice: 10.00, image: '/products/xbox.png', badge: 'XBOX', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['xbox','gift-card','microsoft','viral'], platform: ['Xbox'], featured: false },

  // ─── SUSCRIPCIONES ───
  { id: 'key-netflix-1m', name: 'Netflix Premium - 1 Mes', description: '1 mes Netflix Premium (4K). Recibe credenciales tras compra.', category: 'Suscripciones', subcategory: 'Netflix', price: 3.99, originalPrice: 15.99, image: '/products/netflix.png', badge: 'NETFLIX', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['netflix','subscription','streaming','viral'], platform: ['Multi'], featured: true },
  { id: 'key-spotify-3m', name: 'Spotify Premium - 3 Meses', description: '3 meses Spotify Premium. Sin anuncios, offline, HD.', category: 'Suscripciones', subcategory: 'Spotify', price: 2.99, originalPrice: 29.99, image: '/products/spotify.png', badge: 'SPOTIFY', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['spotify','subscription','music','viral'], platform: ['Multi'], featured: true },
  { id: 'key-discord-nitro', name: 'Discord Nitro - 1 Mes', description: '1 mes Discord Nitro. Server boost, stickers, 500MB upload.', category: 'Suscripciones', subcategory: 'Discord', price: 1.99, originalPrice: 9.99, image: '/products/discord.svg', badge: 'DISCORD', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['discord','nitro','subscription','viral'], platform: ['Multi'], featured: false },

  // ─── FÚTBOL / DEPORTES ───
  { id: 'key-fifa-points', name: 'EA FC 25 - 1050 Points', description: '1050 FC Points para EA FC 25 (FIFA). Ultimate Team packs. El juego de fútbol #1.', category: 'Fútbol', subcategory: 'EA FC 25', price: 2.99, originalPrice: 9.99, image: '/products/ea-fc-25.png', badge: 'EA', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['fifa','fc25','points','currency','ea','viral'], platform: ['PC','PS5','Xbox','Switch'], featured: true },
  { id: 'key-fifa-4600', name: 'EA FC 25 - 4600 Points', description: '4600 FC Points para EA FC 25. Mejor valor. Ultimate Team packs grandes.', category: 'Fútbol', subcategory: 'EA FC 25', price: 4.99, originalPrice: 39.99, image: '/products/ea-fc-25.png', badge: 'EA', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['fifa','fc25','points','currency','ea','viral'], platform: ['PC','PS5','Xbox','Switch'], featured: true },

  // ─── LOL / VALORANT CURRENCY ───
  { id: 'key-lol-rp', name: 'LoL - 1000 Riot Points', description: '1000 Riot Points para LoL. Compra skins, campeones. El MOBA #1.', category: 'Game Currency', subcategory: 'LoL', price: 2.99, originalPrice: 9.99, image: '/products/league-of-legends.png', badge: 'RIOT', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['lol','riot-points','currency','skins','viral'], platform: ['PC'], featured: false },
  { id: 'key-valorant-vp', name: 'Valorant - 1000 VP', description: '1000 Valorant Points. Skins de armas, battle pass. FPS #1.', category: 'Game Currency', subcategory: 'Valorant', price: 2.99, originalPrice: 9.99, image: '/products/valorant.png', badge: 'RIOT', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['valorant','vp','currency','skins','viral'], platform: ['PC'], featured: false },

  // ─── OTROS POPULARES ───
  { id: 'key-destiny-silver', name: 'Destiny 2 - 1000 Silver', description: '1000 Silver para Destiny 2. Skins, emotes, ornaments.', category: 'Game Currency', subcategory: 'Destiny', price: 2.99, originalPrice: 9.99, image: '/products/destiny-2.svg', badge: 'BUNGIE', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['destiny-2','silver','currency','skins','viral'], platform: ['PC','PS5','Xbox'], featured: false },
  { id: 'key-overwatch-coins', name: 'Overwatch 2 - 1000 Coins', description: '1000 Overwatch Coins. Battle pass, skins. Hero shooter #1.', category: 'Game Currency', subcategory: 'Overwatch', price: 2.99, originalPrice: 9.99, image: '/products/overwatch-2.svg', badge: 'BLIZZARD', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['overwatch','coins','currency','skins','viral'], platform: ['PC','PS5','Xbox','Switch'], featured: false },
  { id: 'key-gta-sharkcard', name: 'GTA V Online - Megalodon Shark Card', description: 'Megalodon Shark Card ($8M GTA$) para GTA Online. El modo online más jugado.', category: 'Game Currency', subcategory: 'GTA', price: 3.99, originalPrice: 19.99, image: '/products/gta-v.svg', badge: 'ROCKSTAR', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['gta','shark-card','currency','rockstar','viral'], platform: ['PC','PS5','Xbox'], featured: false },
  { id: 'key-youtube-1m', name: 'YouTube Premium - 1 Mes', description: '1 mes YouTube Premium. Sin anuncios, YouTube Music, offline.', category: 'Suscripciones', subcategory: 'YouTube', price: 2.99, originalPrice: 11.99, image: '/products/youtube.png', badge: 'YOUTUBE', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['youtube','premium','subscription','viral'], platform: ['Multi'], featured: false },
];

function calculateSellPrice(originalPrice: number): number {
  if (originalPrice >= 20) return 4.99;
  if (originalPrice >= 10) return 3.99;
  if (originalPrice >= 5) return 2.99;
  return 1.99;
}

let catalogCache: FallbackProduct[] | null = null;
let metadataCache: Record<string, ProductMetadata> | null = null;

async function loadMetadata(): Promise<Record<string, ProductMetadata>> {
  if (metadataCache) return metadataCache;
  const metadataPath = path.join(process.cwd(), 'public', 'downloads', 'metadata.json');
  try {
    const raw = await fs.readFile(metadataPath, 'utf-8');
    const data = JSON.parse(raw);
    metadataCache = (data.products || {}) as Record<string, ProductMetadata>;
  } catch {
    metadataCache = {};
  }
  return metadataCache;
}

async function buildCatalog(): Promise<FallbackProduct[]> {
  const metadata = await loadMetadata();
  const catalog: FallbackProduct[] = [];

  for (const entry of CATALOG) {
    let file_name: string | null = null;
    let file_size = 0;
    let file_type: string | null = null;
    let storage_key: string | null = null;
    let sha256: string | null = null;
    let version = '1.0.0';

    // Para productos FILE, buscar metadata
    if (entry.delivery_type === 'FILE') {
      const fileMeta = metadata[entry.id];
      if (fileMeta && fileMeta.file_size > 0 && fileMeta.download_url) {
        file_name = fileMeta.file_name;
        file_size = fileMeta.file_size;
        file_type = fileMeta.file_type;
        storage_key = `remote:${fileMeta.download_url}`;
        sha256 = fileMeta.sha256;
        version = fileMeta.version || '1.0.0';
      } else {
        continue; // Los FILE sin metadata no se muestran
      }
    }

    catalog.push({
      id: entry.id,
      slug: entry.id.toLowerCase(),
      name: entry.name,
      description: entry.description,
      longDescription: entry.description,
      category: entry.category,
      subcategory: entry.subcategory,
      price: entry.price,
      originalPrice: entry.originalPrice,
      currency: 'USD',
      is_free: false,
      image: entry.image,
      iconEmoji: '📦',
      version,
      tags: entry.tags,
      featured: entry.featured,
      badge: entry.badge,
      delivery_type: entry.delivery_type,
      license_type: entry.license_type,
      file_name,
      file_size,
      file_type,
      storage_key,
      sha256,
      virus_scan_status: 'CLEAN',
      license_status: 'AUTHORIZED',
      file_status: entry.delivery_type === 'FILE' ? 'READY' : 'N/A',
      key_pool: '[]',
      official_url: entry.delivery_type === 'KEY' ? null : null,
      access_instructions: entry.delivery_type === 'KEY' ? 'Recibirás tu clave de activación tras la compra' : null,
      verified: true,
      download_enabled: true,
      distribution_allowed: true,
      source: entry.delivery_type === 'FILE' ? 'github' : 'authorized-reseller',
      claimUrl: null,
      product_status: 'PUBLISHED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return catalog;
}

export async function getFallbackCatalog(): Promise<FallbackProduct[]> {
  if (catalogCache) return catalogCache;
  catalogCache = await buildCatalog();
  return catalogCache;
}

export async function getFallbackProductById(id: string): Promise<FallbackProduct | null> {
  const catalog = await getFallbackCatalog();
  return catalog.find((p) => p.id === id || p.slug === id) || null;
}

export async function getFallbackProductBySlug(slug: string): Promise<FallbackProduct | null> {
  const catalog = await getFallbackCatalog();
  return catalog.find((p) => p.slug === slug) || null;
}

export async function listFallbackDownloadableProducts(filter?: {
  category?: string;
  is_free?: boolean;
}): Promise<FallbackProduct[]> {
  const catalog = await getFallbackCatalog();
  return catalog.filter((p) => {
    if (!p.verified || !p.download_enabled || !p.distribution_allowed) return false;
    if (filter?.category && p.category !== filter.category) return false;
    if (filter?.is_free !== undefined && p.is_free !== filter.is_free) return false;
    return true;
  });
}
