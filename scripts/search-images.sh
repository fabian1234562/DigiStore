#!/bin/bash
# Search for real product images sequentially with delays to avoid rate limiting
# Output: /home/z/my-project/scripts/image-urls.json

OUTFILE="/home/z/my-project/scripts/image-urls.json"
TMPDIR="/home/z/my-project/scripts/imgtmp"
mkdir -p "$TMPDIR"

# Initialize output
echo '{' > "$OUTFILE"

search_image() {
  local key="$1"
  local query="$2"
  local tmpfile="$TMPDIR/${key}.json"
  
  if [ -f "$tmpfile" ]; then
    echo "  [CACHED] $key"
    return 0
  fi
  
  echo "  [SEARCH] $key: $query"
  z-ai image-search -q "$query" --count 1 --gl us --no-rank --output "$tmpfile" 2>/dev/null
  
  if [ $? -ne 0 ]; then
    echo "  [FAILED] $key - waiting 15s..."
    sleep 15
    z-ai image-search -q "$query" --count 1 --gl us --no-rank --output "$tmpfile" 2>/dev/null
    if [ $? -ne 0 ]; then
      echo "  [SKIP] $key - failed twice"
      return 1
    fi
  fi
  
  sleep 3
  return 0
}

extract_url() {
  local key="$1"
  local tmpfile="$TMPDIR/${key}.json"
  if [ -f "$tmpfile" ]; then
    python3 -c "import json; d=json.load(open('$tmpfile')); print(d['results'][0]['original_url'] if d.get('success') and d.get('results') else '')"
  fi
}

# =====================
# GAMING PRODUCTS
# =====================
echo '"gaming": {' >> "$OUTFILE"

search_image "fortnite" "Fortnite V-Bucks gift card digital"
search_image "roblox" "Roblox Robux gift card digital code"
search_image "valorant" "Valorant VP points card game"
search_image "minecraft" "Minecraft Minecoins gift card"
search_image "lol" "League of Legends Riot Points gift card"
search_image "genshin" "Genshin Impact Genesis Crystals top up"
search_image "eafc25" "EA FC 25 FC Points gift card"
search_image "apex" "Apex Legends Coins gift card"
search_image "pubgm" "PUBG Mobile UC top up card"
search_image "cod" "Call of Duty COD Points gift card"
search_image "freefire" "Free Fire diamonds top up card"
search_image "amongus" "Among Us Stars gift card"
search_image "clashroyale" "Clash Royale gems gift card"
search_image "mobilelegends" "Mobile Legends Bang Bang diamonds"
search_image "brawlstars" "Brawl Stars gems gift card"
search_image "cs2" "Counter-Strike 2 skins case key"
search_image "gtav" "GTA V Shark Card gift code"
search_image "honkai" "Honkai Star Rail Oneiric Shard top up"
search_image "wuthering" "Wuthering Waves Astralite top up"
search_image "coc" "Clash of Clans gems gift card"
search_image "fifamobile" "FIFA Mobile coins points card"
search_image "wildrift" "League of Legends Wild Rift Wildcore"
search_image "diablo4" "Diablo IV Platinum coins game"
search_image "overwatch2" "Overwatch 2 coins gift card"
search_image "rocketleague" "Rocket League credits gift card"
search_image "destiny2" "Destiny 2 Silver gift card"

# Additional gaming products for expansion
search_image "warzone" "Call of Duty Warzone COD Points bundle"
search_image "pokemon" "Pokemon Unite gems gift card"
search_image "arenaofvalor" "Arena of Valor vouchers gift card"
search_image "mlbb" "Mobile Legends Bang Bang diamond top up"
search_image "simobile" "Sky Children of the Light currency"
search_image "standoff2" "Standoff 2 gold coins skins"
search_image "blockmangames" "Blockman GO cubes gift card"
search_image "ragdolldismount" "Ragdoll Dismounting tickets game"
search_image "ludo" "Ludo King coins tokens game"
search_image "eightball" "8 Ball Pool coins cash game"
search_image "clashmini" "Clash Mini gems game"
search_image "hayday" "Hay Day diamonds farm game"
search_image "brawlhalla" "Brawlhalla mammoth coins"
search_image "deadbydaylight" "Dead by Daylight auric cells"
search_image "fallguys" "Fall Guys show bucks crown"
search_image "rainbowsix" "Rainbow Six Siege R6 credits"
search_image "hearthstone" "Hearthstone packs cards game"
search_image "pubgpc" "PUBG PC G-COIN gift card"
search_image "rocketleague2" "Rocket League premium gift"
search_image "fortnite2" "Fortnite Save the World x ray ticket"
search_image " apex2" "Apex Legends heirloom coins"
search_image "minecraft2" "Minecraft Java Edition key card"
search_image "warframe" "Warframe Platinum game currency"
search_image "genshin2" "Genshin Impact bundle top up"
search_image "roblox2" "Roblox Premium subscription card"

# =====================
# STREAMING
# =====================
echo '},"streaming": {' >> "$OUTFILE"

search_image "netflix" "Netflix subscription gift card premium"
search_image "spotify" "Spotify Premium gift card subscription"
search_image "disney" "Disney Plus subscription gift card"
search_image "hbomax" "HBO Max subscription gift card"
search_image "crunchyroll" "Crunchyroll Premium gift card anime"
search_image "amazonprime" "Amazon Prime Video subscription gift card"
search_image "paramount" "Paramount Plus subscription gift card"
search_image "appletv" "Apple TV Plus gift card subscription"
search_image "twitch" "Twitch subscription gift card turbo"
search_image "hulu" "Hulu subscription gift card streaming"
search_image "maxstream" "Max HBO streaming subscription gift card"
search_image "peacock" "Peacock Premium streaming gift card"
search_image "dazn" "DAZN sports streaming subscription gift card"
search_image "starplus" "Star Plus Disney streaming gift card"

# Additional streaming
search_image "netflix2" "Netflix standard plan gift card"
search_image "spotify2" "Spotify family plan gift card"
search_image "disney2" "Disney Plus annual subscription card"
search_image "crunchyroll2" "Crunchyroll Mega Fan gift card"
search_image "amazonprime2" "Amazon Prime annual membership card"
search_image "hulu2" "Hulu ad-free plan gift card"
search_image "maxstream2" "Max streaming ultimate plan card"
search_image "paramount2" "Paramount Plus annual gift card"
search_image "appletv2" "Apple TV Plus annual gift card"
search_image "twitch2" "Twitch gift card turbo subscription"
search_image "peacock2" "Peacock premium plus gift card"

# =====================
# GIFT CARDS
# =====================
echo '},"giftcards": {' >> "$OUTFILE"

search_image "steam" "Steam wallet gift card digital code"
search_image "playstation" "PlayStation Store gift card PS5"
search_image "xbox" "Xbox gift card digital code series"
search_image "nintendo" "Nintendo eShop gift card Switch"
search_image "googleplay" "Google Play gift card digital code"
search_image "apple2" "Apple App Store iTunes gift card"
search_image "amazon2" "Amazon gift card digital code"
search_image "epicgames" "Epic Games gift card Fortnite"
search_image "riotgames" "Riot Games gift card Valorant"
search_image "discord" "Discord Nitro gift card subscription"
search_image "visa" "Visa prepaid gift card virtual"
search_image "paypal" "PayPal gift card digital code"
search_image "robuxcard" "Roblox gift card Robux code"
search_image "psn" "PlayStation Network wallet top up card"

# Additional gift cards
search_image "xbox2" "Xbox Game Pass gift card ultimate"
search_image "steam2" "Steam gift card wallet code 50"
search_image "nintendo2" "Nintendo Switch online membership"
search_image "googleplay2" "Google Play gift card 50 dollars"
search_image "apple3" "Apple gift card App Store iTunes"
search_image "amazon3" "Amazon gift card balance digital"
search_image "visa2" "Visa virtual gift card prepaid"
search_image "paypal2" "PayPal gift card online shopping"
search_image "spotify3" "Spotify gift card premium digital"
search_image "netflix3" "Netflix gift card subscription digital"
search_image "facebook" "Facebook gaming gift card meta"
search_image "blizzard" "Blizzard Battle.net gift card balance"

# =====================
# SOFTWARE
# =====================
echo '},"software": {' >> "$OUTFILE"

search_image "windows" "Windows 11 Pro license key digital"
search_image "microsoft365" "Microsoft 365 subscription license key"
search_image "adobecc" "Adobe Creative Cloud subscription card"
search_image "nordvpn" "NordVPN premium subscription gift card"
search_image "kaspersky" "Kaspersky Total Security license key"
search_image "malwarebytes" "Malwarebytes Premium license key"
search_image "office2024" "Microsoft Office 2024 Professional key"
search_image "avast" "Avast Premium Security license key"
search_image "bitdefender" "Bitdefender Total Security license key"
search_image "norton" "Norton 360 Deluxe security subscription"
search_image "expressvpn" "ExpressVPN subscription gift card"
search_image "surfshark" "Surfshark VPN subscription license"
search_image "mcafee" "McAfee Total Protection license key"
search_image "eset" "ESET Internet Security license key"
search_image "windows10" "Windows 10 Pro license key digital"
search_image "office365" "Microsoft Office 365 Home subscription"
search_image "adobeps" "Adobe Photoshop subscription license"
search_image ``vmware" "VMware Workstation Pro license key"
search_image "ccleaner" "CCleaner Professional license key"
search_image "avg" "AVG Internet Security license key"

# =====================
# SUBSCRIPTIONS
# =====================
echo '},"subscriptions": {' >> "$OUTFILE"

search_image "youtube" "YouTube Premium gift card subscription"
search_image "canva" "Canva Pro subscription gift card"
search_image "eaplay" "EA Play Pro subscription gift card"
search_image "aitools" "ChatGPT Plus subscription AI premium"
search_image "cloudgaming" "GeForce NOW cloud gaming subscription"
search_image "icloud" "iCloud Plus storage subscription Apple"
search_image "medium" "Medium membership subscription gift"
search_image "spotify4" "Spotify Premium student gift card"
search_image "duolingo" "Duolingo Plus Super subscription gift"
search_image "notion" "Notion Pro subscription plan"
search_image "chatgpt" "ChatGPT Plus premium AI subscription"
search_image ``midjourney" "Midjourney AI art subscription plan"
search_image ``github" "GitHub Copilot subscription developer"
search_image ``dropbox" "Dropbox Plus cloud storage subscription"
search_image ``onenote" "Microsoft OneNote premium subscription"
search_image ``adobestock" "Adobe Stock subscription images"
search_image ``envato" "Envato Elements subscription creative"
search_image ``figma" "Figma Professional subscription design"
search_image ``slack" "Slack Business subscription workspace"
search_image ``zoom" "Zoom Pro subscription meeting"

# =====================
# ACCOUNTS
# =====================
echo '},"accounts": {' >> "$OUTFILE"

search_image "instagram" "Instagram followers social media account"
search_image "tiktok" "TikTok followers social media account"
search_image "twitter" "Twitter X followers social media account"
search_image "youtubeacc" "YouTube subscribers channel account"
search_image "facebook2" "Facebook page likes followers account"
search_image "twitchacc" "Twitch followers channel account"
search_image "discordacc" "Discord server members boost account"
search_image "spotifyacc" "Spotify followers playlist account"
search_image "snapchat" "Snapchat followers score account"
search_image "telegram" "Telegram members channel account"
search_image "linkedin" "LinkedIn connections profile account"
search_image "pinterest" "Pinterest followers board account"
search_image "reddit" "Reddit upvotes karma account"
search_image ``threads" "Threads Meta followers account"
search_image ``whatsapp" "WhatsApp channel members account"
search_image "instagram2" "Instagram reels views likes account"
search_image "tiktok2" "TikTok views likes shares account"
search_image "twitter2" "Twitter X likes retweets account"
search_image "youtube2" "YouTube views watch hours account"
search_image "facebook3" "Facebook group members account"
search_image ``spotify5" "Spotify plays streams playlist account"

# Close accounts and main object
echo '}}' >> "$OUTFILE"

echo ""
echo "====================================="
echo "Search complete! Now building URL map..."
echo "====================================="

# Build the final URL map
python3 << 'PYEOF'
import json, os, glob

tmpdir = "/home/z/my-project/scripts/imgtmp"
result = {}

for f in sorted(glob.glob(os.path.join(tmpdir, "*.json"))):
    key = os.path.splitext(os.path.basename(f))[0]
    try:
        with open(f) as fh:
            d = json.load(fh)
            if d.get("success") and d.get("results"):
                result[key] = d["results"][0]["original_url"]
            else:
                result[key] = ""
    except:
        result[key] = ""

with open("/home/z/my-project/scripts/final-image-urls.json", "w") as out:
    json.dump(result, out, indent=2)

found = sum(1 for v in result.values() if v)
print(f"Total searches: {len(result)}")
print(f"Successful: {found}")
print(f"Failed: {len(result) - found}")

# Show failed keys
failed = [k for k, v in result.items() if not v]
if failed:
    print(f"\nFailed keys: {', '.join(failed)}")
PYEOF