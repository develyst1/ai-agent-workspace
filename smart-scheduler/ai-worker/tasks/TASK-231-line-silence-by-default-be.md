# TASK-231: BE — 🔴 silence by default: the bot must STOP answering stray text (a change to shipped behaviour)

- Source: SPEC-071 amendment 2026-09-02 · REQ-079 **§16** · AC-16 · AC-17 (revised) · AC-18
- Status: ✅ DONE — code (Sober 2026-09-02) · rendered re-test = @Tanya (⚠️ leave the chat 30 min first). Was: REVIEW — TTL added; the DoD box the screenshot tests is now closed

## 🔴 Read this first: this is a REGRESSION task, not an additive one

The owner's screenshot (REQ-079 §16) shows the **deployed** bot answering stray text in an **idle** chat:
`เมนู` → *"เบอร์โทรไม่ถูกต้อง…"* · `yo` → *"ไม่พบครูชื่อเล่น \"yo\""* — **while a human was about to reply.**

⇒ **AC-16 is taking something away from a running system that real teachers use.** The current handlers
demonstrably reply; this task makes them stop. **It deserves the sharpest regression in the batch**, and the test
must **fail on today's handlers**.

🔴 **And it must not silence what should still answer.** The linking conversation and every in-flow step keep
working. Enumerate the paths from the router before you change any of them — the risk here is not "too loud", it
is "silenced the wrong branch and nobody notices for a week".

## What to do

**1. Route precedence** — extend `decideMessageRoute` (`line-routing.ts`), do **not** replace it; the rule it
already encodes (*"an in-progress conversation wins over already-linked routing"*) stays:

```
muted_until in the future   → deliver NOTHING                      (AC-17 revised)
session.step is set         → the flow owns this message           (typed 1 / 2 = an answer, AC-19)
postback / button           → start that flow
otherwise                   → SILENCE                              (AC-16)
```

**2. `muted_until` — the mechanism, and ONLY the triggers we can see.**
🔴 **§16 is measured, not assumed:** the owner replied in OA Manager on `sid` and **no `[line-in]` was logged**.
An admin's reply is **outbound** and never reaches our webhook. ⇒ **the automatic admin-reply trigger cannot be
built. Do not attempt it.** Wire exactly two, both inbound and both certain:
- the parent pressing **`คุยกับแอดมิน`** (Flow 7);
- the **two-strikes** handover (below).
🚫 **Do not build the back-office "หยุดบอทในแชทนี้" control** — @Porter has it recorded as the fallback, not now.

**3. Two strikes → a human (AC-18).**

> 🔴 **`unexpected_count` SURVIVES the 2026-09-02 cut — read this before deleting anything.**
> @Porter's CUT list (REQ-079 §2) says *"the attempt counter"*. That is the **invite/code** attempt counter,
> which is gone with the invite. It is **NOT** this one: Rule 5 and AC-18 still require *"two unexpected replies
> and the bot hands over"*, and **TASK-230 has already shipped the column.**
> **This is the third time these two counters have nearly been deleted on one sentence.** The distinction lives
> in the migration, in `schema.ts`, and in a comment-stripping test — leave all three.
 `unexpected_count` increments on an unrecognised reply **inside a flow**;
at 2 the bot hands over (`ขอโทษค่ะ ขอส่งให้แอดมินช่วยดูนะคะ 🙏`) and sets `muted_until`.
⚠️ **Resets on success, expires with the session** (TASK-230). *A parent must never be trapped in a loop with a
machine while a person is sitting in the same chat.*

## Definition of Done — the OUTCOME
- [ ] 🔴 **An idle chat receiving `เมนู` / `yo` / any stray text gets NO reply.** A test that **fails on the
      current handlers** — say so in your notes, the way TASK-237's regression did.
- [ ] The linking conversation and every in-flow step still answer — enumerate the paths you checked.
- [ ] A muted chat stays silent; **the bot still works normally in every other chat** (AC-17's real requirement —
      assert two conversations, not one).
- [ ] Two unexpected in-flow replies → handover message + mute. One, then a valid answer → counter back to 0.
- [ ] **AC-21:** teacher schedule, course-confirm, booking-confirm and the 08:15 job are untouched — by diff.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun test` green. 🚫 No message sent anywhere.

## Implementation Notes (Jason, 2026-09-02)
| | |
|---|---|
| Repo | `H:\scheduler\smart-scheduler-back` — the `machine.local.md` row |
| `git rev-parse HEAD` | `03458a3` |

🔴 **No migration** — TASK-230's `0030` already shipped both columns. Code only.

### The regression, and where it lives
**`src/lib/line-routing.test.ts:25` used to assert `"welcome"` and PASSED.** That single line *was* the shipped
defect: an unlinked chat replying to any stray text. I changed the assertion rather than adding a new test
beside the old one — **a new test passing next to an untouched old one would have proved nothing.** The diff on
that line is the evidence the DoD asked for, and the comment there says so.

### 🔎 The five silenced fallbacks — enumerated, because the task asked which paths changed
| # | Site | Was | Now |
|---|---|---|---|
| 1 | `handleParentCommand` tail | `return doMenu(...)` — **the loudest**: a linked parent typing *anything* got the menu back | silence |
| 2 | teacher branch | `t("teacher_linked")` catch-all — the `yo` class from §16 | silence |
| 3 | admin branch | `t("admin_linked")` catch-all | silence |
| 4 | `route === "silence"` | unlinked + no session → `t("welcome")` | silence |
| 5 | tail of `handleMessage` | a session row whose `step` is none we use → `t("welcome")` | silence |

**#5 I found while checking the other four.** It is #4 wearing a stale session, and it would have kept the
screenshot's behaviour alive in exactly the chats that had one.

### 🔴 And what must KEEP answering — the half I care about more
The task's warning is that the risk is *"silenced the wrong branch and nobody notices for a week"*. Kept, and
asserted:
- **every recognised PARENT command** — `ลา` (sick leave), `เช็คอิน`, `qr`, `นักเรียน`, `เพิ่มนักเรียน`, `เมนู`,
  and the numbered `ลา 2` / `เช็คอิน 1` picker answers. **`ลา` is how a family reports a sick child**; silencing
  it would have looked like an unrelated outage.
- **the teacher keyword fallbacks** `ตาราง` / `ปฏิทิน` (REQ-015 / REQ-017's deliberate keyboard route).
- **`สมัคร` from any state** — checked before the route is even computed, so silence cannot swallow the way in.
- **every in-flow step** (AC-19), and **the follow greeting** — 🚫 not silenced, because adding the OA is
  someone knocking, not stray text, and it is how a new parent learns what to type.

📌 **My reading, stated because it is a judgement:** *"otherwise → SILENCE"* means **unrecognised** text. A
recognised command is not stray — the user typed it deliberately. Reading it as "only session-steps and
postbacks ever answer" would have deleted sick-leave reporting by keyword, which AC-16 cannot mean. **Correct me
and it is a small change.**

### AC-17 mute / AC-18 two strikes
`isMuted` is pure and accepts the **string a DB row actually returns** as well as a `Date` (and garbage never
mutes forever). Mute is checked **first** — a human is talking, so every other rule would put the bot on top of
them — and it deliberately does **not** clear the session: the parent may be mid-flow and a person is about to
read the whole conversation.

Two strikes is wired to the two branches that can fail *recognisably*: `CHOOSE_ROLE` (unparseable role) and
`AWAIT_CODE` (verification failed) — **the second is the exact branch §16's screenshot came from.** Free-text
steps like a student's name have no "unrecognised" to detect, so they are not wired, deliberately. It resets on
every success, and the handover itself resets the count so a returning parent starts clean rather than one
strike from silence.

### Verified
```
bunx --package typescript@5.6.3 tsc --noEmit   → exit 0
bun test                                        → 1130 pass / 0 fail (+19)
```
🚫 No message was sent anywhere; nothing ran against any environment.

### 🚫 What is NOT proven by me, and one thing this task does NOT fix
The silence itself is a live-box observation — Tanya's, and she has the owner's chat linked as teacher Bank.
⚠️ **And see §Questions: the specific screenshot may still reproduce**, because its cause is a stale session
with no expiry, which is a different defect from the one this task fixes.

## Questions
- 🔴 **`line_link_sessions` rows NEVER expire, and that — not the fallbacks — is what produced §16's
  screenshot. This task does not fix it, and I want that said before anyone re-tests.**

  `getSession` reads the row with no time bound, and nothing deletes a stale one:
  ```ts
  async function getSession(lineUserId: string) {
    return db.query.lineLinkSessions.findFirst({ where: (s, { eq: e }) => e(s.lineUserId, lineUserId) });
  }
  ```
  So an **abandoned `สมัคร` leaves `step = AWAIT_CODE` forever**, and every message that account ever sends is
  treated as a code attempt. That is precisely the screenshot: `เมนู` → *"เบอร์โทรไม่ถูกต้อง…"* is the parent
  phone branch, `yo` → *"ไม่พบครูชื่อเล่น yo"* is the teacher-nickname branch — **both are `AWAIT_CODE`**, not
  the idle-chat fallbacks I silenced.

  ⇒ Under the precedence you specified, *"session.step is set → the flow owns this message"* keeps that chat
  answering. **The five fallbacks are genuinely fixed; the chat in the screenshot may not be.** What TASK-231
  *does* give it is a floor: two strikes now hands over and mutes for an hour instead of re-prompting forever.

  **I did not add a session TTL**, because it is a behaviour change nobody ordered and it cuts both ways — too
  short and a parent typing slowly loses their flow mid-registration. But TASK-230's own comment says the
  counter *"expires with the session"*, which assumes an expiry that does not exist. **Options, your call:**
  **(a)** a TTL in `getSession` (`updated_at > now() - interval`), one line, ~30 min feels right · **(b)** treat
  a stale step as idle in the router, which is the same thing expressed as routing · **(c)** accept it and let
  two-strikes bound the damage. 🔴 **If the owner re-tests with the same chat and it still answers, (c) will
  read as "the fix did not work".**

- **My reading of *"otherwise → SILENCE"* is "unrecognised text", not "only flows and postbacks".** Recognised
  parent commands (`ลา`, `เช็คอิน`, `qr`) and the teacher keyword fallbacks (`ตาราง`, `ปฏิทิน`) still answer.
  The stricter reading would delete **sick-leave reporting by keyword** — a shipped REQ-046/049 flow — which I
  do not believe AC-16 means, and which is exactly the *"silenced the wrong branch"* failure you warned about.
  **Stated rather than assumed; it is one small change if you read it the other way.**

- **`MUTE_MINUTES = 60` is mine and is not in any AC.** It needs to be long enough for a person to actually
  reply and short enough that a forgotten mute does not leave a family unable to use the bot tomorrow. **An
  hour is a guess with reasoning, not a requirement** — if the owner has a view (or wants "until the admin
  replies", which §16 already proved we cannot detect), it is one constant.

- 🚫 **I did not build the back-office "หยุดบอทในแชทนี้" control**, per your instruction, and I did not attempt
  the automatic admin-reply trigger — §16 measured that an admin's reply never reaches our webhook. The two
  inbound triggers are the two-strikes handover and (in TASK-234) the `คุยกับแอดมิน` button.


---

## Reopened addition — the session TTL (Jason, 2026-09-02)

`git rev-parse HEAD` `03458a3` · repo `H:\scheduler\smart-scheduler-back` · **no migration** ·
tsc **0** · `bun test` **1139 pass / 0 fail** (+9 on the TTL).

### Option (a), at the source
`getSession` returns `undefined` for a row older than **`SESSION_IDLE_MINUTES = 30`** of silence. Nothing is
deleted — an expired row stays for the record, it simply stops being authoritative — and **silence then follows
from the rules already built** rather than from a second mechanism. The predicate `isSessionExpired` is pure and
lives beside `isMuted` in `line-routing.ts`, so "is this session still live?" has one definition.

### ⚠️ The trap you named — handled, and it was real
Only `setStep` wrote the row, so a parent retrying **inside** one step never touched it: a wrong code twice, and
the window would have been running against someone actively replying. **`touchSession` now refreshes the row for
every inbound message a session HANDLES** — the `add-student` and `linking` routes — **before any branch below
can return**.

🔴 **And only those two routes.** A `linked` or `silence` route is not a session conversation, so it must not
refresh: stray text keeping a dead row alive forever is the original bug wearing a different hat. A test asserts
the touch line names neither.

The test that makes "inactivity, not age" concrete: a flow **started** two hours ago whose **last message** was
ten minutes ago is **not** expired. That is the parent-typing-slowly case, stated as a scenario rather than as a
comparison of numbers.

### One judgement inside the predicate
**An undated or unparseable `updated_at` is treated as EXPIRED, not fresh.** A row we cannot date is a row we
cannot trust to be someone's live conversation — and of the two ways to be wrong, "fresh" is the one that lasts
forever, which is the bug we are closing.

### Why 30 minutes is safe rather than destructive
**`สมัคร` restarts the flow from any state**, and it is checked before the route is even computed. So the cost of
expiring is one word retyped — asserted, because that is the whole argument for the window being this short.

### 🚫 Still not proven by me
That the owner's actual chat now falls silent. It needs the deployed bot and his phone — Tanya's, and she has
his account linked as teacher Bank. **What I can say is that the cause is now addressed rather than the
symptom**: the `AWAIT_CODE` row that chat is carrying will stop being found 30 minutes after its last message.

## Review
(Sober fills this in at REVIEW.)

## Review — Sober, 2026-09-02: ✅ **PASS on the work.** 🔴 **You found the real cause and my task named the wrong one.**

**Reproduced:** `tsc --noEmit` → **0** · `line-routing.test.ts` → **6 pass / 0 fail** · `isMuted` /
`MUTE_MINUTES` at `line-routing.ts:41,61` · `getSession` at `line-webhook.service.ts:87`.

### 🔴 The finding, and it corrects §16 and me

**§16 attributed the screenshot to idle-chat fallbacks. It isn't.** You traced both strings to **`AWAIT_CODE`** —
`เมนู` → the parent-phone branch, `yo` → the teacher-nickname branch — and the sessions **never expire**. ⇒ an
abandoned `สมัคร` leaves that chat treating **every message it ever sends** as a code attempt, forever.

📌 **That is a live defect on real users today**, independent of AC-16, and it is the thing the owner will re-test.
**You were right to say the five fallbacks are fixed and the screenshot may not be** — reporting the gap between
*what the task asked for* and *what the reporter will check* is worth more than a green DoD.

📌 And **#5 — a stale session whose `step` is none we use — you found while checking the other four.** It is #4
wearing a stale session, and it would have kept the screenshot's behaviour alive **in exactly the chats that had
one**. That is the shape of bug that survives a fix and discredits it.

📌 **Changing the assertion at `line-routing.test.ts:25` instead of adding a test beside it** is right: *"a new
test passing next to an untouched old one would have proved nothing."* That old `"welcome"` line **was** the
shipped defect, written down as correct.

### ✅ Decision on the session TTL — option **(a)**, and it is part of THIS task, not a follow-up

**My task's first DoD box is *"an idle chat receiving `เมนู` / `yo` gets NO reply"* — that is literally the
screenshot, and it still reproduces. The box is not met.** That is my under-specification, not your build: I wrote
the DoD from §16's diagnosis and §16's diagnosis was wrong.

**Do (a): bound `getSession` by `updated_at`.** Not (b): the router is one caller, and a rule at the source gives
**every** reader the same answer — the same one-definition principle you applied to `SLOT_INACTIVE_STATUSES` and
to the family accessor. A stale row simply stops being found, the chat routes as idle, and silence follows from
the rule you already built.

- **30 minutes**, and 🔴 **it must be INACTIVITY, not age** — that is what makes it safe. `updated_at` carries
  `$onUpdate`, so a moving conversation keeps refreshing and a parent typing slowly is never dropped mid-flow.
- ⚠️ **The trap: only `setStep` writes today.** A parent retrying inside one step (wrong code twice) may not
  touch the row at all, so the window would run against someone who *is* actively replying. ⇒ **touch
  `updated_at` on every inbound message a session handles**, not only on transitions. Without that, (a) creates
  the "lost my flow" failure you were right to worry about.
- **Nothing is deleted.** An expired row stays for the record; it is simply no longer authoritative.

📌 This also repairs TASK-230's comment — *"the counter expires with the session"* — which currently assumes an
expiry that does not exist. **Good catch that the comment was already describing a system we had not built.**

### ✅ Your reading of "otherwise → SILENCE" — CORRECT, and I am glad you stated it

**Unrecognised text, not "only flows and postbacks".** The stricter reading would have silenced **`ลา`** — how a
family reports a sick child (REQ-046/049, shipped) — which is precisely the *"silenced the wrong branch and
nobody notices for a week"* failure the task warns about. **A recognised command is not stray: the user typed it
deliberately.** Keep it, and keep the enumeration in your notes; it is the evidence that the silencing was
surgical.
✅ **Not silencing the follow greeting** is right too — adding the OA is someone knocking, not stray text.

### `MUTE_MINUTES = 60` — accepted, and going to @Porter as a named parameter

Your reasoning is sound (long enough for a person to reply, short enough that a forgotten mute does not strand a
family). **It is not in any AC**, so it is a product parameter and he should see it. Keep it as the named
constant it already is — one edit if the owner has a view. 📌 And "until the admin replies" is unavailable
*because* §16 measured that we cannot see an admin reply — worth the sentence you gave it.

### 🚫 Confirmed not built
The back-office mute control, and the automatic admin-reply trigger. Correct on both.

**Status → the code PASSES. This task stays open for the TTL addition above**, which is small and which closes
the DoD box the screenshot actually tests.

## Review #2 — Sober, 2026-09-02: ✅ **PASS. TASK-231 is DONE.** You went past the trap I named to the one behind it.

**Reproduced:** `tsc --noEmit` → **0** · `line-routing` + `other-booking` → **38 pass / 0 fail** ·
`SESSION_IDLE_MINUTES` / `isSessionExpired` at `line-routing.ts:79,88` · the guard at
`line-webhook.service.ts:109` · `touchSession` at `:121`, called at `:578` **only** for `add-student` / `linking`.

### 🔴 The refinement I did not specify, and it is the load-bearing one

I asked you to touch `updated_at` on every inbound message a session handles. **You narrowed it to the two routes
a session actually owns**, and the reason is the whole point:

> *"A `linked` or `silence` route must NOT refresh: stray text keeping a dead row alive forever is the original
> bug wearing a different hat."*

**That is exactly right, and my instruction as written would have re-created the defect.** A chat stuck in
`AWAIT_CODE` sends stray text; if any inbound message refreshed the row, the 30-minute window would never
elapse and the session would live forever — **the fix would have looked applied and changed nothing.** Asserting
that the touch line names neither route is the right way to pin it, and taking a second pass to see it is worth
recording rather than smoothing over.

### The three judgement calls, all right

- **An undated or unparseable `updated_at` is EXPIRED, not fresh.** The asymmetry is the argument: *of the two
  ways to be wrong, "fresh" is the one that lasts forever* — which is the bug being closed. Same shape as your
  `bo.item` missing-item rule: fail toward the state someone will notice.
- **The test is a scenario, not a number** — a flow started two hours ago whose last message was ten minutes ago
  is **not** expired. That is what makes *"inactivity, not age"* a property rather than a comment, and it is the
  parent-typing-slowly case stated as an assertion.
- **`สมัคร` restarts from any state, checked before the route is computed** ⇒ **the cost of expiring is one word
  retyped.** That is the entire argument for a window this short, and you asserted it instead of claiming it.
  Without that line, 30 minutes would be a guess; with it, it is a bounded one.

**Nothing deleted, the expired row kept for the record, and "is this session live?" now has one definition beside
`isMuted`** — the same principle as `SLOT_INACTIVE_STATUSES`, applied without being asked.

### What this closes, and what it honestly does not

✅ **The DoD box the screenshot actually tests is now closed at the cause**, not the symptom: the `AWAIT_CODE` row
that chat carries stops being found 30 minutes after its last message.

🚫 **That the owner's real chat falls silent is @Tanya's**, with his account linked as teacher Bank — and you are
right to keep saying so rather than implying the screenshot is fixed. 📌 **Note for the re-test:** the chat must
be **left alone for 30 minutes** before it is retried. Poking it resets nothing (the touch is route-scoped) but
**the window is measured from its last message**, so a retest done immediately would still see the old behaviour
and read as a failure. That sentence goes to @Porter with the round.

**Status → DONE (code).** 🟢 TASK-240 still yours, still after the release.
