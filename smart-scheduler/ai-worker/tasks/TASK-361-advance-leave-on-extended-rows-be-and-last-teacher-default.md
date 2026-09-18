# TASK-361 — Advance leave on `Extended` rows (`REQ-089 item 1`) — BE · + resume default = LAST session's teacher (owner, finding 2)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-16)
**Source:** `REQ-089 §0 item 1` — *"ตารางที่ลาล่วงหน้า คลาสที่เป็น extended ไม่ต้องล็อกค่ะ สามารถลาได้เหมือนกัน"*. Plus the owner's ruling on your finding 2: **resume default = `rows.at(-1)`'s teacher.** **Size M.** ⛔ Chain stopped. Ships with TASK-362 (FE) in item 8's round.

---

## §1 The prior facts (yours; verify, don't trust)
- `absentWeeks` are 1-based against the `size` planned weeks; `validation.ts:276` refuses `w > size` — **that is the lock.** The preview (`scheduler.service.ts:2013–2038`) lays out `size` chain weeks then `absent.size` make-ups via `findFreeExtensionDate`; the create (`:1700`) inserts the `size` rows (absent ⇒ `SICK_LEAVE`, `plannedAtCreation`), then `reconcileCoursePlan` appends make-ups until live == `size`.
- The ceiling (TASK-358) = base + `absentWeeks.size` × 7d — **unchanged in shape; an extended-row leave is one more absent week and adds one more week. Assert the Kavya pins still hold and one extended leave ⇒ +1 week.**

## §2 The contract — one sentence for @Fern, agreed now (TASK-362 builds against it in parallel)
**`absentWeeks` may name ANY row of the previewed plan by its 1-based position, make-up rows included; the server lays out and validates by the same rule the preview draws: row `w` exists iff the live rows before it number fewer than `size`.** A ticked make-up row is born `SICK_LEAVE` + `plannedAtCreation`, and the engine appends another make-up for it — same engine, no second path. The preview returns the row as `absent: true, makeup: true` (both flags — the FE renders from them).
- Replace `:276`'s refine with the existence rule above; **keep `:279` (`distinct absences < size`) as the cap** — the customer asked for the lock to go, not the cap; if you think the cap is now wrong, say so on the list, do not move it.
- 🚫 Unchanged: post-creation leave, `reconcileCoursePlan`'s own rule, the import path.
- ❓ Implementation is yours; my expectation: after the reconcile, flip the ticked make-up(s) to `SICK_LEAVE`/`plannedAtCreation` and reconcile again — or lay the make-ups out in the create as the preview does. **Say which and why; the preview and the save must agree on the finished course (TASK-309's promise), pinned.**

## §3 Finding 2 — the owner said DO IT
`resumeCourse`: `input.teacherId ?? rows.at(-1)?.teacherId` — the LAST session's teacher (rows are `asc(date), asc(startTime)`). One line; the absent path moves; rewrite the TASK-359 pin that says "first". @Fern's dialog default follows (TASK-362 §3).

## Definition of Done
- [ ] Suite, **count** · tsc (`bunx --package typescript@5.6.3 tsc --noEmit`) · **35 = 35**
- [ ] Pinned: tick make-up row `size+1` on a size-4 with week 2 absent ⇒ 4 live, 2 leaves, 2 make-ups, ceiling base + 2 weeks; preview == save; a `w` beyond the chain refused; cap `< size` still refused
- [ ] Resume default = last session's teacher, pinned both ways
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

## Question — ⚠️ to the OWNER'S LIST
❓ With the lock gone, a family can declare leave on a make-up of a make-up — the chain is bounded only by the cap. Is `< size` the cap the owner means, or the leave QUOTA (4+1, 6+2, 10+3)? Name the two numbers for the customer's sizes; build nothing.

---

# 📤 REPORT — @Jason → @Sober (2026-09-16)

✅ **DONE (code).** **2148 pass / 0 fail**, **174 files** (+1) · `tsc --noEmit` clean · 🚫 **no migration (35 = 35)**. Changed: `course-plan.ts` (two pure functions), `validation.ts` (the lock), `scheduler.service.ts` (preview loop, create's second pass, the resume default), one TASK-359 pin rewritten. New: one test file.

## §1 🔑 ONE rule, THREE callers — and the preview and the save agree because they ask the same function
**`plannedRowCount(size, absent)`** — *row `w` exists iff the live rows before it number fewer than `size`*; rows are laid out one after another, live unless declared absent, and the plan stops the moment `size` live rows exist. Pinned with values: size 4 + {2, 5} ⇒ **6 rows, 4 live, 2 leaves, 2 make-ups, row 5 = `absent: true, makeup: true`** · {2, 5, 6} ⇒ 7 rows (a make-up of a make-up is the same case one row later) · {5, 6} with no chain absence ⇒ 4 rows — rows 5 and 6 never exist · {2, 7} ⇒ 5 rows, 7 refused.
1. **The validator:** `w <= size` (the lock) → `plannedRowExists(w, size, absent)`. ✅ **The CAP stays** — `< size`, asserted still refusing an all-leave course, and the lock asserted GONE from the source.
2. **The preview:** the flat `for k < absent.size` loop → `while (sessions.length < plannedRowCount(...))`, each appended row `absent: absent.has(position), makeup: true` — **both flags, for @Fern.**
3. **The create — your ❓ *say which and why*: (a) flip-then-reconcile-again.** After the first `reconcileCoursePlan`, the appended make-ups sit at positions `size+1…` in date order; the ones whose position was declared absent are flipped to `SICK_LEAVE` + `plannedAtCreation` — exactly what a chain-week absence is born as — and **the SAME engine is asked again**, which appends one more make-up for each, linked through `extendedFromId` like every other. Repeat until nothing is left to flip. **Why (a) and not (b):** the save side keeps ONE placement engine (`reconcileCoursePlan` → `findFreeExtensionDate` from the last planned date), which is the loop the preview already mirrors — asserted: the create contains no `findFreeExtensionDate(` of its own, calls the engine exactly twice, and reads positions in the preview's order. **Preview == save because both ask `plannedRowCount` for how many rows and both place from the last planned date — pinned, not assumed.**

## §2 ✅ The ceiling — unchanged in shape, asserted
`absentWeeks.size` counts POSITIONS, chain or make-up alike, and the create still passes exactly that. Kavya holds (size 6, 3 ⇒ week 11; 0 ⇒ week 8). **The DoD case: size 4, week 2 + the make-up at row 5 ⇒ base + 2 weeks = week 7**; one extended leave alone would be +1.

## §3 ✅ Finding 2 — the owner said DO IT
`resumeCourse`: `input.teacherId ?? rows.at(-1)?.teacherId` — the LAST session's teacher (`rows` is `asc(date), asc(startTime)`). **The absent path moved on purpose**; the TASK-359 pin that said "first" is rewritten to say "last" and to assert `rows[0]?.teacherId` is gone.

## §4 🔑 Mutation — six, `finally`, checksum — all bite, and one of them taught me something
the lock back · the cap gone · the rule off by one · the preview draws a ticked make-up live · **the create never flips** · the resume default slides back to first.
🔻 **Mutation E PASSED on the first run.** I had replaced `if (!toFlip.length) break;` with a bare `break;` — the flip loop was dead **with every line of the flip still in the file**, and my source pins saw the text and not the behaviour. ✅ **Fixed the right way: the flip DECISION is now a pure function, `makeupsToFlip(orderedRows, size, absent)`, tested with VALUES** (the DoD case after the first reconcile ⇒ exactly row 5; after the second ⇒ nothing; a chain week is never this pass's job; a make-up of a make-up flips once it exists) — **and the loop's control flow is pinned: exactly ONE `break`, the guarded one, before the flip.** Mutation E now fails. 📌 *TASK-345's lesson again — a text pin passes on a shape; a value assertion does not.*

## §5 ❓ YOUR QUESTION — the CAP: `< size`, or the leave QUOTA? The two numbers for the customer's sizes
| size | leave quota (`4+1, 6+2, 10+3`) | the cap today (`< size`) allows declared absences up to |
|---|---|---|
| 4 | **1** | **3** |
| 6 | **2** | **5** |
| 10 | **3** | **9** |
🔑 **They are DIFFERENT numbers with DIFFERENT meanings, and the code has always known it:** the quota is what a family may take AFTER creation (`leaveUsed` counts against it); the cap is only *"a course cannot be all leave"* — and a declared absence at creation is FREE (owner decision B: `leaveUsed` is not touched). ⚠️ **With the lock gone, the cap is the only bound on the chain, so a size-4 family may now declare three absences at creation, chaining through make-ups, at no quota cost — and end with a 7-row plan and a ceiling at week 8.** *That was already true for three CHAIN weeks; item 1 lets them fall on make-ups too.* 📌 **I did not move the cap, as instructed. For the owner: if "advance leave" is meant to spend the same allowance as leave taken later, the cap is the quota (1/2/3) and the create must count against `leaveUsed` — a different rule, one line each, and a decision.**
