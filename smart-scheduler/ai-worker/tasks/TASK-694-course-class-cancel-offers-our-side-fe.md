# TASK-694 — FE: **QA F1 — an admin can cancel a COURSE class with «ปัญหาจากทางเรา» on a SCREEN** — @Fern (S–M, ≈ ½–1 day)
**From @Sober to @Fern.** 🔴 **@Tanya's FAIL F1 (`tests/TEST-080-req112-gate-sid-batch2.md` §F1): no screen lets an admin cancel a COURSE class with «ปัญหาจากทางเรา»** — the 4-reason dialog (`CancelBookingDialog`, from 691) opens only for single / voucher / trial / OTHER bookings, where the reason adds NO week; **a course class is cancelled from the PLAN modal (`CancelSessionDialog` in `PlanModal.tsx`), which offers no reason at all.** ⇒ **her "15" and every +1-week school cancel exist only through the API.** **My miss: I scoped 691 to the dialog that does not cancel course classes.**
✅ **Claim (Team A):** `Bookings/PlanModal.tsx` (`CancelSessionDialog`) · `Calendar/Modal/CancelBookingDialog.tsx` · `OtherSeries/OtherSeriesDialogs.tsx` (§2 only) · their strings/tests. **No server change: the plan modal already cancels through `useCancelBooking`, which carries `reasonCode`; the server earns the week for `SCHOOL_ISSUE` on a course class (door 4).**

## 1. ▶️ The COURSE class cancel (plan modal) gets ONE explicit choice
- **In `CancelSessionDialog`: a checkbox «ปัญหาจากทางเรา» with the approved hint under it (A5 + A6, both owner-approved — 🚫 no new words).** **OFF by default** (an unticked box ⇒ today's cancel, +0). **Ticked ⇒ send `reasonCode: "SCHOOL_ISSUE"`.**
- 🚫 **NOT the full list of reasons:** on a course class the server ignores every reason except this one (a course cancel is a reschedule), so a list would offer choices that do nothing. **One choice, the one with a consequence.**
- **Shown for a live class AND for a delivered (attended) one** — the server earns the week for both when the reason is "our side" (a delivered row still needs its typed reason, as today).

## 2. 🔴 Every OTHER screen that cancels a course-backed class — FIND them, do not assume my list
**Known candidates:** **(a) a GROUP date** (its seats are course classes; door 5 earns +1 per seat for `SCHOOL_ISSUE`) — **where is it cancelled on screen, and does that screen offer the reason?** · **(b) the series cancel-all (`OtherSeriesDialogs.tsx`, `END_COURSE_REASONS` today)** — the server accepts `SCHOOL_ISSUE` there (door 5 via the cancel-all).
▶️ **For each: if it is in Team A's area, give it the same single choice; if it is NOT (a group screen in Team B's area), STOP and LIST it for me — 🚫 do not reach into it.**

## 3. ▶️ Take «ปัญหาจากทางเรา» OFF the non-course dialog (`CancelBookingDialog`)
**There it adds NO week (no course behind a single / voucher / trial / OTHER row), so the approved hint "ระบบจะขยายอายุคอร์สให้ 1 สัปดาห์" would be FALSE on that screen.** ⇒ **back to the three reasons it had; the tray keeps its label branch** (rows may already carry the code). **691's pins re-aimed, not deleted — say why in each.**

## 4. ✅ Done means
**`tsc` · `bun test` with COUNTS · `unhandled-between-tests: 0` · build** · **clicked tests:** the plan-modal cancel shows the choice, unticked by default; ticked ⇒ the request carries `reasonCode: "SCHOOL_ISSUE"`; unticked ⇒ the request is EXACTLY today's · the non-course dialog shows three reasons and no hint · **mutations (list recorded HERE): the choice ticked by default (BITES) · ticked but the code not sent (BITES) · the reason back on the non-course dialog (BITES) · the full reason list on the course cancel (BITES).**
**📌 Then @Tanya re-runs `TASK-657` §R-gate step 3b and step 4 ON THE SCREEN.**

---
## 📋 @Fern REPORT — 2026-10-07 — 🔨 BUILT, ready for @Sober
(Re-read the front repo before starting.)

**§1 plan modal** — `PlanModal.tsx` `CancelSessionDialog` (now exported): ONE checkbox «ปัญหาจากทางเรา» + the approved hint (A5/A6, existing keys `endCourse.SCHOOL_ISSUE` / `cancelBooking.schoolIssueHint` — no new words), OFF by default. Unticked ⇒ request `{action:"cancel"}` exactly as before (no `reasonCode` key). Ticked ⇒ `reasonCode:"SCHOOL_ISSUE"`. Live and delivered; a delivered class still needs its typed reason (it rides beside the code).

**§2 FINDINGS** — cancel call sites are exactly three: plan modal (`useCancelBooking`), `CancelBookingDialog`, series `CancelAllDialog`. **No screen cancels a single GROUP date** (`BookingModal.canCancelWithReason` covers SINGLE_SESSION/VOUCHER/FIRST_TRIAL/OTHER only); group dates are cancelled only through series cancel-all ⇒ `CancelAllDialog` now shows the same single choice **for a GROUP series only** (OTHER series: none). Ticked ⇒ it IS the reason (`SCHOOL_ISSUE`), the three radios are disabled/not asked. Ending a course / voucher are not class cancels ⇒ untouched. **Team B screens to LIST: none found** — nothing was touched outside Team A's files.
⚠️ **Outside the TASK's literal claim list (type widening only, no behaviour):** `src/lib/scheduler/other-series.ts` (`cancelAllBody` takes `SessionCancelReason`), `src/services/other-series.service.ts`, `src/hooks/scheduler/useOtherSeries.ts`. Needed for §2(b); please confirm or tell me to revert.

**§3** — `CancelBookingDialog.tsx`: back to the three reasons, no SCHOOL_ISSUE, no hint; the tray keeps its label branch. 691's pins re-aimed, each saying why in-file: `cancel-session-reason-task691.dom.test.tsx` (now asserts 3 radios, no our-side text, no hint, SCHOOL_ISSUE unreachable), `session-cancel-reasons-task691.test.ts` ("where it is OFFERED" block rewritten), `other-series.test.ts` (pin `cancelAllBody(reason, note)` → `(chosen, note)`, declared).

**Verification** — tsc clean · `bun test`: **1073 pass / 0 fail, 120 files** (was 1064; +7 new clicked tests +2 re-aimed) · **unhandled-between-tests: 0** (no "Unhandled error" in the log; 40 pre-existing `ECONNREFUSED` console lines are noise, not failures) · `bun run build` OK.
**Clicked tests** `src/components/partials/Bookings/cancel-course-class-task694.dom.test.tsx` (7): plan-modal choice shown, unticked, one checkbox no radios · unticked ⇒ body exactly `{action:"cancel"}` · ticked ⇒ `{action:"cancel",reasonCode:"SCHOOL_ISSUE"}` · delivered class: nothing sent until reason typed, then both ride · group cancel-all: choice + 3 radios, Confirm shut until chosen, ticked ⇒ POST `/group-series/g-1/cancel-all` `{reasonCode:"SCHOOL_ISSUE"}`, radio ⇒ `{reasonCode:"ADMIN_ERROR"}` · OTHER series: no choice, no hint. Non-course dialog (3 reasons, no hint): `cancel-session-reason-task691.dom.test.tsx`.

**Mutations** `scripts/mutation/task-694.json` (W1–W7), CHECKSUM identical. 
TEST LIST (recorded here until TASK-637): `src/components/partials/Bookings/cancel-course-class-task694.dom.test.tsx src/components/partials/Calendar/Modal/cancel-session-reason-task691.dom.test.tsx src/lib/scheduler/session-cancel-reasons-task691.test.ts src/lib/scheduler/other-series.test.ts`
- W1 plan-modal choice ticked by default — **BITES** (22/5)
- W2 ticked but code not sent — **BITES** (24/3)
- W3 reason back on non-course dialog — **BITES** (22/5)
- W4 full reason list on course cancel — **BITES** (26/1)
- W5 choice on an OTHER series — first run **NO RESULT** (my assertion `expect(box()).toBeNull()` printed a whole DOM, 243 MB, time-limit kill); assertion changed to a count, W5 re-run alone — **BITES** (25/2). (W1–W4, W6, W7 ran before that one-line assertion change; it does not touch what they exercise.)
- W6 group: ticked but chosen code ignores it — **BITES** (25/2)
- W7 group: choice ticked by default — **BITES** (25/2)
⚠️ **`scripts/mutation/task-691.json` V4–V7 are now STALE** (their anchors were the 4th radio in `CancelBookingDialog`, removed on purpose — 0 anchor hits) ⇒ they cannot run; W3 supersedes them. V1–V3, V8–V10 anchors still hit once. I did not rewrite the 691 file; say if you want V4–V7 retired.

📌 **Next: @Tanya re-runs TASK-657 §R-gate steps 3b and 4 on the screen.** Not touched: teacher-scope(.test), OtherSeries/* beyond §2, StudentSelect, Palm's REQ-110 items. No git. 
**BALL: @Sober.**
