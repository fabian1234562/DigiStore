import json, re

def extract_games(filepath):
    with open(filepath) as f:
        data = json.load(f)
    html = data.get('data', data).get('html', '')
    text = re.sub(r'<[^>]+>', ' ', html)
    text = re.sub(r'\s+', ' ', text)
    
    # Find 2025 section games
    # Look for patterns like "January 2025" followed by game names
    months = r'(?:January|February|March|April|May|June|July|August|September|October|November|December)'
    pattern = rf'({months}\s+\d{{4}})(.*?)(?={months}\s+\d{{4}}|$)'
    
    sections = re.findall(pattern, text, re.DOTALL)
    games = []
    for month, content in sections:
        # Find game names - they tend to be title case
        game_pattern = r'([A-Z][A-Za-z0-9:\'\u2019.&\-\s]{4,80}?(?:\s*[:(]\s*[^)]{0,30})?)'
        found = re.findall(game_pattern, content)
        for g in found:
            g = g.strip()
            if len(g) > 4 and len(g) < 70:
                if not any(skip in g for skip in ['PC Gamer', 'Subscribe', 'newsletter', 'Every ', 'The biggest', 'Keep up', 'By signing', 'Contact me', 'Want to', 'Your newsletter', 'Unlock instant', 'Become a Member']):
                    games.append(f'{month}: {g}')
    
    # Deduplicate
    seen = set()
    unique = []
    for g in games:
        name = g.split(': ', 1)[1] if ': ' in g else g
        if name not in seen:
            seen.add(name)
            unique.append(g)
    
    return unique

games = extract_games('/home/z/my-project/page-gamewatcher-2025.json')
print(f'Found {len(games)} entries from GameWatcher 2025:')
for g in games[:80]:
    print(g)
