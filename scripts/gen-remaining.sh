#!/bin/bash
# Generate remaining product images - only ones that don't exist yet
OUTDIR="/home/z/my-project/public/products"

images=(
  "Apex Legends|apex-legends|Professional product photo Apex Legends coins digital card red orange fire dark background"
  "PUBG Mobile|pubg-mobile|Professional product photo PUBG Mobile UC currency military tan dark background"
  "Call of Duty|call-of-duty|Professional product photo Call of Duty COD Points card dark military dark background"
  "Free Fire|free-fire|Professional product photo Free Fire diamonds card orange fire dark background"
  "Among Us|among-us|Professional product photo Among Us stars currency card colorful space dark background"
  "Clash Royale|clash-royale|Professional product photo Clash Royale gems card blue gold royal dark background"
  "Mobile Legends|mobile-legends|Professional product photo Mobile Legends diamonds card blue cyan dark background"
  "Brawl Stars|brawl-stars|Professional product photo Brawl Stars gems yellow orange dark background"
  "Counter-Strike 2|counter-strike-2|Professional product photo CS2 weapon skin case orange tactical dark background"
  "GTA V|gta-v|Professional product photo GTA V Shark Card green money dark background"
  "Honkai Star Rail|honkai-star-rail|Professional product photo Honkai Star Rail currency purple cosmic dark background"
  "Wuthering Waves|wuthering-waves|Professional product photo Wuthering Waves currency teal blue dark background"
  "Clash of Clans|clash-of-clans|Professional product photo Clash of Clans gems gold amber dark background"
  "FIFA Mobile|fifa-mobile|Professional product photo FIFA Mobile coins green football dark background"
  "Wild Rift|wild-rift|Professional product photo Wild Rift wildcore blue cyan dark background"
  "Diablo IV|diablo-iv|Professional product photo Diablo IV platinum dark red hellfire dark background"
  "Overwatch 2|overwatch-2|Professional product photo Overwatch 2 coins orange blue hero dark background"
  "Rocket League|rocket-league|Professional product photo Rocket League credits blue orange dark background"
  "Destiny 2|destiny-2|Professional product photo Destiny 2 silver purple gold space dark background"
  "HBO Max|hbo-max|Professional product photo HBO Max subscription purple gold dark background"
  "Crunchyroll|crunchyroll|Professional product photo Crunchyroll Premium orange anime dark background"
  "Amazon Prime|amazon-prime|Professional product photo Amazon Prime Video blue cyan dark background"
  "Paramount+|paramount-|Professional product photo Paramount Plus blue gold mountain dark background"
  "Apple TV+|apple-tv-|Professional product photo Apple TV Plus gray white minimalist dark background"
  "Twitch|twitch|Professional product photo Twitch subscription purple live streaming dark background"
  "Hulu|hulu|Professional product photo Hulu subscription green dark background"
  "Max|max|Professional product photo Max streaming blue purple premium dark background"
  "Peacock|peacock|Professional product photo Peacock Premium colorful dark background"
  "DAZN|dazn|Professional product photo DAZN sports streaming red black dark background"
  "Star+|star-|Professional product photo Star Plus streaming blue star dark background"
  "Google Play|google-play|Professional product photo Google Play gift card colorful dark background"
  "Apple|apple|Professional product photo Apple App Store gift card silver white dark background"
  "Epic Games|epic-games|Professional product photo Epic Games gift card dark white dark background"
  "Riot Games|riot-games|Professional product photo Riot Games gift card red white dark background"
  "Discord|discord|Professional product photo Discord Nitro indigo blurple dark background"
  "Visa|visa|Professional product photo Visa gift card blue gold dark background"
  "PayPal|paypal|Professional product photo PayPal gift card blue gold dark background"
  "Microsoft|microsoft|Professional product photo Microsoft Office 365 red orange blue dark background"
  "VPN|vpn|Professional product photo VPN service green shield security dark background"
  "Antivirus|antivirus|Professional product photo premium antivirus blue shield dark background"
  "NordVPN|nordvpn|Professional product photo NordVPN blue map VPN dark background"
  "Kaspersky|kaspersky|Professional product photo Kaspersky green shield dark background"
  "Malwarebytes|malwarebytes|Professional product photo Malwarebytes blue cybersecurity dark background"
  "Office|office|Professional product photo Microsoft Office orange red dark background"
  "Avast|avast|Professional product photo Avast premium orange dark background"
  "Bitdefender|bitdefender|Professional product photo Bitdefender red cybersecurity dark background"
  "Norton|norton|Professional product photo Norton 360 yellow security dark background"
  "EA|ea|Professional product photo EA Play Pro yellow black dark background"
  "AI|ai|Professional product photo AI tools purple blue artificial intelligence dark background"
  "Cloud|cloud|Professional product photo cloud gaming blue sky dark background"
  "Social|social|Professional product photo social media premium pink purple dark background"
)

for entry in "${images[@]}"; do
  IFS='|' read -r name slug prompt <<< "$entry"
  outfile="$OUTDIR/${slug}.png"
  if [ -f "$outfile" ] && [ $(stat -c%s "$outfile" 2>/dev/null || echo 0) -gt 10000 ]; then
    echo "[SKIP] $name"
    continue
  fi
  echo -n "[GEN] $name... "
  if z-ai image -p "$prompt" -o "$outfile" -s 1024x1024 2>&1 | tail -1 | grep -q 'completed'; then
    echo "OK"
  else
    echo "FAIL - retry in 30s..."
    sleep 30
    z-ai image -p "$prompt" -o "$outfile" -s 1024x1024 2>&1 | tail -1
    echo "  retry done"
  fi
  sleep 2
done

echo "ALL DONE. Total PNGs: $(ls $OUTDIR/*.png 2>/dev/null | wc -l)"
