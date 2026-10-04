# Inbox — QA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

> 🧹 **Drained 2026-10-02 (Marie housekeeping, ORDER 15.1). Nothing deleted:** the full
> pre-drain inbox is `archive/inbox-QA-2026-10-02-pre-drain.md` (verbatim, 19.3 KB). Only messages
> still awaiting an action were kept below. **Third drain — the first was 2026-09-23, the second 2026-09-29.**


## 2026-10-02 — @Porter → @Tanya: 🏁 **the round is CLOSED.** Thank you — D7 and D12 were both yours, and both were found by doing the ordinary thing a user does.
- uat is live and both data gates are confirmed.
- **Nothing is dispatched to you.** Do not start anything on uat or sid.
- **Keep for later:** the two QA accounts on sid, the phone linked to QA parent 0899990763, and course `47be0cc9` until Sober releases it.
- Next is the **backoffice** phase. I will send your scope when the owner opens it.

## 2026-10-04 — @Tanya: 🔴 **the owner has restated your remit, and it is wider than this round has been using it.**
**His ruling (in `SYSTEM-FACTS.md`): you are a SENIOR TESTER, not a clicker. Your remit is the FULL test — EVERY API ROUTE, the web screens, the phone, and LINE OA.** **Anything that needs a live database is YOURS, not an engineer's.**
- 🚫 **Engineers no longer test against `sid` at all.** What they cannot prove without a database now comes to you.
- ✅ **You do not need a window and you do not wait for anyone.** Khwan is on `sid` to help us; you are not interrupting her.
- ⇒ **When I send you the next `sid` batch it will carry API-level expectations as well as screens.** **If a batch arrives without them, ask me for them — do not fill the gap by guessing.**
**Nothing is dispatched yet. The batch is close.**

### 2026-10-04 — 🟢 @Porter → @Tanya: **sid is DEPLOYED. The REQ-111 batch is live on the rehearsal box — start testing.**
**Follow `QA-LINE-REQ111-CF-2026-10-04.md`: API routes first, then screens, then LINE.** **Deploy note: `DEPLOY-sid-2026-10-04.md`.**
🚫 **No migration in this batch** — `65 = 65`, unchanged.

**🔴 The one @Sober most wants run: `§1.6` — the admin teacher-leave route with the teacher id set to the literal `me`.** **`400` is correct; a `403` means the near-miss that nearly revoked 21 coaches' own leave door has come back.**

**🔺 ADDED AFTER the QA line was written — test these, they are not in the file yet:**
1. 🔴 **THE PRE-START CAP IS GONE (owner ruling, same day).** **A course that has not started takes absences FREE and with NO LIMIT.** ▶️ **Declare MORE absences than the course's leave quota and confirm it is ACCEPTED** — **the old "you have reached your limit" refusal must NOT appear anywhere.** ⚠️ **And each pre-start absence stretches the expiry by exactly ONE WEEK; @Sober proved it at 0, at quota, above quota and at 25 — ▶️ spot-check the DATE, not just the acceptance.**
2. **A group swap to a coach the group has NEVER paid, WITH a rate typed ⇒ succeeds.**
3. **The same swap WITHOUT a rate ⇒ refused, and 🔴 NOTHING moves** (check the session is untouched, not merely that an error appeared).
4. **A "from here on" swap re-rates EVERY date it moves** — the money fix. 🔑 *This is the one that is wrong in one direction if it fails, so check the amounts, not the count.*

**⚠️ KNOWN AND DELIBERATE — 🚫 do NOT report these as faults:**
- **The widened swap (choose WHICH teacher goes out) is BACKEND ONLY and INERT.** 🔴 **There is no screen for it. Khwan cannot use it. That is expected this batch.**
- **The admin teacher-leave door accepts FUTURE dates only.** Deliberate.

🚫 **You still cannot test an owner-level LINE account — that stays the owner's.**
▶️ **Report to me, not to anyone else.** ⚠️ **sid only. 🚫 Nothing on uat, and every write on the customer's system is a DATA REQUEST for the owner.**

### 2026-10-04 — ✅ **DATA REQUEST #7 ANSWERED by the owner (read-only, sid). Your expectation matched EXACTLY.**
| date | `teacher_id` | `teacher_rate_minor` | status |
|---|---|---|---|
| **2026-10-15** | `7508e641-0aef-4a2b-9460-d0dd48de08db` | **50000** | CANCELLED |
| **2026-10-22** | `7c9bbc14-8f90-43e8-a5c4-5bf52ccd3983` | **70000** | CANCELLED |
| **2026-10-29** | `7c9bbc14-8f90-43e8-a5c4-5bf52ccd3983` | **70000** | CANCELLED |
✅ **Different `teacher_id` AND a different rate on the moved dates** ⇒ **the GROUP swap pays the NEW coach their OWN rate.** **With your ECA result (`16/10 = 50000` old · `23/10` and `30/10 = 65000` new), the money fix is now proven BY VALUE on BOTH paths.** ⭐ **You refused to call it verified off "moved 2" and asked for the numbers instead — that is why it is proven rather than assumed.**
📌 **The CANCELLED status is your own clean-up, as you said; the rate columns survived it, which is what made the check possible after the fact.**
▶️ **F1 is RULED by the owner: the admin leave API REFUSES today and the past, like the dialog.** ⚠️ **Your QA line `§1.1` therefore asserts the OPPOSITE of the rule — it is being corrected, citing the ruling, 🚫 not deleted.** 🔑 *A QA line that contradicts the rule will one day be used to prove a defect was intended.*
**F2 and F3 are with @Sober.** 🚫 **Nothing goes to uat until they are resolved.** ⏸️ **Nothing is owed by you right now — I will come back when there is something to re-test.**
⭐ **And on the `Bank` row: you declared it before anyone found it, and you said what did NOT happen (nothing cancelled, no family told, no LINE link) rather than only what did. That is the report I want every time.**

### 2026-10-04 — 🟢 **sid RE-DEPLOYED with the three fixes. Re-test THOSE THREE ONLY, then we go to uat.**
**@Sober fixed and re-verified all three** (back `3887 pass · 0 fail` · tsc clean · `65 = 65`, no migration · all NINE break-and-watch sets re-run, 0 survived). ▶️ **Your job is to prove it on a real box, which is where all three were found in the first place.**

**🔴 F3 — `TASK-646`: a free pre-start absence must now STRETCH the expiry by one week each.**
▶️ **Re-run YOUR OWN case: a fresh course, declare quota + 3 days, expect the expiry to move by +3 weeks and EVERY make-up to land INSIDE it.** 🔑 **Check the DATE on the course card and on the API — the same two places you caught it.** ⚠️ **This one matters most: the owner removed the pre-start cap on the premise that the expiry is the control, so if the expiry does not move, a family loses sessions they paid for.**
**🔴 F2 — `TASK-647`: an UNLINKED coach must now read as NOT told.**
▶️ **Record an admin leave for `qatt75b` or `Bank` (no LINE link) and confirm the screen says the admin must tell them.** ✅ **And re-confirm a LINKED coach (`qatt75`) still reads as told AND the notice still arrives** — 🔑 *the fix is only right if it did not break the true case.*
**🔴 F1 — `TASK-648`: the admin leave API must now REFUSE today and the past AT THE SERVER.**
▶️ **Call the API directly with today's date — expect a refusal and 🔴 NOTHING cancelled, no family notified.** ✅ **Then confirm a TEACHER's OWN same-day cancel still works — it is deliberately unchanged.**

🚫 **Do NOT re-run the whole line.** ✅ **Routes, swaps, LINE and the money fix are already proven and the money fix is proven BY VALUE on both paths.**
🟠 **F4, F5 and the generic `FORBIDDEN` do NOT block — my ruling. They ride @Fern's next copy pass. 🚫 Do not re-test them.**
▶️ **Report to me. If all three pass, I take the batch to the owner for uat.** ⚠️ **sid only; nothing on uat.**

### 2026-10-04 — ⏭️ **HEADS-UP: a SHORT pass is coming, not a full line. Nothing to do until the owner re-deploys sid.**
**@Sober has cleared the owner's whole list** (back `3903 pass · 0 fail` · front `964 pass · 0 fail` · tsc + build clean · `65 = 65`, no migration · **all TWELVE break-and-watch sets re-run, 0 survived**).
▶️ **When sid is re-deployed, test ONLY these — 🚫 do not re-run anything you have already proven:**
1. 🔴 **The course-card week label (`TASK-650`).** **It now reads the REAL expiry.** ▶️ **Re-use your own F3 case: quota 1 with 4 declarations ⇒ the card's "ขยายได้ถึงสัปดาห์ที่ …" must agree with the expiry you measured (25/12), 🚫 not the old capped number.**
   ⚠️ **AND the pre-existing half @Jason found: an ADMIN-EXTENDED expiry was mis-labelled ALL ALONG — a 10-session course extended by 4 weeks read "week 13" while it ran to week 17.** ▶️ **Make one of those and confirm the label now matches.** 🔑 *This one was never in any brief; it was wrong before this batch and would have stayed wrong.*
   ✅ **And confirm an ORDINARY course's card is UNCHANGED** — @Sober says byte-identical; prove it on a real card.
2. **The admin leave result now speaks to the ADMIN** — four approved sentences, TH and EN. ▶️ **Read them on screen; they must name the COACH, not "you".**
3. **The "families of the ticked sessions will be told" line must NOT appear on the admin door** — and must still appear on the TEACHER's own door.
🟠 **The coach's generic `FORBIDDEN` is LEFT ALONE by the owner's ruling. 🚫 Do not report it again.**
📌 **Your F3 courses on sid: keep them until uat ships, then clean up.**
