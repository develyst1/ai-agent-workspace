# TASK-205: The status-counts projection drops `droppedAt` → DROPPED chip is always 0 (scheduler-back)

- Source: TASK-204 trace (Fern) — the "stale chip" is actually a BE field-drop. 🟠 MEDIUM. On `develop`. Once this lands
  there is **NO FE change** — Fern re-verifies the on-screen per-bucket outcome and closes TASK-204.
- Status: ✅ **BE DONE (Sober 2026-08-28)** — projection deleted (whole rows); `endedAt`+`droppedAt` REQUIRED on CourseStatusInput (guard); outcome tested (dropped course → DROPPED count 2; status==count per-bucket invariant). tsc 0·871/0. No FE change → deploy, then @Fern re-verifies + closes TASK-204.
- Repo: **smart-scheduler-back**.

## The defect (attributed, per the standing rule)
`scheduler.service.ts:597` builds the counts from a hand-written projection:
`all.map((c: any) => ({ size, usedSessions, expiryDate, endedAt }))` — **`droppedAt` is missing.** `courseStatus`
reads DROPPED from `c.droppedAt` (`course-status.ts:43`), so `countByStatus` **structurally cannot** return DROPPED > 0
— the chip is always `(0)` while each row's own `status` (computed from the whole object in `leave.ts:95`) correctly
reads DROPPED. That is Porter's symptom exactly: rows say DROPPED, chips say 0, buckets stop matching their rows.

**Whose / what (attribution):** the projection predates Drop; **TASK-198 added `droppedAt` to `courseStatus` but did
not wire it into this counts projection** — and **my TASK-198 review verified the `courseStatus` rule, not the outcome
"a dropped course appears in the DROPPED count."** Mechanism checked, outcome not — the same miss I've been breaking all
week. It compiled because `droppedAt` is optional on `CourseStatusInput` and the map is `(c: any)`.

## Fix
1. **Delete the lossy projection; pass `all` to `countByStatus`** (Fern's call, and it's right — `countByStatus<T
   extends CourseStatusInput>` takes whole rows, so the projection buys nothing and only creates a place to drop a
   field). If a projection must stay for some reason, add `droppedAt: c.droppedAt` — but prefer deleting it.
2. **(Q2 — do it, it's the structural guard) make `endedAt` AND `droppedAt` REQUIRED on `CourseStatusInput`**
   (`course-status.ts`). Any future projection that feeds `courseStatus` and forgets one becomes a **compile error** —
   the TASK-187/184 move, and it would have caught this. Fix whatever call sites that surfaces.

## Definition of Done — the OUTCOME (not "I added the field")
- [ ] 🔴 With a dropped course present, `countByStatus` / `GET /courses` returns **`DROPPED >= 1`** — a test that a
      fixture containing a dropped course yields a non-zero DROPPED count (the count that was structurally 0 before).
- [ ] Each status count equals the number of rows that filter returns (per-bucket, not just the sum) — extend the
      partition test to include a DROPPED row.
- [ ] `CourseStatusInput` requires `endedAt` + `droppedAt`; a projection omitting one no longer compiles (proven the
      TASK-187 way: delete one, watch tsc fail, restore).
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun test` green. No migration.

## Notes
(Jason fills in. This is the fourth compiler-silent optional-field drop in a month — the required-field guard is the
one that stops the class, not just this instance.)

## Implementation Notes
**Files:** `services/scheduler.service.ts` (the projection deleted) · `lib/course-status.ts` (both flags
REQUIRED) · `lib/leave.ts` (one named coalesce) · `lib/course-status.test.ts` (+3, factory updated).

**The fix is a deletion.** `countByStatus(all, today)` — the whole rows, no projection. The four-field copy
bought nothing (`countByStatus<T extends CourseStatusInput>` takes rows), and it is the only reason the count
could disagree with the labels it was counting.

**The structural guard is the actual deliverable** (Fern's Q2, and she is right): `endedAt` and `droppedAt` are
now **required** on `CourseStatusInput`. Optional is exactly how this shipped — a projection that dropped
`droppedAt` type-checked perfectly while making `DROPPED > 0` **structurally impossible**. Required means the
next lossy projection is a **compile error** rather than a number the owner reads as fact.

**Making them required surfaced the two real callers, which is the point.** `toCourseSummary` passes the whole
row and needed a `?? null` bridge for `CourseLike`'s optional fields (a DB row always has the columns;
fixtures may not) — that is a coalesce at **one named seam** where the field list is not restated, so it cannot
go stale the way the projection did. The test factory now sets both explicitly, with the reason: a fixture that
can omit a lifecycle flag is a fixture that can silently stop testing the status that flag decides.

**The tests assert the OUTCOME, which is what was missing** — from the suite and from the review. Not "the rule
returns DROPPED" (it always did) but **"a dropped course is COUNTED as dropped"**, plus the invariant stated
once: **every bucket equals the rows that claim that status**. If a future caller projects a lifecycle field
away again, the labels and the counts stop matching and that test fails. There is also a `@ts-expect-error`
test pinning that omitting `droppedAt` is a compile error — if it ever stops erroring, the guard has been
weakened and the bug can return.

**I swept the other callers rather than assuming this was the only one:** `countByStatus` and `courseStatus`
have exactly two call sites outside their own module, and both now pass whole rows.

**Verified:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun test` **871 pass / 0 fail** (+3).
No migration, no FE change.

**DoD:** a fixture with a dropped course yields `DROPPED >= 1` ✅ · the projection is gone ✅ · both flags
required so the class cannot recur ✅ · tsc/test ✅.
**@Fern — no FE change; re-verify the on-screen outcome per bucket and close TASK-204.**

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-205 | scheduler-back (BE): 🔴 **the DROPPED chip counted 0 while every row said DROPPED** — `listCoursesPaged`'s counts projection dropped `droppedAt`; delete the projection and make both lifecycle flags **required** so the class can't recur. Blocks TASK-204. | SPEC-065 | 🔎 **REVIEW** (Jason 2026-08-28 — **the fix is a deletion**: `countByStatus(all, today)`, whole rows. The four-field copy bought nothing (`countByStatus` takes rows) and was the only reason the count could disagree with the labels it was counting. **The structural guard is the real deliverable** (Fern's Q2): `endedAt`+`droppedAt` are now **required** — optional is exactly how this shipped, since a projection that dropped `droppedAt` type-checked perfectly while making `DROPPED>0` **structurally impossible**. Required ⇒ the next lossy projection is a **compile error**, not a number the owner reads as fact. Making them required surfaced the two real callers, which is the point; `toCourseSummary` needed one `?? null` bridge at a **named seam where the field list is not restated**, so it cannot go stale the way the projection did. Tests assert the **outcome that was missing from the suite and the review**: not "the rule returns DROPPED" (it always did) but **"a dropped course is COUNTED as dropped"**, plus the invariant — **every bucket equals the rows claiming that status** — and a `@ts-expect-error` pinning that omitting the flag is a compile error (if it stops erroring, the guard is gone). Swept both remaining call sites rather than assuming. tsc 0 · **871/0** (+3), no migration, **no FE change**. **@Fern: re-verify per-bucket on screen and close TASK-204.**) | Sober | — |
```
