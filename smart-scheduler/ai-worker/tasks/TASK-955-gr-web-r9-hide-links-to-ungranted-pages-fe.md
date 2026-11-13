# TASK-955 — FE: GR web round 9 — never offer a button or link to a page the viewer can't open — @Fern (Team A) + the Team B / C slices

**From @Sober, 2026-11-12.** Source: Tanya, TEST-151 § GR round 8, **O-151-8a**. With per-menu ticks (round 8), Kung with only Summary ticked still sees Summary's header buttons Detail · Refund · ECA Payment · Add Manually and the per-row View. Each one leads to the lock page. Porter asked for it in the next round (inbox/SA.md, 2026-11-12).
Repo `SOM-BALANCE-Backoffice-spec/final-ui` (mock only, not a git repo, so no git).

## Done by me (shell, round 9)
- **New helper `useCanOpen()`** from `@/shell` (`shell/roles.tsx`). It uses the same `canOpen` rule as the menu and the page gate. An unknown route returns true.
  - Usage: `const canOpen = useCanOpen();` then `{canOpen("/revenue/lines") && <Button … onClick={() => go("/revenue/lines")}>…</Button>}`.
  - Pass the target page's **registry route** without the query string, e.g. `/revenue/lines` for `/revenue/lines?type=…`.
- **O-151-8b (lock text):** `shell/Screens.tsx` NoAccess now reads «You don't have access to this page / <Page> is not open for this login. The CEO can give access in User Setting …». It no longer names a role.

## The rule (every team, its own pages)
**A button or link that goes to another page is drawn only when `canOpen(<target route>)` is true. It is hidden, never disabled.** "Back to <page>" links follow the same rule. When the back target is closed, hide the link; the menu still works.

## The links, by owner (grep `go("/` / `go(\`/` in `src/pages`, 2026-11-12)
- **Team A, Fern (this TASK):** `a/notify/NotifySettings.tsx` → `/notify/inbox` (Notification Setting is tickable since round 8, so it can be ticked without Notification Alert). The salary links (`Daily`, `PayRun`, `Slip`, `People` ↔ `Person`) only join CEO-only pages or a hidden detail page. **Leave them**, but say so in your Notes.
- **Team B, Fanta (Porter routes):** `b/stock/Import.tsx` (2 × `/stock/products`), `b/stock/StockOut.tsx` (1 × `/stock/products`).
- **Team C, Flash (Porter routes):**
  - `b/revenue/Summary.tsx` l.68–79: 4 header buttons → `/revenue/lines`, `/revenue/refund`, `/revenue/eca-term`, `/revenue/manual`;
  - `Summary.tsx` l.143: the row View → `/revenue/lines`;
  - `Detail.tsx` (→ `/revenue/manual`, `/revenue/summary`);
  - `EcaPayment.tsx`, `Manual.tsx` (2), `Refund.tsx` (→ `/revenue/summary` / `/revenue/lines`).

## Done = (each team, its own slice, evidence in its own Notes)
- `npx --yes --package typescript@5.6.3 tsc --noEmit` → 0 · build OK · no Thai · no `ta="center"`.
- Headless, through the real «Viewing as» dropdown:
  - as CEO, every button is still there (paste the button list per page);
  - as Kung, with only the page itself ticked (CEO ticks it first), no button points to an unticked page;
  - tick the target too ⇒ the button is back;
  - 0 console errors.
- One screenshot per team: Kung's view of one changed page.

**Sober reviews each slice, then rebuilds round 9 → Otto → Tanya.** No git.

## Questions
_(—)_

## Implementation Notes
**Fern, 2026-11-12 (Team A slice).** One file, `a/notify/NotifySettings.tsx`: imported `useCanOpen`, `const canOpen = useCanOpen();`, and the `PageHeader` action «Notification Alert» → `/notify/inbox` is now drawn only when `canOpen("/notify/inbox")`. Hidden, never disabled. No words/data/other behaviour changed.
- Links left alone, as you said: `Daily`, `PayRun`, `Slip`, `People`↔`Person` (CEO-only or hidden detail pages). Also seen and left: `Slip` «Open Monthly Payment» (CEO-only page), the `Cancel` → `go("/")` in `RoleSetting` (Home always opens), no other `go("/…")` in my `a/frontoffice/*` or `a/notify/*` files.
- `tsc --noEmit` (5.6.3) → 0 · `vite build` OK · no Thai · no `ta="center"` added.
- Headless (`fui-955.mjs`, real «Viewing as» dropdown), all PASS, 0 console errors:
  - CEO on Notification Setting: buttons `Notification Alert` (still there).
  - CEO ticks «Notification Setting» and unticks «Notification Alert» for Kung → Kung opens Notification Setting: buttons `(none)`; `#/notify/inbox` is NoAccess for him (control).
  - CEO ticks «Notification Alert» again → the button is back on Kung's page and opens Notification Alert.
  - 375 px: no horizontal overflow.
- Screenshot `tests/evidence/task-955-fern/fui-955-1-kung-notification-setting.png`: Kung's view with the link hidden.
- No git. unhandled-between-tests: 0.

### Flash (Team C) — 2026-11-12, Revenue slice
Files: `b/revenue/{Summary, Detail, EcaPayment, Manual, Refund}.tsx`. Each imports `useCanOpen` and gates every button that goes to another page. Hidden, never disabled. No words, data or other behaviour changed.
- `Summary`: the 4 header buttons (Detail, Refund, ECA Payment, Add Manually) each drawn only if its page opens. The row «View» → `/revenue/lines` is gated the same way (the cell stays, so the table does not shift).
- `Detail`: «Summary» and «Add Manually» gated.
- `EcaPayment`, `Refund`: the header «Summary» back-link gated (the header shows nothing when it is hidden).
- `Manual`: the header «Summary» and the «Cancel» (also a back-link to Summary) gated. After Save it lands on Detail if that opens, else Summary if that opens, else stays on the form (the "Revenue added" toast already showed). I added this because the old `go("/revenue/lines")` would otherwise hit the lock page.
- Checks: `tsc` 5.6.3 → 0 · `vite build` into a scratch dir OK · no Thai added · no `ta="center"`.
- Headless on the built single file through the real «Viewing as» dropdown (`ai-worker/evidence/TASK-955/check-hide-links.mjs` → `r9-run.json`). The ticks are made as CEO in User Setting, then the viewer is switched to Admin (Kung); navigation is by hash change because the ticks live in memory. 0 console errors, 0 network requests.
  - **CEO (all pages open):** Summary shows Detail · Refund · ECA Payment · Add Manually (+ 8 row «View»); Detail shows Summary · Export · Add Manually; Manual shows Summary · Cancel · Save; Refund and ECA show Summary · Save.
  - **Kung, only Summary ticked:** Summary shows no Detail / Refund / ECA / Add Manually and no row View (only Apply Filter and the Today/MTD/YTD tabs). The other four pages show the lock page.
  - **Kung, Summary + Detail:** the Detail button and the row Views are back, Refund / ECA / Add Manually are still hidden. On Detail: Summary and Export, no Add Manually.
  - **Kung, all five ticked:** every button is back as for the CEO.
  - **Kung, only Detail:** Detail shows Export only (no Summary, no Add Manually). **Kung, only Add Manually:** the form shows Save only (no Summary, no Cancel).
- Screenshots in `ai-worker/evidence/TASK-955/`: `r9-1280-kung-summary-only.png` (Kung's view of Summary), `r9-1280-kung-summary-detail.png`, `r9-1280-kung-manual-only.png`.

## Review
- **Team A slice (Fern), Sober 2026-11-12: ✅ DONE.**
  - Re-run: tsc 5.6.3 → 0. `NotifySettings.tsx:3/12/18`: `useCanOpen` imported and the header button gated.
  - `fui-955-1-kung-notification-setting.png`: Kung on Notification Setting, no «Notification Alert» button, and Notification Alert absent from his menu.
  - Leaving the salary links, `Slip` «Open Monthly Payment» and `RoleSetting` Cancel → Home alone is correct.
  - Security review: none (mock-only).
- **Team B slice (Fanta; Silver accepted, TASK-936 § Review part 7), Sober 2026-11-12: ✅ DONE.**
  - Re-run: tsc → 0. Gated sites: `Import.tsx:22` (header button), `:128` Cancel and `:134` Apply (go to Product only when it opens, else the form resets or stays); `StockOut.tsx:67` cancel and `:105` header button.
  - Evidence `tests/evidence/task-936/result-links.txt` 15/0.
  - Handling Cancel/Apply too (not only the header button) goes beyond the brief, correctly: they were also links to Product.
- **Team C slice (Flash), Sober 2026-11-12: ✅ DONE.**
  - Re-run: tsc → 0. Every `go(` in the 5 Revenue files sits inside a `canOpen(…)` check: Summary 5 (4 header + row View, `:152`), Detail 2, EcaPayment 1, Manual 4 (incl. Cancel and the post-Save landing), Refund 1.
  - `r9-1280-kung-summary-only.png`: Kung with only Summary ticked sees Apply Filter and the tabs only, no header buttons and no row View.
  - The post-Save fallback in Manual (Detail → Summary → stay) is a sensible extension: the old landing would have hit the lock page. Accepted.
- **Round 9 built (all 3 slices + my shell: `useCanOpen`, lock text O-151-8b):**
  - md5 `dc7a73dc0e980018b33c9c895ff73bd4`.
  - Gates: tsc 0 · `MENU_ACCESS_HELD = false` · 0 `ta="center"` in `src/pages`.
  - → Otto.
- Security review: none (mock only).
