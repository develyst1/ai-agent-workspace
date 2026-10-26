# TASK-749 — REQ-130: the day-end ALSO posts the last 7 days' ATTENDED trial / 1 HR / priced OTHER rows that never reached the books — BE, S (≈ 1 d → 1.1 d)
- Source: REQ-130 · Silver's analysis rounds 1 + 2 (inbox/PM.md 10-25) · the owner's SQL result (6 rows of 18 Oct, marked 18:12–18:34; that day's day-end "success") · Porter GRANT 2026-10-25 (Sober copied)
- Status: ✅ DONE again 2026-10-25 — the double-post fix reviewed (5182/0, set 27/27); NOT committed (the fix is on top of `304212d`); awaits the owner's ขึ้น git + the sid deploy
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-25)
- **Claim (granted):** `src/services/jobs.service.ts`: the day-end POSTING part only (Team A's file; Sober is copied) + a NEW Team B test + mutation set. 🔴 run → list → ask before any other line. 🔴 SAFE command (the repo `.env` points at the customer's system). Nothing committed: git only on the owner's word.

## Why
- The day-end posts only rows dated `runDate` (`jobs.service.ts:181-187`).
- A trial / 1 HR marked attended after that day's run (an early run with no 23:30 run after it, a missed run, or a late check-in) is **never posted**. The digest's "Sales not posted" counts it.

## Build
1. **After today's posting, sweep `runDate − 7 … runDate − 1`:** for every **ATTENDED** FIRST_TRIAL / SINGLE_SESSION / priced OTHER row there, run **the SAME per-booking posting path** that today's rows use (the same item / price resolution, discount handling, `postOtherBookingSale` and the generation-aware `rev:<id>[#n]` key).
   - 🔴 **Do NOT filter by "has any SALE movement".** A booking that was undone (rev-undo) and attended AGAIN has SALE movements but needs its next generation posted. Let the idempotency keys decide; a filter is only an optimisation if it is generation-aware.
2. **The sweep only POSTS.** It never auto-marks older days: the auto-attend block stays on `runDate` alone.
3. **The count goes into the job summary** (e.g. `summary.sweptPosted`), so `job_runs` shows it. The window is ONE named constant (7, the same as the digest's `NOT_POSTED_WINDOW_DAYS`; reuse it).
4. Best-effort as today: a failing post never fails the job.

## Definition of Done
- [ ] **By value:**
  - a trial dated yesterday, marked ATTENDED after yesterday's run ⇒ posted by today's run, **once**; a second run the same day posts nothing more;
  - a row 8 days old ⇒ not swept;
  - an attendance undone (CONFIRMED again) ⇒ not posted;
  - undone then attended again ⇒ its next generation posted once;
  - a priced OTHER ⇒ posted through `postOtherBookingSale`; an unpriced OTHER ⇒ nothing;
  - the auto-attend of older days ⇒ unchanged (none).
- [ ] **Mutation set:** the window ignored (only runDate) · a filter by "any SALE movement" (bites on the re-attend case) · auto-attend applied to swept days · a double post.
- [ ] tsc · full suite (SAFE) · every existing set still bites · the old `getDailyReport` has a 0-line diff.

## Implementation Notes
**Evidence (Bob, 2026-10-25):** new test `src/lib/day-end-sweep-task749.test.ts` **24 pass** · new set `day-end-sweep-task749.mutations.json` **20/20 BITES, CHECKSUM identical** · tsc 0 · full SAFE **5168 pass / 0 fail (369 files)** after the 4 granted mirror pins were re-pointed (below). Nothing committed.

**Files:** NEW `src/lib/day-end-sweep.ts` (no service imports — Silver's condition; imports `lib/attention`, `lib/time`, drizzle, the schema) · `src/services/jobs.service.ts`: ONE import line + the day-end blocks only · the deploy doc `DEPLOY-scheduled-tasks-windows.md` (the end-of-day time rows 23:30 → 17:30 with the pointer, and the `schtasks /st` line; nothing else) · the 3 granted pins (one line each) · NEW test + set.

**What the job does now:**
1. **Auto-attend (widened, the owner's rule: «กวาด … ควรกวาดจากเวลาเริ่ม»):** `.where(and(inArray(bookings.date, sweepDates(runDate)), eq(bookings.status, "CONFIRMED"), startedSql(now), notUndoneAttendance()))` — every day of `runDate − 7 … runDate`, **CONFIRMED only** (never EXTENDED / PENDING), the START gate **per row** (`date < today OR (date = today AND start_time <= now)`: a past date ⇒ all, today ⇒ started only, a future date ⇒ none), an undone check-in kept out. The same loop (quota +1, one `notifyCourseDeduction`); a cut row becomes ATTENDED so a second run finds nothing; camp unchanged. I kept the `eq(bookings.status, "CONFIRMED")` literal INLINE in the job so six other pins keep holding; the old local `ended` const is gone (its rule is `startedSql`).
2. **Posting sweep (after the auto-attend, so a late cut posts in the same run):** `.where(postingWhere(runDate))` — ATTENDED trial / 1 HR / OTHER over the same 8 dates, through the SAME loop (price / discount resolution, `postOtherBookingSale`, `revGeneration` + `revKey`); **no «any SALE movement» filter** (the loop has exactly its two old `continue`s — pinned). `revenuePosted` stays today's; older rows count in **`summary.sweptPosted`**. Best-effort as before (no new throw).
3. **ONE window constant** `SWEEP_WINDOW_DAYS = NOT_POSTED_WINDOW_DAYS` (7, the digest's).
**The 18:20 pin (by value):** a trial marked ATTENDED on day D after D's 17:30 run is in D+1's window, selected by its `postingWhere`, counted as swept, and its key is the same on the run after ⇒ posted once.
**DoD by value:** 8 days old ⇒ not in the window (both sweeps); undone (CONFIRMED again) ⇒ not selected by the posting (status = ATTENDED only) and kept out of the auto-attend; EXTENDED / PENDING ⇒ not selected; today's not-yet-started ⇒ untouched (`hasStarted` + the rendered SQL); re-attend ⇒ its next generation key (`rev:<id>#1`) — the key decides.
**Honest limit:** `runEndOfDayJob` has no runtime seam (a database), so — like every test of this file before — the window / selection / start gate are pinned BY VALUE (the real `postingWhere` and `startedSql` rendered to SQL by the real dialect) and the job's wiring BY SOURCE; the per-booking money path is the existing one and is not re-implemented.

## Questions
**4 mirror pins in other teams' tests, red only because the text they read moved — asking GO (nothing touched):**
1. `src/lib/bulk-confirm-extended-req094.test.ts:65` — the frozen auto-attend `.where(...)` literal → the new literal above.
2. `src/services/booking-undo-req108.test.ts:324` — the same literal.
3. `src/services/day-end-auto-attend.test.ts:59-63` — the TASK-396 gate pin slices `const ended =` out of the job; the gate is now `startedSql` in `lib/day-end-sweep.ts`: repoint those ~5 lines (start-based, no endTime, `date < today or (date = today and start_time <= now)`).
4. `src/services/booking-pause.test.ts:242` — the line right after the granted :241: `eq(bookings.status, "ATTENDED")` now lives in `day-end-sweep.ts` (`postingWhere`).
Still to do by the owner (the TASK's DONE note): tie the result to the owner's SQL 1 / 2.

## Review

## 🔁 Porter, 2026-10-25: 17:30 STAYS (the owner's ruling of 2026-09-16, SYSTEM-FACTS.md l.75-81). My 23:30 step is RETRACTED
- **TASK-749 IS the fix.** Its window `runDate − 7 … runDate` means **the next day's 17:30 run posts yesterday's late marks** (anything staff mark after 17:30).
- 🔴 **Pin it by value:** a trial marked at 18:20 on day D (after D's 17:30 run) is posted by D+1's 17:30 run, once.
- **Also, one doc line (granted with 749):** in the code repo's `DEPLOY-scheduled-tasks-windows.md`, the end-of-day time **23:30 → 17:30**, with a pointer *"owner's ruling 2026-09-16 (customer request); the day-end sweep (TASK-749) posts later marks the next day"*. Only the time rows / the `schtasks /st` line; nothing else in the doc.
- "Effect (2)" (classes after 17:30 never auto-marked) is **void**: `TIME_SLOTS` ends at 17:00.

## ⚠️ WIDENED 2026-10-25 (the owner's rule via Porter, inbox/SA-B): the AUTO-ATTEND is start-based over the same 7-day window. Size +0.5 d ⇒ S ≈ 1.6 d
- Owner, verbatim: *"กวาด เช็คอิน เนี่ย ควรกวาดจากเวลาเริ่ม มันเคยเกิดขึ้นแล้ว ตอนที่เปลี่ยน เวลาเป็น 17:30 แรกๆ"*
- 🔁 **This REPLACES Build step 2** ("the sweep only POSTS; auto-attend stays on runDate") and the DoD line "the auto-attend of older days ⇒ unchanged (none)", and the mutation "auto-attend applied to swept days".
- **Build:** the auto-attend select (`jobs.service.ts:84`) takes `date` in `runDate − SWEEP_WINDOW_DAYS … runDate` instead of `date = runDate`, with:
  - `status = CONFIRMED` only (🚫 never EXTENDED: REQ-094 §4; PENDING untouched);
  - START passed: a date before today ⇒ all; today ⇒ `start_time <= now`; a future date ⇒ none;
  - `notUndoneAttendance()` kept (TASK-492).
  - The same loop (quota +1, `notifyCourseDeduction`); the posting sweep runs after it, so a late auto-attend posts in the same run. Camp: no change (`cutCampDays` is already `date <= runDate`).
- **DoD by value (add):** created / confirmed after day D's run, start passed ⇒ auto-attended by D+1's run **once** (one quota cut, one deduction message), a second run that day ⇒ nothing · 8 days old ⇒ untouched · EXTENDED / PENDING in the window ⇒ untouched · undone ⇒ not re-attended · today's not-yet-started ⇒ untouched.
- **Mutation set (add):** the window ignored for auto-attend · EXTENDED let in · the undo guard dropped · the today start gate dropped.
- The deduction message already prints the class date (`line-message.ts` `course_deduction`, TASK-344): no text change.
- Claim unchanged (the day-end block of `jobs.service.ts`, Sober copied). Git only on the owner's word.

### Final (Bob, 2026-10-25) — the 4 mirror pins re-pointed (GO: Porter, Sober copied) + the comment fix
**Evidence:** full SAFE **5168 pass / 0 fail (369 files)** · tsc 0 · sets **749 20/20 · 737 11/11 · 743 25/25 · 748 9/9 · 741 45/45 · 742 47/47**, every CHECKSUM identical · `getDailyReport`, `som-report.service.ts`, `lib/som-report.ts`: 0-line diff.
**Re-pointed, nothing loosened (each to where its text now lives):**
- `src/lib/bulk-confirm-extended-req094.test.ts:65` — the frozen auto-attend literal → `.where(and(inArray(bookings.date, sweepDates(runDate)), eq(bookings.status, "CONFIRMED"), startedSql(now), notUndoneAttendance()));` (CONFIRMED-only, no status list, no EXTENDED — its sibling assertions are untouched).
- `src/services/booking-undo-req108.test.ts:324` — the same literal in the `due` select (the undo guard still pinned there).
- `src/services/day-end-auto-attend.test.ts:59-63` — the TASK-396 gate now reads `startedSql` in `lib/day-end-sweep.ts`: `start_time <= now`, no endTime, `date < today or (date = today and …)` with no clause admitting a later date (past ⇒ all, future ⇒ none), and the job calls `startedSql(now)`. The `auto-cut.ts` mirror assertions below it are unchanged.
- `src/services/booking-pause.test.ts:242` — `eq(bookings.status, "ATTENDED")` now read from `lib/day-end-sweep.ts` (`postingWhere`); with :241 (granted earlier) AC-17 still pins ATTENDED + the 3 types.
**Named file list for this round:** NEW `src/lib/day-end-sweep.ts`, `day-end-sweep-task749.test.ts`, `day-end-sweep-task749.mutations.json` · `src/services/jobs.service.ts` (1 import + the day-end blocks + the comment fix) · `DEPLOY-scheduled-tasks-windows.md` · pins: `group-session-req095-2a.test.ts`, `booking-pause.test.ts` (:241, :242), `other-booking-money.test.ts`, `bulk-confirm-extended-req094.test.ts`, `booking-undo-req108.test.ts`, `day-end-auto-attend.test.ts`.

## ✅ Review — Silver, 2026-10-25 (widened build + 7 granted pins)
- **Re-run myself (SAFE):** full suite **5168 pass / 0 fail** (369 files) · tsc 0 · the 749 set **20 / 20 bite**, checksum identical.
- **The 7 pins (Porter GO ×2) are re-pointed, not loosened:** CONFIRMED-only + no EXTENDED (REQ-094), `notUndoneAttendance()` in `due` (TASK-492), start-based with no clause admitting a later date (TASK-396), ATTENDED + the 3 types (AC-17), no GROUP.
- **The code:** the auto-attend takes `sweepDates(runDate)` + CONFIRMED + `startedSql(now)` + the undo guard; the posting takes `postingWhere(runDate)` through the same loop; `sweptPosted` in the summary. The deploy doc says 17:30. The stale `autoAttendWhere` comment is fixed.
- **Git:** the 11 files are already in commit **`304212d`** (18:53, author `dev`, on `dong`, in sync with `origin/dong`). **I did not make it**, and no "ขึ้น git" order reached me. It holds exactly 749's named files.

## 🔴 REOPENED 2026-10-25 — TEST-123 (sid): the day-end POSTS THE SAME SALE AGAIN on every run
**Evidence (Tanya, `tests/TEST-122-123-sid-blocked-data-request.md`):** two runs of `end-of-day {"date":"2026-10-25"}` (19:12, 19:15). Run 2: `autoAttended 0` (right) but `sweptPosted 4` again, and each of the 4 now has 2 `rev:` sales.

**Cause (confirmed from code, Silver):**
- `revGeneration(id)` (`lib/sale-post.ts:363`) = the COUNT of the `rev:` sales the booking already has = the NEXT generation.
- The posting loop keys every post with `revKey(b.id, await revGeneration(b.id))` (`jobs.service.ts:223` trial / 1 HR, `:278` OTHER). So the key is always NEW, and the duplicate check never fires: **every run posts every selected row again.**
- 📌 **This predates 749** (TASK-258, `a1b06ff`, 2026-09-06). Before 749 a run selected only `runDate`'s rows, so ONE run a day posted once, and only a RE-RUN of a date doubled it. The 7-day sweep makes every daily run a re-run of the 7 days before ⇒ each row is posted up to 8 times.
- ⇒ "a re-run of the day-end is idempotent / safe" (SYSTEM-FACTS l.275; my own REQ-130 messages) has been **false since 2026-09-06** for trial / 1 HR / priced OTHER.

**Fix (Bob):**
1. **One helper in `lib/sale-post.ts`:** `liveRevenue(bookingId)`, true when the booking's revenue is currently in the books.
   - The rule: the count of `rev:<id>` / `rev:<id>#n` sales > the count of `rev-undo:<id>` / `rev-undo:<id>#n` reversals, both read from `bo.movement` with the same key shapes as `revGeneration`.
   - Undone ⇒ a reversal exists ⇒ equal counts ⇒ not live ⇒ the next generation posts: the re-attend case (TASK-258 AC-8) still works.
2. **Both day-end paths skip a live row before posting:** the trial / 1 HR loop and `postOtherBookingSale`, at the top of its body.
   - A skipped row counts in neither `revenuePosted` nor `sweptPosted`.
   - The generation for a real post stays `revGeneration(id)`.
3. **Nothing else changes:** the auto-attend, the window and the reversal stay as they are.

**DoD, by value (a fake ledger: a stub of the `bo.movement` reads; NOT a pure key test):**
- run the job twice on the same rows ⇒ ONE sale per booking; run 2 has `sweptPosted 0` + `revenuePosted 0`;
- 8 runs on 8 consecutive days ⇒ still ONE sale;
- posted → undone (reversal) → attended again ⇒ exactly 2 sales + 1 reversal, and a third run adds nothing;
- an OTHER booking, the same three cases;
- the 18:20 case still posts once on D+1.

**Mutation set (add):**
- the live check removed;
- the live check reads only `rev:` sales (ignores reversals) ⇒ the re-attend case bites;
- the check on only one of the two paths.

**Also:**
- tsc;
- the full SAFE suite at 0 fail;
- every set still bites.
- Named files only (`lib/sale-post.ts` is shared; Sober to be copied).
- **Git only on the owner's word.**

**Why the 749 tests missed it:** they pinned "the same key for the same booking AND the same generation" (a pure function), and never fed run 1's post back into run 2's generation. The suite has no DB, and the "double post" mutant was a text edit. That is a gap in my DoD as well: "posted once" was written as a key property, not by value across two runs.

### REOPENED FIX (Bob, 2026-10-25, TEST-123) — built; ONE mirror pin asked
**Evidence:** full SAFE **5181 pass / 1 fail** — the 1 is a mirror pin in another team's test (below), NOT touched · tsc 0 · NEW test `src/lib/day-end-double-post-task749.test.ts` **13 pass** (a STATEFUL FAKE LEDGER: it keeps run 1's writes, and the REAL `liveRevenue` / `revGeneration` / `recordSale` / `postBookingSale` and the two real posting paths run against it) · the 749 set is now **27/27 BITES** (+L1–L8; S4/S5/S6 re-aimed to the new loop; its `tests` field runs both 749 test files) · sets 737 11/11 · 743 25/25 · 748 9/9 · 741 45/45 · 742 47/47, all CHECKSUM identical · `getDailyReport` and the old SOM files 0-line diff. Nothing committed.

**Why my first tests missed it (my gap, owned):** "posted once" was written as a KEY property (same booking + same generation ⇒ same key) — a pure function — and never fed run 1's post back into run 2. The double post lived in the orchestration (every run asked `revGeneration`, the NEXT generation, and got a fresh key). The new test is the one the DoD asked for: a ledger that remembers, run twice.

**The fix:**
- `lib/sale-post.ts`: NEW `isRevenueLive(keys)` (pure: `rev:` sales > `rev-undo:` reversals, both key families incl. `#n`) and `liveRevenue(bookingId)` (one read of the four key shapes of that booking, then the pure rule). Undone ⇒ equal counts ⇒ not live ⇒ the re-attend posts its NEXT generation (TASK-258 AC-8 intact).
- `jobs.service.ts` (the two posting paths only): the trial / 1 HR body is now the exported `postTrialOrSingleSale(b)`, with `if (await liveRevenue(b.id)) return false;` as its FIRST line (before the price lookup and before any generation is read); `postOtherBookingSale` (now exported) skips a live row right AFTER its uncharged guard (an uncharged booking still touches no ledger — pinned, `ledgerReads === 0`). The loop is one line: `const posted = b.bookingType === "OTHER" ? await postOtherBookingSale(b) : await postTrialOrSingleSale(b);`. A skipped row counts in neither `revenuePosted` nor `sweptPosted`. Nothing else moved: the auto-attend, the window, the reversal.
**By value (all against the ledger fake):** run twice ⇒ ONE sale and run 2 posts 0 · 8 runs over 8 days ⇒ one (`rev:<id>`, generation 0) · posted → undone → attended again ⇒ exactly 2 sales + 1 reversal (`rev:<id>`, `rev:<id>#1`), then three more runs add nothing · the same three for a priced OTHER · each booking judged on its own ledger rows · the 18:20 case on D+1 once, D+2 nothing.
**Mutants (new):** L1 live check removed (trial path) · L2 removed from the OTHER path only · L3 reversals ignored (the re-attend case bites) · L4 never-posted counts as live · L5 the read forgets the reversal keys · L6 a skipped row reported as posted · L7 an uncharged OTHER reads the ledger · L8 `rev-undo:` counted as a sale.

**ASK — 1 mirror pin (other team's test), red only because the loop's text moved into `postTrialOrSingleSale`:** `src/services/other-booking-money.test.ts:157-165` ("the อื่นๆ branch is a `continue` at the TOP of the loop — the old path below is untouched"): repoint it to the new shape, same intent — (a) the loop dispatches OTHER first: `b.bookingType === "OTHER" ? await postOtherBookingSale(b) : await postTrialOrSingleSale(b)`; (b) the trial / 1 HR post is the same call with the generation on BOTH keys (`idempotencyKey: revKey(b.id, generation)`, `discountKey: discountKey(b.id, generation)`), read from the `postTrialOrSingleSale` body. Nothing loosened.
**Named files:** `src/lib/sale-post.ts` (shared — Sober to be copied) · `src/services/jobs.service.ts` · NEW `src/lib/day-end-double-post-task749.test.ts` · `src/lib/day-end-sweep-task749.test.ts` (3 wiring pins re-written for the new shape) · `src/lib/day-end-sweep-task749.mutations.json` · (pending GO) `src/services/other-booking-money.test.ts`.

### Final (Bob, 2026-10-25) — the last mirror pin re-pointed (GO: Porter, Sober copied)
`src/services/other-booking-money.test.ts:157-165` now reads the new shape: the loop dispatches OTHER first (`b.bookingType === "OTHER" ? await postOtherBookingSale(b) : await postTrialOrSingleSale(b)`), the loop itself contains no `resolvePriceGroup` (OTHER is dispatched before any price resolution, which lives only in the trial / 1 HR body), and BOTH `revKey(b.id, generation)` and `discountKey(b.id, generation)` are read from the `postTrialOrSingleSale` body. Nothing loosened, nothing else in the file.
**Evidence:** full SAFE **5182 pass / 0 fail (370 files)** · tsc 0 · sets **749 27/27 · 737 11/11 · 743 25/25 · 748 9/9 · 741 45/45 · 742 47/47**, every CHECKSUM identical · `getDailyReport`, `som-report.service.ts`, `lib/som-report.ts`: 0-line diff.
**Final named files for the reopened fix:** `src/lib/sale-post.ts` (shared) · `src/services/jobs.service.ts` · NEW `src/lib/day-end-double-post-task749.test.ts` · `src/lib/day-end-sweep-task749.test.ts` · `src/lib/day-end-sweep-task749.mutations.json` · `src/services/other-booking-money.test.ts` (the pin).

## ✅ Review of the double-post fix — Silver, 2026-10-25
- **Re-run myself (SAFE):** **5182 pass / 0 fail** (370 files) · tsc 0 · the 749 set **27 / 27 bite**, checksum identical.
- **The fix:** `liveRevenue` (`rev:` sales > `rev-undo:` reversals) is checked first in `postTrialOrSingleSale`, and in `postOtherBookingSale` right after its uncharged guard. A skipped row counts in neither counter.
- **The proof:** `day-end-double-post-task749.test.ts` uses a stateful fake ledger that keeps run 1's writes, with the real paths.
  - run twice ⇒ one sale; 8 days ⇒ one;
  - undo → re-attend ⇒ 2 sales + 1 reversal, then stable;
  - the same for OTHER.
- **The pin:** `other-booking-money.test.ts:157-165` (Porter GO) is re-pointed, not loosened.
- **Named files (not committed):**
  - `src/lib/sale-post.ts` (shared);
  - `src/services/jobs.service.ts`;
  - NEW `src/lib/day-end-double-post-task749.test.ts`;
  - `src/lib/day-end-sweep-task749.test.ts`;
  - `src/lib/day-end-sweep-task749.mutations.json`;
  - `src/services/other-booking-money.test.ts`.
