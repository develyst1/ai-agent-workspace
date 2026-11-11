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

## Amendment — scope grows to My slip + Entries, against SPEC-102 (Silver, 2026-11-08) — size now ≈ 2.5 d
Jason's TASK-880 is ACCEPTED (Sober), so the two routes this TASK lacked now exist. **Start after TASK-862 is accepted** (unchanged); 865 and 880 are both DONE.
- **People / Person / Settings (SPEC-102 §5-E3):**
  - use the **TASK-871 routes** `GET/PUT /salary/profiles/:teacherId` with their full field set (`roles`, `merit_eligible`, `vehicle`, FL rates per class type, and the rest), **not** the thin `{ employmentType, baseSalary, active }` written above. SPEC-102 §5-E3 has the exact shape; it wins over this TASK's older bullet.
  - **The vehicle shows as "Motorcycle"** (REQ-5010; the value stays `motorbike`).
- **My slip (§5-E1):** `GET /salary/my-slip?year=&month=`.
  - It's the coach's own slip only; the server takes the teacher from the token.
  - The CEO keeps the full slip read. The admin never sees this screen (CONVENTIONS §2.7: hidden, not masked).
- **Entries (§5-E2):** `POST /salary/entries`.
  - **The admin's form shows nothing about pay.** The 201 response is the created line only, so don't look for totals there.
  - Errors to show, in the existing toast style with the server's sentence:
    - 400 kind not allowed;
    - 422 merit on a not-eligible profile;
    - 409 locked.
  - The CEO keeps `POST /slips/:id/lines`.
- **The Export buttons on My slip / Payment Detail:** still inert. Jason's **TASK-879** builds `GET /salary/slips/:id/export.{xlsx,pdf}` (CEO only); they're wired in a later TASK, not here.
- **The people list never shows "No Teacher"** (`is_system`; TASK-861). If the teacher read you join names from returns it, filter it out and say where.
- **Tests:** each screen against a mocked API in the shapes SPEC-102 gives, including:
  - the admin never receiving or rendering a pay field;
  - the coach's My slip with no other person's data.

## Amendment 2 — split (Silver, 2026-11-08): My slip + Entries are **TASK-882 (Fern)**, so they're out of this TASK.
- **This TASK** = People / Person / Settings on the 871 routes (SPEC-102 §5-E3), inside **your** `salary-people.service.ts` (TASK-862 Amendment). Size back to ≈ 1.5 d.

## GO — @Silver, 2026-11-09
- **Both start conditions are met:** TASK-862 is DONE (accepted today) and TASK-871 is DONE (board), so **start now.**
- **Add to the scope:**
  - the Person page keys on **`?teacherId=`**, not `?name=`;
  - **Daily** reads Bob's live `GET /salary/daily?date=` (TASK-885, DONE; CEO only; `rows[{teacherId, role, hours, minutes, description, incomeSatang}]`, `totals`, `missingRates`). Names come from your people read.

## Review — @Silver, 2026-11-09: ✅ ACCEPTED (DONE on code; live round-trip → Tanya's gate)
- **Re-run by me:** BF `bunx --package typescript@5.9.3 tsc --noEmit` = 0; `bun test` = **52 pass / 0 fail**; `bun run build` = 0.
- **Wiring is per function:** `SALARY_PEOPLE_SOURCE` at `salary-people.service.ts:27`.
- **Data exposure:**
  - an admin never requests `/profiles` or `/fl-rates`;
  - rows carry no base / types / vehicle;
  - "No Teacher" and nameless profiles are dropped in the service.
  All are tested.
- **Money:** integer satang both ways ("300.50" with no float).
- **Her gaps, ruled:**
  1. Add employee hidden on the API: right (a teacher is created in the front office).
  2. Profile fields with no API (Bonus / Commission text, Merit frequency, role-by-day) not drawn: right. No invented data.
  3. The admin's thin view (name + Merit): accepted. Type / Vehicle for an admin would need an admin-safe route, and the vehicle stays hidden anyway (pay rule).
  4. The rule cards stay read-only from the fixture. **Condition:** their numbers must equal the real constants (Extra Hour 350; the OT formula; Bonus 50 / 100; 6 / 3 ฿ per km with minimums 60 / 40). Add one test that compares the fixture's numbers with `lib/pay-rules` / TASK-868's pricing constants, or the words they print. ≈ 30 min, as a small follow-up, not blocking.
  5. **No FL-rate editor:** raised to Porter. The `PUT …/fl-rates/:classType` route exists, but no screen sets a freelancer's rates, and without them TASK-878 lists `missingRates` and pays 0. Whether to add an editor on Employee Profile (≈ 0.5 d) is Porter's call.
  6. OK.
- **Live CEO round-trip:** NOT run (no sign-in allowed). It goes to Tanya's gate with 861 / 870 / 882 / 895.
- **Security review:** none.
  - Every route is role-gated by the server (871 / 886 / 868 / 885).
  - The FE never asks for what the role can't read, and the PUT sends back only the stored fields plus the edited ones.
