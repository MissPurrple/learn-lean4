"""Builds lean-dash.html: src/app.template.html with content.js inlined.

Run from anywhere:  python3 build.py
"""
import pathlib
import sys

root = pathlib.Path(__file__).resolve().parent
template = (root / "src" / "app.template.html").read_text(encoding="utf-8")
content = (root / "content.js").read_text(encoding="utf-8")

marker = "/*__CONTENT__*/"
if template.count(marker) != 1:
    sys.exit("Template must contain the marker exactly once: " + marker)
if "</script" in content.lower():
    sys.exit("content.js contains '</script', which would break the page.")

out = root / "lean-dash.html"
out.write_text(template.replace(marker, content), encoding="utf-8")
print("Wrote", out, out.stat().st_size, "bytes")
