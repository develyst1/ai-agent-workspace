# TEST-004: อ.6 person soft-delete filter (REQ-010) + evidence-tick vs attachment (REQ-009)

- Source REQ: REQ-010 (persons items 3/4 exclude STATUS='D'), REQ-009 (evidence tick ⟺ attachment)
- Status: REQ-010 = TEST_PASSED · REQ-009 = NOT_TESTED (blocked, DATA REQUEST)
- Environments: uat-wired (read-only) — my own build of the current tree, `:33004`, `dev` profile
- Tested: 2026-08-21 by Tanya

## Method
- Built the current working tree (all accumulated REQ-009..028 code; compile exit 0), booted my own
  `:33004` with `dev` profile, read-only GET (no key) `/a6/db/38272` → 200 `application/pdf` (283,297 B).
  Rendered page 2 (persons + evidence) with PyMuPDF, inspected. Instance stopped; :33000 untouched.
  PII PNGs deleted after inspection (source PDF kept, project-docs/ gitignored).

## REQ-010 — persons items 3/4 exclude soft-deleted (STATUS='D')
| # | Case (AC) | Expected | Actual (38272, real) | Result |
|---|-----------|----------|----------------------|--------|
| 1 | items 3/4 list only active persons | only STATUS='A' rows 92567/92568/92569 (3 people) | item 3 = 2 persons (ผู้มีอำนาจลงนาม/มอบอำนาจ), item 4 = 1 person (ผู้รับมอบอำนาจ) = **3 active only**; the 10 deleted rows 92557–92566 do **not** appear | **PASS** |
| 2 | no regression on all-active requests | — | n/a this id | — |
- **REQ-010 verdict: TEST_PASSED.** The person query now excludes STATUS='D'; 38272 shows exactly the
  3 active people, no deleted/duplicate rows. Matches the stakeholder's expected active set.

## REQ-009 — evidence checkbox ⟺ the document actually has an attachment
| # | Case (AC) | Expected | Actual (38272, real) | Result |
|---|-----------|----------|----------------------|--------|
| 3 | item 1 unticked when doc row 46784 has no attachment | unticked | item 1 renders **TICKED**; every evidence checkbox (1–8 + sub-items) is ticked — **no** unticked item to observe | **NOT_TESTED** |
| 4 | a doc WITH attachment still ticks (no regression) | ticked | all items ticked (consistent with "has attachment"), but can't isolate | NOT_TESTED |
- **Why NOT_TESTED (not a pass, not a fail):** the AC-1 repro depends on the stakeholder having
  removed the attachment from `T_T_REQUEST_DOC` row 46784 on 2026-08-05. It is now **2026-08-21** —
  that temporary DB edit has almost certainly been reverted, so 46784 likely has an attachment again →
  a ticked item 1 would be *correct*, not a defect. I cannot confirm the tick reflects the real
  attachment state without reading `ATTACH_FILE_ID` (DB-only), and there is **no unticked evidence
  item** in 38272's current output to demonstrate the untick path. Reading the tick alone can't prove
  the rule either way → NOT_TESTED, per QA discipline (no pass on an unverifiable negative).

## Evidence
`../project-docs/REQ-009-010-evidence/a6-38272.pdf` (real, gitignored; PII). Page-2 render inspected
then deleted.

## Verdict
- **REQ-010 → TEST_PASSED** (soft-delete filter verified on real data).
- **REQ-009 → NOT_TESTED** — blocked on a data precondition; needs a DATA REQUEST (below).

## Questions / DATA REQUEST (for Porter → human; answer as `> answer: ...`)
- DR: To verify REQ-009's untick rule read-only I need either (a) the **current** `ATTACH_FILE_ID`
  of `T_T_REQUEST_DOC` row 46784 (request 38272) — so I can check item 1's tick against it — **or**
  (b) a requestId + evidence item that is known to currently have **no** attachment, so I can confirm
  it renders **unticked** (and one with an attachment renders ticked = no regression). Without one of
  these the untick behaviour can't be exercised on live data.
- Q: confirm the intended rule granularity (per-document-row `ATTACH_FILE_ID`, or per-checklist-item
  "any row has a file") — REQ-009 §Questions left this open for Porter.
