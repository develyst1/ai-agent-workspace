# TASK-936 — FE: REQ-5011 **GR web, batch 1 (Salary), Team B's pages:** bring the final-ui prototype up to what we built + decided (`som-balance-backoffice-spec/final-ui`) — @Fanta — now
**From @Silver, 2026-11-10.** REQ-5011 (owner-approved 2026-11-10): one clickable **mock-only** URL so the customer can give all their feedback by 17 Nov. Batch 1 = Salary, **URL target 12 Nov**. **Sober coordinates the shared files** (router `pages/a/index.ts`, `mock/a-salary.ts`, the shell). Ask through me before touching them. Path in `machine.local.md`. **Not a git repo: no git.** **Size ≈ 1–1.5 d.**

## Rules
- **Mock only:** no real API, no real DB, **no real children's or coaches' names** (CONVENTIONS §2.8), no LINE, no mail.
- **English back office (D2) + the approved words only.** The real BF screens you built are the source of truth for words and layout. Copy their wording, not their code.
- **The prototype's own conventions win** (CONVENTIONS.md: hidden, never masked; role switcher; `fmtBaht` / `fmtDate`).

## Your pages, each brought to the built + decided state (CHECK-2026-11-10-final-ui-refresh.md § A)
| page | bring it to |
|---|---|
| `People.tsx` (Employee) | REQ-5010 folds («Add», Motorcycle, balanced). The admin sees name + Merit only (869). "No Teacher" never listed. |
| `Person.tsx` (Employee Profile) | the **FL rate per class type editor** (899: Private · Duo · Group · ECA · Camp, CEO only, empty = not set); vehicle "Motorcycle"; no fields that have no data (869 gap 2) |
| `Settings.tsx` (Payment Setting) | «ฟูลไทม์», Add school inside the School box, the rule cards read-only; the 3 Transportation notes per Porter's ruling on TASK-933 (default English) |
| `Entries.tsx` (Other Income) | **admin only**, Merit + Other ± cards + the **Transportation trip card** (895: no vehicle, no km, no amount); "OT Hour"; the CEO sees the pointer + "Open Pay run" (933) |
| `MySlip.tsx` (Payment Detail, coach) | «Confirm this slip» (902, draft only, before 12:00) with the final-UI toast; no "Tell an admin" |
| `Daily.tsx` (Daily Training Report) | 885's shape (Coach · Role · Hour · Description · Daily Income), "ECA" spelled right, the last-7-days tabs |
| **new** `SalaryReport.tsx` (Salary Report) | 923's 2 tabs **Teaching** / **Pay** + an Export Excel button (in the mock: a toast that says it would download; no fake file) |

- **Not yours** (Sober / Fern): `PayRun.tsx`, `Slip.tsx`, `SlipView.tsx`, `parts.tsx` and the router / mock / shell.
- **For a new page or a new mock field you need,** write the exact addition into this TASK's `## Questions`, and I get Sober to add it (or OK you adding it).

## Done =
- The prototype builds (`bun run build` or its own script, the one the folder's README names) with 0 errors.
- Every page above opens as CEO / admin / coach (the role switcher) with **no console error**.
- English throughout these pages, except the cited customer-Thai.
- **Report in `inbox/SA-B.md`:** the page list, screenshots in `tests/evidence/task-936/` (role × page, mock data only), and any word not on the approved list (`PENDING (Porter)`).
- Tanya clicks it through before the URL goes to the customer (REQ-5011 acceptance).

## Part 2 (Porter, 2026-11-10 01:10): **Notifications** in final-ui, for batch B3 (~16 Nov). Start AFTER part 1 is reported (11 Nov)
- **The pages already exist in the prototype:** `pages/a/notify/NotifySettings.tsx` (`/notify/settings`, CEO) and `NotifyAlert.tsx` (`/notify/inbox`, CEO / admin / coach), per `pages/a/index.ts:35–36`. Bring them to what you built in **TASK-914 + Sober's ruling C-h**:
  - **Notification Setting:** the **read-only** recipient list (Who · Role · Gets; coaches «MYSELF - ALWAYS»; «In the web»). No switches, no matrix.
  - **Notification Alert:** the person's own feed, with the 7 types incl. **"Extra Hour"**, **no money in any text** (TASK-920's texts, e.g. "Bonus · Ton · 14/10/26 · 1st Trial"), and mark-read. A coach sees their own; the CEO / admin see theirs.
- **Mock data** in your own `mock/a-salary-b.ts` (or a new `mock/a-notify-b.ts`), with invented names only. Shared files go via me → Sober, as before.
- **Done =** the same as part 1 (it builds, no console error per role, screenshots in `tests/evidence/task-936/notify-*`, report in `inbox/SA-B.md`).

## Questions (Fanta, 2026-11-10)
1. **Router line (Sober)** — final-ui/src/pages/a/index.ts, two additions for the new page (I tested it with a temporary local copy, since reverted byte-for-byte):
   `import SalaryReport from "./salary/SalaryReport";` and, after the /salary/daily row:
   `{ route: "/salary/reports", group: "SALARY", title: "Salary Report", order: 185, roles: ["ceo"], icon: BarChart3, Component: SalaryReport },` plus `BarChart3` in the lucide-react import. Until it is added, the Salary Report page is built but not reachable.
2. **Mock (no shared file touched):** all new data is in the NEW `src/mock/a-salary-b.ts` (vehicleWord, FL class rates, 7-day Daily, trip schools, Salary Report months 2026-09 / 2026-10).
3. **Shell words still Thai (Sober / not mine):** the footer line «ตัวอย่างหน้าจอ · ข้อมูลทั้งหมดเป็นตัวอย่าง» in the sidebar; `fakeDownload` toast «ดาวน์โหลด … (ตัวอย่าง)» (I used English `notify` instead on my pages); the menu title «Monthly Payment (Up to date)».
4. **Mock Thai data kept (typed values, not UI words):** the reason «ทำอุปกรณ์เสีย» in a-salary.ts OTHER_INCOME_ROWS / slips, and child nicknames (น้องมะลิ …), per CONVENTIONS §2.8.

## Review — part 1 — @Silver, 2026-11-10: ✅ ACCEPTED (1 blocker outside Fanta: the router line)
- **My re-run:**
  - final-ui `tsc --noEmit` = **0**;
  - all 7 page files are present (incl. the new `SalaryReport.tsx`);
  - her own `mock/a-salary-b.ts`; Sober's `a-salary.ts` / `index.ts` untouched;
  - **23 evidence files** in `SOM-BALANCE-Backoffice-spec/tests/evidence/task-936/`.
- **Thai left on these pages:** the `฿` sign + the customer's own commission sentence on Payment Setting (cited, ขวัญ 10-23) + the approved Thai toasts. That matches the real BF after 933 (my correction). Accepted.
- **Her 29 headless role × page checks** with 0 console errors are accepted as her evidence.
- **Blocker:** `/salary/reports` isn't reachable until Sober adds the router line (exact lines in `## Questions`). Chased via Porter.
- **Part 2 (Notifications): GO now.**

## Review — part 2 (Notifications) — @Silver, 2026-11-10: ✅ ACCEPTED on her files
- **8 `notify-*` screenshots** + `result-notify.txt` in the evidence folder: CEO / admin / coach × settings / inbox, a 375-px view, all-read.
- **final-ui tsc at 01:16 = 1 error, NOT hers:** `src/shell/Layout.tsx:9`, a missing `PROPOSED` icon key. That's the shell (Sober's), mid-edit for batch 2's "Proposed" group. It goes to Porter.
- **Still open:** the `/salary/reports` router line. The GO is in her inbox (Porter's 01:08 grant); not added yet.

## Part 3 (GR round 3, ขวัญ's ruling via Sober / Porter, 2026-11-10): **Merit is shown to the CEO only, NEVER to the admin.** Do it now, in final-ui
- **`Entries.tsx`:** drop the **Merit card** when the role is `admin`. The admin's Other Income shows the other cards only. Keep it for the CEO.
- **`People.tsx`:** the admin no longer sees the Merit column / flag, so the admin's list is **names only**.
- **`Person.tsx`:** the admin no longer sees the Merit row.
- **Tests / checks:** your role × page script asserts **no "Merit" text anywhere for admin** on these 3 pages, and that it's still there for the CEO. 0 console errors; re-shoot the affected screenshots.
- **Report one line in `inbox/SA-B.md`.** I tell Sober, who rebuilds → Otto → Tanya live.

## Review — part 3 (Merit is CEO-only) — @Silver, 2026-11-10: ✅ ACCEPTED
- **Read in code:**
  - `Entries.tsx`: no Merit card (the admin's page);
  - `People.tsx:46 / 71`: the Merit column behind `ceo &&`;
  - `Person.tsx:52–53`: the Merit row inside `if (ceo)`.
- **Fanta's role check:** 31 PASS, no "Merit" for the admin on the 3 pages, still present for the CEO; 0 console errors; tsc 0; build 0 (scratch outDir; **Sober rebuilds `dist/`**).

## Part 4: GR round 5, Team B slice (ขวัญ 11-11, `PLAN-2026-11-11-gr-round5-split.md` § Team B; verbatim in `project-docs/customer-2026-11-11-line-som-system/`). final-ui only. Fanta builds, Silver reviews, then Sober rebuilds → Otto → Tanya LIVE
| # | page / file | change |
|---|---|---|
| 4 | Employee `People.tsx` | balance the columns; **Base salary** lines up with the other rows |
| 6 | Other Income `Entries.tsx` + the router row (Porter's grant applies only to this role change) | **the CEO sees the same page as the admin** (no pointer / "go back"); **the Merit card shows for the CEO only** (round 3), so the admin's view stays without it |
| 7 | Daily Training Report `Daily.tsx` | balance the rows |
| 8 | Salary Report `SalaryReport.tsx` | balance the rows · tab "Teaching" → **"Teaching (HR)"**, hours shown **without .00** · tab "Pay" → **"Payment"** · "Camp (hours)" → **"Camp (HR)"** · **grid lines** on the Payment table · **remove "Classes"**, keep only Total |
| 9 | Notification Setting `notify/NotifySettings.tsx` | column "Gets" → **"Visible"** · **remove "In the web"** |
| 13 | Product `pages/b/stock/Product.tsx` (TASK-940, yours) | **restore the image field** · **commission group = a dropdown** of the groups made in Payment Setting (no free typing; the mock reads the same list Payment Setting shows) · revenue category stays as is |
| 14 | STOCK OUT `pages/b/stock/StockOut.tsx` (yours) | remove the top **"Items"** word · the Product box is **searchable** · **Save at the very bottom** (one vertical flow) |
- **Her words are the approved words** (round 5). Nothing else changes.
- **The Entries router row** (`pages/a/index.ts`, `roles` for `/salary/entries` → `["ceo","admin"]`) is the one shared-file edit in this part. Mark it `🔻 GR5`, and I tell Sober.
- **Done =** final-ui tsc 0 · build 0 (scratch outDir; Sober rebuilds) · your role × page checks updated (CEO sees the Merit card on Other Income, the admin doesn't; no "In the web"; no "Classes") · 0 console errors · re-shot screenshots · one line in `inbox/SA-B.md`.
- **Added to Part 4 (Porter 19:28, from Sober; ขวัญ #2: "Pay run" is renamed "Monthly Payment"):** `Daily.tsx:26` «Back to Pay run» → **«Back to Monthly Payment»**; `Entries.tsx:33` «Open Pay run» → **«Open Monthly Payment»**. The Entries one probably vanishes with #6 (no pointer for the CEO); if it stays anywhere, rename it. Grep your pages for any other "Pay run" and rename the same way.

## Review — part 4 (GR round 5) — @Silver, 2026-11-11: ✅ accepted except one line
- **Checked:**
  - final-ui tsc **0**;
  - the Entries Merit card is behind `ceo &&` (`Entries.tsx:65`); the CEO sees the same page;
  - the `/salary/entries` row already had `["ceo","admin"]` (`index.ts:31`), so no edit was needed;
  - no "In the web" / "Gets" / "Classes" left.
- **Open:** `Daily.tsx:26` «Back to Pay run» → «Back to Monthly Payment» (the 19:28 add-on). Sent back to Fanta.
- **✅ Part 4 complete (Silver, 2026-11-11):** `Daily.tsx:26` = «Back to Monthly Payment», checked. No user-visible "Pay run" is left on Fanta's pages; Fanta reports tsc 0, build 0, Salary check 34 PASS, and 0 console errors.
