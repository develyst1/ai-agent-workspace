# REQ-018: Unlink / change a LINE account link — and what a dual-role person should see
- Status: DRAFT (needs คุณฟีน's answers before READY_FOR_SA)
- Priority: LOW–MEDIUM (not urgent — TASK-046 removed the workaround pressure)
- Requested: raised by Porter 2026-07-30 from live testing; scoped by Sober as a **product decision**, not an SA call
- Deadline: none
- Source: LINE testing 2026-07-30 + TASK-046 review.

## Problem / Goal
A LINE account gets **bound** to a person in our system (parent by phone, teacher by nickname). Today there is
**no way to unbind it** — no unlink/logout command exists, and unfollowing/refollowing the OA does **not** clear
it (the link lives in our database, not on LINE's side).

TASK-046 already fixed the worst of it: a linked user can now re-run `สมัคร` and **move** their link to another
role/person. So the everyday "I linked the wrong thing" case is self-serviceable. What remains is genuinely a
**business decision**, not a technical gap:

1. **Nobody can fully unbind** — only move to another link. A person who wants to stop being linked at all can't.
2. **The school can't unbind someone else** — e.g. a **teacher who has left** keeps receiving schedule pushes on
   their personal LINE, and staff have no way to cut that off.
3. **One LINE account can now hold only ONE role.** A person who is genuinely **both a teacher and a parent** at
   the school must choose; whichever they pick, the other surface disappears for them.

## Requirement (to be finalised after the Questions below)
1. A person must be able to **unlink their own LINE account** from the system.
2. Staff/admin must be able to **remove someone else's LINE link** (e.g. a departed teacher).
3. The system must behave correctly and predictably for a person who is **both a teacher and a parent**.

## Acceptance Criteria (draft — depends on the answers)
- [ ] A linked user can unlink themselves and is told clearly what that means (they stop receiving notifications).
- [ ] Staff can remove a person's LINE link from the admin UI; that person stops receiving pushes.
- [ ] The dual-role behaviour matches whatever คุณฟีน chooses below, and is not silent.

## Analysis / current state (Porter, read-only — for Sober to verify at spec time)
- No unlink/logout/change-role command exists in the bot (grep: zero hits).
- Links live on `parents.line_user_id` / `teachers.line_user_id`; admins are a separate list in
  `app_settings.line_admin_user_ids` — **that list is a notification subscription, not a roster identity**, so it
  should probably be treated separately from "unlinking a person" (Sober's point at the TASK-046 review).
- After TASK-046: one LINE user ⇒ **one** active roster link (a new link **moves** the old one).
- Role precedence is **teacher → parent → admin**, so a dual-role person linked as a teacher silently loses the
  parent surface (can't check in their own child).
- Removing a link today requires a **direct DB edit** — not something staff can or should do.

## Constraints
- Don't undo TASK-046's "one active link" rule without a deliberate decision — it exists to stop a person being
  silently both.
- Unlinking must not delete the person's data (bookings, students, history) — only the LINE binding.

## Out of Scope
- Changing how linking itself works (`สมัคร` by phone / nickname) — that stays.

## Questions
(Porter → คุณฟีน. Answers turn this into READY_FOR_SA.)
1. **Should a user be able to unlink themselves from LINE** (e.g. a "ยกเลิกการเชื่อมต่อ" button), or should
   unlinking be **staff-only**? (Porter's lean: allow self-unlink — it's their own account — **plus** staff-side.)
2. **Should staff be able to unbind someone else** from the admin UI — specifically a **teacher who has left**,
   so they stop getting schedule notifications? (Porter's lean: yes; this is the case with real consequences.)
3. **The dual-role case — how common is it, and what should happen?** Is there anyone who is **both a teacher and
   a parent** at the school?
   - (a) Not a real case → keep one-role-only (simplest, ships as-is).
   - (b) It happens → they should be able to **switch** between their two roles on demand.
   - (c) It happens → they should see **both** surfaces at once (biggest change).
4. When someone is unlinked, should they get a **LINE message telling them** so it isn't silent?
