#!/usr/bin/env python3
"""Update all product image URLs in store.ts with real searched images."""

import json
import re

# Load image URLs
with open('/home/z/my-project/scripts/final-image-urls.json') as f:
    image_urls = json.load(f)

# Platform -> image key mapping
# Each product uses its platform field to find the right image
PLATFORM_IMAGE_MAP = {
    # Gaming
    'Fortnite': 'fortnite',
    'Roblox': 'roblox',
    'Valorant': 'valorant',
    'Minecraft': 'minecraft',
    'League of Legends': 'lol',
    'Genshin Impact': 'genshin',
    'EA FC 25': 'eafc25',
    'Apex Legends': 'apex',
    'PUBG Mobile': 'pubgm',
    'Call of Duty': 'cod',
    'Free Fire': 'freefire',
    'Among Us': 'amongus',
    'Clash Royale': 'clashroyale',
    'Mobile Legends': 'mobilelegends',
    'Brawl Stars': 'brawlstars',
    'Counter-Strike 2': 'cs2',
    'GTA V': 'gtav',
    'Honkai Star Rail': 'honkai',
    'Wuthering Waves': 'wuthering',
    'Clash of Clans': 'coc',
    'FIFA Mobile': 'fifamobile',
    'Wild Rift': 'wildrift',
    'Diablo IV': 'diablo4',
    'Overwatch 2': 'overwatch2',
    'Rocket League': 'rocketleague',
    'Destiny 2': 'destiny2',
    'Warzone': 'warzone',
    'Pokemon Unite': 'pokemon',
    'Arena of Valor': 'arenaofvalor',
    'Standoff 2': 'standoff2',
    'Brawlhalla': 'brawlhalla',
    'Dead by Daylight': 'deadbydaylight',
    'Fall Guys': 'fallguys',
    'Rainbow Six Siege': 'rainbowsix',
    'Hearthstone': 'hearthstone',
    'PUBG PC': 'pubgpc',
    'Warframe': 'warframe',
    
    # Streaming
    'Netflix': 'netflix',
    'Spotify': 'spotify',
    'Disney+': 'disney',
    'HBO Max': 'hbomax',
    'Crunchyroll': 'crunchyroll',
    'Amazon Prime': 'amazonprime',
    'Paramount+': 'paramount',
    'Apple TV+': 'appletv',
    'Twitch': 'twitch',
    'Hulu': 'hulu',
    'Max': 'maxstream',
    'Peacock': 'peacock',
    'DAZN': 'dazn',
    'Star+': 'starplus',
    
    # Gift Cards
    'Steam': 'steam',
    'PlayStation': 'playstation',
    'Xbox': 'xbox',
    'Nintendo': 'nintendo',
    'Google Play': 'googleplay',
    'Apple': 'apple',
    'Amazon': 'amazon',
    'Epic Games': 'epicgames',
    'Riot Games': 'riotgames',
    'Discord': 'discord',
    'Visa': 'visa',
    'PayPal': 'paypal',
    'Xbox Game Pass': 'xboxgp',
    'Blizzard': 'blizzard',
    
    # Software
    'Windows': 'windows',
    'Microsoft 365': 'microsoft365',
    'Adobe': 'adobecc',
    'NordVPN': 'nordvpn',
    'Kaspersky': 'kaspersky',
    'Malwarebytes': 'malwarebytes',
    'Office': 'office2024',
    'Avast': 'avast',
    'Bitdefender': 'bitdefender',
    'Norton': 'norton',
    'ExpressVPN': 'expressvpn',
    'Surfshark': 'surfshark',
    'McAfee': 'mcafee',
    'ESET': 'eset',
    
    # Subscriptions
    'YouTube': 'youtube',
    'Canva': 'canva',
    'EA Play': 'eaplay',
    'ChatGPT': 'chatgpt',
    'Cloud Gaming': 'cloudgaming',
    'iCloud': 'icloud',
    'Medium': 'medium',
    'Duolingo': 'duolingo',
    'Notion': 'notion',
    'Midjourney': 'midjourney',
    'GitHub': 'github',
    'Dropbox': 'dropbox',
    'Figma': 'figma',
    'Slack': 'slack',
    'Zoom': 'zoom',
    
    # Accounts
    'Instagram': 'instagram',
    'TikTok': 'tiktok',
    'Twitter': 'twitter',
    'YouTube Accounts': 'youtubeacc',
    'Facebook': 'facebook',
    'Twitch Accounts': 'twitchacc',
    'Discord Accounts': 'discordacc',
    'Spotify Accounts': 'spotifyacc',
    'Snapchat': 'snapchat',
    'Telegram': 'telegram',
    'LinkedIn': 'linkedin',
    'Pinterest': 'pinterest',
    'Reddit': 'reddit',
    'Threads': 'threads',
    'WhatsApp': 'whatsapp',
}

# Read store.ts
with open('/home/z/my-project/src/lib/store.ts', 'r') as f:
    content = f.read()

# Replace image: '' with image: 'URL' for each product
# Match pattern: platform: 'XXX', region: ... image: ''  
# Actually we need to match each product object and extract platform

# Strategy: find each product entry, extract platform, lookup image URL, replace image: ''
# Products are between { id: 'xxx' ... } 

# Regex to find product blocks with image: ''
def replace_product_images(content):
    # Find all product objects
    pattern = r"(\{\s*id:\s*'[^']+',\s*name:\s*'[^']+',\s*description:\s*'[^']+',\s*price:\s*[\d.]+,\s*originalPrice:\s*[\d.]+,\s*category:\s*'[^']+',\s*subcategory:\s*'[^']+',\s*)image:\s*''(,\s*rating:.*?platform:\s*'([^']+)'"
    
    def replacer(match):
        before = match.group(1)
        after = match.group(2)
        platform = match.group(3)
        
        img_key = PLATFORM_IMAGE_MAP.get(platform, '')
        img_url = image_urls.get(img_key, '') if img_key else ''
        
        if img_url:
            return f"{before}image: '{img_url}'{after}"
        else:
            # Try fuzzy match
            for pkey, ikey in PLATFORM_IMAGE_MAP.items():
                if pkey.lower() in platform.lower() or platform.lower() in pkey.lower():
                    img_url = image_urls.get(ikey, '')
                    if img_url:
                        return f"{before}image: '{img_url}'{after}"
            print(f"  [WARN] No image for platform: {platform}")
            return match.group(0)  # Keep original
    
    # This regex is complex. Let me use a simpler line-by-line approach.
    return content

# Simpler approach: read line by line, track platform, when we see image: '' replace it
lines = content.split('\n')
new_lines = []
current_platform = ''
replacements = 0
warnings = []

for i, line in enumerate(lines):
    # Track current platform
    platform_match = re.search(r"platform:\s*'([^']+)'", line)
    if platform_match:
        current_platform = platform_match.group(1)
    
    # Replace image: '' 
    if "image: '" in line and "image: ''" in line:
        img_key = PLATFORM_IMAGE_MAP.get(current_platform, '')
        img_url = image_urls.get(img_key, '') if img_key else ''
        
        if not img_url:
            # Fuzzy match
            for pkey, ikey in PLATFORM_IMAGE_MAP.items():
                if pkey.lower() in current_platform.lower() or current_platform.lower() in pkey.lower():
                    img_url = image_urls.get(ikey, '')
                    if img_url:
                        break
        
        if img_url:
            new_lines.append(line.replace("image: ''", f"image: '{img_url}'"))
            replacements += 1
        else:
            warnings.append(f"Line {i+1}: No image for platform '{current_platform}'")
            new_lines.append(line)
    else:
        new_lines.append(line)

output = '\n'.join(new_lines)

with open('/home/z/my-project/src/lib/store.ts', 'w') as f:
    f.write(output)

print(f'Replacements: {replacements}')
if warnings:
    print('Warnings:')
    for w in warnings:
        print(f'  {w}')
else:
    print('All products updated!')
