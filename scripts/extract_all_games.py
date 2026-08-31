import json, re, os, glob

def clean_text(text):
    return text.replace('&amp;', '&').replace('&#039;', "'").replace('&nbsp;', ' ').replace('&quot;', '"').strip()

def extract_text_games(filepath, min_len=5, max_len=70):
    """Extract game-like strings from page reader JSON"""
    try:
        with open(filepath) as f:
            data = json.load(f)
    except:
        return []
    
    html = data.get('data', data).get('html', '')
    text = re.sub(r'<[^>]+>', ' ', html)
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Look for title-case game names (common pattern in game lists)
    # Games typically: Start with capital, contain spaces, may have : or -
    pattern = r'\b([A-Z][A-Za-z0-9]\s?(?:[A-Za-z0-9:\'\'\u2019.&+\-\s]{3,60}))\b'
    found = re.findall(pattern, text)
    
    # Filter
    skip_words = ['The ', 'This ', 'That ', 'These ', 'Those ', 'Which ', 'When ', 'Where ',
                   'What ', 'With ', 'From ', 'They ', 'Their ', 'There ', 'About ', 'After ',
                   'Before ', 'Between ', 'During ', 'Every ', 'Into ', 'Over ', 'Under ',
                   'Some ', 'More ', 'Most ', 'Such ', 'Than ', 'Very ', 'Just ', 'Also ',
                   'Only ', 'Other ', 'Your ', 'You ', 'Each ', 'Once ', 'Both ',
                   'Subscribe', 'Newsletter', 'Gamer', 'GamesRadar', 'Future', 'Click',
                   'Download', 'Available', 'Players', 'Collect', 'Member', 'PC G',
                   'Sign up', 'Keep up', 'Become', 'Contact', 'Want to', 'Unlock',
                   'Games ', 'Store ', 'Free G', 'Join ', 'Get a', 'Check ', 'Follow',
                   'Read more', 'Learn more', 'Image', 'Screenshot', 'Copyright']
    
    games = []
    for g in found:
        g = clean_text(g)
        if min_len < len(g) < max_len and not any(g.startswith(s) or g == s for s in skip_words):
            games.append(g)
    
    return list(dict.fromkeys(games))  # deduplicate preserving order

def search_snippet_games(search_dir):
    """Extract game names from web search result snippets"""
    games = []
    for f in glob.glob(os.path.join(search_dir, 'search-*.json')):
        try:
            with open(f) as fp:
                results = json.load(fp)
            for r in results:
                snippet = r.get('snippet', '')
                name = r.get('name', '')
                # From snippets, extract game-like names
                for text in [snippet, name]:
                    text = clean_text(text)
                    # Look for known game patterns
                    if any(kw in text for kw in ['free game', 'freebie', 'giveaway', 'free on', 'free with']):
                        # Extract quoted or known game titles
                        pass
        except:
            continue
    return games

# Process all page reader files
all_games = set()
for f in glob.glob('/home/z/my-project/page-*.json'):
    print(f'Processing {os.path.basename(f)}...')
    games = extract_text_games(f)
    print(f'  Found {len(games)} candidates')
    for g in games[:5]:
        print(f'    - {g}')
    if len(games) > 5:
        print(f'    ... and {len(games)-5} more')
    all_games.update(games)

print(f'\nTotal unique: {len(all_games)}')
