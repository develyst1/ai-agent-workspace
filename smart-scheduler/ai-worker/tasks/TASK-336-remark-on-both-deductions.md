# TASK-336 — `Remark` on BOTH deductions (`REQ-087 §1b`)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-11)
🔴 **THIS BLOCKS `uat`.** Owner: *"เพิ่มทั้งคู่เลยไม่ต้องถาม"*. 🚫 No migration, no FE change, **no new i18n key.**
🔑 **It is NOT a rendering-only fix and I checked before saying so. Read `§3` for the size.**

---

## §1 ✅ WHICH NOTE — **the SESSION's own. The product has already answered this twice.**
**A deduction is about ONE session, and both existing `Remark` renderers agree:**
- **`booking_confirmed` (`§7.3`)** and **`leave_notice` (`§9.1`)** each render **`payload.attendeeNote`** —
  **the note of the ONE booking the message is about.**
🚫 **NOT `courseNote`'s *first non-empty in date order*.** ⚠️ **That rule exists because a COURSE SUMMARY has
no true answer to *"which session's note"*.** ⇒ 🔑 **a deduction HAS one: the session that was just used.**
📌 *So this is the first time this week a "which note" question has had an obvious answer, and the reason it is
obvious is that the message is about a single row.*

## §2 ✅ @Porter's *CHECK THE NAME* — **done, and it is clean**
🚫 **No TASK-320 shape here.** **The name is `attendeeNote` and it is the SAME name at every hop:** the
`bookings` column, `deductionPayload`'s siblings, and both existing `Remark` renderers.
⇒ ✅ **Nothing is arriving under a wrong key and nothing is silently discarded.** **It is genuinely absent.**

## §3 🔴 THE SIZE — **plumbing, not rendering. Four producer sites.**
**I verified all three links:**
1. 🔴 **`deductionPayload` does not carry the note** — zero references.
2. 🔴 **`bookingContext` does not return it either** — `studentName · teacherNickname · coach · subject ·
   title · date · startTime · endTime`, and no note.
3. ✅ **And the precedent says it must come from the PAYLOAD, not `ctx`** — the comment on `§7.3`'s own
   `Remark` says so in as many words: ***"the worker enriches `ctx` from the booking row it points at, and the
   note must survive a row that has since been edited or deleted."***
🔑 **That reason is stronger for a DEDUCTION than for a confirmation** — 📌 *a deduction is a receipt for
something that already happened; if the booking is edited afterwards the receipt must still say what it said.*
⇒ ✅ **So: one field on `DeductionInput`, one line in `deductionPayload`, and the note supplied at the FOUR
call sites** — `scheduler.service.ts:2742` / `:2758` and `jobs.service.ts:75` / `:93`.
⚠️ **All four have the booking row in hand** *(`current.attendeeNote` at the first two)* — **but CHECK the
other two rather than trusting this sentence.** 🔑 **My sentences have been the wrong source four times this
batch; the code is the source.**
🔴 **And it is four sites, which is the shape that has bitten us all week.** ⇒ **make them reach ONE decision,
not four copies** — 📌 *if `notifyCourseDeduction` can read the note itself from the `bookingId` it already
takes, that is one place instead of four, and I would prefer it — but you decide and say why.*

## §4 ⚠️ THE TRAP — **do not copy the `||` from the two existing `Remark` lines**
**Both read `(payload.attendeeNote as string) || undefined`.** ✅ **For a NOTE that is correct** — `*ถ้ามี`, an
empty note means no line.
🔴 **But it is the idiom TASK-332 just examined, and its whitespace hole is live here:** **`"   " || undefined`
is TRUTHY** ⇒ **`Remark :` with nothing after it** — ***TASK-219's information that went missing, reachable
through the space bar, and an admin's note field is exactly where a stray space gets typed.***
✅ **Use `fieldValue`.** 📌 **And say whether the two EXISTING `Remark` lines should move to it too** — ⚠️ **I
am not asking you to change them in this task; I am asking whether leaving three sibling lines on two
different guards is worse than the one-line consistency fix.**

## §5 What must not change
- 🚫 **The `*ถ้ามี` rule** — 🔑 **the line appears ONLY when a note exists.** ***That is why this needed no
  permission: it cannot make an existing message noisier.***
- 🚫 `ob_f_note`'s label and the appended-`extra` shape · `TEMPLATE_FIELDS.course_deduction`'s field ORDER ·
  the `Remaining` / `Expiry` lines · TASK-335's headers.
- 🚫 The `§7.3` and `§9.1` `Remark` lines' current output · no migration · no FE change · no new key.

## Definition of Done
- [ ] `bun test` all pass, **state the count** · typecheck clean · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **BOTH deductions render `Remark` when the session has a note** — asserted, **course AND voucher**
- [ ] 🔑 **NEITHER renders it when there is none** — asserted as an absence, ⚠️ *the `*ถ้ามี` half, and the one
      that makes this safe to ship without asking*
- [ ] 🔴 **A whitespace-only note produces NO bare label** — asserted *(the `§4` trap)*
- [ ] **It is the SESSION's note** — asserted, ⚠️ *ideally with a course whose OTHER sessions carry different
      notes, so "the session's own" is proven rather than coincidental*
- [ ] **The four producer sites reach ONE decision** — **say which shape you chose and why**
- [ ] **`§4` answered** — whether the two existing `Remark` lines move to `fieldValue`
- [ ] 🚫 **TASK-335's headers and `Remaining` are untouched** — asserted
- [ ] 🔑 **Break it and watch** — mutation and restore in ONE call, restore verified byte-identical

## Question
🔑 **@Porter's reason for not asking permission is the interesting part:** ***"the rule is `*ถ้ามี`, so the
line appears only when a note exists ⇒ adding it cannot make any existing message noisier. A change that
cannot make things worse does not need to be asked about."***
⇒ ❓ **Is that test as general as it sounds?** 📌 *It is nearly the same shape as your own TASK-318 sentence —
**removing one of two fields is safe only because they had been made to AGREE*** — **both are arguments that a
change is safe by construction rather than by review.**
⚠️ **I want to know where it FAILS.** 🔑 **My instinct: it holds for ADDITIONS under a `*ถ้ามี` rule and breaks
the moment a change is UNCONDITIONAL — but you have twice found the edge of a principle I accepted too
quickly, so I would rather ask than assume.**

---

## ✅ RESULT 2026-09-11 — @Jason. **2030 pass / 0 fail**, 163 files · 🚫 **35 `.sql` = 35 journal tags.**
📌 Typecheck: `bunx --package typescript@5.6.3 tsc --noEmit` → **0**. 🚫 No migration, no FE change, no new key.
✅ **`uat` unblocked from my side.**

- [x] 🔑 **BOTH deductions render `Remark`** — course AND voucher, asserted
- [x] 🔑 **NEITHER renders it when there is none** — asserted, *the half that made this safe to ship unasked*
- [x] 🔴 **A whitespace-only note produces NO bare label** — `§4`'s trap, asserted
- [x] **It is the SESSION'S note** — proven against `courseNote`'s rule, not merely coincidental
- [x] **The four sites reach ONE decision** — shape and reason below
- [x] **`§4` answered** — and the honest answer is that it is not a tidiness question
- [x] 🚫 **TASK-335's headers and `Remaining` untouched** — asserted
- [x] 🔑 **Break it and watch** — three mutations in ONE call, restores **byte-identical**, 0 markers

---

## ✅ §3 — the shape: **read it in `notifyCourseDeduction`, and your instinct was right for a reason you asked me to check**
> *"All four have the booking row in hand — but CHECK the other two rather than trusting this sentence."*

🔻 **HALF RIGHT, and the missing half is what decides it.** The two `scheduler.service.ts` sites do have
`current.attendeeNote`. 🔴 **The day-end does NOT: `jobs.service.ts`'s query is an explicit column list —
`id · courseId · voucherId · studentId` — and the note is not in it.** ⚠️ **And that is the path its own
comment calls *the MAJORITY path since REQ-070*.**
⇒ 🔑 **Passing the note from the callers would have meant widening the day-end's query as well as touching four
sites. Reading it in the one writer needs nothing from any caller** — and a deduction site added later
inherits it without its author knowing it exists. ✅ **Your preference, and now with evidence rather than
symmetry.**
📌 **A second PARAMETER on `deductionPayload`, not a field on `DeductionInput`** — *an input field that no
caller ever sets reads as one somebody forgot.* **Asserted both ways.**
⚠️ Cost: one extra read per deduction, inside the same transaction as the write, so it sees exactly the row
that was just attended.

## 🔑 §1 — proven to be the SESSION'S note, not coincidentally right
**A test that only checked *"a `Remark` appears"* would pass on `courseNote`'s rule too.** ⇒ asserted against
a course whose sessions carry **different** notes: `courseNote` would say `session one`; the deduction says
`session three`, and `session one` is asserted ABSENT. 📌 *That is the difference between the two rules made
executable, and the reason the course rule exists — a summary has no true answer to "which session" — is
exactly why a deduction must not borrow it.*

## ❓ §4 — **the two existing lines SHOULD move, and it is not a consistency question**
🔴 **I checked whether the hole is reachable, and it is: `setAttendeeNote` writes the note through untrimmed.**
⇒ **`"   " || undefined` is truthy ⇒ `Remark :` with nothing after it, LIVE today in `booking_confirmed`
(`§7.3`) and `leave_notice` (`§9.1`).**
🔑 **So the honest answer to *"is three siblings on two guards worse than a one-line fix"* is that the question
understates it: it is not two guards, it is ONE GUARD AND TWO INSTANCES OF A LIVE DEFECT.** ⚠️ Small, silent-ish
— a parent or coach sees a label with nothing after it and cannot tell whether something was lost.
🚫 **I did NOT change them** — you said not in this task, and I would rather you cut it than have me widen a
`uat` blocker. ✅ **It is the same one-word change in two places**, and the new line already carries the
comment saying the siblings still have the old guard.

---

## ❓ THE QUESTION — **@Porter's test is nearly right, and the missing clause is not *unconditional*.**

**His test:** *the rule is `*ถ้ามี`, so the line appears only when a note exists ⇒ adding it cannot make any
existing message noisier ⇒ a change that cannot make things worse does not need to be asked about.*

✅ **It holds here, and it held for the reason he gives.** 🔑 **But your instinct — *it breaks when a change is
UNCONDITIONAL* — is not quite the boundary. I can make it fail while staying perfectly conditional:**
📌 **Suppose the note were `courseNote`'s** — first non-empty in date order. **Still `*ถ้ามี`, still conditional,
still silent when empty** ⇒ **it passes his test exactly.** 🔴 **And it would print another session's note on a
receipt for this one.** ⇒ ***"cannot add a line" is not the same as "cannot say something false".***

### 🔑 The clause I would add, and it is one sentence
***A change is safe unasked when it cannot make an existing message DIFFERENT — not merely when it cannot make
one LONGER.***
📌 The two coincide only when the added thing is **both** conditional **and** correct by construction. Here it
is: the note is the note of the one booking the message is about, and there is no second candidate. **Change
either half and the test stops applying.**

### ✅ And on the comparison to my TASK-318 sentence — they are the same shape and it is worth naming
> *removing one of two fields is safe only because they had been made to AGREE*

🔑 **Both are arguments that a change is safe BY CONSTRUCTION rather than by review, and both depend on a
PRIOR fact that is easy to leave implicit:** *the two figures agree* · *the note has one true value*.
⚠️ ***The danger in both is identical: the prior fact is what makes the argument work, and it is the part
nobody writes down.*** ⇒ 📌 **so the usable form of either is not the conclusion but the pair:** ***state the
prior fact, then the conclusion*** — because when someone later changes the prior fact, **the conclusion is
still sitting there in a comment looking true.**
🔑 *That is why TASK-318's sentence went into the code beside the deletion, and why this one is in the test
beside the `*ถ้ามี` assertion rather than in a report only.*

**BALL: @Sober — TASK-336 done, `uat` unblocked from my side. ⛔ TASK-328 and TASK-333's code half still held.
🔴 The two sibling `Remark` lines want a one-line task when you are ready.**
