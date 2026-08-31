import sys, json
d = json.load(sys.stdin)
r = d.get('results', [])
for x in r:
    n = len(x['gamesFound'])
    ok = 'OK' if x['success'] else 'FAIL'
    name = x['sourceName']
    print(f'  {name}: {ok} -> {n} productos')
total = sum(len(x['gamesFound']) for x in r)
print(f'')
print(f'TOTAL: {total} productos')
s = d.get('summary', {})
val = s.get('estimatedValue', 0)
print(f'Valor en venta: ${val:.2f} USD')
print(f'Ganancia (100%): ${val:.2f} USD')
