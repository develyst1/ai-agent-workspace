# REQ-038: Customer "Standard Timetable หน้าบ้าน" feedback — 9 items (2026-08-04 LINE)

- Status: **ACTIVE (items 1–5) — the REQ-030 ship is DELIVERED (2026-08-10), so the held work is done and the owner
  greenlit continuing.** Items 6–9 remain QUEUED (after 1–5 → customer deploy).
- Priority: items **1–5 = customer's "necessary for initial use"** → the next focus AFTER the current ship;
  items **6–9 = later**.
- Source: customer (คุณปุ้ม) LINE to @dev, forwarded by คุณฟีน 2026-08-04.

## Owner's sequencing (2026-08-04)
1. **Finish the current held work first** — REQ-030 core + REQ-037 + OBS-3 → deploy → Tanya accept (100% done).
2. **Then bring customer items 1–5 to 100%** → deploy to the **customer's real environment** for actual use.
3. **Then** items 6–9 + the pre-existing backlog (REQ-033/034/035/036, fast-follow FE 102/107/109, etc.).

## The 9 items — verbatim + BA status map (checked 2026-08-04, not guessed)

### 1–5 — customer says these are the essential initial set
1. **การลงวันลาล่วงหน้า เพื่อขยายอายุคอร์ส + เลือกครูได้เลยหากคอร์สหนึ่งมีหลายครู**
   → 🟢 **= REQ-030** (planned absence → appended makeup extends the course; per-session teacher via the availability
   picker). **Built, in the ship about to deploy.** Reaches the customer when pushed to their production.
2. **น้องเรียนเพิ่มระหว่างสัปดาห์ ขึ้นให้เลือกว่าจะตัดคอร์สไหน**
   → 🟡 **In-flight (stretch TASK-113/115):** Insert (quota reschedule, pulls from the course tail) + REQ-037
   (extra paid session, no quota). ⚠️ **Confirm the nuance:** "เลือกว่าจะตัด**คอร์สไหน**" — when a student holds
   **multiple** courses, does the flow let staff pick **which course's quota** the mid-week session draws from?
   Verify TASK-113 covers the multi-course target selection; if not, small add.
3. **Search Bar หน้าตาราง** → 🟢 **REQ-011 DELIVERED** (student search on schedule). Confirm it matches the
   timetable page the customer means.
4. **voucher ขึ้นว่าเรียนคลาสอะไร** → 🟡 **REQ-029 build complete (SPEC_DONE)** — adds program/subject to voucher
   bookings. Pending deploy + acceptance to reach the customer.
5. **ประวัติการตัดคอร์ส** → 🔴 **GAP — genuinely new.** The plan modal shows current session states and cancel
   stores a reason, but there is **no dedicated "course deduction history / timeline" view**. This is the one clear
   new build in the essential set. **→ new REQ when we reach step 2.**

### 6–9 — customer says later
6. **ช่วงเวลาทำงานของครู** → 🟡 partial. REQ-005 has working **days** (`workDays`); per-teacher working **time
   ranges** may not exist. Confirm scope.
7. **การลงคลาส Group (Camp & After-school / ECA)** → 🔴 gap — already in **REQ-033** (customer-presentation
   backlog, item C). Do not re-create; scope from REQ-033.
8. **Conversion trial → course / Performance Kru** → 🔴 gap — already in **REQ-033** (item B; the customer called it
   a key feature). Do not re-create.
9. **ครูบางคนเป็นฟรีแลนซ์วันธรรมดา + พาร์ทไทม์เสาร์อาทิตย์** → 🔴 **GAP — genuinely new.** Teacher employment
   type that **varies by day of week** (freelance weekday / part-time weekend). Current model likely treats type as
   per-teacher, not per-day. **→ new REQ; touches the freelance/salary money model — design carefully.**

## Net (BA read)
Essential 1–5: **#1 done · #3 done · #4 built · #2 in-flight** ⇒ **~4/5 already in hand**; the clear new gap is
**#5 (deduction history)**, plus the **#2 multi-course nuance** to confirm. Later 6–9: #7/#8 = REQ-033; #6 partial;
**#9 = new** (per-day teacher type).

## When we reach step 2 (after the ship) — do NOT start before then
- Confirm #2 multi-course-target with SA; open new REQs for **#5** and **#9**; verify #3/#4 actually reach the
  customer's environment on deploy; #6 scope check; #7/#8 pull from REQ-033.
