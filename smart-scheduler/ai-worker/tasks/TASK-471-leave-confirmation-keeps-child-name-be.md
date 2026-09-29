# TASK-471 — `REQ-107` owner ruling: the leave confirmation KEEPS the child's name (TASK-135 wins over the customer's sheet) — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-25) · **Size XS.** No migration.

## §0 The ruling
TASK-470 built the leave success line from the customer's sheet, which drops the child's name. **The owner rules the other way: TASK-135 Q2 stands — the name stays.** The reason is the one TASK-135 gave and it has not changed: a parent with three children must be able to see from the message *which one* was excused. Everything else in TASK-470 is untouched, including the parts of her sheet the owner has now explicitly kept (§0 below).

## §1 Build
- The leave success line carries the child's name again, in both languages, in the shape TASK-135 settled — read that task, do not invent a new arrangement. Her other words on that line stay hers.
- **Pin it, and pin WHY:** a comment that names the ruling and the reason, so the next person who reads her sheet and sees no name does not "fix" it back. This line has now been decided twice in opposite directions; the file should say which way and on whose word.
- 🚫 Nothing else from TASK-470 moves. The other four owner decisions are **settled as built**: the "admin will reply" line stays dropped · the English text in the Thai cells stays · her date styles stay · (and my two provisional readings stand — the quota removal is message-only, "moves to the end" is wording only).

## Definition of Done
- [ ] The name back in both languages, by value · the comment naming the ruling · nothing else in TASK-470 changed (its pins unmoved) · suite **count** · tsc 0 · 56 = 56 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-25) — the name is back in TASK-135's shape; the ruling is written beside the key; 3022 pass / 0 fail; 6/6 mutations bite

**Numbers:** `bun test` **3022 pass / 0 fail** (+1) · `tsc` **0** · 🚫 no migration (**56 = 56**).

## §1 The line, by value
- EN `Record Leave: Feen — FRI 25/09 @ 16:00 : Private BALLET / Teacher KK`
- TH `บันทึการลา : Feen — FRI 25/09 @ 16:00 : Private BALLET / Teacher KK`
- DUO `Record Leave: Feen & Pun — …`
- **Shape = TASK-135's** `<heading>: {name} — <session>`, read from the committed key (`แจ้งลาแล้ว: {name} — …` / `Leave recorded: {name} — …`). Her heading, spelling and session line stay hers. The quota warning still follows when it applies.
- 📌 **One thing to see, not a new arrangement:** TASK-135 filled `{name}` with `b.student.name` (the full name). It now goes through the ONE name rule (`studentNamesOf`, TASK-425), which is the same name that leads every other line of her format since TASK-470. So it reads the nickname, and **a DUO session names both children**, which is exactly the "which child" question this ruling protects.

## §2 The ruling, pinned WITH its reason
The comment on `leave_ok_session` (`line-i18n.ts`) records four things:
1. The line was decided twice, in opposite directions (TASK-135 Q2 vs the sheet).
2. **The owner ruled on 2026-09-25, via you, in TASK-471.**
3. The reason: *a parent with three children must see WHICH child was excused.*
4. ⛔ "do NOT 'fix' it back to match her sheet".

A test keeps that comment present (mutation F deletes it and bites). The handler carries a one-line pointer to it.

## §3 Nothing else from TASK-470 moved
The only pins touched are the leave-success ones in `line-v2-messages-req107.test.ts`, which is this line. All other 470 pins are unmoved: the admin line stays dropped, the English stays in the TH cells, the date styles stay, the quota removal is message-only, and the end-of-course wording stays gone.

## Break-and-watch: `mut471.mjs`, 6 mutations, **6 bite**
`finally` + sha-256 restore, byte-identical each time. `git diff` CHECKSUM `9d1d5c97…` identical before and after. `BASELINE=59` read off the run on 3 suites.
- A 🔴 name dropped from TH
- B 🔴 name dropped from EN
- C the name moved after the session (a new arrangement)
- D 🔴 the name hand-built (a DUO row names one child)
- E 🔴 the name not passed (`{name}` printed literally)
- F 🔴 the ruling's comment deleted

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-25)
Re-run by me, **twice**: **3022 pass / 0 fail** both times · tsc 0 · 56 = 56. (Two runs by habit now, after my own torn read on 468/469.)
📌 **The detail that makes this right rather than merely done:** the name goes through **`studentNamesOf`**, not TASK-135's original `b.student.name`. TASK-135 settled *that the name is there*; the ONE name rule (TASK-425) settled *how a name is written* — nickname-first, and **both children on a DUO session**. Restoring the old line literally would have re-introduced a second name path a month after we spent a task removing them, and on the one message where a parent of two in the same class most needs to see which child was excused. He read the ruling for its intent rather than its letter.
**And the comment is the deliverable as much as the line is.** This line has now been decided in opposite directions twice — the customer's sheet drops the name, the owner's ruling keeps it — so the file says which way, on whose word, on what date, and *"do not fix it back to her sheet"*. A test keeps the comment present, which is the only way a comment survives a refactor.
Nothing else from TASK-470 moved. **REQ-107's backend is complete: 468 · 469 · 470 · 471.**
