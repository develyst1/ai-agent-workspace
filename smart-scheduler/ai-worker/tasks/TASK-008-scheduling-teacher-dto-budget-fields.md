# TASK-008: scheduling — expose budget fields on /teachers DTO + persist limit-override
- Source: SPEC-001 (split out of TASK-002 review)
- Status: DONE
- Depends on: TASK-002 (DONE)
- Assignee: @Jason (smart-scheduler-back, port 3001)

## What to do
Small scheduling-side surface so Fern's TASK-004 can render baht `remaining/budget` +
near-cap and toggle a durable override. Files: `src/lib/ops-client.ts`,
`src/db/mappers.ts` (teacher DTO), `src/routes/api.ts`, `src/services/scheduler.service.ts`.

1. **Extend `fetchTeacherQuotas`** to also read, per EXPENSE item,
   `metadata.monthlyBudgetMinor` and `reorderLevel` (the items endpoint already returns
   `metadata` after TASK-001). Carry them on `TeacherQuota`.
2. **Teacher DTO fields** (all satang, `*Minor`) via `attachTeacherQuotas`:
   - `budgetMinor` = `metadata.monthlyBudgetMinor`
   - `remainingMinor` = `quantityOnHand` (**rename** the current `quotaRemaining` → `remainingMinor`;
     it is satang now, not hours — TASK-004 is a fresh consumer, no legacy break)
   - `reorderMinor` = `reorderLevel` (nullable)
   - keep `overLimit` = `remainingMinor ≤ 0`
3. **Durable per-teacher override**: `PATCH /teachers/:id/limit-override` `{override:boolean}`
   persisted in scheduling (a column on `teachers`, or `app_settings` keyed by teacher — your
   call; a boolean is enough). The **confirm path** (TASK-002) reads it: if set, pass
   `allowNegative:true` to `drawFreelanceBudget` (so a capped teacher can still be booked). Surface
   the current value on the teacher DTO (`limitOverride`) so the FE reflects it.

## Definition of Done
- [ ] `GET /teachers` returns `budgetMinor`, `remainingMinor`, `reorderMinor`, `overLimit`,
      `limitOverride` per freelance (satang), sourced from the ops item.
- [ ] `PATCH /teachers/:id/limit-override` persists and is reflected on the next `GET /teachers`.
- [ ] With override on, confirming a capped freelance passes `allowNegative:true` (no 409 block).
- [ ] `bun test` + `bunx tsc --noEmit` clean; add a small mapper/override test.

## Implementation Notes
Repo: `smart-scheduler-back` (port 3001). Followed Sober's confirmed field contract exactly.

- **`ops-client.ts`** — `TeacherQuota` now has `remainingMinor` (renamed from `quotaRemaining`, satang),
  `budgetMinor` (= `metadata.monthlyBudgetMinor`), `reorderMinor` (= `reorderLevel`). `fetchTeacherQuotas`
  reads `metadata` + `reorderLevel` from the items endpoint (both present since TASK-001). `attachTeacherQuotas`
  sets `budgetMinor`/`remainingMinor`/`reorderMinor`/`overLimit` (= `remainingMinor ≤ 0`) on the teacher DTO.
- **`mappers.ts`** (`toTeacherDTO`) — added `budgetMinor`, `remainingMinor`, `reorderMinor` (default null),
  `overLimit`, `limitOverride` (default false); dropped `quotaRemaining`.
- **Override persistence — chose `app_settings`, not a new column** (task allowed either; KV avoids a
  migration that BE can't apply/verify under the brownfield rule). Key `limit-override:<teacherId>` →
  jsonb boolean. Helpers `readLimitOverride` (one) + `readLimitOverrides` (batch, `LIKE 'limit-override:%'`).
  `setLimitOverride(id, override)` upserts (mirrors the existing `setTeacherTypeOrder` app_settings pattern).
- **Route** `PATCH /teachers/:id/limit-override {override:boolean}` (`v.setLimitOverride`) → `setLimitOverride`.
- **DTO wiring** — `getCalendar` + `getTeachers` attach `limitOverride` from the batch read after
  `attachTeacherQuotas`. Single-teacher mutation responses keep the default `false` (FE re-fetches the list).
- **Confirm path (TASK-002) now honours the durable override**: `allowNegative = override || readLimitOverride(tx, teacherId)`.

**Verification**
- `bunx tsc --noEmit` → clean (exit 0).
- `bun test` → **69 pass / 0 fail** across 16 files. Added: `attachTeacherQuotas` mapping test
  (satang budget/remaining/reorder + `overLimit` on remaining≤0, mocked `fetch`) and a `toTeacherDTO`
  field-shape test (`mappers.test.ts`).
- ⚠️ App_settings persistence + read (PATCH round-trip, confirm-path `allowNegative`) are DB-runtime,
  **verified by inspection, not executed** (brownfield: no DB). Logic reuses the proven
  `setTeacherTypeOrder` app_settings pattern.

**@Fern — TASK-004 unblocked.** Teacher DTO now ships (satang): `budgetMinor`, `remainingMinor`,
`reorderMinor`, `overLimit`, `limitOverride`, plus `hourlyRate`. Near-cap = `remainingMinor ≤ reorderMinor`.
Toggle the override via `PATCH /teachers/:id/limit-override {override}` (persists server-side; replaces the
old localStorage-only switch).

## Questions
(Jason asks; Sober answers as `> answer: ...`)

- **Note (not blocking):** I stored the override in `app_settings` rather than adding a `teachers` column,
  to avoid shipping a migration BE can't apply/verify (brownfield). If you'd prefer a real column for
  queryability later, easy to switch — flag it.
  > answer (Sober): **`app_settings` is the right call** — avoids an unverifiable migration under the
  > brownfield rule, and a boolean per teacher doesn't need a queryable column. Reuses the proven
  > `setTeacherTypeOrder` KV pattern. Leave as-is; revisit only if we ever need to query "who's overridden".

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20). Re-ran `smart-scheduler-back`: `bun test` → **69 pass / 0 fail**,
`tsc` exit 0. Verified the field contract I confirmed is implemented exactly (`budgetMinor`,
`remainingMinor` renamed from `quotaRemaining` (satang), `reorderMinor`, `overLimit`, `limitOverride`);
`fetchTeacherQuotas` now reads `metadata.monthlyBudgetMinor` + `reorderLevel`; the durable override is
read in the confirm path (`allowNegative = override || readLimitOverride(tx, ...)`, `scheduler.service.ts:564`)
and batch-attached on both `getCalendar`/`getTeachers`. App_settings persistence is DB-runtime (verified
by inspection, reuses the proven type-order pattern) — accepted. No rework. **TASK-004 unblocked (and DONE).**

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-008 | scheduling: teacher DTO budget fields + persist limit-override | SPEC-001 | DONE | Jason | TASK-002 |
```
