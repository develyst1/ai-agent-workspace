# REQ-051: Walk-in check-in — a QR poster at the centre opens a phone-friendly page (phone → child → check in)
- Status: **READY_FOR_SA — with one business decision the owner must make first (Q1)**
- Priority: **MEDIUM–HIGH** — real daily friction (nanny drop-offs, forgotten phones), but it touches attendance = money
- Requested: 2026-08-16 by stakeholder (owner)
- Deadline: none stated
- Source: owner, 2026-08-16 — *"web responsive page … เอาไปทำเป็น QR ไปแปะไว้หน้างาน ให้ลูกค้าที่ลืมเอามือถือมา หรือ
  พี่เลี้ยงพาลูกมาเรียนแทน แล้วแม่อาจจะไม่ได้กดเช็คอิน … สแกน QR แล้วเปิดเว็บเรา แล้วกรอกเบอร์ เลือกนักเรียน แล้วกดเช็คอินเลย"*

## Problem / Goal
Check-in today assumes the **parent** taps it in LINE. Reality at the counter: the mother didn't come, a **nanny or
grandparent** dropped the child off, or the phone was left at home — and the session goes unchecked. Staff then
fix attendance by hand, or it is never recorded at all.

**Goal: anyone standing at the centre with the child can check that child in, in under 15 seconds, with no app, no
login and no staff involvement** — by scanning a printed QR that opens a phone-friendly page: **enter phone →
pick the child → check in.**

## 🔴 The decision the owner must make first (Q1) — what a phone number is allowed to unlock
This page has **no login**. A phone number is the only thing the visitor types, and it is not a secret: it is
written on forms, known to relatives, and guessable at scale. Two consequences the owner must weigh, in plain
terms — I am not choosing this alone because it is a trade between counter convenience and customer trust:

- **Attendance is money.** A check-in consumes a session from a paid course/voucher and draws the freelance
  teacher's budget. A stranger who types a phone could burn a family's lesson.
- **Names are personal data.** If typing a phone lists that family's children, then anyone can type phone numbers
  and harvest **children's names**. This team has already fixed one PII leak on the LINE pairing path (TASK-047) —
  the same mistake at the front door would be worse.

**Porter's recommendation — "narrow window, minimum disclosure":** the page only ever works for a session that is
**within the check-in window today at this centre** (the existing ±30-minute rule), only lists children who
**actually have a session in that window**, and shows **nicknames**, not full names. A phone with nothing on today
returns the same neutral message as a phone that doesn't exist — so it cannot be used to test whether a number
belongs to a customer. That keeps the counter experience intact and removes almost all of the abuse value.

## Requirement
1. A **printable QR** that staff can put on a poster at the counter; scanning it opens a **responsive web page** on
   any phone browser — **no app, no login, no LINE account required**.
2. The visitor **enters a phone number** and is shown **only the children with a session inside the check-in window
   right now**, then taps one and confirms.
3. The page **records a normal check-in** — the same event, the same rules, the same consequences as a LINE
   check-in (REQ-050's requirement 5 applies: right child, right session, named confirmation).
4. **Nothing else is exposed:** no schedules, no history, no contact details, no other families — and no ability to
   change anything other than checking in.
5. **Staff can see it happened and can correct it** (who was checked in, when, from this page), and a correction
   returns the session and reconciles the money (REQ-050 AC-5).
6. Works on a mid-range phone over mobile data, one-handed, in Thai and English.

## Acceptance Criteria
- [ ] **AC-1 (the happy path)** — **Given** a nanny at the counter with a child whose session starts in 10 minutes,
      **When** they scan the QR, type the parent's phone, pick the child and confirm, **Then** the session is marked
      attended, the page shows the confirmation (child · time · teacher), and it appears in the staff calendar.
- [ ] **AC-2 (several children)** — **Given** a phone with two children in the window, **When** the number is
      entered, **Then** **both** are listed and only the tapped one is checked in.
- [ ] **AC-3 (privacy floor)** — **Given** a phone number with **no** session in the window — including a number
      that belongs to nobody — **When** it is entered, **Then** the page shows the **same neutral message** in both
      cases and reveals **no** name, no child, and no hint that the number exists.
- [ ] **AC-4 (window)** — **Given** a session outside the check-in window (too early, or already finished),
      **When** the visitor tries, **Then** it is refused with a clear reason and nothing is recorded.
- [ ] **AC-5 (no double-consumption)** — **Given** a session already checked in (from LINE or this page), **When**
      the visitor tries again, **Then** they are told it is already done and **nothing is consumed twice**.
- [ ] **AC-6 (abuse resistance)** — Repeated attempts with different numbers from one device are **rate-limited**,
      and the limit's behaviour is stated in the SPEC rather than left to a library default.
- [ ] **AC-7 (staff visibility)** — Every check-in made from this page is **distinguishable** in the staff view
      (source = walk-in), so staff can tell it apart from a parent's LINE check-in.
- [ ] **AC-8 (device reality)** — The page is usable one-handed on a 375 px screen, hit targets ≥ 44 px, and passes
      the FRONTEND-STANDARD checks the team already applies (REQ-041).
- [ ] **AC-9 (bilingual)** — Every string is TH and EN, switchable on the page, with no raw i18n key.

## User-facing wording (Porter as UX writer)
- Page title — TH: `เช็คอินหน้างาน` · EN: `Check in`
- Phone field — TH: `เบอร์โทรผู้ปกครอง` · EN: `Parent's phone number` · placeholder `08xxxxxxxx`
- Button — TH: `ค้นหา` · EN: `Continue`
- Child list heading — TH: `เลือกนักเรียนที่มาเรียน` · EN: `Select the student`
- Child row — TH: `{nickname} · {time} น. · ครู{teacher}` · EN: `{nickname} · {time} · {teacher}`
- Confirm button — TH: `เช็คอิน` · EN: `Check in`
- Success — TH: `เช็คอินแล้ว: {nickname} · {time} น. · ครู{teacher} ขอให้สนุกกับการเรียนค่ะ` ·
  EN: `Checked in: {nickname} · {time} · {teacher}. Have a great session!`
- **Neutral not-found / nothing-now message (used for both cases — this exact behaviour is AC-3)** —
  TH: `ตอนนี้ยังไม่มีคาบเรียนที่เช็คอินได้สำหรับเบอร์นี้ค่ะ กรุณาติดต่อเจ้าหน้าที่` ·
  EN: `There is no session available to check in for this number right now. Please see our staff.`
- Already checked in — TH: `คาบนี้เช็คอินไปแล้วค่ะ` · EN: `This session is already checked in.`
- Poster line (printed next to the QR, Porter's copy) — TH: `สแกนเพื่อเช็คอิน` · EN: `Scan to check in`

## Constraints
- **Attendance rules are not re-invented here** — same window, same consumption, same money effects as any other
  check-in. This REQ adds a **door**, not a second set of rules.
- Public page: it must not require or expose credentials, and it must not become a second read-only view of
  customer data.
- Must satisfy REQ-050 requirement 5 (right child, right session, named confirmation).

## Out of Scope
- Registration, booking, payment, or viewing a schedule from this page — check-in only.
- Per-child personal QR codes (a different product; the owner asked for one poster at the counter).
- Replacing the LINE check-in — this is an additional route for people without it.

## Questions
- **Q1 (to owner — the one that shapes the design):** do you accept the "narrow window, minimum disclosure" rule
  above (only sessions inside the check-in window · nicknames only · identical message for unknown numbers)? If you
  want the page to be more helpful than that — e.g. show today's whole schedule for the phone — say so and I will
  write it, but understand it becomes a public lookup for anyone holding a phone number.
  > answer: _pending_
- **Q2 (to owner):** should the page also let the visitor **report an absence** ("we're here but the sibling isn't
  coming")? Porter's lean: **no** — one job per screen; leave has its own rules and cut-off (REQ-047).
  > answer: _pending_
- **Q3 (to owner):** one QR for the whole centre, or one per room/coach area? Porter's lean: **one** — a poster per
  area is more to maintain and gains nothing, since the child list is already narrowed by time.
  > answer: _pending_
- **Q4 (to SA):** we already have a token-based `/checkin?token=` path (and REQ-015 deliberately dropped the QR
  button from the LINE menu). Does this page reuse that mechanism with a different entry point, or does it need its
  own? Say which, and whether anything in the existing path assumes a logged-in parent.
