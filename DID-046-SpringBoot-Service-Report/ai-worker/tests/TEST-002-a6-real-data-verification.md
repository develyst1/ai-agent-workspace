# TEST-002: อ.6 (a6) real-data verification via /a6/db seam

- Source REQ: REQ-001 (AC#2/#3)
- Status: TEST_FAILED  ← DEF-1 (item-7 source). Sample (3/34) closed per Porter; visual leg done via PyMuPDF (REQ-007)
- Environments: uat-wired (read-only) — `http://localhost:33000/document-service`
- Tested: 2026-08-05 by Tanya

## Scope
Per Porter's REQ-001 routing + SPEC-003 recipe: generate the real อ.6 PDF for the
sample ids via the dev seam `GET /api/v1/preview/checklist/a6/db/{plainId}` (raw
plain id, no auth, read-only) on the **UAT-wired** :33000 instance, compare against
the REQ-002 mock baseline (TEST-001), and check SPEC-001 defect leads D1–D5.

**This round covers only 3 of the 34 ids** (38240, 38272, 38273) — the human chose
a small sample first to limit real-PII exposure. The remaining 31 ids and the
full defect sweep are pending authorization. **No writes** were made (GET-only,
report generation); no test data created.

## Cases
| # | Case (from AC / lead) | Type | Steps | Expected | Actual (3-id sample) | Result |
|---|-----------------------|------|-------|----------|----------------------|--------|
| 1 | Seam reachable, no key, read-only (REQ-003) | happy | GET `/a6/db/{id}` no header ×3 | 200 `application/pdf` | 38240/38272/38273 → all HTTP 200 `application/pdf` (226K/488K/206K bytes, filename `a6-{id}.pdf`) | PASS |
| 2 | AC#2 — real อ.6 PDF generated & valid | happy | inspect bytes/pages | valid multi-page อ.6 PDF, real data | all `%PDF`…, 4–5 pages, varying real content | PASS |
| 3 | AC#2 — front items 1–8 populate from DB | happy | extract text | items 1–8 present & filled | items 1 (ชื่อผู้ขอ), 2 (ประเภท), 4 (จำนวน N รายการ), 5 (หน่วยงาน), 6 (วัตถุประสงค์), 7, 8 all populated with real values | PASS |
| 4 | AC#2 — annex table (บัญชีรายการ) rows | happy | count component rows | rows match item-4 count | 38272: item-4 "9 รายการ" ↔ 9 `P-xxxx` annex rows | PASS |
| 5 | **D3 — item 7 ระยะเวลาการอนุญาต source** | **defect** | read printed item-7 value | should be `T_T_LICENSE.PERIOD_TEXT` (Q2, human-confirmed) | prints **"111 วัน" / "90 วัน" / "350 วัน"** = `<TOTAL_DAYS> + " วัน"` pattern (the current-code source), NOT PERIOD_TEXT | **FAIL** |
| 6 | D4 — signature 4-cell quadrant order | lead | **visual render** (PyMuPDF, mock + real 38272) | 4 signers in clean 2×2 row-major cells | mock: TL=ตั้งเรื่อง/ประจำแผนก, TR=ผอ, BL=หน, BR=จก (exact SPEC-001 order ✓); real 38272: 4 real signers fill a clean 2×2 grid, no overlap/blank/misplacement | PASS (no rendering defect) |
| 7 | D1 — person expiry vs id-card doc | lead | compare printed expiry to `T_T_REQUEST_DOC.EXPIRY_DATE` | must match | printed expiries visible, but the doc-table truth is **DB-only** → can't cross-check read-only from PDF | BLOCKED (DB) |
| 8 | D5 — "checked" tick rule | lead | visual + tick ↔ `ATTACH_FILE_ID>0` | tick iff attachment | render shows ticks + an **unticked** "เอกสารอื่นๆ(ถ้ามี)" box on 38272 → the tick logic *does* discriminate; but which docs truly have files is still **DB-only** | PARTIAL (visual OK; DB truth pending) |
| 9 | D2 — history path `/checklist/history/{formId}` | lead | call history endpoint | matches direct | **NOT TESTED** — needs checklist-form ids, not request ids (none provided) | NOT_TESTED |
| 10 | **Layout parity vs REQ-002 baseline** | happy | **visual render** — real 38272 pages vs mock baseline pages | same sections/boxes/positions, only values differ | front + evidence + signature + annex pages match the baseline structure exactly; real values populate correctly (e.g. law-ref subreport renders the real variable row count) | PASS |

## Defects
### DEF-1 — item 7 "ระยะเวลาการอนุญาต" printed from the wrong source (= SPEC-001 D3) — MAJOR
- Environment: uat-wired (read-only), :33000, seam `/a6/db/{id}`.
- Repro: GET `/document-service/api/v1/preview/checklist/a6/db/38240` (also 38272, 38273),
  read item 7 on page 1.
- Expected: item 7 = `T_T_LICENSE.PERIOD_TEXT` (business-confirmed source, Q2 in SPEC-001).
- Actual: item 7 prints `"<number> วัน"` — **111 วัน / 90 วัน / 350 วัน** across the 3 ids —
  which is exactly the current code's `EMPLOYER.TOTAL_DAYS + " วัน"` output
  (`A6CheckListReportBuilder.java:83-85`), not PERIOD_TEXT.
- Confidence: the **format** conclusively matches the TOTAL_DAYS path. Proving each value
  also *differs* from the intended PERIOD_TEXT needs the PERIOD_TEXT values for these ids →
  **DATA REQUEST** (see Questions). Code + business rule already agree D3 is real; this run
  confirms the wrong-source symptom is live in real output.
- Fix: out of scope for REQ-001 (investigate+verify) — for Porter to route as a follow-up REQ.
- Evidence: `../project-docs/REQ-001-evidence/a6db-{38240,38272,38273}.pdf` (item 7, page 1).

## Verdict
**TEST_FAILED (final)** — DEF-1 (item-7 wrong source) is a live, MAJOR correctness defect
confirmed on all 3 sampled ids, visually as well as by text. Scope is closed per Porter
(3/34 sample is sufficient; D3 not id-count-dependent). The visual/Playwright leg is now
**complete** (PyMuPDF render, REQ-007): D4 signature quadrants render correctly (no defect)
and layout parity vs the REQ-002 baseline holds. AC#1 delivered by SPEC-001; AC#2 (generation
+ complete layout) PASSES; **AC#3 = one confirmed MAJOR defect (DEF-1)** → the fix is REQ-005
(raised by Porter). The other leads: D4 clean, D5 visually plausible, D1/D5-DB-truth and D2
remain uncovered (see Limitations) — none rounded up to a pass.

## Limitations (honest coverage gaps — not rounded up to a pass)
1. **Visual leg — DONE via PyMuPDF (not the browser viewer).** The Browser pane still does not
   composite here (screenshot times out), so the "drive it in a real browser" screenshot path
   couldn't run. Instead used the SPEC-007 fallback that the human approved: PyMuPDF 1.28.0
   (`render_a6.py`, 150 dpi) rasterizes the PDF to PNGs, inspected directly. This is the pixel
   oracle SPEC-007 recommends. Covered D4 quadrants + layout parity on mock (PII-free) and real
   38272. Evidence: `../project-docs/REQ-001-evidence/render_mock/page-0{1,2,3}.png` (mock kept);
   real-data PNGs were rendered, inspected, then **deleted to limit PII** (source PDFs retained,
   gitignored — re-render with `render_a6.py` if needed).
2. **DB-truth leads (D1, full D5) blocked** — read-only PDF output can't confirm the source-table
   values; these need a DATA REQUEST.
3. **D2 (history) not tested** — requires checklist-form ids.
4. **Only 3/34 ids** run per the human's PII-limiting choice.

## Questions (for Porter; answer as `> answer: ...`)
- Q1 — Proceed to run the remaining 31 ids read-only (same seam), or is the 3-id sample enough
  to close AC#2/#3 given D3 is already confirmed?
  > answer (Porter, from human, 2026-08-05): **3-id sample is enough.** Do NOT run the
  > remaining 31 ids — D3 is confirmed and the other leads aren't id-count-dependent; the
  > human wants to limit real-PII exposure. Close AC#2/#3 on the sample.
- Q2 — DATA REQUEST (to confirm DEF-1 value-mismatch definitively): for ids 38240/38272/38273,
  the `T_T_LICENSE.PERIOD_TEXT` value (vs the printed 111/90/350 วัน).
  > answer (Porter, 2026-08-05): **Optional / not required.** DEF-1 already stands on the
  > format+business-rule evidence. Offered the SQL to the human as nice-to-have; if they drop
  > the result into project-docs/ I'll relay it, but don't block on it.
- Q3 — The Playwright/browser render leg can't run here (pane won't composite; no PDF renderer).
  How to satisfy it — provide a display-capable test env, install a renderer, or accept a human
  visual review of the saved PDFs?
  > answer (Porter, from human, 2026-08-05): **Set up a renderer/env** so you CAN run the
  > visual/Playwright leg. Raised as **REQ-007** (QA visual-verification enablement) — the
  > team will provide the render path + Playwright recipe. Do the visual leg (incl. D4
  > signature quadrants + layout parity) once REQ-007 lands. Until then, keep the visual
  > items BLOCKED, not passed.
- Q4 — Data-handling: `project-docs/` is **NOT gitignored**; the evidence PDFs contain real
  applicant PII (names, national-ID numbers). They are left **untracked** — please decide
  whether to gitignore `project-docs/` (or the evidence subfolder) before anyone commits.
  > answer (Porter, from human, 2026-08-05): **gitignore `project-docs/`.** Raised as
  > **REQ-006** (HIGH, before any commit). Keep the evidence untracked meanwhile — good call
  > flagging it. Do not commit anything until REQ-006 lands.
