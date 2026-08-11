#!/bin/bash
# Generate real AI product images for all platforms
OUTDIR="/home/z/my-project/public/products"
LOGFILE="/home/z/my-project/scripts/generate-images.log"
MAPFILE="/home/z/my-project/public/products/real-image-map.json"

echo "Started at $(date)" > "$LOGFILE"
echo "{}" > "$MAPFILE"

gen() {
    local platform="$1"
    local prompt="$2"
    local slug=$(echo "$platform" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g; s/--*/-/g; s/^-\|-$$//g')
    local outfile="$OUTDIR/${slug}.png"
    
    echo -n "[$(date +%H:%M:%S)] $platform... " >> "$LOGFILE"
    
    result=$(z-ai image -p "$prompt" -o "$outfile" -s 1024x1024 2>&1)
    
    if [ -f "$outfile" ]; then
        local url="/products/${slug}.png"
        python3 -c "
import json
m = json.load(open('$MAPFILE'))
m['$platform'] = '$url'
json.dump(m, open('$MAPFILE','w'), indent=2)
" 2>/dev/null
        echo "OK ($outfile)" >> "$LOGFILE"
        return 0
    else
        echo "FAILED" >> "$LOGFILE"
        return 1
    fi
}

# GAMING
gen "Fortnite" "Professional product photo of Fortnite V-Bucks digital gift card on dark background, vibrant blue purple neon glow, game currency pack, high quality commercial photography, dramatic lighting"
sleep 3
gen "Roblox" "Professional product photo of Roblox Robux digital gift card, red box logo, game currency on dark background, high quality commercial product photography"
sleep 3
gen "Valorant" "Professional product photo of Valorant VP points game card, red and black tactical theme, digital currency on dark background, commercial photography"
sleep 3
gen "Minecraft" "Professional product photo of Minecraft Minecoins digital card, green blocky pixel art style, game currency on dark background, commercial photography"
sleep 3
gen "League of Legends" "Professional product photo of League of Legends Riot Points card, gold and blue championship theme, digital currency on dark background"
sleep 3
gen "Genshin Impact" "Professional product photo of Genshin Impact Genesis Crystals card, blue fantasy anime style, digital currency on dark background, high quality"
sleep 3
gen "EA FC 25" "Professional product photo of EA FC 25 FIFA Ultimate Team points card, green and gold football theme, digital currency on dark background"
sleep 3
gen "Apex Legends" "Professional product photo of Apex Legends coins digital card, red and orange fire theme, game currency on dark background, commercial photography"
sleep 3
gen "PUBG Mobile" "Professional product photo of PUBG Mobile UC currency card, military tan and orange theme, digital top-up card on dark background"
sleep 3
gen "Call of Duty" "Professional product photo of Call of Duty COD Points digital card, dark military green theme, game currency on dark background"
sleep 3
gen "Free Fire" "Professional product photo of Free Fire diamonds top-up card, orange fire theme, digital currency on dark background"
sleep 3
gen "Among Us" "Professional product photo of Among Us stars currency card, colorful space crewmate theme, digital game currency on dark background"
sleep 3
gen "Clash Royale" "Professional product photo of Clash Royale gems card, blue and gold royal battle theme, digital currency on dark background"
sleep 3
gen "Mobile Legends" "Professional product photo of Mobile Legends Bang Bang diamonds card, blue and cyan esports theme, digital currency on dark background"
sleep 3
gen "Brawl Stars" "Professional product photo of Brawl Stars gems pack, yellow and orange explosive theme, digital game currency on dark background"
sleep 3
gen "Counter-Strike 2" "Professional product photo of Counter-Strike 2 weapon skin case, orange and dark tactical theme, CS2 item on dark background"
sleep 3
gen "GTA V" "Professional product photo of GTA V Shark Card, green money theme, digital game currency on dark background, high quality"
sleep 3
gen "Honkai Star Rail" "Professional product photo of Honkai Star Rail Oneiric Shard currency, purple cosmic space theme, digital game item on dark background"
sleep 3
gen "Wuthering Waves" "Professional product photo of Wuthering Waves Astrite currency, teal and blue ethereal theme, digital game item on dark background"
sleep 3
gen "Clash of Clans" "Professional product photo of Clash of Clans gems pack, gold and amber medieval battle theme, digital currency on dark background"
sleep 3
gen "FIFA Mobile" "Professional product photo of FIFA Mobile coins and points card, green football pitch theme, digital currency on dark background"
sleep 3
gen "Wild Rift" "Professional product photo of League of Legends Wild Rift wildcore card, blue and cyan mobile esports theme, dark background"
sleep 3
gen "Diablo IV" "Professional product photo of Diablo IV platinum currency, dark red and hellfire theme, digital game currency on dark background"
sleep 3
gen "Overwatch 2" "Professional product photo of Overwatch 2 coins, orange and blue hero theme, digital game currency on dark background"
sleep 3
gen "Rocket League" "Professional product photo of Rocket League credits, blue and orange car theme, digital game currency on dark background"
sleep 3
gen "Destiny 2" "Professional product photo of Destiny 2 silver currency, purple and gold space theme, digital game item on dark background"
sleep 3

# STREAMING
gen "Netflix" "Professional product photo of Netflix Premium subscription card, red and black theme, streaming service digital product on dark background"
sleep 3
gen "Spotify" "Professional product photo of Spotify Premium subscription, green and black theme, music streaming digital product on dark background"
sleep 3
gen "Disney+" "Professional product photo of Disney Plus subscription card, blue and silver castle theme, streaming service on dark background"
sleep 3
gen "HBO Max" "Professional product photo of HBO Max subscription, purple and gold premium theme, streaming service digital product on dark background"
sleep 3
gen "Crunchyroll" "Professional product photo of Crunchyroll Premium subscription, orange anime theme, streaming service digital product on dark background"
sleep 3
gen "Amazon Prime" "Professional product photo of Amazon Prime Video subscription, blue and cyan prime theme, streaming service on dark background"
sleep 3
gen "Paramount+" "Professional product photo of Paramount Plus subscription, blue and gold mountain theme, streaming service on dark background"
sleep 3
gen "Apple TV+" "Professional product photo of Apple TV Plus subscription, gray and white minimalist Apple theme, streaming service on dark background"
sleep 3
gen "Twitch" "Professional product photo of Twitch subscription gift card, purple theme, live streaming service digital product on dark background"
sleep 3
gen "Hulu" "Professional product photo of Hulu subscription, green theme, streaming service digital product on dark background"
sleep 3
gen "Max" "Professional product photo of Max streaming subscription, blue and purple premium theme, streaming service on dark background"
sleep 3
gen "Peacock" "Professional product photo of Peacock Premium streaming, colorful peacock feather theme, streaming service on dark background"
sleep 3
gen "DAZN" "Professional product photo of DAZN sports streaming subscription, red and black sports theme, streaming service on dark background"
sleep 3
gen "Star+" "Professional product photo of Star Plus streaming subscription, blue star theme, Disney streaming service on dark background"
sleep 3

# GIFT CARDS
gen "Steam" "Professional product photo of Steam wallet gift card, dark blue and gray gaming theme, digital gift card on dark background"
sleep 3
gen "PlayStation" "Professional product photo of PlayStation Store gift card, blue and white PlayStation theme, digital gift card on dark background"
sleep 3
gen "Xbox" "Professional product photo of Xbox gift card, green Xbox theme, digital gift card on dark background"
sleep 3
gen "Nintendo" "Professional product photo of Nintendo eShop gift card, red Nintendo theme, digital gift card on dark background"
sleep 3
gen "Google Play" "Professional product photo of Google Play gift card, colorful Google play triangle theme, digital gift card on dark background"
sleep 3
gen "Apple" "Professional product photo of Apple App Store gift card, silver and white minimalist Apple theme, digital gift card on dark background"
sleep 3
gen "Amazon" "Professional product photo of Amazon gift card, orange smile box theme, digital gift card on dark background"
sleep 3
gen "Epic Games" "Professional product photo of Epic Games gift card, dark and white epic games theme, digital gift card on dark background"
sleep 3
gen "Riot Games" "Professional product photo of Riot Games gift card, red and white riot fist theme, digital gift card on dark background"
sleep 3
gen "Discord" "Professional product photo of Discord Nitro gift card, indigo and blurple Discord theme, digital gift card on dark background"
sleep 3
gen "Visa" "Professional product photo of Visa prepaid gift card, blue and gold Visa theme, digital gift card on dark background"
sleep 3
gen "PayPal" "Professional product photo of PayPal gift card, blue and gold PayPal theme, digital gift card on dark background"
sleep 3

# SOFTWARE
gen "Windows" "Professional product photo of Windows 11 Pro license, blue Windows logo theme, software product on dark background"
sleep 3
gen "Microsoft" "Professional product photo of Microsoft Office 365, red orange blue yellow Office theme, software product on dark background"
sleep 3
gen "Adobe" "Professional product photo of Adobe Creative Cloud, red Adobe theme with creative tools, software product on dark background"
sleep 3
gen "VPN" "Professional product photo of VPN service digital product, green shield security theme, cybersecurity product on dark background"
sleep 3
gen "Antivirus" "Professional product photo of premium antivirus software, blue shield security theme, software product on dark background"
sleep 3
gen "NordVPN" "Professional product photo of NordVPN subscription, blue NordVPN map theme, VPN service product on dark background"
sleep 3
gen "Kaspersky" "Professional product photo of Kaspersky antivirus, green shield theme, security software product on dark background"
sleep 3
gen "Malwarebytes" "Professional product photo of Malwarebytes premium, blue cybersecurity theme, antivirus product on dark background"
sleep 3
gen "Office" "Professional product photo of Microsoft Office 2024, orange red office suite theme, software product on dark background"
sleep 3
gen "Avast" "Professional product photo of Avast premium security, orange antivirus theme, security software on dark background"
sleep 3
gen "Bitdefender" "Professional product photo of Bitdefender Total Security, red cybersecurity theme, security product on dark background"
sleep 3
gen "Norton" "Professional product photo of Norton 360 Deluxe, yellow security theme, antivirus product on dark background"
sleep 3

# SUBSCRIPTIONS
gen "YouTube" "Professional product photo of YouTube Premium subscription, red and white YouTube theme, premium service on dark background"
sleep 3
gen "Canva" "Professional product photo of Canva Pro subscription, purple and teal creative design theme, design tool on dark background"
sleep 3
gen "EA" "Professional product photo of EA Play Pro subscription, yellow and black EA games theme, gaming service on dark background"
sleep 3
gen "AI" "Professional product photo of AI tools premium subscription, purple and blue artificial intelligence theme, tech product on dark background"
sleep 3
gen "Cloud" "Professional product photo of cloud gaming service, blue sky and cloud gaming theme, gaming service on dark background"
sleep 3

# ACCOUNTS
gen "Social" "Professional product photo of social media premium account, pink and purple social network theme, digital account on dark background"

echo "Finished at $(date)" >> "$LOGFILE"
total=$(python3 -c "import json; print(len(json.load(open('$MAPFILE'))))" 2>/dev/null)
echo "Total images generated: $total" >> "$LOGFILE"
echo "DONE: $total images"
