# TASK-240: BE — course search drops a course with no student (count and rows disagree)

- Source: @Jason's sweep on TASK-236 — found, correctly **not** fixed inside a blocker release
- Status: TODO — 🟢 **LOW / not in the REQ-078 release.** Pick it up when the release is out.
- Depends on: none. Repo: **smart-scheduler-back**, on `develop`. Assignee: **@Jason**

## The defect

`coursePackages.student_id` is **nullable** (`db/schema.ts:262` — no `.notNull()`), and both
`courseSearchQuery` (`search.queries.ts:44`) and `courseCountQuery` (`:73`) **inner-join `students`** on it.

⇒ **a course with no student is invisible to search, and its count and its rows can disagree** — the identical
shape to DEF-3, which said *"2 found"* and rendered nothing.

**It is not caused by `0029`** — that column has always been nullable — and **the state is reachable**:
`addExtraSession` refuses with *"คอร์สนี้ไม่มีนักเรียนที่ผูกไว้"*, which is a guard someone wrote for a case that
happens.

## What to do

- Decide **and state which** of the two is true, rather than defaulting:
  **(a)** a studentless course is legitimate ⇒ `leftJoin`, and the search must show it (probably named by the
  course, since there is no student to name it with); or
  **(b)** it is a data defect ⇒ the column should be `NOT NULL`, which needs a migration **and** an answer for
  any existing row.
  🔴 **Do not silently pick (a) because it is the smaller diff.** If (b) is the truth, a `leftJoin` makes a broken
  row permanently visible instead of fixing it.
- ⚠️ **Whichever way: `count` and `rows` must be narrowed by the same predicate.** That equality is the actual
  bug here, and it is the one DEF-3 taught us to check for.
- Ask before migrating: how many such rows exist is a **DATA REQUEST** via @Sober → @Porter, not a guess.

## Definition of Done
- [ ] `total` and `items.length` agree for the course search on every filter combination.
- [ ] The chosen reading (a or b) is written at the site with its reason.
- [ ] Existing course-search behaviour for ordinary courses is unchanged.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun test` green. 🚫 No DB run.

## Implementation Notes
(Jason.)

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW.)
