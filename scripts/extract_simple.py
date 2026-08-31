import json, re, os, glob, sys

def clean(t):
    return t.replace('&amp;','&').replace('&#039;',"'").replace('&nbsp;',' ').replace('&quot;','"').strip()

def extract_from_page(filepath):
    try:
        with open(filepath) as f:
            data = json.load(f)
    except Exception as e:
        print(f'Error: {e}', file=sys.stderr)
        return []
    
    html = data.get('data', data).get('html', '')
    text = re.sub(r'<[^>]+>', ' ', html)
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Try to find structured data (ItemList)
    start = text.find('itemListElement')
    if start > -1:
        js = text[max(0,start-200):start+5000]
        names = re.findall(r'"name":\s*"([^"]{5,80})"', js)
        games = []
        for n in names:
            n = clean(n)
            if n and '[REDACTED]' not in n and len(n) > 4:
                games.append(n)
        if games:
            return games
    
    return []

# Extract from specific pages
pages = glob.glob('/home/z/my-project/page-*.json')
for p in sorted(pages):
    games = extract_from_page(p)
    if games:
        print(f'\n=== {os.path.basename(p)} ({len(games)} games) ===')
        for g in games[:20]:
            print(f'  {g}')
        if len(games) > 20:
            print(f'  ... +{len(games)-20} more')
