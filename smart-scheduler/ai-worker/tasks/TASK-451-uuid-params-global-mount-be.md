# TASK-451 — the uuid-param guard goes GLOBAL (`/api/*`): fixtures first, then the one-character mount — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-23) · **Size S.** No migration. Follows TASK-450 (the guard exists and is mounted on `/api/camp/*` only).

## §0 Why
Every non-camp route is one typo away from the same `22P02`/500 that TASK-450 fixed for camp (a FE guard that passes the STRING `"undefined"` is not exotic — it already happened). The guard is written, pure and pinned; only its mount is narrow, because ~21 existing tests call the root app with fixture ids like `"b1"` / `"s1"`.

## §1 Build, in this order
1. **Fixtures first:** the failing tests get real uuids (a tiny helper — `uuidFor("b1")`, deterministic, so a fixture's identity stays readable in the test) rather than the guard being loosened. **Do not weaken the guard to fit a fixture** — the fixture is the thing that is wrong.
2. **Then the mount:** `/api/*`, still AFTER `accessGuard` (a 403 must beat a 400 — TASK-450's rule, pinned).
3. The param-name census stays the pin: `date · id · key · teacherId` are the only param names in the API; `:key` and `:date` are excluded BY NAME, and a new param name that is neither a uuid nor on the exclusion list fails the suite (so the next route cannot quietly add a fifth shape).
- 🚫 No route-by-route exceptions; no change to what the guard decides; no new fixture library beyond the one helper.

## Definition of Done
- [ ] Every suite green with real uuids (say how many files moved) · the global mount by value through the root app (a malformed id on a non-camp route ⇒ 400, the service never called; a 403 still wins for a caller without the key) · the census pin · suite **count** · tsc 0 · 53 = 53 · 🔑 Break-and-watch, `finally`, CHECKSUM — **and the count-vs-baseline check from your TASK-450 finding** · report here + `inbox/SA.md` + log.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-23) — fixtures first (14 files), then the one-character mount; 2833 pass / 0 fail; 10/10 mutations bite

**Numbers:** `bun test` **2833 pass / 0 fail**, 219 files (+1: `src/lib/uuid-param-global-req105.test.ts`, 6 tests) · `tsc --noEmit` **0** · 53 = 53 (no migration) · **14 test files moved to real uuids** + 2 pins re-aimed (TASK-450's mount pin; `rbac-stage1`'s path strings).

## §1 The fixtures — 14 files, and not one loosened rule
`src/lib/test-uuid.ts`: **`uuidFor(seed)`** — sha-256 of the seed, formatted uuid-v4-shaped, cached, deterministic. The point is that a fixture keeps its NAME: `DELETE /students/${uuidFor("gone")}` still says which student the case is about, and the spy that answers it compares `id === uuidFor("gone")` — **one fact, not two spellings.** 🚫 Marked "not for product code" in its own header (and pinned): nothing here is unpredictable, which is exactly what a fixture wants and exactly what a real identifier must never be.
**Moved (14):** `archive-student-req093` · `booking-rental-row-req091` · `coach-rate-everywhere-req102-8` · `coach-rate-visibility-req102-6` · `course-rental-round2-req091-14` · `duo-course-req095-13` · `group-session-req095-2a` · `other-schedule-req095` · `rbac-stage1-users-req092` · `rbac-stage2-menu-guard-req092` · `rbac-stage3-actions-req092` · `rbac-stage4-roles-req092` · `routes/delete-student-req089.route` · (+ TASK-450's own mount pin re-aimed).
Done in two mechanical passes with a **dry run first** (the plan printed every seed per file before anything was written): pass 1 the ids inside API paths, pass 2 the same seeds as VALUES (`id === "b-1"`, `toEqual([["b-1", …]])`). Two false positives caught in the dry run and excluded by name — `/students/eligible` and `/courses/preview` are ROUTES, not ids; `rbac-stage1`'s `"taken"` is a USERNAME, and that file's ids were hand-moved for exactly that reason. **The guard was not weakened anywhere** (a mutation that loosens it bites).

## §2 The mount
`app.use("/api/*", uuidParamGuard)` — still **after** `authMiddleware` and `accessGuard`, pinned by source AND by value: a caller with no menu/action gets **403** on `DELETE /students/undefined`, a super admin gets **400** on the same URL, and the service is called in neither case. By value on non-camp routes: `DELETE /students/undefined` · `PATCH /courses/undefined` · `GET /entitlements/undefined/plan` · `PATCH /courses/null` · `DELETE /students/b1` ⇒ **400** each, zero service calls; a real uuid still goes through. `:teacherId` is guarded (`DELETE /other-series/<uuid>/teachers/nope` ⇒ 400); `:key` still takes a settings key (`PUT /settings/camp_reminder_enabled` ⇒ 200).

## §3 The census pin
`date · id · key · teacherId` are the only param names in `ROUTE_ACCESS`; `id`/`teacherId` are the guarded ones and `date`/`key` are excluded **by name**, both halves asserted. A fifth shape (`:code`, `:slug`, `:token`, `:phone`…) fails the suite — the next route cannot add one without a decision.

## Break-and-watch — `mut451.mjs`, 10 mutations, **10 bite** (`try/finally`, sha-256 restore byte-identical)
A the mount back to camp-only · B unmounted · C mounted before the access guard · D `undefined` passes again · E `:teacherId` unguarded · F `:key` forced to a uuid · G refuses after the handler ran · H `uuidFor` non-deterministic · I not uuid-shaped · J every seed collapses to one id.
🔑 **Run with the count-vs-baseline check from TASK-450** (`BASELINE=44`): the harness now bites on *fewer tests than the clean run* as well as on failures, so a mutation that makes a file fail to LOAD can no longer read as a pass. Every mutation here was judged against 44.

⛔ Only you mark this DONE. 📌 Nothing waits on the human: no migration, no deploy line, no env.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-23)
Re-run by me: **2833 pass / 0 fail** · tsc 0 · 53 = 53 · `app.use("/api/*", uuidParamGuard)` sits directly AFTER `accessGuard` in `index.ts:61` (403 beats 400, by value both ways) · `lib/test-uuid.ts` present. The fixture move was done the right way round — a dry run printing every seed BEFORE writing, paths then values, two false positives (`/students/eligible` and `/courses/preview` are routes; `rbac-stage1`'s `"taken"` is a username) caught by that dry run and excluded by name rather than by a loosened guard. The census pin (four param names, both halves) is what keeps the next route from adding a fifth shape quietly. Run with `BASELINE=44` — the first task to carry the TASK-450 harness rule.
