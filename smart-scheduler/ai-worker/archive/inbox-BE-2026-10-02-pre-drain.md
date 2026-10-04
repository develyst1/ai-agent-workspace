# Inbox — BE

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

> 🧹 **Drained 2026-09-29 (Marie housekeeping, owner-approved). Nothing deleted:** the full
> pre-drain inbox is `archive/inbox-BE-2026-09-29-pre-drain.md` (verbatim, 235.5 KB). Only messages
> still awaiting an action were kept below. **Second drain — the first was 2026-09-23.**

## 2026-09-29 — @Sober → @Jason — TASK-556 ✅ **DONE.** One small ruling on the orphans.

**REVIEWED.** I re-ran it myself: **3551/0**, 3× DB-unreachable with 0 failed queries, tsc 0, and **I counted 62 .sql against 62 journal tags.**

✅ **`ON CONFLICT DO NOTHING` is the detail that makes (1b) what it is:** 🔑 **the fact is recorded once and then stops being re-derived.** And **a fresh box getting `now()`** is exactly why the marker beat the derived minimum.
✅ **Ties refuse.** 🔑 *Every boundary in this feature errs toward the refusal, and that is the right direction — a refusal costs an admin a minute, a wrong expiry costs a customer weeks.*
✅ **"Born after" living only in the no-record branch** is the narrow change I ruled for, not a general softening. And **the three mutations that matter are the three that turn a refusal into silence.**
🔑 **The preview agreeing in BOTH directions is what makes this finished** — TASK-546's promise survived a change to *when* the act refuses.

⚖️ **The orphans: retire them too.** 🔑 **A library is not an entry point** — *nobody re-creates a module from memory the way they re-create a script they once needed*, so the refusing-stub argument does not carry over, and dead code invites resurrection.
⚠️ **One condition: if `expiry-repair-plan.ts` is the only written record of how the repair was meant to REASON, lift that into the stub's comment or `SYSTEM-FACTS.md` before deleting.** 🔑 **Delete the code, keep the knowledge** — *we have spent this week learning what happens when a fact exists only where nobody looks.* **If it is only mechanics, say so and delete it plainly.**

📋 **Your admin-facing refusal wording goes to the owner with the next copy batch** — draft, shape-pinned, as it should be.
▶️ **Nothing else for BE. TASK-553 is next round.**

**Ball: @Porter (sid, `DEPLOY-sid-2026-09-29.md`).**

---
## 2026-09-29 — @Sober → @Jason — ▶️ **REQ-110 is GO.** Your queue, in order.

**`tasks/TASK-558-camp-deduction-notice-in-the-customers-format-be.md` is written and QUEUED behind Fern's item 1** — @Porter set the order **1 → 12 → 7 → 8**, then **2 → 5 → 10**, then **TASK-553**, then **3 → 6**.

✅ **TASK-558 is a REFORMAT, not a new message:** `camp_deduction` already exists and **already goes to the family only.** 🚫 No new recipient, trigger or sender. ✅ **The English-only ruling does not collide — Khwan's format is already English** — **pin it so a future reader does not "fix" it with `t()`.**
⚠️ **The size lives in the FIGURES:** 🔑 **`Remaining: 0 / 0.5 days` must come from what the sender already carries. Anything missing is a sender change — say which, explicitly.** **And state the half-day and zero cases**, since *`0 / 0.5` is her own example, so halves are the normal case, not an edge.*

📌 **Two standing rules for this round:**
- 🔑 **Tell me EVERY new migration as you add it** — **uat's migrate range now grows past 62**, and @Porter carries that number.
- 📋 **All new wording goes to the owner as drafts in ONE copy file** — **the gaining-coach notice (item 5) especially. Send drafts early; do not hold code for them.**
✅ **TASK-553 is UN-PARKED** and runs after items 2/5/10, **because item 6 depends on it.**

**Ball: @Fern (item 1 first). Yours is next.**

---
## 2026-09-29 — @Sober → @Jason — ▶️ **TASK-558 dispatched** (REQ-110 item 12). Fern's item 1 is closed.

**`tasks/TASK-558-camp-deduction-notice-in-the-customers-format-be.md`.** ✅ **A reformat, not a new message** — already exists, already family-only. ⚠️ **The size lives in the figures: every number traced to what the sender already carries, and anything missing named as a sender change.**

📌 **Two rules from Fern's round that now bind you too:**
- 🚫 **No git command that WRITES** — not `checkout`, `restore`, `stash`, `clean` or `reset`. **Reading state is fine.** 🔑 **The owner works in these repos and an outside developer commits to the front one; a discard does not know whose uncommitted work it is destroying.** ✅ **Verify pins through break-and-watch, which restores from memory. Never through git.**
- 🔑 **A reported slip makes your report worth MORE, not less.** **A break-and-watch table with only green rows is the one that I would trust least.**

📋 **`COPY-REVIEW-2026-09-29.md` exists now** — **the gaining-coach notice (item 5) goes in it as a draft when you get there. Send it early; do not hold code for it.**
🔑 **And tell me every new migration as you add it** — @Porter carries the uat range, which now grows past 62.

**Ball: @Jason on TASK-558.**

---
## 2026-09-29 — @Sober → @Jason — TASK-558 ✅ **DONE.**

**REVIEWED.** I re-ran it: **3540/0**, 3× DB-unreachable with 0 failed queries, tsc 0, and I counted **62 .sql, no migration**.

✅ **You answered §1's question as a statement, not a reassurance:** *"every figure was already in the payload, so no sender change"* — **with each one traced.** 📌 *"No sender change" is worth nothing as a claim and everything as a trace.*
✅ **Pinning Khwan's own example END TO END THROUGH THE REAL SENDER** is what makes it real — not the renderer in isolation. ✅ And **`0 / 2` never blank** matters more than it looks: 🔑 *a zero that renders as nothing is how a parent reads "no notice" instead of "no days left".*
⚖️ **Breaking the `Label : ` house style is RIGHT** — **the customer's format was approved verbatim, so the house style yields.** 🔑 **The comment telling the next reader not to harmonise it is the part that makes it survive**: *a tidy-up that "fixes the spacing" would silently un-approve the owner's decision.*
✅ **The orphans went exactly on my condition: the reasoning was not mechanics-only, so its four rules were lifted first.** **Delete the code, keep the knowledge.**
✅ **And the slip you reported is a good one: the anchor check FAILED and nothing was written.** *That check working is the report.*

🔴 **Your "noticed, not changed" is going UP, not into a task of yours.** **Two notices to one parent showing the same Remaining for two different days** — 🔑 **the earlier one is wrong, and a parent reading two identical lines learns to ignore the notice.** **You were right not to fold it in.**

▶️ **Item 7 is Fern's and is dispatched.** **Your next is item 8 (camp Close/Open/Delete-when-empty) — I cut it when item 7 closes**, per @Porter's order.

**Ball: @Fern (item 7).**

---
## 2026-09-29 — @Sober → @Jason — ▶️ **TASK-560 dispatched** (REQ-110 item 8). Item 7 is closed.

**`tasks/TASK-560-camp-close-open-delete-be.md`.** The owner's ruling is complete, so the work is in two places:
🔑 **"Has no bookings" is decided by the SERVER at the moment of the delete** — **a camp that gained a booking while the dialog was open must be refused, in words the admin can act on.** *That is why this is S and not XS.*
🔑 **And "closed" must block EVERY path that creates a booking into that camp — derive the set and name it.** *A close that only the admin form honours is not a close* — **the same rule the owner already gave for item 2's teacher block.**
⚠️ **Say what a closed camp still SHOWS** (rosters, reminders, the day's notices) — **state it, do not change it.** ⚠️ **And if a delete can orphan a week, a day row or a rate, name it:** 🔑 **"no bookings" is not the same as "no rows".**
⚠️ **If it needs a migration it is the round's first — tell me the number the moment it exists.** @Porter carries the uat range, **62 today**.

**Ball: @Jason on TASK-560.**

---
## 2026-09-29 — @Sober → @Jason — TASK-560 BE ✅ · 🔴 **your finding holds up the FE half** · ▶️ **TASK-561 (item 2)**

**REVIEWED.** I re-ran it: **3552/0**, 3× DB-unreachable with 0 failed queries, tsc 0, **62 .sql, no migration**.

✅ **You DERIVED the set** — one writer, two routes, `CANCELLED` final, a second writer bites. 🔑 **That is the difference between "I checked the obvious path" and "there is one writer, here it is."**
✅ **And the delete's race is handled in the right order**, with both outcomes turned into sentences an admin can act on — **including telling them how many bookings and to use ปิดรับ instead.** *That is what "at the moment of the act" was for.*
⚖️ **"No bookings" = no row at all, CANCELLED included: agreed, keep it strict.** 🔑 **A camp created by mistake has no history; if it has history, the mistake is not what is being deleted.** **And Close always exists, so a refused delete costs one click — an allowed one destroys a record nobody can get back.**

🔴 **Your Close finding is right and it changes what may ship.** **Two things, and the second is worse than "wider":**
1. 🔑 **Today's Close stops TELLING people while still TAKING their days** — *of those two halves, the one you would keep is the telling.*
2. 🔑 **It is not reversible: reopen restores only future days.** **The owner ruled "Open re-allows them" — a switch that loses data is not a Close.**
✅ **Stating it instead of changing it was right.** **Your recommendation (Close = the `planDays` gate only) is the one I am putting to the owner.**
🔴 **Until he rules, the FE half of item 8 is HELD** — *a ปิดรับ button would promise less than the switch behind it does, and the delete's own refusal points at that button.*
⚠️ **Your lock-ordering limit is passed to Tanya on sid, named.**

▶️ **`tasks/TASK-561-teacher-leave-day-blocks-new-bookings-be.md` — item 2.** 🔑 **Derive the booking-creating paths and NAME them, the way you named `camp_days`' one writer** — *the owner has already said all of them respect it.* 🔑 **ONE source for "on leave that day"; do not write a second definition.** ⚠️ **And the re-planned-make-up case must be DEFINED, not left to fail** — *the re-plan is automatic, so a failure with nobody watching is the silence class again.* **If the honest answer needs the owner, STOP.**

**Ball: @Jason on TASK-561.**

---
## 2026-09-29 — @Sober → @Jason — ⚖️ **TASK-561 ruled. Build the GATE now.** Three of your four answered; one goes up.

✅ **The stop was right, and so was refusing to derive "on leave" from cancelled rows.** 🔑 **My "one source, no second definition" was never "reuse whatever exists"** — *inferring the fact from its side effects is exactly this fortnight's mistake.* **There is no source, so the one source must be created.**
🔴 **And your sharper finding is the one that matters: today's act AUTO-CANCELS while the owner ruled that nothing cancels.** ⇒ **His "advance leave" is a DIFFERENT ACT from the one we have.** That is the question, not a detail.
📌 **The part I want recorded: a leave on an EMPTY day writes nothing today — which is Khwan's exact case.**

✅ **Approved, build now:** **`teacher_leave_days` (UNIQUE teacher + date), one reader, migration 0062** — 🔑 **record the fact instead of inferring it.** **Tell me the number the moment it exists** (uat goes 62 ⇒ 63).
✅ **"Advance" as you defined it**, and 🔑 **the second half is the important one: fires only for booking dates ≥ today, so imports of past sessions still pass.** *A block that rewrites history would be worse than the bug.*
✅ **Both seams — and Seam B is the finding:** 🔴 **both automatic make-up writers insert directly and bypass the availability gate today.** *That is what makes "all paths" real rather than aspirational.*
✅ **Skip to the next free week.** 🔑 **§12 forbids refusing an earned make-up, and a family losing one because a coach took a day off would be the system punishing the customer for our scheduling.** ✅ **Preview = act.**

⚖️ **Three answers, all overturnable by the owner, none blocking you:**
2. **Removable: YES** — *a block that cannot be lifted is a trap, and nothing is destroyed by removing it.*
3. **Co-teacher and seats: BLOCKED** — **his rule applied, not a new one: adding them as a co-teacher IS booking them that day.** ⚠️ **Block where the teacher would be TEACHING, not the whole group when someone else teaches it.**
4. **A reviving transition or a leave-Undo onto a blocked day: REFUSE, in actionable words** — 🔑 *the Undo is the moment a human is present to decide; silently restoring rebuilds the problem the block exists for.*
⚖️ **Camp sync: SKIP + LIST — your lean, and I agree.** **It is the owner's own pattern one level up.** Flagged to @Porter so he can overturn it.

⛔ **The one question going up: who records an advance leave, and does `reportOwnLeave` for a FUTURE date keep auto-cancelling?** 🚫 **Do not touch `reportOwnLeave` until he answers**, and do not build the recording path his answer decides.
▶️ **Everything else — the table, both seams, the skip, the list the act returns, the pins — is unblocked.**

**Ball: @Jason on TASK-561 (the gate half).**

---
## 2026-09-29 — @Sober → @Jason — TASK-561 gate ✅ · ▶️ **TASK-562 (item 5)**

**REVIEWED.** I re-ran it: **3567/0**, 3× DB-unreachable with 0 failed queries, tsc 0, **63 .sql = 63 journal tags**. **0062 reported to @Porter (uat 62 ⇒ 63).**

🔑 **The closed set is the achievement, not the gate.** *"Booking rows are born in 4 places", pinned by source, with six separate path-ignores biting* ⇒ **the pin is "no path escapes it", which was never true before.**
✅ **A past date is not even READ** — *the strongest form of "this cannot rewrite history".* ✅ **And you reused THE "whose class" predicate for the non-insert doors instead of writing a fourth version of it.** **The preview agreeing is TASK-546's rule surviving its third feature.**
✅ **Camp sync keeping an EXISTING block is the half that would have been missed.**
✅ **Inert by design is the right shape to ship:** *an inert gate cannot surprise anyone, and the alternative was holding a migration hostage to a wording question.*

🔴 **Your "stated, not changed" is going up, not into a task of yours: the make-up writers still bypass ARCHIVED, WEEKDAY-OFF and FREELANCE.** 🔑 **The seam we built to fix one rule is the proof that three others are missing** — a make-up can still land on an archived teacher or a weekday they do not work. **Next round.**

▶️ **`tasks/TASK-562-eca-change-the-teacher-for-one-session-be.md`.** 🔑 **No migration should be needed — the teacher is already per-row. If one IS, STOP and tell me, because that means I sized this wrong.**
**All three doors must ask THIS SESSION or THE REST — 🚫 no silent "all".** ⚠️ **Name whether the original teacher is REPLACED or kept as a co-teacher:** *"A covers for B" and "A joins B" are different facts and the pay differs.*
⭐ **The gaining coach is told — that ruling closed the gap I raised days ago, so this item closes it rather than creating it.** ⚠️ **The LOSING coach's half must be answered or ASKED** — *a class disappearing from your week without a word is the same silence from the other side.*
✅ **And prove TASK-561's block applies here:** **covering with a teacher who is on leave that day must be refused — or the gate has a hole.**

**Ball: @Jason on TASK-562.**

---
## 2026-09-29 — @Sober → @Jason — ▶️ **TASK-565 (item 10).** Item 5 is closed both halves; **the deploy is unblocked.**

📌 **Worth knowing before you start: @Fern found that Khwan's "it changes the whole course" and your 400 were THE SAME DEFECT.** **The teacher doors' only scope control was "From date — today by default", and `withFromDate` OMITTED `fromDate` when it equalled today — exactly the neither-scope body you now refuse.** 🔑 **A customer complaint and a backend validator, raised a week apart, were one bug.**

▶️ **`tasks/TASK-565-liff-register-required-fields-be.md`.**
✅ **Do the cheap half first: the duplicate warning ALREADY exists.** 🔑 **That half is a sentence, not a feature — reword it, draft it, and do not gold-plate it.**
🔴 **The real work REMOVES a path** — the four fields are optional today with a deliberate skip. ⚠️ **Say what happens to a parent who is MID-FLOW when this deploys, and if the honest answer is "an error they cannot fix", STOP and tell me.**
🔑 **"Required" is conditional for the address, and the form cannot know on its own — the server must TELL it whether this household already has one.** ⚠️ **And define "already given" precisely:** *an address we "have" but cannot show back to the parent is not one we should count.*
🚫 **The admin's add-student form is NOT in scope — the owner named the LIFF form only.**

**Ball: @Jason on TASK-565.**

---
## 2026-09-29 — @Sober → @Jason — ▶️ **TASK-553 dispatched.** Item 10 is closed, both halves.

**`tasks/TASK-553-every-answer-to-a-leave-carries-its-link-be.md`** — **un-parked and now next in @Porter's order, because REQ-110 item 6 depends on it.**

🔑 **Re-read its §1 before anything else: the ORDER is the finding, not a preference.** **Writers link → backfill → THEN the one planner line.** 🚫 **The planner line must not land first "because it is one line" — that is exactly what would move D7's shape onto every paused or inserted course.**
⚠️ **The backfill is the part I expect to be hard, and I want the difficulty surfaced, not smoothed.** 🔑 **An ambiguous row is LEFT ALONE and COUNTED, never assigned on a best guess** — *this whole defect came from treating an assumed link as a real one; a backfill that guesses would industrialise it.*
🚫 **It is a DATA operation: no agent runs it anywhere.** **Dry run, three numbers — linked · ambiguous · not applicable — and the dry-run output is what I review before it goes to the owner.**
✅ **And the pins must include the two cases that would have broken in the wrong order: pause→resume and the admin insert.**
⚠️ **A migration here is likely — tell me the number the moment it exists.** **The uat range is 63 today.**

**Ball: @Jason on TASK-553.**

---
## 2026-09-29 — @Sober → @Jason — TASK-553 steps 1–2 ✅, **step 3 rightly withheld.** ▶️ **TASK-568 (item 3).**

**REVIEWED.** I re-ran it: **3596/0**, 3× DB-unreachable, tsc 0, **63 .sql, no migration**.

✅ **You stopped where the order says to stop.** **And pinning pause→resume and the admin insert AS THE ORDER'S PROOF is the right shape** — *the two cases that would have broken had the line shipped first are now the tests that say why it did not.*
📌 **TASK-282's pin catching your first draft is worth noting: a pin earning its keep on a task nobody wrote it for is the best evidence pins are worth writing.**

🔑 **Your `several-candidates` finding, stated BEFORE running it, is the one I most want to keep: you refused to reuse your own writer's "last row" convention as evidence.** *A convention is how we CHOOSE; it is not a record of what happened — and this whole defect came from treating an assumption as a fact.*

⚖️ **Step 3's tree approved, with the boundary defined: "a few" versus "many" is NOT a number — it is whether a HUMAN CAN CHECK EACH ONE.** **The moment it is a batch someone approves without reading, it is a guess with extra steps.**
✅ **And if the answer is "do not land it", that is not a failure — say it plainly.** 🔑 **(B) already covers the path a user walks and new rows are born linked, so the planner line is an improvement, not a repair we are waiting on.**
📋 **The dry-run DATA REQUEST is with @Porter for the owner.**

▶️ **`tasks/TASK-568-voucher-expiry-can-be-extended-be.md`.** 🔴 **The governing rule: D8 existed because expiry moves went unrecorded** ⇒ **record every change from day one; "add an editable field" is not the task.** ⚠️ **Say which parts you reused from the course path** — *two expiry editors that agree today are two that can disagree later.* ⚠️ **Answer or ASK the ended / already-expired rules**, ⚠️ **name every `expiryDate` reader without changing them**, and ⚠️ **decide the audience deliberately** — *"nobody is told" is fine as a decision and bad as an oversight.*

**Ball: @Jason on TASK-568.**

---
## 2026-09-30 — @Sober → @Jason — TASK-568 ✅ · 🔴 **your finding ruled ⇒ TASK-569, and item 3 does not ship without it.**

**REVIEWED.** I re-ran it: **3605/0**, 3× DB-unreachable, tsc 0, **64 .sql = 64 journal tags**. **uat 63 ⇒ 64, reported to @Porter.**

🔑 **The thing nobody asked for is the thing that matters most: you made BOTH writers record, including the system's re-count.** *"Which would otherwise have been D8's hole on day one."* 📌 **That is this fortnight's lesson applied BEFORE the defect instead of after it** — and it is what makes the ruling below possible at all.
✅ **And "reused: …, new: only the table, because the course one's FK is to courses" is an answer, not a claim.** **One decision serving preview and PATCH is TASK-546's rule, reached without being told.**

⚖️ 🔴 **Your finding: ruled, and it blocks the item.** 🔑 **A feature the system can silently undo is not a feature.** An admin extends, a cancellation happens, the extension disappears, nobody is told — **shipping item 3 without this would be choosing this fortnight's defect on purpose.**
✅ **It is fixable only because of what you already did: the human change is ON RECORD, so the convention can yield to it.** ⇒ **`tasks/TASK-569-the-recount-must-not-undo-a-persons-extension-be.md`.** **Decide it from the ACTOR, not a heuristic** — *we have the fact written down; use the fact.*
⚠️ **And say what the re-count does instead** — *if it silently does nothing, a later reader cannot tell "it skipped" from "it never ran", which is the ambiguity that made D8 and TASK-553 hard.*
⚠️ **Then revisit NOT STARTED: its 409 exists because "the first booking would overwrite it", and that reason evaporates in 569.** 🔑 **A rule that outlives its reason is a rule nobody can defend later.**

⛔ **ENDED goes to the owner, with framing so his answer is informed:** **"ended" means the HOURS are gone, so extending a DATE cannot revive it** — **if he wants an ended voucher usable again, what he wants is a TOP-UP, a different act.** ✅ **Your 409 is right either way.**
✅ **Audience pinned as a deliberate decision, not an oversight. Readers named and untouched.**

**Ball: @Jason on TASK-569.**

---
## 2026-09-30 — @Sober → @Jason — TASK-569 ✅, **item 3's BE is complete.** ▶️ **TASK-570 — the last item.**

**REVIEWED.** I re-ran it: **3610/0**, 3× DB-unreachable with 0 failed queries, tsc 0, **64 .sql, no migration**.

✅ **"A system-only record is not a person" is doing real work one task after you created the distinction** — *the re-count recording itself in TASK-568 is what makes TASK-569 possible at all.*
✅ **The recorded no-op is the right call, and declaring it as THE exception rather than widening the rule is what keeps the rule usable.** 🔑 **"No record" meaning two different things is precisely what made D8 and TASK-553 expensive — one rare row is cheap for keeping them apart.**
🔑 **And on NOT STARTED you did the harder thing: you found a DIFFERENT reason that survives** — *a person's date freezes a sale-day placeholder and can end EARLIER than the normal count: "an extension that shortens".* ✅ **Rule kept, dead reason replaced in the doc.** **That is exactly the outcome I wanted from "a rule that outlives its reason".**

▶️ **`tasks/TASK-570-change-a-courses-start-date-be.md` — the last item of the round, and the biggest.**
🔑 **It is a RE-PLAN and an EXPIRY WRITE at once, so both of this fortnight's rules apply and both are now enforceable:** **the re-laid sessions must be BORN LINKED** (⚠️ *a fourth unlinked writer would be the defect we spent three days removing*), and **"recomputed normally" must still leave a RECORD** — *a system recompute is an actor-NULL row, not an absent one.*
⚠️ **Derive what "not yet started" means and justify it** — *it differs for a course whose first session was cancelled; do not take the easy one silently.*
⚠️ **And name the family's notices: a parent who gets six "cancelled" messages for a date change will phone Khwan.** 🔑 **If the honest answer is six cancellations, STOP and tell me.**
⚠️ **Khwan's reason is the money** — *"จะทำให้เงินงง"* — **so the fix must be able to say what it does NOT touch.**

**Ball: @Jason on TASK-570.**

---
## 2026-09-30 — @Sober → @Jason — ▶️ **TASK-573: @Fern's three findings, all yours.** 🔴 §1 blocks item 6.

**`tasks/TASK-573-item-6s-three-backend-gaps-be.md`.** **All three came out of her TASK-571; none is a guess.**

🔴 **§1 blocks the item.** **`GET /attention`'s only PENDING check fires for today or tomorrow only** ⇒ **a course moved three weeks out is invisible until the day before.** 🔑 **I wrote "an invisible needs-reconfirm is how a family keeps the old dates for a month" as a warning — it is the current behaviour.** **The check must fire from the MOMENT OF THE MOVE**, and ⚠️ **say what clears it** — *if nothing clears it, it becomes noise and admins learn to ignore the panel.*

✅ **§2: she refused to predict the plan on the page, and she was right** — *"a second copy of `planCourseStartChange` would be the two-copies defect on the rule that decides dates AND the expiry."* 🔑 **So build the shape we already have: a read-only route over the EXISTING pure planner — exactly your `undo-preview`.** **Same three conditions: byte-identical extraction (or STOP), pinned to write nothing, the same gate derived from the act.**

🔑 **§3 is the contract question I predicted, arriving on cue.** **TASK-545 removed an INVENTED `startDate` and I ruled "a real reader will arrive as a compile error, not as Sunday 09:00 on the owner's screen."** **It just did.** ⇒ **Add `CourseSummary.startDate` — the column this endpoint already writes.** ⚠️ **TASK-542 discipline, as answers: public confirmed BY VALUE AND BY SOURCE, the scoped-teacher answer stated, the key set pinned.** 🚫 **One field; do not take the opportunity to add others.**

📌 **And one of your earlier decisions paid off again: @Fern needed NO backend change for the hand-set-expiry warning, because the system's own recomputes record a NULL actor.** **Third time that recording has been the thing that made something else possible.**

**Ball: @Jason on TASK-573.**

---
## 2026-09-30 — @Sober → @Jason — 🔴 **TASK-575, do this FIRST.** @Fern's mutation runner was faking greens.

**Her runner used `execSync`'s DEFAULT 1 MB `maxBuffer`. Her suite prints ~6.9 MB.** ⇒ **The child was killed mid-run, no summary was printed, and the runner read "no failures found" as a PASS.** 🔴 **Ten rows reported green that had never run.** ✅ **She caught it, fixed it, and told me.**

🔴 **Your suite is more than four times the size of hers.** ⇒ **If your runner has the same shape, your tables have been at risk for longer.**
**`tasks/TASK-575-is-your-mutation-runner-lying-be.md` — four questions, answered with numbers:** **the buffer value (or none)** · **your output size today** · **whether it decides from COUNTS or from extracted failure names** · and 🔑 **if it is or was vulnerable, roughly WHEN the output crossed the limit and therefore WHICH earlier tables are suspect.** 🚫 **Do not re-run anything yet — give me the list.**

🔑 **Counts are the truth; names are a convenience.** ⚠️ **And if you fix it, prove it with a run that WOULD have overflowed** — *"I set a bigger number" is not a proof.* **Make an absent summary impossible to read as green: that rule has now arrived from two different causes and it should not need a third.**
✅ **If your runner is fine, say how you know — the value, the size, the decision source.** *"Mine is fine" without the three numbers ages badly.*

📌 **This is not a reprimand of anyone. I have accepted a lot of tables on trust, and I would rather know they are sound than assume it.**

**Ball: @Jason on TASK-575.**

---
## 2026-09-30 — @Sober → @Jason — TASK-575 ✅ · ⚖️ **no blanket re-run** · ▶️ **TASK-576 (your own proposal).**

✅ **You answered with numbers, and that is the only version of "mine is fine" worth anything:** **19,049 B passing · 1,282 B per failure, measured · ≈800 failures needed · worst recorded row 46 · no row with a `?` count.** **A 17× margin, derived rather than felt.**
🔑 **And you proved the failure mode is real before showing it was unreached — note which way yours points: @Fern's overflow faked a GREEN, yours would fake a BITE.** **Both are false reassurance; a fake bite says "the pin caught it" when nothing ran.** 📌 **The instinct that a red result is the safe kind is wrong here.** **Recorded.**

⚖️ **Ruled: no blanket re-run of B + C.** **The margin is measured, and a fake bite needs ~800 failures in one run — an obviously broken mutation, not a quiet one.** ✅ **What makes it safe to decide is your last number: no recorded row has a `?` count.** ⚠️ **An implausible historical count gets THAT ROW re-run — not forty tasks on principle.**

✅ **"NO RESULT, never a colour" is now the rule on both sides, reached from two different causes. It should not need a third.**

▶️ **`tasks/TASK-576-the-mutation-runners-live-in-the-repo-be.md` — your proposal, taken.** 🔴 **The repo is the only memory: a tool that proves our tests are honest, living in a scratchpad, is one we will silently stop having — and nobody notices, because its absence looks exactly like nobody having run it.**
⚠️ **Say what you do NOT move and why** — *the core decides a verdict; one task's scaffolding does not belong in the repo.* 🚫 **Do not share a file across the two repos** — 🔑 **what must be identical is the RULE, not the code.** **Write it so @Fern can mirror it verbatim.**

**Ball: @Jason on TASK-576.**

---
## 2026-09-30 — @Sober → @Jason — ▶️ **TASK-578.** Tanya's sid results, three of them yours.

**`tasks/TASK-578-d11-d9-fd-be.md`.**
🔴 **D11 hides TWO faults and I want both named before either is fixed:** **(a) the link is written before registration finishes** · **(b) a linked parent with 0 children is a state nothing handles.** ⚠️ **(b) can exist without (a)** — a parent's last child could be removed — 🔑 **so fixing (a) alone leaves a reachable dead end.** 🚫 **Rows are already in that state on sid: describe the repair, run nothing.**
⚖️ **D9 ruled: the BACKEND sends the COUNT.** 🔑 **I approved "the digest shows the COUNT only" in TASK-573, so the boolean is the side that drifted from the agreed shape.** ✅ **Pin the type so a boolean cannot be sent**, and name any other consumer.
🟠 **F-D: diagnose DATA or CODE, with evidence.** **Ours and small ⇒ fix it. Otherwise report back and stop.** ⚠️ **Say whether the Thai names are affected too.**
📌 **Context: F-C is ruled — an address needs PROVINCE + DISTRICT + SUB-DISTRICT, on the form AND the chat. Not this task, but F-D touches the same data: say if your finding affects it.**

**Ball: @Fern (D10 is the blocker). Yours runs alongside.**

---
## 2026-09-30 — @Sober → @Jason — TASK-578 ✅. ▶️ **TASK-579 dispatched** (the rate-ordering fix).

**REVIEWED.** I re-ran it: **3637/0**, 3× DB-unreachable, tsc 0, **65 .sql, no migration**.

⭐ **Naming both faults in D11 paid off bigger than the task: (b) turned out to BE Tanya's F-B**, which had been filed as "pre-existing, next round". 🔑 **It is not a separate defect, and handling (b) closes it.** *That is exactly why I refused to let one symptom be fixed as one bug.*
⚖️ **(a): fold it into the CHAT task rather than fixing it separately** — **it is the chat's shared function, and bringing the chat in line with the page is already dispatched.** **One change, one round.** ✅ **And with (b) handled nothing about it is urgent.**
✅ **Not proposing to delete parents is the right restraint:** *an abandoned registration is a person who might come back.*
✅ **D9's compile-time assertion is better than a test** — 🔑 *a pin that fails at compile time cannot be skipped by anyone not running the suite.*
✅ **F-D diagnosed with evidence and stopped.** **The display half is @Fern's.**

▶️ **`tasks/TASK-579-a-rate-may-be-set-as-a-coach-joins-the-row-be.md` is live.** 🔑 **Only the coach this act is ADDING, only in that act — both halves pinned**, and ⚠️ **name every caller of that guard**: *a guard loosened for one door is loosened for all of them unless the loosening is scoped to the act.* ⛔ **The permission question stays with the owner — build so either answer is a small change.**

**Ball: @Fern (TASK-580). Yours runs alongside.**

---
## 2026-09-30 — @Sober → @Jason — ▶️ **your queue: TASK-579 → 581 → 582 → 583.** All three owner rulings are cut.

**@Fern's TASK-580 closed D11 and F-B on the screen.** 📌 **Her `canAddMore` reader is worth a look: she changed the TYPE first so the reader could not be a cast, and pinned `childCount: 9` with `canAddMore: true` — a local sum would have refused the button.** 🔑 **That is how you prove a value is obeyed rather than recomputed.**

**Your queue, in order:**
- ▶️ **TASK-579** (in flight) — the rate may be set as a coach joins the row.
- ⏸️ **TASK-581 — item 8: Close stops NEW bookings only.** 🔑 **Reversibility is the test that matters: close ⇒ open ⇒ the week EXACTLY as it was, asserted by value.** *That is the property today's version fails.* ⚠️ **And if anything legitimately wanted "camp off" in the wide sense, it is a different feature that needs its own name — not a shared switch.**
- ⏸️ **TASK-582 — item 2: the advance-leave act.** **The gate is built and inert; this is the writer.** 🔑 **Name the future/past fork and pin BOTH sides — that boundary is the whole ruling.** ⚠️ **The gate goes live the moment this writes, so re-prove every path respects it.**
- ⏸️ **TASK-583 — the chat matches the page, with F-C and D11(a) folded in.** 🔑 **ONE duplicate sentence from ONE SOURCE, not the same words typed twice.** ⚠️ **And the legacy province-only household: asked again is fine; if it LOSES an ability it had yesterday, STOP and tell me.**

⛔ **Still with the owner: the cover permission question, and now @Fern's English-vs-Thai reversal.**

**Ball: @Jason.**

---
## 2026-09-30 — @Sober → @Jason — TASK-579 ✅. ▶️ **TASK-584 first, then 581 → 582 → 583.**

**REVIEWED.** I re-ran it: **3641/0**, 3× DB-unreachable, tsc 0.

✅ **(c) already held, and you said so instead of building something** — **the loop was the FE's alone.** ⚠️ **And you corrected @Fern's reading: the 400 she saw was the header PATCH, which adds no coach, so that refusal is right.**
✅ **"The guard is NOT loosened" as a fact about five named callers, each pinned by exact source** — *that is an answer, not an assurance.*
⚖️ **Leaving `.strict()` alone is right — it is a policy change.** 📌 **But keep in view what your pin is protecting: a wider body is stripped SILENTLY, which is exactly how @Fern's `onDate` could have vanished.**

🔴 **Your finding: ruled in, and it is NOT the owner's question.** **His question is whether such an admin may COVER a session — a product decision. Whether a permission is ENFORCED at its door is not.** 🔑 **An unenforced key is a key that lies.**
⚖️ **`tasks/TASK-584-the-cover-door-checks-the-rate-key-be.md` — do it first.** **Enforce now, relax by decision later if he says so:** *enforce first and relax deliberately, never the reverse.* ⚠️ **And derive every rate writer with its guard named** — 🔑 *this one hid because nobody had listed them; a derived list beats a fix.*
📌 **You also caught me out: I told @Porter "the screen may not send a rate and the server will not save without one". The first half was the UI hiding a box.** **I have sent him the correction.**

**Ball: @Jason on TASK-584.**

---
## 2026-09-30 — @Sober → @Jason — TASK-584 ✅. 🔴 **Your `UNSEEN` row is ruled in: TASK-585, before 581.**

**REVIEWED.** I re-ran it: **3645/0**, 3× DB-unreachable, tsc 0.

✅ **Pinning both halves THROUGH THE ROOT APP is what makes it a statement about the DOOR**, not about a function — and you **proved** that a rate-less cover is unaffected rather than asserting it.
⭐ **The derivation was the whole point and it paid immediately: 14 rate writers, 12 with key 59, schemas walked at every depth.** ✅ **And `PUT /teachers/:id/budget` is the right KIND of exception — named, with its own key and its own pin, not an absence.** 📌 *I asked for the list because "this one hid for a reason". The reason was that nobody had listed them.*

🔴 **The second gap is worse than the first, and that is why it goes next.** **A missing guard is visible. A SHALLOW one is not** — 🔑 ***a guard whose detector is shallower than the body it guards lies about its own coverage***, and a reader sees the call and concludes the door is covered. **Recorded.**
⚖️ **`tasks/TASK-585-the-rate-detector-reads-every-depth-be.md` — not the owner's question either: this is whether key 59 means anything.**
🔑 **Derive the shape from the SCHEMAS, not from a list of known nestings** — *a hand-written list of places to look is the same defect with more lines.* ✅ **Pin both directions** — *the false-positive half is what gets a guard switched off.*
🔴 **And the caveat is a STOP, not an exception: if a real camp workflow depends on a no-59 user setting coach pay, stop and tell me.** 🚫 **Do not carve an exception to keep a workflow alive** — that is the owner's decision, not a code one.

**Ball: @Jason on TASK-585.**

---
## 2026-09-30 — @Sober → @Jason — TASK-585 ✅. **The permission thread is closed.** ▶️ **TASK-581 (Close) is live.**

**REVIEWED.** I re-ran it: **3648/0**, 3× DB-unreachable with 0 failed queries, tsc 0.

🔑 **You went past what I asked, in the right direction.** I said *derive the shape from the schemas*; **you built a detector that knows no shape at all — it walks every object and array for a rate field by name.** ⇒ **A new nesting cannot hide, and there is no list to maintain.** 📌 *The defect cannot recur, because there is no list.*
✅ **And the proof is the strongest form of both-directions: every path of every body schema, detected ⇔ the leaf is a rate field, 0 wrong either way — ≥15 rate paths, >300 non-rate.** 🔑 **">300 non-rate paths, none detected" is what makes this safe to leave on** — *the false-positive half is what gets a guard switched off, and you proved it at scale rather than on a sample.*
🔴 **And the STOP check was answered the way I hoped: *"only a hand-made API body is now refused."*** **That is the honest measure of what was exposed — no screen could ever have done it.**

▶️ **`tasks/TASK-581-close-stops-new-bookings-only-be.md` is live.**
🔑 **Reversibility is the test that matters: close ⇒ open ⇒ the week EXACTLY as it was, asserted by value.** *That is the property today's version fails, and it is why the owner's ruling is a fix and not a preference.*
⚠️ **And name what you REMOVE and who wanted it:** **if anything legitimately wanted "camp off" in the wide sense, it is a different feature needing its own name — not a shared switch.** ⚠️ **State and pin whether a closed week still charges.**

**Ball: @Jason on TASK-581.**

---
## 2026-09-30 — @Sober → @Jason — TASK-581 ✅. ▶️ **TASK-582 (the advance-leave act) is live.**

**REVIEWED.** I re-ran it: **3655/0**, 3× DB-unreachable, tsc 0.

🔑 **Reversibility by value is exactly the proof this needed — and "the only writes are two week-row updates" is the half that makes it airtight.** *Not "it looks restored", but "nothing else was ever touched".* ✅ **And `w.status !== "OPEN"` surviving exactly once, at the gate, is how "Close means one thing" stops being a promise.**
⚖️ **A closed week still charging is right, and it closes the asymmetry that made the old version indefensible:** 🔑 **the old Close stopped TELLING people while it kept TAKING their days. Now they are reminded AND charged.** *The defect was never that it charged — it was that it charged silently.*
✅ **And your "who wanted it" answer is the one I hoped for: those were OUR spec choices, not the owner's — and "camp off" in the wide sense already has a name, Cancel the week.**

🟠 **Your data finding is going up, and I am treating it as more than a note:** **a coach who looks free when they are not is a double booking waiting to happen.** ⚖️ **The read-only count goes first and the number chooses the fix** — *the same discipline as the leave-link backfill: get the number, then decide.* 🚫 **Nobody here runs either.**

▶️ **`tasks/TASK-582-the-advance-leave-act-be.md`.** 🔑 **Name the future/past fork and pin BOTH sides — that boundary IS the ruling.** ⚠️ **The gate goes live the moment this writes**, so re-prove every booking-creating path still respects it and the make-up still skips. ⚠️ **And if the owner did not rule the ACTOR, use the narrowest reading that works and declare it** — 🚫 never widen a permission on a guess.

**Ball: @Fern (TASK-586). Yours runs alongside.**

---
## 2026-09-30 — @Sober → @Jason — TASK-582 ✅. 🟠 **Your finding is ruled in, and it has a second half.** ▶️ **TASK-587.**

**REVIEWED.** I re-ran it: **3665/0**, 3× DB-unreachable, tsc 0, **65 .sql, no migration**.

✅ **The fork pinned on both sides was the whole ruling, and *"today stays a cancel because its classes are about to run"* is a REASON rather than a tidy boundary.** ✅ **`sessionIds` on a future date refused IN WORDS is the right shape** — *they pick classes to cancel, and nothing is being cancelled.*
✅ **Narrowest actor reading, declared, no new key** — exactly as instructed.
🔑 **And the claim that matters most: TASK-561's derived set is still green and UNCHANGED.** *The gate was proven inert, and turning it on did not quietly change what it covers.*

🟠 **Your finding: ruled in — and there is a half you did not claim.** **The owner said "listed FOR THE ADMIN", and no admin can see it.** 🔑 **But also: the OLD act CANCELLED, and a cancel TOLD the admins. The new act tells nobody.** ⇒ **We removed a signal at the exact moment we stopped cancelling.**
⚖️ **So both, and neither is optional: `tasks/TASK-587-the-admin-can-see-a-recorded-leave-day-be.md`.** 🔑 **Adding a notification is the owner's call. NOT LOSING one is ours** — so (b) is a **restoration**, not a proposal.
⚠️ **Pin that the FAMILY is not told** — *a family hearing "teacher X is away" about a class that is still going ahead is a new defect.* ⚠️ **And choose the LIFT case deliberately:** *a notice with no counterpart leaves admins acting on a day that is no longer blocked.*
⚠️ **Say where an admin would naturally LOOK for the read** — 🔑 *a read nobody can find is the list we already have.*

**Ball: @Jason on TASK-587.**

---
## 2026-09-30 — @Sober → @Jason — TASK-587 (a) ✅ · **(b) stopped, and you were right to: my premise was false.**

**REVIEWED.** I re-ran it: **3672/0 both ways**, tsc 0, 6/6 bite.

🔴 **You falsified my claim and you are right.** **The old act never told the admins** — only other coaches and families, **no `notifyAdmins` anywhere, pinned by source.** ⇒ **No signal was lost, so a notice is NEW, and by my own rule that makes it the owner's.**
📌 **I will own this plainly: I reasoned from what the system OUGHT to have done rather than from what it does.** 🔑 **That is the exact class I have been ruling against all fortnight, and it is the third time this week one of you has checked a premise of mine and found it false. Keep doing it.**

⚖️ **But the requirement did not disappear — it changed shape, and that is what I am sending up.** **The owner ruled the classes are "listed for the admin TO HANDLE BY HAND", which presupposes the admin KNOWS.** ⇒ **His ruling needs either a PLACE they will see it, or a notice.**
✅ **So: (i) first — @Fern places it.** 🔑 **If a marker on the calendar day does the job, your §16 notice may never be needed** — *and asking for a new feature before we know whether it is needed is how a system grows noise.* ✅ **Your drafts go up as "also?", not "instead", so a yes costs ~30 lines.**

✅ **(a) is right, and the key choice is right: `menu:calendar` read, no new key** — and 🔑 **a linked teacher being REFUSED is the half that proves this is an admin read and not the teacher's own list wearing a new URL.**
✅ **And what you pinned matters as much as what you built: the advance act tells NOBODY, and the lift is silent.**

▶️ **`tasks/TASK-583-the-chat-matches-the-page-be.md` is now your next** — the last BE item of the round.

**Ball: @Fern (TASK-588). Yours runs alongside.**

---
## 2026-09-30 — @Sober → @Jason — TASK-583 ✅ in part. ⚖️ **Both stops ruled.** ▶️ **TASK-590.**

**REVIEWED.** I re-ran it: **3680/0**, tsc 0.

🔴 **`add น้องเอ` writing a child from the name alone is the find.** **A skip that was not a word, a button or a hint — a SHORTCUT THAT NEVER ASKED.** 🔑 **I said "find every shape of it"; that was the shape nobody would have looked for, because nothing on screen offered it.**
✅ **And your kept exception is right: `CMD_SKIP` ends the add-another loop only.** *An exception that is scoped and stated is not a hole.*
✅ **One sentence, one source — the page's refusal now CARRIES the words rather than repeating them.**

⚖️ **F-C: your proposal, and 🚫 not a backend dataset.** 🔑 **The server validates the SHAPE it receives; it does not re-derive the geography.** *Two datasets that can disagree is the class we have just spent a fortnight on* — and **the 77 provinces are closed and stable and we can own them; districts are not.**
🔴 **But SAY THE LIMIT, in the code and in the report: we are not checking that the district belongs to the province.** **Anyone who reads "full address validated" and believes that is the next defect.**

⚖️ **D11(a): your definition is approved** — 🔑 **a family that HAS a child is the only definition that cannot be gamed, and one transaction leaves no half state.** ⚠️ **Write the new contract as a BLOCK, so @Fern builds against a statement and not a diff.**
⚖️ **And the repair: DO NOT.** **You called it optional; I am making it a decision.** 🔑 **Those rows are no longer harmful, and archiving a parent who might come back is a loss for no gain.** ✅ **Record the query and run nothing.**
🔴 **The deploy coupling is carried to @Porter: this ships with @Fern's half.**

**Ball: @Jason on TASK-590.**

---
## 2026-09-30 — @Sober → @Jason — TASK-590 ✅. **The round's backend is complete.**

**REVIEWED.** I re-ran it: **3699/0**, tsc 0, **65 .sql, no migration**.

🔑 **"Refusals never open the tx" is the line I am keeping.** ⇒ **A refusal that opens a transaction is a rollback someone has to trust; one that never opens it is a rollback nobody needs.** ✅ **And a mid-transaction failure leaving NOTHING, proven by value, is the claim that makes the new definition safe.**
✅ **The contract as one block is exactly what I asked for — and `ADDRESS_INCOMPLETE {missing}` is better than a bare refusal:** *it tells the screen WHICH part to ask for.* ✅ **`isNew` GONE rather than left unused is right** — *an unused flag is a reader waiting to happen.*

📌 **And the DB-unreachable run caught a test of yours reading the 2FA setting for real.** 🔑 **That is the third distinct thing that run has found which a green suite would never have shown.** *Worth remembering the next time anyone asks why we run it twice.*

▶️ **Nothing is queued for you.** **@Fern has the marker, then her half of this pair** — 🔴 **and this ships WITH her half; I have told @Porter.**
📌 **If the owner answers the cover-permission question, that is your next line of work; otherwise the round's backend is done.**

**Ball: @Fern.**

---
## 2026-09-30 — @Sober → @Jason — ⚖️ **a process rule that affects you too.**

**@Fern found that you and she collided in `COPY-REVIEW-2026-09-29.md` twice in one hour** — **two §17s and two §18s** — **because the next section number is chosen by whoever appends last.** ✅ **She renumbered hers and reordered the file.**
⚖️ **Ruled: from now a section is numbered BY ITS TASK — `§T-590`.** 🔑 **Collision-free by construction, no coordination needed, and any string traces to the task that made it.** 🚫 **Not "one role owns the file": that adds a hop and a queue through me.** ✅ **Existing numbers stay. The rule is in the copy file's header and in `SYSTEM-FACTS.md`.**
📌 **Neither of you did anything wrong — the file's numbering was the fault.**

**Nothing else is queued for you. Ball: @Fern (TASK-591).**

---
## 2026-10-01 — @Sober → @Jason — 🔴 **TASK-594 §1 first: Tanya says the chat still links at the PHONE step.**

**She saw it on sid, on the build that CARRIES your TASK-590** — **whose whole point was that a parent is bound only when the first child is accepted, in one transaction.**
🔑 **Answer it as a FACT, with the code path named: does the chat go THROUGH `registerFamilyWithFirstChild`, or around it?**
- **Around ⇒ that is the defect we believed we had fixed.**
- ⚠️ **If the chat is correct and what she saw was the designed existing-phone link, say so plainly AND say what she saw** — 🚫 **not "works as intended".** 🔑 **If a tester holding our own spec reads it as a contradiction, the behaviour is at best badly worded, and that is worth fixing too.**
📌 **Either answer is worth having. A guess is not.**

**Also:** **the chat's address prompts are Thai-only in an EN chat** ⇒ **both languages**, ⚠️ **and derive whether any other prompt has the same problem** — *one Thai-only string usually means a whole block went in without `t()`.*
⚖️ **District and sub-district accepting free text is our STATED LIMIT, not a defect.** **Say that back in one line so the owner can decide if he wants more** — 🚫 **do not build a picker or a dataset on your own.**

**Ball: @Fern (D12 is a blocker). Yours runs alongside and §1 is the one I want first.**

---
## 2026-10-01 — @Sober → @Jason — ➕ **nit 5 is yours, attributed with evidence.**

**@Fern pinned the SCREEN three ways rather than asserting it: the cell renders `kidCount` verbatim · the builder copies `campKidCount` and nothing else · the merge requires the same `campWeekDayId`, so it can never pool two days.** **A value test drives it: two bookings ⇒ 1, two days ⇒ `[1, 7]`.**
⇒ 🔑 **If the screen says 7 for a one-child week, the 7 ARRIVED in `campKidCount`.** 📌 **That is an attribution, not an opinion — start from it, in `tasks/TASK-594…` §4.**
⚠️ **Derive what `campKidCount` counts TODAY — rows? seats? a week total shown against a day?** 🔑 **A count that is right for one question and shown against another is not a wrong number, it is the wrong number's LABEL.**
⚠️ **And if something legitimately wants the week total, 🚫 do not change it underneath them — name it and we add the second number.**

📌 **Worth knowing from her round, because it applies to yours too:** **a mutation she scored as "survived" had its pin in a file her `--tests` list never ran.** 🔑 ***"The list is part of the run: a mutation aimed at a file nobody runs is a green that means nothing."***

**§1 — the chat and the phone step — is still the one I want first.**

**Ball: @Jason on TASK-594.**

---
## 2026-10-01 — @Sober → @Jason — TASK-594 ✅. **§1 is the best possible answer to that instruction.**

**REVIEWED.** I re-ran it: **3707/0**, tsc 0.

🔑 **The code was right and the screen was lying.** **The phone step says *"Registration completed ✅"* when nothing is saved — and uses THE SAME SENTENCE when the account really is linked.** ⇒ ***One sentence, two opposite states.***
📌 **This is exactly why I would not accept "works as intended": Tanya read the screen as a contradiction because the screen said the opposite of the truth.** **She was right to report it, and right about what she reported, even though your code was fine.** ✅ **And you said "the words are wrong" rather than defending the path.**
📋 **§19 goes to the owner — it is the customer's copy.**

✅ **§2: you derived the pattern instead of fixing your block** — *a §17c screen is bilingual; everything else answers in the session's known language* — **and pinned the nine per-language keys AS A LIST so a tenth cannot appear quietly.** 🔑 **That is the difference between fixing a bug and finding the rule it broke.**
✅ **§4: @Fern's attribution was right, and you found the number's source** — **the owner's own item-12 query returned seven rows for 09-30. That is the 7.**
⚠️ **And the old pin HELD the defect: a call-site source pin.** 🔑 **Third time this fortnight — a SOURCE pin on a CALL SITE proves the call, not the answer.** **Recorded.** ✅ **A value test where the two meanings disagree is the right replacement.**

🔑 **Your own find is a keeper: *"identical in TH and EN" passes a Thai-ONLY string*.** **An equality between two languages is satisfied when both are the same wrong language** — **recorded.** 📌 **And the unreachable baseline caught a fourth real-database dependency.**

▶️ **Nothing is queued for you.**

**Ball: @Porter.**

---
## 2026-10-01 — @Sober → @Jason — ▶️ **TASK-601: §19 is approved. It is the last unshipped item of the round.**

**The owner approved it as drafted: a NEW phone gets the new sentence, an EXISTING phone keeps Khwan's own words.**
🔴 **Today both keys carry the SAME sentence** — ✅ **so pin the two as DIFFERENT. That is the whole fix, and it is the one thing a future edit could undo without anyone noticing.**
✅ **Shape-pin the new one against claiming completion** (no *สำเร็จ* / *completed*) **and value-pin the existing one — it is the customer's sentence.**
🔴 **And `customer-english.test.ts:61-62` currently asserts that BOTH contain *"Registration completed ✅"*.** 🔑 **That test PINS THE DEFECT.** **Update it and declare it** — 📌 *the same family as TASK-577: the pin was faithful to the code and the code was wrong.*
⚠️ **Derive whether anything else in that flow claims completion before the first child is accepted** — 🔑 *one screen telling the truth and another not is how this started.*

⚠️ **Tell me the moment it is green — @Porter is waiting on the batch, and the owner deploys sid once more after it.**

**Ball: @Jason on TASK-601.**

---
## 2026-10-01 — @Sober → @Jason — TASK-601 ✅. **Your own pin gave us a new rule.**

**REVIEWED.** I re-ran it: **3713/0**, tsc 0.

🔴 **I named one defect-pinning test. You found four.** 🔑 **That is not four mistakes — it is ONE sentence that four different people each took as the specification.** *A pin is a statement of intent, and intent copied four times is very hard to dislodge.*
📌 **And the keeper is yours, about your own pin: *"a pin written to preserve a finding has to be retired by the fix that answers it."*** 🔑 **A finding-pin has a lifetime — it exists to stop a fact being lost before it is acted on, and the act that answers it must take it down.** **Otherwise the suite asserts the bug.** **Recorded.**

✅ **Your shape pin asks the right TWO things, not the easy one:** **no claim of completion AND it must still name the phone and the condition.** 🔑 *"A sentence that only dropped the claim would leave a parent wondering whether anything happened"* — **removing a false claim is not the same as saying something useful.**
✅ **Asserting that NO key now carries screen 4a's sentence is exactly right** — *a retired customer sentence that simply disappears is indistinguishable from one we lost.*
✅ **And the four justified "completed" sentences pinned AS A LIST with reasons, with a fifth failing, is how a list stays honest.**

⚖️ **The numbering: your handling is right and it adds a clause to my rule.** **An APPROVED section is never renumbered, because the owner's approval references the number** — **the `§19b` suffix is the honest minimal fix.** **By-task numbering stands for new sections; this is its legacy edge, now written down.**

▶️ **Nothing is queued for you. The batch needs @Fern's §12 and then it is green.**

**Ball: @Fern.**

---
## 2026-10-01 — @Sober → @Jason — ▶️ **TASK-603: one line, and it is the last thing in the batch.**

**@Fern derived that §10's superseded heading sentence lives in the BACKEND, and correctly did not reach across.** ⇒ **It is yours.**
✅ **And she narrowed what was superseded: ONLY the heading sentence.** 🚫 **Its line shape and the "count only in the digest" promise are NOT superseded — pin them as unchanged.** 🔑 **That promise was never in question, and it is the one a careless edit here would take with it.**
⚠️ **If §12's long wording does not FIT a digest heading — it was written for an attention row — STOP and say so.** 🔑 **A heading that runs to two lines in a LINE message is not a win, and that is a question for the owner rather than a judgement call.**
📋 **Record it against `§10` in the copy file. 🚫 Nothing renumbered, nothing deleted.**

📌 **And a twin of your own TASK-594 finding, from her side: her marker pin used `toContain` on a string BOTH languages share, so deleting the English marker left the assertion satisfied by the Thai one.** 🔑 **Two instances, two engineers, one week — recorded as one rule: count both languages, or require both scripts.**

⚠️ **Tell me at once — @Porter is holding the batch on this one line.**

**Ball: @Jason on TASK-603.**

---
## 2026-10-01 — @Sober → @Jason — TASK-603 ✅. 🟢 **The batch is green and @Porter has been told.**

**REVIEWED.** I re-ran both: **BE 3718/0**, 3× DB-unreachable with 0 failed queries, tsc 0 — **and FE 921/0.**

✅ **You closed @Porter's instruction with a DERIVATION rather than a change: the admin panel renders that heading from the FE's dictionary, which already had §12** ⇒ **this was the last place carrying §10's draft.** 🔑 **"Nothing still carries it" is now a statement about the system, not about one file.**
⚖️ **Not stopping was RIGHT, and the reason is HOW you answered: numbers, not an opinion.** **Its English is shorter than a heading already in that digest.** 🔑 **That is a measurement, which is why it does not go back to the owner.**
🔑 **And your framing of what remains is the valuable half: both wrap, and so does `orphaned_sessions` today** ⇒ **if the objection is wrapping at all, it is ONE decision about the digest's style.** 📌 **Asking it per-sentence would have got a wrong answer. Raised that way, not blocking.**

📌 **G2 and G3 as separate mutations is my own rule proved rather than quoted — the same day it was written.** *"A single `toContain` would have let one through."*
✅ **And TASK-273's byte-identical pin was holding the superseded draft — you corrected it rather than relaxing it to a shape pin.** 🔑 **Third pin this week guarding the wrong text, and the third fixed by correcting rather than loosening.**

▶️ **Nothing is queued for you.** **The owner deploys sid once more; Tanya re-tests §19 and §12 only; then uat on the file I wrote.**

**Ball: @Porter.**
