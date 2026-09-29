# TASK-553 — every answer to a leave carries its link — BE, L

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-29) · **Size L.** ⏸️ **Queued behind TASK-552 (B).** This is option **(A)**, written down now so it is on the board rather than in a paragraph.

## §0 The end state
🔑 **"A cancelled make-up is not a make-up" is only safe once every answer carries its link.** **TASK-552 (B) closed the path a user walked; this closes the class.**
**Two writers answer a leave without linking:** **(1) pause → resume**, which re-lays owed sessions unlinked; **(2) an admin insert** filling a leave's gap, which the reconcile trims for and which answers it unlinked.

## §1 The order, and it is not negotiable
1. **The two writers write links.**
2. **A backfill for rows already answered without one.**
3. **THEN the one planner line** (`a cancelled row no longer matches`).
🔑 **That order is the finding from TASK-552: removing the covering rule before the data is complete moves D7 onto every paused or inserted course.** 🚫 **The planner line must not land first "because it is one line".**

## §2 The backfill — the part I expect to be hard, and I want the difficulty surfaced not smoothed
- ⚠️ **Some rows will be genuinely ambiguous** — more than one leave a session could be answering. 🔑 **An ambiguous row must be LEFT ALONE and COUNTED, never assigned on a best guess.** *This whole defect came from treating an assumed link as a real one; a backfill that guesses would industrialise it.*
- **Report the three numbers: linked · left ambiguous · not applicable** — **before anything is applied.**
- 🚫 **Dry run first, and the dry run's output is what I review.** ⚠️ **The backfill is a DATA operation: 🚫 no agent runs it anywhere. It is written, dry-run-reported, and handed to the owner.**

## §3 Then, and only then
- **The planner line**, with the reproduction from TASK-551 pinned, ✅ **plus the pause→resume and admin-insert reproductions from your own derivation** — 🔑 **the two cases that would have broken had this shipped in the wrong order must be the pins that prove the order was right.**

## §4 Not in scope
🚫 The same-slot suppression · 🚫 the coach who gains a re-added class · 🚫 any other planner behaviour.

## Definition of Done
- [ ] Both writers link · 🔑 **backfill DRY RUN with three counts, ambiguous rows LEFT ALONE and counted** · 🚫 nothing run against any environment, the repair handed up · **then** the planner line · pins for TASK-551's case **and** pause→resume **and** admin-insert · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · 🔑 mutations incl. **a writer dropping its link**, **the backfill guessing an ambiguous row**, **a cancelled row matching again** · report + `inbox/SA.md` + log.

---

# ⏸️ REPORT — steps 1 + 2 BUILT; step 3 (the planner line) deliberately NOT landed — it waits on the dry run you review · @Jason (2026-09-29) · **NO migration (63 stays)** · **3596 / 0 normally, and DB-unreachable, 0 failed queries** · tsc 0 · nine mutations bite

## §0 The one definition every step reads
**`leavesAwaitingReanswer`** (`lib/course-plan.ts`) = a `SICK_LEAVE` that some row **once answered by link**, and that **no live row answers by link now**.
- 🔑 **These, and only these, change meaning when a cancelled row stops "matching".**
- 🚫 **A leave no row ever answered** (declared at purchase, …) **is excluded**; nobody re-answers it. A mutation including it bites.

## §1 Step 1: BOTH writers write the link
- **Resume** (`resumeCourse`): the leaves awaiting a re-answer are read from the rows **as the pause left them**. **The LAST re-laid dates answer them, oldest leave first** (a make-up sits at the end of the plan).
  - 🔑 **The link is written AT the insert** (the one inserter now takes an optional `extendedFromId`), so **the resume still updates no existing row**. TASK-282 §7's pin *"the old cancelled rows are UNTOUCHED"* still holds; my first draft updated the new rows afterwards and tripped it, so I moved the link into the insert.
- **Admin insert** (`applyPlanChange` "insert"): **after** the reconcile trims, the new row carries **the leave a TRIMMED row pointed at**, if that leave is now awaiting.
  - **A trimmed row with no link yields NOTHING and says so** (`[TASK-553] insert … answers NO leave by link`). Never a guess.
- ✅ **The two cases that would break in the wrong order are pinned as the order's proof** (by value, on the rule step 3 would apply):
  - **pause → resume, then a new leave:** today's unlinked data ⇒ the line would answer the **pre-pause** leave (**D7's shape**); the data the writer now produces ⇒ **the new leave itself** ✅;
  - **admin insert, then a new leave:** unlinked ⇒ the wrong leave ❌; linked ⇒ right ✅.
  - **And today's rule is still right on both**, because the line isn't landed.

## §2 Step 2: the BACKFILL (written, dry-run only, run by nobody here)
- **Pure rule** (`lib/leave-link-backfill.ts`), **per course**:
  - **the leaves** = `leavesAwaitingReanswer`;
  - **the candidate answers** = plan rows that are:
    - not cancelled / a leave / paused, and **carry no link**;
    - **not written with the course** (the creation batch shares the course's timestamp);
    - **written no earlier than the leave's cancelled answer**;
  - **exactly ONE leave and exactly ONE candidate ⇒ link. Anything else ⇒ AMBIGUOUS, left alone, counted with its reason:**
    - `several-leaves`;
    - `several-candidates`;
    - `no-candidate`.
  - **Every other leave ⇒ not applicable.**
- **Script** `scripts/backfill-leave-links.ts` (`bun run leave:backfill-links`):
  - **dry run by default** (computed in a transaction and rolled back); `--commit` is the owner's;
  - **console = the three numbers + the ambiguous by reason**; ids only to gitignored `project-docs/`;
  - **writes only a link that is still NULL**, so it's idempotent.
- 🔴 **The difficulty, surfaced not smoothed:** **a RESUMED course will usually be AMBIGUOUS** (`several-candidates`). The resume re-lays several rows **with the same timestamp**, and nothing in the data says which one answers the leave.
  - The writer's "last row" is a **convention for new rows**; used on old rows it would be a guess, so **the backfill doesn't use it** (a mutation that picks "the first candidate" bites).
  - The insert shape usually has exactly one candidate ⇒ linked.
- 📋 **DATA REQUEST for the owner (via @Porter), read-only in effect:** on **sid, then uat**, run `bun run leave:backfill-links` (**dry run, writes nothing**) and send back the console's **three numbers + the three ambiguous reasons**. **That output is what you review** before any `--commit`.

## §3 ⏸️ Step 3, the planner line: READY, deliberately NOT landed
- The change is one line in `planCourseMoves`: `matched` reads **only non-CANCELLED** rows.
  - **Its early landing is a mutation that BITES**, in 6 places (TASK-552's pins + mine).
- 🔑 **Why it can't ship with steps 1–2:** the backfill **leaves ambiguous leaves unlinked by design**. The moment the line lands, **every ambiguous course shows D7's shape** (the next leave's make-up attributed to the pre-pause leave; its Undo forecasts "no make-up" and the act refuses).
  - ⇒ **How it lands depends on the ambiguous count, which only the owner's dry run can give.**
- **Options (your ruling, after the numbers):**
  1. ⭐ **ambiguous = 0 on both boxes** ⇒ owner commits the backfill ⇒ land the line in the next deploy.
  2. **a few ambiguous** ⇒ the owner / an admin **links them by hand** from the id list (**a human decides; the system doesn't guess**), then (1).
  3. **many ambiguous** ⇒ **don't land the line.** TASK-552 (B) already fixes the user path, and new rows are now born linked. The cost is that old resumed courses keep today's behaviour.

## §4 Checks
- Suite: **3596 / 0** (3583 + 13 new in `src/lib/leave-links-task553.test.ts`). **DB-unreachable: 3596 / 0, 0 "Failed query".** tsc 0. **63 .sql = 63 tags: no migration** (the column exists).
- **One existing pin updated:** the resume loop's header (it now carries its index); every assertion in it is unchanged.
- **Break-and-watch** (BASELINE 50, CHECKSUM identical, every restore byte-identical):
  - **W1, a writer dropping its link (resume):** **BITES**.
  - **W2, a writer dropping its link (insert):** **BITES**.
  - **W3, the inserter drops a given link:** BITES.
  - **G1, the backfill GUESSING** (several candidates ⇒ the first): **BITES**.
  - **G2, guessing across several leaves:** BITES.
  - **G3, a creation row as a candidate:** BITES. *It first SURVIVED: no fixture had a make-up created with the course. I added exactly that case.*
  - **X1, a cancelled row MATCHING again:** **BITES** (6).
  - **X2, a never-answered leave treated as awaiting:** BITES.
  - **O1, the planner line landed early:** **BITES** (6).
- ⚠️ **Honest limits:** the two writers are pinned **by source**, with their rule by value; `resumeCourse` / `applyPlanChange` aren't driven end to end. **The backfill has not run anywhere**, by the rule. So the three numbers don't exist yet.

## §5 Slips
- The resume's first draft updated its new rows after inserting them. **TASK-282's pin caught it.** Moved into the insert.
- A shell one-liner with backticks failed before running; redone with the editor.

⛔ Only you mark this DONE. **Next from me: nothing on 553 until the dry-run numbers come back.**

---

# ✅ STEPS 1–2 DONE — REVIEWED by @Sober (2026-09-29) · ⏸️ **step 3 correctly withheld**
Verified by me: **3596 / 0** (and 3× unreachable) · tsc 0 · **63 .sql, no migration** (counted myself).

## ✅ The order held, and that was the whole point
**Writers link → backfill → and the planner line is NOT in.** 🔑 **He stopped where the order says to stop, with the numbers that decide step 3 not yet in hand.** ✅ **And the pause→resume and admin-insert cases are pinned AS THE ORDER'S PROOF** — *the two cases that would have broken had the line shipped first are now the tests that say why it did not.*
✅ **TASK-282's pin caught his first draft** (resume updating an existing row). 📌 **A pin earning its keep on a task nobody wrote it for is the best evidence pins are worth writing.**

## 🔴 The finding: the backfill will mostly be unable to help, and he says so BEFORE running it
**Resumed courses will mostly come back `several-candidates`** — **the re-laid rows share a timestamp, and the writer's "last row" is a CONVENTION, never used as a backfill guess.**
🔑 **Refusing to reuse his own writer's convention as evidence is exactly right.** *A convention is how we choose; it is not a record of what happened — and this whole defect came from treating an assumption as a fact.*
✅ **Links only when a course has EXACTLY ONE awaiting leave and ONE candidate; everything else is ambiguous, left alone, counted BY REASON.** ✅ **Dry run by default.**

## ⚖️ Step 3's decision tree — **approved, with the boundary defined**
**0 ambiguous ⇒ commit, then land the line · a few ⇒ hand-link from the id list, then land · many ⇒ do not land it.**
🔑 **"A few" versus "many" is not a number — it is whether a HUMAN CAN CHECK EACH ONE.** ⇒ **If the id list is short enough that every row gets looked at, hand-linking is honest; the moment it becomes a batch someone approves without reading, it is a guess with extra steps.**
✅ **And "do not land it" is NOT a failure — say so plainly when it happens.** 🔑 **TASK-552 (B) already covers the path a user walks, and new rows are born linked** ⇒ **the planner line is an IMPROVEMENT, not a repair we are waiting on.** *Nobody should feel pressure to land it against ambiguous data.*

## 📋 DATA REQUEST — raised to @Porter
**The owner runs the DRY RUN on sid, then uat, and returns the three numbers plus the ambiguous reasons.** 🚫 **No agent runs it.** **That output is what I review before step 3 is decided.**

## ▶️ What this unblocks
**REQ-110 item 6 depended on steps 1–2, which are done** ⇒ **item 6 is unblocked; step 3 is independent of it.**
