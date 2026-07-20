# DATA REQUEST 4 results + Porter analysis (REQ-005 rework), 2026-07-20

Stakeholder ran the 3 diagnostic queries. Findings resolve the two blank-column questions — in opposite
directions.

## 1. Buyer group (`by_buyer_group` chart is dead) — join key is WRONG (needs a new source)

- `SELECT COUNT(*), COUNT(BUYER_AUTHORITY_ID) FROM T_T_INFORM_MOVE_DTL` → **12886 / 12886 = 100% populated.**
  So `BUYER_AUTHORITY_ID` is always set on the movement detail.
- `... LEFT JOIN T_M_PRIMARY_BUYER_AUTHORITY a ON a.ID = d.BUYER_AUTHORITY_ID` → **`a.AUTHORITY_GROUP_NO`
  and `a.AUTHORITY_NAME` are NULL for every row** (IDs 77, 59, 65, 375 …). `BUYER_NAME` is present
  (e.g. "ศูนย์ฝึกอบรมตำรวจภูธรภาค 4", "สนามยิงปืนราชนาวีสงขลา").
- **Conclusion:** `T_T_INFORM_MOVE_DTL.BUYER_AUTHORITY_ID` does **NOT** reference
  `T_M_PRIMARY_BUYER_AUTHORITY.ID` — the assumed join (borrowed from move-license) is wrong for the
  movement flow. We have the buyer *name* but not the *group* (ทหาร/ตำรวจ/สมาคม/อื่นๆ). The buyer-group
  chart + `authority_group_no(_name)` column can't be resolved until the correct master is found.
- **→ Routed to Sober (SA):** identify from DATADIC/code which table `BUYER_AUTHORITY_ID` FKs to (a broader
  authority master, keyed by a non-`ID` column?) and whether it carries a group code — resolve from code,
  else raise a follow-up DATA REQUEST (5) with the exact probe. **This is a design gap, not a Porter guess.**

## 2. ประเภทการขนย้าย (`transport_type_code_name` blank in capture) — DATA EXISTS → it's a code fix

- `SELECT COUNT(*), COUNT(TRANSPORT_TYPE_CODE) FROM T_T_LICENSE_DTL WHERE LICENSE_ID IN
  (SELECT ID FROM T_T_LICENSE WHERE FORM_ID=10)` → **13362 / 9407 ≈ 70% populated.**
- **Conclusion:** `TRANSPORT_TYPE_CODE` is set for ~70% of อ.10 license lines — **NOT a genuine data gap.**
  The blank in the live capture was a **resolution bug**, which Jason's REWORK already targets (dedup via a
  **correlated scalar subquery** for `TRANSPORT_TYPE_CODE`, then resolve the name via `T_R_TRANSPORT_TYPE`).
  Keep the column; it should populate for most rows after the fix. (Rows on a license line without a code
  legitimately show blank — the captured `81/2569`/`80/2569` lines may be among the ~30%.)

## Net
- **#2 → no new data needed.** Confirms Jason's code fix path; column stays.
- **#1 → back to Sober.** The buyer-group join is wrong; Sober to find the real source (may need DATA
  REQUEST 5). The `by_buyer_group` chart stays "ไม่ระบุ" until then.
- Re-run the same live capture after Jason's fixes + the buyer-group source is settled.
