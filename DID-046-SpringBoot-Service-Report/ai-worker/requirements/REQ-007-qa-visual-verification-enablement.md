# REQ-007: Enable QA visual / Playwright verification of the อ.6 PDF

- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-08-05 by human (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal
The stakeholder wants the อ.6 output verified **visually with Playwright** (real
browser render) for higher-fidelity correctness. In QA's current environment this
could not run: the browser pane won't composite and no PDF→image renderer
(pdftoppm/ghostscript/mutool) is installed, so pixel-level layout parity and the D4
signature-quadrant placement remain unverified. The team must give QA a working
render path so the visual leg of REQ-001 can be completed.

## Preferred method (human decision 2026-08-05) — keep it simple
The stakeholder pointed out (correctly) this was over-engineered. **Primary method:
open the preview/seam URL in a REAL browser — which renders the PDF inline — and
screenshot it**, exactly like the smart-scheduler web-QA flow. e.g. open
`http://localhost:33000/document-service/api/v1/preview/checklist/a6/db/{id}`,
eyeball the อ.6 layout + signature quadrants (D4), screenshot into `project-docs/`.
No `pip install`, no rasterizer needed when a working browser is available. The
PyMuPDF/automation recipe below is a **fallback only** for headless/automated runs
where no display browser exists (e.g. the QA agent's non-compositing pane).

## Requirement
1. Provide QA a repeatable way to **render the อ.6 PDF to an image and inspect it**
   — e.g. install/document a PDF renderer (pdftoppm/ghostscript/mutool) usable in
   the QA environment, and/or a Playwright script that drives the preview/seam URL
   and captures the rendered output.
2. The recipe must let Tanya verify **layout parity vs the REQ-002 baseline** and
   the **D4 signature 4-cell quadrant order**, read-only.
3. Document exactly what must be installed and how QA runs it (repeatable steps).

## Acceptance Criteria
- [ ] Tanya can render an อ.6 PDF (mock and/or /a6/db seam output) to an image and
      visually inspect it, following documented steps.
- [ ] The D4 signature-quadrant check and layout-parity check can be performed.
- [ ] Method is read-only and needs no write access to any environment.

## Constraints
- Read-only for QA; runs on local / the UAT-wired :33000 (mock preview needs no data).
- Prefer reusing tools/patterns already acceptable to the stakeholder's setup.
- Some installation may need the human on their machine — SA Lead states clearly
  what the team delivers vs what the human must install.

## Out of Scope
- Fixing any layout defect found — that would be a follow-up REQ.

## Traceability
- Source: TEST-002 Q3 + Limitation #1 (Tanya) + human directive "test with Playwright".
- Unblocks the visual leg of REQ-001 (D4 + layout parity).

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
