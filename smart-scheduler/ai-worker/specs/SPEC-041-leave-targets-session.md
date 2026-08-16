# SPEC-041: A leave targets a specific session (LINE picker + confirmation) 
- Source: REQ-046
- Status: ACTIVE

## Overview — the investigation first (Q1/Q2 answered)
Porter asked me to check before designing. **I did, and the owner's suspicion is wrong about the data
model but right about the experience.**

- **Q1 — what does the leave path record today?** A **session id (bookingId)**, on *every* path. There
  is no day-level leave record anywhere.
  - **Web** (`BookingModal.tsx` `handleSickLeave` → `markSickLeave({ id: booking.id })`, ~L195) acts on
    one specific booking. **AC-6 already met.**
  - **LINE** (`line-webhook.service.ts` `doLeave` ~L254): pulls the parent's CONFIRMED bookings **for
    today**; if exactly one → applies it; **if more than one → already sends a tappable picker**
    (`bookingPicker`, one button per booking carrying `bookingId`), then `doLeaveBooking` re-fetches,
    authorizes the booking belongs to this parent, and marks that one. So the "10:00 vs 11:00 same day"
    case is **already disambiguated by taps** (AC-2 in mechanism).
  - Backend: only `PATCH /bookings/:id/status` → `updateBookingStatus(id, "sick-leave", …)` exists — it
    takes a **bookingId**, never student+date.
- **Q2 — ambiguous historical records?** **None.** Every record is a bookingId, so there is nothing to
  clean up / escalate. (Publish this: "we checked — it was already session-level.")

**So why does it feel day-level?** The **copy**, not the data: the LINE picker label is just
`name + time` (no teacher/program), and the confirmation (`leave_ok`) names only the student + the
make-up date — it never names *which session was cancelled*. A parent reading "แจ้งลาสำเร็จ (ชื่อ)"
can't see that it hit one specific session, so it *looks* like it leave'd "the day." That is the real
fix, and it's small.

**Scope:** BE (LINE copy/label + a child-first step); FE web needs no functional change (optional toast
copy alignment). **Advance / future-dated / bulk leave is explicitly OUT of scope** (REQ-046 Out of
Scope — its own requirement); this REQ is same-day session disambiguation only.

## Flow / behaviour (LINE)
1. Parent triggers leave (keyword `ลา` or rich-menu `action=leave`).
2. **Child step (AC-3):** if the parent has **≥2 children who each have an eligible session today**, ask
   `ลาให้ใครคะ / Which child?` (tappable, one button per child). If only one child has sessions today,
   skip straight to step 3 (no needless question — keeps the common case one tap).
3. **Session step (AC-2):** if the chosen child has **>1** eligible session today, ask
   `วันนี้มี {n} คาบ ลาคาบไหนคะ` with tappable options labelled `{time} · ครู{teacher} · {program}`
   (enrich `bookingLabel` — the data is already loaded: `findTodayBookingsForParent` fetches
   `with: { student, teacher, subject }`). If exactly one → apply directly.
4. **Confirmation (AC-1/AC-3):** name the **cancelled** session —
   `แจ้งลาแล้ว: {date} {time} น. ครู{teacher} — คาบนี้จะถูกเลื่อนไปต่อท้ายคอร์ส`.
5. **Negative (AC-4):** already-cancelled / attended / past-cutoff → the existing refusal
   (`doLeaveBooking` accepts only CONFIRMED; `LEAVE_NOTICE_TOO_LATE` server-side). Reuse REQ-047's
   wording; do not invent a second vocabulary.

## What does NOT change (AC-5 regressions — all in `updateBookingStatus` sick-leave branch)
Leave quota / lock (`canTakeLeave`, `LEAVE_QUOTA_BY_SIZE`), the auto-append make-up
(`findFreeExtensionDate` → `EXTENDED` at same time/teacher), freelance draw reconcile, CRM award, admin
notify — **untouched**. This REQ only makes *which* session explicit + names it; it never changes *what*
a leave does (REQ-030's model stands).

## Data / API
None. No endpoint, schema, or payload change. All work is in `line-webhook.service.ts` +
`line-reply.ts` + `line-i18n.ts` (labels, an extra picker step, richer confirmation).

## Tasks
- **TASK-135 (BE, Jason)** — LINE leave: (a) enrich `bookingLabel` used by the leave picker to
  `{time} · ครู{teacher} · {program}`; (b) add the child-first step when ≥2 children have sessions today;
  (c) enrich the leave confirmation to name the cancelled session (new i18n keys, TH+EN). No change to
  `updateBookingStatus` behaviour. Reuse REQ-047 refusal wording for the negative path.
- FE web: **no task** — already session-level (AC-6). Optional toast-copy alignment can ride any future
  BookingModal task; not cut separately.

## Non-functional
BE-only; `bunx tsc --noEmit` 0; `bun test` green; all new user-facing strings via i18n (TH+EN, no raw
key ever shown); taps not typed numbers (REQ-015).

## Questions
- **Q3 (owner, pending):** undo of a just-made leave vs staff-fix. Porter's lean (staff fix; the
  confirmation makes mistakes visible) is **not blocking** this build — I've specced no undo path. If
  the owner wants undo, it's a small follow-up REQ. Proceeding on the staff-fix assumption.
