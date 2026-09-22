# TASK-426 — `REQ-102` (narrowed): ONE key gates the Freelance salary ceiling/remaining on the frontoffice + close the `GET /teachers` budget leak — BE, CONTRACT FIRST

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-21) · **Size S–M.** No migration (49 = 49). Key 57. `sid`; joins the next cycle.

## §0 The owner's scope (Porter 09-21): ONLY the freelance budget figures (`freelance_budgets` — `budgetMinor` / `remainingMinor` / `reorderMinor` and whatever else derives from the ceiling on the frontoffice), behind ONE fail-closed key nobody holds by default, the Teacher role never. **OUT:** price cards, discounts, posted sales, the §13.3 coach rate, the reports — do NOT mask those. Plus: `GET /teachers` ships every coach's budget to a REQ-097 teacher account — close it.

## §1 Verify before the contract
1. **Every reader that emits a budget figure:** `attachSetupIncomplete` / the budget attach (`scheduler.service.ts:330–363` — `budgetMinor = ceilingQty × rate`, `remainingMinor`, `reorderMinor`, `overLimit`, `setupIncomplete`), the teacher DTO (`mappers.ts:41–52`), `GET /teachers`, `GET /teachers/:id*`, the budget routes (`PUT /teachers/:id/budget`, `/budget/topup` — their responses), the work-days impact read, any report/dashboard line that prints a teacher's ceiling (`som-report`, `reports/daily` — say if they do), the calendar's `teacherRows` (does the grid payload carry budgets?). List with line numbers.
2. `overLimit` / `setupIncomplete` are BOOLEAN derivations of the ceiling that the calendar uses to refuse a booking ("not bookable") — they must keep working for a user who cannot see the numbers (the mask hides amounts, not the booking rule). Confirm which callers need the booleans.
3. The RBAC registries: the 57th key, `route-access.ts` (the two budget writes gain the read key as a second requirement — fail closed), the FE snapshot (56 → 57).

## §2 The contract I propose — confirm/correct before code
- **Key:** `action:teachers.budget-view` (57th; TH `ดูงบ/เพดานค่าจ้างครู` / EN `View teachers' freelance budget`), area `teachers`, granted to nobody by default; the super admin as always; the Teacher role never (a linked account is refused the key's effect regardless — `isScoped` ⇒ masked, pinned).
- **ONE mask at the ONE builder:** `maskBudget(user, dto)` in `lib/budget-visibility.ts` — without the key, `budgetMinor` / `remainingMinor` / `reorderMinor` (and any other satang field derived from the ceiling — the list from §1.1) become `null`; `overLimit` and `setupIncomplete` STAY (booleans, the booking rule); the shape unchanged. Applied where the teacher DTO is built (one place — the attach), so `GET /teachers`, `/teachers/:id`, the budget routes' responses and every list that embeds a teacher DTO are masked by construction; pinned by source that no route hand-builds a budget field.
- **The writes:** `PUT /teachers/:id/budget` + `/budget/topup` require BOTH `teachers.budget` AND `teachers.budget-view` (a user who cannot see the number cannot set it — fail closed; `route-access.ts` grows a two-key form or the route asserts the second key).
- **The leak:** a linked (REQ-097) account's `GET /teachers` ⇒ masked always (through the same mask — `isScoped` counts as "no key"); pinned by value through the root app with a linked token holding all 57 keys.
- 🚫 Nothing else masked (pinned by absence: price lists, `rate`, `other.teacherRates`, `classRateMinor`, posted-sale, reports untouched — the TASK-423/394 tests stay byte-identical).
- ❓ for you: (1) any report line that prints a ceiling (§1.1) — mask it or leave it (the owner said reports are out; if a report prints the CEILING itself, say so and I ask); (2) `route-access.ts`'s shape for a two-key act.

## Definition of Done
- [ ] Contract confirmed via @Sober BEFORE code · suite, **count** · tsc 0 · 49 = 49 · the key (57) + labels · the mask by value (with · without · a linked account with every key) and by source (one builder) · the booleans survive · the two writes double-gated · nothing else masked (by absence) · 🔑 Break-and-watch, `finally`, CHECKSUM · contract lines for @Fern · report here + `inbox/SA.md` + log.

---

# 📋 CONTRACT — @Jason → @Sober (2026-09-21) — §1 verified; §2 confirmed with one structural correction and three ❓; no code yet

## §1.1 Every reader that emits a ceiling-derived figure (grep `budgetMinor|remainingMinor|reorderMinor|overLimit|setupIncomplete|hourlyRate|remainingQty|ceilingQty`, non-test)
| # | site | emits | reaches |
|---|---|---|---|
| 1 | `scheduler.service.ts:326–369` `attachFreelanceBudgets(dtos)` — **the ONE builder** | `hourlyRate = rate/100` · `budgetMinor = ceilingQty × rate` · `remainingMinor = remainingQty × rate` · `reorderMinor` · `overLimit` · `setupIncomplete` | every teacher DTO below |
| 2 | `:499` `getCalendar` | the grid's `teachers[]` (each DTO from #1) | `GET /calendar` — **including a linked account's own column** |
| 3 | `:590` `getTeachers` | the grouped list | `GET /teachers` (5 menus; `TEACHER_ALLOWED` — **the leak**) |
| 4 | `:3845` `loadTeacherFull` (one DTO from #1) | the response of `createTeacher` `:3884` · `updateTeacher` `:3931` · `archiveTeacher` `:3962` · `reactivateTeacher` `:3971` · `setFreelanceBudget` `:4016` · `topUpFreelanceBudget` `:4028` | `POST/PATCH /teachers…`, `PUT …/budget`, `POST …/budget/topup`, `…/archive`, `…/reactivate` |
| 5 | `db/mappers.ts:41–52` `toTeacherDTO` | the six fields **null/false by default** (the builder fills them) | `setLimitOverride` `:3826` and `setTeacherWorkDays` `:3821` return a bare `toTeacherDTO` — **no figures** (nothing to mask, pinned) |
| 6 | `GET /teachers/:id/work-days/impact` `previewWorkDaysChange` | `{ removedDays, orphanCount, sessions }` — **no figures** | — |
| 7 | `lib/attention.ts:274–281` `freelance_near_cap` | `label: "<nickname> · เหลือ N ชม."` — the remaining in HOURS (not satang), from `listFreelanceCeilings` (its own read of `bo.item`, not the builder) | `GET /attention` (the dashboard) **and the LINE daily digest to admins** (same producer, REQ-023) |
| 8 | `toTeacherBase` (the booking DTO's `teacher` / `teachers[]`) | id · name · nickname · type only | **no figures** (pinned by absence) |
| 9 | `som-report`, `reports/*`, `getDailyReport` | **no read of any ceiling column** (grep: zero hits) | — ❓1 answered: no report prints the ceiling |
| 10 | `lib/ops-client.ts:324–342` `attachOpsBudgets` | the OLD ops-side attach (`remainingMinor/budgetMinor/reorderMinor/overLimit` from ops) | **dead for the frontoffice** since SPEC-005 (`getCalendar`/`getTeachers` comment: "local budget … (no ops)"); no caller in `src` outside ops-client itself — pinned by absence, not touched |
**So the frontoffice's ceiling figures come from ONE builder (#1) into three readers (#2–#4); #7 is the one figure outside it.**

## §1.2 The BOOLEANS — who needs them without the numbers
`overLimit` + `setupIncomplete` + `limitOverride` drive **"not bookable"**: the calendar's teacher column (`GET /calendar` → the FE hides/greys the coach), `assertTeacherBookable` (`:988` — reads `isFreelanceSetupIncomplete` from the DB, NOT the DTO ⇒ untouched by any mask), the attention check #7 (reads `remainingQty` itself). ⇒ the mask nulls the four satang/rate fields and leaves the three booleans; the booking rule cannot notice the mask (by value: a masked DTO still says `overLimit: true`; `assertTeacherBookable` by source reads no DTO).

## §1.3 RBAC
`ACTION_REGISTRY` = 56 (pinned in 5 tests → 57); `route-access.ts` `RouteAccess = { menus, action? }` with `act(menus, ONE key)`; the guard (`middleware/auth.ts:135`) checks `access.action` once. **❓2 answered — my proposal:** `action?: ActionKey | readonly ActionKey[]` and the guard checks `every` (a two-key act = both grants; a super admin passes as always); `act()` keeps its one-key form, a new `acts(menus, [k1, k2])` for the two budget writes. Pinned: the guard's `every`, the two rows, and that a user holding `teachers.budget` alone is refused (by value through the root app).

## §2 The contract — confirmed, with ONE structural correction
- **Key 57:** `action:teachers.budget-view` — TH `ดูงบ/เพดานค่าจ้างครู` · EN `View teachers' freelance budget` — area `teachers`; nobody by default; the super admin as always; a **linked account (REQ-097, `isScoped`) is masked regardless of grants** (pinned by value with a linked token holding all 57).
- **ONE mask at the ONE builder — the correction: the builder must KNOW THE VIEWER.** `attachFreelanceBudgets` is a service function without a user; a mask "at the builder" needs one. ⇒ `attachFreelanceBudgets(dtos, viewer: Viewer)` (`Viewer = { isSuperAdmin, grants, teacherId? } | null`; `null` ⇒ masked — fail closed; the parameter is REQUIRED so a new caller cannot forget it) applying `maskBudget(viewer, dto)` from `lib/budget-visibility.ts` (`canSeeBudget(viewer) = viewer && !isScoped(viewer) && hasAction(viewer, "action:teachers.budget-view")`; without it `hourlyRate · budgetMinor · remainingMinor · reorderMinor ⇒ null`; `overLimit · setupIncomplete · limitOverride` stay; shape unchanged). The three readers thread the viewer from the route (`viewerOf(c)` beside `actorOf`): `getCalendar(q, viewer)` (its scope derives from the same viewer), `getTeachers(opts, viewer)`, `loadTeacherFull(id, viewer)` ← the six writers each gain the parameter (8 route lines). Pinned by source: `attachFreelanceBudgets` is the only writer of the four fields; every caller passes a viewer; no route hand-builds one. The two bare-DTO returns (#5) carry nulls by construction — pinned.
- **The two writes double-gated:** `PUT /teachers/:id/budget` + `POST …/budget/topup` ⇒ `acts(TEACHERS, ["action:teachers.budget", "action:teachers.budget-view"])`; the guard's `every`. The responses come back through `loadTeacherFull(id, viewer)` ⇒ a setter without the view key cannot exist (double-gated), and the response shows the figures it just set.
- **The leak:** `GET /teachers` + `GET /calendar` for a linked account ⇒ masked by the same rule (`isScoped ⇒ no key`); by value through the root app: a linked token with all 57 keys reads nulls; an unlinked super admin reads the figures; an unlinked staff with 56 keys (no budget-view) reads nulls.
- 🚫 **Nothing else masked** (by absence: `rate{}` (TASK-423), `other.teacherRates`, `classRateMinor`, price cards, posted sales, reports — the TASK-423/394/397 tests byte-identical; `lib/budget-visibility.ts` names only the four fields).
- **❓ for you (three):** (1) **#7 — the attention line `เหลือ N ชม.` (dashboard + the LINE admin digest):** hours, not satang, but derived from the ceiling. Mask on the dashboard for a user without the key (the item stays, the label drops the number: `<nickname> · ใกล้เต็มเพดาน`)? The LINE digest has no viewer — leave it (admins only) or drop the number there too? My proposal: mask the dashboard label without the key, digest unchanged. (2) **`hourlyRate`** (the freelance pay rate, from the same `bo.item` row, printed on the teacher card): it is the coach's SALARY RATE, not the ceiling — but `budgetMinor = ceiling × rate`; I propose masking it with the same key (the four fields above) — say "keep it visible" if the owner reads "ceiling/remaining" narrowly. (3) The `Viewer` threading (8 route lines, 8 service signatures) vs the alternative — a per-request context (AsyncLocalStorage) — I prefer the explicit parameter (fail closed by the type system); say if you want the context.

## DoD as I will run it
Suite count · tsc 0 · 49 = 49 · key 57 + labels + the 5 count pins · `maskBudget` by value (with · without · linked-with-all · null) · the builder by source (one writer of the four fields, viewer required) · the booleans survive by value · the two writes by value through the root app (budget-only ⇒ 403; both ⇒ pass) · the leak by value (three tokens) · nothing else masked by absence · break-and-watch in `try/finally` with sha-256 · @Fern's lines · report ×4.

**For @Fern (draft):** key 57 `action:teachers.budget-view` in `/api/me`'s `actions`; without it every teacher DTO reads `hourlyRate · budgetMinor · remainingMinor · reorderMinor = null` while `overLimit · setupIncomplete · limitOverride` stay — render "—" for a null figure, keep the not-bookable rule; the budget set/top-up buttons need BOTH `teachers.budget` and `teachers.budget-view` (the API refuses 403 otherwise); a linked (teacher) account always reads nulls.

⛔ Waiting on your confirm (the Viewer correction · ❓1 attention · ❓2 hourlyRate · ❓3 threading) before code.

---

# ✅ CONFIRMED — @Sober → @Jason (2026-09-21) — the correction + three answers; build
- **The Viewer correction — yes:** `attachFreelanceBudgets(dtos, viewer)` with the parameter REQUIRED and `null ⇒ masked`; the three readers thread it from `viewerOf(c)`. Explicit parameter, not a request context (❓3) — the type system is the fail-closed guard.
- **❓1 the attention line — yes as proposed:** the dashboard's `freelance_near_cap` label drops the number without the key (`<nickname> · ใกล้เต็มเพดาน`), the item stays; the LINE admin digest unchanged (admins only, no viewer).
- **❓2 `hourlyRate` — mask it with the same key.** A coach's salary rate is MORE sensitive than the ceiling, and the ceiling is derivable from it; the owner's "ceiling/remaining" is the figure he named, not the boundary. Flagged to Porter as included.
Key 57, no migration. **Go.**

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-21) — built as confirmed; key 57; no migration (49 = 49); 2670 pass / 0 fail; 16/16 mutations bite

**Numbers:** `bun test` **2670 pass / 0 fail**, 203 files (+1: `src/lib/budget-visibility-req102.test.ts`, 11 tests) · `tsc --noEmit` **0** · **49 = 49** · 6 pins moved (the key count 56 → 57 in five tests; the calendar route line + the guard line + the two `ROUTE_ACCESS` scans that now flatten a key LIST).

## What was built
- **`lib/budget-visibility.ts` — the ONE mask:** `BUDGET_VIEW_KEY = "action:teachers.budget-view"`; `Viewer = { isSuperAdmin, grants, teacherId? } | null`; `BUDGET_FIGURE_FIELDS = [hourlyRate, budgetMinor, remainingMinor, reorderMinor]` (the ONLY fields it touches); `canSeeBudget(viewer) = viewer && !isScoped && hasAction(viewer, key)`; `maskBudget(viewer, dto)` nulls the four in place, the booleans untouched, the shape unchanged; `viewerOf(c)` beside `actorOf`. By value: super admin ⇒ figures; staff with the key ⇒ figures; staff without · a LINKED account holding all 57 · `null` ⇒ nulls, `overLimit`/`setupIncomplete`/`limitOverride` identical in all five.
- **The ONE builder takes the viewer:** `attachFreelanceBudgets(dtos, viewer: Viewer)` — REQUIRED (the type refuses a caller without one); `maskBudget` runs on every DTO inside it. The three readers thread it: `getCalendar(input, viewer)` (the TASK-406 scope now derives from the same viewer — one object carries "whose column" and "may see the figures"), `getTeachers(opts, viewer)`, `loadTeacherFull(id, viewer)` ← the six writers each gained the parameter; 9 route lines pass `viewerOf(c)` (8 + `/attention`). Pinned by source: each of the four fields is written exactly ONCE in the service (inside the builder); the three call sites each pass `viewer`; the two bare-DTO returns carry no figures; no route hand-builds one.
- **The key (57):** `action:teachers.budget-view` — TH `ดูงบ/เพดานค่าจ้างครู` · EN `View teachers' freelance budget` — area teachers; nobody by default.
- **The two writes double-gated:** `RouteAccess.action` is now `ActionKey | readonly ActionKey[]`; `acts(menus, [k1, k2])` for `PUT /teachers/:id/budget` + `POST …/budget/topup` = `["action:teachers.budget", "action:teachers.budget-view"]`; the guard requires `every` listed key. By value through the root app: a staff with `teachers.budget` alone ⇒ 403 on both; with both ⇒ the service runs (and receives the viewer); a super admin passes. Only those two rows carry a list; no GET carries the view key (the mask is at the builder, not the door).
- **The leak, by value through the root app:** `GET /teachers` and `GET /calendar` for a linked token holding all 57 keys ⇒ nulls (booleans intact); an unlinked super admin ⇒ the figures; a staff without the key ⇒ nulls; with it ⇒ the figures.
- **The attention line (your ❓1):** the check emits `label` + `figureless` (`<nickname> · ใกล้เต็มเพดาน`); `getAttention(viewer)` swaps the figureless label in for a viewer without the key and strips the field either way; the LINE digest never calls the mask (pinned: two occurrences — the definition and `getAttention`). `hourlyRate` masked with the same key (your ❓2; mutation E — leaving it visible — bites).
- 🚫 **Nothing else masked** (by absence: the mask file names only the four fields; `mappers`/`coach-rate`/`sale-items`/`som-report` import nothing from it; the TASK-423/394/397 tests byte-identical). No migration.

## Break-and-watch — `mut426.mjs`, 16 mutations, **16 bite** (`try/finally`, sha-256 restore byte-identical)
A a linked account with the key sees the figures · B `null` viewer sees (fail open) · C the key ignored · D the mask nulls `overLimit` · E `hourlyRate` left visible · F the builder skips the mask · G `getTeachers` uses a super-admin viewer regardless · H the calendar too · I the top-up single-gated · J the guard checks the first key only · K the guard checks ANY key · L the key missing from the registry · M the dashboard keeps the number · N `getAttention` skips the mask · O the figureless label carries the number · P a route hands a super-admin viewer instead of the token's.

## Contract lines for @Fern (TASK-427) — final
- `/api/me`'s `actions` may carry `action:teachers.budget-view` (57 keys now; the checklist gains it under Teachers).
- Without it EVERY teacher DTO (calendar `columns[].teacher`, `GET /teachers`, the teacher card, the create/PATCH/archive/reactivate responses) reads `hourlyRate · budgetMinor · remainingMinor · reorderMinor = null`; `overLimit · setupIncomplete · limitOverride` stay — render "—" for a null figure and keep the not-bookable rule exactly as today. A linked (teacher) account always reads nulls.
- The budget set / top-up buttons need BOTH `action:teachers.budget` AND `action:teachers.budget-view` (the API answers 403 otherwise).
- `GET /attention`: the `freelance_near_cap` items read `<nickname> · ใกล้เต็มเพดาน` without the key (the same item shape; no new field).

⛔ Only you mark this DONE. ▶️ Next: whatever waits on the board (REQ-101's task, per your note).
