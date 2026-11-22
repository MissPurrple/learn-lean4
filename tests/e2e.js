const { chromium } = require('playwright');
const path = process.argv[2];
const shots = process.argv[3];
const results = [];
const check = (name, cond, extra) => { results.push([cond ? 'PASS' : 'FAIL', name, extra || '']); };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 1 });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('dialog', d => d.accept());
  await page.goto('file://' + path);
  check('new user lands on Start here', (await page.locator('h1').innerText()) === 'Start here');
  const startTxt = await page.locator('main').innerText();
  check('start page: has install, backup, playground and Natural Number Game guidance', /Install/.test(startTxt) && /Save backup file/.test(startTxt) && /Lean Playground/.test(startTxt) && /Natural Number Game/.test(startTxt));
  await page.goto('file://' + path + '#/map'); await page.reload();

  // ---- course map
  check('10 unit blocks (Unit 0 to 9)', (await page.locator('.chain li').count()) === 10);
  check('unit 0 open, others locked', (await page.locator('a.block.open').count()) === 1 && (await page.locator('.block.locked').count()) === 9);
  check('plan line mentions Unit 0', (await page.locator('main').innerText()).includes('Unit 0: Start here: the basic ideas'));
  check('first-timer banner shown', (await page.locator('main').innerText()).includes('New here?'));
  await page.screenshot({ path: shots + '/map.png' });

  // locked unit via URL falls back to map
  await page.goto('file://' + path + '#/unit/u3'); await page.reload();
  check('locked unit URL -> address bar corrected', (await page.evaluate(() => location.hash)) === '#/map');
  check('locked unit URL -> map', (await page.locator('h1').innerText()).includes('Lean 4 for blockchain'));

  // helper: answer the current question
  async function answerCurrent(unitId, correct, conf) {
    const info = await page.evaluate((unitId) => {
      const lg = document.querySelector('fieldset legend').textContent.replace(/\s+/g, ' ').trim();
      const pre = document.querySelector('section pre');
      const code = pre ? pre.textContent : null;
      const u = UNITS.find(x => x.id === unitId);
      const qs = [...u.quiz, u.challenge];
      const m = qs.find(q => plain(q.q) === lg && (q.code || null) === code);
      return m ? { a: m.a, n: m.options.length, id: m.id } : null;
    }, unitId);
    if (!info) throw new Error('question not matched in ' + unitId);
    const pick = correct ? info.a : (info.a + 1) % info.n;
    await page.locator('input[name=opt]').nth(pick).check();
    const submit = page.getByRole('button', { name: 'Check my answer' });
    check('submit disabled until confidence chosen (' + info.id + ')', await submit.isDisabled());
    await page.locator('input[name=conf][value=' + conf + ']').check();
    await submit.click();
    return info;
  }

  // ---- unit 0 walk-through (no code) + step help on every step
  await page.locator('a.block.open').click();
  await page.waitForFunction(() => document.querySelector('h1').textContent.startsWith('Unit 0'), null, { timeout: 5000 }).catch(() => {});
  check('unit 0 heading', (await page.locator('h1').innerText()).startsWith('Unit 0'));
  check('goals step: Words to know shown', (await page.locator('dl.terms dt').count()) >= 8);
  for (const [label, key] of [['1 Goals','Goals'],['2 Explain','Explain'],['3 Worked','Worked'],['4 Solidity','Bridge'],['5 Fill','Fill'],['6 Mastery','Quiz'],['7 Practice','Practice']]) {
    await page.getByRole('button', { name: new RegExp('^' + label) }).click();
    const tip = await page.locator('.tipbox').first().innerText();
    check('step help present: ' + key, /^What to do:/.test(tip), tip.slice(0, 40));
  }
  await page.getByRole('button', { name: /^7 Practice/ }).click();
  check('practice links to the Lean Playground', (await page.locator('a[href="https://live.lean-lang.org/"]').count()) >= 1);
  await page.getByRole('button', { name: /^2 Explain/ }).click();
  check('explain step has an In short summary', (await page.locator('.summary').count()) === 1);
  await page.getByRole('button', { name: /^6 Mastery quiz/ }).click();
  await page.getByRole('button', { name: 'Start quiz' }).click();
  for (let k = 0; k < 5; k++) {
    await answerCurrent('u0', true, 'sure');
    await page.getByRole('button', { name: k === 4 ? 'See result' : 'Next question' }).click();
  }
  check('unit 0 mastered', (await page.locator('h2', { hasText: 'Unit mastered' }).count()) === 1);
  check('result shows a mark for every question', (await page.locator('ul.marks li').count()) === 5 && (await page.locator('ul.marks .m-ok').count()) === 5);
  await page.goto('file://' + path + '#/map');

  // ---- unit 1 walk-through
  await page.locator('a.block.open').click();
  await page.waitForFunction(() => document.querySelector('h1').textContent.startsWith('Unit 1'), null, { timeout: 5000 }).catch(() => {});
  check('unit 1 heading', (await page.locator('h1').innerText()).startsWith('Unit 1'));
  await page.getByRole('button', { name: /Next: Explain/ }).click();
  await page.getByRole('button', { name: /Next: Worked example/ }).click();
  check('output hidden before reveal', (await page.locator('pre.out').count()) === 0);
  await page.locator('#guess').fill('5, 10^18, Hello Lean, 0, 3, 1');
  await page.getByRole('button', { name: 'Reveal output and notes' }).click();
  const outTxt = await page.locator('pre.out').innerText();
  check('real output shown', outTxt.includes('1000000000000000000') && outTxt.includes('-2'));
  check('prediction retained after reveal', (await page.locator('main').innerText()).includes('5, 10^18, Hello Lean'));
  await page.getByRole('button', { name: /Next: Solidity/ }).click();
  check('bridge rendered', (await page.locator('main').innerText()).includes('checked by default'));
  await page.getByRole('button', { name: /Next: Fill the blank/ }).click();
  // faded: wrong then right
  await page.locator('input[name=fd]').nth(0).check(); await page.getByRole('button', { name: 'Check' }).click();
  check('faded wrong shows try-again', (await page.locator('.fb.no').count()) === 1);
  await page.locator('input[name=fd]').nth(1).check(); await page.getByRole('button', { name: 'Check' }).click();
  check('faded right shows why', (await page.locator('.fb.ok').innerText()).includes('#check shows the type'));
  const fadedState = await page.evaluate(() => S.faded.u1);
  check('faded first-try recorded as wrong', fadedState.first === false && fadedState.tries === 2, JSON.stringify(fadedState));

  // quiz: fail first? Do u1 pass with all correct
  await page.getByRole('button', { name: 'Mastery quiz', exact: false }).first().click().catch(() => {});
  await page.getByRole('button', { name: /^6 Mastery quiz/ }).click();
  await page.getByRole('button', { name: 'Start quiz' }).click();
  for (let k = 0; k < 5; k++) {
    await answerCurrent('u1', true, k === 0 ? 'unsure' : 'sure');
    check('feedback shown q' + (k + 1), (await page.locator('.fb.ok').count()) === 1);
    await page.getByRole('button', { name: k === 4 ? 'See result' : 'Next question' }).click();
  }
  check('unit 1 mastered result', (await page.locator('h2', { hasText: 'Unit mastered' }).count()) === 1);
  check('unit 2 unlocked msg', (await page.locator('main').innerText()).includes('Unit 2 is now unlocked'));
  const st1 = await page.evaluate(() => S.units.u1);
  check('state: u1 mastered best 100', st1.mastered && st1.best === 100 && st1.attempts === 1, JSON.stringify(st1));
  check('cards created for 10 questions (unit 0 + unit 1)', (await page.evaluate(() => Object.keys(S.cards).length)) === 10);
  await page.screenshot({ path: shots + '/result.png' });
  await page.getByRole('button', { name: 'Do the practice task' }).click();
  await page.locator('summary', { hasText: 'Show expected result' }).click();
  check('practice expected shown', (await page.locator('pre.out').innerText()).includes('1000000000'));
  await page.locator('#pdone').check();

  // 10 perfect answers would switch the dashboard to Challenge mode (a 6th question). Simulate a few earlier misses so this section runs in Steady mode.
  await page.evaluate(() => { for (let i = 0; i < 5; i++) S.log.push({ t: Date.now() - 1000, u: 'u1', q: 'u1q1', kind: 'quiz', ok: false, conf: 'unsure', ms: 2000 }); save(); });
  // ---- unit 2: fail path, correctives, retake shuffled
  await page.goto('file://' + path + '#/map');
  check('map: u0 and u1 mastered, u2 open', (await page.locator('a.block.mastered').count()) === 2 && (await page.locator('a.block.open').count()) === 1);
  await page.locator('a.block.open').click();
  await page.getByRole('button', { name: /^6 Mastery quiz/ }).click();
  await page.getByRole('button', { name: 'Start quiz' }).click();
  const order1 = [];
  for (let k = 0; k < 5; k++) {
    const info = await answerCurrent('u2', k >= 3, 'sure'); order1.push(info.id);
    await page.getByRole('button', { name: k === 4 ? 'See result' : 'Next question' }).click();
  }
  check('first attempt is original order', order1.join() === 'u2q1,u2q2,u2q3,u2q4,u2q5', order1.join());
  check('fail: not there yet + correctives', (await page.locator('h2', { hasText: 'Not there yet' }).count()) === 1 && (await page.locator('h3', { hasText: 'Correctives' }).count()) === 1);
  check('3 missed correctives shown', (await page.locator('.card .card').count()) === 3, String(await page.locator('.card .card').count()));
  check('u2 not mastered, u3 still locked', await page.evaluate(() => !isMastered(UMAP.u2) && unitStatus(UNITS.indexOf(UMAP.u3)) === 'locked'));
  const sw = await page.evaluate(() => S.log.filter(e => e.kind === 'quiz' && e.conf === 'sure' && !e.ok).length);
  check('confident-wrong logged (3 from u2)', sw === 3, String(sw));
  await page.getByRole('button', { name: 'Back to the worked example' }).click();
  check('corrective link -> worked example revealed', (await page.locator('pre.out').count()) === 1);
  await page.getByRole('button', { name: /^6 Mastery quiz/ }).click();
  check('retake notice says shuffled', (await page.locator('main').innerText()).includes('shuffled'));
  const orders = new Set();
  for (let trial = 0; trial < 6 && orders.size < 2; trial++) {
    await page.getByRole('button', { name: /Start retake/ }).click();
    const o = [];
    for (let k = 0; k < 5; k++) { const info = await answerCurrent('u2', true, 'sure'); o.push(info.id); await page.getByRole('button', { name: k === 4 ? 'See result' : 'Next question' }).click(); }
    orders.add(o.join());
    if (trial === 0) check('retake all correct -> mastered', (await page.locator('h2', { hasText: 'Unit mastered' }).count()) === 1);
    await page.getByRole('button', { name: /^6 Mastery quiz/ }).click();
  }
  check('retake orders differ across attempts (shuffled)', orders.size >= 2 || [...orders][0] !== 'u2q1,u2q2,u2q3,u2q4,u2q5', [...orders].join(' | '));

  // ---- review: nothing due, then make cards due
  await page.goto('file://' + path + '#/review');
  check('review: nothing due initially', (await page.locator('main').innerText()).includes('Nothing due'));
  await page.evaluate(() => { Object.values(S.cards).forEach(c => { c.due = Date.now() - 1000; }); save(); });
  await page.reload();
  check('nav pill shows due count', (await page.locator('nav .pill').count()) === 1);
  await page.getByRole('button', { name: 'Start review' }).click();
  const total = await page.evaluate(() => dueIds().length);
  const seenUnits = new Set();
  let reviewed = 0;
  while (await page.locator('fieldset legend').count()) {
    const lg = await page.locator('fieldset legend').first().textContent();
    const tag = await page.locator('.tagline').first().innerText(); seenUnits.add(tag.split('·')[2]);
    const info = await page.evaluate(() => {
      const lg = document.querySelector('fieldset legend').textContent.replace(/\s+/g, ' ').trim();
      const pre = document.querySelector('section pre'); const code = pre ? pre.textContent : null;
      const m = Object.values(QMAP).map(x => x.q).find(q => plain(q.q) === lg && (q.code || null) === code);
      return { a: m.a, n: m.options.length, id: m.id };
    });
    const right = reviewed % 4 !== 3;   // every 4th wrong
    await page.locator('input[name=opt]').nth(right ? info.a : (info.a + 1) % info.n).check();
    await page.locator('input[name=conf][value=unsure]').check();
    await page.getByRole('button', { name: 'Check my answer' }).click();
    const fbtxt = await page.locator('.fb').innerText();
    check('review feedback box info q' + (reviewed + 1), right ? /box 1 to box 2/.test(fbtxt) : /back to box 1/.test(fbtxt), fbtxt.slice(-80));
    reviewed++;
    await page.getByRole('button', { name: /Next question|See result/ }).click();
    if (reviewed > 30) break;
  }
  check('review covered all due cards', reviewed === total, reviewed + ' vs ' + total);
  check('review interleaves 2+ units', seenUnits.size >= 2, [...seenUnits].join(';'));
  check('review finished screen', (await page.locator('h2', { hasText: 'Review finished' }).count()) === 1);
  const boxes = await page.evaluate(() => boxCounts());
  check('leitner boxes updated (some in box2, some in box1)', boxes[1] > 0 && boxes[0] > 0, JSON.stringify(boxes));
  const dueDays = await page.evaluate(() => { const c = Object.values(S.cards).find(c => c.box === 2); return Math.round((c.due - startOfDay(Date.now())) / 86400000); });
  check('box 2 card due in 3 days', dueDays === 3, String(dueDays));

  // ---- pace logic via direct state
  const pace = await page.evaluate(() => {
    const mk = (r, n) => { S.log = []; for (let i = 0; i < n; i++) S.log.push({ t: Date.now(), u: 'u1', q: 'u1q1', kind: 'quiz', ok: i < r, conf: 'sure', ms: 1000 }); return paceInfo().mode; };
    const o = {};
    o['3/4'] = mk(3, 4);        // 4 answers 75% -> steady (below min for support anyway)
    o['0/4'] = mk(0, 4);        // too few for support
    o['2/5=40%'] = mk(2, 5);    // support
    o['3/5=60%'] = mk(3, 5);    // exactly 60 -> steady
    o['9/10'] = mk(9, 10);      // challenge
    o['17/20=85'] = mk(17, 20); // exactly 85 -> challenge
    o['16/20=80'] = mk(16, 20); // steady
    o['9/9'] = mk(9, 9);        // <10 answers -> steady
    // window uses only last 20: 30 wrong then 20 right -> challenge
    S.log = []; for (let i = 0; i < 30; i++) S.log.push({ t: 1, u: 'u1', q: 'u1q1', kind: 'quiz', ok: false, conf: null, ms: 1 });
    for (let i = 0; i < 20; i++) S.log.push({ t: 2, u: 'u1', q: 'u1q1', kind: 'quiz', ok: true, conf: null, ms: 1 });
    o['window'] = paceInfo().mode;
    // faded answers excluded
    S.log = []; for (let i = 0; i < 12; i++) S.log.push({ t: 1, u: 'u1', q: 'u1-faded', kind: 'faded', ok: false, conf: null, ms: null, first: true });
    o['faded-excluded'] = paceInfo().mode + '/' + paceInfo().n;
    return o;
  });
  const expect = { '3/4': 'steady', '0/4': 'steady', '2/5=40%': 'support', '3/5=60%': 'steady', '9/10': 'challenge', '17/20=85': 'challenge', '16/20=80': 'steady', '9/9': 'steady', window: 'challenge', 'faded-excluded': 'steady/0' };
  for (const k of Object.keys(expect)) check('pace ' + k + ' -> ' + expect[k], pace[k] === expect[k], pace[k]);

  // ---- support + challenge modes in the UI
  await page.evaluate(() => { S.log = []; for (let i = 0; i < 6; i++) S.log.push({ t: Date.now(), u: 'u1', q: 'u1q1', kind: 'quiz', ok: i < 1, conf: 'sure', ms: 1000 }); save(); });
  await page.goto('file://' + path + '#/unit/u1'); await page.reload();
  await page.getByRole('button', { name: /^2 Explain/ }).click();
  check('support: explanation one idea at a time', (await page.locator('main').innerText()).includes('idea 1 of'));
  await page.getByRole('button', { name: 'Show everything' }).click();
  check('support: show everything works', (await page.locator('.explain p').count()) >= 3);
  await page.getByRole('button', { name: /^6 Mastery quiz/ }).click();
  await page.getByRole('button', { name: /Start/ }).click();
  check('support: key ideas hint visible on question', (await page.locator('.banner.support').innerText()).includes('Key ideas'));
  await page.screenshot({ path: shots + '/support-quiz.png' });
  await page.evaluate(() => { S.log = []; for (let i = 0; i < 12; i++) S.log.push({ t: Date.now(), u: 'u1', q: 'u1q1', kind: 'quiz', ok: true, conf: 'sure', ms: 1000 }); save(); });
  await page.goto('file://' + path + '#/map'); await page.reload();
  await page.locator('a.block.mastered').first().click();
  await page.getByRole('button', { name: /^6 Mastery quiz/ }).click();
  check('challenge: quiz announces 6 questions', (await page.locator('main').innerText()).includes('6 questions'));
  await page.getByRole('button', { name: /Start/ }).click();
  const n = await page.locator('.tagline').first().innerText();
  check('challenge: "of 6"', n.includes('of 6'), n);

  // ---- report
  await page.evaluate(() => { S.log = []; const now = Date.now();
    const L = (u, q, ok, conf, ms, kind, daysAgo) => S.log.push({ t: now - (daysAgo || 0) * 86400000, u, q, kind: kind || 'quiz', ok, conf, ms });
    L('u1', 'u1q1', false, 'sure', 5000); L('u1', 'u1q1', false, 'unsure', 70000, 'review'); L('u1', 'u1q2', true, 'guess', 3000);
    L('u4', 'u4q1', false, 'sure', 90000, 'quiz', 2); L('u4', 'u4q1', true, 'sure', 2000, 'quiz', 1);
    L('u1', 'u1q3', true, 'sure', 1000, 'quiz', 20);  // outside the window
    S.log.push({ t: now, u: 'u1', q: 'u1-faded', kind: 'faded', ok: true, conf: null, ms: null, first: true });
    S.secs[dayKey(now)] = 1500; S.secs[dayKey(now - 86400000)] = 600; S.secs[dayKey(now - 30 * 86400000)] = 9999; save(); });
  await page.goto('file://' + path + '#/report'); await page.reload();
  await page.locator('#notes').fill('Unit 4 felt hard. I only have 3 hours a week.');
  const rep = await page.locator('#reportText').inputValue();
  check('report header', rep.startsWith('=== LEAN-DASH WEEKLY REPORT (v1) ==='));
  check('report: answers 5 (old one excluded), correct 2', /Total answers: 5, correct: 2, accuracy: 40%/.test(rep), (rep.match(/Total answers.*/) || [])[0]);
  check('report: minutes 35 (old day excluded)', /Active minutes: 35/.test(rep), (rep.match(/Active minutes.*/) || [])[0]);
  check('report: study days 3 (today, yesterday, 2 days ago)', /Study days: 3 of 7/.test(rep), (rep.match(/Study days.*/) || [])[0]);
  check('report: confident but wrong 2', /Confident but wrong \(marked Sure, answered wrong\): 2/.test(rep));
  check('report: slow questions 2', /took over 60 seconds to answer\): 2/.test(rep));
  check('report: faded 1 of 1', /Right on the first try: 1 of 1/.test(rep));
  check('report: weak tag nat-subtraction', /- nat-subtraction: 1\/4 \(25%\)/.test(rep), rep.split('Weakest')[1].slice(0, 120));
  check('report: notes included', rep.includes('I only have 3 hours a week.'));
  check('report: ends with request', /REQUEST\nPlease read this report and write me a self-improvement prompt/.test(rep));
  check('report: no HTML tags leaked', !/<code>|&lt;/.test(rep));
  await page.getByRole('button', { name: 'Copy report' }).click();
  await page.waitForTimeout(500);
  const msg = await page.locator('.msg').last().innerText();
  check('copy gives a message', msg.length > 5, msg);
  const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => null));
  if (clip !== null) check('clipboard has the report', clip.includes('=== LEAN-DASH WEEKLY REPORT (v1) ==='));
  await page.screenshot({ path: shots + '/report.png', fullPage: false });
  console.log('---- REPORT SAMPLE ----\n' + rep + '\n-----------------------');

  // ---- export / import / persistence
  await page.goto('file://' + path + '#/data');
  await page.getByRole('button', { name: /Export/ }).click();
  const exported = await page.locator('textarea').inputValue();
  check('export is valid JSON v1', JSON.parse(exported).v === 1);
  await page.reload();
  check('state persisted across reload (notes)', (await page.evaluate(() => S.notes)).includes('3 hours'));
  await page.evaluate(() => { S = blank(); save(); });
  await page.reload();
  check('state wiped', (await page.evaluate(() => S.log.length)) === 0);
  await page.goto('file://' + path + '#/data');
  await page.locator('textarea').fill(exported);
  await page.getByRole('button', { name: /Import/ }).click();
  check('import restores', (await page.evaluate(() => S.log.length)) > 0 && (await page.locator('.msg').last().innerText()).startsWith('✓ Imported'), await page.locator('.msg').last().innerText());
  await page.locator('textarea').fill('{not json');
  await page.getByRole('button', { name: /Import/ }).click();
  check('bad JSON rejected politely', (await page.locator('.msg').last().innerText()).startsWith('Import failed'));
  await page.locator('textarea').fill('{"v":1,"log":[{"q":"zzz","u":"u1","kind":"quiz","ok":true,"t":1},{"evil":1}],"units":{"u1":{"best":9999,"mastered":"yes"}},"notes":"<img src=x onerror=alert(1)>"}');
  await page.getByRole('button', { name: /Import/ }).click();
  const hostile = await page.evaluate(() => ({ log: S.log.length, best: S.units.u1 && S.units.u1.best, m: S.units.u1 && S.units.u1.mastered }));
  check('hostile import sanitized', hostile.log === 0 && hostile.best === 100 && hostile.m === false, JSON.stringify(hostile));
  await page.locator('textarea').fill('{"v":2}');
  await page.getByRole('button', { name: /Import/ }).click();
  check('wrong version rejected', (await page.locator('.msg').last().innerText()).includes('version 1'));
  // cap
  const capped = await page.evaluate(() => { for (let i = 0; i < 1700; i++) S.log.push({ t: Date.now(), u: 'u1', q: 'u1q1', kind: 'quiz', ok: true, conf: null, ms: 1 }); save(); return JSON.parse(localStorage.getItem(KEY)).log.length; });
  check('log capped at 1500', capped === 1500, String(capped));

  // ---- active-time tracking
  await page.evaluate(() => { S = blank(); save(); });
  await page.goto('file://' + path + '#/map'); await page.reload();
  await page.mouse.move(10, 10); await page.mouse.click(20, 20);
  await page.waitForTimeout(11500);
  const s1 = await page.evaluate(() => S.secs[dayKey(Date.now())] || 0);
  check('active time counted while interacting (~10s)', s1 >= 9 && s1 <= 16, String(s1));
  await page.evaluate(() => { lastAct = Date.now() - 200000; });   // simulate idle > 2 min
  await page.waitForTimeout(11000);
  const s2 = await page.evaluate(() => S.secs[dayKey(Date.now())] || 0);
  check('idle time NOT counted', s2 - s1 < 1, String(s2 - s1));
  // hidden tab
  await page.evaluate(() => { lastAct = Date.now(); Object.defineProperty(document, 'visibilityState', { get: () => 'hidden', configurable: true }); });
  await page.waitForTimeout(11000);
  const s3 = await page.evaluate(() => S.secs[dayKey(Date.now())] || 0);
  check('hidden tab NOT counted', s3 - s2 < 1, String(s3 - s2));

  // ---- method + sources
  await page.goto('file://' + path + '#/method');
  const mt = await page.locator('main').innerText();
  check('method page content', mt.includes('Dunlosky') && mt.includes('moderate') && mt.includes('108 studies') && mt.includes('NOT research-backed'));
  check('method links = 6', (await page.locator('main li a').count()) === 6);
  await page.goto('file://' + path + '#/sources');
  check('sources: 19+6 links + setup', (await page.locator('main li a').count()) >= 25 && (await page.locator('main').innerText()).includes('leanprover.lean4'));
  const badLinks = await page.evaluate(() => [...document.querySelectorAll('main a[href]')].filter(a => a.target === '_blank' && !/noopener/.test(a.rel) ).length);
  check('external links have rel=noopener', badLinks === 0);

  // ---- mobile
  const mobile = await browser.newContext({ viewport: { width: 375, height: 800 }, deviceScaleFactor: 2 });
  const mp = await mobile.newPage(); mp.on('pageerror', e => errors.push('mobile pageerror: ' + e.message));
  await mp.goto('file://' + path + '#/map');
  await mp.reload();
  const overflow = await mp.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  check('mobile: no horizontal page scroll on map', !overflow);
  await mp.screenshot({ path: shots + '/mobile-map.png' });
  await mp.goto('file://' + path + '#/unit/u0'); await mp.reload();
  await mp.getByRole('button', { name: /^3 Worked example/ }).click();
  check('mobile: no horizontal page scroll on worked example', !(await mp.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)));
  await mp.screenshot({ path: shots + '/mobile-unit.png' });

  check('no console/page errors', errors.length === 0, errors.join(' || '));
  await browser.close();
  const fails = results.filter(r => r[0] === 'FAIL');
  for (const r of results) console.log(r.join(' | '));
  console.log('\n' + (results.length - fails.length) + '/' + results.length + ' checks passed');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); for (const r of results) console.log(r.join(' | ')); process.exit(2); });
