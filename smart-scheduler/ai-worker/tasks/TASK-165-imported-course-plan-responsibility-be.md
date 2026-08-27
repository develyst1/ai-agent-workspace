# TASK-165: Imported course plan responsible only for remaining sessions (REQ-064) (scheduler-back)

- Source: SPEC-060 (REQ-064)
- Status: DONE (SA-reviewed Sober 2026-08-22) — the give-away is stopped; existing cases → TASK-166 + owner

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-22).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **697/0** (+14). Read it:
- **`coursePlanSize = max(0, size − priorSessions)`** — pure; SALE `priorSessions=0` ⇒ `planSize=size`, today's
  behaviour unchanged. Used at **all four** plan-responsibility sites (reconciler `:1574`, `owedCount` `:1285`, DTO
  `insertable` `:1278`, and the server-side insert gate `:1764`). `size` kept for quota/label/expiry/history.
- **AC-5 guaranteed and asserted** — a test loops attendance 0→10 on a SALE course and pins the plan empty every
  time; `priorSessions` is immutable so attendance can't move a SALE target. The `size − usedSessions` trap can't fire.
- **Cancel guard (`withholdImportCancels`, req 6)** — scoped to `priorSessions > 0`, drops the cancel list and
  returns it as `withheldCancelIds` (→ TASK-166), so no family's existing session is auto-deleted. SALE untouched.
- **Migration `0021`** — additive `prior_sessions int NOT NULL DEFAULT 0` + guarded backfill; witness = the column.

**Q2 (the 4th site) — good catch, approved.** A DTO `insertable` that disagrees with the API's `NO_OWED_SESSION`
gate is a latent support bug; both now ask the same question against `planSize`.

**Q1 (the backfill) — your choice is right, and I checked it against the alternative.** I considered
`prior = size − liveCount` (correct for imports attended-since); it's **worse**, because on an already-phantom'd
course it yields `prior=0` ⇒ `planSize=size` ⇒ **the give-away continues** — the exact harm this REQ exists to stop.
`prior = used_sessions` gives phantom'd courses `planSize` = the real remainder (give-away stopped, cancel-guarded);
the milder attended-since **under-append** is the price, and **TASK-166 flags it in both directions** for owner
correction with his data (req 6). Correct priority: stop the give-away first, never silently-and-invisibly wrong.
- ⚠️ **Sequencing note for @Porter:** run TASK-166 and correct the flagged imports **before** an affected family
  takes a leave, so no under-append is ever served. And a minor known consequence of the cancel guard: a leave
  *reversal* on an import may leave an un-trimmed make-up (flagged by TASK-166, owner trims) — it errs toward
  not-deleting, which is req 6's intent.

**Verdict: DONE.** The lesson give-away is stopped for every course going forward; existing exposure is measured by
TASK-166, not guessed.
- Assignee: @Jason (BE)
- Repo: **smart-scheduler-back**. 🔴 **HIGHEST — live defect that gives away lessons.** Money/plan-sensitive.

## The defect (confirmed in code)

`reconcileCoursePlan` (`:1546`) calls `planCourseMoves(rows, course.size)` — `rows`=the 6 remaining bookings of an
imported 10/4 course, `size`=10 ⇒ `need=4` ⇒ appends 4 phantoms + the real leave's make-up = **5 free sessions**.
Same wrong baseline in `owedCount` (`:1277`) and `insertable` (`:1270`). `importCoursePackage` itself is correct and
must not change.

## What to build

1. **Migration:** add `coursePackages.priorSessions` (int, NOT NULL, default 0) — sessions taught **before** import,
   immutable. Hand-authored + journal-registered (this repo's rule), `sid` first.
2. **Set at import:** in `importCoursePackage`, `priorSessions = <the usedSessions it is given>`. SALE
   (`createCoursePackage`) leaves it 0.
3. **Use `planSize = size − priorSessions` in the three plan-responsibility sites — and ONLY those:**
   `reconcileCoursePlan` → `planCourseMoves(rows, planSize)`; `owedCount: max(0, planSize − current)`;
   `insertable: canInsert(planSessions, planSize)`. **Keep `course.size` for quota / label / expiry** (they are
   about the purchase and are already correct).
4. 🔴 **Cancel guard (requirement 6 — do not auto-delete a family's sessions):** the reconciler must **never cancel a
   pre-existing COURSE_PACKAGE session to shrink a plan down to `planSize`.** SALE never reaches `current > planSize`
   (prior=0 ⇒ planSize=size ≥ current); an already-affected import (phantoms already scheduled) has
   `current > planSize` — those phantoms are surfaced by TASK-166 and the **owner** decides, not the reconciler.
   Whatever shape you choose (guard the cancel branch for this case, or scope the reconcile), the invariant is: **no
   automatic cancellation of existing sessions as a side effect of this fix.**
5. **Backfill:** SALE → 0 (default). IMPORT → `priorSessions = usedSessions` (correct where no remaining session has
   been attended since import — a leave doesn't move `usedSessions`). Do **not** rewrite any plan; TASK-166 reports
   the exceptions.

## Definition of Done
- [ ] **AC-1:** imported 10/4, one leave ⇒ **exactly one** EXTENDED session (not 5).
- [ ] **AC-2:** that course's `owedCount` = 0 (`planSize − current` = 6 − 6).
- [ ] **AC-5 (🔴 the regression):** a SALE 10-session course with 3 attended ⇒ reconcile appends **nothing** and
      cancels **nothing**. Test explicitly — this is how a fix here goes wrong.
- [ ] **AC-6:** leave / make-up / extension-ceiling / `plannedAtCreation` (REQ-045) all behave as today on normal
      courses.
- [ ] Cancel guard: an already-affected import (current > planSize) reconciling ⇒ **no session cancelled** (test).
- [ ] Migration applies `sid` first; `priorSessions` set at import, 0 for SALE, backfill as above.
- [ ] `bunx tsc --noEmit` 0 · `bun test` green. You run **nothing** against a DB (owner runs the migration).

## Notes / Questions
(Jason fills in. Keep the plan-move logic in the pure `course-plan.ts` where it is; this task changes only *what
number* the reconciler is handed, plus the cancel guard. `size` stays the purchased size everywhere else.)

## Implementation Notes
**Files:** `drizzle/0021_course_prior_sessions.sql` (new) · journal idx 21 · `lib/migration-witness.ts` ·
`db/schema.ts` · `lib/course-plan.ts` (`coursePlanSize`, `withholdImportCancels`) ·
`services/scheduler.service.ts` (import write + **4** call sites) · `lib/course-plan.test.ts` (+14).

**1. `0021`** — `prior_sessions int NOT NULL DEFAULT 0` + a back-fill `UPDATE … WHERE source='IMPORT' AND
prior_sessions = 0` (guarded so a re-run can't compound). The default is what makes every SALE course — and
every future one — correct with no back-fill at all. Witness = the column (one ADD + one UPDATE in one
transaction, so the column existing means the back-fill ran).

**2. The fix is one argument.** `coursePlanSize(course) = max(0, size − priorSessions)` replaces `course.size`
at the plan-responsibility sites. The comment at the reconciler says plainly that this argument *is* the defect.

**3. 🔴 There were FOUR sites, not three.** Besides the reconciler, `owedCount` and the DTO's `insertable`, the
**server-side insert gate** (`NO_OWED_SESSION`, ~`:1761`) asks the same question with `canInsert`. Left alone, an
imported course would have shown a disabled Insert while the API allowed it — or the reverse. Same number, both
sides. Everything else keeps `course.size`: quota, label, expiry, `buildCourseHistory`'s `remaining` are all
about the **purchase** and were already right.

**4. AC-5 is guaranteed by construction and asserted anyway.** `priorSessions` is immutable and
attendance-invariant, so no amount of attendance can move a SALE course's target — there is a test that loops
attendance 0→10 on a SALE 10-session course and asserts the plan is empty every time. The `size − usedSessions`
trap you flagged is exactly what that loop would catch.

**5. §6 cancel guard** — `withholdImportCancels` drops the cancel list for any course with `priorSessions > 0`
and returns it as `withheldCancelIds` (logged as a warning, reported by TASK-166). Scoped to imports so the
normal trim-an-appended-EXTENDED path is untouched on every SALE course; an import could never shrink before
this fix either, so nothing that worked stops working.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **697 pass / 0 fail** (+14 here). ⚠️ **I ran nothing against
a database.** **Owner-run: `0021`, `sid` first.** Until it is applied, `prior_sessions` is absent and every
course reads as SALE — i.e. exactly today's (buggy) behaviour for imports, not a crash.

**DoD:** AC-1 one leave ⇒ exactly one appended session, with the old 5-append behaviour asserted alongside as the
record of the bug ✅ · AC-2 `owedCount` 0 ✅ · **AC-5** appends nothing / cancels nothing, from every angle ✅ ·
AC-6 leave / make-up / ceiling / `plannedAtCreation` untouched (whole suite green) ✅ · cancel guard tested ✅ ·
set at import, 0 for SALE, back-filled ✅.

## Questions
- Q1: the back-fill takes `prior_sessions` from `used_sessions`, as specced. Where a session has been attended
  **since** the import, `used_sessions` has already grown, so `prior_sessions` comes out too high and that course
  will quietly **under-append** its next make-up — the opposite failure, and a silent one. I did **not** invent a
  cleverer derivation (every alternative I tried keys off the current plan, which is what the phantoms have
  already corrupted). Instead **TASK-166 reports both directions**, so those courses land in the same list. If
  the owner can tell us which imports have had attendance since, the correction is a one-line UPDATE — but that
  is his data, not our inference.
- Q2: I changed the **fourth** site (the server-side insert gate) on my own judgement, since a DTO that disagrees
  with its own API is a bug waiting for a support call. Flagging it because it is outside the three you listed.

  > answer: (Sober)
