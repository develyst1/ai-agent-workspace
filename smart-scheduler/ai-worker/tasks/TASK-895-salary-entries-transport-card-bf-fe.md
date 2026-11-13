# TASK-895 — FE: REQ-120 R1.2 **the "Transportation trip" card back on the admin's Other Income (Entries), wired to TASK-868's trip routes** (backoffice-front) — @Fern (Team A, lent) — Silver reviews
**From @Silver, 2026-11-09.** Porter's decision: the card returns on admin Entries, **wired to 868's routes, not `/salary/entries`**. Repo `smart-scheduler-backoffice-front`, branch `dong`. **No git command: git only on the owner's word.** **Size ≈ 0.5–1 d.** Your chain is Sober, so the report and questions go in this TASK.

## Source
- The final UI's `Entries.tsx` card "Transportation trip": Person · Date · School · Trip (Round trip / One way) · Vehicle, with the success toast «บันทึกแล้ว: ค่าน้ำมัน 1 เที่ยว <name> <date> <school> ไป-กลับ → เพิ่มในสลิปรอบ <period>».
- Words exactly as the final UI has them, with these differences ruled:
  - **No Vehicle select (SA decision).** The vehicle comes from the person's profile and is snapshotted by the back end (TASK-868). An admin never sees or sends a vehicle: Brew's 868 decision 1, accepted, because km + vehicle would reveal pay. Removing the field is the only change to the final UI's card.
  - **The toast:** the final UI's sentence. I checked: «เที่ยวเดียว» is **not** in the final UI, only «ไป-กลับ». So the trip word in the toast is **the select's own word** ("Round trip" / "One way") for both types. That adds no Thai word, and the rest of the sentence stays as the final UI has it.

## Wiring (TASK-868, ACCEPTED; `requireRole("ceo","admin")`, admin-blind)
- **Schools:** `GET /salary/transport/schools` → the School select shows `<name> · <distance_km> km`, active ones only.
- **Person:** the same TASK-886 `GET /salary/entries/people` list the other cards use, with `isSystem` filtered.
- **Save:** `POST /salary/transport/trips` `{ teacherId, date, schoolId, roundTrip }`. Leave `km` out so the server defaults it, and **never send a vehicle.**
  - The 201 for an admin has **no amount and no vehicle**: whitelist what you read, as you did for Entries.
- **Errors**, in your existing toast with the server's sentence:
  - 409 `LOCKED` (the period of that date is locked);
  - 400 (an inactive school / bad input);
  - 404.
- **The Detail list** shows the trips this admin entered in this visit (school · date · trip · km), as the Entries Detail does. No money.

## Tests (each must fail when its code is removed)
- the request body has no `vehicle` and no `km`;
- the admin view renders no amount and no vehicle, even if a mocked response carries them;
- the schools come from the route and an inactive school is absent;
- 409 / 400 show the server's sentence;
- "No Teacher" is absent from Person.

## Files (claim)
- `components/partials/Salary/Entries.tsx` (the card), `entries-logic.ts`, `services/salary.service.ts` + `types/app/salary.ts` (the transport calls + types), `salary-882.test.tsx` or a new `salary-895.test.tsx`.

## Done =
- `tsc` 0 · tests green · `next build` 0 (retry once if `next/font` fails on the network, and say so).
- The report in this TASK. `git status` = only the claimed files. No git command run.
- Live on sid = Tanya's gate after a deploy.

## Implementation Notes (Fern, 2026-11-09)
- **Built:** a "Transportation trip" card on admin Entries (Person · Date · School · Trip), the third card after Merit and Other ±. No Vehicle field, no km field.
  - Person: the TASK-886 list, same as the other cards, `isSystem` filtered.
  - School: `GET /salary/transport/schools`, active only, shown as `<name> · <distanceKm> km`.
  - Trip: select with "Round trip" (default) / "One way".
  - Save → `POST /salary/transport/trips` with exactly `{teacherId, date, schoolId, roundTrip}`.
  - Toast: «บันทึกแล้ว: ค่าน้ำมัน 1 เที่ยว <name> <dd/mm/yy> <school> <Round trip|One way> → เพิ่มในสลิปรอบ <period>». The server's sentence in a red toast on 409 / 400 / 404.
  - Detail list: the trips entered this visit (date · person · school · trip · km), no money.
  - The 201 is cut to `{id,date,schoolName,roundTrip,km}`, so an amount or vehicle in a response cannot reach the screen.
- **Files:** `Entries.tsx`, `entries-logic.ts`, `hooks.ts`, `services/salary.service.ts`, `types/app/salary.ts` (additions only), new `salary-895.test.tsx`. All inside the claim (`hooks.ts` is the hook file of the same screen). No git command run.
- **Tests:** `salary-895.test.tsx`, 6 tests (body has no vehicle/km · 201 whitelist + Detail shows no amount/vehicle from a leaky response · inactive school absent · 409/400/404 sentences · "No Teacher" absent). `bun test src/components/partials/Salary` = 34 pass, 0 fail. **Mutations 6/6 killed** (body whitelist, 201 whitelist, inactive filter, server sentence, No Teacher filter, trip word).
- **tsc 0.**
- **Live run** (headless Chromium, my harness importing the REAL TASK-868 + 886 + 880 routes, in-memory store; schools created through the real CEO route, one inactive): cards = Merit | Other ± | Transportation trip | Detail; School list = the active school only; no Vehicle field anywhere; empty save → inline Required, no request; the request body keys = `date, roundTrip, schoolId, teacherId`; real 201 carries no amount and no vehicle; Detail row = 14/10/26 · ต้น · โรงเรียนสาธิต · Round trip · 25; one-way sends `roundTrip:false` and the toast says "One way"; Sep 2026 → real 409 sentence. Statuses [201, 201, 409]. 0 unexpected console errors. (km shows **25** for a 12.5 km school because the server doubles a round trip; my script's own expectation of 12.5 was wrong, the screen shows the server's value.)
- **`next build`: NOT 0 in the shared checkout, and not from my files.** Fanta's unfinished People files (`PeopleData.ts` imports `listDailyDays`, which `salary-people.service.ts` does not export yet) break the build. I did not touch them. To prove my part, I built a copy of the checkout with a one-line stub for that missing export: **that build passed** (webpack-free default Turbopack, copy deleted afterwards). Please have the build re-checked once Fanta's files are whole.
- **Not tested:** sid itself (Tanya's gate), and the 404 and inactive-school (400) responses on the live screen (the unit test covers both sentences; the live School list never offers an inactive school).
- **Note for Silver:** the km in the Detail list is the server's value (round trip = 2 × distance). If he wants the one-way distance shown instead, say so.

## Review — @Silver, 2026-11-09: ✅ ACCEPTED (DONE on code; live → Tanya's gate)
- **Re-run by me, on the shared checkout:** BF tsc 0; `bun test` 52 / 0; **`bun run build` = 0**. Fanta's files are whole now, so the break Fern saw is gone.
- **The body** is exactly `{ teacherId, date, schoolId, roundTrip }` (no vehicle, no km), and the 201 is whitelisted. Both are tested, with 6 / 6 mutants. No Vehicle field: as ruled.
- **Km in the Detail list = the server's value** (round trip = 2 × distance): keep it. That's the km the pay line uses, so the admin sees what will be paid for, never the amount.
- **Security review:** none. Admin-blind on both sides (TASK-868 DTO + this whitelist).
