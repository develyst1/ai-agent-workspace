# TASK-195: Compute course expiry on the IMPORT path + repair existing rows (FIX-007) (scheduler-back)

- Source: FIX-007 (owner 2026-08-25, Q1 answered 2026-08-28). 🔴 **HIGH** — it decides the `EXPIRED` status shipped
  2026-08-25 and blocks REQ-011 (Drop). BE-only; no schema change (repair is data, owner-run).
- Status: ✅ **BE DONE (Sober 2026-08-28)** — arithmetic corrected by TASK-197 (`(weeks−1)*7`); import path/guard/create-confirmation stood throughout. Repair un-held, release to owner via @Porter.
- Repo: **smart-scheduler-back**. On `develop` (canonical).

## Grounded scope correction — read before FIX-007's "one line" framing
I read the current tree (per the read-develop rule). FIX-007 says expiry is "taken, never computed... enforced
nowhere." **That is not what the code does now:**
- ✅ **`createCoursePackage` (`:1211`) ALREADY computes** `expiryDate: courseExpiry(input.startDate, input.size)`. The
  normal create path is correct — **AC-1 is already satisfied there; do not change it.** `previewCourse` (`:1569`) also
  computes. Confirm with a test rather than editing.
- 🔴 **The defect is ONLY `importCoursePackage` (`:1107`)** — `expiryDate: input.expiryDate` (taken). The comment at
  `:1080-1081` justifies it ("an imported course started months ago; computing would extend/shorten what they bought")
  — **that reasoning is now OVERRIDDEN by the owner's Q1** (compute from the *real* start). Delete the stale comment.
- ⛔ **`:1153` is `importVoucher`, NOT a course** — a voucher, whose expiry is the 3/6/9-month `voucherExpiry` rule,
  not `courseExpiry`. **FIX-007 mis-cited it. OUT of scope here** — Porter is flagged to get a separate owner rule for
  voucher-import expiry; do **not** touch `:1153`.

**So this task = fix the one import-course path + repair the data.** Enumerate the course-creation paths yourself from
`routes/api.ts` to confirm nothing else inserts `coursePackages` with a taken expiry (the TASK-185 lesson); I found
create (computes ✅), import (taken 🔴), preview (computes ✅) — verify.

## The fix (owner's rule, authoritative)
1. **Imported course expiry** — new helper, e.g. `importedCourseExpiry(firstRemainingSession, size, priorSessions)`:
   ```
   realStart  = firstRemainingSession − (priorSessions × 1 week)
   expiryDate = realStart + MAX_WEEK_BY_SIZE[size] weeks
   ```
   In `importCoursePackage`, `firstRemainingSession = input.startDate`, `priorSessions = input.usedSessions` (already
   stored as `priorSessions` at `:1103`). Replace `:1107` with this — **never `input.expiryDate`**.
2. **A leave never moves expiry** (AC-2) — it already doesn't (expiry is set once at creation); keep it that way, and
   the `EXTENSION_CEILING` refusal stays (AC-3).
3. **Confirm-by-test that `createCoursePackage` (`:1211`) computes `start + MAX_WEEK_BY_SIZE[size]`** for 4/6/10 → AC-1.
4. **Delete the stale assumption comment** at `lib/leave.ts:13` ("6→8 is an ASSUMPTION — confirm") — the owner derived
   all three from the same rule (FIX-007 table); it is confirmed.

## Repair (owner-run, dry-run FIRST, both boxes)
Recompute every course's `expiryDate` by its source: `IMPORT` → `importedCourseExpiry`; native → `courseExpiry`.
- 🔴 **The dry-run is the deliverable, not the UPDATE.** It must print, **by student name + both dates**: (a) every
  course whose expiry CHANGES, and (b) **separately, those that become `EXPIRED` on commit** (new expiry < today). The
  owner reads that list before a single row is written — a silent repair that expires live families is the worst way
  to be right (AC-8). PII → the gitignored `project-docs/` report + console counts, per the standing rule.
- Idempotent: re-running finds nothing to change (AC-6). Hand Porter the SQL/script for the owner; you run nothing.

## Acceptance Criteria (FIX-007 AC-1…AC-8)
- [ ] AC-1 new 4/6/10 course on day D expires D + 5/8/13 weeks (already true on create — test it).
- [ ] AC-2 a leave doesn't change `expiryDate`. AC-3 no live session schedulable past expiry (ceiling refusal fires).
- [ ] AC-7 imported course: `expiry = (firstRemainingSession − priorSessions weeks) + MAX_WEEK_BY_SIZE[size] weeks`.
- [ ] AC-8 dry-run lists every changed course + separately the newly-`EXPIRED`, by name + both dates; nothing commits
      until the owner reads it. AC-4 after repair, **no course has a live session dated after its `expiryDate`** (one
      query, both boxes) — **flag, don't silently accept**, any course whose last live session exceeds the new expiry.
- [ ] AC-6 re-running the repair changes nothing. AC-5 `uat`'s `Expired (2)` is re-checked against the fixed expiry and
      confirmed or reclassified, reason written.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun test` green. Pure helpers unit-tested. No migration.

## Notes / Questions
(Jason fills in. `importedCourseExpiry` and `courseExpiry` are pure — unit-test the owner's worked example: 10-session,
4 prior, first-remaining 5 Feb → realStart 8 Jan → expiry ≈ 9 Apr. AC-4 is where a manually-moved session could sit
past a correctly-computed expiry — surface those in the dry-run for the owner, don't move or hide them.)

## Implementation Notes
**Files:** `lib/recurring.ts` (`importedCourseExpiry`) · `lib/recurring.test.ts` (+6) · `lib/leave.ts` (the
assumption comment) · `services/scheduler.service.ts` (import path + its note) ·
`lib/expiry-repair-plan.ts` + `.test.ts` (new, 10) · `scripts/repair-course-expiry.ts` (new) · `package.json`.
On **`develop`** (I switched to it before starting — `dong` was at the same commit).

**Your scope correction verified independently.** I enumerated every `insert(coursePackages)` in the tree
rather than trusting the list: **two** in services — import (`:1099`, was taken 🔴) and create (`:1210`,
already computes ✅) — plus `db/seed.ts` (dev fixture, not a production path). `previewCourse` computes.
**`:1153` is `importVoucher` and I did not touch it.** So AC-1 is confirmed-by-test, not edited.

**The rule is one rule with two entry points**, and the test says so as an identity rather than repeating the
arithmetic: `importedCourseExpiry(first, size, prior) === courseExpiry(first − prior weeks, size)`. If those
ever disagree, that is the bug. The owner's worked example is pinned (10 · 4 prior · 5 Feb → **9 Apr**), and so
is the case that shows *why* it matters: **a course imported near its end now expires sooner than a naive
start+ceiling** — taking a typed-in date, or counting from the first remaining session, would both have handed
that family a fresh 13-week window they never bought.

**The `6→8` caveat is deleted, with its history in the replacement comment.** It had been quoted as doubtful
since week one; the owner derived all three ceilings from one table, so a softened warning would just cost the
next reader another investigation. 📌 **Same stale line still lives in `H:\scheduler\CLAUDE.md` and
`smart-scheduler-back/CLAUDE.md`** ("the 8 is an assumption — verify the real rule before relying on it") —
those are the owner's docs, so I have **flagged rather than edited** them. Worth one line from whoever owns them.

### The repair — the dry-run list IS the deliverable
`course:repair-expiry`, dry-run by default, one transaction, rolled back unless `--commit`. It recomputes by
source (IMPORT → reconstructed start; native → its own start) and reports three sections, **the flip list
first**:
1. 🔴 **courses that become `EXPIRED` the moment it commits** — by nickname, with both dates.
2. courses whose expiry moves but stay active.
3. ⚠️ **AC-4:** courses whose last LIVE session sits *after* the corrected expiry — **flagged, never moved**.
   Someone put that session there by hand for a reason this tool cannot know.

"Newly expired" deliberately means **the status flips**, not merely that the date moved earlier — a course
already past its old expiry is not news, and burying the real cases in it would defeat the list. Console is
counts only; the by-name report goes to gitignored `project-docs/`. AC-6 has its own test: re-planning over
repaired data yields zero changes.

**Verified:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun test` **831 pass / 0 fail**. No
migration. ⚠️ **I ran nothing against a database** — the repair's SQL is un-exercised until the owner's dry run.

**DoD:** AC-1 confirmed by test (create already correct) ✅ · AC-2 expiry is a function of the start date alone
✅ · AC-3 ceiling refusal untouched ✅ · AC-7 owner's rule + worked example ✅ · AC-8 dry-run names the changed
and, separately, the newly-expired ⛔ owner-run · AC-4 flagged not hidden ✅ (surfaced; the check itself is the
owner's run) · AC-6 idempotence tested ✅ · **AC-5 (`uat`'s "Expired (2)") is un-answerable from here** — it
needs the dry-run output; it is the first question the report answers.

## Questions
- Q1: the repair rewrites **native** course expiries too (they should already be correct, so it ought to be a
  no-op there). I kept them in scope so the run *proves* it rather than assuming — but if the dry run shows
  native courses moving, that is a second defect and we should stop and look, not commit.
- Q2: the stale `6→8 assumption` line in both `CLAUDE.md` files — flagged, not edited (owner's docs).

  > answer: (Sober)
