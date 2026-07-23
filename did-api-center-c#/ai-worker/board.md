# Board — did-api-center-c#

> Single source of truth. Update me at the end of every session (see PROTOCOL.md).

## Project info

- Description: DID API Center (C#)
- Code repository: `C:\Users\Admin\sa-project\spf\DidSpf.WebApi.Center` (ASP.NET Core WebApi — confirmed by stakeholder 2026-07-17)
- Team: Porter (PM) · Sober (SA Lead) · Jason (BE)

## Requirements

| ID | Title | Priority | Status | Owner of next step |
|----|-------|----------|--------|--------------------|
| REQ-001 | DASHBOARD_LICENSE_MOVE — align response keys to DB column names | MEDIUM | DELIVERED | — (done) |
| REQ-002 | DASHBOARD_LICENSE_MOVE — weapon-type dropdown codes configurable in appsettings | MEDIUM | DELIVERED | — (done) |
| REQ-003 | DASHBOARD_LICENSE_BOOK — align response keys to DB column names | MEDIUM | DELIVERED | — (done; stakeholder confirmed 2026-07-20) |
| REQ-004 | DASHBOARD_LICENSE_BOOK — book-type dropdown configurable in appsettings (DB labels) | MEDIUM | DELIVERED | — (done; stakeholder confirmed 2026-07-20) |
| REQ-005 | DASHBOARD_MOVE_A10 — build Center backend for the อ.10 movement/delivery dashboard | MEDIUM | DELIVERED | — (done; code-`0` label closed by TASK-010) |
| REQ-006 | DASHBOARD_LICENSE_MOVE — re-source to approved-request-first + attach actual delivery (mirror of A10) | MEDIUM | DELIVERED | — (all A–E captured ✅; TASK-010 label fix reviewed 2026-07-20) |
| REQ-007 | Dashboard date fields — one key, formatted value (drop `_formatted` twin) | MEDIUM | DELIVERED | — (a10 + license-move captures: `issue_date` single formatted, no `_formatted`) |
| REQ-008 | Dashboard /chart — echo the requested ประเภทอาวุธ (weapon-type) filter back in the response (for FE caption) | MEDIUM | DELIVERED | — (TASK-011 done+reviewed; additive/deterministic → accepted on Sober review, defaults locked) |
| REQ-009 | Unify ประเภทอาวุธ dropdown onto ONE shared config for a10 + move-license (default all 4 PTG; empty⇒all) | MEDIUM | DELIVERED | — (TASK-013 done+reviewed; shared `DashboardWeaponTypeCodes`, default 4 PTG, empty⇒all → deterministic, accepted on review) |
| REQ-010 | /chart — expose หน่วยนับ (unit) at TOP LEVEL (like the weapon-type echo; populated even when empty) | MEDIUM | DELIVERED | — (TASK-015 done+reviewed; additive/deterministic → accepted on Sober review, like REQ-008) |
| REQ-011 | Dashboards support NO-date-range search (return all) without hanging — optimize the query | HIGH | DELIVERED | — (stakeholder confirms no-date is faster/works 2026-07-20; TASK-016 subquery→join + TASK-017 view-materialization; code-only, no indexes) |
| REQ-012 | Replace `VW_PRODUCT`/`V_PROVINCE` view joins with base tables in the dashboard queries (perf; result-identical) | MEDIUM | IN_SPEC (**SA recommends AGAINST** — perf already fixed; VW_PRODUCT wraps 3–4 table hierarchy → inlining adds joins+risk for no gain) | Porter → stakeholder: keep-as-is decision + view DDL DATA REQUEST |
| REQ-013 | หน่วยผู้ซื้อ cascades from กลุ่มหน่วยผู้ซื้อ (optional parent) — own `search-filter-buyer-unit` endpoint; remove from main search-filter | MEDIUM | IN_SPEC | Jason — SPEC-013/TASK-018 dispatched |

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-001 | Rename DASHBOARD_LICENSE_MOVE JSON keys to DB column snake_case | SPEC-001 | DONE | Jason (BE) | none |
| TASK-002 | Make DASHBOARD_LICENSE_MOVE weapon-type dropdown config-driven (DB labels) | SPEC-002 | DONE | Jason (BE) | none |
| TASK-003 | Rename DASHBOARD_LICENSE_BOOK JSON keys to DB column snake_case | SPEC-003 | DONE | Jason (BE) | none |
| TASK-004 | Make DASHBOARD_LICENSE_BOOK book-type dropdown config-driven (DB labels, value=FORM_ID) | SPEC-004 | DONE | Jason (BE) | TASK-003 |
| TASK-005 | Scaffold DASHBOARD_MOVE_A10 (controller+models+search-filter+cascades) | SPEC-005 | DONE | Jason (BE) | none |
| TASK-006 | DASHBOARD_MOVE_A10 chart+table on the INFORM_MOVE backbone | SPEC-005 | DONE (code; re-run capture to accept) | Jason (BE) | TASK-005 |
| TASK-007 | Add T_R_TRANSPORT_TYPE entity + ประเภทการขนย้าย dropdown | SPEC-005 | SUPERSEDED (wrong source; entity removed in TASK-006 #4) | Jason (BE) | none |
| TASK-008 | MOVE_A10 dates → single formatted `issue_date` (drop `issue_date_formatted`) | SPEC-007 | DONE | Jason (BE) | none |
| TASK-009 | LICENSE_MOVE — move_qty attach + dates + col5/col6 + buyer-group (from REQUEST_MOVE) | SPEC-006 + SPEC-007 | DONE (captured ✅ all A–E) | Jason (BE) | none |
| TASK-010 | Buyer-group unmapped code (`0`) → "ไม่ระบุ" label (a10 + license-move) | stakeholder 2026-07-20 | DONE | Jason (BE) | none |
| TASK-011 | /chart echo the requested ประเภทอาวุธ (code + Thai name) — a10 + license-move | SPEC-008 | DONE | Jason (BE) | none |
| TASK-012 | Buyer-group **dropdown** code `0`/unmapped → "ไม่ระบุ" (align w/ TASK-010; a10 + license-move, L96) | stakeholder 2026-07-20 | DONE | Jason (BE) | none |
| TASK-013 | Shared `DashboardWeaponTypeCodes` config + unified empty⇒all weapon dropdown (a10 + license) | SPEC-009 | DONE | Jason (BE) | none |
| TASK-014 | Fix ประเภทอาวุธ FILTER source → `VW_PRODUCT.PRODUCT_TYPE_GROUP_CODE` (both dashboards; BUG) | bug 2026-07-20 | DONE ✅ (stakeholder re-test: license /chart filter=PTG01 total=152030, was empty — bug closed) | Jason (BE) | none |
| TASK-015 | /chart — expose หน่วยนับ (unit) at top level (mirror weapon-type echo) — a10 + license-move | SPEC-010 | DONE | Jason (BE) | none |
| TASK-016 | Collapse dashboard correlated sub-queries → pre-aggregated LEFT JOINs (a10 + license; perf, result-identical) | SPEC-011 | DONE ✅ (dated confirmed correct on re-test; no regression) | Jason (BE) | none |
| TASK-017 | Materialize `VW_PRODUCT`/`V_PROVINCE` view joins via `GROUP BY` inline views (kills no-date timeout; a10 + license) | SPEC-011 | DONE ✅ (Sober-reviewed result-identical; perf = re-test to accept) | Jason (BE) | TASK-016 |
| TASK-018 | หน่วยผู้ซื้อ cascade endpoint (`search-filter-buyer-unit?buyer_group=`, optional) + remove `authority_name_ddl` from main search-filter (a10 + license) | SPEC-013 | REVIEW | Jason (BE) → Sober (SA) | none |

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| ~~DATA REQUEST 7 (purchase_document)~~ RESOLVED | — | Stakeholder: **there is no such data ("ไม่มี").** Field came from the frontend chart "แยกตามเอกสารการซื้อ" + the pre-existing backend placeholder ("ไม่ระบุ"). Decision: leave "ไม่ระบุ" (backend can't fill); removing the chart = frontend change, out of scope. CLOSED. |
| ~~col5 common-code vs hardcode (REQ-006)~~ RESOLVED | — | **Stakeholder chose common-code (dynamic) 2026-07-20.** col5 = `T_T_REQUEST.REQUEST_TYPE` → common-code group `RequestType` DB names ("คำขออนุญาตขนย้าย…(อ.9)", "…ในราชอาณาจักร (อ.15)", "…นอกราชอาณาจักร (อ.14)"). Matches TASK-009's plan — no hardcode, no rework. |
| ~~Buyer-group source (REQ-006)~~ RESOLVED | — | = `T_M_BUYER_AUTHORITY.AUTHORITY_GROUP_NO`, label via the 1/2/3/9 map (no separate name column — DATADIC:90; same as A10). In TASK-009 §E. Live-verify the license-side FK at the capture. |
| ~~REQ-006 buyer-column re-capture~~ PASSED | — | Re-capture 2026-07-20: **buyer-group resolves** (81/2569="1"/"ทหาร", 24/2569="9"/"อื่นๆ", `authority_name` real); **by-buyer-group chart splits** (ทหาร 150430 + "0" 1600 + อื่นๆ 16). Fix works. Only the code-`0` label is raw (below). |
| ~~code-`0` label fix~~ DONE (TASK-010) | — | Both services' buyer-group label fallback → "ไม่ระบุ"; reviewed 2026-07-20. **REQ-006 DELIVERED**; closed REQ-005's minor code-`0` item too. |

## Open issues (reported by stakeholder 2026-07-20)

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| ~~ประเภทอาวุธ dropdown EMPTY (move-license)~~ CONFIRMED = CONFIG | stakeholder (ops: set deployed config) | **Root cause CONFIRMED by capture (2026-07-20):** `GET /dashboard-move-a10/search-filter` `product_type_group_code_ddl` = **4 items** (PTG01 กระสุน/PTG02 อาวุธปืน/PTG03 วัตถุระเบิด/PTG04 อื่นๆ) → DB (`TMProductTypeGroupRepo`) is fine. move-license = **`[]`** because it's config-driven (REQ-002) and the **deployed `appsettings:Configurations:MoveLicenseWeaponTypeCodes` is empty/unset**. **NOT a code bug — no team code change.** Fix = set that config key in the deployed appsettings (e.g. `["PTG01","PTG02","PTG03","PTG04"]` or the desired subset) + restart. Stakeholder to pick which codes (that's the REQ-002 config purpose). Optional: team can update the repo appsettings default if they want a different baseline. |
| ~~authority_group_no_ddl code `0` label~~ DONE (TASK-012) | — | Both services' buyer-group dropdown fallback → "ไม่ระบุ"; reviewed 2026-07-20. |
| ~~ประเภทอาวุธ dropdown empty~~ → REQ-009 | — | Superseded: REQ-009 (shared config + empty⇒all) makes both dashboards default to all 4 PTG even if the deployed config is unset — kills the empty-trap. Interim "set the deployed key" no longer needed once REQ-009 ships. |

## Open issues (2026-07-20, cont.)

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| ~~weapon-type FILTER BUG → TASK-014~~ FIXED ✅ | — | **CONFIRMED FIXED (stakeholder re-test 2026-07-20):** `/dashboard-move-license/chart` filter=PTG01 → data returns (total 152030; was empty). `VW_PRODUCT.PRODUCT_TYPE_GROUP_CODE` source works. Bug closed. | 
| REQ-010 top-level unit empty when no หน่วยนับ filter sent | stakeholder (asked by Porter 2026-07-20) | Re-test showed `quantity_unit_id/name` = "" because the curl omitted the หน่วยนับ filter (REQ-010 echoes the **requested** filter). On the real FE, หน่วยนับ is a **required** filter → populated. **Q: keep (a) echo-requested-filter (fine since FE always sends), or (b) source the top-level unit from the data (like the charts' `valueUnit`="นัด") so it's populated even without the filter?** If (b) → small SPEC-010 adjust → Jason. | Both SQLs now source `WeaponCategoryCode` from **`VW_PRODUCT.PRODUCT_TYPE_GROUP_CODE`** via `LEFT JOIN VW_PRODUCT VWP ON VWP.PRODUCT_CODE = DTL.PRODUCT_CODE` (a10 `TTInformMoveDtlRepository` L45/L72; license `TTLicenseDtlRepository` L228/L249); no `L.PRODUCT_TYPE_GROUP_CODE` left; build 0 errors; `WeaponCategoryCode` filter-only → no output change. **Only acceptance remaining = data-dependent stakeholder re-test:** `/dashboard-move-license/chart`+`/table` filter=PTG01 → returns data; spot-check move-a10. → Porter to relay to stakeholder. |

## REQ-011 — no-date-range hang (diagnosis + DATA/OPS request)

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| REQ-011 diagnosis | — | **Sober (2026-07-21): (a) genuine full-scan, NOT a null-date bug.** Date predicates are conditionally concatenated (license L252-253; a10 L75-76) — empty date just omits the `AND ISSUE_DATE/MOVE_DATE >=…` line; all JOINs keyed → no cartesian. No-date already returns all rows correctly, just unbounded/slow. Amplifiers: license = **4 correlated sub-queries/row** (3 re-scan `T_T_REQUEST_MOVE` by REQUEST_ID + 1 SUM over INFORM_MOVE_DTL); a10 = 1/row; both = `V_PROVINCE` name-join + `VW_PRODUCT` view + full ORDER-BY sort. |
| REQ-011 code-side fix (team) | Jason (after DB facts + Q3) | Collapse the 3 REQUEST_MOVE correlated sub-queries → one `LEFT JOIN` to a `GROUP BY REQUEST_ID` derived table; `MovedQty` SUM → `LEFT JOIN` grouped derived table (result-identical). Optional `/table` `FETCH FIRST :N` if Q3=cap-ok. |
| REQ-011 DB/OPS request | **Porter → stakeholder/DBA** | Need: (1) EXPLAIN plan both unbounded `/chart`+`/table` queries; (2) row counts (T_T_LICENSE status40 / _LICENSE_DTL / _INFORM_MOVE_DTL / _REQUEST_MOVE); (3) existing indexes on join/filter/sort cols; (4) **cardinality:** T_T_LICENSE_MOVE 1:1 per LICENSE_ID? V_PROVINCE.PROVINCE_NAME unique? (many-per-key → row-multiplication = perf + latent dup bug). Candidate indexes listed in REQ-011. |
| REQ-011 Q3 (table cap) | **stakeholder** | Is a hard cap (top-N recent) acceptable for the unbounded `/table`, or must it return every row? (Charts aggregate → need all.) |

## Open questions (2026-07-20)

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| Why join `VW_PRODUCT`/`V_PROVINCE` (views) vs base tables? | Sober (SA) | Stakeholder (REQ-011 aftermath): why do the dashboards join the views, not the underlying base tables? @Sober: explain from code — what each view encapsulates (VW_PRODUCT: PRODUCT_CODE→type-group+name; V_PROVINCE: province→AREA_NAME/region), why the DAL uses them (reuse of tested mapping via VwProductRepo/VProvinceViewRepo, avoid re-deriving joins per query), and whether switching to base tables is worth it (perf now solved by TASK-017 materialization; base-table swap = re-map risk + more code). Plain rationale for Porter to relay; recommend keep-view unless a concrete win. |

## Parked / known notes

- **`purchase_document` / "เอกสารการซื้อ" (License Move chart "แยกตามเอกสารการซื้อ"):** stakeholder doesn't
  know what it is and confirms **no source data exists**. **Parked** — backend returns "ไม่ระบุ"; removing the
  chart would be a frontend change. Revisit only if a source surfaces. (Stakeholder: "ปล่อยไปก่อน note ไว้", 2026-07-20.)

## Resolved confirmations (2026-07-20)

- REQ-003: stakeholder OK'd keeping pivot `a8_paid…a17_unpaid` as-is + `name`→`trader_name`.
- REQ-004: stakeholder confirmed label=`FORM_CODE`, value=FORM_ID, frontend sends FORM_IDs.
- FE hand-off (acked): frontend sends `form_id` with FORM_IDs (`["8","10"]`, not `"อ.8"`) + adopts new snake_case keys; REQ-003+004 ship together.
- REQ-005 DATA REQUEST 2 (2026-07-20): `T_R_TRANSPORT_TYPE` = `TRANSPORT_TYPE_CODE` (code) + `TRANSPORT_TYPE_NAME` (Thai label). TASK-007 unblocked. Results in project-docs/data-req-2026-07-20-move-a10-results.md.
- REQ-005 DATA REQUEST 1 (2026-07-20): movement data source = **INFORM_MOVE family** (`T_T_INFORM_MOVE` + `T_T_INFORM_MOVE_DTL`; view `V_INFORM_MOVE_DTL_LOT`). `MOVE_DATE`/`MOVE_SEQ`/`QUANTITY`/`ALLOWED_QUANTITY`/`REF_LICENSE_NO` present. Sober to revise SPEC-005 data backbone. Columns + mapping in project-docs.
