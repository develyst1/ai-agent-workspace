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
