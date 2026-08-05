# TEST-001: อ.6 (a6) preview endpoint — no-auth mock preview

- Source REQ: REQ-002
- Status: TEST_PASSED
- Environments: local (own build from current working tree, `:33001`)
- Tested: 2026-08-05 by Tanya

## Scope
Verifies REQ-002's three Acceptance Criteria for the restored no-auth a6 preview:
200 valid อ.6 PDF with no auth, complete อ.6 layout, and behavior parity with the
existing a9 preview. Covers happy path, disposition handling (edge), default-param
(edge), and a9 parity (regression). **Does NOT** cover real-data correctness by
requestId (that is REQ-001) nor any a6 data-mapping defects (out of scope per REQ-002).

## Environment / method
- Built the **current working tree** (Jason's change still uncommitted: `M PreviewController.java`,
  new `A6CheckListPreviewBuilder.java`) — `./mvnw -o -DskipTests compile` → exit 0.
- Booted my **own** instance on `:33001` (a pre-existing instance holds `:33000`; I did
  not rely on it). `Started ... in 6.03s`, context-path `/document-service`.
- All calls **read-only**, **no `X-API-KEY`, no bearer**. Preview uses mock data — no DB write.
- Instance stopped after testing; pre-existing `:33000` left untouched.
- Base: `http://localhost:33001/document-service/api/v1/preview/checklist`

## Cases
| # | Case (from AC) | Type | Steps | Expected | Actual | Result |
|---|----------------|------|-------|----------|--------|--------|
| 1 | AC-1: a6 preview, no auth | happy | `curl /a6?disposition=inline` (no auth) | 200, `application/pdf`, valid PDF | HTTP 200, `application/pdf`, 272,739 B, `%PDF-1.5`…`%%EOF`, `Content-Disposition: inline; filename=a6-preview.pdf` | PASS |
| 2 | AC-2: complete อ.6 layout | happy | extract text from case-1 PDF | all sections/fields present, ~3 pages | 3 pages; front items 1–8 (ชื่อผู้ขอ, ประเภท, ส่วนประกอบ, จำนวน, หน่วยงาน, วัตถุประสงค์, ระยะเวลา, เอกสาร) + legal refs (พ.ร.บ. 2550 ม.33 ฯ); back checklist items 1–8 + 4 signature blocks; annex table (บัญชีรายการ) 9 rows | PASS |
| 3 | AC-3: a9 parity, no auth | regression | `curl /a9?disposition=inline` (no auth) | 200, `application/pdf` | HTTP 200, `application/pdf`, 468,814 B, 4 pages, `filename=a9-preview.pdf` — same response shape as a6 | PASS |
| 4 | disposition=attachment | edge | `curl /a6?disposition=attachment` | 200 pdf, `Content-Disposition: attachment` | HTTP 200, `application/pdf`, `Content-Disposition: attachment; filename=a6-preview.pdf` | PASS |
| 5 | default disposition (no param) | edge | `curl /a6` | 200 pdf, defaults to inline | HTTP 200, `application/pdf`, `Content-Disposition: inline` | PASS |
| 6 | no-auth is genuinely required | negative-ish | all calls above sent **no** X-API-KEY/bearer | not 401/403 | all 200 — endpoint is permitAll as designed (parity with a9) | PASS |

## Evidence
`../project-docs/REQ-002-evidence/`
- `a6-preview-inline.pdf` (272,739 B, 3 pages) — primary AC-1/AC-2 artifact
- `a6-preview-attach.pdf`, `a6-preview-default.pdf` — disposition variants (case 4/5)
- `a9-preview-inline.pdf` (468,814 B, 4 pages) — parity baseline (case 3)
- `a6-preview-inline.txt` — extracted text used to confirm the complete layout (AC-2)
- `*.headers` — raw HTTP response headers for each call
Note: the three a6 variants share identical Content-Length (272,739) but differ by md5
(Jasper embeds a per-render creation timestamp) — expected, not a defect.

## Defects
None blocking REQ-002.

## Verdict
`TEST_PASSED` — All three REQ-002 AC verified on a local, no-auth, read-only run against
my own build of the current working tree. The a6 preview returns a 200 `application/pdf`
with the complete อ.6 layout (3 pages) and no auth, matching a9's behavior. This
establishes the correctness baseline REQ-001 AC#2/#3 will compare against.

## Notes for Porter (FYI — not REQ-002 defects)
1. Item 7 "ระยะเวลาการอนุญาต" prints a **hardcoded "180 วัน"** in the mock preview. This
   is expected mock filler for a layout baseline. It is unrelated to — but a reminder of —
   Sober's **D3** lead in SPEC-001 (real path uses `EMPLOYER.TOTAL_DAYS + " วัน"` while Q2
   says the true source is `T_T_LICENSE.PERIOD_TEXT`). D3 is a REQ-001 concern, to be
   confirmed against real requestId data — not something to fix in the preview.
2. Mock uses placeholder filler (`sss` / `กกก` / `x`) in several fields — expected for a
   sample baseline; the point of REQ-002 is the *layout*, which is complete.
3. Visual fidelity (fonts/Thai shaping) was checked via PDF structure + text extraction, not
   a human eyeball. The saved PDFs are in project-docs for a visual spot-check if you want one.

## Questions
(For Porter; he answers as `> answer: ...`)
- None. REQ-002 AC were unambiguous and all verifiable read-only on local.
