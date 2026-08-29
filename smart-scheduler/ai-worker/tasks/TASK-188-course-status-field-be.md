# TASK-188: One computed `status` on the course DTO — the single source for badge AND filter (REQ-036 B3, owner-ruled) (scheduler-back)

- Source: REQ-036 B3 — **owner overruled the binary toggle** (Porter 2026-08-25): *"แยกประเภทไป ทำประเภทขึ้นมาคลุมเลย"*.
  🟠 Medium. **BE FIRST** — the FE badge+filter (TASK-189) reads this one field. No migration (all inputs already on the
  course).
- Status: ✅ **BE DONE (Sober 2026-08-25)** — tsc 0 · 806/0 (+11); pure rule, AC-B6 tested as a partition, expiry inclusive. Q1/Q2 accepted. Unblocks @Fern (TASK-189).
- Repo: **smart-scheduler-back**.

## Why one server-side field (Porter's call, and it's right)
There is **no course-status concept in the BE today** — `ปกติ` is computed in the FE. **That is exactly why a cancelled
course wore a green `ปกติ` badge:** the badge's idea of "over" and the data's idea of "over" were never the same object.
A filter that re-computes status separately builds **the same bug twice**. ⇒ **compute it once, server-side; the badge
renders it, the filter filters on it.**

## What to build
1. **A pure `courseStatus(course, today)`** → `"CANCELLED" | "COMPLETED" | "EXPIRED" | "ACTIVE"`, **precedence in this
   exact order** (first match wins, so every course is exactly one):
   - `CANCELLED` — `endedAt != null`.
   - `COMPLETED` — `usedSessions >= size`.
   - `EXPIRED` — past `expiryDate` **with sessions still unused** (`usedSessions < size`).
   - `ACTIVE` — default.
   **`COMPLETED` beats `EXPIRED` deliberately** (owner): a family who used everything has no problem; **expired with
   sessions left is a family that paid for classes they never received** — the one status that costs the customer money,
   which a binary would have hidden. `today` in **Asia/Bangkok**, server-side. Unit-test the precedence incl. the
   past-expiry-but-completed row → `COMPLETED`.
2. **Add `status: CourseStatus` to `CourseSummary`** (`types/contract.ts:99`), set in **`toCourseSummary`**
   (`lib/leave.ts`) — the one builder every course response flows through, so badge and filter can't diverge.
3. **`GET /courses` gets a `status` param** (`coursesQuery`, `validation.ts`) — optional; filters server-side so **the
   counts and paging are correct** (this closes TASK-186 Q1: the FE filter was client-side over one page, so `total`
   lied). If the list response can carry per-status counts cheaply, do — the FE needs the four counts.

## Definition of Done — AC-B6 is the invariant
- [ ] Every course DTO carries exactly one `status`; the precedence is unit-tested (incl. past-expiry+completed →
      COMPLETED, and endedAt+anything → CANCELLED).
- [ ] 🔴 **AC-B6: the four filtered counts SUM to the unfiltered total** — nothing between two categories, nothing in
      both. The precedence makes this true by construction; add a test that asserts it over a mixed fixture.
- [ ] `GET /courses?status=…` filters server-side; the cancelled course is under CANCELLED, absent from ACTIVE.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun test` green. No migration; no DB run by you.

## Notes / Questions
(Jason fills in. This supersedes TASK-186's client-side predicate. Keep `courseStatus` pure and separate from the
leave-lock/quota state — lifecycle status and `leaveLocked` are orthogonal; don't fold one into the other.)

## Implementation Notes
**Files:** `lib/course-status.ts` (new, pure) · `lib/course-status.test.ts` (11) · `lib/leave.ts`
(`toCourseSummary` sets it) · `types/contract.ts` (`CourseStatus` + the field) ·
`services/scheduler.service.ts` (`listCoursesPaged`) · `validation.ts` (`status` param) ·
`services/search.queries.ts` (a note on the now-unused count query).

**1. The rule is pure and takes `today`.** The clock is resolved once, in `toCourseSummary` (Bangkok), never
inside the rule — so the precedence is testable and cannot pick up the server's timezone by accident.

**2. The precedence is tested where two statuses could both look true**, which is the only place it can be
wrong: cancelled-and-completed-and-expired → CANCELLED; completed-and-past-expiry → COMPLETED; and the one that
matters, **used-7-of-10-past-expiry → EXPIRED**, with the reason in the test body — that family paid for classes
they never received, and a binary would have hidden exactly them.

**3. 🔴 AC-B6 is asserted two ways**, because "sums to the total" can pass while a course sits in two buckets:
the counts sum to the set size, **and** filtering by each status *partitions* the set (nothing counted twice,
nothing dropped). The fixture is deliberately full of ambiguous rows.

**4. The filter and counts are computed in TypeScript, before paging — and I want the trade on record.**
`status` is derived, so filtering it in SQL means writing the precedence **a second time in a second language**,
where the two drift on any Tuesday — the exact bug this task exists to kill. The cost is that the endpoint
hydrates every matching course before slicing a page. At this school's scale that is nothing (`getCourses()`
already loads them all for the attention checks). **If the list ever reaches thousands, the answer is a
stored/generated status column, NOT a second hand-written rule.** Written in the code, not just here.

**5. Counts are over the search-filtered set BEFORE the status filter** — the chips must show what switching to
another status *would* find, not "0" for every status you aren't looking at. And every status is present at
zero: a chip that vanishes reads as a missing feature.

**6. `total` is now honest.** It counts the status-filtered set, so the FE's paging matches what it can show —
this is TASK-186 Q1's "the filter could only filter the page it had" closed at the source.

**7. Orthogonality kept, as the task asked:** there is a test that a leave-locked course is still `ACTIVE`.
Folding lifecycle into `leaveLocked` would make "can they take another leave?" and "is this course over?" the
same question, and they are not.

**Verified:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun test` **806 pass / 0 fail** (+11). No
migration. ⚠️ I ran nothing against a database — the filter/count path is un-exercised end to end.

**DoD:** one `status` per course DTO, precedence unit-tested incl. both ambiguous cases ✅ · AC-B6 asserted as a
partition, not just a sum ✅ · `GET /courses?status=` filters server-side with true counts and paging ✅ ·
tsc/test ✅.
**@Fern — `course.status` is on every course DTO and `GET /courses` returns `counts` (all four, zero included).
TASK-189 can rip out the FE's own compute and render/filter this.**

## Questions
- Q1: `GET /courses` now also returns `counts`. Additive, so nothing breaks if unused — but it is not in the
  task's contract, so flagging it rather than assuming.
- Q2: TS-side filtering (§4) is a deliberate trade against duplicating the rule in SQL. Ratify, or tell me the
  scale you want it to hold at and I'll do the generated column properly.

  > **Q1 (counts additive) — ACCEPT.** The FE needs it: TASK-189 renders the four chip counts and AC-B6 is only
  > *visible* if the counts come from the server (recounting client-side is the bug-twice this task kills). Keep it.
  > **Q2 (TS-side filter vs SQL) — RATIFY, unreservedly.** Writing the precedence a second time in SQL is exactly the
  > divergence we're eliminating; a derived value filtered in two languages drifts on any Tuesday. Hydrate-all-then-page
  > is correct at this school's scale (`getCourses()` already loads all for the attention checks), and you documented
  > the escape hatch (a generated/stored `status` column) **in the code** for if the list ever hits thousands — which is
  > the right threshold and the right place to note it. Don't pre-build it.

## Review — ✅ PASS (Sober 2026-08-25)
Reproduced `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun test` **806/0** (+11). `courseStatus`
(`lib/course-status.ts:35`) is pure and precedence-ordered exactly as ruled (endedAt→CANCELLED, used≥size→COMPLETED,
expiry<today→EXPIRED, else ACTIVE), `today` resolved once in `toCourseSummary` (Bangkok) so the rule can't pick up the
server tz. Tests cover both ambiguous seams (used-7-of-10-past-expiry→EXPIRED, completed-past-expiry→COMPLETED),
**expiry inclusive of the day** (expiring today is still ACTIVE — good edge), over-used→COMPLETED, and **AC-B6 as a
partition** not just a sum (`:70` buckets.flat length + no overlap). Orthogonality proven (leave-locked course still
ACTIVE). The seam that renders the badge is pinned: a cancelled course's DTO `.status` is CANCELLED. `total` is now
honest (status-filtered), closing TASK-186 Q1's paging lie at the source. Nothing to change.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-188 | scheduler-back (BE): **REQ-036 B3 (owner-ruled)** — one computed `status` (CANCELLED → COMPLETED → EXPIRED → ACTIVE) on `CourseSummary` from the single builder + `GET /courses?status=` server-side filter/counts. The badge renders it, the filter filters on it; no second compute. | SPEC-064 (REQ-036 B3) | 🔎 **REVIEW** (Jason 2026-08-25 — pure `courseStatus(c, today)`, clock resolved once in `toCourseSummary` so the rule can't pick up the server's timezone. Precedence tested **where two statuses could both look true** — cancelled+completed+expired → CANCELLED; completed-past-expiry → COMPLETED; and used-7-of-10-past-expiry → **EXPIRED**, with the reason in the test body: that family paid for classes they never received, and a binary would have hidden exactly them. 🔴 **AC-B6 asserted TWO ways** — the counts sum to the set size **and** filtering by each status *partitions* it (a sum can pass while a course sits in two buckets); fixture deliberately full of ambiguous rows. 🔴 **Filter + counts computed in TS before paging, trade stated in the code**: `status` is derived, so filtering in SQL = the precedence written a second time in a second language, drifting on any Tuesday — the exact bug this kills. Cost: hydrates matching courses before slicing (nothing at this scale; `getCourses()` already loads all). **If it ever reaches thousands the answer is a generated column, NOT a second rule** (Q2). Counts run BEFORE the status filter so chips show what switching would find, all four present at zero. `total` now honest ⇒ closes TASK-186 Q1's paging lie. Leave-lock orthogonality kept + tested. tsc 0 · **806/0** (+11), no migration. **@Fern: `course.status` + `counts` are live.**) | Sober | — |
```
