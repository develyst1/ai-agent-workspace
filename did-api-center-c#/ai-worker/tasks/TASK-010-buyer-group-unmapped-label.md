# TASK-010: buyer-group unmapped code → "ไม่ระบุ" (a10 + license-move)

- Source: stakeholder decision 2026-07-20 (REQ-006 final polish; also closes REQ-005's minor code-`0` item).
- Status: REVIEW
- Depends on: none

## What to do

The buyer-group **label** (`authority_group_no_name` + the by-buyer-group chart bucket) should read **"ไม่ระบุ"**
for any code not in the 1/2/3/9 map (e.g. code `0`, foreign "…Sdn Bhd"). Today: license-move shows the raw code
("0" bucket), a10 shows blank. Use the existing `NOT_SPECIFIED` ("ไม่ระบุ") constant (defined in both services).
**Label only** — leave the raw `authority_group_no` code field and the group **dropdown** as-is.

1. **`Services/DashboardMoveA10Service.cs`** (~L275): the `BuyerGroupLabel` map — change the fallback
   `... ? bg : string.Empty` → **`: NOT_SPECIFIED`**.
2. **`Services/DashboardMoveLicenseService.cs`** (~L266): `BuyerGroupLabel = MapCode(buyerGroupMap, r.BuyerGroupNo)`
   returns the **raw code** for unmapped values → replace with the map+fallback form:
   **`BuyerGroupLabel = (r.BuyerGroupNo.HasValue && BUYER_GROUP_MAP.TryGetValue(r.BuyerGroupNo.Value, out var bg) ? bg : NOT_SPECIFIED)`**
   (i.e. don't use `MapCode` for the buyer group — it falls back to `code.ToString()`).

Both charts group by the label with `string.IsNullOrEmpty(...) ? NOT_SPECIFIED : ...`, so the bucket becomes
"ไม่ระบุ" automatically once the label is "ไม่ระบุ".

## Definition of Done
- [x] a10 + license-move: `authority_group_no_name` = "ไม่ระบุ" for code `0`/unmapped; by-buyer-group chart bucket
      = "ไม่ระบุ" (no raw "0"). Mapped 1/2/3/9 unchanged (ทหาร/ตำรวจ/สมาคม/อื่นๆ).
- [x] `dotnet build` succeeds. **Build succeeded. 0 Error(s).** Deterministic label change — Sober reviews (no new capture).

## Implementation Notes

**Done by Jason 2026-07-20.** Label-only, 2 one-line changes (the fallback for an unmapped buyer-group code):
1. `Services/DashboardMoveA10Service.cs:275` — `BuyerGroupLabel` fallback `string.Empty` → **`NOT_SPECIFIED`**.
2. `Services/DashboardMoveLicenseService.cs:266` — replaced `MapCode(buyerGroupMap, r.BuyerGroupNo)` (which falls
   back to `code.ToString()`, i.e. raw "0") with the map+`NOT_SPECIFIED` form:
   `BuyerGroupLabel = (r.BuyerGroupNo.HasValue && buyerGroupMap.TryGetValue(r.BuyerGroupNo.Value, out var bg) ? bg : NOT_SPECIFIED)`.

Both charts group by `string.IsNullOrEmpty(label) ? NOT_SPECIFIED : label` → the bucket becomes "ไม่ระบุ"
automatically. Untouched: the raw `authority_group_no` code field, the group **dropdown**, the mapped 1/2/3/9
labels (ทหาร/ตำรวจ/สมาคม/อื่นๆ), and `MapCode` (still used for col5/col6).

**Verified:** `dotnet build` → **Build succeeded. 0 Error(s).** Grep: both `BuyerGroupLabel` fallbacks now
`NOT_SPECIFIED`. Deterministic string change — no live capture needed (per Porter).

## Questions

(Jason asks; Sober answers as `> answer: ...`)

## Review — Verdict: DONE — Sober (SA), 2026-07-20
Grep-verified both buyer-group label fallbacks now `NOT_SPECIFIED`: `DashboardMoveA10Service.cs:275` +
`DashboardMoveLicenseService.cs:266` (no longer `MapCode`/raw code). Label-only; charts auto-bucket "ไม่ระบุ";
raw `authority_group_no` + dropdown + mapped 1/2/3/9 + `MapCode` (col5/col6) untouched; build 0 errors.
Deterministic string change → **accepted, no capture** (per Porter). **REQ-006 DELIVERED; closes REQ-005's
minor code-`0` item too.**
