# TASK-014: Fix weapon-type (ประเภทอาวุธ) filter source — both move dashboards (BUG)

- Source: stakeholder-confirmed bug 2026-07-20 (Sober-traced).
- Status: REVIEW
- Depends on: none

## Bug + root cause

`/dashboard-move-license/chart` (and `/table`) filtered by `product_type_group_code=PTG01` (abundant กระสุน)
returns **empty** — same for any PTG — while no filter returns data. **Root cause (confirmed):** the SQL selects
`L.PRODUCT_TYPE_GROUP_CODE AS WeaponCategoryCode` — the **license/inform-move header** column, which is **NULL**
for all rows. The service filter `MatchEq(req.WeaponCategory, r.WeaponCategoryCode)` then compares against null →
any PTG ⇒ empty. **Move-a10 has the identical bug** (same `L.PRODUCT_TYPE_GROUP_CODE AS WeaponCategoryCode`).

`WeaponCategoryCode` is **filter-only** (not a response field) — so this is a pure source swap; no output field
changes. The real per-line group lives on the product: **`VW_PRODUCT.PRODUCT_TYPE_GROUP_CODE`** keyed by
`PRODUCT_CODE` (the same view the หน่วยนับ/อาวุธ cascade uses; has `PRODUCT_CODE` + `PRODUCT_TYPE_GROUP_CODE`).

## Fix — in BOTH repo SQLs, source `WeaponCategoryCode` from the product line

1. **`TTLicenseDtlRepository.GetMoveLicenseDashboard`** (move-license): replace
   `,L.PRODUCT_TYPE_GROUP_CODE AS WeaponCategoryCode` with `,VWP.PRODUCT_TYPE_GROUP_CODE AS WeaponCategoryCode`
   and add `LEFT JOIN VW_PRODUCT VWP ON VWP.PRODUCT_CODE = DTL.PRODUCT_CODE` (`DTL` = `T_T_LICENSE_DTL`; 1:1 on
   PRODUCT_CODE — no row multiplication).
2. **`TTInformMoveDtlRepository.GetMoveA10Dashboard`** (move-a10): same — replace
   `,L.PRODUCT_TYPE_GROUP_CODE AS WeaponCategoryCode` with `,VWP.PRODUCT_TYPE_GROUP_CODE AS WeaponCategoryCode`
   + `LEFT JOIN VW_PRODUCT VWP ON VWP.PRODUCT_CODE = DTL.PRODUCT_CODE` (`DTL` = `T_T_INFORM_MOVE_DTL`).

No service/model change — the filter LINQ + everything else stays. Do NOT touch the cascade, dropdown (REQ-009),
chart/table data, or other filters.

## Definition of Done
- [x] Both SQLs source `WeaponCategoryCode` from `VW_PRODUCT.PRODUCT_TYPE_GROUP_CODE` (by `DTL.PRODUCT_CODE`),
      not the null `L.PRODUCT_TYPE_GROUP_CODE`.
- [x] `dotnet build` succeeds. **Build succeeded. 0 Error(s).** No output-field/other-filter change.
- [~] (Acceptance) stakeholder re-tests `/dashboard-move-license/chart` + `/table` filter=PTG01 → returns data;
      spot-check move-a10 — runtime/brownfield, at the re-test.

## Implementation Notes

**Done by Jason 2026-07-20.** SQL-only source swap in both dashboard repo queries — `WeaponCategoryCode` (filter-only,
not a response field) now comes from the product line's real group instead of the null header column.

1. **`TTLicenseDtlRepository.GetMoveLicenseDashboard`** (move-license): select `,L.PRODUCT_TYPE_GROUP_CODE AS
   WeaponCategoryCode` → `,VWP.PRODUCT_TYPE_GROUP_CODE AS WeaponCategoryCode`; added
   `LEFT JOIN VW_PRODUCT VWP ON VWP.PRODUCT_CODE = DTL.PRODUCT_CODE` (`DTL` = `T_T_LICENSE_DTL`).
2. **`TTInformMoveDtlRepository.GetMoveA10Dashboard`** (move-a10): same swap +
   `LEFT JOIN VW_PRODUCT VWP ON VWP.PRODUCT_CODE = DTL.PRODUCT_CODE` (`DTL` = `T_T_INFORM_MOVE_DTL`).

`VW_PRODUCT` is the same view the หน่วยนับ/อาวุธ cascade already uses (`VwProductRepo`), keyed 1:1 on `PRODUCT_CODE`
→ no row multiplication. No service/model change — the LINQ filter `MatchEq(req.WeaponCategory, r.WeaponCategoryCode)`
now compares against the real per-line group, so `product_type_group_code=PTG01` returns data instead of empty.

**Untouched:** cascade, dropdown (REQ-009), chart/table data, other filters, response fields (`WeaponCategoryCode`
is filter-only — never serialized).

**Verified:** `dotnet build` (from `spf/DidSpf.WebApi.Center`, builds the DAL too) → **Build succeeded. 0 Error(s).**
Grep: both dashboard SQLs now select `VWP.PRODUCT_TYPE_GROUP_CODE AS WeaponCategoryCode` + carry the
`VW_PRODUCT VWP` join; no `L.PRODUCT_TYPE_GROUP_CODE` left in either dashboard query. Runtime caveat (brownfield):
the fix's effect (filter=PTG01 returns rows) is confirmable at the stakeholder re-test — the join/source is
correct by construction (VW_PRODUCT is the cascade's own source).

## Questions

(Jason asks; Sober answers as `> answer: ...`)

## Review — Verdict: DONE (code) — Sober (SA), 2026-07-20
Grep-verified both repo SQLs: `VWP.PRODUCT_TYPE_GROUP_CODE AS WeaponCategoryCode` +
`LEFT JOIN VW_PRODUCT VWP ON VWP.PRODUCT_CODE = DTL.PRODUCT_CODE` (a10 `TTInformMoveDtlRepository` L45/L72;
license `TTLicenseDtlRepository` L228/L249); **no `L.PRODUCT_TYPE_GROUP_CODE AS WeaponCategoryCode` left** in
either. VW_PRODUCT is 1:1 on PRODUCT_CODE (no multiplication); `WeaponCategoryCode` is filter-only (unchanged
output); build 0 errors. Correct source per the trace.
**Final acceptance = stakeholder re-test** (data-dependent): `/dashboard-move-license/chart`+`/table` filter=PTG01
→ returns data; spot-check move-a10. If it does → bug closed.
