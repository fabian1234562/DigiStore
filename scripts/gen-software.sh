#!/bin/bash
OUTDIR="/home/z/my-project/public/products/gen"
LOGFILE="/home/z/my-project/scripts/software-gen.log"

declare -A PROMPTS
PROMPTS[sw1]='Windows 11 Pro license digital key product. Blue Windows 11 logo card with golden Pro badge, holographic key icon, blue and gold premium Microsoft colors, OS license aesthetic, dark background with blue golden glow, 3D render, professional quality'
PROMPTS[sw2]='Windows 10 Pro license digital key card. Blue Windows 10 logo with golden Pro badge, security shield icon, blue and gold Microsoft colors, professional OS license feel, dark background with blue glow, 3D product render'
PROMPTS[sw3]='Windows 11 Home license digital key. Light blue Windows 11 Home card with house icon, holographic key element, light blue and white Microsoft colors, home OS aesthetic, dark background with blue glow, 3D render, professional quality'
PROMPTS[sw4]='Microsoft Office 2024 Professional product. Orange and blue Office 2024 card with Word Excel PowerPoint icons, Professional golden badge, orange blue and gold premium colors, productivity software aesthetic, dark background with orange blue glow, 3D cinematic render'
PROMPTS[sw5]='Microsoft Office 2024 Home Student. Blue and orange Office card with student cap icon, Word Excel PowerPoint, blue orange and white colors, education productivity feel, dark background with blue orange glow, 3D product render'
PROMPTS[sw6]='Microsoft Office 365 annual 2 PCs. Cloud-connected Office 365 card with cloud icon and 2 PC badges, Word Excel icons, blue orange and gold premium colors, cloud productivity aesthetic, dark background with blue golden glow, 3D render'
PROMPTS[sw7]='Adobe Creative Cloud annual product. Dark Adobe Creative Cloud card with rainbow gradient, Photoshop Illustrator Premiere icons, multicolor creative palette, professional creative suite feel, dark background with colorful glow, 3D cinematic render'
PROMPTS[sw8]='Adobe Photoshop 2024 perpetual license. Blue Adobe Photoshop card with Ps logo and creative tools, paintbrush and photo icons, blue and purple creative colors, professional photo editing aesthetic, dark background with blue purple glow, 3D render'
PROMPTS[sw9]='NordVPN 2 year subscription product. Dark blue NordVPN card with golden map and shield, encrypted connection lines, dark blue and gold cybersecurity colors, VPN privacy aesthetic, dark background with blue golden glow, 3D render, professional quality'
PROMPTS[sw10]='NordVPN 1 year subscription card. Dark blue NordVPN card with shield and globe, encrypted tunnel visualization, dark blue and gold premium colors, VPN security aesthetic, dark background with blue golden glow, 3D product render'
PROMPTS[sw11]='ExpressVPN 1 year subscription product. Green ExpressVPN card with network globe and speed lines, encrypted connection, green and dark cybersecurity colors, fast VPN aesthetic, dark background with green glow, 3D render, professional quality'
PROMPTS[sw12]='Kaspersky Total Security 1 year 3 PCs. Green Kaspersky security card with shield and 3 PC badges, virus scan visualization, green and white security colors, antivirus protection aesthetic, dark background with green glow, 3D product render'
PROMPTS[sw13]='Bitdefender Premium Security 1 year 5 PCs. Red Bitdefender card with dragon shield and 5 PC badges, multi-device protection icons, red and dark premium security colors, dark background with red golden glow, 3D cinematic render'
PROMPTS[sw14]='Norton 360 Deluxe 1 year 3 PCs. Yellow Norton 360 card with golden shield and 3 PC icons, 360 degree protection circle, yellow and dark security colors, dark background with yellow glow, 3D render'
PROMPTS[sw15]='Malwarebytes Premium 1 year 3 PCs. Blue Malwarebytes card with bug shield and 3 PC badges, malware scan visualization, blue and white security colors, dark background with blue glow, 3D product render'
PROMPTS[sw16]='Avast Premium Security 1 year 1 PC. Orange Avast card with shield and virus scan graph, orange and dark security colors, single PC protection aesthetic, dark background with orange glow, 3D render, professional quality'
PROMPTS[sw17]='Windows 10 11 Pro Pack 2 licenses. Twin blue Windows Pro license cards, 2 golden key icons, blue and gold Microsoft premium colors, dual license professional aesthetic, dark background with blue golden glow, 3D cinematic render'
PROMPTS[sw18]='Microsoft Office 2021 Professional. Classic orange and blue Office 2021 card with Professional golden badge, productivity icons, orange blue and gold colors, classic Office premium feel, dark background with orange blue glow, 3D product render'
PROMPTS[sw19]='Surfshark VPN 2 year subscription. Teal Surfshark card with shark fin and wave, encrypted connection lines, teal and dark cybersecurity colors, ocean VPN aesthetic, dark background with teal glow, 3D render, professional quality'
PROMPTS[sw20]='CyberGhost VPN 2 year subscription. Purple CyberGhost card with ghost icon and globe, encrypted tunnel visualization, purple and dark cybersecurity colors, privacy VPN aesthetic, dark background with purple glow, 3D product render'

for id in sw1 sw2 sw3 sw4 sw5 sw6 sw7 sw8 sw9 sw10 sw11 sw12 sw13 sw14 sw15 sw16 sw17 sw18 sw19 sw20; do
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

echo "[$(date +%H:%M:%S)] ========== SOFTWARE GENERATION COMPLETE ==========" >> "$LOGFILE"
