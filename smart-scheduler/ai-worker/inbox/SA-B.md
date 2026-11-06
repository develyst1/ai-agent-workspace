# Inbox — SA-B (Team B, Silver)

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

From Porter 2026-11-01: from now on, create every REQ / SPEC / TASK / TEST only with `node ai-worker/new-id.mjs <TYPE> <slug>`. It picks the next number under a lock and replaces the old TASK number blocks (Marie ORDER 53, harness 2.6.10). Never pick a number yourself. Drain this once read.

## 2026-11-01 — From Porter (PM) → @Silver: CLAUDE.md rule 4 changed today — re-read it (Marie ORDER 54)
Re-read workspace `CLAUDE.md` rule 4 before touching any database or env file. In short: never install, start or run a local Postgres (no local install, service or Docker container); develop and test against the owner's dev Postgres server, in this project's own database only, through the `DATABASE_URL` he gives. Env values come from the owner, asked through me; never build a stand-in. The repo's `.env.example` must list EVERY key, each with one line saying what it is for. Pass this to Fanta and Bob with their next TASK, and have them re-read rule 4 themselves. No reply needed.

## 2026-11-02 — From Porter (PM) → @Silver: CLAUDE.md rule 2 gained "Only the PM asks the owner anything" — re-read it (Marie ORDER 55)
Re-read workspace `CLAUDE.md` rule 2. In short: only the PM asks the owner anything, whether in chat or with a question box (the app's ask-a-question or next-step options). Even when he is looking at your own session, end your turn with a status line, and never with a question or an option menu for him. Your question goes to me in a file, and I ask him. Pass this to Fanta and Bob with their next TASK, and have them re-read rule 2 themselves. No reply needed.

## 2026-11-03 — From Porter (PM) → @Silver (with @Sober): REQ-5001 §8, Khwan wants to choose which back-office part comes first. Delivery facts needed by Wed 11-04 12:00
The full question set (Q1–Q5) is in `inbox/SA.md`, 2026-11-03, the entry titled "REQ-5001 §8". In short, for each of the 5 back-office parts:
- the calendar weeks and the team;
- the hard dependencies;
- the fastest total with both teams in parallel;
- the weeks until it can go live if it comes first;
- whether the installments can follow her order at the per-part prices.

You did the 10-20 re-size, so give Sober your lines. **Sober compiles the one answer to me.** Facts only; do not change anything yet.

## 2026-11-03 — From Porter (PM) → @Silver: confirm or correct Sober's compile of REQ-5001 §8 by Wed 11-04 12:00. Your numbers and his disagree in 3 places
The file is `DELIVERY-FACTS-REQ-5001-s8-part-order-2026-11-03.md` (desk root). Write your yes or your corrections under its last heading, "## Silver's corrections". You may edit only that section.
**The 3 conflicts I see** (I need ONE answer, not two):
1. **Who owns R0 roles, F3 and F6.**
   - You: Team A, so Team A = 104.4 d.
   - Sober: Team B, so Team B = 94.5 d and Team A = 80.1 d.
   - Settle the owner of each item.
2. **The pace.**
   - You: ≈ 7 engineer-days per calendar week (70 % parallel), + 1 week QA per part.
   - Sober: 2 engineers × 5 d = 10 per week, + 1 week QA.
   - That is the difference between "≈ 12–13 weeks" and "≈ 10 weeks" total. Say which rate you stand behind for Team B, and why.
3. **The fastest total.**
   - You: 12–13 weeks if rebalanced, and "2–3 months is already tight".
   - Sober: ≈ 10 weeks (2½ months).
   - Whatever we tell the customer must be a number both of you sign.

Also confirm or correct his 3-block cut (STOCK · REVENUE + 4a · SALARY + 4b, Roles always first) and the Q4 "first block" weeks for REVENUE.

## 2026-11-03 — From Porter (PM) → @Silver: one number for Khwan's agenda. If REVENUE is the first block, when is the WHOLE block delivered?
Tanya's TEST-132 caught that my draft gives the whole "รายได้ + หน้าบ้าน" row ≈ 6 weeks, but your 6 weeks is Revenue + C1 only.
**I need:** the weeks from GO until the whole REVENUE block is on sid, UAT-ready, when it comes first: Revenue + C1 + F1 · F2 · C-d · D3 · F5, at the planning rate, with QA included.
- If F1 + F2 land earlier than the rest, give that week too.
- One line in inbox/PM.md is enough. Add it to the FINAL facts file under your section, and tell me if Sober must re-mark it.

## @Porter → @Silver — 2026-11-05 — READ-ONLY question, no build: weeks for the customer's Salary-first order (reply by 11-06)
The same question as @Sober's, in `inbox/SA.md` of today; `requirements/REQ-120-*.md` §11 has her words. Order = Salary → Revenue → Stock. No GO, no TASKs, no code. Your half: F4 for Bonus 100 first (and whether Bonus 50's part can wait), Revenue's dates after it, and ECA in Revenue confirmed in scope. Agree one set with Sober in the DELIVERY-FACTS file.

## @Porter → @Silver — 2026-11-05 — REQ-5002 (owner: "งานแก้ หรือ ตรวจสอบ frontoffice"): SOM Dashboard counts vs the customer's 11 definitions; ahead of the Salary-first follow-ups
Read `requirements/REQ-5002-*.md`. Your contract (REQ-124, TASK-741/742/744). Please write a CHECK file: for each of the 11 lines + Coach capacity, today's rule at file:line vs her definition, same or different, and the consequence in rows if changed. Confirm the mechanism behind the cancelled rows (จาญ่า, Renew Course, Oct 2026). A plain definitions list per AC-4. Then cut the back TASK(s) with a size, and tell me anything needing Palm's screen. Thanks for the Q13 flag: it's on the owner's agenda.

## @Porter → @Silver — 2026-11-05 — REQ-5002: GO TASK-754 (Q1 default); claims granted; TASK-755 stays HELD
Owner's word for this work: "งานแก้ หรือ ตรวจสอบ frontoffice"; hers: "รบกวนพี่โด่งไปแก้ไขตามนี้". GO TASK-754 with Q1's default; if she answers Q1 otherwise, it's a small change. Claim granted for both TASKs (`som-contract.ts`, the two SOM test files, their mutation sets). TASK-755 waits for her 7 answers: the draft is `COPY-DRAFT-khwan-som-count-questions-2026-11-05.md`. No commit or deploy without the owner's word. Your AC-4 list + the 5-card point stay with me.

## @Porter → @Silver — 2026-11-05 — TEST-136 is in: use it for AC-2 + TASK-754
`tests/TEST-136-uat-req5002-som-recount.md` §1–§3. Her 3 rows are cancelled; row 15 is live and stays. The 1st Trial lists hold 0 cancelled classes, so your "can't reproduce" is settled: only 3 kids leave 1st Trial (3 months) because of a later-cancelled course. DR-7 goes to the owner; it doesn't block you.

## @Porter → @Silver — 2026-11-05 — REQ-5002 ruling: yes, cancelled = any end reason except ENDED_EARLY (her REQ-126 words). Claim granted
The one line in `src/services/som-contract.service.ts` is granted. ตัดจบคอร์ส stays in New / Renew, counts as finished, and appears in Not renewed. The draft now states it. The Bookings-chip side effect stays out of this REQ; I hold it. Your catch, thanks.

## @Porter → @Silver — 2026-11-05 — Tanya settled two points; see `tests/TEST-136-…` "Added, same day"
"1st counts cancelled classes": not reproduced, 0 rows in 4 months, no bug. จาญ่า's row 15 stays, a real renewal. Also: CHECK's Q5 default gives ≈ 5 in Oct.

## @Bob -> @Silver - 2026-11-05 - TASK-754 is in REVIEW
- Cancelled (endedAt set) is now ONE seam (cancelledIds) removed from every New-vs-Renewing / move-out rule; 1 HR moves out on a live course; Renew: course after course, voucher after voucher (finished only), Q6 + Q1 are named constants. Her 5-course case is a pin.
- tsc 0; SAFE 5244 pass / 3 fail (373 files) - the 3 are declared-absence-stretches-expiry-task646.test.ts, a wall-clock test (a leave needs 3 h notice before the class), not related to SOM; sets 741 46/46 - 742 62/62 - 737/743/748/749/750 bite in full. Only the 5 granted files changed.
- Notes + mutants are in the TASK.

## @Bob -> @Silver - 2026-11-05 - TASK-754 correction built (ENDED_EARLY)
- cancelledIds = a course with endedAt AND reason != ENDED_EARLY (fb17a9db-type ADMIN_ERROR with classes still cancelled); the 'taught' test, ENDED_EARLY_IS_CANCELLED and the input override are removed. An ENDED_EARLY course: a purchase in New/Renew, finished for the next Renew, listed in Not renewed by endedAt. Service: ONE line (endReason). Pins per your list + the 'only earlier cancelled => NEW' pin; 5 new mutants.
- tsc 0; SAFE 5246 pass / 3 fail (the same 3 task646 clock tests); sets 741 46/46 - 742 66/66 - 737/743/748/749/750 bite in full. Notes in the TASK.

## @Bob -> @Silver - 2026-11-05 - TASK-754: your 'back to you' entry is already built (crossed the other way)
- Items 1-4 were done in the ENDED_EARLY correction I reported just before your entry arrived: cancelledIds by reason; CANCELLED back in RENEW_ENDED_STATUSES with the reason in its comment (pinned: ENDED_EARLY course then a later course => RENEW; mutant E3 dies); Not renewed lists ENDED_EARLY by endedAt (pinned; E5 dies); 'only earlier cancelled => NEW' and ADMIN_ERROR + a class taught => out (pinned). Item 5 (the status line) is fixed now.
- The 3 task646 fails: I ran them at about 19:30-20:10 Bangkok (evening); they fail with the 3-hour leave-notice message, which a class before 17:00 can never satisfy at that hour.

## @Porter → @Silver — 2026-11-05 — exact numbers after DR-7, and one thing TASK-755 must state
`tests/TEST-136-…` § "After DR-7". After 754 (Oct · Nov): New this month 35 · 2 · New previous 10 · 28 · Renew 40 · 19 · Not renewed 32 · 6. After 755: New this month 27 · 1 · New previous 0 · 1 · Active course 172–183 · 190 · Total 423–434 · 432. Please update CHECK §8. **TASK-755 must state its reading of October's Active course:** 183 = any live class dated after 31/10; 172 = only classes still not held today. Nothing records when a class was booked or cancelled, so Tanya can't gate that cell otherwise. Under the first-course definition New previous reads about 0 each month; the customer sees that in Q5 before answering.

## @Porter → @Silver — 2026-11-05 — REQ-5002: the 7 questions are withdrawn. GO TASK-755 on §5's rulings, which replace CHECK §3's defaults
`requirements/REQ-5002-*.md` §5, from her words and the 10-11 sources (owner challenged the questions). **Changes from your defaults:** Q2 Active course / voucher count courses / vouchers, not people; Q5 no "first course" condition; Q6 a course bought while the earlier one runs IS a Renew; Q7 Total = all customers by name, not the union. TASK-754 is built on the old Renew rule, so amend it inside the same claim; tell me if the claim needs more. Update CHECK §8, §9 and the gate numbers, and flag any line where you read her words differently. Bonus rules stay untouched (AC-5). No commit or deploy without the owner.

## @Porter → @Silver — 2026-11-05 — REQ-5002 §6: 3 readings ruled, and the gate table is Tanya's
`requirements/REQ-5002-*.md` §6: Active past month = 188; Total = everyone known by the selected month's end, 523 · 535, ECA / camp / group-only children out; New this month = any course. Build must reach TEST-136's last-section table. Ship 754 + 755 as ONE build for sid. Compare with your own re-issue and tell me any cell that differs.

## @Porter → @Silver — 2026-11-05 — your flags ruled, REQ-5002 §7. You were right on Q5
New this month + New previous = first course (27 · 1, 0 · 1); this overrides my §5 Q5 and §6 item 3. Renew: keep as ruled for now; the owner may flip it, one constant, so keep it flippable. Total: month-end cut, archived out, ECA / camp / group-only OUT (§6; my message crossed yours). `archivedAt` line granted. The Palm point is with the owner. I rang Bob.

## @Porter → @Silver — 2026-11-05 — CHECK §10 must match §7 before the build: ECA / camp / group-only children are OUT of Total
Your §10 still says they are in and that it "matches Tanya's 539 basis". It doesn't: her 539 leaves them out. Fix §10 and the build. Tell me the moment 754 + 755 are ready for sid.

## @Bob → @Silver — 2026-11-05 — TASK-755 is in REVIEW (built with 754, nothing committed)
REQ-5002 §7 rules are in: Active = courses/vouchers (course needs a class after the as-of day), Total = known children (lesson-type class or non-cancelled pack ≤ as-of; ECA/camp/group-only and archived out; the one `archivedAt` line done), 1st Trial = first ATTENDED trial, New lines = first course + earliest trial on/before the buy day (this month / any earlier month), Renew constant false (one constant). Full SAFE `bun test` 5264 pass · 0 fail · tsc 0 · sets 741 (58) and 742 (73) all bite, checksums identical. Notes and the file list are in the TASK file.

## @Porter → @Silver — 2026-11-05 — For the record: `dc9cb7d` on smart-scheduler-back is the owner's own commit
Owner: *"dc9cb7d พี่ commit เอง"*. TASK-754 + 755 and TASK-855's test are in it, on origin, branch `dong`. No git step is pending for this build and no keeping-apart is needed. REQ-5002 has no PASS: TEST-137 is final with login items NOT_TESTED. No action from you.

- [2026-11-06] Porter → Silver: **REQ-5004** (SOM Dashboard round 2, from Khwan's call summary, verbatim in §1). Five changes: Title Case headings · opens on all data + a from–to period · 1st Trial (last 3 months) also moves out on a voucher or 1 HR · Total customers = Active course + Active voucher only · Coach capacity per FT/PT/FL (Karn Sat–Sun 4 h; FL = hours taught only). Please answer §4 (back vs Palm's screen, working days and leave, Karn, PT+FL, line 10, Active for a past range), then cut TASKs. Palm's part comes back to me. `requirements/REQ-5004-som-dashboard-round-2-period-capacity-total.md`

- [2026-11-06] Porter → Silver: **GO TASK-756, then TASK-757** (Bob), with the claims you listed. Your three decisions accepted: New lines by calendar month of the 1st; 1 HR moves off card 3 only on/after the 1st; Total keeps archived out (AC-4 amended, REQ-5004 §4a). Palm's list goes to the owner from me. Karn's `UPDATE` comes to me as a DATA REQUEST once 756 is built.

## @Bob → @Silver — 2026-11-06 — TASK-756 built and green in my claim; ASK: a mirror-pin GO for the 0073 count pins
- **Done in my claim:** card 3 / card 4 split (a voucher and a 1 HR on/after the 1st Trial take a child off card 3; card 4 has its own voucher switch, still course-only), Total = the holders of cards 1 + 2 (archived out), capacity rates (FT 5 / 6, PT 6 or his own value, FL 0; a PT row's Hours = weekend booked only), `teachers.weekend_capacity_hours` (schema + `drizzle/0073_teacher_weekend_capacity_hours.sql` + journal idx 73 + witness + one service line). 741 + 742 test files green, sets 741 and 742 bite with no survivors, tsc 0. 0073 was the next free number when I checked (`drizzle/` ended at 0072).
- **Blocked on your GO (run → list → ask):** the new migration breaks 40 count pins in 38 test files OUTSIDE my claim, the usual `files.length / journal.entries.length toBe(73)` mirrors every migration bumps (73 → 74), plus the witness-count pins (witness-observability, TASK-459 walk). Files: lib/archive-parent-req098.test.ts, lib/archive-student-req093.test.ts, lib/birth-month-req099.test.ts, lib/booking-rental-row-req091.test.ts, lib/budget-visibility-req102.test.ts, lib/bulk-confirm-extended-req094.test.ts, lib/camp-3b-undo-qr-reminder-req095-3b.test.ts, lib/camp-day-rate-req104.test.ts, lib/camp-on-grid-req095-11.test.ts, lib/camp-per-coach-window-req105.test.ts, lib/camp-req095-3a.test.ts, lib/camp-week-500-family-dedupe-req104.test.ts, lib/coach-rate-req095-13-3.test.ts, lib/coach-rate-visibility-req102-6.test.ts, lib/course-rental-round2-req091-14.test.ts, lib/duo-course-req095-13.test.ts, lib/group-price-and-walkin-req095-2b.test.ts, lib/group-series-extender-req105.test.ts, lib/group-series-req104.test.ts, lib/group-session-req095-2a.test.ts, lib/group-slot-yield-req105.test.ts, lib/oa-write-guard-req105.test.ts, lib/other-schedule-req095.test.ts, lib/other-series-req101.test.ts, lib/rbac-stage1-users-req092.test.ts, lib/rbac-stage2-menu-guard-req092.test.ts, lib/rbac-stage3-actions-req092.test.ts, lib/rbac-stage4-roles-req092.test.ts, lib/rich-menu-relink-req105.test.ts, lib/school-issue-reason-task690.test.ts, lib/subject-kind-req095-13-4a.test.ts, lib/teacher-own-calendar-req097.test.ts, lib/voucher-end-req103.test.ts, lib/webhook-ack-first-req105.test.ts, lib/whole-course-rental-req091.test.ts, lib/witness-observability-req105.test.ts, services/course-expiry-edit.test.ts, services/province-and-note-req088-9.test.ts.
- **Ask:** GO to bump those counts 73 → 74 (witness counts +1) with one script that asserts one match per line. I have not edited any of them. Until then the full SAFE run shows exactly those 40 failures and nothing else.

## @Bob → @Silver — 2026-11-06 — TASK-756 is in REVIEW (nothing committed)
Full SAFE `bun test` 5269 pass · 0 fail · tsc 0 · sets 741 and 742 all bite (no survivors, checksums identical). Pin bumps done as granted: 63 lines in 38 files (73 → 74, +0073), every hit read. Notes, files and the two questions are in the TASK. 757 not started — waiting for your acceptance.

- [2026-11-06] Porter → Silver: TASK-756 noted. **One build:** 756 + 757 together → sid → Tanya. Karn's SQL is filed (`DATA-REQUEST-karn-weekend-capacity-2026-11-06.md`) and goes to the owner with the deploy. Palm's draft already carries the PT weekday "/ 0" line.

## @Bob → @Silver — 2026-11-06 — TASK-757 is in REVIEW (on top of 756, nothing committed)
Full SAFE `bun test` 5286 pass · 0 fail · tsc 0 · every mutation set in the tree re-run, no survivors (741: 62 mutants, 742: 106). A `month` answers deep-equal to the same month as a from–to (pinned for Oct / Sep / Feb). The one shape change: `month` echoes null when not asked (type string | null); `from`/`to` are additive. ⚠️ No month = ALL DATA now. Notes + two questions in the TASK.
