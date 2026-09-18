# TASK-343 — `Remaining` says of what, and a session says its DATE (`REQ-087 §6a`, `§6b`)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-11)
▶️ **OWNER-CHOSEN** — *"แก้เลยเหอะฉันว่าไม่น่ายาก"*. ⏱️ **NOT held for `uat`** — he is deploying the current
build; **these go in the NEXT one.** 🚫 No migration, no FE change.
⛔ **THE CHAIN IS STOPPED. These two are the ONLY things cut. NOTHING rides along** — 🔑 **not the `||` sites,
not a sweep, not a check, however tempting the neighbourhood looks.**

---

## §1 ✅ `§6a` — and I checked the precondition @Porter asked about: **the denominator IS there**
❓ **He asked: *"check the total is available at that point before building it."***
✅ **It is, and nothing needs plumbing.** **`remainingLabel(kind, remaining, total)` ALREADY TAKES `total`, and
both call sites pass it** — `course-deduction.ts:97` and `jobs.service.ts:418`/`:420`. 🔑 **The course branch
simply IGNORES the argument it is given.**
| today | must become |
|---|---|
| voucher `9/10` — a fraction with no unit | **`9/10 sessions`** |
| course `3 HR` — a unit with no denominator | **`3/4 HR`** |
🔴 **`3 HR` does not say OF WHAT** ⇒ ***a parent cannot tell 3-of-4 from 3-of-10, which is the only thing that
line exists to say.***
🚫 **The UNIT is NOT being unified** — **a voucher sells sessions, a course sells hours, and that difference is
real.** ✅ **The SHAPE is unified and the unit is made explicit.**

⚠️ **One thing to record in the code, because it will matter later:** 📖 **`sessions` and the `n/N` shape are
@Porter's words, RATIFIED BY THE OWNER — they are NOT the customer's.** ⇒ **stronger than a placeholder,
weaker than `§16d`.** 🔑 **Pin the SHAPE and the unit words, and note WHOSE they are** — 📌 *so that if the
customer ever writes their own, the boundary is already known and nobody re-argues it from scratch.*

## §2 ✅ `§6b` — the per-session confirmation carries the REAL DATE
🔴 **Today one conversation delivers `Date : Friday` and `Date : 2026-09-18` to the same parent.**
✅ **`booking_confirmed` (`§7.3`) renders `date` as `ddmmyyyy(ctx.date)`** — **the helper already exists in
`time.ts` from TASK-318.** 📌 *The current expression is `t(\`ob_dow_${weekdayOf(ctx.date)}\`, TEMPLATE_LANG)`.*
🚫 **`§7.1` course-wide KEEPS THE WEEKDAY.** ⚠️ **It reads `payload.weekday`, a DIFFERENT source, so it will
not follow by accident** — 🔑 **assert it is UNCHANGED anyway, because the rule is the point:**
> ***`REQ-085 §15` still holds: WEEKDAY for a course, DATE for a session. This makes the product consistent
> with that rule rather than breaking it.***
🔻 **AND WRITE THIS BESIDE IT:** ***this deviates from the customer's `§7.3`, and the owner is TELLING them,
not asking.*** 🚫 **It is not unsettled and must not be marked as a placeholder.** 📌 *Their own argument for
the leave notice — "ครูจะไม่รู้ว่าแจ้งลา พฤ ไหน" — is this reason applied to a message they had not looked at
yet.*

## §3 The pins
⚠️ **Both items move BYTE PINS, deliberately.** ✅ **Rewrite them; do not delete them** — 📌 *an assertion that
changes because a requirement changed is correct.*
🔑 **NAME EVERY PIN THAT MOVED AND COUNT THEM**, the way you did on TASK-325's seven. ⚠️ **And say whether any
`§17c` full-entry pin shifted** — *those are the customer's own bytes.*

## §4 What must not change
- 🚫 **`§7.1`'s weekday** · `ob_dow_*` · `TEMPLATE_LANG` · `weekdayOf` *(it keeps its other callers)*.
- 🚫 `fieldValue` (TASK-332) · the `Remark` lines (TASK-336/337) · TASK-335's headers · the builder trim.
- 🚫 **The nine remaining `|| undefined` sites** — ⚠️ **they are CORRECT and this task does not touch them.**
- 🚫 No migration · no FE change · no new i18n key **unless `sessions`/`HR` needs one — say so if it does.**

## Definition of Done
- [ ] `bun test` all pass, **state the count** · typecheck clean (`bunx --package typescript@5.6.3 tsc
      --noEmit`) · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **`Remaining` is `n/N unit` for BOTH kinds** — asserted, **course AND voucher**, ⚠️ *and asserted on
      the DAILY SCHEDULE too, since it renders through the same helper*
- [ ] 🔑 **`§7.3` shows `DD-MM-YYYY`** — asserted
- [ ] 🔴 **`§7.1` still shows the WEEKDAY** — asserted, ⚠️ *the assertion that keeps `§15` alive rather than
      letting "dates everywhere" happen by drift*
- [ ] **Every moved pin NAMED and COUNTED**, and `§17c` addressed
- [ ] **The two ATTRIBUTIONS are in the code**: the unit words are @Porter's ratified by the OWNER; the `§7.3`
      date DEVIATES from the customer and the owner is telling them
- [ ] 🚫 **NOTHING ELSE CHANGED** — asserted, and **say so explicitly in the report**
- [ ] 🔑 **Break it and watch** — one call, restore verified by CHECKSUM *(not by an exit code)*

## Question — ⚠️ **and its answer goes on the OWNER'S LIST, not into a task**
🔑 **@Porter has stopped the chain, and the reason was that every Question became the next task.** ✅ **The
Questions stay; what changes is where the answer GOES.**
❓ **`Remaining` has now been wrong twice in one week — `ครั้ง` in the value, and a missing denominator — and
neither was reported by the person who reads it.** ⇒ **is there anything else in a message that is a NUMBER
WITH AN IMPLIED UNIT?**
📌 *Candidates I can see: `Sessions` before we removed it, the leave quota, `plannedLeaveDates`' count.*
🚫 **Name them. Build nothing. Do not propose a sweep.** **I will put whatever you find on the list @Porter is
taking to the owner, with a size, and he decides.**

---

# 📤 REPORT — @Jason → @Sober (2026-09-11)

✅ **DONE (code).** **2042 pass / 0 fail**, 164 files · 🚫 no migration (**35 = 35**) · `tsc --noEmit` clean ·
🚫 **no FE change, no new i18n key** (see `§1`). **11 files touched: TWO source files and nine test files.**

## §1 ✅ `§6a` — `Remaining` says OF WHAT, for both kinds
| | today |
|---|---|
| voucher | **`4/6 sessions`** |
| course | **`2/6 HR`** |
✅ **Your precondition held exactly as you said:** `remainingLabel` was already handed `total` and **the course
branch simply ignored it** ⇒ **nothing plumbed, one line changed.**
🚫 **NO NEW I18N KEY, and here is the reasoning rather than the conclusion:** `HR` has always been a bare
English literal inside this helper, because **`REQ-085 §4` puts system-generated values in English for
everyone.** ⇒ **`sessions` is the same kind of thing and lives beside it as one constant.** ⚠️ *If it ever
needs to be Thai for a Thai reader, that is a §4 reversal and a different conversation.*
📖 **The attribution is IN THE CODE, in the words you gave me:** *`sessions` and the `n/N` shape are @Porter's,
**RATIFIED BY THE OWNER** — not the customer's · stronger than a PLACEHOLDER, weaker than `§16d`.* 📌 **So if
the customer writes their own, the boundary is already recorded and nobody re-argues it.**
✅ **Asserted on the DAILY SCHEDULE too, and not by copying a string:** ⚠️ **that file PINS A STRING IT
HARD-CODES**, so on its own it would have gone on saying `4/6` for a year. 🔑 **The new test calls
`remainingLabel` and feeds its REAL output to the renderer, for both kinds** ⇒ *the two cannot drift.*

## §2 ✅ `§6b` — the session's real date
✅ **`§7.3` renders `ddmmyyyy(ctx.date)` — `08-09-2026`** — TASK-318's helper, no second date function.
🔴 **`§7.1` still shows the WEEKDAY, and I asserted it FROM `§7.3`'S OWN FILE** rather than trusting its file
to notice. 🔑 *That is the assertion that keeps `REQ-085 §15` alive — **WEEKDAY for a COURSE, DATE for a
SESSION** — because "dates everywhere" is precisely the kind of thing that happens by drift.*
🔻 **Both attributions are in the code:** *this DEVIATES from the customer's `§7.3` and **the owner is TELLING
them, not asking** · not a placeholder, not unsettled* — with their own leave-notice argument beside it.
🚫 **The ISO form still reaches no reader** — asserted as an absence in all four places it was before.

## §3 🔑 THE PINS — 14 tests failed, ALL REWRITTEN, NONE DELETED
**8 files. 29 assertion lines out, 39 in. 6 `test(` names changed — every one a RENAME; the body survives in
all six.** ✅ **Net +1 test: the new daily-reminder one.**

**`§6a` — 6 tests**
1. `course-deduction.test.ts` · *"the label"* — 4 assertions (`2/6 HR` · `4/6 sessions` · the zero · the clamp)
2. `course-deduction.test.ts` · *"the payload computes remaining"* — both `toMatchObject`s
3. `deduction-remark-req087.test.ts` · *TASK-336 `§5` "what this did not touch"* — 📌 **the headers ARE still
   untouched; it was the balance that moved, and the test name now says which is which**
4. `remaining-zero.test.ts` · *"what it actually sends at ZERO"* — ⚠️ **the CLAIM is untouched and is the one
   that matters: at zero the producer sends a NON-EMPTY label**, which is why `||` was latent
5. `voucher-deduction-req087.test.ts` · *"the voucher balance is `14/15`"* — 🔑 **`§1c`'s claim is unchanged:
   NO THAI. `sessions` is English.** 📌 *Removing `ครั้ง` applied a ruling; adding `sessions` was a decision
   somebody made on the record — different acts, and the test now says so.*
6. `voucher-deduction-req087.test.ts` · *"the COURSE form is untouched"* — ⇒ **it is not, any more**

**`§6b` — 8 tests**
7. `line-message.test.ts` · *booking_confirmed → teacher* · 8. `line-message.test.ts` · *the note regression*
9. `line-message-fields.test.ts` · **the four lesson types' BYTE-IDENTICAL pin** — 🔻 **rewritten for the
   SECOND time** (TASK-303 was the first). ⚠️ *Twice is not a sign the pin is wrong; it is the pin doing its
   job, twice.* · 10. `leave-notice-req085.test.ts` · the neighbour-check byte pin
11–14. `session-confirmed-req085.test.ts` · **all four**, including 🔴 ***the one I REVERSED***: it asserted
*"the calendar DATE appears NOWHERE"* and now asserts the opposite. **Rewritten with the reversal and its
reason written into the test** — 📌 *an assertion reversed by a requirement is correct; deleting the test that
failed is how the record is lost.*

**⚠️ TWO pins I moved that did NOT fail, declared because you would rather know:**
`remaining-zero.test.ts`'s three renderer INPUTS (`"0 HR"` / `"3 HR"` / `"0/6 ครั้ง"`) and
`daily-schedule-req085.test.ts`'s hard-coded row. **They take whatever string arrives, so they were green on
stale shapes** — 🔑 *exactly TASK-338's class, and I was not going to leave `ครั้ง` sitting in a test input two
tasks after removing it.*

## §4 ✅ `§17c` — NOTHING SHIFTED
🔑 **Ten files pin `§17c` full entries — the customer's own bytes — and NOT ONE of them is among the eight.**
📌 *Checked by name, not assumed: none of `registration-copy-req079` · `birthdate-format` · `customer-english`
· `line-bilingual` · `copy-scope-req085-16` · `advertised-is-reserved` · `no-skip-first-child` ·
`leave-notice-req085-16d` · `line-role-buttons` · `line-silence` failed or was edited.*

## §5 🚫 NOTHING ELSE CHANGED — stated explicitly, as the DoD asks
**Two source lines: `remainingLabel`'s return, and `§7.3`'s `date`.** ✅ **`§7.1`'s weekday · `ob_dow_*` ·
`TEMPLATE_LANG` · `weekdayOf` (it keeps its other callers) · `fieldValue` · the four `Remark` lines ·
TASK-335's headers · the builder trim · the NINE `|| undefined` sites — ALL UNTOUCHED**, and the suite asserts
it. 🚫 **The chain stayed stopped: nothing rode along** — *not the `||` sites, not the 18 regions from
TASK-342, not a sweep.*

## §6 🔑 Mutation — one call, restore in a `finally`, verified by CHECKSUM
✅ **I wrote it the way I described the helper to you, and it earned its keep on the first run.**
- **A · the balance loses its denominator** ⇒ **8 fail**, including the daily-reminder test and TASK-338's
  doc-block check *(the doc quotes the literals, so it caught the mutation too — unplanned and correct)*.
- **B · `§7.3` back to a weekday** ⇒ **8 fail**, including both byte pins and the reversed one.
- ✅ **Both restores byte-identical by SHA-256** (`090f58f7…`, `1dc5e1f4…`), `git status` = the 11 intended files.

🔻 **AND IT PROVED THE POINT BY FAILING.** ⚠️ **My mutation B anchor was wrong twice** — first the text, then
**because the sources are CRLF and I wrote a multi-line anchor with `\n`.** 🔑 ***Both times the `finally` ran
and restored the file anyway, and the suite was green before I even looked.*** 📌 **Under an `&&` chain that
throw is exactly the shape that left @Fern's file mutated.** ⇒ ***the property is not tidiness; it is that
there was no path through that script that skipped the restore.*** **That is the whole argument for one
helper, demonstrated by accident on the day I made it.**

## §7 ❓ YOUR QUESTION — numbers with an IMPLIED UNIT. **Named. Nothing built, no sweep proposed.**
🔻 **First, two of your three candidates are already fine, and I checked rather than repeated them:**
- 🚫 **`plannedLeaveDates` is NOT a count** — `advanceLeave` renders the DATES joined (`§7.1`), so there is no
  bare number to misread.
- 🚫 **The leave quota never reaches a LINE message at all** — `leaveQuota`/`leaveUsed` live in the services
  and the course history; **no renderer reads them.**
- ✅ **`Sessions` is already gone**, and the only thing left of it is a test asserting its ABSENCE.

🔴 **What I did find, in the order I would rank it:**
1. **`Program : Private Freeskate 6 HR`** (`programLabel`, the COURSE branch). ⚠️ **The `size` it renders as
   `HR` is the same field the balance counts with `usedSessions`** — *`remainingLabel("course", size −
   usedSessions, size)`.* 🔑 ***So the product calls one quantity HOURS in the Program line and SESSIONS in
   the arithmetic behind Remaining.*** 🚫 **I am NOT claiming it is wrong** — a session is presumably an hour
   here — 📌 **I am saying the equivalence is IMPLIED and written down nowhere**, and it is the same shape as
   the two that have already bitten us. **Size: one question to the owner, then either a word or a comment.**
2. **A VOUCHER's `Program` line carries NO size at all** — `programLabel` returns the bare subject — **while
   its `Remaining` now says `4/6 sessions`.** ⇒ *the message states the denominator in one line and omits it
   in the other.* **Not a defect; an asymmetry the owner may or may not want.**
3. 🔴 **NOT a unit, but the same family and I think the more valuable one:** ⚠️ **after today there are THREE
   date formats in the product's messages** — **`08-09-2026`** (`§7.3`, `§9.1`), **`Tuesday`** (`§7.1`), and
   **`2026-09-08` — RAW ISO, in the DAILY SCHEDULE.** 🔑 ***`§15` explains two of them. Nothing explains the
   third.*** 📌 **It is the only place a reader sees the machine's own format**, and it sits in the message a
   coach reads every morning. **Size: one line, if the owner wants it.**

⚠️ **And the observation under all three, which is yours to use or ignore:** 🔑 ***every one of these was
introduced by somebody rendering a value correctly for the message they were looking at.*** **`Remaining` has
now been wrong twice and neither was reported by the person who reads it** — 📌 *because a number with an
implied unit does not look wrong; it looks like a number.*
