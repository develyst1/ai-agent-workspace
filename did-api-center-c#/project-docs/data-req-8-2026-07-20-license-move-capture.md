# License Move live capture — Porter acceptance (REQ-006 + REQ-007), 2026-07-20

Stakeholder captured `dashboard-move-license` `/table`+`/chart` (issue_date_range 2026). Verdict: the CORE
(move_qty attach) + dates + type columns PASS; **buyer-group is empty on every row → 1 targeted rework.**

## PASS
1. **`move_qty` attach ✅ VERIFIED CORRECT.** Row 1 `81/2569` `P-0048`: `quantity`(approved)=150430,
   **`move_qty`=31230**. Cross-checks the A10 capture exactly: sum of that license+product's INFORM_MOVE
   deliveries = 10000+800+330+15000+5000+100 = **31230**. Undelivered lines = `move_qty` 0 (LEFT-join works).
   The "plan vs actual" is live.
2. **Dates (REQ-007) ✅.** `issue_date`="24/03/2569"/"04/03/2569"/"06/01/2569" — single, formatted; no
   `issue_date_formatted`. `expiry_date` formatted.
3. **col5 ประเภทการขออนุญาต ✅** = `move_request_type_name` = "คำขออนุญาตขนย้ายวัตถุหรืออาวุธฯ (อ.9)"
   (common-code `RequestType` name, as chosen). **col6 ประเภทการขนย้าย ✅** = "ขนย้ายให้หน่วยงานตามมาตรา 7"
   (MoveRequestType). Distinct.
4. `purchase_document` = "ไม่ระบุ" (parked, expected). by-trader chart ✅ (เนแรค 152030, ณธรรศชาตรี 16).

## ❌ FAIL — buyer group empty on ALL rows
- Every row: `authority_group_no`=""`, `authority_group_no_name`=""`, `authority_name`="-"`.
- Chart `line_chart_data` (แยกตามกลุ่มหน่วยผู้ซื้อ) = one bucket **"ไม่ระบุ" 152046** → dead.
- Note: the buyer org IS present as the **destination** (`dest_place_name` = "กรมทหารราบที่ 11…", "Hunter
  strike…", …) — so License Move represents the buyer as the license **destination**, NOT via a
  `BUYER_AUTHORITY_ID` like A10. The A10-style `T_M_BUYER_AUTHORITY` join doesn't apply on the license side →
  group unresolved.
- **@Sober:** trace where the license-side buyer **authority + group** comes from (a `BUYER_AUTHORITY_ID` on
  the license/request? or match the destination org to `T_M_BUYER_AUTHORITY`? or pull the group from the
  attached INFORM_MOVE delivery?). This is the "license-side buyer FK misses" case flagged pre-capture. If it
  needs DB facts, raise a DATA REQUEST via @Porter.

## Minor flags (non-blocking)
- Rows 2 & 3 = same `80/2569`/`P-0672` with different approved `quantity` (100 / 500) → 2 license lines for
  one product. `move_qty` matches by license+product, so if this product HAD deliveries both rows would show
  the same sum (double-count). Not triggered here (both 0). Sober note for the attach grain.

## Verdict
REQ-006 core (move_qty) + REQ-007 (dates) verified. **Held at SPEC_DONE for the buyer-group fix.** After the
fix, re-capture the buyer-group columns/chart only.

---

## Buyer-group RE-CAPTURE (2026-07-20) — FIX WORKS; only the code-`0` label is raw
After the `T_T_REQUEST_MOVE.BUYER_AUTHORITY_ID` re-source:
- **Buyer group now RESOLVES ✅** — was empty on all rows, now populated:
  - `81/2569` → `authority_group_no`="1", `authority_group_no_name`="ทหาร", `authority_name`="กรมทหารราบที่ 11…" ✅
  - `24/2569` → "9" / "อื่นๆ" / "คลังเก็บอาวุธปืน…" ✅
  - `authority_name` now shows the real buyer org (no more "-").
- **by-buyer-group chart now SPLITS ✅**: ทหาร 150430 + "0" 1600 + อื่นๆ 16 = 152046 (math checks; measure =
  approved qty, correct for License Move).
- ⚠️ **Only blemish — group code `0` displays literally "0"** (rows: Hunter strike [foreign] + เอ็น โปรเซส
  [Thai company]; 1600 นัด). The buyer-group map (1=ทหาร/2=ตำรวจ/3=สมาคม/9=อื่นๆ) has **no entry for `0`**, so
  `authority_group_no_name`="0" and the chart bucket is named "0". Same long-standing minor code-`0` item —
  now visible on License Move. Needs the stakeholder to say what `0` should display → 1-line map add (applies
  to a10 + license-move).

**Verdict:** REQ-006 functionally complete (move_qty ✅ dates ✅ col5/col6 ✅ buyer-group resolves + chart ✅).
Final polish = the code-`0` label. Held for that one-word decision.
