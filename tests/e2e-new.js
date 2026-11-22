// Checks for the progress page, glossary, backup files, content rendering and offline support.
//   NODE_PATH=$(npm root -g) node tests/e2e-new.js
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const root = path.resolve(__dirname, '..');
const file = 'file://' + path.join(root, 'index.html');
const results = [];
const check = (name, cond, extra) => results.push([cond ? 'PASS' : 'FAIL', name, extra || '']);

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
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('dialog', d => d.accept());

  // ---------- static files
  const man = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
  check('manifest: name, standalone, 2 icons', man.name && man.display === 'standalone' && man.icons.length === 2);
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  check('sw.js: version stamped', /lean-dash-[0-9a-f]{10}/.test(sw) && !sw.includes('__VERSION__'));
  const png = f => { const b = fs.readFileSync(path.join(root, f)); return b.readUInt32BE(16) + 'x' + b.readUInt32BE(20); };
  check('icons are 192x192 and 512x512', png('icon-192.png') === '192x192' && png('icon-512.png') === '512x512');

  // ---------- rich saved state
  await page.goto(file);
  await page.evaluate(() => {
    const now = Date.now(), D = 86400000;
    S = blank();
    S.units.u0 = { best: 100, mastered: true, attempts: 1, practice: false, history: [{ t: now - 3 * D, right: 5, total: 5 }] };
    S.units.u1 = { best: 80, mastered: true, attempts: 2, practice: false, history: [{ t: now - 2 * D, right: 2, total: 5 }, { t: now - D, right: 4, total: 5 }] };
    const L = (q, ok, daysAgo) => { const u = QMAP[q].u.id; S.log.push({ t: now - daysAgo * D, u, q, kind: 'quiz', ok, conf: 'sure', ms: 4000 }); };
    ['u1q1', 'u1q2', 'u1q3', 'u1q4', 'u1q5'].forEach((q, i) => L(q, i > 1, 2));   // first attempt: 2 wrong... (q1,q2 wrong)
    ['u1q1', 'u1q2', 'u1q3', 'u1q4', 'u1q5'].forEach((q, i) => L(q, i !== 0, 1));  // second: q1 wrong again
    S.secs[dayKey(now)] = 1200;
    S.cards.u1q1 = { box: 1, due: now + D };
    save();
  });
  await page.goto(file + '#/progress'); await page.reload();
  const prog = await page.locator('main').innerText();
  check('progress: units mastered stat', /2 of 10\s*units mastered/i.test(prog.replace(/\n/g, ' ')), prog.slice(0, 80).replace(/\n/g, ' '));
  check('progress: answers stat = 10', /10\s*answers so far/i.test(prog.replace(/\n/g, ' ')));
  const row = await page.locator('table').first().locator('tr', { hasText: 'Unit 1' }).first().innerText();
  check('progress: unit 1 row shows both attempts with scores', /2\/5 \(40%\)/.test(row) && /4\/5 \(80%\)/.test(row) && /80%/.test(row), row.replace(/\s+/g, ' '));
  check('progress: needs-work lists the question missed last time (u1q1 only)', /Questions that need work \(1\)/.test(prog), (prog.match(/Questions that need work \(\d+\)/) || [])[0]);
  check('progress: needs-work card shows correct answer and explanation', /Correct answer/.test(prog) && /truncated|stops at 0|Both numbers are Nat/i.test(prog));
  check('progress: every-question table marks ✓ and ✗', (await page.locator('.m-ok').count()) > 0 && (await page.locator('.m-no').count()) > 0);
  check('progress: concept table present with bars', (await page.locator('h2', { hasText: 'Concepts' }).count()) === 1 && (await page.locator('.tbl .bar').count()) >= 3);
  await page.screenshot({ path: path.join(process.argv[2] || os.tmpdir(), 'progress.png'), fullPage: true });

  // empty state
  const ctx2 = await browser.newContext(); const p2 = await ctx2.newPage();
  await p2.goto(file + '#/progress');
  check('progress: friendly empty state', (await p2.locator('main').innerText()).includes('Nothing to show yet'));
  await ctx2.close();

  // default route once there is data
  await page.goto(file); await page.reload();
  check('returning user lands on the course map', (await page.locator('h1').innerText()).includes('Lean 4 for blockchain'));

  // ---------- glossary
  await page.goto(file + '#/glossary'); await page.reload();
  const nTerms = await page.locator('dl.terms dt').count();
  check('glossary has 70+ terms', nTerms >= 70, String(nTerms));
  await page.locator('input[type=search]').fill('lamport');
  const filt = await page.locator('dl.terms').innerText();
  check('glossary search finds Lamport', /Lamport/i.test(filt) && (await page.locator('dl.terms dt').count()) < nTerms);
  await page.locator('input[type=search]').fill('zzzzqq');
  check('glossary: no-match message', (await page.locator('dl.terms').innerText()).includes('No match'));

  // ---------- backup file: download, wipe, load
  await page.goto(file + '#/data'); await page.reload();
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Save backup file' }).click()]);
  const bpath = path.join(os.tmpdir(), 'bk-' + Date.now() + '.json'); await dl.saveAs(bpath);
  check('backup file name', /^lean-dash-backup-\d{4}-\d{2}-\d{2}\.json$/.test(dl.suggestedFilename()), dl.suggestedFilename());
  const bj = JSON.parse(fs.readFileSync(bpath, 'utf8'));
  check('backup file holds progress (log, units, history)', bj.v === 1 && bj.log.length === 10 && bj.units.u1.history.length === 2 && bj.lastBackup > 0);
  await page.evaluate(() => { S = blank(); save(); });
  await page.reload();
  check('state wiped before restore', (await page.evaluate(() => S.log.length)) === 0);
  await page.locator('input[type=file]').setInputFiles(bpath);
  await page.waitForFunction(() => S.log.length === 10, null, { timeout: 5000 }).catch(() => {});
  check('loading the backup file restores everything', (await page.evaluate(() => S.log.length === 10 && S.units.u1.history.length === 2 && S.units.u0.mastered)));
  check('restore message shown', (await page.locator('.msg').first().innerText()).startsWith('✓ Imported'));
  // hostile history is sanitized
  const clean = await page.evaluate(() => { const s = sanitize({ v: 1, units: { u1: { best: 50, history: [{ t: 1, right: 9, total: 3 }, { t: 'x' }, { t: 5, right: 2, total: 4 }, null] } } }); return s.units.u1.history; });
  check('hostile history entries dropped', clean.length === 1 && clean[0].right === 2, JSON.stringify(clean));
  const bumped = await page.evaluate(() => { S.lastBackup = 0; for (let i = 0; i < 3; i++) S.log.push({ t: Date.now(), u: 'u1', q: 'u1q1', kind: 'quiz', ok: true, conf: null, ms: 1 }); save(); return true; });
  await page.goto(file + '#/map'); await page.reload();
  check('backup reminder shown when no backup for 7 days', (await page.locator('main').innerText()).includes('not saved a backup file'));

  // ---------- every unit, every step renders cleanly
  await page.evaluate(() => { UNITS.forEach(u => { const us = unitState(u.id); us.mastered = true; }); save(); });
  const bad = [];
  const unitIds = await page.evaluate(() => UNITS.map(u => u.id));
  for (const id of unitIds) {
    await page.goto(file + '#/unit/' + id); await page.reload();
    const labels = ['1 Goals', '2 Explain', '3 Worked', '4 Solidity', '5 Fill', '6 Mastery', '7 Practice'];
    for (const lb of labels) {
      await page.getByRole('button', { name: new RegExp('^' + lb) }).click();
      if (lb.startsWith('3')) await page.getByRole('button', { name: 'Reveal output and notes' }).click();
      const t = await page.locator('main').innerText();
      for (const tok of ['undefined', '[object', '&quot;', '&lt;', '&amp;', '\\"', 'null']) if (t.includes(tok)) bad.push(id + ' ' + lb + ' contains ' + tok);
      if (lb.startsWith('1') && (await page.locator('dl.terms dt').count()) < 5) bad.push(id + ' has fewer than 5 terms');
      if (lb.startsWith('2') && (await page.locator('.summary').count()) !== 1) bad.push(id + ' has no summary');
    }
  }
  check('all 10 units x 7 steps render with no leaked markup or "undefined"', bad.length === 0, bad.join(' | '));

  // ---------- offline support over http
  const srv = await serve();
  const port = srv.address().port, base = 'http://127.0.0.1:' + port + '/';
  const octx = await browser.newContext(); const op = await octx.newPage();
  op.on('pageerror', e => errors.push('offline pageerror: ' + e.message));
  await op.goto(base);
  await op.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await op.waitForFunction(() => caches.keys().then(k => k.some(x => x.startsWith('lean-dash-'))), null, { timeout: 8000 }).catch(() => {});
  const keys = await op.evaluate(() => caches.keys());
  check('service worker installed and cache created', keys.some(k => k.startsWith('lean-dash-')), keys.join());
  const cached = await op.evaluate(async () => { const c = await caches.open((await caches.keys())[0]); return (await c.keys()).map(r => new URL(r.url).pathname); });
  check('app files cached for offline use', ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'].every(f => cached.includes(f)), cached.join());
  const cdp = await octx.newCDPSession(op);
  const inst = await cdp.send('Page.getInstallabilityErrors').catch(e => ({ installabilityErrors: [{ errorId: 'cdp-failed ' + e.message }] }));
  check('browser reports the app as installable (no installability errors)', inst.installabilityErrors.length === 0, JSON.stringify(inst.installabilityErrors));
  await op.evaluate(() => { S.notes = 'saved before going offline'; save(); });
  await octx.setOffline(true);
  await op.reload();
  check('OFFLINE: page reloads and works with no network', (await op.locator('h1').innerText()).length > 0 && (await op.evaluate(() => typeof UNITS !== 'undefined' && UNITS.length === 10)));
  check('OFFLINE: saved progress is still there', (await op.evaluate(() => S.notes)) === 'saved before going offline');
  await op.goto(base + '#/unit/u0'); await op.reload();
  check('OFFLINE: a unit opens', (await op.locator('h1').innerText()).startsWith('Unit 0'));
  await octx.setOffline(false);
  srv.close();

  check('no console/page errors', errors.length === 0, errors.join(' || '));
  await browser.close();
  const fails = results.filter(r => r[0] === 'FAIL');
  for (const r of results) console.log(r.join(' | '));
  console.log('\n' + (results.length - fails.length) + '/' + results.length + ' checks passed');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); for (const r of results) console.log(r.join(' | ')); process.exit(2); });
