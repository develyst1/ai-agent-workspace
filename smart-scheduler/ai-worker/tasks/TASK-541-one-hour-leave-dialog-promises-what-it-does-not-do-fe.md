# TASK-541 — F2: the leave dialog on a 1-HR booking promises a quota and a make-up that never happen — FE, XS

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-28) · **Size XS.** Tanya, TEST-075 F2.

## §0 What it is
On a **1-HR** booking, the leave dialog says it **"uses one of the course's leaves and adds a make-up session"** — and **neither happens** (`leaveRefunded: false`, `makeupCancelledId: null`).
🔑 **This is TASK-514's shape for the third time: a dialog describing a different booking's behaviour.** 📌 **And the admin reading it makes a worse decision than the dialog's author intended** — they will avoid recording a leave they believe costs the family an entitlement, **so the record ends up wrong to protect a family from something that was never going to happen.**

## §1 Build
- **The dialog's body follows the BOOKING TYPE.** For a 1-HR booking it says what actually happens; for a course booking it keeps today's words **byte-identical** (pin that).
- 🔑 **Derive the cases, do not enumerate them from this one report.** We have two known kinds here — **is there a third?** (a voucher session, an OTHER booking, a camp day, a group seat?) **Say what the set is and what each one's dialog should claim** — and 📌 **if a kind's real behaviour is not obvious from the FE, ask rather than guess: the backend decides, and the dialog only reports.**
- ⚠️ **The safest wording is the one that claims least.** **If you cannot establish what a kind does, say nothing about quotas or make-ups for it** — **a dialog that omits a consequence is recoverable; one that invents a consequence changes what an admin decides.**
- 📋 **Propose the words** (both languages, marked as a draft, pinned by form) — and **pin by SHAPE: the 1-HR body must not contain the quota or make-up claims**, asserted as absences.
- 🚫 No BE change. If the truth is only knowable server-side, **stop and tell me** — that is a contract question, not a copy one.

## §2 What must not move
🚫 The course booking's dialog, byte-identical · what the leave action DOES · the Undo control and its own wording.

## Definition of Done
- [ ] The body chosen by booking type, by value in both languages · **the set of kinds derived and stated**, with each one's claim named (**or "not establishable from here" said plainly and escalated**) · the course dialog pinned byte-identical · **the 1-HR body pinned to CONTAIN NO quota or make-up claim**, as an absence · 📋 the words marked as a draft, pinned by shape · suite **count** · tsc · build ok · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation restoring the quota sentence on a 1-HR booking and one that changes the course booking's dialog · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Fern (2026-09-28): the leave dialog now follows the ROW · **665 / 0** (was 658 · +7) · tsc 0 · build ok · **6 mutations bite** · ⚠️ **two residual overstatements escalated, not guessed at**

## §1 🔑 The set — derived from the server's leave branch, not from the one report
I read `scheduler.service.ts`'s `action === "sick-leave"` branch rather than enumerating from Tanya's 1-HR case. **The quota increment and the make-up insert both live inside ONE condition: `current.courseId && current.course`.** Everything else falls straight through to the status write and the notice.

⇒ 🔑 **The deciding fact is not the booking type — it is whether the row is COURSE-BACKED.** The FE's own mapper sets `courseId: dto.course?.id`, so the row already carries exactly that fact, and `leaveClaimKey` reads that one thing.

| kind | what a leave really does | what its dialog now claims |
|---|---|---|
| `COURSE_PACKAGE` | quota spent (within quota, not planned-at-creation) + make-up appended | **today's words, byte-identical** |
| `SINGLE_SESSION` (the 1-HR of this report) | status + notice only | no quota, no make-up |
| `FIRST_TRIAL` | status + notice only | no quota, no make-up |
| `VOUCHER` | status + notice only (the server's own comment: *"a voucher / single leave take none"*) | no quota, no make-up |
| `OTHER` — **a CAMP day included** (a camp hour is an `OTHER` row) | status + notice only | no quota, no make-up |
| `GROUP` — the group row itself | status + notice only | no quota, no make-up |
| **a GROUP SEAT** | 🔑 **whatever its OWN `courseId` says** — seats are ordinary rows | the course words when it has a course, otherwise not |

📌 **The answer to "is there a third?" is better than a third: there is no per-type table at all.** A type-keyed rule would have been wrong for **every group seat** — two seats in one group can honestly deserve different sentences. The test still names all six types in a `Record<BookingType, …>`, so **a seventh type cannot be added without a decision**, but the rule reads the course.

## §2 ⚠️ Two overstatements I did NOT fix, and why — both inside the course branch
Same defect shape as F2, one case in:
1. 🔴 **An OVER-QUOTA course leave.** `canTakeLeave()` is `leaveRemaining > 0 || adminUnlocked`; when it is false the server sets the status, **spends no quota and appends no make-up** (`locked: true`). **Today's course body still promises both.** The FE *could* compute it — `course.leaveRemaining` and `course.adminUnlocked` are both in `CourseSummary` — but **TASK-541 §2 pins the course booking's dialog byte-identical**, so changing it is your call, not mine. 📋 **It is a one-line addition to `leaveClaimKey` plus one copy key if you want it.**
2. 🔴 **A `planned_at_creation` row** (SPEC-049's declared absence): the make-up **is** appended but **no quota is charged** — so the quota half of the sentence is false. ⚠️ **This one is NOT establishable from the FE: `plannedAtCreation` is not in `BookingDTO` at all** (only a weekly-plan shape carries `planned`). **That is a contract question, as your §1 anticipated — I am not guessing it.**

🔑 **Both are reported rather than patched because the safest wording claims least, and I cannot claim less on a sentence §2 freezes.**

## §3 What I built
- **`src/lib/scheduler/leave-claim.ts`** — `leaveClaimKey(row)`, the one place this is decided, with the server condition it mirrors named in the header. **An absent, empty or whitespace `courseId` reads as NO course** — the reading that claims least.
- **`confirmAction.leaveMsgNoCourse`, both languages, 📝 marked DRAFT.** It says only the two things the server does for **every** kind: the session is **recorded as leave**, and **the coach and the admins are told**. Then it denies the two claims explicitly, because *"nothing happens"* is not what an admin needs to read — they need to know **this does not cost the family an entitlement**, which is the belief that was stopping them recording leaves at all.
- **`BookingModal`**: `message: t(leaveClaimKey(booking))`. Nothing else about the leave act moved.

## §4 📋 Pinned by SHAPE, as asked
- The **course** body is pinned **byte-identical in both languages** (and `leaveTitle` too — the question above it is not this task's).
- The **no-course** body is pinned by **ABSENCE of the claims**: `adds a make-up` and `uses one of the course` must **not** match, `no make-up session is added` / `no leave quota is used` must; in Thai `เพิ่มคาบชดเชย` and `จะใช้โควตา` must **not** match while `ไม่มีคาบชดเชย` / `ไม่ใช้โควตา` must. 🔑 **So the words may be re-drafted by the owner without unpinning the promise** — the pin is on the shape of the claim, not on the sentence.

## §5 🔑 Break-and-watch — `BASELINE=` (md5), `try/finally`, CHECKSUM verified
```
BASELINE= leave-claim.ts    47ebbdce5a8bf4fdcf2e04c058e78aee
          dictionaries.ts   3d4a27c35fbfe0aef6d4bd92c3aa85df
          BookingModal.tsx  e871ac95eaa2e3aca2be259df1057e17
```
| # | mutation | caught by |
|---|---|---|
| M1 | **the quota + make-up sentence restored on a no-course row** (the task's required mutation) | 3 rule tests |
| M2 | **the COURSE dialog's wording changed** (the task's other required mutation) | my §2 pin **and** TASK-518's own byte-identical pin |
| M3 | the no-course body says a make-up **is** added | the absence pin |
| M4 | the Thai no-course body promises the quota spend | the absence pin |
| M5 | the dialog hard-codes `confirmAction.leaveMsg` again | my call-site pin **and** two existing Undo pins |
| M6 | a whitespace `courseId` counts as a course (claims the most) | the least-claim pin |

All six bite; none slipped; **CHECKSUM: every file back to baseline.**

## §6 ⚠️ Declared: two existing pins updated (the call site they froze is what this task changes)
`undo-control.test.ts` §3 and `undo-click.test.ts` §4 both pinned the literal `message: t("confirmAction.leaveMsg"),`. **That line is exactly what TASK-541 exists to change**, so both now pin `message: t(leaveClaimKey(booking)),` with a note saying why. 🔑 **Neither pin lost anything it was protecting:** the leave dialog is still reached from that one item behind the status guard, and **the course copy they cared about is still pinned byte-identical** — M2 and M5 prove both halves still bite.

## §7 Verification
**665 pass / 0 fail across 71 files in 3.3 s** (was 658 ⇒ **+7**) · **`tsc --noEmit`: 0** · **`bun run build` ok** (standalone copied) · §2 untouched: the leave action itself, the Undo control and its wording, and the course dialog are all unchanged.

🚫 **No BE change.** 🚫 **No deploy request.** 📌 **No `.dom.test.tsx` here, deliberately:** this is a SENTENCE, not a control — the button it belongs to is already clicked-proven, and `test/dom-preload.ts` says a browser-ish test that asserts copy is slow, brittle and deleted within a month. **What I have not proven is that the owner prefers my words** — they are a draft.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-28) — 🔨 **and residual (1) is ruled IN as an addendum; (2) goes to BE.**
Verified: **665 pass / 0 fail** · tsc 0 · build ok.

## 🔑 The derivation is the whole value of this task, and it found that my premise was wrong
I said *"the body follows the BOOKING TYPE."* **There is no per-type table at all.** The server spends the quota and appends the make-up inside **one condition — `current.courseId && current.course`** ⇒ **the deciding fact is COURSE-BACKED, not the type.**
📌 **And the consequence is concrete: a type-keyed rule would have been WRONG FOR EVERY GROUP SEAT**, because seats are ordinary rows with their own `courseId` — **so two seats in the same group can deserve different sentences.** **I would have shipped a rule that is right about 1-HR and wrong about a whole product shape.**
✅ **And all six types are still named in a `Record<BookingType, …>`, so a seventh forces a decision** — the derived fact drives the behaviour, the exhaustive map keeps the next person honest. **Both, which is the right combination.**
✅ **The no-course body says what the server ALWAYS does** (recorded as leave, coach and admins told) **and then denies both claims** — because *"nothing happens" is not the reassurance an admin needs before recording a leave.* 🔑 **That sentence is the difference between a dialog that is accurate and one that is usable.**
✅ **Pinned by ABSENCE of the two claims in both languages, so the owner can redraft every word without unpinning the promise.** ✅ And the two Undo pins she had to touch were **updated with what they protected kept**, declared.
📌 **"No DOM test on purpose: a sentence is not a control."** **Correct, and it is her own boundary from TASK-532 being respected by its author** — the harness does not creep.

## 🔨 Residual (1) — over-quota course leave: **ruled IN. Do it.**
**A locked, over-quota course leave spends nothing and appends nothing, and the course body promises both.**
⚠️ **My §2 pinned that sentence byte-identical — I wrote that to stop the COURSE copy drifting while you changed the 1-HR case, not to preserve a falsehood.** 🔑 **It is the same defect as this whole task, sitting inside the words I told you not to touch.** ⇒ **one line in `leaveClaimKey` plus one copy key, the new sentence a draft pinned by absence, and the ordinary course case still byte-identical.**

## ▶️ Residual (2) — `plannedAtCreation`: **a contract question, as I said. It goes to BE.**
**The make-up IS appended and NO quota is charged**, and **the field is not in `BookingDTO` at all** ⇒ **you cannot know it from where you stand, and you stopped exactly where I asked.**
⇒ **TASK-542 (BE, XS)** adds it, then a one-line follow-up here. 📌 **Three dialogs deep, the pattern is now clear: this screen has been describing the COMMON case as if it were the rule**, and each exception has had to be found by someone reading the server.

---

# ✅ ADDENDUM — @Fern (2026-09-28): residual (1) done — **the over-quota course leave stops promising what it will not do** · **670 / 0** (was 665 · +5) · tsc 0 · build ok · **9 mutations bite**

## A§1 What changed, and the one thing it cost
`canTakeLeave` is `leaveRemaining > 0 || adminUnlocked`. When it is false the server records the status, **spends no quota, appends no make-up**, and answers `locked: true` — and today's course sentence promised both. 🔑 **Your ruling is the right reading of your own §2: the freeze existed to stop the course words drifting while the 1-HR case changed, not to preserve a falsehood.**

⚠️ **It needed one fact the FE did not have.** `BookingDTO.course` carries `leaveRemaining` and `adminUnlocked` (both required), but **`dtoToBooking` is an allow-list** — its own comment says a field reaches the UI only if it is mapped — and neither was. So the row now carries `courseLeave: { remaining, adminUnlocked } | null`, **as sent**. 🚫 **No BE change, nothing derived in the mapper** (pinned: the mapper must not contain `leaveRemaining > 0`).

## A§2 The rule, now three outcomes from two facts
```
no course id                         ⇒ leaveMsgNoCourse      (nothing claimed)
course, and quota gone & not unlocked ⇒ leaveMsgCourseLocked  (NEW — nothing spent, nothing added, still locked)
course, otherwise                    ⇒ leaveMsg              (today's words, BYTE-IDENTICAL)
```
🔑 **The locked sentence is said only when we POSITIVELY know the quota is gone.** An older payload with no leave facts keeps today's course words: **it is not "claiming least" to swap one pair of claims for another on a guess** — that would be this task's defect committed in the opposite direction. Mutation **A4** is exactly that mistake, and it bites.
✅ **An admin unlock restores the truth** (`remaining: 0, adminUnlocked: true` ⇒ today's words), because the server's own condition says so — pinned, and **A2** proves dropping the unlock bites.

## A§3 The words (📝 DRAFT, pinned by absence)
> *"This session is recorded as leave. The course has no leave left, so no leave quota is used and no make-up session is added — **rescheduling stays locked until an admin unlocks it**. The coach and the admins are told."*

🔑 **It borrows the vocabulary of the toast that follows it** (`booking.leaveLockedTitle` — *"rescheduling locked"*), and that pairing is pinned in **both** languages. 📌 **The dialog and the outcome must not be two descriptions of one event** — an admin who reads *"locked"* in the dialog and *"locked"* in the toast learns one thing; two phrasings would read as two problems. And the sentence **names what to do next**, which the no-course body had no need to (**A7** bites when that clause goes).

## A§4 🔑 Break-and-watch — `BASELINE=` (md5), `try/finally`, CHECKSUM verified
```
BASELINE= leave-claim.ts   02b79b163e2cb70e88cb32248683573e
          mappers.ts       7721e3b6f0fd62c3b9a185ffc6a938f9
          dictionaries.ts  3b57cbeb594fac8bb5fe1b376d1ab123
```
| # | mutation | caught |
|---|---|---|
| A1 | the over-quota row gets the quota + make-up promise back | ✅ |
| A2 | the **admin unlock** is ignored (an unlocked course reads as locked) | ✅ |
| A3 | the boundary slips to `>= 0` (0 left reads as having one) | ✅ |
| A4 | **an older payload with no leave facts is GUESSED as locked** | ✅ |
| A5 | the mapper **derives** instead of carrying, and drops the unlock | ✅ |
| A6 | the locked body promises a make-up after all | ✅ |
| A7 | the locked body stops naming what the admin must do next | ✅ |
| A8 | the Thai locked body promises the quota spend | ✅ |
| A9 | the ordinary **within-quota** course sentence drifts | ✅ (my §2 pin **and** TASK-518's) |

All nine bite; none slipped; **CHECKSUM: every file back to baseline.**

## A§5 Verification
**670 pass / 0 fail across 71 files in 3.3 s** (was 665 ⇒ **+5**) · **`tsc --noEmit`: 0** · **`bun run build` ok** · the within-quota course dialog, the leave act, and the Undo control are all unchanged.

🚫 No BE change · 🚫 no deploy request. ⏸️ **Residual (2) stays with TASK-542** — once `plannedAtCreation` is on the DTO it is one more branch here (make-up appended, **no quota charged**), and I will take it as an addendum the same way. 📋 **Both new sentences are drafts**; the pins are on the shape of the claim, so the owner can rewrite every word without unpinning the promise.

---

# ✅ ADDENDUM DONE — REVIEWED by @Sober (2026-09-28). **TASK-541 is complete.**
Verified: **670 pass / 0 fail** · tsc 0 · build ok.

🔑 **"The locked sentence is said only when we POSITIVELY know the quota is gone"** — and the reason is the one I would have wanted argued: **no leave facts ⇒ today's words, because swapping one pair of claims for another on a guess is this defect in the opposite direction.** ✅ **And that is a MUTATION (A4), not a comment** — the failure mode of her own fix, pinned against.
✅ **An admin unlock restores the quota-and-make-up truth, mirroring `canTakeLeave`** — **the dialog follows the rule rather than a second copy of it.**
✅ **The new body reuses the TOAST's own vocabulary** (*rescheduling locked*), pinned in both languages — 🔑 *"the dialog and the outcome must not read as two problems."* **That is the sort of thing nobody asks for and everybody notices when it is missing.** And it **names what the admin must do next**, which is the difference between telling someone a rule and telling them their options.

## 🔴 Her side-finding is a class, and it is the mirror of TASK-542
**`dtoToBooking` is an ALLOW-LIST, and neither `leaveRemaining` nor `adminUnlocked` was mapped — although `BookingDTO.course` has carried both all along.**
🔑 **So: TASK-542 is "the server never sent it"; this is "the server sent it and our own mapper dropped it silently."** ⚠️ **And the compiler will not say**, because an allow-list that omits a field is indistinguishable from one that never had it.
📌 **Three dialogs were wrong because a screen could not see a server-side fact — and now we know at least one of those facts was arriving and being discarded on our side of the wire.** ⇒ **TASK-543: make the dropped set VISIBLE**, so a field the mapper does not carry is **a decision someone took** rather than an omission nobody can see.
✅ **And she carried `courseLeave` AS SENT, deriving nothing in the mapper, pinned by absence** — exactly right: **a mapper that computes is a second place the rule lives.**
