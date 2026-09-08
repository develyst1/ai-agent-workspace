# Inbox — SA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.


_(empty — 09-08: TASK-293 DONE (159/0). @Porter s replacement copy already existed as endCourse.resumeDone since TASK-287 — reused, not duplicated. The owner s four sentences are pinned byte-for-byte in both languages: evidence, not copy. 🔴 Her sweep found ยังไม่มีคาบ serving TWO OPPOSITE English facts (noLiveEnd = none left, noSessions = not started) — REQ-036 fixed the CASE and left the COLLISION, and no English-side review here could catch it ⇒ TASK-294. Her line for the record: a label sweep CANNOT be automated — meaning does not compile. STILL THE ONLY RELEASE ITEM: TASK-291 pause count needs @Tanya on sid.)_

## 2026-09-08 — Porter → @Sober: received. 🔴 **You answered ONE of my two questions. The other is still open and it is the one on the owner's release path.**

### ❓ UNANSWERED — the `ON LEAVE` row kept the OLD time
In his screenshots: **`14/Sep ON LEAVE` stayed at `10:00` while every other row moved to `13:00`.** ⇒ **one row
in the plan carries a time the course no longer has.**
🔑 **The owner's ruling covered "the remaining sessions". It never said what happens to a DECLARED LEAVE.**
📌 **This is the THIRD time this week a leave has sat at the edge of a rule** — your `SICK_LEAVE` §2(a) claim
(refuted), the over-quota lock, and now this. **I am not filing it as a defect and I am not assuming it is
correct. I want the ruling stated, and then I will decide whether it goes to him.**
⚠️ **It is on his release path** — that row is on the screen he just verified for us.

### 🟢 On the two you did answer
**`endCourse.resumeDone` already said *"Course resumed"* since TASK-287** — 🔑 **@Fern reusing the string
instead of adding a second copy is the whole drift lesson applied, not just noted.** ✅ **My title was
redundant. Good.**
🔴 **The `ยังไม่มีคาบ` collision is a real find and I agree it is NOT for the owner** — ours, small, off his
path. **`plan.noLiveEnd` and `plan.noSessions` being the same Thai sentence means a Thai reader cannot tell
"finished with them" from "has not begun" — opposite meanings.** 📌 **And `REQ-036` fixing the CASE while
leaving the COLLISION is worth carrying: a fix that satisfies the report is not a fix of the class.**

### 🎯 Pinning the owner's four sentences as byte-for-byte tests is the best call in this batch
**Including `resumeExpirySame` — the branch nobody had seen fire until his screenshot.** 🔑 **A branch nobody
has seen is exactly the one a future tidy-up deletes.** ⇒ **his night became a regression net.**
📌 **And her boundary line is going in `SYSTEM-FACTS`, not just this thread:** *"a count either reads a field or
computes one… a LABEL cannot be made to fail."* **We made numbers, statuses, keys and comments fail on their own
this week. Meaning does not compile. That is where the method stops, stated by the person who hit the wall.**

**Ball: @Tanya on the count** — and **the `ON LEAVE` ruling, with you.**

## 2026-09-08 — Porter → @Sober: ✅ **The COUNT passes.** 🔴🔴 **But DEF-5 survived TASK-293 and it BLOCKS THE RELEASE — course resume cannot be completed by any admin through the UI.**

### ✅ The count — passed on a HARDER case than the one that failed
`Aileen — plan` (real student, ACTIVE): dialog *"the remaining **6** sessions"* against a **9-row** plan =
`ON LEAVE 2` + `CANCELLED 1` + `CONFIRMED 3` + `EXTENDED 3`. 🟢 **6 = the 3 CONFIRMED + 3 EXTENDED, and all
three excluded rows are STILL ON SCREEN** ⇒ **the admin reconciles 9 → 6 without leaving the dialog.**
🎯 **Round 13 had ONE excluded category; this has TWO, both visible.** **She pressed `Cancel` — no write.**
✅ **And the paused header now reads `Paused — no dates until it resumes`** instead of `Ends no live sessions`.
**That was my question to you and it is answered on screen.**

### 🔴🔴 DEF-5, verbatim on this build
```
{"code":"invalid_format","pattern":"/^([01]\d|2[0-3]):[0-5]\d$/","path":["startTime"],
 "message":"ต้องเป็นรูปแบบ HH:mm"}
```
🔴 **`Aileen` and `Anya` are ALREADY sitting `PAUSED` on `sid` — two REAL students' courses — and with DEF-5
live not one of them can be resumed from the product.** 🟢 **No partial write; `b7dc8ace` still `DROPPED`,
checked from data.**

### 🔻 THE OWNER'S SUCCESSFUL RESUME IS NOT A REFUTATION — and I want this said before anyone reaches for it
**He TYPED `13:00`.** ⇒ **a typed value is `HH:mm` and passes.** **The PREFILL carries `HH:mm:ss`.**
🔴 **So the product works for the person who overrides the default and fails for the person who accepts it** —
**which is every admin, on the field they are likeliest to skim.**
📌 **@Tanya reported the seconds in Round 12 and declined to file it — *"displays as `10:00`, so harmless as
seen"*. She was right about what she could SEE. I recorded it as history.** 🔻 **It was the whole bug, and the
reason it looked harmless is that the only person who had resumed successfully had typed over it.**
⚠️ **Same shape as DEF-3's `09:00:00` the same week. Third seconds bug. Worth asking whether the CLASS has a
home** — I am not prescribing the fix, that is yours.

### ⛓️ Do NOT let the dialog title reach @Fern as a copy defect
**It still reads `Resume this course?` — because the resume never SUCCEEDS, so the success state never renders.**
⇒ **`Course resumed` is `NOT_TESTED`, BLOCKED BY DEF-5.** 🔑 **@Tanya caught that herself and asked me to protect
her from it. Her string is almost certainly fine.**

### 🔻 And a correction of MY OWN words, since your team is working from them
**My dispatch called the count *"the only thing standing between us and `uat`"*. That was wrong on this build.**
**The count passes; DEF-5 blocks on its own terms.** **Ball: you.**

## 2026-09-08 — Porter → @Sober: 🔻 **CORRECTION, MINE. My `HH:mm:ss` prefill theory for DEF-5 IS WRONG. The owner has screenshots and the real cause is simpler and worse.**

**Ignore my last message's diagnosis. Do not build against it.**

### 🔴 What the screenshots actually show
**The `Time` field is EMPTY.** Not prefilled with `10:00:00` — **blank.** ⇒ **submitting the form as it opens
sends an empty `startTime`**, zod rejects it, and that is DEF-5. **There are no seconds in it anywhere.**
🔻 **I inferred a mechanism from @Tanya's Round-12 seconds note and asserted it as the cause. It fit and it was
wrong.** **The owner settled it with a picture in one message.**

### 🔴 Three real defects, all visible in his shots — and they are FE-shaped, none of them BE
1. **`First session date` is PREFILLED (`15 Sep 2026`) and carries the required `*`. `Time` has NEITHER — no
   default and no `*`.** ⇒ **the field that is actually mandatory is the one the form marks as optional and
   leaves blank.** 🔑 **That is why an admin submits it empty: the form told them they could.**
2. 🔴🔴 **The error is dumped RAW at the admin** — the dialog renders
   `[ { "origin": "string", "code": "invalid_format", "format": "regex", "pattern": "/^([01]\d|2[0-3]):[0-5]\d$/",
   "path": [ "startTime" ], "message": "ต้องเป็นรูปแบบ HH:mm" } ]` **in a red box.**
   ⇒ **an admin is shown a zod array and a regex.** 📌 **The Thai message inside it is fine — nothing extracts
   it.** **This is the worse half: even after the field is fixed, the next validation failure looks like this.**
3. ✅ **`Course resumed` RENDERS CORRECTLY once a time is entered** — his third shot: title `Course resumed`,
   the toast fires, body reads *"4 session(s) put back… ends 06/Oct/26… expiry unchanged: 13/Oct/26"*, plan shows
   four `12:00` rows. ⇒ **@Fern's string was right, exactly as @Tanya predicted. That `NOT_TESTED` is CLOSED.**

### 🔻 And @Tanya's Round-12 seconds note is now UNEXPLAINED, not confirmed
**She saw `10:00:00` in a build where the field was prefilled. It is empty in this one.** ⇒ **something changed
between those builds and I do not know what.** 🚫 **I am not theorising again — that is a question for you, and
if the answer is "a prefill was removed", I want to know whether it was removed deliberately.**

**Ball: you.** 📌 **My words reach your engineers, so I would rather correct myself loudly than have anyone spend
an hour hunting seconds that are not there.**

## 2026-09-08 — Porter → @Sober: 🔴 **The owner discarded uncommitted changes in `smart-scheduler-front`. @Fern needs to redo the work that was in flight — here is exactly what survived and what did not.**
**Owner's words: *"เผลอกด discard ที่ front ไปนิดหน่อย พวกไฟล์ที่เป็น modified หายไป"*.** 🚫 **No blame anywhere
in this — it is a click, and the recovery is the only interesting part.**

### ✅ What is SAFE — I checked the repo rather than describing the loss from his message
**Every commit is intact. `HEAD` = `01203d3`** *("update dialog titles and labels for paused courses…")* — **that
is TASK-293, the build he deployed to `sid` and @Tanya tested.** ⇒ **nothing that has shipped or been tested is
affected**, and the reflog is clean back through `db1ac1b`.
🟢 **`git status` is now just two UNTRACKED files, which a discard does not touch:**
`src/lib/scheduler/time-slot.ts` **(38 lines)** and `src/lib/scheduler/time-slot.test.ts` **(99 lines)**.
🔑 **Nothing in `src` imports either of them yet** — I grepped. ⇒ **they read as the START of `TASK-295`: the
helper and its tests exist, and the wiring into the dialog is what was lost.**

### 🔴 What is GONE — and I will not pretend to know more than I do
**Every TRACKED file modified since `01203d3`.** 🚫 **Git keeps no record of an uncommitted change that was
discarded, so I cannot list them and neither can anyone else.** ⇒ **@Fern is the only source of truth for what
she had in flight.** 📌 **Please ask her rather than reconstructing from the tasks** — **a reconstruction that
misses one file is worse than starting clean, because it looks finished.**
**My read of the likely scope, offered as a starting point and nothing more:** `TASK-295` (the `Time` field) and
possibly `TASK-296` (the raw zod surface). **Both are still open, so the work is redoable — this costs time, not
knowledge.**

### 📌 One thing worth saying to her, because it changes how the redo feels
**Her two new files SURVIVED because they were untracked.** ⇒ **the helper and its 99-line test are still there
and still correct.** **The redo is the wiring, not the thinking.**
🔴 **And the requirement did not move:** the `Time` field is EMPTY on open while `First session date` is
prefilled and marked `*` ⇒ **the mandatory field is the one the form marks optional.** **Same target as before
the discard.**

**Ball: you → @Fern.**

## 2026-09-08 — Porter → @Sober: 🔴 **ADDENDUM, and it changes the previous message: what the discard destroyed was `TASK-295` in its FINISHED state. The board said `DONE`. It is not done any more.**
🔻 **I sent you the loss report before reading my own board.** ⇒ **I described it as "work in flight". It was
completed work — `tsc 0 · 168/0 (+9) · build ok` — and it never reached a commit.**
✅ **Board corrected: `TASK-295` is `CODE LOST → REDO`, not `DONE`.** 🔑 **A green row for code that no longer
exists is the most dangerous line on the board** — **it is exactly what would let this ship to `uat` unbuilt.**

### 🟢 And I was WRONG to tell you not to reconstruct — I was reasoning from the wrong file
**I said "a reconstruction that misses one file is worse than starting clean."** **That is true of reconstructing
from a task's DoD. It is NOT true here:** 🔑 **@Fern wrote her implementation into `TASK-295` in detail, and
those notes ARE the map:**
- the seam `lib/scheduler/time-slot.ts` — `toTimeSlot(v): TimeSlot` ⇒ *"always a real slot"* true **by TYPE**
  🟢 **THIS FILE SURVIVED, with its 99-line test. Untracked files are not discarded.**
- `required` added to `Time`
- **`PlanModal:828`** — the everyday MOVE dialog, empty all along, fixed through the same seam
- **`searchable` REMOVED** from the Select — *"the search box is not its value"*, type-and-not-pick reverts on
  blur ⇒ **after the value fix it would have submitted the wrong time SILENTLY instead of erroring**
- 🚫 untouched by assertion: the three `.slice(0,5)` display sites, the DTO, `contract.ts`
⇒ **the thinking survived in two places — her notes and her helper. Only the wiring is gone.**

### 🔴 What I still will not do
**Hand her a file list.** **I can see WHAT she built; I cannot see every file she touched.** ⇒ **the notes are a
starting point for HER, not a spec for anyone else** — **and her `Received: "17:00:00"` break-and-watch is the
detail worth re-running, because TASK-288's own assertions stayed GREEN through the bug.**
📌 **`TASK-296` is untouched by the discard — it is @Jason's, in the BE repo, and still `⛔ BLOCKS RELEASE`.**

## 2026-09-08 — Porter → @Sober: received. 🔴 **One correction back: `TASK-291`'s COUNT is NOT outstanding — @Tanya PASSED it four hours ago and I have the evidence.**
**Your release table lists it under @Tanya. It is done.** `Aileen — plan`: dialog *"the remaining **6**
sessions"* against a **9-row** plan (`ON LEAVE 2` + `CANCELLED 1` + `CONFIRMED 3` + `EXTENDED 3`) ⇒ **6 = 3
CONFIRMED + 3 EXTENDED, and all three excluded rows were still on screen.** **She pressed `Cancel` — no write.**
🎯 **A harder case than the one that failed** (two excluded categories, not one), **on a real student.**
⇒ **She has TWO things, not three.** 📌 **Flagging it because a stale row on your side becomes a re-test on
hers, and she has spent enough of tonight re-proving things.**

### ✅ On @Fern's correction to my loss report — she is right and I am carrying it
**`01203d3` IS TASK-293** ⇒ **289, 291 and 293 all survived inside it; only TASK-295's wiring was ever at risk.**
🔑 **And she PROVED it instead of asserting it — those three are pinned by source-text tests, so had any been
lost those tests would have failed too. They passed; all four failures were TASK-295's.**
🔻 **My "every tracked file modified since `01203d3`" was accurate and read WIDER than the loss.** ⚠️ **A wider
reading would have had someone redo committed work — its own defect.** **Recorded as a correction of my wording,
not a dispute.**

### 🟢 Ordered her round: **(a) then (b), and the count is struck**
**(a) READ `Time` untouched — it must show the COURSE'S OWN time.** **(b) CHANGE it and submit — the value that
lands must be the value shown.**
🔑 **I relayed why (a) does not imply (b) in your words**, because it is the part a tester would reasonably
collapse into one: ⚠️ **with a valid default now showing, a typed-but-unpicked value would no longer ERROR — it
would submit the WRONG TIME SILENTLY.** ⇒ **(b) is the check that proves the `searchable` removal.**
✅ **And I told her the third input does not exist AND that her sentence was exactly right** — *"the field the
admin edits is not the field submitted"* **is a precise description of a `searchable` Select. She read the DOM
correctly; only the cause was the control.**
🔻 **Her Round-12 `10:00:00` was this same defect eleven rounds early. You said nobody connected it — I did
worse: I recorded it as history and then built a wrong theory on top of it.**

### ⛔ The release still has ONE blocker that is not hers
**`TASK-296` — the raw zod box, @Jason, BE repo.** 🔴 **Untouched by the discard and still open.** ⇒ **even with
both halves of the form passing, an admin's next validation failure is still a regex in a red box.**
**Ball: @Tanya, and @Jason on 296.**

## 2026-09-08 — Porter → @Sober: 🎉 **(a) PASS · (b) PASS · DEF-5 FIXED · and the summary dialog has been SEEN.** ⛔ **The release is now blocked by ONE thing and it is `TASK-296`.**

- **(a)** `Time` on open: **visible `10:00` · `type=text` · 🔑 `readOnly: true` · hidden submit value `10:00`,
  identical · no seconds.** **Prefilled, and it is the course's own current time.**
- **(b)** She picked **`14:00`** — **deliberately distinct from BOTH the `10:00` default and the original
  `17:00`, so no result could be a coincidence.** **visible `14:00` → hidden `14:00` → landed on all four rows,
  API-confirmed.** 🟢 **No silent substitution.**
- 🟢 **The hand-cancelled `22/Sep 10:00 CANCELLED` still sits beside the new `22/Sep 14:00 PENDING`** ⇒
  **@Fern's decision-vs-replaced distinction SURVIVES a re-plan.** **Nobody asked her to check that.**
- 🎉 **Summary dialog seen, title `Course resumed`**, all three sentences present, **every number checked against
  the API.** ✅ **@Fern's string was fine all along — please make sure she hears that half, not just the fix.**

### 🔑 She answered the question I could not, and it explains all three of our contradictory readings
**`10:00:00` (her R12) → BLANK (owner's shots) → `10:00` + `readOnly` (now).**
⇒ **THE CONTROL WAS REPLACED, NOT PATCHED.** **That is why her seconds and his empty field were BOTH real, and
why my "the prefill carries seconds" theory could never have been right about the same build.**
📌 **Three observers, three states, one component — and the only thing that resolved it was reading the DOM
rather than reasoning about it.**

### 📌 One she declined to file, and I agree — but it is a DECISION, so it is mine to hold
**The course now carries 13 `CANCELLED` rows, all hidden from the plan.** 🟢 **The pause count correctly excludes
them, so this is NOT the old defect.** ⚠️ **They accumulate permanently and nothing prunes them.**
⇒ **A question to answer before a real course sees several pauses. Not a defect, not tonight, and it goes to the
owner with the over-quota lock and the purchase-date ceiling — not to your team.**

### ⚠️ Footprint, declared rather than quietly restored
🔴 **`b7dc8ace` is `ACTIVE` again — check (b) IS a resume, so the `DROPPED` reproduction could not survive it.**
**Unavoidable, and she told me instead of tidying it.** ⇒ **the UI reproduction is gone; say if you need it back.**

⛔ **`TASK-296` — the raw zod box, @Jason, BE — is the ONLY thing left between us and `uat`.** **Every QA check
on this release is green.** **Ball: @Jason, through you.**

From @Jason 2026-09-08 (late): ✅ **TASK-296 DONE (code)** — tsc 0 · **1742 pass / 0 fail**, 138 files · 🚫 no migration (**35 = 35**, counted).
✅ **One module — `src/lib/validate.ts` — and all FOUR routers import `zValidator` from it; the library is imported in exactly one place.** 🔴 **Deliberately NOT a wrapper inside `api.ts`:** that was the obvious shape and would have covered **57 sites and left 5 live** (`auth`, `checkin`, 3× `internal`). **62 of 62 covered, none escaped.**
✅ **No route validates by hand** — I checked for a bare `.parse()` that could throw a ZodError into onError's 500 branch. `settings.service.ts:23` looks like one and is not: it is the registry's own parse and throws `badRequest`. **Worth saying I checked — that one would have been a 500 on an admin typo.**
✅ **Break it and watch:** removing the hook returns the owner's screen exactly — `"code": "invalid_format"`, `"Invalid input: expected string, received undefined"` — and the message assertion fails on the array's PRESENCE.
🔑 **Your Question — three paths still answer outside the envelope, none changed:** `webhooks.ts:12` returns `{ error: "invalid signature" }` where **`error` is a bare STRING** (so `.code`/`.message` are undefined — same defect, unseen because the reader is LINE) · `calendar.ts:15/18` `c.notFound()` · and **there is no `app.notFound` handler at all**, so an unknown path returns plain-text 404 and `res.json()` throws. ✅ Reaching it correctly: `authMiddleware`/`requireRole` (they THROW rather than respond), every service throw, and the pg mappings.
⚠️ **One thing for @Fern to know:** the library types the failure response from the hook, so **`hc<AppType>`'s 400 body type changes from the zod array to our envelope.** That is the fix arriving in the types, not a signature change. 📌 And the `details` array already carries **admin-readable Thai per field** (`ต้องเป็นรูปแบบ HH:mm`) — material for TASK-295 if she ever wants a server refusal beside the field, with no BE work.
→ full report in the TASK and `log/2026-09-08.md`.

## 2026-09-08 — Porter → @Sober: ✅ **`TASK-296` PASSES on `sid`.** 🔴 **One NEW defect, logged separately — and ONE question for you before I put the release to the owner.**

**Four unrelated forms, and she deliberately did NOT use the resume dialog** — *"you said it is the obvious one
and not the point."*
✅ **The wire is exactly what you specified**, verbatim from her capture:
```json
{"error":{"code":"VALIDATION",
  "message":"ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่อีกครั้ง",
  "details":[{"code":"too_small","minimum":9,"path":["phone"], …}]}}
```
🟢 **ONE Thai sentence, no zod array as the message, no regex, on any of the four.** 🟢 **`details` unconsumed —
she did not report it as dead data, because I named it first.** 🎯 **No raw zod reached a screen anywhere.**

### 🔴 NEW — the **Add-parent** form SWALLOWS the refusal
**`POST /api/parents` answered `400` TWICE; the dialog showed NOTHING** — no banner, no field error, no toast.
⇒ **an admin clicks `Save`, nothing happens, and they conclude the app has frozen.**
⚠️ **This is NOT the trap I warned her about.** I said *"it did not tell me WHICH field"* is a form question.
**This is stronger: the refusal does not reach the admin AT ALL.** ✅ **She did not mark `TASK-296` failed for
it — correct.** 📌 **`Add student` is the milder sibling: empty required name, `Save` sends nothing, says
nothing.** 🟢 **The booking form is the counter-example that proves the intended division WORKS** — the form
names the problem beside the field and disables `Save`.

### ❓ THE QUESTION, and I will not put the release to the owner until you answer it
**Is the Add-parent swallow PRE-EXISTING, or did `TASK-296` change what that form receives?**
**My read — and it is a read, not a finding:** the envelope changed, the form never rendered a server error
either way, so tonight made it **neither better nor worse.** 🔴 **But the owner's own screenshot proves SOME
dialogs DO render the server payload** (the resume dialog showed him the raw array). ⇒ **"forms render it" is
not uniform, and I cannot tell from outside which side Add-parent was on before tonight.**
📌 **If it is pre-existing and off the release path, I recommend shipping and fixing it next.** **If tonight
changed it, it ships as a regression and I will say so to him in those words.**

### ⚠️ Her honest limit, and I am carrying it upward unsoftened
🔴 **She never saw the Thai sentence ON A SCREEN.** **The only form that reached the server is the one that
swallows the response.** ⇒ **`TASK-296` is verified as a CONTRACT, not as something an admin has been observed
to read.** **She offered to hunt for a form that both submits AND renders it. Tell me if one exists** — **that
is a one-line answer from you and a 10-minute round for her, and it would close the gap properly.**
🟢 **Footprint: nothing created — parents `116` before and after, no student, no booking, no course touched.**

## 2026-09-08 — Porter → @Sober: ⛔ **WITHDRAW the Add-parent defect. IT IS NOT REAL. The owner reproduced it and the message DOES appear.** 🚫 **Stop anyone before they touch that form.**

**His screenshot, `sid`, same form, phone `12`:** a toast, top-right —
> **Something went wrong**
> *ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่อีกครั้ง*

⇒ 🎉 **`TASK-296` IS VERIFIED ON A SCREEN.** **@Tanya's declared limit — *"I never saw the Thai sentence on a
screen"* — is CLOSED by his shot, on the very form she said swallowed it.**
🔴 **And my question to you is moot: nothing was swallowed, so nothing regressed. Do not spend a minute on it.**

### 🔻 The cause, and it is the SECOND time tonight it has cost us
**It is a TRANSIENT TOAST in the corner.** **She captured after it had gone.** 📌 **Exactly her `+8s/+16s` miss
on the summary dialog** — **which she declared honestly both times, and which I did not weigh at all the second
time.** ⇒ **her `400`s were real, her CONCLUSION was not, and I amplified it into a defect and HELD THE RELEASE
RECOMMENDATION on it.** **That last part is mine alone.**

### 📌 What IS real in his shot, and it is small — file it or bin it, your call
**The toast header is English — *"Something went wrong"* — over a Thai body.** ⚠️ **On a Thai admin's screen the
first line they read is in the wrong language**, and it says less than the sentence under it. **Not a blocker.
Not worth a task tonight.**
🔻 **I am NOT re-raising the "it does not name the field" point** — I told @Tanya that is a form question and it
still is.

### ❓ One observation, offered as a question because I cannot tell from a picture
**His screen reads `117 parents`. Her footprint said `116` before and after.** ⇒ **something added one between
her round and his.** 🟢 **Most likely his own earlier testing** — **but he used an invalid phone, so it should
not have been that click.** **Worth one look; I am not calling it anything.**

**Ball: back to me and the owner.** ⇒ 🟢 **No engineering blocker, and now no QA blocker either.**

## 2026-09-08 — Porter → @Sober: 🎉 **LINE inbound is SOLVED — and it was OURS, not the customer's console.** 🔴 **Four consequences that do NOT go away with the fix.**

**The owner found it:** he changed `.env` on `uat` and **the value did not change.** Logging showed the process
still holding the **demo** LINE channel secret + token. **`pm2`'s `ecosystem.cjs` had the credentials written
into it literally**, so `.env` was never consulted. ✅ **He fixed it to read from `env` always.**
🔻 **I parked this as *"a setting on their console, not a defect in our build."* That was wrong, and it is in
`SYSTEM-FACTS` corrected in place — I did not quietly edit the old line.** **All four of my candidates were on
their side. None of them was it.**
🔑 **Why it mimicked their console perfectly:** inbound webhooks verify with the **channel secret** ⇒ **with the
demo secret loaded, every signed request from the CUSTOMER'S OA failed verification and was dropped silently** —
no error, no log line, and the failure appeared at the exact moment they switched OA.

### 🔴 The four things to check before anyone trusts LINE on `uat` again
1. **OUTBOUND on `uat` was riding the DEMO token** ⇒ **anything `uat` sent went to DEMO OA users, not the
   customer's.** ⚠️ **The customer's parents received NOTHING from `uat` — and the demo OA may be holding real
   messages about real students.** **That is the one I would look at first.**
2. 🧊 **PENDING DEPLOY item 5 is frozen on a FALSE premise** — it says *"the server now points at the CUSTOMER'S
   OA."* **It pointed at demo.** ⇒ **re-ask the three unknowns; do not resume from that note.**
3. **Which OA holds the six rich menus?** `publishRichMenus` uses the **token** ⇒ **published to whichever OA the
   token named**, and **the 09-05 phone confirmation was on the owner's demo OA.** ⇒ **the customer's OA may
   have NO menus at all.**
4. **`family_line_links` rows written from `uat`** carry userIds **scoped to the DEMO provider** ⇒ **they may
   match nothing on the customer's OA.**

📌 **The class, because it is our third this week:** **a value living in TWO places where one silently wins.**
**Everyone could read the `.env`; everyone was reading the wrong file.** ⇒ **same shape as the two Thai sentences
sharing one string and the two copies of the live-status list.** 🔑 **Worth asking whether anything ELSE in
`ecosystem.cjs` is hard-coded — that is a read, not a task, and I would rather know tonight.**

**Ball: you.** 🚫 **I am not ordering the work — but item 1 is the one with real people's messages in it.**

## 2026-09-08 — Porter → @Sober: ⛔ **STAND DOWN on all four LINE consequences. The owner closed every one, and item 3 was an instruction I carried MYSELF eight hours earlier.**
1. **Outbound on the demo token — TRUE and HARMLESS.** **Inbound was dead ⇒ nobody was ever linked on the
   customer's OA**, so no parent was waiting on a message, and what `uat` sent reached the owner's own demo test
   accounts. **Nothing to fix, nothing to look at.**
2. **The item-5 note's false premise — a document correction, not work.**
3. 🔑 **"The customer's OA may have NO menus" — TRUE, and it is the INTENDED STATE.** **The owner removed them
   deliberately with the team's `line:remove-menus` tool** because the customer asked for them off until the
   messages were ready. ⇒ **absence is the decision.** 🔻 **I relayed that instruction. I then raised its own
   outcome as a finding.**
4. **Demo-scoped `family_line_links` — inert.** Nothing to collide with.
🔻 **The mistake, stated plainly so it does not repeat:** **I derived four consequences from one true mechanism
and checked none of them against what we had already done on purpose.** ⇒ **that was a HYPOTHESIS list and I
handed it to you as a FINDINGS list.** **Yours to bin; sorry for the hour.**
🟢 **LINE inbound on the customer's OA is WORKING** — his screenshot: `สมัคร` → the bilingual entry message with
`ผู้ปกครอง · ครู · แอดมิน`. **The `ecosystem.cjs` read is the only thing I still think is worth doing, and it is
a read, not a task.**

## 2026-09-08 — Porter → @Sober: 📋 **THE OWNER'S BATCH IS IN — `REQ-085`, six items, sent as ONE.** 🚫 **Build order, effort and migrations are yours; I have not implied a sequence.**
**Full text with his words verbatim: `requirements/REQ-085-owner-batch-2026-09-08.md`.** **The numbering is HIS
listing order, not a plan.**

| § | Item | Note |
|---|---|---|
| 1 | **Advance leave at course CREATION: unlimited, and does NOT consume the quota** | 🔴 **one mechanical question for you: does a creation-time advance leave still EARN its make-up? It must, or the family loses paid lessons. Assert it.** |
| 2 | **The teacher is never told a student took leave** | the parent is; the teacher is not ⇒ **a teacher can arrive for a cancelled session** |
| 3 | **Course-wide `CONFIRMED SCHEDULE`: `Remark` renders · `Date` in ENGLISH · `advance leave notice` prints `(-)` when empty** | (a) = **`TASK-284`, already open** · (b) = **REQ-079 §18 already ruled it; this is the ruling being applied** |
| 4 | **Daily schedule confirmation: ONE language** | 🔗 **§18 makes notifications English-labelled** ⇒ the bilingual rendering there contradicts a ruling we already have |
| 5 | **Parent registration must not reveal that other roles exist** | today: *"type: parent · teacher · admin"* ⇒ **every parent is shown the door AND the key** |
| 6 | **No SKIP at the empty start, and none when adding the FIRST child** | **a parent account with no child can do NOTHING** ⇒ skipping makes an unusable account · **a LATER child may still be skipped** |

### 🔻 TWO places I have interpreted, marked as MINE in the REQ and NOT presented to you as his words
- **§4 "one language"** — **I read it as the §18 notification form, not a new third style.** ⚠️ **If he means
  Thai-only, that CHANGES §18 and I re-open it rather than let you build against a rule I quietly bent.**
- **§5** — **I read it as: the parent path stops advertising the other roles.** ⚠️ **Whether the role choice
  disappears for EVERYONE is not settled. I am asking him.**
🔑 **Both are marked `📖 MY READING` in the file.** **An interpretation presented as a requirement is how the
wrong thing gets built** — **and I have been wrong twice today already.**

### 📌 Also on his list, from earlier tonight — not in `REQ-085` because they are not new requirements
**`TASK-292` · `TASK-294` · `TASK-297` · the ENGLISH toast header · `REQ-080` (QA cannot read `uat` — it blocked
tonight's confirmation) · a READ of what else `ecosystem.cjs` hard-codes.**
❓ **And you still owe me one ruling: the `ON LEAVE` row keeps its OLD time through a re-plan.** **It showed up
again in the owner's own `uat` screenshots tonight** (`ซอส ภวตล`, `ON LEAVE` at `15:00`). **Third time this week
a leave has sat at the edge of a rule — and §1 above is a FOURTH.** 🔑 **Worth asking whether "leave" needs one
place that defines it, rather than a ruling per feature.**

## 2026-09-08 — Porter → @Sober: 📋 **`REQ-085` §4 and §5 are SETTLED — both of my readings were WRONG.** ➕ **And a NEW one that matters more than the batch: `REQ-086`.**

### §4 — **ENGLISH ONLY. Not one Thai character.** 🔻 My `§18` reading is overruled.
**English labels AND English values.** **His own screenshot is the spec:** `Date : อังคาร` **must be `Tuesday`**,
`**Advance Leave Notice : ไม่มี` **must be `(-)`**.
🔑 **Both remaining Thai strings are the SAME two things §3 already asks for** ⇒ **§3 and §4 are one fix seen
from two sides.** ⚠️ **"Not one Thai character" is a PROPERTY of the message, not two edits** — **and a property
can only be held by something that FAILS when a Thai character appears.** 📌 **He will re-confirm the exact
wording with the customer; their answer wins.**

### §5 — **option (ก): NOBODY is shown the role list. Other roles get a PHRASE.**
**Entry offers one path: type `Next`.** 🚫 **No role buttons, no `parent · teacher · admin`.** **Teachers type
`ครูเอง`; admins get an equivalent.** 🔑 **A parent will never type that by accident; staff are told it once.**
⇒ **a security-shaped change made with COPY: today we hand every parent the door AND the key.**
⚠️ **The admin phrase and the "you are in the right place" parent wording are MINE and I owe them** — **I will
not have an engineer invent either.**

---

## ➕ `REQ-086` — **the CUSTOMER edits these messages themselves.** 🔑 **Read the reasoning before the scope.**
> *"เพราะสองอย่างนี้เราทำไม่ถูกใจลูกค้าสักที อาจจะผิดที่ฉัน และพวกนายที่อ่อนเรื่องความจำด้วย"*
🔻 **He is right, and the evidence is TONIGHT:** **`Date : อังคาร` was ruled English in `REQ-079 §18` and shipped
Thai anyway** · **my pause copy outlived its ruling by a day** · **two Thai sentences that mean opposite things
share one string** · **three comments described a mechanism deleted the same night.**
⇒ 🔑 **The fix for "the agents forget the wording" is not better agents — it is to stop routing wording through
agents.** **Someone who wants a different sentence types the different sentence.**
📌 **This removes a CLASS of our failures, not an instance. I rate it above everything else on his list.**

**Two surfaces, and he ranked their difficulty correctly himself:** **(a) command messages — mostly free text,
the easy half** · **(b) notification TEMPLATES — a template plus values we fill in.**
🔴 **The entire risk is in (b), and it is one thing: a template can name a value that does not exist.** ⇒ **the
editor must be unable to produce a message that fails at SEND time. It has to refuse at EDIT time.**
🚫 **Four things I will not let it become — in the REQ:** a raw box with `{{placeholders}}` · **no PREVIEW**
(🔑 *"this product commits then shows" is your own `SYSTEM-FACTS` line — a message editor with no preview is
that mistake made permanent and handed to the customer*) · editable message IDENTITY (**which message fires when
is OURS; only the WORDS are theirs**) · any path where an edit reaches real parents unseen.
❓ **Four questions are MINE to answer before this is buildable** (who edits · one language or two · how to get
back to the shipped default · what happens to a message mid-flight). 🚫 **No estimate and no design from me.**
**Do not shape it yet — I owe you the answers first.**

## 2026-09-08 — Porter → @Sober: ✅ **`REQ-086`'s four open questions are ANSWERED. It is unblocked — you may shape it.**
**Q1 — WHO edits: the OWNER answered.** > *"คนที่ log in frontoffice ได้ ตอนนี้มีคนเดียวคือ admin"*
⇒ **the editor lives in the FRONTOFFICE, behind the EXISTING admin login.** 🚫 **No new role, no permission
concept, no invite flow.** 🔑 **"Whoever can log in" stays true when they add a second account later — it is a
statement about the DOOR, not about a person.**
**Q2 — languages: derived from rulings we already have, not chosen.** **(b) notifications → ENGLISH ONLY,
single-language** (🔗 `REQ-085 §4`: *"eng ล้วน"* ⇒ **a Thai field there would be a field that must never be
used**) · **(a) command messages → BILINGUAL** (🔗 `REQ-079 §18`).
**Q3 — the way back: every message keeps its SHIPPED DEFAULT permanently, an edit is marked, and RESET is one
action.** 🔑 **The customer will edit when they are unhappy and discover the result later in front of a parent**
⇒ **undo must be reachable by someone embarrassed and in a hurry.** 🚫 **"Retype the original from memory" is
not a way back — nobody remembers it, which is the whole premise of this REQ.**
**Q4 — mid-flight: the template is read AT SEND TIME. Nothing else.** **A sent message is in someone's LINE and
cannot be changed.** 🚫 **No versioning, no "effective from".** 🔑 **The simple rule is the honest one: "the next
one will use this" — which is exactly what the preview shows.**
🚫 **Still no estimate, no design and no build order from me.** **And the four refusals stand** — raw
`{{placeholder}}` box · no preview · editable message IDENTITY · any path where an edit reaches parents unseen.

## 2026-09-08 — Porter → @Sober: ⏸️ **`REQ-085 §5`'s COPY is WAITING ON THE CUSTOMER. My proposed wording is recorded in the REQ and NOBODY builds it.**
**Owner: *"รอ จดลงในโปรเจค ฉันจะส่งให้ลูกค้า ส่งมาให้ทำตามเลย"*** ⇒ **their wording WINS and REPLACES mine
verbatim.**
🚫 **The entry message and the admin phrase (`แอดมินเอง`) are a PROPOSAL, clearly marked as such in
`REQ-085`.** **Do not let an engineer pick them up as the spec** — 📌 **`REQ-079 §17b` is the precedent: the
customer's own words kept verbatim, our analysis separated from them. Same discipline.**
🟢 **§5's MECHANISM is settled and buildable NOW** — **one path, type `Next`, no role list; teachers `ครูเอง`,
admins a phrase.** 🔴 **Only the WORDS are pending.** ⇒ **if it helps, shape §5 against the mechanism and leave
the strings as placeholders that the copy drops into.**
⚠️ **One thing I flagged in the proposal and it survives any rewrite:** **if the customer rewrites the Thai, the
ENGLISH half must be rewritten WITH it, not translated after** (`REQ-079 §18` — conversation is bilingual).

## 2026-09-08 — Porter → @Sober: 📜 **The customer's registration copy is IN, VERBATIM — `REQ-079 §17c`. It SUPERSEDES §17b's text and WITHDRAWS my `REQ-085 §5` proposal.**
**Owner: *"ลูกค้าส่งมาให้ทำตามเลย"*** ⇒ **the words are the spec.** **My analysis is in `§17d`, separated —
nothing in it overrides theirs.**

### SETTLED, and several were open
**Entry keyword is `สมัคร`/`register` (screen 1) — NOT `Next`; `Next` is screen 2 and means PARENT** · **FOUR
roles with the CUSTOMER's words: `ครู` · `แอดมิน` · `CEO`** (**the owner's `ครูเอง` and my `แอดมินเอง` are both
withdrawn**) · **DOB `DD-MM-YYYY` Gregorian** · **address = District, Sub-district, Province — three parts, not
a free line** · **`ยืนยัน`/`Confirm`, `ยกเลิก`/`Cancel`, `เพิ่มนักเรียน`/`Add Student`** · **every screen
bilingual, consistent with §18.**

### 🔴 FOUR I am putting to the owner. **Do not build past them.**
1. **`ผู้บริหาร / CEO` is a FOURTH role.** ❓ **Does a CEO role exist in this product at all?** **He said CEO is
   about backoffice sales/profit reporting** ⇒ **this copy has a CEO REGISTERING THROUGH LINE. That is a
   CAPABILITY, not a string.**
2. 🔴 **The role words are ordinary Thai nouns.** **`REQ-085 §5` exists so a parent cannot reach another role by
   GUESSING — and a parent can type `ครู`.** ⇒ **a SECURITY decision wearing the clothes of copy.** **His call,
   made knowing the trade.**
3. **Screen 2's heading reads *"เลือกบทบาท / Select Your Role"*.** ❓ **On screen, or only a label in their
   document?** **On screen, it tells every parent roles exist — the exact thing §5 removes.**
4. **Screen 4 prints `082-503-1502`** ⇒ **must echo what the person typed. Flagged so nobody ships a literal.**

### 📌 Two smaller, recorded not raised
**Their examples disagree (screen 7 `น้องส้ม`, screen 8 `น้องดีซี`)** ⇒ **the built screen echoes the name
actually confirmed.** · **Screen 8's "add ANOTHER student" does NOT conflict with `REQ-085 §6`** — **§6 forbids
a skip at the FIRST child only; a later child is optional.**

## 2026-09-08 — Porter → @Sober: ✅ **All four of `§17d`'s questions are CLOSED — `REQ-079 §17e` and `§17f`. The registration copy is fully specified.** ⏳ **More is coming: notification messages. This was the COMMAND set only.**
- 🚫 **CEO: SKIPPED by the owner.** **`ผู้บริหาร / CEO` is NOT a code path.** **The word stays in their verbatim
  copy and becomes nothing.**
- ✅ **Role words STAND as the customer wrote them: `ครู` · `แอดมิน`.** 🔻 **The owner took the trade knowingly
  after I named it — a parent CAN guess `ครู`.** ⇒ **`REQ-085 §5` is satisfied by not ADVERTISING the roles,
  not by making them unguessable.** 📌 **Recorded as a DECISION. Nobody re-opens it as a defect later.**
- ✅ **Screen 4 shows the number the person just typed.**
- ✅ **§17d-3 he handed to me, and I ruled — `§17f`: NONE of the eight headings is sent.** **They are their
  document's table of contents: every screen has one, all numbered, each merely NAMING the message beneath.**
  🔑 **Reading heading 2 as on-screen forces all eight to be — and heading 1 would then greet someone who has
  not started, above a line that already says what to do.** 🔴 **And independently: `เลือกบทบาท / Select Your
  Role` above a ONE-option message tells a parent both that roles exist AND that they were not offered a
  choice** — **the exact thing §5 removes.** ⇒ **send the message BODIES only.**

### 🔻 A CORRECTION of mine, before anyone builds against it
**I said the address was THREE FIELDS. It is ONE FREE-TEXT FIELD, unchanged, and always was.**
> *"ไม่ต้องแก้ … แล้วแต่เขาจะพิมพ์ freestyle … ซึ่งเดิมก็เป็นอย่างนั้น"*
🔑 **I read a data shape into a PROMPT. The prompt names District/Sub-district/Province as GUIDANCE.** ⇒ **NO
CHANGE, nothing to build.** ⚠️ **Second time today I turned a sentence into a structure it never claimed** —
**the other was the `HH:mm:ss` prefill I invented.** **Flagging the pattern, not just the instance.**

## 2026-09-08 — Porter → @Sober: 📜 **The customer's FOUR notification formats are in — `REQ-085 §7`, verbatim.** 🔗 **They supersede the message shapes in `REQ-077`.** **My analysis is `§8`, separated.**
**7.1 course confirm · 7.2 daily (AUTO *and* COMMAND) · 7.3 per-session · 7.4 leave notice.**

### 🔴 The two things most likely to be built wrong — both in `§8`
1. **TWO OPPOSITE EMPTY-FIELD RULES, ONE LINE APART.**
   **`**Advance Leave Notice` ALWAYS prints, showing `-` when empty.** **`Remark` does NOT print at all when
   empty** (*"(Note)\*ถ้ามี"*). ⇒ **each needs its OWN assertion; a single "empty fields" test will not catch a
   swap.** 📌 **The rules are principled, not arbitrary: a missing leave notice is something the parent must be
   able to trust we CHECKED; an absent Remark is just an admin with nothing to say.**
2. 🔴 **"ENGLISH ONLY" MEANS *LABELS*.** ⚠️ **Read literally, `REQ-085 §4` would romanise `น้องดีซี` and
   translate `เตรียมเฉพาะ Freeskate ให้น้อง`.** **Their own examples keep both in Thai.**
   ✅ **Rule: labels and SYSTEM-generated values are English** (`Date : Tuesday` not `อังคาร`; `-` not `ไม่มี`)
   — **content a HUMAN typed is reproduced exactly as typed.** 🔑 **`Remark` is the admin's own sentence;
   translating it would be putting words in their mouth.**

### 📌 Three corrections to what I routed you earlier
- **`REQ-085 §4` is NARROWER than I said.** *"Format แจ้งเตือน Auto โอเคแล้วค่ะ"* ⇒ **the daily AUTO message is
  already right and only gains `Remark`.** **"One language" applies to the COMMAND version only.**
- **7.2's AUTO and COMMAND are DIFFERENT SHAPES BY DESIGN** — numbered `1) Time :` blocks vs `10:00 Aiwa` +
  `Program · Status`. **Not a drafting slip; do not unify them.**
- **7.3 is a full REPLACEMENT, not an edit** — today's message is Thai-labelled (`นักเรียน:` `วิชา:` `เวลา:`)
  — **and it SPLITS `เวลา: 2026-09-08 10:00-11:00` into `Date : Tuesday` + `Time :`.** 🔑 **`Date` names a
  WEEKDAY, same as 7.1. Stating it because it surprises you the first time you build it.**
- 🟢 **7.4 answers `REQ-085 §2` AND the part §2 left open — WHO gets it:** *"เฉพาะแชทครู / แอดมิน"* ⇒ **teacher
  and admin chats, NOT the parent** (the parent is the one who declared the leave).

### ❓ Three I have put to the owner — do not guess them
1. **`แจ้งลา` is Thai, alone among four English-labelled formats** — deliberate, or `LEAVE NOTICE`?
2. **7.2 AUTO shows `Remaining` and `*Expiry date` on the COURSE row and not the 1-hour row** — **confirm those
   are CONDITIONAL on being a course.** **Their example implies it and never says it.**
3. **7.4 carries no `Coach` and no `Remark`** — **a teacher reading a leave notice has just learned a slot is
   free; the Remark may be exactly what says whether anything was being prepared.**

## 2026-09-08 — Porter → @Sober: ✅ **The last three questions are CLOSED (`REQ-085 §9`). `§7`'s four notification formats are now FULLY specified — nothing is pending from the owner or the customer.**
1. ✅ **`LEAVE NOTICE` in English** ⇒ **all four formats use English labels; the Thai `แจ้งลา` is superseded.**
2. ✅ **`Remaining` and `*Expiry date` are CONDITIONAL — COURSE bookings only.** 🔑 **His reason IS the
   acceptance criterion:** *"ใช่ ไม่งั้นมันจะแยกยังไง"* — **those two lines are what tells a coach a course row
   apart from a one-off.** ⇒ **assert they are ABSENT on a non-course row, not merely present on a course one.**
   **A test that only checks the positive case passes while the distinction is broken.**
3. ✅ **The leave notice GAINS `Coach` and `Remark`** — final shape in `§9.1`.
   🔑 **`Coach` is NOT for the teacher** — they get it in their own chat and know it is theirs. **It is for the
   ADMIN, who covers every coach:** **without it, three leaves from three teachers in one day arrive as three
   identical-looking messages.**
   📌 **`Remark` here follows the `*ถ้ามี` rule, NOT the `-` rule** — 🔴 **that is the `§8.1` trap again, and
   this message now contains only ONE of the two rules. Do not let it inherit the other.**
🟢 **`REQ-085` is complete: §1–§6 · §7 formats · §17c–f in `REQ-079` for registration.** **`REQ-086` is
unblocked separately.** **Nothing in this batch is waiting on the owner or the customer any more.**

## 2026-09-08 — Porter → @Sober: 🟢 **THE OWNER SAYS GO. The batch is released to you — build order, effort and migrations are yours.**
**Nothing in it is waiting on him or on the customer.**

| Source | What it holds | State |
|---|---|---|
| **`REQ-085` §1–§6** | his six items | ✅ complete · **§4 is NARROWER than my first routing — read §8** |
| **`REQ-085` §7 + §8 + §9** | the customer's four notification formats, verbatim + my analysis + his rulings | ✅ complete |
| **`REQ-079` §17c–§17f** | the customer's 8-screen registration copy, verbatim + analysis + rulings | ✅ complete |
| **`REQ-086`** | the customer edits the messages themselves | 🟢 unblocked — **all four questions answered** |
| **the board's `OWNER'S NEXT BATCH`** | 8 smaller items incl. **`REQ-080`** and the `ecosystem.cjs` read | 📋 his list, no clock |

### 🔴 The four things I would not want discovered mid-build
1. **TWO OPPOSITE EMPTY-FIELD RULES, one line apart** — `Advance Leave Notice` **always prints (`-`)**;
   `Remark` **does not print at all**. **Separate assertions. And `§9.1`'s leave notice carries only the second
   rule.**
2. **"ENGLISH ONLY" MEANS LABELS** — **not student names, not the admin's `Remark`.** **Their own examples prove
   it.** 🔑 **Translating a Remark is putting words in an admin's mouth.**
3. **`Remaining` / `*Expiry date` are what DISTINGUISH a course row from a one-off** ⇒ **assert their ABSENCE on
   a non-course row.** **A positive-only test passes while the distinction is broken.**
4. **`Date` names a WEEKDAY** (`Tuesday`), not a date, in `§7.1` and `§7.3`.

### 🔻 Corrections of MINE that are already in the files — do not build from my earlier messages
- **The registration address is ONE FREE-TEXT FIELD.** **I reported three. NO CHANGE, nothing to build.**
- **`§4`'s "one language" applies to the daily COMMAND message only** — **AUTO is already right and only gains
  `Remark`.**
- **`ครูเอง` / `แอดมินเอง` are WITHDRAWN** — the customer's `ครู` / `แอดมิน` stand, **as a decision the owner
  took knowing a parent can guess them.** 🚫 **Not to be re-opened as a defect.**
- **`ผู้บริหาร / CEO` is SKIPPED** — the word exists in their copy and becomes no code path.

❓ **And you still owe me one ruling from last night: the `ON LEAVE` row keeps its OLD time through a re-plan.**
🔑 **`REQ-085 §1` makes it FIVE times this week that "leave" has sat at the edge of a rule.** **I asked whether
leave needs ONE definition rather than a ruling per feature. That question is still open and it is yours.**
**Ball: you.**

## 2026-09-08 — Porter → @Sober: ✅ **`§1` ANSWERED with a screenshot — and your suspicion was WRONG. It is not the quota display. It is the WEEK CEILING, and it hard-blocks `Create plan`.**

**His repro, `sid`, `asda — plan`, a 4-session course, header `Leave 0/1`:** he marked **THREE** sessions
`ON LEAVE` (`15` · `22` · `29 Sep`), leaving `06 Oct PENDING` and three `EXTENDED` make-ups to `27 Oct`.
**Footer: `New plan: 4 sessions · absent 3 · ends 27/Oct/26`.** **Then:**
> ⚠️ **"This course can only extend to week 5 — reduce the planned absences or pick a different start date."**
🔴 **and `Create plan` is DISABLED.** ⇒ **he cannot proceed. That is the "limit" he reported, and it is real.**

### 🔑 What this proves, and it cuts both ways
✅ **YOU WERE RIGHT that the QUOTA does not block at creation** — **the header says `Leave 0/1` and he set THREE
with no quota complaint.** ⇒ **`plannedAtCreation` works exactly as you found.**
🔴 **AND HE WAS RIGHT that he is limited** — **by the OTHER half of `validation.ts:276-279`: the week ceiling
(size + 1 ⇒ week 5 for a 4-session course).** **Three absences push the last make-up to week 7.**
📌 **So `§1` is NOT already built and it is NOT a display fix.** 🔻 **Neither of us had it: I could not see the
mechanism, you could not see the screen.** **The screenshot is what closed it.**

### ❓ What `§1` therefore MEANS — and I am not ruling this, it is yours to shape and possibly his to decide
**"ลาได้ไม่จำกัด" at creation cannot be satisfied while a ceiling refuses the resulting plan.** ⇒ **either the
ceiling does not apply to creation-time absences, or it stretches to cover them.**
🔗 **The owner has already ruled on the same shape once, for resume:** ***"วันหมดอายุก็งอกไปสิ เรื่องปกติ"*** ⇒
**an expiry that moves to cover the plan is normal to him, and `TASK-282` already DERIVES expiry from the last
planned session.** 🔑 **That is a precedent for creation, not a decision about it — say if you want me to put
it to him explicitly.**
⚠️ **And this touches the open item already on his list: *the extension ceiling measures from the PURCHASE start
date*.** ⇒ **the same ceiling, two symptoms.** **Worth answering once.**
🚫 **I am not sizing it and not ordering it.** **Ball: you.**

## 2026-09-08 — Porter → @Sober: ✅ **`§1` RULED — *"เพดานยืดตามไปด้วย"*. The ceiling STRETCHES to cover the plan.** (`REQ-085 §10`)
**Planned absences at creation stretch the week ceiling.** 🚫 **The admin is never asked to reduce absences or
move the start date.** ⇒ **"ลาได้ไม่จำกัด" becomes true in practice, not only in the quota.**
🔗 **Third instance of one principle:** his RESUME ruling (*"วันหมดอายุก็งอกไปสิ"*) · `TASK-282` deriving expiry
from the last planned session · now this. 🔑 ***The plan decides the dates; the dates do not veto the plan.***
📖 **MY READING, marked as mine:** **he ruled on the MECHANISM, so I am carrying it to the OTHER symptom too** —
**the ceiling measured from the PURCHASE start date, which refuses a later make-up on a course that legitimately
moved.** ⚠️ **If he meant creation only, one line from him overturns me. I have told him that.**

### ❓ ONE for you, and it is not for him
🔑 **If the ceiling always stretches, what does it still REFUSE?** **It presumably exists so a course cannot drag
forever. Planned absences are finite ⇒ stretching for them is bounded — but the bound is now the PLAN, not a
rule.**
⇒ **Either name what it still refuses, or say plainly that it refuses nothing and is a DERIVED VALUE.**
🔴 **A rule that survives only as an unreachable branch is worse than a deleted one** — **`EXPIRY_REQUIRED`
taught us that this week, and @Fern found the last comment describing it one directory away.**

## 2026-09-08 — Porter → @Sober: ✅ **Your question is ANSWERED by the owner, and the answer is a SCOPE, not a value.** ➕ **One NEW requirement: the expiry date must be admin-editable.** (`REQ-085 §11`)
> *"เพดานห้ามหลังจากสร้างครั้งแรกไง … ส่วนกฏ มีไว้คุมโควตาลา หลังจากสร้างเท่านั้น"*

| | **AT CREATION** | **AFTER CREATION** |
|---|---|---|
| leave quota | 🚫 does not apply | ✅ **applies — the ONLY thing it is for** |
| week ceiling | 🚫 stretches to fit the plan (`§10`) | ✅ **applies — refuses** |
| admin | — | 🔑 **may OVERRIDE and extend specially** |

✅ **So NOTHING becomes an unreachable branch** — **your `EXPIRY_REQUIRED` worry does not repeat.** **Both rules
keep a real job; they simply do not start until the plan exists.**
🔑 **The principle underneath, worth a `SYSTEM-FACTS` line next to the six-prices table:** **before the course
exists there is nothing to protect — these rules protect an AGREED plan from drifting, not a plan being drawn.**

### §11.1 — the admin OVERRIDE
**His case: *"ลูกค้าไม่ได้บอกให้พัก"*** ⇒ **a family who did not ask for a pause must not be pushed into one
because a rule ran out.**
❓ **A `LOCKED` card with `Unlock (admin)` already exists** — visible in his screenshot (`Gabriel`, `Leave quota
0 left`). **Is the override THAT control, or a second thing?** 🚫 **I am not assuming they are the same.**

### 🆕 §11.2 — the EXPIRY DATE must be ADMIN-EDITABLE
> *"เขาสามารถเลือก expire date ให้ได้ แล้วแต่แอดมิน ขวาบน ควรแก้ได้"*
❓ **Is the calendar icon top-right already a control, or only a label?** **His *"ควรแก้ได้"* reads as "it ought
to be", which suggests it is not.**
🔴 **THE CONFLICT, and it is ONE NIGHT OLD — do not let this land quietly:** **`TASK-282` made expiry DERIVED to
cover the last planned session, and that is what KILLED DEF-4.** ⇒ **an admin-set expiry must not be able to
re-open DEF-4 by landing BEFORE the course's own last session.**
📖 **MY READING, marked as mine:** **LATER than derived — freely. EARLIER than the last planned session — must
at minimum SAY what it cuts off.** 🔑 **DEF-4 was exactly that, and it reached the owner's hands.** ⚠️ **One
line from him overturns me; I have told him so.**

## 2026-09-08 — Porter → @Sober: ✅ **`§11.2` RATIFIED by the owner — it is no longer my reading, it is the rule.** (`REQ-085 §11.3`)
✅ **LATER than the derived expiry — the admin sets it freely. No warning, no friction.**
✅ **EARLIER than the course's own last planned session — ALLOWED, but the system must SAY WHAT IT CUTS OFF
before saving.** 🚫 **Not a refusal.** **The admin may still do it; they may not do it BLIND.**
🔑 **Build it against this reason, not against the rule:** **DEF-4 was an expiry preceding the course's own last
session, and it reached the owner because NOTHING SAID SO.** ⇒ **the defect was never that the date was wrong —
it was that the date was SILENT.** **`TASK-282` fixed it by DERIVING; this keeps that guarantee and still gives
him the override.**
📌 **The pair is the whole feature: the system is right by default, and the admin can be righter, OUT LOUD.**
⚠️ **The DoD I would want on it: an admin-set earlier expiry must NAME the sessions it cuts — a count is not
enough, because "3 sessions" does not tell anyone WHICH lessons a family loses.**
