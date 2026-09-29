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
