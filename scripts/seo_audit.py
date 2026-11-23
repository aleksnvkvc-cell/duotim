from pathlib import Path
from html.parser import HTMLParser
import json
import xml.etree.ElementTree as ET
from urllib.parse import urlsplit, unquote

BASE = 'https://aleksnvkvc-cell.github.io/duotim/'
class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta = {}
        self.canonical = []
        self.h1 = 0
        self.title = ''
        self.in_title = False
        self.in_json = False
        self.data = ''
        self.links = []
        self.images = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'meta':
            self.meta[a.get('name', a.get('property', ''))] = a.get('content', '')
        if tag == 'link' and a.get('rel') == 'canonical':
            self.canonical.append(a.get('href'))
        if tag == 'h1': self.h1 += 1
        if tag == 'title': self.in_title = True
        if tag == 'script' and a.get('type') == 'application/ld+json':
            self.in_json = True
            self.data = ''
        if tag == 'a' and a.get('href'): self.links.append(a['href'])
        if tag == 'img': self.images.append(a)
    def handle_data(self, data):
        if self.in_title: self.title += data
        if self.in_json: self.data += data
    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False
        if tag == 'script' and self.in_json:
            json.loads(self.data)
            self.in_json = False

urls = {x.text for x in ET.parse('sitemap.xml').findall('.//{*}loc')}
titles, descriptions, expected = set(), set(), set()
errors = []
for f in sorted(Path('.').glob('*.html')):
    p = Page()
    p.feed(f.read_text(encoding='utf-8'))
    if 'noindex' in p.meta.get('robots',''): continue
    url = BASE + ('' if f.name == 'index.html' else f.name)
    expected.add(url)
    def check(ok, msg):
        if not ok: errors.append(f'{f}: {msg}')
    check(p.canonical == [url], 'canonical mismatch')
    check(p.h1 == 1, 'expected one H1')
    check(bool(p.title.strip()) and p.title not in titles, 'missing or duplicate title')
    d = p.meta.get('description','')
    check(bool(d) and d not in descriptions, 'missing or duplicate description')
    check(p.meta.get('og:title') == p.title, 'Open Graph title mismatch')
    check(p.meta.get('twitter:title') == p.title, 'Twitter title mismatch')
    check(p.meta.get('og:url') == url, 'Open Graph URL mismatch')
    titles.add(p.title)
    descriptions.add(d)
    for a in p.images:
        check('alt' in a, 'image missing alt attribute')
    for href in p.links:
        u = urlsplit(href)
        if not u.scheme and not u.netloc and u.path and not u.path.startswith('/'):
            check(Path(unquote(u.path)).exists(), 'broken local link: '+href)
if urls != expected: errors.append('Sitemap does not match indexable pages')
if errors: raise SystemExit('\n'.join(errors))
print(f'SEO checks passed for {len(expected)} pages')
