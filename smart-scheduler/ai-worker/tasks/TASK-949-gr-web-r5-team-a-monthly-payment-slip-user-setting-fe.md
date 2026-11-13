# TASK-949 — FE: GR web round 5 (Team A) — Monthly Payment · Payment Detail layout · User Setting per-menu access — @Fern (Team A)

**From @Sober, 2026-11-11.** Source: ขวัญ verbatim `project-docs/customer-2026-11-11-line-som-system/khwan-backoffice-feedback-2026-11-11-VERBATIM.md` (#2, #5, #10, l.8/l.17) + Porter 2026-11-11 19:14. Whole round's split: `PLAN-2026-11-11-gr-round5-split.md`. Repo `SOM-BALANCE-Backoffice-spec/final-ui` (mock only, not a git repo — no git). Your files only: `pages/a/salary/{PayRun,Slip,SlipView}.tsx`, `pages/a/frontoffice/UserSetting.tsx`, `pages/a/index.ts` (titles), `mock/a-*`.

## The shell seam (done by Sober — build against it, don't change it)
- `useMenuGrants()` from `@/shell` → `{ groups, has(username, route), set(username, route, on), setGroup(username, group, on) }`. `groups` = the tickable menu pages **in menu order**: `[{ group, label, items: [{ route, title }] }]` (use `label` — it shows "REPORT", not "REPORTS").
- **Never tickable (CEO-only):** Monthly Payment, Payment Detail, Payment Setting, Salary Report, Daily Training Report, User Setting — they are simply not in `groups`, and `set` ignores them.
- Defaults = what each admin sees today (Khwan also every REVENUE page, from round 4). `useRevenueAccess()` still exists only so your round-4 code builds — **replace it with `useMenuGrants()`** in this TASK.
- Also in the shell now (not yours): menu order (#1), "REPORT" label (#3), foldable groups.

## Your slice
1. **#2** `pages/a/index.ts` `/salary/payrun` title "Pay run" → **"Monthly Payment"**; PayRun page title "Pay run · Monthly overview" → **"Monthly Payment"**; any other "Pay run" label on your pages (e.g. "Back to Pay run") → "Monthly Payment".
2. **#5 Payment Detail:** "Add an Other ± line" → **"Add an Other ±"**; the fields stack **vertically** (Reason, then Amount — not side by side); **"Negative = a deduction" under the Amount field**; the whole add block moves **under the Other ± lines** (her l.32–34).
3. **#10 User Setting:** remove the intro paragraph ("Who can sign in … stays in the list."); "Actions" → **"Action"**; "Admit a login" → **"Accept Login"**, and remove the dialog's intro text ("Admit someone who … stored here."); "Front-office username" → **"Front-office Username"**.
4. ⏸️ **HELD (Porter 2026-11-11 19:18 — owner decides first, it's 9–10 d of real code): do NOT build the per-menu modal.** Instead keep the **round-4 single switch** (`useRevenueAccess()` — still works, unchanged behaviour) and rename its column **"Can see Revenue" → "Revenue Visible"** (her #10). The text below stays for when the hold lifts:
   **(B) per-menu access** — replaces the round-4 Revenue switch:
   - Column **"Menu Access"** `PENDING (Porter)`: CEO row "All" · coach rows "—" · admin rows a short summary ("12 of 18 menus") + an **Edit** button.
   - Edit → modal **"Menu access — <Name>"**: one section per `groups[]` entry, a group checkbox (checked / indeterminate / empty → `setGroup`) and a checkbox per page (`set`). Changes apply at once (no Save); toast "<Name>: <menu> on/off".
   - A deactivated admin: Edit disabled (her ticks are kept).
   - Her example to prove it (l.8): Refund for one admin, Type and Category for another.

## Done = (evidence in `## Implementation Notes`)
tsc 0 · `vite build` OK (scratch outDir) · Thai-scan clean on your files · **headless click-through, covering my shell too** (I cannot open a browser here):
1. As CEO the menu groups read **SALARY · REVENUE · STOCK · PROPOSED · NOTIFICATION · SETTING · REPORT** (REPORT last, labelled "REPORT").
2. Click a group heading → it folds; reload → still folded; click → unfolds. The icon-only sidebar still shows every item.
3. **Defaults unchanged:** Admin (Khwan) sees REVENUE, Admin (Kung) doesn't; both keep their usual admin pages; admin still sees Proposed card 6 (Stock Report filters).
4. ⏸️ (held with item 4) — instead: as CEO turn Kung's **"Revenue Visible"** switch ON → Admin (Kung) sees all of REVENUE; OFF → gone (round-4 behaviour, still through my new seam).
5. ⏸️ (held with item 4).
6. #2 / #5 / #10 words and layout; 375px no horizontal overflow; **0 console errors**.
Report file:line changes + 2–3 screenshots (User Setting, the modal, Payment Detail). No git.

## Claim
final-ui Team A files above. **Sober reviews.** Questions → `## Questions` below.

## Questions / Implementation Notes / Review
_(—)_

## Review (Sober, 2026-11-11) — 🔁 REWORK (one item) · the rest ✅
**Where your notes are:** they landed in a misnamed file, `tasks/TASK-949-gr-web-r5-monthly-payment-detail-user-setting-fe.md` (19:26), not in this TASK — so the 19:23 amendment above (item 4 HELD) was never in front of you. Please move your notes into this file under `## Implementation Notes` and delete the stray copy (your own content).
**✅ Accepted:** #2 Monthly Payment (`index.ts:28`, `PayRun.tsx:71`, Slip labels) · #5 Payment Detail (`Slip.tsx:98-125` + `SlipView.tsx` `afterOther` slot :22/:110/:113 — rendered evidence `fui-r5-3-slip.png`: block under Other ±, Reason over Amount, note under Amount) · #10 words + «Accept Login» · your ~55-check run of my shell (order, REPORT, fold + reload, defaults, never-tickable). Good work.
**🔁 REWORK — item 4 is HELD (Porter 19:18, owner decides):** keep your Menu Access code, but gate it off: `const MENU_ACCESS_HELD = true;` in `UserSetting.tsx`. When true → column **"Revenue Visible"** with the round-4 switch (`useRevenueAccess()`: CEO «Always», coach «—», admin Switch, disabled when deactivated); when false → your Menu Access column + modal, unchanged. Re-run checks 1–3 + 6 with the flag true, plus: CEO turns Kung's "Revenue Visible" ON → Admin (Kung) sees all of REVENUE; OFF → gone.
**➕ Add the icon-only sidebar check:** at a viewport ≥ 1024px click `[aria-label="Collapse menu"]`; every menu item's icon is shown (a folded group too); expand again.
**Shell nit (mine, fixed):** group headings rendered as grey button pills — `Layout.tsx` now `border-0 bg-transparent`; your next screenshot should show flat headings.
**Not yours:** `Daily.tsx:26` «Back to Pay run» / `Entries.tsx:33` «Open Pay run» are Fanta's — I've passed them to Porter.
Security review: none — mock-only prototype, no real auth or data.

## Implementation Notes (Fern, 2026-11-11, after your review — rework done)
Stray file `TASK-949-gr-web-r5-monthly-payment-detail-user-setting-fe.md` deleted (my own); its content is here. Sorry for the misnamed file — I globbed the wrong name; the amendment reached me only after I had built the modal.
**Rework — item 4 gated:** `pages/a/frontoffice/UserSetting.tsx:15` `const MENU_ACCESS_HELD = true;`. true → column **«Revenue Visible»** with the round-4 switch via `useRevenueAccess()` (CEO «Always» · coach «—» · admin Switch, disabled when deactivated; toasts «Kung can now see Revenue» / «… can no longer see Revenue») · false → **«Menu Access»** column («All» · «—» · «N of M menus» + Edit, Edit disabled when deactivated) + modal «Menu access — <Name>» (group checkbox checked/indeterminate/empty → `setGroup`, a checkbox per page → `set`, applies at once, toast «<Name>: <menu> on/off»), unchanged from what you accepted. Hooks for both are always called (no conditional hooks); the modal's `opened` is `!MENU_ACCESS_HELD && editing`. Flip the one constant when the hold lifts.
**Files / lines (all mine):** `pages/a/index.ts:28` title «Monthly Payment» (edited with Edit only; Fanta's `/salary/entries` line left as found) · `pages/a/salary/PayRun.tsx:71` · `pages/a/salary/Slip.tsx` (labels; add block `afterOther` :98-125) · `pages/a/salary/SlipView.tsx` (`afterOther` slot :22, :110, :113) · `pages/a/frontoffice/UserSetting.tsx` (#10 words; `MENU_ACCESS_HELD` :15; hooks :26-45; header :129; cells :148-170; modal ~:250). No git.
**Proof (final state, flag = true):** tsc 0 · vite build OK (scratch outDir) · Thai-scan 0 on my files · headless **30 checks, 0 FAIL**, through the real «Viewing as» dropdown: (1) groups SALARY · REVENUE · STOCK · PROPOSED · NOTIFICATION · SETTING · REPORT · (2) fold → reload still folded → unfold · (3) defaults unchanged (Khwan sees REVENUE, Kung doesn't; both keep Employee/Other Income/Proposed card 6) · (4) as CEO Kung's «Revenue Visible» ON → Admin (Kung) sees all of REVENUE (Refund, Type and Category …); OFF → gone; survives reload; no Edit button/modal while held · #2/#5/#10 words+layout · **icon-only sidebar** (click `[aria-label="Collapse menu"]` at 1440px, a folded group included): every item still has its icon; expand again works · 375px no overflow on Payment Detail, User Setting, Monthly Payment · 0 console errors/warnings. **Flag = false** was also run once (temporarily flipped, then restored to true): 47 checks incl. Kung=Refund only / Khwan=Type and Category only, never-tickable pages absent, modal words — all pass; the one «FAIL» is my Thai-scan on the Payment Detail page, which is the invented child nicknames «น้อง…» of the shared mock (CONVENTIONS §2.8), not my files.
**Screenshots:** `tests/evidence/task-949-fern/fui-r5-1-users.png` (User Setting, «Revenue Visible»), `fui-r5-3-slip.png` (Payment Detail), `fui-r5-4-collapsed.png` (icon-only sidebar). Taken after your Layout.tsx heading fix — please check the headings read flat. No modal shot (held).

## Review 2 (Sober, 2026-11-11) — ✅ DONE
Rework verified: `UserSetting.tsx:15` `MENU_ACCESS_HELD = true`; header :129 and cells :148/:154 switch on it; modal :250 `opened={!MENU_ACCESS_HELD && …}`; hooks always called. Rendered: `fui-r5-1-users.png` («Revenue Visible» switch, «Accept Login», «Action», no intro; flat group headings = my Layout fix rendered) · `fui-r5-4-collapsed.png` (icon-only sidebar, every icon; group order ends REPORT). Headless 30/0 (flag true) + 47 (flag false, restored). Stray file merged/deleted (first-pass notes condensed into the final-state notes — acceptable). Security review: none (mock-only).
