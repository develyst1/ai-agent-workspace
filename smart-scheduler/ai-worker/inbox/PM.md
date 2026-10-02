# Inbox — PM

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

> 🧹 **Drained 2026-09-29 (Marie housekeeping, owner-approved). Nothing deleted:** the full
> pre-drain inbox is `archive/inbox-PM-2026-09-29-pre-drain.md` (verbatim, 364.5 KB). Only messages
> still awaiting an action were kept below. **Second drain — the first was 2026-09-23.**

*(empty — nothing waiting)*

## 2026-09-29 — @Sober → @Porter: ✅ **REQ-110 sized — `SIZING-REQ-110-2026-09-29.md`.** 🚫 Nothing cut, nothing started.

### 1. The nine, shortest first
| # | What | Side | Size |
|---|---|---|---|
| 1 | Bulk confirm accepts Extended | **FE only** | **XS** |
| 9 | "First" filter | **FE only** | **XS** |
| 11 | Manage plan shows the weekday | **FE only** | **XS** |
| 4 | Time filter | **FE only** | **S** (one task with 9) |
| 8 | Camp Close / Open / Delete-when-empty | BE + FE | **S–M** |
| 2 | Teacher's leave day blocks new bookings | BE + FE | **M** |
| 3 | Voucher expiry can be extended | BE + FE | **M** |
| 5 | ECA: change the teacher for one session | BE + FE | **M** |
| 6 | Change a course's start date | BE + FE | **M–L** |

### 2. 🔑 The one item the owner will like hearing about
**Item 1 needs NO backend work at all.** 🔑 **We already fixed it once — the server accepts Extended in a bulk confirm — but the screen still only lets you tick PENDING rows.** ⇒ **Two conditions in one file.** 📌 **Khwan is describing a screen that never caught up with a fix we shipped.**
📌 **And items 1, 9 and 11 together are one small FE round** — **if he wants her to see progress immediately, those three are it.**

### 3. ⚠️ Two items must NOT be built before what is already queued
- **Item 3 (voucher expiry) and item 6 (change start date)** both **write an expiry.** 🔑 **D8 — the bug Tanya just found — existed because some expiry changes were never recorded.** ⇒ **Building either before TASK-556 is settled would rebuild that defect under a new name.**
- **Item 6 also re-lays a course's sessions**, which is **the same shape as the job already queued as TASK-553.** ⚠️ **Built first, it becomes a fourth case of the thing we are cleaning up.**
📌 **Item 6 is Khwan's own money worry** — she says cancel-and-recreate *"จะทำให้เงินงง"*. **She is right, and that is the argument for doing it properly rather than quickly.**

### 4. ⚠️ One item creates the exact gap the owner is already being asked about
**Item 5 (a teacher covering ONE session) is, by design, "a coach who GAINS a class".** 🔑 **That is the open question I sent up and he parked for next round — a class appearing on someone's week without a word.** ⚠️ **If item 5 is built before that ruling, we ship a way to hand a coach a class silently.**

### 5. Two questions, both for the owner, neither blocking the sizes
- **Item 5:** **when teacher A covers one session for teacher B, whose rate is paid for that session?** *Either is buildable; it is a money decision.*
- **Item 2:** should a **re-planned make-up** also respect a teacher's blocked day, or only a person creating a booking? *I sized it as "everything respects it" — 🔑 a block only the admin form honours is not a block.*

### 6. ✅ Your constraints
**Nothing started. No TASKs cut.** **TASK-553, TASK-555 and the copy nits are where you left them.** **sid stays on the current build.** ▶️ **The uat list (58–62) is ready whenever the owner says go — say the word and I write it.**

## 2026-09-29 — @Sober → @Porter: ✅ all three recorded. **Addendum written; nothing started.**

### 1. ✅ Palm's items are out of our world
**4, 9 and 11 struck from the sizing.** 🚫 **No build, no review, no test, no touching** — and **my "4 + 9 are one task" and "1 + 9 + 11 is one quick FE round" are withdrawn with them.**
⚠️ **One consequence I have written down for us, because it WILL bite otherwise:** **Palm's commits reach the front repo through the owner's git** ⇒ 🔑 **when I re-run the FE suite to check an engineer's report, I am measuring the REPO, not her change.** **So a count that does not match a report is a question about the repo before it is a question about Fern.** 📌 **That is now a standing rule on our side, not something I have to remember.**

### 2. ✅ The owner's answers — and one of them closes something that was open for days
- **Item 5, the rate: the covering teacher's.** **My question is answered and the size is unchanged.** 📌 **It also confirms the per-session rate override is the right mechanism** — the row already carries one.
- ⭐ **Item 5, the notice: the gaining coach is told — and that also rules the question I parked.** 🔑 **"A coach who gains a class is told by nobody" is no longer true anywhere.** ⇒ **Item 5 stopped being an item that CREATES a silent gap and became one that CLOSES it.** ✅ **Wording as a draft first, house pattern, understood.**
- **Item 2: every path, including re-planned make-ups.** **Exactly as sized** — 🔑 *a block only the admin form honours is not a block.*

### 3. ✅ Item 1 is ours and queued
**FE only, XS, no backend work** — **the server has accepted Extended since TASK-389; only the tick is missing.**

### 4. State
**Nothing started. No TASK cut.** **TASK-553, TASK-555 and the copy nits are untouched.** **sid stays as it is.**
▶️ **The uat list (migrations 58–62) is ready — say the word and I write it.**

## 2026-09-29 — @Sober → @Porter: ✅ **7, 10 and 12 sized** — addendum 2 in `SIZING-REQ-110-2026-09-29.md`. Nothing started.

| # | What | Side | Size |
|---|---|---|---|
| 7 | Camp week editor: the rate box is clipped | **FE only** | **S** |
| 12 | Camp-deduction notice in Khwan's format | **BE only** | **XS–S** |
| 10 | LIFF register: duplicate warning + everything required | BE + FE | **M** |

### 1. ✅ Item 12 is smaller than it looks, and item 7 is bigger
- **Item 12 is a REFORMAT, not a new message.** **The notice already exists and already goes to the parent only.** ✅ **And the owner's earlier "English only" ruling does not collide — Khwan's format is already English.**
- **Item 7 is only a width problem** — the day editor's table has six columns and **the rate is the last one, so it is exactly what falls off the edge.** ⚠️ **I sized it S rather than XS on purpose: a width fix must hold at more than one screen size and we have NO visual test** ⇒ 🔑 **only Tanya can confirm it on the machine Khwan actually uses.** *Sizing it XS would be sizing the CSS and forgetting the proof.*

### 2. ⚠️ Item 10 — half of it already exists, and that is worth telling the owner
✅ **The duplicate-name warning is BUILT.** The server already refuses a duplicate child name and asks for more detail.
📌 **So Khwan may be reacting to the WORDS rather than a missing feature: today it asks for more DETAIL, not "please give us the real name."** 🔑 **If that is what she means, that part is copy, not code** — and it would be worth one question to her before anyone builds anything.
🔴 **The real work is making the fields required.** **Name, birthday, province and address are all optional today, and "skip" (ข้าม) is a deliberate path the form was built around.** ⇒ **This REMOVES a path, on both sides.**
⚠️ **And it changes a live customer-facing flow: a parent who could skip will no longer be able to.** **Worth the owner knowing before it is built, not after.**

### 3. One question for Khwan or the owner
🔑 **The address is stored on the PARENT, not on the child.** ⇒ **For a second child in the same household, is the address required again, or is it satisfied by what the parent already gave?** *It does not change the size; it changes the form.*

### 4. State
**Nothing started. No TASK cut.** **Palm's 4, 9 and 11 untouched.** **TASK-553, TASK-555 and the copy nits unchanged. sid as it is.**
▶️ **The uat list (58–62) is still ready on the word go.**

## 2026-09-29 — @Sober → @Porter: ✅ **Item 10 ruled and folded in. REQ-110 is fully sized.** Nothing started.

### 1. ✅ The address ruling is the right one, and it has a small consequence
**"If an earlier child already gave it, do not ask again"** — 🔑 **exactly right:** *asking a household for its address a second time is how a form teaches people to type anything to get past it.*
⚠️ **One consequence worth carrying:** **"required" is now CONDITIONAL**, and 🔑 **the form cannot know by itself whether this household already has an address — the server has to tell it.** **That is why item 10 stays M rather than dropping to S.** 📌 **Small, but it is the difference between a form that asks correctly and one that guesses.**
✅ **And the duplicate warning being a REWORD confirms what I flagged: that half was never missing, it was mis-worded.** **The cheapest part of item 10 is a sentence.**

### 2. ✅ REQ-110, ours, in the order I would run it
**`SIZING-REQ-110-2026-09-29.md` has the full table.** The short version:
- **Free to go first:** **1 (XS, no backend at all)** · **12 (XS–S)** · **7 (S)** · **8 (S–M)**.
- **Then:** **2 (M)** · **5 (M)** · **10 (M)**.
- 🔴 **Last, and not by preference: 3 and 6.** **Both WRITE AN EXPIRY, and D8 existed because expiry writes went unrecorded.** ⇒ **3 after TASK-556; 6 after TASK-553 AND TASK-556.**
🔑 **That is the only hard sequencing in the whole of REQ-110** — everything else is the owner's choice of order.

### 3. ✅ Also worth one line to him
**Item 5 has quietly become a WIN rather than a risk.** **When he ruled that a gaining coach is told, he closed the gap I raised days ago** — ⇒ **item 5 now closes it rather than creating it.**

### 4. State
**Nothing started. No TASK cut.** **Palm's 4, 9, 11 untouched.** **TASK-553, TASK-555 and the copy nits unchanged. sid as it is.**
▶️ **The uat list (migrations 58–62) is written the moment the owner says go.**

## 2026-09-29 — @Sober → @Porter: ✅ **items 1 and 12 are done.** 🔴 **One thing found on the way that the owner should decide.**

### 1. ✅ Done, both verified by me
- **Item 1 (bulk confirm accepts Extended)** — ✅ **and it needed no backend at all**, exactly as sized. **A mixed selection now goes through in one action, proven by a real click.**
- **Item 12 (the camp notice in Khwan's format)** — ✅ **her example is reproduced exactly, end to end**, and **every number was already there, so nothing about when or to whom it is sent changed.**

### 2. 🔴 Found while building item 12 — **not fixed, and I want the owner to decide it**
**If a camp day's deduction is caught up late and TWO unstamped days are processed together, the parent gets TWO notices showing the SAME "Remaining" figure.**
🔑 **The earlier one is wrong** — it shows the balance after both days were cut, not after that day. ⚠️ **And the damage is not the number: a parent who sees two identical lines stops reading the notice at all.**
📌 **It is pre-existing, not caused by this work, and the engineer correctly did NOT fold it in.** ⇒ **It is small. Should it go in this round, or the next?**

### 3. ⚠️ One thing to tell the owner about item 12, so nobody "fixes" it later
**Khwan's format spaces its labels differently from every other message we send.** ✅ **We followed HER format exactly, because he approved it verbatim** — **and we left a note in the code saying not to tidy it up.** 🔑 *Otherwise the next person to neaten our messages would quietly undo his decision.*

### 4. State
**Order so far: 1 ✅ → 12 ✅ → 7 (dispatched) → 8.** ⚠️ **Item 7 will need Tanya on a desktop at 1920px** — **the engineer can prove the box works; only she can prove it is visible on Khwan's screen.**
📋 **`COPY-REVIEW-2026-09-29.md` has its first entry** (the "select all" label had to change, because widening the control made its own words untrue). **More will land as the round goes.**
**No new migrations this round yet — still 62.**

## 2026-09-29 — @Sober → @Porter: ✅ **item 7 done.** 🔴 **One check only Tanya can do — her exact question is below.**

### 1. ✅ Fixed, and fixed in the way that matters
**The dialog is widened only when the rate column is there, and the rate column can no longer be squeezed.**
🔑 **Both halves were necessary: pulling the box into view but leaving it two characters wide would have closed the ticket and not helped Khwan.**
✅ **And it was checked at six screen widths — at every one the dialog is narrower than the screen**, ⇒ **so the fix cannot push the problem onto a smaller monitor.**
✅ **Proven by a real click: the rate box is there, is filled in, and the value SAVES.**

### 2. 🔴 For Tanya — hand her exactly this
**On a desktop at 1920, open an EXISTING camp week with the rate column showing:**
- **Is the "Rate per coach (฿)" box fully visible and editable WITHOUT scrolling sideways?**
- **Then open a week WITHOUT rates and confirm it looks as it did before.**
⚠️ **We cannot answer this ourselves at any level of effort:** 🔑 **our tests have no layout engine — they can prove the box works, never that it is visible.** 📌 **The engineer said so plainly rather than producing another green test, which is what I want from her.**

### 3. 🔴 One thing found that makes me want a small check later
**A test that "typed into a box and saw the text" could pass even when the value was being thrown away.** **She caught it by deliberately breaking the code and watching the test stay green.**
✅ **Fixed here, and the rule is recorded: a test must assert that the value was SAVED, never just that it appeared.**
⚠️ **Other older tests may be green for that same wrong reason.** ⇒ **I have asked her to NAME them on her next task — not fix them.** 🔑 **I want to know the size before anyone touches it, and I am not widening this round to chase it.**

### 4. State
**1 ✅ · 12 ✅ · 7 ✅ · 8 dispatched.** **Still 62 migrations** — ⚠️ **item 8 may add the round's first; I will tell you the number the moment it exists.**
📋 **`COPY-REVIEW-2026-09-29.md`: one entry so far.** **Nothing waiting on you.**

## 2026-09-29 — @Sober → @Porter: ✅ **item 8's backend is done.** 🔴 **But the owner has to rule before we put the button on screen.**

### 1. ✅ What is built and safe
**Delete a camp created by mistake works, and it is checked BY THE SERVER at the moment you press it** — **a camp that gained a booking while the dialog was open is refused, told how many, and pointed at ปิดรับ instead.** **No raw database errors reach the admin.**
⚖️ **One judgement I made: "no bookings" means NO booking ever, cancelled ones included.** 🔑 **A camp created by mistake has no history; if it has history, the mistake is not what is being deleted.** **And refusing a delete costs an admin one click — allowing a wrong one destroys a record nobody can get back.**

### 2. 🔴 The ruling I need — **what "Close" should actually do**
**The owner said: Close stops NEW bookings only; existing ones stay; Open re-allows.**
🔴 **What the system's existing "close" really does today is much more:** it **removes the week from the coaches' calendars, including days already past**, **stops the reminders to coaches AND parents**, and refuses per-day changes — **while still charging the children at the end of each day and still sending them the BALANCE CAMP message.**
🔑 **Two things are wrong, and the second is the serious one:**
1. **It stops TELLING people while it keeps TAKING their days.** *Of those two halves, the one you would keep is the telling.*
2. **It cannot be undone: reopening restores only FUTURE days.** ⇒ **The owner said "Open re-allows them", and today's close permanently loses the past ones.**
✅ **Our recommendation: make Close do exactly what he said — stop new bookings, nothing else.**
🔴 **Until he rules, I am NOT letting the button reach an admin's screen** — 🔑 **"ปิดรับ" would promise far less than the switch behind it does**, and the delete's own refusal points at that button, so half of it is worse than none.

### 3. ⚠️ One check for Tanya when this reaches sid
**Two people acting at the same instant — one deleting a camp, one booking into it.** **We proved our ordering as far as a test can; the real answer is the database's, and no test of ours can reach it.**

### 4. State
**1 ✅ · 12 ✅ · 7 ✅ · 8 BE ✅ (FE held) · 2 dispatched.** **Still 62 migrations** — item 2 may add the round's first.
**Nothing waiting on you except the Close ruling.**

## 2026-09-29 — @Sober → @Porter: 🔴 **Item 2 is bigger than it looked, and ONE question needs the owner.** Work continues meanwhile.

### 1. 🔴 What we found — and it is the reason Khwan asked
**The system does not record "this teacher is off that day" anywhere.** **What it has is an act that CANCELS that day's classes** — 🔑 **so a teacher marking a leave on a day with NOTHING booked leaves no trace at all.**
📌 **That is Khwan's exact request: block an empty working day so nobody books it.** ⇒ **It is not that the block is missing a switch. The fact it would read has never existed.**
✅ **We are creating it properly — a recorded fact, not something guessed from cancelled classes.** *Guessing it from cancellations is the same mistake that produced the bug Tanya found this week.*

### 2. ⛔ **The one question for the owner**
🔑 **Who records an advance leave — the admin, the teacher, or both — and when a TEACHER marks a future day off, should that still automatically cancel the classes already booked that day?**
**Why it matters:** **today it cancels them.** **He ruled that nothing cancels automatically and the admin handles them by hand.** ⇒ **Either the new way replaces the old one for future dates, or we end up with two things called "leave" that do opposite things.**
⚠️ **We have not touched the existing behaviour and will not until he answers.**

### 3. ✅ Three smaller questions I answered myself, so he only has one
**All three can be overturned; none of them holds up the work.**
- **A block can be removed** — *a block nobody can lift is a trap, and removing it destroys nothing.*
- **It also blocks adding that teacher as a second coach, and seats in classes they teach** — **that is his own rule, not a new one.**
- **If an Undo would put a class back onto a blocked day, it is REFUSED with a clear message** — 🔑 *that is the moment a human is present to decide; putting it back silently rebuilds the problem.*
- ⚖️ **And for camps: one coach's day off SKIPS that day and lists it, rather than refusing the whole week.** **That is his own pattern one level up.**

### 4. ✅ Something worth telling him
**An earned make-up will never be lost to this.** **If a coach's day off lands on a replanned class, it moves to the next free week** — 🔑 *a family losing a make-up because a coach took a day off would be the system punishing the customer for our scheduling.*

### 5. State
**1 ✅ · 12 ✅ · 7 ✅ · 8 BE ✅ (FE held for the Close ruling) · 2 building (the gate half).**
⚠️ **Item 2 adds the round's FIRST migration: 0062 ⇒ the uat range becomes 63.** I will confirm when it lands.
**Two things with the owner: the Close ruling, and the question above.**

## 2026-09-29 — @Sober → @Porter: ✅ **item 2's gate is built.** 🔴 **One more thing found, for next round.** ⚠️ **Migration: 0062 — uat is now 63.**

### 1. ✅ Built, and safe to deploy even though it does nothing yet
**The block itself is in, and it holds at every door a booking can come through** — **including the two automatic ones that had been going round the side of our checks for a long time.**
🔑 **Nothing writes a leave day yet, because that is the question with the owner** ⇒ **the block is inert in the product.** ✅ **That is deliberate and it is the safe shape: it can ship without anyone noticing a change, and it cannot surprise an admin.**
✅ **And a make-up will never be lost to it — it moves to the next free week**, as ruled.

### 2. ⚠️ **Migration 0062 — the uat range is now 62 ⇒ 63.** As you asked, the moment it existed.

### 3. 🔴 Found while building, NOT fixed — for the next round
**The two automatic make-up writers still ignore three other rules: an archived teacher, a teacher's non-working weekday, and the freelance rules.**
🔑 **We built a seam to plug one rule into those writers, and that seam is the proof the other three were never plugged in.** ⇒ **A make-up can still be placed on a teacher who no longer works here, or on a day they do not work.**
📌 **Long-standing, not caused by this work, and the engineer correctly did not fold it in.** **It is worth the owner knowing it exists.**

### 4. Where the round stands
**1 ✅ · 12 ✅ · 7 ✅ · 8 BE ✅ (FE held) · 2 gate ✅ (rest held) · 5 dispatched.**
🔴 **Two things are HELD on the owner, and both hold FE work:** **the Close ruling**, and **who records an advance leave / does a teacher's future leave still auto-cancel.**
📌 **Because both of Fern's items are blocked, I have given her a small survey instead of leaving her idle:** **listing the tests that might be passing for the wrong reason** — the problem she caught herself last task. **She fixes nothing; I want the size before anyone spends it.**

### 5. ⭐ One good thing to pass on
**Item 5 has become a repair rather than a risk.** **Because the owner ruled that a gaining coach is told, the item that would have created a silent class hand-over now closes that gap for good.**

## 2026-09-29 — @Sober → @Porter: ✅ **item 5's backend is done.** 🔴 **Two deploy warnings and one money finding.**

### 1. 🔴 **Do NOT deploy the backend on its own** — the two halves ship together
**The server now REFUSES a swap or an add-teacher that does not say whether it means one session or the rest.** ⇒ **Until the screen sends that, those two buttons would fail.**
🔑 **That refusal is deliberate and it is the right design — the old behaviour silently did everything, which is Khwan's complaint** — **but it makes the two halves one release.** ✅ **The FE half is dispatched and is now the round's critical path.**

### 2. 🔴 A money bug found on the way, and its sibling is still open
**Moving an ECA session to another coach USED TO KEEP THE ORIGINAL COACH'S RATE.** ⇒ **The covering coach taught it and the other one's rate was paid.** ✅ **Fixed.**
🔑 **Nobody asked us to look at that. It surfaced because the task forced the question "whose rate?" at every door instead of only the new one.**
⚠️ **The same fault still exists in the other direction — a swap made "from this date onwards" still pays the original coach's rate on every session.** 📌 **Not fixed, not folded in, and the owner should know it is there.**

### 3. ✅ Two good answers
- **The notices needed nothing.** **Both the coach who gains the class and the coach who loses it were ALREADY told** — 🔑 **the question the owner ruled on turned out to be already answered by the system.**
- **Khwan's "Move session changes the whole course" is not the backend** — **moving a session there only ever touched one row.** ⇒ **The cause is on the screen, and the FE task now has to find it and name it.** 📌 *Half her complaint may be a screen doing more than the server was ever asked to.*

### 4. State
**1 ✅ · 12 ✅ · 7 ✅ · 8 BE ✅ (FE held) · 2 gate ✅ (rest held) · 5 BE ✅ → FE dispatched · 10 next.**
**Migrations: 63** (no new one in item 5).
🔴 **Still with the owner, both holding FE work:** **the Close ruling**, and **who records an advance leave / does a teacher's future leave still auto-cancel.**

## 2026-09-29 — @Sober → @Porter: ✅ **item 5 is done, both halves.** ⚠️ **A sid batch IS ready — and it changes what Khwan is testing.**

### 1. 🔑 The best thing in this round so far
**Khwan's complaint and a refusal our own backend added last night turned out to be THE SAME BUG.**
**The teacher buttons' only choice was "From date — today by default"** ⇒ **one teacher change quietly rewrote every remaining session, and nothing asked.** **And in that same line, when the date was today, the request left the field out entirely** — **which is exactly the shape the new backend refuses.**
📌 **Two people, a week apart, who never spoke to each other, were describing one defect.** ✅ **Both halves are fixed and they ship together.**

### 2. ⚠️ **A batch is ready for sid — and this is the "tell me first" you asked for**
**Ready:** **item 1** (bulk confirm accepts Extended) · **item 12** (the camp notice in Khwan's format) · **item 7** (the camp rate box) · **item 5** (one-session teacher change, both halves) · plus **item 8's delete and item 2's block**, which are **inert until the owner rules.**
🔴 **This DOES change what Khwan is testing right now** — **the booking list, the camp week editor, the teacher buttons and the camp notice are all in it.** ⇒ **Your call and the owner's, not mine.**
⚠️ **And one thing Tanya must re-check after it lands:** **the camp rate box at 1920**, which we cannot prove ourselves.

### 3. Where the round stands
**1 ✅ · 12 ✅ · 7 ✅ · 5 ✅✅ · 8 BE ✅ (FE held) · 2 gate ✅ (rest held) · 10 dispatched.**
**Then: TASK-553, then items 3 and 6.** **Migrations: 63.**
🔴 **Still with the owner, and both hold work:** **the Close ruling** · **who records an advance leave, and whether a teacher's future-dated leave still auto-cancels.**

### 4. Two money items on the list for him, neither fixed
- **A swap made "from this date onwards" still pays the ORIGINAL coach's rate on every session.** *The single-session version of this was found and fixed this round.*
- **The camp catch-up sends a parent two notices with the same "Remaining".**

## 2026-09-29 — @Sober → @Porter: ✅ **item 10's backend is done.** 🔴 **One question for the owner that decides whether item 10 works at all.**

### 1. 🔴 **The chat can still skip everything**
**The owner ruled that every field is required and the form cannot proceed until they are filled.** ✅ **That is now true on the page.**
🔴 **But a parent registering through the CHAT can still type ข้าม and skip.** ⇒ 🔑 **The requirement is optional in practice, and the information Khwan asked us to guarantee still will not be there.**
**Recommendation: make the chat match the page.** ⚠️ **Otherwise the honest thing to tell Khwan is that some children will still have no birthday on file.**
📌 **Out of this round's scope, correctly not folded in — but it is the owner's decision, not ours to quietly leave.**

### 2. ⚠️ One customer-visible effect he should know about, and I think it is right
**We only count an address as "on file" if it was picked properly on the page** — **the ones typed freely into the chat are not counted**, because **we cannot show them back to the parent or tell them apart from any other note.**
⇒ **Those households will be asked for their address once more.** 🔑 **I judged that the right trade: asking once more costs a minute — treating something we cannot show back as an address is a permanent falsehood in the record.**

### 3. ✅ Two good answers
- **A parent halfway through registering when this deploys is FINE** — **the page stays put, they fill the fields and resubmit, and nothing is half-created.** **The engineer checked rather than assumed.**
- **Once one child is registered, the form already knows the household has an address** — **it is told, so the next child is never asked.**

### 4. State
**1 ✅ · 12 ✅ · 7 ✅ · 5 ✅✅ · 10 BE ✅ → FE dispatched · 8 BE ✅ (FE held) · 2 gate ✅ (rest held).**
**Then: TASK-553, then items 3 and 6.** **Migrations: 63.**
🔴 **With the owner:** **the Close ruling** · **who records an advance leave** · **now: should the chat wizard match the page?**
⚠️ **And the sid batch from my last message is still waiting on your word** — it changes what Khwan is testing.

## 2026-09-29 — @Sober → @Porter: ✅ **item 10 is done, both halves. Every un-blocked REQ-110 item is now finished.**

### 1. ✅ Where the round stands
**1 ✅ · 5 ✅ · 7 ✅ · 10 ✅ · 12 ✅.** **8 and 2 are half-built and INERT, waiting on the owner.**
▶️ **Now running: the groundwork item 6 depends on** (the one we deliberately parked days ago), **then items 3 and 6.**

### 2. 🔴 **One question for the owner — the chat and the page have drifted apart**
**A parent can register a child in two places: the page, and the LINE chat.**
🔴 **After this round they behave differently in TWO ways:** **the chat still lets a parent skip the required fields**, and **it has its own separate wording for the duplicate-name warning.**
🔑 **So the rule the owner just made — every field required — is optional in practice, and the words he approves for one door are not the words the other door says.**
**Recommendation: bring the chat in line with the page.** ⚠️ **Otherwise what we tell Khwan has to be: "required on the page; some children will still arrive without a birthday."**

### 3. 🔑 Something about how the work is being checked, worth one line to him
**On this last item the engineer deliberately broke her own new code ten different ways, found that FIVE of her tests did not notice, fixed them, and published the whole table including the failures.**
📌 **That is the practice that catches things before customers do** — *and a report that only ever shows successes is the one I would trust least.*

### 4. ⚠️ Still waiting on him — now four
1. **The Close ruling** (camp Close does far more than he described, and cannot be undone).
2. **Who records an advance leave**, and whether a teacher's future leave still auto-cancels.
3. **The chat vs the page**, above.
4. **The sid batch** — ⚠️ **it changes what Khwan is testing**, so it is his call, and it has been ready since this morning.

## 2026-09-29 — @Sober → @Porter: 📋 **A DATA REQUEST for the owner — a DRY RUN, changes nothing.**

### 1. What it is
**A one-command report, `bun run leave:backfill-links`, run on sid and then uat.** 🚫 **It is a dry run by default: it reads and prints, and writes nothing.**
**We need three numbers and a list of reasons back.**

### 2. Why it decides something real
**We are repairing old records where the system did not write down which absence a replacement class was for** — **the gap behind the bug Tanya found.**
🔑 **The tool only repairs a row when the answer is unambiguous. Everything else it leaves alone and counts.** ⇒ **The numbers tell us whether a final cleanup is worth doing at all.**
⚠️ **And the engineer's honest expectation, stated before running it: for courses that were paused and resumed, most rows will come back "cannot tell".** ✅ **That is the right answer, not a disappointing one — the alternative was guessing, and guessing is what caused this.**

### 3. 🔑 What happens with each outcome — decided in advance, so nobody improvises
- **Nothing ambiguous ⇒ we apply the repair and finish the job.**
- **A handful ⇒ a person checks each one by hand, then we finish.** 🔑 **"A handful" means few enough that every row is actually looked at** — *the moment it becomes a list someone approves without reading, it is a guess with extra steps.*
- **A lot ⇒ we do NOT finish it, and that is fine.** 📌 **The user-facing path is already fixed and every new record is written correctly.** **The last step is an improvement, not something anyone is waiting on.**

### 4. State
**Item 3 is now building.** **Then item 6, which this work unblocked.** **Migrations: 63.**
🔴 **Still with the owner — four:** the Close ruling · who records an advance leave · the chat vs the page · **and the sid batch, ready since this morning.**

## 2026-09-30 — @Sober → @Porter: ✅ **item 3's backend works.** 🔴 **It is not shippable yet, and I want you to know why before anyone asks.**

### 1. ✅ What is built
**An admin can extend a voucher's expiry, and every change is written down — who did it, from what, to what, when.**
🔑 **The engineer also made the SYSTEM's own automatic date-setting record itself** — **which nobody asked for, and which is exactly the hole that produced the bug Tanya found last week.** 📌 **This time we wrote the record BEFORE the defect instead of after it.**

### 2. 🔴 Why it does not ship yet
**If every booking on an extended voucher is cancelled, the next booking RESETS the extension** — **and nobody is told.**
🔑 **A feature the system can silently undo is not a feature.** **An admin would extend a voucher, something ordinary would happen, and the extension would quietly vanish.** ⇒ **Shipping it like that would be choosing, on purpose, the exact fault we have spent two weeks removing.**
✅ **The fix is small and is already dispatched** — **and it is only possible because of the record above: we can now tell a person's decision from the system's habit, so the system yields to the person.**

### 3. ⛔ One question for the owner
**A voucher that is ENDED — its hours all used — cannot be extended today; we refuse it.**
🔑 **Worth putting to him in these words: extending a DATE cannot revive an ENDED voucher, because "ended" means the HOURS are gone.** ⇒ **If he wants such a voucher usable again, the thing he actually wants is a TOP-UP, which is a different button.** **Refusing is correct either way; the question is whether that other door should exist.**

### 4. ⚠️ Migrations
**64 now** (item 3 added one). **The uat range is 63 ⇒ 64.**

### 5. State
**Item 3 BE ✅ (blocked on the small fix) → then item 6, the last one.**
🔴 **Still with the owner — five:** the Close ruling · who records an advance leave · the chat vs the page · **the ENDED voucher question** · **and the sid batch, ready since yesterday morning.**
📋 **And the backfill DRY RUN from yesterday is still waiting for a run on sid and uat.**

## 2026-09-30 — @Sober → @Porter: ✅ **item 3's backend is complete.** ▶️ **The last item is now building.**

### 1. ✅ The extension can no longer be undone by accident
**An admin's extension now survives everything the system does on its own.** 🔑 **And it works because the system was made to write down its OWN automatic date-setting** — **so we can tell a person's decision from a habit, and the habit yields.**
📌 **Worth one line to the owner: that record was added yesterday, unasked, for a different reason. Today it is what makes this fix possible.**

### 2. 🔑 One small thing that says a lot about how this is being built
**A rule refusing to extend a not-yet-started voucher had a reason that our own fix made obsolete.** **The engineer did not delete the rule and did not keep it silently — he went and found out whether it still had a reason.**
**It did, and a better one:** **before the first booking the date is only a sale-day placeholder, so "extending" it could actually end the voucher EARLIER.** ⇒ **The rule stays, with the real reason written in its place.**

### 3. ▶️ Item 6 — the last one, and the biggest
**"Change a course's start date" is two things at once: it re-lays the sessions AND moves the expiry.** ⇒ **Both of the rules we have spent this fortnight establishing apply to it, and both are now enforced rather than remembered.**
⚠️ **One thing I have told him to stop on:** **if moving a start date would send the family six "class cancelled" messages, he stops and tells me** — 🔑 **a parent who gets six cancellations for a date change will phone Khwan**, and that would be us creating the complaint we are trying to answer.

### 4. State
**Every REQ-110 item is now done or building.** **Migrations: 64.**
🔴 **Five with the owner:** the Close ruling · who records an advance leave · the chat vs the page · the ENDED voucher question · **the sid batch**.
📋 **And the backfill dry run still needs a run on sid and uat.**

## 2026-09-30 — @Sober → @Porter: ✅ **every REQ-110 backend item is done.** The remaining work is screens.

### 1. ✅ Item 6 — and it came out better than I specified
**I told the engineer to STOP if changing a start date would send the family six "cancelled" messages.** ✅ **It sends NONE.**
**The sessions are MOVED rather than cancelled and recreated** ⇒ **nothing is destroyed and nothing is announced.** **The course is then marked as needing reconfirmation, and the existing Confirm button sends ONE new schedule to each person.**
🔑 **I ruled that it stays manual rather than automatic: an admin moving a start date is usually mid-conversation with the parent, and an automatic message would go out before they have finished deciding.**

### 2. ⚠️ **One thing Khwan's team must understand, and it is on the screen task**
**Between moving the date and pressing Confirm, the family and the coach still hold the OLD schedule.**
⇒ **The screen must say that at the moment of the move, and a course waiting to be reconfirmed must be VISIBLE where an admin looks.** 🔑 **An invisible "needs reconfirming" is how a family keeps the old dates for a month.**
📌 **I have told @Fern to check whether it already shows there, and to report it as a finding if it does not.**

### 3. ✅ What it deliberately does NOT touch
**The sale, any deduction already taken, the counters, and the sessions' own identities, rentals and rates.** 🔑 **Khwan's reason for asking was that the old workaround "ทำให้เงินงง" — so the honest thing is that this change can say exactly what it leaves alone.**

### 4. Where the round stands
**BE: all nine items done.** **FE: item 6 running, item 3 next; items 8 and 2 still held on the owner.**
**Migrations: 64.**
🔴 **Five with the owner:** the Close ruling · who records an advance leave · the chat vs the page · the ENDED voucher question · **the sid batch, now two days old.**
📋 **And the backfill dry run still needs running on sid and uat.**

## 2026-09-30 — @Sober → @Porter: ✅ **item 6's screen is built.** 🔴 **One gap holds the item, and it is the one I warned about.**

### 1. 🔴 What she found, and why I am holding item 6
**I said the danger of moving a start date is that the family keeps the OLD schedule until someone presses Confirm — and that a course waiting to be reconfirmed must be visible where an admin looks.**
🔴 **She checked: it is NOT.** **The admin's attention panel only flags a pending session on the day before it happens** ⇒ **a course moved three weeks out shows nowhere at all until the day before its first class.**
🔑 **So the feature's own safety net is a field nobody reads.** ⇒ **A small backend fix is dispatched, and item 6 ships with it.** 📌 *This is exactly why I asked her to check rather than assume.*

### 2. ✅ Two things she refused to do, both correctly
- **She did not predict the new dates on the screen.** 🔑 **That would have meant two copies of the rule that decides dates and the expiry — and the second copy would eventually disagree.** ⇒ **We are adding a proper read-only "what would happen" call instead, the same shape we built for the Undo.**
- **She did not re-invent a field the screen needed.** 📌 **A safeguard we put in a fortnight ago made the compiler stop her, which is precisely what it was for** — **it is now a one-field backend change instead of a wrong date on a card.**

### 3. ⚠️ Something she reported that I want on the record
**One of her checks looked green and was not: the tool produced no result at all, and her runner read "no failures" as "passed".** ✅ **She caught it, re-did it properly, and told me.**
🔑 **A check that produced no output is not a pass — it is a check that did not run.** 📌 **She lost nothing by telling me and the team gains a rule; that is the behaviour I want reported, not hidden.**

### 4. State
**BE: all nine items done + one small blocking fix running.** **FE: item 3 next.** **Items 8 and 2 still held on the owner.** **Migrations: 64.**
🔴 **Five with the owner:** the Close ruling · who records an advance leave · the chat vs the page · the ENDED voucher question · **the sid batch, two days old.**
📋 **Plus the backfill dry run, still unrun on sid and uat.**

## 2026-09-30 — @Sober → @Porter: ✅ **item 6 is unblocked.** ⚠️ **Migration 65.**

### 1. ✅ The gap that held item 6 is closed, and closed carefully
**A course waiting to be reconfirmed now appears in the admin's attention panel FROM THE MOMENT the date is moved** — not the day before the first class.
🔑 **And the detail that shows it was thought through: pressing Confirm only clears the flag if nothing is still pending. If one session was skipped, the warning STAYS.** 📌 *That is the case that would otherwise have emptied the panel while a family still held the old dates.*

### 2. ⚠️ **Migrations: 65** (item 6's attention fix added one). **The uat range is 64 ⇒ 65.**

### 3. ✅ Two more things worth one line each
- **The "what would happen" preview runs the SAME code the real change runs** — 🔑 **not a copy of it**, so the two can never drift apart. **It also says plainly that the real change checks again, so a late refusal is normal rather than a contradiction.**
- **A safeguard we added a fortnight ago made the compiler catch a missing field before it reached a screen.** ✅ **It is now one real field instead of a wrong date on a card.**

### 4. State
**BE: everything done.** **FE: item 6's last piece running, then item 3.** **Items 8 and 2 still held on the owner.**
🔴 **Five with the owner:** the Close ruling · who records an advance leave · the chat vs the page · the ENDED voucher question · **the sid batch, two days old.**
📋 **Plus the backfill dry run, still unrun.**

## 2026-09-30 — @Sober → @Porter: ✅ **item 6 is complete.** 🔴 **And we found that some of our own checks were lying.**

### 1. ✅ Item 6 is done, both halves
**Moving a start date shows exactly what will happen before it commits, uses the real dates, and the course now appears in the admin's attention panel from the moment it is moved.**
✅ **One detail worth Khwan's team knowing: if the admin changes the date again, the preview they were looking at is thrown away** — **you cannot confirm a plan that was made for a different date.**

### 2. 🔴 **The thing I want the owner to know, because it is about how much our "all tests pass" is worth**
**Our engineers deliberately break their own code to check the tests notice.** 🔴 **@Fern found that her tool for doing that had been SILENTLY FAILING: its output limit was a thousand times too small, so the run was being killed halfway and reported as "nothing failed".** ⇒ **Ten checks were reported as passing that had never actually run.**
✅ **She caught it herself, fixed it, and told me before I asked.** 📌 **That is the behaviour that makes the rest of the reports worth reading.**
🔴 **I have stopped @Jason's queue to ask him the same question first — his test suite is more than four times the size, so if his tool has the same flaw it has been wrong for longer.**
⚠️ **I am also asking both of them which earlier reports this could reach back into.** **No re-runs yet; I want the list before anyone spends the time.**
📌 **Nothing that shipped is known to be wrong** — **this is about how much confidence we are entitled to, not about a defect in the product.**

### 3. 📋 One small copy decision for the owner
**Two drafts exist for the same line — the attention row for a moved course.** **A short one filed with the backend work, and a longer one that also says the family still holds the old dates.**
**My recommendation: the SHORT one for the list row, the LONGER one on the screen where the admin acts.** 🔑 *A one-line attention row is an index, not an explanation.* **Both are in the copy file, side by side.**

### 4. State
**BE: all done + the runner question.** **FE: item 3 next.** **Items 8 and 2 still held on the owner.** **Migrations: 65.**
🔴 **Five with the owner**, unchanged — including **the sid batch, now two days old.**

## 2026-09-30 — @Sober → @Porter: ✅ **the checking tools are fixed and now live in the repo.** 🔴 **BE is now IDLE — the owner's five decisions are the only thing left.**

### 1. ✅ What closed
**The tool our engineers use to deliberately break their own code — the thing that tells us whether a test would actually notice — was living in a temporary folder that disappears whenever a session is reset.**
✅ **It is now in the repository, with a written rule for how a result must be read, and it can PROVE ITSELF: five checks that it reports honestly even when a run is killed or produces nothing.**
🔑 **And moving it into the light immediately turned up a THIRD way it could have lied to us** — *it launched the tests through a shell, so a timeout killed the shell and left the tests running invisibly.* 📌 **Things kept where nobody looks do not get reviewed — and that is exactly where all three of these faults were living.**
✅ **No result that we relied on changes. Nothing that shipped is affected.**

### 2. 🔴 **Backend is now completely idle, and it is not for lack of work**
**Every REQ-110 item he can build is built.** ⇒ **What is left is waiting on the owner:**
1. **The Close ruling** — camp "close" does far more than he described and cannot be undone. **Item 8's screen is held on it.**
2. **Who records an advance leave**, and whether a teacher's future-dated leave still auto-cancels. **Item 2's screen is held on it.**
3. **The chat vs the page** — a parent can still skip the required fields by registering in chat.
4. **The ENDED voucher question.**
5. ⚠️ **The sid batch — ready since two mornings ago, and it changes what Khwan is testing.**
📌 **I am not pressing for its own sake: the engineer is out of work he is allowed to start.**

### 3. State
**FE: item 3's screen, plus two small internal jobs.** **Migrations: 65.**

## 2026-09-30 — @Sober → @Porter: ✅ **item 3 is complete.** 🔴 **Every REQ-110 item we are allowed to finish is finished.**

### 1. ✅ Done
**1 · 3 · 5 · 6 · 7 · 10 · 12 — all complete, both halves.** 🔴 **8 and 2 are built on the server and HELD at the screen, waiting on the owner.**

### 2. 🔑 Two things from this last item that say something about the work
- **The engineer found that a rule she was asked to respect could not be copied into the screen even if she wanted to** — **the information simply is not there** — **so the screen asks the server and shows its answer.** 📌 **A guarantee is stronger than a promise not to duplicate something.**
- **She also went one line further than her instructions:** I told her *not to imply anyone is notified*; **she made the dialog say plainly that nobody is, and where the family will see the new date.** ✅ **I kept it.** 🔑 **Silence is what lets an admin assume a message went out.**

### 3. ⚠️ Something worth the owner's attention about our own housekeeping
**She found three comments in the code that had become wrong — not because anyone edited them, but because new code was inserted between a comment and the thing it described.** **One had become an outright lie.**
✅ **All three were hers, she found them herself, and she fixed them.** 📌 **That is the habit that keeps the code readable by whoever comes next.**

### 4. 🔴 The bottleneck is unchanged, and it is now the whole of it
**Backend: idle.** **Frontend: internal housekeeping only.** ⇒ **Nothing else can start.**
1. **The Close ruling** — holds item 8's screen.
2. **Who records an advance leave** — holds item 2's screen.
3. **The chat vs the page** — item 10's rule is optional in practice until this is answered.
4. **The ENDED voucher question.**
5. ⚠️ **The sid batch — ready three mornings ago, and it changes what Khwan is testing.**
📋 **Plus the backfill dry run, still unrun on sid and uat.**
**Migrations: 65.**

## 2026-09-30 — @Sober → @Porter: 🔴 **BOTH engineers are idle.** 📋 **`DECISIONS-PENDING-2026-09-30.md` — five decisions, each with a recommendation.**

### 1. 🔴 The state, plainly
**Every REQ-110 item we are allowed to build is built and verified.** **Backend: nothing queued. Frontend: nothing queued.**
⇒ **The five decisions with the owner are now the entire round.**

### 2. 📋 What I have written for him
**One file, five decisions, each with: what it is · what it blocks · what it costs to wait · and my recommendation.**
🔑 **They are worded so he can answer "as recommended" to each and be finished** — **and none of them depends on another, so he can answer three and leave two.**
⚠️ **The wording is mine, in English. You own the Thai**, as before.
📌 **The one I would put in front of him first is the sid deploy** — **Khwan is testing a build that is six items behind**, so everything she reports has to be checked against a version we have already moved past.

### 3. ✅ And one thing worth telling him, because it is about trust rather than features
**The engineer built a check to catch tests that only look at the screen instead of what was actually sent.** 🔴 **Then she broke her own check on purpose — and the very case it existed for slipped straight through.**
🔑 **Her words: "something was sent cannot tell a landed value from a lost one — that is the entire defect, and my check was blind to it."** ✅ **She rewrote it, and the new version guards its own rule.**
📌 **That is three times this week a tool we use to check our work turned out to be wrong, and three times an engineer found it themselves and said so before I asked.** **It is the reason I am willing to say "this is done" and mean it.**

### 4. Housekeeping
**Migrations 65.** 📋 **The backfill dry run is still unrun** — **it writes nothing and we need three numbers back.**

## 2026-09-30 04:50 — Tanya (QA) → @Porter: 🔴 STOP item — D10: an ECA one-session COVER cannot be done on screen (item 5). Rest of REQ-110 still running.
- **What works:** Swap on the ECA series asks *"ใช้กับคาบไหน? เฉพาะคาบนี้ / คาบนี้และคาบถัดไปทั้งหมด"*, nothing pre-selected, Save shut until chosen ✅. Picking "เฉพาะคาบนี้" states the outcome correctly ("qatt75b สอนแทน qatt75 ในวันนั้น … ได้ค่าสอนของคาบนั้น") ✅.
- **What fails:** **Save ⇒ 400 `RATE_REQUIRED`** "กรุณาระบุค่าสอนของครูที่สอนแทน", **and the Swap dialog has no rate box.**
  - The series' rate list refuses a coach who is not on it (400), and Swap only offers coaches who are not on it.
  - ⇒ **Khwan's case (a different coach covers once) always dead-ends on screen.**
  - The API with `rateMinor` works: only that one session changed ✅.
- Evidence: `qa-2026-09-30/I5-a-1-no-scope.png`, `-2-this-session.png`, `-3-after-save.png`. Details: TEST-076 → D10.
- Also found: **D9** (low–medium). After a start-date move, the result box reads **"true คาบต้องยืนยันใหม่"**: the BE sends a boolean and the FE shows it as the count. Item 6 otherwise ✅.
- So far ✅: items 1, 3, 6 (apart from D9), 7, and TASK-555 (the 5 labels I could reach).

## 2026-09-30 05:10 — Tanya (QA) → @Porter: REQ-110 batch on sid — results. Details + screenshots in TEST-076 (`project-docs/qa-2026-09-30/`).
| Item | Verdict |
|---|---|
| 1 bulk confirm + EXTENDED | ✅ an EXTENDED make-up and a PENDING, ticked together ⇒ "ยืนยัน 2" |
| 7 camp rate box @1920 | ✅ all 7 rate weeks: fully visible, no sideways scroll; typed → saved → re-read; no-rate weeks unchanged |
| 3 voucher expiry | ✅ not-started refused with guidance · active extended + recorded · ENDED: no button + server 409 |
| 6 change start date | ✅ preview = result, expiry 10/11→17/11, attention row appears · 🔴 **D9** result box says **"true คาบต้องยืนยันใหม่"** (BE sends a boolean where the FE expects a count) |
| 5 ECA one-session | 🟡 the question is asked correctly · 🔴 **D10** the cover dead-ends on screen (RATE_REQUIRED, no rate box) · API cover changes ONE row ✅ |
| 10 LIFF register form | 🟡 required, no skip ✅ · 2nd child not asked the address ✅ · 🔴 **D11** abandoning after the phone step leaves LINE linked to a parent with **0 children** and "Add Student" dead-ends · 🟠 F-E the duplicate warning shows **two boxes** (new "real name" + old "surname or nickname") · 🟠 F-C district/sub-district not required (province only passes). Is that intended? · 🟠 F-D garbled EN sub-district names · (the chat path was not judged) |
| 12 camp notice | ⏳ queued only at tonight's **day-end**. Fixture ready (temp, 30/09 ATTENDED); rows via DATA REQUEST #5 |
| TASK-555 | ✅ the 5 reachable labels match §D2 (TH+EN); 3 not reachable without an admin-linked LINE |
| smoke | ✅ |

🟠 Also for the next round: **F-B** — any already-linked family pressing *เพิ่มนักเรียน* gets "already linked — nothing to do" (the LIFF offers "Add a child" only right after registering). Likely pre-existing.

**DATA REQUEST #5** (read-only, sid DB; for item 5 — **after 18:10 tonight** so item 12's row exists too):
```sql
-- item 5: the covered session's rate + coach notices
SELECT id, date, teacher_id, teacher_rate_minor, status FROM bookings WHERE id = 'e0996d1b-6358-42ff-b542-bc5ed756996e';
SELECT booking_id, recipient_type, recipient_line_user_id IS NOT NULL AS has_account, payload, status, created_at
FROM notification_outbox WHERE booking_id = 'e0996d1b-6358-42ff-b542-bc5ed756996e' ORDER BY created_at;
-- item 12: the camp deduction notice (no booking row; match by payload)
SELECT recipient_type, recipient_line_user_id IS NOT NULL AS has_account, payload, status, created_at
FROM notification_outbox WHERE payload->>'kind' = 'camp_deduction' AND created_at > '2026-09-30' ORDER BY created_at;
```
Expect: `teacher_rate_minor = 70000` on the covered row; one `teacher_unassigned` (qatt75) + one `teacher_assigned` (qatt75b) row (both SKIPPED, since neither is linked); **one** `camp_deduction` → `parent` with `{studentName:"temp", date:"2026-09-30", remainingDays:0, totalDays:0.5}`.

Footprint: see TEST-076 → "Cleanup status". Singles and the ECA series are cancelled; the voucher is ended; the phone is back on 0900000092. **Kept:** the camp week (until the day-end) and `47be0cc9` (until Sober releases it). **To archive:** fixture parent 0899990761 + 2 children.

## 2026-09-30 — @Sober → @Porter: ✅ **`DEPLOY-sid-2026-09-30.md` written.** ▶️ **Tanya's five are dispatched.** ⚠️ **One of them is bigger than it looks.**

### 1. ✅ The deploy record
**`DEPLOY-sid-2026-09-30.md`** — no new environment keys · **migrate first, expect 65** · what went out · what Tanya found · rollback. 📌 **Written as the RECORD, since the owner has already deployed and Tanya has already tested against it.**

### 2. ▶️ Tanya's findings, dispatched now
- 🔴 **D10 (blocker)** and 🟠 **F-E** → @Fern. **D10 is not just a missing box:** **the list of coaches Swap offers and the list the rate table accepts do not agree**, ⇒ 🔑 **Khwan's exact case could never have worked.** **I have told her to name every way those lists disagree, not to patch the one symptom.**
- 🔴 **D11**, 🟠 **D9**, 🟠 **F-D** → @Jason.
- ⚖️ **I ruled D9 myself: the BACKEND sends the count.** **I approved "a count only" when that work was built, so the boolean is the side that drifted.**

### 3. ⚠️ **D11 is two problems, and the owner should know the second one**
**A parent who gives up after the phone step is left linked with no children.**
🔑 **Fault one is that we link them too early. Fault two is that "a linked parent with no children" is a state the rest of the system simply does not handle** — **and that state can be reached another way, by removing a family's last child.**
⇒ **Fixing only the first would leave the same dead end reachable.** ⚠️ **And there are already parents in that state on sid** — **I will send you the repair as soon as the engineer describes it. Nobody here touches data.**

### 4. Queued behind the fixes
**Items 2 and 8 and the chat (ruling 4), with F-C folded in: an address now needs province + district + sub-district on BOTH the form and the chat.** 📋 **New wording goes into the same copy file.**

### 5. ⚠️ The next sid batch
**I will tell you before it is ready, as before.** 📌 **It will carry Tanya's five fixes** — ⇒ **worth holding until all five are in, so she re-tests once rather than five times.**

## 2026-09-30 — @Sober → @Porter: ✅ **D10 and F-E fixed.** ⛔ **One question for the owner, and it is a permissions one.**

### 1. 🔑 D10 was never a missing box
**Three separate rules, each sensible on its own, formed a closed loop:** **Swap offers you coaches who are NOT on the class · a rate can only be set for a coach who IS already on it · and the save refuses to proceed without a rate.**
⇒ 🔑 **The coaches the screen offered were exactly the coaches who could not yet have a rate.** ⇒ ***Khwan's case never worked, and no amount of retrying could have made it work.***
✅ **Fixed on the screen: the admin now enters the covering coach's rate, labelled with THAT coach's name so it cannot be mistaken for the other's.**
✅ **F-E is fixed properly too — the old wording is DELETED, not hidden behind the approved one.**

### 2. ⛔ **The owner's question: may an admin WITHOUT the rate permission do a cover at all?**
**As things stand such an admin cannot: the screen may not send a rate, and the server will not save without one.**
**Two honest answers:** **(a) covering requires the rate permission, and the screen says so** · **(b) it does not, and we need his rule for whose rate is paid.**
🚫 **We will not guess this, and we are not inventing a rate.** 📌 **Today those admins simply see no rate box — the same as before this fix; nothing is hidden.**
⚠️ **Two draft strings are being held until he answers, because if the answer is (a) the label has to say "you need the rate permission" instead.**

### 3. ⚠️ Something about our testing that the owner may appreciate
**The test covering this dead end had been PASSING for weeks** — **because it faithfully asserted that the door offered no rate box.** 🔑 **The test was right about the code. The code was wrong.**
📌 **New habit on my side: when a customer reports a dead end, I now read the tests covering it FIRST — one of them is likely describing the dead end approvingly.**

### 4. State
**@Jason: D11 / D9 / F-D in flight, then the rate-ordering fix.** **@Fern: free once you have the answer above.**
**Still queued: items 2 and 8 and the chat (with F-C folded in).** **Migrations 65.**
⚠️ **Next sid batch: I will tell you when all of Tanya's five are in — she should re-test once.**

## 2026-09-30 — @Sober → @Porter: ✅ **D11, D9 and F-D answered.** ⭐ **And F-B is NOT next round — it is the same bug.**

### 1. ⭐ Tanya's F-B is closed by D11's fix
**F-B — a linked family pressing เพิ่มนักเรียน and being told "already linked" — was filed as "next round, probably pre-existing".**
🔑 **It is neither: it is the SECOND half of D11.** **The engineer was asked to name both faults behind the symptom rather than fix the symptom, and the second one turned out to be Tanya's other finding.**
⇒ **One fix, two findings closed.** 📌 **Worth telling her: her F-B is being dealt with now, not later.**

### 2. ✅ D9 — fixed, and fixed so it cannot come back
**The reconfirm box gets a number instead of `true`.** 🔑 **And it is enforced by the compiler, not by a test** — **if anyone ever widens it back to a yes/no, the build stops.**

### 3. ✅ F-D — not our bug, and we stopped
**The garbled English sub-district names come from a public address package we use (`thai-address-universal`), which ships them wrong.** ✅ **The THAI names are correct, and we only ever store Thai** ⇒ **addresses and the new province-district-sub-district rule are unaffected.**
⚠️ **One question left, and it is a screen question:** **does any page actually SHOW those English names to a parent?** **If it does, we show Thai only.** 🔑 **Correct data displayed wrongly is still a defect the customer sees.** 🚫 **We are not editing someone else's package.**

### 4. ⚠️ One thing I decided rather than escalated
**The other half of D11 — that we create a real linked parent from an abandoned form — is still wrong.** ✅ **But it is the LINE chat's shared function, and bringing the chat in line with the page is already on the list.** ⇒ **I folded it in there: one change, one round, instead of touching the same function twice.** **With the dead end closed, nothing about it is urgent.**

### 5. State
**@Jason: the rate-ordering fix (D10's server half).** **@Fern: `canAddMore` + the English-names question.**
**Then: items 2 and 8 and the chat, with F-C and D11(a) folded in.** **Migrations 65.**
⛔ **Still with the owner: may an admin WITHOUT the rate permission perform a cover at all?** **Two drafts are held on that answer.**

## 2026-09-30 — @Sober → @Porter: ✅ **D11 and F-B closed on screen.** ⛔ **One thing REVERSES an earlier owner decision and he must see it.**

### 1. ✅ Done
**A family with no children can now register one** — **before, that page offered them only "unlink" or "close", on the page whose entire purpose is registering a child.** ✅ **And a family at the limit now gets a SENTENCE explaining why, instead of a dead button.**
📌 **A small thing that says a lot: that explaining sentence already existed in our copy and NO family at the limit could ever see it.**

### 2. ⛔ **The reversal — please put this in front of him**
**The garbled English sub-district names:** **the owner asked for English names in English mode, and we built that.** 🔴 **The data we get them from is broken — "Khnong Tntnai" for คลองตันเหนือ — so what a parent actually sees in English mode is nonsense.**
✅ **We have put the THAI names back in both languages for now**, **and written the reversal into the code where nobody can meet it as a silent change.**
🔑 **The reasoning: he asked for readable English, and this source cannot give it.** **Garbled English serves what he wanted worse than Thai does.**
⚠️ **If he still wants English, the honest options are a different address dataset or writing our own transliteration.** **Both are real work.** 🚫 **Neither is patching someone else's package.**
📌 **It only ever affected the parent's own dropdowns in English mode. Nothing an admin sees, and nothing we store.**

### 3. ▶️ The three rulings are now cut and queued
**Close = stop new bookings only · the new advance-leave act · the chat brought in line with the page** — **with F-C (province + district + sub-district on both doors) and the other half of D11 folded into the chat one, because they are the same function.**
🔑 **For Close I have made reversibility the test that matters: close, open, and the week must be EXACTLY as it was.** **That is the property today's version fails.**

### 4. ⛔ Still with the owner — two
1. **May an admin without the rate permission perform a cover at all?** (Two drafts held.)
2. **The English-vs-Thai reversal above.**
**Migrations 65.** ⚠️ **Next sid batch: I will tell you when Tanya's five are all in.**

## 2026-09-30 — @Sober → @Porter: ⚠️ **a correction I owe you**, and 🔴 **one thing being fixed now without waiting for the owner.**

### 1. ⚠️ My correction
**I told you that for a cover "the screen may not send a rate, and the server will not save without one."**
**The second half is true. The FIRST HALF WAS NOT: the screen was hiding the box — the server would have accepted it.** 🔑 **So the protection I described to you did not exist.** 📌 **The engineer found it while doing the fix and said so; I would rather correct this than have it stand.**

### 2. 🔴 What it means, and why I am not waiting for the owner
**The cover door is the ONE rate-writing door in the system with no rate-permission check.** ⇒ **An admin without that permission could set a coach's rate through it** — **not from our screens, but the door itself allowed it.**
🔑 **This is not the question the owner is being asked.** **His question is whether such an admin may cover a session at all — that is a product decision, and it is still his.** **Whether a permission is ENFORCED at its door is not a decision** — ⇒ ***an unenforced permission is one that lies to whoever granted it.***
✅ **So we are adding the check now.** **Either answer he gives stays a one-line change afterwards.** 🔑 **Enforce first, relax deliberately — never the other way round.**
📌 **Nothing is known to have been misused. This is a door standing open, not a break-in.**

### 3. ✅ And one thing that needed no work
**The server already allowed a rate for the coach it is putting on the class — that half was right all along.** **The dead end was entirely on the screen**, and that is now fixed.

### 4. ⛔ With the owner — still two
1. **May an admin without the rate permission perform a cover at all?**
2. **The English-vs-Thai address names.**
**Queue: the permission check, then Close, then the advance-leave act, then the chat.** **Migrations 65.**

## 2026-09-30 — @Sober → @Porter: ✅ **the open door is shut.** 🔴 **Listing them all found a second one, and it was better hidden.**

### 1. ✅ Fixed, and proven both ways
**The cover door now refuses a rate from an admin without the rate permission — with a reason — and a cover WITHOUT a rate still works exactly as before.** 🔑 **Both halves proven through the real app, not just the function** — *a permission fix must not quietly become a functional change.*

### 2. ⭐ The list was the valuable part
**I asked him not to fix the one door but to DERIVE every place in the system that can write a coach's rate.** **He walked every request body in all 100 routes, at every depth: 14 of them. 12 already required the permission.**
✅ **One of the other two is deliberate** — a different permission owns it, and that is written down. 🔴 **The other is a second gap, and it is the more dangerous kind.**

### 3. 🔴 The second gap — **why it is worse**
**The camp day editor DOES check the permission.** **But the check only looks at the top level of the request, and the coach's rate sits one level down inside the list of coaches** ⇒ **it goes through unchecked.**
🔑 **A missing check is visible — someone reading the code sees there is none.** **A check that is there but does not look deep enough is invisible: a reader sees it and concludes the door is covered.** ⇒ ***It lies about its own coverage.***
✅ **Being fixed now, same reasoning as the first: this is not about WHO may do what — it is about whether the permission means anything.** ⚠️ **And I have told him that if fixing it breaks a real camp workflow, he STOPS and reports it rather than carving an exception** — 🔑 **that would be a decision for the owner, not a line of code.**
📌 **Again: nothing is known to have been misused. These are doors standing open, found by counting the doors.**

### 4. State
**Queue: this fix, then Close, then the advance-leave act, then the chat.** **Migrations 65.**
⛔ **With the owner: the cover permission question · the English-vs-Thai address names.**

## 2026-09-30 — @Sober → @Porter: ✅ **both doors are shut, and nothing broke.** ▶️ **Back to the owner's three rulings.**

### 1. ✅ Closed, and with an honest measure of what was ever at risk
**Both gaps are fixed.** 🔑 **And the engineer checked what the fix now refuses that it used to allow: ONE door, ONE shape — and no screen in the product has ever sent it.**
⇒ ***"Only a hand-made API body is now refused."*** 📌 **So: nothing an admin could do through our screens, and nothing anyone is known to have done. A door was standing open; it is shut.**

### 2. 🔑 One thing worth telling the owner about how it was fixed
**I asked for a check that looks everywhere instead of a list of the places we know about.** ✅ **He built one that knows no shape at all** — **it reads every part of a request looking for a coach's rate by name.**
⇒ 🔑 **A new place to hide a rate cannot appear, because there is no list of places to keep up to date.**
✅ **And he proved it both ways at scale: every possible field in every request the system accepts — over 300 that are not rates, none of them wrongly caught.** 📌 **That last number is the one that matters: a check that cries wolf is a check somebody switches off.**

### 3. ▶️ Back to the owner's work
**Now building: Close = stop new bookings only.** 🔑 **I have made reversibility the test: close it, open it, and the week must be EXACTLY as it was** — **that is the property today's version fails, and it is why his ruling is a fix rather than a preference.**
**Then: the advance-leave act, then the chat.**

### 4. State
**Migrations 65.** ⛔ **With the owner: the cover permission question · the English-vs-Thai address names.** ⚠️ **Next sid batch when Tanya's five are all in.**

## 2026-09-30 — @Sober → @Porter: ✅ **Close now means what the owner said.** 🟠 **One DATA REQUEST, and it is not cosmetic.**

### 1. ✅ Close is fixed, and the proof is the one that matters
**Close a week, open it again, and the week is EXACTLY as it was** — **proven value by value, including the days already past.** 🔑 **That was the property the old version failed, and it is why his ruling was a fix rather than a preference.**
✅ **And the thing that made the old behaviour indefensible is gone: it used to stop TELLING families while still TAKING their days.** **Now a closed week keeps reminding them AND keeps charging, because its classes still run.** 📌 **The problem was never that it charged. It was that it charged silently.**
✅ **One more thing worth passing on: everything the old Close did beyond "stop new bookings" was OUR OWN choice, not his** — **and the thing that really does mean "camp off" already exists: Cancel the week.**

### 2. 🟠 **DATA REQUEST — a read-only count, and please treat it as real**
**Weeks that were CLOSED BEFORE today already lost their coaches' calendar blocks, and reopening no longer puts them back.** ⇒ **Those coaches look FREE in hours they are actually working.**
🔴 **A coach who looks free when they are not is a double booking waiting to happen.**
**The query is read-only and written.** **We need the count.**
- **A handful ⇒ an admin re-saves each day and it fixes itself.**
- **Many ⇒ a small script, dry run first, run by the owner.**
🚫 **Nobody here runs either.** 🔑 **The number chooses the fix — I am not guessing at it.**

### 3. ▶️ Now running
**@Fern: the camp Close/Open/Delete screen** — ⚠️ **including a real question: our calendar banner HIDES closed weeks, which was written when Close meant "camp off". She will decide it out loud rather than silently.**
**@Jason: the advance-leave act.** **Then the chat.**
**Migrations 65.** ⛔ **With the owner: the cover permission question · the English-vs-Thai names.**

## 2026-09-30 — @Sober → @Porter: ✅ **item 8 is complete.** 📌 **One visible change the owner should be TOLD about — not asked.**

### 1. 🔴 What she found before writing anything
**Closing a camp week could not be undone FROM THE SCREEN** — **there was no "take bookings again" button at all**, even though the server has always been able to restore the week exactly. **And the delete we built last week had no button either.**
🔑 **We had shipped a one-way switch whose reverse already worked.** 📌 **The capability was there; the door was not.**
✅ **Both doors now exist, and the words no longer over-claim:** *"Closed"* has become **"stop taking new bookings"**, and the message now says **what carries on** — the children keep their days, the coaches keep their sessions, the reminders still go out — **and that it can be reversed at any time.**

### 2. 📌 **The visible change: closed camp weeks now appear on the calendar strip again**
**Until now a closed week vanished from the calendar banner.** 🔴 **But a closed week still has children at camp, coaches blocked and days charging** ⇒ **an admin looking at a Tuesday with eight children and two coaches at camp saw an empty strip.**
✅ **Now: an OPEN week always shows · a CLOSED week shows only on days that actually have children · and it is MARKED as closed, so it cannot be mistaken for one you can still sell into.** ✅ **An empty closed day stays hidden — it would be clutter.**
⚠️ **This is a judgement, and it is reversible by one named line.** 🔑 **I am telling him rather than asking him, because the alternative is what we had: a camp running invisibly.** **If he prefers it hidden, say so and it goes back.**

### 3. ✅ A small thing that shows the care
**When a delete is refused, the screen shows the server's sentence word for word and does NOT retry** — 🔑 **because a silent retry could report a different number of bookings than the one the admin is reading.**

### 4. State
**Items 1, 3, 5, 6, 7, 8, 10 and 12 are complete.** **Item 2 is the last: @Jason's half is building, then one screen.**
**Migrations 65.** ⛔ **With the owner: the cover permission question · the English-vs-Thai names · and now the banner, as a notification.**
📋 **The read-only count on the old closed weeks is still outstanding** — **that one is not cosmetic.**

## 2026-09-30 — @Sober → @Porter: ✅ **the advance leave works.** 🟠 **And we caught ourselves removing something.**

### 1. ✅ What is built
**A teacher marking a FUTURE day off now blocks that day for new bookings and LISTS the classes already on it** — **nothing is cancelled, nobody is chased.** **Today and the past still cancel, because those classes are about to run.**
✅ **The block can be lifted, and lifting it cancels and restores nothing.** ✅ **And the block is proven live: a new booking is refused and an automatically re-planned make-up skips that week.**

### 2. 🟠 **What we caught — and it is the kind of thing I most want caught**
**The owner's ruling says the classes are "listed FOR THE ADMIN to handle by hand".** 🔴 **No admin can see that list — it goes to the teacher.**
🔑 **And there is a second half the engineer did not even claim: the OLD behaviour cancelled those classes, and a cancellation TOLD the admins.** **The new behaviour tells nobody.** ⇒ ***We stopped cancelling and, in the same change, stopped telling anyone — so classes would sit on a blocked day with no one aware.***
✅ **Both are being fixed now: admins can see the day and its classes, and admins are told when one is recorded.**
🔑 **I want to be plain about why I did not ask him first: adding a new notification would be his decision. Not losing one we already had is ours.** 📌 **This is a restoration, not a new feature.**
⚠️ **And the family is deliberately NOT told** — **nothing has been cancelled, and a parent hearing "the teacher is away" about a class that is still going ahead would be a new problem.**

### 3. ▶️ Finishing
**@Fern has the last screen of the last item: the teacher's dialog must stop offering to tick classes on a future date** — 🔑 **those ticks mean "cancel this one", and nothing is cancelled** — **and it must say plainly that nothing was cancelled.** *A teacher who thinks their classes were cancelled does not turn up.*

### 4. State
**All nine items are complete or on their last screen.** **Migrations 65.**
⛔ **With the owner: the cover permission question · the English-vs-Thai names · the camp banner (a notification).**
📋 **Still outstanding: the read-only count of weeks closed before the deploy.** 🔴 **Those coaches still look free in hours they are working.**

## 2026-09-30 — @Sober → @Porter: ⚠️ **a correction of mine**, and 📋 **a proposal the owner may not need.**

### 1. ⚠️ My correction
**I told you the old behaviour notified admins when a teacher's leave cancelled classes, and that we had silently lost that.** 🔴 **It never notified admins at all.** **The engineer checked the code and proved it.**
⇒ **Nothing was lost.** 🔑 **Which means an admin notice would be a NEW feature — and by my own rule that makes it the owner's decision, not mine.** ✅ **He stopped building it and filed the wording as a proposal instead.** 📌 **He was right and I was wrong; this is the third time this fortnight one of them has checked something I asserted and found it false. That is exactly what I want them doing.**

### 2. ⚖️ But the owner's ruling still needs something
**He ruled that the classes on a blocked day are "listed for the admin TO HANDLE BY HAND".** 🔑 **That presupposes the admin KNOWS there is a blocked day.** ⇒ **Right now nobody tells them and nowhere shows them.**
⇒ **Two ways to satisfy his own ruling:** **(i) somewhere an admin will SEE it · (ii) a LINE notice.**
✅ **We are doing (i) first** — **a marker on the calendar day, the way camp weeks already appear.** 🔑 **If that does the job, the notice may never be needed** — *and asking him for a new feature before we know whether it is needed is how a system grows noise.*
📋 **The notice wording is drafted and waiting in the copy file as a PROPOSAL, with its "leave lifted" counterpart.** ⚠️ **Put it to him as "also?", not "instead" — and only if he wants it. A yes costs about thirty lines.**

### 3. ✅ What is built
**An admin can now fetch blocked days with the classes on each.** ✅ **And a teacher is refused that read** — 🔑 **which is the half that proves it is an admin view and not the teacher's own list at a new address.**

### 4. State
**@Fern: the last screen of item 2, then the marker.** **@Jason: the chat — the last backend item of the round.**
**Migrations 65.** ⛔ **With the owner: the cover permission · the English-vs-Thai names · the camp banner (notification) · and now this notice, as a proposal.**
📋 **Still outstanding: the read-only count of weeks closed before the deploy.**

## 2026-09-30 — @Sober → @Porter: 🔴 **the chat had a skip nobody could see.** ⚠️ **And one deploy that must go as a pair.**

### 1. 🔴 The find
**In the LINE chat, typing `add น้องเอ` CREATED A CHILD FROM THE NAME ALONE** — **no birthday, no address, no questions.**
🔑 **It was not a button, a link or a hint. It was a shortcut that never asked**, which is why "remove the skip" would have missed it. ✅ **Now that command enters the proper wizard, half-finished drafts go back to the question they are missing, and the one place that writes a child refuses one with no birthday.**
📌 **This is the difference between the owner's rule being written down and it being true.**

### 2. ⚖️ The address rule — how we are doing it, and one limit he should hear
**Province + district + sub-district, on both doors.** ✅ **The server checks that three parts are there and that the province is a real one.**
⚠️ **It does NOT check that the district actually belongs to that province** — **we would need a second copy of Thailand's address data in the backend to do that, and two copies that can disagree is exactly the kind of trouble we have spent this fortnight removing.**
🔑 **I have told the engineer to write that limit in the code and in his report**, *because someone reading "full address validated" would otherwise believe more than we do.*
✅ **And a family whose stored address has only a province is ASKED again, never blocked** — it was valid when they gave it.

### 3. ⚠️ **A deploy that must go as a PAIR**
**Fixing the abandoned-registration problem properly changes WHEN a parent's LINE is linked** — **only once their first child is actually accepted, all in one step.** **That changes both the chat and the page at the same time.**
🔴 **The two halves must deploy together.** **I will tell you when both are in.**

### 4. ⚖️ One decision I made rather than passing up
**The parents already left half-registered: we are NOT tidying them up.** 🔑 **They are no longer stuck — the fix earlier today lets them finish — and archiving someone who might come back tomorrow is a loss for no gain.** **The query exists; nobody runs it.**

### 5. State
**@Fern: the admin-visible marker, then her half of this pair.** **@Jason: this pair's server half.** **Migrations 65.**
⛔ **With the owner: the cover permission · the English-vs-Thai names · the camp banner (notification) · the advance-leave notice (proposal).**
📋 **Still outstanding: the read-only count of weeks closed before the deploy.**

## 2026-09-30 — @Sober → @Porter: ✅ **the round's backend is complete.** ⚠️ **One pair still to ship together.**

### 1. ✅ Done
**A parent's LINE is now linked only when their first child is actually accepted** — **and if anything fails halfway, NOTHING is left behind.** 🔑 **The engineer's own line is the reason I trust it: "refusals never open the transaction"** — *a refusal that opens one is a rollback somebody has to trust; one that never opens it is a rollback nobody needs.*
✅ **And when an address is incomplete, the server now says WHICH part is missing** — **so the screen can ask for the sub-district rather than saying "that is wrong".**

### 2. ⚠️ Still a PAIR
🔴 **The server half is in; the screen half is @Fern's next job.** **They must deploy together** — **I will tell you when both are in.**

### 3. 📌 Something worth one line to the owner
**We run the whole test suite a second time with the database deliberately unreachable.** **Today that caught a test that was quietly reading a real setting from a real database** — **it would have passed forever otherwise.**
🔑 **That is the third separate problem that second run has found which an all-green suite would never have shown.** 📌 *It is why "all tests pass" means something here.*

### 4. State
**Backend: nothing queued.** **@Fern: the admin-visible marker, then the screen half of the pair.** **Migrations 65.**
⛔ **With the owner — four:** the cover permission · the English-vs-Thai names · the camp banner (notification) · the advance-leave notice (proposal).
📋 **And the read-only count of the old closed weeks is still outstanding** — 🔴 **those coaches still look free in hours they are working.** **That one is the oldest thing on my list.**

## 2026-09-30 — @Sober → @Porter: ✅ **an admin can now SEE a blocked day.** ⚠️ **And I have fixed a fault in how we hand the owner his copy.**

### 1. ✅ The marker
**A day a coach has blocked now shows as a strip above the calendar — in the day view AND the week view**, **with whose day it is and how many classes are already on it.**
🔑 **The week view matters more than it sounds:** *"a marker you can only see after navigating into the day is one you find only if you were already looking."*
✅ **And a blocked day with NO classes still shows** — **deliberately, and differently from how we treat an empty camp week.** 🔑 **The reason: an empty blocked day is exactly the one an admin needs to see BEFORE they try to book into it.** 🚫 **It is not a button — nothing is cancelled or moved from it, as the owner ruled.**
⚠️ **This was the cheap half of his open question.** 📌 **If the marker is enough, the LINE notice he is being offered may not be needed at all.** **He should still see the proposal — but now he can answer it knowing what already exists.**

### 2. ⚠️ **A fault in OUR process, found by the engineer and fixed by me**
**The copy file the owner reviews is appended to by both engineers.** 🔴 **They collided twice in one hour** — **two sections numbered 17, two numbered 18** — **because the next number is whatever the last person picked.**
✅ **From now each section is numbered by the task that produced it, so two people cannot choose the same one.** 🔑 **The owner's copy file was one badly-timed edit away from being unreadable, and that is a poor way to lose his trust in it.**
📌 **She reported the process fault rather than quietly working around it. That is worth more than the fix.**

### 3. State
**@Fern: the last piece of the round — her half of the pair.** **@Jason: nothing queued.** **Migrations 65.**
⛔ **With the owner — four:** the cover permission · the English-vs-Thai names · the camp banner · **the advance-leave notice (now with a cheaper alternative already built).**
📋 **And the oldest item on my list is still the read-only count of weeks closed before the deploy.**

## 2026-09-30 — @Sober → @Porter: ✅ **THE ROUND IS COMPLETE.** ⚠️ **The next sid batch is ready — and it must go as one.**

### 1. ✅ Everything is in
**All of Tanya's five findings, and all three of the owner's rulings.** **Both engineers are idle.**
- **Her five:** the cover that dead-ended · the duplicate warning showing twice · `true` where a count belonged · the abandoned registration · the garbled English names.
- **His three:** Close means "stop new bookings" and nothing else · a future-dated leave blocks the day instead of cancelling · the chat now matches the page.
- **Plus two permission doors we found and shut on the way, and an admin can now SEE a blocked day.**

### 2. ⚠️ **The batch must go as ONE — this is the "tell me first"**
🔴 **Two of the changes are a PAIR that break each other if split:** **the page sends address fields an old server ignores, and the new server refuses the two-part address an old page would still send.** ⇒ **Server and screen together, or neither.**
**Everything else in the batch is safe in any order, but there is no reason to split it.**
**Migrations 65 — unchanged since the last deploy.** 🔴 **`db:migrate` before the code, as always.**

### 3. ⚠️ What Tanya should re-test, and one thing only she can judge
**Her five, plus the three new behaviours.** ⚠️ **And one judgement: the blocked-day strip on the calendar is ORANGE and sits next to the camp one** — **only she can say whether they read as different things at a glance.**

### 4. ⛔ Still with the owner — four, and one is now cheaper
1. **May an admin without the rate permission perform a cover?** (Two drafts held on it.)
2. **English or Thai for the address names.**
3. **The camp banner change** — a notification, not a question.
4. **The advance-leave LINE notice** — 📌 **now worth asking properly, because the cheap alternative is built: an admin can already SEE a blocked day on the calendar.** **He can answer knowing what exists.**

### 5. 📋 And the oldest item on my list
**The read-only count of weeks closed before the last deploy.** 🔴 **Those coaches still look free in hours they are working.** **It is one command and it writes nothing.**

## 2026-09-30 — @Sober → @Porter: ✅ **YES — (1) is small. Hold the deploy for it.**

### 1. ✅ Answering your question at once, as asked
**It is SMALL: the SCREEN only.** 🔑 **The server already refuses a cover from an admin without the rate permission — we shut that door two days ago.** ⇒ **All that is left is the screen SAYING so instead of showing nothing.**
✅ **And the wording already exists** — **she wrote both versions when the question was raised and held them for exactly this answer.**
⚠️ **So: hold the deploy briefly. I will tell you the moment it is green** — **it is worth the wait, because otherwise the batch ships with an admin meeting a blank space where a reason should be.**

### 2. ✅ The other ruling, recorded
**The advance-leave LINE notice: NOT now, the calendar strip stands.** ✅ **The proposal stays in the copy file, marked as declined for now, so a later yes costs nothing.** 🚫 **Nobody builds it.**
📌 **And this is what doing the cheap half first bought us: he answered knowing what already exists, rather than in the abstract.**

### 3. ✅ Noted with thanks
**The Thai address names and the closed-week banner accepted without objection.** 📌 **Both were judgement calls the engineer made and declared rather than hid — worth him knowing that is how they reached him.**

### 4. 📋 The two queries
**The Q-581 count and the backfill dry run are with him.** ✅ **Neither writes anything.** 🔑 **The count is the one I care about: until we have it, some coaches look free in hours they are working.**

### 5. State
**@Jason: idle. @Fern: this one task.** **Migrations 65 — unchanged.** 🔴 **The batch still ships as ONE.**

## 2026-09-30 — @Sober → @Porter: 🟢 **GREEN. The deploy can go.**

### 1. 🟢 (1) is done — **904 tests green, type-check clean, build clean, re-run by me**
**An admin without the rate permission now sees WHY, in words, instead of a blank space.** ✅ **And an admin WITH the permission sees exactly what they saw before** — **proven twice: at the source and by a real click.**
🔑 **Her own sentence for why that second proof exists: *"'it did not narrow anyone' is the claim most likely to be false later."***
✅ **She also checked that there is no OTHER place a cover can be started** — **there is exactly one, proven rather than assumed.** *One door told and another silent would have been worse than neither.*

### 2. ▶️ **Nothing else is holding the batch. It can go as ONE.**
**Migrations 65 — unchanged.** 🔴 **`db:migrate` before the code.** 🔴 **Server and screen together** — the address pair breaks in both directions if split.

### 3. ⚠️ For Tanya, one judgement only she can make
**The new message is a yellow box.** 🔑 **The question is whether it reads as "ask someone who has this permission" rather than "you did something wrong."**
📌 *A permission message that sounds like a reprimand teaches an admin to stop trying things* — **and that is not something we can test.**
⚠️ **Plus her earlier one: whether the orange blocked-day strip reads as a different thing from the camp strip at a glance.**

### 4. State
**Both engineers idle. The round is finished.**
📋 **The only things outstanding are his two read-only queries** — 🔑 **and the count is the one that matters: until we have it, some coaches look free in hours they are working.**

## 2026-10-01 00:25 — Tanya (QA) → @Porter: re-test on sid — mostly ✅, but 🔴 **D12 is NEW and customer-visible**. Details + screenshots in TEST-076 → "Re-test 2026-09-30 23:35".
**New phone:** Xiaomi Redmi 10C (220333QAG), Android 13, LINE + demo OA @125vuzsj. **Before the tests its LINE was NOT linked** (`menu` got no reply, `register` got "type Next"). It is back to not linked now.

🔴 **D12 — the parent's register form shows developer comments.** Between "Date of birth" and "Province" every new parent sees *"/\* §7b — จังหวัด → เขต/อำเภอ → แขวง/ตำบล, each list read from the dataset by GEOCODE … \*/ /\* §4 nit 2 — … \*/"*. It is a code comment written as page text (`RegisterContent.tsx:665`, FE `f3e25e2`). Screenshot `D12-1-code-comment-on-form.png`. **This should not reach uat.**

| Re-test | Verdict |
|---|---|
| D10 cover + rate box | ✅ the box "ค่าสอนของ qatt75b สำหรับคาบนี้ \*", Save locked until filled, only 21/10 changed, `rateMinor 65000` |
| D10 admin w/o rate key | ⏳ **need a login with a no-rate role** (sid has such roles; I don't hold passwords and don't create/re-enable accounts). The draft text itself reads as "ask someone with the permission", not a reprimand |
| F-E | ✅ one box, new wording (🟠 it stays English after switching the page to ไทย) |
| D9 | ✅ "4 คาบต้องยืนยันใหม่" |
| D11 | ✅ abandoning after the phone step creates nothing; coming back, they can finish |
| F-B | ✅ a linked family gets "Add a child" (🟠 the line above it still says "Nothing more to do here") |
| Family limit | ✅ "Your family has reached the limit for this number." / "ครอบครัวนี้มีนักเรียนครบตามจำนวนที่กำหนดแล้วค่ะ" |
| F-D | ✅ Thai names in EN mode |
| F-C (form + chat) | ✅ all three levels required on both (🟠 District/Sub-district unstarred on the form) |
| Chat = form | ✅ no skip at DOB/district/sub-district; `add <name>` → wizard; 2nd child not asked the address (🟠 address prompts Thai-only; district/sub-district accept free text; the chat links the parent at the phone step) |
| Camp Close/Open/Delete | ✅ Close→Open byte-identical · Open button · empty week deleted · refusal in the server's words · closed week marked in the day-view strip (🟠 week view: no closed mark, and "7 คน" for a 1-child week) |
| Advance leave | ⏳ **BLOCKED: needs a coach web login** (it is the teacher's own act); sid has no leave days recorded |
| Smoke | ✅ |

**Needed from the owner (via you):**
1. a login with a no-rate-key role (D10b);
2. a coach web login (advance leave);
3. the item-12 outbox answer.

⚠️ **1 Oct phone check for pushes:** the camp notice and the coach cover notices go to accounts on the **old** demo phone and the fixture coaches. This new phone isn't linked to any of them, so that check needs the old phone connected, or the owner's word on which phone to use.
Footprint and the families to archive: TEST-076 → "Re-test footprint".

## 2026-10-01 — @Sober → @Porter: ▶️ **both dispatched.** 🔴 **One of the "nits" is not a nit.**

### 1. 🔴 D12 — agreed, a blocker, and it is worse than it looks
**Developer notes are being printed as text on a page a PARENT uses.** ✅ **The fix itself is one line.**
🔑 **What concerns me is that it reached a customer's screen at all** — ⇒ **so I have asked for two more things: every other place it happens, and a CHECK that fails if it ever happens again.** 📌 **Third time this fortnight a rule has had to become an automatic check because writing it down was not enough.**

### 2. 🔴 **Nit 4c is not a nit — and I want it answered before the rest**
**"The chat links the parent at the PHONE step."** 🔑 **That is the exact thing we rebuilt two days ago**, and **Tanya saw it on the build that contains the fix.**
**Two possibilities, and both matter:**
- **The chat really does bypass the new path** ⇒ **the defect we believed was closed is open.**
- **Or she saw the DESIGNED behaviour** (an already-known phone still links at once) ⇒ 🔑 **then our wording is bad enough that a tester holding our own spec read it as a contradiction — and that is worth fixing too.**
⚠️ **I have told him a guess is not acceptable either way.**

### 3. ⚖️ One of the nits is our stated limit, not a fault
**"District and sub-district accept free text" — yes, deliberately.** **We check that three parts are present and that the province is real; we do not own Thailand's district data and we refused to keep a second copy of it.**
📌 **Worth putting to the owner as a question rather than us quietly building a picker: does he want those chosen from a list, knowing it means taking on that data?**

### 4. The rest
**The other five are dispatched with the reasoning attached** — including **the camp week view missing its "closed" mark**, which our own rule says is exactly the case the mark exists for, and **"7 คน" for a one-child week**, which will be attributed to the payload or the screen before anyone touches it.

### 5. ⚠️ On your blocked items
**A no-rate-role login and a coach web login would let Tanya test two things she currently cannot.** 📌 **Worth pressing for: both are accounts, not features.**

**I will tell you the moment the batch is ready. Migrations 65, unchanged.**

## 2026-10-01 01:50 — Tanya (QA) → @Porter: D10b ✅ · advance leave ✅ · accounts created · push check partly done (DATA REQUEST #6 below). Details in TEST-076.
**Accounts (sid only; passwords only in the credential file named in `machine.local.md`):**
- `qa-norate-076`: role QA-all-no59, **no** coach-rate key.
- `qa-coach-qatt75`: **linked to teacher qatt75**.
- ⚠️ The coach account started with **no menus at all**. I gave it `menu:calendar` + `action:calendar.teacher-leave` on the user. Note: sid's shared **Teacher** role has only `menu:calendar`, **without the leave key**, so a real coach on that role can't record leave. Worth checking before uat.

- **D10b** ✅: the no-rate admin gets the yellow box instead of a rate box, and Save stays locked. It reads as "ask someone with the permission", not a reprimand.
- **Advance leave** ✅:
  - future date ⇒ no ticks, "ปิดรับจองวันนี้";
  - result says nothing was cancelled and lists the 1 class;
  - the class stays PENDING;
  - a new booking is refused (409 TEACHER_ON_LEAVE);
  - the orange strip shows in week and day views, clearly different from the teal camp strip.
  - 🟠 **One stale line:** the future-date dialog still shows the same-day warning *"ผู้ปกครองของคาบที่ติ๊กจะได้รับแจ้ง และระบบจะเพิ่มคาบชดเชยให้"*, which contradicts the hint above it.
- **Push check (new phone):**
  - `register` as 0900000092 was refused ("already linked to another LINE", i.e. the old phone), so I **linked the new phone to QA parent 0899990763** and left it linked.
  - A course confirm push **arrived and renders** ✅.
  - 🔴 **The make-up-cancelled family notice did NOT arrive** (8+ min).
  - The camp notice fires at tonight's day-end; I'll check it after 18:05.

**DATA REQUEST #6** (read-only, sid):
```sql
SELECT booking_id, recipient_type, payload->>'kind' AS kind, status, attempts, error, created_at, sent_at
FROM notification_outbox
WHERE booking_id IN ('bc1447f2-5d22-418a-8511-6d807f47726f','7d7856a9-c720-4966-a695-6443008eafd5')
   OR (payload->>'kind' = 'camp_deduction' AND created_at > '2026-09-30')
ORDER BY created_at;
```
This also covers your error-column question for the 09-30 FAILED camp rows. Please run it **after 18:10 today** so tonight's camp row is included.

## 2026-10-01 — @Sober → @Porter: ✅ **D12 is fixed, derived and now IMPOSSIBLE to repeat.** ⚠️ **One question for Tanya, and it is not a complaint.**

### 1. ✅ D12 — and the honest answer to "how did that reach a parent's screen?"
**The comments were valid two days ago. A change on Tuesday MOVED them into the part of the file that renders** — **so they stopped being comments and became words on the page.**
🔑 **Why no test saw it: our checks on that file deliberately STRIP comments before looking** — **so a comment that had turned into text was invisible to exactly the tests that read it.** ⇒ **The step that makes those checks reliable is what blinded them to this.**
✅ **She proved there are no others — every file in the app, parsed, not searched: zero.** ⭐ **And there is now a check that makes this class impossible.** 🔑 **She refused the cheap version of that check in writing, because it would have flagged hundreds of correct lines — *and a check that fires on correct code is switched off within a week.*** 📌 **It caught her own fix within the hour, which is the best evidence it works.**

### 2. ⚠️ **A question for Tanya, in her words, and I am sending it as a question**
**That text was on screen for a whole build and was not reported until the re-test.** 🔑 ***"The check now guarantees the class; it cannot guarantee the sighting."***
⚠️ **Worth asking whether that strip of the form was looked at** — **not to assign blame, but because the answer changes what we can reasonably expect a pass to cover.** 📌 **She raised it about her own work, which is why I am passing it on.**

### 3. ✅ The nits
**All four of hers are fixed with the reasons named** — including one that turned out to be **a class rather than a typo** (a sentence stored once in one language, so it could never follow the page into Thai) **and one where she CORRECTED HER OWN first report to me.**
**The fifth — "7 คน" for a one-child week — she proved is NOT the screen** and handed it to @Jason with the evidence. 📌 **That is an attribution, not an opinion.**

### 4. State
**@Fern: idle. @Jason: the chat question, the address prompts, and now the count.**
**Migrations 65.** ⛔ **Your blocked items still matter — especially the two logins; both are accounts, not features.**

## 2026-10-01 — @Sober → @Porter: 🟢 **the batch is READY.** 🔑 **And Tanya was right about 4c — even though the code was fine.**

### 1. 🔑 The answer to "does the chat link at the phone step?"
**No. The code is correct — it links only when the first child is accepted.** 🔴 **But the SCREEN says *"Registration completed ✅"* at the phone step, when NOTHING has been saved** — **and it uses that SAME sentence when the account really IS linked.**
⇒ 🔑 ***One sentence, two opposite states.*** ⇒ **She read our screen and our screen was wrong.**
📌 **Please tell her this plainly: her report was right, and it was about the right thing.** **She did not misread the system — the system misled her.** ✅ **The engineer's own words were "the words are wrong", not "works as intended", and that is why we found it.**
📋 **New wording is drafted as `§19`.** ⚖️ **It is the CUSTOMER's copy, so the owner rules it** — **the existing-phone sentence keeps Khwan's own words; only the new-phone one changes.**

### 2. ✅ "7 คน" — solved, and the owner already has the evidence
**The count was keyed by DATE ALONE, so two camp weeks falling on the same date were added together.** 📌 **His own item-12 query returned SEVEN rows for 30 September. That is the 7.** ✅ **Fixed, and nothing else wanted the pooled number.**

### 3. ✅ The chat's address questions are bilingual now
**And the engineer did better than the nit asked: he worked out the RULE the whole chat follows** — **a registration screen is bilingual, everything else answers in the language the session already knows** — **and pinned the exceptions as a list, so a new one cannot slip in unnoticed.**

### 4. ▶️ **The batch is ready. Nothing is queued for either engineer.**
🔴 **It ships as ONE — migrations 65, `db:migrate` before the code, server and screen together.**
⚠️ **Tanya re-tests only the fixed items** — **plus the two judgement calls only she can make** (the yellow permission box reading as "ask someone", and the orange blocked-day strip against the camp one).

### 5. ⛔ With the owner
1. **`§19` — the registration sentence** (his copy).
2. **Whether district and sub-district should be chosen from a list** (it means owning that data).
3. 📋 **The two read-only queries — and the closed-week count is still the oldest thing on my list.**
4. **The blocked logins: a no-rate-role account and a coach web login.** 🔑 **Both are accounts, not features, and each unblocks a test Tanya cannot run at all.**

## 2026-10-01 — @Sober → @Porter: ✅ **both answers, from the code.** ▶️ **And the stale warning is dispatched.**

### 1. 🔴 **The Teacher role's missing leave key — ANSWER: it is neither a seed fault nor deliberate. It is DATA.**
**I checked the backend: the key `action:calendar.teacher-leave` exists and has since TASK-406** — *"the link is the identity, the key is the door"* — **but NOTHING IN OUR CODE grants keys to any role.** 🔑 **Roles and the keys they hold are rows an admin edits, not something we ship.**
⇒ **On sid, whoever built the shared Teacher role did not include it. Tanya granting it by hand was the correct remedy, not a workaround.**
🔴 **For uat: we cannot know from here — it is data on that box, and it must be CHECKED, not assumed.** ✅ **It is a READ an admin can do on the roles screen; no SQL and no data request.** ⚠️ **Do that before you write the uat list** — **because if uat's Teacher role is the same, the feature works for no real coach there.**
🔑 **And the bigger finding, which is worth the owner's ear: a feature gated by a key that NO ROLE HOLDS is a feature nobody has** — **and nothing in the system tells us which keys are unreachable on a given box.** 📌 **We have sixty keys. This class will recur for every new one.** ⇒ **I would like to propose a small admin read — "keys held by no role" — next round. One screen, and this stops being something a tester discovers.**

### 2. 🔴 **The missing make-up-cancelled push — ANSWER: most likely NO FAMILY PUSH WAS EVER DUE**
**Undoing a leave cancels the make-up and tells ONLY THE COACHES — never the family.** 🔑 **That is the owner's own "never the family" ruling, and in the code it is STRUCTURAL rather than a condition: the undo path calls the coach sender and there is no family sender on it at all. It is pinned both ways.**
⇒ **If Tanya's case was an UNDO of a leave — and "the quota came back" says it was — then the family push never existed.** ✅ **Which also explains why a course-confirm push to the same account arrived: a different path, nothing suppressed.**
⚠️ **One question to Tanya settles it, and it is not a data request: was it an UNDO of a leave, or an ADMIN cancelling a make-up?** **Undo ⇒ nothing was due and DATA REQUEST #6 can be dropped. Admin cancel ⇒ a real gap and I will dig.**
📌 **I would rather ask her one question than have the owner run a query for an answer we may already have.**

### 3. ✅ Your corrections taken
**The two logins are off my list — Tanya's own QA accounts, both tests passed.** ✅ **And the free-text address is accepted as designed; the limit stays written in the code.**

### 4. ▶️ The stale same-day warning
**Dispatched as `TASK-595`, in this batch.** ⚠️ **And I have asked her to derive what ELSE on that dialog was written for the today path** — 🔑 *one dialog, two acts, is where the wrong words get shown.*

### 5. State
**@Jason: idle. @Fern: the stale warning.** **Migrations 65.** 🔴 **The batch still ships as ONE.**

## 2026-10-01 — @Sober → @Porter: 🟢 **the stale warning is fixed — the batch is green and ready.**

### 1. 🟢 Ready
**918 tests green, type-check and build clean, re-run by me.** 🔴 **It ships as ONE — migrations 65, `db:migrate` before the code, server and screen together.**

### 2. 🔑 One thing from this task worth the owner knowing, because it is about trust in our own tests
**While proving the fix, she found that a common way we check "this is not on the screen" CANNOT REPORT A FAILURE.** **When it fails, the test tries to print the entire page structure — hundreds of megabytes — and the run is killed.** ⇒ **It does not come back red. It comes back as nothing.**
🔑 **And it is invisible while it passes** — ⇒ **the fault appears on exactly the day we need the test to speak.**
✅ **She found it in her own work, told me, and offered to fix the whole class. I took it** — 📌 **doing it now costs an hour; discovering it during a real failure costs a day and a wrong conclusion.**

### 3. ⏸️ One offer I deliberately did NOT take
**She also offered to audit every dialog that serves two different acts** — **the shape behind three defects this fortnight** (the leave body, the cancel chooser, this warning).
🔑 **I queued it rather than starting it: it needs judgement per screen, so it produces a LIST, not a fix — and the batch is waiting.** ✅ **It is on the board with its reasoning, so it does not quietly disappear.**

### 4. ⛔ Still with the owner
**§19's wording · the two read-only queries.** ⚠️ **And the uat Teacher-role check is YOURS before the uat list** — 🔑 **a read on the roles screen; if it matches sid, the advance-leave feature works for no real coach there.**
📌 **And one question to Tanya still open: was her missing push an UNDO, or an admin cancelling a make-up? That answer may let the owner drop DATA REQUEST #6 entirely.**

## 2026-10-01 — @Sober → @Porter: 🟢 **done, and the batch is still green.** 📌 **One thing from it that the owner may find worth more than the fix.**

### 1. 🟢 State
**921 tests green, type-check and build clean, re-run by me.** **Both engineers idle.** 🔴 **The batch ships as ONE — migrations 65, `db:migrate` before the code.**

### 2. 📌 The finding, and I would put this one to the owner
**We now have an automatic check that stops a whole class of tests from failing SILENTLY** — **tests that, when they break, print so much that the run is killed and reports nothing at all.**
🔴 **Here is the part worth his attention: the engineer had already hit this trap once, understood it, and WRITTEN IT DOWN in the file where it happened** — **and thirty-eight other places carried the same fault.**
🔑 **A note written by the person who learned the lesson, in the exact place it hurt, still did not stop it recurring.** ⇒ **This is the fourth time in two weeks that a rule only held once it became a check that FAILS.**
📌 **It is not about care or memory. Written rules do not run; checks do.** ✅ **And she reported it about her own work, unprompted — that is why we keep finding these rather than inheriting them.**

### 3. ⛔ Unchanged, with the owner
**§19's wording · the two read-only queries.** ⚠️ **And the uat Teacher-role check is still yours before the uat list** — 🔑 **if it matches sid, the advance-leave feature works for no real coach there.**
📌 **And the one question to Tanya — undo, or admin cancel? — still stands and may let him drop DATA REQUEST #6.**

### 4. ⏸️ Parked, deliberately
**The two-act dialog audit** (the shape behind three defects this fortnight) **is on the board, sized, not started.** **It is yours to open when the round allows.**

## 2026-10-01 19:40 — Tanya (QA) → @Porter: answer + item 12 ✅ on the phone.
- ❓→ **It was an ADMIN cancelling a make-up, NOT an Undo.** Fixture course `a1d0bb6d` (QAChatOne, family 0899990763, linked to the new phone): confirm → leave on 15/10 (`7d7856a9`) → make-up `bc1447f2` (EXTENDED, 12/11) cancelled with `PATCH /bookings/bc1447f2…/status {action:"cancel", reasonCode:"ADMIN_ERROR"}` at 01:34. The re-plan added `4d7b292e` (12/11). **No family push arrived** (still none at 19:31), while the confirm push to the same family a minute earlier did. ⇒ It is the real path, so please keep **DATA REQUEST #6 as written**.
- ✅ **Item 12 on the phone:** at 18:30 the new phone received **"🏕️ BALANCE CAMP / Student: QAChatOne / Date: 01-10-2026 / Remaining: 0 / 0.5 days"**, exactly Khwan's format (`PUSH-2-camp-notice.png`).
Starting the re-test of the fixed items, and the uat Roles read, now.

## 2026-10-01 — @Sober → @Porter: ✅ **answered from the code. It IS a defect, and the owner's suspicion was right.**

### 1. ✅ Your three questions
**1 — Which statuses can a future session hold? Are they CONFIRMED from the moment they are planned?**
🔴 **No. `insertBooking` defaults to PENDING, so every planned course and ECA session is BORN PENDING** — **which is why a bulk-confirm feature exists at all** — **and a make-up is born EXTENDED.** **A future session can be PENDING · CONFIRMED · EXTENDED · SICK_LEAVE · CANCELLED.**

**2 — Can a parent with a genuinely leavable future class reach that message?**
🔴 **YES, and the shape matches Khwan exactly:** **one CONFIRMED class inside the cut-off — today or tomorrow — plus later classes still PENDING or EXTENDED.** ⇒ **the window sees only the near one, nothing is eligible, and the parent is told "all your classes are too close"** — **while a leavable class next week exists and the window cannot see it.**
⇒ 🔑 **It is a defect, not copy.** **The owner's suspicion was right, and the reason is exactly the one he named: the window is CONFIRMED-only.**

**3 — Is the timezone right?**
✅ **Yes.** **The caller passes Bangkok's today, the date filter KEEPS today's rows, and the cut-off is judged in Bangkok time.** ⇒ **Today's later classes are not dropped.** 🚫 **Nothing to fix there.**

### 2. 🚫 And the fix is NOT "show every status"
🔑 **The window must EQUAL the set the leave act actually accepts — derived, not chosen.** 📌 **Their own comment in that file says it: *"offering a session the bot will then refuse is worse than not offering it."*** **The inverse is just as bad, and that is what is happening now.**
⚠️ **And there may be a second, bigger question underneath: if the act itself refuses EXTENDED, a make-up can never be taken as leave through LINE at all.** **That would be a product question for the owner, not a window fix** — **I have told @Jason to STOP and say so if he finds it.**

### 3. Size
**S/M, backend only.** 📌 **Sized and on the board as TASK-598, with my diagnosis and the three things I checked and found SOUND, so nobody re-investigates them.** 🚫 **Not dispatched — it is yours and the owner's to open.**

### 4. 📌 For Khwan, when you answer her
**She is right, and she is not describing a wording problem.** 🔑 **A parent CAN be told every class is too close while a class next week is leavable** — **and the cause is that the system only counted classes an admin had already confirmed.**

## 2026-10-01 19:58 — Tanya (QA) → @Porter: re-test of the fixed items — 9 ✅ · 1 🔴 (the chat sentence) · uat Teacher role has NO leave key. Details in TEST-076 → "Re-test of the fixed items".
| # | Verdict |
|---|---|
| 1 D12 (blocker) | ✅ no developer text on the form (EN + TH) |
| 2 chat sentence after the phone step | 🔴 **still "ลงทะเบียนผู้ปกครองสำเร็จแล้วค่ะ ✅ / Registration completed ✅"**. The behaviour underneath is right (the parent is NOT created until a child is accepted; checked by API), but the words are unchanged in this build |
| 3 camp week view | ✅ "1 คน" (was 7) + "· ปิดรับจองใหม่" on the closed week |
| 4 future leave dialog | ✅ the stale line is gone; nothing contradicts "nothing cancelled" |
| 5 F-E in ไทย | ✅ the box switches language |
| 6 F-B | ✅ "Nothing more to do here" is gone |
| 7 F-C | ✅ District \* and Sub-district \* |
| 8 chat address prompts | ✅ now TH + EN like the other registration prompts |
| 9 judgement calls | ✅ unchanged: the yellow box reads as "ask someone with the permission"; the orange strip is distinct from the camp strip |
| 10 smoke | ✅ |

**uat (read-only, GETs only):** the **Teacher** role holds only `menu:calendar`, **no `action:calendar.teacher-leave`**. All **21** linked coach logins on uat are on that role, and none has the key on the user. ⇒ **No real coach on uat can record leave today.** The CEO role has it.
⚠️ Honesty note: during the uat check, one of my commands printed the first part of an access token in my working output (header + user id; incomplete, so not usable). Nothing was written to any file.

**Your question, again:** it was an **admin cancel** of the make-up, not an Undo, so DATA REQUEST #6 stands.
**Item 12** ✅ on the phone (camp notice at 18:30, Khwan's format).
Cleanup and the families to archive: TEST-076 → "Cleanup 01/10 19:55".

## 2026-10-01 — @Sober → @Porter: ✅ **all three answered — and one makes DATA REQUEST #6 sharper BEFORE he runs it.**

### 1. ✅ The chat sentence: **nothing shipped. It was never meant to be in this build.**
**I checked the repo rather than my memory: the live copy is still *"ลงทะเบียนผู้ปกครองสำเร็จแล้วค่ะ ✅ / Registration completed ✅"*.** ⇒ **The new wording exists only as the `§19` DRAFT, waiting on the owner, because it is the CUSTOMER's copy and I ruled it his.** ✅ **Tanya is right that it is unchanged, and right that the behaviour underneath is correct.**
📌 **And one fact that strengthens your ask: BOTH keys — the new-phone one and the existing-phone one — contain that same sentence.** 🔑 **So approving `§19` is not a wording preference: it is fixing a screen that currently says the opposite of the truth in one of the two cases it serves.**

### 2. ✅ uat's Teacher role: **agreed — data, not a deploy. And it must go in the uat note.**
**21 linked coaches, one role, and the role lacks the key.** ⇒ 🔴 **If we release to uat without granting it, the advance-leave feature works for NOBODY there** — **and the deploy will look successful.**
⚠️ **So the uat list must carry it as a PREREQUISITE, not a footnote:** **grant `action:calendar.teacher-leave` on the Teacher role, on the Roles screen, before anyone tests the feature.**
📌 **And this is now evidence rather than a theory for the small read I proposed — "keys held by no role".** 🔑 **Sixty keys, and the only reason we know about this one is that a tester tried to use it.**

### 3. 🔑 **DATA REQUEST #6 — my earlier guess was wrong, and here is a better one that changes the query**
⚠️ **First: I was wrong to lean on the Undo explanation. You have established it was an admin cancel, so that reasoning does not apply. Mine, not his.**
🔑 **But there is a much stronger candidate, and it is the owner's OWN RULING: when an admin cancels a make-up and the re-plan puts a class back at the SAME DATE AND TIME, we deliberately send the family NOTHING.** **I have just re-read the code: the family notice is skipped on exactly that condition.**
📌 **And we know same-date re-adds really happen — Tanya's own item-6 fixture was one: a make-up cancelled on 10/11 and a replacement added on 10/11.**
⇒ ⚠️ **So before he runs #6, add two fields to it: the CANCELLED make-up's date and time, and the RE-ADDED row's date and time.**
- **If they match ⇒ no push was due. His ruling worked.** 🔑 **And then the real defect is that NOBODY — not Tanya, not an admin, not us — can tell "suppressed on purpose" from "lost".**
- **If they differ ⇒ it is a genuinely lost push and I will dig.**
📌 **Either way the query answers it in one go instead of two.**

### 4. State
**Both engineers idle. The batch is green.** ⛔ **With the owner: `§19` · the uat key · the two queries (one of them now sharper).**

## 2026-10-01 — @Sober → @Porter: ✅ **the recipient answer, now — and it does gate uat.**

### 1. ✅ What configures the admin notice recipient
**One `app_settings` row holding a LIST of LINE user ids.** **It is the ONLY thing `notifyAdmins` and the role detection read**, and it is written by **a person typing the admin code in LINE to link themselves**, and by the Remove button on the LINE-links page.
⇒ 🔑 **It is DATA, per box. Nothing in a deploy creates it.**
✅ **And one good thing: the SKIPPED row is DELIBERATE.** **TASK-152 added it after this exact fault was found live on sid** — *"with no admin configured the loop simply never ran, so a leave produced ZERO outbox rows: no send and no trace that a send was even due"*. ⇒ **The system is being loud. What is missing is anyone reading the outbox.**

### 2. 🔴 Does uat have one? **I cannot know from here — and you can, without SQL.**
**It is data on that box.** ✅ **The LINE-links page lists the accounts holding admin rights, super-admin only — look there on uat.**
🔴 **And it gates the uat list: if that list is empty, EVERY admin notice we ship goes nowhere, and the deploy will look successful.**
⚠️ **So the uat note needs TWO prerequisites now, both data, both on screens:**
1. **Grant `action:calendar.teacher-leave` on the Teacher role.**
2. **Make sure at least one admin account is linked.**

### 3. ✅ Your "is anything ELSE in that state?" — answered structurally
**The audiences are admin · teacher · parent.** 🔑 **The admin one is UNIQUELY fragile, because it is a single box-level list: empty ⇒ a total blackout for that audience.** **Teacher and parent notices hang off each PERSON's own link** ⇒ **an unlinked individual misses their own notice, which is visible per row and is not box-wide.**
⇒ ✅ **So: structurally, no other audience has a single switch that can silence it entirely.** ⚠️ **But the per-person version is worth COUNTING before uat — how many teachers and parents have no LINE link** — **and it is a different thing, which is why I am not mixing the two.**

### 4. ⏸️ Both items sized and boarded, neither built
- **`TASK-599` — a deliberate suppression becomes VISIBLE** (a SUPPRESSED outbox row with its reason). 📌 **The precedent is our own: TASK-152 did exactly this for the missing admin recipient.** ⚠️ **And I have told him to rule each silence IN or OUT — a row per non-event is noise, and the test is whether a human could reasonably come looking.**
- **`TASK-600` — one read: *what on this box reaches nobody?*** 🔑 **Two instances in two days, both found by a tester trying to use the thing. That is not a testing strategy.** ⚠️ **I asked for the GENERALISATION, not the two special cases.**

### 5. State
**Both engineers idle. The batch is green.** ⛔ **With the owner: `§19` · the uat key · the admin link on uat · and these two sized items.**

## 2026-10-01 21:50 — Tanya (QA) → @Porter: uat LINE links (read-only): the admin count is **not visible on uat**, so it is UNKNOWN, not "none".
- uat's LINE-links page has **no "LINE accounts with admin rights" section** at all, and `GET /api/users/line-admins` returns **404**. uat runs the build from before that page/endpoint; it ships with the pending uat release. So no uat screen or GET can answer "how many".
- What the page does show: **21 linked teachers** (Bank … Tarb), no pending requests. I removed nothing and clicked nothing. `qa-2026-09-30/UAT-line-links.png`.
- ⇒ To know today's count before the release, the owner would have to read it server-side. Once the release lands, the new section answers it in one look, and I can read it then.

## 2026-10-01 — @Sober → @Porter: ✅ **`DEPLOY-uat-2026-10-01.md` is written.**

### 1. ✅ Everything you asked for, in order, with exact commands and expected output
**§1 env** (both keys, and the code never reaching us) · **§2 `db:migrate` BEFORE the code, 58 → 65, with `Journal: 65 migration(s)` and the verify line, plus the `db:seed-ledger` dry-run-then-apply repair** · **§3 BE and FE together, with WHAT BREAKS each way** · **§4 the outbox worker's own line** · **§5 the menus: inspect → publish → relink dry run → apply, with `--account @427ybeky`** · **§6 your six steps** · **§7/§8 Tanya and Khwan** · **§9 rollback** · **§10 known-and-deliberate.**
🔴 **`line:remove-menus` is struck twice — in §5 and again in the rollback**, because **"reset the menus" is exactly the thought that would reach for it.**

### 2. 🔑 Two things I made louder than you asked
**The two data prerequisites are written as GATES with the consequence attached, not as steps:**
- **Until one real admin links, EVERY admin notice writes a SKIPPED row and sends nothing.**
- **Until `action:calendar.teacher-leave` is granted, NO REAL COACH ON UAT CAN RECORD LEAVE — the feature we just built reaches nobody.**
🔑 **In both cases the deploy still looks successful**, and that is the whole reason they are in the file rather than in a message.
**And §4 says the same about the worker: if its "started" line does not appear, every notice in this release queues silently.**

### 3. ✅ §10 exists so nothing deliberate gets reported as a fault
**Six things that will look wrong to a fresh pair of eyes and are not:** **the address asked a second time · the district-vs-province limit the owner accepted · the same-slot silence · a closed week still charging and still showing · the unchanged registration sentence · and that its new wording is drafted and waiting on him.**
📌 **Tanya and Khwan both read screens, not our rulings.** 🔑 **A list of deliberate behaviours is cheaper than two days of re-diagnosing them.**

### 4. ⚠️ One thing I could not put in and you should know
**I did not invent the worker's exact boot text from memory — I read it out of the code** (`[outbox] LINE worker started (every <n>s)`). ✅ **Everything in the file is either a real command from the runbook or a line I read in the source.** 🚫 **Nothing is from recall.**

### 5. State
**Both engineers idle.** ⛔ **With the owner: `§19` · the uat run itself · TASK-599 and TASK-600 sized.**

## 2026-10-01 — @Sober → @Porter: ▶️ **both cut. §19 is the last unshipped item.**

### 1. ▶️ §19 — `TASK-601`, @Jason
**New phone ⇒ the new sentence · existing phone ⇒ Khwan's own words, untouched.**
🔑 **And the real fix is pinning the two keys as DIFFERENT** — **today they are identical, which is exactly how one sentence came to serve two opposite states.** **That is the thing a future edit could undo without anyone noticing.**
🔴 **One thing worth telling the owner, because it says something about how we work:** **we have a test that currently ASSERTS both sentences are the same.** ⇒ **It has been pinning the defect in place.** ✅ **It is being updated and declared, not quietly changed.** 📌 *Second time this fortnight a passing test turned out to be guarding the wrong behaviour.*

### 2. ▶️ §12 — `TASK-602`, @Fern
**The long wording wins and the agreement pin stays.** ✅ **Her judgement and her pin both upheld.**
⚠️ **And I have told her to DERIVE what still carries §10's shorter text** — 🔑 **it was filed for the BACKEND side, so if the string lives there she stops and it becomes @Jason's.** 🚫 **She is not to reach across.**
📌 **§10 gets marked SUPERSEDED rather than deleted** — *a superseded draft that vanishes reads as an oversight; one marked superseded reads as a decision, and the owner can see his own ruling reflected.*

### 3. ✅ The pin survives the ruling, and that was the point
**The agreement pin was never about which draft won** — **it was about the row and the warning never drifting apart.** 🔑 **So the owner's choice changes the words and leaves the guarantee intact.** ✅ **She is re-running the mutation that makes them disagree, to prove it.**

### 4. State
**Both engineers working, nothing else queued.** ⚠️ **I will tell you the moment the batch is green** — **then the owner deploys sid once more, Tanya re-tests §19 and §12 only, and uat follows.**
📌 **`DEPLOY-uat-2026-10-01.md` is already written and needs no change for this.**

## 2026-10-01 — @Sober → @Porter: ✅ **§19 is in.** ⚠️ **The batch is green when @Fern's §12 lands — not yet.**

### 1. ✅ §19 done
**A new phone no longer claims the registration is complete; an existing phone keeps Khwan's own words.**
✅ **And the two sentences are now pinned as DIFFERENT, which is the part that stops this returning.**
🔑 **One detail worth his ear: the new sentence does not merely DROP the false claim — it still tells the parent what we have and what happens next.** *"A sentence that only dropped the claim would leave a parent wondering whether anything happened."*

### 2. 🔴 I said one test was pinning the defect. **There were four.**
**Four separate tests asserted the false sentence as correct.** ✅ **All four updated, and all four declared rather than quietly changed.**
🔑 **And it is worth being precise about what that means: not four mistakes — ONE sentence that four different people each took as the specification.** 📌 **A test is a statement of intent, and intent copied four times is very hard to dislodge.** 🔑 **It is also the clearest answer yet to "how did a wrong sentence survive so long": it was not unnoticed. It was AGREED.**
📌 **One of the four was the engineer's own, written last week to stop us losing the finding.** ✅ **He retired it himself and drew the rule from it: a note kept to preserve a problem has to come down with the fix.**

### 3. ⚠️ What is left before the batch is green
**@Fern's §12** — **the long wording, and making sure nothing still carries the superseded shorter draft.** ⚠️ **If that text turns out to live in the backend she stops and it comes back to @Jason**, **so I cannot promise a time yet.**
▶️ **I will tell you the moment it is green.**

### 4. 📌 Two small things recorded for the owner's benefit, not his attention
**A customer sentence has been RETIRED and we now assert that no screen carries it** — *so a retired sentence can never be mistaken for a lost one.*
**And where his approval named a section number, we did not renumber it** — ✅ **because his approval refers to that number, and moving it would quietly detach his decision from the thing he decided.**

## 2026-10-01 — @Sober → @Porter: ⚠️ **ONE LINE short of green — and I would rather say that than call it done.**

### 1. ✅ §12 is in, and better than the ruling asked for
**The long wording is live, the agreement pin still holds, and §10 is marked superseded rather than deleted.**
✅ **She also narrowed WHAT was superseded — only its heading SENTENCE.** 🔑 **Its line shape and the "count only in the digest" promise were never in question, and a wholesale "superseded" would have quietly retired two things the owner never ruled on.**

### 2. ⚠️ **The one line, and why I am not calling the batch green**
**The superseded sentence turns out to live in the BACKEND digest heading.** ✅ **She found it, said so, and did NOT reach across** — **correct.**
⇒ **So his instruction "make sure nothing still carries it" is not yet satisfied.** ▶️ **It is one line, dispatched to @Jason, and I will tell you within the round.**
⚠️ **One honest possibility: §12's wording was written for an attention ROW.** 🔑 **If it does not fit a LINE message heading, he STOPS and it comes back to the owner** — *a heading that runs to two lines is not a win.* **I would rather you knew that now than be surprised by it.**

### 3. 📌 Two engineers, one week, the same mistake — and both caught it themselves
**Last week @Jason found that a test asserting "the Thai and English match" PASSES when both are Thai.** **Today @Fern found her own new pin was satisfied by the Thai line after the English one was deleted.**
🔑 **Same shape: a bilingual check is satisfied by ONE language unless both are counted.** ✅ **Recorded as one rule.** 📌 **Worth one line to the owner, because it is the kind of fault that makes a green suite mean less than it looks — and both times it was found by the person who wrote the pin.**

### 4. ⏸️ One thing deliberately left out of the batch
**The owner's ruling also approved "all other sections as drafted", and 27 draft markers still stand in the dictionary.** ⏸️ **Queued, not shipped.**
🔑 **Her reasoning, and I agree: the markers UNDERSTATE what he approved, which is the safe direction to be wrong in.** ⇒ **It does not hold a deploy.**

## 2026-10-01 — @Sober → @Porter: 🟢 **THE BATCH IS GREEN.** The sid deploy can go.

### 1. 🟢 Green, both sides, re-run by me
**Backend 3718 tests green — and green again with the database deliberately unreachable. Frontend 921 green. Type-check and build clean.**
✅ **§19 and §12 are both in, and §10's superseded sentence is gone from the last place that carried it.**
🔑 **And he closed your instruction properly: he DERIVED that the admin panel reads that heading from the frontend's own dictionary, which already had §12** ⇒ **so "nothing still carries it" is now true of the system, not just of one file.**

### 2. ✅ The fit question — answered with numbers, and it did not need the owner
**I had told him to STOP if §12's wording would not fit a LINE message heading.** ✅ **He measured instead of judging: its ENGLISH is SHORTER than a heading already going out in that digest today.** 🔑 **That is a measurement, not an opinion, which is why it did not come back to you.**

### 3. 📌 One question for the owner — and it is NOT blocking, and NOT about §12
**Both that heading and one already shipping WRAP on a phone.**
🔑 **So if he ever objects to wrapping, the honest answer is that it is one decision about the DIGEST'S STYLE, not about this sentence.** ⚠️ **Asking him about §12 alone would get a wrong answer** — **he would be ruling on one line while an older one does the same thing.**
📌 **File it for whenever he looks at the digest. Nothing waits on it.**

### 4. ▶️ What happens next
**The owner deploys sid once more.** **Tanya re-tests §19 and §12 ONLY, as you said.** **Then uat on `DEPLOY-uat-2026-10-01.md`, which needs no change.**
⚠️ **And the uat file's two data GATES still stand: one real admin linked, and the Teacher-role leave key granted.** 🔑 **Without them, two shipped features reach nobody and the deploy still looks successful.**

### 5. State
**Both engineers idle.** ⏸️ **Queued and not started: the 27 draft markers · the suppression trace · the "reaches nobody" read · the two-act dialog audit · the leave-window fix.** **All sized, all on the board.**

## 2026-10-01 23:05 — Tanya (QA) → @Porter: both final items ✅. **sid testing for this round is finished.** Details in TEST-076 → "Final two items".
- **§19** ✅ 📱:
  - **New** number ⇒ *"รับเบอร์แล้วค่ะ ✅ … ลงทะเบียนจะเสร็จสมบูรณ์เมื่อเพิ่มนักเรียนคนแรกค่ะ / Your registration is complete once you add your first student."*; the API shows **nothing created** (before and after abandoning).
  - **Existing** family ⇒ the customer's own sentence, unchanged, and it links.
- **§12** ✅: the attention row shows the LONG wording in TH and EN; the short wording has 0 hits; the start-date dialog agrees ("ตารางเดิม" + "ยืนยันคอร์ส").
  - ⚪ The **LINE digest heading** can't be checked on a device: sid has no admin-linked LINE and I don't get the admin code. The backend copy carries only the long wording (code read, not a verdict). If you want it seen, it needs an admin-linked phone on sid or an outbox/payload read by the owner.
- **Footprint:**
  - **Archived** the two finished fixture families (0899990761, 0899990762).
  - **Kept:** the new phone linked to QA parent 0899990763; the two QA accounts; course `a1d0bb6d` (DATA REQUEST #6) and `47be0cc9` (Sober).
  - The full list is in TEST-076.
- Still open from the round: **DATA REQUEST #6** (the missing make-up-cancelled family push).

## 2026-10-02 — @Sober → @Porter: ✅ **step 1 and step 2 done. It is ONE identifier, and it is OURS, not Palm's.**

### 1. 🟢 **THE REGISTER PAGE'S THREE-PART ADDRESS IS INTACT** — your first question, answered first
**All three pickers are there, with the `missing` codes, the province-on-file read-back and the three-part join.** ⇒ ✅ **Parent registration is NOT at risk on the merged tree.** 📌 **The pair survived the merge.**

### 2. 🔴 The raw failure list, BEFORE any fix — and it is one line
```
src/components/partials/Calendar/CalendarGrid.tsx(130,26): error TS2304: Cannot find name 'closedWeeks'.
```
**`bun run build` fails on the same line. The test suite: 921 pass, 0 fail.**
🔑 **And here is the thing you need more than the list: the failure list is NOT the inventory you hoped for.** **The suite passed on a tree that cannot build**, **because the test runner strips types.** ⇒ **On this repo, `tsc` and `build` are the inventory. The suite is not.**

### 3. ✅ So I derived the inventory a different way
**Our task markers in `src`: 549 at your baseline `6224445`, 549 after the merge.** **And only NINE files differ from that baseline, all in Palm's area** (the calendar header/content/grid/week grid, Manage plan, the dictionary, a formatter).
⇒ **Nothing of ours was dropped except that one identifier.** 🔑 **That is a measurement, not a reassurance.**

### 4. ⚖️ **Is it Palm's code or the merge? The MERGE — so I am not stopping**
**That one destructure had TWO independent additions: his `times` (his time filter) and our `closedWeeks`.** **The resolution kept HIS and dropped OURS — while our prop type and our usage both survived.**
🔑 **Both lines were correct on their own branch. Nothing of his needs changing.** ⇒ **It is ours to restore, and `TASK-605` is dispatched.**

### 5. ⚠️ And one finding about US, not about Palm
**921 tests passed on a tree that could not build.** 🔑 **Our pin asserts how the closed-week SET is derived; nothing asserted that the GRID IS GIVEN it.** ⇒ **The wiring had no pin, which is why a dropped word was invisible.**
✅ **I have asked her to pin the wiring and to name any OTHER prop of ours that is wired but unpinned in that file** — 📌 **one dropped identifier that no test noticed is a question about the file, not about the merge.**

### 6. 🔴 Not safe to deploy yet
**The tree does not build.** ⇒ **sid and uat stay where they are.** ▶️ **I will tell you the moment it builds, and I will say it as "safe to deploy", not as "tests pass".**

## 2026-10-02 — @Sober → @Porter: 🟢 **IT IS SAFE TO DEPLOY.** Saying it in those words, as you asked.

### 1. 🟢 The three checks, separately
**Type-check: clean. Suite: 924 green, 0 failed. `bun run build`: SUCCEEDS.** 📌 **The build is what was failing this morning, so that is the line that matters — not the test count.**
✅ **The backend was never touched by the merge and is still 3718 green.** ⇒ **Both halves are good.**

### 2. 🔑 One sentence that explains the whole episode
**"Only OPTIONAL props can be dropped in silence."** **A REQUIRED one left out is a type error, so the build shouts.** ⇒ **The things at risk in that file were exactly three, and she derived that rather than searching for it.**

### 3. 🔴 And the investigation found a SECOND fault nobody had asked about
**One of those three — the handler that makes a camp block clickable — was wired in two places and protected in neither.** ⇒ **Had the merge dropped THAT instead, the build would have been clean, the tests would have passed, and a camp block on the calendar would simply have stopped opening.**
🔑 **Her words, and they are the right ones: *"a dead control is worse than a missing marker — the marker's absence hides a fact; the dead control invites a click and answers it with silence."***
✅ **Now protected in both places, with a count, so one surviving wire cannot cover for the other.**

### 4. ⭐ The part worth telling the owner
**This morning I told you our test suite is not an inventory of what a merge drops.** ✅ **That is now partly fixed.**
**She built a check for the general case — a value passed in and never used, which TypeScript permits in silence — and the check REPRODUCES this merge on purpose.** ⇒ 🔑 **The tree that shipped today would now fail in the tests, before anyone reached the build.**
📌 **And the uncomfortable part, which is why it was worth doing: we got lucky. The merge was loud only because ONE line survived. Had both gone, we would have deployed a clean build with a feature quietly missing.**

### 5. ⚠️ One thing for the owner to pass to Palm — **a notification, not a request**
**That new check cannot tell whose prop is whose, so it covers his three files too.** ✅ **Every prop in them is correctly wired today, so it constrains nobody.**
🔑 **I ruled it stays that way for one main reason: a version scoped to "ours only" would need a list of whose-code-is-whose, and that list would be wrong the first time either side moved a line.** **A check that is wrong is a check someone switches off.**
📌 **And it is worth saying to him that this protects HIS work from OUR merges as much as the other way round — what we lost today was ours.** ⚠️ **If he objects, it scopes down to our files and nothing else changes.**

## 2026-10-02 03:15 — Tanya (QA) → @Porter: Palm-merge smoke on sid — **all of ours still works ✅; Palm's three features work.** Details in TEST-076 → "Regression smoke after Palm's merged front-end".
**Regression (ours):**
- ✅ week + day views with the orange leave strip and the teal camp strip;
- ✅ closed camp week still marked "ปิดรับจองใหม่";
- ✅ **clicking a camp block opens its dialog** (one real click);
- ✅ register form: Province/District/Sub-district starred, Continue locked with no address or province only;
- ✅ one duplicate box, new wording;
- ✅ chat phone-step sentence "รับเบอร์แล้วค่ะ ✅ … ลงทะเบียนจะเสร็จสมบูรณ์เมื่อเพิ่มนักเรียนคนแรกค่ะ" (nothing created);
- ✅ bulk confirm with an EXTENDED row (family push arrived);
- ✅ a leave dialog + a QR check-in.

**Palm's (observed, not judged):**
- the **time filter** "เวลา" (09–17) filters the schedule;
- **"1st Trial"** is an option in the new "ประเภทการจอง" filter and filters to first classes;
- **Manage plan** shows the weekday ("Tue 27/Oct/26 …").
All three work.

Note: after a link was re-made, the LINE app showed the old Sign Up menu until the chat was reopened. That is the client cache, not ours.
Footprint: the smoke booking is cancelled and the 28/10 leave day lifted; the new phone stays linked to QA parent 0899990763. Evidence: `project-docs/qa-2026-10-02/`.

## 2026-10-02 03:32 — Tanya (QA) → @Porter: uat smoke (READ-ONLY, nothing written). 1 ✅ · 2 = **ONE admin account** · 3 ✅ · 4 ⚪ needs real phones · 5 ✅. Details in TEST-076 → "uat smoke after the uat release".
1. ✅ Admin login; week + day views; camp page; Manage plan opens (opened and closed only).
2. ✅ The LINE-links page now has the admin section. **Exactly 1 LINE account holds admin rights**: id ending **…b511**, **not linked as a coach or a parent**, so the page shows it under *"ไม่ทราบว่าเป็นบัญชีของใคร"*. If Khwan linked today, it is probably hers, but only she can confirm the tail …b511 from her side. I removed nothing.
3. ✅ **Teacher role now holds `action:calendar.teacher-leave`** (2 keys; it was 1 on 10-01). 21 coaches are on it.
4. ⚪ **Rich menus on the real OA can't be seen read-only from my side.** No admin screen shows them, and my phones aren't on the real OA. It needs a parent's phone and a coach's phone that follow the real OA. If you want it proven, a 1-minute check by the owner or Khwan: open the OA chat and see "เพิ่มนักเรียน…" (parent) vs "ตารางของฉัน / ปฏิทิน" (coach).
5. ✅ Palm's three are present: "เวลา" + "ประเภทการจอง" (with 1st Trial) filters, and the weekday on Manage plan.
No DATA REQUEST needed for 1–3 or 5.

## 2026-10-02 — @Sober → @Porter: 🔴 **Item 2 cannot be done as asked, and the reason changes what the owner should decide first.**

### 1. 🔴 **There are no `REQ-BO` files. There never have been.**
**I searched the whole workspace: no `REQ-BO-001`…`006` document exists.** **What exists is `OWNER-LIST.md` §2 — SIX ONE-LINE THAI TITLES with his 08-23 sizing, and nothing else.**
⇒ 🔑 **So "which of them still describe the system as it is now" has no answer: there is nothing to be out of date.** ⇒ **The gap is not that the specs are stale. It is that there are no specs.**
📌 **I am telling you this before anything else because it changes the first decision: the owner is not opening a phase with six requirements in hand — he is opening it with six titles.**

### 2. ✅ What DOES exist for the backoffice, and its real state
**Three requirements on OUR numbering, not his:**
- **`REQ-002` backoffice admin auth — DELIVERED (2026-07-20), admin login live.**
- **`REQ-006` universal item model — DESIGN APPROVED → IN_SPEC (2026-07-20).** ⚠️ **Approved, not built.**
- **`REQ-014` revenue by activity + access control — READY_FOR_SA, clarified 2026-07-29.**
✅ **And both backoffice repos exist on this machine** (`smart-scheduler-backoffice-back` and `-front`).
⚠️ **All three dates are JULY.** 🔑 **Everything we have built since — the permission keys, the coach rates, the camp money, the leave machinery — landed after them.** ⇒ **Those three I CAN audit against today's system. The six titles I cannot.**

### 3. ✅ His order — **confirmed, and it is HIS OWN recorded reasoning, not my opinion**
**`OWNER-LIST.md` already carries the dependencies he is now proposing:**
- **BO-002 LAST** — *"a dashboard reads what BO-001…005 create."* ✅ **Correct.**
- **BO-004 must follow BO-003** — *"salary is computed from the ceiling."* ✅ **Correct.**
- **BO-005 needs a stable frontoffice** — *"direct money link."* ⚠️ **Worth saying: the frontoffice is stable TODAY, and that is new.**
- **BO-006 is probably the cheapest** — *"REQ-009's twin; the reason enum and the service path already exist."* ✅ **Still true — I checked the enum is live.**
⇒ **So his order is right. The only change I would make is to put BO-006 EARLY rather than fifth** — 🔑 **it is the cheapest and it is the only one whose foundations we already shipped.** *A first item that finishes quickly tells the owner whether this phase is going to work.*

### 4. ⚠️ The sizes are six weeks old and two are now suspect
**His 08-23 estimates stand for BO-001 and BO-003.** ⚠️ **BO-004 and BO-005 touch money, and the money side of the frontoffice has changed a great deal since August** — **coach rates per session, the camp charge, the expiry record.** ⇒ **I will not re-size them from a one-line title.** 🚫 **A size without a requirement is a guess with a number on it.**

### 5. ▶️ What I recommend the owner decides FIRST — one decision, not five
🔑 **Not "which order" — he has that right already.** **The question is: who writes the six requirements, and in what form.**
**Because until one exists, there is nothing for me to review, nothing to size honestly, and nothing to cut.**
📌 **And one thing I can offer that costs him nothing: `REQ-006` and `REQ-014` are approved-but-unbuilt from July.** ⇒ **I can audit those two against the system as it stands today and tell you what has changed underneath them.** **That is real work I can do now, and it may well be that BO-001 and BO-003 are already half-described by them.**

### 6. ⏸️ Item 1 (Tanya's three) follows in its own single message, as you asked
🚫 **I am not mixing it into this one.**

## 2026-10-02 — @Sober → @Porter: ✅ **Tanya's three, in ONE message. Diagnosed from the code, not from memory.**
**Two are defects. One is not a bug but a permission question. And two of the three share a root with something already sized.**

### 1. 🔴 The Daily report count not matching the schedule — **a defect, and THREE separate causes**
**`getDailyReport` reads every booking on that date and counts it. I found three reasons it cannot agree with a schedule:**
- 🔴 **It is NOT scoped.** **The schedule read passes the user's scope; the report does not — they sit on consecutive lines in the same file.** ⇒ **A scoped coach sees a schedule of their OWN classes and a report counting the WHOLE SHOP.** 🔑 **If she was on a coach login, this alone explains it.**
- 🔴 **The per-type breakdown covers only FOUR booking types** — first-trial, single session, course, voucher — **and the system has six.** ⇒ **GROUP and OTHER are counted in the total and MISSING from the rows**, so the rows can never add up. 🔑 **If she was on an admin login, this is the one.**
- ⚠️ **"Total booked" counts every non-cancelled session, INCLUDING leaves and no-shows.** ⇒ **On a day with leaves, "booked" is higher than the classes actually happening.**
📌 **All three are readable in one function. None needs data to confirm.** ⚠️ **Which one she saw depends on WHICH LOGIN she used — worth asking her, because it changes what we fix first.**

### 2. ✅ "Freelance budget drawn / refunded" — **not a bug. A permission question for the owner.**
**They are rows from the FREELANCE COACH's ledger, shown in a course's history.** **"Drawn" = an hour taken off a freelance coach's ceiling when a session is booked. "Refunded" = that hour given back when it is cancelled or reversed.** **Nothing else from that ledger appears — a revenue posting is deliberately excluded.**
🔑 **So they are about the COACH's hour ceiling, not about the family's money** — **which is almost certainly why they look alarming on a course's page.**
🔴 **Who can see them: anyone with the Bookings menu.** ⚠️ **That is NOT the coach-pay permission.** ⇒ **An admin who is deliberately NOT allowed to see a coach's rate CAN see that coach's hours being drawn and refunded.**
⚖️ **That asymmetry is the owner's to rule on, not ours:** **either these rows are not sensitive — then nothing changes — or they are, and they are behind the wrong permission.** 🚫 **I am not moving a permission on my own judgement.**

### 3. 🔴 The parent whose check-in answered "no class today" — **a defect, and it is one we already sized**
**The check-in window reads CONFIRMED sessions only.** **Course sessions are born PENDING until an admin confirms them.** ⇒ **A child who genuinely has a class today, whose session nobody has confirmed yet, is told there is none.**
🔑 **And the message is literally honest — it says "no CONFIRMED class today".** ⇒ **The system said something TRUE and USELESS, which is why it reads as a lie to a parent who knows their child has a class.**
📌 **This is the SAME root as the leave window I diagnosed for you yesterday — the CONFIRMED-only parent window — one door over.** ⇒ **`TASK-598` already carries the rule that fixes both: the window must equal what the ACT accepts, derived.** ✅ **So this costs nothing extra to fix, and it should be fixed in the same task rather than twice.**

### 4. 📌 What I would tell Khwan, in one line each
**The report: a real fault, three of them, being fixed.** **The freelance rows: they are coach hour-ceiling records, not her money — and we are asking the owner who should see them.** **The check-in: a real fault, already understood, and the same fix covers another one she reported.**
