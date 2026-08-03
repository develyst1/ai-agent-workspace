# TASK-095: scheduling (BE) — slot-availability + course preview + per-session override
- Source: SPEC-028 §8 (REQ-030, purchase-time modal — go-live scope)
- Status: BLOCKED (on TASK-093)
- Depends on: TASK-093
- Assignee: @Jason (smart-scheduler-back)

## What to build
Backend for the purchase-time planning modal (student → course/size → slot picker with availability+clash → plan
→ atomic confirm).

1. **`GET /slots/availability?date&startTime`** — for a slot, return the teachers who **work that day**, are **not
   archived**, have **freelance budget set**, and are **not already booked** at that slot; and for a taken slot,
   **whose** booking holds it. **Reuse the exact predicates `insertBooking` enforces** (`teacherWorksOnDay`,
   archived, freelance-set) + the unique-slot rule — one definition, read-only for preview, enforced for real at
   confirm. No second copy of the availability logic.
2. **`POST /courses/preview`** — returns the generated `size`-row plan (date·time·teacher·subject) **without
   writing** (AC: editable rows before creation).
3. **`POST /courses` gains optional `sessions[]`** — per-session teacher/subject/date overrides — committed in the
   existing clash-aborts-all transaction. Absent ⇒ today's uniform chain (back-compat preserved).

## Definition of Done
- [ ] `GET /slots/availability` returns free-teachers + clash-owner for a slot, using the same predicates as
      `insertBooking` (no divergent availability logic).
- [ ] `POST /courses/preview` writes nothing and returns the editable plan.
- [ ] `POST /courses` with `sessions[]` commits per-session overrides atomically; without it, behaviour unchanged.
- [ ] `bunx tsc --noEmit` clean; `bun test` green.
