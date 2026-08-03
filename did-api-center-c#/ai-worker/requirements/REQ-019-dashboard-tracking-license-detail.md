# REQ-019: DASHBOARD_TRACKING — per-license DETAIL (drill-down modal from the table row)

- Status: READY_FOR_SA
- Priority: HIGH (blocks REQ-017 acceptance — the FE table row is clickable and currently has no API to call)
- Raised: 2026-07-24 (stakeholder screenshot: "ในfrontend เขาตรง table เขากดดู detail แต่ละรายการได้นะ — license tracking")

## What the FE does (from stakeholder screenshot of the live modal)
Clicking a row in `รายการหนังสืออนุญาตขนย้ายฯ` opens **"รายละเอียดหนังสืออนุญาต อ.10"** for that license:

**Header block**
| FE label | value in screenshot | source |
|---|---|---|
| (title sub) + เลขที่หนังสือ อ.10 | `อ.10/2568/00142` | `T_T_LICENSE.LICENSE_NO` |
| ผู้ประกอบการ | บริษัท บุลเล็ท มาสเตอร์ จำกัด | `TRADER_NAME` |
| วันที่อนุญาต อ.10 | 05/11/2568 | `ISSUE_DATE` (TH, DATEONLY) |
| วันที่หมดอายุ อ.10 | 05/11/2569 | `EXPIRY_DATE` |
| **สถานะหนังสืออนุญาต** (badge) | **"ยังไม่หมดอายุ"** | ⚠ see QUESTION 1 — this is NOT the `LICENSE_STATUS=40` label |
| สถานะการขนย้าย (badge) | เสร็จสิ้นแล้ว | same move-status as /table (roll-up A, REQ-017/DR-16) |

**"อาวุธหรือวัตถุที่ขนย้าย" — a LIST, badge shows the line count (`1 รายการ`).**
Per product line (this is the whole point — /table is per-license, this is **per-product**):
| FE label | value | source |
|---|---|---|
| ชื่ออาวุธ | กระสุนปืน ลูกซอง | product name |
| ประเภท · รหัส | `กระสุน · P-0040` | product type/group name · `PRODUCT_CODE` |
| จำนวนขออนุญาต | 50,000 **นัด** | `T_T_LICENSE_DTL.QUANTITY` + unit name (`QUANTITY_UNIT_ID` → `T_M_UNIT`) |
| จำนวนขนย้ายจริง | 30,000 นัด | SUM `T_T_INFORM_MOVE_DTL.QUANTITY` for this license+product |
| ยอดคงเหลือ | 20,000 นัด | ขออนุญาต − ขนย้ายจริง |
| gauge % | **60%** — caption `ขนย้ายจริง / ขออนุญาต` | moved ÷ approved × 100 |

## Gap (verified in code)
- `DashboardTrackingController` has **no detail endpoint** (only search-filter ×5, /chart, /table).
- `DashboardTrackingTableRow` returns **no id** — keys are `key, license_no, issue_date, expiry_date,
  request_type, move_type, trader_name, buyer_group, buyer_unit, license_status, move_status`.
  `key` is just the row sequence. So the FE has nothing to identify the license with (other than
  `license_no` as a string).

## Requirement
1. **New endpoint** — per-license detail, officer-only, same shape/conventions as the rest of the dashboard suite:
   `GET /officer/dashboard-tracking/detail?license_id=<encrypted>` (Center convention: ids are AES-encrypted on the
   wire — `CryptoExtensions`; SA to confirm encrypted-id vs `license_no` as the key).
   Response = header fields above + `products[]` (name, type name, product code, unit name, approved qty,
   moved qty, remaining qty, percent) + line count. Reuse the same computation as the move-status roll-up so the
   badge in the modal can never disagree with the table.
2. **`/table` must expose the identifier** the detail endpoint takes (e.g. `license_id`, AES-encrypted), so the FE
   can drill down. Existing keys unchanged.
3. Data source = already-validated pre-aggs: approved from `T_T_LICENSE_DTL` (per LICENSE_ID + PRODUCT_CODE),
   moved from `T_T_INFORM_MOVE_DTL` (per REF_LICENSE_NO + PRODUCT_CODE) — the exact join proven in DR-16.
   Product/type/code/unit labels from the same masters the weapon cascade already uses. All DID_SPF.

## ⚠ QUESTIONS for the stakeholder (Porter will ask — do NOT guess)
**Q1 — "สถานะหนังสืออนุญาต" in the modal shows "ยังไม่หมดอายุ", not "ออกหนังสืออนุญาตแล้ว".**
We built `/table.license_status` as the `LICENSE_STATUS` code→label map ({40: "ออกหนังสืออนุญาตแล้ว"}, per DR-16).
The modal's badge is clearly **expiry-derived** (EXPIRY_DATE vs today → ยังไม่หมดอายุ / หมดอายุแล้ว).
→ Is `สถานะหนังสืออนุญาต` meant to be **expiry-based** everywhere (i.e. the /table column too), or are these two
different things that happen to share a label? This changes REQ-017's table column, so confirm before touching it.

**Q2 — do the other dashboards' tables have the same clickable detail?** (license-move / a10 / import / import-a8 /
license-book). If yes we should capture them now rather than discover them one at a time.

@Sober — please SPEC (endpoint shape, id strategy, reuse of the roll-up + masters) and write the TASK for Jason once
Q1 is answered. Porter is asking the stakeholder Q1/Q2 in parallel.

---
## ✅ Stakeholder answers 2026-07-24
- **Q1 — ANSWERED:** "หมดอายุมั้ย คือ วันหมดอายุ เกินหรือไม่เกินวันปัจจุบัน ไม่เกี่ยวกับสถานะ 40."
  ⇒ `สถานะหนังสืออนุญาต` (modal badge **and** the /table column **and** the filter dropdown) is **expiry-derived**:
  `EXPIRY_DATE >= today` → **ยังไม่หมดอายุ** ; `EXPIRY_DATE < today` → **หมดอายุ**. FE dropdown = ทั้งหมด/ยังไม่หมดอายุ/หมดอายุ.
  The correction to the existing table/filter is written up as **REQ-017 ADDENDUM 2** (4 touchpoints in
  `DashboardTrackingService`). The modal in this REQ must reuse that same derivation — one helper, two callers, so
  table and modal can never disagree.
- **Q2 — ANSWERED: "ไม่มี"** — no other dashboard has a row-detail modal. This drill-down is **tracking-only**;
  no capture sweep needed for license-move / a10 / import / import-a8 / license-book.

---
## ✅ 2026-07-24 — divergence check CLOSED: MISMATCH = 0 → ship as-is
Sober flagged a risk in his own SPEC-021 §B4: `/table` move-status sums `T_T_INFORM_MOVE_DTL` by `REF_LICENSE_NO`
(product-agnostic) while `/detail` sums the **product-matched** lines (`REF_LICENSE_NO + PRODUCT_CODE`) — if any moved
row carried a PRODUCT_CODE absent from that license's `T_T_LICENSE_DTL`, the table badge and the modal badge could
disagree (which REQ-019 forbids).

Stakeholder ran the decisive count over **all** status-40 อ.10s:
```sql
SELECT COUNT(*) AS MISMATCH FROM (
  SELECT (SELECT NVL(SUM(QUANTITY),0) FROM T_T_INFORM_MOVE_DTL WHERE REF_LICENSE_NO = L.LICENSE_NO) AS T_ACT,
         (SELECT NVL(SUM(I.QUANTITY),0) FROM T_T_INFORM_MOVE_DTL I
           WHERE I.REF_LICENSE_NO = L.LICENSE_NO
             AND EXISTS (SELECT 1 FROM T_T_LICENSE_DTL D
                          WHERE D.LICENSE_ID = L.ID AND D.PRODUCT_CODE = I.PRODUCT_CODE)) AS D_SUM
  FROM T_T_LICENSE L WHERE L.FORM_ID = 10 AND L.LICENSE_STATUS = 40
) WHERE T_ACT <> D_SUM;
```
⇒ **`MISMATCH = 0`** (not a sample — a full count; an earlier 10-row sample also matched). Every moved line's
PRODUCT_CODE exists on its license's DTL lines, so license-level ACT ≡ product-matched Σ on real data.
**Decision: keep the code as shipped** (no switch of the modal badge to license-level ACT). Both badges provably agree.
TASK-035's divergence item is closed. REQ-019 remains code-complete, pending only the stakeholder's UI capture.

---
## ⚠ 2026-07-24 — the modal screenshot's NUMBERS are mock (stakeholder confirmed)
`50,000 / 30,000 / 20,000 / 60%`, `อ.10/2568/00142`, "1 รายการ" and the badge values are **illustrative only** — the
reference FE is a mockup built ahead of this backend. **The field list, labels, grouping and the gauge's meaning
(`ขนย้ายจริง ÷ ขออนุญาต`) are the requirement; the figures are not.**
The underlying arithmetic is separately proven on real data (DR-16 roll-up A; `MISMATCH = 0`), so nothing here is in
doubt — but at capture time compare the modal against **our own `/table` row and SQL**, never against the mock.
