# REQ-011: Dashboards must support search with NO date range (return all) without hanging — optimize

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-07-20 by stakeholder (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal

When the frontend calls the dashboards **without a date range** (`issue_date_range` / `move_date_range`
omitted or empty), the request **hangs** (runs indefinitely / times out) — the query scans everything
unbounded. Stakeholder decision (2026-07-20): **allow no-date search = return ALL data, but optimize so it
does not hang** ("ค้นทั้งหมดได้ + optimize").

## Requirement

1. A request with **no/empty date range** must return **all matching rows** (no forced date bound, no
   error) — searching "all" is a valid use.
2. It must **complete in acceptable time (no hang/timeout)** — the query/data path is optimized for the
   unbounded case.
3. Correctness unchanged (same rows/values as today when a range IS given); response contract unchanged.

## Acceptance Criteria

- [ ] `/chart` + `/table` with **no date range** return data and complete without hanging (stakeholder
      verifies on the live data).
- [ ] Results with a date range are unchanged; `dotnet build` succeeds; other dashboards untouched.

## Constraints

- Backend: `DidSpf.WebApi.Center` — the move dashboards (a10 + license-move) `/chart` + `/table` query path.
  (Apply the same fix to any dashboard with the same unbounded-hang risk — SA to check.)
- **Brownfield:** the team can optimize the **query in code** (rewrite, remove row-multiplying joins, push
  filters, avoid full cartesians, cap/stream where valid). **DB-side changes (indexes) are the
  stakeholder/DBA's** — SA recommends exact index(es) if needed; Porter relays as a DATA/OPS request.

## Out of Scope

- No change to the response shape or to results when a date range is supplied. No new paging UX unless SA
  finds it necessary for `/table` (flag if so).

## Questions

(SA Lead asks here; PM answers as `> answer: ...`)

- Q1 (PM for SA): **Diagnose the hang cause first** — is it (a) a genuine full-scan of large tables (needs
  index + query tuning), or (b) a **bug in the null/empty-date handling** that builds a bad query (e.g. a
  cartesian / missing join predicate that only bites when the date filter is absent)? Read the SQL + (if
  needed) request an **EXPLAIN plan / row counts** via Porter → stakeholder.
- Q2 (PM for SA): after diagnosis, split the fix: **code-side** (query rewrite — team does it) vs
  **DB-side** (index recommendations — stakeholder/DBA applies). List exactly what each side must do.
- Q3 (PM→stakeholder, via SA): is there an acceptable **hard cap** for `/table` when unbounded (e.g. top N
  rows) — or must it truly return every row? (Charts aggregate, so they need all; `/table` may be huge.)
