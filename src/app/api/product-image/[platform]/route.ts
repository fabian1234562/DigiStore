import { NextRequest, NextResponse } from 'next/server';
import satori from 'satori';
import fs from 'fs';

interface PlatformConfig {
  name: string;
  colors: [string, string];
  accent: string;
  subtitle: string;
  category: string;
  letter: string;
}

const PLATFORMS: Record<string, PlatformConfig> = {
  'Fortnite': { name: 'FORTNITE', colors: ['#0053FF', '#7C3AED'], accent: '#60A5FA', subtitle: 'V-BUCKS', category: 'GAMING', letter: 'F' },
  'Roblox': { name: 'ROBLOX', colors: ['#DC2626', '#991B1B'], accent: '#F87171', subtitle: 'ROBUX', category: 'GAMING', letter: 'R' },
  'Valorant': { name: 'VALORANT', colors: ['#FF4655', '#1F2937'], accent: '#FCA5A5', subtitle: 'VALORANT POINTS', category: 'GAMING', letter: 'V' },
  'Minecraft': { name: 'MINECRAFT', colors: ['#16A34A', '#14532D'], accent: '#4ADE80', subtitle: 'MINECOINS', category: 'GAMING', letter: 'M' },
  'League of Legends': { name: 'LEAGUE OF LEGENDS', colors: ['#CA8A04', '#1C1917'], accent: '#FDE047', subtitle: 'RIOT POINTS', category: 'GAMING', letter: 'L' },
  'Genshin Impact': { name: 'GENSHIN IMPACT', colors: ['#2563EB', '#1E3A5F'], accent: '#60A5FA', subtitle: 'GENESIS CRYSTALS', category: 'GAMING', letter: 'G' },
  'EA FC 25': { name: 'EA FC 25', colors: ['#EA580C', '#1C1917'], accent: '#FB923C', subtitle: 'FC POINTS', category: 'GAMING', letter: 'E' },
  'Apex Legends': { name: 'APEX LEGENDS', colors: ['#DC2626', '#1F2937'], accent: '#FCA5A5', subtitle: 'APEX COINS', category: 'GAMING', letter: 'A' },
  'PUBG Mobile': { name: 'PUBG MOBILE', colors: ['#D97706', '#1C1917'], accent: '#FCD34D', subtitle: 'UC', category: 'GAMING', letter: 'P' },
  'Call of Duty': { name: 'CALL OF DUTY', colors: ['#3B82F6', '#111827'], accent: '#93C5FD', subtitle: 'COD POINTS', category: 'GAMING', letter: 'C' },
  'Free Fire': { name: 'FREE FIRE', colors: ['#EA580C', '#431407'], accent: '#FB923C', subtitle: 'DIAMONDS', category: 'GAMING', letter: 'FF' },
  'Among Us': { name: 'AMONG US', colors: ['#EF4444', '#1E293B'], accent: '#FCA5A5', subtitle: 'STARS', category: 'GAMING', letter: 'A' },
  'Clash Royale': { name: 'CLASH ROYALE', colors: ['#1D4ED8', '#1E3A8A'], accent: '#60A5FA', subtitle: 'GEMS', category: 'GAMING', letter: 'CR' },
  'Mobile Legends': { name: 'MOBILE LEGENDS', colors: ['#1D4ED8', '#0C4A6E'], accent: '#60A5FA', subtitle: 'DIAMONDS', category: 'GAMING', letter: 'ML' },
  'Brawl Stars': { name: 'BRAWL STARS', colors: ['#CA8A04', '#92400E'], accent: '#FDE047', subtitle: 'GEMS', category: 'GAMING', letter: 'BS' },
  'Counter-Strike 2': { name: 'COUNTER-STRIKE 2', colors: ['#B45309', '#1C1917'], accent: '#FCD34D', subtitle: 'SKINS', category: 'GAMING', letter: 'CS' },
  'GTA V': { name: 'GTA V', colors: ['#0891B2', '#164E63'], accent: '#67E8F9', subtitle: 'SHARK CARDS', category: 'GAMING', letter: 'G' },
  'Honkai Star Rail': { name: 'HONKAI STAR RAIL', colors: ['#7C3AED', '#2E1065'], accent: '#C4B5FD', subtitle: 'JADE', category: 'GAMING', letter: 'H' },
  'Wuthering Waves': { name: 'WUTHERING WAVES', colors: ['#0891B2', '#134E4A'], accent: '#67E8F9', subtitle: 'ASTRALITE', category: 'GAMING', letter: 'W' },
  'Clash of Clans': { name: 'CLASH OF CLANS', colors: ['#D97706', '#451A03'], accent: '#FCD34D', subtitle: 'GEMS', category: 'GAMING', letter: 'CC' },
  'FIFA Mobile': { name: 'FIFA MOBILE', colors: ['#059669', '#064E3B'], accent: '#6EE7B7', subtitle: 'COINS', category: 'GAMING', letter: 'F' },
  'Wild Rift': { name: 'WILD RIFT', colors: ['#1D4ED8', '#1E3A5F'], accent: '#93C5FD', subtitle: 'WILDCORE', category: 'GAMING', letter: 'WR' },
  'Diablo IV': { name: 'DIABLO IV', colors: ['#DC2626', '#0C0A09'], accent: '#FCA5A5', subtitle: 'PLATINUM', category: 'GAMING', letter: 'D' },
  'Overwatch 2': { name: 'OVERWATCH 2', colors: ['#EA580C', '#1E293B'], accent: '#FDBA74', subtitle: 'COINS', category: 'GAMING', letter: 'O' },
  'Rocket League': { name: 'ROCKET LEAGUE', colors: ['#2563EB', '#0F172A'], accent: '#60A5FA', subtitle: 'CREDITS', category: 'GAMING', letter: 'RL' },
  'Destiny 2': { name: 'DESTINY 2', colors: ['#7C3AED', '#1E1B4B'], accent: '#C4B5FD', subtitle: 'SILVER', category: 'GAMING', letter: 'D' },

  'Netflix': { name: 'NETFLIX', colors: ['#DC2626', '#450A0A'], accent: '#FCA5A5', subtitle: 'PREMIUM', category: 'STREAMING', letter: 'N' },
  'Spotify': { name: 'SPOTIFY', colors: ['#16A34A', '#052E16'], accent: '#4ADE80', subtitle: 'PREMIUM', category: 'STREAMING', letter: 'S' },
  'Disney+': { name: 'DISNEY+', colors: ['#1D4ED8', '#1E3A8A'], accent: '#60A5FA', subtitle: 'PREMIUM', category: 'STREAMING', letter: 'D+' },
  'HBO Max': { name: 'HBO MAX', colors: ['#9333EA', '#3B0764'], accent: '#D8B4FE', subtitle: 'SUBSCRIPTION', category: 'STREAMING', letter: 'H' },
  'Crunchyroll': { name: 'CRUNCHYROLL', colors: ['#EA580C', '#431407'], accent: '#FDBA74', subtitle: 'PREMIUM', category: 'STREAMING', letter: 'C' },
  'Amazon Prime': { name: 'AMAZON PRIME', colors: ['#0284C7', '#0C4A6E'], accent: '#7DD3FC', subtitle: 'PRIME VIDEO', category: 'STREAMING', letter: 'A' },
  'Paramount+': { name: 'PARAMOUNT+', colors: ['#1D4ED8', '#172554'], accent: '#60A5FA', subtitle: 'SUBSCRIPTION', category: 'STREAMING', letter: 'P+' },
  'Apple TV+': { name: 'APPLE TV+', colors: ['#6B7280', '#111827'], accent: '#D1D5DB', subtitle: 'TV+', category: 'STREAMING', letter: 'AT' },
  'Twitch': { name: 'TWITCH', colors: ['#7C3AED', '#2E1065'], accent: '#C4B5FD', subtitle: 'SUBSCRIPTION', category: 'STREAMING', letter: 'T' },
  'Hulu': { name: 'HULU', colors: ['#16A34A', '#052E16'], accent: '#4ADE80', subtitle: 'SUBSCRIPTION', category: 'STREAMING', letter: 'H' },
  'Max': { name: 'MAX', colors: ['#4338CA', '#1E1B4B'], accent: '#A5B4FC', subtitle: 'SUBSCRIPTION', category: 'STREAMING', letter: 'M' },
  'Peacock': { name: 'PEACOCK', colors: ['#CA8A04', '#1C1917'], accent: '#FDE047', subtitle: 'PREMIUM', category: 'STREAMING', letter: 'P' },
  'DAZN': { name: 'DAZN', colors: ['#DC2626', '#0A0A0A'], accent: '#FCA5A5', subtitle: 'SUBSCRIPTION', category: 'STREAMING', letter: 'D' },
  'Star+': { name: 'STAR+', colors: ['#0284C7', '#0C4A6E'], accent: '#7DD3FC', subtitle: 'SUBSCRIPTION', category: 'STREAMING', letter: 'S+' },

  'Steam': { name: 'STEAM', colors: ['#1E293B', '#0F172A'], accent: '#94A3B8', subtitle: 'WALLET', category: 'GIFT CARD', letter: 'S' },
  'PlayStation': { name: 'PLAYSTATION', colors: ['#1D4ED8', '#1E3A8A'], accent: '#60A5FA', subtitle: 'GIFT CARD', category: 'GIFT CARD', letter: 'PS' },
  'Xbox': { name: 'XBOX', colors: ['#16A34A', '#052E16'], accent: '#4ADE80', subtitle: 'GIFT CARD', category: 'GIFT CARD', letter: 'X' },
  'Nintendo': { name: 'NINTENDO', colors: ['#DC2626', '#450A0A'], accent: '#FCA5A5', subtitle: 'ESHOP CARD', category: 'GIFT CARD', letter: 'N' },
  'Google Play': { name: 'GOOGLE PLAY', colors: ['#16A34A', '#052E16'], accent: '#4ADE80', subtitle: 'GIFT CARD', category: 'GIFT CARD', letter: 'GP' },
  'Apple': { name: 'APPLE', colors: ['#6B7280', '#111827'], accent: '#E5E7EB', subtitle: 'GIFT CARD', category: 'GIFT CARD', letter: 'A' },
  'Amazon': { name: 'AMAZON', colors: ['#EA580C', '#451A03'], accent: '#FDBA74', subtitle: 'GIFT CARD', category: 'GIFT CARD', letter: 'A' },
  'Epic Games': { name: 'EPIC GAMES', colors: ['#374151', '#030712'], accent: '#9CA3AF', subtitle: 'GIFT CARD', category: 'GIFT CARD', letter: 'E' },
  'Riot Games': { name: 'RIOT GAMES', colors: ['#DC2626', '#450A0A'], accent: '#FCA5A5', subtitle: 'GIFT CARD', category: 'GIFT CARD', letter: 'R' },
  'Discord': { name: 'DISCORD', colors: ['#4F46E5', '#312E81'], accent: '#A5B4FC', subtitle: 'NITRO', category: 'GIFT CARD', letter: 'D' },
  'Visa': { name: 'VISA', colors: ['#1E3A8A', '#0F172A'], accent: '#60A5FA', subtitle: 'GIFT CARD', category: 'GIFT CARD', letter: 'V' },
  'PayPal': { name: 'PAYPAL', colors: ['#1D4ED8', '#172554'], accent: '#60A5FA', subtitle: 'GIFT CARD', category: 'GIFT CARD', letter: 'PP' },

  'Windows': { name: 'WINDOWS 11 PRO', colors: ['#0078D4', '#0C4A6E'], accent: '#60A5FA', subtitle: 'LICENSE KEY', category: 'SOFTWARE', letter: 'W' },
  'Microsoft': { name: 'MICROSOFT 365', colors: ['#DC2626', '#1C1917'], accent: '#FCA5A5', subtitle: 'SUBSCRIPTION', category: 'SOFTWARE', letter: 'M' },
  'Adobe': { name: 'ADOBE CC', colors: ['#DC2626', '#450A0A'], accent: '#FCA5A5', subtitle: 'CREATIVE CLOUD', category: 'SOFTWARE', letter: 'A' },
  'VPN': { name: 'VPN PRO', colors: ['#059669', '#064E3B'], accent: '#6EE7B7', subtitle: 'PREMIUM', category: 'SOFTWARE', letter: 'V' },
  'Antivirus': { name: 'ANTIVIRUS PRO', colors: ['#0284C7', '#0C4A6E'], accent: '#7DD3FC', subtitle: 'LICENSE', category: 'SOFTWARE', letter: 'AV' },
  'NordVPN': { name: 'NORDVPN', colors: ['#2563EB', '#1E3A8A'], accent: '#93C5FD', subtitle: 'PREMIUM', category: 'SOFTWARE', letter: 'N' },
  'Kaspersky': { name: 'KASPERSKY', colors: ['#059669', '#042F2E'], accent: '#6EE7B7', subtitle: 'TOTAL SECURITY', category: 'SOFTWARE', letter: 'K' },
  'Malwarebytes': { name: 'MALWAREBYTES', colors: ['#0284C7', '#0C4A6E'], accent: '#7DD3FC', subtitle: 'PREMIUM', category: 'SOFTWARE', letter: 'M' },
  'Office': { name: 'MS OFFICE 2024', colors: ['#EA580C', '#1C1917'], accent: '#FDBA74', subtitle: 'PROFESSIONAL', category: 'SOFTWARE', letter: 'O' },
  'Avast': { name: 'AVAST', colors: ['#EA580C', '#431407'], accent: '#FDBA74', subtitle: 'PREMIUM SECURITY', category: 'SOFTWARE', letter: 'A' },
  'Bitdefender': { name: 'BITDEFENDER', colors: ['#DC2626', '#1F2937'], accent: '#FCA5A5', subtitle: 'TOTAL SECURITY', category: 'SOFTWARE', letter: 'B' },
  'Norton': { name: 'NORTON 360', colors: ['#CA8A04', '#1C1917'], accent: '#FDE047', subtitle: 'DELUXE', category: 'SOFTWARE', letter: 'N' },

  'YouTube': { name: 'YOUTUBE', colors: ['#DC2626', '#450A0A'], accent: '#FCA5A5', subtitle: 'PREMIUM', category: 'SUBSCRIPTION', letter: 'Y' },
  'Canva': { name: 'CANVA', colors: ['#7C3AED', '#164E63'], accent: '#C4B5FD', subtitle: 'PRO', category: 'SUBSCRIPTION', letter: 'C' },
  'EA': { name: 'EA PLAY', colors: ['#D97706', '#1C1917'], accent: '#FCD34D', subtitle: 'PRO', category: 'SUBSCRIPTION', letter: 'EA' },
  'AI': { name: 'AI TOOLS', colors: ['#7C3AED', '#1E1B4B'], accent: '#C4B5FD', subtitle: 'PREMIUM', category: 'SUBSCRIPTION', letter: 'AI' },
  'Cloud': { name: 'CLOUD GAMING', colors: ['#0284C7', '#0F172A'], accent: '#7DD3FC', subtitle: 'SUBSCRIPTION', category: 'SUBSCRIPTION', letter: 'CG' },

  'Social': { name: 'SOCIAL MEDIA', colors: ['#DB2777', '#4A044E'], accent: '#F9A8D4', subtitle: 'PREMIUM ACCOUNT', category: 'ACCOUNT', letter: 'SM' },
};

const imageCache = new Map<string, string>();
let fontsLoaded = false;
let fontData: ArrayBuffer | null = null;

async function loadFonts() {
  if (fontsLoaded) return;
  fontData = fs.readFileSync('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf');
  fontsLoaded = true;
}

function getPlatformFromSlug(slug: string): string {
  const map: Record<string, string> = { 'disney-': 'Disney+', 'apple-tv-': 'Apple TV+', 'paramount-': 'Paramount+', 'star-': 'Star+' };
  if (map[slug]) return map[slug];
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ platform: string }> }) {
  const { platform: platformSlug } = await params;
  
  if (imageCache.has(platformSlug)) {
    return new NextResponse(imageCache.get(platformSlug)!, {
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400, immutable' },
    });
  }

  await loadFonts();

  let platformName = getPlatformFromSlug(platformSlug);
  let config = PLATFORMS[platformName];
  
  if (!config) {
    for (const [key, val] of Object.entries(PLATFORMS)) {
      if (key.toLowerCase().replace(/[^a-z0-9]/g, '-') === platformSlug) { config = val; break; }
    }
  }
  if (!config) config = { name: platformName.toUpperCase(), colors: ['#6366F1', '#312E81'] as [string, string], accent: '#A5B4FC', subtitle: 'DIGITAL', category: 'DIGITAL', letter: '?' };

  const [c1, c2] = config.colors;

  const svg = await satori(
    {
      type: 'div',
      style: {
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(145deg, ${c1} 0%, ${c2} 60%, #0a0a0a 100%)`,
        position: 'relative', overflow: 'hidden',
      },
      children: [
        // Large background circle glow
        { type: 'div', style: { position: 'absolute', top: '50%', left: '50%', width: 280, height: 280, marginTop: -140, marginLeft: -140, borderRadius: '50%', background: `radial-gradient(circle, ${config.accent}22 0%, transparent 70%)` } },
        // Decorative diagonal stripe
        { type: 'div', style: { position: 'absolute', top: -30, right: -50, width: 200, height: 300, backgroundColor: 'rgba(255,255,255,0.03)', transform: 'rotate(25deg)' } },
        { type: 'div', style: { position: 'absolute', bottom: -30, left: -50, width: 150, height: 250, backgroundColor: 'rgba(0,0,0,0.15)', transform: 'rotate(-15deg)' } },
        // Small decorative dots
        { type: 'div', style: { position: 'absolute', top: 30, left: 30, width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)' } },
        { type: 'div', style: { position: 'absolute', top: 30, left: 50, width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)' } },
        { type: 'div', style: { position: 'absolute', top: 30, left: 70, width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.04)' } },
        // Main content column
        {
          type: 'div', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, zIndex: 1 },
          children: [
            // Category badge at top
            {
              type: 'div', style: {
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.1)', padding: '5px 14px', borderRadius: 15,
                border: '1px solid rgba(255,255,255,0.1)',
              },
              children: [{ type: 'div', style: { fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: 3 }, children: [config.category] }],
            },
            // Central letter/logo circle
            {
              type: 'div', style: {
                width: 120, height: 120, borderRadius: 60,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '2px solid rgba(255,255,255,0.15)',
                boxShadow: `0 0 60px ${config.accent}33, inset 0 0 30px rgba(255,255,255,0.05)`,
                marginTop: 16,
              },
              children: [{ type: 'div', style: { fontSize: 42, fontWeight: 900, color: 'white', letterSpacing: -1, textShadow: `0 0 20px ${config.accent}66` }, children: [config.letter] }],
            },
            // Platform name
            { type: 'div', style: { fontSize: 26, fontWeight: 900, color: 'white', letterSpacing: 2, marginTop: 4, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }, children: [config.name] },
            // Subtitle pill
            {
              type: 'div', style: {
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: `${config.accent}20`, padding: '7px 28px', borderRadius: 20, marginTop: 2,
                border: `1px solid ${config.accent}30`,
              },
              children: [{ type: 'div', style: { fontSize: 14, fontWeight: 800, color: config.accent, letterSpacing: 4 }, children: [config.subtitle] }],
            },
            // Bottom info bar
            {
              type: 'div', style: {
                display: 'flex', alignItems: 'center', gap: 16, marginTop: 20,
              },
              children: [
                {
                  type: 'div', style: {
                    display: 'flex', alignItems: 'center', gap: 5,
                    backgroundColor: 'rgba(0,0,0,0.3)', padding: '4px 12px', borderRadius: 10,
                  },
                  children: [
                    { type: 'div', style: { width: 5, height: 5, borderRadius: '50%', backgroundColor: '#22C55E' } },
                    { type: 'div', style: { fontSize: 8, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 }, children: ['INSTANT DELIVERY'] },
                  ],
                },
                {
                  type: 'div', style: {
                    display: 'flex', alignItems: 'center', gap: 5,
                    backgroundColor: 'rgba(0,0,0,0.3)', padding: '4px 12px', borderRadius: 10,
                  },
                  children: [
                    { type: 'div', style: { width: 5, height: 5, borderRadius: '50%', backgroundColor: '#3B82F6' } },
                    { type: 'div', style: { fontSize: 8, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 }, children: ['DIGITAL PRODUCT'] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    { width: 600, height: 450, fonts: [{ name: 'DejaVu', data: fontData!, weight: 700, style: 'normal' }] }
  );

  imageCache.set(platformSlug, svg);
  return new NextResponse(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400, immutable' } });
}