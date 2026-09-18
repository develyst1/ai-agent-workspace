# TASK-396 — End-of-day auto-attend gates on START time, not end time (owner's ruling 2026-09-18 — a conscious override of REQ-070's "not before the class ends")

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-18) · **Size XS + pins.** Deploys to `uat` (and `sid`) — with the held cutover, or alone if the owner wants it sooner (no migration).

## §0 The ruling (Porter, from the owner)
The team LEAVES at 17:30 and wants every class cut before they go; the trigger cannot move to 18:30. So today's run attends a CONFIRMED class that has **STARTED** (`start_time <= now`) — a 17:00–18:00 class is attended at the 17:30 run. Staff are on-site and review before leaving; that is why attending before the end is acceptable. Record the ruling with its reason in the header (REQ-070 §"not before it ends" is overridden here, on purpose).

## §1 What I found before the flip (so you do not have to)
The end-time gate lives in exactly TWO places, and nothing else reads it:
1. `services/jobs.service.ts:41–46` — the SQL predicate `${bookings.endTime} <= ${now.time}::time` on the `runDate === now.date` branch. **This is the one that acts.** Past date ⇒ `true` (unchanged); future ⇒ `false` (unchanged).
2. `lib/auto-cut.ts` — `minutesUntilClassEnd` + `isDueForAutoAttend` — the PURE mirror of that predicate. **No production caller** (grep: only `day-end-auto-attend.test.ts:10` and `auto-cut.test.ts`). It exists so the rule can be value-tested; it must flip WITH the SQL or the test would pin a rule the job no longer runs.
No FE mirror (zero hits for auto-attend/end-of-day in the front). `daily-reminder`, `bulk-confirm` (REQ-094, `lib/bulk-confirm.ts`) and `job_runs` counters do not read the end time. ⚠️ `SYSTEM-FACTS.md:464–492` pins the OLD coupling ("a booking whose end time is after the trigger is never swept") — mine to reconcile, not yours.

## §2 Do
- `jobs.service.ts`: today's branch ⇒ `${bookings.startTime} <= ${now.time}::time`. Header comment: "whose START time has passed" + the ruling and reason (§0), dated, citing REQ-070 as overridden.
- `lib/auto-cut.ts`: `minutesUntilClassEnd` → `minutesUntilClassStart(bookingDate, startTime, now)`; `AutoCutBooking.endTime` → `startTime`; `isDueForAutoAttend` ⇒ `<= 0` on the START. Header updated the same way. Rename the two tests in `auto-cut.test.ts` and `day-end-auto-attend.test.ts:52–55` to start-time inputs — **the 17:00–18:00 class at a 17:30 clock ⇒ `true`** is the value pin that carries the ruling; a 17:45 class at 17:30 ⇒ `false`.
- A source pin on `jobs.service.ts`: the today-branch contains `startTime` and NOT `endTime` (the mutation that puts `endTime` back must fail).
- 🚫 No change to the past-date branch, to what is written (`ATTENDED`, quota +1, the deduction message), or to the trigger time (it is the owner's, on the server).

## Definition of Done
- [ ] Suite, **count** · tsc 0 · `db:verify` unchanged (41) · the two mirrors agree · 🔑 Break-and-watch (`endTime` back in the SQL · the mirror left on end · the past-date branch gated), `finally`, CHECKSUM · report in this file + `inbox/SA.md` + today's log.

---

# 📤 REPORT — @Jason → @Sober (2026-09-18)

✅ **DONE (code), against §2.** **2443 pass / 0 fail**, **192 files** · `tsc --noEmit` clean · 🚫 **no migration (41 = 41)** — `db:verify` unchanged.

## The flip — both mirrors, nothing else
- **`services/jobs.service.ts`** — today's branch: `sql\`${bookings.startTime} <= ${now.time}::time\`` (was `endTime`). The past-date branch (`true`), the future branch (`false`), the select, what is written (`ATTENDED`, the quota, the deduction message) and the trigger are byte-identical. **The header records the ruling with its reason**, dated 2026-09-18 via @Porter: the team leaves at 17:30, the trigger cannot move, so the 17:30 run attends a class that has STARTED — a CONSCIOUS OVERRIDE of REQ-070's "never before it ends", acceptable to the owner because staff are on-site and review before leaving; the old rule's behaviour (a 17:00 class skipped and cut next morning) named as what the owner called a bug.
- **`lib/auto-cut.ts`** — `minutesUntilClassEnd` → **`minutesUntilClassStart(bookingDate, startTime, now)`**, `AutoCutBooking.endTime` → `startTime`, `isDueForAutoAttend` ⇒ `<= 0` on the START; the header says it is the pure MIRROR of the SQL and must flip with it. No production caller (verified: only the two tests import it).
- No other reader of the gate (your §1 read held: `daily-reminder`, `bulk-confirm`, `job_runs` untouched).

## Pinned
- **`auto-cut.test.ts`** (8, re-pointed to start-time inputs) — **🔴 THE RULING as a value: a 17:00–18:00 class at a 17:30 clock ⇒ `true`; a 17:45 class ⇒ `false`**; started-today due, upcoming not, the inclusive edge (start == now ⇒ due), non-CONFIRMED never, past date regardless, future never; `minutesUntilClassStart` by value.
- **`day-end-auto-attend.test.ts`** — the "which sessions" pin re-pointed (17:00 at 17:30 ⇒ due; 17:45 ⇒ not; SICK_LEAVE never) + **a new source pin: the SQL today-branch contains `startTime` and NOT `endTime`; the past-date branch is still `true`, the future `false`; the mirror reads `minutesUntilClassStart(b.date, b.startTime, now) <= 0` and contains no `endTime`/`ClassEnd`** — the two mirrors agree by source.

## 🔑 Mutation — five, `finally`, checksum — all bite
A `endTime` back in the SQL (1) · B the mirror left on END (start + 60) (5) · C the past-date branch gated too (1) · D the mirror's inclusive edge lost (2) · E the future branch opened (1). Every restore byte-identical.

📌 Nothing for @Fern (no FE mirror). ⚠ **For Tanya on `uat`/`sid`:** at the 17:30 run a CONFIRMED 17:00 class is now ATTENDED (quota deducted, the deduction message sent); a 17:45 class is not — cut next morning as before. **SYSTEM-FACTS §17:30 blocks** ("a booking whose end time is after the trigger is never swept") are now stale — yours to reconcile, per §1.
