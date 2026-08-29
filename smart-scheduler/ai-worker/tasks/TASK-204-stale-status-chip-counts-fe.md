# TASK-204: Status filter chips show STALE counts after a status change (REQ-071/REQ-036 B3) (FE)

- Source: Porter (owner-found, 2026-08-28), routed through SA. 🟠 MEDIUM — the counts staff read to make decisions are
  wrong right after a drop. On `develop`.
- Status: ✅ **CLOSED — FE half re-verified** (Fern 2026-08-28). Cause was the BE projection (TASK-205). Rendered per-bucket + chip-equals-rows verified **locally against a mirrored mock**; 🔴 **the sid re-check is still owed by whoever may touch sid** — I'm not permitted there.
- Repo: **smart-scheduler-front**.

## The symptom (server is RIGHT, the chip is stale)
After dropping a course: **the API returns `DROPPED = 1`**, but the **chip reads `(0)`**, and the five chips **sum to 18
when the truth is 19** — one course has fallen out of what the chips show. The server counts (TASK-188 `countByStatus`,
partition-tested) are correct; the FE is displaying a stale/incomplete `counts`.

## ⚠️ The naive fix is already in place — do NOT stop at "add invalidation"
Every status mutation (`useDropCourse`/`useResumeCourse`/`useConfirmCourse`/`useEndCourse`) **already** calls
`invalidateAll`, which invalidates `COURSES_KEY` (`hooks/scheduler/useScheduler.ts:235`). So the chips *should* refetch
and don't. **Trace the real cause** — candidates, verify which:
- Do the chips read `counts` from a query whose key isn't matched by the `["courses"]` invalidation (a separate
  counts fetch, or a parameterised key the prefix-invalidation misses)?
- Is the `counts` object memoized / held in component state so a refetch doesn't propagate to the chips?
- Does the panel read `counts` from the **status-filtered** response (which changes as you switch chips) rather than a
  single all-status source, so the number depends on which chip is active?
**Fix by refreshing the ONE server source** (Porter) — never by recomputing counts client-side (that reintroduces the
"badge's idea of over ≠ the data's" class that caused the green `ปกติ` bug).

## The AC correction — per-bucket, not sum-only (Porter; applies to Drop AND REQ-036)
AC-B6 said "the counts sum to the total." **That rule is blind to a bucket-to-bucket move — which is exactly what a
drop always does** (ACTIVE −1, DROPPED +1; the sum stays put while both chips are wrong). Strengthen the check:
**each chip's number must equal the rows that chip actually returns**, and a drop must move ACTIVE↓ and DROPPED↑ **live**.

## Definition of Done — verify the OUTCOME on screen
- [ ] Drop a course → the DROPPED chip increments and the ACTIVE chip decrements **immediately** (no reload); the five
      chips sum to the true total AND each chip equals the rows it filters to.
- [ ] Same holds for resume (DROPPED↓, ACTIVE↑) and confirm/cancel.
- [ ] The fix refreshes the server counts; **no client-side recompute of statuses**.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun run build` ok · `keys.test.ts` green. Rendered check → @Tanya.

## Notes
(Fern fills in. The value is the LIVE per-chip number after a bucket move, not the sum — that's the check Porter added.)

---

## 🔴 Traced (Fern 2026-08-28) — it is **not** an FE staleness bug. One missing field in a BE projection.
You told me to trace rather than assume, so I did, and the answer is that **the FE has nothing to fix**: it renders
exactly the counts the server sends.

### What I ruled out on the FE first (so this isn't a deflection)
1. **Invalidation reaches it** — `useDropCourse.onSuccess → invalidateAll`, and `invalidateQueries({queryKey:
   ["courses"]})` matches `["courses", {q,status,page,limit}]` **by prefix**, so the parameterised key is covered.
2. **No `staleTime`** on `useCoursePackages`; `keepPreviousData` only affects the in-flight transition, not the
   settled value.
3. **The counts are not client-derived** — `getCoursePackages` passes `data.counts` straight through, and nothing
   memoises them.
So the query does refetch, and the refetched payload still says `DROPPED: 0`.

### The actual cause — `smart-scheduler-back/src/services/scheduler.service.ts:597`
```ts
const counts = countByStatus(
  all.map((c: any) => ({
    size: c.size, usedSessions: c.usedSessions, expiryDate: c.expiryDate, endedAt: c.endedAt,
  })),                                   // ← droppedAt is NOT projected
  today,
);
```
`courseStatus` decides `DROPPED` from **`c.droppedAt`** (`lib/course-status.ts:43`). The projection omits it, so
**`countByStatus` can never return a non-zero DROPPED** — the chip is structurally stuck at 0. Meanwhile each *row's*
`status` is computed in `lib/leave.ts:95` from the **whole course object**, which does carry `droppedAt`. Hence
Porter's exact symptom: **the rows say DROPPED and the chips don't, and the buckets stop matching their filtered rows.**

**Why nothing caught it:** `droppedAt` is **optional** on `CourseStatusInput`, and the projection runs through
`(c: any)`. Omitting the field compiles cleanly. `course-status.test.ts` tests `countByStatus` on inputs that *do*
carry `droppedAt`, so the rule is proven correct — the bug is in the one call site that feeds it a lossy object.
This is the same class Jason himself named in TASK-201 (a `course.note` on an `any` row would have compiled and sent
empty forever), which is probably worth saying out loud: it has now bitten in both directions.

### The fix (BE — **not mine to make**, per FE.md)
One line: add `droppedAt: c.droppedAt` to that projection. Better still, drop the `(c: any)` map entirely and pass
`all` — `countByStatus<T extends CourseStatusInput>` accepts the full rows, so the projection is buying nothing and
costing this.

**I have written no code for this task.** Client-recomputing the counts would "fix" the screen and is exactly the
green-`ปกติ` mistake you and Porter both called out — the whole point of TASK-188/189 is one server source.

## Questions
- **Q1:** please route the one-line BE fix (@Jason). Once it lands the chips are correct with **no FE change**; I'll
  re-verify the on-screen outcome (per-bucket: a drop moves ACTIVE↓ / DROPPED↑ live, and each chip equals its
  filtered rows) and close this.
- **Q2 (worth a moment):** `countByStatus` is generic over `CourseStatusInput` precisely so callers can hand it whole
  rows. If the projection were deleted rather than patched, this call site couldn't drift again. Making
  `droppedAt`/`endedAt` **required** on `CourseStatusInput` would also turn any future lossy projection into a
  compile error — same move as TASK-187, and it would have caught this one.

---

## ✅ Re-verified on a RENDERED page (Fern 2026-08-28) — TASK-204 closed
**No FE fix was needed and none was made.** TASK-205 fixed the BE projection; the FE was already correct.

### What I could and could not verify
🔴 **I did not test on `sid`** — PROTOCOL gives that exception to Tanya alone, and this is a real environment. So I
verified the FE's half **locally against a mock rebuilt to mirror the fixed server**, and I'm stating the boundary
rather than implying I saw sid.

To make that verification real rather than decorative, the mock now mirrors `listCoursesPaged`: it applies the
**status filter server-side** and returns **`counts` over the search-filtered set before paging**. 🔴 Crucially, the
counts are derived from **the same `status` each row reports** — TASK-204's whole bug was two derivations
disagreeing, so a mock that computed counts separately could have reproduced the bug *or* hidden it. Deriving both
from one value means it structurally can't.
Drop/resume now **mutate the fixture** too: a mock that returned success without changing state would make the counts
look right while proving nothing — the exact shape of evidence that let this defect sit.

### Observed on screen (mock, local)
| Step | Chips | Rows |
|---|---|---|
| baseline | `Active (3) · Paused (0) · Completed (0) · Expired (0) · Cancelled (0)` | 3 ACTIVE rows |
| one course paused | **`Active (2) · Paused (1)`** … | ACTIVE view shows **exactly 2** |
| filter → Paused | `Paused (1)` | **exactly 1** row, badge reads **PAUSED** |

- **Per-bucket movement is live** — ACTIVE↓ / DROPPED↑, not just a sum that happens to balance (Porter's AC correction).
- **Each chip equals its filtered rows** — the invariant that actually failed before.
- **Counts partition the total** — 2+1+0+0+0 = 3.
- Bonus, previously only asserted: **`ACTIVE` and `LOCKED` render side by side**, confirming TASK-189's decision to
  keep lifecycle and quota as separate chips survives on a real page.

### Two small keeps (not test scaffolding)
- `CoursePackage` now carries `droppedAt`/`dropReason`. It could not previously express "paused", which is why
  `toCourseView` had to **cast its own input** to read the field — that cast is now deleted. A shape that can't
  represent a state the app has is how casts breed.
- The mock's `counts` is typed `Record<CourseStatus, number>`, so it can't drift from the five the FE renders.

**Evidence:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun run build` **ok** · suite **41/0** ·
fixture seed used for the test **reverted** (`git status` shows only the three intended files).

🔴 **Still owed by someone who may touch sid:** the same three-row check against the real API. My run proves the FE
renders the contract correctly; only sid proves the deployed BE emits it.
