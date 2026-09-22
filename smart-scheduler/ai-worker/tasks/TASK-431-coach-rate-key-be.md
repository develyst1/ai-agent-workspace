# TASK-431 — `REQ-102 §6/§7`: ONE key gates the §13.3 coach rate, VIEW ⇔ EDIT coupled (key 59 `action:bookings.coach-rate`), independent of `teachers.budget-view` — BE, CONTRACT FIRST

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-22) · **Size S.** No migration (50 = 50). Key 59. `sid`; joins the same re-test round as TASK-430 (after it).

## §0 The customer's rule (Porter 09-22, REQ-102 §6/§7)
The ค่าสอน (§13.3 — `rate {effective, override, default}` on course session rows, `classRateMinor` on the course) is behind its OWN key; **no see-only state**: without the key the figure is HIDDEN and the edit ABSENT; with it, both. Fail-closed, Teacher role never, **independent of `teachers.budget-view`** (two keys, never one). This revises §4's "do not mask the rate". OUT: the freelance budget (key 57, done); `other.teacherRates` on OTHER/GROUP rows (the customer named courses / DUO / Move-session — I keep OTHER/GROUP rates out; say if you read it otherwise, Porter is asked).

## §1 Verify before the contract
1. Every reader that emits the §13.3 rate: `mappers.ts:202` (`rate: rateFacts(...)` on the booking DTO), `:262` (`classRateMinor` on the course DTO), and any other (`grep classRateMinor|rateFacts|effectiveRateMinor` non-test — the reminder? the plan reader TASK-422? the Bookings-table `getBookings`?). List with lines.
2. Every writer: `PATCH /bookings/:id { classRateMinor }`, `PATCH /courses/:id { classRateMinor }`, the DUO create body (`classRateMinor` at create — which route). A body FIELD, not a route ⇒ the `action:sales.discount` precedent (`discount-plan.ts:157`, the check in the service by key).
3. The viewer threading TASK-426 built (`viewerOf(c)`, `attachFreelanceBudgets(dtos, viewer)`) — does the booking/course DTO builder have a viewer today, or must the mask sit at the route (the DTO builders are called from many services)? Say the cheapest honest seam.

## §2 The contract I propose — confirm/correct before code
- **Key 59** `action:bookings.coach-rate` (TH `ดูและแก้ค่าสอน` / EN `View & edit coach rate`), area `bookings`; nobody by default; the super admin as always; a linked account masked regardless (`isScoped ⇒ no`, the TASK-426 shape).
- **ONE mask** `lib/coach-rate-visibility.ts`: `canSeeCoachRate(viewer)`; without it `rate ⇒ null` on every booking DTO and `classRateMinor ⇒ null` on every course DTO (the shape kept); applied at the seam §1.3 names, the same way the budget mask is — pinned by value with · without · linked-with-every-key.
- **The writes (view ⇔ edit):** a body carrying `classRateMinor` (any of the three writers) without the key ⇒ `403 FORBIDDEN` `ไม่มีสิทธิ์แก้ค่าสอน` BEFORE any tx (the discount precedent — by key, in the service); a body without the field is untouched (the move still works for a user without the key).
- **Independent of 57:** pinned — a user with 59 and not 57 sees the rate and no budget; the reverse the reverse.
- 🚫 `other.teacherRates` untouched (by absence); the budget mask untouched; nothing on the reminder's text (does the reminder print the rate? §1.1 says).
- ❓ for you: (1) the seam (§1.3); (2) does any LINE renderer print the §13.3 rate today (the reminder showed `฿600` in Fern's Tanya list, TASK-424) — if the coach's own reminder prints the rate, the coach-facing message is not a viewer's read and stays; say so.

## Definition of Done
- [ ] Contract confirmed via @Sober BEFORE code · suite, **count** · tsc 0 · 50 = 50 · key 59 + labels · the mask by value (three cases) · the three writers refused by value, the move without the field allowed · independence pinned · 🔑 Break-and-watch, `finally`, CHECKSUM · contract lines for @Fern · report here + `inbox/SA.md` + log.

---

# 📋 CONTRACT — @Jason → @Sober (2026-09-22) — §1 verified; §2 confirmed with the seam named and one correction on WHERE the write check sits; no code yet

## §1.1 Every reader that emits the §13.3 rate (grep `classRateMinor|rateFacts|effectiveRateMinor|duoCourseFacts`, non-test)
| # | producer | key | reaches |
|---|---|---|---|
| 1 | `db/mappers.ts:202` `toBookingDTO` → `rate: rateFacts(b, b.course ?? null)` | `rate` (`{ effectiveMinor, overrideMinor, defaultMinor }` on COURSE_PACKAGE rows, else null) | EVERY booking reader — 13 `toBookingDTO(` call sites (12 in scheduler.service: the calendar, `getBookings`, `getBooking`, the create / move / status / plan / group responses…; 1 in checkin.service) |
| 2 | `db/mappers.ts:260–262` `duoCourseFacts` → `classRateMinor` | `classRateMinor` on the course DTO | `toCourseWithStudent` (the course list / view / create / PATCH / confirm responses) AND `getEntitlementPlan` (`scheduler.service.ts:2285`, TASK-422) |
| 3 | LINE renderers / the reminder | **none** — no `effectiveMinor`/`classRateMinor`/`rateFacts` outside `lib/coach-rate.ts` + the two mappers; `line-message.ts` and `daily-reminder.ts` never read a rate | ❓2 answered: **no coach-facing message prints the §13.3 rate.** Fern's `฿600` in Tanya's list was the FE rendering `rate.effectiveMinor` from the DTO — the mask covers it. |
**So the rate has exactly TWO producers, both pure mappers, both key-named (`rate`, `classRateMinor`) — and `rate` / `classRateMinor` are produced NOWHERE else in `src` (scan: the only `rate:` is mappers:202; `classRateMinor` outside the mappers appears only in the writers and the schema).**

## §1.2 Every writer of the rate
| # | route | field | today's check |
|---|---|---|---|
| a | `PATCH /bookings/:id` → `moveBooking` (`:3729`) | `classRateMinor: n \| null` (the session override) | none beyond `booking-edit` |
| b | `PATCH /courses/:id` → `updateCourse` (`:4086`) | `classRateMinor` (the course default) | none beyond the route key |
| c | `POST /courses` → `createCoursePackage` (`:2066`) | `duo.classRateMinor` (the DUO create) | none beyond `sales…`/the route key |
A body FIELD, not a route — the `action:sales.discount` precedent: `assertMayDiscount(body.discount, c.get("user"))` is called **at the ROUTE** (`routes/api.ts:231`, `routes/camp.ts`), the rule itself in `lib/discount-plan.ts:152`. **Correction 1:** the same shape — `assertMayEditCoachRate(body, user)` in `lib/coach-rate-visibility.ts`, called at the three routes BEFORE the service (the services have no user; the discount rule sits exactly there). A body without the field passes untouched (the move still moves; a Private course PATCH of `adminUnlocked` still works); `null` (clearing the override) IS an edit of the rate ⇒ needs the key.

## §1.3 The seam (❓1) — the DTO builders have NO viewer, and threading one is the wrong cost
`toBookingDTO` / `toCourseWithStudent` / `duoCourseFacts` are PURE mappers called from 13 + 8 sites inside services that mostly have no viewer (`getBookings` has a scope, `listCoursesPaged` nothing, `getEntitlementPlan` nothing, every create/PATCH/status response nothing). TASK-426's thread was 8 lines because the budget had ONE builder; here it would be ~20 service signatures for two keys. **The cheapest honest seam: ONE response mask at `/api/*`, after the guard** — `coachRateMask` middleware: when `canSeeCoachRate(viewerOf(c))` is false, the JSON body is walked once and every key named exactly `rate` or `classRateMinor` is set to `null` (the shape kept, the FE renders "—" and hides the edit). Why it is honest and not blunt: §1.1 proves those two keys have no other producer in `src` (pinned by scan, so a future `rate` key elsewhere fails the suite and must choose a name or join the mask); it is fail-closed BY CONSTRUCTION — a reader added tomorrow is masked without knowing the key exists; `other.teacherRates` (a different key) is untouched; the cost is one walk per response (the week calendar ≈ 500 rows — microseconds). `/api/me`, `/permissions` and the auth routes are outside the mask by path (they carry no DTO). If you prefer the thread anyway, say so — it is the same task at M instead of S.

## §2 The contract — confirmed
- **Key 59** `action:bookings.coach-rate` (TH `ดูและแก้ค่าสอน` · EN `View & edit coach rate`), area `bookings`; nobody by default; the super admin as always; a linked account never (`isScoped ⇒ no`, the TASK-426 shape) — `canSeeCoachRate(viewer)` in `lib/coach-rate-visibility.ts` beside `maskCoachRate(body)` (pure, exported, pinned by value) and `assertMayEditCoachRate(body, user)`.
- **The read mask:** the middleware above, registered in `index.ts` after `accessGuard`; by value through the root app: `GET /calendar`, `GET /bookings`, `GET /courses`, `GET /entitlements/:id/plan` for (i) a super admin ⇒ the figures, (ii) a staff with every key but 59 ⇒ `rate: null`, `classRateMinor: null`, everything else byte-identical, (iii) a linked account with all 59 ⇒ nulls; the pure `maskCoachRate` by value (nested arrays/objects; `teacherRates` untouched; a non-object body untouched).
- **The writes (view ⇔ edit):** the three routes call `assertMayEditCoachRate` — a body with `classRateMinor` (a/b) or `duo` (c) and no key ⇒ `403 FORBIDDEN "ไม่มีสิทธิ์แก้ค่าสอน"` before the service (by value: the service spy never called); without the field ⇒ the service runs. **Note on (c):** a DUO create REQUIRES `duo.classRateMinor` (TASK-420's validator) — so a user without 59 cannot create a DUO course at all; that is the customer's "no see-only state" applied to the create. Say if the owner wants a DUO create without a rate (then `classRateMinor` becomes optional on `duo` — a validator change).
- **Independent of 57:** pinned by value — 59-not-57 sees `rate` and no budget; 57-not-59 the reverse; `canSeeBudget` and `canSeeCoachRate` never read each other's key (by source).
- 🚫 `other.teacherRates` untouched (by value: an OTHER row's DTO byte-identical under the mask); the budget mask untouched; no LINE text changes (§1.1 #3); no migration; the key count 58 → 59 (the five count pins).

## DoD as I will run it
Suite count · tsc 0 · 50 = 50 · key 59 + labels · `maskCoachRate` by value · the middleware by value through the root app (the three viewers × four reads) · the three writers refused by value, the move/PATCH without the field allowed · independence pinned · the two-producer scan · break-and-watch in `try/finally` with sha-256 · @Fern's lines · report ×4.

**For @Fern (draft):** key 59 `action:bookings.coach-rate` in `/api/me`'s `actions`; without it every booking DTO reads `rate: null` and every course DTO / the plan `classRateMinor: null` — hide the figure AND the edit (no see-only state); with it both; a body carrying `classRateMinor` (or `duo`) without the key ⇒ 403; a linked account always nulls. Independent of 57 (`teachers.budget-view`).

⛔ Waiting on your confirm (the seam · the route-level write check · the DUO-create consequence) before code.

---

# ✅ CONFIRMED — @Sober → @Jason (2026-09-22) — build to §2 with your two corrections

1. **The seam = your ONE response mask at `/api/*` after the guard** — nulls exactly the keys `rate` and `classRateMinor`, `teacherRates`/`hourlyRate` untouched (exact key match, pinned by value on a nested fixture). The scan pin is the contract's teeth: `rate:` / `classRateMinor:` exist as producers ONLY in the two mappers — any new producer fails the suite (so the mask can never silently miss one or null a stranger). Skipped for a super admin; applied for a linked account regardless of grants (the 57 shape). Pin the calendar payload masked in one walk (the biggest response) and `/api/me` + `/api/permissions` byte-identical.
2. **Correction 1 accepted:** `assertMayEditCoachRate(body, user)` at the three routes before the service (the discount precedent); a body without the field passes; `403 FORBIDDEN ไม่มีสิทธิ์แก้ค่าสอน`.
3. **The DUO-create consequence:** build as-is — no key ⇒ no DUO create (that IS "no see-only state"). Sent to Porter for the owner; if she wants the rate optional at create, a one-line follow (the validator's `optional()`), not this task.
4. Independence pinned both ways (59 without 57; 57 without 59). Key 59 labels as §2. 50 = 50.

**Fern's lines final:** without key 59 every booking row reads `rate: null` and every course `classRateMinor: null` (the shape kept); any body with `classRateMinor` ⇒ 403 `ไม่มีสิทธิ์แก้ค่าสอน`; a DUO create needs the key; key 59 in `/api/me` `actions`; independent of 57. TASK-432 §0 set.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-22) — built as confirmed; key 59; no migration (50 = 50); 2700 pass / 0 fail; 16/16 mutations bite

**Numbers:** `bun test` **2700 pass / 0 fail**, 205 files (+1: `src/lib/coach-rate-visibility-req102-6.test.ts`, 9 tests) · `tsc --noEmit` **0** · 50 = 50 · 4 pins moved (the key census 58 → 59 in six tests; the rbac "body-level keys" list gains 59; `viewerOf(c)` 9 → 12).

## What was built
- **`lib/coach-rate-visibility.ts`:** `COACH_RATE_KEY = "action:bookings.coach-rate"`; `COACH_RATE_KEYS = ["rate", "classRateMinor"]` (the ONLY keys the mask touches); `canSeeCoachRate(viewer)` = the key, never a linked account, `null` ⇒ no (the TASK-426 shape; reads nothing of the budget key — pinned both ways by source and by value: 59-not-57 sees the rate and no budget, 57-not-59 the reverse); `maskCoachRate(body)` — a NEW value with every `rate` / `classRateMinor` key nulled at any depth (`teacherRates`, `hourlyRate`, `rateMinor` untouched; non-objects pass through; the input not mutated); `bodyEditsCoachRate` / `assertMayEditCoachRate(body, viewer)` — `classRateMinor` (incl. `null` — clearing IS an edit) or `duo` ⇒ 403 `FORBIDDEN "ไม่มีสิทธิ์แก้ค่าสอน"` without the key.
- **The READ seam — `middleware/coach-rate-mask.ts`**, registered on `/api/*` right after `accessGuard` (`index.ts`): after the handler, a viewer without the key gets the JSON body walked once; `/api/(auth|me|permissions)` outside by path; a keyed viewer / a super admin pays nothing (the body untouched); non-JSON passes. **The two-producer scan is pinned:** across `src` (non-test), a response key `rate:` / `classRateMinor:` is produced ONLY in `db/mappers.ts` (`rateFacts`, `duoCourseFacts`) — mutation P (a second producer) bites, so a future `rate` key elsewhere must choose a name or join the mask knowingly.
- **By value through the root app:** `GET /bookings`, `GET /calendar`, `GET /entitlements/:id/plan` — a super admin ⇒ the figures; a staff with every key but 59 ⇒ `rate: null` / `classRateMinor: null` and **everything else byte-identical** (asserted by re-inserting the figures into the masked body and comparing); a linked account with all 59 ⇒ nulls; `/api/me` untouched and honest (no key 59 in `actions`).
- **The WRITE half at the three routes** (the `assertMayDiscount` shape, before the service): `PATCH /bookings/:id` (`classRateMinor`, incl. `null`), `PATCH /courses/:id`, `POST /courses` (`duo`) ⇒ 403 without the key, the service spy never called; `PATCH /bookings/:id { date }`, `PATCH /courses/:id { adminUnlocked }`, a Private `POST /courses` ⇒ run; with the key all three run. **The DUO-create consequence as you confirmed:** no key ⇒ no DUO create (the owner is asked via Porter).
- 🚫 `other.teacherRates` untouched (mutation E — nulling it — bites); the budget mask untouched (its tests byte-identical); no LINE text (no renderer reads the rate — §1.1); no migration.

## Break-and-watch — `mut431.mjs`, 16 mutations, **16 bite** (`try/finally`, sha-256 restore byte-identical)
A a linked account with the key sees the rate · B `null` viewer sees (fail open) · C the rate gated by the budget key (coupled) · D the mask forgets `classRateMinor` · E the mask nulls `teacherRates` too · F the walk stops at the first level · G clearing the override needs no key · H the DUO create needs no key · I the middleware masks a keyed viewer · J the middleware skips the mask · K the middleware not registered · L/M/N each route's write check dropped · O the key missing from the registry · P a second producer of the key.

## Contract lines for @Fern (TASK-432) — final
- Key 59 `action:bookings.coach-rate` in `/api/me`'s `actions` (59 keys; the checklist gains it under Bookings, TH `ดูและแก้ค่าสอน`).
- Without it EVERY booking DTO (calendar, table, plan sessions, responses) reads `rate: null` and every course DTO / the plan reads `classRateMinor: null` — hide the figure AND the edit (no see-only state); with it both. A linked (teacher) account always nulls. Independent of 57.
- A body carrying `classRateMinor` (incl. `null`) on `PATCH /bookings/:id` / `PATCH /courses/:id`, or `duo` on `POST /courses`, without the key ⇒ `403 { error: { code: "FORBIDDEN", message: "ไม่มีสิทธิ์แก้ค่าสอน" } }` — so the DUO create button needs the key too; a body without those fields is unaffected.

⛔ Only you mark this DONE. ▶️ Next: whatever waits on the board (REQ-095 §13.4a is queued behind this, per the log).

---

# ✅ DONE — REVIEWED by @Sober (2026-09-22)
Re-run by me: **2700 pass / 0 fail** · tsc 0 · 50 = 50 · key 59 in `permissions.ts` · `middleware/coach-rate-mask.ts` present. Fern wires TASK-432.
