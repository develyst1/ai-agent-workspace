# TASK-140: course_packages.subject_id — a real source of truth (BE, migration)
- Source: SPEC-045 (REQ-054), Part 3 — REQ-054 requirement 4
- Status: DONE (code — SA-reviewed Sober 2026-08-17); `0018` migration is an OWNER-RUN deploy step → @Porter
- Assignee: @Jason (BE)
- Depends on: none (can land after TASK-138/139; independent)

## Context (why)
Today a course's program is **derived** from `bookings[0].subject` (`mappers.ts:125`) — order-dependent,
no schema source of truth. This adds a canonical `course_packages.subject_id`. Safe because the DATA
REQUEST confirmed **zero mixed-program courses**, so the back-fill is a lossless derivation.

## What to do (smart-scheduler-back)
1. **Schema** (`db/schema.ts:252-281`): add `subjectId: uuid("subject_id").references(() => subjects.id)`
   to `course_packages`. **Nullable first.**
2. **Migration** (`bunx drizzle-kit generate` → `0018_*`; this repo owns `course_packages`):
   - back-fill `subject_id` = each course's `bookings[0].subjectId` (unambiguous — all sessions agree).
   - then set the column **NOT NULL** (backfill-before-constraint). Edge: a course with zero bookings —
     shouldn't occur (`createCoursePackage` always inserts `size` rows); if it does, leave nullable-safe.
3. **Write path:** set `course_packages.subjectId = input.subjectId` in `createCoursePackage`
   (`~:1019-1029`). Verify `reconcileCoursePlan`/insert paths that create COURSE_PACKAGE rows inherit the
   course subject (needed if NOT NULL).
4. **Repoint reads** from derivation to the column: `mappers.ts:123-127` and the `limit:1` bookings load
   in `coursesByIds` (`scheduler.service.ts:493-497`). Keep the derivation as a fallback while nullable.

## Definition of Done
- [ ] `course_packages.subject_id` exists, back-filled for every course by derivation, NOT NULL after.
- [ ] Course program now reads from the column (`mappers.ts` + `coursesByIds`), not `bookings[0]`.
- [ ] `createCoursePackage` sets the column; reconcile/insert paths keep it consistent.
- [ ] REQ-013/REQ-014 reports (per-session `bookings.subjectId`) unchanged — verify a course's sport share
      is identical before/after.
- [ ] Migration is idempotent/re-runnable-safe; `db:verify` green (per the deploy ledger discipline).
- [ ] `bunx tsc --noEmit` 0 · `bun test` green.

## Implementation Notes / Questions
**Files:** `src/db/schema.ts` (column + `subject` relation) · `drizzle/0018_course_subject.sql` (new) ·
`drizzle/meta/_journal.json` (idx 18) · `src/lib/migration-witness.ts` (0018 witness) ·
`src/services/scheduler.service.ts` (both course inserts + `coursesByIds`) · `src/db/mappers.ts` ·
`src/db/mappers.test.ts` (2 new tests).

🔴 **`bunx drizzle-kit generate` must NOT be used here — and I confirmed why the hard way.** I ran it; it tried
to open an interactive column-conflict prompt, which is the trap `drizzle/README.md` documents: `meta/` holds
snapshots only for **0000–0003** while the journal runs to 0017, so `generate` diffs against a 4-migration-old
state and wants to re-emit the whole schema. Nothing was written (it aborted on the prompt) and no DB was
touched. **`0018` is hand-authored + journal-registered, per the README's step 1–3.**

**The migration (idempotent, one transaction):** `ADD COLUMN IF NOT EXISTS subject_id uuid` → drop/add the FK to
`subjects(id)` → back-fill each course from its **earliest** session
(`ORDER BY date, start_time LIMIT 1`, not an arbitrary row) → **conditional** `SET NOT NULL` inside a `DO $$`
that only fires when no `subject_id` is still NULL. The condition is the task's zero-bookings edge: rather than
fail a deploy on a underivable course, the column stays nullable and the readers' fallback covers it. Back-fill
is lossless because the owner's DATA REQUEST found **zero mixed-program courses**.

**Witness for `db:verify`:** the FK `course_packages_subject_id_subjects_id_fk` — the last **unconditional**
object. The back-fill and the conditional NOT NULL have no reliable schema footprint (by design), and since the
migration is one transaction, the FK existing means the back-fill ran. Rationale is written into the entry.

**Writes:** `createCoursePackage` sets `subjectId: input.subjectId`; `importCoursePackage` sets it too — an
import would otherwise be the one course still deriving its program. Sessions created later
(`reconcileCoursePlan` / insert) copy `current.subjectId` from a sibling booking, and TASK-134 + TASK-138 now
make it impossible for those to disagree with the course.

**Reads repointed:** `toCourseWithStudent` prefers `c.subject`, **falls back** to `bookings[0].subject`;
`coursesByIds` loads `subject: true` and keeps the 1-booking load purely for that fallback. Keeping the fallback
is deliberate — between deploy and migration, or on a course the conditional NOT NULL skipped, the program still
renders instead of going null.

**REQ-013/REQ-014 unchanged:** those read **`bookings.subjectId`** per session, which this task does not touch —
no report input changed, so a course's sport share is identical before/after. (Stated from the code, not run:
running a report needs a real DB.)

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **488 pass / 0 fail**, including 2 new mapper tests (the
course's own subject wins; a pre-0018 course still derives from its booking).

⚠️ **NOT RUN — owner-run deploy step.** I never executed `db:migrate`, `db:verify` or any DB command: the
checked-in `.env` points at the live box (PROTOCOL's brownfield trap). Deploy order for whoever runs it:
`bun run db:backup` → `bun run db:migrate` (applies 0018 + `db:verify`) → confirm the ledger shows 19 rows and
the 0018 witness GREEN → then check that no `course_packages.subject_id` is NULL (if any are, the NOT NULL was
skipped on purpose — that course has no bookings and wants a look).

## Questions
- Q1: the column is **nullable in `schema.ts`** while the migration sets NOT NULL on a healthy DB. I kept the
  Drizzle type nullable deliberately (the task's "nullable first" + the conditional NOT NULL), which keeps the
  readers' fallback honest. If you'd rather `schema.ts` declare `.notNull()` once a deploy confirms the
  constraint landed, that's a one-line follow-up — I didn't want the type to promise something the DB might
  legitimately not have.

  > answer (Sober): **keep it nullable in `schema.ts` — right call.** The Drizzle type must not promise NOT NULL the DB
  > might legitimately not have (a zero-bookings course, or the deploy→migrate window), and the reader fallback stays
  > honest only while the type is nullable. Tightening to `.notNull()` is a **follow-up after a deploy confirms zero
  > NULLs** — not now. Don't let the type run ahead of the constraint.

## Review
**PASS ✅ (code — SA-reviewed Sober 2026-08-17). The `0018` migration is an OWNER-RUN deploy step (below).**
Reproduced: `bunx tsc --noEmit` **0** · `bun test` **488/0** (incl. 2 new mapper tests: course's own subject wins;
a pre-0018 course still derives). Read `drizzle/0018_course_subject.sql` + the diffs.
- **Migration is well-built:** idempotent (`ADD COLUMN IF NOT EXISTS`, `DROP CONSTRAINT IF EXISTS`→ADD), back-fill from
  the **earliest** session (`ORDER BY date, start_time LIMIT 1` — deterministic, better than "bookings[0]"), and a
  **conditional** `SET NOT NULL` in a `DO $$` that only fires when no NULL remains (the zero-bookings edge degrades to
  nullable rather than failing the deploy). Lossless because the DATA REQUEST found zero mixed courses.
- 🔴 **Correctly refused `drizzle-kit generate`** — he ran it, it hit the documented interactive trap (meta/ snapshots
  only cover 0000–0003 vs a journal at 0017), aborted on the prompt, wrote nothing, touched no DB; then hand-authored +
  journal-registered `0018` per the README. Exactly right.
- **Writes** set the column in `createCoursePackage` **and** `importCoursePackage` (the one path that would otherwise
  still derive); reconcile/insert copy the sibling subject, which TASK-134/138 now keep uniform. **Reads repointed** with
  a deliberate `bookings[0]` **fallback** kept for the deploy→migrate window / a conditional-skipped course — honest.
- **REQ-013/014 unchanged** (they read per-session `bookings.subjectId`, untouched).
- **Verdict: DONE (code).** ⚠️ **@Porter — route the deploy to the owner** (team never runs prod DB): `db:backup` →
  `db:migrate` (applies 0018 + `db:verify`, ledger → 19 rows, 0018 FK witness GREEN) → confirm no `course_packages.
  subject_id` is NULL (any NULL = a zero-bookings course worth a look). REQ-054 closes when 139 (FE) lands + this deploys.
