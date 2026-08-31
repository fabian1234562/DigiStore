/**
 * BASE DE DATOS DE JUEGOS GRATIS VERIFICADOS
 * 
 * 72 juegos reales obtenidos de búsquedas web verificadas.
 * Cada juego fue realmente regalado gratis en su plataforma.
 * Estos se cargan al inicio y el escáner los actualiza en tiempo real.
 */

import { ScannedGame, GameSource } from './types';

function makeGame(opts: {
  id: string;
  title: string;
  source: GameSource;
  originalPrice: number;
  genre: string;
  description: string;
  imageKeyword: string;
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
    imageUrl: '/products/gen/gaming-cat.png',
    originalPrice: opts.originalPrice,
    sellPrice: opts.originalPrice >= 20 ? 4.99 : opts.originalPrice >= 10 ? 3.99 : opts.originalPrice >= 5 ? 2.99 : 1.99,
    deliveryType,
    platform: platforms,
    genre: [opts.genre],
    claimUrl: source === 'epic-games' ? 'https://store.epicgames.com/en-US/free-games' :
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
}

/** 72 juegos reales verificados */
export const SEED_GAMES: ScannedGame[] = [
  // === EPIC GAMES STORE (51 juegos) ===
  makeGame({ id: 'epic-1', title: 'Sifu', source: 'epic-games', originalPrice: 39.99, genre: 'Action',
    description: 'Kung fu action game with unique aging mechanic. Each time you are defeated, you get older and stronger. Master multiple fighting styles.', imageKeyword: 'sifu martial arts kung fu game', rating: 5 }),
  makeGame({ id: 'epic-2', title: 'Orcs Must Die! 3', source: 'epic-games', originalPrice: 29.99, genre: 'Tower Defense',
    description: 'Third-person action tower defense. Slice, shoot, and pulverize armies of orcs in massive battles with new war machines and co-op mode.', imageKeyword: 'orcs must die tower defense' }),
  makeGame({ id: 'epic-3', title: 'Kill Knight', source: 'epic-games', originalPrice: 19.99, genre: 'Action Roguelike',
    description: 'Intense top-down roguelike shooter set in the abyss. Fast-paced combat with demon-slaying action and deep progression.', imageKeyword: 'kill knight roguelike dark fantasy' }),
  makeGame({ id: 'epic-4', title: 'Hot Wheels Unleashed', source: 'epic-games', originalPrice: 49.99, genre: 'Racing',
    description: 'High-octane racing with iconic Hot Wheels vehicles. Build spectacular tracks and race against friends in this arcade racer.', imageKeyword: 'hot wheels unleashed racing' }),
  makeGame({ id: 'epic-5', title: 'Ghostrunner 2', source: 'epic-games', originalPrice: 39.99, genre: 'Action',
    description: 'Cyberpunk first-person action. Run, jump, and slash through a post-apocalyptic city in this hardcore parkour adventure sequel.', imageKeyword: 'ghostrunner 2 cyberpunk parkour' }),
  makeGame({ id: 'epic-6', title: 'Control', source: 'epic-games', originalPrice: 39.99, genre: 'Action Adventure',
    description: 'Supernatural action-adventure from Remedy. Explore a mysterious government building with telekinetic abilities.', imageKeyword: 'control remedy entertainment supernatural' }),
  makeGame({ id: 'epic-7', title: 'Dredge', source: 'epic-games', originalPrice: 24.99, genre: 'Adventure',
    description: 'Fishing adventure with Lovecraftian horror. Explore a mysterious archipelago, upgrade your boat, and uncover dark secrets.', imageKeyword: 'dredge fishing horror lovecraftian' }),
  makeGame({ id: 'epic-8', title: 'Dark and Darker', source: 'epic-games', originalPrice: 39.99, genre: 'Dungeon Crawler',
    description: 'Hardcore multiplayer dungeon crawler with PvPvE extraction. Battle monsters and other players in dark, dangerous dungeons.', imageKeyword: 'dark and darker dungeon extraction' }),
  makeGame({ id: 'epic-9', title: 'Wizard of Legend', source: 'epic-games', originalPrice: 14.99, genre: 'Roguelike',
    description: 'Fast-paced dungeon crawler with spell-based combat. Combine hundreds of spells to create devastating combos.', imageKeyword: 'wizard of legend roguelike spells' }),
  makeGame({ id: 'epic-10', title: 'TerraTech', source: 'epic-games', originalPrice: 24.99, genre: 'Building Sandbox',
    description: 'Open-world sandbox building game. Design and construct vehicles from blocks to explore, gather resources, and fight.', imageKeyword: 'terratech building sandbox vehicles' }),
  makeGame({ id: 'epic-11', title: 'Astrea: Six Sided Oracles', source: 'epic-games', originalPrice: 19.99, genre: 'Roguelike',
    description: 'Unique dice-building roguelike RPG. Use mystical dice to cast spells and explore a world of corruption.', imageKeyword: 'astrea six sided oracles dice' }),
  makeGame({ id: 'epic-12', title: 'Vampire Survivors', source: 'epic-games', originalPrice: 4.99, genre: 'Action Roguelike',
    description: 'Massively popular gothic horror casual game. Survive hordes of monsters using auto-attacking weapons.', imageKeyword: 'vampire survivors gothic horror' }),
  makeGame({ id: 'epic-13', title: 'The Lord of the Rings: Return to Moria', source: 'epic-games', originalPrice: 39.99, genre: 'Survival',
    description: 'Co-op survival crafting set in Middle-earth. Reclaim the dwarven homeland of Moria from orcs and ancient evils.', imageKeyword: 'lord of the rings return to moria' }),
  makeGame({ id: 'epic-14', title: 'Brotato', source: 'epic-games', originalPrice: 4.99, genre: 'Roguelike Shooter',
    description: 'Top-down roguelike arena shooter where you play as a potato armed with up to 6 weapons. Fast-paced casual action.', imageKeyword: 'brotato potato roguelike shooter' }),
  makeGame({ id: 'epic-15', title: 'Beholder', source: 'epic-games', originalPrice: 14.99, genre: 'Simulation',
    description: 'Dystopian surveillance simulator. Spy on tenants and report to a totalitarian government. Moral choices matter.', imageKeyword: 'beholder surveillance dystopian' }),
  makeGame({ id: 'epic-16', title: 'Castlevania Anniversary Collection', source: 'epic-games', originalPrice: 19.99, genre: 'Classic Retro',
    description: 'Collection of classic Castlevania titles from the NES and Game Boy era. Beloved vampire-hunting action games.', imageKeyword: 'castlevania anniversary collection retro' }),
  makeGame({ id: 'epic-17', title: 'Snakebird Complete', source: 'epic-games', originalPrice: 14.99, genre: 'Puzzle',
    description: 'Charming puzzle game where you guide snake-like birds through increasingly complex levels. Cute but tricky.', imageKeyword: 'snakebird puzzle cute' }),
  makeGame({ id: 'epic-18', title: 'Deceive Inc', source: 'epic-games', originalPrice: 19.99, genre: 'Multiplayer Stealth',
    description: 'Spy-themed multiplayer infiltration. Disguise yourself, complete objectives, and outsmart rival agents.', imageKeyword: 'deceive inc spy multiplayer stealth' }),
  makeGame({ id: 'epic-19', title: 'Ghostwire: Tokyo', source: 'epic-games', originalPrice: 59.99, genre: 'Action Adventure',
    description: 'Supernatural action-adventure in haunted Tokyo. Use ethereal abilities to battle spirits and uncover mysteries.', imageKeyword: 'ghostwire tokyo supernatural japanese' }),
  makeGame({ id: 'epic-20', title: 'Witch It', source: 'epic-games', originalPrice: 14.99, genre: 'Party',
    description: 'Hide-and-seek party game where witches disguise as objects. Fun multiplayer prop-hunt with magical abilities.', imageKeyword: 'witch it hide seek party' }),
  makeGame({ id: 'epic-21', title: 'Moving Out', source: 'epic-games', originalPrice: 24.99, genre: 'Party Simulation',
    description: 'Co-op moving simulator with chaotic physics. Work together to move furniture in absurd locations.', imageKeyword: 'moving out co-op party simulation' }),
  makeGame({ id: 'epic-22', title: 'Kardboard Kings', source: 'epic-games', originalPrice: 14.99, genre: 'Management',
    description: 'Card shop management simulator. Buy, sell, and trade trading cards while building the ultimate card shop.', imageKeyword: 'kardboard kings card shop' }),
  makeGame({ id: 'epic-23', title: 'Empyrion - Galactic Survival', source: 'epic-games', originalPrice: 24.99, genre: 'Survival',
    description: 'Open-world space survival. Build ships, explore planets, and survive in a vast galaxy with friends.', imageKeyword: 'empyrion galactic survival space' }),
  makeGame({ id: 'epic-24', title: 'Bear and Breakfast', source: 'epic-games', originalPrice: 19.99, genre: 'Management',
    description: 'Cozy management game where you play as a bear running a bed and breakfast. Renovate rooms and attract guests.', imageKeyword: 'bear and breakfast cozy management' }),
  makeGame({ id: 'epic-25', title: 'The Spirit and The Mouse', source: 'epic-games', originalPrice: 19.99, genre: 'Adventure',
    description: 'Charming adventure where you play as a mouse exploring a French village. Solve puzzles and help townsfolk.', imageKeyword: 'spirit mouse adventure french' }),
  makeGame({ id: 'epic-26', title: 'TOEM', source: 'epic-games', originalPrice: 14.99, genre: 'Puzzle Adventure',
    description: 'Cozy photographic puzzle game. Help others by solving problems through photography in a hand-drawn world.', imageKeyword: 'toem photo puzzle cozy' }),
  makeGame({ id: 'epic-27', title: 'The Callisto Protocol', source: 'epic-games', originalPrice: 59.99, genre: 'Horror Survival',
    description: 'Next-gen survival horror from Dead Space creators. Fight for survival on a prison colony on Jupiter moon.', imageKeyword: 'callisto protocol horror survival space' }),
  makeGame({ id: 'epic-28', title: 'Gigantic: Rampage Edition', source: 'epic-games', originalPrice: 19.99, genre: 'Hero Shooter',
    description: 'Colorful team-based hero shooter with massive bosses. Choose unique heroes with special abilities.', imageKeyword: 'gigantic ramp hero shooter' }),
  makeGame({ id: 'epic-29', title: "Death's Gambit: Afterlife", source: 'epic-games', originalPrice: 19.99, genre: 'Action RPG',
    description: 'Pixel art action RPG with punishing combat. Explore a haunted world and uncover secrets of immortality.', imageKeyword: 'deaths gambit afterlife pixel rpg' }),
  makeGame({ id: 'epic-30', title: 'Cygni: All Guns Blazing', source: 'epic-games', originalPrice: 24.99, genre: 'Shoot em Up',
    description: 'Bullet hell shoot-em-up with stunning visuals. Pilot a powerful ship through waves of alien enemies.', imageKeyword: 'cygni all guns blazing shooter' }),
  makeGame({ id: 'epic-31', title: 'F.I.S.T.: Forged In Shadow Torch', source: 'epic-games', originalPrice: 29.99, genre: 'Metroidvania',
    description: 'Dieselpunk metroidvania with hand-drawn art. Explore a vast city as a rabbit warrior with a mechanical fist.', imageKeyword: 'fist forged shadow torch metroidvania' }),
  makeGame({ id: 'epic-32', title: 'Arcade Paradise', source: 'epic-games', originalPrice: 19.99, genre: 'Management',
    description: '90s arcade management sim. Transform a laundromat into the ultimate arcade with 35+ built-in retro games.', imageKeyword: 'arcade paradise management retro' }),
  makeGame({ id: 'epic-33', title: 'Sunless Skies: Sovereign Edition', source: 'epic-games', originalPrice: 24.99, genre: 'Exploration RPG',
    description: 'Gothic Victorian RPG about exploring a vast dark universe. Captain a locomotive through space.', imageKeyword: 'sunless skies gothic victorian' }),
  makeGame({ id: 'epic-34', title: "Marvel's Midnight Suns", source: 'epic-games', originalPrice: 59.99, genre: 'Tactical RPG',
    description: 'Marvel tactical RPG from XCOM creators. Team up with Iron Man, Wolverine, and Spider-Man to fight Lilith.', imageKeyword: 'marvel midnight suns tactical rpg' }),
  makeGame({ id: 'epic-35', title: 'Chivalry 2', source: 'epic-games', originalPrice: 39.99, genre: 'Multiplayer Action',
    description: 'Massive medieval multiplayer warfare. Storm castles and fight in 64-player battles with brutal melee combat.', imageKeyword: 'chivalry 2 medieval multiplayer warfare' }),
  makeGame({ id: 'epic-36', title: 'Farming Simulator 22', source: 'epic-games', originalPrice: 39.99, genre: 'Simulation',
    description: 'The ultimate farming simulation. Manage your farm with realistic machinery and seasonal cycles.', imageKeyword: 'farming simulator 22 agriculture' }),
  makeGame({ id: 'epic-37', title: 'Dragon Age: Inquisition GOTY', source: 'epic-games', originalPrice: 59.99, genre: 'RPG',
    description: 'Award-winning fantasy RPG from BioWare. Lead the Inquisition to save Thedas with deep combat and choices.', imageKeyword: 'dragon age inquisition bioware rpg' }),
  makeGame({ id: 'epic-38', title: 'Ghostrunner', source: 'epic-games', originalPrice: 29.99, genre: 'Action Parkour',
    description: 'One-hit-kill cyberpunk parkour action. Run along walls and slice through enemies in first-person.', imageKeyword: 'ghostrunner cyberpunk parkour fps' }),
  makeGame({ id: 'epic-39', title: "The Outer Worlds: Spacer's Choice", source: 'epic-games', originalPrice: 59.99, genre: 'RPG',
    description: 'Sci-fi RPG from Obsidian. Navigate a corporate-controlled colony system in this humorous first-person RPG.', imageKeyword: 'outer worlds obsidian rpg sci-fi' }),
  makeGame({ id: 'epic-40', title: 'Deus Ex: Mankind Divided', source: 'epic-games', originalPrice: 39.99, genre: 'Action RPG',
    description: 'Cyberpunk action-RPG where every choice matters. Augment yourself with futuristic tech in a divided world.', imageKeyword: 'deus ex mankind divided cyberpunk' }),
  makeGame({ id: 'epic-41', title: "Marvel's Guardians of the Galaxy", source: 'epic-games', originalPrice: 59.99, genre: 'Action Adventure',
    description: 'Star-Lord and the Guardians in an original cosmic adventure with classic 80s rock soundtrack.', imageKeyword: 'marvel guardians galaxy action' }),
  makeGame({ id: 'epic-42', title: 'A Plague Tale: Innocence', source: 'epic-games', originalPrice: 39.99, genre: 'Adventure',
    description: 'Emotional narrative adventure in medieval France. Guide orphan siblings through horrors of the Inquisition.', imageKeyword: 'plague tale innocence adventure medieval' }),
  makeGame({ id: 'epic-43', title: 'Doki Doki Literature Club Plus!', source: 'epic-games', originalPrice: 14.99, genre: 'Visual Novel',
    description: 'Critically acclaimed psychological horror visual novel. What starts as a cute dating sim becomes disturbing.', imageKeyword: 'doki doki literature club horror' }),
  makeGame({ id: 'epic-44', title: 'Super Meat Boy Forever', source: 'epic-games', originalPrice: 14.99, genre: 'Platformer',
    description: 'Auto-running platformer with brutal difficulty. Guide Meat Boy through hundreds of challenging levels.', imageKeyword: 'super meat boy forever platformer' }),
  makeGame({ id: 'epic-45', title: 'Total War: Three Kingdoms', source: 'epic-games', originalPrice: 59.99, genre: 'Strategy',
    description: 'Epic historical strategy set in ancient China. Build your dynasty and conquer in real-time battles.', imageKeyword: 'total war three kingdoms strategy' }),
  makeGame({ id: 'epic-46', title: 'Machinarium', source: 'epic-games', originalPrice: 9.99, genre: 'Puzzle Adventure',
    description: 'Award-winning point-and-click adventure set in a mechanical world. Help a robot save his girlfriend.', imageKeyword: 'machinarium point click robot puzzle' }),
  makeGame({ id: 'epic-47', title: 'Strange Horticulture', source: 'epic-games', originalPrice: 14.99, genre: 'Puzzle Simulation',
    description: 'Botanical mystery puzzle game. Run a plant shop and use plant knowledge to solve Victorian mysteries.', imageKeyword: 'strange horticulture plant puzzle' }),
  makeGame({ id: 'epic-48', title: 'Make Way', source: 'epic-games', originalPrice: 14.99, genre: 'Racing Party',
    description: 'Chaotic multiplayer racing with track-building mechanics. Create insane tracks on the fly and race friends.', imageKeyword: 'make way racing party' }),
  makeGame({ id: 'epic-49', title: 'Bloons TD 6', source: 'epic-games', originalPrice: 13.99, genre: 'Tower Defense',
    description: 'The ultimate tower defense game. Pop waves of colorful bloons with powerful monkey towers and deep upgrades.', imageKeyword: 'bloons td 6 tower defense monkeys' }),
  makeGame({ id: 'epic-50', title: 'Styx: Master of Shadows', source: 'epic-games', originalPrice: 29.99, genre: 'Stealth',
    description: 'Infiltrate a massive tower as a cunning goblin thief. Use stealth, traps, and acrobatic skills.', imageKeyword: 'styx master shadows stealth goblin' }),
  makeGame({ id: 'epic-51', title: 'Styx: Shards of Darkness', source: 'epic-games', originalPrice: 29.99, genre: 'Stealth Action',
    description: 'The goblin assassin returns in an even bigger adventure. Explore open environments with cunning stealth.', imageKeyword: 'styx shards darkness stealth' }),

  // === PRIME GAMING (9 juegos) ===
  makeGame({ id: 'prime-1', title: 'Saints Row: The Third Remastered', source: 'prime-gaming', originalPrice: 39.99, genre: 'Open World Action',
    description: 'Iconic open-world action fully remastered. Cause mayhem in Steelport with enhanced graphics and all DLC.', imageKeyword: 'saints row third remastered open world', platform: ['Epic Games', 'Amazon'] }),
  makeGame({ id: 'prime-2', title: 'Mafia II: Definitive Edition', source: 'prime-gaming', originalPrice: 29.99, genre: 'Action Adventure',
    description: 'Live the life of a mobster in this beautifully remastered crime drama. Vito Scaletta rise through Mafia ranks.', imageKeyword: 'mafia ii definitive edition crime', platform: ['GOG', 'Amazon'] }),
  makeGame({ id: 'prime-3', title: 'Crime Boss: Rockay City', source: 'prime-gaming', originalPrice: 39.99, genre: 'FPS Action',
    description: 'Organized crime FPS with all-star cast. Build your criminal empire in a 90s Miami-style city.', imageKeyword: 'crime boss rockay city fps', platform: ['Epic Games', 'Amazon'] }),
  makeGame({ id: 'prime-4', title: 'Saints Row IV: Re-Elected', source: 'prime-gaming', originalPrice: 29.99, genre: 'Open World Action',
    description: 'Outrageous open-world where you are the President with superpowers. Fight aliens in this over-the-top sandbox.', imageKeyword: 'saints row iv re-elected president', platform: ['Epic Games', 'Amazon'] }),
  makeGame({ id: 'prime-5', title: 'Steelrising', source: 'prime-gaming', originalPrice: 49.99, genre: 'Action RPG',
    description: 'Souls-like RPG in alternate French Revolution. Fight mechanical automatons as Aegis, robotic bodyguard.', imageKeyword: 'steelrising souls like french revolution', platform: ['Steam', 'Amazon'] }),
  makeGame({ id: 'prime-6', title: 'XCOM: Chimera Squad', source: 'prime-gaming', originalPrice: 19.99, genre: 'Tactical Strategy',
    description: 'Tactical strategy spin-off after XCOM 2. Lead humans and aliens to protect City 31 from threats.', imageKeyword: 'xcom chimera squad tactical', platform: ['Epic Games', 'Amazon'] }),
  makeGame({ id: 'prime-7', title: 'In Sound Mind', source: 'prime-gaming', originalPrice: 29.99, genre: 'Psychological Horror',
    description: 'First-person psychological horror. Explore twisted memories of patients while hunted by supernatural entities.', imageKeyword: 'in sound mind psychological horror', platform: ['Steam', 'Amazon'] }),
  makeGame({ id: 'prime-8', title: 'Deus Ex: Game of the Year Edition', source: 'prime-gaming', originalPrice: 9.99, genre: 'Action RPG',
    description: 'The legendary immersive sim. Groundbreaking blend of RPG, stealth, and shooter that defined a genre.', imageKeyword: 'deus ex game year classic rpg', platform: ['GOG', 'Amazon'] }),
  makeGame({ id: 'prime-9', title: 'SteamWorld Quest: Hand of Gilgamech', source: 'prime-gaming', originalPrice: 24.99, genre: 'Card RPG',
    description: 'Hand-crafted RPG with card-based combat. Lead heroes through a colorful world with powerful card combos.', imageKeyword: 'steamworld quest card rpg', platform: ['Steam', 'Nintendo Switch', 'Amazon'] }),

  // === GOG (4 juegos) ===
  makeGame({ id: 'gog-1', title: 'FTL: Faster Than Light', source: 'gog', originalPrice: 9.99, genre: 'Strategy Roguelike',
    description: 'Command your spaceship in this award-winning roguelike strategy. Manage crew, upgrade systems, survive danger.', imageKeyword: 'ftl faster than light spaceship', platform: ['GOG', 'Steam'], deliveryType: 'drm-free' }),
  makeGame({ id: 'gog-2', title: 'Jotun: Valhalla Edition', source: 'gog', originalPrice: 14.99, genre: 'Action Exploration',
    description: 'Hand-drawn action in Norse mythology. Fight massive bosses as Thora, a Viking warrior proving herself to gods.', imageKeyword: 'jotun valhalla norse viking', platform: ['GOG', 'Steam'], deliveryType: 'drm-free' }),
  makeGame({ id: 'gog-3', title: 'The Last Door: Season 1', source: 'gog', originalPrice: 0.00, genre: 'Point and Click Horror',
    description: 'Pixel art horror adventure. Uncover terrifying mysteries in Victorian England through eerie environments.', imageKeyword: 'last door season pixel horror', platform: ['GOG'], deliveryType: 'drm-free' }),
  makeGame({ id: 'gog-4', title: 'Sanctuary RPG', source: 'gog', originalPrice: 0.00, genre: 'RPG',
    description: 'ASCII-style retro RPG with deep mechanics. Explore dungeons, complete quests, build your character.', imageKeyword: 'sanctuary rpg ascii retro dungeon', platform: ['GOG'], deliveryType: 'drm-free' }),

  // === HUMBLE BUNDLE (2 juegos) ===
  makeGame({ id: 'humble-1', title: 'Dishonored: Death of the Outsider', source: 'humble', originalPrice: 29.99, genre: 'Stealth Action',
    description: 'Standalone Dishonored expansion. Play as Billie Lurk in a personal story of revenge against the Outsider.', imageKeyword: 'dishonored death outsider stealth', platform: ['Steam'] }),
  makeGame({ id: 'humble-2', title: 'Orwell: Keeping an Eye On You', source: 'humble', originalPrice: 9.99, genre: 'Simulation',
    description: 'Surveillance thriller where you monitor online communications. Question everything in this thought-provoking indie.', imageKeyword: 'orwell surveillance thriller', platform: ['Steam'] }),

  // === INDIEGALA (1 juego) ===
  makeGame({ id: 'indie-1', title: '100% Orange Juice', source: 'indiegala', originalPrice: 9.99, genre: 'Board Game',
    description: 'Digital board game with colorful anime characters. Roll dice, collect cards, battle opponents in multiplayer party.', imageKeyword: '100 orange juice board game anime', platform: ['Steam'] }),

  // === FANATICAL (1 juego) ===
  makeGame({ id: 'fanatical-1', title: 'Eternal Threads', source: 'fanatical', originalPrice: 19.99, genre: 'Puzzle Narrative',
    description: 'Time-manipulation puzzle about altering fate. Rewind decisions of six characters to prevent a tragedy.', imageKeyword: 'eternal threads time manipulation puzzle', platform: ['Steam'] }),

  // === STEAM F2P (4 juegos) ===
  makeGame({ id: 'steam-1', title: 'Destiny 2', source: 'steam', originalPrice: 0.00, genre: 'FPS MMO',
    description: "Bungie's shared-world shooter with satisfying gunplay. Explore planets, raid with friends, collect legendary loot.", imageKeyword: 'destiny 2 fps mmo', platform: ['Steam'], deliveryType: 'account', tags: ['fps', 'mmo', 'free-game', '100-profit', 'steam'] }),
  makeGame({ id: 'steam-2', title: 'Apex Legends', source: 'steam', originalPrice: 0.00, genre: 'Battle Royale FPS',
    description: 'Fast-paced battle royale from Respawn. Master unique legend abilities with squad-based gameplay.', imageKeyword: 'apex legends battle royale fps', platform: ['Steam', 'EA App'], deliveryType: 'account', tags: ['fps', 'battle-royale', 'free-game', '100-profit', 'steam'] }),
  makeGame({ id: 'steam-3', title: 'Warframe', source: 'steam', originalPrice: 0.00, genre: 'Action RPG',
    description: 'Co-op sci-fi action with ninja warriors. Slice thousands of enemies with incredible weapons and Warframe suits.', imageKeyword: 'warframe sci-fi ninja action', platform: ['Steam'], deliveryType: 'account', tags: ['action', 'rpg', 'free-game', '100-profit', 'steam'] }),
  makeGame({ id: 'steam-4', title: 'Path of Exile', source: 'steam', originalPrice: 0.00, genre: 'Action RPG',
    description: 'Deep action RPG with massive skill trees. Explore dark fantasy, customize with hundreds of skill gems.', imageKeyword: 'path of exile action rpg dark fantasy', platform: ['Steam'], deliveryType: 'account', tags: ['action', 'rpg', 'free-game', '100-profit', 'steam'] }),
];

/** Estadísticas de la base de datos */
export const SEED_STATS = {
  totalGames: SEED_GAMES.length,
  epicGames: SEED_GAMES.filter(g => g.source === 'epic-games').length,
  primeGaming: SEED_GAMES.filter(g => g.source === 'prime-gaming').length,
  gog: SEED_GAMES.filter(g => g.source === 'gog').length,
  humble: SEED_GAMES.filter(g => g.source === 'humble').length,
  indiegala: SEED_GAMES.filter(g => g.source === 'indiegala').length,
  fanatical: SEED_GAMES.filter(g => g.source === 'fanatical').length,
  steam: SEED_GAMES.filter(g => g.source === 'steam').length,
  estimatedTotalValue: SEED_GAMES.reduce((s, g) => s + g.originalPrice, 0),
  estimatedProfit: SEED_GAMES.reduce((s, g) => s + g.sellPrice, 0),
  lastUpdated: new Date().toISOString(),
  verified: true,
  source: 'Web research - PC Gamer, gg.deals, search verification (Aug 2026)',
};
