# TASK-863 — BE: REQ-120 **Bonus 50 / Bonus 100 candidates for a month: a read-only, rule-switchable reader** (backoffice-back) — @Bob — REQ-120 wk 1–2
**From @Silver, 2026-11-08. BUILD GO (owner, REQ-120 §14; again 11-08: *"ไปเลย ทำไปเลย"*).** Repo `smart-scheduler-backoffice-back`, branch `dong`. **No git command: git only on the owner's word.**
**Size ≈ 2 d** (part of the sized Bonus 50 / 100 lines, 3.3 d; the rest becomes pay lines once Sober's pay-line model is published).
**Start after TASK-861 BE is reported and accepted.** One tree at a time.
- **Owner order, 2026-11-08:** *"งานก้อนแรกส่วนไหนไปก่อนได้ ไม่ติดคนอื่น ให้ทำเลย"*. That wait was only Bob's own queue: 863 has **no technical dependency** on 861 (different repo, read-only, F4's columns are already on sid via 0074).
- **✅ Moved to @Brew (Team C, lent), 2026-11-08 evening (Porter), starting now.**
  - Silver stays the SA: questions go in `## Questions` below, and the report goes in `inbox/SA-B.md`.
  - Bob's queue is now 861 → 870 → 877 → **867** (which reads this TASK's candidates) → 868. So keep to the claimed files: Bob later adds `bonus-lines.service.ts` beside yours.
  - Use `bunx --package typescript@5.9.3 tsc --noEmit`. Plain `bunx tsc` pulls tsgo and panics on this machine.

## Why
Salary's Bonus lines need, per month, **who triggered a bonus, for which child, and which coach it goes to**. F4 (TASK-860) stored the facts in the shared DB.
- **This TASK turns those facts into a candidate list,** in the back office, where Salary lives.
- **It writes nothing and pays nothing.**
- **The step after it is another TASK:** turning candidates into pay lines (amounts, FT / PT-day eligibility, the slip). That needs Sober's pay-line model and Team A's F3 types.
- So the reader returns facts plus the dates eligibility needs. It does **not** filter by teacher type.

## The rules (REQ-120 R1.2, §9 C-e, §9.4; do not re-decide)
- **Bonus 50:** a 1st Trial, then a course **or** a voucher, with no time limit. It goes to the trial's coach (one coach, C-e). Across sports counts (4A).
- **Bonus 100:** a renewal goes to the **old** course's first coach. Across sports counts (4A).
  - **Voucher → voucher is never a renewal.**
    - Her 10-23 "Renewal Voucher" is only a **label**: the prototype row was `["Not a renewal", "A voucher after a voucher"]` (`SOM-BACK-OFFICE-v3.html:1557`). She renamed the key to "NO" and the value to "Renewal Voucher", so the row now reads "NO · Renewal Voucher", which means no bonus.
    - That agrees with 10-14 QS1 ("ซื้อ Voucher ใหม่ … ไม่ได้ 100"). The rule doesn't change.
    - If a screen shows this case, its label is "Renewal Voucher". *(Silver, 2026-11-08)*
  - **After a whole-course coach change** (`coach_changed_at` set and `latest_teacher_id ≠ first_teacher_id`), the admin's `bonus100_pick` decides:
    - `FIRST` → the first coach, 100 %;
    - `LATEST` → the latest coach, 100 %;
    - `SHARE` → 50 % each;
    - no pick yet → the candidate is **`UNRESOLVED`**, listed and not dropped.
- **The month a bonus falls in = the month of the PURCHASE's `created_at`, Bangkok time** (readiness default R0-11: a bonus is counted when its trigger happens).

## The switches: the open rulings stay switchable (one module, `src/lib/bonus-rules.ts`)
| switch | meaning | default now | why the default |
|---|---|---|---|
| `goLiveDate: string \| null` | the Salary go-live day (Bangkok) | `null` = no cut-off | not decided yet (Master Plan §9) |
| `bonus50TrialBeforeGoLive: boolean` | a trial dated before go-live still pays Bonus 50 if bought after | `false` | readiness default S13 (both ends after go-live), standing per the owner 10-27 |
| `bonus100OldCourseBeforeGoLive: boolean` | Bonus 100's **1A / 1B** (ขวัญ, still open) | `true` (= 1A, the team's recommendation in the draft to her) | **switchable by design**: flip to `false` for 1B, one line |
| `renewalAcrossCourseVoucher: boolean` | A10: course → voucher or voucher → course counts as a renewal | `false` (course → course only) | A10 not asked; the strictest reading of "a course renewal". Flip on her word. |

- Cut-off checks apply **only when `goLiveDate` is set.**
- **Each candidate carries the dates the switches test,** so a later flip needs no new read.

## What to build
1. **Read-only table refs in Team B's own file** `src/db/schema-salary-b-read.ts` *(renamed 11-08: `schema-salary-b.ts` is kept for Team B's real `bo` tables, TASK-868, which do enter the drizzle config)*.
   - Define only the columns you read: `course_packages`, `vouchers`, `bookings`, `students`, `teachers`, including F4's new columns.
   - **Don't edit `schema.ts`** (Team A's). **Don't add this file to `drizzle.config.ts`:** these are `public` tables, outside `schemaFilter`, so no migration ever comes from it. Say so in a header comment.
2. **`src/lib/bonus-rules.ts`:** the switches above, plus **pure** functions that decide from plain rows:
   - `bonus50Candidates(rows, rules)`;
   - `bonus100Candidates(rows, rules)`;
   - the coach-share resolution (`FIRST` / `LATEST` / `SHARE` / `UNRESOLVED`).
3. **`src/services/bonus-candidates.service.ts`:** `listBonusCandidates(month: "YYYY-MM", rules = DEFAULT_RULES)` returns `{ bonus50: [...], bonus100: [...] }`.
   - **Reads:** the courses and vouchers created in that Bangkok month, with `source = 'SALE'`, joined to their trial / previous row, the child (name + nickname), and the coach(es).
   - **Each Bonus 50 item:** `purchaseKind` (`COURSE` \| `VOUCHER`), purchase id, date, `isDuo`, the child's id / name / nickname, the trial booking id + date + subject, `coachId`.
   - **Each Bonus 100 item:**
     - `purchaseKind`, purchase id, date, the child;
     - `prevKind` + prev id + its created date;
     - `firstCoachId`, `latestCoachId`;
     - `pick`, `status` (`RESOLVED` \| `UNRESOLVED`);
     - `shares: [{ coachId, fraction: 1 | 0.5 }]` (empty when `UNRESOLVED`);
     - the old course's **first ATTENDED date** (eligibility's PT-day check needs it).
   - **A previous course with `first_teacher_id IS NULL`** (never attended) is still listed, as `status: "NO_FIRST_COACH"`. Never drop a case silently.
4. **No route in this TASK** (`api.ts` is shared and waits its turn). The function is the contract. The pay-line TASK will call it, and the screen comes later.
5. **No migration, no table, no write.**

## Tests (TDD, SAFE env)
Pure-function tests on rows, each failing when its code is removed:
1. **Bonus 50:**
   - course after trial ✔;
   - voucher after trial ✔;
   - no trial link ✘;
   - a pre-go-live trial with the switch off ✘, on ✔;
   - across sports ✔.
2. **Bonus 100:**
   - course → course ✔;
   - voucher → voucher ✘ always;
   - course → voucher / voucher → course ✘ by default, ✔ with A10 on;
   - an old course before go-live: ✔ under 1A, ✘ under 1B.
3. **Coach shares:**
   - no change → first 1.0;
   - change + FIRST / LATEST / SHARE → 1.0 / 1.0 / 0.5 + 0.5;
   - change + no pick → UNRESOLVED with empty shares;
   - `latest = first` → treated as no change.
4. **Month boundary in Bangkok time:** a purchase at 23:30 on the 31st (UTC+7) falls in that month, not the next.
5. **The `NO_FIRST_COACH` case is listed,** not dropped.

Plus one service test against a fake db (the existing pattern in this repo) for the month filter and `source = 'SALE'`.

## Env, data, DB
- No new env key expected; if one appears, add it with a purpose line and name it in the report.
- **No DB command needed.** If you check by hand on sid: run the host check first (sid = .206), read only, and use `B-` data from F4's checks.
- Team B ports: BB 4110.

## Files (claim, Team B): only these
- `src/db/schema-salary-b-read.ts` (new)
- `src/lib/bonus-rules.ts` + test (new)
- `src/services/bonus-candidates.service.ts` + test (new)

Nothing else in BB. **Pure mirror test edits are pre-approved** if tagged `🔻 TASK-863` and listed.

## Done =
- `bunx tsc --noEmit` 0 · BB's full SAFE suite green, with the count before / after · a mutation set over `bonus-rules.ts`, all biting.
- A report in `inbox/SA-B.md`: the candidate shapes as built, one example per status, the switch table as built. `git status` = only the claimed files. No git command run.

---
## Report — Brew (Team C), 2026-11-08. TASK built; for Silver's review (via Sector)
**Who and how.** Moved Bob → Brew on the owner's order; the board row names me. My only contact is Sector, so this report stays here and Sector forwards it to Silver; I did not write `inbox/SA-B.md` (not my chain). No git command was run. The host of BB's `.env` was `154.197.124.206` (sid), checked before every DB touch.

**Files (the claim, all new, nothing else).** `src/db/schema-salary-b-read.ts` · `src/lib/bonus-rules.ts` + `bonus-rules.test.ts` · `src/services/bonus-candidates.service.ts` + `bonus-candidates.service.test.ts`. `git status --porcelain` went 43 → 49 = these 5 plus Team A's own new `0011` migration files (changed at 21:03, not mine). `drizzle.config.ts` and `api.ts` are untouched (a test asserts neither names the reader). No migration, no route, no table, no write.

**The switch table as built** (`BonusRules`; `DEFAULT_RULES` is frozen):

| switch | default | what it does |
|---|---|---|
| `goLiveDate` | `null` | no cut-off at all while null; every check below applies ONLY when set |
| `bonus50TrialBeforeGoLive` | `false` | a trial dated before go-live pays Bonus 50 only when ON |
| `bonus100OldCourseBeforeGoLive` | `true` (1A) | an old entitlement from before go-live earns Bonus 100 only when ON; `false` = 1B |
| `renewalAcrossCourseVoucher` | `false` | A10: course→voucher / voucher→course count only when ON; voucher→voucher NEVER |

Each candidate carries the dates the switches test (`date`, `trialDate`, `prevDate`), so a flip needs no new read.

**The candidate shapes as built, one example per status** (generated from the functions, not typed):
- Bonus 50: `{"purchaseKind":"COURSE","purchaseId":"course-1","date":"2026-10-15","isDuo":false,"childId":"child-1","childName":"Nong A","childNickname":"Aa","trialBookingId":"trial-1","trialDate":"2026-09-20","trialSubject":"Skateboard","coachId":"coach-trial"}`
- Bonus 100 `RESOLVED` (no coach change): `{…,"prevKind":"COURSE","prevId":"old-course","prevDate":"2026-06-01","firstCoachId":"coach-first","latestCoachId":null,"pick":null,"status":"RESOLVED","shares":[{"coachId":"coach-first","fraction":1}],"prevFirstAttendedDate":"2026-06-08"}`
- `RESOLVED` after a change + SHARE: `"firstCoachId":"coach-first","latestCoachId":"coach-latest","pick":"SHARE","status":"RESOLVED","shares":[{"coachId":"coach-first","fraction":0.5},{"coachId":"coach-latest","fraction":0.5}]`
- `UNRESOLVED` (change, no pick yet): `"pick":null,"status":"UNRESOLVED","shares":[]` (both coach ids still shown)
- `NO_FIRST_COACH` (old course never attended): `"firstCoachId":null,"pick":null,"status":"NO_FIRST_COACH","shares":[],"prevFirstAttendedDate":null`
- Entry point: `listBonusCandidates(month: "YYYY-MM", rules = DEFAULT_RULES) → { bonus50, bonus100 }`; a bad month → 400 `VALIDATION` before any read. Results are ordered by date then purchase id.

**Evidence (dummy `DATABASE_URL`; pinned `bunx --package typescript@5.9.2 tsc`, because plain `bunx tsc` panics on this machine: a tool fault, not a type error).**
- BB suite **before `334 pass · 0 fail · 22 files` → after `415 pass · 0 fail · 24 files`** (+81, all in my two test files). `tsc --noEmit` → exit 0, 0 `error TS`.
- Write-grep (`insert(` · `update(` · `delete(` · `execute(`) over my three source files → no output; tests also assert "every `d.` call is a select" and "no `.transaction`".
- **Mutation set over `bonus-rules.ts`: 27 mutants, 27 killed** (on a scratch copy; each replacement asserted to match exactly once): voucher→voucher guard · course→course · A10 ignored and inverted · both go-live checks removed · both switches inverted · Bangkok offset dropped · December rollover · UTC month start · SHARE 1.0 · FIRST and LATEST paying the wrong coach · UNRESOLVED resolved · NO_FIRST_COACH guard · `latest = first` · change without `coach_changed_at` · a stray pick treated as SHARE · no-trial and no-prev candidates · month filter off · unsorted · both defaults flipped · bad-date error · the rules module gaining an import. **My first run killed 24 of 26. Two survivors were dead code, not test gaps** (an `includes()` pick check that the three explicit comparisons already cover, and a plain-date passthrough that changed nothing), so I deleted that code. A third survivor (the bad-date error message) was a real test gap, and its test now pins the message.
- Tests per the TASK: Bonus 50 (course ✔, voucher ✔, no trial ✘, pre-go-live trial off ✘ / on ✔, across sports ✔) · Bonus 100 (course→course ✔, voucher→voucher ✘ even with A10, mixed ✘ / ✔ with A10, old course before go-live ✔ 1A / ✘ 1B) · shares (no change, FIRST, LATEST, SHARE, none, `latest = first`, invalid pick) · Bangkok month boundary (23:30 on the 31st stays, 00:00 on the 1st moves, December rolls the year) · `NO_FIRST_COACH` listed · the service: the month window and `source = 'SALE'` proven from the **rendered SQL** (`.toSQL()`, no connection: `source = $1`, `created_at >= $2`, `created_at < $3`, params `["SALE", start, end]`), the first-ATTENDED `min(date)` queries rendered, and the assembly of plain rows through a fake keyed by table.

**Real sid, read-only** (scratch scripts outside the repo, host `.206` printed first, each guard-tested with the dummy URL).
- The loader's purchase queries run on real Postgres: October 2026 = 78 SALE purchases (73 courses, 5 vouchers); November so far = 28.
- **Sid has NO F4 facts yet.** A scan of all 13 month/kind/source groups found zero rows with a trial link, a previous entitlement, a first coach, a coach change or a pick. So **today the real answer is 0 Bonus 50 and 0 Bonus 100** for every month. That is the data, not a bug (F4 writes these at a sale made after its deploy, and the day-end stamps the first coach).
- So I exercised the join path another way: the REAL loader, with a shim that answers only the two purchase queries with synthetic rows pointing at REAL ids; every other query hit real Postgres (student · trial booking · subject name · previous course and voucher · first-ATTENDED date). Result: child, trial (date, coach, subject name), previous course and previous voucher all resolved; `firstAttendedDate` equals an independent `min(date)` for the course and for the voucher; a voucher as the old entitlement has its coach-change fields forced null; and the real old course has `first_teacher_id` NULL, so the reader returned **`NO_FIRST_COACH`**. **Expect every Bonus 100 to read `NO_FIRST_COACH` until the day-end's `stampFirstCoach` has run on sid** (it back-fills old rows on its first night).
- **Not proven on real data:** a real purchase carrying real F4 links end to end (none exists yet), and the speed of a big month.

**Declared decisions (mine; Silver can overturn at review).**
1. **A purchase before `goLiveDate` is never a candidate** (both bonuses), whatever the trial / old-course switches say. The TASK's switch text implies it ("both ends after go-live") but does not spell it out. One line each to remove.
2. The pure functions take an optional `month` and filter again in code (the SQL window is the first filter), so a bonus is never counted in two months.
3. A voucher has no coach-change / pick columns, so a voucher as the old entitlement always reads "no change" (first coach 1.0).
4. A purchase whose child cannot be read is still LISTED with an empty name (never dropped silently).
5. The loader is about 8 simple SELECTs assembled in memory (no big join); each secondary query runs only when it has ids.
6. The two purchase-query builders and the two first-attended builders are exported and deliberately NOT `async` (a drizzle query is thenable; an `async` function returning one would run it).

**Open for Sector → Silver.** (a) Decision 1 above: confirm or drop. (b) The 1A / 1B and A10 rulings are Khwan's; the switches wait. Nothing else is open.

## Review — @Silver, 2026-11-08: ✅ ACCEPTED (DONE)
- **Re-run by me:**
  - BB `bunx --package typescript@5.9.3 tsc --noEmit` = 0;
  - `bun test` (dummy URL) = **415 pass / 0 fail**;
  - write-grep over the 3 source files = 0;
  - `drizzle.config.ts` / `api.ts` show no change from this TASK (their `M` is Team A's).
- **Shapes and switches as built:** match the TASK. The defaults are DECISIONS row 12, exactly.
- **Mutation work:** 27 of 27 killed. The 2 survivors deleted as dead code were the right call.
- **Brew's declared decisions:**
  - **1. Confirmed:** a purchase dated before `goLiveDate` is never a candidate. It's moot while `goLiveDate` is null.
  - **2–6. Accepted as written.**
- **Real-sid read:** 0 candidates today, because F4 facts only start with sales after the next SB deploy. Every Bonus 100 will read `NO_FIRST_COACH` until the day-end has stamped first coaches. That's expected; it goes in Tanya's notes for the Bonus gate.
- **System teacher:** it can't appear here. "No Teacher" only sits on OTHER rows (TASK-861), never on a trial or a course.
- **Security review:** none. Read-only, no route, no new exposure.
- **Next on these files:** Bob's TASK-867 reads `listBonusCandidates`. The `source_ref` it needs is in Team A's **0011** and the vehicle (for 868) in **0010**, so neither TASK adds a column.

**Sector (Brew's SA), 2026-11-08, before Silver's review:**
- **One addition for Brew, before Silver reviews** (relayed rule, Silver via Porter, after TASK-861 DONE): every Team C reader of `public.teachers` skips `teachers.is_system = true` ("No Teacher"). That system teacher is only ever on park-fee OTHER blocks, so it should never be a trial's or course's first coach. Make it impossible by construction anyway:
  - filter `is_system` out wherever the reader resolves a coach;
  - add one fixture where the system teacher is the "first coach" → no candidate.
  - Then re-run, paste the counts, and keep REVIEW.
- **On decision 1 (a purchase before `goLiveDate` is never a candidate):** my reading supports it.
  - REQ-120 §8 **D6**, Khwan verbatim: *"ไม่เอาทั้งคู่ค่ะ เริ่มนับเฉพาะวันที่ระบบเสร็จเลยไม่ทำย้อนหลังค่ะ"* (bonuses only for cases that start after go-live; no back-fill).
  - It is labelled *Interpreted D6* [SA-read]. **Silver confirms or drops it at review;** it's his TASK.
