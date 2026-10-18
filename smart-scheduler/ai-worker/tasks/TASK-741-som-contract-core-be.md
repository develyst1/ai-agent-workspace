# TASK-741 — REQ-124 (1/3): `GET /reports/som` serves Palm's contract: filters + Today + Existing Customers + Demographic + Activity/Program — BE, L (≈ 6.5 d → 7.2 d)
- Source: `requirements/REQ-124-back-serves-palms-som-dashboard-and-others-program.md` · Palm's `docs/backend-som-dashboard.md` + `docs/backend-daily-report.md` §10 (front repo at `e314303`, READ ONLY) · **`CHECK-REQ-124-som-and-others-program-2026-10-18.md`** (the facts, mismatches M1–M14, the defaults §4, the decisions §5)
- Status: ✅ DONE incl. the TEST-109 N1 fix (Silver, 2026-10-19) · fix uncommitted
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-18)
- **Claim (asked of Porter, one list with 742):** NEW `src/lib/som-contract.ts` (pure counters) + NEW `src/services/som-contract.service.ts` (the reads) + their tests · `src/routes/api.ts` (the `/reports/som` route body + 1 import) · `src/validation.ts` (a `somQuery`: `month` `YYYY-MM`, not in the future; `badgeValueIds` comma list of uuids) · `src/types/contract.ts` (`SomReportResponse` new sections) · `src/openapi/document.ts` (the params). 🚫 **The old `getSomReport` (`som-report.service.ts`) and `lib/som-report.ts` stay BYTE-IDENTICAL**: 7 test files pin their source text (CHECK §1). The route keeps calling it and MERGES the new sections into its result, so every old field the front still reads stays.
- 🔴 SAFE test command only (TASK-723 has it). 🔴 run → list → ask → THEN edit. 🚫 No front file; no change to Palm's docs. Nothing committed.
- **Defaults:** where Palm left a question open, use the default in CHECK §4 and declare it in one line in Implementation Notes. Each default lives in ONE named constant, so a ruling is a one-line flip + its pin.

## Build (Palm's field names verbatim; integers; echo `month` in each section)
1. **Filters (§0.1):**
   - `month` (default the current Bangkok month) applies to every section except Today.
   - `badgeValueIds`: OR. A booking matches if it carries any of them.
   - A "person" section counts a student if **any qualifying booking of theirs in the window** matches (CHECK M5); one student is counted once per response.
   - No badges sent = every branch.
2. **`today` (§1):** `{date, confirmed, attended, attendanceRate}`. **Reuse REQ-119's `countDaily`** (`lib/daily-report.ts`) over today's lessons (CHECK K6). Badge-filtered; `month` ignored.
3. **`existingCustomers` (§2):**
   - `activeCourse`, `activeVoucher`: active **at month end**; the current month = today.
     - Use `courseStatus` / the voucher status, not `courseEligible` (M2).
     - For a past month, rebuild "used" from the ATTENDED / NO_SHOW rows dated ≤ month end, and take the expiry in force that day (`course_expiry_changes` / `voucher_expiry_changes`) (M12).
   - `recentFirstTrial` (3 full months; moves out on a COURSE bought after it).
   - `recentSingleSession`.
   - `totalCustomers` (the selected month only, Palm's Q2.7 reading).
   - `recentFrom` / `recentTo`.
   - **Unit: people.** This is Palm's; 📌 **K1 is open** (the meeting says packages), so keep it ONE constant.
4. **`demographics` (§5):**
   - **New age bands** (`1-2 · 3-4 · 5-7 · 8-10 · 11-13 · 14-19 "14+" · 20-39 "20+" · 40-54 "40+" · 55+` + `unknown`, all 9 always, in order) as a NEW constant. The old `AGE_BANDS` stays.
   - **`district`** from the parent's `districtCode`:
     - `key` = the district code;
     - `label` = `"<district TH>, <province TH>"` via `lib/area-codes.ts`;
     - sorted by count, `unknown` last.
   - `province` and the rest: same shape as today.
   - Counts only **students who attended in the month** (Q5.2 ✅).
5. **`activityProgram` (§6):**
   - **Every category** = each active subject, 0 included, sorted by total desc, `unknown` last.
   - Fields: `course` / `voucher` / `singleSession` / `firstTrial` / `typeTotal` / `total`.
   - Counts **attended sessions in the month** (rows; CHECK §4 Q6.8), by each session's subject (M8).

## Definition of Done
- [ ] **By-value tests:**
  - every field above;
  - the badge OR + person-once rule;
  - a past month rebuilt correctly (a course used up AFTER that month end is still active for it);
  - an ended / paused course is not active;
  - a trial that became a course leaves `recentFirstTrial`;
  - the 9 age bands with zeros;
  - a district label with its province;
  - a voucher session counted under its subject.
- [ ] **Mutation set:** the badge filter dropped from one section · `courseEligible` used instead of the status · CANCELLED counted · the old age bands · the person-once rule broken · month ignored.
- [ ] The old SOM files: a 0-line diff (their pins still pass). tsc · full suite (SAFE) with counts.

- **✅ Porter (2026-10-18):**
  - the claims are GRANTED exactly as listed;
  - **D1 = ONCE PER CLASS** (same series/title + teacher + date + contiguous hours);
  - **K1/K3/K4/K5 are with the owner**: build with Palm's defaults (one constant each);
  - **K5 (Remark) is NOT built**: `remark: null`.
  - Order: **741 → 742 → 743.** ▶️ GO.

## Implementation Notes
**Evidence (Bob, 2026-10-18):** SAFE full suite **4860 pass / 0 fail (355 files)** · tsc 0 · new test `src/lib/som-contract-task741.test.ts` **48 pass** · mutation set `som-contract-task741.mutations.json` **37 BITES / 0 SURVIVED, CHECKSUM identical** (`mutation-sets-task627` anchors still pass) · old report: `git diff` of `som-report.service.ts`, `lib/som-report.ts`, `scheduler.service.ts` = **0 lines**, and the first two are also pinned by sha1 in the new test. Nothing committed.

**Files (the claim, nothing else):** NEW `src/lib/som-contract.ts` (pure `countSom` + `mergeSom`) · NEW `src/services/som-contract.service.ts` (the READ; re-exports `mergeSom` so `api.ts` needs ONE import) · `src/routes/api.ts` (the `/reports/som` body + 1 import) · `src/validation.ts` (`somQuery` + 1 import of `bangkokNow`) · `src/types/contract.ts` (`SomReportResponse`) · `src/openapi/document.ts` (a NEW `/api/reports/som` entry with the two params — there was none) · NEW test + NEW mutation set. No migration, no front file.

**How it fits:** the route runs the OLD `getSomReport()` and the NEW `getSomContract(q)` in parallel and `mergeSom` lays the new sections over the old result: every old field stays (`sportShare`, `newVsRenewing`, `existingCustomers.byCourse…`, `today.expected`); where the names meet, the new definition wins (`today.attended`, all four `demographics.*`). The old `newVsRenewing.renewing` is still the always-0 bug — that is TASK-742's.

**Constants (each ONE named constant, the CHECK §4 default; a ruling = a one-line flip + its pin):** `ACTIVE_COUNT_UNIT = "PEOPLE"` (K1, also an injectable `activeUnit` so both paths are tested) · `TRIAL_MOVES_OUT_ON_VOUCHER = false` (Q2.2) · `SINGLE_SESSION_MOVES_OUT = false` (Q2.3) · `SOM_AGE_BANDS` (Q5.1/K3, Palm's 9) · `USED_STATUSES` = ATTENDED + NO_SHOW (CHECK M12). K5: not built, and no `remark` field exists yet (742's modal rows say `null`).

**Decisions I made (internal, overturnable at review):**
1. **«Active at month end»** = `courseStatus` / `voucherStatus` evaluated AS OF the month end (current month = today): the counter is rebuilt as `stored − delivered rows dated after` (a course used up in October is still active for September), the expiry is the `from` of the first expiry move made AFTER that day (`course_expiry_changes` / `voucher_expiry_changes`), and an end / pause made after the month end is ignored. A course bought after the month end does not exist for it (Bangkok date of `created_at`). **Known limit:** a pause that was later *resumed* leaves no trace (`dropped_at` is cleared), so a past month may count such a course as active — the data does not say.
2. **Branch (badge) membership of a course / voucher** = any of its NON-cancelled session rows (any date) carries a selected badge (CHECK M5). A course with no rows is in no branch when a filter is on, and in every branch when none is.
3. **Trial / 1 HR** = class date, any status but CANCELLED (PAUSED counts), the window = whole months [month−2 … month]. «Moves out» = a course (DUO child too) with a purchase date (Bangkok) **on or after the child's earliest in-window trial date and no later than the month end**; a purchase counts whatever became of the course. Total Customers uses the selected month's trials / 1 HR only (Q2.7).
4. **Person sections** (Demographic, and the persons of Total) read ATTENDED lessons of the month only (Q5.2) — NO_SHOW is not «มาเรียน». A group **seat** is a student's own session (it counts here and in Activity); it is never a row of TODAY (the group row counts once per coach, REQ-119). A DUO row names both children (`duoStudentIds`); a child is counted once per response.
5. **Demographic breakdowns:** gender / nationality / province / ageBand / district ALL read the same people (students who attended in the month) — so the four old breakdowns changed meaning (they were «all students»). Province = the ACTIVE parent's province name (an archived household → `unknown`, TASK-411); district = `key` the code, `label` `"<district TH>, <province TH>"` from `areaName`; a code outside the dataset → `unknown`. Age 0 is filed under `1-2`.
6. **Activity / Program** counts attended SESSIONS (rows) by the booking's own `subject_id` (a voucher session takes its booking's subject). Categories: every ACTIVE subject (0 kept) + an inactive one only when it has sessions; `key` = subject id, `label` = subject name; `unknown` (no subject) last and only when it has sessions; sort total desc → name → key. ECA / Camp / GROUP rows are not lesson types ⇒ out (Q6.5).
7. **Reads:** like the old report, one broad read of bookings (columns only + badge ids, `pending_slot = false`), courses, vouchers, the two expiry-move tables, students, ACTIVE parents (`activeParentWhere`), subjects — then pure code. No SQL by me.
8. **Validation:** `month` `YYYY-MM`, a real month, a future month → 400; `badgeValueIds` comma list of uuids (trimmed, empty ⇒ none), a non-uuid → 400. Neither sent ⇒ this month, every branch.

## Questions
1. **Today's `attendanceRate`** — I reused `countDaily` verbatim (Silver's brief + her «เหมือน Daily Report»), so the SOM Today circle equals the Daily Report circle: `attended ÷ (confirmed + on leave)` (the REQ-119 ruling, TASK-738). Palm's SOM doc §1 writes `attended ÷ confirmed`. On the proof day they differ whenever someone is on leave. **Default kept = the Daily Report's. If Palm's formula is wanted, it is a one-line change in `countSom` (and its pin).**
2. **Category = the SUBJECT's name** (CHECK M8), not `priceGroup` (six skate programs share one price line, so `priceGroup` would merge them). If Khwan wants the sport groups, it is a one-line key change.

## Review
**Silver, 2026-10-18 — review 1: ✅ the build passes · 🔁 ONE fix (your Q1).**
- **Re-run by me (SAFE):** **4860 / 0** (355 files) · tsc 0 · the set **37/37 BITES**, `CHECKSUM identical`.
- **Diff:** the claim only. The route runs the old + the new in parallel and merges (I read it). The old SOM files are untouched.
- 🔁 **Q1 → Palm's formula:** `today.attendanceRate = round(attended ÷ confirmed × 100)`, with confirmed 0 ⇒ 0.
  - Palm §1 states it explicitly: Attended ⊂ Confirmed, so it never exceeds 100.
  - Her sheet pairs the same two numbers: *"Attendance = % การเข้าเรียน confirmed/ attended"*.
  - "เหมือน Daily Report" is about WHAT is counted (lessons, the same Confirmed / Attended), not the circle's denominator.
  - Fix: the one line in `countSom` + a by-value pin (someone on leave ⇒ the two formulas differ) + a mutation (the Daily Report denominator back).
- ✅ **Q2 accepted:** category = the subject name. `priceGroup` would merge six skate programs; her list names sports.
- ✅ **Your 8 decisions accepted.** Two notes:
  - (1) the resumed-pause blind spot is a data limit; I'll list it for Porter;
  - (5) the four old demographic breakdowns now mean "attended this month": that IS Palm's new contract (Q5.2), so it's correct.
- **Do the Q1 fix alongside 742 and report it with 742.** I close 741 then.

### Review 1 fix (Bob, 2026-10-18) — folded in before 742
Silver's ONE fix done: Today `attendanceRate` = attended ÷ CONFIRMED (Palm §1, her sheet), 0 when confirmed = 0 (`lib/som-contract.ts`; Question 1 above is therefore ANSWERED, the Daily Report's circle is no longer used here). Pin: the Today test now expects 33 (1/3), not 25. Mutation set now **39/39 BITES** (+M38 the old circle back, +M39 the zero guard lost), checksum identical. SAFE 4860/0, tsc 0.

**Silver, 2026-10-18 — ✅ FINAL: DONE.**
- **Re-run by me (SAFE), on the whole REQ-124 tree:** **4934 / 0** (357 files) · tsc 0 · sets **741 39/39 · 742 46/46 · 743 22/22 · 737 11/11**, every `CHECKSUM identical` · the old `som-report.service.ts`, `lib/som-report.ts` and `scheduler.service.ts` (`getDailyReport`): **0-line diff**.
- The Q1 fix is verified: `today.attendanceRate` = attended ÷ confirmed (0 when confirmed = 0) (`som-contract.ts:198`); pinned + a mutation.
- K1 = people (the owner, as built).

## 🔁 TEST-109 N1 (Tanya, 10-19): October `recentFirstTrial` 6 (API) vs 4 (hers); the extra two are Aileen and ส้ม
- **From the code** (`som-contract.ts:220-235`): a trial moves out only for a COURSE whose `created_at` (Bangkok date) is **on or after the trial date** and ≤ the month end.
  - Aileen (trial 25/9) and ส้ม (trial 9/9) are still counted ⇒ the course(s) they hold carry a `created_at` **before** their trial date.
  - Tanya's stand-in (the first history event: 2/10 and 11/9) is later than the real `created_at`, so her count moved them out.
  - Likely causes: the course was sold before the trial was booked, or it is an import (`created_at` = the import time).
- **So the API follows its rule; the RULE is the gap.** A child who already holds a course is a course customer, and her sheet / the meeting say a trial child who has a course leaves the trial box (*"ต่อคอร์สแล้วย้ายออก"*).
- **Fix (my default, CHECK §4, declared):** a trial moves out when the child has bought **any** course with `created_at` ≤ the month end, **whatever the order** (the "on/after the trial" lower bound goes).
  - The same for `trialNotConverted` / 742's "no course" rules, so the cards stay consistent. Check them and list.
- **Pins:**
  - by value: a course bought BEFORE the trial ⇒ moves out; one bought after the month end ⇒ stays;
  - a mutation: the lower bound back (bites).
- A mirror pin that follows only from this edit = I grant it; list it.

### TEST-109 N1 fix (Bob, 2026-10-19)
**Done.** A trial moves out when the child has bought **ANY course with a Bangkok purchase day ≤ the month end (as-of day), whatever the order with the trial** — the "on/after the trial" lower bound is gone (`boughtByAsOf`, `lib/som-contract.ts`; a voucher still does not, Q2.2; a course bought after the month end still does not move a past month's trial). **Consistent in 742:** `trialNotConverted` ("1st Trial, no course") uses the same rule (any course ≤ the month end); the other 742 rules (New / Renew / not renewed) do not use the trial↔course order for "no course", so nothing else moved. Pins: 741 trial test now says before/same-day/after all move out (S6 = a course BEFORE the trial ⇒ out; count 3 → 2), the Total test (S1 holds a course bought before his trial ⇒ out; 3 → 2); 742's trialNotConverted test (S6 out; a course bought after the month end converts nobody). Sets: **741 40/40** (M20 re-aimed to "the lower bound back", +M40 "a course after the month end moves it out") and **742 47/47** (N20/N21 re-anchored, +N47 "the lower bound back").

**Silver, 2026-10-19 — ✅ TEST-109 fix verified.** **My re-run (SAFE):** **4935 / 0** · tsc 0 · sets **741 40/40 · 742 47/47 · 743 25/25 · 737 11/11**, all `CHECKSUM identical` · the old SOM / daily code: a 0-line diff. N1 verified in the diff: `boughtByAsOf` (any course ≤ the month end, whatever the order); 742's `trialNotConverted` follows it.
