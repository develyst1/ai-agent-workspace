# TASK-489 — DUO: one suspended household must not turn away the OTHER family's child — BE, S. **📐 Contract before code.**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · Round item 2, **owner ruling 3** (REQ-108, 09-25): *"refuse only the suspended family. The other child CAN check in."* Changes what shipped in TASK-475/476.

## §0 What happens today
`checkinByToken` (`checkin.service.ts:89`) and the camp path both ask **`anyHouseholdSuspended(duoStudentIds(row))`** — *is **any** household on this row suspended?* — and refuse the whole check-in.
⇒ On a DUO session, **a suspended family next door turns away a child whose own family owes nothing.** That is the defect the owner ruled on.

## §1 🔴 Read this before designing: the model does not have the shape the ruling assumes
**DUO is ONE booking row with TWO children** (`duo-course.ts`: `courseKindOf` is derived from `co_student_id`; there is **no per-child attendance and no per-child credit on the row**). So *"refuse only the suspended family"* **cannot mean "check in one child and not the other"** — there is no such state to write, and inventing one is a model change nobody has asked for.
🔑 **My reading of the ruling, and what I want you to build: the guard is asking the wrong QUESTION, not applying the wrong rule.** It should ask **"is the household making this request suspended?"**, not *"is anybody on this row suspended?"* The requester is identifiable on every door: the wall QR knows the phone that was typed, the LINE path knows the account, the token page knows whose token it is.
⇒ **A suspended family is still refused, exactly as today. A family in good standing is no longer refused for their neighbour's debt.**

## §2 ⚠️ The consequence I want stated, not smoothed over
Because the class is **one shared hour with one coach**, the suspended family's child **is in the room** whenever the other family checks in. The session will read ATTENDED, and the course's units move as they do today.
📌 **So this ruling does not withhold the class from a suspended family on a DUO — it stops us withholding it from the innocent one.** That is a real change in what suspension achieves for DUO courses, it follows from the model rather than from a choice we are making, and **the owner should be told in one sentence rather than discovering it.** I am sending that up; you do not need to wait for it.
🚫 **Do not try to solve it in code** — half a class cannot be delivered, and any attempt (skipping the credit, marking a partial attendance) is a new model and a new argument with a parent.

## §3 📐 Contract first — five things to establish before any code
Send me these as a contract, as you did for TASK-486; **no code until I rule.**
1. **Every caller of `anyHouseholdSuspended`** — and for each one, **whether the requester's identity is available at that point.** 🔑 If any caller cannot know who is asking, say so: that one keeps today's behaviour and I want to see the list, not a guess.
2. **Whether `duoStudentIds` is used anywhere ELSE as an "everybody on this row" question** that has the same bug wearing different clothes. (TASK-487's lesson: the second instance of a wrong answer is likelier than a fourth different answer.)
3. **What the shop-front lookup already does** — it lists only check-in-able children, and TASK-478 refuses a suspended household **as one of its four indistinguishable "nothing" cases**. Say whether that door needs changing at all, or whether it already asks the right question. **Two doors with two answers is what we have been fixing all week.**
4. **The non-DUO path must not move.** A single-child session where that child's household is suspended is refused exactly as today — name the pin.
5. **Camp:** the same question, the same answer, or a reason why not.

## §4 Then build
- The guard asks about **the requesting household**; a suspended requester is refused with **today's words** (`suspended_notice`) and **still first, before "already"**, so nothing about the family comes back (REQ-019 / TASK-048 — do not weaken that ordering).
- 🔑 **By value:** a DUO row where **household B is suspended** ⇒ **A checks in successfully**, B is refused with the same sentence as today · a DUO row where **A's own household is suspended** ⇒ A refused · a **non-DUO** suspended household ⇒ refused, unchanged · **no data about either family in any refusal.**
- 🚫 No change to what a check-in consumes, to any message's wording, or to the four-indistinguishable-nothings rule on the shop front.

## Definition of Done
- [ ] §3's contract answered and ruled first · the guard asking about the requester, per caller, with any caller that cannot know **named and left alone** · the four by-value cases · the refusal still FIRST and still data-free · camp stated · the non-DUO pin named · suite **count** · tsc 0 · 58 = 58 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation restoring "any household on the row" and one that lets a suspended requester through · report here + `inbox/SA.md` + log.

---

# 📐 CONTRACT — @Jason → @Sober (2026-09-26) — §3 answered. **No code written.** One premise does not hold: the public token page CANNOT know who is asking.

## ⚠️ First: the premise that does not hold
§1 says *"the token page knows whose token it is."* **It does not.** A session's check-in token lives on the **booking row** (`bookings.checkin_token`, one per row). A DUO row therefore has **ONE token, shared by both families**. It reaches people three ways: the LINE `qr` action (either parent can ask for it, and both get the same link), the staff screen (`GET /api/bookings/:id/checkin`), and the QR the desk shows. `POST /checkin { token }` has no JWT, no LINE id and no phone. **At that door, the requester is unknown.**
- To make it knowable, we would need a per-family token (a new column or a new table, plus minting). That is a model change nobody has asked for, so I have not designed one.

## §3.1 Every caller of `anyHouseholdSuspended`, and whether the requester is known there
There are exactly **two** callers in production (`src`, not tests).

| # | Caller | Reached from (door) | Requester known? | Already guarded on the requester BEFORE the act? |
|---|---|---|---|---|
| 1a | `checkinByToken` (`checkin.service.ts:89`) | **LINE** `doCheckinBooking` (`line-webhook.service.ts:929`, source `line`) | ✅ **yes**, the LINE account → its parent | ✅ **yes.** `isSuspendedLineParent(lineUserId)` refuses every postback at `:1570` and every typed command at `:1351`, with the same `suspended_notice`. A suspended LINE parent never reaches the act. The act's any-row guard only ever **adds** refusals of an innocent family. |
| 1b | `checkinByToken` | **Shop-front** `shopfrontCheckin` (`shopfront-checkin.service.ts:91`, source `shopfront-qr`) | ✅ **yes**, the phone → its parent | ✅ **yes.** A suspended phone's lookup is the empty list, so the act is never reached (NOT_CHECKINABLE). Same situation as 1a. |
| 1c | `checkinByToken` | **Public token page** `POST /checkin` (`routes/checkin.ts:34`, source `checkin-qr`) | 🔴 **NO**, the token is the row's, not a family's | ❌ This guard is the ONLY one on this door. |
| 2a | `checkinCampByToken` (`camp.service.ts:445`) | **Public camp page** `POST /checkin/camp` (`routes/checkin.ts:35`) | 🔴 no, **but it does not matter**: see §3.5 | ❌ This guard is the only one. |
| 2b | `checkinCampByToken` | **Shop-front** (`shopfront-checkin.service.ts:95`) | ✅ the phone | ✅ the lookup filters, as in 1b |

**The one caller that cannot know who is asking: 1c, the public `/checkin` token page.** By your rule it keeps today's behaviour. You need to see what that means, because it is the door-B problem again:
- 🔴 **On a DUO row where B is suspended, family A is refused at `/checkin`** but succeeds on LINE and at the wall QR. Same family, same class, two answers.
- 🔴 **The refusal is also a data leak and a false statement.** `suspended_notice` = *"บัญชีถูกระงับ — ติดต่อเจ้าหน้าที่ / This account is suspended — please contact staff"*. Family A is told that **their** account is suspended, which is untrue, and it tells them something about family B's account. §4's "no data about either family in any refusal" cannot hold at this door while the guard asks about the row.
- **The honest options for 1c. I need your ruling; I'm not choosing.**
  - **(i) Keep today's rule ("any household on the row").** This is literally what §3.1 says. It keeps both costs above, and the ruling is not delivered on this door.
  - **(ii) On a DUO row, refuse only when EVERY household on the row is suspended; a single-household row is unchanged.** The ruling is delivered, and nothing false or foreign is said to A. **The cost:** a suspended B who scans the desk QR, or kept an old link, checks the shared row in. Per your §2 that changes nothing real: B's child is in the room whenever A checks in, and the row reads ATTENDED either way. But a suspended requester is then not "refused, exactly as today" on this one door. I'd name that in the owner sentence.
  - **(iii) A per-family token.** This is a model change, so I'm listing it only so it is not forgotten.
  - **My recommendation is (ii).** On this door the only question the code can answer is "is anyone on this row allowed to be here?", and (ii) asks exactly that. Yours to rule.

## §3.2 `duoStudentIds` as an "everybody on this row" question elsewhere
Four call sites. **None repeats the suspension bug.** One is a consequence you should see.
- `checkin.service.ts:89` is **the bug itself** (the guard).
- `checkin.service.ts:122` awards **ON_TIME_CHECKIN CRM points to both children** (TASK-420). This is not a suspension question and it is correct for "both kids were in the class". ⚠️ **But after this fix, a suspended family's child EARNS points when the other family checks in.** Nothing awards points on suspension anywhere today (no guard exists on `awardCrmPoints`). It follows from §2, so I'd add it to the owner sentence rather than code around it. I'll leave it untouched unless you rule otherwise.
- `scheduler.service.ts:3793` gives PROPER_SICK_LEAVE points to both children on a DUO leave. That is a leave, not a suspension, so it is correct.
- `som-report.service.ts:73` is the report counting a DUO row for both children. That is correct.
- **Related, different shape, NOT changed (named only):** the suspension gate on NEW bookings, `insertBooking` (`scheduler.service.ts:1256`), checks **only the primary `studentId`**. The DUO **course sale** checks **both** (`:2165` co-student, `:2170` primary). So "can a DUO row be created when the co-student's household is suspended?" gets two answers (sale: no; a single session insert: yes). That is REQ-019's *booking* rule, not ruling 3's *check-in* rule, so it is out of this task. I'm flagging it for its own ticket if you want one.

## §3.3 The shop-front: does it already ask the right question?
**The lookup does; the act underneath it does not. So today it is ONE door with two answers.**
- `shopfrontLookup` asks about the **phone's own household** (`usable = parent && !isSuspended(parent.suspendedAt)`), and a suspended phone gets the indistinguishable empty list. ✅ That is the ruling's question already.
- Family A's phone **is offered** the DUO row (`familyRowsWhere` matches A as co-student or primary). When A taps it, `shopfrontCheckin` → `checkinByToken` → the any-row guard → **400 `suspended_notice`**. The nanny at the wall is told "this account is suspended": offered, then refused, with a foreign fact in the refusal.
- **After the fix, the lookup is untouched.** Its four indistinguishable nothings are unchanged and so is the rate limit. Only the act stops asking about the neighbour.

## §3.4 The non-DUO pin (must not move)
`token-page-suspended-req019.test.ts`:
- **"suspended ⇒ 400 with the LINE path's own words, and NO attend"** (a single-child row, its household suspended, via `/checkin`);
- **"suspended and already ATTENDED ⇒ still refused — no booking, no remaining handed back"** (the FIRST-before-already ordering);
- **"a walk-in with no parent is never blocked"**.

All three stay byte-for-byte. I'll add the same single-child refusal through **LINE** and the **shop-front** as by-value pins. There, the requester's own guard is what refuses: at the bot boundary, and as the empty list.
- ⚠️ **One existing pin CHANGES by design:** *"a DUO row: the CO-student's household suspended ⇒ refused (either family refuses the row)"*. Under (i) it stays; under (ii) it inverts to "A checks in". I'll wait for your ruling before touching it.

## §3.5 Camp: the same question, the same answer, NO change
A camp package has **one** student (`camp_packages.student_id`; camp has no co-student and no DUO). So "any household on the row" and "the requester's household" are the **same single household**, and the guard at `camp.service.ts:445` already asks the ruling's question. The camp shop-front's lookup filters too (2b). **No camp change.** The pin stays: `token-page-suspended-req019` › *"/checkin/camp — suspended ⇒ 400 with the same words, and the day is NOT marked"*.

## The build I'd do once you rule (the shape, not code)
- `checkinByToken(token, source, asker?)`. The two doors that know the requester (LINE, shop-front) pass it; they have already refused a suspended requester. The act then **does not ask about the row** for them.
- The token page passes nothing and gets **your ruling for 1c**: (i) the row's "any", or (ii) the row's "every" on a DUO row.
- The refusal stays FIRST (before "already"), with the same words.
- The four by-value cases from §4, per door. Mutations: (a) restore the "any household on the row" guard for a known asker, which must bite on the DUO-B-suspended case; (b) let a suspended requester through, which must bite on LINE, the shop-front and the non-DUO token page; plus `BASELINE=`, `finally` and CHECKSUM as usual.

⛔ **Stopped. No code until you rule on: 1c (i / ii / iii), the CRM-points line (§3.2), and whether the `insertBooking` primary-only gate gets its own ticket.**

---

# 🔨 RULING — @Sober (2026-09-26). **(ii) · CRM points left alone · `insertBooking` gets its own ticket.** ▶️ Build.

**📌 First: my §1 was wrong and you were right to open with it.** I wrote *"the token page knows whose token it is"* — it does not. **The token is the ROW's, and a DUO row has ONE token shared by both families.** I asserted an identity that does not exist, and the whole §1 design rested on it. **You checked a premise instead of building on it**, which is the third time this week that the useful move was to go and look. 🔑 **A premise in my task is a claim, not a specification** — treat it the way you treated this one.

## 1c — 🔨 **(ii): on a DUO row, refuse only when EVERY household is suspended.** A single-household row is unchanged.
**(i) is not tenable, and the reason is not the ruling — it is that (i) makes us lie.** `suspended_notice` tells family A *"your account is suspended"*. On a DUO row where only B is suspended that is **false about A and a disclosure about B**, said to a nanny standing at a counter. We do not get to keep a refusal that is untrue about the person reading it.
**(ii) is what the door can actually answer.** With no requester, the only honest question at `/checkin` is *"is anyone on this row allowed to be here?"*, and (ii) asks exactly that. It also ends the door-B split you found: A gets the same answer on LINE, at the wall QR and on the token page.
**Its cost, accepted with eyes open:** a suspended B with the desk QR or an old link can check the shared row in. **Per §2 that changes nothing real** — the class is one shared hour, B's child is in the room whenever A checks in, and the row reads ATTENDED either way. ⚠️ **But it is a real narrowing of what suspension does at that one door, and it goes in the owner sentence, in his words, not buried here.**
🚫 **(iii) stays unbuilt.** A per-family token is a model change to deliver a guarantee we do not actually have (the class is shared), and it would be a large piece of work bought with an argument we would then have to keep having.
**The pin that inverts** (*"the CO-student's household suspended ⇒ refused"*) is **moved, with the reason written in.** It pinned the defect; it should read as (ii) now.

## §3.2 CRM points — ✅ **leave them. Name them; do not code around them.**
After this fix a suspended family's child **earns ON_TIME_CHECKIN points** when the other family checks in. You are right that nothing anywhere withholds points on suspension, and inventing that rule inside a check-in guard would be **a policy nobody asked for, written in the least visible place possible.** It goes in the owner sentence as a consequence. If he wants points withheld from suspended families, that is its own rule across every award site.

## §3.3 / §3.4 / §3.5 — ✅ all three accepted as written
The shop-front lookup already asks the right question and only the act was wrong — **"one door with two answers"** is the right description, and it is exactly the class of thing we have spent the week closing. The three non-DUO pins stay byte-for-byte; adding the single-child refusal through LINE and the shop-front as by-value pins is a real improvement over trusting that the bot boundary covers it. ✅ **Camp: no change, and the reasoning is sound** — one package, one student, so the two questions are the same question.

## `insertBooking` — ✅ **its own ticket, next round, and thank you for not folding it in**
**The DUO course SALE checks both households; a single session INSERT checks only the primary.** Two answers to "may this child be booked while their household is suspended?" That is REQ-019's booking rule, not ruling 3's check-in rule, and **keeping it out of a task about check-in was the right call** — it is a different question with a different owner decision behind it. 📌 It is also the same **shape** as everything else this round: one rule, two readers, and the older reader predates the newer fact.

## Definition of Done — amended
Everything in §4, with 1c built as **(ii)**, plus: · the inverted pin **moved with its reason** · the CRM-points consequence **named in the report**, code untouched · the single-child refusal pinned through LINE and the shop-front as well as the token page · 🔑 a mutation that makes (ii) refuse a DUO row when only ONE household is suspended (i.e. (i) restored) must bite, and one that lets a suspended requester through on LINE / shop-front / a non-DUO token page must bite.

---

# ✅ REPORT — @Jason → @Sober (2026-09-26) — (ii) built: a DUO row is refused only when EVERY household on it is suspended. 3181 pass / 0 fail · tsc 0 · 58 = 58 · 5/5 mutations bite

**Numbers:** `bun test` **3181 pass / 0 fail** (+13 over 3168: the new file) · `tsc` **0** · **58 = 58** migration files (none added).

## The change (two production lines of logic, one helper)
- **`everyHouseholdSuspended(studentIds)`** is new in `parent.service.ts`, beside `anyHouseholdSuspended` and built from the **same** `blockedBySuspension(findParentOfStudent(id))`. It returns true only when every child's household is suspended. An empty list is false, and a walk-in (no parent) is never blocked, so a walk-in on the row lets it through.
  - A single-child row gives every = any, so **the non-DUO path is unchanged by construction**, and pinned.
- **`checkinByToken`** (`checkin.service.ts`) asks `everyHouseholdSuspended(duoStudentIds(row))` instead of `any…`.
  - It is still **FIRST**, before "already", and still uses today's words (`suspended_notice`).
  - The comment carries your reasoning and the accepted cost: a suspended family holding the shared link can check the shared hour in.
- **I added no `asker` parameter.** Once the row question is "every", the doors that know the requester need nothing more. LINE's postback boundary (`isSuspendedLineParent`) and the shop front's lookup (the empty list) already refuse a suspended requester before the act, and the act no longer refuses the innocent one. A parameter nobody reads would be dead code.
- **Camp is untouched** (`checkinCampByToken` keeps `anyHouseholdSuspended` on its one child, where any = every). **The shop-front lookup is untouched**, including its four indistinguishable nothings and the rate limit.

## The by-value pins — `src/services/duo-suspension-req108.test.ts` (13 tests, through the REAL `checkinByToken`)
**Token page `/checkin`:**
- DUO, only B (co-student) suspended ⇒ **200, attended**.
- The same with B as the **primary** ⇒ 200 (which seat B sits in doesn't matter).
- DUO, **both** suspended ⇒ **400 `suspended_notice`, no attend**. The error body is exactly `{code, message}`, with **no id, name, booking or remaining** from either family.
- Both suspended and already ATTENDED ⇒ **still refused FIRST**, with nothing handed back.
- A walk-in plus a suspended family ⇒ 200.
- **Non-DUO pin:** a single child whose household is suspended ⇒ refused, no attend.

**LINE:**
- A asks, only B suspended ⇒ **attended, and no reply mentions a suspended account**.
- B asks, B suspended ⇒ `suspended_notice` alone, **no attend**. This is the requester's own guard; the act never runs.
- **Non-DUO pin through LINE:** a single child, the requester suspended ⇒ refused, no attend.

**Shop front:**
- A's phone, only B suspended ⇒ **the lookup offers the DUO class AND the act checks it in**. One door, one answer; before this fix it was offered, then refused.
- B's phone (suspended) ⇒ `{ children: [] }` and NOT_CHECKINABLE, no attend.
- **Non-DUO pin at the wall:** the phone's household suspended ⇒ NOT_CHECKINABLE, no attend.

## Moved pins (with the reason written in)
- `token-page-suspended-req019` › **"a DUO row: the CO-student's household suspended ⇒ refused (either family refuses the row)"** is now **"only the CO-student's household suspended ⇒ checked in (TASK-489 (ii); both suspended ⇒ refused)"**, 400 ⇒ 200. The comment says it pinned the defect: a refusal false about A and a disclosure about B.
- The same file's **source pin** now pins both loops (`any`, `every`), pins that the session page calls `everyHouseholdSuspended` and **no longer calls `anyHouseholdSuspended`**, and pins the FIRST ordering against the new name. Camp's half of that pin is unchanged.
- **The three non-DUO pins** ("suspended ⇒ 400 … NO attend", "suspended and already ATTENDED ⇒ still refused", the walk-in carve-out) and **camp's pin**: **byte-for-byte unchanged, and passing.**

## ⚠️ Named, not coded (your ruling): the CRM points
After this fix a **suspended family's child earns the ON_TIME_CHECKIN points** when the other family checks the shared row in (`checkin.service.ts` awards per `duoStudentIds`, unchanged).
- **It is pinned by value, so it is visible, not buried:** "⚠️ the named consequence: both children get the on-time points, B's included". If the owner rules that suspended families earn nothing, that pin fails on purpose and points at every award site.

## Break-and-watch: `mut489.mjs`, 5 mutations, **5 bite**
`BASELINE=51` (the four files: the new one, token-page, shop-front, no-token), read off a real run. `finally` + sha-256 restore, byte-identical every time. **CHECKSUM `8d3c0984…` identical before and after.**
- **A — (i) restored** (`every` → `any`): **bites, 8 fail**. B's suspension turns A away again on every door.
- **B — a suspended requester through on LINE** (the postback boundary off): **bites, 1 fail** (B asks, B suspended). The single-child case is still refused by the act, which is the defence in depth working.
- **C — a suspended requester through at the shop front** (the lookup stops asking): **bites, 3 fail**.
- **D — a suspended single-child row through on the token page** (the guard never refuses): **bites, 5 fail**.
- **E — the refusal moved after "already"**: **bites, 3 fail** (by value and by source).

## For the owner sentence (Porter's, via you)
On a DUO class, a suspended family is no longer able to stop the other family checking in. Because the class is one shared hour:
1. the suspended family's child is in the room, and the session reads ATTENDED;
2. that child also earns the on-time points;
3. if the suspended family holds the class link (the desk QR, or an old LINE link), they can check the shared class in themselves.

A single-child class is refused exactly as before.

📌 `insertBooking`'s primary-only suspension gate is **untouched**; it is your next-round ticket.
⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26)
Re-run by me, twice: **3181 pass / 0 fail** both times · tsc 0 · 58 = 58 · the guard read by me at `parent.service.ts:615` and `checkin.service.ts:93`.

🔑 **The line I want to point at is the first one in the new function:** `if (!studentIds.length) return false;`
**`every` over an empty list is vacuously TRUE.** Without that guard, swapping `any` for `every` would have turned *"a walk-in with no parent is never blocked"* into **"a walk-in is always blocked"** — the carve-out for the most defenceless case in the whole flow, reversed by the semantics of the word rather than by anyone's intent. It is pinned, and the pin was already there to catch it. 📌 **Recorded as a rule: replacing `any` with `every` (or the reverse) changes the empty case, and the empty case is usually the one nobody wrote a fixture for.**

✅ **No `asker` parameter — and refusing to add one was right.** My contract sketch had `checkinByToken(token, source, asker?)`; he established that **both doors that know the requester already refuse a suspended one before the act**, so the parameter would have been read by nobody. **A parameter that exists to express an intention, rather than to be used, is a comment that lies later.** He said so plainly instead of implementing my sketch.

✅ **The CRM-points consequence is pinned BY VALUE ("B's points are included"), with the code untouched** — so if the owner rules the other way **that pin fails on purpose** and points us straight at the decision. That is the right way to record a consequence we chose not to act on: not a comment, not a TODO, but **a test that will object the moment the policy changes.**

✅ The inverted pin moved with its reason written in; the three non-DUO pins and camp's pin byte-for-byte; the refusal still FIRST with a data-free body, on all three doors.
