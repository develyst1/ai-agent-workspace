# TASK-180: Day-end writes ATTENDED, not NO_SHOW — kill the false claim (REQ-070) (scheduler-back)

- Source: REQ-070 (owner's design, 2026-08-24). 🔴 Live: `uat` marked 15 real children `NO_SHOW` on 08-23; repeats
  every weekend until this ships. BE-only, no FE, no migration (NO_SHOW stays in the enum for history).
- Status: REVIEW (Jason 2026-08-24). Next step: @Sober — Q1 has money in it
- Assignee: @Jason (BE)
- Repo: **smart-scheduler-back**.

## Why (grounded, from the REQ)
`NO_SHOW` has **one writer** — the day-end job (`jobs.service.ts:47`); no human can set it. Quota already treats
`{ATTENDED, NO_SHOW}` identically (`course-plan.ts:9`), so the label carries **no mechanism, only a false claim
about a child**. Good customers are separated by **CRM points at check-in**, not the label. ⇒ make the job write
`ATTENDED`; the state that caused the double-consume defect simply stops existing.

## What to build
1. **The cut (`jobs.service.ts:47`): `NO_SHOW` → `ATTENDED`.** Keep the `usedSessions`/`usedHours` increment exactly
   as-is (consumption is unchanged — a confirmed session that ended is still consumed once). **Award NO CRM points**
   — the cut never did, and that absence is the signal the owner wants kept (they didn't check in). Fix the
   now-wrong comments (`:6`, `:125`).
2. **Rename the report counters** so `job_runs` tells the truth: `noShow`/`coursesCut`/`vouchersCut` →
   `autoAttended`/`coursesAutoAttended`/`vouchersAutoAttended` (or similar). They now count sessions auto-marked
   attended, not "cut". A `job_runs` reader must not think a no-show happened.
3. **`NO_SHOW` stays in the enum** — historical rows must still render. **Sweep the read sites Porter listed and
   confirm each still handles a historical `NO_SHOW` row** (no crash, renders as today): `course-history.ts:52`,
   `scheduler.service.ts:701` (report counts), `:2371`. No behaviour change to them — just verify.
4. **`attention.ts:79` `isYesterdayNoShow`** is now **dead** (no new NO_SHOW). **Drop it + its registry entry**
   (the registry count test moves down by one). *(Re-pointing it at "attended but never checked in" is a real, more
   useful signal — but it needs a reliable was-checked-in marker, its own grounding; I've flagged it as a follow-up,
   not built here.)*

## Repair the 15 `uat` rows (owner-run, dry-run first)
`NO_SHOW → ATTENDED`, **`used_sessions` untouched** (already correct — the children attended, one session consumed).
NO_SHOW was only ever a by-product of the cut, so every `uat` NO_SHOW is one of the 15. Give **Porter** the SQL for
the owner (chat, `uat`): `SELECT count(*) FROM bookings WHERE status='NO_SHOW';` (confirm **15**) →
`UPDATE bookings SET status='ATTENDED' WHERE status='NO_SHOW';`. Idempotent (re-run finds 0 — AC-6). A genuinely
absent child is handled by a **backdated sick leave**, not by keeping NO_SHOW.

## Definition of Done
- [ ] A `CONFIRMED` course/voucher session the day-end job finds ended-unmarked becomes **`ATTENDED`**, quota +1
      once, **no CRM points enqueued** (test: assert status ATTENDED, usedSessions +1, outbox/points untouched).
- [ ] `job_runs` counters renamed to reflect auto-attend; comments corrected.
- [ ] Historical `NO_SHOW` rows still render at the three read sites (verified); the dead attention check + its
      registry entry are removed.
- [ ] `bunx tsc --noEmit` 0 · `bun test` green (update the tests that asserted NO_SHOW from the cut).
- [ ] Repair SQL handed to Porter for the owner; you run nothing against a DB.

## Review
**PASS ✅ (code) — SA-reviewed Sober 2026-08-24.** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **750/0**
(+7, −3). The cut writes `ATTENDED` (`jobs.service.ts:52`), quota increment unchanged, **no CRM points**; counters
renamed `autoAttended`/`coursesAutoAttended`/`vouchersAutoAttended` (`:71`) so `job_runs` tells the truth; predicate
`isNoShow → isDueForAutoAttend` (right — the false claim doesn't survive in the code either); the dead
`attention.ts:79` check + its registry entry **deleted** (count 11→10, reason written); historical `NO_SHOW` pinned
at the three read sites (kept in the enum so a family's history doesn't blank out). Clean and honest.

## Q1 (auto-attended trial/single now posting revenue) — SA ruling: SHIP, and route the confirm to the owner
Jason's find is real and well-flagged: because the day-end revenue pass keys on `status = ATTENDED`
(`jobs.service.ts:104`), a `FIRST_TRIAL`/`SINGLE_SESSION` that **nobody marked** will now post its price at day-end,
where before (NO_SHOW) it posted nothing.
- **This is the consistent consequence of the owner's own design** ("confirmed-ended → attended"), and the *old*
  behaviour (NO_SHOW → no revenue) was the exact **silent lost-revenue** class this team has chased all week. The
  system never verifies cash-collection even for a **manually** marked ATTENDED — so auto-attend posting is
  consistent with how attend already works, not a new liberty.
- **⇒ Recommendation: ship as-is (it posts).** But it **is the owner's revenue line**, so @Porter must get his
  one-word confirm **before deploy** — surfaced, not silent. If he'd rather an unmarked trial/single **not** post
  (unmarked = maybe-uncollected), that is a follow-up needing a *"was auto-marked"* **column** (a marker, so it stays
  suppressed across idempotent re-runs) — **do not invent it on spec.**
- **Does not block the weekend-critical course fix** — courses post revenue at sale, so the label swap has no
  revenue effect on them; the owner's confirm is a fast gate on the trial/single behaviour only.

**⇒ Code DONE.** Deploy on the owner's Q1 confirm (recommend: proceed). The **repair** (15 uat rows → ATTENDED,
`used_sessions` untouched) runs **after** the code deploys so no fresh NO_SHOW appears mid-repair.

## Notes / Questions
(Jason fills in. REQ-070's file Q1/Q2 are **superseded** by the owner's source-fix design — no correction path is
built; `returnsConsumedUnit` is NOT widened. Follow-up candidate, not this task: an "attended but never checked in"
attention check to replace the dead NO_SHOW one.)
