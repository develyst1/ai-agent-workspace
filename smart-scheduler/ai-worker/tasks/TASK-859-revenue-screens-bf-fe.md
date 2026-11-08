# TASK-859: Revenue screens in the back-office front (Summary · Detail · Add Manually · Type and Category)
- Source: SPEC-098 §1.5, §1.7, §2 (codes ↔ labels), §3 (contract), §4
- Owner: FE (Flash, Team C)
- Status: DONE (Sector, 2026-11-08; review 3)
- Depends on: none to start. You build against the SPEC §3 contract. **Wiring to the real API is proven** once TASK-858 is REVIEW/DONE. Until then, prove the screens against a local fake (below).
- Repo: `smart-scheduler-backoffice-front` (BF). Commit convention is the repo's own; git per the `git-command` skill, the SA's alone. Held by Team C on the REQ-120 batch claim (Porter, board `## Batch claims`).
  - **Do not start until that claim line names Team C's BF areas.**
- Base branch: `dong`
- Started from: base commit `afcf30e`
- Repo history read: 2026-11-08, `dong` HEAD `afcf30e`, clean tree
- Files the engineer may edit (closed list, nothing else):
  - `src/app/(admin)/revenue/summary/page.tsx`, `src/app/(admin)/revenue/detail/page.tsx`, `src/app/(admin)/revenue/manual/page.tsx`, `src/app/(admin)/revenue/categories/page.tsx` (all new)
  - `src/components/partials/RevenueLedger/**` (new folder; your components and their co-located tests)
  - `src/services/revenue-ledger.service.ts` (new)
  - `src/types/app/revenue-ledger.ts` (new)
- **Not yours, and unchanged:**
  - `src/app/(admin)/revenue/page.tsx`
  - `src/components/partials/Revenue/**` (the live REQ-014 screen)
  - `AdminLayout.config.ts` (the menu; the block's cut-over TASK swaps it, SPEC §1.7)
  - every other team's folder
- Git writes allowed: **none.** The engineer never runs git. Reviewed changes stay in the working tree. The SA commits and pushes only on the owner's command, relayed by the PM.

## What to do
Carry the four screens over from the agreed final UI (`SOM-BALANCE-Backoffice-spec/final-ui`, REQ-133 md5 1d0ce1f6; a prototype, never the product):
- `src/pages/b/revenue/Summary.tsx` → `/revenue/summary`
- `Detail.tsx` → `/revenue/detail`
- `Manual.tsx` → `/revenue/manual`
- `Categories.tsx` → `/revenue/categories`

Match their layout, fields, labels and wording. Replace the mock data (`src/mock/b-revenue.ts`) with the SPEC §3 API.
1. **Types and service:** `revenue-ledger.ts` types mirror SPEC §3 field-for-field (camelCase; money in satang). The service has one function per endpoint, using the existing `api` client (`src/lib/api/client.ts`, as `reports.service.ts` does), with paths `/v1/revenue/...`.
2. **Labels (D2, English):** one map in your folder, from SPEC §2's codes to labels:
   - COURSE → "COURSE"; TRIAL → "1st Trial"; FNB → "F&B"; REFUND → "Refund"; and so on for the other types;
   - BRAVO → "Bravo"; CARD → "Credit card"; and the rest.
   - Never print a code.
   - Money is shown as baht with thousands separators (satang ÷ 100), the way the final UI prints it.
3. **Summary:** Today / MTD / YTD from `GET /summary?date=`. Show all 8 rows, the total, and refunds shown apart, as in the final UI. A date picker defaults to today (Asia/Bangkok).
4. **Detail:** `GET /lines`. Columns: Date · Branch · Type · Category · Product Name · Amount · Payment · Remark (R2.5). Filters: branch · period (day / month / custom) · type · category, as in the final UI's Detail. The total row uses `totalMinor`.
5. **Add Manually:** the final UI's form, posting `POST /lines`.
   - The Category list is `GET /categories?type=` for the chosen type.
   - Type excludes Refund.
   - On 201, go to `/revenue/detail` for that date.
   - On 400/409, show `error.message` in the form.
6. **Type and Category:** the tree from `GET /categories`, plus the add dialog → `POST /categories`. Show a 409 as "This category already exists".
7. **States, on all four screens:** loading, empty ("No revenue in this period"), error (the API message plus a retry), and a 401 handled the way the existing pages handle it.
8. **Local fake, while TASK-858 isn't done:**
   - a dev-only fake behind your service, switched by a constant in your folder;
   - **never** an env key, and **off** by default in the delivered code;
   - data taken from the final UI mock, converted to the SPEC §3 shapes.

**You may decide alone, and declare in Implementation Notes:** component split, file names inside your folder, and the table component.
**You may not:**
- add a dependency;
- change the shared layout, theme or client;
- touch the old Revenue screen.

## Definition of Done
- [ ] The type check is clean: `node node_modules/typescript/bin/tsc --noEmit -p .`. Base (Sector, 2026-11-08, `afcf30e`): exit 0, no output. Expected: the same. (`npm run lint` is broken on the base, since Next 16 has no `next lint`, so it is not a check.)
- [ ] Each screen renders. Run `next dev -p 3310`. Screenshot each of the four routes, saved under `smart-scheduler/ai-worker/evidence/TASK-859/` in the workspace, never a scratchpad path:
  - against the fake: Summary with all 8 rows, Detail with a filter applied, Add Manually showing a validation message, Type and Category with the add dialog open;
  - and, once TASK-858 is up on BB port 4310, the same four against the real API.
- [ ] The old screen is unchanged. `git diff --stat -- "src/app/(admin)/revenue/page.tsx" src/components/partials/Revenue src/components/layout` → no output.
- [ ] The fake is off by default. Show the constant's line in Implementation Notes.
- [ ] No file outside the closed list changed. Proven by: `git status --porcelain`.

## Implementation Notes
(Flash, 2026-11-08. Repo `smart-scheduler-backoffice-front`, branch `dong`, HEAD `afcf30e`. Nothing committed.)

**Before/after repo state.** Before I started the tree already held 16 modified/untracked entries (Team A's shell work: `layout.tsx`, `AdminLayout/*`, `lib/auth.ts`, `proxy.ts`, …). I saved `git status --porcelain` first and diffed after. My footprint is exactly:
```
?? src/app/(admin)/revenue/{categories,detail,manual,summary}/   (one page.tsx each)
?? src/components/partials/RevenueLedger/   (RevenueSummary/Detail/Manual/Categories.tsx, hooks.ts, labels.tsx, parts.tsx, config.ts, fake.ts)
?? src/services/revenue-ledger.service.ts
?? src/types/app/revenue-ledger.ts
```
`git diff --stat -- "src/app/(admin)/revenue/page.tsx" src/components/partials/Revenue` → no output. `package.json` / lockfile untouched. I did not run `git diff` on `src/components/layout`: Team A already has edits there (in the baseline), so it cannot be empty and is not mine.

**Checks, with the real output**
- `node node_modules/typescript/bin/tsc --noEmit -p .` → `exit 0`, no output (base was 0). It does include my files: `--listFilesOnly | grep -c` → 15.
- `next build` → `✓ Compiled successfully`, `Finished TypeScript`, `✓ Generating static pages (19/19)`, exit 0; routes `/revenue/summary · /detail · /manual · /categories` listed; old `/revenue` still there.
- Tests: this repo has **no test script or test runner** in `package.json` and I may not add a dependency, so there are **no unit tests** and no count before/after. `UNVERIFIED` as a unit-level claim; the screen behaviour is covered by the harness runs below.
- Fake switch: `src/components/partials/RevenueLedger/config.ts:5` → `export const USE_FAKE_REVENUE = false;` (delivered **off**; I flipped it to `true` only for the fake run and restored it, then the error run and the build ran with it `false`).
- Grep of my files for hex colours / `transition-all` / `z-index` → none.

**Screens, run by Playwright (real Chrome, headless), `next dev -p 3310`** — harness + screenshots are in `evidence/TASK-859/` (`shoot.mjs`, `shoot-error.mjs`). Scope of the proof: **layout, render and form behaviour against the dev fake.** The fake answers instantly with one shape, so server behaviour is not proven by it.
- Fake ON, widths 1280 / 768 / 375, `fake-<width>-<n>-….png`: Summary for 16/10/26 shows all 8 rows, Total 82,700 ฿ and Refund −5,000 ฿ (the final UI's numbers); Detail with Type = SALES and 14–16/10/26 → 3 items, total 7,100 ฿; Add Manually with Save pressed empty → "Choose a type / Choose a category / Enter an amount above 0"; Type and Category with the add dialog open, then "This category already exists" for OTHER · Shirt (the 409 path); and Add Manually → Save → lands on `/revenue/detail?from=2026-11-08&to=2026-11-08` showing the new line. All four pages: no horizontal page scroll at any of the 3 widths (`document.documentElement.scrollWidth > innerWidth` = false). Browser console: 0 errors except `favicon.ico` 404 once (the repo has no favicon; not mine).
- Fake OFF, API URL forced to `http://localhost:4310/api` where nothing listens (`error-1280-*.png`, `loading-1280-*.png`): every screen shows its loading spinner, then its error card with the message `Network Error` and a **Retry** button. The shared QueryClient retries a failed call a few times first, so the error card shows after ~7 s. Empty state: Summary for today on the fake ("No revenue in this period") seen in the browser pane.
- 🟡 **`UNVERIFIED — real API.`** TASK-858 is not up (BB 4310 returned nothing), so the second set of four screenshots against the real API is **not done**. Settle it by: Brew's TASK-858 REVIEW → `PORT=4310` BB → these same two scripts with the fake off.
- `UNVERIFIED`: keyboard-only walk, hit targets ≥ 44 px (Mantine `sm` controls are 36 px; I did not enlarge them, to stay on the repo's theme), reduced-motion, `/impeccable audit` (not run). A 401 is handled by the shared axios interceptor in `src/lib/api/client.ts` (redirect to `/login`); I did not exercise it.

**Footprint of my testing.** No account, record or file was created anywhere real: the fake is in memory; the dev servers I started on port 3310 are stopped. The `bo_token` cookie I used is a locally built dummy (`flash-task859-evidence`, role `ceo`, unsigned) set only in my own Playwright browser contexts and the browser pane, to get past the route guard; it is not a credential and nothing was sent with it to any server.

🔴 **Found while running — for `SYSTEM-FACTS.md` (Sector to place; I may not write there):** the BF `.env.local` on this machine has `NEXT_PUBLIC_BACKOFFICE_API_URL=https://backoffice-som.develyst.online/api` — a **real remote server**. A plain `next dev` therefore sends every API call there. I never let a run use it: I forced the env var on the command line (`NEXT_PUBLIC_BACKOFFICE_API_URL=http://localhost:4310/api next dev -p 3310`; the process env wins over `.env.local`). The same file is why the SPEC §4 line is wrong (Q3).

**Decided alone (internal, one line each; overturn at review)**
1. Components split by screen, plus `hooks.ts` (React Query, repo pattern), `labels.tsx` (code→label map, `money`, `fmtDate`, `todayBangkok`), `parts.tsx` (page header + the 4 states) — all inside my folder.
2. Tables are Mantine `Table` (the repo and the final UI both use it); money cells use the repo's `font-num` class; `whitespace-nowrap` so `฿` never wraps (seen and fixed in the first screenshot).
3. Money prints as the final UI does (`3,705 ฿`, refund `−5,000 ฿`), but a non-zero satang part is kept (`1,250.50 ฿`), never rounded away — a ledger that rounds can stop adding up.
4. Dates print `DD/MM/YY` (final UI); "today" is the Asia/Bangkok calendar date via `Intl.DateTimeFormat`, no new plugin.
5. Summary "View" links to `/revenue/detail?from=&to=&type=[&branch=]` for the active tab's range; Detail reads those four params once for its first filters (needs the `Suspense` in `detail/page.tsx`).
6. Detail validates the range before Apply (from ≤ to, ≤ 366 days) so the API's 400 is never the first message.
7. Add Manually opens with **no demo values** (the final UI pre-fills `OTHER / Shirt / 500`): date = today, branch Bravo, method Transfer, the rest empty; amount is whole baht (final UI: no decimals), sent as `×100`.
8. Type and Category: COURSE names are split on ` · ` into sports; a COURSE name without it is shown under "Other Course" (Balance Camp, Birthday, and anything added later). The final UI put a newly added course category under every sport card, which I did not copy.
9. The fake is loaded by a dynamic `import()` only when the constant is on, so the delivered bundle does not carry it.

**Rework 1 (Flash, 2026-11-08) — Sector's two points, exactly:**
- **Detail total.** `ListLinesResult` now has `revenueMinor` and `refundsMinor` (types + fake). The total row reads `Total Revenue (N items)` = `data.revenueMinor`; a `Refund (Expense)` row = `data.refundsMinor`, shown only when it is not 0. The screen no longer sums any money (N = a count of non-refund rows). Files: `types/app/revenue-ledger.ts`, `RevenueLedger/fake.ts`, `RevenueLedger/RevenueDetail.tsx`. 🟡 Against the real API this needs TASK-858 to return the two fields (SPEC-098 §3) — `UNVERIFIED` until then.
- **Remark clipped.** Remark text now wraps inside a column capped at 160–260 px and the scroll container's minimum width is 760 (was 960). Measured by `shoot.mjs` (`detailTableFits`): at 1280 the table is 942 px in a 942 px viewport, `scrolls: false` — every column shows in full. At 768 and 375 the table scrolls horizontally **inside the card** (760 px in 686 / 309), and the page has no horizontal scroll (`hscroll` false on all four screens).
- Re-shot 1280 / 768 / 375 against the fake: `evidence/TASK-859/fake-*` (new: `-2b-detail-with-refund.png` — Total Revenue (13 items) 82,700 ฿ and Refund (Expense) −5,000 ฿, the final UI's numbers).
- Re-run after the edits: `tsc --noEmit` exit 0; `next build` exit 0 (all four routes listed); `config.ts:5` → `USE_FAKE_REVENUE = false`; `git status --porcelain` identical to review 1 (same 7 entries); `git diff --stat` on the old page and `partials/Revenue` → no output. Dev server on 3310 stopped; I ran it with the API URL forced to `http://localhost:4310/api`.
- Still open, unchanged: real-API run (TASK-858), keyboard / hit-target / reduced-motion, `/impeccable audit`.

## Questions
(All in one message, per the hop rules. I carried on with the default shown; each is cheap to change.)
1. **Summary filters.** The final UI's Summary has Branch · Period · Type · Category. SPEC §3 `GET /summary` takes only `date` and `branch`, and returns the three blocks together. So I built Branch · **Date** (as TASK §3 says) · Type (filters the rows on the screen) with the Today/MTD/YTD tabs, and **left out Period (Custom range) and Category** on Summary: the API cannot answer them there, and a custom range lives on Detail. Default I took: as built. Alternative: Sector adds `from`/`to`/`categoryId` to `/summary` in SPEC-098 and I add the controls.
2. **Detail total.** The final UI's Detail shows "Total Revenue" **without** refunds, then a "Refund (Expense)" row. TASK §4 says the total row uses `totalMinor`, which SPEC §3 defines **with** refunds. I show `Total (N items, refunds included)` = `totalMinor`, and, when the list has refund lines, `of which Refund (Expense)` = the sum of those lines. Default: as built. Alternative: the final UI's split (I would show `totalMinor − refunds` as "Total Revenue", which is a sum on the screen).
3. **SPEC §4 env line.** It reads `NEXT_PUBLIC_BACKOFFICE_API_URL=http://localhost:4310`, but the client's `baseURL` already must end in `/api` (`.env.example`: `http://localhost:4010/api`) and the paths start at `/v1/revenue`. Without `/api` every call 404s. I used `http://localhost:4310/api`. Default: SPEC §4 should say `…:4310/api`.
4. **Two final-UI controls not built.** Summary's "Refund" button (the refund screen is a later SPEC) and Detail's "Export" (SPEC-098 §3: "Not in this SPEC: … export"). Default: omitted.
5. **Manual form has no Product Name field.** SPEC §3 allows an optional `productName`; the final UI's form has none, so the API's default (the category name) applies, and Detail's old "Description" column is "Product Name" as TASK §4 says. Default: as built.

> **answers (Sector, 2026-11-08):**
> 1. **Summary filters:** as built, accepted [SA-decided]. `/summary` answers per date and branch; a custom range is Detail's job. The final UI's Period and Category on Summary are not built in this SPEC. If Khwan asks for them, it is a SPEC change, not yours.
> 2. **Detail total:** follow the **agreed final UI**: "Total Revenue" without refunds, then a "Refund (Expense)" row. The numbers come from the API, not from sums on the screen. **SPEC-098 §3 now adds `revenueMinor` and `refundsMinor` to `GET /lines`** (Brew adds them in TASK-858). Show `revenueMinor` as Total Revenue, and `refundsMinor` as the Refund row when it is not 0. Add both fields to your types and fake.
> 3. **Env line:** you are right. SPEC §4 now reads `…:4310/api`, set inline.
> 4. **Refund button and Export:** omitting them is correct (later SPECs).
> 5. **No Product Name field:** as built, accepted.
> **SYSTEM-FACTS candidate (BF `.env.local` → deployed sid back office):** I am placing it.

## Review
**Review 1, Sector, 2026-11-08. Verdict: REWORK (small, 2 items). The real-API proof is still open (it depends on TASK-858).**
- **Checked myself:**
  - `node node_modules/typescript/bin/tsc --noEmit -p .` → exit 0, no output;
  - `git status --porcelain | grep -i revenue` → exactly the 7 entries in the closed list, nothing else of yours;
  - `git diff --stat` on the old `/revenue` page and `partials/Revenue` → no output;
  - `config.ts:5` → `USE_FAKE_REVENUE = false`;
  - I read `fake-1280-1-summary.png` and `fake-1280-2-detail-filtered.png`.
  - **Not re-run by me:** `next build` and the Playwright scripts. Your pasted output is accepted for those.
- **Good:**
  - the layout and states match the final UI;
  - the fake is off by default and dynamically imported;
  - your evidence covers 3 widths, the 409 path and the error and loading states;
  - forcing the env var inline instead of using `.env.local` was the right call.
- **REWORK 1, Detail total (Q2):** "Total Revenue" = `revenueMinor`, plus a "Refund (Expense)" row = `refundsMinor` when it is not 0, as in the final UI. Use the new SPEC §3 fields; no sum computed on the screen. Update the types and the fake.
- **REWORK 2, the Remark column is clipped** at 1280 px in `fake-1280-2-detail-filtered.png`: "…10 % off this item" and "…on this item" are cut at the card's right edge. Fix it so every column shows in full at 1280. Either the long text wraps inside a width-capped Remark column, or the table sits in a horizontal scroll container *inside the card*. Re-shoot 1280 / 768 / 375.
- **Not yours, noted to Porter:** the shell header reads "รายได้แยกตามกิจกรรม" (Thai, the old menu's label) on the new pages. It comes from Team A's shell and the old menu entry. It goes away at Revenue's cut-over menu swap; D2 says the back office is English.
- **Still open after the rework (DoD item 2b):** the same four screens against the real API on BB 4310. That needs TASK-858 REVIEW plus its migration on sid. Then DONE.

**Review 2, Sector, 2026-11-08. Both rework items: ACCEPTED. Status stays REVIEW until the real-API proof is in; then DONE.**
- **Checked myself:**
  - `tsc --noEmit` → exit 0;
  - `git status --porcelain | grep -ic revenue` → 7 (unchanged);
  - `config.ts:5` → `USE_FAKE_REVENUE = false`;
  - I read `fake-1280-2-detail-filtered.png`: Remark wraps inside its column, every column is visible, and the row reads "Total Revenue (3 items) 7,100 ฿";
  - the three `-2b-detail-with-refund` shots exist.
- **Open:** the four screens against the real API on BB 4310, once TASK-858 is REVIEW and its migration is on sid. I'll ring you then.

**Real-API run, how (Sector, 2026-11-08). TASK-858 is DONE and 0008 is on sid.**
1. **Host check first, in BB:** `grep -E '^DATABASE_URL=' .env | sed -E 's#^DATABASE_URL=[a-z]+://[^@]*@([^:/]+).*#host \1#'` must print `154.197.124.206`. Anything else ⇒ stop and tell me.
2. **Start BB locally:** `SKIP_ADMIN_AUTH=true PORT=4310 bun src/index.ts`. The dev bypass makes every call the dev **ceo**: a local process only, no password, no token signed.
3. **Start BF:** `NEXT_PUBLIC_BACKOFFICE_API_URL=http://localhost:4310/api next dev -p 3310`, with your dummy route-guard cookie as before.
4. **Shoot the same four screens.** Writes on sid are allowed, as **Team C test data only**:
   - one manual line with remark starting `[C-TEST]`, branch Other;
   - one category named `C-TEST <something>`.
   - Nothing can delete them, so make exactly one of each.
   - The 409 path: add the same `C-TEST` name twice.
5. **Stop both servers,** paste the shots and what you wrote, then set REVIEW.

**Real-API run result (Flash, 2026-11-08) — DoD item 2b, all four screens against BB 4310.**
- **Host check (step 1):** BB `dong` @ `aa2a7cc`; the `grep … | sed …` one-liner printed `host 154.197.124.206` — the expected sid host, so I went on.
- **Servers (steps 2–3):** `SKIP_ADMIN_AUTH=true PORT=4310 bun src/index.ts` and `NEXT_PUBLIC_BACKOFFICE_API_URL=http://localhost:4310/api next dev -p 3310`, fake OFF (`config.ts:5` → `USE_FAKE_REVENUE = false`), the same dummy route-guard cookie. Before the browser run, read-only `curl` showed the real API: `GET /categories?type=OTHER` → Shirt / Sock / Bag; `GET /lines` → `{"lines":[],"totalMinor":0,"revenueMinor":0,"refundsMinor":0}` (**TASK-858 does return the two new fields**); `GET /summary` → all 8 rows.
- **Written on sid, Team C test data only, exactly one of each** (the harness reads first and refuses to write twice; read back afterwards with `curl`):
  - one manual line: id `3b6e6992-8018-44b2-9c01-9d331346cda3`, 2026-11-08, branch OTHER, type OTHER · Shirt, 10000 satang (100 ฿), TRANSFER, remark `[C-TEST] flash TASK-859 evidence`;
  - one category: `C-TEST flash 859` (type OTHER), seen once in `GET /categories?type=OTHER&includeInactive=true`.
  - **Not removed — nothing can delete them** (as the steps said). They stay on sid; Tanya filters on `[C-TEST]` / the `C-TEST` name.
- **Screens, real API, 1280 (`evidence/TASK-859/real-1280-*.png`, harness `shoot-real.mjs`):**
  - Summary before the write: the empty state "No revenue in this period" (the ledger was empty — a real render of that state); after the write all 8 rows, OTHER = 100 ฿, Total Revenue 100 ฿, Refund (Expense) 0 ฿ (`1-summary-before`, `1b-summary-after`).
  - Detail filtered (today, type OTHER, branch Other): the new line, `Total Revenue (1 items) 100 ฿` = the API's `revenueMinor` (`2-detail-filtered`).
  - Add Manually: validation messages with nothing written; then a real Save → landed on `/revenue/detail?from=2026-11-08&to=2026-11-08` showing the line (`3-manual-validation`, `5-manual-saved-detail`).
  - Type and Category: the real 53-row tree with the dialog open (no write); then the real **409**, shown as "This category already exists" (`4-categories-dialog`, `4b-categories-409`).
  - Browser console: `favicon.ico` 404 (repo has none) and the one expected 409; nothing else.
- **Not mine, seen:** the shell side menu now also shows a "SALARY" group (Team A / Fanta's work); BF `git status` has new `salary` entries that are not in my footprint. My own footprint is still exactly the 7 revenue entries (`git status --porcelain | grep -ic revenue` → 7); the old `/revenue` page and `partials/Revenue` are untouched.
- **Servers stopped:** ports 3310 and 4310 both confirmed down. I made no change in BB (`git status` there is other people's work).
- **Still `UNVERIFIED`:** keyboard-only walk, hit targets ≥ 44 px, reduced-motion, `/impeccable audit` (not run); a real 401 path (the dev bypass never returns one); unit tests (repo has no runner).

**Review 3, Sector, 2026-11-08. Verdict: DONE.**
- I read `real-1280-1b-summary-after.png`: the real API through the real SQL. OTHER 100 ฿, Total Revenue 100 ฿, all 8 rows.
- His report covers the rest of DoD 2b: Detail = `revenueMinor`; the real Save lands on Detail; the real 409; the empty state. Exactly one `[C-TEST]` line and one `C-TEST` category were written on sid, both recorded with ids. Servers stopped. Footprint is still 7.
- **Polish for the Revenue cut-over TASK (not a defect here):** a zero refund prints in red ("0 ฿"). Red only below 0.
- **Accepted as UNVERIFIED** (outside this TASK's DoD): keyboard walk, 44 px targets, reduced motion, a real 401.
