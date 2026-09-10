# TASK-310 — the registration copy is the CUSTOMER'S words (`REQ-085 §5` via `REQ-079 §17c`)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-09)
🔴 **RELEASE ITEM — the owner wants `sid`, test and `uat` TODAY.** 🚫 No migration, no FE change.
🔑 **The words are the SPEC.** *"ลูกค้าส่งมาให้ทำตามเลย"* — **`REQ-079 §17c` is verbatim from the customer and
supersedes `§17b`.** 🚫 **@Porter's `REQ-085 §5` proposal and the owner's `ครูเอง` are BOTH WITHDRAWN.**

---

## §1 ⚠️ READ THIS FIRST — it contradicts what you did an hour ago, and that is my fault to flag not yours to find
**`§17c`'s copy shows THAI AND ENGLISH IN ONE BLOCK on every screen.**
```
กรุณาระบุชื่อนักเรียน เช่น "ส้ม"
Please enter the student's name, e.g. "Emily".
```
🔴 **`add_student_name_prompt` is screen 4. It is currently `t(…, lang)` — single-language — because I ruled it so
in TASK-307 §5.** ⇒ **`§17c` supersedes that ruling for the registration screens.**
🔑 **And the two rulings are not in conflict once you see WHY:** **`both()` is for a reader whose language is not
yet known — and during REGISTRATION it is not.** ⇒ **that is precisely when both languages belong in one
message.** 📌 *My TASK-307 correction was right about the CONVENTION and wrong to apply it to a screen the
customer has since specified as bilingual.*
✅ **So: the `§17c` screens are BILINGUAL, all five `add_student_name_prompt` call sites included** — 🔑 **and
consistently, which is the property TASK-307 was actually protecting.**

## §2 The scope — `§17c`'s EIGHT screens, bodies only
✅ **`REQ-079 §17c` holds the text. Use it verbatim; do not paraphrase, do not "improve".**
🚫 **NONE of the eight numbered headings is sent** — `§17f`: *"they are a table of contents, not copy."*
🔴 **And screen 2's heading especially — `เลือกบทบาท / Select Your Role`** — **would tell a parent both that roles
exist AND that they were not offered a choice.** ⇒ **it is the one heading whose text defeats the requirement the
screen exists to satisfy.**

| ruling | |
|---|---|
| **entry keyword** | **`สมัคร` / `register`** (screen 1) — **not `Next`** |
| **`Next`** | **screen 2 = PARENT** |
| **roles** | **`ครู` · `แอดมิน`** — the customer's words. 🚫 **`ผู้บริหาร / CEO` is SKIPPED (`§17e`): the word stays in the REQ and becomes NO code path** |
| **the role words being guessable** | ⚠️ **the owner accepted this KNOWINGLY** — `§5` is satisfied by not ADVERTISING the roles, not by making them unguessable. 🚫 **Nobody re-opens it as a defect** |
| **address** | 🚫 **NO CHANGE — free text.** The prompt names District/Sub-district/Province as GUIDANCE. 🔑 *"A prompt that lists parts is not a schema"* |
| **date of birth** | **`DD-MM-YYYY`, Gregorian** (*"ปี ค.ศ."*) — matches the owner's earlier ruling |
| **screen 4's phone** | **shows the number the person just typed** (`§17e`) |

## §3 🔴 What `§5` is actually FOR — and the one line that must not survive
**Today the entry message asks *"Who are you? … type: parent · teacher · admin"*.** ⇒ **it hands every parent
the door AND the key.**
✅ **After this: ONE path is offered — type `Next`.** 🚫 **No role list, no role buttons, no role words shown to a
parent anywhere.**
🔑 **A teacher or admin types their word without being told to. That is the whole mechanism, and it is made of
COPY rather than code.**
⚠️ **So the assertion that matters is an ABSENCE:** **the words `ครู`, `แอดมิน` and `CEO` appear NOWHERE in what a
registering parent is sent.**

## §4 What must not change
- 🚫 **`LEAVE_NOTICE_TOO_LATE`** — `§12.2`: it STANDS. **Removing a refusal there is a REGRESSION, not this
  batch.** *(Named here because it is the one thing today's `§12` work must not have touched.)*
- 🚫 The address FIELD and its storage · the registration STEPS and the session state machine · `SKIP_WORDS` ·
  TASK-307's no-skip branch — **asserted still working.**
- 🚫 `§7.1`–`§7.4`'s pinned messages · the outbox · no migration · no FE change.

## Definition of Done
- [ ] `bun test` all pass, **state the count** · typecheck clean, **say which command** · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **Each of the eight screens pinned BYTE-FOR-BYTE against `§17c`** — the customer's words are the spec
- [ ] 🚫 **No heading is sent** — asserted, **and screen 2's especially**
- [ ] 🔑 **`ครู` / `แอดมิน` / `CEO` appear NOWHERE in a registering parent's messages** — asserted **as an
      absence.** ⚠️ *This is `§5`. Everything else on this page is the copy that carries it*
- [ ] **The entry keyword is `สมัคร` / `register`; `Next` advances a PARENT** — asserted
- [ ] **`CEO` is not a code path** — asserted
- [ ] **The registration screens are BILINGUAL**, and 🔑 **all five `add_student_name_prompt` call sites agree** —
      asserted, ⚠️ *the property TASK-307 was protecting, now satisfied in the other direction*
- [ ] **TASK-307's no-skip branch still works** — asserted, **and it re-asks with the NEW copy**
- [ ] 🔑 **Break it and watch** — restored, suite green before the number
- [ ] 🚫 **The address flow untouched** — asserted

## Question
📌 **`§17c` gave us eight screens of finished copy and a WEEK of guessing ended in one message.**
🔑 **How many of these eight strings already existed and merely differed?** ⇒ **name the ones where our wording was
already right, and the ones where it was wrong in a way a parent would have noticed.**
⚠️ **Not to justify anything — because `REQ-086` is coming and its shipped defaults are exactly this kind of
text.** **If most of them merely differed in tone, the editor matters less than we think. If several were WRONG,
it matters more.**

---

## ✅ RESULT 2026-09-09 — @Jason. **1877 pass / 0 fail**, 150 files · 🚫 **35 `.sql` = 35 journal tags.**
📌 Typecheck: `bunx --package typescript@5.6.3 tsc --noEmit` → **0**. 🚫 No migration, no FE change.
⏱️ **It landed today** — I had nothing to tell @Porter that he could act on.

- [x] 🔑 **The eight screens pinned BYTE-FOR-BYTE against `§17c`** — new `src/lib/registration-copy-req079.test.ts`
- [x] 🚫 **No heading is sent** — asserted, and **screen 2's especially**
- [x] 🔴 **`ครู` / `แอดมิน` / `CEO` appear NOWHERE in a registering parent's messages** — asserted as an ABSENCE
- [x] **Entry keyword `สมัคร` / `register`; `Next` advances a PARENT** · **`CEO` is not a code path**
- [x] 🔑 **Bilingual, and all five `add_student_name_prompt` sites agree** — asserted on the EXPRESSION
- [x] **TASK-307's no-skip branch still works, and re-asks with the NEW copy** — both halves
- [x] 🔑 **Break it and watch** — two mutations, both restored, suite green before this number
- [x] 🚫 **The address flow untouched** · **`LEAVE_NOTICE_TOO_LATE` untouched**

### 🔑 §1 — the mechanism, and the one place your instruction needed a different shape than `both()`
You ruled these screens BILINGUAL and that is right. ⚠️ **But `both()` cannot produce them.** It stacks a whole
Thai body above a whole English one; **`§17c` alternates LINE BY LINE** — a Thai sentence, its English
sentence, and on screen 4 a `เบอร์โทรศัพท์ / Phone:` line in the middle of the pair. ⇒ **there is no pair of
`TH`/`EN` values `both()` could join to make their screen.**
✅ **So the STRING is bilingual and the call site keeps `t(key, lang)`** — which is the property TASK-307 was
protecting, satisfied in the other direction and more strongly: **every reader gets the identical screen.**
🔑 **And the guard is in the JOINER, not in a list of keys:** `both()` now returns a body once when both
languages render the same text. ⚠️ It had to go there — `` tb(`code_${role}`) `` renders a §17c screen for a
parent and one of OURS for a teacher **from one expression**, so no call site could have carried the rule.
📌 **A doubled screen passes every string pin**, so it is asserted on the ASSEMBLED screen 4 as well.

### 🔻 §3 — the buttons are gone, and that reverses half of TASK-251
**A role picker is a role list you cannot look away from.** No arrangement of buttons offers one choice and
hides two, so `rolePicker` is **deleted**, not edited — with a gravestone, because a deleted builder with no
note is one somebody re-adds. ✅ **What TASK-251 was actually about is untouched:** no digit is asked for or
accepted anywhere, a typed word still reaches ONE transition, and the postback namespace is still ours.
⚠️ **The `action=role` branch OUTLIVES the picker on purpose** — a quick reply already sitting in a parent's
chat when the deploy lands is still tappable, and answering it for one more conversation costs six lines.
🚫 `ครู` / `แอดมิน` stay ACCEPTED and are never advertised — `§17e-2`, the owner's knowing trade.

---

## 🔴 THE THREE THINGS I CHANGED THAT THEIR COPY DID NOT ASK FOR — say if any is wrong

**1. ⚠️ `ข้าม` is no longer ADVERTISED on screens 5 and 6.** Their sentences have no escape and `§2` says use
them verbatim. 🔑 **The behaviour is untouched — the parser still accepts `ข้าม` / `skip`** — and the
REJECTION (`add_birthdate_bad`, not a §17c screen) still names it AND still carries the example `02-12-2024`.
⇒ **a parent who cannot answer is refused once and told both.** 📌 That is the only thing that makes this a
cost rather than a trap, and it is asserted as a pair so nobody removes half of it.
**2. 🚫 Their screen-6 English is wrapped in a `"` … `"` pair in the document. Not reproduced.** A quotation
mark opening one line and closing another reads as a typo on a phone, and by `§17f`'s own reasoning it is
document punctuation rather than copy. **It is the only byte of theirs I changed.**
**3. 🔻 `welcome` lost OUR greeting and OUR command hint** — *"สวัสดีค่ะ ยินดีต้อนรับสู่ Smart Scheduler"* and
*"หลังผูกแล้ว: เพิ่มนักเรียน · เช็คอิน · ลา · qr"*. §17c screen 1 is two lines and has neither. 📌 The hint was
only ever shown to an UNLINKED chat, which cannot use any command it listed.

**And one I kept:** `menu_body` still follows screen 8. Their screen ends at *"type เพิ่มนักเรียน"*; dropping our
menu would take the command list away at the one moment a parent is finally linked. **Say the word and it goes.**

---

## 📌 THE QUESTION — how many of the eight already existed and merely differed?

**Five of the eight English sentences were ALREADY byte-correct**, and the reason is not that we wrote well:
**`§17b` was a transcript of the same document's English column**, so wherever their English did not move,
neither did ours. ⇒ *"our wording was right wherever we COPIED it"* — which answers the tone half of your
question and tells you almost nothing about `REQ-086`.

**🔴 Four were wrong in a way a parent WOULD have noticed. None of them is tone:**
| screen | what a parent met | why |
|---|---|---|
| **2 · role** | *"คุณเป็นใครคะ? ผู้ปกครอง · ครู · แอดมิน"* | 🔴 **the door AND the key** — `REQ-085 §5`'s entire subject |
| **6 · address** | *"จังหวัดที่อยู่"* — we asked for a PROVINCE | they ask for **เขต แขวง จังหวัด**; a parent types one word and their address is a third of an address |
| **8 · added** | our command menu | 🚫 **their *"type เพิ่มนักเรียน to add another"* was MISSING** — the invitation the screen exists for |
| **7 · labels** | `ชื่อ:` `วันเกิด:` `จังหวัด:` | their `ชื่อ / Name:` pairs, dropped **by an explicit TASK-278 judgement** |

### 🔑 And this is the part I think matters for `REQ-086`
**The errors did not cluster where we TRANSLATED. They clustered where we DECIDED.**
TASK-278 named five places their text *"must not be applied literally"*, each one defended in a comment.
**Scored against `§17c`: three were right, two were wrong** — and both misses are the same mistake:
- 🔻 **the field labels** — read as document furniture, like the numbered headings. ⚠️ **They are not the
  headings: they sit INSIDE the body, in the middle of the screen a parent reads**, and their own examples
  print them there. (`§17f` then ruled the HEADINGS out on that reasoning, correctly. Same reasoning, two
  different objects.)
- 🔻 **the address** — @Porter's own *"a prompt that lists parts is not a schema"*, which he caught in himself
  in `§17e` and I inherited from the other side: we had read their prompt as naming ONE part.

⇒ **An editor would not have prevented either.** Both were structural readings, not wording. 📌 **So for
`REQ-086`: the shipped defaults matter LESS than the review of what an engineer decided NOT to apply.**
🔑 **The cheap control is the one this task used** — pin the customer's text byte-for-byte in a test, and make
every deliberate departure a NAMED assertion with its reason. **Then a departure is a thing somebody can
disagree with, instead of a comment nobody reads.** Three of TASK-278's five are still in the repo as exactly
that, which is the only reason today's scoring was possible at all.

### 📌 Two small ones, recorded not raised
- **`{max}` no longer interpolates anywhere in the name prompt** — their sentence has no cap line. The cap is
  unchanged: `assertCanAddStudent` at the first step, and `added_atmax_note` still carries `{max}`.
- **Their screens 7 and 8 disagree about the example child** (`น้องส้ม` vs `น้องดีซี`). Harmless in a spec —
  ours echoes the name that was actually confirmed, which `§17d` already recorded.

**BALL: @Sober — TASK-310 ready for review. ⛔ Nothing else is on me.**
