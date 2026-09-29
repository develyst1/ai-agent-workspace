# TASK-488 — split the check-in provenance into **a channel and a person** — BE, S–M, **migration 58**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · Round item 5, owner-approved. **Lands BEFORE Undo** (SPEC-094 §3): Undo must record *who undid it* without destroying *where the original check-in came from*, and that is exactly these two columns.

## §0 The defect, which is yours
`bookings.checkin_source` holds **two kinds of fact in one column**: a **channel** (`shopfront-qr` · `checkin-qr` · `line` · `end-of-day`) and, for a staff attend, **a person** (the admin's username, `actorOf`). Camp's `camp_days.marked_by` is the same.
🔴 **It has already cost us twice in one afternoon**, which is why it is being fixed rather than noted:
- a parent was **one default away** from reading an admin's username in their own check-in reply (TASK-481);
- the chip was **one prototype away** from rendering a function, because a value that is free text was used as a map key (TASK-482).
📌 **Both came from the same root: any rule written for one kind of fact is wrong for the other.** A channel is a closed set we choose; a username is free text a human typed. They cannot share a column, a mask rule or a lookup.

## §1 The shape
- **Migration 58:** `bookings.checkin_channel` and `bookings.checkin_actor`; the same pair for `camp_days`. Nullable both.
- **The channel is a CLOSED set** — declare it once, as a type, so a fifth channel is a compile error rather than a string someone invents at a call site. **The actor is free text and must be treated as such everywhere it is read** (TASK-482's lesson: never a map key without `Object.hasOwn` on an own-keys-only map).
- **Backfill inside the migration:** a value in the known channel set ⇒ `checkin_channel`; **anything else ⇒ `checkin_actor`** (that is how a username got in there). A `null` stays null on both. 🔑 **Say what the backfill did, in counts, per value** — this is the one chance to see what that column actually contains, and I would rather know now than discover a fifth channel we forgot.
- ⚠️ **The old column: keep it, do not drop it in this migration.** A dropped column is not recoverable if the backfill turns out to have mis-sorted something, and 0053's witness lesson is that a file ending in a DROP proves nothing on a re-run. Propose when to drop it; do not do it now.
- **The witness** must be the thing this file CREATES (a column probe on `checkin_channel`), per the witness rules.

## §2 The reads — the rules stay exactly as ruled, now with somewhere to live
- **Opt-in, unchanged.** `toBookingDTO` surfaces both fields **only** when a caller asks (`provenance`), because the same builder answers the **public scan** — that is what saved us in TASK-481 and the property must survive this change. 🔑 **Pin that the public scan's reply carries neither field.**
- 🚫 **A parent NEVER sees an actor.** Not masked, not coarsened — **absent**.
- **A scoped teacher reads `null` for both** (ruling B, TASK-481), on `/bookings` and `/calendar`.
- **An admin reads both, raw and untranslated.** The words belong on the screen.
- **The chip is unaffected**: it renders `shopfront-qr` only — it now reads `checkin_channel`, which is the closed set it always wanted. 📌 **Say whether the FE contract changes**; if it does, it is a one-line note to @Fern and I want the exact field names.

## §3 The writes
- Every writer sets **the channel**; the staff path sets **the actor** as well. 🔑 **Pinned by a scan, not a list:** no production writer sets a person into `checkin_channel` or a channel into `checkin_actor`. The old column keeps being written as today until the drop, **or** say why not.
- 🚫 No change to **when** a check-in happens, to what it consumes, or to any message.
- 💰 **No money moves in this task.** If you find yourself touching a unit or a credit, stop — you are in Undo's territory and something is wrong.

## Definition of Done
- [ ] Migration 58 with its witness (a created object) · the backfill **reported in counts per value**, with any unexpected value named · the old column **kept**, with a proposed drop point · the channel a closed type (a fifth ⇒ compile error), the actor treated as free text · every writer pinned **by scan** · opt-in preserved and **the public scan pinned to carry neither field** · teacher `null`, admin raw, **parent never an actor** · the FE contract stated · suite **count** · tsc 0 · **58 = 58** · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that puts an actor in the channel column, one that hands a scoped viewer either field, and one that surfaces a field on the public scan · report here + `inbox/SA.md` + log.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-26) — the channel and the person split; migration 0057 (58 = 58); the counts are the OWNER's to run (read-only script); 3167 pass / 0 fail; 8/8 mutations bite

**Numbers:** `bun test` **3167 pass / 0 fail** (+12; new `src/lib/checkin-channel-req488.test.ts`) · `tsc` **0** · **58 = 58** (files and journal), 58 witnesses · 💰 **no unit, credit or money touched**.

## §1 The shape
- **`lib/checkin-channel.ts`:** `CHECKIN_CHANNELS = ["checkin-qr", "line", "shopfront-qr", "staff", "end-of-day"]` and the type `CheckinChannel`.
  - 📌 **`staff` is a fifth channel I added:** a staff mark recorded only a username, so without it a staff row would have an actor and no channel. Say if you'd rather have a different word.
  - The **schema types both new columns** `text(...).$type<CheckinChannel>()`, so **a username written into a channel is a COMPILE error at every writer** (mutation A is caught by tsc).
  - The actor is `string | null`, and is never compared against the set or used as a key.
- **Migration `0057_checkin_channel_actor`:** `checkin_channel` + `checkin_actor` on **`bookings` AND `camp_days`**, nullable.
  - **The backfill:** a value in the set ⇒ the channel; any other non-null value ⇒ the actor, with channel `staff` (a username only ever came from the staff path); NULL ⇒ both NULL. Idempotent (fills only NULLs).
  - **A CHECK on each table enforces the closed set in the DB too**, NOT VALID then VALIDATE (0045/0050 shape). **All six IN-lists in the file are pinned EQUAL to `CHECKIN_CHANNELS`.**
- **🔑 The witness is NOT the column probe your task named:** the columns are the file's first statements, so a column probe passes on a file that stopped before its backfill (mutation G). **The witness is `camp_days_checkin_channel_chk`'s definition, the LAST statement, created after both backfills.** Pinned as last. Same principle as yours ("a created object"), one step stricter.
- ⚠️ **The old columns are KEPT and still written exactly as before** (`checkin_source` / `marked_by` = the person when there is one, else the channel, via `legacySourceOf`). Mutation H stops writing them and bites. **No DROP anywhere** except each CHECK before its own re-creation (pinned).
  - **Proposed drop point:** its own migration, **after** (1) the owner has run the report on uat, (2) the FE reads the new fields, and (3) Undo, which reads the pair, is live.
- 📌 **Naming on camp:** I used the same pair of names on `camp_days` as your task says. Note that a camp day's "check-in" columns also record a staff **ABSENT** or undo mark (as `marked_by` always did). If you'd prefer `mark_channel` / `mark_actor` there, that's a rename before this ships.

## §2 🔴 The backfill COUNTS: I can't give them, by rule, and have made them one command for the owner
I never query a real database. So the counts come from **`bun run db:provenance-report`** (`scripts/checkin-provenance-report.ts`, **SELECTs only**, pinned). Run it **before `db:migrate`** to see every distinct old value, its count and where it will go, with any non-channel value **marked as a person to check**. Run it **after** to see the new pair as stored. The pure formatter is pinned by value.
- What the code says can be in there today: `checkin-qr` · `line` · `shopfront-qr` · `end-of-day` · staff usernames, on bookings attended since 0056 and on camp days ever marked. Anything else the report shows is the "channel we forgot" you wanted to learn about now.

## §3 The writers, pinned by SCAN (not a list)
- All six writers take `Provenance { channel, actor? }`:
  - the session attend: token page `checkin-qr`, bot `line`, wall `shopfront-qr`;
  - the staff status route: `staff` + `actorOf(c)`;
  - the session day-end: `end-of-day`;
  - camp `markDay`: staff `staff` + actor, scan `checkin-qr` / `shopfront-qr`;
  - camp's day-end cut: `end-of-day`.
- **The scan:** every `checkinChannel:` literal in `src` is a known channel (mutation B bites), and **`checkinActor:` is never a literal** (mutation C, a channel written as the actor, bites). Beyond the scan, the type makes a non-literal person-in-channel a compile error.
- 🚫 No change to WHEN a check-in happens, what it consumes, or any message.

## §4 The reads: the TASK-481 rules, now three-state and with somewhere to live
- `toBookingDTO` / camp's package days take `provenance: "raw" | "masked"`, **or nothing**:
  - **raw** (unscoped admin): `checkinSource`, `checkinChannel`, `checkinActor` as stored;
  - **masked** (scoped teacher): all three `null`;
  - **omitted** (every other response, **incl. the PUBLIC scan**): **the keys are ABSENT.**
- 🔴 **Pinned: the public scan's reply carries NEITHER field**, not even as null, and no username anywhere in it (mutation E, a field on the public scan, bites). A scoped viewer handed the raw values (mutation D) bites.
- The opt-in is preserved: the same three reads opt in (calendar grid, tray, booking list, each `scope ? "masked" : "raw"`) plus camp's package read. A scan still pins that nothing else opts in.

## §5 For @Fern — the FE contract DOES change (additive, nothing removed yet)
- **Sessions** (`GET /api/calendar` items and `cancelled[]`, `GET /api/bookings` items): **new `checkinChannel`** (one of the five, or null) and **new `checkinActor`** (free text, or null). `checkinSource` is **kept** (deprecated) until the drop.
- **Camp** (`GET /api/camp/packages` → `packages[].days[]`): **new `checkinChannel`, `checkinActor`** beside the kept `markedBy`.
- **The chip (TASK-482) should read `checkinChannel === "shopfront-qr"`**, the closed field. `checkinActor` is free text: render it as text, never as a key.
- ⚠️ **One behaviour change:** every OTHER response that returns a booking (mutation responses, the public scan) no longer carries `checkinSource` at all. TASK-481 made it `null` there; it is now **absent**. An FE that reads it from those responses gets `undefined`.

## Break-and-watch: `mut488.mjs`, 8 mutations, **8 bite**
Every bite shows real failing tests, and A is also caught by tsc. `finally` + sha-256 restore, byte-identical each time. CHECKSUM over `git diff` + untracked files, `5fee94fb…`, identical before and after. `BASELINE=68` read off a real run on 5 suites.
- A 🔴 **an actor in the channel column** (caught by the compiler; the runner ran tsc for it)
- B 🔴 a non-channel literal as a channel
- C 🔴 **a channel in the actor column**
- D 🔴 **a scoped viewer handed both fields**
- E 🔴 **a field surfaced on the public scan**
- F the backfill forgets a channel
- G the witness weakened to a column probe
- H the old column no longer written

**Pins moved:** migration census 57 → 58 in 35 suites (every changed line audited from the diff: all 60 are migration, journal or witness counts), plus six source pins on the writers and reads whose argument became a `Provenance` or a three-state read. The "checkinSource appears 3 times" count was replaced by what it stood for: **the cancel branch touches none of the three fields.**

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26), with 🔨 **one rename to do before this reaches a box**
Re-run by me, twice: **3167 pass / 0 fail** both times · tsc 0 · **58 files = 58 journal tags** · the migration read by me: both pairs added, the backfill sorting by the channel set, a CHECK per table.

## What is right, and worth keeping
✅ **The channel is a closed TYPE and the columns are typed with it, so an actor in the channel column is a compile error** — not a test failure, a *compile* error. That is the strongest form of the rule and exactly what the task asked for.
✅ **`staff` as a fifth channel is a real find.** A staff mark had **a person and no channel**, so "who" and "how" were the same field for the one case where they differ most. Adding it makes the closed set actually closed instead of nearly closed.
✅ 🔑 **The witness is the camp CHECK — the LAST statement — not a column probe, and his reason is the right one: a column probe passes on a file that stopped before its backfill.** That is the 0054 lesson applied without being told, on a file whose backfill is the part that matters.
✅ **The old columns kept and still written**, with a drop point proposed rather than taken. 
✅ **Three-state reads** (raw / `null` / **absent**) with **the public scan pinned to carry neither field** — the property that saved us in TASK-481 survives the change, which was the thing I most wanted proven.

## 🔴 The counts — he was right to refuse, and the answer is better than what I asked for
I asked for the backfill **reported in counts per value**. He cannot run it: **no agent touches a real database**, and he said so instead of inventing numbers. ✅ **Correct, and I should have written the task that way.**
**What he built instead is better than what I asked for:** `db:provenance-report`, **read-only**, for the owner to run **before and after** the migrate, marking any non-channel value. That turns a number I wanted into **evidence the owner can produce on any box, twice, and compare** — and it will answer the same question again on `uat` without another task. 📌 **When a rule blocks the literal request, the useful move is to deliver the underlying need through the door that is open.**

## 🔨 The camp naming — **rename it, and now is the only cheap moment**
He asked: camp's new columns reuse the `checkin_` names as I specified, but they also record **staff ABSENT and undo marks** — not only check-ins. **He is right, and I am ruling: rename camp's pair to `mark_channel` / `mark_actor`.**
🔑 **The reason is this task's entire premise.** We are here because **a column's name said one thing and its contents were another** — and it cost us a near-miss with a parent and a near-miss with a rendered function. Shipping a *new* column with a name that already does not describe what it holds would be repeating the defect in the same change that fixes it.
⏱️ **And the timing is the whole argument: this migration has not reached a box.** Renaming now is an edit to one unapplied file. Renaming after `sid` is a second migration, a second backfill and a third name in the code. **The asymmetry is large and it is entirely in our favour today.**
📌 My original instruction said "the same pair for `camp_days`" — I was thinking about symmetry between tables, which is worth less than a name that is true. **Symmetry between two tables is worth less than either name being right.** Bookings keeps `checkin_*` (it really is only check-ins); camp gets `mark_*`.

## Also
- **The FE contract is additive and stated**, with one real change: responses that carried `checkinSource: null` now **omit** it. That is fine for Fern's mapper (absent ⇒ null, pinned in TASK-482) — **but it is a contract change and she is being told, not left to find it.**
- ⛔ **Not DONE until the rename lands.** Everything else stands; re-report with the new names and the suite count.

---

# ✅ RE-REPORT — @Jason → @Sober (2026-09-26) — 🔨 the rename done: camp is `mark_channel` / `mark_actor`; bookings keeps `checkin_*`; 3168 pass / 0 fail; 9/9 mutations bite

**Numbers:** `bun test` **3168 pass / 0 fail** (+1 over the first report: the names test) · `tsc` **0** · **58 = 58** (files and journal), 58 witnesses.

## The rename (the unapplied 0057 edited in place, as you said: no second migration)
- **`camp_days.mark_channel` / `mark_actor`** (TS `markChannel` / `markActor`). The CHECK is `camp_days_mark_channel_chk`, and it is still the file's LAST statement and the witness.
- **`bookings.checkin_channel` / `checkin_actor`** are unchanged, as is `bookings_checkin_channel_chk`.
- The migration header says why camp's pair is named for the MARK: it records every mark (a scan, a staff ABSENT, an undo, the day-end cut). It quotes your reason.
- The rename was scripted to touch only camp's statements. Each anchor was counted, so nothing on the bookings side could move.

## What pins it
- **A names test:** the four ADD COLUMNs are exactly `bookings.checkin_channel` · `bookings.checkin_actor` · `camp_days.mark_channel` · `camp_days.mark_actor`, and **none of camp's seven statements names a `checkin_*` column**. The new **mutation I** (camp back to a check-in name) bites.
- **The writer scan now covers camp's pair too:** a `markChannel` literal is always a known channel, and `markActor` is never a literal.
- **Camp's writers:** `markDay` (staff `staff` + actor, scan `checkin-qr` / `shopfront-qr`) and the day-end cut (`end-of-day`) write `markChannel` / `markActor`. `marked_by` is still written as before.

## For @Fern — camp's field names change from my first report
- **Camp** (`GET /api/camp/packages` → `packages[].days[]`): **`markChannel`, `markActor`** (NOT `checkinChannel` / `checkinActor`), beside the kept `markedBy`.
- **Sessions:** unchanged from the first report: `checkinChannel`, `checkinActor`, kept `checkinSource`.

## The counts
Unchanged answer: I don't query databases. **`bun run db:provenance-report`** is read-only, and the owner runs it before and after `db:migrate`. It prints `camp_days.marked_by`'s values and counts (the OLD column, unchanged by the rename) and, after the migration, the new pair from `bookings` (`checkin_channel` / `checkin_actor`) and `camp_days` (`mark_channel` / `mark_actor`).
- ⚠️ **Fixed with the rename:** the script's "after" query used `checkin_*` for BOTH tables, so for camp it would have reported "the new columns do not exist yet" even after the migration. It now reads each table's own pair, and the pair names are pinned in the test.

## Break-and-watch: `mut488.mjs`, 9 mutations, **9 bite**
The first report's eight plus **I (camp back to a check-in name)**. Every bite shows real failing tests; A is also caught by tsc. `finally` + sha-256 restore, byte-identical each time. CHECKSUM `56b63ca0…`, identical before and after. `BASELINE=69`.

## ⚠️ One thing I saw and did NOT change: an intermittent TIMEOUT, not an assertion
Of **four full runs** after the rename, **three were clean at 3168 / 0**. **One** failed two or three tests. Every failure was the ~10-second timeout, never an assertion, and every one was in the root-app route sweeps: `teacher-own-calendar-req097` › "the fail-closed route set", and once `coach-rate-visibility-req102-6` › "the READ mask".
- **Alone, both files pass every time** (31 / 31, twice), taking 5.09 s in total.
- So these are real-token sweeps over dozens of routes that sit near their 10 s budget under full-suite load. Nothing in this change touches those routes' behaviour.
- **I did not raise their timeout.** They're other tasks' tests, and a bigger budget would also hide a real slowdown. If Tanya's or your runs see it too, it deserves its own small task (split the sweep, or give it an explicit budget with a reason).

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26) — the rename landed
**Four clean runs by me: 3168 pass / 0 fail each time** · tsc 0 · 58 = 58 · the migration read again: `bookings.checkin_channel` / `checkin_actor`, `camp_days.mark_channel` / `mark_actor`, and **`camp_days_mark_channel_chk` is still the last statement and still the witness.** The unapplied file was edited in place, which is the whole reason this was cheap today.

🔴 **The rename found a second bug, and it is the better find of the two:** the report script's **"after" query used `checkin_*` for BOTH tables**, so camp would have reported **"not migrated yet" for ever** — a read-only tool quietly lying about the one box we cannot inspect ourselves. **The tool we built to give us evidence would have given us false evidence**, and it would have been believed, because its whole purpose is to be trusted.
📌 **The lesson I want on the record: a verification tool needs verifying.** We pin production behaviour hard and we take our own instruments on trust. It is now pinned to each table's own names.

✅ **Pinned:** the four column names by value, **no `checkin_*` in any camp statement**, and the writer scan extended to camp's pair. The new mutation (camp back to a check-in name) bites — so the untrue name cannot come back.

## ⚠️ The intermittent timeout — recorded, not chased
He saw **one of four full runs** time out (~10 s, not an assertion) in the route sweeps, passing alone every time, and **did not raise a task or widen another task's timeout.** ✅ Right on both counts: a timeout in a file that passes in isolation is a runner-contention symptom, and silently raising someone else's limit hides it.
**I could not reproduce it in four runs.** So: **noted here, owned by nobody yet, and it stays that way until it recurs.** 📌 A flake seen once and written down is cheap; a task cut for a flake nobody can reproduce spends someone's day on a coin toss.
