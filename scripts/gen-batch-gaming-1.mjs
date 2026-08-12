import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = '/home/z/my-project/public/products/gen';

const images = [
  { id: 'g1', filename: 'g1-vbucks1000.png', prompt: 'Premium digital product showcase card, Fortnite 1000 V-Bucks small bundle, a single glowing blue V-Buck coin floating in center with sparkle particles, deep blue and purple neon background with subtle lightning bolts, dark atmospheric gradient, professional 3D render, vibrant colors, high quality, no text, no letters' },
  { id: 'g2', filename: 'g2-vbucks2800.png', prompt: 'Premium digital product showcase card, Fortnite 2800 V-Bucks medium bundle, three glowing blue V-Buck coins stacked in pyramid formation with golden light rays, blue and purple nebula background with energy waves, dark atmospheric gradient, professional 3D render, vibrant colors, high quality, no text, no letters' },
  { id: 'g3', filename: 'g3-vbucks5000.png', prompt: 'Premium digital product showcase card, Fortnite 5000 V-Bucks large bundle, five glowing blue V-Buck coins arranged in circular pattern with intense sparkle burst, electric blue and magenta background with storm effects, dark atmospheric gradient, professional 3D render, vibrant colors, high quality, no text, no letters' },
  { id: 'g4', filename: 'g4-vbucks13500.png', prompt: 'Premium digital product showcase card, Fortnite 13500 V-Bucks mega bundle, massive pile of glowing blue V-Buck coins overflowing with treasure chest, golden and blue explosion of light with confetti, epic dark background with aurora borealis, professional 3D render, vibrant colors, high quality, no text, no letters' },
  { id: 'g5', filename: 'g5-robux800.png', prompt: 'Premium digital product showcase card, Roblox 800 Robux small pack, a single golden Robux coin with R emblem floating with soft glow, bright red and orange warm background with pixel particles, dark atmospheric gradient, professional 3D render, vibrant colors, high quality, no text, no letters' },
  { id: 'g6', filename: 'g6-robux1700.png', prompt: 'Premium digital product showcase card, Roblox 1700 Robux medium pack, three golden Robux coins with R emblem floating in triangle, vibrant red and yellow background with building block particles, dark atmospheric gradient, professional 3D render, vibrant colors, high quality, no text, no letters' },
  { id: 'g7', filename: 'g7-robux4500.png', prompt: 'Premium digital product showcase card, Roblox 4500 Robux premium pack, golden Robux coin avalanche with sparkles and rainbow light trail, intense red and gold background with 3D cube explosions, dark atmospheric gradient, professional 3D render, vibrant colors, high quality, no text, no letters' },
  { id: 'g8', filename: 'g8-fortnite-battlepass.png', prompt: 'Premium digital product showcase card, Fortnite Battle Pass current season, glowing battle pass card with star rank badge and shield, blue and gold premium background with XP bar glow effects, dark atmospheric gradient, professional 3D render, vibrant colors, high quality, no text, no letters' },
  { id: 'g9', filename: 'g9-valorant-skin.png', prompt: 'Premium digital product showcase card, Valorant legendary weapon skin, sleek futuristic rifle with holographic dragon effect and fire particles, crimson red and black aggressive background with tactical lines, dark atmospheric gradient, professional 3D render, vibrant colors, high quality, no text, no letters' },
  { id: 'g10', filename: 'g10-valpoints.png', prompt: 'Premium digital product showcase card, Valorant 5000 Points bundle, triangular VP tokens arranged in star formation with radiance effect, red and teal holographic background with hexagonal grid, dark atmospheric gradient, professional 3D render, vibrant colors, high quality, no text, no letters' },
];

async function generateImage(item, index) {
  const outputPath = path.join(OUTPUT_DIR, item.filename);
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 20000) {
    console.log(`[${index + 1}/${images.length}] SKIP: ${item.filename}`);
    return { success: true, id: item.id, cached: true };
  }
  const escapedPrompt = item.prompt.replace(/'/g, "'\\''");
  try {
    console.log(`[${index + 1}/${images.length}] GEN: ${item.filename}...`);
    execSync(`z-ai image -p '${escapedPrompt}' -o '${outputPath}' -s 1024x1024`, { timeout: 120000, stdio: ['pipe', 'pipe', 'pipe'] });
    const stats = fs.statSync(outputPath);
    console.log(`  OK: ${(stats.size / 1024).toFixed(1)} KB`);
    return { success: true, id: item.id, size: stats.size };
  } catch (error) {
    console.error(`  FAIL: ${item.id} - ${error.message}`);
    return { success: false, id: item.id, error: error.message };
  }
}

async function main() {
  console.log(`=== Batch Gaming 1: ${images.length} images ===`);
  for (let i = 0; i < images.length; i++) {
    await generateImage(images[i], i);
    if (i < images.length - 1) {
      await new Promise(r => setTimeout(r, 6000));
    }
  }
  console.log('DONE');
}
main();
