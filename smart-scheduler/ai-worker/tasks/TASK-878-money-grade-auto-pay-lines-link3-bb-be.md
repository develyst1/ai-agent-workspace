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
