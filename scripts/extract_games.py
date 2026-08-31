import json, re

def extract_schema_games(filepath):
    with open(filepath) as f:
        data = json.load(f)
    html = data.get('data', data).get('html', '')
    
    # Find the schema.org ItemList JSON
    # Look for the structured data block
    start = html.find('"itemListElement"')
    if start == -1:
        print('No ItemList found')
        return []
    
    # Find the beginning of the JSON block
    json_start = html.rfind('{', 0, start)
    # Find matching end - count braces
    depth = 0
    json_end = json_start
    for i in range(json_start, min(json_start + 50000, len(html))):
        if html[i] == '{':
            depth += 1
        elif html[i] == '}':
            depth -= 1
            if depth == 0:
                json_end = i + 1
                break
    
    raw_json = html[json_start:json_end]
    try:
        schema = json.loads(raw_json)
    except:
        # Try to fix common issues
        raw_json = raw_json.replace('&amp;', '&').replace('&#039;', "'")
        try:
            schema = json.loads(raw_json)
        except Exception as e:
            print(f'JSON parse error: {e}')
            return []
    
    games = []
    items = schema.get('itemListElement', [])
    for item in items:
        name = item.get('item', {}).get('name', '')
        # Clean HTML tags
        name = re.sub(r'<[^>]+>', ' ', name).strip()
        name = name.replace('&amp;', '&').replace('&#039;', "'").replace('&nbsp;', ' ')
        if name and '[REDACTED]' not in name:
            games.append(name)
    
    return games

games = extract_schema_games('/home/z/my-project/page-pcgamer-epic.json')
print(f'Extracted {len(games)} games from PC Gamer Epic list:')
for g in games:
    print(g)
