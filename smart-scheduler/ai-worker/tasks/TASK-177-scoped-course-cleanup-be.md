# TASK-177: Scoped course cleanup — `course:cleanup` (REQ-057) (scheduler-back)

- Source: SPEC-062 (REQ-057). Owner-run, `sid` first. 🔴 **A delete tool on a LIVE box — dry-run-first, explicit id,
  refuse-not-warn.** No migration, no FE.
- Status: REVIEW (Jason 2026-08-23). Next step: @Sober → owner dry-run on sid
- Assignee: @Jason (BE)
- Repo: **smart-scheduler-back**.

## What to build
`scripts/cleanup-course.ts` → `"course:cleanup"`, house pattern (`db:reset` / `import:students`):

1. **`--course <id>` required — explicit id, NEVER a predicate** (no `--name`, no LIKE). Missing id ⇒ refuse.
2. **Dry-run by default:** in one tx, load the course + its student + parent + **every booking with its date**, run
   the refusal checks (below), **print the blast radius BY NAME** — student, parent, course, each booking as
   `25/8, 1/9, 8/9, 15/9` — then throw to ROLLBACK. Console only (owner's terminal); **never write a tracked file.**
3. **Refuse (not warn), before any delete, even with `--commit`** — stop with the reason named if ANY of:
   - a booking of the course has status **`ATTENDED`**;
   - a **posted sale**: `bo.movement` with `refType='SALE'` and `refId ∈ {course.id, its booking ids}`;
   - the parent is **LINE-linked** (`parents.line_user_id` not null);
   - the parent has **> 1 student**.
   🔴 **Do NOT refuse on `usedSessions > 0`** — for an IMPORT course that is the prior-taught count (REQ-064); the
   Test course has `usedSessions=4` and must stay deletable.
4. **`--commit`:** delete in one tx, explicit per table, FK order —
   **`DELETE bookings WHERE course_id = <id>`** (cascades `booking_badges`, set-nulls `notification_outbox`) →
   **`DELETE course_packages WHERE id = <id>`**. 🔴 `bookings.courseId` is `onDelete: set null`, so deleting the
   course alone would **orphan the bookings** — delete the bookings explicitly first. Never TRUNCATE CASCADE.
5. **Never touch** `subjects`, `teachers`, `bo.item`, other courses/bookings, or anything not reachable from the id.
   No DDL; schema + ledgers untouched.
6. **Student + parent STAY by default** (AC-2). Optional **`--remove-household`** also deletes the parent + its
   single student, **guarded**: only if the parent has exactly this one student, that student has **no other
   course/booking/voucher**, and the parent is not LINE-linked. Otherwise refuse the household removal (keep the
   course cleanup).
7. Pure decision helper (mirror `db-reset-plan`) so the refusal logic + the blast-radius computation are unit-tested
   without a DB.

## Definition of Done
- [ ] AC-1: dry-run prints the named blast radius + per-table counts, writes nothing.
- [ ] AC-3/AC-8: a course with an ATTENDED session / posted sale / LINE-linked parent / multi-child parent is
      **refused with the reason**, even with `--commit` — unit-test each. A `usedSessions>0` IMPORT course with none
      of those is **not** refused (the Test-course case).
- [ ] AC-2: `--commit` removes exactly the course + its bookings; student/parent/other courses/bookings untouched
      (assert by count). `--remove-household` removes the parent+student only under the guards.
- [ ] AC-4: re-run deletes 0. AC-5: no DDL, ledgers untouched. AC-10: counts drop by exactly the dry-run numbers.
- [ ] `bunx tsc --noEmit` 0 · `bun test` green. You run **nothing** against a DB — owner runs it, `sid` first.

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-23).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **731/0** (cleanup
plan 15/0). Read it — a delete tool judged by what it declines:
- **Pure `course-cleanup-plan.ts`, 15 tests** pin every refusal: the Test-course case (IMPORT, `usedSessions 4`,
  nothing attended) **passes**; `usedSessions>0` is **not** a refusal (even 9 — REQ-064 prior-taught); ATTENDED
  refuses **and names the date**; posted sale refuses; LINE-linked parent refuses; >1 child refuses; **all four
  reasons reported at once**; `--remove-household` refuses if the student owns anything else. Exactly the Q2 ruling.
- **Posted-sale checked against the course id AND every booking id** (course sale vs day-end revenue) — the right
  belt-and-braces, and it keeps mattering even though day-end hasn't run on `uat` yet.
- **The SET NULL trap is handled** (`scripts/cleanup-course.ts:135`): bookings deleted **explicitly and first**
  (comment names it), then the course; one tx, dry-run-rollback default; refusal throws inside the tx so `--commit`
  overrides nothing.
- Console-only, no report file; never touches subjects/teachers/bo.item/other rows; no DDL.
- ⚠️ The SQL itself is un-exercised until the owner's `sid` dry-run — stated honestly; the pure planner carries the
  safety and it's fully tested.

**Q1 (names vs nicknames) — use full NAMES, endorsed.** This is a **delete** tool; the owner must recognise the exact
household he is permanently removing, which nicknames can't guarantee. It's console-only on his own terminal (never a
tracked file), so the PII rule holds. Recognition is worth more than caution here.

**Verdict: DONE (code).** Owner runs it `sid` first, **dry-run → read the named blast radius → `--commit`.**

## Notes / Questions
(Jason fills in. The FK graph is settled in SPEC-062: only `booking_badges` (cascade) + `notification_outbox`
(set-null) hang off a booking; `bookings.courseId` is set-null so bookings must be deleted explicitly. The
`--remove-household` guard is what keeps "clean the fake household" from ever touching a real one.)

## Implementation Notes
**Files:** `lib/course-cleanup-plan.ts` (new, pure) · `lib/course-cleanup-plan.test.ts` (15) ·
`scripts/cleanup-course.ts` (new) · `package.json` (`course:cleanup`).

**The rules are in the pure file; the script only does IO.** All four refusals, the household guards and the
blast-radius computation are unit-tested without a database — a delete tool whose safety rules can only be
checked by running it is not a safe tool.

**Refuse, never warn — and `--commit` overrides nothing.** The refusal throws inside the transaction, so a
refused run rolls back on its way out rather than relying on an early return. **All reasons are reported at
once** (there is a test for it): the owner should not discover them one run at a time.

**`usedSessions > 0` is deliberately not a refusal**, with the reason written next to it — on an IMPORT course
that is REQ-064's prior-taught count, and the course he actually needs to delete has `usedSessions = 4`.
`ATTENDED` is the honest test for "something really happened here", and that is what's checked.

**Posted sales are checked against the course id *and* every booking id** — a course sale hangs off the course,
day-end revenue hangs off the booking. Checking only one would let a delete leave the books pointing at
something that no longer exists.

**FK order is the one thing that would silently do the wrong thing:** `bookings.course_id` is `SET NULL`, so
deleting the course first would **orphan** its bookings rather than remove them — they'd stay on the calendar,
detached, and the count would look right. Bookings go explicitly, and first.

**`--remove-household` is a separate decision** and its refusal blocks **only** the household part; the course
cleanup still runs. There's a test for exactly that, because "clean up the fake course" must never quietly grow
into "and delete a family".

**Console-only, no report file** — unlike the other audits. This one's output names a child and their parent,
and there is nowhere to write that which is worth the risk. The owner reads it in his terminal.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **731 pass / 0 fail** (+15). No migration, no FE.
⚠️ **I ran nothing against a database** — every test is against the pure planner, so the SQL itself is
un-exercised until the owner's dry run.

**DoD:** AC-1 named blast radius, writes nothing ✅ · AC-3/AC-8 all four refusals unit-tested, incl. the
`usedSessions>0` non-refusal ✅ · AC-2 course + bookings only, household behind its guards ✅ · AC-5 no DDL,
ledgers untouched ✅ · AC-4/AC-10 below ⛔ owner-run.

### For the owner (via @Porter) — `sid` first, dry run first
```
bun run course:cleanup --course <uuid>            # prints the blast radius, deletes nothing
bun run course:cleanup --course <uuid> --commit   # only after reading it
```
**AC-4 note:** a second `--commit` reports *"ไม่พบคอร์ส"* and exits non-zero. That is deliberate — it deleted
nothing, and a delete tool that says "done" when it did nothing is how you lose track of what you've run.

## Questions
- Q1: the dry run prints student and parent **names** to the terminal (that is the point — the owner must
  recognise the household before deleting it), but it means a paste of that output into chat would carry PII.
  Every other tool here prints counts only. I judged recognition to be worth it for a delete tool; say if you'd
  rather it printed nicknames only.

  > answer: (Sober)

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-177 | scheduler-back (BE): **REQ-057 scoped course cleanup** `course:cleanup --course <id>` — explicit id only (no predicate); dry-run-first prints blast radius BY NAME (student·parent·course·each booking+date) then rollback; `--commit` deletes bookings-then-course in one tx (bookings.courseId is set-null ⇒ must delete bookings explicitly; cascades badges, set-nulls outbox). **Refuse-not-warn** on ATTENDED / posted SALE movement / LINE-linked parent / >1 student (NOT usedSessions>0 = import-prior per REQ-064). Student+parent stay by default; `--remove-household` guarded. Never touch subjects/teachers/bo.item/other rows. Owner-run, sid first. Pure helper tested. | SPEC-062 (REQ-057) | ✅ **DONE (code) — SA-reviewed Sober 2026-08-23** — tsc 0 · 731/0 (plan 15/0). Pure planner pins all refusals (Test-course passes; usedSessions>0 NOT a refusal per REQ-064; ATTENDED/posted-sale/LINE-linked/>1-child each refuse + names; all reasons at once; household guard). SET NULL trap handled (bookings deleted first, explicitly). Console-only, no DDL, refuse-not-warn. Q1: full NAMES (delete tool, owner-run terminal). **Owner runs sid first: dry-run → read blast radius → `--commit`.** — _prior:_ 🔎 REVIEW (Jason 2026-08-23 — rules in a pure `course-cleanup-plan.ts` (15 tests, no DB): a delete tool whose safety rules can only be checked by running it is not a safe tool. Refusals **throw inside the tx** so a refused run rolls back on its way out, `--commit` overrides none of them, and **all reasons print at once** — the owner shouldn’t discover them one run at a time. `usedSessions>0` deliberately NOT a refusal (REQ-064 prior-taught; the Test course is 4) — `ATTENDED` is the honest test. Posted sales checked against **the course id AND every booking id** (course sale vs day-end revenue hang off different refs). 🔴 **FK order is the silent one**: `bookings.course_id` is SET NULL, so deleting the course first would **orphan** the bookings while the counts still looked right — bookings go explicitly, first. `--remove-household` is a separate decision whose refusal blocks only that part. Console-only, no report file: the radius names a child (Q1). tsc 0 · **731/0**. ⚠️ The SQL is un-exercised until the owner’s dry run on `sid`.) | Sober | |
```
