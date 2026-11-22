// Runs every generated-question family on real Lean (many random seeds) and checks that
// the answer computed in JavaScript is exactly what Lean prints. Needs `lean` on the PATH.
//   node tests/check-generated.js
const fs = require("fs"), os = require("os"), path = require("path");
const { spawnSync } = require("child_process");
const root = path.resolve(__dirname, "..");
const { GENS, genBuild } = new Function(fs.readFileSync(path.join(root, "content-generated.js"), "utf8") + "\n;return { GENS, genBuild };")();

function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function rng(seed) { const f = mulberry32(seed); return { int: (lo, hi) => lo + Math.floor(f() * (hi - lo + 1)), chance: p => f() < p }; }
const norm = s => s.toLowerCase().replace(/[\s,_]/g, "");

const N = 30, tmp = fs.mkdtempSync(path.join(os.tmpdir(), "gencheck-"));
let bad = 0, total = 0;
for (const fam of GENS) {
  const qs = Array.from({ length: N }, (_, i) => genBuild(fam, rng(1000 + i)));
  for (const q of qs) {
    if (!q.q || !q.answer || !q.why || /undefined|NaN|\[object/.test(q.q + q.answer + q.why + (q.code || ""))) { bad++; console.log("FAIL", fam.id, "malformed question", JSON.stringify(q)); }
  }
  if (!fam.lean) { console.log("OK  ", fam.id, "(no Lean code) " + N + " questions well-formed"); total += N; continue; }
  let src = "";
  qs.forEach((q, i) => { src += "namespace S" + i + "\n" + q.code + "\nend S" + i + "\n#eval \"@@" + i + "\"\n"; });
  const f = path.join(tmp, fam.id.replace(/[^a-z0-9]/gi, "_") + ".lean"); fs.writeFileSync(f, src);
  const r = spawnSync("lean", [f], { encoding: "utf8", timeout: 280000 });
  const lines = ((r.stdout || "") + (r.stderr || "")).split("\n");
  let cur = [], idx = 0, mism = 0;
  for (const ln of lines) {
    const m = ln.match(/^"@@(\d+)"$/);
    if (m) {
      const q = qs[idx], got = cur[cur.length - 1];
      total++;
      if (got === undefined || norm(got) !== norm(q.answer)) { mism++; bad++; console.log("FAIL", fam.id, "seed", 1000 + idx, "\n  code:", q.code.split("\n").slice(-2).join(" | "), "\n  JS says:", q.answer, "\n  Lean says:", got); }
      cur = []; idx++;
    } else if (ln.trim()) cur.push(ln);
  }
  if (idx !== N) { bad++; console.log("FAIL", fam.id, "expected", N, "results, parsed", idx, "\n", lines.slice(0, 8).join("\n")); }
  else if (!mism) console.log("OK  ", fam.id, N + " random questions match real Lean");
}
console.log(bad ? bad + " PROBLEM(S)" : "All " + total + " generated questions match real Lean.");
process.exit(bad ? 1 : 0);
