# REQ-014: DASHBOARD_IMPORT — build the Center backend for the อ.8 import-permit dashboard

- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-07-20 by stakeholder (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal

New officer dashboard **`/officer/dashboard-import`** — "ยอดอนุญาตให้สั่งหรือนำเข้ามาในราชอาณาจักรซึ่งวัตถุ
หรืออาวุธ" (import permits; license = **หนังสือ อ.8**). Needs a full Center backend, built **reusing the
patterns + learnings from the two prior dashboards** (dashboard-move-a10, dashboard-move-license) — stakeholder:
"ไปต่อที่เมนูนี้เลย ในแบบที่มีความรู้จากสองเมนูก่อนหน้ามาแล้ว." Frontend evidence:
`../project-docs/dashboard-import-frontend-capture.md`.

## Requirement

Deliver the officer endpoints powering the page end-to-end, **mirroring License Move (REQ-006): license-first
"plan vs actual"** — approved อ.8 import licenses (permitted qty) with the **actual imported qty (per customs /
กรมศุลฯ) attached**.

1. **search-filter** — ผู้ประกอบการ, หน่วยนับ*, วัตถุหรืออาวุธ* (required); + any related dropdown as its own
   `search-filter-*` cascade endpoint (per the established rule — SA to decide if วัตถุหรืออาวุธ cascades from หน่วยนับ).
2. **chart** (POST) — 3 charts: (a) **Top 5 by ประเทศผู้ผลิต** (mfg country), (b) by ผู้ประกอบการ (measure =
   permitted qty), (c) by ผู้ประกอบการ **counted in ฉบับ = distinct-license count**.
3. **table** (POST) — columns per the capture: อ.8 no, issue/expiry date, trader, product code + name,
   **ประเทศผู้ผลิต**, **จำนวนที่ได้รับอนุญาต** (permitted), **จำนวนที่นำเข้าจริง (customs)**, หน่วยนับ.
4. **Filter by** the issue-date range (`วันที่อนุญาต`), trader, unit, product.
5. **Conventions (reuse, from day one):** DB-column snake_case keys, `ResponseResult` envelope, shared
   chart/dropdown inner classes untouched; **apply the perf learnings** (slim base-table joins — no fat views;
   pre-aggregated LEFT-JOIN for the "actual" attach — no per-row correlated subqueries; **no-date search must
   complete, not hang**).

## Acceptance Criteria

- [ ] Endpoints exist for dashboard-import: search-filter (+ cascades), chart (POST), table (POST) — matching
      the frontend contract.
- [ ] Table shows **permitted vs actual-imported** per อ.8 line; ประเทศผู้ผลิต populated; the "ฉบับ" chart =
      distinct-license count.
- [ ] snake_case keys; `dotnet build` succeeds; no-date completes; other dashboards untouched.
- [ ] Data-correctness verified via a live capture (like a10/license-move), DATA REQUESTs where needed.

## Constraints

- Backend only: `DidSpf.WebApi.Center` — new `DashboardImport*` controller/service/models mirroring
  `DashboardMoveLicense*`, registered in `Program.cs`. Brownfield — never touch a real DB; unknowns → DATA REQUEST.

## Out of Scope

- No frontend code (FE wires mock→real). No change to other dashboards.

## SA investigation — Sober, 2026-07-21 (traced code + DATADIC before asking)

Resolved 4/5 from code; only the "actual imported" source is a true unknown (→ DATA REQUEST 10).

- **A1 (อ.8 backbone):** `T_T_LICENSE` **`FORM_ID = 8`** (อ.8; same FORM_ID scheme License Book uses) + **`LICENSE_STATUS
  = 40`** (issued) × `T_T_LICENSE_DTL`. **No import-specific license header** exists (DATADIC T_T_ list has
  LICENSE/LICENSE_DTL/LICENSE_MOVE/LICENSE_INFORM but **no LICENSE_IMPORT**) → FORM_ID=8 identifies อ.8 directly
  (simpler than อ.10's T_T_LICENSE_MOVE back-join). Verify FORM_ID=8 at the capture.
- **A3 (ประเทศผู้ผลิต) — SOLVED in code:** `T_T_LICENSE_DTL_PRODUCER` (`TTLicenseDtlProducerEntity`, doc = "ผู้ผลิต +
  ประเทศต้นทางของรายการในใบอนุญาต...อ.8"), sub of `T_T_LICENSE_DTL` keyed by **`LICENSE_DTL_ID`**, cols `PRODUCER_NAME`
  + **`PRODUCER_COUNTRY_CODE`** → join `T_M_COUNTRY (COUNTRY_CODE → COUNTRY_NAME)`. ⚠ Grain: a line can have multiple
  producers (`ITEM_NO`) → multiple countries; SA to pick per-producer-row vs one (see SPEC-014).
- **A2 (จำนวนที่นำเข้าจริง / customs) — DATA REQUEST 10 (the real unknown):** the actual side = the **"แจ้งนำเข้า"
  (INFORM_IMPORT)** declaration family — there's a whole separate dashboard for it (`ConstantSPF.DASHBOARD_INFORM_IMPORT
  = "AX31"` = "ยอดการแจ้งนำเข้า...ตามแบบ อ.8"). But it is **not in DATADIC's documented T_T_ list and has no DAL entity**
  (just like a10's INFORM_MOVE, which needed DATA REQUEST 1). Need: the table(s) holding **actual customs-declared import
  quantity** per อ.8 license + product, the **qty column**, the **link to the license** (`REF_LICENSE_NO`?) **+ product**
  (`PRODUCT_CODE`?), and an **import date**. (`T_T_REQUEST_IMPORT` is the *application*, not the actual qty — checked.)
- **A4 (ฉบับ chart):** `COUNT(DISTINCT license)` per trader (distinct `L.LICENSE_NO`/`L.ID`) — grain confirmed.
- **A5 (product dropdown):** own cascade endpoint **`search-filter-product?quantity_unit_id=`** (optional หน่วยนับ parent),
  mirroring the established cascade rule; source = distinct products on อ.8 license lines (`T_T_LICENSE_DTL`, FORM_ID=8),
  filterable by unit. (No weapon-type-group here — simpler than a10/license.)

## DATA REQUEST 10 (via Porter → stakeholder/DBA) — the ONLY blocker for the "actual" attach
> Which table holds the **actual imported quantity per แบบ อ.8 (แจ้งกรมศุลฯ / INFORM_IMPORT)**? Please provide:
> 1. Table name(s) — the header + detail (analogous to `T_T_INFORM_MOVE` + `T_T_INFORM_MOVE_DTL`).
> 2. Columns: the **imported quantity**, the **quantity-unit id**, the **product code**, the **ref-license linkage**
>    (`REF_LICENSE_NO` or license id), and an **import/declare date**.
> 3. A row count + a sample row (like DATA REQUEST 1 for INFORM_MOVE).
The backbone + producer-country + charts + cascades can be scaffolded now (SPEC-014); the "จำนวนที่นำเข้าจริง" column +
the by-nothing-actual measures wait on this.

## Questions

(SA Lead asks here; PM answers as `> answer: ...`)

- Q1 (PM for SA): **อ.8 import-license source** — which table + FORM_ID/status identifies the approved อ.8
  import licenses (the backbone)? Trace like อ.10; DATA REQUEST if not in code.
- Q2 (PM for SA): **จำนวนที่นำเข้าจริง (actual imported per กรมศุลฯ)** — this is the "actual" side (analogous to
  INFORM_MOVE for move). Which table/columns hold the customs-declared import quantities, linked to the license
  + product? Likely a **DATA REQUEST** (the biggest unknown, like DATA REQUEST 1 was for a10).
- Q3 (PM for SA): **ประเทศผู้ผลิต (mfg country)** source column/table (on the license line? the product? a
  customs record?).
- Q4 (PM for SA): the **"ฉบับ" chart** = COUNT(DISTINCT license) per trader — confirm the grain.
- Q5 (PM for SA): does **วัตถุหรืออาวุธ*** (product) cascade from หน่วยนับ (its own `search-filter-*` endpoint),
  or is it a standalone dropdown? Source for the product list.
