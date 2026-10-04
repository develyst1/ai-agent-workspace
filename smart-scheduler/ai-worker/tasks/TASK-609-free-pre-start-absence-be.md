# TASK-609 — REQ-111 F: a not-yet-started course takes a planned absence free — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-10-02) · **The owner ruled GO, with a cap.**

## §0 The ruling
**A course that has NOT STARTED accepts a planned absence WITHOUT spending leave quota** — ⚠️ **CAPPED at the quota the customer bought.**
🔴 **And pin my own point whichever way it lands: a day declared BEFORE the course starts and a leave taken AFTER it must NEVER be editable into one another.** 🔑 **One is free by design, the other costs quota — if one can become the other, the quota is decorative.**

## §1 Build — and both halves already exist
✅ **An absence declared AT COURSE CREATION is already born free** (`SICK_LEAVE` + `plannedAtCreation` + `leaveCharged: false`, with the make-up still appended). ✅ **And "not yet started" is already DERIVED** (TASK-570: nothing imported as taught AND every non-cancelled session today or later).
⇒ 🔑 **This is joining two things we have, not building a third.** 🚫 **Do not write a new "has it started" predicate** — ⚠️ **if the existing one does not fit, say why rather than forking it.**
- ⚠️ **The CAP: "the quota the customer bought."** 🔑 **Derive what that number is from the COURSE, not from a constant** — and **say what happens at the cap: refused, with the count, in words an admin can act on.**
- ⚠️ **Say whether a pre-start declaration counts toward the SAME quota a later leave would spend, or a separate allowance.** 🔑 **The owner said "capped at what they bought", which reads as the same pool — confirm that from the code and state it, because the two readings differ for every course afterwards.**
- 🔴 **The no-conversion rule, pinned both ways:** **a pre-start declared day cannot become a charged leave, and a post-start leave cannot become a free declared day** — **not by an edit, not by a start-date change, not by an undo.** ⚠️ **The start-date change is the dangerous one: it MOVES sessions across the boundary. Say what it does to a declared day and pin it.**

## §2 Not in scope
🚫 The screen (the declaring dialog's home is a claim question with @Porter) · 🚫 changing the at-creation path · 🚫 the quota rules for a started course.

## Definition of Done
- [ ] Free pre-start absence, **capped from the COURSE's own quota, not a constant** · the at-cap refusal **actionable, with the count** · **same-pool-or-separate answered from the code** · 🔴 **no-conversion pinned BOTH ways, including across a start-date change** · the existing "not started" predicate reused (or why not) · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · mutations incl. **a declared day becoming chargeable** and **the cap not applying** · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-10-03): **F built by JOINING the two halves — no third predicate** · the cap from the COURSE's own quota · 🔴 **no-conversion pinned BOTH ways, including across a start-date change** · **3748 pass / 1 fail** (the known CRLF one, not mine) · tsc 0 · **10 / 10 mutations bite** · 65 = 65 · ⛔ live-DB layer owed

## §1 The join — and nothing new was written
- **"Has it started"** is **TASK-570's `courseNotStarted`**, asked from the leave door. ✅ **Pinned: it appears ONCE in the service, and the service derives nothing of its own** (no `priorSessions > 0`, no hand-rolled date sweep). **Mutation F6 — a forked predicate that agrees today — BITES.**
- **The free shape** is the at-creation one: **`plannedAtCreation: true` + `leaveCharged: false`, with the make-up still appended.** 🔑 **Chosen so every existing reader of "free" — `leaveChargeOf`, the undo, the start-date planner — knows it already, with no second flag to keep in step.**
- **Where it lives:** the leave door (`updateBookingStatus`), through one private helper `preStartDeclaration`. 🚫 No new route, no new column, **no migration**.

## §2 The CAP — from the COURSE, not a constant
- **`courseLeaveQuota(course)`** = the course's **own `leave_quota`**, else the by-size table. ✅ **By value: the same SIZE with a different bought quota caps differently** (`{size:4, leaveQuota:7}` ⇒ 7; `leaveQuota: 0` ⇒ none at all). **F4 (a constant) BITES.**
- **At the cap: refused BEFORE anything is written, with the numbers** — `DECLARED_ABSENCE_CAP`, *"…ครบแล้ว {declared}/{quota} วัน — เริ่มเรียนก่อน แล้วจึงแจ้งลาตามปกติ หรือปลดล็อกโดยแอดมิน"* (📋 DRAFT). **F9 (the count dropped) and F3 (no cap) BITE.**
- ✅ **And the row being declared is not counted against its own cap** — **F10 (off by one) BITES.**

## §3 ⚖️ Same pool or separate? **SAME NUMBER, SEPARATE COUNTER — answered from the code**
- **`leaveUsed` is incremented in exactly TWO places, and both are guarded by the charge** (`if (charges)` / `!b.plannedAtCreation`). **`charges` excludes a declared day.** ⇒ 🔑 **a declaration CANNOT spend the post-start allowance without changing those two writes** — asserted by walking to each increment and checking its guard, not by reading the happy path.
- ⇒ **The cap counts DECLARED DAYS against the quota's NUMBER; a started course keeps its full `leaveRemaining`.**
- 📌 **Why not the other reading:** one shared pool would make the day **merely deferred, not free** — the owner said free. **You asked me to state it rather than assume: this is the statement, and it is the half I would most like challenged.**
- 🔴 **DECLARED, because it narrows an existing claim:** `extension-ceiling.test.ts` asserted *"a course with NO quota left is STILL REFUSED"*. **That is now true of every STARTED course and NOT of an unstarted one**, whose gate is the declared cap. **I did not quietly update the string** — the test is retitled, the narrowing is written in it, and the new gate is asserted by value. **F7 (the gate back on `leaveRemaining`) BITES.**

## §4 🔴 No conversion — both ways, and across the START-DATE CHANGE
- **Declared ⇒ charged: impossible.** The only charge path excludes `plannedAtCreation`, on **both** leave doors. **F1 / F2 BITE.**
- **Charged ⇒ declared: impossible.** `plannedAtCreation: true` is written in exactly **three** places (the creation insert, the creation flip, this declaration) and nowhere else; and **`leaveCharged: false` appears exactly once — beside `plannedAtCreation: true`, where a free day is BORN.** 🔑 **It never appears alone, which is what "clearing a charge" would look like.**
- 🔴 **The start-date change — the one you expected to go wrong — pinned BY VALUE through the pure planner:** a course carrying **one declared day and one charged leave** is moved a week on; **every row moves, each keeps its own status, and neither becomes the other.**
  - **And the mechanism, not just the outcome:** the apply's **one row write is `{ date, ...reconfirm }`** — **no `.set({…})` in it mentions either field.** ⚠️ **Asserted on the WRITES, not the file**, because the wiring must READ `plannedAtCreation` (the expiry stretch depends on it) — a file-wide negative would have failed on correct code, and my first version did.
  - **F8 — the start-date change converting a declared day — BITES.**

## §5 Checks
- **`bun test` (DB-unreachable, all four guard signals blanked): 3748 pass · 1 fail** — the `teacher-schedule-req109` CRLF one, **yours to route, untouched by me as instructed.**
- **tsc 0 · 65 .sql = 65 journal tags, no migration.**
- **Mutations: baseline 122, CHECKSUM identical, every restore byte-identical — 10 / 10 BITE**, including the two you named (**a declared day becoming chargeable** · **the cap not applying**) and the start-date conversion.
- ⛔ **Owed, with TASK-608: the live-DB layer** — the suite against a reachable sid database, and both mutation sets re-run there. ⚠️ **And one honest boundary: the end-to-end drive of `updateBookingStatus` itself needs that database.** What is proven here by VALUE is the predicate, the quota derivation and the start-date no-conversion; **the leave door's wiring is pinned by source, each pin carrying its claim.**

## ⚖️ 2026-10-04 — @Jason: §3 — the cancel-and-re-declare leak, RULED (and its cost pinned)
- ▶️ **The cap now counts `plannedAtCreation` ALONE:** `const declared = (rows as any[]).filter((r) => r.id !== current.id && r.plannedAtCreation).length;` — the `status === "SICK_LEAVE"` term is **gone from the cap**.
- 🔑 **Why that way:** counting only LIVE leaves lets cancel-and-re-declare reset the cap without limit, and **a limit any later edit can reset is decorative** — which is the owner's own objection to a quota that does not hold. **The cap therefore counts DECLARATIONS MADE, not declarations standing.**
- ⚠️ **The COST is pinned in the test, not left to be discovered: a declaration taken back still consumes one of the cap.** 🚫 **Deliberately NOT fixed by clearing `plannedAtCreation` on the Undo** — that flag is what `leaveChargeOf` reads to answer *"was this leave free?"*, so clearing it would change what the Undo reports about a row it has already refunded. **If the owner wants corrections free, that is his call and a separate line.** The test asserts both halves: the Undo never mentions the flag, and `booking-undo.ts` is where it is read as the FREE answer.
- ✅ **Suite 3751 pass · 0 fail · tsc 0 · 65 = 65** after the ruling.
- 📌 **New mutation F11 covers the leak** (put the status filter back ⇒ the cap resets) and is filed with the set, now a repo file: `src/lib/pre-start-declared-absence-task609.mutations.json`, **11 mutations**. ⚠️ **F10's anchor had to be RE-CUT** — §3 changed the very line it anchored on, so the filed set and the code would otherwise have disagreed **silently**. **That is exactly the failure the new set-integrity test exists to catch.**
