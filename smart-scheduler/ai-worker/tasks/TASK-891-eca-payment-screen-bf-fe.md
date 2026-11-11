# TASK-891: ECA Payment screen in the back office (BF)
- Source: final UI `pages/b/revenue/EcaPayment.tsx` (REQ-133, agreed) · TASK-890's contract (`POST /api/v1/revenue/eca`; history = `GET /lines?type=ECA`)
- Owner: FE (Flash, Team C) · SA: Sector · Status: DONE (Sector, 2026-11-09, review 2) · Depends on: none to start. Build against TASK-890's contract with a fake, off by default, as in TASK-859; the real-API run follows TASK-890.
- Repo: `smart-scheduler-backoffice-front` (BF), `dong`. Every file is Team C's (`partials/RevenueLedger/**`, `services/revenue-ledger.service.ts`, `types/app/revenue-ledger.ts`) or a new route folder.
- **Base:** `node node_modules/typescript/bin/tsc --noEmit -p .`. Run it first and paste the result.
- Files (closed list):
  - `src/app/(admin)/revenue/eca/page.tsx` (new);
  - `src/components/partials/RevenueLedger/**` (add `RevenueEca.tsx` + fake data);
  - `src/services/revenue-ledger.service.ts` (one function);
  - `src/types/app/revenue-ledger.ts` (one type).
- Git writes: none.

## What to do
- **Carry the final UI's ECA Payment page over.** Its fields:
  - **School** (a select of the ECA categories from `GET /categories?type=ECA`);
  - **Term**; **Price per class** (whole baht → ×100); **Student**; **Class / Term**; **Payment Date** (default today, Bangkok);
  - **"Total Amount"** shown live as price × students × classes, the one product the screen computes, because the user needs to see it before saving. The server's `amountMinor` is the truth after Save;
  - Save → `POST /eca` → a success note, and the history refreshes.
- **History table** (school, term, total, date) from `GET /lines?type=ECA`, newest first.
- **States:** loading, empty ("No ECA payments yet"), error + retry, a 400 message in the form.
- English labels (D2). Money printed as in TASK-859.
- **Reachable by URL** (`/revenue/eca`); add a link from Summary's header actions next to "Add Manually". The menu is the cut-over TASK's.

## Definition of Done
- [ ] tsc → 0.
- [ ] Shots against the fake (fake off at the end): the form with Total Amount computed, a validation message, the history; 1280 / 768 / 375 with no page scroll.
- [ ] After TASK-890: the same against the real BB on 4310 (`SKIP_ADMIN_AUTH=true`, host check), writing **one** ECA line with term `C-TEST flash 891`.
- [ ] `git status --porcelain`: only the listed files.

## Implementation Notes
(Flash, 2026-11-09. BF `dong` @ `7baca31`, dirty tree (Salary work, other teams'). Nothing committed.)

**Base:** `node node_modules/typescript/bin/tsc --noEmit -p .` → `tsc exit 0`, no output (a first count of "1" was another team's file mid-edit).

**Built:** `src/app/(admin)/revenue/eca/page.tsx` (new) · `RevenueLedger/RevenueEca.tsx` (new) · `RevenueLedger/fake.ts` (+`fakeCreateEca`, and two ECA seed lines) · `RevenueLedger/hooks.ts` (+`useCreateEcaPayment`) · `RevenueLedger/RevenueSummary.tsx` (one header link "ECA Payment" next to "Add Manually") · `services/revenue-ledger.service.ts` (+one function `createEcaPayment`, `POST /v1/revenue/eca`) · `types/app/revenue-ledger.ts` (+one type `CreateEcaPaymentInput`). The history is `listLines({ type: "ECA", from, to })`, nothing new on the API side.

**The screen:** School (a select of `GET /categories?type=ECA`, value = the category id) · Term · Price per class (whole baht, sent ×100) · Student · Class / Term · Payment Date (default today, Bangkok). **Total Amount** is shown live as price × students × classes, the one product this screen computes; the saved line's amount is the server's. Save → `POST /eca`; on success a notification, the four number/term fields clear (School and date stay), and the history refreshes. History = School badge · Term · Total Amount · Payment Date, newest first (the API's order). States: loading, empty ("No ECA payments yet"), error + Retry on the history and on the school list, the API's message in the form on a 400.

**Checks, with real output**
- `tsc` after the build → `tsc exit 0`. `next build` → `✓ Compiled successfully`, `Finished TypeScript`, `✓ Generating static pages (28/28)`, route `├ ○ /revenue/eca` listed, build exit 0.
- `config.ts:5` → `export const USE_FAKE_REVENUE = false;` (flipped to true only for the fake run, restored; `config.ts` does not appear in `git status`). Dev server stopped, port 3310 down.
- `git status --porcelain` vs the baseline I saved: my entries are exactly `M RevenueSummary.tsx · M fake.ts · M hooks.ts · M revenue-ledger.service.ts · M revenue-ledger.ts · ?? revenue/eca/ · ?? RevenueEca.tsx` (7). Everything else that is new in the tree is Salary work (not mine). Old `/revenue` page and `partials/Revenue` untouched (`git diff --stat` → no output).
- **Against the fake, Playwright (real Chrome), BF on 3310 with the API URL forced local** (`.env.local` points at a real server), widths 1280 / 768 / 375, `evidence/TASK-891/shoot.mjs` (`fake-<w>-1-form-total`, `-2-validation`, `-3-history-after-save`): empty form → `Total Amount 0 ฿`; Save empty → "Choose a school", "Enter the term", …; STA · Term 3 · 400 ฿ × 18 × 5 → live **`36,000 ฿`**; 1,000,000 ฿ × 1,000 × 1 → "The total is too large" and nothing sent; correct numbers → note `ECA payment saved STA Term 3: 36,000 ฿, counted on 09/11/26`, history 2 → 3 rows with `STA Term 3 36,000 ฿ 09/11/26` on top, form cleared; Summary header has the "ECA Payment" link. `hscroll` false and `pageErrors: []` at all three widths.
- **Loading and error, fake off, dead API** (`shoot-error.mjs`: `loading-1280.png`, `error-1280.png`): the spinner, then `Network Error Retry` twice (school list and history). (The shared QueryClient retries a few times first, so the error shows after ~7 s.)
- `UNVERIFIED`: the real BB (TASK-890 not run yet); keyboard-only walk, hit targets, reduced-motion, `/impeccable audit` (not run); a real 401; no unit tests (BF has no runner).

**Decided alone (internal; overturn at review):**
1. History window = today − 335 days … today + 30 days (`GET /lines` takes at most 366 days), so a payment dated a little ahead still shows.
2. No demo values in the form (the final UI pre-fills STA / Term 2 / 400 / 18 / 5); School is chosen by the user.
3. The overflow check (> 2,147,483,647 satang, TASK-890's 32-bit rule) is also done before sending, with the message "The total is too large"; the server's own 400 still shows if it answers one.
4. Same tools as TASK-859: Mantine, the repo's `font-num`, `money` / `fmtDate` / `todayBangkok` from `labels.tsx`.

## Questions
1. **Copy nobody wrote (English, D2).** The success note (`ECA payment saved` / `<school> <term>: <total>, counted on <date>`), the field messages (`Choose a school`, `Enter the term`, `Enter a price above 0`, `Enter the number of students`, `Enter the number of classes`, `Choose the payment date`, `At most 40 characters`, `The total is too large`), the empty line `No ECA payments yet` (yours) and the button/heading labels from the final UI. Default: as built; tell me if Porter wants any changed.
2. **Link label.** Summary's header now has a button "ECA Payment". The menu is the cut-over TASK's, as you said.

## Review

## Review

> **answers (Sector, 2026-11-09):**
> 1. **Your copy is accepted as built** (English, D2; plain and specific). Porter can change any line later; a change would be one string each.
> 2. **The "ECA Payment" button in Summary's header is accepted.** The menu comes with the cut-over TASK.
> **Your four decisions are accepted** (the history window, no demo values, the overflow check before send, the shared tools).

**REAL-API RUN DONE (Flash, 2026-11-09), DoD item 3. ONE ECA line written on sid, kept.**
- **Host check first:** BB `dong` @ `45a5977`; `grep -E '^DATABASE_URL=' .env | sed -E 's#…@([^:/]+).*#host \1#'` → `host 154.197.124.206` (sid). The route is there (`src/routes/revenue-ledger.ts:120` `.post("/eca", requireRevenueAccess, …)`); I changed nothing in BB.
- **Servers:** `SKIP_ADMIN_AUTH=true PORT=4310 bun src/index.ts`; BF `NEXT_PUBLIC_BACKOFFICE_API_URL=http://localhost:4310/api next dev -p 3310`, fake OFF (`config.ts:5` `USE_FAKE_REVENUE = false`, `git diff --stat` on it → none); a local dummy route-guard cookie, as before.
- **Before:** `GET /lines?type=ECA` → 0 lines; the page's history showed 0 rows (the empty state). Harness `evidence/TASK-891/shoot-real.mjs` **guards the write**: it reads first and refuses if the term already exists.
- **The one write**, through the real form: School STA, Term **`C-TEST flash 891`**, Price per class 10 ฿, Student 2, Class / Term 3, Payment Date today (2026-11-09). Live Total Amount on screen `60 ฿`; Save → note `ECA payment saved STA C-TEST flash 891: 60 ฿, counted on 09/11/26`; the history refreshed to 1 row `STA C-TEST flash 891 60 ฿ 09/11/26`; no page errors.
- **Read back from sid (GET only):** one line `id 2212044a-94ce-4bb2-9b9a-92c12d936b24` · `occurredOn 2026-11-09` · `branch BRAVO` · `categoryName STA` · **`amountMinor 6000`** (= 1,000 × 2 × 3) · `method TRANSFER` · `remark "10 ฿ × 2 students × 3 classes"` · `source ECA` — all as TASK-890 specifies (amount = price × students × classes, on the payment date, remark text, source ECA).
- Shots: `real-1280-1-validation.png`, `-2-form-total.png`, `-3-saved-history.png`. No student or customer data in them.
- **Left behind:** that one `C-TEST` ECA line on sid (nothing deletes it; Tanya filters on the term). No categories, no other lines.
- **Stopped:** BF 3310 and BB 4310 both confirmed down. Not verified: a real 401 (the dev bypass never returns one), keyboard / audit.

**Review 1, Sector, 2026-11-09. Verdict: the build is ACCEPTED. DONE follows the real-API run once TASK-890 is up** (DoD item 3: one line with term `C-TEST flash 891`).
- **Re-run by me:** `tsc --noEmit` → 0; `config.ts:5` `USE_FAKE_REVENUE = false`.
- **I read `fake-1280-3-history-after-save.png`:** the form matches the final UI (School · Term · Price per class · Student · Class / Term · Payment Date · Total Amount · Save); the history is School · Term · Total Amount · Payment Date, newest first; the saved note reads well; the orange theme (REQ-5010 #1) is in.
- **Footprint:** 7 entries, Team C files only; the old `/revenue` page is untouched.

**Real-API run, how (Sector, 2026-11-09): TASK-890 is DONE (in the BB tree).**
- Same as TASK-859: host check in BB (`.206`), then `SKIP_ADMIN_AUTH=true PORT=4310 bun src/index.ts`.
- BF: `NEXT_PUBLIC_BACKOFFICE_API_URL=http://localhost:4310/api next dev -p 3310`, fake off.
- Write **one** ECA payment, school STA, term **`C-TEST flash 891`**, small numbers; it is kept (no deletes).
- Shoot the form, the save and the history. Stop both servers, report, then set REVIEW.

**Review 2, Sector, 2026-11-09. Verdict: DONE.** I read the real-API run above: a local BB against sid (host checked), fake off, and one write through the real form (STA, term `C-TEST flash 891`, 10 ฿ × 2 × 3). The line read back from sid as `amountMinor 6000`, `occurredOn 2026-11-09`, BRAVO, TRANSFER, with the formula remark. DoD complete. C-TEST data on sid now: that one ECA line (kept).
