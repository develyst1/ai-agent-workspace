# REQ-094 — Extended (purple) classes should AUTO check-in too — 2026-09-18

**Source:** customer via owner, 2026-09-18. **Status: RECORDED — read requested from @Sober; nothing dispatched.**
> กับคลาส extended สีม่วง ให้ auto check in ด้วยนะคะ ตอนนี้ระบบไม่ตัดให้ค่ะ คลาสสีม่วง ต้องกดเองค่า

## §1 — the ask
Extended (make-up, purple) classes are NOT auto checked-in / auto-deducted today — an admin must press them manually, while normal classes auto check-in. Make purple/extended classes auto check-in the same way.

## §2 — READ requested from @Sober
How does "auto check-in" work today (what job/trigger, on which statuses), and WHY are `EXTENDED` sessions excluded — deliberate (a make-up must be confirmed by a human?) or an oversight? What flips if extended is included (attendance, quota, expiry, notifications)? Then PM takes any ruling to the owner.

## §2 — RELATED (2026-09-18): end-of-day now gates on START time, not END (owner override of REQ-070)
Separate from REQ-094 but same job: the owner ruled the day-run attends a class once it has STARTED (`start_time <= now`), not once it has ENDED — because the team leaves at 17:30 and wants the 17:00/17:30 slots cut same-day before they go. A conscious override of REQ-070's "never claim a child came before the class is over", justified by staff being on-site. See the SA thread; SYSTEM-FACTS reconciled to 17:30 + start-based.

## §3 — REOPENED 2026-09-19: customer says purple STILL not cut at 17:30
Customer screenshot (uat, 5:53 PM): purple `Course · Private SURFSKATE` (EXTENDED, LAST) not cut. **The gap: REQ-094 (TASK-389) only made bulk-confirm ACCEPT EXTENDED; the end-of-day job still attends CONFIRMED ONLY.** So a make-up stays EXTENDED unless an admin bulk-confirms it — the customer's intent is auto-cut WITHOUT a manual step. ⇒ likely need the JOB to attend EXTENDED directly (start-based), reversing Sober's earlier "don't add EXTENDED to the job select". @Sober to check: (1) did today's 17:30 uat run use the new build (deploy timing)?; (2) is attending EXTENDED directly at start-passed safe now (start-based) and the right fix for the intent? PM to owner: reply "checking; purple will auto-cut like a normal class."

## §4 — 2026-09-19, screen beats the assumption: the EXTENDED modal has NO Confirm button
Owner screenshots: a PENDING booking modal offers `Attended · Confirm + LINE · ⋯`; an EXTENDED modal offers ONLY `Attended · ⋯` — **no Confirm.** So "just confirm the purple" (PM's earlier reply) is wrong on the single modal — there is no Confirm to press (only bulk-confirm, or mark Attended directly).
**RULING (owner): EXTENDED confirms like PENDING ⇒ the booking modal for an EXTENDED session must offer `Confirm + LINE`** (the BE already accepts confirming an EXTENDED — single-confirm has no status guard; this is FE-only: show the button). Then the day-end job (CONFIRMED-only, START-based) cuts it — consistent with REQ-096 (reminder CONFIRMED-only). 🚫 Do NOT make the job attend EXTENDED directly (that would break "a make-up is confirmed first, like a new booking"). Fix = FE Confirm button on EXTENDED. (This is the real close of the customer's "purple not cut" — they now have a Confirm to press.)
