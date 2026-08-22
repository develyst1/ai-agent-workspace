# REQ-051: Walk-in QR page at the centre — enter phone → pick the child → check in **or** take leave
- Status: READY_FOR_SA
- Priority: **MEDIUM–HIGH** — real daily friction (nanny drop-offs, forgotten phones), and it touches attendance = money
- Requested: 2026-08-16 by stakeholder (owner); **concept confirmed and simplified by him the same day**
- Deadline: none stated
- Source: owner, 2026-08-16 — *"web responsive page … เอาไปทำเป็น QR ไปแปะไว้หน้างาน ให้ลูกค้าที่ลืมเอามือถือมา หรือ
  พี่เลี้ยงพาลูกมาเรียนแทน"* → then, when Porter raised the exposure question: *"ไม่เข้าใจนาย worry อะไร ก็แค่สแกนเพื่อ
  เข้าหน้าเว็บ ง่ายๆ มีแค่กรอกเบอร์ทันที กรอกเสร็จ เลือกเด็กของเบอร์ แล้วกดเช็คอิน **และ ลาได้ เผื่ออีกคนลา แต่อีกคนมา**
  แค่นี้นะ concept"*

## Problem / Goal
Check-in today assumes the **parent** taps it in LINE. At the counter, reality is a nanny or grandparent dropping
the child off, or a phone left at home — so the session goes unrecorded and staff patch attendance by hand.

**Goal (the owner's concept, verbatim in shape): scan the QR → type the phone → see that phone's children →
per child, tap เช็คอิน or แจ้งลา. Nothing else.** The two-action design is his, and it is right: siblings come as a
pair — one attends, one doesn't — and a page that can only check in would send staff back to their desk anyway.

## Requirement
1. A **printable QR** for a poster at the counter; scanning opens a **responsive web page** in any phone browser —
   **no app, no login, no LINE account**.
2. The visitor **types a phone number**, and the page lists **that phone's children who have a session today**.
3. **Per child, two actions: `เช็คอิน` and `แจ้งลา`** — so one sibling can be checked in and the other excused in
   the same visit (the owner's explicit case).
4. **Both actions are the normal events**, with the same consequences as their LINE equivalents: a check-in
   consumes the session and obeys REQ-050 (right child, right session, named confirmation); a leave re-owes the
   session and extends the plan exactly as REQ-030 defines.
5. **Nothing else is exposed and nothing else can be changed** — no schedules beyond today's session, no history,
   no contact details, no other families, no editing.
6. **Staff can see and correct what this page did** — every action is marked as coming from the walk-in page, and a
   correction returns whatever it consumed (REQ-050 AC-5).
7. Works one-handed on a mid-range phone over mobile data, in **Thai and English**.
8. **A leave taken inside REQ-047's cut-off needs an admin.** It is allowed (the owner's decision), but it is
   recorded as **`PENDING_APPROVAL`**, the admin is notified immediately, and it becomes a real leave only when an
   admin approves — one tap on the existing approval surface (the REQ-020 teacher-claim pattern), or on the spot at
   the counter with an **admin code**. A leave **outside** the cut-off needs no approval at all.

## What Porter raised, what the owner decided, what Porter kept anyway
He asked what the worry was, so plainly: **the page has no login, and a phone number is not a secret** — it is on
forms, known to relatives, and guessable. Two exposures follow, and only the first is a real question of taste:
- **Attendance is money.** A stranger who types a phone could burn a family's paid lesson (or now, cancel one).
- **A phone → children lookup can be harvested.** Typing numbers would reveal **children's names** to anyone. This
  team already fixed one PII leak on the LINE pairing path (TASK-047).

**Owner's decision: build the simple flow as described** — including **leave**, which overrules my earlier lean.
Accepted; his sibling case is a better argument than my "one job per screen".

**Three safeguards Porter is keeping, because none of them changes his flow by even one tap:**
1. **Only today's sessions** are listed (which the concept already implies — nobody checks in for next Tuesday).
2. **Nicknames, not full names** — enough for a nanny to recognise the child, useless as a harvested list.
3. **One neutral message** for "this phone has nothing today" and "this phone isn't ours", plus a **rate limit** on
   repeated attempts from one device — so the page cannot be used to test whether a number is a customer.
If the owner wants any of these three removed, say so and I will remove it — but they cost him nothing.

## Acceptance Criteria
- [ ] **AC-1 (check in)** — **Given** a nanny at the counter with a child whose session is today, **When** they
      scan, type the parent's phone, and tap `เช็คอิน` for that child, **Then** the session is marked attended, the
      page confirms (child · time · teacher), and it appears in the staff calendar.
- [ ] **AC-2 (the sibling case — the owner's reason for the REQ)** — **Given** a phone with **two** children who
      both have a session today, **When** the visitor taps `เช็คอิน` for one and `แจ้งลา` for the other, **Then**
      exactly that happens: one attended, one on leave, neither action touching the other child.
- [ ] **AC-3 (leave behaves like a leave)** — **Given** a leave taken on this page, **When** it is recorded,
      **Then** the session is re-owed and the plan extends exactly as a LINE leave would, and REQ-049's
      notification fires with the same setting.
- [ ] **AC-4 (privacy floor)** — **Given** a phone number with **no session today** — including a number that
      belongs to nobody — **When** it is entered, **Then** the page shows the **same neutral message** in both
      cases and reveals no name, no child, and no hint that the number exists.
- [ ] **AC-10 (late leave needs an admin)** — **Given** a session starting in 10 minutes (inside the cut-off),
      **When** a visitor taps `แจ้งลา`, **Then** the page says it is **waiting for admin confirmation**, the admin is
      notified immediately, and the session is **not** yet a leave. **When** an admin approves, **Then** it becomes a
      normal leave (re-owed, plan extends). **When** nobody approves before the session starts, **Then** it stays
      pending and the session follows the normal attendance path — it never silently becomes a leave, and never
      silently disappears.
- [ ] **AC-11 (the easy case stays easy)** — **Given** a leave taken **outside** the cut-off, **When** it is
      submitted, **Then** it is recorded straight away with **no approval step**.
- [ ] **AC-5 (no double-consumption)** — **Given** a session already checked in (from LINE or here), **When** the
      visitor tries again, **Then** they are told it is already done and **nothing is consumed twice**.
- [ ] **AC-6 (abuse resistance)** — Repeated attempts with different numbers from one device are **rate-limited**,
      and the limit's behaviour is stated in the SPEC rather than left to a library default.
- [ ] **AC-7 (staff visibility)** — Every action from this page is **distinguishable** in the staff view (source =
      walk-in), so staff can tell it from a parent's own LINE action.
- [ ] **AC-8 (device reality)** — Usable one-handed at 375 px, hit targets ≥ 44 px, and passes the
      FRONTEND-STANDARD checks the team already applies (REQ-041).
- [ ] **AC-9 (bilingual)** — Every string in TH and EN, switchable on the page, no raw i18n key.

## User-facing wording (Porter as UX writer)
- Page title — TH: `เช็คอินหน้างาน` · EN: `Check in`
- Phone field — TH: `เบอร์โทรผู้ปกครอง` · EN: `Parent's phone number` · placeholder `08xxxxxxxx`
- Continue — TH: `ค้นหา` · EN: `Continue`
- List heading — TH: `คาบเรียนวันนี้` · EN: `Today's sessions`
- Child row — TH: `{nickname} · {time} น. · ครู{teacher}` · EN: `{nickname} · {time} · {teacher}`
- Actions — TH: `เช็คอิน` / `แจ้งลา` · EN: `Check in` / `Take leave`
- Leave confirm step (one tap, so a mis-tap can't cancel a lesson) — TH: `ยืนยันแจ้งลา {nickname} คาบ {time} น.?` ·
  EN: `Confirm leave for {nickname} at {time}?`
- Check-in success — TH: `เช็คอินแล้ว: {nickname} · {time} น. · ครู{teacher} ขอให้สนุกกับการเรียนค่ะ` ·
  EN: `Checked in: {nickname} · {time} · {teacher}. Have a great session!`
- Leave success (outside the cut-off) — TH: `แจ้งลาแล้ว: {nickname} · {time} น. — คาบนี้จะถูกเลื่อนไปต่อท้าย` ·
  EN: `Leave recorded: {nickname} · {time} — this session moves to the end.`
- Leave submitted **inside** the cut-off (pending) — TH: `ส่งคำขอลาแล้ว: {nickname} · {time} น. — รอแอดมินยืนยันค่ะ` ·
  EN: `Leave requested: {nickname} · {time} — waiting for admin confirmation.`
- Admin code prompt (the on-the-spot fast path) — TH: `ให้แอดมินใส่รหัสเพื่อยืนยันทันที (หรือรอแอดมินกดอนุมัติ)` ·
  EN: `An admin can enter their code to confirm now — or wait for approval.`
- **Neutral not-found / nothing-today message (used for both cases — this is AC-4)** —
  TH: `ตอนนี้ยังไม่มีคาบเรียนของเบอร์นี้ค่ะ กรุณาติดต่อเจ้าหน้าที่` ·
  EN: `There is no session for this number right now. Please see our staff.`
- Already checked in — TH: `คาบนี้เช็คอินไปแล้วค่ะ` · EN: `This session is already checked in.`
- Poster line next to the QR — TH: `สแกนเพื่อเช็คอิน / แจ้งลา` · EN: `Scan to check in or take leave`

## Constraints
- **Attendance and leave rules are not re-invented here** — same consumption, same re-owing, same extension, same
  notification. This REQ adds a **door**, not a second rulebook.
- Public page: never requires or exposes credentials, and never becomes a second read-only view of customer data.
- Must satisfy REQ-050 (right child, right session, named confirmation).

## Out of Scope
- Registration, booking, payment, or viewing a schedule — check-in and leave only.
- Per-child personal QR codes (the owner asked for one poster at the counter).
- Replacing the LINE flows — this is an extra route for people without them.

## Questions
- **Q1 (to owner):** should a counter leave inside REQ-047's cut-off be allowed?
  > **answer (owner, 2026-08-16): YES — allowed (option ก) — but an ADMIN must know about it and approve it.**
  > His shape: either the admin types an **admin code** on the page at that moment, or it goes to the admin as an
  > **approval**, *"คล้ายๆ approve LINE ครู linking"* (the REQ-020 teacher-claim pattern).
  >
  > **⇒ New requirement 8 (below).** Porter's reading, for the SPEC to design against — say if it's wrong:
  > - **A leave taken on this page INSIDE the cut-off is a request, not a completed act.** It is recorded
  >   immediately, marked `PENDING_APPROVAL`, and the admin is notified the same instant (REQ-049's channel).
  > - **The admin approves or rejects in one tap**, reusing the existing approval surface pattern from REQ-020 so
  >   staff learn one mechanism, not two.
  > - **An admin standing at the counter can approve on the spot with their admin code**, which is the fast path
  >   the owner described — same decision, taken immediately instead of remotely.
  > - **Outside the cut-off** (a normal, early leave) the page just records it — no approval needed, no friction
  >   for the common case.
  > - **The visitor is told the truth**: "แจ้งแล้ว รอแอดมินยืนยัน" — never a confirmation that implies it's done.
  > - **If nobody approves before the session starts**, it stays pending and the session follows the normal
  >   no-show/attendance path — the request must not silently become a leave, and must not silently vanish.
- **Q2 (to owner):** one QR for the whole centre, or one per room/coach area? *(Porter's lean: one.)*
  > **RESOLVED 2026-08-22 by Porter (default adopted, not left dangling): ONE QR for the whole centre.**
  > Reason: the owner asked for *"QR ไปแปะไว้หน้างาน"* — singular, at the counter — and a per-area QR would have to
  > carry which area it is, which is a distinction the page never uses (it lists the child's session wherever it
  > is). One poster, one URL, nothing to keep in sync. **If the owner wants per-area codes, say so and it is a
  > small change — but SPEC-050 will no longer wait on it.**
- **Q3 (to SA):** we already have a token-based `/checkin?token=` path (and REQ-015 deliberately dropped the QR
  button from the LINE menu). Does this page reuse that mechanism with a different entry point, or need its own?
  Say which, and whether anything in the existing path assumes a logged-in parent.
