# TASK-059: scheduler-front (FE) — drop the `bookable` flag; surface the sale rejection
- Source: SPEC-016 addendum (REQ-019)
- Status: TODO — small. **Do it after TASK-054**, and see the deploy note below (there is no ordering hazard).
- Depends on: **TASK-058** (the backend change)
- Assignee: @Fern (smart-scheduler-front, port 3016)

## Why
คุณฟีน settled the last piece: a suspended household **cannot buy** either. So every consumer of
`GET /students?q=` — your booking picker **and** both sale modals — now wants suspended households hidden, and
TASK-058 makes that the server default. The `bookable` flag you just wired has nothing left to distinguish, and
an opt-in policy flag is a hole waiting for someone to forget it.

**Sorry for the churn — that one's mine.** The flag was the right call while the sell-side question was open
(filtering the shared endpoint would have changed the sale screens with nobody having decided that); the answer
arrived after you'd built it.

## What to do
1. **Remove the `bookable` plumbing**: the `opts` on `searchStudents`, the `bookable` prop on `StudentSelect`,
   the pass-through in `useStudentSearch`, and the prop at `BookingModal`'s Trial/Single picker.
   - **Simplify the react-query key back** (the variant segment no longer distinguishes anything). Just make
     sure the key still changes with `q`.
   - **Keep your mock's student list** — the suspended household + walk-in you added are still exactly the
     right fixtures; the mock should now filter suspended **unconditionally**, matching the server.
2. **Surface the sale rejection.** `POST /courses` / `POST /vouchers` will now return the suspension `400` for a
   suspended household. `CreateCourseModal` and `CreateVoucherModal` must **show that message**, the same way
   `BookingModal` does — an `ApiClientError` → visible alert, not a Save button that appears to do nothing.
   > This is the REQ-019 acceptance defect all over again, in two screens that didn't have it yet. The picker
   > hiding them is convenience; **the message is what a member of staff actually needs** when it happens.

## Definition of Done
- [ ] No `bookable` anywhere in the FE; the booking picker and both sale modals still hide suspended households
      (now because the server does).
- [ ] A walk-in student with **no parent** still appears everywhere.
- [ ] Both sale modals show the backend's suspension message on rejection — **check this in the browser** and
      say what you saw. If the mock can't produce a 400, say so and reuse the `ApiClientError` pattern from
      `BookingModal`.
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds.

## Deploy note (no hazard, unlike TASK-055)
Either order is safe: an old FE still sending `bookable=true` is **ignored** by the new backend (the schema
drops the field, it isn't rejected), and a new FE sending nothing gets the same exclusion by default. Nothing to
sequence here — I'm saying so explicitly because I made noise about ordering last time and don't want that
alarm inherited where it doesn't apply.

## Implementation Notes
(Fern fills in — include what you exercised in the browser.)

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- Still no client-side filtering: the server decides who's listed. You're only removing a flag and showing an
  error.

## Review
(Sober fills at REVIEW.)
