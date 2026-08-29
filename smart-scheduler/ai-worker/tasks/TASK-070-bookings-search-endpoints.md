# TASK-070: scheduling (BE) — one search rule + paging for courses, vouchers and bookings
- Source: SPEC-022 (REQ-024)
- Status: DONE  (reviewed 2026-08-01 by Sober — LEFT joins verified (no inner join anywhere), separate paged functions so an internal consumer cannot receive an envelope by accident, `id` tiebreak, shared-rule + no-default-paging guards; tsc 0 / 293 tests) — 🔴 **MUST SHIP WITH TASK-071** (breaking response shape on /courses + /vouchers)
- Depends on: none
- Assignee: @Jason (smart-scheduler-back, port 4006)

## What to do

### 1. `GET /bookings` — use the search rule we already have (three lines)
`getBookings` (`:445-452`) resolves `q` with `ilike(students.name, %q%)` — **name only**. Replace it with
**`studentSearchConditions(q)`** from `parent.service.ts:304`, which already matches **name · nickname · parent
phone** and is exported and unit-tested (the REQ-011 fix).

> This is why the same query works in the student picker and returns nothing here — which staff reasonably read
> as the system being broken. Keep the subject-name match as it is; just widen the student side.

⚠️ The student-id lookup must **LEFT JOIN parents** — a walk-in student has `parent_id = null` **by design** and
must still match on name/nickname. An inner join would delete the entire walk-in cohort from search.

### 2. `GET /courses` — search, paging, and a stable order
`getCourses()` (`:365`) has no filter, no paging and **no `ORDER BY` at all**, so identical requests can return
cards in different orders.

⚠️ **It has four consumers and three of them need the whole list**: the route, plus the attention checks
(TASK-053), eligible-students (TASK-051) and the SOM report (TASK-062). **Paging them would silently truncate a
digest count, an eligibility list and a dashboard figure.**
- **Make paging opt-in:** `getCourses()` with no options behaves **exactly as today**; the route passes
  `{ q, page, limit }`.
- **Add the stable `ORDER BY` unconditionally** (student name, then course `createdAt`) — non-determinism helps
  nobody, and a deterministic order is what makes paging mean anything.
- `q` uses **`studentSearchConditions`**, same as everywhere.

### 3. `GET /vouchers` — move `q` into SQL, add paging
`getVouchers` (`:708`) loads **every** voucher then filters in JS, so the existing `q` buys nothing — the whole
table is still read. Join students, filter in SQL with the same rule, and page it.

### 4. One response shape
All three return **`{ items, page, limit, total }`** — the shape `getBookings` already uses — so the FE ends up
with one pagination component instead of three.

**No migration.** No change to booking creation, entitlements, **bulk-confirm**, the freelance cap or the
suspend gate.

## Definition of Done
- [ ] Searching a **nickname** or a **parent phone** on `/bookings` finds the child's bookings; subject-name
      search still works.
- [ ] A **walk-in student with no parent** is still findable by name and nickname on all three endpoints.
- [ ] `/courses` and `/vouchers` accept `q`/`page`/`limit`, filter **server-side**, and return
      `{ items, page, limit, total }`.
- [ ] **`getCourses()` called with no options returns the full list, unchanged** — verify the three internal
      consumers still see everything (say how you checked).
- [ ] Repeating the same `/courses` request returns the **same order**.
- [ ] Bulk-confirm and the course-card sport line are untouched.
- [ ] `bunx tsc --noEmit` clean; `bun test` green — including a test that the **search rule is shared**, not
      re-implemented per endpoint.

## Implementation Notes

### 🔴 Deploy-order hazard — please read this before scheduling the release
**`GET /courses` and `GET /vouchers` now return `{ items, page, limit, total }` instead of a bare array.**
That's DoD item 4 and it's the right shape, but it is a **breaking response change**: a frontoffice build from
before TASK-071 will call `.map()` on an object and the Courses/Vouchers tabs will break, not degrade.

**They must ship together, BE first is not enough.** `/bookings` was already this shape, so it's unaffected.
I could have kept a bare array for one release and switched later — I didn't, because a temporary dual shape is
the kind of thing that never gets removed. **If you'd rather stage it, say so and it's a small change.**

### 1. `/bookings` — the actual complaint, three lines
`getBookings` resolved `q` with `ilike(students.name, …)` — **name only**. It now uses
**`studentSearchConditions`**, so nickname and parent phone work. That's why the same term found a child in the
picker and nothing in the bookings list; staff reading that as "the system is broken" were right. Subject-name
search is untouched.

### 2 & 3. `/courses` and `/vouchers`
- **Paging is opt-in, exactly as you specified.** `getCourses()` / `getVouchers()` with no options still return
  **the full list**; the routes call new `listCoursesPaged` / `listVouchersPaged`. I used *separate functions*
  rather than an options-shaped return so the type never varies — an internal consumer literally cannot receive
  a paged envelope by accident.
- **`ORDER BY` is unconditional** (student name → course `createdAt` → **`id`**). I added `id` as a final
  tiebreak: name+createdAt isn't necessarily unique, and a *nearly* total order still lets a row appear on two
  pages or none.
- **`/vouchers` `q` moved into SQL.** It previously loaded every voucher and filtered in JS on name/nickname —
  so the parameter bought nothing (the whole table was read either way) and a parent phone never matched.

### ✅ How I verified the internal consumers still see everything (DoD item 4)
Your count of four was right and **there is no fifth** — I grepped both functions across `src/`:
`routes/api.ts`, `attention.service` (TASK-053), `getEligibleStudents` (TASK-051), `som-report.service`
(TASK-062). All four call them **with no arguments**, so they take the unpaged path.
There's also a test asserting the no-argument query carries **no `limit`, no `offset` and no parameters** — so
if anyone later bakes paging or a filter into the default, a digest count / eligibility list / dashboard figure
can't silently truncate; the suite fails first.

### One search rule, made structural rather than conventional
I put the query builders in a new **`services/search.queries.ts`** — `studentSearchQuery`, `courseSearchQuery`,
`voucherSearchQuery` and the two matching count queries, all built from `studentSearchConditions`. Two reasons:
1. **The counts use the same joins and filter as the items**, so `total` can't disagree with what's on the page.
2. It makes "one rule" a property of the code rather than something people have to remember — which is the
   whole point of the task.

⚠️ **It also solved a recurring test problem structurally, which I want to flag properly this time.** Putting
these on `scheduler.service` broke the suite with `SyntaxError: Export named 'voucherSearchQuery' not found` —
the whole-module `mock.module` stub in `api.teacher-routing.test.ts` leaks across files, so an unrelated test
file's stub decides what *my* test file can import. **This is the fifth occurrence** (TASK-053, TASK-062, twice
before that, now this). Previously I patched the stub; this time the builders live in a module nobody stubs, so
the problem is gone rather than deferred. **The stub is still a live hazard for the next person** — replacing it
with a narrow fake remains the real fix, and it's a small standalone job whenever you want it.

### Untouched, as specified
Bulk-confirm, booking creation, entitlements, the freelance cap and the suspend gate. The course-card sport line
still comes from the same `bookings: { with: { subject: true }, limit: 1 }` load (a course ⇔ one subject,
REQ-010) — I kept that clause verbatim when the fetch moved.

### Verification (`smart-scheduler-back`)
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **293 pass / 0 fail** (44 files, was 280 — **+13**).
- New `services/search-paging.test.ts` asserts on **generated SQL** (`.toSQL()`, no DB — same approach as
  `lastDigestRunQuery` in TASK-053):
  - 🔑 **all three endpoints match name · nickname · parent phone**, table-driven over the three builders — the
    DoD's "the rule is shared, not re-implemented";
  - 🔑 **all three LEFT JOIN `parents`**, with an explicit assertion that none inner-joins it — the walk-in
    cohort (`parent_id` null **by design**) stays findable. This is the badge-report failure mode and it would
    have been very easy to reintroduce here in three places at once;
  - a **non-numeric** term produces exactly two params in every query (no phone clause) — proving they share the
    conditional-phone behaviour rather than each approximating it;
  - the course `ORDER BY` carries name + `created_at` + `id`, and the same request builds identical SQL;
  - the unpaged path has no limit/offset/params, and a `studentId` filter still applies.
- ⚠️ Row-level behaviour is **deploy smoke** (brownfield). **Smoke:** on `/scheduler/bookings`, search a child's
  **nickname** → their bookings appear (this is the customer's complaint) · search the **parent's phone** →
  same · search a **subject name** → still works · a **walk-in student with no parent** is findable by name and
  nickname on **all three** tabs · reload `/courses` twice → identical order · page 2 shows different rows and
  `total` matches the count.

**DoD:** nickname + parent phone find bookings, subject search unchanged ✓ · walk-in findable on all three
(LEFT join, asserted) ✓ · `/courses` + `/vouchers` take `q`/`page`/`limit`, filter **server-side**, return
`{items,page,limit,total}` ✓ · **`getCourses()` with no options unchanged**, all four consumers checked by grep
**and** guarded by a test ✓ · repeated `/courses` returns the same order ✓ · bulk-confirm + course-card sport
untouched ✓ · tsc clean, tests green, **shared-rule test included** ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- **One search rule across all three tabs is the point of this task.** If reusing `studentSearchConditions`
  somewhere forces an awkward join, tell me — but don't solve it by writing a second search.
- If you find another consumer of `getCourses()`/`getVouchers()` I missed, **flag it before changing defaults**.
  I found four for courses; a fifth would change the design.

## Review
(Sober fills at REVIEW.)

## Review
**Verdict: DONE ✅ (Sober, 2026-08-01).** `bunx tsc --noEmit` → **0**; `bun test` → **293 pass / 0 fail** (my
own run). Five `leftJoin(parents, …)` across the query builders and **not one `innerJoin`** — I grepped for the
inner join specifically, because that's the failure I warned about and it would have been easy to reintroduce in
three places at once.

### 🔴 Your deploy-order question — **ship them together. Do not stage it.**
Your reasoning decides it: *"a temporary dual shape is the kind of thing that never gets removed."* Correct, and
the cost of pairing here is close to zero — TASK-071 is ~1 day, Fern has one task ahead of it, and no deploy is
scheduled in that window. A compatibility shim would outlive the reason for it by a year.

**One nuance worth stating so nobody discovers it under pressure:** the customer's *actual* complaint — nickname
and parent-phone search on the all-bookings tab — is fixed by **your change alone** and needs no FE work, since
`/bookings` kept its shape and the tab already sends `q`. So pairing does hold that fix back by a day or two.
I'm accepting that trade knowingly rather than by omission; if the deploy window slips more than a few days,
tell me and I'll revisit. **@Porter: this is a must-ship-together pair — it belongs in the manifest beside
TASK-055's FE-first constraint.**

### What I'd have missed and you didn't
- **Separate `listCoursesPaged` / `listVouchersPaged` rather than an options-shaped return.** I specified
  "opt-in paging"; you made it so an internal consumer **literally cannot receive a paged envelope by
  accident** — the type never varies. That's stronger than what I asked for, and it's the difference between a
  convention and a guarantee.
- **`id` as the final `ORDER BY` tiebreak.** I specified name + `createdAt`; you noticed that isn't necessarily
  unique, and **a nearly-total order still lets a row appear on two pages or none** — the exact bug paging is
  supposed to prevent. That's the kind of thing that gets reported as "the list is wrong" six months later.
- **The counts share the joins and filter with the items**, so `total` can't disagree with the page. Two
  queries drifting is how a paginator starts lying.
- **A test asserting the no-argument query carries no `limit`, `offset` or params** — so if someone later bakes
  paging into the default, the suite fails before a digest count, an eligibility list or a dashboard figure can
  silently truncate. That guard is worth more than the feature.

### ⚠️ Your fifth-occurrence flag is the important one, and I'm acting on it
`api.teacher-routing.test.ts`'s whole-module `mock.module` stub **leaks across files**, so an unrelated test
file decides what your test file may import. You've now hit it **five times** (TASK-053, TASK-062, twice before,
now here). Four times you patched the stub; this time you routed around it by putting the builders in a module
nobody stubs — **structural, not deferred**, which is right.

But routing around it means the next person meets it fresh, and by then it will have shaped the module layout
of five tasks. **Filed as TASK-072** (replace it with a narrow fake) — **LOW**, behind the go-live queue,
because it costs us time rather than correctness. Naming it properly the fifth time instead of patching it a
fifth time is the right instinct.

**TASK-070 → DONE. @Fern: TASK-071 is the pair** — `/courses` and `/vouchers` now return
`{ items, page, limit, total }`, the shape `/bookings` already used.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-070 | scheduling (BE): **one search rule + paging** for courses/vouchers/bookings | SPEC-022 | ✅ **DONE** (Sober 2026-08-01 — 5 `leftJoin(parents)` and **not one inner join** (I grepped for it specifically — the walk-in cohort was the easy thing to lose in three places at once); **separate paged functions** so an internal consumer *cannot* receive an envelope by accident; **`id` added as the final ORDER BY tiebreak** — a nearly-total order still lets a row appear on two pages or none; counts share the items' joins so `total` can't disagree with the page; tsc 0 / **293 tests**) — 🔴 **MUST SHIP WITH TASK-071** | Jason | — |
```
