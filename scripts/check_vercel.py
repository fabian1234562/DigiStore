import json, re
with open('/tmp/vercel-tienda.json') as f:
    data = json.load(f)
html = data.get('data',data).get('html','')
text = re.sub(r'<[^>]+>', ' ', html)
text = re.sub(r'\s+', ' ', text).strip()
status = '404' if '404' in text[:300] else '200 OK'
print('TIENDA STATUS:', status)
print('Title:', data.get('data',data).get('title','N/A'))
for kw in ['Juegos escaneados', '100%', 'Fuente', 'Epic Games', 'Filtros', 'Buscar juegos']:
    found = kw in text
    print('  ' + ('OK' if found else 'NO') + ' ' + kw)
