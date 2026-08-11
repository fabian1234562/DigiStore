#!/bin/bash
# Batch 2: Gaming (remaining) + Streaming
OUTFILE="/home/z/my-project/public/products/real-image-map.json"

declare -A QUERIES=(
  ["Counter-Strike 2"]="Counter-Strike 2 CS2 weapon skins case artwork"
  ["GTA V"]="GTA V Shark Card official digital artwork"
  ["Honkai Star Rail"]="Honkai Star Rail Oneiric Shard official currency"
  ["Wuthering Waves"]="Wuthering Waves Astrite game currency artwork"
  ["Clash of Clans"]="Clash of Clans gems official digital top up"
  ["FIFA Mobile"]="FIFA Mobile coins points official digital card"
  ["Wild Rift"]="League of Legends Wild Rift wildcore artwork"
  ["Diablo IV"]="Diablo IV platinum official digital currency"
  ["Overwatch 2"]="Overwatch 2 coins official digital currency pack"
  ["Rocket League"]="Rocket League credits official digital top up"
  ["Destiny 2"]="Destiny 2 silver official digital currency artwork"
  ["Netflix"]="Netflix premium subscription official digital card"
  ["Spotify"]="Spotify Premium subscription official digital card"
  ["Disney+"]="Disney Plus subscription official digital card"
  ["HBO Max"]="HBO Max subscription official digital card"
)

for platform in "${!QUERIES[@]}"; do
  query="${QUERIES[$platform]}"
  echo -n "$platform... "
  result=$(z-ai image-search -q "$query" --count 1 --gl us --no-rank 2>&1)
  url=$(echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['results'][0]['original_url'] if d.get('success') and d.get('results') else '')" 2>/dev/null)
  
  if [ -n "$url" ]; then
    tmp=$(mktemp)
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

echo "Batch 2 done. Total: $(python3 -c "import json; print(len(json.load(open('$OUTFILE'))))" 2>/dev/null) images"
