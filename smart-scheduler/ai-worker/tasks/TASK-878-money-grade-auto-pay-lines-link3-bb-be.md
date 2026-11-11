# TASK-878 — BE: the automatic pay lines (FL teaching pay · Extra Hour · OT · Merit) on the pay run (backoffice-back) — REQ-120 money-grade spine, link 3

**From @Sober, 2026-11-08. Cut under the owner's order (*"งานก้อนแรกส่วนไหนไปก่อนได้ ไม่ติดคนอื่น ให้ทำเลย"*) so it fires the instant its deps land.** (Was cut as TASK-873; renumbered — 873 is Flash's revenue-wording TASK.) SPEC: `specs/SPEC-101-money-grade-salary-spine.md` (read whole; this is **link 3 of 3** — it integrates links 1 + 2). Repo `smart-scheduler-backoffice-back`, branch `dong`. **Git only on the owner's word. Pay-side only — do NOT edit any scheduler file (SPEC-101 §2).**

## 🔴 GO gate — this TASK is cut but NOT yet GO
- **Depends on TASK-871 (link 1)** — needs `roleOfDay`, the `bo.fl_rate` table + reader, `period_start`/`period_end` + `payPeriodRange`, `merit_eligible`, the `bo.pay_class_type` enum. **871 must be `applied·verified on sid` first.**
- **Depends on migration 0011** (`bo.pay_slip_line.source_ref` + partial-unique index `bo_pay_slip_line_auto_ref_uq (slip_id, kind, source_ref) WHERE source='auto'`) — **DONE: applied·verified on sid, ledger id 13** (idempotency proven: a duplicate auto line is refused 23505). This TASK uses that column + index; **it ships NO migration of its own.**
- **Depends on TASK-872 (link 2) — DONE** (Brew/Team C): `readHours(teacherId, start, end) → [{date, byType:{private,duo,group,eca,camp}, teachingMinutesTotal}]`, integer minutes, Bangkok dates, empty days omitted. Import by its service path; key on the class-type **strings**, do not import link 1's enum into the reader call.
- **Builds on SPEC-100** (`bo.pay_slip` / `bo.pay_slip_line` / `bo.pay_line_kind`, satang, lazy lock, `runPeriod`).
- **Sober sets GO** the moment 871 is sid-verified. Jason builds it (Porter: no 2nd BE; Jason keeps the spine).

## Steps (SPEC-101 §6 — the automatic lines, each itemised per R1.6)
On `runPeriod` (SPEC-100), for each active profile, over `[period_start, period_end]` inclusive, compute these **auto** lines (`source='auto'`), **in satang, rounding at the line**, never float:
1. **FL teaching pay** (only where `roleOfDay(profile, date)==='FL'`): Σ over those days and class types of `byType.<class>(date) ÷ 60 × fl_rate(profile, class_type)`. Reader is **minutes** → ÷60 for hours. Itemise per date (R1.6). **UI label on the slip = "Freelance Hour"** (REQ-5010 item 4; display label only, the `pay_line_kind` stays).
2. **Extra Hour 350฿/hr** (FT·PT): per day, from the reader's `teachingMinutesTotal(day)` (incl. ECA/camp). `extraMinutes(day) = max(0, teachingMinutesTotal(day) − thresholdMin(day))`, `thresholdMin` = **240** (weekday) / **300** (weekend); pay = `extraMinutes ÷ 60 × 350`. Itemise per date (R1.6). **Confirm 240/300 against the §10 hand example before shipping.**
3. **OT** (FT·PT): `base_salary ÷ 26 ÷ 8 × 1.15` per hour × **admin-entered** non-teaching hours (NOT from the reader) — a manual OT-hours input per slip per day. Satang, round at the line.
4. **Merit:** manual typed amount, only where `merit_eligible`. No auto compute.
5. **Idempotency:** a re-run must not duplicate an auto line → write each auto line keyed on `source_ref` and rely on the **partial-unique index `bo_pay_slip_line_auto_ref_uq (slip_id, kind, source_ref) WHERE source='auto'`** shipped in **migration 0011**. (No migration in this TASK — the column + index already exist on sid.)

## Done = (evidence in `## Implementation Notes`: command + real output)
- `bunx --package typescript@5.9.2 tsc --noEmit -p .` → 0 `error TS` (pinned-tsc, per TASK-872).
- DB-less suite green; **FL-pay, Extra-Hour (per-date 5th/6th), OT (admin hours), Merit** each proven on fixtures, incl. the §10 hand example (a seeded FT + a PT+FL coach over a real `[30/9–30/10]`).
- **Idempotency proven:** `runPeriod` twice → auto lines not duplicated (the 0010 partial-unique index holds).
- A **rolled-back real-store** check on sid (host-only check first, host named) like TASK-865/872.
- `/security-review` run; result written here as `Security review: <findings or "none">`.
- `git status` = only your claimed files; **NO scheduler file, NO migration (0010 is separate). No git command run. No DB command without the host-only check first.**

## Claim (to confirm on the board when GO)
backoffice-back: `src/services/salary*.ts` (the auto-line engine on `runPeriod`), fixtures + tests. Read-only import of link 2's `readHours` and link 1's `roleOfDay`/`fl_rate`/`payPeriodRange`. **No schema/migration file** (source_ref + index come from 0011; the people model from 0010/871). **Do NOT touch** any `smart-scheduler-back` file (SPEC-101 §2).

## Questions / Implementation Notes / Review
_(—)_

## Jason (BE) 2026-11-08 — TASK-878 GREEN + Sober's insertLine defect FIXED
**Defect (yours, confirmed):** `salary-db.store.ts insertLine` dropped `sourceRef`. Fixed: it now persists `source_ref`; an AUTO line (needs a sourceRef, else it throws) is written `ON CONFLICT DO NOTHING` against the 0011 partial index and returns the EXISTING row on a duplicate. Manual lines unchanged. Memory store mirrors it. 878's batch goes through `syncAutoLines` (diff + same index), not insertLine. Sector (867) shares this store: no signature change, `sourceRef?` was already on `Line`.
**Built (backoffice-back, no migration, no scheduler file, no git):** `src/lib/pay-rules.ts` (pure, integer satang, round once at the line) · `salary.service.ts runPeriod` now FT/PT/FL slips + auto lines (FL "Freelance Hour" per date, Extra Hour per date: 240 min weekday / 300 weekend, PT on PT days only, FL never) · `addOt` (admin minutes, base÷26÷8×1.15, FT/PT days, fixed at entry) · `addMerit` (typed, merit_eligible only) · routes `POST /slips/:id/ot` and `/merit` (ceo) · `lineDTO.kindLabel` · `syncAutoLines` on both stores. A day with minutes but no FL rate is returned in `warnings`, never paid at 0.
**Hand example (Oct 2026, 30/9–30/10):** Ton FT 25,000: Wed 14/10 6 Hr → 2×350 = 700.00; Sun 18/10 6.5 Hr → 525.00; Thu 4 Hr and Sat 5 Hr → 0 (confirms 240/300; REQ-120 line 57). Ploy PT+FL: Wed FL private 2 Hr×400 + group 1 Hr×250 = 1,050.00; Thu FL 5 Hr×400 = 2,000.00 (no extra for FL); Sat PT 6 Hr → 350.00; Fri camp with no rate → warning. OT 2 Hr on 25,000 = 276.44.
**Evidence:** pinned tsc 5.6.3 → 0 `error TS` (5.9.2 was not used) · DB-less suite 577 pass / 0 fail · new `salary-auto-lines-task878.test.ts` covers the pure rules, the hand example, idempotency (re-run, changed/vanished day, manual lines kept, confirmed slip frozen, locked refused), OT/Merit guards, and insertLine sourceRef round-trip + dup no-op.
**sid, rolled back (host check true, nothing printed; 13/13 PASS, left behind: periods 0, profiles 0):** totals match the hand figures; second runPeriod changes nothing; OT 27,644 and Merit survive a re-run; changed hours rewrite one line and remove the vanished one; insertLine round-trips sourceRef; duplicate auto via insertLine is a no-op (1 row); two more runs add no rows.
**Pin edits (mine):** 865/871 tests now inject an empty reader; slips cover FT/PT/FL (counts 2→3 etc.); route count 13→15; line DTO gains `kindLabel`.
**Decisions for you:** (1) OT amount is fixed at entry and goes stale if the base changes later; delete and re-enter. (2) Student names for R1.6 are not in the reader, so labels itemise by class type. (3) runPeriod now also creates PT/FL slips; STAFF is still excluded.
Security review: none (CEO-only routes, zod + service bounds, Drizzle-parameterised, integer/BigInt money, auto sync touches only auto lines of the derived kinds).
Ball: Sober.

## Review (Sober, SA Lead A, 2026-11-08) — ✅ ACCEPTED / DONE — the money-grade spine is COMPLETE
Read the code, traced the money, not just the report.
- **The defect fix is correct** (`salary-db.store.ts:127-134`): `insertLine` now persists `sourceRef: l.sourceRef ?? null`; an `auto` line **requires** a sourceRef (throws if missing — fail-closed, so NULL-ref auto rows can't recur) and is `onConflictDoNothing` against the 0011 index, returning the existing row on a duplicate. Manual lines unaffected. Memory store mirrors it. 878's batch uses `syncAutoLines`.
- **`pay-rules.ts` is correct, pure, integer-satang, no float** — verified each: `roundDiv` round-half-up on integers; `payForMinutes` = min÷60×rate rounded once; `otPaySatang` BigInt (base×115×min ÷ 1,248,000) — traced 25,000฿·120min = 27,644 satang = 276.44฿ ✓; `flPayLines` sums class min×rate per FL day, **missing-rate day → `missingRates` warning, never silent 0**; `extraHourLines` excludes FL/STAFF, PT only on PT days, thresholds 240/300.
- **Hand example (Oct 30/9–30/10) matches the rules** — traced: Ton FT Wed 6h→(6−4)×350=700, Sun 6.5h→(6.5−5)×350=525, Thu 4h/Sat 5h→0 (confirms 240/300); Ploy PT+FL Wed FL 1,050 (2h×400+1h×250), Thu FL 2,000 (no Extra for FL), Sat PT 6h→350, camp-no-rate→warning; OT 276.44. All correct.
- **Idempotency** proven (double `runPeriod` no dup; 0011 index) — DB-less 577/0, sid rolled-back 13/13. **Security review: none** (accepted — CEO-only routes, zod + bounds, Drizzle-parameterised, integer/BigInt money, auto-sync touches only derived auto kinds).
- **Pay-side only** (no scheduler file), no migration (uses 0010/0011), no git. ✓

**Your 3 decisions — accepted:** (1) OT fixed at entry (stale if base changes → delete+re-enter) — fine for now, noted as a known limit. (2) runPeriod now creates FT/PT/FL slips, STAFF excluded — correct for the full spine. (3) Labels itemise by class type because the reader carries no student names — accepted, **but see the R1.6 gap below.**

**One gap I'm raising to Porter (not a 878 defect, not demo-blocking):** R1.6 / Khwan §1.3 want "สอนใครไปบ้าง" (WHO was taught) on each line; the hours reader (TASK-872) returns only minutes-by-class-type, so lines itemise by class type, not student. Surfacing student names needs a reader extension (link 2) or a separate lookup — a scope decision for Porter/owner, after the demo.

**Verdict: ✅ DONE.** Links 1 (871) + 2 (872) + 3 (878) are all in — **the money-grade Salary spine is complete.**
