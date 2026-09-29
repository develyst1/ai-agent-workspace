# TASK-569 — the re-count must not undo a person's extension — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-30) · **Size S.** 🔴 **REQ-110 item 3 does not ship without this.** Your own finding in TASK-568.

## §0 The ruling
**The first-booking re-count fires whenever no live booking exists** ⇒ **cancel every booking of an extended voucher and the next booking RESETS the extension.**
🔑 **A feature the system can silently undo is not a feature.** **An admin extends, a cancellation happens, the extension disappears, and nobody is told** — ⇒ **that is exactly the defect class we have spent a fortnight removing, and shipping item 3 without this would be choosing it on purpose.**
✅ **It is fixable only because you made BOTH writers record.** ⇒ **A human change is ON RECORD, so the system's convention can yield to it.** 📌 *The record you added on day one is what makes the fix possible.*

## §1 Build
- **The re-count does NOT set the expiry when a HUMAN change is on record for that voucher.** 🔑 **Decide it from the RECORD — the actor — not from a flag, a timestamp comparison or a heuristic.** *We have the fact written down; use the fact.*
- ⚠️ **Say what the re-count does instead: nothing at all, or a recorded no-op?** 🔑 **If it silently does nothing, a later reader cannot tell "it skipped" from "it never ran"** — *which is the ambiguity that made D8 and TASK-553 hard.* **Choose, and justify in one line.**
- ✅ **Pin BOTH directions:** **no human record ⇒ the re-count still sets the expiry as it always has** (🚫 do not break a normal voucher's first booking) · **a human record ⇒ the extension SURVIVES a full cancel-and-rebook.**
- ⚠️ **Then revisit NOT STARTED.** **Its 409 exists because "the first booking would overwrite it" — that reason evaporates here.** ⇒ **Say whether it should still refuse, and why.** 🔑 **A rule that outlives its reason is a rule nobody can defend later.**

## §2 Not in scope
🚫 The ENDED question (with the owner) · 🚫 the FE half of item 3 · 🚫 changing how a voucher's expiry is first set for a normal voucher.

## Definition of Done
- [ ] The re-count yields to a recorded human change, **decided from the RECORD** · what it does instead **chosen and justified** · 🔑 **both directions pinned — a normal voucher unaffected, an extended one surviving a full cancel-and-rebook** · NOT STARTED revisited with a reason · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · 🔑 mutations incl. **the re-count overwriting a human change** and **the re-count skipping a normal voucher** · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-30): the re-count YIELDS to a person, decided from the RECORD, and the yield is itself RECORDED · **NO migration (64 stays)** · **3610 / 0 normally, and 3× DB-unreachable, 0 failed queries** · tsc 0 · five mutations bite

## §1 The yield, decided from the RECORD
- In `prepareVoucherBooking`, when the first-booking re-count would fire (no live booking), it first asks **the voucher's expiry record: is there a change with an ACTOR** (`actor IS NOT NULL`)?
  - **Yes ⇒ a person set this expiry ⇒ it is KEPT.**
  - **No ⇒ the re-count runs exactly as before** (and records itself as the system, TASK-568).
- 🔑 **The fact, not a heuristic:** no flag, no timestamp comparison, no "is the date later than the count".
- A record written only by the **system** (an earlier re-count) is **not a person**, so it doesn't stop the re-count (pinned; the "yields to any record" mutation bites).

## §2 What it does instead: a RECORDED no-op
- **It writes one row: `from = to = the kept date`, actor NULL (the system)** (`recordRecountYield`).
- *One line of justification:* **without it, "the re-count ran and kept the person's date" and "the re-count never ran" read the same**, which is exactly D8's and TASK-553's ambiguity. And it happens only on a full cancel-then-rebook of an extended voucher, so it's rare, not noise.
- ⚠️ **It is the ONE deliberate exception** to the record's "a no-op is not a change" rule (`recordVoucherExpiryChange` still skips every other no-op). It's named as such in its own doc comment, and it can't be mistaken for a person's edit (actor NULL; a mutation recording it with an actor bites).

## §3 Both directions pinned (by value, through the real `prepareVoucherBooking`)
- **A NORMAL voucher's first booking:** re-counted from the booking date **exactly as before**, and that move recorded as the system. **The re-count-skips-a-normal-voucher mutation bites** (both variants).
- 🔑 **An EXTENDED voucher SURVIVES a full cancel-and-rebook.**
  - History: sale → the first re-count (system) → **the admin extends to 2027-06-30** → every booking is cancelled → a rebook.
  - Result: **the expiry stays 2027-06-30**, and the one write is the recorded yield. **The overwrite mutation bites.**
- A voucher with a live booking isn't re-counted at all (unchanged).
- **The kept date still GATES:** if the person's date is earlier than the rebook, the booking is refused as expired. The person's date IS the date.

## §4 NOT STARTED, revisited: the 409 STAYS, for the reason that remains
- **Its first reason is gone** ("the first booking would overwrite it"): the re-count now yields to a person.
- 🔑 **The reason that remains:** before the first booking, the expiry is a **sale-day placeholder** that the system recomputes from the first booking's date.
  - A person's date typed then would **freeze that placeholder**, and can end **EARLIER** than the normal count. **An "extension" that shortens.**
  - ⇒ **There is nothing to extend until validity starts.** The doc comment now carries this reason instead of the dead one.
- (A voucher whose bookings were ALL cancelled reads as "not started" to the editor too, so the admin extends it after the rebook. **Its earlier extension survives either way**, §3.)

## §5 Checks
- Suite: **3610 / 0** (3605 + 5 new in `src/services/voucher-recount-yields-task569.test.ts`). **DB-unreachable 3×: 3610 / 0, 0 "Failed query".** tsc 0. **64 .sql = 64 tags: no migration** (the record table from 0063 is the fact this reads).
- **Break-and-watch** (BASELINE 14, CHECKSUM identical, every restore byte-identical):
  - **O1, the re-count OVERWRITING a human change:** **BITES** (2).
  - **S1, the re-count SKIPPING a normal voucher** (yielding to a system record): **BITES**.
  - **S2, skipping every voucher:** BITES.
  - **Y1, the yield SILENT:** BITES.
  - **Y2, the yield recorded as a person:** BITES.
- **A slip in my own fake, caught:** it mutated the read voucher on update. The service's `v` is a snapshot, so the fake hid the re-count's record row. **Fixed the fake** (the store tracked separately); the code was right.

⛔ Only you mark this DONE. **Item 3's BE is now complete from my side; ENDED is with the owner.**

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30) · **item 3's BE is complete**
Verified by me: **3610 / 0** (and 3× unreachable, 0 failed queries) · tsc 0 · **64 .sql, no migration** (counted myself).

## ✅ Decided from the record, exactly as ruled
**When the re-count would fire it asks "is there a change with an ACTOR?" — yes ⇒ the person's date is KEPT; no ⇒ it runs exactly as before.** ✅ **And "a system-only record is not a person"** — 🔑 *the distinction only exists because he made the system record itself in TASK-568, and it is doing real work one task later.*

## ✅ The recorded no-op — **the right call, and correctly declared as an exception**
**A recorded no-op (from = to, actor NULL) so "yielded" cannot read as "never ran".** ✅ **Named in its doc as the ONE deliberate exception to "a no-op is not a change".**
🔑 **This is the whole of D8 and TASK-553 in one design decision: the ambiguity that cost us days was "no record" meaning two different things.** ⇒ **Paying one rare row to keep those two apart is cheap.** ✅ **And declaring it as an exception rather than quietly widening the rule is what keeps the rule usable.**

## 🔑 NOT STARTED — he did what I actually asked, which was harder than obeying
**I said the 409's reason evaporates and told him to revisit it. He found a DIFFERENT reason that survives:**
**before the first booking the expiry is a sale-day placeholder, so a person's date would FREEZE it — and it can end EARLIER than the normal count.** ⇒ 🔑 **"An extension that shortens."**
✅ **The rule stays, the dead reason is REPLACED in the doc.** 📌 **That is the correct outcome of "a rule that outlives its reason is one nobody can defend later": not deleting the rule, but finding out whether it still has one.**

## ✅ Both directions pinned by value
**A normal voucher's first booking unchanged · an extended voucher SURVIVES a full cancel-and-rebook (2027-06-30 kept) · and the kept date still gates.** ✅ **Five mutations bite, including both directions of the mistake.**
▶️ **Item 3's backend is complete. ENDED remains with the owner.**
