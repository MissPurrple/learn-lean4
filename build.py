"""Builds the dashboard.

Writes index.html (the whole app in one file) and sw.js (offline support).
Run from anywhere:  python3 build.py
"""
import hashlib
import pathlib
import sys

root = pathlib.Path(__file__).resolve().parent
template = (root / "src" / "app.template.html").read_text(encoding="utf-8")
content = (root / "content.js").read_text(encoding="utf-8")
beginner = (root / "content-beginner.js").read_text(encoding="utf-8")

marker = "/*__CONTENT__*/"
if template.count(marker) != 1:
    sys.exit("Template must contain the marker exactly once: " + marker)
combined = content + "\n" + beginner
if "</script" in combined.lower():
    sys.exit("The content files contain '</script', which would break the page.")

html = template.replace(marker, combined)
(root / "index.html").write_text(html, encoding="utf-8")

version = hashlib.sha256(html.encode("utf-8")).hexdigest()[:10]
sw = (root / "src" / "sw.template.js").read_text(encoding="utf-8").replace("__VERSION__", version)
(root / "sw.js").write_text(sw, encoding="utf-8")
print("Wrote index.html (%d bytes) and sw.js (version %s)" % (len(html.encode("utf-8")), version))
