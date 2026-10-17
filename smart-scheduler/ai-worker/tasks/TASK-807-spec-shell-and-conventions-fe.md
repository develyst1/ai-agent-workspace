# TASK-807 — FE: **the clickable back-office spec — the SHELL + `CONVENTIONS.md`** (REQ-122) — @Fern (M ≈ 1.7 d incl. +10 percent)
**From @Sober to @Fern, 2026-10-16.** Source: `requirements/REQ-122-backoffice-clickable-spec-for-the-customer.md` (read it whole) + `REQ-120` §0 (roles) and §8 (D2: English UI). **HOLD until I say GO in your inbox** (Porter approves the size + split first).
**Folder:** `som-balance-backoffice-spec` (path in `machine.local.md`). Empty, **not git**. It is a mock-up, **not product code**: nothing in the four smart-scheduler repos is touched.
🚫 **The `requirement-hub` and `galaxy-spec` skills are banned (owner).** No IDs, graphs or WF/UC/SCR words on any page the customer sees.
**Look and feel:** reuse the shape of the pages the customer already used and liked: `smart-scheduler/project-docs/customer-2026-10-14-backoffice-spec-draft/backoffice-spec-draft.html` (Sarabun, the ✓/✗ + note block, "คัดลอกคำตอบทั้งหมด", print). Read it first.

## Why the shell comes first and must be strict
**Team B (Silver → Fanta) builds Revenue · Stock · F1/F2/F4/F5 · Confirm camp · Reports in the SAME shell, in its own files, at the same time.** So the shell must let a team add pages **without editing any file you own**. `CONVENTIONS.md` is the contract they build against; once you publish it, a change to it is a message to me first.

## Build
1. **`index.html`** opened by double-click (file://). **No server, no build step, no `fetch`, no network calls.** The only external resource is the Google Fonts stylesheet (Sarabun). Everything else inline or in local `.js`/`.css` files loaded with `<script src>` / `<link>`. It must still work after being zipped and sent over LINE.
2. **Loading pages without shared edits:** `index.html` loads `shell/*.js`, then **one page list per team**: `pages-a.js` (Team A, yours) and `pages-b.js` (Team B, theirs, created empty by you with one example line commented). Each list appends `<script>` tags for its own page files in order (this works on file://). **Neither team edits the other's list or `index.html`.**
3. **Registration API** (one global, e.g. `SPEC`), documented in CONVENTIONS:
   - `SPEC.page({ route: "#/salary/payrun", menu: "Salary", title: "Pay run", roles: ["ceo", ...], th: ["...", "..."], render(el, ctx) })`;
   - `th` = the Thai "หน้านี้ทำอะไร" lines (2–4, plain, no tech words), shown in the side panel;
   - `roles` = who may open it. A role that may not see it gets a friendly "this role cannot see this page" screen (that IS the visibility demo), not a blank;
   - `ctx.role` for **field-level** masking inside a page (e.g. base salary 🔒 for Admin) + a helper `SPEC.locked("CEO only")` that draws the lock consistently;
   - the menu is built from registered pages (grouped by `menu`, ordered by an `order` number), filtered by role.
4. **Hash router:** `#/area/page`, back/forward work, unknown route → Home with a toast. Home = a short Thai welcome + the menu as cards.
5. **Role switcher** at the top: **CEO (พี่ฟีน) / Admin / Coach**. Switching re-renders the current page. Remembered in the browser (try/catch).
6. **Buttons can never be dead — make it mechanical:**
   - `data-go="#/…"` navigates; `data-dialog="<id>"` opens a registered example dialog (`SPEC.dialog(id, render)`); `data-toast="<Thai text>"` shows a toast; `SPEC.toast(thaiText)` for anything scripted.
   - **After every render the shell checks every `<button>` and `<a>` in the page:** one with none of those attributes and no handler registered through `SPEC.on(el, fn)` logs `console.error("dead button: …")` and gets a red outline. Tanya's headless run then finds dead buttons by reading the console.
7. **Feedback per page** (as on the earlier pages):
   - ✓ ครบ / ✗ ไม่ครบ + a note box, keyed by route;
   - **one "คัดลอกคำตอบทั้งหมด"** collecting every page's answer (page title + choice + note, in menu order; pages never answered listed as "ยังไม่ตอบ");
   - **"พิมพ์ / PDF"**;
   - stored in `localStorage` under one key, every access in try/catch; the page works without storage.
8. **Theme:** colour tokens on `:root`, dark mode under `@media (prefers-color-scheme: dark)` + a manual toggle; readable at phone width (16 px side gutter, no horizontal page scroll; wide tables scroll inside their own box).
9. **Example-data rules** (in CONVENTIONS, and followed in your pages):
   - staff names she used are fine (Kid, Poo, Kung, Bank, London, พี่ฟีน, Nelson);
   - **children only as "น้องเอ / น้องบี / น้องซี"**; no real family data, phone numbers or LINE ids;
   - money as `3,705 ฿`; dates as she writes them (`30/9–30/10`, `14/10`);
   - **UI labels English** (D2); the side panel and toasts **Thai**.
10. **`CONVENTIONS.md`** (for the teams, not the customer):
    - file layout: `shell/` = Team A only · `pages/a-*/` Team A · `pages/b-*/` Team B · `data/a-*.js` / `data/b-*.js` example data;
    - the API with one complete example page;
    - the attribute rules and the role keys;
    - the menu `order` ranges per team (your choice, written down);
    - the example-data rules;
    - "how to check your page has no dead button".
11. **One example page** that uses every feature (side panel, role mask, dialog, toast, feedback), so Team B can copy it.

## 🚫 Not this task
- The Salary / Notifications / F3 / F6 pages (TASK-808, TASK-809).
- Anything in Team B's areas. Any product repo.

## ✅ Done means
- Opens by double-click from a zipped copy; works with no network except fonts (fonts may fall back).
- In each of the 3 roles: menu filtered · the example page renders · the masked field shows the lock for Admin · the no-access screen shows for a forbidden page · dialog / toast / navigation work · ✓/✗/note persist across reload · copy-all produces the text · print opens.
- A deliberately dead button on a scratch page logs `dead button` (then remove the scratch page).
- **No console errors** in any role. Report the browser and how you checked.
- `CONVENTIONS.md` written; `pages-b.js` exists and is empty apart from the commented example.

---
## 📋 @Fern REPORT — 2026-10-16 — 🔨 807 DONE (shell + CONVENTIONS + the template page), ready for @Sober
Folder `som-balance-backoffice-spec` = `H:\scheduler\SOM-BALANCE-Backoffice-spec` (path from `machine.local.md`). **Nothing in the four product repos touched.**
**Files (mine, Team A):** `index.html` · `CONVENTIONS.md` (v1 + the exact menu strings you asked for in §6) · `shell/core.js` (registry, storage, `SPEC.page/dialog/on/locked/ask/esc/load`) · `shell/ui.js` (layout, menu, hash router, role switcher, theme, dialogs, toast, the dead-button check) · `shell/feedback.js` (✓/✗ + note, copy-all, progress, print wiring) · `shell/boot.js` · `shell/styles.css` · `pages-a.js` (loads the data + the template page) · **`pages-b.js` (empty but for the commented example)** · `data/a-example.js` · `pages/a-example/everything.js` (the template page: side panel, role mask (base/total locked for Admin), no-access (Coach), `data-dialog`, `data-toast`, `data-go`, `SPEC.on`, `SPEC.ask`; `hidden:true`, reachable at `#/example/everything`).
**How I checked — browser: the Browser pane (Chromium), the folder served over `http://localhost` by a throwaway node static server (stopped afterwards); each check driven by script in the page:**
- **3 roles:** CEO — 0 locks, no no-access · Admin — **6 locks** (base + total for 3 rows) · Coach — **the friendly "This role cannot see this page"** (Thai line + who can) · menu filtered per role (checked with two scratch pages: CEO saw both, Admin/Coach only the all-roles one).
- **Dialog** opens, `data-close` + `data-toast` closes and toasts the Thai effect · **`SPEC.on`** toggles the extra view · **`SPEC.ask`** choice stored · **✓/✗/note persist across a reload** (read back after navigating with a new query string) · **unknown route → Home + the Thai toast** · **copy-all** text lists every page in menu order, unanswered as "ยังไม่ตอบ" (+ the `ask` line under its page); progress "ตอบแล้ว 1/2 หน้า".
- **Dead button:** a scratch page with `<button>`/`<a>` that do nothing → **`console.error("dead button: #/scratch/dead [ceo] — I do nothing")` + the `<a>`** (2 flagged, the one with `data-toast` not); scratch pages **removed** (`pages-a.js` is back to the 2 real lines).
- **Console errors: none** in any role (error hook installed in-page across all three roles, empty). **Phone width 375: no horizontal scroll** (`scrollWidth 375`), side panel moves above the content, menu behind a ☰ button. Dark theme seen; the manual toggle is wired (◐).
⚠️ **What I could NOT prove here — file://, the one thing the brief names first.** The Browser pane cannot run page tools on a `file://` page, and happy-dom refuses to load script files from `file://`. **The code uses nothing that needs a server** (no `fetch`/XHR/modules; scripts loaded by `<script src>` and `document.write` during parse, which is allowed on file://; `localStorage` wrapped in try/catch). **I have NOT double-clicked it from a zipped copy.** ▶️ **Please have Tanya (or the owner) double-click `index.html` from a zip and read the console.** Also not run: the real print dialog (`window.print()` is wired; headless can't show it) and the real clipboard (`navigator.clipboard` with an `execCommand` fallback and a "select and copy" box if both fail).
**Beyond the brief (all small, all in CONVENTIONS):** `SPEC.ask`, `hidden:true`, `SPEC.esc`, `SPEC.load`; a two-tap "ล้างคำตอบ" so the reset cannot be hit by accident.
**BALL: @Sober** (then I start 808 + 809).

---
## ✅ 2026-10-16 — @Sober: TASK-807 VERIFIED (one item left for QA: a real double-click from a zip)
**Static read:**
- no `fetch` / XHR / ES modules / network URL except Google Fonts;
- `SPEC.load` writes `<script>` tags during parse and refuses after load, so order is shell → `pages-a` → `pages-b` → boot;
- storage is one key with every access in try/catch and a memory fallback.

**My own run:** a throwaway static server on 127.0.0.1 from my scratchpad, then the built-in browser, scripted.
- **3 roles × every route + Home + an unknown route:** `console.error` and `window.onerror` captured **0**.
- Every dialog on the template opened and closed.
- The Coach gets the no-access screen on the template; an unknown route goes to Home.
- **Field lock:** Admin sees 6 `.tag.lock`, CEO sees 0.
- **Dead-button check:** a bare `<button>` gets `console.error("dead button: … — PROBE")` and a solid outline.
- **Copy-all** produces the Thai header + "(ยังไม่มีหน้า)", correct while only the hidden template exists.
- **"ล้างคำตอบ"** must be armed by a first click before it wipes anything.
- **Home** has the Thai welcome + instructions.

**NOT proven by me:** a double-click on `file://` from a zipped copy. The pane renders local files as static snapshots only. This goes to Tanya's headless pass, via @Porter.

---
## 🔧 2026-10-16 — @Sober → @Fern: TEST-104 fixes (Tanya, via @Porter). Two, both in Team A files
1. 🟠 **The template is reachable by URL and leaks pay.** `#/example/everything` shows Admin coaches' extra pay (2,100 / 700 ฿), which breaks R0.2 / QS13.
   - **Fix: stop loading it.** Remove `SPEC.load("pages/a-example/everything.js")` from `pages-a.js`.
   - **Keep the file** (and `data/a-example.js` if only it uses that) as a copy source. Nothing ships that the browser can open.
   - **Update CONVENTIONS §9 and the line in §4 that mentions it:** "the template is NOT loaded. Copy `pages/a-example/everything.js` to start a page; to view it while building, add its `SPEC.load` line to your own list temporarily and remove it before handing over."
   - Bump the status line to **v1.1**, with one sentence on what changed.
   - Also mask the two amounts in the template with `SPEC.locked` for non-CEO roles, so a copied page starts correct.
2. 🟡 **Header too tall at phone width** (about half of a 375 px screen).
   - **Fix:** under ~600 px, the header is **at most ~20% of a 375 × 812 screen (≈ 160 px)**, ideally one or two rows.
   - The role switcher stays visible and tappable.
   - Copy-all / print / clear / theme may collapse into a single "⋯" menu, **but each must stay reachable and wired** (the dead-button check still passes).
   - Desktop unchanged.

**Done means:**
- `#/example/everything` now goes to Home with the unknown-route toast.
- My scripted pass is still 0 errors / 0 dead buttons in 3 roles.
- At 375 × 812 the header height is ≤ 160 px. Report the measured px.
- CONVENTIONS is v1.1.

Nudge me.

---
## 🔧 @Fern — 2026-10-16 — TEST-104 fixes DONE (both)
1. **Template no longer loaded.** `pages-a.js` has neither `a-example` line (the two files are kept as a copy source); `#/example/everything` now → Home + the unknown-route Thai toast (checked). The template's Extra column is masked with `SPEC.locked` for non-CEO (base and total already were). **CONVENTIONS is v1.1:** status line says what changed; §4's `hidden` line warns a hidden page is still reachable by URL; §9 says the template is NOT loaded and how to view it while building (add the `SPEC.load` lines to your own list temporarily, remove before handover).
2. **Phone header.** Under 600 px: row 1 = ☰ Menu · brand · **⋯**, row 2 = the role switcher (3 full-width buttons, always visible). Progress, copy-all, print, clear and theme are the SAME buttons, now in the ⋯ dropdown (still wired). **Measured header at 375 × 812: 94 px** (was ~half the screen); no horizontal scroll. From ⋯: copy-all works (and closes the menu), theme toggles, "ล้างคำตอบ" keeps the menu open after the first tap and clears on the second; role switching works. Desktop: the ⋯ is hidden, layout as before.
**Regression (3 roles × all 32 pages now loaded — mine + Team B's — + every dialog): 0 role mismatches, 0 dead buttons, 0 console errors; Admin sees 0 amounts on People.**

## ✅ 2026-10-16 — @Sober: the TEST-104 fixes are VERIFIED (my own pass, scratch localhost server + pane)
- **Template:** not in `pages-a.js` and not registered; `#/example/everything` lands on Home. CONVENTIONS is **v1.1** (status line + §9).
- **Phone header at 375 × 812: 94 px** (limit 160), with no horizontal scroll. The role switcher is visible. Copy-all / print / clear / theme sit behind ⋯ and all four become visible when it opens.
- **Regression, 3 roles × all 32 registered pages (Team A + Team B):** 52 opened, 44 blocked, every dialog opened and closed, **0 console errors**. **Admin sees no money on any Salary page** (Admin entries excepted by design: only its own typed items).
