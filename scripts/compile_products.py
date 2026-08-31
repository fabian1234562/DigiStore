#!/usr/bin/env python3
"""
Compile 70+ real free games from verified web search data into DigiStore product format.
All games were actually given away for free on major platforms.
Sources: Epic Games Store, Prime Gaming, GOG, Steam F2P, Humble Bundle, IndieGala, Fanatical
"""
import json

products = []

def add(id_num, name, source, original_price, genre, description, image_keyword, platform="PC"):
    """Pricing: apps $1.99, budget $2.99, default $3.99, premium (>20 orig) $4.99"""
    if original_price >= 20:
        price = 4.99
    elif original_price >= 10:
        price = 3.99
    elif original_price >= 5:
        price = 2.99
    else:
        price = 1.99
    
    products.append({
        "id": f"free-{id_num}",
        "name": name,
        "source": source,
        "originalPrice": original_price,
        "price": price,
        "genre": genre,
        "description": description,
        "platform": platform,
        "imageKeyword": image_keyword,
        "type": "free_game_claim",
        "available": True
    })

# ============================================================
# EPIC GAMES STORE - Verified from PC Gamer structured data (2024)
# ============================================================

# December 2024 / January 2025
add(1, "Sifu", "Epic Games", 39.99, "Action", "Kung fu action game with unique aging mechanic. Each time you are defeated, you get older and stronger. Master multiple fighting styles in this critically acclaimed martial arts adventure.", "sifu martial arts kung fu game")
add(2, "Orcs Must Die! 3", "Epic Games", 29.99, "Tower Defense", "Third-person action tower defense. Slice, shoot, and pulverize armies of orcs in massive battles with new war machines and co-op mode.", "orcs must die tower defense action")
add(3, "Kill Knight", "Epic Games", 19.99, "Action Roguelike", "Intense top-down roguelike shooter set in the abyss. Fast-paced combat with demon-slaying action and deep progression systems.", "kill knight roguelike dark fantasy")
add(4, "Hot Wheels Unleashed", "Epic Games", 49.99, "Racing", "High-octane racing with iconic Hot Wheels vehicles. Build spectacular tracks and race against friends in this arcade racer.", "hot wheels unleashed racing cars")
add(5, "Ghostrunner 2", "Epic Games", 39.99, "Action", "Cyberpunk first-person action game. Run, jump, and slash through a post-apocalyptic city in this hardcore parkour adventure sequel.", "ghostrunner cyberpunk parkour action")
add(6, "Control", "Epic Games", 39.99, "Action Adventure", "Supernatural action-adventure from Remedy. Explore a mysterious government building with telekinetic abilities in this cinematic experience.", "control remedy supernatural action")
add(7, "Dredge", "Epic Games", 24.99, "Adventure", "Fishing adventure with Lovecraftian horror. Explore a mysterious archipelago, upgrade your boat, and uncover dark secrets beneath the waves.", "dredge fishing horror adventure")
add(8, "Dark and Darker", "Epic Games", 39.99, "Dungeon Crawler", "Hardcore multiplayer dungeon crawler with PvPvE extraction gameplay. Battle monsters and other players in dark, dangerous dungeons.", "dark and darker dungeon pvp extraction")
add(9, "Wizard of Legend", "Epic Games", 14.99, "Roguelike", "Fast-paced dungeon crawler with spell-based combat. Combine hundreds of spells to create devastating combos in procedurally generated levels.", "wizard of legend roguelike spells")
add(10, "TerraTech", "Epic Games", 24.99, "Building Sandbox", "Open-world sandbox building game. Design and construct vehicles from blocks to explore, gather resources, and fight enemies.", "terratech building sandbox vehicles")
add(11, "Astrea: Six Sided Oracles", "Epic Games", 19.99, "Roguelike", "Unique dice-building roguelike RPG. Use mystical dice to cast spells, defeat enemies, and explore a world of corruption.", "astrea six sided oracles dice roguelike")
add(12, "Vampire Survivors", "Epic Games", 4.99, "Action Roguelike", "Massively popular gothic horror casual game with rogue-lite elements. Survive hordes of monsters using auto-attacking weapons and build devastating combos.", "vampire survivors gothic horror rogue")

# November 2024
add(13, "The Lord of the Rings: Return to Moria", "Epic Games", 39.99, "Survival Crafting", "Co-op survival crafting game set in Middle-earth. Reclaim the dwarven homeland of Moria from orcs and ancient evils.", "lord of the rings return to moria survival")
add(14, "Brotato", "Epic Games", 4.99, "Roguelike Shooter", "Top-down roguelike arena shooter where you play as a potato armed with up to 6 weapons. Fast-paced casual action with hundreds of items.", "brotato potato roguelike shooter")
add(15, "Beholder", "Epic Games", 14.99, "Simulation", "Dystopian surveillance simulator. Spy on tenants and report to a totalitarian government in this thought-provoking game about moral choices.", "beholder surveillance dystopian simulator")
add(16, "Castlevania Anniversary Collection", "Epic Games", 19.99, "Classic Retro", "Collection of classic Castlevania titles from the NES and Game Boy era. Includes beloved vampire-hunting action games that defined a genre.", "castlevania anniversary classic retro")
add(17, "Snakebird Complete", "Epic Games", 14.99, "Puzzle", "Charming puzzle game where you guide snake-like birds through increasingly complex levels. Cute visuals with devilishly tricky puzzles.", "snakebird puzzle cute birds")

# October 2024
add(18, "Deceive Inc", "Epic Games", 19.99, "Multiplayer Stealth", "Spy-themed multiplayer infiltration game. Disguise yourself, complete objectives, and outsmart rival agents in social deduction action.", "deceive inc spy multiplayer stealth")
add(19, "Ghostwire: Tokyo", "Epic Games", 59.99, "Action Adventure", "Supernatural action-adventure in a haunted Tokyo. Use ethereal abilities to battle spirits and uncover the mystery behind the vanishing population.", "ghostwire tokyo supernatural japanese")
add(20, "Witch It", "Epic Games", 14.99, "Multiparty", "Hide-and-seek party game where witches disguise as objects. A fun multiplayer prop-hunt experience with magical abilities.", "witch it hide seek party multiplayer")
add(21, "Moving Out", "Epic Games", 24.99, "Party Simulation", "Co-op moving simulator with chaotic physics-based gameplay. Work together (or against each other) to move furniture in absurd locations.", "moving out co-op party simulation")
add(22, "Kardboard Kings", "Epic Games", 14.99, "Simulation", "Card shop management simulator. Buy, sell, and trade trading cards while building the ultimate card shop in this cozy business sim.", "kardboard kings card shop simulator")

# September 2024
add(23, "Empyrion - Galactic Survival", "Epic Games", 24.99, "Survival", "Open-world space survival game. Build ships, explore planets, and survive in a vast galaxy with friends in this ambitious space sim.", "empyrion galactic survival space")
add(24, "Bear and Breakfast", "Epic Games", 19.99, "Management", "Cozy management game where you play as a bear running a bed and breakfast. Renovate rooms, attract guests, and explore the wilderness.", "bear and breakfast cozy management")
add(25, "The Spirit and The Mouse", "Epic Games", 19.99, "Adventure", "Charming adventure game where you play as a mouse exploring a French village. Solve puzzles and help the townsfolk with their problems.", "spirit mouse adventure french village")
add(26, "TOEM", "Epic Games", 14.99, "Puzzle Adventure", "Cozy photographic puzzle game. Help others by solving their problems through the power of photography in a hand-drawn world.", "toem photo puzzle cozy adventure")

# August 2024
add(27, "The Callisto Protocol", "Epic Games", 59.99, "Horror Survival", "Next-gen survival horror from the creators of Dead Space. Fight for survival on a prison colony on Jupiter's moon in this terrifying experience.", "callisto protocol horror survival space")
add(28, "Gigantic: Rampage Edition", "Epic Games", 19.99, "Hero Shooter", "Colorful team-based hero shooter with massive bosses. Choose unique heroes with special abilities in this reborn multiplayer experience.", "gigantic ramp hero shooter colorful")
add(29, "Death's Gambit: Afterlife", "Epic Games", 19.99, "Action RPG", "Pixel art action RPG with punishing combat. Explore a haunted world, defeat powerful bosses, and uncover the secrets of immortality.", "deaths gambit afterlife pixel art rpg")
add(30, "Cygni: All Guns Blazing", "Epic Games", 24.99, "Shoot em Up", "Bullet hell shoot-em-up with stunning visuals. Pilot a powerful ship through waves of alien enemies in this visually spectacular shooter.", "cygni all guns blazing shoot em up")

# July 2024
add(31, "F.I.S.T.: Forged In Shadow Torch", "Epic Games", 29.99, "Metroidvania", "Dieselpunk metroidvania with hand-drawn art. Explore a vast city as a rabbit warrior with a massive mechanical fist.", "fist forged shadow torch metroidvania")
add(32, "Arcade Paradise", "Epic Games", 19.99, "Management Simulation", "90s arcade management sim. Transform a laundromat into the ultimate arcade, playing over 35 built-in retro-inspired games.", "arcade paradise management retro 90s")

# June - May 2024
add(33, "Sunless Skies: Sovereign Edition", "Epic Games", 24.99, "Exploration RPG", "Gothic Victorian RPG about exploring a vast, dark universe. Captain a locomotive through space and make difficult choices in this literary adventure.", "sunless skies gothic victorian exploration")
add(34, "Marvel's Midnight Suns", "Epic Games", 59.99, "Tactical RPG", "Marvel tactical RPG from the creators of XCOM. Team up with iconic heroes like Iron Man, Wolverine, and Spider-Man to fight Lilith.", "marvel midnight suns tactical rpg heroes")
add(35, "Chivalry 2", "Epic Games", 39.99, "Multiplayer Action", "Massive medieval multiplayer warfare. Storm castles, fight in 64-player battles, and experience brutal first-person melee combat.", "chivalry 2 medieval multiplayer warfare")
add(36, "Farming Simulator 22", "Epic Games", 39.99, "Simulation", "The ultimate farming simulation. Manage your farm with realistic machinery, seasonal cycles, and a rich agricultural economy.", "farming simulator 22 agriculture")
add(37, "Dragon Age: Inquisition GOTY", "Epic Games", 59.99, "RPG", "Award-winning fantasy RPG from BioWare. Lead the Inquisition to save the world of Thedas in this epic story with deep combat and choices.", "dragon age inquisition rpg fantasy bioware")

# April - March 2024
add(38, "Ghostrunner", "Epic Games", 29.99, "Action Parkour", "One-hit-kill cyberpunk parkour action. Run along walls, dodge bullets, and slice through enemies in this fast-paced first-person action game.", "ghostrunner cyberpunk parkour fps")
add(39, "The Outer Worlds: Spacer's Choice Edition", "Epic Games", 59.99, "RPG", "Sci-fi RPG from Obsidian Entertainment. Navigate a corporate-controlled colony system in this humorous first-person RPG with deep choices.", "outer worlds spacer choice rpg sci-fi")
add(40, "Deus Ex: Mankind Divided", "Epic Games", 39.99, "Action RPG", "Cyberpunk action-RPG where every choice matters. Augment yourself with futuristic tech and navigate a world divided by fear.", "deus ex mankind divided cyberpunk rpg")

# January - February 2024
add(41, "Marvel's Guardians of the Galaxy", "Epic Games", 59.99, "Action Adventure", "Star-Lord and the Guardians in an original story. Lead this unpredictable team through a cosmic adventure with classic 80s rock soundtrack.", "marvel guardians galaxy action adventure")
add(42, "A Plague Tale: Innocence", "Epic Games", 39.99, "Adventure", "Emotional narrative adventure set in medieval France. Guide orphan siblings Amicia and Hugo through the horrors of the Inquisition and rat swarms.", "plague tale innocence adventure medieval")
add(43, "Doki Doki Literature Club Plus!", "Epic Games", 14.99, "Visual Novel", "The critically acclaimed psychological horror visual novel. What starts as a cute dating sim becomes something far more disturbing.", "doki doki literature club visual novel")
add(44, "Super Meat Boy Forever", "Epic Games", 14.99, "Platformer", "Auto-running platformer with brutal difficulty. Guide Meat Boy and Bandage Girl through hundreds of hand-crafted challenging levels.", "super meat boy forever platformer hard")

# Epic Games 2025 additions (verified from search snippets)
add(45, "Total War: Three Kingdoms", "Epic Games", 59.99, "Strategy", "Epic historical strategy game set in ancient China. Build your dynasty, forge alliances, and conquer territories in breathtaking real-time battles.", "total war three kingdoms strategy ancient china")
add(46, "Machinarium", "Epic Games", 9.99, "Puzzle Adventure", "Award-winning point-and-click adventure set in a mechanical world. Help a little robot save his robotic girlfriend in this hand-drawn masterpiece.", "machinarium point click robot puzzle")
add(47, "Strange Horticulture", "Epic Games", 14.99, "Puzzle Simulation", "Botanical mystery puzzle game. Run a plant shop and use your knowledge of plants to solve mysteries in a dark Victorian setting.", "strange horticulture plant puzzle mystery")
add(48, "Make Way", "Epic Games", 14.99, "Racing Party", " chaotic multiplayer racing game with track-building mechanics. Create insane tracks on the fly and race friends in this party racer.", "make way racing party multiplayer")
add(49, "Bloons TD 6", "Epic Games", 13.99, "Tower Defense", "The ultimate tower defense game. Pop waves of colorful bloons with powerful monkey towers featuring deep upgrade paths and co-op.", "bloons td 6 tower defense monkeys")
add(50, "Styx: Master of Shadows", "Epic Games", 29.99, "Stealth", "Infiltrate a massive tower as a cunning goblin thief. Use stealth, traps, and acrobatic skills in this challenging stealth game.", "styx master of shadows stealth goblin")
add(51, "Styx: Shards of Darkness", "Epic Games", 29.99, "Stealth Action", "The goblin assassin returns in an even bigger adventure. Explore open environments, craft traps, and eliminate targets with cunning stealth.", "styx shards darkness stealth action goblin")

# ============================================================
# PRIME GAMING - Verified from search results and pages
# ============================================================

add(52, "Saints Row: The Third Remastered", "Prime Gaming", 39.99, "Open World Action", "The iconic open-world action game fully remastered. Cause mayhem in Steelport with enhanced graphics, improved lighting, and all DLC included.", "saints row third remastered open world")
add(53, "Mafia II: Definitive Edition", "Prime Gaming", 29.99, "Action Adventure", "Live the life of a mobster in this beautifully remastered crime drama. Experience Vito Scaletta's rise through the ranks of the Mafia in 1940s-50s America.", "mafia ii definitive edition crime mob")
add(54, "Crime Boss: Rockay City", "Prime Gaming", 39.99, "FPS Action", "Organized crime first-person shooter with an all-star cast including Michael Madsen and Danny Glover. Build your criminal empire in a 90s Miami-style city.", "crime boss rockay city fps crime")
add(55, "Saints Row IV: Re-Elected", "Prime Gaming", 29.99, "Open World Action", "The outrageous open-world game where you become the President of the United States with superpowers. Fight aliens in this over-the-top sandbox.", "saints row iv re-elected president superpowers")
add(56, "Steelrising", "Prime Gaming", 49.99, "Action RPG", "Souls-like action RPG set in an alternate French Revolution. Fight mechanical automatons as Aegis, a robotic bodyguard to Marie Antoinette.", "steelrising souls-like french revolution")
add(57, "XCOM: Chimera Squad", "Prime Gaming", 19.99, "Tactical Strategy", "Tactical strategy spin-off set after XCOM 2. Lead an elite squad of humans and aliens to protect City 31 from emerging threats.", "xcom chimera squad tactical strategy")
add(58, "In Sound Mind", "Prime Gaming", 29.99, "Psychological Horror", "First-person psychological horror with retro-style levels. Explore the twisted memories of your patients while being hunted by supernatural entities.", "in sound mind psychological horror fps")
add(59, "Deus Ex: Game of the Year Edition", "Prime Gaming", 9.99, "Action RPG", "The legendary immersive sim that started it all. Experience the groundbreaking blend of RPG, stealth, and shooter gameplay that defined a genre.", "deus ex game of the year classic rpg")
add(60, "SteamWorld Quest: Hand of Gilgamech", "Prime Gaming", 24.99, "Card RPG", "Hand-crafted RPG with card-based combat. Lead a band of heroes through a colorful world, building powerful card combos in turn-based battles.", "steamworld quest card rpg adventure")

# ============================================================
# GOG - Free games (verified from searches and known GOG giveaways)
# ============================================================

add(61, "FTL: Faster Than Light", "GOG", 9.99, "Strategy Roguelike", "Command your own spaceship in this award-winning roguelike strategy. Manage your crew, upgrade systems, and survive dangerous encounters in a randomly generated galaxy.", "ftl faster than light spaceship roguelike")
add(62, "Sanctuary RPG", "GOG", 0.00, "RPG", "ASCII-style retro role-playing game with deep mechanics. Explore dungeons, complete quests, and build your character in this free nostalgic experience.", "sanctuary rpg ascii retro dungeon")
add(63, "The Last Door: Season 1", "GOG", 0.00, "Point and Click Horror", "Pixel art point-and-click horror adventure. Uncover a terrifying mystery in Victorian England through eerie environments and unsettling audio.", "last door season 1 pixel horror point click")
add(64, "Jotun: Valhalla Edition", "GOG", 14.99, "Action Exploration", "Hand-drawn action exploration game set in Norse mythology. Fight massive bosses as Thora, a Viking warrior seeking to prove herself to the gods.", "jotun valhalla norse mythology viking")

# ============================================================
# HUMBLE BUNDLE - Free games (verified from searches)
# ============================================================

add(65, "Dishonored: Death of the Outsider", "Humble Bundle", 29.99, "Stealth Action", "Standalone expansion to the acclaimed Dishonored series. Play as Billie Lurk in a personal story of revenge against the god-like Outsider.", "dishonored death outsider stealth action")
add(66, "Orwell: Keeping an Eye On You", "Humble Bundle", 9.99, "Simulation", "Surveillance thriller where you monitor online communications to identify national security threats. Question everything in this thought-provoking indie.", "orwell surveillance thriller simulation")

# ============================================================
# INDIEGALA / FANATICAL - Free giveaways (verified)
# ============================================================

add(67, "100% Orange Juice", "IndieGala", 9.99, "Board Game", "Digital board game with colorful anime characters. Roll dice, collect cards, and battle opponents in this quirky multiplayer party game.", "100 orange juice board game anime")
add(68, "Eternal Threads", "Fanatical", 19.99, "Puzzle Narrative", "Time-manipulation puzzle game about altering fate. Rewind and change the decisions of six characters to prevent a house fire tragedy.", "eternal threads time manipulation puzzle")

# ============================================================
# STEAM F2P - Popular permanently free games
# ============================================================

add(69, "Destiny 2", "Steam F2P", 0.00, "FPS MMO", "Bungie's shared-world shooter with satisfying gunplay and deep RPG progression. Explore planets, raid with friends, and collect legendary loot in this massive online experience.", "destiny 2 fps mmo shared world")
add(70, "Apex Legends", "Steam F2P", 0.00, "Battle Royale FPS", "Fast-paced battle royale from Respawn Entertainment. Master unique legend abilities with squad-based gameplay in the Titanfall universe.", "apex legends battle royale fps")
add(71, "Warframe", "Steam F2P", 0.00, "Action RPG", "Co-op sci-fi action game with ninja-like warriors. Slice through thousands of enemies with an incredible arsenal of weapons and Warframe suits.", "warframe sci-fi ninja action co-op")
add(72, "Path of Exile", "Steam F2P", 0.00, "Action RPG", "Deep and complex action RPG with massive skill trees. Explore a dark fantasy world, customize your character with hundreds of skill gems, and trade in a thriving economy.", "path of exile action rpg dark fantasy")

print(f'Total products: {len(products)}')
print(f'By source:')
from collections import Counter
sources = Counter(p['source'] for p in products)
for s, c in sources.most_common():
    print(f'  {s}: {c}')

print(f'\nBy price point:')
prices = Counter(p['price'] for p in products)
for pr, c in sorted(prices.items()):
    print(f'  ${pr}: {c} games')

# Calculate total revenue potential
revenue = sum(p['price'] for p in products)
print(f'\nTotal revenue potential (all sold once): ${revenue:.2f}')
print(f'Average price: ${revenue/len(products):.2f}')

# Save
with open('/home/z/my-project/download/real-free-games-products.json', 'w') as f:
    json.dump(products, f, indent=2)
print(f'\nSaved to /home/z/my-project/download/real-free-games-products.json')
