# REQ-069: 🔴 สัปดาห์ต้องเป็น จันทร์→อาทิตย์ — ตอนนี้ฝั่งหน้าจอกับฝั่งข้อมูลนับคนละแบบ ทำให้คาบเรียนหายจากปฏิทิน
- Status: READY_FOR_SA
- Priority: 🔴 **HIGHEST — bookings that exist are invisible on the calendar, every week, on the busiest day**
- Requested: 2026-08-23 by stakeholder (owner)
- Source: owner — *"เมื่อเราปรับวันที่เป็นวันที่ 22 ซึ่งมันคือวันเสาร์ ฉันถึงจะเห็นงานที่จองไว้สัปดาห์ก่อน … หลักการเว็บเรา
  เอาแบบโรงเรียนไทย จะเป็นจันทร์ถึงอาทิตย์"*

## Problem — two definitions of "this week" in one screen
**The front end and the back end disagree about when a week starts, and the calendar is the place they meet.**

| | where | week |
|---|---|---|
| **Front end** — renders the columns | `CalendarContent.tsx:27` — `dayjs(date).day(day===0 ? -6 : 1)` | **จันทร์ → อาทิตย์** ✅ correct |
| **Back end** — decides which days to FETCH | `lib/time.ts:38` `weekRange` — `addDays(iso, -getDay())`, `getDay()` 0=Sunday | **อาทิตย์ → เสาร์** ❌ |

`getCalendar` (`scheduler.service.ts:382`) fetches with **`weekRange`**, so the grid is drawn for one week and
filled with another week's data. **They only ever overlap partially.**

### What that actually does — and it is worse than "the wrong week"
Take any Wednesday: the FE draws **จ 17 → อา 23**; the BE returns **อา 16 → ส 22**.
⇒ **The Sunday column has no data to draw. Ever.**
**Sunday is this customer's busiest day** — the go-live import had **80 rows on Sunday**, the largest of all eight
batches. **Their busiest teaching day is blank on the calendar unless someone happens to navigate onto a Sunday**,
which is exactly the accident that made the owner notice.

**Staff look at a calendar and do not see bookings that exist.** No error, no warning — the cell is simply empty,
which reads as "nobody booked".

## Requirement
1. **One definition of a week, everywhere: จันทร์ → อาทิตย์.** The owner's rule, and the Thai school convention.
2. **`weekRange` is corrected at the source** — not patched at the calendar. It is a shared helper; a caller-side
   workaround leaves the next caller wrong.
3. 🔴 **Every call site is audited before the change ships.** Changing a shared date function silently shifts
   anything that groups by week. **The teacher's LINE "ตารางสัปดาห์นี้" uses it** (`line-webhook.service.ts:374`,
   documented as *"Sun–Sat via weekRange"*) — **teachers have been getting the wrong week too.**
4. **The teacher's weekly LINE schedule shows จันทร์→อาทิตย์** — and this lands with **REQ-067 Part B**, which is
   already rewriting that message. **Fix the range and the layout in one pass rather than touching it twice.**
5. **No other behaviour changes.** Day view, bookings, courses, leave, reports and revenue are untouched except
   where they were reading a week boundary — and where they were, they become correct.

## Acceptance Criteria
- [ ] **AC-1 (🔴 the reported case)** — **Given** today is **Sunday**, **When** staff open the week view, **Then**
      they see **จ→อา of the week that Sunday ENDS**, with every booking of that week present — including
      **Monday–Saturday**, which today vanish.
- [ ] **AC-2** — **Given** any day of the week, **When** the week view is opened, **Then** the columns drawn and
      the data returned are **the same seven days**. **The Sunday column is populated like any other.**
- [ ] **AC-3** — the header range (`17 ส.ค. – 23 ส.ค.`) matches the data shown, on **every** day of the week.
- [ ] **AC-4 (teacher LINE)** — `ตารางสัปดาห์นี้` covers **จันทร์→อาทิตย์**, and on a Sunday it shows the week that
      is ending, not the one starting.
- [ ] **AC-5 (regression, the risk of a shared helper)** — every other `weekRange` caller is listed in the task and
      **checked individually**. Anything that must stay Sunday-based is named and left alone **with its reason
      written down**.
- [ ] **AC-6** — day view is unaffected.
- [ ] **AC-7 (proof)** — verified on **each of the seven days** — not one spot check. This defect is *invisible*
      six days out of seven and obvious on the seventh; **only walking the week proves it.**

## Constraints
- **Do not fix this in the calendar component.** The disagreement is the bug; making the FE match the BE would
  make the Thai week wrong everywhere else instead.
- No data migration — this is a read-range calculation, nothing stored changes.

## Questions
- **Q1 (to SA):** list every `weekRange` caller and say, for each, whether Monday-start is correct. **Porter
  expects "yes" for all of them** — but the point of asking is that a shared date helper is exactly where an
  unexamined assumption spreads, and this REQ exists because one did.
- **Q2 (to SA):** is there anywhere else that computes a week **without** `weekRange` (a second FE spot, a report,
  the daily digest)? **A third definition would be worse than the two we have**, because it would agree with one
  of them and be missed.
