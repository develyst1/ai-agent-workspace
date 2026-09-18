# TASK-391 — Rental round 2 (`REQ-091 §14`), FE: the paid-upfront / pay-per-session switch at creation, the "remove rental from remaining sessions" action on the course card

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-18)
**Contract (proposed to @Jason, TASK-390; confirmation via me):** `POST /courses { rental: { code, remark?, paidUpfront } }` (default true) · course DTO `rental: { code, remark, paidUpfront } | null` (null once removed) · `DELETE /courses/:id/rental` ⇒ `{ removed: n }`, gated by a NEW key `action:bookings.course-rental` (Jason confirms the name) · the confirm-message change is BE-only.
**Size S.** Ships with TASK-390.

## §1
- Course creation: beside the tier picker a `SegmentedControl` **Paid upfront / Pay per session** (default paid upfront); the summary reads `× 8 sessions · paid upfront` or `· pay per session`; `paidUpfront` rides in the body (asserted both ways).
- The course card: the rental line gains `(paid upfront)` / `(pay per session)`; a red **Remove rental from remaining sessions** (two taps; the dialog says no money is changed; names the count from the response after), gated by `can()` on the new key; after `200` the line reads *rental removed* and the calendar/course queries invalidate (the same set as the other course actions).
- 🚫 No client rule; the 46-key snapshot becomes 47 when Jason confirms the key (the pin moves with the reason).

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · shapes asserted · keys counted, both languages
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-18. **Paid upfront / Pay per session beside the tier picker (`paidUpfront` in the body, both ways); the red "Remove from remaining sessions" on the course card — two taps, no money, by the 47th key.**

```
bunx tsc --noEmit → exit 0
bun test          →  429 pass / 0 fail   (with TASK-393; +4 from this task — new lib/scheduler/course-rental-round2.test.ts)
bun run build     → ok
git status        →  391 + 393 together: 18 modified · 3 new (this task: types/api/contract.ts · types/app/scheduler/index.ts ·
                     services/scheduler.{service,mock.service}.ts · hooks/scheduler/useScheduler.ts · Bookings/{CreatePlanFlow,CoursePackagePanel}.tsx ·
                     lib/rbac/actions.ts · dictionaries.ts · 3 test files)
```
Built against @Jason's CONFIRMED contract (TASK-390, 2400/0). Built together with TASK-393 (next row on the board): the
snapshot went 46 → 48 in one go (47th here, 48th there) — **checked equal to the BE's `ACTION_KEYS` by script on this
machine (48 = 48, key for key, in order)**.

### `§1` — creation
- Beside `RentalTierPicker`, a `SegmentedControl` **Paid upfront / Pay per session**, default paid upfront (`useState(true)`;
  mutation 1 fails). The summary line reads `… × 8 sessions · Paid upfront` / `· Pay per session`.
- **`paidUpfront` rides in the body BOTH ways** — the form's literal carries it, the service copies it as a plain
  boolean (never `undefined`-dropped: JSON keeps `false`; asserted with `JSON.stringify` on both states; mutations 2
  and 3 — dropped from the form / sent only when false — fail two tests each). `CreateCourseInput.rental.paidUpfront:
  boolean` (required when the rental is on).

### `§2` — the course card
- The rental line gains **`(Paid upfront)` / `(Pay per session · n to collect)`** — `unpaidSessions` from the DTO, shown
  only per-session and only when > 0 (read exactly twice, both display; nothing gates on it — asserted).
- A red dotted **Remove from remaining sessions** link on the line, **`can("action:bookings.course-rental")`** AND the
  card's existing lifecycle guard (`isCourseWritable`); inside `c.rental && (` so a REMOVED course (`rental === null`)
  shows no line and no link — no second condition (asserted). **Two taps:** the link opens `RemoveCourseRentalDialog`;
  its red confirm calls **`DELETE /courses/:id/rental`** (mutation 5 — one tap — fails). The dialog says what the
  server does: *"No money is changed: a rental paid upfront stays paid, and sessions already collected stay
  collected."* (both languages, pinned). After `200` the notice names **the count from the response**
  (`res.removed`; mutation 6 — an invented count — fails); the hook uses **`invalidateAll`**, the same set as every
  other course action (mutation 7 fails). Refusals (`RENTAL_NOT_ON_COURSE`, `404`) = the server's sentence in the dialog.
- Copy: `rental.*` +8 (paidUpfront · payPerSession · toCollect · removeFromCourse · …Title · …Body · …Confirm ·
  removedFromCourseOk) ×2.
- Pins moved with the reason: TASK-374's two body pins now carry `paidUpfront`; the summary-line pin carries the variant;
  the snapshot count (`action-gate.test.ts`) 46 → 47 (→ 48 with 393), the sweep 68 → 69 (→ 71).

### 🔑 Break-and-watch — nine mutations, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | default = pay per session | **1 fail** |
| 2 | the flag dropped from the form's body | **2 fail** |
| 3 | the service sends the flag only when false | **2 fail** |
| 4 | the remove link ignores the key | **1 fail** |
| 5 | remove on one tap | **1 fail** |
| 6 | the notice invents its own count | **1 fail** |
| 7 | the remove skips the shared invalidation | **1 fail** |
| 8 | the snapshot loses the 47th key | **2 fail** |
| 9 | the variant word vanishes from the card | **1 fail** |
`md5` identical on all five mutated files.

### ⚠️ Not seen on a screen
For @Tanya on `sid`: create a course with a rental, *Pay per session* ⇒ the card reads `(Pay per session · 8 to collect)`
and every session's `R` is red; mark two paid ⇒ `6 to collect`; remove ⇒ the notice says `Rental removed from 6
sessions`, the line is gone, the two paid stay green; a course with *Paid upfront* ⇒ `(Paid upfront)`, removing it
posts nothing back (the ledger unchanged — QA's check, not mine); without the key the red link is absent.
