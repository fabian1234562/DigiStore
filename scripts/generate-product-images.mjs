import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = '/home/z/my-project/public/products/gen';

// 34 unique images - one per platform, each with a DIFFERENT prompt
const imagePrompts = [
  // GAMING
  { filename: 'fortnite.png', prompt: 'Epic digital game product card, Fortnite V-Bucks bundle, vibrant blue and purple neon glow, 3D floating V-Bucks coin icon with sparkle effects, dark gradient background with lightning, futuristic gaming style, high quality product showcase, no text' },
  { filename: 'roblox.png', prompt: 'Epic digital game product card, Roblox Robux currency bundle, bright red and orange neon glow, 3D floating Robux coin stack with shine effects, dark gradient background with stars, blocky pixel art style mixed with 3D, high quality product showcase, no text' },
  { filename: 'valorant.png', prompt: 'Epic digital game product card, Valorant Points and weapon skins, crimson red and black neon glow, 3D floating weapon skin with fire effects and radiance, dark gradient background with tactical grid lines, competitive FPS style, high quality product showcase, no text' },
  { filename: 'minecraft.png', prompt: 'Epic digital game product card, Minecraft Premium account, green and brown earthy tones with glowing edges, 3D floating diamond sword and pickaxe with particle effects, dark gradient background with blocky pixel particles, voxel art style, high quality product showcase, no text' },
  { filename: 'lol.png', prompt: 'Epic digital game product card, League of Legends Riot Points, gold and blue royal glow, 3D floating golden coin with League crystal crown, dark gradient background with magical rune circles, MOBA fantasy style, high quality product showcase, no text' },
  { filename: 'genshin.png', prompt: 'Epic digital game product card, Genshin Impact Genesis Crystals, cyan and gold ethereal glow, 3D floating glowing crystal with elemental particle effects wind and fire, dark gradient background with stars and constellations, anime fantasy style, high quality product showcase, no text' },
  { filename: 'apex.png', prompt: 'Epic digital game product card, Apex Legends Coins, orange and red aggressive glow, 3D floating coin stack with wing emblem and speed lines, dark gradient background with explosion effects, battle royale action style, high quality product showcase, no text' },
  { filename: 'pubgm.png', prompt: 'Epic digital game product card, PUBG Mobile UC currency, military yellow and black glow, 3D floating helmet with airdrop crate and supply glow, dark gradient background with parachutes and smoke, military tactical style, high quality product showcase, no text' },
  { filename: 'freefire.png', prompt: 'Epic digital game product card, Free Fire Diamonds, fiery orange and red glow, 3D floating diamond gem with flame aura and character silhouette, dark gradient background with fire particles, battle royale mobile style, high quality product showcase, no text' },
  { filename: 'amongus.png', prompt: 'Epic digital game product card, Among Us full skins collection, red and space-blue neon glow, 3D floating colorful crewmate characters with space helmet reflections, dark gradient background with spaceship interior, cute space style, high quality product showcase, no text' },
  { filename: 'clashroyale.png', prompt: 'Epic digital game product card, Clash Royale Gems, purple and blue royal glow, 3D floating glowing gem chest with crown and sparkles, dark gradient background with arena tower silhouettes, medieval strategy style, high quality product showcase, no text' },
  { filename: 'mobilelegends.png', prompt: 'Epic digital game product card, Mobile Legends Diamonds, blue and gold esports glow, 3D floating diamond with hero sword and shield emblem, dark gradient background with MOBA map lines, esports mobile style, high quality product showcase, no text' },
  { filename: 'brawlstars.png', prompt: 'Epic digital game product card, Brawl Stars Gems, electric blue and yellow energetic glow, 3D floating gem with brawler character fists and star burst, dark gradient background with arena spotlights, colorful cartoon brawler style, high quality product showcase, no text' },
  { filename: 'cs2.png', prompt: 'Epic digital game product card, Counter-Strike 2 weapon skins, silver and orange metallic glow, 3D floating AK-47 with dragon skin pattern and case opening glow, dark gradient background with crosshair and smoke, tactical shooter style, high quality product showcase, no text' },
  { filename: 'gtav.png', prompt: 'Epic digital game product card, GTA V Shark Card money bundle, green and gold luxury glow, 3D floating shark card with dollar signs and money explosion, dark gradient background with city skyline at night, open world crime style, high quality product showcase, no text' },
  { filename: 'cod.png', prompt: 'Epic digital game product card, Call of Duty Warzone CoD Points, dark military green and orange glow, 3D floating ammo crate with skull emblem and combat effects, dark gradient background with warzone battlefield, military FPS style, high quality product showcase, no text' },
  { filename: 'honkai.png', prompt: 'Epic digital game product card, Honkai Star Rail Oneiric Shards, cosmic purple and gold glow, 3D floating crystal shard with train and star trail, dark gradient background with galaxies and cosmic dust, sci-fi anime space style, high quality product showcase, no text' },
  { filename: 'wuthering.png', prompt: 'Epic digital game product card, Wuthering Waves Astrite, teal and white ethereal glow, 3D floating astrite crystal with sonic wave ripples and bird silhouette, dark gradient background with wind effects and floating islands, anime action RPG style, high quality product showcase, no text' },
  { filename: 'eafc25.png', prompt: 'Epic digital game product card, EA FC 25 Ultimate Team Coins, green and gold football glow, 3D floating football with coin aura and stadium lights, dark gradient background with football pitch lines, sports soccer style, high quality product showcase, no text' },
  { filename: 'coc.png', prompt: 'Epic digital game product card, Clash of Clans Gems, dark blue and gold village glow, 3D floating gem cluster with sword and shield, dark gradient background with village and elixir pump, medieval strategy style, high quality product showcase, no text' },
  { filename: 'wildrift.png', prompt: 'Epic digital game product card, League of Legends Wild Rift Tokens, blue and silver mobile gaming glow, 3D floating token with champion silhouette and mobile device frame, dark gradient background with rift portal energy, mobile MOBA style, high quality product showcase, no text' },
  { filename: 'diablo4.png', prompt: 'Epic digital game product card, Diablo IV account, hellish red and black infernal glow, 3D floating diablo horned skull with hellfire and embers, dark gradient background with cathedral ruins and hell portal, dark fantasy RPG style, high quality product showcase, no text' },
  { filename: 'overwatch2.png', prompt: 'Epic digital game product card, Overwatch 2 Coins, orange and blue hero glow, 3D floating owl mascot with coin halo and hero pose silhouette, dark gradient background with payload cart and team colors, hero shooter style, high quality product showcase, no text' },
  { filename: 'rocketleague.png', prompt: 'Epic digital game product card, Rocket League Credits, blue and orange rocket boost glow, 3D floating rocket-powered car with flame trail and ball, dark gradient background with stadium arena, vehicular soccer style, high quality product showcase, no text' },
  { filename: 'destiny2.png', prompt: 'Epic digital game product card, Destiny 2 Silver, white and gold cosmic glow, 3D floating engram with Traveler sphere and light rays, dark gradient background with space and planets, sci-fi looter shooter style, high quality product showcase, no text' },
  { filename: 'fifamobile.png', prompt: 'Epic digital game product card, FIFA Mobile Coins, green and gold football glow, 3D floating football with coin explosion and player silhouette, dark gradient background with stadium crowd, mobile soccer style, high quality product showcase, no text' },

  // STREAMING
  { filename: 'netflix.png', prompt: 'Epic digital streaming product card, Netflix Premium subscription, bold red and black cinematic glow, 3D floating play button with golden ribbon and film reel, dark gradient background with movie theater curtains, premium streaming style, high quality product showcase, no text' },
  { filename: 'spotify.png', prompt: 'Epic digital streaming product card, Spotify Premium subscription, vibrant green and black music glow, 3D floating sound waves with headphones and music notes, dark gradient background with equalizer bars, music streaming style, high quality product showcase, no text' },
  { filename: 'disney.png', prompt: 'Epic digital streaming product card, Disney Plus subscription, magical blue and gold glow, 3D floating castle silhouette with magic wand stars, dark gradient background with fireworks and sparkles, family entertainment style, high quality product showcase, no text' },
  { filename: 'hbomax.png', prompt: 'Epic digital streaming product card, HBO Max subscription, deep purple and gold premium glow, 3D floating golden crown with film strip and screen glow, dark gradient background with red carpet and spotlights, premium TV style, high quality product showcase, no text' },
  { filename: 'crunchyroll.png', prompt: 'Epic digital streaming product card, Crunchyroll Premium subscription, electric orange and blue anime glow, 3D floating anime character silhouette with sakura petals and ninja star, dark gradient background with manga panels, anime streaming style, high quality product showcase, no text' },
  { filename: 'paramount.png', prompt: 'Epic digital streaming product card, Paramount Plus subscription, royal blue and white mountain glow, 3D floating majestic mountain peak with stars and streaming rays, dark gradient background with city skyline, premium streaming style, high quality product showcase, no text' },
  { filename: 'appletv.png', prompt: 'Epic digital streaming product card, Apple TV Plus subscription, sleek gray and white minimalist glow, 3D floating Apple TV app icon with cinematic screen glow, dark gradient background with subtle gradient mesh, premium Apple style, high quality product showcase, no text' },
  { filename: 'amazonprime.png', prompt: 'Epic digital streaming product card, Amazon Prime Video subscription, blue and teal prime glow, 3D floating Prime box opening with film strip and play button, dark gradient background with delivery truck silhouette, premium streaming style, high quality product showcase, no text' },
];

async function generateImage(item, index) {
  const outputPath = path.join(OUTPUT_DIR, item.filename);

  // Skip if already exists
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    if (stats.size > 10000) { // file has real content
      console.log(`[${index + 1}/${imagePrompts.length}] SKIP (exists): ${item.filename}`);
      return { success: true, filename: item.filename, cached: true };
    }
  }

  // Escape quotes for shell
  const escapedPrompt = item.prompt.replace(/'/g, "'\\''");

  try {
    console.log(`[${index + 1}/${imagePrompts.length}] GENERATING: ${item.filename}...`);

    execSync(`z-ai image -p '${escapedPrompt}' -o '${outputPath}' -s 1024x1024`, {
      timeout: 120000,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Verify file was created
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log(`  ✓ SAVED: ${item.filename} (${(stats.size / 1024).toFixed(1)} KB)`);
      return { success: true, filename: item.filename, size: stats.size };
    } else {
      console.error(`  ✗ FAILED: File not created: ${item.filename}`);
      return { success: false, filename: item.filename, error: 'File not created' };
    }
  } catch (error) {
    console.error(`  ✗ FAILED: ${item.filename} - ${error.message}`);
    return { success: false, filename: item.filename, error: error.message };
  }
}

async function main() {
  console.log(`=== Generating ${imagePrompts.length} unique product images ===`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  const results = [];

  for (let i = 0; i < imagePrompts.length; i++) {
    const result = await generateImage(imagePrompts[i], i);
    results.push(result);

    // Delay between requests to avoid rate limiting (8 seconds)
    if (i < imagePrompts.length - 1) {
      console.log('  ⏳ Waiting 8s before next request...');
      await new Promise(resolve => setTimeout(resolve, 8000));
    }
  }

  console.log('\n=== SUMMARY ===');
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  console.log(`Success: ${successful.length}/${imagePrompts.length}`);
  if (failed.length > 0) {
    console.log(`Failed: ${failed.map(f => f.filename).join(', ')}`);
  }

  // Write results for debugging
  fs.writeFileSync('/home/z/my-project/scripts/gen-results.json', JSON.stringify(results, null, 2));
  console.log('Results saved to scripts/gen-results.json');
}

main();
