# TASK-333 — the outbox payload is PARSED, not cast (design first, code second)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-10)
⛔ **HELD — not until after @Tanya's `uat` round AND after TASK-328.** 🔑 **Cut now so the argument is not lost
while the map is fresh.** ⚠️ **It touches the WORKER and every historical row in `notification_outbox`.**
**Source: your TASK-331 Question answer, which I am accepting as the design.**

---

## §1 The decision, taken — your argument, and I am not re-opening it
> ***"A payload TYPE that is honest IS never receiving an `any`. They are the same fix, one stated weakly and
> one stated properly."***
✅ **A discriminated union on `kind`, PARSED at the outbox read.** 🔑 **The word that carries it is PARSED, not
CAST:** ***`row.payload as any` is where type information is destroyed*** — the producer knew `remaining` was a
string, the DB column knows nothing, and `as string` re-asserts a fact nobody checked.
📌 **Your four reasons are on the record and I accept all four.** **The one I would put first is the one that
matches everything else this week:** 🔴 ***thirteen assertions cannot fail for the FIFTEENTH KIND.*** **A new
kind inherits none of them. A parsed union makes it declare its fields or fail to compile.**

## §2 🔑 Your counter-argument is the SPEC, not a caveat
> ***"Every historical row in `notification_outbox` must still parse or the worker starts failing on data it
> used to send."***
🔴 **That is the hard requirement of this task.** ✅ **Your own answer is the shape: a LENIENT parse that LOGS
rather than throws — the same shape as `notifyAdmins`' loud SKIPPED row.**
⚠️ **A strict parse would turn a type improvement into an outage on rows nobody can re-create**, and 📌 *the
rows most likely to fail are the OLDEST — the period when we were least careful.*
🔑 **So the acceptance criterion is behavioural, not structural: *no message that sends today stops sending*.**

## §3 What I want BEFORE any code — the whole first half
✅ **A written design, in this TASK, answering four things:**
1. **Where the parse happens** — the outbox read, or `formatOutboxMessage`'s entry, and why one.
2. **What a FAILED parse does** — 🔑 *log and send what it can · log and skip · log and send raw?* ⚠️ **Say what
   the PARENT sees in each case**, because that is the actual choice.
3. **How a NEW kind is added afterwards** — 📌 *if the answer is "three places", the union has not bought what
   it promised.*
4. **What it does NOT fix.** ⚠️ **A parse validates SHAPE.** ❓ *Does it catch `remaining: 0` — a valid string
   field receiving a number — or is that still only a type on the producer?* 🔑 **Be honest; the value of this
   task depends on it and I would rather know it is narrower than it sounds.**
🚫 **Do not write the union until I have read that.** ✅ **Then we cut the code half as its own task.**

## §4 What must not change, when it does happen
- 🚫 **No message's TEXT** · no copy · no i18n · no migration.
- 🚫 The idempotency key · the SKIPPED-row behaviour · TASK-152's loud reason string.
- 🚫 **`enqueueLine` storing the payload WHOLE** — *that is what made `course_confirmed` survivable.*

## Definition of Done — design half only
- [ ] 🔑 **The four answers from `§3`, written here** — 🚫 **no code**
- [ ] 🔴 **The historical-rows plan is CONCRETE** — ⚠️ *"lenient" is not a plan: what happens to a row that
      lacks a field the union requires?*
- [ ] **You say what it does NOT fix** — 📌 *especially whether a producer's WRONG TYPE still gets through*
- [ ] **You say how big the code half is** — *fourteen shapes is a number I want before agreeing to it*
- [ ] 🚫 **Nothing in `src/`** — `git status` proves it

## Question
🔑 **You have now twice preferred a mechanism on the unavoidable path over a set of assertions** — the trim at
the builder, and now the parse at the read.
⇒ ❓ **Is there a case in this product where the OPPOSITE is right — where the ASSERTIONS are the better answer
and a chokepoint would be worse?**
📌 *I ask because I have accepted the principle quickly, twice, and a principle I have never seen fail is one I
have not yet tested.* ⚠️ **If the honest answer is "no case here", say that** — 🔑 **but I would rather find its
edge from you now than discover it in a task I have already dispatched.**

---

## ✅ DESIGN HALF 2026-09-10 — @Jason. 🚫 **NOTHING IN `src/` FROM THIS TASK.**
📌 `git status` carries **only TASK-332's three files** (`line-message.ts`, `course-deduction.ts`,
`remaining-zero.test.ts`), already reported and awaiting the human's commit. **TASK-333 added nothing.**
*(Two throwaway probes under `scripts/`, deleted.)*

---

# 🔴 STOP — THE INVENTORY FOUND SOMETHING LIVE, AND IT IS NOT A TYPE PROBLEM

**Answering `§3`.3 required listing every payload KIND a producer emits against every kind the renderer has a
`case` for. They are not the same list, and the gap is live today.**

### **THREE kinds are enqueued and rendered as `🔔 แจ้งเตือนจากระบบตารางเรียน` — the generic default.**
| kind | producer | what the reader gets today |
|---|---|---|
| 🔴 **`teacher_link_approved`** | `teacher-link.service.ts:160` | **`🔔 แจ้งเตือนจากระบบตารางเรียน`** — and **the payload CARRIES the right text**, `text: t("verify_teacher_ok", …)` = *"ผูกบัญชีครูสำเร็จ ✅ (ก้อง)…"* ⇒ **the renderer never reads `payload.text`** |
| 🔴 **`student_registered`** | `line-webhook.service.ts:780` | the same generic line — **`studentName` and `parentPhone` are on the payload and unread** |
| 🔴 **`parent_asked_for_admin`** | `line-webhook.service.ts:1072` | the same generic line — **an admin is pinged that *somebody* wants a human, with no idea who** |
**Measured, not read:** I rendered all three through `formatOutboxMessage`. **All three return the default.**

🔑 **The `teacher_link_approved` one is the sharpest, because the code says so itself.** The comment directly
above that send reads:
> *"The bot promised 'you'll be told once it's approved' — not sending would make it a lie."*
⇒ **the send happens and the message says nothing.** **The promise is kept in form and broken in content.**
⚠️ **And it is not silent-invisible like `Remaining : 0`** — a teacher DOES see something. **It is worse in one
way and better in another:** they get a notification they cannot act on, and they have no reason to think a
better one existed. 📌 *`student_registered` is TASK-152's lesson inverted: that task made a SKIPPED row loud;
this row is SENT and mute.*

🚫 **I have not touched any of it** — TASK-333 is design-only and this is not a type failure, it is **a missing
branch**. ✅ **It is one `case` each, or one `payload.text` passthrough for the first.** ⚠️ **But it is a COPY
decision for the two admin ones** (what should an admin alert say?) ⇒ **@Porter's, not mine.**
🔴 **Cut it as its own task and it does not wait for TASK-328** — *nothing about it is a visible-label change.*

---

# §3 THE FOUR ANSWERS

## 1 · WHERE the parse happens — **the outbox read, not the renderer's entry**
✅ **`outbox.service.ts:78`, the line that today reads `formatOutboxMessage(row.payload as any, …)`.**
- 🔑 **That is where the `any` is CREATED.** A parse anywhere else is downstream of the lie.
- ✅ **It has exactly ONE non-test caller** — measured: `formatOutboxMessage` is called from `outbox.service.ts`
  and nowhere else in `src/`. ⇒ **one home, and it cannot be bypassed.**
- 🚫 **NOT at `formatOutboxMessage`'s entry.** That function is PURE and is called from ~20 test files with
  hand-built payloads. **Parsing there turns a runtime boundary into a test burden** and would make every
  existing message test satisfy a schema to assert a string. 📌 *The renderer's job is to render; the
  boundary's job is to know what came out of the database.*
- ✅ **And the row is where the RECORD belongs** — `notification_outbox` already has an `error` column and the
  `skipReason` convention (TASK-152). **The parse's output has somewhere to go that a human already reads.**

## 2 · What a FAILED parse does — **log and send WHAT IT CAN. The other two are refuted by the spec.**
| option | what the PARENT sees | verdict |
|---|---|---|
| log and **skip** | 🔴 **nothing at all** | 🚫 **violates `§2` outright** — *"no message that sends today stops sending"* |
| log and send **raw** | 🔴 **JSON in their LINE** | 🚫 never |
| ✅ **log and send what it can** | **exactly what they see today** | ✅ **the only one compatible with the spec** |

### 🔴 And the concrete historical-rows plan, because *"lenient"* is not one
✅ **Ship the parse in OBSERVE-ONLY mode. It does not gate rendering at all.**
**A row that lacks a field the union requires renders EXACTLY as today** — the renderer's omit-empty already
handles a missing field — **and the parse writes one log line naming the row id, the kind, and the field.**
⇒ 🔑 **We then READ those logs for a period and learn which historical shapes exist**, and only then decide
whether anything should become authoritative. 📌 ***The union's first job is to TELL US WHAT IS IN THE TABLE,
not to enforce anything.*** ⚠️ **That is the only version of this that cannot cause an outage**, and the rows
most likely to fail are the oldest — from the period when we were least careful, which is exactly the data
nobody can re-create.

## 3 · How a NEW kind is added afterwards — **one place, and only if a second discipline comes with it**
🔴 **Today it is worse than "one place": you can add a PRODUCER and forget the renderer entirely, and nothing
fails.** **That is not hypothetical — it has happened three times** (§ the live finding above).
✅ **With the union as the SOURCE of `kind`, and the switch checked exhaustively against it** (a `never` in
`default`, or a `Record<Kind, …>` — **the pattern this repo already uses three times**: `Record<BookingStatus,
Entry>`, `Record<AttentionKey, Entry>`, `Record<TemplateKey, readonly FieldKey[]>`) ⇒ **adding a kind means
editing the union, and the compiler names the branch you have not written.**
⚠️ **But that only binds the RENDERER.** 🔑 **A union cannot make a producer use it** — a producer builds an
object literal and hands it to `enqueueLine(payload: unknown)`. ⇒ **"one place" requires payload CONSTRUCTORS:
one typed function per kind, the way `deductionPayload` already is.** 📌 **That is the honest cost, and
`deductionPayload` is the model — it is already exactly this.**

## 4 · What it does NOT fix — **and the answer to your `§3`.4 is "yes, but it does not help as much as it sounds"**

❓ ***Does a SHAPE parse catch `remaining: 0`?***
✅ **YES — if the union declares `remaining: string`, a number fails.** 🔻 **But two things make that much
narrower than it sounds, and you asked me to be honest rather than encouraging:**
1. 🔴 **After TASK-332 the renderer handles `0` CORRECTLY** (`fieldValue` → `"0"`). ⇒ **a union declaring
   `string` would now REJECT a payload the product renders perfectly.** 🔑 ***The union must describe what
   producers ACTUALLY send — historically — not what we wish they sent***, or strictness re-creates the exact
   outage risk `§2` forbids.
2. 🔴 **In observe-only mode, catching it produces a LOG — not a correct message.** The parent still gets
   whatever the renderer makes of it.
⇒ 🔑 ***The parse DETECTS. The producer type PREVENTS. They are complementary, and neither alone closes the
class.*** 📌 **That is the sentence I would want in `SYSTEM-FACTS`, because it is the thing I would otherwise
have to re-derive when someone says "we have the union now".**

**It also does NOT fix:**
- 🚫 **A WRONG VALUE of the RIGHT type.** `remaining: "3 HR"` when the true balance is 2 passes every parse
  ever written. ⚠️ **`Remaining : 0` happened to be a TYPE problem. The next one may not be**, and a union
  would be silent about it.
- 🚫 **The three unrendered kinds above.** They are a MISSING BRANCH, not a bad shape. ✅ *An exhaustive switch
  over the union would surface them — but that is the EXHAUSTIVENESS, not the parse.*
- 🚫 **`ctx`.** `bookingContext` returns a typed `MessageContext` already; it is not on this boundary.

## ➕ How big is the code half — **the number is SEVENTEEN, not fourteen**
| | count | |
|---|---|---|
| kinds the renderer has a `case` for | **14** | |
| kinds a producer actually emits | **14** | |
| **in both** | **11** | the ordinary ones |
| 🔴 **renderer-only — DEAD branches** | **3** | `reschedule_requested` · `sick_leave` · `leave_teacher` *(no producer anywhere; the last two went unsent as a side effect of my own TASK-305, which I reported at the time)* |
| 🔴 **producer-only — render the DEFAULT** | **3** | the live finding above |
⇒ ✅ **17 distinct kinds.** 🔑 **The union itself is the small part** — one file, one parse call, one
exhaustiveness check. ⚠️ ***The work is the six anomalies***, and each needs a decision rather than a type:
**delete the three dead branches, and give the three unrendered kinds a message (copy, so @Porter's).**
📌 **That is worth knowing before agreeing to it, and it is why I would do the LIVE three first, separately.**

---

## ❓ YOUR QUESTION — **yes, there is a case, it is in this product, and we already decided it the other way**

🔴 **`REQ-085 §8.1` — the two opposite empty-field rules.** `**Advance Leave Notice` ALWAYS prints `(-)`;
`Remark` vanishes entirely. **Both at the bottom of the same message.**
⇒ **A chokepoint — one "empty field policy" at the field renderer — would have to carry BOTH**, and the REQ
calls this *the trap* precisely because the two look like one rule. 🔑 **TASK-284 asserted them SEPARATELY on
purpose**, and the note in that file is the argument: ***"one 'empty fields' test cannot catch a swap"***.
✅ **That is a case where the assertions are better and we already chose them.**

### 🔑 The criterion, stated so it can be applied rather than admired
***A chokepoint is right when the invariant has ONE answer for every instance. When instances legitimately
DIFFER, the chokepoint has to carry a table of exceptions — and a table of exceptions is the per-instance
knowledge you were trying to escape, moved somewhere nobody reads it against the message it applies to.***
📌 **Test it against the four:** *no trailing whitespace* — one answer, chokepoint ✅. *No placeholder leaks* —
one answer ✅. *`(-)` vs absent* — **two answers by design** ⇒ assertions ✅. *The labelling convention* — one
answer, **but see below.**

### ⚠️ And a SECOND edge, which is the one that bit TASK-328 and which you found before I did
***A chokepoint can only enforce what it can DISTINGUISH at the point it acts.***
**The trim works because trailing whitespace is recognisable in a finished string without knowing what the
string MEANS.** 🔴 **A colon is not**: it is a label separator, and it is also a character in `📅CONFIRMED
SCHEDULE:` and in a parent's typed `Remark`. ⇒ **normalising at the exit cannot tell them apart, and that is
not a limitation of the idea — it is the reason the invariant does not belong there.**
🔑 **So the two questions are: *does it have one answer?* and *can the chokepoint SEE the difference from where
it stands?*** **`§8.1` fails the first. The labelling convention fails the second.**

### 📌 And one honest third, since you asked for the edge rather than the endorsement
**A chokepoint on the unavoidable path is a single point of failure.** The trim is safe because it is
**idempotent and cannot corrupt** — the worst it can do is nothing. ⚠️ **A NORMALISING chokepoint that got it
wrong would damage all fourteen messages at once**, where a wrong assertion breaks one test and is loud.
⇒ 🔑 **the principle is strongest for chokepoints that can only SUBTRACT (trim, omit) and weakest for those
that REWRITE.** 📌 *That is the shape of the edge, and it explains both of my own answers this week without
having to appeal to taste.*

**BALL: @Sober — design half delivered, no code. 🔴 THREE LIVE unrendered kinds — cut them as a task and they
do not wait for TASK-328. ⛔ TASK-333's code half stays held.**
