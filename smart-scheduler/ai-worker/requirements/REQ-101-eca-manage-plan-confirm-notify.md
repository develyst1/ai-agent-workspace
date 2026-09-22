# REQ-101 — ECA: Manage-plan page + whole-course confirm + edit/move/remove notify + cancel-all

**Source:** customer (Khwan) via owner, 2026-09-21. **Status: DISCUSSION — recorded verbatim; feasibility read requested from @Sober; owner rulings pending.**

## §1 — the asks (verbatim intent)
1. **Add a "Manage plan" page for ECA**, like camp / course have. (ECA today = the Stage-1 "Other" schedule; there's no dedicated manage-plan surface.)
2. **Whole-course Confirm** — ECA must have a confirm-the-whole-course action, same as camp/course.
3. **Notify the teacher on edit / move / remove** — when an ECA session is edited, moved, or a teacher is removed, the teacher is notified, same as a normal course.
4. **⭐ Cancel-all** — ECA must have a cancel-everything action too ("เผื่อลงผิด" — in case it was entered wrong).

## §2 — customer's QUESTION (needs an answer)
Today, to add a teacher to an existing ECA schedule, does the admin have to **create a brand-new "Other" schedule** (can't add onto the existing one)? — OR can there be a **Manage-plan page with an "Add teacher" button** so a teacher can be added to the existing ECA?
- Customer's preference: a Manage-plan page + Add-teacher button (add onto the existing schedule, no need to recreate).
- "ส่วนการทำงานที่เหลือ ขวัญคิดว่าตามนี้อยู่ค่ะ" — the rest works as she expects.

## §3 — for @Sober (feasibility + size, no build yet)
- Does ECA (Stage-1 Other) have a plan/manage surface today, or only the create form + the grid? What would a "Manage plan" page hold (sessions list, teachers, edit/move/remove, confirm-all, cancel-all)?
- **Add-teacher onto an existing ECA** — is the model one-schedule-per-teacher today (so a new teacher = a new Other schedule), or can a schedule hold several teachers? What's needed for an Add-teacher button?
- Whole-course **Confirm** and **Cancel-all** for ECA — reuse the course/camp confirm+cancel machinery? notification on edit/move/remove — reuse the normal-course teacher-notify path?
- Does any of this generalise to Free/KOL (same Stage-1 object) or is it ECA-only? Flag scope.
- Sizes per piece; flag owner decisions.

## §4 — OWNER RULINGS 2026-09-21 ("เอาตามแนะนำ") — Sober's SPEC-088 recommendations accepted
1. Cancel-all is behind its OWN permission key (`other-cancel-all`).
2. Add-teacher applies from TODAY forward (not past rows).
3. Backfill existing ECA rows with a series key (one-off script) — YES.
4. Teacher notice words (add/remove) — Porter's draft accepted (TH+EN), below; owner may tweak bytes later.
GO build: series key (`0049` ⇒ 50), Manage-plan page (Confirm all · Cancel all · Add/Remove/Swap teacher · Add dates · edit title/kind/heads, each teacher change slot-checked in one tx), two teacher-notice placeholder kinds, generalises to Free/KOL. BE M+ · FE M.

### Notice words (Porter draft, owner-accepted 2026-09-21)
ADDED: `📅 เพิ่มตารางสอน / ADDED TO SCHEDULE` — คุณถูกเพิ่มเข้าตารางสอน · รายการ/วันที่/เวลา · กรุณาตรวจสอบตารางของคุณ · + EN (You have been added…).
REMOVED: `❌ นำออกจากตารางสอน / REMOVED FROM SCHEDULE` — คุณถูกนำออกจากตารางสอน · รายการ/วันที่/เวลา · + EN (You have been removed…).

## §5 — final owner rulings 2026-09-21
- **B (notify on move):** ACCEPTED as-built — teacher swap notifies old+new coach; a date/time move is silent (identical to a normal lesson today). A future "notify coaches on a date/time move (all types)" is a separate small task, NOT built now.
- **Cancel-all notice words (net-new `other_series_cancelled`)** — Porter draft, owner-accepted:
  `❌ ยกเลิกตารางทั้งชุด / SCHEDULE CANCELLED` — ตารางสอนถูกยกเลิกทั้งชุด · รายการ/เหตุผล/วันที่ · + EN (Your teaching schedule has been cancelled · Program/Reason/Date). Date line = customer's `DD-MM-YYYY`.

## §6 — RE-SPEC 2026-09-21/22: Manage plan = a MODAL, not a separate page (owner)
The separate full-page route `/scheduler/other/[key]` is the app's odd one out (everything else is a modal on the calendar) AND is the source of the 502. Owner's decision: **make Manage plan a MODAL/panel on the calendar** (like BookingModal / OtherSeriesDialog), and RETIRE the separate page + its route/guard.
- **ONE manage surface (modal), reached TWO ways:**
  1. click an OTHER block on the grid → BookingModal → its **Manage plan** button opens the manage MODAL (no navigation);
  2. click a row in **"Series in range"** (kept as a shortcut index) → opens the SAME manage modal directly.
- The modal holds what the page held: header (title · kind · heads · time · teachers+rates), the rows in date order with status chips, and the doors (Confirm all · Cancel all key-58 · Add/Remove/Swap teacher · Add dates · Edit header); a row still opens the ordinary BookingModal.
- Retire `/scheduler/other/[key]` (page + `seriesHref` navigation + the `ROUTE_ALIASES` guard entry). The 502 disappears with the route.

## §7 — owner ruling 2026-09-22: Move-session popup NOT gated by notice-days
The `teacher_change_notice_days` rule stays on the plan editor only; the Move-session popup does NOT enforce it — "ปล่อยไป มันเป็นเรื่องการใช้งานแอดมิน" (admins move sessions as the day requires; the popup keeps its freedom). Not a loophole to close — an intended admin affordance. The TASK-436 reassignment NOTICE (coach told on a popup move) still fires; only the notice-days BLOCK is not added to the popup.
