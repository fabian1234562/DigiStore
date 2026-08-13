import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUTDIR = '/home/z/my-project/public/products/gen';
const DELAY = 8000;

const PROMPTS = {
's17': 'Amazon Prime Video 1 month. Blue Prime Video card play button, shipping box transforming to screen, blue orange Amazon, dark background blue glow, 3D render',
's18': 'Amazon Prime Video 6 month. Six blue Prime tokens hexagonal pattern, golden crown badge, blue gold premium, dark background blue golden spotlight, 3D cinematic render',
's19': 'Paramount Plus 1 month. Blue white Paramount mountain logo card, streaming waves, blue white gold, premium streaming, dark background blue white glow, 3D render',
's20': 'Apple TV Plus 1 month. Sleek gray white Apple TV card content preview, Apple minimalist, silver white blue, premium clean, dark background white silver glow, 3D render',
's21': 'Hulu 1 month. Green Hulu logo card flowing content ribbons, streaming, green white vibrant, dark background green neon glow, 3D render',
's22': 'Hulu Plus Live TV 1 month. Green Hulu card live TV antenna broadcast waves, green white blue, live streaming, dark background green dynamic glow, 3D cinematic render',
's23': 'Peacock Premium 3 month. Colorful peacock feather pattern card NBC logo, rainbow iridescent on dark, peacock teal gold, premium streaming, 3D render',
's24': 'DAZN 1 month sports streaming. Red DAZN card boxing glove soccer ball, sports action, red black white, dynamic sports energy, dark background red athletic glow, 3D render',
's25': 'Star Plus 1 month. Blue gold Star Plus card star constellation, premium entertainment, blue gold white, dark background blue golden star glow, 3D render',
's26': 'Star Plus 6 month. Six golden stars arc with blue streaming card, premium half-year badge, blue gold luxury, dark background blue golden spotlight, 3D cinematic render',
's27': 'Crunchyroll Mega Fan 1 year. Annual anime streaming premium card, orange crystal with anime silhouettes, mega fan badge, orange black epic, dark background orange dramatic glow, 3D epic render',
's28': 'Disney Bundle triple card. Triple streaming card Disney Plus Hulu Max logos, three colored sections red green purple, bundle deal, dark background multicolor glow, 3D render',
's29': 'Paramount Plus 6 month. Blue mountain logo card six month premium badge, streaming waves, blue white gold, dark background blue golden glow, 3D cinematic render',
's30': 'Apple TV Plus 3 month. Three silver Apple TV tokens stacked, premium extended badge, silver white blue Apple, clean minimalist premium, dark background silver blue glow, 3D render',
'a1': 'Netflix Premium account 6 months guaranteed. Red Netflix membership card golden shield guarantee badge, red black gold premium, dark background red golden glow, 3D render',
'a2': 'Netflix Premium account 12 months. Annual red Netflix card platinum guarantee badge golden crown, red black gold luxury, dark background red golden spotlight, 3D cinematic render',
'a3': 'Spotify Premium account 6 months. Green Spotify membership guarantee shield, six green music discs, green black gold, dark background green golden glow, 3D render',
'a4': 'Spotify Premium account 12 months. Annual green Spotify membership platinum badge, 12 green tokens circle, green black gold luxury, dark background green golden spotlight, 3D cinematic render',
'a5': 'Disney Plus Premium 6 months account. Blue Disney Plus membership guarantee badge, magical castle sparkles, blue gold premium, dark background blue magical glow, 3D render',
'a6': 'Crunchyroll Premium 6 months account. Orange anime streaming membership guarantee shield, anime action lines, orange black dramatic, dark background orange neon glow, 3D render',
'gc17': 'Netflix gift card 15 dollars. Red Netflix card logo 15 USD, TV screen play button, red black white, streaming gift, dark background red glow, 3D render',
'gc18': 'Netflix gift card 30 dollars. Premium red Netflix card golden 30 USD badge, cinema popcorn screen, red black gold white premium, dark background red golden glow, 3D cinematic render',
'gc19': 'Epic Games gift card 10 dollars. Dark Epic Games card logo 10 USD, game controller Unreal Engine, dark blue white, PC gaming, dark background blue glow, 3D render',
'gc20': 'Epic Games gift card 25 dollars. Premium dark Epic Games card 25 USD golden badge, game character silhouettes, dark blue white gold premium, dark background blue golden glow, 3D render',
'gc21': 'Roblox gift card 10 dollars. Colorful Roblox card logo 10 USD, Robux coin character, red yellow blue vibrant, fun gaming, dark background colorful glow, 3D render',
'gc22': 'Roblox gift card 25 dollars. Premium colorful Roblox card 25 USD golden badge, Robux coin pile character, red yellow blue gold, dark background colorful golden glow, 3D render',
'gc23': 'Spotify gift card 15 dollars. Green Spotify card logo 15 USD, headphones music notes, green black white, music streaming gift, dark background green glow, 3D render',
'gc24': 'Nintendo eShop gift card 25 dollars. Red Nintendo eShop card logo 25 USD, Switch console silhouette, red white black Nintendo, dark background red glow, 3D render',
'gc25': 'Nintendo eShop gift card 50 dollars. Premium red Nintendo card golden 50 USD badge, Switch Joy-Cons, red white black gold luxury, dark background red golden glow, 3D cinematic render',
'sw1': 'Windows 11 Pro license key. Blue Windows 11 logo card golden Pro badge, holographic key icon, blue gold Microsoft, OS license, dark background blue golden glow, 3D render',
'sw2': 'Windows 10 Pro license key. Blue Windows 10 logo golden Pro badge, security shield, blue gold Microsoft, professional OS, dark background blue glow, 3D render',
'sw3': 'Windows 11 Home license key. Light blue Windows 11 Home card house icon, holographic key, light blue white Microsoft, home OS, dark background blue glow, 3D render',
'sw4': 'Microsoft Office 2024 Professional. Orange blue Office card Word Excel PowerPoint icons, Professional golden badge, orange blue gold premium, productivity, 3D cinematic render',
'sw5': 'Microsoft Office 2024 Home Student. Blue orange Office card student cap, Word Excel PowerPoint, blue orange white education, dark background blue orange glow, 3D render',
'sw6': 'Microsoft Office 365 annual 2 PCs. Cloud Office 365 card cloud icon 2 PC badges, blue orange gold premium, cloud productivity, dark background blue golden glow, 3D render',
'sw7': 'Adobe Creative Cloud annual. Dark Adobe Creative Cloud card rainbow gradient, Photoshop Illustrator Premiere icons, multicolor creative, dark background colorful glow, 3D cinematic render',
'sw8': 'Adobe Photoshop 2024 perpetual. Blue Adobe Photoshop card Ps logo creative tools, blue purple creative, photo editing, dark background blue purple glow, 3D render',
'sw9': 'NordVPN 2 year subscription. Dark blue NordVPN card golden map shield, encrypted lines, dark blue gold cybersecurity, VPN privacy, dark background blue golden glow, 3D render',
'sw10': 'NordVPN 1 year subscription. Dark blue NordVPN card shield globe, encrypted tunnel, dark blue gold premium, VPN security, dark background blue golden glow, 3D render',
'sw11': 'ExpressVPN 1 year subscription. Green ExpressVPN card network globe speed lines, encrypted connection, green dark cybersecurity, fast VPN, dark background green glow, 3D render',
'sw12': 'Kaspersky Total Security 1 year 3 PCs. Green Kaspersky card shield 3 PC badges, virus scan, green white security, antivirus, dark background green glow, 3D render',
'sw13': 'Bitdefender Premium Security 1 year 5 PCs. Red Bitdefender card dragon shield 5 PC badges, red dark premium security, dark background red golden glow, 3D cinematic render',
'sw14': 'Norton 360 Deluxe 1 year 3 PCs. Yellow Norton 360 card golden shield 3 PC icons, 360 protection circle, yellow dark security, dark background yellow glow, 3D render',
'sw15': 'Malwarebytes Premium 1 year 3 PCs. Blue Malwarebytes card bug shield 3 PC badges, malware scan, blue white security, dark background blue glow, 3D render',
'sw16': 'Avast Premium Security 1 year 1 PC. Orange Avast card shield virus scan graph, orange dark security, single PC protection, dark background orange glow, 3D render',
};

const queue = [];
for (const [id, prompt] of Object.entries(PROMPTS)) {
  const filepath = path.join(OUTDIR, `${id}.png`);
  if (fs.existsSync(filepath) && fs.statSync(filepath).size > 10000) continue;
  queue.push({ id, prompt, filepath });
}

console.log(`[RETRY] Queue: ${queue.length} images to generate`);
let success = 0, failed = 0;

for (let i = 0; i < queue.length; i++) {
  const { id, prompt, filepath } = queue[i];
  console.log(`[RETRY][${i+1}/${queue.length}] ${id}...`);
  let ok = false;
  for (let a = 1; a <= 3; a++) {
    try {
      execSync(`z-ai image -p "${prompt.replace(/"/g, '\\"')}" -o "${filepath}" -s 1024x1024`, { timeout: 90000, stdio: ['pipe','pipe','pipe'] });
      if (fs.existsSync(filepath) && fs.statSync(filepath).size > 10000) { ok = true; success++; console.log(`  OK ${id} (${fs.statSync(filepath).size}b)`); break; }
    } catch(e) { console.log(`  Attempt ${a} failed for ${id}`); try{fs.unlinkSync(filepath);}catch{} await new Promise(r=>setTimeout(r, 15000)); }
  }
  if (!ok) { failed++; console.log(`  FAIL ${id}`); }
  if (i < queue.length-1) await new Promise(r => setTimeout(r, DELAY));
}
console.log(`[RETRY] Done. OK:${success} FAIL:${failed}`);
console.log(`Total in gen/: ${fs.readdirSync(OUTDIR).filter(f=>f.endsWith('.png')).length}`);
