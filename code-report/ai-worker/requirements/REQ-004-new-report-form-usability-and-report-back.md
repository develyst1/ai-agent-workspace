# REQ-004: New-report form usability (branch list, committer, dates) + back from the report page
- Status: READY_FOR_SA (2026-08-21 — Q25 "ค" and Q26 "ก" answered; the two
  blocking questions are gone, so the REQ leaves DRAFT)
- Priority: HIGH — *derived: he is describing the screens he is being asked to
  accept under REQ-003, and he raised it unprompted. He used no priority word.*
- Requested: 2026-08-21 by human stakeholder
- Deadline: none stated

> **Numbering note.** REQ-002 stays reserved-but-unwritten (email the finished
> report). Numbers are never reused, so this REQ takes **004**.

> **~~Status is DRAFT on purpose.~~ RELEASED 2026-08-21.** All six questions came
> back in one round (Q25 = ค, Q26 = ก, Q27, Q28, Q29, Q30 — verbatim in
> `## Questions`). The two that decided scope are answered, so the REQ is
> `READY_FOR_SA`. ~~**One residual is carried forward, not silently resolved:**
> Q26's follow-up half — *how far* "และอีกหลายอย่าง" reaches — was not answered,
> so it is re-asked as **Q31 (NON-BLOCKING)** and the REQ is deliberately scoped
> to the screens he actually named until it lands.~~
>
> **Q31 ANSWERED 2026-08-21 — "ทุกหน้า แก้พฤติกรรมได้ด้วย".** The narrow hold in
> Requirement 7a is **released**: Requirement 7 now reaches **every screen** and
> **behaviour as well as usability**. The REQ stays `READY_FOR_SA` — this widens
> Requirement 7 only; Requirements 1–6 are unchanged and are still the bulk of
> the work. **One new NON-BLOCKING question falls out (Q32)** — see
> `## Questions`.
>
> **Q32 ANSWERED 2026-08-21 — "ใช่หากมันดีขึ้นต่อการใช้งานก็จัดการเลย".** The
> conservative hold in Requirement 7c is **released, carrying the condition he
> attached**: behaviour REQ-001 itself named may be changed **when the change
> makes the app easier to use**, judged by the team, as Q26/Q31 already
> established. The REQ stays `READY_FOR_SA`. **No question is open on REQ-004 any
> more.**

## Problem / Goal

The stakeholder has used the KnowCode web app himself and says the UI is still a
problem. His complaints are **not about how it looks** in most cases — they are
about **how much typing the tool demands and what it refuses to do**:

- The screen he lands on after login (the new-report form) is, in his words, too
  hard to use.
- It makes him type things the tool could fetch for him (the branch), and type
  things he does not think should be required at all (the committer).
- Picking dates is awkward, and the single-day / date-range choice is, in his
  reading, a distinction without a difference.
- On the report page he cannot get back.

**Why this is a REQUIREMENT and not a defect report:** three of these items
*reverse behaviour that was specified and accepted* under REQ-001 (see
"Relationship to REQ-001 and REQ-003" below). Nobody built them wrong. So this
is new stakeholder scope, and the engineers must receive it as a TASK from
Sober — not as a bug someone quietly patches.

## The human's words (verbatim, 2026-08-21)

> "UI ยังมีปัญหาอยู่
> หน้า แรกหลังloginเข้ามา
> หน้าตา ดูใช้งานยากเกินไป
> หน้าแรก ใส่ git url แล้วควรค่อยไปโหลดbranch มาให้เลือก ไม่ใช่ให้ผู้ใช้ พิมพ์เอง
> หน้าแรก ใส่ git url แล้ว หากเลือกbranch แล้วควรพอไม่ต้องมานั่งใส่ committer
> เวลาเลือกวัน ดูใช้งานยากไปขอให้ง่ายกว่านี้
> มันไม่รู้จะแยกทำไม ระหว่างวันเดียว กับ ช่วงววัน เพราะ หากเลือกช่วงวัน เป็นวันเดียว
> มันก็เหมือนกับ เลือกวันเดียวอยู่ดีเพราะงั้นก็ไม่่าจะมีให้เลือกวันเดียว หรือช่วงวันหรอก
> เอาช่วงวันไปเลย
>
> หน้าreport กดย้อนกลับไม่ได้
>
> และอีกหลายอย่างจงทำความเข้าใจ และหา และแก้ไขมันซะ"

**One reading is taken as settled and stated here so it is visible:** "หน้าแรก"
(the first page after login) = the **new-report form**, because every sentence
that follows describes that form's fields (git URL, branch, committer, dates).
Confidence high; if he meant something else, one line corrects it.

## Requirement

Only statements he actually made are numbered. The ambiguous ones are in
`## Questions`, not here.

1. **The branch must be offered as a list to choose from, loaded from the
   repository after the user supplies the git URL — not typed by hand.**
   ("ใส่ git url แล้วควรค่อยไปโหลด branch มาให้เลือก ไม่ใช่ให้ผู้ใช้พิมพ์เอง")
   - **1a (Q27, answered 2026-08-21 "ไปต่อไม่ได้เลย"): if the list cannot be
     loaded, the user cannot proceed.** There is **no hand-typed fallback** — not
     for a private repo before the token, not for a bad URL. The form stops until
     a list has loaded.
2. **The single-day / date-range choice is removed. There is one date-range
   control and nothing else.** His own reasoning, recorded because it is the
   test of whether the change is right: a range whose two ends are the same day
   *is* a single day, so offering both is a choice with no consequence.
   - **2a (Q28, answered 2026-08-21 "วันนี้ → วันนี้ คงเพดาน"): the range opens
     pre-filled with today → today**, and the **maximum span of 366 days stays**
     exactly as REQ-001 accepted it.
3. **Choosing the period must be easier than it is today.** ("เวลาเลือกวัน
   ดูใช้งานยากไป ขอให้ง่ายกว่านี้") This is a usability statement, not a
   mechanism: **he did not name a control**, and the acceptance test is his own
   judgement, as it is for REQ-003.
4. **From the report page the user must be able to go back.** ("หน้า report
   กดย้อนกลับไม่ได้")
   - **4a (Q29, answered 2026-08-21 "มีค่าเดิม"): back lands on the form with the
     values he just submitted still filled in** — not a clean empty form.
   - **4b (Q-SA-20, answered 2026-08-21 "เก็บด้วย"): "the values" INCLUDE the
     free-text extra-context box** (REQ-001 Requirement 4.5). Asked because the
     handoff carries six values and that box is not one of them; he answered that
     it is kept too. **What this does NOT touch: the PAT.** REQ-001's rule (never
     prefilled, sent once) is safety, not usability — Requirement 7e already holds
     that line, and he was asked about the free-text box only.
5. **The screen after login must be easier to use overall.**
   ("หน้าตาดูใช้งานยากเกินไป") Recorded as his verdict; Requirements 1–3 are the
   only concrete pieces of it he named.
6. **The committer must be chosen from a list loaded from the repository, the
   same way the branch is — not typed.** (Q25, answered 2026-08-21 "ค".) The
   field is **not removed**: REQ-001 Requirement 4.3 ("report the work of one
   person") survives intact — what changes is that he picks instead of typing.
   *Whether the list comes from the repository's commits, and how, is Sober's
   design call, not stated here.*
7. **The team finds and fixes usability problems on these screens on its own
   judgement, and the stakeholder's own eyes are the acceptance test.** (Q26,
   answered 2026-08-21 "ก"; the Q16 precedent, same stakeholder, same project.)
   - **~~7a — the boundary is NOT settled and is deliberately held narrow.~~
     RELEASED 2026-08-21 by Q31 = "ทุกหน้า แก้พฤติกรรมได้ด้วย".** (Original hold,
     kept for the record: until Q31 answered, this Requirement reached only the
     two screens he named and only their usability.)
   - **7b (Q31, answered 2026-08-21): the reach is EVERY screen, and BEHAVIOUR
     may be changed, not only looks.** "Every screen" = every screen the app has
     today — the login/shell, the new-report form and the report page (the four
     routes `/`, `/login`, `/reports/new`, `/reports/[jobId]`); it is **not** an
     instruction to add screens that do not exist (a report-history screen stays
     Out of Scope, REQ-001 Requirement 12).
   - **~~7c — one boundary is still open and is held conservatively.~~ RELEASED
     2026-08-21 by Q32 = "ใช่หากมันดีขึ้นต่อการใช้งานก็จัดการเลย" → 7d below.**
     (Original hold, kept for the record:)
   - **7c (original text) — one boundary is still open and is held
     conservatively, stated as a
     hold and not as an interpretation (Q32, NON-BLOCKING).** "แก้พฤติกรรมได้"
     plainly authorises behaviour changes the team judges right. It does **not**
     establish that he means to give up behaviour he *himself specified and
     accepted* in REQ-001 (the ≤366-day span, `DD/MMM/YY`/`HH:mm`, th/en, the PAT
     rules, the `NO_COMMITS` note, the sanitizer, polling). Until Q32 answers,
     the team's own judgement covers behaviour REQ-001 never named; anything
     REQ-001 explicitly named comes back to him for a yes/no before it changes.
   - **7d (Q32, answered 2026-08-21): behaviour REQ-001 itself named MAY be
     changed — on one condition, which is his, not ours.** His words are
     conditional: *"ใช่ หากมันดีขึ้นต่อการใช้งานก็จัดการเลย"* — yes, **if it makes
     the app better to use**, go ahead. So the ≤366-day span, `DD/MMM/YY` /
     `HH:mm`, th/en + `Accept-Language`, the PAT rules, the `NO_COMMITS` note and
     the polling are **no longer a per-item yes/no round**; they are in the team's
     hands like the rest of Requirement 7. **What the condition costs us: the
     usability reason must be written down where the change is made** (the TASK),
     so that "we changed what he asked for" is always answerable with *why it is
     easier now*. A change made for any other reason — implementation
     convenience, tidiness, taste — is not what he authorised.
   - **7e — one line Porter is holding rather than reading into 7d, because it is
     cheap to hold and expensive to get wrong.** Q32's Thai wording listed the
     span, the date format, th/en, the token rules and the `NO_COMMITS` note; it
     did **not** name the **Markdown sanitizer**, and REQ-001's PAT rules (never
     prefilled, sent once) are a **safety** property, not a usability one.
     Weakening a safety control is not "ดีขึ้นต่อการใช้งาน" in any reading, and
     **nothing on file asks for either to change** — so 7d is **not** read as
     authorising it. If the team ever wants to touch one, that is one question to
     him, not an assumption in either direction. **Blocks nobody**: no TASK on
     this project proposes it.
   - **Copy is unchanged by Q31 and by Q32:** Q14 closed the copy bundle, so new
     or reworded user-facing wording still comes back for a yes/no (Constraints,
     below). Q32 authorised **behaviour**, and he has never been asked to give up
     the wording round — Q-SA-19 (below) is that round being used exactly as
     designed.

## Acceptance Criteria

- [ ] After entering a git URL, the user picks the branch from a list the tool
      loaded from that repository; no hand-typed branch is required in the normal
      case.
- [ ] When the branch list cannot load, the form does not let the user continue,
      and it says why. There is no typed-branch escape hatch. *(Q27)*
- [ ] The committer is picked from a loaded list too; leaving it unset still
      reports everyone, as REQ-001 accepted. *(Q25 = ค)*
- [ ] The form offers exactly one way to choose the period — a date range. No
      single-day / range switch exists anywhere on the screen.
- [ ] The range opens on today → today, and a span longer than 366 days is still
      refused. *(Q28)*
- [ ] From the report page the user can get back to the form, and does not have
      to reload the app or edit the URL by hand.
- [ ] Going back shows the form still carrying the values that produced the
      report he was just looking at, **including whatever he typed in the
      free-text extra-context box**. *(Q29; extended 2026-08-21 by Q-SA-20 =
      "เก็บด้วย" — Requirement 4b. The PAT is still never prefilled.)*
- [ ] The stakeholder uses the reworked form himself and says it is acceptable.
      *(Same real test as REQ-003; stated plainly rather than dressed up as a
      measurement.)*
- [ ] The stakeholder opens **every screen the app has** — not only the two he
      named — and says the usability work is acceptable. *(Q31 = "ทุกหน้า";
      Requirement 7b.)*
- [ ] Behaviour REQ-001 **explicitly specified and he accepted** — the report
      itself, the `NO_COMMITS` note, the `DD/MMM/YY` / `HH:mm` rendering, th/en,
      the PAT rules, the ≤366-day span, the polling — either still behaves as
      accepted, or was changed **with his yes/no on record**. *(Amended
      2026-08-21: Q31 authorises behaviour changes, so the old blanket "nothing
      changes" no longer holds; what replaces it is that nothing REQ-001 named
      changes **silently**. Q32, still open, may widen this further.)*
      **Re-amended 2026-08-21 by Q32 = "ใช่หากมันดีขึ้นต่อการใช้งานก็จัดการเลย":
      a change to REQ-001-named behaviour no longer needs his prior yes/no — it
      needs a written usability reason in the TASK that made it (Requirement 7d),
      and he judges the result with his own eyes like the rest of Requirement 7.**

## Constraints

- **This changes REQ-001's accepted behaviour in three named places** (see
  below). It does **not** reopen anything else in REQ-001.
- The `hallmark` design foundation, Mantine-first / Tailwind-for-customisation
  (REQ-003 Requirement 4) and `FRONTEND-STANDARD.md` continue to apply — this
  REQ is worked *on top of* the REQ-003 redesign, not instead of it.
- **Whether loading a branch list needs backend work, and how, is a technical
  question for Sober** — the tool today never contacts a repository until a job
  is submitted. Porter is naming the outcome, not the design.
- **Copy:** Q14 closed the copy bundle. Removing the single-day/range switch and
  adding a branch list will touch user-facing strings; **new or reworded wording
  comes back to the stakeholder for a yes/no** (Q-SA-4 / Q-SA-11 precedent).

## Out of Scope

- The backend report pipeline, the AI stages, and the API contract in SPEC-001 —
  **except** whatever branch-listing needs, which is Sober's to raise if it does.
- A report-history screen. REQ-001 Requirement 12 says there is none, and
  "go back from the report page" is not a request for one.
- Deployment or hosting. Unchanged from REQ-003.
- REQ-001 Requirements 16/17/18, still separate parked work.

## Relationship to REQ-001 and REQ-003

Recorded so nobody discovers it at review:

1. **REQ-001 Requirement 4.6 is superseded in part.** It says the author and the
   branch are **typed in as free text** and the tool "is not required to offer
   lists discovered from the repository" — that is the answer to Q-SA-2, given
   by this same stakeholder on 2026-08-20. Requirement 1 above reverses it **for
   the branch**. **Q25 = "ค" (2026-08-21) reverses it for the committer as well**,
   so Req 4.6 is now superseded in **both** halves — "not required to offer lists
   discovered from the repository" no longer holds anywhere on this form.
   REQ-001 Requirement 4.3 (report one person's work) is untouched.
2. **REQ-001 Requirements 4.1 and 4.2 merge.** "A single day" and "a date range"
   become one range control (Requirement 2 above). The *capability* is not lost —
   a one-day range is a single day, which is his own argument.
3. **SPEC-002's 10-item behaviour freeze is hit.** Its item 3 protects "every
   form field incl. the ≤366-day span and the `YYYY-MM-DD` wire values" — three
   of those fields are exactly what this REQ changes. **How much of the freeze
   this releases is Sober's to write down**, the way freeze item 2 was released
   for Q-SA-14. Porter is flagging it, not editing a SPEC.
4. **REQ-003's final acceptance criterion is touched, and Q30 narrows it without
   closing it.** ~~It is not established which build he judged.~~ **Q30 answered
   2026-08-21: "โค้ดล่าสุด เห็นและว่าใช้ mantine แต่ การทำงานก็ตามที่ฉันแจ้งไป"** —
   he was on the **latest code** and he can **see it is Mantine**; what he is
   complaining about is **the working of it**, which is this REQ. So the redesign
   is **not** what he rejected, and REQ-003's four `DONE` TASKs stand.
   **It is still not `DELIVERED`,** and Porter is not declaring it so: REQ-003's
   final criterion is that he opens the reworked screens and says they are
   acceptable, and he has not said that — he described code he has seen, not a
   verdict on the screens. **TASK-016 (the hand-over) is what produces that
   verdict; Q-SA-17 = "ก" now unblocks it.** Detail: REQ-003 `## Questions`.

## Questions

### Q25 — ANSWERED 2026-08-21 — "ค" = the committer becomes a loaded list too

> answer (2026-08-21, human, verbatim): "Q25=ค"

- **He chose (ค): keep the field, but load it as a list from the repository, like
  the branch.** → **Requirement 6.** Nothing is deleted: REQ-001 Requirement 4.3
  survives, and the empty/all-committers case stays exactly as REQ-001 accepted
  it. This is the more expensive of the three options and he picked it knowing
  the alternatives, so it is not being trimmed here.
- **What it hands Sober, unresolved on purpose:** where a committer list comes
  from is a design question (the repo must be reached and its commits read before
  a job is submitted — the tool does not do that today), and it may need backend
  work. Porter names the outcome only.

*(original wording, kept for the record)*

- He said: "หากเลือก branch แล้วควรพอ ไม่ต้องมานั่งใส่ committer" — once a branch
  is chosen, that should be enough; no committer typing.
- **Three readings, and they are not the same product:**
  - (ก) **Remove the field.** A report covers everyone who committed on that
    branch in the period. This deletes an approved capability — REQ-001
    Requirement 4.3, "report the work of one person".
  - (ข) **Keep it, but optional**, and make it obvious it can be left empty. This
    is what it already is technically; his complaint would then be that the form
    does not *look* optional.
  - (ค) **Keep it, but as a list** loaded from the repo like the branch — so he
    picks instead of typing. This is the same fix as Requirement 1, applied to a
    second field.
- **Asked in Thai:** ก, ข or ค.
- **Not guessed, and the cost is concrete:** (ก) throws away a capability he
  himself asked for the day before yesterday; (ค) is real work on both ends;
  (ข) is nearly free. Guessing wrong either deletes a feature or ships a
  non-answer.

### Q26 — ANSWERED 2026-08-21 — "ก" = use your own judgement; his eyes are the test

> answer (2026-08-21, human, verbatim): "Q26=ก"

- **He chose (ก)** → **Requirement 7.** Same arrangement as Q16: the team hunts
  usability problems itself and he judges the result.
- **The follow-up half of the question was not answered** — "and if ก, is there a
  limit (this screen only? all screens? behaviour as well as looks?)". A single
  "ก" answers *who decides*, not *how far it reaches*, and an unbounded
  "fix everything you find" is a scope with no edge. **Not guessed:** re-asked as
  **Q31 (NON-BLOCKING)**, and until it lands Requirement 7a holds the scope to the
  two screens he named, usability only.

*(original wording, kept for the record)*

- **Two readings, and REQ-003's Q16 is the precedent for both:**
  - (ก) **"Use your own judgement"** — the team hunts usability problems itself,
    fixes what it finds, and **his eyes are the acceptance test**. This is the
    wider reading and it is exactly what he chose at Q16 ("รื้อทุกหน้าด้วย
    hallmark").
  - (ข) **He has more specific items in mind** and will list them.
- **Asked in Thai:** ก or ข — and if ก, is there a limit (this screen only? all
  screens? behaviour as well as looks?).
- **Not guessed:** an unbounded "fix everything you find" is a scope with no
  edge, and under (ก) the team will change things he never complained about,
  including behaviour REQ-001 accepted. Under (ข) we would be inventing work
  while his real list waits.

### Q27 — ANSWERED 2026-08-21 — "ไปต่อไม่ได้เลย" = the form stops, no typed fallback

> answer (2026-08-21, human, verbatim): "Q27=ไปต่อไม่ได้เลย"

- **He chose the strict reading:** if the branch list cannot load, the user
  **cannot continue at all**. No hand-typed branch as an escape hatch. →
  **Requirement 1a.**
- **Consequence stated rather than left to be discovered:** a private repository
  is unusable until its token is entered, and a wrong URL is a dead end by
  design. That is what he asked for; **how the form tells him why** (and in which
  order the fields unlock) is Sober's design call, and any **new wording still
  comes back to him for a yes/no** under Q14.

*(original wording, kept for the record)*

- Requirement 1 assumes the tool can reach the repository. Two cases where it
  cannot, both real: a **private** repo before the access token is entered, and
  an unreachable / wrong URL.
- **Asked in Thai:** if the list cannot load, may the user still type the branch
  by hand as a fallback, or should the form simply refuse to continue until a
  list has loaded?
- **Not guessed:** "no hand typing" is his instruction, but a form that dead-ends
  on a private repo would be worse than what he is complaining about.

### Q28 — ANSWERED 2026-08-21 — "วันนี้ → วันนี้ คงเพดาน" = today→today, cap stays

> answer (2026-08-21, human, verbatim): "Q28=วันนี้ → วันนี้ คงเพดาน"

- **Both halves answered:** the range opens **pre-filled with today → today**, and
  the **366-day maximum span stays**. → **Requirement 2a.** Nothing in REQ-001's
  span rule is reopened.

*(original wording, kept for the record)*

- With the single-day mode gone, the form opens with *something* in the range.
- **Asked in Thai:** should it open **empty** (he picks both ends), or
  **pre-filled with today → today**? And the current **maximum span of 366 days**
  — does it stay?
- **Not guessed** because it is one line from him and it is the first thing he
  will see on the screen he called hard to use.

### Q29 — ANSWERED 2026-08-21 — "มีค่าเดิม" = back keeps the values he submitted

> answer (2026-08-21, human, verbatim): "Q29=มีค่าเดิม"

- **Back lands on the form still carrying the values that produced the report.**
  → **Requirement 4a.** Not a clean form.
- **Read narrowly on purpose:** this is about the values on the form, **not** a
  request for a report-history screen — REQ-001 Requirement 12 still says there
  is none, and that stays Out of Scope.

*(original wording, kept for the record)*

- **Asked in Thai:** from the report page, does back go to the form **with the
  values he just submitted still filled in**, or to a clean empty form?
- Context, so the question is answerable in one line: there is **no report
  history screen** (REQ-001 Requirement 12), so a report he leaves is not
  re-openable from the interface unless he keeps the link.
- **Not guessed:** "keep my values" and "start clean" are both defensible and the
  difference is felt on every second run.

### Q30 — ANSWERED 2026-08-21 — "โค้ดล่าสุด" = the latest code; the complaint is behaviour, not the look

> answer (2026-08-21, human, verbatim): "Q30=โค้ดล่าสุด เห็นและว่าใช้mantine แต่
> การทำงานก็ตามที่ฉันแจ้งไป"

- **He was on the latest code** and **can see it is Mantine** — so his
  "หน้าตาดูใช้งานยากเกินไป" is **not** a rejection of the SPEC-002 redesign.
  **REQ-003's four `DONE` TASKs stand.** What he is complaining about is
  "การทำงาน" — how it works — and that is this REQ.
- **What it does NOT say, and Porter is not filling in:** he did not say the
  reworked screens are acceptable. REQ-003's final criterion is his verdict after
  opening them, and **"I have seen the code" is not that verdict** — he describes
  code he has seen, and it is not established that he ran all three screens
  (`/reports/*` need a session). So **REQ-003 stays `IN_SPEC`: not rejected, not
  accepted.** TASK-016 is what produces the verdict, and **Q-SA-17 = "ก"
  unblocks it** (recorded in REQ-003 `## Questions` for @Sober to transcribe).

*(original wording, kept for the record)*

- **Asked in Thai:** the screens he just criticised — did he open them from the
  latest code (the reworked design, finished 2026-08-21), or from the app that
  was already running on his machine?
- **Why it matters, stated rather than smoothed over:** the hand-over that was
  meant to tell him how to open the reworked screens (**TASK-016**) is still
  `BLOCKED` and was never delivered, so we do not know what he saw. His
  *functional* complaints (branch, committer, dates, back) apply to both builds —
  those fields were deliberately unchanged by the redesign. But
  "หน้าตาดูใช้งานยากเกินไป" is a verdict on a **design**, and it means one thing
  if he was looking at the new one and another thing entirely if he was not.
- **Not guessed:** reading it as a rejection of the redesign would throw away
  four `DONE` TASKs on an assumption.

### Q31 — ANSWERED 2026-08-21 — "ทุกหน้า แก้พฤติกรรมได้ด้วย" = every screen, behaviour too

> answer (2026-08-21, human, verbatim): "Q31=ทุกหน้า แก้พฤติกรรมได้ด้วย"

- **Both halves answered, and he took the wider option on both.** Reach = **every
  screen**, not the two he named; and the licence covers **behaviour**, not just
  how hard the screens are to use. → **Requirement 7b**; the narrow hold in 7a is
  released.
- **What this costs, recorded rather than discovered at review:** Requirement 7
  is now the widest item on the project — it reaches the login/shell screen,
  which nobody has complained about, and it lets the team change how the app
  works on screens REQ-003 has just rebuilt. **SPEC-002's 10-item behaviour
  freeze is hit much harder than Requirement 1–6 alone hit it** (freeze item 3
  was already due for release; Q31 puts items 1, 4, 5, 6, 7 and 8 in reach too).
  **How much of the freeze is released, and in what order, is @Sober's to write —
  Porter is flagging, not editing a SPEC.**
- **What it does NOT say, and Porter is not filling in:** he did not say that
  behaviour *he specified himself* in REQ-001 is now the team's to overturn.
  → **Q32, NON-BLOCKING**, with Requirement 7c holding the conservative line
  meanwhile.
- **Two things Q31 does not touch, stated so the widening does not leak:**
  (1) **copy** — Q14 closed the bundle, so new or reworded strings still come back
  for a yes/no; (2) **scope of the product** — "every screen" means the screens
  that exist, not new ones (no report-history screen; deployment still out).

*(original wording, kept for the record)*

- **Falls out of Q26 = "ก".** He settled *who decides* (we do) but not *how far
  it goes* — the second half of Q26 went unanswered.
- **Asked in Thai:** "ที่ให้ทีมหาและแก้เอง — เอาแค่ 2 หน้านี้ (หน้าฟอร์มหลัง login
  กับหน้า report) หรือทุกหน้าครับ? และให้แก้แค่เรื่องใช้งานยาก/หน้าตา หรือแก้พฤติกรรม
  การทำงานเดิมได้ด้วย?"
- **Not guessed, and the cost is concrete:** with no edge, the team will change
  screens he never mentioned and behaviour REQ-001 accepted, and he finds out at
  acceptance. Held narrow meanwhile — **Requirement 7a**.
- **Blocks nothing:** Requirements 1–6 are concrete and are the bulk of the work.
  Sober can spec and TASK them today; Requirement 7 is the one that widens.

### Q32 — ANSWERED 2026-08-21 — "ใช่ … ก็จัดการเลย", **with a condition attached**

> answer (2026-08-21, human, verbatim): "Q32 - ใช่หากมันดีขึ้นต่อการใช้งานก็จัดการเลย"

- **He said yes, and he said what the yes is for.** The team may change behaviour
  REQ-001 itself named — **"หากมันดีขึ้นต่อการใช้งาน"**, if it makes the app
  better to use. → **Requirement 7d.** The conservative hold in 7c is released and
  **no item goes back to him one at a time any more.**
- **The condition is his own words and it is the whole of the answer, so it is
  carried into the Requirement rather than dropped as a politeness.** In practice
  it costs the team one sentence: the TASK that changes a REQ-001-named behaviour
  writes down **why the change is easier to use**. That sentence is also what
  protects the team at acceptance — the alternative is a build where nobody can
  say why his own instruction was reversed.
- **Two things Porter did NOT read into it, held as a hold, not as a decision
  (Requirement 7e):** the **Markdown sanitizer** (not named in the question he
  answered) and the **PAT rules** (a safety property, not a usability one). No
  TASK proposes touching either, so **this blocks nobody**; if one ever does, it
  is one question to him.
- **Copy is untouched by this answer.** Q14 still governs wording (Q-SA-19 below
  is that round in use). Q32 was about behaviour.
- **What it unblocks, and what stays where it is: @Sober, TASK-020's ceiling has
  just moved.** Requirement 7 no longer has a REQ-001-shaped exclusion carved out
  of it. How much of SPEC-002's freeze that releases, and in what order, is
  yours — Porter is flagging, not editing a SPEC.

### Q-SA-19 — ANSWERED 2026-08-21 — "ok" = the 13 new strings are approved as authored

> answer (2026-08-21, human, verbatim): "Q-SA-19 - ok"

**@Sober — this is your question and SPEC-003 is your file; recorded here because
Porter may not write in `specs/`. Please transcribe it into SPEC-003
`## Questions`.** Porter wrote no string, no DoD line and no TASK.

- **What was approved:** the **13 user-facing strings authored th/en in TASK-018
  (12) and TASK-019 (1)** — the load-branches action, the "list could not load /
  you cannot continue" line, the empty-branch-list line, the date presets, the
  "everyone" committer option and the back label — **as they are written in those
  TASK files.** He read them and said ok.
- **What it does NOT do, stated so it is not read wider:** it does **not** re-open
  the Q14 copy bundle, and it does **not** pre-approve strings that do not exist
  yet. A new or reworded string appearing later still comes back for a yes/no —
  the Q-SA-4 / Q-SA-11 precedent, used here for the third time and working.
- **Consequence for the work: nothing was waiting on it and nothing changes.**
  TASK-018/019 keep the wording they carry; the `[~]` this would have produced at
  review is now an `[x]` for @Sober to record where he keeps it.

### Q-SA-20 — ANSWERED 2026-08-21 — "เก็บด้วย" = yes, the extra-context box comes back too

> answer (2026-08-21, human, verbatim): "Q-SA-20=เก็บด้วย"

**Recorded here, in REQ-004, because the question lives in SPEC-003 and Porter
may not write in `specs/`. @Sober: this is yours to transcribe into SPEC-003
`## Questions` and into TASK-018, which is where the work lands.**

- **What was asked** (SPEC-003 §Questions, Q-SA-20, Sober's own DoD gap rather
  than a defect of Fern's): does Q29's "มีค่าเดิม" include the free-text
  extra-context field? The back handoff carries six values — repository URL,
  branch, committer, both dates, report language — and that box is not one of
  them.
- **What was answered: it is kept too.** REQ-004 Requirement 4a gains **4b**, and
  the "going back shows the form still carrying the values" acceptance criterion
  now names the free-text box explicitly.
- **What it does NOT authorise, stated so it is not read wider:** he was asked
  about **one field**. It does **not** touch the PAT rule (never prefilled, sent
  once — Requirement 7e holds that line), it adds **no new user-facing string**
  (Q14's bundle is untouched), and it changes **no API contract**.
- **Consequence for the work: nothing was blocked and nothing is unblocked.**
  TASK-018 was startable before this answer and is startable now; per Sober's own
  costing a "yes" is one `RetryParams` key, one line in each of the two writers
  and one `setState` in the form's mount effect. **Where exactly it is written,
  and whether TASK-018's DoD grows a line for it, is @Sober's call, not Porter's.**

### ~~Q32 original~~ (kept for the record) — does "แก้พฤติกรรมได้" reach behaviour REQ-001 named?

- **Falls out of Q31.** He authorised behaviour changes on every screen. What is
  not established is whether that includes the behaviour **he himself asked for
  and accepted** in REQ-001 — the ≤366-day span, the `DD/MMM/YY` / `HH:mm`
  rendering, Thai/English + `Accept-Language`, the PAT rules (never prefilled,
  sent once), the `NO_COMMITS` note, the Markdown sanitizer, and the polling
  behaviour on the report page.
- **Asked in Thai:** "ที่ให้แก้พฤติกรรมได้ด้วย — รวมถึงของที่พี่สั่งไว้เองใน REQ-001
  ด้วยไหมครับ (เช่น เพดาน 366 วัน, รูปแบบวันที่ DD/MMM/YY, ไทย/อังกฤษ, กฎเรื่อง
  token, ข้อความตอนไม่มี commit)? หรือให้ทีมแก้ได้เฉพาะส่วนที่พี่ไม่เคยระบุไว้ แล้ว
  ถ้าจะแตะของพวกนี้ค่อยถามพี่ทีละเรื่อง?"
- **Not guessed, and the cost is concrete:** reading it wide lets the team quietly
  undo instructions he gave two days ago and he finds out at acceptance; reading
  it narrow costs one question per item, only when the team actually wants to
  touch one. **Held narrow meanwhile — Requirement 7c.**
- **Blocks nothing:** Requirements 1–6, and the great majority of Requirement 7's
  new reach, are unaffected either way. Sober can spec REQ-004 today.
