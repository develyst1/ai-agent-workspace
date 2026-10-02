# TASK-584 — the cover door checks the rate key — BE, XS ⚠️ **before TASK-581**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-30) · **Size XS.** Your own finding in TASK-579, ruled in.

## §0 The ruling
**`PATCH /other-series/:key/teacher` has no key-59 check, unlike every other rate writer** ⇒ **a no-59 admin can set a cover rate through the API; the UI only hides it.**
🔑 **This is NOT the owner's open question.** **His is whether such an admin may COVER a session — a product decision.** **Whether a permission is ENFORCED at its door is not** ⇒ **an unenforced key is a key that lies.**
⚖️ **Enforce it now. Relax by decision later if he says so** — 🔑 **enforce first and relax deliberately, never the reverse.**

## §1 Build
- **The rate guard on that door, the same one every other rate writer uses.** 🚫 **Not a new check — the existing one.** ⚠️ **If it cannot be the same one, say why in one line.**
- ✅ **Pin that the door refuses a rate without the key, AND that a cover WITHOUT a rate is unaffected** — 🔑 **do not let a permission fix become a functional change.**
- ⚠️ **Derive whether any OTHER door writes a rate without the key.** 🔑 **This one hid for a reason; if the reason was "nobody listed the rate writers", then list them.** ✅ **A derived list beats a fix.**
- ⚠️ **Say what a no-59 admin sees now** — **a 403 with a reason, not a bare refusal.**

## §2 Not in scope
🚫 The owner's question (may they cover at all) · 🚫 the FE (its box is already key-gated) · 🚫 `.strict()` on the body schema (a policy change).

## Definition of Done
- [ ] The existing guard on that door (or why not, in one line) · **both halves pinned: refused without the key · a rate-less cover unaffected** · 🔑 **every rate writer DERIVED and listed, with its guard named** · the 403 carries a reason · suite **count** normally **and DB-unreachable** · tsc · mutations incl. **the guard removed** and **a rate-less cover refused by mistake** · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-30): the cover door now checks key 59 with THE SAME guard · both halves pinned · **every rate writer DERIVED: 14, and the derivation found ONE MORE gap (camp day, reported, not fixed)** · **NO migration (65)** · **3645 / 0 normally and 3× DB-unreachable (0 failed queries)** · tsc 0 · **5 / 5 mutations bite**

## §1 The fix: the existing guard, one line
- `PATCH /other-series/:key/teacher` now calls **`assertMayEditCoachRate(c.req.valid("json"), viewerOf(c))`** before the service. That is the same call every other rate writer makes; nothing new.
- **What a no-59 admin sees now:** a cover WITH a rate ⇒ **`403 FORBIDDEN` "ไม่มีสิทธิ์แก้ค่าสอน"** (the same reason every other rate door gives); a cover WITHOUT a rate ⇒ unchanged.
  - A rate-less cover of a coach with no rate in the series is still `400 RATE_REQUIRED`, already worded.

## §2 ✅ Both halves pinned (`src/lib/cover-rate-key-task584.test.ts`, through the ROOT app)
- **Without key 59, with a rate:** 403 with the reason, and **the service is never reached**.
- **Without key 59, without a rate:** 200, and **the service receives the body exactly as sent**. A permission fix, not a functional change.
- **The key holder with a rate:** 200, service called with the rate.

## §3 🔑 Every rate writer, DERIVED (not listed from memory), pinned as an exact list
- **How:** every JSON body in `src/routes/*.ts` is read.
  - Its schema is walked **at every depth** (`validation.ts` schemas through zod; route-local schemas from their declaration).
  - A route is a rate writer if its body accepts a write-side rate field (`COACH_RATE_BODY_FIELDS`).
  - For each writer, the test records whether the handler calls the guard, **and whether the guard's own detector SEES each rate path.**
- **The derivation proves its own coverage:** it matched **all 100** JSON bodies. The first draft missed 16 (route-local schemas and one multi-line route), and this check caught it.

| route | rate field(s) | guard |
|---|---|---|
| POST /bookings | teacherRates | key 59 |
| PATCH /bookings/:id (Move session) | classRateMinor | key 59 |
| PATCH /bookings/:id/other | teacherRates | key 59 |
| POST /bookings/other-series | teacherRates | key 59 |
| POST /bookings/group-series | teacherRates | key 59 |
| POST /courses | duo.classRateMinor | key 59 |
| PATCH /courses/:id | classRateMinor | key 59 |
| PATCH /other-series/:key | teacherRates | key 59 |
| POST /other-series/:key/teachers | rateMinor | key 59 |
| **PATCH /other-series/:key/teacher (the cover)** | rateMinor | **key 59 ✅ (was NONE)** |
| PATCH /group-series/:key | teacherRates | key 59 |
| POST /group-series/:key/teachers | rateMinor | key 59 |
| PUT /teachers/:id/budget | rateMinor | **none, BY DESIGN**: key 57's freelance hourly rate under `teachers.budget`; TASK-434's own pin says it is NOT under the coach-rate check |
| **PATCH /camp/weeks/:id/days/:date** | teacherRates, **teachers[].rateMinor** | key 59 called, but 🔴 **it cannot SEE `teachers[].rateMinor`** |

## §4 🔴 FOUND by the derivation, NOT FIXED: the camp day's per-coach rate passes without key 59
- The camp-day route **does** call the guard, but the guard's detector (`bodyEditsCoachRate`) reads only top-level fields plus `duo`.
- TASK-454 later added **`teachers: [{ teacherId, …, rateMinor }]`** (each coach's own rate on a camp day), and `camp.updateWeekDay` writes it.
- ⇒ **A `menu:camp` user WITHOUT key 59 can set a coach's camp-day rate** with a body carrying only `teachers[].rateMinor`. This is the same kind of gap as the cover, one level deeper: *the guard was called, so nobody looked.*
- **Not fixed: the TASK asked for the list, and the fix is a guard change** (the shared detector serves all 13 guarded routes).
- **The fix is small, two options:**
  - teach `bodyEditsCoachRate` to see `teachers[].rateMinor` (≈1 line; every route benefits);
  - or add a camp-only check at that route.
- ⚠️ **Either way it changes what an existing no-59 camp user can save, so your word first.** The derived list pins it as **`UNSEEN teachers.[].rateMinor`**, so the fix will show up as a one-line list change.

## §5 Checks
- Suite: **3645 / 0** (3641 + 4 new). **DB-unreachable 3×: 3645 / 0, 0 "Failed query".** tsc 0. **65 .sql = 65 tags, no migration.**
- **Existing pins updated, only for this:** the count of `assertMayEditCoachRate(` in `api.ts` goes 11 → 12 (TASK-434's and TASK-431's pins), and `viewerOf(c)` goes 20 → 21 (TASK-431's budget pin).
- **Mutations with `bun run mutation:run`:** baseline 53, measured; CHECKSUM identical; every restore byte-identical:
  - **K1, the guard removed from the cover door:** BITES.
  - **K2, a rate-less cover refused by mistake:** BITES.
  - **K3, another writer's guard removed (add-a-teacher):** BITES (the derived list).
  - **K4, a NEW rate writer without the key (add dates takes a rate):** BITES (the derived list).
  - **K5, the refusal loses its reason (a bare 403):** BITES.
- 🚫 **Not touched:** the owner's question (whether they may cover at all), the FE, `.strict()`.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30) · 🔴 **and the derivation found a second, worse gap**
Verified by me: **3645 / 0** (and 3× unreachable) · tsc 0.

## ✅ The fix, and both halves pinned
**The SAME guard (`assertMayEditCoachRate`), one line.** **No key + a rate ⇒ 403 with a reason, the service never reached · no key + NO rate ⇒ 200, the body reaching the service unchanged.** ✅ **Pinned THROUGH THE ROOT APP**, which is what makes it a statement about the door rather than about a function.
🔑 **"A permission fix must not become a functional change" — and he proved the second half rather than asserting it.**

## ⭐ The derivation was the point, and it paid
**Every JSON body in all 100 routes, schemas walked AT EVERY DEPTH, pinned as an exact list: 14 rate writers. 12 have key 59.**
✅ **`PUT /teachers/:id/budget` has none BY DESIGN** (it is key 57's hourly rate, pinned by TASK-434) — 🔑 **that is the right kind of exception: named, with its own key and its own pin, not an absence.**
📌 **I asked for a derived list because "this one hid for a reason". The reason was that nobody had listed them — and the list immediately found another.**

## 🔴 The second gap — **worse than the first, and ruled: fix it**
**`PATCH /camp/weeks/:id/days/:date` CALLS the guard — but the guard's detector reads TOP-LEVEL fields only, so `teachers[].rateMinor` passes without key 59.**
🔑 **This is the same class one level deeper, and it is worse: the first door had no guard, so a reader could see that. This one HAS a guard, so a reader sees it and concludes the door is covered.** ⇒ ***A guard whose detector is shallower than the body it guards lies about its own coverage.*** **Recorded.**
⚖️ **Ruled: fix the detector — TASK-585, and it is not the owner's question either.** **He notes it "changes what a no-59 camp user can save": yes — it stops them setting coach pay, which is precisely what the key exists for.**
⚠️ **The one caveat, and it is a STOP not an exception:** **if some real camp workflow depends on a no-59 user setting coach rates, that IS a product question** ⇒ **STOP and report it. 🚫 Do not carve an exception to keep a workflow alive.**
✅ **Marking it `UNSEEN` in the list rather than quietly fixing it was right.**
