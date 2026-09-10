# TASK-307 — a parent may SKIP past having a child, and the account can then do nothing (`REQ-085 §6`)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-09)
📌 **No clock.** 🚫 No migration, no FE change.
⏸️ **`REQ-085 §5` is NOT in this task and must not be touched** — **its COPY is with the customer, and the REQ
says in as many words: *"No engineer may implement this text."*** ⇒ **§6 is the half that is buildable today.**

---

## §1 The owner's words, and the two moments
> *"จังหวะเพิ่มลูกคนแรก และ แรกเริ่มที่ไม่มีลูก ไม่ต้องมีการข้าม"*

| moment | today | required |
|---|---|---|
| **(i) the very start — the account has NO children at all** | a skip is offered | 🚫 **no skip** |
| **(ii) adding the FIRST child** | a skip is offered | 🚫 **no skip** |
| **(iii) adding a LATER child** | a skip is offered | ✅ **UNCHANGED — skipping a second child is legitimate** |

🔑 **The owner's reason, and it is the acceptance criterion:** **a parent account with no child can do NOTHING in
this product** ⇒ **skipping produces an account that exists and cannot be used, and the parent has no way to know
that is why.**
⚠️ **So this is not about tidiness. It is about a dead end that looks like a completed sign-up.**

## §2 Where it lives
`line-webhook.service.ts:1132` —
```ts
if (SKIP_WORDS.includes(lower) && session?.step === "AWAIT_STUDENT_NAME") { … }
```
⇒ **one guard, one step**, replying `skip_done` + the menu. **`SKIP_WORDS` is `CMD_SKIP` (`:102`).**
🔑 **The step is the same for the first child and the fifth** ⇒ **the condition that must change is not the STEP,
it is WHETHER THIS PARENT HAS A CHILD YET.**
⚠️ **Both (i) and (ii) reduce to that one question** — 📌 *which is why the owner named two moments and they are
probably one branch. **Say so if you find they are**, rather than writing two.*

## §3 What must happen instead — and the part I will NOT let be invented
✅ **When a parent with NO children types a skip word, the flow does not advance.** **It asks again.**
🔴 **The wording is NOT yours and NOT mine.** ⚠️ **`REQ-085 §5`'s copy is with the customer right now, and the same
discipline applies here: an engineer inventing the sentence a parent reads is how `Date : อังคาร` shipped after
`REQ-079 §18` had already ruled otherwise.**
⇒ 🔑 **Use an EXISTING string that already says the right thing** — the prompt that asked for the child's name in
the first place. **Re-ask, do not explain.**
📌 **If no existing string fits, STOP and tell me** — **I will get copy from @Porter.** 🚫 **Do not write a new
sentence, and do not stretch an unrelated one to fit.**
⚠️ **And keep it bilingual** — this is a CONVERSATION, so `REQ-079 §18` says both languages. 🔑 *Notifications are
English; conversations are not. That distinction has been broken twice this week in the other direction.*

## §4 What must not change
- 🚫 **`REQ-085 §5`** — the role list, the entry prompt, `ครูเอง`, any admin phrase. **Copy is with the customer.**
- 🚫 **Skipping a LATER child** — asserted still possible.
- 🚫 `SKIP_WORDS` / `CMD_SKIP` themselves, the strike reset, any other step's skip behaviour.
- 🚫 The registration steps, the session state machine, `menu_body`.
- 🚫 No migration · no FE change.

## Definition of Done
- [ ] `bun test` → all pass, **state the count** · typecheck clean, **say which command** *(`bunx --package
      typescript@5.6.3 tsc --noEmit`; the plain `bunx tsc` is broken on this machine)* · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **A parent with NO children cannot skip** — asserted **on both moments the owner named**, or **on the one
      branch they turn out to be, with a line saying they are the same question**
- [ ] 🔑 **A parent WITH a child can still skip** — asserted. ⚠️ *This is the assertion that keeps the fix narrow;
      without it "no skip" quietly becomes "no skip ever"*
- [ ] **The reply is an EXISTING string, named in the report** — 🚫 **no new copy.** *Or: you stopped and asked*
- [ ] **The reply is BILINGUAL** — asserted, because this is a conversation and not a notification
- [ ] 🔑 **Break it and watch** — restored, suite green before the number
- [ ] 🚫 `§5`'s entry prompt and role handling **byte-identical** — asserted, ⚠️ **because the customer is holding
      that copy and a diff there would be invisible to us and visible to them**

## Question
🔴 **Are there OTHER ways to reach a usable-looking parent account with no child?** 📌 *The owner named the two
places a SKIP is offered. A skip is not the only way to leave a flow.*
🔑 **What happens if a parent abandons registration mid-way, or blocks and re-adds the bot, or a child is later
DELETED?** ⇒ **does the account end up in the same dead end by a different road?**
⚠️ **I am not asking you to fix any of it.** **Name the roads.** 🔑 **Because if a child can be removed after the
fact, then "no skip" prevents the account from being CREATED empty and does nothing about it BECOMING empty** —
**and the owner's reason (*"an account that exists and cannot be used"*) applies just as much to the second.**

---

## ✅ RESULT 2026-09-09 — @Jason. **1852 pass / 0 fail**, 148 files · 🚫 **35 `.sql` = 35 journal tags.**
📌 Typecheck: `bunx --package typescript@5.6.3 tsc --noEmit` → **0**.

- [x] 🔑 **A parent with NO children cannot skip** — **and the two moments ARE one branch**; see below
- [x] 🔑 **A parent WITH a child can still skip** — asserted, which is what keeps the fix narrow
- [x] **The reply is an EXISTING string** — `add_student_name_prompt`, the prompt that asked for the name in the
      first place. 🚫 **No new copy, no new i18n key** — asserted as an absence
- [x] **The reply is BILINGUAL** — `both()`, and the underlying string genuinely differs by language
- [x] 🔑 **Break it and watch** — restored, suite green before this number
- [x] 🚫 `§5`'s role prompt and its three buttons **byte-identical**, `SKIP_WORDS`/`CMD_SKIP` untouched
- [x] ✅ **Ruling 2 — my stale comment at `scheduler.service.ts:2925` is corrected** (it said the
      `notify_on_leave` decision was pending; it was made the same day)

New: `src/lib/no-skip-first-child.test.ts` (9 tests).

### §1 ✅ They are ONE branch, and you were right to expect it
The owner named two moments — *"จังหวะเพิ่มลูกคนแรก และ แรกเริ่มที่ไม่มีลูก"* — and **the step is identical for
the first child and the fifth.** ⇒ the question that decides it is not WHICH STEP but **whether this parent has
a child at all**, so both reduce to `kids.length` and there is one branch rather than two.
📌 The re-ask does **not** clear the session: the flow stays where it was and asks again. Asserted by ORDER —
the early return precedes `clearSession`, so the no-child path cannot reach it.

### §3 ✅ An existing string, and I did not have to stop
`both((l) => withExit(t("add_student_name_prompt", l, { max: MAX_STUDENTS_PER_PARENT }), l))` — **the same
string, wrapped the same way, that the flow already uses to enter that step.** Re-ask, not explain.
⚠️ **One thing worth your eye:** the ORIGINAL prompt is single-language (`t(…, lang)`); my re-ask is bilingual
because §3 required it. **So the same sentence is now bilingual on the re-ask and single-language on the first
ask.** I did not change the original — §4 protects the registration steps — but **it is an inconsistency a
parent could see**, and it is one line if you want it.

### 🔴 The Question — **four roads, and the widest one is not a skip at all**
| road | reaches a usable-looking empty account? |
|---|---|
| 🔴 **Abandoning registration mid-way** | **YES — and this is wider than the one the owner named.** `ensureParentByPhone` (`parent.service.ts:66`) creates the `parents` row **at LINK time, before any child**. A parent who links and then simply stops replying leaves exactly the dead end. **They never type a skip word, so *"no skip"* does not touch it.** |
| 🔴 **Blocking and re-adding the bot** | **YES** — the link persists (`family_line_links` / `parents.line_user_id`), so re-adding lands on the same empty parent. It is road 1 with a different exit. |
| ⚪ **An admin creating a parent** (`POST /parents`) | **YES, deliberately** — an admin may register a household before its children. Not a defect. |
| ✅ **A child DELETED later** | **NO — and this is the good news.** I looked for a student delete/archive and **there is none**: no `DELETE /students`, no archive flag on the row. ⇒ **an account cannot BECOME empty.** |

🔑 **So your sharpest sub-question has a clean answer: *"no skip"* prevents the account being CREATED empty, and
nothing can make it become empty afterwards.** The gap is that it is not the only way to *leave it* empty —
**abandonment is, and it is silent by construction: nobody types anything.**
📌 **The owner's reason applies to road 1 exactly as much** — *"an account that exists and cannot be used"* —
but the remedy is a different shape: not a refused word, something that notices an account has sat childless.
🚫 **Named, not built, and I would not guess at what that something is.**

**BALL: @Sober — TASK-307 ready for review. ⛔ Nothing else is on me.**

---

# 🔻 §5 AMENDMENT — @Sober, 2026-09-09. **My §3 instruction was wrong. The re-ask should be SINGLE-language, like its four siblings.**

**You flagged it and asked for my eye. Here is what the eye found:**
| call site | form |
|---|---|
| `:564` · `:685` · `:1022` · `:1388` | **`t("add_student_name_prompt", lang, …)`** — single-language, four times |
| **`:1153` — your re-ask** | **`both((l) => …)`** — **the only one** |

🔴 **So the same sentence now renders in two forms depending on how a parent arrives at it, and you were right
that a parent could see it.** ⚠️ **The cause is my §3: I wrote *"keep it bilingual — this is a conversation"*
without checking what this flow actually does.**
🔑 **`REQ-079 §18` says conversation is bilingual, and this flow satisfies that a different way:** **it knows the
session's `lang` and answers IN it** — 39 `t(…, lang)` calls against 13 `both()`. ⇒ **`both()` is for messages
whose reader's language is not known; inside a session it IS known.**
⇒ ✅ **Change `:1153` to `t("add_student_name_prompt", lang, …)`, matching its siblings.** 🚫 **Do not touch the
other four.**
📌 **Second time today one of my instructions was refuted by the code it was about** *(the first: I nearly sent a
DTO-formatting task that `contract.ts` forbade)*. **The rule I keep learning: an instruction about a convention
must be checked against the convention.**

## ➕ Added to the Definition of Done
- [ ] **`:1153` uses `t(…, lang)`** — 🔑 **and asserted to render the SAME string as the first ask**, so the two
      cannot drift apart again
- [ ] 🚫 **The other four call sites byte-identical** — asserted
- [ ] **`bun test` green with the count**, and the bilingual assertion from §3 **removed rather than left
      failing** ⚠️ *it was asserting my mistake; delete it and say so*

---

## ✅ §3 CORRECTION 2026-09-09 — @Jason. **1852 pass / 0 fail**, 148 files · tsc **0** (`--package typescript@5.6.3`).

✅ **The re-ask now renders in the SESSION'S language**, not `both()`: `withExit(t("add_student_name_prompt", lang, …), lang)` — **the identical expression the first ask uses.**
🔑 **Your reading of the flow is right and mine was not.** `REQ-079 §18` is satisfied here a different way — this flow KNOWS the session's `lang` and answers in it (39 `t(…, lang)` against 13 `both()`). `both()` is for a reader whose language is unknown; **inside a session it is known.** ⇒ my version made the re-ask bilingual while the first ask was not, **which is the inconsistency I had flagged for you — caused by the fix, not found by it.**

🔻 **The bilingual assertion is REPLACED, not left red** — it was asserting the mistake. In its place: the re-ask contains no `both(`, renders `t(…, lang)`, and **the same expression appears more than once in the file**, so the two asks cannot drift into two wordings of one question.
⚠️ **Scoped to the NO-CHILD branch only:** the later-child reply below it is `both((l) => skip_done …)` and always was — §4 protects other steps' skip behaviour, so only the re-ask moved. **The first attempt at this assertion was too broad and caught that line; narrowed rather than loosened.**

**BALL: @Sober — clear on my side.**
