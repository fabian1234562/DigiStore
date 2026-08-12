#!/bin/bash
OUTDIR="/home/z/my-project/public/products/gen"
LOGFILE="/home/z/my-project/scripts/accounts-gen.log"

declare -A PROMPTS
PROMPTS[a1]='Netflix Premium account 6 months guaranteed product card. Red Netflix membership card with golden shield guarantee badge, six month calendar overlay, red black and gold premium colors, dark background with red golden glow, 3D render, professional quality'
PROMPTS[a2]='Netflix Premium account 12 months guaranteed. Annual red Netflix card with platinum guarantee badge and golden crown, 12 month stars, red black and gold luxury colors, dark background with red golden spotlight, 3D cinematic render'
PROMPTS[a3]='Spotify Premium account 6 months card. Green Spotify membership with guarantee shield, six green music discs, green black and gold colors, music streaming premium aesthetic, dark background with green golden glow, 3D product render'
PROMPTS[a4]='Spotify Premium account 12 months card. Annual green Spotify membership with platinum badge, 12 green tokens in circle, green black and gold luxury palette, dark background with green golden spotlight, 3D cinematic render'
PROMPTS[a5]='Disney Plus Premium 6 months account. Blue Disney Plus membership card with guarantee badge, magical castle and sparkles, blue and gold premium colors, dark background with blue magical glow, 3D render, professional quality'
PROMPTS[a6]='Crunchyroll Premium 6 months account. Orange anime streaming membership card with guarantee shield, anime action lines, orange and black dramatic colors, dark background with orange neon glow, 3D product render'
PROMPTS[a7]='Fortnite account with exclusive skins product. Colorful Fortnite character display with multiple legendary skins, blue purple gaming aesthetic, multiple character showcase, dark background with colorful game glow, 3D game render'
PROMPTS[a8]='Minecraft Java Premium account product. Minecraft Java Edition premium card with diamond armor set, grass block and pickaxe, green and gold color scheme, pixel-art-meets-3D style, dark background, 3D render'
PROMPTS[a9]='Roblox Premium 12 months account. Golden Roblox membership card with annual badge, Robux coins and Builder Club crown, gold and red premium colors, dark background with golden glow, 3D cinematic render'
PROMPTS[a10]='Valorant account with 50 plus skins. Red and black Valorant premium account card, weapon skin gallery display, red teal and black gaming colors, elite gaming aesthetic, dark background with red neon glow, 3D epic render'
PROMPTS[a11]='Genshin Impact account AR55 plus. Blue and gold Genshin Impact account card with high adventure rank badge, character silhouettes, blue gold and white anime colors, dark background with blue golden glow, 3D anime-style render'
PROMPTS[a12]='Max HBO 6 months guaranteed account. Purple HBO Max membership with guarantee shield, premium streaming badge, purple gold and dark colors, dark background with purple golden glow, 3D product render'
PROMPTS[a13]='Verified Instagram account product. Instagram style card with blue verified checkmark badge, profile silhouette with blue ring, Instagram pink orange and blue colors, social media premium aesthetic, dark background with gradient glow, 3D render'
PROMPTS[a14]='TikTok account with followers product. TikTok style card with music note and heart icons, follower count graphic, TikTok pink cyan and black colors, viral social media aesthetic, dark background with pink cyan glow, 3D product render'
PROMPTS[a15]='Discord Nitro 12 months account. Discord Nitro premium card with game controller and badge, 12 month tokens, purple and black Discord colors with gold accents, gaming community premium feel, dark background with purple glow, 3D cinematic render'

for id in a1 a2 a3 a4 a5 a6 a7 a8 a9 a10 a11 a12 a13 a14 a15; do
  outfile="$OUTDIR/${id}.png"
  if [ -f "$outfile" ] && [ $(stat -c%s "$outfile") -gt 10000 ]; then
    echo "[$(date +%H:%M:%S)] SKIP $id (exists, $(stat -c%s "$outfile") bytes)" >> "$LOGFILE"
    continue
  fi
  
  prompt="${PROMPTS[$id]}"
  echo "[$(date +%H:%M:%S)] START $id: ${prompt:0:60}..." >> "$LOGFILE"
  
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

echo "[$(date +%H:%M:%S)] ========== ACCOUNTS GENERATION COMPLETE ==========" >> "$LOGFILE"
