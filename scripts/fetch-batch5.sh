#!/bin/bash
# Batch 5: Software (remaining) + Subscriptions + Accounts
OUTFILE="/home/z/my-project/public/products/real-image-map.json"

declare -A QUERIES=(
  ["Office"]="Microsoft Office 2024 professional license digital product"
  ["Avast"]="Avast premium antivirus security license digital product"
  ["Bitdefender"]="Bitdefender Total Security license digital product"
  ["Norton"]="Norton 360 Deluxe antivirus security digital product"
  ["YouTube"]="YouTube Premium subscription official digital artwork"
  ["Canva"]="Canva Pro subscription official digital product artwork"
  ["EA"]="EA Play Pro subscription official digital artwork"
  ["AI"]="AI artificial intelligence tools premium subscription digital"
  ["Cloud"]="Cloud gaming subscription service official digital artwork"
  ["Social"]="social media premium accounts subscription digital product"
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

echo "Batch 5 done. Total: $(python3 -c "import json; print(len(json.load(open('$OUTFILE'))))" 2>/dev/null) images