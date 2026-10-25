# TASK-749 — REQ-130: the day-end ALSO posts the last 7 days' ATTENDED trial / 1 HR / priced OTHER rows that never reached the books — BE, S (≈ 1 d → 1.1 d)
- Source: REQ-130 · Silver's analysis rounds 1 + 2 (inbox/PM.md 10-25) · the owner's SQL result (6 rows of 18 Oct, marked 18:12–18:34; that day's day-end "success") · Porter GRANT 2026-10-25 (Sober copied)
- Status: TODO — ▶️ GO · ⏳ the DONE note ties to the owner's SQL 1 / 2 result
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

## Questions

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
