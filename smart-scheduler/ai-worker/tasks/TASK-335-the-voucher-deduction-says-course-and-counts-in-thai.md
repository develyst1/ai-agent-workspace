# TASK-335 — the voucher deduction says COURSE, and counts in Thai (`REQ-087 §1a`, `§1c`)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-11)
🔴 **THIS BLOCKS `uat`.** The customer reported it on their own screen. 🚫 No migration, no FE change.
⛔ **`§1b` (`Remark`) is NOT in this task — see `§4`. Do not add it.**

---

## §1 What the customer sees, and both are ours
**A VOUCHER deduction message today:**
- 🔴 **`💡COURSE DEDUCTION`** — **the wrong noun about the thing they bought.** ⚠️ **A family holding BOTH reads
  one header for two things they paid for separately.**
- 🔴 **`Remaining : 14/15 ครั้ง`** — **THAI inside a value the SYSTEM generates.** 🔗 **`REQ-085 §4`**:
  *"eng ล้วน ไม่ควรไทยเลยแม้แต่ติด"*. 🔑 **Nobody reported this one. It is `Date : อังคาร` again, in the one
  message family nobody had swept.**

## §2 ✅ `§1a` — the data is ALREADY THERE, it is one branch
**`deductionPayload` declares `bookingType: "COURSE_PACKAGE" | "VOUCHER"`, and the renderer already computes
`const type = notifyTypeOf(payload.bookingType)` at the top of the branch.**
⇒ 🔑 **Only `t("ob_deduct_title", lang)` is unconditional.** ✅ **Branch the TITLE on the `type` you already
have.** 🚫 **Do not add a field to the payload; do not re-derive the type.**
📖 **THE WORD IS THE CUSTOMER'S and @Porter is asking them.** ⇒ ⚠️ **whatever you put in is a PLACEHOLDER by
the rule we adopted:** ✅ **pin the FORM** — *a distinct title for a voucher · same shape as its course twin ·
the customer's `💡` and the trailing colon convention* — 🚫 **and do NOT byte-freeze the words.**
📌 **`ob_deduct_title` is byte-pinned for the COURSE case: that pin stays exactly as it is, and you assert the
course header is UNCHANGED.**

## §3 🔴 `§1c` — and the trap is that `remainingLabel` has TWO readers
```ts
return kind === "course" ? `${left} HR` : `${left}/${total} ครั้ง`;
```
⚠️ **That one function feeds the NOTIFICATION *and* it is the shape behind the CARD's owner-verified
`เหลือ 6/10` (TASK-234).**
🔴 **`§4` governs the MESSAGE. The card is a staff/FE surface and the owner SIGNED IT OFF.**
⇒ 🔑 **Take `ครั้ง` out of what the MESSAGE renders without changing what the owner approved on the card.**
❓ **You decide the shape and say which:** *a second label function for the notification · a parameter · or the
card stops sharing this helper.* 📌 **My reading: the notification gets its own, and the shared thing is the
NUMBER PAIR, not the word.** ⚠️ **Same one-transformation-two-contracts shape as `ddmmyyyy` in TASK-318 —
that one went well because it was named in the task rather than found in review.**
🚫 **Do not touch the card's rendering.** ✅ **Assert it is unchanged.**
❓ **And say what the English should be.** 📌 *`14/15` alone is already unambiguous beside `Remaining :`, and
`§4` is satisfied by removing a Thai word rather than by translating it* — **but that is a judgement and I want
yours, with the reason.**

## §4 ⛔ `§1b` — `Remark` — IS NOT IN THIS TASK
🔴 **I checked, and the customer's premise is wrong: `COURSE DEDUCTION` has NEVER carried `Remark` — not for a
voucher, and NOT FOR A COURSE.** `TEMPLATE_FIELDS.course_deduction` has no `note`, and there is no `Remark`
line appended below its block.
⇒ 🔑 **They compared their voucher DEDUCTION to their course CONFIRMATION.** ⇒ **adding it is not restoring
parity, it is ADDING A FIELD to a message they already approved — and it would change the COURSE deduction
too, which is byte-pinned.**
🚫 **Do not add it. Do not "prepare" for it.** ✅ **@Porter is putting it to the customer as a question.**

## §5 What must not change
- 🚫 **The COURSE deduction's header and its byte pin** · `remainingLabel`'s COURSE branch (`2 HR`) · the card.
- 🚫 `TEMPLATE_FIELDS.course_deduction` · the `fieldValue` guard (TASK-332) · `expiryDate` · the `§7` pins.
- 🚫 No migration · no FE change · **no new payload field.**

## Definition of Done
- [ ] `bun test` all pass, **state the count** · typecheck clean (`bunx --package typescript@5.6.3 tsc
      --noEmit`) · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **A VOUCHER deduction and a COURSE deduction produce DIFFERENT headers** — asserted, ⚠️ *and the
      COURSE one byte-identical to today*
- [ ] 📖 **The voucher title is pinned by FORM, not by bytes** — **and marked PLACEHOLDER in the source**,
      the way `tsched_title_week` is
- [ ] 🔑 **No Thai in the voucher `Remaining` value** — asserted, ⚠️ **and asserted for the COURSE value too**,
      *so the rule is about the message rather than about one branch*
- [ ] 🔴 **The CARD's `เหลือ 6/10` is UNCHANGED** — asserted, *it is owner-verified and outside `§4`*
- [ ] **`§3`'s shape decided and stated**, and **what the English is, with your reason**
- [ ] 🚫 **`Remark` NOT added** — asserted as an absence, **with `§4`'s reason in the test**
- [ ] 🔑 **Break it and watch** — mutation and restore in ONE call, restore verified byte-identical

## Question
🔑 **`ครั้ง` sat in a notification for as long as vouchers have existed, and `§4` was ruled on 2026-09-08 —
after which we swept `Date : อังคาร`, `ไม่มี` → `(-)`, the headers, the seconds.** ⚠️ **We swept the messages
we were LOOKING at.**
⇒ ❓ **Is there a cheap assertion that no SYSTEM-GENERATED value in ANY outbox message contains Thai?**
📌 *The hard part is obvious and I want your judgement on it: a message legitimately carries Thai — a student's
name, an admin's typed `Remark`, and the whole Thai HALF of every bilingual string.* 🔑 **So the question is
whether the GENERATED values are distinguishable from the human ones at any single point** — ⚠️ **and by your
own TASK-333 criterion, if the chokepoint cannot SEE the difference from where it stands, the answer is no and
I would rather hear that than a clever regex.**

---

## ✅ RESULT 2026-09-11 — @Jason. **2017 pass / 0 fail**, 162 files · 🚫 **35 `.sql` = 35 journal tags.**
📌 Typecheck: `bunx --package typescript@5.6.3 tsc --noEmit` → **0**. 🚫 No migration, no FE change, no payload
field. ✅ **`uat` is unblocked from my side.**

- [x] 🔑 **A VOUCHER and a COURSE deduction produce DIFFERENT headers** — asserted, **and the COURSE one is
      byte-identical to today**
- [x] 📖 **The voucher title is pinned by FORM, not bytes, and marked PLACEHOLDER in the source**
- [x] 🔑 **No Thai in the generated `Remaining`** — asserted for **BOTH** types, so the rule is about the message
- [x] 🔴 **The CARD is unchanged** — and see below, it was never sharing the helper
- [x] **`§3` decided and stated**, with the English and the reason
- [x] 🚫 **`Remark` NOT added** — asserted as an absence with `§4`'s reason in the test
- [x] 🔑 **Break it and watch** — two mutations here (+ one for TASK-334), **all three in ONE call**, restores
      **byte-identical**, 0 markers

---

## 🔻 §3 — **THE TRAP IS NOT THERE. The card never shared `remainingLabel`.**
You named the risk carefully and it was the right thing to name — **but I checked it before choosing a shape,
and the premise does not hold:**
- 🚫 **`line-course-view.ts` does not import `course-deduction` and does not call `remainingLabel`.** It
  computes `Math.max(0, c.size - c.usedSessions)` itself and renders `course_row`'s own
  `เหลือ {remaining}/{total}`.
- 📌 **`remainingLabel`'s own comment is what caused the reading** — *"matching `courseLine`'s owner-verified
  `เหลือ 6/10`"*. ⚠️ **It was written to MATCH the card, not to be SHARED with it.** *"Matching"* and
  *"shared"* are one word apart in a comment and a whole task apart in the code.
⇒ ✅ **So: no second function, no parameter, no un-sharing. ONE line changed, and the card is untouched by
construction rather than by care.** **Asserted both ways** — the card has no import of it, and its string still
says `เหลือ`.

### 🔴 AND THE REAL SECOND READER IS A MESSAGE YOU DID NOT COUNT
**`jobs.service.ts:418` renders `TodayRow.remaining` through the same helper for the AUTO daily schedule.**
⇒ 🔑 ***`Remaining : 14/15 ครั้ง` was in TWO messages, not one*** — the deduction **and** the daily reminder —
**and one line fixed both.** ✅ Asserted on the rendered daily-reminder message, not just on the helper.
📌 **Same shape as `ddmmyyyy` after all, but with the pairing the other way round: the two readers are both
NOTIFICATIONS, and the surface that looked shared was the one that was independent.**

## ✅ §1c — the English: **remove the word, keep the pair. `14/15`.**
📖 **Your reading was that `14/15` may already be unambiguous. It is, and here is why I am confident enough to
choose rather than ask:**
1. 🔑 **The `n/N` FORM carries the meaning that `HR` carries for a course.** `Remaining : 14/15` says *14 of
   15 left*; a unit word would restate the label above it.
2. ✅ **The owner has ALREADY signed off that form** — the card's `เหลือ 6/10` is the same pair. **The shape is
   blessed; only the word was in the wrong language.**
3. 🔑 **And this is the part that decides it: removing a Thai word APPLIES a ruling; choosing an English one
   INVENTS a string.** ⚠️ *`sessions` · `times` · `classes`* is a copy decision, and by the convention we
   adopted this week that would be a PLACEHOLDER — **in a value, where a placeholder is worse than in a
   title.** ⇒ **removal is the only option that is not provisional.**
📌 **If the customer wants a unit, it is one constant in one function** — and it is theirs to name.

## ✅ §1a — the title
**`💡VOUCHER DEDUCTION`, and it is a PLACEHOLDER** — declared as such in the i18n table the way
`tsched_title_week` is, and its test pins **the form and not the bytes**: the `💡`, upper case, **no trailing
colon** *(its course twin has none — I checked rather than following `§2`'s "trailing colon convention", which
would have made the two inconsistent)*, and **different from the twin**, which is the whole requirement.
🚫 **The COURSE title's byte pin is untouched** and asserted.

## ⛔ §1b — not added, and the absence is asserted with your reason
`TEMPLATE_FIELDS.course_deduction` has no `note`, and neither deduction renders `Remark`. **In the test, with
the reason**, so nobody later reads the gap as an oversight and "restores parity" into a message the customer
already approved.

---

## ❓ THE QUESTION — **a cheap assertion for Thai in a generated value: NO. And the reason is your own criterion.**

**By TASK-333's second test — *can the chokepoint SEE the difference from where it stands?* — the answer is
no, and it is not close.** At the point a finished message exists, these are indistinguishable:
| Thai in a message | is it allowed? |
|---|---|
| `Student : น้องดีซี` | ✅ **a human's name** |
| `Remark : เตรียมเฉพาะ Freeskate ให้น้อง` | ✅ **an admin's typed words** |
| the whole Thai half of every bilingual conversation string | ✅ **by design** |
| `LEAVE NOTICE / แจ้งลา ‼️` | ✅ **the customer asked for it** (`§16e`) |
| `Remaining : 14/15 ครั้ง` | 🔴 **the defect** |
🔑 **Every one is Thai in a message. The rule is not about the CHARACTERS — it is about WHO WROTE THEM**, and
authorship is exactly the thing a finished string does not carry. ⇒ **a regex would have to encode the
exception list, and by `§8.1`'s lesson a table of exceptions is the per-instance knowledge moved somewhere
nobody reads it against the message it applies to.** 🚫 **I would rather tell you that than write a clever
regex that we spend the next month adding exceptions to.**

### ✅ But there IS a cheap assertion — it is just not the one you asked for
🔑 **Move the question UPSTREAM, where authorship still exists.** At the point a value is GENERATED, we know it
is ours; by the time it is in a message we do not. ⇒ ***assert that the FUNCTIONS THAT GENERATE VALUES return
no Thai*** — a small, enumerable list: `remainingLabel`, `programLabel`, `ddmmyyyy`, `hhmm`, `shortDate`,
`joinCoaches`, the `ob_dow_*` lookup.
📌 **That is a handful of pure functions with no human input**, and each is exactly where `§4` applies. ✅ **I
have already asserted it for `remainingLabel`, on BOTH branches** — *so the rule is about the message rather
than about the branch that was reported*.
⚠️ **What it would NOT catch: a Thai literal written straight into a branch of `line-message.ts`** — because
that is not a generator, it is the message. 🔑 **Say so plainly if we build it: it covers the generators, and
the generators are where `ครั้ง` and `อังคาร` both lived.** 📌 **Two for two is not proof, but it is the whole
evidence we have, and it is better than a regex over Thai codepoints that must not fire on a student's name.**

**BALL: @Sober — TASK-335 done, `uat` unblocked from my side. ⛔ TASK-328 and TASK-333's code half still held.**
