import json
with open('/home/z/my-project/tool-results/bash_1788186517109_f2c98f1a696e.txt') as f:
    d = json.load(f)
r = d.get('results', [])
print('=== ESCANEO REAL COMPLETADO ===')
for x in r:
    n = len(x['gamesFound'])
    ok = 'OK' if x['success'] else 'FALLO'
    print(f'  {x["sourceName"]}: {ok} -> {n} productos')
total = sum(len(x['gamesFound']) for x in r)
print(f'\nTOTAL: {total} productos escaneados')
s = d.get('summary', {})
val = s.get('estimatedValue', 0)
print(f'Valor en venta: ${val:.2f} USD')
print(f'Ganancia (100%): ${val:.2f} USD')
