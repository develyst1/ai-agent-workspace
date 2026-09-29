# TASK-516 — announce a MOVED class to the coach(es) **and** the family — BE, M. **Wording proposed before shipping.**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-27) · **Size M.** 🔨 **Owner ruling: "ย้ายคาบแจ้งทั้งคู่" — announce a move to both.** ⏭️ **NEXT deploy, not today's** — this is new behaviour reaching customers and it must not ride a release that is otherwise ready.

## §0 What exists today
**Nothing.** `moveBooking` and the plan editor's `edit` update the row **in place**: no cancel notice, no confirm notice, **no message to anyone** (TASK-436's own comment says "silent"). The only send on that path fires when the **teacher** changes.
`PENDING_RESCHEDULE` is a status **nothing writes** and `reschedule_requested` a renderer with **no producer** — **built and never wired.**

## §1 Build
- **On a date or time change**, one notice to **every coach of the class** (`teachersOfBooking` — the shared predicate, no fourth answer) and one to **the family**.
- **It says what moved:** `from` old date/time **→** `to` new date/time, in the house format — **and the coach's copy follows the coach convention while the parent's follows the CHAT'S LANGUAGE** (as every parent message does).
- 🔑 **Only a real move.** A note, a rate or a teacher change is not a move: **pin that each of those alone sends nothing**, and that a teacher change still sends only what it sends today. ⚠️ **A "move" notice that fires on an unrelated edit is worse than silence** — it teaches everyone to ignore the notice.
- 🔑 **What about several moves in a row?** An admin dragging a class twice in a minute must not send two messages that contradict each other's "from". **Say what happens and pin it** — I have no ruling yet and I want your reading of the code before I make one.
- **`PENDING_RESCHEDULE` / `reschedule_requested`:** the owner leaves it to us. 📌 **My lean is to ignore both and send a plain move notice** — wiring a status nothing writes, to satisfy a template nobody produces, is two unknowns to inherit. **If the template's shape is genuinely what we want to say, use it and say why**; otherwise say you left them and they stay named as dead.
- **Unlinked recipients:** the established behaviour — a SKIPPED row, nothing delivered, consistent with TASK-508.
- 💰 **Nothing about what a move DOES changes.** No entitlement, no credit, no status. This is an announcement of an act that already happens.

## §2 The wording — 📋 **propose to me BEFORE shipping** (the owner asked)
Draft it in both languages for **both audiences**, **mark it as a draft in the code**, and **pin it by shape** — as @Jason did for the coach stamp and @Fern for the admin dialog. **Say it in your report and I will put it to him.**
🔑 **What the shape must carry:** the child, the class, **the old date/time and the new one**, and **nothing about why**. A move happens for reasons a family does not need and a coach cannot verify.

## §3 Size and order
**BE M.** ⏭️ **The next deploy.** It is the first message we will have added to a path that was silent since it was written — and 📌 **a family that has never been told about a move will now be told about every one.** That is the owner's decision, and it deserves its own release rather than arriving inside one that is already packed.

## Definition of Done
- [ ] A move notice to **every coach** (shared predicate) and to **the family**, by value in both languages · **only a real move fires it** — a note, a rate and a teacher change each pinned to send nothing new · repeated moves' behaviour **stated and pinned** · `PENDING_RESCHEDULE` / `reschedule_requested` **used with a reason or left and named** · unlinked ⇒ SKIPPED · 💰 nothing about the move itself changed, pinned · the wording **proposed, marked as a draft, pinned by shape** · suite **count** normally **and unreachable** · tsc 0 · migrations unchanged · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that fires on a note-only edit, one that tells only the primary coach, and one that tells the coach but not the family · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-27): a real MOVE is announced to every coach and to the family, FROM → TO · only a real move fires it · 📋 the WORDING below is a DRAFT for the owner · 3390 / 0 normal AND unreachable, 0 failed queries · tsc 0 · migrations unchanged (60 = 60) · ⏭️ NEXT deploy

## §1 📋 The wording: DRAFT, marked in the code, pinned by FORM (please take it to the owner)
**To every COACH** (the house coach format: a bilingual stamp identical in both columns, English labels):
```
CLASS MOVED / ย้ายคาบ ‼️
Student : มะขิด
Program : Freeskate 1 HR
Coach : Ek, Nok
From : 05-10-2026 10:00-11:00
To : 12-10-2026 14:00-15:00
```
**To the FAMILY, in the CHAT's language** (the cancel notice's shape; never the coach):
```
📅 ย้ายคาบเรียน:                 📅 CLASS MOVED:
Student : มะขิด                  Student : มะขิด
Program : Freeskate 1 HR         Program : Freeskate 1 HR
จาก : 05-10-2026 10:00-11:00     From : 05-10-2026 10:00-11:00
เป็น : 12-10-2026 14:00-15:00    To : 12-10-2026 14:00-15:00
```
- It carries **the child, the class, the old slot and the new**, and **nothing about why** (pinned: no Reason, no Coach on the family's copy).
- The keys (`ob_class_moved_title`, `ob_f_from`, `ob_f_to`, `mv_title`, `mv_from`, `mv_to`) are each marked **"📖 DRAFT … NOT approved"**. When he answers, the form pins flip to bytes.

## §2 The build (`scheduler.service.ts`, `lib/class-move.ts`)
- **`announceMove(tx, id, before)`**, called by **both doors that move a class**: `moveBooking` (PATCH `/bookings/:id`) and the plan editor's `edit` (`applyPlanChange`).
  - It's **inside each door's transaction**: the notices exist iff the move committed, and **a plan-editor DRY-RUN rolls them back with it**.
- **Recipients:**
  - **every coach of the class** via `teachersOfBooking` (the shared predicate; since TASK-522 a seat means its group);
  - **the family** via **`familyAccountsOfRow`**. That's the cancel notice's household rule, **moved out unchanged into one function both read** (a DUO's two children, or every seat of a GROUP row, de-duplicated). **No second family rule.**
- **Only a real move:** `isRealMove` = the **date** or the **start time** changed, compared as `HH:MM`, so `10:00` and `10:00:00` are the same slot.
- **Only a class they were holding:** `CONFIRMED` or an `EXTENDED` make-up (on the coach's week and the family's schedule). A `PENDING` class was never announced, so its move announces nothing.
  - ⚠️ **That differs from the family CANCEL notice (`CONFIRMED`-only).** I included `EXTENDED` because a make-up is exactly what gets dragged to another day. **Say if you want `CONFIRMED`-only.**
- 💰 **It only announces:** the move's own write is unchanged, and the only new writes are outbox rows (pinned: the move writes the booking and nothing else).

## §3 🔑 Several moves in a row: my reading, pinned
- **FROM and TO are snapshotted on the PAYLOAD at the moment of each move**; the renderer never reads the row's current slot for them.
- ⇒ Two drags in a minute send **a CHAIN, A→B then B→C**, and **each message is true on its own** (pinned: Ek's two messages read 05→12 then 12→19).
- The outbox worker delivers **oldest first** (`orderBy createdAt`), so they normally arrive in order.
  - ⚠️ **One edge, named:** if the first send **fails and is retried** after the second succeeds, they arrive B→C then A→B. Each is still true, but out of order.
- **Not coalesced:** merging "unsent" rows would race the worker. **The owner may prefer one message per burst; that's a ruling, not a bug.**

## §4 `PENDING_RESCHEDULE` / `reschedule_requested`: LEFT, and still named as dead
**I took your lean.** `reschedule_requested` is a family→admin *request* renderer (a different act), and `PENDING_RESCHEDULE` is a status nothing writes. **Wiring either to announce an admin's move would inherit two unknowns.** The move notice is its own plain kind.

## §5 Proof
- **`announce-move-task516.test.ts`, 14 tests**, through the **real `moveBooking`**:
  - a date move ⇒ Ek, Nok and the family, each with FROM/TO;
  - a time move alone fires;
  - **note · subject · rate · the same slot spelt differently ⇒ nothing**;
  - **a teacher change ⇒ only the reassignment pair, as today**;
  - PENDING ⇒ nothing; EXTENDED ⇒ announced;
  - **the chain**;
  - unlinked coach and family ⇒ SKIPPED rows;
  - 💰 only the booking row is written;
  - the words in both languages for both audiences; a partial payload ⇒ fewer lines, never no message;
  - `isRealMove` by value;
  - the plan editor calls the same sender inside its transaction.
- **Mutations** (database unreachable · CHECKSUM identical before and after · restores byte-identical · BASELINE=14):
  - **N: fires on a note-only edit:** BITES;
  - **P: tells only the primary coach:** BITES;
  - **F: tells the coaches but not the family:** BITES (3);
  - **G: a PENDING move announced:** BITES;
  - **S: FROM read from the row as it is now (no snapshot):** BITES.
- 🔑 **A real defect found and fixed on the way:** TASK-345's walker (which renders **every** message kind over odd payloads) **crashed my renderer on a partial `from`.** `slotLine` is now total: an incomplete slot drops its line. A message must degrade, never vanish.
- **Existing pins moved (same claims):**
  - the TASK-512 inventory classifies `announceMove` as a class-event producer (it asks `teachersOfBooking`; its family copies go through the one family rule, **by ruling**);
  - the Time registry's tenth template (`class_moved`: FROM/TO formatted where the payload is built);
  - the kind counters 26 → 28 (the walkers rendered both new kinds clean);
  - the family-sender count 4 → 5;
  - two source pins now read the household rule in `familyAccountsOfRow`.

## ⚠️ Named (not changed)
- **A GROUP row's move tells the families of ALL its seats, including seats already CANCELLED**: that's the cancel notice's household rule (it reads every seat), now shared. A family whose child left the group would be told the group moved. It's pre-existing in the cancel path; the fix would be a seat-status filter **in the one rule**, and that's yours to rule on.

⛔ Only you mark this DONE.

---

# ✅ REVIEWED by @Sober (2026-09-27) — 🔨 **three rulings and one addendum. The wording goes to the owner.** (Next deploy.)
Verified: **3390 pass / 0 fail normally and unreachable** · tsc 0 · 60 = 60.

✅ **One household rule, extracted rather than copied** (`familyAccountsOfRow`) — **so "which accounts are this family?" has one answer**, and the new notice cannot disagree with the cancel notice about who the family is. That is the same move as the coach predicate, and by now it is the habit rather than the instruction.
✅ **Inside both doors' transactions, so the plan editor's dry run rolls it back.** A dry run that sent real messages would have been the worst possible bug in this feature, and it is closed by placement rather than by a flag.
🔴 **And he found and fixed a real defect on the way in: TASK-345's all-kinds walker CRASHED his renderer on a partial payload.** `slotLine` is now total. 📌 **That walker exists to render every kind; a renderer that can crash on a partial payload would have taken the whole worker down with it** — so the bug he fixed is bigger than the feature he was adding, and it was found because the walker is derived over all kinds rather than over the ones someone remembered.

## 🔨 The three rulings
1. **EXTENDED make-ups: KEEP them in.** A make-up is a real class a family is expecting; moving it silently is the same failure as moving any other. 📌 **And the inconsistency you found is the other way round: the family's CANCEL notice is CONFIRMED-only, so today we do NOT tell a family their make-up was cancelled.** That is a gap, not a reason to copy it — **named for the owner, not fixed here.**
2. **Several moves: your chain is right — A→B then B→C, each true, snapshotted per move. No coalescing.** Coalescing would race the worker, and 🔑 **two true messages in the wrong order are better than one message that might be wrong.** ⚠️ Keep the retry-reordering limit **stated in the code**, so the next reader meets it where it matters.
3. **`PENDING_RESCHEDULE` / `reschedule_requested`: left and still named as dead** — as I leant. Wiring a status nothing writes to satisfy a template nobody produces would have been two unknowns inherited for no gain.

## 🔨 The addendum: **a GROUP move must not tell a CANCELLED seat's family**
You found that a group row's move tells the families of **all** seats, **including cancelled ones** — the shared household rule, pre-existing in cancel.
**Fix it in the one rule: a cancelled seat's family is not told.** 🔑 **A family whose child is not in that class being told it moved is noise from a system they are trying to trust** — and it is worse than noise: **it implies their child still has a seat.**
⚠️ **This changes the CANCEL notice's audience too** (it is one rule now, which is the point). **Say plainly in your report which existing notices change audience**, and **pin each of them by value** — I would rather see that list than discover it in Tanya's round.

## 📋 The wording: draft accepted as a draft, going to @Porter
Both audiences, both languages, **nothing about why** — correct: **a move happens for reasons a family does not need and a coach cannot verify.** The coach's copy follows the coach convention and the family's the chat language, as ruled. **Pinned by shape, so the owner's answer is a one-line change.**

---

# ✅ ADDENDUM DONE — @Jason (2026-09-27): the ONE household rule drops CANCELLED seats · the notices whose audience changes, listed and pinned by value · the retry limit written in the code · 3400 / 0 normal AND unreachable, 0 failed queries · tsc 0 · 60 = 60
## §1 The change: in the one rule (`familyAccountsOfRow`)
- A GROUP row's seats are filtered to **`status !== "CANCELLED"`**. A family whose child left the group is no longer told the group moved, or was cancelled.
- ⚠️ **A trap found on the way, and closed. "Status as of BEFORE the act":**
  - **the admin's group cancel cascades through the seats FIRST** (`cancelSeatsOfGroup`), then tells the families;
  - it passed no seats, so the rule **re-read them after the cascade**. With the filter, **every seat would have been CANCELLED and NO family told the class was cancelled.**
  - That path now **reads its seats BEFORE the cascade** (`seatsBefore`) and passes them. It's pinned by source order, and by value that a post-cascade re-read would tell nobody (the reason the snapshot exists).

## §2 🔑 Which notices change audience (GROUP rows only; every one pinned)
| notice | caller | audience before → now | pinned |
|---|---|---|---|
| **a moved class (family copy)** | `announceMove` (both move doors) | all seats → **live seats** | ✅ by value through the real `moveBooking` |
| **the family CANCEL notice, admin's group cancel** | `updateBookingStatus` cancel | all seats → **seats live BEFORE the cancel** | ✅ by value (the rule) + by source (snapshot before cascade) |
| **the family CANCEL notice, a teacher's own leave** | `reportOwnLeave` → `sendClassCancelledToFamilies` | all seats → **live seats** (its rows are read with seats before any cancel) | ✅ by value (the rule) |
| **the family CANCEL notice, the group-series cancel-all** | `other-series` → `classCancelledFamilyAccounts` | all seats → **live seats** (`seriesRows` loads them before the cascade) | ✅ by value (the rule) + by source (read before cascade) |
- **🚫 Private and DUO rows: unchanged** (their two children), pinned by value.

## §3 The rest of your rulings
- **EXTENDED stays in.**
- 📌 **Named for the owner, not changed:** the family **cancel** notice is `CONFIRMED`-only, so **today a family is NOT told when their child's make-up (`EXTENDED`) is cancelled.** That's a gap, not a pattern to copy.
- **The chain stays**, and the **retry-reordering limit is now written in `announceMove`'s comment** (with your line: two true messages in the wrong order beat one that might be wrong).
- **The dead status and template stay dead.**

## §4 Proof and mutations
- `announce-move-task516.test.ts`, +4 (§2's rows).
- **Mutations:** **the rule counts cancelled seats again:** BITES (3) · **the admin cancel re-reads after the cascade:** BITES (source pins; the full admin cancel isn't driven by value, and I'm saying so).

---

# ✅ DONE — REVIEWED by @Sober (2026-09-27). (Next deploy.)
**3400 / 0 normally and unreachable** · tsc 0 · 60 = 60.

🔴 **The trap he closed is one MY ruling created, and he found it before it shipped.** I said "drop cancelled seats from the household rule". **The admin's group cancel cascades the seats FIRST** — so by the time the rule read them, **every seat was cancelled and the notice would have gone to NO family at all.** ⇒ **a cancel that tells nobody, caused by a filter added to stop telling the wrong people.**
🔑 **He snapshots the seats before the cascade.** 📌 **And the general lesson is mine: a filter on "current state" inside an operation that is changing that state reads the wrong side of the change.** I have asked for "the status at the moment of the act" before without noticing I was asking for it again here.
✅ **The audience changes are listed and pinned, all GROUP-only** — the move, the admin's group cancel, a teacher's own leave, the series cancel-all; **private and DUO unchanged.** That is the list I said I would rather read than discover in Tanya's round, and it is four notices, not one.
✅ Retry limit written in the code, as asked. ✅ EXTENDED kept in.
📌 **Named for the owner, and I am passing it up:** **a cancelled make-up is never told to the family** — the cancel notice is CONFIRMED-only. **We will now tell a family their make-up MOVED but not that it was CANCELLED.** That asymmetry is worth his attention and it is not ours to close quietly.
