// Product image resolution:
// 1. Real AI-generated PNGs in /public/products/ (for platforms with generated images)
// 2. Satori API route fallback (professional branded card, no emojis)

const PLATFORM_SLUGS: Record<string, string> = {
  'Fortnite': 'fortnite', 'Roblox': 'roblox', 'Valorant': 'valorant',
  'Minecraft': 'minecraft', 'League of Legends': 'league-of-legends',
  'Genshin Impact': 'genshin-impact', 'EA FC 25': 'ea-fc-25',
  'Apex Legends': 'apex-legends', 'PUBG Mobile': 'pubg-mobile',
  'Call of Duty': 'call-of-duty', 'Free Fire': 'free-fire',
  'Among Us': 'among-us', 'Clash Royale': 'clash-royale',
  'Mobile Legends': 'mobile-legends', 'Brawl Stars': 'brawl-stars',
  'Counter-Strike 2': 'counter-strike-2', 'GTA V': 'gta-v',
  'Honkai Star Rail': 'honkai-star-rail', 'Wuthering Waves': 'wuthering-waves',
  'Clash of Clans': 'clash-of-clans', 'FIFA Mobile': 'fifa-mobile',
  'Wild Rift': 'wild-rift', 'Diablo IV': 'diablo-iv',
  'Overwatch 2': 'overwatch-2', 'Rocket League': 'rocket-league',
  'Destiny 2': 'destiny-2', 'Netflix': 'netflix', 'Spotify': 'spotify',
  'Disney+': 'disney-', 'HBO Max': 'hbo-max', 'Crunchyroll': 'crunchyroll',
  'Amazon Prime': 'amazon-prime', 'Paramount+': 'paramount-',
  'Apple TV+': 'apple-tv-', 'Twitch': 'twitch', 'Hulu': 'hulu',
  'Max': 'max', 'Peacock': 'peacock', 'DAZN': 'dazn', 'Star+': 'star-',
  'Steam': 'steam', 'PlayStation': 'playstation', 'Xbox': 'xbox',
  'Nintendo': 'nintendo', 'Google Play': 'google-play', 'Apple': 'apple',
  'Amazon': 'amazon', 'Epic Games': 'epic-games', 'Riot Games': 'riot-games',
  'Discord': 'discord', 'Visa': 'visa', 'PayPal': 'paypal',
  'Windows': 'windows', 'Microsoft': 'microsoft', 'Adobe': 'adobe',
  'VPN': 'vpn', 'Antivirus': 'antivirus', 'NordVPN': 'nordvpn',
  'Kaspersky': 'kaspersky', 'Malwarebytes': 'malwarebytes', 'Office': 'office',
  'Avast': 'avast', 'Bitdefender': 'bitdefender', 'Norton': 'norton',
  'YouTube': 'youtube', 'Canva': 'canva', 'EA': 'ea',
  'AI': 'ai', 'Cloud': 'cloud', 'Social': 'social',
};

// Platforms with real AI-generated PNG images
const REAL_PNGS = new Set([
  'fortnite', 'roblox', 'valorant', 'minecraft',
  'league-of-legends', 'genshin-impact', 'ea-fc-25',
  'netflix', 'spotify', 'disney-', 'steam',
  'playstation', 'xbox', 'nintendo', 'youtube',
  'windows', 'adobe', 'canva', 'amazon',
]);

export function getProductImage(platform: string): string {
  const slug = PLATFORM_SLUGS[platform] || platform.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  
  // Use real PNG if available
  if (REAL_PNGS.has(slug)) {
    return `/products/${slug}.png`;
  }
  
  // Fall back to satori API route
  return `/api/product-image/${slug}`;
}
