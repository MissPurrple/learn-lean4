// Runs every worked example in the course on real Lean and compares the output
// with what the course shows. Needs `lean` on the PATH.
//   node tests/check-lean-examples.js
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
let src = fs.readFileSync(path.join(root, "content.js"), "utf8");
const extra = path.join(root, "content-beginner.js");
if (fs.existsSync(extra)) src += "\n" + fs.readFileSync(extra, "utf8");
const UNITS = new Function(src + "\n;return UNITS;")();

// Definitions that earlier units introduce and later units' code relies on.
const ACCOUNT = `structure Account where
  owner    : String
  lamports : Nat
deriving Repr

`;
const TOTAL = `def total : List Account → Nat
  | []        => 0
  | a :: rest => a.lamports + total rest

`;
const TRANSFER = `def transfer (src dst : Account) (amount : Nat) : Except String (Account × Account) :=
  if amount ≤ src.lamports then
    .ok ({ src with lamports := src.lamports - amount },
         { dst with lamports := dst.lamports + amount })
  else
    .error "insufficient funds"

`;
const PRELUDE = { u5: ACCOUNT, u6: ACCOUNT, u8: ACCOUNT + TOTAL + TRANSFER };
const SKIP = { u9: "reading-only code (redeclares Nat and List, which Lean rejects on purpose)" };

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "leancheck-"));
let failed = 0;
const norm = s => s.split("\n").map(l => l.replace(/\s+$/, "")).join("\n").trim();
for (const u of UNITS) {
  if (SKIP[u.id]) { console.log("SKIP", u.id, "-", SKIP[u.id]); continue; }
  const file = path.join(tmp, u.id + ".lean");
  fs.writeFileSync(file, (PRELUDE[u.id] || "") + u.worked.code + "\n");
  const r = spawnSync("lean", [file], { encoding: "utf8", timeout: 240000 });
  const got = norm(((r.stdout || "") + (r.stderr || "")).split(file).join("FILE"));
  const want = norm(u.worked.output);
  if (got === want) console.log("OK  ", u.id, "worked example output matches (" + want.split("\n").length + " lines)");
  else { failed++; console.log("FAIL", u.id, "\n--- expected\n" + want + "\n--- real Lean\n" + got); }
}
console.log(failed ? failed + " unit(s) FAILED" : "All checked worked examples match real Lean.");
process.exit(failed ? 1 : 0);
