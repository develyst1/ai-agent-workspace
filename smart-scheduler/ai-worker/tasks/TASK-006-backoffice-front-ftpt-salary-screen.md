# TASK-006: backoffice-front — "FT/PT Salary" admin screen (effective-dated)
- Source: SPEC-002
- Status: DONE
- Depends on: TASK-005 (DONE)
- Assignee: @Fern (smart-scheduler-backoffice-front, port 3100)

## What to do
Add an admin screen to manage full-time / part-time monthly salaries. Mirror the
Items pattern (page → partial → hook → service → API); add a nav item in
`AdminLayout.config.ts`. New service `src/services/recurring.service.ts` +
hook `src/hooks/backoffice/useRecurring.ts`.

1. **List** per-teacher salaries via `GET /v1/recurring-costs?externalSource=smart-scheduler`:
   teacher, current monthly salary (baht), effective-from, teacher type.
2. **Set salary once**: form (teacher/externalRef, monthly amount baht→satang,
   effective-from **month**, teacherType FULL_TIME/PART_TIME) → `POST /v1/recurring-costs`.
3. **Change salary (effective-dated)**: same form, new amount + effective-from month;
   make it clear past months are not affected.
4. **Salary history** per teacher: show the `effective_from → effective_to` rows with
   amounts, so the user sees what was in effect each period.

## Definition of Done
- [ ] Admin can set a teacher's monthly salary once; it appears in the list.
- [ ] A salary change with a future effective month is recorded without altering the
      prior period; the history view shows both rows with correct from/to.
- [ ] Amounts display in baht; inputs convert to satang; dark-theme layout matches Items.
- [ ] Repo build clean.

## Implementation Notes
Repo: `smart-scheduler-backoffice-front`. New "FT/PT Salary" screen consuming Jason's TASK-005
`/v1/recurring-costs` endpoints. Mirrors the Items pattern (page → partial → hook → service → API).
Confirmed the exact DTO by reading the backend `contract.ts` (`RecurringCostDTO`) + `recurring.ts` route +
`recurring.service.ts`.

**Files added**
- `src/services/recurring.service.ts` — `RecurringCost` type (matches `RecurringCostDTO`),
  `SetRecurringCostInput`; `listRecurringCosts({externalSource,externalRef})` →
  `GET /v1/recurring-costs`; `setRecurringCost(input)` → `POST /v1/recurring-costs`.
- `src/hooks/backoffice/useRecurring.ts` — `useRecurringCosts()` (lists `?externalSource=smart-scheduler`),
  `useSetRecurringCost()` (invalidates on success), and `currentOf(history)` helper (the open row =
  `effectiveTo===null`, else newest by `effectiveFrom`).
- `src/components/partials/FtptSalary/FtptSalaryContent.tsx` — the list. The flat rows (all effective-dated
  history) are **grouped per teacher** (by `externalRef`); each teacher shows one row: name/teacherId,
  type badge (ประจำ/พาร์ทไทม์), **current salary** (`thb`), current `effectiveFrom` (YYYY-MM), and actions.
  A **"ประวัติ (n)"** toggle expands the full effective-dated history (`from → to`, amount, "ใช้อยู่" badge on
  the open row) — DoD #4. Actions: **"ตั้งเงินเดือนครู"** (set new) + per-teacher **"ปรับเงินเดือน"** (change).
- `src/components/partials/FtptSalary/SetSalaryModal.tsx` — set/change form: teacherId (externalRef; disabled
  in change mode — identity), name (label), type (Select FULL_TIME/PART_TIME), monthly amount (baht→satang
  ×100), and **มีผลตั้งแต่เดือน** via a native `<input type="month">` (Mantine `TextInput type="month"` → the
  exact `YYYY-MM` the API wants; no extra dep). Blue Alert: new amount applies **from the chosen month
  onward, past months unchanged** (effective-dating, DoD #2/#3).
- `src/app/(admin)/ftpt-salary/page.tsx` — route. `AdminLayout.config.ts` — nav item **เงินเดือนประจำ/พาร์ทไทม์** (Banknote).

**Contract notes honoured:** `POST` supersedes the prior open row server-side (I just send a new
`{externalRef, amountMinor, effectiveFrom:"YYYY-MM", teacherType}`); the FE never mutates history directly.
Change-mode locks `externalRef` (the item is the anchor). Materialize/month-start posting is Jason's
service-token job — not FE.

**Verification (evidence)**
- `bunx tsc --noEmit` → **exit 0** (clean).
- `bun run build` → **exit 0**; `/ftpt-salary` prerendered.
- Loaded `/ftpt-salary` in a browser (dev): renders — nav item present, header + empty-state, and the list
  query resolved to the **empty state, not the error state** → `GET /v1/recurring-costs?externalSource=…`
  round-trips OK against the live ops API (no salary rows yet). No React error.
- ⚠️ **Set/change round-trip NOT executed live** — writing a salary hits the shared ops **Postgres**
  (brownfield-barred) and no rows exist yet; the modal-open couldn't be driven via the preview tool (same
  known quirk — the existing Items/FreelanceBudgets modals behave identically). Verified by inspection +
  typecheck; the modal reuses the exact proven Create-modal wiring, and the POST/GET contract is Jason's
  DONE TASK-005.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

- None blocking. One design note: the list **groups the flat effective-dated rows per teacher** client-side
  (by `externalRef`) and shows the `currentOf` row as the headline (open row, else newest `effectiveFrom`),
  with full history behind a "ประวัติ" toggle — the backend returns all rows ordered `externalRef, effectiveFrom
  desc`, so no server change needed. Flag if you'd prefer a flat (ungrouped) history table instead.
  > answer (Sober): **Per-teacher grouping with the current row as headline + history toggle is the right
  > UX — keep it.** It reads as "here's each teacher's salary, expand for history", which matches how คุณฟีน
  > thinks about it far better than a flat audit table. `currentOf` (open row else newest) is correct given
  > the effective-dating invariant. No server change, good call.

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20). Re-ran `backoffice-front` `bunx tsc --noEmit` → exit 0.
Verified against TASK-005's live contract: lists `GET /recurring-costs?externalSource=smart-scheduler`;
set/change POSTs `{externalRef, amountMinor, effectiveFrom:"YYYY-MM", teacherType}` and relies on the
server-side supersede (FE never mutates history — correct); change-mode locks `externalRef` (identity);
the `<input type="month">` yields the exact `YYYY-MM` the API wants; the effective-dating Alert messages
"applies from the chosen month onward, past months unchanged" (DoD #2/#3); history view shows
`from → to` + "ใช้อยู่" on the open row (DoD #4). `currentOf` resolves the in-effect row correctly.
Live write round-trip is DB-runtime, unverifiable under brownfield — accepted on the same basis as the
other FE tasks. No rework.

**This is the last buildable task — all 9 build tasks are DONE.** Only TASK-007 remains (BLOCKED on
@Porter's revenue-recognition decision).

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-006 | backoffice-front: "FT/PT Salary" admin screen (effective-dated) | SPEC-002 | DONE | Fern | TASK-005 |
```
