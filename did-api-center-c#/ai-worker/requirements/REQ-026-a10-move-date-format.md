# REQ-026: DASHBOARD_MOVE_A10 — `move_date` is emitted ISO/CE while every other date in the suite is Thai `dd/MM/yyyy`

- Status: READY_FOR_SA
- Priority: **HIGH** (FE-visible, single-line fix)
- Raised: 2026-08-10 — stakeholder capture of `POST /officer/dashboard-move-a10/table`:
  *"move date มันผิด format จากคนอื่นเขา ทำไม เพราะอะไรถึงเป็นแบบนั้น หรือหลุด หากหลุด ให้แก้ไขให้เป็นเหมือน issue date
  แล้วก็ไล่ดูอีกว่ามีตรงอื่นอีกมั้ย"*

## The defect (from the stakeholder's live response — our API, not a mock)
```json
"issue_date":  "24/03/2569",   ← Thai BE, dd/MM/yyyy   ✅
"expiry_date": "31/12/2573",   ← Thai BE, dd/MM/yyyy   ✅
"move_date":   "2026-06-22"    ← ISO, Christian era    ❌
```
Same row, three date fields, two different calendars and two different formats. Note it is not only the separator —
**the era is wrong too** (2026 CE vs 2569 BE), so an officer reading the table sees dates ~543 years apart in adjacent
columns.

## Cause — a genuine miss, one line (`DashboardMoveA10Service.cs` L334)
```csharp
IssueDate  = r.IssueDate.ToStringTH(FormatStr.DATEONLY),     // L312  ✅ suite convention
ExpiryDate = r.ExpiryDate.ToStringTH(FormatStr.DATEONLY),    // L313  ✅
MoveDate   = r.MoveDate?.ToString("yyyy-MM-dd") ?? string.Empty,  // L334  ❌ raw .NET format
```
`git blame`: **cc573f28, 2026-07-20, "dong" — "feat: Add DashboardMoveA10 functionality for weapon transfer tracking"**.
`move_date` was added later than the a10 table's original columns, in the commit that introduced the transfer-tracking
rows; the author formatted it inline instead of reusing the helper the two lines above it already use.
**It is a slip, not a decision** — there is no comment, no reason recorded, and nothing in the FE asks for ISO here.
The model type is already `string` (`DashboardMoveA10Model.cs`), so this is purely the value being produced wrong;
no model or key change.

⇒ **Fix:** `MoveDate = r.MoveDate.ToStringTH(FormatStr.DATEONLY)` — identical treatment to `issue_date`.
Keep the null-safety behaviour: `ToStringTH` is the shared extension used by all 17 other sites, and the existing
`?? string.Empty` semantics must be preserved for null move dates (SA to confirm the helper's null handling rather
than assume it — a null must still render `""`, not `"01/01/2443"`).

## ✅ The sweep the stakeholder asked for — this is the ONLY one
Three independent checks across every dashboard:

**1. Every date field in every dashboard response model is typed `string`** (25 fields across the 6 model files)
— so no raw `DateTime` is being serialized anywhere. ✔

**2. Every date assignment in the services** — 18 sites total; **17 use `ToStringTH(FormatStr.DATEONLY)`**, and
`DashboardMoveA10Service` L334 is the **only** one that does not:
| dashboard | date fields formatted correctly |
|---|---|
| import-a8 | issue, expiry, inform, import_permit (L140/141/143/144) |
| import | issue, expiry (L131/132) |
| license-book | issue, expiry, receipt (L140/141/145) |
| a10 | issue, expiry (L312/313) — **move_date L334 ❌** |
| move-license | issue, expiry (L295/296) |
| tracking | issue, expiry, table + detail (L377/378) |

**3. Grep for any other hand-rolled date formatting** across `Services/Dashboard*.cs` and `Models/Dashboard/*.cs`:
- `.ToString("yyyy…"/"dd…"/"MM…")` → **1 hit, this one**
- `ToStringEN` (Christian-era helper) → **0 hits** — the whole suite is on the Thai helper

⇒ **No second occurrence exists.** Reported as a measured sweep, not an impression.

## Acceptance
- [ ] `/dashboard-move-a10/table` → `move_date` reads `dd/MM/yyyy` in **Thai BE**, e.g. `2026-06-22` becomes `22/06/2569`.
- [ ] A row with no move date still returns `""` (not a formatted epoch/min-date).
- [ ] `issue_date` / `expiry_date` on the same row unchanged.
- [ ] `move_date_range` **request** filter still accepts the ISO `["2026-01-01","2026-08-01"]` input — this REQ changes
      the **response** only. ⚠ Do not "make the input Thai too"; the stakeholder's own curl uses ISO input and it works.
- [ ] `grep -rE '\.ToString\("(yyyy|dd|MM' Services/Dashboard*.cs` → 0 hits afterwards.

## Note for the capture — an unrelated observation, NOT part of this REQ
In the same response, `authority_group_no` comes back as `"1"`, `"0"` and `""` with `authority_group_no_name`
"ทหาร" / "ไม่ระบุ" / "ไม่ระบุ". That matches REQ-021's confirmed behaviour (code 0 is `IS_ACTIVE=0` → falls through to
the `NOT_SPECIFIED` fallback whose text is also "ไม่ระบุ"), so it is **correct as designed** — but the *empty-string*
case on row 2 is worth an eyeball at capture, since row 1 and row 3 of the same license carry `"1"`.
**Flagging only — Porter will raise it separately if the stakeholder confirms it looks wrong.** Do not fold it in.

@Sober — SPEC + TASK. One line, plus the null-handling confirmation.
