# SPEC-029 — Business rules as editable settings (mechanism + first two rules)

- Source: REQ-031 (owner: *"3 วัน ขอให้เป็น config database แบบแก้ง่ายๆ"*)
- Depends on / pairs with: SPEC-028 / TASK-094 (the teacher-change notice rule consumes this).
- Status: DESIGN — for @Porter to confirm the first-cut scope with the owner (Q1); the rest is SA-decided.
- Go-live: **2026-08-20** for the mechanism + the two rules below (the teacher-change rule is on REQ-030's path).

Grounded in a code read (2026-08-03). Refs are `smart-scheduler-back` unless noted.

---

## 1. The one principle that decides the design

> **"In the database" is not "easy to change".** A value in `app_settings` with **no screen** is a constant with
> extra steps — and editing it would mean running SQL against production, which the brownfield rule forbids and the
> owner must never do.

So this REQ is **half mechanism, half screen — and the screen is the load-bearing half.** If only one shipped, it
would be the screen for the rules that ship, not a mechanism for rules that don't.

## 2. Shape — defaults in code, overrides in `app_settings`, pure functions stay pure

Three layers, each already precedented in the codebase:

1. **Defaults live in code** (unchanged). The rule constants stay in `lib/` (`CHECKIN_EARLY_MINUTES`, the
   teacher-change default, …). The DB holds **overrides**, never the only copy of the truth (AC #4, constraint).
2. **A small explicit registry** — `lib/settings.ts` (pure): a hand-listed `Record` of the *configurable* rules,
   each `{ key, default, parse(raw) → value | null, unit, label, bounds }`. **Not a config framework** — a named
   list (2 entries at go-live). `parse` validates + coerces + bounds-checks; returns `null` on malformed.
3. **A resolver** `resolveSetting(key, rawFromDb) → { value, isDefault, reason? }` (pure): returns the parsed
   override, or the **coded default with `isDefault: true` + a reason** when the row is missing/malformed
   (AC #4 — *fall back and say so*, never zero/null/"no rule"). The DB read is a thin edge service `getSetting(key)`
   that fetches the `app_settings` row (`key text PK, value jsonb` — `schema.ts:399`) and calls the pure resolver.
   **The `lib/line-admin.ts` read/`onConflictDoUpdate` pattern is the exact precedent** — mirror it.

**Pure functions stay pure** — they take the resolved value as an argument; the *service edge* resolves and passes:
- `hasEnoughTeacherChangeNotice(date, startTime, now, noticeDays)` — TASK-094 already takes the threshold (default 3).
- `isWithinCheckinWindow(bookingDate, startTime, endTime, now, earlyMinutes = CHECKIN_EARLY_MINUTES)` — **small
  refactor**: promote the module constant `CHECKIN_EARLY_MINUTES` (`lib/checkin.ts:7`) to a parameter; the check-in
  service resolves the setting and passes it. Nothing in `lib/` learns about the DB (constraint).

## 3. API + screen

- **`GET /api/settings`** (scheduling-back :4006) — the configurable rules with `{ key, label, unit, value,
  default, isOverridden }`. **`PUT /api/settings/:key`** — validate via the registry's `parse`; **reject malformed
  with the reason** (never write junk); on success upsert the jsonb (`onConflictDoUpdate`, like `line-admin`).
- **A Settings page** (scheduler-front :3016 — the staff app that owns these scheduling rules): one row per rule —
  label · current value · default · **reset-to-default** · edit-with-validation (shows the unit; days vs minutes).
  **No SQL, no deploy** (AC — the whole point). This is the load-bearing half.

Enforcement is unchanged — this REQ changes *where a number comes from*, not *who enforces it* (constraint).
Values are read **at action time**, so changing a rule never retroactively invalidates a booked thing (AC #5).

## 4. First cut — mechanism + exactly two rules (Q1)

Per REQ-031 Q1 + Porter's lean, and my call as SA: **ship the mechanism + the two rules the school will actually
touch**, not all eight (the named scope trap):

| Rule | Setting key | Default | Why it's in the first cut |
|---|---|---|---|
| **Teacher-change notice** | `teacher_change_notice_days` | **3 days** | Required by REQ-030; owner asked for it. |
| **Check-in window (early)** | `checkin_early_minutes` | **30 min** | Owner has **already changed it once today** — the only rule with proven demand. |

**Explicitly deferred** (constants stay in code; add via the same mechanism the moment the school wants one — one
registry entry, appears on the screen, **no schema change**, AC #4): leave quota, extension ceiling
(`MAX_WEEK_BY_SIZE`), freelance colour thresholds, digest time, expiring/nearly-finished thresholds.
🔴 **A setting nobody has ever wanted to change is a constant with extra steps** — don't make the other six
adjustable by reflex.

⚠️ **Do NOT double-wire with REQ-030.** TASK-094 ships the teacher-change notice as a pure `lib/` constant + pure
function; **SPEC-029 provides the resolved value the caller passes in.** SPEC-029 owns `app_settings` and the
resolver; REQ-030 owns the enforcement. One seam, no overlap.

## 5. Open items
1. **@Porter → owner (Q1):** confirm the first cut = teacher-change notice + check-in window (I've taken Porter's
   lean). Owner can add any deferred rule later via the same mechanism trivially — this is not a one-way door.
2. **Q2 — who may change these:** **cannot be enforced per-person today** (one shared backoffice credential; the
   frontoffice login doesn't distinguish users). Honest answer: **"whoever is staff-authenticated"**. Role-gating
   needs **separate logins** — a prerequisite, not a rider (same conclusion as the board-only-top-up thread). Note
   it; not a go-live blocker.

## 6. Tasks (cut on Q1 confirm)
- **BE TASK-101** — `lib/settings.ts` registry + pure `resolveSetting` + edge `getSetting`/`setSetting`
  (`onConflictDoUpdate`) + `GET/PUT /api/settings`; register the two keys; refactor `isWithinCheckinWindow` to take
  `earlyMinutes` and resolve at the check-in service. (Teacher-change value is consumed by TASK-094.)
- **FE TASK-102** — the Settings page (list rules · value/default/override · edit-with-validation · reset-to-default).
- Dependency: TASK-101 → TASK-102; TASK-094 (REQ-030) reads the resolved `teacher_change_notice_days`.
