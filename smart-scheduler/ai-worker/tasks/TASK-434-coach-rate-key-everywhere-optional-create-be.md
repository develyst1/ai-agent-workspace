# TASK-434 — `REQ-102 §8` key 59 on EVERY coach-rate surface (+ the ECA/Group per-teacher rates) and the rate OPTIONAL at DUO create — BE, S, CONTRACT FIRST (light: one census, then build)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-22) · **Size S** (extends TASK-431's seam; no migration, 50 = 50; no new key). `sid`; the held batch.

## §0 Owner rulings (Porter 09-22, REQ-102 §8)
1. **Rate optional at create:** a user WITHOUT key 59 can create a DUO/course — the rate simply is not there; a key-59 holder sets the default later (the course card). 2. **ONE key 59 gates the coach rate on EVERY surface — including the Stage-1 ECA/Group per-teacher rates (`other.teacherRates`)** — see ⇔ edit, no per-type keys. 3. 57 and 59 stay independent.

## §1 Census before code (say it in the TASK, then build — no second round unless something surprises)
- Producers of a per-teacher rate: `other.teacherRates` (`mappers.ts otherFacts`), the series DTOs' `teacherRates` (`GET /other-series/:key` + the list), `additionalTeachers[].rateMinor` if any DTO carries it, the group DTO (`groupFacts`). Extend the TASK-431 scan pin to the full key set.
- Writers carrying a rate: `POST /bookings/other-series { teacherRates }`, `PATCH /bookings/:id/other { teacherRates }`, the group-series create, `POST /other-series/:key/teachers { rateMinor }`, `PATCH /other-series/:key { teacherRates }`, `POST /other-series/:key/dates` (copies rates — a copy is not an edit; allowed), `PATCH /courses/:id`, `PATCH /bookings/:id`, the DUO create `duo.classRateMinor`.

## §2 The contract
- **Mask:** `maskCoachRate` nulls exactly `rate`, `classRateMinor`, `teacherRates` (⇒ `null`, the shape kept — the FE reads null as "no key") and `rateMinor` on an `additionalTeachers` entry if present; `hourlyRate`/`budgetMinor` never (57's).
- **Writes:** `assertMayEditCoachRate(body, user)` refuses a body where ANY of `classRateMinor` · `teacherRates` · `rateMinor` · `duo.classRateMinor` is PRESENT — **`duo` alone no longer trips it** (ruling 1); applied at every writer in §1 (route-level, the 431 shape). A body without those fields passes (a create/edit without a rate runs).
- **Optional at create:** the DUO validator's `classRateMinor` ⇒ `optional()`; a DUO born without a default reads `rate: { effective: null, override: null, default: null }`; `effectiveRateMinor` already handles null (pin). The other-series/group creates already take rates as optional? (say).
- Pins by value through the root app: an OTHER row and a series read `teacherRates: null` without 59, intact with; the group DTO; each writer 403 with the field / 200 without; a DUO create without 59 and without a rate ⇒ 201; 57⇄59 still independent.
- 🚫 Nothing on the budget mask; no LINE text changes (the coach notices carry no rate — confirm by grep).

## Definition of Done
- [ ] Census written · suite **count** · tsc 0 · 50 = 50 · the pins above · the scan pin extended · 🔑 Break-and-watch, `finally`, CHECKSUM · contract lines for @Fern (the amended TASK-432) · report here + `inbox/SA.md` + log.

---

# 📋 CENSUS + ✅ CODE DONE — @Jason → @Sober (2026-09-22) — nothing surprised; 2711 pass / 0 fail; 13/13 mutations bite

## §1 The census (grep `teacherRates|rateMinor|classRateMinor|rateFacts`, non-test)
**Producers of a per-teacher / coach rate in a RESPONSE (the mask's key set):**
| key | producer | reaches |
|---|---|---|
| `rate` | `mappers.ts:202` `rateFacts` | every booking DTO (course rows) — TASK-431 |
| `classRateMinor` | `mappers.ts:262` `duoCourseFacts` | the course DTO + the plan — TASK-431 |
| `teacherRates` | `mappers.ts:145` `otherFacts` → `other.teacherRates` (OTHER rows) · `mappers.ts:135` `groupFacts` → `group.teacherRates` (GROUP rows, via the same `otherFacts`) · `other-series.service.ts` `ratesOf` → `GET /other-series/:key`'s `teacherRates` (the list carries none) | the calendar, the table, every booking response, the Manage-plan header |
| `rateMinor` | **no DTO carries it** — the booking DTO's `teachers[]` is `toTeacherBase` (id · name · nickname · type); the extras' `booking_teachers.rate_minor` is folded into `teacherRates` by `otherFacts`; `rateMinor` exists only in the schema, the ops client (dead), `PUT /teachers/:id/budget`'s BODY (57's hourly rate) | — |
⇒ `COACH_RATE_KEYS = ["rate", "classRateMinor", "teacherRates"]`; the TASK-431 scan pin extended: across `src` the response keys `rate:` / `classRateMinor:` / `teacherRates:` are produced only by `db/mappers.ts` and `other-series.service.ts` (pinned; a `rateMinor:` response key exists nowhere — pinned by absence).
**Writers carrying a rate (the check's route set — all at the ROUTE, the 431 shape):** `POST /bookings` (`teacherRates` on an OTHER create) · `PATCH /bookings/:id/other` (`teacherRates`) · `POST /bookings/other-series` (`teacherRates`) · `POST /bookings/group-series` (`teacherRates`) · `POST /other-series/:key/teachers` (`rateMinor`) · `PATCH /other-series/:key` (`teacherRates`) · the TASK-431 three (`PATCH /bookings/:id` `classRateMinor`, `PATCH /courses/:id` `classRateMinor`, `POST /courses` `duo.classRateMinor`) = **9 routes**. `POST /other-series/:key/dates` COPIES the template's rates — not an edit, unchecked (as you wrote). `PUT /teachers/:id/budget { rateMinor }` is key 57's hourly rate — NOT under this check (pinned by source).

## What was built
- **The mask:** `teacherRates ⇒ null` (the shape kept) on every surface — by value: an OTHER row's `other.teacherRates`, a GROUP row's `group.teacherRates`, a series DTO's `teacherRates`; `hourlyRate` (57) and a `rateMinor` on a non-rate object untouched; through the root app: `GET /bookings` (an OTHER row) and `GET /other-series/:key` read null without 59, intact with.
- **The write check:** `COACH_RATE_BODY_FIELDS = ["classRateMinor", "teacherRates", "rateMinor"]` — PRESENT (any value, null included) ⇒ the key; `duo.classRateMinor` present ⇒ the key; **`duo` alone no longer trips it** (ruling 1). Applied at the six new writers (+ the three of 431 = 9 `assertMayEditCoachRate(` in `api.ts`, `viewerOf(c)` ×18). By value through the root app, all nine: with the rate field ⇒ 403 `ไม่มีสิทธิ์แก้ค่าสอน` before the service (the spy never runs); without ⇒ 201/200 and the service runs; a super admin ⇒ all nine run.
- **Optional at create:** `duo.classRateMinor` ⇒ `optional()` (validator by value: `{ coStudentId }` alone passes; a negative still refused); the service writes `input.duo?.classRateMinor ?? null` (a mutation storing 0 bites); a DUO born without a default reads `rate: { effectiveMinor: null, overrideMinor: null, defaultMinor: null }` (`effectiveRateMinor` already null-safe — pinned). The other-series and group creates already took rates as optional (pinned).
- 🚫 The budget mask untouched (by source: no `teacherRates`/`coach-rate` in it); no LINE renderer prints any rate (by source on the three message files); 57 ⇄ 59 independence pins from TASK-431 still green.

## Break-and-watch — `mut434.mjs`, 13 mutations, **13 bite** (`try/finally`, sha-256 restore byte-identical)
A `teacherRates` left visible · B/C `teacherRates` / `rateMinor` not a write field · D `duo` alone trips the check again · E `duo.classRateMinor` unchecked · F–K each of the six new routes unchecked · L the rate required at the DUO create again · M a DUO without a rate stores 0.

## Contract lines for @Fern (the amended TASK-432) — final
- Without key 59: every booking DTO reads `rate: null` AND `other.teacherRates: null` / `group.teacherRates: null`; the course DTO / plan `classRateMinor: null`; `GET /other-series/:key` `teacherRates: null` — hide the figures and the rate inputs (no see-only state); with the key, everything as before.
- Any body carrying `teacherRates` / `rateMinor` / `classRateMinor` (incl. `null`) or `duo.classRateMinor` without the key ⇒ `403 { error: { code: "FORBIDDEN", message: "ไม่มีสิทธิ์แก้ค่าสอน" } }` — so send the rate fields ONLY when the user holds the key (omit them, don't send null). A user without the key CAN create an OTHER/group series and a DUO course — without rates.
- `POST /courses { duo: { coStudentId } }` (no `classRateMinor`) ⇒ 201; the course card's rate field is the key holder's later edit.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-22)
Re-run by me: **2711 pass / 0 fail** · tsc 0 · 50 = 50 · `COACH_RATE_KEYS = [rate, classRateMinor, teacherRates]`, `COACH_RATE_BODY_FIELDS = [classRateMinor, teacherRates, rateMinor]` · `duo.classRateMinor` optional in the validator. Census clean (no DTO carries `rateMinor`; the budget's `rateMinor` is 57's). Fern's lines final = TASK-432 §0b.
