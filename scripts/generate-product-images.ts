// Generate professional product images for all platforms as SVGs -> PNGs via next.config rewrites or direct SVG serve
// We'll generate SVG files that look like premium digital product cards

import fs from 'fs';
import path from 'path';

interface PlatformConfig {
  name: string;
  colors: [string, string]; // [primary, secondary]
  icon: string;
  subtitle: string;
}

const PLATFORMS: Record<string, PlatformConfig> = {
  // GAMING
  'Fortnite': { name: 'Fortnite', colors: ['#0053FF', '#9B30FF'], icon: '🎯', subtitle: 'V-BUCKS' },
  'Roblox': { name: 'Roblox', colors: ['#E2231A', '#FF4757'], icon: '🧱', subtitle: 'ROBUX' },
  'Valorant': { name: 'Valorant', colors: ['#FF4655', '#0F1923'], icon: '🔫', subtitle: 'VALORANT POINTS' },
  'Minecraft': { name: 'Minecraft', colors: ['#3CB371', '#2D5F2D'], icon: '⛏️', subtitle: 'MINECOINS' },
  'League of Legends': { name: 'League of Legends', colors: ['#C89B3C', '#0A1428'], icon: '⚔️', subtitle: 'RIOT POINTS' },
  'Genshin Impact': { name: 'Genshin Impact', colors: ['#3B82F6', '#1E3A5F'], icon: '⭐', subtitle: 'GENESIS CRYSTALS' },
  'EA FC 25': { name: 'EA FC 25', colors: ['#FF6B00', '#1A1A2E'], icon: '⚽', subtitle: 'FC POINTS' },
  'Apex Legends': { name: 'Apex Legends', colors: ['#DA2928', '#2D2D2D'], icon: '🏆', subtitle: 'APEX COINS' },
  'PUBG Mobile': { name: 'PUBG Mobile', colors: ['#F2A900', '#2B2B2B'], icon: '🪖', subtitle: 'UC' },
  'Call of Duty': { name: 'Call of Duty', colors: ['#4A90D9', '#1C1C1C'], icon: '🎖️', subtitle: 'COD POINTS' },
  'Free Fire': { name: 'Free Fire', colors: ['#FF6B00', '#1A0A00'], icon: '🔥', subtitle: 'DIAMONDS' },
  'Among Us': { name: 'Among Us', colors: ['#E74C3C', '#2C3E50'], icon: '🚀', subtitle: 'STARS' },
  'Clash Royale': { name: 'Clash Royale', colors: ['#0070DD', '#1A237E'], icon: '👑', subtitle: 'GEMS' },
  'Mobile Legends': { name: 'Mobile Legends', colors: ['#2979FF', '#0D47A1'], icon: '⚡', subtitle: 'DIAMONDS' },
  'Brawl Stars': { name: 'Brawl Stars', colors: ['#FFD700', '#FF6B00'], icon: '💥', subtitle: 'GEMS' },
  'Counter-Strike 2': { name: 'Counter-Strike 2', colors: ['#DE9B35', '#2B2B2B'], icon: '🎯', subtitle: 'SKINS' },
  'GTA V': { name: 'GTA V', colors: ['#00B4D8', '#023E8A'], icon: '🌃', subtitle: 'SHARK CARDS' },
  'Honkai Star Rail': { name: 'Honkai Star Rail', colors: ['#7C3AED', '#1E1B4B'], icon: '🌌', subtitle: 'JADE' },
  'Wuthering Waves': { name: 'Wuthering Waves', colors: ['#06B6D4', '#164E63'], icon: '🌊', subtitle: 'ASTRALITE' },
  'Clash of Clans': { name: 'Clash of Clans', colors: ['#F59E0B', '#78350F'], icon: '🏰', subtitle: 'GEMS' },
  'FIFA Mobile': { name: 'FIFA Mobile', colors: ['#10B981', '#064E3B'], icon: '⚽', subtitle: 'COINS' },
  'Wild Rift': { name: 'Wild Rift', colors: ['#1D4ED8', '#1E3A5F'], icon: '⚔️', subtitle: 'BLUE MOESSANCE' },
  'Diablo IV': { name: 'Diablo IV', colors: ['#DC2626', '#1C1917'], icon: '😈', subtitle: 'PREMIUM CURRENCY' },
  'Overwatch 2': { name: 'Overwatch 2', colors: ['#F97316', '#1E293B'], icon: '🎮', subtitle: 'COINS' },
  'Rocket League': { name: 'Rocket League', colors: ['#3B82F6', '#0F172A'], icon: '🚗', subtitle: 'CREDITS' },
  'Destiny 2': { name: 'Destiny 2', colors: ['#8B5CF6', '#1E1B4B'], icon: '🌟', subtitle: 'SILVER' },

  // STREAMING
  'Netflix': { name: 'Netflix', colors: ['#E50914', '#831010'], icon: '🎬', subtitle: 'PREMIUM' },
  'Spotify': { name: 'Spotify', colors: ['#1DB954', '#191414'], icon: '🎵', subtitle: 'PREMIUM' },
  'Disney+': { name: 'Disney+', colors: ['#113CCF', '#0A1628'], icon: '🏰', subtitle: 'PREMIUM' },
  'HBO Max': { name: 'HBO Max', colors: ['#B08EEF', '#2D1B69'], icon: '📺', subtitle: 'MAX' },
  'Crunchyroll': { name: 'Crunchyroll', colors: ['#F47521', '#2D2D2D'], icon: '🎌', subtitle: 'PREMIUM' },
  'Amazon Prime': { name: 'Amazon Prime', colors: ['#00A8E1', '#232F3E'], icon: '▶️', subtitle: 'PRIME VIDEO' },
  'Paramount+': { name: 'Paramount+', colors: ['#0064FF', '#001E5A'], icon: '🎬', subtitle: 'ESSENTIAL' },
  'Apple TV+': { name: 'Apple TV+', colors: ['#A2AAAD', '#1D1D1F'], icon: '🍎', subtitle: 'TV+' },
  'Twitch': { name: 'Twitch', colors: ['#9146FF', '#18181B'], icon: '🟣', subtitle: 'SUBSCRIPTION' },
  'Hulu': { name: 'Hulu', colors: ['#1CE783', '#0B1221'], icon: '📺', subtitle: 'SUBSCRIPTION' },
  'Max': { name: 'Max', colors: ['#002BE7', '#0A0A2E'], icon: '🎬', subtitle: 'SUBSCRIPTION' },
  'Peacock': { name: 'Peacock', colors: ['#EFEF2D', '#1A1A2E'], icon: '🦚', subtitle: 'PREMIUM' },
  'DAZN': { name: 'DAZN', colors: ['#F61F3E', '#0F0F0F'], icon: '⚽', subtitle: 'SUBSCRIPTION' },
  'Star+': { name: 'Star+', colors: ['#0057B8', '#0A1628'], icon: '⭐', subtitle: 'SUBSCRIPTION' },

  // GIFT CARDS
  'Steam': { name: 'Steam', colors: ['#1B2838', '#171A21'], icon: '🎮', subtitle: 'GIFT CARD' },
  'PlayStation': { name: 'PlayStation', colors: ['#003791', '#003087'], icon: '🎮', subtitle: 'GIFT CARD' },
  'Xbox': { name: 'Xbox', colors: ['#107C10', '#0E0E0E'], icon: '🟢', subtitle: 'GIFT CARD' },
  'Nintendo': { name: 'Nintendo', colors: ['#E60012', '#1A1A1A'], icon: '🔴', subtitle: 'ESHOP CARD' },
  'Google Play': { name: 'Google Play', colors: ['#34A853', '#4285F4'], icon: '▶️', subtitle: 'GIFT CARD' },
  'Apple': { name: 'Apple', colors: ['#555555', '#1D1D1F'], icon: '🍎', subtitle: 'GIFT CARD' },
  'Amazon': { name: 'Amazon', colors: ['#FF9900', '#232F3E'], icon: '📦', subtitle: 'GIFT CARD' },
  'Epic Games': { name: 'Epic Games', colors: ['#2A2A2A', '#121212'], icon: '🎯', subtitle: 'GIFT CARD' },
  'Riot Games': { name: 'Riot Games', colors: ['#D32936', '#0A0A0A'], icon: '⚔️', subtitle: 'GIFT CARD' },
  'Discord': { name: 'Discord', colors: ['#5865F2', '#23272A'], icon: '💬', subtitle: 'GIFT CARD' },
  'Visa': { name: 'Visa', colors: ['#1A1F71', '#F7B600'], icon: '💳', subtitle: 'GIFT CARD' },
  'PayPal': { name: 'PayPal', colors: ['#003087', '#009CDE'], icon: '💰', subtitle: 'GIFT CARD' },

  // SOFTWARE
  'Windows': { name: 'Windows', colors: ['#0078D4', '#005A9E'], icon: '🪟', subtitle: 'LICENSE KEY' },
  'Microsoft': { name: 'Microsoft', colors: ['#737373', '#F25022'], icon: '📊', subtitle: 'OFFICE 365' },
  'Adobe': { name: 'Adobe', colors: ['#FF0000', '#2D0000'], icon: '🎨', subtitle: 'CREATIVE CLOUD' },
  'VPN': { name: 'VPN Service', colors: ['#10B981', '#065F46'], icon: '🔒', subtitle: 'SUBSCRIPTION' },
  'Antivirus': { name: 'Antivirus', colors: ['#0EA5E9', '#0C4A6E'], icon: '🛡️', subtitle: 'LICENSE' },
  'NordVPN': { name: 'NordVPN', colors: ['#4687FF', '#1E293B'], icon: '🔒', subtitle: 'SUBSCRIPTION' },
  'Kaspersky': { name: 'Kaspersky', colors: ['#006D5C', '#1A1A2E'], icon: '🛡️', subtitle: 'LICENSE' },
  'Malwarebytes': { name: 'Malwarebytes', colors: ['#0E78C1', '#0A1929'], icon: '🔬', subtitle: 'PREMIUM' },
  'Office': { name: 'Microsoft Office', colors: ['#D83B01', '#1B1B1B'], icon: '📊', subtitle: 'LICENSE KEY' },
  'Avast': { name: 'Avast', colors: ['#EB5C27', '#1A1A2E'], icon: '🛡️', subtitle: 'PREMIUM' },
  'Bitdefender': { name: 'Bitdefender', colors: ['#E3000F', '#1A1A2E'], icon: '🔒', subtitle: 'TOTAL SECURITY' },
  'Norton': { name: 'Norton', colors: ['#FFD700', '#2B2B2B'], icon: '🛡️', subtitle: '360 DELUXE' },

  // SUBSCRIPTIONS
  'YouTube': { name: 'YouTube', colors: ['#FF0000', '#282828'], icon: '▶️', subtitle: 'PREMIUM' },
  'Canva': { name: 'Canva', colors: ['#7C3AED', '#00C4CC'], icon: '🎨', subtitle: 'PRO' },
  'EA': { name: 'EA Play', colors: ['#F5A623', '#1A1A1A'], icon: '⚽', subtitle: 'PRO' },
  'Nintendo': { name: 'Nintendo', colors: ['#E60012', '#1A1A1A'], icon: '🔴', subtitle: 'SWITCH ONLINE' },
  'AI': { name: 'AI Tools', colors: ['#8B5CF6', '#1E1B4B'], icon: '🤖', subtitle: 'PREMIUM' },
  'Cloud': { name: 'Cloud Gaming', colors: ['#0EA5E9', '#0F172A'], icon: '☁️', subtitle: 'SUBSCRIPTION' },

  // ACCOUNTS
  'Social': { name: 'Social Media', colors: ['#EC4899', '#1E1B4B'], icon: '👤', subtitle: 'ACCOUNT' },
};

function generateSVG(config: PlatformConfig): string {
  const [c1, c2] = config.colors;
  const slug = config.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bg-${slug}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${c1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${c2};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="shine-${slug}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:white;stop-opacity:0.15" />
      <stop offset="50%" style="stop-color:white;stop-opacity:0.02" />
      <stop offset="100%" style="stop-color:black;stop-opacity:0.1" />
    </linearGradient>
    <filter id="glow-${slug}">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <pattern id="dots-${slug}" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="0.8" fill="white" opacity="0.08" />
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="400" height="300" rx="16" fill="url(#bg-${slug})" />
  <rect width="400" height="300" rx="16" fill="url(#shine-${slug})" />
  <rect width="400" height="300" rx="16" fill="url(#dots-${slug})" />

  <!-- Decorative circles -->
  <circle cx="320" cy="60" r="80" fill="white" opacity="0.04" />
  <circle cx="80" cy="240" r="60" fill="white" opacity="0.03" />
  <circle cx="350" cy="250" r="40" fill="black" opacity="0.15" />

  <!-- Center content -->
  <g filter="url(#glow-${slug})">
    <text x="200" y="120" text-anchor="middle" font-size="64" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${config.icon}</text>
  </g>

  <!-- Platform name -->
  <text x="200" y="170" text-anchor="middle" font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="800" fill="white" letter-spacing="0.5">
    ${config.name}
  </text>

  <!-- Subtitle -->
  <rect x="130" y="185" width="140" height="26" rx="13" fill="white" opacity="0.12" />
  <text x="200" y="203" text-anchor="middle" font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" fill="white" opacity="0.9" letter-spacing="2">
    ${config.subtitle}
  </text>

  <!-- Bottom accent line -->
  <rect x="140" y="235" width="120" height="3" rx="1.5" fill="white" opacity="0.3" />

  <!-- Digital product badge -->
  <rect x="145" y="250" width="110" height="24" rx="12" fill="white" opacity="0.08" stroke="white" stroke-opacity="0.15" stroke-width="1" />
  <text x="200" y="266" text-anchor="middle" font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif" font-size="9" font-weight="600" fill="white" opacity="0.7" letter-spacing="1.5">
    DIGITAL PRODUCT
  </text>
</svg>`;
}

const outputDir = path.join(process.cwd(), 'public', 'products');

// Ensure directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate all SVGs
const imageMap: Record<string, string> = {};

for (const [platform, config] of Object.entries(PLATFORMS)) {
  const slug = platform.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const filename = `${slug}.svg`;
  const filepath = path.join(outputDir, filename);
  const svg = generateSVG(config);
  fs.writeFileSync(filepath, svg);
  imageMap[platform] = `/products/${filename}`;
  console.log(`✓ Generated: ${filename}`);
}

// Also output the image map as JSON for easy reference
const mapPath = path.join(outputDir, 'image-map.json');
fs.writeFileSync(mapPath, JSON.stringify(imageMap, null, 2));
console.log(`\n✓ Generated ${Object.keys(imageMap).length} product images`);
console.log(`✓ Image map saved to: ${mapPath}`);
