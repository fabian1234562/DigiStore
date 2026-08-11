#!/bin/bash
# Batch 4: Gift Cards (remaining) + Software
OUTFILE="/home/z/my-project/public/products/real-image-map.json"

declare -A QUERIES=(
  ["Apple"]="Apple App Store iTunes gift card official digital artwork"
  ["Amazon"]="Amazon gift card official digital artwork"
  ["Epic Games"]="Epic Games gift card official digital artwork"
  ["Riot Games"]="Riot Games gift card official digital artwork"
  ["Discord"]="Discord Nitro gift card official digital artwork"
  ["Visa"]="Visa prepaid gift card official digital artwork"
  ["PayPal"]="PayPal gift card official digital artwork"
  ["Windows"]="Windows 11 Pro license key official digital product"
  ["Microsoft"]="Microsoft Office 365 official digital license product"
  ["Adobe"]="Adobe Creative Cloud subscription official digital artwork"
  ["VPN"]="VPN premium service subscription digital product artwork"
  ["Antivirus"]="premium antivirus software license digital product"
  ["NordVPN"]="NordVPN premium subscription official digital product"
  ["Kaspersky"]="Kaspersky antivirus premium license digital product"
  ["Malwarebytes"]="Malwarebytes premium antivirus license digital product"
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

echo "Batch 4 done. Total: $(python3 -c "import json; print(len(json.load(open('$OUTFILE'))))" 2>/dev/null) images