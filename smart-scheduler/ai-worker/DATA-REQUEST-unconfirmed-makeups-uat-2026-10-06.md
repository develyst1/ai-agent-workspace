# DATA REQUEST — unconfirmed make-ups on uat, read-only — @Sober, 2026-10-06
**For @Porter → the owner, who runs it — ONLY if he says yes to Porter's question ("จะให้ไปนับบน uat มั้ย").** 🚫 **SELECT only. Nothing here writes. No agent runs it.**
**Why it is worth running BEFORE option (c) is designed:** it says how many families are owed a make-up nobody announced, and how many such classes have ALREADY passed without being checked in (the end-of-day check-in reads `CONFIRMED` only — `jobs.service.ts:83`).

## The read — one statement, counts only (no names leave the box)
```sql
SELECT
  CASE WHEN date <  (now() AT TIME ZONE 'Asia/Bangkok')::date THEN 'past'
       WHEN date =  (now() AT TIME ZONE 'Asia/Bangkok')::date THEN 'today'
       ELSE 'future' END                        AS when_,
  count(*)                                      AS make_ups,
  count(DISTINCT course_id)                     AS courses,
  min(date)                                     AS earliest,
  max(date)                                     AS latest
FROM bookings
WHERE status = 'EXTENDED'
  AND booking_type = 'COURSE_PACKAGE'
GROUP BY 1
ORDER BY 1;
```

## What each line MEANS
| line | meaning |
|---|---|
| **`future`** | **make-ups waiting for a confirm** — the family has not been told their date (the confirm is their only notice). **This is the size of the WAITING list option (c) needs.** |
| **`today`** | the same, happening today — **if not confirmed by tonight, it joins `past`.** |
| 🔴 **`past`** | **make-ups whose day has GONE by, never confirmed, so never checked in at day-end.** **Each is a class the course still counts as owed-and-live.** **Any number above 0 is the defect the owner's screenshot pointed at, already in real data.** |
| `courses` | how many different courses (≈ families) each line touches |
📌 **A row with `status = 'EXTENDED'` is how the system creates EVERY make-up** (`reconcileCoursePlan`); confirming turns it `CONFIRMED`. **So this counts exactly "created, never confirmed".**
⚠️ **Not counted, deliberately:** confirmed make-ups (they were announced) · cancelled ones · non-course rows.

---
## ✅ RESULT (owner ran it, 2026-10-06): ONE row — `future` 305 make-ups · 158 courses · earliest 2026-10-08 · latest 2027-01-17. `past` = 0, `today` = 0.

## ➕ READ 2 — tells "staff confirmed them in time" apart from "none has reached its day yet" (SELECT only, counts only)
```sql
-- every make-up, whatever it became: status × past/future, and how the past ones were checked in
SELECT status,
       (date < (now() AT TIME ZONE 'Asia/Bangkok')::date) AS is_past,
       checkin_source,
       count(*) AS rows
FROM bookings
WHERE booking_type = 'COURSE_PACKAGE'
  AND (extended_from_id IS NOT NULL OR note = 'คาบขยายอัตโนมัติจากการปรับแผนคอร์ส')
GROUP BY 1, 2, 3
ORDER BY 2 DESC, 1;

-- the next 7 days: how many unconfirmed make-ups fall on each date
SELECT date, count(*) AS make_ups
FROM bookings
WHERE status = 'EXTENDED' AND booking_type = 'COURSE_PACKAGE'
  AND date <= (now() AT TIME ZONE 'Asia/Bangkok')::date + 7
GROUP BY 1 ORDER BY 1;
```
| what READ 2 shows | meaning |
|---|---|
| **no `is_past = true` rows at all** | **"too new"**: no make-up on uat has reached its day yet — the harm is real in code and **still coming** (first date: 2026-10-08) |
| past rows that are `ATTENDED` with `checkin_source = 'end-of-day'` | **staff CONFIRMED them in time**, then the day-end checked them in — the harm is real but staff have been preventing it by hand |
| past rows `ATTENDED` with another source | **someone checked them in by hand** |
| the 7-day list | **how many make-ups need a confirm before their day, starting Thursday** |
