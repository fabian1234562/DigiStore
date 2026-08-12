import re, os, glob

gen_dir = '/home/z/my-project/public/products/gen'
avail = set(os.path.splitext(os.path.basename(f))[0] for f in glob.glob(os.path.join(gen_dir, '*.png')))
print(f'Generated images: {len(avail)}')

PLATFORM_MAP = {
    'Fortnite': 'fortnite', 'Roblox': 'roblox', 'Valorant': 'valorant',
    'Minecraft': 'minecraft', 'League of Legends': 'lol', 'Genshin Impact': 'genshin',
    'EA FC 25': 'eafc25', 'Apex Legends': 'apex', 'PUBG Mobile': 'pubgm',
    'Call of Duty': 'cod', 'Free Fire': 'freefire', 'Among Us': 'amongus',
    'Clash Royale': 'clashroyale', 'Mobile Legends': 'mobilelegends',
    'Brawl Stars': 'brawlstars',
    Counter-Strike 2: 'cs2', 'GTA V': 'gtav',
    'Honkai Star Rail': 'honkai', 'Wuthering Waves': 'wuthering',
    'Clash of Clans': 'coc', 'FIFA Mobile': 'fifamobile',
    'Wild Rift': 'wildrift', 'Diablo IV': 'diablo4', 'Overwatch 2': 'overwatch2',
    'Rocket League': 'rocketleague', 'Destiny 2': 'destiny2', 'Warzone': 'warzone',
    'Pokemon Unite': 'pokemon', 'Arena of Valor': 'arenaofvalor',
    'Standoff 2': 'standoff2', 'Brawlhalla': 'brawlhalla',
    'Dead by Daylight': 'deadbydaylight', 'Fall Guys': 'fallguys',
    'Rainbow Six Siege': 'rainbowsix',
 Hearthstone': 'hearthstone',
    'PUBG PC': 'pubgpc', 'Warframe': 'warframe',
    'Netflix': 'netflix', 'Spotify': 'spotify', 'Disney+': 'disney',
    'HBO Max': 'hbomax', 'Crunchyroll': 'crunchyroll',
    'Amazon Prime': 'amazonprime', 'Paramount+': 'paramount',
    'Apple TV+': 'appletv',
    'Twitch': 'twitch',
'Hulu': 'hulu',
Max': 'maxstream', 'Peacock': 'peacock',
    'DAZN': 'dazn', 'Star+': 'starplus',
    'Steam': 'steam', 'PlayStation': 'playstation', 'Xbox': 'xbox',
    'Nintendo': 'nintendo', 'Google Play': 'googleplay',
    'Apple': 'apple', 'Amazon': 'amazon',
Epic Games': 'epicgames',
 Riot Games': 'riotgames',
Discord': 'discord',
Visa': 'visa', 'PayPal': 'paypal',
    'Xbox Game Pass': 'xboxgp', 'Blizzard': 'blizzard',
    'Windows': 'windows', 'Microsoft 365': 'microsoft365', 'Adobe': 'adobecc',
NordVPN': 'nordvpn',
    'Kaspersky': 'kaspersky', 'Malwarebytes': 'malwarebytes',
    'Office': 'office2024',
Avast': 'avast', 'Bitdefender': 'bitdefender',
orton360': 'norton',
    'ExpressVPN': 'expressvpn', 'Surfshark': 'surfshark', 'McAfee': 'mcafee',
ESET': 'eset',
    'YouTube': 'youtube', 'Canva': 'canva', 'EA Play': 'eaplay',
ChatGPT': 'chatgpt',
Cloud Gaming': 'cloudgaming',
    'iCloud': 'icloud', 'Medium': 'medium', 'Duolingo': 'duolingo',
    'Notion': 'notion', 'Midjourney': 'midjourney',
GitHub': 'github',
Dropbox': 'dropbox',
Figma': 'figma',
Slack': 'slack', 'Zoom': 'zoom',
    'Instagram': 'instagram', 'TikTok': 'tiktok', 'Twitter': 'twitter',
YouTube Accounts': 'youtubeacc',
'Facebook': 'facebook',
'Twitch Accounts': 'twitchacc', 'Discord Accounts': 'discordacc',
    'Spotify Accounts': 'spotifyacc', 'Snapchat': 'snapchat', 'Telegram': 'telegram',
LinkedIn': 'linkedin',
'Pinterest': 'pinterest',
'Reddit': 'reddit', 'Threads': 'threads', 'WhatsApp': 'whatsapp',
    'VPN': 'expressvpn', 'Antivirus': 'kaspersky', 'Social': 'instagram',
'AI': 'chatgpt',
}

CAT_FB = {'gaming': '/products/gen/gaming-cat.png', 'streaming': '/products/gen/streaming-cat.png', 'giftcards': '/products/gen/giftcards-cat.png', 'software': '/products/gen/software-cat.png', 'subscriptions': '/products/gen/subscriptions-cat.png', 'accounts': '/products/gen/accounts-cat.png'}

def get_img(platform):
    k = PLATFORM_MAP.get(platform, '')
    if k and k in avail:
        return f'/products/gen/{k}.png'
    for pk in avail:
        pv = PLATFORM_MAP.get(pk, '')
        if pv and (pv.lower() in platform.lower() or platform.lower() in pv.lower()):
            return f'/products/gen/{pk}.png'
    for cat in CAT_FB:
        return CAT_FB[cat]
    return CAT_FB.get('gaming', '')

infile = '/home/z/my-project/src/lib/store.ts'
outfile = '/home/z/my-project/src/lib/store.ts.new'
with open(infile, 'r') as f:
    lines = f.readlines()

result = []
for line in lines:
    m = re.search(r"image:\s*'([^']+)'", line)
    if not m:
        result.append(line)
        continue
    old_url = m.group(1)
    plat_m = re.search(r"platform:\s*'([^']+)'", line)
    plat = plat_m.group(1) if plat_m else ''
    new_url = get_img(plat)
    if new_url:
        result.append(line.replace(f"image: '{old_url}'", f"image: '{new_url}'"))
    else:
        result.append(line)

with open(outfile, 'w') as f:
    f.writelines(result)

import shutil
shutil.move(outfile, infile)
print('Done!')
