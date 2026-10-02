# TASK-579 — a rate may be set AS a coach joins the row — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-30) · **Size S.** ⏸️ **Queued behind TASK-578.** @Fern's §4 in TASK-577, ruled **(c)**.

## §0 The loop, and why (c)
**Swap offers coaches NOT on the row · `assertRatesOnBooking` allows a rate only for a coach ALREADY on the row · the save REQUIRES a rate.** ⇒ 🔑 **the coaches the door offers are exactly the coaches who cannot yet have a rate — Khwan's case could never have worked.**
⚖️ **Ruled (c): the ordering assumption is the cause, not a business rule.** **In a cover, the assignment and the rate arrive in the SAME act** ⇒ **a rate may be set for the coach being put on the row, in that act.**
🚫 **Not (b)** — accepting a rate-less cover would pay the COVERED coach's rate by default, which the owner explicitly ruled against.

## §1 Build
- **`assertRatesOnBooking` must accept a rate for the coach this act is ADDING** — 🔑 **only that coach, only in that act.** 🚫 **It must still refuse a rate for anyone not on the row and not being added.** ✅ **Pin both halves.**
- ⚠️ **Name every caller of that guard** and say what changes for each. 🔑 **A guard loosened for one door is loosened for all of them unless the loosening is scoped to the act.**
- ✅ **And fix @Fern's finding (5) on your side if it is yours:** **a body wider than its type** — 🔑 *the compiler cannot object to a field it was never told about.* **Say whether the server's schema names every field the door sends.**

## §2 ⛔ What this does NOT decide — it is with the owner
**May an admin WITHOUT the rate permission (key 59) perform a cover at all?** 🚫 **Do not answer it in code.**
⚠️ **Build (c) so that EITHER answer is a small change:** **if the owner says no, the door refuses with a reason; if yes, we will need a rule for whose rate.** 📌 **Today such an admin simply sees no box — pre-existing, not hidden, and not a fix.**

## §3 Not in scope
🚫 The permission question · 🚫 the FE label (held until the owner answers) · 🚫 the from-date swap rate defect (raised, out of scope).

## Definition of Done
- [ ] A rate accepted for the coach being ADDED, **in that act only** · 🚫 still refused for anyone else, **both halves pinned** · **every caller of the guard named with what changes** · the body-vs-type question answered for the server side · ⛔ **the permission question untouched, and either answer left a small change** · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · mutations incl. **a rate accepted for a coach not being added** · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-30): (c) ALREADY HOLDS on the server, so NO production change; both halves now PINNED · the guard NOT loosened (5 callers named, none changed) · 🔴 **a key-59 GAP found on the cover door (mine, from TASK-562), NOT fixed: it touches the owner's question** · **NO migration (65)** · **3641 / 0 normally and DB-unreachable (0 failed queries)** · tsc 0 · **6 / 6 mutations bite**

## §1 🔑 The premise, checked against the server: the rate ALREADY arrives in the same act
- **The cover door already takes a rate for the coach it puts on the row, in that act only** (TASK-562):
  - `PATCH /other-series/:key/teacher` with `onDate` + `rateMinor` → `swapOtherSeriesTeacher` writes `{ teacherId: to, teacherRateMinor: rate }` on that ONE row. Given rate, else `to`'s own rate in the series, else `400 RATE_REQUIRED` (never the covered coach's).
  - **Move session** (`PATCH /bookings/:id` with a new teacher + `classRateMinor` on a series row) does the same.
  - **Neither calls `assertRatesOnBooking`**, so the guard never stood between a fresh coach and their rate.
- **So the loop was the FE's alone:** the door never sent `rateMinor`. @Fern fixed that in TASK-577. This matches Tanya's *"API cover ✅"*.
- **The `400` in Fern's table is the HEADER PATCH** (`updateOtherSeries`, the series' rate list). That act adds no coach, so refusing a rate for someone not on the row is correct there.
- ⇒ **Loosening the guard would have loosened five doors to fix none.** I made no production change. The ruling is now pinned instead.

## §2 ✅ Both halves pinned (`src/lib/other-series-req101.test.ts`, the TASK-579 block, +4 tests)
- **Half 1:** a FRESH coach (on no row, with no rate anywhere in the series: Khwan's case) is covered with the given rate. It lands on the one row, paired with that coach, pinned by value.
- **Half 2, the act cannot name anyone else's rate:**
  - the swap schema carries ONE number, not a map;
  - a stray `teacherRates` / `rates` map in the body is **stripped** (pinned by value: the parsed body is exactly the four fields);
  - `rateMinor` without `onDate` is refused;
  - the service's one rate write is paired with `input.to`, and it is the only rate word in the function (counted).
- **Half 2, still refused for anyone not on the row and not being added:** the unchanged guard, by value.

## §3 ⚠️ Every caller of `assertRatesOnBooking`, and what changes: NOTHING (pinned by source, exact text)
| caller | coaches it checks | adds a coach? |
|---|---|---|
| `createBooking` | `[input.teacherId, ...additionalTeacherIds]` | yes, and those are exactly the ones checked |
| `editOtherBooking` | `[current.teacherId, ...extras]` | no |
| `createOtherSeries` | `[input.teacherId, ...additionalTeacherIds]` | yes, and those are exactly the ones checked |
| `createGroupSeries` | `[input.teacherId, ...additionalTeacherIds]` | yes, and those are exactly the ones checked |
| `updateOtherSeries` (header PATCH) | the template row's `[teacherId, ...extras]` | no (Tanya's refusal: correct) |
- **Every caller is already scoped to its own act.** The add-a-teacher act (`addTeacherToOtherSeries`) takes `rateMinor` for the teacher it adds only (pinned since TASK-562).

## §4 Body vs type, server side
- **The server's schema names every field the door sends.** `otherSeriesSwap` = `{ from, to, fromDate?, onDate?, rateMinor? }`; the door sends `{ from, onDate, rateMinor, to }`.
- **A body WIDER than the schema is stripped silently, not refused** (zod's default). Pinned, so a widening shows up.
- Making it refuse (`.strict()`) would be a policy for every schema, so I didn't make that change. Say if you want it.

## §5 🔴 FOUND, NOT FIXED: the cover door has NO key-59 check (mine, from TASK-562)
- **Fern's §4 premise, *"the server answers 403 for a rate sent without key 59"*, is FALSE on this route.**
  - `POST /other-series/:key/teachers` has `assertMayEditCoachRate`, and so does every other rate writer (11 routes plus camp, including Move session's `classRateMinor`).
  - **`PATCH /other-series/:key/teacher` does not.**
  - ⇒ **Today, through the API, an admin WITHOUT key 59 CAN set a cover rate.** The screen hides the box (`withoutRates`), so it is not reachable from the UI, but the server does not enforce it.
- **Not fixed, because §2 keeps the permission question with the owner** and a guard here changes what a no-59 admin can do.
- **Either answer is one line in that route:**
  - **Rate guard only** (the TASK-434 rule every other writer follows): `assertMayEditCoachRate(c.req.valid("json"), viewerOf(c));`. A no-59 admin can then cover only a coach who already has a rate in the series, and gets `400 RATE_REQUIRED` otherwise (already worded).
  - **Owner says NO:** refuse the cover act with a reason when `onDate` is sent without key 59: `if (body.onDate && !canSeeCoachRate(viewerOf(c))) throw new ApiException(403, "FORBIDDEN", "…")`, with DRAFT wording.
  - **Owner says YES:** the server already accepts it. The only missing piece is the rule for whose rate a no-59 admin's cover pays.
- 📌 **My recommendation:** add the rate guard now whichever way the owner answers, because a rate typed by someone without key 59 is refused on every other door. **Waiting for your word, since it touches the owner's question.**

## §6 Checks
- Suite: **3641 / 0** (3637 + 4). **DB-unreachable: 3641 / 0, 0 "Failed query".** tsc 0. **65 .sql = 65 tags, no migration.**
- **Mutations with `bun run mutation:run`:** baseline 40, measured; CHECKSUM identical; every restore byte-identical:
  - **G1, a rate accepted for a coach not being added (the shared guard loosened):** BITES.
  - **G2, a rate accepted for a coach not being added (the swap schema widened to a map):** BITES.
  - **G3, a caller widened (the header PATCH lets any named coach through):** BITES.
  - **C1, the given rate ignored (Khwan's loop back):** BITES.
  - **C2, the covered coach's rate paid to the joining coach:** BITES.
  - **C3, the cover rate allowed over a from-date scope:** BITES.
- 🚫 **Not in scope, untouched:** the permission question, the FE label, and the from-date swap rate defect.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30) · 🔴 **and his finding changes my escalation**
Verified by me: **3641 / 0** (and 3× unreachable) · tsc 0.

## ✅ (c) already held — the loop was the FE's alone
**The cover act takes `rateMinor` for the coach it puts on the row, in that act only (TASK-562, and Move session too), and never goes through `assertRatesOnBooking`.**
✅ **So there was nothing to loosen.** ⚠️ **And he corrected a detail in @Fern's table: the 400 she saw was the HEADER PATCH, which adds no coach ⇒ that refusal is right.**
✅ **Both halves pinned, all five callers named and each already scoped to the coaches its own act adds, pinned by exact source.** 🔑 **"The guard is NOT loosened" is the answer I wanted, and it is stated as a fact about five callers rather than an assurance.**
✅ **Body vs type: the schema names every field the door sends, pinned.** ⚖️ **Leaving `.strict()` alone is right — that is a policy change, not this task** — 📌 **but note what the pin is actually protecting: a wider body is stripped SILENTLY, which is exactly how @Fern's `onDate` could have vanished.**

## 🔴 His finding — **ruled: add the guard NOW, and it is not the owner's question**
**`PATCH /other-series/:key/teacher` has NO key-59 check, unlike every other rate writer** ⇒ **a no-59 admin can set a cover rate through the API. The UI merely hides it.**
🔑 **This is not what the owner was asked.** **His question is whether such an admin may COVER A SESSION — a product decision. Whether a permission is ENFORCED at the door is not a product decision; it is whether that permission means anything at all.** ⇒ **An unenforced key is a key that lies.**
⚖️ **Add it now.** ✅ **Either owner answer stays a one-line change: if he says such admins may cover, we scope or lift the guard deliberately; if he says no, the guard is already correct.** 🔑 **The safe direction is to enforce first and relax by decision, never the reverse.**
📌 **And I owe @Porter a correction: I told him "the screen may not send a rate and the server will not save without one." The second half is true; the FIRST half was the UI hiding a box, not the server refusing.** ⇒ **Sent up.**
