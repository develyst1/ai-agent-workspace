# TASK-810 — FE: **clickable spec v2: the REAL-product look + the [?] tutorial popup + `CONVENTIONS` v2** (REQ-122 §5) — @Fern (M ≈ 2.8 d incl. +10 percent)
**From @Sober to @Fern, 2026-10-16.** Source: `requirements/REQ-122-…` **§5** (the owner's words: *"ทำเป็น UI ที่เหมาะ จริงๆ อย่างเดียว … ปุ่ม [?] … popup แนบรูป ชี้ๆ เหมือนtutorial … แก้ UI สวยๆเลย"*). **v1 is kept, not sent** (the owner has the clean v1 zip); v2 is built in the same folder.
**Design skill:** the global rule routes UI design to **`impeccable`**. Use it. The `requirement-hub` and `galaxy-spec` skills stay banned.

## 🔑 The one design constraint that does not move
**It is still plain HTML/CSS/JS that opens by double-click from a zip** (file://, no server, no build step, no `fetch`, no network except one Google Fonts stylesheet). **"Mantine look" means reproducing the look in our own CSS, not bringing Mantine/React in.**

## What "looks like the real product" means: copy these from `smart-scheduler-front` (read-only)
- **Theme** (`src/context/MantineProviders.tsx`):
  - primary **blue, shade 6**;
  - font **Noto Sans Thai**. Switch the one Google Fonts stylesheet from Sarabun to Noto Sans Thai, still a single stylesheet;
  - `defaultRadius: md`; **Card = radius lg + border + shadow sm**; the two shadows exactly as defined there; light scheme by default.
- **Frame:** `src/app/(admin)/layout.tsx` and the partials it uses. Copy the header, the left navbar, page title + actions, cards, tables, badges, tabs, inputs, buttons and modals: their spacing, sizes, borders and colours.
- **To compare by eye:** you may run the front locally on its own mocks (`NEXT_PUBLIC_USE_MOCK=true`, dev server on localhost). Never against sid/uat. Never edit that repo.

## Build (shell + CONVENTIONS only; your pages are TASK-811)
1. **The look:**
   - new tokens + component classes in `shell/styles.css` mirroring the real front: an app-shell header + navbar, page header (title left, actions right), card, table, badge, tabs, buttons (filled / light / subtle), inputs, modal, toast like Mantine's notification top-right;
   - dark mode kept (Mantine's dark palette); phone width kept (header ≤ 160 px at 375 × 812, as TEST-104).
2. **Remove from page bodies:** the Thai side panel and the inline ✓/✗ + note box. **The page body is the real UI only**: no explanation text.
3. **Demo controls, small:** a compact **"Viewing as: CEO / Admin / Coach"** control in the header; copy-all / print / reset stay behind ⋯.
4. **The [?] button**, top-right of every page title, opens the **tutorial popup**:
   - **the page's screenshot** `help/<route-slug>.png` (Tanya captures it later), loaded with `<img>`. **Until it exists, show a neat placeholder** ("ภาพประกอบกำลังจัดทำ"); never a broken-image icon;
   - **numbered pins** as an **HTML overlay at %-coordinates** (`{ n, x, y }`, optional box `{ w, h }`). Not drawn into the PNG;
   - **numbered Thai steps** matching the pins ("① กดตรงนี้เพื่อ…");
   - **at the bottom:** the page's ✓ ครบ / ✗ ไม่ครบ + note (same storage key as v1 so nothing is lost) **and the page's A/B question** when it has one;
   - **a small dot on [?]** while that page's question is unanswered;
   - **copy-all** still collects every page's answer + every A/B choice, in menu order.
5. **How a page declares its help without touching shell files:** one new optional field on `SPEC.page`:
   `help: { img: "help/salary-payrun.png", pins: [{ n: 1, x: 62, y: 18 }], steps: ["…", "…"], ask: { id, q, options } }`.
   - `th` (v1 side panel) becomes **unused**. Keep accepting it so Team B's v1 pages don't crash, and say it is deprecated.
   - `SPEC.ask` inside a body is **replaced by `help.ask`**; keep `SPEC.ask` working only so nothing crashes.
6. **Screenshot rules for Tanya, in CONVENTIONS:**
   - **one fixed desktop size**: you choose it (e.g. 1280 × 800) and write it down;
   - the role each page is captured in (default: the most privileged role that can open it);
   - light theme, ⋯ closed, no dialog open;
   - file name = route slug (`#/salary/payrun` → `help/salary-payrun.png`);
   - **≤ 150 KB each**.
7. **`CONVENTIONS.md` v2:** everything above, plus an updated complete example page (the template stays **not loaded**, as v1.1). Bump the status line to v2 and give the v1 → v2 changes in a short list so Team B can restyle without guessing.

## Order: Team B is waiting on you
**First (then nudge me):** `styles.css` with the new classes + the shell frame + the [?] popup working on the template page + CONVENTIONS v2. Team B restyles against that. **Then** TASK-811 (your 12 pages).

## 🚫 Not this task
Your page restyle and help steps (TASK-811); pins (TASK-812, after Tanya's captures); anything of Team B's; any product repo.

## ✅ Done means
- The template (loaded temporarily, then unloaded again) shows the new look, the [?] popup with the placeholder image, pins over it (use 2 test pins), steps, feedback, an A/B question, and the dot that clears once answered.
- Copy-all still includes v1 answers.
- 3 roles, desktop + 375 px: 0 console errors, 0 dead buttons. Header ≤ 160 px at 375.
- Report: what you copied from the real front (file:line for the tokens), the screenshot size you chose, header px.

---
## 📋 @Fern REPORT — 2026-10-16 — 🔨 TASK-810 STEP 1 IN (styles + frame + [?] popup + CONVENTIONS v2), Team B can restyle now
Design skill: **`impeccable`** (product register — the real front's system wins; no new palette).
**Copied from the real front (read-only), where:**
- **Theme** `src/context/MantineProviders.tsx:15-30` — `primaryColor "blue"`, `primaryShade 6` (**#228be6**), `fontFamily` Noto Sans Thai, `defaultRadius "md"` (8 px), the two `shadows` (**sm** `0 1px 3px rgba(15,23,42,.06), 0 1px 2px rgba(15,23,42,.04)` · **md** `0 4px 12px rgba(15,23,42,.08)`), `Card: shadow sm · radius lg (16 px) · withBorder`, light scheme default (`:44`). Font weights `400/500/600/700` from `src/app/layout.tsx:11-16` → the single Google Fonts sheet is now **Noto Sans Thai** (was Sarabun).
- **Tokens** `src/app/globals.css:11-23` (paper `#f5f7fb`, surface, fg `#1e293b`, the slate `muted-50…900` ramp) · `tailwind.config.ts:36-39` (success `#2f9e44`, warning `#e8a23d`, danger `#e03131`, secondary `#845ef7`).
- **Frame** `src/components/layout/AdminLayout/AdminLayout.tsx:14-31` (flex h-screen · sidebar · header · `main bg-paper p-4 sm:p-6`) · `Sidebar/Sidebar.tsx` (brand tile 40 px gradient, nav items `rounded-xl px-3 py-2.5 text-sm`, active = primary/10 tint, w-64, mobile = drawer + backdrop) · `Header/Header.tsx:41` (`h-16 border-b bg-surface/80 backdrop-blur px-4 sm:px-6`).
- Not copied on purpose: the real nav's 4-px left stripe on the active item (impeccable bans side stripes); I kept its tint + weight. Dark mode = Mantine's dark palette (the real front is light-only).
**Built:** `shell/styles.css` (rewritten: tokens, frame, buttons filled/light/subtle/default/danger, cards, tables, badges, tabs, inputs, alert, empty, modal, tutorial popup, Mantine-style top-right toast, drawer on ≤1023 px, header ≤600 px, print) · `shell/ui.js` (sidebar + header + **"Viewing as: CEO / Admin / Coach"** + ⋯ menu; page title row with `actions` and the **[?]**; popup = screenshot + HTML-overlay pins (%, optional highlight box) + numbered steps + the page's A/B question + ✓/✗ + note; red dot on [?] while the page's question is unanswered) · `shell/core.js` (`help`, `actions` validated; `th` deprecated but still used as steps; `SPEC.icon`, `SPEC.slug`, `SPEC.helpOf`) · `shell/feedback.js` (same storage key as v1) · `index.html` font · template page rewritten as the complete v2 example · **`CONVENTIONS.md` v2** (v1→v2 list in §0).
**Screenshot size chosen for Tanya: 1280 × 800**, light theme, ⋯ closed, no dialog, role = most privileged that can open the page, `help/<route-slug>.png`, PNG ≤ 150 KB.
**Checked (Browser pane, over localhost, scripted):** template loaded temporarily (then UNLOADED again — `pages-a.js` has no template line) shows the new look, [?] popup with **placeholder image + 2 test pins (one with a highlight box) + steps + A/B question + feedback**, **the dot is there before answering and gone after**; **33 pages × 3 roles: 0 role mismatches, 0 dead buttons, 0 console errors, no side panel left anywhere, [?] opens on all 33** (Team B's v1 pages already pick up the new look through the old class names, and show their `th` as the steps); copy-all still carries v1 answers + A/B choices in menu order; **375 × 812: header 56 px** (limit 160), role control visible, drawer opens, ⋯ works, popup stacks to one column, no horizontal scroll. Safety: no fade/transition that could freeze mid-frame in a headless capture.
⚠️ Still unproven here: double-click from a zip (file://), real print, real clipboard. **BALL: @Sober (tell Porter: Team B can restyle against CONVENTIONS v2). I start TASK-811 (my 12 pages) next.**

---
## ✅ 2026-10-16 — @Sober: TASK-810 step 1 VERIFIED. One shell defect to fix
**My own pass** (scratch localhost server + pane):
- **CONVENTIONS v2:** the §0 v1 → v2 list, §5 help (1280 × 800 · most privileged role · light · `help/<slug>.png` ≤ 150 KB) and an unchanged v1 API. **Accepted.**
- **Font:** Noto Sans Thai is the only Google Fonts sheet and is computed on the body. No fetch, XHR or modules.
- **3 roles × all 32 pages (Team A + B):** 52 opened, 44 blocked, **every open page has a [?] whose popup carries ✓/✗**, **0 console errors**, **Admin sees no money on any Salary page**.
- **Storage key still `somspec.v1`**, so v1 answers are kept.
- **Phone header 56 px** at 375, with no horizontal scroll.

**🔧 Defect (shell):** **a [?] help popup stays open when the route changes.**
- Repro: `#/salary/payrun` → [?] → browser Back. The URL is now `#/salary/people`, but the "Pay run" help popup is still on screen.
- **Fix:** the router closes every open shell popup and dialog on `hashchange`.
- Re-check: the same repro with Back, and with a menu click while a dialog is open.

Not blocking Team B: the API is unaffected.

---
## 🔧 @Fern — 2026-10-16 — Sober's shell fix DONE: a [?] popup / example dialog is closed on EVERY route change
`shell/ui.js` `route()` now calls `closeDialog()` first (so it also fires on a hash change, a nav click, a data-go, a role switch and a re-render). Checked by script: Pay run → [?] open → #/salary/people ⇒ no dialog; [?] open → role switch ⇒ none; an example dialog open → nav click to Pay run ⇒ none and the scroll lock (`has-dialog`) is released. No other change.

## ✅ 2026-10-16 — @Sober: the popup fix is VERIFIED. TASK-810 is fully VERIFIED
- A popup open on Pay run, then Back: closed.
- A popup open on Slip, then a move to Inbox: closed.
- A popup open on Inbox, then a role switch: closed.
- The body scroll lock is released.
- **Regression, 32 pages × 3 roles:** 52 opened / 44 blocked (unchanged), **0 console errors**.
