# TASK-885 — BE: REQ-120 R1.7 **Daily Training Report: per day, each coach's hours and that day's pay** (backoffice-back, read-only) — @Bob — now
**From @Silver, 2026-11-08.** REQ-120 **R1.7** ("a daily check-in report: hours cut + each coach's pay for the day"). The screen is the final UI's `Daily.tsx` (Fanta's TASK-862 builds it on fixtures; TASK-869 wires it). Repo `smart-scheduler-backoffice-back`, branch `dong`. **No git command: git only on the owner's word.** **No migration, no write.** **Size ≈ 1.5 d.**

## The shape the screen needs (final UI `mock/a-salary.ts` `DailyRow` + `Daily.tsx`)
`GET /salary/daily?date=YYYY-MM-DD`, **CEO only** (the final UI's roles for `/salary/daily` = `["ceo"]`), returns:
```
{ date, weekday: "Mon".."Sun",
  rows: [{ teacherId, role: "Full-time"|"Part-time"|"Freelance", hours /* number, e.g. 1.5 */, minutes, description, incomeSatang: number|null }],
  totals: { coaches, minutes, incomeSatang } }
```
- **`role`** = the role **of that day**, from F3's `roleOfDay(profile, date)`. A PT + FL person is Part-time on Sat–Sun and Freelance on Mon–Fri. The words are the final UI's ("Full-time", "Part-time", "Freelance").
- **`minutes` / `hours`** = that coach's teaching minutes that day, from **TASK-872's hours reader** (`services/hours-reader.ts`, the one Jason's pay run uses), so the report and the slip can never disagree. It includes ECA and camp, as R1.2 says.
- **`description` + `incomeSatang`** = that day's **derived** pay, from the **same pure functions the pay run uses** (`lib/pay-rules.ts`: `flPayLines`, `extraHourLines`), applied to that one day:
  - Freelance: one part per class type, `"<Class> <h> Hr × <rate> ฿"` (e.g. "Private 1 Hr × 300 ฿"). The parts are joined as the final UI shows; if it shows only one, join with " · ".
  - Full-time / Part-time: `"Extra Hour <n> Hr × 350 ฿"` when there is one; else `"—"` with `incomeSatang: null`.
  - **Reuse the pay-rules labels** where they already produce this text; don't write a second formatter that can drift. If the labels differ from the final UI's words, the final UI wins: tell me the difference.
  - A missing FL rate → that part shows the pay-rules "missing rate" result (no guessed amount), and `incomeSatang` counts only what is known. List them in a `missingRates` array beside `rows`.
- **Who is listed:** every active profile that has teaching minutes that day. **Never "No Teacher"** (`is_system`): the hours reader already drops it (TASK-861 / SPEC-101 §4); a test pins it.
- **Order:** the final UI's (Full-time, Part-time, Freelance, then name). Names are the FE's join (§9b: no cross-schema join).
- **OT / Merit / Bonus / Other / Transportation are NOT in this report.** The final UI's Daily shows teaching pay only.

## Rules (don't re-decide)
- Money is integer satang. `hours` is the only non-integer number (minutes / 60, 2 decimals).
- A date with no period, or a locked period, still answers. It's a read.
- 400 on a malformed date; 401 / 403 for no token / non-CEO.

## Files (claim, Team B)
- `src/services/daily-report.service.ts` + `src/services/daily-report.service.test.ts`.
- **One route line** in Jason's `src/routes/salary.ts` (`.get("/daily", ceo, …)`, tagged `🔻 TASK-885`).
- **Read-only use** of `lib/pay-rules.ts`, `services/hours-reader.ts` and the salary store's profile / rate reads. **If you need any of them to export something they don't, stop and tell me.** They're Team A's files.
- Pure mirror test edits are pre-approved (tagged `🔻 TASK-885`, listed), e.g. Jason's route count.

## Tests (DB-less, SAFE env; each must fail when its code is removed)
- an FT coach with 6 h on a weekday → Extra Hour 2 Hr × 350 = 70,000 satang; 4 h → "—", null (the final UI's 13/10 and 14/10 rows);
- an FL coach with 1 h Private at 300 → "Private 1 Hr × 300 ฿", 30,000;
- a PT + FL person: a Saturday is Part-time, a Wednesday is Freelance;
- an ECA / camp hour counts;
- "No Teacher" is never a row;
- a missing FL rate is listed, not guessed;
- the totals equal Σ rows;
- **the same fixture through the pay run gives the same derived lines** (one test that runs both).
- Route: 401 / 403 / 400 / 200.
- A mutation set over the role-of-day choice, the description builder and the totals.

## Done =
- `bunx --package typescript@5.9.3 tsc --noEmit` 0;
- BB suite green (before / after);
- the mutation set all bite;
- a **rolled-back sid proof** of one real day (host check .206 first; read-only, nothing to roll back but say so).
- Report in `inbox/SA-B.md`. `git status` = only the claimed files. No git command run.
- **TASK-869 (Fanta) wires the screen to this route** (I'll add it to her TASK when you're accepted).

## BE report (Bob, 2026-11-08) — DONE-pending-review, read-only, no migration, nothing committed
- **Built:** `src/services/daily-report.service.ts` (`buildDailyReport(date, deps)`) + `daily-report.service.test.ts` (15 tests) + ONE route line in `salary.ts` (`.get("/daily", ceo, …)`, tagged 🔻 TASK-885). The mutation file is `src/services/daily-report-task885.mutations.json`.
- **It reuses, never re-derives:** minutes ← `readHours(teacherId, date, date)` (TASK-872's reader, the pay run's own); role of the day ← `roleOfDay`; amounts ← `flPayLines` / `extraHourLines` applied to that one day (`[day]`); the profile filter is the pay run's (`active`, FT/PT/FL). A test runs the **same fixture through the pay run** (`createSalaryService` → `runPeriod` → the slip) and asserts the report's income equals the slip's derived 14/10 lines for each coach (FT 70,000; FL 67,500 = 30,000 + 37,500 in one line).
- **Shape:** `{ date, weekday, rows:[{ teacherId, role:"Full-time"|"Part-time"|"Freelance", hours, minutes, description, incomeSatang|null }], missingRates:[{teacherId, classType}], totals:{ coaches, minutes, incomeSatang } }`. Order: Full-time, Part-time, Freelance, then teacher id (names are the FE's join). `hours` = minutes ÷ 60 to 2 decimals (the only non-integer). 400 on a malformed / impossible date; 401 / 403 from `requireRole("ceo")`; a date with no period or a locked one still answers.
- **"No Teacher":** the allow-list is `listEntriesPeople()` (TASK-886's read: active profile + a teacher row + `not is_system`), so the system teacher is never a row and its hours are never read — pinned (a profile outside the list is not read at all).
- **THE LABEL DIFFERENCE you asked about:** pay-rules' labels are `"14/10 (Wed): private 1 Hr × 300, duo 2 Hr × 250"` (FL) and `"14/10 (Wed): 6 Hr → extra 2 Hr × 350"` (FT/PT) — a date prefix, a lower-case class and no ฿. The final UI shows `Private 1 Hr × 300 ฿` and `Extra Hour 2 Hr × 350 ฿`. I did NOT write a second formatter: the description is **parsed from the pay-rules label** (drop the prefix, capitalise the class, append " ฿"; the extra part = the text after "extra "), so the numbers can never drift. The words are the final UI's; pinned by the sample strings and by parser tests. Two things the final UI does not show and I had to choose: the class display words are just the capitalised class (`Private · Duo · Group · Eca · Camp` — **say if the UI wants "ECA" / "DUO" capitalised**, it is one line); several FL parts are joined with « · ».
- **Missing FL rate:** that part shows a dash for the rate (`Duo 1 Hr × — ฿`), `incomeSatang` counts only the known parts (null if none), and `missingRates` lists `{teacherId, classType}`. No guessed amount.
- **Tests (15):** FT 6 h ⇒ 70,000 / 4 h ⇒ «—» null; 5 h and a half hour; ECA counts toward the day; FL Private 1 h × 300; several parts; PT + FL (Sat = Part-time, Wed = Freelance); missing rate; label parsers; no system teacher; inactive / STAFF / no teaching / zero-minute day not rows; order + totals = Σ rows; bad dates ⇒ 400; the same fixture through the pay run; the route 401 / 403 / 400 / 200 + the exact row shape.
- **Mutation set:** 22 mutants (role of the day, role words, order, hours, the reader's range, every part of the description, income, who is listed, totals, date, the weekday, the route's guard) — **all bite, 0 survivors**. BB has no mutation runner (the runner lives in smart-scheduler-back), so I ran them with a one-off script that applies each edit, runs this suite and restores; the JSON is in the SB runner's format, so it can be re-run there. One candidate (FL «only the first line») is EQUIVALENT — the pay run writes ONE line per date — and was dropped.
- **Suite / tsc:** BB `bun test` (SAFE env: `DATABASE_URL` dummy) → **809 pass · 0 fail**; `tsc --noEmit` (5.9.3) 0. Mirror edit (pre-approved, tagged): `salary-routes-task865.test.ts` — the route count 29 → 30.
- **Sid proof (read-only, nothing to roll back):** host check `DATABASE_URL` host = 154.197.124.206 = sid (host only). Only SELECTs ran. (a) sid has **0 salary profiles** (0 active, 0 people), so `GET /salary/daily` there answers an empty, whole report for any day (checked 2026-10-14, 11-03, 11-06, 11-07: coaches 0). (b) To prove the real reader end to end I took the coach with the most CONFIRMED/ATTENDED rows in 1 Oct–7 Nov from `public.bookings` (not the system teacher), fed him to the report as an injected FT profile, and ran the REAL `readHours`: 2026-11-02 (Mon) → 10 bookings = 600 min = 10 h → «Extra Hour 6 Hr × 350 ฿» = 210,000 satang (10 h − the 4 h weekday threshold), role Full-time. No write of any kind.
- **Claim:** `git status` in backoffice-back shows my files only among the others' work: `src/services/daily-report.service.ts`, `daily-report.service.test.ts`, `daily-report-task885.mutations.json`, `src/routes/salary.ts` (1 import + 1 route line), `salary-routes-task865.test.ts` (1 count). No migration.

## Review — @Silver, 2026-11-08: 🔁 one tiny REWORK (the ECA word); everything else ACCEPTED
- **Re-run by me:** BB `bunx --package typescript@5.9.3 tsc --noEmit` = 0; `bun test` (dummy URL) = **809 pass / 0 fail**.
- **The route** is `.get("/daily", ceo, …)` (`salary.ts:80`): CEO only, read-only.
- **The pay-run equality test, the "No Teacher" exclusion, the missing-rate listing and 22 / 22 mutants:** accepted.
- **Parsing the description from pay-rules' own label (no second formatter):** accepted. The same-fixture equality test catches a label change.
- **🔁 Rework:**
  - **"Eca" must read "ECA".** The final UI spells the class words Private · Duo · Group · **ECA** · Camp (`final-ui` salary pages / mock).
  - Replace `cap()` with a fixed map from the five class keys to those exact words. A test pins "ECA 1 Hr × … ฿", and the map goes in the mutation set.
  - ≈ 15 min.
- **Joining several FL parts with « · »:** OK.
- **Sid proof:** 0 salary profiles on sid, so the route answers empty. The reader on a real coach's day gave 600 min → «Extra Hour 6 Hr × 350 ฿» = 210,000 satang. That's correct: a weekday from the 5th hour is 10 h − 4 h = 6 h.
- **Security review:** none. CEO-only and read-only.

## Review 2 — @Silver, 2026-11-08: ✅ ACCEPTED (DONE)
- The "ECA" fix is in: `CLASS_WORDS` is a fixed map (`daily-report.service.ts:46`).
- My re-run of `daily-report.service.test.ts`: 19 pass / 0 fail. Bob reports the mutation set at 25 / 25.
