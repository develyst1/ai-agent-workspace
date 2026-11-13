# CONCEPT: F4, "Close a day" (front office): DRAFT for the owner

Porter, 2026-11-10. Source: ขวัญ LINE 2026-11-09 17:31 item 4 ("การปิดตารางเรียนทั้งวัน"); CHECK-2026-11-09-frontoffice-intake.md § F4 (Sector's code read, 3–4 d, medium risk, needs F2 first).

**Owner (verbatim):** *"อันนี้ อาจจะต้องคิดเงินเพิ่ม แอดมิน เลือกวันได้ ในการปิดวันทำการ แล้วเมื่อเลือกวันนั้น จะ List รายการที่ได้รับผลกระทบทั้งหมด แล้ว แจ้งไลน์ ผูกปกครองออโต้ มั้ย คิดมาดีๆ นะคอนเซ้ป"*

**Status:** a new feature; no REQ exists, and it is outside the agreed scope. It is chargeable (the owner's call). Nothing gets built until he approves the concept and the price, and ขวัญ agrees.

## The flow (3 steps on one screen)
1. **Choose.** The admin picks one date or a range (e.g. Songkran 13–15 Apr). She adds a reason (holiday / venue closed / weather / other) and a scope: the whole school (only Bravo exists today).
2. **Preview: nothing has changed yet.** The system lists **every affected item** on those dates, grouped by type, and says what will happen to each:

| Type | What happens | Parent LINE |
|---|---|---|
| Confirmed course class (private / duo / group seat) | cancelled as "ปัญหาจากทางเรา"; the class is added at the end of the course (+1 week); course end date +1 week | yes: one message per family, with the new date |
| Pending course class | cancelled the same way, silently (F2 rule) | none until Confirm Course |
| Make-up class already scheduled | cancelled, re-added at the end again | yes |
| Trial / 1st Trial | cancelled, NOT rebooked automatically; listed as "admin to rebook" | yes ("we will contact you") |
| Park rental / OTHER block | cancelled; no make-up; flagged "refund or move: admin decides" | none (admin calls) |
| ECA / Camp at a school | **not touched by default** (the school runs its own day); the admin can tick them in | per tick |

   - Each row has a tick (default ON) so the admin can leave a class out, e.g. a private class that moves to another venue.
   - Each family row shows the exact LINE text it will get, and a tick, "send LINE" (default ON). Untick it if the admin will call that family herself.
   - Totals show: N classes, N families, N coaches.
3. **Confirm.** One button runs it all in one go:
   - cancels, re-plans, and blocks the date(s) for new bookings and make-ups;
   - queues the LINE messages, one per family even with several children;
   - sends a notice to each affected coach.

   Afterwards it shows a summary: what was done, and the items left for the admin (trials, park rentals).

## Rules
- **The block:** a closed date can't take new bookings, and the make-up date search skips it.
- **Coach pay:** cancelled classes are not taught, so they are not paid (same as any cancel). No special line on the slip.
- **Revenue:** unchanged. Course revenue was counted at confirm, and the class still happens later.
- **Who can do it:** admin and CEO. Every closure is logged with who, when and the reason.
- **Re-opening a closed day:** only removes the block. It does NOT restore cancelled classes or un-send messages. The confirm dialog says so plainly.
- **Dates:** today or future only. A past date is refused.

## Questions for ขวัญ (with our defaults)
1. A date range, or a single day only? [range]
2. Cancelled course classes go to the end of the course, +1 week? [yes]
3. Send LINE to parents automatically, with a per-family opt-out? [yes]
4. ECA / Camp untouched by default? [yes]
5. Coaches not paid for a closed day? [not paid]

## Size and cost
- 3–4 d (BE 2–2.5 + FE 1–1.5), from Sector's code read. The preview list and per-family LINE text add about +0.5 d over the bare version, so **≈ 4 d**.
- **Must come after F2 (TASK-947).** Otherwise closing a day sends "CONFIRMED" messages to pending courses.
- **Price:** the owner's call. The draft agreement (แนท v0.2) lists a change-request day rate, which the owner should check (it reads "263 บาท/วัน").

---
## Owner, 2026-11-10: concept A approved ("ถ้าคิดมาดีแล้วก็ โอเค") + asked for concept B
*"คิดอีกคอนเซ้ป อาจจะ กดแล้ว แอดมิน แก้ๆ ออกจากวันนั้น ไม่หมด ก็ปล่อยไว้ได้ แล้ว noti admin ทุกวัน ว่า มีคลาสในวันปิดทำการ ให้ไปดู"*

## CONCEPT B: "Mark a closed day, the admin clears it by hand, with a daily reminder" (lighter)
1. **Mark.** The admin marks a date (or a range) as closed, with a reason. **Nothing is cancelled automatically, and no parent is messaged.**
2. **Block.** From then on, no new booking and no make-up can land on that date.
3. **The "classes on closed days" list.** One page shows every class still sitting on a closed date: student, coach, time, course status. Each row has the actions that exist today (move, cancel as "ปัญหาจากทางเรา", leave). So the admin clears them one by one, in her own way and her own words. A family hears only what those existing actions already send.
4. **Daily reminder.** Every morning, while any class still sits on an upcoming closed date, the admins get one notice: *"มี N คลาสในวันปิดทำการ (13 เม.ย.) ยังไม่ได้จัดการ"*, linking to the list. It stops by itself when the list is empty or the date has passed.
5. **Leftovers are allowed.** If the admin leaves a class there, it stays, and the reminder keeps nagging. On the day itself, the class shows a "วันปิดทำการ" badge in the schedule.

**A vs B**

| | A: auto (preview → one click) | B: mark + list + daily reminder |
|---|---|---|
| Admin effort on the day | one click | one action per class |
| Parent messages | automatic, one per family, with a per-family opt-out | only what each manual action sends today |
| Risk of a wrong mass cancel | medium (bulk) | low (nothing automatic) |
| Size | ≈ 4 d (Sector) | **to be sized by Sector**; expected smaller |
| Needs F2 first | yes | no (no bulk messages) |

**Porter's recommendation:** offer ขวัญ both, with prices. B is the safe, cheaper start. A can be added on top later, because the closed-day record and the list are shared.

## Price (owner 2026-11-10: "แปลงเป็นเงิน ฉันจะทำการไปเสนอเขาทีหลัง")
- The rate is the existing one, **263 ฿/day** during the build (BRIEF-owner-backoffice-money-meeting-2026-10-27 §1, §7; CHECK-REQ-120-three-team-schedule "Extras rule").
- **A ≈ 4 d × 263 ≈ 1,052 ฿ → about 1,100 ฿.** Provisional, until Sector's size comes back.
- **B:** waits on Sector's size. Expected below A.
- F5 + F2 are fixes to our own behaviour (owner: "เราทำไม่ถูก" / "แก้ให้ถูก"). They are free.

## Sized by Sector (CHECK-2026-11-10-F4-close-a-day-sizing.md). This REPLACES the provisional price above.
- **B ≈ 2.75–3 d × 263 ≈ 800 ฿.** Low–medium risk; no F2 dependency.
  - The daily reminder reuses the 08:00 admin LINE digest and the attention panel.
  - The block also covers moves, the plan editor and the group-series extender.
- **A ≈ 6 d standalone ≈ 1,600 ฿**, or **+3 d on top of B ≈ +800 ฿** (B + A ≈ 1,600 ฿). Medium–high risk; after TASK-946 + 947. Porter's 4 d was low.
- **Correction:** ECA / Camp cannot be "ticked in" (they are not SB bookings). Drop that from A.
- SA pick: offer B first.
