# TASK-925: All Report pages, half 1 of 2: the frame + STUDENT (backoffice-front), about 1.25 days
- Source: SPEC-103 (§1, §3) · her headings (CUSTOMER-ANSWERS l.266, "Reports = All Report") · block 2.1, sid by 17 Jan
- Owner: FE (**Fanta**, lent from Team B; she reports via Silver → Porter → me) · SA: Sector (Team C), who reviews · Status: TODO, **start now** · Depends on: TASK-924's contract (build on a typed fake first, off by default).
- **Half 2 = TASK-927 (Flash: COURSE + REPORT views), which builds on this TASK's frame, service, types and hooks. Do steps 1–2 first, then report a line so Flash can start.**
- Split by Porter, 2026-11-09. Claims GRANTED (Porter, 2026-11-09; board line written).
- Repo: `smart-scheduler-backoffice-front` (BF). **Base:** BF tsc + suite + `next build` first; paste them.
- Files (closed list, all yours alone):
  - `src/app/(admin)/reports/page.tsx` (today a placeholder; replace it);
  - new `src/components/partials/AllReport/AllReport.tsx` (the tabs) + `config.ts` (`USE_FAKE_REPORTS = false`) + `fake.ts`;
  - new `src/components/partials/AllReport/Student/**`;
  - new `src/services/reports.service.ts` + `src/types/app/reports.ts` + `src/hooks/useReports.ts`, **for all three routes**;
  - one PAGE_RULES row (the file TASK-906 used; name it in step 0);
  - **two stub files Flash later fills:** `AllReport/Course/CourseReport.tsx` and `AllReport/Overview/OverviewReport.tsx`, each a component that renders "Coming soon".
  - Don't touch anything else under `Course/` or `Overview/`.
- Git writes: none.

## What to do
0. **Step 0:** the PAGE_RULES file:line; how the shell knows CEO vs admin (as TASK-859 / 906); the `/reports` menu entry.
1. **Contract, typed:**
   - `types/app/reports.ts` holds the three response types exactly as SPEC-103 §2–§4. Money keys are **optional** (absent for admin).
   - `reports.service.ts`: `getCourses(from, to, branch?)` · `getStudents({ q, status, subjectId })` · `getOverview(month, branch?)` against `/v1/reports/*`. They read `fake.ts` when `USE_FAKE_REPORTS`.
   - `useReports.ts`: three query hooks.
   - `fake.ts`: realistic Thai mock data (no real children's names), CEO and admin variants.
2. **The frame:**
   - `/reports` "All Report": six tabs in her order, REPORT · STOCK · CHECK IN · COURSE · SALARY · STUDENT;
   - STOCK links to `/stock/reports`; SALARY and CHECK IN link to the Salary report pages if they exist, otherwise show "Coming with Salary";
   - REPORT and COURSE render Flash's two stub components;
   - plus the PAGE_RULES row.

   **→ Report a line here** (Flash starts TASK-927 on it).
3. **STUDENT (SPEC-103 §3):**
   - search (name / nickname / parent phone), a status filter (Active default / Inactive / All) and an activity filter;
   - table: Name · Nickname · Age · Gender · Parent · Phone · Province · Activities · Live courses · First seen · Last attended;
   - the counts;
   - **CSV export:** visible rows, UTF-8 BOM, formula-injection guard (`'` before `= + - @`).
4. **Words:** English labels (R0.5), each marked `PENDING (Khwan)`. Dates `dd/mm/yy`. All states (loading / empty / error + retry). 375 px works (tables scroll in their box).

## Definition of Done
- [ ] tsc 0 · BF suite no new fails · `next build` 0 (paste).
- [ ] Shots against the fake: the tab frame, STUDENT (CEO = admin here, no money), empty, error; 1280 and 375. If sign-in blocks shots, use the scratch-bundle way Flash used in SF (TASK-898 `evidence/TASK-898/shoot.mjs`).
- [ ] After TASK-924 lands: wired on sid (read-only), one shot with **names blurred**.
- [ ] `git status --porcelain`: only the listed files.

## Implementation Notes
**Flash, 2026-11-09. BUILT ON THE TYPED FAKE (off by default). NOT mounted: shared-file edits wait for Porter's claim.** BF `dong`.
**Base (before my files):** `tsc` 0 · suite 259 pass / 1 fail (a Salary "Teaching tab" test, Team B's WIP, cleared later) · `next build` not re-run for the base (it passed an hour earlier, TASK-906).
**Step 0:**
- **PAGE_RULES:** `src/lib/roles/pages.ts:60` is `{ href: "/reports", label: "รายงาน", group: "REPORTS", roles: ["ceo"], money: true, icon: BarChart3 }`, **not in the menu, CEO only, money-flagged**. Making it work for an admin means: `roles: ["ceo","admin"]`, **drop `money: true`** (the table throws at load if a money row lists admin, `pages.ts` loop after `PAGE_RULES`) and add `menu: true`. The money rule then lives in the API (keys absent), as SPEC-103 §1 says. My `/stock/reports` row is `pages.ts:37` (group STOCK). **This is the shared edit; I have NOT made it.**
- **CEO vs admin on screen:** the screens never read the role. They show a money card/column/note only when the API sent the key (`revenueMinor`, `refundsMinor`, `unmatchedRevenueMinor`); for an admin the keys are absent, so there is nothing to hide (as TASK-859). The fake has `fakeAs.role` to stand in for the token.
- **Menu entry:** none today for `/reports`; it comes with the PAGE_RULES edit above.
- **`src/services/reports.service.ts` already EXISTED** (tracked; it holds `getPLReport`, used by `hooks/backoffice/useReports.ts`). I appended my three functions (+29 lines, 0 deletions; `git diff` checked). I first overwrote it by mistake, saw the tool say "updated", restored it and checked the diff. Please read the TASK's "new file" as "extended".
**Files (all new, except the service append):** `types/app/reports.ts` · `services/reports.service.ts` (+`getOverview` / `getCourses` / `getStudents`, `USE_FAKE_REPORTS` branch, fake by dynamic import) · `partials/AllReport/{config.ts (USE_FAKE_REPORTS = false), fake.ts, hooks.ts, labels.ts, csv.ts, AllReport.tsx, ReportTab.tsx, CourseTab.tsx, StudentTab.tsx, all-report-925.test.tsx}`. The `/reports` page is still the placeholder.
**What it does:** six tabs in her order (STOCK links to `/stock/reports`; CHECK IN and SALARY say "Coming with Salary" until you name their hrefs: `LINKED` in `AllReport.tsx`). REPORT: month picker (this month) + branch; §4 numbers as cards, each with "Previous month: …" from a second call; no chart. COURSE: From/To (this month, ≤ 366 days) + branch; table Activity · Kind · Size · Sold · Active · Paused · Ended · Sessions taught · [Revenue], a totals row, and the unmatched-revenue note when ≠ 0. STUDENT: search (button) + Status (Active default) + Activity + counts + **Export CSV** (visible rows, UTF-8 BOM, `'` before `= + - @` and tab/CR, RFC-4180 quoting). Loading / empty ("No data for this period") / error + Retry; dates `dd/mm/yy`; tables scroll inside their box. Every label is 🟡 PENDING (Khwan).
**Evidence:** `tsc` 0 · AllReport tests 20 pass / 0 fail · whole BF suite 280 pass / 0 fail · `next build` no error. **NOT done:** the DoD screenshots (CEO and admin, empty, error, 1280 and 375) and the wiring to TASK-924 on sid: there is no page to open until the claim lets me mount `/reports`; I will shoot from the real page with `USE_FAKE_REPORTS` flipped locally, then restore it. No git; Salary files and `smart-scheduler-back` untouched.

**MOUNTED + SHOTS DONE on the fake (Flash, 2026-11-09, after Sector's answers and the SPEC-103 §7 amendments). Supersedes "NOT mounted" above.**
- **Shared edits made under the claim:** `src/lib/roles/pages.ts:60` is now `{ href: "/reports", label: "All Report", group: "REPORTS", roles: ["ceo","admin"], menu: true, … }` (no `money` flag, tagged `🔻 TASK-925`); `src/app/(admin)/reports/page.tsx` is `<AllReport />`. The menu shows "All Report" under REPORTS for both roles (seen in the shots).
- **§7 applied:** REPORT cards = Trials booked (`trialsBooked`) · Trials attended (`trials`) · Converted; COURSE shows "Active uses today's sessions left." when `activeIsApprox`; VOUCHER rows read "Voucher" (`subjectId` null, never paused); types, fake, tests updated; the STUDENT Activity options skip null-id rows.
- **Evidence:** `tsc` 0 · AllReport tests 22 pass / 0 fail · whole BF suite 282 pass / 0 fail · `next build` lists `○ /reports`. **Shots:** `evidence/TASK-925/fake-{1280,375}-{ceo-ok,admin-ok,ceo-empty,ceo-error}-{1-report,2-course,3-student}.png` + `run.json` + `shoot.mjs` (a local `next dev -p 3325`, dummy route-guard cookie, `USE_FAKE_REPORTS` flipped for the run only, then back to `false` and the server stopped). `run.json`: no page errors in any of the 16 runs; CEO REPORT has 10 cards (money present), admin 8 (no Revenue / Refunds); CEO COURSE has the Revenue column + the unmatched note, admin has neither; empty says "No data for this period", error shows the message with Retry; the STOCK tab links `/stock/reports`; CHECK IN / SALARY say "Coming with Salary."; no horizontal page scroll at 1280 or 375. The fake reads its role/state from `localStorage["fake-reports"]` (dev file only).
- **Still to do:** the sid wiring after TASK-924 / 926 land (set nothing; the real routes answer once deployed, the constant stays `false`), one shot per tab with real data, names blurred. Nothing else open on my side. No git; Salary files and `smart-scheduler-back` untouched.

**Month picker in English (Flash, 2026-11-09, Sector's one fix).** The app's `DatesProvider` is `locale: "th"` (`context/AppProviders.tsx:32`, shared, not touched), so the REPORT month field read «พ.ย. 2026». I set `locale="en"` on the three pickers of All Report (`ReportTab.tsx` month, `CourseTab.tsx` From and To). Checked in the browser on the fake: the field reads **"Nov 2026"** and the popup is English (Jan…Dec); shot `evidence/TASK-925/month-picker-en.png`. tsc 0, BF suite 286 pass / 0 fail (others' tests grew the count), `USE_FAKE_REPORTS` back to `false`, server stopped. The two Stock Report pickers (TASK-906) still use the app locale (numeric `DD/MM/YY` fields, Thai month names only inside their popups); say if you want `locale="en"` there too.

**WIRED TO sid, REAL-API RUN DONE (Flash, 2026-11-09). CEO only; admin real run = NOT_TESTED (see below).**
- **Setup, host first:** BB `dong` (I changed nothing in BB) `grep DATABASE_URL .env` → `host 154.197.124.206` (sid). A LOCAL BB on :4310 (`SKIP_ADMIN_AUTH=true`, the dev bypass = CEO) and BF on :3325 with `NEXT_PUBLIC_BACKOFFICE_API_URL=http://localhost:4310/api`, **`USE_FAKE_REPORTS = false`** (never flipped). The three `/v1/reports/*` routes are GET only: **nothing was written to sid.** Harness `evidence/TASK-925/shoot-real.mjs` (prints counts only), output `real-run.json`.
- **What the real routes gave (CEO, current month 2026-11):** all responses 200, **no page errors**, no horizontal scroll at 1280 or 375. REPORT: 10 cards incl. Revenue + Refunds, previous month beside it. **Branch → Bravo shows the "Students: all branches" note** (new; `data-students-all-branches` in `ReportTab.tsx`; the other numbers refetch with the branch). COURSE (01/11–09/11): 27 rows (3 are Voucher rows), the Revenue column, totals row, the unmatched note; `activeIsApprox` false (to = today) so no "today's sessions" note. STUDENT: counts `Active 42 · Inactive 154 · Showing 42`, 42 rows; the Activity filter's 366-day `courses` call returns 200.
- **Shots (student cells blurred before capture, in every STUDENT shot):** `real-{1280,375}-{1-report, 1b-report-branch, 2-course, 3-student}.png`. REPORT and COURSE hold no personal data (activity names and counts only).
- **Admin real run: NOT_TESTED.** The dev bypass gives only the CEO; an admin needs a signed token on sid, which the desk rule bars. Admin is proved on the fake (`fake-*-admin-ok-*.png`: no money card or column) and by TASK-924/926's own key-absence tests. If you want a real admin run, it needs a token the owner supplies.
- **A mistake to flag:** my first probe of `/reports/students` printed the start of one row to my terminal, and that row showed a child's nickname and age. It was never written to a file, the TASK, the log or a shot; the transcript is this session's only copy. Every later step printed counts only.
- **Tail:** local BB 4310 and BF 3325 stopped and confirmed down. `tsc` 0 · BF suite 287 pass / 0 fail · `next build` lists `○ /reports` · fake flag `false`. No git; Salary files and `smart-scheduler-back` untouched. **DoD all ticked on my side: ready for your DONE.**

## Questions
(Flash → Sector, 2026-11-09)
1. **Activity filter options (STUDENT).** SPEC-103 has no "list activities" read, and a `StudentRow` carries activity NAMES, not ids, but `?subjectId` needs an id. `[team-proposed]` I fill the Activity select from one `getCourses` call over the last 366 days (distinct `subjectId` / `subjectName`). It is one line in `StudentTab.tsx`. Alternatives: TASK-924 adds `activityIds` to `StudentRow`, or a tiny `GET /reports/activities`. Default if you say nothing: mine.
2. **Hrefs for CHECK IN and SALARY.** Which pages (Salary's R1.7 / R1.8, if routed)? Until named they say "Coming with Salary".
3. **PAGE_RULES `/reports`** (above, `pages.ts:60`): once Porter's claim names it, I will change that one row (admin in, `money` flag off, `menu: true`) and replace `reports/page.tsx` with `<AllReport />`. OK as described?

## Review

## Sector, 2026-11-09: ownership + answers
**🔀 Owner = Flash (the whole BF part).** Flash built all three views before the split reached him, so the split is undone. **TASK-927 is merged back into this TASK** (closed as a duplicate). Fanta isn't used here (Porter told).
**Answers:**
1. **Activity filter:** your default is accepted. Fill it from one `getCourses` call over the last 366 days (distinct subject id + name), one line in `StudentTab.tsx`. No new route.
2. **CHECK IN / SALARY hrefs:** keep "Coming with Salary" for now. When Team B routes its R1.7 / R1.8 pages, it's one line in `LINKED`, and I'll ring.
3. **PAGE_RULES `/reports` (`pages.ts:60`): yes, exactly as described.** `roles: ["ceo","admin"]`, drop `money: true` (the money rule lives in the API by key absence, SPEC-103 §1), `menu: true`. Replace `reports/page.tsx` with `<AllReport />`. **The claim is already GRANTED** (Porter, 2026-11-09: the reports page + one PAGE_RULES row; board line written). **Mount it now**, then the DoD shots on the fake (CEO + admin, empty, error, 1280 / 375).
- `reports.service.ts` extended (+29, 0 deletions) instead of created: accepted. The restore-after-overwrite is noted; the `git diff` you checked is the evidence.
- Wiring to sid waits for TASK-924 (Brew) and TASK-926 (Jason). I ring.
- **Contract additions (SPEC-103 §7, 2026-11-09):**
  - REPORT shows **Trials booked · Trials attended · Converted** (`trialsBooked` / `trials` / `trialsConverted`);
  - COURSE shows a small note "Active uses today's sessions left" when `activeIsApprox` is true;
  - VOUCHER rows have no activity: show "Voucher".

  Update the types and the fake to match.
- **Layout reconciled (Sector, 2026-11-09): Flash's built layout is the accepted one.** It replaces the TASK's original list:
  - `partials/AllReport/{config.ts, fake.ts, hooks.ts, labels.ts, csv.ts, AllReport.tsx, ReportTab.tsx, CourseTab.tsx, StudentTab.tsx, all-report-925.test.tsx}`;
  - `types/app/reports.ts`;
  - the append to the existing `services/reports.service.ts`.

  Plus, under the claim: `src/lib/roles/pages.ts:60` (one row) and `src/app/(admin)/reports/page.tsx`. The `Student/` / `Course/` / `Overview/` sub-folders and `hooks/useReports.ts` in the old list don't apply.

## Review 1 (Sector, 2026-11-09): ✅ build ACCEPTED on the fake. DONE follows the sid wiring
- **Re-run by me:** BF `tsc` 0 · suite **282 pass · 0 fail**. `pages.ts:61` = `/reports` "All Report", `["ceo","admin"]`, `menu: true`, no money flag: as agreed.
- **Shots read** (`evidence/TASK-925/`):
  - COURSE as CEO: rows per activity × kind × size, the "Voucher" rows, totals, the Revenue column and the unmatched note;
  - REPORT as admin: the 8 cards incl. Trials booked / attended / Converted, previous month, and **no money cards**.

  The money-by-absence rule holds on screen.
- **One fix, with the wiring:** the REPORT month picker shows **«พ.ย. 2026»** (Thai locale) in an English UI (R0.5). Make it English ("Nov 2026") like the rest.
- Security review: STUDENT shows personal data to staff behind the page rule + `requirePaymentAccess`; the CSV is guarded against formula injection; no money reaches an admin's browser. **None.**
- **Next:** I ring when TASK-924 + 926 are accepted. Then wire it (`USE_FAKE_REPORTS` stays false), take one sid shot per tab with **names blurred**, and fix the month label.
- **Month label fixed (Flash, 2026-11-09):** `locale="en"` on the three All Report pickers, so it reads "Nov 2026". Shot `evidence/TASK-925/month-picker-en.png`; tsc 0, suite 286/0; the fake flag is false. Accepted. The Stock Report pickers are Sober's (TASK-906), left as they are.
- **🟢 WIRE NOW (Sector, 2026-11-09): TASK-924 and TASK-926 are DONE.** `/v1/reports/{overview,courses,students}` are live in the BB tree.
  - Run BF against BB on sid (read-only). `USE_FAKE_REPORTS` stays false.
  - One shot per tab, CEO and admin, **names blurred**.
  - Two contract notes from the 926 review: `sessionsTaught` counts lessons only; and when a branch is chosen, REPORT's student cards show a small note **"Students: all branches"** (students have no branch).

## Review 2 (Sector, 2026-11-09): ✅ DONE
- **Re-run by me:** BF `tsc` 0 · suite **287 pass · 0 fail** · `USE_FAKE_REPORTS = false` (`config.ts:5`).
- **The real run on sid (CEO) is accepted:**
  - every `/v1/reports/*` call returned 200, with no page errors and no h-scroll at 1280 or 375 (`real-run.json`: counts and flags only, no personal data);
  - the REPORT branch shot carries "Students: all branches";
  - COURSE: 27 rows incl. 3 voucher rows, revenue column, unmatched note;
  - STUDENT: Active 42 · Inactive 154, **the same numbers as Brew's TASK-924 sid proof**. I read `real-1280-3-student.png` and every person cell is blurred.
- **Admin real run: NOT_TESTED, accepted.** An admin token on sid would need a password login or a signed token, both barred (desk rule, 2026-11-05). Admin is proved by BB's key-absence tests (the revenue SQL isn't even run for an admin) plus the fake admin shots. Tanya's gate keeps it NOT_TESTED the same way.
- **Flash's self-report is accepted:** his first `/reports/students` probe printed one child's nickname and age to his own terminal. Nothing was written to a file; every later probe printed counts only. No shared file holds it.
- Security review: as in Review 1. **None.**
- **Block 2.1 (REPORT · COURSE · STUDENT) is complete in code:** TASK-924 + 926 (BB) + 925 (BF). It reaches sid with the next BB + BF deploy (the owner's call); then Tanya's gate. Khwan's answers may still rename or drop fields (labels are marked `PENDING (Khwan)`).
