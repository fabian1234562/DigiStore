import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUTDIR = '/home/z/my-project/public/products/gen';
const DELAY = 5000;

const PROMPTS = {
's1': 'Netflix Premium 1 month. Red Netflix logo glowing on premium black card, cinematic film reel, red and black, streaming, dark background red neon glow, 3D render',
's2': 'Netflix Premium 3 month. Three stacked red Netflix cards fanning out, play button icon, red and black with golden accent, dark luxurious background, 3D cinematic render',
's3': 'Netflix Premium 6 month. Half year Netflix premium with golden crown badge, six red tokens hexagon, red black gold, dark background warm red glow, 3D render',
's4': 'Netflix Premium 1 year. Annual Netflix mega card with golden annual badge, 12 red coins calendar ring, red black gold luxury, dark background red golden spotlight, 3D epic render',
's5': 'Spotify Premium 1 month. Green Spotify logo on dark card with sound wave, music notes floating, green and black, music streaming, dark background green neon glow, 3D render',
's6': 'Spotify Premium 3 month. Three green Spotify tokens stacked, equalizer bars, green black white, dark background vibrant green glow, 3D render',
's7': 'Spotify Premium 6 month. Six green music discs in circle, Spotify green glow center, green and dark, dark background green radial glow, 3D cinematic render',
's8': 'Spotify Premium Duo 3 month. Two interlocking green Spotify circles, headphones music notes, green dark teal, premium couple, dark background green dual glow, 3D render',
's9': 'Spotify Premium Family 3 month. Family group silhouette with green music aura, multiple headphones, green warm family colors, dark background green ambient glow, 3D render',
's10': 'Disney Plus Premium 1 month. Magical Disney castle with blue streaming glow, premium blue card, blue gold royal, magical sparkle, dark background blue magical glow, 3D cinematic render',
's11': 'Disney Plus Premium 3 month. Three blue Disney Plus tokens with castle silhouette, magical star particles, blue gold premium, dark background blue gold glow, 3D render',
's12': 'Disney Plus Premium 6 month. Six blue crystals with Disney castle reflection, deep blue gold, magical sparkle, dark background royal blue glow, 3D cinematic render',
's13': 'Crunchyroll Premium 1 month. Orange Crunchyroll logo on dark card, anime speed lines, orange and black, anime streaming, dark background orange neon glow, 3D render',
's14': 'Crunchyroll Premium 3 month. Three orange anime-inspired cards with shonen silhouettes, anime energy aura, orange black dramatic, dark background orange dynamic glow, 3D render',
's15': 'Max HBO 1 month. Premium dark card with golden HBO Max logo, film strip border, purple and gold, premium streaming, dark background purple golden glow, 3D render',
's16': 'Max HBO 3 month. Three purple HBO streaming tokens stacked, golden premium badge, purple gold dark, dark background purple golden glow, 3D cinematic render',
's17': 'Amazon Prime Video 1 month. Blue Prime Video card with play button, shipping box to screen, blue orange Amazon, dark background blue glow, 3D render',
's18': 'Amazon Prime Video 6 month. Six blue Prime tokens hexagonal pattern, golden crown badge, blue gold premium, dark background blue golden spotlight, 3D cinematic render',
's19': 'Paramount Plus 1 month. Blue white Paramount mountain logo card, streaming waves, blue white gold, premium streaming, dark background blue white glow, 3D render',
's20': 'Apple TV Plus 1 month. Sleek gray white Apple TV card with content preview, Apple minimalist, silver white blue, premium clean, dark background white silver glow, 3D render',
's21': 'Hulu 1 month. Green Hulu logo card with flowing content ribbons, streaming, green white vibrant, dark background green neon glow, 3D render',
's22': 'Hulu Plus Live TV 1 month. Green Hulu card with live TV antenna broadcast waves, green white blue, live streaming, dark background green dynamic glow, 3D cinematic render',
's23': 'Peacock Premium 3 month. Colorful peacock feather pattern card NBC logo, rainbow iridescent on dark, peacock teal gold, premium streaming, 3D render',
's24': 'DAZN 1 month sports streaming. Red DAZN card with boxing glove soccer ball, sports action, red black white, dynamic sports energy, dark background red athletic glow, 3D render',
's25': 'Star Plus 1 month. Blue gold Star Plus card with star constellation, premium entertainment, blue gold white, dark background blue golden star glow, 3D render',
's26': 'Star Plus 6 month. Six golden stars in arc with blue streaming card, premium half-year badge, blue gold luxury, dark background blue golden spotlight, 3D cinematic render',
's27': 'Crunchyroll Mega Fan 1 year. Annual anime streaming premium card, orange crystal with anime silhouettes, mega fan badge, orange black epic, dark background orange dramatic glow, 3D epic render',
's28': 'Disney Bundle triple card. Triple streaming card Disney Plus Hulu Max logos, three colored sections red green purple, bundle deal, dark background multicolor glow, 3D render',
's29': 'Paramount Plus 6 month. Blue mountain logo card with six month premium badge, streaming waves, blue white gold, dark background blue golden glow, 3D cinematic render',
's30': 'Apple TV Plus 3 month. Three silver Apple TV tokens stacked, premium extended badge, silver white blue Apple, clean minimalist premium, dark background silver blue glow, 3D render',
'a1': 'Netflix Premium account 6 months guaranteed. Red Netflix membership card with golden shield guarantee badge, red black gold premium, dark background red golden glow, 3D render',
'a2': 'Netflix Premium account 12 months. Annual red Netflix card with platinum guarantee badge golden crown, red black gold luxury, dark background red golden spotlight, 3D cinematic render',
'a3': 'Spotify Premium account 6 months. Green Spotify membership with guarantee shield, six green music discs, green black gold, dark background green golden glow, 3D render',
'a4': 'Spotify Premium account 12 months. Annual green Spotify membership platinum badge, 12 green tokens circle, green black gold luxury, dark background green golden spotlight, 3D cinematic render',
'a5': 'Disney Plus Premium 6 months account. Blue Disney Plus membership guarantee badge, magical castle sparkles, blue gold premium, dark background blue magical glow, 3D render',
'a6': 'Crunchyroll Premium 6 months account. Orange anime streaming membership guarantee shield, anime action lines, orange black dramatic, dark background orange neon glow, 3D render',
'a7': 'Fortnite account exclusive skins. Colorful Fortnite character display with multiple legendary skins, blue purple gaming, multiple character showcase, dark background colorful game glow, 3D game render',
'a8': 'Minecraft Java Premium account. Minecraft Java Edition premium card diamond armor, grass block pickaxe, green gold, pixel-art-meets-3D, dark background, 3D render',
'a9': 'Roblox Premium 12 months. Golden Roblox membership annual badge, Robux coins Builder Club crown, gold red premium, dark background golden glow, 3D cinematic render',
'a10': 'Valorant account 50 plus skins. Red black Valorant premium card, weapon skin gallery, red teal black gaming, elite gaming aesthetic, dark background red neon glow, 3D epic render',
'a11': 'Genshin Impact account AR55. Blue gold Genshin account card high adventure rank badge, character silhouettes, blue gold white anime, dark background blue golden glow, 3D anime render',
'a12': 'Max HBO 6 months guaranteed. Purple HBO Max membership guarantee shield, premium streaming badge, purple gold dark, dark background purple golden glow, 3D render',
'a13': 'Verified Instagram account. Instagram card with blue verified checkmark badge, profile silhouette blue ring, pink orange blue, social media premium, dark background gradient glow, 3D render',
'a14': 'TikTok account with followers. TikTok card with music note heart icons, follower count graphic, pink cyan black, viral social media, dark background pink cyan glow, 3D render',
'a15': 'Discord Nitro 12 months. Discord Nitro premium card controller badge, 12 month tokens, purple black gold, gaming community premium, dark background purple glow, 3D cinematic render',
};

const queue = [];
for (const [id, prompt] of Object.entries(PROMPTS)) {
  const filepath = path.join(OUTDIR, `${id}.png`);
  if (fs.existsSync(filepath) && fs.statSync(filepath).size > 10000) continue;
  queue.push({ id, prompt, filepath });
}

console.log(`[PART2] Queue: ${queue.length} images`);
let success = 0, failed = 0;

for (let i = 0; i < queue.length; i++) {
  const { id, prompt, filepath } = queue[i];
  console.log(`[PART2][${i+1}/${queue.length}] ${id}...`);
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
console.log(`[PART2] Done. OK:${success} FAIL:${failed}`);
