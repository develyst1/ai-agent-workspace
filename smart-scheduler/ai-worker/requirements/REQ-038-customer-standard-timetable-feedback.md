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

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-038 | Customer "Standard Timetable" feedback (2026-08-04) — 9 items; **1–5 = customer's essential initial set** | **QUEUED (after REQ-030 ship)** | 🧪 **QA runtime verify on `sid` 2026-08-10 (Tanya) — #4 `TEST_PASSED` · #3 `TEST_FAILED` · #5 blocked:** ✅ **#4** voucher shows its class: `GET /bookings?type=VOUCHER` → **5/5 rows carry a subject**, and the FE renders it in both places staff look — the All-bookings **Subject** column (1st Trial · Skateboard · Skateboard · Inline Skate · Surfskate, no blanks) and the voucher plan modal per session. ✅ **#3 `TEST_PASSED` (accepted 2026-08-10 evening — DEF-2 CLOSED the same day it was found).** TASK-124 shipped the `Find student` box (placeholder “Search by student name”) as the **fourth** filter on the timetable. It filters for real: week view **6 cells → 2**; case-insensitive (`QA-EXP` = `qa-exp`); a nonsense query → **0 cells** (filters rather than ignoring); clear → back to 6; **and it works in the DAY view too** (non-match empties that grid). **STANDING RULE on the deployed build — the now-4-control row at 1600/1280/768/375:** Find student **218 / 208 / 208 / 317** · Teacher 366/233/207/247 · Type 220/132/115/247 · Badge 220/132/624/247; lines used **2 → 2 → 3 → 4**; narrowest control **115 px**; **no page overflow at any width** — nothing collapses (the defect this rule exists for was 26/36 px), the row **wraps** instead of crushing. ✅ **OBS-5 resolved by TASK-125** — the two same-program courses now read distinctly (`… (1/4) · exp 2026-09-15` vs `· exp 2026-09-21`). 🏁 **REQ-038 essential set 1–5 = 100% ACCEPTED from QA** (#1 ✅ · #2 ✅ · #3 ✅ · #4 ✅ · #5 ✅). _The gap as first found:_ **DEF-2 (MEDIUM, unbuilt, not a regression):** `/scheduler/calendar` carries **Teacher / Type / Badge filters only — no student search anywhere on the page** (nor any other search affordance). The row maps #3 to “REQ-011 DELIVERED”, but REQ-011 fixed the **student picker inside the New Booking modal**; the customer asked for a search bar **on the timetable page**. The bookings page does have one — which is exactly why this read as done from the board. ✅ **#5 `TEST_PASSED` (accepted 2026-08-10 after the afternoon deploy)** — `GET /courses/:id/history` now **200** `{courseId, summary, events}`; on the QA course **8 events / 6 distinct kinds** (`scheduled · sick-leave · attended · cancelled · makeup-appended · extra-session-added`), each traceable to a real action; summary matches the plan; the modal renders dated entries with teacher/subject; **the hyphen-key risk holds — no raw i18n key on screen**; the “who isn't tracked yet” note is shown. Scope stated: **6 of 9** kind labels exercised (the ones this course produces) — the other three were SA-verified in code. ✅ **#2 spot-verified** — the picker labels each course with subject + used/size (`QA-expv · Bike / Scooter / Balance Cruiser (1/4)`). ⚠️ **OBS-5 (LOW):** two courses matching on subject AND size AND progress render as the *identical* string — nothing books wrong (value is keyed by `courseId`) but a human can't tell them apart; my duplicate QA data exposed it, the customer's real case is two different programs. Tiebreaker in the label? ✅ **Fast-follow smoke:** TASK-107 — excluded set derived from the server's `voucherAllowedGroups=["bike-skate"]` ⇒ Onewheel / Balance Play (Private) / Balance Play (Group) **not offered**, `1st Trial` left selectable **by design** with the server as backstop, proven live: **409 `VOUCHER_PROGRAM_EXCLUDED`** · TASK-109 — “Record rental” opens on the All-bookings tab · TASK-102/122 — settings screen loads; override→reset round-trip works and **the environment was restored to exactly its prior state**. Evidence: `tests/TEST-REQ038-essential-set-3-4-5.md` · `../project-docs/qa-2026-08-10/`. **@Porter — (1) route #3 (own task or into REQ-038's build), (2) deploy #5 and I'll accept same day.** | **CAPTURED — do NOT start until the REQ-030 ship is deployed + accepted** (owner: finish in-hand work first) | **@Porter holds.** BA map (checked, not guessed): **#1** ลาล่วงหน้า→ขยายคอร์ส+เลือกครู = **REQ-030, built, deploying** 🟢 · **#2** เรียนเพิ่มกลางสัปดาห์→เลือกตัดคอร์สไหน = Bookings per-card OK; **calendar picker SA-verified** — backend disambiguates (1 entry/course, keyed by courseId), FE label enriched → **TASK-121 DONE** 🟢 (subject+used/size in dropdown row; value/payload unchanged) · **#3** Search Bar หน้าตาราง = 🟢 **BUILT** (TASK-124 SA-PASS — FE-only `byStudent` filter on `/scheduler/calendar`, no BE/migration; awaiting `sid` deploy + Tanya runtime/width accept) · **#4** voucher shows its class = ✅ **`TEST_PASSED`** (sid 2026-08-10) · **#5** ประวัติการตัดคอร์ส = ✅ **`TEST_PASSED`** (sid 2026-08-10; TASK-119 BE + TASK-120 FE SA-PASS) · **#6** teacher working *hours* = partial (REQ-005 has days not time-ranges) · **#7** Group/Camp/ECA = REQ-033 · **#8** conversion/performance = REQ-033 · **#9** freelance-weekday+PT-weekend teacher type = 🔴 **new gap** (per-day type, touches money model). **Sequencing (owner):** finish ship → 1–5 to 100% → deploy to customer → 6–9 + prior backlog. Full detail: `requirements/REQ-038-…md`. |
```
