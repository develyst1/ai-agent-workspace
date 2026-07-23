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

## SA Diagnosis — Sober, 2026-07-21 (read both repo SQLs)

Read `TTInformMoveDtlRepository.GetMoveA10Dashboard` (a10) + `TTLicenseDtlRepository.GetMoveLicenseDashboard`
(license-move).

**Q1 → (a) genuine full-scan, NOT a null/empty-date bug.** In both repos the date filter is *conditionally*
concatenated: empty `dateStart`/`dateEnd` simply omits the `AND L.ISSUE_DATE >= …` / `AND DTL.MOVE_DATE >= …`
line (license L252-253; a10 L75-76). Every JOIN carries a proper ON clause — dropping the date predicate does
**not** create a cartesian or a missing-join. So no-date already returns all rows *correctly* (no error path); it
is purely **unbounded + slow**. The amplifiers that turn "slow" into "hang" at full-table scale:
- **License: 4 correlated scalar sub-queries per output row** — `MovedQty` (SUM over `T_T_INFORM_MOVE_DTL`) +
  **three** that each re-scan `T_T_REQUEST_MOVE` by `REQUEST_ID` (`MoveTypeCode`, `BuyerGroupNo`, `BuyerUnitName`).
  Unbounded = N×4 sub-query executions over the whole `LICENSE_STATUS=40` set.
- **a10: 1 correlated sub-query per row** (`MoveTypeCode` from `T_T_REQUEST_MOVE`).
- Both: `V_PROVINCE` joined on a **name string** (`VP.PROVINCE_NAME = LM.DEST_PROVINCE_NAME` — unindexable), a
  `VW_PRODUCT` **view** join, and a full `ORDER BY ISSUE_DATE/MOVE_DATE DESC` sort of the entire result.

**Q2 → fix split:**
- **Code-side (team / Jason) — deterministic, result-preserving, safe regardless of DB facts:**
  1. Collapse the three `T_T_REQUEST_MOVE`-by-`REQUEST_ID` correlated sub-queries (license) into **one** `LEFT JOIN`
     to a pre-aggregated derived table `(SELECT REQUEST_ID, MAX(MOVE_REQUEST_TYPE), MAX(AUTHORITY_NAME),
     MAX(BA.AUTHORITY_GROUP_NO) … GROUP BY REQUEST_ID)`. Turns 3×N sub-query runs into a single hash join; values
     identical (same MAX per REQUEST_ID). Same for a10's single `MoveTypeCode` (minor).
  2. Convert `MovedQty` correlated SUM → `LEFT JOIN` to `(SELECT REF_LICENSE_NO, PRODUCT_CODE, SUM(QUANTITY)
     GROUP BY …)`. Identical values.
  3. (Only if Q3 says a cap is OK) add a bounded `FETCH FIRST :N ROWS ONLY` for the **/table** unbounded case —
     charts must still aggregate all, so the cap is `/table`-only.
- **DB-side (stakeholder/DBA) — the primary lever; needs the OPS request below to finalize exact indexes.**
  Candidate indexes to confirm against EXPLAIN + existing indexes: `T_T_LICENSE(LICENSE_STATUS, ISSUE_DATE)`,
  `T_T_INFORM_MOVE_DTL(MOVE_DATE)` + `(REF_LICENSE_NO, PRODUCT_CODE)`, `T_T_REQUEST_MOVE(REQUEST_ID)`,
  `T_T_LICENSE_MOVE(LICENSE_ID)`, `T_T_LICENSE_DTL(LICENSE_ID)`, `T_T_LICENSE(LICENSE_NO)`.

**DATA/OPS REQUEST (via Porter → stakeholder/DBA) — needed to finalize the DB-side + rule out a hidden dup bug:**
1. `EXPLAIN PLAN` for both `/chart` (and `/table`) queries **with no date range** (the unbounded form).
2. Row counts: `T_T_LICENSE` (status 40), `T_T_LICENSE_DTL`, `T_T_INFORM_MOVE_DTL`, `T_T_REQUEST_MOVE`.
3. Existing indexes on the join/filter/sort columns listed above.
4. **Cardinality checks (latent-dup risk):** is `T_T_LICENSE_MOVE` 1:1 per `LICENSE_ID`? is `V_PROVINCE.PROVINCE_NAME`
   unique? If either is many-per-key, the INNER `LM` join / `V_PROVINCE` name-join **multiplies rows** — both a
   perf hit and a correctness bug (inflated aggregates), and the fix would add de-dup. Cannot tell from code.

**Q3 → stakeholder:** for the **/table** unbounded case, is a hard cap (e.g. top-N most-recent rows) acceptable, or
must it return every row? (Charts aggregate → need all; a fully unbounded `/table` may be huge and is the part most
likely to hang the client too.)

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
