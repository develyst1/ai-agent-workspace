# TASK-035: DASHBOARD_TRACKING — `license_id` on /table + per-license `/detail` endpoint (REQ-019)

- Source: SPEC-021 Part B (REQ-019)
- Status: DONE
- Assignee: Jason (BE)
- Depends on: TASK-034 (reuses its `LicenseExpiryStatusLabel` helper)

## Review — Verdict: DONE (code) — Sober (SA), 2026-07-24
Implementation matches SPEC-021 exactly:
- **0. Orphan cleanup correct + backbone safe** — `AS LicenseStatus` → 0 hits in the repo, `LicenseStatus` → 0 in
  `DashboardTrackingQueryResult`, while `WHERE L.FORM_ID =:FORM_ID AND L.LICENSE_STATUS =:LICENSE_STATUS` (=40) is still
  there. Exactly the split I asked for. ✔
- **1.** `license_id` on the model (L140) + `CryptoExtensions.Encrypt(...)` in the service (L330); existing keys untouched. ✔
- **2/3.** `GetTrackingLicenseDetail` (repo L543) called from the service (L255); `GET .../dashboard-tracking/detail`
  (controller L154). Same `FORM_ID=10 AND LICENSE_STATUS=40` backbone ⇒ a bad/non-อ.10 id returns no rows. ✔
- **4. Reuse verified — no second implementation:** `LicenseExpiryStatusLabel` = **1 definition** (L364) used by detail
  (L266), filter (L319) and table (L339); `MoveStatusLabel` = **1 definition** (L352) used by detail (L291) and table
  (L340). Detail's badge = `MoveStatusLabel(Σ ApprovedQty, Σ MovedQty)` (L291-293) = roll-up A. ✔ Build 0 err.

### ⚠️ Risk found in MY spec (not in Jason's code) — capture-verify item
`/table`'s move-status uses **`ACT` = `SUM(T_T_INFORM_MOVE_DTL.QUANTITY)` grouped by `REF_LICENSE_NO` only**
(license-level, product-agnostic). `/detail`'s badge sums the **product-matched** lines
(`REF_LICENSE_NO` **+ `PRODUCT_CODE`**). Those are equal **only if every INFORM_MOVE line for the license matches a
`T_T_LICENSE_DTL.PRODUCT_CODE`**. If any moved row has a P-code not on the license (legacy `'-'`, data drift), then
`/table ACT > /detail Σ moved` and **the two badges can disagree** — precisely what REQ-019 said must never happen.
I specced both sources (SPEC-021 §B4 said "compute from the same summed lines"), so this is my gap, not the build.

**Concrete check for the capture (cheap, decides it):**
```sql
SELECT L.LICENSE_NO,
       (SELECT NVL(SUM(QUANTITY),0) FROM T_T_INFORM_MOVE_DTL WHERE REF_LICENSE_NO = L.LICENSE_NO)              AS TABLE_ACT,
       (SELECT NVL(SUM(I.QUANTITY),0) FROM T_T_INFORM_MOVE_DTL I
         WHERE I.REF_LICENSE_NO = L.LICENSE_NO
           AND EXISTS (SELECT 1 FROM T_T_LICENSE_DTL D WHERE D.LICENSE_ID = L.ID AND D.PRODUCT_CODE = I.PRODUCT_CODE)) AS DETAIL_SUM
FROM T_T_LICENSE L WHERE L.FORM_ID = 10 AND L.LICENSE_STATUS = 40
  AND (SELECT NVL(SUM(QUANTITY),0) FROM T_T_INFORM_MOVE_DTL WHERE REF_LICENSE_NO = L.LICENSE_NO) > 0
FETCH FIRST 50 ROWS ONLY;
```
`TABLE_ACT = DETAIL_SUM` on every row ⇒ no divergence possible, ship as-is (like the A≡B validation for roll-up A).
Any row where they differ ⇒ I'll switch the **modal badge** to the license-level `ACT` (one-line change; per-line numbers
stay product-matched) so the badge always equals the table. **Do not change code until the check says so.**

## Goal
The FE table row is clickable → opens "รายละเอียดหนังสืออนุญาต อ.10" (header + per-product lines with approved / moved /
remaining / %). Today there is **no detail endpoint and no id on the row**. Add both. All DID_SPF; reuse the
already-validated joins + the existing move-status roll-up.

## Changes

### 0. Clean up the orphan TASK-034 created (Sober's answer to Jason's flag)
`DashboardTrackingQueryResult.LicenseStatus` and its `,L.LICENSE_STATUS AS LicenseStatus` select line in
`GetTrackingDashboard` are now unread by C# → **remove both** (house rule: clean up what your own change orphaned).
Safe — Dapper maps by name, and this task's modal uses the expiry-derived helper, not the code.
**⚠ Keep `WHERE … AND L.LICENSE_STATUS =: LICENSE_STATUS` (=40) — that's the backbone row filter, a different concept.**

### 1. `/table` exposes the id (additive)
`DashboardTrackingTableRow`: add `[JsonProperty("license_id")] public string LicenseId { get; set; } = string.Empty;`
→ set to `CryptoExtensions.Encrypt(r.LicenseId?.ToString() ?? "")` (Center convention: AES-encrypted ids on the wire).
**Existing keys unchanged.**

### 2. DAL `TTLicenseDtlRepository.GetTrackingLicenseDetail(int licenseId)`
One query, header repeated per line (map header from the first row in C#) — full SQL in SPEC-021 §B3:
`T_T_LICENSE L` (`L.ID=:LICENSE_ID AND L.FORM_ID=:FORM_ID(10) AND L.LICENSE_STATUS=:LICENSE_STATUS(40)`) INNER
`T_T_LICENSE_DTL DTL`; LEFT `T_M_UNIT`; LEFT slim `T_M_PRODUCT→PRODUCT_GROUP→PRODUCT_TYPE` chain (REQ-012 style) → LEFT
pre-agg `T_M_PRODUCT_TYPE_GROUP` for `PRODUCT_TYPE_GROUP_NAME`; LEFT pre-agg
`(SELECT REF_LICENSE_NO, PRODUCT_CODE, SUM(QUANTITY) … GROUP BY …) MV` on `L.LICENSE_NO`+`DTL.PRODUCT_CODE`
(the DR-16-proven join). `ORDER BY DTL.ITEM_NO`. All pre-aggregated → no row multiplication; no correlated subqueries.
New all-nullable DTO `QueryResult/DashboardTrackingDetailQueryResult.cs`.

### 3. Controller — `GET officer/dashboard-tracking/detail?license_id=<encrypted>`
`[OfficerOnlyFilter]`, Swagger tag `DASHBOARD_TRACKING`, `ProducesResponseType<ResponseResult<DashboardTrackingDetailResponse>>`,
standard try/catch + `_logger.LogError`. Decrypt: `int.Parse(CryptoExtensions.Decrypt(licenseId))`.
No rows (bad/!=10/!=40 id) → return the standard not-found/empty result (don't throw).

### 4. Service + response model (snake_case)
`DashboardTrackingDetailResponse`: `license_no`, `trader_name`, `issue_date`, `expiry_date` (TH DATEONLY),
`license_status`, `move_status`, `product_count`, `products[]`.
`products[]` item: `product_code`, `product_name`, `product_type_group_name`, `unit`, `approved_qty`, `moved_qty`,
`remaining_qty`, `percent`.

**Reuse — this is the point of the task (badges must never disagree with /table):**
- `license_status` = **`LicenseExpiryStatusLabel(expiryDate)`** from TASK-034 (same helper, don't re-implement).
- `move_status` = the **existing `MoveStatusLabel(approved, actual)`** (roll-up A: license totals `Σ approved_qty` vs
  `Σ moved_qty` over the returned lines, `≥` ⇒ เสร็จสิ้นแล้ว) — same rule as `/table`.
- `product_count` = `products.Count`.

**Per-line math:** `remaining_qty = approved − moved`; `percent = approved > 0 ? moved / approved * 100 : 0`.
⚠ **Over-moved is real** (DR-16: 4 lines with moved > approved) → **report true values**: `remaining_qty` may be
negative and `percent` may exceed 100. Do **not** silently clamp — the backend reports facts (consistent with the `≥`
move-status rule). *FE note for the hand-off: the gauge should clamp visually at 100%.* If the stakeholder wants
clamped numbers instead, that's a one-line change — raise it at capture.

## Must NOT change
The `/table` existing keys, the tracking backbone/query/charts/cascades (TASK-029..032), TASK-034's helper semantics,
other dashboards. All DID_SPF.

## Definition of Done
- [x] `/table` rows carry an encrypted `license_id`; `/detail?license_id=` returns header + `products[]` + `product_count`.
- [x] `license_status` uses TASK-034's helper and `move_status` uses the existing roll-up (grep: no second implementation).
- [x] `dotnet build` succeeds. Paste SQL + endpoint + build result.
- [ ] (Acceptance, capture) open a row from `/table` → modal matches: header fields, per-product approved/moved/remaining/%,
      line count; the two badges equal the values on that same table row → **REQ-019 DELIVERED**.

## Implementation Notes
(Jason — 2026-07-24)

### 0. Orphan cleanup (per Sober's answer on TASK-034)
Removed `,L.LICENSE_STATUS AS LicenseStatus` from `GetTrackingDashboard`'s SELECT **and** the `LicenseStatus` field from
`DashboardTrackingQueryResult`. **`WHERE … AND L.LICENSE_STATUS =:LICENSE_STATUS` (=40) kept** — grep-verified the
tracking backbone WHERE is still `WHERE L.FORM_ID =:FORM_ID AND L.LICENSE_STATUS =:LICENSE_STATUS` with the `40` bind.

### 1. `/table` exposes the id (additive)
`DashboardTrackingTableRow` + `[JsonProperty("license_id")] string LicenseId`, set to
`CryptoExtensions.Encrypt((r.LicenseId ?? 0).ToString())`. Existing keys untouched.

### 2. DAL `TTLicenseDtlRepository.GetTrackingLicenseDetail(int licenseId)`
Exactly per SPEC-021 §B3 — one query, header repeated per line:
`T_T_LICENSE L` INNER `T_T_LICENSE_DTL DTL`; LEFT `T_M_UNIT`; LEFT slim `T_M_PRODUCT→PRODUCT_GROUP→PRODUCT_TYPE` (`VWP`,
REQ-012 style) → LEFT pre-agg `T_M_PRODUCT_TYPE_GROUP` (`PTG`) for the group name; LEFT pre-agg
`(T_T_INFORM_MOVE_DTL GROUP BY REF_LICENSE_NO, PRODUCT_CODE) MV` on `L.LICENSE_NO`+`DTL.PRODUCT_CODE` (the DR-16-proven
join), `NVL(MV.MOVED_QTY,0)`. `WHERE L.ID=:LICENSE_ID AND L.FORM_ID=:FORM_ID(10) AND L.LICENSE_STATUS=:LICENSE_STATUS(40)`
— same backbone, so a bad/non-อ.10/non-40 id simply returns no rows. `ORDER BY DTL.ITEM_NO ASC`. All pre-aggregated →
no multiplication, no correlated subqueries. New all-nullable DTO `QueryResult/DashboardTrackingDetailQueryResult.cs`.

### 3. Controller — `GET officer/dashboard-tracking/detail?license_id=<encrypted>`
`[OfficerOnlyFilter]`, tag `DASHBOARD_TRACKING`, `ProducesResponseType<ResponseResult<DashboardTrackingDetailResponse>>`,
`int.Parse(CryptoExtensions.Decrypt(licenseId))`, standard try/catch + `_logger.LogError` (added `using
DidSpf.Helper.Extensions;`). A malformed encrypted id throws → caught → 400 `EXCEPTION_ERROR` (Center convention);
a *valid* id that matches no row returns 200 with an empty response shape (no throw), as specified.

### 4. Service + response model
`DashboardTrackingDetailResponse` (`license_no`, `trader_name`, `issue_date`, `expiry_date` TH DATEONLY,
`license_status`, `move_status`, `product_count`, `products[]`) + `DashboardTrackingDetailProduct` (`product_code`,
`product_name`, `product_type_group_name`, `unit`, `approved_qty`, `moved_qty`, `remaining_qty`, `percent`).
`LicenseDetail(int)` maps the header from row[0], projects the lines, then:
- `license_status` = **`LicenseExpiryStatusLabel(h.ExpiryDate)`** — TASK-034's helper, not re-implemented.
- `move_status` = **`MoveStatusLabel(Σ approved, Σ moved)`** over the returned lines — the same roll-up A + `≥` rule as `/table`.
- `product_count` = `Products.Count`.
- Per line: `remaining_qty = approved − moved`; `percent = approved > 0 ? moved/approved*100 : 0`.
  **Over-moved reported truthfully** (negative remaining / >100%) per SPEC-021 — not clamped; commented in code.
  **FE hand-off:** clamp the gauge visually at 100%. If the stakeholder wants clamped numbers, it's a one-line change.

### Verification
- `dotnet build` (Center+SPF) → **Build succeeded, 0 Error(s)** (pre-existing warnings only).
- **No second status implementation** (the point of the task): `LicenseExpiryStatusLabel` = 1 definition + **3** call
  sites (filter, table col, detail); `MoveStatusLabel` = 1 definition + **2** call sites (table row, detail).
- Orphan gone: 0 hits for the select line and 0 for `LicenseStatus` in `DashboardTrackingQueryResult`; backbone WHERE intact.
- New pieces wired: route `dashboard-tracking/detail` (controller L154), `license_id` on the table row (model L140),
  `GetTrackingLicenseDetail` (repo L543) with its `WHERE L.ID =:LICENSE_ID …` (L585).
- Untouched: `/table`'s existing keys, tracking backbone/query/charts/cascades (TASK-029..032), TASK-034 helper semantics, other dashboards.
- Static-only per brownfield rule; modal-vs-row parity, per-product math and the over-moved cases = stakeholder capture.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
