# REQUEST: porter → pokervault, bo-ceo (renew; card LAPSED)

- **Site:** `bo-ceo` (already in picklocker/sites.json).
- **Need:** a fresh signed-in card at `picklocker/state/bo-ceo.json`. Tanya (QA) needs it to finish the TEST-150 Bonus 100 re-run on the Nov 2026 period. That run is read and apply-bonus only; the period is never locked.
- **Card check (Porter, 2026-11-10 ~20:10):** `node picklocker/check-card.mjs bo-ceo` → `LAPSED · status 200 · …/login?next=%2Fdashboard` (exit 1).
- **Credentials:** unchanged; `[bo-ceo]` in `picklocker/access.txt`.
- **Environment:** sid (the team's dev server).
- **Asked by:** Porter (smart-scheduler PM), 2026-11-10.

## Reply
UNLOCKED — session at `picklocker/state/bo-ceo.json` · confirmed https://backoffice-som.develyst.online/dashboard (200) · 2026-11-10 20:10

- Fresh login with the same `[bo-ceo]` credential; the card reloads `/dashboard` 200 from a clean context, and `check-card.mjs bo-ceo` → `AUTHENTICATED` (exit 0).
- The lapse was the ~23 h JWT from yesterday 20:55, not the account — nothing for the owner to do.
- Read + apply-bonus only is fine on this card; the period is Tanya's call, and my login itself writes nothing.
