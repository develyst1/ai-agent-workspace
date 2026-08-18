# SPEC-028: `search-filter-product` — one row per `PRODUCT_CODE`, label from a measured fallback ladder

- Source: REQ-027 (HIGH) — cause proven, coverage measured, `NEITHER = 0`
- Status: ACTIVE

## Verified in code — REQ-027 is accurate, and the blast radius is BIGGER than it says
`TTLicenseDtlRepository.GetImportProducts` (L344-364) is exactly as quoted: `SELECT DISTINCT DTL.PRODUCT_CODE,
DTL.PRODUCT_NAME … ORDER BY DTL.PRODUCT_NAME`. `DISTINCT` is on the **pair**, so N spellings ⇒ N rows sharing one
`value`. Confirmed.

### ⚠ This one method serves **TWO** endpoints, not one
```
DashboardImportService.cs:57    → /officer/dashboard-import/search-filter-product
DashboardImportA8Service.cs:58  → /officer/dashboard-import-a8/search-filter-product
```
REQ-027 was raised from the **import** capture only. `dashboard-import-a8` has the identical defect and gets fixed by
the same change. This is good news (one fix, both menus) but it **must** be said out loud, because a8's dropdown will
change too and nobody captured it expecting that. Added to the capture list below.

## Master columns confirmed present in the DAL
`TMProductEntity` maps `PRODUCT_CODE` (L11), `PRODUCT_NAME` (L17), `SIZE_AND_MODEL` (L20), **`DESCRIPTION_TH` (L23)**.
The column REQ-027's whole solution rests on genuinely exists and is mapped — checked, not assumed.

## Supporting evidence REQ-027 didn't have: the suite already separates "name" from "label"
The other three dashboards' weapon DDL does:
```csharp
Label = !string.IsNullOrEmpty(p.ProductNameLabel) ? p.ProductNameLabel : p.ProductName.EmptyIfNull()
```
(`DashboardMoveLicenseService` L199) — `PRODUCT_NAME_LABEL` is a **distinct display column** on `VW_PRODUCT`
(`VwProductEntity` L79). So the codebase already encodes REQ-027's key realisation — that `PRODUCT_NAME` is not the
display name — and **import is the one menu that ignores it**. That is the same "built before the pattern settled"
shape as REQ-018/REQ-021, and it independently corroborates the `DESCRIPTION_TH` finding.

⚠ **What I am NOT claiming:** that `PRODUCT_NAME_LABEL == DESCRIPTION_TH`. `VW_PRODUCT`'s definition is not in the repo
and I will not infer a column's meaning from its name — that is precisely the REQ-023 mistake. The ladder below is
built on the **measured** `DESCRIPTION_TH` evidence, which is proven. See the non-blocking note at the end.

## The fix — pure SQL, zero C# change
Grain becomes **one row per `PRODUCT_CODE`** (fixes A structurally: one code cannot produce two rows), label resolved
by the measured ladder (fixes B), ordering on the final label (fixes the `"-"`-floats-to-the-top symptom).

```sql
SELECT PRODUCT_CODE AS ProductCode, LABEL AS ProductName
FROM (
  SELECT D.PRODUCT_CODE,
         COALESCE(
           NULLIF(TRIM(REPLACE(REPLACE(REPLACE(P.DESCRIPTION_TH, CHR(13), ''), CHR(10), ' '), CHR(9), ' ')), '-'),
           NULLIF(TRIM(REPLACE(REPLACE(REPLACE(P.PRODUCT_NAME,   CHR(13), ''), CHR(10), ' '), CHR(9), ' ')), '-'),
           D.LINE_NAME,
           D.PRODUCT_CODE
         ) AS LABEL
  FROM (
    SELECT DTL.PRODUCT_CODE,
           MAX(NULLIF(TRIM(REPLACE(REPLACE(REPLACE(DTL.PRODUCT_NAME, CHR(13), ''), CHR(10), ' '), CHR(9), ' ')), '-'))
             AS LINE_NAME
    FROM T_T_LICENSE L
    INNER JOIN T_T_LICENSE_DTL DTL ON DTL.LICENSE_ID = L.ID
    WHERE L.FORM_ID = :FORM_ID AND L.LICENSE_STATUS = :LICENSE_STATUS
      AND DTL.PRODUCT_CODE IS NOT NULL
      [AND DTL.QUANTITY_UNIT_ID = :UNIT_ID]      -- conditional, exactly as today
    GROUP BY DTL.PRODUCT_CODE
  ) D
  LEFT JOIN T_M_PRODUCT P ON P.PRODUCT_CODE = D.PRODUCT_CODE
)
ORDER BY LABEL
```

### Why each piece is the way it is
- **`REPLACE` before `TRIM`, not after.** Oracle's `TRIM` strips **spaces only** — it will not remove the trailing tab
  on P-1069 or the `\r\n` inside P-0695. Converting CR/LF/TAB to space *first*, then trimming, is what actually
  satisfies "no `\r\n`/tab in any label". `CHR(13)`→`''` and `CHR(10)`→`' '` so a `\r\n` pair collapses to **one**
  space, not two.
- **`NULLIF(…, '-')` + Oracle's empty-string-is-NULL.** `TRIM` of an all-whitespace value yields NULL, and `NULLIF`
  turns `'-'` into NULL, so `COALESCE` falls through on exactly the three unusable cases (NULL / blank / `-`) with no
  `CASE` ladder. One consistent definition of "usable" everywhere in the query — including rung 3, which uses the same
  expression inside `MAX()`.
- **Pre-aggregate the lines, then join the master** — the REQ-011/012 pattern (single materialise + hash join, no
  correlated subquery, no per-row nested loop). Also keeps the `QUANTITY_UNIT_ID` filter on the line grain where it
  belongs, so the cascade is unchanged.
- **`T_M_PRODUCT` (base table), not `VW_PRODUCT`** — consistent with REQ-012's direction of travel.
- **`MAX()` on rung 3 picks an arbitrary spelling.** Accepted deliberately: it applies to ≤11 codes that have no master
  row at all, and the `value` is the code — only the display text is arbitrary. REQ-027 rejected line-names as the
  *primary* fallback (rescued 4/287); this is the narrow case where they are the only source that exists.

### Expected coverage (from REQ-027's measured data — makes the acceptance testable)
| rung | source | codes |
|---|---|---|
| 1 | `DESCRIPTION_TH` | 807 |
| 2 | `PRODUCT_NAME` | 7 |
| 3 | line name | 11 |
| 4 | `PRODUCT_CODE` | 8 |
| | **total** | **833** — and `NEITHER = 0` ⇒ **no row can render blank or `"-"`** |

## No C# change is needed — and that is deliberate
`DashboardImportService` L60 already does `Label = p.ProductName.EmptyIfNull()`, and `ImportProductDdlResult` already
carries `ProductCode`/`ProductName`. The ladder makes `ProductName` a resolved label, so both services pick it up with
no edit. Smaller diff, and both endpoints stay in lockstep by construction. Only add a doc comment on
`ImportProductDdlResult.ProductName` recording that it is now a resolved label, not the raw line value.

## Must NOT change
- The **cascade** (`quantity_unit_id` filter) and the **scoping** (only products on อ.8 lines, `FORM_ID=8`,
  `LICENSE_STATUS=40`). Both preserved above.
- **The other three dashboards' weapon DDL** (move-license / a10 / tracking). Their labels are not broken and REQ-027
  does not ask. Same discipline as the tracking permit-type column — out of scope until asked.
- The file's existing parameter style (`=: FORM_ID` with the space) — it works today; do not "tidy" it in this change.

## Acceptance
- [ ] Every `value` unique in **both** `/dashboard-import/search-filter-product` and
      `/dashboard-import-a8/search-filter-product` (P-0695, P-0293, P-0774, P-1271, P-1051/3/4, P-1069/72/74 each once).
- [ ] **Zero** labels that are `"-"`, empty, or whitespace-only; no `\r\n` or tab in any label.
- [ ] `quantity_unit_id` still filters; only อ.8-line products appear; no-unit still returns all.
- [ ] Sorted by the displayed label (the `"-"` block no longer occupies the first screenful).
- [ ] Build 0 errors.

## ⚠ Capture framing — labels change for ALL 833 codes, not just the broken ones
REQ-027 flagged this and it is worth repeating in the SPEC: `P-0293` becomes "ชนวนท้าย 7.62 มิลลิเมตร", `P-1069`
becomes "แม็กกาซีน (2pcs of magazine)". These are improvements, but an officer who knows the old list will see mass
change. State it **before** the capture, not after — and note a8's menu changes as well.

## Non-blocking follow-up (do NOT hold this task for it)
If `VW_PRODUCT.PRODUCT_NAME_LABEL` already implements a label ladder, the other three dashboards may be solving this
same problem a different way, and a future cleanup could converge them. That is a question for the stakeholder
(the view's DDL is outside the repo), it is **cheap**, and it changes nothing about this fix. Raising it as a note, not
a blocker — REQ-027 is fully measured and proceeds today.

## Tasks
- **TASK-047** — the SQL rewrite.

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
