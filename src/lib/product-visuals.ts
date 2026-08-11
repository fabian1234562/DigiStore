// Professional gradient-based product visuals
// Each platform gets a unique gradient + icon combination that always looks crisp

export interface ProductVisual {
  gradient: string;
  icon: string;
  bgPattern: string;
}

const gamingVisuals: Record<string, ProductVisual> = {
  'Fortnite': { gradient: 'from-blue-600 via-purple-600 to-indigo-700', icon: '🎯', bgPattern: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Roblox': { gradient: 'from-red-500 via-rose-500 to-red-600', icon: '🧱', bgPattern: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  'Valorant': { gradient: 'from-red-600 via-rose-700 to-pink-800', icon: '🔫', bgPattern: 'radial-gradient(circle at 40% 60%, rgba(255,255,255,0.06) 0%, transparent 50%)' },
  'Minecraft': { gradient: 'from-green-600 via-emerald-700 to-green-800', icon: '⛏️', bgPattern: 'radial-gradient(circle at 60% 40%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'League of Legends': { gradient: 'from-amber-500 via-yellow-600 to-orange-700', icon: '⚔️', bgPattern: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  'Genshin Impact': { gradient: 'from-cyan-500 via-blue-600 to-indigo-700', icon: '⭐', bgPattern: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'EA FC 25': { gradient: 'from-orange-500 via-amber-600 to-yellow-700', icon: '⚽', bgPattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Apex Legends': { gradient: 'from-red-600 via-orange-600 to-red-700', icon: '🏆', bgPattern: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'PUBG Mobile': { gradient: 'from-amber-700 via-orange-800 to-yellow-900', icon: '🪖', bgPattern: 'radial-gradient(circle at 60% 30%, rgba(255,255,255,0.06) 0%, transparent 50%)' },
  'Call of Duty': { gradient: 'from-gray-700 via-zinc-800 to-gray-900', icon: '🎖️', bgPattern: 'radial-gradient(circle at 30% 60%, rgba(255,255,255,0.06) 0%, transparent 50%)' },
  'Free Fire': { gradient: 'from-orange-500 via-red-600 to-amber-700', icon: '🔥', bgPattern: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  'Among Us': { gradient: 'from-red-500 via-blue-600 to-purple-600', icon: '🚀', bgPattern: 'radial-gradient(circle at 40% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Clash Royale': { gradient: 'from-blue-500 via-indigo-600 to-purple-700', icon: '👑', bgPattern: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  'Mobile Legends': { gradient: 'from-blue-600 via-cyan-700 to-indigo-800', icon: '⚡', bgPattern: 'radial-gradient(circle at 60% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Brawl Stars': { gradient: 'from-yellow-400 via-amber-500 to-orange-600', icon: '💥', bgPattern: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.12) 0%, transparent 50%)' },
  'Counter-Strike 2': { gradient: 'from-orange-600 via-amber-700 to-yellow-800', icon: '🎯', bgPattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 50%)' },
  'GTA V': { gradient: 'from-green-500 via-lime-600 to-emerald-700', icon: '🌃', bgPattern: 'radial-gradient(circle at 30% 60%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Honkai Star Rail': { gradient: 'from-violet-500 via-purple-600 to-indigo-700', icon: '🌌', bgPattern: 'radial-gradient(circle at 60% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  'Wuthering Waves': { gradient: 'from-teal-400 via-cyan-600 to-blue-700', icon: '🌊', bgPattern: 'radial-gradient(circle at 40% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Clash of Clans': { gradient: 'from-amber-600 via-yellow-700 to-orange-800', icon: '🏰', bgPattern: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'FIFA Mobile': { gradient: 'from-green-500 via-emerald-600 to-teal-700', icon: '⚽', bgPattern: 'radial-gradient(circle at 60% 40%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Wild Rift': { gradient: 'from-blue-500 via-cyan-600 to-teal-700', icon: '⚔️', bgPattern: 'radial-gradient(circle at 40% 60%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  ' Diablo IV': { gradient: 'from-red-900 via-rose-950 to-gray-900', icon: '😈', bgPattern: 'radial-gradient(circle at 50% 50%, rgba(255,50,50,0.1) 0%, transparent 50%)' },
  'Overwatch 2': { gradient: 'from-orange-500 via-blue-600 to-purple-600', icon: '🎮', bgPattern: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  'Rocket League': { gradient: 'from-blue-500 via-orange-500 to-red-500', icon: '🚗', bgPattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  'Destiny 2': { gradient: 'from-indigo-800 via-purple-900 to-gray-900', icon: '🌟', bgPattern: 'radial-gradient(circle at 60% 40%, rgba(255,255,255,0.06) 0%, transparent 50%)' },
};

const streamingVisuals: Record<string, ProductVisual> = {
  'Netflix': { gradient: 'from-red-600 via-red-700 to-red-900', icon: '🎬', bgPattern: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Spotify': { gradient: 'from-green-500 via-green-600 to-green-800', icon: '🎵', bgPattern: 'radial-gradient(circle at 30% 60%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  'Disney+': { gradient: 'from-blue-600 via-blue-800 to-indigo-900', icon: '🏰', bgPattern: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'HBO Max': { gradient: 'from-purple-700 via-indigo-800 to-blue-900', icon: '📺', bgPattern: 'radial-gradient(circle at 40% 50%, rgba(255,255,255,0.06) 0%, transparent 50%)' },
  'Crunchyroll': { gradient: 'from-orange-500 via-orange-700 to-red-800', icon: '🎌', bgPattern: 'radial-gradient(circle at 60% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  'Amazon Prime': { gradient: 'from-blue-600 via-cyan-700 to-teal-800', icon: '▶️', bgPattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Paramount+': { gradient: 'from-blue-700 via-indigo-800 to-blue-900', icon: '🎬', bgPattern: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.06) 0%, transparent 50%)' },
  'Apple TV+': { gradient: 'from-gray-700 via-gray-800 to-gray-900', icon: '🍎', bgPattern: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Twitch': { gradient: 'from-purple-500 via-purple-700 to-purple-900', icon: '🟣', bgPattern: 'radial-gradient(circle at 40% 60%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Hulu': { gradient: 'from-lime-500 via-green-600 to-teal-700', icon: '📺', bgPattern: 'radial-gradient(circle at 60% 40%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  'Max': { gradient: 'from-indigo-600 via-purple-700 to-violet-800', icon: '🎬', bgPattern: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Peacock': { gradient: 'from-yellow-400 via-amber-500 to-orange-600', icon: '🦚', bgPattern: 'radial-gradient(circle at 40% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  'DAZN': { gradient: 'from-red-600 via-red-700 to-green-700', icon: '⚽', bgPattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Star+': { gradient: 'from-green-500 via-emerald-600 to-teal-700', icon: '⭐', bgPattern: 'radial-gradient(circle at 60% 30%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
};

const giftCardVisuals: Record<string, ProductVisual> = {
  'Steam': { gradient: 'from-gray-700 via-slate-800 to-gray-900', icon: '🎮', bgPattern: 'radial-gradient(circle at 30% 40%, rgba(100,150,255,0.08) 0%, transparent 50%)' },
  'PlayStation': { gradient: 'from-blue-600 via-blue-800 to-indigo-900', icon: '🎮', bgPattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 50%)' },
  'Xbox': { gradient: 'from-green-500 via-green-700 to-green-900', icon: '🟢', bgPattern: 'radial-gradient(circle at 60% 40%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Nintendo': { gradient: 'from-red-500 via-red-700 to-red-800', icon: '🔴', bgPattern: 'radial-gradient(circle at 40% 60%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Google Play': { gradient: 'from-blue-400 via-green-400 to-yellow-400', icon: '▶️', bgPattern: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  'Apple': { gradient: 'from-gray-600 via-gray-700 to-gray-800', icon: '🍎', bgPattern: 'radial-gradient(circle at 40% 50%, rgba(255,255,255,0.06) 0%, transparent 50%)' },
  'Amazon': { gradient: 'from-orange-500 via-amber-600 to-yellow-700', icon: '📦', bgPattern: 'radial-gradient(circle at 60% 40%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Roblox': { gradient: 'from-red-500 via-rose-600 to-red-700', icon: '🧱', bgPattern: 'radial-gradient(circle at 30% 60%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  'Epic Games': { gradient: 'from-gray-800 via-slate-900 to-black', icon: '🎯', bgPattern: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.06) 0%, transparent 50%)' },
  'Netflix': { gradient: 'from-red-600 via-red-700 to-red-900', icon: '🎬', bgPattern: 'radial-gradient(circle at 40% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Spotify': { gradient: 'from-green-500 via-green-600 to-green-800', icon: '🎵', bgPattern: 'radial-gradient(circle at 60% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  'Riot Games': { gradient: 'from-red-600 via-red-800 to-red-900', icon: '⚔️', bgPattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 50%)' },
  'Discord': { gradient: 'from-indigo-500 via-purple-600 to-violet-700', icon: '💬', bgPattern: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Visa': { gradient: 'from-blue-600 via-blue-800 to-blue-950', icon: '💳', bgPattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 50%)' },
  'PayPal': { gradient: 'from-blue-500 via-blue-700 to-indigo-800', icon: '💰', bgPattern: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
};

const softwareVisuals: Record<string, ProductVisual> = {
  'Windows': { gradient: 'from-blue-500 via-blue-700 to-indigo-800', icon: '🪟', bgPattern: 'radial-gradient(circle at 40% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Microsoft': { gradient: 'from-blue-600 via-orange-500 to-red-500', icon: '📊', bgPattern: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Adobe': { gradient: 'from-red-600 via-red-800 to-maroon-900', icon: '🎨', bgPattern: 'radial-gradient(circle at 60% 30%, rgba(255,255,255,0.06) 0%, transparent 50%)' },
  'VPN': { gradient: 'from-emerald-500 via-teal-600 to-cyan-700', icon: '🔒', bgPattern: 'radial-gradient(circle at 40% 60%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Antivirus': { gradient: 'from-sky-500 via-blue-600 to-indigo-700', icon: '🛡️', bgPattern: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'NordVPN': { gradient: 'from-blue-600 via-blue-800 to-indigo-900', icon: '🔒', bgPattern: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.06) 0%, transparent 50%)' },
  'Kaspersky': { gradient: 'from-green-500 via-emerald-600 to-teal-700', icon: '🛡️', bgPattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Malwarebytes': { gradient: 'from-blue-500 via-cyan-600 to-teal-700', icon: '🔬', bgPattern: 'radial-gradient(circle at 60% 40%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Office': { gradient: 'from-orange-500 via-red-500 to-red-700', icon: '📊', bgPattern: 'radial-gradient(circle at 40% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Avast': { gradient: 'from-red-500 via-orange-500 to-amber-600', icon: '🛡️', bgPattern: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  'Bitdefender': { gradient: 'from-red-600 via-red-800 to-gray-900', icon: '🔒', bgPattern: 'radial-gradient(circle at 40% 60%, rgba(255,255,255,0.06) 0%, transparent 50%)' },
  'Norton': { gradient: 'from-yellow-500 via-amber-600 to-orange-700', icon: '🛡️', bgPattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
};

const subscriptionVisuals: Record<string, ProductVisual> = {
  'YouTube': { gradient: 'from-red-500 via-red-700 to-red-900', icon: '▶️', bgPattern: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Discord': { gradient: 'from-indigo-500 via-purple-600 to-violet-700', icon: '💬', bgPattern: 'radial-gradient(circle at 40% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Xbox': { gradient: 'from-green-500 via-green-700 to-green-900', icon: '🟢', bgPattern: 'radial-gradient(circle at 60% 30%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Twitch': { gradient: 'from-purple-500 via-purple-700 to-purple-900', icon: '🟣', bgPattern: 'radial-gradient(circle at 30% 60%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Canva': { gradient: 'from-cyan-400 via-blue-500 to-purple-600', icon: '🎨', bgPattern: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  'Spotify': { gradient: 'from-green-500 via-green-600 to-green-800', icon: '🎵', bgPattern: 'radial-gradient(circle at 40% 60%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  'PlayStation': { gradient: 'from-blue-600 via-blue-800 to-indigo-900', icon: '🎮', bgPattern: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'EA': { gradient: 'from-yellow-500 via-amber-600 to-orange-700', icon: '⚽', bgPattern: 'radial-gradient(circle at 60% 40%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Nintendo': { gradient: 'from-red-500 via-red-700 to-red-800', icon: '🔴', bgPattern: 'radial-gradient(circle at 40% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Steam': { gradient: 'from-gray-700 via-slate-800 to-gray-900', icon: '🎮', bgPattern: 'radial-gradient(circle at 50% 50%, rgba(100,150,255,0.06) 0%, transparent 50%)' },
  'AI': { gradient: 'from-violet-500 via-purple-600 to-fuchsia-700', icon: '🤖', bgPattern: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  'Cloud': { gradient: 'from-sky-400 via-blue-500 to-indigo-600', icon: '☁️', bgPattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
};

const accountVisuals: Record<string, ProductVisual> = {
  'Netflix': { gradient: 'from-red-600 via-red-700 to-red-900', icon: '🎬', bgPattern: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Spotify': { gradient: 'from-green-500 via-green-600 to-green-800', icon: '🎵', bgPattern: 'radial-gradient(circle at 40% 60%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  'Disney+': { gradient: 'from-blue-600 via-blue-800 to-indigo-900', icon: '🏰', bgPattern: 'radial-gradient(circle at 60% 30%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Crunchyroll': { gradient: 'from-orange-500 via-orange-700 to-red-800', icon: '🎌', bgPattern: 'radial-gradient(circle at 40% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  'Fortnite': { gradient: 'from-blue-600 via-purple-600 to-indigo-700', icon: '🎯', bgPattern: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Minecraft': { gradient: 'from-green-600 via-emerald-700 to-green-800', icon: '⛏️', bgPattern: 'radial-gradient(circle at 60% 40%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Roblox': { gradient: 'from-red-500 via-rose-500 to-red-600', icon: '🧱', bgPattern: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
  'Valorant': { gradient: 'from-red-600 via-rose-700 to-pink-800', icon: '🔫', bgPattern: 'radial-gradient(circle at 40% 60%, rgba(255,255,255,0.06) 0%, transparent 50%)' },
  'Genshin Impact': { gradient: 'from-cyan-500 via-blue-600 to-indigo-700', icon: '⭐', bgPattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)' },
  'Social': { gradient: 'from-pink-500 via-rose-600 to-red-700', icon: '👤', bgPattern: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.1) 0%, transparent 50%)' },
};

const defaultVisual: ProductVisual = {
  gradient: 'from-violet-600 via-purple-700 to-indigo-800',
  icon: '📦',
  bgPattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 50%)',
};

const visualMap: Record<string, Record<string, ProductVisual>> = {
  gaming: gamingVisuals,
  streaming: streamingVisuals,
  giftcards: giftCardVisuals,
  software: softwareVisuals,
  subscriptions: subscriptionVisuals,
  accounts: accountVisuals,
};

export function getProductVisual(category: string, platform: string): ProductVisual {
  const catVisuals = visualMap[category];
  if (!catVisuals) return defaultVisual;
  return catVisuals[platform] || defaultVisual;
}
