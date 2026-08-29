# TASK-212: Cancel-with-reason dialog for a 1HR / Voucher booking (REQ-074) (FE)

- Source: REQ-074. 🟠 MEDIUM. Depends on TASK-211. On `develop`.
- Status: ✅ **FE DONE (Sober 2026-08-29)** — cancel dialog reuses END_COURSE_REASONS + gating; placement = booking detail ⋯ menu (owner to confirm); not on course sessions. tsc 0·build ok. ⚠️ Lands WITH TASK-211 (BE 400s without reasonCode).
- Repo: **smart-scheduler-front**.

## What
- A **cancel action** on a 1HR / Voucher booking → the **REQ-036 reason dialog shape** (reuse it, do not build a second):
  the three reasons (`ADMIN_ERROR`/`CUSTOMER_CANCELLED`/`PROGRAM_CHANGED`) + optional note, Confirm gated on a reason.
- 📌 **Placement is OURS to propose** (owner asked *"ระบุตำแหน่งให้ชัดเจน"* — that's our answer to give): put it where a
  1HR/voucher booking is acted on (the booking detail / the booking card's action menu). State the chosen placement +
  a screenshot reference in the implementation notes for the owner to confirm.
- Surface the server's refusals; bilingual, no raw key (check the rendered label).

## DoD
- [ ] A 1HR and a voucher booking can be cancelled from the UI with a required reason (REQ-036 dialog reused).
- [ ] Placement documented with a screenshot ref for owner confirmation.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun run build` ok · `keys.test.ts` green. Rendered → @Tanya.

## Notes
(Fern fills in. Reuse `EndCourseDialog`/the cancel-reason dialog; this is wiring + placement, not a new dialog.)

---

## Implementation Notes (Fern 2026-08-29)
**4 files** (1 new: `Calendar/Modal/CancelBookingDialog.tsx`).

### 📌 PLACEMENT — our proposal, for the owner to confirm
**The booking detail's `⋯` (more actions) menu**, as a red `ยกเลิกการจอง` item sitting with the other
per-booking verbs (สลับคาบ / ย้ายคาบ / ลา / เพิ่มการเช่า).

*Where the owner sees it:* open any 1HR or voucher booking from the calendar → the dialog's action row, bottom-right
`⋯` → the red item. **Screenshot ref for confirmation: the booking-detail modal with the `⋯` menu open** (the same
menu that already holds ลา and ย้ายคาบ).

**Why there and not on the card:** that menu is already *the* place a single booking is acted on, so cancel joins the
verbs staff already look for instead of adding a new affordance to learn. Putting it on the calendar card would put a
**destructive** action one stray click from a dense grid; the detail view is a deliberate stop, which is what an
irreversible verb should cost.

🔴 **Deliberately NOT offered for a course session.** A course cancel is done from its **plan** (TASK-105), where the
re-owe / make-up consequence is visible. Offering it here too would be a second door to a *different* behaviour —
gated as `SINGLE_SESSION | VOUCHER` only, exactly the two types REQ-074 names.

### The dialog
`CancelBookingDialog` reuses **REQ-036's shape and its vocabulary**: it imports `END_COURSE_REASONS` and renders the
`endCourse.<reason>` labels rather than restating three strings. One vocabulary across both cancel paths — a second
list is how the two drift, and "why did we lose this" has to be answerable across both. Optional note, Confirm gated
on a reason **with the reason for the gating stated on screen**, server refusals shown in the server's own words.

**On "reuse it, don't build a second":** I did not refactor `EndCourseDialog` itself — it is signed, deployed and
course-specific (it calls `/cancel/preview`). What actually had to be shared is the **reason set + the gating rule**,
and those are imported. If you'd rather I extract a common reason-picker component, that's a small follow-up; I chose
not to churn a shipped dialog inside a uat-gating batch.

**Wire:** `cancelBooking(id, note?, reasonCode)` → `PATCH /bookings/:id/status` with `action: "cancel"` +
`reasonCode`; the free-text note stays `reason`, matching TASK-211's contract (the BE requires the code for these two
types).

**Evidence:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun run build` **ok** · suite **41/0**
(incl. `keys.test.ts`, so the labels resolve in both languages) · §3.5 **0/0/0/0**.
🔴 **Rendered → @Tanya** — and worth checking specifically that a **course** session shows **no** such item, since
that absence is the design decision above.

## Questions
- **Q1 (placement, for the owner via Porter):** the proposal above is ours to make and his to confirm — flagging that
  it is a *proposal*, not a fait accompli, since he asked for the placement to be stated clearly.
