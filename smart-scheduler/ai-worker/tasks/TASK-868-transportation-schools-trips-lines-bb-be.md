<!-- Brew 2026-11-08: status REVIEW; report at the end of this file -->
# TASK-868 — BE: REQ-120 **Transportation: schools, trips, and transport pay lines** (backoffice-back) — @Brew (Team C, lent; was @Bob; Porter 2026-11-08) — REQ-120 wk 2–3
**From @Silver, 2026-11-08. BUILD GO (owner, REQ-120 §14).** Contract: **SPEC-100 §3 / §5 / §9b**. Repo `smart-scheduler-backoffice-back`, branch `dong`. **No git command: git only on the owner's word.**
**Size 3.3 d** (sized 10-15).
**Starts after TASK-867,** once `bo.salary_profile.vehicle` exists, in 0009 or in Team B's own migration (step 1).

## Rules (REQ-120 R1.2, R1.6; readiness defaults standing per the owner 10-27)
- **Who:** everyone who drives (any type), per trip.
- **The rate:**
  - car: **6 ฿ / km, min 60 ฿**;
  - motorbike: **3 ฿ / km, min 40 ฿**.
  - The minimum applies **per trip** (per leg for a round trip? **No: per trip as entered**).
  - A round trip is distance × 2, and then the minimum applies once.
- **The school's distance is stored and editable** (R1.2: "the system stores each school's distance, editable").
- **The vehicle:**
  - comes from the person's profile (`bo.salary_profile.vehicle`);
  - **is snapshotted on the trip**, so a later profile change doesn't re-price old trips;
  - readiness Q22 default A: one stored distance; if a car is used, the admin edits that trip's km.
  - **The trip's km is editable per trip and defaults to the school's distance.**
- **R1.6:** "each transportation trip in full", so each trip is one pay line. Label: `<school> · <date dd/mm/yy> · <ไป-กลับ|เที่ยวเดียว> · <km> km`.
  - "ไป-กลับ" / "เที่ยวเดียว" must be strings the final UI already has. Check `final-ui`'s salary mock and screens. If they're missing, stop and tell me; no new words.
- **Who enters trips:** an admin or the CEO (R0: admins enter items). **But SPEC-100's routes are CEO-only today,** and R0.3 "admin-blind entry" is OUT of the thin subset. So **this TASK's routes are `requireRole("ceo", "admin")` for schools and trips. An admin's responses carry no ฿ amounts** (R0.2: an admin never sees pay). Only the CEO sees the computed amount.

## What to build
1. **Data, in Team B's `src/db/schema-salary-b.ts` (`bo` schema), one additive migration through the queue (host check first):**
   - **`bo.school`:** `id` · `name` (unique) · `distance_km` (numeric, > 0) · `active` · timestamps.
   - **`bo.transport_trip`:**
     - `id` · `teacher_id` (plain uuid, no cross-schema FK; SPEC-097's house pattern) · `date` · `school_id` (FK → `bo.school`) · `round_trip` (bool) · `km` (numeric, default the school's distance × (round_trip ? 2 : 1), editable) · `vehicle` (enum snapshot) · `note` · `created_by` · timestamps.
   - **Only if `vehicle` is NOT in 0009:** add `bo.salary_profile.vehicle` (`car` / `motorbike`, NULL) in this same migration. One line in the queue says so.
   - **Add `schema-salary-b.ts` to `drizzle.config.ts`'s `schema` array** (one line, after Team C's, DECISIONS row 7). TASK-863's read-only `public` refs already live in `schema-salary-b-read.ts`, which stays OUT of the config.
2. **Pure pricing:** `src/lib/transport-pricing.ts`: `tripAmountSatang(km, vehicle)` with the minimums. Integer satang.
3. **Routes** (`/salary/transport/*`, mounted in Jason's salary router: one line, after his DONE):
   - `GET / POST / PUT` schools: CEO + admin;
   - `GET / POST / PUT / DELETE` trips by period + teacher: CEO + admin, **no amounts for an admin**;
   - a trip in a locked period → 409 `LOCKED`.
4. **Lines:** `applyTransportLines(periodId)`, exactly like TASK-867's pattern:
   - `kind = 'transport'`, `source = 'auto'`, `source_ref = trip:<tripId>`;
   - idempotent; skip confirmed / locked / no-slip and list them;
   - a trip with no vehicle (profile null) → `SKIPPED_NO_VEHICLE`, listed.
   - Route: `POST /salary/periods/:id/apply-transport`, CEO only.
5. **No screen in this TASK** (Fanta's later TASK).

## Data (not yours to type)
- The school list + distances come from ขวัญ, as a DATA REQUEST through Porter when this TASK starts.
- Until then, test with `B-` schools on sid only. A host check comes first; never touch uat.

## Tests (each must fail when its code is removed)
- **Pricing:** 7 km car → 60 (minimum); 15 km car → 90; 10 km motorbike → 40 (minimum); 20 km motorbike → 60; a round trip doubles the km before the minimum.
- **The vehicle snapshot survives a profile change.**
- **The admin sees no amount;** the CEO does.
- **Locked → 409.**
- **Lines:** idempotent re-run; `SKIPPED_NO_VEHICLE` listed.

## Files (claim, Team B)
- `src/db/schema-salary-b.ts` (new; Team B's `bo` tables);
- `drizzle.config.ts` (one array entry);
- the one migration + its journal entry;
- `src/lib/transport-pricing.ts`, `src/services/transport.service.ts`, `src/routes/transport.ts` (mounted by one line in the salary router) + tests.
- Pure mirror test edits are pre-approved (tagged `🔻 TASK-868`, listed).

## Done =
- `tsc` 0 · BB SAFE suite green (before / after) · the migration `applied · verified` on sid with the host named · a mutation set over the pricing + the admin-no-amount rule.
- A report in `inbox/SA-B.md`. `git status` = only the claimed files. No git command run.

## Update — @Silver, 2026-11-08
- **`bo.salary_profile.vehicle` already exists:** Team A's BB migration **0010** adds it as the enum `bo.vehicle` ('car', 'motorbike').
- So step 1's "only if vehicle is NOT in 0009" means **do not add it.** Read it from Team A's schema, and snapshot that enum value on the trip.
- Team B's migration holds only `bo.school` + `bo.transport_trip`. Take the next free number from MIGRATION-QUEUE at apply time (0011 is Team A's `source_ref`).

**Sector (Brew's SA), 2026-11-08: Brew takes this TASK** (Porter's final staffing call; Silver reviews).
- **Your report goes at the end of THIS file, not in `inbox/SA-B.md`.** Your only contact is me, and I relay it to Silver through Porter (as with 863 and 867).
- **Shared BB files are append-only:**
  - `drizzle.config.ts`: one array entry after Team C's (DECISIONS row 7);
  - `migration-witness.ts`: one entry after the last (row 6);
  - your migration goes through MIGRATION-QUEUE, applied by Silver's seat or mine as Porter says.
- **No clash with Team C's revenue files** (`schema-revenue.ts`, `revenue-ledger*`, `revenue-access.ts`).

## Owner change — @Silver, 2026-11-08: **@Brew starts now.** Silver reviews. Report in this TASK (your chain is Sector), as with 863 / 867.
- **The line writer:** use the same `ON CONFLICT … WHERE source = 'auto' DO NOTHING` store pattern as your TASK-867 `BonusLineStore`, with `kind = 'transport'` and `source_ref = trip:<tripId>`. **Never Team A's `insertLine`** (it drops `source_ref`; Q1 of 867).
- **The trip's pay period** is R1.4's `periodStart..periodEnd` by the trip date (DECISIONS row 18's rule, applied here too).
- **The vehicle:** read `bo.salary_profile.vehicle` (Team A's 0010 enum) and snapshot it on the trip.
- **"Motorcycle":** the owner ruled the label "Motorcycle" (REQ-5010 item 2), so any word a screen or label shows says Motorcycle. The stored value stays `motorbike`.
- **The trip label** keeps the TASK's "ไป-กลับ / เที่ยวเดียว" rule (only words the final UI already has; stop and tell me if they're missing).
- Typecheck with `bunx --package typescript@5.9.3 tsc --noEmit`.

**Trip-label word (Brew's check, 2026-11-08; relayed by Sector to Silver via Porter):** the final UI has "ไป-กลับ" (`Entries.tsx:77`, a toast) but **no** "เที่ยวเดียว". Its trip select says **"Round trip" / "One way"**. "เที่ยวเดียว" appears only in the customer's rules text (`backoffice-rules.md:30`), not in the UI. Per this TASK's line 20, that is a stop-and-tell.
- **My recommendation, for Silver to rule:** use the final UI's own pair, **"Round trip" / "One way"**. Both words are on the agreed screen (no new word), and D2 makes the whole back office English, including the coach's slip.
- **Until Silver answers:** Brew keeps the label as one constant, defaulting to "One way" / "Round trip", and flags it in his report. It's a one-line swap whichever way it goes.

**Settled (Porter, PM wording decision, 2026-11-08):** the trip label is **"Round trip" / "One way"**, as on the agreed final UI. D2 = English back office, slip included. Silver has been told. Brew keeps the constant at that value; no flag is needed in the report.

---
## Report — Brew (Team C), 2026-11-08. TASK-868 built; for Silver's review (via Sector). Migration 0013 is WRITTEN and PROVEN, NOT APPLIED.
**Who and how.** Moved Bob → Brew (Sector). My only contact is Sector, so this report stays here and Sector forwards it; I did not write `inbox/SA-B.md`. Host of BB's `.env` = `154.197.124.206` (sid), checked before every DB touch. No git. Dummy URL on every test run; tsc pinned to `typescript@5.9.2` (the repo's earlier pin; the TASK names 5.9.3, same result expected). `bo.salary_profile.vehicle` is read from Team A's 0010 (enum `bo.vehicle`, imported, not re-declared), as Silver's update says.

**Files (the claim).**
- **New:** `src/db/schema-salary-b.ts` (`bo.school`, `bo.transport_trip`) · `drizzle/0013_bo_school_transport_trip.sql` + `drizzle/meta/0013_snapshot.json` · `src/lib/transport-pricing.ts` (+test) · `src/services/transport.service.ts` (+test) · `src/routes/transport.ts` (+test).
- **Edited, append-only:** `drizzle.config.ts` (**one** array entry after Team C's, row 7) · `drizzle/meta/_journal.json` (one entry) · `src/lib/migration-witness.ts` (one entry after the last, row 6; the witness is the trip's `(teacher_id, date)` index, the last object 0013 creates) · `src/routes/salary.ts` (Jason's; 4 hunks each tagged `🔻 TASK-868`: 2 imports, the one `.route("/transport", …)` mount line, and `POST /periods/:id/apply-transport`, `ceo` only) · `src/routes/salary-routes-task865.test.ts` (pre-approved mirror edit: the route count `16 → 24`, one line).
- No Team C revenue file touched. `git status` also lists my earlier, still-uncommitted TASK-867-rework files (`bonus-*`); nothing else.

**The migration (additive).** `drizzle-kit generate` against the real schema files into a scratch copy of `drizzle/`: the diff was exactly my two tables, one FK, one unique index on `lower(name)`, one index. **No hand-trim was needed** (0012's snapshot is complete). `school_distance_ck` / `transport_trip_km_ck` use bare column names in raw `sql`. The journal diff is exactly one entry. The scratch dir is deleted.
- **Proven on sid WITHOUT applying it.** Postgres DDL is transactional, so the proof script runs 0013's own 5 statements inside ONE transaction, exercises everything through the real db stores and Jason's real engine, and **ROLLS BACK** (host printed first and guarded; period 2099-10; random uuids). Afterwards `bo.school` / `bo.transport_trip` are still absent, and periods / profiles / lines are 0.
- **I have NOT written an `applying` line in MIGRATION-QUEUE.** Sector: say who applies 0013 (Silver's seat, yours, or me). The queue rule is host check first, `applying`, `drizzle-kit migrate`, `applied · verified`. Until it is applied the routes fail with "relation does not exist".

**What it does.**
- **Pricing, `tripAmountSatang(km, vehicle)`:** car 6 ฿/km, minimum 60 ฿; motorbike 3 ฿/km, minimum 40 ฿ (stored value `motorbike`; the label never prints the vehicle word, so "Motorcycle" is not needed here). The minimum is per trip, once, after a round trip doubled the km.
  - **Exact integer satang, no rounding:** km has at most 2 decimals, so `hundredths × rate(฿/km)` is already satang. A figure with more than 2 decimals is refused, never rounded.
  - Check: 7 km car → 60 ฿ · 15 km car → 90 ฿ · 10 km motorbike → 40 ฿ · 20 km motorbike → 60 ฿ · a round trip doubles first (4 km each way by car = 8 km → the 60 ฿ minimum; 6 km each way = 12 km → 72 ฿).
- **Schools,** `GET/POST/PUT /salary/transport/schools`: name unique case-insensitively (409 `SCHOOL_EXISTS`), one-way distance > 0 with at most 2 decimals. A new distance never re-prices an existing trip; the trip stores its own total km.
- **Trips,** `GET/POST/PUT/DELETE /salary/transport/trips` (GET by `periodId` = the R1.4 range, optional `teacherId`).
  - `km` defaults to the school's distance × (round trip ? 2 : 1) and is editable per trip. **`vehicle` is a snapshot of the profile at entry** (Q22 default A).
  - Every route is `requireRole("ceo", "admin")`. A coach is 403, no token is 401, and a malformed id is 404.
- **🔑 An admin sees no amount.** `tripDTO(trip, school, viewer)` builds the response key by key (a whitelist).
  - The CEO gets `{…, vehicle, amountSatang|null}`. An **admin gets neither**: `id, teacherId, date, schoolId, schoolName, roundTrip, km, note`.
  - Tested at the DTO, at the service (create / update / list) and over HTTP. Extra keys in an admin's body (`vehicle`, `amount`) are ignored, not stored. The school list carries no pay at all.
- **🔑 Locked → 409 `LOCKED`.** Create / edit / delete are refused when the pay period that contains the trip's date is locked (Jason's lazy 12:00 lock counts). An edit that moves a trip INTO or OUT OF a locked period is refused. The boundaries are inclusive (30/9 and 30/10 are inside October's). A date no period covers yet is open.
- **Lines, `POST /salary/periods/:id/apply-transport` (CEO only):** `kind='transport'`, `source='auto'`, `source_ref='trip:<tripId>'`, label `<school> · <dd/mm/yy> · <Round trip|One way> · <km> km`, integer satang.
  - The words are **"Round trip" / "One way"**, as Porter settled (D2: English back office). They are two constants, `ROUND_TRIP_WORD` / `ONE_WAY_WORD` in `transport-pricing.ts`, so a swap is one line.
  - Idempotent through 0011's partial unique index, using my own `ON CONFLICT DO NOTHING` line store (the 867 reason: never Team A's `insertLine`).
  - Result `{written, unchanged, skipped[], orphaned[], changed[]}`. `SKIPPED_NO_VEHICLE` is named before the slip is looked at; then `SKIPPED_NO_SLIP` (no slip is created), `SKIPPED_CONFIRMED`, `SKIPPED_LOCKED`; a locked period is 409; an unknown period is 404.
  - It never deletes or rewrites a money line: a line whose trip is gone is `orphaned`, one whose amount or label would now differ is `changed` (both report-only, as 867). Only the period's own trips count (29/9 is September's, 31/10 is November's).

**Evidence (dummy URL).**
- **BB `598 pass → 711 pass · 0 fail · 26 → 29 files`** (+113 across 3 new test files and the mirror edit). `tsc --noEmit` exit 0.
- **Mutation set, 54 mutants, 54 killed:**
  - **Pricing:** rates, minimums, max/min, doubling, decimals, the vehicle check, the label words and the date format.
  - **Admin rule:** the DTO whitelist ×4.
  - **Snapshot:** ×3.
  - **Lock:** both boundaries, create / edit-old-date / edit-new-date / delete / apply.
  - **Lines:** the km defaults, each SKIP, `wantedKeys`, `changed` by label and by amount, the orphan filter, the lost race, the period range.
  - **Route gate:** admin / coach / ceo-only / unguarded.
  - The first run killed 49; the 5 survivors were real gaps (lock boundary, label-only and amount-only `changed`, the route's own positive-km check). Each now has a test. Files restored byte for byte (hash check). Re-run after the label change: 54/54.
- **sid proof (rolled back, residue 0), real stores and engine:**
  - **Schema objects:** indexes `bo_school_name_uq`, `bo_transport_trip_teacher_date_idx` and the two pkeys; checks `school_distance_ck`, `transport_trip_km_ck`; FK `transport_trip_school_id_school_id_fk`.
  - **Schools:** a duplicate by lower-case name → 409; the SQL CHECK refuses distance 0 (`23514`).
  - **Trips:**
    - A (car) round trip, 12 km school → km 24, stored `"24.00"`, snapshot `car`, 14,400 satang.
    - B (motorbike) one way 9 km → 4,000 (the minimum).
    - C with no vehicle → `null / null`.
    - After A's profile switched car → motorbike, A's old trip stayed `car` at 14,400.
  - **Admin list:** keys are the 8 admin keys, with no amount or vehicle.
  - **Apply #1:** `written 2, skipped [SKIPPED_NO_VEHICLE]`. Rows: `kind transport · source auto · source_ref trip:… · 144.00 "B-STA · 14/10/99 · Round trip · 24 km"` and `40.00 "B-ABC · 14/10/99 · One way · 9 km"`.
  - **Re-run and duplicate:** `written 0, unchanged 2`; a direct duplicate insert → `exists`.
  - **Slip total:** A's slip through the real engine is **2,514,400** (2,500,000 + 14,400).
  - **After an edit and a delete:** editing A's km to 40 and deleting B's trip gave `changed 1, orphaned 1, written 0`, rows still 2.
  - **After `lockPeriod`:** create / edit / delete / apply → **409 LOCKED ×4**.
- **Not exercised:** the HTTP layer over the real database (the route tests run on the in-memory stores; the sid proof drives the same service on the real stores); two truly concurrent applies; the real school list (ขวัญ's DATA REQUEST through Porter is still to come; the proof used `B-` schools in a rolled-back transaction, so nothing persists).

**Declared decisions (mine; Silver can overturn).**
1. An **admin** gets no `vehicle` either (km + vehicle would give the pay away). Said in the code and tested.
2. The lock looks at the period **containing the trip's date**, by the R1.4 range. A trip dated where no period exists yet is open.
3. Editing a trip: `km` omitted + the school or the round-trip flag changed ⇒ the default is recomputed for the new school / flag; otherwise the (edited) km stays. The vehicle snapshot is **never overwritten, except a NULL one**, which is filled from the profile on the next edit (a trip entered before the person had a vehicle on file would otherwise never be paid).
4. An **inactive** school cannot take a new trip (400); existing trips keep it. Renaming a school after its trips were paid changes only the **label**, reported as `changed`, not rewritten.
5. `orphaned` / `changed` are report-only, as 867. Practical effect: an admin's fix to a trip **after** its line was written does not reach the slip until the CEO corrects the line by hand.
6. `teacherId` is any uuid (there is no teachers table in `bo`; the FE picker supplies it). A person with no profile gets a trip with no vehicle ⇒ `SKIPPED_NO_VEHICLE`.

## Questions (for Sector → Silver / Porter)
1. **Who applies 0013, and when** (see above). Nothing on sid changed.
2. **`orphaned` / `changed` report-only** (decision 5): confirm, or say that an edited / deleted trip should rewrite / remove its line while the slip is still a draft.
3. **Mount style:** the `.route("/transport", …)` line sits at the top of Jason's chain, before his `ceo`-only routes; the sub-router carries its own `requireRole("ceo","admin")`. If Silver prefers it at the end it is a one-line move (the route-count test is order-independent).

**Sector (Brew's SA), 2026-11-08: relayed to Silver via Porter.**
- **Migration 0013 is applied after Silver accepts the TASK, not before.** A schema on the shared sid DB stays there for every team, so the reviewer sees the SQL first.
  - I checked it is additive: no DROP, no ALTER of an existing `bo` table.
  - Once Silver accepts, I apply it through MIGRATION-QUEUE (I hold the BB applies for Team C's engineer), unless Porter names Silver's seat.
- **Q2 and Q3 are Silver's calls** (his TASK). My reading:
  - **Q2:** report-only is consistent with 867's Q3 ruling (`orphaned`/`changed` report-only);
  - **Q3:** mount order doesn't matter, since the sub-router carries its own gate.

**Label words (flag, per Sector 2026-11-08):** default "One way" / "Round trip" (the final UI select; D2 English back office), as Porter settled and Sector relayed to Silver. Constants `ONE_WAY_WORD` / `ROUND_TRIP_WORD`; not "เที่ยวเดียว".

## Review — @Silver, 2026-11-08: ✅ ACCEPTED (DONE on code; 0013 to be applied)
- **Re-run by me:** BB `bunx --package typescript@5.9.3 tsc --noEmit` = 0; `bun test` (dummy URL) = **711 pass / 0 fail**.
- **`salary.ts` diff:** 2 imports + the `/transport` mount + 1 CEO route, all tagged; nothing else in Jason's file.
- **The admin's reach:** the salary router is mounted plainly in `api.ts:20`, and every one of Jason's routes carries its own `ceo` guard. So the admin reaches only the `/transport` sub-router, which has its own `requireRole("ceo","admin")`.
- **0013 read in full:** additive only.
  - 2 new `bo` tables, 1 FK between them, 1 unique index on `lower(name)`, 1 index.
  - The CHECKs are `> 0`.
  - No DROP, and no ALTER of an existing table.
  - `vehicle` reuses Team A's `bo.vehicle` enum.
- **Brew's declared decisions 1–6:** accepted as written. The admin seeing no `vehicle` is right: km + vehicle would reveal the pay.
- **Label words:** "Round trip" / "One way" (Porter's D2, English back office). Fine.

**Answers:**
- **Q1, who applies 0013:** **Sector**, through MIGRATION-QUEUE (host check = .206 first, then `applying` → `applied · verified`), now that it's accepted. Please quote the two queue lines here when done.
- **Q2:** **report-only confirmed**, the same as 867 Q3. A trip edited or deleted after its line was written leaves the slip line as is and is listed as `changed` / `orphaned`.
  - **What this obliges:** the CEO's pay-run screen must show `changed` / `orphaned` from the apply result, so a fix is never invisible. That goes into the front TASK that wires apply-transport (Team B, later); I'll carry it there.
- **Q3:** **leave the mount where it is.** The sub-router carries its own gate, and the order changes nothing.

- **Security review:** none.
  - Admin access is limited to schools / trips with a whitelist DTO, tested at three layers. The apply route is CEO only.
  - Inputs are validated (uuid, decimals, `> 0`), the SQL is parameterised (drizzle), and nothing is deleted.
- **Still to come:**
  - ขวัญ's school list (DATA REQUEST through Porter);
  - the front screens (Fanta, later).

**0013 applied on sid (Sector, 2026-11-08, after Silver's accept), the two MIGRATION-QUEUE lines quoted:**
> `| 2026-11-08 | backoffice-back | 0013_bo_school_transport_trip (additive: bo.school + bo.transport_trip; read by Silver, TASK-868 accepted) | Team C / Sector (BE: Brew, TASK-868, Team B pile) | applying — host check passed: 154.197.124.206 = sid, db smart_scheduler (host only) |`
> `| 2026-11-08 | backoffice-back | 0013_bo_school_transport_trip | Team C / Sector (BE: Brew, TASK-868) | applied · verified on host 154.197.124.206 = sid (host only): drizzle-kit "migrations applied successfully"; db:verify "✅ every migration is recorded in the ledger AND witnessed in the schema" (journal 14, witnesses 12) |`

Silver's Q2 and Q3 answers stand: report-only, with the CEO pay-run screen showing `changed`/`orphaned` in a later front TASK; the mount stays. **No school-list request:** the admin enters schools on screen (Khwan, 10-14).
