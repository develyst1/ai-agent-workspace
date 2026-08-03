# TASK-096: scheduling (BE) — `orphaned_sessions` attention check (10th check)
- Source: SPEC-028 §7.5 (REQ-030 — owner "living plan" sanity-check found a real gap)
- Status: REVIEW (independent — no deps)
- Depends on: none
- Assignee: @Jason (smart-scheduler-back)

## Why
A future course session whose teacher is later **archived** or **stops working that weekday** is orphaned — and
today **nothing surfaces it** (the attention registry has 9 checks, none for this). It sits silent until someone
notices. The re-planning to fix it already exists (the editor); the **detection** does not.

## What to build
Append **one** entry to `ATTENTION_CHECKS` in `lib/attention.ts` (the registry is explicitly "add a check = append
one entry") + a pure predicate + a loader:
- **Predicate `isOrphanedSession(booking, teacher, today)`**: `booking.status ∈ {PENDING, CONFIRMED, EXTENDED}`
  **and** `booking.date >= today` **and** (`teacher.archived === true` **or**
  `!teacherWorksOnDay(teacher.workDays, weekdayOf(booking.date))`).
- Registry entry `key: "orphaned_sessions"`, `namesPeopleInDigest: true` (time · student nickname · teacher), so it
  flows into the 08:00 LINE digest and the web panel for free.
- Loader: future bookings (`date >= today`) with their teacher joined.

## Definition of Done
- [x] Predicate pure + unit-tested (archived teacher; teacher no longer works that weekday; past sessions excluded;
      delivered/cancelled excluded).
- [x] Appears in `GET /api/attention` and the LINE digest (counts + names, per the privacy pattern).
- [x] `bunx tsc --noEmit` clean; `bun test` green.

## Implementation Notes
The registry's "add a check = append one entry" held — one predicate + one registry entry + one loader + one
i18n key. No schema change.

- **Pure `isOrphanedSession(booking, teacher, today)`** in `lib/attention.ts`: LIVE (`PENDING/CONFIRMED/EXTENDED`)
  **and** `date >= today` **and** (`teacher.archived === true` **or** `!teacherWorksOnDay(teacher.workDays, weekdayOf(date))`).
  Reuses the existing `teacherWorksOnDay` + `weekdayOf` (no re-derived weekday rule). `null` teacher → not counted.
- **Registry entry `key: "orphaned_sessions"`, `namesPeopleInDigest: true`** (time · student nickname · teacher
  nickname) — flows into the 08:00 LINE digest + web panel for free. Owner-approved to name people (SPEC-028 §7.5).
- **Loader `orphanedCandidates()`** in `attention.service.ts` (memoised): future bookings (`date >= today`) with
  `student`+`teacher` joined.
- **i18n `att_orphaned_sessions`** (TH/EN) in `line-i18n.ts` — so it renders in both the API and the per-recipient digest.
- **Updated 2 registry meta-tests** that hardcoded the counts (they're the "one per task" extensibility evidence):
  `ATTENTION_CHECKS` length 9→**10**, and the named-people set now includes `orphaned_sessions` (a deliberate 3rd
  per §7.5, not a privacy regression — the owner approved naming here so an admin can act on the disrupted plan).

**Verification**
- `bunx tsc --noEmit` clean; `bun test` → **408 pass / 0 fail** (added `attention.orphaned.test.ts`, 7 cases:
  archived → orphaned, off-that-weekday → orphaned (weekday computed from the date so it's convention-robust),
  works-that-day → not, past excluded, today counts, delivered/cancelled/sick excluded, null-teacher excluded).
  The wiring into `GET /api/attention` + the digest is by registry membership (asserted) + memoised loader; the
  live DB query is by inspection (brownfield).

## Questions
(Jason asks; Sober answers as `> answer: ...`)

- None. Note: I made `orphaned_sessions` the **3rd** `namesPeopleInDigest` check per §7.5 and updated the
  "exactly two may name people" privacy meta-test accordingly — flag if you'd rather it be counts-only in the
  LINE digest (names still in the web panel) to keep the digest's named-set at two.
  > **answer (Sober): keep it named.** Same sensitivity + actionability as `unconfirmed_bookings` (which already
  > names time·student·teacher in the digest): an orphaned session needs the admin to know *which* one to reassign;
  > a bare count forces a login to act on a time-sensitive break. Rare → short list. Changing the meta-test from
  > "exactly two" to the current named-set is correct — the rule is "only actionable per-session checks name
  > people", not a magic number.

## Review
**Verdict: DONE ✅** — Sober, 2026-08-03 (code-verified). Read the predicate + registry entry, ran the suite:
`bunx tsc --noEmit` exit 0 · `bun test` **408/0** (`attention` **29/29**, +7 predicate cases).
- **`isOrphanedSession` correct** (`attention.ts:111`): LIVE + `date >= today` + teacher present + (`archived` OR
  `!teacherWorksOnDay(workDays, weekdayOf(date))`). **Reuses** the works-that-weekday rule — no re-derivation (the
  drift the registry warns against). Null-teacher → false (correct).
- **10th registry entry** wired (`namesPeopleInDigest: true`, i18n title, memoised loader) → `GET /api/attention`
  + 08:00 digest by membership. Digest-naming is right (Q answer).
- Weekday from the date (convention-robust); past/delivered/cancelled/sick excluded — pinned by the tests.
- Closes the "living plan" detection gap; the re-plan side already exists (the editor). **DONE.**
