# TASK-843 — FE: **back-office FINAL UI: the SHELL** (REQ-133, Deliverable 1) — @Fern (≈ 1.5 d)
**From @Sober to @Fern, 2026-10-27. GO now** (Porter's GO, inbox/SA.md 2026-10-27). **First on the critical path:** Team B builds their pages against this shell in parallel.
**Read first:**
- `requirements/REQ-133-backoffice-final-ui-and-pricing-presentation.md` (whole);
- **the contract you build to: `final-ui/CONVENTIONS.md`** in `som-balance-backoffice-spec` (path in `machine.local.md`). I wrote it. Implement it exactly; a change to it is a message to me first.

**Folder:** `som-balance-backoffice-spec/final-ui/`. Not git, not product code: **nothing in the smart-scheduler repos is touched.** No git.

## Build (everything in CONVENTIONS §1–§5)
1. **Vite + React 19.2.7 + TS (strict) + Mantine 9.3.2 + lucide-react 1.17.0 + react-router-dom 7 (hash router).** Exact versions, no `^`.
2. **Theme:** copied verbatim from the front's `src/context/MantineProviders.tsx`. **Noto Sans Thai** woff2 bundled locally (e.g. `@fontsource/noto-sans-thai` pinned, or the file itself), with no Google Fonts link.
3. **Layout:** the front's `AdminLayout` look (`src/components/layout/AdminLayout/Sidebar` + `Header`): collapsible sidebar, drawer on a phone, brand **SOM BALANCE · BACK OFFICE**.
   - The menu is built from both page lists, by `group` (ALL CAPS) then `order`, filtered by role.
   - SETTING holds the `fo: true` pages.
4. **Role switcher** in the header: **CEO / Admin / Coach**.
   - Switching re-renders the page. A page whose `roles` excludes the role shows a friendly "this role cannot see this page" screen.
   - The choice is remembered in `localStorage`, every access in try/catch.
5. **Router:** hash routes; back / forward work; an unknown route → Home + a Thai toast.
   - **Home** = a short Thai welcome + the role's menu as cards. The landing page for Coach is My slip.
6. **The public helpers** of CONVENTIONS §5, exported from `src/shell/index.ts`, plus `types.ts` exactly as §4.
7. **Page lists:**
   - `src/pages/a/index.ts` (yours) holds ONE example page, so the menu isn't empty;
   - `src/pages/b/index.ts` is created **empty**: `export default [] satisfies PageDef[];` plus one commented example line.
8. **Build:** `npm run build` → **ONE self-contained `dist/index.html`** (`vite-plugin-singlefile`). It must open by double-click from `file://` with the network OFF. Also `npm run dev` for building.
9. **Dead controls:** no automatic guard (React's DOM can't show which elements have handlers). The rule is CONVENTIONS §2.2; Tanya's click-through enforces it.

## Done = (send me your report in `inbox/SA.md`)
- `npm run build` exit 0; `tsc --noEmit` 0; the built file opens offline: **0 console errors / warnings**, all 3 roles switch, the example page routes, an unknown hash → Home.
- 375 px wide: no sideways page scroll; the sidebar becomes a drawer.
- The `dist/index.html` size, and the exact `package.json` versions.
- **Tell me the moment the shell + the empty `pages/b/index.ts` exist.** I tell Porter, and he unblocks Silver's team. Then go straight to TASK-844.

---
## FE report — Fern, 2026-10-27 — TASK-843 DONE: the SHELL (Deliverable 1). No git; no smart-scheduler repo touched
**Where:** `som-balance-backoffice-spec/final-ui/` (`npm install` done; `npm run dev` for building; `npm run build` → `dist/index.html`).
**Gates (mine, measured):**
- `npm run build` exit 0 (`tsc --noEmit` 0 first, then `vite build`) → **ONE self-contained `dist/index.html` = 1,022,322 bytes (≈ 0.97 MiB; 369 kB gzip)**: JS, CSS and the 8 Noto Sans Thai woff2 files inlined; **0 Google Fonts, 0 requests** (the only `http(s)://` strings left in the file are library constants / namespaces / error-message URLs, never fetched).
- Opened ALONE from an empty folder by `file://` in **headless Edge and headless Chrome**: **0 console errors and 0 warnings** on load and through the whole run; the 3 roles switch (CEO / Admin / Coach; remembered in `localStorage`, try/catch); the example page routes; back / forward work; an unknown hash (`#/nope/nothing`) → Home + the Thai toast "ไม่พบหน้านี้ พากลับหน้าแรกให้แล้วค่ะ".
- **375 px:** page scroll width = 375 (no sideways scroll); the sidebar is hidden and the header's menu button opens the **drawer**, which closes on navigating.
- **No-access screen verified** (temporary CEO-only build, then restored): Admin and Coach get "This role cannot see this page" (+ a Thai line + Back to Home); CEO opens the page.
- Looked at a screenshot of the example page: it reads as the front's product (blue, Noto Sans Thai, cards, the copied sidebar/header look, ALL-CAPS group labels, 16/10/26 dates, 23,139 ฿).
**Exact versions (`package.json`, no `^`):** react / react-dom **19.2.7** · @mantine/core · dates · hooks · notifications · charts **9.3.2** · dayjs **1.11.21** · lucide-react **1.17.0** · react-router-dom **7.18.4** (hash router) · tailwindcss **3.4.19** (+ postcss 8.4.49, autoprefixer 10.4.20) · typescript **6.0.3** (strict) · vite **8.3.5** · @vitejs/plugin-react 6.1.2 · vite-plugin-singlefile 2.3.4 · @fontsource/noto-sans-thai 5.3.0 · recharts 3.10.1 (peer of `@mantine/charts`) · @types/react 19.2.0 / react-dom 19.2.0 / node 22.19.0 (22.10.0 conflicted with vite 8's peer).
**What is in it (CONVENTIONS §1–§5):**
- `src/shell/types.ts` — `Role`, `Group`, `PageDef` exactly as §4.
- `src/shell/index.ts` — the public helpers exactly as §5: `useRole`, `Locked`, `PageHeader`, `fmtDate` (16/10/26), `fmtBaht` (3,705 ฿), `DateField` (Mantine `DatePickerInput`, `valueFormat="DD/MM/YY"`), `MonthPicker` (‹ Oct 2026 ›, value `"2026-10"`), `notify(th, kind?)`, `fakeDownload(name)`, `useGo`, `Go`, `FoBadge`. 🔑 It exports helpers + types ONLY (never the registry or the layout: they import the page lists, which import this file — a cycle).
- `src/shell/registry.ts` (both lists → menu by group = smallest `order`, pages by `order`, filtered by role, `hidden` left out; SETTING holds the `fo: true` pages) · `Layout.tsx` (the front's sidebar + header look, collapsible; brand **SOM BALANCE · BACK OFFICE**; role switcher) · `Screens.tsx` (Home with a Thai welcome + the role's menu as cards, the no-access screen, the `fo` badge, unknown-route handling) · `App.tsx` (the front's theme copied verbatim; hash router) · `roles.tsx`, `format.ts`, `helpers.tsx`.
- `src/pages/a/index.ts` — ONE example page (`/salary/example`, all roles) using every helper; `src/pages/b/index.ts` — created **EMPTY** (`export default [] satisfies PageDef[];` + one commented example line).
- A coach lands on My slip (`/salary/my-slip`) as soon as that route is registered (Home redirects a coach there; until then the coach sees the example page in the menu).
**Dead controls:** no automatic guard (as the task says); the rule is CONVENTIONS §2.2. Every control in the shell does something (menu items navigate, the collapse / drawer buttons toggle, the role switcher switches, the example's buttons/tabs/filter/row-click act).
**Not done / caveats:** not clicked through by a person; Thai/English widths of long menu titles at 375 px are unchecked; the header's right side is just the role switcher (no user menu — the contract has none).
