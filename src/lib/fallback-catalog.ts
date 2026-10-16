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
  // ─── JUEGOS PC (Steam Keys) ───
  { id: 'key-minecraft-java', name: 'Minecraft Java Edition', description: 'Clave de licencia para Minecraft Java Edition. El juego de bloques más vendido del mundo. Canjea en minecraft.net.', category: 'Juegos PC', subcategory: 'Sandbox', price: 4.99, originalPrice: 29.95, image: '/products/minecraft.png', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['minecraft','sandbox','viral','pc'], platform: ['PC','Mac','Linux'], featured: true },
  { id: 'key-gta-v', name: 'GTA V (Grand Theft Auto V)', description: 'Clave Steam para GTA V. El juego de mundo abierto más vendido. Historia + GTA Online.', category: 'Juegos PC', subcategory: 'Action', price: 4.99, originalPrice: 29.99, image: '/products/gta-v.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['gta','action','open-world','viral'], platform: ['PC','PS5','Xbox'], featured: true },
  { id: 'key-cs2', name: 'Counter-Strike 2', description: 'Clave Steam para CS2. El FPS competitivo más jugado del mundo. Ranking, competitive, skins.', category: 'Juegos PC', subcategory: 'FPS', price: 1.99, originalPrice: 0, image: '/products/counter-strike-2.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['cs2','csgo','fps','competitive','viral'], platform: ['PC'], featured: true },
  { id: 'key-valorant', name: 'Valorant', description: 'Clave Riot para Valorant. FPS táctico 5v5. Agents, habilidades, skins. Gratis pero con clave para contenido.', category: 'Juegos PC', subcategory: 'FPS', price: 1.99, originalPrice: 0, image: '/products/valorant.png', badge: 'RIOT', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['valorant','fps','riot','viral'], platform: ['PC'], featured: true },
  { id: 'key-lol', name: 'League of Legends', description: 'Clave Riot para LoL. El MOBA más jugado del mundo. 150+ campeones, ranked, skins.', category: 'Juegos PC', subcategory: 'MOBA', price: 1.99, originalPrice: 0, image: '/products/league-of-legends.png', badge: 'RIOT', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['lol','moba','riot','viral'], platform: ['PC'], featured: true },
  { id: 'key-rocketleague', name: 'Rocket League', description: 'Clave Epic para Rocket League. Fútbol con coches. Multijugador, ranked, cosméticos.', category: 'Juegos PC', subcategory: 'Sports', price: 1.99, originalPrice: 0, image: '/products/rocket-league.svg', badge: 'EPIC', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['rocket-league','sports','epic','viral'], platform: ['PC','PS5','Xbox','Switch'], featured: false },
  { id: 'key-destiny2', name: 'Destiny 2', description: 'Clave Steam para Destiny 2. FPS MMO. Raids, misiones, loot, expansions.', category: 'Juegos PC', subcategory: 'FPS MMO', price: 1.99, originalPrice: 0, image: '/products/destiny-2.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['destiny-2','fps','mmo','viral'], platform: ['PC','PS5','Xbox'], featured: false },
  { id: 'key-overwatch2', name: 'Overwatch 2', description: 'Clave Battle.net para OW2. Hero shooter 5v5. 35+ héroes, ranked, skins.', category: 'Juegos PC', subcategory: 'Hero Shooter', price: 1.99, originalPrice: 0, image: '/products/overwatch-2.svg', badge: 'BATTLE.NET', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['overwatch','hero-shooter','blizzard','viral'], platform: ['PC','PS5','Xbox','Switch'], featured: false },
  { id: 'key-apex', name: 'Apex Legends', description: 'Clave Steam para Apex Legends. Battle Royale FPS. 20+ legends, squads, ranked.', category: 'Juegos PC', subcategory: 'Battle Royale', price: 1.99, originalPrice: 0, image: '/products/apex-legends.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['apex','battle-royale','fps','viral'], platform: ['PC','PS5','Xbox','Switch'], featured: true },
  { id: 'key-warframe', name: 'Warframe', description: 'Clave Steam para Warframe. Action RPG cooperativo. 40+ warframes, misiones, loot infinito.', category: 'Juegos PC', subcategory: 'Action RPG', price: 1.99, originalPrice: 0, image: '/products/destiny-2.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['warframe','action-rpg','coop','viral'], platform: ['PC','PS5','Xbox','Switch'], featured: false },

  // ─── JUEGOS MÓVIL ───
  { id: 'key-freefire-100', name: 'Free Fire - 100 Diamantes', description: '100 Diamantes para Free Fire. Canjea en Garena. Compra skins, personajes, armas.', category: 'Juegos Móvil', subcategory: 'Free Fire', price: 1.99, originalPrice: 0.99, image: '/products/free-fire.svg', badge: 'GARENA', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['free-fire','diamonds','mobile','garena','viral'], platform: ['Android','iOS'], featured: true },
  { id: 'key-freefire-520', name: 'Free Fire - 520 Diamantes', description: '520 Diamantes para Free Fire. Mejor valor. Canjea en Garena.', category: 'Juegos Móvil', subcategory: 'Free Fire', price: 2.99, originalPrice: 4.99, image: '/products/free-fire.svg', badge: 'GARENA', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['free-fire','diamonds','mobile','garena','viral'], platform: ['Android','iOS'], featured: true },
  { id: 'key-freefire-1080', name: 'Free Fire - 1080 Diamantes', description: '1080 Diamantes para Free Fire. Mejor precio por diamante.', category: 'Juegos Móvil', subcategory: 'Free Fire', price: 3.99, originalPrice: 9.99, image: '/products/free-fire.svg', badge: 'GARENA', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['free-fire','diamonds','mobile','garena','viral'], platform: ['Android','iOS'], featured: false },
  { id: 'key-pubg-60', name: 'PUBG Mobile - 60 UC', description: '60 UC para PUBG Mobile. Compra skins, crates, Royale Pass.', category: 'Juegos Móvil', subcategory: 'PUBG', price: 1.99, originalPrice: 0.99, image: '/products/pubg-mobile.svg', badge: 'PUBG', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['pubg','uc','mobile','viral'], platform: ['Android','iOS'], featured: true },
  { id: 'key-pubg-325', name: 'PUBG Mobile - 325 UC', description: '325 UC para PUBG Mobile. Compra skins, Royale Pass.', category: 'Juegos Móvil', subcategory: 'PUBG', price: 2.99, originalPrice: 4.99, image: '/products/pubg-mobile.svg', badge: 'PUBG', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['pubg','uc','mobile','viral'], platform: ['Android','iOS'], featured: false },
  { id: 'key-roblox-400', name: 'Roblox - 400 Robux', description: '400 Robux para Roblox. Compra avatar items, game passes, accesorios.', category: 'Juegos Móvil', subcategory: 'Roblox', price: 1.99, originalPrice: 4.99, image: '/products/roblox.png', badge: 'ROBLOX', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['roblox','robux','mobile','viral'], platform: ['PC','Mac','Mobile','Xbox'], featured: true },
  { id: 'key-roblox-800', name: 'Roblox - 800 Robux', description: '800 Robux para Roblox. Mejor valor. Avatar items, game passes.', category: 'Juegos Móvil', subcategory: 'Roblox', price: 2.99, originalPrice: 9.99, image: '/products/roblox.png', badge: 'ROBLOX', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['roblox','robux','mobile','viral'], platform: ['PC','Mac','Mobile','Xbox'], featured: true },
  { id: 'key-clash-gems', name: 'Clash of Clans - 500 Gems', description: '500 Gems para Clash of Clans. Acelera construcciones, compra recursos.', category: 'Juegos Móvil', subcategory: 'Clash', price: 1.99, originalPrice: 4.99, image: '/products/clash-of-clans.svg', badge: 'SUPERCELL', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['clash-of-clans','gems','mobile','viral'], platform: ['Android','iOS'], featured: false },
  { id: 'key-brawlhalla', name: 'Brawlhalla - 300 Mammoth Coins', description: '300 Mammoth Coins para Brawlhalla. Compra skins, brawlers, colores.', category: 'Juegos Móvil', subcategory: 'Fighting', price: 1.99, originalPrice: 4.99, image: '/products/brawl-stars.svg', badge: 'UBISOFT', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['brawlhalla','coins','mobile','fighting','viral'], platform: ['PC','Mobile','Switch'], featured: false },

  // ─── MONEDA DE JUEGO (Game Currency) ───
  { id: 'key-fortnite-1000', name: 'Fortnite - 1000 V-Bucks', description: '1000 V-Bucks para Fortnite. Compra skins, pases de batalla, bailes. Canjea en Epic Games.', category: 'Game Currency', subcategory: 'Fortnite', price: 2.99, originalPrice: 9.99, image: '/products/fortnite.png', badge: 'EPIC', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['fortnite','v-bucks','currency','epic','viral'], platform: ['PC','PS5','Xbox','Switch','Mobile'], featured: true },
  { id: 'key-fortnite-2800', name: 'Fortnite - 2800 V-Bucks', description: '2800 V-Bucks para Fortnite. Mejor valor. Skins, battle pass, bailes.', category: 'Game Currency', subcategory: 'Fortnite', price: 4.99, originalPrice: 24.99, image: '/products/fortnite.png', badge: 'EPIC', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['fortnite','v-bucks','currency','epic','viral'], platform: ['PC','PS5','Xbox','Switch','Mobile'], featured: true },
  { id: 'key-genshin-980', name: 'Genshin Impact - 980 Crystals', description: '980 Genesis Crystals para Genshin Impact. Compra personajes, armas, resina. HoYoverse.', category: 'Game Currency', subcategory: 'Genshin', price: 3.99, originalPrice: 14.99, image: '/products/genshin-impact.png', badge: 'HOYOVERSE', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['genshin','crystals','currency','gacha','viral'], platform: ['PC','PS5','Mobile'], featured: true },
  { id: 'key-honkai-980', name: 'Honkai Star Rail - 980 Stellar Jade', description: '980 Stellar Jade para Honkai Star Rail. Compra personajes, conos de luz.', category: 'Game Currency', subcategory: 'Honkai', price: 3.99, originalPrice: 14.99, image: '/products/honkai-star-rail.svg', badge: 'HOYOVERSE', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['honkai','stellar-jade','currency','gacha','viral'], platform: ['PC','Mobile'], featured: true },
  { id: 'key-wuthering-980', name: 'Wuthering Waves - 980 Lunites', description: '980 Lunites para Wuthering Waves. Compra personajes, armas.', category: 'Game Currency', subcategory: 'Wuthering', price: 3.99, originalPrice: 14.99, image: '/products/wuthering-waves.svg', badge: 'KURO', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['wuthering-waves','lunites','currency','gacha','viral'], platform: ['PC','Mobile'], featured: false },
  { id: 'key-lol-rp', name: 'LoL - 1000 Riot Points', description: '1000 Riot Points para League of Legends. Compra campeones, skins.', category: 'Game Currency', subcategory: 'LoL', price: 2.99, originalPrice: 9.99, image: '/products/league-of-legends.png', badge: 'RIOT', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['lol','riot-points','currency','skins','viral'], platform: ['PC'], featured: false },
  { id: 'key-valorant-vp', name: 'Valorant - 1000 VP', description: '1000 Valorant Points. Compra skins de armas, battle pass.', category: 'Game Currency', subcategory: 'Valorant', price: 2.99, originalPrice: 9.99, image: '/products/valorant.png', badge: 'RIOT', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['valorant','vp','currency','skins','viral'], platform: ['PC'], featured: false },
  { id: 'key-apex-coins', name: 'Apex Legends - 1000 Coins', description: '1000 Apex Coins. Compra skins, personajes, battle pass.', category: 'Game Currency', subcategory: 'Apex', price: 2.99, originalPrice: 9.99, image: '/products/apex-legends.svg', badge: 'EA', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['apex','coins','currency','skins','viral'], platform: ['PC','PS5','Xbox','Switch'], featured: false },
  { id: 'key-destiny-silver', name: 'Destiny 2 - 1000 Silver', description: '1000 Silver para Destiny 2. Compra skins, emotes, ornaments.', category: 'Game Currency', subcategory: 'Destiny', price: 2.99, originalPrice: 9.99, image: '/products/destiny-2.svg', badge: 'BUNGIE', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['destiny-2','silver','currency','skins','viral'], platform: ['PC','PS5','Xbox'], featured: false },
  { id: 'key-fifa-points', name: 'EA FC 25 - 1050 Points', description: '1050 FC Points para EA FC 25. Compra packs, Ultimate Team.', category: 'Game Currency', subcategory: 'FIFA', price: 2.99, originalPrice: 9.99, image: '/products/ea-fc-25.png', badge: 'EA', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['fifa','fc25','points','currency','ea','viral'], platform: ['PC','PS5','Xbox','Switch'], featured: true },

  // ─── SKINS ───
  { id: 'key-skin-cs2-ak', name: 'CS2 Skin - AK-47 Redline', description: 'Skin AK-47 | Redline (Field-Tested) para Counter-Strike 2. Trade o canjea en Steam.', category: 'Skins', subcategory: 'CS2', price: 1.99, originalPrice: 15.00, image: '/products/counter-strike-2.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['cs2','csgo','skin','ak47','viral'], platform: ['PC'], featured: true },
  { id: 'key-skin-fortnite-bundle', name: 'Fortnite - Skin Bundle', description: 'Bundle de skins para Fortnite. Incluye 2 skins + back bling + pickaxe. Canjea en Epic Games.', category: 'Skins', subcategory: 'Fortnite', price: 3.99, originalPrice: 19.99, image: '/products/fortnite.png', badge: 'EPIC', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['fortnite','skin','bundle','epic','viral'], platform: ['PC','PS5','Xbox','Switch','Mobile'], featured: true },
  { id: 'key-skin-valorant-bundle', name: 'Valorant - Skin Bundle', description: 'Bundle de skins de armas para Valorant. 5 skins de armas premium.', category: 'Skins', subcategory: 'Valorant', price: 3.99, originalPrice: 35.00, image: '/products/valorant.png', badge: 'RIOT', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['valorant','skin','bundle','riot','viral'], platform: ['PC'], featured: false },
  { id: 'key-skin-amongus', name: 'Among Us - 300 Stars', description: '300 Stars para Among Us. Compra skins, hats, pets, bundles.', category: 'Skins', subcategory: 'Among Us', price: 1.99, originalPrice: 4.99, image: '/products/among-us.svg', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['among-us','stars','skins','viral'], platform: ['PC','Mobile'], featured: false },

  // ─── TARJETAS DE REGALO ───
  { id: 'key-steam-10', name: 'Steam Gift Card - $10', description: 'Tarjeta de regalo Steam $10 USD. Canjea en store.steampowered.com. Compra cualquier juego.', category: 'Tarjetas de Regalo', subcategory: 'Steam', price: 3.99, originalPrice: 10.00, image: '/products/steam.png', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['steam','gift-card','wallet','viral'], platform: ['PC'], featured: true },
  { id: 'key-steam-25', name: 'Steam Gift Card - $25', description: 'Tarjeta de regalo Steam $25 USD. Canjea en store.steampowered.com.', category: 'Tarjetas de Regalo', subcategory: 'Steam', price: 4.99, originalPrice: 25.00, image: '/products/steam.png', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['steam','gift-card','wallet','viral'], platform: ['PC'], featured: true },
  { id: 'key-steam-50', name: 'Steam Gift Card - $50', description: 'Tarjeta de regalo Steam $50 USD. Canjea en store.steampowered.com.', category: 'Tarjetas de Regalo', subcategory: 'Steam', price: 4.99, originalPrice: 50.00, image: '/products/steam.png', badge: 'STEAM', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['steam','gift-card','wallet','viral'], platform: ['PC'], featured: false },
  { id: 'key-googleplay-10', name: 'Google Play Gift Card - $10', description: 'Tarjeta Google Play $10 USD. Compra apps, juegos, películas, libros.', category: 'Tarjetas de Regalo', subcategory: 'Google Play', price: 3.99, originalPrice: 10.00, image: '/products/google-play.svg', badge: 'GOOGLE', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['google-play','gift-card','android','viral'], platform: ['Android'], featured: false },
  { id: 'key-xbox-10', name: 'Xbox Gift Card - $10', description: 'Tarjeta Xbox $10 USD. Compra juegos, DLC, Game Pass.', category: 'Tarjetas de Regalo', subcategory: 'Xbox', price: 3.99, originalPrice: 10.00, image: '/products/xbox.png', badge: 'XBOX', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['xbox','gift-card','microsoft','viral'], platform: ['Xbox'], featured: false },
  { id: 'key-psn-10', name: 'PlayStation Gift Card - $10', description: 'Tarjeta PSN $10 USD. Compra juegos, DLC, PS Plus.', category: 'Tarjetas de Regalo', subcategory: 'PlayStation', price: 3.99, originalPrice: 10.00, image: '/products/playstation.png', badge: 'PSN', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['playstation','psn','gift-card','viral'], platform: ['PS5','PS4'], featured: false },

  // ─── SUSCRIPCIONES ───
  { id: 'key-netflix-1m', name: 'Netflix Premium - 1 Mes', description: '1 mes Netflix plan Premium (4K). Recibe credenciales tras compra.', category: 'Suscripciones', subcategory: 'Netflix', price: 3.99, originalPrice: 15.99, image: '/products/netflix.png', badge: 'NETFLIX', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['netflix','subscription','streaming','viral'], platform: ['Multi'], featured: true },
  { id: 'key-spotify-3m', name: 'Spotify Premium - 3 Meses', description: '3 meses Spotify Premium. Sin anuncios, descarga offline, audio HD.', category: 'Suscripciones', subcategory: 'Spotify', price: 2.99, originalPrice: 29.99, image: '/products/spotify.png', badge: 'SPOTIFY', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['spotify','subscription','music','viral'], platform: ['Multi'], featured: true },
  { id: 'key-discord-nitro', name: 'Discord Nitro - 1 Mes', description: '1 mes Discord Nitro. Server boost, stickers, avatar animado, 500MB upload.', category: 'Suscripciones', subcategory: 'Discord', price: 1.99, originalPrice: 9.99, image: '/products/discord.svg', badge: 'DISCORD', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['discord','nitro','subscription','viral'], platform: ['Multi'], featured: false },
  { id: 'key-youtube-1m', name: 'YouTube Premium - 1 Mes', description: '1 mes YouTube Premium. Sin anuncios, YouTube Music, descarga offline.', category: 'Suscripciones', subcategory: 'YouTube', price: 2.99, originalPrice: 11.99, image: '/products/youtube.png', badge: 'YOUTUBE', delivery_type: 'KEY', license_type: 'AUTHORIZED_RESELLER', tags: ['youtube','premium','subscription','viral'], platform: ['Multi'], featured: false },

  // ─── JUEGOS OPEN SOURCE (FILE descargables) ───
  { id: 'game-supertuxkart', name: 'SuperTuxKart', description: 'Carreras de karts open source. Multijugador hasta 8. Personajes del software libre.', category: 'Juegos Gratis', subcategory: 'Racing', price: 1.99, originalPrice: 0, image: '/products/fortnite.svg', badge: 'OPEN SOURCE', delivery_type: 'FILE', license_type: 'OPEN_SOURCE', tags: ['game','racing','open-source','karts'], platform: ['PC','Mac','Linux'], featured: false },
  { id: 'game-minetest', name: 'Minetest', description: 'Sandbox voxel open source. Alternativa libre a Minecraft. Miles de mods.', category: 'Juegos Gratis', subcategory: 'Sandbox', price: 1.99, originalPrice: 0, image: '/products/minecraft.svg', badge: 'OPEN SOURCE', delivery_type: 'FILE', license_type: 'OPEN_SOURCE', tags: ['game','sandbox','voxel','minecraft-alternative'], platform: ['PC','Mac','Linux','Android'], featured: false },
  { id: 'game-openrct2', name: 'OpenRCT2 (RollerCoaster Tycoon 2)', description: 'Remasterización del clásico RCT2. Construye tu parque. Multijugador.', category: 'Juegos Gratis', subcategory: 'Simulation', price: 1.99, originalPrice: 19.99, image: '/products/ea-fc-25.svg', badge: 'OPEN SOURCE', delivery_type: 'FILE', license_type: 'OPEN_SOURCE', tags: ['game','simulation','tycoon','rollercoaster'], platform: ['PC','Mac','Linux'], featured: false },
  { id: 'game-gzdoom', name: 'GZDoom (Doom Engine)', description: 'Engine moderno para Doom. Mods, 3D, alta resolución. Miles de WADs.', category: 'Juegos Gratis', subcategory: 'FPS', price: 1.99, originalPrice: 0, image: '/products/counter-strike-2.svg', badge: 'OPEN SOURCE', delivery_type: 'FILE', license_type: 'OPEN_SOURCE', tags: ['game','fps','doom','engine'], platform: ['PC','Mac','Linux'], featured: false },
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
