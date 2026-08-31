import json, re

def clean(t):
    return t.replace('&amp;','&').replace('&#039;',"'").replace('&nbsp;',' ').strip()

with open('/home/z/my-project/page-recharge-epic-2026.json') as f:
    data = json.load(f)
html = data.get('data',data).get('html','')
text = re.sub(r'<[^>]+>', '\n', html)
lines = [l.strip() for l in text.split('\n') if l.strip()]

# Look for game list patterns
for i, l in enumerate(lines):
    cl = clean(l)
    # Pattern: game name, genre, developer
    if len(cl) > 5 and len(cl) < 100:
        if any(kw in cl for kw in ['Bloons', 'Wildgate', 'Trine', 'Viewfinder', 'Skald', 'Chivalry', 'Sifu', 'Control', 'Dredge', 'Vampire', 'Ghostrunner', 'Farming', 'Dragon Age', 'Marvel', 'Deus Ex', 'Genshin', 'Rocket League', 'Fortnite', 'Honkai', 'Zenless', 'Machinarium', 'Kamaera', 'Strange Horticulture', 'Make Way']):
            print(f'{i}: {cl}')
            # Also print surrounding lines
            for j in range(max(0,i-1), min(len(lines),i+3)):
                if j != i:
                    print(f'  {j}: {clean(lines[j])}')
            print()
