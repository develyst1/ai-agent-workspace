# TASK-743 — REQ-124 (3/3): `GET /reports/daily` gains `kidsByProgram` ("Others Program", Palm §10) — BE, S–M (≈ 1.5 d → 1.65 d)
- Source: `requirements/REQ-124-back-serves-palms-som-dashboard-and-others-program.md` · Palm's `docs/backend-som-dashboard.md` + `docs/backend-daily-report.md` §10 (front repo at `e314303`, READ ONLY) · **`CHECK-REQ-124-som-and-others-program-2026-10-18.md`** (the facts, mismatches M1–M14, the defaults §4, the decisions §5)
- Status: ✅ DONE incl. the TEST-109 F2 fix (Silver, 2026-10-19) · fix uncommitted
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-18)
- **Claim:**
  - Team B's own TASK-737 files: `src/lib/daily-report.ts` · `src/services/daily-report.service.ts` · `daily-report-task737.test.ts` (+ a new `…task743` test/set).
  - `types/contract.ts` (`DailyReportResponse`) · OpenAPI.
  - 🚫 The old `getDailyReport` stays byte-identical (hash-pinned).
- 🔴 SAFE test command only (TASK-723 has it). 🔴 run → list → ask → THEN edit. 🚫 No front file; no change to Palm's docs. Nothing committed.
- **Defaults:** where Palm left a question open, use the default in CHECK §4 and declare it in one line in Implementation Notes. Each default lives in ONE named constant, so a ruling is a one-line flip + its pin.

## Build (§10.2 / §10.3, with our facts)
1. **The read:**
   - add `otherKind · otherTitle · headCount · campWeekDayId · otherSeriesKey` to the columns;
   - load the GROUP rows' **seats** (their statuses);
   - count `camp_days` for the date per camp week (as `dayCountsByWeek`, `camp.service.ts:30, 42-49`).
2. **The 4 programs, always in this order** `GROUP, ECA, CAMP, OTHER` (an empty one = `{program, total: null, items: []}`):
   - **GROUP:** kids = the seats that are live or delivered (**not** CANCELLED / SICK_LEAVE / PAUSED). 🚫 Never `headCount`: on a GROUP row it is the seat CAP (M9). Name = the group's display name.
   - **ECA:** `otherKind = ECA`; name = `otherTitle`; kids = `headCount`.
   - **CAMP:** one item per camp week, with that day's `camp_days` count.
   - **OTHER:** OTHER rows that are neither ECA nor CAMP; name = title; kids = `headCount`.
   - Not CANCELLED / PAUSED.
   - An item with the same name twice a day is merged (Palm K1).
   - `headCount` empty ⇒ `null`; `null + n = n`; all `null` ⇒ `null`.
3. **⏳ D1, the ECA / OTHER hour rows (M10):** with Porter's OK, count `headCount` **once per class** (same series/title + teacher + date + contiguous hours). Otherwise Palm's literal per-row sum. Keep it ONE function, so the ruling is a one-line change.
4. **`?teacherId`** filters this section too (incl. extra coaches, Palm K2). One booking counts once even with 2 coaches.

## Definition of Done
- [ ] **By-value tests = Palm §10.5:**
  - ECA STA two rounds 5 + 6 + ISB 8 ⇒ total 19, items [STA 11, ISB 8];
  - a camp of 5 hours with 8 kids ⇒ 8, not 40;
  - an ECA with 2 coaches counts once, and `?teacherId` = the 2nd coach still sees it;
  - OTHER with no head count ⇒ `null`;
  - no camp ⇒ `{CAMP, null, []}`;
  - **plus ours:** a GROUP with 4 seats, 1 cancelled ⇒ 3; and the D1 case (a 2-hour ECA with 5 kids).
- [ ] **Mutation set:** `headCount` used for GROUP · camp counted per hour · a cancelled seat counted · a program missing · `null` turned into 0.
- [ ] Team B's TASK-737 set still bites; the old `getDailyReport` has a 0-line diff. tsc · full suite (SAFE) with counts.

- **✅ Porter (2026-10-18):**
  - the claims are GRANTED exactly as listed;
  - **D1 = ONCE PER CLASS** (same series/title + teacher + date + contiguous hours);
  - **K1/K3/K4/K5 are with the owner**: build with Palm's defaults (one constant each);
  - **K5 (Remark) is NOT built**: `remark: null`.
  - Order: **741 → 742 → 743.** ▶️ GO.

## Implementation Notes
**Evidence (Bob, 2026-10-18):** new test `src/lib/daily-report-task743.test.ts` **18 pass** · set `daily-report-task743.mutations.json` **22/22 BITES, CHECKSUM identical** · 737's own set still bites (**11/11**) and its 25 tests pass · full SAFE **4934 pass / 0 fail (357 files)** · tsc 0 · the old `getDailyReport` 0-line diff (hash pin still passes). Nothing committed.

**Files (the claim only):** `src/lib/daily-report.ts` (+ `kidsByProgram`, `classesOf`, the constants; `countDaily` untouched) · `src/services/daily-report.service.ts` (the READ) · `src/types/contract.ts` (`DailyReportResponse.kidsByProgram`) · `src/openapi/document.ts` (the response description) · NEW test + set. One re-pin in 737's set file: its M6 anchor `new Set(["CANCELLED", "PAUSED"])` became ambiguous when this section added the same literal to the same file, so it now names its constant (`NOT_BOOKED_STATUSES: … = new Set(…)`); same edit, same bite.

**Rules (constants / functions; decisions overturnable at review):**
1. **Always the 4 programs** `GROUP, ECA, CAMP, OTHER`; an empty one is `{program, total: null, items: []}`. `null` = not recorded (never 0); `null + n = n`; all null ⇒ total null.
2. **GROUP** = the group row; kids = its SEATS (read through the `seats` relation) that are not CANCELLED / SICK_LEAVE / PAUSED (`SEAT_NOT_A_KID_STATUSES`) — never `headCount` (the cap, M9). No seat rows at all ⇒ `null`; seats that are all cancelled ⇒ `0`. Name = the group's title.
3. **ECA** = OTHER + `other_kind = ECA`; **CAMP** = OTHER + `CAMP` (or a camp week via `camp_week_day_id`); **OTHER** = every other OTHER row. Name = `other_title` (blank ⇒ the kind, never a blank name). A lesson row belongs to none.
4. **CAMP** = ONE item per camp WEEK; kids = that week's `camp_days` count for the date, read through `weeksForCalendar` (THE number the calendar prints as `campKidCount` — not a second query), and only when the day has a camp row. Name = the week's name.
5. **D1 (Porter: once per class):** `classesOf` is the ONE function — a class = same series (else title) + coach + date, and the next hour starting exactly where the last ended; `headCount` counts once per class (the first recorded one). `KIDS_ONCE_PER_CLASS = false` is Palm's per-row sum (tested both ways).
6. **K1** (Palm): same name twice in a day merges (STA 5 + 6 = 11); items are sorted kids descending (not recorded last), then name.
7. **CANCELLED / PAUSED rows are out** (`PROGRAM_EXCLUDED_STATUSES`); PENDING counts. One booking is ONE row, so an ECA with two coaches counts once, and `?teacherId` (primary OR extra coach, K2) keeps it for both.
8. The rows of a group's SEATS are not rows of the day (they have `group_id`, as in 737); the seats come in through the group row.
9. K3: per-program totals only (no grand total); K4: not recorded ⇒ null.

## Questions
None blocking. For the record: a GROUP row with no seat rows reports `kids: null` (Palm: «no seat data → null»), whereas all-cancelled seats report 0.

## Review

**Silver, 2026-10-18 — ✅ FINAL: DONE.**
- **Re-run by me (SAFE), on the whole REQ-124 tree:** **4934 / 0** (357 files) · tsc 0 · sets **741 39/39 · 742 46/46 · 743 22/22 · 737 11/11**, every `CHECKSUM identical` · the old `som-report.service.ts`, `lib/som-report.ts` and `scheduler.service.ts` (`getDailyReport`): **0-line diff**.
- **D1 is built as ONE function** (`classesOf`, switch `KIDS_ONCE_PER_CLASS = true`).
- GROUP kids = seats not CANCELLED / SICK_LEAVE / PAUSED, never `headCount`.
- CAMP = one item per week from the calendar's own count.
- 📌 **Own-team pin, granted by me (reported):** `daily-report-task737.mutations.json` M6's anchor now names its constant (`NOT_BOOKED_STATUSES: …`) because 743 added the same literal to the file; same edit, same bite (11/11).

## 🔁 TEST-109 F2 (Tanya, 10-19): CAMP leaves out camp weeks that have kids but NO coach that day
- **Cause (code):** `daily-report.service.ts:23-34` reads a camp week's kids **only when the day has a camp HOUR row**, and hour rows exist only per COACH (`camp.service.ts:274-318`). A coach-less week therefore drops out.
- Sid evidence: 12 Oct "Camp 12-13 Oct" (3 kids, 0 coaches); 19 Oct "Camp 19 - 23 Oct" (2 kids).
- **The rule is "kids in camp that day"** (Palm §10.1 *"จำนวนเด็กในแต่ละวัน"*), so this is a bug, not a design.
- **Fix:**
  - read `weeksForCalendar` for the date **always**; every week with `dayCounts[date] > 0` is an item, whether it has a coach or not. A week with 0 kids stays out, as today.
  - **Under `?teacherId`:** keep only the weeks where that coach has a camp row that day (a coach-less week shows only unfiltered).
- **Pins:**
  - by value: a coach-less week with 3 kids ⇒ an item of 3; the same day under a teacher filter ⇒ not shown; a week with a coach still counts once;
  - a mutation: "only weeks with a camp row" back (bites).
- Inside 743's granted files.
- A mirror pin that follows only from this edit = I grant it; list it.

### TEST-109 F2 fix (Bob, 2026-10-19)
**Done.** The day's camp weeks are now ALWAYS read (`weeksForCalendar`, `daily-report.service.ts`); `kidsByProgram` (`lib/daily-report.ts`) adds every week of the day with kids > 0 that has no camp hour row (a coach-less week), named by the week, kids from `dayCounts[date]`. A week WITH a row is counted once, as before (a row-week with 0 kids still shows 0, as today); a rowless 0-kid week stays out. **Under `?teacherId`** only the weeks where that coach has a camp row show (a coach-less week belongs to no coach).
Pins: new by-value test (coach-less week of 3 ⇒ an item of 3; the same under a coach filter ⇒ not shown; a coached week once; 0-kid rowless week out) + a service-level test (no camp row at all, a week of 2 ⇒ CAMP total 2; `weeksForCalendar` called once). The set gained **P19 (F2 reverted: only weeks with an hour row), P23 (shown under a coach filter), P24 (a 0-kid coach-less week shown), P25 (a coached week counted twice)** and **P18 was re-aimed** (the READ never asks for the weeks) — **743 set 25/25 BITES**.
Mirror pin (listed for Silver's grant): `daily-report-task737.test.ts` (my own claim) — its service tests now spy `weeksForCalendar` (returns none), because the service always reads it.

**Silver, 2026-10-19 — ✅ TEST-109 fix verified.** **My re-run (SAFE):** **4935 / 0** · tsc 0 · sets **741 40/40 · 742 47/47 · 743 25/25 · 737 11/11**, all `CHECKSUM identical` · the old SOM / daily code: a 0-line diff. F2 verified in the diff: the day's camp weeks are always read; coach-less weeks with kids count, and are hidden under `?teacherId`. Own-team pin granted by me: `daily-report-task737.test.ts` now spies `weeksForCalendar`.
