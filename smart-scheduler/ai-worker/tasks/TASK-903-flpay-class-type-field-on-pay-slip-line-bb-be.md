# TASK-903 — BE: `class_type` on `fl_pay` pay-slip lines, split per class type (backoffice-back) — @Jason

**From @Sober, 2026-11-09. In scope before the demo (Porter, PM call): the agreed final UI splits "Freelance Teaching Pay" by class type (Private / Duo / Group / ECA / Camp), but today an `fl_pay` line is ONE per date with the classes only in the label text — so the slip/export can't split.** SPEC: `SPEC-101 §6` (I'm updating the fl_pay rule to per-(date×class)). Repo `smart-scheduler-backoffice-back`, branch `dong`. **Pay-side only — no scheduler file. Git only on the owner's word.**

## The change (fl_pay becomes one line per date × class type)
1. **Migration (additive, via MIGRATION-QUEUE, host-check first F-038):** add `class_type bo.pay_class_type NULL` to `bo.pay_slip_line`. Only `fl_pay` lines set it; every other kind stays NULL. Existing rows stay NULL (no back-fill; the demo re-runs the period).
2. **`pay-rules.ts` `flPayLines`:** emit **one `AutoLine` per (FL date, class type that has minutes + a rate)** instead of one summed line per date. Each line: `kind:"fl_pay"`, **`classType:<class>`**, `sourceRef:\`fl:${date}:${classType}\`` (so the 0011 index dedupes per class), `label` = that one class's detail (`"14/10 (Wed): private 2 Hr × 400"`), `amountSatang` = that class's `minutes ÷ 60 × rate` rounded at the line. `missingRates` unchanged. (A date with two classes → two lines; the §10 hand example changes: Ploy Wed = `private 800.00` + `group 250.00` instead of one `1,050.00` line — update it.)
3. **The slip/line DTO** (`salary.service.ts` `lineDTO`) gains `classType` (null for non-fl_pay). It rides overview + single slip + `my-slip`.
4. **Idempotency/sync:** `syncAutoLines` already keys on `(kind, sourceRef)`; the new per-class sourceRef makes each class line idempotent. Prove a double `runPeriod` doesn't duplicate.

## Out of this TASK (follow-ons, note them)
- The **XLSX/PDF export** (TASK-879) grouping fl_pay into "Freelance Teaching Pay · <Class>" sub-sections — a small 879 follow-up (it can read the new `classType`); I'll cut it to whoever holds 879.
- The **FE** rendering the split on the slip screens — Fern/Fanta, a follow-on once the DTO carries `classType`.

## Done = (evidence in `## Implementation Notes`: command + real output)
- `bunx --package typescript@5.9.3 tsc --noEmit` 0 · DB-less suite green · **the §10 hand example re-worked with the per-class split** (Ploy's FL lines now per class, totals unchanged: 800+250 = the old 1,050).
- One **additive** migration **applied·verified on sid**, host named (F-038), through MIGRATION-QUEUE.
- **Double `runPeriod` = no duplicate** fl_pay lines (the per-class sourceRef + 0011 index).
- A rolled-back real-store check on sid (host-only check first) like 878.
- `/security-review` line. `git status` = only your files; no scheduler file; no git command.

## Claim
backoffice-back: `src/lib/pay-rules.ts` (`AutoLine` gains `classType`; `flPayLines` per-class), `src/db/schema.ts` (+ the `class_type` column) + `drizzle/` (next queue slot), `src/services/salary.service.ts` (`lineDTO` + `classType`), tests + the §10 fixture. **Do NOT** touch `smart-scheduler-back`. **I (Sober) review** — Team A.

## Questions / Implementation Notes / Review
_(—)_

## Jason (BE) 2026-11-09 — TASK-903 GREEN (fl_pay split per class type)
**Built (backoffice-back; no scheduler file, no git):**
- **Migration `0014_bo_pay_slip_line_class_type`** (hand-authored, journal idx 14, witness = the column): `bo.pay_slip_line.class_type bo.pay_class_type NULL`, additive, idempotent. Only `fl_pay` lines set it. Schema column `classType` added.
- **`pay-rules.ts` `flPayLines`:** one `AutoLine` per (FL date × class type with minutes AND a rate): `classType`, `sourceRef: fl:<date>:<class>`, label `"14/10 (Wed): private 2 Hr × 400"`, amount = that class's minutes ÷ 60 × rate rounded once at its own line. `missingRates` unchanged. `AutoLine` gains optional `classType`.
- **Stores:** both persist/return `classType` (sync inserts it; the 0011 index + per-class sourceRef make each class line idempotent). **`lineDTO` and `my-slip` lines gain `classType`** (null for every other kind), so it rides the overview-less slip read, `GET /slips/:id` and `GET /salary/my-slip`.
**§10 hand example re-worked (totals unchanged):** Ploy Wed 14/10 FL = **private 800.00 + group 250.00** (was one 1,050.00); Thu 15/10 private 2,000.00; Sat PT extra 350.00 → Ploy +3,400.00 as before. Ton unchanged.
**Evidence:** pinned tsc 5.9.3 → 0 `error TS` · backoffice-back suite 993 pass / 0 fail (+3 tests: a two-class day is two lines each with its classType/sourceRef/amount and they sum to the old 105,000; a double `runPeriod` adds nothing and the slip DTO carries `classType`; a vanished class drops only its own line while a new class adds one; plus my pinned DTO key sets updated: line keys now include `classType`, my-slip line shape too).
**Migration (F-038):** host check `DATABASE_URL host == 154.197.124.206 (sid)` → true before the apply; `applying` + `applied · verified` lines in MIGRATION-QUEUE naming the host; `drizzle-kit migrate` exit 0; `db:verify` Journal 15 · ledger 16 rows · Schema witnesses 13 applied · "every migration is recorded in the ledger AND witnessed in the schema"; ledger id 16, created_at 1794200000000.
**sid, rolled back (host check true; 8/8 PASS, left behind: periods 0, profiles 0):** the new column is `pay_class_type NULL`; a two-class day + a one-class day give 3 `fl_pay` lines with the right `classType` and amounts (800 + 250 + 2,000 = 3,050.00); raw rows carry `class_type` and `sourceRef = fl:<date>:<class>`; a second `runPeriod` changes nothing and the slip still has 3 lines; a duplicate per-class auto line through `insertLine` is a no-op returning the existing row; a non-fl_pay line has `classType` null.
**Follow-ons, as you noted (not done here):** the 879 export grouping fl_pay into "Freelance Teaching Pay · <Class>" sub-sections (it can read `classType`), and the FE render. **Existing rows** on sid keep `class_type` NULL and their old `fl:<date>` sourceRef; the next `runPeriod` of an open period removes those and writes the per-class ones (locked / confirmed slips are frozen and keep the old lines).
**Security review:** none. One additive nullable enum-typed column, no new route, no new input (the class type comes from the timetable reader's fixed five), no new data exposure beyond a label the slip already showed.
Ball: Sober (review).

## Review (Sober, SA Lead A, 2026-11-09) — ✅ DONE
Code-read: `pay-rules.ts:80` emits one `fl_pay` AutoLine **per class** (inside the `for (const c of CLASS_ORDER)` loop) with `classType: c`, `sourceRef: fl:${date}:${c}`, and that class's own rounded amount; `AutoLine.classType?` added; `lineDTO`/`my-slip` carry `classType` (null otherwise). Migration `0014` is additive (`ADD COLUMN IF NOT EXISTS class_type bo.pay_class_type`, nullable, existing 0010 enum, no back-fill, reverse documented) — applied·verified on sid (ledger 16, host named). §10 hand example re-worked with totals preserved (Ploy Wed 800 + 250 = the old 1,050). Evidence: 993/0, sid rolled-back 8/8 (per-class rows, double-run no-dup, non-fl_pay null), /security-review none. **Per-class rounding** (each line rounded on its own numerator) is correct for a split display and the totals hold. **Verdict: ✅ DONE.**
**Follow-ons I own (will cut):** the 879 export grouping fl_pay into "Freelance Teaching Pay · <Class>" sub-sections (reads `classType`), and the FE render of the split (Fern/Fanta) — both when their owners free up; not demo-blocking.
