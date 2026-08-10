# TASK-043: `ReqMovePermitType` constant + **license-move** ประเภทการขออนุญาต from the request chain

- Source: SPEC-025 (REQ-023)
- Status: REVIEW
- Assignee: Jason (BE)
- Depends on: none


## Review — Verdict: DONE (code) — Sober (SA), 2026-07-24
- **Constant in one place:** `GroupCode.REQ_MOVE_PERMIT_TYPE` (GroupCode.cs L212) + `ReqMovePermitType` with the
  `BY_REQUEST_TYPE` map (ConstantSPF.Type.cs L1054…). ✔
- **Query:** parent `LEFT JOIN T_T_REQUEST PRQ ON PRQ.ID = RQ.REF_REQUEST_ID` (L246) + selects `RQ.REF_REQUEST_ID`,
  `PRQ.REQUEST_TYPE`. PK join, many-to-one, no correlated subquery. ✔
- **Derivation (L367-373) handles the trap:** `if (r.RefRequestId == null || r.RefRequestId == 0) return MV;` — the
  7 zero-encoded rows land in MV, which was the whole point of measuring first. Then `BY_REQUEST_TYPE` for 5/6. ✔
- **Fallback is non-blank as required:** unmapped → `MovePermitTypeCode` returns `""` → label falls to `NOT_SPECIFIED`
  ("ไม่ระบุ") with the comment (L298-300). Nothing renders blank. ✔
- **DDL semantics correct:** `CommonCodeDdlByStr` → `GetDataActiveByGroupCodeAndDisplayType(group, SystemType.SPF)`
  (active + SPF + SQL `SEQUENCE` order per TASK-039), `Value = CODE_STR` (MV/SD/EX). ✔
- **Charts filter automatically — verified, not assumed:** `ChartData` L211 calls `BuildTableRows(req)`, the same path
  that applies the filter at L274 (`InList(req.TransportTypes, MovePermitTypeCode(r))`). Table and charts cannot diverge. ✔
- col6 `transport_type_code*` untouched; tracking untouched; build 0 err. ✔

### > answer: **yes — drop `RQ.REQUEST_TYPE`, fold it into TASK-044**
You confirmed nothing reads `r.RequestType` anymore and that *your* change orphaned it (the two former readers were the
col5 filter + label), so the house rule applies: remove the select line **and** the DTO field. Tracking has its own copy,
so nothing else is affected. Batch it with TASK-044 so it's one build + one review rather than a third cycle — same way
the TASK-034 orphan was folded into TASK-035. Asking rather than assuming was right; the task text did say "keep unless
you confirm", and you confirmed.

## Why
`move_request_type*` (= **ประเภทการขออนุญาต**, despite the C# property being named `TransportType*`) must be the
**permit type of the originating request**: MV / SD / EX, derived by walking the request chain — not the
`RequestType` label it shows today.

## 1. Shared constant (ONE place — `ConstantSPF`)
- `GroupCode.REQ_MOVE_PERMIT_TYPE = "ReqMovePermitType"`.
- The code⇄REQUEST_TYPE pairs, **temporary**:
  ```
  MV = 3 · SD = 5 · EX = 6      // T_T_REQUEST.REQUEST_TYPE
  ```
  Comment verbatim: **"temporary — REQ-023; `ReqMovePermitType.CODE_INT` is NULL today, stakeholder will populate it;
  replace this map with CODE_INT then (one-line change). Do not 'clean up' before that."**

## 2. Query — `TTLicenseDtlRepository.GetMoveLicenseDashboard`
It already has `LEFT JOIN T_T_REQUEST RQ ON RQ.ID = L.REQUEST_ID`. Add **only the parent**:
```sql
LEFT JOIN T_T_REQUEST P ON P.ID = RQ.REF_REQUEST_ID
```
and select what the derivation needs: `RQ.REF_REQUEST_ID AS RefRequestId`, `P.REQUEST_TYPE AS ParentRequestType`
(both nullable in the DTO). PK join ⇒ many-to-one, no row multiplication, no correlated subquery.
**Keep `RQ.REQUEST_TYPE AS RequestType`** for now unless you confirm nothing reads it (say which).

## 3. Derivation (service)
```
RefRequestId == null || RefRequestId == 0   ⇒ "MV"
ParentRequestType == 5                      ⇒ "SD"
ParentRequestType == 6                      ⇒ "EX"
otherwise                                   ⇒ fallback (see below)
```
⚠ **The `== 0` branch is mandatory** — 7 real rows store "no parent" as `0`. `null`-only would render those blank.
Fallback: unmatched parent type → keep it non-blank, and comment that it is **unreachable on current data**
(query proved no parent type outside {5,6}) — don't invent a business label for it.

## 4. DDL + label + filter
- `move_request_type_ddl` ← the `ReqMovePermitType` group: **`SEQUENCE` order, active + `DISPLAY_TYPE` SPF**
  (REQ-021 semantics), `value = CODE_STR` (MV/SD/EX), `label = CODE_NAME`.
- `move_request_type_name` ← the group's `CODE_NAME` for the derived code.
- The `move_request_type` filter now matches the **derived code**. It already filters inside the shared row-building
  path, so charts should follow automatically — **verify that and say so** (acceptance covers table *and* charts).

## Must NOT change
`transport_type_code*` (ประเภทการขนย้าย), backbone/date filters, other columns, chart shapes, other dashboards.
**Do not touch `dashboard-tracking`** (same column, deliberately out of scope — stakeholder's call).

## Definition of Done
- [x] Constant + GroupCode key in `ConstantSPF`, commented temporary; no second copy anywhere.
- [x] Parent join added; derivation correct incl. **`REF_REQUEST_ID = 0` ⇒ MV**; ddl/label/filter on the derived code.
- [x] `transport_type_code_name` unchanged; `dotnet build` succeeds. Paste SQL + derivation + build result.

## Implementation Notes
(Jason — 2026-08-10)

### 1. Shared constants — `ConstantSPF`, one copy each
- `GroupCode.REQ_MOVE_PERMIT_TYPE = "ReqMovePermitType"` (`ConstantSPF.GroupCode.cs` L212).
- New `ConstantSPF.ReqMovePermitType` (`ConstantSPF.Type.cs` L1051): `MV`/`SD`/`EX` CODE_STR constants + the temporary
  pair map, carrying your comment verbatim:
  ```csharp
  /// temporary — REQ-023; ReqMovePermitType.CODE_INT is NULL today, stakeholder will populate it;
  /// replace this map with CODE_INT then (one-line change). Do not "clean up" before that.
  public static readonly Dictionary<int, string> BY_REQUEST_TYPE = new Dictionary<int, string>
  {
      { RequestType.REQUEST_MOVE, MV },       // 3
      { RequestType.REQUEST_SALE_DOM, SD },   // 5
      { RequestType.REQUEST_SALE_INT, EX },   // 6
  };
  ```
  **Small deviation, deliberate:** I keyed the map with the existing `RequestType.*` constants instead of the raw
  literals 3/5/6 — same values (comment shows them), but it self-documents and can't drift from the request-type enum.

### 2. Query — `GetMoveLicenseDashboard` only
```sql
      ,RQ.REF_REQUEST_ID           AS RefRequestId
      ,PRQ.REQUEST_TYPE            AS ParentRequestType
...
LEFT JOIN
  T_T_REQUEST PRQ ON PRQ.ID = RQ.REF_REQUEST_ID   -- คำขอต้นทาง (parent) — derive MV/SD/EX
```
Aliased `PRQ` (not `P`) because `P` is already taken by `T_M_PRODUCT` inside the `VWP` inline view in the same
statement. PK join ⇒ many-to-one, no multiplication, no correlated subquery. DTO gained
`int? RefRequestId` + `int? ParentRequestType` (both nullable).
**Tracking's `GetTrackingDashboard` — which also selects `RQ.REQUEST_TYPE` — was NOT touched** (out of scope).

### 3. Derivation — `MovePermitTypeCode(r)`
```csharp
if (r.RefRequestId == null || r.RefRequestId == 0) return ReqMovePermitType.MV;   // ⚠ the 0 branch (7 real rows)
if (r.ParentRequestType.HasValue && ReqMovePermitType.BY_REQUEST_TYPE.TryGetValue(r.ParentRequestType.Value, out var code))
    return code;                                                                  // 5 ⇒ SD, 6 ⇒ EX
return string.Empty;                                                              // unreachable on current data
```
Fallback: returns empty **code** (so it simply matches no filter value), and the **label** falls back to the existing
`NOT_SPECIFIED` ("ไม่ระบุ") — non-blank, and no invented business label, per your instruction.

### 4. DDL / label / filter — all on the derived code
- `move_request_type_ddl` ← new `CommonCodeDdlByStr(GroupCode.REQ_MOVE_PERMIT_TYPE)`: `value = CODE_STR` (MV/SD/EX),
  `label = CODE_NAME`, active + `DISPLAY_TYPE` SPF + SEQUENCE (reuses TASK-039's repo method).
- `move_request_type_name` ← `CommonCodeStrMap(...)` keyed by the derived code (same group ⇒ ddl and label can't disagree).
- Filter: `InList(req.TransportTypes, MovePermitTypeCode(r))`.

### ✅ Charts verified (the item you asked me to check and state)
`ChartData` (L211) and `TableData` (L255) **both** call `BuildTableRows(req)`, and the filter lives inside it (L274).
So the charts consume the already-filtered rows and follow the new derived-code filter automatically — no chart-side
change was needed, and none was made.

### ❓ `RQ.REQUEST_TYPE AS RequestType` — confirmed orphaned in license-move, **kept** per your default
You said keep it "unless you confirm nothing reads it (say which)". Confirmed: after this change **nothing in
`DashboardMoveLicenseService` reads `r.RequestType`** — the two former readers were the filter (L272) and the label
(L296), both now on the derived code. I left the select line + DTO field in place because your instruction's default is
keep. Say the word and I'll drop both (1 line each). ⚠ Note `DashboardTrackingService` still uses **its own** copy
(tracking query + `DashboardTrackingQueryResult`) — that one must stay regardless.

### Verification
- `dotnet build` (Center+SPF) → **Build succeeded, 0 Error(s)** (one interim `CS0246` — the service now names
  `DashboardMoveLicenseQueryResult`, so I added `using DidSpf.Oracle.DataAccess.SPF.QueryResult;`).
- Constants exist exactly once each (grep across `ConstantSPF.*`).
- `transport_type_code*` (col6) untouched: DDL L55, filter L275 (`r.MoveTypeCode`), label L301.
- Untouched: backbone/date filters, other columns, chart shapes, other dashboards, **`dashboard-tracking`**.
- Static-only per brownfield rule; the actual MV/SD/EX split, the DB's `CODE_NAME` wording and the DDL contents are
  data-dependent → stakeholder capture (table **and** charts).

## Questions
(Jason asks; Sober answers as `> answer: ...`)
