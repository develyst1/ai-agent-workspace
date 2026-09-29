# TASK-552 — a cancelled make-up is not a make-up (the planner) — BE, M

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-28) · **Size M.** Your D7 root cause from TASK-551, ruled in as **(a)**.

## §0 The ruling and why it is not (b)
**`planCourseMoves` counts a leave as matched if ANY row points at it, including a CANCELLED one.**
🔑 **A cancelled make-up is not a make-up. The planner is wrong on its own terms, everywhere — not only where it produced a bad sentence.** ⇒ *A course whose leave is "matched" by a cancelled row quietly stops owing what it owes.*
🚫 **Not (b):** re-opening TASK-546 §4 would have accepted a wrong screen caused by a wrong link. **The forecast was honest about a database that was wrong.**
✅ **The act's outcome changing here is the POINT, not the risk:** the Undo cancelling the surplus and proceeding is **the act becoming right**.

## §1 Build — one line, and then prove its blast radius
- **The fix itself is small. The work is showing what else it touches.** ⚠️ **`planCourseMoves` runs on every course re-plan** ⇒ 🔑 **derive what changes for courses that already have a cancelled make-up pointing at a leave**, and **say it in numbers or in cases, not in confidence.**
- 🔑 **Name anything that DEPENDED on the old behaviour.** *A wrong rule that has been live for months usually has something resting on it* — ⚠️ **if you find such a dependency, STOP and report it before changing the line.**
- ✅ **Pin the rule where it belongs, on the pure planner**, with the reproduction you already have. ✅ **And pin the consequence end to end: the Undo of a leave whose make-up was cancelled and re-added now proceeds and cancels the surplus.**
- ⚠️ **State what a course in this state looks like BEFORE the fix and AFTER**, so an admin reading a changed course later can tell why.

## §2 The data, which is not ours
🔴 **The sid row (`e7cb8771` / `0494ab85`) needs a one-row re-link. 🚫 Do not touch it.** **It is a DATA REQUEST and I am sending it up through @Porter.**
📌 **Say in your report exactly what the repair is** — which row, which column, which value — **so the owner can act on one sentence.** ⚠️ **And say whether the fix ALONE repairs the row going forward** (a later re-plan may fix it by itself) or whether the repair is required.

## §3 Not in scope
🚫 The same-slot suppression (TASK-551, done) · 🚫 the coach who GAINS a re-added class (declared, with @Porter) · 🚫 any other planner behaviour.

## Definition of Done
- [ ] The rule fixed **on the pure planner** with the reproduction pinned · 🔑 **blast radius derived, in cases or numbers** · **anything depending on the old behaviour named — and a real dependency ⇒ STOP** · the end-to-end consequence pinned (the Undo now proceeds and cancels the surplus) · before/after of an affected course stated · §2 repair named precisely, **and whether it is required at all** · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · 🔑 mutations incl. **a cancelled row matching again** · report + `inbox/SA.md` + log.

---

# ⏸️ STOPPED — @Jason (2026-09-28): a REAL dependency on the old behaviour. The one-line fix would move D7's symptom onto every paused-and-resumed course. **The line is NOT changed; nothing built.**

## §1 The blast radius, derived: every reader of `extendedFromId`
- **The count is never affected.** `need = size − current`; `courseCurrent` and `canInsert` don't read links. **Only WHICH leave a new append names changes.**
- **Readers of the link:**
  - the planner's short branch (attribution);
  - the re-plan's **template** choice (`reconcileCoursePlan`: a linked append copies the LEAVE's coach / time, an unlinked one copies the first live session);
  - the Undo (`planUndo`: which make-up to cancel);
  - course history (`makeupOfDate`).
- **Not affected:** `makeupsToFlip` (creation's declared absences: it reads non-cancelled rows and flips, never cancels), resume's counter, insert's gate.

## §2 🔴 The dependency: two writers ANSWER a leave WITHOUT linking, and the old rule was covering for them
The old rule ("matched if ANY row points at it, even a cancelled one") reads, in effect, as **"this leave has been answered"**. That's wrong for D7, but **right** in two live cases:
1. **Pause → resume** (`dropCourse` / `resumeCourse`):
   - the pause **cancels** the leave's make-up;
   - resume re-lays **all** owed sessions through `insertBooking`, **unlinked** (its own comment: *"the pause cancelled that make-up, so owed includes it, and the re-plan lays it out again"*);
   - **so the leave IS answered, by an unlinked row.** Only the cancelled make-up still says so.
2. **An admin INSERT that fills a leave's gap** (`canInsert`: *"a leave opened a gap the insert fills directly"*):
   - the reconcile then **trims** the newest EXTENDED, i.e. the leave's make-up;
   - **the leave is answered by the unlinked insert**, and again only the cancelled make-up says so.
- **Reproduced on the pure planner** (a pause → resume course, then a new leave L3):
  - **old rule** ⇒ the new make-up is linked to **L3** (correct);
  - **fixed rule** ⇒ linked to **the pre-pause leave** (oldest gap first). Wrong.
  - Consequence: **undoing L3 then forecasts "no make-up" and the act refuses (`UNDO_PLAN_WOULD_CHANGE`). That's D7's exact symptom, moved onto every paused-then-resumed course** (and every insert-then-trim).
  - The history also labels L3's make-up "make-up of <pre-pause date>".
- ⇒ **The planner isn't wrong on its own terms alone. The DATA is incomplete:** links are missing on the rows that answer leaves in those two paths. **"A cancelled make-up is not a make-up" is true, but it's only safe once every answer carries its link.**

## §3 Options (yours to rule)
- ⭐ **(A) Make the links complete, then apply the rule.**
  - Resume and the gap-filling insert **write `extendedFromId`** for the leave they answer.
  - **A backfill (a DATA REQUEST) re-links existing resumed / inserted rows**, which needs a derivation per course.
  - **Only then** does a cancelled row stop matching.
  - This is correct everywhere, but it's the biggest option: two writers + a data backfill + the one line.
- **(B) Targeted: the re-owe inherits the link.**
  - When an ADMIN cancels (or a coach's leave cancels) a make-up linked to leave L, the re-plan's append for that gap is **attributed to L**.
  - It's passed in as the known gap owner (`reconcileCoursePlan(tx, courseId, { reowedFor: [L] })`, preferred before the oldest-first fallback).
  - The planner's general rule stays as it is, so pause / insert keep working. **Small; fixes D7 going forward; doesn't make the rule right in general.**
- **(C) Leave the planner, fix nothing, and accept D7** as the known gap. **Not recommended:** it's the wrong-screen you ruled out.
- **My recommendation: (B) now** (it closes D7 without touching pause / insert), **and (A) as its own task** if the owner wants attribution right everywhere.

## §4 The sid row (unchanged by any option; a DATA REQUEST, not ours)
- **The repair, in one sentence:** set `bookings.extended_from_id` of the row whose id starts `0494ab85` to **the `extended_from_id` of the row whose id starts `e7cb8771`** (the leave that cancelled make-up was for).
- **Is it required? YES.** No option re-links an EXISTING row: a re-plan only appends or cancels, and never rewrites `extended_from_id`. That course is at size, so a later re-plan makes no moves at all.
- **Read-only check first** (for the owner):
  `SELECT id, status, date, extended_from_id FROM bookings WHERE id::text LIKE '0494ab85%' OR id::text LIKE 'e7cb8771%';`

⛔ **Your ruling:** (A), (B) or (C). Nothing is changed.

---

# ⚖️ SA RULING (2026-09-29) — **(B) now, and (A) as its own task. My ruling was right about the rule and wrong about the ORDER.**

## 🔴 He stopped where §1 told him to, and the dependency is the whole story
**Two writers ANSWER a leave without linking, and the old "cancelled still matches" rule was covering for them:** **(1) pause → resume re-lays owed sessions unlinked; (2) an admin insert filling a leave's gap answers it unlinked.**
**Reproduced on the pure planner: old ⇒ L3's make-up linked to L3; fixed ⇒ linked to the PRE-PAUSE leave** ⇒ 🔴 **my one line would have moved D7 onto every paused or inserted course.**
🔑 **His sentence is the correction, and it is better than my rule: "a cancelled make-up is not a make-up" is only safe ONCE EVERY ANSWER CARRIES ITS LINK.** ⇒ **I ruled on the rule and not on the state of the data it reads.** 📌 *Removing a wrong rule that is covering for a gap does not fix the gap — it exposes it, at the scale of everything the rule touched.* **This is the second time this week that stopping to derive the blast radius was worth more than the fix.**

## ⚖️ Ruled: **(B) now.** 🚫 Not (C), and (A) does not wait forever
✅ **(B) is not a workaround — it is the SAME principle applied where the append is created:** **the re-owe inherits the cancelled make-up's leave**, so 🔑 **whoever answers a leave carries its link.** *(A) and (B) differ in COVERAGE, not in correctness* — (B) closes the path Tanya actually walked, without exposing pause and insert.
🚫 **(C) is out:** it leaves a wrong sentence on a screen we built to stop wrong sentences, and the defect is now understood, which is exactly when accepting it is least defensible.
▶️ **(A) is the real end state and it gets its own task now, not "later" in the abstract** ⇒ **TASK-553**, so it exists on the board rather than in this paragraph.

## §B1 — what (B) must and must not do
- ✅ **Inherit from the cancelled row's OWN `extended_from_id`.** 🚫 **Never from a guess, a date match, or "the most recent leave"** — *this defect was born from a link that was assumed rather than written.*
- ⚠️ **If the cancelled make-up itself has NO link** (the pause case), **the inheritance yields nothing, and it must say so and stop, not invent one.** 🔑 **An absent link must stay absent** — that is TASK-553's job, and a silent guess here would hide it.
- ✅ **Pin the end-to-end consequence:** the Undo of a leave whose make-up was cancelled and re-added **proceeds and cancels the surplus.**
- ✅ **Pin that pause/resume and the admin insert are UNCHANGED by this task** — *the gap stays visible until (A) closes it.*
- 🚫 **The one-line planner change does NOT go in with (B).** It goes in (A), after the writers and the backfill. **Say in the report that it is deliberately still absent.**

## §B2 — the data
🔴 **The repair is REQUIRED** (nothing rewrites an existing link): **set `0494ab85…`'s `extended_from_id` to `e7cb8771…`'s `extended_from_id`.** ✅ **He produced read-only check SQL and did not run it against anything.**
**It goes to the owner as a DATA REQUEST through @Porter.** 🚫 **No agent touches it.**

---

# ✅ REPORT (B) — @Jason (2026-09-29): the re-owe INHERITS the cancelled make-up's own leave. The one-line rule is DELIBERATELY still absent · **3544 / 0 normally, and 3× unreachable with plain `bun test`, 0 failed queries** · tsc 0 · 61 = 61 · four mutations bite

## §1 What (B) is
- **The planner** (`planCourseMoves`) takes an optional `reowedFor`: leave ids the caller passes **from the cancelled row's own written `extendedFromId`**.
  - Such a leave is used **FIRST** for the short-branch append, then the old oldest-gap rule for any further append.
  - It's taken **only if it's still a SICK_LEAVE with no LIVE make-up of its own**, so it's **never a double answer** (a mutation removing that guard BITES).
  - **Empty `reowedFor` ⇒ the old answer, byte for byte.**
- **`reowedForOf(row)`** (the ONLY source of the inheritance):
  - the row's own link ⇒ `[leave]`;
  - **an EXTENDED make-up with NO link (the pause case) ⇒ `[]` and it SAYS so in the log** (`[TASK-552] cancelled make-up … carries no link — its re-owe inherits NO leave (TASK-553)`);
  - an ordinary session ⇒ `[]`, silently.
  - 🚫 Never a date match, never "the most recent leave". **A mutation that invents a link BITES.**
- **Passed on EXACTLY the three cancel-then-re-plan paths** (pinned: count = 3): the admin's cancel, a coach's own leave, and a group date's seats.
- 🔑 **The one-line planner change ("a cancelled row no longer matches") is DELIBERATELY STILL ABSENT.** It lands in TASK-553 after the writers and the backfill.
  - Pinned by source, **and a mutation shipping it early BITES** (4 pins, incl. the pause case).
- 🚫 **Pause → resume and the plan editor's insert / mark-absence are UNCHANGED** (they pass no inheritance; pinned). **The gap stays visible until TASK-553.**

## §2 Pinned end to end (the real `undoBooking` and its preview)
- **D7's course as (B) now writes it** (M1 cancelled, M2 the replacement linked to the SAME leave):
  - **the FORECAST names M2** ("make-up cancelled: 06-11"; it said "no make-up" before);
  - **the ACT agrees: it PROCEEDS, refunds, and cancels M2**, not the dead M1. That's your "the act becoming right".
- **The OLD data shape (the replacement unlinked, i.e. sid's row until the repair) still reads "no make-up".** (B) fixes **new** rows, not existing ones. Pinned, so nobody mistakes the code fix for the data fix.

## §3 An affected course, BEFORE and AFTER (for an admin reading one later)
- **BEFORE (B):** an admin cancels leave L's make-up M1 ⇒ the re-plan adds M2 **linked to nobody** (or to another unmatched leave). The course is balanced.
  - The history shows M2 as a plain session (no "make-up of").
  - **The Undo of L forecasts "no make-up" and the act refuses (`UNDO_PLAN_WOULD_CHANGE`).**
- **AFTER (B):** the same cancel ⇒ M2 **linked to L**, and it mirrors L's slot (the re-plan's template is now the leave it replaces, as its own comment intends).
  - The history shows **"make-up of <L's date>"**.
  - **The Undo of L forecasts "cancels M2 (date)" and PROCEEDS.**
- **Unchanged:** every count, every pause / resume, every insert, every course where no make-up was cancelled.

## §4 Break-and-watch (CHECKSUM identical, every restore byte-identical, BASELINE=88)
- **I: the planner ignores the inheritance** (D7 back): **BITES**.
- **G: a link invented when none exists:** **BITES**.
- **X: the one-line rule shipped early:** **BITES** (4 pins).
- **D: a double answer:** BITES.

## §5 The sid row: unchanged by (B), still a DATA REQUEST
- **(B) does NOT repair it:** a re-plan never rewrites an existing link. Pinned (§2's old-shape test).
- The repair stays as you sent it up: **`0494ab85…`.`extended_from_id` := `e7cb8771…`.`extended_from_id`**. 🚫 Not touched.

⛔ Only you mark this DONE.

---

# ✅ (B) DONE — REVIEWED by @Sober (2026-09-29)
Verified: **3544 / 0** (and 3× unreachable, 0 failed queries) · tsc 0 · **61 = 61**.

## ✅ Both conditions held, and the second one held the way it was meant to
**Inheritance from the cancelled row's OWN link only (`reowedForOf`), on exactly the 3 cancel-then-re-plan paths** — 🚫 **a link-invented mutation bites.**
✅ **An unlinked make-up yields nothing AND IT IS SAID in the log.** 🔑 *That is the difference between a gap that is carried and a gap that is hidden* — the pause case stays visible for TASK-553 instead of being quietly filled with a plausible leave.
✅ **Empty ⇒ the old answer byte for byte**, and the inherited leave goes first, **never as a double answer** (pinned).

## 🔑 The pin I want to name: **he pinned the ORDER, not just the code**
**The one-line planner change is deliberately absent, and an EARLY-SHIP mutation BITES.**
⇒ **That is a test whose subject is a decision rather than a behaviour** — *it fails if someone does the right fix at the wrong time.* 📌 **The finding from the last round was that the order was load-bearing; this makes the order enforceable instead of remembered.** **Pause/resume and the insert are pinned UNCHANGED**, so the gap cannot be closed by accident either.

## ✅ End to end, including the part that is NOT fixed
**D7's course as (B) writes it: the forecast names the replacement and the act PROCEEDS and cancels it.**
🔴 **The OLD unlinked shape — sid's row — still reads "no make-up", and that is PINNED.** ✅ **Pinning what the fix does NOT do is what keeps the DATA REQUEST honest:** *without that pin, the next person to see sid would read it as the fix failing.*
✅ **Before/after of an affected course is written in §3**, so a later reader knows why M2 now says "make-up of <L's date>" and mirrors L's slot. 🚫 **The sid repair untouched.**
