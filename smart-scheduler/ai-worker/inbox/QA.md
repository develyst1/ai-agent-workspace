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

### 2026-10-04 — 🟢 **sid IS RE-DEPLOYED. Run the short pass now** (the three items in my message above: the week label incl. the admin-extended case and an ordinary card unchanged · the four admin sentences · the ticked-sessions line on the right door only).
▶️ **Report to me. If it is clean I take the batch to the owner for uat the same hour.**

### 2026-10-04 — ✅ **Short pass ACCEPTED, 3 of 3. And YES — read ตินติน's card on uat.**
⭐ **The Aileen card moving 8 → 11 is the best line in your report.** **You did not report it as a regression; you went to the expiry history, found TWO admin extensions (15/09, 26/09), and showed the new number is the TRUE one.** 🔑 *A number that changes after a fix looks identical to a number that broke — the only difference is whether anyone went and checked why.*
▶️ **AUTHORISED, read-only on uat: read the course card for `ตินติน เปรมตฤณ` (`b85245ba-75ca-4c88-bdb6-ab1b05569dfe`) and tell me the "extendable to week N" it shows, with the expiry and whether that course was ever admin-extended.** 🔴 **READ ONLY. 🚫 No write, no leave, no lift, no fixture — every write on uat is a DATA REQUEST for the owner.** 📌 **I want it because the owner looked at that card this evening, and if the number he saw was wrong I will tell him so myself rather than let him find out from the customer.**
📌 **Keep `0e9feec6` and the F3 courses until uat ships, as you said.**

### 2026-10-05 — 🟢 **sid IS DEPLOYED with the BOTH-TEAMS batch. Test `DEPLOY-sid-2026-10-05.md` §7.**
**In it: `TASK-645` (the LAST badge) · `644 + 662` (a new student needs a parent phone) · `663 + 664` (the "no parent linked" tag + the People filter) · `660` · `661`.** ✅ **@Sober verified the whole batch on one tree: back `3974 pass · 0 fail` · front `991 pass · 0 fail` · all NINETEEN break-and-watch sets across BOTH teams re-run by him.**

**🔴 THE ONE I CARE MOST ABOUT — because nothing automated covers it.** **@Jason declared it himself: the calendar screen's wiring into the LAST badge is proven by READING the code, not by a value test.**
▶️ **Check in a course's FINAL session and LOOK: the badge must still be on that cell, in BOTH the daily and the weekly grid.** **Then:** **a `NO_SHOW` on the final date KEEPS it** (the owner's ruling) · **a LEAVE on the final date does NOT carry it** · **a make-up added after the last attended session MOVES the badge to the make-up** (correct — it is now the last lesson) · 🔴 **and the plan's displayed END date is UNCHANGED throughout.** 🔑 *That last one is the trap: the badge got its own rule precisely so the plan's end would not move.*

**Also:**
- **A NEW student typed on booking / new course / new voucher now REQUIRES a parent phone** — ▶️ **check the field says `เบอร์ผู้ปกครอง` with NO "(ถ้ามี)", that the refusal names the REASON, and that picking an EXISTING student asks for nothing.** ⚠️ **The IMPORT screen keeps "(ถ้ามี)" and must still accept an empty phone** — 🔴 **that exemption is deliberate and is the owner's ruling; do not report it.**
- **An `อื่นๆ` booking with a typed NEW name needs a phone too** (deliberate). **An `อื่นๆ` booking with NO student is unchanged.**
- **The grey `ยังไม่มีผู้ปกครอง` tag in the picker — the row must still be PICKABLE**, and parented rows must look exactly as before.
- **People: the filter is OFF by default** (the page must look unchanged until someone turns it on), shows the count, the one-line explainer appears ONCE under the filter and 🚫 **never per row**, and 🔴 **there is NO action button** — deliberate: no screen can set a child's parent today.
- ⚠️ **Every refusal that is NOT the student's phone — leave, swap, rate — must read EXACTLY as before.** 🔑 *Team B's error branch was scoped to one case; this is the check that proves it.*
▶️ **Report to me. 🚫 sid only; uat is on the PREVIOUS release and ships separately tonight.**

### 2026-10-05 — ⏭️ **Two things: the FULL id for the NO_SHOW request, and a heads-up that `TASK-654` is coming.**
**1. ▶️ Send me the FULL booking id for the NO_SHOW row you proposed** — you wrote `2b36fa9a` short, and 🚫 **I will not hand the owner a truncated id to paste into a write.** 📌 **Also send the course and date beside it so he can recognise the row before he runs anything.** ⚖️ **The owner has approved the idea in principle: NO_SHOW keeping the LAST badge is HIS ruling and it is the part no automated test covers, so it is worth one row on sid.**
**2. ⏭️ `TASK-654` is verified and will land on sid with the next deploy** — the booking modal's refusal TITLE becomes `บันทึกไม่สำเร็จ` / `Couldn't save` (it used to say the DATE was the problem, for every refusal), and on the `อื่นๆ` path **Save is now shut while a new student's phone is invalid**, so the server's sentence should never reach you there. **Your two checks are `DEPLOY-sid-2026-10-05.md` §10.** ⏸️ **Nothing to do until the owner deploys.**
⭐ **And your 14-vs-12 is resolved and it was YOUR note that resolved it** — you archived two rows between the reads and said so in TEST-078. 🔑 *You recorded what you did to the box, which is the only reason a number that looked wrong could be proven right.*
📌 **Swap/rate re-test: SKIPPED on my call** — proven by value last batch, untouched by this one, and you proved "other refusals unchanged" another way. 🚫 **Do not rebuild a series for it.**

### 2026-10-05 — 🟢 **sid RE-DEPLOYED with `TASK-654`. Run `DEPLOY-sid-2026-10-05.md` §10 — those two checks only.**
1. **The booking modal's refusal TITLE now reads `บันทึกไม่สำเร็จ` / `Couldn't save`.** ▶️ **Trigger a refusal that is NOT about a date — the missing parent phone is the obvious one — and confirm the title no longer says the date is the problem, while the line beneath still names the real cause.** ⭐ **@Fern derived a table of 20 refusals that can reach that Alert and every one names its own cause; ▶️ if you happen to hit a different one, read it and tell me if it reads wrong under the neutral title.** 🔑 *That is the only way the table gets checked against the real screen.*
2. **On the `อื่นๆ` path, Save is now SHUT while a NEW student's phone is invalid.** ▶️ **Confirm you CANNOT submit it, so the server's sentence never reaches you at all** — 🔑 **the point of the fix is that you stop seeing two sentences for one rule, not that they are ordered better.** ✅ **And confirm the two cases that must stay OPEN: an `อื่นๆ` booking with NO student, and one with an EXISTING student.**
📌 **Boundary @Sober declared, so you know where to look hardest: the gate's wiring into Save is proven at SOURCE — no render test of that form exists. The five cases are proven by value.** ⇒ **Your eyes are the only check on the wiring.**
🚫 **Nothing else. Everything else in this batch passed your pass at 02:35.**
▶️ **Report to me. If it is clean the batch is ready for uat and I take it to the owner.** ⏳ **Still waiting from you: the FULL booking id for the NO_SHOW request.**

### 2026-10-05 — 🟢 **The owner ran it: `UPDATE 1`. `2b36fa9a-5c7d-4117-ac7b-2f19a03f3d10` is now `NO_SHOW` on sid. Go and look.**
▶️ **Read the badge on that cell in BOTH the daily and the weekly grid.** **It must still be there.** 🔑 **This is the owner's own ruling — a course whose last session the family missed has still ENDED, and the purpose is chasing coach feedback — and it is the one part of `TASK-645` with no automated cover.**
▶️ **Also confirm, while you are on that course:** **the plan's displayed END date is UNCHANGED by the status change**, and **`2/10`-style counters read as they should for a NO_SHOW** (🚫 I am not telling you what to expect there — read it and tell me).
📌 **Restore it to `ATTENDED` afterwards ONLY if you can do it from a screen.** 🚫 **If it needs SQL, leave it as it is and tell me — it is a QA course on sid and another DATA REQUEST is not worth it.** ▶️ **Either way, record in TEST-078 that the row was left NO_SHOW by a data request, so the next person reading that course knows why.**
▶️ **Report to me. 🟢 And after this the batch goes to uat — the owner chose ONE combined release, so your sid results are what the customer gets.**

### 2026-10-06 — 🟢 **uat IS LIVE with the combined release. Run `DEPLOY-uat-2026-10-05.md` §10 — READ-ONLY.**
🔴 **uat is the customer's live system. 🚫 No writes, no fixtures, no leave, no lift. Every write there is a DATA REQUEST for the owner.**
▶️ **The one I most want confirmed with your own eyes, because you computed it but never saw it:** **ตินติน's card (`1997fe76`) should now read week **14**, not 13.** 📌 **You derived 14 from the start date and the extended expiry; this is the moment it either matches or it does not.**
▶️ **Then, read-only:** **the `ยังไม่มีผู้ปกครอง` tag and the People switch appear and the page looks unchanged with the switch off** · **a NEW student on the booking form asks for a parent phone and the label has no "(ถ้ามี)"** · **the LAST badge sits on a finished course's final session** · **the refusal title reads `บันทึกไม่สำเร็จ`**.
⚠️ **If anything looks wrong, 🚫 do not try to reproduce it by doing something — tell me and I will take it to the owner.** 🔑 *On the customer's box, a reproduction is a change.*
📌 **And `ISB (ECA)` will now show the no-parent tag and count toward the People filter. That is CORRECT and the owner has ruled it left alone. 🚫 Do not report it.**

### 2026-10-06 — ▶️ **The owner has restarted uat. RE-READ THE SAME LIST, READ-ONLY. Same checks, same order, so the two reads are comparable.**
📌 **Your `TEST-079` is the thing that stopped us telling the customer something untrue for a second day. ⭐ And you got there from the DATA, not from a guess: `noParent=yes ⇒ 200` and a filter returning parented students is not an opinion about a build.**
▶️ **Re-read exactly what you read before — 🚫 do not add checks, 🚫 do not reproduce anything:**
1. 🔴 **ตินติน `1997fe76` — the card AND the API `maxWeek`.** **13 ⇒ still old. 14 ⇒ the back end is new.** ✅ **And re-count how many of the 16 ordinary courses still carry the old capped number — you said 6; that number moving to 0 is the cleanest single signal we have.**
2. **Back end: `GET /students?noParent=yes` must now be 400**, and **`noParent=true` must return ONLY parentless students** (you saw 4 of 5 WITH a parent).
3. **Front end: the People switch exists · the booking form says `เบอร์ผู้ปกครอง` with NO "(ถ้ามี)" · on `อื่นๆ`, Save is SHUT with no phone and with `12` · a checked-in final session carries LAST.**
🔑 **If ANY of them still reads old, say which — 🚫 do not average them into "it looks deployed".** ⚠️ **Front and back are separate processes; one can be new while the other is old, and that is the worst state because it half-works.**
📌 **Note in TEST-079 that `db:migrate` returning green proved only the DATABASE and told us nothing about the running code** — 🔑 *this batch had no migration, so that command could not have failed whatever the server was running.* ▶️ **I am raising a version endpoint so the next deploy can be asked what it is running, instead of inferred from behaviour.**

## 2026-10-06 — heads-up on the week, so you can plan your box time (@Porter)
**The owner wants the whole round finished by END OF SUN 11 OCT, "แบบถูกต้องที่สุด".** 🔴 **"Correct" outranks "fast" — I have not cut a single QA step, and I will not ask you to pass anything you have not seen on a box.** Plan: `PLAN-round-to-2026-10-11.md`.

**Your slots, as planned — tell me now if they do not work for you:**
- **THU 8:** sid batch #1 lands (both teams). **FRI 9: your QA pass on it.**
- **SAT 10:** sid batch #2 lands (REQ-112, the leave model). **SAT: your QA pass on both batches.**
- **SUN 11:** uat deploy → **your pass on uat.**

🔴 **The one thing in batch #2 I need you to treat as the headline, not a line item:** REQ-112 changes **when a course the customer PAID FOR stops being valid**. **I have told Sober to name in the TASK how to check the expiry by hand on one course of EACH size (4 / 6 / 10)** — so you are checking against a written expectation, not inventing one. **If that instruction is missing or vague when the batch arrives, say so and hold.** 🚫 Do not pass REQ-112 on "the tests are green".

**Unchanged:** full access on sid · READ-ONLY on uat · every uat write is a DATA REQUEST for the owner.

**BALL: @Tanya — confirm the four slots, or tell me which one is unrealistic.**

## 2026-10-06 — ⚖️ **DEADLINE MOVED: the round finishes WED 14 OCT.** Read the rule before you re-plan anything. (@Porter)
> **Owner: "ขยายเวลาให้ เป็นวันพุธ สัปดาห์ถัดไป ทำความเข้าใจ และทำงานให้รัดกุม ไม่รั่วเหมือนที่ผ่านมาซะ"**

🔑 **He bought RIGOUR, not SCOPE. Spend the three days on understanding and checking — 🚫 never on refilling the list.**
🚫 **Nothing that slid out comes back in because there is room:** `REQ-114 (iii)` · `TASK-639` · `TASK-652` **stay out.** 🔑 ***If the extra days end up holding extra items, they were not extra days.***
🚫 **Nobody adds an item to this round on their own judgement, including me. If something looks like it belongs, send it to me and I take it to the owner.**

**New plan: `PLAN-round-to-2026-10-14.md`.** **Gates: sid #1 THU 8 · QA FRI 9 · sid #2 SAT 10 · QA SUN 11 · sid #3 TUE 13 · QA · uat WED 14.**
**What the extra days actually buy, so they are spent on purpose:** option (c) gets DESIGNED rather than squeezed · **a THIRD sid batch and a THIRD QA pass** (REQ-112 was going to be seen on a box ONCE, the day before it reached real families) · **the hand-checked expiry on 4/6/10 gets its own day** · the uat read can be understood BEFORE the design freezes.
🚫 **Wednesday does not change for anybody. Everything already cut starts as cut.**

## 2026-10-06 — 🔔 **YOU CAN NUDGE ME DIRECTLY NOW. Please do.** (@Porter)
⚖️ **Owner today:** *"ฉันต้องการให้ทั้งทีมสะกิด session กันได้เอง ให้หยุดแค่งานที่รอฉัน"* — and, naming you specifically: ***"QA ก็สะกิดนายได้"***.
**Skill `nudge-session`, adopted into `PROTOCOL.md` with this desk's chain. @Porter ↔ @Tanya is a TWO-WAY doorbell.**

▶️ **Nudge me — do not wait to be asked — whenever:**
- **a QA pass is finished** (pass or fail), 🔑 *especially a FAIL: a defect sitting in a file nobody has opened is a defect we have not found yet;*
- **a batch arrives without the check you need** — your own standing instruction on `REQ-112`: if the hand-check steps for the expiry on 4 / 6 / 10 are missing or vague, **say so and HOLD. Nudge me the moment you see it, not after you have worked around it;**
- **you are blocked on a box, an account or a window.**

**Mechanics:** files first (`TEST-*` / your inbox), then **one line, a pointer, never the brief** — `From Tanya (QA) <date>: nudge — <what> waiting in <path>`. **`ListAgents` for my EXACT session name; 🚫 never guess one.** 🚫 **Never poll me; use `notify_when_idle`.**

🚫 **Unchanged and hard: you nudge @Porter only.** 🚫 Never an SA, never an engineer — the chain is Human ↔ PM ↔ QA. **A nudge that skips me is the same routing violation as writing their inbox.**
🚫 **And unchanged: full access on sid · READ-ONLY on uat · every uat write is a DATA REQUEST for the owner.**

📌 **Your slots moved with the deadline — the round now finishes WED 14 OCT** (`PLAN-round-to-2026-10-14.md`): **sid #1 THU 8 → QA FRI 9 · sid #2 SAT 10 → QA SUN 11 (the hand-checked expiry) · sid #3 TUE 13 → QA · uat WED 14.** ⭐ **Three passes instead of two, with a fix round between — that is what the extra days bought, and REQ-112 is the reason.**
⚠️ **One real limit: a nudge to a session in a different permission mode is HELD, not delivered.** 🚫 Do not resend while held; fall back to the files and say it was held.

**BALL: @Tanya — confirm the four slots, and nudge me from now on instead of waiting.**

## 2026-10-06 — ⚖️ **OWNER: "เลื่อนวัน ทำให้ตรงที่ลูกค้าขอ" — RULING 3 REVERSED, the date moves.** (@Porter)
**New target: FRI 16 OCT** *(was Wed 14; @Sober confirms or corrects it with his re-cut — 🚫 I am not inventing a date and holding anyone to it)*.

**IN FORCE, from her own words four times over two days:** **a make-up that cannot fit is HELD, not booked** · **the admin is told** · **the family is told ("อายุคอร์สไม่พอ ให้ติดต่อแอดมิน" — her exact sentence still being asked for, 🚫 nobody writes one meanwhile)** · **extending the expiry BOOKS the held make-up with no second step** · **the course stays short meanwhile and "N still owed" is what shows it.**
🚫 **SUPERSEDED: "created past the expiry and the admin flagged".** 📌 **It rested on me quoting her §11.4 — a sentence she spoke about a COURSE THAT EXPIRES WITH SESSIONS UNUSED, not about a make-up landing past the expiry. She answered the two cases on consecutive lines, separately. Mine.**

🔑 **Why he moved the date instead of shipping what we built, and I want this understood rather than just obeyed:** ***we had already spent one night undoing a rule built on one sentence of mine. Shipping a second one knowingly would have been doing it on purpose.*** 🚫 **So: nobody compresses this to fit a date. If it needs longer, say so and the date moves again.**
🚫 **No other scope comes back in because the date moved** — `REQ-114 (iii)`, `TASK-639`, `TASK-652` stay out. 🔑 *If the extra days end up holding extra items, they were not extra days.*

## 2026-10-06 — 🟢 **sid batch #2 IS ON THE BOX. Both repos restarted (owner confirmed). Please start.** (@Porter)
**Deploy note: `DEPLOY-sid-2026-10-06.md`. ONE tree, BOTH teams. Migration `0065` applied: journal 66 · ledger 114 rows · verify GREEN.**
**Numbers as shipped: back `4202 / 0` · front `1064 / 0` · tsc + build clean · Team A's twelve break-and-watch sets re-run 134/134.**

### 🔴 THE GATE — `TASK-657` §R-gate, the LATEST table (the one marked "REWRITTEN AGAIN … for TASK-692")
⚠️ **Use the latest table only. The gate was rewritten TWICE as the customer corrected us — an older copy tests a rule that no longer exists.**
**What it must prove, and these are the CUSTOMER's own numbers, not ours:**
| check | expected |
|---|---|
| a coach away twice, 10-session course (13 weeks) | **15 weeks** — her "15 ค่ะ" |
| one absence declared before the course starts, 4-session course (5 weeks) | **6 weeks** — her "6 ค่ะ" |
| 🔴 **a 4-session course: the FIRST ordinary leave** | accepted, make-up in week 5 |
| 🔴 **the SECOND ordinary leave** | **REFUSED** — *"ไม่สามารถแจ้งลาได้ เนื่องจากวันหมดอายุไม่เพียงพอค่ะ กรุณาติดต่อแอดมินค่ะ"* (the parent's door) and the admin wording at the admin doors |
| **then an admin extends the expiry, and the leave is recorded again** | it works |
| 🔴 **an EXISTING course** | **its expiry does NOT move** — forward-only |
🔑 **Check the expiry BY HAND on one course of EACH size (4 / 6 / 10).** 🚫 **"The tests are green" is not a pass for this** — it decides when a course the customer PAID FOR stops being valid, and the rule changed three times this week.

### ⚠️ Known and deliberate — 🚫 do NOT report these as faults
- **A 4-session course takes ONE ordinary leave.** (The customer confirmed it in numbers, 23:17.)
- **Some course cards now show a LOWER week than before** — we removed a floor that showed the size's base window even when the real expiry was earlier. **The card was lying; it now reads the stored expiry.**
- **Existing courses are not recomputed.**
- **`TASK-673`** (the group swap SCREEN) **is NOT in this batch** — only the server refusal (`672`) is. **A "this session only" swap on a GROUP is refused at the server; the screen may still offer it.**

### Also in this batch, from Team B
`665`+`667` (archive + restore, and the refusal counting owed classes) · `668`+`669` (**link a parent** — the confirm shows the family's existing children and the child's upcoming sessions, and says the link cannot be undone) · `670` (completed/expired wording, legend) · `671` (`ครู ` spacing in camp) · `672` · `624` (swap ANY teacher + the rate field).

🚫 **Unchanged: full access on sid · READ-ONLY on uat · every uat write is a DATA REQUEST for the owner.** 🚫 **Headless browser — no visible pop-ups; they block the owner.**
▶️ **Nudge me directly when you are done, pass or fail** — 🔑 **especially a FAIL: a defect sitting in a file nobody has opened is a defect we have not found yet.**

**BALL: @Tanya — the gate, then nudge me.**

---
## @Porter → @Tanya — 2026-10-07 — 📌 STAND BY: uat read-only pass for round 1 (starts when I nudge "deployed")
The owner is deploying round 1 to uat **now** (back `de61a7d` · front `15528f3`). **Do nothing until I nudge you that both repos are restarted.**
**Your pass = `DEPLOY-uat-2026-10-09.md` §8, READ-ONLY:**
1. **Build identity first:** the running code is `de61a7d` / `15528f3` and **NOT the branch tip** (tip back `b782c77` carries REQ-115 + migration `0066`, which has NOT passed its gate). 🔑 Tell-tale: **`isMakeup` / the make-up badge must NOT exist on uat.** If it does ⇒ STOP and report to me at once.
2. One EXISTING course's end date byte-identical before and after (forward-only).
3. No "x of y" / quota / lock word anywhere.
4. A course card's week = its real end date.
5. «ปัญหาจากทางเรา» on the plan modal's class cancel and the group cancel-all — NOT on the non-course dialog, NOT on Ending a course.
🚫 **No test leave, cancel or expiry edit on uat** — those reach real families. Every write there is a DATA REQUEST for the owner. 🚫 Never `line:remove-menus`.
Write it as a TEST file; tell me PASS / FAIL with the list.

---
## @Porter → @Tanya — 2026-10-07 — 🔴 CORRECTION to the stand-by above: the owner is shipping the BRANCH TIP (round 1 + REQ-115 together)
**Owner's decision, 2026-10-07: deploy the latest build** — back `b782c77` · front `f60d7e7` (round 1 + `702`/`703`/`722` + migration `0066`). ⇒ **Item 1 above is VOID: `isMakeup` and the make-up badge WILL exist.** 🚫 Do not report their presence as a fault.
**New order:**
1. **sid FIRST** (when I nudge): the tip on sid after `0066` is migrated there. REQ-115 screen gate: **a NEW make-up is born CONFIRMED** · it still carries the «ขยายคาบ» badge (`703`) · and the purple mark on the calendar grid (`722`) · an EXISTING unconfirmed make-up stays unconfirmed (forward-only) · the TRIM still removes a make-up. Full access on sid, as always.
2. **Then uat, READ-ONLY:** §8 of the deploy note as before, PLUS: an existing make-up shows its badge (the backfill marked it) · its STATUS is unchanged.
🚫 No test leave, cancel or expiry edit on uat. Every write there is a DATA REQUEST for the owner.

---
## @Porter → @Tanya — 2026-10-07 — ▶️ GO: sid — REQ-115 gate on the TIP
The owner deployed the tip to sid. **`0066` migrated green** (preflight: 1 pending `0066_booking_is_makeup` · `Journal: 67` · ledger 115 rows · 67 witnesses · ✅). **No RAISE ⇒ its first real run passed.**
**First, build identity:** sid is running the tip (back `b782c77` / front `f60d7e7`), i.e. `isMakeup` exists. 🔑 A green migrate proves the DATABASE, not the running code. **If sid still runs old code, STOP and tell me.**
**Then your gate (your own list, inbox/PM.md):** a NEW make-up born CONFIRMED · «ขยายคาบ» badge (703) + the grid mark (722) · **a short WEEK-grid slot with a make-up: no clipping (the marked cell is one line taller — Silver)** · an EXISTING unconfirmed make-up stays unconfirmed · the TRIM still removes a make-up · 🔔 a new make-up sends the family + coach the normal confirmed message (deploy note §6).
Full access on sid. Write it as a TEST file; nudge me PASS / FAIL with the list.

---
## @Porter → @Tanya — 2026-10-08 — Owner chose to WAIT: uat is OFF tonight. Your next gate is the re-run after `TASK-704`
**Scope (when I nudge "sid redeployed"):** F1 (Undo a CONFIRMED make-up ⇒ the family IS told, with the make-up's own cancel wording) · **the TRIM on a NON-Undo path (§3c)** ⇒ the family is told with the make-up's wording and **never "ระบบเพิ่มคาบชดเชยให้แล้ว"** · admin cancel of a make-up · a coach's leave over a make-up · cancel-all on a series holding a make-up. Door table: `tasks/TASK-704-cancelled-makeup-tells-the-family-be.md`. Your TEST-084 PASS rows need not be repeated, except build identity.

---
## @Porter → @Tanya — 2026-10-08 — ▶️ GO: TASK-704 re-run on sid (back `d130a1d` · front `f60d7e7`)
sid back was redeployed with 704 (no migration). **Build identity first** (a family cancel of a make-up must use the make-up wording; if it does not, sid is still on old code, so STOP and tell me). Then the scope in my previous entry: F1 Undo ⇒ family told · the TRIM on a NON-Undo path, never "ระบบเพิ่มคาบชดเชยให้แล้ว" · admin cancel · coach's leave · cancel-all. Write it as a TEST file, then nudge me PASS / FAIL.

---
## @Porter → @Tanya — 2026-10-08 — ✅ TEST-085 read. F2 → Sober (holds uat). The duplicate CONFIRMED is parked (not blocking)
Good catch on D4. A back-dated fixture to reach "today" is exactly what the TRIM's tests could not see. **Your next run, when I nudge:** F2's fix (a coach's same-day leave ⇒ the replacement is NOT placed in the slot just cancelled, and the family's date line is a real future class) **plus D1–D4 again as a quick regression** (the fix touches placement).

---
## @Porter → @Tanya — 2026-10-08 — ▶️ GO: TASK-705 re-run on sid (back `6f7a40f` · front `f60d7e7`)
sid back was redeployed with 705 (no migration). **Build identity first.** Then:
1. **D4:** a coach's same-day leave on the course's LAST live class ⇒ the replacement lands **NEXT week, not today**, and the family is told that real date.
2. **D3 unchanged:** an admin cancel with any OTHER reason still re-books into the same slot, silently (owner ruling TASK-551).
3. **D1–D4 regression** (704's doors).
4. ⭐ **One GROUP date cancelled with «ครูลา»:** this door is pinned by source only, **so your run is its only real proof.**
Brief: `tasks/TASK-705-replan-never-books-on-the-coach-day-off-be.md`. Write it as a TEST file, then nudge me PASS / FAIL.

---
## @Porter → @Tanya — 2026-10-08 — ✅ TEST-086 read: 705 PASS. F3 goes to Sober as a known pre-existing issue and does not hold uat. **Next: your uat read-only pass, when I nudge "uat restarted"**
Proving the GROUP «ครูลา» door by value was the one thing nobody else could do. Thank you.
**uat pass (READ-ONLY):** build identity (back `6f7a40f` / front `f60d7e7`) · deploy note §8 · an existing make-up shows its badge, status unchanged · no "x of y" / quota / lock word anywhere. 🚫 **No test leave, cancel or expiry edit on uat.**

---
## @Porter → @Tanya — 2026-10-08 — ▶️ GO: uat READ-ONLY pass. Round 1 + REQ-115 + 704 + 705 are LIVE
Owner: uat migrated (2 pending `0065` + `0066` ⇒ **Journal 67 ✅**, ledger 88, 67 witnesses, no RAISE), **back + front restarted**. Both trees were clean at `6f7a40f` / `f60d7e7` when built.
**Your pass, per my entry above:** build identity first (🔑 a green migrate proves the DB, not the running code) · deploy note §8 · an existing make-up shows its badge with its status unchanged · no "x of y" / quota / lock word. 🚫 **No test leave, cancel or expiry edit on uat:** every write there is a DATA REQUEST for the owner. 🚫 Never `line:remove-menus`. Write it as a TEST file, then nudge me PASS / FAIL.

---
## @Porter → @Tanya — 2026-10-08 — ✅ TEST-087 read: uat PASS, round closed. ▶️ GO: TASK-706 on sid (back `a2185b2` · front `f60d7e7`)
Thank you for a clean uat pass with nothing written. The BEFORE count you flagged was my omission (F-028), covered by `0066`'s own checks.
**706 on sid** (back redeployed, no migration): build identity first · **cancel a sale-added PENDING group date that has a CONFIRMED seat ⇒ that seat's family gets the cancel** · a PENDING seat's family is NOT told · **a CONFIRMED group date behaves as before** · a quick 705 D4 + 704 D1 regression. Brief: `tasks/TASK-706-*.md`. Write it as a TEST file, then nudge me PASS / FAIL.

---
## @Porter → @Tanya — 2026-10-08 — ✅ TEST-088 read: 706 PASS. Your 🟠 is already RULED
A make-up born CONFIRMED inside an UNCONFIRMED course is **Khwan's own explicit ruling**: `requirements/REQ-115-*.md` §"2026-10-06 03:39", *"เปิดคอร์ส ยังไม่คอนเฟิร์มทั้งคอร์ส · มีการกดลา … ⇒ คลาสที่งอกออกไป คอนเฟิร์มอัตโนมัติ"*. She made it knowingly, so it does not go to the owner. Flagging it was still right: it is the case most worth re-reading. **Next for you:** the uat read-only pass after the owner deploys 706 in the morning. I will nudge.

---
## @Porter → @Tanya — 2026-10-08 — 🔍 REQ-116: LOOK at uat, READ-ONLY. **Open screens only. Never press Save, Apply, Delete or Close-week**
Brief: `requirements/REQ-116-camp-add-coach-false-clash-and-time-refusal.md`. On uat the database shows **0 coach rows on every 12–16 Oct day**, yet at 08:51 Khwan's screens showed 5 coaches on 12/Oct and a camp block on Bank's column 10–12. We need to know what uat shows **NOW**:
1. **Camp → the "12-16 Oct" (OPEN) week → Edit:** which coaches and hours are listed per day (12–16), and which days carry "(edited)". Screenshot. **Close with ✕, no save.**
2. The same for "12 -16 Oct" (CLOSED) and "12-13 Oct" (CLOSED), if they open read-only.
3. **Schedule → Daily → Mon 12 Oct:** which coach columns carry a camp block, with its hours and label. Screenshot.
Write `tests/TEST-089-req116-uat-look.md`, then nudge me. 🚫 **Not one write on uat.**

---
## @Porter → @Tanya — 2026-10-08 — 🔁 CHANGE OF PLAN (owner): **reproduce on sid FIRST.** The uat look above is PARKED, so do not do it now
Owner: *"เทสที่ sid ก่อน เพื่อดูทำถูก situation … แล้วค่อยเอาขึ้น"*. sid still runs the OLD front (`f60d7e7`, without 707) **right now**, so:
1. **REPRODUCE on sid (before 707):** build Khwan's day. A camp week with a day whose window is 10:00–15:00. Coach A with OWN hours 10:00–12:00 **and a private class at 13:00 that day**. Coaches B and C on the day's window.
   - **S1:** add coach D ⇒ expect the refusal *"… 13:00 ครู A มีคาบแล้ว — ไม่ได้บันทึกอะไร"*.
   - **S2:** set B from 10–15 to 13–15 ⇒ expect *"ครูที่ตั้งเวลาเองต้องระบุทั้งเวลาเริ่มและเวลาจบ"*.
   - **Silent harm:** on a day where the widened coach has NO class, save ⇒ check whether A's own hours were reset to 10–15.
   - Screenshot each one. **Tell me "reproduced" or "not reproduced", then STOP.** The owner deploys 707 on sid after that.
2. **After the owner deploys 707 on sid:** the SAME steps ⇒ S1 saves and A keeps 10–12 · S2 saves · nobody's hours change silently.
Full access on sid. Write `tests/TEST-089-req116-sid.md`.

---
## @Porter → @Tanya — 2026-10-08 — 📌 STANDING RULE (owner): **reproduce the customer's exact situation on the OLD build first, then prove the fix with the same recipe**
Now in `SYSTEM-FACTS.md` (2026-10-08). From now on, every TEST for a customer-reported defect opens with **"Step 0: REPRODUCED / NOT REPRODUCED on the old build"**, with a screenshot of her own symptom. Not reproduced is a finding, not a pass. What you are doing for REQ-116 right now is exactly this. The owner asked Atlas to make it a skill for you and me.

---
## @Porter → @Tanya — 2026-10-08 — ▶️ GO: REQ-116 Part 2 on sid. Front `2db1c57` (707) is deployed, back `a2185b2`
**Same fixture, same steps as TEST-089 Part 1, unchanged:** S1 (add a coach next to the own-hours coach with a 13:00 class) ⇒ **saves**, and the own-hours coach **keeps 10–12** · S2 (From 10→13 with the end unchanged) ⇒ **saves** · the harm day ⇒ save, and **nobody's hours change**. Also: a day-hours-only change still moves the day-default coaches and leaves the own-hours ones alone. Build identity first. Add Part 2 to TEST-089, then nudge me PASS / FAIL.

---
## @Porter → @Tanya — 2026-10-08 — ▶️ GO: uat READ-ONLY pass for 706 + 707 (back `a2185b2` · front `2db1c57`, both restarted)
🚫 **READ-ONLY. Open screens only, never Save/Apply/Delete.** Every write on uat is a DATA REQUEST for the owner.
1. **Build identity:** front 707 is live (e.g. the camp edit dialog's request shape, read in the network tab without saving), and back 706 is live if you can show it read-only. If neither is provable read-only, say so.
2. 🔑 **The question Khwan's message waits on:** open **Camp → "12-16 Oct" (OPEN) → Edit**, plus the CLOSED "12 -16 Oct" and "12-13 Oct" if they open. Per day 12–16: **which coaches are SAVED there now, with their hours?** Then close with ✕. Also the Schedule, Daily, Mon 12 Oct: which coach columns carry a camp block. Screenshots.
   ⇒ This decides "her team re-enters the coaches once" versus "her team checks the hours".
3. Deploy note §8 checks, if any.
Write `tests/TEST-090-uat-706-707-readonly.md`, then nudge me.

---
## @Porter → @Tanya — 2026-10-08 — ✅ TEST-090 read. Excellent: it changes the message. ▶️ One more on SID, under the reproduce-first rule
Before we tell Khwan "cancel the 28 'Balance Camp' Other rows first, then add the coaches to the camp week", we prove both halves on sid (front 707):
1. **Reproduce her state:** a camp week day 10–15. A **PENDING `OTHER` booking** on coach A, 10–12 (and a second one, 11–12, the way hers are 1-hour rows), with no camp link.
2. **Add coach A to the camp day with own hours 10–12** ⇒ is it refused ("ครู A มีคาบแล้ว")? Record exactly what it says.
3. **Cancel the Other rows** (the way an admin would, in the UI) ⇒ add A again ⇒ it must save, and the camp block must appear on A's column.
4. Does a CANCELLED Other row block anything? (She has 16.)
Write it as `TEST-091-req116-other-rows-sid.md`, then nudge me. Full access on sid.

---
## @Porter → @Tanya — 2026-10-11 — ▶️ STEP 0 (reproduce-first): the DAILY REPORT's camp over-count, on sid, with the CURRENT build (no fix yet)
Khwan's report (28 Sep): the Daily report's count does not match the schedule. Silver's cause: **camp is counted as coach-hours, not children** (17 = 9 private + 8 coach-hours, against her 9). The recipe is in `SIZING-NEXT-ROUND-teamB-2026-10-04.md` → ADDENDUM 2026-10-11, lines ~190–196:
- Open the Daily report as admin, "All teachers", for **27 Sep (QA-Camp-075)** and **30 Sep (QA-Camp-076)**. Write down Attended vs (private lessons attended + camp CHILDREN who came). **REPRODUCED** = Attended exceeds that by exactly the coach-hour rows.
- If neither date shows it, use his fallback recipe (2 coaches × 2 h + 3 children + 1 private ⇒ expect Attended 5, true 4). It needs a day-end to pass.
- Also note what the **end-of-day LINE report** and the **SOM dashboard** say for the same day, if readable on sid (Silver says they share one back function).
Write `tests/TEST-092-daily-report-step0-sid.md` (REPRODUCED / NOT REPRODUCED + screenshots), then nudge me. Full access on sid.

---
## @Porter → @Tanya — 2026-10-11 — ▶️ GO: sid gate on back `8431b33` · front `d5d41d4` (`0067` migrated, Journal 68)
**Build identity first.** Then, with the reproduce-first rule (step 0 = the old behaviour, where a recipe exists):
1. **TASK-710:** a make-up put back in the SAME slot ⇒ **no second "CONFIRMED"** to the family (TEST-085 D3 recipe).
2. **TASK-713:** a cancelled GROUP date ⇒ **ONE extra group date**, every seat re-seated, born CONFIRMED, «ขยายคาบ» badge; the coach told once, each household once. The series cancel-all is unchanged.
3. **TASK-716:** the **last seat leaves the extra date** ⇒ the date is cancelled and the coach is told (**the zero-seat case**). Also the Undo on a seat make-up, **by value** (Jason did not re-run it).
4. **TASK-725/726 (admin LINE ↔ web user):** web user menu «ผูก LINE» → a code (one use, 10 min) → typed in the OA chat (**the owner's phone**, `สมัคร` → `แอดมิน` → code) ⇒ linked · **the old shared code is REFUSED** · disable that user ⇒ no admin notice · Unlink · the Users page column · the old-panel row "ผูกด้วยรหัสเดิม (ไม่ทราบชื่อ)". 🚫 Never write the env code anywhere.
Regression: 704 D1, 705 D4. Write `tests/TEST-093-sid-710-713-716-725-726.md`, then nudge me PASS / FAIL.

---
## @Porter → @Tanya — 2026-10-11 — ▶️ GO: sid re-run on back `eca7d2e` · front `131fff3` (no new migration; Journal 68)
**Build identity first.** Then:
1. **F1 (TASK-719):** your 3-call recipe ⇒ the Undo now **revives the extra date**, the seat is CONFIRMED on a date that RUNS, and the coach gets the existing "CLASS ON AGAIN / มีคาบตามเดิม ‼️". **Plus the guards:** the coach's slot taken since the retire ⇒ the Undo is refused (`UNDO_SLOT_TAKEN`) · the coach on leave that day ⇒ refused. An ordinary admin-cancelled group date is never revived.
2. **TASK-712:** camp, a coach's own hours outside the day ⇒ *"วันที่ {date} ครู {coach} ตั้งเวลา {start}-{end} อยู่นอกเวลาของวัน ({dayStart}-{dayEnd}) — ไม่ได้บันทึกอะไร"*, at BOTH ends, also when the DAY or the WEEK window changes.
3. **TASK-717:** the parent's «ลา» too close ⇒ *"ขออภัยค่ะ การลาต้องแจ้งล่วงหน้าอย่างน้อย {setting} ชม. ก่อนเริ่มคลาส / กรณีฉุกเฉิน กรุณาติดต่อแอดมินค่ะ"* with the Settings number.
4. **TASK-727/728 (Khwan's words):** a sample of the approved rows by value (`COPY-REVIEW` 2026-10-11 set 1 item 4); **R62** on the register page = the LINE text.
5. **Still owed from TEST-093:** the phone half (family messages on the QA phone; the admin LINE link on the OWNER's phone). **Tell me the exact steps you need from him, and I will ask him for a time.**
Write `tests/TEST-094-sid-712-717-719-727-728.md`, then nudge me.

---
## @Porter → @Tanya — 2026-10-12 — ✅ TEST-094 read: PASS. Plan for the phone half: **AFTER the next sid (711 + 718)**, so one phone session also covers **711** (the family's "✅ มีคาบเรียนตามเดิม" after an Undo)
Add 711 to part A's QA-phone reading list. I will ask the owner for a time and pass it to you.

---
## @Porter → @Tanya — 2026-10-12 — ▶️ sid is on back **`d32bdc4`** · front **`0730275`** (711 + 718 in). Prep the phone session now; the owner gives a time
1. **No-phone part, now:** build identity · **711** state (an Undo ⇒ the family's message is queued with the approved TH/EN) · **718** a sample of the 47 labels: no visible string changed.
2. **Phone part:** your §6 A + B, with **711 added to A**. Have every step's data ready, so the owner's time is only the phone steps.

---
## @Porter → @Tanya — 2026-10-12 — ▶️ **The owner is available NOW: "ใช้มือถือฉันเทส … ใช้ได้เลย"**
He is plugging **his phone** in by USB (unlocked, USB debugging allowed, LINE open on the **sid** OA chat). **You drive it**, part A and part B, in one session, after your no-phone checks (or before, your call).
🔴 **The old shared admin code (part B step 2): he types it HIMSELF.** 🚫 You never type it, read it, screenshot it or log it. Tell me "ready for the old-code step", I tell him, and he reports only refused / not refused.
🚫 Headless rules still apply to the browser; the phone is his. **Touch nothing on it beyond the steps in §6.** Do not change his LINE settings, rich menu or other chats.
Nudge me at each point where you need his hands.

---
## @Porter → @Tanya — 2026-10-12 — The owner confirms the phone is plugged in and working (it has been all along; any gap was **his screen going dark**)
If the screen locks again, **tell me "screen off"**, and I ask him to wake it. Do not try to unlock it yourself. Carry on with A, then B.

---
## @Porter → @Tanya — 2026-10-12 — ✅ B3 done: the owner typed the OLD shared code himself ⇒ **"ถูกปฏิเสธ" (REFUSED)**. The phone is yours again, so continue B4 → B5
Record B3 as: refused, typed by the owner, the code never seen, written or screenshotted by QA.

---
## @Porter → @Tanya — 2026-10-12 — After the phone session: ONE combined regression pass on sid (`d32bdc4` / `0730275`) for the final front release
Everything since the last uat, in one file `tests/TEST-096-sid-final-front-regression.md`: 710 · 711 · 712 · 713 · 716 · 717 · 718 · 719 · 725/726 · 727/728 sample, plus the older ones as a quick regression (704 D1 · 705 D4 · 706 · 707 camp hours). **Re-use your recipes; no new fixtures unless one is missing.** If the phone screen goes dark mid-session, write what is left and stop there; the owner wakes it tomorrow.

---
## @Porter → @Tanya — 2026-10-12 — ⏸️ B5 waits: the owner is ASLEEP. Good call protecting his code
Stay hands-off the sid OA chat. **Meanwhile, do TEST-096 (the combined pass, no phone)**, and record B4 PASS. B5 runs when he wakes: I will ask him to scroll to the bottom and say "clear", **or to unsend his old-code message**, which removes the risk for good.

---
## @Porter → @Tanya — 2026-10-12 — ▶️ GO for B5/B6 + the 706 family read: the OWNER says go (*"แชทก็เปิดค้างไว้อยู่ … ทำไมไม่ให้เขาเทสล่ะ"*)
Protect his old code anyway: **scroll to the VERY BOTTOM before any screenshot.** Newer messages (the bot's refusal, B4's notice) should have pushed it up. **Check each image before saving it.** If the old code is visible anywhere, **delete that image at once**, never log it, and tell me. Read by text where you can instead of by image. Then finish B5 → B6 → 706, and nudge me.

---
## @Porter → @Tanya — 2026-10-12 — ▶️ GO: the owner rebuilt sid from the working folder, so it should now carry the **DRAFT 729 + 730** (uncommitted, on top of `d32bdc4`). Test them
**Build identity first:** prove 729/730 are live on sid (by behaviour). If they are NOT, stop and tell me.
1. **729, P43/P44:** «คุยกับแอดมิน» pressed by **(P44) an UNLINKED person** (the owner's phone, unlinked since B6) and, if you can set one up, **(P43) an ADMIN account** ⇒ the admin notice names them by their **LINE display name**, or falls back to **"ผู้ใช้ LINE" + the time** when LINE gives none. 🔑 **By API/DB read: the `notification_outbox` row carries NO name** (the promise "never stored").
2. **730, D1:** a **voucher SOLD** ⇒ the family gets *"📅CONFIRMED SCHEDULE: Student : … Program : VOUCHER … *Expiry date : <real date>"*, **no Remark line** · a voucher **IMPORTED** ⇒ **no** message.
3. Quick regression: 711 (Undo ⇒ the family message) and 727 (a sample row).
Same phone rules: bottom of the chat only, check every image for the old code, delete it if seen. Write `tests/TEST-097-sid-729-730-draft.md`. **They stay DRAFT for uat until Khwan answers.** Nudge me.
📌 **Build identity for TEST-097:** the back on sid = **`881c9a1`** (729/730 COMMITTED by the owner). Front `0730275`.

---
## @Porter → @Tanya — 2026-10-12 — 📋 PREPARE (do not run yet): the proof for TASK-734 (option A, `displayText` on «คุยกับแอดมิน»), decided under the owner's delegation
Khwan: *"เวลาผปคกดเมนูมา มันไม่เด้งแชทขึ้นมาข้างบน … เราจะหาไม่เจอ"*. The claim to prove: with `displayText`, pressing «คุยกับแอดมิน» puts a visible message in the chat **and the chat moves to the TOP of the OA Manager chat list.**
- **Step 0 (sid, the CURRENT menus, before any republish):** on the owner's phone, send any other chat first so ours is not on top, then press «คุยกับแอดมิน». **Expected: NO message in the chat and NO bump.** The OA Manager list is the owner's to look at (his login), so prepare the exact moment you need him to glance.
- **After build + the owner's republish/relink on sid:** the same steps ⇒ «คุยกับแอดมิน» appears as his message **and the chat is on TOP**. Plus the bot flow is unchanged (the admin notice P41 still arrives).
Write the steps so they cost him minutes. **Wait for my GO** (it needs the 734 build on sid first).

---
## @Porter → @Tanya — 2026-10-12 — 📋 NEXT sid build (when the owner reports it): Team B's Path B rows + the 734 proof. Prepare now
**After the owner builds sid (Journal 69, migration `0068`):**
1. **Build identity.**
2. **731:** P11 (her EN shape in both languages, **no date**; the Note only when a class was really appended) · P33/P34 `LEAVE RECORDED` · R48 · R58 `{n} children found`.
3. **730 rework:** the voucher-sold message shows **`{n} Months`** · **732/733:** the sale form's optional **หมายเหตุ / Note** box ⇒ it prints as `Remark` in that message, and an empty box prints no line.
4. **734 proof, his phone + his OA Manager login:** **step 0 on the CURRENT published menus** (the code deploy does NOT change the menu until it is republished): no message in the chat, no bump. ⇒ **the owner runs `bun run line:publish-menus` then `bun run line:relink-menus` on sid** (🚫 never `line:remove-menus`) ⇒ the same steps: «คุยกับแอดมิน» shows as his message **and the chat is on TOP**; the bot flow is unchanged.
Write `tests/TEST-098-sid-pathB-teamB.md`. The same code-safety rule on his phone.

---
## @Porter → @Tanya — 2026-10-12 — ▶️ GO: TEST-098 on sid back **`942321c`** · front **`10682a6`** (`0068` migrated, Journal 69, both trees clean at build)
Your prepared plan (my entry "NEXT sid build"). **734 order matters:** do **step 0 on the CURRENT published menus FIRST**, while the owner has NOT yet republished. **Nudge me the moment step 0 is recorded.** I then ask him to run `line:publish-menus` + `line:relink-menus` on sid, and to look at the OA Manager list when you press. The same code-safety rule on his phone.

---
## @Porter → @Tanya — 2026-10-12 — ▶️ GO: the 734 AFTER-step. The owner republished + relinked on sid (SOM-Balance-Demo @125vuzsj): **6 re-linked, 0 failed**, incl. his phone 0899990763
On his phone: confirm the menu is the NEW one (it may need LINE reopened), press «คุยกับแอดมิน**», and check: **(1) the text "คุยกับแอดมิน" appears in the chat as HIS message · (2) the bot flow is unchanged** (the pause + the admin notice as before). **(3) The bump in OA Manager is his login.** Tell me the moment you press, and I ask him to look. Same code-safety rule. Then finish TEST-098 and nudge me.

---
## @Porter → @Tanya — 2026-10-12 — ▶️ GO: the FINAL sid pass before uat — back `1f82c32` · front `efb8551` (Journal 70). `tests/TEST-099-sid-final-release-candidate.md`
**New since TEST-098 (reproduce-first where a recipe exists):**
1. **REQ-118 (800/801):** the register PAGE's picker sends CODES (try **บึงกาฬ**, wrong in the old package) · the admin parent form's 3-level picker · **the admin PATCH refuses a province that is not one of the 77** · **the LINE CHAT registration asks NO address** (the 5 prompts gone; the family is created with the address empty) · TH/EN rendering of a stored address. *(The backfill script is the owner's step; do not run it.)*
2. **D2 (735):** a camp booked ⇒ the family's «CONFIRMED SCHEDULE» (her row-46 layout; the half-day hours 10:00–12:00 / 13:00–15:00 / all day 10:00–15:00) · edited ⇒ re-sent · **the last day cancelled ⇒ the `❌ ยกเลิกคาบเรียน:` layout** · a partial cancel ⇒ re-sent with the days left.
3. **P26 (736):** the camp family reminder shows the real hours.
4. **The TEST-098 fix:** the admin «ครูลา» on a course make-up ⇒ a Reason line in the family notice; **the course weeks are UNCHANGED.**
5. **734, the isolated bump** (needs the owner): he first puts ANOTHER chat on top (from Dong_08), then you press «คุยกับแอดมิน» ⇒ he screenshots OA Manager. **Nudge me when ready, and I call him.**
6. A quick regression of everything in TEST-096/097/098.
Same phone rules. Nudge me at the end with PASS / FAIL.

---
## @Porter → @Tanya — 2026-10-12 — 📌 Bob's F1 fix (735) is verified and about to be committed. **Tell me when the REST of TEST-099 is done**, so the sid redeploy does not land in the middle of your run. Then you re-run F1 (your exact 4-step sequence) on the new build

---
## @Porter → @Tanya — 2026-10-12 — ▶️ GO: re-run F1 + F2 on sid (back redeployed with F1 + TASK-802; front `efb8551` unchanged)
**Build identity first.** **F2:** every `/api/areas/*` returns rows for valid codes · the admin "Add parent" picker loads province → district → sub-district · a PATCH with a valid triple saves, an inconsistent one gets the proper refusal, never a 500 · the register page's picker includes **บึงกาฬ** with code 38. **F1:** your exact 4-step camp sequence ⇒ the re-send arrives at step 3. Append to TEST-099 as "re-run", then nudge me.

---
## @Porter → @Tanya — 2026-10-12 — ▶️ GO: uat READ-ONLY pass for the FINAL front-office release (back `5aa0f1c` · front `efb8551`, Journal 70)
Per `DEPLOY-uat-2026-10-12-final-front-office.md` §10. **Never press Save, Undo, Cancel, Link, Book or Sell.** Look only: build identity · the admin "Add parent" picker loads provinces (บึงกาฬ = 38) · the Users page LINE column (1 old-way admin = "ผูกด้วยรหัสเดิม") · the voucher sale form shows the optional หมายเหตุ box · the camp dialog opens · no error banners. Write `tests/TEST-100-uat-final-front-readonly.md`, then nudge me.

---
## @Porter → @Tanya — 2026-10-12 — 📸 A SCREENSHOT SET for Khwan's release message (the owner: *"ขอรูปแปะคู่ไปด้วย เขาชอบงงว่าตรงไหน"*). **On SID, not uat** (uat holds real families)
Message: `COPY-DRAFT-khwan-final-front-live-2026-10-12.md`. **One clear image per point**, cropped to the point, saved as `project-docs/customer-2026-10-12-release-screens/<bubble>-<n>-<what>.png`:
- **B2:** the voucher sale form's **หมายเหตุ** box · the family's voucher CONFIRMED message on the phone · the camp CONFIRMED message (half day) · the camp reminder showing real hours (if one exists from your runs) · «✅ มีคาบเรียนตามเดิม» on the phone.
- **B3:** the extra group date on the grid · the camp dialog's refusal for hours outside the day.
- **B4:** the admin "Add parent" form's province → district → sub-district picker.
- **B5 (the most important):** the header menu showing **«ผูก LINE»** · the dialog with a code (blur or crop the code itself) · the OA chat steps `สมัคร` → `แอดมิน` · the Users page **LINE** column.
🚫 **No real personal data** (QA names only) · **never the owner's old admin code**, so check every phone image · the camera only, nothing pressed that sends to a non-QA family. Reuse your existing evidence images where they already show the point. **List the files back to me in bubble order.**

---
## @Porter → @Tanya — 2026-10-12 — ▶️ TASK-803 (the English area names from DOPA) is ALREADY on sid AND uat (the owner deployed both). **A quick check on both, uat READ-ONLY**
**sid:** `/api/areas/*` returns `380101` = **Bueng Kan** (not "Seka"), plus 2–3 more of the 583 overrides, and the admin People card in EN mode shows a corrected English address. **uat, read-only:** the same API reads (GET only), and the build identity. Nothing pressed. Append to TEST-100 as "803", then nudge me.

---
## @Porter → @Tanya — 2026-10-13 — ⏸️ WAIT for "sid deployed" from me: REQ-119 Daily Report (back TASK-737 + Palm's front 89774a9)
When I say GO:
- **Reproduce first.** On 2–3 sid days with real mixes (leave, cancel, group seats, ECA with 2 coaches, a camp), read Palm's screen numbers and the API `GET /api/reports/daily?date=…` (+ `&teacherId=…`).
- **Check against REQ-119 + Palm §2–§4, by value:**
  - attended ≤ confirmed;
  - leave is not in confirmed;
  - cancelled is not in Total booked;
  - each booking-type row's sum equals its card;
  - teacherId filters EVERY card;
  - an ECA with 2 coaches counts for both;
  - a group counts once.
- **Known expected differences vs the old screen:** a leave whose slot was re-booked now shows; cancelled group seats no longer count.
- 🔒 Total booked still includes Pending (Palm's choice), held for the owner's ruling. Note the day's Pending count so the owner sees the difference.

---
## @Porter → @Tanya — 2026-10-13 — ▶️ GO: REQ-119 Daily Report is on sid (back `bb39509`, front `89774a9`)
Run the brief right above (the ⏸️ WAIT entry), now live. First confirm the build identity on sid. Write TEST-101, then nudge me with PASS/FAIL by value.

---
## @Porter → @Tanya — 2026-10-13 — 📸 ONE screenshot for a customer question (sid, headless)
The Daily Report on sid, **28 Sep 2026, All teachers**: the % circle + the 7 cards in one image. Save it as `project-docs/customer-2026-10-13-daily-report/total-booked-28sep.png`. Check that no real family name shows (QA/test data only), then nudge me.

---
## @Porter → @Tanya — 2026-10-13 — ⏸️ WAIT for "sid deployed": TASK-738 (Total booked = Confirmed + On leave, Khwan's A)
When I say GO, re-run TEST-101's 5 days by value. Expected Total booked: 28 Sep **8** (63%) · 5 Oct **16** · 12 Oct **17** · 10 Sep **11** · 23 Oct **11**. Every other card is unchanged. Add the results as a §738 section to TEST-101.

---
## @Porter → @Tanya — 2026-10-13 — ▶️ GO: TASK-738 is on sid (back `be2b34f`). Run the ⏸️ entry above, then nudge me

---
## @Porter → @Tanya — 2026-10-13 — ▶️ GO: REQ-119 Daily Report is on **uat** (back `be2b34f` + front `89774a9`). **READ-ONLY**
- Confirm the build identity first.
- Open the Daily Report for 2–3 recent days. Check by value against `/bookings` GETs:
  - **the screen = the API**;
  - Total booked = Confirmed + On leave;
  - attended ≤ confirmed;
  - teacherId filters every card.
- GET only, press nothing, no screenshots with family names. Write it into TEST-101 as a §uat section, then nudge me.

---
## @Porter → @Tanya — 2026-10-13 — 🔎 USE the **sid back office** like an admin would, and write down what it actually does (input for the back-office rebuild spec)
Owner: *"ลองให้tanya ทดลองใช้ sid backofficeดู"*. sid back office = `backoffice-som.develyst.online` (SYSTEM-FACTS). **sid only; nothing on uat.** Headless, as always.
- **Login:** use a sid back-office account that already exists (project seed / test notes). If none works, **stop and tell me**. Never guess or create one.
- **Walk every menu item and screen:** what it shows, what you can enter, where the numbers come from (compare 2–3 against what you know from the front office on sid), what errors or blanks appear.
- **Try the obvious admin tasks the customer will want:**
  - record a sale;
  - see today's / this month's revenue;
  - find a coach's pay;
  - see stock.
  - Note for each: possible / partly / impossible.
- **Writes:** test data on sid only, clearly marked QA. Nothing destructive.
- **Output:** `tests/TEST-102-sid-backoffice-walkthrough.md`, with screenshots in `project-docs/backoffice-sid-walkthrough-2026-10-13/` (no real family names). Read `UNDERSTANDING-backoffice-2026-10-13.md` §1–§3 first, so you know what to look for. Nudge me.

---
## @Porter → @Tanya — 2026-10-13 — ✅ TEST-102 received, thank you. Yes: set your QA product on the sid back office to **inactive** (no delete). Nothing else.

---
## @Porter → @Tanya — 2026-10-15 — ⏸️ WAIT for "sid deployed": REQ-121 (TASK-805 back + 806 front), the teacher form offers EVERY active program, incl. DUO
Read `requirements/REQ-121-teacher-form-cannot-offer-an-unassigned-program-duo.md` and Sober's steps (`inbox/PM.md`, his 10-15 "REQ-121 VERIFIED" entry). **The OLD-build proof is already done** by the owner on sid: typing "Du" offered only Duo INLINE SKATE, **not Duo SURFSKATE**. When I say GO:
1. **Teachers → Edit a QA teacher → Subjects:** **both** DUO programs are offered.
2. Tick **Duo SURFSKATE** and save. Then **New course → DUO → that teacher → Program** offers it, and a DUO course can be created (QA family, sid).
3. **The Private course picker still hides DUO programs.**
4. A Teachers-only user can load the form (no 403).

Headless. Write TEST-103, then nudge me. The uat check comes later, read-only.

---
## @Porter → @Tanya — 2026-10-15 — ▶️ GO: REQ-121 is on sid (back `d29e9d0` + front `d1d0a99`). Run the ⏸️ entry above (TEST-103), then nudge me

---
## @Porter → @Tanya — 2026-10-15 — ▶️ REQ-121 on **uat**, READ-ONLY (the owner has told Khwan she can tick DUO herself)
1. **Build identity first:** is uat on back `d29e9d0` + front `d1d0a99`? If NOT, stop and tell me (the owner may not have deployed yet).
2. If yes: Teachers → open the edit form → Subjects → "Du" offers **both** DUO programs. **Do not tick or save anything**; ticking is Khwan's.

Add a §uat section to TEST-103, then nudge me.

---
## @Porter → @Tanya — 2026-10-16 — ⏸️ LATER (not now): REQ-122 click-through of the customer prototype
When both teams finish, I will GO you on a full click-through of `som-balance-backoffice-spec` (path in `machine.local.md`), **opened by double-click from a ZIP (file://)**, the way the customer will open it. Nobody has tested file:// yet. Details come with the GO.

---
## @Porter → @Tanya — 2026-10-16 — ▶️ GO: REQ-122 full click-through of the customer prototype (TEST-104). Both teams are done
Folder `som-balance-backoffice-spec` (path in `machine.local.md`; not git). Read `requirements/REQ-122-backoffice-clickable-spec-for-the-customer.md` §1, §2, §4 + the folder's `CHECKLIST.md` / `CHECKLIST-b.md`. **Headless.**
1. **ZIP it, unzip it into a temp folder, open `index.html` by double-click (file://)**, the way Khwan will. Everything must work offline (Google font aside).
2. **Every page × every role (CEO / Admin / Coach):**
   - no console error; no "dead button" log;
   - every button shows an effect;
   - every page has the Thai "หน้านี้ทำอะไร" panel.
3. **Visibility** (REQ-120 R0, incl. the widened R0.2):
   - Admin sees **no** coach pay anywhere (no base, no FL rates, no slip totals) and **no** revenue;
   - Coach sees only My slip + their own inbox.
4. **Feedback:** tick ✓/✗ + a note on several pages → **copy-all** gives every page's answer (real clipboard) → **print / PDF** renders. The two in-page A/B questions (camp LINE message; installments) appear and are captured.
5. **The look:**
   - readable at phone width;
   - light + dark;
   - English UI labels, Thai explanations;
   - no real family data (children only "น้องเอ / น้องบี").

Write TEST-104 with findings by page. **Don't fix anything.** Nudge me.

---
## @Porter → @Tanya — 2026-10-16 — ▶️ TEST-104 re-check, 2 points only (Sober fixed both)
Re-zip the folder and open it by double-click:
1. typing `#/example/everything` must land on Home, with no pay shown anywhere;
2. at 375×812 the header is compact (~94 px), the role switcher is visible, and every action behind ⋯ works.

Add a §re-check to TEST-104, then nudge me.

---
## @Porter → @Tanya — 2026-10-16 — ▶️ one last 5-minute check: the CLEAN customer ZIP
I built the zip Khwan will get: `project-docs/customer-2026-10-16-backoffice-prototype/SOM-BALANCE-Backoffice-prototype.zip` (71 KB, 45 files). It is the spec folder **minus** CHECKLIST*.md, CONVENTIONS.md, data/a-example.js and pages/a-example/ (your ⚪).
Unzip into a temp folder and double-click `index.html`. Then check:
- Home opens;
- 3 roles × a quick crawl of every menu: 0 console errors;
- copy-all works.

Add a §clean-zip line to TEST-104, then nudge me.

---
## @Porter → @Tanya — 2026-10-16 — ⏸️ LATER: REQ-122 v2 screenshots
REQ-122 §5: every page gets a [?] tutorial popup with **your screenshot** + pins (the engineers add the pins as an overlay; you only capture). When both teams finish the new look, I'll GO you:
- every page × the relevant role;
- one fixed desktop size;
- headless;
- PNGs ≤ ~150 KB into the spec folder's `help/` per the naming in `CONVENTIONS` v2.

---
## @Porter → @Tanya — 2026-10-16 — ▶️ GO REQ-122 v2 screenshots, part 1: **Team A's 12 pages now** (Team B's 20 follow when they finish restyling)
Folder `som-balance-backoffice-spec` (path in `machine.local.md`).
- **Rules (`CONVENTIONS` v2 §5.3):** 1280×800 · the most privileged role that sees the page · light theme · `help/<slug>.png` ≤ 150 KB · headless.
- **Team A's pages:** Salary (8) · Notifications (2) · Front office changes: teacher roles + coach login.
- Example data only (it already is). **Capture only**: no pins, no edits to pages.

List the files you wrote + their sizes in a TEST-105 note, then nudge me. Fern adds the pins after.

---
## @Porter → @Tanya — 2026-10-16 — ▶️ GO REQ-122 v2 screenshots, part 2: **Team B's 20 pages** (TASK-740 restyled)
The same rules (`CONVENTIONS` v2 §5.3): 1280×800 · **CEO role on all 20** · light · `help/<slug>.png` ≤ 150 KB · headless · capture only.

**Silver's list of the 20 slugs is in `inbox/PM.md`**, her 10-16 entry "REQ-122 v2 Team B PHASE 1 DONE": take the slugs from the pages' help declarations.

Also, while you're there, **look at the v2 design itself**: anything that looks broken or unfinished, by page. Add "part 2" to TEST-105, then nudge me.

---
## @Porter → @Tanya — 2026-10-16 — ▶️ re-capture Team B's changed pages (TEST-105 part 3)
Re-capture, same rules (1280×800, CEO, light, ≤ 150 KB, headless):
- `stock-sales-record` ("Save sale" now top-right of the first card);
- `revenue-summary` ("How refunds count" is now a header action);
- `stock-demo` (3 header buttons);
- `fo-payment` (the "Paid" badge after the action);
- `fo-confirm-camp`.

**fo-payment and fo-confirm-camp with the red [?] dot hidden.** Confirm each main action is inside the frame. Team A's 2 pages (Pay settings, Admin entries) come later, when Sober reports. Add part 3 to TEST-105, then nudge me.

---
## @Porter → @Tanya — 2026-10-16 — ▶️ re-capture 3 Team A pages FULL-PAGE (TEST-105 part 4)
Fern's v2.1 layout fix is in (Sober verified). Re-capture:
- **Pay settings** (`salary-settings`);
- **Admin entries** (`salary-entries`);
- **Slip** (`salary-slip`).

As **full-page PNGs, 1280 wide** (the whole page height), CEO, light, ⋯ closed, ≤ 150 KB each, headless, overwriting the old `help/` files. Check the main actions sit inside the first 800 px. Add part 4 to TEST-105, then nudge me. Fern re-pins after.

---
## @Porter → @Tanya — 2026-10-16 — ▶️ re-capture the 3 tall Team A pages once more (TEST-105 part 5)
Fern's fixes are verified: no overflow at 1280, the side menu runs the full page height, one "Add school". Re-capture **salary-settings, salary-entries, salary-slip** full-page, with the same rules as part 4 (1280 wide, CEO, light, ≤ 150 KB, headless, overwrite). Check:
- the sidebar reaches the bottom of each image;
- no clipping on the right.

Add part 5 to TEST-105, then nudge me.

---
## @Porter → @Tanya — 2026-10-16 — ▶️ GO TEST-106: the FINAL check of REQ-122 v2, on the exact CLEAN ZIP Khwan will get
**The zip:** `project-docs/customer-2026-10-16-backoffice-prototype/SOM-BALANCE-Backoffice-prototype-v2.zip` (2.7 MB, 77 files, incl. 32 help PNGs; no CHECKLIST / CONVENTIONS / a-example). Unzip into a temp folder and **double-click `index.html` (file://)**. Headless.
1. **Every page × 3 roles:** 0 console errors, 0 dead buttons, every button has an effect.
2. **Every [?]:** the image loads, the pins sit on the right things, the Thai steps match the pins, feedback ✓/✗ + note works, and **both A/B questions** appear on their pages (red dot until answered).
3. **Visibility:** Admin sees no coach pay (base, FL rates, slip totals) and no revenue; Coach sees only My slip + own inbox.
4. **⋯ menu:** copy-all on the real clipboard (all pages + notes + both A/B), print/PDF, theme, reset.
5. **The look:** 1280 and 375 wide, light + dark, no sideways scroll, English UI, Thai only in the help; no real family data.
6. **Old answers:** v1 answers still present if any were saved (not required).

Write TEST-106 by page. Fix nothing. Nudge me: PASS means it goes to the owner.

---
## @Porter → @Tanya — 2026-10-17 — 🔴 LIVE: REPRODUCE on sid: a weekly course can't be created when a week falls on the teacher's leave day (REQ-123)
Read `requirements/REQ-123-course-create-refused-on-a-teacher-leave-day.md` (Khwan verbatim). On **sid**, headless:
1. Put a QA teacher on **leave on a Saturday** about 3 weeks ahead.
2. **New course → weekly Saturdays** with that teacher, spanning that date. Record the **exact refusal text + a screenshot**.
3. **Mark that week as a planned absence** in the create preview ("ลาล่วงหน้า", REQ-045). Still refused? Exact text.
4. **Try the other ways she could do it herself:**
   - change that session's date;
   - change its teacher in the preview;
   - start the course after the leave.
   - Note which (if any) let the course be created.
5. The same with the **DUO** create, if it's a separate flow.

Write TEST-107 by value, then nudge me. Fix nothing; no cause, only what happens.

---
## @Porter → @Tanya — 2026-10-17 — ➕ add to TEST-107: walk the WHOLE teacher advance-leave flow as an admin (REQ-123 §2)
Owner: *"การจองวันลาล่วงหน้า ของครู แอบใช้งานยากด้วยนะ"*. On sid, after the reproduction, **do the admin's real job**: put a QA teacher on leave in advance (one day, then a range), and see what happens to that teacher's existing classes and to new bookings. Record:
- every click from where you start to the end;
- every word that is unclear;
- every place you had to guess;
- every dead end;
- what the screen tells you about the classes affected.

Screenshots. A "TEST-107 §2 friction list", ranked worst first. No fixes, no opinions about code.

---
## @Porter → @Tanya — 2026-10-17 — ➕ for TEST-107 (from Sober's read-only code reading; NOT confirmed until you show it)
- **Expected refusal text, with and without the planned absence:** "ครู ต้าบ ลาวันที่ 2026-11-07 — เพิ่มคาบกับครูในวันนั้นไม่ได้ กรุณาเลือกครูอื่นหรือวันอื่น" (your QA teacher's name and date instead). Record what you actually see.
- **Workarounds to try:**
  - change THAT week's teacher in the preview;
  - create the course without that week.

---
## @Porter → @Tanya — 2026-10-17 — 🔁 REQ-123: no workaround goes to the customer (owner: long-term fix only)
Still do TEST-107 fully. It is the reproduction and the friction list for the redesign. The workaround tries stay useful as facts, but nothing is sent to Khwan.

---
## @Porter → @Tanya — 2026-10-17 — ⏸️ WAIT for "sid deployed": TASK-813 after-proof (TEST-107 §after)
The same recipe as your reproduction, on the new build, Private + DUO:
- the leave week **ticked → CREATED**: the week is pushed to the end and the leave stays;
- **not ticked → still refused** (the same text);
- two leave days, one ticked → still refused.

By value + screenshots.

---
## @Porter → @Tanya — 2026-10-17 — ▶️ GO TASK-813 after-proof on sid (back `c1d90d8`). Run the ⏸️ entry above (TEST-107 §after), then nudge me

---
## @Porter → @Tanya — 2026-10-17 — TASK-813 after-proof received (PASS). ⏸️ No uat check now
The owner ships **813 + 814 + Phase 1 together**, once. Your full sid gate comes when the whole set is ready.

---
## @Porter → @Tanya — 2026-10-17 — ⏸️ WAIT for "sid deployed": REQ-123 FULL gate (TEST-108): 813 + 814 + Phase 1 P1–P7, one release
When I say GO (sid, back + front, migration 0070):
1. **Khwan's case again** (TEST-107 recipe, Private + DUO).
   - **The preview now WARNS** on the leave week and offers one-click "planned absence"; ticked → created.
   - Not ticked: still refused.
2. **814 / P4:** the calendar leave strip opens the **panel**: the days, the classes with child + program + Open, Cancel leave (future only; today/past refused with the approved text).
3. **P2:** a **range leave** (3 days) is one record with one reason, and 32 days is refused. Then cancel the whole range (future days); the teacher gets ONE LINE.
4. **P3:** the affected classes are listed with child + program + link.
5. **P5:** "Teacher leave" on the Teachers page: upcoming/past, Cancel for future, reachable from the calendar too.
6. **P6:** the dialog's default date = the clicked day (calendar), never tomorrow.
7. **P7:** before saving, the dialog says what will happen. Future = blocks only; today = "cancels N classes and tells their families".
8. **The copy** matches `COPY-DRAFT-REQ-123-phase1-2026-10-17.md` exactly (approved).
9. **Permissions:** a Teachers-only admin can use the list and cancel.

By value + screenshots; nothing is sent to Khwan.

---
## @Porter → @Tanya — 2026-10-18 — ▶️ GO TEST-108: the REQ-123 full gate on sid (back `7d39cbf` + front `a289bca`, migration 0070 applied, journal 71 verified)
Run the ⏸️ entry above (points 1–9), plus `DEPLOY-REQ-123-teacher-leave-release-2026-10-17.md` §4. By value + screenshots. Nudge me.

---
## @Porter → @Tanya — 2026-10-18 — TEST-108: F1/F2 go to Sober for a fix. **L2: create the test user yourself on sid**
- **L2:** sid is yours to write (full access on the dev server, test data only). **Create a QA user on sid via the app's Users / permissions screens** with ONLY `menu:teachers` + `action:calendar.status`, clearly QA-named. Prove the Teachers-only list + cancel. Raise it as a DATA REQUEST only if the app can't create that user.
- **L1** (one LINE for a range) stays unobservable; it's noted, not blocking.
- Re-check F1/F2 when I say the fix is on sid.

---
## @Porter → @Tanya — 2026-10-18 — ⏸️ WAIT for "sid deployed (front)": TEST-108 re-check of F1/F2 (TASK-822, front only)
- **F1:** 32 days, and end-before-start, in TH and EN → the dialog shows the approved sentence, **the button waits, and NO request is sent** (check network).
- **F2:** after recording a leave, the result lists child (DUO: both) · program · status + Open → the booking.

Add §re-check to TEST-108. After it passes I send the owner the uat note.

---
## @Porter → @Tanya — 2026-10-18 — ▶️ GO: TEST-108 F1/F2 re-check on sid (front `90a11da`). Run the ⏸️ entry above, then nudge me

---
## @Porter → @Tanya — 2026-10-18 — ⏸️ WAIT for "uat deployed": REQ-123 on uat, READ-ONLY (TEST-108 §uat)
- Check the build identity first (back `7d39cbf` + front `90a11da`).
- Then read-only: the calendar leave strip opens the panel; the Teachers page shows "Teacher leave"; the create preview warns on a leave week, **without creating anything**.
- **No writes on uat.**

---
## @Porter → @Tanya — 2026-10-18 — ▶️ GO: REQ-123 on uat, READ-ONLY (the ⏸️ entry above), PLUS 4 screenshots for Khwan from SID
The owner deployed uat (back `7d39cbf` + front `90a11da`) and migrated: 0070 applied, journal 71.
1. **uat read-only:**
   - build identity;
   - the leave strip opens the panel;
   - "Teacher leave" is on the Teachers page;
   - the create preview warns on a leave week (create nothing).
   - **No writes.**
2. **For the customer message, from sid** (QA data only, no real family names), headless, into `project-docs/customer-2026-10-18-teacher-leave/`:
   - `1-create-warning-tick.png`: the create preview warning + the one-click "planned absence";
   - `2-leave-range-dialog.png`: the leave dialog with From–To and the "what saving will do" line;
   - `3-leave-panel-cancel.png`: the calendar strip's panel (days, classes with child/program, Cancel leave);
   - `4-teacher-leave-list.png`: the Teachers page list.

Add §uat to TEST-108, then nudge me.

---
## @Porter → @Tanya — 2026-10-19 — ⏸️ WAIT for "sid deployed": REQ-124, Palm's SOM dashboard + Daily Report "Others Program" (TEST-109)
sid = back (REQ-124 commit) + front `e314303` (Palm's merged screens). Read `requirements/REQ-124-…md` + `CHECK-REQ-124-…md` + Silver's 10-18 done-entry in `inbox/PM.md`.
- **The API equals your own recount** (from `/bookings`, `/calendar`, people and parents data) for `/reports/som?month=…` (with and without `badgeValueIds`), every `/reports/som/new-vs-renewing/:bucket` list (`rows.length` = the card), and `/reports/daily` `kidsByProgram`, **by value**, on 2–3 months/days with real mixes.
- **The live bugs, fixed in the NEW fields:** Renew is not always 0 · Active Course excludes ended/paused · trials exclude CANCELLED · `today.confirmed`.
- **ECA/OTHER once per class** (a 2-hour class with 5 kids = 5).
- **District:** mostly "unknown" is expected.
- **The screen:** which numbers Palm's screen shows, old fields or new? Record it by card. **If his screen still reads old fields, that is Palm's to switch**: note it, don't call it our defect.

Headless. Nudge me.

---
## @Porter → @Tanya — 2026-10-19 — ▶️ GO TEST-109 on sid (back `4762aa7` + front `e314303`). Run the ⏸️ entry above, then nudge me

---
## @Porter → @Tanya — 2026-10-19 — ⏸️ WAIT for "sid deployed": TEST-109 re-check (F2 + N1 fixed) + the SCREEN, once front `e314303` is on sid
- **F2:** `kidsByProgram` CAMP counts a coach-less camp week's kids that day; under `?teacherId` only that coach's weeks.
- **N1:** October `recentFirstTrial` now excludes children holding ANY course bought ≤ the month end (Aileen, ส้ม out), so expect your 4. The "no course" cards follow the same rule.
- **The screen** (if the owner has put front `e314303` on sid): Palm's SOM page and the Daily Report's Others Program, by value vs the API, per card. Old-field cards are Palm's switch (note only).

---
## @Porter → @Tanya — 2026-10-19 — ▶️ GO the TEST-109 re-check on sid (back `82a1988` + front `e314303`, owner deployed both). Run the ⏸️ re-check entry above (F2 + N1 + the SCREEN), then nudge me

---
## @Porter → @Tanya — 2026-10-19 — ▶️ GO: uat READ-ONLY smoke, REQ-124 back (`82a1988`, the uat back only; the uat front is NOT deployed)
- `GET /reports/som?month=<this month>` answers 200 with the new sections (today, existingCustomers, newVsRenewing, coachCapacity, demographics, activityProgram).
- One `/reports/som/new-vs-renewing/:bucket` list: `rows.length` = its card.
- `GET /reports/daily` for today has `kidsByProgram`.
- The old fields are still present (the admins' current screen is unchanged).
- **Read only. No writes, no personal data in files.** Record it in TEST-109 §uat, then nudge me.

---
## @Porter → @Tanya — 2026-10-19 — ⏸️ WAIT for "sid deployed": TASK-744, the sub-district under each district (REQ-124 K4 = B)
- `/reports/som?month=…`, `demographics.subdistrictByDistrict`: for 2–3 districts, the sub-district counts **equal your own recount** from the parents' area codes, by value. Each district's `total` = that district's `count` in `demographics.district`. `unknown` should be ≈ 0.
- `demographics.district` is unchanged from your TEST-109 numbers.
- The same under `badgeValueIds`.
- **The screen:** Palm's click-through may not exist yet. That is fine; it's API only.

Headless. Nudge me.

---
## @Porter → @Tanya — 2026-10-19 — ▶️ GO TASK-744 check on sid (back `6bac497`). Run the ⏸️ sub-district entry above, then nudge me

---
## @Porter → @Tanya — 2026-10-19 — ▶️ GO: TEST-109 SCREEN re-check on sid. Palm says he fixed per our note and put it on dev (sid) himself, 21:28
- **The 5 old-field cards must now show the NEW values**, by value vs the API, same month as your re-check:
  - Confirmed (Today), was 8, API 3;
  - Active Course, 60 → 40;
  - 1st Trial, 21 → 4;
  - Total, 73 → 52;
  - Renew Course, 0 vs a modal of 5.
- **Every other card still = the API** (no regressions): NvR + modals, capacity, demographics, activity, the Daily Report's Others Program.
- **If a district click-through exists:** sub-districts = `subdistrictByDistrict` (sid back `6bac497`). If it doesn't exist, just note it. He may not have had the sub-district note.
- Record which front build sid now runs (a commit or version on the page, if visible). Palm deployed it, not the owner.

Headless. Nudge me.

---
## @Porter → @Tanya — 2026-10-19 — ▶️ GO now: uat READ-ONLY smoke of TASK-744 (uat back `6bac497`)
- `/reports/som?month=<this month>`: `subdistrictByDistrict` is present. For 2 districts, the sub-district counts sum to the district's `count`; `unknown` ≈ 0.
- `demographics.district` is unchanged vs your 10-19 uat smoke.
- **Counts only in the file. No writes.**

## ⏸️ WAIT for "sid front deployed": the screen re-check on front `692f798` (Palm's "read the new SOM fields", fast-forwarded onto dong)
- Run the same screen entry as before (the 5 cards now = API; no regressions).
- **No district click-through in this build** (`692f798` has no `subdistrictByDistrict`). Don't look for it.

---
## @Porter → @Tanya — 2026-10-19 — ▶️ GO the screen re-check on sid (front `692f798` + back `6bac497`, owner deployed). Run the ⏸️ entry above, then nudge me

---
## @Porter → @Tanya — 2026-10-19 — ▶️ GO: uat READ-ONLY screen smoke, front `692f798` (owner deployed; back `6bac497`)
- Palm's SOM page on uat: the 5 cards (Confirmed / attendance, Active Course, 1st Trial, Total, Renew Course) **= the uat API new fields**, by value, this month.
- The other sections render with no errors. The Daily Report shows Others Program.
- The teacher-leave screens (REQ-123) still work: just open the Teachers leave list.
- **Read only. No writes. Counts only in the file.** Nudge me.

---
## @Porter → @Tanya — 2026-10-19 — ▶️ GO TEST-110: REQ-125, a teacher's own login misses a multi-teacher ECA (REPRODUCE first)
Read `requirements/REQ-125-…md`. On uat, Khwan saw a 3-teacher "Other/ECA" class in Camp's column on the admin calendar, but **not** in Camp's own login (he is not first-listed).
- **sid** (or local if you need a teacher session; **no typing passwords on a non-local host, no creating accounts there**. If a sid teacher session is needed, write me a DATA REQUEST).
- Recipe:
  - create an Other/ECA class on one day with **3 teachers**, the QA teacher **2nd or 3rd** → the admin calendar (all 3 columns?) vs the QA teacher's own view (Daily + Weekly);
  - then the same with the QA teacher **1st**.
- Also note, if reachable: does the teacher's own check-in or own leave see that class?
- Screenshots, by value. **Don't use the uat teacher login from the chat.** Clean up what you created.
Nudge me.

---
## @Porter → @Tanya — 2026-10-19 — ⚠️ TEST-110 CHANGE: sid already runs the FIX (back `01d7f04`, TASK-823); the owner deployed before the old-build half
- **If you captured the old build before the deploy**, keep it: that is the old-build half.
- **If not, don't try to recreate it.** The old-build evidence is:
  - Khwan's own uat screens (REQ-125 intake; uat is still the old build);
  - TASK-823's mutation set, which bites when the fix is reverted.
  
  Record that in TEST-110 §old-build as "not captured on sid; evidence = …".
- **Now run the recipe on the NEW build:**
  - a 3-teacher Other/ECA, QA teacher 2nd or 3rd → **shown** in their own view (Daily + Weekly); 1st → shown;
  - the admin calendar is unchanged (all 3 columns);
  - also a group with an extra coach, if cheap.
- **If cheap (Sober's side finding 2):** can a group's EXTRA coach check in a single child's seat in their own view? Note it only.
- **And:** does the teacher's LINE "ตารางของฉัน" list a class where they are 2nd? If yes, that is Khwan's self-serve tip for uat until the fix lands.
Nudge me.

---
## @Porter → @Tanya — 2026-10-19 — DR-1 answered: the owner's screenshot (qatt75 Weekly) shows A (3rd) and B on 27 Oct ✅. Recorded in TEST-110. Please close TEST-110 and **cancel the fixture A + B on sid**. Side finding 2 (seat check-in) is skipped for now. Nudge me.

---
## @Porter → @Tanya — 2026-10-20 — ⏸️ WAIT for "sid deployed + migrated": TEST-111, REQ-125 ruling B full gate (one teacher's leave on a multi-teacher class)
Read REQ-125 (ruling B + the owner's D1–D5) and `DEPLOY-REQ-125-rule-b-teacher-leave-2026-10-20.md` **§4 (your gate list)**. sid = back (REQ-125 commit, **migration 0071**) + front (REQ-125 commit).
- **Run every §4 case by value:**
  - co-taught same-day;
  - the sole teacher;
  - advance + Cancel leave puts the teacher back;
  - all teachers on leave;
  - D4 (can't hand over);
  - the screens (the before-save split, "Continues with …", the strip count);
  - a GROUP extra coach.
- **Families get NO notice** for a class that continues. The remaining coaches get ONE LINE notice per day. Check the notice records; no real LINE.
- **The 7 approved strings appear verbatim** (COPY-REVIEW 2026-10-20).
- **Regressions:** REQ-123's single-teacher leave paths behave as before.
- QA teachers only; clean up what you create. A teacher's own view needs the owner (as DR-1). Ask early, in one DATA REQUEST.
Headless. Nudge me.

---
## @Porter → @Tanya — 2026-10-20 — ▶️ GO TEST-111 on sid (back `55cdb53` + front `3e4a337`; **migration 0071 applied**: journal 72, ledger + witnesses ✅, from the owner's output). Run the ⏸️ entry above, then nudge me

---
## @Porter → @Tanya — 2026-10-20 — ✅ DR-2 Part 1 ANSWERED: the owner, verbatim *"อนุญาต b"*. A WRITTEN, SCOPED exception to your no-password-on-a-non-local-host limit
- **Allowed ONLY:** headless login on **sid** as **`qa-coach-qatt75`**, **for TEST-111 only**, read + the same-day-leave cases on QA fixtures you create today (`QA-T111-…`; QA teachers qatt75 / qatt75b / QACT; QA kids only). First check that qatt75 has nothing else today.
- **Never print the password**: not in any file, log or chat. **No other account, host or test.** The exception **ends when TEST-111 closes**.
- **DR-2 Part 2: the owner ran the SQL EARLY** (before your same-day cases). Relevant rows only (an unrelated admin `daily_digest` row is omitted; it lists staff names):
  - 2026-10-20 23:43:17, `teacher_coleave_continues`, `recipient_type=teacher`, SKIPPED (no LINE), booking `5a351db0-…`, date **2026-11-03**, leaver qatt75. Classes: QA-T111-F1 ECA 09:00 (becameMain false) · **QA-T111-F2 ECA 11:00 (becameMain true)** · QA-T111-G group 15:00 (false).
  - 2026-10-20 23:43:17, `teacher_coleave_continues`, teacher, SKIPPED, same booking + date + leaver. Classes: F1 09:00 (false) · F2 11:00 (false).
  - **No `recipient_type=parent` rows.**
  
  Tie these to your advance-leave case. **Say "run done" after the same-day cases** and I'll ask the owner for ONE re-run.

---
## @Porter → @Tanya — 2026-10-21 — ⏸️ WAIT for "sid deployed": TEST-111 RE-CHECK (828 rework F1/F2 + O1 + TASK-829). No migration
Read `DEPLOY-REQ-125-rework-o1-and-task829-2026-10-21.md` **§4 (your gate)**.
- **F1:** the teacher's same-day dialog counts = the server (D4 is not counted as a cancel).
- **F2:** the teacher's future-day dialog shows the co-taught line.
- **O1:** both Cancel-leave confirms show the approved conditional line when n > 0, and today's text when n = 0.
- **829:**
  - the same-day result view (continues / cancelled / left as is + the D4 sentence);
  - the admin alert row in the outbox (one per act, admins only, never a family; DR SQL via me);
  - the line "แจ้งแอดมินแล้ว…" **only** when `adminsAlerted > 0`.
- **Your exception "อนุญาต b"** (sid, `qa-coach-qatt75`) **still holds: TEST-111 isn't closed yet.** It ends at this close.
- **The DR-2 SQL re-run is still owed by the owner.** Fold it into ONE re-run after this re-check.
Headless. Nudge me.

---
## @Porter → @Tanya — 2026-10-21 — ▶️ GO the TEST-111 RE-CHECK on sid (back `fa1a04c` + front `99d27a5`; no migration). Run the ⏸️ entry above, then nudge me with 'run done' for ONE SQL re-run

---
## @Porter → @Tanya — 2026-10-21 — DR-2 Part 2 RE-RUN result (the owner, after your re-check). The relevant rows, summarised by me; the unrelated admin `daily_digest` row (staff names) is omitted
**All rows are SKIPPED, has_line false.**

`teacher_coleave_continues` (recipient teacher):
| created (+07) | booking | date | leaver | classes (becameMain) |
|---|---|---|---|---|
| 10-20 23:43:17 ×2 | 5a351db0 | 11-03 | qatt75 | F1, F2 · and F1, F2 (true), G |
| 10-20 23:47:35 | 3734eebc | 11-05 | qatt75 | F5 |
| 10-20 23:47:38 ×2 | d3309ff5 | 11-17 | qatt75 | F6 · F6 |
| 10-20 23:47:40 | d3309ff5 | 11-17 | qatt75b | F6 |
| 10-20 23:48:41 | 3734eebc | 11-05 | qatt75 | F5 |
| 10-20 23:53:45 ×2 | 5a351db0 | 11-03 | qatt75 | F1, F2 · F1, F2, G (all false) |
| 10-21 00:09:33 ×2 | 4f608450 | 10-21 | qatt75 | S1, **S2 (true)**, G2 · S1, S2 |
| 10-21 03:07:48 | 20e76db7 | 10-21 | qatt75 | R-Y1 10:00 |
| 10-21 03:08:37 | df3d09b0 | 10-21 | qatt75 | R-X1 12:00 |
| 10-21 03:09:54 | df9da593 | 11-04 | qatt75 | R-W1, **R-W2 (true)** |
| 10-21 03:10:15 | df9da593 | 11-04 | qatt75 | R-W1, R-W2 |
| 10-21 03:10:57 | df9da593 | 11-04 | qatt75 | R-W1, R-W2 |

`teacher_leave_left_as_is_admin` (recipient **admin**): **ONE row**, 10-21 03:08:37, booking 89f8afc6, date 10-21, leaver qatt75, classes R-X3 ECA 15:00. ✅ as you expected (run 2).

⚠️ **NO `recipient_type=parent` row at all.** You expected ONE for S3 (the sole 1 HR, QAChatTwo, cancelled same-day).
- Please judge: does the query simply not catch it (S3's booking or payload outside the filter, or a different kind), or does a QA parent with no LINE get no outbox row at all?
- If the query missed it, give me ONE corrected bare SQL. If it's a real gap (no family cancel notice), it's a finding for Sober.

Then close TEST-111 (your exception ends at the close).

---
## @Porter → @Tanya — 2026-10-21 — ⏸️ WAIT for "sid front deployed": F3 + TASK-830 (front only; back stays `fa1a04c`)
Read `DEPLOY-F3-and-TASK-830-front-2026-10-21.md` **§4**.
- **F3:** in the teacher's same-day dialog, the co-taught line and the D4 sentence follow the **ticked** sessions (a subset, and all ticked).
  - **This needs a teacher session:** your "อนุญาต b" exception ENDED with TEST-111. If you need it again, send me ONE DATA REQUEST.
  - Better: check whether F3 can be proven without a login (by-value unit evidence + the admin side), and say so.
- **TASK-830 (REQ-118):** on the register page and the admin parent form, the **EN** page shows English province / district / sub-district names (e.g. 380101 shows the DOPA-corrected English). The **TH** page is unchanged. **The saved codes + Thai line are unchanged** after a save (read back).
Headless. Nudge me.

---
## @Porter → @Tanya — 2026-10-21 — ▶️ GO F3 + TASK-830 on sid (front `c743304` + back `fa1a04c`). Run the ⏸️ entry above, then nudge me

---
## @Porter → @Tanya — 2026-10-21 — ▶️ GO: uat READ-ONLY smoke (REQ-125 ruling B + 829 + REQ-118 TASK-830). uat = back `fa1a04c` + front `c743304`, **migration 0071 applied** (owner's output: journal 72, witnesses 72 ✅)
- **Admin calendar + Teachers leave list + the leave dialog** open with no console errors. **Don't save anything.**
- **The advance-leave dialog's before-save preview** for a real multi-teacher class, if one exists in the next weeks: open it and read it, **don't save**. Record whether the co-taught line appears.
- **The admin parent form on the EN page:** the pickers list English names. **Open only, no save.**
- **No writes. Counts only, no personal data in files.** Nudge me.

---
## @Porter → @Tanya — 2026-10-21 — ▶️ GO (after your current uat smoke): TEST-113 uat READ-ONLY Daily Report recount. The CEO asks *"ข้อมูลทั้งหมดตรงแล้วใช่ปะคะ พวก group ด้านล่าง"*
Read REQ-124 → "2026-10-21: the customer asks…".
- **uat, current build,** 3 recent real days: a weekday, a weekend day, and a day with ECA / camp / group. **All teachers + 3 coaches** via `?teacherId`.
- **Every card incl. the Others Program section at the bottom: API = your independent recount (from `/bookings` / `/calendar`) = the screen.** Same method as TEST-101 §uat and TEST-109.
- Note anything a person would read as wrong even if it matches the agreed rule (e.g. a camp week with no coach, an ECA counted once per class). **List it, don't judge it.**
- **No writes. Counts only, no personal data in files.** Nudge me.

---
## @Porter → @Tanya — 2026-10-21 — ⏸️ WAIT for "sid front deployed": Palm's develop merged into dong (two Palm fixes). Back stays `fa1a04c`
1. **Daily Report, Others Program:** on a day with no programme children (All teachers, and a coach without programme classes), **no sample numbers**: empty / "—". On a day with programmes, the values still = the API.
2. **SOM dashboard, District → sub-district click-through:** for 2–3 districts, the sub-district rows on screen = `demographics.subdistrictByDistrict` (labels, counts, unknown last), with month and badge filters.
3. **Regressions:** the 5 SOM cards fixed on 10-19 still = the API; the rest of the Daily Report is unchanged.
Headless, read-only on sid is enough. Nudge me.

---
## @Porter → @Tanya — 2026-10-21 — ▶️ GO on sid front `b901a6f` (back `fa1a04c`), with ONE change to the ⏸️ entry above
- **The merge brought ONLY Palm's sub-district commit** (`978697b`). His sample-numbers fix is **NOT in it**: `ReportsContent.tsx:251` is still `SHOW_SAMPLE_WHEN_EMPTY = true`, in dong and in origin/develop as fetched.
  - So **item 1 (no sample numbers) is expected to FAIL on this build.** Record it as "not merged yet", not as a new defect.
- **Run items 2 and 3** (the sub-district click-through = `subdistrictByDistrict`; the 5 SOM cards still = the API).
- **Add one check: Palm's SOM "preview layer"** (`lib/som/preview.ts`, commit `cd42268` of 10-17, live on uat since then). It *"fills only fields the live API does not send yet; a live value always wins"*, including e.g. the Existing Customers **1 HR** card and the Activity splits.
  - **List every SOM number on screen that does NOT come from our API** (a preview figure), on sid and, read-only, on uat. A made-up number on the customer's dashboard is the same class of problem as the Daily sample numbers.
Nudge me.

---
## @Porter → @Tanya — 2026-10-21 — ▶️ sid front is now `33f9311` (= b901a6f + Palm's `111a9ed` "Drop the Others Program sample rows", only ReportsContent.tsx + a doc line; SHOW_SAMPLE_WHEN_EMPTY / SAMPLE_PROGRAMS are gone from the source). **Item 1 (no sample numbers on an empty day) is now IN SCOPE.** Run it with items 2–3 + the preview scan, then nudge me

---
## @Porter → @Tanya — 2026-10-21 — ▶️ GO: uat READ-ONLY smoke, front `33f9311` (back `fa1a04c`)
- **Daily Report:** a day with no programme children (e.g. 18 Oct, All teachers) shows "—" on all four Others Program cards, **not** the sample numbers (TEST-113 F1 closes). A programme day (13 or 20 Oct) still = the API.
- **SOM:** the District → sub-district click-through opens for 1–2 districts and = `subdistrictByDistrict`. The 5 cards still = the API.
- **Read only. No writes. Counts only.** Nudge me.

---
## @Porter → @Tanya — 2026-10-21 — ▶️ GO TEST-115 PART B: REQ-122 v3 prototype, Team B pages (Team A's 832/834 still building; their part follows)
Read REQ-122 **§8** (the v3 brief: every item is a check) + §7.1 / §7.4 (her exact words) + REQ-120 §9 (her rulings). Silver's page list is in `inbox/PM.md` (10-21, "Team B pages DONE").
- **Build it yourself first:** `node build/single.mjs` in `som-balance-backoffice-spec`, then open `dist/…v3.html` **from disk, headless**. Check that it works with no other files.
- **Captures for the [?] help:** 1280×800, the main action inside the frame, QA-like data only, into the spec's `help/`. Name them as v2 did; list the names for Silver's 746 pins.
- **Check, page by page, both roles (CEO / admin):**
  - every word of §7.1 / §7.4 on that page, **exactly as she wrote it** (ALL CAPS menus, dates with the year 16/10/26);
  - the layout items (Products qty + location + filter, Category first; Locations removed; Stock Demo Bravo first + order setting; the Stock In date picker);
  - the rulings (the STOCK OUT cart + one bill discount ฿ / %, commission per sale; the admin sees no revenue and no pay totals; Transfer default; Refund cancels unattended + tells families; 1st Trial type, no Manual type);
  - **the 4 questions inside [?]** (STOCK OUT has two);
  - "Never deleted" in plain words; the Balance picker; Reports says "agreed later";
  - **no service fee / price of OURS anywhere** (product prices are fine).
- **A table per page: item → ✅ / ❌ (with a screenshot).** Report ❌s to me only; you don't fix them.
Headless. Nudge me.

---
## @Porter → @Tanya — 2026-10-21 — ▶️ GO TEST-115 PART A: Team A's 19 v3 pages (831–834 verified; build 3,736,541 B). Sober's page list is in `inbox/PM.md` (10-21)
- **Same method as part B:** build `node build/single.mjs` → open the single file from disk, headless → **1280×800 captures** for every Team A page into `help/` (list the names for Sober's 835 pins) → the §8 checklist per page, both roles (CEO / admin).
- **Team A specifics to check:**
  - the menu: SALARY · NOTIFICATION · SETTING (ALL CAPS);
  - the brand "SOM BALANCE / SOM BACK OFFICE";
  - Full-time / Part-time / Freelance in headings;
  - every §7.1 Salary / Notification / Setting rename;
  - **the month picker** on Monthly Payment / Payment Detail / Other Income;
  - the Daily Training Report by hours + the coach total, with no check-in/out;
  - no notification opt-out ticks;
  - **every SETTING page carries "หน้าบ้าน (SOM SCHEDULE)"**;
  - Payment Method defaults to Transfer;
  - "Who get Bonus? 1st / 2nd / Share 50/50" with no 25/25;
  - Confirm camp sets Transfer;
  - My slip (6) is reachable;
  - **an admin sees no coach pay** (beyond a sale's own commission line) and no revenue;
  - **date fields show dd/mm/yy** (`SPEC.dateField`).
- **In the same pass, when Silver says so:** re-capture Team B's date pages (Add Manually / Refund / ECA / Stock In / Stock reports), STOCK OUT (the commission box now top-right; the ฿ / % discount), and revenue-summary **with no toast**.
- A table per page: ✅ / ❌ (screenshot). Report ❌s to me only. Headless. Nudge me.

---
## @Porter → @Tanya — 2026-10-21 — ▶️ Team B is READY for its re-capture pass (`SPEC.dateField` in + verified, the ECA pin fixed). **Silver's list of 7 captures is in `inbox/PM.md`** (10-21, last Silver entry). Do them in the same pass as part A; check that every date field shows dd/mm/yy.

---
## @Porter → @Tanya — 2026-10-21 — Silver's GO for Team B's re-capture pass is already in your inbox (my entry above: 'Team B is READY…', 7 captures in `inbox/PM.md`). Go ahead.

---
## @Porter → @Tanya — 2026-10-21 — ▶️ ONE more capture: **`stock-stock-out.png`** (N4 fixed: the Items table changed, so the current PNG still shows "Re"). Same rules: a fresh page, 1280×800, the commission box + the "Remove" link both visible. Then nudge me; Silver re-checks its pins and calls Team B final.
