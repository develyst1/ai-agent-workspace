# DATA REQUEST results — REQ-005 (dashboard-move-a10), provided by stakeholder 2026-07-20

Stakeholder ran the Porter-supplied SQL against the real Oracle DB and returned the results below.
Raw material for Sober/Jason. **Team must not run SQL themselves — this is the human-provided source.**

## DATA REQUEST 1 (critical) — source of actual movement data

### Q1a — tables with a MOVE + (DATE|SEQ|QTY|QUANTITY) column
```
INF_T_INFORM_MOVE
REGISTRY$                     (Oracle internal — ignore)
RPT_INFORM_MOVE_DTL
RPT_SUM_INFORM_MOVE
T_T_INFORM_MOVE
T_T_INFORM_MOVE_DTL
V_INFORM_MOVE
V_INFORM_MOVE_DTL
V_INFORM_MOVE_DTL_LOT
V_RPT_LICENSE_OPT_MOVE
V_RPT_LICENSE_TRADER_MOVE
```
**Reading:** there is an **`INFORM_MOVE` family** ("การแจ้งขนย้าย" = movement/delivery notifications) —
header `T_T_INFORM_MOVE`, detail `T_T_INFORM_MOVE_DTL`, plus views (`V_INFORM_MOVE*`, incl. a
`..._DTL_LOT` lot-level view) and report tables/views (`RPT_*`, `V_RPT_LICENSE_*_MOVE`). This is the
most likely home of per-transaction move date / sequence / actual qty. **NOT** in `T_T_LICENSE_MOVE`.

### Q1b — columns of `T_T_LICENSE_MOVE` (confirms it's authorization-only)
`ID`, `LICENSE_ID`, `MOVE_REQUEST_TYPE` (NUMBER), `START_DATE`/`END_DATE` (permitted window),
`CONDITION1..5`, and full `ORIGIN_*` / `DEST_*` address blocks. **No** move-sequence, **no** moved-qty,
**no** actual-move-date column. → Confirms the gap; the movement data lives elsewhere (INFORM_MOVE).

### Still needed (follow-up — see Porter's 2nd ask)
Column lists of `T_T_INFORM_MOVE`, `T_T_INFORM_MOVE_DTL`, `V_INFORM_MOVE_DTL_LOT` to confirm they hold
move date + sequence + actual qty and link to the license (LICENSE_ID / อ.10) + weapon line. Then Sober
finalizes the source for TASK-006.

## DATA REQUEST 2 (small) — `T_R_TRANSPORT_TYPE` columns — RESOLVED

```
TRANSPORT_TYPE_CODE   NUMBER      ← the code (dropdown value)
TRANSPORT_TYPE_NAME   VARCHAR2    ← Thai name (dropdown label)
CREATE_DATE/CREATE_USER/UPDATE_DATE/UPDATE_USER  (audit — ignore)
```
→ BE adds the SPF entity: `TRANSPORT_TYPE_CODE` (code) + `TRANSPORT_TYPE_NAME` (label) for the
ประเภทการขนย้าย dropdown. **DATA REQUEST 2 fully answered — TASK-007 unblocked.**

---

## DATA REQUEST 1b (2026-07-20) — INFORM_MOVE column lists → **RESOLVES the movement source**

Stakeholder ran the follow-up SQL. The `INFORM_MOVE` family holds the actual per-transaction movement
data. Columns below (de-duplicated; the raw result listed each row twice). **This confirms the source
for TASK-006 — the movement data is NOT in the license tables, it's in INFORM_MOVE (การแจ้งขนย้าย).**

### `T_T_INFORM_MOVE` (header — one row per move notification)
`ID`, `TRADER_ID` (NUMBER), `INFORM_DATE` (DATE), `INFORM_MOVE_STATUS` (VARCHAR2),
`INFORM_REQUEST_TYPE` (NUMBER), `DOCUMENT_NO`, `DOCUMENT_DATE`, `REFERENCE_NO`, `IS_REPORT`,
`REPORT_DATE`, `RELEASE_DATE`, `MOVE_COMPLETE_DATE`, workflow user/date cols
(`REPORT_SENDING_*`, `CHECKING_*`, `CONFIRM_*`), `NOTE1`, `UPDATE_LAST_PROCESS`, audit (`CREATE_*`/`UPDATE_*`).

### `T_T_INFORM_MOVE_DTL` (detail — one row per moved item/transaction) ← the table's backbone
- `ID`, `INFORM_MOVE_ID` (NUMBER, FK → header), `ITEM_NO` (NUMBER)
- **`REF_LICENSE_NO`** (VARCHAR2) → เลขที่หนังสือ อ.10 (license link)
- `REF_LICENSE_ISSUE_DATE` (DATE) → วันที่อนุญาต อ.10
- `REF_LICENSE_EXPIRY_DATE` (DATE) → วันที่หมดอายุ อ.10
- `PRODUCT_CODE`, `PRODUCT_NAME` (→ อาวุธ), `PRODUCT_TYPE_NAME`, `PRODUCT_GROUP_NAME`, `SIZE_AND_MODEL`
- `BUYER_AUTHORITY_ID` (NUMBER → กลุ่ม/หน่วยผู้ซื้อ), `BUYER_NAME`, `BUYER_NAME_ABBR`
- `ALLOWED_QUANTITY` (NUMBER) → จำนวนที่ได้รับอนุญาต
- **`QUANTITY`** (NUMBER) → **จำนวนที่ขนย้าย (actual moved qty)**
- `QUANTITY_UNIT_ID` (NUMBER) → หน่วยนับ · `REMAINING_QUANTITY` (NUMBER)
- **`MOVE_DATE`** (DATE) → **วันที่ขนย้าย** · **`MOVE_SEQ`** (NUMBER) → **ครั้งที่ขนย้าย**
- `LOT_NO_DESC`, `NOTE1`, audit (`CREATE_*`/`UPDATE_*`)

### `V_INFORM_MOVE_DTL_LOT` (view — denormalized, lot-level; convenient read model)
Everything in DTL **plus** `LOT_NO`, `UNIT_NAME` (resolved หน่วยนับ text), `TOTAL_LOT_NO`,
`TOTAL_QUANTITY`, `CHECKING_NAME`, `INFORM_MOVE_DTL_ID`. Has `MOVE_DATE`/`MOVE_SEQ`/`QUANTITY`/
`ALLOWED_QUANTITY`/`REMAINING_QUANTITY`/`REF_LICENSE_NO`/`BUYER_NAME`/`PRODUCT_*` ready-joined.

### Candidate column → dashboard mapping (for Sober to confirm; not a design decision)
| Dashboard column | Source (candidate) |
|---|---|
| เลขที่หนังสือ อ.10 | `REF_LICENSE_NO` |
| วันที่อนุญาต / วันที่หมดอายุ อ.10 | `REF_LICENSE_ISSUE_DATE` / `REF_LICENSE_EXPIRY_DATE` |
| ผู้ประกอบการ | `T_T_INFORM_MOVE.TRADER_ID` (header) |
| กลุ่มหน่วยผู้ซื้อ / หน่วยผู้ซื้อ | `BUYER_AUTHORITY_ID` / `BUYER_NAME` |
| อาวุธ | `PRODUCT_NAME` (+ `PRODUCT_CODE`) |
| จำนวนที่ได้รับอนุญาต | `ALLOWED_QUANTITY` |
| **วันที่ขนย้าย** | **`MOVE_DATE`** |
| **ครั้งที่ขนย้าย** | **`MOVE_SEQ`** |
| **จำนวนที่ขนย้าย** | **`QUANTITY`** |
| หน่วยนับ | `QUANTITY_UNIT_ID` (id) / `UNIT_NAME` (view) |

### Open flags for Sober (design, not blocking)
- **อ.10 scoping:** the detail links via `REF_LICENSE_NO` (a license-number string). Sober to decide how
  to confirm a row is อ.10 (join back to `T_T_LICENSE` / the same way move-license did, or trust that
  INFORM_MOVE is inherently the อ.10 flow). Raise a follow-up only if not resolvable from code.
- **ประเภทการขออนุญาต / ประเภทการขนย้าย** for the *table rows*: header has `INFORM_REQUEST_TYPE`;
  `TRANSPORT_TYPE_CODE` (T_R_TRANSPORT_TYPE, TASK-007) isn't visibly on these tables — Sober to trace
  where the row's move-type comes from.
- **Grain:** DTL (per item/move) vs the `_LOT` view (per lot). Sober to pick what the table/charts count.

**→ DATA REQUEST 1 fully answered. TASK-006 unblocked (still gated only on TASK-005). SPEC-005's data
backbone changes from the license tables to the INFORM_MOVE family — Sober to revise the SPEC.**
