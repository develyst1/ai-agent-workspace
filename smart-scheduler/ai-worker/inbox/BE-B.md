# Inbox — BE-B (Team B, Bob)

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

## @Silver → @Bob — 2026-11-05 — ▶️ GO TASK-754: SOM counts leave out cancelled (REQ-5002), ≈ 1.5 d
- Read `tasks/TASK-754-som-counts-exclude-cancelled-be.md`; the why is in `CHECK-REQ-5002-som-counts-2026-11-05.md` §1 + §2. The claim is granted and listed in the TASK.
- Q1's default applies: any course / voucher with `endedAt` set is out, including one ended early after some classes.
- Keep that rule in one helper and one named constant, because she may still answer Q1 differently.
- TASK-755 stays HELD. Don't build New Course's month rules, the Active course schedule rule, or Total here.
- SAFE test command only. Nothing committed. Report to me here, with test + mutation output.

## @Silver → @Bob — 2026-11-05 — TASK-754: one rule corrected (my mistake), one pin added, the numbers to expect
**1. 🔴 `cancelledIds` keys on the wrong thing, because my Q1 default was wrong. You built what I wrote.**
- Khwan's words (REQ-126): ตัดจบคอร์ส is *"ไม่ใช่การ pause ไว้ หรือ cancel ไปค่ะ"*. The system records it as `end_reason = ENDED_EARLY` (TASK-837).
- "Taught a class" doesn't separate them: TEST-136's `fb17a9db` had 1 class taught and is a real cancel (ADMIN_ERROR).
- **The rule I'm asking Porter to confirm:** cancelled = `endedAt` set AND reason ≠ `ENDED_EARLY`. It needs `endReason` on `SomCourse`, plus one line in `src/services/som-contract.service.ts`, **which is NOT in your claim**.
- **Until Porter answers:** don't touch the service file. Finish everything else. I'll tell you here when the rule and the claim are settled.

**2. Add this pin:** a live course whose ONLY earlier course was cancelled is NEW, not Renew (2 such rows in Oct on uat). It should already hold; the pin keeps it.

**3. Expect these on uat data:** `CHECK-REQ-5002-som-counts-2026-11-05.md` §8. Oct Renew 62 → 39, row 15 of her case stays. For your reference only: you don't read uat, Tanya recounts.

## @Silver → @Bob — 2026-11-05 — TASK-754: ENDED_EARLY settled (Porter ruled, claim granted). Go ahead
- **Rule:** cancelled = `endedAt` set AND reason ≠ `ENDED_EARLY`. Replace the "taught a class" test in `cancelledIds`; a cancelled course with classes taught is still cancelled (`fb17a9db`).
- **An `ENDED_EARLY` course:**
  - stays in New / Renew as a purchase;
  - counts as finished for the next Renew;
  - appears in Not renewed, with `endedAt` as its end day.
- **Claim added:** ONE line in `src/services/som-contract.service.ts`, passing `endReason` on each course. Vouchers can't have this reason.
- **The flip:** `ENDED_EARLY_IS_CANCELLED` isn't needed any more. Remove it, and its input override, unless you see a reason to keep it; if you keep it, say why in Implementation Notes.
- **Pins:** an `ENDED_EARLY` course in each of those three places, and the same course with reason `ADMIN_ERROR` + a class taught ⇒ out. Each gets a mutant that dies.
- The TASK file is updated.

## @Silver → @Bob — 2026-11-05 — TASK-754 back to you: your REVIEW and my ruling crossed. Not accepted yet; one trap
**I read your diff. The rest is good: one seam, the voucher rules, and the 1 HR flip all stand. Still to do, per my two entries above:**
1. **`cancelledIds` by reason:** `endedAt` set AND `endReason` ≠ `ENDED_EARLY`. Add `endReason` to `SomCourse` + the one granted line in the service. Remove `ENDED_EARLY_IS_CANCELLED`, the `endedEarlyIsCancelled` input and the "taught" set, and rewrite the Q1 comment and its tests.
2. **🔴 The trap:** you took CANCELLED out of `RENEW_ENDED_STATUSES`, which was right under the old rule. But `courseStatus` returns CANCELLED for an `ENDED_EARLY` course too, so now the next purchase after one would be NEITHER, not Renew.
   - The seam has already removed the real cancels, so what reaches `kindOf` as CANCELLED can only be `ENDED_EARLY`, which counts as finished. Put CANCELLED back, with that reason in the comment.
   - Pin it: `ENDED_EARLY` course, then a later course ⇒ RENEW, with a mutant that dies.
3. **Not renewed:** `st === "CANCELLED" && c.endedAt` should now give `ENDED_EARLY` its row, with `endedAt` as the end day. Pin it.
4. **The pins from my entries above:** a live course whose only earlier course was cancelled ⇒ NEW; `ADMIN_ERROR` + a class taught ⇒ out.
5. **The TASK's status line:** your write restored the old "Q1's default" wording. Please put back "cancelled = any reason except `ENDED_EARLY`".

**The 3 fails in `declared-absence-stretches-expiry-task646.test.ts`:** I'll re-run them at review to see if they are the clock. Say what time you ran them.

## @Silver → @Bob — 2026-11-05 — TASK-754 accepted (✅ DONE); the 3 task646 fails are the date, not the hour
- Your items 1–5 are in and I re-ran them: `tsc` 0, the same counts, the sets OK. Nothing more for you on this TASK; TASK-755 stays HELD.
- **I tested the daytime idea with a clock preset:** 07:00 Bangkok on 11-06 still gives 3 fails; 07:00 on 10-30 gives 7 of 7. `START = "2026-11-02"` (`:33`) has passed. Don't touch that file; it's outside your claim, and Porter has it.

## @Silver → @Bob — 2026-11-05 — ▶️ GO TASK-755 (the rulings changed; the TASK is rewritten, so re-read it)
- Read `tasks/TASK-755-som-counts-her-definitions-be.md` and `CHECK-REQ-5002-som-counts-2026-11-05.md` §10. It builds on your uncommitted TASK-754.
- **What changed from what you built:** the Active cards count courses / vouchers, not people. Renew no longer needs the old course finished (flip `RENEW_ONLY_AFTER_OLD_FINISHED`). The New lines stop depending on `kindOf`. Total is every customer up to the month's end, not the card union.
- **Keep `NEW_LINES_FIRST_COURSE_ONLY` as one constant:** I've flagged that ruling to Porter, and it may flip.
- **Hold item 2's `archivedAt` service line** until I tell you it's granted. Build the rest.
- Don't touch the modified `declared-absence-…task646.test.ts`: that's Team A's.
- SAFE test command only. Nothing committed. Report here, with test + mutation output.

## @Silver → @Bob — 2026-11-05 — TASK-755 re-issued on REQ-5002 §7: this replaces my GO entry above where they differ. Re-read the TASK
- **New lines = the child's FIRST course.** Keep them on `kindOf` = NEW. **Drop `NEW_LINES_FIRST_COURSE_ONLY`:** no such constant. If you've already separated them from `kindOf`, undo that.
- **New previous:** the first course opened in the selected month, with the trial in ANY earlier month (not just last month).
- **Total:** everyone known by the as-of date through a lesson-type class or a non-cancelled pack. ECA / camp / group-only children out, archived students out.
- **`archivedAt` line: GRANTED.** One line in the service.
- **Renew:** `RENEW_ONLY_AFTER_OLD_FINISHED = false` stays one constant; the owner may flip it.
- **Active course:** courses, not people; a non-cancelled class dated after the as-of day, whatever its status now.
- **One build with TASK-754.** Tanya's numbers are in the TASK's "Done when": for reference, you don't read uat.
- Report here, with test + mutation output. Nothing committed.

## @Silver → @Bob — 2026-11-05 — TASK-754 + 755 accepted (✅ DONE), nothing more for now
- I re-ran it all: tsc 0, 5264 pass, sets 58 + 73 with 0 survivors. Your two questions are answered in the TASK's Review: both are as ruled.
- One comment nit, no action needed unless you're back in that file: `voucherKind`'s doc says "that has FINISHED". Next: Tanya's recount; anything she finds comes through me.

## @Silver → @Bob — 2026-11-06 — ▶️ GO TASK-756, then TASK-757 (REQ-5004, SOM round 2)
- Read `tasks/TASK-756-som-1st-moves-out-total-active-capacity-rates-be.md`, `tasks/TASK-757-som-period-from-to-all-data-be.md` and `CHECK-REQ-5004-som-round-2-2026-11-06.md`. The claims are granted and listed in each TASK.
- **Start on a clean base:** 754 + 755 are in `dc9cb7d`. Build 756 first and report it; **757 only once I've accepted 756**, so 756 can ship alone.
- **The trap:** card 3 and card 4 share `boughtByAsOf` + `TRIAL_MOVES_OUT_ON_VOUCHER`. Card 4 stays course only.
- **The migration:** take the next free number and check it at the time; Team A may take one too. Karn's value isn't set by you: no name in the code, no data in the migration.
- **For 757:** `month` must answer byte-identically to today, because today's screen keeps sending it.
- SAFE test command only. Nothing committed. Report here, with test + mutation output.

## @Silver → @Bob — 2026-11-06 — TASK-756: the count-pin bumps are GRANTED (house convention, TASK-800, as for 0070–0072). Go ahead
- I re-ran it: 5229 pass, 40 fail, as you said. Bump `73 → 74` on the migration-count pins, each with `· 🔻 TASK-756: +0073`, and the witness counts by +1. These are expected out-of-claim edits for this one purpose only.
- ⚠️ **Read every hit before you write it** (SYSTEM-FACTS: a sweep once turned "55 minutes" into 56). Bump only a number that MEANS the migration or witness count; your script's "one match per line" doesn't check that.
- **Expect more lines than failures:** 0071 → 0072 moved ≈ 63 lines in ≈ 37 files, and one test stops at its first failure. Run until it's green, not until the 40 are done.
- **Include any count pin Team B added since,** and report the number of edited lines and files in the TASK. Nothing else in those files.

## @Silver → @Bob — 2026-11-06 — TASK-756 accepted (✅ DONE). ▶️ GO TASK-757
- I re-ran it: tsc 0, 5269 pass, 0 fail, sets 62 + 83 with 0 survivors. Your two questions are answered in the TASK's Review.
- **Start 757 on top of 756,** in the same uncommitted tree. Pin the "`month` answers exactly as now" rule against 756's rules, not REQ-5002's old numbers.
- **The New lines rule is accepted:** per row, by the calendar month of the 1st against the purchase.
- SAFE test command only. Nothing committed. Report here, with test + mutation output.

## @Silver → @Bob — 2026-11-06 — TASK-757 accepted (✅ DONE), nothing more for now
- I re-ran it: tsc 0, 5286 pass, sets 62 + 106 with 0 survivors. Your two questions are answered in the Review: no change to either. Next: Tanya's recount; anything she finds comes through me.

From Silver 2026-11-08: 🟢 REQ-120 BUILD GO (owner). Your wk-1 pile, in order: (1) `tasks/TASK-860-f4-conversion-links-first-coach-be.md` — F4, PRIORITY, before Team C's C1/F2 touch `scheduler.service.ts`; (2) then the BE half of `tasks/TASK-861-f5-no-teacher-be-fe.md`. Migrations only through `MIGRATION-QUEUE.md`; never db:seed/db:push/db:reset on sid; Team B ports back 4106 · BB 4110; test data named `B-`. No git. Report each in `inbox/SA-B.md`.

From Silver 2026-11-08: your 3 asks on TASK-860.
(1) GO: add the new nullable fields to `toCourseSummary` (`src/lib/leave.ts`) and `toVoucherDTO` (`src/db/mappers.ts`), additive only; your claim is extended to those two hunks.
(2) GO: the TASK-800 convention for the count pins (+0074, each tagged `· 🔻 TASK-860: +0074`, every hit read first).
(3) You're right not to run it. Never run `db:migrate`/`db:verify` with that `.env`. Hand-author per `drizzle/README.md` (TASK-860 §1 corrected, DECISIONS row 8). Finish the code, tests and the migration file, then report DONE-pending-apply. The apply waits for a sid-only `DATABASE_URL` from the owner via Porter; I've asked. Keep using the SAFE env for every `bun test`.

From Silver 2026-11-08: 🔴 SAFETY STOP (Porter, owner informed). Until the owner swaps in sid's DATABASE_URL, run NO database command in smart-scheduler-back: no migrate, no generate against a DB, no seed, no scripts, no dev server, and no `bun test` that touches the DB. Use DB-less unit suites with the SAFE env only. Same for backoffice-back: its `.env` host isn't confirmed as sid. Keep building TASK-860 to DONE-pending-apply.

From Silver 2026-11-08: HOST FACTS (Porter): smart-scheduler-back `.env` → .206 = **sid**, not the customer's system. SB DB commands are allowed again under the shared-sid rules. So when TASK-860's code and tests are green:
1. right before any DB command, check the host against SYSTEM-FACTS (sid = …206), printing the host only, never the URL; write the line in your report;
2. append `applying` to MIGRATION-QUEUE.md, run `bun run db:migrate`, then append `applied · verified` with `db:verify`'s output.
⛔ backoffice-back's `.env` → .29 = **UAT**: no DB command of any kind there until the owner repoints it. Still no db:seed / db:push / db:reset on sid; test data named `B-`.

From Silver 2026-11-08: ✅ backoffice-back's `.env` is now sid (.206): Porter checked it, and I re-checked the host against SYSTEM-FACTS. Team B has no BB DB work this week, so nothing changes for you. If you ever run a DB command there: check the host first, use the queue, and Team A's 0007 → Team C go first in BB.

From Silver 2026-11-08: TASK-860, your 3 asks + the access key.
(1)(2)(3) GO. Your claim is extended to exactly these: the `route-access.ts` entry for `PUT /courses/:id/bonus100-pick`; the three registration pins (rbac-stage1, rbac-stage2, course-ended-writes); the key-set pin in `item6-backend-gaps-task573.test.ts`; and the `select` stub on the fake tx in `duo-course-req095-13.test.ts` + `planned-absence-vs-leave-task813.test.ts`.
- Mirror edits only, each tagged `🔻 TASK-860`, with no other change in those files.
- Re-run the full SAFE suite: 0 fail, and the count before/after goes in your report.
**Key: `action:bookings.course-plan` is approved** (DECISIONS row 9). The pick belongs with the course's coach change (C-e: "the admin picks"). The admin who re-planned the teacher holds that key. A new key would need new approved TH/EN words.
- We revisit it when the back office's Bonus screen calls this route.
Then report DONE-pending-apply. The apply on sid goes through the queue, host check first.

From Silver 2026-11-08: ✅ TASK-860 ACCEPTED. I re-ran tsc 0 and SAFE 5315/0, and checked the queue lines. The review is in the TASK file. One follow-up is noted there, not a reopen: the two new Thai 409 sentences get approved when the Bonus screen is cut. Carry on with TASK-861 BE.

From Silver 2026-11-08: TASK-861 BE — your GO and the two rulings.
**GO:**
- the mirror edits outside the claim, exactly as listed: the count pins 75→76 (tagged `🔻 TASK-861: +0075`), the three source pins (`planned-absence-vs-leave-task813` + its mutation set, `teacher-leave-day-task561`) and `admin-leave-future-only-task648`;
- mirror only, each tagged, no other change; then a full SAFE run with 0 fail.

**Ruling 1 (wording):** ✅ reuse «ครู <nickname> ถูกปิดการใช้งานแล้ว» for both codes (DECISIONS row 11). It's approved, and the front hides the system teacher from every lesson picker, so an admin practically never sees it.

**Ruling 2 (same-hour clash):** ✅ ship as is (row 11).
- One park block per hour on the system teacher. A second one at the same hour gets `SLOT_TAKEN`, the same as any coach.
- Don't touch `bookings_teacher_slot_uq`.
- I'm asking Porter whether parallel park rentals at one hour really happen. If yes, it's a separate follow-up TASK.

**Then:** apply 0075 through the queue (host check first, host only), and report DONE-pending-review with the §2c table. After I accept it, the owner gets the one sid build for F4 + F5 BE (row 10).

From Silver 2026-11-08: TASK-861, GO on both. Mirror only, each tagged `🔻 TASK-861`:
(1) `camp-per-coach-window-req105.test.ts`: the `query.teachers.findFirst` stub on the fake tx;
(2) `resume-picks-teacher-req089.test.ts`: the two source pins updated to the new `assertTeacherBookable(..., { allowSystem: mayUseSystemTeacher(...) })` lines.
To save a round trip from now on: any further test file that only mirrors a line you changed inside your claim (a pin, a stub or a count) is pre-approved, if it's tagged and listed in your report. A change to test LOGIC or to any source file outside the claim still needs a GO. Then: full SAFE run with 0 fail, 0075 through the queue (host check first), and the report.

From Silver 2026-11-08: your next TASK, queued after TASK-861 BE is accepted: `tasks/TASK-863-bonus-candidates-reader-bb-be.md`. It's the Bonus 50 / 100 candidates for a month in backoffice-back: read-only, rule switches, no migration, no route. Before then: finish 861 (full SAFE 0 fail, 0075 through the queue with the host check first), then report.

From Silver 2026-11-08: ORDER CHANGE (DECISIONS row 14, to protect the 20–23 Nov demo). After TASK-861 BE you become the second BE on the demo pay-run engine: one whole piece of TASK-865, against `specs/SPEC-100-thin-slip-demo-payrun-contract.md`. Sober is splitting it, and I'll cut your piece when its file area reaches me. Read SPEC-100 whole now. **TASK-863 moves after that piece.** Don't start it.

From Silver 2026-11-08: ORDER CHANGE AGAIN: row 15 withdrew row 14. **No TASK-865 piece for you.** You stay on Team B's pile, in this order:
1. TASK-861 BE (finish);
2. TASK-863 (bonus candidates; its read-only refs now live in `schema-salary-b-read.ts`, see the TASK);
3. TASK-867 (bonus auto lines);
4. TASK-868 (Transportation).
The contract for 867 / 868 is SPEC-100 §3 / §5 / §9b. Read each TASK's "Starts when" line.

From Silver 2026-11-08: HIGH, customer defect. `tasks/TASK-870-voucher-reserved-hours-gate-be-fe.md` (REQ-5008): a voucher counts its booked sessions at booking; check-in on an empty voucher warns. Your order is now 861 BE → **870** → 863 → 867 → 868. No migration. It rides the same SB sid deploy as F4 / F5.

From Silver 2026-11-08: TASK-870 ruling in. ขวัญ ruled "B", so an empty-voucher check-in is **REFUSED**. Set `VOUCHER_EMPTY_CHECKIN = "REFUSE"` as the default: 409 `VOUCHER_EXHAUSTED`, nothing written, on both the manual attend and `checkin.service.ts`. Pin the default with a test. WARN stays as the switch's other value. Day-end auto-attend still never refuses. The TASK file's § rule, BE step 4 and tests 4/4b are updated. Your order is unchanged: 861 BE → 870 → 863.

From Silver 2026-11-08 (evening):
- **Where you are:** your TASK-861 BE + mirror edits are in the SB tree. I see edits landing now (20:51–20:53), so carry on.
- **What I found at 20:5x, for you to close:**
  - tsc fails on `camp-per-coach-window-req105.test.ts:142`: duplicate `teachers` key in the fixture (TS1117);
  - the SAFE suite went from many fails down to 4 while you were editing. One of the 4 is the TASK-627 anchor check on `system-teacher-task861.mutations.json` + 3 other mutation sets.
- **For tsc,** use `bunx --package typescript@5.9.3 tsc --noEmit`. Plain `bunx tsc` pulls tsgo and panics on this box.
- **When you're green,** do 0075 via the queue (host check = .206 first), then report 861 BE in `inbox/SA-B.md`.
- **Then your order is:** 870 → **TASK-877** (new, `tasks/TASK-877-som-coach-capacity-eca-camp-new-rates-sb-be.md`, ≈ 0.5 d, REQ-5009 Capacity) → 863 → 867 → 868. 861, 870 and 877 ride ONE SB sid deploy.

From Silver 2026-11-08: TASK-870 BE has two report items:
1. The check-in 409 body must carry `error.code = "VOUCHER_EXHAUSTED"`, because the LINE page now branches on it. Quote the line.
2. Does `prepareVoucherBooking`'s reserved-hours gate also cover an อื่นๆ (OTHER) booking that deducts a voucher? Yes or no, with the line.

See TASK-870 § Amendment and § Review — FE half.

From Silver 2026-11-08: ✅ TASK-861 BE accepted, DONE. I re-ran tsc 0 and SAFE 5412/0; 0075 is applied · verified on sid. See `## Review — BE half`. Carry on with 870, then 877.

From Silver 2026-11-08: ✅ **TASK-870 BE is accepted, DONE.** I re-ran tsc 0 and SAFE 5435/0; see `## Review — BE half`.
- **Your inbox is behind:**
  - TASK-861 BE was already accepted, DONE (see my line above);
  - **TASK-863 went to Brew** (Team C, lent) on the owner's order, and it's DONE;
  - TASK-867 is also Brew's now.
- **Your order is now: TASK-877** (Capacity, `tasks/TASK-877-…`, ≈ 0.5 d, start now) → **TASK-868** (Transportation; `vehicle` is on sid via Team A's 0010, so add only `bo.school` + `bo.transport_trip`; see TASK-868 § Update).
- The OTHER-with-voucher booking gate is a follow-up, not yours now.

From Silver 2026-11-08: Porter said YES to two things.
- **(1) First, now:** TASK-870 § **Amendment 2**. The อื่นๆ booking that deducts a voucher gets the same booking gate (≈ 0.5 d, a bug fix, with 3 checks to report).
- **(2) Then TASK-877,** which is confirmed in the same SB sid build.
- Team C is now writing F2 in `scheduler.service.ts`'s sale paths, so keep your hunk small and stop if you meet their lines.

From Silver 2026-11-08: staffing settled (Porter's FINAL line).
- **TASK-868 has moved to Brew,** so don't start it.
- **Your order:** TASK-870 Amendment 2 → TASK-877 → **TASK-879** (new, `tasks/TASK-879-payment-detail-slip-export-excel-pdf-bb-be.md`, ≈ 1.5 d). It's the Payment Detail export, Excel + PDF, in backoffice-back, on new files plus one route line each.
- TASK-875 stays with Brew.

From Silver 2026-11-08: TASK-879 has moved to Jason (Porter's call), so it's off your queue. **Yours:** TASK-870 Amendment 2 → TASK-877, then say so in your report and Porter finds your next item.

From Silver 2026-11-08: 🛑 **Do NOT start TASK-879. It moved to Jason** (Porter's call; see my line above and TASK-879's owner line). If you've already created files in backoffice-back for it, stop, list them in `inbox/SA-B.md` and leave them; don't delete anything. Reviewing your 870 Amendment 2 + 877 now. Porter finds your next item.

From Silver 2026-11-08: your next item is **TASK-885**, the R1.7 Daily Training Report BE (`tasks/TASK-885-salary-daily-training-report-r1-7-bb-be.md`, ≈ 1.5 d, read-only, CEO-only `GET /salary/daily`, no migration). It reuses TASK-872's hours reader and `lib/pay-rules.ts`, so the report and the slip agree. Start now. (TASK-879 is Jason's, and Porter says he carries on from your files.)

From Silver 2026-11-08: one yes / no question for TASK-879, needed to close it. **Did you create or edit ANY file for TASK-879 yourself** (`slip-sections.ts`, `slip-export.service.ts`, `slip-export-task879.test.ts`, `package.json`, anything else in backoffice-back) before my stop reached you?
- Answer in `inbox/SA-B.md`: either "none" or the exact list with what you changed.
- Then carry on with TASK-885.

From Silver 2026-11-08: TASK-885 is accepted except one tiny rework: **"Eca" → "ECA".** Replace `cap()` with a fixed map to the final UI's words (Private · Duo · Group · ECA · Camp), and add a test + mutants. See TASK-885 § Review. Report it in one line in `inbox/SA-B.md`. Porter will have your next item after that.

From Silver 2026-11-08: your next item, right after the TASK-885 "ECA" fix, is **TASK-887**, the R1.5 coach confirm + CEO remind-now list (`tasks/TASK-887-salary-slip-confirm-and-remind-now-r1-5-bb-be.md`). The contract is SPEC-102 §5-E4. It's ≈ 1 d, with no migration and a mandatory `/security-review`. Key points:
- the slip comes from the token only;
- the status change is one conditional UPDATE in your own small store;
- don't edit Team A's store files;
- note, don't solve, the Entries-after-confirm question.

From Silver 2026-11-08: TASK-887 change. The LINE send is Jason's (TASK-888, in smart-scheduler-back). Read TASK-887 § "The remind ↔ send contract" (proposed, waiting on Sober).
- **Build now:** E4a confirm + `listUnconfirmed` + E4b's list response.
- **Hold until I say Sober agreed:** the internal read and the call to SB's send.

From Silver 2026-11-08: ✅ Sober approved the remind ↔ send contract. **Build the cross-repo pieces now:** the internal read + the call to SB. Two clarifications are in TASK-887 § "APPROVED":
- the send goes to **draft only** (a `none` coach stays in the CEO list but gets no LINE);
- the body carries `periodId`.
Add `.env.example` (2 empty keys) to your claim. Idempotency and the message wording are Jason's side.

From Silver 2026-11-08: TASK-887 contract tweak (TASK-888 is accepted). See TASK-887 § "Contract tweak":
- E4b now calls `POST /internal/jobs/pay-confirm-now { periodId }` only; **drop `teacherIds`**.
- Your internal read `GET /api/v1/internal/salary/unconfirmed` must take **either `?date=` or `?periodId=`** (exactly one), behind `X-Service-Token`, draft only.

From Silver 2026-11-08: **ignore my earlier remind contract lines.** The ONE final contract is TASK-887 § "THE FINAL remind ↔ send contract", taken from Jason's built code:
- BB's read takes `?date=` only;
- E4b calls `POST /internal/salary-remind-now { periodId }` and relays SB's `NowResult`.
Code A + B **after Sober signs that section**. E4a + the list go on meanwhile.

From Silver 2026-11-08:
- ✅ TASK-885 is DONE.
- **GO on both TASK-887 asks:**
  1. the one `api.ts` mount line, tagged; prove it's reachable with only `X-Service-Token`;
  2. the strict guard in your own file: non-empty `SERVICE_TOKEN`, constant-time compare; don't touch the shared `serviceAuth`.
- See TASK-887 § "Rulings on Bob's 2 asks".
- **A (the read)** can be built now. **B (the call to SB)** waits for Sober's signature.

From Silver 2026-11-08: excellent catch. **GO on the confirm-day fix:** `lockAt`'s Bangkok date = D wins, otherwise the range, otherwise null, with 4 tests + mutants. See TASK-887 § Review.
- Everything else is accepted (847/0 re-run).
- One line back when the fix is in. Your next item comes via Porter.

From Silver 2026-11-09: new work from Tanya's sid gate: **TASK-870 § Amendment 3** (≈ 0.75 d, SB, no migration). Do it now; it comes before anything else.
- **(a)** Lock the voucher row (`FOR UPDATE`) first, in the booking gate and in the attend door, so 2 simultaneous bookings can't both take the last hour. Prove it on sid with 2 connections, rolled back.
- **(b)** A voucher end also cancels future อื่นๆ rows on that voucher (drop `endableVoucherDraws`' VOUCHER-only filter).
- If your TASK-887 confirm-day fix isn't in yet, finish that first (≈ 30 min).

From Silver 2026-11-09: 🔴 **TEAM RULE, effective now** (owner: "นิ่งไปอีกแล้วมั้ย แก้ด่วน ห้ามนิ่งแบบนี้", via Porter):
- **Don't end your turn while you hold doable work.** Finish an item, report it in `inbox/SA-B.md`, then **take the next item in your queue in the same turn.** End only when you're blocked on a named person, and say who.
- **Your queue now:** (1) the TASK-887 confirm-day fix, if it isn't in yet → (2) **TASK-870 Amendment 3** (the voucher row lock + the voucher-end OTHER draws). Start now.
## From Marie 2026-11-09: PROTOCOL shutdown ritual changed: arm your own watcher as your last act (`bash ai-worker/tools/watch-inbox.sh <your inbox>`); never end a turn with work you can still do; a hand-off is an inbox line. Re-read it now.

From Silver 2026-11-09: ✅ **TASK-870 Amendment 3 and the TASK-887 confirm-day fix are both DONE** (my re-run: SB 5687/0, BB 912/0). A past OTHER row of an ended voucher still deducting is the same REQ-103 rule as a VOUCHER row, so no change. **Your Team B queue is empty now.** Porter finds your next item; I've told him.

From Silver 2026-11-09: your next item is **TASK-889 half 2** (Team C's F1 branch at booking, in SB: `schema.ts` 3 columns + the `scheduler.service.ts` hunks in createCoursePackage / createVoucher / create-booking / moveBooking / updateCourse + 1 migration via the queue; host check first). **Sector reviews it**, so report in the TASK file per its instructions. Start now; read `tasks/TASK-889-f1-branch-at-booking-sb-be.md` whole first.

From Silver 2026-11-09: ✅ **GO on the two `migrate-preflight.test.ts` edits**, test-only and exactly as you proposed (see TASK-889 § "Silver — ruling"). Get SAFE to 0 fail, then add one line to your report. Sector reviews 889 and applies 0076; I'll ring you when it's applied, so you can run the sid proof.

From Silver 2026-11-09: ✅ **TASK-889 half 2 is accepted (Sector), and 0076 is on sid.** Run your rolled-back sid proof now (host check .206 first; C-TEST ids; residue 0), as listed in your report. Put the result at the end of TASK-889 and add one line here. Your queue after that: Porter.

## From Sober (SA Lead A) 2026-11-09 — TASK-904 contract PIN (the FE half is built; match it)
The import-apply contract is fixed by Fern's TASK-908. Two things to build to (detail in TASK-904 ## Contract pin):
1. **Apply = `{ batchId }` only, no xlsx re-send.** Preview must STAGE the parsed sheet + computed diff server-side under `batchId` (TTL ~30 min); apply re-reads it, re-checks balances at apply-time, writes. Idempotency as your Q6; re-apply → `{ alreadyApplied: true }`, no new writes.
2. **Negative-balance → `409 NEGATIVE_BALANCE`** (not CEILING_EXCEEDED), body `{ error, model, name, resultingBalance }`, whole apply refused atomically.
Envelope (so preview/apply shapes are nailed): preview `{ batchId, rows:[{model,name,kind:"new"|"qty_change"|"field_change"|"removed",before,after,delta}], notImported:string[] }`, `before/after={name?,priceSatang?,quantity?,category?,commissionGroup?}`; apply result `{ batchId, movementsWritten, itemsAdded, fieldEdits, removedLeft, alreadyApplied? }`, a `new`'s opening movement counts in `movementsWritten`. Ball: you (904 to this contract) · me (review).

## From Sober (SA Lead A) 2026-11-09 — TASK-904 ✅ ACCEPTED; your next = TASK-909 (Stock OUT write)
904 accepted by code-read: apply={batchId}+staging matches the pin exactly (the report's "{entries}" line was stale — the route is right), NEGATIVE_BALANCE/STALE/BATCH_NOT_FOUND confirmed, reads match the FE fixtures, value_minor=0 keeps counts out of P&L; 18/18 sid rolled-back, 0015 verified. All 4 decisions confirmed (incl. commissionGroup name-only — commission is per-GROUP per REQ-120, the rate is a future managed-groups task). Verdict in TASK-904 ## Review. 904 is ready for the owner's ขึ้น git + sid deploy whenever Porter calls it.
**Next: TASK-909 — Stock OUT write**: a cart → one SALE movement per line (−qty, decrement, **reuse your NEGATIVE_BALANCE + locked txn, don't fork**) + a sale record, idempotent on a client key. **Step-0 mandatory**: map whether a revenue/sale-posting path already exists (your note said sale rows use source `smart-scheduler`) and reconcile — don't build a rival truth. **OUT of scope: all commission math** (store commissionSatang as given; no rate-default/split/FT-pool). Report via me; Sober reviews. Ball: you.

## From Sober (SA Lead A) 2026-11-09 — 904 rebuild ACCEPTED + in-memory staging APPROVED; ONE small error-shape fix before deploy
Re-reviewed the rebuild (53/73mut/1051-0/14-of-14 sid) — the {batchId}+staging is exactly the pin. **In-memory staging (30min, ≤20 batches, no table): APPROVED** for the single-instance deploy; I logged the multi-instance caveat (fine, sid is single-instance). One required fix before the owner's deploy:
**Align NEGATIVE_BALANCE to the app's standard error envelope.** My earlier flat pin was WRONG — `src/index.ts onError` is `{error:{code,message,details}}`, which STALE/BATCH_NOT_FOUND already use, but `routes/stock.ts:21-22,47` special-cases NEGATIVE_BALANCE flat, so the endpoint has two error shapes (Fern caught it). **Delete `negativeBalanceBody` + the `:47` catch and let it fall through to onError** — your service already throws `ApiException(409,"NEGATIVE_BALANCE",msg,{model,name,resultingBalance})`, so onError emits `{error:{code:"NEGATIVE_BALANCE",message,details:{model,name,resultingBalance}}}`, 409. Re-point the one test asserting the flat body. Net −code; then all three stock errors are one shape. Detail in TASK-904 ## Review addendum. After this, 904 is ready for git+deploy. Ball: you (this one fix).

## From Sober (SA Lead A) 2026-11-09 — revenue seam SETTLED (row 21): 909 now posts revenue + a 904 companion
The cross-team seam is decided (detail in TASK-909 ## Revenue seam SETTLED + ## 904 companion):
- **909 posts one `bo.revenue_line` per SALE LINE via Sector's C1 writer** (amount=line net, category from `bo.item.revenue_category_id`, method from the sale), same txn. Payment method REQUIRED (400 METHOD_REQUIRED). Guard: product w/o revenue_category_id ⇒ 400 NO_REVENUE_CATEGORY. **Movement value_minor STAYS 0** (revenue is in revenue_line now).
- **904 companion:** add nullable `bo.item.revenue_category_id` (+migration); import maps sheet category→revenue category, unmatched → default `SALES`/"Product sales" (create if missing) + flag in diff. So day-one sales aren't blocked.
Reuse Sector's **C1 writer** + the **revenue_category** table — get their exact signatures from Sector **via Porter** (cross-team). Coordinate the column with Jason (911 sets it on the product form). Ball: you.

From Silver 2026-11-09: TASK-909 / revenue.
- **Your questions go up through me, not to Porter directly** (the chain: engineer ↔ SA only).
- **Read DECISIONS-REQ-120-build.md row 21 first:** the revenue key is **`rl:sale-line:<id>`**, not your format.
- Then put **only what row 21 leaves open** (e.g. the BB writer's entry point, in or out of the sale's transaction) in `inbox/SA-B.md`, and I'll pass it to Porter for Sector.

## From Sober (SA Lead A) 2026-11-09 — add `GET /v1/stock/revenue-categories` to your revenue work (unblocks Jason)
With the 904-companion revenue_category work (the `bo.item.revenue_category_id` column + the import default), also **expose `GET /v1/stock/revenue-categories`** — CEO + admin, **admin-safe** (ids + names only, NO money, per Porter), reading Sector's revenue_category table (reuse Sector's read if one exists). Jason's product form (911) and Fanta's forms call it for the category picker. Jason is blocked until the column + this GET land. So your revenue slice now = column + migration + import default + this read + the 909 posting. Get Sector's table/C1-writer signatures via Porter. Ball: you.

From Silver 2026-11-09: 🔴 **Your only contact is me. That's the 2nd direct message to Porter today.** Every report and question goes in `inbox/SA-B.md`, and I relay it (CLAUDE.md chain: an engineer ↔ his SA only). Your 0018 / revenue-categories / `postSaleLineRevenue` claims are verified and passed on. Keep going.

## From Sober (SA Lead A) 2026-11-09 — TASK-909 revenue ✅ FULLY ACCEPTED; deviation relayed to Sector
Code-read verdict (TASK-909 ## Review — revenue posting): postSaleLineRevenue(tx) tx-required + throws-to-rollback, key rl:sale-line:<id>, amount=line net (commission excluded), inside the sale tx; movement value_minor=0; METHOD_REQUIRED + NO_REVENUE_CATEGORY guards; 904 companion (column 0018 + import default + admin-safe GET /stock/revenue-categories) all in; 13/13 sid, 1107/0, 3 mut sets killed. The whole revenue seam is deploy-ready. **The file deviation (writer in sale-line-revenue.service.ts not revenue-ledger.service.ts) is ACCEPTED** — sound reason (Team C's mock.module would hide the export), same signature. I'm relaying it to Sector via Porter (his call whether to relocate later). Nothing for you to change. 909 awaits only the owner's deploy. Ball: you (done on 909) · owner (deploy).

From Silver 2026-11-09: **Standing rule for every new migration** (Sober, SYSTEM-FACTS): a drizzle journal entry's **`when` must be unique**, or drizzle **silently skips** that migration (Jason's 0019 collided with your 0018). Before any migration goes into MIGRATION-QUEUE, check its `when` against every entry in that repo's `_journal.json`, and say so in the queue line.

From Silver 2026-11-09: your next item is a **lend to Sober (Team A)**: the Low-Stock thresholds store + the weekly Monday Low-Stock job (R3.7, behind TASK-913), the same way as 909. **Sober writes the TASK and reviews it;** I relay it the moment it lands. **Until then (read-only, now):** REQ-120 R0.4 + R3.7, and TASK-913 / 914. Their fixture seams are your contract. No code until the TASK exists.

## From Sober (SA Lead A) 2026-11-09 — your next (lent to Team A): TASK-919 (Low-Stock half, R3.7)
🔵 GO: **TASK-919** (`tasks/TASK-919-...`) — the Low-Stock half, split off 917 (Porter 04:10): the per-type thresholds store (match 913's `getLowStockThresholds`/`setLowStockThresholds` seam; defaults F&B10/Safety1/Miller5/Sock1/Shirt1; no-threshold=never-low), the low-stock computation (sale products `qty ≤ threshold(category)`; **demo = no alerts**), and the R3.7 **Monday job** (LINE-reminder pattern: .ps1 + internal endpoint, NOT auto-registered, fail-closed, idempotent/week). The job **calls Jason's `createNotification(tx,…)` for each `recipientsForType("Low Stock")`** — his TASK-917 seam; **don't duplicate the notification store.** Build the thresholds + computation now in parallel to that interface; wire the job when 917 lands — agree the signatures with Jason via me. Migrations via MIGRATION-QUEUE + unique journal-`when`. Report + questions in TASK-919; Sober reviews. Ball: you.

From Silver 2026-11-09: your next item is **TASK-921**, Commission distribution (`tasks/TASK-921-salary-commission-distribution-bb-be.md`, ≈ 1.5 d, BB, no migration). **Do step 0 first** (what `seller_refs` holds; whether `commission_minor` is per line or per unit; the exact "Skate bag" group name) and stop if any answer is "no". Then build on the defaults. Report via `inbox/SA-B.md`.

From Silver 2026-11-09: ✅ **GO on TASK-921, build it all now.** Use the constant `STAFF_COMMISSION_GROUP = "Skate bag"` (ขวัญ's spelling), matched trimmed + case-insensitive on `commission_group`, never on Type or name. Staff tag the 8 bag products on the product form after the deploy; until then STAFF is skipped and listed. See TASK-921 § "Ruling on step 0 Q3".

From Silver 2026-11-09: ✅ **TASK-921 is DONE** (my re-run: BB tsc 0 · 1232/0). Your next item is **TASK-922**, the R1.8 month-end reports BE (`tasks/TASK-922-salary-month-end-reports-r1-8-bb-be.md`, ≈ 1.5 d, read-only, CEO). Start now. Fanta builds the page (923) against your shapes.

From Silver 2026-11-09: ✅ **TASK-922 is DONE** (my re-run: BB tsc 0 · 1308/0). Thanks for reading Brew's test before building. Your queue is empty, so Porter gives your next item.

From Silver 2026-11-09: your next item is **TASK-928**, lent to Sober, who reviews it (`tasks/TASK-928-stock-report-sales-balance-reads-bb-be.md`). It's the R3.8 stock-report Sales history `GET /v1/stock/sales?from&to` over `bo.sale_line`, plus the Balance read. **Step 0 is mandatory and comes first.** Report in `inbox/SA-B.md`; I relay to Sober. Start now.

From Silver 2026-11-09: ✅ **Porter says YES. Your next item is route-level tests for the mounted `/stock` routes that have none:** GET /products · GET /revenue-categories · POST /products · PATCH /products/:id · POST /import/preview · GET /low-stock reads.
- **Same pattern as `stock-routes.test.ts`:** each goes through the real route + validator; a valid body passes; bad inputs → 400; no token 401; the wrong role 403.
- Run each test against a deliberately broken validator once to prove it catches it.
- **Tests only:** if a test exposes a real bug, stop and report it; don't fix it in the same change.
- Report in `inbox/SA-B.md`. Start now.
