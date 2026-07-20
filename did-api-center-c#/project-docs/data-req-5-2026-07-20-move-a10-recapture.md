# REQ-005 re-run capture — Porter acceptance round 2 (2026-07-20)

Stakeholder re-ran `/table` + `/chart` (`move_date_range` 2026-06) after Jason's rework. **3 of the 4
fixes confirmed; 1 column (ประเภทการขนย้าย) still blank → one small disambiguation query (DATA REQUEST 5)
before final acceptance.**

## The 4 checks
1. **Duplicate rows — ✅ FIXED.** Now **6 rows** (was 7). License `80/2569` `move_seq 3` appears **once**
   (was key:6==key:7). The correlated-subquery fix removed the LICENSE_DTL multiplication.
2. **`expiry_date` — ✅ FIXED.** Populated on every row (`81/2569` → 31/12/2573, `80/2569` → 31/12/2569).
   Now sourced from the joined `T_T_LICENSE L`.
3. **Buyer group / `by_buyer_group` chart — ✅ FIXED (code).** `authority_group_no`/`_name` now resolve
   (`T_M_BUYER_AUTHORITY` swap): rows 1/3/4/5 = `1`/"ทหาร". Chart now = **"ทหาร" 30330** (=10000+330+15000+5000)
   + "ไม่ระบุ" 800, total 31130 — table↔chart consistent. The join works.
   - *Residual real-data quirks (NOT code bugs, don't block):* (a) row 2 (same unit "กรมทหารราบที่ 11…")
     has an empty `authority_group_no` → that specific buyer-authority record has no `AUTHORITY_GROUP_NO`
     in the master → falls into "ไม่ระบุ". (b) row 6 (`80/2569`, buyer "Hunter strike … Sdn Bhd") has
     `authority_group_no` = "**0**" but empty name — group code `0` isn't in the buyer-group label map
     (1=ทหาร/2=ตำรวจ/3=สมาคม/9=อื่นๆ). @Sober: is `0` a real group (ต่างประเทศ/อื่นๆ) that needs a label?
     Low priority.
4. **`transport_type_code_name` (ประเภทการขนย้าย) — ⚠️ STILL BLANK on all 6 rows.** Inconclusive: DATA REQ 4
   showed `TRANSPORT_TYPE_CODE` is ~70% populated across อ.10, so either (a) these two licenses (`81/2569`,
   `80/2569`) genuinely lack a code (legit blank), or (b) the correlated-subquery resolution still misses.
   **→ DATA REQUEST 5** disambiguates.

## DATA REQUEST 5 (small) — disambiguate the transport-type blank
Ask the stakeholder to run:
```sql
SELECT l.LICENSE_NO, dtl.PRODUCT_CODE, dtl.TRANSPORT_TYPE_CODE
FROM   T_T_LICENSE_DTL dtl
JOIN   T_T_LICENSE l ON l.ID = dtl.LICENSE_ID
WHERE  l.FORM_ID = 10 AND l.LICENSE_NO IN ('81/2569','80/2569');
```
- If `TRANSPORT_TYPE_CODE` is **NULL** for these lines → the blank is **real data** → accept as-is;
  REQ-005 → DELIVERED (transport type will show for other licenses that do have a code).
- If it's **populated** → the resolution is still a **bug** → back to Jason (1-line, the subquery/name
  lookup) → re-verify, then DELIVERED.

## Verdict
REQ-005 is one small query from acceptance. Dedup, dates, and the buyer-group chart are all fixed and
verified against live data. Holding at SPEC_DONE pending DATA REQUEST 5.

---

## DATA REQUEST 5 result (2026-07-20) → transport-type blank is a **CODE BUG** (data exists)

Stakeholder ran the disambiguation query:
```
81/2569 | P-0048 | TRANSPORT_TYPE_CODE = 0
80/2569 | P-0672 | TRANSPORT_TYPE_CODE = 3
80/2569 | P-0672 | TRANSPORT_TYPE_CODE = 1
```
**The captured licenses DO have transport-type codes (0, 3, 1)** — so the blank `transport_type_code_name`
in the capture is **NOT missing data; it's a resolution bug.** Acceptance check #4 FAILS as a bug.

### Diagnostic for BE (two clues)
1. **`80/2569` + `P-0672` has TWO `T_T_LICENSE_DTL` lines** (codes 3 **and** 1) for the same
   (LICENSE_ID, PRODUCT_CODE). The dedup fix pulls `TRANSPORT_TYPE_CODE` via a **correlated scalar
   subquery keyed on LICENSE_ID+PRODUCT_CODE** — that correlation is **not unique here** (2 rows) → the
   scalar subquery can't pick one and yields NULL/blank (and, for a non-zero-qty case, would be
   ambiguous). Needs a deterministic pick (e.g. by ITEM_NO / the matching move line) or a proper join grain.
2. **`81/2569` + `P-0048` is a single line with code `0` and STILL blank** → so even the unambiguous case
   doesn't resolve. Either the subquery returns null for another reason (wrong correlation column), or
   **code `0` has no row in `T_R_TRANSPORT_TYPE`** (name lookup → null). BE/SA to check what codes
   `T_R_TRANSPORT_TYPE` actually contains (may need a tiny follow-up: `SELECT TRANSPORT_TYPE_CODE,
   TRANSPORT_TYPE_NAME FROM T_R_TRANSPORT_TYPE;`).

### Routing
**TASK-006 → REWORK (transport-type resolution), @Jason via @Sober.** Fix the correlated-subquery grain so
it deterministically resolves `TRANSPORT_TYPE_CODE` per row + resolves the name (confirm code `0` exists in
`T_R_TRANSPORT_TYPE`). Then re-run the same capture — expect `transport_type_code_name` populated. The
other 3 defects stay fixed. **REQ-005 held at SPEC_DONE until this lands.**
