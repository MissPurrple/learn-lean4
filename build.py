"""Builds the app.

python3 build.py          writes index.html (the whole app in one file) and sw.js (offline support).
                          Test hooks are removed from this build.
python3 build.py --test   writes the same app WITH the test hooks into tests/build/, for the browser tests.
"""
import datetime
import hashlib
import pathlib
import re
import shutil
import sys

root = pathlib.Path(__file__).resolve().parent
template = (root / "src" / "app.template.html").read_text(encoding="utf-8")
content = (root / "content.js").read_text(encoding="utf-8")
beginner = (root / "content-beginner.js").read_text(encoding="utf-8")
generated = (root / "content-generated.js").read_text(encoding="utf-8")

marker = "/*__CONTENT__*/"
if template.count(marker) != 1:
    sys.exit("Template must contain the marker exactly once: " + marker)
combined = content + "\n" + beginner + "\n" + generated
if "</script" in combined.lower():
    sys.exit("The content files contain '</script', which would break the page.")

built = datetime.date.today().isoformat()
html = template.replace(marker, combined).replace("/*__BUILT__*/", built)
test_build = "--test" in sys.argv
if not test_build:
    html = re.sub(r"/\*TEST\*/.*?/\*END-TEST\*/", "", html, flags=re.S)   # drop the test-only hooks
    if "__LEAN_TEST" in html or "__expected" in html:
        sys.exit("A test hook is still present in the production build.")
out_dir = root / "tests" / "build" if test_build else root
out_dir.mkdir(parents=True, exist_ok=True)
(out_dir / "index.html").write_text(html, encoding="utf-8")

version = hashlib.sha256(html.encode("utf-8")).hexdigest()[:10]
sw = (root / "src" / "sw.template.js").read_text(encoding="utf-8").replace("__VERSION__", version)
(out_dir / "sw.js").write_text(sw, encoding="utf-8")
if test_build:
    for name in ("manifest.webmanifest", "icon-192.png", "icon-512.png"):
        shutil.copy(root / name, out_dir / name)
print("Wrote %s/index.html (%d bytes, dated %s) and sw.js (version %s)" % (out_dir.relative_to(root) if test_build else ".", len(html.encode("utf-8")), built, version))
