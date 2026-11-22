// Question generators.
// Each family builds a fresh question with new random numbers every time, and works the
// answer out in code. There is no stored answer to memorise, and the student has to type
// the answer instead of picking from a list.
//
// tests/check-generated.js runs every family on real Lean and compares the output with
// the answer computed here, so a generator cannot silently disagree with Lean.

const GENS = [

// ---------- Unit 0 (no Lean code) ----------
{ id: "g:u0:lamports", unit: "u0", tag: "units", make(r) {
  const n = r.int(2, 9);
  return { q: "How many lamports are in " + n + " SOL? Type the number with digits only.", code: null, answer: String(n * 1000000000),
    hint: "digits only, for example 5000000000",
    why: "1 SOL is 1,000,000,000 lamports, so " + n + " SOL is " + n + " followed by nine zeros: " + (n * 1000000000).toLocaleString("en-GB") + "." };
} },
{ id: "g:u0:wei", unit: "u0", tag: "units", make(r) {
  const n = r.int(2, 9), a = (BigInt(n) * 10n ** 18n).toString();
  return { q: "How many wei are in " + n + " ether? Type the number with digits only.", code: null, answer: a,
    hint: "digits only: your number followed by eighteen zeros",
    why: "1 ether is 10^18 wei, a 1 followed by 18 zeros. So " + n + " ether is " + n + " followed by 18 zeros." };
} },

// ---------- Unit 1 ----------
{ id: "g:u1:sub", unit: "u1", tag: "nat-subtraction", lean: true, make(r) {
  const small = r.chance(0.5); let a = r.int(0, 25), b = r.int(0, 25);
  if (small && a >= b) { const t = a; a = b; b = t; if (a === b) b = a + r.int(1, 9); }
  const ans = Math.max(a - b, 0);
  return { q: "What does Lean print for this line?", code: "#eval " + a + " - " + b, answer: String(ans), hint: "a number",
    why: a >= b ? a + " is at least " + b + ", so this is ordinary subtraction: " + ans + "."
                : a + " is smaller than " + b + ". Both are Nat and a Nat cannot go below zero, so Lean stops at 0." };
} },
{ id: "g:u1:div", unit: "u1", tag: "nat-division", lean: true, make(r) {
  const a = r.int(10, 99), b = r.int(2, 9), q = Math.floor(a / b), rem = a % b;
  return { q: "What does Lean print for this line?", code: "#eval " + a + " / " + b, answer: String(q), hint: "a number",
    why: "Division on Nat drops the remainder. " + b + " fits into " + a + " " + q + " whole times, with " + rem + " left over." };
} },
{ id: "g:u1:mod", unit: "u1", tag: "nat-remainder", lean: true, make(r) {
  const a = r.int(10, 99), b = r.int(2, 9), q = Math.floor(a / b), rem = a % b;
  return { q: "What does Lean print for this line?", code: "#eval " + a + " % " + b, answer: String(rem), hint: "a number",
    why: "% gives the remainder. " + b + " fits into " + a + " " + q + " times (" + q * b + "), and " + a + " - " + q * b + " = " + rem + "." };
} },
{ id: "g:u1:int", unit: "u1", tag: "type-ascription", lean: true, make(r) {
  const a = r.int(0, 20), b = r.int(0, 20);
  return { q: "What does Lean print for this line?", code: "#eval (" + a + " : Int) - " + b, answer: String(a - b), hint: "a whole number, which may be negative",
    why: "The (" + a + " : Int) part tells Lean to treat " + a + " as an Int, and Ints can be negative. So this is ordinary subtraction: " + (a - b) + "." };
} },
{ id: "g:u1:pow", unit: "u1", tag: "powers", lean: true, make(r) {
  const b = r.int(2, 5), n = r.int(2, 5), v = Math.pow(b, n);
  return { q: "What does Lean print for this line? (^ means \"to the power of\".)", code: "#eval " + b + " ^ " + n, answer: String(v), hint: "a number",
    why: b + " ^ " + n + " means " + Array(n).fill(b).join(" × ") + " = " + v + "." };
} },

// ---------- Unit 2 ----------
{ id: "g:u2:call", unit: "u2", tag: "calling", lean: true, make(r) {
  const a = r.int(2, 30), b = r.int(2, 30);
  return { q: "What does the last line print?", code: "def fee (units price : Nat) : Nat := units * price\n\n#eval fee " + a + " " + b, answer: String(a * b), hint: "a number",
    why: "fee " + a + " " + b + " gives units = " + a + " and price = " + b + ", and the rule is units * price = " + a * b + "." };
} },
{ id: "g:u2:nested", unit: "u2", tag: "calling", lean: true, make(r) {
  const a = r.int(2, 40);
  return { q: "What does the last line print?", code: "def double (n : Nat) : Nat := n * 2\n\n#eval double (double " + a + ")", answer: String(a * 4), hint: "a number",
    why: "The inner call double " + a + " is " + a * 2 + ". The outer call doubles that: " + a * 4 + "." };
} },
{ id: "g:u2:ether", unit: "u2", tag: "units", lean: true, make(r) {
  const a = r.int(2, 9), v = (BigInt(a) * 10n ** 18n).toString();
  return { q: "What does the last line print? Type all the digits.", code: "def etherToWei (eth : Nat) : Nat := eth * 10 ^ 18\n\n#eval etherToWei " + a, answer: v, hint: "digits only",
    why: "10 ^ 18 is a 1 followed by 18 zeros, so " + a + " ether is " + a + " followed by 18 zeros." };
} },

// ---------- Unit 3 ----------
{ id: "g:u3:deposit", unit: "u3", tag: "with-update", lean: true, make(r) {
  const a = r.int(100, 900), b = r.int(10, 99);
  return { q: "What does the last line print?", answer: String(a + b), hint: "a number",
    code: "structure Account where\n  owner    : String\n  lamports : Nat\nderiving Repr\n\ndef deposit (acc : Account) (amount : Nat) : Account :=\n  { acc with lamports := acc.lamports + amount }\n\ndef sam : Account := { owner := \"sam\", lamports := " + a + " }\n\n#eval (deposit sam " + b + ").lamports",
    why: "deposit builds a new account with " + b + " more lamports: " + a + " + " + b + " = " + (a + b) + "." };
} },
{ id: "g:u3:same", unit: "u3", tag: "immutability", lean: true, make(r) {
  const a = r.int(100, 900), b = r.int(10, 99);
  return { q: "There are two #eval lines. What does the SECOND one print?", answer: String(a), hint: "a number",
    code: "structure Account where\n  owner    : String\n  lamports : Nat\nderiving Repr\n\ndef deposit (acc : Account) (amount : Nat) : Account :=\n  { acc with lamports := acc.lamports + amount }\n\ndef sam : Account := { owner := \"sam\", lamports := " + a + " }\n\n#eval (deposit sam " + b + ").lamports\n#eval sam.lamports",
    why: "deposit made a new account and never touched sam. Lean values do not change, so sam still has " + a + "." };
} },

// ---------- Unit 4 ----------
{ id: "g:u4:safe", unit: "u4", tag: "option", lean: true, make(r) {
  const small = r.chance(0.5); let a = r.int(0, 40), b = r.int(0, 40);
  if (small && a >= b) { const t = a; a = b; b = t; if (a === b) b = a + r.int(1, 9); }
  const ok = b <= a;
  return { q: "What does the last line print?", answer: ok ? "some " + (a - b) : "none", hint: "for example some 7, or none",
    code: "def safeWithdraw (balance amount : Nat) : Option Nat :=\n  if amount ≤ balance then some (balance - amount) else none\n\n#eval safeWithdraw " + a + " " + b,
    why: ok ? b + " ≤ " + a + " is true, so the answer is some (" + a + " - " + b + ") = some " + (a - b) + "."
            : b + " ≤ " + a + " is false, so the else branch runs and the answer is none." };
} },
{ id: "g:u4:silent", unit: "u4", tag: "nat-subtraction", lean: true, make(r) {
  const a = r.int(5, 40), b = r.int(5, 60), ans = Math.max(a - b, 0);
  return { q: "What does the last line print?", answer: String(ans), hint: "a number",
    code: "def withdraw (balance amount : Nat) : Nat := balance - amount\n\n#eval withdraw " + a + " " + b,
    why: b > a ? "There is no check, and " + b + " is more than " + a + ", so Nat subtraction stops at 0 and nothing complains."
               : a + " - " + b + " = " + ans + ". This one is fine, but if the amount were bigger than the balance it would silently give 0." };
} },

// ---------- Unit 5 ----------
{ id: "g:u5:total", unit: "u5", tag: "recursion", lean: true, make(r) {
  const xs = r.list(4, 1, 50), s = xs.reduce((p, c) => p + c, 0);
  return { q: "What does the last line print?", answer: String(s), hint: "a number",
    code: "def total : List Nat → Nat\n  | []        => 0\n  | a :: rest => a + total rest\n\n#eval total [" + xs.join(", ") + "]",
    why: "total adds the first item to the total of the rest, ending with 0 for the empty list: " + xs.join(" + ") + " + 0 = " + s + "." };
} },
{ id: "g:u5:filter", unit: "u5", tag: "list-ops", lean: true, make(r) {
  const xs = r.list(6, 1, 60), t = r.int(15, 45), c = xs.filter(x => x >= t).length;
  return { q: "What does this line print?", answer: String(c), hint: "a number",
    code: "#eval ([" + xs.join(", ") + "].filter (fun x => x ≥ " + t + ")).length",
    why: "filter keeps the items that are at least " + t + ": " + (xs.filter(x => x >= t).join(", ") || "none of them") + ". length counts them: " + c + "." };
} },
{ id: "g:u5:map", unit: "u5", tag: "list-ops", lean: true, make(r) {
  const xs = r.list(3, 1, 30), k = r.int(2, 9), out = xs.map(x => x + k);
  return { q: "What does this line print?", answer: "[" + out.join(", ") + "]", hint: "a list, for example [1, 2, 3]",
    code: "#eval [" + xs.join(", ") + "].map (fun x => x + " + k + ")",
    why: "map applies the function to every item, adding " + k + " each time, and gives a new list." };
} },

// ---------- Unit 6 ----------
{ id: "g:u6:withdraw", unit: "u6", tag: "except", lean: true, make(r) {
  const small = r.chance(0.5); let a = r.int(0, 40), b = r.int(0, 40);
  if (small && a >= b) { const t = a; a = b; b = t; if (a === b) b = a + r.int(1, 9); }
  const ok = b <= a;
  return { q: "What does the last line print?", answer: ok ? "Except.ok " + (a - b) : 'Except.error "too much"', hint: 'for example Except.ok 7, or Except.error "some text"',
    code: 'def withdraw (balance amount : Nat) : Except String Nat :=\n  if amount ≤ balance then .ok (balance - amount) else .error "too much"\n\n#eval withdraw ' + a + " " + b,
    why: ok ? b + " ≤ " + a + " is true, so we get a success: Except.ok " + (a - b) + "." : b + " ≤ " + a + " is false, so we get the error, with its reason in quotes." };
} },
{ id: "g:u6:chain", unit: "u6", tag: "do-notation", lean: true, make(r) {
  const a = r.int(10, 50), x = r.int(1, 40), y = r.int(1, 40);
  let ans, why;
  if (x > a) { ans = 'Except.error "too much"'; why = "The first withdraw already fails (" + x + " is more than " + a + "), so ← stops there and returns that error. The second step never runs."; }
  else if (y > a - x) { ans = 'Except.error "too much"'; why = "The first step works and leaves " + (a - x) + ". The second asks for " + y + ", which is too much, so the whole do block returns the error."; }
  else { ans = "Except.ok " + (a - x - y); why = "Both steps work: " + a + " - " + x + " = " + (a - x) + ", then " + (a - x) + " - " + y + " = " + (a - x - y) + "."; }
  return { q: "What does the last line print?", answer: ans, hint: 'for example Except.ok 7, or Except.error "some text"',
    code: 'def withdraw (balance amount : Nat) : Except String Nat :=\n  if amount ≤ balance then .ok (balance - amount) else .error "too much"\n\ndef twice (balance : Nat) : Except String Nat := do\n  let b1 ← withdraw balance ' + x + "\n  let b2 ← withdraw b1 " + y + "\n  return b2\n\n#eval twice " + a,
    why };
} },

// ---------- Unit 7 ----------
{ id: "g:u7:decide", unit: "u7", tag: "decide", lean: true, make(r) {
  const a = r.int(1, 20), b = r.int(1, 20), c = r.int(5, 40), ok = a + b <= c;
  return { q: "decide works out whether a statement is true and gives a Bool. What does this line print?", answer: ok ? "true" : "false", hint: "true or false",
    code: "#eval decide (" + a + " + " + b + " ≤ " + c + ")",
    why: a + " + " + b + " = " + (a + b) + ", and " + (a + b) + " ≤ " + c + " is " + (ok ? "true" : "false") + "." };
} },
{ id: "g:u7:decide2", unit: "u7", tag: "decide", lean: true, make(r) {
  const a = r.int(1, 15), b = r.int(1, 15), c = r.int(1, 15), ok = a < b && b < c;
  return { q: "∧ means \"and\". What does this line print?", answer: ok ? "true" : "false", hint: "true or false",
    code: "#eval decide (" + a + " < " + b + " ∧ " + b + " < " + c + ")",
    why: "Both parts must be true. " + a + " < " + b + " is " + (a < b) + " and " + b + " < " + c + " is " + (b < c) + ", so the whole thing is " + (ok ? "true" : "false") + "." };
} }
];

const GENMAP = {};
GENS.forEach(g => { GENMAP[g.id] = g; });

// Builds one fresh question from a family. `r` supplies randomness (see tests for a seeded one).
function genBuild(fam, r) {
  const o = fam.make({ int: r.int, chance: r.chance, list: (n, lo, hi) => Array.from({ length: n }, () => r.int(lo, hi)) });
  return Object.assign({ id: fam.id, tag: fam.tag, type: "typed" }, o);
}
