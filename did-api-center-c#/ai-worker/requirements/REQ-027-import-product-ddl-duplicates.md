# REQ-027: DASHBOARD_IMPORT `search-filter-product` — duplicate `value`s and `"-"` / blank labels (DDL built from transaction lines, not the product master)

- Status: **READY_FOR_SA — FULLY UNBLOCKED (A + B).** All 5 data queries answered; the ✅✅ section at the BOTTOM is
  the authoritative one. Everything above it is the investigation trail, kept because it records *why* two earlier
  conclusions were wrong.
- Priority: **HIGH** — the dropdown is currently unusable: ~65 of ~160 entries are labelled `"-"`, several codes repeat
- Raised: 2026-08-17 — stakeholder capture of `GET /officer/dashboard-import/search-filter-product?quantity_unit_id=1`:
  *"สังเกตเห็นมั้ยว่า P-0695 มันซ้ำกัน และน่าจะมีอื่นๆ ด้วยที่ซ้ำกัน ช่วยดูให้หน่อยให้เข้าใจว่าตรงไหนเพราะอะไร"*

## Root cause — `DISTINCT` is on the **pair**, and the name is a per-line snapshot
`TTLicenseDtlRepository.GetImportProducts` (L344-364):
```sql
SELECT DISTINCT DTL.PRODUCT_CODE AS ProductCode, DTL.PRODUCT_NAME AS ProductName
FROM T_T_LICENSE L
INNER JOIN T_T_LICENSE_DTL DTL ON DTL.LICENSE_ID = L.ID
WHERE L.FORM_ID = 8 AND L.LICENSE_STATUS = 40 AND DTL.PRODUCT_CODE IS NOT NULL
  [AND DTL.QUANTITY_UNIT_ID = :UNIT_ID]
ORDER BY DTL.PRODUCT_NAME
```
`DISTINCT` de-duplicates the **(code, name) pair** — not the code. `T_T_LICENSE_DTL.PRODUCT_NAME` is **free text copied
onto each licence line at the time that licence was issued**, so one `PRODUCT_CODE` written N different ways across N
licences produces **N dropdown entries sharing the same `value`**.

### Every symptom in the capture is explained by this one cause
| code | entries | labels seen |
|---|---|---|
| `P-0695` | **3** | ".25 นิ้ว, .32 นิ้ว, .357…" · ".32 นิ้ว, .357 นิ้ว, .38…" · "9 มิลลิเมตร" |
| `P-0293` | **3** | "7.62 มิลลิเมตร" · **"7.62 มิลลิเมตร "** (trailing space ⇒ a different string to `DISTINCT`) · "7.62 มิลลิเมตร (.308 นิ้ว)" |
| `P-0774` | 2 | "5.56 มิลลิเมตร" · "5.56 มิลลิเมตร (.223 นิ้ว)" |
| `P-1271` | 2 | ".223 นิ้ว" · "ชนวนท้าย .223 นิ้ว" |
| `P-1051` / `P-1053` / `P-1054` | 2-3 each | `"-"` · a real name · `""` |
| `P-1069` / `P-1072` / `P-1074` | 2 each | "รุ่น CZ P-10 C cal.9 mm. Luger\t" (**trailing tab**) · `""` |

Two further consequences of the same root cause, worth naming explicitly:
- **~65 entries labelled `"-"`** — those licence lines literally store `"-"` as the product name.
- **`ORDER BY DTL.PRODUCT_NAME`** is why all the `"-"` rows sort to the top: the user's first screenful is unusable.

## This dashboard is the odd one out — the other menus already do it correctly
| dashboard | product/weapon DDL source | duplicates possible? |
|---|---|---|
| move-license / a10 / tracking | `VwProductRepo.GetByTypeGroupAndUnit(...)` = the **product master** (`DashboardMoveLicenseService` L194) | **No** — one row per product, canonical master name |
| **import** | `T_T_LICENSE_DTL` **transaction lines** | **Yes** — one entry per distinct spelling |

Same class of finding as REQ-018/REQ-021: import was built before the suite pattern settled and never re-aligned.

## ~~Fix direction (Porter's read)~~ — ⛔ SUPERSEDED TWICE. See the ✅✅ final section. Kept for the reasoning only.
Keep the cascade behaviour (only products that actually appear on อ.8 lines) but take the **label from the master**:
distinct `PRODUCT_CODE` from the อ.8 lines, `LEFT JOIN` the product master for the name, order by the master name.
That removes duplicate `value`s, replaces `"-"`/blank labels with canonical names, and matches the other three menus.
**Do not** simply `GROUP BY code` and `MAX(name)` off the transaction lines — that hides the duplication behind an
arbitrary pick of one of several spellings, and still shows `"-"` wherever that is the only stored value.

## 📋 DATA REQUEST — measure before choosing (the REQ-023 lesson)
```sql
-- 1) How widespread is the duplication, and which codes are worst?
SELECT DTL.PRODUCT_CODE, COUNT(DISTINCT DTL.PRODUCT_NAME) AS NAME_VARIANTS
FROM T_T_LICENSE L JOIN T_T_LICENSE_DTL DTL ON DTL.LICENSE_ID = L.ID
WHERE L.FORM_ID = 8 AND L.LICENSE_STATUS = 40 AND DTL.PRODUCT_CODE IS NOT NULL
GROUP BY DTL.PRODUCT_CODE HAVING COUNT(DISTINCT DTL.PRODUCT_NAME) > 1
ORDER BY NAME_VARIANTS DESC, DTL.PRODUCT_CODE;

-- 2) How many lines carry an unusable name ('-', blank, null)?
SELECT CASE WHEN DTL.PRODUCT_NAME IS NULL THEN 'NULL'
            WHEN TRIM(DTL.PRODUCT_NAME) = '-' THEN 'DASH'
            WHEN TRIM(DTL.PRODUCT_NAME) IS NULL THEN 'BLANK'
            ELSE 'HAS NAME' END AS KIND,
       COUNT(*) AS LINES, COUNT(DISTINCT DTL.PRODUCT_CODE) AS CODES
FROM T_T_LICENSE L JOIN T_T_LICENSE_DTL DTL ON DTL.LICENSE_ID = L.ID
WHERE L.FORM_ID = 8 AND L.LICENSE_STATUS = 40 AND DTL.PRODUCT_CODE IS NOT NULL
GROUP BY CASE WHEN DTL.PRODUCT_NAME IS NULL THEN 'NULL'
              WHEN TRIM(DTL.PRODUCT_NAME) = '-' THEN 'DASH'
              WHEN TRIM(DTL.PRODUCT_NAME) IS NULL THEN 'BLANK'
              ELSE 'HAS NAME' END;

-- 3) ⭐ THE DECIDING ONE — does the master actually have a usable name for these codes?
SELECT CASE WHEN P.PRODUCT_CODE IS NULL              THEN 'NOT IN MASTER'
            WHEN TRIM(P.PRODUCT_NAME) IS NULL        THEN 'MASTER NAME BLANK'
            WHEN TRIM(P.PRODUCT_NAME) = '-'          THEN 'MASTER NAME DASH'
            ELSE 'MASTER NAME OK' END AS MASTER_STATE,
       COUNT(*) AS CODES
FROM (SELECT DISTINCT DTL.PRODUCT_CODE
        FROM T_T_LICENSE L JOIN T_T_LICENSE_DTL DTL ON DTL.LICENSE_ID = L.ID
       WHERE L.FORM_ID = 8 AND L.LICENSE_STATUS = 40 AND DTL.PRODUCT_CODE IS NOT NULL) D
LEFT JOIN T_M_PRODUCT P ON P.PRODUCT_CODE = D.PRODUCT_CODE
GROUP BY CASE WHEN P.PRODUCT_CODE IS NULL              THEN 'NOT IN MASTER'
              WHEN TRIM(P.PRODUCT_NAME) IS NULL        THEN 'MASTER NAME BLANK'
              WHEN TRIM(P.PRODUCT_NAME) = '-'          THEN 'MASTER NAME DASH'
              ELSE 'MASTER NAME OK' END;
```
**Query 3 decides the whole approach and must run before any code:** if the master has good names, the master-join fix
is right and the dropdown becomes clean. **If the master is also blank/`"-"` for these codes, the fix does not work**
and this becomes a data question for the stakeholder, not a code change — exactly the kind of thing we assumed our way
through before the 70% verdict.
*(Q1/Q2 size the problem and give the capture something concrete to check; Q3 chooses the solution.)*

## Acceptance (to finalise after the data)
- [ ] Every `value` in `search-filter-product` is **unique**.
- [ ] No `"-"` or empty `label` (subject to Q3 — if the master lacks names, this becomes a data-fix request instead).
- [ ] The cascade still holds: `quantity_unit_id` filters the list, and only products present on อ.8 lines appear.
- [ ] Consistent with the other three dashboards' weapon DDL (master-sourced label).

~~@Sober — hold the SPEC until Q3 lands.~~ **Superseded — all data is in; see the ✅✅ final section.**

---
## ✅ 2026-08-17 — DATA RECEIVED. Q3 changed the answer: this is **TWO problems**, not one.

### Q1 — duplication is **bounded**, not systemic
**27 codes** have >1 name variant (6 with 3 variants: P-0194, P-0275, P-0277, P-0293, P-0695, P-1045; 21 with 2).
Out of 833 distinct codes ⇒ ~3%. The duplicate-`value` defect is real but small and **entirely fixable in code**.

### Q2 — unusable names on the transaction lines
| kind | lines | codes |
|---|---|---|
| HAS NAME | 1,771 | 526 |
| **DASH `-`** | **602** | **305** |
| NULL | 47 | 24 |
(The code counts overlap — a code can have a real name on one licence line and `"-"` on another. That overlap is what
makes the follow-up query below worth running.)

### Q3 ⭐ — **the master is NOT clean either.** This is the finding that matters.
| master state | codes |
|---|---|
| MASTER NAME OK | **527** |
| **MASTER NAME DASH `-`** | **280** |
| MASTER NAME BLANK | 7 |
| **NOT IN MASTER at all** | **19** |
| **total** | **833** |

⇒ **306 of 833 codes (37%) have no usable name in `T_M_PRODUCT`.** The master-join fix I proposed would remove the
duplicate `value`s **but would not remove the `"-"` labels** — because `"-"` is genuinely what the master stores.
**Porter's proposed fix was half right and is corrected here before anyone coded it** — which is exactly why Q3 ran
first. Had we specced on the earlier assumption, we would have shipped a "fix" and the dropdown would still be full
of `"-"`.

### The problem therefore splits cleanly
| # | problem | nature | who fixes |
|---|---|---|---|
| **A** | duplicate `value` (27 codes) | **code** — `DISTINCT` on the pair instead of the code | us, now |
| **B** | `"-"` / blank labels (≈306 codes) | **data** — the master itself has no name | **not fixable in code**; stakeholder's call |
| **C** | 19 codes on อ.8 lines that **do not exist in `T_M_PRODUCT`** | **data / referential gap** | flagged, stakeholder's call |

**A is unblocked and should proceed on its own** — it is a clear defect with a clear fix and no dependency on B/C.

## 📋 ONE follow-up query — decides B's best-available behaviour
For the 306 codes with no usable master name, does a usable name exist **anywhere** on the licence lines?
```sql
SELECT CASE WHEN P.PRODUCT_CODE IS NULL THEN 'NOT IN MASTER'
            WHEN TRIM(P.PRODUCT_NAME) IS NULL OR TRIM(P.PRODUCT_NAME) = '-' THEN 'MASTER UNUSABLE'
            ELSE 'MASTER OK' END                                            AS MASTER_STATE,
       CASE WHEN MAX(CASE WHEN TRIM(DTL.PRODUCT_NAME) IS NOT NULL
                           AND TRIM(DTL.PRODUCT_NAME) <> '-' THEN 1 ELSE 0 END) = 1
            THEN 'LINE HAS A USABLE NAME' ELSE 'NO USABLE NAME ANYWHERE' END AS LINE_STATE,
       COUNT(DISTINCT DTL.PRODUCT_CODE)                                      AS CODES
FROM T_T_LICENSE L
JOIN T_T_LICENSE_DTL DTL ON DTL.LICENSE_ID = L.ID
LEFT JOIN T_M_PRODUCT P  ON P.PRODUCT_CODE = DTL.PRODUCT_CODE
WHERE L.FORM_ID = 8 AND L.LICENSE_STATUS = 40 AND DTL.PRODUCT_CODE IS NOT NULL
GROUP BY DTL.PRODUCT_CODE,
         CASE WHEN P.PRODUCT_CODE IS NULL THEN 'NOT IN MASTER'
              WHEN TRIM(P.PRODUCT_NAME) IS NULL OR TRIM(P.PRODUCT_NAME) = '-' THEN 'MASTER UNUSABLE'
              ELSE 'MASTER OK' END;
```
*(SA: this groups per code then rolls up — if Oracle objects to the shape, wrap it as a subquery per code. The
question it answers is the point, not the syntax.)*

**Reading it:** the `MASTER UNUSABLE` + `LINE HAS A USABLE NAME` cell is the size of the group we could rescue by
falling back to a line name. If that cell is large, a documented fallback is worth it; if it is near zero, then
**no source has a name** and the only honest options are to show the product code or to fix the master data.

## Label-source options for B (stakeholder's decision — do not pick unilaterally)
1. **Master name, else the product code** (`P-0150` instead of `"-"`) — always shows something identifiable, never
   invents anything, purely a code change. **Porter's recommendation** pending the query.
2. **Master name, else a line name, else the code** — rescues more labels, but for the 27 multi-variant codes it means
   picking one spelling; acceptable only because the `value` is the code and the *label* is display-only.
3. **Master name as-is** — dropdown keeps ~306 `"-"` entries. Only sensible if the stakeholder plans to clean the
   master data instead.

@Sober — **A is GO** (dedupe by code; keep the `quantity_unit_id` cascade; keep only products present on อ.8 lines).
**Hold B's label source** until the follow-up query + stakeholder's choice. Do not fold B into A's task; A is provable
today and B is not.

---
## ✅ 2026-08-17 (2nd round) — **B IS SOLVABLE IN CODE.** `DESCRIPTION_TH` is populated for 287/287.

### Q5 (corrected roll-up — my first version wrongly grouped by PRODUCT_CODE, so every count was 1)
| master state | line state | codes |
|---|---|---|
| MASTER OK | LINE HAS NAME | 511 |
| MASTER OK | no line name | 16 |
| **MASTER UNUSABLE** | **LINE HAS NAME** | **4** |
| **MASTER UNUSABLE** | no line name | **283** |
| NOT IN MASTER | LINE HAS NAME | 11 |
| NOT IN MASTER | no line name | 8 |
| | **total** | **833** ✔ reconciles with Q3 |

⇒ **the line-name fallback rescues 4 codes out of 287. Dead end — drop option 2.**
(Porter's eyeball estimate of "~3" from the un-rolled-up list was right, but it was stated as unverified and the
roll-up is what settles it.)

### Q6 ⭐ — the alternative columns
For the **287** codes whose `PRODUCT_NAME` is unusable:
| column | populated |
|---|---|
| `SIZE_AND_MODEL` | **0** |
| **`DESCRIPTION_TH`** | **287 — 100%** |
| `DESCRIPTION_ENG` | 75 |

**Every single problem code has a Thai description.** B stops being a data problem.

### Q7 — the sample, which reframes the whole field
| code | `PRODUCT_NAME` | `DESCRIPTION_TH` |
|---|---|---|
| P-0150 | `-` | เชื้อปะทุรอประกอบแบบ DOWN LINE (ELEMENTED CAPS) |
| P-0560 | `-` | พลาสติกปิดปากลูกซอง |
| P-1053 | `-` | ชนวนท้ายเล็ก |
| P-1256 | `-` | น็อตยึดแกนคันโยก |
| P-0169 | ตัวต่อสายพลาสติก (PLASTIC CONNECTOR) | *(identical)* |
| **P-0293** | **7.62 มิลลิเมตร** | **ชนวนท้าย 7.62 มิลลิเมตร** ← more informative |
| **P-0695** | .32 นิ้ว, .357 นิ้ว, … (the long caliber list) | ชนวนท้าย ขนาด .32 นิ้ว, … |
| **P-1069** | รุ่น CZ P-10 C cal.9 mm. Luger`\t` | **แม็กกาซีน (2pcs of magazine)** ← the actual product |

**Key realisation: `PRODUCT_NAME` in this master is frequently not a name at all — it holds size/model text**
(identical to `SIZE_AND_MODEL` wherever both are filled), while **`DESCRIPTION_TH` is the real product description**.
That explains the whole original symptom: the dropdown was showing calibers and model strings instead of product names.

⇒ **`DESCRIPTION_TH` should be the primary label, not a fallback.** It fixes B, *and* improves the 511 codes that
already "worked" (P-0293 becomes "ชนวนท้าย 7.62 มิลลิเมตร" instead of a bare "7.62 มิลลิเมตร"), *and* collapses the
duplicate-spelling problem at source since it is one value per code.

### ⚠ Data hygiene the implementation must handle (seen in the sample, not assumed)
- `DESCRIPTION_TH` contains **`\r\n`** (P-0695) → normalise newlines to a space for a dropdown label.
- Trailing whitespace/tabs exist in the master too (P-0170 trailing space, P-1069 trailing `\t`) → `TRIM`.
- **19 codes have no master row at all** → they can never get a `DESCRIPTION_TH`; 11 of them have a usable line name,
  8 have nothing. Those 8 need a final fallback (the product code) — never a blank or `"-"`.

## Proposed label rule (Porter — SA to finalise after the last query)
```
label = TRIM(normalise(DESCRIPTION_TH))            -- primary
     ?? TRIM(PRODUCT_NAME)  if usable              -- master row exists but no description
     ?? a usable line name  if any                 -- covers 11 of the 19 not-in-master
     ?? PRODUCT_CODE                               -- last resort; never "-" and never blank
```
Combined with A (distinct on code), this yields a dropdown with **unique values and a meaningful label on every row**.

## 📋 Last query — confirm `DESCRIPTION_TH` coverage across ALL 833 codes, not just the 287
```sql
SELECT CASE WHEN P.PRODUCT_CODE IS NULL THEN 'NOT IN MASTER'
            WHEN TRIM(P.DESCRIPTION_TH) IS NOT NULL AND TRIM(P.DESCRIPTION_TH) <> '-' THEN 'DESC_TH OK'
            WHEN TRIM(P.PRODUCT_NAME)   IS NOT NULL AND TRIM(P.PRODUCT_NAME)   <> '-' THEN 'ONLY PRODUCT_NAME'
            ELSE 'NEITHER' END AS LABEL_SOURCE,
       COUNT(*) AS CODES
FROM (SELECT DISTINCT DTL.PRODUCT_CODE
        FROM T_T_LICENSE L JOIN T_T_LICENSE_DTL DTL ON DTL.LICENSE_ID = L.ID
       WHERE L.FORM_ID = 8 AND L.LICENSE_STATUS = 40 AND DTL.PRODUCT_CODE IS NOT NULL) D
LEFT JOIN T_M_PRODUCT P ON P.PRODUCT_CODE = D.PRODUCT_CODE
GROUP BY CASE WHEN P.PRODUCT_CODE IS NULL THEN 'NOT IN MASTER'
              WHEN TRIM(P.DESCRIPTION_TH) IS NOT NULL AND TRIM(P.DESCRIPTION_TH) <> '-' THEN 'DESC_TH OK'
              WHEN TRIM(P.PRODUCT_NAME)   IS NOT NULL AND TRIM(P.PRODUCT_NAME)   <> '-' THEN 'ONLY PRODUCT_NAME'
              ELSE 'NEITHER' END;
```
It sizes each rung of the fallback ladder before we build it — if `DESC_TH OK` is ~814 and `NEITHER` is 0, the rule
above is provably complete and the acceptance criterion "no blank/`-` label" becomes testable.

@Sober — **A is still GO and independent.** B now has a concrete, code-only solution; finalise it once the coverage
query lands. Note for the SPEC: this changes labels for **all** 833 codes, not just the broken ones — that is intended
and improves them, but it must be called out at capture so nobody reports it as a regression.

---
## ✅✅ 2026-08-17 (final) — coverage PROVEN. **REQ-027 fully unblocked, A + B both. @Sober GO.**

| label source | codes | cumulative |
|---|---|---|
| **`DESCRIPTION_TH`** | **807** | 807 / 833 = **96.9%** |
| `PRODUCT_NAME` (no description) | 7 | 814 |
| **NOT IN MASTER** | 19 | 833 |
| **`NEITHER`** | **0** ✅ | — |
Total 807 + 7 + 19 = **833** ✔ reconciles with every earlier count.

**`NEITHER = 0` is the proof that matters:** every code that has a master row has a usable label. The ladder below is
therefore **provably exhaustive** — no code can fall through to a blank or `"-"`.

### FINAL label rule (measured, not assumed — each rung has a known size)
| # | source | covers |
|---|---|---|
| 1 | `TRIM(normalise(DESCRIPTION_TH))` — collapse `\r\n`/tabs to a space | **807** |
| 2 | `TRIM(PRODUCT_NAME)` if usable | 7 |
| 3 | a usable line name (`T_T_LICENSE_DTL.PRODUCT_NAME`) | 11 of the 19 not-in-master |
| 4 | `PRODUCT_CODE` itself | the last 8 — never blank, never `"-"` |
Rung 3 is worth keeping **only here**: it was rejected as the *primary* fallback (it rescued 4/287) but it is the only
thing that can label a code with no master row at all, and 11 of 19 is most of them.

### The full solution
- **A (duplicate `value`s):** distinct on `PRODUCT_CODE`, not on the (code, name) pair. Fixes the 27 multi-spelling
  codes — and note the label rule makes this structural: one code now has exactly one label by construction.
- **B (`"-"`/blank labels):** the ladder above. **No data fix needed, no stakeholder data cleanup required.**
- **C (19 codes absent from `T_M_PRODUCT`):** still a referential gap worth reporting to the stakeholder, but rungs
  3-4 mean it no longer breaks the dropdown. **Report, don't block.**
- Keep the `quantity_unit_id` cascade and the "only products present on อ.8 lines" scoping — unchanged.
- Ordering: `ORDER BY` the **final label**, not `DTL.PRODUCT_NAME` (that is what floated the `"-"` rows to the top).

### ⚠ Call out at capture — this changes labels for ALL 833 codes, not just the broken ones
Intended and an improvement (e.g. `P-0293` becomes "ชนวนท้าย 7.62 มิลลิเมตร" instead of a bare "7.62 มิลลิเมตร";
`P-1069` becomes "แม็กกาซีน (2pcs of magazine)" instead of a model string). Must be stated up front so nobody reports
the improvement as a regression.

### Acceptance (now fully testable)
- [ ] Every `value` unique.
- [ ] **Zero** labels that are `"-"`, empty, or whitespace-only — provable, since `NEITHER = 0`.
- [ ] No `\r\n`/tab in any label.
- [ ] `quantity_unit_id` cascade unchanged; only อ.8-line products listed.
- [ ] List sorted by the displayed label.

@Sober — SPEC + TASK. Nothing outstanding: cause proven, coverage measured, every fallback rung sized.
