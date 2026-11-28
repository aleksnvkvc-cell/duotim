from pathlib import Path
import re
import xml.etree.ElementTree as ET
from PIL import Image
from urllib.parse import unquote

for page in Path('.').glob('*.html'):
    original=page.read_text(encoding='utf-8')
    def fix(match):
        tag=match.group()
        src=re.search(r'\bsrc="([^"]+)"',tag)
        if not src or re.search(r'\bwidth=',tag) and re.search(r'\bheight=',tag): return tag
        path=page.parent/unquote(src.group(1).split('?')[0])
        if not path.is_file(): return tag
        if path.suffix.lower()=='.svg':
            root=ET.parse(path).getroot()
            vb=root.get('viewBox','').replace(',',' ').split()
            if len(vb)!=4: return tag
            w,h=map(float,vb[2:])
        else:
            with Image.open(path) as im: w,h=im.size
        if not w or not h: return tag
        attrs=''
        if not re.search(r'\bwidth=',tag): attrs+=f' width="{round(w)}"'
        if not re.search(r'\bheight=',tag): attrs+=f' height="{round(h)}"'
        return tag[:-1]+attrs+'>'
    updated=re.sub(r'<img\b[^>]*>',fix,original)
    if updated!=original: page.write_text(updated,encoding='utf-8')
