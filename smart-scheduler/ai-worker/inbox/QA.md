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
