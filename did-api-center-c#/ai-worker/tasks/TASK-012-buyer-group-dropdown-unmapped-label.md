# TASK-012: buyer-group DROPDOWN unmapped code (`0`) → "ไม่ระบุ" (a10 + license-move)

- Source: stakeholder 2026-07-20 (search-filter inconsistency vs TASK-010).
- Status: REVIEW
- Depends on: none

## What to do

TASK-010 fixed the buyer-group **table/chart** label (unmapped → "ไม่ระบุ") but not the **dropdown** builder, so
`authority_group_no_ddl` still shows code `0` as **"กลุ่ม 0"**. Align it.

In **both** `DashboardMoveA10Service.cs` and `DashboardMoveLicenseService.cs`, `SearchFilter()` buyer-group
dropdown (~L96):
```csharp
Label = BUYER_GROUP_MAP.TryGetValue(no, out var name) ? name : $"กลุ่ม {no}",
```
→ change the fallback to **`NOT_SPECIFIED`** (the "ไม่ระบุ" constant already in both services):
```csharp
Label = BUYER_GROUP_MAP.TryGetValue(no, out var name) ? name : NOT_SPECIFIED,
```
Value (`no.ToString()`) unchanged; mapped 1/2/3/9 (ทหาร/ตำรวจ/สมาคม/อื่นๆ) unchanged.

## Definition of Done
- [x] a10 + license-move `authority_group_no_ddl`: code `0`/unmapped → label "ไม่ระบุ" (was "กลุ่ม 0"),
      consistent with the table/chart (TASK-010). Value + mapped labels unchanged.
- [x] `dotnet build` succeeds. **Build succeeded. 0 Error(s).** Deterministic label change — Sober review, no capture.

## Implementation Notes

**Done by Jason 2026-07-20.** Label-only, 1 line in each service's `SearchFilter()` buyer-group dropdown (L96):
`Label = ... ? name : $"กลุ่ม {no}"` → `Label = ... ? name : NOT_SPECIFIED` — in `DashboardMoveA10Service.cs`
and `DashboardMoveLicenseService.cs`. Unmapped code (`0`, foreign) now shows "ไม่ระบุ", consistent with TASK-010's
table/chart label. `Value` (`no.ToString()`) and the mapped 1/2/3/9 labels (ทหาร/ตำรวจ/สมาคม/อื่นๆ) unchanged.

**Verified:** `dotnet build` → **Build succeeded. 0 Error(s).** Grep: both L96 fallbacks now `NOT_SPECIFIED`;
no `กลุ่ม {no}` remains. Deterministic string change — no capture (per task).

## Questions

(Jason asks; Sober answers as `> answer: ...`)

## Review — Verdict: DONE — Sober (SA), 2026-07-20
Grep-confirmed both buyer-group dropdown fallbacks (`DashboardMoveA10Service.cs:96` +
`DashboardMoveLicenseService.cs:96`) now `NOT_SPECIFIED`; no `กลุ่ม {no}` remains; value + mapped 1/2/3/9
unchanged; build 0 errors. Consistent with TASK-010's table/chart label. Deterministic → accepted, no capture.
