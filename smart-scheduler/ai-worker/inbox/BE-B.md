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
