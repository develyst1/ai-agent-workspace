# REQ-010: /chart — expose the หน่วยนับ (unit) at the TOP LEVEL of the response (like the weapon-type echo)

- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-07-20 by stakeholder (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal

REQ-008 put the weapon-type (`product_type_group_code` + `product_type_group_name`) at the **top level** of
the `/chart` response so the frontend can caption it. The stakeholder now wants the **หน่วยนับ (unit)** the
same way: today the unit only appears as `valueUnit` **inside each chart container** (and is `""` when the
result set is empty). The frontend wants to display the unit on screen alongside the weapon type.

Stakeholder: "valueUnit ที่ chart response กลับมาทุก chart ให้เอากลับไปส่งข้างนอกเหมือนของ product type code
เพราะเขาจะเอาไปโชว์บนหน้าจอเหมือนกัน."

## Requirement

1. Add the **หน่วยนับ (unit) at the top level** of the `/chart` response (alongside
   `product_type_group_code`/`_name`), so the FE can read it once without digging into each chart container.
2. **Populated even when the result is empty** — echo the **requested หน่วยนับ filter** (the unit the user
   selected; it's a required filter) resolved to its Thai name, so the caption still shows the unit when a
   filter yields no rows. (This is more robust than promoting the in-chart `valueUnit`, which is `""` on
   empty results — see Q.)
3. **Additive, response-only** — a new top-level field; no change to chart data, the per-chart `valueUnit`,
   filtering, or the envelope. Same pattern/scope as REQ-008.

## Acceptance Criteria

- [ ] `/chart` response has a top-level unit field (id + Thai name) reflecting the requested หน่วยนับ.
- [ ] It is populated even when the charts are empty (as long as a หน่วยนับ was selected).
- [ ] No change to chart data / per-chart `valueUnit`; `dotnet build` succeeds; other dashboards untouched.

## Constraints

- Backend only: `DidSpf.WebApi.Center`. Scope = **move dashboards' `/chart`** (a10 + license-move), matching
  REQ-008. Reuse the existing หน่วยนับ resolution (the unit dropdown/`T_M_UNIT`).

## Out of Scope

- No change to `/table`, other dashboards, or the per-chart `valueUnit` (stays data-driven).

## Questions

- Q1 (PM→stakeholder, via SA): **source of the top-level unit** — recommend the **requested หน่วยนับ filter**
  (id + resolved name; populated even when empty). Alternative = promote the charts' `valueUnit` (but that's
  `""` when the result is empty — e.g. your captured case). *(Default: echo the requested filter.)*
- Q2 (PM for SA): confirm the request field name for the หน่วยนับ filter (`quantity_unit_id`?) + the
  top-level response key (propose `quantity_unit_id` + `quantity_unit_name`) + resolution source (`T_M_UNIT`).
