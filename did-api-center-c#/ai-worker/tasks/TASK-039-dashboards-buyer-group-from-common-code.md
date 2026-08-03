# TASK-039: Buyer group from `T_S_COMMON_CODE` + GroupCode constants + correct lookup semantics (3 dashboards)

- Source: SPEC-023 A/C/D (REQ-021 findings 1, 4, 5)
- Status: REVIEW
- Assignee: Jason (BE)
- Depends on: none


## Review — Verdict: DONE (code) — Sober (SA), 2026-07-24
- **A:** `BUYER_GROUP_MAP` → **0 refs in all 3 services**; labels resolve from `AuthorityGroupNo`; `NOT_SPECIFIED`
  fallback kept (so the 6 inactive code-0 licenses still render "ไม่ระบุ" — as instructed). ✔
- **C:** constants live in `ConstantSPF.GroupCode.cs` (`STATUS_PAID` L203, `AUTHORITY_GROUP_NO` L206 …); **no
  `private const string GROUP_*` left** in any dashboard service; services reference `GroupCode.*` throughout. ✔
- **D:** all sites on `GetDataActiveByGroupCodeAndDisplayType(g, SystemType.SPF)`. **I verified the retrofit target
  actually delivers SEQUENCE order** — it is raw SQL `ORDER BY C.SEQUENCE ASC, C.ID ASC` returning `data.ToList()` with
  **no C# re-sort**. Worth checking: a `.OrderBy()` there would have made this task's DoD silently false. ✔
- **Removing the client-side `.OrderBy(c => c.CodeInt)` was correct** — it was overriding the SEQUENCE order D asks for.
  FE-visible dropdown reordering for ประเภทการขออนุญาต/ขนย้าย — correctly called out for the capture.
- Build 0 err; a10's `MOVE_REQUEST_TYPE_MAP` (TASK-041), paid/unpaid labels (TASK-040), derived statuses, backbone
  filters, chart shapes and table keys all untouched — clean scoping.

### > Pre-existing ordering bug — right call to flag-not-fix; I'm escalating it, not burying it
Confirmed and it is **3 methods**, not one: `TSCommonCodeRepository` L23 `GetDataAll` (`.OrderBy(GroupCode).OrderBy(Sequence)`),
L32 `GetDataByGroupCode` and L41 `GetDataActiveByGroupCode` (both `.OrderBy(Sequence).OrderBy(Id)`). Chained `OrderBy`
**replaces** the previous key (it should be `ThenBy`), so those three never sort by what they claim.
Leaving it was correct here (pre-existing + outside these 6 sites — house rule: fix what *your* change orphaned, mention
the rest). But `GetDataActiveByGroupCode` is still used by `CommonCodeService`, which serves the FE's common-code
endpoint ⇒ dropdown ordering may be wrong **app-wide, beyond dashboards**. Raised to Porter as a candidate REQ with the
exact locations — a 3-line `ThenBy` fix, but it needs its own capture because it changes visible ordering elsewhere.

### FYI — **TASK-041 is no longer blocked**
DR-17 came back and I finalised it (adopt `MoveRequestType`; DDL = all 6 active codes). Your note still says
"BLOCKED ที่ DR-17" — order is now **TASK-040 → TASK-041**, both ready.

## Why
`BUYER_GROUP_MAP` is hardcoded **verbatim in 3 services** and its code-3 label is **wrong**: DB says
"ภาคเอกชน (สมาคม บริษัทฯ)", we say "สมาคม" → **239 licenses render the wrong label today** (dropdown + table column).
Codes 4/5/6/7 are missing too (zero rows today — latent, not a present outage). The common-code infrastructure is
already proven in these same services.

## Changes

### A. Buyer group → read the table (all 3: `DashboardTrackingService` L45-48, `DashboardMoveLicenseService` L37, `DashboardMoveA10Service` L33)
- Delete `BUYER_GROUP_MAP` from all three.
- Resolve labels from `GROUP_CODE = 'AuthorityGroupNo'` (`CODE_INT` → `CODE_NAME`), used for **both** the dropdown and
  the table column in each service (same two call sites the map feeds today).
- **Keep the existing `NOT_SPECIFIED` ("ไม่ระบุ") fallback** for unmatched codes — code 0 is `IS_ACTIVE=0`, so active-only
  reads won't find it and those **6 real licenses** fall through to the fallback and render correctly. Don't "fix" it away.

### C. Group keys → `ConstantSPF.GroupCode`
Add `REQUEST_TYPE = "RequestType"`, `MOVE_REQUEST_TYPE = "MoveRequestType"`, `AUTHORITY_GROUP_NO = "AuthorityGroupNo"`,
`STATUS_PAID = "StatusPaid"`; delete the per-service `private const string GROUP_*` copies (tracking L26-27,
license L30/L32, a10 L42) and reference the constants instead.

### D. Correct lookup semantics — and retrofit the existing call sites
Officer dashboards ⇒ `GetDataActiveByGroupCodeAndDisplayType(group, "SPF")` and **order by `SEQUENCE`**.
Apply to the new buyer-group reads **and retrofit the 3 existing ones** (a10 L66/L369, license L352/L363,
tracking L422/L432) which currently use the plain active-only method — otherwise an ISPF-only or out-of-order code can
still leak into an officer dropdown. If the repo lacks a suitable overload, add one following the existing pattern.

## Must NOT change
The derived statuses (move status, expiry status — SPEC-023 §E), the `StatusLicense`-based backbone filters, paid/unpaid
labels (that's TASK-040), chart shapes, table columns/keys, other dashboards. All DID_SPF.

## Definition of Done
- [x] `BUYER_GROUP_MAP` → **0 references** in all 3 services; labels come from `AuthorityGroupNo`.
- [x] Group **3** now renders "ภาคเอกชน (สมาคม บริษัทฯ)"; unmatched/inactive still "ไม่ระบุ". *(label now comes from the
      table — the exact string is DB data, confirm at capture)*
- [x] No `private const string GROUP_*` left in the dashboard services; all use `ConstantSPF.GroupCode`.
- [x] All 6 lookup sites (3 new + 3 retrofitted) use active + `DISPLAY_TYPE` SPF + `SEQUENCE` order.
- [x] `dotnet build` succeeds. Paste the diff summary + build result.

## Implementation Notes
(Jason — 2026-07-24)

### C — the 4 GroupCode constants **already existed**; nothing was added
The task said "Add REQUEST_TYPE / MOVE_REQUEST_TYPE / AUTHORITY_GROUP_NO / STATUS_PAID". I checked
`ConstantSPF.GroupCode.cs` first and **all four are already there** (`STATUS_PAID` L203, `AUTHORITY_GROUP_NO` L206,
`MOVE_REQUEST_TYPE` L218, `REQUEST_TYPE` L221). So this step was purely *use them + delete the per-service copies* —
I added no duplicates. (`STATUS_PAID` isn't consumed by this task; it's TASK-040's.)

### A — buyer group now read from `T_S_COMMON_CODE`
`BUYER_GROUP_MAP` deleted from **all 3** services (tracking, move-license, a10). Labels now come from
`CommonCodeIntMap(GroupCode.AUTHORITY_GROUP_NO)` at both call sites per service — the dropdown and the table column —
so the two can't disagree. The existing `NOT_SPECIFIED` ("ไม่ระบุ") fallback is **kept** exactly as instructed, so
code 0 (`IS_ACTIVE=0`, invisible to active-only reads) still renders "ไม่ระบุ" for those 6 licenses.
Each service now awaits the map once per request path (`SearchFilter` for the dropdown, `BuildTableRows`/`BuildRows`
for the column) rather than referencing a static.

### C — group keys via `ConstantSPF.GroupCode`
Deleted `GROUP_REQUEST_TYPE`/`GROUP_MOVE_TYPE` from tracking (L26-27), move-license (L30/L32) and a10 (L42); all now
pass `GroupCode.REQUEST_TYPE` / `GroupCode.MOVE_REQUEST_TYPE` / `GroupCode.AUTHORITY_GROUP_NO`. Added
`using static DidSpf.Oracle.DataAccess.SPF.Utils.ConstantSPF;` to tracking + a10 (move-license already had it).

### D — correct lookup semantics, all 6 sites
Switched to the **existing** `GetDataActiveByGroupCodeAndDisplayType(group, SystemType.SPF)` — no new overload needed;
its SQL already does `IS_ACTIVE = 1 AND GROUP_CODE = :G AND (DISPLAY_TYPE = 'ALL' OR = :DT) ORDER BY SEQUENCE ASC, ID ASC`.
Sites: a10 L62 (direct moveTypes) + L370 (`CommonCodeIntMap`), move-license L349/L359, tracking L416/L425.
**I also removed the client-side `.OrderBy(c => c.CodeInt)` in the two `CommonCodeDdlByInt` helpers** — it was
overriding the SEQUENCE order the task asks for. ⚠ That means officer dropdown order for ประเภทการขออนุญาต /
ประเภทการขนย้าย now follows `SEQUENCE` instead of numeric code — intended per D, but FE-visible, so worth a glance at capture.

### Pre-existing bug noticed (NOT fixed — not mine to touch)
`TSCommonCodeRepository.GetDataActiveByGroupCode` (the method we migrated *off*) ends with
`.OrderBy(o => o.Sequence).OrderBy(o => o.Id)` — the second `OrderBy` **replaces** the first (should be `ThenBy`), so it
effectively sorts by `Id` only and its SEQUENCE ordering never worked. Left alone: it's pre-existing and still used by
`CommonCodeService` (outside this task's 6 sites). Mentioning it because it's extra justification for the retrofit.

### Verification
- `dotnet build` (Center+SPF) → **Build succeeded, 0 Error(s)**.
- `BUYER_GROUP_MAP` → **0 references** repo-wide; `private const string GROUP_*` → **none** left in any service;
  `GroupCode.` now used 6× in each of the 3 services.
- All **6** dashboard lookups use the DisplayType overload; the only plain `GetDataActiveByGroupCode` left is
  `CommonCodeService.cs:29`, which is **not** a dashboard service and is outside this task's stated scope — left untouched.
- Out-of-scope things confirmed untouched: a10's `MOVE_REQUEST_TYPE_MAP` (col5 — that's TASK-041/DR-17),
  license-book's `PAID_LABEL`/`UNPAID_LABEL` (TASK-040), the derived move/expiry statuses (SPEC-023 §E), backbone
  filters, chart shapes, table keys.
- **Data-dependent, deferred to capture (brownfield rule):** that group 3 actually renders "ภาคเอกชน (สมาคม บริษัทฯ)",
  that codes 4–7 appear if/when rows exist, and the new SEQUENCE-based dropdown order. The code now reads the table
  instead of a hardcoded map; the exact strings are DB content I can't verify from here.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
