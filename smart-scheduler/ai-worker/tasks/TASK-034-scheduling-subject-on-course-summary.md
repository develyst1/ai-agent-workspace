# TASK-034: scheduling (BE) — add the sport program (subject) to CourseSummary
- Source: SPEC-010
- Status: DONE  (reviewed 2026-07-29 by Sober — verified tsc 0 / mapper test 4/0 / suite 108/0 + code inspection; see ## Review)
- Depends on: none
- Assignee: @Jason (smart-scheduler-back, port 4006)

## What to do
`CourseSummary` carries no subject, so the `/scheduler/bookings` course cards can't show the sport program.
Add it — **derived at read time** from the course's bookings (no schema change): a course ⇔ one subject
(course creation stamps a single `input.subjectId` on all its generated bookings, `scheduler.service.ts:533`).

1. **Contract** (`src/types/contract.ts`): add `subject: SubjectRef | null;` to `CourseSummary` (`:99`).
   `SubjectRef = { id, name }` already exists — reuse it.
2. **`getCourses()`** (`src/services/scheduler.service.ts:313`): load the subject via the course's bookings:
   `db.query.coursePackages.findMany({ with: { student: true, bookings: { with: { subject: true }, limit: 1 } } })`.
   (If nested `limit` is awkward in this Drizzle version, use `bookings: { columns: { subjectId: true }, with:
   { subject: true } }` and take `[0]` in the mapper.)
3. **`toCourseWithStudent`** (`src/db/mappers.ts:120`): add
   `subject: c.bookings?.[0]?.subject ? { id: c.bookings[0].subject.id, name: c.bookings[0].subject.name } : null`.
   **Keep it safe when `bookings` isn't loaded** (→ `null`) so the other callers (create/update-course responses
   at `:556`, `:1079`, etc.) don't break — they may return `subject: null`, which is fine (the list re-fetches).
   Optionally load `bookings.subject` at those sites too, but not required.

## Definition of Done
- [ ] `GET` courses (`/scheduler/bookings` list) returns each course with `subject: { id, name }` = the course's
      program (matches the subject stamped on its bookings).
- [ ] A course with no loaded/one bookings still returns cleanly (`subject: null`, no crash); other
      `toCourseWithStudent` callers still compile + work.
- [ ] `bunx tsc --noEmit` clean; `bun test` green (add/extend a test asserting `getCourses`/`toCourseWithStudent`
      surfaces the subject; a pure mapper test over a course-with-one-booking is fine).

## Implementation Notes

Derive-at-read, no migration — three small edits in `smart-scheduler-back`:

1. **Contract** (`src/types/contract.ts`): added `subject: SubjectRef | null;` to `CourseSummary` (reused the
   existing `SubjectRef = {id,name}`). (Note: `toCourseSummary` is typed against the **separate** `CourseSummary`
   in `lib/leave.ts`, which I did **not** touch — the mappers return inferred/`any`-based objects, so the
   FE-facing contract type gains the field without forcing the leave-side type; tsc confirms no break.)
2. **`getCourses()`** (`src/services/scheduler.service.ts`): now loads
   `with: { student: true, bookings: { with: { subject: true }, limit: 1 } }` — one booking is enough (all a
   course's bookings share the stamped `subjectId`).
3. **`toCourseWithStudent`** (`src/db/mappers.ts`): adds
   `subject: c.bookings?.[0]?.subject ? { id, name } : null`. **Safe when `bookings` isn't loaded → `null`**, so
   the other callers (`toBookingDTO`'s embedded `course`, create/update-course responses) still compile and just
   return `subject: null` (the list re-fetches). Nothing else in the mapper changed.

**Verification** (`H:\scheduler\smart-scheduler-back`):
- `bunx tsc --noEmit` → **clean (exit 0)** — confirms no other `CourseSummary` consumer breaks on the new field.
- `bun test` → **108 pass / 0 fail** (19 files). Extended `db/mappers.test.ts` (`toCourseWithStudent`):
  a course with `bookings:[{subject:{id,name}}]` → `subject` = that program; a course with no/empty bookings →
  `subject: null` (the safe path other callers rely on).
- ⚠️ Not run against a live DB (brownfield). The nested-relation load (`bookings.subject`, `limit: 1`) typechecks
  and uses the existing `coursePackages.bookings` + `bookings.subject` relations; nested `limit` is a standard
  Drizzle relational-query feature. Recommended deploy smoke: `GET` the `/scheduler/bookings` course list → each
  course card's data carries `subject: {id,name}` = its sport program.

**DoD:** `getCourses` returns each course with `subject:{id,name}` ✓ · no-/one-booking course returns cleanly
(`subject:null`, other callers compile) ✓ · tsc clean + `bun test` green, mapper test added ✓.

**Handoff:** FE contract mirror + rendering is **TASK-035 (Fern, depends on this field)** — not in scope here.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- Derive-from-bookings is deliberate (no `course_packages.subjectId` migration for a display feature). If you
  find a cleaner Drizzle load than nested `limit: 1`, use it as long as the DTO carries the right subject.

## Review
**Verdict: DONE ✅ (Sober, 2026-07-29).** Correct, minimal, no migration — as designed.
- **Verified in code:** `contract.ts` `CourseSummary` gains `subject: SubjectRef | null`; `getCourses` loads
  `bookings: { with: { subject: true }, limit: 1 }`; `toCourseWithStudent` maps
  `subject: c.bookings?.[0]?.subject ? { id, name } : null` — **null-safe** when bookings aren't loaded, so the
  other `toCourseWithStudent` callers (embedded `course` in `toBookingDTO`, create/update-course responses)
  still return cleanly. Derivation is sound: a course ⇔ one subject (stamped on all its bookings), so any one
  booking's subject is the program.
- **Verified myself:** `bunx tsc --noEmit` → 0; `bun test src/db/mappers.test.ts` → 4/0 (course-with-one-booking
  → subject; no/empty bookings → null); full `bun test` → **108/0**.
- **Note (non-blocking, pre-existing):** there are two `CourseSummary` declarations — the FE-facing DTO
  (`contract.ts`, now with `subject`) and a separate local one in `lib/leave.ts` that `toCourseSummary` returns
  (no `subject`). Jason correctly left `lib/leave.ts` alone; the mapper is `(c: any)` so the runtime object
  carries `subject` (verified by the test + the RPC return is inferred from the mapper, so `hc<AppType>` sees
  it). The duplicate-type is old tech debt worth unifying **someday** — not this task, not a blocker.
- **TASK-034 → DONE.** **@Fern: TASK-035 is unblocked** (the `CourseSummary.subject` contract field is in) —
  mirror it in the FE type + render on the `/scheduler/bookings` course cards. REQ-010 stays IN_SPEC until
  TASK-035 lands.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-034 | scheduling (BE): add `subject: SubjectRef\|null` to `CourseSummary` — derive from the course's bookings in `getCourses` | SPEC-010 | ✅ **DONE** | Jason | — |
```
