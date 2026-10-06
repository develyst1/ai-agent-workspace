# TASK-657 — BE: **the Undo gives a week back only if it is empty · the self-block · the chain refusal names the steps · the admin is flagged when a make-up lands past the expiry** — @Jason, Fri
**From @Sober to @Jason.** ⚖️ **REQ-112 rulings 2 + 3 (IN FORCE, `REQ-112 §⚖️ 2026-10-06`) · REQ-114 (i) + (ii) (`ANALYSIS-REQ-114-undo-chain-2026-10-05.md`).** 🚫 **NOT REQ-114 (iii)** — the one-click chain undo is NEXT week; do not start it.
✅ **Claim (Team A):** `src/services/undo.service.ts` · `src/lib/booking-undo.ts` · the make-up append in `reconcileCoursePlan` (`scheduler.service.ts`, for §3 only — the place `TASK-656` removed the stretch) · `src/lib/line-message.ts` + `src/lib/line-i18n.ts` (the ONE new admin notice) · co-located tests.
🔴 **SHIP-SET with `TASK-656` + `TASK-658` — sid batch #2, together or not at all.** **Built ON `TASK-656`: start when Jason's 656 is in the tree.**

---

## 1. 🔴 Ruling 2 — the Undo gives the week back ONLY IF that week is still EMPTY (replaces `expiryDecision`'s old reasoning) — absorbs REQ-114 (ii)
**Today's rule (`booking-undo.ts` `expiryDecision`) is built on "the system stretched the expiry to the make-up's date" — which `TASK-656` removes.** ⇒ **Rewrite it to the new rule:**
- **Undoing a leave ⇒ the course loses ONE week (expiry − 7 days) — ONLY IF no class of the course (any LIVE row, any status that holds a class) sits after the new expiry.** **Otherwise the expiry STAYS.** 🚫 **Never remove a week that holds a class.**
- 🔴 **REQ-114 (ii), the self-block — must be impossible by construction:** **today an Undo records its own expiry restore with the ADMIN as actor, and the NEXT Undo reads that as a person's move and refuses (`UNDO_EXPIRY_UNRECOVERABLE`).** **Under the new rule the Undo does not reason about WHO moved the expiry at all — only whether the last week is empty.** ⇒ **two Undos in a row on one course both work.** **Pin it by value: Undo A, then Undo B, on one course ⇒ both succeed, expiry −14 when both weeks are empty.**
- **`UNDO_EXPIRY_UNRECOVERABLE` and its two sentences: REMOVED if the new rule leaves no case for them.** **If you find one, STOP and tell me.**
- 🔴 **`UNDO_LEAVE_CHARGE_UNKNOWN` DISSOLVES (REQ-112 consequence): no leave consumes a quota, so "did this leave use quota?" has no subject.** **Remove the refusal; `leaveChargeOf`'s "unknown" branch goes.** 🚫 **Its approved §T-G sentence is NOT shipped anywhere else — it simply stops being reachable.** **`leaveUsed` (now a plain count) goes −1 on every leave Undo.**
- **The dry-run preview (`previewUndo`) must say the expiry outcome in words: "the course loses one week (to {date})" or "the expiry stays — a class sits in that week".** 📋 **New/changed copy ⇒ DRAFT, to me** (the owner approves this round's copy as one set).

## 2. REQ-114 (i) — the chain refusal NAMES THE STEPS
**`UNDO_MAKEUP_CHAIN` today: *"คาบขยายของการลานี้ ({date}) ถูกแจ้งลาต่อ — ย้อนกลับไม่ได้ กรุณาแก้ไขด้วยตนเอง"* — no steps.** **Replace with the DRAFT below (📋 owner approval pending in @Porter's copy set — ship it marked DRAFT in a comment; I tell you when it is approved):**
> **TH (ships):** `คาบขยายของการลานี้ (${date}) ถูกแจ้งลาต่อ — ย้อนกลับทีเดียวไม่ได้ · ถ้าวันที่ ${date} จะกลับมาเรียนด้วย: ย้อนการลาของวันที่ ${date} ก่อน แล้วค่อยย้อนการลานี้ · ถ้าวันที่ ${date} ยังลาอยู่จริง: อย่าเพิ่งย้อน ให้แจ้งผู้ดูแลระบบ`
> *EN (reading only, refusals are Thai-only): "This leave's make-up ({date}) is itself on leave — it can't be undone in one step. If {date} is coming back too: undo {date}'s leave first, then this one. If the family is really still away on {date}: don't undo yet — tell the system owner."*
🔑 **Why the second branch says STOP rather than steps: Khwan's Peeta case — the two-step path removes a leave she meant to keep. Until (iii) ships, the honest instruction for that case is "ask", not a path that loses intent.**

## 3. 🔴 Ruling 3 — the ADMIN is FLAGGED when a make-up lands past the expiry
**`TASK-656` makes a make-up past the expiry be CREATED with the expiry unchanged.** ⇒ **here, at that same point in the append: enqueue ONE admin notice.**
- **A NEW notice kind, BESIDE `makeup_far_out`, not instead of it** — 🔑 *today's notice fires when the SEARCH runs out; this one fires when the EXPIRY is crossed: two different events (REQ-112 §⚖️).* **Same recipients and channel as `makeup_far_out`.**
- **Once per make-up, inside the caller's transaction** (the notice exists iff the make-up does).
- 📋 **DRAFT copy (owner approval pending):**
> **TH:** `คาบชดเชยของ ${student} ถูกสร้างวันที่ ${date} ซึ่งเลยวันหมดอายุคอร์ส (${expiry}) — เรียนได้ตามปกติ กรุณาตรวจสอบและขยายวันหมดอายุถ้าต้องการ`
> *EN: "{student}'s make-up was created on {date}, past the course expiry ({expiry}) — the class stands; please check and extend the expiry if you want to."*

## 4. ✅ Done means
1. **`tsc` · DB-unreachable suite with COUNTS** (the 5 camp DATE-BOMB failures reported separately) · **`65 = 65`.**
2. **Value tests:** Undo with the last week empty ⇒ −7 · with a class in it ⇒ unchanged · **two Undos in a row ⇒ both succeed (the self-block, gone)** · a pre-0058 leave with `leaveCharged` NULL ⇒ undoes (no "unknown" refusal) · `leaveUsed` −1 · the chain refusal carries the new sentence · a make-up past the expiry ⇒ exactly ONE admin notice of the new kind, AND `makeup_far_out` still fires on exhaustion alone.
3. **Mutations, filed, list IN the file:** the week given back even when a class sits in it · the week never given back · the actor check re-introduced (the self-block returns) · `UNDO_LEAVE_CHARGE_UNKNOWN` re-introduced · the crossing notice fired on exhaustion instead · the crossing notice sent twice.
4. 🚫 **Not (iii).** 🚫 **No change to TASK-508/510's recipients** (the family is never told on an Undo — owner).


---

# 🔴 RE-AIM — 2026-10-06 (night), @Sober → @Jason. **OVERRIDES §1 and §4 where they differ.** Starts after `TASK-656`'s re-aim.
⚖️ **Owner: ruling 2 RETIRES — the Undo NEVER moves the expiry.** (An ordinary leave never added a week; a declared day's week is not returned — the 10-04 ruling; a coach's leave is lifted, not undone; a cancel cannot be undone at all.)
## §1 REPLACED — DELETE, do not rewrite
- **Delete the Undo's expiry logic entirely:** `expiryDecision`, the restore write, its `recordExpiryChange` call, `UNDO_EXPIRY_UNRECOVERABLE` and both its sentences. ⇒ 🔑 **REQ-114 (ii), the self-block, disappears BY CONSTRUCTION — there is nothing left to block.** **Pin by value: an Undo never changes `expiryDate` and writes no expiry-change row; two Undos in a row on one course both succeed.**
- **`UNDO_LEAVE_CHARGE_UNKNOWN` and `leaveChargeOf`'s "unknown" branch: removed** (no quota ⇒ no question). **`leaveUsed` −1 on a leave Undo (it is a plain count).**
- **The Undo's dry-run preview: drop its expiry line.** 📋 Any changed preview sentence ⇒ DRAFT to me.
- **The expiry-writer list from `TASK-656` loses `undoBooking` — update the pin.**
## §2 unchanged — REQ-114 (i), the chain refusal names the steps (DRAFT copy, in the set).
## §3 — ⭐ NOW THE CENTRE of her model: a make-up that cannot fit ⇒ the ADMIN is told, nothing extends
**Her words: *"แจ้งแอดมินเท่านั้นค่ะ ที่เหลือเราจะจัดการเองว่าจะยืดอายุคอร์สให้ไหมค่ะ"*.** **Build this FIRST in this task** — @Porter's point: it is the only part no answer of hers could overturn. **Spec as written in §3 (a new notice beside `makeup_far_out`, once per make-up, in the caller's transaction, DRAFT copy).**
## §R-gate — 🔴 the sid hand-check for @Tanya, REPLACING `TASK-656` §6
**Fresh courses on sid, first session D. Example D = Wed 2026-10-14. Base expiry = D + 28 / 49 / 84 days (4 / 6 / 10 sessions).**
| step | action | expected expiry | 4-session | 6-session | 10-session |
|---|---|---|---|---|---|
| 0 | create, nothing declared | base | **2026-11-11** | **2026-12-02** | **2027-01-06** |
| 1 | an ORDINARY leave on session 2 (session's Record leave) | **+0** | 2026-11-11 | 2026-12-02 | 2027-01-06 |
| 2 | an ORDINARY leave on session 3 via the plan modal's **Mark absence** | **+0** | 2026-11-11 | 2026-12-02 | 2027-01-06 |
| 3 | *(10)* an admin records the coach's leave on sessions 4 AND 5 | **+14** (her "15 weeks") | — | — | **2027-01-20** |
| 4 | *(6)* cancel session 4 with reason **ปัญหาจากทางเรา** | **+7** | — | **2026-12-09** | — |
| 5 | *(6)* cancel session 5 with reason **ลูกค้าไม่เอาแล้ว** | **+0** | — | 2026-12-09 | — |
**And on a SEPARATE fresh 4-session course NOT YET STARTED: declare session 2 absent ⇒ expiry = D + 35 = week 6 (her "6").**
**At every step: one make-up per absence/cancel · no "x of y" · no lock · the card's week = the expiry's week.**
**Overflow, once:** on the 4-session course, keep adding ordinary leaves until a make-up lands past the expiry ⇒ **the make-up is CREATED, the expiry does NOT move, and the admin receives the new notice.**
**Undo, once:** undo the leave from step 1 ⇒ **the expiry does not change.**
**Forward-only, once:** an EXISTING sid course, untouched ⇒ its expiry is byte-identical before and after the deploy.

## ✅ 2026-10-06 (night) — @Jason: `TASK-657` §R DONE — the admin is told FIRST, the Undo never touches the expiry, 19 / 19 bite — and ONE FINDING about the sid gate's step 3
**`tsc` 0 · DB-unreachable suite 4149 pass · 1 fail (TASK-667's own mutation set — Team B, not mine, reported separately) · `66 .sql = 66 journal tags` (no migration in this task).**
**Set: `src/services/makeup-past-expiry-task657.mutations.json` — 19 / 19 BITE**, baseline 165, CHECKSUM identical, restores byte-identical, test list in the file. **Re-run from their files after the Undo change: `656` 29/29 · `609` 7/7 · `608` 9/9 · `646` 3/3 — all bite, checksums identical.**

### 🔴 FINDING — read before Tanya runs the gate: step 3 is not reachable as written
**§R-gate step 3: *"(10) an admin records the coach's leave on sessions 4 AND 5 ⇒ +14".*** **The ADMIN's coach-leave door is FUTURE-DAYS-ONLY since TASK-648, and a future day is an ADVANCE leave: it blocks the day and cancels NOTHING — so it adds NO week** (pinned by source, because it is the fact the gate depends on). **The only door that cancels classes — and so earns T2 — is the COACH'S OWN same-day leave.** And if the admin then cancels the day's classes one by one with the reason `TEACHER_LEAVE`, that is door 4, which earns **only for `SCHOOL_ISSUE`** ⇒ **+0**.
- **My value test drives +14 through the coach's same-day door** (two classes that day ⇒ +14, her "15"), and says so in its title.
- ▶️ **YOURS, not mine to decide:** either **(a)** the gate's step 3 is run as the coach on the day, or **(b)** the model also earns a week when an admin cancels a class with `TEACHER_LEAVE` — **that is a fourth lever on the closed list, so it needs HER words first** (a paraphrase is what cost us the last night). **I built (a)'s world and did not touch the list.**

### §3 — built FIRST, as ordered: the admin is told, once, and nothing extends
**New kind `makeup_past_expiry`, BESIDE `makeup_far_out`** (that one = the search ran out; this one = the expiry crossed — **two events; one make-up can raise both**, and `N9` shows replacing the old one bites). Same `notifyAdmins` sender, inside the caller's transaction, never the family. 📋 **DRAFT copy** (spec's sentence, both languages, `ob_makeup_past_expiry`, marked DRAFT at the key). ⚠️ **Dates render `dd-mm-yyyy` — the product's `ddmmyyyy` helper — not the `/` the spec showed; tell me if she wants slashes** (one helper).
**WHO ASKS — and why it is the caller, not the re-plan:** the check runs **after the caller's week decision**, so a make-up the new week covers raises nothing (value test: a declared absence whose make-up lands past the base expiry but inside its earned week ⇒ NO notice; `N8` asks before the week and bites). Door 4 cannot know whether it earns a week until the re-plan has said whether the make-up landed in the same slot, so the question cannot live inside the re-plan. **Callers that ask (pinned BY NAME): door 1's own insert, and the four doors that re-plan — `applyPlanChange`, `reportTeacherLeave`, `cancelSeatsOfGroup`, `updateBookingStatus` ×2. Callers that deliberately do NOT (pinned by name too): BIRTH (`createCoursePackage` ×2 — the expiry is born to cover its declared absences) and the Undo (it REFUSES if the re-plan would append).** Each of the five asks bites ALONE (`N3`–`N7`). **`N10` — the check stretching the expiry again (the silent stretch-to-fit in its third home) — bites 13 tests.**
**By value, through the real functions:** an ordinary leave on a course whose last class is the expiry ⇒ make-up CREATED past it, expiry unchanged, ONE notice, addressed to an admin · a make-up inside the expiry ⇒ nobody · two leaves ⇒ two notices · every door ⇒ exactly one · `makeup_far_out` fires on exhaustion ALONE (expiry far away) and the new one on the expiry ALONE.

### §1 — the Undo's expiry logic DELETED, not rewritten
`expiryDecision`, its types, the restore write, its `recordExpiryChange` call, **`UNDO_EXPIRY_UNRECOVERABLE` and both sentences**, and the planner's three expiry reads (latest change, marker, the course's rows) are **gone** — asked of the CODE, not comments. **REQ-114 (ii) (the self-block) disappears by construction: by value, two Undos in a row on one course both succeed, the counter moves twice, `expiryDate` is byte-identical, `h.expiry` is empty and the history table gained nothing** (`U1` gives a week back, `U2` records a change, **`U4` re-introduces the actor check — all bite**). **The expiry-writer list loses `undoBooking` — SIX now; updated in the pin and SYSTEM-FACTS.** **The preview and the answer carry no `expiry` field** — I read the front's `UndoControl`: it only mentions the expiry in a comment, so nothing breaks. **The dry-run's expiry line is dropped (nothing to say).**
- **`UNDO_LEAVE_CHARGE_UNKNOWN` and `leaveChargeOf`'s "unknown" branch: removed** — its approved §T-G sentence ships nowhere else. **Its test file was RETIRED and RENAMED** (`undo-charge-unknown-retired-task657.test.ts`: a test named for a sentence that no longer exists is a claim nobody can check).
- ⚠️ **ONE DEVIATION from your wording, stated:** *"`leaveUsed` −1 on every leave Undo."* **A pre-start declared day is FREE and never incremented the counter, so −1 would take a count from ANOTHER leave** (the floor hides it, it does not fix it). **I give the count back only when the leave was COUNTED** — `leaveChargeOf` now answers `charged`/`free`, and a legacy NULL row (the old "unknown") is counted. `U5` (refund a free day) and `U6` (never refund) both bite. Say if you meant every leave.
- `booking_undos.expiry_from/expiry_to` columns stay, written null. The `expiry_recording_marker` table stays (nothing in the Undo reads it now) — **yours if you want it dropped later; I did not touch a migration.**

### §2 — the chain refusal names the steps (📋 DRAFT, marked at the line)
**Your TH sentence, exactly, by value** (4 occurrences of the date; the old *"กรุณาแก้ไขด้วยตนเอง"* gone). **The second branch says STOP, not a path** — `U8` turns it into a path and bites. Not (iii).

### The sid gate — by value, so the numbers are known before Tanya looks
**Run through the real entry points, dates relative to a first session D = yesterday (session 1 delivered); base = D + 28 / 49 / 84.** ✔ ordinary leave on session 2 (session button) and on session 3 (plan modal) ⇒ **+0, one make-up each, counted, no "x of y", no lock — for all three sizes** · ✔ **6-session: cancel session 4 «ปัญหาจากทางเรา» ⇒ D+56 (+7); session 5 «ลูกค้าไม่เอาแล้ว» ⇒ +0** · ✔ **not-started 4-session: declare session 2 ⇒ D+35 = week 6** · ✔ **10-session coach's leave over two classes ⇒ +14 (see the FINDING)** · ✔ **overflow: ordinary leaves until a make-up lands past the expiry ⇒ created, expiry unmoved, one notice per make-up that crossed** · ✔ **Undo: expiry does not change** · ✔ forward-only (656's file).

### ⚠️ What I changed in existing pins — each with its reason
- **`booking-undo-req108.test`**: the expiry-decision test, the "restored exactly" by-value test, the TASK-556 (1b) describe (no-record ⇒ keep/refuse) and the "admin-set expiry refuses" case **REWRITTEN to the new rule, not deleted** — each now asserts the opposite by value (born before OR after recording ⇒ proceeds, expiry untouched; an admin-set expiry no longer stops an Undo). The legacy "unknown ⇒ refused" case became "counted ⇒ refunded".
- **Kind-count pins** (`message-trailing`, `no-iso-date-leak`, `no-placeholder-leak` ×2): 31 → 32 kinds and `?? "-"` 9 → 10, each with its `· 🔻 TASK-657: +1` note. **Group-cancel / 552 pins**: the seat re-plan call now keeps its result (`const replanned = …`) — text pins updated. The 537 fake gained `coursePackages.findFirst` (the check reads the expiry).
- **SYSTEM-FACTS** gained the Undo rule and the notice rule; the writers bullet is SIX.

### ❓ For you (not touched)
- **`planUndo` still joins `student` + `coStudent`** (§T-G added them only for the removed refusal). Harmless; a one-line cleanup if you want it.
- `canTakeLeave` (leave.ts) still has no production caller (from 656) · `openapi/document.ts` `reasonCode` enum still the stale fourth copy (690).
- **Ship-set status:** 656 + 657 are both in the tree. **658 is yours/Fern's.** `TASK-659` (XS copy) is next on my list.

▶️ **Ball: Sober verifies 657 — and answers the step-3 question (a / b).**

### 🔁 §R-gate STEP 3 — REWRITTEN 2026-10-06 by @Sober (Jason's finding: an admin's FUTURE-day coach leave cancels nothing)
| step | action | expected expiry (10-session) |
|---|---|---|
| **3a** | the admin records the coach's leave on the dates of sessions 4 AND 5 (Teachers page, future days) | **+0** — the day is blocked, the two classes are LISTED, nothing cancelled |
| **3b** | the admin CANCELS session 4 and session 5, each with reason **ปัญหาจากทางเรา** | **+14 ⇒ 2027-01-20** (her "15 weeks") · two make-ups |
| *(3c, if a coach account is linked on sid)* | the coach records their OWN leave on the day, same-day | **+7 per class cancelled** (T2) |


## ⚖️ 2026-10-06 — @Sober: §3 SUPERSEDED by `TASK-692` — owner reversed ruling 3: a make-up that cannot fit is HELD (not created); admin + family told once; extending the expiry books it. The notice code built here is RE-AIMED there.

---
### 🔁 §R-gate — REWRITTEN AGAIN 2026-10-06 by @Sober for `TASK-692` (a family leave with no room is REFUSED). **This table REPLACES the earlier §R-gate tables and the 3a/3b addendum.**
**Fresh courses on sid, first session D. Example D = Wed 2026-10-14. Base expiry = D + 28 / 49 / 84 (4 / 6 / 10 sessions) = room for 1 / 2 / 3 make-ups.**
| step | action | 4-session (base 2026-11-11) | 6-session (base 2026-12-02) | 10-session (base 2027-01-06) |
|---|---|---|---|---|
| 1 | ORDINARY leave on session 2 — the session's **Record leave** | ✅ booked · expiry **2026-11-11** (+0) · make-up in week 5 | ✅ booked · 2026-12-02 (+0) | ✅ booked · 2027-01-06 (+0) |
| 2 | ORDINARY leave on session 3 — the plan modal's **Mark absence** | 🔴 **REFUSED** with **"อายุคอร์สไม่พอสำหรับคาบชดเชย — ขยายวันหมดอายุก่อน แล้วค่อยบันทึกลา"** · **NOTHING written** (session 3 still confirmed, no make-up, no count, expiry unchanged) · **no admin notice** | ✅ booked · 2026-12-02 (+0) | ✅ booked · 2027-01-06 (+0) |
| 2b | *(4)* the admin EXTENDS the expiry by a week, then repeats step 2 | ✅ **booked** · make-up in week 6 | — | — |
| 3a | *(10)* admin records the coach's leave on the dates of sessions 4 and 5 (future days) | — | — | **+0** — day blocked, 2 classes LISTED, nothing cancelled |
| 3b | *(10)* admin CANCELS sessions 4 and 5 with **ปัญหาจากทางเรา** | — | — | **+14 ⇒ 2027-01-20** (her "15") · 2 make-ups booked |
| 4 | *(6)* CANCEL session 4 with **ปัญหาจากทางเรา** | — | **+7 ⇒ 2026-12-09** · make-up booked | — |
| 5 | *(6)* CANCEL session 5 with **ลูกค้าไม่เอาแล้ว** (no room left) | — | **+0** · ⚠️ **NOT refused (a cancel never is): the make-up is CREATED past the expiry and the ADMIN is told (`makeup_past_expiry`)** | — |
**Separate fresh 4-session course NOT YET STARTED: declare session 2 absent ⇒ +7 ⇒ expiry D+35 = week 6 (her "6") · make-up booked.**
**The PARENT's door, once (needs a linked parent on sid; else the owner on uat):** a parent's LINE leave on a course with no room ⇒ **her sentence verbatim — "ไม่สามารถแจ้งลาได้ เนื่องจากวันหมดอายุไม่เพียงพอค่ะ กรุณาติดต่อแอดมินค่ะ"** · nothing written · **the admins get ONE notice.**
**Undo, once:** undo step 1's leave ⇒ the expiry does NOT change.
**Forward-only, once:** an EXISTING sid course, untouched ⇒ expiry byte-identical before and after the deploy.
**At every step:** no "x of y" · no lock · the card's week = the stored expiry's week.
