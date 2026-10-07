# TASK-637 — FE: **port the mutation runner's test-list fix into the front repo**
**From @Sober to @Fern.** 📌 **Cut because of what I found VERIFYING `TASK-611`, not because of anything you did wrong.**
🔑 **You followed the front repo's own convention exactly. The convention is what is short.**

---

## 1. The problem, in one paragraph
**The front runner takes `--tests "<files>"` on the command line, and a mutation set is a BARE ARRAY that cannot carry one.** ⇒ 🔴 **A set's test list lives only in whoever ran it.**
**Two consequences, both already real here:**
- 🔴 **Your `A8`/`A9` survived their first run because the denied-key file was missing from the list.** **Second time this fortnight.** 🔑 **The list is part of the run, and nothing in the repo says what it was.**
- 🔴 **When I verified your 14/14 I had to GUESS your list.** **I guessed right and the set bit 14/14 — but until I did, your number was unverifiable by anybody but you.** ⇒ **That is the exact failure we closed in the back repo two days ago, still open here.**

## 2. ✅ The fix already exists — **port it, do not re-invent it**
**@Jason changed the BACK repo's runner today.** **Read `smart-scheduler-back/scripts/mutation/run.ts` and its README, and bring the same behaviour across:**
- **A set may be `{ tests, mutations }` as well as the old bare array.** ✅ **Old sets keep working.**
- **`--tests` still WINS when given** — the command line can still override.
- 🔴 **A set with NO list anywhere is REFUSED, not guessed at.** 🔑 **A guessed test set produces a verdict about something nobody chose.**
- **The run prints the list it used** (yours already does — keep it).

⚠️ **What must NOT change: THE VERDICT RULE.** 🔑 **Widen the INPUT; leave the JUDGEMENT alone.** **Check the rule text is byte-for-byte the same before and after** — *that section is written to be identical across repos, and this is the moment it would drift.*
📌 **Keep the front repo's own file convention (`scripts/mutation/task-NNN.json`).** 🚫 **Do not move the sets to match the back repo's layout** — **the property that matters is that the set is in the repo and carries its own test list, not where it sits.**

## 3. ▶️ Then backfill
**Put your test list inside `scripts/mutation/task-611.json`.** 📌 **And `task-634`'s when you write it.**
🚫 **Do not re-run the older sets to backfill their lists** — ⚠️ **if you cannot recover a set's list honestly, leave it without one and let the new refusal say so.** 🔑 **A list invented after the fact is worse than an absent one: it reads as evidence.**

## 4. ✅ Done means
**`tsc` · `bun test` · `build` — all three clean, with COUNTS.**
**And prove the three behaviours by using them:** **a set WITH a list runs with no `--tests` · `--tests` overrides it · a set with NO list anywhere is REFUSED with a message that says why.**
📌 **No mutation set is required for this task** — 🔑 *the tool that measures is not measured by itself.* ⚠️ **But re-run `task-611.json` from its own list afterwards and tell me the counts; that is the proof it works.**

## 5. 🚫 Not in this task
**Changing any existing mutation set's CONTENT** · **the verdict rule** · **the back repo, which you do not touch** · **`TASK-624`.**

---
## 📋 @Fern REPORT — 2026-10-07 — 🔨 DONE, ready for @Sober
(Re-read the front repo first; read the back repo's `run.ts` — read only, not touched.)
**Runner (`scripts/mutation/run.ts`, the INPUT only):** a set may be `{ tests, mutations }` (`tests` = array or one space-separated string) as well as the bare array (old sets keep working) · `--tests` WINS · **a set with no list anywhere is REFUSED** (`NO TEST LIST … nothing was run`, exit 2) · the run still prints `TESTS …`. **One addition beyond the back repo, said plainly:** a listed file that does not exist is also REFUSED (`TEST FILE NOT FOUND`) — otherwise a mistyped list could run as "nothing to test". Say if you want it out. `verdict.ts` **untouched** (git diff empty); **the README's THE VERDICT RULE section is byte-identical** before/after (`cmp` on lines 16-36); README gained a "set carries its own test list" paragraph in **Use**, outside the rule. File convention unchanged (`scripts/mutation/task-NNN.json`).
**The three behaviours, used:** (1) a set WITH a list, no `--tests`: `task-611.json` ran from its own list — printed `TESTS` (6 files), `BASELINE 52 pass / 0 fail` · (2) `--tests` overrides: `task-634.json` + `--tests src/nope-override.test.ts` ⇒ the refusal names `nope-override`, not the set's own five files · (3) a set with NO list (`task-654.json`) ⇒ `NO TEST LIST: pass --tests "<files>", or give the set a "tests" field … nothing was run.` `bun run mutation:prove` — all five cases hold.
**Backfill:**
- `task-634.json` → `{ tests (the 5 from the parked file), mutations (11) }`; **`task-634.json.pending-637` folded in and DELETED**.
- `task-611.json` → `{ tests, mutations (24) }`. ⚠️ **HONEST LIMIT: the original list was never written down — it is RECONSTRUCTED, not recovered**, and the set says so in a `_why` field. Basis: the three test files TASK-611 names as NEW (`admin-records-leave.dom.test.tsx`, `teacher-leave-row.dom.test.tsx`, `teacher-leave-row-no-key.dom.test.tsx`) + `report-leave-advance.dom.test.tsx` (the dialog's existing test) + the two files TASK-611 declares it moved (`teacher-scope.test.ts`, `action-gate.test.ts`; both read-only here, only RUN). **Proof it is a good list: `task-611.json` re-run from its own list — baseline 52/0, 24/24 BITE, CHECKSUM identical, files restored.** (The set has 24 mutations; the old "14/14" was an earlier count.) A list that bites all 24 is not proof it is the ORIGINAL list — treat it as a new, checked one.
- Older sets (567…658, 691, 694, 695) **left bare, not re-run** per §3; they will be refused without `--tests` until someone adds a list. 691/694/695/658 have lists recorded in their TASK files — I can fold those in as a follow-up if you want (say the word).
**Verification:** `tsc` 0 · `bun test` **1095 pass / 0 fail, 122 files** · **unhandled-between-tests: 0** · build OK. No mutation set for this task (the tool is not measured by itself). **BALL: @Sober.**

---
## 📋 @Fern — 2026-10-07 follow-up: lists folded into 658 / 691 / 694 / 695 (JSON only, NOTHING RUN)
`task-658.json` (8 files, 17 mutations) · `task-691.json` (2 files, 6 mutations; V4–V7 stay retired) · `task-694.json` (4 files, 7) · `task-695.json` (same 4 files, 2). Each list is **copied from the TASK file it was recorded in** (not reconstructed) and says so in `_why`; every listed file exists (checked by the script) and each file parses as `{tests, mutations}` with the mutation count unchanged. **No set was run** — `dictionaries.ts` carries Team B's uncommitted edits; Sober runs them. No `src` file touched by this follow-up. 658/691/694/695 now run with no `--tests`. **BALL: @Sober.**
