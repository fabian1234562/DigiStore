import json, re

def clean(t):
    return t.replace('&amp;','&').replace('&#039;',"'").replace('&nbsp;',' ').replace('&#39;',"'").strip()

with open('/home/z/my-project/page-pcgamer-epic.json') as f:
    data = json.load(f)
html = data.get('data',data).get('html','')

# Extract ALL itemListElement blocks - there may be multiple (one per year)
blocks = []
start = 0
while True:
    idx = html.find('itemListElement', start)
    if idx == -1:
        break
    # Find the JSON block
    json_start = html.rfind('{', 0, idx)
    depth = 0
    json_end = json_start
    for i in range(json_start, min(json_start + 100000, len(html))):
        if html[i] == '{': depth += 1
        elif html[i] == '}':
            depth -= 1
            if depth == 0:
                json_end = i + 1
                break
    raw = html[json_start:json_end]
    try:
        schema = json.loads(raw)
        items = schema.get('itemListElement', [])
        if items:
            blocks.append(items)
    except:
        pass
    start = idx + 15

all_games = []
for i, block in enumerate(blocks):
    games = []
    for item in block:
        name = item.get('item', {}).get('name', '')
        name = re.sub(r'<[^>]+>', ' ', name).strip()
        name = clean(name)
        if name and '[REDACTED]' not in name:
            games.append(name)
    print(f'Block {i}: {len(games)} games')
    all_games.extend(games)

print(f'\nTotal: {len(all_games)} games')
for g in all_games:
    print(g)
