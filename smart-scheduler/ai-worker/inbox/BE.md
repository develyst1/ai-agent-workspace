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
