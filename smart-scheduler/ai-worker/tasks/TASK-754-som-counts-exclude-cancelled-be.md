# TASK-754 — REQ-5002 (1/2): SOM counts leave out cancelled courses and vouchers; 1 HR move-out; Renew's voucher rules — BE, ≈ 1.5 d
- Source: `requirements/REQ-5002-som-dashboard-counts-exclude-cancelled-and-her-definitions.md` · `CHECK-REQ-5002-som-counts-2026-11-05.md` §1, §2
- Status: ✅ DONE 2026-11-05 (Silver review) → sid deploy → Tanya's recount → the owner's git word · ruling: cancelled = any reason except `ENDED_EARLY` · nothing committed
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-11-05)
- **Claim (GRANTED, Porter 2026-11-05):** `src/lib/som-contract.ts` · `src/lib/som-contract-task741.test.ts` + `.mutations.json` · `src/lib/som-nvr-capacity-task742.test.ts` + `.mutations.json` · **ONE line** in `src/services/som-contract.service.ts` (pass `endReason` on each course)
- 🔴 SAFE test command only (TASK-723 has it). 🔴 run → list → ask → THEN edit. 🚫 No front file; no change to Palm's docs; same fields and shapes. Nothing committed.

> **Amended 2026-11-05 (REQ-5002 §5 Q6):** a course bought while the earlier one runs IS a Renew. The flip is built in TASK-755 item 6; build item 4's last bullet below no longer holds.

## Build
1. **One seam for "cancelled":** an ended course / voucher (`endedAt != null` AND reason ≠ `ENDED_EARLY`, whatever date it ended) is removed from the purchases New vs Renewing and the move-out rules read. One helper, not five checks. It must cover:
   - the counted purchase itself (`:450`, `:465`);
   - earlier purchases in `kindOf` (`:441`): a cancelled earlier course is neither "earlier" nor "ended";
   - `boughtByAsOf` (`:225`), `trialNotConverted` (`:435`), `renewedLater` (`:473`);
   - `RENEW_ENDED_STATUSES` (`:372`) loses CANCELLED; update its 🔒 comment and the Q3.7 test.
2. **Not renewed (`:481–489`):** cancelled no longer counts as finished. Used up, expired and `ENDED_EARLY` stay (an `ENDED_EARLY` course's end day = its `endedAt`).
   - `ENDED_EARLY` stays in New / Renew as a purchase, and counts as finished for the next Renew.
3. **1 HR (last 3 months):** `SINGLE_SESSION_MOVES_OUT` (`:18`) → true, and its 🔒 comment cites her 11-05 words. A child who has opened a (non-cancelled) course leaves.
4. **Renew Course:**
   - a **voucher** renews only after an earlier **voucher** that has finished (used up / expired), not after a course;
   - a **course** renews only after an earlier **course** (today's rule, minus the cancelled);
   - keep "bought before the old one finished = not Renew" (CHECK Q6) as one named constant, so a ruling is a one-line flip + its pin.
5. **Leave alone:** Active course / voucher's as-of clock, Coach capacity, the old `getSomReport`, New Course's month rules (TASK-755).

## ⚠️ AC-5
Bonus is not touched. Nothing outside the dashboard may reuse this Renew rule: R1 says voucher after voucher is NOT a renewal for Bonus 100.

## Done when (by value)
- A fixture like her case: one child, 5 courses (3 cancelled, 1 completed, 1 active) ⇒ Renew Course has **one** row, the active one, when bought after the completed one finished; **none** when bought while it was still running. The card = the list's rows.
- Pins: cancelled own / earlier / later purchase on each of Renew, New, 1st Trial no course, 1st Trial (3 months), 1 HR, Not renewed; with and without a branch filter (the same answer); voucher → voucher in; voucher after course out.
- The changed rules bite: extend both mutation sets, and each new rule has a mutant that dies.
- Full SAFE `bun test` green, `tsc` 0, mutation run output pasted here.

## Implementation Notes
**Evidence (Bob, 2026-11-05):** tsc 0 · SAFE `bun test`: **5244 pass / 3 fail (373 files)** — the 3 are `declared-absence-stretches-expiry-task646.test.ts`, **not mine and not related** (they fail with «การลาต้องแจ้งล่วงหน้าอย่างน้อย 3 ชม.» — a leave needs 3 h notice before the class, so they depend on the wall-clock time of day I ran them; the only files I changed are the five below and none of them is on that path). Sets: **741 46/46 · 742 62/62 · 737 11/11 · 743 25/25 · 748 9/9 · 749 27/27 · 750 15/15**, every CHECKSUM identical. `getDailyReport`, `som-report.service.ts`, `lib/som-report.ts`: 0-line diff. Nothing committed.

**Files (exactly the claim):** `src/lib/som-contract.ts` · `src/lib/som-contract-task741.test.ts` + `.mutations.json` · `src/lib/som-nvr-capacity-task742.test.ts` + `.mutations.json`.

**1. ONE seam for «cancelled»:** `cancelledIds(input)` (exported) = the ids of the courses / vouchers with `endedAt != null`, whatever the date they ended. `countNvr` takes it ONCE and works from `courses` / `vouchers` = the non-cancelled ones, so every rule below reads the same lists: the counted purchase (courses and vouchers), an EARLIER purchase (`kindOf`: a cancelled earlier course is neither «earlier» nor «ended», so the re-booking after a cancel is NEW), a LATER purchase (`renewedLater`), «1st Trial, no course» (`trialNotConverted`), and Not renewed. `countSom` uses it in `boughtByAsOf` (the 1st Trial and 1 HR boxes). The constant `ENDED_EARLY_IS_CANCELLED = true` is REQ-5002 Q1's default; **false** = only an ended one that never delivered a class is cancelled (an ended-early one counts as a finished purchase again) — injectable as `endedEarlyIsCancelled` and tested both ways, so her answer is a one-line flip + its pin. The as-of clock for Active course / voucher is untouched (it still rebuilds past months from `endedAt`).
**2. Not renewed:** cancelled / ended is no longer «finished» (it is not in the list any more); used up and expired stay; a cancelled later purchase is not a renewal.
**3. 1 HR (last 3 months):** `SINGLE_SESSION_MOVES_OUT = true`, its 🔒 comment cites her words («เด็กที่ลงเฉพาะ 1hr ไม่เปิดคอร์สเลย»). A child who opened a NON-cancelled course leaves; a cancelled course or a voucher does not.
**4. Renew Course:** `RENEW_ENDED_STATUSES` loses CANCELLED (now COMPLETED · EXPIRED; comment + the Q3.7 test updated). A **course** renews only after an earlier **course** that finished; a **voucher** renews only after an earlier **voucher** that finished (`VOUCHER_FINISHED_STATUSES` = EXHAUSTED · EXPIRED; new `voucherKind`) — never after a course, and a first voucher is never a Renew. A course after a voucher only is a NEW course (unchanged). «Bought before the old one finished = not Renew» is the named constant `RENEW_ONLY_AFTER_OLD_FINISHED = true` (CHECK Q6): false ⇒ any later purchase after an earlier one is a Renew.
**5. Left alone:** Active course / voucher's as-of clock, Coach capacity, the old `getSomReport`, New Course's month rules (TASK-755), Total. **AC-5:** Bonus is not touched; this Renew rule lives only in `som-contract.ts`, and a comment there says what each helper is for — nothing outside the dashboard imports it.

**Pins (by value):** HER CASE — one child, 5 courses (3 cancelled, 1 completed, 1 active) ⇒ Renew Course has ONE row (the active one) when bought after the completed one finished, NONE while it was still running, the card = the list's rows, with and without a branch filter · cancelled own / earlier / later purchase on Renew, New, 1st Trial no course, 1st Trial (3 months), 1 HR, Not renewed, each with and without a branch filter (same answer) · voucher → voucher IN (used up, or expired), voucher after a course OUT, bought while the old voucher still runs OUT, a first voucher OUT, a cancelled own / earlier voucher OUT · Q1 both ways · the helper itself. The tests I had to change for the new rules: the Q3.7 constant test, the «ended early ⇒ renew» case (now NEW), the Not renewed lists (ended-early course and voucher gone), the voucher-renew test, and the 1 HR test (a live course now moves the child out).
**Mutants (both sets extended, each new rule has one that dies):** 741 — M19 re-aimed (1 HR never moves out again), K1 (a cancelled course moves a child out of the trial / 1 HR boxes). 742 — N1 / N23 / N34 re-aimed; C1 the seam gone (courses) · C2 (vouchers) · C3 trial-no-course converted by a cancelled course · C4 a cancelled later course = the renewal · C5 a cancelled earlier course is «earlier» · C6 a cancelled own course counted · C7 a cancelled own voucher counted (this one SURVIVED at first — no test had a cancelled own voucher — so I added that case) · C8 / C9 cancelled course / voucher «finished» in Not renewed · C10 a voucher renews after a course · C11 voucher → voucher not a renewal · C12 a voucher renews while the old one runs · C13 Q6 flipped · C14 Q1 flipped · C15 an ended voucher not cancelled.

## Questions
None blocking. For the record: (a) with Q1 at its default a course ended early after some classes is out of Not renewed and of every list — it will show nowhere, which is what her «Cancelled» label says; (b) the as-of clock keeps counting such a course as active in a past month BEFORE its end date (the history of the month), which I left alone as asked.

## Review

### ✅ Silver, 2026-11-05
- **Re-run by me:** `tsc` 0 · SAFE `bun test` 5246 pass / 3 fail (373 files) · mutation sets 741 and 742 end in CHECKSUM identical, and E3, E4, E5 bite.
- **Read by me:** the diff of `som-contract.ts` and the one service line. `cancelledIds` reads the recorded reason. CANCELLED is back in `RENEW_ENDED_STATUSES`, and only an `ENDED_EARLY` course can reach it. Files = the 6 granted.
- **The 3 fails are not this TASK's, but they are not the time of day either.** `src/services/declared-absence-stretches-expiry-task646.test.ts:33` hard-codes `START = "2026-11-02"` (comment: every session is in the FUTURE), and that date has passed. They refuse with the 3-hour notice error and will keep failing every day. No SOM code on that path. Raised to Porter.
- **Not verified by me:** real data. Tanya's recount against CHECK §8 is the gate.

### Correction built (Bob, 2026-11-05) — ENDED_EARLY (Porter's ruling, the service line granted)
**Evidence:** tsc 0 · SAFE `bun test` **5246 pass / 3 fail (373 files)** — the same 3 `declared-absence-stretches-expiry-task646.test.ts` clock tests as in my first report (a leave needs 3 h notice before the class; nothing of mine is on that path) · sets **741 46/46 · 742 66/66 · 737 11 · 743 25 · 748 9 · 749 27 · 750 15**, every CHECKSUM identical · `getDailyReport`, `som-report.service.ts`, `lib/som-report.ts`: 0-line diff. Nothing committed.
**The rule now:** `cancelledIds` = a COURSE with `endedAt` set AND `endReason !== ENDED_EARLY` (a legacy row with no reason is cancelled; one that taught classes still is — TEST-136's `fb17a9db`) · a VOUCHER with `endedAt` is always cancelled (it cannot carry that reason). The «taught a class» test, `ENDED_EARLY_IS_CANCELLED` and the `endedEarlyIsCancelled` input override are REMOVED — I see no reason to keep a flip for a rule that now reads the system's own recorded reason.
**An ENDED_EARLY course:** stays in New / Renew as a purchase; counts as FINISHED for the next Renew (`RENEW_ENDED_STATUSES` has CANCELLED back — that status is now only ever an ENDED_EARLY course, every other ended one is out upstream; comment updated); appears in Not renewed with `endedAt` as its end day, and leaves it once renewed (a cancelled later purchase does not renew it).
**The one service line (`src/services/som-contract.service.ts`):** `endReason: c.endReason ?? null` on each course (+ `SomCourse.endReason?`). Nothing else in that file.
**Pins:** an ENDED_EARLY course in each of New / Renew / Not renewed ⇒ in, and the same course with ADMIN_ERROR + a class taught ⇒ out of all three · a live course whose ONLY earlier course was cancelled is NEW, not Renew (your item 2; it already held, the pin keeps it) · the helper over every reason (ENDED_EARLY, ADMIN_ERROR, CUSTOMER_CANCELLED, PROGRAM_CHANGED, none; not ended; paused; voucher) · the real READ passes the reason (an ENDED_EARLY course reaches Not renewed through the service; ADMIN_ERROR does not).
**Mutants (new, all die):** E1 the reason ignored (endedAt alone) · E2 only CUSTOMER_CANCELLED cancels (an ADMIN_ERROR that taught a class stays a purchase) · E3 an ended-early course not finished for Renew · E4 the service drops `end_reason` · E5 ended-early not in Not renewed. C14 (the Q1 flip) is retired with its constant; C15 re-aimed at the new helper.
**Files:** `src/lib/som-contract.ts` · `src/services/som-contract.service.ts` (one line) · the 741 and 742 tests + sets.
