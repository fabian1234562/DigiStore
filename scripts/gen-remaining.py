#!/usr/bin/env python3
"""Generate remaining product images using z-ai CLI."""
import subprocess, os, time

DIR = "/home/z/my-project/public/products/gen"

PROMPTS = {
    # Gaming remaining
    "wuthering": "Professional Wuthering Waves card, cyan white ethereal spirit, anime action premium",
    "coc": "Professional Clash of Clans gems card, gold dark barbarian king, mobile strategy premium",
    "fifamobile": "Professional FIFA Mobile coins card, green gold soccer stadium, mobile sports premium",
    "wildrift": "Professional LoL Wild Rift card, blue purple champion silhouette, mobile MOBA premium",
    "diablo4": "Professional Diablo IV card, dark red black demon silhouette, dark fantasy game premium",
    "overwatch2": "Professional Overwatch 2 coins card, orange blue hero silhouette, team shooter premium",
    "rocketleague": "Professional Rocket League credits card, blue orange rocket car boost, vehicular soccer premium",
    "destiny2": "Professional Destiny 2 silver card, white gold guardian silhouette, space sci-fi premium",
    "warzone": "Professional Call of Duty Warzone card, dark military green soldier, tactical FPS premium",
    "pokemon": "Professional Pokemon Unite card, yellow blue Pikachu, Pokemon battle arena premium",
    "arenaofvalor": "Professional Arena of Valor card, blue gold hero silhouette, mobile MOBA premium",
    "standoff2": "Professional Standoff 2 card, gray red weapon skins, mobile FPS premium",
    "brawlhalla": "Professional Brawlhalla card, purple blue warrior, platform fighter premium",
    "deadbydaylight": "Professional Dead by Daylight card, dark red black killer survivor, horror premium",
    "fallguys": "Professional Fall Guys card, pink blue bean character, fun party game premium",
    "rainbowsix": "Professional Rainbow Six Siege card, blue orange operator, tactical FPS premium",
    "hearthstone": "Professional Hearthstone card, golden brown card fire, digital card game fantasy premium",
    "pubgpc": "Professional PUBG PC card, dark yellow black crate weapons, battle royale PC premium",
    "warframe": "Professional Warframe Platinum card, white teal Warframe silhouette, space ninja premium",
    # Streaming
    "netflix": "Professional Netflix gift card, classic red black N logo, premium streaming service",
    "spotify": "Professional Spotify Premium card, vibrant green black music notes, audio streaming premium",
    "disney": "Professional Disney Plus card, blue purple magical castle silhouette, streaming premium",
    "hbomax": "Professional HBO Max card, deep purple gold premium, streaming luxurious",
    "crunchyroll": "Professional Crunchyroll card, orange black anime character, anime streaming premium",
    "amazonprime": "Professional Amazon Prime Video card, blue black play button, streaming premium",
    "paramount": "Professional Paramount Plus card, blue white mountain star logo, streaming premium",
    "appletv": "Professional Apple TV Plus card, dark gray white minimalist Apple, streaming elegant",
    "twitch": "Professional Twitch card, purple white streaming camera chat, live streaming premium",
    "hulu": "Professional Hulu card, green white TV screen, streaming colorful premium",
    "maxstream": "Professional Max card, dark blue indigo cinematic, HBO streaming premium",
    "peacock": "Professional Peacock card, yellow purple peacock feathers, streaming colorful",
    "dazn": "Professional DAZN card, red black sports elements, live sports premium",
    "starplus": "Professional Star Plus card, blue teal star entertainment, Disney streaming premium",
    # Gift cards
    "steam": "Professional Steam wallet card, dark blue gray Steam logo, gaming platform premium",
    "playstation": "Professional PlayStation card, blue black PS controller, Sony gaming premium",
    "xbox": "Professional Xbox card, green black Xbox controller, Microsoft gaming premium",
    "nintendo": "Professional Nintendo card, red white Switch console, Nintendo gaming colorful",
    "googleplay": "Professional Google Play card, multicolor gradient Play Store triangle, Android premium",
    "apple": "Professional Apple App Store card, minimalist white gray Apple logo, Apple elegant",
    "amazon": "Professional Amazon card, orange teal shopping cart, e-commerce premium modern",
    "epicgames": "Professional Epic Games card, dark Unreal Engine logo, gaming store premium",
    "riotgames": "Professional Riot Games card, red white game icons, gaming publisher premium",
    "discord": "Professional Discord Nitro card, blurple purple white logo, chat premium modern",
    "visa": "Professional Visa prepaid card, blue gold Visa logo, financial payment elegant",
    "paypal": "Professional PayPal card, blue gold PayPal logo, digital payment modern",
    "xboxgp": "Professional Xbox Game Pass card, green black controller cloud gaming, subscription premium",
    "blizzard": "Professional Blizzard card, dark blue game icons, gaming publisher premium",
    # Software
    "windows": "Professional Windows 11 Pro card, blue gradient Windows logo, OS professional",
    "microsoft365": "Professional Microsoft 365 card, red blue Office icons, productivity premium",
    "adobecc": "Professional Adobe Creative Cloud card, dark red purple Adobe icons, creative premium",
    "nordvpn": "Professional NordVPN card, dark blue world map shield, VPN security premium",
    "kaspersky": "Professional Kaspersky card, green white shield, antivirus security premium",
    "malwarebytes": "Professional Malwarebytes card, blue white bug, cybersecurity premium",
    "office2024": "Professional Office 2024 card, orange white Word Excel icons, productivity premium",
    "avast": "Professional Avast card, orange dark shield, antivirus security protective",
    "bitdefender": "Professional Bitdefender card, red black dragon shield, cybersecurity powerful",
    "norton": "Professional Norton 360 card, yellow black circular shield, antivirus trusted",
    "expressvpn": "Professional ExpressVPN card, green dark network globe, VPN privacy secure",
    "surfshark": "Professional Surfshark card, teal dark wave shark, VPN privacy premium",
    "mcafee": "Professional McAfee card, red white shield, antivirus enterprise",
    "eset": "Professional ESET card, blue white shield logo, antivirus clean",
    # Subscriptions
    "youtube": "Professional YouTube Premium card, red white play button, video streaming modern",
    "canva": "Professional Canva Pro card, purple white design tools, creative platform premium",
    "eaplay": "Professional EA Play Pro card, dark EA game controller, gaming subscription",
    "chatgpt": "Professional ChatGPT Plus card, dark teal AI brain chat, AI premium modern",
    "cloudgaming": "Professional GeForce NOW card, green cloud controller, cloud gaming futuristic",
    "icloud": "Professional iCloud Plus card, white blue cloud storage icon, Apple cloud premium",
    "medium": "Professional Medium card, black white minimalist writing, publishing elegant",
    "duolingo": "Professional Duolingo Plus card, green white owl mascot, language learning fun",
    "notion": "Professional Notion Pro card, black white workspace, productivity modern",
    "midjourney": "Professional Midjourney card, blue purple AI artwork, AI art creative premium",
    "github": "Professional GitHub Copilot card, dark gray code octocat, developer premium",
    "dropbox": "Professional Dropbox card, blue white cloud folder, cloud storage premium",
    "figma": "Professional Figma Pro card, purple white design tools, UI design premium",
    "slack": "Professional Slack card, purple green chat channel, team communication premium",
    "zoom": "Professional Zoom card, blue white video camera, video conferencing premium",
    # Accounts
    "instagram": "Professional Instagram growth card, pink purple orange camera heart, social vibrant",
    "tiktok": "Professional TikTok growth card, black cyan music note, social modern",
    "twitter": "Professional Twitter X card, black white X logo, social modern",
    "youtubeacc": "Professional YouTube channel card, red white play button subscribers, social premium",
    "facebook": "Professional Facebook card, blue white like share, social premium",
    "twitchacc": "Professional Twitch channel card, purple white streaming chat, live premium",
    "discordacc": "Professional Discord server card, purple server boost members, community premium",
    "spotifyacc": "Professional Spotify growth card, green black music followers, music platform",
    "snapchat": "Professional Snapchat card, yellow white ghost, social fun",
    "telegram": "Professional Telegram card, blue white paper plane chat, messaging premium",
    "linkedin": "Professional LinkedIn card, blue white professional network, business social",
    "pinterest": "Professional Pinterest card, red white pin board, social premium",
    "reddit": "Professional Reddit card, orange white upvote, community forum premium",
    "threads": "Professional Threads card, black white at symbol, social modern",
    "whatsapp": "Professional WhatsApp card, green white phone chat, messaging premium",
}

def main():
    done = 0
    failed = 0
    skipped = 0
    total = len(PROMPTS)
    
    for key, prompt in PROMPTS.items():
        outfile = os.path.join(DIR, f"{key}.png")
        if os.path.exists(outfile):
            skipped += 1
            continue
        
        try:
            result = subprocess.run(
                ['z-ai', 'image', '-p', prompt, '-o', outfile, '-s', '1024x1024'],
                capture_output=True, timeout=90
            )
            if result.returncode == 0:
                done += 1
                print(f"[OK] {key} ({done+skipped}/{total})")
            else:
                # Retry after delay
                time.sleep(15)
                result = subprocess.run(
                    ['z-ai', 'image', '-p', prompt, '-o', outfile, '-s', '1024x1024'],
                    capture_output=True, timeout=90
                )
                if result.returncode == 0:
                    done += 1
                    print(f"[RETRY OK] {key} ({done+skipped}/{total})")
                else:
                    failed += 1
                    print(f"[FAIL] {key}: {result.stderr.decode()[-100:]}")
        except subprocess.TimeoutExpired:
            failed += 1
            print(f"[TIMEOUT] {key}")
        except Exception as e:
            failed += 1
            print(f"[ERROR] {key}: {e}")
        
        time.sleep(3)
    
    print(f"\n=== DONE: {done} generated, {skipped} skipped, {failed} failed ===")
    print(f"Total images: {done+skipped}/{total}")

if __name__ == '__main__':
    main()
