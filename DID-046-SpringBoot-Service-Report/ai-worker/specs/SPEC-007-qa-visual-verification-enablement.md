# SPEC-007: Enable QA visual / Playwright verification of the อ.6 PDF

- Source: REQ-007
- Status: ACTIVE

## Overview
Give QA a repeatable, read-only way to render the อ.6 PDF to images and inspect
layout parity + the D4 signature-quadrant order. QA's env can't composite the
browser PDF viewer and has **no PDF rasterizer**. Recommended path: rasterize the
PDF with **PyMuPDF** (a pure-Python wheel — no system packages), then eyeball the
per-page PNGs. Optional Playwright leg for the "drive it in a real browser"
directive.

## Environment check (this machine)
- Missing: `pdftoppm`, `ghostscript (gs)`, `mutool`, `pdfinfo`. → the system
  renderers Tanya expected are absent (matches TEST-002 Limitation #1).
- Present: `node v26`, `npx 11`, `python 3.14`. Playwright not yet installed.

## Team delivers vs human installs
- **Team delivers (below, no install needed to read):** the render recipe + a small
  `render_a6.py` script, and an optional Playwright driver snippet.
- **Human installs (one-time, on the QA machine — via Porter):**
  - Primary: `pip install pymupdf` (pure wheel, no admin/system deps expected).
  - Optional (only for the browser-drive leg): `npm i -D playwright` then
    `npx playwright install chromium`.

## Recipe for Tanya (read-only)
1. Produce the อ.6 PDF (dev profile must be active — REQ-004):
   - Baseline (mock): `GET /api/v1/preview/checklist/a6?disposition=attachment` → `a6-mock.pdf`
   - Real data: `GET /api/v1/preview/checklist/a6/db/{id}?disposition=attachment` → `a6-{id}.pdf`
     (localhost:33000, UAT-wired, no auth).
2. Rasterize to PNG (no system renderer needed):
   ```python
   # render_a6.py  —  usage: python render_a6.py a6-mock.pdf out_dir [dpi]
   import sys, os, fitz            # fitz = PyMuPDF
   pdf, out = sys.argv[1], sys.argv[2]
   dpi = int(sys.argv[3]) if len(sys.argv) > 3 else 150
   os.makedirs(out, exist_ok=True)
   doc = fitz.open(pdf)
   for i, page in enumerate(doc, 1):
       page.get_pixmap(dpi=dpi).save(os.path.join(out, f"page-{i:02d}.png"))
   print(f"{len(doc)} page(s) -> {out}")
   ```
   `python render_a6.py a6-mock.pdf out_mock` and again for each real `a6-{id}.pdf`.
3. Inspect the PNGs:
   - **D4 signature quadrants:** on the signatures page confirm the 4 signers sit in
     the correct 2x2 cells (row-major: top-left=ตั้งเรื่อง, top-right=ผอ, bottom-left=หน,
     bottom-right=จก — per SPEC-001 D4 / TEST-001 layout).
   - **Layout parity:** diff the real `a6-{id}` pages against the mock baseline pages —
     same sections/boxes/positions, only the values differ.
4. Optional Playwright (browser-drive evidence, not the pixel oracle):
   ```js
   // a6-shot.mjs — node a6-shot.mjs <url> <out.pdf>
   import { chromium } from 'playwright';
   const [url, out] = process.argv.slice(2);
   const b = await chromium.launch(); const p = await b.newPage();
   const r = await p.goto(url); require('fs').writeFileSync(out, await r.body());
   await b.close();
   ```
   Use it to fetch the PDF headlessly (or screenshot the viewer); still rasterize
   with `render_a6.py` for the actual visual check — the embedded PDF viewer is the
   part that wouldn't composite, so don't rely on a viewer screenshot as the oracle.

## AC mapping
- Tanya can render อ.6 (mock and /a6/db) to images and inspect — via PyMuPDF steps. ✅
- D4 quadrant + layout-parity checks are performable from the PNGs. ✅
- Fully read-only; no environment writes. ✅

## Constraints / notes
- Requires the `dev` profile active on the instance (REQ-004) for the preview/seam.
- No product-code change; this is a QA tooling recipe. The scripts above are ready to
  copy — no repo commit needed (and commits are on hold pending nothing here).

## Tasks
- None (documented recipe + scripts). Porter relays to Tanya and arranges the
  one-time `pip install pymupdf` with the human.

## Questions
(QA/Porter follow-ups; Sober answers as `> answer: ...`)
