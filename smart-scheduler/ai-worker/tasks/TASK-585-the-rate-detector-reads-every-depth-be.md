# TASK-585 — the rate detector reads every depth — BE, XS/S ⚠️ **before TASK-581**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-30) · Your `UNSEEN` finding in TASK-584, ruled in.

## §0 The ruling
**`PATCH /camp/weeks/:id/days/:date` calls the guard, but the detector reads TOP-LEVEL fields only ⇒ `teachers[].rateMinor` passes without key 59.**
🔑 **Worse than TASK-584's door: that one had no guard, so a reader could SEE that. This one HAS a guard, so a reader sees it and concludes the door is covered.** ⇒ ***A guard whose detector is shallower than the body it guards lies about its own coverage.***
⚖️ **Not the owner's question, for the same reason as TASK-584: this is whether key 59 means anything, not who may do what.**

## §1 Build
- **The detector reads a rate at ANY depth.** 🔑 **Derive the shape from the SCHEMAS, not from a list of known nestings** — *a hand-written list of places to look is the same defect with more lines.*
- ✅ **Pin it against the real bodies of all 14 writers** — **each one detected, and each non-rate body NOT detected.** 🔑 **The false-positive half is the one that gets a guard switched off.**
- ⚠️ **Say what it now refuses that it used to allow, per door.** 🔴 **If a REAL camp workflow depends on a no-59 user setting coach pay, STOP and report it** — 🚫 **do not carve an exception to keep a workflow alive.** *That would be a product decision, and it is the owner's.*
- ⚠️ **And say whether the detector is used anywhere other than this guard.**

## §2 Not in scope
🚫 Who may cover a session (with the owner) · 🚫 `PUT /teachers/:id/budget` (key 57 by design, pinned) · 🚫 widening any other permission.

## Definition of Done
- [ ] Rates detected at any depth, **derived from the schemas** · pinned against **all 14 writers' real bodies, both directions** · **what each door now refuses that it did not, stated** · 🔴 **a legitimate workflow broken ⇒ STOP and report, no exception carved** · other users of the detector named · suite **count** normally **and DB-unreachable** · tsc · mutations incl. **the detector shallow again** and **a non-rate body detected** · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-30): the detector reads a rate at ANY depth · pinned against EVERY schema path (derived) and the 14 writers' real bodies, both directions · **ONE door refuses something new: the camp day's `teachers[].rateMinor` without key 59** · **no real workflow broken (no STOP)** · **NO migration (65)** · **3648 / 0 normally and 3× DB-unreachable (0 failed queries)** · tsc 0 · **5 / 5 mutations bite**

## §1 The fix: the detector knows NO shape
- `bodyEditsCoachRate` now walks **every object and every array** in the body and answers true if a write-side rate field (`COACH_RATE_BODY_FIELDS`, by name) is present **anywhere**.
  - The `duo` special case is gone. It is covered by the walk: `duo` alone is not an edit, `duo.classRateMinor` is.
  - *No list of places to look*, so a new nesting cannot hide from it.
- **"Derived from the schemas" is where it is PROVEN:**
  - the test walks every `validation.ts` body schema at every depth (TASK-584's derivation);
  - for **every path of every schema**, it builds a body at that path;
  - it asserts **detected ⇔ the path's leaf is a rate field.**
  - The sweep is checked not to be vacuous: ≥15 rate paths, >300 non-rate paths, and at least one NESTED rate.

## §2 ✅ Pinned both directions
- **The derived sweep:** 0 wrong answers, in either direction, over every path of every body schema. **This is the false-positive half.**
- **The 14 writers' REAL bodies**, each with and without its rate: with ⇒ detected, without ⇒ NOT. Examples of the without-rate bodies:
  - the camp roster with windows;
  - `duo` without a rate;
  - a cover without a rate;
  - a header rename.
- **The camp door THROUGH THE ROOT APP**, as a no-59 admin:
  - ONLY `teachers[].rateMinor` ⇒ **403 "ไม่มีสิทธิ์แก้ค่าสอน"**, service never reached;
  - the same roster without the rate ⇒ 200, the body reaching the service unchanged.
- TASK-584's derived list: the camp row loses its `UNSEEN` mark. **Every guarded writer's rate paths are now seen.**

## §3 What each door now refuses that it did not
- **Only ONE:** `PATCH /camp/weeks/:id/days/:date` with `teachers[].rateMinor` and **no `teacherRates`**, from a user WITHOUT key 59 ⇒ **403** (was 200, and the rate was written).
- **Every other door: nothing new.**
  - The sweep shows the only nested rate paths in any schema are the camp day's `teachers[].rateMinor` and `duo.classRateMinor` (already seen).
  - No non-rate path is detected, so no rate-less body anywhere is newly refused.

## §4 🔴 The STOP check: no legitimate workflow depends on it (FE read, not changed)
- **The camp editor** (`lib/camp/grid.ts` `teacherEntry`/`dayPatch`) sends `rateMinor` **only when the day's rates are NOT masked** (`server.teacherRates !== null`).
  - For a no-59 user the server masks them, so **the FE never sends `rateMinor`** for them.
- **The calendar's camp swap** (`CampBlockPanel`) sends `{ teacherIds }` only, with no rate.
- ⇒ **The only thing now refused is a hand-made API body.** No exception carved, nothing to stop for.

## §5 Other users of the detector
- **None in production code other than the guard** (`assertMayEditCoachRate`, its only caller). Tests import it directly.

## §6 Checks
- Suite: **3648 / 0** (3645 + 3). **DB-unreachable 3×: 3648 / 0, 0 "Failed query".** tsc 0. **65 .sql = 65 tags, no migration.**
- **Mutations with `bun run mutation:run`:** baseline 23, measured; CHECKSUM identical; every restore byte-identical:
  - **D1, the detector shallow again (top level + duo):** BITES.
  - **D2, a non-rate body detected (the roster alone counted as a rate edit):** BITES.
  - **D3, arrays not walked:** BITES.
  - **D4, a non-rate body detected (any nested object counts):** BITES.
  - **D5, the camp day's guard removed:** BITES.
- 🚫 **Not touched:** who may cover (with the owner), the budget door (key 57), any other permission.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30) · **the permission thread is closed**
Verified by me: **3648 / 0** (and 3× unreachable, 0 failed queries) · tsc 0 · **5/5 bite**, including *the detector shallow again* and *a non-rate body detected* twice.

## 🔑 He went past what I asked, in the right direction
**I said "derive the shape from the SCHEMAS, not from a list of known nestings."** ✅ **He built a detector that KNOWS NO SHAPE AT ALL** — it walks every object and array for a rate field **by name**.
⇒ 🔑 **A new nesting cannot hide from it, and it needs no maintenance when a body changes.** 📌 *The list-of-nestings defect cannot recur, because there is no list.*

## ✅ The proof is the strongest form of "both directions"
**Every path of every body schema: detected ⇔ the leaf is a rate field. 0 wrong in either direction — ≥15 rate paths, >300 non-rate.**
✅ **Plus the 14 writers' real bodies with and without a rate**, ✅ **plus the camp door THROUGH THE ROOT APP** (no-59 + only `teachers[].rateMinor` ⇒ 403 with the reason; the roster alone ⇒ 200).
🔑 **">300 non-rate paths, none detected" is what makes this safe to leave on.** *The false-positive half is the one that gets a guard switched off, and he proved it at scale rather than on a sample.*

## 🔴 The STOP check — answered the way I hoped
**Newly refused: ONE door, ONE shape.** **Nothing breaks: the FE sends `rateMinor` only when rates are unmasked (key 59), and the calendar swap sends `teacherIds` only.**
⇒ 🔑 ***"Only a hand-made API body is now refused."*** **That is the honest measure of what was exposed: no screen could ever have done it, and now the door cannot either.**
✅ **Detector users: only the guard.** ✅ **And the sweep shows nothing else changed** — *a claim about "nothing else" backed by the check rather than by confidence.*

## 📌 Where this thread ends
**Two doors found, both shut, one of them the kind that a reader would have believed was covered.** **Found by counting the doors rather than by fixing the one we were told about.**
