# TASK-455 — `REQ-105 §2` (SPEC-091 §2): cancelled/expired VOUCHERS (and COURSES) sort to the BOTTOM, faded, under a divider — FE, S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-23) · **Size S.** No BE change, no contract needed. The REQ-105 slice; take it whenever you are free.

## §0 The rule (customer via Porter)
A cancelled voucher must not sit among the active ones — bottom of the list and faded, "like cancelled courses". (Courses are not separated today either — the customer is describing the wish, not an existing pattern. The owner agreed to apply it to both.)

## §1
- ONE pure `sortEntitlements(rows)` (value-tested), shared by `VoucherPanel` and `CoursePackagePanel` so the two cannot drift: live first (existing order kept), then `ENDED`/`EXPIRED`/`EXHAUSTED`/`CANCELLED` at the bottom, each group's internal order unchanged.
- Faded rendering for the dead group (`opacity`, the existing status chip kept) and a small divider row above it — copy both languages, counted.
- 🚫 No new route, no separate page, no client status derivation (the server's `status` decides — REQ-103's rule).

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · `sortEntitlements` by value (both panels, mixed lists, an empty dead group ⇒ no divider) · the two panels use the ONE sorter (pinned) · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-24. **ONE `sortEntitlements` on both panels: cancelled/expired to the bottom, faded, under a divider.**

```
bunx tsc --noEmit → exit 0
bun test          →  559 pass / 4 fail   ⚠️ BASELINE on this tree = 551 pass / 4 fail (the four are another hand's — see TASK-450 §3); this work adds +5 passing, 0 failing
bun run build     → ok
git status        →  3 source modified (dictionaries · VoucherPanel · CoursePackagePanel) · 2 new (lib/scheduler/entitlement-order.ts + its test)
```
No BE change. 🚫 No deploy asked.

- **Pure (`lib/scheduler/entitlement-order.ts`), value-tested:** `sortEntitlements(rows)` ⇒ `{ rows, live, dead, divider }`
  — live first in the server's order, then the dead group in its own (stable; mutation 3 reverses a group and fails).
  `isDeadEntitlement(status)` = the server's word only: `ENDED · EXPIRED · EXHAUSTED · CANCELLED`.
- **Two readings I had to choose, both stated:** (1) **`DROPPED` (paused) and `COMPLETED` are NOT dead** — a paused course
  comes back and a finished one was not cancelled; burying either would hide a live thing (mutation 1). (2) **a row with no
  `status`** (an older payload) **stays live** — "dead" is the claim that hides a row at the bottom, so it needs the server
  to have said it (mutation 2). Say the word if the customer wants COMPLETED down there too; it is one entry in the list.
- **`divider` is a BETWEEN, not a header:** true only when both groups exist, so the Inactive tab (all dead) shows no
  divider and neither does an all-live list (mutation 4). The panels render it at `i === sorted.live.length` (mutation 7).
- **Both panels, one sorter:** `VoucherPanel` (a table: a full-width divider row, `opacity-60` on the dead `<tr>`) and
  `CoursePackagePanel` (a card grid: a `col-span-full` divider line, `opacity-60` on the dead card). The status chips are
  untouched — the fade is the grouping, the chip still says which word it is. Copy: `bookings.inactiveDivider`, both
  languages, EN = TH key count pinned.
- 🚫 **No client status derivation** (REQ-103's rule): asserted that neither panel filters or sorts on a status literal and
  that `dead` comes only from the shared predicate. (A chip reading one status for its icon is rendering, not membership —
  the pin is written to allow exactly that and nothing more.)

### 🔑 Break-and-watch — seven, `try/finally`, checksum, `BASELINE=0` in this file
| # | mutation | result |
|---|---|---|
| 1 | `DROPPED` (paused) counts as dead | **2 fail** |
| 2 | a row with no status counts as dead | **2 fail** |
| 3 | a group is re-sorted inside (order lost) | **1 fail** |
| 4 | the divider shows on an all-dead list | **1 fail** |
| 5 | the voucher panel skips the sorter's result | **1 fail** — 📌 slipped first: the pin asserted the CALL, so a panel could call `sortEntitlements` and still render `data.items`; the rendered list is now pinned as `sorted.rows` |
| 6 | the course panel stops fading the dead group | **1 fail** |
| 7 | the divider lands at the top instead of the boundary | **1 fail** |
`md5` identical on the three mutated files.

### Definition of Done
- [x] **559 / 4** (baseline 551/4 — the four are not this work) · `tsc` 0 · build ok
- [x] `sortEntitlements` by value (mixed list · both panels · an empty dead group ⇒ no divider) · the ONE sorter pinned in both
- [x] 🔑 Break-and-watch — seven, `BASELINE=`, `finally`, checksum

### ⚠️ Not seen on a screen
For @Tanya on `sid`: Bookings → Vouchers with at least one cancelled voucher ⇒ the live ones first, then a thin
**CANCELLED / EXPIRED** row, then the cancelled ones at 60% opacity (chip and Manage still there); Courses (Active tab)
⇒ the same with the cards; the **Inactive** tab ⇒ no divider at all (everything there is already cancelled); a page with
only live rows ⇒ no divider. The sort is within the page the server sent — paging is unchanged.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-24)
Re-run by me: tsc 0, build ok, the new work all passing; the ONE `sortEntitlements` is shared by both panels as asked. Her two readings are right and I am recording them as the rule: **`DROPPED` (paused) and `COMPLETED` are NOT dead** — a paused course is coming back and a finished one is an achievement, neither belongs under a "cancelled / expired" divider — and **a row with no `status` stays live**: hiding a row must require the server to have SAID so. If the customer wants either moved, it is one list entry.
⚠️ Not counted as green: see my note on TASK-457 — the suite carries 4 failures that predate this slice.
