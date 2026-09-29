# TEST-072 / FINDING: an admin CANNOT reverse a mistaken session leave on sid

- Context: cleanup of my two test leaves (asda 2026-10-24 & 2026-10-31, Balance Play Group), which Porter/owner
  re-assigned to me ("do it the way a real admin would; if no admin screen can reverse a mistaken leave, that
  is a FINDING"). I logged into the sid frontoffice as **super admin** (admin/admin-som) and tried every
  relevant screen. **Result: there is NO admin action that reverses a specific leave back to CONFIRMED.**
- Both leaves are still `SICK_LEAVE` (24/10 seat `793f2aad`, 31/10 seat `7ce723ba`), verified on the calendar.
- Tested 2026-09-25 by Tanya.

## Screens I tried (the way a real admin would) — none reverses a leave
1. **Calendar → the group session (booking detail):** opened the 2026-10-24 Balance Play Group (Camp, 15:00).
   The roster shows **asda → ON LEAVE** (ซุปซุป & ส้ม CONFIRMED). The status badge is not clickable; the seat
   name only navigates to Bookings. The session-level **⋮** menu offers **"Record leave/sick"** and **"Move
   session"** — i.e. it can only CREATE a leave or move the session, never undo one. Session buttons are
   Attended / Confirm + LINE (session-level, not a per-seat un-leave).
2. **Bookings / Students → Courses + leave → Manage plan:** the per-session **⋮** on an **ON LEAVE** row offers
   only **"Edit"** (re-time) and **"Mark absence"** — **no "restore / un-leave / un-mark absence".** The
   course-level buttons are Pause course · Cancel course · Add extra (charged) · **Insert make-up**. "Insert
   make-up" adds a NEW replacement session; it does **not** return the original leaved session to CONFIRMED.
3. **Deduction History:** a read-only timeline of events (Scheduled / Sick leave / Make-up added / Cancelled).
   No per-event undo.
4. **Over-quota "Unlock (admin)" / "Lock again":** the ONLY leave-related admin control. It re-opens the
   RESCHEDULE QUOTA (so more make-ups are allowed after a course exceeds 4→1 / 6→2 / 10→3), it does **not**
   restore a leaved session. Both my leaves were over-quota ("โควตาลาครบแล้ว — ต้องปลดล็อกโดยแอดมิน").
5. **API (for completeness):** `PATCH /api/bookings/:id/status {action:"confirm"}` returns **200 but is a
   NO-OP** on the leaved seat — the status stays `SICK_LEAVE`.

## Root cause (from src — diagnostic, to help the fix)
- **Two doors CREATE a leave, none reverses it.** `scheduler.service.ts:2998` — *"Two doors set a FUTURE
  session to SICK_LEAVE: the per-session action and the plan editor's mark-absence."* There is no third,
  reverse door in the status enum or the plan editor.
- **`confirm` can't un-leave a previously-confirmed seat.** `scheduler.service.ts:3462-3464` — `action ===
  "confirm"` short-circuits when `current.confirmedAt` is set (`"คาบนี้ยืนยันแล้ว"`) and returns WITHOUT
  clearing `SICK_LEAVE`. A group seat that was CONFIRMED, then leaved, still carries `confirmedAt`, so
  "confirm" is inert — exactly the 200 no-op I saw.

## Verdict — 🔴 FINDING (product gap), not just footprint
**A shop admin cannot fix a parent's wrong "แจ้งลา" tap.** Once a session is set to leave (especially
over-quota), no admin screen returns it to CONFIRMED — the closest is "Insert make-up" (a new session, the
original stays leaved) or "Unlock" (quota only). This is the exact gap the owner anticipated. Recommend a BE
+ FE task: a **per-session "Undo leave / restore to confirmed"** admin action (clears `SICK_LEAVE`, refunds
the leave-quota use, re-holds the slot), reachable from the group-session roster AND the plan editor — and
fix the `confirm` short-circuit so it clears a leave instead of no-op'ing on `confirmedAt`.

## Footprint (still open — because it cannot be cleared without the fix above)
- asda's **2026-10-24** (`793f2aad`) and **2026-10-31** (`7ce723ba`) Balance Play Group seats remain
  `SICK_LEAVE`. There is no admin way to reverse them on the current build; that is this finding. They sit on
  the demo customer account until the reversal action ships (or a DB fix by the owner).

## Evidence — `../project-docs/qa-2026-09-25/`
- `finding-manageplan-onleave-menu.png` — Manage plan, an ON LEAVE row's ⋮ = only **Edit** + **Mark absence**
  (no restore); course actions Pause/Cancel/Add-extra/Insert-make-up.
- `finding-leave-course-cards.png` — the course cards: the only leave-related admin control is **"Unlock
  (admin)" / "Lock again"** (quota, not a session restore).
