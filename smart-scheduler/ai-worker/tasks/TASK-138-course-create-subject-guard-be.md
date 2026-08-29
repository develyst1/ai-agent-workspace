# TASK-138: Refuse creating a mixed-program course (BE guard)
- Source: SPEC-045 (REQ-054), Part 1
- Status: DONE (SA-reviewed Sober 2026-08-17)

## Review
**PASS ✅ (Sober 2026-08-17).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **488/0**. `validation.ts:152` refine
= `every(s => !s.subjectId || s.subjectId === d.subjectId)` with the REQ's Thai message; service `Set(...).size !== 1`
assert covers the uniform-chain path too. Boundary + service (REQ-053 idiom), voucher/single/trial untouched (AC-4).
Faithful. DONE — pairs with TASK-139 (FE) to close the create hole.
- Assignee: @Jason (BE)
- Depends on: none

## What to do (smart-scheduler-back)
Close the create-mode hole: `createCoursePackage` takes per-row `sessions[].subjectId`
(`scheduler.service.ts:1035-1046`, `s.subjectId ?? input.subjectId`), so a request can create a course
whose sessions carry different programs. Guard it at two layers (mirrors REQ-053's boundary+service style):
1. **Zod refine** on `createCoursePackage` (`validation.ts:125-148`): every present
   `sessions[i].subjectId` must equal the course-level `subjectId`. Message = REQ-054 refusal copy
   `ทุกคาบในคอร์สต้องเป็นกิจกรรมเดียวกัน` / `All sessions in a course must have the same subject.`
2. **Service assert** in `createCoursePackage` after `plannedSessions` is built (`~:1046`): assert
   `new Set(plannedSessions.map(s => s.subjectId)).size === 1` before the insert loop; else throw the
   same `badRequest`.

## Definition of Done
- [ ] Creating a course with a session whose `subjectId` differs from the course subject is **refused**
      (both at the zod boundary and, defensively, in the service). (AC-2)
- [ ] Uniform sessions (or no per-row subjectId) still create successfully. (no regression)
- [ ] SINGLE_SESSION / VOUCHER / FIRST_TRIAL creation unaffected (guard is course-create only). (AC-4)
- [ ] Unit tests: mixed rows rejected · uniform rows pass · omitted per-row subjectId passes.
- [ ] `bunx tsc --noEmit` 0 · `bun test` green.

## Implementation Notes / Questions
**Files:** `src/validation.ts` (second `.refine` on `createCoursePackage`) · `src/services/scheduler.service.ts`
(assert after `plannedSessions` is built, before the insert loop) · `src/validation.test.ts` (new, 5 tests).

- **Boundary:** `!d.sessions || d.sessions.every(s => !s.subjectId || s.subjectId === d.subjectId)` — a per-row
  override may *repeat* the course subject (that's what the FE sends today) but never introduce a second one.
  Message = REQ-054's copy `ทุกคาบในคอร์สต้องเป็นกิจกรรมเดียวกัน`.
- **Service:** `new Set(plannedSessions.map(s => s.subjectId)).size !== 1` → same `badRequest`. Covers the
  uniform-chain branch too, so whatever built the plan, one course = one program.
- **Untouched:** SINGLE_SESSION / VOUCHER / FIRST_TRIAL creation (different schemas + paths) — AC-4.
- **Verified:** `bunx tsc --noEmit` **0** · `bun test` **488 pass / 0 fail** (all three of this batch together).
  Tests: mixed rows rejected (with the message) · all-rows-repeat-the-subject passes · no per-row `subjectId`
  passes · no `sessions[]` at all passes · the pre-existing session-count refine still fires.
- No questions.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-138 | scheduler-back (BE): refuse creating a mixed-program course — zod refine + service assert (all `sessions[].subjectId` == course subject); voucher/single/trial unaffected | SPEC-045 (REQ-054) | ✅ **DONE (SA-reviewed Sober 2026-08-17)** — reproduced tsc 0 · 488/0; refine + service assert faithful, voucher/single/trial untouched (AC-4). Pairs with TASK-139 (FE) to close the create hole. · _prior:_ 🔎 REVIEW (Jason 2026-08-17 — zod refine: a per-row `subjectId` may repeat the course subject, never introduce a second; service assert on `plannedSessions` covers the uniform-chain branch too. REQ-054's copy `ทุกคาบในคอร์สต้องเป็นกิจกรรมเดียวกัน`. tsc 0 · **488/0**, new `src/validation.test.ts` (5). No questions.) | Jason | — |
```
