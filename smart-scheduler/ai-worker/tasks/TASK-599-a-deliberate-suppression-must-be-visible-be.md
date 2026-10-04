# TASK-599 — a deliberate suppression must be VISIBLE — BE, S ⏸️ **NEXT ROUND, sized, not dispatched**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-10-01) · **The owner put it in the next round. On the board so it does not evaporate.**

## §0 Why
**Tanya spent a day on a notice that was never due.** **The family notice had been suppressed by the owner's own same-slot ruling — correctly — and `bc1447f2` had NO outbox rows at all.**
🔑 **Nobody can tell "suppressed on purpose" from "lost": not a tester, not an admin, not us.** ⇒ **An absence meaning two things is the class this whole fortnight has been about** (D8's `latest === null`, the unlinked make-up, `isNew`, the no-result run).
📌 **And the precedent already exists in our own code: TASK-152 added a SKIPPED outbox row for "no admin recipient configured" for exactly this reason** — *"so a mis-configured environment is loud instead of empty."* **This is the same move, one case over.**

## §1 The shape
- **An outbox row with a SUPPRESSED status and its REASON**, written where the notice would have been. 🔑 **One row, so the decision is legible where a human already looks for notices.**
- ⚠️ **Derive every place a notice is deliberately NOT sent** — **the same-slot family case, the same-slot-same-coach case, "never the family" on an undo, and anything else.** 🔑 **A list of suppressions that is not derived will be missing the one we need next time.**
- ⚠️ **Say which of them deserve a row and which do not.** 🚫 **Not every silence needs a record** — *"the owner ruled nobody is told" is a design, and a row per non-event is noise.* **The test is whether a HUMAN could reasonably come looking.**
- 🚫 **No new recipient, no send, no change to who is told.** **This is a trace, not a notice.**

## Definition of Done
- [ ] A SUPPRESSED row with a reason, at the derived sites · **every deliberate silence derived and each one ruled in or out, with the reason** · 🚫 nothing newly sent · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · migration reported if any · mutations incl. **a suppression that writes nothing** and **a row written for a silence that was ruled out** · report + `inbox/SA.md` + log.

## 📋 Board cell, verbatim (re-homed 2026-10-02, Marie ORDER 15.1)

> The `board.md` cell for this row exceeded the 300-char limit and was shortened to a pointer at
> this file. **The prose was not deleted — it is moved here, byte-for-byte.** Source:
> `archive/board-2026-10-02-pre-sweep.md`.

```
| TASK-599 | BE: **a deliberate suppression must be VISIBLE** | (Tanya day on a notice never due; owner put it NEXT round) | ⏸️ **SIZED S, not dispatched** — `bc1447f2` had **NO outbox rows at all**: the family notice was suppressed by the owner own same-slot ruling, **correctly** ⇒ 🔑 **nobody can tell "suppressed on purpose" from "lost" — not a tester, not an admin, not us**, and *an absence meaning two things is the class of this whole fortnight* · 📌 **the precedent is OUR OWN: TASK-152 added a SKIPPED outbox row for "no admin recipient configured" so a mis-configured environment is LOUD instead of EMPTY — this is the same move one case over** · **a SUPPRESSED row with its REASON**, written where the notice would have been · ⚠️ **derive EVERY deliberate silence and rule each IN or OUT** — 🚫 *not every silence needs a record; a row per non-event is noise, and the test is whether a HUMAN could reasonably come looking* · 🚫 a trace, not a notice | @Jason |
```
