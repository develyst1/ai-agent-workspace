# REQ-008: Dashboard /chart — echo the requested weapon-type filter back in the response

- Status: DELIVERED (2026-07-20 — TASK-011 done + Sober-reviewed; additive/deterministic, accepted on review; defaults locked)
- Priority: MEDIUM
- Requested: 2026-07-20 by stakeholder (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal

The frontend wants to display, above the charts, **which weapon type (ประเภทอาวุธ) the chart was filtered
by** — e.g. "ผลลัพธ์กราฟจากการกรองประเภทอาวุธ: กระสุน". Right now the `/chart` request carries the
weapon-type filter, but the **response does not echo it back**, so the UI can't label the result.

Stakeholder: "อยากให้แนบ request ที่เป็นประเภทอาวุธในการ search chart กลับมาที่ response ให้ front ด้วย เพราะ
เขาจะเอากลับไปโชว์บน UI ว่านี่คือผล chart จากการ filter ประเภทอาวุธแบบไหน."

## Requirement

1. The dashboard **`/chart` response** must **echo back the weapon-type filter value that was sent in the
   request** (ประเภทอาวุธ / the `product_type_group_code`-style field), so the frontend can show which
   weapon type the chart represents.
2. Echo enough for the FE to display it directly: the **code** (as sent) and its **Thai display name**
   (resolved the same way the ประเภทอาวุธ dropdown resolves it). If no weapon-type filter was sent, return
   an empty/omitted value (no error).
3. **Additive, response-only change** — a new field on the chart response; no change to the chart data,
   filtering, query, or the `ResponseResult` envelope. The request is unchanged (we only reflect what was
   sent).

## Acceptance Criteria

- [ ] `/chart` response includes the requested weapon-type (code + Thai name) that the frontend sent.
- [ ] When a weapon type is selected, the echoed value matches the request; when none, it's empty (no error).
- [ ] Chart data itself is unchanged; `dotnet build` succeeds; other dashboards untouched.

## Constraints

- Backend only: `DidSpf.WebApi.Center`. Applies to the **move dashboards' `/chart`**: `DASHBOARD_MOVE_A10`
  + `DASHBOARD_LICENSE_MOVE` (the ones in active work). Reuse the existing ประเภทอาวุธ (weapon-type)
  resolution already used for that dropdown/filter.

## Out of Scope

- No change to `/table` (unless SA finds it trivial to include; not required). No new filtering. No frontend.

## Questions

(SA Lead asks here; PM answers as `> answer: ...`)

- Q1 (PM→stakeholder): the ประเภทอาวุธ filter is a **single** select (`product_type_group_code`, e.g. PTG01
  กระสุน). Echo **code + Thai name** (e.g. `{ "product_type_group_code": "PTG01", "product_type_group_name":
  "กระสุน" }`) — OK, or code only? *(Proposing code + name.)*
- Q2 (PM→stakeholder): scope = the **move dashboards** (a10 + license-move) `/chart` only, or **all four
  dashboards'** charts for consistency? *(Default: move dashboards; extend if you want.)*
- Q3 (PM for SA): confirm the exact request field name for the weapon-type filter on each chart request +
  where best to place the echoed field on the response (top-level alongside the chart containers).
- Q4 (PM→stakeholder): echo **only ประเภทอาวุธ**, or also the other active filters (date range, หน่วยนับ,
  อาวุธ …) so the FE can caption them too? *(Default: only ประเภทอาวุธ as asked; easy to extend later.)*

---
### SA response (Sober, 2026-07-20) — SPEC-008 written, took the defaults

- **Q3 (SA):** request field = **`product_type_group_code`** (`WeaponCategory` on `DashboardMove{A10,License}SearchRequest`);
  echoed **top-level** on the chart response as `product_type_group_code` + `product_type_group_name`. Name resolved
  from `TMProductTypeGroupRepo` (T_M_PRODUCT_TYPE_GROUP) — the exact source the weapon dropdown already uses.
- **Q1/Q2/Q4 → took PM defaults** (code + name; move dashboards a10 + license-move; only ประเภทอาวุธ). If the
  stakeholder later wants code-only, or all-4-dashboards, or more filters echoed — all easy extensions; not blocking.
- Additive response-only, deterministic → **Sober-review acceptance (no live capture).** SPEC-008 + TASK-011 (TODO)
  ready. @Porter: confirm the defaults with the stakeholder whenever; @Jason can implement now regardless.
