# TEST-013: DEF-26 — persons with PER_TYPE ≠ 1/2 silently dropped from item 3/4

- Source: DEF-26 (Porter, 2026-09-08)
- Status: **PASS** — all dropped people now render under item 3; item 4 clean; a6 = 0 affected (stated)
- Environment: own clean build (`[JasperPrecompiler] compiled 58/58`), `:33028`, dev, UAT-wired (DID_SPF), read-only
- Tested: 2026-09-08 by Tanya

## What DEF-26 was
Old code matched `PER_TYPE` exactly `=1` (item 3) / `=2` (item 4), so any **active** person whose `PER_TYPE`
was anything else (the query found **`PER_TYPE = 0`**, a real legacy code — none NULL) fell into **neither**
item and vanished silently. Fix (`A9CheckListReportBuilderBase:183-191`, mirrored in the independent
`A4CheckListReportBuilder:147` and `A14CheckListReportBuilder:154`): partition ONE fetch in Java —
`PER_TYPE == 2` → item 4, **everything else (1, 0, 3, NULL)** → item 3. Makes "every active person lands in
exactly one item" structural, and sidesteps the Oracle `PER_TYPE <> 2` = UNKNOWN-for-NULL trap.

**Counting is the check** (Porter): a dropped person leaves no gap, blank row, or error — the page looks
complete. `38336` rendered fine for weeks with 2 people missing. So verdict = the *count* of named person
rows, read from the text, not "looks right".

## Method
Real-DB seams `/{a9,a4,a15,a14}/db/{id}` (same builder + queries as `/download`). Person rows render as
`(n) <name> … สำเนาบัตรประจำตัวประชาชน เลขที่ … วันหมดอายุ …`; blank slots pad to `MIN_PERSON_SLOTS = 2`.
Counted **named** rows (real name present) vs blank pads, per item, via PyMuPDF text (fitz; digit+Thai both
extract). All 4 renders → **HTTP 200, 0 ORA**.

## Result
| Form / request | item 3 named (ผู้มีอำนาจลงนาม/มอบอำนาจ) | item 4 named (ผู้รับมอบอำนาจ) | expected (query) | verdict |
|----------------|------------------------------------------|-------------------------------|------------------|---------|
| **อ.9 38238** (richest) | **8** | 0 (2 blank pads) | 8 dropped | ✅ all 8 present |
| อ.4 38304 | 2 | 0 (2 blank pads) | 2 recovered | ✅ |
| อ.15 38305 | 2 | 0 (2 blank pads) | 2 recovered | ✅ |
| อ.14 38307 | 2 | 0 (2 blank pads) | 2 recovered | ✅ |
| อ.6 | — not rendered — | | **0 affected** | ✅ stated, see below |

- **No duplication into item 4:** on every request item 4 shows only its 2 blank padding slots (0 named), so
  no person appears in both items. On 38238 there were **0 `PER_TYPE = 2` people**, so item 4 is legitimately
  empty (nothing to verify "stays in item 4"; nothing leaked out of it).
- **อ.6:** the finder query reported **0 affected** for อ.6 — no อ.6 person has a non-1/2 `PER_TYPE`, so the old
  bug never dropped anyone there. Stated explicitly rather than skipped; no render needed.

## ⚠️ Observation to route up (data, not a DEF-26 defect)
On **38238**, the 8 item-3 rows are **8 real `T_T_REQUEST_PER` rows but only 5 distinct identities** — 3
name+ID-card pairs each appear **twice** (rows 1≡6, 2≡7, 4≡8: identical name AND identical ID-card number).
The DEF-26 fix is correct — it renders every active person row and drops none — so this is upstream
**duplicate person rows in the source data**, not a render fault. Flagging so the stakeholder can decide whether
the duplicate `T_T_REQUEST_PER` rows are a data-entry artifact worth cleaning. (Details/IDs not written here —
PII; available on request.)

## Verdict
**PASS.** DEF-26 fixed on real data: อ.9 38238 shows all **8** previously-dropped people under item 3 (was
silently 0 of them pre-fix), the 3 independent builders (a9-base, a4, a14) each recover 2 on their spot-check,
item 4 never over-collects, and อ.6 is confirmed 0-affected. One upstream data observation (duplicate PER rows
on 38238) routed up separately.
