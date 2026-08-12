import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = '/home/z/my-project/public/products/gen';

// Color palettes for each game/platform - each product gets unique colors
const productStyles = {
  // FORTNITE PRODUCTS (g1-g4, g8) - Blue/Purple theme with different accents
  'g1': { bg1: '#1a0533', bg2: '#0d1b3e', accent: '#00d4ff', accent2: '#7b2fff', glow: '#00d4ff', icon: '🪙', label: '1000', subtitle: 'V-BUCKS' },
  'g2': { bg1: '#1b0a3c', bg2: '#0f2248', accent: '#4d9fff', accent2: '#a855f7', glow: '#4d9fff', icon: '🪙', label: '2800', subtitle: 'V-BUCKS' },
  'g3': { bg1: '#0f0326', bg2: '#162050', accent: '#38bdf8', accent2: '#c084fc', glow: '#38bdf8', icon: '💰', label: '5000', subtitle: 'V-BUCKS' },
  'g4': { bg1: '#12042e', bg2: '#0a1a42', accent: '#fbbf24', accent2: '#818cf8', glow: '#fbbf24', icon: '💎', label: '13500', subtitle: 'V-BUCKS MEGA' },
  'g8': { bg1: '#1e0a45', bg2: '#0d1f4a', accent: '#f97316', accent2: '#a78bfa', glow: '#f97316', icon: '⭐', label: 'BATTLE', subtitle: 'PASS' },

  // ROBLOX PRODUCTS (g5-g7) - Red/Orange theme
  'g5': { bg1: '#2d0a0a', bg2: '#1a0f05', accent: '#f87171', accent2: '#fbbf24', glow: '#f87171', icon: '🔴', label: '800', subtitle: 'ROBUX' },
  'g6': { bg1: '#330d0d', bg2: '#1f1208', accent: '#fb923c', accent2: '#facc15', glow: '#fb923c', icon: '🟠', label: '1700', subtitle: 'ROBUX' },
  'g7': { bg1: '#2a0808', bg2: '#1c1005', accent: '#f59e0b', accent2: '#ef4444', glow: '#f59e0b', icon: '💰', label: '4500', subtitle: 'ROBUX PREMIUM' },

  // VALORANT (g9-g10) - Red/Black theme
  'g9': { bg1: '#1a0000', bg2: '#0d0a1a', accent: '#ff4655', accent2: '#ff8a65', glow: '#ff4655', icon: '🔫', label: 'LEGENDARY', subtitle: 'WEAPON SKIN' },
  'g10': { bg1: '#1f0505', bg2: '#0a0d1f', accent: '#ff6b6b', accent2: '#4ecdc4', glow: '#ff6b6b', icon: '💎', label: '5000', subtitle: 'VALORANT POINTS' },

  // MINECRAFT (g11-g12) - Green/Brown theme
  'g11': { bg1: '#0a1a0a', bg2: '#1a120a', accent: '#4ade80', accent2: '#a78bfa', glow: '#4ade80', icon: '⛏️', label: 'PREMIUM', subtitle: 'JAVA EDITION' },
  'g12': { bg1: '#0d1f0d', bg2: '#1c1510', accent: '#22d3ee', accent2: '#86efac', glow: '#22d3ee', icon: '🎮', label: 'PREMIUM', subtitle: 'BEDROCK' },

  // LEAGUE OF LEGENDS (g13-g14) - Gold/Blue theme
  'g13': { bg1: '#1a1505', bg2: '#0a0f20', accent: '#fbbf24', accent2: '#3b82f6', glow: '#fbbf24', icon: '🏆', label: '1380', subtitle: 'RIOT POINTS' },
  'g14': { bg1: '#1f1a08', bg2: '#0d1228', accent: '#f59e0b', accent2: '#6366f1', glow: '#f59e0b', icon: '💰', label: '3500', subtitle: 'RIOT POINTS' },

  // GENSHIN IMPACT (g15-g16) - Cyan/Gold theme
  'g15': { bg1: '#051a1f', bg2: '#1a1005', accent: '#22d3ee', accent2: '#fbbf24', glow: '#22d3ee', icon: '✨', label: 'GENESIS', subtitle: 'CRYSTALS' },
  'g16': { bg1: '#081f24', bg2: '#1f1508', accent: '#67e8f9', accent2: '#fcd34d', glow: '#67e8f9', icon: '🌙', label: 'WELKIN', subtitle: 'MOON' },

  // APEX LEGENDS (g17-g18) - Orange/Red theme
  'g17': { bg1: '#1f0f05', bg2: '#1a0505', accent: '#f97316', accent2: '#ef4444', glow: '#f97316', icon: '🎯', label: '1000', subtitle: 'APEX COINS' },
  'g18': { bg1: '#1a0a03', bg2: '#200808', accent: '#fb923c', accent2: '#dc2626', glow: '#fb923c', icon: '🔥', label: '2150', subtitle: 'APEX COINS' },

  // PUBG MOBILE (g19-g20) - Military Yellow/Black
  'g19': { bg1: '#1a1a05', bg2: '#0d0d0d', accent: '#eab308', accent2: '#6b7280', glow: '#eab308', icon: '🪖', label: '600', subtitle: 'UC' },
  'g20': { bg1: '#1f1f08', bg2: '#111111', accent: '#facc15', accent2: '#9ca3af', glow: '#facc15', icon: '💣', label: '3250', subtitle: 'UC MEGA' },

  // FREE FIRE (g21-g22) - Fiery Orange/Red
  'g21': { bg1: '#1f0805', bg2: '#1a0500', accent: '#ef4444', accent2: '#f97316', glow: '#ef4444', icon: '🔥', label: '1000', subtitle: 'DIAMONDS' },
  'g22': { bg1: '#200a05', bg2: '#1a0800', accent: '#f97316', accent2: '#fbbf24', glow: '#f97316', icon: '💎', label: '5600', subtitle: 'DIAMONDS MEGA' },

  // AMONG US (g23)
  'g23': { bg1: '#0a0a1f', bg2: '#1f0a1a', accent: '#f43f5e', accent2: '#6366f1', glow: '#f43f5e', icon: '🚀', label: 'FULL SKINS', subtitle: 'COLLECTION' },

  // CLASH ROYALE (g24, g50) - Purple/Blue
  'g24': { bg1: '#150525', bg2: '#0a1020', accent: '#a855f7', accent2: '#3b82f6', glow: '#a855f7', icon: '👑', label: '1400', subtitle: 'GEMS' },
  'g50': { bg1: '#1a0830', bg2: '#0d1530', accent: '#c084fc', accent2: '#60a5fa', glow: '#c084fc', icon: '💎', label: '5000', subtitle: 'GEMS MEGA' },

  // MOBILE LEGENDS (g25-g26) - Blue/Gold
  'g25': { bg1: '#051520', bg2: '#1a1005', accent: '#3b82f6', accent2: '#fbbf24', glow: '#3b82f6', icon: '⚔️', label: '400', subtitle: 'DIAMONDS' },
  'g26': { bg1: '#081a28', bg2: '#1f1508', accent: '#60a5fa', accent2: '#f59e0b', glow: '#60a5fa', icon: '🏆', label: '2200', subtitle: 'DIAMONDS' },

  // BRAWL STARS (g27-g28) - Electric Blue/Yellow
  'g27': { bg1: '#051525', bg2: '#1a1a05', accent: '#2563eb', accent2: '#eab308', glow: '#2563eb', icon: '⭐', label: '170', subtitle: 'GEMS' },
  'g28': { bg1: '#0a1a30', bg2: '#1f1f08', accent: '#3b82f6', accent2: '#facc15', glow: '#3b82f6', icon: '💫', label: '1700', subtitle: 'GEMS' },

  // CS2 (g29-g30) - Silver/Orange
  'g29': { bg1: '#0f0f15', bg2: '#1a0f05', accent: '#d4af37', accent2: '#f97316', glow: '#d4af37', icon: '🔫', label: 'PREMIUM', subtitle: 'SKIN PACK' },
  'g30': { bg1: '#12121a', bg2: '#1a1008', accent: '#fbbf24', accent2: '#ea580c', glow: '#fbbf24', icon: '🔑', label: '5 KEYS', subtitle: 'BUNDLE' },

  // GTA V (g31-g32) - Green/Gold
  'g31': { bg1: '#051a0a', bg2: '#1a1505', accent: '#22c55e', accent2: '#fbbf24', glow: '#22c55e', icon: '🦈', label: '$8M', subtitle: 'MEGALODON' },
  'g32': { bg1: '#081f0d', bg2: '#1f1a08', accent: '#4ade80', accent2: '#f59e0b', glow: '#4ade80', icon: '🐋', label: '$3.5M', subtitle: 'WHALE' },

  // CALL OF DUTY (g33-g34) - Military Green/Orange
  'g33': { bg1: '#0a1a0d', bg2: '#1a0f05', accent: '#65a30d', accent2: '#f97316', glow: '#65a30d', icon: '🎯', label: '2400', subtitle: 'COD POINTS' },
  'g34': { bg1: '#0d1f10', bg2: '#1a1008', accent: '#84cc16', accent2: '#ea580c', glow: '#84cc16', icon: '🎖️', label: 'PREMIUM', subtitle: 'ACCOUNT' },

  // HONKAI STAR RAIL (g35-g36) - Purple/Gold Cosmic
  'g35': { bg1: '#15052a', bg2: '#1a1008', accent: '#a78bfa', accent2: '#fbbf24', glow: '#a78bfa', icon: '✨', label: 'ONEIRIC', subtitle: 'SHARDS' },
  'g36': { bg1: '#1a0835', bg2: '#1f150a', accent: '#c084fc', accent2: '#fcd34d', glow: '#c084fc', icon: '🚂', label: 'EXPRESS', subtitle: 'SUPPLY PASS' },

  // WUTHERING WAVES (g37) - Teal/White
  'g37': { bg1: '#051a1a', bg2: '#0f1520', accent: '#2dd4bf', accent2: '#e0e7ff', glow: '#2dd4bf', icon: '🌊', label: 'ASTRITE', subtitle: 'PACK' },

  // EA FC 25 (g38-g39) - Green/Gold Football
  'g38': { bg1: '#051a0a', bg2: '#1a1205', accent: '#16a34a', accent2: '#eab308', glow: '#16a34a', icon: '⚽', label: '2800', subtitle: 'FC COINS' },
  'g39': { bg1: '#081f0d', bg2: '#1f1a08', accent: '#22c55e', accent2: '#fbbf24', glow: '#22c55e', icon: '🏆', label: '5600', subtitle: 'FC COINS' },

  // CLASH OF CLANS (g40-g41) - Dark Blue/Gold
  'g40': { bg1: '#080f20', bg2: '#1a1205', accent: '#1d4ed8', accent2: '#fbbf24', glow: '#1d4ed8', icon: '💎', label: '1400', subtitle: 'GEMS' },
  'g41': { bg1: '#0a1530', bg2: '#1f1508', accent: '#2563eb', accent2: '#f59e0b', glow: '#2563eb', icon: '💰', label: '5000', subtitle: 'GEMS' },

  // WILD RIFT (g42) - Blue/Silver
  'g42': { bg1: '#0a0f20', bg2: '#151520', accent: '#60a5fa', accent2: '#c0c0c0', glow: '#60a5fa', icon: '🎮', label: 'WILD', subtitle: 'TOKENS' },

  // DIABLO IV (g43) - Red/Black Hellish
  'g43': { bg1: '#1a0000', bg2: '#0d0005', accent: '#dc2626', accent2: '#7f1d1d', glow: '#dc2626', icon: '😈', label: 'DIABLO IV', subtitle: 'PREMIUM' },

  // OVERWATCH 2 (g44-g45) - Orange/Blue
  'g44': { bg1: '#1a0f05', bg2: '#050f1a', accent: '#f97316', accent2: '#3b82f6', glow: '#f97316', icon: '🦉', label: '1000', subtitle: 'OW2 COINS' },
  'g45': { bg1: '#1f1508', bg2: '#0a1525', accent: '#fb923c', accent2: '#60a5fa', glow: '#fb923c', icon: '💎', label: '5000', subtitle: 'OW2 COINS' },

  // ROCKET LEAGUE (g46-g47) - Blue/Orange
  'g46': { bg1: '#05101a', bg2: '#1a1005', accent: '#2563eb', accent2: '#f97316', glow: '#2563eb', icon: '🚗', label: '200', subtitle: 'CREDITS' },
  'g47': { bg1: '#0a1525', bg2: '#1f1508', accent: '#3b82f6', accent2: '#fb923c', glow: '#3b82f6', icon: '🚀', label: '11000', subtitle: 'CREDITS' },

  // DESTINY 2 (g48) - White/Gold Cosmic
  'g48': { bg1: '#101020', bg2: '#1a1505', accent: '#e2e8f0', accent2: '#fbbf24', glow: '#e2e8f0', icon: '🔮', label: '1000', subtitle: 'SILVER' },

  // FIFA MOBILE (g49) - Green/Gold
  'g49': { bg1: '#051a0a', bg2: '#1a1005', accent: '#15803d', accent2: '#eab308', glow: '#15803d', icon: '⚽', label: '2M', subtitle: 'FIFA COINS' },

  // STREAMING - NETFLIX (s1-s8) - Different red/black combos
  's1': { bg1: '#1a0505', bg2: '#0a0a0a', accent: '#e50914', accent2: '#b91c1c', glow: '#e50914', icon: '▶️', label: '1 MES', subtitle: 'NETFLIX PREMIUM' },
  's2': { bg1: '#200808', bg2: '#0d0d0d', accent: '#dc2626', accent2: '#991b1b', glow: '#dc2626', icon: '📺', label: '3 MESES', subtitle: 'NETFLIX PREMIUM' },
  's3': { bg1: '#1f0a0a', bg2: '#111111', accent: '#ef4444', accent2: '#b91c1c', glow: '#ef4444', icon: '🎬', label: '6 MESES', subtitle: 'NETFLIX PREMIUM' },
  's4': { bg1: '#220c0c', bg2: '#0f0f0f', accent: '#f87171', accent2: '#dc2626', glow: '#f87171', icon: '⭐', label: '12 MESES', subtitle: 'NETFLIX PREMIUM' },
  's5': { bg1: '#1a0505', bg2: '#080808', accent: '#e50914', accent2: '#7f1d1d', glow: '#e50914', icon: '👨‍👩‍👧‍👦', label: '1 MES', subtitle: 'NETFLIX ESTANDAR' },
  's6': { bg1: '#1f0808', bg2: '#0a0a0a', accent: '#dc2626', accent2: '#991b1b', glow: '#dc2626', icon: '📹', label: '3 MESES', subtitle: 'NETFLIX ESTANDAR' },
  's7': { bg1: '#200a0a', bg2: '#0d0d0d', accent: '#ef4444', accent2: '#b91c1c', glow: '#ef4444', icon: '📱', label: '1 MES', subtitle: 'NETFLIX MOBILE' },
  's8': { bg1: '#220c0c', bg2: '#101010', accent: '#f87171', accent2: '#dc2626', glow: '#f87171', icon: '🎁', label: 'COMBO', subtitle: 'NETFLIX + SPOTIFY' },

  // STREAMING - SPOTIFY (s9-s16) - Green/Black combos
  's9': { bg1: '#051a0a', bg2: '#0a0a0a', accent: '#1db954', accent2: '#15803d', glow: '#1db954', icon: '🎵', label: '1 MES', subtitle: 'SPOTIFY PREMIUM' },
  's10': { bg1: '#081f0d', bg2: '#0d0d0d', accent: '#22c55e', accent2: '#16a34a', glow: '#22c55e', icon: '🎧', label: '3 MESES', subtitle: 'SPOTIFY PREMIUM' },
  's11': { bg1: '#0a250f', bg2: '#111111', accent: '#4ade80', accent2: '#22c55e', glow: '#4ade80', icon: '🎶', label: '6 MESES', subtitle: 'SPOTIFY PREMIUM' },
  's12': { bg1: '#0d2a15', bg2: '#0f0f0f', accent: '#86efac', accent2: '#4ade80', glow: '#86efac', icon: '💎', label: '12 MESES', subtitle: 'SPOTIFY PREMIUM' },
  's13': { bg1: '#051a0a', bg2: '#080808', accent: '#1db954', accent2: '#166534', glow: '#1db954', icon: '👨‍👩‍👧', label: '1 MES', subtitle: 'SPOTIFY DUO' },
  's14': { bg1: '#081f0d', bg2: '#0a0a0a', accent: '#22c55e', accent2: '#15803d', glow: '#22c55e', icon: '👨‍👩‍👧‍👦', label: '1 MES', subtitle: 'SPOTIFY FAMILY' },
  's15': { bg1: '#0a250f', bg2: '#0d0d0d', accent: '#4ade80', accent2: '#1db954', glow: '#4ade80', icon: '🎓', label: '1 MES', subtitle: 'SPOTIFY STUDENT' },
  's16': { bg1: '#0d2a15', bg2: '#101010', accent: '#86efac', accent2: '#22c55e', glow: '#86efac', icon: '🎁', label: 'COMBO', subtitle: 'SPOTIFY + NETFLIX' },

  // DISNEY+ (s17-s21) - Blue/Gold
  's17': { bg1: '#051025', bg2: '#0a0815', accent: '#1d4ed8', accent2: '#11328a', glow: '#1d4ed8', icon: '🏰', label: '1 MES', subtitle: 'DISNEY PLUS' },
  's18': { bg1: '#081530', bg2: '#0d0a1a', accent: '#2563eb', accent2: '#1e40af', glow: '#2563eb', icon: '✨', label: '3 MESES', subtitle: 'DISNEY PLUS' },
  's19': { bg1: '#0a1a3a', bg2: '#100d20', accent: '#3b82f6', accent2: '#1d4ed8', glow: '#3b82f6', icon: '🎬', label: '6 MESES', subtitle: 'DISNEY PLUS' },
  's20': { bg1: '#0d2045', bg2: '#15102a', accent: '#60a5fa', accent2: '#2563eb', glow: '#60a5fa', icon: '⭐', label: '12 MESES', subtitle: 'DISNEY PLUS' },
  's21': { bg1: '#051025', bg2: '#0a0815', accent: '#11328a', accent2: '#1e3a5f', glow: '#11328a', icon: '🎁', label: 'COMBO', subtitle: 'DISNEY + HULU' },

  // HBO MAX (s22-s24) - Purple/Gold
  's22': { bg1: '#15052a', bg2: '#0a0815', accent: '#7c3aed', accent2: '#5b21b6', glow: '#7c3aed', icon: '🎬', label: '1 MES', subtitle: 'HBO MAX' },
  's23': { bg1: '#1a0835', bg2: '#0d0a1a', accent: '#8b5cf6', accent2: '#6d28d9', glow: '#8b5cf6', icon: '📺', label: '3 MESES', subtitle: 'HBO MAX' },
  's24': { bg1: '#200a40', bg2: '#100d20', accent: '#a78bfa', accent2: '#7c3aed', glow: '#a78bfa', icon: '⭐', label: '6 MESES', subtitle: 'HBO MAX' },

  // CRUNCHYROLL (s25-s28) - Orange/Blue
  's25': { bg1: '#1a0f05', bg2: '#050a15', accent: '#f97316', accent2: '#ea580c', glow: '#f97316', icon: '🎌', label: '1 MES', subtitle: 'CRUNCHYROLL PREMIUM' },
  's26': { bg1: '#1f1508', bg2: '#080f20', accent: '#fb923c', accent2: '#f97316', glow: '#fb923c', icon: '⚔️', label: '3 MESES', subtitle: 'CRUNCHYROLL PREMIUM' },
  's27': { bg1: '#1a0f05', bg2: '#050a15', accent: '#f97316', accent2: '#2563eb', glow: '#f97316', icon: '🇯🇵', label: '1 MES', subtitle: 'CRUNCHYROLL MEGA FAN' },
  's28': { bg1: '#1f1508', bg2: '#080f20', accent: '#fb923c', accent2: '#3b82f6', glow: '#fb923c', icon: '🎁', label: 'COMBO', subtitle: 'CRUNCHYROLL + VRV' },

  // PRIME VIDEO (s29-s30) - Blue/Teal
  's29': { bg1: '#051020', bg2: '#081515', accent: '#00a8e1', accent2: '#0077b6', glow: '#00a8e1', icon: '📺', label: '1 MES', subtitle: 'PRIME VIDEO' },
  's30': { bg1: '#081530', bg2: '#0d1f1f', accent: '#00b4d8', accent2: '#0096c7', glow: '#00b4d8', icon: '🎬', label: '6 MESES', subtitle: 'PRIME VIDEO' },

  // PARAMOUNT+ (s31-s32) - Royal Blue/White
  's31': { bg1: '#050d20', bg2: '#101015', accent: '#1e40af', accent2: '#e2e8f0', glow: '#1e40af', icon: '🏔️', label: '1 MES', subtitle: 'PARAMOUNT PLUS' },
  's32': { bg1: '#081530', bg2: '#151520', accent: '#2563eb', accent2: '#f1f5f9', glow: '#2563eb', icon: '⭐', label: '1 AÑO', subtitle: 'PARAMOUNT PLUS' },

  // APPLE TV+ (s33-s34) - Gray/White Minimalist
  's33': { bg1: '#101015', bg2: '#1a1a20', accent: '#a1a1aa', accent2: '#e4e4e7', glow: '#a1a1aa', icon: '🍎', label: '1 MES', subtitle: 'APPLE TV PLUS' },
  's34': { bg1: '#151520', bg2: '#1f1f28', accent: '#d4d4d8', accent2: '#f4f4f5', glow: '#d4d4d8', icon: '📺', label: '3 MESES', subtitle: 'APPLE TV PLUS' },
};

function generateCardHTML(style, id) {
  // Generate unique decorative elements based on product id
  const seed = id.charCodeAt(0) * 100 + (parseInt(id.slice(1)) || 0);
  const rot1 = (seed * 37) % 360;
  const rot2 = (seed * 73) % 360;
  const size1 = 150 + (seed % 200);
  const size2 = 100 + (seed % 150);
  const x1 = 10 + (seed % 80);
  const y1 = 10 + (seed % 80);
  const x2 = 20 + (seed % 60);
  const y2 = 30 + (seed % 50);
  
  // Unique pattern based on category
  const cat = id[0];
  let pattern = '';
  if (cat === 'g') {
    pattern = `<div style="position:absolute;top:0;left:0;right:0;bottom:0;background:repeating-linear-gradient(${rot1}deg, transparent, transparent 20px, rgba(255,255,255,0.02) 20px, rgba(255,255,255,0.02) 21px);"></div>
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:repeating-linear-gradient(${rot2}deg, transparent, transparent 30px, rgba(255,255,255,0.015) 30px, rgba(255,255,255,0.015) 31px);"></div>`;
  } else if (cat === 's') {
    pattern = `<div style="position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 30% 40%, rgba(255,255,255,0.03) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.02) 0%, transparent 40%);"></div>`;
  }

  return `<!DOCTYPE html>
<html><head><style>* { margin:0; padding:0; box-sizing:border-box; }</style></head>
<body style="width:1024px;height:1024px;overflow:hidden;background:linear-gradient(135deg, ${style.bg1}, ${style.bg2});font-family:'Segoe UI',system-ui,sans-serif;">
  ${pattern}
  
  <!-- Decorative circles -->
  <div style="position:absolute;top:${y1}%;left:${x1}%;width:${size1}px;height:${size1}px;border-radius:50%;background:radial-gradient(circle, ${style.glow}15, transparent 70%);transform:rotate(${rot1}deg);filter:blur(40px);"></div>
  <div style="position:absolute;bottom:${y2}%;right:${x2}%;width:${size2}px;height:${size2}px;border-radius:50%;background:radial-gradient(circle, ${style.accent2}20, transparent 70%);transform:rotate(${rot2}deg);filter:blur(30px);"></div>
  
  <!-- Grid overlay -->
  <div style="position:absolute;top:0;left:0;right:0;bottom:0;background-image:linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);background-size:64px 64px;"></div>
  
  <!-- Center content -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:100%;padding:60px;">
    
    <!-- Icon circle -->
    <div style="width:280px;height:280px;margin:0 auto 40px;border-radius:50%;background:radial-gradient(circle at 40% 40%, ${style.accent}30, ${style.accent}08);border:2px solid ${style.accent}40;display:flex;align-items:center;justify-content:center;box-shadow:0 0 80px ${style.glow}20, inset 0 0 60px ${style.accent}10;">
      <div style="font-size:120px;filter:drop-shadow(0 0 30px ${style.glow}60);">${style.icon}</div>
    </div>
    
    <!-- Label -->
    <div style="font-size:64px;font-weight:900;color:${style.accent};letter-spacing:8px;text-shadow:0 0 40px ${style.glow}50, 0 0 80px ${style.glow}30;margin-bottom:16px;">${style.label}</div>
    
    <!-- Subtitle -->
    <div style="font-size:28px;font-weight:600;color:${style.accent2};letter-spacing:6px;opacity:0.9;text-transform:uppercase;">${style.subtitle}</div>
    
    <!-- Decorative line -->
    <div style="width:200px;height:3px;margin:30px auto 0;background:linear-gradient(90deg, transparent, ${style.accent}, transparent);border-radius:2px;"></div>
  </div>
  
  <!-- Corner accents -->
  <div style="position:absolute;top:30px;left:30px;width:60px;height:60px;border-top:3px solid ${style.accent}50;border-left:3px solid ${style.accent}50;"></div>
  <div style="position:absolute;top:30px;right:30px;width:60px;height:60px;border-top:3px solid ${style.accent}50;border-right:3px solid ${style.accent}50;"></div>
  <div style="position:absolute;bottom:30px;left:30px;width:60px;height:60px;border-bottom:3px solid ${style.accent}50;border-left:3px solid ${style.accent}50;"></div>
  <div style="position:absolute;bottom:30px;right:30px;width:60px;height:60px;border-bottom:3px solid ${style.accent}50;border-right:3px solid ${style.accent}50;"></div>
  
  <!-- Top glow bar -->
  <div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg, ${style.bg1}, ${style.accent}, ${style.accent2}, ${style.bg2});"></div>
  <!-- Bottom glow bar -->
  <div style="position:absolute;bottom:0;left:0;right:0;height:4px;background:linear-gradient(90deg, ${style.bg2}, ${style.accent2}, ${style.accent}, ${style.bg1});"></div>
</body></html>`;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
  
  const entries = Object.entries(productStyles);
  console.log(`Generating ${entries.length} product images...`);
  
  let success = 0, fail = 0;
  
  for (const [id, style] of entries) {
    const outputPath = path.join(OUTPUT_DIR, `${id}.png`);
    try {
      const html = generateCardHTML(style, id);
      await page.setContent(html, { waitUntil: 'networkidle' });
      await page.screenshot({ path: outputPath, type: 'png' });
      success++;
      console.log(`  [${success + fail + 1}/${entries.length}] OK: ${id}.png`);
    } catch (error) {
      fail++;
      console.error(`  FAIL: ${id} - ${error.message}`);
    }
  }
  
  await browser.close();
  console.log(`\nDone: ${success} success, ${fail} failed`);
}

main();
