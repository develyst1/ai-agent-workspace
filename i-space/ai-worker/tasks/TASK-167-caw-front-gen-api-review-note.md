# TASK-167: caw-front — gen:api for the review note and the hand-off reason (REQ-125)
- Source: SPEC-124 § API (paired front, spec-rules §2)
- Owner: FE (Fanta)
- Status: DONE (2026-10-31 01:1x, Silver — § Review) · was REVIEW (Fanta, 2026-10-31) — was: IN_PROGRESS — was: TODO — released 2026-10-31 01:0x, Silver (TASK-166 DONE; its `openapi.json` is final; caw-front clean on a009d2c)
- Depends on: TASK-166 (openapi.json) · REQ-122 front committed (a009d2c) ✓ — caw-front tree clean
- Git: none

## What to do
Closed file list (caw-front): `src/api/schema.d.ts` (by `bun run gen:api` only).
1. `bun run gen:api` against caw-back's new `openapi.json`. The front sends neither new field: the operator's status change needs no note (SPEC-124 D3), and the operator does not hand off. So no other file changes. If `typecheck` or a test fails after `gen:api`, stop and tell me — do not widen the list.

## Definition of Done
From caw-front.
- [ ] 1. `git status --short` → ` M src/api/schema.d.ts` only (base: empty, SA 00:5x on a009d2c)
- [ ] 2. `git diff src/api/schema.d.ts` → only `reason`, `done`, `howToTry` and the error-code text (base: n/a — needs TASK-166's openapi.json)
- [ ] 3. `bun run typecheck` → exit 0 (base: exit 0, SA 00:5x; the probe's patched pair: exit 0)
- [ ] 4. `bun test src` → 0 fail (base: `361 pass · 0 fail`, SA 22:5x on a009d2c's content; the probe's patched pair: exit 0)

## Implementation Notes
Fanta (FE, B), 2026-10-31. `caw-front`, branch `atom`, HEAD `a009d2c` before and after, no git. Before: `git status --short --untracked-files=all | wc -l` → `0`. I ran `bun run gen:api` from caw-back's working-tree `openapi.json` and nothing else; no other file touched, `tsconfig.json` untouched.

**What changed:** `src/api/schema.d.ts` +26 / −20: `reason?: string` (hand-off, REQ-125), `done?: string` and `howToTry?: string` (status review, REQ-125), and the error-code description line reworded in 20 places (the 4 changed lines of the code list repeat per route). Nothing else in the diff.

**DoD (my run)**
1. `git status --short --untracked-files=all` → ` M src/api/schema.d.ts` only ✓
2. `git diff src/api/schema.d.ts` → only `reason`, `done`, `howToTry` and the error-code text ✓
3. `bun run typecheck; echo $?` → `0` ✓
4. `bun test src` → `361 pass · 0 fail`, `Ran 361 tests across 27 files` ✓

Not run (not in this DoD): build, e2e. **UNVERIFIED:** nothing in the front sends or reads the new fields, so only the types are checked.

## Questions

## Review

**2026-10-31 01:1x, Silver — DONE.**
- Re-run by me on caw-front a009d2c + 1 path (` M src/api/schema.d.ts` only): the diff = `reason?` on the hand-off body, `done?` + `howToTry?` on the status body, and the one repeated 409 description gaining `wrong_role · review_note_missing` — nothing else · typecheck exit 0 · `bun test src` → `361 pass · 0 fail` · `gen:api` again → byte-identical (`cmp`), so it is TASK-166's final `openapi.json`.
- tree-fp 01:1x: caw-front `7455b131052e` · caw-back `a8e76ef8bc69`.
