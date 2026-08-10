# TASK-044: **a10** ประเภทการขออนุญาต from the request chain (supersedes TASK-041's col5 change)

- Source: SPEC-025 (REQ-023)
- Status: REVIEW
- Assignee: Jason (BE)
- Depends on: TASK-043 (uses its `ConstantSPF` constant + GroupCode key)


## Review — Verdict: DONE (code) — Sober (SA), 2026-07-24
- **Both new joins present** (a10 genuinely had none, as I corrected in SPEC-025): `T_T_REQUEST R ON R.ID = L.REQUEST_ID`
  (L67) + `T_T_REQUEST PRQ ON PRQ.ID = R.REF_REQUEST_ID` (L69), selecting `RefRequestId` (L36) / `ParentRequestType`
  (L37). PK joins, many-to-one, no correlated subquery. ✔
- **Derivation handles the trap** (L365): `RefRequestId == null || == 0 ⇒ MV`; ddl L53 `CommonCodeDdlByStr(REQ_MOVE_PERMIT_TYPE)`,
  filter L291, label L315 — all on the derived code, reusing TASK-043's single constant. ✔
- **Both orphans genuinely gone** (I re-checked precisely — my first grep was substring-matching and looked like leftovers):
  - a10 `INFORM_REQUEST_TYPE` → **0** in the SQL; the `MoveRequestType` DTO property removed — the one remaining textual
    hit is a **doc comment** about col6's common-code group, not a field.
  - license-move `RequestType` property removed — the two textual hits are the new `ParentRequestType` and a comment.
    `GetMoveLicenseDashboard` (L179-284) now selects only `PRQ.REQUEST_TYPE AS ParentRequestType`. ✔
- **Scope held — verified, not taken on trust:** the remaining `RQ.REQUEST_TYPE AS RequestType` at L491 falls between
  `GetTrackingDashboard` (L432) and `GetTrackingLicenseDetail` (L546) ⇒ it is **tracking's own query**, correctly
  untouched. His claim checked out. ✔
- col6 (`MoveTypeCode` via the `MoveRequestType` group) untouched — that one was always correct; FORM_ID=10 backbone,
  date filters, charts, cascades, other dashboards untouched. Build 0 err.
- Capture note stands: a10 col5 wording changes **again** (TASK-041's full DB labels → MV/SD/EX permit-type names) —
  expected, and the direct consequence of TASK-041 having been built on the wrong premise.
→ **REQ-023 code-complete.**

## Why
Same fix as license-move, but a10 is the one TASK-041 changed on a wrong premise: col5 is **not** an
`INFORM_REQUEST_TYPE` label — it is the originating request's permit type (MV/SD/EX). TASK-041's col5 change is
**replaced**, not extended.

## ⚠ a10 needs TWO new joins (REQ-023's note was wrong on this)
Unlike license-move, `TTInformMoveDtlRepository.GetMoveA10Dashboard` **does not join `T_T_REQUEST` at all** — col5 comes
from `H.INFORM_REQUEST_TYPE`. Add both, after the existing `T_T_LICENSE L` join:
```sql
LEFT JOIN T_T_REQUEST R ON R.ID = L.REQUEST_ID
LEFT JOIN T_T_REQUEST P ON P.ID = R.REF_REQUEST_ID
```
select `R.REF_REQUEST_ID AS RefRequestId`, `P.REQUEST_TYPE AS ParentRequestType` (nullable). Both PK joins ⇒
many-to-one, no multiplication, no correlated subquery.

## Derivation, DDL, label, filter
Identical to TASK-043 §3/§4, reusing the **same** `ConstantSPF` constant and `ReqMovePermitType` group lookup —
`MV` when `RefRequestId` is `null` **or `0`** (the 7-row trap), `SD`/`EX` from parent type 5/6, unreachable fallback
commented as such.

## Orphan cleanup — TWO of them now (house rule: clean up what your own change orphaned)
**(a) license-move carry-over (Sober's answer on TASK-043):** also remove `RQ.REQUEST_TYPE AS RequestType` from
`GetMoveLicenseDashboard` **and** the `RequestType` field on `DashboardMoveLicenseQueryResult` — you confirmed nothing
reads it after TASK-043. Batched here to keep it one build/review cycle.

**(b) a10:**
Once col5 no longer uses it, `H.INFORM_REQUEST_TYPE` is unused ⇒ **remove the select line and the DTO field**
(`MoveRequestType` on the a10 query result). **Confirm by grep that nothing else reads it first** and say so.
Note the field name is misleading anyway — it was never the `MoveRequestType` group.

## Must NOT change
`transport_type_code*` / col6 (`MoveTypeCode` ← `T_T_REQUEST_MOVE.MOVE_REQUEST_TYPE` via the `MoveRequestType` group) —
**that one was and remains correct**. Backbone (`FORM_ID=10`), date filters, charts, cascades, other dashboards.
**Do not touch `dashboard-tracking`.**

## Definition of Done
- [x] Both joins added; derivation correct incl. `= 0` ⇒ MV; ddl/label/filter from `ReqMovePermitType`.
- [x] `H.INFORM_REQUEST_TYPE` select + DTO field removed (grep-proven unused); col6 untouched.
- [x] `dotnet build` succeeds. Paste SQL + derivation + the orphan grep + build result.

## Implementation Notes
(Jason — 2026-08-10)

### Query — `TTInformMoveDtlRepository.GetMoveA10Dashboard`, two joins added
```sql
      ,R.REF_REQUEST_ID             AS RefRequestId      -- replaced H.INFORM_REQUEST_TYPE AS MoveRequestType
      ,PRQ.REQUEST_TYPE             AS ParentRequestType
...
INNER JOIN
  T_T_LICENSE L ON L.LICENSE_NO = DTL.REF_LICENSE_NO AND L.FORM_ID =: FORM_ID
LEFT JOIN
  T_T_REQUEST R ON R.ID = L.REQUEST_ID              -- คำขอของหนังสือฉบับนี้
LEFT JOIN
  T_T_REQUEST PRQ ON PRQ.ID = R.REF_REQUEST_ID      -- คำขอต้นทาง (parent) — derive MV/SD/EX
```
Kept your `R` alias for the request; used **`PRQ`** for the parent (not `P`) — `P` is already `T_M_PRODUCT` inside the
`VWP` inline view of the same statement, same collision as TASK-043. Both PK joins ⇒ many-to-one, no multiplication,
no correlated subquery. DTO swapped `int? MoveRequestType` → `int? RefRequestId` + `int? ParentRequestType`.

### Derivation / DDL / label / filter — identical to TASK-043, same constant
`MovePermitTypeCode(DashboardMoveA10QueryResult r)`: `RefRequestId == null || == 0` ⇒ `MV` (the 7-row trap);
parent 5/6 ⇒ `SD`/`EX` via the shared `ReqMovePermitType.BY_REQUEST_TYPE`; otherwise empty code ⇒ label falls back to
`NOT_SPECIFIED`, commented as unreachable on current data. DDL ← `CommonCodeDdlByStr(GroupCode.REQ_MOVE_PERMIT_TYPE)`
(CODE_STR value, active + SPF + SEQUENCE); label ← `CommonCodeStrMap` of the same group; filter ← the derived code.
The `CommonCodeDdlByStr`/`CommonCodeStrMap` helpers are the same shape as TASK-043's (each service keeps its own
private helpers, matching the existing per-service pattern in this suite).

### TASK-041's col5 change is fully replaced
`TransportTypeDdl` no longer shares col6's `MoveRequestType` list — it now has its own MV/SD/EX list, so the "both DDLs
from one query" optimisation from TASK-041 is gone by design. The naming-trap comment was rewritten: col5 is now
"parent request's permit type", **not** `INFORM_REQUEST_TYPE`, and it supersedes DR-17's conclusion.

### Orphan cleanup — both, grep-proven
**(b) a10:** confirmed before deleting — `r.MoveRequestType` was read at exactly 2 sites, the col5 filter (L291) and
label (L315), i.e. only the ones this task replaces. Removed `H.INFORM_REQUEST_TYPE AS MoveRequestType` from the SELECT
and `MoveRequestType` from `DashboardMoveA10QueryResult`. Post-check: `INFORM_REQUEST_TYPE` → **0** in the repo file;
the only `MoveRequestType` text left in the a10 DTO is the **comment on `MoveTypeCode`** naming the col6 *group* — correct.
**(a) license-move carry-over:** removed `RQ.REQUEST_TYPE AS RequestType` from `GetMoveLicenseDashboard` and the
`RequestType` field from `DashboardMoveLicenseQueryResult`. Post-check: the remaining `RequestType` hits in that DTO are
`ParentRequestType` + a col6 comment, and the surviving `AS RequestType` at repo L491 belongs to **`GetTrackingDashboard`**
(L432) — tracking's own copy, correctly untouched.

### Verification
- `dotnet build` (Center+SPF) → **Build succeeded, 0 Error(s)** (one interim `CS0246` → added
  `using DidSpf.Oracle.DataAccess.SPF.QueryResult;` to the a10 service, same as TASK-043).
- a10 col5 on the permit group: DDL L53, map L287, filter L291, label L315.
- **col6 untouched** (DDL L57 from `MoveRequestType` group, filter L292 `r.MoveTypeCode`, label L317) — it was and
  remains correct.
- Backbone `FORM_ID=10`, date filters, charts, cascades, other dashboards, **`dashboard-tracking`**: untouched.
- Static-only per brownfield rule; the real MV/SD/EX split and the DB `CODE_NAME` wording are data-dependent → capture.
  ⚠ At capture a10's col5 wording changes again (TASK-041's full DB labels → the MV/SD/EX permit-type names) — expected.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
