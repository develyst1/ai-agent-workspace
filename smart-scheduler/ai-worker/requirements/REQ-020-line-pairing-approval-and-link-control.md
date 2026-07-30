# REQ-020: Secure the LINE pairing — admin approval for teachers, name-collision handling, link control
- Status: READY_FOR_SA
- Priority: MEDIUM–HIGH (normal queue, but it closes a real privacy hole — SA to weigh)
- Requested: 2026-07-30 by stakeholder (คุณฟีน)
- Deadline: none
- Source: stakeholder direction 2026-07-30. **SUPERSEDES REQ-018** (unlink) — that becomes part of this.
  Pairs with **REQ-019** (people management screens).

## Problem / Goal
Linking a LINE account to a person in our system is currently **self-declared and unverified**. Anyone who
messages the bot can claim to be a teacher — or a parent — and be granted that person's access. The stakeholder
raised this directly ("คนทักมาอาจจะขอเป็นครูมั่ว ๆ ก็ได้"), and it is worse than assumed:

- **Teacher:** typing a nickname that exists in the roster links you **as that teacher** (if they haven't linked
  yet) — you then receive their schedule and their students' names.
- **Name collisions are unhandled:** the code takes the **first match**, so with two teachers nicknamed "off" it
  always binds the first one — exactly the case the stakeholder flagged.
- **Parent:** typing a phone that exists links you as that parent, and the bot immediately replies with **the
  list of that parent's children**.
- Typing an **unknown phone creates a brand-new parent record**, so anyone can generate junk records.
- There is **no way to unbind** a LINE link — a **teacher who has left keeps receiving schedule pushes** on their
  personal LINE, and staff cannot stop it.

Goal: make becoming a **teacher** on LINE something **staff approve**, make pairing unambiguous when names
collide, and give staff **control over existing links**.

## Requirement
1. **Teacher pairing requires staff approval.** A person claiming to be a teacher on LINE goes into a
   **pending queue**; staff **match them to the correct person in the roster** and approve. Only then do they get
   teacher access. (Confirmed: **teachers only** — see #2.)
2. **Parents keep self-service** — no approval gate (stakeholder's decision); control over them is the
   view/suspend capability in REQ-019.
3. **Name collisions must be resolvable:** when more than one person matches, staff must be able to see the
   candidates and pick the right one — pairing must never silently guess.
4. **Staff can remove/suspend an existing LINE link** — e.g. a departed teacher — so that person stops receiving
   notifications, without deleting their record or history.
5. Until approved, a pending claimant must **not** receive any teacher information.

## Acceptance Criteria
- [ ] Claiming to be a teacher on LINE does **not** grant access; it creates a **pending request** visible to staff.
- [ ] Staff can see pending requests (who claimed what, with their LINE display name), **pick the matching person**
      even when several share a name, approve or reject.
- [ ] On approval the person gets teacher access on LINE; on rejection they get nothing and are told politely.
- [ ] Staff can **unlink/suspend** an existing LINE link (teacher or parent) and that account stops receiving pushes.
- [ ] A parent can still self-register via LINE exactly as today.
- [ ] No existing linked user is disrupted by the change.

## Analysis / current state (Porter, read-only — for Sober to verify)
- `verifyAndLink` (`line-webhook.service.ts`): **teacher** = match `teachers.nickname` case-insensitively via
  `rows.find(...)` (**first match wins** → the collision bug) and bind if `lineUserId` is empty; **parent** =
  match `parents.phone`, bind if empty, **and return the children's names**; unknown phone →
  `findOrCreateParentByPhone` (**creates a record**).
- After TASK-046, one LINE user holds **one** active roster link (a new link moves the old one). Role precedence
  is **teacher → parent → admin**.
- **No pending/approval concept and no unlink command exist** — both are new.
- `app_settings.line_admin_user_ids` is a **notification subscription, not a roster identity** (Sober, TASK-046
  review) — it should be treated separately from "unlink a person".

## Constraints
- Don't break existing linked users, and don't remove parent self-registration.
- The staff-facing side belongs with the people screens on the **frontoffice** web (REQ-019).
- Keep TASK-046's "one active link per LINE user" rule unless deliberately changed.
- HOW (pending table, approval UX, what a rejected/pending user sees) is the SA's design.

## Out of Scope
- The parent/student management screens and demographics → **REQ-019**.
- Changing how a teacher proves identity beyond staff approval (no OTP/ID checks in this REQ).

## Questions
(SA + stakeholder. Porter answers as `> answer: ...`; business calls → `@Porter`, don't guess.)
1. **What does a pending person see meanwhile** — "your request is with staff, please wait", and can they still
   use nothing at all until approved? (Porter's lean: yes — a clear waiting message, no access.)
2. **Should staff be notified** when a new teacher request arrives (a LINE push to the admin list, as leave
   notifications already do), or is checking the screen enough? (Porter's lean: notify — otherwise a new teacher
   waits unnoticed.)
3. **Dual-role people** (teacher *and* parent at the school) — does this exist? It stayed unanswered in REQ-018.
   If yes, do they switch roles on demand, or should one account hold both? (Porter's lean: confirm whether it's
   real before designing for it.)
   > **answer (Porter, from คุณฟีน 2026-07-31): NO — option (ก). Nobody at the school is both a teacher and a
   > parent.** So **keep the current one-LINE-account = one-role rule** (TASK-046's "a new link moves the old
   > one"). **Do not build role switching or a both-surfaces mode** — no extra work, and the simplest design
   > stands. If that ever changes, it comes back as a new REQ rather than being pre-built now.
4. **Should the person be told when staff unlink them?** (Porter's lean: yes, a short LINE message — silent
   removal looks like a malfunction.)
