# TASK-145: blueprint-back — `requirements` in every part's context, v1 + v2 (REQ-118)
- Source: SPEC-115
- Owner: BE (Jason)
- Status: DONE (2026-10-30 17:28, Sober — § Review)
- Depends on: **REQ-115 (TASK-134) committed (`93249a7`)** ✓ in blueprint-back, 2026-10-30 16:4x (F-013)

## What to do
Read SPEC-115 first (contract, consumers). Line numbers are from `f10f8cb`; re-find them with `grep` on the REQ-115 commit.
1. `src/seam/context.ts`:
   - Add `requirements: Part[]` to `PartContext` (:14-18).
   - In `contextIn` (:32), compute `spec.parts.filter((p) => p.kind === "requirement").sort((a, b) => compareKeys(a.key, b.key))` and return it beside `relatedDecisions` (:92-93).
   - One comment line citing SPEC-115 / REQ-118.
2. `src/http/routes/seam.ts:16-34` `PartContextSchema`: add `requirements: z.array(PartSchema)`. `SpecContextSchema` (:55) inherits it.
3. Re-emit `openapi.json` (the repo's usual command, as TASK-113/117 did).
4. `test/seam/spec-v2.test.ts:144`: add `"requirements"` to the sorted key list. No other existing test changes. If one fails, stop and ask in `## Questions`.
5. New `test/seam/requirements.test.ts`. Build the spec the way `test/seam/related-decisions.test.ts:14-42` does (`applyChangeSet`, `testDb`). Use the **8 requirements of TEST-106 phase 2**: titles and order from `tests/harness/test-106/phase2/hand.mjs:10-15` in the workspace, each `body.text` = the line of `tests/harness/test-106/spec.txt` it names (`lines[n]`). Copy the texts into the test; never import across repos. Cases:
   - (a) AC-1, v2: hand-only spec of the 8. `specContext` for **REQ-001** and for **REQ-005** each has `requirements` = 8 parts, keys REQ-001…REQ-008 in order, each `title` and `body.text` equal to what was typed.
   - (b) AC-1, mixed: the 8 plus TEST-106's `flow` (work/steps/screen). `specContext` for **WRK-001** and for **SCR-001** has the same 8. Its `relatedDecisions` and `flows` are unchanged from a run without the 8.
   - (c) A1, v1: confirm a version (as `related-decisions.test.ts` does), then `partContext(db, pid, 1, "WRK-001").requirements` has the 8.
   - (d) AC-5: interview-style spec with no requirement → `requirements` is `[]`, and every other field deep-equals what `contextIn` gave before. Run the same fixture through the old fields.
   - (e) AC-4: `part.update` REQ-003's text, then the next `specContext` (any key) shows the new text, and `revision` went up by 1.
   - (f) sort: requirements added as REQ-010 before REQ-002 come out REQ-002, REQ-010. Add 10 requirements so that keys reach REQ-010.

Closed file list: `src/seam/context.ts` · `src/http/routes/seam.ts` · `openapi.json` · `test/seam/spec-v2.test.ts` (line 144 only) · `test/seam/requirements.test.ts` (new). Every `bun` command is prefixed `DATABASE_URL=pglite:memory`. No gateway. No git.

## Definition of Done
- [ ] 1. Before: `git status --short` → empty, `git log --oneline -1` → `93249a7 …` (base: empty, `93249a7`, Sober 17:07)
- [ ] 2. `grep -c "requirements" src/seam/context.ts src/http/routes/seam.ts openapi.json` → ≥ 1 each (base: `git grep -n requirements 93249a7 -- src/seam src/http/routes/seam.ts openapi.json` → no hits, Sober 16:5x)
- [ ] 3. `bun test test/seam/requirements.test.ts` → (a)–(f) pass, real output pasted (base: n/a — new: the file does not exist)
- [ ] 4. `bun test test/seam` → 0 fail (base: `59 pass / 0 fail`, 8 files, on `93249a7`, Sober 16:5x — your new file and the line-144 pin change it)
- [ ] 5. `bun test --timeout 30000` → 0 fail, counts pasted (base: `329 pass / 16 skip / 0 fail`, 345 tests / 45 files, on `93249a7`, Sober 17:07)
- [ ] 6. `bunx tsc --noEmit` → exit 0 (base: exit 0 on `93249a7`, Sober 16:5x)
- [ ] 7. `git status --short` → exactly the 4 paths of the file list + ` ?? test/seam/requirements.test.ts` (base: empty on `93249a7`)
- [ ] 8. `git check-ignore -v test/seam/requirements.test.ts` → exit 1, no output (base: exit 1, Sober 16:5x) — the one new path
- Probe (SPEC-115 § API, 17:00, on `93249a7`): the change breaks only `test/seam/spec-v2.test.ts:144` (step 4); tsc 0. Expect nothing else to fail — if anything does, stop and ask.

## Implementation Notes
(Jason, BE — 2026-10-30. `bun` runs prefixed `DATABASE_URL=pglite:memory`, in `blueprint-back` at `93249a7`. No git, no gateway.)

**Changed (closed list only):**
- `src/seam/context.ts` — `PartContext.requirements: Part[]`; `contextIn` returns `spec.parts.filter(kind === "requirement").sort(compareKeys)` beside `relatedDecisions`, one comment citing SPEC-115 / REQ-118. v1 and v2 share it.
- `src/http/routes/seam.ts` — `PartContextSchema` + `requirements: z.array(PartSchema)`; `SpecContextSchema` inherits. `openapi.json` re-emitted (contract emitted).
- `test/seam/spec-v2.test.ts` line 144 only: `"requirements"` added to the sorted key list.
- New `test/seam/requirements.test.ts` (6 tests): the 8 requirements of TEST-106 phase 2 — titles from `phase2/hand.mjs:10-15`, texts the lines of `test-106/spec.txt`, copied in; the flow is TEST-106's, as in `related-decisions.test.ts`.
**Decided myself:** a requirement anchor lists itself too (REQ-001's context carries REQ-001…008) — the TASK's (a) asks for exactly 8. No other existing test changed; none failed.

**DoD evidence:**
1. Before: `git status --short` → empty; `git log --oneline -1` → `93249a7 feat: each gateway call uses a model that fits the task …`.
2. `grep -c "requirements"` → `src/seam/context.ts:3` · `src/http/routes/seam.ts:1` · `openapi.json:4`.
3. `bun test test/seam/requirements.test.ts --timeout 30000` → `6 pass / 0 fail / 30 expect()`: (a) v2, only the 8: REQ-001 and REQ-005 each carry REQ-001…008 in order, title and text as typed · (b) 8 + flow: WRK-001 and SCR-001 carry the same 8; `flows` and `relatedDecisions` equal those of a project without them (and are non-empty) · (c) v1 after a label: WRK-001 carries the 8 · (d) no requirement: `[]` for WRK-001/SCR-001/STEP-002/DEC-004 (v2) and SCR-001 (v1), and every other field (part, neighbours, decisions, flows, questions, relatedDecisions, More — per-project ids left out) equals the project with the 8 · (e) `part.update` REQ-003's text → next context (STEP-002) shows it, REQ-004 untouched, `revision` = before + 1 · (f) 10 requirements → REQ-001…REQ-010 in order, also when the parts arrive reversed (`contextIn` fed directly).
4. `bun test test/seam --timeout 30000` → `65 pass / 0 fail` (9 files; base 59 + 6).
5. `bun test --timeout 30000` → `335 pass / 16 skip / 0 fail` (351 tests, 46 files; 329 + 6).
6. `bunx tsc --noEmit` → exit 0.
7. `git status --short` → ` M openapi.json · M src/http/routes/seam.ts · M src/seam/context.ts · M test/seam/spec-v2.test.ts · ?? test/seam/requirements.test.ts`. `git diff --stat openapi.json` → `16 +++…-` (15 insertions, 1 deletion).
8. `git check-ignore -v test/seam/requirements.test.ts` → no output, exit 1.

UNVERIFIED — CAW's client reading `requirements`, and TEST-106's live card check (Team B / QA); the front's `gen:api` if it mirrors `openapi.json` (F-036) is not in this TASK.

## Questions

## Review
**DONE** — Sober, 2026-10-30 17:28. Re-run by me on blueprint-back `93249a7` + this TASK's 5 paths, `DATABASE_URL=pglite:memory`:
- Scope: `git status --short` = ` M openapi.json · M src/http/routes/seam.ts · M src/seam/context.ts · M test/seam/spec-v2.test.ts · ?? test/seam/requirements.test.ts` = the closed list. `check-ignore` on the new test → exit 1.
- Diff = SPEC-115 § Flow / § API: `contextIn` adds `requirements` = `kind === "requirement"` sorted by `compareKeys`, beside `relatedDecisions`; `PartContextSchema` + `requirements: z.array(PartSchema)`; openapi adds `requirements` (array of `Part`, required) to both `PartContext` and `SpecPartContext`, nothing else; spec-v2 line 144 only.
- `bun test test/seam/requirements.test.ts` → 6 pass / 0 fail / 30 expect · `bun test test/seam` → 65/0 (9 files) · `bun test --timeout 30000` → 335 pass / 16 skip / 0 fail (351 tests, 46 files) · `bunx tsc --noEmit` → exit 0. Same as Jason's.
- Test (a)–(f) cover the TASK's cases; the 8 titles and texts match `tests/harness/test-106/phase2/hand.mjs:10-15` and `spec.txt` lines 1–8 word for word (read side by side).
- "Anchor lists itself" = SPEC-115 § API `[SA-decided]`, not a new decision.
- Nit, not a REWORK: two comment lines (type + `contextIn`) instead of one. Both cite SPEC-115 / REQ-118 and are kept.
- Releases TASK-146 (`openapi.json` re-emitted).
