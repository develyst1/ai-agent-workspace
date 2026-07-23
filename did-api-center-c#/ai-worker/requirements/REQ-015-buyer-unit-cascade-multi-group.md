# REQ-015: `search-filter-buyer-unit` — accept MULTIPLE buyer-group codes (array parent)

- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-07-20 by stakeholder (dev@smartalliance.co.th)
- Deadline: none (queued — Jason is on REQ-014)

## Problem / Goal

REQ-013 added the cascade `GET /dashboard-move-{a10,license}/search-filter-buyer-unit?buyer_group={code}` with
a **single** group code. The frontend lets the user select **multiple** buyer groups → the endpoint must
accept an **array of group codes**. Stakeholder: "เขาเลือก group ได้หลาย group ให้มาได้ — ถ้ายังไม่รองรับ array
ให้แก้."

## Requirement

1. The `buyer_group` parameter on `search-filter-buyer-unit` accepts **one or more** `AUTHORITY_GROUP_NO`
   values (array / repeated param, e.g. `?buyer_group=1&buyer_group=2` or `?buyer_group=1,2` — SA picks the
   convention consistent with the codebase's other multi-value params).
2. Semantics (optional parent, unchanged otherwise):
   - **none** → all buyer units (as today).
   - **one or more groups** → units belonging to **ANY** of the selected groups (union).
3. Apply to **both** move dashboards (a10 + license-move). No other behaviour change.

## Acceptance Criteria

- [ ] `search-filter-buyer-unit` with multiple `buyer_group` values returns the **union** of those groups' units.
- [ ] Single value + no value still behave as in REQ-013. `dotnet build` succeeds.

## Constraints

- Backend: the REQ-013 cascade method + its controller param, both dashboards. Reuse `T_M_BUYER_AUTHORITY`
  (`AUTHORITY_GROUP_NO`).

## Questions

- Q1 (PM for SA): does the current endpoint already accept an array, or is it single? Change to multi if single.
  Pick the param convention (repeated `buyer_group` vs CSV) to match the codebase.
- Q2 (PM for SA, consistency check): the **main chart/table** buyer-group filter (`req.BuyerGroups`) — does it
  already accept multiple groups? If the FE now sends multiple, confirm the chart/table filter handles the array
  too (so the whole page is consistent), or flag as a small follow-up.

> Queue note: **Jason is on REQ-014 (dashboard-import).** SA can SPEC now; implementation follows REQ-014.
