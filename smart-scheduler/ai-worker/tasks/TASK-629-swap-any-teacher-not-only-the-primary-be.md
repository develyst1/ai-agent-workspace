# TASK-629 — BE: **Swap must take ANY teacher off the session, not only the primary** (REQ-111 item E, back half)
**From @Sober to @Jason.** **Owner: "2 เริ่มได้เลย".** **Sizing and the full read: `SIZING-REQ-111-E-2026-10-02.md`.** **Pairs with `TASK-624` (FE).**
🔑 **Khwan's words, through the owner: *"swap ได้แค่ครูที่เป็น primary ค่ะ ต้องการให้เลือกคนอื่นได้ค่ะ"*.** ⇒ **This is a WIDENING of an existing control. 🚫 Not a new act.**

---

## 1. 🔑 The one fact that is the whole task — read it before you open the file
**A session stores its PRIMARY teacher in `bookings.teacher_id` (rate: `bookings.teacher_rate_minor`). Every OTHER teacher on that session is a row in `booking_teachers` (rate: that row's own `rate_minor`).**
⇒ 🔴 **"Primary" is not a flag on a list of people. It is a different storage location.** ⇒ **Taking the primary off is an UPDATE of a column. Taking a non-primary off is a DELETE and an INSERT on another table.**
📌 **That is why this is S and not XS, and it is the only reason.**

## 2. What to change
**`swapOtherSeriesTeacher`'s `from` may name the PRIMARY *or* an extra on the target row.**
🔴 **ONE branch, chosen by WHICH LOCATION `from` occupies, resolved ONCE before the row loop.** 🚫 **Never two ideas of "who is on this session"** — `teachersOfBooking` already answers that, and it is the only thing that may. **If you find yourself asking "is this the primary?" twice, stop and extract it.**
- **Primary path: unchanged.** 🚫 **Do not touch it to make room for the other one.**
- **Extra path: delete the out-teacher's `booking_teachers` row, insert the in-teacher's, rate on the NEW row.** 🔴 **Through `assertAdditionalTeacherFree` and `assertTeacherBookable` — not around them.**
- ⚠️ **Say in the code that the extra path's guarantee is WEAKER, because it is:** **`bookings_teacher_slot_uq` constrains `bookings.teacher_id` ONLY. A `booking_teachers` teacher is kept out of two places at once by an APPLICATION check two racing requests can both pass** — the existing comment says so; carry the warning to the new caller rather than let the next reader assume the database is holding it.
- ✅ **Every existing refusal survives: `ALREADY_ON_ROW`, `SLOT_TAKEN`, `RATE_REQUIRED`.** ✅ **Both scopes survive unchanged (`onDate` = this session · `fromDate` = from here on).**

## 3. The rate — **the lookup is already right; only the DESTINATION differs**
✅ **`seriesRateOf` already finds the INCOMING teacher's rate whether they held it as a primary or as an extra anywhere in the series, and `RATE_REQUIRED` already refuses rather than defaulting to the outgoing teacher's.** 🚫 **Do not add a second rate rule. I checked this rather than assumed it.**
🔴 **The incoming extra's rate goes on the incoming extra's OWN `booking_teachers` row.** 🚫 **A non-primary swap must NEVER write `bookings.teacher_rate_minor`** — *that re-rates a teacher nobody asked about.* **Pin that as an absence.**

## 4. The notice — **choose it, and say why**
⚠️ **Today the same human event sends TWO different message pairs: the swap path enqueues `teacher_unassigned` + `teacher_assigned`; add/remove enqueue `other_teacher_added` / `other_teacher_removed`.** 🔑 **Four kinds for "who is teaching this changed."**
▶️ **Your widened swap must send ONE pair, and you say in the code WHICH and WHY.** 🚫 **Do not send the add/remove pair merely because the extra path happens to write the add/remove tables** — *the message belongs to the ACT the admin performed, not to the table the act touched.* 📌 **The four-kind duplication itself is `TASK-614`, next round. Do not fix it here.**

## 5. ✅ Done means
1. **`tsc` clean · the DB-unreachable suite with COUNTS · migrations balanced.** 🔑 **Counts, never "green".**
2. **Mutations with the set NAMED and the set FILE left in the repo beside the test** — see my inbox note; an unnamed, unsaved mutation set is a claim nobody can re-run.
3. **Value tests: a non-primary swapped out on ONE session and from-here-on · the outgoing extra GONE from that row · the incoming extra present with their OWN rate · the primary's row and rate UNTOUCHED · the refusals.**
4. 🔴 **An absence pinned: no non-primary path writes `bookings.teacher_rate_minor`.**
5. **Tell me which notice pair you chose and the reason, in one line.**

## 6. 🚫 Not in this task
**The "from here on" rate inheritance (`TASK-625`, same round, separate verdict — 🚫 do NOT fold it in)** · **the four notification kinds (`TASK-614`)** · **the dialog title, which stops being true the day this ships** — 📋 **that copy is MINE and comes with the batch.**

## ✅ 2026-10-04 — @Jason: DONE — ONE branch, chosen once, and the two absences pinned
**`tsc` 0 · the DB-unreachable suite 3782 pass · 0 fail · 65 .sql = 65 journal tags — no migration, no new door, no access row.**
**Mutation set: `src/lib/swap-any-teacher-task629.mutations.json` — 14 / 14 BITE**, baseline 55, CHECKSUM identical, every restore byte-identical. **Test set it was run against (named in the file): `swap-any-teacher-task629.test.ts` · `other-series-req101.test.ts` · `cover-rate-key-task584.test.ts`.**

### The branch
- **`locationOf(row, teacherId) → "primary" | "extra" | "absent"`**, beside `extrasOf`, reading the row the series already loaded. **Asked ONCE** (`const onExtra = locationOf(targets[0], input.from) === "extra";`) **before the row loop** — the test counts the call sites and pins the order.
- ⚠️ **One deliberate departure from your note, and the reason:** you named `teachersOfBooking` as the only thing that may answer "who is on this session". **It cannot answer this one** — it returns ids and flattens the primary and the extras into a single list, which is exactly the distinction the task exists because of (and it is a second query where the row is already in hand). **`locationOf` is that single answer for LOCATION**, written in one place, and the comment says why it is not `teachersOfBooking`. 📌 **If you want it the other way, say so and I will move it — but the function would have to return the location.**
- **Rows after the first must AGREE:** a target where `from` sits somewhere else is **refused**, not silently handled the other way — a person who is primary on one date and an extra on another is a real shape, and doing both inside one call is how an admin loses track of what they changed.
- **Primary path: untouched** (same column write, same `reconcileBookingHolds`, same TASK-562 cover rate). Pinned as a regression test by value.
- **Extra path:** the outgoing extra's row DELETED (scoped to the row **and** the person), the incoming extra INSERTED **through `attachAdditionalTeachers`** — so `assertTeacherBookable` + `assertAdditionalTeacherFree` run, **not around them**. ✅ Proven by value: a clash fixture raises `SLOT_TAKEN` from the real guard and the insert never happens.
- ⚠️ **The weaker guarantee is written at the new caller:** `bookings_teacher_slot_uq` constrains `bookings.teacher_id` only; the extra's clash is an APPLICATION check **two racing requests can both pass**. The primary path's clash comes from the DATABASE (`23505`), the extra path's from a READ.

### The rate (§3) and the two absences (§5.4)
- **Lookup unchanged** — `seriesRateOf(rows, to)`; the destination is the incoming extra's OWN `booking_teachers` row. ✅ By value: T3's rate is found from a PAST row where T3 was an extra (35000), **not** the outgoing teacher's 40000.
- 🔴 **Pinned as absences:** the extra branch names neither `bookings.teacher_id` nor `teacher_rate_minor`, and **no `bookings` write happens at all** on that path (by value: the write list is empty for that table). **The `teacherRateMinor` write still exists in the PRIMARY branch, deliberately** — the claim is about which branch, not about the file.
- ⚠️ **ONE asymmetry I introduced on purpose: the extra path requires a rate in BOTH scopes (`RATE_REQUIRED`), where the primary from-here-on path requires none.** **Reason: a `booking_teachers` row with a NULL rate is an UNPAID teacher** — there is no existing column value to leave in place. 🚫 **Never the outgoing teacher's rate by default** (TASK-562's rule). ⚠️ **But see the boundary below: at the DOOR, `rateMinor` is refused unless `onDate`, so a from-here-on extra swap can only be priced from the series' memory — if there is none, the admin cannot supply one and is simply refused.** 📌 **I did NOT widen the validator: that is TASK-625's territory and your call.**

### The notice (§4) — one line, as asked
**`teacher_unassigned` + `teacher_assigned`, the SWAP's own pair, shared by both paths — because the message belongs to the ACT the admin performed, not to the table the act happened to touch.** The add/remove pair is a SERIES-shaped notice about joining or leaving a schedule; sending it would tell both coaches that a different thing happened than did. **Mutation E10 flips the pair on the extra path and BITES.**

### 🚫 Taken back out, deliberately
**I had the service return `{ moved, swapped: "primary" | "extra" }` and removed it:** two shipped tests assert that object exactly, and **widening a shipped response to say something the caller already knows (it chose `from`) is a contract change smuggled in beside a feature.** The branch is pinned by value in the test instead. 📌 **If @Fern wants it for TASK-624, that is a one-line add and a decision, not a side effect.**

### ⚠️ Two of my own checks were wrong first, and both are written into the test
1. **A refusal test passed on the WRONG refusal:** the fixture gave the incoming teacher no rate, so `RATE_REQUIRED` — also a 400 — was thrown before the loop ran, and `{ status: 400 }` could not tell it from the mixed-row refusal. **It now asserts the sentence.** 🔑 *A refusal test that does not name which refusal is a test of the status code.*
2. **Mutation E5 (delete EVERY extra on the row) SURVIVED the first version:** the harness recorded that a delete happened and nothing about WHO it named. **The harness now reads the condition's bound params, and a bystander extra on the same session is pinned as untouched.** 🔑 *A write assertion that does not read the WHERE is an assertion about the verb.*
