# SPEC-021: DASHBOARD_TRACKING — expiry-derived สถานะหนังสืออนุญาต (REQ-017 ADD-2) + per-license DETAIL (REQ-019)

- Source: REQ-019 (+ REQ-017 ADDENDUM 2). Stakeholder answered Q1/Q2 — no unknowns left.
- Status: ACTIVE

## Verified in code (current state)
- License-status touchpoints in `DashboardTrackingService`: **L42-44** `LICENSE_STATUS_MAP {40:"ออกหนังสืออนุญาตแล้ว"}`,
  **L110** `LicenseStatusDdl`, **L269** filter `InList(req.LicenseStatuses, r.LicenseStatus?.ToString())`, **L288** table
  col, helper **L309-312**. (= the 4 touchpoints + helper.)
- `DashboardTrackingTableRow` has `license_status` (L164) but **no `license_id`** → FE can't drill down. ✔ gap confirmed.
- `DashboardTrackingQueryResult` **already** has `LicenseId` (L11) + `ExpiryDate` (L14), and the backbone already selects
  `L.ID`/`L.EXPIRY_DATE` ⇒ **both changes are service/model-level; the tracking backbone SQL needs no change.**

## Part A — สถานะหนังสืออนุญาต becomes EXPIRY-derived (REQ-017 ADDENDUM 2)

Stakeholder: *"หมดอายุมั้ย คือ วันหมดอายุ เกินหรือไม่เกินวันปัจจุบัน ไม่เกี่ยวกับสถานะ 40"*.

- **`EXPIRY_DATE >= today` → "ยังไม่หมดอายุ" · `EXPIRY_DATE < today` → "หมดอายุ"** (date-only compare, `DateTime.Today`).
- **NULL `EXPIRY_DATE` → "ยังไม่หมดอายุ"** (SA assumption: a license with no expiry date cannot be past it). Stated
  explicitly; confirm at capture — if the stakeholder wants blank/"ไม่ระบุ" it's a one-line change.
- **One helper, two callers** (per REQ-019): `LicenseExpiryStatusLabel(DateTime? expiryDate)` used by BOTH the table
  column and the detail modal — they can never disagree.

### ⚠️ Do NOT touch the backbone filter
`WHERE L.FORM_ID=10 AND L.LICENSE_STATUS=40` **stays** — that's *which licenses the page lists* (DR-16, unchanged).
Only the **displayed status + its filter dropdown** become expiry-derived. These are two different concepts that
happened to share a label; conflating them would silently change the row set.

### 4 touchpoints
1. **L42-44** — `LICENSE_STATUS_MAP` is no longer the display source. Replace with the expiry helper (keep the map only
   if something else still needs the code→label; otherwise delete it).
2. **L110 `license_status_ddl`** — emit exactly two items: `ยังไม่หมดอายุ`, `หมดอายุ` (FE also offers "ทั้งหมด" = send nothing).
   **Value = the Thai label itself** (value == label). Rationale: this dashboard already does value==label for the
   province cascade, *and* if the FE hardcodes the dropdown from its own UI text it will send exactly those strings —
   so it's correct whether the FE uses our ddl or its own list.
3. **L269 filter** — match the request against the **derived** label, not `r.LicenseStatus` (the int). Empty ⇒ no filter.
4. **L288 table col** — `LicenseStatus = LicenseExpiryStatusLabel(r.ExpiryDate)`.

## Part B — per-license DETAIL endpoint (REQ-019)

### B1. `/table` exposes the identifier
Add `[JsonProperty("license_id")] string LicenseId` to `DashboardTrackingTableRow` = **`CryptoExtensions.Encrypt(r.LicenseId.ToString())`**
(Center convention: ids are AES-encrypted on the wire). Existing keys unchanged (additive).

### B2. `GET /officer/dashboard-tracking/detail?license_id=<encrypted>`
Controller decrypts → `int.Parse(CryptoExtensions.Decrypt(license_id))`, standard `[OfficerOnlyFilter]` + try/catch.

### B3. DAL `GetTrackingLicenseDetail(int licenseId)` — one query, header + lines
```sql
SELECT L.LICENSE_NO, L.TRADER_NAME, L.ISSUE_DATE, L.EXPIRY_DATE,          -- header (repeats per row)
       DTL.PRODUCT_CODE, DTL.PRODUCT_NAME,
       DTL.QUANTITY            AS ApprovedQty,
       U.UNIT_NAME,
       PTG.PRODUCT_TYPE_GROUP_NAME AS ProductTypeGroupName,
       NVL(MV.MOVED_QTY,0)     AS MovedQty
FROM T_T_LICENSE L
INNER JOIN T_T_LICENSE_DTL DTL ON DTL.LICENSE_ID = L.ID
LEFT  JOIN T_M_UNIT U ON U.ID = DTL.QUANTITY_UNIT_ID
LEFT  JOIN ( SELECT P.PRODUCT_CODE, MAX(PT.PRODUCT_TYPE_GROUP_CODE) AS PRODUCT_TYPE_GROUP_CODE
               FROM T_M_PRODUCT P
               LEFT JOIN T_M_PRODUCT_GROUP PG ON PG.PRODUCT_GROUP_CODE = P.PRODUCT_GROUP_CODE
               LEFT JOIN T_M_PRODUCT_TYPE  PT ON PT.PRODUCT_TYPE_CODE  = PG.PRODUCT_TYPE_CODE
              GROUP BY P.PRODUCT_CODE ) VWP ON VWP.PRODUCT_CODE = DTL.PRODUCT_CODE     -- slim chain (REQ-012)
LEFT  JOIN ( SELECT PRODUCT_TYPE_GROUP_CODE, MAX(PRODUCT_TYPE_GROUP_NAME) AS PRODUCT_TYPE_GROUP_NAME
               FROM T_M_PRODUCT_TYPE_GROUP GROUP BY PRODUCT_TYPE_GROUP_CODE ) PTG
        ON PTG.PRODUCT_TYPE_GROUP_CODE = VWP.PRODUCT_TYPE_GROUP_CODE
LEFT  JOIN ( SELECT IMD.REF_LICENSE_NO, IMD.PRODUCT_CODE, SUM(IMD.QUANTITY) AS MOVED_QTY
               FROM T_T_INFORM_MOVE_DTL IMD
              GROUP BY IMD.REF_LICENSE_NO, IMD.PRODUCT_CODE ) MV
        ON MV.REF_LICENSE_NO = L.LICENSE_NO AND MV.PRODUCT_CODE = DTL.PRODUCT_CODE     -- the DR-16-proven join
WHERE L.ID =: LICENSE_ID AND L.FORM_ID =: FORM_ID AND L.LICENSE_STATUS =: LICENSE_STATUS   -- 10 / 40, same backbone
ORDER BY DTL.ITEM_NO ASC
```
All pre-aggregated (one row per license line, no multiplication); all DID_SPF; single license ⇒ trivially fast.

### B4. Response `DashboardTrackingDetailResponse` (snake_case)
Header: `license_no`, `trader_name`, `issue_date`, `expiry_date` (TH DATEONLY), `license_status` (**Part A helper**),
`move_status` (**the same roll-up A + `MoveStatusLabel`** as `/table`), `product_count`.
`products[]`: `product_code`, `product_name`, `product_type_group_name`, `unit`, `approved_qty`, `moved_qty`,
`remaining_qty`, `percent`.

- **`move_status` MUST reuse the existing roll-up** (license totals ΣDTL.QUANTITY vs ΣMOVED, `≥` ⇒ เสร็จสิ้นแล้ว) so the
  modal badge can never disagree with the table. Compute from the same summed lines.
- **`remaining_qty = approved − moved`, `percent = moved/approved×100` (approved=0 ⇒ 0).**
  ⚠ **Over-moved is real** — DR-16 found 4 lines with `MOVED > APPROVED`. Decision: **report true values** (remaining may
  be negative, percent may exceed 100) — the backend states facts, consistent with the `≥` move-status rule. **FE note:
  the gauge should clamp visually at 100%.** If the stakeholder prefers clamped values instead, that's a one-line change
  — flag at capture.

## Q2 (answered): no other dashboard has a row-detail modal — tracking only. No capture sweep needed.

## Tasks
- **TASK-034** — Part A (expiry-derived status, 4 touchpoints; backbone untouched).
- **TASK-035** — Part B (`license_id` on /table + `/detail` endpoint + DAL + response).

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
