# TEST-065: REQ-079 — the testable slice (the rest is blocked on the rich menus)
- Source REQ: REQ-079 (LINE chatbot registration / family linking)
- Status: **TEST_PASSED on 15 of 26 ACs — 11 remain NOT_TESTED. Verdict in §Round 2, updated in §Round 3.**
- Environments: **`sid` only** (`som.develyst.online`), the build after `0030` + `0031` were applied and
  witnessed (`db:verify` ✅, BE + FE restarted). `uat` never touched.
- Tested: 2026-09-02 by Tanya

## Scope — deliberately three items, on Porter's release

Porter's scope, and I did not widen it. **Most of REQ-079 cannot be tested at all yet:** the two rich menus are
not published, and Rule 2 says only a button starts a flow — so entry · เพิ่มนักเรียน · แจ้งลา · เช็คอิน ·
คอร์สของฉัน, and the headline outcome (a cleared account rebinding to a *different* family), are **unreachable**.
Proving that would produce a meaningless `TEST_FAILED`, so I did not spend the round on it.
⇒ **Everything outside the three cases below is `NOT_TESTED — blocked on rich menus`, by name, not by failure.**

## Cases

| # | Case | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | **AC-1 — silence by default.** Stray text (`เมนู`, `yo`) typed into an **idle** chat must get **no reply** | the bot stays silent | 🔴 **I cannot run this.** It requires an **inbound** LINE message, which requires a LINE account that has added the OA. I have none, and creating one is prohibited by my charter. There is no admin surface on `sid` that sends or simulates an inbound message — `LINE links` only handles link requests. **See the note below: there is also a question about *which* chat counts as "idle".** | **NOT_TESTED — needs a device** |
| 2 | **TASK-243 — does the People screen say whether a family has a linked LINE account BEFORE an admin acts?** | the admin is told the state before doing anything | ✅ **Yes.** `People` → a parent row → **`Clear LINE link`** opens a dialog headed **`LINE link — 0897946312`** stating **“No LINE account is linked to this family.”** and offering **`Cancel` only** — **no destructive button is rendered when there is nothing to clear.** The dialog also identifies the family by **phone**, which matters because every row renders the literal name “Parent name”. I read it and cancelled; nothing was written | **PASS** |
| 2b | The **positive** path — a family that IS linked, shown as linked, then cleared | — | 🔴 **UNTESTABLE ON `sid`: no family is linked.** `LINE links` shows **exactly two linked accounts, both TEACHERS — `Bank` (the owner) and `Haris`** — and **zero** parent/family links. Per Porter, I am **reporting this rather than manufacturing a linked family** | **NOT_TESTED — no fixture exists** |
| 3 | **Regression after `0030` + `0031`** — the calendar renders with real data and the console is clean | no breakage | ✅ **PASS, and broader than asked.** In a **fresh tab** (see the harness note): `Schedule` renders the full week with real courses **and** my QA fixtures · `Teachers` (7 full-time / part-time / 10 freelance) · `People` (**111 parents**) · `Bookings / Students` (Active 9 · Paused 2 · Cancelled 21) · `Overview` with live aggregates and charts (85% attendance · 13 booked · 11 attended · ฿373,000 · 44 courses · 15 vouchers). **Console: no errors on any of them** — only two benign `log` lines (`baseURL`, `baseAuthURL`) | **PASS** |

## AC-1 — the part worth deciding before anyone runs it

Two things need settling, and neither is a testing detail:

1. **Whose chat?** The only LINE account available to us is the **owner's, linked as a TEACHER (`Bank`)**.
   AC-1 is about an **idle** chat. A **linked teacher's** chat and an **unlinked parent's** chat may not travel
   the same code path at all — so a silent result from his phone would **not** prove silence for the population
   the AC is actually about. 🔴 **Testing it on the wrong chat and calling it a pass is the failure mode here.**
2. **The 30-minute rule.** Sober's note stands: the two-strikes / mute window runs from the **last** message, so
   the chat must be left **alone for 30 minutes** before the retest, or a correct fix reads as a failure.

**What I can do the moment someone sends the inbound:** confirm whether a reply was produced. **What I cannot do
is produce the inbound.** This is the same shape as AC-16's message text — the device half is the owner's, the
verdict half is mine.

## Notes

- **OBS — the row cannot be triaged, only the dialog.** All **111** parent rows render an identical
  `Clear LINE link` button regardless of link state. That is **Fern's deliberate design** (link state lives in
  the dialog — Sober's own Q3), so it is **not a defect** — but it is worth naming: an admin scanning the list
  cannot see which families are linked, only by opening them one at a time. If “which of my families are on
  LINE?” is ever a real question, the list is where it will be asked.
- 🔴 **The `sid` server clock reads `23:10` on 2026-09-02** (Overview header: *“2 Sep – 2 Sep 2026 · as of
  2 Sep 2026, 23:09”*; the browser agrees). **This bears directly on the open AC-9 question in `TEST-064`:**
  my F1/F2 fixtures are dated **2026-09-01** and were created **late in that day's session** — quite possibly
  **after that night's 23:30 pass had already run**, which would explain why they were never attended without
  any product fault. ⚠️ **And it raises a sharper question than the one I asked:** if the day-end sweeps only
  *its own* day, a session created **after** its day's 23:30 may **never** be auto-attended at all — which
  would be a real gap, not a fixture error. **The `job_runs` rows for 09-01 and 09-02 settle both readings.**
  Tonight's pass is ~20 minutes away as I write this.

## Test data created

| What | Where | Removed? |
|------|-------|----------|
| **Nothing.** This round was read-only | `sid` | ✅ n/a |
| The `Clear LINE link` dialog was **opened and cancelled** on one real parent row (phone `0897946312`) | `sid` | ✅ **nothing written** — the dialog offered only `Cancel`, and a real family's link state is not mine to change in any case |
| No booking · no student · no teacher row · no setting · no script · no restart · **no LINE message sent** | — | ✅ |
| **`Haris` — a real teacher — is LINE-linked on `sid`.** Recorded because it is now visible: he is one of the two linked accounts, and the standing rule that he is **never** messaged in rehearsal still binds. Every fixture I have ever confirmed used Bank (the owner), Camp, Dewy or Ek — **never Haris** | — | ✅ |
| `uat` | — | ✅ **no contact of any kind** |

**Live QA residue from earlier rounds is unchanged** — the five REQ-078 fixtures with their ids and owners are in
`TEST-064` §Park note. Nothing was added or retired today.

## Verdict

**PARTIAL — and none of it is a failure.**
- ✅ **TASK-243's dialog does what it was built to do**: the admin is told the link state before acting, and no
  destructive control is offered when there is nothing to clear.
- ✅ **`0030` + `0031` caused no visible regression** — five screens with real data, clean console.
- 🔴 **AC-1 is `NOT_TESTED` and is not mine to run**; the positive half of TASK-243 is `NOT_TESTED` because
  **no linked family exists on `sid`**, which is a missing fixture, not a defect.

**I am not issuing a REQ-079 verdict.** Three cases out of a REQ whose flows are all unreachable is not a basis
for one, and Porter asked for exactly that — the rest stays **`NOT_TESTED — blocked on rich menus`**, named.

## Questions

(For Porter; he answers as `> answer: ...`)

17. **AC-1 needs a device and a decision.** Should the owner test it from **his own chat** (linked as teacher
    `Bank`) — accepting that it may not exercise the unlinked-parent path the AC is about — or should a genuinely
    **unlinked** account send the stray text? **I would not accept a pass from the teacher chat alone**, and I'd
    rather say so before he spends the effort. Also: the chat must sit **untouched for 30 minutes** first.
    > answer: _pending_

18. **TASK-243's positive path needs one linked family on `sid`.** There are none — only two linked *teachers*.
    Does the owner want to link a family (his own second account?) so “shows as linked → cleared → rebinds” can
    ever be tested, or does that wait for the rich menus, since linking a family is itself a menu flow?
    > answer: _pending_

19. **The AC-9 question is now sharper — please ask for the `job_runs` rows for BOTH 09-01 and 09-02.** The
    server clock is `23:10`, so my F1/F2 were probably created after 09-01's pass. **If the day-end only sweeps
    its own day, a session created after 23:30 is never auto-attended** — that would be a real gap and is worth
    knowing regardless of REQ-078's fate.
    > answer: _pending_

---

# Round 2 — 2026-09-03: the verdict. **REQ-079: `TEST_PASSED` on the slice that was exercised — 14 of 26.**

Porter closed the evidence run and handed me the verdict. **The division that produced it, stated once because
it is now the process (`SYSTEM-FACTS.md`): the owner is the HANDS, QA is the VERDICT.** QA has no LINE account,
so every inbound-message AC is physically unrunnable by me; he typed and screenshotted, I read the evidence
against the ACs and checked the database side that no screenshot can show.

## A. Ruled from the owner's device evidence (transcribed in `log/2026-09-03.md`, 08:14–08:18 and 23:06–23:10)

| AC | What the evidence shows | Verdict |
|---|---|---|
| **AC-1** silent by default | `hello` ×4 and `hellohello` into an idle chat → **total silence** | ✅ **PASS** |
| **AC-6** duplicate name | `มิลล่า` → **`มีน้องชื่อนี้อยู่แล้ว รบกวนใส่นามสกุลหรือชื่อเล่นเพิ่ม เพื่อไม่ให้สลับกันนะคะ`** — asks for a surname/nickname, **does not name the other family**, and is **not** treated as a strike | ✅ **PASS** |
| **AC-13** mute (first half) | 08:16 handoff → 08:18 he typed **`เพิ่มนักเรียน`** — a command word the bot advertises — and got **no reply**. The strong form: the bot will not barge in on an admin's conversation even when invited by its own keyword | ✅ **PASS (first half)** — second half below |
| **AC-14 / AC-21** two strikes → human | Two consecutive unexpected replies → **`ขอโทษค่ะ ขอส่งให้แอดมินช่วยดูนะคะ 🙏`**. Proven **twice**, on two builds | ✅ **PASS** |
| **AC-19** every step has an exit, and says so | `หรือพิมพ์ ยกเลิก เพื่อออก` appears at the **name** step, the **birthdate** step, the **rejection re-prompt** and the **duplicate-name** prompt. `ยกเลิก` deletes the draft **and says so**, then re-renders the command list | ✅ **PASS** |
| **AC-20** advertised words do not become data | `เมนู` at the name step → **`「เมนู」 เป็นคำสั่งของระบบค่ะ…`** — refused, and it names the escape. **Database half confirmed by me — see §B** | ✅ **PASS** |
| **AC-22** the promise is visible | the command list ends **`หรือพิมพ์คำถามเข้ามาได้เลยค่ะ เดี๋ยวแอดมินมาตอบนะคะ 🙏`** | ✅ **PASS** |
| **AC-23** a muted chat re-opens by typing | **`เปิดเมนู` → the command list returns.** Nobody had ever typed it before this run — the escape the bot advertises is **real**, not aspirational | ✅ **PASS** |
| **AC-24** the way out is told, not discovered | the handoff message now carries **`(ถ้าต้องการใช้บอทอีกครั้ง พิมพ์ เปิดเมนู ค่ะ)`** in the same breath | ✅ **PASS** |
| **AC-26** re-opening starts nothing | `เปิดเมนู` printed the command list and **started no flow** (also harmless from a non-muted chat) | ✅ **PASS** |
| **DEF-8** (not an AC — the blocker Porter raised) | a muted chat entered by button now **answers its own question**; yesterday it invited you in and then ignored you | ✅ **FIXED** |

## B. Ruled by me, on the database/admin side — the half no screenshot can show

| # | Check | Result |
|---|---|---|
| B1 | **AC-9 — “a parent who abandons mid-flow leaves NO partial student anywhere.”** Porter flagged this as urgent after Round B handed off with the name **`QA ทดสอบ`** already entered. Searched `People` for **`QA`**, **`QA ทดสอบ`** and **`adwa`** (the name from the 23:06 run that also ended in a handoff) | ✅ **PASS — no record for any of them.** **Parent count unchanged at 111.** A flow that hands off mid-way writes **nothing**, which is exactly what AC-9 demands and the failure Porter feared would have been unremovable |
| B2 | **AC-20's data half** — the reserved word must not become a student | ✅ **PASS — `เมนู` returns no record.** Refused in LINE *and* absent from the database |
| B3 | **Search validated before trusting a negative** | ✅ Searching `มิลล่` returns the family and **three student names**, so the search genuinely covers students. **Three "no match" results are evidence, not a broken search** |
| B4 | **TASK-243 — the POSITIVE state, which had no fixture yesterday** | ✅ **PASS.** The owner's own runs created one. Family `0900000092` → `Clear LINE link` now reads **“This family has **1** LINE account linked.”**, explains that clearing **keeps** students, bookings, notes and message history, states the parent can re-link at any time, states the account **“can be linked to a family again — including a different one”**, and only now offers the destructive button. **Both states are verified: `Cancel`-only when nothing is linked (09-02), the full dialog when something is.** It also re-checks live (“Checking this family's LINE link…”) rather than trusting stale row state |
| B5 | **AC-18 — rehearsal boundary: no `sid` run reaches the 2 real linked teachers** | ✅ **PASS for everything on record.** The two linked accounts are **`Bank` (the owner himself)** and **`Haris`**. Every fixture I have ever confirmed used Bank, Camp, Dewy or Ek — **never Haris** — and the owner's runs were in his own chat |
| B6 | Regression after the TASK-245/246 deploys | ✅ Calendar renders with real data; `People` (111) and the dialogs behave. The 09-02 five-screen sweep with a clean console still stands; today's deploys were BE/LINE-side |

## C. 🔴 NOT_TESTED — named, not failed

**AC-25 — “the mute still holds against everything else”. I am asking for it, and here is why.**
Porter left this to my call. **It needs closing.** What was proven at 23:09 is silence **from an idle chat that
had been cancelled out of (AC-1)** — a *different state* from **muted**. The 08:18 proof of silence-while-muted
was on the **previous** build, and **TASK-246 rewrote the mute path**; Sober himself named this as the thing that
rewrite was most likely to break. **Two messages from the owner** (get muted, then type) against the risk that
the bot starts talking over an admin — the single premise REQ-079 is built on. **Cheap, and not inferable.**

**AC-13 second half — “and works normally in EVERY OTHER family's chat.”** One muted chat says nothing about the
rest, and account-wide muting is precisely the failure mode that was refused at design time. **Needs a second
linked chat** — the same gap as AC-16's multi-recipient half in `TEST-064`. `NOT_TESTED`, not assumed.

**Never exercised at all (11):** **AC-2** entry with a known phone · **AC-3** unknown phone · **AC-4** one
account/one family · **AC-5** 2FA dormant · **AC-7** review-before-write · **AC-8** the admin is told · **AC-10**
leave · **AC-11** never infer · **AC-12** course view · **AC-15** typed `1`/`2` choices · **AC-17** the four
existing notification regressions (teacher schedule · course-confirm · booking-confirm · the **08:15** daily).
**AC-16 (no money, ever)** is untested by execution — no run touched money, but absence of observation is not proof.

🔴 **And the headline outcome — link → CLEAR → rebind to a *different* family — is still unproven.** I verified
the dialog **states** it; I did **not** click `Clear LINE link`, and deliberately: **that link is the owner's own
live account, the one he is using to test REQ-079.** Clearing it would destroy his fixture mid-campaign and
modify data I did not create. **His to run, whenever he is finished with it.**

## Verdict

# `TEST_PASSED` — for the 14 criteria actually exercised. **This is not a REQ-079 pass.**

Everything that was run, passed — including the three the owner's *poking* uncovered rather than the plan
(the swallowed command, the trapped flow, the PC dead-end), all three now closed and re-proven on the deployed
build. **AC-9 and AC-20 are stronger than the screenshots alone showed**, because the database agrees with them.

**Twelve of twenty-six remain untested**, eleven never exercised and one (**AC-25**) that I am explicitly asking
for. **Do not read this verdict as “REQ-079 works.”** It says: *the escape hatches, the silence, the strike
counter, the mute and the duplicate-name rule are real on `sid`* — the flows themselves (entry, leave, check-in,
course view) and every regression AC are still unopened.

📌 **A planning fact, not a complaint (Porter already recorded it):** every remaining AC begins with an inbound
LINE message, so **all of it is gated on the owner's hands.** The two ways out are a spare LINE account for QA or
a synthetic-webhook harness — and the second tests our handler, not LINE. **Worth deciding before the next REQ
that touches LINE**, because this will recur on every one.

## Test data created

| What | Where | Removed? |
|------|-------|----------|
| **Nothing.** Entirely read-only | `sid` | ✅ n/a |
| Two `Clear LINE link` dialogs **opened and cancelled** — the unlinked family `0897946312` (09-02) and the **linked** family `0900000092` (today) | `sid` | ✅ **nothing written.** 🔴 I did **not** press `Clear LINE link` on the linked one — it is the owner's live test account |
| Searches on `People` for `QA` · `QA ทดสอบ` · `adwa` · `เมนู` · `มิลล่` · `0900000092` | `sid` | ✅ reads only |
| No booking · no student · no LINE message · no setting · no script · no restart | — | ✅ |
| `uat` | — | ✅ **no contact of any kind** |

**Unchanged:** the five REQ-078 fixtures (ids + who retires each) in `TEST-064` §Park note. Nothing added or
retired today.

## Questions

20. **AC-25 — I am asking for the two-message run** (get muted → type → expect silence). Reason above: the mute
    path was rewritten and what we have proves the *idle* state, not the *muted* one.
    > answer: _pending_

21. **AC-13's second half and AC-16's multi-recipient half are the same missing fixture — a SECOND linked chat.**
    One decision unblocks two ACs across two REQs.
    > answer: _pending_

22. **The clear → rebind headline is his to run**, on his own link, whenever he no longer needs it as a fixture.
    I will not clear a live account I did not create. Say when and I will verify the after-state immediately.
    > answer: _pending_

---

# Round 3 — 2026-09-03 (late): ruling on the owner's night run. **15 of 26 now pass.**

Porter brought four more runs from the owner's device (23:35–23:55) plus a pair of screenshots he already had.
**I ruled on each, and independently verified the headline outcome in the database — the half no screenshot
can show.**

## A. Ruled from the owner's evidence

| AC | Evidence | Ruling |
|---|---|---|
| **AC-25** — the mute holds against everything else | Muted 23:35, then `awdw` · `สวัสดี` · **`นักเรียน`** · **`เมนู`** → **all silent, including two commands the bot advertises itself** | ✅ **PASS — and in the strong form.** This is the one I asked for rather than let be inferred, and it was right to ask: what 23:09 proved was **AC-1 (idle)**, and TASK-246 had **rewritten the mute path**. Different state, different code. **This is the premise the whole REQ rests on** — an admin can hold a conversation and the bot will not barge in |
| **AC-23** — a muted chat re-opens by typing | 23:43 `เปิดเมนู` from a **genuinely muted** chat → the command list returns | ✅ **PASS, upgraded.** Previously proven only from a cancelled/idle chat; now from the state the AC actually names |
| **AC-4** — an already-linked account must not silently re-point | 23:55, linked to `0905622548`, entered `0900000092` → **`บัญชี LINE นี้ผูกกับอีกครอบครัวหนึ่งไว้แล้วค่ะ หากไม่ถูกต้องกรุณาติดต่อแอดมิน`** | ✅ **PASS.** A refusal that states the situation and names the way out — no silent move, no half-linked state, no crash. 📌 **And better than the AC asked:** it does **not** name the other family and does **not** reveal whether the entered number exists at all, so probing numbers teaches nothing |
| **AC-13 second half** — a mute in one chat leaves other chats working | 23:35 account 1 muted and silent; **23:41 account 2 (`support08 Dong`) sent `สมัคร` and the bot replied**; 23:43 account 1 un-muted | ✅ **PASS — see my reasoning below** |
| **Clear → rebind to a DIFFERENT family** (Q22, the REQ's headline) | 23:49 same LINE account: cleared from `0900000092` → `สมัคร` → `1` → `0905622548` → **`ผูกบัญชีผู้ปกครองสำเร็จ ✅ … พบข้อมูลของคุณแล้วค่ะ — เตาไป้`** | ✅ **PASS, and I verified it in the data — §B** |
| **AC-2** — entry: known phone ⇒ that family's children are shown | the same 23:49 run reached role → phone → children shown | ⚠️ **PARTIAL — I am NOT closing it. See below** |

### Why I close AC-13's second half on this evidence — and why I decline the source read
The disaster case was **account-wide muting** — one admin reply silencing all 180 families. Between 23:35 and
23:43 **one chat was silent while another was served**. If the mute were account-wide, account 2 would have been
silent **regardless of its link state**. ⇒ **the failure mode is excluded by observation**, which is what a test
is for. **PASS.**

**Named precisely: what is unexercised** is the fully-equivalent case — a muted chat alongside another **linked
family's** chat. Account 2 was unlinked. I judge the residual risk very low, for the reason above.

🔴 **And I decline Porter's offer to have @Sober confirm the mute key from source "to make it airtight."**
**Reading code is not testing** — that is the one rule this role exists for. A source read would tell us the
implementation looks right; it would not add a single fact to what the two chats already demonstrated. If anyone
wants the equivalent case, it is **one message from a second linked parent**, not a code review.

### Why AC-2 stays open, despite the flow working end to end
The entry ran: role → phone → children shown. **The outcome half is genuinely proven.** But AC-2 is written
*"Given `[เข้าใช้ระบบ]` and a known phone…"*, and he reached it by **typing `สมัคร`** — the menu button does not
exist yet. **A postback from a rich-menu button and a text message are different handler branches**, and
REQ-079's own **Rule 2 (only a button starts a flow)** is precisely the rule a typed entry bypasses. ⇒ I am
recording **"known phone ⇒ that family's children are shown" as proven**, and leaving **AC-2 open until the
button exists.** Closing it now would sign off the one path the REQ says is the only legitimate one.

## B. What I verified myself — the clear→rebind actually landed in the data

Porter had the bot's replies. **The bot saying "success" and the admin screen agreeing are two different facts**,
and this is exactly where a half-written state would hide. Both ends check out:

| Family | Before | **Now (my check)** |
|---|---|---|
| **`0900000092`** (มิลล่า · มิลลิม · asda) | *"This family has **1** LINE account linked"* (my 09-03 morning check) | ✅ **"No LINE account is linked to this family."** |
| **`0905622548`** (เตาไป้) | not linked | ✅ **"This family has **1** LINE account linked."** |

⇒ **The account moved between two different families, and the admin screen agrees with the bot at both ends.**
No stale link left behind, no double-link.

🎉 **And the dialog's own promise is verified, not just displayed:** it claims *"Students, bookings, notes and
message history are all kept."* **`0900000092` still has all three students — `มิลล่า`, `มิลลิม`, `asda` —
after being cleared.** Clearing removed **only** the link, exactly as advertised. That is the sentence an admin
will rely on before pressing a red button, and it is now true rather than merely written.

## Verdict — updated

# `TEST_PASSED` on **15 of 26**. Still **not** a REQ-079 pass.

**Now passing (15):** AC-1 · **AC-4** · AC-6 · AC-9 · **AC-13 (both halves)** · AC-14 · AC-18 · AC-19 · AC-20 ·
AC-21 · AC-22 · AC-23 · AC-24 · **AC-25** · AC-26 — plus DEF-8 fixed, TASK-243 both states, and the
**clear→rebind headline proven in the product and in the data.**

**Still open (11):** **AC-2** (partial — outcome proven, button entry not) · AC-3 unknown phone · AC-5 2FA
dormant · AC-7 review-before-write · AC-8 the admin is told · AC-10 leave · AC-11 never infer · AC-12 course
view · AC-15 typed `1`/`2` · AC-16 no money · **AC-17 — the four existing notification regressions, including
the 08:15 daily.**

📌 **The sentence still travels with the verdict:** what is proven is the **escape hatches, the silence, the
mute, the strike counter, the duplicate rule, and now the link lifecycle**. **Leave, check-in, course view and
every regression AC remain unopened.** 🔴 **AC-17 is the one I would not ship without** — it is the *existing*
notifications (teacher schedule · course-confirm · booking-confirm · the 08:15 daily), and this REQ rewired the
message path they share.

## Test data created

| What | Where | Removed? |
|------|-------|----------|
| **Nothing.** Read-only | `sid` | ✅ n/a |
| Two `Clear LINE link` dialogs **opened and CANCELLED** — `0900000092` (now unlinked) and `0905622548` (now linked) | `sid` | ✅ **nothing written.** I did not press `Clear` on either |
| `People` searches on both phone numbers | `sid` | ✅ reads only |
| No booking · no student · no LINE message · no setting · no script · no restart · **no `uat` contact** | — | ✅ |

## Questions

23. **AC-17 is the gap I would close next, and it needs no new fixture.** The four existing notifications share
    the message path this REQ rewired. The **08:15 daily** in particular has been *"known-unverified"* on this
    project since before I arrived. One morning's observation from the owner's phone closes it.
    > answer: _pending_

24. **A second linked PARENT would close AC-13's equivalent case and `TEST-064`'s AC-16 multi-teacher half.**
    `support08 Dong` now exists and has followed the OA — **if it completes `สมัคร` as a parent on a third
    family, both fall out of one run.** Worth doing while that account is fresh.
    > answer: _pending_
