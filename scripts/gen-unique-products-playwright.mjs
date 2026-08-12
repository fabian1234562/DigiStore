import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const GEN_DIR = '/home/z/my-project/public/products/gen';

// Each product gets a completely unique visual treatment
// Using the AI-generated base image as background + unique CSS overlays
const productCards = [
  // ===== GAMING =====
  { id: 'g1', base: 'fortnite.png', overlay: 'linear-gradient(160deg, rgba(0,100,255,0.7), rgba(0,0,0,0.3))', accent: '#00d4ff', shape: 'circle', pos: '20% 30%', badge: '1000' },
  { id: 'g2', base: 'fortnite.png', overlay: 'linear-gradient(200deg, rgba(100,50,200,0.65), rgba(0,0,0,0.35))', accent: '#a855f7', shape: 'diamond', pos: '70% 60%', badge: '2800' },
  { id: 'g3', base: 'fortnite.png', overlay: 'linear-gradient(140deg, rgba(0,180,255,0.6), rgba(20,0,80,0.4))', accent: '#38bdf8', shape: 'hexagon', pos: '50% 20%', badge: '5000' },
  { id: 'g4', base: 'fortnite.png', overlay: 'linear-gradient(180deg, rgba(255,180,0,0.65), rgba(0,0,50,0.35))', accent: '#fbbf24', shape: 'circle', pos: '30% 70%', badge: '13500' },
  { id: 'g8', base: 'fortnite.png', overlay: 'linear-gradient(120deg, rgba(255,100,0,0.6), rgba(100,0,150,0.4))', accent: '#f97316', shape: 'star', pos: '60% 40%', badge: 'PASS' },

  { id: 'g5', base: 'roblox.png', overlay: 'linear-gradient(170deg, rgba(255,50,50,0.7), rgba(0,0,0,0.3))', accent: '#ef4444', shape: 'circle', pos: '25% 35%', badge: '800' },
  { id: 'g6', base: 'roblox.png', overlay: 'linear-gradient(210deg, rgba(255,140,0,0.65), rgba(50,0,0,0.35))', accent: '#f97316', shape: 'diamond', pos: '65% 55%', badge: '1700' },
  { id: 'g7', base: 'roblox.png', overlay: 'linear-gradient(150deg, rgba(255,200,0,0.6), rgba(80,0,0,0.4))', accent: '#eab308', shape: 'hexagon', pos: '45% 25%', badge: '4500' },

  { id: 'g9', base: 'valorant.png', overlay: 'linear-gradient(160deg, rgba(255,50,50,0.7), rgba(0,0,0,0.4))', accent: '#ff4655', shape: 'circle', pos: '30% 40%', badge: 'SKIN' },
  { id: 'g10', base: 'valorant.png', overlay: 'linear-gradient(190deg, rgba(50,200,200,0.6), rgba(0,0,0,0.4))', accent: '#14b8a6', shape: 'diamond', pos: '60% 50%', badge: '5000VP' },

  { id: 'g11', base: 'minecraft.png', overlay: 'linear-gradient(150deg, rgba(50,200,80,0.65), rgba(0,30,0,0.35))', accent: '#4ade80', shape: 'square', pos: '35% 45%', badge: 'JAVA' },
  { id: 'g12', base: 'minecraft.png', overlay: 'linear-gradient(200deg, rgba(0,180,200,0.6), rgba(0,20,40,0.4))', accent: '#22d3ee', shape: 'circle', pos: '55% 35%', badge: 'BEDROCK' },

  { id: 'g13', base: 'lol.png', overlay: 'linear-gradient(170deg, rgba(255,180,0,0.65), rgba(0,0,50,0.35))', accent: '#fbbf24', shape: 'circle', pos: '40% 30%', badge: '1380RP' },
  { id: 'g14', base: 'lol.png', overlay: 'linear-gradient(130deg, rgba(80,80,255,0.6), rgba(0,0,30,0.4))', accent: '#6366f1', shape: 'diamond', pos: '50% 60%', badge: '3500RP' },
  { id: 'g42', base: 'lol.png', overlay: 'linear-gradient(180deg, rgba(100,150,255,0.6), rgba(0,0,40,0.4))', accent: '#60a5fa', shape: 'hexagon', pos: '30% 50%', badge: 'WILD' },

  { id: 'g15', base: 'genshin.png', overlay: 'linear-gradient(160deg, rgba(0,200,220,0.65), rgba(20,0,50,0.35))', accent: '#22d3ee', shape: 'circle', pos: '45% 35%', badge: 'CRYSTAL' },
  { id: 'g16', base: 'genshin.png', overlay: 'linear-gradient(140deg, rgba(200,180,50,0.6), rgba(30,10,60,0.4))', accent: '#fcd34d', shape: 'star', pos: '55% 55%', badge: 'WELKIN' },

  { id: 'g17', base: 'apex.png', overlay: 'linear-gradient(170deg, rgba(255,100,0,0.7), rgba(0,0,0,0.3))', accent: '#f97316', shape: 'circle', pos: '35% 40%', badge: '1000' },
  { id: 'g18', base: 'apex.png', overlay: 'linear-gradient(200deg, rgba(200,50,0,0.65), rgba(0,0,0,0.35))', accent: '#dc2626', shape: 'diamond', pos: '60% 45%', badge: '2150' },

  { id: 'g19', base: 'pubgm.png', overlay: 'linear-gradient(150deg, rgba(200,180,0,0.65), rgba(0,0,0,0.35))', accent: '#eab308', shape: 'square', pos: '40% 35%', badge: '600UC' },
  { id: 'g20', base: 'pubgm.png', overlay: 'linear-gradient(180deg, rgba(150,150,150,0.6), rgba(0,0,0,0.4))', accent: '#9ca3af', shape: 'circle', pos: '50% 55%', badge: '3250UC' },

  { id: 'g21', base: 'freefire.png', overlay: 'linear-gradient(160deg, rgba(255,50,0,0.7), rgba(0,0,0,0.3))', accent: '#ef4444', shape: 'circle', pos: '30% 45%', badge: '1000' },
  { id: 'g22', base: 'freefire.png', overlay: 'linear-gradient(190deg, rgba(255,130,0,0.65), rgba(0,0,0,0.35))', accent: '#f97316', shape: 'diamond', pos: '55% 40%', badge: '5600' },

  { id: 'g23', base: 'amongus.png', overlay: 'linear-gradient(140deg, rgba(220,30,80,0.65), rgba(0,0,50,0.35))', accent: '#f43f5e', shape: 'circle', pos: '45% 40%', badge: 'SKINS' },

  { id: 'g24', base: 'clashroyale.png', overlay: 'linear-gradient(170deg, rgba(140,50,220,0.65), rgba(0,0,30,0.35))', accent: '#a855f7', shape: 'diamond', pos: '40% 35%', badge: '1400' },
  { id: 'g50', base: 'clashroyale.png', overlay: 'linear-gradient(150deg, rgba(180,80,255,0.6), rgba(10,0,40,0.4))', accent: '#c084fc', shape: 'hexagon', pos: '55% 50%', badge: '5000' },

  { id: 'g25', base: 'mobilelegends.png', overlay: 'linear-gradient(160deg, rgba(40,100,255,0.65), rgba(0,0,30,0.35))', accent: '#3b82f6', shape: 'circle', pos: '35% 40%', badge: '400' },
  { id: 'g26', base: 'mobilelegends.png', overlay: 'linear-gradient(200deg, rgba(255,180,0,0.6), rgba(0,0,20,0.4))', accent: '#f59e0b', shape: 'diamond', pos: '60% 55%', badge: '2200' },

  { id: 'g27', base: 'brawlstars.png', overlay: 'linear-gradient(150deg, rgba(30,80,230,0.7), rgba(0,0,0,0.3))', accent: '#2563eb', shape: 'circle', pos: '40% 30%', badge: '170' },
  { id: 'g28', base: 'brawlstars.png', overlay: 'linear-gradient(180deg, rgba(200,180,0,0.65), rgba(0,0,20,0.35))', accent: '#eab308', shape: 'star', pos: '50% 60%', badge: '1700' },

  { id: 'g29', base: 'cs2.png', overlay: 'linear-gradient(170deg, rgba(200,170,50,0.65), rgba(0,0,0,0.35))', accent: '#d4af37', shape: 'diamond', pos: '35% 45%', badge: 'PREMIUM' },
  { id: 'g30', base: 'cs2.png', overlay: 'linear-gradient(140deg, rgba(255,150,0,0.6), rgba(0,0,0,0.4))', accent: '#f97316', shape: 'square', pos: '55% 35%', badge: '5 KEYS' },

  { id: 'g31', base: 'gtav.png', overlay: 'linear-gradient(160deg, rgba(0,180,80,0.65), rgba(0,0,0,0.35))', accent: '#22c55e', shape: 'circle', pos: '40% 40%', badge: '$8M' },
  { id: 'g32', base: 'gtav.png', overlay: 'linear-gradient(190deg, rgba(50,200,100,0.6), rgba(0,0,0,0.4))', accent: '#4ade80', shape: 'diamond', pos: '60% 50%', badge: '$3.5M' },

  { id: 'g33', base: 'cod.png', overlay: 'linear-gradient(150deg, rgba(80,150,10,0.65), rgba(0,0,0,0.35))', accent: '#65a30d', shape: 'square', pos: '35% 35%', badge: '2400CP' },
  { id: 'g34', base: 'cod.png', overlay: 'linear-gradient(180deg, rgba(100,180,20,0.6), rgba(0,0,0,0.4))', accent: '#84cc16', shape: 'circle', pos: '50% 55%', badge: 'ACCOUNT' },

  { id: 'g35', base: 'honkai.png', overlay: 'linear-gradient(160deg, rgba(150,100,240,0.65), rgba(0,0,30,0.35))', accent: '#a78bfa', shape: 'circle', pos: '45% 35%', badge: 'SHARDS' },
  { id: 'g36', base: 'honkai.png', overlay: 'linear-gradient(140deg, rgba(180,130,250,0.6), rgba(10,0,40,0.4))', accent: '#c084fc', shape: 'star', pos: '55% 55%', badge: 'PASS' },

  { id: 'g37', base: 'wuthering.png', overlay: 'linear-gradient(170deg, rgba(30,200,190,0.65), rgba(0,0,20,0.35))', accent: '#2dd4bf', shape: 'hexagon', pos: '40% 40%', badge: 'ASTRITE' },

  { id: 'g38', base: 'eafc25.png', overlay: 'linear-gradient(150deg, rgba(20,140,50,0.65), rgba(0,0,0,0.35))', accent: '#16a34a', shape: 'circle', pos: '35% 40%', badge: '2800' },
  { id: 'g39', base: 'eafc25.png', overlay: 'linear-gradient(180deg, rgba(30,180,70,0.6), rgba(0,0,0,0.4))', accent: '#22c55e', shape: 'diamond', pos: '60% 50%', badge: '5600' },

  { id: 'g40', base: 'coc.png', overlay: 'linear-gradient(160deg, rgba(20,60,200,0.65), rgba(0,0,0,0.35))', accent: '#1d4ed8', shape: 'diamond', pos: '40% 35%', badge: '1400' },
  { id: 'g41', base: 'coc.png', overlay: 'linear-gradient(190deg, rgba(40,90,240,0.6), rgba(0,0,0,0.4))', accent: '#2563eb', shape: 'hexagon', pos: '55% 55%', badge: '5000' },

  { id: 'g43', base: 'diablo4.png', overlay: 'linear-gradient(170deg, rgba(200,20,20,0.7), rgba(0,0,0,0.4))', accent: '#dc2626', shape: 'circle', pos: '45% 40%', badge: 'HELL' },

  { id: 'g44', base: 'overwatch2.png', overlay: 'linear-gradient(150deg, rgba(255,130,0,0.65), rgba(0,0,30,0.35))', accent: '#f97316', shape: 'circle', pos: '35% 40%', badge: '1000' },
  { id: 'g45', base: 'overwatch2.png', overlay: 'linear-gradient(180deg, rgba(50,100,255,0.6), rgba(0,0,20,0.4))', accent: '#3b82f6', shape: 'diamond', pos: '60% 50%', badge: '5000' },

  { id: 'g46', base: 'rocketleague.png', overlay: 'linear-gradient(160deg, rgba(30,80,220,0.65), rgba(0,0,0,0.35))', accent: '#2563eb', shape: 'circle', pos: '40% 35%', badge: '200' },
  { id: 'g47', base: 'rocketleague.png', overlay: 'linear-gradient(140deg, rgba(255,140,0,0.6), rgba(0,0,20,0.4))', accent: '#f97316', shape: 'hexagon', pos: '55% 55%', badge: '11000' },

  { id: 'g48', base: 'destiny2.png', overlay: 'linear-gradient(170deg, rgba(200,210,230,0.5), rgba(0,0,30,0.4))', accent: '#e2e8f0', shape: 'circle', pos: '45% 40%', badge: '1000' },

  { id: 'g49', base: 'fifamobile.png', overlay: 'linear-gradient(150deg, rgba(20,120,50,0.65), rgba(0,0,0,0.35))', accent: '#15803d', shape: 'diamond', pos: '40% 40%', badge: '2M' },

  // ===== STREAMING =====
  { id: 's1', base: 'netflix.png', overlay: 'linear-gradient(160deg, rgba(180,0,10,0.75), rgba(0,0,0,0.3))', accent: '#e50914', shape: 'circle', pos: '30% 35%', badge: '1 MES' },
  { id: 's2', base: 'netflix.png', overlay: 'linear-gradient(200deg, rgba(220,30,30,0.7), rgba(0,0,0,0.35))', accent: '#dc2626', shape: 'diamond', pos: '65% 55%', badge: '3 MES' },
  { id: 's3', base: 'netflix.png', overlay: 'linear-gradient(140deg, rgba(255,60,60,0.65), rgba(10,0,0,0.4))', accent: '#ef4444', shape: 'hexagon', pos: '45% 25%', badge: '6 MES' },
  { id: 's4', base: 'netflix.png', overlay: 'linear-gradient(180deg, rgba(255,100,100,0.6), rgba(0,0,0,0.45))', accent: '#f87171', shape: 'circle', pos: '55% 65%', badge: '12 MES' },
  { id: 's5', base: 'netflix.png', overlay: 'linear-gradient(120deg, rgba(150,0,0,0.7), rgba(0,0,0,0.35))', accent: '#b91c1c', shape: 'square', pos: '40% 40%', badge: 'STD' },
  { id: 's6', base: 'netflix.png', overlay: 'linear-gradient(170deg, rgba(130,10,10,0.65), rgba(0,0,0,0.4))', accent: '#991b1b', shape: 'diamond', pos: '50% 50%', badge: '3M STD' },
  { id: 's7', base: 'netflix.png', overlay: 'linear-gradient(150deg, rgba(200,20,20,0.7), rgba(0,0,10,0.35))', accent: '#dc2626', shape: 'circle', pos: '35% 60%', badge: 'MOBILE' },
  { id: 's8', base: 'netflix.png', overlay: 'linear-gradient(190deg, rgba(220,50,80,0.65), rgba(0,0,30,0.4))', accent: '#fb7185', shape: 'star', pos: '60% 40%', badge: 'COMBO' },

  { id: 's9', base: 'spotify.png', overlay: 'linear-gradient(160deg, rgba(20,160,60,0.7), rgba(0,0,0,0.3))', accent: '#1db954', shape: 'circle', pos: '30% 35%', badge: '1 MES' },
  { id: 's10', base: 'spotify.png', overlay: 'linear-gradient(200deg, rgba(30,190,80,0.65), rgba(0,0,0,0.35))', accent: '#22c55e', shape: 'diamond', pos: '65% 55%', badge: '3 MES' },
  { id: 's11', base: 'spotify.png', overlay: 'linear-gradient(140deg, rgba(60,220,110,0.6), rgba(0,0,0,0.4))', accent: '#4ade80', shape: 'hexagon', pos: '45% 25%', badge: '6 MES' },
  { id: 's12', base: 'spotify.png', overlay: 'linear-gradient(180deg, rgba(100,240,150,0.55), rgba(0,0,0,0.45))', accent: '#86efac', shape: 'circle', pos: '55% 65%', badge: '12 MES' },
  { id: 's13', base: 'spotify.png', overlay: 'linear-gradient(120deg, rgba(10,130,50,0.7), rgba(0,0,0,0.35))', accent: '#166534', shape: 'square', pos: '40% 40%', badge: 'DUO' },
  { id: 's14', base: 'spotify.png', overlay: 'linear-gradient(170deg, rgba(25,170,70,0.65), rgba(0,0,0,0.4))', accent: '#16a34a', shape: 'diamond', pos: '50% 50%', badge: 'FAMILY' },
  { id: 's15', base: 'spotify.png', overlay: 'linear-gradient(150deg, rgba(5,140,90,0.7), rgba(0,0,10,0.35))', accent: '#059669', shape: 'circle', pos: '35% 60%', badge: 'STUDENT' },
  { id: 's16', base: 'spotify.png', overlay: 'linear-gradient(190deg, rgba(10,180,120,0.65), rgba(0,0,20,0.4))', accent: '#14b8a6', shape: 'star', pos: '60% 40%', badge: 'COMBO' },

  { id: 's17', base: 'disney.png', overlay: 'linear-gradient(160deg, rgba(20,60,200,0.7), rgba(0,0,30,0.3))', accent: '#1d4ed8', shape: 'circle', pos: '30% 35%', badge: '1 MES' },
  { id: 's18', base: 'disney.png', overlay: 'linear-gradient(200deg, rgba(40,90,240,0.65), rgba(0,0,30,0.35))', accent: '#2563eb', shape: 'diamond', pos: '65% 55%', badge: '3 MES' },
  { id: 's19', base: 'disney.png', overlay: 'linear-gradient(140deg, rgba(60,120,255,0.6), rgba(0,0,40,0.4))', accent: '#3b82f6', shape: 'hexagon', pos: '45% 25%', badge: '6 MES' },
  { id: 's20', base: 'disney.png', overlay: 'linear-gradient(180deg, rgba(100,160,255,0.55), rgba(0,0,40,0.45))', accent: '#60a5fa', shape: 'circle', pos: '55% 65%', badge: '12 MES' },
  { id: 's21', base: 'disney.png', overlay: 'linear-gradient(130deg, rgba(15,40,130,0.7), rgba(0,0,20,0.35))', accent: '#1e3a8a', shape: 'diamond', pos: '50% 50%', badge: 'COMBO' },

  { id: 's22', base: 'hbomax.png', overlay: 'linear-gradient(160deg, rgba(100,40,200,0.7), rgba(0,0,30,0.3))', accent: '#7c3aed', shape: 'circle', pos: '30% 35%', badge: '1 MES' },
  { id: 's23', base: 'hbomax.png', overlay: 'linear-gradient(200deg, rgba(130,60,220,0.65), rgba(0,0,30,0.35))', accent: '#8b5cf6', shape: 'diamond', pos: '65% 55%', badge: '3 MES' },
  { id: 's24', base: 'hbomax.png', overlay: 'linear-gradient(140deg, rgba(160,100,250,0.6), rgba(0,0,40,0.4))', accent: '#a78bfa', shape: 'hexagon', pos: '50% 50%', badge: '6 MES' },

  { id: 's25', base: 'crunchyroll.png', overlay: 'linear-gradient(160deg, rgba(240,110,20,0.7), rgba(0,0,0,0.3))', accent: '#f97316', shape: 'circle', pos: '30% 35%', badge: '1 MES' },
  { id: 's26', base: 'crunchyroll.png', overlay: 'linear-gradient(200deg, rgba(250,140,40,0.65), rgba(0,0,0,0.35))', accent: '#fb923c', shape: 'diamond', pos: '65% 55%', badge: '3 MES' },
  { id: 's27', base: 'crunchyroll.png', overlay: 'linear-gradient(140deg, rgba(230,90,10,0.6), rgba(0,0,20,0.4))', accent: '#ea580c', shape: 'square', pos: '45% 25%', badge: 'MEGA' },
  { id: 's28', base: 'crunchyroll.png', overlay: 'linear-gradient(170deg, rgba(240,110,20,0.65), rgba(0,0,50,0.4))', accent: '#f97316', shape: 'star', pos: '55% 55%', badge: 'COMBO' },

  { id: 's29', base: 'amazonprime.png', overlay: 'linear-gradient(160deg, rgba(0,140,210,0.7), rgba(0,0,30,0.3))', accent: '#00a8e1', shape: 'circle', pos: '30% 40%', badge: '1 MES' },
  { id: 's30', base: 'amazonprime.png', overlay: 'linear-gradient(190deg, rgba(0,170,220,0.65), rgba(0,0,30,0.35))', accent: '#00b4d8', shape: 'diamond', pos: '60% 50%', badge: '6 MES' },

  { id: 's31', base: 'paramount.png', overlay: 'linear-gradient(150deg, rgba(25,55,170,0.7), rgba(0,0,30,0.3))', accent: '#1e40af', shape: 'circle', pos: '35% 35%', badge: '1 MES' },
  { id: 's32', base: 'paramount.png', overlay: 'linear-gradient(180deg, rgba(40,80,200,0.65), rgba(0,0,30,0.35))', accent: '#2563eb', shape: 'diamond', pos: '55% 55%', badge: '1 AÑO' },

  { id: 's33', base: 'appletv.png', overlay: 'linear-gradient(160deg, rgba(120,120,130,0.6), rgba(0,0,0,0.4))', accent: '#a1a1aa', shape: 'circle', pos: '40% 40%', badge: '1 MES' },
  { id: 's34', base: 'appletv.png', overlay: 'linear-gradient(140deg, rgba(160,160,170,0.55), rgba(0,0,10,0.45))', accent: '#d4d4d8', shape: 'diamond', pos: '55% 50%', badge: '3 MES' },
];

// Need to read remaining products (giftcards, software, subscriptions, accounts)
// from store.ts to complete the list

function getShapeCSS(shape, accent, pos) {
  const [x, y] = pos.split(' ');
  const size = 120 + Math.random() * 80;
  const opacity = 0.15 + Math.random() * 0.1;
  
  switch(shape) {
    case 'circle':
      return `<div style="position:absolute;left:${x};top:${y};width:${size}px;height:${size}px;border-radius:50%;border:2px solid ${accent}${Math.round(opacity*255).toString(16).padStart(2,'0')};transform:translate(-50%,-50%);box-shadow:0 0 ${size}px ${accent}${Math.round(opacity*0.5*255).toString(16).padStart(2,'0')};"></div>`;
    case 'diamond':
      return `<div style="position:absolute;left:${x};top:${y};width:${size*0.7}px;height:${size*0.7}px;border:2px solid ${accent}${Math.round(opacity*255).toString(16).padStart(2,'0')};transform:translate(-50%,-50%) rotate(45deg);box-shadow:0 0 ${size*0.5}px ${accent}${Math.round(opacity*0.5*255).toString(16).padStart(2,'0')};"></div>`;
    case 'hexagon':
      return `<div style="position:absolute;left:${x};top:${y};width:${size}px;height:${size*0.866}px;border:2px solid ${accent}${Math.round(opacity*255).toString(16).padStart(2,'0')};transform:translate(-50%,-50%);clip-path:polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);box-shadow:0 0 ${size*0.7}px ${accent}${Math.round(opacity*0.5*255).toString(16).padStart(2,'0')};"></div>`;
    case 'square':
      return `<div style="position:absolute;left:${x};top:${y};width:${size*0.8}px;height:${size*0.8}px;border:2px solid ${accent}${Math.round(opacity*255).toString(16).padStart(2,'0')};transform:translate(-50%,-50%) rotate(15deg);box-shadow:0 0 ${size*0.5}px ${accent}${Math.round(opacity*0.5*255).toString(16).padStart(2,'0')};"></div>`;
    case 'star':
      return `<div style="position:absolute;left:${x};top:${y};width:${size}px;height:${size}px;transform:translate(-50%,-50%);background:radial-gradient(circle, ${accent}${Math.round(opacity*255).toString(16).padStart(2,'0')}, transparent 70%);filter:blur(20px);"></div>`;
    default:
      return '';
  }
}

function generateHTML(card, baseImagePath) {
  const shapeHTML = getShapeCSS(card.shape, card.accent, card.pos);
  
  // Unique decorative elements based on product ID
  const hash = card.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rot = (hash * 37) % 360;
  const linePos = (hash * 13) % 100;
  
  return `<!DOCTYPE html><html><head><style>* { margin:0; padding:0; box-sizing:border-box; }</style></head>
<body style="width:1024px;height:1024px;overflow:hidden;position:relative;">
  <!-- Base AI image as background -->
  <img src="file://${baseImagePath}" style="position:absolute;top:0;left:0;width:1024px;height:1024px;object-fit:cover;" />
  
  <!-- Unique gradient overlay -->
  <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:${card.overlay};"></div>
  
  <!-- Vignette -->
  <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%);"></div>
  
  <!-- Unique geometric shape -->
  ${shapeHTML}
  
  <!-- Decorative line -->
  <div style="position:absolute;top:${linePos}%;left:0;right:0;height:1px;background:linear-gradient(90deg, transparent, ${card.accent}40, transparent);transform:rotate(${rot > 180 ? rot - 360 : rot}deg);"></div>
  
  <!-- Top accent bar -->
  <div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg, transparent, ${card.accent}80, transparent);"></div>
  
  <!-- Bottom accent bar -->
  <div style="position:absolute;bottom:0;left:0;right:0;height:4px;background:linear-gradient(90deg, transparent, ${card.accent}60, transparent);"></div>
  
  <!-- Corner glow -->
  <div style="position:absolute;top:-50px;right:-50px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle, ${card.accent}20, transparent 70%);filter:blur(30px);"></div>
</body></html>`;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
  
  let success = 0, fail = 0, skipped = 0;
  
  for (const card of productCards) {
    const outputPath = path.join(GEN_DIR, `${card.id}.png`);
    const baseImagePath = path.join(GEN_DIR, card.base);
    
    if (!fs.existsSync(baseImagePath)) {
      console.log(`  [SKIP] ${card.id}: base ${card.base} not found`);
      skipped++;
      continue;
    }
    
    if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 10000) {
      console.log(`  [CACHED] ${card.id}.png`);
      skipped++;
      continue;
    }
    
    try {
      const html = generateHTML(card, baseImagePath);
      await page.setContent(html, { waitUntil: 'load' });
      await page.waitForTimeout(500); // ensure image loads
      await page.screenshot({ path: outputPath, type: 'png' });
      const stats = fs.statSync(outputPath);
      success++;
      console.log(`  [OK] ${card.id}.png (${(stats.size/1024).toFixed(1)} KB)`);
    } catch (error) {
      fail++;
      console.error(`  [FAIL] ${card.id}: ${error.message}`);
    }
  }
  
  await browser.close();
  console.log(`\nDone: ${success} created, ${skipped} cached/skipped, ${fail} failed`);
}

main();
