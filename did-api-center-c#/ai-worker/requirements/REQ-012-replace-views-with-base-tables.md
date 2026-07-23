# REQ-012: Replace the `VW_PRODUCT` / `V_PROVINCE` view joins with the real base tables (dashboard queries)

- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-07-20 by stakeholder (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal

REQ-011 showed the `VW_PRODUCT` + `V_PROVINCE` **views** were the unbounded-slowness culprit (fixed by
materializing them). Stakeholder wants to go further: **stop joining the views; join the underlying base
tables directly** — expected to be faster (and removes the view-evaluation overhead).

## Requirement

1. In the a10 + license-move dashboard queries (`/chart` + `/table`), **replace the `VW_PRODUCT` join** (used
   for `PRODUCT_TYPE_GROUP_CODE` / weapon-type + product name) and the **`V_PROVINCE` join** (used for
   `AREA_NAME` = dest region) with **direct joins to the base tables** the views wrap.
2. **Result-identical** — the same weapon-type group, product name, and dest region/`AREA_NAME` for every row
   as today (verified by re-capture). No response-shape change.
3. Keep/beat the current no-date performance.

## Acceptance Criteria

- [ ] No `VW_PRODUCT` / `V_PROVINCE` reference remains in the two dashboard queries; base tables used instead.
- [ ] Re-capture (dated + no-date) matches today's values exactly (weapon type, product name, region).
- [ ] `dotnet build` succeeds; no-date still completes (no timeout).

## Constraints

- Backend: `DidSpf.WebApi.Center` DAL (`TTLicenseDtlRepository`, `TTInformMoveDtlRepository`). Brownfield —
  the base-table joins must replicate the views' exact logic (any filter/DISTINCT/join the view does).

## Questions

- Q1 (PM for SA): **get the view definitions first** — what base tables + joins/filters do `VW_PRODUCT` and
  `V_PROVINCE` encapsulate? (If not visible in code, a DATA REQUEST: `SELECT text FROM all_views WHERE
  view_name IN ('VW_PRODUCT','V_PROVINCE')`.) Replacing must reproduce them 1:1.
- Q2 (PM for SA): **is it actually worth it?** Perf is already fixed (TASK-017 materialization). Assess: does
  a base-table swap give a real, measurable win, or add re-map/correctness risk for little gain? Report back
  with a recommendation — Porter relays to the stakeholder before we commit.

> Porter note: proceeding per stakeholder request, but flagging that perf is already acceptable — SA's Q2
> assessment decides whether this is a net win or a keep-as-is.

## SA assessment — Sober, 2026-07-21 (preliminary; recommend AGAINST, pending view DDL)

**Q2 recommendation: NOT worth it — keep the TASK-017 materialized views.** Reasoning:
- **Perf is already fixed** (REQ-011 DELIVERED): the `GROUP BY` inline views make Oracle materialize each view
  **once** + hash-join → O(view+rows). No measured problem remains.
- **`VW_PRODUCT` almost certainly wraps a multi-table product hierarchy.** Evidence in the same DAL:
  `TTLicenseDtlRepository.GetTraderLicenseDtl` resolves product attributes via a **3–4 table chain** —
  `T_M_PRODUCT` → `T_M_PRODUCT_GROUP` → `T_M_PRODUCT_TYPE` → `T_M_PRODUCT_TYPE_GROUP`. If `VW_PRODUCT`
  encapsulates that (PRODUCT_CODE → PRODUCT_TYPE_GROUP_CODE), **inlining it replaces 1 join with 3–4 joins** per
  dashboard query → **more** complexity, not less, and equal-or-worse cost. `V_PROVINCE` similarly wraps
  province→area.
- **Correctness risk (brownfield):** to be result-identical we must replicate the view's *exact* joins/filters/
  DISTINCT. Any miss = wrong weapon type / dest region / duplicate or dropped rows — reintroducing the class of
  bug we just fixed (TASK-014). High risk for a marginal/negative perf delta.

**⇒ Recommend: keep the materialized-view approach; only revisit if a measured perf gap appears.** Present to
stakeholder before committing (Porter's note: SA's Q2 decides).

**Q1 — DATA REQUEST (via Porter → stakeholder/DBA) to finalize the recommendation / enable the swap if insisted:**
```sql
SELECT view_name, text FROM all_views WHERE view_name IN ('VW_PRODUCT','V_PROVINCE');
```
If the DDL shows the views are *trivial* (a plain rename or single join with no filter/DISTINCT), I'll revise —
the swap would then be low-risk. If they wrap the multi-table hierarchy (expected), the recommendation stands.
Status: **IN_SPEC — assessment delivered, awaiting the view DDL + stakeholder's keep/proceed decision.**
