# TASK-155: Bulk teacher↔subject link — `teacher-subjects:link-all` (REQ-058 req 6, AC-9-10) (BE)

- Source: SPEC-055 (REQ-058 requirement 6)
- Status: DONE (SA-reviewed Sober 2026-08-22) — closes REQ-058 AC-9/10; owner runs on both boxes → AC-2/3 → DELIVERED

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-22).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **600/0** (bulk-link
8/0, +8). Read the code:
- **Pure `lib/bulk-link-plan.ts`** — filters `!archived` teachers × `active` subjects, cross-product minus the
  existing pair set, with a per-teacher created/skipped tally. Thin script loads the three row sets, prints the
  plan, dry-run rolls back / `--commit` does one `insert(...).onConflictDoNothing()`.
- **Idempotent by construction** — the composite PK `(teacher_id, subject_id)` means a re-run inserts 0; the script
  also short-circuits `if (!plan.toCreate.length) return`. Pinned by the "finished pass re-runs to ZERO" test.
- **The three easy-to-invert cases are each pinned:** archived teacher gets nothing (`t3`), inactive subject gets
  nothing (`s3`), **paused teacher IS linked** — and note the design is even cleaner than specced: `TeacherRow`
  carries only `archived`, so teacher inclusion keys on archived alone and a paused teacher is included because the
  plan never consults `active`. Correct.
- **No student/parent data read** — only `teachers`/`subjects`/`teacher_subjects`; console is staff/catalogue names
  + counts, safe to paste back. Dry-run default, one tx, no DDL, insert-only (never unlinks).

**Verdict: DONE.** Closes AC-9/AC-10. Owner runs `teacher-subjects:link-all` (dry-run then `--commit`) on **both
boxes**; then every teacher's dropdown lists all 19 programs ⇒ **AC-2/AC-3 close ⇒ REQ-058 DELIVERED.**

## Answer to Jason's Q1
**Agreed — keep this tool insert-only.** If a future REQ needs the *real* "who actually teaches what" matrix, the
honest path is a **staff-facing unlink in the product**, not a smarter bulk command — a tool that both mass-links
and mass-unlinks is one fat-finger from wiping a roster somebody set on purpose. This command adds; removal, if ever
wanted, is a separate deliberate surface. Recorded so it isn't "improved" into a two-way sync later.
- Assignee: @Jason (BE)
- Depends on: none. BE-only. **This is the last thing between REQ-058 and DELIVERED** — it makes the 19 live
  programs selectable (AC-2/AC-3).

## Why (one paragraph)

The 19 programs are live on both boxes, but a program only appears in the booking dropdown once a teacher is linked
to it (`teacher.subjectOptions`). The owner chose **every teacher can teach every program** (24 × 19 = 456 links).
`subjects:add --teacher` links one pair per run, so 456 lines is a trap — a half-done pass leaves a roster that
*looks* configured. This is the one bulk command that does it safely and idempotently.

## What to build (smart-scheduler-back)

A script `scripts/link-all-teacher-subjects.ts`, wired as `"teacher-subjects:link-all"` in `package.json`, same
house pattern as `db:reset` / `subjects:add`:

1. **Load the target set:** teachers where **`archived = false`** (offboarded teachers are hidden from bookings —
   linking them is dead config; **paused `active=false` teachers ARE included** — pause is availability, not
   capability); subjects where **`active = true`**.
2. **Dry-run by default:** in one transaction, compute the full cross-product, print the summary
   — `N teachers × M subjects = N·M links · would-create X · already-present Y` — then **throw
   `__dry_run_rollback__`** (same sentinel as `db-reset.ts`). Nothing written without `--commit`.
3. **`--commit`:** `insert(teacherSubjects).values(pairs).onConflictDoNothing()` — the composite PK
   `(teacherId, subjectId)` makes it idempotent; a second run creates 0 and never duplicates.
4. **Console:** the summary counts + a short per-teacher `nickname: +created / =skipped` tally (staff/catalogue
   names, not student PII — safe to print). This is AC-10's evidence.
5. **One transaction · no DDL.**

### Pure helper (testable without a DB)

Factor the matrix decision into a pure function, e.g.
`planBulkLinks({ teachers, subjects, existingPairs })` → `{ toCreate: Pair[], skipped: Pair[], teacherCount, subjectCount }`,
so "cross-product minus what already exists" is unit-tested with fixtures (no database).

## Definition of Done

- [ ] Dry run prints `N × M`, would-create, already-present, and writes **nothing** (count unchanged).
- [ ] `--commit` links every non-archived teacher to every active subject; a second `--commit` run creates **0**
      (idempotent) and does not error.
- [ ] Archived teachers get **no** links; inactive subjects get **no** links — pinned by a unit test on the pure
      helper (a fixture with one archived teacher + one inactive subject that must be absent from `toCreate`).
- [ ] Pure-helper unit tests: full cross-product on empty existing · partial existing → only the gaps in
      `toCreate` · archived/inactive excluded.
- [ ] `bunx tsc --noEmit` 0 · `bun test` green.
- [ ] You run **nothing** against a DB. **Runsheet note for the owner:** run on **BOTH `sid` and `uat`** (dry-run
      then `--commit` on each) — this is idempotent config, not the divergent-data import, so both boxes is correct
      and there is no duplicate hazard.

## Notes / Questions

(Jason fills in. After the owner runs this on both boxes, every teacher's booking dropdown lists all 19 programs ⇒
REQ-058 AC-2/AC-3 close and it goes DELIVERED. The "open by default, pruned in the product later" consequence is
the owner's deliberate choice — recorded in SPEC-055, not a defect.)

## Implementation Notes
**Files:** `src/lib/bulk-link-plan.ts` (new, pure) · `src/lib/bulk-link-plan.test.ts` (new, 8 tests) ·
`scripts/link-all-teacher-subjects.ts` (new) · `package.json` (`teacher-subjects:link-all`).

- **Target set exactly as specced:** teachers with `archived = false` (an offboarded teacher is hidden from
  bookings, so a link is dead config) × subjects with `active = true`. **A paused (`active:false`) teacher IS
  linked** — pause is availability, not capability, and leaving them out would silently break their dropdown the
  moment staff un-pause them. There is a test pinning each of those three cases, because they are easy to get
  backwards.
- **Dry-run by default:** the whole matrix is computed and printed inside a transaction that is then rolled back
  via the same `__dry_run_rollback__` sentinel as `db:reset`. Nothing is written without `--commit`.
- **`--commit`:** one `insert(...).values(pairs).onConflictDoNothing()`. The composite PK
  `(teacher_id, subject_id)` is what makes a re-run create exactly **0** — idempotent by construction, not by
  carefulness. A finished pass re-runs to zero (tested).
- **Insert-only, no DDL.** Nothing is ever *unlinked* by this tool. Pruning who really teaches what is staff work
  in the product — which is the trade-off the owner accepted when he chose open-by-default, and worth remembering
  when someone later asks why a teacher lists 19 programs.
- **Console (AC-10 evidence):** `ครู N × โปรแกรม M = N·M ลิงก์` + `จะสร้างใหม่ X · มีอยู่แล้ว Y` + a per-teacher
  `nickname: +created / =skipped` tally. Staff/catalogue names only — **no student or parent row is read by this
  command at all**, so the output is safe to paste back.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **600 pass / 0 fail** (71 files; +8). Tests: full
cross-product on empty · partial existing → only the gaps · finished pass re-runs to 0 · archived teacher absent ·
inactive subject absent · **paused teacher present** · empty sides don't throw · the summary/tally text.

⚠️ **I ran nothing against a database.**

### Runsheet for the OWNER — run on **BOTH** boxes
```
bun run teacher-subjects:link-all            # sid — DRY RUN, read the numbers
bun run teacher-subjects:link-all --commit   # sid
bun run teacher-subjects:link-all            # uat — DRY RUN
bun run teacher-subjects:link-all --commit   # uat
```
Expect roughly `ครู 24 × โปรแกรม 19 = 456 ลิงก์` on the first dry run (the exact numbers are whatever each box
holds). **Both boxes is correct here** — this is idempotent config, not the divergent-data import, so there is no
duplicate hazard. After it lands, every teacher's booking dropdown lists all 19 programs ⇒ AC-2/AC-3.

## Questions
- Q1 (non-blocking, for whoever fields it later): after this, `teacher_subjects` no longer means "who can
  actually teach this" until staff prune it — Porter recorded that as the owner's deliberate choice. If a future
  REQ wants the real matrix, the honest path is a **staff-facing screen to unlink**, not a smarter bulk command;
  this tool should stay insert-only so it can never remove a link somebody set on purpose.

  > answer: (Sober)
