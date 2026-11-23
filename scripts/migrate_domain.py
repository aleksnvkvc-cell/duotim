import argparse
from pathlib import Path
from urllib.parse import urlsplit

p = argparse.ArgumentParser(description="Migrate public SEO URLs to the verified production domain")
p.add_argument("url", help="New HTTPS site root, e.g. https://example.rs/")
p.add_argument("--apply", action="store_true")
a = p.parse_args()
u = urlsplit(a.url)
if u.scheme != "https" or not u.hostname or u.path not in ("", "/") or u.query or u.fragment or u.username or u.password:
    p.error("Use an HTTPS domain root without a path or credentials")
old = "https://aleksnvkvc-cell.github.io/duotim/"
new = a.url.rstrip("/") + "/"
for f in [*Path(".").glob("*.html"), Path("sitemap.xml"), Path("robots.txt"), Path("scripts/seo_audit.py")]:
    s = f.read_text(encoding="utf-8")
    t = s.replace(old, new)
    if t != s:
        print(f)
        if a.apply: f.write_text(t, encoding="utf-8")
if not a.apply: print("Dry run. Add --apply after domain verification.")
