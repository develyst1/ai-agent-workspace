# TASK-246: BE — a mute silences the bot's INITIATIVE, never the parent's way out or back in (DEF-8 + §14)

- Source: @Porter's ORDER + **DEF-8 (blocker)**, 2026-09-03 · REQ-079 **§14 AC-23…AC-26** · owner-found on his
  own device, twice
- Status: **REVIEW (round 2)** → @Sober (2026-09-03, Jason) — the `unmute()` flow-clear is in. `tsc` 0 ·
  `bun test` **1278 pass / 0 fail** · no migration (32 = 32). Repo: **smart-scheduler-back**.
  Was: 🔄 REOPENED (Sober 09-03, code PASSED, one addition) ← REVIEW (Jason) ← TODO. Q1 approved, Q2 decided.
  ⚠️ **One thing to look at in round 2: I scoped the flow-clear to a chat that is muted *right now*** — see the
  Notes. It keeps your rule for all three doors without discarding an unmuted parent's live flow.

## The two findings are one defect

**DEF-8 (mobile, `sid`, owner):** a muted chat's **button** worked, the bot **asked** *"พิมพ์ชื่อนักเรียน… หรือ
พิมพ์ ยกเลิก เพื่อออก"*, the parent answered `มิลล่า` — **silence.**

🔴 **And it takes the escape with it.** If all text is swallowed while muted, **`ยกเลิก` is swallowed too** — the
exit TASK-245 built and the owner verified working at 08:15 the same morning. **The parent is trapped again,
through the state machine instead of the command list**, and the prompt is *advertising an escape the bot will
ignore.* That is the `เมนู` contradiction returning: **what the bot promises and what the bot does disagree.**

**§14 (owner):** a muted chat must be re-openable **by typing** — LINE PC has no rich menu, so a muted PC parent
has nothing to tap and sits in a silence nobody explained.

## 🔴 The principle — one sentence, and the whole class disappears

> **A mute silences the bot's INITIATIVE. It never silences the parent's ability to get OUT, or to come BACK.**

Everything below follows from that, so a case nobody listed still resolves correctly.

| While muted | Behaviour |
|---|---|
| **A button / postback** | ✅ **un-mutes**, then runs the action normally (@Porter's recommendation — a parent tapping the bot's own control has chosen to engage it) |
| **`เปิดเมนู`** | ✅ **un-mutes**, shows the command list, **starts nothing** (AC-26) |
| **`ยกเลิก`** | ✅ **honoured** — clears any session and confirms it. 🔴 **Does NOT un-mute:** *"get me out"* is not *"let me back in"*. Two intents, two effects. |
| **Anything else** — including plain `เมนู`, `เพิ่มนักเรียน`, free text | 🚫 **silence** (AC-25) |

**Why plain `เมนู` must NOT un-mute** (@Porter's, and keep it): while muted, `เมนู` is *deliberately* ignored. If
it re-opened, **a parent idly reaching for a familiar command would drop the bot back into a live conversation
with an admin.** *The un-mute must be a thing you choose, not a thing you reach for.*

📌 **This does not reopen Rule 2.** Rule 2 bans a keyword **starting a flow out of an idle chat** — the
customer's own *"commands triggered accidentally"* fear. `เปิดเมนู` is the opposite shape: **a deliberate act, by
someone who was just told the word, ending a state they are already in. It starts nothing.**

## What to do

1. **One un-mute path.** The button and `เปิดเมนู` both call the **same** `unmute()`. ⚠️ @Porter's requirement:
   *the parent must not learn two different ways back depending on their device.* 🔴 **One function, asserted by
   call-site count** — two implementations is how the two diverge.
2. **`ยกเลิก` before the mute gate.** It is checked at the top of the handler already (TASK-245); the mute check
   must not sit in front of it. **Assert the ordering**, because this is precisely the bug: a gate that swallows
   the escape it advertises.
3. **AC-24 — the word is TOLD, not discovered.** **Both** mute messages (the two-strikes handover *and*
   `คุยกับแอดมิน`) must name `เปิดเมนู` in the same message that mutes the chat. **A way out nobody was told
   about is not a way out.**
4. ✅ **@Porter's fallback needs no second guard.** He asked that, if a mute survives a button press, *a muted
   chat must not be able to enter a flow at all*. With rule 1 the button un-mutes **first**, so a flow is only
   ever entered unmuted — **DEF-8 becomes unreachable by construction rather than by a check.** Say that at the
   site so nobody adds the guard later and wonders why it never fires.
5. ⚠️ **One edge to check, not redesign:** the handover deliberately **keeps** the session (TASK-231 — *"a person
   is about to read the whole conversation"*). So un-muting can land a parent back inside a half-finished flow
   they have forgotten. TASK-231's 30-minute inactivity TTL covers most of it. **Report what happens; do not
   invent a rule.** If un-muting resurrects a stale step, say so and I will decide.

## Definition of Done — the OUTCOME
- [x] 🔴 **DEF-8's exact sequence:** muted → button → the bot asks → the parent types a name → **it is
      answered.** Test the owner's three messages, in order. → ⚠️ **half, and named**: the tap-un-mutes-first
      **ordering** is asserted structurally and the routing of his third message is proven purely
      (`decideMessageRoute("AWAIT_STUDENT_NAME", "customer", {mutedUntil: null})` → `add-student`). The replay
      itself needs a muted session **row** — @Tanya's.
- [x] **`ยกเลิก` works while muted** — flow cleared, confirmed in words, and the mute is **unchanged**.
      🔴 See the Notes: `clearSession` could not be used, and the reason is the interesting part.
- [x] **AC-23:** `เปิดเมนู` un-mutes and shows the command list. **AC-26:** it starts no flow (asserted as an
      absence: no `setStep`, no `setDraft` in that branch).
- [x] **AC-25 survives:** while muted, `เมนู` · `เพิ่มนักเรียน` · free text are still **silent** — the branch
      has exactly two doors and then a bare `return`, asserted by count.
- [x] **AC-24:** both mute messages name `เปิดเมนู`, in both languages — and the test checks the advertised word
      is a word `isReopenWord` actually accepts, not just a string in the copy.
- [x] **One `unmute()`**: one definition, **no other writer clears a mute** (`mutedUntil: null` appears exactly
      once in the file) — stronger than counting the two paths. ⚠️ It has **three** call sites, not two; the
      third is `สมัคร` and it is **Q1**.
- [x] The mute-gate/`ยกเลิก` ordering is asserted.
- [x] `bunx --package typescript@5.6.3 tsc --noEmit` → **0** · `bun test` **1273 pass / 0 fail** · **no
      migration** — counted: **32 `drizzle/*.sql` = 32 journal tags**. 🚫 Nothing sent to a real recipient; no
      rich-menu republish; no SQL run.

## Implementation Notes

Repo **`smart-scheduler-back`** (path in `machine.local.md`), HEAD **`699c290`** (unchanged — Git is the
human's). New test: `src/services/line-mute-exit.test.ts`.

**The vocabulary.** `CMD_REOPEN = ["เปิดเมนู", "reopen", "open menu"]` in `lib/line-commands.ts`, so it is
**reserved on the day it was written** — a child can never be named it (TASK-245's rule, now paying for itself)
— and `isReopenWord` is separate from `isCancelWord` because they are two intents.

**One `unmute()`, and the ordering is the fix.** The tap un-mutes **before the postback is dispatched**, which
is what makes DEF-8 unreachable *by construction*: there is no state where a flow has been entered and the
answer to its question is still muted. 🚫 No second guard, and the site says why so nobody adds one later and
wonders why it never fires. `action=admin` re-mutes immediately after — correct: that tap is a request for
silence.

🔴 **The thing I did not expect, and it changes how `ยกเลิก` had to be built.** *"Cancel, keep the mute"* is not
just a policy — **`clearSession` would have broken it mechanically.** The mute lives on the session ROW, so
deleting the row to end the flow **un-mutes as a side effect** and drops the bot straight back on top of the
admin who is typing. ⇒ new writer `clearFlowKeepMute()`: it clears the flow **in place** (step → `MUTED`,
`pendingRole` and `draft` explicitly `null`, strikes reset) and never touches `muted_until`. The draft is nulled
by hand precisely because the row that used to carry it away now survives. 📌 *"Two intents, two effects"* had a
second edge under it: **two intents, two storage consequences.**
- Also named the existing `"MUTED"` literal `doCallAdmin` already wrote (`MUTED_STEP`), so *"a row that exists
  only to hold a mute"* is one concept rather than two spellings. `decideMessageRoute` does not recognise it, so
  such a row owns nothing once the mute lapses.

**`เปิดเมนู` answers outside a mute too** (same `doMenu` branch as `เมนู`, un-mute being a no-op there). The mute
message tells a parent the word; a word the bot advertises must mean the same thing an hour later, which is
TASK-245's rule applied to copy instead of a step.

## Implementation Notes — round 2 (the `unmute()` flow-clear)

`tsc --noEmit` **0** · `bun test` **1278 pass / 0 fail** · **no migration** (32 `drizzle/*.sql` = 32 journal
tags, re-counted). New assertions in `src/services/line-mute-exit.test.ts`.

**Done as instructed: one rule, one site, all three doors.** `unmute()` now writes `FLOW_CLEARED`
(`step` → `MUTED` · `pendingRole` · `draft` · strikes) alongside `mutedUntil: null`. `clearFlowKeepMute()` writes
the **same constant** — so *"no flow in progress"* has one definition, and the only difference between the two
functions is the mute itself, which is exactly the difference between the two intents. `mutedUntil: null` still
appears exactly once in the file.

⚠️ **One decision inside your instruction, and it is the only thing I would want you to look at.** `unmute()` is
called on **every** postback, muted or not — so a literal *"unmute clears the flow"* would have discarded the
half-finished registration of a parent who was **never muted** and merely tapped `เช็คอิน` mid-flow. That is a
live, common path, and it is not what *"coming back is a fresh start"* is about. ⇒ the write is scoped to a chat
that is **muted right now**: `and(eq(lineUserId), gt(mutedUntil, new Date()))` — deliberately the same test
`isMuted` applies, so the two cannot disagree about what "muted" means. Your rule holds for all three doors;
what it no longer does is reach a chat that was never away. Say the word if you want it unconditional.

🔴 **The flow-clear introduced an ordering trap, and it is now pinned by a test.** `สมัคร` used to write
`CHOOSE_ROLE` and then un-mute. With the clear added, that order **erases the step it just wrote** and swallows
the parent's `1` — the same silence, one door along. `unmute()` therefore runs **first** in that door, and
`line-mute-exit.test.ts` asserts the order rather than trusting it. 📌 Worth noting as a class: *a function that
gains a side effect changes the meaning of every call site's ORDER*, and only one of the three had an order to
get wrong.

✅ Kept explicitly: TASK-231's *"the handover KEEPS the session"* (asserted as an absence in `strikeOrPrompt` —
no clear there), and 🚫 the shorter-TTL option is **not** taken (asserted: `isSessionExpired` never mentions
mute, so *"is this session live"* keeps one definition).

## Questions
(Jason asks; Sober answers as `> answer: ...`)

**Q1 — 🔴 the one judgement in this task, and it is one line to reverse: `สมัคร` while muted now UN-MUTES.**
`สมัคร` is checked **above** the mute gate (TASK-231: it is the only way in, so silence must never swallow it).
That meant a muted chat was **asked for a role and then ignored the answer** — DEF-8's exact shape through a
second door, live today. Your table lists `เมนู` · `เพิ่มนักเรียน` · free text as silent and does not name
`สมัคร`, so I applied the principle: *a mute never silences the parent's ability to come BACK*, and `สมัคร` is a
deliberate act on a word the bot advertises, not one someone idly reaches for. **Both shipped rules stay true
only if this door un-mutes.** ⇒ Third `unmute()` call site, commented as yours to flip. If you would rather
`สมัคร` be silent while muted, say so and I will move the gate above it — but then TASK-231's *"works from ANY
state"* assertion needs your amendment too, because it is the one that would be reversed.

**Q2 — ⚠️ the edge you asked me to REPORT: yes, un-muting can resurrect a stale step, and here is exactly
when.**
- `getSession` drops a row after **30 minutes of inactivity**; a mute lasts **60**. So un-muting **late**
  (>30 min) is safe: the session is already expired and the parent starts clean.
- Un-muting **early** — a tap or `เปิดเมนู` a few minutes after the handover — leaves the row live, so their
  **next free text lands back in the old step** (e.g. still `AWAIT_STUDENT_BIRTHDATE`) and gets answered by a
  question they may no longer remember asking for. `เปิดเมนู` itself starts nothing (AC-26), so this only shows
  up on the message *after* it.
- 🔴 **And the window cannot be avoided by writing less:** `line_link_sessions.updated_at` carries `$onUpdate`,
  so **any** write to the row refreshes the TTL. The un-mute itself therefore extends the flow's life by another
  30 minutes. That is a property of the column, not of my line.
- **Not a trap** — `ยกเลิก` works, and every prompt advertises it (TASK-245). It is a confusion, not a lock.
- Your call, not mine. The cheapest options if you want it closed: `เปิดเมนู` also clears the flow (it already
  *ends* a state, so ending a forgotten one is arguably the same act), or a shorter TTL for a row that has been
  muted. I have implemented neither.

## Review
(Sober fills this in at REVIEW.)

## Review — Sober, 2026-09-03: ✅ **PASS on the code.** 🔄 One addition, from your own Q2. Both questions answered.

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **1273 pass / 0 fail** · `CMD_REOPEN` / `isReopenWord` at
`line-commands.ts:41,75` · **`mutedUntil: null` appears exactly ONCE** in the service — a stronger assertion than
counting the two paths, and the right one to have reached for.

📌 **`CMD_REOPEN` living in `line-commands.ts` means `เปิดเมนู` was reserved on the day it was written** — a child
can never be named it. TASK-245's single list paying for itself within a day, with nobody having to remember to.

### 🔴 The finding that matters most is the one you did not expect

> *"`clearSession` would have broken it mechanically — the mute lives on the session ROW, so deleting the row to
> end the flow un-mutes as a side effect."*

**My design stated "cancel keeps the mute" as a policy. The existing mechanism made that policy unimplementable**
— and obeying my instruction literally would have **dropped the bot back on top of the admin who is typing**, the
precise thing the mute exists to prevent. `clearFlowKeepMute()` is the right answer, and nulling the draft **by
hand, because the row that used to carry it away now survives**, is the detail that would otherwise have been the
next defect. *"Two intents, two effects"* had a mechanical consequence I did not see.

### ✅ Q1 — `สมัคร` un-mutes. Approved, and your reasoning states my principle better than I did.

You applied the rule to a door I never named, and the alternative is worse: leaving `สมัคร` above the gate
**without** un-muting is DEF-8 through a second door — asked for a role, then ignoring the answer — **live
today**. Moving the gate above it instead would reverse TASK-231's *"`สมัคร` works from ANY state"*, which exists
precisely because it is the only way in.

⇒ **The principle, sharpened, now covering all three doors:**

> **No path may ENTER a flow while muted. A door that can start something either un-mutes, or is silent — never
> both halves.**

**That is what makes DEF-8 unreachable rather than merely fixed**, and it beats my table because it decides the
*fourth* door before anyone builds it. Put it at the un-mute site.

### 🔄 Q2 — the stale step. Close it, and at the un-mute rather than per door.

Your measurement is exactly what I asked for: mute 60 min, TTL 30 min, so an **early** un-mute leaves a live row
and the next free text lands in a step the parent has forgotten. And **`$onUpdate` means the un-mute itself
extends the flow's life** — a property of the column, not of your line.

🔴 **But it is not only `เปิดเมนู`.** A **button** un-mute has the same hole: tapping `นักเรียนของฉัน` renders a
list and starts no flow, so the old step survives and intercepts the next message. Fixing `เปิดเมนู` alone leaves
the identical confusion behind one door — **the shape of half-fix this entire day has been about.**

⇒ **`unmute()` clears any in-flight flow** (step · draft · strikes). One rule, one site, all three doors.
**Why it is right and not merely convenient:** the mute means a human took over. Whatever the parent was half-way
through was superseded by that — **coming back is a fresh start, and the door they chose already tells them what
happens next.**

⚠️ **It does not contradict TASK-231's "keep the session on handover":** the handover still keeps it, so an admin
reads the whole conversation. The clear happens only when **the parent chooses to return** — after the human has
had their turn.
🚫 **Not the shorter-TTL option.** That makes *"is this session live"* depend on mute state — two definitions of
one thing, which is the drift we keep removing.

### The half-met DoD line, correctly named again
The tap-un-mutes-first **ordering** is asserted structurally and the routing of the owner's third message is
proven purely; **the replay needs a muted session row** — @Tanya's. *Mechanism proven, scenario not.* Third time
today that distinction was drawn rather than ticked.

**Status → the code PASSES; the task stays open for the `unmute()` flow-clear above.**


## Review — round 2 — Sober, 2026-09-03: ✅ **PASS. TASK-246 is DONE.**

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **1278 pass / 0 fail** · `FLOW_CLEARED` at
`line-webhook.service.ts:197`, used by **both** writers (`:231` with `mutedUntil: null`, `:249` without) ·
migrations 32 = 32.

📌 **One constant shared by both writers is the right shape:** *"no flow in progress"* has one definition, and
**the only difference between the two functions is the mute — which is exactly the difference between the two
intents.** That is the design saying what it means rather than two similar writes that happen to agree today.

### ✅ The scoping decision — **better than my instruction, and keep it**

> *"`unmute()` is called on every postback, muted or not — so a literal 'unmute clears the flow' would discard
> the half-finished registration of a parent who was never muted and merely tapped `เช็คอิน` mid-flow."*

**I wrote the rule assuming un-mute only happens when muted. It does not.** Taken literally, my own instruction
would have created a **new** version of the defect it was closing: a parent who never left, losing what they had
typed because they touched a button. Scoping it to *muted right now* — **with the same test `isMuted` applies,
so the two cannot disagree** — keeps the rule true for all three doors while it stops reaching a chat that was
never away. Unconditional was my error, not your shortcut.

### 🔴 The ordering trap, and the class is worth more than the case

`สมัคร` wrote `CHOOSE_ROLE` and then un-muted; with the clear added, that order **erased the step it had just
written** and swallowed the parent's `1`. **The same silence, one door along** — and it was introduced *by the
fix*.

> *"A function that gains a side effect changes the meaning of every call site's order."*

**That is the lesson, and it generalises past this repo.** The reason it was caught is the reason worth
recording: **you read all three call sites rather than the diff** — and only one of them had an order to get
wrong. Asserting the order rather than trusting it is what stops it coming back the next time someone reorders
two lines that look independent.

✅ **Both preserved deliberately and asserted as absences:** TASK-231's *"the handover KEEPS the session"* (no
clear in `strikeOrPrompt`), and 🚫 not the shorter-TTL option — `isSessionExpired` never mentions the mute, so
*"is this session live"* keeps one definition.

**Status → DONE (code).** @Tanya has DEF-8's replay and Round C.
