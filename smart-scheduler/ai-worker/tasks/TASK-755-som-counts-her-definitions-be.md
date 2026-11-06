# TASK-755 — REQ-5002 (2/2): SOM lines follow REQ-5002 §5's rulings (and TASK-754's Renew rule is amended) — BE, ≈ 2 d
- Source: `requirements/REQ-5002-*.md` §1, §4, §5 · `CHECK-REQ-5002-som-counts-2026-11-05.md` §10 (replaces §3's defaults)
- Status: ✅ DONE 2026-11-05 (Silver review), ONE build with TASK-754 → sid deploy → Tanya's recount (CHECK §11) → the owner's git word · nothing committed
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-11-05)
- **Claim:** the same files as TASK-754, + **one line** in `src/services/som-contract.service.ts` passing `archivedAt` on students (GRANTED, §7.4).
- 🔴 SAFE test command only. 🔴 run → list → ask → THEN edit. 🚫 No front file; same fields and shapes. Nothing committed. A ruling that could still move lives in ONE named constant + its pin.
- 🚫 `src/services/declared-absence-stretches-expiry-task646.test.ts` is modified in the tree: it is Team A's, don't touch it.

## Build
1. **Active course + Active voucher (Q2):** `ACTIVE_COUNT_UNIT` → PACKAGES: both cards count courses / vouchers. Its 🔒 comment cites §5 (supersedes K1).
   - **Active course also needs a class:** ACTIVE at the as-of date (as today) AND at least one row of that course with status ≠ CANCELLED dated **after** the as-of date, **whatever that row's status is now** (CHECK §9). Paused stays out.
   - **Active voucher:** ACTIVE only, no class needed.
2. **Total customers (§6.2, §7.3):** each name once: everyone known by the as-of date (month end; current month = today). Known = a non-cancelled **lesson-type** class (`isLesson`) dated on or before it, or a non-cancelled course / voucher bought on or before it. **Children with only ECA / camp / group rows are out; archived students are out.** Not the union of the 4 cards. The branch filter as elsewhere.
3. **1st Trial (Q3):** the child's first trial class with status ATTENDED, in this month. 1st Trial, no course follows it.
4. **New Course this month (Q4, §7.1):** the child's **first** course (`kindOf` = NEW), opened this month, and the child's earliest non-cancelled trial is this month, on or before the buy day. No trial ⇒ on neither New line.
5. **New Course previous month (Q5, §7.1):** the child's **first** course, opened in the selected month, and the same trial in **any** earlier month.
   - **No flag needed:** both lines keep reading `kindOf`, so no purchase sits on New and Renew together.
6. **Renew Course (Q6), amending TASK-754:** `RENEW_ONLY_AFTER_OLD_FINISHED = false`, for courses and vouchers. Any later-day course after an earlier non-cancelled course, and voucher after voucher. Rewrite its 🔒 comment: §5 + §7.2. **Keep it one constant: the owner may flip it** (flip = Renew 40 · 19). Voucher after course stays out.
7. **Leave alone:** Not renewed, 1 HR, 1st Trial (3 months), Coach capacity, Bonus (AC-5), the old `getSomReport`.

## Done when (by value)
- A pin per rule, including the boundaries: the month's first / last day, a future-dated trial, a no-show, a course with no class booked, a trial 2+ months ago, a second course while the first runs, a child with 2 active courses = 2, a child with only a cancelled course = not in Total.
- Her 5-course case (TASK-754's pin) stays one Renew row when bought after the completed one; now also one when bought while it was running.
- Mutation sets extended; full SAFE `bun test`; `tsc` 0; output pasted here.
- **A pin for §7.1:** a second course on a later day is Renew and NOT on a New line.
- **Tanya's gate (CHECK §11, Oct · Nov, 754 + 755 together):** Active course 188 · 197 · Active voucher 50 · 51 · 1st Trial (3 months) 176 · 164 · 1 HR 88 · 91 · Total: Tanya recounts (523 · 535 before archived) · 1st Trial 123 · 7 · New this month 27 · 1 · New previous 0 · 1 · Renew 55 · 21 · 1st Trial no course 96 · 6 · Not renewed 32 · 6. Nov moves with the date of the run. `ENDED_EARLY` needs a built case on sid.

## Implementation Notes
Built on REQ-5002 §7 (it wins over §5/§6 and my earlier GO entry). Same build as TASK-754, nothing committed.

**Rules, where they live (`src/lib/som-contract.ts`):**
1. **Active course / voucher** count COURSES / VOUCHERS: `ACTIVE_COUNT_UNIT = "PACKAGES"` (🔒 comment cites §5 Q2, supersedes K1). An Active COURSE also needs a row of it (status ≠ CANCELLED, whatever its status is now) dated AFTER the as-of day (`hasClassAfter`); paused stays out; an Active voucher needs no class.
2. **Total customers** = each child once, known by the as-of date: a non-cancelled lesson-type (`isLesson`) class dated ≤ as-of, or a non-cancelled course / voucher bought ≤ as-of. ECA / camp / group-only children are out; archived students are out (`SomStudent.archivedAt`, the ONE service line you granted: `archivedAt: s.archivedAt ?? null`); branch filter as elsewhere; not the union of the four cards.
3. **1st Trial** = the child's first ATTENDED trial class, in this month (`trialDone`); **1st Trial, no course** follows it. A no-show / still-booked / paused trial is not in it.
4. **New Course this month** = the child's FIRST course (`kindOf` = NEW) opened this month, whose earliest non-cancelled trial (any status — `trialOf`) is on/before the buy day and in this month. No trial ⇒ neither New line.
5. **New Course previous month** = first course opened in the selected month, the same trial in ANY earlier month (a 2+ months back trial counts). **No `NEW_LINES_FIRST_COURSE_ONLY` constant** (removed). A later-day course is a Renew and on NO New line.
6. **Renew**: `RENEW_ONLY_AFTER_OLD_FINISHED = false` — one constant, the owner may flip it (flip = Oct 40·19 per CHECK §10). Courses: any later-DAY course after an earlier non-cancelled course (same day is not "later"); vouchers: voucher after voucher; voucher after a course stays out. 🔒 comment rewritten (§5 Q6 + §7.2).
7. Left alone: Not renewed, 1 HR, 1st Trial (3 months), Coach capacity, Bonus, old `getSomReport`.

**Evidence (SAFE command only):** full `bun test`: 5264 pass · 0 fail (the task646 date failures are gone from this run) · `tsc --noEmit` 0 · 741 test file 60 pass, 742 test file 69 pass.
Mutation sets (all CHECKSUM identical): `som-contract-task741.mutations.json` 58 mutants, 0 survived; `som-nvr-capacity-task742.mutations.json` 73 mutants, 0 survived. New mutants: Q1–Q2, Q4–Q13 (Active class rule, ≥ vs >, Total: non-lesson, cancelled class, no as-of cut, archived kept, cancelled/after-date course and voucher, branch, service without archivedAt) and P1–P10 (1st Trial any-status, no-course from any-status trial, New lines for later courses, trial after buy day, ATTENDED-only for New lines, any earlier month, this/prev month, constant true, renew rows lost, purchase month ignored). Old mutants whose anchors were gone (K1/PEOPLE default, trial-month fallback, "renew only after finished" flip) were re-aimed or dropped as duplicates of the new ones. `mutation-sets-task627` anchor check is green.

**Pins per rule** (boundaries): month first/last day, a trial the same day / the day after the buy, a future-dated trial, a no-show, a course with no class booked, a trial 2+ months (and a year) back, a second course while the first runs (Renew, not New), a child with 2 active courses = 2, a DUO course = 1 course but 2 customers, a child with only a cancelled course not in Total, her 5-course case = ONE Renew row both when bought after the completed one finished and while it ran (card = list, with and without a branch filter).

**Files touched:** `src/lib/som-contract.ts`, `src/lib/som-contract-task741.test.ts` + `.mutations.json`, `src/lib/som-nvr-capacity-task742.test.ts` + `.mutations.json`, `src/services/som-contract.service.ts` (the `archivedAt` line + 754's `endReason` line). Not touched: Team A's `declared-absence-stretches-expiry-task646.test.ts` (it shows modified in the tree — not by me).

## Questions
1. Limit, not a block: a child who only ever bought a CAMP package (no lesson-type class, no course / voucher) is invisible to Total — by §7 (camp-only is out), but Tanya's recount may show it as the gap if her 523/539 basis counted them differently.
2. The "Active course needs a class after the as-of day" reads rows by status ≠ CANCELLED as the row is NOW; for a past month a class dated after that month's end that has since been attended still counts (as ruled: "whatever its status is now").

## Review

### ✅ Silver, 2026-11-05
- **Re-run by me:** `tsc` 0 · SAFE `bun test` 5264 pass / 0 fail · sets 741 (58 BITES) and 742 (73 BITES), 0 survivors, CHECKSUM identical.
- **Read by me against §7:** Active (`hasClassAfter`, in courses), Total (as-of cut, lesson-type or pack, archived out), New lines on `kindOf` = NEW, the trial in this or any earlier month, and Renew's one constant. The two service lines are the granted ones.
- **Bob's two questions, answered:** both are as ruled. A camp-pack-only child is out of Total (§6.2). A past month reads a class's status as it is now (§6.1).
- **Comment nit, not blocking:** `voucherKind`'s doc still says "that has FINISHED"; that only holds when the Renew constant is flipped.
- **Not verified by me:** real data. **First check if Total misses 523 · 535:** archived children (§7.3), then group seats. `isLesson` reads the row's type, so a seat of lesson type counts as a class. `ENDED_EARLY` is pinned only in tests; 0 on uat.
