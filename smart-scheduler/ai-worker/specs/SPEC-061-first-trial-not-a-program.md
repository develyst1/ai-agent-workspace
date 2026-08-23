# SPEC-061: `1st Trial` stops being a selectable program (REQ-065)

- Source: REQ-065 (owner: do first). `1st Trial` is a booking TYPE wrongly modeled as a subject since day one.
- Author: Sober (SA) 2026-08-23
- Status: READY — TASK-173 cut. **BE + a one-row owner-run data flip. No FE change.**

## Q1 (mechanism) — (a) `active = false`, PLUS a filter the current code is missing

Porter's lean (a) is right, but it is **not one line** — I grounded it:
- Every picker (จองรายครั้ง single, course create, voucher, the trial tab) is driven by **`teacher.subjectOptions`**
  (front: `CreatePlanFlow.tsx:67`, `BookingModal.tsx:596`; **no separate all-subjects fetch exists on the FE**). So a
  single server-side filter fixes **all** pickers at once — the cause, not one dropdown (req 3). **No FE change.**
- 🔴 **But the `subjectOptions` build does NOT currently filter `subject.active`** — `scheduler.service.ts:388,452`
  load `with: { teacherSubjects: { with: { subject: true } } }` and map every linked subject regardless of `active`.
  So `active = false` **alone would not hide `1st Trial`.** Option (a) = set the flag **and** add
  `.filter(s => s.subject.active)` to that mapping. Then `active` means "selectable" everywhere, present and future.
- Reject **(b)** unlink from `teacher_subjects` — treats the symptom; the next screen or bulk-link resurfaces it.
- Reject **(c)** a structural not-a-program flag — `active` already *is* the "not selectable" flag; a new model
  concept is scope this doesn't need.

## Q2 — does anything depend on `1st Trial` being selectable? No; but the ROW must stay.

- **Booking a trial does NOT select the `1st Trial` subject.** A trial's `วิชา` is the **real activity** the child
  tries (owner's screenshot: `ทดลองเรียน` + `Onewheel E-Skate`); the trial tab reads the same `subjectOptions` of
  real activities. So removing `1st Trial` from the pickers does not touch how a trial is booked or priced (AC-4);
  `FIRST_TRIAL` stays a booking type, `first-trial` stays its ฿1,390 sale item.
- **The row must NOT be deleted** (AC-3): `bookings.subject_id` is NOT NULL `onDelete: restrict`, and historical
  bookings reference `1st Trial` — including `db/seed.ts:185`, which books a demo trial with `subject: "1st Trial"`,
  and any จองรายครั้ง misuse on `uat`. `active = false` keeps the row (name intact for every read) while making it
  unpickable. That is exactly what the flag is for.

## AC-3 — the check that makes (a) safe

The `active` filter goes **only** in the picker (`subjectOptions`) build — **never in a read path.** Historical
`1st Trial` bookings must still render everywhere they are named (calendar, plan, daily report, SOM). Audit the read
paths (`db/mappers.ts`, the report/SOM services) to confirm none filters bookings/subjects by `active`, and pin it
with a test: a booking whose subject is inactive still maps its name and does not error.

## The change (TASK-173)

1. **BE — `subjectOptions` filters `active`:** in the two builds (`scheduler.service.ts:388,452`), drop subjects with
   `active === false` from the mapped options. Fixes AC-1 + AC-2 across all pickers, no FE change.
2. **BE — read-path audit + test** (AC-3): no read filters `active`; an inactive-subject booking still renders.
3. **Data flip (owner-run, dry-run-first — AC-6):** `1st Trial` → `active = false`. One row, unique name. Give Porter
   the confirm-then-flip SQL for the owner (chat, per his preference): `SELECT id,name,active FROM subjects WHERE
   name='1st Trial'` (confirm exactly one) → `UPDATE subjects SET active=false WHERE name='1st Trial'`. `sid` first,
   then `uat`. Reversible in one statement.
4. **Optional dev-data cleanup (non-blocking):** `db/seed.ts:185` should book its demo trial against a **real
   activity**, not `subject:"1st Trial"`, so fresh seeds stop perpetuating the wrong model. Say if you'd rather skip.

## Acceptance mapping
AC-1/AC-2 ⇐ the `subjectOptions` active-filter (all pickers) · AC-3 ⇐ filter only in the picker, read-path audited ·
AC-4 ⇐ trial books the real activity, untouched · AC-5 ⇐ only `1st Trial.active` flips, no other subject affected ·
AC-6 ⇐ the owner-run dry-run-first flip.

## Out of scope
Deleting the row (impossible + AC-3). Any change to trial booking/pricing (AC-4). The `active`-means-selectable
semantics are being *used*, not redefined.
