# SPEC-025: move-license + a10 — ประเภทการขออนุญาต = `ReqMovePermitType` (MV/SD/EX) derived from the request chain

- Source: REQ-023 (DATA REQUEST answered — 3 buckets confirmed, NULL-or-0 trap confirmed)
- Status: ACTIVE
- **Supersedes** TASK-041 (REQ-021 finding 2) for a10 col5.

## Owning the TASK-041 error
SPEC-023 §F concluded "col5 adopts `MoveRequestType`" from DR-17's two signals (observed domain `{0,1}` ⊂ `{0..5}`, and
the hardcoded strings being truncations of that group's labels). The inference was procedurally clean and **still wrong**,
because both signals only establish *which values exist* — never *what the field means*. The field is not an
`INFORM_REQUEST_TYPE` label at all; it is the **permit type of the originating request**, resolved by walking the
request chain. Worse: the shadow-อ.9 / `REF_REQUEST_ID` relationship is documented in our own
`DidSpf.WebApi.Center/CLAUDE.md`, which I had in context and did not connect to a field I was re-pointing.
**Process change adopted (Porter's, and it's right):** for any field whose value is a *code*, the SPEC must state its
**business meaning + source table/column path**, not just its label group. If that path can't be traced in the schema or
repo docs, it is a stakeholder question, not an inference.

## Verified before speccing
- **JSON keys already match the FE — no key change needed.** Both models: `move_request_type` / `_ddl` / `_name` =
  ประเภทการขออนุญาต (C# property is confusingly `TransportType*`), and `transport_type_code` / `_ddl` / `_name` =
  ประเภทการขนย้าย (C# `MoveType*`). Only the **content/derivation** of the `move_request_type*` family changes.
  ⚠ Leave the C# names alone — the FE binds to the JSON keys; renaming is churn. Add a comment instead.
- **⚠ Correction to REQ-023's implementation note:** it says "both dashboards' queries already join `T_T_REQUEST`",
  citing `TTLicenseRepository` L149/L172/L192 — a repo **neither dashboard uses**. Actual state:
  - **license-move** (`TTLicenseDtlRepository.GetMoveLicenseDashboard`) — **does** join `T_T_REQUEST RQ ON RQ.ID = L.REQUEST_ID` ⇒ needs only the **parent** join added.
  - **a10** (`TTInformMoveDtlRepository.GetMoveA10Dashboard`) — **does NOT join `T_T_REQUEST` at all**; col5 comes from
    `H.INFORM_REQUEST_TYPE` ⇒ needs **two** new joins (the request *and* its parent).

## The derivation (data-confirmed)
```
R = T_T_REQUEST for this license (R.ID = L.REQUEST_ID)
R.REF_REQUEST_ID IS NULL OR = 0   ⇒ MV                        (2,397 rows: 2,390 NULL + 7 ZERO)
else parent P.ID = R.REF_REQUEST_ID → P.REQUEST_TYPE = 5 ⇒ SD (426) · 6 ⇒ EX (20)
```
**The `OR = 0` is mandatory, not defensive** — 7 real rows store "no parent" as `0` (`TTRequestEntity.RefRequestId`
defaults to `0`). `IS NULL` alone would push those 7 into the parent lookup, match nothing, and render blank instead of
MV: silent and low-volume. Query 1 also proves **no parent type outside {5,6}**, so 3 buckets cover 100% of data — keep
an unmapped-parent fallback but comment it as **unreachable on current data**; do not invent a 4th label.

## One constant (temporary, pending `CODE_INT`)
`ReqMovePermitType` has `CODE_INT` NULL for all 3 today; the stakeholder will populate it later and instructed us to
hardcode for now. Put the pairs in **exactly one place** — `ConstantSPF` (domain/workflow codes live there, same home as
`GroupCode`) — plus `GroupCode.REQ_MOVE_PERMIT_TYPE = "ReqMovePermitType"`:
```
MV = 3 · SD = 5 · EX = 6      // T_T_REQUEST.REQUEST_TYPE values
```
Comment it with **"temporary — REQ-023; replace with CODE_INT once the stakeholder populates it"** so nobody "cleans up"
the hardcode early. Switching later must be a one-line change.

## Changes (both dashboards, same shape)
1. **Query** — add the parent join, pre-aggregated / plain LEFT JOIN, **no correlated subquery** (REQ-011/012):
   license-move `LEFT JOIN T_T_REQUEST P ON P.ID = RQ.REF_REQUEST_ID`; a10 additionally
   `LEFT JOIN T_T_REQUEST R ON R.ID = L.REQUEST_ID` first. Select what the derivation needs
   (`R.REF_REQUEST_ID`, `P.REQUEST_TYPE`). Both are many-to-one on a PK ⇒ no row multiplication.
2. **Derived code** (service): `MV` / `SD` / `EX` per the rule above → label from the `ReqMovePermitType` group.
3. **`move_request_type_ddl`** — exactly the 3 options from the group, **`SEQUENCE` order, active + `DISPLAY_TYPE` SPF**
   (REQ-021 semantics), values = `CODE_STR` (`MV`/`SD`/`EX`).
4. **`move_request_type_name`** (table) — the group's `CODE_NAME` for the derived code.
5. **Filter** — `move_request_type` now matches the **derived code**, not the old raw column. Because both dashboards
   filter inside the shared row-building path, **the charts filter automatically** — verify that's still true rather
   than assuming (acceptance requires table *and* charts).
6. **a10 only** — `H.INFORM_REQUEST_TYPE` becomes unused ⇒ remove the select **and** the DTO field (house rule: clean up
   what your own change orphaned). Confirm nothing else reads it first.

## Must NOT change
`transport_type_code*` (ประเภทการขนย้าย) in either dashboard · backbone filters/dates/other columns/charts shapes ·
**`dashboard-tracking`** — it has the same column and probably the same defect, but the stakeholder scoped this to 2
menus and said more items are coming. **Do not touch it until they say so.**

## Acceptance
- [ ] Both `move_request_type_ddl`s return exactly the 3 options in `SEQUENCE` order.
- [ ] `move_request_type_name` shows ขนย้าย / ขายขนย้ายในราชอาณาจักร / ขายขนย้ายนอกราชอาณาจักร.
- [ ] Each of the 3 filters table **and** charts; MV returns the no-parent rows (**including the 7 stored as `0`**).
- [ ] MV/SD/EX ⇄ 3/5/6 in ONE constant, commented temporary; `transport_type_code_name` untouched; tracking untouched.
- [ ] `dotnet build` succeeds.

## Tasks
- **TASK-043** — shared constant + `GroupCode` key + **license-move** (parent join only).
- **TASK-044** — **a10** (two new joins + orphan `INFORM_REQUEST_TYPE` removal; supersedes TASK-041's col5 change).

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
