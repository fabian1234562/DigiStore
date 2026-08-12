import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = '/home/z/my-project/public/products/gen';

// Read all products from store.ts to get complete list
const storeContent = fs.readFileSync('/home/z/my-project/src/lib/store.ts', 'utf-8');
const productMatches = storeContent.matchAll(/id: '([^']+)',\s*name: '([^']+)',\s*description: '[^']+',\s*price: [\d.]+,\s*originalPrice: [\d.]+,\s*category: '([^']+)',\s*subcategory: '([^']+)',\s*image: '[^']+',/g);

const products = [];
for (const m of productMatches) {
  products.push({ id: m[1], name: m[2], category: m[3], subcategory: m[4] });
}

console.log(`Found ${products.length} products`);

// Seed-based random for deterministic unique results per product
function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Color palettes per category
const categoryPalettes = {
  gaming: [
    ['#0f0c29','#302b63','#24243e'], ['#1a0a2e','#3d1a78','#12045e'], ['#0a0a1a','#1a0a3e','#2d1b69'],
    ['#0d1117','#161b22','#1f2937'], ['#0c0c1d','#1a1a3e','#2e1065'], ['#050510','#0f0f2e','#1e1b4b'],
    ['#0a0520','#1a0d40','#2d1a5e'], ['#0d0a1f','#1f1040','#3b1a6e'], ['#050a15','#0d1a30','#1a2d50'],
    ['#0a0d15','#1a2040','#2a3560'], ['#0f0a15','#201035','#351a55'], ['#050510','#101030','#201a50'],
  ],
  streaming: [
    ['#0a0a0a','#1a0505','#2a0a0a'], ['#050505','#0a0a1a','#101030'], ['#0a0510','#150a20','#200f35'],
    ['#080510','#100a20','#1a1035'], ['#050a0a','#0a1515','#102020'], ['#0a0505','#150a0a','#200f0f'],
  ],
  accounts: [
    ['#0a1a0a','#0d200d','#103010'], ['#0a0a1a','#0d0d25','#101030'], ['#1a0a0a','#250d0d','#301010'],
  ],
  giftcards: [
    ['#1a1505','#2a200a','#3a2a10'], ['#0a151a','#0d2025','#102a35'], ['#150a1a','#200d25','#2a1035'],
    ['#0a1a10','#0d2515','#103020'], ['#1a0a10','#250d15','#301020'],
  ],
  software: [
    ['#0a1520','#0d1f30','#102a40'], ['#050a1a','#0d1025','#101530'], ['#0a1015','#0d1520','#101a25'],
  ],
  subscriptions: [
    ['#10051a','#1a0a25','#250f35'], ['#0a0515','#100a20','#1a0f30'], ['#150510','#200a15','#2a0f20'],
  ],
};

// Vibrant accent colors per subcategory
const subcategoryAccents = {
  'V-Bucks': ['#00d4ff','#38bdf8','#7dd3fc','#0ea5e9','#0284c7','#06b6d4','#22d3ee','#67e8f9'],
  'Robux': ['#f87171','#fb923c','#fbbf24','#ef4444','#f97316','#eab308','#dc2626','#ea580c'],
  'Skins': ['#ff4655','#14b8a6','#f43f5e','#8b5cf6','#ec4899','#06b6d4','#f97316','#22c55e'],
  'Monedas': ['#fbbf24','#3b82f6','#4ade80','#f97316','#a855f7','#ef4444','#22d3ee','#eab308'],
  'Pases de Batalla': ['#f97316','#c084fc','#fb923c','#a78bfa','#fbbf24','#818cf8','#ea580c','#6366f1'],
  'Cuentas': ['#4ade80','#22d3ee','#a78bfa','#86efac','#67e8f9','#c084fc','#34d399','#a5b4fc'],
  'Items': ['#d4af37','#f97316','#22c55e','#fbbf24','#ef4444','#3b82f6','#eab308','#8b5cf6'],
  'Netflix': ['#e50914','#dc2626','#ef4444','#f87171','#b91c1c','#991b1b','#fb7185','#fca5a5'],
  'Spotify': ['#1db954','#22c55e','#4ade80','#86efac','#16a34a','#15803d','#059669','#14b8a6'],
  'Disney+': ['#1d4ed8','#2563eb','#3b82f6','#60a5fa','#1e40af','#1e3a8a','#93c5fd','#a5b4fc'],
  'HBO Max': ['#7c3aed','#8b5cf6','#a78bfa','#c084fc','#6d28d9','#5b21b6','#ddd6fe','#e9d5ff'],
  'Crunchyroll': ['#f97316','#fb923c','#ea580c','#f59e0b','#ef4444','#dc2626','#fbbf24','#eab308'],
  'Prime Video': ['#00a8e1','#00b4d8','#0096c7','#0077b6','#48cae4','#90e0ef','#023e8a','#03045e'],
  'Paramount+': ['#1e40af','#2563eb','#1d4ed8','#3b82f6','#60a5fa','#93c5fd','#e2e8f0','#f1f5f9'],
  'Apple TV+': ['#a1a1aa','#d4d4d8','#e4e4e7','#f4f4f5','#71717a','#52525b','#f8fafc','#18181b'],
  'Max': ['#7c3aed','#8b5cf6','#a78bfa','#c084fc','#6d28d9','#5b21b6','#9333ea','#7e22ce'],
  'Amazon Prime': ['#00a8e1','#00b4d8','#0096c7','#0077b6','#48cae4','#90e0ef','#023e8a','#38bdf8'],
  'Hulu': ['#1ce783','#22c55e','#4ade80','#86efac','#16a34a','#15803d','#34d399','#059669'],
  'Peacock': ['#000000','#1a1a2e','#2d2d44','#40405a','#f9f9f9','#e5e5e5','#c0c0c0','#808080'],
  'DAZN': ['#f52f29','#ef4444','#dc2626','#f87171','#b91c1c','#f97316','#fb923c','#ea580c'],
  'Star+': ['#003566','#005f99','#0077b6','#00a8e1','#0096c7','#48cae4','#023e8a','#90e0ef'],
  'Streaming': ['#e50914','#1db954','#1d4ed8','#7c3aed','#f97316','#00a8e1','#1e40af','#8b5cf6'],
  'Gaming': ['#7c3aed','#22c55e','#3b82f6','#ef4444','#f97316','#eab308','#06b6d4','#ec4899'],
  'Redes Sociales': ['#3b82f6','#60a5fa','#93c5fd','#1d4ed8','#2563eb','#0ea5e9','#38bdf8','#0284c7'],
  'Steam': ['#171a21','#2a475e','#66c0f4','#1b2838','#4c6b8a','#3a7bd5','#00d4ff','#5c7e10'],
  'PlayStation': ['#003087','#00439c','#006FCD','#0070d1','#0054a6','#003d7a','#4a9eed','#1a5fb4'],
  'Xbox': ['#107c10','#0e6b0e','#0d5d0d','#9bf00b','#00bcf2','#0078d4','#2dcc70','#5dc21e'],
  'Google Play': ['#01875f','#34a853','#4285f4','#fbbc04','#ea4335','#1a73e8','#f9ab00','#188038'],
  'Apple': ['#555555','#a2aaad','#333333','#007aff','#34c759','#ff9500','#ff3b30','#af52de'],
  'Amazon': ['#ff9900','#f59e0b','#fbbf24','#ea580c','#f97316','#d97706','#fde68a','#b45309'],
  'Epic Games': ['#2a2a2a','#313131','#0078f2','#0078f2','#121212','#444444','#00a4ef','#ffffff'],
  'Nintendo': ['#e4000f','#c4000d','#ff4500','#ff6347','#8b0000','#dc143c','#ff0000','#b22222'],
  'Licencias Windows': ['#0078d4','#00a4ef','#00bcf2','#50e6ff','#005a9e','#003d7a','#2dcc70','#4fc3f7'],
  'Office': ['#d83b01','#f25022','#00a4ef','#7fba00','#ffb900','#737373','#5c2d91','#107c10'],
  'Herramientas': ['#3b82f6','#60a5fa','#8b5cf6','#a78bfa','#06b6d4','#22d3ee','#10b981','#34d399'],
  'VPN': ['#22c55e','#16a34a','#059669','#0d9488','#14b8a6','#2dd4bf','#4ade80','#86efac'],
  'Antivirus': ['#ef4444','#dc2626','#f97316','#ea580c','#eab308','#f59e0b','#3b82f6','#6366f1'],
  'YouTube Premium': ['#ff0000','#cc0000','#ff4444','#ff6666','#e50914','#dc2626','#f87171','#b91c1c'],
  'Discord Nitro': ['#5865f2','#7289da','#9b59b6','#8e44ad','#5765f2','#4752c4','#7983f5','#99aab5'],
  'Cloud Gaming': ['#7c3aed','#8b5cf6','#a78bfa','#6366f1','#4f46e5','#818cf8','#c084fc','#d946ef'],
  'Twitch': ['#9146ff','#a970ff','#bf94ff','#6441a5','#772ce8','#9147ff','#c9a0ff','#e9d5ff'],
  'Canva Pro': ['#00c4cc','#00d4db','#00e4ea','#7c3aed','#8b5cf6','#06b6d4','#0ea5e9','#38bdf8'],
  'PlayStation Plus': ['#003087','#006FCD','#0070d1','#0054a6','#4a9eed','#1a5fb4','#003d7a','#00439c'],
  'EA Play': ['#f56c2d','#e85d26','#ff7b3a','#f59e0b','#fbbf24','#ea580c','#f97316','#d97706'],
  'AI': ['#8b5cf6','#a78bfa','#6366f1','#4f46e5','#818cf8','#c084fc','#d946ef','#ec4899'],
};

function generateArtHTML(product, index) {
  const rng = seededRandom(
    product.id.charCodeAt(0) * 1000 + 
    (parseInt(product.id.slice(1)) || 0) * 100 + 
    product.subcategory.charCodeAt(0)
  );
  
  const palettes = categoryPalettes[product.category] || categoryPalettes.gaming;
  const palette = palettes[index % palettes.length];
  
  // Get accent colors for this subcategory
  const accents = subcategoryAccents[product.subcategory] || 
    (subcategoryAccents[Object.keys(subcategoryAccents).find(k => product.subcategory.toLowerCase().includes(k.toLowerCase()))] || ['#f97316','#3b82f6','#22c55e','#ef4444','#a855f7','#eab308','#06b6d4','#ec4899']);
  const accent = accents[index % accents.length];
  const accent2 = accents[(index + 3) % accents.length];
  const accent3 = accents[(index + 5) % accents.length];
  
  // Generate unique layout parameters
  const bgAngle = 100 + Math.floor(rng() * 160);
  const c1x = 10 + Math.floor(rng() * 60);
  const c1y = 10 + Math.floor(rng() * 60);
  const c1s = 200 + Math.floor(rng() * 300);
  const c2x = 30 + Math.floor(rng() * 50);
  const c2y = 30 + Math.floor(rng() * 50);
  const c2s = 150 + Math.floor(rng() * 250);
  const c3x = 50 + Math.floor(rng() * 40);
  const c3y = 50 + Math.floor(rng() * 40);
  const c3s = 100 + Math.floor(rng() * 200);
  
  // Unique geometric patterns
  const shapeType = Math.floor(rng() * 6); // 0=circle, 1=ring, 2=hex, 3=triangle, 4=line-burst, 5=diamond-grid
  const patternAngle = Math.floor(rng() * 360);
  const lineCount = 3 + Math.floor(rng() * 8);
  
  // Build unique geometric shapes HTML
  let shapesHTML = '';
  
  // Large ambient glow orbs
  shapesHTML += `<div style="position:absolute;left:${c1x}%;top:${c1y}%;width:${c1s}px;height:${c1s}px;border-radius:50%;background:radial-gradient(circle,${accent}25,${accent}08 50%,transparent 70%);filter:blur(40px);transform:translate(-50%,-50%);"></div>`;
  shapesHTML += `<div style="position:absolute;left:${c2x}%;top:${c2y}%;width:${c2s}px;height:${c2s}px;border-radius:50%;background:radial-gradient(circle,${accent2}20,${accent2}05 50%,transparent 70%);filter:blur(50px);transform:translate(-50%,-50%);"></div>`;
  shapesHTML += `<div style="position:absolute;left:${c3x}%;top:${c3y}%;width:${c3s}px;height:${c3s}px;border-radius:50%;background:radial-gradient(circle,${accent3}18,transparent 60%);filter:blur(35px);transform:translate(-50%,-50%);"></div>`;
  
  // Geometric pattern based on shapeType
  if (shapeType === 0) {
    // Concentric circles
    for (let i = 0; i < 4; i++) {
      const size = 150 + i * 80 + Math.floor(rng() * 50);
      const opacity = (0.15 - i * 0.03).toFixed(2);
      shapesHTML += `<div style="position:absolute;left:50%;top:50%;width:${size}px;height:${size}px;border-radius:50%;border:1.5px solid ${accent}${Math.round(opacity*255).toString(16).padStart(2,'0')};transform:translate(-50%,-50%);"></div>`;
    }
  } else if (shapeType === 1) {
    // Rotating rings
    for (let i = 0; i < 3; i++) {
      const size = 200 + i * 100;
      const rot = patternAngle + i * 30;
      const opacity = (0.12 - i * 0.03).toFixed(2);
      shapesHTML += `<div style="position:absolute;left:50%;top:50%;width:${size}px;height:${size}px;border:2px solid ${i%2===0?accent:accent2}${Math.round(opacity*255).toString(16).padStart(2,'0')};border-radius:50%;transform:translate(-50%,-50%) rotate(${rot}deg);"></div>`;
    }
  } else if (shapeType === 2) {
    // Hexagonal grid
    const hexSize = 80 + Math.floor(rng() * 60);
    const positions = [[25,25],[50,15],[75,25],[25,50],[50,50],[75,50],[25,75],[50,85],[75,75]];
    for (const [px,py] of positions.slice(0, 5 + Math.floor(rng()*4))) {
      const opacity = (0.08 + rng()*0.07).toFixed(2);
      shapesHTML += `<div style="position:absolute;left:${px}%;top:${py}%;width:${hexSize}px;height:${hexSize*0.866}px;clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:${accent}${Math.round(opacity*255).toString(16).padStart(2,'0')};transform:translate(-50%,-50%) rotate(${patternAngle}deg);"></div>`;
    }
  } else if (shapeType === 3) {
    // Triangle composition
    for (let i = 0; i < 3; i++) {
      const size = 120 + i * 80;
      const rot = patternAngle + i * 40;
      const opacity = (0.1 - i * 0.02).toFixed(2);
      const col = [accent, accent2, accent3][i];
      shapesHTML += `<div style="position:absolute;left:${30+i*15}%;top:${35+i*10}%;width:0;height:0;border-left:${size/2}px solid transparent;border-right:${size/2}px solid transparent;border-bottom:${size*0.866}px solid ${col}${Math.round(opacity*255).toString(16).padStart(2,'0')};transform:rotate(${rot}deg);filter:blur(2px);"></div>`;
    }
  } else if (shapeType === 4) {
    // Radiating lines
    const cx = 30 + Math.floor(rng() * 40);
    const cy = 30 + Math.floor(rng() * 40);
    for (let i = 0; i < lineCount; i++) {
      const angle = (360 / lineCount) * i + patternAngle;
      const len = 200 + Math.floor(rng() * 400);
      const opacity = (0.06 + rng() * 0.08).toFixed(2);
      const rad = angle * Math.PI / 180;
      const x2 = cx + Math.cos(rad) * (len/1024*100);
      const y2 = cy + Math.sin(rad) * (len/1024*100);
      shapesHTML += `<div style="position:absolute;left:${cx}%;top:${cy}%;width:${len}px;height:1.5px;background:linear-gradient(90deg,${accent}${Math.round(opacity*255).toString(16).padStart(2,'0')},transparent);transform-origin:0 0;transform:rotate(${angle}deg);"></div>`;
    }
  } else {
    // Diamond grid
    for (let i = 0; i < 6; i++) {
      const size = 60 + Math.floor(rng() * 80);
      const px = 15 + Math.floor(rng() * 70);
      const py = 15 + Math.floor(rng() * 70);
      const rot = Math.floor(rng() * 45);
      const opacity = (0.08 + rng() * 0.08).toFixed(2);
      const col = i%2===0 ? accent : accent2;
      shapesHTML += `<div style="position:absolute;left:${px}%;top:${py}%;width:${size}px;height:${size}px;border:1.5px solid ${col}${Math.round(opacity*255).toString(16).padStart(2,'0')};transform:translate(-50%,-50%) rotate(${rot}deg);"></div>`;
    }
  }
  
  // Particle dots
  for (let i = 0; i < 15; i++) {
    const px = 5 + Math.floor(rng() * 90);
    const py = 5 + Math.floor(rng() * 90);
    const dotSize = 2 + Math.floor(rng() * 4);
    const opacity = (0.2 + rng() * 0.4).toFixed(2);
    const col = [accent, accent2, accent3][Math.floor(rng() * 3)];
    shapesHTML += `<div style="position:absolute;left:${px}%;top:${py}%;width:${dotSize}px;height:${dotSize}px;border-radius:50%;background:${col};opacity:${opacity};box-shadow:0 0 ${dotSize*3}px ${col}80;"></div>`;
  }
  
  // Corner accents (unique per product)
  const cornerSize = 40 + Math.floor(rng() * 40);
  const cornerOp = Math.round((0.2 + rng() * 0.15) * 255).toString(16).padStart(2, '0');
  shapesHTML += `<div style="position:absolute;top:20px;left:20px;width:${cornerSize}px;height:${cornerSize}px;border-top:2px solid ${accent}${cornerOp};border-left:2px solid ${accent}${cornerOp};"></div>`;
  shapesHTML += `<div style="position:absolute;bottom:20px;right:20px;width:${cornerSize}px;height:${cornerSize}px;border-bottom:2px solid ${accent2}${cornerOp};border-right:2px solid ${accent2}${cornerOp};"></div>`;
  
  // Top/bottom accent bars
  shapesHTML += `<div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,${accent}60,${accent2}40,transparent);"></div>`;
  shapesHTML += `<div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,${accent2}60,${accent}40,transparent);"></div>`;
  
  return `<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box;}</style></head><body style="width:1024px;height:1024px;overflow:hidden;background:linear-gradient(${bgAngle}deg,${palette[0]},${palette[1]},${palette[2]});font-family:system-ui,sans-serif;">
  <!-- Subtle grid -->
  <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px);background-size:64px 64px;"></div>
  
  ${shapesHTML}
  
  <!-- Center focal glow -->
  <div style="position:absolute;left:50%;top:50%;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,${accent}15,transparent 60%);transform:translate(-50%,-50%);filter:blur(20px);"></div>
  
  <!-- Vignette -->
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 30%,rgba(0,0,0,0.4) 100%);"></div>
</body></html>`;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
  
  let success = 0, fail = 0, skipped = 0;
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const outputPath = path.join(OUTPUT_DIR, `${product.id}.png`);
    
    if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 10000) {
      skipped++;
      continue;
    }
    
    try {
      const html = generateArtHTML(product, i);
      await page.setContent(html, { waitUntil: 'load' });
      await page.screenshot({ path: outputPath, type: 'png' });
      const stats = fs.statSync(outputPath);
      success++;
      if (success <= 5 || success % 20 === 0) console.log(`  [${success}/${products.length-skipped}] ${product.id}.png (${(stats.size/1024).toFixed(1)} KB)`);
    } catch (error) {
      fail++;
      console.error(`  [FAIL] ${product.id}: ${error.message}`);
    }
  }
  
  await browser.close();
  console.log(`\nDone: ${success} created, ${skipped} existed, ${fail} failed out of ${products.length} total`);
}

main();
