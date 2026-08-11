#!/usr/bin/env python3
import os, re, glob

gen_dir = '/home/z/my-project/public/products/gen'
available = set(os.path.splitext(os.path.basename(f))[0] for f in glob.glob(os.path.join(gen_dir, '*.png')))
print(f'Available: {len(available)}')
with open('/home/z/my-project/src/lib/store.ts', 'r') as f:
    content = f.read()
cat_fb = {'gaming': '/products/gen/gaming-cat.png', 'streaming': '/products/gen/streaming-cat.png', 'giftcards': '/products/gen/giftcards-cat.png', 'software': '/products/gen/software-cat.png', 'subscriptions': '/products/gen/subscriptions-cat.png', 'accounts': '/products/gen/accounts-cat.png'}
def get_img(platform):
    mapping = {'Fortnite': 'fortnite', 'Roblox': 'roblox', 'Valorant': 'valorant', 'Minecraft': 'minecraft', 'League of Legends': 'lol', 'Genshin Impact': 'genshin', 'EA FC 25': 'eafc25', 'Apex Legends': 'apex', 'PUBG Mobile': 'pubgm', 'Call of Duty': 'cod', 'Free Fire': 'freefire', 'Among Us': 'amongus', 'Clash Royale': 'clashroyale', 'Mobile Legends': 'mobilelegends', 'Brawl Stars': 'brawlstars', 'Counter-Strike 2': 'cs2', 'GTA V': 'gtav', 'Honkai Star Rail': 'honkai', 'Wuthering Waves': 'wuthering', 'Clash of Clans': 'coc', 'FIFA Mobile': 'fifamobile', 'Wild Rift': 'wildrift', 'Diablo IV': 'diablo4', 'Overwatch 2': 'overwatch2', 'Rocket League': 'rocketleague', 'Destiny 2': 'destiny2', 'Netflix': 'netflix', 'Spotify': 'spotify', 'Disney+': 'disney', 'HBO Max': 'hbomax', 'Crunchyroll': 'crunchyroll', 'Amazon Prime': 'amazonprime', 'Paramount+': 'paramount', 'Apple TV+': 'appletv', 'Twitch': 'twitch', 'Hulu': 'hulu', 'Max': 'maxstream', 'Peacock': 'peacock', 'DAZN': 'dazn', 'Star+': 'starplus', 'Steam': 'steam', 'PlayStation': 'playstation', 'Xbox': 'xbox', 'Nintendo': 'nintendo', 'Google Play': 'googleplay', 'Apple': 'apple', 'Amazon': 'amazon', 'Epic Games': 'epicgames', 'Riot Games': 'riotgames', 'Discord': 'discord', 'Visa': 'visa', 'PayPal': 'paypal', 'Windows': 'windows', 'Microsoft 365': 'microsoft365', 'Adobe': 'adobecc', 'NordVPN': 'nordvpn', 'Kaspersky': 'kaspersky', 'Malwarebytes': 'malwarebytes', 'Office': 'office2024', 'Avast': 'avast', 'Bitdefender': 'bitdefender', 'Norton 360': 'norton', 'ExpressVPN': 'expressvpn', 'Surfshark': 'surfshark', 'McAfee': 'mcafee', 'ESET': 'eset', 'YouTube': 'youtube', 'Canva': 'canva', 'EA Play': 'eaplay', 'ChatGPT': 'chatgpt', 'Cloud Gaming': 'cloudgaming', 'iCloud': 'icloud', 'Medium': 'medium', 'Duolingo': 'duolingo', 'Notion': 'notion', 'Midjourney': 'midjourney', 'GitHub': 'github', 'Dropbox': 'dropbox', 'Figma': 'figma', 'Slack': 'slack', 'Zoom': 'zoom', 'Instagram': 'instagram', 'TikTok': 'tiktok', 'Twitter': 'twitter', 'YouTube Accounts': 'youtubeacc', 'Facebook': 'facebook', 'Twitch Accounts': 'twitchacc', 'Discord Accounts': 'discordacc', 'Spotify Accounts': 'spotifyacc', 'Snapchat': 'snapchat', 'Telegram': 'telegram', 'LinkedIn': 'linkedin', 'Pinterest': 'pinterest', 'Reddit': 'reddit', 'Threads': 'threads', 'WhatsApp': 'whatsapp'}
    key = mapping.get(platform, '')
    if key and key in available:
        return f'/products/gen/{key}.png'
    for pkey in available:
        pk = mapping.get(pkey, '')
        if pk and (pk.lower() in platform.lower() or platform.lower() in pk.lower()):
            return f'/products/gen/{pkey}.png'
    for cat, fb in cat_fb.items():
        return fb
def replace_fn(m):
    line = m.group(0)
    pm = re.search(r"platform:\s*'([^']+)'", line)
    if not pm:
        return line
    plat = pm.group(1)
    img = get_img(plat)
    if img:
        return line.replace(m.group(1), img)
    return line
result = re.sub(r"image: '([^']+)'", replace_fn, content)
with open('/home/z/my-project/src/lib/store.ts', 'w') as f:
    f.write(result)
print('Done!')
