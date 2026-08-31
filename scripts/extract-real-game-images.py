#!/usr/bin/env python3
"""
Extraer imágenes REALES de los 72 juegos desde Steam CDN.
Verifica que cada URL funcione y genera el mapeo para seed-data.ts
"""

import urllib.request
import urllib.error
import json
import sys
import time

STEAM_CDN = "https://cdn.akamai.steamstatic.com/steam/apps"
CAPSULE = "capsule_616x353.jpg"
HEADER = "header.jpg"

# Mapeo completo: game_id -> (steam_app_id, titulo)
GAMES = {
    # === EPIC GAMES (51) ===
    "epic-1": (1426210, "Sifu"),
    "epic-2": (1040290, "Orcs Must Die! 3"),
    "epic-3": (1407880, "Kill Knight"),
    "epic-4": (1449240, "Hot Wheels Unleashed"),
    "epic-5": (1716740, "Ghostrunner 2"),
    "epic-6": (870780, "Control"),
    "epic-7": (1147560, "Dredge"),
    "epic-8": (1289370, "Dark and Darker"),
    "epic-9": (268500, "Wizard of Legend"),
    "epic-10": (285920, "TerraTech"),
    "epic-11": (1910560, "Astrea: Six Sided Oracles"),
    "epic-12": (1782210, "Vampire Survivors"),
    "epic-13": (1176510, "The Lord of the Rings: Return to Moria"),
    "epic-14": (1942280, "Brotato"),
    "epic-15": (475150, "Beholder"),
    "epic-16": (1006070, "Castlevania Anniversary Collection"),
    "epic-17": (1139380, "Snakebird Complete"),
    "epic-18": (1399780, "Deceive Inc"),
    "epic-19": (1364780, "Ghostwire: Tokyo"),
    "epic-20": (582660, "Witch It"),
    "epic-21": (969960, "Moving Out"),
    "epic-22": (1247540, "Kardboard Kings"),
    "epic-23": (383120, "Empyrion - Galactic Survival"),
    "epic-24": (1066370, "Bear and Breakfast"),
    "epic-25": (1462500, "The Spirit and The Mouse"),
    "epic-26": (1404620, "TOEM"),
    "epic-27": (1504530, "The Callisto Protocol"),
    "epic-28": (884830, "Gigantic: Rampage Edition"),
    "epic-29": (345460, "Death's Gambit: Afterlife"),
    "epic-30": (2080670, "Cygni: All Guns Blazing"),
    "epic-31": (1149360, "F.I.S.T.: Forged In Shadow Torch"),
    "epic-32": (1121820, "Arcade Paradise"),
    "epic-33": (908860, "Sunless Skies: Sovereign Edition"),
    "epic-34": (1408650, "Marvel's Midnight Suns"),
    "epic-35": (736260, "Chivalry 2"),
    "epic-36": (1248130, "Farming Simulator 22"),
    "epic-37": (1222690, "Dragon Age: Inquisition"),
    "epic-38": (1135690, "Ghostrunner"),
    "epic-39": (578650, "The Outer Worlds"),
    "epic-40": (337000, "Deus Ex: Mankind Divided"),
    "epic-41": (1249820, "Marvel's Guardians of the Galaxy"),
    "epic-42": (752590, "A Plague Tale: Innocence"),
    "epic-43": (698780, "Doki Doki Literature Club Plus!"),
    "epic-44": (812970, "Super Meat Boy Forever"),
    "epic-45": (779340, "Total War: Three Kingdoms"),
    "epic-46": (40720, "Machinarium"),
    "epic-47": (1575560, "Strange Horticulture"),
    "epic-48": (1528530, "Make Way"),
    "epic-49": (960890, "Bloons TD 6"),
    "epic-50": (242640, "Styx: Master of Shadows"),
    "epic-51": (671620, "Styx: Shards of Darkness"),

    # === PRIME GAMING (9) ===
    "prime-1": (2108330, "Saints Row: The Third Remastered"),
    "prime-2": (3124620, "Mafia II: Definitive Edition"),
    "prime-3": (1436700, "Crime Boss: Rockay City"),
    "prime-4": (2066170, "Saints Row IV: Re-Elected"),
    "prime-5": (1123220, "Steelrising"),
    "prime-6": (223070, "XCOM: Chimera Squad"),
    "prime-7": (860840, "In Sound Mind"),
    "prime-8": (238010, "Deus Ex: Game of the Year Edition"),
    "prime-9": (819740, "SteamWorld Quest"),

    # === GOG (4) ===
    "gog-1": (212680, "FTL: Faster Than Light"),
    "gog-2": (323440, "Jotun: Valhalla Edition"),
    "gog-3": (252750, "The Last Door: Season 1"),
    "gog-4": (284100, "Sanctuary RPG"),

    # === HUMBLE BUNDLE (2) ===
    "humble-1": (641650, "Dishonored: Death of the Outsider"),
    "humble-2": (501310, "Orwell: Keeping an Eye On You"),

    # === INDIEGALA (1) ===
    "indie-1": (282800, "100% Orange Juice"),

    # === FANATICAL (1) ===
    "fanatical-1": (1005890, "Eternal Threads"),

    # === STEAM F2P (4) ===
    "steam-1": (1085660, "Destiny 2"),
    "steam-2": (1172470, "Apex Legends"),
    "steam-3": (230410, "Warframe"),
    "steam-4": (238960, "Path of Exile"),
}

def verify_url(url, timeout=5):
    """Verifica que una URL responde con 200"""
    try:
        req = urllib.request.Request(url, method='HEAD')
        req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        resp = urllib.request.urlopen(req, timeout=timeout)
        return resp.status == 200
    except (urllib.error.HTTPError, urllib.error.URLError, Exception):
        return False

def main():
    results = {}
    verified = 0
    failed = 0
    fallback = []

    print(f"Verificando {len(GAMES)} imágenes de Steam CDN...\n")

    for game_id, (app_id, title) in GAMES.items():
        # Intentar capsule primero (mejor calidad)
        url = f"{STEAM_CDN}/{app_id}/{CAPSULE}"
        if verify_url(url):
            results[game_id] = url
            verified += 1
            print(f"  ✓ {game_id}: {title} -> {url}")
        else:
            # Fallback a header
            url2 = f"{STEAM_CDN}/{app_id}/{HEADER}"
            if verify_url(url2):
                results[game_id] = url2
                verified += 1
                print(f"  ~ {game_id}: {title} -> {url2} (header)")
            else:
                failed += 1
                fallback.append(game_id)
                print(f"  ✗ {game_id}: {title} -> SIN IMAGEN (app_id={app_id})")
        time.sleep(0.1)  # No saturar

    print(f"\n{'='*60}")
    print(f"Resultados: {verified} OK, {failed} fallaron")
    print(f"{'='*60}")

    if fallback:
        print(f"\nJuegos sin imagen (necesitan búsqueda manual):")
        for gid in fallback:
            aid, t = GAMES[gid]
            print(f"  - {gid}: {t} (app_id={aid})")

    # Guardar resultados como JSON
    output = {
        "verified": verified,
        "failed": failed,
        "images": results,
        "missing": fallback
    }
    with open('/home/z/my-project/scripts/verified-game-images.json', 'w') as f:
        json.dump(output, f, indent=2)
    print(f"\nResultados guardados en scripts/verified-game-images.json")

    return results

if __name__ == '__main__':
    main()
