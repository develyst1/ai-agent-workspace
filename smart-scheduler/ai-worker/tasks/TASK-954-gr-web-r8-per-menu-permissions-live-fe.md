# TASK-954 — FE: GR web round 8 — per-menu admin permissions go LIVE (every menu) — @Fern (Team A)

**From @Sober, 2026-11-12.** Source: owner, via Porter 2026-11-12 ~19:30: *"หลังบ้าน เราให้feedbackแก้ฟรีจนถึง 17 ไม่ใช่เหรอ"* and *"งานข้อสามนี้ ไปทำGR ใช่มั้ย"*. Full brief: `REQUEST-porter-to-sober-2026-11-12-per-menu-permissions-free-on-gr.md`. GR-FEEDBACK-TO-CODE #21 changes from QUOTE to BUILD on the GR web; #26 (the 2-option quote) is superseded. ขวัญ's ask (LINE 2026-11-11 09:21 + 10:51): per-person permissions on **every menu**, like the front office.
Repo `SOM-BALANCE-Backoffice-spec/final-ui` (mock only, not a git repo, so no git). **Size ≈ 0.25 d.**

## Today (read 2026-11-12)
- The per-menu model is **already built** (round 5, TASK-949 item 4) and switched off by one flag.
  - `pages/a/frontoffice/UserSetting.tsx:15` `const MENU_ACCESS_HELD = true;`
  - `false` swaps the «Revenue Visible» switch column (l.129, 148–164) for «Menu Access» (`N of M menus` + Edit) and opens the «Menu access — <Name>» modal (l.250), with group checkboxes and one checkbox per menu.
- The rule lives in the shell and is mine, untouched: `shell/grants.ts`.
  - `canOpen` drives the menu, the page gate and the Home cards.
  - `NEVER_GRANTABLE` keeps the salary money pages (pay run, slips, pay settings, salary/daily reports) and the coach-login page CEO-only.
  - `defaultGrants` = what admins see today, plus Khwan's REVENUE pages (round 4).
- **Merit stays CEO-only, separate from the ticks:** it is a role check inside the pages (`Entries.tsx:12` Merit card, `People.tsx:46/73` column). Ticking «Other Income» or «People» for an admin must still show **no Merit**.

## Your files (closed list)
- `src/pages/a/frontoffice/UserSetting.tsx` only. Not yours: `src/shell/*` (mine; if the shell looks wrong, write it under `## Questions` and change nothing there).

## What to do
1. Set `MENU_ACCESS_HELD = false` and rewrite its doc comment (l.10–14): live since round 8, owner 2026-11-12.
2. Drop the dead round-4 branch **only if it is safe**. Otherwise keep the code and just flip the flag. The smallest diff wins.
   - Safe means: `useRevenueAccess`, the `setRevenue` handler and the Switch become unreachable, and nothing else in your file uses them.
   - Do not touch the `useRevenueAccess` export in the shell.
3. CEO row: the cell reads «All» (already in the false branch). Coach row: «—». No words, data or other behaviour change.

## Done = (evidence in `## Implementation Notes`)
- `npx --yes --package typescript@5.6.3 tsc --noEmit` → 0 · `vite build` (scratch outDir) OK · Thai scan: no new Thai · no `ta="center"` added.
- Headless, switching viewer through the real «Viewing as» dropdown:
  - **CEO** on User Setting: the column reads «Menu Access». Each admin row shows `N of M menus` and Edit. The modal lists the groups in `GROUP_ORDER` with no PROPOSED group and **no** NEVER_GRANTABLE page.
  - **Defaults unchanged:** with no ticks changed, each admin's menu equals today's (Khwan also has REVENUE). Paste the menu lists, before and after the flip.
  - **Untick → gone:** as CEO, untick one STOCK page for an admin, then switch to that admin. The page is gone from the menu **and** its URL shows NoAccess. Re-tick and it is back.
  - **Tick → appears:** tick a page that admins don't get by default (e.g. a REVENUE page for a non-Khwan admin). It appears for that admin.
  - **Merit:** tick «Other Income» and «People» for an admin → no Merit card, no Merit column.
  - 375 px: no horizontal overflow on User Setting and its modal · 0 console errors.
- Screenshots in `tests/evidence/task-954-fern/`: the User Setting table (CEO), the modal, and the admin's menu after an untick.

**Sober reviews, then I rebuild the single file. Round 8 → Otto → Tanya.** My rebuild gate changes from "`MENU_ACCESS_HELD = true`" to "`= false`". No git.

## Questions
_(—)_

## Implementation Notes
**Fern, 2026-11-12.** One file, `UserSetting.tsx`: `MENU_ACCESS_HELD = false` and the doc comment rewritten (live since round 8, owner 2026-11-12). **Kept** the dead round-4 branch (Switch, `setRevenue`, `useRevenueAccess`): smallest diff, and the flag still references them, so «drop only if safe» did not apply. CEO row «All», coach rows «—» (already the false branch). No words, data or other behaviour changed. Shell untouched.
- `tsc --noEmit` (5.6.3) → 0 · `vite build` (scratch outDir) OK · no Thai added · no `ta="center"` added.
- Headless (`fui-954.mjs`, viewer through the real «Viewing as» dropdown), all PASS, 0 console errors:
  - CEO: headers `Username|Role|Person|Status|Menu Access|Action`; khwan «17 of 19 menus», kung «11 of 19 menus», each with Edit; no Revenue switch.
  - Modal groups in order: SALARY · REVENUE · STOCK · NOTIFICATION · REPORTS (no PROPOSED, no SETTING); 19 pages; none of Payment Setting / Monthly Payment / Payment Detail / Daily Training Report / Salary Report / User Setting.
  - **Defaults unchanged**, menu lists before (flag true) and after (flag false) are identical:
    - Khwan: SALARY Employee, Other Income · REVENUE Summary, Detail, Add Manually, Refund, Type and Category, ECA Payment · STOCK Product, STOCK IN, Import from Excel, STOCK OUT, Stock Demo, Low Stock, Stock Report · PROPOSED Stock Report filters · NOTIFICATION Notification Alert · REPORT All Report.
    - Kung: the same without REVENUE.
  - **Untick → gone:** CEO unticks STOCK › Product for Kung (toast «Kung: Product off») → Kung's menu loses Product and `#/stock/products` shows NoAccess; re-tick → back and the menu equals the default again.
  - **Tick → appears:** CEO ticks REVENUE › Summary for Kung (no REVENUE by default) → Kung's menu gets REVENUE: Summary.
  - **Merit:** Other Income + Employee ticked for Kung → both open, no «Merit» text on either page; control: the CEO still sees Merit on Other Income.
  - 375 px: no horizontal overflow on User Setting and on the modal.
- Screenshots `tests/evidence/task-954-fern/`: `fui-954-1-user-setting.png` (CEO table), `-2-modal.png`, `-3-admin-menu-after-untick.png` (NoAccess), `-3b-admin-menu.png` (Kung's menu after the untick).
- Not mine, FYI: the modal lists «Bonus (Conversion)» and «Notification Setting» as tickable (unticked for both admins by default), which is the shell's `NEVER_GRANTABLE` decision, not changed.
- No git. unhandled-between-tests: 0.

## Review (Sober, 2026-11-12): ✅ DONE
- **Re-run:** tsc 5.6.3 → 0 · `UserSetting.tsx:15` `MENU_ACCESS_HELD = false` · 0 `ta="center"` in `src/pages`.
- **Screenshots:** `fui-954-2-modal.png` shows «Menu Access» with N of 19 + Edit per admin, CEO «All», coaches «—».
- **Notes accepted:** defaults identical before and after, untick → gone + NoAccess, tick → appears, no Merit. Keeping the round-4 branch was the right call (smallest diff).
- **Fern's FYI, acted on (my shell):** «Bonus (Conversion)» (`/proposed/conversion`, coach bonus money) was tickable. The brief says salary stays CEO-only, so I added it to `NEVER_GRANTABLE` (`shell/grants.ts:15-16`).
  - The modal now lists 18 pages: Khwan 17 of 18, Kung 11 of 18. Neither had it by default, so no default menu changes. [code read; Tanya sees it live]
  - «Notification Setting» stays tickable: it is not money.
- **Build:** md5 `0ba926f4635859c1dfa9d7d2c2fa9a52` (round 8).
- **Security review:** mock only, no auth code. The real per-menu model is the ≈ 9–10 d block from 14 Nov.
_(Sober)_
