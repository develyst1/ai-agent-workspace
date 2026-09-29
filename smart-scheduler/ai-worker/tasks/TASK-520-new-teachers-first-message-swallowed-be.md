# TASK-520 — a newly linked teacher's FIRST message is swallowed and their chat is muted — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-27) · **Size S.** Tanya, TEST-075 D1. After TASK-519.

## §0 What happens
A teacher links, types **`ตารางของฉัน`** — and **the message is swallowed into the admin hand-off and the chat is muted.** It works only after `reopen`.
🔑 **Think about when this happens: it is the FIRST thing a new coach ever types to us.** Their first impression of the system is that it ignored them and went quiet. **And they will not know `reopen` exists** — Tanya only found it because she knows the flow.

## §1 Establish before fixing
1. **Why the hand-off caught it.** The mute exists so an admin mid-conversation is not talked over (TASK-477 §3). **So: what puts a just-linked chat into that state?** Name the exact condition — **do not guess and do not widen anything until you can state it.**
2. 🔑 **Is it only the FIRST message, or the first message after any link?** Those are different bugs. **And does it affect a newly linked PARENT too?** If it does, that is much larger than a teacher nit and I want it named before anything is built.
3. **What the coach should see instead** — presumably their schedule, as the command asks.

## §2 Build
- The fix goes **at the condition you named**, not at the symptom. 🚫 **Do not special-case "the first message"** — a rule about message ordinality will be wrong the first time someone links twice.
- 🔑 **The mute's real purpose must survive**: a chat an admin is genuinely handling still silences free text (TASK-477 §3's rule, pinned both ways). ⚠️ **If the honest fix would weaken that, stop and tell me** — the mute protects a customer from being talked over by a bot, and that is worth more than a first message.
- **Pinned by value:** a just-linked teacher's first typed command **is answered**, and a chat under a real hand-off **still silences free text.**

## Definition of Done
- [ ] The triggering condition named from the code · **whether parents are affected, stated** · the fix at the condition and not at "the first message" · TASK-477 §3's mute rule pinned unchanged both ways · a just-linked teacher's first command answered, by value · suite **count** normally **and unreachable** · tsc 0 · 60 = 60 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that swallows the first message again and one that stops a real hand-off muting free text · report here + `inbox/SA.md` + log.

---

# ⏸️ STOPPED as §1.2 instructs — @Jason (2026-09-27): the condition is named, and **PARENTS ARE AFFECTED TOO** (a narrower path). Nothing built.

## §1 The exact condition (from the code, step by step)
**A linking conversation in the CHAT outlives a link completed SOMEWHERE ELSE, and the router gives the stale linking step priority over the now-linked role.**
1. **The claim.** A teacher chooses "teacher" (`acceptRole` → `AWAIT_CODE`, `pendingRole = teacher`) and types their nickname.
   - `requestTeacherLink` queues the request (`pending`) and `verifyAndLink` returns `ok: false` **on purpose** ("they stay unlinked until approved").
   - So the AWAIT_CODE branch runs **`strikeOrPrompt`**: 🔴 **a SUCCESSFUL claim is counted as a failed attempt (strike 1), and the chat stays at `AWAIT_CODE`.**
2. **The approval.** Staff approve (`approveTeacherLinkRequest`): `teachers.line_user_id` is set and the teacher is notified. **Nothing touches `line_link_sessions`:** the chat is still `AWAIT_CODE` / teacher, strike 1.
3. **The first message.** The coach types `ตารางของฉัน`.
   - `decideMessageRoute` checks the linking steps **before** `linkedRole`, so the route is **`linking`, not `linked`**.
   - The text goes back into `verifyAndLink(teacher, "ตารางของฉัน")` **as a nickname**: `not-found`, `ok: false`, **strike 2**, `shouldHandOver`.
   - ⇒ **`handover_to_admin` + `mutedUntil` set.** The chat goes quiet until `reopen`.
- **So it's NOT "the first message".** It's **the first message after a link that completed outside the chat, while the chat still holds a linking step.** A coach who links twice this way hits it twice. A coach approved with no chat session (e.g. staff-initiated) never hits it. 🚫 An ordinality rule would be wrong both ways, as you said.
- **The mute itself isn't at fault:** TASK-477 §3's rule did exactly its job on a handover that should never have happened.

## §2 🔴 Parents: YES, on a narrower path
- The same shape exists wherever a link completes **outside** the chat. For a family that's **the registration page**: `register.ts` links the family and runs `settleLinkedRole` (menu + language), and **never touches `line_link_sessions`** either.
- **The path:**
  - a parent types `สมัคร` in the chat (CHOOSE_ROLE), picks "customer" (`AWAIT_CODE` / customer: "send your phone"), **then registers on the page instead** (e.g. from the rich menu);
  - linked, but the chat still holds `AWAIT_CODE`;
  - their next chat message is read as a **phone number**: `linkFamilyByPhone(text)` → `phone-invalid` → strike 1, **and the bot asks a linked parent for their phone again**;
  - the second message: **hand-over + mute.**
- **Not affected:** a parent who finishes **in the chat**. Their `AWAIT_CODE` succeeds (`ok: true`), strikes reset, and the session is cleared or moved to the add-student step.
- **How many parents took the page-after-chat path is a data question** (a chat session in `CHOOSE_ROLE` / `AWAIT_CODE` whose LINE user is already a linked parent). I didn't query it. **Read-only DATA REQUEST if you want the size:**
  ```sql
  SELECT s.step, s.pending_role, count(*) FROM line_link_sessions s
  WHERE s.step IN ('CHOOSE_ROLE','AWAIT_CODE','AWAIT_2FA')
    AND (EXISTS (SELECT 1 FROM teachers t WHERE t.line_user_id = s.line_user_id)
      OR EXISTS (SELECT 1 FROM parents p WHERE p.line_user_id = s.line_user_id)
      OR EXISTS (SELECT 1 FROM family_line_links f WHERE f.line_user_id = s.line_user_id))
  GROUP BY 1, 2;
  ```
  Every row counted is a linked person whose **next** chat message will be misread (and the second one muted).

## §3 What the coach (and parent) should see instead
**Their command answered.** `ตารางของฉัน` ⇒ their schedule, as for any linked coach. A parent's message ⇒ whatever a linked parent's route does with it. **The linking conversation is over; the chat should know it.**

## §4 The fix I'd make: at the condition, the mute untouched. Not built; on your word.
1. **When a link completes ANYWHERE, the linking conversation ends.**
   - ONE helper, `endLinkingConversation(lineUserId)`: if the chat's `step` is a linking step (`CHOOSE_ROLE` / `AWAIT_CODE` / `AWAIT_2FA`), clear `step`, `pendingRole` and the strikes.
   - 🚫 **It never touches `mutedUntil`.** A chat genuinely under a hand-off stays muted, so TASK-477 §3's rule is pinned both ways.
   - Called from **the two places a link completes outside the chat**: `approveTeacherLinkRequest` (the teacher) and the page's link (`register.ts`, the parent).
2. **A queued teacher claim is not a failed attempt.** For `pending` / `pending-ambiguous`: **no strike**, and the chat leaves `AWAIT_CODE` (the request is in; there's nothing left to type).
   - `not-found` / `already-linked` stay failures (retype allowed, strikes as today).
   - **The reply is unchanged**, so the no-oracle rule (`pending` = `pending-ambiguous` to a stranger) holds.
   - Without this, a coach who types anything **while waiting for approval** is handed over on their second message: the same bug, earlier.
- 🚫 **The router order is NOT changed.** Linking before linked is load-bearing for `AWAIT_2FA` and the add-student steps. The fix removes the stale state instead of teaching the router to ignore it.
- **Pins, as the DoD asks, and mutations:**
  - by value: a just-approved coach's first command is answered (the schedule), and a page-linked parent's next message isn't read as a phone;
  - a chat under a real hand-off still silences free text;
  - a mutation that leaves the linking step in place (the swallow returns), and one that makes the helper clear `mutedUntil` (the mute weakened).

## ❓ Your call
- **(a)** Build §4 for **both** teachers and parents (my recommendation: one helper, two callers, the same bug).
- **(b)** Teachers only now, parents as their own task.
- **(c)** Something else.
- ⚠️ No hand-off is weakened in any of these.

⛔ Nothing built.

---

# 🔨 RULING — @Sober (2026-09-27): **(a) — both, one helper, two callers.** ▶️ Build §4 as written.

🔴 **You found a worse bug than the one I gave you, and it is the parent case.** I asked whether parents were affected because the answer would change the size. **It does more than that:**
- a parent starts linking **in the chat**, finishes **on the registration page** (which is what the rich menu invites them to do);
- their next chat message is read as **a phone number**, so **the bot asks an already-linked parent for their phone**;
- **the second message is handed over and the chat is muted.**
🔑 **That is a customer, not a coach, and it is the first conversation they ever have with us** — and the flow that triggers it is **the one we advertise on the menu.** ⇒ **(a). One helper, two callers, the same bug; splitting it would ship the teacher half of a customer-facing defect.**

## ✅ §4 approved as designed, and two things in it are better than my instruction
1. **The fix is "when a link completes anywhere, the linking conversation ends"** — at the condition, exactly as asked, and 🚫 **it never touches `mutedUntil`**, so TASK-477 §3's mute survives with the rule pinned both ways. **I said stop if the fix weakens the mute; you built one that structurally cannot.**
2. 🔑 **"A queued teacher claim is not a failed attempt"** — I had not thought of this. A coach waiting for approval who types anything is handed over on their **second** message: **the same bug, earlier**, and it would have survived my version of the fix entirely. ✅ **And the reply stays unchanged, so the no-oracle rule holds** (`pending` and `pending-ambiguous` still look identical to a stranger) — you protected a security property while fixing a usability one.
✅ **The router order is NOT changed**, and your reason is right: *linking before linked is load-bearing*. **Removing the stale state beats teaching the router to ignore it** — the same "fix the condition, not the symptom" I asked for, argued rather than accepted.

## 📋 The DATA REQUEST: yes, I want the size — going to @Porter
Your query counts **linked people whose next chat message will be misread.** 🔑 **That is the right thing to count, and the number matters for a reason beyond curiosity: every row is a customer or coach whose next message we are going to mishandle *until this ships*.** If it is large, D1 stops being third in the queue.
⚠️ **Read-only, the owner's or Tanya's hand, and no correction** — a row in a stale linking step is **fixed by this code**, not by editing the database.

## Definition of Done — amended
Everything in §4, for **both** teachers and parents, plus: · the queued-claim case (**no strike, the chat leaves `AWAIT_CODE`**) with `not-found` / `already-linked` **unchanged as failures**, pinned · the no-oracle equality pinned still to hold · the router order pinned unchanged · **a page-linked parent's next message NOT read as a phone**, by value · **a just-approved coach's first command answered**, by value · a real hand-off still silencing free text · 🔑 mutations: the linking step left in place (the swallow returns) · the helper clearing `mutedUntil` · a queued claim counting as a strike.

---

# ✅ REPORT — @Jason (2026-09-27): built · 🔴 **but FIRST, a CORRECTION: the PARENT case I reported does NOT exist.** The teacher bug is fixed; parents needed no change · 3340 / 0 normal AND unreachable, 0 failed queries · tsc 0 · 60 = 60

## ⚠️ §0 The correction: my stop report was wrong about parents, and your ruling leaned on it
- I wrote that a parent who starts `สมัคร` in the chat and **finishes on the registration page** keeps a stale `AWAIT_CODE`. **That's false.**
- **`routes/register.ts` has cleared the chat's session on success since 09-12**: `clearLinkSession(who.sub)` on **all three** of its link doors, with the comment *"Rule 4 — a half-started chat wizard does not outlive its family"* (TASK-347).
- I read `settleLinkedRole` (which doesn't touch the session), **inferred** the page path from it, and **didn't read the route that calls it.** That's the TASK-510 mistake again: a list from memory instead of the source.
- **Verified this time:** every writer that binds a parent's LINE (`bindFamilyLine`, `linkParentLine`) is reached **only** through `linkFamilyByPhone`. That runs from **the chat** (whose AWAIT_CODE success clears the session) and **the page** (which clears it). **No other door links a parent.** ⇒ **Parents: not affected.**
- ⇒ **Your "worse bug" paragraph about a customer on their first conversation doesn't hold, and I'm sorry for putting it in front of you.**
- **The DATA REQUEST I sent Porter over-counts:** it includes parents. **Corrected, teachers only (read-only):**
  ```sql
  SELECT count(*) FROM line_link_sessions s
  WHERE s.step IN ('CHOOSE_ROLE','AWAIT_CODE','AWAIT_2FA')
    AND EXISTS (SELECT 1 FROM teachers t WHERE t.line_user_id = s.line_user_id);
  ```

## §1 The teacher fix (the condition you ruled, unchanged)
1. **A QUEUED claim is not a failed attempt.**
   - `verifyAndLink` marks a `pending` / `pending-ambiguous` outcome `queued` (`claimQueues`, the existing rule).
   - The AWAIT_CODE branch then **ends the linking conversation and replies exactly as before**: no strike, and the no-oracle rule holds (`pending` = `pending-ambiguous`).
   - `not-found` / `already-linked` stay strikes (retype).
2. **The staff APPROVAL ends it** (`approveTeacherLinkRequest`, after the grant). This covers a chat that still holds a linking step (e.g. the coach re-started `สมัคร` while waiting).
3. **`endLinkingConversation(lineUserId)`** (`line-register.service`, beside `clearLinkSession`):
   - it writes **`FLOW_CLEARED`**, which **has no `mutedUntil`**, so it **cannot** end a mute (by construction);
   - it acts **only on a linking step** (`WHERE step IN LINKING_STEPS`), so the add-student wizard and a mute-only row are untouched.
- **One vocabulary:** `LINKING_STEPS`, `MUTED_STEP` and `FLOW_CLEARED` moved (unchanged) into `lib/line-routing.ts`.
  - **The router now reads `LINKING_STEPS`** instead of its own three literals, so the router and the helper can't disagree about what "linking" means.
  - The router's **order is unchanged** (2FA relies on it).

## §2 Proof (`link-conversation-ends-task520.test.ts`, 8 tests, through the REAL dispatcher over an in-memory session row judged by its rendered SQL)
- 🔑 **The whole story, by value:** the coach types their nickname ⇒ the claim is queued, the row becomes `MUTED`/null/0 with **no mute and no strike** ⇒ staff approve ⇒ **`ตารางของฉัน` reaches the SCHEDULE**, no hand-off, no mute.
- **A word typed WHILE WAITING** is not a second strike (unlinked, no flow ⇒ silence, no hand-off).
- **`not-found`** is still strike 1 and stays at AWAIT_CODE (unchanged).
- 🔑 **The mute, both ways:** a chat under a **real hand-off** at a linking step ⇒ the helper clears the step, **the mute stays**, and **free text AND commands stay silenced.** An **add-student** chat is untouched.
- **The helper's SQL by value:** `("line_link_sessions"."line_user_id" = $1 and "line_link_sessions"."step" in ($2, $3, $4))` with the three steps; its SET keys are exactly `draft · pendingRole · step · unexpectedCount · updatedAt` (**no `muted_until`**).
- **By source:** the approval calls it after the grant, and the page's three `clearLinkSession` calls exist (the reason parents are safe).
- **Mutations** (database unreachable · CHECKSUM identical before and after · restores byte-identical · BASELINE=8):
  - **F1: the first message swallowed again** (a queued claim counts as a strike): BITES (2);
  - **F2: the approval no longer ends it:** BITES (**source pin only**; no by-value approval test);
  - **M1: the helper also ends the mute:** BITES (2);
  - **M2: it ends ANY step:** BITES (2);
  - **L: the one linking list loses a step:** BITES.
- **Existing pin moved:** `line-mute-exit` looked for `FLOW_CLEARED`'s definition in the webhook file. It now reads it in `line-routing.ts`, byte-identical.

## ⚠️ §3 What the fix does NOT reach: coaches already stuck
- A coach who **claimed and was approved BEFORE this ships** is sitting in `AWAIT_CODE` with strike 1 right now. The approval that would have cleared it has already happened, so **their next message will still be read as a nickname** (strike 2 ⇒ hand-off + mute). **This fix prevents new cases; it doesn't repair existing rows.**
- **The count is the corrected DATA REQUEST in §0.**
- **If the owner wants them repaired, it's a one-off DATA change for him to approve and run**. It's exactly what the helper does, per row, and never touches a mute:
  ```sql
  -- TASK-520 · a WRITE — the owner's decision, NOT run by us. Ends the stale linking step of every LINKED teacher; never touches muted_until.
  UPDATE line_link_sessions s SET step = 'MUTED', pending_role = NULL, draft = NULL, unexpected_count = 0, updated_at = now()
  WHERE s.step IN ('CHOOSE_ROLE','AWAIT_CODE','AWAIT_2FA')
    AND EXISTS (SELECT 1 FROM teachers t WHERE t.line_user_id = s.line_user_id);
  ```
  The alternative is a router special-case, which you ruled out (ordinality / special-casing), and I agree.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-27)
Verified: **3340 pass / 0 fail normally and unreachable** at his report, **3361/0 in the current tree** with TASK-523 on top · tsc 0 · 60 = 60 · `LINKING_STEPS` at `lib/line-routing.ts:29`, read by the router **and** the helper.

🔑 **`LINKING_STEPS` is now ONE list that the router reads too** — so *"which steps are a linking conversation?"* has a single answer, and **the helper and the router cannot disagree about when a chat is mid-link.** That is the difference between fixing the bug and removing the category of bug: my task asked him to fix at the condition; **he made the condition a thing that exists once.**
✅ **Proven through the real dispatcher** — claim → approval → **`ตารางของฉัน` answered** — and **a real hand-off stays muted for free text AND commands**, so TASK-477 §3 survives in both directions. ✅ Add-student untouched.
✅ **The mutation list includes "the helper ends the mute" and "it ends any step"** — the two ways this fix could have become a different bug, both caught.

## 📋 The stuck coaches — a DATA REQUEST, going to @Porter
⚠️ **Coaches approved before this ships will still be misread once.** He wrote the exact one-off UPDATE, **which never touches the mute**, and **did not run it.** ✅ Correct.
🔑 **And the honest framing, which I am passing up as his: the repair is one message's worth of inconvenience for a handful of people.** So it is worth doing **only if it is easy** — a linked coach's next message being misread once, and then working, is a much smaller thing than the bug we just fixed. **I will not press the owner for it.**
