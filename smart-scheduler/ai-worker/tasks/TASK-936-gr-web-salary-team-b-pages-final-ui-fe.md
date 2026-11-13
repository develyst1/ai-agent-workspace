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

## Part 5 — GR round 6: commission groups can be EDITED — @Fanta — @Silver, 2026-11-12
**Why:** ขวัญ 02:54 «แล้วกลุ่มค่าคอมปัจจุบันแก้ได้ไหมคะ เหมือนมีแค่ Add group แต่ไม่มี Edit ค่า» (ledger row 27; Porter 03:01). **File: `src/pages/a/salary/Settings.tsx` only** (final-ui, mock only, no git).
- **Table (l.68–93):** add an empty last header `<Table.Th />` and, on each group row, a right-aligned **Edit** button. Copy the School Distance row's button exactly (`size="compact-xs" variant="subtle"`, l.171–180).
- **Modal «Edit commission group»:** copy the Add modal's two fields (l.194–197): **Group name** and **Rate per item**, prefilled from the row. Cancel / **Save**. "Who earns it" is **not** in the edit (the ask is name + amount) [SA-decided].
- **Save** closes and toasts `Commission group “<name>” saved — <rate>` (English; prototype convention, nothing persisted, like the School edit at l.249–251). An empty name or rate → Save disabled.
- **Untouched:** the Add group flow, the four STAFF/FT lines under the table, the other cards.
**Done =** `npx tsc --noEmit` 0 · `vite build` into a scratch outDir (dist/ untouched) · a CEO headless click: Edit on «Miller skate» → change the rate → Save → toast; 0 console errors; no Thai text added. Report in inbox/SA-B.md.
**Note for Porter [SA-decided, not a build]:** the real back office has no commission-group edit route today (BB `grep` finds no group route; groups live as a product field). If ขวัญ wants this in the real app, that is a new item for the real build.

## Review — part 5 (GR round 6) — @Silver, 2026-11-12: ✅ ACCEPTED
- **Re-run by me:** final-ui `npx tsc --noEmit` exit **0**.
- **Read:** `Settings.tsx` has the empty header `<Table.Th />` (l.79) and a per-row Edit button with the same style as School (l.91–95). The modal «Edit commission group» (l.227–) has name + rate prefilled, Save is disabled when either is empty (l.252), and Save shows the toast (l.254). The Add flow is untouched.
- **Evidence (Fanta):** `SOM-BALANCE-Backoffice-spec/tests/evidence/task-936/result-settings-edit.txt` 9 PASS / 0, 0 console/network problems. I looked at `shots/settings-edit-modal.png`: an Edit link on every group row, the modal prefilled «Miller skate» / «100 ฿», no "Who earns it".
- **Security review:** none (a mock page, no data, no route).
- Next: Porter → Sober rebuild → Otto → Tanya.

## Part 5b — O-151-6: after Save, the row shows the new values — @Fanta — @Silver, 2026-11-12
**Why:** Porter 03:09 [PM-decided] (TEST-151 § GR round 6). Today Save only shows a toast, so the customer sees no change. My Part 5 brief was the cause (F-062). **File: `Settings.tsx` only.**
- Keep the commission rows in page state: `const [groups, setGroups] = useState(COMMISSION_GROUPS)`. Render the table from `groups`.
- Remember **which row** is being edited (its index or original name) in `groupEdit`. On Save, replace that row's `group` + `rate` (trimmed) and keep its ft / pt / fl / staff. Then close the modal and show the same toast.
- The row `key` must not break when a name changes (use the index, or keep the original name as the key).
- Cancel changes nothing. A reload resets to the mock (in-page state is enough; no backend, no storage).
**Done =** tsc 0 · scratch build 0 · headless CEO: Edit «Miller skate» → rate 99 ฿ + rename «Miller skate 2» → Save → **the row reads «Miller skate 2» / «99 ฿»**, and the other rows are unchanged; Cancel leaves it as is; the previous 9 checks still pass. Report in inbox/SA-B.md.

## Review — part 5b (O-151-6) — @Silver, 2026-11-12: ✅ ACCEPTED
- **Re-run by me:** final-ui `npx tsc --noEmit` exit **0**.
- **Read:** `Settings.tsx` l.16 `groups` in page state; l.17 `groupEdit` carries `idx`; l.85–86 the table renders from `groups` with an index key; l.259 Save replaces only that row's `group` + `rate` (trimmed) and keeps ft/pt/fl/staff.
- **Evidence:** `result-settings-edit.txt` 11 PASS / 0 (incl. the row reads «Miller skate 2» / «99 ฿», other rows unchanged, Cancel leaves it). I looked at `shots/settings-edit-saved.png`: the row shows «Miller skate 2 · 99 ฿» with the toast; the other 7 rows are as before.
- **Security review:** none (mock page). Next: Porter → Sober rebuild → Tanya.

## Part 5c — O-151-7: an edited amount keeps the "120 ฿" format — @Fanta — @Silver, 2026-11-12
**Why:** Porter 03:14 [PM-decided] (TEST-151 § GR round 6b): typing «120» saves a row that reads «120», not «120 ฿» like the others, and the screenshot goes to ขวัญ. **File: `Settings.tsx` only.**
- On Save, normalise the trimmed rate: if it is a number with an optional `฿` (e.g. `120`, `120฿`, `120 ฿`, `1,200`) → store **`<number> ฿`**, keeping the digits and commas as typed and adding exactly one space before `฿`. Anything else (e.g. «No commission») is kept as typed [SA-decided].
- The toast uses the same normalised rate.
**Done =** tsc 0 · scratch build 0 · headless CEO: rate «120» → the row reads «120 ฿»; «120฿» → «120 ฿»; «No commission» stays; the earlier 11 checks still pass. Report in inbox/SA-B.md.

## Review — part 5c (O-151-7) — @Silver, 2026-11-12: ✅ ACCEPTED
- **Re-run by me:** final-ui `npx tsc --noEmit` exit **0**.
- **Read:** `Settings.tsx` l.259–263. The regex `^(\d[\d,]*(?:\.\d+)?)\s*฿?$` turns «120» / «120฿» / «120 ฿» / «1,200» into «<n> ฿»; other text is kept; the toast uses the same `rate`.
- **Evidence:** `result-settings-edit.txt` 15 PASS / 0 (the 4 new O-151-7 cases + the earlier 11), 0 console/network problems.
- **Security review:** none (mock page). Next: Porter → Sober rebuild → Tanya.

## Part 6 — GR round 7: one alignment rule on Team B's 11 pages — @Fanta — @Silver, 2026-11-12
**Why:** ขวัญ 03:15 (ledger 28) «บางส่วนชิดซ้าย บางส่วนชิดขวา» → one rule for every page. **The rule is `ai-worker/RULE-2026-11-12-gr-web-alignment.md` (Sober, 7 lines); read it whole; it wins over this summary.**
**Your files only (final-ui `src/pages/`):** `a/salary/{Settings, Entries, MySlip, People, Person, SalaryReport, Daily}.tsx` · `b/stock/{Product, StockIn, Import, StockOut}.tsx`. **Not** `parts.tsx` (shared; ask me first), not PayRun/Slip/SlipView (Fern), not StockReport/LowStock/Demo (Flash).
**Known spots (from my grep, check each page anyway):**
- **SalaryReport** (14 headers, 0 right) and **Import** (6, 0 right): their numeric columns go right, header + cells (rule 1).
- **Product / StockOut:** drop the 2 `ta="center"` (rule 1).
- **Settings:** the commission Edit column and the School Edit column get the header **"Action"**, right-aligned (rule 4). Today both are an empty `<Table.Th />`. The Add / Edit modals (commission name + rate, school + km) **stack one field per row** (rule 6; they are not a From/To pair).
- **Every page:** `tabular-nums` on each `Table`, and money through `fmtBaht()` (rule 3). Totals sit in their column (rule 2). Label/value boxes use `Group justify="space-between"` (rule 5). Page actions sit in `PageHeader` (rule 7).
- **Keep:** the round-6 Edit behaviour (Part 5/5b/5c) and every word. **Layout only**, no wording change.
**Done = (the rule's own Done):** tsc 0 · scratch build 0 (dist/ untouched) · a headless check on each of the 11 pages (CEO, plus Admin where the page shows for Admin) that every numeric `th`/`td` computes `text-align: right`, no element computes `center` in a table, every form is one column, and 375px has no horizontal overflow · 0 console errors · Salary 34 + the settings-edit 15 still pass · 2 screenshots (SalaryReport, Import). Report in inbox/SA-B.md.

## Review — part 6 (GR round 7, alignment) — @Silver, 2026-11-12: ✅ ACCEPTED
- **Re-run by me:** final-ui `npx tsc --noEmit` exit **0**. No `ta="center"` is left in her 11 pages (grep).
- **Evidence:** `tests/evidence/task-936/result-align.txt` **41 PASS / 0 FAIL** (baseline 10 FAIL); 0 console/network problems. Fanta also reports settings-edit 15/0, Salary 34/0 and Stock 35/0. I looked at `shots/align-salary-report.png`: numbers and their headers are right-aligned, the Total row sits under its columns, and text is left.
- **My survey was wrong on 2 pages, and Fanta's reading is right:**
  - **Import's** 2 tables are all text (Model code · What changes · Product Name), so left is the rule.
  - **SalaryReport** already right-aligned its numbers by another route; my `ta="right"` grep count was not behaviour.
  - Only the centred Payment group header was a defect there, and it's fixed.
- **Security review:** none (mock page). Next: Porter → Sober rebuild → Tanya.

## Part 6b — GR round 7 TEST_FAILED on Stock In / Stock Out (Tanya, TEST-151 § GR round 7) — @Fanta — @Silver, 2026-11-12
**Why:** the Part 6 audit checked rule 6 only in **modals**, but rule 6 covers **every form on a page**. I accepted it without noticing (F-064). **Files: `b/stock/StockIn.tsx`, `b/stock/StockOut.tsx` only.**
- **7a StockIn l.40–71:** the `Grid` puts Product (sm 6) + Quantity (sm 3) + Date (sm 3) on one row. Make it one field per row, full width (`Stack`), in the same order. Save / Cancel go bottom-right (`Group justify="flex-end"`).
- **7b StockOut l.234–247:** the `Grid` puts Student | Other Customer and Branch | Payment side by side. Make it one field per row (`Stack`): Student · Other Customer · Branch · Payment · Remark. None of them is a From/To pair.
- **7c StockOut l.109–110:** the `Qty` and `Discount (this item)` headers become `ta="right"`. Their cells (the NumberInputs, l.135 / l.139) must sit right as well: wrap each cell's content in `Group justify="flex-end"` (or `ta="right"` on the Td), so the header aligns with its column.
- **Extend the audit (`audit-align.mjs`):** rule 6 must check **every form container on every page** (inputs that share a row on the page itself, not just in modals). The numeric-column check must include **input** columns. It must FAIL on today's StockIn / StockOut before your fix and PASS after.
**Done =** tsc 0 · scratch build 0 · audit: the new checks show FAIL→PASS and everything else stays green (41+) · 375px no overflow · 0 console errors · settings-edit 15 + Salary 34 + Stock 35 still pass · screenshots of StockIn + StockOut. Report in inbox/SA-B.md.

## Review — part 6b (round 7 fails 7a/7b/7c) — @Silver, 2026-11-12: ✅ ACCEPTED
- **Re-run by me:** final-ui `npx tsc --noEmit` exit **0**. No `Grid` / `SimpleGrid` / `Group grow` is left in StockIn / StockOut. Entries keeps one `SimpleGrid` (l.55), which lays out the **cards**, not form fields. The StockOut `Qty` / `Discount (this item)` headers are `ta="right"` (l.109–113).
- **The audit now covers the rule's scope:** `result-align.txt` has a "page forms, rule 6" line per page × role (l.36–52) and input-column checks (l.53 on: Qty th/td/input right). **60 PASS / 0 FAIL**; Fanta reports **8 FAIL on the code before her fix**.
- **I looked at `shots/align-stock-out.png`:**
  - Qty and Discount, header and inputs, sit right under their headers.
  - Student / Other Customer are one per row, full width.
  - The Action column is last.
- **Out-of-list edit, accepted:** the extended audit also caught the Entries School/Trip fields sharing a row. Entries is one of her Part 6 files and the same rule applies, so it's in scope.
- **Security review:** none (mock page). Next: Porter → Sober rebuild → Tanya.

## Part 7 — GR round 9: never offer a link to a page the viewer can't open (TASK-955, Team B slice) — @Fanta — @Silver, 2026-11-12
**Why:** Tanya O-151-8a. The rule and the helper live in `TASK-955 § The rule` / `§ Done by me` (Sober): `const canOpen = useCanOpen();` from `@/shell`, pass the **registry route** (`/stock/products`). **Files: `b/stock/Import.tsx`, `b/stock/StockOut.tsx` only.**
- **My grep finds 5 calls, not 3** (TASK-955 lists Import 2, StockOut 1). [SA-decided] per kind:
  - **Page links → hidden when `!canOpen("/stock/products")`:** Import l.21 «Add product manually» (header) · StockOut l.91 «Product» (header).
  - **Form actions → always drawn; they only skip the move:** Import l.125 «Cancel» and StockOut l.247 «Cancel» go to `/stock/products` when it can open, else stay on the page and reset the form. Import l.131 «Apply import» keeps its toast, then goes to `/stock/products` only when it can open, else stays. (Hiding Cancel/Apply would break the form; they are not links to another page.)
- No other change, no new words.
**Done = (TASK-955's own Done, for these 2 pages):** `npx --yes --package typescript@5.6.3 tsc --noEmit` 0 · scratch build 0 (dist/ untouched) · no Thai · no `ta="center"` · headless through the real «Viewing as» dropdown: CEO sees both header buttons (paste the list per page) · Kung with only Import (then only Stock Out) ticked sees no header button to Product, and Cancel / Apply stay on the page with the toast · tick Product too ⇒ the buttons are back and Cancel / Apply go to Product · 0 console errors · align 60 + Stock 35 still pass · 1 screenshot: Kung's Stock Out. Report in inbox/SA-B.md.

## Review — part 7 (GR round 9, TASK-955 Team B slice) — @Silver, 2026-11-12: ✅ ACCEPTED
- **Re-run by me:** final-ui `npx tsc --noEmit` exit **0**. The grep matches the brief: Import l.22 and StockOut l.105 draw the header link only when `canOpen("/stock/products")`. Import Cancel (l.128) / Apply (l.134) and StockOut `cancel()` (l.65–75) go to Product only when it can open, else they stay; Cancel resets the form.
- **Evidence:** `tests/evidence/task-936/result-links.txt` **15 PASS / 0 FAIL**. It covers the CEO and Kung button lists per page and Product ticked ⇒ the buttons are back, with 0 console problems. Fanta also reports align 60/0 and Stock 35/0.
- **Screenshot `shots/links-kung-stock-out.png`:** viewing as Kung, only STOCK OUT is in the menu, and the form's Cancel and Save are there. *Caveat:* the shot is scrolled past the header, so it does not show the hidden «Product» button; result-links l.7 proves that. The Thai shown is the sample student name, not UI text.
- **Security review:** none (mock page). Next: Porter → Sober review / rebuild → Otto → Tanya.

## Part 8 — GR round 10, TASK-956 Slice B (ขวัญ's approvals) — @Fanta — @Silver, 2026-11-12 · ETA 13 Nov
**Read first:** `TASK-956 § Rules for every slice` + `§ Slice B` (Sober). **Files: `a/salary/Settings.tsx`, `b/stock/Product.tsx` only.** Do not import from or edit `pages/proposed/*` or `mock/proposed.ts` (Flash's; he deletes the PROPOSED card in the same build).
**8a. Payment Setting edit (`Settings.tsx`), CEO only as now.** The fields come from `proposed/PaymentSettingEdit.tsx` l.9–15: Extra Hour rate · OT multiplier · Motorbike / Car per km · Bonus 50 / Bonus 100 amount. [SA-decided]:
- **One edit style = round 6's:** an «Edit» button (`size="compact-sm" variant="light"`, as Commission's «Add group») in each card's header (`KvCard`'s `aside`; the Transportation card's own header). Each opens a modal titled «Edit <card>» with **only that card's rate fields**, one `NumberInput` per row (rule 6), Cancel / Save bottom-right. Save updates the card in **page state** (like `groups`), closes, and toasts «<Card> saved — applies from the next pay period». Cancel changes nothing. Save is disabled when a field is empty.
- **Values = what Settings shows today, not the proposed mock:** Extra Hour 350 ฿ · OT 1.15 (2 decimals; it is a multiplier, so no ฿) · Car 6 ฿ / Motorcycle 3 ฿ per KM (the mock's 7 / 4 is wrong for this page). Minimum / Trip and the rule text rows stay read-only.
- **Bonus 50 / Bonus 100 cards get one new first row «Amount» = 50 ฿ / 100 ฿**, so there is a number to edit. This is the only new visible row. Money via `fmtBaht()`.
- Update the l.21 comment ("READ-ONLY…") to say what is now editable.
**8b. Product filter bar (`Product.tsx`).** The category `Tabs` (l.94–102) **is replaced** by one bar above the list: **Type** (`Select`, «All» first, values = the categories in the page's own `rows`) · **Product** (`Select searchable`, «All» first, the names left after Type) · **Search** (`TextInput`, free text on the product name, case-insensitive). Live, no Apply button; the three combine (AND). Changing Type resets Product to «All». An empty result shows «No matching items» in the table. CEO and Admin both get the bar. Add / Edit / the rest stay as they are.
- **No bar on STOCK IN / Import / STOCK OUT** (TASK-956 § Slice B, [SA-decided] by Sober).
**Done =** tsc (`npx --yes --package typescript@5.6.3 tsc --noEmit`) 0 · scratch build 0 (dist/ untouched) · no Thai added · no `ta="center"` · headless: as CEO, each of the 4 cards Edit → change → Save → new value on the card + toast, and Cancel → unchanged · Admin does not reach Payment Setting (as now) · Product as CEO and as Kung (Product ticked): each filter narrows, «All» restores, the 3 combine, the empty state shows · 375 px no overflow · 0 console errors · align 60 + Stock 35 + settings-edit 15 + links 15 still pass · screenshots: Payment Setting with an Edit modal open, Product filtered. Report in inbox/SA-B.md.

### Part 8 — amendment to 8b (Sober's note, via Porter) — @Silver, 2026-11-12
**Product imports the shared bar; build no copy:** `import { NO_FILTER, StockFilterBar, passes, type StockFilter } from "./StockFilterBar";`. It's Fern's slice A file, accepted by Sober in TASK-956 § Review. Use it as `LowStock.tsx` does: l.5 imports it, l.53 calls `passes(filter, name, cat)` and l.110 draws `<StockFilterBar value=… onChange=… items=…>`. Pass `items = rows.map(r => ({ name: r.name, cat: r.cat }))` so Type comes from the product's own category.
- **Its behaviour replaces mine in 8b:** a Type change clears only a Product outside that Type; it does not always reset to «All». Its Search is a substring match on the name.
- **Do not edit `StockFilterBar.tsx`.** It's Team C's file this round. If it lacks something Product needs, write it in `## Questions` and I'll route it through Porter.
- Everything else in Part 8 stands: the Tabs go, «No matching items», CEO + Kung, and Done.

## Review — part 8 (GR round 10, TASK-956 Slice B) — @Silver, 2026-11-12: ✅ ACCEPTED
- **Re-run by me:** final-ui `npx tsc --noEmit` exit **0**. There is no `ta="center"`; the grep only hits the Modal `centered` prop and a picture `Stack align`. `Product.tsx` l.8 / l.96 imports and draws the **shared** `./StockFilterBar` (the amendment is honoured). `StockFilterBar.tsx` was last written at 20:57, before her work, so it was not edited.
- **Her report says "changing Type resets Product to «All»".** Her code instead uses the shared bar's rule, which clears only a Product outside the new Type. The test case passes because the chosen product is out of type. Only the wording is stale.
- **Evidence:** `result-round10b.txt` **53 PASS / 0 FAIL**. It covers:
  - the 5 cards: Edit, then Cancel leaves the value unchanged, then Save shows the new value with a toast;
  - Save disabled on an empty field;
  - Kung locked out of Payment Setting;
  - the Product bar as CEO and as Kung: each filter, the three combined, the empty state, and «All» restoring the list;
  - 375 px with no overflow, and 0 console problems.
  The regression suites still pass: settings-edit 15, links 15, Stock 35, align 60.
- **Screenshots:**
  - `r10b-payment-edit-modal.png`: «Edit Extra Hour» has one field (350 ฿) with Cancel / Save at the bottom right. Every card has an Edit button, and Bonus 50 / 100 show their new «Amount» row.
  - `r10b-product-filtered.png`: Type F&B gives 2 / 12 rows, the bar sits above the table and the tabs are gone.
- **Two test edits, both accepted:**
  1. `shoot-stock.mjs` now drives the Type select, because the tabs are gone.
  2. `audit-align.mjs` l.116: a container with no button of its own counts as a filter bar, not a form, so its fields may share a row. [SA-decided: matches rule 6's intent ("Save / Cancel go at the bottom"). Sober owns the rule, so I am flagging it to him via Porter. Slice A's StockReport / LowStock / Demo bars share a row the same way.]
- **Nit, not blocking:** `Settings.tsx` l.343 `opened={schoolOpen}onClose=` lost its space. It is valid JSX; tidy it next time you touch the file.
- **Security review:** none (mock page). Next: Porter, then Sober's review and the round-10 build (with Flash's PROPOSED-card removal), then Otto, then Tanya.
- **Addendum (Silver, 2026-11-12, after Fanta's amendment report):** the round10b evidence is now **57 PASS / 0 FAIL**. Its Type check tests the shared bar's rule. As CEO and as Kung (l.35 / l.48): Type → «Miller» clears Product «Snack» to «All», and Type → All keeps it. This settles the stale-wording point above. The verdict stays ✅. The l.343 nit is still open.

## Part 9 — GR round 10b, TASK-956 § 10b-B (Tanya D-151-10a / O-151-10a) — @Fanta — @Silver, 2026-11-12
**Read first:** `TASK-956 § Round 10b → 10b-B` (Sober). It is the spec; this Part only pins the interpretations. **File: `a/salary/Settings.tsx` only.** Reuse the round-10 `rates` / `rateEdit` / `RATE_CARDS` pattern, not a second style.
- **9a School Distance (D-151-10a):** move `SCHOOLS` into page state (`useState(SCHOOLS)`, like `groups`).
  - **Edit → Save** writes that row's KM; reopening Edit shows it (STA 12 → 13).
  - **Add school:** the 2 fields become controlled (no `defaultValue`), start empty, and on Save add the row exactly as typed. The toast is «School <name> (<km> km) added».
  - **Save is disabled** on an empty name, a duplicate name (trimmed, case-insensitive) or KM ≤ 0 / not a number, in both modals. In Edit, the row's own name is not a duplicate.
- **9b Every number on each card (O-151-10a).** Extend `RATE_CARDS` with these fields:
  - **Extra Hour:** Rate · Weekday threshold · Weekend threshold. The thresholds are whole hours, shown as «> <n>th HR» with the right suffix (1st, 2nd, 3rd, 4th…).
  - **OT:** the multiplier only (already editable); the «Salary ÷ 26 ÷ 8 ×» text stays.
  - **Transportation:** for Car and Motorcycle, Per KM **and** Minimum / Trip. [SA-decided: TASK-956's «per-KM rate, Minimum, Trip» = the table's two number columns, «Minimum / Trip» being one column; there is no separate Trip number.]
  - **Bonus 50 / 100:** Amount · Condition · Pay to. Condition and Pay to are `Select`s, `allowDeselect={false}`, whose options are the union of the values both Bonus cards show today. Condition: «New Course/ Voucher Package after 1st Trial» · «Renewal Course». Pay to: «1st Coach». No free text. A select field is never "empty", so Save stays enabled.
  - **Left read-only:** «Apply to», «Hour: Enter manually», «Special Case», «NO: Renewal Voucher», the footnotes and the Thai commission notes. List them in your Notes, as TASK-956 asks.
- **Update the l.48 comment** to the new truth (Minimum / Trip is editable now).
**Done = (TASK-956's):** tsc 0 · scratch build 0 · no `ta="center"`, no Thai added · headless:
- Tanya's repros pass: STA 12 → 13 shows on the row and on reopen; QAS 7 adds the row and the toast names it.
- The 3 disabled cases, in Add and in Edit.
- Every new field: Edit → Save shows the value on the card plus a toast, and Cancel changes nothing.
- Kung is still locked out; 0 console errors.
- round10b 57 + settings-edit 15 + align 60 still pass.
- One screenshot: the Transportation or Bonus edit modal open.

Report in inbox/SA-B.md. While in the file, fix the l.343 nit (`opened={schoolOpen}onClose`).

## Review — part 9 (GR round 10b, TASK-956 § 10b-B) — @Silver, 2026-11-12: ✅ ACCEPTED
- **Re-run by me:** final-ui `npx tsc --noEmit` exit **0**. There is no `ta="center"`.
  - School rows are page state (l.71). Add appends (l.413) and Edit replaces the row (l.451).
  - The l.343 nit is fixed.
- **Evidence:** `result-round10c.txt` **53 PASS / 0 FAIL**. It covers:
  - Tanya's repros: STA 12 → 13 on the row, in the toast and on reopen (l.3–4); QAS 7 added exactly as typed and named in the toast (l.21–22);
  - the 3 disabled cases in Add and in Edit;
  - the ordinal suffixes;
  - the Bonus selects;
  - Cancel;
  - read-only rows unchanged;
  - Kung locked out;
  - 0 console problems.
- **Her other suites, re-run on the same build:** round10b 57, settings-edit 15, align 60, links 15 and Stock 35 still pass.
- **Screenshots:**
  - `r10c-transportation-edit-modal.png`: 4 fields, one per row (Car / Motorcycle × Per KM / Minimum per trip). The School table behind it shows STA 13 KM and an added QAS row.
  - `r10c-bonus-edit-modal.png`: Amount plus the Condition and Pay to selects. The Extra Hour card behind it reads «> 23rd HR», which is the suffix test's leftover state.
- **The Edit school modal also has the name field.** My brief implied it: it has a duplicate check in which the row's own name doesn't count. Accepted.
- **Test edit accepted:** `shoot-round10b.mjs` now expects the 10b field sets, still 57/0.
- **Read-only list** (for TASK-956 Notes): Apply to · OT «Hour: Enter manually» and the «Salary ÷ 26 ÷ 8 ×» text · Bonus 100 «Special Case» and «NO: Renewal Voucher» · the footnotes · the Thai commission notes.
- **Security review:** none (mock page). Next: Porter → Sober review / 10b build → Otto → Tanya.
