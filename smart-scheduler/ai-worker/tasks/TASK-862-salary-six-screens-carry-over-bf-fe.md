# TASK-862 — FE: REQ-120 **Salary: carry over 6 screens into the real back office** (backoffice-front) — @Fanta — REQ-120 wk 1–2
**From @Silver, 2026-11-08. BUILD GO (owner, REQ-120 §14); split by `DECISIONS-REQ-120-build.md` row 1:**
- **Fern (Team A)** builds Pay run + Slip.
- **Fanta (Team B)** builds the other six, inside Fern's shell.

Repo `smart-scheduler-backoffice-front`, branch `dong`. **No git command: git only on the owner's word.**
**Size ≈ 5 d** (my estimate): the carry-over only. Wiring to the real Salary API is a later Team B TASK, cut when Sober publishes the Salary contract (≈ 4–5 d more; that's the remaining part of my 12–14 d for the screens).

## Order
1. Finish the FE half of TASK-861 (F5) first.
2. **Start this one only when Fern's TASK-857 (shell + sign-in + `useRole()`) is reported DONE.** Your pages live inside it. Until then, read the sources below and plan; don't create files.

## Source (the content is AGREED; don't invent screens)
- **The agreed final UI (a prototype, never the product):** `som-balance-backoffice-spec/final-ui/` (REQ-133, md5 `1d0ce1f6…`). Repo path in `machine.local.md`. Read its `CONVENTIONS.md` whole, §2 especially.
  - **Pages:** `src/pages/a/salary/People.tsx`, `Person.tsx`, `Settings.tsx`, `MySlip.tsx`, `Entries.tsx`, `Daily.tsx` + the shared `parts.tsx` (and `SlipView.tsx` only if `MySlip` uses it: **ask me before taking it**, because Fern's Slip also uses it and it must exist once).
  - **Mock data:** `src/mock/a-salary.ts`.
- **Not yours:** `PayRun.tsx`, `Slip.tsx` (Fern).

## What to build
1. **Routes** under `src/app/(admin)/salary/`: `people`, `person` (opened from People, not in the menu), `settings`, `my-slip`, `entries`, `daily`.
   - Use the menu entries and the `roles` per page **exactly as `final-ui` declares them,** through Fern's role context:
     - the CEO sees all;
     - an Admin sees no base salary, no pay totals and no slips. **Those are hidden, never masked**, with no lock and no "CEO only" (CONVENTIONS §2.7);
     - a Coach sees My slip only ("Payment Detail").
2. **Components:** port each page and `parts.tsx` into `src/components/partials/Salary/**`.
   - Use the app's Mantine and theme, with dark by default (Fern's shell).
   - Keep every word, label, date format (dd/mm/yy) and the ‹ month year › picker exactly as the final UI has them. **No new words.** If something needs one, reuse an approved string or stop and tell me.
3. **One data seam:**
   - `src/services/salary.service.ts` exposes typed functions, one per screen's data need, with the types in `src/types/app/salary.ts`;
   - **for now, each function returns the final-UI mock data** (moved to `src/services/__fixtures__/salary.ts`), behind one constant `SALARY_SOURCE = "fixture"`;
   - no component imports the fixture directly. The wiring TASK will swap only the service bodies.
   - Mock names stay invented ones (CONVENTIONS §2.8).
4. **Export buttons** (Excel / PDF on My slip): leave them as visible buttons that do nothing yet, with a `TODO(TASK-wiring)` comment. **Not a fake download.** The export is a later Team B piece.
5. **Don't touch the old pages** (`ftpt-salary`, `payroll`, `my-slip` at the top level, `freelance-budgets`). Their removal is a later cut-over TASK.
   - If your new `my-slip` route clashes with the old `(admin)/my-slip`, **put yours at `/salary/my-slip`** and leave the old one alone.

## REQ-5010 folds (owner 2026-11-08: *"แก้แค่ข้อความ หรือ UI นิดหน่อย ทำให้ฟรี"*): these override "keep every word exactly"
- **They are approved words**, from พี่ฟีน's feedback (REQ-5010) and ruled free by the owner. Apply them on top of the final UI. Nothing else changes. Source: `CHECK-REQ-5010-backoffice-feedback-2026-11-08.md` § Silver.

| screen | change |
|---|---|
| Employee (`people`) | button "Add employee" → **"Add"** · balance the layout (today it leans to the right) |
| every screen that shows the vehicle (Employee, Employee Profile, Payment Setting) | **"Motorbike" → "Motorcycle"**, label only. The value / type stays `motorbike` |
| Payment Setting (`settings`) | in the long Full-time sentence, **ฟลูไทม์ → ฟูลไทม์** · move the **Add school** button into the same box as the school list |
| Other Income (`entries`) | **"OT hours" → "OT Hour"** |
| Daily Training Report (`daily`) | balance the spacing |

- **Not here, PARKED by the owner, don't build:**
  - Edit buttons on the Payment Setting rate boxes (the school list's own edit stays as the final UI has it).
- **Not yours:**
  - the orange theme and the menu order (notifications + setting last): Sober's shell;
  - "Branch for Booking" and the Conversion labels: the F1 / Conversion screens, carried in their own TASKs when cut.
- If the orange theme lands in Fern's shell while you're building, use its tokens; don't hard-code a colour.

## Files (claim, Team B): only these
- `src/app/(admin)/salary/{people,person,settings,my-slip,entries,daily}/**`;
- `src/components/partials/Salary/**`, except anything Fern creates for Pay run / Slip. Agree folder names through me if you meet hers;
- `src/services/salary.service.ts`, `src/services/__fixtures__/salary.ts`, `src/types/app/salary.ts`;
- the six menu lines, **only through the menu config Fern's shell exposes**. If adding a line means editing her shell files, stop and tell me.

## Done =
- `tsc` 0 · `next lint` 0 · `next build` 0 · 0 console errors / warnings.
- Each role (Fern's seeded / stub users) sees exactly the menu and fields the final UI gives that role. Screenshots per page × role in `tests/evidence/task-862/`, at 1280 px and 375 px, dark and light.
- A short table: page → the final-UI file it came from → anything that couldn't carry over one-to-one, and why.
- A report in `inbox/SA-B.md`. `git status` = only the claimed files. No git command run.

## Amendment — split (Silver, 2026-11-08, Porter's call): **My slip + Entries move to Fern (TASK-882).** Fanta keeps People · Person · Settings · Daily.
- **Drop from this TASK:** the `my-slip` and `entries` routes and components, and the Export buttons note. The REQ-5010 "OT Hour" fold goes with Entries to TASK-882.
- **🔴 The service file:** `src/services/salary.service.ts` and `src/types/app/salary.ts` **already exist and are Fern's** (her real Pay run / Slip calls). **Don't create or overwrite them.**
  - Put your seam in **new** files instead: `src/services/salary-people.service.ts` (+ `src/services/__fixtures__/salary-people.ts`) and `src/types/app/salary-people.ts`. Same rule as before: one constant `SALARY_PEOPLE_SOURCE = "fixture"`, and no component imports the fixture.
- **`parts.tsx` / `money.ts` are Fern's:** import them freely. If you need a change in them, ask me; don't edit them.
- **Your claim, corrected:**
  - `src/app/(admin)/salary/{people,person,settings,daily}/**`;
  - new `src/components/partials/Salary/{People,Person,Settings,Daily}*.tsx`;
  - the two new service / type files and the fixture;
  - the four menu lines.

## Review — @Silver, 2026-11-09: ✅ ACCEPTED (DONE)
- **Re-run by me:**
  - BF `bunx --package typescript@5.9.3 tsc --noEmit` = 0;
  - `bun test` = **34 pass / 0 fail**;
  - `bun run build` = 0, with `/salary/{people,person,settings,daily}` built;
  - no component imports `__fixtures__` (a test pins it).
- **File boundary kept:** her own `salary-people.service.ts` + types + fixture. Fern's `salary.service.ts`, `parts.tsx` and `money.ts` are only imported. The one `lib/roles/pages.ts` edit (4 rows + icons) is accepted as "the menu config the shell exposes".
- **R0 at the seam** (no base / FL rates for an admin; Settings + Daily answer nothing to a non-CEO; the role is in every cache key): **accepted.** The server enforces it for real in 869 (the 871 routes).
- **REQ-5010 folds:** all applied and pinned. Only the **button** reads «Add» (the modal keeps «Add employee»): correct.
- **Rulings on her notes:**
  - **Menu order** (Daily before Pay run because of first-match): accepted for now. **Follow-up for Fern** (her shell, via Sober): an explicit `/salary/payrun` row, so the CEO's SALARY order matches the final UI. It's small, not blocking.
  - The Daily Export button stays inert (as the TASK says).
  - `?name=` in the Person URL is fine for fixtures; **869 must switch it to `?teacherId=`**, since a name isn't unique and the API keys on `teacherId`.
- **Not verified, accepted as such:** the running shell + sign-in click-through. That's Tanya's gate after a deploy (no password typing on sid).
- **Security review:** none. These are fixture-backed screens; real access control lands with the 871 routes in 869.
