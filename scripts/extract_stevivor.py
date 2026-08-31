import json, re

def clean(t):
    return t.replace('&amp;','&').replace('&#039;',"'").replace('&nbsp;',' ').strip()

with open('/home/z/my-project/page-stevivor-epic-aug2025.json') as f:
    data = json.load(f)
html = data.get('data',data).get('html','')
text = re.sub(r'<[^>]+>', '\n', html)
lines = [l.strip() for l in text.split('\n') if l.strip()]
for l in lines:
    if len(l) > 4 and len(l) < 150:
        cl = clean(l)
        if any(kw in cl for kw in ['free', 'game', 'Epic', 'August', 'Kamaera', 'Machinarium', 'Horticulture', 'Way', 'Store']):
            print(cl)
