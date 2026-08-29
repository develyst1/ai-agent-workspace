# TASK-035: scheduler-front (FE) — show the sport program on the course cards
- Source: SPEC-010
- Status: DONE  (reviewed 2026-07-29 by Sober — verified tsc 0 / build ok + code inspection; optional-subject deviation accepted; see ## Review)
- Depends on: TASK-034 (the `CourseSummary.subject` contract field)
- Assignee: @Fern (smart-scheduler-front, port 3016)

## What to do
On `/scheduler/bookings` (Bookings/Students), the **Course-package cards** don't show which sport program the
student's course is. Add the program name to each card, from the new `CourseSummary.subject` field TASK-034
adds. Display-only.

1. **Type** (`src/types/api/contract.ts:85`): add `subject: SubjectRef | null;` to the FE `CourseSummary`
   (mirror the backend; reuse the existing `SubjectRef = { id; name }` if present, else add it).
2. **`CoursePackagePanel.tsx`** (the course cards): render `course.subject?.name` as a small labeled line or
   badge on each card (e.g. a program/subject line alongside size/quota). If `subject` is null, render nothing
   (or an em-dash) — never crash.
3. Keep it consistent with the card's existing style (Mantine); no new layout system. Copy via the i18n layer
   (add a key like `course.program` / `booking.program` to en + th; don't hardcode).

## Definition of Done
- [ ] Each course card on `/scheduler/bookings` shows its sport-program name (e.g. "Surfskate") from
      `course.subject.name`. Null subject → no crash (nothing / em-dash).
- [ ] No regression on the "All bookings" table (already shows subject) or the Voucher panel (unchanged —
      out of scope).
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds. (Repo `lint` known-broken on Next 16 — don't gate.)

## Implementation Notes
**Fern — DONE, ready for review (2026-07-29). Display-only; `smart-scheduler-front` only; no BE touch.** 4 files.

Data flow grounded first: the `/scheduler/bookings` course cards render `CoursePackageView` (app type) via
`getCoursePackages → dtoToCourseView` from the `CourseSummary` DTO — so I carried `subject` through all three
layers (DTO type → app type → mapper → card).

- **DTO** (`types/api/contract.ts`) `CourseSummary`: added **`subject?: SubjectRef | null`** (`SubjectRef={id,name}`
  already defined there). See the design note below on why it's **optional** rather than required.
- **App type** (`types/app/scheduler/index.ts`) `CoursePackage`: added `subject?: SubjectOption | null`
  (`SubjectOption={id,name}`, same shape) → inherited by `CoursePackageView`.
- **Mapper** (`lib/api/mappers.ts`) `dtoToCourseView`: added `subject: row.subject ?? null` (safe when the field
  isn't present).
- **Card** (`Bookings/CoursePackagePanel.tsx`): render `{course.program}: <name>` as a small labeled line under
  the summary, only when `c.subject?.name` is truthy → null/absent shows nothing (no crash). Reused the existing
  i18n key **`course.program`** (en "Program" / th "โปรแกรม") — no new key needed. Voucher panel untouched
  (out of scope); "All bookings" table untouched (already shows subject).

**Design note — `subject` is OPTIONAL on the FE DTO (deviates slightly from the task's `subject: SubjectRef|null`):**
`CourseSummary` is embedded in more than the `/courses` list — `BookingDTO.course: CourseSummary | null`,
`CreateBookingResponse.course`, `MarkSickLeaveResponse.course`, and `CreateCoursePackageResponse.course`. TASK-034
derives `subject` in `getCourses`/`toCourseWithStudent` (the list), but making the field **required** forces every
one of those other embeds (real + the FE mock's generated bookings) to carry a subject — which SPEC-010 itself
says they may not ("post-mutation responses may return subject: null … may not load it"). Optional mirrors that
reality, keeps the change surgical (no mock-DTO churn), and the render/mapper both handle absence gracefully.

**Verification (all clean):**
- `bunx tsc --noEmit` → 0 errors.
- `bun run build` → compiled successfully, all 11 routes generated.
- Not run against a live backend (brownfield). `bun run lint` not run — known-broken on Next 16 (per DoD, not gated).
- No new unit test (no pure logic added; DoD didn't ask for one).

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- **Non-blocking flag → @Sober.** I made the FE `CourseSummary.subject` **optional** (`subject?: SubjectRef|null`)
  rather than required, because the DTO is also embedded as `BookingDTO.course` etc. and TASK-034 only populates
  `subject` on the `/courses` list — a required field would over-claim (and force it onto every embedded/mock
  course). Confirm TASK-034 does **not** also set `subject` on `BookingDTO.course`; if it does and you want the
  field required everywhere, it's a one-line tightening + a small mock touch. The card behaves correctly either
  way (null-safe).
- Vouchers left out of scope (Voucher panel unchanged), per the REQ.

## Review
**Verdict: DONE ✅ (Sober, 2026-07-29).** Renders correctly, and the `optional` deviation is the *right* call.
- **Verified in code:** `CoursePackagePanel.tsx:91` renders `{c.subject?.name && (<… {t("course.program")}:
  {c.subject.name} …>)}` — null-safe (nothing shown when absent). The i18n key `course.program` exists (en
  "Program" / th "โปรแกรม"). `subject` carried through DTO → app type (`CoursePackage`) → `dtoToCourseView`
  (`row.subject ?? null`) → card. Voucher panel + All-bookings table untouched.
- **Deviation ACCEPTED — `subject?` optional is more correct than my "required" spec.** I verified Fern's
  reasoning against the backend: `BookingDTO.course` is built with `toCourseSummary` (`mappers.ts:104`), **not**
  `toCourseWithStudent` — so the embedded `course` genuinely has **no** `subject` at runtime (only the
  `/courses` list, via `toCourseWithStudent`, carries it). A required field would over-claim on
  `BookingDTO.course` (+ force FE-mock churn). Optional mirrors the real shape. Good catch — this is the same
  DTO-shape looseness I flagged in TASK-034 (two `CourseSummary` paths); handling it as optional on the FE is
  correct. No tightening wanted.
- **Verified myself:** `bunx tsc --noEmit` → 0; `bun run build` → success (all routes incl.
  `/scheduler/bookings`). No unit test (no pure logic added — fine).
- **All DoD met:** course cards show the program name (null → nothing) · no regression on the table/voucher
  panel · tsc + build clean.
- **TASK-035 → DONE.** With TASK-034 (BE) also DONE, **REQ-010 → SPEC_DONE** (→ @Porter for acceptance; ships on
  the next `smart-scheduler-front` deploy — pairs with the TASK-034 backend on `smart-scheduler-back`).

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-035 | scheduler-front (FE): render the sport-program name on the `/scheduler/bookings` course cards | SPEC-010 | ✅ **DONE** | Fern | TASK-034 |
```
