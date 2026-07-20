# REQ-007: Dashboard date fields — one field, formatted value (drop the `_formatted` twin)

- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-07-20 by stakeholder (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal

The dashboard `/table` (and `/chart`) responses currently expose a **pair** of keys for a date — the raw ISO
value plus a parallel `_formatted` key, e.g.:

```json
"issue_date": "2026-03-24",
"issue_date_formatted": "24/03/2569"
```

Stakeholder wants this **simplified**: keep only the base key, and put the **formatted (Thai พ.ศ.,
dd/mm/yyyy) value** in it. Drop the `_formatted` twin. Stakeholder: "เอา issue_date เท่านั้นพอ แต่ value ขอ
แบบ formatted … แบบนี้พอ อย่าทำให้มันซับซ้อน":

```json
"issue_date": "24/03/2569"
```

## Requirement

1. In the dashboard `/table` and `/chart` responses, **remove the `*_formatted` twin keys** and set the
   base date key's value to the **formatted dd/mm/yyyy (พ.ศ.) string**. Concretely for the move dashboards:
   `issue_date` = `"24/03/2569"`, and **delete `issue_date_formatted`**.
2. **Response-shape change only** — the underlying value is the same date already computed; just one key,
   formatted. No query/filter/logic change. Request bodies (date-range filters) are untouched.

## Acceptance Criteria

- [ ] `/table` + `/chart` responses have a single `issue_date` = formatted (e.g. `"24/03/2569"`); no
      `issue_date_formatted` key remains.
- [ ] No other behaviour changes; `dotnet build` succeeds.

## Constraints

- Backend only: `DidSpf.WebApi.Center`. Applies to the **move dashboards**: `DASHBOARD_MOVE_A10`
  (delivered — REQ-005) and `DASHBOARD_LICENSE_MOVE` (REQ-006, in flight). Coordinate with REQ-006 since
  both touch the License Move models.

## Out of Scope

- No change to filtering, values, or the `ResponseResult` envelope. No frontend code.

## Questions

- Q1 (PM→stakeholder): **Scope confirm.** Apply this only to the move dashboards (a10 + license-move), or
  **also to License Book** (REQ-003/004, delivered) for consistency? Default = move dashboards only.
- Q2 (PM→stakeholder): Should the **other date fields also become single + formatted** for consistency —
  i.e. `move_date` (currently ISO `"2026-06-22"`) and `receipt_date` → dd/mm/yyyy พ.ศ.? Or only `issue_date`
  as literally requested? Default = follow the exact request (collapse the `issue_date` pair; leave other
  single-key dates as-is) to avoid overcomplicating.
