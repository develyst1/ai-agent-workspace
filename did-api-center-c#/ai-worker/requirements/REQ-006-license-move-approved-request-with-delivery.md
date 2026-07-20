# REQ-006: DASHBOARD_LICENSE_MOVE — re-source to "approved อ.10 request + attached actual delivery" (mirror of A10)

- Status: READY_FOR_SA (stakeholder approved the data-lineage plan 2026-07-20; 2 sub-questions below still open for SA)
- Priority: MEDIUM
- Requested: 2026-07-20 by stakeholder (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal

Stakeholder doubts the correctness of License Move's data sourcing. After confirming how Move A10 works
(verified, correct), the stakeholder specified the intended principle for **License Move as the MIRROR of
A10**:

- **Move A10** (REQ-005, done): start from **actual deliveries** (`INFORM_MOVE`), attach the license info.
- **License Move** (this REQ): start from the **approved อ.10 move requests** (ใบคำขอขนย้าย อ.10 ที่อนุมัติ
  แล้ว) and **attach how much has actually been shipped** against each. A "plan (approved) vs actual
  (delivered)" view.

Stakeholder's words: "เอาใบคำขอที่ได้รับการอนุมัติแล้วมาโชว์ โดยแนบว่าส่งจริงไปยังไงแล้วบ้าง."

## Requirement

1. **Backbone = approved อ.10 move requests.** Every approved request(-line) appears **even if nothing has
   been delivered yet** (i.e. LEFT-join the delivery side, don't drop undelivered requests).
2. **Attach the actual-delivery facts** from the `INFORM_MOVE` family (the same verified source Move A10
   uses): at minimum the delivered quantity (sum) against each approved request, so each row shows
   **approved amount vs delivered amount** (and remaining).
3. **Support multiple weapon types per request.** The customer says an อ.10 request is *usually* 1 weapon
   type, **but the design must handle N types per request** — do not hard-assume a single type.
4. Reuse the verified A10 delivery-sourcing (`T_T_INFORM_MOVE`/`_DTL`, linked by `REF_LICENSE_NO` / the
   request) for the "actual" side; only the starting point + join direction differ.
5. **JSON/behaviour parity** with the existing dashboard conventions (snake_case keys, `ResponseResult`
   envelope, shared chart/dropdown classes untouched).

## Acceptance Criteria

- [ ] Rows are driven by **approved อ.10 requests** (approved-but-undelivered requests still show, with
      delivered = 0).
- [ ] Each row shows the **approved qty** and the **actual delivered qty** (+ remaining) sourced from the
      INFORM_MOVE data — not 0/placeholder.
- [ ] A request with **multiple weapon types** is represented correctly (all types shown; totals right).
- [ ] Filters/columns match the License Move frontend page (to be captured — see Questions).
- [ ] `dotnet build` succeeds; other dashboards untouched; verified against a live capture (like A10).

## Constraints

- Backend only: `DidSpf.WebApi.Center`, the existing `DashboardMoveLicense*` code (REQ-001/002 only
  renamed keys + made the weapon dropdown config-driven; the data logic was built earlier and is what's in
  doubt). Brownfield — no direct DB access; unknowns go through a DATA REQUEST.
- Reuse REQ-005's INFORM_MOVE findings + the `MoveRequestType` common-code + buyer-group master learnings.

## Out of Scope

- No change to Move A10 or the license-book dashboards. No frontend code (mock→real wiring is FE-owned).

## Questions

(SA Lead asks here; PM answers as `> answer: ...`)

- Q1 (PM→stakeholder): **Page URL of the License Move dashboard** — ✅ RESOLVED. Captured
  `/officer/dashboard-move-license` ("ยอดอนุญาตให้ขาย/ขนย้ายอาวุธ"). Full filters/charts/columns in
  `../project-docs/dashboard-move-license-frontend-capture.md`. Key facts:
  - Filters by **วันที่อนุญาต** (issue-date range), not move date → confirms license-first.
  - Table has both `จำนวนที่ได้รับอนุญาต` (col 11, approved) and **`จำนวนขนย้ายจริง` (col 12, actual delivered)**
    → the "plan vs actual" view. Col 12 = the field that returned 0; **fix = attach SUM of INFORM_MOVE deliveries**.
  - Charts measure the **approved** qty (title "ยอดอนุญาต…"), unlike a10 (actual). One chart is
    **"แยกตามเอกสารการซื้อ"** (`purchase_document`) — a known gap ("ไม่ระบุ") needing a source (likely DATA REQUEST).
- Q2 (PM for SA): **What counts as an "approved request"** — the issued license (`T_T_LICENSE` `FORM_ID=10`,
  approved/issued status) or the move-request record (`T_T_REQUEST_MOVE`) at an approved status? SA to trace
  the actual chain (request → approval → license) and confirm the backbone table + the approved-status filter.
- Q3 (PM for stakeholder, via SA): **Row grain + which delivery facts to show.** Proposed: 1 row per
  approved request × weapon-type, showing approved qty, delivered qty (sum), remaining, #deliveries, last
  move date. Confirm the exact columns once the page is captured.
- Q4 (PM for stakeholder, still open — stakeholder approved the plan without answering): the
  **`purchase_document` chart** ("แยกตามเอกสารการซื้อ") source is unknown (was "ไม่ระบุ"). SA to trace;
  if not in code, DATA REQUEST via Porter.
- Q5 (PM for SA): the `จำนวนขนย้ายจริง` attach — match by `REF_LICENSE_NO` + weapon (`PRODUCT_CODE`) is the
  proposed grain (stakeholder didn't object). SA to confirm it doesn't need lot-level; LEFT join (0 if none).

> Porter note (2026-07-20): stakeholder **approved this data-lineage plan** ("ถูกแล้ว เอาเลยเรื่องนี้").
> @Sober: please pick up REQ-006 — trace the approved-request backbone (Q2), design the INFORM_MOVE attach
> for `จำนวนขนย้ายจริง`, keep multiple-type support. Raise Q4 (purchase-doc) / any DATA REQUEST via @Porter.

---
### SA response (Sober, 2026-07-20) — SPEC-006 written

- **Q2 (backbone) → traced from code, RESOLVED: no change.** The current `GetMoveLicenseDashboard` backbone is
  already the approved อ.10 lines: `T_T_LICENSE (LICENSE_STATUS=40)` INNER `T_T_LICENSE_MOVE` INNER
  `T_T_LICENSE_DTL`. 1 row = 1 approved license × 1 weapon type → **multiple types already supported**. REQ-006
  = a **data-attach**, not a rebuild.
- **Q5 (attach grain) → CONFIRMED.** `move_qty` = `NVL(SUM(T_T_INFORM_MOVE_DTL.QUANTITY),0)` matched by
  `REF_LICENSE_NO=LICENSE_NO` + `PRODUCT_CODE`, via a correlated scalar subquery (LEFT semantics; 0 if never
  delivered; no lot-level; no row multiplication). Reuses the exact INFORM_MOVE link the A10 capture verified.
- **Q4 (purchase_document) → genuine data gap → DATA REQUEST 7 (@Porter).** Service sets
  `purchase_document = NOT_SPECIFIED`; no source in code. Chart "แยกตามเอกสารการซื้อ" stays "ไม่ระบุ" until the
  stakeholder points to the column/table. **Non-blocking** — the `move_qty` core ships without it.
- **Type columns (col5/col6):** the capture wants col6 ประเภทการขนย้าย = `MoveRequestType`, but that's the same
  **unresolved naming-trap** flagged on A10 — deferred until Porter/stakeholder confirm the two "type" fields are
  distinct. Not in TASK-009.
- **REQ-007 (dates) folded into TASK-009** (same move-license model/service).

---
### Porter — stakeholder answers on the type columns + buyer group (2026-07-20)
- **col6 ประเภทการขนย้าย vs col5 ประเภทการขออนุญาต → CONFIRMED DISTINCT (2 different fields).**
- **col5 ประเภทการขออนุญาต → hardcode a fixed enum for now** ("fix ไปเลย ก่อน hardcode"). Values:
  1. **ขนย้าย**  2. **ขายขนย้ายในราชอาณาจักร**  3. **ขายขนย้ายนอกราชอาณาจักร**
  (These map to the license/request permit type — cf. common-code `RequestType`: อ.9 ขนย้าย / อ.15 ขายในราชอาณาจักร
  / อ.14 ขายนอกราชอาณาจักร.) @Sober: wire col5 to this **hardcoded 3-value map**, dropping the old
  INFORM_REQUEST_TYPE 0/1 source. **Determine from code which field selects among the 3 per row** (likely the
  license's request/form type); if not resolvable, 1 quick stakeholder confirm via @Porter.
- **col6 ประเภทการขนย้าย** stays = `MoveRequestType` (0–5) as designed in REQ-005 (now unblocked — the two
  columns are distinct).
- **Buyer group** (stakeholder: "T_M_BUYER_AUTHORITY table กลุ่มผู้ซื้อ"): source the กลุ่มหน่วยผู้ซื้อ from
  **`T_M_BUYER_AUTHORITY`** — @Sober confirm whether the **group NAME** (ทหาร/ตำรวจ/…) is a column on that
  table and source the label from there instead of the hardcoded 1/2/3/9 map (this also resolves the code-`0`
  foreign-buyer case). [Porter reading of a terse answer — re-confirming with stakeholder.]
- **`purchase_document` (เอกสารการซื้อ) → RESOLVED: NO SOURCE EXISTS.** Stakeholder confirmed there is no
  such data ("ไม่มีนะ"). Origin of the field: the frontend License Move page has a chart "แยกตามเอกสารการซื้อ"
  (captured), and the pre-existing backend already returned `purchase_document = "ไม่ระบุ"` (no column). We
  did not add it. **Decision: leave it "ไม่ระบุ" (backend can't fill it); removing the chart is a frontend
  change, out of scope.** DATA REQUEST 7 CLOSED.

> ⚠️ Porter process note (2026-07-20): stakeholder has **NOT authorized implementation** ("ฉันยังไม่ได้ให้
> Jason ทำอะไร"). SPEC-006/007 + TASK-008/009 are **prepared but must NOT be coded until the stakeholder
> gives the go.** No BE work proceeds until then.
- Wrote `specs/SPEC-006-...`; **TASK-009** (delivery-attach + date) = TODO for Jason. @Jason: startable now (core
  is unblocked; purchase-doc + type-columns are separate/deferred). @Porter: relay DATA REQUEST 7 + the col5/col6
  question.
