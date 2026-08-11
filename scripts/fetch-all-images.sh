#!/bin/bash
# Single sequential script to fetch all product images
OUTFILE="/home/z/my-project/public/products/real-image-map.json"
LOGFILE="/home/z/my-project/scripts/fetch-images.log"

# Initialize empty map
echo "{}" > "$OUTFILE"
echo "Started at $(date)" > "$LOGFILE"

fetch_image() {
    local platform="$1"
    local query="$2"
    echo -n "[$(date +%H:%M:%S)] $platform... " >> "$LOGFILE"
    
    result=$(z-ai image-search -q "$query" --count 1 --gl us --no-rank 2>&1)
    url=$(echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['results'][0]['original_url'] if d.get('success') and d.get('results') else '')" 2>/dev/null)
    
    if [ -n "$url" ]; then
        python3 -c "
import json
m = json.load(open('$OUTFILE'))
m['$platform'] = '$url'
json.dump(m, open('$OUTFILE','w'), indent=2)
" 2>/dev/null
        echo "OK" >> "$LOGFILE"
        return 0
    else
        echo "FAILED" >> "$LOGFILE"
        return 1
    fi
}

# All platforms in order
fetch_image "Fortnite" "Fortnite V-Bucks official digital game currency card"
sleep 5
fetch_image "Roblox" "Roblox Robux official digital gift card"
sleep 5
fetch_image "Valorant" "Valorant VP points official game card"
sleep 5
fetch_image "Minecraft" "Minecraft Minecoins official digital currency"
sleep 5
fetch_image "League of Legends" "League of Legends Riot Points official card"
sleep 5
fetch_image "Genshin Impact" "Genshin Impact Genesis Crystals official artwork"
sleep 5
fetch_image "EA FC 25" "EA FC 25 FIFA points ultimate team card"
sleep 5
fetch_image "Apex Legends" "Apex Legends Coins official digital currency"
sleep 5
fetch_image "PUBG Mobile" "PUBG Mobile UC unlimited cash digital card"
sleep 5
fetch_image "Call of Duty" "Call of Duty COD Points official digital card"
sleep 5
fetch_image "Free Fire" "Free Fire diamonds official digital top up"
sleep 5
fetch_image "Among Us" "Among Us stars official digital currency"
sleep 5
fetch_image "Clash Royale" "Clash Royale gems official digital top up"
sleep 5
fetch_image "Mobile Legends" "Mobile Legends Bang Bang diamonds digital"
sleep 5
fetch_image "Brawl Stars" "Brawl Stars gems official digital pack"
sleep 5
fetch_image "Counter-Strike 2" "Counter-Strike 2 CS2 weapon skins case artwork"
sleep 5
fetch_image "GTA V" "GTA V Shark Card official digital artwork"
sleep 5
fetch_image "Honkai Star Rail" "Honkai Star Rail Oneiric Shard official currency"
sleep 5
fetch_image "Wuthering Waves" "Wuthering Waves Astrite game currency artwork"
sleep 5
fetch_image "Clash of Clans" "Clash of Clans gems official digital top up"
sleep 5
fetch_image "FIFA Mobile" "FIFA Mobile coins points official digital card"
sleep 5
fetch_image "Wild Rift" "League of Legends Wild Rift wildcore artwork"
sleep 5
fetch_image "Diablo IV" "Diablo IV platinum official digital currency"
sleep 5
fetch_image "Overwatch 2" "Overwatch 2 coins official digital currency pack"
sleep 5
fetch_image "Rocket League" "Rocket League credits official digital top up"
sleep 5
fetch_image "Destiny 2" "Destiny 2 silver official digital currency artwork"
sleep 5

# STREAMING
fetch_image "Netflix" "Netflix premium subscription official digital card"
sleep 5
fetch_image "Spotify" "Spotify Premium subscription official digital card"
sleep 5
fetch_image "Disney+" "Disney Plus subscription official digital card"
sleep 5
fetch_image "HBO Max" "HBO Max subscription official digital card"
sleep 5
fetch_image "Crunchyroll" "Crunchyroll Premium subscription official digital card"
sleep 5
fetch_image "Amazon Prime" "Amazon Prime Video subscription official card"
sleep 5
fetch_image "Paramount+" "Paramount Plus subscription official digital card"
sleep 5
fetch_image "Apple TV+" "Apple TV Plus subscription official digital artwork"
sleep 5
fetch_image "Twitch" "Twitch subscription official digital gift card"
sleep 5
fetch_image "Hulu" "Hulu subscription official digital card artwork"
sleep 5
fetch_image "Max" "Max HBO streaming subscription official digital card"
sleep 5
fetch_image "Peacock" "Peacock Premium streaming subscription official card"
sleep 5
fetch_image "DAZN" "DAZN sports streaming subscription official artwork"
sleep 5
fetch_image "Star+" "Star Plus Disney streaming subscription official card"
sleep 5

# GIFT CARDS
fetch_image "Steam" "Steam wallet gift card official digital artwork"
sleep 5
fetch_image "PlayStation" "PlayStation Store gift card official digital artwork"
sleep 5
fetch_image "Xbox" "Xbox gift card official digital artwork"
sleep 5
fetch_image "Nintendo" "Nintendo eShop gift card official digital artwork"
sleep 5
fetch_image "Google Play" "Google Play gift card official digital artwork"
sleep 5
fetch_image "Apple" "Apple App Store iTunes gift card official digital artwork"
sleep 5
fetch_image "Amazon" "Amazon gift card official digital artwork"
sleep 5
fetch_image "Epic Games" "Epic Games gift card official digital artwork"
sleep 5
fetch_image "Riot Games" "Riot Games gift card official digital artwork"
sleep 5
fetch_image "Discord" "Discord Nitro gift card official digital artwork"
sleep 5
fetch_image "Visa" "Visa prepaid gift card official digital artwork"
sleep 5
fetch_image "PayPal" "PayPal gift card official digital artwork"
sleep 5

# SOFTWARE
fetch_image "Windows" "Windows 11 Pro license key official digital product"
sleep 5
fetch_image "Microsoft" "Microsoft Office 365 official digital license product"
sleep 5
fetch_image "Adobe" "Adobe Creative Cloud subscription official digital artwork"
sleep 5
fetch_image "VPN" "VPN premium service subscription digital product artwork"
sleep 5
fetch_image "Antivirus" "premium antivirus software license digital product"
sleep 5
fetch_image "NordVPN" "NordVPN premium subscription official digital product"
sleep 5
fetch_image "Kaspersky" "Kaspersky antivirus premium license digital product"
sleep 5
fetch_image "Malwarebytes" "Malwarebytes premium antivirus license digital product"
sleep 5
fetch_image "Office" "Microsoft Office 2024 professional license digital product"
sleep 5
fetch_image "Avast" "Avast premium antivirus security license digital product"
sleep 5
fetch_image "Bitdefender" "Bitdefender Total Security license digital product"
sleep 5
fetch_image "Norton" "Norton 360 Deluxe antivirus security digital product"
sleep 5

# SUBSCRIPTIONS + ACCOUNTS
fetch_image "YouTube" "YouTube Premium subscription official digital artwork"
sleep 5
fetch_image "Canva" "Canva Pro subscription official digital product artwork"
sleep 5
fetch_image "EA" "EA Play Pro subscription official digital artwork"
sleep 5
fetch_image "AI" "AI artificial intelligence tools premium subscription digital"
sleep 5
fetch_image "Cloud" "Cloud gaming subscription service official digital artwork"
sleep 5
fetch_image "Social" "social media premium accounts subscription digital product"

echo "Finished at $(date)" >> "$LOGFILE"
total=$(python3 -c "import json; print(len(json.load(open('$OUTFILE'))))" 2>/dev/null)
echo "Total images fetched: $total" >> "$LOGFILE"
echo "DONE: $total images"