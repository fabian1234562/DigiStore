import json, re, os

def clean(t):
    return t.replace('&amp;','&').replace('&#039;',"'").replace('&nbsp;',' ').replace('&quot;','"').replace('&#8211;','-').strip()

def get_text(filepath):
    with open(filepath) as f:
        data = json.load(f)
    html = data.get('data', data).get('html', '')
    text = re.sub(r'<[^>]+>', '\n', html)
    text = re.sub(r'\n+', '\n', text)
    return text

# Extract from specific pages
for fname, search_terms in [
    ('page-allkeyshop-prime-jan2025.json', ['game', 'free', 'Prime']),
    ('page-stevivor-prime-mar2025.json', ['Saints Row', 'Mafia', 'Crime Boss']),
    ('page-gameshub-prime-aug2025.json', ['game', 'free', 'Prime']),
    ('page-ggdeals-prime-dec2025.json', ['game', 'free', 'Prime']),
    ('page-twistedvoxel-jan2025.json', ['January', 'free', 'game', 'Epic']),
]:
    filepath = f'/home/z/my-project/{fname}'
    if not os.path.exists(filepath):
        continue
    text = get_text(filepath)
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    print(f'\n=== {fname} ({len(lines)} lines) ===')
    # Print lines containing game-related keywords
    for line in lines:
        if any(kw.lower() in line.lower() for kw in search_terms):
            if len(line) > 5 and len(line) < 200:
                print(f'  {clean(line)}')
