# REQ-079: LINE chatbot — ลงทะเบียนนักเรียนเอง (hybrid bot + admin)

- Status: **CAPTURED — NOT `READY_FOR_SA`.** The source document's own next step is the owner producing a design
  flow and timeline for approval *before* development starts. Nothing here is buildable yet.
- 🔢 **The owner's number for this is REQ-016** (assigned 2026-09-01). Quote **REQ-016** to him, use REQ-079 in tasks.
- Priority: TBD by the owner. It is a **different deliverable** from
  REQ-077 / his REQ-014 (rich menu + notification set).
- Requested: 2026-08-31 — customer call, summarised by the owner
- Source: `H:\scheduler\call-20260831.md` *(code-repo path — per workspace rules it is named here, never
  committed as a path; the file itself is outside `ai-worker/`)*

## ⚠️ Provenance — read before treating anything below as a requirement

This is a **NotebookLM summary of a recorded phone call**, not the customer's own written words and not a
transcript. It is second-hand twice over: audio → machine summary → this file. **On this project the standing
rule is that an assumption you can see is safe and one you cannot is how things break.** So:

- Everything below is recorded as **what the summary says**, not as agreed requirement text.
- 🔴 **The three conflicts in the next section must be confirmed with the owner in his own words before any
  design is frozen.** A machine summary of speech is exactly where a negation or a qualifier goes missing.
- The document names *"ผู้ออกแบบระบบ (พี่โด่ง)"* — **the owner himself is the designer here.** Most of the
  "next steps" in the document are **his** work, not this team's.

## What the call decided (as summarised)

**1. The bot becomes HYBRID, not 100% automated.** Commands and a human admin share one account.
📌 **This independently confirms the owner's own 2026-08-30 correction** recorded in `REQ-077` — *"admin เขาจะสิง
ไลน์นั้นแหละ ไปตอบลูกค้า"*. Two separate routes to the same conclusion; the reframe is settled, not a hunch.
⚠️ **Named risk, already spotted in the call:** commands can be **triggered accidentally** by ordinary chat.

**2. Registration flow after payment** — five steps:
| # | Step |
|---|---|
| 1 | Admin tells the customer to type **"สมัคร"** |
| 2 | The bot asks for a **phone number** and checks the database |
| 3 | The customer types the **student's name** (+ new fields: **birthdate**, **province**) |
| 4 | The student data **lands in the back office automatically** |
| 5 | The admin takes it from there and schedules the student |

**3. Duplicate names.** Two students with the same name — even on different phones — must raise an **alert**, so
staff do not book the wrong child. Suggested: add a surname or another distinguishing mark.

**4. Returning customers.** After entering a phone number, the system should **list the students already linked
to it** instead of asking the customer to type a name again.

**5. Masked names are being reversed** — student names were shown as numbers for privacy; the call decided to
show **real names** for clarity, for both admin and parent.

**6. Old customer on a new LINE account** must be able to re-link **without going through a purchase again**.

## 🔴 Three things that need a decision BEFORE the design is frozen

**(1) The PII reversal (item 5) contradicts a deliberate, previously-made safety decision.**
This project **already fixed a LINE pairing PII leak** (TASK-047), and `REQ-051` carries an explicit rule from
the same family: **nicknames only**, and an **identical neutral message** for "no session" and "unknown number",
so the page cannot be used to test whether a phone number belongs to a customer.
The exposure is not theoretical: **a phone number is not a secret.** If typing one returns a list of children's
real names, anyone can harvest it.
⇒ **Not a veto — the owner may well decide clarity wins for a logged-in admin.** But *admin* and *a stranger in
the LINE OA* are different audiences, and the decision must say which one it applies to. **Ask; do not let a
summary bullet quietly reverse a safety rule.**

**(2) LINE would become a WRITE path into the student database (item 2, step 4).**
Today students are created by staff or by the importer. Letting a parent create one from chat is a genuinely new
capability, and it inherits every lesson the import work taught: **REQ-059** (an importer that forks the roster
on a `(phone, name)` key when 31 names were edited), **REQ-060** (demographics arriving invisible).
⇒ Questions the owner must settle: what happens on a **typo**, a **duplicate**, a **half-finished** registration?
Can a parent create a student who never pays? Who can delete one — **there is still no student-delete anywhere.**

**(3) "Duplicate name alert" (item 3) is the same defect family as REQ-050 — and REQ-050 is the harder half.**
`REQ-050` exists because a check-in must land on the **right child**; its whole premise is that a parent with two
children must **choose**, never have the system infer. An alert at registration is the cheap half. ⇒ Worth
building them as one thought rather than twice.

## ✅ What we already have that this reuses — this is smaller than it reads

| The call asks for | We already have |
|---|---|
| phone → list that phone's students (item 4) | **`REQ-051`** does exactly this (scan → phone → children list) and its architecture is done |
| duplicate-child safety (item 3) | **`REQ-050`** — the same problem, already specified and built for check-in |
| re-link an old customer on a new LINE account (item 6) | **`REQ-020`** — secure LINE pairing: approval, collision, control |
| admin + bot in one account (item 1) | **`REQ-077`** — already reframed for exactly this |

⇒ **Recommend the owner sequence this with `REQ-051`, not separately.** Both are "type a phone, get this
family's children, act on one" — the same lookup, the same PII question, the same neutral-message rule.

## Acceptance Criteria

🔴 **Not written.** The flow is not designed yet — the document says so itself. Writing ACs now would freeze a
machine summary as the specification.

## Questions — @Porter to the owner

1. **The PII reversal — your words, not the summary's.** Show real names to whom: the **admin** only, or the
   **person typing a phone number into LINE**? These are different systems.
2. **A parent creating a student record** — is that really the intent (step 4)? And what stops a typo, a
   duplicate, or an abandoned half-registration from landing in the roster there is no delete for?
3. **Sequence:** should this ride with **REQ-051** (same phone→children lookup) rather than stand alone?
4. **Whose work is the design flow?** The document assigns it to *"ผู้ออกแบบระบบ (พี่โด่ง)"* — you. Confirm the
   team is **waiting** on it rather than starting, so nobody builds against a summary.

---

## 💡 The "show names from the phone number" problem — options for the owner (Porter, 2026-09-01)

> Owner: *"เรื่องเปิดชื่อนักเรียนตั้งแต่ใส่เบอร์ ลูกค้าต้องการ แต่ฉันก็คิดอยู่ว่าจะทำไงดี คิดไม่ออกเหมือนกัน"*

**The reframe that makes it solvable:** the question is not *"should we show names?"* — the customer has already
answered that. It is **"who has to prove they belong to that phone number before the names appear?"**
Right now the implied answer is *nobody*, which is the entire problem. Anyone who types any number learns whether
it is a customer and who their children are.

**And the answer is already sitting inside the owner's own flow.**

### Option ก — the admin opens the door (Porter's recommendation)

The call's own step 1 is *"แอดมินส่งข้อความให้ลูกค้าพิมพ์คำว่า สมัคร"* — **an admin is already in the
conversation.** So let the admin be the gate: they send a **one-time link or code into that specific chat**, and
the bot treats that conversation as authorised for that phone number. After that, **full real names, no masking.**

- The customer does nothing extra — they were talking to the admin anyway.
- A stranger typing a phone number into the bot gets nothing, because no admin vouched for their chat.
- It costs **zero** taps for the person we are trying to help, and closes the hole completely.

### Option ข — a linked LINE account should never be asked for a phone at all

For a returning customer whose LINE is already linked, **the system already knows who they are** — LINE
authenticates the account; the phone number adds nothing. ⇒ **Show their children immediately, no phone step.**
This is a better answer to the call's own item 4 ("show the list instead of retyping the name") than the phone
lookup is, and it removes a step rather than adding one.

### Option ค — partial display (`น้องร...`)

Enough for a parent to recognise their own child, useless for harvesting. **Cheapest to build, but it fights the
customer's stated wish for clarity** — offer it only if ก and ข are both rejected.

### Recommendation

**ก + ข together.** ข covers every returning customer (the common case, and it gets *faster*, not slower);
ก covers new customers, using an admin who is already there. **No path remains where a stranger types a phone
number and learns anything** — so the safety rule from TASK-047 and REQ-051 is kept without the customer ever
feeling it.

⚠️ **This is a business/UX proposal, not a design.** *How* a one-time authorised chat is represented is Sober's
call, and it should be checked against REQ-020's existing pairing mechanism, which already solves "prove this
LINE account belongs to this person" and may make ก nearly free.

### 🔴 The case that breaks the whole model — the owner, 2026-09-01

> *"ถ้าคนเป็นแม่ผูกไว้แล้ว แต่วันนี้แม่ป่วยทำอะไรไม่ได้ แต่พ่อจะลา ให้ทำไง ไลน์พ่อไม่ได้ผูก ไลน์แม่ก็มีรหัส PIN"*

**This is not an edge case. It is the normal life of a family, and it exposes a wrong assumption underneath
everything we have built on LINE:**

> **The system models ONE LINE account per family. A child has more than one guardian.**

📌 **The PIN detail is the sharp part.** Every "just use mum's phone" workaround dies on it — the father
physically cannot. Any design that assumes a household shares one reachable device is wrong, and we have been
quietly assuming exactly that.

**Three answers, and they are not alternatives — they are layers:**

**1. Allow MORE THAN ONE guardian to link to the same child** *(the permanent fix)*
A child gets a mother's LINE **and** a father's LINE. Link once, and the problem never happens again. This is a
structural change to pairing, and it is where **REQ-020**'s "approval, collision, control" work already points —
that REQ exists precisely because two accounts can claim the same person.

**2. The admin opens the door for the father** *(already in the proposal above)*
Option ก was written for new customers, but it is really a **general escape hatch for "someone new needs access
now"**: the admin authorises that chat once. The father messages the shop, the admin vouches, he is in — today,
without waiting for (1). ⚠️ **Security then rests on the admin verifying who they are talking to** — which is the
same trust the business already places in them, but it must be a stated rule, not an accident.

**3. The father simply calls the shop and the admin files the leave** *(works right now, no build)*
Worth saying out loud: this is not a failure state, it is the fallback the business has always had. The goal of
(1) and (2) is to make it unnecessary, not to pretend it does not exist.

**⇒ Porter's recommendation: (2) then (1).** (2) is nearly free because option ก is being built anyway, and it
covers the sick-mother case from day one. (1) is the honest fix and should be scheduled, not improvised.

**Q5 (to the owner) — does a second guardian get the SAME rights?** Filing leave and checking in affect a **paid**
session. Should the father be able to do everything the mother can — including seeing what was bought and what is
left — or is there a lesser "can act, cannot see money" level? **This is a business rule; Porter is not inventing
it.** It also decides how much of REQ-020 has to change.

### 💡 The owner's proposal, 2026-09-01 — a 6-digit code instead of LINE linking

> *"ทำ 2FA ที่เป็นเลข 6 หลัก ใส่ผิดได้ 4 ครั้ง … เพราะตอน authen จะสแกนหน้าร้านก็จะได้ใช้ร่วมกัน คือฉันไม่อยากให้มี
> การผูกไลน์ เพราะอยากให้มันย้ายเครื่อง หรือให้คนทำแทนกันได้ง่าย แต่ยังมี security"*

**The instinct is right and it should be said plainly: a shared family code matches how a family actually
behaves far better than binding one device to one child.** Mum can tell dad the code. It survives a new phone, a
borrowed phone, a locked phone. It works at the counter after a scan. Device-binding never survives any of that.

#### 🔴 But one consequence has to be on the table before this is decided

**Dropping the LINE binding costs us every parent notification.**
To push a message to a parent, LINE requires that we know **which LINE account belongs to which family**. That
mapping *is* "ผูกไลน์". No mapping ⇒ no course-confirm to the parent, no 08:15 "วันนี้มีคลาสเรียนนะ", no check-in
message — **the three things the customer asked for on 2026-08-30** (`REQ-077`).

#### ✅ The resolution — and it gives him everything he asked for

**His objection is not to the mapping. It is to the mapping being EXCLUSIVE and hard to move.** Those are
separable:

> **Keep the mapping — it is what makes notifications possible. Change what it means.**
> **The 6-digit code is not a replacement for membership; it is how you JOIN a family.**

- A family has **one code** and **many LINE accounts attached** — mother, father, grandmother, the nanny.
- Enter the code once from any device ⇒ that LINE account joins the family. **Delegation solved.** Dad texts the
  shop nothing; mum tells him six digits.
- New phone? Enter the code again. **Portability solved.**
- Everyone attached receives notifications ⇒ **the customer's REQ-077 list still works**, and in fact works
  *better*: today one parent gets the message; this way both do.
- Leaving is possible: the shop rotates the code, and any account can be detached.

⚠️ **Naming, because it changes how people reason about it:** a reusable family code is a **shared password**,
not 2FA. That is not an objection — it is the right tool here — but calling it 2FA invites a design that assumes
one-time codes, and **a one-time code sent to mum's phone is useless precisely in the sick-mum case this exists
to solve.**

#### Three decisions the owner must make — none is technical

1. **Fixed or rotating?** A **fixed** family code is what makes delegation work (mum can pass it on). A rotating
   one-time code breaks the core case. **Porter's lean: fixed, resettable by the shop**, rotated if a family asks
   or if someone leaves the household. ⚠️ A fixed code is written on the fridge eventually — accept that and
   scope what it may unlock accordingly.
2. **4 wrong attempts, then WHAT — and for how long?** *"Locked forever"* strands a parent at the counter with a
   child waiting. *"Locked 15 minutes"* is usually right. **And locked against what — the phone number, the
   device, or the LINE account?** Per-device locking is defeated by switching devices.
   ⚠️ **No rate limiter exists anywhere in this codebase** (`REQ-051` established that) — this is new
   infrastructure, not a library flag.
3. **Who sets the code, and where does the family read it?** If a parent chooses it, some will choose `123456`.
   If the system issues it, it must be visible to staff to re-tell, which means **staff can see every family's
   code** — decide whether that is acceptable.

#### The line Porter recommends drawing regardless

**The code may unlock: seeing this family's children, filing a leave, checking in.**
**The code must NOT unlock: anything that moves money** — buying, refunding, changing a price. Those stay with
staff. A code that ends up on a fridge should never be able to spend.

### ✅ The owner's three decisions, 2026-09-01

> *"1. คงที่ ร้านรีเซ็ตได้  2. ล็อก 3 นาที  3. ตั้งเองครั้งแรก"*

| # | Decision | Consequence |
|---|---|---|
| 1 | **Fixed family code; the shop can reset it** | Delegation works — mum tells dad six digits. Rotation is the shop's lever when a household changes. |
| 2 | **4 wrong attempts ⇒ locked 3 minutes** | Short enough that a parent at the counter is not stranded; long enough to make guessing useless (4 tries per 3 min ≈ 2,000 tries a day against 1,000,000 codes). |
| 3 | **The family sets its own code on first use** | No code to distribute, nothing for staff to read out — and it removes the "staff can see every family's code" worry from decision 3 entirely. |

#### 🔴 Decision 3 opens a hole that must be closed in the same design — first-use takeover

**If anyone who knows a phone number can be the one who "sets it the first time", then a stranger who gets there
first owns that family.** They set the code, they see the children, they can file leave. The real parent then
finds a code already set and has to ring the shop — by which time the information is out.

This is the classic unclaimed-account takeover, and it is **not** hypothetical here: a phone number is not a
secret, the roster is ~180 families, and **not one of them has claimed anything yet** — every single family is
currently unclaimed.

✅ **The fix is already in this design and costs nothing new: the first code is set inside the admin-opened
window (Option ก).** The admin is in the conversation at registration anyway. So:

- **Setting a code for the first time** requires an admin-authorised chat.
- **Using** the code afterwards requires nothing — any device, any guardian, forever. Portability intact.
- **Resetting** it is the shop's, per decision 1.

⇒ One gate, at the only moment where a gate costs nobody anything.

#### Two smaller rules Porter recommends, both cheap

- **Refuse the obvious codes.** A family choosing its own will produce `123456`, `111111`, `000000`. Reject a
  short blacklist and sequential/repeated digits, with wording that does not scold:
  **`รหัสนี้เดาง่ายเกินไป ลองเลขอื่นนะคะ`**
- **Lock the target, not the device.** Counting failures per device is defeated by switching devices. ⚠️ Locking
  per family does allow a nuisance lockout of a real family — at **3 minutes** that is an irritation, not a
  breach, so Porter judges it acceptable. **Flagged for @Sober as a design detail, not re-opened as a decision.**

#### Status of this thread

**The authentication model is now decided end to end:** who may join a family, how, what happens on failure, who
can reset, and what the code may never unlock (**nothing that moves money** — Porter's line, stated above and not
contradicted). ⚠️ It still sits inside a REQ that is **CAPTURED, not READY_FOR_SA** — the owner's design flow for
the registration chatbot has not been produced yet, and no task should be cut from this section alone.

### ✅ Final two answers, 2026-09-01 — and one accepted risk, on the record

> *"รหัสง่ายเกินไปได้ แต่เตรียมไว้ก็ดี เพราะลูกค้ายังไม่มากขนาดนั้นที่จะโดน hack · นับครั้งที่ผิดกับครอบครัว: yes"*

**Failure counting: per FAMILY, not per device.** Settled — per-device is defeated by switching device.

**Weak codes are ALLOWED. This is the owner's decision, with his reasoning, and it is a reasonable one:**
the customer base is small enough that it is not a target worth attacking. Recorded as an **accepted risk**, not
as an oversight — the difference matters if anyone reads this later and assumes we missed it.

**But he asked for it to be *ready*, which is the right shape:** build the weak-code rule so it can be **switched
on without rework**. This project already has the mechanism — **`app_settings` (REQ-031 / TASK-101, TASK-102)**,
defaults in code with overrides in the DB. ⇒ ship the check **present and disabled by default**, one setting away
from being enforced. The wording is already written above and stays in the file so nobody has to re-invent it:
**`รหัสนี้เดาง่ายเกินไป ลองเลขอื่นนะคะ`**

**🔴 What should make us revisit it — write it down now, because nobody remembers a risk they accepted:**
1. **The family count grows** well past today's ~180, or
2. **the code starts guarding something bigger** than seeing children / leave / check-in. Porter's standing line
   — *the code never unlocks anything that moves money* — is what keeps this risk small. **If that line ever
   moves, the weak-code decision must be re-taken, not inherited.**

---

## 🤝 The coexistence rules — bot and admin in ONE chat (owner asked, 2026-09-01)

> Owner: *"design นี้สามารถให้ลูกค้าคุยกับแอดมินได้มั้ย แล้วมันจะไม่ทำงานชนกันเหรอ"*

**Yes, and they do not collide — if one principle holds:**

> ## 🔇 The bot is SILENT by default.
> It speaks **only** inside a flow that somebody deliberately started. It never answers a general question.

Chatbots collide with humans because they try to be helpful. A bot that attempts to answer everything will
inevitably answer over the admin, contradict them, or reply to a question that was meant for a person.
**A bot whose default is silence cannot do any of that** — and silence is exactly what makes an admin able to
live in the same account.

### The four rules

**Rule 1 — The bot NEVER starts a flow by itself.** A flow begins in exactly two ways: the customer **taps a
rich-menu button**, or **the admin starts it** for that chat.

🔴 **This changes what the call decided, and it is worth changing.** The call's step 1 was *"แอดมินส่งข้อความให้
ลูกค้าพิมพ์คำว่า สมัคร"*. **A typed keyword must not be a trigger** — a customer writing *"สมัครยังไงคะ"* would
have the bot barge into a human conversation. That is precisely the *"triggered accidentally"* risk the call
itself raised, and free text can never be made safe against it: any keyword list is either too narrow to be
useful or too broad to be safe.
⇒ **Use a button.** Unambiguous, no typos, no language variants, and easier for anyone who types slowly.
*(Porter's recommendation to the owner — it is his flow to change.)*

**Rule 2 — Every step of a flow offers a way out.** A visible **`คุยกับแอดมิน`** on each bot step. A customer is
never trapped inside a machine while a human is sitting right there.

**Rule 3 — The admin can take over at any moment, and taking over MUTES the bot.** Not "pauses" — the running
flow is abandoned, and the customer is told a person has joined:
**`แอดมินเข้ามาคุยด้วยแล้วนะคะ`**. Half-finished flows must not resume later and surprise everyone.

**Rule 4 — Faced with the unexpected, the bot does not guess.** If it asked for a phone number and receives
*"ค่าเรียนเท่าไหร่"*, it must **never treat that text as the answer**. It says it did not understand and offers
the two doors:
**`ขอโทษค่ะ ไม่เข้าใจ — พิมพ์เบอร์โทรศัพท์ หรือกด "คุยกับแอดมิน" ได้เลยค่ะ`**
📌 This is the same lesson as everywhere else on this project: **a system that guesses produces a record that
looks correct and is wrong.** A registration built from a misread message is exactly that.

### What this costs and what it buys

- **Costs:** the bot answers no general questions at all. Every "ค่าเรียนเท่าไหร่" reaches a human.
- **Buys:** the admin can work in that account all day without ever being interrupted, contradicted, or
  pre-empted — which is the entire point of the hybrid model the owner and the customer both arrived at.

⚠️ **Behavioural specification, not a design.** **@Sober owns the mechanism** — and should first check whether
LINE's own Official Account tooling already provides a bot/human mode switch per conversation. If it does, most
of Rule 3 is configuration rather than code, and should not be rebuilt.

### 📱 Devices — settled 2026-09-01, and it makes Rule 1 load-bearing

> Owner: *"rich menu ไม่ขึ้นบน PC"* → *"ผู้ปกครองใช้มือถือเกือบหมด มีแค่ส่วนน้อยที่ใช้ และแอดมินนั่นแหละที่ใช้คอม"*

**A LINE rich menu does not render on LINE for PC.** The owner raised it; it is real and it would have broken
Rule 1 for desktop users. **It does not, because Rule 1 already has two doors:**

| Who | Device | How a flow starts |
|---|---|---|
| Almost every parent | mobile | **taps the rich menu** — door 1 |
| The small minority of parents on PC | desktop | **the admin starts it for them** — door 2, already in the design |
| Admins | desktop | never needed a rich menu; they *are* door 2 |

⇒ **No extra work.** The desktop gap is covered by a path that already exists, and it matches behaviour anyway:
someone sitting at a computer messages the shop rather than hunting for a menu.

#### 🔴 What DID change: door 2 is no longer a fallback

For the PC minority it is now **the only way in**. That promotes a detail into a requirement:

> **The admin's "start a flow for this chat" control must be usable from where the admin actually works —
> LINE on a PC — not only from our own back-office screen.**

If it lives solely in our admin UI, staff have to switch windows every time a desktop customer asks, and **they
will stop doing it and just type the answer by hand instead** — at which point the registration flow quietly
stops being used for that group and nobody notices. A control that is technically present but out of reach where
the work happens is not a control.

⚠️ **@Sober:** this is the same constraint as Rule 3 (admin take-over) and should be solved once, together —
both are "staff acting on a conversation from their PC".

📌 **Not verified, do not design on it yet:** whether a **button inside a message** (as opposed to the rich menu)
is tappable on LINE for PC. If it is, it would give the desktop minority self-service without an admin. **Porter
has not tested this and it is not a fact** — @Sober to confirm before anyone plans around it.

---

## ✅ Owner's answers to the four open questions, 2026-09-01

### Q2 — parents CAN create students. Delete on both sides.
> *"ได้สิ ถ้ามันชื่อซ้ำ ก็บอกให้ตั้งใหม่ มันซ้ำกับคนอื่น · ก็ทำให้แอดมินลบได้ที่หน้า ผปค บนเว็บสิ ในไลน์ก็ทำให้ลูกค้าลบได้ด้วย"*

**Accepted: a parent may create a student, an admin may delete on the parents page, and a parent may delete in
LINE.** 🔴 **Two things inside this answer need a second look before it is designed — Porter is not overriding
either, but neither should be built as literally worded.**

**(a) "ชื่อซ้ำ → บอกให้ตั้งใหม่" is not what the customer asked for, and it can be wrong.**
The call asked for an **alert so staff do not book the wrong child**, and suggested adding a **surname or another
distinguishing mark** — *distinguish*, not *forbid*. **Two real children genuinely can share a name**, and
telling a parent "rename your child, someone else has that name" is both wrong and slightly leaky: it confirms
that a child of that name exists in the system to whoever typed it.
⇒ **Porter's recommendation:** ask for **more detail**, not a different name:
**`มีน้องชื่อนี้อยู่แล้ว รบกวนใส่นามสกุลหรือชื่อเล่นเพิ่ม เพื่อไม่ให้สลับกันนะคะ`**
Same outcome the customer wanted (two children tellable apart), no false claim, no leak, and nobody is asked to
rename their child.

**(b) 🔴 "ลูกค้าลบได้ด้วย" — deletion is not reversible and this system has never had it.**
A student carries bookings, a paid course, attendance history and money records. **There is no student-delete
anywhere in the product today**, and that is not an oversight — nothing here can be undone.
⇒ **Porter's recommendation, for the owner to accept or overrule:**
- **A parent may remove only a student with nothing attached** — no bookings, no purchases, no attendance. That
  covers the real case (*"I typed it wrong / I added the wrong child"*) and nothing else.
- **Anything with history is hidden, never deleted**, and only by an admin.
- **A parent may never remove a child mid-course.** If they could, a paid course would lose its owner and the
  ledger would point at nobody — silently, and discovered at month-end.

### Q3 — `sid` and `uat` share one LINE channel, for now
> *"ใช่ แต่ตอนนี้ไม่มีใครใช้ อีกเดี๋ยวเราจะแยกแล้ว เอาของจริงลูกค้ามาต่อเป็น uat แต่ตอนนี้ใช้ร่วมกันไปได้"*

**Accepted and low-risk today** — one channel, nobody using it. ⚠️ **The risk is not the sharing, it is
forgetting.** Written down as a trigger rather than an intention:

> 🔴 **The channels MUST be separated BEFORE the first real parent links on `uat`.**
> After that moment, any outbound test fired from `sid` reaches a real family.

### Q4 — LINE on PC: **no rich menu, and buttons cannot be tapped. Text only.**
> *"กดไม่ได้ ได้แค่พิมพ์ข้อความ ไม่มี rich menu"*

**This is worse than "no rich menu" and it changes a rule.** Earlier the PC gap was covered by the admin starting
the flow — that still holds. **But it now also means a PC user cannot tap anything *inside* a flow either.**

⇒ **New design constraint: every button in every flow needs a typed equivalent.**
A step that offers `[รดา] [ต้น]` must also accept **`1` / `2`**, and say so:
**`เลือกน้อง: 1) รดา  2) ต้น — กดปุ่ม หรือพิมพ์เลขได้เลยค่ะ`**
📌 **This does not reopen Rule 1.** Typing *inside* a running flow is **an answer**, not a trigger; the flow was
still started by a button or by an admin. The thing that must never be a trigger is a keyword typed into an
idle chat.

---

# 🧭 THE FLOW — Porter's full design, 2026-09-01 (owner asked for it)

> *"เอางี้ไป คิด flow ทั้งหมดมา ไปปรึกษากับ sober ก็ได้ ให้ทางที่ดีที่สุดสำหรับ chat line ที่ ผปค จะใช้ระบบ
> และคุยปรึกษากับแอดมินได้ด้วย"*

**Scope of this section:** the *behaviour* — what the parent sees, what the bot says, when the human takes over.
**Not the mechanism.** How state is stored, how the webhook routes, whether LINE's own tooling covers the
takeover — **@Sober's**, and this section is written to be reviewed by him, not to pre-empt him.

## The one idea the whole design rests on

**A chat is in exactly one of two states, and the parent never has to know which:**

| State | Meaning | What the bot will do |
|---|---|---|
| **ยังไม่รู้จัก** | this LINE account is not attached to any family | offer only: enter the system · talk to an admin |
| **รู้จักแล้ว** | attached — we know the family and their children | offer the real actions |

Everything else follows from that. **And in BOTH states, the bot says nothing unless a button was pressed or an
admin started something.**

## The menu — two sets

| ยังไม่รู้จัก | รู้จักแล้ว |
|---|---|
| `เข้าใช้ระบบ` · `คุยกับแอดมิน` | `แจ้งลา` · `เช็คอิน` · `คอร์สของฉัน` · `เพิ่มนักเรียน` · `คุยกับแอดมิน` |

📌 **`คุยกับแอดมิน` is in both, always, and is never removed by any flow.** It is the promise that a person is
reachable — the thing that makes a bot acceptable to a parent at all.

---

## Flow 1 — ครอบครัวใหม่: the admin opens the door (first time only)

The admin, already in the conversation, starts it. **Nothing here can be triggered by the parent typing.**

```
บอท : ยินดีต้อนรับค่ะ 😊 รบกวนใส่เบอร์โทรที่ให้ไว้กับทางร้านนะคะ
ผปค : 0812345678
บอท : พบข้อมูลของคุณแล้วค่ะ — น้องรดา, น้องต้น
       ตั้งรหัส 6 หลักสำหรับครอบครัวไว้ใช้ครั้งต่อไปนะคะ
       (รหัสนี้บอกคุณพ่อหรือคนอื่นในบ้านได้ เพื่อเข้ามาแจ้งลาแทนกันได้)
ผปค : 481920
บอท : ใส่อีกครั้งเพื่อยืนยันค่ะ
ผปค : 481920
บอท : เรียบร้อยค่ะ ✅ ต่อไปเข้าจากเครื่องไหนก็ได้ด้วยเบอร์ + รหัสนี้
```

- **Phone not found** → `ยังไม่พบเบอร์นี้ค่ะ ลองตรวจสอบอีกครั้ง หรือกด "คุยกับแอดมิน" ได้เลยค่ะ`
  *(The admin opened this chat, so we are not answering a stranger — but it still must not read as an accusation.)*
- **The confirm-twice step is deliberate**: the code is fixed and long-lived. A typo here is a support call later.
- 📌 **Why the parenthetical about telling other people the code is in the message:** the delegation IS the
  feature — the sick-mother case. If we never say it, nobody discovers it.

## Flow 2 — ผู้ปกครองคนที่สอง / เครื่องใหม่ (no admin needed, ever)

```
[เข้าใช้ระบบ]
บอท : ใส่เบอร์โทรของครอบครัวค่ะ      → 0812345678
บอท : ใส่รหัส 6 หลักค่ะ               → 481920
บอท : เรียบร้อยค่ะ ✅ ยินดีต้อนรับ
```

- Wrong code: `รหัสไม่ถูกต้องค่ะ (เหลืออีก 3 ครั้ง)` — **say the remaining count.** A silent counter is how
  people get locked out with no warning.
- After 4: `ลองใหม่อีกครั้งใน 3 นาทีนะคะ หรือกด "คุยกับแอดมิน" ได้เลยค่ะ` — **the human door stays open even
  while locked.** A lockout must never be a dead end.

## Flow 3 — เพิ่มนักเรียน (the call's "สมัคร")

```
[เพิ่มนักเรียน]
บอท : ชื่อน้องชื่ออะไรคะ              → รดา
      (ถ้าซ้ำ) มีน้องชื่อนี้อยู่แล้ว รบกวนใส่นามสกุลหรือชื่อเล่นเพิ่ม เพื่อไม่ให้สลับกันนะคะ
บอท : วันเกิดน้องคะ (วว/ดด/ปปปป)      → 12/03/2019
บอท : จังหวัดคะ                        → กรุงเทพมหานคร
บอท : ตรวจสอบอีกครั้งนะคะ
       ชื่อ: รดา ศรีสุข · วันเกิด: 12/03/2019 · จังหวัด: กรุงเทพมหานคร
       ถูกต้องไหมคะ   1) ถูกต้อง   2) แก้ไข
ผปค : 1
บอท : บันทึกแล้วค่ะ ✅ แอดมินจะจัดตารางเรียนให้และติดต่อกลับนะคะ
```

- 🔴 **The summary-then-confirm step is not optional.** This writes into the roster, and **the roster has no
  delete for anything with history.** One screen of review costs a parent three seconds and saves a record
  nobody can remove.
- **The admin must be notified** when a student is created this way — it is the hand-off point in the customer's
  own five-step flow (*"แอดมินนำข้อมูลไปลงตาราง"*). ⚠️ **Without a notification, step 5 depends on somebody
  remembering to go and look.**

## Flow 4 — แจ้งลา · Flow 5 — เช็คอิน (same shape)

```
[แจ้งลา]
บอท : ของน้องคนไหนคะ   1) รดา   2) ต้น        ← skipped entirely if there is only one child
บอท : คาบไหนคะ
       1) จ. 2 ก.ย. 10:00 Surfskate (ครูป็อป)
       2) พ. 4 ก.ย. 10:00 Surfskate (ครูป็อป)
ผปค : 1
บอท : ยืนยันแจ้งลา น้องรดา จ. 2 ก.ย. 10:00 ใช่ไหมคะ   1) ยืนยัน   2) ยกเลิก
บอท : แจ้งลาเรียบร้อยค่ะ ✅ แจ้งครูให้แล้วนะคะ
```

- **Never infer the child, never infer the session** — that is `REQ-050`'s rule and it is the same rule here.
- **The confirmation names what was recorded** (child · date · time), so a wrong tap is caught by the person who
  made it, immediately.
- Check-in differs only in the time window and in what it may refuse.

## Flow 6 — คอร์สของฉัน

Shows exactly the customer's own template: `คอร์ส · ครู · เหลือ 4/6 · สิทธิ์ลาเหลือ · วันหมดอายุ`.
📌 **Reusing their wording is deliberate** — they wrote it, so it is already the language they think in.

## Flow 7 — คุยกับแอดมิน (on every screen, always)

```
[คุยกับแอดมิน]
บอท : รับทราบค่ะ แอดมินจะตอบเร็ว ๆ นี้นะคะ 🙏
```

Then **the bot goes silent in that chat.** It does not resume by itself — **only a new button press wakes it.**

---

## The rules that keep bot and human out of each other's way

1. **Silent by default.** No greeting on follow, no auto-reply, no *"did that answer your question?"*.
2. **Only a button or an admin starts a flow.** A typed keyword never does.
3. **Typing INSIDE a flow is an answer, not a trigger** — which is why every choice also accepts `1` / `2`
   (LINE on PC cannot tap anything at all: owner, 2026-09-01).
4. **The admin typing anything = the bot stops instantly**, the flow is abandoned, and the parent is told:
   `แอดมินเข้ามาคุยด้วยแล้วนะคะ 😊`
5. 🔴 **Two failures and the bot gives up.** If the parent says something unexpected twice in a row it stops
   guessing and hands over: `ขอโทษค่ะ ขอส่งให้แอดมินช่วยดูนะคะ 🙏`
   **A parent must never be trapped in a loop with a machine while a human is sitting in the same chat.**
6. **Nothing in any flow touches money.** No buying, no refunds, no price changes — staff only.

## What this design deliberately does NOT do

- **The bot answers no questions.** Prices, schedules, *"is the rink open Sunday"* — all of it reaches a person.
  That is the price of never talking over the admin, and for this business it is the right trade.
- **No auto-scheduling.** The parent registers; **a human puts the child on the calendar.** The customer's own
  flow says so, and it is the step where a mistake is cheapest to catch.

## 🔴 Open — @Sober, what I need from you

1. **Is per-user menu switching (two menu sets) a LINE feature, or something we build?**
2. **Rule 4 (an admin's reply mutes the bot) — does LINE's Official Account tooling already do this per
   conversation?** If it does, do not rebuild it.
3. **Is there anything in this flow that cannot be done with the LINE mechanisms we already run?**
4. **Sequencing against `REQ-051`** — both are "phone → this family's children → act on one", the same lookup
   and the same PII question. **Should they be one build?**

### ✅ Answers — Sober (SA), 2026-09-01. Read from the code, not from memory.

**No tasks cut. REQ-079 stays `CAPTURED`; my lane is unchanged (REQ-078).** This is the mechanism review you asked
for, against what this system actually runs today.

**Q1 — per-user menu switching: a LINE feature, and WE ALREADY RUN IT.**
`linkRichMenuToUser(userId, richMenuId)` — `src/lib/line-rich-menu.ts:119` (`POST /v2/bot/user/{id}/richmenu/{id}`)
— plus `setDefaultRichMenu` (`/user/all/richmenu/...`, `:110`) and the menu ids in
`app_settings.line_rich_menu_ids` (`:78`). **REQ-042 was precisely "a role change did not switch the rich menu"**,
fixed and owner-verified 08-16 — so the switching path is not theoretical, it is in production.
⇒ **Two menu sets = two rich menus + one call at the moment a chat becomes รู้จักแล้ว. Zero new mechanism.**
📌 **Cheapest shape:** make **ยังไม่รู้จัก the DEFAULT menu** (`setDefaultRichMenu`) and **รู้จักแล้ว the per-user
link.** Then a brand-new follower gets the right menu with no code running at all, and "unknown" is the state you
fall back to rather than one you have to remember to set.

**Q2 — does LINE's own tooling mute the bot when an admin replies? 🚫 I will not answer this from memory.**
What I can state: **we do not implement it** — nothing in `line-webhook.service.ts` suppresses a reply because a
human spoke. What I know of the platform: a LINE OA has an account-wide **response mode (Bot / Chat)**, and the
webhook event envelope carries a **`mode` field (`active` / `standby`)** used when another module holds the
conversation. **Whether that gives per-CONVERSATION muting on this account's plan is a fact about the owner's OA
Manager, not about our code, and only he can look.**
🔴 **@Porter — one concrete thing to ask him**, because the answer changes the build: *in LINE Official Account
Manager, open one chat — is there a per-chat switch between bot and manual reply, or only the account-wide
Bot/Chat setting?* **Account-wide is not good enough for Rule 4** — it would silence the bot for every family the
moment one admin replies to one person.
📌 **If LINE does not give it per-chat, it is small for us anyway**: the state table already exists
(`line_link_sessions`, `db/schema.ts:475`) and the precedence rule already exists
(`decideMessageRoute` — *"an in-progress conversation wins over already-linked routing"*, `line-routing.ts:18`).
Rule 4 is one more column (`muted_until`) consulted in the same place. **Do not rebuild it if LINE has it; do not
assume LINE has it either.**

**Q3 — is there anything in the seven flows we cannot do with mechanisms we already run? No.**
What we run today: push with retries + audit (`notification_outbox`), reply-token replies, **quick replies**,
**postback events**, per-user rich menus, **multi-turn conversation state** (`line_link_sessions.step`), per-user
language (`line-lang.ts`), and an admin recipient list (`app_settings.line_admin_user_ids`).

Against your flows:
- **`1` / `2` accepted as text as well as a tap — already proven.** The router sends rich-menu/quick-reply taps
  and typed keywords through the **same handlers** (`line-webhook.service.ts:4`), and the existing `CHOOSE_ROLE`
  step already takes a typed `2`. **The owner's PC constraint is met by what is deployed.**
- **Multi-step with a summary-and-confirm before writing** — `step` is a text column; this is new *values*, not a
  new mechanism.
- **คุยกับแอดมิน on every screen** — a quick-reply item on every outbound message + the admin list. Have both.
- 🆕 **The only genuinely new state is a counter**: "two unexpected replies → hand to a human", and
  "wrong code, N attempts remaining, then lockout". `line_link_sessions` has **no attempt column**. That is a
  column and a reset rule, not a capability. **Design note: the counter must reset on success AND expire with the
  session, or a parent who mistypes twice in March is locked out in June.**
- 🟠 **One operational unknown, and it is the only thing in the design I cannot map to something we run:**
  Flow 1 has *an admin opening the door in a specific chat*. We can push to a `lineUserId` — but an admin working
  in LINE OA Manager sees **a chat, not a user id**. **How the admin's action reaches our system is the question
  to settle before this is specced** (a keyword the admin types in the chat is the cheapest answer, since our
  webhook already sees every inbound message).

🔴 **And the constraint that will bite this whole REQ, from your own Q3 answer today: `sid` and `uat` share ONE
LINE channel.** So there is **no safe rehearsal** for bot behaviour — a flow tested on `sid` is live for the two
real linked teachers and any linked parent. **That is a bigger risk to this REQ than anything in the design**, and
it should be in front of the owner before build, not discovered during it.

**Q4 — one build with REQ-051? Share the LOOKUP, not the BUILD. And the dependency runs the other way.**
They share a query (`phone → this family's children`) and a rule (who may see names) — **specify those once and
build them once.** But their **trust models are opposite**: REQ-051 is a **public, no-login web page that burns a
paid session**; REQ-079 is an **authenticated chat** where the family code and the admin-opened door are the auth.
Merging them puts REQ-079 behind **REQ-051's three unanswered risk decisions** (SPEC-050 §Decisions: the admin
code, the rate-limit model — 🔴 *no rate limiter exists anywhere in this codebase* — and whether a public
check-in is acceptable at all).
📌 **The useful direction is the reverse of the question:** REQ-051's weakest point is decision #1, whose only
answer today is **the shared static `"229"`** (`LINE_ADMIN_VERIFY_CODE`). **REQ-079 introduces a per-family
6-digit code.** If that exists, REQ-051 has a far better answer to its own hardest decision than it has now.
⇒ **Settle REQ-079's auth model first, then re-open SPEC-050's decision #1 with it.** That is sequencing, not a
merge, and it costs nothing to do in that order.

---

# ✅ FLOW CLOSED — the open items resolved, 2026-09-01 (Porter)

> Owner: *"รีบสรุปจบได้แล้ว flow line"*. He is right — this had started generating questions faster than it was
> closing them. **Everything below that I could decide, I have decided. What is left is named and is short.**

## Closed by Porter — no longer open, do not re-raise

**1. Rule 4 (an admin's reply mutes the bot) — we build it. Question withdrawn.**
Sober's answer already contains the resolution: if LINE's OA Manager has a **per-chat** bot/manual switch we use
it, and if it does not, ours is **one column read** in `decideMessageRoute`, where the precedence rule
(*"an in-progress conversation wins"*) already lives. **Either way the flow is unaffected**, so it was never a
decision the owner needed to make — I turned an implementation detail into a question and put it on his desk.
⇒ **Spec it as ours. @Sober substitutes the platform's if it turns out to exist.**
🔴 Retained as a hard requirement, because this is the part that must not be lost: **account-wide muting is NOT
acceptable.** One admin answering one parent must never silence the bot for every other family.

**2. How the admin opens the door (Flow 1) — the REQUIREMENT is closed; the mechanism is @Sober's.**
Requirement, and it is the only part that is a business fact:
> **An admin must be able to start Flow 1 for one specific chat, from where they actually work — LINE OA
> Manager on a PC — without leaving it.**
Two candidates, and **I am not choosing between them because both turn on a platform fact I have not verified:**
(a) a short keyword the admin types in the chat — ⚠️ Sober's caution stands: our webhook sees **inbound** messages
(from the parent); an admin's reply is **outbound**, so it may never reach us. **Verify before designing on it.**
(b) a control on our own back-office screen — certain to work, at the cost of switching windows.
📌 If (a) proves impossible, **(b) with a notification is still fine** — the admin is already handling that
conversation; what would kill it is having to *hunt* for the customer, not having to click once.

**3. Sequencing with REQ-051 — settled, and Sober's direction is better than my question was.**
Not a merge: **REQ-079's per-family 6-digit code is the answer to REQ-051's weakest point** (its only admin code
today is the shared static `"229"`). ⇒ **Settle REQ-079's auth model first, then reopen SPEC-050's decision #1
with it.** Free, and it removes one of REQ-051's three blockers rather than adding to it.

## 🔴 The ONE thing that is genuinely the owner's — a precondition, not a design question

**`sid` and `uat` share ONE LINE channel ⇒ there is no safe rehearsal for bot behaviour.**
Everything else this team ships is proven on `sid` first. This cannot be: a half-finished flow exercised on `sid`
reaches the **two real linked teachers, and any linked parent, on the customer's account.**

**Porter's recommendation: a second LINE channel for `sid`.** It is the only option that restores the rule the
rest of the project runs on, and it is cheapest now — before real parents link, which is when the cost of not
having it stops being hypothetical.
**The fallback if he declines:** an explicit accepted risk with a **named window**, the same shape as his
late-night webhook flip — flows are exercised only inside it, never during business hours.
⚠️ **This is a precondition to approving the flow, not a follow-up to it.** Building a conversational system with
no rehearsal environment is a decision, and it should be taken deliberately rather than discovered.

## Status

**The flow design is COMPLETE and awaits the owner's approval.** No question in it is open with him except the
channel. Once he approves: **@Sober specs it**, with the one mechanism check above resolved first.
`REQ-079` remains **`CAPTURED`** until he says go — unchanged.

## ✅ The channel precondition — CLEARED by the owner, 2026-09-01

> *"ตอนนี้ซ้อมได้ เพราะเดี๋ยว uat เขาเปลี่ยนเป็นอันใหม่ทีหลัง ตอนนี้ uat ก็ไม่มีลูกค้าจริง ๆ ใช้"*

**Rehearsal on `sid` is allowed now.** The customer's real OA will be connected later as a separate account, and
the current shared channel has no real parents on it. **The precondition is answered; the flow has no blocker
left with the owner.**

🔴 **Two things written down so this permission does not outlive the conditions that make it safe.**

**1. It is not empty — 2 real teachers ARE linked on `uat`.** "No real customers" is true of **parents** (0 of
180) and it is what makes parent-flow rehearsal safe. It is **not** true of teachers.
⇒ **Rehearse the parent flows freely. Never fire an outbound message at the two linked teachers as part of a
rehearsal.** That costs nothing — no flow in this REQ is teacher-facing — and it keeps the sentence honest.

**2. 🔴 The permission EXPIRES, and the trigger is a moment, not a date:**
> **This freedom ends the instant either (a) the customer's real OA is connected, or (b) a real parent links on
> `uat` — whichever comes first.** From that moment, `sid` needs its own channel or rehearsal stops.

📌 **Written as a trigger on purpose.** A permission granted because *"nobody is using it yet"* is the kind that
quietly survives the day someone starts using it — and the person rehearsing will have no way to notice. It is
the same shape as the `uat` remote-DB whitelist line that was opened for diagnostics on 08-16 and is still open.
