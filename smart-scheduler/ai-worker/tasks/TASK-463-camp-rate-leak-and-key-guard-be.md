# TASK-463 — 🔴 DEF-3 (HIGH, coach-pay LEAK): a `menu:camp` user without key 59 reads every coach's `rateMinor` on camp days — TASK-454's new field never joined the read mask · DEF-2: `/group-series/:key` and `/other-series/:key` still 500 on a malformed key — BE, S–M

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-24) · **Size S–M.** No migration. **`uat` is held until DEF-3 is fixed and re-tested** (the owner chose a full Tanya pass first).

## §0 Tanya's findings (TEST-067 C/E/F/G, via Porter)
- **DEF-3 (HIGH):** a user with `menu:camp` but **without key 59** gets every coach's pay on a camp day. The WRITE side is guarded; the **READ** leaks.
- **DEF-2 (minor):** `GET /api/group-series/:key` and `/api/other-series/:key` answer **500** on a malformed key.

## §1 The cause of each — read, so you can go straight at it (correct me where I am wrong)
1. **DEF-3.** The read mask names three keys — `COACH_RATE_KEYS = ["rate", "classRateMinor", "teacherRates"]` (`lib/coach-rate-visibility.ts:22`) — and the WRITE check names four, including `rateMinor` (`:42`). **TASK-454 added a fourth read surface, `campDayTeachers()` → `teachers[].rateMinor` (`camp.service.ts:148–151`), and nothing added it to the mask.** ⚠️ Worse for us: TASK-434 pinned *"no DTO carries `rateMinor`"* **by absence** — and TASK-454 made that false without the pin noticing. Find out why it did not fire (was it scoped to the teacher DTO? removed? never reaching the camp mapper?) and **say so in your report** — a pin that silently stops covering the thing it was written for is the more dangerous half of this defect.
2. **DEF-2.** `middleware/uuid-params.ts` requires a uuid for `:id`/`:somethingId` and **excludes `:key` and `:date` BY NAME** — because `:key` was a settings key. The series routes then named a uuid `:key` too, so the guard skips exactly the params that are uuids, and a malformed one reaches Postgres ⇒ `22P02` ⇒ 500. **An exclusion by NAME is a bet that no future route uses that name differently, and we lost that bet inside two weeks.**

## §2 Build
- **DEF-3:** add `rateMinor` to the READ mask so the two lists agree, and then **make them one thing** — the read keys and the body fields should be derived from a single declared set of "this is a coach-rate field", with the difference (if any is genuinely needed) stated in one place rather than living in two hand-kept arrays.
- 🔑 **The pin that actually matters, and it is the deliverable:** a walk that fails when **any DTO-producing surface** emits a field whose name looks like a coach rate (`rate`, `rateMinor`, `classRateMinor`, `teacherRates`, `*RateMinor`) and that field is not in the mask's set. Name the reasoning in the test: **the next new rate field must fail this suite on the day it is written, not on the day a customer's staff reads someone's pay.** Include the camp `teachers[]` shape by value — with key 59 and without — through the root app, as the TASK-434 tests do for the other three.
- **DEF-2:** stop excluding by NAME. The honest shape: the guard requires a uuid for every param **except where a route declares otherwise** — the settings route's `:key` is free-form, everything else is not. Your call on the mechanism (a per-route opt-out list, renaming the series param, or deciding by the route pattern), but say which and why, and pin that `/other-series/undefined` and `/group-series/undefined` answer **400** with the service never called — and that `/settings/:key` still takes a settings key.
- 🚫 No change to what any of these routes DO once the value is valid; no schema change.

## §3 Report
- Why TASK-434's by-absence pin stopped covering `rateMinor` (§1.1).
- Whether **any other** rate-bearing field is unmasked today — the walk answers this; name what it found.
- ⚠️ From Porter: `som-back` is **ONE process under PM2 (fork mode)**, PM2 restarts on exit. So TASK-460's per-chat queue IS the whole story on that box — say it in the file so the next reader does not re-open the question, and note that `exit(1)` there means "restarted by PM2", not "down".

## Definition of Done
- [ ] DEF-3 fixed and pinned by value (camp `teachers[].rateMinor` masked without key 59, present with it; the other three unchanged) · the two lists unified · **the walk pin, failing on today's tree before the fix — say so** · DEF-2 by value (both series readers 400, `/settings/:key` untouched) · the by-absence pin explained · suite **count** · tsc 0 · 56 = 56 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-24) — DEF-3 closed by ONE declared set + a layout-proof walk · DEF-2 decided by ROUTE; 2955 pass / 0 fail; 8/8 mutations bite

**Numbers:** `bun test` **2955 pass / 0 fail**, 228 files (+1: `src/lib/coach-rate-walk-req105.test.ts`, 11 tests) · `tsc --noEmit` **0** · 🚫 no migration (56 = 56) · 6 pins moved, two of them because their PREMISE was the defect (named below).

## §1 Why TASK-434's by-absence pin went blind — the more dangerous half, as asked
It was `/^\s*rateMinor:\s…/m` — **`rateMinor:` at the START of a line.** TASK-454's camp producer (`camp.service.ts:151`) is a **one-line object literal**: `.map((t) => ({ teacherId: …, startTime: …, endTime: …, rateMinor: t.rateMinor ?? 0 }))` — the key sits in the MIDDLE of its line, so the regex walked straight past it. 🔑 **The pin checked how the code was LAID OUT, not what the API emits.** It was never removed and never scoped away; it simply stopped matching the moment somebody wrote the same thing on one line. That is the week's family again (TASK-450's file that stopped loading · TASK-458's source-literal pin · TASK-460's mutation Q): pin the EFFECT, never the shape of a line. The new walk proves the point on the very line that leaked: TASK-434's regex returns `false` on it, the walk returns `rateMinor`.
📌 **A second pin carried the defect's PREMISE**, and I corrected it too: TASK-431's mask test asserted that "a `rateMinor` on a non-rate object" stays unmasked. There is no such object in any response — the only other `rateMinor` in `src` is the **dormant** `freelance_budgets` column (TASK-024) that no route reads, and key 57's response figure is `hourlyRate`, which stays untouched.

## §2 The walk FAILED on today's tree before the fix — what it said
Run against the unfixed code (a scratch copy of the suite, deleted afterwards), it named **two** unclassified rate-shaped keys, not one:
- **`rateMinor`** — the leak (schema · ops-client · camp · other-series · scheduler · validation), and the by-value test reproduced DEF-3 exactly: **`60000` / `45000` returned to a user without key 59.**
- **`teacherRateMinor`** — the `bookings` column for the PRIMARY coach's rate. **No DTO emits it today** (every mapper folds it into `rate` / `teacherRates`), so it is not a live leak — but a raw row returned by any future reader would carry it, and the old mask would have waved it through. It is now masked by NAME, before anyone writes that reader.
That answers §3's "is anything else unmasked?": **nothing else leaks today; one more name was one careless reader away from it.**

## §3 What was built
- **ONE declared set** — `COACH_RATE_FIELDS = ["rate", "classRateMinor", "teacherRates", "rateMinor", "teacherRateMinor"]` (`coach-rate-visibility.ts`). The READ mask IS the set (`COACH_RATE_KEYS = COACH_RATE_FIELDS`, pinned by identity, not equality). The WRITE fields are the set minus the READ-ONLY names, and that difference is **stated once, beside the set**: `rate` is a computed `{ effective, override, default }` object nobody sends, `teacherRateMinor` is a raw column no body accepts. No second hand-kept array exists any more (mutation C splits them again — bites).
- 🔑 **The walk — the deliverable.** It finds every rate-shaped key (`name:` / `name?:`, **anywhere on a line**) in all of `src`, and every one must be either in the set or in `NOT_A_COACH_RATE` **with its reason** (`hourlyRate` = key 57's figure · `rates` = a local variable name, never a response key · `migrate` = the pattern's own false positive, listed so the list is honest). Adding a name there is a decision a reviewer reads; forgetting one is a failing test. **Mutation E adds a brand-new `coachRateMinor` to the camp producer — the suite fails that day.** Guard-on-the-guard: invented names are unclassified, and **every allow-list entry must still occur in `src`** (a stale exemption is how an allow-list becomes a blind spot).
- **DEF-3 by value, through the ROOT app** (`GET /api/camp/weeks/:id/days`, fed by the REAL `campDayTeachers` output so the names are the producer's, not the test's): without key 59 every `teachers[].rateMinor` is `null` while the coach, the hours and the day survive; `teacherRates` still null; with key 59 both come back unchanged.
- **DEF-2 — the guard decides by ROUTE.** `FREE_FORM_PARAMS` lists the only non-uuid params by full route pattern, each with its reason: `/api/settings/:key` (a settings key) · `/api/camp/weeks/:id/days/:date` (a business date) · `/api/calendar/:file` (mounted before the guard; declared so the map is the COMPLETE list). **Every other param is a uuid, and an undeclared one fails closed (400)** — the safe and visible direction. ⚖️ Why not the other two options: renaming the series param to `:seriesId` fixes today's route and leaves the NAME bet in place for the next one; a per-route opt-out list keyed by name is the same bet one level down. By value: `/api/other-series/undefined` and `/api/group-series/undefined` answer **400 with the service never called**, a real series key still reaches it, and `DELETE /api/settings/checkin_early_minutes` still resets that setting.
- 📌 **Porter's answer, written where the next reader meets it:** `som-back` is ONE process under PM2 fork mode — in the per-chat queue's docstring ("this queue IS the whole story on that box; do not re-open unless the deploy changes") and beside the `uncaughtException` handler ("`exit(1)` there means restarted by PM2, not down").

## Break-and-watch — `mut463.mjs`, 8 mutations, **8 bite** (`try/finally`, sha-256 restore byte-identical, `BASELINE=39`)
A 🔴 DEF-3 restored (`rateMinor` leaves the set) · B `teacherRateMinor` leaves the set · C the two lists split again · D the write side loses `rateMinor` · E 🔴 **a NEW rate field (`coachRateMinor`) appears — caught the day it is written** · F 🔴 DEF-2 restored (skip by NAME) · G the settings route loses its declaration · H an undeclared param is let through.

## 📦 For the re-test (Tanya, via Porter)
TEST-067 C/E/F/G: a `menu:camp` user **without** key 59 sees every camp coach's `rateMinor` as empty (and the per-day rate map too); **with** 59, unchanged. `/api/other-series/<garbage>` and `/api/group-series/<garbage>` ⇒ **400**, never 500; the Settings screen still saves and resets every setting. 🚫 Nothing to migrate. ⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-24)
Re-run by me: **2955 pass / 0 fail** · tsc 0 · 56 = 56 · `COACH_RATE_KEYS = COACH_RATE_FIELDS` (one set, by identity) · `FREE_FORM_PARAMS` declared per route.
**§1 is the answer I asked for, and it is worse than I guessed in the useful way.** TASK-434's by-absence pin anchored `rateMinor:` to the START of a line, and TASK-454's camp producer writes that key in the MIDDLE of a one-line object literal — so the regex walked past it. The pin was never removed and never scoped away; **it checked how the code was laid out, not what the API emits**, and it stopped matching the day somebody wrote the same thing on one line. Fourth time this week for that family (TASK-450's file that stopped loading · 458's source-literal pin · 460's mutation Q): *pin the effect, never the shape of a line.* He proved it on the leaking line itself — the old regex says `false`, the new walk says `rateMinor`.
Four more things I am keeping:
1. **The walk found a SECOND name:** `teacherRateMinor`, the raw column for the primary coach's rate. No DTO emits it today, so it was not a live leak — but any future "just return the row" reader would have carried it straight past the mask. Masked now, **before** that reader exists: the difference between fixing a leak and fixing the reason leaks happen.
2. 🔴 **He corrected a pin that carried the defect's PREMISE** — TASK-431's mask test asserted a `rateMinor` on a "non-rate object" stays unmasked, and no such object exists in any response, so that pin was quietly defending the hole. Removing a wrong assertion is harder than adding a right one.
3. **DEF-2 decided by ROUTE, with both alternatives argued and rejected for the same reason** — renaming the param or an opt-out keyed by name leaves the NAME bet in place one level down. Undeclared params fail closed at 400, and `/api/calendar/:file` is declared **though it is mounted before the guard**, so the map is complete rather than merely sufficient.
4. **Every allow-list entry carries its reason and a stale one fails the suite** — an exemption nobody can justify is how an allow-list becomes a blind spot.
**Ready for Tanya's re-test** (§📦). `uat` stays held until she passes it.
