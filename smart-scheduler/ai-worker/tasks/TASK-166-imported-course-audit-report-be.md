# TASK-166: Read-only audit of imported courses vs their remaining count (REQ-064 AC-7 / Q2) (scheduler-back)

- Source: SPEC-060 (REQ-064) — requirement 6 / AC-7 / Q2.
- Status: REVIEW (Jason 2026-08-22). Next step: @Sober
- Assignee: @Jason (BE)
- Repo: **smart-scheduler-back**. **READ-ONLY** — report only, no writes. Sizes the cleanup for the owner.

## Why
16 imported courses are live on `uat`; some may already carry invented EXTENDED sessions from a leave taken before
TASK-165. Requirement 6: **report them, the owner decides — nothing deleted without him.** This also answers Q2
(how many are affected), which decides whether the cleanup is a 5-minute chat or real work.

## What to build
A read-only report (owner-run script or an attention check — SA's call; a script is simplest for a one-off audit)
that lists every `source = IMPORT` course where **live COURSE_PACKAGE booking count ≠ `size − priorSessions`** — i.e.
the plan holds more (phantoms) or fewer sessions than it should. Per course, print: id, student (nickname only —
PII), `size`, `priorSessions`/`usedSessions`, live count, the delta, and what it would take to correct (how many
phantom EXTENDED to remove) — **as information, not an action.**
- **Console = counts + nicknames only** (no full names/phones); a named per-course line may go to gitignored
  `project-docs/` like the other audits.
- **No writes, no `--commit`.** This tool never changes a plan.

## Definition of Done
- [ ] Lists each affected IMPORT course with the delta and the suggested correction; writes nothing.
- [ ] A clean import (live count == size − priorSessions) does not appear.
- [ ] Pure filter unit-tested; `bunx tsc --noEmit` 0 · `bun test` green.
- [ ] **Give Porter the query/command; the owner runs it** (team never touches the DB). The count of affected
      courses is what Porter relays to the owner for the requirement-6 decision.

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-22).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **697/0** (audit 9/0).
Pure `auditImportedCourses`: `planSize = max(0, size − priorSessions)`, `delta = liveCount − planSize`, direction
over/under. Reviewed the two things that matter:
- **Reports BOTH directions** — "over" (phantoms, the give-away) **and** "under" (the plan is short), which is
  exactly the TASK-165 Q1 catch-net for a mis-backfilled `priorSessions`. Nothing silently wrong goes unlisted.
- **Req-6-safe suggestions** — where the over-excess is all appended EXTENDED, it says removing that many would
  square it; **where the excess exceeds the appended rows, it sends the course to a human** rather than proposing a
  removal, because the surplus could be hand-placed/delivered sessions. "Information, not an instruction" — a line
  implying real sessions could be deleted would be the most dangerous line in the report; it isn't there.
- Counts with the engine's own `courseCurrent` (SPEC-033 extra excluded), so it can't disagree with the reconciler.
  Read-only, no `--commit`; PII = counts-only console + nickname report to gitignored `project-docs/`.

**Verdict: DONE.** The console's `ผิดปกติ: N` is Q2's answer — the count that sizes the requirement-6 cleanup for
the owner. @Porter relays the command; owner runs it (needs `0021` first, `sid` before `uat`).

## Notes / Questions
(Jason fills in. Depends on TASK-165's `priorSessions`. This only *measures*; correcting any course is a separate,
owner-authorised step per requirement 6.)

## Implementation Notes
**Files:** `lib/import-course-audit.ts` (new, pure) · `lib/import-course-audit.test.ts` (9) ·
`scripts/audit-imported-courses.ts` (new) · `package.json` (`courses:audit-imports`).

**Read-only with no `--commit`, deliberately** — and the header says why: every course it lists belongs to a
family that has been told when their child's lessons are. There is no code path in this script that writes to
the database.

**It counts with `courseCurrent`, the reconciler's own counter**, not a hand-rolled status filter. An audit that
counted differently from the engine would report faults that aren't there and miss the ones that are, and it
inherits the SPEC-033 rule that a soft-linked single-session extra never counts.

**Reports BOTH directions, which is the part I'd most like reviewed.** "Over" is the give-away (phantoms).
"Under" and the over-by-N-with-no-EXTENDED shape are the *silent* failure — a course whose `prior_sessions` came
out too high (TASK-165 Q1) will under-append its next make-up and nothing anywhere says so. Where the excess is
more than the appended EXTENDED rows, the suggestion says **a human must look** rather than proposing a removal:
the surplus is then hand-placed or delivered sessions, and a line implying those could be deleted would be the
most dangerous line in the report.

**PII:** console prints counts only (total imports · affected · over/under · total phantom sessions). The
per-course lines carry a **nickname only** and go to gitignored `project-docs/imported-course-audit.txt`.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **697 pass / 0 fail** (+9 here). I ran nothing against a DB.

**For @Porter — this is the command for the owner (needs `0021` applied first, `sid` before `uat`):**
```
bun run courses:audit-imports
```
The console's `ผิดปกติ: N` is the answer to Q2 — it sizes the requirement-6 cleanup. The named report stays on
his machine.
