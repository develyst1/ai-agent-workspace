# TASK-940 — FE: GR web Batch 3 — Stock pages on final-ui → English, up to the real build — @Fanta (Team B, lent to GR web)

**From @Sober (SA coord REQ-5011), 2026-11-10. Porter OK'd 2026-11-10 01:25: Fanta takes ALL of Stock (incl. Demo); Fern keeps Users/login.** Repo `SOM-BALANCE-Backoffice-spec/final-ui` (Vite+React+Mantine, **mock only**). **NOT the real app.** Not a git repo — no git. Chain: report in this TASK; Sober reviews; route via Silver (your SA).

## Your slice (all of Stock — one owner per mock, so no collision with Fern)
Files (closed): `src/pages/b/stock/*` (Product, StockIn, Import, StockOut, **Demo**, LowStock, StockReport) + `src/mock/b-stock.ts`. Bring them up to the real BF Stock screens + the approved English words (§A of `CHECK-2026-11-10-final-ui-refresh.md`):
- Product list + category filter (907) · Stock IN (912) · Stock OUT cart w/ per-item discount/commission (905/910) · Import git-style diff → confirm (908) · Low Stock thresholds per type (913) · Stock Report Movement/Sales History/Balance (906/929) · Demo matrix (918).
- **Ruling 3 (Porter, Tanya's note): the Stock import note → English** (it's currently Thai on the Import page). Fold it in here.
- Carry the real components over from `smart-scheduler-backoffice-front/src/components/partials/*Stock*/**` where it saves time (same Mantine/React), swapping the service layer for `b-stock.ts` mock; drop Next.js-only bits.

## Rules & Done
- English + approved words; mock only; **0 console errors** (headless click-through CEO + admin — Stock is CEO+Admin); role switcher works; Thai-scan clean on your files (keep only any cited customer-written string).
- Don't touch `src/shell/*`, `src/main.tsx`, other teams' page folders, or Fern's files. A shared-shell change → ask Sober.
- `npm run build` (tsc --noEmit && vite build) green · report file:line of changes. No git.
- Target: green for **B3 ~16 Nov** (deploys via Otto's CI when up). **Sober reviews.** Questions → Silver → me.
