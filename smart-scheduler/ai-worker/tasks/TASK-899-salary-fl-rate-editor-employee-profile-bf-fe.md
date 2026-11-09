# TASK-899 — FE: REQ-120 R1.2 **set a freelancer's hourly rate per class type, on Employee Profile** (backoffice-front) — @Fanta — now
**From @Silver, 2026-11-09.** Porter: **YES, in scope** (ขวัญ QS5: FL rates are per person AND per class type. Without an editor every FL coach is paid 0 via `missingRates`). This is **not** the parked REQ-5010 "edit the fixed pay rules" item (Extra Hour 350 / OT / transport stay read-only). Repo `smart-scheduler-backoffice-front`, branch `dong`. **No git command: git only on the owner's word.** **Size ≈ 0.5 d.**

## The route (Jason's TASK-871, ACCEPTED; `salary.ts:17–18, 127–128`)
- `GET /salary/profiles/:teacherId/fl-rates` → `[{ classType, rate }]`.
- `PUT /salary/profiles/:teacherId/fl-rates/:classType` body `{ rate }` → `{ classType, rate }`.
- `classType` ∈ `private · duo · group · eca · camp`.
- **`rate` = integer satang PER HOUR** (`z.number().int()`).
- Errors: 404 unknown person · 400 bad classType / rate.
- **CEO only.**

## What to build (inside your 869 files)
- On **Employee Profile**, the **CEO only**, and only for a person who holds the **FL** role: the existing Freelance Rate rows become editable.
  - One baht input per class type, in the order Private · Duo · Group · ECA · Camp.
  - Those are the final UI's class words, the same as TASK-885's map: "ECA", never "Eca".
  - A missing rate shows empty, never 0.
- **Save:** one `PUT` per **changed** class type, never one for an unchanged row. Convert with `bahtInputToSatang` (no float). After the saves, re-read `GET …/fl-rates`.
- **Validation before sending:** a number ≥ 0 with at most 2 decimals. Empty = don't send (leave unset). There's no "delete a rate" route, so say so if the UI seems to need one; don't invent it.
- **Errors:** the server's sentence in your existing toast. On a partial failure (2 of 3 saved), say which class failed, and the re-read shows the truth.
- **Words:** the final UI's labels on that card plus your existing «Save profile» flow. No new words; if you need one, stop and tell me.
- **The admin** never sees the rows (unchanged from 869) and never requests `/fl-rates`.

## Tests (each must fail when its code is removed)
- only changed rows are PUT, with integer satang ("300.50" → 30050);
- an empty input sends nothing;
- a non-FL person has no editor;
- the admin view has no editor and makes no `/fl-rates` request;
- a 400 shows the server's sentence;
- the order of the class words.

## Files (claim)
- Your `Person.tsx` / `PeopleParts.tsx` / `PeopleData.ts`, `services/salary-people.service.ts`, `types/app/salary-people.ts`, `salary-869.test.tsx` (or a new `salary-899.test.tsx`).

## Done =
- `tsc` 0 · tests green · `next build` 0 (retry once on a `next/font` network failure, and say so).
- Report in `inbox/SA-B.md`. `git status` = only the claimed files. No git command run.
- The live CEO edit is Tanya's gate after the back-office deploy.

## Review — @Silver, 2026-11-09: ✅ ACCEPTED (DONE on code; the live CEO edit → Tanya's gate)
- **Re-run by me:** BF `bunx --package typescript@5.9.3 tsc --noEmit` = 0; `bun test` = **71 pass / 0 fail**; `bun run build` = 0.
- **Only changed boxes are PUT**, in integer satang with no float. **Her own `parseRateText`** refuses "1.999" instead of truncating it, and that's better than reusing `bahtInputToSatang`.
- Empty = not sent, and there's no delete route; noted.
- A partial failure names the class, and the re-read shows the truth.
- An admin or a non-FL person gets no editor and makes no `/fl-rates` call.
- **Tests:** 13 tests, mutation checked.
- **The one edit to the TASK-869 test** (badge → boxes) is tagged: accepted.
- **Security review:** none. CEO-only route; input validated on both sides.
- **Open for the owner, only if asked:** clearing a rate needs a BE delete route first. Not built.
