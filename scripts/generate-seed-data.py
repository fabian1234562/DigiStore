#!/usr/bin/env python3
"""
Genera el seed-data.ts actualizado con URLs de imágenes REALES de Steam CDN.
Todas las 72 imágenes verificadas.
"""

import json

# Cargar resultados verificados
with open('/home/z/my-project/scripts/verified-game-images.json') as f:
    verified = json.load(f)
with open('/home/z/my-project/scripts/missing-resolved.json') as f:
    resolved = json.load(f)
with open('/home/z/my-project/scripts/final-remaining.json') as f:
    final5 = json.load(f)

# Combinar todas las imágenes
all_images = {}
all_images.update(verified['images'])
all_images.update(resolved['found'])
all_images.update(final5)

print(f"Total de imágenes: {len(all_images)} de 72")
assert len(all_images) == 72, f"Faltan imágenes: {72 - len(all_images)}"

# Generar el seed-data.ts
lines = []
lines.append('/**')
lines.append(' * BASE DE DATOS DE JUEGOS GRATIS VERIFICADOS')
lines.append(' * ')
lines.append(' * 72 juegos reales con imágenes extraídas de Steam CDN.')
lines.append(' * Cada imagen fue verificada (HTTP 200) contra cdn.akamai.steamstatic.com')
lines.append(' * Actualizado: Sept 2026')
lines.append(' */')
lines.append('')
lines.append("import { ScannedGame, GameSource } from './types';")
lines.append('')

# Función makeGame actualizada
lines.append('''function makeGame(opts: {
  id: string;
  title: string;
  source: GameSource;
  originalPrice: number;
  genre: string;
  description: string;
  imageUrl: string;
  steamUrl?: string;
  platform?: string[];
  tags?: string[];
  deliveryType?: ScannedGame['deliveryType'];
  rating?: number;
  claimInstructions?: string;
}): ScannedGame {
  const now = new Date();
  const source = opts.source;
  const platforms = opts.platform || ['Steam', 'Epic Games'];
  const deliveryType = opts.deliveryType || 'claim-link';
  
  return {
    id: opts.id,
    sourceId: `seed-${opts.id}`,
    source,
    title: opts.title,
    description: opts.description,
    imageUrl: opts.imageUrl,
    originalPrice: opts.originalPrice,
    sellPrice: opts.originalPrice >= 20 ? 4.99 : opts.originalPrice >= 10 ? 3.99 : opts.originalPrice >= 5 ? 2.99 : 1.99,
    deliveryType,
    platform: platforms,
    genre: [opts.genre],
    claimUrl: opts.steamUrl || source === 'epic-games' ? 'https://store.epicgames.com/en-US/free-games' :
              source === 'prime-gaming' ? 'https://gaming.amazon.com/home' :
              source === 'gog' ? 'https://www.gog.com/en/games?price=free' :
              source === 'humble' ? 'https://www.humblebundle.com/store/free' :
              source === 'indiegala' ? 'https://www.indiegala.com/giveaways' :
              source === 'fanatical' ? 'https://www.fanatical.com/en/free' :
              'https://store.steampowered.com/genre/Free%20to%20Play/',
    claimInstructions: opts.claimInstructions || `Reclama ${opts.title} gratis en ${source === 'epic-games' ? 'Epic Games Store' : source === 'prime-gaming' ? 'Prime Gaming con Amazon Prime' : source === 'gog' ? 'GOG.com' : source === 'humble' ? 'Humble Bundle' : source === 'steam' ? 'Steam' : source}. Te enviamos las instrucciones paso a paso tras la compra.`,
    stock: 0,
    unlimitedStock: true,
    status: 'active',
    startDate: now.toISOString(),
    scannedAt: now.toISOString(),
    lastChecked: now.toISOString(),
    tags: opts.tags || [opts.genre.toLowerCase(), 'free-game', '100-profit', source],
    rating: opts.rating || (opts.originalPrice >= 30 ? 5 : opts.originalPrice >= 15 ? 4 : 3),
  };
}''')
lines.append('')
lines.append('/** 72 juegos reales verificados con imágenes de Steam CDN */')
lines.append('export const SEED_GAMES: ScannedGame[] = [')

# Definición de los 72 juegos con sus datos
GAMES = [
    # id, title, source, price, genre, description, platform, delivery, rating, tags, steam_appid_for_url
    ('epic-1', 'Sifu', 'epic-games', 39.99, 'Action', 'Kung fu action game with unique aging mechanic. Each time you are defeated, you get older and stronger. Master multiple fighting styles in this BAFTA-nominated martial arts masterpiece.', ['PlayStation', 'PC'], 'claim-link', 5, ['action', 'kung-fu', 'fighting', 'martial-arts']),
    ('epic-2', 'Orcs Must Die! 3', 'epic-games', 29.99, 'Tower Defense', 'Third-person action tower defense. Slice, shoot, and pulverize armies of orcs in massive battles with new war machines and co-op mode for up to 2 players.', ['Steam', 'Epic Games'], 'claim-link', 4, ['tower-defense', 'action', 'co-op']),
    ('epic-3', 'Kill Knight', 'epic-games', 19.99, 'Action Roguelike', 'Intense top-down roguelike shooter set in the abyss. Fast-paced combat with demon-slaying action and deep progression systems. Brutal boss fights.', ['Steam', 'Epic Games'], 'claim-link', 4, ['roguelike', 'shooter', 'action', 'top-down']),
    ('epic-4', 'Hot Wheels Unleashed', 'epic-games', 49.99, 'Racing', 'High-octane racing with iconic Hot Wheels vehicles. Build spectacular tracks with the track editor and race against friends in this arcade racer.', ['PlayStation', 'Xbox', 'PC', 'Switch'], 'claim-link', 4, ['racing', 'arcade', 'multiplayer', 'vehicles']),
    ('epic-5', 'Ghostrunner 2', 'epic-games', 39.99, 'Action', 'Cyberpunk first-person action. Run, jump, and slash through a post-apocalyptic city in this hardcore parkour adventure sequel with new abilities.', ['Steam', 'Epic Games'], 'claim-link', 5, ['cyberpunk', 'parkour', 'fps', 'action']),
    ('epic-6', 'Control', 'epic-games', 39.99, 'Action Adventure', 'Supernatural action-adventure from Remedy Entertainment. Explore a mysterious government building with telekinetic abilities in this award-winning title.', ['PlayStation', 'Xbox', 'PC'], 'claim-link', 5, ['action-adventure', 'supernatural', 'remedy', 'telekinesis']),
    ('epic-7', 'Dredge', 'epic-games', 24.99, 'Adventure', 'Fishing adventure with Lovecraftian horror elements. Explore a mysterious archipelago, upgrade your boat, and uncover dark secrets beneath the waves.', ['Steam', 'Epic Games', 'Switch'], 'claim-link', 5, ['fishing', 'horror', 'lovecraftian', 'adventure', 'indie']),
    ('epic-8', 'Dark and Darker', 'epic-games', 39.99, 'Dungeon Crawler', 'Hardcore multiplayer dungeon crawler with PvPvE extraction gameplay. Battle monsters and other players in dark, dangerous dungeons for epic loot.', ['Steam'], 'claim-link', 4, ['dungeon-crawler', 'pvp', 'extraction', 'multiplayer', 'hardcore']),
    ('epic-9', 'Wizard of Legend', 'epic-games', 14.99, 'Roguelike', 'Fast-paced dungeon crawler with spell-based combat. Combine hundreds of spells and relics to create devastating combos in procedurally generated dungeons.', ['Steam', 'Switch'], 'claim-link', 4, ['roguelike', 'dungeon', 'spells', 'indie', 'pixel']),
    ('epic-10', 'TerraTech', 'epic-games', 24.99, 'Building Sandbox', 'Open-world sandbox building game. Design and construct vehicles from blocks to explore, gather resources, and fight in a vast procedurally generated world.', ['Steam'], 'claim-link', 3, ['sandbox', 'building', 'vehicles', 'open-world']),
    ('epic-11', 'Astrea: Six Sided Oracles', 'epic-games', 19.99, 'Roguelike', 'Unique dice-building roguelike RPG. Use mystical dice to cast spells, build powerful combinations, and explore a world corrupted by dark magic.', ['Steam'], 'claim-link', 4, ['roguelike', 'dice', 'rpg', 'strategy', 'indie']),
    ('epic-12', 'Vampire Survivors', 'epic-games', 4.99, 'Action Roguelike', 'Massively popular gothic horror casual game with over 100K reviews. Survive endless hordes of monsters using auto-attacking weapons and powerful upgrades.', ['Steam', 'Xbox', 'Mobile'], 'claim-link', 5, ['roguelike', 'survival', 'casual', 'gothic', 'bullet-hell']),
    ('epic-13', 'The Lord of the Rings: Return to Moria', 'epic-games', 39.99, 'Survival', 'Co-op survival crafting set in Middle-earth. Reclaim the dwarven homeland of Moria from orcs and ancient evils in this LOTR adventure.', ['Steam', 'PlayStation'], 'claim-link', 4, ['survival', 'crafting', 'co-op', 'lotr', 'fantasy']),
    ('epic-14', 'Brotato', 'epic-games', 4.99, 'Roguelike Shooter', 'Top-down roguelike arena shooter where you play as a potato armed with up to 6 weapons simultaneously. Fast-paced casual action with hundreds of items.', ['Steam'], 'claim-link', 5, ['roguelike', 'shooter', 'casual', 'arena', 'indie']),
    ('epic-15', 'Beholder', 'epic-games', 14.99, 'Simulation', 'Dystopian surveillance simulator set in a totalitarian state. Spy on tenants, report to the government, and make moral choices that affect entire families.', ['Steam', 'Mobile'], 'claim-link', 5, ['simulation', 'dystopian', 'surveillance', 'story-rich', 'indie']),
    ('epic-16', 'Castlevania Anniversary Collection', 'epic-games', 19.99, 'Classic Retro', 'Collection of classic Castlevania titles from the NES and Game Boy era. Includes Castlevania, Simon\'s Quest, Dracula\'s Curse, and more beloved classics.', ['Nintendo'], 'claim-link', 4, ['retro', 'classic', 'castlevania', 'platformer', 'nes']),
    ('epic-17', 'Snakebird Complete', 'epic-games', 14.99, 'Puzzle', 'Charming puzzle game where you guide snake-like birds through increasingly complex levels. Cute but tricky with over 50 puzzles to solve.', ['Steam', 'Switch'], 'claim-link', 4, ['puzzle', 'casual', 'cute', 'indie', 'logic']),
    ('epic-18', 'Deceive Inc', 'epic-games', 19.99, 'Multiplayer Stealth', 'Spy-themed multiplayer infiltration game. Disguise yourself as NPCs, complete objectives, and outsmart rival agents in competitive matches.', ['Steam', 'Epic Games'], 'claim-link', 3, ['multiplayer', 'stealth', 'spy', 'competitive', 'action']),
    ('epic-19', 'Ghostwire: Tokyo', 'epic-games', 59.99, 'Action Adventure', 'Supernatural action-adventure in haunted Tokyo from Tango Gameworks. Use ethereal weaving abilities to battle spirits and uncover the mystery behind the disappearance.', ['PlayStation', 'PC'], 'claim-link', 5, ['action-adventure', 'supernatural', 'japanese', 'open-world', 'ghosts']),
    ('epic-20', 'Witch It', 'epic-games', 14.99, 'Party', 'Hide-and-seek party game where witches disguise as everyday objects. Fun multiplayer prop-hunt with magical abilities and multiple game modes.', ['Steam'], 'claim-link', 4, ['party', 'multiplayer', 'hide-seek', 'casual', 'fun']),
    ('epic-21', 'Moving Out', 'epic-games', 24.99, 'Party Simulation', 'Co-op moving simulator with chaotic physics. Work together with friends to move furniture in absurd locations. Supports up to 4 players.', ['Steam', 'Switch', 'PlayStation', 'Xbox'], 'claim-link', 4, ['party', 'co-op', 'simulation', 'casual', 'physics']),
    ('epic-22', 'Kardboard Kings', 'epic-games', 14.99, 'Management', 'Card shop management simulator. Buy, sell, and trade trading cards while building the ultimate card shop in a charming pixel art world.', ['Steam'], 'claim-link', 4, ['management', 'simulation', 'cards', 'pixel-art', 'indie']),
    ('epic-23', 'Empyrion - Galactic Survival', 'epic-games', 24.99, 'Survival', 'Open-world space survival game. Build ships, explore planets, establish bases, and survive in a vast galaxy with friends in multiplayer.', ['Steam'], 'claim-link', 4, ['survival', 'space', 'building', 'open-world', 'multiplayer']),
    ('epic-24', 'Bear and Breakfast', 'epic-games', 19.99, 'Management', 'Cozy management game where you play as a bear running a bed and breakfast in the woods. Renovate rooms, attract guests, and uncover mysteries.', ['Steam', 'Switch'], 'claim-link', 4, ['management', 'cozy', 'simulation', 'adventure', 'indie']),
    ('epic-25', 'The Spirit and The Mouse', 'epic-games', 19.99, 'Adventure', 'Charming adventure where you play as a mouse exploring a French village. Solve puzzles, help townsfolk, and restore electric spirits in this cozy platformer.', ['Steam', 'Switch'], 'claim-link', 4, ['adventure', 'platformer', 'cozy', 'puzzle', 'indie']),
    ('epic-26', 'TOEM', 'epic-games', 14.99, 'Puzzle Adventure', 'Cozy photographic puzzle game. Help others by solving problems through photography in a beautiful hand-drawn world. Relaxing and wholesome.', ['Steam', 'Switch'], 'claim-link', 5, ['puzzle', 'adventure', 'photography', 'cozy', 'hand-drawn']),
    ('epic-27', 'The Callisto Protocol', 'epic-games', 59.99, 'Horror Survival', 'Next-gen survival horror from the creators of Dead Space. Fight for survival on a prison colony on Jupiter\'s moon with visceral combat and terrifying encounters.', ['PlayStation', 'Xbox', 'PC'], 'claim-link', 4, ['horror', 'survival', 'sci-fi', 'action', 'third-person']),
    ('epic-28', 'Gigantic: Rampage Edition', 'epic-games', 19.99, 'Hero Shooter', 'Colorful team-based hero shooter with massive boss battles. Choose from unique heroes with special abilities and work together to defeat powerful enemies.', ['Steam', 'Epic Games'], 'claim-link', 3, ['hero-shooter', 'multiplayer', 'team-based', 'action', 'fps']),
    ('epic-29', "Death's Gambit: Afterlife", 'epic-games', 19.99, 'Action RPG', 'Pixel art action RPG with punishing combat and a haunting soundtrack. Explore a cursed world, battle deadly bosses, and uncover secrets of immortality.', ['Steam', 'Switch'], 'claim-link', 4, ['action-rpg', 'pixel-art', 'souls-like', 'metroidvania', 'indie']),
    ('epic-30', 'Cygni: All Guns Blazing', 'epic-games', 24.99, 'Shoot em Up', 'Bullet hell shoot-em-up with stunning visuals and epic boss battles. Pilot a powerful ship through waves of alien enemies in this cinematic shooter.', ['Steam'], 'claim-link', 4, ['shmup', 'bullet-hell', 'action', 'arcade', 'sci-fi']),
    ('epic-31', 'F.I.S.T.: Forged In Shadow Torch', 'epic-games', 29.99, 'Metroidvania', 'Dieselpunk metroidvania with beautiful hand-drawn art. Explore a vast city as a rabbit warrior with a massive mechanical fist and unique combat skills.', ['PlayStation', 'PC', 'Switch'], 'claim-link', 4, ['metroidvania', 'action', 'dieselpunk', 'hand-drawn', 'indie']),
    ('epic-32', 'Arcade Paradise', 'epic-games', 19.99, 'Management', '90s arcade management sim with over 35 built-in retro games. Transform a rundown laundromat into the ultimate arcade in this nostalgia-filled management game.', ['Steam', 'Switch', 'Xbox'], 'claim-link', 4, ['management', 'retro', 'arcade', 'simulation', 'nostalgia']),
    ('epic-33', 'Sunless Skies: Sovereign Edition', 'epic-games', 24.99, 'Exploration RPG', 'Gothic Victorian RPG about exploring a vast dark universe. Captain a locomotive through space, manage your crew, and uncover cosmic horrors in literary fashion.', ['Steam'], 'claim-link', 5, ['rpg', 'exploration', 'gothic', 'narrative', 'indie']),
    ('epic-34', "Marvel's Midnight Suns", 'epic-games', 59.99, 'Tactical RPG', 'Marvel tactical RPG from the creators of XCOM. Team up with Iron Man, Wolverine, Spider-Man, and other Marvel heroes to fight Lilith and her demons.', ['PlayStation', 'Xbox', 'PC', 'Switch'], 'claim-link', 5, ['tactical-rpg', 'marvel', 'xcom', 'turn-based', 'superhero']),
    ('epic-35', 'Chivalry 2', 'epic-games', 39.99, 'Multiplayer Action', 'Massive medieval multiplayer warfare with up to 64 players. Storm castles, fight in brutal melee combat, and experience epic large-scale battles.', ['Steam', 'PlayStation', 'Xbox'], 'claim-link', 4, ['multiplayer', 'medieval', 'action', 'pvp', 'first-person']),
    ('epic-36', 'Farming Simulator 22', 'epic-games', 39.99, 'Simulation', 'The ultimate farming simulation with realistic machinery from real brands. Manage your farm with seasonal cycles, animal husbandry, and multiplayer.', ['Steam', 'PlayStation', 'Xbox'], 'claim-link', 4, ['simulation', 'farming', 'realistic', 'multiplayer', 'vehicles']),
    ('epic-37', 'Dragon Age: Inquisition GOTY', 'epic-games', 59.99, 'RPG', 'Award-winning fantasy RPG from BioWare. Lead the Inquisition to save Thedas with deep combat, meaningful choices, and rich companion stories. GOTY edition includes all DLC.', ['PlayStation', 'Xbox', 'PC'], 'claim-link', 5, ['rpg', 'fantasy', 'bioware', 'story-rich', 'open-world']),
    ('epic-38', 'Ghostrunner', 'epic-games', 29.99, 'Action Parkour', 'One-hit-kill cyberpunk parkour action game. Run along walls, dash through enemies, and slice through a dystopian city in first-person. Fast and deadly.', ['PlayStation', 'Xbox', 'PC', 'Switch'], 'claim-link', 5, ['cyberpunk', 'parkour', 'fps', 'action', 'dystopian']),
    ('epic-39', "The Outer Worlds", 'epic-games', 59.99, 'RPG', 'Sci-fi RPG from Obsidian Entertainment. Navigate a corporate-controlled colony system in this humorous first-person RPG with deep player choice and companion system.', ['PlayStation', 'Xbox', 'PC', 'Switch'], 'claim-link', 5, ['rpg', 'sci-fi', 'obsidian', 'first-person', 'story-rich']),
    ('epic-40', 'Deus Ex: Mankind Divided', 'epic-games', 39.99, 'Action RPG', 'Cyberpunk action-RPG where every choice matters. Augment yourself with futuristic tech in a divided world. Multiple approaches to every mission.', ['PlayStation', 'Xbox', 'PC'], 'claim-link', 5, ['action-rpg', 'cyberpunk', 'stealth', 'fps', 'story-rich']),
    ('epic-41', "Marvel's Guardians of the Galaxy", 'epic-games', 59.99, 'Action Adventure', 'Star-Lord and the Guardians in an original cosmic adventure with a classic 80s rock soundtrack. Team combat, humor, and heart in one package.', ['PlayStation', 'Xbox', 'PC', 'Switch'], 'claim-link', 5, ['action-adventure', 'marvel', 'guardians', 'story-rich', 'third-person']),
    ('epic-42', 'A Plague Tale: Innocence', 'epic-games', 39.99, 'Adventure', 'Emotional narrative adventure set in medieval France. Guide orphan siblings Amicia and Hugo through horrors of war and the Inquisition. Stunning visuals.', ['PlayStation', 'Xbox', 'PC', 'Switch'], 'claim-link', 5, ['adventure', 'narrative', 'stealth', 'story-rich', 'puzzle']),
    ('epic-43', 'Doki Doki Literature Club Plus!', 'epic-games', 14.99, 'Visual Novel', 'Critically acclaimed psychological horror visual novel that breaks the fourth wall. What starts as a cute dating sim becomes deeply disturbing and unforgettable.', ['Steam', 'PlayStation', 'Xbox', 'Switch'], 'claim-link', 5, ['visual-novel', 'horror', 'psychological', 'story-rich', 'indie']),
    ('epic-44', 'Super Meat Boy Forever', 'epic-games', 14.99, 'Platformer', 'Auto-running platformer with brutal difficulty. Guide Meat Boy through hundreds of hand-crafted levels with tight controls and instant respawns.', ['Steam', 'Switch'], 'claim-link', 4, ['platformer', 'hardcore', 'indie', 'pixel-art', 'action']),
    ('epic-45', 'Total War: Three Kingdoms', 'epic-games', 59.99, 'Strategy', 'Epic historical strategy set in ancient China during the fall of the Han Dynasty. Build your dynasty, forge alliances, and conquer in massive real-time battles.', ['Steam'], 'claim-link', 5, ['strategy', 'total-war', 'historical', 'real-time', 'grand-strategy']),
    ('epic-46', 'Machinarium', 'epic-games', 9.99, 'Puzzle Adventure', 'Award-winning point-and-click adventure set in a beautiful mechanical world. Help a small robot save his girlfriend by solving clever puzzles without any dialogue.', ['Steam', 'Mobile', 'Switch'], 'claim-link', 5, ['puzzle', 'point-click', 'adventure', 'indie', 'robot']),
    ('epic-47', 'Strange Horticulture', 'epic-games', 14.99, 'Puzzle Simulation', 'Botanical mystery puzzle game. Run a plant shop, identify mysterious plants, and use your botanical knowledge to solve Victorian-era mysteries in a dark tale.', ['Steam', 'Switch'], 'claim-link', 5, ['puzzle', 'simulation', 'botanical', 'mystery', 'indie']),
    ('epic-48', 'Make Way', 'epic-games', 14.99, 'Racing Party', 'Chaotic multiplayer racing with real-time track-building mechanics. Create insane tracks on the fly and race up to 4 friends in this party racer.', ['Steam'], 'claim-link', 3, ['racing', 'party', 'multiplayer', 'chaotic', 'indie']),
    ('epic-49', 'Bloons TD 6', 'epic-games', 13.99, 'Tower Defense', 'The ultimate tower defense game with hundreds of upgrades. Pop waves of colorful bloons with powerful monkey towers, heroes, and deep upgrade paths.', ['Steam', 'Mobile'], 'claim-link', 5, ['tower-defense', 'strategy', 'casual', 'co-op', 'colorful']),
    ('epic-50', 'Styx: Master of Shadows', 'epic-games', 29.99, 'Stealth', 'Infiltrate a massive tower as a cunning goblin thief. Use stealth, traps, acrobatic skills, and your amber powers in this deep stealth experience.', ['Steam', 'PlayStation', 'Xbox'], 'claim-link', 4, ['stealth', 'action', 'fantasy', 'third-person', 'infiltration']),
    ('epic-51', 'Styx: Shards of Darkness', 'epic-games', 29.99, 'Stealth Action', 'The goblin assassin returns in an even bigger adventure with open environments, improved stealth mechanics, and co-op multiplayer. Bigger and bolder.', ['Steam', 'PlayStation', 'Xbox'], 'claim-link', 4, ['stealth', 'action', 'co-op', 'fantasy', 'third-person']),
    # PRIME GAMING (9)
    ('prime-1', 'Saints Row: The Third Remastered', 'prime-gaming', 39.99, 'Open World Action', 'Iconic open-world action game fully remastered with enhanced graphics. Cause mayhem in Steelport with all DLC included in this definitive version.', ['Epic Games', 'Amazon'], 'claim-link', 4, ['open-world', 'action', 'remastered', 'sandbox', 'co-op']),
    ('prime-2', 'Mafia II: Definitive Edition', 'prime-gaming', 29.99, 'Action Adventure', 'Live the life of Vito Scaletta, a mobster in Empire Bay. This beautifully remastered crime drama features all DLC and enhanced visuals for a cinematic experience.', ['GOG', 'Amazon', 'Steam'], 'claim-link', 5, ['action-adventure', 'crime', 'story-rich', 'open-world', 'mafia']),
    ('prime-3', 'Crime Boss: Rockay City', 'prime-gaming', 39.99, 'FPS Action', 'Organized crime FPS with an all-star cast including Michael Madsen and Danny Trejo. Build your criminal empire in a 90s Miami-style city with heist missions.', ['Epic Games', 'Amazon'], 'claim-link', 3, ['fps', 'action', 'crime', 'heist', 'multiplayer']),
    ('prime-4', 'Saints Row IV: Re-Elected', 'prime-gaming', 29.99, 'Open World Action', 'Outrageous open-world where you are the President with superpowers. Fight an alien invasion in this over-the-top sandbox with all DLC included.', ['Epic Games', 'Amazon'], 'claim-link', 4, ['open-world', 'action', 'sandbox', 'superpowers', 'comedy']),
    ('prime-5', 'Steelrising', 'prime-gaming', 49.99, 'Action RPG', 'Souls-like RPG in an alternate French Revolution. Fight mechanical automatons as Aegis, a robotic bodyguard, in beautiful Paris with challenging combat.', ['Steam', 'Amazon'], 'claim-link', 4, ['action-rpg', 'souls-like', 'french-revolution', 'robots', 'challenging']),
    ('prime-6', 'XCOM: Chimera Squad', 'prime-gaming', 19.99, 'Tactical Strategy', 'Tactical strategy spin-off set after XCOM 2. Lead a squad of humans and aliens to protect City 31 from emerging threats in this accessible tactics game.', ['Epic Games', 'Amazon'], 'claim-link', 4, ['tactical', 'strategy', 'turn-based', 'xcom', 'sci-fi']),
    ('prime-7', 'In Sound Mind', 'prime-gaming', 29.99, 'Psychological Horror', 'First-person psychological horror with unique mechanics. Explore twisted memories of patients while being hunted by supernatural entities in eerie environments.', ['Steam', 'Amazon'], 'claim-link', 4, ['horror', 'psychological', 'fps', 'mystery', 'story-rich']),
    ('prime-8', 'Deus Ex: Game of the Year Edition', 'prime-gaming', 9.99, 'Action RPG', 'The legendary immersive sim that defined a genre. Groundbreaking blend of RPG, stealth, and shooter mechanics. The GOTY edition includes all content.', ['GOG', 'Amazon'], 'claim-link', 5, ['action-rpg', 'immersive-sim', 'classic', 'stealth', 'fps']),
    ('prime-9', 'SteamWorld Quest: Hand of Gilgamech', 'prime-gaming', 24.99, 'Card RPG', 'Hand-crafted RPG with card-based combat and beautiful visuals. Lead a party of heroes through a colorful world, building powerful card combos for battle.', ['Steam', 'Nintendo Switch', 'Amazon'], 'claim-link', 4, ['rpg', 'card-game', 'turn-based', 'indie', 'steamworld']),
    # GOG (4)
    ('gog-1', 'FTL: Faster Than Light', 'gog', 9.99, 'Strategy Roguelike', 'Command your spaceship in this award-winning roguelike strategy. Manage your crew, upgrade systems, fight pirates, and make tough decisions to survive.', ['GOG', 'Steam'], 'drm-free', 5, ['strategy', 'roguelike', 'spaceship', 'indie', 'pixel']),
    ('gog-2', 'Jotun: Valhalla Edition', 'gog', 14.99, 'Action Exploration', 'Hand-drawn action game in Norse mythology. Fight massive boss enemies as Thora, a Viking warrior proving herself worthy to enter Valhalla.', ['GOG', 'Steam'], 'drm-free', 4, ['action', 'norse', 'boss-fight', 'hand-drawn', 'indie']),
    ('gog-3', 'The Last Door: Season 1', 'gog', 0.00, 'Point and Click Horror', 'Pixel art horror adventure with an unsettling atmosphere. Uncover terrifying mysteries in Victorian England through eerie environments and a haunting story.', ['GOG'], 'drm-free', 4, ['horror', 'point-click', 'pixel-art', 'mystery', 'indie']),
    ('gog-4', 'Sanctuary RPG', 'gog', 0.00, 'RPG', 'ASCII-style retro RPG with surprisingly deep mechanics. Explore dungeons, complete quests, build your character, and uncover a rich story in text-based graphics.', ['GOG'], 'drm-free', 3, ['rpg', 'retro', 'ascii', 'dungeon', 'indie']),
    # HUMBLE BUNDLE (2)
    ('humble-1', 'Dishonored: Death of the Outsider', 'humble', 29.99, 'Stealth Action', 'Standalone Dishonored expansion. Play as Billie Lurk in a personal story of revenge against the Outsider. Same amazing gameplay with new supernatural abilities.', ['Steam'], 'claim-link', 5, ['stealth', 'action', 'supernatural', 'first-person', 'story-rich']),
    ('humble-2', 'Orwell: Keeping an Eye On You', 'humble', 9.99, 'Simulation', 'Surveillance thriller where you monitor online communications of citizens. Question everything you read and decide who is a threat in this thought-provoking indie.', ['Steam'], 'claim-link', 4, ['simulation', 'surveillance', 'thriller', 'story-rich', 'indie']),
    # INDIEGALA (1)
    ('indie-1', '100% Orange Juice', 'indiegala', 9.99, 'Board Game', 'Digital board game with colorful anime characters from multiple games. Roll dice, collect cards, battle opponents in this fun multiplayer party game.', ['Steam'], 'claim-link', 4, ['board-game', 'multiplayer', 'anime', 'party', 'casual']),
    # FANATICAL (1)
    ('fanatical-1', 'Eternal Threads', 'fanatical', 19.99, 'Puzzle Narrative', 'Time-manipulation puzzle game about altering fate. Rewind and change the decisions of six characters in a house fire to prevent the tragedy.', ['Steam'], 'claim-link', 4, ['puzzle', 'narrative', 'time-travel', 'story-rich', 'indie']),
    # STEAM F2P (4)
    ('steam-1', 'Destiny 2', 'steam', 0.00, 'FPS MMO', 'Bungie\'s shared-world FPS with satisfying gunplay and epic raids. Explore planets, collect legendary loot, and play with friends in this massive online shooter.', ['Steam'], 'account', 4, ['fps', 'mmo', 'looter-shooter', 'sci-fi', 'pve']),
    ('steam-2', 'Apex Legends', 'steam', 0.00, 'Battle Royale FPS', 'Fast-paced battle royale from Respawn Entertainment. Master unique legend abilities, team up in squads, and fight for victory in this polished FPS.', ['Steam', 'EA App'], 'account', 5, ['fps', 'battle-royale', 'hero-shooter', 'multiplayer', 'competitive']),
    ('steam-3', 'Warframe', 'steam', 0.00, 'Action RPG', 'Co-op sci-fi action with ninja-like Warframe suits. Slice through thousands of enemies with incredible weapons, customize your loadout, explore the solar system.', ['Steam'], 'account', 5, ['action', 'rpg', 'co-op', 'sci-fi', 'third-person']),
    ('steam-4', 'Path of Exile', 'steam', 0.00, 'Action RPG', 'Deep action RPG with massive passive skill trees and hundreds of skill gems. Explore a dark fantasy world, customize your build, and conquer endgame content.', ['Steam'], 'account', 5, ['action-rpg', 'hack-slash', 'dark-fantasy', 'loot', 'builds']),
]

# Mapa de app IDs para URLs de Steam
STEAM_APP_IDS = {
    'epic-1': 1426210, 'epic-2': 1203220, 'epic-3': 2685400, 'epic-4': 1449230,
    'epic-5': 1716740, 'epic-6': 870780, 'epic-7': 1147560, 'epic-8': 1966720,
    'epic-9': 268500, 'epic-10': 285920, 'epic-11': 1910560, 'epic-12': 1782210,
    'epic-13': 1176510, 'epic-14': 1942280, 'epic-15': 475150, 'epic-16': 955940,
    'epic-17': 1139380, 'epic-18': 1399780, 'epic-19': 1364780, 'epic-20': 582660,
    'epic-21': 739080, 'epic-22': 1688780, 'epic-23': 383120, 'epic-24': 1066370,
    'epic-25': 1462500, 'epic-26': 1404620, 'epic-27': 1504530, 'epic-28': 884830,
    'epic-29': 345460, 'epic-30': 2080670, 'epic-31': 1149360, 'epic-32': 1121820,
    'epic-33': 908860, 'epic-34': 1408650, 'epic-35': 736260, 'epic-36': 1248130,
    'epic-37': 1222690, 'epic-38': 1135690, 'epic-39': 578650, 'epic-40': 337000,
    'epic-41': 1249820, 'epic-42': 752590, 'epic-43': 698780, 'epic-44': 812970,
    'epic-45': 779340, 'epic-46': 40720, 'epic-47': 1575580, 'epic-48': 1528530,
    'epic-49': 960890, 'epic-50': 242640, 'epic-51': 671620,
    'prime-1': 2108330, 'prime-2': 50130, 'prime-3': 1436700, 'prime-4': 2066170,
    'prime-5': 1123220, 'prime-6': 223090, 'prime-7': 860840, 'prime-8': 238010,
    'prime-9': 819740,
    'gog-1': 212680, 'gog-2': 323440, 'gog-3': 252750, 'gog-4': 284100,
    'humble-1': 403640, 'humble-2': 501310,
    'indie-1': 282800, 'fanatical-1': 1005890,
    'steam-1': 1085660, 'steam-2': 1172470, 'steam-3': 230410, 'steam-4': 238960,
}

def escape_ts(s):
    """Escape string for TypeScript"""
    return s.replace('\\', '\\\\').replace('"', '\\"').replace("'", "\\'")

# Generar cada juego
for i, (gid, title, source, price, genre, desc, platforms, delivery, rating, tags) in enumerate(GAMES):
    app_id = STEAM_APP_IDS.get(gid, 0)
    image_url = all_images.get(gid, '/products/gen/gaming-cat.png')
    steam_url = f'https://store.steampowered.com/app/{app_id}' if app_id else ''
    
    tags_str = ', '.join(f"'{t}'" for t in tags)
    platforms_str = ', '.join(f"'{p}'" for p in platforms)
    
    comma = ',' if i < len(GAMES) - 1 else ''
    
    lines.append(f'  makeGame({{ id: \'{gid}\', title: \'{escape_ts(title)}\', source: \'{source}\', originalPrice: {price}, genre: \'{genre}\',')
    lines.append(f'    description: \'{escape_ts(desc)}\',')
    lines.append(f'    imageUrl: \'{image_url}\',')
    if steam_url:
        lines.append(f'    steamUrl: \'{steam_url}\',')
    lines.append(f'    platform: [{platforms_str}], deliveryType: \'{delivery}\', rating: {rating}, tags: [{tags_str}] }}){comma}')
    lines.append('')

lines.append('];')
lines.append('')

# SEED_STATS
lines.append('/** Estadisticas de la base de datos */')
lines.append('export const SEED_STATS = {')
lines.append('  totalGames: SEED_GAMES.length,')
lines.append('  epicGames: SEED_GAMES.filter(g => g.source === \'epic-games\').length,')
lines.append('  primeGaming: SEED_GAMES.filter(g => g.source === \'prime-gaming\').length,')
lines.append('  gog: SEED_GAMES.filter(g => g.source === \'gog\').length,')
lines.append('  humble: SEED_GAMES.filter(g => g.source === \'humble\').length,')
lines.append('  indiegala: SEED_GAMES.filter(g => g.source === \'indiegala\').length,')
lines.append('  fanatical: SEED_GAMES.filter(g => g.source === \'fanatical\').length,')
lines.append('  steam: SEED_GAMES.filter(g => g.source === \'steam\').length,')
lines.append('  estimatedTotalValue: SEED_GAMES.reduce((s, g) => s + g.originalPrice, 0),')
lines.append('  estimatedProfit: SEED_GAMES.reduce((s, g) => s + g.sellPrice, 0),')
lines.append('  lastUpdated: new Date().toISOString(),')
lines.append("  verified: true,")
lines.append("  source: 'Steam CDN verified images - All 72 games with real product art (Sep 2026)',")
lines.append('};')

content = '\n'.join(lines)

with open('/home/z/my-project/src/lib/game-scanner/seed-data.ts', 'w') as f:
    f.write(content)

print(f'Generated seed-data.ts with {len(GAMES)} games')
print(f'All images from: cdn.akamai.steamstatic.com')
print('Done!')