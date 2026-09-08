# REQ-083: เช็คอินแล้วเปลี่ยนเป็นลาป่วย — สิทธิ์ยังถูกตัดไปแล้ว (owner's **FIX-008**)

- Status: **DRAFT — ✅ UNBLOCKED 2026-09-05.** `C-24` answered by the owner. One read by @Sober, then ACs.
- Requested: **2026-09-05**, by the owner, in his customer-facing list. **Never captured here before today.**
- Priority: **the largest of the three new items by a distance.** It is not a display bug.

## The report, verbatim

> *"หน้าคอร์ส เมื่อกดเช็คอิน แล้วมาเปลี่ยนเป็นลาป่วย หน้าข้างนอกมันขึ้นว่าใช้สิทธิ์ไปแล้วครั้งนึง"*

An admin marks a session **attended**, then corrects it to **sick leave**. **The session outside still counts as
used.** The correction does not give the session back.

## 🔴 Why this is blocked, and it is not caution for its own sake

**`C-24` — "Can an attended session be undone?" — is `_(unanswered)_` in `SYSTEM-FACTS-CONTRADICTIONS.md`.**
That file's rule is absolute: **only the owner closes an entry, and nobody may build on an open one.**

📌 **Asking for this FIX is not the same as answering C-24, and the difference is the whole requirement.**
He is reporting that **one path** behaves wrongly. **C-24 asks whether undoing attendance is a thing the system
should permit at all.** A fix written before that is answered will encode an answer by accident — which is
exactly the failure `REQ-078`'s AC-9 hit this morning, where an acceptance criterion sat on an unsettled fact for
a week and nobody noticed.

## What makes it expensive — stated so nobody prices it as a display bug

**Attendance is not a label. Reaching `ATTENDED` moves things:**
- **It consumes the entitlement** — a course session, a voucher session (`used_sessions` / `used_hours`).
- **It posts revenue** at day-end for the types that post there (1st Trial, 1HR, `OTHER`).
- **`SICK_LEAVE` has its own money rules** — `C-04` (owner-answered 2026-09-04) and the leave-quota rule from
  `C-22` (*quota is consumed only for leave declared AFTER the course was created*).
⇒ **"Change it to sick leave" is a reversal across three systems**, and the visible symptom — the counter outside
— may be the only one anybody has noticed. **Nobody has checked whether the revenue reverses.**

⚠️ **A second possibility nobody has ruled out:** the entitlement may be released correctly and only the **display**
is stale. **Then the money question does not arise and this is small.** ⇒ **One read decides which world we are
in, and it is not a build.**

## What Porter needs, in order

1. 🔴 **The owner answers `C-24`** — may an attended session be undone, and by whom.
2. **@Sober: one read** — when attendance is changed to `SICK_LEAVE`, what is actually reversed? Entitlement,
   revenue, both, neither? **Is the symptom a stale display or a real un-reversal?**
3. **Then** Porter writes the ACs. Not before.

## Questions for the owner, beyond `C-24`

1. **Does the correction give the session back?** *(The obvious answer is yes — but a shop may deliberately not
   refund a same-day change, and that is his rule to state, not mine to assume.)*
2. **Does `C-22`'s rule apply?** A sick leave declared today, on a course created weeks ago, **consumes leave
   quota**. ⇒ **Correcting an attendance to sick leave would spend a leave allowance.** Is that intended, or
   should a correction be quota-free?
3. **Is there a time limit** — same day only, or any time?

---

## ✅ UNBLOCKED — the owner answered `C-24` on 2026-09-05

> *"C-24 ตอบเลย ยกเลิกได้ แล้วคืนสิทธิ์ให้ด้วย"*

**An attended session CAN be undone, and the entitlement is GIVEN BACK.** Dated into
`SYSTEM-FACTS-CONTRADICTIONS.md`; **30 entries there remain unanswered.**

⇒ **Question 1 above is answered: the correction gives the session back.** The reported symptom —
*"ข้างนอกมันขึ้นว่าใช้สิทธิ์ไปแล้ว"* — **is a defect against his ruling, not a design gap.**
⇒ **Side A of C-24 is superseded** for cancel: the `isDelivered` guard shipped in 2026-08-03 as an acceptance
criterion, and the owner overrode it the same day. **The guard on edit/move was never in dispute.**

### 🔴 Three things his answer does NOT cover — do not read them into it

1. **Does posted REVENUE reverse?** He said the **entitlement** comes back. **He did not mention money**, and
   money is the category he has guarded most consistently — *money never moves as a side effect of a staff click*.
   ⚠️ **Both answers are defensible:** the session was not delivered, so the revenue is not earned; **or** the
   reversal stays a deliberate backoffice act, as it is for cancellations today. **His call, and it is the one
   question in this REQ I would not ship without.**
2. **Does the correction spend LEAVE QUOTA?** `C-22` (owner-answered): quota is consumed for a leave **declared
   after the course was created** — which a correction always is. ⇒ **As the rules stand today, giving the
   session back would immediately spend a leave allowance to do it.** The family ends level or worse. **Almost
   certainly not what he means, but it follows from two of his own rulings and must be asked, not assumed.**
3. **Is a REASON still required?** Side B of C-24 allowed the undo *"provided a non-empty reason is supplied and
   stored for audit"*. **His answer today did not repeat that condition.** Dropped, or still standing?

### The read still owed — @Sober, and it decides the size of this REQ

**When an attendance is changed to `SICK_LEAVE`, what is actually reversed — entitlement, revenue, both,
neither?** And **is the reported symptom a stale display, or a real un-reversal?**
📌 **If the entitlement already comes back and only the counter outside is stale, this is a display fix.**
Nothing above changes; it just gets much smaller. **Nobody has looked yet.**

---

# ✅ FULLY ANSWERED 2026-09-05 — the three open questions are closed

> **1.** *"เงินย้อนกลับด้วย แต่เป็นสร้าง transaction อีกอัน ย้อนกลับแทน เช่น รายได้เข้าแล้ว 1000 บาท พอกดยกเลิก
> ควรเพิ่ม ติดลบ 1000 บาท"* · **2.** *"ไม่กินโควตาลา"* · **3.** *"ไม่ต้องใส่เหตุผล"*

📌 **Answer 1 is the important one and he did not just say "yes".** He specified **HOW**: a **compensating
entry**, not an edit or a delete of the original. **The ledger keeps both rows and the history stays readable** —
which is the same principle already written into `sale-post.ts` (*"a reversal is a manual movement"*) and the
reason `revenuePosted` over-counts on a re-run. **He asked for the accountant's answer, not the programmer's.**

🔴 **Answer 2 creates a deliberate EXCEPTION to `C-22`, and it must be recorded as one.** `C-22` (his own ruling,
2026-09-04): leave quota is consumed for a leave **declared after the course was created** — and a correction is
always after. **Left alone, giving a session back would have cost a leave to do it.** ⇒ **A correction is not a
declaration.** `C-22` is unchanged for real leave; **this is a named exception, not a revision.**

## Acceptance Criteria

### The correction itself
- [ ] **AC-1** — **Given** a booking marked `ATTENDED`, **When** an admin changes it to `SICK_LEAVE`, **Then** it
      is accepted. **No reason is required** *(owner, 2026-09-05 — C-24 Side B's reason condition is dropped)*.
- [ ] **AC-2** — **Then** the consumed entitlement is **given back** — the course session / voucher session /
      hours return to the family's balance.
- [ ] **AC-3** — 🔴 **Then the counter the parent and the admin see OUTSIDE the course page agrees.** This is the
      reported defect: *"ข้างนอกมันขึ้นว่าใช้สิทธิ์ไปแล้ว"*. **A balance that is right in the database and wrong on
      the screen has not been fixed.**
- [ ] **AC-4** — **Then NO leave quota is consumed.** *(Owner, 2026-09-05 — the named exception to `C-22`.)*

### The money
- [ ] **AC-5** — **Given** the session had **posted revenue** of ฿X, **When** the attendance is undone, **Then** a
      **NEW movement of −฿X** is written. **The original row is never edited and never deleted.**
- [ ] **AC-6** — **Given** the session **posted nothing** (free booking, or the day-end had not run yet), **When**
      it is undone, **Then** **no movement is written at all** — not a ฿0 row. *(The same rule as `REQ-078` AC-4,
      and it is one rule in the product, not two.)*
- [ ] **AC-7** — 🔴 **Given** an undo that has already written its reversal, **When** it somehow runs again,
      **Then** **no second −฿X appears.** The reversal carries its own idempotency key, distinct from the
      original's `rev:<bookingId>`. ⚠️ **Named because `revenuePosted` already over-counts on a re-run
      (`lib/sale-post.ts`) — the identical mistake is one careless key away.**
- [ ] **AC-8** — **Given** a corrected booking, **When** it is later marked `ATTENDED` again, **Then** revenue
      posts again and the entitlement is consumed again. **Two reversals and two postings, all four visible.**

### What must not happen
- [ ] **AC-9** — **Given** any undo, **Then** the **original** `ATTENDED` history is still legible: what was
      posted, when, and that it was reversed. **Nothing is rewritten to look as though it never happened.**
- [ ] **AC-10** — **Given** the edit/move guard, **Then** it is **untouched.** `C-24` was only ever about
      **cancel/undo**; nobody asked for attended sessions to become freely editable.

## User-facing wording (Porter, UX writer)

| Where | Thai |
|---|---|
| Confirm dialog | **เปลี่ยนเป็นลาป่วย?**<br>คืนสิทธิ์ให้ {ชื่อน้อง} 1 ครั้ง · ไม่ตัดสิทธิ์ลา<br>{ถ้ามีเงิน:} และจะบันทึกรายการคืนเงิน ฿{X} |
| After | **เปลี่ยนเป็นลาป่วยแล้ว ✅ คืนสิทธิ์ให้ 1 ครั้ง** |
| Ledger reason (English, internal) | `REVERSAL — attendance undone` |

⚠️ **The dialog names what changes BEFORE it happens**, and names the money when there is money. **An admin
correcting a mis-click should not discover a −฿1,000 entry afterwards.**

## Still owed — @Sober's read, and it only affects SIZE

**What is reversed today: entitlement, revenue, both, neither — and is the symptom a stale display or a real
un-reversal?** **If the entitlement already comes back and only AC-3 fails, most of the above is already built.**
**Status: `READY_FOR_SA`.** The behaviour is fully specified; the read tells the SA how much of it exists.
