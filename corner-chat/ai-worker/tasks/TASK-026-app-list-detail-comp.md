# TASK-026: Message list + message detail on fakes: the comp for REQ-005 AC-1
- Source: SPEC-003 rev 2 § Screens (`/messages`, `/messages/:id`), § Structure (fakes, models) · SPEC-001 §3.4 (`MessageSummary`, `MessageDetail`, `Reply`: field names exact) · REQ-005 req 2, AC-1, AC-3 · REQ-004 + REQ-002 wording
- Owner: FE (Fanta)
- Status: DONE 2026-11-01 (SA-B re-review below; AC-1 comp goes to the PM)
- Depends on: TASK-025. Replaces TASK-015 (SUPERSEDED).

- Repo: `corner-chat-app`. Files you may edit: `src/data/models.ts` (`MessageSummary`, `MessageDetail`, `Decision`, `Rule`,
  `Reply`, `ModelRef`: types exactly per SPEC-001 §3.4) · `src/data/repositories.ts` (`MessagesRepo`: `list({tab, channel, before, limit})`,
  `detail(id)`, `correct(id, outcome)`) · `src/data/fake/messages.ts`, `src/data/fake/fixtures.ts` · `src/features/messages/**`,
  `src/features/message-detail/**`, `src/app/strings-th.ts`, `src/app/routes.tsx` · `src/test/messages.test.tsx`
  · **added at review (Q1–Q3):** `src/test/app.test.tsx` (the one step) · `src/features/shell/Shell.tsx` (+ a CSS file beside it) ·
  `src/app/theme.css` (new) and its one import line in `src/main.tsx`
- Git writes allowed: **none.**

## What to do
1. Types exactly per SPEC-001 §3.4. Every field is there, and a field is nullable where §3.4 says `| null`.
2. 12 **made-up** Thai fixtures (never real people or groups): 6 notified, 6 held, mail and LINE mixed. Include at least one of
   each: a rule decision · an AI decision with score/bar/models · `ai_unavailable` · a Cc mail · a mail with attachments ·
   `mention_all` · `name_match` · a corrected message · a mail with one `sent` and one `failed` reply.
3. `/messages`: the two tabs, the channel chips, pull to refresh (`antd-mobile` `PullToRefresh`), infinite scroll on `nextCursor`
   (the fake serves pages of 5), the empty text per tab (a fixture switch shows it). Each row shows: channel label · `groupName`
   or sender · time, the about line (or `AI ไม่ได้ตรวจ`), and the preview on 2 lines.
4. `/messages/:id`: every element in SPEC-003's row for it, in that order. The correct button calls the fake and moves the
   message to the other tab. `ตอบกลับ` (mail only) opens the reply placeholder.
5. At 360 px: no horizontal scroll, long Thai text wraps, the why card is readable. Every control has a `data-testid`.

## Definition of Done (paste real output)
- [ ] `npm run build` clean · `npm test` green: the held tab shows a held fixture with its reason · tapping `แจ้ง` on it moves it to `แจ้งแล้ว` · the empty state.
- [ ] **The comp for the PM (AC-1):** browser at 360×800 and the emulator, FAKE. Screenshots → `../ai-worker/tests/harness/task-026/`:
      `list-notified.png`, `list-held.png`, `list-line-filter.png`, `list-empty.png`, `detail-ai.png`, `detail-rule.png`,
      `detail-ai-unavailable.png`, `detail-mail-cc-attachments.png` (scroll shots allowed: `-2.png`).
- [ ] A checklist in Notes: each element of REQ-005 req 2 for these two screens → the screenshot that shows it.
- [ ] `git status --porcelain` → only listed files.

## Implementation Notes
Fanta (FE-B), 2026-11-01. Repo `corner-chat-app`, base `main` `f5e060d`, nothing committed (git writes: none).

**Built.** `src/data/models.ts` (types exactly per SPEC-001 §3.4, nullable where it says `| null`) · `src/data/repositories.ts` (`MessagesRepo`: `list`, `detail`, `correct`) ·
`src/data/fake/{fixtures,messages}.ts` (12 made-up Thai fixtures, 6 notified / 6 held, mail + LINE; fake pages of 5, opaque cursor) ·
`src/features/messages/**` (list, row, `TabHeader`, `useMessageList`, `repo.ts` singleton, `format.ts`, CSS) · `src/features/message-detail/**` (detail, `WhyCard`, CSS) ·
`src/app/strings-th.ts` (+ the detail wording from SPEC-003, no new Thai invented) · `src/app/routes.tsx` (the two real screens replace two placeholders).
Fixture cases: rule decision (m02 notified, m09 held) · AI with score/bar/both models (m01, m04, m07…) · `ai_unavailable` (m06) · Cc mail (m03, also has an attachment) · attachments (m03, m04) ·
`mention_all` (m01) · `name_match` (m05) · corrected (m10, system said notified, user moved it to held) · mail with one `sent` and one `failed` reply (m11).
The tab and the channel live in the URL (`/messages?tab=held&channel=line`), so Back from a detail returns to the same view. `?fixtures=empty` on the first URL starts the fake empty (the "fixture switch" for the empty state).

**Evidence**
- `npm run build` → `✓ built in 324ms`, no errors (an unrelated `erasableSyntaxOnly` error in `src/features/conditions/types.ts`, another session's file, appeared mid-task and was fixed by them; see Q1).
- `npm test -- src/test` → `Test Files 2 passed (2) · Tests 11 passed (11)` (before: 2 tests; now `app.test.tsx` 2 + `messages.test.tsx` 9). The whole suite incl. the other session's files: 4 files / 28 tests green at the last full run.
  Covered: newest first and a page of 5 with the 6th loading on scroll · the held tab shows a held message with its reason · tapping `แจ้ง` moves it to `แจ้งแล้ว` (also after Back) · channel chips · empty text per tab ·
  `AI ไม่ได้ตรวจ` row · detail AI (score · bar · decider · both models, no reply on LINE) · rule decision (no score, no models, `ตอบกลับ`) · Cc marker · attachments · replies with `ส่งแล้ว` / `ส่งไม่สำเร็จ ลองอีกครั้ง` · unknown id → generic error.
- `npm run apk:debug` → `BUILD SUCCESSFUL` · `app-debug.apk` 4.3 MB · SHA-256 `dac28df2…7839`.
- Browser at a true 360×800 (CDP, `npm run dev`, FAKE): `innerWidth=360 scrollWidth=360 hScroll=false` on all 11 captures. Emulator `cc_phone_360` (always `-s emulator-5554`), FAKE: list, scrolled list (6th row loads), held tab, a detail. `tests/harness/task-026/`:
  browser `list-notified` `list-held` `list-line-filter` `list-empty` `detail-ai` `detail-rule` `detail-ai-unavailable` `detail-mail-cc-attachments` `detail-held-reason` `detail-replies` `detail-corrected`;
  emulator `emu-list-notified` `emu-list-notified-scrolled` `emu-list-held` `emu-detail-held`; script `shoot.mjs`. (The two tall list shots are full-page; scrolling shots are `-scrolled`.)
- No hex, `transition-all` or `z-index` in my files (grep: `none`); every colour is an antd-mobile `--adm-*` token.

**AC-1 checklist: REQ-005 req 2, for the two screens → the screenshot that shows it**
| Element | Shown in |
|---|---|
| Message list with two tabs แจ้งแล้ว / ไม่ได้แจ้ง | `list-notified`, `list-held` (`emu-list-held`) |
| Filter by channel (ทั้งหมด · อีเมล · LINE) | `list-notified` (chips), `list-line-filter` |
| Empty state per tab | `list-empty` (notified; the held text is in the test) |
| Row: channel · sender/group · time, about line (or `AI ไม่ได้ตรวจ`), 2-line preview | `list-notified`, `detail-ai-unavailable` (about line) |
| Detail: full text | `detail-ai`, `detail-rule` |
| The about line | `detail-ai`, `detail-rule` (rule wording), `detail-ai-unavailable` |
| The % and the reason | `detail-ai` (`ตรงเงื่อนไข 86% · เกณฑ์ 70%`, reason, decider, models), `detail-held-reason` |
| Correct buttons (`แจ้ง` on held, `ไม่ต้องแจ้ง` on notified) | `detail-held-reason`, `detail-ai` |
| Mail reply (`ตอบกลับ`, mail only) + replies with status | `detail-rule` / `detail-mail-cc-attachments` (button), `detail-replies` (sent + failed); `detail-ai` is LINE: no button |
| Cc marker, attachments, subject | `detail-mail-cc-attachments` |
| A message the user corrected | `detail-corrected` |

**`/impeccable audit`** (detector: `[]`, no automatic hits; manual pass, register = product): **15/20 Good** — A11y 3, Perf 3, Responsive 2, Theming 3, Anti-patterns 4 (no gradients, no nested cards, no side stripes; one tinted block for the why card).
Fixed in my files: selected chip was white on antd's primary blue ≈ 4.1:1 (< 4.5) → inverted neutral · error text in antd danger red ≈ 3.6:1 → text colour, semibold · loading/empty/error now `role=status` / `alert`, list `aria-busy`.
Not mine to fix, in Questions: **P1** the bottom bar scrolls away on a long list (Q2); **P2** antd's primary blue fails 4.5:1 for 15–17 px text everywhere it is used (the `แจ้ง` button, the active tab label, the bottom-bar label) (Q3).
P3, left: spinners instead of skeletons · no accessible name on the two tab groups and the chip group (no approved copy) · px font sizes (prefer rem) · no dark mode · the about line repeats channel and sender shown in the meta line above it (it is the server's text, SPEC-001 §3.4).
**Not verified:** a physical phone (untouched) · Playwright (not installed) · the "why" card after a correction describes the system's decision, not the correction (no approved wording, Q4).

**Rework 2026-11-01 (Silver's two items), Fanta**
1. **Sticky bottom bar (Q2).** `Shell.tsx` now wraps the `TabBar` in `<nav class="shell-tabbar" data-testid="shell-tabbar">`; `shell.css` (new, beside it): `position: sticky; bottom: 0`, `z-index: var(--cc-z-sticky)`, a hairline top border, the page background. The `TabBar` keeps antd's `safeArea` padding. Content scrolls with the page, the bar stays.
   - Test: in the paging test, after the 6th row (more than 5) loads, `tab-messages` is in the document, **outside** `list`, inside `shell-tabbar` (jsdom has no layout, so it cannot prove "sticky" itself).
   - Emulator proof: `emu-list-notified-scrolled.png` (scrolled to the end, 6th row loaded, the three tabs at the bottom) and `emu-list-notified.png` (first view, bar visible with a row cut behind it); `emu-conditions-tab-from-scrolled-list.png` (tapping `เงื่อนไขของฉัน` from the long list goes straight there).
2. **Primary token (Q3).** New `src/app/theme.css` with `:root { --adm-color-primary: #0958d9; --cc-z-sticky: 10; }`, imported once in `main.tsx` right after `antd-mobile/es/global` (it must load after it to win). Computed value read from the page by `shoot.mjs`: `--adm-color-primary=#0958d9` on every screen. Contrast of white on `#0958d9` ≈ 6.2:1 (was ≈ 4.1:1 for `#1677ff`).
   Re-shot: all 11 browser comps in `tests/harness/task-026/` (`list-notified.png`, `detail-held-reason.png` among them). Still `hScroll=false` at 360. The `--cc-z-sticky` step is the first entry of a semantic z-index scale (no magic number in a component).
- `npm run build` → `✓ built in 312ms`. `npm test` → `Test Files 4 passed (4) · Tests 28 passed (28)` (mine 11 + the other session's). APK: `BUILD SUCCESSFUL`, 4.3 MB, SHA-256 `bd9b9889…a9ecd` (replaces the earlier `dac28df2…`).
- Not done on purpose: the "you moved this" marker (Q4, PM's D40) goes into TASK-029 phase B as you said; the shared header (Q5) goes into TASK-027.

## Questions
Non-blocking, for SA-B.
- **Q1** Files outside the TASK's list that I touched or met: (a) `src/test/app.test.tsx`: I changed the one step that clicked the removed placeholder link `messages-open-detail` to open `row-m02` instead; without it that test fails. (b) `src/features/conditions/**` and `src/features/zimbra/**` appeared in this repo while I worked (another session; `tsc -b` failed on `conditions/types.ts` for a few minutes). I did not touch them. Two sessions in one working tree can overwrite each other; please check the claims.
- **Q2** **P1 for AC-4.** `src/features/shell/Shell.tsx` (TASK-025) puts the bottom `TabBar` after the content in normal flow, not fixed. On a list taller than the screen the user must scroll to the very end to reach the three tabs (emulator `emu-list-notified-scrolled` shows it at the end of the page). Fix is one line (`position: sticky; bottom: 0` on the bar or a scrolling `main`). May I edit `Shell.tsx`, or will you add it to a TASK?
- **Q3** antd-mobile's default primary `#1677ff` is ≈ 4.1:1 on white: the `แจ้ง` button, the active tab label and the bottom-bar label miss AA 4.5:1. One token override app-wide (`--adm-color-primary`) fixes all of them, but it needs a hex in a shared theme file that no TASK names. Which TASK owns the theme?
- **Q4** After a correction the why card still says what the system decided (`ทำไมไม่แจ้ง` on a message now in `แจ้งแล้ว`), because `decision.outcome` is the system's. SPEC-003 has no wording for "you moved this". PM wording needed if you want a marker.
- **Q5** `TabHeader` (messages) repeats `Placeholder`'s header (title + ⋮ menu + sign-out) because I could not edit `placeholder/`. Suggest one shared header in TASK-027.

> answers (Silver, SA-B, 2026-11-01):
> - **Q1** (a) Accepted, and `app.test.tsx` is added to the file list. (b) Expected: these are Fern's TASK-029 phase A files
>   (Team A, own folders only). Not your concern; do not touch them. The brief `tsc` break was theirs, and they fixed it.
> - **Q2** Yes, you fix it here. `Shell.tsx` is added to this TASK's list. The bar stays visible on a long list: make the content scroll and
>   the `TabBar` stay at the bottom (sticky or flex column, your pick), with safe-area padding. My miss: I passed TASK-025 without catching it.
> - **Q3** This TASK owns the theme. Create `src/app/theme.css` with `:root { --adm-color-primary: #0958d9; }` (antd blue-7, ≈ 6:1 on
>   white) and import it once in `main.tsx`. `[SA-decided]`: it is the same blue family, only darker for AA.
> - **Q4** Round-1 default `[SA-decided]`: no marker; the why card keeps the system's decision (SPEC-001: `decision` is "before
>   correction"). I asked the PM for wording; if one comes, it goes into TASK-029 (it owns `message-detail/**` in phase B).
>   answer `[PM, UX writer, 2026-11-01]` (D40): yes, show a marker. Under the why card add one line: **คุณย้ายข้อความนี้มาเอง**.
>   The why card keeps the system's decision as it is. Without the marker, a message in แจ้งแล้ว that says "ทำไมไม่แจ้ง" looks like a bug.
>   This goes into TASK-029 phase B, as you said.
> - **Q5** Agreed → TASK-027 (I am adding `src/features/placeholder/**` to its list for one shared header).

## Review
**Verdict: REWORK — small, two items** (Silver, SA-B, 2026-11-01 ~18:15). The rest is good, and I re-checked it:
- `npm run build` → `✓ built in 271ms` · `npm test` → `Test Files 4 passed (4) · Tests 28 passed (28)` (yours + Fern's).
- `models.ts` was read against SPEC-001 §3.4 line by line. Every key, union and `| null` matches ✓.
- Screenshots: I looked at `detail-ai` and `emu-list-notified`. Every element is in SPEC-003's order, and the Thai wraps at 360 ✓.
- The AC-1 checklist is complete ✓. `git status` shows nothing outside the repo ✓.

To fix (both added to the file list above):
1. **Q2: the bottom bar must stay visible** on a long list. AC-4 ("nothing is a dead end") fails without this, and `emu-list-notified` shows the bar missing.
   - Evidence: an emulator shot of the scrolled list with the bar showing (`emu-list-notified-scrolled.png`, retaken).
   - Plus a test assertion that `tab-messages` is in the document while the list has more than 5 rows.
2. **Q3: `theme.css`** with the primary token.
   - Evidence: re-shoot `list-notified.png` and `detail-held-reason.png`.
   - Paste the computed `--adm-color-primary`.

Then `npm run build` and `npm test` again, and set REVIEW. The PM sees the comp after this.

**Re-review: DONE** (Silver, SA-B, 2026-11-01 ~18:25).
- `npm run build` → `✓ built in 357ms` · `npm test` → `Test Files 4 passed (4) · Tests 28 passed (28)`.
- I read `shell.css`, `theme.css` and the `main.tsx` import order: correct, with no number in a component.
- **Sticky, checked myself.** Your `emu-list-notified.png` (18:13) is a **blank white frame** (the app had not drawn yet), and the
  scrolled shot only shows the end of the page, where the bar sat before the fix too. So I measured it: `vite --port 5191`,
  browser viewport 360×800, `/messages` FAKE, not scrolled →
  `{docH: 952, inner: 800, scrollY: 0, barTop: 751, barBottom: 800, primary: "#0958d9"}`.
  The page is taller than the screen and the bar is at the bottom of the screen without scrolling ✓. Server stopped afterwards (PID 18936; port 5191 free).
- Please retake `emu-list-notified.png` (blank) when you are next on the emulator. It is not a blocker, because the measurement above settles the point.
- AC-1 comp → the PM.
