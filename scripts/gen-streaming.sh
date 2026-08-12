#!/bin/bash
OUTDIR="/home/z/my-project/public/products/gen"
LOGFILE="/home/z/my-project/scripts/streaming-gen.log"

declare -A PROMPTS
PROMPTS[s1]='Netflix Premium 1 month subscription product card. Red Netflix logo glowing on premium black card, cinematic film reel elements, red and black color scheme, streaming service aesthetic, dark background with red neon glow, 3D product render, professional quality'
PROMPTS[s2]='Netflix Premium 3 month subscription card. Three stacked red Netflix cards fanning out, each with play button icon, premium membership aesthetic, red and black with golden accent, dark luxurious background, 3D cinematic render'
PROMPTS[s3]='Netflix Premium 6 month subscription. Half year Netflix premium with golden crown badge, six red tokens arranged in hexagon, VIP premium aesthetic, red black and gold color scheme, dark background with warm red glow, 3D product render'
PROMPTS[s4]='Netflix Premium 1 year subscription. Annual Netflix premium mega card with golden annual badge, 12 red coins in calendar ring formation, ultimate premium feel, red black and gold luxury colors, dark background with red golden spotlight, 3D epic render'
PROMPTS[s5]='Spotify Premium 1 month product card. Green Spotify logo on sleek dark card with sound wave visualization, music notes floating, green and black color scheme, music streaming aesthetic, dark background with green neon glow, 3D render, professional quality'
PROMPTS[s6]='Spotify Premium 3 month card. Three green Spotify tokens stacked, equalizer bars animation effect, music streaming premium feel, green black and white colors, dark background with vibrant green glow, 3D product render'
PROMPTS[s7]='Spotify Premium 6 month subscription. Six green music discs arranged in circle, Spotify green glow from center, premium music aesthetic, green and dark color palette, dark background with green radial glow, 3D cinematic render'
PROMPTS[s8]='Spotify Premium Duo 3 month card. Two interlocking green Spotify circles representing duo plan, headphones and music notes, green and dark teal colors, premium couple aesthetic, dark background with green dual glow, 3D product render'
PROMPTS[s9]='Spotify Premium Family 3 month. Family group silhouette with green music aura around them, multiple headphones, Spotify green and warm family colors, premium family plan aesthetic, dark background with green ambient glow, 3D render'
PROMPTS[s10]='Disney Plus Premium 1 month product. Magical Disney castle with blue streaming glow, premium blue card with Disney Plus logo, blue and gold royal color scheme, magical sparkle effects, dark background with blue magical glow, 3D cinematic render'
PROMPTS[s11]='Disney Plus Premium 3 month card. Three blue Disney Plus tokens with castle silhouette, magical star particles, blue and gold premium colors, enchanted streaming aesthetic, dark background with blue and gold glow, 3D product render'
PROMPTS[s12]='Disney Plus Premium 6 month subscription. Six blue crystals with Disney castle reflection inside, premium streaming aesthetic, deep blue and gold color scheme, magical sparkle effects, dark background with royal blue glow, 3D cinematic render'
PROMPTS[s13]='Crunchyroll Premium 1 month product card. Orange Crunchyroll logo on dark card, anime speed lines in background, orange and black color scheme, anime streaming aesthetic, manga-style action lines, dark background with orange neon glow, 3D render'
PROMPTS[s14]='Crunchyroll Premium 3 month card. Three orange anime-inspired cards with shonen character silhouettes, anime energy aura effects, orange and black dramatic colors, dark background with orange dynamic glow, 3D product render'
PROMPTS[s15]='Max HBO 1 month subscription product. Premium dark card with golden HBO Max logo, cinematic film strip border, purple and gold color scheme, premium streaming aesthetic, dark background with purple and golden glow, 3D render, professional quality'
PROMPTS[s16]='Max HBO 3 month subscription card. Three purple HBO streaming tokens stacked, golden premium badge, cinematic film elements, purple gold and dark colors, premium entertainment aesthetic, dark background with purple golden glow, 3D cinematic render'
PROMPTS[s17]='Amazon Prime Video 1 month. Blue Prime Video card with play button, shipping box transforming into screen, blue and orange Amazon colors, streaming and shopping combined aesthetic, dark background with blue glow, 3D product render'
PROMPTS[s18]='Amazon Prime Video 6 month. Six blue Prime tokens arranged in hexagonal pattern, golden crown badge for extended subscription, blue and gold premium colors, dark background with blue and golden spotlight, 3D cinematic render'
PROMPTS[s19]='Paramount Plus 1 month product. Blue and white Paramount mountain logo card, streaming waves effect, blue white and gold color scheme, premium streaming aesthetic, dark background with blue and white glow, 3D render, professional quality'
PROMPTS[s20]='Apple TV Plus 1 month product card. Sleek gray and white Apple TV card with streaming content preview, Apple minimalist aesthetic, silver white and blue colors, premium clean design, dark background with white silver glow, 3D render'
PROMPTS[s21]='Hulu 1 month subscription product. Green Hulu logo card with flowing content ribbons, streaming service aesthetic, green and white vibrant colors, modern entertainment feel, dark background with green neon glow, 3D product render'
PROMPTS[s22]='Hulu Plus Live TV 1 month card. Green Hulu card with live TV antenna and broadcast waves, green white and blue colors, live streaming aesthetic with TV elements, dark background with green dynamic glow, 3D cinematic render'
PROMPTS[s23]='Peacock Premium 3 month product. Colorful peacock feather pattern card with NBC streaming logo, rainbow iridescent colors on dark background, peacock teal and gold colors, premium streaming aesthetic, 3D product render'
PROMPTS[s24]='DAZN 1 month sports streaming. Red DAZN sports streaming card with boxing glove and soccer ball, sports action aesthetic, red black and white colors, dynamic sports energy feel, dark background with red athletic glow, 3D render'
PROMPTS[s25]='Star Plus 1 month subscription. Blue and gold Star Plus streaming card with star constellation background, premium entertainment aesthetic, blue gold and white colors, dark background with blue golden star glow, 3D product render'
PROMPTS[s26]='Star Plus 6 month subscription. Six golden stars arranged in arc with blue streaming card, premium half-year badge, blue and gold luxury colors, dark background with blue and golden spotlight, 3D cinematic render'
PROMPTS[s27]='Crunchyroll Mega Fan 1 year. Annual anime streaming premium card, orange crystal formation with anime character silhouettes, mega fan badge, orange and black epic colors, dark background with orange dramatic glow, 3D epic render'
PROMPTS[s28]='Disney Bundle product card. Triple streaming card showing Disney Plus Hulu and Max logos combined, three colored sections red green purple, bundle deal aesthetic, dark background with multicolor glow, 3D render'
PROMPTS[s29]='Paramount Plus 6 month card. Blue mountain logo card with six month premium badge, streaming wave effects, blue white and gold colors, extended subscription premium feel, dark background with blue golden glow, 3D cinematic render'
PROMPTS[s30]='Apple TV Plus 3 month card. Three silver Apple TV tokens stacked, premium extended badge, silver white and blue Apple aesthetic, clean minimalist premium design, dark background with silver blue glow, 3D product render'

for id in s1 s2 s3 s4 s5 s6 s7 s8 s9 s10 s11 s12 s13 s14 s15 s16 s17 s18 s19 s20 s21 s22 s23 s24 s25 s26 s27 s28 s29 s30; do
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

echo "[$(date +%H:%M:%S)] ========== STREAMING GENERATION COMPLETE ==========" >> "$LOGFILE"
