import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUTDIR = '/home/z/my-project/public/products/gen';
const DELAY = 5000;

const PROMPTS = {
'g16': 'Apex Legends 1000 coins product card. Stacked Apex Coins with red metallic finish, futuristic military aesthetic, red and black with orange accent lighting, dark gritty background, 3D render',
'g17': 'Apex Legends 2150 coins premium. Tower of red metallic Apex Coins with glowing edges, winged helmet emblem, red black and orange palette, dark background, 3D cinematic render',
'g18': 'PUBG Mobile 600 UC product card. Glowing orange UC currency chips stacked, military helmet and airdrop crate, orange and dark green, dark background with orange glow, 3D render',
'g19': 'PUBG Mobile 3250 UC mega pack. Open airdrop crate with glowing orange UC currency, golden parachute above, orange gold and dark green, 3D product render',
'g20': 'Free Fire 1000 diamonds. Brilliant cut diamond gems in red and blue, fire logo background, fiery orange and cool blue, dark background with flame effects, 3D render',
'g21': 'Free Fire 5600 diamonds premium. Massive treasure chest bursting with diamonds, fire and ice effects, red orange blue explosion, dark background, 3D cinematic render',
'g22': 'Among Us account complete skins. Colorful Among Us crewmates wearing premium skins and hats, space station corridor, vibrant red blue green yellow, fun playful 3D style',
'g23': 'Clash Royale 1400 gems. Glowing purple gems in chest, crown tower miniature, blue and purple magical lighting, card game battle aesthetic, dark background with purple neon glow, 3D render',
'g24': 'Mobile Legends 400 diamonds. Blue diamond floating above MOBA arena map, hero silhouette, blue and gold, magical particles, dark background with blue glow, 3D render',
'g25': 'Mobile Legends 2200 diamonds premium. Cluster of brilliant blue diamonds with golden crown, epic hero sword in crystal, blue gold luxury, dark background, 3D cinematic render',
'g26': 'Brawl Stars 170 gems. Small pile of bright green gems with brawler fist, colorful cartoon background, green and yellow vibrant, fun energetic 3D style',
'g27': 'Brawl Stars 1700 gems mega pack. Massive gem mine with green gems and golden nuggets, trophy cup overflowing, vibrant green gold blue, exciting lighting, 3D premium render',
'g28': 'CS2 premium skins package. Display case with CS2 weapon skins AK-47 AWP with neon designs, holographic stickers, blue and orange neon, 3D game asset showcase',
'g29': 'CS2 case keys bundle five. Five golden CS2 case keys in fan pattern, unique colored gems, golden metallic finish, dark background with golden glow, 3D render',
'g30': 'GTA V Megalodon Shark Card. Massive megalodon shark swimming through ocean of money, blue and green ocean with golden glow, cinematic underwater, dark deep blue, 3D render',
'g31': 'GTA V Whale Shark Card. Whale shark gliding through clouds of golden coins, city skyline silhouette, teal and gold, dreamy premium, dark atmospheric background, 3D cinematic render',
'g32': 'Call of Duty Warzone 2400 CoD Points. Military dog tags with hologram, tactical green and black, bullet casings and military stencil, dramatic spotlight dark background, 3D military render',
'g33': 'Warzone MW3 premium account. Tactical operator skull mask with glowing red eyes, military rank insignias, dark green black with red accent, elite special forces, dark background, 3D render',
'g34': 'Honkai Star Rail Oneiric Shard. Ethereal purple and blue crystal shards in cosmic space, star trails, anime-game cosmic theme, purple blue nebula, dark space background, 3D anime render',
'g35': 'Honkai Star Rail Express Supply Pass. Futuristic train ticket card with holographic star rail, cosmic purple and gold, train crossing starry sky, premium metallic card, dark space background, 3D render',
'g36': 'Wuthering Waves Astrite pack. Glowing teal and white crystals with wind energy swirls, ethereal fantasy, teal white with golden accents, dark background with teal glow, 3D render',
'g37': 'EA FC 25 2800 coins. Futuristic football stadium with golden FC coins raining, green pitch and gold, dynamic sports energy, dark background with green gold stadium lights, 3D render',
'g38': 'EA FC 25 5600 coins premium. Golden trophy cup overflowing with FC coins, football boot kicking coin splash, green gold premium, championship celebration, dark background, 3D cinematic render',
'g39': 'Clash of Clans 1400 gems. Bright pink and purple gems spilling from barbarian helmet, village tower, medieval fantasy, pink purple brown, magical sparkle, dark background, 3D render',
'g40': 'Clash of Clans 5000 gems mega. Enormous gem mountain with pink purple green crystals, gold mine cart full of gems, king silhouette, vibrant fantasy, epic lighting, 3D premium render',
'g41': 'Wild Rift Wild Tokens. Glowing green tokens with mobile gaming aesthetic, green and gold, dynamic energy effects, dark background with green neon glow, 3D render',
'g42': 'Diablo IV standard edition account. Dark demonic portal with hellfire glow, skull logo, red black infernal, dark fantasy, burning embers, dramatic dark background, 3D cinematic render',
'g43': 'Overwatch 1000 coins. Stacked golden Overwatch coins with game logo, colorful hero silhouettes, orange blue team color accents, futuristic clean design, dark background golden glow, 3D render',
'g44': 'Overwatch 5000 coins premium. Golden coin fountain with hero emblems orbiting, colorful ability effects red blue green, premium gold white, epic gaming, dark background golden spotlight, 3D cinematic render',
'g45': 'Rocket League 200 credits. Metallic credit token with car boost flame, soccer ball and rocket car silhouette, orange blue accents, dynamic speed blur, dark background with orange glow, 3D render',
'g46': 'Rocket League 11000 credits premium. Car jumping through giant ring of credit tokens, explosive boost, orange blue white dynamic, high speed action, dark arena dramatic lighting, 3D cinematic render',
'g47': 'Destiny 2 1000 silver. Glowing silver currency with ghost companion floating, space cosmic elements, white silver blue, sci-fi futuristic, dark space background, 3D render',
'g48': 'FIFA Mobile 2 million coins. Massive golden coin pile on football pitch, boot kicking gold coins upward, green and gold, mobile gaming aesthetic, dark background stadium lights, 3D render',
'g49': 'Clash Royale 5000 gems mega. Royal treasury chest overflowing with purple gems, golden crown and scepter, king tower, purple gold blue majestic, dark background, 3D epic render',
'g50': 'League of Legends Wild Rift Wild Tokens 2. Glowing green tokens with LoL WR logo, mobile gaming phone silhouette, green and gold, dynamic energy, dark background with green neon glow, 3D render',
};

const queue = [];
for (const [id, prompt] of Object.entries(PROMPTS)) {
  const filepath = path.join(OUTDIR, `${id}.png`);
  if (fs.existsSync(filepath) && fs.statSync(filepath).size > 10000) continue;
  queue.push({ id, prompt, filepath });
}

console.log(`[PART1] Queue: ${queue.length} images`);
let success = 0, failed = 0;

for (let i = 0; i < queue.length; i++) {
  const { id, prompt, filepath } = queue[i];
  console.log(`[PART1][${i+1}/${queue.length}] ${id}...`);
  let ok = false;
  for (let a = 1; a <= 2; a++) {
    try {
      execSync(`z-ai image -p "${prompt.replace(/"/g, '\\"')}" -o "${filepath}" -s 1024x1024`, { timeout: 90000, stdio: ['pipe','pipe','pipe'] });
      if (fs.existsSync(filepath) && fs.statSync(filepath).size > 10000) { ok = true; success++; console.log(`  OK ${id}`); break; }
    } catch(e) { console.log(`  Retry ${a} for ${id}`); try{fs.unlinkSync(filepath);}catch{} }
  }
  if (!ok) { failed++; console.log(`  FAIL ${id}`); }
  if (i < queue.length-1) await new Promise(r => setTimeout(r, DELAY));
}
console.log(`[PART1] Done. OK:${success} FAIL:${failed}`);
