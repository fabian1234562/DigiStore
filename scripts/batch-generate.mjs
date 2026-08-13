import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUTDIR = '/home/z/my-project/public/products/gen';
const DELAY = 3000;
const BATCH_SIZE = 2; // generate 2 per process

const ALL_PROMPTS = {
  // Gaming remaining: g13-g50
  'g13': 'League of Legends 1380 RP product card. Glowing blue crystal containing Riot Points currency, blue and gold color scheme, magical particle effects, dark background with blue neon, 3D render',
  'g14': 'League of Legends 3500 RP premium bundle. Large blue crystal cluster with golden veins, LoL golden winged crown, blue and gold luxury color scheme, dark sleek background, 3D cinematic product render',
  'g15': 'Genshin Impact Genesis Crystal pack. Beautiful glowing blue Genesis Crystals arranged in star pattern, elemental energy swirls, blue and gold aesthetic, ethereal magical lighting on dark background, 3D anime-game style render',
  'g16': 'Genshin Impact Welkin Moon blessing card. Crescent moon with character silhouette, blue and silver ethereal glow, starry night element, premium card with golden border, magical shimmer, 3D render',
  'g17': 'Apex Legends 1000 coins product card. Stacked Apex Coins with red metallic finish and logo, futuristic military aesthetic, red and black with orange accent lighting, dark gritty background, 3D render',
  'g18': 'Apex Legends 2150 coins premium bundle. Tower of red metallic Apex Coins with glowing edges, winged helmet emblem, futuristic battlefield aesthetic, red black and orange palette, dark background, 3D cinematic render',
  'g19': 'PUBG Mobile 600 UC product card. Glowing orange UC currency chips stacked, military helmet and airdrop crate, battle royale aesthetic, orange and dark green colors, dark background with orange glow, 3D render',
  'g20': 'PUBG Mobile 3250 UC mega pack. Open airdrop crate overflowing with glowing orange UC currency, golden parachute above, orange gold and dark army green colors, dramatic lighting, 3D product render',
  'g21': 'Free Fire 1000 diamonds product card. Brilliant cut diamond gems in red and blue, fire logo in background, fiery orange and cool blue contrast, dark background with flame effects, 3D render',
  'g22': 'Free Fire 5600 diamonds premium pack. Massive treasure chest bursting with brilliant diamonds, fire and ice effects, red orange blue color explosion, dramatic dark background, 3D cinematic quality render',
  'g23': 'Among Us account with complete skins. Colorful lineup of Among Us crewmates wearing various premium skins and hats, space station corridor, vibrant red blue green yellow colors, fun playful 3D style',
  'g24': 'Clash Royale 1400 gems product card. Glowing purple gems arranged in chest, crown tower miniature, blue and purple magical lighting, card game battle aesthetic, dark background with purple neon glow, 3D render',
  'g25': 'Mobile Legends 400 diamonds product. Blue diamond currency floating above MOBA arena map, hero silhouette, blue and gold scheme, magical particle effects, dark background with blue glow, 3D game render',
  'g26': 'Mobile Legends 2200 diamonds premium. Cluster of brilliant blue diamonds with golden crown, epic hero sword in crystal, blue and gold luxury palette, dark background with magical blue glow, 3D cinematic render',
  'g27': 'Brawl Stars 170 gems product card. Small pile of bright green gems with brawler fist, colorful cartoon-style background, green and yellow vibrant colors, fun energetic 3D style, professional quality',
  'g28': 'Brawl Stars 1700 gems mega pack. Massive gem mine with green gems and golden nuggets, trophy cup overflowing with gems, vibrant green gold and blue colors, exciting lighting, 3D premium render',
  'g29': 'Counter-Strike 2 premium skins package. Display case with CS2 weapon skins including AK-47 and AWP with vibrant neon designs, holographic stickers, blue and orange neon, 3D game asset showcase',
  'g30': 'CS2 case keys bundle of five. Five golden CS2 case keys arranged in fan pattern, each with unique colored gem, golden metallic finish, dark background with golden glow, 3D product render',
  'g31': 'GTA V Megalodon Shark Card. Massive megalodon shark swimming through ocean of money, blue and green ocean with golden money glow, cinematic underwater scene, dark deep blue background, 3D dramatic render',
  'g32': 'GTA V Whale Shark Card. Whale shark gliding through clouds of golden coins, city skyline silhouette, teal and gold color scheme, dreamy premium feel, dark atmospheric background, 3D cinematic render',
  'g33': 'Call of Duty Warzone 2400 CoD Points. Military dog tags with CoD Points hologram display, tactical green and black, bullet casings and military stencil, dramatic spotlight on dark background, 3D military render',
  'g34': 'Warzone Modern Warfare 3 premium account. Tactical operator skull mask with glowing red eyes, military rank insignias, dark green and black with red accent, elite special forces aesthetic, dramatic dark background, 3D render',
  'g35': 'Honkai Star Rail Oneiric Shard pack. Ethereal purple and blue crystal shards floating in cosmic space, star trail effects, anime-game cosmic theme, purple and blue nebula, dark space background, 3D anime render',
  'g36': 'Honkai Star Rail Express Supply Pass. Futuristic train ticket card with holographic star rail design, cosmic purple and gold colors, train crossing starry sky, premium metallic card look, dark space background, 3D render',
  'g37': 'Wuthering Waves Astrite pack. Glowing teal and white crystal formations with wind energy swirls, ethereal fantasy, teal and white with golden accents, flowing wind effects, dark background with teal glow, 3D render',
  'g38': 'EA FC 25 2800 coins product. Futuristic football stadium with golden FC coins raining down, green pitch and gold colors, dynamic sports energy, dark background with green and gold stadium lights, 3D render',
  'g39': 'EA FC 25 5600 coins premium pack. Golden trophy cup overflowing with FC coins, football boot kicking golden coin splash, green and gold premium, championship celebration, dark background with golden spotlight, 3D render',
  'g40': 'Clash of Clans 1400 gems. Bright pink and purple gems spilling from barbarian helmet, village tower, medieval fantasy gaming, pink purple and brown, magical sparkle, dark background, 3D game render',
  'g41': 'Clash of Clans 5000 gems mega pack. Enormous gem mountain with pink purple and green crystals, gold mine cart full of gems, king character silhouette, vibrant fantasy colors, epic lighting, 3D premium render',
  'g42': 'League of Legends Wild Rift Wild Tokens. Glowing green tokens with mobile gaming aesthetic, green and gold color scheme, dynamic energy effects, dark background with green neon glow, 3D product render',
  'g43': 'Diablo IV standard edition account. Dark demonic portal with hellfire glow, skull logo, red and black infernal, dark fantasy, burning embers, dramatic dark background, 3D cinematic game render',
  'g44': 'Overwatch 1000 coins product card. Stacked golden Overwatch coins with game logo, colorful hero silhouettes, orange and blue team color accents, futuristic clean design, dark background with golden glow, 3D render',
  'g45': 'Overwatch 5000 coins premium pack. Golden coin fountain with hero emblems orbiting, colorful ability effects red blue green, premium gold and white, epic gaming aesthetic, dark background with golden spotlight, 3D cinematic render',
  'g46': 'Rocket League 200 credits. Metallic credit token with car boost flame effect, soccer ball and rocket car silhouette, orange and blue accents, dynamic speed blur, dark background with orange glow, 3D render',
  'g47': 'Rocket League 11000 credits premium. Car jumping through giant ring of credit tokens, explosive boost effects, orange blue and white dynamic, high speed action, dark arena with dramatic lighting, 3D cinematic render',
  'g48': 'Destiny 2 1000 silver product card. Glowing silver currency with ghost companion floating, space cosmic elements, white silver and blue, sci-fi futuristic, dark space background, 3D render',
  'g49': 'FIFA Mobile 2 million coins. Massive golden coin pile on football pitch, boot kicking gold coins upward, green and gold, mobile gaming aesthetic, dark background with stadium lights, 3D dynamic render',
  'g50': 'Clash Royale 5000 gems mega pack. Royal treasury chest overflowing with brilliant purple gems, golden crown and scepter, king tower, purple gold and blue majestic colors, dark background, 3D epic render',
  // Streaming: s1-s30
  's1': 'Netflix Premium 1 month subscription card. Red Netflix logo glowing on premium black card, cinematic film reel, red and black, streaming aesthetic, dark background with red neon glow, 3D render',
  's2': 'Netflix Premium 3 month card. Three stacked red Netflix cards fanning out, play button icon, premium membership, red and black with golden accent, dark luxurious background, 3D cinematic render',
  's3': 'Netflix Premium 6 month subscription. Half year Netflix premium with golden crown badge, six red tokens in hexagon, red black and gold, dark background with warm red glow, 3D product render',
  's4': 'Netflix Premium 1 year subscription. Annual Netflix mega card with golden annual badge, 12 red coins in calendar ring, red black and gold luxury, dark background with red golden spotlight, 3D epic render',
  's5': 'Spotify Premium 1 month card. Green Spotify logo on sleek dark card with sound wave, music notes floating, green and black, music streaming, dark background with green neon glow, 3D render',
  's6': 'Spotify Premium 3 month card. Three green Spotify tokens stacked, equalizer bars effect, green black and white, dark background with vibrant green glow, 3D product render',
  's7': 'Spotify Premium 6 month subscription. Six green music discs in circle, Spotify green glow from center, green and dark, dark background with green radial glow, 3D cinematic render',
  's8': 'Spotify Premium Duo 3 month card. Two interlocking green Spotify circles, headphones and music notes, green and dark teal, premium couple, dark background with green dual glow, 3D render',
  's9': 'Spotify Premium Family 3 month. Family group silhouette with green music aura, multiple headphones, green and warm family colors, dark background with green ambient glow, 3D render',
  's10': 'Disney Plus Premium 1 month. Magical Disney castle with blue streaming glow, premium blue card, blue and gold royal, magical sparkle, dark background with blue magical glow, 3D cinematic render',
  's11': 'Disney Plus Premium 3 month card. Three blue Disney Plus tokens with castle silhouette, magical star particles, blue and gold premium, dark background with blue and gold glow, 3D render',
  's12': 'Disney Plus Premium 6 month. Six blue crystals with Disney castle reflection, deep blue and gold, magical sparkle, dark background with royal blue glow, 3D cinematic render',
  's13': 'Crunchyroll Premium 1 month card. Orange Crunchyroll logo on dark card, anime speed lines, orange and black, anime streaming, dark background with orange neon glow, 3D render',
  's14': 'Crunchyroll Premium 3 month card. Three orange anime-inspired cards with shonen silhouettes, anime energy aura, orange and black dramatic, dark background with orange dynamic glow, 3D render',
  's15': 'Max HBO 1 month subscription. Premium dark card with golden HBO Max logo, film strip border, purple and gold, premium streaming, dark background with purple and golden glow, 3D render',
  's16': 'Max HBO 3 month subscription. Three purple HBO streaming tokens stacked, golden premium badge, purple gold and dark, dark background with purple golden glow, 3D cinematic render',
  's17': 'Amazon Prime Video 1 month. Blue Prime Video card with play button, shipping box to screen, blue and orange Amazon, dark background with blue glow, 3D render',
  's18': 'Amazon Prime Video 6 month. Six blue Prime tokens in hexagonal pattern, golden crown badge, blue and gold premium, dark background with blue and golden spotlight, 3D cinematic render',
  's19': 'Paramount Plus 1 month. Blue and white Paramount mountain logo card, streaming waves, blue white and gold, premium streaming, dark background with blue and white glow, 3D render',
  's20': 'Apple TV Plus 1 month card. Sleek gray and white Apple TV card with content preview, Apple minimalist, silver white and blue, premium clean design, dark background with white silver glow, 3D render',
  's21': 'Hulu 1 month subscription. Green Hulu logo card with flowing content ribbons, streaming service, green and white vibrant, dark background with green neon glow, 3D render',
  's22': 'Hulu Plus Live TV 1 month. Green Hulu card with live TV antenna and broadcast waves, green white and blue, live streaming, dark background with green dynamic glow, 3D cinematic render',
  's23': 'Peacock Premium 3 month. Colorful peacock feather pattern card with NBC logo, rainbow iridescent on dark, peacock teal and gold, premium streaming, 3D product render',
  's24': 'DAZN 1 month sports streaming. Red DAZN card with boxing glove and soccer ball, sports action, red black and white, dynamic sports energy, dark background with red athletic glow, 3D render',
  's25': 'Star Plus 1 month subscription. Blue and gold Star Plus card with star constellation, premium entertainment, blue gold and white, dark background with blue golden star glow, 3D render',
  's26': 'Star Plus 6 month subscription. Six golden stars in arc with blue streaming card, premium half-year badge, blue and gold luxury, dark background with blue and golden spotlight, 3D cinematic render',
  's27': 'Crunchyroll Mega Fan 1 year. Annual anime streaming premium card, orange crystal with anime silhouettes, mega fan badge, orange and black epic, dark background with orange dramatic glow, 3D epic render',
  's28': 'Disney Bundle triple card. Triple streaming card showing Disney Plus Hulu and Max logos, three colored sections red green purple, bundle deal, dark background with multicolor glow, 3D render',
  's29': 'Paramount Plus 6 month card. Blue mountain logo card with six month premium badge, streaming waves, blue white and gold, dark background with blue golden glow, 3D cinematic render',
  's30': 'Apple TV Plus 3 month card. Three silver Apple TV tokens stacked, premium extended badge, silver white and blue Apple, clean minimalist premium, dark background with silver blue glow, 3D render',
  // Accounts: a1-a15
  'a1': 'Netflix Premium account 6 months guaranteed. Red Netflix membership card with golden shield guarantee badge, red black and gold premium, dark background with red golden glow, 3D render',
  'a2': 'Netflix Premium account 12 months. Annual red Netflix card with platinum guarantee badge and golden crown, red black and gold luxury, dark background with red golden spotlight, 3D cinematic render',
  'a3': 'Spotify Premium account 6 months. Green Spotify membership with guarantee shield, six green music discs, green black and gold, dark background with green golden glow, 3D render',
  'a4': 'Spotify Premium account 12 months. Annual green Spotify membership with platinum badge, 12 green tokens in circle, green black and gold luxury, dark background with green golden spotlight, 3D cinematic render',
  'a5': 'Disney Plus Premium 6 months account. Blue Disney Plus membership with guarantee badge, magical castle and sparkles, blue and gold premium, dark background with blue magical glow, 3D render',
  'a6': 'Crunchyroll Premium 6 months account. Orange anime streaming membership with guarantee shield, anime action lines, orange and black dramatic, dark background with orange neon glow, 3D render',
  'a7': 'Fortnite account with exclusive skins. Colorful Fortnite character display with multiple legendary skins, blue purple gaming aesthetic, multiple character showcase, dark background with colorful game glow, 3D game render',
  'a8': 'Minecraft Java Premium account. Minecraft Java Edition premium card with diamond armor, grass block and pickaxe, green and gold, pixel-art-meets-3D, dark background, 3D render',
  'a9': 'Roblox Premium 12 months account. Golden Roblox membership with annual badge, Robux coins and Builder Club crown, gold and red premium, dark background with golden glow, 3D cinematic render',
  'a10': 'Valorant account with 50 plus skins. Red and black Valorant premium card, weapon skin gallery display, red teal and black gaming, elite gaming aesthetic, dark background with red neon glow, 3D epic render',
  'a11': 'Genshin Impact account AR55 plus. Blue and gold Genshin account card with high adventure rank badge, character silhouettes, blue gold and white anime, dark background with blue golden glow, 3D anime render',
  'a12': 'Max HBO 6 months guaranteed account. Purple HBO Max membership with guarantee shield, premium streaming badge, purple gold and dark, dark background with purple golden glow, 3D render',
  'a13': 'Verified Instagram account product. Instagram card with blue verified checkmark badge, profile silhouette with blue ring, pink orange and blue, social media premium, dark background with gradient glow, 3D render',
  'a14': 'TikTok account with followers. TikTok card with music note and heart icons, follower count graphic, pink cyan and black, viral social media aesthetic, dark background with pink cyan glow, 3D render',
  'a15': 'Discord Nitro 12 months account. Discord Nitro premium card with controller and badge, 12 month tokens, purple and black with gold, gaming community premium, dark background with purple glow, 3D cinematic render',
  // Gift Cards: gc1-gc25
  'gc1': 'Steam gift card 10 dollars. Dark blue Steam card with 10 USD and Steam logo, gaming controller silhouette, dark blue and green, PC gaming, dark background with blue glow, 3D render',
  'gc2': 'Steam gift card 20 dollars. Dark blue Steam card with 20 USD, gaming headset and game library, dark blue and green vibrant, premium gaming, dark background with blue green glow, 3D render',
  'gc3': 'Steam gift card 50 dollars. Premium dark blue Steam card with golden 50 USD badge, full gaming PC setup, dark blue green and gold luxury, dark background with blue golden glow, 3D cinematic render',
  'gc4': 'Steam gift card 100 dollars. Ultimate Steam 100 USD gold-edged card with platinum badge, dark blue green and gold luxury, dark background with blue golden spotlight, 3D epic render',
  'gc5': 'PlayStation gift card 10 dollars. Blue PlayStation card with PS logo and 10 USD, DualSense controller silhouette, blue and white Sony, console gaming, dark background with blue glow, 3D render',
  'gc6': 'PlayStation gift card 25 dollars. Blue PlayStation card with 25 USD golden badge, PS5 silhouette, blue white and gold premium, dark background with blue golden glow, 3D render',
  'gc7': 'PlayStation gift card 50 dollars. Premium blue PlayStation card with golden 50 USD badge and crown, DualSense and PS5, blue white and gold luxury, dark background with blue golden spotlight, 3D cinematic render',
  'gc8': 'Xbox gift card 15 dollars. Green Xbox card with Xbox logo and 15 USD, controller silhouette, green and white Microsoft, console gaming, dark background with green glow, 3D render',
  'gc9': 'Xbox gift card 25 dollars. Green Xbox card with 25 USD golden badge, Xbox Series X silhouette, green white and gold premium, dark background with green golden glow, 3D render',
  'gc10': 'Xbox gift card 50 dollars. Premium green Xbox card with golden 50 USD badge, Xbox Series X and controller, green white and gold luxury, dark background with green golden spotlight, 3D cinematic render',
  'gc11': 'Google Play gift card 10 dollars. Colorful Google Play card with multicolor triangle logo and 10 USD, Android robot, multicolor vibrant, app store, dark background with colorful glow, 3D render',
  'gc12': 'Google Play gift card 25 dollars. Premium colorful Google Play card with 25 USD golden badge, Android app icons floating, multicolor and gold premium, dark background with colorful golden glow, 3D render',
  'gc13': 'Apple iTunes gift card 25 dollars. Sleek silver Apple card with Apple logo and 25 USD, music note and app icons, silver white and light blue Apple, premium clean, dark background with silver glow, 3D render',
  'gc14': 'Apple iTunes gift card 50 dollars. Premium silver Apple card with golden 50 USD badge, iPhone and AirPods silhouette, silver gold and white luxury Apple, dark background with silver golden glow, 3D cinematic render',
  'gc15': 'Amazon gift card 25 dollars. Blue Amazon card with smile logo and 25 USD, shopping box and delivery truck, blue orange and white, shopping aesthetic, dark background with blue orange glow, 3D render',
  'gc16': 'Amazon gift card 50 dollars. Premium blue Amazon card with golden 50 USD badge, shopping cart overflowing, blue orange gold and white, dark background with blue golden glow, 3D cinematic render',
  'gc17': 'Netflix gift card 15 dollars. Red Netflix card with logo and 15 USD, TV screen with play button, red black and white, streaming gift, dark background with red glow, 3D render',
  'gc18': 'Netflix gift card 30 dollars. Premium red Netflix card with golden 30 USD badge, cinema popcorn and screen, red black gold and white premium, dark background with red golden glow, 3D cinematic render',
  'gc19': 'Epic Games gift card 10 dollars. Dark Epic Games card with logo and 10 USD, game controller and Unreal Engine, dark blue and white, PC gaming, dark background with blue glow, 3D render',
  'gc20': 'Epic Games gift card 25 dollars. Premium dark Epic Games card with 25 USD golden badge, game character silhouettes, dark blue white and gold premium, dark background with blue golden glow, 3D render',
  'gc21': 'Roblox gift card 10 dollars. Colorful Roblox card with logo and 10 USD, Robux coin and character, red yellow and blue vibrant, fun gaming, dark background with colorful glow, 3D render',
  'gc22': 'Roblox gift card 25 dollars. Premium colorful Roblox card with 25 USD golden badge, Robux coin pile and character, red yellow blue and gold, dark background with colorful golden glow, 3D render',
  'gc23': 'Spotify gift card 15 dollars. Green Spotify card with logo and 15 USD, headphones and music notes, green black and white, music streaming gift, dark background with green glow, 3D render',
  'gc24': 'Nintendo eShop gift card 25 dollars. Red Nintendo eShop card with logo and 25 USD, Switch console silhouette, red white and black Nintendo, dark background with red glow, 3D render',
  'gc25': 'Nintendo eShop gift card 50 dollars. Premium red Nintendo card with golden 50 USD badge, Switch and Joy-Cons, red white black and gold luxury, dark background with red golden glow, 3D cinematic render',
  // Software: sw1-sw20
  'sw1': 'Windows 11 Pro license digital key. Blue Windows 11 logo card with golden Pro badge, holographic key icon, blue and gold Microsoft, OS license, dark background with blue golden glow, 3D render',
  'sw2': 'Windows 10 Pro license digital key. Blue Windows 10 logo with golden Pro badge, security shield, blue and gold Microsoft, professional OS, dark background with blue glow, 3D render',
  'sw3': 'Windows 11 Home license key. Light blue Windows 11 Home card with house icon, holographic key, light blue and white Microsoft, home OS, dark background with blue glow, 3D render',
  'sw4': 'Microsoft Office 2024 Professional. Orange and blue Office card with Word Excel PowerPoint icons, Professional golden badge, orange blue and gold premium, productivity software, 3D cinematic render',
  'sw5': 'Microsoft Office 2024 Home Student. Blue and orange Office card with student cap, Word Excel PowerPoint, blue orange and white education, dark background with blue orange glow, 3D render',
  'sw6': 'Microsoft Office 365 annual 2 PCs. Cloud Office 365 card with cloud icon and 2 PC badges, blue orange and gold premium, cloud productivity, dark background with blue golden glow, 3D render',
  'sw7': 'Adobe Creative Cloud annual. Dark Adobe Creative Cloud card with rainbow gradient, Photoshop Illustrator Premiere icons, multicolor creative, dark background with colorful glow, 3D cinematic render',
  'sw8': 'Adobe Photoshop 2024 perpetual. Blue Adobe Photoshop card with Ps logo and creative tools, blue and purple creative, professional photo editing, dark background with blue purple glow, 3D render',
  'sw9': 'NordVPN 2 year subscription. Dark blue NordVPN card with golden map and shield, encrypted lines, dark blue and gold cybersecurity, VPN privacy, dark background with blue golden glow, 3D render',
  'sw10': 'NordVPN 1 year subscription. Dark blue NordVPN card with shield and globe, encrypted tunnel, dark blue and gold premium, VPN security, dark background with blue golden glow, 3D render',
  'sw11': 'ExpressVPN 1 year subscription. Green ExpressVPN card with network globe and speed lines, encrypted connection, green and dark cybersecurity, fast VPN, dark background with green glow, 3D render',
  'sw12': 'Kaspersky Total Security 1 year 3 PCs. Green Kaspersky card with shield and 3 PC badges, virus scan, green and white security, antivirus, dark background with green glow, 3D render',
  'sw13': 'Bitdefender Premium Security 1 year 5 PCs. Red Bitdefender card with dragon shield and 5 PC badges, red and dark premium security, dark background with red golden glow, 3D cinematic render',
  'sw14': 'Norton 360 Deluxe 1 year 3 PCs. Yellow Norton 360 card with golden shield and 3 PC icons, 360 protection circle, yellow and dark security, dark background with yellow glow, 3D render',
  'sw15': 'Malwarebytes Premium 1 year 3 PCs. Blue Malwarebytes card with bug shield and 3 PC badges, malware scan, blue and white security, dark background with blue glow, 3D render',
  'sw16': 'Avast Premium Security 1 year 1 PC. Orange Avast card with shield and virus scan graph, orange and dark security, single PC protection, dark background with orange glow, 3D render',
  'sw17': 'Windows 10 11 Pro Pack 2 licenses. Twin blue Windows Pro license cards, 2 golden key icons, blue and gold Microsoft premium, dual license, dark background with blue golden glow, 3D cinematic render',
  'sw18': 'Microsoft Office 2021 Professional. Classic orange and blue Office 2021 card with Professional golden badge, orange blue and gold classic Office premium, dark background with orange blue glow, 3D render',
  'sw19': 'Surfshark VPN 2 year subscription. Teal Surfshark card with shark fin and wave, encrypted lines, teal and dark cybersecurity, ocean VPN, dark background with teal glow, 3D render',
  'sw20': 'CyberGhost VPN 2 year subscription. Purple CyberGhost card with ghost icon and globe, encrypted tunnel, purple and dark cybersecurity, privacy VPN, dark background with purple glow, 3D render',
  // Subscriptions: sub1-sub20
  'sub1': 'YouTube Premium 1 month. Red YouTube Premium card with premium badge, ad-free icon, play button and music note, red white and dark, premium video streaming, dark background with red glow, 3D render',
  'sub2': 'YouTube Premium 3 month. Three red YouTube Premium tokens with golden 3-month badge, ad-free icons, red white and gold premium, dark background with red golden glow, 3D render',
  'sub3': 'YouTube Premium 6 month. Six red YouTube tokens in hexagonal with golden badge, music and video icons, red white and gold premium, dark background with red golden spotlight, 3D cinematic render',
  'sub4': 'Discord Nitro 1 month. Purple Discord Nitro card with golden Nitro badge, custom emoji and HD streaming icons, purple and black with gold, gaming community premium, dark background with purple glow, 3D render',
  'sub5': 'Discord Nitro 3 month. Three purple Discord Nitro tokens with golden 3-month badge, server boost icons, purple black and gold premium, dark background with purple golden glow, 3D render',
  'sub6': 'Discord Nitro 12 month. Twelve purple Discord tokens in circle with platinum annual badge, server boost crown, purple black and gold luxury, dark background with purple golden spotlight, 3D cinematic render',
  'sub7': 'Xbox Game Pass Ultimate 1 month. Green Xbox Game Pass card with controller and cloud, game library icons, green white and gold, cloud gaming premium, dark background with green glow, 3D render',
  'sub8': 'Xbox Game Pass Ultimate 3 months. Three green Game Pass tokens with golden badge, controller cloud and PC icons, green white and gold premium, dark background with green golden glow, 3D render',
  'sub9': 'Twitch Turbo 1 month. Purple Twitch Turbo card with Turbo badge, ad-free and chat icons, purple and teal Twitch, streaming premium, dark background with purple teal glow, 3D render',
  'sub10': 'Twitch Turbo 3 month. Three purple Twitch tokens with golden 3-month badge, emote icons, purple teal and gold premium, dark background with purple golden glow, 3D render',
  'sub11': 'Canva Pro 1 year. Cyan Canva Pro card with golden annual badge, design templates and tools icons, cyan purple and gold creative, premium design tool, dark background with cyan golden glow, 3D render',
  'sub12': 'Canva Pro 6 month. Cyan Canva card with design elements and 6-month badge, template icons, cyan and gold premium, dark background with cyan golden glow, 3D render',
  'sub13': 'PlayStation Plus Premium 1 month. Blue PlayStation Plus Premium card with golden premium badge, game library icons, blue white and gold Sony, console premium, dark background with blue golden glow, 3D render',
  'sub14': 'PlayStation Plus Premium 1 year. Premium blue PlayStation Plus card with platinum annual badge, PS5 and game library, blue white and gold luxury, dark background with blue golden spotlight, 3D cinematic render',
  'sub15': 'EA Play Pro 1 month. Dark EA Play Pro card with golden Pro badge, game controller and titles, dark blue and gold premium, gaming subscription, dark background with blue golden glow, 3D render',
  'sub16': 'EA Play Pro 3 month. Three dark EA Play tokens with golden 3-month Pro badge, game icons, dark blue gold and white premium, dark background with blue golden glow, 3D render',
  'sub17': 'Nintendo Switch Online 1 year. Red Nintendo Switch Online card with annual badge, Switch console and retro controllers, red white and black Nintendo, dark background with red glow, 3D render',
  'sub18': 'Nintendo Switch Online Expansion Pack. Premium red Nintendo card with golden Expansion Pack badge, N64 and GameBoy icons, red black and gold luxury, dark background with red golden glow, 3D cinematic render',
  'sub19': 'ChatGPT Plus 1 month. Dark ChatGPT Plus card with golden Plus badge and AI brain icon, neural network, dark green and gold AI, dark background with green golden glow, 3D render',
  'sub20': 'Midjourney 1 month. Blue Midjourney card with golden badge and AI art icons, artistic creative visualization, blue purple and gold AI art, creative AI, dark background with blue purple glow, 3D render',
};

// Build queue of images that need generation
const queue = [];
for (const [id, prompt] of Object.entries(ALL_PROMPTS)) {
  const filepath = path.join(OUTDIR, `${id}.png`);
  if (fs.existsSync(filepath)) {
    const stat = fs.statSync(filepath);
    if (stat.size > 10000) {
      console.log(`SKIP ${id} (exists, ${stat.size} bytes)`);
      continue;
    }
  }
  queue.push({ id, prompt, filepath });
}

console.log(`\nQueue: ${queue.length} images to generate\n`);

let success = 0;
let failed = 0;

for (let i = 0; i < queue.length; i++) {
  const { id, prompt, filepath } = queue[i];
  console.log(`[${i + 1}/${queue.length}] Generating ${id}...`);
  
  let generated = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      execSync(`z-ai image -p "${prompt.replace(/"/g, '\\"')}" -o "${filepath}" -s 1024x1024`, {
        timeout: 90000,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      if (fs.existsSync(filepath) && fs.statSync(filepath).size > 10000) {
        console.log(`  OK ${id} (${fs.statSync(filepath).size} bytes)`);
        generated = true;
        success++;
        break;
      }
    } catch (e) {
      console.log(`  Attempt ${attempt} failed for ${id}`);
      try { fs.unlinkSync(filepath); } catch {}
    }
  }
  
  if (!generated) {
    console.log(`  FAILED ${id}`);
    failed++;
  }
  
  // Delay between images
  if (i < queue.length - 1) {
    const delay = generated ? DELAY : 20000;
    console.log(`  Waiting ${delay}ms...`);
    await new Promise(r => setTimeout(r, delay));
  }
}

console.log(`\n========== COMPLETE ========== `);
console.log(`Success: ${success}, Failed: ${failed}`);
console.log(`Total images in gen/: ${fs.readdirSync(OUTDIR).filter(f => f.endsWith('.png')).length}`);
