#!/bin/bash
# Batch 1: Gaming platforms (first 15)
OUTFILE="/home/z/my-project/public/products/real-image-map.json"
echo "{}" > "$OUTFILE"

declare -A QUERIES=(
  ["Fortnite"]="Fortnite V-Bucks official digital game currency card"
  ["Roblox"]="Roblox Robux official digital gift card"
  ["Valorant"]="Valorant VP points official game card"
  ["Minecraft"]="Minecraft Minecoins official digital currency"
  ["League of Legends"]="League of Legends Riot Points official card"
  ["Genshin Impact"]="Genshin Impact Genesis Crystals official artwork"
  ["EA FC 25"]="EA FC 25 FIFA points ultimate team card"
  ["Apex Legends"]="Apex Legends Coins official digital currency"
  ["PUBG Mobile"]="PUBG Mobile UC unlimited cash digital card"
  ["Call of Duty"]="Call of Duty COD Points official digital card"
  ["Free Fire"]="Free Fire diamonds official digital top up"
  ["Among Us"]="Among Us stars official digital currency"
  ["Clash Royale"]="Clash Royale gems official digital top up"
  ["Mobile Legends"]="Mobile Legends Bang Bang diamonds digital"
  ["Brawl Stars"]="Brawl Stars gems official digital pack"
)

for platform in "${!QUERIES[@]}"; do
  query="${QUERIES[$platform]}"
  echo -n "$platform... "
  result=$(z-ai image-search -q "$query" --count 1 --gl us --no-rank 2>&1)
  url=$(echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['results'][0]['original_url'] if d.get('success') and d.get('results') else '')" 2>/dev/null)
  
  if [ -n "$url" ]; then
    # Update JSON
    tmp=$(mktemp)
    python3 -c "
import json
m = json.load(open('$OUTFILE'))
m['$platform'] = '$url'
json.dump(m, open('$OUTFILE','w'), indent=2)
"
    echo "OK"
  else
    echo "FAILED - $(echo $result | tail -1)"
  fi
  sleep 8
done

echo "Batch 1 done. Total: $(python3 -c "import json; print(len(json.load(open('$OUTFILE')))" 2>/dev/null) images"
