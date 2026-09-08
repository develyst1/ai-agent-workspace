**Status:** DONE — code (Sober 09-07, reviewed) — tsc 0 / 1683 pass 0 fail / notifications + ICS byte-identical / nothing applied. THE CONVERSATION IS BILINGUAL END TO END. 🔴 tsched_empty is shared with the daily-reminder outbox — SPEC-077 §3 would have broken §5; his both() redesign is what kept the hold.

# TASK-276 — the remaining five conversational flows go bilingual

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-07)
**Spec:** `SPEC-077` · **Source:** the five flows **you** named as not landing in TASK-275.
📌 **No clock.** 🚫 **Do not start it before TASK-273** — nothing is blocked by either, and 273 is the one that
stops a defect being born.
🚫 No migration, no database, no FE change, **no notification and no ICS change** (`SPEC-077` §5, still held).

---

## §1 The five, in your words — each a WHOLE flow
| flow | the hard part you already named |
|---|---|
| `เมนู` / the command list | the same `both()` treatment at ~10 sites |
| check-in · leave · QR | composed bodies **plus pickers**, whose labels stay single-language |
| `นักเรียน` (children list) | `children_title` + a count — 🔴 **the interleaving case in its sharpest form** |
| the teacher's `ตาราง` | `renderSchedule` composes per row; **built twice, whole** |
| `handover_to_admin` + the mute replies | reachable from every flow ⇒ changing them alone half-translates all of them |

## §2 🔴 The one that is a real design question, not a mechanical change
**The teacher's `ตาราง` is a LIST, and `both()` on a list has two shapes:**
**(a)** the whole list twice — Thai block, then English block · **(b)** each row twice — TH/EN per class.
⇒ **(a).** A coach scanning eight classes needs **one scannable column**, and (b) doubles the row count and
destroys the alignment the layout is for. 📌 **Same reasoning as the owner's original length objection** — *"สอง
ภาษาจะยาวเกินไป"* — **which survives here even though it lost for prompts.** ⚠️ **If (a) makes the message
exceed LINE's 5000-character reply cap for a busy coach, STOP and tell me** — that is a real limit and the
answer would be a decision, not a workaround.
🔴 **And `line-schedule.ts:68`'s `subjectName · status`:** the status label must stay **single-language inside a
row** even under (a), or the one-line-per-class layout breaks. **The row is Thai in the Thai block and English in
the English block** — which `both()` gives you for free, and a per-key `tb()` would not.

## §3 The children list — the silent one
`children_title` + `(3/5)` **appended after** ⇒ **the count lands on the English line only.** ✅ **Compose the
whole thing inside `both()`** so the count is built once per language. 📌 **Nothing about the Thai output looks
wrong**, which is why this one needs an assertion rather than an eye.

## §4 What must not change
- 🚫 **The six notifications and the ICS feed** — `SPEC-077` §5, held with @Porter.
- 🚫 **Button, quick-reply and picker labels** — `t(key, lang)`, under 20 characters. **The cap assertion from
  TASK-275 must still pass, and must GROW to cover any label these flows add.**
- 🚫 The postback `data` keys. 🚫 `line_lang`, the `ภาษา` cell, the menu images.
- 🚫 No migration, no database, no FE change.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count**
- [ ] **All five flows bilingual**, each **whole** — asserted per flow, by enumerating its bodies
- [ ] 🔑 **The children-list count appears in BOTH languages** — the silent case, asserted explicitly
- [ ] The teacher's `ตาราง` is **(a)**, block-per-language, **and a row's status label is single-language inside
      its block**
- [ ] **No label — including any new picker label — exceeds 20 characters in either language**
- [ ] 🚫 The six notifications and the ICS feed are **byte-identical** — asserted again, not inherited
- [ ] 🚫 No migration, no database, no FE change

## Question
**Is there a body that a NON-conversational caller also sends?** TASK-275 split bodies from labels; **the split
that could still bite is a string used by both the bot and an outbox row.** **Name any you find — do not change
them.** 📌 *That is the same shape as `ob_l_note` serving `booking_confirmed`, which is why that message is
byte-frozen and why it took a separate key to fix.*

---

# ✅ Jason (BE) — DONE, code. 2026-09-07

`smart-scheduler-back` · **tsc --noEmit → 0** · **bun test → 1683 pass / 0 fail, 132 files**
🚫 No migration · no database · no FE change · **the six notifications and the ICS feed byte-identical**,
asserted again rather than inherited · postback keys, `line_lang`, the `ภาษา` cell and the menu images untouched.
New: `src/lib/bilingual-flows.test.ts` (14 tests). **The conversation is now bilingual end to end.**

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1683 / 0**, 132 files
- [x] **All five flows**, each asserted by **enumerating its bodies** — a named list per flow, not a spot-check
- [x] 🔑 **The children count appears on BOTH lines** — asserted **per line**, plus the broken shape written
      out and asserted against
- [x] The teacher's `ตาราง` is **(a)**, and a row's status label is **single-language inside its block**
- [x] **No label exceeds 20 characters**, and the list is asserted to cover every `label: t("…")` in the service
- [x] 🚫 Notifications and ICS byte-identical — asserted here, not inherited
- [x] 🚫 No migration, no database, no FE change

## §2 — the size question, answered with a number
**It fits.** Measured on the real composer: 20 rows (its own `cap`), long Thai names, a long programme and a
note on **every** row ⇒ **3,848 characters doubled**, against LINE's 5,000.
📌 **And the bound is the CAP, not the data** — 40 rows measures the same 3,848, because `renderSchedule` caps at
20 and appends its "and N more" line. ⇒ **no decision needed**, and the reason it is safe is a mechanism rather
than an assumption about how busy a coach gets. Asserted with a 40-row fixture so a raised cap fails here.

🔑 **And `both()` is what keeps a ROW single-language.** `renderSchedule` is called once per language, so
`status_*` inside a row renders Thai in the Thai block and English in the English one — **the one-line-per-class
layout survives for free.** A bilingual key would have put the English status inside the Thai row.

## §3 — the silent one, asserted per line
`children_title` + `(3/5)`. **Asserted that the count is on BOTH lines**, not that the string "contains (3/5)" —
that weaker assertion passes on the broken version. 📌 And the broken shape is written into the test and asserted
against, with the sentence that makes it worth keeping: **the Thai reader never sees the count and nothing about
the Thai output looks wrong.**
✅ Mutation-tested: reverting that one line to `${tb("children_title")} (…)` fails the children-list test.

## Answer — **one body is shared with a non-conversational caller: `tsched_empty`**
`line-schedule.ts` (the teacher's `ตาราง`, conversational) **and** `line-today-schedule.ts` (the
`daily_reminder` outbox notification) both call `t("tsched_empty", lang)`. **It is the only one** — I compared
every key used by the bot-side modules against every key used by the outbox-side ones.

🔑 **And it is safe here, for a reason worth stating rather than luck:** the composition happens at the
**caller**, not at the key. `both((l) => renderSchedule(rows, l, range))` makes the *teacher's reply* bilingual;
`line-today-schedule.ts` still calls `t("tsched_empty", lang)` on its own and is untouched.
🔴 **Under a per-key `tb("tsched_empty")` the notification would have gone bilingual too — silently, in a message
`SPEC-077` §5 explicitly holds.** ⇒ **the shape chosen in TASK-275 for a different reason (suffix fragments) is
what protects the held boundary here.** 📌 Same lesson as `ob_l_note` serving `booking_confirmed`, arrived at
from the other direction: **there, two callers forced a second key; here, one function let one key serve both.**

🚫 **Not changed**, as instructed. ⚠️ **But it is now load-bearing**: `tsched_empty` is a key whose two callers
must keep choosing their own language. If the notifications are ever unheld, that key needs looking at first.

## Review — Sober, 2026-09-07: ✅ **PASS. TASK-276 is DONE. The conversation is bilingual end to end.** 🔴 **And your `tsched_empty` finding shows that MY OWN SPEC contradicted itself — §3 would have broken §5.**

**Reproduced:** `bunx tsc --noEmit` → **0** · `bun test` → **1683 pass / 0 fail**, 132 files · nothing applied ·
`tsched_empty` has **exactly two callers** (`line-schedule.ts:42` conversational, `line-today-schedule.ts:64` the
outbox notification) · `renderSchedule(rows, lang, range, cap = 20)` with `.slice(0, cap)` and the *"and N more"*
line — **so the bound really is the cap.**

### 🔴 The finding: my `SPEC-077` §3 and §5 contradicted each other
**§3 specified `tb(key)` → `TH\nEN` per key. §5 held the six notifications single-language.**
⇒ **`tsched_empty` is called by BOTH sides.** **Under a per-key `tb()`, the daily reminder would have gone
bilingual — silently, in a message the same document explicitly holds.**
🔑 **You replaced `tb()` with `both()` on TASK-275 for an unrelated reason — the four `\n`-prefixed fragments —
and that is what kept the hold intact.** ⇒ **the composition happens at the CALLER, not at the key**, so one key
can serve two boundaries and each caller keeps choosing its own language.
📌 **I wrote both sections of that spec, two hours apart, and did not see it.** **It was caught by a redesign
made for a different reason** — which is luck, and the reason it is worth writing down rather than filing as a
success. ✅ **And your closing line is the one that matters:** *"`tsched_empty` is a key whose two callers must
keep choosing their own language. If the notifications are ever unheld, that key needs looking at first."*
**Recorded in `SYSTEM-FACTS`.**
📌 **Same lesson as `ob_l_note` serving `booking_confirmed`, from the other direction — there two callers forced
a second key; here one function let one key serve both.** **Your sentence, and it is the better statement of it.**

### 🔑 §2 — you answered a size question with a NUMBER and then made the number irrelevant
**3,848 characters doubled, against 5,000** — measured on the real composer with 20 rows, long Thai names, a long
programme and a note on every row.
🔑 **And then the part that makes it a control rather than a measurement:** *"the bound is the CAP, not the data —
40 rows measures the same 3,848."* ⇒ **the reason it is safe is a mechanism, not an assumption about how busy a
coach gets.** ✅ **Asserted with a 40-row fixture so a RAISED CAP fails here** — the one change that could break
it now cannot land silently. **That is better than the answer I asked for.**
✅ And `both()` keeping a row single-language **for free** is the same property paying twice.

### §3 — asserted per LINE, not per string
> *"Asserted that the count is on BOTH lines, not that the string contains `(3/5)` — that weaker assertion passes
> on the broken version."*

**Exactly the trap.** ✅ **And writing the broken shape INTO the test** with the sentence *"the Thai reader never
sees the count and nothing about the Thai output looks wrong"* is what makes it survive someone tidying it later.

### Where this leaves the work
✅ **The conversation is bilingual end to end** — five flows, each whole. ⏸️ **The notification half stays held**
on @Porter's three answers, and it is now clear that the hold was closer to being lost than either of us knew.
📌 **TASK-268 is the only thing left in your queue.**
