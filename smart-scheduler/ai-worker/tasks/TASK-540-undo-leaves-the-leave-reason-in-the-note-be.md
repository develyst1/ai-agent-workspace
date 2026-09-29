# TASK-540 — F1: an undone leave leaves the leave's reason in the booking Note — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-28) · **Size XS.** Tanya, TEST-075 F1.

## §0 What it is
Undoing a leave returns the session to CONFIRMED — **and leaves the leave's reason sitting in the booking's `Note`.** ⇒ **a CONFIRMED session reads *"Note: <the reason they were away>"*** (`B-modal-confirmed-actions.png`).
🔑 **It is small and it is the same family as everything else this week: a record that says something that is no longer true.** **The class is not cancelled, nobody is away, and the note still explains an absence.**

## §1 Build
- **On a leave Undo, the note the leave wrote is undone too** — 🔑 **and "undone" is the word: if the booking had a note BEFORE the leave, it comes back; if it had none, the field is empty.** ⚠️ **Do not simply clear it** — **clearing would destroy an admin's own note on a booking that happened to be leaved**, which is a second, quieter version of this defect.
- **Establish first whether the pre-leave note is recoverable.** 📌 The leave door at `scheduler.service` writes `note: change.reason ?? b.note` — **so the old note may be gone rather than stored.** 🔑 **If it is unrecoverable, say so and clear only when the note is EXACTLY what the leave wrote**, leaving anything else alone. **An honest partial fix beats a confident wrong one.**
- **Pinned by value:** a leave with a reason, undone ⇒ **the note is what it was before** (or empty if there was none) · **a booking with its own note, leaved and undone ⇒ that note survives** · the check-in Undo path **unchanged** (it never wrote a note).
- 🚫 Nothing else about Undo moves — the status, the counters, the coach notice, the silence to the family.

## §2 What I want stated
- **Whether the pre-leave note is stored anywhere** (the `booking_undos` row? the leave's own write?) — **and if TASK-492's append-only record could carry it, say so**: that would make this exact, and it is the kind of thing that record exists for.

## Definition of Done
- [ ] The leave's note undone, **not blindly cleared** · the pre-leave note restored **where recoverable**, with the recoverability **established and stated** · an admin's own note **surviving**, pinned · the check-in path unchanged · suite **count** normally **and unreachable** · tsc 0 · 60 = 60 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that clears an admin's own note and one that leaves the leave's reason behind · report here + `inbox/SA.md` + log.

---

# ⏸️ STOPPED — @Jason (2026-09-28): the pre-leave note is UNRECOVERABLE, and the leave's own note is UNDETECTABLE, so even the partial fix can't be done honestly. The exact fix needs one small migration: yours to rule. **Nothing built.**

## §1 Recoverability, established from the code (your §2)
- **Two leave writers, both `note: <reason> ?? <old note>`:**
  - the plan editor (`scheduler.service`: `.set({ status: "SICK_LEAVE", note: change.reason ?? b.note, … })`);
  - the status action `sick-leave` (`.set({ status: "SICK_LEAVE", note: reason ?? current.note, … })`).
- ⇒ **A leave WITH a reason overwrites the note in place.** The old note isn't copied anywhere.
- **Nothing else records it:**
  - there's **no audit / event table** for booking writes;
  - the leave notice's outbox payload carries `attendeeNote` (the booking-time note, TASK-178), **not** the leave's reason.
- **`booking_undos` (TASK-492) CANNOT carry it as built:** that row is written **at Undo time**, and by then the leave has already overwritten the note. **The only moment the pre-leave note exists is the leave's own write.**

## §2 🔑 Why the partial fix ("clear only when the note is EXACTLY what the leave wrote") is also impossible
- To clear *exactly what the leave wrote*, the Undo must know **what the leave wrote**, and **nothing stores that either.**
- At Undo time **two cases are indistinguishable:**
  - **(a)** the leave gave reason *R* ⇒ the note is *R* (the admin's note, if any, is already gone);
  - **(b)** the leave gave **no** reason ⇒ the note is **still the admin's own** note *A*.
- **Both look like "a CONFIRMED-bound row with some note".**
  - Clearing on Undo destroys *A* in case (b): **the quieter defect you warned about**.
  - Keeping leaves *R* in case (a): **the defect Tanya reported**.
- Any rule over today's data is a guess, so **I stopped** (your "an honest partial fix beats a confident wrong one" has no honest partial here).

## §3 The exact fix (proposed, NOT built): record at the leave, restore at the Undo
- **Migration 0060** (⇒ **61 = 61**), two nullable columns on `bookings`, written **by both leave writers in the same `UPDATE`**:
  - `leave_note_replaced boolean NOT NULL DEFAULT false`: true **only when the leave actually wrote a reason**;
  - `note_before_leave text NULL`: the note it replaced (NULL is a real "there was none").
- **The Undo:** if `leave_note_replaced`, set `note = note_before_leave`; **otherwise leave the note alone** (case (b): the admin's note survives). Then clear both columns.
- 🔑 **Honest about the past:** leaves made **before** the deploy have `leave_note_replaced = false`, so their Undo **leaves the note as is**. We can't know what they overwrote, and this doesn't pretend to.
  - Tanya's TEST-075 row is one of those. It would need a hand edit, or a fresh leave after the deploy, to show the fix.
- **`booking_undos` could ALSO record `note_before` / `note_after` of each Undo**, making the record append-only-auditable as TASK-492 intended. That's optional, and I'd do it in the same migration.
- **Size:** S, not XS (a migration + two writers + the Undo + pins).
- 🚫 **Nothing else about Undo moves:** status, counters, the coach notice, the silence to the family, and the check-in path, which never wrote a note.

## §4 Mutations I would pin (when ruled)
- The Undo **clears an admin's own note** (case b) ⇒ must bite.
- The Undo **leaves the leave's reason** (case a) ⇒ must bite.
- A **pre-deploy leave's note touched** ⇒ must bite.

⛔ **Your ruling:** (1) the migration as above (± the `booking_undos` audit columns), or (2) something else. Nothing is built.

---

# 🔨 RULING — @Sober (2026-09-28): **build the exact fix (migration 0060). 🚫 Skip the optional audit columns.** ▶️ Go.

**Stopping was right, and §1 is the answer I asked for rather than the one I hoped for.** I wrote *"clear only when the note is EXACTLY what the leave wrote"* — 🔑 **and that instruction needs to know what the leave wrote, which nothing stores.** ⇒ at Undo, **the leave's reason R and an admin's own note A that a reason-less leave left alone are indistinguishable.** **Clearing kills A; keeping leaves R.** **There is no honest version of my instruction, and you said so instead of picking one.**
✅ **And you checked the place I suggested rather than dismissing it:** `booking_undos` **cannot** carry it as built, because **it is written AT the Undo, after the overwrite** — *the only moment the old note exists is the leave's own write.* 📌 I checked one more myself: `cancelReason` stores a **category** (`TEACHER_LEAVE`), not the text, so it does not rescue this either.

## The ruling
✅ **Both leave writers record `leave_note_replaced` + `note_before_leave` in the same UPDATE**, and **the Undo restores only when `replaced`** — otherwise **it leaves the note alone.** 🔑 **That is the fix being exact rather than clever: the ambiguity is removed at the only moment it does not exist.**
✅ **Pre-deploy leaves untouched, and SAID so.** ⚠️ **Tanya's row is one of them** — **so this does not fix her screenshot**, and I would rather tell Porter that than have her re-test it and find the same note. **An honest forward-only fix beats a guess applied to history.**
🚫 **Skip the optional `booking_undos.note_before / note_after`.** Nobody has asked for that audit, and **a column added "while we are in there" is how a schema grows things nobody can later explain.** 📌 **Name it in the task as available** — if the owner ever wants the history, it is a small follow-up with a reason behind it.
⚠️ **One thing to hold to: this is a STAFF-facing stale note, and it is now costing a migration.** **Keep it to the two columns and the restore** — **if the honest version grows beyond that, stop and tell me**, because at that point the proportion has changed and it is my call, not yours to absorb.

## Definition of Done — amended
· `leave_note_replaced` + `note_before_leave` written by **both** leave doors in the same UPDATE · the Undo restoring **only when replaced**, otherwise untouched, pinned both ways · **an admin's own note surviving a reason-less leave and its Undo**, pinned · **pre-deploy rows untouched and stated** · 🚫 no audit columns · migration **0060 (61 = 61)** with its witness a created object · suite **count** normally **and unreachable** · tsc 0 · 🔑 the two mutations from the original DoD, plus one that restores on a row where `replaced` is false.

---

# ✅ REPORT — @Jason (2026-09-28): the exact fix as ruled. Two columns + the restore, no audit columns · **3499 / 0 normally, and 3× unreachable with plain `bun test`, 0 failed queries** · tsc 0 · **61 = 61** (0060) · four mutations bite

## §1 What was built
- **`drizzle/0060_leave_note_undo.sql`** (hand-written, per drizzle/README): `bookings.leave_note_replaced boolean NOT NULL DEFAULT false` + `bookings.note_before_leave text`.
  - `IF NOT EXISTS` on both; no backfill.
  - Journal idx 60 (`when` 1783000000056).
  - **Witness:** the column `note_before_leave` (the last object the file adds).
- **`lib/leave-note.ts`**, two pure halves:
  - `leaveNoteWrite(reason, before)`: a non-null reason ⇒ `note = reason`, `replaced = true`, `noteBeforeLeave = before`. None ⇒ the note untouched and `replaced = false`. **`reason ?? note` semantics exactly as before** (an empty-string reason still replaces).
  - `leaveNoteUndo(row)`: **restores only when `replaced`**, and clears the record. Otherwise it returns **an empty set**, so the note isn't touched.
- **Both leave writers** (the plan editor and the `sick-leave` action) now write through `leaveNoteWrite`, in the same `UPDATE` as the status.
- **The Undo** (`undo.service`, the leave branch's guarded flip) applies `leaveNoteUndo(row)` in the same `UPDATE`.

## §2 ⚠️ One edge I closed, inside the proportion (one line, no new column)
- A **staff edit of the note WHILE the booking is on leave**: a plain restore would overwrite that edit with the pre-leave note. That's the quieter defect again, created by the fix.
- **The one edit path** (`patch.note = input.note`) now also sets `leaveNoteReplaced = false`: **a person's edit supersedes the leave's note**, and the Undo leaves it alone.
- There's only one such path in the service, and the rest stays two columns and the restore. Pinned, and a mutation removing it BITES.

## §3 Pinned by value (the real `undoBooking` harness) + source
- **A leave WITH a reason over an admin's note, undone ⇒ the admin's note is back** (and the record cleared).
- **A leave with a reason over NO note, undone ⇒ empty.**
- **A reason-less leave on a booking with the admin's own note, undone ⇒ the note SURVIVES.**
- ⚠️ **A pre-0060 leave (nothing recorded) ⇒ the note is left exactly as is.** That's Tanya's TEST-075 row, **so this doesn't fix her screenshot**. She needs a new leave after the deploy (or a hand edit of that one note) to see it.
- **The check-in Undo never touches the note**, even with a stale record on the row.
- The pure halves by value; **both writers go through the ONE helper and no leave writes the note by hand** (source).
- 🚫 Unchanged: status, counters, the coach notice, the silence to the family.

## §4 Moved pins (counts / source only, each commented `🔻 TASK-540`)
- **Migration-count pins 60 → 61**: 59 lines across 36 test files, bumped by a script that touched **only** lines about files / journal / tags / witnesses, never `ACTION_KEYS` / `KINDS`. Plus two more by hand (a witness judge and a tag count).
- TASK-492's source pin now names `...leaveNoteWrite(...)` in the two leave doors (the charge half unchanged).
- TASK-497's "0059 is the last journal entry" is now pinned by index (0060 follows).

## §5 Break-and-watch (CHECKSUM identical, every restore byte-identical, BASELINE=44)
- **C: the Undo clears an admin's own note:** **BITES**.
- **R: the Undo leaves the leave's reason behind:** **BITES**.
- **E: a staff edit no longer supersedes the leave:** BITES.
- **W: one writer bypasses the record:** BITES.

## §6 📌 For the deploy (Porter / the owner)
- 🔴 **`bun run db:migrate` BEFORE the new code runs.** Both leave writers now write the two new columns, **so on an un-migrated database every leave would fail.** Migrate first, then restart (the usual order; it's now load-bearing).
- 📌 **Available, not built** (your ruling): `booking_undos.note_before / note_after`, if the owner ever wants an Undo's note history. That's a small follow-up with a reason behind it.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-28)
Verified: **3499 pass / 0 fail normally AND with the database unreachable** · tsc 0 · **61 files = 61 journal tags.**

🔑 **The edge he closed is the one his own fix created, and finding it is the whole difference between a fix and a swap:** **a staff note EDITED during the leave would have been overwritten by the restore.** ⇒ **we would have replaced "the leave's reason lingers" with "an admin's later note silently disappears"** — **quieter, later, and much harder to trace.** ✅ **One line resets `replaced` on the edit path, and no column for it.** 📌 **Within the proportion I set, and he said so rather than reaching for another column.**
✅ **By value through the real `undoBooking`, including the two that matter most:** **a reason-less leave ⇒ the admin's note survives**, and **a reason over an admin's note ⇒ the admin's note comes back.** ✅ **Pre-0060 untouched**, stated — **Tanya's row is not fixed by this, as agreed and as Porter has already been told.**

## 🔴 His deploy note is load-bearing and it is mine to carry
**`db:migrate` must run BEFORE the new code**, or **every leave write fails on the new columns.**
📌 **That is the first time in this round that the order is not merely tidy but required**, and **a deploy list that says "migrate, then deploy" without saying WHY invites someone to reorder it under pressure.** ⇒ **added to the sid deploy file in his words, with the consequence attached.**
