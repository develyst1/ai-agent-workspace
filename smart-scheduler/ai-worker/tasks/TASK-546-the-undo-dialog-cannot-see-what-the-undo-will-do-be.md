# TASK-546 — the Undo dialog cannot see what the Undo will do — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-28) · **Size S.** Your own 🔴 finding in TASK-542, ruled in. Build it as you proposed.

## §0 Why this one is not "another field"
**The leave Undo dialog's approved body promises, for every leave, that the quota is returned and the make-up cancelled** — **false for creation-declared, over-quota, and every 1-hour / voucher leave.**
📌 **This is the FOURTH dialog wrong because a screen could not see a server-side fact**, and 🔑 **it is the exact mirror of the pre-leave dialog Fern just corrected** — *the promise was fixed on the way in and left standing on the way out.*

## §1 Build — your shape, for your reason
- **`leaveCharged` raw** (never undefined — 🔑 **a tri-state lets a screen read "unknown" as "no"**), and **`makeupId` computed by the Undo's OWN `makeupDecision`.**
- 🔑 **One decider, two readers.** *A dialog that computes its own version of the act is a second implementation waiting to drift* — **the dialog and the act must be unable to disagree.** ⚠️ **If the two paths cannot literally share the decider, STOP and say so** rather than duplicating it: a copy is the defect, not the fix.
- ⚠️ **Same two answers as TASK-542, as answers:** **public allow-lists confirmed by value AND by source**, and **what a scoped teacher sees**. 🚫 `makeupId` is an id — **say explicitly whether it can point at a row outside the reader's scope**, and if it can, what that means. *An id is a key to another screen.*
- ✅ **Pin the key-set count again** (34 + 2 = 36, or whatever it is) so a stray field cannot ride along.

## §2 What I am NOT asking for
🚫 No copy, no FE change, no behaviour change to the Undo itself — **this task makes the act VISIBLE, it does not alter it.** ⚠️ If building it reveals the act is itself wrong for one of those leave kinds, **STOP and report** — that is a different task and a bigger one.

## Definition of Done
- [ ] `leaveCharged` raw + `makeupId` from the Undo's **own** decider (**shared, not copied** — or STOPPED and said why) · public unaffected **confirmed by value and by source with a leak mutation** · scoped-teacher answer stated, **including whether `makeupId` can cross scope** · key-set count pinned · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · 🔑 mutations incl. **the dialog's id disagreeing with the act's** · report here + `inbox/SA.md` + log.

---

# ⏸️ STOPPED — @Jason (2026-09-28): the DECIDERS can be shared as ruled, but their INPUTS can't, and that's your "a copy is the defect" one layer down. A better shape is below. **Nothing built.**

## §1 What the act actually decides with (`undo.service`, the leave branch)
- **The charge:** `leaveChargeOf(row, linkedAll.length > 0)`. **Not the raw column:** a legacy `NULL` is **inferred** (no course / declared at creation / has a make-up), and else **refused** (`UNDO_LEAVE_CHARGE_UNKNOWN`).
  - ⇒ **raw `leaveCharged` on the DTO would already disagree with the act** on every pre-0058 leave: the dialog reads `null`, while the act refunds, or frees, or refuses.
- **The make-up:** `makeupDecision(live, isSettled)`. Its inputs are **per-row reads**: the rows whose `extendedFromId` is this leave, minus CANCELLED, and **a settled check per make-up date** (`isDaySettled`: before today, OR an `end-of-day` job run for that date).
  - 🔑 **`makeupDecision` THROWS on five states:** ambiguous (> 1 make-up), taught, chained leave, odd state, settled day. **In each, the act REFUSES the Undo.**

## §2 🔑 Why two DTO fields can't make the dialog and the act unable to disagree
- **(a) The inputs would be a second implementation.** The dialog reads the calendar / list / by-id / course-plan DTOs (`BookingModal` + `PlanModal`).
  - To fill `makeupId` there, those four readers need a **grouped** read of linked make-ups **and** of settled dates, feeding `makeupDecision`.
  - **That's the same decider over a different gathering of its facts.** It's exactly where a drift hides: say, a settled-date rule tweaked in `isDaySettled` and not in the grouped query.
- **(b) Refusals have no home.** In the five throw cases, and the legacy-unknown charge, the act **refuses**.
  - Two fields could only say `makeupId: null` ("no make-up"), and **the dialog would promise an Undo that the act then refuses.** That's a fifth version of the defect we're fixing.
- **(c) Cost on the hot path:** the calendar grid would gain two grouped reads for every range, for a dialog that opens on one row.

## §3 ⭐ The shape I recommend instead: a DRY-RUN of the act itself
- **`GET /api/bookings/:id/undo-preview`**, same guard as the Undo route (scope refusal first), called **when the dialog opens**.
- **One planner, two callers:** the Undo's whole READ half moves verbatim into `planUndo(tx, row, today)`.
  - It covers the kind, settled, writable, the charge, the make-up decision, the expiry, and the slot check.
  - `undoBooking` = `planUndo` + the writes (**behaviour byte-identical**, and all 44 existing Undo pins must stay green).
  - The preview = `planUndo` in a read-only transaction, **returning the plan or the refusal and writing nothing**.
- The answer:
  `{ ok: true, kind, leaveRefunded, makeupCancelled: { id, date } | null, expiry: { from, to } | null }`
  or `{ ok: false, code, message }` (the act's own refusal, word for word).
- 🔑 **The dialog and the act can't disagree:** they run **the same function over the same reads** at the moment of asking. A refusal is known **before** the click. **No DTO field, no list-read cost, the key set stays 34.**
- **Scope:** `makeupCancelled.id` **can** point outside a scoped teacher's rows (a make-up taught by another coach, TASK-510's case). But **a scoped teacher can't Undo at all** (the Undo route refuses scope first), so **the preview inherits that refusal and never returns the id to them.** An admin sees every row anyway. ⇒ **no id crosses scope.** It carries the **date** so the dialog can name the make-up without a second lookup.
- **Public:** untouched by construction (a guarded admin route, not a DTO the allow-lists see). I'd still pin it with a source check + mutation.
- **Race:** the preview is a snapshot, and the act re-plans on click with the same function. A change in between makes the **act** refuse (`UNDO_ALREADY_CHANGED` / its own refusal), never the dialog lie silently.
- **Size:** S. Most of it is a move, not new code, and the 44 existing Undo pins guard the move.

## §4 If you prefer the ruled DTO shape anyway
It's buildable: `leaveCharged` = **the decider's** answer (`leaveChargeOf` → true / false / null, where null means "the Undo will refuse"), + `makeupId` via a grouped read into `makeupDecision`, with throws mapped to null.
- **It keeps (a) and (b) as known gaps**, pinned and stated.
- **Key set 36.**

⛔ **Your ruling:** §3 (recommended) or §4.

---

# ⚖️ SA RULING (2026-09-28) — **build the preview. §1's two fields are withdrawn.**

## ✅ You stopped where §1 told you to, and you were right to
I wrote *"if the two paths cannot literally share the decider, STOP — a copy is the defect, not the fix."* 🔑 **You found the deciders CAN be shared and their INPUTS cannot** — ⇒ **that is my own rule one layer down, and I did not see that layer.** **§1's shape is withdrawn, not deferred.**

## 🔑 Why the two fields were wrong, in your evidence
- **`leaveChargeOf(row, hasLinked)` infers or refuses legacy NULLs** ⇒ 🔴 **a raw `leaveCharged` already DISAGREES with the act on pre-0058 leaves.** *A field that is honest about the row and wrong about the outcome is exactly the defect we are fixing, rebuilt.*
- **`makeupDecision` reads per-row and THROWS in five states** ⇒ 🔑 **a DTO field has no home for a REFUSAL**, so the dialog would promise an Undo **the act refuses.** *Worse than today: today it over-promises the result; that would over-promise the attempt.*
- **And (c) is not just cost:** two grouped reads on the calendar's hot path **for a one-row dialog** — ⇒ *the whole list pays for a question only one row is ever asked.*

## ⚖️ Ruled: **`GET /api/bookings/:id/undo-preview`, the dry run.**
🔑 **`undoBooking` = `planUndo` + writes, and the preview IS `planUndo`** ⇒ **the dialog and the act cannot disagree, because they are the same reads.** ✅ **Refusals known before the click, in the act's own words** — *that is a better screen than the one I asked for.* ✅ Key set stays **34**, no list cost. ✅ **A scoped teacher cannot Undo ⇒ the preview refuses them, and no id crosses scope** — the scope question answers itself.

## ⚠️ Three conditions
1. 🔑 **The extraction must be behaviour-identical, and the 44 Undo pins are the proof** — run them and say so. **If `planUndo` needs one line changed to lift out, STOP** — the point is that the act is untouched.
2. ⚠️ **A preview is a SNAPSHOT.** **The act stays authoritative** — 🚫 **the Undo must never trust or skip a check because a preview passed.** *Pin that the preview's route is read-only and writes nothing.*
3. 🔒 **Same permission gate as the Undo itself, derived from the Undo's own guard, not re-typed** — *a preview of a privileged act is a privileged read.* **A new route is a new door.**

## Definition of Done (replaces §1's)
- [ ] `planUndo` lifted **verbatim**, `undoBooking` = `planUndo` + writes, **44 Undo pins green and named** (or STOPPED if a line had to change) · the preview route **read-only, pinned to write nothing**, same gate as the Undo **derived from it** · refusals returned **word for word** · scoped teacher refused, **no id crosses scope** · key set still **34** · suite **count** normally **and DB-unreachable** · tsc · 61 = 61 · 🔑 mutations incl. **the preview and the act disagreeing** and **the preview writing** · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-28): the preview as ruled. `planUndo` lifted VERBATIM, the act = `planUndo` + writes, and the preview writes nothing. **One known gap and one rule exception, both stated below** · **3514 / 0 normally, and 3× unreachable with plain `bun test`, 0 failed queries** · tsc 0 · 61 = 61 · key set still **34** · four mutations bite

## §1 Condition 1: the extraction is VERBATIM, and the act untouched (proved, not asserted)
- **`planUndo(tx, bookingId, today)`** holds the Undo's whole read half. **Its body is byte-identical to the lines it replaced: 53 lines, compared against HEAD by a script.**
- **`undoBooking`** now does `const { row, kind, leaveRefunded, makeup, expiry } = await planUndo(tx, bookingId, today);` and then the writes.
  - **Everything after the reads is byte-identical to before this task.** Compared line by line: the only difference from HEAD is TASK-540's own `...leaveNoteUndo(row)` line.
- **No line had to change to lift it out.**
- **The Undo pins, named and green:** `booking-undo-req108.test.ts` (the 44 existing + 10 new = **54**), `counter-sql-req108`, `coach-notice-inventory-task512`, `makeup-cancel-family-task537`. **64 / 0 across the four files.**
  - One of TASK-492's pins was a **source** pin on the gate's text. I moved it to the shared guard **and tightened it:** after the move it would have passed on a `-1` index, so it now asserts the guard exists and precedes the service in BOTH handlers.

## §2 The preview
- **`GET /api/bookings/:id/undo-preview`** ⇒ `previewUndo(id)` = `planUndo` over the live rows. **No transaction, no write call on the path.**
  - `{ ok: true, kind, leaveRefunded, makeupCancelled: { id, date } | null, expiry: { from, to } | null }`
  - or **the act's own refusal, word for word**: `{ ok: false, code, message }`.
  - "Not found" stays the **404** it is.
- 🔑 **Agreement pinned on 7 cases**, each run through BOTH the preview and the real `undoBooking` over the same world:
  - a charged leave with its make-up (+ expiry);
  - a creation-declared leave;
  - a 1-hour leave;
  - REFUSED: make-up taught;
  - REFUSED: legacy unknown charge;
  - REFUSED: settled day;
  - a parent's check-in.
  - **In every case the preview equals the act** (the refusals too), **and the preview's write log is EMPTY.**
- **Condition 2, a SNAPSHOT:** the act still re-plans on the click with the same function, and **nothing in the act reads, trusts or skips on a preview** (the act never sees one).
  - **Read-only is pinned by source:** the preview path and the planner contain no `update` / `insert` / `delete` / `transaction` / send.
  - **Pinned by behaviour:** `writes = []` on every case.

## §3 🔒 Condition 3: the SAME gate, DERIVED
- **`UNDO_ACCESS = act(CAL_BOOK, "action:calendar.undo")`: ONE value**, used by both `POST /bookings/:id/undo` and `GET …/undo-preview`. Pinned as **the same object** (`toBe`), not a lookalike.
- **`assertMayUndo(c)`: ONE in-handler guard** (a linked account refused), called first in both handlers (pinned).
- **Scoped teacher:** refused at the guard (SCOPE_TEACHER), and TASK-535's route sweep hits the new route and gets 403. ⇒ **`makeupCancelled.id` never reaches a scoped reader**, and no id crosses scope.
- ⚠️ **ONE rule exception, and it's yours to know about:** the RBAC design rule *"no READ route carries an action key"* (TASK-385, pinned in `rbac-stage3` and `budget-visibility`) collides with your condition 3.
  - **The preview is a read that carries the Undo's action key.**
  - I added it as **ONE named exception with its reason** in both pins (TASK-512's rule: a scan that can't express a legitimate exception gets deleted). It's pinned to be **the same object as the Undo's entry**, and **every other read still carries none.**
  - If you'd rather the preview be menu-gated only, it's one line. But then anyone with the calendar menu could preview an act they can't perform.
- **Public:** untouched by construction (a guarded admin route, not a DTO). **The key set is still 34** (TASK-542's pin, green).

## §4 ⚠️ The ONE known gap: I couldn't close it without changing the act (condition 1)
- **`UNDO_PLAN_WOULD_CHANGE` is decided AFTER the act's writes:** the reconcile is asked whether the course plan still balances with the make-up gone. So it's **not in the read half**, and **the preview can say "ok" where the act then refuses** (the case: this leave's make-up was already trimmed away by a later plan edit).
- **Pinned so it stays visible:** preview `ok: true`, act `UNDO_PLAN_WOULD_CHANGE`, same world.
- **To close it (not built, your call):**
  - (a) compute the balance **before** the writes from the reconcile's own pure planner (`planCourseMovesForCourse` over the post-Undo state). That **changes the act's order**: a bigger task.
  - (b) a dry run that **executes the act in a transaction and always rolls back**. That's exact, including this refusal, **but it takes write locks** and isn't "read-only" in the sense you pinned.
- **Rare, and the act stays safe either way:** it refuses with its own message.

## §5 Break-and-watch (CHECKSUM identical, every restore byte-identical, BASELINE=54)
- **D: the preview and the act disagree** (the preview's own make-up answer): **BITES**.
- **W: the preview writes** (runs the act): **BITES** (5 fail).
- **G: the preview's gate retyped weaker** (a different key, no guard): BITES.
- **R: a refusal swallowed** (the preview says ok where the act refuses): BITES.

⛔ Only you mark this DONE. §3's exception and §4's gap are yours to rule.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-28)
Verified: **3514 / 0** (and 3× unreachable, 0 failed queries) · tsc 0 · **61 = 61** · key set still **34**.

## ✅ Condition 1 met by the strongest available proof
🔑 **`planUndo`'s body byte-identical to the 53 lines it replaced, compared against HEAD by SCRIPT** — ⇒ *"no line changed" as a measurement, not a claim.* **54 Undo pins + counter-sql + coach-notice-inventory + task537 = 64/0, named.** ✅ **And he TIGHTENED TASK-492's gate pin while moving it** (it would have passed on a `-1`) — *a pin moved is a pin re-read, and he read it.*

## ✅ The preview, and the pin that makes it worth having
**Agreement pinned on 7 cases including 3 refusals, through the preview AND the real act, with the write log EMPTY every time.** 🔑 **Agreement is asserted against the act itself, not against an expected value** — *an expectation can be wrong in both places; the act cannot disagree with itself.* ✅ Condition 3: **ONE `UNDO_ACCESS` value, ONE `assertMayUndo` on both routes** — **derived, not re-typed**, as required.

## ⚖️ Ruling 1 — the action-key-on-a-GET exception: **ALLOWED, as ONE named exception**
**TASK-385's "no GET carries an action key" stands everywhere else.** 🔑 **The rule exists so a READ is never gated by a grantable power — but this GET is a preview of a privileged ACT, and its gate is the ACT's gate.** ⇒ **The alternative is a second, re-typed guard, which is exactly the drift condition 3 exists to prevent.** ✅ **Named, reasoned, pinned to the Undo's own entry, every other read still carrying none** is the right shape for an exception. 📌 **Recorded in `SYSTEM-FACTS.md` so the next reader meets the exception with the rule, not after it.**

## ⚠️ Ruling 2 — `UNDO_PLAN_WOULD_CHANGE`: **accepted as a known gap. Do not close it now.**
**The preview can say ok where the act then refuses**, because the balance check happens after the writes. ✅ **Pinning it visibly is the correct handling** — *an honest gap named in the code outlives a true statement in a report.*
🚫 **Neither (a) nor (b) now:** (a) **changes the act**, and this task's whole value was that the act is untouched; (b) **takes write locks for a dialog.**
🔑 **And condition 2 already covers the consequence: the act stays authoritative.** ⇒ **The FE must word the dialog so that a refusal AFTER the click is not a contradiction** — *a preview says what would happen, not what is guaranteed.* **That is now an FE constraint, carried into TASK-547.**
