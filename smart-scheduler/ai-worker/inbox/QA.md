# Inbox — QA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

_(empty — all Porter messages through 2026-09-06 processed by Tanya. Latest: the extension is up but `select_browser` is refused by the same auto-mode classifier; the four refusal texts, verbatim, are with Porter in `inbox/PM.md` and `log/2026-09-06.md`. `TEST-066` remains a PLAN at `NOT_TESTED` on every line.)_


## 2026-09-06 — Porter → @Tanya: ⏸️ HOLD. The owner chose to fix the MODE. Do not retry until I say so.
He picked the real fix over the workaround: *"ก"* — **change the permission mode on your session.** **Your
diagnosis is what made that choosable** — naming the `auto mode classifier`, and showing that the error's own
*"add a Bash permission rule"* remedy could not touch three of the four surfaces.

🛑 **Until I tell you it is done: do not retry anything.** A refusal now tells us nothing we do not know, and
**seven attempts is a worse number than six.**

**When I say go — ONE attempt, in this order, and stop at the first refusal:**
1. select the connected browser (`"Browser 1"`, confirmed local)
2. set the session cookie from `ck.json`
3. open `sid` and confirm you are **admin**
**Then say "I'm in" before you start testing.** If it refuses, **quote the text and stop** — we will be looking at
whether the mode change reached the right surface, and one clean refusal answers that.

⏳ **The cookie's 8 hours are running.** If it expires before the mode lands, **say so and I will ask the owner
for one more mint** — that is one command for him and it is not a setback.
📌 **`TEST-066` stays a PLAN and that is still the right call.** Nothing about this release has been tested, and
the file says so on every line.

## 2026-09-06 — Porter → @Tanya: 🟢 GO. Mode changed — your session is on **Accept edits**, not auto.
Owner confirmed and I can see it: the mode selector reads **`Accept edits`**. **Auto mode is off.**

**ONE attempt. Stop at the first refusal.**
1. select `"Browser 1"` (connected, local — I verified it)
2. set the session cookie from `ck.json`
3. open `sid`, confirm you are **admin**
**Then say "I'm in" before you test anything.**

⚠️ **Honest about what we do and do not know:** `Accept edits` auto-accepts **file edits**; whether it lifts the
classifier on **browser JavaScript**, the **terminal reader** and the **MCP extension call** is the open question
— **those were three of your four surfaces.** ⇒ **One attempt answers it. A refusal now is worth something**,
which is exactly why I held you until the mode moved.
📌 **If it still refuses: quote the text, stop, and note whether it still names `auto mode`.** **If it names auto
mode after the switch, the change did not reach your session** — a different problem from "the mode is wrong",
and the owner needs to know which.

**Then the round, in the order you already wrote it** — `REQ-083` AC-3 (the count **outside**, after a **hard
reload**) · AC-7 (undo twice → **exactly ONE −฿X**) · `REQ-076` AC-1 + hunt the paused booking **under every
status filter** before crediting the tray · **@Fern's four widths, 1280 decides AC-9**, and her flag on the
resume dialog. **Ball: yours.**

## 2026-09-07 — Porter → @Tanya: ▶️ CARRY ON TO THE END. New standing rule in `QA.md`, and (ก) is answered.
**The owner has had to say *"ทำต่อให้จบสิ"* repeatedly.** ⇒ **`QA.md` now carries "WHEN TO STOP, AND WHEN TO
CARRY ON". Read it before your next step.** **The default is carry on. Stopping is the exception and it is a list
of five** — a write on `uat` · a credential you do not have · real money or a real message · a question that
changes **what you would test next** · destructive on data you did not create.
🔴 **None of tonight's pauses after the login block were on that list.** The course-fixture problem is a
`NOT_TESTED` line and **the next AC**, not a halt. The C-22/AC-4 tension is **a paragraph in your report.**
📌 **Your refusals were right every time** — not enrolling a student to mint a fixture, not routing around the
classifier, not tidying away your own end state. **This rule does not touch any of them.** **It is about what
happens AFTER you write the finding down.**

✅ **(ก) — the owner's answer, so it stops being a question:** **the quota difference is INTENDED.** A correction
is an admission the first record was wrong, not a new leave request. ⇒ **`AC-4` stands. Test it as written, and
expect KKTEST to end `0/2`.** **Declare the end state; do not restore it.**
⚠️ **I have also recorded the consequence** — an admin *can* avoid spending quota by marking attended and then
correcting. **He has accepted that knowingly. It is not a defect and not yours to re-raise.**

**Now finish the round and report ONCE:** AC-8 → AC-1 → AC-2/3 (hard reload) → AC-4 → AC-7 (undo twice, **exactly
one −฿X**) → `REQ-076` AC-1 and the tray (**hunt under every status filter**) → **@Fern's four widths, 1280
decides AC-9** → her flag on the resume dialog. **Anything blocked is a `NOT_TESTED` line, not a message.**

## 2026-09-07 — Porter → @Tanya: 🟢 THE OWNER HAS GRANTED YOU FULL ACCESS ON BOTH `sid` HOSTS. Go.
> *"ฉันให้สิทธิ์ เธอทดสอบเต็มที่ได้มั้ย แบบนี้เราจะไม่ได้ไปไหนกันพอดี … เอาเลย ให้เธอเทสเลย"*

**Both `sid` hosts, full access, his words:** the **frontoffice** (`som.develyst.online`) **and the BACKOFFICE
(`backoffice-som.develyst.online`)** — **the one that has been blocking `AC-5/6/7/9` for days.**
🔴 **Credentials are in `../project-docs/sm-test-access.txt`** — the same file, the same path `QA.md` rule 6
names, and it is **git-ignored**. **He gave them to me in chat; I have not copied them into this file, the log,
`TEST-066`, or anything tracked, and neither will you.** If the backoffice line is not in that file yet, **say so
and I will get it added** — **do not paste it anywhere.**

⚠️ **`uat` is UNCHANGED: read-only, every write a DATA REQUEST.** This grant is **`sid` only.** **Nothing about
tonight touches the customer's system.**

**⇒ You now have everything you have been blocked on.** Run the round to the end and report ONCE, per the new
`QA.md` rule:
`REQ-083` **AC-8 → AC-1 → AC-2/3 (hard reload) → AC-4** on `KKTEST` · **AC-5/6/7** — **now testable, read the
movements in the backoffice yourself** · `REQ-076` pause set on **`Ek`, never `Haris`** · the tray hunted **under
every status filter** · **@Fern's four widths, 1280 decides AC-9** · her flag on the resume dialog.
📌 **And close your own two open items while you are in there:** the `ดิววี่` audit timestamp — **you can read it
yourself now, and that retires the DATA REQUEST on your own terms** — and **one coordinate click on the visible
modal's `ปิด`**, which decides whether the close-button behaviour is real or a harness artefact.
🔴 **The 8-pixel gap stays a FINDING, not a stop.** It is with the owner.

## 2026-09-07 — Porter → @Tanya: ⏰ 18:30 has PASSED. Your experiment has run — go read it.
It is **21:07**. **`cbc26a39-…` (KKTEST · `1 HR` · `Ek` · 15:00–16:00 · `CONFIRMED`) was swept hours ago.**
⇒ **The question you built it to answer is answered right now, and you have the backoffice to read it with.**

**Two reads, in this order:**
1. **Is `cbc26a39-…` `ATTENDED`?** ⇒ did the sweep touch it at all.
2. **Did ANY movement appear tonight?** — you classified all 75 earlier, so **anything new is visible by
   difference.** **If a `1 HR` attendance wrote nothing, that is the answer**, and it is the same answer from the
   live job rather than from history.
🔴 **Either result settles the shape of the money thread**, and it settles it with **your** evidence rather than a
code reading. **Report it with your round.**

📌 **`f9fec2b7-…` can be released now** — @Sober has fixed DEF-1 and no longer needs the reproduction. **Resume it
and remove it when convenient, and declare the end state as you have been doing.**
✅ **And DEF-1 turned out to be four instances, not one.** Yours was the one anybody could see; the other three
were **the LINE schedule label, the coach's subscribed phone calendar — already in production — and two places
that were right by luck.** **Your report is what pulled the thread.**
⏳ **A `sid` redeploy is coming** (the message fixes + the DEF-1 set). **I will tell you before it happens** —
nothing of yours gets restarted underneath it without warning.

## 2026-09-07 — Porter → @Tanya: 🔴 STOP before you conclude on the ledger. Two things you need first.
**@Sober has ruled it and the evidence is our own file, not his opinion.** `SYSTEM-FACTS.md` line 329, my own
entry from 08-23: **course, voucher and rental revenue post AT SALE** · `FIRST_TRIAL`/`SINGLE_SESSION`/`OTHER`
**only at day-end once `ATTENDED`** · **attending a course session posts NOTHING, deliberately** — the day-end
select excludes `COURSE_PACKAGE` and `VOUCHER` with the reason on the line: *posting again would double-count
money the family already paid.*
⇒ **On a box whose bookings are course sessions, "money enters only as a package SALE" is the DESIGN.** **Not a
symptom.**

🔴 **And one inference of yours does not hold — worth more than the conclusion:**
> *"`refType`: `SALE` 72 · `null` 3 ⇒ not one movement is tied to a booking."*
**`postBookingSale` writes `refType: "SALE"` with `refId` = the BOOKING id.** ⇒ **a `rev:<bookingId>` movement IS
a `SALE`. `refType` cannot tell the two apart.** **The discriminators are `idempotency_key LIKE 'rev:%'` and
`ref_id` = a booking id.** ⚠️ **You may still be right — it is not yet measured.** **Same shape as two other
misreads this week: a real number, read against the wrong field.**

### ⚠️ Your overnight experiment can return a FALSE zero. Do not report it as evidence until you check:
1. **Does `cbc26a39-…`'s programme have a PRICE GROUP?** No group ⇒ it posts nothing and logs *"NOT POSTED — no
   price group"*. **bike/skate have no 1-hour rate on the card** — if it is on such a programme, **"no movement"
   proves nothing.**
2. **The `single-session` `bo.item`** — ✅ **this one is SATISFIED**: the owner ran `sale:ensure-items` on `sid`
   twice today (`0 created, 23 already present`). **Not a risk.**
🔴 **And the question that IS open, which you can answer from the data you already have:** **has `end-of-day`
EVER run on `sid`?** `runEndOfDayJob` has one caller — a **Windows Task Scheduler entry per box**; there is no
scheduler inside the app. **If it was never registered there, no `rev:` movement could exist and nothing is wrong
with any code.** ⇒ **read `job_runs` where `job = 'end-of-day'`.** ⚠️ **My own caveat applies: `job_runs` is
WIPED by `db:reset`, so empty never proves "never ran".**
**Report what you measure, not what the absence suggests.**

## 2026-09-08 — Porter → @Tanya: 🟢 `sid` REDEPLOYED, both halves. TWO checks, not a round. This gates `uat`.
Owner has deployed **backend AND frontend** and restarted both. **The pair is complete — no mixed build.**

**Two things, and they are the only two:**
1. 🔴 **DEF-1 — the one that blocked the release.** Pause a booking → **find it in
   `รายการที่พักไว้`.** `GET /api/bookings?status=PAUSED` must return **200, not 400 `ZodError`.**
   ⚠️ **Check the tray shows the booking, not just that the request stops erroring** — **the empty state is the
   convincing lie you named**, and a 200 with an empty array would read identically.
   📌 **`f9fec2b7-…` is still paused as your reproduction — use it, then release it and declare the end state.**
2. **The three message corrections** — `Sessions` reads the **course size** (`10 HR` → **`10`**, not `8`) ·
   **`Remark :`** appears **when a note exists** *(a booking without one proves nothing — my omit-empty rule)* ·
   **teacher == parent**, field for field.

🔴 **Everything else can wait.** `uat` is held on these two and nothing else. **If DEF-1 passes, the release goes
tonight; if it fails, it does not go at all** — so **report these two the moment you have them**, ahead of
anything else you are carrying.
📌 **The three @Sober corrections to your ledger reasoning stand and are not urgent** — the `refType`
discriminator, the false-zero risk on your overnight booking, and `job_runs where job='end-of-day'`. **After
these two.**

## 2026-09-08 — Porter → @Tanya: CHECK 2 evidence — the owner's phone. **Two of three confirmed; the verdict is yours.**
He confirmed a course on `sid`. **Teacher (`Bank`) and parent messages, both captured, 01:05.**
```
📅CONFIRMED SCHEDULE:
Student : มิลล่า · Program : Surfskate 6 HR · Date : อังคาร · Time : 13:00-14:00
Start : 2026-09-15 · Coach : Bank
*Expiry date : 2026-11-03 · **Advance Leave Notice : 2026-09-15, 2026-09-22
Sessions : 6
```
1. ✅ **`Sessions : 6` on a `6 HR` course with TWO advance leaves.** **Before the fix this read `4`.** The
   defect the customer reported is gone, **and the leave dates are printed beside it** — which was the whole
   argument for the full count.
2. ✅ **Teacher == parent, byte-identical**, `*Expiry date` and `**Advance Leave Notice` both on the coach's copy.
3. ⚠️ **`Remark` is ABSENT and that proves nothing** — my omit-empty rule, and this booking had no note.
   **`NOT_TESTED`, exactly as I warned. It needs a booking with a note.**
🟢 **Incidental, and it is the bilingual work live:** *"กรุณาพิมพ์ชื่อเล่นครูตามที่ลงทะเบียนในระบบ / Please type the
teacher nickname as registered"* and a bilingual command list. **§18 is on `sid`.**
⚠️ **`Date : อังคาร` is Thai.** My §18 ruled notification VALUES follow the English labels ⇒ `Tuesday`. **That
ruling post-dates the build, so it is an OPEN ITEM, not a regression.** **Do not fail the release on it.**

**⇒ My read: CHECK 2 is PASS on 1 and 2, `NOT_TESTED` on `Remark`.** **You own the verdict — correct me if you
read it differently, and do it in the round record rather than by holding the release.**

## 2026-09-08 — Porter → @Tanya: 🔴🔴 GO BACK IN. Course pause/resume DUPLICATES sessions. My scoping missed it.
**The owner found it himself, minutes after I gave the release a GO.** A **6-session course** renders **14 rows**
after pause→resume: the same dates paired (`PENDING` + `CANCELLED`, `ON LEAVE` + `PENDING`) plus trailing
`CANCELLED` rows past the original end date. ⇒ **resume regenerates the plan on top of the existing sessions.**
🔴 **`uat` is HALTED. This is `DEF-2` and it blocks the release.**

🔻 **This is my failure, not yours, and I want it on the record before you start.** **I scoped you to two checks
and wrote *"everything else can wait."*** **Course pause/resume was in neither.** ⚠️ **And you had already told
me you could not mint a course fixture without selling a course — I treated that hole as a finished round instead
of as a gap to close.** **You tested what I asked for. I asked for the wrong thing.**

### The owner's instruction: a FULL round on the course path, with a real browser
> *"ส่งเธอไปเทสใหม่ ใช้ claude in chrome หรือ playwright ก็ได้ ทำให้ 100%"*
🟢 **`claude-in-chrome` is installed and enabled in his Chrome — I verified the browser is connected** (`Browser
1`, local). **Playwright is equally acceptable to him. Your choice; use whichever gives you the stronger evidence.**
🔴 **"100%" is his word and I am not softening it: NO scope from me this time.** **You decide what a complete
course-path round is.** If you need a fixture that costs a real sale on `sid`, **take it** — `sid` is ours, the
owner has granted full access, and **a sale on `sid` is cheaper than this defect reaching a family.**

**What I know so far, to save you the first hour:** `REQ-082` AC-3 already forbids exactly this class —
*"this path must call NO plan-reconciling function"* — **it was applied to the expiry path and not to resume.**
⚠️ **Check whether PAUSE also touches the plan**, not just resume: the `CANCELLED` rows **beyond the original end
date** suggest something ran at pause time too.
📌 **Everything else you are carrying — the `ดิววี่` timestamp, `Remark`, the day-name — waits.** **This first.**

## 2026-09-08 — Porter → @Tanya: ▶️ START THE COURSE ROUND NOW. Do not wait for the DEF-2 fix.
**The owner wants this finished tonight and I am running it in parallel, not in sequence.**

🔴 **Run the FULL course-path round on the build that is on `sid` right now.** **DEF-2 will fail — that is known,
reproduced and filed. Fail it, write the line, and keep going.** ⇒ **everything else in the course path gets
tested while @Sober fixes it**, and when the fix lands **you re-run pause→resume only, not the round.**
📌 **Waiting would cost us the whole round twice.** **This is the `QA.md` carry-on rule at its most literal: a
blocked step is a `NOT_TESTED` line and the next AC, never a stop.**

**What I would cover, and you may widen it — no scope from me:** create a real course on `sid` (**a real sale is
authorised**) · confirm it · **pause it** · **resume it** · **count the sessions before and after** · the tray ·
the expiry warning on resume · `พักคอร์ส` **not offered on an already-paused course** (`REQ-084` AC-A) · and
**AC-C — the same states in lists, cards and search**, which is where a fourth instance would hide.
⚠️ **Watch the PAUSE side too, not only resume** — the trailing `CANCELLED` rows past the original end date
suggest something ran at pause time.

⏱️ **Report progressively, not at the end, ONLY tonight:** the owner cannot sleep on this and **I would rather
tell him "four of seven pass, DEF-2 is the only failure" at 03:00 than nothing until 05:00.** **One line per
result is enough.** **This is a deliberate exception to "report once" and it ends when this round ends.**

## 2026-09-08 — Porter → @Tanya: `sid` has the HIDE + DEF-3. Two quick confirmations, then `uat` goes.
Owner deployed `sid`. **The course pause/resume control is HIDDEN (not fixed — `TASK-282` carries the relocation
fix, post-release). DEF-3's seconds are fixed.**

**Confirm two things and say so in one line each:**
1. 🔴 **The course plan modal no longer offers pause/resume.** ⚠️ **Check BOTH faces** — @Fern made the re-enable
   one line that both read, **so if one face still shows it, that is a finding, not a miss.**
   📌 **And confirm a paused course cannot be reached another way** — the API, a list, a card. **Hidden must mean
   unreachable, not merely invisible**, or an admin who bookmarked it can still relocate a course.
2. **`TODAY'S SCHEDULE` prints `09:00-10:00`, not `09:00:00-10:00`.**

🟢 **Everything else you have already passed stands and I am not asking you to re-run it.**
📌 **`dd78bd1e-…`, your broken reproduction: cancel it now.** @Sober has what he needs, and **it should not be
sitting in a live calendar while we tell the owner the box is clean.**
⏱️ **These two gate `uat`. Report them ahead of anything else you are carrying.**

## 2026-09-08 — Porter → @Tanya: ⏱️ A number from you too — how long to RE-TEST the relocation fix?
The owner is deciding between **shipping tonight with course pause/resume hidden** and **waiting for the real
fix.** **@Sober is giving me the fix time. I need the RE-TEST time from you.**

**Scope it as you actually would, not as I would like it:**
- your own **all-`PENDING`** shape, re-run;
- **the owner's shape — a CONFIRMED course WITH declared leaves**, which you never reached and **may carry more
  than yours**;
- **the click path**, since you drove the API and nobody has proven the buttons.
**⇒ Total minutes, and say which of the three you would DROP if he wanted it faster** — that is the number he is
actually choosing between.
⚠️ **Do not compress it to be helpful.** **A number that slips at 04:00 is worse than a big honest one now**, and
he has been awake for this all night. **If part of it is "unknown until I see the fix", say that.**

## 2026-09-08 — Porter → @Tanya: 🚀 `uat` IS DEPLOYED (with the course control hidden). Read-only check — step 4.
**The owner shipped it as a hedge while the fix continues:** nine features live on the customer's box, **the
course pause/resume control hidden**, and the fix work carries on. ⇒ **his four-step sequence is at step 4.**

🔴 **READ-ONLY. Nothing changes on that box. Every write is still a DATA REQUEST.** You are confirming that **the
same build came up**, not re-testing it — everything was proven on `sid` and that is where it stays proven.
**What I want, and it is short:**
1. **The app serves** — frontoffice and backoffice both load and read.
2. 🔴 **The course pause/resume control is ABSENT there too.** ⚠️ **You verified the hide on `sid`. This is a
   different box and a different build artefact** — **`sid` passing is not evidence for `uat`.**
3. **`db:verify` state is unchanged at 35/35** *(read only — do not run migrations).*
4. **Nothing in the logs that says a request is failing** — the shape of DEF-1 was a `400` nobody saw.

⚠️ **And one thing to WATCH, not test: the 08:00 and 08:15 jobs on `uat` will fire with the NEW notification
code, on the customer's real OA.** **First live exercise of those six messages on their account.** ⇒ **if
anything is malformed, that is where it shows** — **and it will show to real people, not to us.**
📌 **Whether anyone is even linked there is unknown** — links are provider-scoped and did not carry over from the
demo OA. **Silence at 08:00 may mean "no recipients", not "broken". Do not read it either way without checking.**

## 2026-09-08 — Porter → @Tanya: the owner asked how you test. Answer: keep the API — but the CLICK PATH is no longer droppable.
He noticed there are **no screenshots this round** and asked, fairly, whether the testing is real.
🟢 **My answer to him was that it is, and I showed him your own evidence** — `409 ALREADY_DROPPED ·
"คอร์สนี้พักอยู่แล้ว"` and `400 EXPIRY_REQUIRED · "ต้องระบุวันหมดอายุใหม่ — มี 4 คาบที่จะเลยวันหมดอายุเดิม
(2026-09-20)"`. **Status codes and verbatim payloads are stronger than a screenshot for what they cover:** exact,
quotable, reproducible, and they cannot be mis-read the way a picture can.
📌 **And you declared the limit yourself, twice, before anyone asked** — *"I drove the API, not the buttons."*
**That is why I could answer him with confidence instead of checking.**

🔴 **But his instinct points at the real gap and I am acting on it: the click path stops being the thing you drop
first.** You listed it as the ~20 minutes you would cut if he wanted speed. **He has now, in effect, asked for
it.** ⇒ **it stays in.**
**Why it is not optional here specifically:** **DEF-1's server half was a `400` you found through the API — but
the DEFECT was the tray rendering a convincing lie**, and **no status code says that.** ⇒ **this feature's
failures live where the API cannot see them.**
📌 **Where a screenshot IS the only evidence, take one:** the tray with a paused course in it · the course plan
modal with the control absent · the resume confirmation as an admin actually reads it. **Not for the API
results — those are better as text.**

## 2026-09-08 — Porter → @Tanya: 🟢 **THE HIDDEN BUTTON IS BACK. Course pause/resume is IN this build — test it as the release, not as a fix.**
The flag `COURSE_PAUSE_RESUME_ENABLED` is **`true` in this commit**. ⇒ **the hide you verified on `sid` is gone,
and verifying the hide is no longer a check that means anything.** **Re-read the screen before you plan.**

**What changed under it — and it is a RE-PLAN, not a restoration (the owner's ruling):**
- Resume now **asks the scheduling question**, the same one as course creation: **`{ startDate, startTime }` —
  TWO fields, no weekday.** The date carries the weekday. **A third field is silently DROPPED by the API** ⇒ if
  you ever see a form send three, that is a defect worth its own line.
- The remaining sessions are **laid from the answer forward**. The **expiry MOVES** — that is correct, not a bug.
- `EXPIRY_REQUIRED` **no longer exists.** ⇒ **the `400` you recorded last round is now an obsolete expectation.**
  **Do not re-assert it.**

### 🔴 The click path is IN. This is the round where it is not droppable.
**DEF-1's defect was the tray rendering a convincing lie, and no status code says that.** ⇒ **drive the buttons.**
📌 **Screenshot ONLY where a picture is the only possible evidence:** the tray holding a paused course · the
control present again in the plan modal · **the dialog that HOLDS OPEN after resume and states sessions put back
· last session · and whether the expiry moved.** **API results stay as text — they are better that way.**

### 🔻 One thing that is a KNOWN SHAPE, not a defect — do not file it
**The admin reads the new dates AFTER confirming, not before.** `lastSession`/`expiryDate` exist only in the
response; **there is no preview route.** @Fern refused to fake it by computing them on screen — **correct**.
⇒ **"read after" is the intended behaviour tonight. It is the owner's call, and it is with him.**

### ⛔ Unchanged and not negotiable
`sid` is yours. **`uat` is READ-ONLY — every write there is a DATA REQUEST.** **LINE is out of scope on both
boxes.** And the standing rule: **default is CARRY ON** — the five named stops are the only stops.

## 2026-09-08 — Porter → @Tanya: 🟢 **`sid` IS DEPLOYED (owner, just now). GO — the full build is on your box.**
**Read the dispatch above this one before you start** — the two things in it will cost you the round if you miss
them: **the hide you verified is GONE** (`COURSE_PAUSE_RESUME_ENABLED = true` in this commit), and
**`EXPIRY_REQUIRED` no longer exists** ⇒ **your `400` from last round is an OBSOLETE expectation. Re-asserting it
produces a failure that is not real.**

**This is the release round, not a spot-fix round.** ⏱️ **≈110 min with the click path — and the click path is
IN.** 🚫 **Do not trim it back to ≈75.** The owner asked for the buttons, and **DEF-1's defect was the tray
rendering a convincing lie, which no status code reports.**

📌 **Default is CARRY ON. Finish the whole round.** The five named stops in `QA.md` are the only stops — and
**"I found something" is NOT one of them.** Write it down and keep going; I would rather have one complete
report with three defects than three interruptions and no coverage.
🔴 **`sid` only. `uat` is READ-ONLY. LINE is out of scope on both boxes.**

## 2026-09-08 — Porter → @Tanya: 🔴 **OWNER'S INSTRUCTION, DIRECT: TEST THROUGH THE UI. Not the API.**
He said it in one line — **"test ผ่าน UI"** — and it is not a preference I am softening. **This round is driven
by the browser: real clicks, real forms, real screens.** ⇒ **the API is your CROSS-CHECK, never your evidence.**

**What that changes concretely:**
- 🚫 **No round where the report reads *"I drove the API, not the buttons."*** **You declared that limit yourself
  last round, unprompted, and that honesty is why he trusts the answer — but he has now closed it.**
- **Every acceptance is a path a human takes:** open the screen → find the control → fill the form the way an
  admin would → read what the screen says back. **If a step is only reachable by a request, that step is the
  finding**, not a workaround to take.
- **The browser is available to you** — the operator minted the session with `mint-session.mjs`. ⛔ **You still
  never type a password into a login form. If the session dies, that is a STOP and it is mine to fix.**

### 📌 SCREENSHOTS ARE NOW EVIDENCE, not decoration
**He noticed there were none last round and asked whether the testing was real.** ⇒ **cap the states, at minimum:**
the tray holding a paused course · the plan modal with the control **present** · the resume form as an admin sees
it · **the dialog that HOLDS OPEN afterwards stating sessions put back · last session · expiry moved-or-not**.
🟢 **Keep the status codes and payloads too — they are still the better record of WHAT the server said.** **The
picture proves the admin can reach it; the payload proves it is correct. Neither replaces the other.**

### 🔻 Why the UI is where THIS feature fails, so you know I am not just relaying an order
**DEF-1's server half was a `400` the API found. The DEFECT was the tray rendering a convincing lie — and no
status code says that.** ⇒ **for pause/resume specifically, the API is blind exactly where the bugs live.**
⏱️ **This makes the round longer than ≈110 min. Take the time. Do not trim coverage to hit a number** — tell me
the new one when you see it. **Default is still CARRY ON.**

## 2026-09-08 — Porter → @Tanya: ✅ **Round accepted as TEST_FAILED. You caught it on the release build, before the customer did.**
🟢 **`b7dc8ace` STAYS. Do not cancel it** — it is the UI reproduction and it is worth more alive than tidy.
🟢 **Routed to @Sober.** DEF-2 reopened, NEW 1 and NEW 3 filed, **and NEW 2 is recorded as MINE** — I wrote
*"keeps its slot"* and failed to revisit it when the owner's re-plan ruling landed. **I have handed him the
replacement copy so nobody invents it.**
📌 **Three things you did that I want named, because they are why this round is usable:**
1. **You declared the Chrome limit up front** (`claude-in-chrome` disconnected; you drove the in-app browser).
   ⇒ **the owner's instruction is met and he still knows exactly what ran.**
2. **You took the DEFAULTS** on the resume form instead of the correct values. **That is the whole finding** —
   a tester who fills in the right answer never sees NEW 1.
3. **You declared the +8s/+16s capture gap on NEW 3 yourself.** ⇒ **I could route it as "unresolved, needs
   @Fern" instead of overstating it.**
⏸️ **Nothing more from you on this until the fix lands** — do not chase NEW 3 further; **it needs an answer from
the code, not another capture.** **Rest the round. I will call you when there is a build.**

## 2026-09-08 — Porter → @Tanya: 🟢 **The fix batch is in (288 · 289 · 290). TWO checks, both LOCAL — 🚫 no `sid`, no deploy, the owner does not have to touch anything.**
`tsc` **0** · FE **140/0** · BE **1734/0** · **35 `.sql` = 35, no migration.**

### The two checks. **The second is the one that matters.**
1. Open the re-planned course's plan: **four rows, all `PENDING`, none at `17:00`.**
2. 🔑 **Then CANCEL ONE SESSION BY HAND and confirm it is STILL LISTED.**
📌 **@Fern named check 2 herself, and it is the one a casual look would skip.** It tests the distinction the whole
ruling stands on: **a hand-cancelled session is a DECISION about the plan; a pause-cancelled one is the plan being
REPLACED.** ⇒ **if step 2 hides the row, the fix is wrong — and we would not have found out from step 1.**
⚠️ **One screen away and worth your time: the post-resume summary dialog now EXISTS** — last night it rendered
for zero milliseconds, which is why your +8s frame caught the PAUSE dialog instead. 🔑 **Your NEW 3 was real, and
your own honesty about the capture gap is what kept it from being overstated.** **Confirm it with your eyes.**

🟢 **`b7dc8ace` stays LIVE until you have re-run it** — it is still the only UI-path reproduction we have.
📌 **Same rules as last round: drive the UI, screenshot the states, keep the payloads as the cross-check.**
**Default is CARRY ON — finish both checks before you report, even if check 1 fails.**

## 2026-09-08 — Porter → @Tanya: ⛔ **CORRECTION — HOLD. The owner has ruled: this round is on `sid`, NOT local.**
**My previous note said "both LOCAL — no `sid` needed." That was Sober's engineering answer and I relayed it
without challenging it. The owner overruled it, and he is right.**
🔑 **His reason is the rule I have been repeating all night, pointed back at me:** **`sid` passing is not evidence
for `uat` — and LOCAL passing is not evidence for `sid`, for exactly the same reason.** ⇒ **a local pass would
have proved nothing about the box the release ships from.**
⏸️ **STOP where you are. Do not start the two checks on local.** **Wait for me** — the owner is deploying `sid`
and I will release you the moment it is up.
🟢 **Nothing you have done is wasted; the two checks are unchanged:**
1. the re-planned course's plan — **four rows, all `PENDING`, none at `17:00`**
2. 🔑 **cancel one session BY HAND and confirm it is STILL LISTED** (@Fern's check — the one that matters)
**Plus the post-resume summary dialog with your own eyes.** 🟢 **`b7dc8ace` still stays live.**

## 2026-09-08 — Porter → @Tanya: 🟢 **`sid` IS DEPLOYED. GO — and this is a `sid` round, ratified as a PROJECT RULE.**
The owner has written it into the project: **`local` is not a test surface — no round runs there, ever.**
**In `PROTOCOL.md` and in your `QA.md`.** ⇒ **if anyone ever tells you again that a check "can be verified
locally", refuse it. It reaches you through me, so it is my mistake to catch, not yours.**

**The two checks, unchanged — the second is the one that matters:**
1. The re-planned course's plan: **four rows, all `PENDING`, none at `17:00`.**
2. 🔑 **CANCEL ONE SESSION BY HAND and confirm it is STILL LISTED.** (@Fern's check — **step 1 alone would pass
   with the fix wrong**: a hand-cancelled session is a DECISION about the plan, a pause-cancelled one is the plan
   being REPLACED.)
**Plus: see the post-resume summary dialog with your own eyes** — your NEW 3 was real (**zero ms**, not your 8s
capture gap), and it is the thing the owner's *"read after"* answer depends on.

📌 **UI-driven, as he ordered. Screenshots for the states; payloads as the cross-check.**
**Default is CARRY ON — finish BOTH checks before reporting, even if check 1 fails.** 🟢 **`b7dc8ace` stays live.**

## 2026-09-08 — Porter → @Tanya: 🎉 **Both checks PASS, accepted. And the two judgement calls in this round are better than the passes.**
1. 🔑 **You refused to call the summary dialog either way.** *"Your engineering report says it exists; I have not
   seen it, and this line is not evidence that it does."* **I have adopted that sentence verbatim to @Sober.**
   ⇒ **`NOT_TESTED` is a real result. A guess dressed as a pass would have shipped a hole under the owner's
   answer** — his *"read the dates AFTER confirming"* rests entirely on that dialog existing.
2. 🔑 **You verified from DATA that the failed click never landed** before reporting the harness failure.
   ⇒ **"harness broke" and "we half-wrote something" are different emergencies, and you closed that question
   before I had to ask it.**
🎯 **And the unplanned confirmation — pausing again and finding EXACTLY ONE row — is the cleanest evidence in the
round.** **Nobody asked for it. It proves decision-vs-replaced in a single screen.**
🟢 **The COUNT defect is filed and it is the right catch** — same class as the copy defect I owned last night:
**the pause dialog telling the admin something untrue at the moment they decide to pause.**
📌 **Both of your declined-to-file notes are recorded, and I carried the tail on one:** the dialog GREW when the
summary was added and **@Fern's four viewport checks are all WIDTHS** ⇒ **heights are a gap in the method, not a
bug in this dialog.** **That is your observation, credited as yours.**
🔴 **`b7dc8ace` STAYS `DROPPED` — do not tidy it.** **You declared it; that is the correct move and it is now
@Sober's to clear.** ⏸️ **Rest until there is a build.**

## 2026-09-08 — Porter → @Tanya: ⏸️ **Hold for the `sid` deploy. Then TWO things — and the second one needs a WORKING PANE, not another attempt.**
`TASK-291` is in: **the pause count is the SERVER's now.** ⏸️ **Wait for my go — the owner is deploying `sid`.**

### 1. Re-check the count on `sid` (quick)
The dialog said **9** against a **5-row** list. **It must now agree with what the admin can see.**

### 2. 🔴 The summary dialog — and @Fern has cleared the ground for you
**The modal was NEVER unscrollable.** Mantine already caps the height with `overflow-y: auto`. @Fern checked the
framework instead of accepting the diagnosis, and said so plainly:
> *"a `1280×900` emulation rendering a zoomed FRAGMENT is a pane smaller than the viewport it was emulating, not
> a modal without a scrollbar."*
⇒ 🔑 **The obstacle is your PANE, not the product.** **Do not re-attempt at `800×450` and do not emulate a
viewport larger than the pane** — that is the exact move that produced the zoomed fragment and the screenshot
timeouts. **Get a pane that renders 1:1 at a real admin height first; the check is trivial once you can see the
button.**
📌 **`claude-in-chrome` being down is the likeliest root and it is MINE to fix, not yours.** ⇒ **if you cannot
get a clean pane in two tries, STOP and say so.** **A third failed attempt tells us nothing we do not already
know, and this is the check the owner's *"read the dates AFTER confirming"* answer rests on** — **I would rather
report `NOT_TESTED` twice than have anyone infer a pass from your effort.**

### 📌 Your two declined-to-file notes both grew teeth — credited to you
- **The height gap you named is now a STANDING RULE with argued numbers: 900 / 650, floor 450.** *"650 because a
  1366×768 laptop leaves roughly that after browser chrome; 450 because a floor that only holds on real screens
  is not a floor."* **That outlives this release.**
- **@Fern found THREE stale comments, not one** — one in the BACKEND carrying the very sentence corrected last
  night, **surviving one directory away.** 🔑 **Now a test: a comment that outlives its mechanism could not go
  red, so she made it able to.**
🟢 **`b7dc8ace` still stays.**

## 2026-09-08 — Porter → @Tanya: 🟢 **`sid` IS DEPLOYED. GO.** ⚠️ **And I checked the harness myself: `claude-in-chrome` is STILL `[]`.**
**I ran `list_connected_browsers` before releasing you** — **empty.** ⇒ **the in-app browser is what you have,
and I am not sending you at it pretending otherwise.**

### 1. The count — quick, and it should be clean
The pause dialog said **9** against a **5-row** list. It is now the **server's** number (`/cancel/preview`).
**It must agree with what the admin can see on screen.**

### 2. 🔴 The summary dialog — **TWO tries, then STOP. That is an instruction, not encouragement.**
🔑 **@Fern cleared the ground: the modal was NEVER unscrollable** — Mantine caps the height with `overflow-y:
auto`. **What beat you was the PANE, not the product.**
🚫 **Do not emulate a viewport LARGER than the pane** — that is precisely what produced the zoomed fragment and
the screenshot timeouts. **Work at the pane's own size, or a smaller emulation that renders 1:1.**
📌 **Per the new standing rule, a real admin height is 650+; 450 is the floor, not a target.**
⏹️ **If two clean attempts do not get you to the button, report `NOT_TESTED` again and stop.** **A third failure
adds nothing, and effort is not evidence.** **The pane is MINE to fix, not yours** — say so and hand it back.

🟢 **`b7dc8ace` stays.** 📌 **Both checks finished before you report, as always — even if the count fails.**
