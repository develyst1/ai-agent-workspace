# TASK-318 — the LEAVE NOTICE, the customer's own spec (`REQ-085 §16d`/`§16e`) + two copy items

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-10)
📌 **Batch items 2, 5 and 7b.** ⏱️ **No clock — `uat` waits for the batch.** 🚫 No migration, no FE change.
🔑 **You just fixed this defect on the PARENT's side. This is the TEACHER's side of it.**

---

## §1 ✅ The customer's spec — `§16d`, VERBATIM
```
LEAVE NOTICE / แจ้งลา ‼️
Student : มะขิด · Program : Freeskate 6 HR
Date : 10-09-2026 · Time : 12:00-13:00 · Coach : Ek
```
🎯 **They reached `§15` independently, and their reason is word for word @Porter's:** *"ครูจะไม่รู้ว่าแจ้งลา พฤ
ไหน"* ⇒ **three independent readings — his, the owner's *"คนละคาบ"*, and theirs — one conclusion.**

**Two things their copy DECIDES, overriding @Porter:**
1. 🔴 **`Date` is the DATE ALONE, `DD-MM-YYYY`.** 🔻 **His `Tuesday 22/Sep/26` is WITHDRAWN.**
   📌 **It is the SAME format they specified for date of birth in `REQ-079 §17c`** ⇒ **they are consistent with
   themselves; we match them rather than invent a third style.**
2. ✅ **The trailing blank line applies here too** — 🔗 **but that is `§16.3` and it is fixed at the BUILDER, in a
   separate task.** 🚫 **Do not fix it here.**

## §2 🔴 THE HEADER — and the sentence that keeps this fix alive
✅ **`LEAVE NOTICE / แจ้งลา ‼️`, bilingual** (`§16e`). 🔻 **This REVERSES the owner's own `§9` English-header
ruling** — **given before the customer had asked for anything, in answer to a question @Porter framed.**
🚫 **Superseded, not wrong.**
🔑 **WRITE THIS INTO THE CODE, next to the header — @Porter's words:**
> ***`§4` governs values the system GENERATES. It never governed what a message is CALLED.***

📌 **`§4` — *"eng ล้วน ไม่ควรไทยเลยแม้แต่ติด"* — was always about OUR OWN words** (`Date : อังคาร` → `Tuesday`,
`ไม่มี` → `(-)`). ⚠️ **Without that sentence beside it, someone "fixes" this header back to English next month by
citing `§4`** — 🔑 **which is EXACTLY the shape that let `Date : อังคาร` ship after `REQ-079 §18` had already
ruled labels English.** ***A ruling that does not carry its own boundary gets re-applied to the wrong thing.***
✅ **And the audience is why it holds: this message goes to COACHES and ADMINS, never a parent.** ⇒ **the one
notification with a Thai header is the one no parent ever sees.**

## §3 🔑 This is the sibling of TASK-316, and the sibling matters
**You just made the picker distinguish two sessions of one weekly course.** **This is the same defect on the
message the TEACHER receives** — 📌 *the owner marked two sessions absent and got two byte-identical notices.*
⚠️ **So the assertion that matters is not "the date renders". It is:** 🔴 **two sessions of the SAME weekly
course produce DIFFERENT messages.** **Write that one first.**
🚫 **And do NOT reuse the picker's body format here.** **`§16d` is the customer's own layout and it is the
spec** — **their `Date : 10-09-2026` is a date alone, not `อังคาร 22/09`.** 🔑 **Two surfaces, two audiences, two
formats, both correct.**

## §4 Batch item 5 — `§16.4`: remove `Sessions :` from the course-wide notice
**Their reasoning: the program name already carries the hours** (*"Freeskate 6 HR"*).
⚠️ **`§7.1` is byte-pinned (TASK-284).** ⇒ **the pin CHANGES here, deliberately** — 🔑 **rewrite it to the new
text; do not delete it.** 📌 *An assertion that changes because a requirement changed is correct; one deleted
because it failed is how this class ships.*
🚫 **Only `Sessions :` goes.** **`Remaining` and `*Expiry date` are `§9`'s conditional pair and stay** —
⚠️ **they are what tells a coach a COURSE row from a one-off, and the owner's *"ไม่งั้นมันจะแยกยังไง"* is their
acceptance criterion.**

## §5 Batch item 7b — the ✅ on the THAI success lines
**`§17c` screens 4 and 8 carry a green tick after the success line; ours has it in English and not in Thai.**
✅ **Add it to the Thai halves so both languages match their document.**
⚠️ **Those screens are byte-pinned (TASK-310)** ⇒ **update the pins with the change, and say you did.**

## §6 What must not change
- 🚫 `§14`'s picker and its label (TASK-316) · `LEAVE_NOTICE_TOO_LATE` · WHO receives the leave notice
  (teacher + admin, never the parent — asserted in TASK-305 and it stays).
- 🚫 `§7.2`/`§7.3` · the trailing blank line *(that is `§16.3`, another task)* · `Remaining` / `*Expiry date`.
- 🚫 No migration · no FE change · no new i18n key without telling me.

## Definition of Done
- [ ] `bun test` all pass, **state the count** · typecheck clean, **say which command** · 🚫 no migration (**35 = 35**)
- [ ] 🔴 **TWO sessions of the SAME weekly course produce DIFFERENT leave notices** — asserted, **and write it
      FIRST**. ⚠️ *That is the defect; the date is only how it is fixed*
- [ ] 🔑 **The message is pinned BYTE-FOR-BYTE against `§16d`** — the customer's layout, `Date : DD-MM-YYYY`
- [ ] ✅ **The header is `LEAVE NOTICE / แจ้งลา ‼️`**, and 🔴 **`§4`'s boundary is written in the code beside it**
- [ ] **`Sessions :` is gone from `§7.1`, and its byte pin is REWRITTEN** — 🚫 **`Remaining` / `*Expiry date`
      still present on a course row and ABSENT on a one-off**, asserted
- [ ] **The ✅ is on the THAI success lines of screens 4 and 8**, pins updated
- [ ] 🚫 **The parent still does not receive the leave notice** — asserted as an absence, unchanged
- [ ] 🔑 **Break it and watch** — ⚠️ **restore by READING the line** *(yours, and it caught a real `sed` failure
      yesterday)*

## Question
🔴 **Three people reached `§15`'s conclusion independently — @Porter, the owner, and the customer — and the
customer's version overrode both of ours on the FORMAT.**
🔑 **We were right about the DEFECT and wrong about the FIX, twice over** — *his `Tuesday 22/Sep/26`, my
ratification of it*.
⇒ ❓ **When the customer has already specified something, what did we gain by having designed it first?**
📌 *I am not being rhetorical: the analysis found the defect before they reported it, which is worth a lot. The
WORDING we produced was thrown away, which cost little.*
⚠️ **Say whether that split held on the other `§7` formats too** — 🔑 **because if our analysis is reliably right
about defects and reliably discarded on wording, that is an argument for changing WHAT WE WRITE DOWN, not how
hard we think.**

---

## ✅ RESULT 2026-09-10 — @Jason. **1964 pass / 0 fail**, 157 files · 🚫 **35 `.sql` = 35 journal tags.**
📌 Typecheck: `bunx --package typescript@5.6.3 tsc --noEmit` → **0**. 🚫 No migration, no FE change, no new key.
New: `src/lib/leave-notice-req085-16d.test.ts` (18 tests).

- [x] 🔴 **TWO sessions of the SAME weekly course produce DIFFERENT leave notices** — written FIRST, and the
      old collision is asserted beside it so it cannot come back
- [x] 🔑 **Pinned BYTE-FOR-BYTE against `§16d`**, `Date : DD-MM-YYYY`
- [x] ✅ **`LEAVE NOTICE / แจ้งลา ‼️`**, and 🔴 **`§4`'s boundary is written in the code beside it** — asserted
- [x] **`Sessions :` gone from `§7.1`; every byte pin REWRITTEN, none deleted** — five of them, in four files
- [x] **The ✅ on the THAI success lines of screens 4 and 8**, pins updated
- [x] 🚫 **The parent still does not receive the leave notice** — asserted as an absence, unchanged
- [x] 🔑 **Break it and watch** — the date reverted to the weekday → **4 fail, the gating one first**; restored,
      **verified by READING both lines** (`:107` is `§7.3`, still the weekday; `:159` is the notice)

### 🔻 TWO CORRECTIONS, and the first one is about the task page
**1. `§1`'s block in the TASK is not `§16d`'s block.** The task shows the fields `·`-joined on two lines:
*`Student : มะขิด · Program : Freeskate 6 HR`*. **`REQ-085 §16d`'s verbatim transcript is ONE FIELD PER LINE**
— which is what the renderer already does and what TASK-305 pinned. ⚠️ **I wrote my byte pin from the task page
and it failed against the requirement.** ✅ Fixed to `§16d`. 📌 **No code change came of it** — the layout was
already right — but had I "fixed" the renderer to match the task, I would have rewritten the field block for
**every** template on a compression artefact.
**2. Their line reads `Time :12:00-13:00`** — no space. **Not reproduced.** Every other field in every template
is ` : `, and a typo copied faithfully is still a typo. **Same call as `§17c`'s stray quotation marks, reported
the same way** — say if you want it byte-exact and it is one character.

### §4 ✅ `Sessions :` — what made the deletion SAFE is worth more than the deletion
TASK-269 §1 had pointed `Sessions` at **the same field `programLabel` reads**; before that it printed
`payload.confirmed` and a `Surfskate 10 HR` with two declared leaves rendered `Sessions : 8` beside it.
🔑 **Because the two had been made to agree, removing one loses nothing. Had they still disagreed, deleting one
would have HIDDEN the defect instead of closing it.** That sentence is now in the code and in the rewritten pin.
✅ `Remaining` / `*Expiry date` still present on a course row and **absent on a one-off** — asserted both ways.

### §5 📌 One thing to know about the ✅
The screens are LANGUAGE-INVARIANT (TASK-310), so `verify_parent_ok_new` and `added_done` are one block each —
**the Thai tick and the English tick are in the same string**, and that property is re-asserted beside the new
pins. 🚫 Nothing about `both()` changed.

### 📌 And one shared helper, because the customer specified the format twice
`DD-MM-YYYY` is theirs for the LEAVE NOTICE (`§16d`) **and** for the date of birth (`§17c`). ⇒ the
transformation moved to **`time.ddmmyyyy`**, and `formatBirthDateForDisplay` now delegates to it.
🔑 **One transformation, two contracts:** everything TASK-280 wrote about the birthdate echo — not the parser's
inverse, one caller, asserted by position — is about the BIRTHDATE and none of it is true of a leave notice, so
that function keeps its name, its comment and its pins. **Its body is one line.**

---

## ❓ THE QUESTION — the split HELD, and it splits cleanly along one line: BEHAVIOUR survives, APPEARANCE does not.

**I went through every place we designed ahead of the customer. The pattern is not "we are bad at wording" —
it is sharper than that:**

| what we wrote down | fate |
|---|---|
| `Date : Tuesday 22/Sep/26` (`§15`) | 🔻 **discarded** — `§16d` |
| `LEAVE NOTICE` English header (`§9`) | 🔻 **discarded** — `§16e` |
| *"the `ชื่อ / Name:` pairs are document furniture"* (TASK-278 §4-5) | 🔻 **discarded** — `§17c` |
| *"do not instruct `Next`, the bot rejects it"* (TASK-278 §3) | 🔻 **discarded** — `§17c` |
| `add child`, our own English phrase | 🔻 **discarded** — @Porter, TASK-313 |
| **the exit prints ONCE, `withExit` already appends it** (§4.1) | ✅ **survived §17c intact** |
| **`{list}`/`{phone}` stay — TASK-047's privacy decision is not a wording** (§4.2) | ✅ **survived** |
| **`{max}` is a VARIABLE, never a literal 5** (§4.3) | ✅ **survived** *(the sentence went; the rule stands)* |
| **`(-)` always prints / `Remark` vanishes — two opposite rules** (§8.1) | ✅ **survived every pass** |
| **a field that vanishes when empty is indistinguishable from one never sent** | ✅ **survived, and is now theirs too** |

🔑 **Everything we wrote that was a rule about BEHAVIOUR survived. Everything that was a rule about APPEARANCE
was overridden the moment they spoke.** ⇒ **the split is not "defects vs wording" — it is *what the message must
DO* vs *what the message must LOOK LIKE*.** 📌 That is a cleaner line than the one in your question, and it
predicts: **anything we decide about layout, order, format or phrasing is a placeholder whether we label it or
not.**

### ✅ So YES, this is an argument for changing what we write down — and the mechanism already exists in the repo
**Write the ACCEPTANCE CRITERION; mark the string as a PLACEHOLDER.**
🔑 **`§15`'s durable content was one sentence — *"the date must distinguish two sessions of one weekly course"*
— and it survived ALL THREE readings, including the customer's.** ⚠️ **`Tuesday 22/Sep/26` was the by-product,
and it is the only part anyone had to unpick.** ⇒ had `§15` been written as *criterion + a string marked
provisional*, **nothing would have been lost and one round of rework would not have happened.**
📌 **We already do this, once:** `line-i18n.ts`'s `PENDING_RESCHEDULE` carries *"PLACEHOLDER, @Porter is asking
the customer. This is NOT a ratified string; do not treat it as agreed."* **That is exactly the convention. It
has been applied to one key out of every string we have invented.**

### 🚫 And what I would NOT change
**Do not stop designing the wording.** 🔑 **You cannot find the defect without imagining the fix** — `§15`
exists because @Porter wrote a concrete replacement line and saw that the old one could not do its job. **The
string is the by-product of the thinking, not the waste.** ⚠️ The cost asymmetry is the whole answer: the
analysis bought a WEEK of lead time on three defects; the wording cost one round each. 📌 **Keep producing it;
just stop pinning tests to it until they ratify it** — *that* is the part that costs, because a byte pin on an
unratified string is a promise we made to ourselves.

**BALL: @Sober — TASK-318 ready for review. ⛔ Nothing else is on me. TASK-323 next when you hand it over.**
