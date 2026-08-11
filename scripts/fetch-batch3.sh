#!/bin/bash
# Batch 3: Streaming (remaining) + Gift Cards
OUTFILE="/home/z/my-project/public/products/real-image-map.json"

declare -A QUERIES=(
  ["Crunchyroll"]="Crunchyroll Premium subscription official digital card"
  ["Amazon Prime"]="Amazon Prime Video subscription official card"
  ["Paramount+"]="Paramount Plus subscription official digital card"
  ["Apple TV+"]="Apple TV Plus subscription official digital artwork"
  ["Twitch"]="Twitch subscription official digital gift card"
  ["Hulu"]="Hulu subscription official digital card artwork"
  ["Max"]="Max HBO streaming subscription official digital card"
  ["Peacock"]="Peacock Premium streaming subscription official card"
  ["DAZN"]="DAZN sports streaming subscription official artwork"
  ["Star+"]="Star Plus Disney streaming subscription official card"
  ["Steam"]="Steam wallet gift card official digital artwork"
  ["PlayStation"]="PlayStation Store gift card official digital artwork"
  ["Xbox"]="Xbox gift card official digital artwork"
  ["Nintendo"]="Nintendo eShop gift card official digital artwork"
  ["Google Play"]="Google Play gift card official digital artwork"
)

for platform in "${!QUERIES[@]}"; do
  query="${QUERIES[$platform]}"
  echo -n "$platform... "
  result=$(z-ai image-search -q "$query" --count 1 --gl us --no-rank 2>&1)
  url=$(echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['results'][0]['original_url'] if d.get('success') and d.get('results') else '')" 2>/dev/null)
  
  if [ -n "$url" ]; then
    python3 -c "
import json
m = json.load(open('$OUTFILE'))
m['$platform'] = '$url'
json.dump(m, open('$OUTFILE','w'), indent=2)
"
    echo "OK"
  else
    echo "FAILED"
  fi
  sleep 8
done

echo "Batch 3 done. Total: $(python3 -c "import json; print(len(json.load(open('$OUTFILE'))))" 2>/dev/null) images"
