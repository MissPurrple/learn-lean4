# Handoff: Lean 4 for blockchain, adaptive study dashboard

Paste this whole file into Claude Code as your first message, from inside this unzipped folder.

## Who I am / what I want
- I'm new to this. Be clear in all instructions and thorough in all checks.
- I want to learn **Lean 4** as it relates to blockchain: **Ethereum** (EVM, Solidity) and **Solana** (Rust).
- Teaching level: **1st-year university**. Use tried and true teaching methods. **Make nothing up.**
- The dashboard must adapt to my pace, track how well or badly I'm doing, and make a **weekly report** I can copy back to Claude. Claude then writes a "self-improvement prompt" to update the dashboard.

## Decisions already made (don't redo them)
- **Don't run REA** (morluto/rea) on Lean. Lean is open source, and REA's own skill says to skip it for source repos. Running it would also mean executing a downloaded npm package. Lean's real source was read directly instead.
- Every Lean example must **compile on real Lean** (4.36.0 was used, the latest stable on 2026-11-16) with outputs copied from the actual run.

## What's done
- `content.js`: all 9 units of course content (`UNITS`), plus `SOURCES` and `METHOD_SOURCES`. Each unit has goals, explanation, a worked example with real output and line notes, a Rust/Solidity bridge, a faded example (fill the blank), a 4–5 question mastery quiz, a challenge question and a VS Code practice task with its verified expected output.
  Units: 1 Lean as a calculator · 2 Definitions and functions · 3 Structures (Account) · 4 Inductive types and match (Instruction, Option) · 5 Lists and recursion (total supply) · 6 Except and a safe transfer · 7 Propositions and first proofs · 8 Proving contract invariants (conservation, no overdraft, induction) · 9 Inside Lean (from source) and real Lean blockchain projects.
- `lessons/*.lean`: the test files. Re-run them all with `lean <file>` to confirm the outputs still match. `Err.lean` captures real error messages, and `C1`–`C7` check specific claims in the text (for example the missing-case error, the `repr` failure without `deriving Repr`, and every practice answer).
- One mistake was found by testing and fixed: #eval prints a structure even without `deriving Repr` in 4.36, but `repr x` then fails. Unit 3 now says this.

## What's left (the build)
Build **one self-contained HTML page** from `content.js` with:
1. **Course map**: units shown as a chain of blocks (locked → open → mastered), with a best-score bar on each.
2. **Unit view**: goals → explanation → worked example ("predict the output first", then reveal output and notes) → bridge → faded example → mastery quiz (one question at a time; pick a confidence level **before** submitting: sure / unsure / guessing; then immediate feedback with the "why") → practice task.
3. **Mastery gate (Bloom)**: 80% or more on the quiz marks the unit mastered and unlocks the next. Below that, show correctives (the missed questions' explanations plus links back to the worked example), then allow a retake with shuffled order.
4. **Spaced review (Leitner)**: boxes at 1, 3, 7, 14 and 30 days. A wrong answer goes back to box 1. The review tab mixes due cards from all units (interleaving).
5. **Adaptive pace**, based on the last 20 answers: below 60% gives "support" mode (smaller steps, key ideas shown as hints); 85% or more with at least 10 answers gives "challenge" mode (the challenge question is added to quizzes); anything else is "steady". Show a "today's plan" line: due reviews first, then the next unit.
6. **Time tracking**: count active minutes only while the tab is visible and I've interacted in the last 2 minutes.
7. **Weekly report** (Copy button, no downloads). Last 7 days: study days, minutes, answers, accuracy overall and per unit, weakest concept tags, "confident but wrong" count and list, slow questions, review backlog and box counts, faded examples right first time, current pace mode, a textarea for my own notes. It ends with a request asking Claude to write a self-improvement prompt for the dashboard. Header: `=== LEARN LEAN 4 WEEKLY REPORT (v1) ===`.
8. **Method page**: explain the techniques with `METHOD_SOURCES`: practice testing and distributed practice (Dunlosky 2013, rated highest utility), interleaving (moderate utility), worked examples followed by faded examples (Sweller & Cooper 1985; Renkl & Atkinson 2002), mastery learning with correctives (Bloom; Kulik et al. 1990, 108 studies). Don't claim research backing for the confidence ratings. Just say they help spot confident mistakes.
9. **Sources page** from `SOURCES`, plus setup steps: install VS Code, then the official extension `leanprover.lean4` (check the publisher is **leanprover**), then follow its setup guide.
10. **Saving progress**: keep progress in localStorage (wrapped in try/catch), plus Export/Import of progress as JSON text so I can back it up. Cap the answer log at about 1,500 entries.

Then open the page in a browser, click through one unit, the quiz, a review and the report, and fix any errors before calling it done.

## Safety notes from this session
- Lean repo and VS Code extension: official and safe (publisher `leanprover`). Keep Lean at 4.32.2 or later, because of the 2026 kernel soundness fixes.
- REA has an unusually high star count (about 473k) and runs npm code and decompilers. It was not needed for this and wasn't used.
