# SURVEY: the front-office data a rebuilt back office needs, and whether `smart-scheduler-back` has it (@Silver, 2026-10-13)
**For:** `UNDERSTANDING-backoffice-2026-10-13.md` §5 (Porter's brief, inbox 2026-10-13). **READ ONLY:** no edits, no SQL, no `.env`. Facts with file:line in `smart-scheduler-back` (paths from the repo root; `sched` = `src/services/scheduler.service.ts`). I verified the load-bearing lines myself (the teacher type enum, `confirmed_at`, the check-in columns, no branch, no payment, the header note).
**Answers:** ✅ exists and reliable · 🟡 exists with gaps · ❌ not stored.

> 🔑 **The shape behind every answer:**
> - The scheduling back keeps only the **CURRENT state** of each booking. There is no status history: `booking_events` is "deferred" (`lib/course-history.ts:5-7`).
> - It has **no payment model.**
> - Money exists only as best-effort `bo.movement` rows in the shared DB (`schema.ts:3-4`, `:234-278`).

## 1. Teaching hours per coach per day — 🟡
**From the timetable: ✅**
- **One booking row = exactly one hour.**
  - `insertBooking` writes `endTime: addHour(startTime)` (`sched:1327`), and a move re-derives it (`sched:4588`). There is no duration column.
  - Hours = rows by `(teacher_id, date)`, with status NOT IN (CANCELLED, PAUSED) (`lib/daily-report.ts:26`).
- **The primary coach** is `bookings.teacher_id` (`schema.ts:433`). **Extra coaches** are in `booking_teachers` (`schema.ts:602-628`); only OTHER/GROUP rows have extras.
- **GROUP:**
  - Count the group row with `group_id IS NULL`. Its seats carry the same teacher and would multiply the hour (`schema.ts:520`).
  - `slot_yielded_at` set means the hour moved to a Private row (`schema.ts:529`).
- **Camp / ECA:** see items 6 and 7.
- **Reliability:**
  - A delivered row (ATTENDED / NO_SHOW) cannot be moved (`sched:4575`).
  - Live rows are re-assigned **in place**, so the old coach is lost (item 3).
  - Rows are never hard-deleted, except camp derived rows (`camp.service.ts:138`).

**From check-ins: 🟡 partial**
- There is **no check-in table, no check-in time, and no coach clock-in.** On ATTEND only, the row gets:
  - `checkin_channel` (`checkin-qr | line | shopfront-qr | staff | end-of-day`);
  - `checkin_actor` (a username, for `staff` only);
  - all at `schema.ts:548-552`.
- The family/student checks in by QR or LINE. A coach's own login can only `attend` (`lib/own-scope.ts:73`).
- **When:** not stored. Only `updated_at`, which any write bumps (`schema.ts:563-566`).
- **Gaps:**
  - Rows before migrations `0056`/`0057` have NULL columns.
  - A check-in Undo clears them; the prior values sit in `booking_undos` (`schema.ts:899-915`).
- **"Hours cut" (quota):** counters only.
  - `course_packages.used_sessions` and `vouchers.used_hours` are +1 at attend (`sched:4152-4156`) or at day-end (`jobs.service.ts:96-118`).
  - `job_runs.summary` holds **counts only** (`jobs.service.ts:251-257`).
  - ❌ There is no per-booking deduction ledger.

## 2. Coach type FT / PT / FL / STAFF, two types for one person — ❌ for STAFF and for two types
- `teacher_type` = `FULL_TIME | PART_TIME | FREELANCE` (`schema.ts:36-40`). **There is no STAFF.**
- `teachers.type` holds **ONE value, NOT NULL** (`schema.ts:210`). **Nelson's "staff + FL on weekdays" cannot be expressed.**
- ❌ **No history:** `updateTeacher` overwrites the type (`sched:4788`). Its own comment says *"effective-dated only in the (deferred) backoffice salary model"* (`sched:4774-4775`).
- **Admins/staff are `users` with `teacher_id IS NULL`** (`schema.ts:686`). A staff member who also teaches needs a separate `teachers` row linked by `users.teacher_id`, and there is at most one login per teacher (`schema.ts:700`).

## 3. The FIRST coach of a trial, and of a course — 🟡 derivable, not stored
- ❌ **`course_packages` has no teacher column** (`schema.ts:328-395`). The coach exists only per session row.
- **A reassignment overwrites `bookings.teacher_id` in place:**
  - a move (`sched:4583`, `:4623`);
  - group swaps (`sched:1776-1880`);
  - series swaps (`other-series.service.ts:332`).
- **No old-coach history**, except two partial traces:
  - a LINE notice row in `notification_outbox` (`sched:4631`);
  - for FREELANCE coaches only, `bo.movement` draw and reversal rows (`sched:252-262`).
- **How to derive it:**
  - a trial: `teacher_id` of its FIRST_TRIAL row;
  - a course: `teacher_id` of its earliest ATTENDED row.
  - This is reliable **after delivery** (immutable, `sched:4575`). Before delivery the coach can still change, and an attendance Undo re-opens the row.
- 📌 **"First coach" needs a business definition:** the coach at booking time, or the coach who actually taught?

## 4. Trial → course/voucher conversion, and course renewal, with dates — ❌ no link
- **No stored link** of any kind: no source booking, no "renewed from". The only shared key is `student_id`.
- "Renewing" is a **heuristic** in the SOM report, not stored: *"bought a course/voucher this month while already holding an earlier one"* (`som-report.service.ts:100-112`).
- **Dates exist:**
  - `course_packages.created_at` = the purchase (`schema.ts:390`), with `start_date` and `expiry_date`;
  - `vouchers.created_at` = the sale (`schema.ts:417`).
  - ⚠️ Imported rows (`source='IMPORT'`, `:389`, `:416`) carry the **import** time, not the real purchase date.
- ⇒ The S-5 / S-6 bonus would be **inferred** (same student, a trial and then a course; course after course). The rule for "converted" needs defining: within how many days? Does a voucher count (the sheet vs the meeting conflict)?

## 5. Each booking's confirm time and paid state — 🟡 confirm · ❌ paid
- **Confirm time: ✅ `bookings.confirmed_at`** (`schema.ts:541`). It is set once (`sched:4003`, `:4141`) and also by course confirm (`sched:5150`) and camp creation (`camp.service.ts:306`).
  - ⚠️ It is cleared when a course start-date move sends rows back to PENDING (`sched:5754`).
  - ❌ **No `confirmed_by`.**
- **Paid state: ❌ none:** no payment table, paid flag, payment date, amount received or slip, for bookings, courses or vouchers.
  - The only "paid" fact is equipment rental: `booking_rentals.paid_at` / `paid_actor` (`schema.ts:654-655`) and `course_packages.rental_paid_upfront` (`:381`).
- 🔴 **For R-2 ("revenue at confirm"): today revenue is NOT posted at confirm.**
  - Courses and vouchers post at the **sale** (`course-sale:<id>` `sched:2524-2528`, `voucher-sale:<id>` `sched:2945-2949`).
  - Trials, singles and OTHER post at **day-end, only if ATTENDED** (`rev:<bookingId>`, `jobs.service.ts:163-237`).

## 6. ECA sessions with ALL their coaches — ✅ coaches · ❌ place / fuel
- ✅ An ECA is a `bookings` row (OTHER, `other_kind='ECA'`, `schema.ts:514`). The primary coach is on the row; **every extra coach is in `booking_teachers`**.
- ✅ **Per-coach rate is stored:** `bookings.teacher_rate_minor` (`:538`) and `booking_teachers.rate_minor` (`:623`), in satang.
  - Marked *"STORED, never posted"* (`:510-513`).
  - A swap overwrites the rate together with the coach, with no history (`other-series.service.ts:332`).
- **A series** = the rows sharing `other_series_key` (`:535`); there is no series table.
- ❌ **No school/location column** (only `other_title`, free text). ❌ **No distance, vehicle or fuel data anywhere.** Fuel "ผูกกับ ECA" has nothing to hang on except the title.

## 7. Camp hours per coach — ✅ (with one gap)
- `camp_week_day_teachers(…, teacher_id, start_time, end_time, rate_minor)` (`schema.ts:1236-1246`). NULL times mean the day's window (default 10:00-15:00, `lib/camp.ts:97`).
- **Derived rows:** one booking row **per coach per hour**, with the day rate stamped (`camp.service.ts:300-316`).
  - Past dates are **frozen**: *"a PAST date derives nothing"* (`camp.service.ts:277-279`).
  - ⇒ **For a past month, count the CAMP rows by `(teacher_id, date)`**: the safe source.
- ⚠️ **Gaps:**
  - `updateWeekDay` can still rewrite a past day's coaches/times (`camp.service.ts:333-337`), so the day table may disagree with the frozen rows.
  - `deleteWeek` (only with no children booked) hard-deletes the derived rows, past ones included (`:138`).

## 8. A branch (Bravo / Other) for any booking — ❌
- **No branch/location column anywhere, and no rooms table.** "Bravo" appears nowhere in `src`.
- The only mechanism: admin-defined **badges** (`badge_types` / `badge_values` / `booking_badges`, `schema.ts:940-996`), with the comment *"a branch is just a badge type"* (`:942`).
  - Badges are per booking only and optional; their values are DB data, not code.
  - Courses and teachers have no branch.
  - Whether a "branch" badge exists and is used on sid/uat is a **DB question**.

## 9. Web user accounts for coaches — ✅ mechanism · ❓ count
- `users.teacher_id` links a login to a coach and scopes it: *"ดูตารางตัวเอง เช็คอิน และแจ้งลา"* (`own-scope.ts:66`). At most one login per coach (`schema.ts:700`).
- Roles + per-user permissions: `schema.ts:711-753`, keys in `lib/permissions.ts:68-142`.
- **Coach LINE:** `teachers.line_user_id` (`:219`), via an approved `teacher_link_requests` (`:872-891`).
- ❓ **How many coaches have a working login:** DB only. Optional DATA REQUEST (bare SQL for the owner): `SELECT count(*) FROM users WHERE teacher_id IS NOT NULL AND disabled_at IS NULL;`
- 📌 S-16 ("each coach confirms their own pay on the web") would extend this scoped login. A coach can see nothing about money today, by design (masking keys 57/59, `budget-visibility.ts:11-17`, `coach-rate-visibility.ts:19-35`).

## 10. Course and voucher prices as sold — 🟡 only in the ledger
- ❌ **No price or paid amount on `course_packages` / `vouchers`.**
- The sale amount exists **only** as a `bo.movement` posted after the commit, **best-effort** (`void recordSale(...)`):
  - the amount = `bo.item.unit_price_minor` at post time (`lib/sale-post.ts:127-136`);
  - a discount is a second movement `discount:<refId>` (`:145-157`);
  - **a failed post is only `console.error`'d** (`:112-117`, `:165-169`), so gaps are possible;
  - **imports post nothing.**
- The price card is **hard-coded** (`lib/sale-items.ts:72-102`, `:203-208`) and seeded into `bo.item`. `resolvePriceGroup` decides the group (`sched:2063-2070`).
- **Bookings store the promised discount:** `discount_kind/value/reason/actor` (`schema.ts:475-482`). OTHER stores its price (`:508-509`).

## Extras the salary sheet will reach for
- **Coach pay rates:**
  - FREELANCE hourly = the current `bo.item.unit_price_minor` of the coach's ceiling item, current value only (`sched:~4867-4903`). Each draw movement keeps the rate it used (`sched:258`).
  - Per-session rates: `course_packages.class_rate_minor` (DUO), `bookings.teacher_rate_minor`, `booking_teachers.rate_minor`, `camp_week_day_teachers.rate_minor`.
  - ❌ **FT/PT base salary is not stored here.** The old `ops-client.ts` reader of `recurring-costs` (`lib/ops-client.ts:177-198`) is dead code per Sober's survey.
- **Coach leave:**
  - `teacher_leave_days` (`schema.ts:1271-1282`) holds advance leave only; removing a leave hard-deletes the row (`lib/teacher-leave.ts:105`).
  - A same-day leave is CANCELLED + `cancel_reason='TEACHER_LEAVE'`.
- **Merchandise / stock / sales commission:** ❌ **no tables here.** There are only rental codes (rented, not sold; `lib/sale-items.ts:137-148`). Product sales would have to live in `bo.*`.
- **Audit:** ❌ **no booking history.** What does exist:
  - `booking_undos` (append-only);
  - `course_expiry_changes` / `voucher_expiry_changes` (complete only since `0061`);
  - actor columns on end, drop, archive, rental, camp and discount.

## ❌ NOT stored at all (the list for the spec)
1. Check-in **time**; any coach clock-in.
2. `confirmed_by`.
3. **Any payment record** (paid flag / date / amount / slip) for bookings, courses or vouchers.
4. Price as sold on a course or voucher (ledger only, best-effort, none for imports).
5. A **trial → course/voucher link**, and a **course → renewal link**.
6. A teacher on a course; the history of coach reassignment.
7. A **STAFF** type; **two types for one person**; type history.
8. A **branch** / location (badges only); ECA school/place; distance, vehicle, fuel.
9. FT/PT base salary; freelance rate history.
10. A per-booking quota-deduction ledger; booking status history.
11. Merchandise sales, stock and commission.

**DB-only questions (not answered; no SQL run):** how many coaches have a login (item 9); whether a "branch" badge type exists and is used (item 8).
