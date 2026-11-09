# TASK-873: Revenue screens: พี่ฟีน's wording (REQ-5010 items 12a, 14) + the zero-refund colour
- Source: REQ-5010 § Owner's ruling (owner, 2026-11-08, verbatim: *"แก้แค่ข้อความ หรือ UI นิดหน่อย ทำให้ฟรี ทีเหลือ หากเป็นการแก้หลักการ ให้เก็บไปคุย"*) · CHECK-REQ-5010 §Sector rows 12a and 14 · TASK-859 review 3 (the zero-refund colour)
- Owner: FE (Flash, Team C)
- Status: DONE (Sector, 2026-11-08)
- Depends on: none
- Repo: `smart-scheduler-backoffice-front` (BF), inside Team C's existing BF claim (Batch 2026-11-08: `partials/RevenueLedger/**`). Git is the SA's alone, on the owner's word.
- Base: `dong`, dirty tree (other teams' work); Team C's footprint = 7 revenue entries. **Base check (Sector, 2026-11-08):** `node node_modules/typescript/bin/tsc --noEmit -p .` → exit 0.
- Files the engineer may edit (closed list): `src/components/partials/RevenueLedger/RevenueSummary.tsx` · `RevenueDetail.tsx` · `RevenueManual.tsx` · `RevenueCategories.tsx`
- Git writes: **none.**

## What to do (wording and colour only; no logic change)
1. **12a:** the Summary page heading `"Revenue Summary"` → **`"Summary"`** (`RevenueSummary.tsx:72`). Also change the link labels that name that page: `RevenueDetail.tsx:133` and `RevenueManual.tsx:69` `"Revenue Summary"` → `"Summary"`. The route `/revenue/summary` stays.
2. **14:** the Type and Category button `"Add category"` → **`"Add"`** (`RevenueCategories.tsx:84`). The dialog title (`:144`) stays "Add category".
3. **Zero refund:** the "Refund (Expense)" cell is red only when the amount is **below 0**; a 0 prints in the normal text colour. This applies to `RevenueSummary.tsx:166` and the matching cell `RevenueDetail.tsx:291`. Leave `RevenueDetail.tsx:214` and `parts.tsx:62` alone: those are error messages.

## Definition of Done
- [ ] `node node_modules/typescript/bin/tsc --noEmit -p .` → exit 0.
- [ ] `grep -rn '"Revenue Summary"\|>\s*Add category' src/components/partials/RevenueLedger` → no output (the dialog title `title="Add category"` remains and is expected).
- [ ] Screenshots against the fake (fake on only for the run, then back off; `config.ts:5` false at the end), saved to `evidence/TASK-873/`:
  - Summary with heading "Summary" and a 0 refund in normal colour;
  - Summary or Detail with a −5,000 refund in red;
  - Type and Category with the "Add" button.
- [ ] `git status --porcelain | grep -ic revenue` → 7 (no new files).

## Implementation Notes
(Flash, 2026-11-08. BF `dong`, dirty tree as before. Nothing committed.)

**Changes (4 files, exactly the closed list; wording and colour only):**
1. 12a: `RevenueSummary.tsx:72` heading `"Summary"`; link labels `RevenueDetail.tsx:133` and `RevenueManual.tsx:69` → `"Summary"`. Route unchanged.
2. 14: `RevenueCategories.tsx:84` button `Add`. Dialog title `:144` still `Add category`.
3. Zero refund: `RevenueSummary.tsx:166` and `RevenueDetail.tsx:291` now `c={… < 0 ? "red.7" : undefined}`, so 0 prints in the normal colour. `RevenueDetail.tsx:214` (error text), `parts.tsx` and the per-line refund-row colour at `RevenueDetail.tsx:268` are untouched (that one is a −amount line, always red).

**Checks, with real output**
- `node node_modules/typescript/bin/tsc --noEmit -p .` → `tsc exit 0`, no output.
- `grep -rn '"Revenue Summary"\|>\s*Add category' src/components/partials/RevenueLedger` → no output (`grep exit 1`). Only `RevenueCategories.tsx:144 title="Add category"` remains, as expected.
- `git status --porcelain | grep -ic revenue` → `7` (no new files in BF). `git diff --stat` on the old `/revenue` page and `partials/Revenue` → no output.
- `config.ts:5` → `export const USE_FAKE_REVENUE = false;` (flipped to `true` only for the screenshot run, restored; dev server on 3310 stopped, `curl` → 000).
- Playwright run, fake on, 1280 (`evidence/TASK-873/shoot.mjs`, output pasted): page heading `Summary`; Refund cell on 15/10/26 `0 ฿` computed colour `rgb(201, 201, 201)` (the table's normal text); on 16/10/26 `−5,000 ฿` computed colour `rgb(240, 62, 62)` (red); Detail and Add Manually each have one `Summary` link; Type and Category has one `Add` button and no `Add category` button; clicking `Add` opens a dialog titled `Add category`.
- Screenshots in `evidence/TASK-873/`: `1-summary-zero-refund.png`, `2-summary-minus-refund.png`, `3-detail-minus-refund.png`, `4-categories-add-button.png`.
- `UNVERIFIED`: not run against the real API (the change is wording and colour only, the data path is untouched); no `next build` this time (tsc only, as the DoD asks).
- Footprint of my testing: none; the fake is in memory.

## Questions
None.

## Review
**Review, Sector, 2026-11-08. Verdict: DONE.**
- **Re-run by me:** `tsc --noEmit` → exit 0; the label grep → 0 lines; `config.ts:5` false.
- **I read `1-summary-zero-refund.png`:** heading "Summary", and "Refund (Expense) 0 ฿" in the normal colour.
- **His computed-colour check covers the rest:** −5,000 in red; one "Summary" link each on Detail and Add Manually; one "Add" button, with the dialog title still "Add category".
- Footprint is still 7; no logic changed. No security surface.
