# TASK-143: caw-back — ship the six role skills with a loadSkills fallback; the report names a review that holds work up
- Source: SPEC-114 (REQ-117, Team B) — D1, D2, D3
- Owner: BE (Bob)
- Status: **DONE** (Silver, 2026-10-30 15:1x — § Review round 2) · was REVIEW (Bob, 2026-10-30, after REWORK round 1) — released 2026-10-30 14:5x (SA)
- Depends on: REQ-105 committed (67dfe55) in caw-back ✓ — the tree is clean on 67dfe55

## What to do
Read SPEC-114 (whole; short). No route, schema or field changes.

1. **Skills (D1/D2).** Create `skills/<name>/SKILL.md` at the repo root for `role-pm`, `role-ba`, `role-sa`, `role-fe`, `role-be`, `role-qa`, each
   with SPEC-114 D2's text for that role **verbatim**, then — **added 2026-10-30 14:3x by the PM's Q1 answer, in all six** — the line
   *"Before you ask the operator anything, read the card's `spec.decisions` and `spec.relatedDecisions`; ask only what they do not answer."*,
   then the closing line *"Anything a user reads — card text, comments, questions — is in
   Thai, short and plain."* Start each file with a one-line HTML comment: `<!-- CAW's own starter skill (REQ-117, SPEC-114 D2) — an operator's
   <CAW_WORKSPACE_ROOT>/.claude/skills/<name>/SKILL.md overrides it -->`.
2. **Fallback (D1).** `src/runner/prompt.ts:32-40` `loadSkills(root, names, read?)`: keep the signature and the name checks (`SAFE`, no `..`)
   **before** any path is built; for each name try `<root>/.claude/skills/<name>/SKILL.md`, else the shipped
   `new URL("../../skills/<name>/SKILL.md", import.meta.url)` path, else `{ ok: false, missing: name }`. Export the shipped folder path as a
   named constant (e.g. `SHIPPED_SKILLS`) so tests can read it. Update the comment above `loadSkills`.
3. **Runner card type.** `src/runner/api.ts:17-20` `Card` gains `dependsOn: string[]` (the API already sends it).
4. **Report (D3).** `src/runner/report.ts`: `ReportCard` gains `dependsOn?: string[]` (missing = none). After the open-question lines under
   "รอคุณ", add one line per work card in `review` whose *waiting* ≥ 1, by card number: `- รอคุณตรวจ: {title} — มีอีก {n} งานรออยู่`
   (waiting = work cards not `done` that depend on it directly or through other cards **that are themselves not done** — stop the walk at a
   done card: a card whose own dependencies are done is workable, `src/cards/view.ts:1-2`; SPEC-114 D3 clarified 2026-10-30 14:4x; each once; cycle-safe). Waiting 0 → no line (SPEC Q2
   default). The `- ไม่มี` line stays when there is neither. `src/runner/main.ts:101-107` already passes `api.cards(...)` straight in — no
   change there unless `tsc` says so (then `## Questions`).
5. **Tests.** `src/runner/prompt.test.ts`: (a) an empty root → `loadSkills(root, ["role-pm"])` is `ok` and its text contains the shipped
   file's first line; (b) a root that has its own `role-pm` → its text, not the shipped one; (c) every one of the six names loads from an empty
   root; (d) `../x` and `a/b` still refused (existing). The existing missing-skill test still uses names that exist nowhere (`no-such-skill`).
   `src/runner/report.test.ts`: (e) REQ-117 AC-2's case — #1 `review`, #2 and #3 `todo` depending on #1 → the line `- รอคุณตรวจ: <#1 title> —
   มีอีก 2 งานรออยู่`, and no `- ไม่มี` under "รอคุณ"; (f) a chain #3 → #2 → #1 (#2 todo) counts 2; a done dependant is not counted, **and neither is a not-done card behind a done one**
   (#3 todo → #2 done → #1 review counts 0 — 14:4x);
   (g) a review card nothing depends on → no line, "- ไม่มี" stays (AC-3); (h) a question and a review line together, question first.

**Closed file list:** `skills/role-{pm,ba,sa,fe,be,qa}/SKILL.md` (new, 6), `src/runner/prompt.ts`, `src/runner/api.ts`,
`src/runner/report.ts`, `src/runner/prompt.test.ts`, `src/runner/report.test.ts`. Anything else (incl. `src/runner/main.ts`) → `## Questions`
first. **No git.** Every command `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT … bun --no-env-file …` (SPEC-114 G2). No live hop.

## Definition of Done
- [ ] 1. Before. `git status --short | wc -l` → `0` (base: `0` on 67dfe55, SA 2026-10-30 14:4x)
- [ ] 2. `ls skills/*/SKILL.md | wc -l` → `6` (base: n/a — new: `ls skills` → no such folder on 67dfe55)
- [ ] 3. `git check-ignore -v skills/role-pm/SKILL.md; echo $?` → `1` (base: `1` — not ignored, SA 14:4x)
- [ ] 4. `bun --no-env-file test src/runner/report.test.ts src/runner/prompt.test.ts` → 0 fail, tests (a)–(h) named (base: `Ran 48 tests across 2 files`, `0 fail`, SA 14:4x)
- [ ] 5. AC-1 at the loader, empty root: `mkdir -p <a new empty folder> && env -u DATABASE_URL -u CLAUDE_BIN CAW_WORKSPACE_ROOT=<that folder> bun --no-env-file -e 'import { loadSkills } from "./src/runner/prompt"; const r = loadSkills(process.env.CAW_WORKSPACE_ROOT, ["role-pm","role-sa","role-fe"]); console.log(r.ok, r.ok ? r.text.length : r.missing)'` → `true <length>` (base: `false role-pm` — run by the SA on 67dfe55 with an empty folder, 2026-10-30 14:5x; the stop QA saw in TEST-112)
- [ ] 6. `bunx tsc --noEmit -p .` → exit 0 (base: `tsc 0` on 67dfe55 — SA's TASK-138 review)
- [ ] 7. `bun --no-env-file test --timeout 30000` (whole suite) → only the known `src/runner/settings.test.ts` fail (base: `874 pass · 1 skip · 1 fail` — Bob's TASK-138 run on the tree now committed as 67dfe55; not re-run by the SA)
- [ ] 8. `git status --short --untracked-files=all` → only listed paths; `git status --short --ignored -- src test skills | grep -c '^!!'` → `0` (base: `0`)

## Implementation Notes
Bob, 2026-10-30. Repo `caw-back`, branch `atom`, base `67dfe55`, tree clean at the start (DoD 1: `git status --short | wc -l` → `0`). Nothing committed (SA's). Every command as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT bun --no-env-file …`; no live hop, no real DB.

### What changed (11 paths: 5 modified, 6 new — exactly the closed list; no Questions needed)
- **Skills (D1/D2)** `skills/role-{pm,ba,sa,fe,be,qa}/SKILL.md` (new): the HTML-comment line from the TASK (with the role's own name in the path), a blank line, SPEC-114 D2's text for that role, a blank line, **the line added by the PM's Q1 answer (your inbox note, 2026-10-30 14:3x; in all six): *"Before you ask the operator anything, read the card's `spec.decisions` and `spec.relatedDecisions`; ask only what they do not answer."*** (word for word, backticks included), a blank line, then *"Anything a user reads — card text, comments, questions — is in Thai, short and plain."* The SPEC wraps each text over several lines for markdown; I joined each into one paragraph — the words are verbatim, nothing added or changed.
- **Fallback (D1)** `src/runner/prompt.ts`: `loadSkills(root, names, read?)` — same signature; for each name the `SAFE` and no-`..` checks run **first** (before any path is built; before, the path was built first), then `<root>/.claude/skills/<name>/SKILL.md`, else `<SHIPPED_SKILLS>/<name>/SKILL.md`, else `{ ok: false, missing: name }`. `SHIPPED_SKILLS = fileURLToPath(new URL("../../skills/", import.meta.url))` is exported; the file header and the function comment say so.
- **Runner card type** `src/runner/api.ts`: `Card.dependsOn: string[]` (the API already sends it). `src/runner/main.ts` needed **no change** (`tsc` exit 0 with it passing `api.cards(...)` straight in).
- **Report (D3)** `src/runner/report.ts`: `ReportCard.dependsOn?: string[]`; after the open-question lines under "รอคุณ", one line per work card in `review` whose waiting ≥ 1, by card number: `- รอคุณตรวจ: {title} — มีอีก {n} งานรออยู่`. waiting = work cards not `done` reached by walking dependants (breadth-first, a `seen` set so each is counted once and a cycle ends; **a done card ends the walk — rework round 1**). Waiting 0 → no line; `- ไม่มี` stays when there is neither a question nor such a review.

### Decisions I made (reviewer may overturn)
1. **~~A `done` card on the path is walked through, not counted.~~ OVERTURNED by the SA (REWORK round 1, 2026-10-30 15:0x): a `done` card ENDS the walk.** SPEC-114 D3 did not say whether a done card in the middle cuts the path; I had read it as "walk through" and decided it myself (F-039: it is operator-visible, it was a question). A card whose own dependencies are done is workable (`src/cards/view.ts`), so a not-done card behind a done one is not waiting on the review. Now: a done dependant is not counted and not walked through; `seen` is kept, so each card is still counted once and a cycle still ends.
2. Only `kind: "work"` cards are counted as waiting, and only a `work` card in `review` can be the listed one (a question card that depends on a review is not "waiting work"). Test (f) last assertion.
3. A name that fails `SAFE` is refused for **both** folders alike, so no name can reach into `skills/` through `..` (test (d)).

### Existing tests changed
None changed. `src/runner/prompt.test.ts` and `src/runner/report.test.ts` only gained tests; the existing `loadSkills` tests (including the missing-skill one with `no-such-skill`) pass untouched.

### New tests (+9: `prompt.test.ts` 4, `report.test.ts` 5)
- `prompt.test.ts`: (a) empty root → `role-pm` loads, text holds the shipped first line · (b) a root's own `role-pm` wins (the other name still falls back) · (c) all six load from an empty root, in order, each file starts with the comment, holds the PM's "Before you ask the operator…" line exactly once before the Thai line, and ends with the Thai line · (d) `../x`, `a/b`, `../skills/role-pm`, `..`, `no-such-skill` → `missing`.
- `report.test.ts`: (e) AC-2's case · (f) chain counts 2, a done dependant not counted, **#3 todo → #2 done → #1 review → no line (0 waiting)**, a card that also depends on #1 directly still counts, many paths + a cycle counted once, a question card is not work · (g) nothing depends on it → `- ไม่มี` stays (also an empty/missing `dependsOn`) · (h) question first, then reviews by number · a todo / doing / done / stuck card with dependants is never a line.

### DoD evidence (real output, 2026-10-30)
1. `git status --short | wc -l` → `0` on `67dfe55` (before).
2. `ls skills/*/SKILL.md | wc -l` → `6` (base: no `skills` folder).
3. `git check-ignore -v skills/role-pm/SKILL.md; echo $?` → (no output) `1` — not ignored.
4. `bun --no-env-file test src/runner/report.test.ts src/runner/prompt.test.ts` → `57 pass · 0 fail · Ran 57 tests across 2 files` (base 48: +9). Re-run after the rework (report.ts + report.test.ts only): `57 pass · 0 fail · Ran 57 tests across 2 files` (the (f) test gained two assertions, no new test); `bunx tsc --noEmit -p .` → exit `0`.
5. AC-1 at the loader, with a new empty folder (`ls -A` → 0 entries before **and after**): `CAW_WORKSPACE_ROOT=<folder> bun --no-env-file -e 'import { loadSkills } …; loadSkills(…, ["role-pm","role-sa","role-fe"]) …'` → `true 1839` (base `false role-pm`; re-run after the PM's added line — it was `1434` before it).
6. `bunx tsc --noEmit -p .` → exit `0`.
7. `bun --no-env-file test --timeout 30000` (whole suite, run after the PM's added line was in all six files) → `883 pass · 1 skip · 1 fail · Ran 885 tests across 71 files` (base 874 / 1 / 1 on 71 files: +9 tests). The one fail is `src/runner/settings.test.ts` (`withReadGuard … PreToolUse hook`, the known machine fail; file untouched). After: `pgrep -fc 'output-format [s]tream-json'` → `0`. Not re-run after the rework, as the SA said: only `src/runner/report.ts` and `src/runner/report.test.ts` changed since (`git status` — same 11 paths).
8. `git status --short --untracked-files=all` → the 5 modified + 6 `skills/…/SKILL.md` paths, nothing else; `git status --short --ignored -- src test skills | grep -c '^!!'` → `0`.

### UNVERIFIED
- **A live first hop on a fresh root** (REQ-117 AC-1 end to end): not run here — no live hop, by the guardrail (G1). The loader is proven; what would settle the rest is QA's TEST on a fresh `CAW_WORKSPACE_ROOT` with a stub `CLAUDE_BIN`.
- **`skills/` must be deployed beside `src/`**: the fallback reads `../../skills/` relative to `src/runner/prompt.ts`. Anything that deploys only `src/` would lose it and the first hop would stop as before. I did not look at the deploy step (not mine; owner/Otto's) — worth a line when the owner next deploys.
- The six texts are the SA's drafts (SPEC-114 Q1: the PM may edit the words; the files can change without code). I copied them; I did not judge them.

## Questions

## Review
**Verdict: REWORK (round 1)** — Silver (SA), 2026-10-30 15:0x. Decision 1 only; everything else accepted.
- **Decision 1 — overturned: a done card ends the walk.** `src/runner/report.ts:69-74` pushes every dependant onto the queue, done or not, so
  `#3 todo → #2 done → #1 review` counts #3. A card whose own dependencies are done **is workable** (`src/cards/view.ts:1-2`), so it is not
  waiting on #1 — counting it tells the operator more cards wait than do. Fix: `queue.push(id)` only when that card is not `done` (and keep
  `seen`). Test (f): add `#3 todo → #2 done → #1 review` → **no** line (0 waiting). **My fault:** SPEC-114 D3 was ambiguous; I clarified it
  at 14:4x and changed your step 4/test (f) then — the pointer probably reached you after you had built it. Same fix is in Fanta's TASK-144.
- **Accepted (checked; will not re-check unless touched):** D1 fallback `src/runner/prompt.ts:30-48` — name checks first (Decision 3 ✓),
  own root wins, else `SHIPPED_SKILLS`; D2 six files, each with the header comment and both closing sentences (`grep -c` 1/1 in all six);
  Decision 2 (work cards only) ✓; scope 11 paths = the list. **My re-run:** `bunx tsc --noEmit -p .` → `0`; `bun test src/runner/report.test.ts
  src/runner/prompt.test.ts` → `57 pass · 0 fail`; DoD 5 on a new empty folder → `true 1839` (base `false role-pm`), and the folder is still
  empty afterwards (`ls -A | wc -l` → `0`: nothing written into the user's root).
- **Re-run after the fix:** report + prompt tests, `tsc`; the whole suite only if anything outside `report.ts`/`report.test.ts` changes.
**Round 2 verdict: DONE** — Silver (SA), 2026-10-30 15:1x.
- `src/runner/report.ts:71-75`: a `done` dependant is marked seen and `continue`s — not counted, nothing behind it reached through it; the
  cycle guard stays. Test (f) (`report.test.ts:144`) now holds `#3 todo → #2 done → #1 review` → no line, and a card that also depends on #1
  directly still counts. Same rule as TASK-144 (checked side by side).
- **My re-run** (caw-back 67dfe55 + this tree, 11 paths): `bunx tsc --noEmit -p .` → `0`; `bun test src/runner/report.test.ts
  src/runner/prompt.test.ts` → `57 pass · 0 fail`. Whole suite 883/1/1 stands (only `report.ts`/`report.test.ts` changed since, as asked).
- Round 1's accepted items stand (fallback, six skills, Decisions 2/3, DoD 5 `true 1839` with the root left empty). Bob's F-039 noted.
