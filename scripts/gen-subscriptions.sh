#!/bin/bash
OUTDIR="/home/z/my-project/public/products/gen"
LOGFILE="/home/z/my-project/scripts/subscriptions-gen.log"

declare -A PROMPTS
PROMPTS[sub1]='YouTube Premium 1 month product card. Red YouTube Premium card with premium badge and ad-free icon, play button and music note, red white and dark colors, premium video streaming aesthetic, dark background with red glow, 3D render, professional quality'
PROMPTS[sub2]='YouTube Premium 3 month subscription. Three red YouTube Premium tokens stacked with golden 3-month badge, ad-free and background play icons, red white and gold premium colors, dark background with red golden glow, 3D product render'
PROMPTS[sub3]='YouTube Premium 6 month subscription. Six red YouTube tokens in hexagonal pattern with golden badge, music and video icons, red white and gold premium colors, dark background with red golden spotlight, 3D cinematic render'
PROMPTS[sub4]='Discord Nitro 1 month product. Purple Discord Nitro card with golden Nitro badge, custom emoji and HD streaming icons, purple and black with gold accents, gaming community premium feel, dark background with purple glow, 3D render'
PROMPTS[sub5]='Discord Nitro 3 month product. Three purple Discord Nitro tokens with golden 3-month badge, server boost and emoji icons, purple black and gold premium colors, dark background with purple golden glow, 3D product render'
PROMPTS[sub6]='Discord Nitro 12 month product. Twelve purple Discord tokens in circle with platinum annual badge, server boost crown, purple black and gold luxury colors, dark background with purple golden spotlight, 3D cinematic render'
PROMPTS[sub7]='Xbox Game Pass Ultimate 1 month. Green Xbox Game Pass card with game controller and cloud, massive game library icons, green white and gold colors, cloud gaming premium aesthetic, dark background with green glow, 3D render, professional quality'
PROMPTS[sub8]='Xbox Game Pass Ultimate 3 months. Three green Game Pass tokens with golden badge, game controller cloud and PC icons, green white and gold premium colors, dark background with green golden glow, 3D product render'
PROMPTS[sub9]='Twitch Turbo 1 month product. Purple Twitch Turbo card with Turbo badge, ad-free viewing and chat icons, purple and teal Twitch colors, streaming premium aesthetic, dark background with purple teal glow, 3D render'
PROMPTS[sub10]='Twitch Turbo 3 month product. Three purple Twitch tokens with golden 3-month badge, emote and ad-free icons, purple teal and gold premium colors, dark background with purple golden glow, 3D product render'
PROMPTS[sub11]='Canva Pro 1 year product. Cyan Canva Pro card with golden annual badge, design templates and tools icons, cyan purple and gold creative colors, premium design tool aesthetic, dark background with cyan golden glow, 3D render'
PROMPTS[sub12]='Canva Pro 6 month product. Cyan Canva card with design elements and 6-month badge, template and brand kit icons, cyan and gold premium colors, dark background with cyan golden glow, 3D product render'
PROMPTS[sub13]='PlayStation Plus Premium 1 month. Blue PlayStation Plus Premium card with golden premium badge, game library and streaming icons, blue white and gold Sony colors, console premium aesthetic, dark background with blue golden glow, 3D render'
PROMPTS[sub14]='PlayStation Plus Premium 1 year. Premium blue PlayStation Plus card with platinum annual badge, PS5 and game library, blue white and gold luxury colors, dark background with blue golden spotlight, 3D cinematic render'
PROMPTS[sub15]='EA Play Pro 1 month product. Dark EA Play Pro card with golden Pro badge, game controller and EA game titles, dark blue and gold premium colors, gaming subscription aesthetic, dark background with blue golden glow, 3D render'
PROMPTS[sub16]='EA Play Pro 3 month product. Three dark EA Play tokens with golden 3-month Pro badge, game icons, dark blue gold and white premium colors, dark background with blue golden glow, 3D product render'
PROMPTS[sub17]='Nintendo Switch Online 1 year. Red Nintendo Switch Online card with annual badge, Switch console and retro game controllers, red white and black Nintendo colors, console online gaming aesthetic, dark background with red glow, 3D render'
PROMPTS[sub18]='Nintendo Switch Online Expansion Pack. Premium red Nintendo card with golden Expansion Pack badge, N64 and GameBoy icons, Switch and retro console silhouettes, red black and gold luxury colors, dark background with red golden glow, 3D cinematic render'
PROMPTS[sub19]='ChatGPT Plus 1 month product. Dark ChatGPT Plus card with golden Plus badge and AI brain icon, neural network visualization, dark green and gold AI aesthetic, dark background with green golden glow, 3D render, professional quality'
PROMPTS[sub20]='Midjourney 1 month product card. Blue Midjourney card with golden badge and AI art generation icons, artistic creative visualization, blue purple and gold AI art colors, creative AI aesthetic, dark background with blue purple glow, 3D render'

for id in sub1 sub2 sub3 sub4 sub5 sub6 sub7 sub8 sub9 sub10 sub11 sub12 sub13 sub14 sub15 sub16 sub17 sub18 sub19 sub20; do
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

echo "[$(date +%H:%M:%S)] ========== SUBSCRIPTIONS GENERATION COMPLETE ==========" >> "$LOGFILE"
