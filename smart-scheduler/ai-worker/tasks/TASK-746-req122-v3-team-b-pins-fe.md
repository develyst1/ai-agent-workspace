# TASK-746 — REQ-122 v3 (Team B): the [?] pins on Tanya's NEW captures — FE, S (≈ 1 d → 1.1 d)
- Source: REQ-122 §8 · CONVENTIONS §5.3 (1280×800, the most privileged role, light) · follows TASK-745 · as TASK-740 phase 2
- Status: REVIEW (Fanta, 2026-10-21) — 13 pages pinned; STOCK OUT outstanding — ▶️ GO for the 13 passing pages (Porter 2026-10-21); STOCK OUT after its re-capture
- Folder: `som-balance-backoffice-spec` · Assignee: @Fanta · From: @Silver (2026-10-21)
- **Claim:** TASK-745's files only.

## Build
- `help.img` = `help/<slug>.png` from the new captures. One pin per step, the same numbers, measured on the real PNG. No pin where nothing is visible; list those.

## Definition of Done
- [ ] Every Team B page pinned. Headless re-run 0 / 0, every popup showing its image.
- [ ] I check every pin on its image (overlay) before DONE.

## Implementation Notes

## Questions

## Review

- **✅ GO (Porter, 2026-10-21):**
  - pin the **13 pages that passed TEST-115 part B** now (their captures are in `help/`);
  - **STOCK OUT** waits for its fix (TASK-745) + Tanya's re-capture;
  - **`help.img` must point at the NEW capture names** (`#/stock/stock-out` → `help/stock-stock-out.png`, not the old `sales-record`).

## Implementation Notes — Fanta, 2026-10-21 (13 pages; STOCK OUT waits)
- 13 pages pinned: revenue summary · lines · manual · refund · categories · eca-term; stock products · stock-in · import · demo · low-stock · reports; reports/home (kept phase-2 pins, re-checked on the new PNG). `help.img` = `help/<slug>.png` (new names). STOCK OUT has no img/pins yet.
- Method: built-in browser at 1280×800 (CEO), element boxes read from the live DOM (x%=px/12.8, y%=px/8), then **every page overlaid on its real PNG and looked at**. One correction from that: Import (my browser's card heights are taller than Tanya's PNG) — pins 2/3/4 re-measured from the PNG itself.
- **No pin (nothing visible at 1280×800):** summary step 6 (role note); lines step 5 (red refund row is below the frame); reports/home step 1 (intro). Partial: stock-in step 2 pins the Quantity field only (Date sits on the next row, not boxed); products step 4 boxes the COMMISSION column.
- Headless re-run: 19 pages · 31 popups · 0 errors · 0 problems. Real popup opened on Product: image 1280×800 loads, 5 numbered steps. NOT VERIFIED: popups of the other pages opened by eye (only the overlay check).
- STOCK OUT: layout changed in 745 part B; its pins come after Tanya's re-capture (`help/stock-stock-out.png` is the old one — I have not pinned it).
