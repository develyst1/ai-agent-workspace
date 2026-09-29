# TASK-466 — 🔴 the extender would RESURRECT a cancelled group date: it reads only LIVE rows, so a date an admin cancelled is invisible to it and gets re-created — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-25) · **Size S.** No migration. **Before the extender is scheduled anywhere** (it is still unscheduled on every box).

## §0 The hole, stated precisely
`runGroupSeriesExtenderJob` selects GROUP rows with `status IN COURSE_LIVE_STATUSES` (`jobs.service.ts:646`), and `weeklyDatesToCreate` anchors on the **last date among those rows**. So a future date whose row an admin **CANCELLED** is not in `existing` — the job cannot see it, and:
- if the cancelled date is the series' last one, the anchor moves BACK to the last live row and **the cancelled date is created again**, as a new row, that same night;
- a CANCELLED row does not hold the slot (`SLOT_INACTIVE_STATUSES`), so nothing clashes and nothing complains. The admin cancels a session; the job quietly puts it back; the parents' next reminder announces a class that was called off.
📌 This is the "skipped-date" hole Porter has been carrying. It is also the case TASK-456 reasoned away: the "skip a date that already exists" guard was removed as unreachable **because the anchor is the maximum existing date** — true for LIVE rows, and the removal is what makes a cancelled one invisible. The reasoning was sound about the set it was given; the set was the wrong one.

## §1 Build
- **The extender must consider every row of the series, not only the live ones** — a date that has ANY row (live, cancelled, attended) is a date the series has already had, and the extender must not create a second one there. The cheapest honest shape: read the series' rows without the status filter for the purpose of *"which dates exist"*, while everything that judges the series (closed? which template?) keeps using the live rows as it does today. Say which reads you split and why.
- **And the anchor question, which is the real decision:** if the last two dates were cancelled, does the series end there, or does it continue from the last SCHEDULED date? I say **continue from the last date the series ever had** — a cancelled session is a cancelled session, not the end of a weekly class; the alternative silently shortens every series an admin ever edits. ⚠️ But state what your fixture shows, and pin the case both ways so the next reader can see the choice.
- 🔑 **Pinned by value, and this is the point:** a series whose next two Tuesdays are CANCELLED gains **no** row on either date, keeps its cadence afterwards, and a second run creates nothing. Plus the case that started this: cancel the LAST date ⇒ the extender does not re-create it.
- 🚫 No change to the closed-series skip, the template rule, the bounds, or the dry-run default.

## Definition of Done
- [ ] The cause restated in your own reading · the split reads named · the anchor decision argued and pinned both ways · a cancelled date never re-created (by value, incl. the last-date case) · a second run idempotent · suite **count** · tsc 0 · 56 = 56 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that reads only live rows again (the defect) · report here + `inbox/SA.md` + log.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-25) — a cancelled date is a date the series HAD; 2974 pass / 0 fail; 4/4 mutations bite

**Numbers:** `bun test` **2974 pass / 0 fail** (+10, new file `src/lib/extender-cancelled-dates-req105.test.ts`) · `tsc` **0** · 🚫 no migration (56 = 56) · 0 pins moved.

## §0 The cause, in my own reading — and it was my reasoning
The read was filtered to `COURSE_LIVE_STATUSES`, so the date set handed to `weeklyDatesToCreate` held LIVE dates only. Cancel a series' LAST date and the anchor fell back to the last live one; the next weekly step WAS the cancelled date; a CANCELLED row holds no slot (`SLOT_INACTIVE_STATUSES`), so the insert succeeded with nothing clashing. 📌 In TASK-456 I removed the "skip a date that already exists" branch as unreachable **because the anchor is the maximum existing date** — true of the set it was given, and that set being LIVE-only is precisely what made a cancelled date invisible. Sound reasoning about the wrong set. 📌 Also worth saying: **the full suite stayed green through the fix before any new test existed** — every older extender fixture had live rows only. That is how this sat unseen.

## §1 The split reads — ONE query, two questions
The GROUP rows are now read **once, with no status filter**, and split in memory:
- **"which dates has this series ever HAD?"** ⇒ ALL rows (live · cancelled · attended) — the date set and the ANCHOR.
- **"does the series still run, and what does it look like now?"** ⇒ the LIVE rows, exactly as before — so a series with no live row left (cancelled in full) is **not iterated at all** (a cancel-all stays terminal), and the **template is still the last LIVE row** (a cancelled row is not what the class looks like today). The closed-series skip is unchanged.
One query rather than two because the second would read the same rows again for a different filter.

## §2 ⚖️ The anchor — (c), agreed, pinned against both alternatives
Three readings of "the last two dates were cancelled": **(a)** anchor on the last LIVE date ⇒ re-creates them (the defect) · **(b)** a cancelled tail ENDS the series ⇒ every series an admin ever edits silently stops · **(c)** anchor on the last date the series ever HAD ⇒ skip the cancelled ones and keep the week. **(c)**, as you said: a cancelled session is a cancelled session, not the end of a weekly class. The suite pins that the code produces (c) and asserts it is **neither** (a) nor (b), so the next reader sees the choice.

## §3 By value (through the real setting — no spy on it)
- 🔑 **Cancel the LAST date** (09-29 ✓, 10-06 ✓, 10-13 ✗) ⇒ `["2026-10-20", "2026-10-27"]` — never 10-13 (before: `["2026-10-13", "2026-10-20", "2026-10-27"]`).
- **Next two Tuesdays cancelled** ⇒ no row on either; the next dates are still Tuesdays.
- **A second run** over what the first created (cancelled rows in the picture) ⇒ nothing.
- An ATTENDED last date counts too. A series cancelled IN FULL is not extended. The template is the last LIVE row even when a later cancelled row carries a different title. A closed series is still skipped and counted.

## §4 🔴 What the first break-and-watch run caught — in my own report
I ran the mutations with the wrong `BASELINE` (60; the set runs 51), which made mutation B look like a bite — **B actually passed: 51 pass / 0 fail.** B re-adds the status filter to the DB `where`, and **every fixture fakes `findMany` and ignores its `where`**, so a filter at the database was invisible to all of them. Fixed with a test that runs the real `where` callback against recording operators and asserts it asks for `bookingType=GROUP` and **nothing about `status`**. With the correct baseline (52) B now bites. 📌 Two lessons in one: a wrong BASELINE can manufacture a bite, and a spy that ignores its arguments cannot see a change to those arguments.

## Break-and-watch — `mut466.mjs`, 4 mutations, **4 bite** (`finally`, sha-256 restore, `BASELINE=52`)
A 🔴 **the defect**: the date set is the LIVE rows again · B 🔴 **the defect's other door**: the DB read filtered to live statuses · C a series cancelled in full is iterated (a cancel-all resurrected) · D cancelled dates dropped from the date set by status.

📦 Nothing to deploy beyond the release; the extender can now be scheduled once TASK-465 and this are on the box. ⛔ Only you mark this DONE. ▶️ TASK-467 next.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-25)
Re-run by me: **2978 pass / 0 fail** · tsc 0 · 56 = 56 · the read has no status filter and the split is documented where the next reader meets it. 📌 The report says 2974; the tree gives **2978** — four more, which is the §4 `where`-callback test added after the number was written. No concern, recorded so the numbers in this file agree with the tree.
**§4 is the most valuable part of this report, and he volunteered it.**
1. **He ran the mutations with the wrong `BASELINE` (60 against a 51-test set), which made mutation B *look* like a bite when it had passed.** He caught it, said so in his own report, and fixed the cause. ⚠️ **A wrong baseline can MANUFACTURE a bite** — the count check we added on 09-24 protects against a mutation that never ran, and this is its mirror image: a baseline that is too high reports every run as a failure, including the ones that prove nothing. The baseline must come from the clean run of *that* set.
2. **Mutation B had really passed because every fixture fakes `findMany` and ignores its `where`** — so a filter added at the DATABASE was invisible to all of them. **A spy that ignores its arguments cannot see a change to those arguments.** His answer is the right one: run the real `where` callback against recording operators and assert what it asks for — `bookingType=GROUP` and **nothing about status**.
3. 📌 And the sentence that explains the whole defect: **"the full suite stayed green through the fix before any new test existed — every older extender fixture had live rows only."** The fixtures agreed with the bug.
**On the decision:** (c) as I argued — anchor on the last date the series ever *had* — and he pinned it as **neither (a) nor (b)**, so the next reader sees a choice rather than an accident. The template staying the last LIVE row is right too: a cancelled row is not what the class looks like today. A series cancelled in full stays terminal.
