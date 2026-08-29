# REQ-031: Business rules the school actually changes should be settings — editable by staff, not by an engineer

- Status: READY_FOR_SA — one open question (which rules make the first cut)
- Priority: **MEDIUM–HIGH** — the teacher-change rule is needed by REQ-030, so at least the mechanism is on the go-live path
- Requested: 2026-08-01 by the project owner
- Deadline: go-live **2026-08-20** for the mechanism + the REQ-030 rule
- Source: owner — *"3 วัน ขอให้เป็น config database แบบแก้ง่ายๆ ได้มั้ย"*

## Problem / Goal

REQ-030 introduces a **minimum notice period for changing a session's teacher: 3 days.** The owner asked for it
to be **configurable and easy to change**, and she is right to — but the request points at something wider.

**The school's operating rules are currently spelled as constants in the code:**

| Rule | Where | Value |
|---|---|---|
| Check-in window opens early | `lib/checkin.ts:7` | 30 min (now ±30, see REQ) |
| Leave quota by course size | `lib/leave.ts:8` | 4→1 · 6→2 · 10→3 |
| Extension ceiling by size | `lib/leave.ts:11` | 4→wk 5 · 6→wk 8 · 10→wk 13 |
| Advance leave notice | `lib/leave-notice.ts` | FT/PT ≥1h · FL ≥2h |
| Freelance budget colours | `lib/scheduler/teacher.ts` | 30% / 70% |
| Digest send time | job schedule | 08:00 |
| "Expiring soon" / "nearly finished" | SPEC-018 | 14 days / ≤2 sessions |
| **Teacher-change notice** | **doesn't exist yet** | **3 days** |

Every one of these is a **commercial decision that the school may revisit** — and today changing any of them
means an engineer, a build and a deploy.

Goal: **the rules the school actually changes can be changed by the school.**

## 🔴 The thing that decides whether this is worth building

> **"In the database" is not the same as "easy to change".**

A value in `app_settings` with no screen is a constant with **extra steps and a new failure mode** — and worse,
changing it would require someone to run SQL against production, which is **exactly what this project forbids**
(the brownfield rule) and what the owner should never have to do.

**So: a settings row without a settings screen does not satisfy this request.** If only one of the two can be
built before go-live, build the **screen** for the rules that ship, not the mechanism for rules that don't.

## Requirement

1. **A teacher-change notice period exists as a rule**, default **3 days**, enforced server-side by REQ-030.
2. **Staff can view and change it in the web app** — no SQL, no deploy.
3. The mechanism must be **general enough to add more rules later without redesign**, and **not so general that
   it becomes a settings system nobody understands.**
4. Every rule keeps a **sane default in code**. A missing or malformed setting must **fall back to the default
   and say so**, never to zero, null, or "no rule".
5. Changing a rule must not retroactively invalidate anything already booked.

## Acceptance Criteria

- [ ] A staff user can find the teacher-change notice period in the UI, change it to e.g. 5 days, and see
      REQ-030 enforce the new value without a deploy.
- [ ] Deleting or corrupting the stored value falls back to the coded default; the system keeps working.
- [ ] The change is visible to whoever needs to know it (at minimum, the message shown when the rule refuses).
- [ ] Adding a second rule later needs no schema change.

## Analysis / current state (Porter, read-only — for SA to verify)

- ✅ **`app_settings` already exists** (`db/schema.ts:399`) and is already used for `line_admin_user_ids`, so
  there is a home and a precedent — this is not a new concept, it's an existing one being used properly.
- The rules above are **pure constants in `lib/`**, mostly consumed by pure functions (`leaveQuota`,
  `isWithinCheckinWindow`, `budgetTone`). That is a good starting shape: **the functions stay pure; the values
  arrive as arguments.** Nothing needs to learn about the database.
- ⚠️ `MAX_WEEK_BY_SIZE` is read by **`lib/recurring.ts:33`** as well as leave logic — so it is already
  load-bearing in two places, and the owner has just **confirmed** its 6→week 8 value (REQ-030 Q2). **Confirmed
  values are the ones worth making editable**; unconfirmed guesses should be settled first, not made adjustable.

## Constraints

- **Defaults live in code.** The database holds *overrides*, not the only copy of the truth.
- Server-side enforcement is unchanged — this REQ changes where a number comes from, not who enforces it.
- **Do not turn this into a configuration framework.** Scope is the rules the school actually changes.
- HOW (storage shape, caching, where the screen lives) is the SA's design.

## Out of Scope

- Per-branch or per-teacher overrides. One school, one set of rules, for now.
- An audit log of who changed what. Worth having eventually; not before go-live.

## Questions

1. **Which rules make the first cut?** The teacher-change notice is required by REQ-030. My proposal for the
   rest, ordered by how likely the school is to actually change them:
   **(a) check-in window** — she has already changed it once today (30 → ±30);
   **(b) leave quota + extension ceiling by size** — commercial policy, and REQ-030 puts them in front of
   customers; **(c) freelance budget colour thresholds** — the meeting doc shows people already discussing
   different numbers; **(d) digest time and the "expiring soon" thresholds** — operational preference.
   *(Porter's lean: ship the mechanism + the teacher-change rule + (a), and move the others as they come up.
   **A setting nobody has ever wanted to change is a constant with extra steps.**)*
2. **Who may change these — any admin, or is this owner-level?** *(Porter's note: this cannot be enforced
   per-person today — the backoffice has one shared credential and the frontoffice login doesn't distinguish
   users either. So the honest answer for now is "whoever is logged in", and if that isn't acceptable, separate
   logins are the prerequisite — the same conclusion as the meeting doc's "board-only top-up approval".)*

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-031 | Business rules as editable settings — starting with the 3-day teacher-change notice | **MEDIUM–HIGH** | **BE DONE — `SPEC-029`; TASK-101 ✅ (mechanism + 2 rules, Sober-verified 2026-08-04); TASK-102 (FE screen) unblocked** | **@Jason — TASK-101 startable now** (mechanism + 2 rules). Design: defaults in code, overrides in `app_settings` (jsonb), **pure fns stay pure** (values passed in), fallback-to-default-with-notice; **the settings SCREEN is the load-bearing half** ("in the DB" ≠ "easy to change"). No double-wire with REQ-030 (SPEC-029 provides the value, TASK-094 enforces). Q2 (who-may-change) = "whoever's authed" until separate logins exist. Prior notes: | 🔴 **NEVER ROUTED UNTIL NOW — same board failure.** Owner: *"3 วัน ขอให้เป็น config database แบบแก้ง่ายๆ ได้มั้ย"*. 🔴 **The line that decides the design: "in the database" is NOT "easy to change."** A value in `app_settings` with **no screen** is a constant with extra steps — and changing it would mean **running SQL against production**, which this project forbids and which the owner must never have to do. **A settings row without a settings screen does not satisfy the request.** ✅ `app_settings` already exists (`db/schema.ts:399`, used for `line_admin_user_ids`) — a home and a precedent. The rules are **pure constants in `lib/`** consumed by **pure functions** (`leaveQuota`, `isWithinCheckinWindow`, `budgetTone`) ⇒ keep the functions pure, pass values in; nothing in `lib/` learns about the DB. ⚠️ **Scope trap, named on purpose:** there are **eight** such constants — do **not** make all eight configurable by reflex. Porter's lean: mechanism + the 3-day rule + the **check-in window** (the owner has already changed that one once, the only real evidence of demand). **Defaults stay in code; the DB holds overrides**; a missing/malformed value falls back to the default **and says so** — never to zero, null or "no rule". ❓ "Who may change these" **cannot be enforced per-person today** (one shared backoffice credential; frontoffice login doesn't distinguish users) — separate logins are a prerequisite, not a rider. |
```
