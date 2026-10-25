# REQ-130: The admin LINE morning digest says "Sales not posted to backoffice: 6": what is it, and is it real?
**Intake:** Khwan, LINE, 2026-10-25 (the owner's screenshots), verbatim:
- 10:32 AM, quoting the line "• Sales not posted to backoffice: 6": *"อันนี้คืออะไรคะพี่โด่ง"*
- 1:06 PM: *"• Sales not posted to backoffice: 6 · อันนี้ที่ขึ้นเตือนในไลน์แอดมินคืออะไรคะ"*
- 1:39 PM, answering the owner's *"อันนี้ จากไหนนะครับ"*: *"แจ้งเตือนไลน์แอดมินตอนเช้าค่ะ"*

**Owner, 2026-10-25:** the uat deploy of TASK-836 + 748 waits (*"ค่อยขึ้น"*).

## Facts
- The admin **daily digest** (`daily_digest`, about 08:00) carries a check `sales_not_posted`. The 10-20 digest row showed **0** (DR-2 SQL output). Today it shows **6**.
- "Posted to backoffice" = the C1 sale posting into the back office's `bo.*` ledger (`sale-post.ts`: `recordSale` / `postBookingSale`; the day-end ATTENDED posting for trial / 1 HR / OTHER).

## Order
1. **Silver (Team B; C1 sized in BO_old):** from code, what exactly `sales_not_posted` counts (which bookings / kinds / dates, and why one would be "not posted"). Then the **6 on uat today**: a bare read-only SQL for the owner to list them (ids, kind, date, status; no personal data), and the likely reason for each. Is it a real gap (revenue missing from the back office) or a false alarm? The fix if real (incl. a safe re-post).
   - **Ties:** the 10-20 → 10-25 deploys (REQ-125 / 836 / 747 / 748), the day-end job, the price card.
2. **Nothing to Khwan about a cause before Silver confirms.** What it means in plain words can go first, once Silver confirms the definition.

## Silver's read (10-25): counts the last 7 days' SALE courses / vouchers + ATTENDED trial / 1 HR with no bo.movement SALE. **Likely a REAL gap** (cause 1: a late check-in after the day-end run is never posted; 2: the day-end didn't run; 3: a missing price item). A bare SQL went to the owner to tell them apart. Fix for cause 1: TASK-749 (≈1.1 d, a day-end sweep of the last 7 days, idempotent).

## Round 2 (10-25): likely the 18 Oct day-end ran EARLY (before 18:12) and no 23:30 run happened that night. SQL 1 (job_runs 17–25 Oct incl. the digest's stored counts) + SQL 2 (18 Oct movements / undos) went to the owner. **TASK-749 GRANTED** (a 7-day sweep). **The owner's call:** a safe, idempotent re-run of the 18 Oct day-end (the 6 leave the 7-day window after 10-25).

## SQL 1 + 2 (10-25): **the day-end runs at 17:30 daily, not 23:30.** Anything marked attended after 17:30 never posts (18 Oct: 6 rows marked 18:10–18:34 have no SALE movement; the 13 others posted at 17:30). The digest showed 6 from 10-19 on. Fix = TASK-749's sweep + move the server schedule to 23:30 (the owner's step); the 18 Oct re-run is still needed today.

## CONFIRMED (Silver, 10-25): the server task 'sm-end-of-day' is set to 17:30 (meant 23:30). Effects: (1) attendance marked after 17:30 is never posted; (2) classes starting ≥17:30 are never auto-marked attended (no quota cut, no revenue). **Owner steps:** schtasks → 23:30 (tz check first); a SQL check before any 18 Oct re-run (a re-run auto-marks still-CONFIRMED classes + messages families); a 30-day evening-classes count (business call for Khwan if rows). TASK-749 in build (Bob).

## ⛔ CORRECTION (owner, 10-25): *"ย้ายทำไมนะ ขวัญต้องการ 17:30 นะ"*. **17:30 is DELIBERATE**: the customer's request; the owner moved it from 18:30 on 2026-09-16 (REQ-089 l.61; REQ-094: the team leaves at 17:30 and wants the 17:00 / 17:30 slots cut the same day; SYSTEM-FACTS). **DO NOT move the task.** The fix stays TASK-749 (the next run sweeps the last 7 days, so marks made after 17:30 post at the next day's 17:30). Effect (2) (classes starting after 17:30 never auto-marked) is by this same design; size it with the 30-day count before any change.

## Owner's checks (10-25): 18 Oct has **0 still-CONFIRMED** ⇒ the 18 Oct re-run is SAFE (it posts only the 6). The 30-day count of evening (≥17:30) still-CONFIRMED classes = **0** ⇒ effect (2) is nil. **Owner step:** re-run the end-of-day for date 2026-10-18 on uat today (the body `{"date":"2026-10-18"}`, the same script / secret as the scheduled task).

## ✅ 10-25: the 18 Oct re-run posted the missing 6 (verified: no 10-18 rows left; only today's 7, which await today's 17:30 run). Khwan draft written. The lasting fix = TASK-749.

## Owner, 2026-10-25, verbatim: *"ฉันเคยบอกแล้ว กวาด เช็คอิน เนี่ย ควรกวาดจากเวลาเริ่ม มันเคยเกิดขึ้นแล้ว ตอนที่เปลี่ยน เวลาเป็น 17:30 แรกๆ"*
- The rule, per REQ-094 §2 (start-based): **every run processes EVERY class whose start time has passed and that isn't processed yet, whatever day it belongs to and whenever it was created or marked.** Not only 'today's' rows as they stood at 17:30.
- ⇒ **TASK-749 widens**: over a look-back window, each run (a) auto-attends CONFIRMED classes whose start has passed (incl. ones created after a previous run), and (b) posts every ATTENDED trial / 1 HR / priced OTHER with no SALE movement. Idempotent.
- This 'happened before' when the run moved to 17:30 (REQ-089 / 094 era); the lesson wasn't carried into the posting path.

## created_at check (owner, 10-25): CONFIRMED why only 18 Oct. The 6 = **3 × 17:00 trials created 17:13 / 17:26 / 17:36** (still new or unconfirmed at the 17:30 run, marked attended 18:12–18:20) + **3 × 09:00 single sessions created at 18:33–18:34** (entered after the fact). The other 13 existed before 17:30 and posted. ⇒ Bookings created or confirmed around / after the run are never handled; the widened TASK-749 (start-based sweep) is the fix. **Not an admin error.**

## PROVEN by data (`confirmed_at`, owner's SQL 10-25): the 3 × 17:00 trials were created 17:13 / 17:26 / 17:36 and **confirmed at 18:10** by staff (attended 18:12–18:20). At 17:30 they were still PENDING, and the job attends CONFIRMED only. The 3 × 09:00 single sessions were created + confirmed at 18:33–18:34. All 6 were staff check-ins, by one admin account. **Two ways to slip:** created after 17:30; or created before but confirmed after 17:30. Both are closed by the widened TASK-749.
