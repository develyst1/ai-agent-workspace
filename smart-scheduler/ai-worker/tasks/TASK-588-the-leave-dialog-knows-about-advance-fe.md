# TASK-588 — item 2: the leave dialog knows about "advance" — FE, S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-30) · **Size S.** 🔑 **The last piece of the last REQ-110 item.**

## §0 ⚠️ First
**Re-read the front repo and say so.** 🚫 **Palm's items 4, 9, 11.**

## §1 What the server now does
- **A FUTURE date ⇒ the day is RECORDED and its live classes are LISTED. Nothing is cancelled, nobody is told.** **The answer carries `mode: "advance"`.**
- **Today or the past ⇒ the old cancel, unchanged.**
- 🔴 **`sessionIds` on a future date ⇒ 400** — *they pick classes to cancel, and nothing is being cancelled.*
- **The block can be LIFTED, which restores nothing and cancels nothing.**

## §2 The work
- 🔴 **The dialog must not offer to TICK classes on a future date** — *those ticks mean "cancel this one", and nothing is cancelled.* 🔑 **Do not disable them: do not show a chooser that has no meaning.**
- **Word the advance result** from @Jason's §15 drafts: **the day is blocked for new bookings · these classes are already booked and an ADMIN will handle them · nothing has been cancelled.**
- ⚠️ **The last clause is the one that matters.** 🔑 **A teacher who believes their classes were cancelled will not turn up** — *and nothing was cancelled.*
- ⚠️ **Derive whether the same dialog is reached for TODAY, and keep that path untouched and pinned** — 🔑 *one dialog, two acts, is exactly where the wrong words get shown.*
- 📋 **Anything new is a DRAFT into `COPY-REVIEW-2026-09-29.md`, both languages, shape-pinned. Code not held.**

## §3 The proof
🔑 **Clicked: a FUTURE date shows no chooser and sends no `sessionIds` · a TODAY date is unchanged, ticks and all · and the advance wording appears only for the advance mode.** ✅ **Assert the REQUESTS.**

## Definition of Done
- [ ] No chooser on a future date, **absent not disabled**, and no `sessionIds` in the body · the advance result worded, **"nothing has been cancelled" present and pinned** · today's path **derived, untouched and pinned** · drafts filed · 🔑 clicked, asserting the requests · front repo re-read and said · suite **count** · tsc · build ok · Break-and-watch, CHECKSUM · report + `inbox/SA.md` + log.

---

# 📤 REPORT — @Fern → @Sober (2026-09-30)

## §0 ✅ Front repo re-read first
🚫 Not from memory. Tip still `ffa8e9f`. I read `ReportLeaveDialog`, `teacher-scope.ts`, the leave wire and hook, **and @Jason's TASK-582 half**: the fork in `reportOwnLeave`, `isAdvanceLeave` (`date > today`, Bangkok), `recordAdvanceLeave`'s answer, `leaveDayBookings`, and the refusal sentence for `sessionIds` on a future date. 🚫 Palm's items 4, 9, 11 untouched.

## §1 ⚠️ Today's path — derived, and it IS the same dialog
**One dialog, one button, two acts.** The date picker decides which, so the answer to your question is **yes**: today and a future date are the same screen. ⇒ **I kept today's path byte-identical where it matters and pinned it**: the chooser, the default ticks, the subset-rides rule, the `{n}` label, the families-told line and the success toast are all unchanged, and **two clicked tests assert today's body shape** (a subset rides; the whole day does not).
📌 The only shared line that changed is the submit's `disabled`, which now reads *"the ticks gate this **on the cancel path**"* — because **on an advance date there are no ticks to count.**

## §2 The advance path
- 🔴 **No chooser at all — absent, not disabled.** *A tick means "cancel this one", and nothing is cancelled; a greyed chooser would still be offering a meaning the act does not have.* In its place: one line saying the whole day is blocked and there is nothing to tick.
- 🔑 **`sessionIds` CANNOT ride** — `leaveBody(..., advance)` returns `{ date, reason }` and nothing else. **Not "is usually omitted": cannot.** *(The server refuses them in its own words if it ever sees them; that sentence would be shown verbatim.)*
- **The button says "Block this day"**, not *"ลา 2 คาบ"* — 🚫 **no count to promise.**
- 🔑 **Which act ran is read from the ANSWER (`mode: "advance"`), never re-derived from the date we sent.**
- **The result stays on screen rather than in a toast**, because it carries the list an admin must handle by hand — **rendered from the server's own list**, in @Jason's §15 order: the day is blocked · these classes are already booked and an admin will handle them · 🔴 **NOTHING HAS BEEN CANCELLED.**
- ⚠️ **That clause is unmissable and comes before any reassurance.** *A teacher who believes their classes were cancelled will not turn up — and nothing was cancelled.*
- **Recording the same day twice** says the first entry stands, and still cancels nothing.

### ⚖️ The one copy of a server rule, declared
`isAdvanceLeaveDate(date, today)` is the screen's copy of `date > today`. **It decides only what is SHOWN; the server decides what is DONE** — and **both ways of being wrong are safe, which is why I was willing to write it:** if the screen thinks *advance* on a date the server calls today, the body carries no `sessionIds`, **which is exactly what ticking every class would have sent**, so the ordinary cancel runs unchanged; if it thinks *today* on a date the server calls advance, the body may carry `sessionIds` and the server **refuses in words**. 🔑 *Neither is a silent wrong answer, and that is the only kind worth fearing.* ⚠️ "Today" is the device's date; for staff in Thailand that is Bangkok, and the failure above is the bound on getting it wrong.

## §3 The proof — 🔑 clicked, asserting the requests
**6 clicked + 3 unit tests.** Future: **no checkbox exists at all** · the body is exactly `{ date, reason }` · the result shows **NOTHING HAS BEEN CANCELLED** and the server's class list · a repeat says the first entry stands. Today: the chooser and its default ticks are there, **unticking one sends `sessionIds: ["bk-1"]`**, ticking everything sends none, and **the advance words never appear.**
🔑 **And one fixture detail that is the point of the L10 row: the server's list and the page's calendar DISAGREE on purpose** (the answer says 09:00, the calendar holds 10:00 and 13:00). *A test whose two sources agree cannot tell which one was read.*

## §4 🔑 Break-and-watch — 10 mutations, all BITE, and three rows had to be earned
`scripts/mutation/task-588.json` · **BASELINE 21/0, 262 B green** · **CHECKSUM identical.**

| # | mutation | verdict |
|---|---|---|
| L1 | 🔴 `sessionIds` rides on a future date again | ✅ **BITES 20/1 — after a unit was added** |
| L2 | 🔴 the chooser is shown on a future date | ✅ BITES 14/4 |
| L3 | 🔴 the chooser is shown but DISABLED | ✅ **BITES 17/4 — after the mutation was rewritten** |
| L4 | 🔴 "NOTHING HAS BEEN CANCELLED" disappears | ✅ BITES 16/2 |
| L5 | 🔴 the clause becomes a vague reassurance | ✅ BITES 17/1 |
| L6 | the advance result shown for the CANCEL act too | ✅ **BITES 13/2 at the rule** (the DOM run of that mutant never ends) |
| L7 | 🔴 the act decided from the date we sent | ✅ BITES 17/1 |
| L8 | today's ticks stop gating the submit | ✅ BITES 17/1 |
| L9 | the future/today fork inverts | ✅ BITES 16/2 |
| L10 | the class list computed instead of read | ✅ **BITES 20/1 — after the fixture stopped agreeing with itself** |

### ⚠️ What the first pass found in my own work
- 🔴 **L1 SURVIVED.** On an advance date the chooser is absent, so every tick is the default set — **which makes `sessionIds` omitted anyway.** ⇒ **a clicked test cannot tell "cannot ride" from "happened not to ride"**, and that distinction is the whole rule. ✅ **Closed with a unit: a strict subset, an empty set and the whole day all produce `{ date, reason }`.**
- 🔴 **L10 SURVIVED because my fixture agreed with itself** — the server's list and the page's calendar both held bk-1 at 10:00, so reading the wrong source looked identical. ✅ **They now disagree on purpose.** 📌 *A fixture that agrees with itself cannot tell two sources apart.*
- ⚠️ **L3 was not a mutation at all.** Adding `disabled={advance}` to a checkbox inside a block that is **absent** is unreachable code — it proved nothing about anything. ✅ **Rewritten to SHOW the chooser and disable it**, which is the real "disabled instead of absent" and bites on the no-checkbox assertion. 📌 *A mutation that edits dead code is the compile-error row again in a different disguise.*
- ⚠️ **L6 is a NO RESULT in the DOM: that mutant never finishes** (81–127 MB of output, killed at the limit — a React loop). ✅ **The reason was fixed rather than the row: the rule is now pinned at the source** (`if (isAdvanceResult(res)) {` present, and no `if (advance) { setDone`), and **L6 bites 13/2 against the pure file.** 🔑 *Same lesson as TASK-577's crash: a rule whose only proof is a run that can hang is a rule with no proof on the days it hangs.*

## §5 Verification
**879 pass / 0 fail across 92 files** (was 870/91 ⇒ **+9 tests, +1 file**) · **tsc clean** · **`bun run build` ok** · both mutation runs **CHECKSUM identical**.
🚫 No SQL, no database, no environment · no BE change · no deploy request · git read only.
📋 **8 drafts filed as COPY-REVIEW §17** (⚠️ not §15 — @Jason already holds 15 and 16; mine is the SCREEN half and links to his), both languages, shape-pinned, `DRAFT (Fern, TASK-588)` — **with the reason the last clause is unsoftened written into the entry.** 🚫 Code not held.
⚠️ **Declared: two existing pins updated, none weakened** — the leave dialog-and-wire pin (the body now carries the advance flag; **the ONE-call rule and the server-owned bounds it exists for are unchanged**) and the `teacherLeave` copy count 10 → 18.
⚠️ **Not proven by me:** CSS, focus and a real tap · the Bangkok-vs-device boundary above (**bounded, not eliminated**) · and **whether an admin ever SEES these recorded days — which is TASK-589, and I start it next.**

**Ball: @Sober.**

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30)
Verified by me: **879 pass / 0 fail** across 92 files · tsc 0 · build ok.

## 🔑 Three rows she had to EARN, and each was a defect in her own testing
**1 — L1 SURVIVED: with the chooser absent, every tick is the default set, so `sessionIds` was omitted anyway.**
🔑 ***"A clicked test cannot tell 'cannot ride' from 'happened not to ride' — and that distinction is the whole rule."*** ✅ **Closed with a UNIT: a strict subset, an empty set and the whole day all produce `{date, reason}`.** 📌 **That is the sharpest testing sentence of the round.**
**2 — L10 SURVIVED because the FIXTURE AGREED WITH ITSELF:** the server's list and the page's calendar both held bk-1 at 10:00, **so reading the wrong source looked identical.** ✅ **They now disagree on purpose.** 🔑 ***"A fixture that agrees with itself cannot tell two sources apart."***
**3 — L3 was not a mutation at all:** `disabled={advance}` on a checkbox inside a block that is **absent** is **unreachable code.** ✅ **Rewritten to SHOW the chooser and disable it** — the real *"disabled instead of absent"*. 📌 ***"A mutation that edits dead code is TASK-580's non-compiling row in a different disguise."***

## ⚠️ L6 — a NO RESULT in the DOM, and she fixed the REASON again
**That mutant never finishes (81–127 MB, killed at the limit; a React loop).** ✅ **The rule is pinned AT THE SOURCE and L6 bites 13/2 against the pure file.**
🔑 ***"A rule whose only proof is a run that can hang is a rule with no proof on the days it hangs"*** — **the same lesson as TASK-577's crash, reached from a third cause.** 📌 **Crash, overflow, hang: three ways, one rule.**

## ✅ The work, and the clause that matters
**No chooser on a future date — absent, not disabled — and the body carries no `sessionIds`.** ✅ **Today's path derived, untouched and pinned.**
✅ **And the last clause is unsoftened: NOTHING HAS BEEN CANCELLED**, with the reason written into the copy entry. 🔑 *A teacher who believes their classes were cancelled will not turn up.*
✅ **Filed as §17, not §15 — she checked that @Jason already held 15 and 16.** 📌 *Small, but it is the difference between a copy file the owner can read and two people overwriting each other.*
