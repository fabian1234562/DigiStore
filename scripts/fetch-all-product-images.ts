// Fetch real product images for all platforms using z-ai image-search
// Runs sequentially with delays to avoid rate limiting

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface ImageResult {
  url: string;
  source: string;
  width: string;
  height: string;
}

interface PlatformQuery {
  platform: string;
  query: string;
}

const PLATFORMS: PlatformQuery[] = [
  // GAMING
  { platform: 'Fortnite', query: 'Fortnite V-Bucks official digital game currency card artwork' },
  { platform: 'Roblox', query: 'Roblox Robux official digital gift card' },
  { platform: 'Valorant', query: 'Valorant VP points official game currency card' },
  { platform: 'Minecraft', query: 'Minecraft Minecoins official digital currency artwork' },
  { platform: 'League of Legends', query: 'League of Legends Riot Points RP official card' },
  { platform: 'Genshin Impact', query: 'Genshin Impact Genesis Crystals official digital artwork' },
  { platform: 'EA FC 25', query: 'EA FC 25 FIFA Ultimate Team points card' },
  { platform: 'Apex Legends', query: 'Apex Legends Coins official digital currency pack' },
  { platform: 'PUBG Mobile', query: 'PUBG Mobile UC unlimited cash digital card' },
  { platform: 'Call of Duty', query: 'Call of Duty COD Points official digital card' },
  { platform: 'Free Fire', query: 'Free Fire diamonds official digital top up card' },
  { platform: 'Among Us', query: 'Among Us stars official digital currency artwork' },
  { platform: 'Clash Royale', query: 'Clash Royale gems official digital top up card' },
  { platform: 'Mobile Legends', query: 'Mobile Legends Bang Bang diamonds digital top up' },
  { platform: 'Brawl Stars', query: 'Brawl Stars gems official digital pack artwork' },
  { platform: 'Counter-Strike 2', query: 'Counter-Strike 2 CS2 weapon skins case official artwork' },
  { platform: 'GTA V', query: 'GTA V Shark Card official digital artwork' },
  { platform: 'Honkai Star Rail', query: 'Honkai Star Rail Oneiric Shard official digital currency' },
  { platform: 'Wuthering Waves', query: 'Wuthering Waves Astrite official game currency artwork' },
  { platform: 'Clash of Clans', query: 'Clash of Clans gems official digital top up artwork' },
  { platform: 'FIFA Mobile', query: 'FIFA Mobile coins points official digital card' },
  { platform: 'Wild Rift', query: 'League of Legends Wild Rift wildcore official artwork' },
  { platform: 'Diablo IV', query: 'Diablo IV platinum official digital currency artwork' },
  { platform: 'Overwatch 2', query: 'Overwatch 2 coins official digital currency pack' },
  { platform: 'Rocket League', query: 'Rocket League credits official digital top up artwork' },
  { platform: 'Destiny 2', query: 'Destiny 2 silver official digital currency artwork' },

  // STREAMING
  { platform: 'Netflix', query: 'Netflix premium subscription official digital card' },
  { platform: 'Spotify', query: 'Spotify Premium official subscription digital card artwork' },
  { platform: 'Disney+', query: 'Disney Plus subscription official digital card artwork' },
  { platform: 'HBO Max', query: 'HBO Max subscription official digital artwork' },
  { platform: 'Crunchyroll', query: 'Crunchyroll Premium subscription official digital card' },
  { platform: 'Amazon Prime', query: 'Amazon Prime Video subscription official card artwork' },
  { platform: 'Paramount+', query: 'Paramount Plus subscription official digital card' },
  { platform: 'Apple TV+', query: 'Apple TV Plus subscription official digital artwork' },
  { platform: 'Twitch', query: 'Twitch subscription official digital gift card' },
  { platform: 'Hulu', query: 'Hulu subscription official digital card artwork' },
  { platform: 'Max', query: 'Max HBO streaming subscription official digital card' },
  { platform: 'Peacock', query: 'Peacock Premium streaming subscription official card' },
  { platform: 'DAZN', query: 'DAZN sports streaming subscription official artwork' },
  { platform: 'Star+', query: 'Star Plus Disney streaming subscription official card' },

  // GIFT CARDS
  { platform: 'Steam', query: 'Steam wallet gift card official digital artwork' },
  { platform: 'PlayStation', query: 'PlayStation Store gift card official digital artwork' },
  { platform: 'Xbox', query: 'Xbox gift card official digital artwork' },
  { platform: 'Nintendo', query: 'Nintendo eShop gift card official digital artwork' },
  { platform: 'Google Play', query: 'Google Play gift card official digital artwork' },
  { platform: 'Apple', query: 'Apple App Store iTunes gift card official artwork' },
  { platform: 'Amazon', query: 'Amazon gift card official digital artwork' },
  { platform: 'Epic Games', query: 'Epic Games gift card official digital artwork' },
  { platform: 'Riot Games', query: 'Riot Games gift card official digital artwork' },
  { platform: 'Discord', query: 'Discord gift card Nitro official digital artwork' },
  { platform: 'Visa', query: 'Visa prepaid gift card official digital artwork' },
  { platform: 'PayPal', query: 'PayPal gift card official digital artwork' },

  // SOFTWARE
  { platform: 'Windows', query: 'Windows 11 Pro license key official digital product' },
  { platform: 'Microsoft', query: 'Microsoft Office 365 official digital license product' },
  { platform: 'Adobe', query: 'Adobe Creative Cloud subscription official digital artwork' },
  { platform: 'VPN', query: 'VPN service premium subscription digital product artwork' },
  { platform: 'Antivirus', query: 'premium antivirus software license digital product artwork' },
  { platform: 'NordVPN', query: 'NordVPN premium subscription official digital product' },
  { platform: 'Kaspersky', query: 'Kaspersky antivirus premium license digital product' },
  { platform: 'Malwarebytes', query: 'Malwarebytes premium antivirus license digital product' },
  { platform: 'Office', query: 'Microsoft Office 2024 professional license digital product' },
  { platform: 'Avast', query: 'Avast premium antivirus security license digital product' },
  { platform: 'Bitdefender', query: 'Bitdefender Total Security license digital product' },
  { platform: 'Norton', query: 'Norton 360 Deluxe antivirus security digital product' },

  // SUBSCRIPTIONS
  { platform: 'YouTube', query: 'YouTube Premium subscription official digital artwork' },
  { platform: 'Canva', query: 'Canva Pro subscription official digital product artwork' },
  { platform: 'EA', query: 'EA Play Pro subscription official digital artwork' },
  { platform: 'AI', query: 'AI artificial intelligence tools premium subscription digital' },
  { platform: 'Cloud', query: 'Cloud gaming subscription service official digital artwork' },

  // ACCOUNTS
  { platform: 'Social', query: 'social media accounts premium subscription digital product' },
];

const DELAY_MS = 18000; // 18 seconds between requests
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 30000; // 30 seconds between retries

function searchImage(query: string): ImageResult | null {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = execSync(
        `z-ai image-search -q "${query}" --count 1 --gl us --no-rank`,
        { encoding: 'utf-8', timeout: 120000 }
      );
      const parsed = JSON.parse(result);
      if (parsed.success && parsed.results && parsed.results.length > 0) {
        return {
          url: parsed.results[0].original_url,
          source: parsed.results[0].source,
          width: parsed.results[0].original_width,
          height: parsed.results[0].original_height,
        };
      }
    } catch (e: any) {
      const errMsg = String(e);
      if (errMsg.includes('429')) {
        console.log(`  ⚠ Rate limited, waiting ${RETRY_DELAY_MS/1000}s before retry ${attempt}/${MAX_RETRIES}...`);
        if (attempt < MAX_RETRIES) {
          execSync(`sleep ${RETRY_DELAY_MS / 1000}`);
        }
      } else {
        console.log(`  ✗ Error: ${errMsg.substring(0, 100)}`);
      }
    }
  }
  return null;
}

async function main() {
  console.log(`Starting image search for ${PLATFORMS.length} platforms...`);
  console.log(`Delay between requests: ${DELAY_MS/1000}s`);
  console.log('---');

  const imageMap: Record<string, string> = {};
  let success = 0;
  let failed = 0;

  for (let i = 0; i < PLATFORMS.length; i++) {
    const { platform, query } = PLATFORMS[i];
    process.stdout.write(`[${i+1}/${PLATFORMS.length}] ${platform}... `);

    const result = searchImage(query);
    if (result) {
      imageMap[platform] = result.url;
      success++;
      console.log(`✓ (${result.width}x${result.height} from ${result.source})`);
    } else {
      failed++;
      console.log(`✗ FAILED`);
    }

    // Delay before next request (except after last)
    if (i < PLATFORMS.length - 1) {
      execSync(`sleep ${DELAY_MS / 1000}`);
    }
  }

  console.log('---');
  console.log(`Done! Success: ${success}, Failed: ${failed}`);

  // Save the image map
  const outputPath = path.join(process.cwd(), 'public', 'products', 'real-image-map.json');
  fs.writeFileSync(outputPath, JSON.stringify(imageMap, null, 2));
  console.log(`Image map saved to: ${outputPath}`);
}

main();
