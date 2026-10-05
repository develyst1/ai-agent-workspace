# ANALYSIS — REQ-114: Undo refused because the leave's make-up is itself on leave — @Sober, 2026-10-05
**For @Porter.** **Read in the code, not the dialog:** back `src/lib/booking-undo.ts` (`makeupDecision`, `expiryDecision`), `src/services/undo.service.ts` (`planUndo`, `undoBooking`), `src/services/scheduler.service.ts` (course creation ~2256–2350, leave ~4040–4075). 🚫 **No query run, none needed for the answers below.** 🚫 **Nothing cut.**

---

## Q1 — Is the refusal intended? **YES. And a pre-declared leave DOES produce a make-up — by design.**
- **A leave declared at course creation is born `SICK_LEAVE` + `plannedAtCreation`, and the plan engine APPENDS a make-up for it, linked by `extendedFromId`** (TASK-148: "a course born with absences ends up with `size` live sessions"). ⇒ **Peeta's leave → its make-up on 2026-12-05 is the normal shape.** Nothing went wrong on that path.
- **The 12-05 make-up was then itself put on leave, which appended a SECOND make-up linked to IT.** **Two ways that happens, both legitimate:** (a) the family declared a week at creation that fell on a make-up position — the creation loop flips that make-up to leave and appends another (TASK-361) · (b) somebody took leave on the 12-05 row later. 📌 **The code cannot tell me which for Peeta without a read; it does not change the steps below.**
- **The guard (`UNDO_MAKEUP_CHAIN`) is deliberate:** undoing the first leave must cancel its make-up, and that make-up is no longer a plain session — it is a leave with its own make-up. **The guard refuses rather than decide silently what happens to the second leave.** ✅ **Intended.** ⚠️ **What is NOT good is the sentence: "กรุณาแก้ไขด้วยตนเอง" with no steps** — Q2.

## Q2 — 🔴 THE HAND-STEPS, in order (for the owner TODAY)
🔑 **Undo the chain from its END backwards.** **Each Undo dialog is a DRY RUN before the click** (TASK-546): it shows what it will do or why it refuses, and writes nothing until "Undo it". **So every step can be looked at safely first.**

**Step 1 — open the 2026-12-05 session (the make-up that is on leave), and open its Undo.**
- **It should offer:** the 12-05 class comes back, and **ITS make-up (the later one) is removed.**
- 🔴 **READ THE EXPIRY LINE IN THAT DIALOG BEFORE CLICKING.** **If it says the expiry goes back TO 2026-12-05 ⇒ STOP, do not click** — see the trap below. **If it shows no expiry change, or a change to any OTHER date ⇒ click "Undo it".**
- **If THIS dialog also says "ถูกแจ้งลาต่อ" for a later date ⇒ the chain is longer: open THAT later session first and start from there.**

**Step 2 — straight after, open Peeta's original (pre-declared) leave and its Undo.**
- **It should now offer:** that week comes back as a class, and **the 12-05 make-up is removed** (no longer needed — the family attends the original week).
- **End state:** the original week is ON · 12-05 gone · the later make-up gone · the course is back to its size. ✅ **That is exactly what "คุณแม่เปลี่ยนใจมาเรียน" means.**
- ⚠️ **Do steps 1 and 2 together.** **Stopping after step 1 leaves 12-05 booked as a class.**

**⚠️ The coach gets up to THREE LINE notices** (12-05 "back on", the later make-up "cancelled", then 12-05 "cancelled"). **Worth a word to the coach first.** 🚫 **The family is not messaged by Undo.**

**Other refusals either dialog may show — each is a real reason, and none is fixed by clicking again:**
- **"ช่วงเวลา … ของครูมีคาบของ … อยู่แล้ว"** — the hour was given to another booking while it was on leave. **Move that other booking first, or ask the owner.**
- **The coach is on leave that day** — the class cannot come back onto it.
- **Any refusal in step 2 AFTER step 1 was done** ⇒ **STOP and send it to the owner**; do not try to put 12-05 back on leave by hand (on a started course that would CHARGE a leave the family never took).

### 🔴 The trap in step 1 — found reading `expiryDecision`, and it is a DEFECT of ours, not her mistake
**When an Undo moves the expiry back, it records that move with the ADMIN as its author** (`recordExpiryChange(..., actor: opts.actor)`). **The NEXT Undo reads the newest expiry record; an authored one means "a person moved this — I can't compute it back" ⇒ `UNDO_EXPIRY_UNRECOVERABLE`.** ⇒ **If step 1 restores the expiry to exactly 12-05, step 2 refuses — and the course is left half-undone.** **The dry run in step 1 shows it in advance, which is why the rule above says read the expiry line first.** **If it shows that, the owner repairs it by DATA REQUEST** (one leave row and one expiry date), 🚫 **not by hand on screen.**

## Q3 — Reachable only from the pre-declared path? **NO — from ANY leave whose make-up is later put on leave.**
- **`makeupDecision` does not look at how the first leave was made.** **Any course leave (coach's own, admin's, parent's, at creation, or — after tonight — a pre-start declaration) whose make-up later goes on leave is refused the same way.**
- **Pre-declared courses meet it MORE often** for one reason: several declared weeks at creation can fall on make-up positions, so the chain can be **born** that way (TASK-361) — the admin did nothing to create it.
- **Size without a query:** the population is "every course with a `SICK_LEAVE` row whose `extendedFromId` points at another leave". **Counting it needs a read; 🚫 not asked for, as you said.**

## Q4 — Does tonight's release change any of it? **The CHAIN refusal: NO — confirmed. Two corrections to "nothing touches undo":**
1. **One OTHER undo refusal changes wording tonight:** `UNDO_LEAVE_CHARGE_UNKNOWN` — the owner-approved §T-G sentence (commit `58528b6`). **Not Khwan's refusal; the chain refusal's text is byte-identical.**
2. **The new pre-start "declared absence" door (`TASK-609`) is one more way a make-up gets put on leave** ⇒ **chains like Peeta's can become slightly MORE common after tonight, not less.**
⇒ ✅ **The owner can tell her truthfully: "not fixed in tonight's release — here is how to do it by hand today."**

## Sizing — the fix (for the pile)
- **(i) The refusal says the steps** — XS, copy only (owner approves the sentence). **Cheapest real help.**
- **(ii) Fix the self-block** — S: an Undo's own expiry restore must not read as a person's move to the next Undo (record it as the system's / the undo's own, not the admin's). 🔑 **A defect regardless of what the owner chooses — without it, even correct hand-steps can strand a course.**
- **(iii) Undo walks the chain itself** — M: one click undoes the leave, cancels its make-up AND the make-up's own make-up, in one transaction. ❓ **Needs ONE owner decision: when the chained (second) leave is unwound, is its leave simply dropped (the week no longer exists), or must it be kept somewhere?** ⭐ **My recommendation: dropped — that week stops being a class at all, so there is nothing to be absent from.**
- ⚠️ **Interaction with REQ-112:** if the leave counter is abolished, `leaveCharged` loses its meaning and part of the Undo's reasoning goes with it. **Build (ii)/(iii) so they do not lean on the counter.**

## ➕ 2026-10-06 — the hand-steps RAN on uat (Khwan, Peeta), via @Porter
✅ **Worked, in the given order; no STOP condition hit.** **Result: 17/10 back to CONFIRMED · 05/12 (17/10's make-up) CANCELLED · 12/12 (05/12's make-up) CANCELLED · plan footer `0 session(s) still owed`.** **`CANCELLED` on a make-up after its leave is undone is BY DESIGN** (`undoBooking` → `MAKEUP_UNDONE_NOTE`). ⚠️ **One run is not a clearance of the self-block defect (ii); it simply did not arise here.**


## 🔴 2026-10-06 — the hand-steps resolved the refusal and did NOT preserve intent. **My error first.**
**Khwan's intent: undo ONLY the 17/10 leave; the 05/12 leave was REAL ("5/12 น้องลาอยู่แล้ว"); last session 12/12.** **What the steps produced: 05/12 and 12/12 CANCELLED, last session 19/12.**
🔴 **I wrote above "End state … ✅ That is exactly what 'คุณแม่เปลี่ยนใจมาเรียน' means."** **That was an ASSUMPTION — that the 05/12 leave existed only as part of the chain — and I did not ask.** **The same assumption sits under my recommendation (iii) "the chained leave is simply DROPPED", which the owner ruled on. ⇒ That ruling must be re-put to him (below).** ⭐ **Porter carried the count; the shape was mine to get right.**

### Q1 — is 19/12 the make-up of the 26/09 leave, and is 12/12 the right last session?
- **19/12: YES, by elimination from what the screens SAID** — three leaves (26/09, 17/10, 05/12), three make-ups (05/12, 12/12, 19/12); the original refusal named **05/12 = 17/10's**, step 1's dialog named **12/12 = 05/12's** ⇒ **19/12 = 26/09's.** 📌 **Certain only by a read of `extended_from_id`; not needed for the steps below.**
- **12/12: YES, her date is right.** **Ten sessions, 26/09 missed, 05/12 the family away ⇒ the one make-up owed (for 26/09) lands on the first week after 28/11 that she is not away = 12/12.**

### Q2 — can she get there from HERE? **YES, with ONE screen action.**
**Move the 19/12 session to 12/12, same time** (the session's **Move** on the calendar).
- **Why it works (code: `moveBooking`):** it changes the row's date only — the make-up stays linked to the 26/09 leave; no count changes; nothing is cancelled or created; the plan stays balanced (`0 owed`). **12/12's own row is CANCELLED, which does not hold the hour** ⇒ the slot is free unless someone else has booked that coach at that hour since.
- **What it sends:** a "class moved 19/12 → 12/12" LINE notice to **the coach AND the family** (TASK-516). ✅ **True and useful — the family's last class really did move.** ▶️ **Tell her before she clicks.**
- **05/12:** no class exists that day any more, so the family's absence needs nothing recorded. ⚠️ **`Leave 1/3` will not go back to 2/3** — the undo refunded 05/12's leave. **If her team wants 05/12 COUNTED as a leave for their records, that needs the owner, not a screen.**
- **STOP conditions:** **"ครูมีคาบในช่วงเวลานี้แล้ว"** ⇒ someone holds that coach's 12/12 hour; **a coach-off / coach-leave refusal** ⇒ the coach is off that day. **Either ⇒ STOP and send it to the owner; 🚫 do not try another date without the family.**
- **End state:** 26/09 leave · 03/10 attended · 10/10–28/11 confirmed (17/10 included) · **12/12 the last session** · nothing on 05/12 or 19/12. ✅ **Her intended shape.**

### Q3 — does it change the REQ-114 sizing? **YES — (iii) is redefined, and the owner's ruling on it must be re-asked.**
**The fix must let her undo ONE link without unwinding the rest.** **Correct behaviour, from her case:** undoing 17/10 brings 17/10 back; **the family's later absence (05/12) STANDS**; the course now owes ONE make-up fewer, so **the plan keeps the EARLIEST make-up and drops the latest** — and re-links the survivor to the leave that still owes it.
- **Size: (iii) M → M+ (≈ 3–4 days)** — the relinking and "which make-up survives" are new rules, and the Undo's dry run must say all of it before the click.
- ❓ **Re-asked ruling (replaces "the chained leave is DROPPED"):** ***"When an admin undoes a leave whose make-up was itself put on leave, the later leave STANDS (the family is still away that day), and the course keeps its EARLIEST make-up and drops the latest — yes?"*** ⭐ **Recommend YES — Khwan's own expectation, on the real case.**
- 📌 **Unchanged: build (iii) with REQ-112, which rewrites the expiry side of the Undo anyway.**

### The sentence Porter owes her — for him to word
**"The steps cleared the refusal, but they also removed the 5 Dec leave you meant to keep. One more step puts it right: move the 19 Dec class to 12 Dec. The system will tell the coach and the family that the class moved."**


## ⚖️ 2026-10-06 — OWNER RULING on (iii), via @Porter — and the one it REPLACES
- ✅ **IN FORCE:** **when an admin undoes a leave whose make-up was itself put on leave — the LATER LEAVE STANDS, and the course keeps its EARLIEST make-up and drops the LATEST.** ⇒ **(iii) = M+ (≈ 3–4 days): undo ONE link without unwinding the rest.**
- ~~**SUPERSEDED (2026-10-05): "the chained leave is simply DROPPED."**~~ **Kept, not deleted. Why it changed:** it rested on my assumption that a leave on a make-up exists only as part of the chain. **Khwan's real case (Peeta, 05/12: "น้องลาอยู่แล้ว") showed the later leave can be a real absence.** *The old ruling was reasonable on the facts we had; her case is what changed our minds.*

### For the TASK when it is cut — @Porter's two conditions, answered from code now
**1. What the FAMILY and the COACH see** (today's Undo rules, `undo.service.ts`; the owner's TASK-508 ruling *"never the family"* stands unless he changes it):
| row | what happens | coach | family |
|---|---|---|---|
| the undone leave (17/10) | back to CONFIRMED | ✅ **"class on again"** (TASK-508, every coach of the row) | 🚫 nothing (owner, TASK-508) |
| the DROPPED make-up (the latest, e.g. 19/12) | CANCELLED | ✅ **the standard cancel notice** (TASK-510, every coach of THAT row) | 🚫 nothing — ⚠️ **so the family's LAST class date changes silently** |
| the SURVIVING make-up (e.g. 12/12) | unchanged date; only its link changes | 🚫 nothing — nothing about the class changed | 🚫 nothing |
| the later leave (05/12) | STANDS | 🚫 nothing | 🚫 nothing |
⇒ 🔑 **The dry-run dialog must name ALL of it BEFORE the click: which leave comes back, WHICH make-up is dropped (its date), which survives, and that the later leave stands.** **That is the only place the admin learns the family's last date moved — so she can tell them.** ⭐ **Recommend: keep "never the family" (one rule for every Undo) and make the dialog say it in words; 🚫 do not quietly add a family message.** *(If the owner wants the family told, that is a change to his TASK-508 ruling — his call, one line.)*

**2. A surviving make-up in the PAST, or already attended — can it happen, and what then?**
- **Rule for WHICH make-up is dropped: the latest one that is still LIVE and not on a settled day.** **A delivered (ATTENDED / NO_SHOW) or settled make-up is never a candidate** — it cannot be undone (TASK-093: delivered rows are immutable; Q1: settled days are hard-refused).
- ⇒ **A surviving make-up being in the past or attended is FINE and needs nothing** — it is kept, untouched; it was taught or is earlier. **Only the DROPPED one must be future and live.**
- **Can the latest live make-up be in the past?** **Normally NO:** a make-up is appended AFTER the last planned date, the undone leave must itself be unsettled (today or later), so the latest make-up is on or after it. ⚠️ **BUT a manual MOVE can break that order** (exactly what Khwan is about to do with 19/12 → 12/12). **If no live, unsettled make-up exists to drop ⇒ REFUSE, in words, naming why** — 🚫 never drop a delivered row, never silently over-plan.
- 📌 **Today's plan check stays the backstop:** after the Undo the plan must balance (`0 owed`) or the Undo refuses (`UNDO_PLAN_WOULD_CHANGE`).

**3. A design detail the TASK must settle, so the data does not lie (not an owner question):** after the drop, links must still be TRUE — the survivor must point at a leave that still owes it, and no live make-up may point at the row that came back. **Peeta's shape: 19/12 (26/09's) dropped, 12/12 (05/12's) survives ⇒ 26/09 now has no make-up while 05/12 has one — the counts balance but the links say the wrong leave was made up.** ▶️ **Re-link the survivor to the leave whose make-up was dropped, OR drop by link rather than by date — the TASK picks one and pins it by value.** 🔑 *Undo's own rules (`leaveChargeOf`, `makeupDecision`) read those links; a false link is a wrong answer at the NEXT Undo.*

### ✅ 2026-10-06 — @Porter ACCEPTED all three. **TASK-508 ("never the family") stays, no ruling sought.** 🔴 **The dry-run dialog line is a DELIVERABLE of the (iii) TASK:** before the click it names which leave comes back · WHICH make-up is dropped, with its DATE · which survives · that the later leave STANDS. **Link-truth after a drop: settled in the TASK, pinned by value.** Parked with REQ-112; nothing cut.
