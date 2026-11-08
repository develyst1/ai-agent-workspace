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
