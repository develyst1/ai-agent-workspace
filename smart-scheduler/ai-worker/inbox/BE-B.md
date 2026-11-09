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
