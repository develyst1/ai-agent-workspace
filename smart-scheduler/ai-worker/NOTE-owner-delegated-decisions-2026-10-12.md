# Owner-delegated decisions while he sleeps (@Porter, 2026-10-12)
**The owner, verbatim:** *"ฉันให้สิทธิ ในการตัดสินใจแทนฉันหากบอลมาอยู่ที่ฉัน สองครั้ง ในการตัดสินใจ แต่ตงโน้ตไว้มาบอกฉันทีหลังว่า มีเคสอะไรที่ต้องรอฉันตัดสินใจ แล้วนายตัดสินใจอะไรไป · ฝากนายเดินงานต่อ อีกหน่อยนะ ฉันไปนอนก่อน ฉันสั่งนายแบบนี้เพื่อให้งานเดินไปได้มากสุด ก่อนวันพรุ่งนี้มาถึง"*
**Scope, as I read it:** at most **TWO decisions** that would otherwise wait on him. Each is written here **before** it is acted on, with the case, the options, what I chose and why.
🚫 **NOT covered (his hands only, unchanged):** git commits · deploys · migrations · SQL on any DB · `.env` · his phone · anything sent to Khwan or to any customer. Those wait for him, and I list them below too.

## Decisions taken (max 2)


## Waiting for him (not decidable by me)
- **B5 of the phone session (Tanya):** before she reads the sid OA chat for "Unlink ⇒ silence", the owner opens LINE → the sid OA chat → scrolls to the VERY BOTTOM → checks that his old-code message is NOT on screen → says "clear". (Option: **unsend** that old-code message, so the risk is gone for good.) His hands only. B4 PASSED (the admin "LEAVE NOTICE / แจ้งลา ‼️" arrived on his phone).
- **The final front-office uat release:** `DEPLOY-uat-2026-10-12-final-front-office.md` (back `d32bdc4` · front `0730275`). **Everything is tested on sid:** TEST-096 combined PASS, and the phone session A ✅ and B1–B4 ✅ (the new link works, the old shared code is REFUSED, the admin notice arrives). **Left before uat:** B5/B6 (disable / unlink ⇒ silence) + the 706 family read, which wait only for his "clear" above. Then **STEP 0** of the note (the back tree holds the DRAFT 729/730 uncommitted: set them aside or commit after approval), build, `db:migrate` (Journal 68), restart both.
- **Khwan's answers** to the 9 questions sent 2026-10-11 (+ the pending items 10–11 in `COPY-DRAFT-khwan-questions-2026-10-11.md`). They unlock P11 · P33/P34 · R48 · R58 · D1 (730, pre-built) · D2 · P43/P44 (729, pre-built) · REQ-114 (iii) · P26 hours.
- **729 (P43/P44) cannot be seen live with the phone we have** (TEST-097): it is a LINE-linked QA parent, so «คุยกับแอดมิน» from it is a P41. Seeing P43/P44 needs **a LINE account that is NOT a linked parent** (P44: anyone unlinked; P43: an admin-only account). His call, and only when Khwan has approved the wording. Until then 729 is proven by its tests (set 9/9) only. **D1 (730) PASSED live.**

## ✍️ Decisions taken under the delegation (2 of 2 used) — 2026-10-12 ~19:10, the owner unanswered since he chose Path B
**Decision 1 · the voucher Remark field: YES.**
- **Case:** Khwan asked for the voucher's "CONFIRMED SCHEDULE" to carry a Remark *"เอามาจากตอนสร้าง"*. A voucher sale has no remark field today.
- **Options:** (a) add an optional Remark box to the voucher sale (S ≈ 1.1 d, migration `0068`), (b) no Remark line.
- **Chose (a)** because the customer asked for it in her own words, it is small and optional, and nothing visible ships before he sees the uat note. **Reversible:** he can strike it at the uat note and nothing reaches a family.
**Decision 2 · P43/P44 "the chat does not pop up": option A (`displayText` on the «คุยกับแอดมิน» cell).**
- **Case:** Khwan: *"เวลาผปคกดเมนูมา มันไม่เด้งแชทขึ้นมาข้างบน … เราจะหาไม่เจอ"*.
- **Options:** A `displayText` (the bot flow is unchanged, a FACT; the chat bump is a BELIEF to prove) · B a message action (risk of being swallowed by a flow) · C no locator.
- **Chose A**, on the condition that it is **proven on sid with his phone before uat**, and the menu republish + relink remain HIS hands. **Reversible:** if the bump is not seen on sid, 729 ships with the name only and A is dropped.
- **(low priority, a question only, nothing changed)** Silver found that **an admin's single-class cancel on a COURSE with reason «ครูลา» does NOT add +1 week today** (the reason is not stored as TEACHER_LEAVE for courses). REQ-112's closed list says *"a COACH's leave (their own, or recorded by an admin) → +1 week"*. That clearly covers the coach's own leave and the admin-recorded leave DAY (Teachers page). **Whether this cancel door counts too was never asked.** The team kept today's behaviour (the closed list is never derived). TEST-098's fix adds the Reason line to the family's notice ONLY, and the weeks are unchanged. If he wants it, it is one question to Khwan with a number.
- **Outcome of delegated decision 2 (option A / TASK-734): NO BUMP.** In the owner's OA Manager screenshot (20:57), after Tanya's press at 20:51:39 (the bubble WAS shown on the phone), `support08 Dong` stayed BELOW `Dong_08` (20:48), and a later bot message did not bump it either. ⇒ **By the stated condition, A is DROPPED for uat: no menu republish on the real OA.** The 734 code only matters at a publish, so it is harmless. Khwan's "we can't find the chat" stays UNSOLVED for the no-name case (729 ships with the name in the normal case + the approved fallback).

## Waiting for the owner (added 2026-10-12, night): REQ-119 Total booked
The Excel says *"Total booked = Confirmed + On leave"* (Pending OUT). Palm's screen counts Pending IN. Which one? The team builds both behind one line meanwhile. No delegation left; the owner rules it.
- **FYI, decided by Porter within scope (not a delegation):** the OLD `getDailyReport` stays byte-identical, so the SOM report and the day-end job keep today's numbers. Only the Daily Report screen gets the new counting. Say if the SOM report should move too.
- **To forward to Palm:** `COPY-DRAFT-palm-daily-report-backend-findings-2026-10-12.md`.
- **Optional DATA REQUEST (sid, then uat), bare SQL:** `SELECT count(*) FROM bookings WHERE status = 'PENDING_RESCHEDULE';` Any rows count in Total booked but in no card.
