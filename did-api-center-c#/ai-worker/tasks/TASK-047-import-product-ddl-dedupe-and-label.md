# TASK-047: `GetImportProducts` — one row per `PRODUCT_CODE` + label fallback ladder (SQL only)

- Source: SPEC-028 (REQ-027, HIGH)
- Status: **DONE ✅** (Sober-verified 2026-08-17 — SQL matches SPEC-028 exactly, conditional unit filter correctly
  placed inside the inner query, build 0 errors / 13 warnings unchanged. **Closed the one gap in the reasoning:** the
  `[Key]` attribute is DAL mapping, not a DB uniqueness constraint — but REQ-027's Q3 ran this same
  `DISTINCT codes LEFT JOIN T_M_PRODUCT` shape and summed to 527+280+7+19 = **833** = the distinct-code count, so the
  join is empirically 1:1 and cannot re-multiply)
- Assignee: Jason (BE)
- Depends on: none (build is green as of TASK-046)

## Heads-up before you start: this method feeds **two** dashboards
```
DashboardImportService.cs:57    → dashboard-import/search-filter-product
DashboardImportA8Service.cs:58  → dashboard-import-a8/search-filter-product
```
REQ-027 came from the **import** capture, but a8 shares the method and has the same defect. One change fixes both —
intended, not accidental. Don't split it, and don't add a second method.

## The problem in one line
`SELECT DISTINCT PRODUCT_CODE, PRODUCT_NAME` de-duplicates the **pair**, and `PRODUCT_NAME` is free text copied onto
each licence line — so one code written 3 ways yields 3 dropdown entries with the same `value` (P-0695, P-0293, …),
and ~602 lines store literally `"-"`.

## The change — `TTLicenseDtlRepository.GetImportProducts` (L344-364), SQL only
Replace the query body with:
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
    WHERE L.FORM_ID =: FORM_ID AND L.LICENSE_STATUS =: LICENSE_STATUS
      AND DTL.PRODUCT_CODE IS NOT NULL
      -- conditional unit filter goes here, exactly as today
    GROUP BY DTL.PRODUCT_CODE
  ) D
  LEFT JOIN T_M_PRODUCT P ON P.PRODUCT_CODE = D.PRODUCT_CODE
)
ORDER BY LABEL
```
Keep the existing `SpParameter` block, the existing `=: FORM_ID` spacing style, the conditional
`AND DTL.QUANTITY_UNIT_ID =: UNIT_ID` concatenation, and `QueryJoinAsync<ImportProductDdlResult>` — all unchanged.

### Two things that look fussy but are load-bearing
1. **`REPLACE` runs before `TRIM`.** Oracle's `TRIM` strips **spaces only**, so it will not touch P-1069's trailing tab
   or the `\r\n` inside P-0695. Convert CR/LF/TAB to space first, then trim. `CHR(13)`→`''` and `CHR(10)`→`' '` on
   purpose, so `\r\n` collapses to **one** space rather than two.
2. **`NULLIF(…, '-')` is doing the "unusable" test**, together with Oracle treating an all-whitespace `TRIM` result as
   NULL. That is why there is no `CASE` ladder: NULL / blank / `-` all become NULL and `COALESCE` falls through. Use the
   same expression inside `MAX()` for the line name so "usable" means one thing everywhere.

## No C# change
`DashboardImportService` L60 already does `Label = p.ProductName.EmptyIfNull()` and a8 does the same — they pick the
resolved label up for free, which also keeps the two endpoints in lockstep. **Only** addition: a doc comment on
`ImportProductDdlResult.ProductName` noting it now carries a **resolved label** (master description → master name →
line name → code), not the raw line value. Do not rename the property.

## Must NOT change
- The cascade (`quantity_unit_id`) or the scoping (`FORM_ID=8`, `LICENSE_STATUS=40`, อ.8 lines only).
- The other three dashboards' weapon DDL (move-license / a10 / tracking) — not broken, not in this REQ.
- The `=: FORM_ID` parameter spacing — it works; don't tidy it here.

## Definition of Done
- [x] `dotnet build` → 0 errors.
- [x] Paste the final SQL.
- [x] **Reason through the ladder on the four worked examples from REQ-027 and say which rung each lands on:**
      `P-0150` (`PRODUCT_NAME = '-'`, has `DESCRIPTION_TH`) · `P-0293` (both present) · a code with **no** master row ·
      a code with no master row **and** no usable line name. Static reasoning is fine — brownfield rule, no DB.
- [x] Confirm from the SQL that one `PRODUCT_CODE` can produce **exactly one** row, and say why.
- [x] Confirm no label can be `"-"`, blank, or contain `\r`/`\n`/tab — and name the mechanism, not just the intent.

## Implementation Notes
(Jason — 2026-08-17)

### Final SQL (`TTLicenseDtlRepository.GetImportProducts`)
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
    WHERE L.FORM_ID =: FORM_ID AND L.LICENSE_STATUS =: LICENSE_STATUS
      AND DTL.PRODUCT_CODE IS NOT NULL
      [ AND DTL.QUANTITY_UNIT_ID =: UNIT_ID ]      -- concatenated exactly as before, unchanged
    GROUP BY DTL.PRODUCT_CODE
  ) D
  LEFT JOIN T_M_PRODUCT P ON P.PRODUCT_CODE = D.PRODUCT_CODE
)
ORDER BY LABEL
```
Kept as-is: the `SpParameter` block, the `=: FORM_ID` spacing, the conditional unit-filter concatenation (now inside the
inner query, where the `WHERE` lives), and `QueryJoinAsync<ImportProductDdlResult>`.

### The four worked examples — which rung each lands on
1. **`P-0150`** (master `PRODUCT_NAME = '-'`, has `DESCRIPTION_TH`) → **rung 1, `DESCRIPTION_TH`**. The ladder tries
   `DESCRIPTION_TH` *first*, so the `'-'` in `PRODUCT_NAME` is never even reached. (Had the order been reversed,
   `NULLIF(…,'-')` would still have skipped it — but rung 1 settles it.)
2. **`P-0293`** (both present) → **rung 1, `DESCRIPTION_TH`**. `COALESCE` is first-non-NULL, so a usable rung 1 always
   wins; `PRODUCT_NAME` is only a fallback. This is also what collapses the old 3-entries-per-code duplication: the
   label no longer depends on which licence line you happened to hit.
3. **No master row at all** → the `LEFT JOIN` yields `P.DESCRIPTION_TH` and `P.PRODUCT_NAME` as **NULL**, so rungs 1–2
   are NULL → **rung 3, `D.LINE_NAME`** (the `MAX(...)` of the usable line names for that code).
4. **No master row *and* no usable line name** (every line is NULL/blank/`'-'`) → the `MAX()` of an all-NULL set is
   **NULL** in Oracle, so rung 3 is NULL too → **rung 4, `D.PRODUCT_CODE`**. The code itself is non-NULL by the
   `DTL.PRODUCT_CODE IS NOT NULL` predicate, so the ladder **cannot** fall through. This matches REQ-027's measured
   833 = 807 + 7 + 11 + 8 with nothing left over.

### Exactly one row per `PRODUCT_CODE` — the two mechanisms
- The inner query is `GROUP BY DTL.PRODUCT_CODE`, so it emits **one row per code** regardless of how many licence lines
  (or how many spellings) exist — this is what replaces `SELECT DISTINCT` over the *pair*.
- The `LEFT JOIN T_M_PRODUCT P ON P.PRODUCT_CODE = D.PRODUCT_CODE` cannot re-multiply it: I checked
  `TMProductEntity` — `PRODUCT_CODE` is the `[Key]` (`[Table("T_M_PRODUCT")]`, `[Key] [Column("PRODUCT_CODE")]`), so the
  join is one-to-at-most-one. One code in ⇒ exactly one row out.

### No label can be `"-"`, blank, or contain CR/LF/TAB — by mechanism
- **CR/LF/TAB:** every candidate is wrapped in `REPLACE(REPLACE(REPLACE(x, CHR(13),''), CHR(10),' '), CHR(9),' ')`
  *before* `TRIM`. That ordering is load-bearing: Oracle's `TRIM` strips **spaces only**, so a trailing tab (P-1069) or
  an embedded `\r\n` (P-0695) would survive a bare `TRIM`. `CHR(13)→''` + `CHR(10)→' '` also means `\r\n` collapses to
  **one** space, not two. Rung 4 is `PRODUCT_CODE`, which contains none of these.
- **`"-"`:** `NULLIF(…, '-')` turns an exactly-`-` value into NULL *after* trimming, so `" - "` is caught too, and
  `COALESCE` moves on. **Rung 3 uses the identical expression inside `MAX()`**, so "usable" means the same thing at every
  rung — no rung can smuggle a `'-'` through.
- **Blank:** in Oracle a `TRIM` result that is empty **is** NULL (empty string ≡ NULL), so all-whitespace values fail
  `COALESCE` for free — that is why the spec needs no `CASE` ladder.
- Residual, stated honestly: a label that is *internally* messy but non-blank (e.g. double spaces after collapsing) is
  still returned as-is — the task scopes the cleanup to CR/LF/TAB + trim + `'-'`, and I did not widen it.

### C# — one doc comment only, as instructed
No behavioural C# change. Added the doc comment on `ImportProductDdlResult.ProductName` recording that it now carries a
**resolved label** (master description → master name → line name → code), not the raw line value. Property **not**
renamed. Both services keep `Label = p.ProductName.EmptyIfNull()` untouched, so they stay in lockstep.

### Verification
- `dotnet build` (Center+SPF) → **Build succeeded, 0 Error(s)**.
- **One method, two consumers, no split:** `GetImportProducts` is defined once
  (`TTLicenseDtlRepository.cs:348`) and called from exactly `DashboardImportService.cs:57` and
  `DashboardImportA8Service.cs:58` — so this single change fixes both dropdowns, as intended.
- Untouched: the cascade (`quantity_unit_id`) and scoping (`FORM_ID=8`, `LICENSE_STATUS=40`, อ.8 lines only); the other
  three dashboards' weapon DDL; the `=: FORM_ID` spacing.
- Static-only per brownfield rule — the 807/7/11/8 split is REQ-027's measurement, not something I re-verified; what I
  verified here is that the SQL's ladder and grain make that outcome the necessary one.

## Expected shape of the result (REQ-027's measured coverage — sanity anchor)
833 codes total: 807 land on `DESCRIPTION_TH`, 7 on `PRODUCT_NAME`, 11 on a line name, 8 on the bare code. Nothing
falls through.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
