# TASK-962: FE, the «เปลี่ยนกิจกรรม» dialog (course panel + 1 HR / Trial booking), in smart-scheduler-front. @Fanta, starts after TASK-942
**From @Silver, 2026-11-13.**
- **REQ / SPEC:** REQ-5014 · **SPEC-106 § 2 (contract), § 5 (words), § 7 (screen).**
- **Repo:** smart-scheduler-front (SF), branch `dong`.
- **Git:** none.
- **Size:** ≈ 1.5–2 d.
- **Order:** after TASK-942. Build against the contract with a mocked API, then run for real once Bob's TASK-961 is on your local SB.

## Do first, now, before TASK-942 is finished (Porter, 2026-11-13: owner rule, «.env.example ครบ» before he is asked for values)
- In SF `.env.example`, add `NEXT_PUBLIC_BACKOFFICE_URL=` with one comment line: «the back-office web address (no trailing slash); the change-activity confirm screen links to its Add Manually form; empty = no link». This is the only edit in this step.
- Write «env line added» plus the `git diff .env.example` output in Notes, and tell me in inbox/SA-B.md. The rest of this TASK still waits for TASK-942.

## Closed file list (list every file you touched in Notes)
- SF `.env.example`: the one line above.
- The course panel where «เปลี่ยนครู/เวลา» (TASK-838) lives: add the action beside it.
- The booking panel for `SINGLE_SESSION` / `FIRST_TRIAL`: the same action.
- **One new dialog component**, modelled on the change-teacher-time dialog: the same coach picker, preview debounce and error-mapping pattern.
- The API client and types for the 4 routes in SPEC § 2.
- The i18n file for any new Thai strings (list them all in Notes).
- Tests next to the dialog.

## Behaviour (SPEC § 7)
- **When the action shows:**
  - **Hidden:** on an ended or paused course, and on a course with a group class. The server refuses all three anyway (`COURSE_ENDED` / `COURSE_PAUSED` / `GROUP_COURSE`).
  - **1 HR / Trial:** shown only while the booking is live, not after attendance.
- **The dialog's fields:**
  - **Activity:** a Select of active subjects that have a price group, without the current one. The list comes from `GET /api/sellable-packages` (`subjects` per package, plus `unpricedSubjects` to leave out).
  - **Coach:** optional.
  - **Typed price:** only when the preview returns `newPriceMinor: null`, in whole baht, 1–100,000. Never shown for 1 HR / Trial.
- **Preview** (debounced, on every change):
  - «เปลี่ยน {remaining} คาบ ตั้งแต่ {firstDate}»;
  - old → new price, with «ราคาพิมพ์เอง» when typed;
  - **ส่วนต่าง {difference} ฿**, or «0 ฿ · ไม่มีการคืนเงิน» when cheaper;
  - «คาบที่เรียนไปแล้วไม่เปลี่ยน».
- **Confirm:** a toast and a refetch of the course and calendar. When `differenceMinor > 0`, the success state says «บันทึกส่วนต่าง {x} ฿ ที่ Add Manually (หลังบ้าน) เหตุผล "ส่วนต่างเปลี่ยนกิจกรรม"».
  - **Deep link: YES** (Sector, SPEC-107 § 3, 2026-11-13). Render a link «เปิด Add Manually» to `${NEXT_PUBLIC_BACKOFFICE_URL}/revenue/manual?courseId=<id>&amountMinor=<differenceMinor>&reason=activity-change`. Use those exact parameter names; ids and the amount only, no personal data.
    - `NEXT_PUBLIC_BACKOFFICE_URL` is a **new key**. Add it to `.env.example` with one line on what it is for. The owner gives the value, through Porter.
    - **Unset ⇒ no link, and the text above stays.** Test both cases.
    - The back-office side (TASK-964, Team C) ships later. Until then the link opens a form that ignores the parameters. That is harmless, and it is why the text stays next to the link.
  - **1 HR booking:** no `courseId`, so no link (SPEC-107 takes a course only). Show the text only.
- **Errors:** every code in SPEC § 2.1 / § 2.2 maps to a Thai message, as the change-teacher-time dialog does. An unknown code shows the server's message.
- **375 px:** one field per row, Cancel / Confirm at the bottom right.

## Done =
- SF typecheck and lint, using the commands your last SF TASK used (paste them) → 0.
- Tests: the price input shows only on `null`; the preview text, including the 0 / no-refund case; each error code's message; the 1 HR / Trial dialog has no price input.
- **A local run against Bob's SB** (once TASK-961 is in): change one course and see the calendar's remaining classes on the new activity. Screenshots: the dialog with a preview, the typed-price case, and 375 px.
- The list of new Thai strings in Notes. Porter checks the wording with ขวัญ.

## Questions
_(—)_

## Implementation Notes
**«env line added» (Porter's do-first step, 2026-11-13).** The only edit in `smart-scheduler-front/.env.example`; `git diff .env.example`:
```
@@ -14,3 +14,5 @@ AUTH_URL=https://som.develyst.online/api
 NEXT_PUBLIC_LIFF_ID=
+# TASK-962 (REQ-5014) — the back-office web address (no trailing slash); the change-activity confirm screen links to its Add Manually form; empty = no link
+NEXT_PUBLIC_BACKOFFICE_URL=
```
The dialog does not read this variable yet. The success state is text only, because I have no query-string contract for Add Manually. When Sector's form takes one, tell me and I add the link.

**Fanta, 2026-11-13. SF, branch `dong`, no git. Built against SPEC-106 § 2 with the mocked API; the real run waits for Bob's TASK-961.**

**Files touched (SF):**
- NEW `src/components/partials/Bookings/ChangeActivityDialog.tsx`: the one dialog. Course and 1 HR / Trial share it through a `target` prop.
- NEW `src/components/partials/Bookings/change-activity-task962.dom.test.tsx`: 29 tests.
- `src/components/partials/Bookings/PlanModal.tsx`: the «เปลี่ยนกิจกรรม» button beside «เปลี่ยนครู / เวลา ทั้งคอร์ส», plus the mount.
  - It sits inside the existing writable-only block, so an ended or paused course never shows it.
  - It is hidden when any plan row has `bookingType === "GROUP"`.
- `src/components/partials/Calendar/Modal/BookingModal.tsx`: a ⋯ menu item for a live `SINGLE_SESSION` / `FIRST_TRIAL`, plus the mount outside the Menu.
  - It reuses `canMove`, so a row that has been attended has no door.
- `src/services/scheduler.service.ts`: the 4 routes of SPEC § 2.
- `src/services/scheduler.mock.service.ts`: offline stand-ins.
- `src/hooks/scheduler/useScheduler.ts`: `usePreviewChangeActivity` and `useChangeActivity`, each taking `target: "course" | "booking"`.
- `src/types/api/contract.ts`: `ChangeActivityInput` and `ChangeActivityAnswer`.
- `src/lib/i18n/dictionaries.ts`: a new `changeActivity` block, EN and TH.
- **Outside the closed list (disclosed):** `src/lib/ui/masked-input-assert.test.ts`. It is the repo's sweep of tests that type into a `NumberInput`, and it fails until the new test file is added to its expected list. I added one line and a comment.

**Behaviour as built:**
- **Activity list:** the union of subjects over every package of `GET /sellable-packages`, minus `unpricedSubjects`, minus the current one. The current one is matched by id on a course and by name on a booking, because `Booking` carries the subject name only.
- **Coach:** optional, same picker as change-teacher-time. `teacherId` is sent only when it differs from the current coach.
- **Preview:** debounced 300 ms on every change. A late answer to an old input never replaces the current one. Confirm waits for an answer to the current inputs.
- **Typed price:**
  - It appears only after a preview returns `newPriceMinor: null`, and only on a course.
  - It is a whole number from 1 to 100,000.
  - An invalid value shows the range sentence, keeps Confirm off, and is never sent.
  - It stays mounted while the next preview is in flight.
- **Difference:** shown as «ส่วนต่าง {n} ฿», or «0 ฿ · ไม่มีการคืนเงิน» when it is 0. It is not drawn while the server says `null`.
- **Success:** a toast, and the hook re-reads everything. When `differenceMinor > 0` the dialog stays on a «บันทึกส่วนต่าง {x} ฿ ที่ Add Manually (หลังบ้าน) เหตุผล "ส่วนต่างเปลี่ยนกิจกรรม"» screen as text, with no deep link, until Sector says his form takes one.
- **Errors:** all 12 codes of SPEC § 2.1 and § 2.2 have a Thai sentence. `SLOT_TAKEN` appends the server's message, which names the date. An unknown code shows the server's message.

**Decisions I made that Silver may want to change:**
1. **Group-course hiding.** `PlanSession` has no `groupId`, so the button hides when any plan row has `bookingType === "GROUP"`. A group course that this does not catch is refused by the server with `GROUP_COURSE`, which the dialog shows. If SB's plan rows can carry a group flag, I will read that instead.
2. **Booking panel key.** I reused `action:calendar.booking-edit`, through `canMove`. SPEC § 2.2 does not name the key the booking route requires. If it is another one, it is a one-line change.
3. **Trial.** A Trial returns difference 0 (SPEC § 2.2), so it shows «0 ฿ · ไม่มีการคืนเงิน» as the SPEC says.

**New Thai strings (for Porter to check with ขวัญ).** Namespace `changeActivity`:
- title «เปลี่ยนกิจกรรม»; activity «กิจกรรม»; pickActivity «เลือกกิจกรรม»; noActivities «ไม่มีกิจกรรมอื่นที่มีกลุ่มราคา»
- coach «ครู (ไม่บังคับ)»; keepCoach «ใช้ครูเดิม»
- manualPrice «ราคาคอร์ส (บาท)»; manualPriceHint «กิจกรรมนี้ไม่มีราคาในตารางสำหรับจำนวนคาบของคอร์สนี้ กรุณาพิมพ์ราคาเต็มของคอร์ส เป็นจำนวนเต็มบาท (1 – 100,000)»
- previewLine «เปลี่ยน {remaining} คาบ ตั้งแต่ {firstDate}»; priceLine «{old} ฿ → {new} ฿»; typedTag «ราคาพิมพ์เอง»
- difference «ส่วนต่าง {difference} ฿»; noRefund «0 ฿ · ไม่มีการคืนเงิน»; attendedKept «คาบที่เรียนไปแล้วไม่เปลี่ยน»
- done «เปลี่ยนกิจกรรมแล้ว»; recordDifference «บันทึกส่วนต่าง {x} ฿ ที่ Add Manually (หลังบ้าน) เหตุผล "ส่วนต่างเปลี่ยนกิจกรรม"»
- err:
  - SAME_ACTIVITY «นี่เป็นกิจกรรมเดิมของคอร์สอยู่แล้ว»
  - MANUAL_PRICE_NOT_ALLOWED «กิจกรรมนี้มีราคาในตารางอยู่แล้ว ไม่ต้องพิมพ์ราคาเอง»
  - MANUAL_PRICE_REQUIRED «กิจกรรมนี้ไม่มีราคาในตาราง กรุณาพิมพ์ราคา»
  - MANUAL_PRICE_RANGE «ราคาต้องเป็นจำนวนเต็มบาท ตั้งแต่ 1 ถึง 100,000»
  - NO_REMAINING_CLASSES «ไม่มีคาบที่เหลือให้เปลี่ยน»
  - COURSE_ENDED «คอร์สนี้จบแล้ว เปลี่ยนกิจกรรมไม่ได้»
  - COURSE_PAUSED «คอร์สนี้ถูกพักอยู่ เปลี่ยนกิจกรรมไม่ได้»
  - GROUP_COURSE «คอร์สที่มีคลาสกลุ่ม เปลี่ยนกิจกรรมไม่ได้»
  - SLOT_TAKEN «ครูที่เลือกมีคิวอื่นซ้อนอยู่ในคาบที่ต้องย้าย: {detail}»
  - NOT_SINGLE_OR_TRIAL «เปลี่ยนกิจกรรมแบบนี้ได้เฉพาะคาบ 1 ชม. หรือคาบทดลอง»
  - ALREADY_DELIVERED «คาบนี้เรียนไปแล้ว เปลี่ยนกิจกรรมไม่ได้»
  - NO_PRICE_GROUP «กิจกรรมนี้ยังไม่มีกลุ่มราคา»

**Evidence:**
- **Typecheck:** `npx tsc --noEmit -p .` → 0.
- **Tests:** `bun test` over all of SF → **1523 pass / 0 fail** (161 files). The new file has 29 tests:
  - the activity list;
  - the preview text, including the 0 / no-refund case, and TH;
  - the confirm waiting for the server's answer;
  - the price input absent on a card price, present only on `null`, and the typed price carried into the re-preview and the act;
  - the range rule;
  - the booking dialog never showing a price input;
  - each of the 12 codes (TH), an unknown code, a refusal on the preview, and EN/TH parity.
- **Mutants:** current activity not excluded → 2 tests fail. Unknown code mapped to the generic message → 1 fails. Typed price shown for every subject → the confirm test fails. Booking allowed to need a price → the test run died, so it was caught, but I did not get a per-test line.
- **Lint:** `npm run lint` is broken in this repo (`next lint` no longer exists in Next 16, and there is no eslint config), so there is no lint result.

**Not done:**
- Screenshots (dialog with a preview, typed price, 375 px) and the local run against Bob's SB. Both wait for TASK-961. Until then the dialog has only run against the test doubles.
- `next build`: another chat's dev server holds `.next` in that folder, so I did not run a build over it.

## Review
_(Silver)_
### Review 1 — @Silver, 2026-11-13: built against the contract ✅, ONE rework item, then the real run with Bob
- **Re-run by me:** SF `npx tsc --noEmit -p .` **0**. `bun test change-activity-task962.dom.test.tsx` **29 / 0**. The `.env.example` line is in.
- **🔁 Rework: the deep link.** The contract exists: **Sector, SPEC-107 § 3** (2026-11-13). My § Behaviour bullet for it was written into this TASK before you started. You read an older copy. Build it:
  - link «เปิด Add Manually» → `${NEXT_PUBLIC_BACKOFFICE_URL}/revenue/manual?courseId=<id>&amountMinor=<differenceMinor>&reason=activity-change`, with exactly those parameter names;
  - **only on a course** with `differenceMinor > 0` **and** the variable set;
  - **unset ⇒ no link**, and the text stays in both cases;
  - 1 HR: text only;
  - tests for set / unset / 1 HR.
- **Your 3 decisions:**
  1. **Group hiding by `bookingType === "GROUP"` on the plan rows:** accepted. The server's `GROUP_COURSE` is the backstop, and you map it.
  2. **Booking door key `action:calendar.booking-edit` (via `canMove`):** accepted. I'm telling Bob that the booking route uses the same key, so the door and the guard agree.
  3. **Trial shows «0 ฿ · ไม่มีการคืนเงิน»:** accepted, as SPEC § 2.2 says.
- **The out-of-list edit** (`masked-input-assert.test.ts`, one line in the sweep's expected list): accepted. It is that sweep's own mechanism.
- **Thai strings:** the list above goes to Porter for ขวัญ.
- **Still to do:** after the rework, the local run against Bob's TASK-961, with screenshots (preview, typed price, 375 px). Then my final review.
### Amendment — 3 more server codes (Bob, TASK-961 Notes; accepted by Silver 2026-11-13). Map each to Thai, with one test
- `OLD_PRICE_NOT_ON_CARD` (409): the course's current activity has no card price for its size, so the difference can't be worked out.
- `NOT_LIVE_BOOKING` (409): the 1 HR / Trial is cancelled, on leave or paused.
- `GROUP_COURSE` on a 1 HR (409): you already map it.
- The exact wording is in SB `types/contract.ts`'s comment.

### Review 2 — @Silver, 2026-11-13: the deep-link rework ✅
- `ChangeActivityDialog.tsx` l.169–170: the base comes from `NEXT_PUBLIC_BACKOFFICE_URL` with any trailing slash stripped. The link is drawn only for `target === "course"` with an id and a base. Its parameters are exactly SPEC-107 § 3's (`courseId`, `amountMinor` in satang, `reason=activity-change`).
- **Re-run by me:** this file → **32 / 0**, including set, unset and 1 HR. She reports SF 1526 / 0.
- New key `changeActivity.openAddManually` joins the Thai list for Porter.
- **Left:** the local run against Bob's TASK-961, with screenshots, then my final review. D-155-1's SF part (TASK-942) comes before that.
### Review 3 — @Silver, 2026-11-13: amendment ✅ · the local run is replaced by sid + Tanya
- The 2 new codes are mapped, plus `COURSE_DROPPED` (SB's contract comment says a paused course is refused with that code, and that is correct). There are 15 codes now, with EN/TH parity pinned. She reports 82 / 0.
- **Blocked local run, accepted:** a signed-in SF needs a password login, which no agent does. So the real check is sid + Tanya (the deploy ask is in REQUEST-silver-to-porter-2026-11-13-deploy-ask-…). Screenshots come from Tanya's run.
- **TASK-962: DONE** as built and reviewed. Tanya's verdict is still to come.

## Fix D-157-1 + D-157-2 (Tanya, TEST-157, sid) — @Fanta — @Silver, 2026-11-13. SF only; the server side is green
**Files:** `ChangeActivityDialog.tsx`, `PlanModal.tsx`, and their tests. No SB change.
- **D-157-1 (High), the typed price loops the preview.** Tanya saw 37 calls in 20 s, alternating `{subjectId}` and `{subjectId, manualPriceBaht}`, with Confirm never on. Find the cause, then write it in Notes before the fix (systematic-debugging). The contract it must meet:
  - Once typed, the price **stays in every following request** for that activity, until the activity changes or the field is cleared.
  - **One preview per input change.** An answer never triggers a new request by itself: no effect may depend on the answer's `newPriceMinor`, or else gate it.
  - Confirm turns on when the latest answer belongs to the current inputs, including the typed price.
  - **Tests** (the current ones passed against the loop, so they are not enough):
    - type a price, wait past the debounce, and assert **exactly 1** extra preview call, carrying `manualPriceBaht`;
    - the answer shows «4,790 ฿ → 5,500 ฿ · ราคาพิมพ์เอง · ส่วนต่าง 533 ฿»;
    - Confirm turns on;
    - **a mutant that drops the price from the next request fails.**
- **D-157-2 (Medium), the old activity is treated as current after a change.** `PlanModal.tsx` l.237–238 (`courseSlot`) is the **first** non-extra row, often an attended one, so it is the wrong source for "current activity".
  - **[SA-decided] Read it from the remaining rows,** the same set the server changes (SPEC-106 § 1): the first non-extra row with a live status dated today or later. If there is none, use the last non-extra row.
  - The dialog header and the list filter both read this one value. `courseSlot` stays as it is for everything else (the TASK-288 slot rule).
  - **Tests:**
    - a plan with an attended FREESKATE row plus later ONEWHEEL rows gives a header of ONEWHEEL, FREESKATE offered and ONEWHEEL left out;
    - a plan with no change gives today's result.
- **Observation:** EN "Change 1 classes": use the plural form (`{remaining, plural, …}` or two keys). TH is unchanged. The words go to Porter's list.
- **Done =**
  - SF `npx tsc --noEmit -p .` 0;
  - SF `bun test` 0 fail;
  - the new tests above, with the mutant result pasted;
  - report in inbox/SA-B.md.

  Then I review, it goes with the joint gate and «ขึ้น git», and Tanya re-runs TEST-157 cases 3 and 5.

### Notes — Fix D-157-1 + D-157-2 (Fanta, 2026-11-13)
**D-157-1, cause (written before the fix; reproduced first).**
- `needsPriceFor` (which shows the typed-price field) was set from every ANSWER: `a.newPriceMinor === null ? subjectId : null`.
- `sendBaht` (the price in the request) depends on `needsPriceFor`, and `key` (the effect's trigger) depends on `sendBaht`.
- The real server echoes a typed price back as a non-null `newPriceMinor`. So the answer to the priced request cleared `needsPriceFor`, which dropped the price from `key`, which fired a price-less request.
- That request answered `null` again, which set `needsPriceFor` again, which put the price back into `key`, and the cycle repeated: one request per cycle, alternating `{subjectId}` and `{subjectId, manualPriceBaht}`, as Tanya saw.
- My old test passed because its server stub kept `newPriceMinor: null` even for a typed price. It was a stub that was never the real server.
- **Fix:** an answer can only turn the field ON, from a price-less request. It never turns it off. Only changing the activity clears it. So the price stays in every later request for that activity.
- **Reproduction (before the fix):** the new test saw 5 preview calls where it expected 2.

**D-157-2.** New exported pure `currentActivityOf(sessions, today)` in `ChangeActivityDialog.tsx`: the first non-extra row with a live status dated today or later, else the last non-extra row. `PlanModal` now feeds the dialog's `current` and `program` from it. `courseSlot` is untouched for everything else.

**Plural.** New key `changeActivity.previewLineOne` («Change {remaining} class from {firstDate}»). The TH text is the same as `previewLine`. For Porter: one new EN string only.

**Evidence:**
- SF `npx tsc --noEmit -p .` → 0.
- `change-activity-task962.dom.test.tsx` → 41 / 0.
- **D-157-1 test:** the stub answers from the request like the real server. After typing 5500 it asserts exactly 2 preview calls in total, 1.2 s past the debounce, and the second carries `manualPriceBaht: 5500`. It asserts the field stays, shows «4,790 ฿ → 5,500 ฿ · typed price · Difference 533 ฿», and that Confirm is on.
- **Mutant:** dropping the price from the request (`sendBaht` always `undefined`) → the D-157-1 test **fails** (2 expected, 1 received).
- **D-157-2 tests:**
  - An attended old-activity row followed by later rows on a new one gives the new one.
  - A plan with no change gives today's result.
  - With nothing remaining, the last row is used, and extras never decide.
  - The dialog fed that value shows the new activity in the header, offers the old one, and leaves the new one out.
- Full SF `bun test`: 1581 pass / **2 fail, neither mine**:
  - `leaveDayIndex` in `lib/scheduler` (a TASK-622 test).
  - The TASK-596 sweep, which flags `Calendar/leave-window-cells-task966.dom.test.tsx` l.95–96. That file is not mine.
  - Both sit in the files Team C's in-flight work holds, and my files do not appear in either failure.
### Review — Fix D-157-1 + D-157-2 — @Silver, 2026-11-13: ✅ ACCEPTED
- **Re-run by me:** SF `npx tsc --noEmit -p .` **0**. The dialog file passes **41 / 0**. The full SF `bun test` is **1582 pass / 1 fail**. The one failure is the TASK-596 sweep flagging `Calendar/leave-window-cells-task966.dom.test.tsx`, which is untracked and **Team C's in-progress TASK-966** (Flash), not ours. The `leaveDayIndex` failure she saw did not recur in my run.
- **D-157-1:**
  - **The cause, as she wrote it in Notes:** the answer drove `needsPriceFor`, which drove the price in the request, and the price-less answer was null again: a loop.
  - **The fix:** l.145 only ever turns the field **on**, after a price-less answer. It is turned off only on open (l.124) or by an activity change (l.239).
  - **The test:** exactly 2 calls after typing, the 2nd carrying 5500, the text «4,790 → 5,500 · ราคาพิมพ์เอง · 533 ฿», Confirm on. The drop-the-price mutant fails.
- **D-157-2:** `currentActivityOf` (l.41–48) returns the first non-extra row dated today or later that isn't attended / cancelled / leave / no-show, else the last course row. PlanModal l.243 feeds it to the header and the filter. **Nit, not blocking:** PAUSED and PENDING_RESCHEDULE count as "remaining" here, but a paused course is refused anyway (`COURSE_DROPPED`).
- **EN plural:** `previewLineOne`; TH unchanged.
- **Security review:** none (UI only).
- **Next:** the joint gate, then «ขึ้น git», deploy, and Tanya re-runs TEST-157 cases 3 and 5. **The gate needs Team C to fix the 596 sweep hit in their 966 test.**
