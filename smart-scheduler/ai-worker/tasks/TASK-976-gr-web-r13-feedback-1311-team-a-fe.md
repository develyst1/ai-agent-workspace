# TASK-976 — FE: GR web round 13 — ขวัญ's Feedback 13/11, Team A part — @Fern

**From @Sober, 2026-11-13.** Source: `REQUEST-porter-to-sober-2026-11-13-gr-round-13-feedback-1311.md` (items 1, 12, 13). Her verbatim: `project-docs/customer-2026-11-13-line-som-system/khwan-backoffice-feedback-2026-11-13-VERBATIM.md`.
Repo `SOM-BALANCE-Backoffice-spec/final-ui`, mock only, no git. Teams B (Fanta) and C (Flash) get their own items through Porter in the same round; this TASK is Team A's only.

## 1. PayRun («Monthly Payment»): Base Salary and Net Total closer to the left, even rows [customer-asked, item 1]
`a/salary/PayRun.tsx` l.170–178. Today the table stretches the full width, so the two money columns sit far right, away from Coach.
- Give the columns **fixed shares** (`layout="fixed"` + `w=` on each `Th`), the same way People balances its table (`People.tsx` l.34). Suggested split: Coach 30% · Base Salary 18% · Net Total 18% · Status 16% · Action 18%.
- **Numbers stay right-aligned inside their own column** (RULE-2026-11-12 rule 1). The narrower columns are what bring them closer to the name.
- Even row height: keep `verticalSpacing="sm"`, and make sure no cell wraps at 1280 (`nowrap` on the money cells).
- **Labels in title case:** «Base salary» → **«Base Salary»**, «Net total» → **«Net Total»**. Apply it in this file and in `a/salary/SlipView.tsx` l.120 («Net total (…)» → «Net Total (…)»). Team B does the same in People / Person.

## 2. User Setting: «menus» → «menu» [customer-asked, item 13]
`a/frontoffice/UserSetting.tsx` l.157: `{n} of {total} menus` → `{n} of {total} menu`. Her words: «menus ไม่มี S». Only this string changes.

## 3. Notification Setting: «where do I edit who receives what?» [item 12: a question, plus one line]
⚠️ **The answer and build line below are superseded by § Review (Sober, REWORK), F-075.** ~~**Answer (for Porter, [SA-decided]):** it is not edited anywhere, by design. Notification Setting is a **read-only** list (TASK-914, ruling C-h, `NotifySettings.tsx` l.6–9): who receives each type follows the person's **role**, and nobody opts out. To change who gets something, change that person's role/menus in **User Setting**. A per-person on/off would be a new decision for the owner; it is not proposed here.~~
**Build:** one dimmed line under the page title: *«Who receives each notification follows their role. To change it, change the person's role in User Setting.»* If the viewer can open User Setting (`canOpen`), «User Setting» is a link to it; otherwise it is plain text. No other change.

**Files (closed list):** `a/salary/PayRun.tsx` · `a/salary/SlipView.tsx` · `a/frontoffice/UserSetting.tsx` · `a/notify/NotifySettings.tsx`. Nothing else.

## Done =
- `npx --yes --package typescript@5.6.3 tsc --noEmit` → 0 · `npm run build` OK · 0 `ta="center"` · English only.
- Headless as CEO:
  - PayRun at 1280: Base Salary and Net Total header lefts are within 45% of the table width (paste the measured x); numeric `th`/`td` compute `text-align: right`; no wrapped cell; 375 px: no page overflow.
  - The labels read «Base Salary», «Net Total» (PayRun), «Net Total (…)» (SlipView).
  - User Setting reads «… of … menu».
  - Notification Setting shows the line; as CEO the link opens User Setting.
  - 0 console errors.
- Screenshots: PayRun at 1280 and at 375; Notification Setting at 1280.

**Sober reviews → round-13 build (with B and C) → Otto → Tanya via Porter.**

## Questions
_(—)_

## Implementation Notes

## Review

### Fern, 2026-11-13 (Implementation Notes)
Four files, as listed: `PayRun.tsx`, `SlipView.tsx`, `UserSetting.tsx`, `NotifySettings.tsx`.
- **PayRun:** `tableLayout: fixed` + `w=` on each Th. **I changed your suggested split**: Coach 24% · Base Salary 17% · Net Total 17% · Status 16% · Action 26%. Reason: with 30/18 the Net Total column *starts* at 48%, so the «within 45%» check cannot pass. Now Base starts at 24.0% (x=226 of 942 px) and Net at 41.0% (x=386). Numbers stay right-aligned (th and td computed `right`), money cells `nowrap`, `verticalSpacing="sm"` kept; 6 rows all 51 px, no wrapped cell. Labels «Base Salary» · «Net Total». SlipView «Net Total (…)».
- **User Setting:** `N of M menu` (Kung: «11 of 18 menu»).
- **Notification Setting:** dimmed line under the title, exact words; «User Setting» is a link when `canOpen("/frontoffice/coach-login")` (CEO: opens User Setting), plain text otherwise (Kung, with Notification Setting ticked: plain text, line still shown).
- `tsc` 5.6.3 → 0 · `vite build` OK · 0 `ta="center"` · English only. Headless `fui-976.mjs`: all PASS, 0 console errors, 375 px no page overflow.
- Screenshots `tests/evidence/task-976-fern/`: `fui-976-1-payrun-1280.png`, `-2-payrun-375.png`, `-3-notification-setting-1280.png`.
- No git. unhandled-between-tests: 0.

### Sober, 2026-11-13: 🔁 REWORK (one line; my error, not Fern's)
- Re-run: tsc 5.6.3 → 0 · 0 `ta="center"` · `MENU_ACCESS_HELD = false`.
- **Accepted:**
  - PayRun: in the 1280 screenshot, Base Salary / Net Total sit at ~24% / ~41% and are right-aligned, with Total under its column.
  - Your 24/17/17/16/26 split is accepted. My 30/18 split could not meet my own 45% check; good catch.
  - SlipView «Net Total (…)» ✓. User Setting «menu» ✓.
- **REWORK, Notification Setting line only.** My §3 answer was wrong (F-075). Real recipients are a stored list, by role **or by named person** (backoffice-back `notification.service.ts` l.25–33), and User Setting does not change it. Replace the line, with no link and nothing else on the page, by exactly:
  *«This list is set up by the SOM BALANCE team. To change who receives a notification, ask the team.»*
- Done = tsc 0 · the new line in the screenshot at 1280 · 0 console errors. Then back to me.

### Fern, 2026-11-13 — rework done (Notification Setting line only)
`NotifySettings.tsx`: the line is now exactly «This list is set up by the SOM BALANCE team. To change who receives a notification, ask the team.» No link; the unused `Anchor` import removed; nothing else changed (header button gated by `canOpen` stays). `tsc` 5.6.3 → 0 · build OK · headless: exact text PASS, no link PASS, 0 console errors. Screenshot replaced: `tests/evidence/task-976-fern/fui-976-3-notification-setting-1280.png`. No git. unhandled-between-tests: 0.

### Sober, 2026-11-13: ✅ DONE
- Re-run: tsc 5.6.3 → 0. `NotifySettings.tsx` l.26 reads the exact line, no link. Everything else in the first pass was already accepted.
- Security review: none (mock only).
- Waits for Team B (TASK-978) and Team C before the round-13 build.
- **Round 13 built (A 976 · B 978 · C 977 + Amd 1):** tsc 0 · 0 `ta="center"` · `MENU_ACCESS_HELD = false` · audit-align 60/0 (my run on the build) · md5 `15c265e1ce4aff6afe40675a52ce0bb5` (1,312,386 B). → Otto.
- **Round 13 LIVE:** Otto release `20261113-085526`, live md5 `15c265e1ce4aff6afe40675a52ce0bb5` = my build; curl → 401 (mine, and Otto 5/5); previous `20261112-162516` kept. → Porter → Tanya.
- **Round 13b built (TASK-978 Amd 1 + TASK-977 Amd 2, both reviewed by their SAs):** tsc 0 · 0 `ta="center"` · `MENU_ACCESS_HELD = false` · audit-align 60/0 · md5 `f12833e4e85a4c300d61006e21af736f` (1,312,704 B). → Otto.
- **Round 13b LIVE:** Otto release `20261113-091125`, live md5 `f12833e4e85a4c300d61006e21af736f` = my build; curl → 401 (mine, and Otto 5/5); previous `20261113-085526` kept. → Porter → Tanya.
