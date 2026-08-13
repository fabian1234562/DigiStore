import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUTDIR = '/home/z/my-project/public/products/gen';
const DELAY = 5000;

const PROMPTS = {
'gc1': 'Steam gift card 10 dollars. Dark blue Steam card 10 USD Steam logo, gaming controller silhouette, dark blue green, PC gaming, dark background blue glow, 3D render',
'gc2': 'Steam gift card 20 dollars. Dark blue Steam card 20 USD, gaming headset game library, dark blue green vibrant, premium gaming, dark background blue green glow, 3D render',
'gc3': 'Steam gift card 50 dollars. Premium dark blue Steam card golden 50 USD badge, full gaming PC, dark blue green gold luxury, dark background blue golden glow, 3D cinematic render',
'gc4': 'Steam gift card 100 dollars. Ultimate Steam 100 USD gold-edged card platinum badge, dark blue green gold luxury, dark background blue golden spotlight, 3D epic render',
'gc5': 'PlayStation gift card 10 dollars. Blue PlayStation card PS logo 10 USD, DualSense controller silhouette, blue white Sony, console gaming, dark background blue glow, 3D render',
'gc6': 'PlayStation gift card 25 dollars. Blue PlayStation card 25 USD golden badge, PS5 silhouette, blue white gold premium, dark background blue golden glow, 3D render',
'gc7': 'PlayStation gift card 50 dollars. Premium blue PlayStation card golden 50 USD badge crown, DualSense PS5, blue white gold luxury, dark background blue golden spotlight, 3D cinematic render',
'gc8': 'Xbox gift card 15 dollars. Green Xbox card Xbox logo 15 USD, controller silhouette, green white Microsoft, console gaming, dark background green glow, 3D render',
'gc9': 'Xbox gift card 25 dollars. Green Xbox card 25 USD golden badge, Xbox Series X silhouette, green white gold premium, dark background green golden glow, 3D render',
'gc10': 'Xbox gift card 50 dollars. Premium green Xbox card golden 50 USD badge, Xbox Series X controller, green white gold luxury, dark background green golden spotlight, 3D cinematic render',
'gc11': 'Google Play gift card 10 dollars. Colorful Google Play card multicolor triangle logo 10 USD, Android robot, multicolor vibrant, app store, dark background colorful glow, 3D render',
'gc12': 'Google Play gift card 25 dollars. Premium colorful Google Play card 25 USD golden badge, Android app icons floating, multicolor gold premium, dark background colorful golden glow, 3D render',
'gc13': 'Apple iTunes gift card 25 dollars. Sleek silver Apple card Apple logo 25 USD, music note app icons, silver white light blue Apple, premium clean, dark background silver glow, 3D render',
'gc14': 'Apple iTunes gift card 50 dollars. Premium silver Apple card golden 50 USD badge, iPhone AirPods silhouette, silver gold white luxury Apple, dark background silver golden glow, 3D cinematic render',
'gc15': 'Amazon gift card 25 dollars. Blue Amazon card smile logo 25 USD, shopping box delivery truck, blue orange white, shopping, dark background blue orange glow, 3D render',
'gc16': 'Amazon gift card 50 dollars. Premium blue Amazon card golden 50 USD badge, shopping cart overflowing, blue orange gold white, dark background blue golden glow, 3D cinematic render',
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
'sw17': 'Windows 10 11 Pro Pack 2 licenses. Twin blue Windows Pro license cards, 2 golden key icons, blue gold Microsoft premium, dual license, dark background blue golden glow, 3D cinematic render',
'sw18': 'Microsoft Office 2021 Professional. Classic orange blue Office 2021 card Professional golden badge, orange blue gold classic Office, dark background orange blue glow, 3D render',
'sw19': 'Surfshark VPN 2 year subscription. Teal Surfshark card shark fin wave, encrypted lines, teal dark cybersecurity, ocean VPN, dark background teal glow, 3D render',
'sw20': 'CyberGhost VPN 2 year subscription. Purple CyberGhost card ghost icon globe, encrypted tunnel, purple dark cybersecurity, privacy VPN, dark background purple glow, 3D render',
'sub1': 'YouTube Premium 1 month. Red YouTube Premium card premium badge, ad-free icon, play button music note, red white dark, premium video streaming, dark background red glow, 3D render',
'sub2': 'YouTube Premium 3 month. Three red YouTube Premium tokens golden 3-month badge, ad-free icons, red white gold premium, dark background red golden glow, 3D render',
'sub3': 'YouTube Premium 6 month. Six red YouTube tokens hexagonal golden badge, music video icons, red white gold premium, dark background red golden spotlight, 3D cinematic render',
'sub4': 'Discord Nitro 1 month. Purple Discord Nitro card golden Nitro badge, custom emoji HD streaming icons, purple black gold, gaming community premium, dark background purple glow, 3D render',
'sub5': 'Discord Nitro 3 month. Three purple Discord Nitro tokens golden 3-month badge, server boost icons, purple black gold premium, dark background purple golden glow, 3D render',
'sub6': 'Discord Nitro 12 month. Twelve purple Discord tokens circle platinum annual badge, server boost crown, purple black gold luxury, dark background purple golden spotlight, 3D cinematic render',
'sub7': 'Xbox Game Pass Ultimate 1 month. Green Xbox Game Pass card controller cloud, game library icons, green white gold, cloud gaming premium, dark background green glow, 3D render',
'sub8': 'Xbox Game Pass Ultimate 3 months. Three green Game Pass tokens golden badge, controller cloud PC icons, green white gold premium, dark background green golden glow, 3D render',
'sub9': 'Twitch Turbo 1 month. Purple Twitch Turbo card Turbo badge, ad-free chat icons, purple teal Twitch, streaming premium, dark background purple teal glow, 3D render',
'sub10': 'Twitch Turbo 3 month. Three purple Twitch tokens golden 3-month badge, emote icons, purple teal gold premium, dark background purple golden glow, 3D render',
'sub11': 'Canva Pro 1 year. Cyan Canva Pro card golden annual badge, design templates tools icons, cyan purple gold creative, premium design tool, dark background cyan golden glow, 3D render',
'sub12': 'Canva Pro 6 month. Cyan Canva card design elements 6-month badge, template icons, cyan gold premium, dark background cyan golden glow, 3D render',
'sub13': 'PlayStation Plus Premium 1 month. Blue PlayStation Plus Premium card golden premium badge, game library icons, blue white gold Sony, console premium, dark background blue golden glow, 3D render',
'sub14': 'PlayStation Plus Premium 1 year. Premium blue PlayStation Plus card platinum annual badge, PS5 game library, blue white gold luxury, dark background blue golden spotlight, 3D cinematic render',
'sub15': 'EA Play Pro 1 month. Dark EA Play Pro card golden Pro badge, game controller titles, dark blue gold premium, gaming subscription, dark background blue golden glow, 3D render',
'sub16': 'EA Play Pro 3 month. Three dark EA Play tokens golden 3-month Pro badge, game icons, dark blue gold white premium, dark background blue golden glow, 3D render',
'sub17': 'Nintendo Switch Online 1 year. Red Nintendo Switch Online card annual badge, Switch console retro controllers, red white black Nintendo, dark background red glow, 3D render',
'sub18': 'Nintendo Switch Online Expansion Pack. Premium red Nintendo card golden Expansion Pack badge, N64 GameBoy icons, red black gold luxury, dark background red golden glow, 3D cinematic render',
'sub19': 'ChatGPT Plus 1 month. Dark ChatGPT Plus card golden Plus badge AI brain icon, neural network, dark green gold AI, dark background green golden glow, 3D render',
'sub20': 'Midjourney 1 month. Blue Midjourney card golden badge AI art icons, artistic creative visualization, blue purple gold AI art, creative AI, dark background blue purple glow, 3D render',
};

const queue = [];
for (const [id, prompt] of Object.entries(PROMPTS)) {
  const filepath = path.join(OUTDIR, `${id}.png`);
  if (fs.existsSync(filepath) && fs.statSync(filepath).size > 10000) continue;
  queue.push({ id, prompt, filepath });
}

console.log(`[PART3] Queue: ${queue.length} images`);
let success = 0, failed = 0;

for (let i = 0; i < queue.length; i++) {
  const { id, prompt, filepath } = queue[i];
  console.log(`[PART3][${i+1}/${queue.length}] ${id}...`);
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
console.log(`[PART3] Done. OK:${success} FAIL:${failed}`);
