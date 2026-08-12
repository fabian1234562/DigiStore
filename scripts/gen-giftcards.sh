#!/bin/bash
OUTDIR="/home/z/my-project/public/products/gen"
LOGFILE="/home/z/my-project/scripts/giftcards-gen.log"

declare -A PROMPTS
PROMPTS[gc1]='Steam gift card 10 dollars product. Dark blue Steam gift card with 10 USD value and Steam logo, gaming controller silhouette, dark blue and green colors, PC gaming aesthetic, dark background with blue glow, 3D render, professional quality'
PROMPTS[gc2]='Steam gift card 20 dollars product. Dark blue Steam card with 20 USD value, gaming headset and game library icons, dark blue and green vibrant colors, premium gaming aesthetic, dark background with blue green glow, 3D product render'
PROMPTS[gc3]='Steam gift card 50 dollars product. Premium dark blue Steam card with golden 50 USD badge, game controller and PC setup, dark blue green and gold colors, premium gaming feel, dark background with blue golden glow, 3D cinematic render'
PROMPTS[gc4]='Steam gift card 100 dollars product. Ultimate Steam 100 USD gold-edged card with platinum badge, full gaming PC setup silhouette, dark blue green and gold luxury colors, dark background with blue golden spotlight, 3D epic render'
PROMPTS[gc5]='PlayStation gift card 10 dollars. Blue PlayStation gift card with PS logo and 10 USD, DualSense controller silhouette, blue and white Sony colors, console gaming aesthetic, dark background with blue glow, 3D render, professional quality'
PROMPTS[gc6]='PlayStation gift card 25 dollars. Blue PlayStation card with 25 USD golden badge, PS5 console silhouette, blue white and gold colors, premium console gaming feel, dark background with blue golden glow, 3D product render'
PROMPTS[gc7]='PlayStation gift card 50 dollars. Premium blue PlayStation card with golden 50 USD badge and crown, DualSense and PS5, blue white and gold luxury colors, dark background with blue golden spotlight, 3D cinematic render'
PROMPTS[gc8]='Xbox gift card 15 dollars product. Green Xbox gift card with Xbox logo and 15 USD, Xbox controller silhouette, green and white Microsoft colors, console gaming aesthetic, dark background with green glow, 3D render, professional quality'
PROMPTS[gc9]='Xbox gift card 25 dollars product. Green Xbox card with 25 USD golden badge, Xbox Series X silhouette, green white and gold colors, premium console feel, dark background with green golden glow, 3D product render'
PROMPTS[gc10]='Xbox gift card 50 dollars product. Premium green Xbox card with golden 50 USD badge, Xbox Series X and controller, green white and gold luxury colors, dark background with green golden spotlight, 3D cinematic render'
PROMPTS[gc11]='Google Play gift card 10 dollars. Colorful Google Play gift card with multicolor triangle logo and 10 USD, Android robot, multicolor vibrant palette, app store aesthetic, dark background with colorful glow, 3D render, professional quality'
PROMPTS[gc12]='Google Play gift card 25 dollars. Premium colorful Google Play card with 25 USD golden badge, Android app icons floating, multicolor and gold premium palette, dark background with colorful golden glow, 3D product render'
PROMPTS[gc13]='Apple iTunes gift card 25 dollars. Sleek silver Apple gift card with Apple logo and 25 USD, music note and app icons, silver white and light blue Apple aesthetic, premium clean design, dark background with silver glow, 3D render'
PROMPTS[gc14]='Apple iTunes gift card 50 dollars. Premium silver Apple card with golden 50 USD badge, iPhone and AirPods silhouette, silver gold and white luxury Apple colors, dark background with silver golden glow, 3D cinematic render'
PROMPTS[gc15]='Amazon gift card 25 dollars product. Blue Amazon gift card with Amazon smile logo and 25 USD, shopping box and delivery truck, blue orange and white colors, shopping aesthetic, dark background with blue orange glow, 3D render'
PROMPTS[gc16]='Amazon gift card 50 dollars product. Premium blue Amazon card with golden 50 USD badge, shopping cart overflowing with items, blue orange gold and white colors, dark background with blue golden glow, 3D cinematic render'
PROMPTS[gc17]='Netflix gift card 15 dollars. Red Netflix gift card with Netflix logo and 15 USD, TV screen with play button, red black and white colors, streaming gift aesthetic, dark background with red glow, 3D render, professional quality'
PROMPTS[gc18]='Netflix gift card 30 dollars. Premium red Netflix card with golden 30 USD badge, cinema popcorn and screen, red black gold and white colors, premium streaming gift feel, dark background with red golden glow, 3D cinematic render'
PROMPTS[gc19]='Epic Games gift card 10 dollars. Dark Epic Games gift card with Epic logo and 10 USD, game controller and Unreal Engine logo, dark blue and white colors, PC gaming aesthetic, dark background with blue glow, 3D render'
PROMPTS[gc20]='Epic Games gift card 25 dollars. Premium dark Epic Games card with 25 USD golden badge, game character silhouettes, dark blue white and gold colors, premium gaming feel, dark background with blue golden glow, 3D product render'
PROMPTS[gc21]='Roblox gift card 10 dollars. Colorful Roblox gift card with Roblox logo and 10 USD, Robux coin and character, red yellow and blue vibrant colors, fun gaming aesthetic, dark background with colorful glow, 3D render'
PROMPTS[gc22]='Roblox gift card 25 dollars. Premium colorful Roblox card with 25 USD golden badge, Robux coin pile and character, red yellow blue and gold colors, dark background with colorful golden glow, 3D product render'
PROMPTS[gc23]='Spotify gift card 15 dollars. Green Spotify gift card with Spotify logo and 15 USD, headphones and music notes, green black and white colors, music streaming gift aesthetic, dark background with green glow, 3D render'
PROMPTS[gc24]='Nintendo eShop gift card 25 dollars. Red Nintendo eShop gift card with Nintendo logo and 25 USD, Switch console silhouette, red white and black colors, Nintendo gaming aesthetic, dark background with red glow, 3D render'
PROMPTS[gc25]='Nintendo eShop gift card 50 dollars. Premium red Nintendo card with golden 50 USD badge, Switch and Joy-Cons, red white black and gold colors, premium Nintendo feel, dark background with red golden glow, 3D cinematic render'

for id in gc1 gc2 gc3 gc4 gc5 gc6 gc7 gc8 gc9 gc10 gc11 gc12 gc13 gc14 gc15 gc16 gc17 gc18 gc19 gc20 gc21 gc22 gc23 gc24 gc25; do
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

echo "[$(date +%H:%M:%S)] ========== GIFT CARDS GENERATION COMPLETE ==========" >> "$LOGFILE"
