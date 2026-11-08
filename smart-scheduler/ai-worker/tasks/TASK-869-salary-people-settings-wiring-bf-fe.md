# TASK-869 — FE: REQ-120 **wire People · Person · Settings to the real Salary API** (backoffice-front) — @Fanta — REQ-120 wk 2
**From @Silver, 2026-11-08.** Contract: **SPEC-100 §5** (profile routes) + §9b (accepted defaults: **money over HTTP = integer satang**). Repo `smart-scheduler-backoffice-front`, branch `dong`. **No git command: git only on the owner's word.**
**Size ≈ 1.5 d.**
**Starts after TASK-862 is accepted, and after Jason's TASK-865 routes are DONE** (the board says so).

## What to do
- **Swap only the service bodies** in `src/services/salary.service.ts` (TASK-862's seam) for **People, Person and Settings**:
  - `GET /salary/profiles` and `PUT /salary/profiles/:teacherId` `{ employmentType, baseSalary, active }`;
  - keep the same typed functions, so the components don't change.
- **Names:** the API returns `teacher_id` only (§9b: no cross-schema join in BB). Join names on the FE from the front office's teacher list, through the existing back-office way of reading teachers, if there is one. **If there's none, stop and tell me** before adding a new API client to the scheduling back.
- **Money:** satang in, satang out. Display in baht with 2 decimals. No float maths: convert with the repo's money helper, or an integer formatter.
- **Roles:**
  - CEO: sees and edits base salary;
  - admin: the profile routes are **CEO-only** in SPEC-100, so an admin's People / Person pages get a 403. **Hide what an admin can't load** (CONVENTIONS §2.7: hide, never lock). The page itself stays per final UI.
- **Fixtures:** keep `SALARY_SOURCE` and the fixtures for the screens that aren't wired yet (My slip, Entries, Daily): those need §5 extensions. Flip the constant per function, not globally.

## Gaps to report, not build
Each one becomes a named §5 extension request from me to Sober, through Porter. Note any you hit in your report.
- **My slip** (coach role): §5 is CEO-only, so it needs "a coach reads only their own slip".
- **Entries** (admin adds items): it needs R0.3 admin-blind line writes.
- **Daily** (R1.7): it needs the hours reader (Team A, later).
- Any field People / Settings shows that §5's profile doesn't carry: vehicle, merit eligibility, FL rates per class type.

## Done =
- `tsc` 0 · `next build` 0 · the front's tests green · 0 console errors.
- Against a local BB on sid (host check first; BB `.env` = .206): the CEO lists profiles and edits a `B-` coach's base, and it round-trips; an admin sees no base. Screenshots in `tests/evidence/task-869/`.
- The gap list, in a report in `inbox/SA-B.md`. `git status` = only the claimed files. No git command run.

## Files (claim, Team B)
- `src/services/salary.service.ts`, `src/types/app/salary.ts`;
- `src/components/partials/Salary/**` only where a field must change;
- tests.
