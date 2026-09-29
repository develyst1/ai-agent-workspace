# TASK-498 — `crm_points` is read-modify-write **and** derives `crm_level` from the result — BE, S. **A design question, not a sweep.**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size S.** Named by you in TASK-496 and deliberately left out of it.

## §0 Why this is not TASK-496 again
`awardCrmPoints` reads `students.crm_points`, adds to it, **and derives `crm_level` from the new total.** ⇒ the fix is **not** the mechanical one TASK-496 applied fifteen times: moving the addition into SQL still leaves *what is the level when two awards race?* unanswered — and a level is **visible to a family**.
📌 **You separated this from the sweep, and that judgement is why it gets its own ticket.** A sweep that swallows one genuinely different case is worse than one that stops short: the difference then sits buried in a diff of fifteen identical-looking edits.

## §1 Establish before any fix
1. **What actually goes wrong today, by value:** two awards in the same moment ⇒ **points lost, a level that does not match its own points, or both?** A level disagreeing with its points is the worse outcome and I want to know whether it is reachable.
2. **Who reads `crm_level`** — every surface, and whether any is **parent-facing**. If a family can see a level, a wrong one is a conversation with the shop; if only staff can, this is much less urgent. **I would rather learn it is staff-only and downgrade this than build to the worse assumption.**
3. **Whether the level is a pure function of the total.** 🔑 **If it is, then STORING it is the whole defect** — two facts that must agree, kept in two places, which is this round's recurring bug (`checkin_source`, `leave_charged`). **Say so if that is what you find; do not assume I want the stored column preserved.**
4. **Whether any historical row already disagrees.** ⚠️ **A data question for the owner**, not something to correct quietly — the same rule as TASK-497.

## §2 Then fix
- The points move by **`sql` arithmetic** (TASK-496's shape), and the level follows **from that same statement's result** — never from a value read earlier.
- 💰 **No change to how many points anything awards, or to any threshold.** If a threshold looks wrong, **stop and tell me**: that is the owner's.
- 📌 If §1.3 says the level should be derived rather than stored, **propose it and stop.** Dropping a column is a migration and a decision, not part of a race fix.

## Definition of Done
- [ ] §1's four answers **before** the fix · points on `sql` arithmetic with the level from the same statement · no change to awards or thresholds (pinned) · the parent-facing question answered plainly · any historical disagreement raised as a **data question**, not corrected · a recommendation on stored-versus-derived, **not built** · suite **count** · tsc 0 · 59 = 59 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation restoring the read-modify-write and one that lets the level disagree with the points · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason → @Sober (2026-09-26) — §1's four answers, then the fix: ONE statement, points by `sql`, the level from that same total. 3249 pass / 0 fail · tsc 0 · 59 = 59 · 4/4 mutations bite

**Numbers:** `bun test` **3249 pass / 0 fail**, twice (+7 new, −1 moved: `applyPoints`'s floor test) · `tsc` **0** · **59 = 59**, no migration.

## §1 — the four answers, established before the fix
**1. What goes wrong today, by value: POINTS ARE LOST; the level does NOT disagree with its points.**
- `awardCrmPoints` read `crm_points` (say 25), computed the new total in JS, and wrote **both** `crm_points` and `crm_level` from that one total in one UPDATE.
- Two awards racing (a check-in's +10 and a leave's +5, say) both read 25. One writes 35 / level 2, the other writes 30 / level 2, and the last writer wins **both columns together**. ⇒ **5 or 10 points lost, but the stored level always matches the stored (wrong) points.**
- 🔴 **The trap you anticipated is real, and it is in the obvious fix.** Moving only the addition into SQL (`crm_points = crm_points + n`) while computing the level from a value read earlier **makes the worse outcome reachable**: the points would be right and the level stale. That is why the level has to come from the **same statement**.

**2. Who reads `crm_level`: NOBODY displays it, staff included.**
- The backend sends it in `studentRef` (`crmPoints`, `crmLevel`, `crmLevelName`, `priorityBooking`, `perks`), embedded in every booking, course and voucher DTO. `GET /crm/levels` serves the ladder.
- **The front end renders none of these fields anywhere.** They appear only in `types/api/contract.ts`; no page, component or hook reads them, and the new shop-front page's own test forbids CRM fields on it. **No LINE message mentions a level** (checked in `line-i18n.ts`, `line-webhook.service.ts`, `line-message.ts`).
- ⇒ **Not parent-facing today. The urgency is the lost points (data), not a wrong level in front of a family.** Downgrade as you see fit.
- ⚠️ **One thing I found, and did NOT change: the fields are SENT where they aren't shown.** The **public** answers of `POST /checkin` and the shop-front (single and batch) return `booking`, which carries the child's `crmPoints`, `crmLevel`, `crmLevelName` and `perks`, to anyone holding the token or typing the phone. No page renders them. It's low-sensitivity data about the family's own child, but it is data a public door hands out for no reader. Its own ticket if you want it (a public-scan DTO without `studentRef`'s CRM part, the `provenance`-absent pattern of TASK-481/488).

**3. 🔑 Is the level a pure function of the total? YES, so STORING it is the whole defect.**
- `levelFromPoints(points)` walks a constant five-rung ladder (`CRM_LEVELS`: 0 / 30 / 80 / 150 / 300); nothing else enters.
- `awardCrmPoints` is the **only** writer of either column (`src` and `scripts` swept; the seed writes defaults).
- ⇒ `crm_level` is a second copy of a derived fact: **the same shape as `checkin_source` and `leave_charged` this round.** **Recommendation (NOT built; you said propose and stop):** derive it where it is read (`studentRef`: `levelFromPoints(s.crmPoints)`), and drop the column in its own migration once nothing reads it. **Nothing displays it, so the change is invisible to every user.** Until then, today's fix keeps the two copies provably equal.

**4. Can a historical row already disagree? Not by code, but it is a DATA QUESTION for the owner.**
- The ladder has **never changed** (`git log` on `crm.ts`: introduced once, thresholds untouched since). Migration 0005 created both columns with consistent defaults (points 0, level 1). And (1) shows the race couldn't split them.
- ⇒ **A disagreeing row could only come from outside the code** (a hand edit, an import). Nothing is corrected quietly. **The read-only query for the owner:**
  `SELECT count(*) AS students, count(*) FILTER (WHERE crm_level <> CASE WHEN crm_points >= 300 THEN 5 WHEN crm_points >= 150 THEN 4 WHEN crm_points >= 80 THEN 3 WHEN crm_points >= 30 THEN 2 ELSE 1 END) AS level_disagrees FROM students;`
- 📌 **What no query can show: points already LOST to the race.** A lost award leaves no trace in `students`. The only way to see it would be to recount awards from their causes (check-ins, leaves), which is a different piece of work.

## §2 — the fix (`lib/line-admin.ts` + `lib/crm.ts`)
- **`awardCrmPoints` is one `UPDATE … RETURNING`, with no read before it:**
  `crm_points = GREATEST(crm_points + $delta, 0)`, `crm_level = CASE WHEN GREATEST(crm_points + $delta, 0) >= 300 THEN 5 … ELSE 1 END`.
  - Postgres evaluates **both SETs against the one old row it has locked**. A concurrent award waits for the lock and then recomputes from the new row.
  - ⇒ **No lost points, and the level can never disagree with the points.** The return value comes from `RETURNING`, never from a read.
- **`levelCaseSql(points)`** builds the CASE **from `CRM_LEVELS` itself**, highest rung first, so the SQL and `levelFromPoints` can't drift apart.
  - ⚠️ **The ladder's numbers are inlined** (integer-checked code constants). As bound parameters, every THEN would be untyped and Postgres would resolve the CASE to `text`, which the `smallint` column refuses **at runtime**. That would not have shown in any test here.
- **`applyPoints` (the JS read-then-add) is removed**; its floor is `GREATEST(…, 0)` in the write. `levelFromPoints` stays; it is the ladder's JS twin, and the CASE is pinned equal to it.
- 💰 **No change to any award or threshold:** `CRM_POINT_RULES` = `{ ON_TIME_CHECKIN: 10, PROPER_SICK_LEAVE: 5 }` and the ladder `[1,0] [2,30] [3,80] [4,150] [5,300]` are pinned by value.

## The pins (`src/lib/crm-level-req108.test.ts`, 7 tests)
- **By VALUE over a grid:** 12 starting totals × 5 deltas (the two real awards, +1, −3, −100). A fake executor **evaluates the rendered SQL of both SETs** against the old row, as the database would. **points = max(old + delta, 0) exactly as before, and the stored level = `levelFromPoints(points)` in every case.**
- **The CASE rendered exactly**, with no parameters, and equal to `levelFromPoints` for every total 0…400.
- **No read before the write** (the fake counts reads: 0), and the level expression is built on **the new total, not the column**.
- Unknown student ⇒ null; a zero award ⇒ null with no write (both as before). `applyPoints` gone (source).
- ⚠️ **Named limit:** two real concurrent transactions can't be run without a database. The claim "no lost points under a race" rests on Postgres's row-lock semantics for a single UPDATE, and the tests prove the statement is that single UPDATE.

## Break-and-watch: `mut498.mjs`, 4 mutations, **4 bite**
`BASELINE=18` (this file + `crm.test` + TASK-496's scan), read off a real run. `finally` + sha-256 restore, byte-identical. **CHECKSUM `8a3a6fdc…` identical before and after.**
- **A — the read-modify-write restored** (points read into JS, + delta, written back): **bites, 3 fail**.
- **B — the level DISAGREES with the points** (computed from the old column, not the statement's new total): **bites, 3 fail**. This is the trap in (1).
- **C — the ladder's order inverted** (lowest rung first): **bites, 3 fail**.
- **D — the floor removed**: **bites, 2 fail**.

⛔ Only you mark this DONE. TASK-497 is still held, untouched.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26)
Re-run by me, twice: **3249 pass / 0 fail** both times · tsc 0 · 59 = 59 · `applyPoints` gone (the test asserts it by source too) · `levelCaseSql` at `lib/crm.ts:43`.

## The four answers were worth asking for, and two of them changed what got built
**1. Points are lost; the level does NOT disagree.** ✅ And he found the important thing: **the obvious fix creates the worse bug.** Moving only the addition into SQL while computing the level from a value read earlier would have left **the points right and the level stale** — the outcome I said was the bad one. **The trap was in the fix, not in the defect.** That is why the level had to come from the same statement, and it is why I asked before deciding rather than after.
**2. Nothing displays `crm_level`, staff included** — checked through the FE, the LINE strings and the message builders. ⇒ **downgraded, honestly: the harm is lost data, not a wrong badge in front of a family.** Establishing that before the fix is what stopped this becoming a bigger job than it deserved.
**3. 🔑 The level is a pure function of the total, so STORING it is the whole defect** — the same shape as `checkin_source` and `leave_charged` this round. ✅ **He proposed deriving it and stopped, as instructed.** Recommendation accepted in principle; the column's removal is its own migration, and I am not spending it in this round. **Today's fix keeps the two copies provably equal, which is the right interim.**
**4. A disagreeing row can only come from outside the code** (ladder never changed, one writer, the race can't split them) — with a **read-only query for the owner** rather than a correction. 📌 **And the sentence I want kept: "what no query can show is points already LOST to the race."** A lost award leaves no trace. **Naming the limit of the evidence, rather than implying the query settles everything, is the difference between a report and a reassurance.**

## The fix
✅ **One `UPDATE … RETURNING`, no read before it**, both SETs evaluated against the one locked row, the return value from `RETURNING`. ⇒ **no lost points, and the level cannot disagree with the points.**
✅ **`levelCaseSql` built from `CRM_LEVELS` itself** — the SQL and `levelFromPoints` cannot drift, and the CASE is pinned equal to the JS twin for every total 0…400.
🔴 **The best detail in the report: the ladder's numbers are INLINED, not bound.** As parameters, every `THEN` would be untyped, Postgres would resolve the CASE to `text`, and **the `smallint` column would refuse it at runtime — which no test here would have shown.** That is a production-only failure reasoned out in advance from how the database types an expression. **Exactly the class of thing I cannot review for and depend on him to know.**
✅ **Named limit, correctly:** two real concurrent transactions cannot be run without a database, so the no-lost-points claim rests on Postgres's row-lock semantics, and the tests prove the statement **is** that single UPDATE. **The right thing to prove, and the right thing to admit.**

## 📌 His side-finding: **its own ticket (TASK-499).** He was right not to touch it.
The **public** answers of `POST /checkin` and both shop-front routes return `booking`, carrying the child's `crmPoints`, `crmLevel`, `crmLevelName` and `perks` — **to anyone holding the token or typing the phone, with no reader anywhere.** Low-sensitivity, about the family's own child, and **a public door handing out data nothing renders is the TASK-481 shape**: the leak that exists because a builder answers more than one audience. It is cut as **TASK-499**, and it will use the same `provenance`-absent pattern.
