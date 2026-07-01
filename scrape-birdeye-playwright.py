import json
import re
import time
from playwright.sync_api import sync_playwright

URL = 'https://reviews.birdeye.com/bath-professional-134021084'

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto(URL, wait_until='domcontentloaded', timeout=45000)
    time.sleep(4)
    for _ in range(6):
        page.mouse.wheel(0, 900)
        time.sleep(0.4)
    body = page.inner_text('body')
    browser.close()

reviews = []

# Pattern: Name \n on Google \n date \n \n review text
pattern = re.compile(
    r'([A-Z][A-Za-z.\'\-\s]{1,50}?)\s*\n\s*on\s+Google\s*\n\s*([^\n]+)\s*\n\s*([^\n]+(?:\n[^\n]+)?)',
    re.MULTILINE,
)

skip_names = {'Write a review', 'Select a rating', 'Google', 'Birdeye', 'View all google reviews'}

for m in pattern.finditer(body):
    author = m.group(1).strip()
    date = m.group(2).strip()
    text = m.group(3).strip()
    if author in skip_names or len(text) < 15:
        continue
    if re.match(r'^\d+$', text):
        continue
    rating = 5
    reviews.append({
        'author': author,
        'rating': rating,
        'text': text,
        'date': date,
        'source': 'Google',
    })

# Featured reviews from summary section
for feat_m in re.finditer(
    r'(Highest|Lowest) rated review\s+on ([^\n]+)\s+(\d)\s+"([^"]+)"',
    body.replace('\u201c', '"').replace('\u201d', '"'),
):
    label, date, rating, text = feat_m.groups()
    # find author after snippet
    author = 'Google User'
    after = body[feat_m.end():feat_m.end() + 120]
    name_m = re.search(r'([A-Z][A-Za-z.\'\-\s]+)\s+on Google', after)
    if name_m:
        author = name_m.group(1).strip()
    reviews.insert(0, {
        'author': author,
        'rating': int(rating),
        'text': text.replace('...', '').strip(),
        'date': date.strip(),
        'source': 'Google',
        'featured': f'{label} rated review',
    })

seen = set()
unique = []
for r in reviews:
    key = (r['author'], r['text'][:50])
    if key not in seen:
        seen.add(key)
        unique.append(r)

output = {
    'business': 'Bath Professional',
    'rating': 4.9,
    'reviewCount': 444,
    'googleUrl': 'https://share.google/2lFzTu5iHsSYiOprH',
    'mapsUrl': 'https://www.google.com/maps/place/Bath+Professional/@27.8128045,-82.6437443,17z',
    'writeReviewUrl': 'https://search.google.com/local/writereview?placeid=ChIJDeiWOVfhwogROfADvLmt82k',
    'placeId': 'ChIJDeiWOVfhwogROfADvLmt82k',
    'reviews': unique[:12],
}

with open('data/google-reviews.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(json.dumps(unique[:12], indent=2))
print(f'Saved {len(unique[:12])} reviews')