# DEPLOY — REQ-131 (TASK-839): the admin alert "ผู้ปกครองแจ้งลาไม่สำเร็จ — อายุคอร์สไม่พอสำหรับคาบชดเชย" names the child and the class — sid first, then uat — @Sober, 2026-10-25
**For @Porter → the owner.** **BACK ONLY.** No migration, no env change, no new words.

## 0 · What is in it
- **The cause:** the parent-leave refusal called `notifyAdmins` with the booking only inside the payload, so the outbox row had no `booking_id` and the alert printed "- · -".
- **Now:**
  - the booking is passed (the row carries it);
  - **rows already queued the old way** (no `booking_id`, the id in the payload) **are named too**, for this alert kind only;
  - every other alert renders exactly as before.

## 1 · Verified by me (final)
| | result |
|---|---|
| **back** `5b5f483` + 5 files (**no `.env`**; Team B's TASK-749 WIP **excluded**) | tsc 0 · SAFE suite **5,140 / 0**, 368 files · unhandled 0 · migrations 73 = 73 · sets 839 **5/5** · 692 12/12 |

0 survivors, checksums identical. **Not proven yet:** a real refused parent leave on sid, where an admin's LINE shows the child + the date (Tanya).

## 2 · Commit list: `smart-scheduler-back` (5; **only these**. The tree also holds Team B's uncommitted TASK-749, which must NOT go in)
```
 M src/services/leave-refused-no-validity-task692.mutations.json
 M src/services/line-webhook.service.ts
 M src/services/outbox.service.ts
?? src/services/leave-refused-names-the-child-task839.mutations.json
?? src/services/leave-refused-names-the-child-task839.test.ts
```
**NOT in this commit (Team B's TASK-749):** `src/services/jobs.service.ts` · `src/lib/day-end-sweep.ts` · `src/lib/day-end-sweep-task749.test.ts` · `src/lib/day-end-sweep-task749.mutations.json`.

## 3 · Deploy: sid, then (after Tanya) uat
Back: pull, restart. Nothing else. It can ride with the 837 / 838 deploy (that one needs `db:migrate` 0072).

## 4 · Tanya's gate on sid
On sid, a parent requests a leave on a course with no room for a make-up before its expiry:
- the parent gets the refusal (as today);
- **every admin's LINE reads "…: <child's name> · <class date dd-mm-yyyy>"**, not "- · -".
