#!/usr/bin/env python3
import urllib.request
import json
import time

# Más IDs alternativos para los 5 restantes
TRY = {
    "epic-16": {
        "name": "Castlevania Anniversary Collection",
        "ids": [1006070, 1006060, 1006080, 955940, 955941, 955942, 955943, 1018040, 1018041, 1018042, 1018043]
    },
    "epic-21": {
        "name": "Moving Out",
        "ids": [969960, 969961, 969962, 1046940, 739080, 739081]
    },
    "epic-22": {
        "name": "Kardboard Kings",
        "ids": [1247540, 1247541, 1247542, 1247543, 1688780, 1688781, 1740080, 1740081]
    },
    "epic-47": {
        "name": "Strange Horticulture",
        "ids": [1575560, 1575561, 1575562, 1575563, 1575570, 1575571, 1575580, 1575581, 1750710, 1750711]
    },
    "prime-6": {
        "name": "XCOM Chimera Squad",
        "ids": [223070, 223071, 223072, 223073, 223074, 223075, 223080, 223090, 223100]
    },
}

results = {}

for gid, info in TRY.items():
    print(f"\nBuscando: {info['name']}")
    for aid in info['ids']:
        url = f"https://cdn.akamai.steamstatic.com/steam/apps/{aid}/capsule_616x353.jpg"
        try:
            req = urllib.request.Request(url, method='HEAD')
            req.add_header('User-Agent', 'Mozilla/5.0')
            resp = urllib.request.urlopen(req, timeout=5)
            if resp.status == 200:
                results[gid] = url
                print(f"  ✓ app_id={aid} -> {url}")
                break
        except:
            pass
    else:
        print(f"  ✗ Ninguno funcionó")
    time.sleep(0.1)

print(f"\n{'='*50}")
print(f"Encontrados: {len(results)} de {len(TRY)}")
for gid, url in results.items():
    print(f"  {gid}: {url}")

still_missing = [gid for gid in TRY if gid not in results]
print(f"\nAún faltan: {still_missing}")

with open('/home/z/my-project/scripts/final-remaining.json', 'w') as f:
    json.dump(results, f, indent=2)
