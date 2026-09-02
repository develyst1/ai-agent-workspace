# TASK-236: BE — DEF-3: the bookings list COUNTS อื่นๆ rows and then throws them away

- Source: REQ-078 **DEF-3** (Tanya, `tests/TEST-064`) · SPEC-070
- Status: ✅ DONE — code (Sober 2026-09-01) · re-test = @Tanya
- Depends on: none. Repo: **smart-scheduler-back**, on `develop`. Assignee: **@Jason**

## Root cause — found, not guessed (`scheduler.service.ts:765-783`)

`getBookings` runs **two** queries:

```ts
const rows = await db.select({...}).from(bookings)
  .innerJoin(students, eq(students.id, bookings.studentId))   // :768  ← drops every อื่นๆ with no student
  .innerJoin(teachers, eq(teachers.id, bookings.teacherId))   // :769  ← fine, teacher is still NOT NULL
  .innerJoin(subjects, eq(subjects.id, bookings.subjectId))   // :770  ← drops every อื่นๆ (no program)
  ...
const [{ value: total }] = await db.select({ count(*) }).from(bookings).where(cond);  // :779 — NO joins
```

**The count query has no joins; the rows query has two inner joins on columns `0029` made nullable.** So the
page says *"2 found"* and renders **zero rows** — exactly Tanya's DOM evidence.

📌 **And the comment directly above it is now false:** *"Pure sort: nothing is filtered out, so `total` still
matches the filtered set in every direction."* It was true when written. **Fix the comment with the code** — a
comment asserting an invariant the code no longer holds is worse than none (TASK-223's lesson).

## What to do

1. **`innerJoin` → `leftJoin` for `students` and `subjects`.** `teachers` stays inner — `teacher_id` is still
   `NOT NULL` and an inner join there is a real integrity assertion, not an accident.
   `toBookingDTO` already handles `student: null` / `subject: null` (TASK-224), so nothing downstream changes.
2. 🔴 **Sweep for the same shape.** `0029` made two long-standing NOT NULL columns nullable, and **every
   `innerJoin` on `bookings.studentId` / `bookings.subjectId` anywhere in the repo is now a silent row-dropper.**
   Enumerate them from the code — do not trust this task's list — and say in your notes what you found and what
   you changed. The calendar was fine because it uses the relational reader; the risk is the hand-written
   `select().from(bookings).innerJoin(...)` shape.
3. **The `q` search path** (`:744-762`) resolves `studentIds` / `subjectIds` and ORs them. An อื่นๆ booking
   matches neither. **Decide and state it:** searching by a typed **title** is not in REQ-078's ACs, so leaving
   it out is defensible — but *"searched and not found"* and *"cannot be searched"* look identical to staff.
   If you leave it, put the reason on the line.

## Definition of Done — the OUTCOME
- [ ] All bookings → Type = **Other** shows **the rows it counts**. `total` and `items.length` agree on every
      filter combination (assert both an อื่นๆ **with** a student and one **without**).
- [ ] A booking with **no program** and one with **no student** both appear.
- [ ] **Regression:** the four existing types' list, counts, ordering and paging are **unchanged** — the
      existing `search-paging` tests still green.
- [ ] The false comment at `:773` is corrected, not left.
- [ ] Every other inner-join-on-a-nullable-booking-column found in the sweep is listed in your notes.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun test` green. **No migration.** 🚫 No DB run.

## Implementation Notes (Jason, 2026-09-01)
| | |
|---|---|
| Repo | `H:\scheduler\smart-scheduler-back` — the `machine.local.md` row |
| `git rev-parse HEAD` | `07dac42` (tree was clean when I started) |

🔴 **No migration** (`drizzle/*.sql` = 30 = journal tags). Three files.

### The fix
`students` and `subjects` → **`leftJoin`**. `teachers` stays **INNER** on purpose — `teacher_id` is still
`NOT NULL`, so that one is a real integrity assertion, not an accident of symmetry.

**The generalisation, written at the site:** *a join is a FILTER the moment its column can be null.* That is the
sentence I would want the next person to find, not "we changed two joins".

### 🔎 THE SWEEP — every `innerJoin` in `src/` and `scripts/`, and my verdict on each

| Site | Joins on | Verdict |
|---|---|---|
| `scheduler.service.ts:768` `students` | `bookings.student_id` | 🔴 **THE DEFECT — fixed** |
| `scheduler.service.ts:770` `subjects` | `bookings.subject_id` | 🔴 **THE DEFECT — fixed** |
| `scheduler.service.ts:769` `teachers` | `bookings.teacher_id` | ✅ safe — still `NOT NULL`; kept INNER deliberately |
| `scheduler.service.ts:439` `boItem` | `boMovement.item_id` | ✅ safe — `NOT NULL`, not a booking column |
| `sale-post.ts:289` `boItem` | `boMovement.item_id` | ✅ safe — same |
| `badge.service.ts:176–178` | `bookingBadges.booking_id` / `badge_value_id` / `badge_type_id` | ✅ safe — all `NOT NULL`, none is a nullable booking column |
| `badge.service.ts:193–195` | `bookingBadges.booking_id`, **`bookings.teacher_id`**, `badge_value_id` | ✅ safe — `teacher_id` is still `NOT NULL`. **This is the one I checked hardest**: it is the only other place that inner-joins *through* `bookings`, so an อื่นๆ booking with badges does appear in the badge report. |
| `parent.service.ts:348` `parents` | `students.parent_id` | ✅ safe here **and deliberately inner** — its own comment explains it builds a set to EXCLUDE, so dropping the null side is the intent |
| `search.queries.ts:56, 83` `students` | `vouchers.student_id` | ✅ safe — `.notNull()` (schema `:320`) |
| `search.queries.ts:44, 73` `students` | **`coursePackages.student_id`** | ⚠️ **PRE-EXISTING row-dropper — NOT touched.** See below. |

**Nothing else in the repo inner-joins a nullable booking column.** `0029`'s blast radius in this shape was
exactly the two lines Tanya found, and I could not find a third.

### ⚠️ The one thing the sweep found that I did NOT fix, and why
`coursePackages.student_id` is **nullable** (schema `:262` — no `.notNull()`), and `courseSearchQuery` /
`courseCountQuery` inner-join `students` on it. **A course with no student is invisible to search, and its count
and rows can disagree — the same defect shape as DEF-3.** It is **not** caused by `0029` (that column has always
been nullable) and the state is reachable: `addExtraSession` refuses with *"คอร์สนี้ไม่มีนักเรียนที่ผูกไว้"*,
which is a guard written for a case that exists.

**I left it alone.** It is outside REQ-078, it changes a search path Tanya is not testing, and touching it during
a `TEST_FAILED` blocker would put an unrelated regression risk into the release. **Flagging it, not fixing it —
your call whether it is a task.**

### 🔴 The SECOND defect the sweep turned up, and this one I did fix
The hand-built row at `:788` carries only the aliases listed in its `select()` — and `additionalTeachers` was
**not** among them. The relational reader loads it via `withBookingRelations`, so **the calendar and the check-in
screen show every teacher of an อื่นๆ booking while the bookings list showed one.** Not an inner join, but the
identical failure: a hand-written `select()` drifted from what the DTO now expects.

Fixed with a batched loader (`additionalTeachersByBooking`), one query per page, shaped so `toBookingDTO` cannot
tell it from the relation. **I took your "say what you found **and what you changed**" as authorising the fix in
the function I was already repairing** — if you would rather it were a separate task, it is one self-contained
block plus its tests.

### The `q` search — my decision, and the reason is on the line
**I added the title to the OR.** An อื่นๆ booking has neither a student nor a program, so without it the row
matches **nothing** — and *"searched and found nothing"* is indistinguishable from *"cannot be searched"* to the
person typing. It is one `ilike` on a column already in the table: **no second query, no new index**, and
`other_title` is null for all four lesson types so the clause can never match one. You framed it as mine to
decide; that is the decision and the reasoning is at the site.

### 📌 The comment trap caught me again, in my own replacement
My first draft of the corrected comment **quoted the retired sentence** while explaining it — and the test I had
just written failed on my own text. Same lesson as TASK-223, and I walked into it a second time: the old wording
must be absent from the file **entirely**, not even as a quotation, or a grep hands the next reader the retired
claim out of context. Reworded; the test now guards it.

### Verified
```
bunx --package typescript@5.6.3 tsc --noEmit   → exit 0
bun test                                        → 1072 pass / 0 fail (+14)
```

### 🚫 What is NOT proven by me
**That the page now renders the rows it counts.** That is a query against real data — Tanya's, on `sid`. What I
can show is that the joins no longer filter (the emitted SQL is asserted: `left join` vs `inner join`), that
`total` and the row set are narrowed by `cond` alone, and that the DTO handles both shapes. The DoD's first two
boxes are behavioural and belong to the re-test.

## Questions
- **Two things I changed beyond the literal DoD — both found by the sweep you asked for, both easy to revert.**
  I read *"say what you found **and what you changed**"* as authorising a fix for what the sweep turned up in the
  function I was already repairing. If either should have been a separate task, say so and I will split it:
  1. **`additionalTeachers` on the bookings-list row** — the list showed one teacher for a multi-teacher อื่นๆ
     booking while the calendar showed all of them. Same root cause as DEF-3 (hand-built `select()` drifted from
     the DTO), and Tanya is re-testing REQ-078 right now, so leaving it would very likely have come back as a
     new defect on the next pass.
  2. **The title in the `q` search** — you framed this as mine to decide, so it is decided and reasoned at the
     site; I am listing it here only so the change is not discovered in review.

- ⚠️ **`coursePackages.student_id` is nullable and `courseSearchQuery` inner-joins on it — the same defect shape,
  pre-existing, and I did NOT touch it.** (`search.queries.ts:44` and `:73`; schema `:262` has no `.notNull()`.)
  A course with no student is invisible to search, and its count and rows can disagree exactly as the bookings
  list did. The state is reachable — `addExtraSession` refuses with *"คอร์สนี้ไม่มีนักเรียนที่ผูกไว้"*, a guard
  written for a case that exists. **Out of REQ-078, and I would not put an unrelated search regression into a
  `TEST_FAILED` release.** Your call whether it is a task.

- **A question about `total` I could not settle from the code alone, and would rather you rule on than guess.**
  The count query has no joins, so `total` is now *"every booking matching `cond`"*. That is right and it is what
  makes the page consistent. But it also means a booking whose **teacher** row is somehow missing would be
  counted and not rendered — the INNER join on `teachers` that I deliberately kept. It cannot happen today
  (`teacher_id` is `NOT NULL` with an FK), so this is not a defect; **it is the one remaining way the two
  queries could ever disagree**, and I would rather it be a stated decision than a thing someone rediscovers.
  If you want them provably identical, the count query would need the same `teachers` inner join.

## Review
(Sober fills this in at REVIEW.)

## Review — Sober, 2026-09-01: ✅ **PASS.** The sweep found more than the defect, which is why it was the sweep.

**Reproduced:** `tsc --noEmit` → **0** · `slot-clash` + `search-paging` + `other-booking` → **51 pass / 0 fail** ·
`scheduler.service.ts:784` `leftJoin(students)` · `:788` `leftJoin(subjects)` · `:787` `innerJoin(teachers)` kept.

📌 **"A join is a FILTER the moment its column can be null" is the right sentence to leave behind**, and putting
it at the site rather than in the task is what makes it survive. Keeping `teachers` INNER **deliberately**, and
saying why, is the other half: the fix is not "we changed the joins", it is "we changed the two that became
filters".

### The second defect the sweep found — ✅ right to fix it, and right to tell me

`additionalTeachers` missing from the hand-built `select()` at `:788` is **the same root cause wearing different
clothes**: a hand-written projection drifting from what the DTO now expects. The calendar showed three teachers
and the list showed one. **You were repairing that exact function, Tanya is re-testing REQ-078 right now, and
leaving it would have come back as a fresh defect on her next pass** — fixing it there was correct, and listing
it in §Questions instead of letting me find it is what makes that call reviewable rather than a surprise.

**The title in `q`** — ✅ your decision, correctly reasoned at the site. *"Searched and found nothing"* and
*"cannot be searched"* are indistinguishable to the person typing, and `other_title` is null for all four lesson
types so the clause cannot touch them. One `ilike`, no second query. Keep it.

📌 **The comment trap catching you a second time, in your own replacement, is worth the paragraph you gave it.**
The retired wording must be absent **entirely**, not present as a quotation explaining itself — because a grep
hands the next reader the retired claim without the explanation attached. That you walked into it again after
TASK-223 is exactly why the test is the right response and a resolution is not.

### `coursePackages.student_id` — ✅ flag-not-fix was right, and it is now a task

Same defect shape (nullable column, inner-joined by `courseSearchQuery`/`courseCountQuery`, count and rows can
disagree), **not** caused by `0029`, and the state is reachable — `addExtraSession` refuses with
*"คอร์สนี้ไม่มีนักเรียนที่ผูกไว้"*, which is a guard someone wrote for a case that happens. **Touching an
unrelated search path inside a `TEST_FAILED` blocker would have been the wrong trade** and you made it correctly.
⇒ **TASK-240 cut, TODO, not in this release.** It is written down where it cannot be lost, which is the point of
flagging it.

**Status → DONE (code).** *"The page renders the rows it counts"* is a real-data check and belongs to @Tanya's
re-test, as you said — what you could prove (the emitted SQL is `left join`, `total` and rows are narrowed by
`cond` alone, the DTO handles both shapes) you proved.
