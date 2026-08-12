import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const GEN_DIR = '/home/z/my-project/public/products/gen';

// Map each product ID to its base image and unique CSS filter/pipeline
// This ensures NO product shares the same final image
const productVariants = [
  // FORTNITE - base: fortnite.png
  { id: 'g1', base: 'fortnite.png', pipeline: [sharp().modulate({ brightness: 1.1, saturation: 1.3 }), { overlay: 'rgba(0,150,255,0.15)' }] },
  { id: 'g2', base: 'fortnite.png', pipeline: [sharp().modulate({ brightness: 0.9, saturation: 1.2 }), { overlay: 'rgba(120,80,255,0.15)' }] },
  { id: 'g3', base: 'fortnite.png', pipeline: [sharp().modulate({ brightness: 1.2, saturation: 1.1 }), { overlay: 'rgba(0,200,255,0.12)' }] },
  { id: 'g4', base: 'fortnite.png', pipeline: [sharp().modulate({ brightness: 0.85, saturation: 1.4 }), { overlay: 'rgba(255,200,0,0.12)' }] },
  { id: 'g8', base: 'fortnite.png', pipeline: [sharp().modulate({ brightness: 1.15, saturation: 1.25, hue: 15 }), { overlay: 'rgba(255,120,0,0.15)' }] },

  // ROBLOX - base: roblox.png
  { id: 'g5', base: 'roblox.png', pipeline: [sharp().modulate({ brightness: 1.1, saturation: 1.2 }), { overlay: 'rgba(255,100,100,0.12)' }] },
  { id: 'g6', base: 'roblox.png', pipeline: [sharp().modulate({ brightness: 0.9, saturation: 1.3 }), { overlay: 'rgba(255,160,0,0.12)' }] },
  { id: 'g7', base: 'roblox.png', pipeline: [sharp().modulate({ brightness: 1.2, saturation: 1.15 }), { overlay: 'rgba(255,200,50,0.1)' }] },

  // VALORANT - base: valorant.png
  { id: 'g9', base: 'valorant.png', pipeline: [sharp().modulate({ brightness: 1.1, saturation: 1.3 }), { overlay: 'rgba(255,70,85,0.15)' }] },
  { id: 'g10', base: 'valorant.png', pipeline: [sharp().modulate({ brightness: 0.85, saturation: 1.2, hue: 10 }), { overlay: 'rgba(78,205,196,0.12)' }] },

  // MINECRAFT - base: minecraft.png
  { id: 'g11', base: 'minecraft.png', pipeline: [sharp().modulate({ brightness: 1.05, saturation: 1.15 }), { overlay: 'rgba(74,222,128,0.12)' }] },
  { id: 'g12', base: 'minecraft.png', pipeline: [sharp().modulate({ brightness: 0.9, saturation: 1.2, hue: -10 }), { overlay: 'rgba(34,211,238,0.12)' }] },

  // LEAGUE OF LEGENDS - base: lol.png
  { id: 'g13', base: 'lol.png', pipeline: [sharp().modulate({ brightness: 1.1, saturation: 1.2 }), { overlay: 'rgba(251,191,36,0.12)' }] },
  { id: 'g14', base: 'lol.png', pipeline: [sharp().modulate({ brightness: 0.9, saturation: 1.3 }), { overlay: 'rgba(99,102,241,0.12)' }] },
  { id: 'g42', base: 'lol.png', pipeline: [sharp().modulate({ brightness: 1.15, saturation: 1.1, hue: 20 }), { overlay: 'rgba(96,165,250,0.12)' }] },

  // GENSHIN - base: genshin.png
  { id: 'g15', base: 'genshin.png', pipeline: [sharp().modulate({ brightness: 1.1, saturation: 1.2 }), { overlay: 'rgba(34,211,238,0.12)' }] },
  { id: 'g16', base: 'genshin.png', pipeline: [sharp().modulate({ brightness: 0.9, saturation: 1.3, hue: 15 }), { overlay: 'rgba(252,211,77,0.12)' }] },

  // APEX - base: apex.png
  { id: 'g17', base: 'apex.png', pipeline: [sharp().modulate({ brightness: 1.05, saturation: 1.2 }), { overlay: 'rgba(249,115,22,0.12)' }] },
  { id: 'g18', base: 'apex.png', pipeline: [sharp().modulate({ brightness: 0.9, saturation: 1.3 }), { overlay: 'rgba(220,38,38,0.12)' }] },

  // PUBG MOBILE - base: pubgm.png
  { id: 'g19', base: 'pubgm.png', pipeline: [sharp().modulate({ brightness: 1.05, saturation: 1.15 }), { overlay: 'rgba(234,179,8,0.1)' }] },
  { id: 'g20', base: 'pubgm.png', pipeline: [sharp().modulate({ brightness: 0.85, saturation: 1.25 }), { overlay: 'rgba(156,163,175,0.12)' }] },

  // FREE FIRE - base: freefire.png
  { id: 'g21', base: 'freefire.png', pipeline: [sharp().modulate({ brightness: 1.1, saturation: 1.2 }), { overlay: 'rgba(239,68,68,0.12)' }] },
  { id: 'g22', base: 'freefire.png', pipeline: [sharp().modulate({ brightness: 0.9, saturation: 1.3 }), { overlay: 'rgba(249,115,22,0.12)' }] },

  // AMONG US - base: amongus.png (only 1, no variant needed but apply slight tweak)
  { id: 'g23', base: 'amongus.png', pipeline: [sharp().modulate({ brightness: 1.05, saturation: 1.1 }), { overlay: 'rgba(244,63,94,0.08)' }] },

  // CLASH ROYALE - base: clashroyale.png
  { id: 'g24', base: 'clashroyale.png', pipeline: [sharp().modulate({ brightness: 1.1, saturation: 1.2 }), { overlay: 'rgba(168,85,247,0.12)' }] },
  { id: 'g50', base: 'clashroyale.png', pipeline: [sharp().modulate({ brightness: 0.85, saturation: 1.3, hue: 10 }), { overlay: 'rgba(192,132,252,0.12)' }] },

  // MOBILE LEGENDS - base: mobilelegends.png
  { id: 'g25', base: 'mobilelegends.png', pipeline: [sharp().modulate({ brightness: 1.05, saturation: 1.15 }), { overlay: 'rgba(59,130,246,0.12)' }] },
  { id: 'g26', base: 'mobilelegends.png', pipeline: [sharp().modulate({ brightness: 0.9, saturation: 1.25 }), { overlay: 'rgba(251,191,36,0.12)' }] },

  // BRAWL STARS - base: brawlstars.png
  { id: 'g27', base: 'brawlstars.png', pipeline: [sharp().modulate({ brightness: 1.1, saturation: 1.2 }), { overlay: 'rgba(37,99,235,0.12)' }] },
  { id: 'g28', base: 'brawlstars.png', pipeline: [sharp().modulate({ brightness: 0.85, saturation: 1.3 }), { overlay: 'rgba(234,179,8,0.12)' }] },

  // CS2 - base: cs2.png
  { id: 'g29', base: 'cs2.png', pipeline: [sharp().modulate({ brightness: 1.05, saturation: 1.2 }), { overlay: 'rgba(212,175,55,0.12)' }] },
  { id: 'g30', base: 'cs2.png', pipeline: [sharp().modulate({ brightness: 0.9, saturation: 1.25, hue: 10 }), { overlay: 'rgba(249,115,22,0.12)' }] },

  // GTA V - base: gtav.png
  { id: 'g31', base: 'gtav.png', pipeline: [sharp().modulate({ brightness: 1.1, saturation: 1.2 }), { overlay: 'rgba(34,197,94,0.12)' }] },
  { id: 'g32', base: 'gtav.png', pipeline: [sharp().modulate({ brightness: 0.85, saturation: 1.3 }), { overlay: 'rgba(74,222,128,0.12)' }] },

  // CALL OF DUTY - base: cod.png
  { id: 'g33', base: 'cod.png', pipeline: [sharp().modulate({ brightness: 1.05, saturation: 1.15 }), { overlay: 'rgba(101,163,13,0.12)' }] },
  { id: 'g34', base: 'cod.png', pipeline: [sharp().modulate({ brightness: 0.9, saturation: 1.25, hue: -5 }), { overlay: 'rgba(132,204,22,0.12)' }] },

  // HONKAI - base: honkai.png
  { id: 'g35', base: 'honkai.png', pipeline: [sharp().modulate({ brightness: 1.1, saturation: 1.2 }), { overlay: 'rgba(167,139,250,0.12)' }] },
  { id: 'g36', base: 'honkai.png', pipeline: [sharp().modulate({ brightness: 0.85, saturation: 1.3, hue: 15 }), { overlay: 'rgba(192,132,252,0.12)' }] },

  // WUTHERING WAVES - base: wuthering.png (only 1)
  { id: 'g37', base: 'wuthering.png', pipeline: [sharp().modulate({ brightness: 1.05, saturation: 1.1 }), { overlay: 'rgba(45,212,191,0.08)' }] },

  // EA FC 25 - base: eafc25.png
  { id: 'g38', base: 'eafc25.png', pipeline: [sharp().modulate({ brightness: 1.05, saturation: 1.15 }), { overlay: 'rgba(22,163,74,0.12)' }] },
  { id: 'g39', base: 'eafc25.png', pipeline: [sharp().modulate({ brightness: 0.9, saturation: 1.25 }), { overlay: 'rgba(251,191,36,0.12)' }] },

  // CLASH OF CLANS - base: coc.png
  { id: 'g40', base: 'coc.png', pipeline: [sharp().modulate({ brightness: 1.1, saturation: 1.2 }), { overlay: 'rgba(29,78,216,0.12)' }] },
  { id: 'g41', base: 'coc.png', pipeline: [sharp().modulate({ brightness: 0.85, saturation: 1.3, hue: 5 }), { overlay: 'rgba(37,99,235,0.12)' }] },

  // DIABLO IV - base: diablo4.png (only 1)
  { id: 'g43', base: 'diablo4.png', pipeline: [sharp().modulate({ brightness: 0.85, saturation: 1.3 }), { overlay: 'rgba(220,38,38,0.1)' }] },

  // OVERWATCH 2 - base: overwatch2.png
  { id: 'g44', base: 'overwatch2.png', pipeline: [sharp().modulate({ brightness: 1.1, saturation: 1.2 }), { overlay: 'rgba(249,115,22,0.12)' }] },
  { id: 'g45', base: 'overwatch2.png', pipeline: [sharp().modulate({ brightness: 0.9, saturation: 1.25 }), { overlay: 'rgba(59,130,246,0.12)' }] },

  // ROCKET LEAGUE - base: rocketleague.png
  { id: 'g46', base: 'rocketleague.png', pipeline: [sharp().modulate({ brightness: 1.05, saturation: 1.15 }), { overlay: 'rgba(37,99,235,0.12)' }] },
  { id: 'g47', base: 'rocketleague.png', pipeline: [sharp().modulate({ brightness: 0.85, saturation: 1.3, hue: 10 }), { overlay: 'rgba(249,115,22,0.12)' }] },

  // DESTINY 2 - base: destiny2.png (only 1)
  { id: 'g48', base: 'destiny2.png', pipeline: [sharp().modulate({ brightness: 1.1, saturation: 1.15 }), { overlay: 'rgba(226,232,240,0.08)' }] },

  // FIFA MOBILE - base: fifamobile.png (only 1)
  { id: 'g49', base: 'fifamobile.png', pipeline: [sharp().modulate({ brightness: 1.05, saturation: 1.2 }), { overlay: 'rgba(21,128,61,0.1)' }] },

  // ============ STREAMING ============
  // NETFLIX - base: netflix.png
  { id: 's1', base: 'netflix.png', pipeline: [sharp().modulate({ brightness: 1.1, saturation: 1.3 }), { overlay: 'rgba(229,9,20,0.15)' }] },
  { id: 's2', base: 'netflix.png', pipeline: [sharp().modulate({ brightness: 0.9, saturation: 1.2, hue: 5 }), { overlay: 'rgba(220,38,38,0.15)' }] },
  { id: 's3', base: 'netflix.png', pipeline: [sharp().modulate({ brightness: 1.15, saturation: 1.1 }), { overlay: 'rgba(239,68,68,0.12)' }] },
  { id: 's4', base: 'netflix.png', pipeline: [sharp().modulate({ brightness: 0.85, saturation: 1.35 }), { overlay: 'rgba(248,113,113,0.12)' }] },
  { id: 's5', base: 'netflix.png', pipeline: [sharp().modulate({ brightness: 1.05, saturation: 1.15, hue: -5 }), { overlay: 'rgba(185,28,28,0.12)' }] },
  { id: 's6', base: 'netflix.png', pipeline: [sharp().modulate({ brightness: 0.95, saturation: 1.25 }), { overlay: 'rgba(153,27,27,0.12)' }] },
  { id: 's7', base: 'netflix.png', pipeline: [sharp().modulate({ brightness: 1.2, saturation: 1.1, hue: 10 }), { overlay: 'rgba(127,29,29,0.12)' }] },
  { id: 's8', base: 'netflix.png', pipeline: [sharp().modulate({ brightness: 0.88, saturation: 1.2, hue: -10 }), { overlay: 'rgba(251,113,133,0.12)' }] },

  // SPOTIFY - base: spotify.png
  { id: 's9', base: 'spotify.png', pipeline: [sharp().modulate({ brightness: 1.1, saturation: 1.2 }), { overlay: 'rgba(29,185,84,0.15)' }] },
  { id: 's10', base: 'spotify.png', pipeline: [sharp().modulate({ brightness: 0.9, saturation: 1.3 }), { overlay: 'rgba(34,197,94,0.15)' }] },
  { id: 's11', base: 'spotify.png', pipeline: [sharp().modulate({ brightness: 1.15, saturation: 1.1, hue: 10 }), { overlay: 'rgba(74,222,128,0.12)' }] },
  { id: 's12', base: 'spotify.png', pipeline: [sharp().modulate({ brightness: 0.85, saturation: 1.35 }), { overlay: 'rgba(134,239,172,0.12)' }] },
  { id: 's13', base: 'spotify.png', pipeline: [sharp().modulate({ brightness: 1.05, saturation: 1.15, hue: -5 }), { overlay: 'rgba(21,128,61,0.12)' }] },
  { id: 's14', base: 'spotify.png', pipeline: [sharp().modulate({ brightness: 0.95, saturation: 1.25, hue: 15 }), { overlay: 'rgba(22,163,74,0.12)' }] },
  { id: 's15', base: 'spotify.png', pipeline: [sharp().modulate({ brightness: 1.2, saturation: 1.1, hue: -10 }), { overlay: 'rgba(5,150,105,0.12)' }] },
  { id: 's16', base: 'spotify.png', pipeline: [sharp().modulate({ brightness: 0.88, saturation: 1.2, hue: 20 }), { overlay: 'rgba(16,185,129,0.12)' }] },

  // DISNEY+ - base: disney.png
  { id: 's17', base: 'disney.png', pipeline: [sharp().modulate({ brightness: 1.1, saturation: 1.2 }), { overlay: 'rgba(29,78,216,0.15)' }] },
  { id: 's18', base: 'disney.png', pipeline: [sharp().modulate({ brightness: 0.9, saturation: 1.3 }), { overlay: 'rgba(37,99,235,0.15)' }] },
  { id: 's19', base: 'disney.png', pipeline: [sharp().modulate({ brightness: 1.15, saturation: 1.1, hue: 5 }), { overlay: 'rgba(59,130,246,0.12)' }] },
  { id: 's20', base: 'disney.png', pipeline: [sharp().modulate({ brightness: 0.85, saturation: 1.35 }), { overlay: 'rgba(96,165,250,0.12)' }] },
  { id: 's21', base: 'disney.png', pipeline: [sharp().modulate({ brightness: 1.05, saturation: 1.15, hue: -10 }), { overlay: 'rgba(17,50,138,0.12)' }] },

  // HBO MAX - base: hbomax.png
  { id: 's22', base: 'hbomax.png', pipeline: [sharp().modulate({ brightness: 1.1, saturation: 1.2 }), { overlay: 'rgba(124,58,237,0.15)' }] },
  { id: 's23', base: 'hbomax.png', pipeline: [sharp().modulate({ brightness: 0.9, saturation: 1.3, hue: 5 }), { overlay: 'rgba(139,92,246,0.15)' }] },
  { id: 's24', base: 'hbomax.png', pipeline: [sharp().modulate({ brightness: 1.15, saturation: 1.1 }), { overlay: 'rgba(167,139,250,0.12)' }] },

  // CRUNCHYROLL - base: crunchyroll.png
  { id: 's25', base: 'crunchyroll.png', pipeline: [sharp().modulate({ brightness: 1.1, saturation: 1.2 }), { overlay: 'rgba(249,115,22,0.15)' }] },
  { id: 's26', base: 'crunchyroll.png', pipeline: [sharp().modulate({ brightness: 0.9, saturation: 1.3 }), { overlay: 'rgba(251,146,60,0.15)' }] },
  { id: 's27', base: 'crunchyroll.png', pipeline: [sharp().modulate({ brightness: 1.15, saturation: 1.1, hue: -5 }), { overlay: 'rgba(234,88,12,0.12)' }] },
  { id: 's28', base: 'crunchyroll.png', pipeline: [sharp().modulate({ brightness: 0.85, saturation: 1.35, hue: 10 }), { overlay: 'rgba(59,130,246,0.12)' }] },

  // PRIME VIDEO - base: amazonprime.png
  { id: 's29', base: 'amazonprime.png', pipeline: [sharp().modulate({ brightness: 1.1, saturation: 1.2 }), { overlay: 'rgba(0,168,225,0.15)' }] },
  { id: 's30', base: 'amazonprime.png', pipeline: [sharp().modulate({ brightness: 0.9, saturation: 1.3 }), { overlay: 'rgba(0,180,216,0.15)' }] },

  // PARAMOUNT+ - base: paramount.png
  { id: 's31', base: 'paramount.png', pipeline: [sharp().modulate({ brightness: 1.1, saturation: 1.2 }), { overlay: 'rgba(30,64,175,0.15)' }] },
  { id: 's32', base: 'paramount.png', pipeline: [sharp().modulate({ brightness: 0.9, saturation: 1.3, hue: 5 }), { overlay: 'rgba(37,99,235,0.15)' }] },

  // APPLE TV+ - base: appletv.png
  { id: 's33', base: 'appletv.png', pipeline: [sharp().modulate({ brightness: 1.1, saturation: 1.15 }), { overlay: 'rgba(161,161,170,0.12)' }] },
  { id: 's34', base: 'appletv.png', pipeline: [sharp().modulate({ brightness: 0.9, saturation: 1.25, hue: 10 }), { overlay: 'rgba(212,212,216,0.12)' }] },
];

async function createVariant(product) {
  const inputPath = path.join(GEN_DIR, product.base);
  const outputPath = path.join(GEN_DIR, `${product.id}.png`);

  if (!fs.existsSync(inputPath)) {
    return { success: false, id: product.id, error: 'Base image not found' };
  }

  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 5000) {
    return { success: true, id: product.id, cached: true };
  }

  try {
    const [modulate, overlay] = product.pipeline;

    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    const { width, height } = metadata;

    // Create the overlay as a solid color SVG
    const overlayColor = overlay.overlay;
    const overlaySvg = Buffer.from(
      `<svg width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="${overlayColor}"/></svg>`
    );

    await sharp(inputPath)
      .modulate(modulate)
      .composite([{ input: overlaySvg, blend: 'over' }])
      .toFile(outputPath);

    const stats = fs.statSync(outputPath);
    return { success: true, id: product.id, size: stats.size };
  } catch (error) {
    return { success: false, id: product.id, error: error.message };
  }
}

async function main() {
  console.log(`Creating ${productVariants.length} unique product image variants...`);
  let success = 0, fail = 0, cached = 0;

  for (const product of productVariants) {
    const result = await createVariant(product);
    if (result.cached) {
      cached++;
      console.log(`  [CACHED] ${result.id}.png`);
    } else if (result.success) {
      success++;
      console.log(`  [OK] ${result.id}.png (${(result.size / 1024).toFixed(1)} KB)`);
    } else {
      fail++;
      console.error(`  [FAIL] ${result.id}: ${result.error}`);
    }
  }

  console.log(`
Done: ${success} created, ${cached} cached, ${fail} failed`);
}

main();
