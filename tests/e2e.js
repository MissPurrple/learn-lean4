// Click-through test of the app in a real browser.
//   python3 build.py --test
//   NODE_PATH=$(npm root -g) node tests/e2e.js "$PWD/tests/build/index.html" /tmp
// Uses a test-only hook (window.__LEAN_TEST) so the test can read the expected answer of the
// question on screen. A real learner never sets it.
const { chromium } = require('playwright');
const path = process.argv[2];
const shots = process.argv[3] || '/tmp';
const results = [];
const check = (name, cond, extra) => results.push([cond ? 'PASS' : 'FAIL', name, extra === undefined ? '' : String(extra)]);
const url = (hash) => 'file://' + path + (hash || '');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { window.__LEAN_TEST = true; window.__RUSH_MS = 0; });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('dialog', d => d.accept());

  // ---------- helpers
  const goHash = async (hash) => { await page.goto(url(hash)); await page.reload(); };
  const heading = async (re) => { await page.waitForFunction(r => new RegExp(r).test(document.querySelector('h1').textContent), re, { timeout: 5000 }).catch(() => {}); return page.locator('h1').innerText(); };
  const setPrep = async (id) => { await page.evaluate(id => { const us = unitState(id); us.prep = { read: true, predict: true, faded: true, explain: true }; save(); }, id); };
  const stepBtn = (label) => page.getByRole('button', { name: new RegExp('^' + label) });
  const qCounts = async () => { const t = await page.locator('.tagline').first().innerText(); const m = /Question (\d+) of (\d+)/.exec(t); return m ? { i: +m[1], n: +m[2] } : null; };
  // Answer the question on screen. opts: correct, conf, pick (original option index to choose, MC only), fix
  async function answer(opts) {
    opts = Object.assign({ correct: true, conf: 'sure', fix: 'I mixed up the two ideas there.' }, opts || {});
    const ex = await page.evaluate(() => window.__expected());
    const submit = page.getByRole('button', { name: 'Check my answer' });
    if (ex.type === 'typed') await page.locator('input[name=typed]').fill(opts.correct ? ex.answer : 'zz wrong');
    else {
      let pos = opts.correct ? ex.index : (ex.index + 1) % ex.n;
      if (opts.pick !== undefined) pos = ex.perm.indexOf(opts.pick);
      await page.locator('input[name=opt]').nth(pos).check();
    }
    ex.disabledBeforeConf = await submit.isDisabled();
    await page.locator('input[name=conf][value=' + opts.conf + ']').check();
    await submit.click();
    ex.feedback = await page.locator('.fb').innerText();
    if (!opts.correct) {
      const next = page.getByRole('button', { name: /Next question|See result/ });
      ex.nextDisabledWithoutFix = await next.isDisabled();
      await page.locator('#fixnote').fill('xxxxxxxxxxxxxxxx');
      ex.nextDisabledWithFiller = await next.isDisabled();
      await page.locator('#fixnote').fill(opts.fix);
      ex.nextEnabledWithFix = !(await next.isDisabled());
    }
    await page.getByRole('button', { name: /Next question|See result/ }).click();
    return ex;
  }
  async function runQuiz(planFn) {          // planFn(index, total) -> answer options
    const log = []; const first = await qCounts(); const n = first.n;
    for (let k = 0; k < n; k++) log.push(await answer(planFn(k, n)));
    return log;
  }

  // ============ 1. new user, names, footer ============
  await page.goto(url());
  check('new user lands on Start here', (await page.locator('h1').innerText()) === 'Start here');
  check('page title is Learn Lean 4', (await page.title()) === 'Learn Lean 4');
  const startTxt = await page.locator('main').innerText();
  check('start page covers install, backup, Playground, Natural Number Game, marking rules', /Install/.test(startTxt) && /Save backup file/.test(startTxt) && /Lean Playground/.test(startTxt) && /Natural Number Game/.test(startTxt) && /half/.test(startTxt));
  check('start page tells learner to copy the backup into their vault', /vault/i.test(startTxt));
  const foot = await page.locator('#foot').innerText();
  const builtPretty = await page.evaluate(() => prettyDate(BUILT));
  check('footer shows a last-updated date', /^Learn Lean 4\. Last updated \d{1,2} [A-Z][a-z]+ \d{4}\.$/.test(foot) && foot.includes(builtPretty), foot);
  let oldName = [];
  for (const r of ['start', 'map', 'progress', 'review', 'report', 'glossary', 'method', 'sources', 'data']) {
    await page.goto(url('#/' + r)); await page.reload();
    const t = (await page.locator('body').innerText()) + (await page.title());
    if (/blockchain dash|lean-dash|lean dash/i.test(t)) oldName.push(r);
  }
  check('old app name appears nowhere', oldName.length === 0, oldName.join());
  await goHash('#/map');
  check('10 unit blocks (Unit 0 to 9)', (await page.locator('.chain li').count()) === 10);
  check('unit 0 open, nine locked', (await page.locator('a.block.open').count()) === 1 && (await page.locator('.block.locked').count()) === 9);
  check('first-timer note shown', (await page.locator('main').innerText()).includes('First time here?'));
  await page.screenshot({ path: shots + '/map.png' });
  await page.goto(url('#/unit/u3')); await page.reload();
  check('locked unit URL redirects to the map and fixes the address bar', (await page.evaluate(() => location.hash)) === '#/map');

  // ============ 2. Unit 0, full flow through the real UI ============
  await page.locator('a.block.open').click();
  check('unit 0 heading', (await heading('^Unit 0')).startsWith('Unit 0'));
  check('goals step lists Words to know', (await page.locator('dl.terms dt').count()) >= 8);
  for (const [label, key] of [['1 Goals', 'Goals'], ['2 Explain', 'Explain'], ['3 Worked', 'Worked'], ['4 Solidity', 'Bridge'], ['5 Fill', 'Fill'], ['6 Mastery', 'Quiz'], ['7 Practice', 'Practice']]) {
    await stepBtn(label).click();
    const tip = await page.locator('.note.todo').first().innerText();
    check('step help on: ' + key, /^What to do:/.test(tip), tip.slice(0, 30));
  }
  await stepBtn('6 Mastery').click();
  check('quiz is locked before the groundwork (4 items open, Start disabled)',
    (await page.locator('ul.check .m-no').count()) === 4 && (await page.getByRole('button', { name: 'Start quiz' }).isDisabled()));
  await stepBtn('2 Explain').click();
  check('explain step has an In short note', (await page.locator('.note.short').count()) === 1);
  await page.getByRole('button', { name: "I've read this" }).click();
  check('reading is recorded', await page.evaluate(() => S.units.u0.prep.read === true));
  await stepBtn('3 Worked').click();
  const reveal = page.getByRole('button', { name: /Reveal/ });
  check('cannot reveal the output without predicting', await reveal.isDisabled());
  await page.locator('#guess').fill('5');
  check('one answer is not enough when the example prints three lines', await reveal.isDisabled());
  await page.locator('#guess').fill('a\nb');
  check('two of three lines is still not enough', await reveal.isDisabled());
  await page.locator('#guess').fill('5\n40\n"Hello, Lean"');
  check('typing a prediction enables the reveal', !(await reveal.isDisabled()));
  await reveal.click();
  check('comparison table appears with every line matched', (await page.locator('table.cmp .m-ok').count()) === 3 && (await page.locator('main').innerText()).includes('You matched 3 of 3 lines'));
  check('prediction was logged and counted as groundwork', await page.evaluate(() => S.log.some(e => e.kind === 'predict' && e.u === 'u0' && e.ok === true) && S.units.u0.prep.predict === true));
  const showModel = page.getByRole('button', { name: 'Show the model answer' });
  check('model answer locked until the learner writes something', await showModel.isDisabled());
  await page.locator('textarea.prose').fill('Too short');
  check('a short note is still not enough', await showModel.isDisabled());
  await page.locator('textarea.prose').fill('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  check('long filler with no real words is not enough', await showModel.isDisabled());
  await page.locator('textarea.prose').fill('Tests only try some inputs, a proof covers every input, and money makes the missed case costly.');
  await showModel.click();
  check('model answer shown after writing', /model answer/i.test(await page.locator('main').innerText()));
  await page.getByRole('button', { name: 'It covered the same ideas' }).click();
  check('self-rating saved and counted as groundwork', await page.evaluate(() => S.units.u0.explain.rating === 'covered' && S.units.u0.prep.explain === true));
  await stepBtn('5 Fill').click();
  const fadedAns = await page.evaluate(() => { const f = UMAP.u0.faded; return { right: f.options[f.answer], wrong: f.options[(f.answer + 1) % f.options.length] }; });
  const pickOpt = async (txt) => page.locator('label.opt', { has: page.locator('code:text-is("' + txt + '")') }).locator('input').check();
  await pickOpt(fadedAns.wrong); await page.getByRole('button', { name: 'Check', exact: true }).click();
  check('fill-the-blank: a wrong pick is marked and asks for a note', (await page.locator('.fb.no').count()) === 1 && (await page.locator('#fnote').count()) === 1);
  const again = page.getByRole('button', { name: 'Try again' });
  check('cannot try again without a note', await again.isDisabled());
  await page.locator('#fnote').fill('xxxxxxxxxxxxxxxx');
  check('filler text is not accepted as a note', await again.isDisabled());
  await page.locator('#fnote').fill('That one multiplies by the wrong thing');
  check('a real sentence unlocks the retry', !(await again.isDisabled()));
  await again.click();
  await pickOpt(fadedAns.right); await page.getByRole('button', { name: 'Check', exact: true }).click();
  check('fill-the-blank: right pick explains why', (await page.locator('.fb.ok').innerText()).includes('multiply'));
  const fs0 = await page.evaluate(() => ({ f: S.faded.u0, p: S.units.u0.prep.faded }));
  check('fill-the-blank first try recorded as wrong, groundwork done', fs0.f.first === false && fs0.f.tries === 2 && fs0.p === true, JSON.stringify(fs0));
  await stepBtn('6 Mastery').click();
  check('quiz unlocked once groundwork is done', (await page.getByRole('button', { name: 'Start quiz' }).isEnabled()));
  await page.getByRole('button', { name: 'Start quiz' }).click();
  const c0 = await qCounts();
  check('unit 0 quiz = 5 questions + 2 generated typed ones', c0.n === 7, c0.n);
  const typedSeen = [];
  const log0 = await runQuiz(() => ({ correct: true, conf: 'sure' }));
  log0.forEach(x => typedSeen.push(x.type));
  check('the quiz mixes multiple-choice and typed questions', typedSeen.filter(t => t === 'typed').length === 2 && typedSeen.filter(t => t === 'mc').length === 5, typedSeen.join());
  check('submit stays disabled until sure/unsure/guessing is chosen', log0.every(x => x.disabledBeforeConf));
  check('unit 0 mastered with a 100% score', (await page.locator('h2', { hasText: 'Unit mastered' }).count()) === 1 && (await page.evaluate(() => { const u = S.units.u0; return u.mastered && u.best === 100 && u.history[0].score === 100 && u.history[0].total === 7; })));
  check('result lists a mark for every question', (await page.locator('ul.marks li').count()) === 7 && (await page.locator('ul.marks .m-ok').count()) === 7);
  const cards0 = await page.evaluate(() => Object.keys(S.cards));
  check('a review card exists for each question, generated ones by family', cards0.length === 7 && cards0.filter(k => k.startsWith('g:u0:')).length === 2, cards0.join());
  await page.screenshot({ path: shots + '/result.png' });

  // ============ 3. Unit 1: groundwork gate, half credit for Guessing ============
  await page.goto(url('#/map')); await page.reload();
  check('map: unit 0 mastered, unit 1 open', (await page.locator('a.block.mastered').count()) === 1 && (await page.locator('a.block.open').count()) === 1);
  await page.locator('a.block.open').click();
  check('unit 1 heading', (await heading('^Unit 1')).startsWith('Unit 1'));
  await stepBtn('6 Mastery').click();
  check('unit 1 quiz is locked until the groundwork is done', await page.getByRole('button', { name: 'Start quiz' }).isDisabled());
  await setPrep('u1'); await goHash('#/unit/u1');
  await stepBtn('6 Mastery').click();
  await page.getByRole('button', { name: 'Start quiz' }).click();
  check('unit 1 quiz = 5 + 2 generated', (await qCounts()).n === 7);
  const log1 = await runQuiz((k) => ({ correct: true, conf: k < 3 ? 'guess' : 'sure' }));
  check('a right answer marked Guessing is told it counts half', /half/.test(log1[0].feedback) && /Guessing/.test(log1[0].feedback));
  const u1 = await page.evaluate(() => S.units.u1);
  check('three Guessing answers cost 1.5 points: 5.5 of 7 = 79%, which is NOT a pass', u1.history[0].score === 79 && u1.history[0].right === 7 && !u1.mastered, JSON.stringify(u1.history));
  check('failed attempt with all answers right still shows the result screen', (await page.locator('h2', { hasText: 'Not there yet' }).count()) === 1);
  await page.getByRole('button', { name: /Retake/ }).click();
  const log1b = await runQuiz(() => ({ correct: true, conf: 'unsure' }));
  const u1b = await page.evaluate(() => S.units.u1);
  check('retake with new questions passes at 100%', u1b.mastered && u1b.attempts === 2 && u1b.history[1].score === 100 && u1b.best === 100, JSON.stringify(u1b.history));

  // ============ 4. fail path: written fixes, correctives, new questions on retake ============
  await page.evaluate(() => { for (let i = 0; i < 6; i++) S.log.push({ t: Date.now() - 1000, u: 'u1', q: 'u1q1', kind: 'quiz', ok: false, conf: 'unsure', ms: 2000 }); save(); });
  await goHash('#/map');
  await page.locator('a.block.open').click();
  check('unit 2 heading', (await heading('^Unit 2')).startsWith('Unit 2'));
  await setPrep('u2'); await goHash('#/unit/u2');
  await stepBtn('6 Mastery').click();
  await page.getByRole('button', { name: 'Start quiz' }).click();
  const typedCode1 = [], typedCode2 = [];
  const grabCode = async (arr) => { const t = await page.locator('input[name=typed]').count(); if (t) arr.push((await page.locator('fieldset pre').first().innerText())); };
  const n2 = (await qCounts()).n;
  const order1 = [];
  const log2 = [];
  for (let k = 0; k < n2; k++) { await grabCode(typedCode1); log2.push(await answer({ correct: k < 3, conf: 'sure' })); order1.push(k); }
  check('wrong answers cannot continue without a written note', log2.filter(x => x.nextDisabledWithoutFix === true).length === n2 - 3 && log2.filter(x => x.nextEnabledWithFix === true).length === n2 - 3);
  check('filler text ("xxxxxxxx") is not accepted as a note', log2.filter(x => x.nextDisabledWithFiller === true).length === n2 - 3);
  check('first attempt scores 3 of 7 = 43% and fails', (await page.evaluate(() => S.units.u2.history[0].score)) === 43 && (await page.locator('h2', { hasText: 'Not there yet' }).count()) === 1);
  check('what to go back over lists every missed question with the learner\'s own note', (await page.locator('h3', { hasText: 'What to go back over' }).count()) === 1 && (await page.locator('main').innerText()).includes('You wrote: I mixed up the two ideas there.'));
  check('the written notes are saved in the log', (await page.evaluate(() => S.log.filter(e => e.fix === 'I mixed up the two ideas there.').length)) === n2 - 3);
  check('u2 not mastered, u3 still locked', await page.evaluate(() => !isMastered(UMAP.u2) && unitStatus(UNITS.indexOf(UMAP.u3)) === 'locked'));
  check('sure-but-wrong answers were logged', (await page.evaluate(() => S.log.filter(e => e.conf === 'sure' && !e.ok && e.u === 'u2').length)) === n2 - 3);
  await page.getByRole('button', { name: 'Back to the worked example' }).click();
  check('corrective link goes back to the worked example so the learner predicts it again', (await page.locator('#guess').count()) === 1 && (await page.locator('table.cmp').count()) === 0);
  await stepBtn('6 Mastery').click();
  check('retake notice says new questions every time', (await page.locator('main').innerText()).includes('New questions and a new order every time'));
  await page.getByRole('button', { name: /Start retake/ }).click();
  const nR = (await qCounts()).n;
  for (let k = 0; k < nR; k++) { await grabCode(typedCode2); await answer({ correct: true, conf: 'sure' }); }
  check('retake passes and unlocks unit 3', await page.evaluate(() => isMastered(UMAP.u2) && unitStatus(UNITS.indexOf(UMAP.u3)) === 'open'));
  const differs = typedCode1.length >= 2 && typedCode2.length >= 2 && JSON.stringify(typedCode1) !== JSON.stringify(typedCode2);
  check('typed questions have different numbers on the retake', differs, JSON.stringify([typedCode1.map(x => x.slice(-30)), typedCode2.map(x => x.slice(-30))]));

  // ============ 4b. an abandoned quiz still counts as an attempt ============
  await setPrep('u3'); await goHash('#/unit/u3');
  await stepBtn('6 Mastery').click();
  await page.getByRole('button', { name: 'Start quiz' }).click();
  await answer({ correct: true });
  await goHash('#/map');
  const ab = await page.evaluate(() => ({ a: S.units.u3.attempts, h: S.units.u3.history.slice() }));
  check('leaving a quiz half way still records an attempt, scored 0', ab.a === 1 && ab.h.length === 1 && ab.h[0].score === 0, JSON.stringify(ab));

  // ============ 5. rush rule, per-option notes, shuffling, answer matching ============
  await setPrep('u3'); await goHash('#/unit/u3');
  await page.evaluate(() => { RUSH_MS = 3000; });
  await stepBtn('6 Mastery').click();
  await page.getByRole('button', { name: /Start (quiz|retake)/ }).click();
  const n3 = (await qCounts()).n;
  const log3 = await runQuiz(() => ({ correct: true, conf: 'sure' }));
  const mc3 = log3.filter(x => x.type === 'mc'), ty3 = log3.filter(x => x.type === 'typed');
  check('fast multiple-choice answers earn half credit and say why', mc3.length > 0 && mc3.every(x => /half/.test(x.feedback) && /seconds/.test(x.feedback)));
  check('typed answers are never penalised for speed', ty3.length > 0 && ty3.every(x => !/half/.test(x.feedback)));
  const expScore = Math.round(100 * (mc3.length * 0.5 + ty3.length) / n3);
  check('score reflects the half credits (' + expScore + '%) and does not pass', (await page.evaluate(() => S.units.u3.history[S.units.u3.history.length - 1].score)) === expScore && !(await page.evaluate(() => S.units.u3.mastered)), expScore);
  await page.evaluate(() => { RUSH_MS = 0; });
  // per-option notes: pick the tempting wrong option on u1q1
  await goHash('#/unit/u1'); await stepBtn('6 Mastery').click();
  await page.getByRole('button', { name: /Start retake/ }).click();
  let sawWhy = false; const nW = (await qCounts()).n;
  for (let k = 0; k < nW; k++) {
    const ex = await page.evaluate(() => window.__expected());
    if (ex.type === 'mc' && ex.id === 'u1q1') { const r = await answer({ correct: false, pick: 0 }); sawWhy = /Why that answer is tempting/.test(r.feedback) && /ordinary subtraction/.test(r.feedback); }
    else await answer({ correct: true });
  }
  check('picking a tempting wrong option explains why it is tempting', sawWhy);
  const shuf = await page.evaluate(() => { const seen = new Set(); for (let i = 0; i < 300; i++) seen.add(shuffle([0, 1, 2, 3]).join('')); return seen.size; });
  check('shuffle produces many different orders (' + shuf + ' of 24)', shuf >= 20);
  const norm = await page.evaluate(() => [normAns('Some 7') === normAns('some  7'), normAns('[1,2,3]') === normAns('[1, 2, 3]'), normAns('Except.ok 5') === normAns('except.ok  5'), normAns('1,000') === normAns('1000'), normAns('5') !== normAns('6')]);
  check('typed answers ignore spaces, case and commas but not digits', norm.every(Boolean), JSON.stringify(norm));
  const lens = await page.evaluate(() => { const bad = []; UNITS.forEach(u => u.quiz.forEach(q => { if (q.optWhy && (q.optWhy.length !== q.options.length || q.optWhy[q.a] !== null || q.optWhy.some((x, i) => i !== q.a && !x))) bad.push(q.id); })); return bad; });
  check('every why-tempting note lines up with its options', lens.length === 0, lens.join());

  // ============ 5b. units 8 and 9: generated questions and rotating sets ============
  await page.evaluate(() => { UNITS.forEach(u => { if (u.n <= 8) { const us = unitState(u.id); us.mastered = true; us.best = 100; us.history = [{ t: 1, right: 7, total: 7, score: 100 }]; } }); save(); });
  await setPrep('u8'); await goHash('#/unit/u8'); await stepBtn('6 Mastery').click();
  await page.getByRole('button', { name: /Start/ }).click();
  const ch8 = await page.evaluate(() => paceInfo().mode === 'challenge' ? 1 : 0);
  const c8 = await qCounts();
  check('unit 8 quiz has 5 questions plus 2 generated ones (so it cannot be memorised)', c8.n === 7 + ch8, c8.n);
  const l8 = await runQuiz(() => ({ correct: true }));
  check('unit 8 has 2 typed generated questions', l8.filter(x => x.type === 'typed').length === 2);
  const sets9 = new Set(); let all5 = true;
  for (let t = 0; t < 6; t++) {
    await page.evaluate(() => { S.log = []; save(); });       // keep the pace steady so the usual 5-of-6 draw applies
    await setPrep('u9'); await goHash('#/unit/u9'); await stepBtn('6 Mastery').click();
    await page.getByRole('button', { name: /Start/ }).click();
    const ids = []; const n9 = (await qCounts()).n;
    for (let k = 0; k < n9; k++) { const ex = await page.evaluate(() => window.__expected()); ids.push(ex.id); await answer({ correct: true }); }
    if (new Set(ids).size !== n9) all5 = false;
    sets9.add(ids.slice().sort().join());
  }
  check('unit 9 draws a different set of questions across attempts, never repeating one within an attempt', sets9.size >= 2 && all5, sets9.size);
  await page.evaluate(() => { UNITS.forEach(u => { if (u.n === 9) { const us = unitState(u.id); us.mastered = false; } }); save(); });

  // ============ 6. pace logic ============
  const pace = await page.evaluate(() => {
    const mk = (r, n) => { S.log = []; for (let i = 0; i < n; i++) S.log.push({ t: Date.now(), u: 'u1', q: 'u1q1', kind: 'quiz', ok: i < r, conf: 'sure', ms: 1000 }); return paceInfo().mode; };
    const o = {};
    o['3/4'] = mk(3, 4); o['0/4'] = mk(0, 4); o['2/5=40%'] = mk(2, 5); o['3/5=60%'] = mk(3, 5);
    o['9/10'] = mk(9, 10); o['17/20=85'] = mk(17, 20); o['16/20=80'] = mk(16, 20); o['9/9'] = mk(9, 9);
    S.log = []; for (let i = 0; i < 30; i++) S.log.push({ t: 1, u: 'u1', q: 'u1q1', kind: 'quiz', ok: false, conf: null, ms: 1 });
    for (let i = 0; i < 20; i++) S.log.push({ t: 2, u: 'u1', q: 'u1q1', kind: 'quiz', ok: true, conf: null, ms: 1 });
    o['window'] = paceInfo().mode;
    S.log = []; for (let i = 0; i < 12; i++) S.log.push({ t: 1, u: 'u1', q: 'u1-faded', kind: 'faded', ok: false, conf: null, ms: null, first: true });
    for (let i = 0; i < 12; i++) S.log.push({ t: 1, u: 'u1', q: 'u1-predict', kind: 'predict', ok: false, conf: null, ms: null });
    o['faded+predict excluded'] = paceInfo().mode + '/' + paceInfo().n;
    return o;
  });
  const expect = { '3/4': 'steady', '0/4': 'steady', '2/5=40%': 'support', '3/5=60%': 'steady', '9/10': 'challenge', '17/20=85': 'challenge', '16/20=80': 'steady', '9/9': 'steady', window: 'challenge', 'faded+predict excluded': 'steady/0' };
  for (const k of Object.keys(expect)) check('pace ' + k + ' -> ' + expect[k], pace[k] === expect[k], pace[k]);

  // ============ 7. support and challenge in the UI ============
  await page.evaluate(() => { S.log = []; for (let i = 0; i < 6; i++) S.log.push({ t: Date.now(), u: 'u1', q: 'u1q1', kind: 'quiz', ok: i < 1, conf: 'sure', ms: 1000 }); save(); });
  await goHash('#/unit/u1');
  await stepBtn('2 Explain').click();
  check('support: explanation arrives one idea at a time', (await page.locator('main').innerText()).includes('idea 1 of'));
  await page.getByRole('button', { name: 'Show everything' }).click();
  check('support: Show everything reveals the rest', (await page.locator('.explain p').count()) >= 3);
  await stepBtn('6 Mastery').click();
  await page.getByRole('button', { name: /Start/ }).click();
  check('support: key ideas shown above the question', (await page.locator('.note.mode').innerText()).includes('Key ideas'));
  await page.screenshot({ path: shots + '/support-quiz.png' });
  await page.evaluate(() => { S.log = []; for (let i = 0; i < 12; i++) S.log.push({ t: Date.now(), u: 'u1', q: 'u1q1', kind: 'quiz', ok: true, conf: 'sure', ms: 1000 }); save(); });
  await goHash('#/unit/u1'); await stepBtn('6 Mastery').click();
  check('challenge: quiz announces 8 questions (5 + challenge + 2 generated)', (await page.locator('main').innerText()).includes('8 questions'));
  await page.getByRole('button', { name: /Start/ }).click();
  check('challenge: first screen says "of 8"', (await qCounts()).n === 8);

  // ============ 8. review: due cards, interleaving, generated cards, boxes ============
  await page.evaluate(() => { S.log = []; save(); });
  await goHash('#/review');
  check('review: nothing due at first', (await page.locator('main').innerText()).includes('Nothing due'));
  const nCards = await page.evaluate(() => { Object.values(S.cards).forEach(c => { c.due = Date.now() - 1000; }); save(); return Object.keys(S.cards).length; });
  await page.reload();
  await goHash('#/review');
  check('review: no time estimate until there are enough timed answers', (await page.locator('#estimate').innerText()).includes('No time estimate yet'));
  await page.evaluate(() => { [4000, 6000, 8000, 10000, 12000, 14000].forEach(ms => S.log.push({ t: Date.now(), u: 'u1', q: 'u1q1', kind: 'quiz', ok: true, conf: 'unsure', ms })); save(); });
  await goHash('#/map'); await goHash('#/review');
  const estText = await page.locator('#estimate').innerText();
  const wantMin = Math.max(1, Math.round(Math.min(25, nCards) * 9 / 60));
  check('review: a session holds up to 25 cards, with minutes worked out from the median answer time (9 s)', (await page.evaluate(() => REVIEW_BATCH)) === 25 && estText.includes('About ' + wantMin + ' minute') && estText.includes('median answer time of 9 seconds'), estText);
  check('nav shows the due count', /Review \(\d+\)/.test(await page.locator('nav').innerText()));
  await page.getByRole('button', { name: 'Start review' }).click();
  const batch = Math.min(25, nCards);
  const seenUnits = new Set(); let reviewed = 0, sawTyped = false, boxMsgOk = true;
  while (await page.locator('input[name=conf]').count()) {
    seenUnits.add((await page.locator('.tagline').first().innerText()).split('.')[1]);
    if (await page.locator('input[name=typed]').count()) sawTyped = true;
    const right = reviewed % 4 !== 3;
    const r = await answer({ correct: right, conf: 'unsure' });
    if (right ? !/box 1 to box 2/.test(r.feedback) : !/back to box 1/.test(r.feedback)) boxMsgOk = false;
    reviewed++; if (reviewed > 40) break;
  }
  check('review covers a full batch (' + batch + ')', reviewed === batch, reviewed + ' vs ' + batch);
  check('review feedback explains the box movement', boxMsgOk);
  check('review mixes several units', seenUnits.size >= 2, [...seenUnits].join(';'));
  check('review includes generated typed questions with fresh numbers', sawTyped);
  check('every review answer stores its credit, and a missed generated question stores code, typed and correct answers', await page.evaluate(() => S.log.filter(e => e.kind === 'review').every(e => typeof e.credit === 'number') && S.log.filter(e => e.kind === 'review' && !e.ok && e.q.startsWith('g:')).every(e => typeof e.typed === 'string' && typeof e.correct === 'string')));
  check('review finished screen', (await page.locator('h2', { hasText: 'Review finished' }).count()) === 1);
  const boxes = await page.evaluate(() => boxCounts());
  check('Leitner boxes moved (some in box 2, some back in box 1)', boxes[1] > 0 && boxes[0] > 0, JSON.stringify(boxes));
  check('a box-2 card is due in 3 days', (await page.evaluate(() => { const c = Object.values(S.cards).find(c => c.box === 2); return Math.round((c.due - startOfDay(Date.now())) / 86400000); })) === 3);

  // ============ 9. weekly report ============
  await page.evaluate(() => { S.log = []; const now = Date.now();
    const L = (u, q, ok, conf, ms, kind, daysAgo, fix) => { const e = { t: now - (daysAgo || 0) * 86400000, u, q, kind: kind || 'quiz', ok, conf, ms }; if (fix) e.fix = fix; S.log.push(e); };
    L('u1', 'u1q1', false, 'sure', 5000, 'quiz', 0, 'forgot the check first'); L('u1', 'u1q1', false, 'unsure', 70000, 'review'); L('u1', 'u1q2', true, 'guess', 3000);
    L('u4', 'u4q1', false, 'sure', 90000, 'quiz', 2); L('u4', 'u4q1', true, 'sure', 2000, 'quiz', 1);
    L('u1', 'u1q3', true, 'sure', 1000, 'quiz', 20);
    S.log.push({ t: now, u: 'u1', q: 'u1-faded', kind: 'faded', ok: true, conf: null, ms: null, first: true });
    S.log.push({ t: now, u: 'u1', q: 'u1-predict', kind: 'predict', ok: true, conf: null, ms: null });
    S.log.push({ t: now, u: 'u2', q: 'u2-predict', kind: 'predict', ok: false, conf: null, ms: null });   // saved before line counts existed
    unitState('u1').explain = { text: 'x'.repeat(30), rating: 'partly', t: now };
    S.secs[dayKey(now)] = 1500; S.secs[dayKey(now - 86400000)] = 600; S.secs[dayKey(now - 30 * 86400000)] = 9999; save(); });
  await goHash('#/report');
  await page.locator('#notes').fill('Unit 4 felt hard. I only have 3 hours a week.');
  await page.evaluate(() => { RUSH_MS = 3000; });   // a page load resets the test build's switch-off, so set the real 3 seconds after loading
  const rep = await page.evaluate(() => buildReport());
  check('report header uses the new name', rep.startsWith('=== LEARN LEAN 4 WEEKLY REPORT (v1) ==='));
  check('report: 5 answers (old one excluded), 2 right', /Total answers: 5, correct: 2, accuracy: 40%/.test(rep));
  check('report: 35 active minutes', /Active minutes: 35/.test(rep));
  check('report: 3 study days', /Study days: 3 of 7/.test(rep));
  check('report: confident but wrong 2, with the learner\'s own note', /Confident but wrong \(marked Sure, answered wrong\): 2/.test(rep) && rep.includes('my note: forgot the check first'));
  check('report: confidence calibration lines', /Marked Sure: 3 answers, 33% right/.test(rep) && /Marked Guessing: 1 answers, 100% right/.test(rep), (rep.match(/Marked Sure.*/) || [])[0]);
  check('report: slow questions 2', /took over 60 seconds to answer\): 2/.test(rep));
  check('report: fill-the-blank 1 of 1, predictions 1 of 2, explain-back self-rating', /Fill-the-blank right on the first try: 1 of 1/.test(rep) && /2 earlier predictions saved without line counts \(1 completely right\)/.test(rep) && !/predicted completely right/.test(rep) && /partly=1/.test(rep));
  check('report: half credit counts a right answer marked Guessing (and works out older entries)', /Right answers that earned half credit: 2 of 2 right \(1 marked Guessing, 1 multiple choice under 3 seconds\)/.test(rep), (rep.match(/Right answers that earned half.*/) || [])[0]);
  check('report: says what the pace figure rests on (the pace uses the last 20 answers of any date)', /The pace figure rests on 6 answers from 4 study days/.test(rep), (rep.match(/The pace figure.*/) || [])[0]);
  check('report: weakest tag nat-subtraction 1/4', /- nat-subtraction: 1\/4 \(25%\)/.test(rep));
  check('report: notes and closing request', rep.includes('I only have 3 hours a week.') && /REQUEST\nPlease read this report/.test(rep) && rep.includes('Learn Lean 4 app'));
  await page.evaluate(() => { S.log = []; const now = Date.now();
    S.log.push({ t: now, u: 'u2', q: 'g:u2:nested', kind: 'quiz', ok: false, conf: 'sure', ms: 4000, credit: 0, code: 'def double (n : Nat) : Nat := n * 2 #eval double (double 5)', typed: '40', correct: '20' });
    S.log.push({ t: now, u: 'u1', q: 'u1q2', kind: 'quiz', ok: true, conf: 'guess', ms: 9000, credit: 0.5 });
    S.log.push({ t: now, u: 'u1', q: 'u1q1', kind: 'quiz', ok: true, conf: 'sure', ms: 9000 });
    S.log.push({ t: now, u: 'u2', q: 'u2-predict', kind: 'predict', ok: false, conf: null, ms: null, matched: 5, close: 1, total: 8 });
    S.log.push({ t: now, u: 'u2', q: 'u2-predict', kind: 'predict', ok: true, conf: null, ms: null, matched: 3, close: 0, total: 3 });
    S.log.push({ t: now, u: 'u1', q: 'u1-predict', kind: 'predict', ok: false, conf: null, ms: null });
    save(); });
  await goHash('#/map'); await goHash('#/report');
  await page.evaluate(() => { RUSH_MS = 3000; });
  const rep2 = await page.evaluate(() => buildReport());
  check('report: confident-but-wrong entry shows the code, what was typed and the correct answer', /Confident but wrong \(marked Sure, answered wrong\): 1/.test(rep2) && rep2.includes('code: `def double (n : Nat) : Nat := n * 2 #eval double (double 5)`') && rep2.includes('I typed: `40`') && rep2.includes('correct answer: `20`'));
  check('report: predictions per unit as lines matched out of lines shown, close counted apart', rep2.includes('- Unit 2 Definitions and functions: 8 of 11 lines exact (73%), 1 close, over 2 predictions') && /1 earlier prediction saved without line counts \(0 completely right\)/.test(rep2));
  check('report: half credit line (1 of 2 right answers)', rep2.includes('Right answers that earned half credit: 1 of 2 right (1 marked Guessing, 0 multiple choice under 3 seconds)'), (rep2.match(/Right answers that earned half.*/) || [])[0]);
  check('report: pace basis line (3 answers, 1 study day)', rep2.includes('The pace figure rests on 3 answers from 1 study day'), (rep2.match(/The pace figure.*/) || [])[0]);
  await page.evaluate(() => { RUSH_MS = 0; });
  check('report has no HTML leaking in', !/<code>|&lt;/.test(rep));
  await page.getByRole('button', { name: 'Copy report' }).click(); await page.waitForTimeout(500);
  check('copy gives a message', (await page.locator('.msg').last().innerText()).length > 5);
  const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => null));
  if (clip !== null) check('clipboard holds the report', clip.includes('=== LEARN LEAN 4 WEEKLY REPORT (v1) ==='));
  await page.screenshot({ path: shots + '/report.png' });

  // ============ 10. active-time tracking ============
  await page.evaluate(() => { S = blank(); save(); });
  await goHash('#/map');
  await page.mouse.move(10, 10); await page.mouse.click(20, 20);
  await page.waitForTimeout(11500);
  const s1 = await page.evaluate(() => S.secs[dayKey(Date.now())] || 0);
  check('active time counts while interacting (~10 s)', s1 >= 9 && s1 <= 16, s1);
  await page.evaluate(() => { lastAct = Date.now() - 200000; });
  await page.waitForTimeout(11000);
  const s2 = await page.evaluate(() => S.secs[dayKey(Date.now())] || 0);
  check('idle time is not counted', s2 - s1 < 1, s2 - s1);
  await page.evaluate(() => { lastAct = Date.now(); Object.defineProperty(document, 'visibilityState', { get: () => 'hidden', configurable: true }); });
  await page.waitForTimeout(11000);
  const s3 = await page.evaluate(() => S.secs[dayKey(Date.now())] || 0);
  check('a hidden tab is not counted', s3 - s2 < 1, s3 - s2);

  // ============ 11. method + sources pages ============
  await page.goto(url('#/method')); await page.reload();
  const mt = await page.locator('main').innerText();
  check('method page: techniques, honesty section, limits', mt.includes('Dunlosky') && mt.includes('moderate') && mt.includes('108 studies') && mt.includes('Keeping it honest') && mt.includes("What isn't backed by research"));
  check('method: reading list has 6 links', (await page.locator('main li a').count()) === 6);
  await page.goto(url('#/sources')); await page.reload();
  check('sources: lists sources and setup', (await page.locator('main li a').count()) >= 25 && (await page.locator('main').innerText()).includes('leanprover.lean4'));
  check('external links use rel=noopener', (await page.evaluate(() => [...document.querySelectorAll('main a[href]')].filter(a => a.target === '_blank' && !/noopener/.test(a.rel)).length)) === 0);

  // ============ 12. phone-sized screen ============
  const mobile = await browser.newContext({ viewport: { width: 375, height: 800 }, deviceScaleFactor: 2 });
  await mobile.addInitScript(() => { window.__LEAN_TEST = true; });
  const mp = await mobile.newPage(); mp.on('pageerror', e => errors.push('mobile pageerror: ' + e.message));
  await mp.goto(url('#/map')); await mp.reload();
  check('mobile: map has no sideways scroll', !(await mp.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)));
  await mp.screenshot({ path: shots + '/mobile-map.png' });
  await mp.goto(url('#/unit/u0')); await mp.reload();
  await mp.getByRole('button', { name: /^3 Worked/ }).click();
  check('mobile: worked example has no sideways scroll', !(await mp.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)));
  await mp.screenshot({ path: shots + '/mobile-unit.png' });
  await mp.goto(url('#/start')); await mp.reload();
  check('mobile: start page has no sideways scroll', !(await mp.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)));

  check('no console or page errors', errors.length === 0, errors.join(' || '));
  await browser.close();
  const fails = results.filter(r => r[0] === 'FAIL');
  for (const r of results) console.log(r.join(' | '));
  console.log('\n' + (results.length - fails.length) + '/' + results.length + ' checks passed');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); for (const r of results) console.log(r.join(' | ')); process.exit(2); });
