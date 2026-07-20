# DATA REQUEST 6 results + Porter analysis — transport-type root cause (REQ-005), 2026-07-20

Decisive. The transport-type blank is **NOT a join/correlation bug** — the **reference table
`T_R_TRANSPORT_TYPE` is EMPTY (0 rows)**, so there's no name to resolve any code to.

## Results
- **(a) `SELECT … FROM T_R_TRANSPORT_TYPE`** → **ไม่มี data (0 rows).** The table exists (columns confirmed
  in DATA REQ 2) but holds **no rows** in this environment.
- **(b) reproduce the correlated subquery** → `resolved_code` is populated on **every** row:
  `81/2569 / P-0048 → 0`, `80/2569 / P-0672 → 3`. So the `PRODUCT_CODE` correlation + `MAX` subquery
  **works correctly** — cause **(B) format mismatch is RULED OUT.**

## Root cause = cause (A), specifically an EMPTY ref table
The service resolves `TRANSPORT_TYPE_CODE` (0/3) fine, then looks up the Thai name in `T_R_TRANSPORT_TYPE`
— which has zero rows — so the name comes back blank for **every** row, on **every** license. This is a
**reference-DATA gap in this environment, not a code defect in the SQL/join.**

### Broader impact (important)
The **ประเภทการขนย้าย dropdown (TASK-007)** is fed from the same empty `T_R_TRANSPORT_TYPE` → that dropdown
is **also empty** (matches the move-license precedent where transport/move-type dropdowns returned empty).
So both the table column *and* the filter dropdown are affected by the same empty table.

## Decision for @Sober (this is a design call, not a code fix)
The join is correct; there is nothing for Jason to "fix" in the correlation. Two viable paths:
1. **Accept as a data gap** — the code is correct and will populate `transport_type_code_name` + the
   dropdown automatically once `T_R_TRANSPORT_TYPE` is seeded (prod/ops task, outside our code scope).
   Document it as a known environment-data gap; REQ-005 → DELIVERED with that note.
2. **Hardcode a fixed enum** — if ประเภทการขนย้าย is actually a fixed enum (like `MOVE_REQUEST_TYPE` 0/1,
   which Sober resolved from DATADIC), map codes `0/1/3` → Thai labels in code instead of the empty table.
   Needs the meaning of transport codes `0/1/3` (resolve from DATADIC; else a small stakeholder question).

Porter recommends Sober pick the path (check DATADIC for a transport-type enum first). If a stakeholder
question is needed (what do 0/1/3 mean, or "please populate T_R_TRANSPORT_TYPE"), route it back and Porter
will ask.

## Still open (minor)
Buyer-group code `0` (foreign buyer "…Sdn Bhd") label — stakeholder didn't answer this round. Non-blocking.

## Net
- Dedup ✅, dates ✅, buyer-group chart ✅ (all accepted).
- transport-type: **not a code bug** — empty `T_R_TRANSPORT_TYPE`. Sober to choose accept-as-data-gap vs
  hardcoded enum. REQ-005 held at SPEC_DONE pending that decision.

---

## STAKEHOLDER CORRECTION (2026-07-20) — the real source for ประเภทการขนย้าย
The stakeholder says `T_R_TRANSPORT_TYPE` is **not used**. The correct source is:

> **ประเภทการขนย้าย  =  `SELECT MOVE_REQUEST_TYPE FROM T_T_REQUEST_MOVE`**

So the whole `TRANSPORT_TYPE_CODE → T_R_TRANSPORT_TYPE` path (both the table column resolution AND the
dropdown in TASK-007) was the **wrong source**. Re-source to `T_T_REQUEST_MOVE.MOVE_REQUEST_TYPE`.

### For @Sober to design (trace from code/DATADIC; DATA REQUEST if needed)
1. **`T_T_REQUEST_MOVE` structure** + how it **joins** to the dashboard's movement rows
   (`T_T_INFORM_MOVE(_DTL)` / the license). What's the key linking a movement/inform-move row to its
   move-request row?
2. **Is `MOVE_REQUEST_TYPE` a code or a label?** If a code (NUMBER), what are its values → Thai labels?
   ⚠️ **Naming trap:** the column is again called `MOVE_REQUEST_TYPE` — the SAME name used for
   **ประเภทการขออนุญาต** (the 0/1 enum from `T_T_LICENSE_MOVE`/`INFORM_REQUEST_TYPE`, which already works).
   Confirm whether this table's `MOVE_REQUEST_TYPE` is the same 0/1 enum or a different set — so we don't
   mislabel the two "type" fields. (ประเภทการขออนุญาต stays as-is; only ประเภทการขนย้าย changes source.)
3. This re-source fixes both the table column `transport_type_code_name` and the ประเภทการขนย้าย dropdown.

### Now moot
- `T_R_TRANSPORT_TYPE` (TASK-007 entity) + its `TRANSPORT_TYPE_CODE` lookup are no longer the source for
  ประเภทการขนย้าย. Sober to decide whether the TASK-007 entity is dropped or repurposed.
- Buyer-group code `0` label question still open (minor, non-blocking).

---

## STAKEHOLDER FINAL — the name mapping for ประเภทการขนย้าย = T_S_COMMON_CODE / MoveRequestType (2026-07-20)
Stakeholder dumped `T_S_COMMON_CODE`. The name lookup for `MOVE_REQUEST_TYPE` is the common-code group
**`GROUP_CODE = 'MoveRequestType'`** (GROUP_NAME literally = "ประเภทการขนย้าย"):

| CODE_INT | CODE_NAME |
|---|---|
| 0 | ขนย้ายให้หน่วยงานตามมาตรา 7 |
| 1 | ขายและขนย้ายให้บุคคลอื่นนอกหน่วยงานตามมาตรา 7 |
| 2 | ขนย้ายเพื่อทำลาย |
| 3 | ขนย้ายเพื่อทดสอบ |
| 4 | ขนย้ายเพื่อจัดแสดง |
| 5 | ขนย้ายกลับโรงงาน |

Combined with the prior answer (**ประเภทการขนย้าย = `T_T_REQUEST_MOVE.MOVE_REQUEST_TYPE`**), the full wiring is:
`MOVE_REQUEST_TYPE (code)` → resolve name via `T_S_COMMON_CODE WHERE GROUP_CODE='MoveRequestType' AND CODE_INT = <code>`.
The captured codes now resolve: `81/2569`→0 = "ขนย้ายให้หน่วยงานตามมาตรา 7"; `80/2569`→3 = "ขนย้ายเพื่อทดสอบ" (& 1).

### For @Sober (all data now in hand — no more DATA REQUESTs)
1. **Wire ประเภทการขนย้าย** = `T_T_REQUEST_MOVE.MOVE_REQUEST_TYPE` resolved via the common-code table
   `T_S_COMMON_CODE` group `MoveRequestType`. The common-code lookup is almost certainly already in the DAL
   (standard shared table) — reuse it; likely **no new entity** (drop the `T_R_TRANSPORT_TYPE` entity from TASK-007).
2. **Join:** still trace how `T_T_REQUEST_MOVE` links to the movement/`INFORM_MOVE`/license rows (from code).
3. ⚠️ **Naming trap confirmed real:** this `MoveRequestType` group's 0/1 text ("...หน่วยงานตามมาตรา 7" /
   "ขาย...นอกหน่วยงาน...") is nearly identical to the hardcoded 0/1 map currently used for **ประเภทการขออนุญาต**.
   Sober: verify the two dashboard fields aren't actually the SAME source — i.e. confirm ประเภทการขออนุญาต's
   current source vs this `MoveRequestType`, so we don't mislabel/duplicate. (ประเภทการขออนุญาต works today; only
   change ประเภทการขนย้าย unless you find they're the same thing.)
4. Buyer-group code `0` label (foreign buyer) still a minor open item.

**No more stakeholder data needed. Sober wires it → Jason implements → re-run the same capture → close REQ-005.**
