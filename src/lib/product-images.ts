// Maps platform names to their product image paths
// Images are SVGs stored in /public/products/

export const PLATFORM_IMAGES: Record<string, string> = {
  // GAMING
  'Fortnite': '/products/fortnite.svg',
  'Roblox': '/products/roblox.svg',
  'Valorant': '/products/valorant.svg',
  'Minecraft': '/products/minecraft.svg',
  'League of Legends': '/products/league-of-legends.svg',
  'Genshin Impact': '/products/genshin-impact.svg',
  'EA FC 25': '/products/ea-fc-25.svg',
  'Apex Legends': '/products/apex-legends.svg',
  'PUBG Mobile': '/products/pubg-mobile.svg',
  'Call of Duty': '/products/call-of-duty.svg',
  'Free Fire': '/products/free-fire.svg',
  'Among Us': '/products/among-us.svg',
  'Clash Royale': '/products/clash-royale.svg',
  'Mobile Legends': '/products/mobile-legends.svg',
  'Brawl Stars': '/products/brawl-stars.svg',
  'Counter-Strike 2': '/products/counter-strike-2.svg',
  'GTA V': '/products/gta-v.svg',
  'Honkai Star Rail': '/products/honkai-star-rail.svg',
  'Wuthering Waves': '/products/wuthering-waves.svg',
  'Clash of Clans': '/products/clash-of-clans.svg',
  'FIFA Mobile': '/products/fifa-mobile.svg',
  'Wild Rift': '/products/wild-rift.svg',
  'Diablo IV': '/products/diablo-iv.svg',
  'Overwatch 2': '/products/overwatch-2.svg',
  'Rocket League': '/products/rocket-league.svg',
  'Destiny 2': '/products/destiny-2.svg',

  // STREAMING
  'Netflix': '/products/netflix.svg',
  'Spotify': '/products/spotify.svg',
  'Disney+': '/products/disney-.svg',
  'HBO Max': '/products/hbo-max.svg',
  'Crunchyroll': '/products/crunchyroll.svg',
  'Amazon Prime': '/products/amazon-prime.svg',
  'Paramount+': '/products/paramount-.svg',
  'Apple TV+': '/products/apple-tv-.svg',
  'Twitch': '/products/twitch.svg',
  'Hulu': '/products/hulu.svg',
  'Max': '/products/max.svg',
  'Peacock': '/products/peacock.svg',
  'DAZN': '/products/dazn.svg',
  'Star+': '/products/star-.svg',

  // GIFT CARDS
  'Steam': '/products/steam.svg',
  'PlayStation': '/products/playstation.svg',
  'Xbox': '/products/xbox.svg',
  'Nintendo': '/products/nintendo.svg',
  'Google Play': '/products/google-play.svg',
  'Apple': '/products/apple.svg',
  'Amazon': '/products/amazon.svg',
  'Epic Games': '/products/epic-games.svg',
  'Riot Games': '/products/riot-games.svg',
  'Discord': '/products/discord.svg',
  'Visa': '/products/visa.svg',
  'PayPal': '/products/paypal.svg',

  // SOFTWARE
  'Windows': '/products/windows.svg',
  'Microsoft': '/products/microsoft.svg',
  'Adobe': '/products/adobe.svg',
  'VPN': '/products/vpn.svg',
  'Antivirus': '/products/antivirus.svg',
  'NordVPN': '/products/nordvpn.svg',
  'Kaspersky': '/products/kaspersky.svg',
  'Malwarebytes': '/products/malwarebytes.svg',
  'Office': '/products/office.svg',
  'Avast': '/products/avast.svg',
  'Bitdefender': '/products/bitdefender.svg',
  'Norton': '/products/norton.svg',

  // SUBSCRIPTIONS
  'YouTube': '/products/youtube.svg',
  'Canva': '/products/canva.svg',
  'EA': '/products/ea.svg',
  'AI': '/products/ai.svg',
  'Cloud': '/products/cloud.svg',

  // ACCOUNTS
  'Social': '/products/social.svg',
};

const DEFAULT_IMAGE = '/products/ai.svg';

export function getProductImage(platform: string): string {
  return PLATFORM_IMAGES[platform] || DEFAULT_IMAGE;
}
