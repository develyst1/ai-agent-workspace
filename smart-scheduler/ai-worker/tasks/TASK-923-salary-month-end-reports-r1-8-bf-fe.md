# TASK-923 — FE: REQ-120 R1.8 **month-end SALARY reports page** (teaching summary + salary / other income, with Excel) (backoffice-front) — @Fanta — now, on a fixture seam; wired when TASK-922 lands — Silver reviews
**From @Silver, 2026-11-09.** The FE half of R1.8. **There's no final-UI page,** so build it **in the back office's existing Salary style** (Fern's `SlipView` / `parts.tsx` patterns, your 862 tables). No new visual language. Repo `smart-scheduler-backoffice-front`, branch `dong`. **No git command: git only on the owner's word.** **Size ≈ 1.5 d.**

## What to build
- **One CEO-only page** `/salary/reports`, menu title **"Salary Report"** (`PAGE_RULES`, `["ceo"]`), with the ‹ period › picker (the R1.4 label, as Pay run shows it) and two tabs:
  - **Teaching:** TASK-922 (A).
    - Columns: Coach · Role · Private · Duo · Group · ECA · Camp (hours) · Weekday · Weekend · Total · Classes.
    - A totals row.
    - No money.
  - **Pay:** TASK-922 (B).
    - Columns: Coach · Status · Base · then **"Other income"** as a column group: Freelance Hour · Extra Hour · OT · Merit · Bonus · Commission · Transportation · Other ±. Then Total.
    - A totals row.
    - The class / kind words are the existing approved ones (TASK-885's `CLASS_WORDS`, the slip's `KIND_LABEL`, REQ-5010's "Freelance Hour" / "OT Hour" rulings).
  - **Export Excel** on each tab → TASK-922 (C).
- **Names:** join from the people read you already use (869). "No Teacher" is never shown.
- **Money:** satang → baht through `money.ts`.
- **New words:** only the page title "Salary Report" and the tab names "Teaching" / "Pay". Mark them `PENDING (Porter)` until he approves; that's the same line he sends ขวัญ.
- **Seam:** your own new `services/salary-reports.service.ts` + types + fixture, with `REPORTS_SOURCE = "fixture"` until TASK-922 is accepted, then `"api"`. No component imports the fixture.

## Tests
- CEO-only (an admin / coach get the guard);
- the totals row = Σ rows;
- the Pay row total = the API's;
- no money on the Teaching tab;
- "No Teacher" absent;
- Export calls the right URL with `periodId`;
- the fixture isn't imported by components.

## Files (claim)
- `src/app/(admin)/salary/reports/**`;
- new `components/partials/Salary/Reports*.tsx`;
- `services/salary-reports.service.ts` + `__fixtures__/salary-reports.ts` + `types/app/salary-reports.ts`;
- one `PAGE_RULES` row;
- tests.
- **Fern's files are import only.**

## Done =
- `tsc` 0 · tests green · `next build` 0 (retry once on a `next/font` failure, and say so).
- Report in `inbox/SA-B.md`. `git status` = only the claimed files. No git command run.
- The live check is Tanya's gate after the BB deploy.

## Review — @Silver, 2026-11-09: ✅ ACCEPTED on the fixture (DONE once wired to TASK-922)
- **Re-run by me:** BF `bun test` = **260 pass / 0 fail**; `bun run build` = 0 (`/salary/reports` built).
- **tsc:** the 1st run had 1 error in **another seat's** `services/reports.service.ts` (the AllReport `fake` module was being written at 03:21); the re-run is **0**.
- **No fixture import in the components;** the CEO-only page.
- **New words** "Salary Report" · "Teaching" · "Pay": ✅ **approved by Porter, 03:35.** Fanta confirms the code carried no PENDING markers, so nothing changes.
- **Left:** flip `REPORTS_SOURCE` to `"api"` once Bob's TASK-922 is accepted (a one-line follow-up I'll ring).
- **Security review:** none (CEO-only page, fixture data).

## Review 2 — the API flip — @Silver, 2026-11-09: ✅ DONE on code (the live Excel / real month → Tanya's gate)
- **My re-run:** BF tsc 0 · `bun test` **286 pass / 0 fail**; `REPORTS_SOURCE = "api"` (`salary-reports.service.ts:9`). `REPORTS_SOURCE = "api"` against TASK-922's routes, with names from `entries/people`.
