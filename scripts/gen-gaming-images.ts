import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = '/home/z/my-project/public/products/gen';
const DELAY_MS = 12000; // 12 seconds between calls to avoid 429

interface ProductPrompt {
  id: string;
  name: string;
  prompt: string;
}

const gamingProducts: ProductPrompt[] = [
  { id: 'g1', name: '1000 V-Bucks - Fortnite', prompt: 'Digital product showcase card for 1000 V-Bucks Fortnite currency. A glowing blue coin stack with the Fortnite llama logo, vibrant purple and blue neon lighting on dark background, professional e-commerce product style, 3D render, high quality' },
  { id: 'g2', name: '2800 V-Bucks - Fortnite', prompt: 'Digital product card for 2800 V-Bucks Fortnite package. Three glowing blue coins arranged in triangle formation with sparkle effects, Fortnite style colors blue and purple, dark sleek background with neon accents, 3D product render, professional quality' },
  { id: 'g3', name: '5000 V-Bucks - Fortnite', prompt: 'Digital product showcase for 5000 V-Bucks Fortnite mega pack. Large pile of glowing blue currency coins with golden shimmer, Fortnite llama mascot silhouette in background, epic purple and blue gradient lighting, premium product photography style, 3D render' },
  { id: 'g4', name: '13500 V-Bucks - Fortnite', prompt: 'Ultimate V-Bucks 13500 Fortnite bundle product image. Massive treasure chest overflowing with glowing blue coins, golden light rays, Fortnite branded, luxury premium feel, dark background with blue and gold neon, 3D cinematic render, high quality product shot' },
  { id: 'g5', name: '800 Robux - Roblox', prompt: 'Digital product card for 800 Robux Roblox currency. Stack of shiny golden Robux coins with the Roblox R logo, bright colorful background with red and yellow accents, fun playful 3D style, professional e-commerce product image' },
  { id: 'g6', name: '1700 Robux - Roblox', prompt: 'Product showcase for 1700 Robux Roblox package. Two pillars of golden Robux coins crossed like swords, sparkling particle effects, Roblox characteristic red and yellow color scheme, dark background with colorful neon glow, 3D render' },
  { id: 'g7', name: '4500 Robux - Roblox', prompt: 'Premium 4500 Robux Roblox product image. Golden Robux coin fountain with water splash effect made of coins, sparkle particles everywhere, luxurious gold and red color palette, premium product photography on dark background, 3D cinematic quality' },
  { id: 'g8', name: 'Pase de Batalla - Temporada Actual', prompt: 'Gaming battle pass seasonal product card. A glowing battle pass card with holographic effect, military rank insignias, stars and progression bars, epic golden and crimson color scheme, game controller silhouette, dark dramatic background, 3D product render' },
  { id: 'g9', name: 'Skin Legendaria - Valorant', prompt: 'Legendary Valorant weapon skin product showcase. A futuristic stylized rifle with neon red and black dragon design, glowing energy effects, Valorant style angular aesthetics, dramatic lighting on dark background, 3D game asset render, premium quality' },
  { id: 'g10', name: 'VP 5000 - Valorant Points', prompt: 'Valorant Points 5000 VP product card. Hexagonal glowing crystal formation in Valorant red and teal colors, VP currency symbol floating above, sharp angular design aesthetic, dark background with neon rim lighting, professional 3D product render' },
  { id: 'g11', name: 'Cuenta Premium Minecraft', prompt: 'Minecraft Premium account product card. A Minecraft character in diamond armor standing on a grass block, premium golden crown above head, enchanted golden apple floating nearby, pixel art style blended with 3D depth, green and gold color scheme, high quality render' },
  { id: 'g12', name: 'Minecraft Bedrock Premium', prompt: 'Minecraft Bedrock Edition premium product. Cross-section of a Minecraft world showing bedrock layer with glowing blue portal, pickaxe and sword crossed, pixel-art-meets-3D style, vibrant colors, dark background with blue and purple glow, professional product image' },
  { id: 'g13', name: 'RP League of Legends - 1380', prompt: 'League of Legends 1380 RP product card. Glowing blue crystal containing Riot Points currency, League of Legends summoner icon in background, blue and gold color scheme, magical particle effects, dark background with blue neon, 3D render, professional quality' },
  { id: 'g14', name: 'RP League of Legends - 3500', prompt: 'League of Legends 3500 RP premium bundle. Large blue crystal cluster with golden veins, LoL golden winged crown floating above, abundant magical blue particles, blue and gold luxury color scheme, dark sleek background, 3D cinematic product render' },
  { id: 'g15', name: 'Genesis Crystal Pack - Genshin Impact', prompt: 'Genshin Impact Genesis Crystal pack product image. Beautiful glowing blue Genesis Crystals arranged in a star pattern, elemental energy swirls around them, Genshin Impact blue and gold aesthetic, ethereal magical lighting on dark background, 3D anime-game style render' },
  { id: 'g16', name: 'Blessing of the Welkin Moon - Genshin', prompt: 'Genshin Impact Welkin Moon blessing card. Crescent moon with Genshin Impact character silhouette, blue and silver ethereal glow, starry night background element, premium card design with golden border, magical shimmer effects, 3D render, high quality' },
  { id: 'g17', name: 'Monedas Apex Legends - 1000', prompt: 'Apex Legends 1000 coins product card. Stacked Apex Coins with red metallic finish and the Apex logo, futuristic military aesthetic, red and black color scheme with orange accent lighting, dark gritty background, 3D product render, professional quality' },
  { id: 'g18', name: 'Monedas Apex Legends - 2150', prompt: 'Apex Legends 2150 coins premium bundle. Tower of red metallic Apex Coins with glowing edges, winged helmet emblem floating, futuristic battlefield aesthetic, red black and orange color palette, dramatic lighting, dark background, 3D cinematic render' },
  { id: 'g19', name: 'UC PUBG Mobile - 600', prompt: 'PUBG Mobile 600 UC product card. Glowing orange UC currency chips stacked, military helmet and airdrop crate in background, battle royale aesthetic, orange and dark green color scheme, tactical military feel, dark background with orange glow, 3D render' },
  { id: 'g20', name: 'UC PUBG Mobile - 3250', prompt: 'PUBG Mobile 3250 UC mega pack. Open airdrop crate overflowing with glowing orange UC currency, golden parachute above, military supply drop aesthetic, orange gold and dark army green colors, dramatic lighting, premium 3D product render' },
  { id: 'g21', name: 'Diamantes Free Fire - 1000', prompt: 'Free Fire 1000 diamonds product card. Brilliant cut diamond gems in red and blue, Free Fire fire logo in background, battle royale gaming aesthetic, fiery orange and cool blue contrast, dark background with flame effects, 3D render, professional quality' },
  { id: 'g22', name: 'Diamantes Free Fire - 5600', prompt: 'Free Fire 5600 diamonds premium pack. Massive treasure chest bursting with brilliant diamonds, fire and ice effects surrounding it, Free Fire character silhouette, red orange blue color explosion, dramatic dark background, 3D cinematic quality render' },
  { id: 'g23', name: 'Cuenta Among Us - Skins Completas', prompt: 'Among Us account with complete skins product. Colorful lineup of Among Us crewmates wearing various premium skins and hats, space station corridor background, vibrant red blue green yellow colors, fun and playful style, 3D character render, high quality' },
  { id: 'g24', name: 'Gemas Clash Royale - 1400', prompt: 'Clash Royale 1400 gems product card. Glowing purple gems arranged in a chest, Clash Royale crown tower miniature in background, blue and purple magical lighting, card game battle aesthetic, dark background with purple neon glow, 3D render' },
  { id: 'g25', name: 'Diamantes Mobile Legends - 400', prompt: 'Mobile Legends 400 diamonds product. Blue diamond currency floating above a MOBA game arena map, hero silhouette in background, blue and gold color scheme, magical particle effects, dark background with blue glow, 3D game product render' },
  { id: 'g26', name: 'Diamantes Mobile Legends - 2200', prompt: 'Mobile Legends 2200 diamonds premium pack. Cluster of brilliant blue diamonds with golden crown, epic hero sword embedded in crystal formation, blue and gold luxury palette, dramatic lighting, dark background with magical blue glow, 3D cinematic render' },
  { id: 'g27', name: 'Gemas Brawl Stars - 170', prompt: 'Brawl Stars 170 gems product card. Small pile of bright green Brawl Stars gems with game character brawler fist, colorful cartoon-style background, green and yellow vibrant colors, fun energetic style, 3D render, professional product quality' },
  { id: 'g28', name: 'Gemas Brawl Stars - 1700', prompt: 'Brawl Stars 1700 gems mega pack. Massive gem mine with abundant green gems and golden nuggets, Brawl Stars trophy cup overflowing with gems, vibrant green gold and blue colors, exciting energetic lighting, 3D premium product render' },
  { id: 'g29', name: 'CS2 Skins - Paquete Premium', prompt: 'Counter-Strike 2 premium skins package. Display case showing multiple CS2 weapon skins including AK-47 and AWP with vibrant neon designs, holographic sticker effects, blue and orange neon lighting on dark background, 3D game asset showcase, premium quality' },
  { id: 'g30', name: 'CS2 - Case Key Bundle x5', prompt: 'CS2 case keys bundle of five. Five golden CS2 case keys arranged in a fan pattern, each with unique colored gem, lockpick aesthetic, golden metallic finish with colorful gem accents, dark background with golden glow, 3D product render, professional quality' },
  { id: 'g31', name: 'GTA V - Shark Card Megalodon', prompt: 'GTA V Megalodon Shark Card product. Massive megalodon shark swimming through ocean of money, GTA V logo watermark, blue and green ocean colors with golden money glow, cinematic underwater scene, dark deep blue background, 3D dramatic render' },
  { id: 'g32', name: 'GTA V - Shark Card Whale', prompt: 'GTA V Whale Shark Card product. Whale shark gliding through clouds of golden coins, GTA V city skyline silhouette in background, teal and gold color scheme, dreamy premium feel, dark atmospheric background, 3D cinematic product render' },
  { id: 'g33', name: '2400 CoD Points - Warzone', prompt: 'Call of Duty Warzone 2400 CoD Points. Military dog tags with CoD Points hologram display, tactical green and black color scheme, bullet casings and military stencil aesthetic, dramatic spotlight on dark background, 3D product render, professional military style' },
  { id: 'g34', name: 'Cuenta Premium Warzone/MW3', prompt: 'Warzone Modern Warfare 3 premium account product. Tactical operator skull mask with glowing red eyes, military rank insignias, dark green and black with red accent lighting, elite special forces aesthetic, dramatic dark background, 3D cinematic render' },
  { id: 'g35', name: 'Oneiric Shard Pack - Honkai Star Rail', prompt: 'Honkai Star Rail Oneiric Shard pack. Ethereal purple and blue crystal shards floating in cosmic space, star trail effects, anime-game aesthetic with cosmic theme, purple and blue nebula colors, dark space background with cosmic glow, 3D anime-style render' },
  { id: 'g36', name: 'Express Supply Pass - Honkai Star Rail', prompt: 'Honkai Star Rail Express Supply Pass card. Futuristic train ticket card with holographic star rail design, cosmic purple and gold colors, train silhouette crossing starry sky, premium card with metallic finish look, dark space background, 3D render' },
  { id: 'g37', name: 'Astrite Pack - Wuthering Waves', prompt: 'Wuthering Waves Astrite pack product. Glowing teal and white crystal formations with wind energy swirls, ethereal fantasy aesthetic, teal and white color palette with golden accents, flowing wind effects, dark background with teal glow, 3D anime-game render' },
  { id: 'g38', name: '2800 Monedas EA FC 25', prompt: 'EA FC 25 2800 coins product card. Futuristic football stadium with golden FC coins raining down, EA Sports FC 25 logo glow, green pitch and gold colors, dynamic sports energy feel, dark background with green and gold stadium lights, 3D render' },
  { id: 'g39', name: '5600 Monedas EA FC 25', prompt: 'EA FC 25 5600 coins premium pack. Golden trophy cup overflowing with FC coins, football boot kicking golden coin splash, green and gold premium color scheme, championship celebration aesthetic, dark background with golden spotlight, 3D cinematic render' },
  { id: 'g40', name: 'Gemas Clash of Clans - 1400', prompt: 'Clash of Clans 1400 gems product. Bright pink and purple gems spilling from a barbarian helmet, village tower in background, medieval fantasy gaming aesthetic, pink purple and brown colors, magical sparkle effects, dark background, 3D game render' },
  { id: 'g41', name: 'Gemas Clash of Clans - 5000', prompt: 'Clash of Clans 5000 gems mega pack. Enormous gem mountain with pink purple and green crystals, gold mine cart full of gems, Clash of Clans king character silhouette, vibrant fantasy colors, epic lighting, 3D premium product render' },
  { id: 'g42', name: 'Wild Tokens - League of Legends Wild Rift', prompt: 'League of Legends Wild Rift Wild Tokens. Glowing green tokens with LoLWild Rift logo, mobile gaming aesthetic with phone silhouette, green and gold color scheme, dynamic energy effects, dark background with green neon glow, 3D product render' },
  { id: 'g43', name: 'Cuenta Diablo IV - Edicion Estandar', prompt: 'Diablo IV standard edition account product. Dark demonic portal with hellfire glow, Diablo IV skull logo, red and black infernal color scheme, dark fantasy aesthetic, burning embers and hellfire effects, dramatic dark background, 3D cinematic game render' },
  { id: 'g44', name: '1000 Overwatch Coins', prompt: 'Overwatch 1000 coins product card. Stacked golden Overwatch coins with the game logo, colorful hero silhouettes in background, orange and blue team color accents, futuristic clean design, dark background with golden glow, 3D product render, professional quality' },
  { id: 'g45', name: '5000 Overwatch Coins', prompt: 'Overwatch 5000 coins premium pack. Golden coin fountain with Overwatch hero emblems orbiting, colorful ability effects in red blue green, premium gold and white color scheme, epic gaming aesthetic, dark background with golden spotlight, 3D cinematic render' },
  { id: 'g46', name: '200 Credits - Rocket League', prompt: 'Rocket League 200 credits product. Metallic Rocket League credit token with car boost flame effect, soccer ball and rocket car silhouette, orange and blue accent colors, dynamic speed blur effect, dark background with orange glow, 3D render' },
  { id: 'g47', name: '11000 Credits - Rocket League', prompt: 'Rocket League 11000 credits premium pack. Rocket league car jumping through giant ring of credit tokens, explosive boost effects, orange blue and white dynamic colors, high speed action aesthetic, dark arena background with dramatic lighting, 3D cinematic render' },
  { id: 'g48', name: '1000 Silver - Destiny 2', prompt: 'Destiny 2 1000 silver product card. Glowing silver currency with Destiny 2 ghost companion floating, space and cosmic background elements, white silver and blue color scheme, sci-fi futuristic aesthetic, dark space background, 3D render' },
  { id: 'g49', name: 'FIFA Mobile Coins - 2M', prompt: 'FIFA Mobile 2 million coins product. Massive golden coin pile on a football pitch, football boot kicking gold coins upward, green and gold colors, mobile gaming aesthetic with phone frame, dark background with stadium lights, 3D dynamic render' },
  { id: 'g50', name: 'Gemas Clash Royale - 5000', prompt: 'Clash Royale 5000 gems mega pack. Royal treasury chest overflowing with brilliant purple gems, golden crown and scepter, king tower illuminated, purple gold and blue majestic colors, royal premium aesthetic, dark background with purple golden glow, 3D epic render' },
];

async function generateImage(productId: string, prompt: string, outputPath: string): Promise<boolean> {
  try {
    const escapedPrompt = prompt.replace(/"/g, '\\"');
    execSync(`z-ai image -p "${escapedPrompt}" -o "${outputPath}" -s 1024x1024`, {
      timeout: 120000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return true;
  } catch (error: any) {
    console.error(`  ERROR generating ${productId}: ${error.message}`);
    return false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log(`Starting generation of ${gamingProducts.length} GAMING product images...`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Delay between images: ${DELAY_MS}ms`);
  console.log('---');

  let success = 0;
  let failed = 0;
  const failedProducts: string[] = [];

  for (let i = 0; i < gamingProducts.length; i++) {
    const product = gamingProducts[i];
    const outputPath = path.join(OUTPUT_DIR, `${product.id}.png`);

    console.log(`[${i + 1}/${gamingProducts.length}] Generating: ${product.name}...`);

    const result = await generateImage(product.id, product.prompt, outputPath);

    if (result) {
      success++;
      console.log(`  OK - saved to ${outputPath}`);
    } else {
      failed++;
      failedProducts.push(product.id);
    }

    // Delay between requests (skip after last one)
    if (i < gamingProducts.length - 1) {
      console.log(`  Waiting ${DELAY_MS}ms...`);
      await sleep(DELAY_MS);
    }
  }

  console.log('---');
  console.log(`DONE! Success: ${success}, Failed: ${failed}`);
  if (failedProducts.length > 0) {
    console.log(`Failed products: ${failedProducts.join(', ')}`);
  }
}

main().catch(console.error);
