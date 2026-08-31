#!/usr/bin/env python3
"""
Buscar los Steam app IDs correctos para los 11 juegos que fallaron.
Usa CheapShark API + verificación directa.
"""

import urllib.request
import urllib.parse
import json
import time
import re

MISSING = {
    "epic-2": "Orcs Must Die! 3",
    "epic-3": "Kill Knight",
    "epic-4": "Hot Wheels Unleashed",
    "epic-8": "Dark and Darker",
    "epic-16": "Castlevania Anniversary Collection",
    "epic-21": "Moving Out",
    "epic-22": "Kardboard Kings",
    "epic-47": "Strange Horticulture",
    "prime-2": "Mafia II: Definitive Edition",
    "prime-6": "XCOM: Chimera Squad",
    "humble-1": "Dishonored: Death of the Outsider",
}

def search_cheapshark(title):
    """Buscar en CheapShark y obtener steamAppID"""
    q = urllib.parse.quote(title)
    url = f"https://www.cheapshark.com/api/1.0/deals?title={q}&pageSize=5"
    try:
        req = urllib.request.Request(url)
        req.add_header('User-Agent', 'Mozilla/5.0')
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read())
        results = []
        for d in data:
            app_id = d.get('steamAppID')
            if app_id and int(app_id) > 0:
                results.append((int(app_id), d.get('title', ''), d.get('metacriticScore', 'N/A')))
        return results
    except Exception as e:
        print(f"  Error searching: {e}")
        return []

def verify_steam_image(app_id):
    """Verificar que la imagen de Steam existe"""
    url = f"https://cdn.akamai.steamstatic.com/steam/apps/{app_id}/capsule_616x353.jpg"
    try:
        req = urllib.request.Request(url, method='HEAD')
        req.add_header('User-Agent', 'Mozilla/5.0')
        resp = urllib.request.urlopen(req, timeout=5)
        return resp.status == 200, url
    except:
        return False, url

# IDs alternativos para probar manualmente
ALTERNATIVE_IDS = {
    "epic-2": [1040290, 1203220, 1203210],  # Orcs Must Die 3
    "epic-3": [1407880, 2735170, 2685400],  # Kill Knight
    "epic-4": [1449240, 1449230, 1509210],  # Hot Wheels Unleashed
    "epic-8": [1289370, 1966720, 669790],   # Dark and Darker
    "epic-16": [1006070, 1006060, 1006080],  # Castlevania Anniversary
    "epic-21": [969960, 969961, 969962],     # Moving Out
    "epic-22": [1247540, 1247541],           # Kardboard Kings
    "epic-47": [1575560, 1575561],           # Strange Horticulture
    "prime-2": [3124620, 50130, 1238060],    # Mafia II DE
    "prime-6": [223070, 223071, 223072],     # XCOM Chimera Squad
    "humble-1": [641650, 641640, 403640],    # Dishonored: DotO
}

results = {}

for game_id, title in MISSING.items():
    print(f"\nBuscando: {title}")
    
    # 1. Buscar en CheapShark
    cs_results = search_cheapshark(title)
    if cs_results:
        print(f"  CheapShark encontró: {cs_results[:3]}")
    
    # 2. Probar IDs alternativos
    for aid in ALTERNATIVE_IDS.get(game_id, []):
        ok, url = verify_steam_image(aid)
        if ok:
            results[game_id] = url
            print(f"  ✓ ENCONTRADO: app_id={aid} -> {url}")
            break
        else:
            print(f"  ✗ app_id={aid} no funciona")
    
    # 3. Si aún no, probar resultados de CheapShark
    if game_id not in results and cs_results:
        for app_id, cs_title, mc in cs_results[:5]:
            ok, url = verify_steam_image(app_id)
            if ok:
                results[game_id] = url
                print(f'  ✓ CheapShark: app_id={app_id} ({cs_title}) -> {url}')
                break
    
    if game_id not in results:
        print(f"  ✗✗ NO SE ENCONTRÓ IMAGEN para {title}")
    
    time.sleep(0.3)

print(f"\n{'='*60}")
print(f"Resueltos: {len(results)} de {len(MISSING)}")
print(f"{'='*60}")
for gid, url in results.items():
    print(f"  {gid}: {url}")

# Guardar
remaining = [gid for gid in MISSING if gid not in results]
with open('/home/z/my-project/scripts/missing-resolved.json', 'w') as f:
    json.dump({"found": results, "still_missing": remaining}, f, indent=2)
