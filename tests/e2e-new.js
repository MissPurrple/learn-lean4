// Progress page, glossary, backup and signature checks, every unit rendering, and offline mode.
//   NODE_PATH=$(npm root -g) node tests/e2e-new.js /tmp
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const path = require('path');
const root = path.resolve(__dirname, '..');
const file = 'file://' + path.join(root, 'index.html');
const results = [];
const check = (name, cond, extra) => results.push([cond ? 'PASS' : 'FAIL', name, extra === undefined ? '' : String(extra)]);

function serve() {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html';
    const f = path.join(root, p);
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('no'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => srv.listen(0, '127.0.0.1', () => r(srv)));
}

(async () => {
  const errors = [];
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  await ctx.addInitScript(() => { window.__LEAN_TEST = true; window.__RUSH_MS = 0; });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('dialog', d => d.accept());
  const out = process.argv[2] || os.tmpdir();

  // ---------- static files
  const man = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
  check('manifest: Learn Lean 4, standalone, 2 icons', man.name === 'Learn Lean 4' && man.short_name === 'Learn Lean 4' && man.display === 'standalone' && man.icons.length === 2);
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  check('sw.js: version stamped, new cache name', /learn-lean-4-[0-9a-f]{10}/.test(sw) && !sw.includes('__VERSION__'));
  const png = f => { const b = fs.readFileSync(path.join(root, f)); return b.readUInt32BE(16) + 'x' + b.readUInt32BE(20); };
  check('icons are 192x192 and 512x512', png('icon-192.png') === '192x192' && png('icon-512.png') === '512x512');

  // ---------- signature code matches standard SHA-256
  await page.goto(file);
  const shaOk = await page.evaluate(() => ['', 'abc', 'x'.repeat(1000), '{"v":1,"log":[]}'].map(t => [signText(t), t]));
  check('in-page SHA-256 matches Node crypto', shaOk.every(([got, t]) => got === crypto.createHash('sha256').update('learn-lean-4|v2|' + t).digest('hex')));

  // ---------- rich saved state
  await page.evaluate(() => {
    const now = Date.now(), D = 86400000, prep = { read: true, predict: true, faded: true, explain: true };
    S = blank();
    S.units.u0 = { best: 100, mastered: true, attempts: 1, practice: false, prep, explain: null, history: [{ t: now - 3 * D, right: 7, total: 7, score: 100 }] };
    S.units.u1 = { best: 83, mastered: true, attempts: 2, practice: false, prep, explain: null, history: [{ t: now - 2 * D, right: 3, total: 7, score: 43 }, { t: now - D, right: 6, total: 7, score: 86 }] };
    const L = (q, ok, daysAgo, conf, fix) => { const u = QMAP[q].u.id; const e = { t: now - daysAgo * D, u, q, kind: 'quiz', ok, conf: conf || 'sure', ms: 4000 }; if (fix) e.fix = fix; S.log.push(e); };
    ['u1q1', 'u1q2', 'u1q3', 'u1q4', 'u1q5'].forEach((q, i) => L(q, i > 1, 2));
    ['u1q1', 'u1q2', 'u1q3', 'u1q4', 'u1q5'].forEach((q, i) => L(q, i !== 0, 1, i === 0 ? 'unsure' : 'sure', i === 0 ? 'I forgot Nat stops at zero' : undefined));
    S.secs[dayKey(now)] = 1200;
    S.cards.u1q1 = { box: 1, due: now + D };
    S.lastBackup = now;
    save();
  });
  await page.goto(file + '#/progress'); await page.reload();
  const prog = await page.locator('main').innerText();
  const flat = prog.replace(/\n/g, ' ');
  check('progress: units mastered stat', /2 of 10\s*units mastered/i.test(flat), flat.slice(0, 80));
  check('progress: answers stat = 10', /10\s*answers so far/i.test(flat));
  const row = await page.locator('table').first().locator('tr', { hasText: 'Unit 1' }).first().innerText();
  check('progress: unit 1 shows both attempts with right counts and scores', /3\/7 right, score 43%/.test(row) && /6\/7 right, score 86%/.test(row) && /86%/.test(row), row.replace(/\s+/g, ' '));
  check('progress: needs-work lists u1q1 only, with the learner\'s own note', /Questions that need work \(1\)/.test(prog) && prog.includes('Your note: I forgot Nat stops at zero'));
  check('progress: needs-work card shows the answer and explanation', /Answer:/.test(prog) && /Both numbers are Nat/i.test(prog));
  check('progress: every-question table marks ✓ and ✗', (await page.locator('.m-ok').count()) > 0 && (await page.locator('.m-no').count()) > 0);
  check('progress: confidence table (Sure / Unsure / Guessing)', /You said[\s\S]*Sure[\s\S]*Unsure[\s\S]*Guessing/i.test(prog));
  check('progress: concept table with bars', (await page.locator('h2', { hasText: 'Concepts' }).count()) === 1 && (await page.locator('.tbl .bar').count()) >= 3);
  await page.screenshot({ path: path.join(out, 'progress.png'), fullPage: true });
  const ctx2 = await browser.newContext(); const p2 = await ctx2.newPage();
  await p2.goto(file + '#/progress');
  check('progress: friendly empty state', (await p2.locator('main').innerText()).includes('Nothing to show yet'));
  await ctx2.close();
  await page.goto(file); await page.reload();
  check('returning user lands on the course map', (await page.locator('h1').innerText()).includes('Lean 4'));

  // ---------- glossary
  await page.goto(file + '#/glossary'); await page.reload();
  const nTerms = await page.locator('dl.terms dt').count();
  check('glossary has 70+ terms', nTerms >= 70, nTerms);
  await page.locator('input[type=search]').fill('lamport');
  check('glossary search finds Lamport', /Lamport/i.test(await page.locator('dl.terms').innerText()) && (await page.locator('dl.terms dt').count()) < nTerms);
  await page.locator('input[type=search]').fill('zzzzqq');
  check('glossary: no-match message', (await page.locator('dl.terms').innerText()).includes('No match'));

  // ---------- backup file: download, sign, wipe, load, tamper
  await page.goto(file + '#/data'); await page.reload();
  const dataTxt = await page.locator('main').innerText();
  check('backup page suggests a second copy in the vault', /vault/i.test(dataTxt) && /second copy/i.test(dataTxt));
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Save backup file' }).click()]);
  const bpath = path.join(os.tmpdir(), 'bk-' + Date.now() + '.json'); await dl.saveAs(bpath);
  check('backup file name', /^learn-lean-4-backup-\d{4}-\d{2}-\d{2}\.json$/.test(dl.suggestedFilename()), dl.suggestedFilename());
  const bj = JSON.parse(fs.readFileSync(bpath, 'utf8'));
  check('backup file is signed and holds progress', bj.v === 1 && typeof bj.sig === 'string' && bj.sig.length === 64 && bj.log.length === 10 && bj.units.u1.history.length === 2 && bj.lastBackup > 0);
  const { sig, ...rest } = bj;
  check('signature really is sha256(salt + contents)', sig === crypto.createHash('sha256').update('learn-lean-4|v2|' + JSON.stringify(rest)).digest('hex'));
  // tampered copies
  const edit = (fn, name) => { const o = JSON.parse(fs.readFileSync(bpath, 'utf8')); fn(o); const f = path.join(os.tmpdir(), name + Date.now() + '.json'); fs.writeFileSync(f, JSON.stringify(o)); return f; };
  const fakeMastery = edit(o => { o.units.u5 = { best: 100, mastered: true, attempts: 1, practice: false, history: [{ t: 1, right: 7, total: 7, score: 100 }], prep: { read: true, predict: true, faded: true, explain: true }, explain: null }; }, 'fake-mastery');
  const noSig = edit(o => { delete o.sig; }, 'no-sig');
  await page.evaluate(() => { S = blank(); save(); }); await page.reload();
  await page.locator('input[type=file]').setInputFiles(fakeMastery);
  await page.waitForFunction(() => /Import failed|Imported/.test(document.querySelector('.msg').textContent), null, { timeout: 5000 }).catch(() => {});
  check('a backup edited by hand is refused', /changed after it was saved/.test(await page.locator('.msg').first().innerText()) && (await page.evaluate(() => S.log.length)) === 0);
  await page.locator('input[type=file]').setInputFiles(noSig);
  await page.waitForFunction(() => /no signature/.test(document.querySelector('.msg').textContent), null, { timeout: 5000 }).catch(() => {});
  check('a backup with its signature removed is refused', /no signature/.test(await page.locator('.msg').first().innerText()) && (await page.evaluate(() => S.log.length)) === 0);
  await page.locator('input[type=file]').setInputFiles(bpath);
  await page.waitForFunction(() => S.log.length === 10, null, { timeout: 5000 }).catch(() => {});
  check('the genuine backup restores everything', await page.evaluate(() => S.log.length === 10 && S.units.u1.history.length === 2 && S.units.u0.mastered));
  check('restore message shown', (await page.locator('.msg').first().innerText()).startsWith('Imported'));

  // ---------- saved progress edited outside the app
  // The app saves its own copy as the page unloads, so an edit made while it is open undoes itself.
  // To test detection, edit the stored data from a plain page while the app is not running.
  const blankPage = path.join(os.tmpdir(), 'blank-' + Date.now() + '.html'); fs.writeFileSync(blankPage, '<!doctype html><title>x</title>');
  const lsEdit = async (fn) => {
    await page.goto('about:blank');
    const ed = await ctx.newPage(); await ed.goto('file://' + blankPage);
    await ed.evaluate(src => { const o = JSON.parse(localStorage.getItem('leandash.v1')); (new Function('o', src))(o); localStorage.setItem('leandash.v1', JSON.stringify(o)); }, fn);
    await ed.close();
  };
  await lsEdit('o.units.u2 = { best: 100, mastered: true, attempts: 1, practice: false, history: [{ t: 1, right: 7, total: 7, score: 100 }], prep: { read: true, predict: true, faded: true, explain: true }, explain: null };');
  await page.goto(file + '#/map');
  check('editing localStorage by hand is noticed (banner on the map)', (await page.locator('main').innerText()).includes('changed outside the app'));
  await page.goto(file + '#/report');
  check('the weekly report says the data is unverified', (await page.locator('#reportText').inputValue()).includes('DATA CHECK'));
  await page.locator('#notes').fill('x');                      // any save re-signs; the banner must remain until a restore
  await page.goto(file + '#/data'); await page.reload();
  await page.locator('input[type=file]').setInputFiles(bpath);
  await page.waitForFunction(() => integrity === 'ok', null, { timeout: 5000 }).catch(() => {});
  await page.goto(file + '#/map'); await page.reload();
  check('restoring a genuine backup clears the banner', !(await page.locator('main').innerText()).includes('changed outside the app'));
  // legacy data (saved before signing existed) loads quietly and is signed on the next save
  await lsEdit('delete o.sig;');
  await page.goto(file + '#/map');
  check('unsigned legacy progress loads without a warning', !(await page.locator('main').innerText()).includes('changed outside the app'));
  await page.evaluate(() => { save(); });
  check('and is signed from then on', await page.evaluate(() => typeof JSON.parse(localStorage.getItem(KEY)).sig === 'string'));
  // mastery has to be backed by a passing attempt
  const unbacked = await page.evaluate(() => sanitize({ v: 1, units: { u1: { best: 40, mastered: true, attempts: 1, history: [{ t: 1, right: 3, total: 7, score: 40 }] }, u2: { best: 90, mastered: true, attempts: 1, history: [{ t: 1, right: 6, total: 7, score: 90 }] } } }).units);
  check('mastered=true without a passing attempt is not accepted', unbacked.u1.mastered === false && unbacked.u2.mastered === true);
  const clean = await page.evaluate(() => sanitize({ v: 1, units: { u1: { best: 50, history: [{ t: 1, right: 9, total: 3 }, { t: 'x' }, { t: 5, right: 2, total: 4 }, null] } } }).units.u1.history);
  check('hostile history entries dropped', clean.length === 1 && clean[0].right === 2 && clean[0].score === 50, JSON.stringify(clean));
  const hostile = await page.evaluate(() => { const s = sanitize({ v: 1, log: [{ q: 'zzz', u: 'u1', kind: 'quiz', ok: true, t: 1 }, { evil: 1 }, { q: 'g:u1:sub', u: 'u1', kind: 'quiz', ok: true, t: 1, conf: null, ms: 5, fix: 'y'.repeat(900) }], cards: { 'zzz': { box: 2, due: 1 }, 'g:u1:sub': { box: 9, due: 1 } }, notes: '<img src=x onerror=alert(1)>' }); return { log: s.log.length, fix: s.log[0] && s.log[0].fix.length, cards: Object.keys(s.cards).length }; });
  check('hostile import: unknown questions dropped, generated ids kept, long notes capped', hostile.log === 1 && hostile.fix === 300 && hostile.cards === 0, JSON.stringify(hostile));
  const mal = await ctx.newPage(); mal.on('pageerror', e => errors.push('malformed-storage pageerror: ' + e.message));
  await mal.goto(file);
  await mal.evaluate(() => localStorage.setItem('leandash.v1', '{"v":1,"log":"nope","units":[1,2],"cards":7,"secs":null'));
  await mal.reload();
  check('malformed saved data does not crash the page', (await mal.locator('h1').innerText()).length > 0);
  await mal.evaluate(() => localStorage.setItem('leandash.v1', JSON.stringify({ v: 1, log: 'nope', units: [1, 2], cards: 7, secs: null, notes: 5 })));
  await mal.reload();
  check('wrong-shaped saved data does not crash the page', (await mal.locator('h1').innerText()).length > 0);
  await mal.close();
  const bumped = await page.evaluate(() => { S.lastBackup = 0; for (let i = 0; i < 3; i++) S.log.push({ t: Date.now(), u: 'u1', q: 'u1q1', kind: 'quiz', ok: true, conf: null, ms: 1 }); save(); return true; });
  await page.goto(file + '#/map'); await page.reload();
  check('backup reminder shown after 7 days without one, and mentions the vault', /haven't saved a backup/.test(await page.locator('main').innerText()) && /vault/.test(await page.locator('main').innerText()));

  // ---------- every unit, every step renders cleanly
  await page.evaluate(() => { UNITS.forEach(u => { const us = unitState(u.id); us.mastered = true; us.history = [{ t: 1, right: 7, total: 7, score: 100 }]; }); save(); });
  const bad = [];
  const unitIds = await page.evaluate(() => UNITS.map(u => u.id));
  for (const id of unitIds) {
    await page.goto(file + '#/unit/' + id); await page.reload();
    for (const lb of ['1 Goals', '2 Explain', '3 Worked', '4 Solidity', '5 Fill', '6 Mastery', '7 Practice']) {
      await page.getByRole('button', { name: new RegExp('^' + lb) }).click();
      if (lb.startsWith('3')) { await page.locator('#guess').fill('abc'); await page.getByRole('button', { name: /Reveal/ }).click(); }
      const t = await page.locator('main').innerText();
      for (const tok of ['undefined', '[object', '&quot;', '&lt;', '&amp;', '\\"', 'NaN']) if (t.includes(tok)) bad.push(id + ' ' + lb + ' contains ' + tok);
      if (lb.startsWith('1') && (await page.locator('dl.terms dt').count()) < 5) bad.push(id + ' has fewer than 5 terms');
      if (lb.startsWith('2') && (await page.locator('.note.short').count()) !== 1) bad.push(id + ' has no summary');
      if (lb.startsWith('3') && !t.includes('Explain it back')) bad.push(id + ' has no explain-it-back');
      if (lb.startsWith('3') && ['u5', 'u6', 'u8'].includes(id) && !t.includes('Paste this first')) bad.push(id + ' lacks the paste-first code');
    }
  }
  check('all 10 units x 7 steps render with no leaked markup, "undefined" or "NaN"', bad.length === 0, bad.join(' | '));
  const prel = await page.evaluate(() => ['u5', 'u6', 'u8'].map(id => UMAP[id].prelude.includes('structure Account')));
  check('units 5, 6 and 8 carry the Account code they depend on', prel.every(Boolean));

  // ---------- offline support over http
  const srv = await serve();
  const base = 'http://127.0.0.1:' + srv.address().port + '/';
  const octx = await browser.newContext(); const op = await octx.newPage();
  op.on('pageerror', e => errors.push('offline pageerror: ' + e.message));
  await op.goto(base);
  await op.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await op.waitForFunction(() => caches.keys().then(k => k.some(x => x.startsWith('learn-lean-4-'))), null, { timeout: 8000 }).catch(() => {});
  const keys = await op.evaluate(() => caches.keys());
  check('service worker installed and cache created', keys.some(k => k.startsWith('learn-lean-4-')), keys.join());
  const cached = await op.evaluate(async () => { const c = await caches.open((await caches.keys())[0]); return (await c.keys()).map(r => new URL(r.url).pathname); });
  check('app files cached for offline use', ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'].every(f => cached.includes(f)), cached.join());
  const cdp = await octx.newCDPSession(op);
  const inst = await cdp.send('Page.getInstallabilityErrors').catch(e => ({ installabilityErrors: [{ errorId: 'cdp-failed ' + e.message }] }));
  check('browser reports the app as installable', inst.installabilityErrors.length === 0, JSON.stringify(inst.installabilityErrors));
  await op.evaluate(() => { S.notes = 'saved before going offline'; save(); });
  await octx.setOffline(true);
  await op.reload();
  check('OFFLINE: page reloads and works with no network', (await op.locator('h1').innerText()).length > 0 && (await op.evaluate(() => typeof UNITS !== 'undefined' && UNITS.length === 10)));
  check('OFFLINE: saved progress is still there', (await op.evaluate(() => S.notes)) === 'saved before going offline');
  await op.goto(base + '#/unit/u0'); await op.reload();
  check('OFFLINE: a unit opens', (await op.locator('h1').innerText()).startsWith('Unit 0'));
  await octx.setOffline(false);
  srv.close();

  check('no console or page errors', errors.length === 0, errors.join(' || '));
  await browser.close();
  const fails = results.filter(r => r[0] === 'FAIL');
  for (const r of results) console.log(r.join(' | '));
  console.log('\n' + (results.length - fails.length) + '/' + results.length + ' checks passed');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); for (const r of results) console.log(r.join(' | ')); process.exit(2); });
