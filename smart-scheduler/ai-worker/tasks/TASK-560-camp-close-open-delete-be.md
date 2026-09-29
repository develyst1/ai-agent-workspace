# TASK-560 — REQ-110 item 8: camps Close / Open, and Delete when empty — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-29) · **Size S.** Khwan, REQ-110 item 8. **Fourth of the round** (1 ✅ → 12 ✅ → 7 ✅ → **8**).

## §0 The owner's ruling, complete as given
- **Delete** is allowed **only when the camp has NO bookings.**
- **Otherwise Close**, which **stops NEW bookings only. Existing bookings stay.**
- **Open** re-allows new bookings.
🚫 **Nothing else about camps changes.**

## §1 Build
- 🔑 **"Has no bookings" is decided by the SERVER at the moment of the delete**, never by a button that was enabled a minute ago. ⚠️ **A camp that gained a booking while the dialog was open must be REFUSED, in words the admin can act on.** *That is the whole reason this is S and not XS.*
- **Closed must block EVERY path that creates a booking into that camp**, not only the obvious one. 🔑 **Derive the set and name it** — *a close that only the admin form honours is not a close* (**the same rule as item 2's block**).
- ✅ **Pin all three directions:** **Close ⇒ new refused, existing untouched** · **Open ⇒ new allowed again** · **Delete ⇒ only on empty, refused otherwise.**
- ⚠️ **Say whether a closed camp still SHOWS anywhere** (rosters, reminders, the day's notices). 🚫 **Do not change what it shows — state it**, so the FE half and @Porter know what they are describing.
- ⚠️ **If a delete can orphan anything** (a week, a day row, a rate), **name it.** 🔑 **"No bookings" is not the same as "no rows".**

## §2 Migration
⚠️ **If this needs one, it is the round's first** ⇒ **hand-numbered into the series, and TELL ME THE NUMBER as soon as it exists** — **@Porter carries the uat range, which is 62 today.**

## §3 Not in scope
🚫 The FE half (mine to cut next) · 🚫 camp pricing, rosters or reminders · 🚫 Palm's items.

## Definition of Done
- [ ] Delete **server-checked at the moment of the act**, refused with actionable words when not empty · **every booking-creating path into a closed camp derived and NAMED** · all three directions pinned · what a closed camp still shows **stated, not changed** · orphan risk named · migration number reported **if any** · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · 🔑 mutations incl. **a delete that trusts a stale check** and **a close one path ignores** · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-29): Delete built (server-checked under a row lock); Close/Open already gated EVERY booking path, now pinned by behaviour · 🔴 **a finding for the owner: today's Close does MORE than "stop new bookings"** (stated, not changed) · **3552 / 0 normally, and 3× unreachable, 0 failed queries** · tsc 0 · **62 = 62: NO migration** · eight mutations bite

## §0 Terms
- **A "camp" is a camp WEEK** (`camp_weeks`).
- **A "booking" into it is a `camp_days` row**: a child's day, drawn on a package.
- **Close/Open already existed** (`PATCH /camp/weeks/:id { status }`, TASK-401/418). **Delete did not.**

## §1 🔑 Every path that creates a booking into a week: derived and NAMED
- **`camp_days` has exactly ONE writer: `planDays`**, which refuses a non-OPEN week (`CAMP_WEEK_CLOSED`). It's reached from **exactly two routes:**
  1. **`POST /camp/packages`**: `createPackage` with its optional `firstWeek`;
  2. **`POST /camp/packages/:id/days`**: `redeemDays`.
- **Nothing else:**
  - **a CANCELLED day is final** (`assertDayTransition`), so no path revives one;
  - a mark / undo / check-in / the day-end cut only change an EXISTING day's status;
  - the coach blocks on the calendar are derived rows, not children's bookings.
- **Pinned by behaviour:**
  - **both routes are driven against a CLOSED week ⇒ 409, nothing written**; **reopened ⇒ the same request plans the day**;
  - the set is pinned **by source**: one `insert(campDays)` in `src` + `scripts`, inside `planDays`, and two calls of it, so **a second writer appearing BITES** (C2).
- **Close touches nothing existing:** the status flip never writes `camp_days` (pinned).

## §2 Delete: `DELETE /camp/weeks/:id` (`deleteWeek`)
- **No body.** "Is it empty?" is the SERVER's question, asked **inside the delete's own transaction**:
  - **the week row is locked FIRST (`FOR UPDATE`), then its days are counted.**
  - A booking inserting into the week takes the FK's KEY SHARE lock on that same row, **so the two serialise**:
    - **a booking that committed first is counted ⇒ refused;**
    - **one that comes second finds the week gone** ⇒ `planDays` now answers **`409 CAMP_WEEK_DELETED`** (*"สัปดาห์ … ถูกลบไปแล้ว — ไม่ได้บันทึกอะไร กรุณาเลือกสัปดาห์อื่น"*) instead of a raw FK error.
- **Refusal** (`409 CAMP_WEEK_HAS_BOOKINGS`), in words the admin can act on:
  > *ลบสัปดาห์ <name> ไม่ได้: มีการจองวันแคมป์ <n> รายการ[ และที่ยกเลิกแล้ว <m> รายการ] — ใช้ "ปิดรับ" แทน เพื่อหยุดรับจองใหม่ (การจองเดิมยังอยู่)*
  - This is new wording, a DRAFT for the owner's copy batch, pinned by shape (the name, the counts, what to do instead).
- ⚖️ **A judgement for you: "no bookings" = NO `camp_days` row at ALL, CANCELLED included.**
  - A cancelled day is history, and the FK is RESTRICT, so it couldn't be deleted without destroying that history.
  - So a week whose only days are cancelled is refused, **and the words say "ที่ยกเลิกแล้ว m" so the admin isn't puzzled by a roster that reads 0.**
- **Access:** the same act as open/close (`action:camp.week-open`). **No new permission key, no migration.**

## §3 Orphans: none. What goes WITH the week
- The delete removes, in one transaction:
  - the week's **day rows** (`camp_week_days`), and with them their **coach rows** (`camp_week_day_teachers`, by cascade: hours + rate);
  - **the derived CAMP blocks on the coaches' calendars** (`bookings.camp_week_day_id`, RESTRICT, deleted explicitly first);
  - the week.
- **Nothing is left pointing at a gone row** (every FK is RESTRICT or cascade, and the order respects them).
- **Not touched:** packages (a package isn't tied to a week) and sales.
- ⚠️ **"No bookings" ≠ "no rows":** if a mistaken week's dates have already PASSED, its past coach blocks (with their day rate) go too. **Nothing else keeps that record**; no money is attached.

## §4 🔴 What a CLOSED week still shows and does (stated, NOT changed). ⚠️ This is wider than the owner's "stops new bookings only"
| | on a CLOSED week, today |
|---|---|
| roster (`GET /camp/weeks/:id/days`) | ✅ **still shows** every child |
| week list / calendar day banner | ✅ shown, with `status: CLOSED` |
| **coach blocks on the calendar** | 🔴 **DELETED for EVERY day, past days included** (`updateWeek` → `deleteCampDayRows`, no date check). **Reopening re-derives only FUTURE days** (the sync skips the past), **so close + reopen erases past coach blocks for good** |
| **coach reminder (08:15)** | 🔴 **not sent** (`camp-reminder.ts`: OPEN weeks only) |
| **parent reminder (08:15)** | 🔴 **not sent** (same filter) |
| **day-end cut + the `BALANCE CAMP` deduction notice** | ⚠️ **STILL RUN** (no week filter). **The child is auto-attended, charged, and the parent notified** |
| check-in QR / staff mark | ✅ still work (no week check) |
| per-day coach swap | 🔴 refused (`409 CAMP_WEEK_CLOSED`) |
- ⇒ **Under the owner's ruling ("existing bookings stay"), a closed week that still has children booked:**
  - **loses its coaches' calendar blocks and reminders;**
  - **its parents get no reminder;**
  - **but each child is still charged at day-end.**
  - That's TASK-418's "closed = the camp is off" meaning, and it predates this ruling.
- 🚫 **Not changed** (your §1 said state it). **Needs a ruling up the chain.**
- **My recommendation:** Close = the `planDays` gate ONLY. Stop deleting the derived rows on close, keep both reminders, and allow the per-day swap. It's a small change, and it would also end the past-block erasure.

## §5 Checks
- Suite: **3552 / 0** (3540 + 12 new, in `src/lib/camp-close-open-delete-task560.test.ts`). **DB-unreachable 3×: 3552 / 0, 0 "Failed query".** tsc 0. **62 .sql = 62 tags, no migration.**
- **One existing pin bumped:** the camp access-table row count, 11 → 12, plus the new row by value.
- **Break-and-watch** (BASELINE 12, CHECKSUM identical, every restore byte-identical):
  - **D1, a delete that trusts a STALE check** (days counted before the lock): **BITES**.
  - **D2, the lock dropped:** BITES.
  - **D3, "empty" = no LIVE day** (a cancelled-only week deleted): BITES.
  - **D4, the check removed:** BITES.
  - **D5, the derived-row delete reaching other weeks:** BITES.
  - **C1, a CLOSE one path ignores** (the gate gone from the one writer): **BITES on BOTH routes**.
  - **C2, a second writer of `camp_days`:** BITES.
  - **C3, the race's other side left raw:** BITES.
- ⚠️ **Honest limit:** D1/D2 bite on the **call order in a fake transaction.** The actual serialisation is Postgres's (FK KEY SHARE vs `FOR UPDATE`), and **no agent runs it against a real DB.** Tanya can exercise it on sid (two admins: one deletes an empty week while the other books into it).

## §6 Slips (test-side, caught before reporting)
- My new test file first had a missing `)`, so the parser refused the file.
- My call-count regex also counted `planDays`'s own definition (3, not 2). **Tightened to the call shape; the source was right.**

⛔ Only you mark this DONE. **Migration: none; @Porter's uat range stays 62.**

---

# ✅ BE DONE — REVIEWED by @Sober (2026-09-29) · 🔴 **and the FE half is HELD**
Verified by me: **3552 / 0** (and 3× unreachable, 0 failed queries) · tsc 0 · **62 .sql, no migration** (counted myself).

## ✅ The set was DERIVED, which is what §1 asked
**`camp_days` has ONE writer (`planDays`, which already refuses CLOSED), reached from TWO routes** — *and `CANCELLED` is final, so nothing revives a day.* ✅ **Both routes driven: closed ⇒ 409 and nothing written; reopened ⇒ planned. A second writer appearing BITES.**
🔑 **That is the difference between "I checked the obvious path" and "there is one writer, here it is."**

## ✅ The delete, and the race handled in the right order
**The week row is locked FIRST, then the days counted; a concurrent booking serialises on the FK.** ✅ **Booking first ⇒ `409 CAMP_WEEK_HAS_BOOKINGS`, saying HOW MANY and to use ปิดรับ instead · booking second ⇒ `409 CAMP_WEEK_DELETED`, not a raw FK error.**
🔑 **Turning a database error into a sentence an admin can act on is the whole of §1's "at the moment of the act".**
⚠️ **Honest limit, correctly stated: the lock ORDER is pinned on a fake transaction's call order — the real serialisation is Postgres's and no agent can test it.** ⇒ **Named for Tanya on sid.**

## ⚖️ "No bookings" = no `camp_days` row at all, CANCELLED included — **agreed, keep it strict**
🔑 **A camp created by mistake has no history. If it has history, the mistake is not what is being deleted.**
✅ **And the strict side is the safe side: Close always exists, so a refused delete costs an admin one click — an allowed one destroys a record nobody can get back.** ✅ **RESTRICT means the database enforces it, not only our code.**
⚠️ **His orphan note is the one to keep in view: if the week's dates have already passed, its past coach blocks — with rates — go too, and nothing else keeps them.** 📌 **That is a reason to refuse deletes, not a reason to soften the rule.**

## 🔴 The FINDING — and it changes what may ship
**Today's Close is TASK-418's "camp off", and it is WIDER than the owner's "stops new bookings only":** it deletes coach calendar blocks **for every day, past included** · stops **coach AND parent reminders** · refuses the per-day swap — **while the day-end cut still charges the children and still sends BALANCE CAMP.**
🔴 **Two things are wrong, and the second is worse than "wider":**
1. 🔑 **It stops TELLING people while continuing to TAKE their days.** *That is exactly backwards: of the two halves, the one you would keep is the telling.*
2. 🔑 **It is not reversible: reopen restores only FUTURE days.** ⇒ **The owner ruled "Open re-allows them", and today's Close cannot be undone.** **A switch that loses data is not a Close.**
✅ **He stated it and did not change it — correct.** ⚖️ **My ruling: his recommendation (Close = the `planDays` gate only) is right, and it is the owner's to approve. Escalated.**
🔴 **Until it is ruled, the FE half of item 8 is HELD** — 🔑 **a "ปิดรับ" button would promise an admin less than the switch behind it does**, *and the delete's own refusal points at that button, so shipping half of this is incoherent.*

## Not done here
🚫 The FE half — **held, not forgotten.** ▶️ **The round continues with item 2.**
