# Learn Lean 4

A self-study course in Lean 4 using Ethereum and Solana examples, delivered as a single-page web app that works offline. First-year level, no prior experience assumed.

The app teaches ten units (Unit 0 to 9), tracks answers and scores, schedules spaced review, adapts to the learner's pace, and produces a weekly report the learner can paste to Claude to improve the app.

## Run it

Open `index.html` in a browser. It is one self-contained file with no server and no network needed. Progress is saved in the browser's local storage.

For an installable, offline desktop app, host the folder as static files over https (for example on Vercel: framework "Other", no build command, output directory the repo root). Then open the address in Chrome, Edge or Brave and use the Install icon in the address bar. `manifest.webmanifest`, `sw.js` and the icons make that work.

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | The built app. Generated, do not edit by hand. |
| `src/app.template.html` | App source: markup, styles, all logic. |
| `content.js` | Course core: units, worked Lean examples and their real outputs, quiz questions, sources. |
| `content-beginner.js` | Unit 0, plain-language rewrites, glossary terms, explain-it-back prompts, wrong-answer notes, step help. Overrides fields in `content.js`. |
| `content-generated.js` | Generators for typed questions with fresh random numbers. |
| `build.py` | Combines the template and content into `index.html`, stamps the build date, writes `sw.js`. `--test` builds a copy with test hooks into `tests/build/`. |
| `src/sw.template.js`, `sw.js` | Service worker (offline cache), stamped with a version per build. |
| `manifest.webmanifest`, `icon-*.png` | Install metadata and icons. |
| `lessons/*.lean` | Lean files used to test the course text. `U` files are unit examples, `C` files check specific claims, `Err.lean` captures real error messages. |
| `tests/` | Checks described below. |

## Change something

Edit the template or a content file, then rebuild:

```bash
python3 build.py
```

Commit `index.html` and `sw.js` with the change. Hosting redeploys on each push. Never edit Lean code or outputs in `content.js` without re-running the Lean checks below.

## Tests

Lean checks need Lean 4.36.0 on the `PATH` (install with elan, or the VS Code extension `leanprover.lean4`). Browser checks need Node 20+ and Playwright with Chromium.

Browser tests run against a test build that keeps hooks the production page removes (so tests can read the expected answer and reach the app's internals). Build it first; it is written to `tests/build/` and is not committed.

```bash
python3 build.py --test
```

| Command | What it proves |
| --- | --- |
| `node tests/check-lean-examples.js` | Every worked example in the course produces exactly the output shown, on real Lean. |
| `node tests/check-generated.js` | Every generated question family (30 random seeds each) matches real Lean's output. |
| `NODE_PATH=$(npm root -g) node tests/e2e.js "$PWD/tests/build/index.html" /tmp` | Click-through of units, quizzes, scoring rules, groundwork gate, review, pace, report and time tracking. |
| `NODE_PATH=$(npm root -g) node tests/e2e-new.js /tmp` | Progress page, glossary, backup and signature checks, every unit rendering, a production page with no test hooks, and offline mode. |

## How the app works

- **Course map:** units unlock in order. A unit is mastered at 80% on its quiz.
- **Unit steps:** goals, explanation, worked example (predict first, then compare; each line is marked exact, close or wrong, and only exact counts), Solidity and Rust bridge, fill-the-blank, quiz, practice. The quiz unlocks after the groundwork steps are done.
- **Quiz marking:** multiple-choice options are reshuffled each time. Typed questions use freshly generated numbers. A right answer marked Guessing, or a multiple-choice answer in under 3 seconds, counts half. A wrong answer needs a written note before continuing. Leaving a quiz part way still counts as an attempt. Each answer is logged with its credit, and a wrong typed answer also keeps the code shown, what was typed and the right answer (120 characters each).
- **Review:** Leitner boxes at 1, 3, 7, 14 and 30 days; a wrong answer returns to box 1; due cards from all units are mixed. A session holds 25 cards and shows an estimate of minutes from the learner's median answer time.
- **Pace:** from the last 20 answers. Under 60% (after at least 5 answers) is Support mode; 85% or more (after at least 10) is Challenge mode. The weekly report says how many answers and study days that figure rests on.
- **Weekly report:** the Weekly report page builds a text summary of the last 7 days, including worked-example lines matched per unit, answers that earned half credit, and the code, typed answer and right answer for confident-but-wrong typed questions. The learner adds notes and copies it to Claude, which writes an improvement prompt.
- **Saved data:** local storage key `leandash.v1`, signed with SHA-256. If the signature doesn't match, mastery and best scores are cleared and the app says so (the answer log is kept). The signature is a tripwire, not a lock, because the code is readable. The Backup page saves and restores a signed file, which should be copied somewhere other than the Downloads folder.

## Versions and sources

Lean examples were tested on Lean 4.36.0. Keep Lean at 4.32.2 or later because of 2026 kernel soundness fixes. Source links are in the app (Sources page) and in `content.js`.

## Licence

BSD 3-Clause. See `LICENSE`.
