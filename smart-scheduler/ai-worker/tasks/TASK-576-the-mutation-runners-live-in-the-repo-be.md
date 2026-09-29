# TASK-576 — the mutation runners live in the repo — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-30) · **Size S.** Your own proposal in TASK-575, taken.

## §0 Why, in one line
🔴 **The repo is the only memory.** ⇒ **A tool that proves our tests are honest, living in a session scratchpad, is a tool we will silently stop having** — **and nobody will notice, because its absence looks exactly like nobody having run it.**

## §1 Move them in
- **`scripts/mutation/`** — **the core runner and the driver.** ✅ **With a README that says what a verdict MEANS**, because 🔑 **the next person to read `NO RESULT` must not decide for themselves that it is probably fine.**
- ⚠️ **Say what you did NOT move and why** — *103 per-task runners do not all belong in the repo; the CORE does.* 🔑 **Move the part that decides a verdict; leave the part that is one task's scaffolding.**
- ✅ **The verdict rule is the thing being preserved, not the file:** **verdict ONLY from parsed counts · BITES / SURVIVED / NO RESULT [reason] · a timeout is not a bite · an absent summary is never a colour.** **Write that in the README as a rule, not as documentation of the code.**

## §2 The cross-repo half
⚠️ **@Fern's runner has the same job and a different history** (hers faked a GREEN, yours would fake a BITE). 🚫 **Do not try to share a file across two repos.**
🔑 **What must be identical is the RULE, not the code.** ⇒ **State the rule in your README in words she can copy verbatim**, and I will have her mirror it. 📌 *Two implementations agreeing on a written rule is maintainable; two repos sharing a file is not.*

## §3 Not in scope
🚫 Re-running any historical table (ruled: no blanket re-run) · 🚫 changing what any existing pin asserts · 🚫 making the runner do more than it does.

## Definition of Done
- [ ] Core runner + driver in `scripts/mutation/` · **README stating the VERDICT RULE as a rule**, and **what `NO RESULT` obliges the reader to do** · what was left out **and why** · ✅ **proven still working from its new home on a real run** · the rule written so @Fern can mirror it verbatim · suite **count** unchanged **and said so** · tsc · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-30): the runner lives in the repo, `scripts/mutation/`; the VERDICT RULE is written as a rule for @Fern to mirror verbatim · **proven from its new home on real runs** · **suite count UNCHANGED: 3634 / 0 normally, and DB-unreachable, 0 failed queries** · tsc 0 (`src`, and the new scripts checked on their own) · 65 = 65 · no migration

## §1 What moved (`smart-scheduler-back/scripts/mutation/`)
| file | job |
|---|---|
| **`verdict.ts`** | **THE decision** (`classify`: parsed FINAL counts ⇒ BITES / SURVIVED / NO RESULT [reason]) **and THE way to run the tests** (`runAndClassify`, a 512 MiB capture) |
| **`run.ts`** | the driver: apply · run · restore byte-for-byte · report. It **measures its own baseline** (a dirty or absent baseline ⇒ no mutation is run), checks the **working-tree checksum** before and after (exits non-zero if it differs), and **DB unreachable + blank LINE token** on every run |
| **`prove.ts`** | **the rule proven on real runs** (five cases), fixtures in a TEMP dir, never in the suite; exits non-zero if any case is wrong |
| **`README.md`** | **THE VERDICT RULE**, written as a rule; **what NO RESULT obliges the reader to do**; usage; what was not moved and why |
- `package.json`: `mutation:run`, `mutation:prove`.

## §2 🔑 THE VERDICT RULE: for @Fern to mirror VERBATIM
**It's the README's section "THE VERDICT RULE", five numbered points + "What NO RESULT obliges the reader to do".**
- It's worded without Bun, TS, file or function names, so it can be copied into any runner unchanged.
- The core: **a verdict only from the parsed final counts · BITES / SURVIVED / NO RESULT [reason] · NO RESULT is never a colour: a timeout is not a bite, an absent summary is not a pass · the baseline measured and itself clean · the capture must not be the limit.**
- **NO RESULT obliges:** fix the reason and re-run until it yields counts, **or** report it as NO RESULT and treat the break as unproven. *"It is probably fine" is not an option.*
- 🚫 **No shared file across repos, as ruled.** What's identical is the rule.

## §3 What was NOT moved, and why
- **The ~100 per-task runners** (`mut364`…`mut507`): each was one task's scaffolding (a hard-coded test list, inline mutations). **The mutations are recorded in each TASK's report, which is where they belong.**
- **Their decision rules, deliberately:** families of them read a missing summary as caught, read `error:` or SIGTERM as a bite, or read the FIRST `N fail`. **Those are the defects the rule ends.** Preserving them would preserve the defect.
- **No historical table re-run** (ruled, TASK-575).

## §4 Proven from its new home, on REAL runs
- **`bun run mutation:prove`: 5 / 5:**
  1. >1 MiB + one failing test ⇒ **BITES** (1 pass / 1 fail, 2,097,729 bytes);
  2. >1 MiB, every test passing ⇒ **SURVIVED**;
  3. a forced overflow ⇒ **NO RESULT [OUTPUT OVERFLOW]**;
  4. killed by the time limit ⇒ **NO RESULT [KILLED (SIGTERM)]**;
  5. no output ⇒ **NO RESULT [NO SUMMARY]**.
- **`bun run mutation:run` on a real mutation set** (two mutations on `item6-backend-gaps-task573.test.ts`, one run, not a table re-run):
  - baseline **10**, measured;
  - **C1** (TASK-573's "check not firing on a fresh move") ⇒ **BITES** (9 / 1);
  - **N0**, a comment-only edit ⇒ **SURVIVED ⚠** (10 / 0), so a real survivor reads as one;
  - both restores byte-identical; **CHECKSUM identical**.

## §5 🔴 Found while moving it: a SECOND way the old runners could lie (fixed)
- **Every old runner ran `bun test` THROUGH A SHELL** (`execSync("bun test …")`). **On Windows the time limit kills the SHELL and leaves `bun` running as an orphan.**
  - Found because the proof's hang case left a live process holding its temp directory (`EBUSY`).
  - A hung mutation run therefore left **tests still running after the runner had moved on**: while the next mutation's edits were in place, or after the files were restored.
- **Fixed:** `bun` is now spawned **directly** (`spawnSync("bun", [...])`, no shell), so the kill reaches the tests. The proof's hang case now cleans up.
- ⚠️ **History:** this could only matter where a run HUNG. No recorded row is a hang (TASK-575's search), so no table changes. **One leftover orphan from my own shell-based proof** still holds a throwaway temp directory (three fixture files; no repo file). I didn't kill processes on the owner's machine.

## §6 Checks
- **Suite count UNCHANGED: 3634 / 0**, and **DB-unreachable 3634 / 0, 0 "Failed query"**. Nothing in `scripts/mutation/` is a `*.test.ts`, and the proof's fixtures live in a temp dir.
- tsc 0 on `src`. `scripts/` is outside the tsconfig, **so the three new files were type-checked on their own (strict): 0.**
- **65 .sql = 65 tags, no migration.** No existing pin or test touched.

⛔ Only you mark this DONE. **Files only; committing is the owner's.**

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30)
Verified by me: **3634 / 0** · tsc 0 · **and I checked the new home exists: `scripts/mutation/` — README.md · prove.ts · run.ts · verdict.ts.**

## 🔑 The tool that checks our tests now checks ITSELF
**`mutation:prove` 5 / 5: >1 MiB fail ⇒ BITES · >1 MiB pass ⇒ SURVIVED · overflow / killed / no output ⇒ NO RESULT [reason].**
🔑 **That is the right recursion, and it is what makes moving it in worth more than a copy-paste** — *a runner in a scratchpad could only be trusted; a runner in the repo can be re-proved by whoever doubts it.*
✅ **And proven on a real set, not only on fixtures:** a TASK-573 row ⇒ BITES, a comment-only edit ⇒ SURVIVED ⚠, **restores byte-identical, CHECKSUM identical.**

## ✅ The rule, worded to travel
**THE VERDICT RULE is its own README section — five points plus "what NO RESULT obliges" — with no Bun, TS or file names, so @Fern can mirror it VERBATIM. No shared file.**
✅ **Exactly as ruled.** 🔑 **Two implementations agreeing on a written rule is maintainable; two repos sharing a file is not.**
✅ **What he did NOT move, and why: the ~100 per-task runners (one task's scaffolding each, their mutations already in the TASK reports) — and DELIBERATELY their decision rules, which are the defects this rule ends.** 🔑 *Leaving the old deciders behind is the point: moving them in would have preserved the thing we just fixed.*

## 🔴 The find that only happened BECAUSE he moved it
**The old runners ran `bun` through a SHELL, so on Windows a time-limit kill killed the shell and left the tests running as an ORPHAN.** ✅ **Fixed — `bun` is spawned directly.**
🔑 **A third distinct way the harness could lie, found by the act of taking it out of the dark.** 📌 **That is the argument for TASK-576 better than the one I wrote: things kept where nobody looks are not reviewed, and not-reviewed is where all three of these lived.**
✅ **Scope kept honest: it matters only for a HUNG run, no recorded row is one ⇒ NO table changes.**
✅ **And he did not kill processes** — one orphan holds a throwaway temp dir, no repo file. ⚖️ **Leave it: it is harmless, it dies with the machine, and killing processes on a shared box is not ours to do on a hunch.**

## ▶️ The cross-repo half
**@Fern mirrors THE VERDICT RULE verbatim into the front repo's own runner home, as her own file.** 🚫 **No shared file. Added to her queue.**
