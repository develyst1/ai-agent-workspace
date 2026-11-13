# TASK-867 — BE: REQ-120 **Bonus 50 / Bonus 100 as auto pay lines on the slip** (backoffice-back) — @Brew (Team C, lent; was @Bob) — REQ-120 wk 2
**From @Silver, 2026-11-08. BUILD GO (owner, REQ-120 §14).** Contract: **SPEC-100 §3 / §5 / §9b** (Sober: the canonical pay-line model). Repo `smart-scheduler-backoffice-back`, branch `dong`. **No git command: git only on the owner's word.**
**Size ≈ 1.3 d** (the rest of the sized Bonus 50 / 100, 3.3 d, after TASK-863's ≈ 2 d).
**Starts when all three are true:**
1. TASK-863 is accepted;
2. Jason's `0009_bo_salary_thin_slip` is `applied · verified` on sid;
3. `bo.pay_slip_line.source_ref` exists, either in 0009 (asked of Sober via Porter, 11-08) or in Team B's own queued migration (step 0 below).

**✅ All three are true as of 2026-11-08 evening. Owner: @Brew (Team C, lent; Porter's move), starting now. Silver reviews.**
- TASK-863 is DONE.
- 0009 is on sid.
- **`source_ref` + `bo_pay_slip_line_auto_ref_uq (slip_id, kind, source_ref) WHERE source = 'auto'` are on sid in Team A's BB 0011.** A duplicate auto line is refused with 23505.
- **So skip step 0: no Team B migration.** Read the column from Team A's schema.
- **Idempotency:** upsert on that index, or check first. A 23505 on a re-run must never reach the caller as a 500.
- **No coach is ever the system teacher** (TASK-861: only OTHER rows use it), so there's no filter for it here.
- Typecheck with `bunx --package typescript@5.9.3 tsc --noEmit`.
- **Report:** in this TASK file (your chain is Sector), as with 863.

## What it does
For one pay period, it turns TASK-863's candidates into `bo.pay_slip_line` rows with **`kind = 'bonus'`, `source = 'auto'`**, on the right coach's slip. It's idempotent: run twice and nothing doubles.

## Rules (REQ-120 R1.2, R1.6; DECISIONS row 12 switches; do not re-decide)
- **Amounts:** Bonus 50 = **50 ฿** · Bonus 100 = **100 ฿**, × the share fraction (1 or 0.5, from 863's `shares`). Integer satang, no float money (SPEC-100 §9b).
- **Who is eligible**, read from `bo.salary_profile.employment_type` (SPEC-100 §3):
  - `FT` → yes;
  - `PT` → **only if the qualifying class was on a PT day, Sat–Sun** (R1.1). For Bonus 50 that's the trial's date. For Bonus 100 it's the old course's first ATTENDED date, which 863 returns;
  - `FL` / `STAFF` / no profile → no line.
  - An ineligible coach's share is simply not paid: readiness default S17(c), standing per the owner 10-27.
  - *(When Team A's F3 lands multi-role, the PT-day rule moves to F3's day→role function. Leave a `TODO(F3)` at the one place it's decided.)*
- **The month:** the period's month = 863's month (the purchase's Bangkok `created_at`).
- **The slip:** the coach's slip in that period. **If the coach has no slip** (not in the run), don't create one. List it as `SKIPPED_NO_SLIP` in the result.
- **Each line's `label`** (R1.6 "each bonus with the child's name"): `Bonus 50 · <nickname or name> (<Private|Duo|Voucher>)` / `Bonus 100 · <nickname or name> (<Private|Duo|Voucher>)`. These are the final UI's words (V3-F p5), not new ones.
- **`source_ref`** = `b50:<purchaseId>:<coachId>` / `b100:<purchaseId>:<coachId>`. The partial unique index (`slip_id`, `kind`, `source_ref`) makes a re-run a no-op.
- **Locked:** a `locked` period or slip refuses with 409 `LOCKED`, exactly as SPEC-100 §4 does. `confirmed` slips: also skip, and list as `SKIPPED_CONFIRMED`. Changing a confirmed slip behind the coach's back is R1.5's question, and it isn't decided here.
- **Not written:** `UNRESOLVED` (no pick yet) and `NO_FIRST_COACH` candidates. They come back in the result with their status, for the CEO screen later.
- **Removal:** if a candidate disappears on a re-run (e.g. a purchase ended), its auto line is **not** deleted in this TASK. List it as `ORPHANED` in the result. Who removes money lines is a Salary rule for later.

## What to build
0. **Only if `source_ref` is NOT in 0009:** write Team B's own additive migration. Add `source_ref text NULL` + the partial unique index on `bo.pay_slip_line`, hand-authored per this repo's way, through MIGRATION-QUEUE.md (host check first, sid = .206), in apply order after 0009. Otherwise skip this step.
1. **The service:** `src/services/bonus-lines.service.ts`: `applyBonusLines(periodId, rules = DEFAULT_RULES)` returns `{ written, unchanged, skipped: [{reason, …}], unresolved: […], orphaned: […] }`. One transaction, with the lazy-lock check of SPEC-100 §4 first (reuse Jason's function; don't copy it).
2. **The route:** `POST /salary/periods/:id/apply-bonus` → that result, under `requireRole("ceo")`, mounted inside Jason's `/salary` router.
   - **It touches one shared file** (his `src/routes/salary*.ts`). Add **one** route line after his TASK-865 is reported DONE, and nothing else in his file.
   - Until then, build and test it unmounted.
3. **No screen in this TASK.** The CEO screen that shows unresolved / skipped comes with the screens' wiring.

## Tests (TDD, SAFE env; each must fail when its code is removed)
- **Lines:** FT + Bonus 50 → one line, 50 ฿, the right label and `source_ref`. A SHARE pick → two lines, 50 ฿ each, on the two slips.
- **PT:** a PT coach on a Saturday trial → paid; on a Wednesday trial → not paid. FL → never.
- **Re-run:** `unchanged`, no duplicate.
- **Skips and refusals:** a locked period → 409 `LOCKED`; a confirmed slip → `SKIPPED_CONFIRMED`; no slip → `SKIPPED_NO_SLIP`.
- **Listed, not written:** `UNRESOLVED` / `NO_FIRST_COACH`.
- **The total:** satang integer math, and the slip total = base + Σ lines still holds (SPEC-100 §4).

## Files (claim, Team B)
- `src/services/bonus-lines.service.ts` + test (new);
- TASK-863's files (read only);
- the one route line in Jason's salary router (after his DONE);
- the step-0 migration + journal entry, only if needed.
- **Pure mirror test edits are pre-approved** (tagged `🔻 TASK-867`, listed).

## Done =
- `bunx tsc --noEmit` 0 · the BB SAFE suite green (count before / after) · a mutation set over the eligibility + idempotency, all biting · if step 0 ran: the queue lines with the host named.
- A report in `inbox/SA-B.md` with one example result object. `git status` = only the claimed files. No git command run.

---
## Report — Brew (Team C), 2026-11-08. TASK-867 built; for Silver's review (via Sector)
**Who and how.** Moved Bob → Brew (board row names me). My only contact is Sector, so this report stays here and Sector forwards it to Silver; I did not write `inbox/SA-B.md`. Host of BB's `.env` = `154.197.124.206` (sid), checked before every DB touch. No git. Dummy URL on every test run; pinned `typescript@5.9.2` for tsc.

**Start conditions (checked, not assumed):** TASK-863 DONE · 0009 on sid · `source_ref` + `bo_pay_slip_line_auto_ref_uq` on sid in Team A's **0011** (read from the real database: `UNIQUE (slip_id, kind, source_ref) WHERE source = 'auto'`). So no step 0, no migration.

**Files (the claim).** New: `src/services/bonus-lines.service.ts` + `bonus-lines.service.test.ts`. Edited in Jason's files, exactly as the TASK allows: `src/routes/salary.ts` (**one import + one route**, each tagged `🔻 TASK-867`, nothing else in it) and, as a pre-approved mirror test edit tagged `🔻 TASK-867`, `src/routes/salary-routes-task865.test.ts` (the route count `15 → 16`, one line). TASK-863's files are read only. No schema, no migration, no `api.ts`, no drizzle config, no other file.

**What it does.** `applyBonusLines(periodId, rules, actor, deps)` → `{ written, unchanged, skipped[], unresolved[], orphaned[], changed[] }`; the route is `POST /salary/periods/:id/apply-bonus` (`requireRole("ceo")`, inside Jason's `/salary` router), which calls `applyBonusLinesFor(service, id, actor)` (real candidates, real profiles, real line store).
- **The lock is Jason's, not a copy:** it calls his `salary.getPeriod(id)`, which applies his lazy 12:00 lock and 404s an unknown period; a `locked` period → **409 `LOCKED`** before anything is read.
- **Candidates:** TASK-863's `listBonusCandidates("<year>-<mm>")`, the PERIOD's year and month, as the TASK says (see Q2).
- **Amounts (integer satang):** Bonus 50 = 5,000 · Bonus 100 = 10,000 × the share fraction (1 or 0.5; `shareSatang` throws rather than round).
- **Eligibility (R1.1), from F3's `roleOfDay(profile, date)`:** FT yes · PT only if that day is Sat–Sun · FL / STAFF / no profile no. The date is the trial's date (Bonus 50) or the old course's first ATTENDED date (Bonus 100). The `TODO(F3)` is now real code: F3 landed (a PT + FL person is PT on Sat–Sun, FL Mon–Fri, and the same call answers them).
- **The line:** `kind 'bonus'`, `source 'auto'`, `label` `Bonus 50 · <nickname or name> (Private|Duo|Voucher)` / `Bonus 100 · …`, `source_ref` `b50:<purchaseId>:<coachId>` / `b100:…`.
- **Never created / never touched:** a coach with no slip → `SKIPPED_NO_SLIP` (no slip is created) · a `confirmed` slip → `SKIPPED_CONFIRMED` · a `locked` slip inside an open period → `SKIPPED_LOCKED` (defensive) · UNRESOLVED / NO_FIRST_COACH → returned in `unresolved`, never written · an ineligible coach's share → `NOT_ELIGIBLE` in `skipped` (listed, not silent).
- **Never deleted, never rewritten:** a line whose candidate is gone → `orphaned` (left in place) · a line whose amount or label would now differ → `changed` (**not applied**).

**One example result** (the shape, from the unit scenarios; ids shortened):
```json
{ "written": 2, "unchanged": 1,
  "skipped": [{ "reason": "NOT_ELIGIBLE", "bonus": "BONUS_50", "purchaseId": "p-w", "coachId": "C…", "date": "2026-10-14", "sourceRef": "b50:p-w:C…" }],
  "unresolved": [{ "bonus": "BONUS_100", "purchaseId": "p-u", "status": "UNRESOLVED", "childId": "kid-1", "prevId": "old-1", "firstCoachId": "A…", "latestCoachId": "B…" }],
  "orphaned": [{ "slipId": "S…", "sourceRef": "b50:p-gone:A…", "label": "Bonus 50 · Aa (Private)", "amountSatang": 5000, "note": "NO_LONGER_A_CANDIDATE" }],
  "changed": [] }
```

**🔴 A finding in Team A's file (and why I wrote my own line store).** On the real database `SalaryStore.insertLine` (`salary-db.store.ts` l.126-131) **does not write `source_ref`**: its `.values()` has no `sourceRef`, while the in-memory store keeps it. An "auto" line inserted through it has a NULL key, which the partial unique index ignores, so the same line can be written again and again and **money doubles silently**. I proved it on sid (rolled back): `insertLine` twice with the same `sourceRef` → `stored source_ref = NULL, 2 rows`. `syncAutoLines` would be correct but it also **deletes** auto lines "no longer derived", which this TASK forbids, and its `AutoLine.kind` type is only `fl_pay | extra_hour`. So the bonus lines go through a small `BonusLineStore` of my own (`dbBonusLineStore`: `INSERT … ON CONFLICT (slip_id, kind, source_ref) WHERE source = 'auto' DO NOTHING`), and a test forbids this file from ever calling `insertLine`. **This is Team A's to fix** (the memory/DB divergence is the dangerous part); I did not touch it.

**Evidence (dummy URL; pinned tsc).**
- **BB suite before `525 pass · 0 fail · 25 files` → after `576 pass · 0 fail · 26 files`** (+51 pass, all in my test file; +1 file). `tsc --noEmit` → exit 0, 0 `error TS`. `git status` for this TASK: the 2 new files + `salary.ts` + the one count line in his route test.
- Write-grep over the service's code (comments stripped) for `.delete(` · `.update(` · `execute(` · `syncAutoLines` · `upsertDraftSlip` · `insertLine(` → no output; a test asserts it, and that the file has exactly one `.insert(`.
- **Mutation set: 31 mutants over the eligibility + idempotency (and the line store), 31 killed**, run in place on my own new file with a `finally` restore and a hash check (restored byte for byte). The first run killed 30; the survivor was a real gap (an auto *bonus* line carrying another feature's `source_ref` must never be called an orphan), now tested.
- **Tests per the TASK:** FT + Bonus 50 → one line 50 ฿ with the right label and source_ref · SHARE → two lines 50 ฿ each on the two slips · PT Saturday paid / Wednesday not (and a PT + FL person, both days) · FL, STAFF, no profile never · re-run → `unchanged`, no duplicate, a lost race counted unchanged · locked period 409 (also the lazy lock) · confirmed → `SKIPPED_CONFIRMED` · no slip → `SKIPPED_NO_SLIP` and no slip created · UNRESOLVED / NO_FIRST_COACH listed not written · orphans listed and left in place · changed listed not applied · **the slip total = base + Σ lines in integer satang through Jason's real `getSlip`** (2,500,000 + 5,000 + 5,000 = 2,510,000; a re-run does not move it) · the route: behind `requireRole`, 401 / 403 / 403, malformed id 404, unknown period 404, locked 409.

**Real Postgres (sid), read-only fixtures in ONE rolled-back transaction** (`bonus-lines-sid-proof.ts` in my scratchpad; host printed first and guard-tested; period 2099-01 and random uuids; **residue after: periods 0, lines 0, profiles 0**), through Jason's real engine on the transaction and my real line store:
- the index exists as expected: `UNIQUE (slip_id, kind, source_ref) WHERE (source = 'auto'::bo.pay_line_source)`;
- run 1: `written 1`; the row is `kind bonus · source auto · source_ref b50:… · 50.00 · "Bonus 50 · CT (Private)"`; run 2: `written 0, unchanged 1`, rows still 1; a **direct duplicate insert → `exists`**, no error, still 1 row (so `ON CONFLICT … WHERE source = 'auto'` really infers the partial index);
- the real slip total: base 2,500,000 + `[bonus · Bonus · auto · 5000]` = **2,505,000**;
- PT coach: trial on 2099-01-10 (Saturday) → written; on 2099-01-14 (Wednesday) → `NOT_ELIGIBLE`;
- a gone candidate and an UNRESOLVED one: `written 0`, `orphaned 2`, `unresolved 1`, the FT line still there (nothing deleted);
- the `insertLine` defect shown (above); after `lockPeriod`: `409 LOCKED`.
- **Not exercised on real data:** candidates from real sales (sid has none yet: F4's facts start after the next SB deploy, as Silver noted), and two truly concurrent runs.

**Declared decisions (mine; Silver can overturn).**
1. `NOT_ELIGIBLE` is listed in `skipped` (the TASK says such a share is "simply not paid"; listing it means nothing disappears silently, and the CEO screen can hide it).
2. `changed` is a sixth key in the result (the TASK's shape has five): same key, different amount/label, reported and NOT applied, in the same spirit as `orphaned`.
3. A `locked` slip inside an open period is `SKIPPED_LOCKED`, not a 409 for the whole call (it cannot normally happen: a period lock locks all its slips).
4. Not one database transaction: the stores have no unit of work; each line is atomic and the unique index makes a re-run finish what a failure left undone.
5. Profiles come from `listProfiles()` once (not one `getProfile` per coach).

## Questions (for Sector → Silver / Porter)
1. **Team A's `insertLine` drops `source_ref`** (finding above). Should Jason fix `makeDbSalaryStore.insertLine` (write `sourceRef`, map `23505`) so the next auto-line feature does not meet it? My code does not depend on it.
2. **The pay period is not a calendar month (R1.4).** October's period is 30/9–30/10 (`payPeriodRange`), but this TASK matches candidates by the **calendar** month of the purchase's Bangkok `created_at` (1/10–31/10). So a purchase on 31/10 lands on October's slip although it is after the period's end, and one on 30/9 lands on September's although it is inside October's range. I followed the TASK as written. Do you want the candidate window to be the period's `periodStart..periodEnd` instead? (A one-line change in `applyBonusLines`, plus 863's `listBonusCandidates` taking a date range.)
3. **`orphaned` and `changed` stay report-only** — confirm; who corrects or removes a bonus line, and when, is for a later Salary rule.
4. **Transaction:** is one all-or-nothing transaction per call wanted? It needs a unit-of-work method on `SalaryStore` (Jason's file); today each line is atomic and the run is safely re-runnable.

**Sector (Brew's SA), 2026-11-08: relayed to Silver via Porter, with my reading of each:**
- **Q1 (Team A's `makeDbSalaryStore.insertLine` drops `source_ref`):** a Team A defect. It goes to Porter for Sober/Jason. Brew's lines don't depend on it, but the next auto-line feature would double-pay in silence, so it should be fixed before TASK-878 lands.
- **Q2 (candidate window = calendar month vs the R1.4 pay period):** my reading is the **pay period**. SPEC-101 §3 says every auto line sums over `[period_start, period_end]`, and a 31/10 purchase on October's slip contradicts R1.4. **Silver decides** (his TASK); it's a one-line change if he agrees.
- **Q3 (orphaned/changed report-only):** fine as a default. Who corrects a bonus line later is a Salary rule.
- **Q4 (one transaction per call):** not needed while each line is atomic and the run re-runnable. A unit-of-work on Jason's store is Team A's call.

## Review — @Silver, 2026-11-08: 🔁 one small REWORK (Q2), everything else ACCEPTED
- **Re-run by me:**
  - BB `bunx --package typescript@5.9.3 tsc --noEmit` = 0;
  - `bun test` (dummy URL) = **576 pass / 0 fail**;
  - the `salary.ts` diff = exactly 1 import + 1 route, tagged.
- **The own `BonusLineStore`** with `ON CONFLICT … WHERE source = 'auto' DO NOTHING`: **right call**. The sid proof (rolled back, residue 0) shows that the index is inferred and that a re-run adds nothing.
- **Declared decisions 1–5:** accepted as written.

**Answers:**
- **Q1:** a Team A defect, already with Sober via Porter. Brew's code doesn't depend on it. Nothing to do here.
- **Q2 → REWORK: use the R1.4 pay period, not the calendar month.**
  - SPEC-101 §3 replaces the demo's calendar month for every auto line, and REQ-120 R1.4 is the customer's rule ("30/9–30/10").
  - DECISIONS row 12(b) ("month of `created_at`") was written before SPEC-101 and is superseded by row 18, which I'm adding now. R0-11 only says *when* a bonus notifies, not which slip it lands on.
  - **The change:**
    - `listBonusCandidates` (TASK-863's file, Brew's own) also accepts a range `{ from: "YYYY-MM-DD", to: "YYYY-MM-DD" }`, inclusive, on the purchase's **Bangkok date**. Keep the month form working for old callers.
    - `applyBonusLines` calls it with the period's `periodStart..periodEnd` (Jason's `payPeriodRange` / the period row).
  - **Tests:** a purchase on 30/9 lands on October's slip; one on 31/10 lands on November's; one on 29/9 on September's. Each must fail if the range is reverted to the calendar month. Add them to both mutation sets.
  - The TASK-863 boundary tests (23:30 on the 31st) move to the period edges.
- **Q3:** confirmed. `orphaned` / `changed` stay report-only; who corrects a bonus line is a later Salary rule.
- **Q4:** no. Per-line atomic + re-runnable is enough. A unit of work on Jason's store is Team A's call, not needed here.

- **Security review:** none. It's a CEO-only route behind Jason's `requireRole`, writes only `kind = 'bonus'` / `source = 'auto'` lines, and never deletes.
- **After the rework:** report in this TASK; I re-run and mark DONE.

---
## Rework report — Brew (Team C), 2026-11-08 — Q2: the R1.4 pay period (DECISIONS row 18). For Silver, via Sector.
**What changed (BB; all inside TASK-863's and TASK-867's own files, nothing else):**
- `src/lib/bonus-rules.ts` (863): new `DateRange {from,to}` and `BonusWindow = "YYYY-MM" | DateRange`, `windowBounds(w)` (half-open instants in Bangkok time: `[00:00 of from, 00:00 after to)`; throws on a bad month, a non-calendar date, or `from > to`) and a private `inWindow` (month form unchanged; range form compares the purchase's **Bangkok date**, both ends inclusive). `bonus50Candidates` / `bonus100Candidates` take a `BonusWindow` (the old month string still works).
- `src/services/bonus-candidates.service.ts` (863): `listBonusCandidates(window, rules, load)` and `loadPurchaseRowsFrom(d, window)` accept either form; a bad month or range is a 400 `VALIDATION` before any read (the range message says "range").
- `src/services/bonus-lines.service.ts` (867): `applyBonusLines` now calls `deps.candidates({ from: period.periodStart, to: period.periodEnd }, rules)`; a period row with no dates is a 400 before any read (same message as Jason's run). The `pad2` month builder is gone.
**Result by example (October's period is 30/9–30/10):** 29/9 → September's slip · 30/9 and 30/10 → October's · 31/10 → November's (test uses the REAL `bonus50Candidates` filter across three periods: `{sept:[p-0829b], oct:[p-0930,p-1030], nov:[p-1031]}`; no purchase paid twice or lost between periods). 863's 23:30-on-the-31st month tests stay (month form kept); the same boundaries are added at the period edges: 30/9 00:00 Bangkok in October, 29/9 23:59 out; 30/10 23:30 in, 31/10 00:00 out; one-day range inclusive both ends; the bound query params for 30/9–30/10 = `[2026-09-29T17:00Z, 2026-10-30T17:00Z)`.
**Evidence (dummy URL; pinned tsc 5.9.2):** BB `598 pass · 0 fail · 26 files` (was 576; +22 across the three test files); `tsc --noEmit` exit 0. **Mutation set: 21 mutants over the window logic, the range filter, the period wiring and the validation, 21 killed** (first run 20: the survivor was the range error message — now pinned); files restored byte for byte (hash check). Reverting `applyBonusLines` to the calendar month is one of the mutants and is killed by three tests. Files touched: `bonus-rules.ts`, `bonus-rules.test.ts`, `bonus-candidates.service.ts`, `bonus-candidates.service.test.ts`, `bonus-lines.service.ts`, `bonus-lines.service.test.ts`. No schema, no migration, no `salary.ts`, no `api.ts`.
**Not re-run on sid:** the earlier 867 sid proof used a single period and fixture candidates; the window logic is pure and covered above. Say if you want the sid proof repeated on a range.

## Review 2 (after the rework) — @Silver, 2026-11-08: ✅ ACCEPTED (DONE)
- **Re-run by me:** BB `bunx --package typescript@5.9.3 tsc --noEmit` = 0; `bun test` (dummy URL) = **598 pass / 0 fail**.
- **The window:**
  - `applyBonusLines` reads `periodStart..periodEnd` from the period (`bonus-lines.service.ts:276–278`).
  - A period with no dates → 400, never a silent calendar month.
  - The candidates come from that range.
- **The edge tests are in** (`bonus-lines.service.test.ts:279–307`): October = 30/9–30/10; 29/9 → September; 30/9 → October; 31/10 → November.
- **DECISIONS row 18 is carried.** TASK-867 is DONE.
