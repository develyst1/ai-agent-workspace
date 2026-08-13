# SPEC-013: อ.9 (a9) db preview seam — SCOPE ASSESSMENT (blocked on decision)

- Source: REQ-013
- Status: BLOCKED (scope decision + DATA REQUESTs — @Porter/human)

## Bottom line (answers REQ-013's Question)
**The a9 seam itself is trivial — but a9 has NO DB builder, so the real work is a full
A9 DB integration, which is a much bigger REQ than the a6 seam.** Do not treat this as
"mirror the a6 endpoint."

- Verified: `A9CheckListReportBuilder.createData()` → `buildMock(...)`. **No repository
  injection, no `buildFromDb`, no `createDataRaw`.** a9/a10 has been mock-only since the
  start (its history builder also delegates to the mock).
- The a6 seam (`previewA6Db`) worked because a6 already had `createDataRaw(long)` →
  `buildFromDb` (real DB, delivered across the a6 work). a9 has no such method.

## What "add /a9/db/{requestId}" actually requires
1. **Part A — build the A9 DB builder (the big part).** Give `A9CheckListReportBuilder`
   real queries: `createDataRaw(long)` + `buildFromDb(long)` populating the whole
   `A9CheckListReportData` from Oracle — mirroring the a6 builder but for the a9 form.
2. **Part B — the seam (trivial, ~10 lines).** Add `previewA9Db` to `PreviewController`
   at `/checklist/a9/db/{requestId}` calling `a9…createDataRaw(id)` → `exportPdfA9`,
   exactly like `previewA6Db`. Already dev-profile-gated by REQ-004 (`@Profile("dev")` +
   the `/api/v1/preview/**` gate) and no-key — nothing new for access/security.

Part B is 30 minutes; **Part A is the real cost.**

## Part A scope — reusable vs new/unknown
**Reuse a6 patterns directly (low risk):** applicant name/itemCount/objective (T_T_REQUEST,
COUNT T_T_REQUEST_DTL), lawReferences (T_T_REQUEST_LAW_REF), signatures (T_T_LICENSE_INFORM),
components (T_T_REQUEST_DTL + T_M_UNIT), persons items 3/4 (T_T_REQUEST_PER + docs 102/103,
with the STATUS<>'D' filter from REQ-010), item-7 duration (T_T_LICENSE.PERIOD_TEXT, REQ-005),
tick rule (getAttachFile, REQ-009), 11.2-safe list+firstOrNull conventions.

**New / needs Data Dictionary confirmation (DATA REQUESTs — the risk):**
- **A9 evidence master checklist** — a9 has **13 items** (item 12 has sub-items (1)–(9)),
  vs a6's 8. Need the `T_S_REQUEST_CHECKLIST` **GROUP_CODE** for a9 + the SEQ→item mapping
  (is it the same `ReqSpecial` group or a different one?). This is the backbone of a9 page 2–3.
- **`applicant.destroyLocation`** ("สถานที่ทำการกำจัดหรือทำลาย", a9 page 1) — no obvious column;
  needs a source.
- **item 5 factory-docs sub-structure** (doc/docsub for ร.ง.4/อ.2/อ.7) — master rows + fields.
- **item 12 (2) `person2`** (ผู้รับอาวุธ) — source table / PER_TYPE (a6 has no person2).
- (resolver already maps FORM_ID 9/10 → "A9", so routing is done.)

## Recommendation to Porter
Split REQ-013 into:
- **REQ-013a — A9 DB integration** (Part A; HIGH; needs the DATA REQUESTs above answered
  first — same investigate→spec→build pattern the a6 work followed). This is the large one.
- **REQ-013b — a9/db seam** (Part B; trivial; depends on REQ-013a). Or just fold Part B into
  013a's final step.

Until the human confirms they want the full A9 DB build (and answers the DATA REQUESTs),
I'm holding — writing an a9/db seam over the mock builder would return the same mock PDF for
every requestId (ignores the id), which fails REQ-013 AC#1/#3 ("real data", "same body as the
real download"). That would be worse than nothing (looks real, isn't).

## Tasks
- None yet — blocked on the scope decision. No BE work until Porter confirms + DATA REQUESTs land.

## Questions
- **@Porter:** confirm scope. a9 is mock-only → the a9/db seam requires the full A9 DB builder
  (Part A) first. Proceed with REQ-013a (big, with the DATA REQUESTs above), or defer? I will
  not spec BE work over the mock builder (it can't return real data).
  > answer (Porter, from human, 2026-08-05): **Proceed with the full A9 DB build.** Raised as
  > **REQ-014** (Part A, HIGH) — REQ-013 (the seam) stays BLOCKED as its final step. Agreed
  > with your call not to wrap the mock builder. I'm collecting your 4 DATA REQUESTs from the
  > human (a9 GROUP_CODE+SEQ map, destroyLocation, item-5 factory docs, item-12(2) person2);
  > please **author the exact SQL for #2/#3/#4** so I can hand the human copy-paste queries —
  > I've already given them the checklist-group query for #1.
  > Also: please confirm whether the **real download endpoint** for อ.9 currently returns mock
  > data too (resolver maps FORM_ID 9/10 → "A9" → the mock builder). If so that's a live
  > production-facing defect and I want it stated explicitly for the human.
