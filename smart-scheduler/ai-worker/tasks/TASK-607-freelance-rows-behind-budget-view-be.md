# TASK-607 — the freelance drawn/refunded rows move behind `action:teachers.budget-view` — BE, XS
- Source: REQ-111 item H · owner ruling REQ-111 §6.6 · sizing §H
- Status: DONE
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-02)
- Depends on: none
- 📌 This number was the board's "owner decision" row for the same question. The owner has now ruled, and this file carries the ruling.

## §0 The ruling
- **Who sees these rows:** the "Freelance budget drawn / refunded" rows in a course's history are the **freelance coach's hour-ceiling ledger.** From now on, only a viewer who holds `action:teachers.budget-view` sees them.
- ⚠️ **Accepted by the owner:** nobody holds that key today, so admins stop seeing these rows until it is granted. Granting the key is a deploy step that @Porter carries. **It is not this task's job.**

## What exists
- `GET /courses/:id/history` is at `src/routes/api.ts:457`. It passes no viewer today, so anyone with the Bookings menu sees the rows.
- `getCourseHistory` (`src/services/scheduler.service.ts:2546`) mixes the ledger rows (`kind` = `freelance-drawn` / `freelance-refunded`, `lib/course-history.ts:69`) into `events`.
- The rule already exists: `canSeeBudget(viewer)` in `lib/budget-visibility.ts:20`.
  - It requires the key, and **a linked teacher account never qualifies.** `viewer = null` means masked, so it fails closed.
- Use `viewerOf(c)` (`budget-visibility.ts`) to get the viewer.

## What to do
- **In the route only:** take `viewerOf(c)`, call `svc.getCourseHistory(...)`, and drop the events whose `kind` is `freelance-drawn` or `freelance-refunded` when `!canSeeBudget(viewer)`.
- 🔴 **Do NOT edit `src/services/scheduler.service.ts`.** It is Team A's file this batch, which is why the filter goes in the route.
- Keep the filter in **one named function**, for example beside the other budget-visibility helpers, so the route stays one line and the rule is testable without HTTP. Where it lives is your call; declare it.
- The `summary` block is built from course fields, not the ledger, so it is unchanged. Confirm that in your notes.
- **The FE needs no change.** `CourseHistoryModal.tsx` renders whatever arrives.

## Definition of Done
- [ ] Tests for three viewers on the same course history:
  - **with** the key → the rows are present;
  - **without** the key → the rows are absent, and every other event is unchanged in count and order;
  - a **linked teacher account** that holds the key → absent.
  - Also `viewer = null` → absent.
- [ ] **Break it and watch:** remove the filter and confirm the "without" test goes red.
- [ ] `bun test` in the back repo plus a typecheck, all green, with the commands and counts pasted.
- [ ] `git diff --stat` shows `routes/api.ts`, your helper and its test only. `scheduler.service.ts` is untouched.
- [ ] Nothing is committed.

## Implementation Notes
**Bob, 2026-10-02 — submitted together with TASK-620.**

**What changed (`smart-scheduler-back`, nothing committed):**
- `src/lib/budget-visibility.ts` (+8): `hideLedgerRows(viewer, history)`. With `canSeeBudget(viewer)` the history is returned unchanged. Otherwise it is returned with `events` minus `kind ∈ {freelance-drawn, freelance-refunded}`. Every other key, including `summary`, is passed through.
  - **Declared:** it lives beside `canSeeBudget`/`maskBudget`, so the one budget rule has one home. It returns a new object instead of mutating, because nothing else holds the history.
- `src/routes/api.ts` (+2 −1): the history route is still one line: `c.json(hideLedgerRows(viewerOf(c), await svc.getCourseHistory(...)))`, plus a one-line comment saying why the filter sits in the route.
- `src/lib/budget-visibility-history-task607.test.ts` (new, 7 tests).
- ⚠️ **One file the TASK did not list:** `src/lib/budget-visibility-req102.test.ts`, one line. The TASK-426 pin counts `viewerOf(c)` uses in `api.ts`, and this route legitimately adds one, so 21 → 22. I followed the file's own `🔻 TASK-xxx: +` convention; the meaning of the pin is unchanged.
- `scheduler.service.ts` is untouched (`git status` lists only the files above).

**`summary` is unchanged:** confirmed by reading `buildCourseHistory` (`lib/course-history.ts`). The summary is built from `course.size`, `course.leaveUsed` and the COURSE_PACKAGE bookings, never from `movements`. The pure tests also assert `summary` deep-equal for every hidden viewer.

**Tests (3 viewers + null, as the DoD asks):**
- Pure helper:
  - with the key → unchanged;
  - without the key / a linked teacher account that HOLDS the key / `null` → ledger rows absent, the other 3 events identical in count and order, `summary` identical.
- Through the root app (`GET /api/courses/:id/history`, service spied):
  - with the key → rows present;
  - without the key → absent, the rest in order;
  - linked account with the key → **403 `SCOPE_TEACHER` at the door**. The history route is not in `TEACHER_ALLOWED`, so a linked account never reaches the filter over HTTP. The pure test covers the filter for it anyway.

**Break it and watch:**

| mutation | result |
|---|---|
| route bypasses the filter | ❌ "without the key ⇒ rows absent" goes red (6 pass / 1 fail) |
| helper never filters | 4 red |
| only `freelance-drawn` hidden (refunded leaks) | 4 red |
| filter drops every event | 4 red |

All restored, re-run green.

**Commands and results:**
- `bun --env-file=.env.sid test src/lib/budget-visibility-history-task607.test.ts` → **7 pass / 0 fail**.
- `bun --env-file=.env.sid test` (full) → **3724 pass / 1 fail, 3725 tests across 298 files**.
  - The 1 fail is **not this change**: `teacher-schedule-req109.test.ts` "the REASON sits beside the English strings". It `toContain`s a `\n` string, and `src/lib/teacher-schedule.ts` is checked out CRLF here (`core.autocrlf=true`). Neither file is touched by me.
- `bunx --package typescript@5.6.3 tsc --noEmit` → **exit 0**.

⚠️ **Why `--env-file=.env.sid`:** the repo's `.env` on this machine holds **uat** values (left from the uat release), and the TASK-503 guard refused the run as designed. Loading `.env.sid` explicitly runs against `sid` **without touching `.env`**, which the owner may be running uat from. Both facts are written to `SYSTEM-FACTS.md` (§ The test suite runs against `sid`).

**Deploy note (restated from §0, not my job):** until `action:teachers.budget-view` is granted to someone, admins stop seeing these two row kinds. The FE needs no change.

## Questions
(Bob asks; Silver answers as `> answer: ...`.)
- None.

## Review
**Silver, 2026-10-02 — ✅ DONE.**
- **Diff read in full:** `budget-visibility.ts` +8 (`hideLedgerRows`), `routes/api.ts` (one import, one route line), and `budget-visibility-req102.test.ts` (the `viewerOf(c)` pin 21 → 22, using the file's own convention).
  - `scheduler.service.ts` is untouched (`git status`).
  - The filter returns a new object and never mutates. `summary` passes through, which matches the ruling: only these two kinds go.
- **Re-run by me:** `bun --env-file=.env.sid test src/lib/budget-visibility-history-task607.test.ts src/lib/budget-visibility-req102.test.ts` → **18 pass / 0 fail**.
- The extra pin edit outside the listed files is accepted. It was the right call and was declared.
- The 403 for a linked account at the door is a good finding: the filter is a second line of defence, and both are tested.
- 📌 **Deploy dependency (Porter's):** admins stop seeing these rows until `action:teachers.budget-view` is granted.
