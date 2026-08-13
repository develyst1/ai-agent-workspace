# TASK-125: scheduler-front (FE) — expiry tiebreaker in the calendar eligible-course label (OBS-5)

- Source: OBS-5 (Tanya, sid 2026-08-10) — a student with **two courses identical in subject + size + progress** renders
  two **identical** picker labels. Nothing books wrong (value is keyed by `courseId`), but a human can't tell them
  apart. SA ruling: LOW, worth a cheap fix; **NOT on the essential-set critical path** — rides the next FE deploy.
- Status: DONE ✅ (SA-reviewed 2026-08-10 — tsc 0 reproduced; `multiCourse = eligible.filter(x=>x.id===e.id).length>1` appends expiry only for a 2+-course student, single-course/voucher untouched, value=courseId unchanged. LOW/off critical path.)
- Depends on: TASK-121 (the label it extends) — DONE
- Assignee: @Fern (smart-scheduler-front)

## What to build
In `BookingModal.tsx` `eligibleLabel(e)` (TASK-121), when the student has **2+ course entries**, append the course
**expiry** so identical packages are distinguishable — using `expiryDate`, which is **already in `CourseContext`**
(no BE change). Two identical packages bought at different times differ in expiry; the common single-course and
distinct-program cases are untouched (no extra clutter).

- Only append when `eligible` has >1 course entry (so single-course labels stay clean).
- e.g. `${base}${subj ? " · "+subj : ""} (${used}/${size})${multiCourse ? " · exp "+fmt(expiryDate) : ""}`.
- If two entries STILL collide (same package, same day → same expiry) that's a truly fungible pair — acceptable; do
  not add a courseId fragment (user-hostile). Document that as the accepted residual.

## Definition of Done
- [x] A student with two same-subject/size courses shows two **distinguishable** rows (different expiry); a
      single-course student's label is unchanged (no expiry suffix).
- [x] No BE/API change (`expiryDate` already in context); `value` still `courseId`.
- [x] `bunx tsc --noEmit` clean; build ok.

## Implementation Notes (@Fern)
One added line in `BookingModal.tsx` `eligibleLabel` (the TASK-121 helper): `multiCourse = eligible.filter(x =>
x.id === e.id).length > 1` (same **student id** appears in 2+ course entries) → append ` · exp ${c.expiryDate}` only
then. Single-course and distinct-subject rows are untouched (no clutter). `value` stays `entKey(e)` = `courseId`; no
BE/API change (`expiryDate` was already in `CourseContext`).
- `expiryDate` appended **raw** — it's already a display string (the ContextCard interpolates it as-is at
  `BookingModal.tsx:851`), and dayjs isn't imported here, so no new dependency for a low-priority label suffix.
- **Accepted residual (as the task rules):** two entries identical in package **and** purchase day → identical expiry
  → still identical labels. That's a truly fungible pair; I did **not** add a courseId fragment (user-hostile).
- Verified: `bunx tsc --noEmit` → 0; `bun run build` → ok.

## Questions / flags
- None. Live render → QA with the other calendar items.
