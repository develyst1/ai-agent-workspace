# TASK-151: `db:reset` — clean-slate data reset (BE)
- Source: SPEC-052 (REQ-040 design; go-live blocker for REQ-055)
- Status: DONE (SA-reviewed Sober 2026-08-19); owner-run on sid → uat is the go-live wipe (Porter sequences)

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-19) — a mass-delete tool, reviewed as such.** Reproduced: `bunx tsc --noEmit` **0** ·
`bun test` **554/0** (12 new). Read every safety edge:
- **Dry-run cannot write, by construction:** in the tx it counts `before`, then **throws `DRY_RUN_ROLLBACK` BEFORE the
  delete loop** → the whole tx rolls back, no `DELETE` ever executes. (`scripts/db-reset.ts:51` throws, `:54` deletes —
  correct order.)
- **`--commit`:** explicit `delete from "<t>"` per table in the CLEAR FK-order — **never `TRUNCATE CASCADE`**; table
  names come from the `CLEAR_TABLES` **constant** (no injection). Then `canCommit(before, after)` requires **KEEP
  unchanged AND every CLEAR = 0** → any mismatch **throws → rollback**, nothing deleted. One transaction throughout;
  a mid-delete failure rolls the lot back.
- **No DDL** → schema + all 3 ledgers untouched → safe on `uat` regardless of the ledger state.
- **FK/keep re-verified against `schema.ts`** (not the 08-11 memory): no KEEP table FK-references a CLEAR table; the one
  new edge since 08-11 (`course_packages.subject_id`, my `0018`) is CLEAR→KEEP → deleted-first, order still holds. Good.
- **Idempotent** (second `--commit` → 0 deletes, both assertions pass). **Console counts-only** — a test asserts no Thai
  word-runs so PII can't creep in. `canCommit` + the keep/clear partition unit-tested.
- **Not run against any DB** (owner's to execute) — correct.
- **Verdict: DONE.** The go-live wipe tool exists, and it's the safe one. Owner-run: `db:backup` → `db:reset` (dry-run,
  read the before→after) → `--commit` (KEEP identical, CLEAR=0) → import; rehearse on **sid**, prove, then **uat**.
- Assignee: @Jason (BE)
- Depends on: none — 🔴 **go-live critical: the single blocker between the customer and their data**

## Context (why)
Go-live sequence is **backup → wipe → import**; the wipe tool never got built (REQ-040 was authorized
2026-08-11 but the task was never cut). This is the owner-run, **dry-run-default** reset that clears the
customer's test/demo data while keeping teachers + subjects + config. Runs on **both sid and uat, sid first**.
🔴 **The team NEVER runs this against a real DB** — the owner runs it; you ship the script + he reads back the
counts. Mass delete on a real DB → the safety model below is non-negotiable.

## What to build (smart-scheduler-back — `scripts/db-reset.ts` + `db:reset` in package.json)
1. **Re-verify the keep/clear split against `src/db/schema.ts` FIRST** — confirm **no KEEP table
   FK-references a CLEAR table** (so clearing can't cascade into config). If the schema now disagrees with the
   08-11 list, **stop and flag via SA** — do not reorder blindly.
   - **KEEP:** `teachers`, `subjects`, `teacher_subjects`, `badge_types`, `badge_values`, `app_settings` (+
     schema + all 3 ledgers — never touched).
   - **CLEAR (delete rows), FK-restrict order:** `booking_badges → notification_outbox → bookings →
     course_packages → vouchers → students → parents → freelance_budgets → teacher_link_requests →
     line_link_sessions → job_runs`.
2. **Dry-run by DEFAULT:** print a per-table **count table** (before), assert the **KEEP counts are
   unchanged** (trivially true in dry-run — the point is the preview + the shape), then **ROLLBACK** — write
   nothing. No DB connection is opened for anything but the read + the rolled-back tx.
3. **`--commit`:** ONE transaction → **explicit `DELETE`** per table in the FK order (never `TRUNCATE
   CASCADE`) → **re-count and assert KEEP unchanged AND every CLEAR table = 0** → `COMMIT`; any failed
   assertion → **`ROLLBACK`** (nothing deleted).
4. **Idempotent:** a second `--commit` deletes 0, KEEP intact, and says so.
5. **Schema + ledgers untouched** (no DDL). **Console prints counts only** (no PII).

## Definition of Done
- [ ] `bun run db:reset` (dry-run) prints the per-table count table + KEEP-assert, writes nothing.
- [ ] `--commit` deletes CLEAR tables to 0 in FK order in one tx; KEEP counts identical before/after; asserts
      before COMMIT and ROLLBACKs on any mismatch.
- [ ] Second `--commit` is a no-op (idempotent); schema + 3 ledgers untouched.
- [ ] FK/keep split re-verified against `schema.ts` (no KEEP→CLEAR FK); flagged if the schema disagrees.
- [ ] Console = counts only (no names/phones). Team never ran it against a real DB.
- [ ] Pure helpers (keep/clear partition, assertion logic) unit-tested with synthetic counts.
- [ ] `bunx tsc --noEmit` 0 · `bun test` green.

## Implementation Notes / Questions
(Jason fills in. Owner-run deploy; sid rehearse first. Flag any schema/FK disagreement with the 08-11 list via SA.)

## Implementation Notes
**Files:** `src/lib/db-reset-plan.ts` (new, pure) · `src/lib/db-reset-plan.test.ts` (new, 12 tests) ·
`scripts/db-reset.ts` (new) · `package.json` (`db:reset`).

**1. FK/keep split RE-VERIFIED against `src/db/schema.ts` (2026-08-19) — the 08-11 design still holds.**
Every FK edge I found, child → parent: `students→parents` · `course_packages→students,subjects` ·
`vouchers→students` · `bookings→students,teachers,subjects,course_packages,vouchers` ·
`notification_outbox→bookings` · `booking_badges→bookings,badge_values,badge_types` ·
`freelance_budgets→teachers` · `teacher_link_requests→teachers` · `teacher_subjects→teachers,subjects` ·
`badge_values→badge_types` · `teachers→bo.item`.
- **No KEEP table FK-references a CLEAR table** — confirmed, so clearing cannot cascade into config or the
  roster. KEEP only points at KEEP (or `bo.item`, which is outside both sets).
- **One change since 08-11, and it reinforces the order:** `course_packages.subject_id` (my `0018`) is a new
  CLEAR→KEEP edge. Safe — the child is deleted first — and it means the order must keep `course_packages`
  before nothing new. No reordering needed.
- The specced order satisfies every edge; the test asserts the six that matter positionally.

**2. Safety model, as built.** Dry-run is the default: it opens one transaction, counts, prints, then forces a
**ROLLBACK** (a sentinel throw — drizzle has no "rollback and continue"), so a dry run cannot write even by
accident. `--commit` does explicit `DELETE FROM "<table>"` per table in FK order — **never TRUNCATE CASCADE** —
re-counts, and calls `canCommit(before, after)`, which requires **both** KEEP unchanged **and** every CLEAR
table = 0. Any problem → throw → the whole transaction rolls back and nothing was deleted. **No DDL anywhere**,
so schema and all three ledgers are untouched and this is safe on `uat` regardless of the ledger state.

**3. Idempotent:** a second `--commit` deletes 0 rows, passes both assertions (0 = 0), and says so.

**4. Console = counts only.** A per-table table (`KEEP`/`CLEAR`, before → after) plus a single "rows to clear"
total. No name, no phone, nothing pasteable that leaks a family. A test asserts the output carries no Thai
word-runs, so PII can't creep into it later.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **554 pass / 0 fail** (12 new here). ⚠️ **I have not run it
against any database** — not sid, not uat. The counting and the delete are the owner's to execute; what I can
evidence is the plan, the assertions and the rollback path.

**Owner sequence (sid first, then uat):** `bun run db:backup` → `bun run db:reset` (dry run — read the count
table) → `bun run db:reset --commit` → the printed before→after shows KEEP identical and every CLEAR at 0 →
then the importer.

## Questions
(none — the split matched the 08-11 design, so there was nothing to flag.)
