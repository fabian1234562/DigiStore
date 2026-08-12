#!/bin/bash

OUTDIR="/home/z/my-project/public/products/gen"
LOGFILE="/home/z/my-project/scripts/gaming-gen.log"

# Array of product ID and prompt pairs
declare -A PROMPTS
PROMPTS[g7]='Premium 4500 Roblox product image. Golden Robux coin fountain with water splash effect made of coins, sparkle particles everywhere, luxurious gold and red color palette, premium product photography on dark background, 3D cinematic quality'
PROMPTS[g8]='Gaming battle pass seasonal product card. A glowing battle pass card with holographic effect, military rank insignias, stars and progression bars, epic golden and crimson color scheme, game controller silhouette, dark dramatic background, 3D product render'
PROMPTS[g9]='Legendary Valorant weapon skin product showcase. A futuristic stylized rifle with neon red and black dragon design, glowing energy effects, Valorant style angular aesthetics, dramatic lighting on dark background, 3D game asset render, premium quality'
PROMPTS[g10]='Valorant Points 5000 VP product card. Hexagonal glowing crystal formation in Valorant red and teal colors, VP currency symbol floating above, sharp angular design aesthetic, dark background with neon rim lighting, professional 3D product render'
PROMPTS[g11]='Minecraft Premium account product card. A Minecraft character in diamond armor standing on a grass block, premium golden crown above head, enchanted golden apple floating nearby, pixel art style blended with 3D depth, green and gold color scheme, high quality render'
PROMPTS[g12]='Minecraft Bedrock Edition premium product. Cross-section of a Minecraft world showing bedrock layer with glowing blue portal, pickaxe and sword crossed, pixel-art-meets-3D style, vibrant colors, dark background with blue and purple glow, professional product image'
PROMPTS[g13]='League of Legends 1380 RP product card. Glowing blue crystal containing Riot Points currency, League of Legends summoner icon in background, blue and gold color scheme, magical particle effects, dark background with blue neon, 3D render, professional quality'
PROMPTS[g14]='League of Legends 3500 RP premium bundle. Large blue crystal cluster with golden veins, LoL golden winged crown floating above, abundant magical blue particles, blue and gold luxury color scheme, dark sleek background, 3D cinematic product render'
PROMPTS[g15]='Genshin Impact Genesis Crystal pack product image. Beautiful glowing blue Genesis Crystals arranged in a star pattern, elemental energy swirls around them, Genshin Impact blue and gold aesthetic, ethereal magical lighting on dark background, 3D anime-game style render'
PROMPTS[g16]='Genshin Impact Welkin Moon blessing card. Crescent moon with Genshin Impact character silhouette, blue and silver ethereal glow, starry night background element, premium card design with golden border, magical shimmer effects, 3D render, high quality'
PROMPTS[g17]='Apex Legends 1000 coins product card. Stacked Apex Coins with red metallic finish and the Apex logo, futuristic military aesthetic, red and black color scheme with orange accent lighting, dark gritty background, 3D product render, professional quality'
PROMPTS[g18]='Apex Legends 2150 coins premium bundle. Tower of red metallic Apex Coins with glowing edges, winged helmet emblem floating, futuristic battlefield aesthetic, red black and orange color palette, dramatic lighting, dark background, 3D cinematic render'
PROMPTS[g19]='PUBG Mobile 600 UC product card. Glowing orange UC currency chips stacked, military helmet and airdrop crate in background, battle royale aesthetic, orange and dark green color scheme, tactical military feel, dark background with orange glow, 3D render'
PROMPTS[g20]='PUBG Mobile 3250 UC mega pack. Open airdrop crate overflowing with glowing orange UC currency, golden parachute above, military supply drop aesthetic, orange gold and dark army green colors, dramatic lighting, premium 3D product render'
PROMPTS[g21]='Free Fire 1000 diamonds product card. Brilliant cut diamond gems in red and blue, Free Fire fire logo in background, battle royale gaming aesthetic, fiery orange and cool blue contrast, dark background with flame effects, 3D render, professional quality'
PROMPTS[g22]='Free Fire 5600 diamonds premium pack. Massive treasure chest bursting with brilliant diamonds, fire and ice effects surrounding it, character silhouette, red orange blue color explosion, dramatic dark background, 3D cinematic quality render'
PROMPTS[g23]='Among Us account with complete skins product. Colorful lineup of Among Us crewmates wearing various premium skins and hats, space station corridor background, vibrant red blue green yellow colors, fun and playful style, 3D character render, high quality'
PROMPTS[g24]='Clash Royale 1400 gems product card. Glowing purple gems arranged in a chest, Clash Royale crown tower miniature in background, blue and purple magical lighting, card game battle aesthetic, dark background with purple neon glow, 3D render'
PROMPTS[g25]='Mobile Legends 400 diamonds product. Blue diamond currency floating above a MOBA game arena map, hero silhouette in background, blue and gold color scheme, magical particle effects, dark background with blue glow, 3D game product render'
PROMPTS[g26]='Mobile Legends 2200 diamonds premium pack. Cluster of brilliant blue diamonds with golden crown, epic hero sword embedded in crystal formation, blue and gold luxury palette, dramatic lighting, dark background with magical blue glow, 3D cinematic render'
PROMPTS[g27]='Brawl Stars 170 gems product card. Small pile of bright green Brawl Stars gems with game character brawler fist, colorful cartoon-style background, green and yellow vibrant colors, fun energetic style, 3D render, professional product quality'
PROMPTS[g28]='Brawl Stars 1700 gems mega pack. Massive gem mine with abundant green gems and golden nuggets, Brawl Stars trophy cup overflowing with gems, vibrant green gold and blue colors, exciting energetic lighting, 3D premium product render'
PROMPTS[g29]='Counter-Strike 2 premium skins package. Display case showing multiple CS2 weapon skins including AK-47 and AWP with vibrant neon designs, holographic sticker effects, blue and orange neon lighting on dark background, 3D game asset showcase, premium quality'
PROMPTS[g30]='CS2 case keys bundle of five. Five golden CS2 case keys arranged in a fan pattern, each with unique colored gem, lockpick aesthetic, golden metallic finish with colorful gem accents, dark background with golden glow, 3D product render, professional quality'
PROMPTS[g31]='GTA V Megalodon Shark Card product. Massive megalodon shark swimming through ocean of money, GTA V logo watermark, blue and green ocean colors with golden money glow, cinematic underwater scene, dark deep blue background, 3D dramatic render'
PROMPTS[g32]='GTA V Whale Shark Card product. Whale shark gliding through clouds of golden coins, city skyline silhouette in background, teal and gold color scheme, dreamy premium feel, dark atmospheric background, 3D cinematic product render'
PROMPTS[g33]='Call of Duty Warzone 2400 CoD Points. Military dog tags with CoD Points hologram display, tactical green and black color scheme, bullet casings and military stencil aesthetic, dramatic spotlight on dark background, 3D product render, professional military style'
PROMPTS[g34]='Warzone Modern Warfare 3 premium account product. Tactical operator skull mask with glowing red eyes, military rank insignias, dark green and black with red accent lighting, elite special forces aesthetic, dramatic dark background, 3D cinematic render'
PROMPTS[g35]='Honkai Star Rail Oneiric Shard pack. Ethereal purple and blue crystal shards floating in cosmic space, star trail effects, anime-game aesthetic with cosmic theme, purple and blue nebula colors, dark space background with cosmic glow, 3D anime-style render'
PROMPTS[g36]='Honkai Star Rail Express Supply Pass card. Futuristic train ticket card with holographic star rail design, cosmic purple and gold colors, train silhouette crossing starry sky, premium card with metallic finish look, dark space background, 3D render'
PROMPTS[g37]='Wuthering Waves Astrite pack product. Glowing teal and white crystal formations with wind energy swirls, ethereal fantasy aesthetic, teal and white color palette with golden accents, flowing wind effects, dark background with teal glow, 3D anime-game render'
PROMPTS[g38]='EA FC 25 2800 coins product card. Futuristic football stadium with golden FC coins raining down, EA Sports FC 25 logo glow, green pitch and gold colors, dynamic sports energy feel, dark background with green and gold stadium lights, 3D render'
PROMPTS[g39]='EA FC 25 5600 coins premium pack. Golden trophy cup overflowing with FC coins, football boot kicking golden coin splash, green and gold premium color scheme, championship celebration aesthetic, dark background with golden spotlight, 3D cinematic render'
PROMPTS[g40]='Clash of Clans 1400 gems product. Bright pink and purple gems spilling from a barbarian helmet, village tower in background, medieval fantasy gaming aesthetic, pink purple and brown colors, magical sparkle effects, dark background, 3D game render'
PROMPTS[g41]='Clash of Clans 5000 gems mega pack. Enormous gem mountain with pink purple and green crystals, gold mine cart full of gems, king character silhouette, vibrant fantasy colors, epic lighting, 3D premium product render'
PROMPTS[g42]='League of Legends Wild Rift Wild Tokens. Glowing green tokens with Wild Rift logo, mobile gaming aesthetic with phone silhouette, green and gold color scheme, dynamic energy effects, dark background with green neon glow, 3D product render'
PROMPTS[g43]='Diablo IV standard edition account product. Dark demonic portal with hellfire glow, skull logo, red and black infernal color scheme, dark fantasy aesthetic, burning embers and hellfire effects, dramatic dark background, 3D cinematic game render'
PROMPTS[g44]='Overwatch 1000 coins product card. Stacked golden Overwatch coins with the game logo, colorful hero silhouettes in background, orange and blue team color accents, futuristic clean design, dark background with golden glow, 3D product render, professional quality'
PROMPTS[g45]='Overwatch 5000 coins premium pack. Golden coin fountain with hero emblems orbiting, colorful ability effects in red blue green, premium gold and white color scheme, epic gaming aesthetic, dark background with golden spotlight, 3D cinematic render'
PROMPTS[g46]='Rocket League 200 credits product. Metallic Rocket League credit token with car boost flame effect, soccer ball and rocket car silhouette, orange and blue accent colors, dynamic speed blur effect, dark background with orange glow, 3D render'
PROMPTS[g47]='Rocket League 11000 credits premium pack. Rocket league car jumping through giant ring of credit tokens, explosive boost effects, orange blue and white dynamic colors, high speed action aesthetic, dark arena background with dramatic lighting, 3D cinematic render'
PROMPTS[g48]='Destiny 2 1000 silver product card. Glowing silver currency with ghost companion floating, space and cosmic background elements, white silver and blue color scheme, sci-fi futuristic aesthetic, dark space background, 3D render'
PROMPTS[g49]='FIFA Mobile 2 million coins product. Massive golden coin pile on a football pitch, football boot kicking gold coins upward, green and gold colors, mobile gaming aesthetic with phone frame, dark background with stadium lights, 3D dynamic render'
PROMPTS[g50]='Clash Royale 5000 gems mega pack. Royal treasury chest overflowing with brilliant purple gems, golden crown and scepter, king tower illuminated, purple gold and blue majestic colors, royal premium aesthetic, dark background with purple golden glow, 3D epic render'

# Generate images for products that don't exist yet
for id in g7 g8 g9 g10 g11 g12 g13 g14 g15 g16 g17 g18 g19 g20 g21 g22 g23 g24 g25 g26 g27 g28 g29 g30 g31 g32 g33 g34 g35 g36 g37 g38 g39 g40 g41 g42 g43 g44 g45 g46 g47 g48 g49 g50; do
  outfile="$OUTDIR/${id}.png"
  if [ -f "$outfile" ] && [ $(stat -c%s "$outfile") -gt 10000 ]; then
    echo "[$(date +%H:%M:%S)] SKIP $id (exists, $(stat -c%s "$outfile") bytes)" >> "$LOGFILE"
    continue
  fi
  
  prompt="${PROMPTS[$id]}"
  echo "[$(date +%H:%M:%S)] START $id: ${prompt:0:60}..." >> "$LOGFILE"
  
  # Try with retry
  for attempt in 1 2 3; do
    z-ai image -p "$prompt" -o "$outfile" -s 1024x1024 2>>"$LOGFILE"
    if [ $? -eq 0 ] && [ -f "$outfile" ] && [ $(stat -c%s "$outfile") -gt 10000 ]; then
      echo "[$(date +%H:%M:%S)] DONE $id (attempt $attempt, $(stat -c%s "$outfile") bytes)" >> "$LOGFILE"
      break
    else
      echo "[$(date +%H:%M:%S)] RETRY $id (attempt $attempt)" >> "$LOGFILE"
      rm -f "$outfile"
      sleep 20
    fi
  done
  
  sleep 12
  echo "[$(date +%H:%M:%S)] WAIT 12s done" >> "$LOGFILE"
done

echo "[$(date +%H:%M:%S)] ========== GAMING GENERATION COMPLETE ==========" >> "$LOGFILE"
