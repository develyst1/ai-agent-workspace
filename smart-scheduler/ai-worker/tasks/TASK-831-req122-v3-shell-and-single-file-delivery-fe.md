# TASK-831 — FE: **REQ-122 v3 — the SHELL v3 + the single-file delivery** — @Fern, ≈ 1.1 d incl. +10%
**From @Sober, 2026-10-21.** Brief: REQ-122 **§8** (+ §7.1–§7.4 words, REQ-120 §9 rulings). Repo: the spec folder (logical name `som-balance-backoffice-spec`; the path is in `machine.local.md`). Plain HTML/JS, **no money, no prices anywhere; an admin view never shows pay.** ⏳ **Waits for @Porter's GO + claims.**
**Goes FIRST:** Silver's Team B pages build on this. Publish the contract (CONVENTIONS v3) before anyone restyles a page.

## Do
1. **The new answer key:** `somspec.v1` → **`somspec.v3`**. Every page starts unanswered. Old answers are NOT migrated or read.
   - The export / copy-all lists **every** registered page (32 + any new), in menu order. Unanswered pages are marked as such.
2. **The brand:** the top title is **SOM BALANCE / SOM BACK OFFICE**.
3. **The menu:**
   - headings in **ALL CAPS** (SALARY · NOTIFICATION · SETTING …; "Front office changes" → **SETTING**);
   - a separate group, clearly titled **FRONT OFFICE (SOM SCHEDULE)**, holds every front-office page.
4. **The front-office label:** one shell helper replaces the grey "Scheduling app › …" bar (`.bar2`) with a plain label **"หน้าบ้าน (SOM SCHEDULE)"**, the same on every front-office page.
   - The aim: she sees at a glance which screens live in the front office, and that nothing is done twice.
5. **One date helper:** dd/mm/yy with the year (**16/10/26**). Every page uses it; there is no hand-typed date.
6. **One month picker** component, for Salary (and Revenue if Silver wants it).
7. **The A/B question slot inside the [?] popup:** a page declares `ask: { q, a, b }`, and the answer is stored and exported with the page's ✓/✗.
   - Used for REQ-122 §8.5's 4 follow-ups (all four sit on Team B pages; the slot is the shell's).
   - If she answers in LINE first, the page drops its ask and shows the answer.
8. **The delivery: ONE self-contained `.html`** (my decision, below).
   - A build script (e.g. `build/single.mjs`, node, no new dependencies) inlines `shell/*.css`, `shell/*.js`, `pages-a.js` / `pages-b.js`, every `SPEC.load`-ed file in load order, and every `help/*.png` as a data URI.
   - It writes `dist/SOM-BACK-OFFICE-v3.html`.
   - **The check:** open the built file **directly from disk**, with the source folder renamed away. Every page renders, every [?] image shows, 0 console errors, answers save and export.
9. **CONVENTIONS v3:** the new key, the menu groups, the front-office label helper, the date helper, the month picker, the ask slot, and the build. Tell Silver by `inbox/SA-B.md` via me.

**Why one .html:** v2's zip failed because pages opened inside the zip came up blank. One file has nothing to extract and nothing relative to resolve.
- The 32 help PNGs are 2.8 MB, about 3.8 MB inlined: fine for LINE and a browser.
- The zip fallback is not needed.

## Done means
- The built file passes the from-disk check, in Chrome and Edge.
- Every page × 3 roles: 0 errors · 0 dead buttons · Admin sees no pay.
- The export lists every page.
- The CONVENTIONS v3 diff.

---
## ✅ 2026-10-21 — GO (@Porter). Claims granted as listed. Two changes to the brief above
- **The ask slot takes a LIST:** `ask: [{ q, a, b }, …]` (≥ 2 per page; STOCK OUT needs two). Each question is stored and exported on its own, with the page's ✓/✗.
- **The delivery proof** states the built file's **size**.
- **Publish CONVENTIONS v3** as soon as the shell is stable, and tell me: I forward it to Silver. **Jason builds TASK-833 in parallel** and switches to your label helper / menu group as soon as they exist: give him the helper's name early (`inbox/SA.md` → I relay).

---
## 🔀 2026-10-21 — Routing correction (@Porter): SA → SA is not a channel
- **The shell contract is published ONLY in `CONVENTIONS.md` (v3)**, including `ask` as a LIST. Silver builds on the file.
- When it is stable, @Fern tells me; I tell @Porter. Anything to agree with Team B goes through Porter.
- **Already agreed by Silver (via Porter):**
  - the b-fo hand-over;
  - she uses your date helper + month picker;
  - the single-file rules (`SPEC.load` only, `help/<name>.png`).

---
## FE report — Fern, 2026-10-21 — TASK-831 DONE (shell v3 + single file). Spec folder only; the front repo is untouched since TASK-830
**Files (spec folder `som-balance-backoffice-spec`; it is not a git repo, so no `git status`):** modified `shell/core.js`, `shell/ui.js`, `shell/feedback.js`, `shell/styles.css` (+6 lines), `index.html` (title only), `CONVENTIONS.md`; new `build/single.mjs`, `dist/SOM-BACK-OFFICE-v3.html`. No page file touched. `unhandled-between-tests: n/a` (no unit tests in this folder).
**What it does (brief items 1–9)**
1. Key `somspec.v1` → **`somspec.v3`**; old answers not read. Export lists all registered pages in menu order (32 now), unanswered = `ยังไม่ตอบ`.
2. Brand: **SOM BALANCE / SOM BACK OFFICE** (sidebar, `<title>`, export header).
3. Menu: ALL CAPS via `SPEC.groupOf(page)` (SALARY · NOTIFICATION · REVENUE · STOCK · REPORTS); front-office pages = their own group **FRONT OFFICE (SOM SCHEDULE)**.
4. Front-office label: `SPEC.FO_LABEL` = "หน้าบ้าน (SOM SCHEDULE)"; the shell rewrites every `.screen .bar2` of a front-office page after render (so all 8 existing FO screens already show it, no page edited); `SPEC.foLabel()` for new screens.
5. Date helper `SPEC.date(v)` → `16/10/26` (also used by the export stamp).
6. Month picker `SPEC.monthPicker(el, { value:"2026-10", onChange })` → `{get,set}`.
7. Ask slot is a **LIST** `help.ask: [{q,a,b}, …]`; each question stored under `<route>~<i>` and exported on its own line; `answer:"A|B"` = answered in LINE (shows the answer, no radios, no red dot, export marks it). Legacy single `{id,q,options}` still works (the two existing FO pages).
8. `node build/single.mjs` → **`dist/SOM-BACK-OFFICE-v3.html`, 4,035,929 bytes (3.82 MB)**; 41 script files inlined in load order, 32 help PNGs as data URIs, via `SPEC.assetSrc()`.
9. CONVENTIONS v3: new **§00** + two edited lines (§1, §8).
**Proof (from disk, source out of the picture):** the built file copied alone to an empty scratchpad folder, opened by `file://` in **headless Edge and headless Chrome** (own CDP script, scratchpad `cdp-check.mjs`): 0 errors on load; all **32 pages × 3 roles = 96** renders: 0 dead buttons; all **32 [?] images show** (0 placeholders); ✓ saved to `somspec.v3` and the export lists **32** pages; `SPEC.date` → `16/10/26`; month picker steps 2026-12 → 2027-01 → 2026-12; ask list: 3 questions, one LINE-answered, export lines correct. No `src=`/relative `href=` to a file remain in the built html.
**Say-so items (please read)**
- **SETTING:** I did not know which pages sit under SETTING. The legacy `menu:"Front office changes"` now goes to the FRONT OFFICE group (every page in it is front-office); a page that belongs under SETTING writes `menu:"Setting"`. One line in `groupOf` if you want it differently.
- **Fonts:** the built file still links Google Fonts (the only external call); offline it falls back to a system font with no console error. Say if you want the font embedded (needs a download I have not made).
- **Not checked by a human eye:** I read DOM/console numbers, not screenshots; the label colour (blue tint) and month picker look are unreviewed.
- **Admin ฿ scan (existing pages, NOT mine):** an admin sees "฿" on `#/salary/entries`, `#/fo/payment`, `#/stock/products`, `#/stock/import`, `#/stock/sales-record` — for 832/834 and Team B to check against "an admin never sees pay / no prices".
- **Silver is editing in parallel:** my last Edge run showed `ceo #/revenue/categories` throwing (`undefined.map`) right after a `data/b-revenue.js` change by Team B (the earlier run was clean). Not my files; Silver should recheck.
**Helper names for Jason (TASK-833):** menu group → `fo: true` (or legacy string); label → `SPEC.foLabel()` / `SPEC.FO_LABEL`; date → `SPEC.date(v)`; month → `SPEC.monthPicker`. CONVENTIONS v3 is published in the spec folder → ready for Silver via you.

## ✅ 2026-10-21 — @Sober: TASK-831 VERIFIED (shell v3 + one self-contained .html)
- **The built file** `dist/SOM-BACK-OFFICE-v3.html`: **4,035,929 bytes (3.85 MB)**, md5 `b8c47e36…`. I copied it ALONE into an empty folder and served it there, so no source file existed next to it:
  - **0 load errors from the shell.** The only network call is Google Fonts (offline it falls back to a system font).
  - **32 pages; 52 role-allowed renders × 3 roles: 0 dead buttons.**
  - **32 / 32 [?] images resolve** from inside the file.
  - Answers save under **`somspec.v3`** only. The export lists all 32 pages, starting "SOM BALANCE / SOM BACK OFFICE", with the date 21/10/26.
  - `SPEC.date` → 16/10/26.
  - Menu groups: SALARY · NOTIFICATION · FRONT OFFICE (SOM SCHEDULE) · REVENUE · STOCK · REPORTS.
  - The only remaining relative `src=` / `href=` are inside JS strings (runtime routes / data URIs).
- **One page error, NOT Team A's:** `#/revenue/categories` throws `undefined.map`, after Team B's in-progress `data/b-revenue.js` change. It was baked into this build → to @Porter for Team B. **The release build is re-made at the end anyway.**

## ⚖️ @Sober on Fern's say-so items
1. **SETTING:** her word stands. **The menu group of the front-office pages is headed `SETTING`**, exactly as §7.1 says ("Front office changes" → SETTING).
   - "FRONT OFFICE (SOM SCHEDULE)" as a heading is our own invention. §8.4's "clearly labelled" is met by the "หน้าบ้าน (SOM SCHEDULE)" label on every one of those pages.
   - **Change:** one line in `groupOf`, the heading → `SETTING`. Fern does it inside TASK-832 (no new words). Told to Porter, who may overrule.
2. **Fonts:** leave as is. The offline fallback is clean, and no download is needed.
3. **An admin sees ฿ on 5 pages** (confirmed by me):
   - `#/salary/entries` → **TASK-832**: an admin never sees pay;
   - `#/fo/payment` → **TASK-834**: no money/prices;
   - `#/stock/products` · `#/stock/import` · `#/stock/sales-record` are Team B's → to @Porter.
4. **The visual look** (label colour, month picker): Tanya's TEST-115 eye.
