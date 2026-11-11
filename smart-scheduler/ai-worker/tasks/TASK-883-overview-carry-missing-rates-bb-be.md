# TASK-883 — BE: the period overview carries `missingRates` (so FL-rate warnings are always-true, not "as of last Run") (backoffice-back) — @Jason

**From @Sober, 2026-11-08. GO (owner "ไม่ติดคนอื่น ให้ทำเลย"; follow-up from TASK-881 Fern Q1).** Repo `smart-scheduler-backoffice-back`, branch `dong`. **Team A — your own `salary.service.ts`.** Pay-side only; no migration; no scheduler file; git only on the owner's word.

## Why
TASK-878's `runPeriod` returns `warnings` (a coach-day with teaching minutes but no FL rate → never paid 0, surfaced). But the FE only has them in the **run response**, so it caches them in `sessionStorage` ("as of the last Run") — a warning raised elsewhere is invisible until someone presses Run (Fern, TASK-881 Q1). Make them **always-true** by computing them read-only on the overview read.

## What to build
1. **On `GET /salary/periods/:id` (the overview), add `missingRates`** — the same list `runPeriod` produces, computed **read-only** over `[period_start, period_end]` for each active profile (reuse `flPayLines`'s `missingRates` from `pay-rules.ts`; call the reader + rates per profile, collect the `{teacherId, date, classType, problem:"no_fl_rate"}` entries). **No write, no slip change** — this is a pure read alongside the existing overview.
2. **Shape (matches TASK-878 / Fern's Q2, confirmed):** `missingRates: Array<{ teacherId: string; date: string; classType: "private"|"duo"|"group"|"eca"|"camp"; problem: "no_fl_rate" }>` — no names (the FE maps `teacherId` → the overview's `teacherName`). Empty array when none.
3. Cost note: this re-runs the reader per profile on an overview read. For the demo's data that's fine; if it's heavy, document it (a later cache is out of scope here).

## Done = (evidence in `## Implementation Notes`)
- `bunx --package typescript@5.9.3 tsc --noEmit` 0 · DB-less suite green.
- A test: a period with a coach-day that has minutes but no FL rate → the overview's `missingRates` carries that entry; after the rate is set, the overview's `missingRates` no longer carries it (no Run needed). Empty array when all rates exist.
- A rolled-back real-store check on sid (host-only check first, host named) OR a DB-less proof if the reader is injected — your call, documented.
- `git status` = only your files; no migration; no scheduler file; no git command.

## Claim
backoffice-back: `src/services/salary.service.ts` (the overview read + `missingRates`), tests. Reuse `pay-rules.ts` `flPayLines`/`missingRates` + the reader. **Do NOT** touch `smart-scheduler-back`. **I (Sober) review** — Team A.

## Questions / Implementation Notes / Review
_(—)_

## Jason (BE) 2026-11-08 — TASK-883 GREEN (the period overview carries `missingRates`)
**Built (salary.service.ts only; no migration, no scheduler file, no git):** `GET /salary/periods/:id` now returns `{period, slips, missingRates}`. `missingRates` = `[{teacherId, date, classType, problem:"no_fl_rate"}]` (empty array when none), computed READ-ONLY over `[period_start, period_end]` for every active FT/PT/FL profile with the same `flPayLines(...).missingRates` that `runPeriod` uses, so the two cannot disagree. No write, no slip, no line. `getPeriod(id, {missingRates:false})` is used by the CSV export so it does not pay the reader cost. I also tightened `runPeriod`'s `warnings.classType` to the `ClassType` union (same values).
**Cost:** one reader call plus one rates read per active FT/PT/FL profile on each overview read. Fine for the demo; a cache is out of scope.
**Evidence:** pinned tsc 5.9.3 → 0 `error TS` · DB-less suite 742 pass / 0 fail. New tests: a coach-day with camp minutes and no camp rate appears in the overview with NO Run, and nothing is written (0 slips, 0 lines); after `setFlRate` it is gone; the overview list equals `runPeriod`'s `warnings`; it follows a timetable change without a Run; an inactive person is not checked; empty when all rates exist. **Real-store check:** I chose the DB-less proof (the reader is injected, and the real store's `listProfiles` / `listFlRates` / `getPeriod` were already proven on sid for 878 and 880), so no new sid run.
**Bob's 879 files:** I do not have his listing (Porter has it), so I have not compared; my 879 copy stands as delivered. Send me the listing if you want a diff.
Ball: Sober (review).

## Review (Sober, SA Lead A, 2026-11-08) — ✅ DONE
Read the code (`salary.service.ts:252-268`): `getPeriod` computes `missingRates` **read-only** — it reuses the **same `flPayLines(...).missingRates`** that `runPeriod` uses (so the overview and a Run can't disagree), there is **no insert/update/slip/line** in the path (the inserts in the service are OT/merit/other/entry, other methods), and the CSV export passes `{missingRates:false}` to skip the reader cost. Shape `{teacherId,date,classType,problem:"no_fl_rate"}` matches Fern's Q2. Evidence accepted: 742/0; a camp-no-rate day shows in the overview with NO Run and nothing is written; clears after `setFlRate`; overview == runPeriod warnings; follows a timetable change without a Run; inactive excluded; empty when all rates exist. DB-less proof is fine here (the real store's reads were proven on sid for 878/880). **Verdict: ✅ DONE** — Fern can drop the sessionStorage and read `missingRates` from the overview.
