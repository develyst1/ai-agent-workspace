# TASK-145: blueprint-back — `requirements` in every part's context, v1 + v2 (REQ-118)
- Source: SPEC-115
- Owner: BE (Jason)
- Status: TODO, ON HOLD until REQ-115 is committed in blueprint-back (2026-10-30 15:3x, Sober)
- Depends on: **REQ-115 (TASK-134) committed (<hash>)** in blueprint-back (F-013: TASK-134's 11 paths, incl. `openapi.json`, are in the same tree). The SA fills the hash, re-measures the DoD bases on it and releases.

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
- [ ] 1. Before: `git status --short` → empty, HEAD = REQ-115's commit (base: n/a — new: that commit does not exist yet; on `f10f8cb` tree was empty, Sober 15:2x)
- [ ] 2. `grep -c "requirements" src/seam/context.ts src/http/routes/seam.ts openapi.json` → ≥ 1 each (base: `git grep -n requirements f10f8cb -- src/seam src/http/routes/seam.ts openapi.json` → no hits, Sober 15:3x)
- [ ] 3. `bun test test/seam/requirements.test.ts` → (a)–(f) pass, real output pasted (base: n/a — new: the file does not exist)
- [ ] 4. `bun test test/seam` → 0 fail (base: on `f10f8cb` included in the full run, 0 fail; re-measured at release)
- [ ] 5. `bun test --timeout 30000` → 0 fail, counts pasted (base: `320 pass / 16 skip / 0 fail` on `f10f8cb`, Sober 15:2x; REQ-115 adds tests, so re-measured at release)
- [ ] 6. `bunx tsc --noEmit` → exit 0 (base: exit 0 on `f10f8cb`, Sober 15:2x)
- [ ] 7. `git status --short` → exactly the 5 paths of the file list (base: n/a — new: written at release)

## Implementation Notes

## Questions

## Review
