# TASK-045: ⛔ Fix the build — one `ReqMovePermitType`, keep develop's, fold our map in

- Source: SPEC-026 (REQ-024, **BLOCKER**)
- Status: REVIEW
- Assignee: Jason (BE)
- Depends on: TASK-043, TASK-044 (this reconciles their constants with `develop`)

## Context — not your mistake
Our constants landed in `8d2034b` (TASK-043); the `develop` merge `0917ab7` came **after** and brought the same concept.
"Check before adding" was correct against what existed on the branch at the time. Two teams modelled the same domain
independently. (Going forward we also grep `develop` — process change recorded in SPEC-026.)

## Steps
1. **`ConstantSPF.GroupCode.cs`** — delete **our L215** `REQ_MOVE_PERMIT_TYPE`; keep **develop's L55** (identical value,
   and develop's `RequestMoveService` L30 already uses it).
2. **`ConstantSPF.Type.cs`** — move **`BY_REQUEST_TYPE`** from our class (~L1067) **into develop's `ReqMovePermitType`**
   (~L77), re-pointed at `MOVE` / `SALE_IN_KINGDOM` / `SALE_OUT_KINGDOM`. **Keep the temporary comment verbatim**
   ("temporary — REQ-023 … replace with CODE_INT … do not clean up before that").
3. **Delete our entire `ReqMovePermitType` block** (~L1067) — only after the map has moved.
4. **Update the 4 call sites** to develop's names: `DashboardMoveA10Service` L365/L368,
   `DashboardMoveLicenseService` L370/L373. Same string values ⇒ **behaviour must be identical**.
5. **Amend develop's `MOVE` doc comment.** It says *"RefRequestId = 0"*, but our DATA REQUEST measured
   **NULL 2,390 · ZERO 7**. Change it to:
   *"ไม่มีคำขอต้นทาง — REF_REQUEST_ID IS NULL หรือ = 0 (วัดจริง 2026-07-24: NULL 2,390 · 0 = 7 แถว)"*.
   Reason: anyone implementing from the current wording would write `== 0` only and silently lose 2,390 rows.

## Must NOT change
`RequestMoveService` (develop's consumer) · the derivation semantics (`RefRequestId == null || == 0 ⇒ MV`; parent 5 ⇒ SD,
6 ⇒ EX) · anything else in the two dashboards.

## Definition of Done
- [x] `dotnet build` → **0 errors**; grep proves exactly **one** `ReqMovePermitType` class and **one**
      `REQ_MOVE_PERMIT_TYPE` constant in the solution.
- [x] `BY_REQUEST_TYPE` + its temporary comment now live in develop's class; the 4 call sites use develop's names.
- [x] `MOVE` doc comment states NULL-or-0 with the measured counts; `RequestMoveService` untouched.
- [x] Paste: the merged class, the 4 updated call sites, and the build result.

## Implementation Notes
(Jason — 2026-08-10)

### How I hit it
I picked this up from the board, and the first thing I ran was `dotnet build` — it failed with two `CS0102`
("already contains a definition") for `ReqMovePermitType` and `REQ_MOVE_PERMIT_TYPE`. So I diffed both pairs before
touching anything: same **string values** on both sides (`"ReqMovePermitType"`, `MV`/`SD`/`EX`), only the C# member
names and the presence of `BY_REQUEST_TYPE` differed ⇒ a pure declaration clash, no semantic conflict. Then I found
this task, which prescribes exactly that resolution, and followed it.

### Steps 1–4 — merged onto develop's definitions
1. Deleted **our** `REQ_MOVE_PERMIT_TYPE` (GroupCode.cs, ~L215); kept **develop's** L55 — identical value, and
   `RequestMoveService` L30 already consumes it.
2/3. Moved `BY_REQUEST_TYPE` into develop's `ReqMovePermitType` (L77) re-pointed at `MOVE`/`SALE_IN_KINGDOM`/
   `SALE_OUT_KINGDOM`, **temporary comment kept verbatim**, then deleted our whole block (~L1067). Merged class:
```csharp
public static class ReqMovePermitType
{
    /// <summary>ไม่มีคำขอต้นทาง — REF_REQUEST_ID IS NULL หรือ = 0 (วัดจริง 2026-07-24: NULL 2,390 · 0 = 7 แถว)</summary>
    public const string MOVE = "MV";
    /// <summary>ขายขนย้ายในราชอาณาจักร (shadow จาก อ.15 SaleDom)</summary>
    public const string SALE_IN_KINGDOM = "SD";
    /// <summary>ขายขนย้ายนอกราชอาณาจักร (shadow จาก อ.14 SaleInt)</summary>
    public const string SALE_OUT_KINGDOM = "EX";

    /// <summary>
    /// temporary — REQ-023; ReqMovePermitType.CODE_INT is NULL today, stakeholder will populate it;
    /// replace this map with CODE_INT then (one-line change). Do not "clean up" before that.
    /// </summary>
    public static readonly Dictionary<int, string> BY_REQUEST_TYPE = new Dictionary<int, string>
    {
        { RequestType.REQUEST_MOVE, MOVE },                 // 3
        { RequestType.REQUEST_SALE_DOM, SALE_IN_KINGDOM },  // 5
        { RequestType.REQUEST_SALE_INT, SALE_OUT_KINGDOM }, // 6
    };
}
```
4. The 4 call sites now use develop's names (`.MV` → `.MOVE`; `BY_REQUEST_TYPE` unchanged):
```
DashboardMoveA10Service.cs:365      if (r.RefRequestId == null || r.RefRequestId == 0) return ReqMovePermitType.MOVE;
DashboardMoveA10Service.cs:368          ReqMovePermitType.BY_REQUEST_TYPE.TryGetValue(r.ParentRequestType.Value, out var code))
DashboardMoveLicenseService.cs:370  if (r.RefRequestId == null || r.RefRequestId == 0) return ReqMovePermitType.MOVE;
DashboardMoveLicenseService.cs:373      ReqMovePermitType.BY_REQUEST_TYPE.TryGetValue(r.ParentRequestType.Value, out var code))
```
**Behaviour identical** — only identifiers changed; every emitted string value is the same as before the collision.

### Step 5 — `MOVE` doc comment corrected
`"…RefRequestId = 0"` → `"ไม่มีคำขอต้นทาง — REF_REQUEST_ID IS NULL หรือ = 0 (วัดจริง 2026-07-24: NULL 2,390 · 0 = 7 แถว)"`.
Worth stressing why this one mattered: the old wording describes the **rarer** case (7 rows) and omits the dominant one
(2,390 NULL) — someone implementing from it would write `== 0` only and silently drop ~2,390 rows. The derivation
itself already had both branches; this aligns the doc with the code and the measurement.

### Verification
- `dotnet build` (Center+SPF) → **Build succeeded, 0 Error(s)** (was 2 × `CS0102` before).
- **Solution-wide** grep (excl. bin/obj): exactly **one** `class ReqMovePermitType` (`ConstantSPF.Type.cs:77`) and
  exactly **one** `REQ_MOVE_PERMIT_TYPE =` (`ConstantSPF.GroupCode.cs:55`).
- `RequestMoveService` untouched — still resolves `GroupCode.REQ_MOVE_PERMIT_TYPE` at L30 and compiles.
- Derivation semantics unchanged (`null || 0 ⇒ MOVE`; parent 5 ⇒ SD, 6 ⇒ EX); nothing else in the two dashboards touched.
- Static-only per brownfield rule; no data-dependent claim here — this was a compile-level reconciliation.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
