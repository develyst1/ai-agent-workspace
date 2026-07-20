# DATA REQUEST 3 — live capture + Porter acceptance analysis (REQ-005), 2026-07-20

Stakeholder hit the live Center endpoints with an officer token; body
`{ "move_date_range": ["2026-06-01","2026-06-30"] }`. Full JSON pasted in the session; key findings below.
**Team must not run these itself — this is the human-provided live capture (brownfield).**

## Verdict: ACCEPTANCE **NOT PASSED** — 1 confirmed bug (duplicate rows) + several blank columns to triage.
The core plumbing works (big risk cleared) but the table has a duplicate-row defect Sober predicted, so
**REQ-005 stays SPEC_DONE; TASK-006 → REWORK.**

## Sober's 4 checks
1. **Rows non-empty (the `REF_LICENSE_NO = LICENSE_NO AND FORM_ID=10` INNER join)** — ✅ **PASS.**
   7 rows for licenses `81/2569` + `80/2569`. The highest-risk join works.
2. **`move_date`/`move_seq`/`moved_qty` populated (not 0)** — ⚠️ **MOSTLY.** rows 1–5 fully populated
   (`move_seq` 10/9/8/7/6, `moved_qty` 10000/800/330/15000/5000). Rows 6–7 (`80/2569`) have `moved_qty=0`
   — possibly a genuine 0-qty move, but see #3 (they're the duplicate).
3. **No duplicated rows** — ❌ **FAIL.** `key:6` and `key:7` are **identical** (license `80/2569`, product
   `P-0672`, `move_date 2026-06-12`, `move_seq 3`, `moved_qty 0`, every field equal). This is exactly the
   `T_T_LICENSE_DTL` join-on `LICENSE_ID+PRODUCT_CODE` multiplication Sober flagged. **Dangerous for chart
   totals**: here the dupes are 0 so the total is unaffected, but a non-zero duplicated move would be
   double-counted in `SUM(moved_qty)`.
4. **`move_request_type_name` resolves (0/1 enum)** — ✅ **PASS.** Shows "ขาย/ขนย้ายนอกหน่วยงาน" (1) +
   "หน่วยงานตามมาตรา 7" (0) correctly.

## Table ↔ chart consistency (good signal)
- `top5_by_buyer_unit` groups by `authority_name` (หน่วยผู้ซื้อ / BUYER_NAME): "กรมทหารราบที่ 11…" =
  31130 = sum of rows 1–5 moved_qty ✅; "Hunter strike…" = 0 = rows 6–7 ✅.
- `by_trader`: "เนแรค…" = 31130 (all rows, trader เนแรค) ✅. Charts correctly SUM `moved_qty`.

## Secondary data-quality gaps (Porter flags — Sober to triage: code bug vs real DB data)
- **C. `transport_type_code_name` empty on ALL rows** (ประเภทการขนย้าย column blank everywhere). Source =
  `LDTL.TRANSPORT_TYPE_CODE` via `T_R_TRANSPORT_TYPE` (TASK-007). Not resolving — likely the LICENSE_DTL
  join isn't finding a code, or the data has none (move-license had transport-type trouble too).
- **D. `authority_group_no` + `authority_group_no_name` empty on ALL rows** → `by_buyer_group` chart
  collapses to a single "ไม่ระบุ" = 31130 (useless). The `T_M_PRIMARY_BUYER_AUTHORITY` → `AUTHORITY_GROUP_NO`
  resolution / buyer-group map isn't producing a value (BUYER_AUTHORITY_ID null? join miss?).
- **E. `expiry_date` empty on ALL rows** (วันที่หมดอายุ อ.10 column blank).
- **G. dest region/province empty for license `80/2569`** (rows 6–7: `dest_province_name`/`dest_area_name`
  blank) while `81/2569` resolves (กรุงเทพมหานคร / ภาคกลาง). The license back-join for dest doesn't always
  resolve → affects region/province filtering for those rows.
- (Harmless: `purchase_document` + `origin_*`/most `dest_*` address fields are move-license scaffold
  carry-overs; the move-a10 page has no address columns — ignore.)

## Routing
- **TASK-006 → REWORK** (owner Jason, via Sober): (1) **fix the duplicate rows** (dedupe the LICENSE_DTL
  join / correct its grain) — confirmed bug; (2) investigate the empty `transport_type_code_name`,
  `authority_group_no(_name)`, `expiry_date`, and the dest back-join miss for `80/2569` — decide per field
  whether it's a join/mapping bug or a genuine DB-data gap (raise a targeted DATA REQUEST if the latter).
- After the fix, re-run this same capture to confirm: dupes gone, buyer-group chart populated, transport
  type + expiry present (or documented as real data gaps). Then Porter closes REQ-005 → DELIVERED.
