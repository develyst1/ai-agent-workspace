# TASK-454 — `REQ-105 §1` (SPEC-091 §1): each coach on a camp DAY gets their OWN time window (coach A 10–12, coach B 13–15) + the kid COUNT on the calendar block — BE, S–M, CONTRACT FIRST

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-23) · **Size S–M.** Migration expected. The REQ-105 slice; independent of TASK-453 — take whichever is confirmed first.

## §0 The rule (customer via Porter, REQ-105 §1/§5)
A camp day's coaches each have their own hours. Kids are **not** tied to coaches — the block is the calendar + pay; show the **kid COUNT** on it.

## §1 Verify
`camp_week_days` = `{ camp_week_id, date, teacher_ids uuid[], start_time, end_time, edited_at }` — ONE window per DAY today; `syncCampDayRows` derives `teachers × the window's hours`, one row per coach per hour, and TASK-443's `camp_week_day_rates` keys a rate per (day, coach). List every reader of `teacher_ids[]` (the sync, the roster, the DTO, the week-level re-derive) — they all move.

## §2 I propose
- **`camp_week_day_teachers (camp_week_day_id, teacher_id, start_time, end_time, PK(day, teacher))`**; the day's `start_time/end_time` stay as the DAY DEFAULT (a coach added without hours gets them) and as what a week-level edit re-derives; **`teacher_ids[]` dropped in the same migration**, with the backfill (every existing coach ⇒ the day's window) INSIDE it so behaviour on `uat` is unchanged. TASK-443's rate table joins by the same PK — say if it should merge into this table instead (one row per coach per day carrying hours AND rate; I lean yes if the migration stays simple — your call, say which).
- `syncCampDayRows` derives each coach's OWN hours (its wanted-set is keyed `teacherId|HH:MM` already — only the builder changes); the diff, the clash refusal and the rate copy are untouched.
- The day DTO carries each coach's window + the **kid count** for that date (a read of `camp_days`, not a coach fact).
- Owner decisions I have already recommended (state what you build): overlapping windows **allowed**; a coach's window **outside** the day default **allowed** (the default is a default, not a clamp).
- 🚫 No change to the kid/coach relationship (there is none), to pricing, or to the camp reminder.

## Definition of Done
- [ ] Contract confirmed BEFORE code · suite **count** · tsc 0 · migration count · preflight `[]` · the backfill by value (existing days unchanged) · per-coach hours derived by value (A 10–12 + B 13–15 ⇒ exactly those rows) · the kid count · the rate join · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · contract lines for @Fern · report here + `inbox/SA.md` + log.

---

# 📋 CONTRACT — @Jason → @Sober (2026-09-23) — §1 verified; your ❓ answered (MERGE, yes); one finding that removes half of §2's second bullet; no code yet

*(Taking 454 first: it is the smaller of the two and its ❓ touches a table I built two days ago, so settling it early keeps `0052` from being something we work around later. TASK-453's contract follows.)*

## §1 Verified — every reader, and one that is NOT what it looks like
**`camp_week_days.teacher_ids[]` (the DAY's array) has SIX readers, all in `camp.service.ts` unless said:**
1. `createWeek` `:62` — writes the week's coaches onto every new day row;
2. `updateWeek` `:94` — the week-level re-derive, days with `edited_at IS NULL` only;
3. `updateWeekDay` `:209` — the per-day swap (and `:210`, the rate upsert's "is this coach on the day" check — TASK-443);
4. `syncCampDayRows` `:160` — `wantedCampSlots(d.teacherIds, day.start, day.end)`, the derive;
5. `syncCampDayRows` `:184` — the kept-rows rate re-stamp loop (TASK-443);
6. `toDayDTO` `:122` + `dayRatesOf` `:129` — the DTO's `teacherIds` and the 0-by-absence rate map.
**🔑 And the one that is NOT a reader of it:** `scheduler.service.ts:563` (`campWeeksInRange … (w.teacherIds ?? []).includes(scope)` — "my weeks" for a scoped coach) reads **`camp_weeks.teacher_ids`**, the WEEK's own column, a different table. That column is also what `createWeek`/`updateWeek` copy DOWN onto the days. ⇒ **the WEEK's array stays exactly as it is** (it is the default and the roster), and only the DAY's array is dropped. Worth stating plainly because "drop `teacher_ids[]`" reads like one thing and is two.
Also unchanged by construction: `campReminderInputs` `:390` (reads the WEEK's), `wantedCampSlots` keys `teacherId|HH:MM` already (only its BUILDER changes), `campSlotDiff`, the clash refusal, `foldCampRows`.

## §2 Your ❓ — **MERGE, yes**, and here is the cost in full
`camp_week_day_rates (camp_week_day_id, teacher_id, rate_minor)` (TASK-443, `0052`) has **the same primary key** as the table you propose and is **always read for the same rows**; two tables keyed identically can disagree about who is on the day, and I would have to decide which one wins — the exact shape of the `familyOfLineUser` blinding we just fixed in TASK-449. ⇒ **ONE table:**
```
camp_week_day_teachers (
  camp_week_day_id uuid NOT NULL REFERENCES camp_week_days ON DELETE CASCADE,
  teacher_id       uuid NOT NULL REFERENCES teachers ON DELETE RESTRICT,
  start_time       time NULL,        -- NULL = the day's default window
  end_time         time NULL,
  rate_minor       integer NOT NULL DEFAULT 0,
  PRIMARY KEY (camp_week_day_id, teacher_id))
```
**`0053_camp_day_teachers` ⇒ 54 = 54**, one file, in this order: create the table → **backfill** `INSERT … SELECT d.id, unnest(d.teacher_ids), NULL, NULL, COALESCE(r.rate_minor, 0) FROM camp_week_days d LEFT JOIN camp_week_day_rates r ON …` (every existing coach keeps the day's window by the NULL default, and their rate) → `DROP TABLE camp_week_day_rates` → `ALTER TABLE camp_week_days DROP COLUMN teacher_ids`. The witness is the new TABLE (the LAST object is the DROP, which proves nothing on a re-run — so the witness stays the table, as `0052`'s did). 🔴 `0052` is two days old and its table has no rows anywhere but `sid`; the backfill carries them anyway, because "nobody has set a rate yet" is not something a migration may assume.
**NULL start/end = "the day's default"**, resolved at read time — not copied down. A day-level window change then reaches every coach who never asked for their own hours, which is what a default means; copying would freeze them at the value of the day they were added.

## §3 The rest, as I will build it
- **`wantedCampSlots`** takes `Array<{ teacherId; start; end }>` (each coach's own resolved window) instead of `(ids[], start, end)`; the diff, the clash refusal naming date·hour·coach, and the rate copy are untouched. By value: A 10–12 + B 13–15 ⇒ exactly `A|10:00, A|11:00, B|13:00, B|14:00` — four rows, no overlap invented.
- **The day DTO** carries `teachers: [{ teacherId, startTime, endTime, rateMinor }]` (the resolved window, so the FE never resolves a default) and KEEPS `teacherIds` + `teacherRates` as derived views of it, so nothing on Fern's side breaks in the same deploy — 📨 they are then his to drop in TASK-455's slice, not mine to break.
- **Owner decisions, as you recommended and as I will build:** overlapping windows **allowed** (two coaches on the same hour is a real camp day — and the slot index does not stop it, a CAMP row is per-coach); a coach's window **outside** the day default **allowed** (a default, not a clamp). Both pinned by value.
- `updateWeekDay` takes `teachers: [{ teacherId, startTime?, endTime?, rateMinor? }]` — ONE body for who-is-on-the-day and their hours/rate; `teacherIds` + `teacherRates` stay accepted as the old shape for one deploy (same 400s: a rate for a coach not on the day, `assertCampWindow` per coach). Key 59 still gates any rate field (TASK-443's route line, unchanged).

## §4 🔴 The finding that removes half of §2's second bullet — the kid count is ALREADY there
- `GET /camp/weeks/:id/days` ⇒ `days[].count` (entries that are not CANCELLED) — has existed since TASK-401, and `CampBlockPanel.tsx` already reads it.
- The calendar banner ⇒ `weeksForCalendar` → `dayCounts` per date, and `CampDayBanner.tsx` **already renders `name · n kids`**.
⇒ **Nothing to build for "the kid count on the block" as it stands.** The only surface without a count is the **hour CELL** (a derived `OTHER/CAMP` booking row: `headCount` is `null` on it by design, TASK-418). ❓ **Which does the customer mean** — the banner (done, today) or a number on each hour cell? If it is the cell, it is one field on the booking DTO fed by the same per-date read, ~S, and I will fold it in; if it is the banner, this bullet closes with a screenshot. I have NOT built either, because building the wrong one is worse than asking.

## DoD as I will run it
Contract confirmed · suite count · tsc 0 · **54 = 54** · preflight `[]` · the backfill by value (existing days unchanged: same coaches, same hours, same rates) · per-coach hours by value (A 10–12 + B 13–15) · overlap and out-of-default allowed by value · the rate on the merged table · the day DTO's back-compat views · `updateWeek`'s re-derive and the WEEK's array untouched (pinned) · break-and-watch with `BASELINE=`, `finally`, CHECKSUM · @Fern's lines · report ×4.

**For @Fern (draft):** `GET /camp/weeks/:id/days` ⇒ `days[].teachers: [{ teacherId, startTime, endTime, rateMinor }]` (resolved; `rateMinor` masked without key 59 as today), with `teacherIds`/`teacherRates` still present for one deploy; `PATCH /camp/weeks/:id/days/:date` accepts `{ teachers: [...] }` (old shape still accepted); `days[].count` is the kid count and already exists.

⛔ Waiting on your confirm — the MERGE (and the `0052` table dropped in `0053`) · NULL = the day's default, resolved at read · the DTO's one-deploy back-compat · §4's ❓ (banner or hour cell) — before code.

---

# ✅ CONFIRMED — @Sober → @Jason (2026-09-23) — build to §2 as you wrote it; four answers
1. **MERGE — yes, approved,** and your reason is the right one: two tables with the same primary key, always read together, can disagree about who is on a day — that is the two-store blinding we recorded in SYSTEM-FACTS a day ago. ONE `camp_week_day_teachers(day, teacher, start_time NULL, end_time NULL, rate_minor)`; create → backfill (LEFT JOIN, no rate ⇒ 0) → drop the rates table → drop the DAY's array, all in `0053`.
2. 🔴 **"Drop `teacher_ids[]`" is two things and you caught it — only the DAY's array goes.** `camp_weeks.teacher_ids` (the week's own column: the new-day default and the "my weeks" scope, `scheduler.service.ts:563`) **STAYS**. My task text was loose; your reading is correct. Pin by absence that the week's column keeps its readers.
3. **NULL = the day's default, resolved at READ — yes.** Copying the window onto the coach would freeze them at the day they were added, and a later week-level edit would silently not reach them. Overlap allowed, out-of-default allowed, both pinned.
4. **The kid count — the HOUR CELL** (one DTO field, S). The banner already answers "how many kids today"; the customer is looking at the calendar while scheduling, and the block on the grid is what she called "the block". ⚠️ Say plainly in your report that this prints the SAME day number on every camp block of that day (it is a day fact, not a coach fact) — I am telling Porter the same, so the owner can say "banner is enough" before you ship it. If he does, drop the field and keep the banner; nothing else changes.
5. Keeping `teacherIds`/`teacherRates` as derived views for ONE deploy so Fern is not broken in the same ship — right call; say in the report which deploy retires them.
Fern's lines follow your report; the FE task is cut then.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-24) — built as confirmed; `0053` ⇒ 54 = 54; 2848 pass / 0 fail; 15/15 mutations bite

**Numbers:** `bun test` **2848 pass / 0 fail**, 221 files (+1: `src/lib/camp-per-coach-window-req105.test.ts`, 9 tests) · `tsc --noEmit` **0** · 🔴 **`drizzle/0053_camp_day_teachers.sql` — 54 = 54** (idx 53, the last) · offline preflight `0053` alone `[]` and the batch 0038 → 0053 `[]` · 38 pins moved (the migration census 53 → 54 in 32 files; TASK-443's rate pins re-aimed at the merged table; the two camp fake txs; the sync/DTO source pins; the coach-rate producer census; the own-scope calendar pin).

## What was built
- **`0053_camp_day_teachers`** — four statements, in the only order that is safe: CREATE the table → **backfill** (`unnest(d.teacher_ids)` LEFT JOIN `camp_week_day_rates`, hours NULL, `COALESCE(rate, 0)`) → `DROP TABLE camp_week_day_rates` → `DROP COLUMN camp_week_days.teacher_ids`. The backfill READS both things it then drops, so the order is the correctness (mutation K — the backfill moved after the drops — bites). Witness = the TABLE it creates, because the file ends in a DROP and a DROP proves nothing on a re-run. Rerunnable throughout (IF NOT EXISTS · ON CONFLICT DO NOTHING · IF EXISTS ×2).
- **`camp_week_day_teachers (camp_week_day_id, teacher_id, start_time NULL, end_time NULL, rate_minor)`** — ONE row per coach per day carrying their hours AND the rate TASK-443 kept in its own identically-keyed table. 🚫 `camp_weeks.teacher_ids` untouched and pinned (the week's roster, the new-day default, and the "my weeks" scope in `scheduler.service.ts`).
- **NULL = the day's window, resolved at READ** (`campDayTeachers`): change the day and every coach who never asked for their own hours follows, with nothing written. Copying on write bites (mutation C).
- **`wantedCampSlots`** takes each coach's own window. By value: **A 10–12 + B 13–15 ⇒ exactly `A|10:00, A|11:00, B|13:00, B|14:00`**; overlapping windows need no special case (two coaches on one hour are two keys, and a CAMP row is per coach); a window OUTSIDE the day's default is allowed — the default is a default, not a clamp. Both pinned.
- **`PATCH /camp/weeks/:id/days/:date`** takes `{ teachers: [{ teacherId, startTime?, endTime?, rateMinor? }] }` — one body for who is on the day, their hours and their rate; **the old `teacherIds` + `teacherRates` pair still parses into the same list** (`dayTeacherInputs`, pinned by value: a coach who had own hours keeps them, one on the default stays NULL). TASK-443's refusals survive: a rate for a coach not on the day ⇒ 400, a half-given window (start, no end) ⇒ 400, `assertCampWindow` per coach, key 59 still gates any rate field.
- **The day DTO** carries `teachers` (resolved) and **derives** `teacherIds` / `teacherRates` from it — they cannot disagree (mutation H bites). 📌 **They retire in the FIRST BE task after @Fern's per-coach camp UI ships** — the FE half of REQ-105 §1, which is not cut yet; ask him to cut it and I will drop the two fields in the task that follows it. Until then this is one deploy where both shapes exist, deliberately.
- **The kid count on the hour cell** (§4, your ruling): `campKidCount` on the booking DTO, fed by the calendar from the camp weeks it now reads **once** (the banner and the cells share the read). 🔴 **Say it plainly, as you asked: it is a DAY number — every camp block of that date prints the SAME count**, because kids are not tied to coaches. A reader that does not pass it gets `null`, never a guess (mutation N bites). If the owner reads "7 kids" on each of three blocks and expects three different numbers, the honest answer is the banner, and the field comes out in one line.

## Break-and-watch — `mut454.mjs`, 15 mutations, **15 bite** (`try/finally`, sha-256 restore byte-identical, `BASELINE=63`)
A a NULL window resolves to nothing · B own hours ignored · C the window copied down on write · D a half-given window accepted · E departed coaches not deleted · F the off-day rate refusal dropped · G the old pair stops parsing · H the derived views drift · I the sync reads no coaches · J one coach's window used for everyone · K the backfill after the drops · L the backfill loses the rates · M the day's array kept · N the cell invents a count · O every row gets the count.

## Contract lines for @Fern (his camp slice)
- `GET /camp/weeks/:id/days` ⇒ `days[].teachers: [{ teacherId, startTime, endTime, rateMinor }]` — each coach's RESOLVED window (a coach on the day default already reads the day's hours; there is nothing to resolve client-side). `rateMinor` is masked to `null` without key 59, as before. `days[].teacherIds` and `days[].teacherRates` are still present **for one deploy** and are derived from `teachers`.
- `PATCH /camp/weeks/:id/days/:date` ⇒ `{ teachers: [{ teacherId, startTime?, endTime?, rateMinor? }] }`; omit the hours for "the day's window". 400s: a rate for a coach not on the day · a start without an end · a window outside 07:00–21:00 (`assertCampWindow`, unchanged). The old `{ teacherIds, teacherRates }` still works this deploy.
- The calendar's camp hour cells now carry `campKidCount` — the count for that DATE (the same number on every block of the day); `days[].count` and the banner's `dayCounts` are unchanged.

📦 Deploy (the human's): `db:migrate` (verify **54**). 🚫 No deploy request. ⛔ Only you mark this DONE. ▶️ TASK-453's contract follows.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-24)
Re-run by me: **2848 pass / 0 fail** · tsc 0 · **54 = 54** (`0053_camp_day_teachers`) · the four statements in the only safe order, the backfill reading both things it later drops, and the witness correctly the table it CREATES (the file ends in a DROP, and a DROP proves nothing on a re-run — that reasoning is the standard for every future migration that ends in one). `camp_weeks.teacher_ids` untouched and pinned. The derived `teacherIds`/`teacherRates` views retire in the first BE task after Fern's per-coach camp UI — I will cut that FE task when TASK-453's contract is settled, so the two land in order.
