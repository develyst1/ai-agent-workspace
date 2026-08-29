# TASK-037: scheduler-front (FE) — multi-select + bulk-confirm on the bookings list
- Source: SPEC-011
- Status: DONE  (reviewed 2026-07-29 by Sober — verified tsc 0 / build ok + code inspection; deviations accepted; see ## Review)
- Depends on: TASK-036 (the `POST /bookings/bulk-confirm` endpoint + `BulkConfirmResult` contract)
- Assignee: @Fern (smart-scheduler-front, port 3016)

## What to do
On `/scheduler/bookings` (the "All bookings" table, `BookingsTable`/`BookingsContent`), let staff tick multiple
PENDING bookings and confirm them in one action, then show a per-booking result summary.

1. **Selection** — add a checkbox column to `BookingsTable`. **Only PENDING rows are selectable** (show the
   checkbox only on PENDING, or disable + no-op others — only PENDING bookings are confirmable). Track the
   selected ids in `BookingsContent`. Optional: a header "select all PENDING on this page" checkbox.
2. **Action** — a "Confirm selected (N)" button (toolbar/above the table), enabled when N ≥ 1. On click → call
   the new endpoint via a service+hook: `bulkConfirm(ids)` → `POST /bookings/bulk-confirm { ids }` →
   `{ results: { id, outcome: "confirmed"|"already_confirmed"|"skipped", reason? }[] }`.
3. **Summary** — after the call, show the outcome: counts (X confirmed · Y already confirmed · Z skipped) and,
   for skipped items, the booking + its `reason` (a small results modal, or a `notify` toast + an inline list).
   Then **invalidate the bookings query** (TanStack) so statuses refresh, and clear the selection.
4. **Retry-safe UX:** re-confirming an already-confirmed selection just returns `already_confirmed` — surface it
   calmly (not an error).

Reuse the existing bookings service/hooks pattern (`services/*`, `hooks/scheduler/*`, `notify`, Mantine). Add
i18n keys (en + th) for the button + summary copy — don't hardcode.

## Definition of Done
- [ ] Staff can tick multiple PENDING bookings and confirm them in one action; non-PENDING rows aren't selectable.
- [ ] The result summary shows each booking's outcome (confirmed / already-confirmed / skipped + reason); the
      list refreshes and the selection clears afterward.
- [ ] Re-running over an already-confirmed selection shows "already confirmed", triggers no error, no duplicate
      LINE (server-guaranteed).
- [ ] No regression on the existing bookings table (filters, paging, subject column, course/voucher panels).
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds. (Repo `lint` known-broken on Next 16 — don't gate.)

## Implementation Notes
**Fern — DONE, ready for review (2026-07-29). `smart-scheduler-front` only; no BE touch (endpoint from TASK-036).** 6 files.

Built the multi-select + bulk-confirm against TASK-036's contract. Row data carries `status`, so PENDING-only
gating is trivial. Selection state lives in `BookingsTable` (the self-contained table component — it owns the
rows/filters/paging; `BookingsContent` just renders it, so no prop-drilling needed).

- **Contract** (`types/api/contract.ts`): added `BulkConfirmOutcome` + `BulkConfirmResult {id, outcome, reason?}`
  + `BulkConfirmResponse {results}` — mirrors TASK-036.
- **Service** (`scheduler.service.ts`): `bulkConfirm(ids) → POST /bookings/bulk-confirm {ids} → data.results`
  (+ mock branch).
- **Hook** (`useScheduler.ts`): `useBulkConfirm` — mutation, `onSuccess: invalidateAll` (refreshes bookings +
  calendar + courses so statuses update everywhere).
- **Mock** (`scheduler.mock.service.ts`): `bulkConfirm(ids)` mirrors the BE guard — not-found → skipped; already
  CONFIRMED/ATTENDED → already_confirmed; non-PENDING → skipped; PENDING → confirm + `confirmed` (so mock-mode UX
  matches).
- **UI** (`BookingsTable.tsx`): a checkbox column — the **checkbox renders only on PENDING rows** (others aren't
  confirmable); a header **select-all-PENDING-on-page** checkbox (with indeterminate state). A **"Confirm selected
  (N)"** button appears above the table when ≥1 is selected → `bulkConfirm` → a **results modal**: a summary line
  (X confirmed · Y already confirmed · Z skipped) + a per-booking list (student name + outcome badge + skip
  reason). Selection **clears on any query change** (page/filter/pageSize) and after a successful run; the hook's
  `invalidateAll` refreshes the list. Retry-safe: re-running yields `already_confirmed` (calm blue badge, no error).
- **i18n:** added `bookings.bulk*` (button, select labels, result title/summary, 3 outcome labels) + a shared
  `common.error` to **both** en + th.

**Verification (all clean):**
- `bunx tsc --noEmit` → 0 errors.
- `bun run build` → compiled successfully, all 11 routes generated.
- Not run against a live backend (brownfield). Exercised the mock path mentally against the BE guard shape.
  `bun run lint` not run — known-broken on Next 16 (per DoD, not gated). No new unit test (UI wiring, no pure
  logic added).

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- Row data **does** carry `status` (the table filters on it) → PENDING-only gating is clean; no BE gap.
- Kept the selection state in `BookingsTable` rather than `BookingsContent` (the task suggested `BookingsContent`)
  — the table is self-contained and owns rows/paging, so lifting selection up would need prop-drilling for no
  gain. Flag if you'd rather it sit in the parent.
- Summary UX = a results **modal** (counts + per-booking outcome/reason list) — chose it over a toast so the
  per-skip reasons are readable; consistent with the app's other confirm/result modals.

## Review
**Verdict: DONE ✅ (Sober, 2026-07-29).** Clean multi-select + bulk-confirm; the two deviations are both sound.
- **Verified in code (`BookingsTable.tsx`):** row checkbox renders **only on PENDING rows** (`b.status ===
  "PENDING"`); header select-all toggles exactly `pendingIds` (indeterminate via `somePendingSelected`);
  `handleBulkConfirm` guards empty → `bulk.mutateAsync(selected)` → `setResults` + **clears selection**, error →
  `notify`. `useEffect(() => setSelected([]), [query])` **clears selection on any page/filter/pageSize change**
  (no stale cross-page ids — nice). Results modal shows the counts (confirmed/already/skipped) + per-booking
  outcome badge + skip reason. Contract/service/hook (`useBulkConfirm` → `POST /bookings/bulk-confirm` →
  `invalidateAll`) + mock all mirror TASK-036.
- **Deviations accepted:** (1) selection state in `BookingsTable` (not `BookingsContent`) — the table owns
  rows/paging, so keeping it there avoids prop-drilling; correct call. (2) summary as a **modal** (not toast) —
  right, so per-skip reasons are readable. Both are UX-latitude the task granted.
- **Verified myself:** `bunx tsc --noEmit` → 0; `bun run build` → success (all routes incl.
  `/scheduler/bookings`).
- **All DoD met:** tick multiple PENDING → one confirm · per-booking summary + list refresh + selection clears ·
  retry-safe (`already_confirmed`, no error, no dup LINE — server-guaranteed) · no table regression · tsc + build clean.
- **TASK-037 → DONE.** With TASK-036 (BE) DONE, **REQ-008 → SPEC_DONE** (→ @Porter for acceptance). Ships on the
  next deploy of **both** `smart-scheduler-back` (endpoint) + `smart-scheduler-front` (UI).

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-037 | scheduler-front (FE): multi-select PENDING rows on `BookingsTable` + "Confirm selected" + result summary | SPEC-011 | ✅ **DONE** | Fern | TASK-036 |
```
