# TASK-315 — a family with FOUR children is forced to add a fifth (`REQ-085 §6.1`)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-09)
🔴 **RELEASE — the owner is MID-ROUND and this is HIS screenshot.** 🚫 No migration, no FE change, **no new copy.**
⏱️ **Small. It goes BEFORE `uat` — I have told @Porter so.**

---

## §1 The defect, from his screen
**`0900000092` → *"ผูกบัญชีผู้ปกครองสำเร็จ ✅ … พบข้อมูลของคุณแล้วค่ะ — มิลล่า, มิลลิม, asda, temp"* →
immediately *"กรุณาระบุชื่อนักเรียน เช่น "ส้ม""*.**
**Owner: *"เหมือนบังคับเลยมั้ย"*.** 🔴 **A family with FOUR children is made to add a fifth, and the only exit is
`ยกเลิก`, which that screen does not advertise in English.**

## §2 ✅ THE RULE — `REQ-085 §6.1`, ratified
> *"หากมีลูกอยู่แล้วไม่ต้องให้เพิ่ม ถ้าเขาจะเพิ่มให้เขากดเอง แต่คนไม่มีลูก บังคับเพิ่มตั้งแต่แรกแบบนี้ถูกแล้ว"*

| the linked family has | behaviour |
|---|---|
| **ZERO children** | 🚫 **UNCHANGED — the mandatory name prompt.** **That is `§6` and he re-confirms it** |
| **ONE OR MORE** | ✅ **NO prompt.** found-your-family line → **the screen-8 invitation** → **the menu** |

🔑 **`§6`'s whole justification is *"a parent account with no child can do nothing"*.** ⇒ **a family that already
has children can do everything, so the rule does not reach them.**
🚫 **Do NOT fix it by adding a skip to the prompt.** 🔑 ***The prompt should not be there. A skip on a prompt that
should not exist is a second wrong thing.***

## §3 🔴 TWO DOORS — and this is your own lesson from an hour ago
**`:1327` — the `AWAIT_CODE` link-success branch — sets `AWAIT_STUDENT_NAME` for every customer.**
🔴 **And `:1291` — the 2FA branch — does the SAME, and it has already fetched `kids`.**
⚠️ **2FA is unreachable today (`line_parent_2fa` off) and exists *"so switching the setting on is a setting change
and not a rebuild"*.** ⇒ **fix only `:1327` and the day that setting is switched on, this defect comes back.**
🔑 ***"Look for TWO WRITERS, not two doors"* — here the two doors do NOT converge, and you are the person who
just told me how to spot that.**
✅ **One decision, reached by both.** 🚫 **Not the same three lines written twice.**

## §4 📌 The copy EXISTS — do not write any
✅ **`add_another_hint`** already holds the customer's screen-8 sentence, both languages:
*"หากต้องการเพิ่มนักเรียนเข้าระบบ / กรุณาพิมพ์ "เพิ่มนักเรียน" ค่ะ / If you would like to add another student, /
please type "Add Student"."*
🔑 **@Porter chose it deliberately — *"the customer's screen-8 sentence reused, not a new one: one phrase, one
meaning, everywhere."*** 🚫 **No new key, no rewording, and nothing invented.**
📌 **And it now says `Add Student`, which TASK-313 made the accepted phrase** — ⇒ **the sentence and the parser
agree, which is the whole point of that batch.**

## §5 What must not change
- 🚫 **The ZERO-child path** — byte-identical, asserted. **That is `§6`/TASK-307 and the owner re-confirmed it.**
- 🚫 `§17c`'s pinned screens (TASK-310) · the found-your-family message from `verifyAndLink` · the rich-menu
  linking · the language seed · `add_student_prompt`'s own text.
- 🚫 TASK-313's guard and `parseAddCommand` · no migration · no FE change · no new i18n key.

## Definition of Done
- [ ] 🔑 **The owner's exact case: a phone with FOUR existing children links and gets NO name prompt** — asserted,
      **and the reply carries the found-family line, the invitation and the menu**
- [ ] 🔑 **ZERO children still gets the mandatory prompt** — asserted. ⚠️ *This is the assertion that keeps `§6`
      alive; without it "no forced prompt" becomes "no prompt"*
- [ ] 🔴 **BOTH doors — `:1327` and the 2FA branch — reach the same decision** — asserted on both, ⚠️ **and
      through ONE decision rather than two copies**
- [ ] **No session step is left set on the ≥1 path** — asserted, *so a returning parent's next word is not read as
      a child's name*
- [ ] **`add_another_hint` reused; no new i18n key** — asserted as an absence
- [ ] 🔑 **Break it and watch** — restore the unconditional prompt and show the four-child case forced again
- [ ] `bun test` all pass, **state the count** · typecheck clean · 🚫 no migration (**35 = 35**)

## Question
🔴 **`§6` shipped this morning and produced a defect on the owner's own phone this afternoon.** **The rule was
right; its BOUNDARY was assumed.**
🔑 **TASK-307 asserted *"a parent with NO children cannot skip"* and *"a parent WITH a child can still skip"* —
both true, both passing, and neither of them is this case:** ***a family with children being forced into the
flow in the first place.***
❓ **What would have caught it?** ⚠️ **I am not asking for a test you can write now.** **I am asking whether the
gap was in the ASSERTIONS or in the REQUIREMENT** — 📌 *because I wrote that requirement, and if the answer is
"the requirement never said what happens to a returning family", that is mine to carry, not yours.*

---

## ✅ RESULT 2026-09-09 — @Jason. **1925 pass / 0 fail**, 155 files · 🚫 **35 `.sql` = 35 journal tags.**
📌 Typecheck: `bunx --package typescript@5.6.3 tsc --noEmit` → **0**. 🚫 No migration, no FE change, **no new key.**

- [x] 🔑 **The owner's exact case: FOUR children link and get NO name prompt** — the found-family line, the
      screen-8 invitation, then the menu
- [x] 🔑 **ZERO children still gets the mandatory prompt** — asserted, *and asserted that it gets NEITHER the
      invitation nor the menu*, so `§6` cannot quietly become "no prompt"
- [x] 🔴 **Both doors reach ONE decision** — `afterParentLink`, and **neither door decides for itself** (asserted
      as an absence on both slices)
- [x] **No session step is left set on the ≥1 path** — `clearSession`, asserted on the branch
- [x] **`add_another_hint` reused; no new i18n key** — asserted as an absence
- [x] 🔑 **Break it and watch** — restored, suite green before this number
- [x] 🚫 **The zero-child path and TASK-307's guard untouched**

### §3 ✅ One decision, and the tail carries its own separator
`afterParentLink(lineUserId, lang, known?)` returns the tail **with its leading separator**: a single newline for
the zero-child case, which keeps `§17c` screen 4 byte-for-byte (TASK-310), and a blank line for the returning
family — **who are not on that screen at all.** ⇒ both doors are now `head + tail` and neither contains
`setStep`, `add_student_prompt` or `kids.length`. 📌 The 2FA door passes the `kids` it had already fetched, so
the decision costs no second query and TASK-047's greet-by-name is untouched.

### 🔻 Two things I got wrong on the way, both caught by the discipline rather than by luck
**1. My first §3 assertion counted `setStep(…, "AWAIT_STUDENT_NAME", …)` and expected 3. There are 4** — the
inline add's prompt, TASK-313's reserved-word refusal and the `register` postback all set it legitimately.
⇒ **a count that includes them measures the wrong thing.** ✅ Replaced with the property I actually meant:
**neither door contains the decision**, asserted as an absence on both slices. **The wrong version is named in
the test so the next reader does not re-add it.**
**2. 🔴 My mutation script's RESTORE threw, and the `bun test` after it never ran** — the `1925 pass` I saw was
**stale output from before the mutation**, and the working tree still had `if (true)` in it. ⚠️ **I only caught
it because I read the file instead of trusting the number.** ✅ Restored, verified by reading the function back,
and the green above is from a run AFTER that. 📌 **The lesson is mine to carry: a restore that fails silently
turns "break it and watch" into "break it and ship it".** From here the restore is verified by READING the line,
not by the exit code of the script that wrote it.

---

## ❓ YOUR QUESTION — honestly: **the gap was in the REQUIREMENT, not in the assertions.** But it is not yours alone.

**TASK-307's two assertions were the right two for what `§6` said.** *"No children cannot skip"* and *"with a
child can still skip"* are both about **a parent already inside the add-child flow**. This defect is about
**whether a family should be in that flow at all** — 🔑 **a question the requirement never asked, so no
assertion could have been written against it.** ⇒ **it is not a missing test; it is a missing sentence.**

📌 **And I would name the SHAPE rather than the sentence, because the sentence is easy to write afterwards:**
**`§6` was specified for the population it was ABOUT — parents with no children — and silent about the
population it would also REACH.** 🔑 *A rule that names who it protects, and not who it touches, is a rule with
an assumed boundary.* **The mandatory prompt reached every linked customer; only one of the two groups was ever
considered.**

⚠️ **And I will not let this sit entirely on you.** I built `§6` and I read `verifyAndLink`'s customer branch —
**the line I changed today is the line I was standing on** — and I did not ask *"who else lands here?"*. **The
requirement was silent; the code was in front of me.** 📌 The cheap habit, and it is the same one that has paid
out four times this week: **when a rule is written for a population, ask what the OTHER population does at the
same call site.** ⇒ *"look for two writers"* found the sibling DOOR; this one is its twin — **look for the
sibling POPULATION.**
🔑 **Neither is a test you could have asked for. Both are a question asked at the right moment**, which is why I
think the honest answer to *"assertions or requirement"* is **requirement — and the fix is a reading habit, not
a coverage target.**

**BALL: @Sober — TASK-315 ready for review. ⛔ Nothing else is on me.**
