#!/bin/bash
# Sequential image search with rate limit handling
# Each search spaced 8 seconds apart

TMPDIR="/home/z/my-project/scripts/imgtmp"
mkdir -p "$TMPDIR"

# Define all searches: key|query
SEARCHES=(
  "fortnite|Fortnite V-Bucks gift card digital"
  "roblox|Roblox Robux gift card digital code"
  "valorant|Valorant VP points card game"
  "minecraft|Minecraft Minecoins gift card"
  "lol|League of Legends Riot Points gift card"
  "genshin|Genshin Impact Genesis Crystals top up"
  "eafc25|EA FC 25 FC Points gift card"
  "apex|Apex Legends Coins gift card"
  "pubgm|PUBG Mobile UC top up card"
  "cod|Call of Duty COD Points gift card"
  "freefire|Free Fire diamonds top up card"
  "amongus|Among Us Stars gift card"
  "clashroyale|Clash Royale gems gift card"
  "mobilelegends|Mobile Legends Bang Bang diamonds"
  "brawlstars|Brawl Stars gems gift card"
  "cs2|Counter-Strike 2 skins case key"
  "gtav|GTA V Shark Card gift code"
  "honkai|Honkai Star Rail Oneiric Shard top up"
  "wuthering|Wuthering Waves Astralite top up"
  "coc|Clash of Clans gems gift card"
  "fifamobile|FIFA Mobile coins points card"
  "wildrift|League of Legends Wild Rift Wildcore"
  "diablo4|Diablo IV Platinum coins game"
  "overwatch2|Overwatch 2 coins gift card"
  "rocketleague|Rocket League credits gift card"
  "destiny2|Destiny 2 Silver gift card"
  "warzone|Call of Duty Warzone COD Points"
  "pokemon|Pokemon Unite gems gift card"
  "arenaofvalor|Arena of Valor vouchers gift card"
  "standoff2|Standoff 2 gold coins skins"
  "brawlhalla|Brawlhalla mammoth coins"
  "deadbydaylight|Dead by Daylight auric cells"
  "fallguys|Fall Guys show bucks crown"
  "rainbowsix|Rainbow Six Siege R6 credits"
  "hearthstone|Hearthstone packs cards game"
  "pubgpc|PUBG PC gift card G-COIN"
  "warframe|Warframe Platinum game currency"
  "netflix|Netflix subscription gift card premium"
  "spotify|Spotify Premium gift card subscription"
  "disney|Disney Plus subscription gift card"
  "hbomax|HBO Max subscription gift card"
  "crunchyroll|Crunchyroll Premium gift card anime"
  "amazonprime|Amazon Prime Video subscription gift card"
  "paramount|Paramount Plus subscription gift card"
  "appletv|Apple TV Plus gift card subscription"
  "twitch|Twitch subscription gift card turbo"
  "hulu|Hulu subscription gift card streaming"
  "maxstream|Max HBO streaming subscription gift card"
  "peacock|Peacock Premium streaming gift card"
  "dazn|DAZN sports streaming subscription gift card"
  "starplus|Star Plus Disney streaming gift card"
  "steam|Steam wallet gift card digital code"
  "playstation|PlayStation Store gift card PS5"
  "xbox|Xbox gift card digital code series"
  "nintendo|Nintendo eShop gift card Switch"
  "googleplay|Google Play gift card digital code"
  "apple|Apple App Store iTunes gift card"
  "amazon|Amazon gift card digital code"
  "epicgames|Epic Games gift card Fortnite"
  "riotgames|Riot Games gift card Valorant"
  "discord|Discord Nitro gift card subscription"
  "visa|Visa prepaid gift card virtual"
  "paypal|PayPal gift card digital code"
  "xboxgp|Xbox Game Pass gift card ultimate"
  "blizzard|Blizzard Battle.net gift card balance"
  "windows|Windows 11 Pro license key digital"
  "microsoft365|Microsoft 365 subscription license key"
  "adobecc|Adobe Creative Cloud subscription card"
  "nordvpn|NordVPN premium subscription gift card"
  "kaspersky|Kaspersky Total Security license key"
  "malwarebytes|Malwarebytes Premium license key"
  "office2024|Microsoft Office 2024 Professional key"
  "avast|Avast Premium Security license key"
  "bitdefender|Bitdefender Total Security license key"
  "norton|Norton 360 Deluxe security subscription"
  "expressvpn|ExpressVPN subscription gift card"
  "surfshark|Surfshark VPN subscription license"
  "mcafee|McAfee Total Protection license key"
  "eset|ESET Internet Security license key"
  "youtube|YouTube Premium gift card subscription"
  "canva|Canva Pro subscription gift card"
  "eaplay|EA Play Pro subscription gift card"
  "chatgpt|ChatGPT Plus premium AI subscription"
  "cloudgaming|GeForce NOW cloud gaming subscription"
  "icloud|iCloud Plus storage subscription Apple"
  "medium|Medium membership subscription gift"
  "duolingo|Duolingo Plus Super subscription gift"
  "notion|Notion Pro subscription plan"
  "midjourney|Midjourney AI art subscription plan"
  "github|GitHub Copilot subscription developer"
  "dropbox|Dropbox Plus cloud storage subscription"
  "figma|Figma Professional subscription design"
  "slack|Slack Business subscription workspace"
  "zoom|Zoom Pro subscription meeting"
  "instagram|Instagram followers social media growth"
  "tiktok|TikTok followers social media growth"
  "twitter|Twitter X followers social media growth"
  "youtubeacc|YouTube subscribers channel growth"
  "facebook|Facebook page likes followers growth"
  "twitchacc|Twitch followers channel growth"
  "discordacc|Discord server members boost"
  "spotifyacc|Spotify followers playlist growth"
  "snapchat|Snapchat followers score growth"
  "telegram|Telegram members channel growth"
  "linkedin|LinkedIn connections profile growth"
  "pinterest|Pinterest followers board growth"
  "reddit|Reddit upvotes karma growth"
  "threads|Threads Meta followers growth"
  "whatsapp|WhatsApp channel members growth"
)

TOTAL=${#SEARCHES[@]}
DONE=0
FAILED=0

for item in "${SEARCHES[@]}"; do
  IFS='|' read -r key query <<< "$item"
  tmpfile="$TMPDIR/${key}.json"
  
  # Skip if already cached
  if [ -f "$tmpfile" ] && [ -s "$tmpfile" ]; then
    DONE=$((DONE + 1))
    continue
  fi
  
  # Search with retry
  for attempt in 1 2; do
    result=$(z-ai image-search -q "$query" --count 1 --gl us --no-rank --output "$tmpfile" 2>&1)
    if [ $? -eq 0 ] && [ -f "$tmpfile" ] && grep -q '"success": true' "$tmpfile"; then
      DONE=$((DONE + 1))
      break
    else
      if [ $attempt -eq 1 ]; then
        echo "[RETRY $key] waiting 15s..."
        sleep 15
      else
        FAILED=$((FAILED + 1))
        echo "[FAILED] $key"
      fi
    fi
  done
  
  # Rate limit: wait 8 seconds between searches
  sleep 8
done

echo ""
echo "=== SEARCH COMPLETE ==="
echo "Total: $TOTAL, Success: $DONE, Failed: $FAILED"

# Build final URL map
python3 -c "
import json, os, glob
tmpdir = '/home/z/my-project/scripts/imgtmp'
result = {}
for f in sorted(glob.glob(os.path.join(tmpdir, '*.json'))):
    key = os.path.splitext(os.path.basename(f))[0]
    try:
        with open(f) as fh:
            d = json.load(fh)
            if d.get('success') and d.get('results'):
                result[key] = d['results'][0]['original_url']
            else:
                result[key] = ''
    except:
        result[key] = ''
with open('/home/z/my-project/scripts/final-image-urls.json', 'w') as out:
    json.dump(result, out, indent=2)
found = sum(1 for v in result.values() if v)
print(f'URLs collected: {found}/{len(result)}')
failed = [k for k,v in result.items() if not v]
if failed: print(f'Failed: {chr(10).join(failed)}')
"
