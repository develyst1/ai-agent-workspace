# ⚠️ OPEN CONTRADICTIONS — the owner's worklist

**What this file is.** A one-time archaeology run read all 30 daily logs of `smart-scheduler` and pulled out
every place where the project's own history disagrees with itself, or disagrees with
`smart-scheduler/ai-worker/SYSTEM-FACTS.md`. Its raw sightings were merged into the distinct questions below,
numbered `C-01` upward — numbers are never reused and never renumbered. Where the same disagreement was seen by
several workers on different days, all its sightings travel together in one entry. **The Ledger at the foot of
this file holds every count** — sightings, entries, and how many the owner has answered — and is the only place
they are stated.

**No agent may settle any entry here — ever.** Where one side looks newer, better-evidenced, or was stated by a
more senior role, it is still recorded as a *side*, **never as the answer.** That rule is absolute and nothing
below relaxes it.

**Only the owner closes an entry.** An entry is closed **if and only if** it carries a dated
`Owner's answer (<date>)` line in his own words — a handful now do. **Every entry still ending `_(unanswered)_`
is unsettled, and nobody may build on it.** Treat this file as unsettled by default; the Ledger at the foot of
the file carries the current counts.

🚫 **No agent may resolve, rank, quietly prefer, or drop either side of any item here.** Not even when a source
later self-corrected — those self-corrections are recorded as an additional labelled side and the item stays
open. **Reporting is the deliverable. Deciding is the owner's.**
*(This rule exists because on 2026-08-30 a run in this workspace resolved a contradiction it had been told to
report and then omitted it. A requirement was marked delivered while its work was still open.)*

**How to use it.** One item at a time. Read the sides, write the answer on the `Owner's answer:` line, and only
then let anyone act on it. An item with `_(unanswered)_` still standing is an item nobody may build on.

**Attribution note (owner's ruling, 2026-09-04).** In the logs, *"คุณฟีน"*, *"คุณปุ้ม"*, *"the stakeholder"* and
*"the owner"* are all **the same person — the owner, โด่ง (develyst)**. The real คุณฟีน/คุณปุ้ม are the customer
and have never spoken to an agent. Owner-voice sides below are stamped `(owner โด่ง, date)`. **This ruling does
not merge any two sides of any contradiction here** — where the owner said opposite things on two dates, that is
still a contradiction, and a sharper one.

**Ordering.** Part 1 holds everything that touches real money, real children's records, or a message reaching a
real person — worst first. Part 2 groups the remainder by subject.

---

# PART 1 — SETTLE THESE FIRST

*Real money · real children's records · a message reaching a real person.*

---

### C-01 — When the day-end job meets a booking nobody marked, does it write `NO_SHOW` or auto-attend it?

**Impact:** The highest in this file. On (A), every session staff forget to mark records **a child who attended
as absent**, consumes the session, and **posts no revenue**. On (B), the same session is marked attended,
consumes, and **charges**. Fifteen children were named in the original sighting. REQ-005/REQ-078's AC-9 is built
on (B); the "silent revenue loss" analysis is built on (A). Both cannot be true of one job.

- **Side A — it writes `NO_SHOW`** — *"`end-of-day` is not a report. It WRITES. It flips today's `CONFIRMED` bookings whose end time has passed to `NO_SHOW` and increments `used_sessions` / `used_hours` (`jobs.service.ts:47–61`)"*, restated the same day as *"the job writes `NO_SHOW`, which records fifteen children who attended as absent."* — (Porter/PM, reading source, 2026-08-23, `log/2026-08-23.md`)
- **Side B — it auto-attends** — *"day-end auto-attends it like everything else"* — (Porter/PM relaying the owner's REQ-005 answers, 2026-08-30, `log/2026-08-30.md`)
- **Side C — it auto-attends, from source, eight days after Side A** — *"The day-end engine has **no booking-type condition** (`jobs.service.ts:42-72`) — so **AC-9 (auto-attend)** … cost nothing."* — (Sober/SA grounding REQ-078, 2026-08-31, `log/2026-08-31.md`)
- **What the canonical file says today:** carries only the auto-attend side — *"The day-end auto-attends what it is designed to pick up; a fixture in the wrong status proves nothing about the job."* It also leaves a related question open: *"⚠️ Whether the day-end also *skips* `OTHER` when selecting what to auto-attend is **open with @Sober** — reporting and selecting are different questions."*
- **Sighted in:** 2026-08-23, 2026-08-30, 2026-08-31
- **Owner's answer (2026-09-05):** The day-end **auto-attends** the unmarked booking. It does **not** write `NO_SHOW`. — *"C-01 auto-attend"* (owner โด่ง, to Porter, 2026-09-05)

---

### C-02 — Which LINE accounts are linked on `sid` right now, and is any of them a real person?

**Impact:** A message reaching a real person. The canonical file's claim that `sid` has exactly **one** linked
recipient — the owner's own test box — is the entire basis for rehearsing outbound pushes there. If `Haris`, a
**real teacher**, is linked on `sid`, then every rehearsal push on `sid` can reach him. It also decides whether
REQ-078 AC-16 (*"every assigned teacher got it"*) is provable at all.

- **Side A — one recipient, the isolatable test box** — *"The owner is linked on `sid` as teacher `Bank`" (2026-09-01) — the isolatable test recipient. **Only ONE recipient is linked**, so 'every assigned teacher got it' still cannot be proven."* — (owner โด่ง, 2026-09-01, via `SYSTEM-FACTS.md`)
- **Side B — two accounts, one of them a real teacher** — *"**`LINE links` shows two linked accounts on `sid`, both TEACHERS — `Bank` (the owner) and `Haris` — and ZERO families.**"* (Tanya/QA reading the `LINE links` screen, 2026-09-02) and, carried by the PM the same day: *"`Haris` is a **real teacher, LINE-linked on `sid`** — added to the never-message-in-rehearsal list beside the two on `uat`."* — (Porter/PM, 2026-09-02, `log/2026-09-02.md`)
- **Side C — confirmed the next day, plus a third account** — *"**Never message `Haris`** (a real teacher linked on **`sid`**). **`Bank`** is the owner and is fine."* and *"**AC-18 holds — the two linked accounts are Bank (him) and Haris**, and every fixture I have ever confirmed used Bank/Camp/Dewy/Ek, never Haris."* Then, later that night: *"**A SECOND LINE account exists** — `support08 Dong` followed the OA and started `สมัคร`"*, and by 23:49 it had **linked as a parent** to family `0905622548`. — (Porter/PM and Tanya/QA, 2026-09-03, `log/2026-09-03.md`)
- **Side D — the `Bank` identity itself moved the next day** — *"He reports `support08 Dong` linked as **teacher Bank**. **I am not assuming what that gives us**, because the first account changed role during the night: it was teacher `Bank` on 09-01, then became a **parent** (family `0900000092` → cleared → `0905622548`)."* and *"**What AC-16 actually needs is TWO DIFFERENT teachers, both observable.** If both accounts now resolve to **the same teacher (Bank)**, that is still **one** teacher and AC-16 stays unprovable."* — (Porter/PM, 2026-09-04, `log/2026-09-04.md`)
- **What the canonical file says today:** Side A only, plus *"**2 real teachers are linked on `uat`.** They must never receive a rehearsal message."* and *"**outbound pushes from `sid` can reach anyone linked on `uat`.**"* It does not mention `Haris`, `support08 Dong`, or any role change.
- 🔴 **The part that makes this dangerous: the resulting state has never been read back by anyone.** The 09-04 log asks for the read and then hands off — *"**@Tanya — this needs no LINE and no owner time. You read this screen on 09-02.** Please report from `LINE links` + the People/Teachers screens: 1. **Which accounts are linked, to which teacher or family, right now?** 2. **Is `Bank` linked to one account or two?** And **did account 1's teacher link survive its parent link, or was it replaced?**"* and *"I would rather read the state than send him to link something twice."* — (Porter/PM, 2026-09-04). **No answer to that request exists in any log.** ⇒ nobody currently knows which recipient a `sid` push reaches.
- **Open sub-question the 09-04 log raises and nobody has answered:** *"**can one LINE account hold a teacher role and a parent role at the same time?** It belongs in `SYSTEM-FACTS.md` either way."* Also left unanswered from Tanya's Q24: *"I believe a **parent** link closes AC-13's equivalent and a **teacher** link closes AC-16 — **two links, not one run.** Your read on that stands unanswered."*
- **Sighted in:** 2026-09-02, 2026-09-03, 2026-09-04
- **Owner's answer:** _(unanswered)_

---

### C-03 — What time does `end-of-day` run, and who changed it?

**Impact:** Real money and wasted work. The run time decides when a fixture or an unmarked booking posts
revenue, and it has already cost REQ-078 a whole test round. Three different times are on the record, and the
*attribution* of the change — which the canonical file states as fact in red — has no support in the log of the
date it cites.

- **Side A — 18:05** — *"Asked the owner how he triggers day-end rather than assuming — **the 18:05 scheduled run has passed** and his setup is his, not mine to guess at."* — (Porter/PM, 2026-08-22, `log/2026-08-22.md`). The same entry establishes there is **no packaged day-end command**, so "the scheduled run" is whatever is configured on the box.
- **Side B — 23:30, still the operative planning number on 08-29** — *"**Day-end: the same rule as everything else** — unmarked ⇒ auto-attend at **23:30**."* and *"that booking is `ATTENDED` `FIRST_TRIAL` **today**, so **day-end posts ฿1,390 at 23:30** unless it is cancelled first."* — (Porter/PM recording the owner's REQ-005 answers, 2026-08-29, `log/2026-08-29.md`)
- **Side C — 23:30, used operationally by four roles for a real ฿20 money run on 09-01** — Jason/BE: *"An อื่นๆ booking that nobody marks is auto-attended at **23:30**, and then it CHARGES"*; Sober/SA: *"auto-attends at **23:30** and charges"*; Porter/PM to Tanya: *"an unmarked session auto-attends at **23:30** and posts ⇒ a fixture you create today and forget charges real money on `sid` tonight"*; Tanya/QA's ฿20 fixture was *"left to post at the **23:30** day-end on `sid`"*, with her caveat *"I do not know the server's time of day."* — (2026-09-01, `log/2026-09-01.md`)
- **Side D — 18:30, evidenced in `job_runs`** — the canonical file's schedules table, sourced to `job_runs`.
- **Side E — the attribution has no support on the date it cites** — *"**This log, 2026-08-29, contains NO mention of 18:30, no mention of the owner changing any schedule, and no mention of an `end-of-day` job by name.** (Grepped: `18:30`, `end-of-day`, `endOfDay`, `sm-end` — zero hits.)"* — (archaeology of `log/2026-08-29.md`, 2026-09-04). ⇒ **the schedule change is evidenced in data; the sentence "the OWNER changed it himself" on 2026-08-29 is Porter's assertion in the 09-02 log and nothing else.**
- **What the canonical file says today:** *"| **`end-of-day`** | 🔴 **18:30** | **The OWNER changed it himself**, 2026-08-29 (was 23:30 until 08-28) |"*, and *"🔴 **`end-of-day` at 18:30 is DELIBERATE and CORRECT. It is not a defect and must never be reported as one.** **Why it is correct: the app only lets you book a teacher until 18:00** (owner, 2026-09-02) — so **18:30 is after the last session that can exist.**"*
- **Sighted in:** 2026-08-22, 2026-08-28, 2026-08-29, 2026-09-01
- **Owner's answer (2026-09-05):** `end-of-day` runs at **18:30**, and **the owner changed the time himself**. — *"C-03 18:30 ฉันปรับเอง"* (owner โด่ง, to Porter, 2026-09-05)

---

### C-04 — `SICK_LEAVE`: is the freelance paid, and does the session keep or release its drawdown?

**Impact:** Freelance pay, in money, every month. On the "keeps" rule one absence eats **two hours** of a
freelancer's monthly ceiling (the absent session plus its make-up); on the "releases" rule it eats one. The
superseded rule is still called **locked** in TASK-028 and is still asserted in tests.

- **Side A — releasing; the freelance is NOT paid** — *"Releasing: `SICK_LEAVE` (customer-leave — don't pay, per REQ-004), `CANCELLED`, `PENDING` (not yet committed)."* (Sober/SA stating the then-current rule, 2026-07-20) and from the bug repro *"mark leave → refund → 10,000 / 100 ✅"* — leave refunding the drawdown treated as **correct**.
- **Side B — consuming; the freelance IS paid** — *"**CONSUMING (held=1, freelance is paid): CONFIRMED, ATTENDED, SICK_LEAVE.**"* and *"⚠️ **Business-rule CHANGE:** **SICK_LEAVE now KEEPS the drawdown** (freelance still paid — they committed / the session is made up later). This **reverses REQ-004/TASK-019's refund-on-sick-leave**."* — (2026-07-20 `[08:00]`, explicitly labelled a reversal). The same entry records *"surfaced a contradiction (their earlier 'leave→refund is correct' vs the answer)"* — **the owner gave both answers**, and Porter re-confirmed with a positively-phrased question.
- **Side C — reversed again, the other way, two weeks later** — *"SICK_LEAVE no longer draws the freelance ceiling."* `heldTarget(SICK_LEAVE) → 0`; only the make-up draws, when actually taught ⇒ **one hour, not two**. Compensation, if wanted, is a **manual** hand-entered fuel allowance (ค่าน้ำมัน), never automatic. — (owner โด่ง, 2026-08-03, `log/2026-08-03.md`). Trigger: the SA showed that two separately-correct rules combined made freelancers hit their cap roughly twice as fast on sick leaves.
- **Side D — the rule Side C reversed was on the record as LOCKED** — *"still pay the sick-leave freelance."* `SICK_LEAVE` sat in `FREELANCE_CONSUMING_STATUSES` ⇒ **one absence ate two hours**. — (owner โด่ง, before 2026-08-03, recorded in TASK-028)
- **What the canonical file says today:** **silent.** `SYSTEM-FACTS.md` says nothing about `SICK_LEAVE` or about the consuming/releasing sets, so nothing there says whether Side C still stands.
- **Sighted in:** 2026-07-20, 2026-08-03
- **Owner's answer (2026-09-04):** This entry asks two things, and both are now answered.
  - **Part (a) — is the freelance paid for the `SICK_LEAVE` hour? NO.** — *"no but note for change later"*
  - **Part (b) — does the make-up then draw a second hour from the freelancer's monthly ceiling? NO — it is counted once.** The sick-leave hour is deducted from the ceiling **once**; the make-up does **not** deduct again. — *"ไม่กิน — นับครั้งเดียว"* (answered 2026-09-04, on the open half put back to him directly)
  - **Standing signal, recorded as given:** *"note for change later"* — attached to the **pay** rule (part a); the owner expects that one revisited.
  - **Status: fully answered.**

---

### C-05 — Phone number alone and a family's children: a live disclosure to be closed, or an accepted risk?

**Impact:** Children's records, and who can act for them. The same exposure class was treated as **BE priority
#1, closed the same day** in July and as a **deliberate accepted risk** in September, with **nothing on the
record saying when or why the posture changed**. A shipped control exists that is one function away from being
switched off, and the canonical file does not mention that it exists.

- **Side A — a live disclosure, closed immediately** — *"the parent-link success reply interpolates `kids.map(k => k.name).join(", ")` (`:172`) so **typing a parent's phone returns that family's children's names** to an unauthenticated stranger; unknown phone → `findOrCreateParentByPhone` (`:174`) creates a record."* It was **BE priority #1**, a *"live disclosure and it's cheap"*, and it was closed the same day (names → count). — (Sober/SA, 2026-07-31, `log/2026-07-31.md`)
- **Side B — the control is deliberate, shipped, and switching it off is the owner's decision to take in those terms** — `parentChildrenNote` (`line-pairing.ts:19`, REQ-020 / **TASK-047**) answers a phone number with **a count, never names** — the reason is in the file: *"Parent linking matches on phone alone, so anyone who types a phone number would otherwise be told that family's children's names."* Showing names is *"an existing, deliberate, shipped control being switched off, and it is **one function** away"*; if the owner wants names with no door, *"he is knowingly re-opening TASK-047 — and it should be put to him in exactly those terms."* — (Sober/SA, 2026-09-01, `log/2026-09-01.md`)
- **Side C — an accepted risk, taken with the risk on the table** — *"**Anyone who knows a family's phone number can see their children and act for them** (leave, check-in). **This is a decision taken with the risk on the table, not an oversight.**"*, the customer having refused the 6-digit code: *"ใช่ฉันเข้าใจว่ามันไม่ปลอดภัย แต่เราทำอะไรไม่ได้ ฉันเสนอแล้ว บอกแล้วว่าอันตรายแค่ไหน เขาก็ไม่เอา ปล่อยไปตามนั้น"* — (owner โด่ง, 2026-09-02, via `SYSTEM-FACTS.md`)
- **What the canonical file says today:** Side C, in full, under *"🔴 Accepted security risk — LINE entry is the phone number alone"*, with *"**Do not silently re-open it and do not silently harden it.** If it must change, it goes back to the owner."* and *"**LINE never unlocks anything that moves money** — children, leave and check-in only."* **It does not record that a shipped names-vs-count control exists, nor that the SA asked for the decision to be put to the owner in those exact terms.**
- **Note carried from the archaeology, offered as context and not as a resolution:** the two *may* be consecutive states (July closed a **names** leak; September accepted the **entry** mechanism) — but they are the same exposure class handled with opposite urgency, so both stand.
- **Sighted in:** 2026-07-31, 2026-09-01
- **Owner's answer (2026-09-04):** The **customer has confirmed** they accept phone-number-alone access, so the accepted-risk position (Side C) stands and is now owner-confirmed on 2026-09-04 — **but it is no longer the end state:** the team is to **build 2FA as a configurable option, to be switched on later**. — *"yes customer confirm but we do the secure thing and add 2FA as a option for config later"*
  - **Live follow-up on C-16:** C-16 asks whether the 6-digit 2FA step can be switched on **at all** — the 2026-09-02 record says there is **no SMS and no transport** for the code. This answer does **not** settle C-16; C-16 stays open.
  - **Choosing a transport is a new question, not this one.** The owner has not said how the six digits reach the parent, and nobody may assume one.

---

### C-06 — Does `month-reset` write a `job_runs` row?

**Impact:** Money you cannot prove. `month-reset` restores every freelancer's monthly budget ceiling. If it
writes no audit row, a month where it silently failed to run is invisible — the phrase used at the time was
*"a job we cannot prove ran is a job we do not have."* Three separate workers recorded "no row"; the canonical
file records an observation of one.

- **Side A — no row, and it never has had one** — *"`month-reset` writes NO `job_runs` row. It has no audit trail at all. `resetFreelanceBudgets` returns `{reset: n}` and inserts nothing. The 08-01 instrumentation fix skipped it and nobody noticed for three weeks."* Queued as a small BE item that day. — (Porter/PM, reading source, 2026-08-23)
- **Side A′ — no row, in the `uat` scheduled-tasks completion table** — `sm-month-reset` *"writes **no `job_runs` row at all**, so the only check will be indirect (freelance budgets back at full ceiling). That gap is a queued BE item."* Marked ⬜ **unprovable until 1 Sep 00:05**. — (Porter/PM, 2026-08-24)
- **Side A″ — still no row, five days before the observation** — *"The existing jobs write `job_runs`; **this one must too** — unlike `month-reset`, which still does not (queued)."* and to Tanya: *"Fires once, writes a `job_runs` row (**the `month-reset` gap** — a job we cannot prove ran is a job we do not have)."* — (Porter/PM, 2026-08-28)
- **Side B — a row was observed** — the canonical schedules table.
- **What the canonical file says today:** *"| `month-reset` | **00:05** | `job_runs`, observed 09-01 |"*
- **Explicitly NOT asserted by the archaeology:** the queued BE item *may* have landed between 08-24 and 09-01 — **no log entry records that fix**, so both sides stand.
- **Sighted in:** 2026-08-23, 2026-08-24, 2026-08-28
- **Owner's answer:** _(unanswered)_

---

### C-07 — `courseExpiry` was off by one week for **every** course, however created. Which write-up is current?

**Impact:** Real money on real customers' courses. A repair job that would have written the **wrong** arithmetic
across **~170 real customer courses** was stopped only by the owner checking a number by hand. Side A is written
into a FIX file that may still say it.

- **Side A — the CREATE path is fine; this is an import-only problem** — *"AC-1 is already satisfied there; do not change it"* — (Porter/PM's FIX-007 write-up, 2026-08-25 morning; the SA's correction of Porter said the same)
- **Side B — every course, however created** — **`courseExpiry` is off by one week for EVERY course** — `addDays(startDate, weeks * 7)` must be `(weeks - 1) * 7`. *"We were both wrong: it computes, and it computes the wrong number. **Computed is not correct.**"* — (owner โด่ง + Porter/PM, 2026-08-25, later the same day)
- **What the canonical file says today:** **silent** on `courseExpiry` and on FIX-007.
- **Sighted in:** 2026-08-25
- **Owner's answer:** _(unanswered)_

---

### C-08 — Do the already-damaged imported courses get corrected, or does the shop absorb them?

**Impact:** Real money on real customer records — `sid` has 1 imported course, **`uat` has 16**. One answer makes
the audit a work list; the other makes it read-only information and the shop eats the give-away. Both answers
are the owner's, on the same day, and **neither is marked as superseding the other**.

- **Side A — do not fix what is already wrong** — *"course ที่ทำไปแล้ว พลาดไปแล้วไม่ต้องแก้"* ⇒ Porter recorded **requirement 6 withdrawn**, the fix is **forward-only**, the shop absorbs the give-away, and the audit becomes read-only information rather than a work list. — (owner โด่ง, 2026-08-22, first)
- **Side B — fixing is acceptable, but prove it hits the right rows** — *"แก้ก็ได้"*, followed by *"แม่นยำ แก้ถูกจุดจริงเหรอ"* ⇒ Porter re-read the audit himself and recommended running it first and deciding from the counts. — (owner โด่ง, 2026-08-22, later, same log)
- **What the canonical file says today:** **silent.**
- **Note:** the decision was explicitly deferred again to *after* the `uat` lift.
- **Sighted in:** 2026-08-22
- **Owner's answer (2026-09-04):** **Leave them.** The already-damaged imported courses are not corrected; the shop absorbs the give-away. — *"ปล่อย"*
  - **Consequence, stated plainly so nobody later reports it as a defect:** **16 real customer courses on `uat`** (plus the 1 on `sid`) **keep a wrong expiry — by decision**, not by oversight.

---

### C-09 — Did the import populate `gender`, and was the customer's complaint an import defect, a source-data gap, or a display defect?

**Impact:** Real children's records and the customer's own time — she is reported to have re-typed the field by
hand. It also decides whether a live customer fault is open or closed.

- **Side A — the import did not do gender** — the owner's report: *"the import 'didn't do gender at all — the customer had to fill it in by hand'."* — (owner โด่ง, 2026-08-20/22, relayed by Porter)
- **Side B — the data is there** — the `uat` People API dump *"shows `gender` populated on every student — `"gender": "Male"`, `"Female"`, straight from column F."* Porter explicitly refused to pass either on as fact and listed four possible readings (the customer was filling a different field · the students were ones the customer created themselves · a later batch behaved differently · the evidence is stale). **He asked the owner which he saw; no answer is in that file.** — (Porter/PM, 2026-08-20/22)
- **Side C — a source-data gap, not an import defect** — *"the importer did write gender wherever the sheet had it … **Not an import defect; a source-data gap.**"* — (Porter/PM, 2026-08-22 morning)
- **Side D — Side C explicitly retracted the same day** — *"**That was wrong.** The value is in the database and **the product cannot display it.** … I checked the database instead of the screen and closed a live customer fault."* — (Porter/PM, 2026-08-22)
- **What the canonical file says today:** **silent.**
- **Left open deliberately:** Side D is a dated self-correction, recorded as a side and not as the answer. The owner's original observation (Side A) has still never been matched to what he actually saw.
- **Sighted in:** 2026-08-20, 2026-08-22
- **Owner's answer:** _(unanswered)_

---

### C-10 — How many real teachers exist, how many are LINE-linked, and on which box?

**Impact:** A message reaching a real person. The never-message-in-rehearsal list is built on the "2 on `uat`"
figure. If the real population is 21, the list may be undersized, and the two counts may not even be counting
the same thing.

- **Side A — two, on `uat`** — *"**2 real teachers are linked on `uat`.** They must never receive a rehearsal message."* — (`SYSTEM-FACTS.md`)
- **Side B — twenty-one, on the box then called prod** — *"verify the teacher path on dev with a **test teacher LINE account**, never **the 21 real prod teachers**."* — (Sober/SA, 2026-08-16, `log/2026-08-16.md`)
- **What the canonical file says today:** Side A, verbatim above.
- **Kept open rather than reconciled:** the two may count different things (**teachers in the system** vs **teachers LINE-linked**), and "prod" in Side B means the box now called `uat` — but that mapping is itself unsettled (see C-31).
- **Sighted in:** 2026-08-16
- **Owner's answer:** _(unanswered)_

---

### C-11 — Does QA's absolute "never touch production" rule bend when the human authorizes it in-session?

**Impact:** Real customer data on the real customer box. On one date the rule bent and QA **created data** on
`frontoffice.develyst.online` with cleanup **waived**; on another it held and QA refused even a read-only look
**with the owner's explicit say-so**. Three written guards still read "never", with no exception clause.

- **Side A — the standing rule, quoted from three separate places** — QA's role card `QA.md`: *"Production — 🚫 never. Not read, not write, not 'just a GET.'"*; the workspace rule: QA *"tests on local + the dev server but never production"*; and the TASK-090 tool's own `PRODUCTION_HOSTS = ["frontoffice.develyst.online"]` guard, which exits 1 and says *"If you genuinely need this against production, that is a decision to route up the chain — not to work around here."* — (quoted 2026-08-11)
- **Side B — it bent, and writes happened** — the human authorised QA **in-session** and she ran on `frontoffice.develyst.online`: first read-only (phase 1), then **creating data** (phase 2, with cleanup **waived** because the app has no delete), then a third read-only round after the REQ-041 deploy. **The guard was never edited; access was the app's own login form.** — (2026-08-11, `log/2026-08-11.md`)
- **Side C — it held, against the owner's own instruction** — *"ให้ tanya ดูอย่างเดียวที่ uat"* (owner โด่ง, 2026-08-23, relayed by Porter as *"Owner's instruction, and the boundary is absolute… You LOOK."*) — and Tanya refused: `uat` resolves to `frontoffice.develyst.online`, which is production; `QA.md` says production is *"never mine — not read, not write, not just a GET"*; `mint-session.mjs` refuses that host by design. *"I will not work around that guard, even read-only, even with the owner's say-so."* She also had no credential for it. Porter accepted her position that day (*"`uat` is not yours — that boundary stands and you were right to hold it"*) and the owner sent screenshots instead. — (Tanya/QA 14:38 and Porter/PM, 2026-08-23)
- **What the canonical file says today:** **silent** on the production ban and on any exception to it. It records only the LINE-specific gate: *"**The OWNER is the hands** — he types and screenshots. **Tanya is the verdict**."*
- **The load-bearing detail:** the rule held against a *file-relayed* authorization and moved only for a *human, in-session* one — and the role card and the workspace rule still read "never".
- **Sighted in:** 2026-08-11, 2026-08-23
- **Owner's answer (2026-09-04):** QA gets **full access on the `sid` server** and **READ-ONLY on the `uat` server** — *"full access sid server , read only uat server"*
  - 🔴 **BLOCKING — a verbal go is not enough here, and this answer is not yet actionable.** Three written guards still forbid QA from touching the customer box: `QA.md` (*"Production — 🚫 never. Not read, not write, not 'just a GET.'"*), the workspace rule (*"never production"*), and the `PRODUCTION_HOSTS` guard in `mint-session.mjs`, which refuses `frontoffice.develyst.online` by design. Tanya has already refused on exactly this point, saying she would not work around the guard **even with the owner's say-so**.
  - **Therefore: the rule and the guard must be changed BEFORE any `uat` read can happen.** Until they are changed, QA will (correctly) still refuse, and that refusal is not a breach of this answer.
  - **Changing `QA.md`, the workspace rule or the guard is not Marie's job and not the PM's** — it has to be ordered. Recording this answer has changed no rule and no guard.
  - **Scope depended on C-31 — DISCHARGED 2026-09-04.** The grant says *"read only `uat` server"*, and **C-31 — is `uat` the same box as `frontoffice.develyst.online` (production)? — read `_(unanswered)_` when this answer was recorded**, so the scope of this grant inherited that uncertainty; **the owner answered C-31 later the same day and the dependency is now settled — see the UPDATE bullet below.** Tanya's refusal (Side C) rests precisely on `uat` resolving to the production host. **Nothing in this answer itself answered C-31**; it was named as a dependency only.
  - **UPDATE 2026-09-04 — C-31 is now ANSWERED, so this grant's scope is settled.** The owner confirmed *"ใช่ uat คือ frontoffice"* ⇒ `uat` **is** `frontoffice.develyst.online`, the customer's production box, and the grant on it is **read-only** (full access stays on `sid`). The dependency recorded in the bullet above is discharged. 🔴 **The guard blocker still stands:** `PRODUCTION_HOSTS` in the front-end's `scripts/mint-session.mjs` still refuses that host, so **no `uat` read is possible until the code changes** — raised as **`REQ-080`** and routed through the chain. `QA.md` and `PROTOCOL.md` were updated on 2026-09-04 (owner's decision, relayed by Marie); the workspace-root `CLAUDE.md` still carries the old *"never production"* wording and is the human's file to change.

---

# PART 2 — THE REMAINDER, BY SUBJECT

---

## Schedules & jobs

*All three schedule/job contradictions rank in Part 1 and are recorded there:* **C-01** (what the day-end writes),
**C-03** (what time it runs, and who changed it), **C-06** (whether `month-reset` leaves an audit row).
No further schedule contradiction was found in the 30 logs.

---

## LINE & recipients

---

### C-12 — Where did the LINE webhook point, and when did it move?

**Impact:** Every inbound LINE test, and the risk of an outbound reaching a real linked account. Three accounts
of the webhook's location exist for the July–August window, and one of them says it was pointed at **real linked
accounts including the owner's** during the period the canonical file describes as "living on `uat`".

- **Side A — it was on the box called `production`, and was re-pointed at `sid` on 07-30** — *"**Two servers**… **`sid`** → som.develyst.online… **`production`** → frontoffice.develyst.online. 🔴 **Not updated for ~2 weeks**… **It is the box that was serving the LINE webhook until today**"*, and *"Stakeholder re-pointed the LINE webhook at the correct server"* — (owner โด่ง's answer relayed by Porter/PM, 2026-07-30, `log/2026-07-30.md`)
- **Side B — on 08-01 it pointed at `sid`, at real linked accounts** — *"**LINE.** Several defects live there, and your rule 4 says never message real people — **the `sid` webhook points at real linked accounts, including the owner's.** Do not send anything through LINE until I have an isolated test account for you."* — (Porter/PM, 2026-08-01, `log/2026-08-01.md`)
- **Side C — it lived on `uat` and was borrowed at night, in the owner's own words** — *"webhook point ไป uat ค้างไว้รอตลอด … จะเทสไลน์ เราจะค่อยปรับกลับมา แปปๆ ตอนดึกๆ"* — owner-only, late-night window, then flipped back. — (owner โด่ง, 2026-08-30, `log/2026-08-30.md`)
- **What the canonical file says today:** *"The webhook points at `sid` **PERMANENTLY** since 2026-09-01 (owner). **It used to live on `uat` and be borrowed at night**; that arrangement is over. ⇒ inbound LINE is testable on `sid` any time."*
- **Not decided:** whether Side B describes a temporary night-time borrow, is simply wrong, or whether *"used to live on `uat`"* is imprecise about August. Note also that the name `uat` appears **nowhere** in the 07-30 log and nowhere in the 4,684-line 08-01 log.
- **Sighted in:** 2026-07-30, 2026-08-01, 2026-08-30
- **Owner's answer (2026-09-05):** The LINE webhook points at **`sid`, permanently**. Confirms his own 2026-09-01 words *"ตอนนี้ไลน์ webhook ผูกที่ sid ถาวรแล้ว"* (log/2026-09-01.md) as current — *"ใช่ทั้ง 6 ข้อ"*, 2026-09-05

---

### C-13 — Do the LINE rich menus exist?

**Impact:** It decides whether "a keyword is currently the only possible trigger" is true, which is the whole
basis for treating the deployed keyword entry as a forgivable gap rather than a rule violation (see C-14, C-15).

- **Side A — they do not exist yet** — *"**The rich menus do not exist yet**, so a keyword is currently the only possible trigger."* — (`SYSTEM-FACTS.md`, 2026-09-02)
- **Side B — eight of them existed, and the owner tapped them** — the customer-facing OA carried **EIGHT** rich menus with our exact names (`parent-th/en` ×2 areas=6, `teacher-th/en` ×2 areas=2), four of them adopted into the DB, and the owner tapped them in a real role change and a real language toggle, **in both directions**. — (2026-08-16, `log/2026-08-16.md`)
- **Side C — a 6-cell rich menu is LIVE on `sid`, on the same day as Side A** — *"🔴 A rich menu IS live on `sid` — and it is NOT the one REQ-079 specifies. … **My 'the menus are the only blocker' line is out of date and I am correcting it before anyone plans around it.** … **A 6-cell rich menu, live on his phone:** `เช็คอิน` · `แจ้งลา` · `นักเรียนของฉัน` / `เพิ่มนักเรียน` · `ภาษา` · `ช่วยเหลือ`"* — and the question he refused to guess at: *"**is this the NEW two-state menu, or the pre-existing one from the REQ-015/REQ-042 generation?** … **If it is the old menu, then `linkKnownRichMenu` is still a silent no-op and the two-state system is still not live** — and everyone (including me) would be reading a working screen as proof of something that never shipped."* — (Porter/PM, from the owner's 23:38 screenshots, phone **and** PC, 2026-09-02, `log/2026-09-02.md`)
- **Side D — from source: it is the OLD menu; the two-state system has never run** — *"`PARENT_RICH_MENU` in `line-rich-menu.ts` has exactly six cells: `action=checkin · action=leave · action=children · action=register · action=lang · action=help` ⇒ **`เช็คอิน` · `แจ้งลา` · `นักเรียนของฉัน` · `เพิ่มนักเรียน` · `ภาษา` · `ช่วยเหลือ`** — the owner's screenshot, cell for cell. **That is the REQ-015 / REQ-042 parent menu.** 🔴 **So: `unknownTH`/`knownTH` are still unpublished, `linkKnownRichMenu` is still a silent no-op, and REQ-079's two-state menu has never run.**"* — (Sober/SA, 2026-09-02)
- **What the canonical file says today:** Side A, verbatim above — an unqualified *"the rich menus do not exist yet"*, with **no mention that a six-cell menu is live on `sid`** and none of the `unknownTH`/`knownTH` distinction that Sides C and D turn on.
- **Kept open rather than reconciled:** Side B may be a different OA (`sid` vs the customer box) or different menus. Sides C/D may be read as *"REQ-079's two menus do not exist"* rather than *"no rich menu exists"* — **but that is a reading, not a ruling, and the canonical sentence is unqualified.** The archaeology declined to decide, and so does this file.
- ⚠️ **Why it is not a wording quibble, in the log's own words:** *"everyone was about to read a working screen as proof of something that never shipped."*
- **Side E — a NEW sighting, 2026-09-05, and it is the strongest evidence yet for Side D.** The owner sent a screenshot of the OA `SOM-Balance-Demo` at 01:23. The chat is **LINKED** — the bot had just answered `นักเรียนของคุณ (1/5) · 1. เตาไป๊` — and **the menu below it is still the six-cell OLD menu**, cell for cell: `เช็คอิน · แจ้งลา · นักเรียนของฉัน / เพิ่มนักเรียน · ภาษา · ช่วยเหลือ`. ⇒ **A linked chat is showing the unknown-state-agnostic old menu**, which is what `linkKnownRichMenu` being a silent no-op looks like from the outside. **This is an observation, not a ruling** — it does not close Side B (a different OA) and it does not close the entry. (Porter/PM, from the owner's screenshot, 2026-09-05)
- **Side F — RESOLVED IN CODE on 2026-09-05, and the entry still stays open. Read why.** The menus were published that day and **both states rendered on the owner's phone** (A on a fresh follow, B on linking) ⇒ `linkKnownRichMenu` is no longer a no-op and Sides C/D describe a state that has now passed. @Sober's read then found the remaining half: **nothing ever un-linked a chat** — no unlink call existed anywhere in the repo, so an admin clear-link left the parent on menu B, holding the buttons of an account they no longer had. **TASK-249 fixed it** (a departed teacher's menu too). 📌 **The honest detail:** a **passing test had pinned the missing call** — it asserted the un-link must not exist. The gap was not overlooked, it was written down and guarded; Jason found it in his own test and corrected it rather than deleting it. (Porter, from @Sober, 2026-09-05)
- 🔴 **@Sober said *"you can close C-13 with that, dated"*. I have not, and no agent may.** This file's rule is absolute: **only the owner closes an entry.** What is above is a *side* — the strongest side, and still a side. **The entry is closed when the owner dates a line in his own words, not when the code stops being wrong.**
- **Sighted in:** 2026-08-16, 2026-09-02, 2026-09-05
- **Owner's answer:** _(unanswered)_

---

### C-14 — Typed keywords: a permanent path the owner accepted, or a thing REQ-079 forbids?

**Impact:** Whether removing keyword entry is a **removal of behaviour the owner accepted and regression-tested
himself**, or the closing of a gap in a new feature. The two are budgeted, specced and communicated differently.

- **Side A — a deliberate, accepted, permanent fallback** — *"add … a **postback layer** so rich-menu/quick-reply taps route to the **same** handlers (**keyword input stays a fallback**)"* (Sober/SA, 2026-07-29, REQ-015 / SPEC-012); and in the owner's own acceptance checklist for that release: *"**regression:** old typed keywords still work + `/checkin?token=` still works"* (Porter/PM; the owner ran it, 2026-07-29).
- **Side B — forbidden** — `REQ-079` rule 2: *"Only a button starts a flow. A typed keyword never does."* — with the PM's reason: *"That rule exists because the customer's own call named 'commands triggered accidentally' as their fear"* — (Porter/PM, 2026-09-02)
- **What the canonical file says today:** *"🔴 **Flows are started by TYPED KEYWORDS, not buttons** — `สมัคร` triggers the role picker, and the bot advertises `เพิ่มนักเรียน · นักเรียน · เช็คอิน · ลา · qr · เมนู`. **`REQ-079` rule 2 forbids this.** Open with @Sober: deliberate PC fallback, or rule 2 not implemented?"*
- **Sighted in:** 2026-07-29, 2026-09-02
- **Owner's answer:** _(unanswered)_

---

### C-15 — Can a flow be started by a button on the deployed `sid` build?

**Impact:** Two readings of the **same evening's** evidence. It decides whether REQ-079 rule 2 is already
partially satisfied or wholly unimplemented — and therefore what QA is asked to verify.

- **Side A — keywords only** — *"🔴 **Flows are started by TYPED KEYWORDS, not buttons** — `สมัคร` triggers the role picker."* — (owner โด่ง's own run 23:23–23:29, 2026-09-02, recorded in `SYSTEM-FACTS.md`)
- **Side B — buttons work, on phone and PC** — *"**Quick-reply buttons under the bot's messages** — `เช็คอิน` `แจ้งลา` `นักเรียนของฉัน` `เพิ่มนักเรียน` — so **flows CAN be started by a button**, not only by a typed keyword."* — (Porter/PM reading the owner's 23:38 screenshots, phone **and** PC, 2026-09-02, `log/2026-09-02.md`)
- **What the canonical file says today:** Side A. It separately carries a related correction: *"✏️ **CORRECTED 2026-09-02 — LINE PC and buttons.** The earlier entry said buttons *'cannot be tapped at all'*. **They can.** … **quick-reply chips are tappable on PC, but they disappear the moment the user types**"* — while an earlier line in the same file still reads *"**LINE on PC: no rich menu, and buttons cannot be tapped at all — text only** (owner, 09-01)."*
- **Note carried:** both readings are of the *pre-existing* menu generation, not of REQ-079's unpublished two-state menu.
- **Sighted in:** 2026-09-02
- **Owner's answer:** _(unanswered)_

---

### C-16 — Can the 6-digit 2FA step actually be switched on?

**Impact:** Whether the accepted phone-only risk (C-05) is genuinely one setting away from being closed, or is
blocked behind an unanswered design question. The canonical file's reassurance rests on the first reading.

- **Side A — one switch away** — *"A 6-digit 2FA session step is **BUILT and shipped OFF**, one `app_settings` switch away, for the day the customer decides it matters."* — (`SYSTEM-FACTS.md`, 2026-09-02)
- **Side B — a missing transport decision away** — *"**2FA is built and off. It cannot usefully be switched on until the owner answers: how do the six digits reach the parent?** There is no SMS in this system, and sending the code into the LINE chat being verified verifies nothing."* — and twice more in the PM hand-off list: *"**2FA still cannot be switched on at all** until the owner answers the delivery question."* — (Sober/SA to Porter/PM, 2026-09-02, `log/2026-09-02.md`)
- **What the canonical file says today:** Side A, plus *"**Its parameters come back to the owner when it is switched on** — they are not inherited from the deleted designs."*
- **Sighted in:** 2026-09-02
- **Owner's answer:** _(unanswered)_

---

### C-17 — When did "the phone alone" become the LINE entry mechanism?

**Impact:** The canonical file's *"three mechanism changes (family code → invite code → phone only)"* ordering is
what makes the phone-only acceptance look like the newest decision. If a phone alone already bound a family in
July, the ordering — and the "each mechanism gets its own decision" principle built on it — needs re-checking.

- **Side A — phone-only is the latest of three** — *"**LINE never unlocks anything that moves money** — children, leave and check-in only. That line has now held across **three mechanism changes (family code → invite code → phone only)**."* — (owner โด่ง, 2026-09-02, via `SYSTEM-FACTS.md`)
- **Side B — a phone alone already identified and bound a family on 07-31** — *"the parent-link success reply interpolates `kids.map(k => k.name).join(", ")` (`:172`) so **typing a parent's phone returns that family's children's names** to an unauthenticated stranger; unknown phone → `findOrCreateParentByPhone` (`:174`) creates a record."* — in the same era as an `AWAIT_CODE` session state. — (Sober/SA, 2026-07-31, `log/2026-07-31.md`)
- **What the canonical file says today:** Side A, plus the principle built on it: *"an acceptance does not transfer across a mechanism change."*
- **Not decided:** whether "phone only" is a *return* to the earliest mechanism, or whether the July phone step sat behind a code.
- **Sighted in:** 2026-07-31
- **Owner's answer:** _(unanswered)_

---

### C-18 — Does a harness that posts synthetic LINE webhook events already exist?

**Impact:** It decides whether the "every LINE test is gated on the owner's time" planning fact is truly
unavoidable, or whether an existing command already unblocks part of it. Real cost in owner hours.

- **Side A — there is none, and building one is a way out** — *"There is also **no admin surface that sends or simulates an inbound message.** ⇒ she cannot send a single inbound message."* … *"**Two ways out, both the owner's call:** a spare LINE account/device provided for QA, or **a harness that posts synthetic webhook events (engineering work** — it tests our handler, not LINE itself)."* — (`SYSTEM-FACTS.md`, 2026-09-03)
- **Side B — the repo already has one** — *"**Pass B (LINE leave/check-in flows)** — the repo already has **`bun run line:webhook-test`**, which signs and posts a webhook event at a **local** server. So the child-picker, the enriched labels, the refusal message and the notify-on-leave path can all be exercised **without touching the real OA and without messaging a single real parent**."* — (Porter/PM, 2026-08-19, `log/2026-08-19.md`)
- **What the canonical file says today:** Side A, verbatim above.
- **Context offered, explicitly NOT a resolution:** the 08-19 harness posts at a **local** server, and the owner abolished local runs **later the same day** (*"เราจะไม่มีรัน local แล้ว"*, owner โด่ง, 2026-08-19).
- **Sighted in:** 2026-08-19
- **Owner's answer:** _(unanswered)_

---

### C-19 — How long does the LINE bot's mute last: 30 minutes or 60?

**Impact:** How long a PC parent with no rich menu is left in silence with no way out. Two different clocks may
have been conflated; which figure is the mute is not settled.

- **Side A — ~30 minutes** — a PC parent who triggers the mute *"wait[s] for the timeout (**@Sober's ~30-minute window from the last message**)."* — (Porter/PM, 2026-09-03, 08:3x, `log/2026-09-03.md`)
- **Side B — 60 minutes; the 30 is a different clock** — *"His measurement was exactly what I asked for: **mute 60 min, TTL 30 min**, so an **early** un-mute leaves a live row…"* — i.e. **the mute is 60 minutes; 30 minutes is the SESSION inactivity TTL (TASK-231)**. — (Jason/BE's measurement, endorsed by Sober/SA, 2026-09-03, later)
- **What the canonical file says today:** **silent** on the mute duration. It does carry the related fact that *"🔴 **An admin's reply typed in LINE OA Manager is OUTBOUND and never reaches our webhook** … ⇒ 'bot mutes when an admin replies' **cannot be triggered automatically.**"*
- **Sighted in:** 2026-09-03
- **Owner's answer:** _(unanswered)_

---

### C-20 — Does the "three mechanism changes" account cover LINE's founding outbound-only use?

**Impact:** Low on its own, but it is the narrative that the phone-only acceptance rests on (C-05, C-17). Flagged
by the archaeology as *adjacent, not a conflict* — recorded here so it is not lost.

- **Side A — the canonical narrative** — *"**LINE never unlocks anything that moves money** — children, leave and check-in only. That line has now held across **three mechanism changes (family code → invite code → phone only)**."* — (owner โด่ง, 2026-09-02, via `SYSTEM-FACTS.md`)
- **Side B — the founding use predates all three** — the 2026-07-26 log shows LINE being used, **from the founding**, as **outbound booking confirmation**. That is not an unlock, but *"the LINE surface predates the phone-number entry mechanism by six weeks"* and the three-mechanism narrative *"may not cover this earlier outbound-only use."* — (archaeology of `log/2026-07-26.md`)
- **What the canonical file says today:** Side A, verbatim above.
- **Sighted in:** 2026-07-26
- **Owner's answer:** _(unanswered)_

---

## Money & business rules

*The heaviest money items are in Part 1:* **C-04** (`SICK_LEAVE` and the freelance ceiling), **C-07**
(`courseExpiry` off by a week), **C-08** (the damaged imported courses).

---

### C-21 — `NO_SHOW` as the forfeit rule: does a family ever forfeit a session?

**Impact:** Real money to a real family — one paid session, forfeited or re-owed. Both halves are quoted in the
repo and a future session will meet both.

- **Side A — `NO_SHOW` forfeits, and it is the only status that does** — *"`NO_SHOW` CONSUMES a course session — the family forfeits it, no make-up. It is the only status that consumes."* Every cancel re-owes; only a no-show forfeits. — (owner โด่ง, 2026-08-03)
- **Side B — `NO_SHOW` is killed** — its only writer wrote `ATTENDED` from then on, and **no new `NO_SHOW` can be created by any screen, API or human** ⇒ **the forfeit case from Side A is now unreachable in practice** — an unmarked session is auto-attended (consumes) and a cancel re-owes. — (owner โด่ง, 2026-08-24, `log/2026-08-24.md`)
- **What the canonical file says today:** **silent** on `NO_SHOW` as a status or as a forfeit rule.
- **Note recorded at the time:** consumption arithmetic is unchanged either way (`COURSE_DELIVERED = {ATTENDED, NO_SHOW}`), which is why the swap was considered safe.
- **Interacts with C-01:** if `NO_SHOW` can no longer be written by anything, that bears on what the day-end writes — but the two were reported separately and are **kept separate here**.
- **Sighted in:** 2026-08-03, 2026-08-24
- **Owner's answer:** _(unanswered)_

---

### C-22 — Do planned absences consume the leave quota?

**Impact:** Children's leave entitlement and the course end-date extension that consumption earns. **Three
positions**, one of them the owner's own earlier answer, and a REQ was blocked rather than specced on a guess.

- **Side A — yes, they do, and that consumption is what earns the extension** — ***"ควรสิ"*** — they **DO** consume it, *"and that consumption is what earns the extension; going over simply never locks."* — (owner โด่ง, REQ-030 Q1, quoted by Porter/PM on 2026-08-16)
- **Side B — no, they must not** — planned absences **must NOT** consume the leave quota. Porter recorded this as *"the owner reversed a REQ-030 decision"* and **blocked the REQ rather than speccing a guess**. — (owner โด่ง, REQ-045 intake, 2026-08-16)
- **Side C — it depends when they were declared** — *"Planned absences **declared at creation are free**; one marked later still consumes quota per REQ-030."* — (owner โด่ง, REQ-045 answer **(B)**, later the same day, 2026-08-16)
- **What the canonical file says today:** **silent** on leave quota and planned absences.
- **Note recorded at the time:** (B) makes `MAX_WEEK_BY_SIZE` the only limit on creation-time absences, and *"declared at creation"* must become a real distinction in the data, not a timing coincidence.
- **Sighted in:** 2026-08-16
- **Owner's answer (2026-09-04):** The leave quota is consumed **only for a leave declared AFTER the course was created**. — *"ตัดเฉพาะที่แจ้งหลังสร้างคอร์ส"*

---

### C-23 — Teacher clash on an อื่นๆ booking: warn and allow, or refuse?

**Impact:** Double-booked real teachers and real children's classes — and, on the other side, invisible
double-bookings the calendar cannot display. Both rulings are the owner's, on the same day, and an AC shipped
inverted in between.

- **Side A — warn, never refuse** — *"Teacher clash on an อื่นๆ booking: **warn, never refuse** — his words, ***'เตือนพอ ไม่ห้าม'***."* AC-24 + AC-25 written into REQ-078 with Thai wording; `บันทึกต่อไป` chosen deliberately as the affirmative button *"so the default path must not read as an error being overridden."* — (owner โด่ง, 2026-09-01, earlier, relayed by Porter/PM)
- **Side B — the hard refusal stays** — after QA found AC-24 shipped inverted, the owner ruled **option ข — *"ตามนั้น"*** ⇒ the hard refusal **STAYS**, with an honest message (`ครู{ชื่อ} มีคาบสอนช่วงเวลานี้อยู่แล้ว ({ชื่อคาบ} {เวลา}) กรุณาเลือกเวลาอื่น`); the full overlap capability (guard + warning + two items in one slot) is **deferred to a follow-up REQ**, with the calendar's hidden-session fix (DEF-4) as its precondition. Original AC wording preserved in the REQ for that day. — (owner โด่ง, 2026-09-01, later)
- **What the canonical file says today:** **silent.**
- **Note recorded at the time:** Side B is explicitly a *deferral*, not a repudiation — the reason given was that relaxing the guard before the calendar can show two things in one slot would produce **invisible double-bookings**. Recorded as a note; the item stays open.
- **Sighted in:** 2026-09-01
- **Owner's answer (2026-09-05):** **Refuse** the clash for now (option ข), with the message naming the teacher and the clashing booking; the full overlap capability is a follow-up REQ. Confirms his 2026-09-01 *"ตามนั้น"* (log/2026-09-01.md) as current — *"ใช่ทั้ง 6 ข้อ"*, 2026-09-05

---

### C-24 — Can an attended session be undone?

**Impact:** Audit integrity on delivered sessions, and whether a mis-marked attendance can be corrected at all.
Side A shipped as an acceptance criterion.

- **Side A — no; attended sessions can't be edited away** — an `isDelivered` guard was added to `updateBookingStatus:cancel`, so a mis-marked attendance could not be undone by cancel. — (spec + build, 2026-08-03)
- **Side B — yes, with a stored reason** — an attended session **CAN** be cancelled provided a non-empty reason is supplied and stored for audit. The guard stays for edit/move only. — (owner โด่ง, 2026-08-03, same day)
- **What the canonical file says today:** **silent.**
- **Note recorded at the time:** B supersedes A for cancel, *"but recorded because A shipped as an acceptance criterion and both halves are still true of different operations."*
- **Sighted in:** 2026-08-03
- **Owner's answer:** _(unanswered)_

---

### C-25 — Is there an OWNER/STAFF approval flow in the backoffice, and does its role vocabulary survive?

**Impact:** Maker-checker on top-ups, adjustments and over-ceiling actions — i.e. on money movements in the
backoffice. Approved and then refused within one evening; the *vocabulary* it introduced was never withdrawn.

- **Side A — build it now** — *"**A) Include the OWNER/STAFF approval flow now**"* — ***"ทำเลย ถ้าไม่ควรค่อยเอาออก."*** — plus a full maker-checker scope (STAFF requests top-up / adjustment / item create-edit / over-ceiling; OWNER approves). — (owner โด่ง, 2026-07-20 `[23:30]`)
- **Side B — no approval system at all** — *"reversed the A decision: **NO approval system.** Every action is direct — remove the OWNER/STAFF maker-checker flow."* — ***"แก้ไข ไม่เอาระบบ approval แบบนี้ ดีกว่า ทำได้เลยทุกอย่าง"*** — (owner โด่ง, 2026-07-20 `[23:45]`)
- **What the canonical file says today:** **silent.**
- **The part that is genuinely unsettled:** the log labels B a reversal, *"so this is likely settled — **but the OWNER/STAFF *role* vocabulary and the 'backoffice admin = accounting + HR + CEO' audience statement were never explicitly withdrawn.**"*
- **Sighted in:** 2026-07-20
- **Owner's answer:** _(unanswered)_

---

### C-26 — What does the COURSE tab actually do — adjust a plan, or add a session?

**Impact:** A REQ (REQ-044) was founded on the wrong premise. On one reading the tab is the mechanism for
adjusting a plan (total constant, tail consumed, end date recomputed); on the other it plainly **adds** a session
and charges accordingly.

- **Side A — it is the mechanism for adjusting a plan** — *"the Course tab … is the mechanism for adjusting a plan"*, and REQ-030 §4 *"deliberately kept two entry points, one behaviour."* Relayed twice by Porter/PM — once in chat as the answer to the owner's *"จองคอร์สมีไปทำไม"*, once as the foundation of REQ-044. — (REQ-030 Analysis, documented design intention)
- **Side B — it is a plain add** — *"the tab does a plain **ADD (+1 session)** (`createBooking`→`insertBooking`), NOT a make-up move — it never consumes the tail, never keeps total constant, never recomputes an end date. So 'two entry points, one behaviour' is **untrue today**."* — (Sober/SA, grounded in code, 2026-08-16)
- **What the canonical file says today:** **silent.**
- **Note recorded at the time:** Porter accepted the correction in writing (*"REQ-044's premise was false, and I am the one who wrote it"*) — recorded as a third labelled position, **not** as a resolution. The REQ text and the code disagreed, and the REQ was the trusted artifact.
- **Sighted in:** 2026-08-16
- **Owner's answer:** _(unanswered)_

---

### C-27 — The "max 5 students per phone" cap: does it appear in any requirement, spec or task — and is the unit the phone or the parent?

**Impact:** The canonical file uses this cap as its worked example of *the failure this file exists to stop*. If a
task does mention it, that framing is wrong. And per-phone vs per-parent only coincide while phone-uniqueness
holds — which is itself an unrecorded fact.

- **Side A — it appears nowhere** — *"**Max 5 students per phone number.** 🔴 The owner's own decision, given 'a long time ago' … 📌 **It appears in NO requirement, spec or task in this repo** — Porter searched. It was implemented from an instruction that only ever lived in chat."* — (Porter/PM, 2026-09-02, in `SYSTEM-FACTS.md`)
- **Side B — an SA cited it as a known, self-enforcing constraint while reviewing a task** — *"the script writes **only** parents/students via the existing `findOrCreateParentByPhone`/`createStudentForParent` (so phone-uniqueness + **the 5-per-parent cap** self-enforce)."* — (Sober/SA reviewing TASK-150, the wave-1 importer, 2026-08-17, `log/2026-08-17.md`)
- **What the canonical file says today:** Side A in full, plus *"🔴 **A limit exists: `สูงสุด 5 คน ต่อเบอร์`** (max 5 students per phone). **Its source is unknown — in no REQ.** Open with @Sober, then the owner."* and the owner's confirmation *"ฉันสั่งนายทำไว้เองแหละนานแล้ว"*.
- **Two things a settler must look at, recorded at the time:** (a) whether TASK-150 / SPEC-051 in fact mention the cap, which would falsify the "no task mentions it" half; and (b) the **unit** — Side A says *per phone number*, Side B says *per parent*; they coincide only because phone-uniqueness makes one parent = one phone, *"which is itself a fact worth recording."*
- **Sighted in:** 2026-08-17, 2026-09-02
- **Owner's answer (2026-09-05):** The cap is **the owner's own long-standing instruction**, given directly — which is why it appears in no requirement, spec or task. Confirms his 2026-09-02 *"ฉันสั่งนายทำไว้เองแหละนานแล้ว"* (log/2026-09-02.md) as current — *"ใช่ทั้ง 6 ข้อ"*, 2026-09-05

---

### C-28 — The teacher-pay control with more than one teacher: is it a build or a verification?

**Impact:** Money input on a booking. The log itself flags the danger: *"on his screen 'the field is absent' will
look identical to 'the feature was built.'"* — i.e. the owner can accept a delivery that was never made.

- **Side A — it must be built** — with more than one teacher the money input *"ไม่ต้องมีให้ใส่"* — absent, not ignored. Porter wrote AC-22/AC-23 on it. — (owner โด่ง, 2026-08-31)
- **Side B — nothing to build; the control has never existed** — verified by grep in both repos: no pay field on any booking type. *"AC-22 and AC-23 collapse to a verification."* — (Sober/SA, 2026-08-31, `log/2026-08-31.md`)
- **What the canonical file says today:** **silent.**
- **Sighted in:** 2026-08-31
- **Owner's answer:** _(unanswered)_

---

### C-29 — Can every teacher teach every program, or are some deliberately restricted?

**Impact:** Who can be assigned to a child's class. A `link-all` script exists *because* of the earlier policy,
and **the script's own header still asserts the policy that changed** — which the PM called worse than no comment.

- **Side A — open by default** — *"The board records the owner's **REQ-058 decision** as **'every teacher can teach every program'** — that is *why* `link-all` exists, and the script's own header says *'open-by-default is the trade-off the owner accepted'*."*
- **Side B — deliberately restricted** — a `uat` dry run showed `Pop: +5 / =14 · DC: +16 / =3 · (everyone else: +1 / =18)` — Owner: ***"ตั้งใจจำกัด"*** — DC and Pop are deliberately restricted. — (owner โด่ง, 2026-08-29, `log/2026-08-29.md`)
- **What the canonical file says today:** **silent.**
- **Note recorded at the time:** Porter framed it as a policy CHANGE (*"That is no longer true"*) — recorded as his framing, not as the answer.
- **Sighted in:** 2026-08-29
- **Owner's answer (2026-09-05):** Some teachers are **deliberately restricted** — not every teacher may teach every program. Confirms his 2026-08-29 *"ตั้งใจจำกัด"* (log/2026-08-29.md) as current — *"ใช่ทั้ง 6 ข้อ"*, 2026-09-05

---

## Environments & access

*The production-access item with real customer data in it is in Part 1:* **C-11**.

---

### C-30 — Is `som.develyst.online` a staging box, the production box, or was it re-designated?

**Impact:** Real money and real customers. A build went out to it *before* REQ-005 + TASK-028 landed, so **a
teacher-CRUD 502 risk and a known freelance-drawdown idempotency bug were potentially live in production** — but
only if that box was production. It also decides whether a "no backup, fix-forward, skip the rollback" ruling was
given about a production box. The same hostname is called both, four times, across five weeks.

- **Side A — a side/staging site, no backup, fix forward** — *"this is a **side/staging site, no backup**, "ไม่เป็นไร" → **skip the rollback; fix-forward.**"* — said of the box running `som.develyst.online` / `backoffice-som.develyst.online` — (owner โด่ง, 2026-07-20 `[06:45]`)
- **Side B — already deployed to the real server** — *"Stakeholder reports they **already deployed** the current build to the **real server** and core usage works. ⚠️ This went out **BEFORE REQ-005 + TASK-028 landed** — so the teacher-CRUD 502 risk and the known freelance-drawdown idempotency bug are potentially **live in production**."* — (owner โด่ง relayed by Porter/PM, 2026-07-27 `[22:55]`, `log/2026-07-27.md`)
- **Side C — deployed to prod, by name** — *"Stakeholder deployed the current build to **prod** (`som.develyst.online`) and ran the acceptance checklist."* — (Porter/PM, 2026-07-28)
- **Side D — it is `sid`, the rehearsal box** — *"**Where:** **`som.develyst.online`** (`sid`), after the owner's deploy"* — where `sid` is the wipe-and-re-import rehearsal box and the customer's box is `uat`. — (Porter/PM to Tanya/QA, 2026-08-19)
- **Also on the record:** REQ-001/REQ-002 were marked **DELIVERED** based on the owner confirming them working on those same hosts, and the staff FE's own config calls `frontoffice.develyst.online` "**production**".
- **What the canonical file says today:** **silent on these hostnames.** It describes the world only as `sid` and `uat`: *"`SELECT count(*) FROM course_packages` — **`uat` ≈ 201 · `sid` two digits** (32 on 09-01…). **The order of magnitude is the tell; the exact number is not.**"*
- **Sighted in:** 2026-07-20, 2026-07-27, 2026-07-28, 2026-08-19
- **Owner's answer:** _(unanswered)_

---

### C-31 — Is `uat` the same box as `frontoffice.develyst.online` (production), or a third environment?

**Impact:** It changes what may be touched at all. On one reading, `uat` is a box we push to and whose linked
teachers we must not message; on the other, it is **production, never to be touched, not even a GET**. Kept
separate from C-30 because that item is about one hostname's designation and this one is about whether two names
denote one box.

- **Side A — two named boxes, `sid` and `production`** — *"**Two servers**… **`sid`** → som.develyst.online… **`production`** → frontoffice.develyst.online."* — (owner โด่ง's answer relayed by Porter/PM, 2026-07-30)
- **Side B — `frontoffice` is production and must never be touched** — *"**`som.develyst.online` (`sid`) is the dev server** — the owner has confirmed it is a test environment with test data. **`frontoffice.develyst.online` is PRODUCTION** (an older build the real customers use) — **never touch it**, not even a GET."* **The name `uat` does not appear anywhere in this 4,684-line log.** — (Porter/PM, 2026-08-01)
- **Side C — `uat` resolves to `frontoffice.develyst.online`** — Tanya/QA, 2026-08-23: `uat` resolves to `frontoffice.develyst.online`, *"which is production"*; `mint-session.mjs` refuses that host by design.
- **What the canonical file says today:** it names only `sid` and `uat`, says *"**`sid` and `uat` share ONE LINE channel**"* and *"**outbound pushes from `sid` can reach anyone linked on `uat`.**"* It never mentions `frontoffice.develyst.online` or a box called `production`.
- **Why it is load-bearing, recorded at the time:** the canonical file says outbound pushes from `sid` **can reach** people linked on `uat`, while the 08-01 log says the second box is production and **must never be touched at all**.
- **Sighted in:** 2026-07-30, 2026-08-01, 2026-08-23
- **Owner's answer (2026-09-04):** **`uat` IS `frontoffice.develyst.online`** — the box the customer opens — *"ใช่ uat คือ frontoffice"* (owner โด่ง, 2026-09-04, relayed to Porter by Marie)
  - **This also removes the dependency C-11 was carrying.** C-11's grant (*"full access sid server , read only uat server"*) named `uat` as its environment while `uat` itself was unsettled; that scope is now settled — `uat` is the customer's production box, and the grant on it is **read-only**.

---

### C-32 — What writes can QA perform, on which box?

**Impact:** A planning fact of the same weight as the LINE gate already in the canonical file: if QA can write
nowhere, then **every write-path acceptance — not only LINE — is gated on the owner's time.** Kept separate from
C-11, which asks whether the *production* ban bends; this asks what QA can do **anywhere**.

- **Side A — she wrote to the customer's production box** — with the human's in-session authorization, QA **created data on `frontoffice.develyst.online`** — 1 parent, 1 student, 2 courses, 1 voucher, bookings and plan edits — with cleanup waived. — (2026-08-11, `log/2026-08-11.md`)
- **Side B — she cannot even write to `sid`** — *"my QA session cannot perform `sid` writes (established on REQ-063), and I do not auto-run an irreversible action regardless."* She verified the cancel dialog **read-only** and routed every write step to the owner. — (Tanya/QA, 2026-08-24 23:45, `log/2026-08-24.md`)
- **What the canonical file says today:** it records only the LINE-specific split — *"**The OWNER is the hands** … **Tanya is the verdict** … **every LINE test — forever — is gated on the owner's time, not QA's.**"* It says nothing about non-LINE writes.
- **Sighted in:** 2026-08-11, 2026-08-24
- **Owner's answer:** _(unanswered)_

---

### C-33 — How does a prod migration get run: temp-open `pg_hba` from the laptop, or on the server against `localhost`?

**Impact:** A production security loosening, and whether one was ever left open. Both records are dated
2026-08-10, in the same log file, and **the log does not show the owner restating his choice after the refusal.**

- **Side A — the owner chose the temp-open** — *"**DECISION — Owner chose Option A:** temporarily open prod's `pg_hba` like sid (allow-all-with-password), run the deploy from the laptop as usual, then **CLOSE it again after**."* — (Porter/PM recording owner โด่ง's decision, 2026-08-10)
- **Side B — the SA refused to author it** — *"The temp-open-`pg_hba` path (Option A) is a **prod security loosening**, and I won't author it … It's also unnecessary … So backup + migrate run **on the server against `localhost`** … **This was the owner's own first instinct.**"* — (Sober/SA, 2026-08-10, next entry)
- **What the canonical file says today:** **silent** on `pg_hba` and on migration procedure. It records only *"**Scheduled tasks live in `C:\sm-jobs\*.ps1` on each server separately** — the boxes can differ."*
- **Downstream note, for placement only, not a resolution:** on **2026-08-16** the log records the owner adding a *different* IP, `49.237.170.101`, on the server himself — so a whitelist did get opened at some point, and the board still listed the 2026-08-11 temp-open as unclosed.
- **Sighted in:** 2026-08-10
- **Owner's answer:** _(unanswered)_

---

### C-34 — Does the PM hand-author ops SQL for the owner to run?

**Impact:** The rule in Side A is the one that gets quoted; Side B is the path that actually ran and produced the
clean slate. A future session will meet both. Both sides are the owner's, hours apart.

- **Side A — never** — *"Porter does NOT hand-author ops/dev SQL for the owner to run."* Porter's drafted `TRUNCATE` was **retracted / do-not-run**, and the standing rule was set as: anything the UI cannot delete flows **Porter → Sober → TASK → Jason writes the script → Porter → owner runs it.** — (owner โด่ง, 2026-08-11)
- **Side B — that is exactly what happened, with the owner's confirmation** — after the SA's tool layer refused to author the executable prod delete and Porter judged Jason would hit the same guard, the resolution the **owner confirmed** was that **Porter relays Sober's on-record delete procedure (`BEGIN` → `DELETE`s in FK order → recount → `COMMIT`/`ROLLBACK`) and the owner runs it directly in his own psql session.** *"That is exactly a team-authored ops SQL block reaching the owner through Porter."* — (owner โด่ง, 2026-08-11, same day)
- **What the canonical file says today:** **silent.**
- **Sighted in:** 2026-08-11
- **Owner's answer:** _(unanswered)_

---

### C-35 — Which branch is canonical: `dong`, or `develop` in every repo?

**Impact:** Which code is the reference for every engineer, and which repo state anyone is reviewing. Both are the
owner's own words on the same day.

- **Side A — use `dong`; `dong3` is abandoned** — *"dong3 แยกไปเพราะไม่อยากให้โดนแก้ front ของเขา ช่างมันไป ไม่ใช้ละ ใช้อันนี้แหละ แก้ไปเลย"* ⇒ Porter's reading, recorded as such: **canonical = `dong`; `dong3` is not merged and not used.** — (owner โด่ง, 2026-08-25, earlier)
- **Side B — `develop` is the central branch in every repo** — *"ฉันจะรวม develop ทั้งหมด ทุก repo ให้เป็น code ล่าสุด โค้ดล่าสุดคือการทำงานโดยรวม branch กลาง คือ develop"* ⇒ Porter's reading: **`develop` is the central branch in every repo; `dong`/`dong3` stop being the reference.** — (owner โด่ง, 2026-08-25, later the same day)
- **What the canonical file says today:** **silent** on branches. It records only *"**The owner commits, on his own schedule. Nobody asks about commit state, ever**"*.
- **Note recorded at the time:** *"They may be a sequence rather than a conflict, but deciding that is not this worker's call."*
- **Sighted in:** 2026-08-25
- **Owner's answer (2026-09-05):** **`develop` is the canonical branch in every repo.** Confirms his 2026-08-25 *"ฉันจะรวม develop ทั้งหมด ทุก repo ... branch กลาง คือ develop"* (log/2026-08-25.md) as current — *"ใช่ทั้ง 6 ข้อ"*, 2026-09-05

---

## Process & attribution

---

### C-36 — Who is "คุณฟีน" / "คุณปุ้ม" / "the stakeholder" — and is the owner "she" or "he"?

**Impact:** Every business decision in July and August is attributed to *"the stakeholder (คุณฟีน)"*. On one
reading they are **owner decisions**; on the other they are **customer requirements** that belong in REQ files,
not in `SYSTEM-FACTS.md`, and no requirement in the repo is customer-validated. Roughly 79 files carry the names.

- **Side A — คุณฟีน is the decision-maker, i.e. the owner** — the dominant usage across dozens of entries: the person Porter routes every business question to, who approves designs, reverses decisions, deploys to prod, runs `bun run migrate:bo`, and links her own LINE account as a test. — (2026-07-20 onward)
- **Side B — คุณฟีน is the customer, distinct from the stakeholder** — *"Stakeholder gave placeholder go-live numbers (**customer พี่ฟีน** will refine later)"* (2026-07-20 `[19:10]`), and *"Real numbers from **พี่ฟีน** to replace placeholders (DATA REQUEST still open)"* (`[13:00]`, same era).
- **Side C — the pronoun disagreement** — throughout `log/2026-08-02.md` the owner is *"she"* / *"her"*: *"nearly had **her** do ten minutes of rollback work"*; *"**She** gave a worked example"*; *"**she** is the only one who can press those buttons"*. In `SYSTEM-FACTS.md` and `log/2026-08-29.md` the owner is *"he"* / *"him"*: *"**The OWNER changed it himself**"*; *"**he** replied, and no `[line-in]` was logged"*; *"**The owner is starting his `sid` test pass now.**"* And on 2026-08-02 the **customer** is named separately as **คุณปุ้ม**, referred to as *"he"*: *"🆕 REQ-034 — คุณปุ้ม's follow-up after seeing it. **He** wants the dashboard filterable…"* — *"Either the role changed hands, or one of the two is a persistent writing error."*
- **What the canonical file says today:** it settles the *naming* half — *"**The owner is โด่ง (develyst).** He is the only person who has ever talked to this team."*, *"**In the logs, 'คุณฟีน', 'คุณปุ้ม', 'the stakeholder' and 'the owner' are all HIM.**"*, *"**คุณฟีน and คุณปุ้ม are the CUSTOMER.** … **they have never spoken to an agent, ever.**"*, and *"⇒ **No requirement in this repo is customer-validated unless it explicitly says so.**"*, with *"**Do not go back and rewrite the names in the ~79 files that carry them.**"*
- **Still open under this entry, and NOT resolved here:** the pronoun split (Side C), whether the July entries describing a person who *personally deployed and ran migrations* are the owner, and what re-labelling consequence follows for the facts already lifted into `SYSTEM-FACTS.md` from stakeholder-attributed entries.
- **Sighted in:** 2026-07-20, 2026-07-28, 2026-08-02
- **Owner's answer:** _(unanswered)_

---

### C-37 — Was the "คุณกุ้ง → คุณปุ้ม" name correction actually completed?

**Impact:** A later reader can still meet the wrong name in entries written *after* the cleanup was reported
complete. Not a factual conflict about the person — a conflict between a reported completion and the file.

- **Side A — corrected everywhere** — *"Resolved — the name is a transcription error, not a person. เจ้าของโปรเจกต์ confirmed: **"พี่กุ้ง" is คุณปุ้ม**, คุณฟีน's husband … **Records corrected: All 9 workspace files → คุณปุ้ม.**"* — (Porter/PM, 2026-08-01 `[evening-16]`)
- **Side B — three entries written AFTER that correction still say "คุณกุ้ง"** — Jason/BE at `[19:10]` (*"before คุณกุ้ง looks"*), Jason/BE at `[23:30]` (*"routed to Sober for คุณกุ้ง"*), and Sober/SA's TASK-077 review (*"Routed to คุณกุ้ง: one number, one line in `CARD`"*). — (2026-08-01, same log)
- **What the canonical file says today:** it does not mention คุณกุ้ง. See C-36 for the names it does settle.
- **Sighted in:** 2026-08-01
- **Owner's answer:** _(unanswered)_

---

### C-38 — Column A of the customer's sheet: was it ever confirmed, and by whom?

**Impact:** A fact was written into REQ-055 as *"confirmed by the owner"* when he had not said it. It later turned
out to be true — which is exactly why the process failure is worth settling: the record of *how* a fact entered
the repo is wrong even though the fact is right.

- **Side A — recorded as the owner's confirmation** — *"Confirmed by the owner: column A = the day of the week the child attends."* — (Porter/PM, 2026-08-16, in REQ-055)
- **Side B — Porter's own correction, same day** — **"He never said that."** The owner's actual position was that he did not know and was asking the customer; his own reading was that it might be a **deadline the customer set** (*"ใช้งานวันจันทร์ ให้ฉันทำให้ก่อนวันจันทร์"*).
- **Side C — the owner, later the same day** — column A *is* the child's class day — *"ไม่เกี่ยว ช่างมันไป"* for wave 1. — (owner โด่ง, 2026-08-16)
- **What the canonical file says today:** **silent** on column A. Its adjacent standing rule is *"**When the owner states a fact about how the system behaves, it is written HERE BEFORE the reply is sent.**"*
- **Recorded at the time:** *"the fact being true doesn't make asserting it as confirmed correct at the time."* Both records preserved.
- **Sighted in:** 2026-08-16
- **Owner's answer:** _(unanswered)_

---

### C-39 — Were TASK-113/115 dropped, or reviewed on 08-04 with a stale label?

**Impact:** Whether two tasks sat unreviewed for 18 days, or the board label simply lagged. Two roles, same day,
citing opposite evidence — one cites the files' contents, the other their absence.

- **Side A — genuinely dropped** — *"**genuinely dropped, not a stale label.** Evidence, not a guess: … **carry no SA verdict at all** … they have sat **18 days**."* — (Porter/PM, 2026-08-22)
- **Side B — reviewed; the label lagged** — *"I read the files: **both already carry a `## Review` section with `Verdict: DONE ✅ — Sober, 2026-08-04`**. … this was **stale-label lag, not a dropped review**."* — (Sober/SA, 2026-08-22)
- **What the canonical file says today:** **silent.**
- **Note recorded at the time:** the durable half both agree on is that *the signal is a `REVIEW` label with no `## Review` verdict below it*. Sober's version came second and cites the file contents; Porter's cites their absence. Recorded, not adjudicated.
- **Sighted in:** 2026-08-22
- **Owner's answer:** _(unanswered)_

---

### C-40 — Can the FE process prove appearance, or only behaviour?

**Impact:** Side A was issued as a **structural** claim and became an instruction to compensate with prose;
Side B demonstrated by measurement that geometry is checkable. A wrong instruction outlives its correction, and
Side A was standing guidance for a while.

- **Side A — a structural blind spot** — *"**That is a structural blind spot, not carelessness: our FE process can prove behaviour and cannot prove appearance.** No amount of reviewing harder fixes it."* — Fern was instructed to compensate with a written reasoned statement about narrow widths. — (Sober/SA, 2026-08-01, morning)
- **Side B — geometry is measurable** — *"**your premise was wrong, and so was mine** … The pane doesn't paint — but the browser still computes layout. `getBoundingClientRect()` returns real widths and `resize_window` really reflows. **Geometry is measurable here.** Only *painted* things — colour, contrast, overlap, font rendering — are genuinely out of reach."* Demonstrated by re-measuring the shipped defect: **176 px with the fix, 36 px and 26 px without**. — (Fern/FE, 2026-08-01, later the same day)
- **What the canonical file says today:** **silent.**
- **Note recorded at the time:** Sober wrote the later position into a standing board rule; the pair is flagged rather than the first side being silently dropped.
- **Sighted in:** 2026-08-01
- **Owner's answer:** _(unanswered)_

---

### C-41 — The commit rule, reversed inside one day — and only half of it is on the record

**Impact:** Half a day of three roles' reporting was built on the first rule; the canonical file carries only the
second, so a reader cannot tell that the first ever existed or why the board rule was written.

- **Side A — the owner will commit at the end of every batch, and it is a reportable item** — *"**The owner will COMMIT at the end of every batch.** Written up as a board standing rule."* Acted on all day — Sober and Fern each reported the front repo's uncommitted state as an open item, and Sober put *"the front repo is still uncommitted"* in his BALL twice. — (Porter/PM, 2026-09-01, earlier)
- **Side B — stop touching the subject entirely** — ***"commit แล้ว บอกทีม เลิกยุ่งเรื่อง commit ฉันจะทำเองเมื่อถึงเวลาของฉัน"*** ⇒ *"Nobody reports, chases, or asks about commit state — not in the log, not in a hand-off, not as a 'just a reminder'."* Porter: *"I am the one who put commit state into the reporting loop, so I am the one removing it."* — (owner โด่ง, 2026-09-01, later)
- **What the canonical file says today:** only Side B — *"**The owner commits, on his own schedule. Nobody asks about commit state, ever** (2026-09-01). Agents never commit. State your work; never request his."*
- **Sighted in:** 2026-09-01
- **Owner's answer (2026-09-05):** **No agent touches commits.** The owner commits himself, on his own timing. Confirms his 2026-09-01 *"commit แล้ว บอกทีม เลิกยุ่งเรื่อง commit ฉันจะทำเองเมื่อถึงเวลาของฉัน"* (log/2026-09-01.md) as current — *"ใช่ทั้ง 6 ข้อ"*, 2026-09-05

---

### C-42 — Which dates do the entries in `log/2026-08-04.md` belong to?

**Impact:** Every fact dated `2026-08-04` from that file inherits the uncertainty — including anything later
lifted into a REQ or into the canonical file with that stamp. The file covers **at least 08-04 through 08-10**.

- **Side A — the machine clock says 08-10** — *"⏱ Clock mismatch — please rule. This machine's clock reads **2026-08-10**, while today's log file is `2026-08-04.md`. All my relative evidence ('a class tomorrow' = 2026-08-11) comes from the machine clock and is internally consistent, but the two disagree."* — (Tanya/QA, in `log/2026-08-04.md`)
- **Side B — the clock is authoritative and the filename lags; the file will not be renamed** — *"⏱ Clock — the machine clock (2026-08-10) is AUTHORITATIVE. It matches the system's real 'today'; the log **filename `2026-08-04.md` has been lagging** (we kept appending to the open file across days). Your evidence dates are correct as-is. **Process fix going forward:** new days roll a new `2026-08-10.md`+ log; **I'm not renaming this file mid-flight.**"* — (Porter/PM, same file)
- **What the canonical file says today:** **silent** on log dating.
- **Certain either way:** one entry inside it is explicitly headed *"EOD HANDOFF (real date 2026-08-10; log file lags)"*. Whether facts tagged `2026-08-04` are re-tagged as a range before they enter `SYSTEM-FACTS.md` is not decided here.
- **Sighted in:** 2026-08-04
- **Owner's answer:** _(unanswered)_

---

### C-43 — Which dates do the entries in `log/2026-08-16.md` and `log/2026-08-17.md` belong to?

**Impact:** Same class as C-42 but a different file span and a different resolution path — **kept separate
deliberately.** `log/2026-08-17.md` contains entries written across **08-17, 08-18 and 08-19**, and the entries in
`2026-08-16.md` / `2026-08-17.md` were **never re-dated by explicit decision**.

- **Side A — stamp them 08-17** — *"`2026-08-17.md` (this file) is canonical … **Stamp entries `2026-08-17`** unless the human/Porter says today is actually 08-18."* — (Sober/SA, in `log/2026-08-17.md`)
- **Side B — my clock says 08-18** — *"🔴 **my session's own current-date context says 2026-08-18, not 08-17.** PROTOCOL says settle TODAY from the session clock and never from the newest filename — so by my clock this entry belongs in `2026-08-18.md`. I am **not** opening a fourth file over it."* — (Porter/PM, same file)
- **Side C — the human confirmed 08-18, and nothing is rewritten** — *"The human confirmed: today is 2026-08-18"* — but the entries already written into `2026-08-16.md` and `2026-08-17.md` were **never re-dated**, by explicit decision: *"nothing in them gets rewritten."* — (Porter/PM, `log/2026-08-18.md`)
- **Also in the same file:** *"⏭️ THESE ENTRIES ARE STRANDED. Canonical file is log/2026-08-19.md."*
- **What the canonical file says today:** **silent** on log dating.
- **Sighted in:** 2026-08-17, 2026-08-18
- **Owner's answer:** _(unanswered)_

---

### C-44 — Which date do the entries in `log/2026-08-20.md` belong to?

**Impact:** Same class as C-42 and C-43, **kept separate** because the evidence and the disagreeing sources are
different — four independent clocks disagree, including the LINE bot's own idea of *"วันนี้"*. Every date
attribution taken from that file inherits the uncertainty, and the entries were deliberately not rewritten.

- **Side A — today is 08-20** — *"**Today is 2026-08-20.** This file is canonical … Everyone writes here."* — (Porter/PM, `log/2026-08-20.md`)
- **Side B — the owner corrected it to 08-22** — *"**The owner has corrected me: today is 2026-08-22.** I had settled on 08-20 and I was wrong."* — (Porter/PM, final entry of the same file, relaying owner โด่ง)
- **Side C — four clocks, in the same entry** — filesystem stamp **08-22 02:00** · owner **08-22** · the LINE bot treating **2026-08-20** sessions as *"วันนี้"* · the owner's Windows clock showing **8/19**.
- **What the canonical file says today:** **silent** on log dating.
- **Sighted in:** 2026-08-20
- **Owner's answer:** _(unanswered)_

---

## Added after the first pass

*Numbering is append-only — nothing above was renumbered. This entry belongs subject-wise beside **C-05** (the
accepted phone-only risk) and **C-16** (whether the 2FA switch can be turned on); it is filed here to keep every
existing C-number stable.*

---

### C-45 — The 6-digit refusal: one decision recorded twice, on two dates, in two different quotes — or two separate statements?

**Impact:** This refusal is the load-bearing justification for the accepted security risk in C-05 — anyone who
knows a family's phone number can see their children and act for them — and it is what makes the built-and-off
2FA step (C-16) a thing nobody may switch on unasked. If the canonical file's date and wording are not the
statement that actually cut the code, then the reason on file is not the reason given. And if these are **two**
statements rather than one, the project accepted the same risk twice, a day apart, on different grounds — the
canonical file records only the later one.

- **Side A — the log, 2026-09-01: the customer cut it, and the owner said drop it** — headed *"🔴 The 6-digit family code is CUT by the customer. `REQ-079` §15 supersedes."* — > Owner: *"ลูกค้า confirm มาว่าไม่เอา 2FA 6 หลักที่เราคิด งั้นก็ยกเลิกออกจากแผน"* + *"ปล่อยเลย"*. — (owner โด่ง relayed by Porter/PM, 2026-09-01, `log/2026-09-01.md`). Recorded as removing *"the code · setting it · the lockout (4 attempts / 3 minutes / per family) · the weak-code check and its `app_settings` switch · the first-use takeover risk and the gate that closed it"*, with the earlier sections deliberately **not** edited away: *"they are how the decision was reached, and this project does not delete its record."*
- **Side B — the canonical file, 2026-09-02: the owner explained the danger and the customer refused anyway** — *"The owner raised it with the customer and **explained how dangerous it is; the customer refused** the 6-digit code and anything in its place: *'ใช่ฉันเข้าใจว่ามันไม่ปลอดภัย แต่เราทำอะไรไม่ได้ ฉันเสนอแล้ว บอกแล้วว่าอันตรายแค่ไหน เขาก็ไม่เอา ปล่อยไปตามนั้น'*."* — (owner โด่ง, 2026-09-02, via `SYSTEM-FACTS.md`)
- **What the canonical file says today:** Side B only, dated **2026-09-02**, under *"🔴 Accepted security risk — LINE entry is the phone number alone (owner, 2026-09-02)"*. **The 09-01 cut, its quote, and REQ-079 §15 are not mentioned there.**
- **What is genuinely undecided, and is NOT decided here:** whether these are one decision recorded twice with a drifted date and quote, or two separate owner statements a day apart. The two Thai texts are not paraphrases of each other — Side A is *"the customer confirmed they don't want the 6-digit 2FA we designed, so cancel it out of the plan"* in substance and is about **the plan**; Side B is about **the risk being knowingly accepted**. Both stand as written.
- **Sighted in:** 2026-09-01, 2026-09-02
- **Owner's answer:** _(unanswered)_

---

## Deliberately kept separate (over-splitting is recoverable; wrong merging is not)

These pairs looked like they might be one question. Each was left as two, with the reason:

- **C-01 (what the day-end writes) vs C-21 (the `NO_SHOW` forfeit rule).** If no screen, API or human can create a `NO_SHOW`, that plainly bears on whether the job writes one — but one is a job's behaviour read from source and the other is a business rule about a family's forfeited session. Merging them would have quietly answered C-01.
- **C-05 (the phone-keyed disclosure posture) vs C-17 (when phone-only became the mechanism).** Same subject, different questions: one is *how the exposure was treated*, the other is *the ordering of the mechanisms*. Merged sightings would have made the ordering look like part of the accepted risk.
- **C-11 (does the production ban bend for an in-session authorization?) vs C-32 (what writes can QA do at all?).** The 08-11 production write is a side of both. Kept apart because C-11 is about an exception to a written "never" and C-32 is a planning fact about QA's whole write capability.
- **C-30 (what `som.develyst.online` is) vs C-31 (whether `uat` == `frontoffice.develyst.online`).** One hostname's designation vs whether two names denote one box. They may collapse into a single environment map once the owner draws it — but they may not.
- **C-42, C-43, C-44 (the three log-dating incidents).** Same failure mode, three different files, three different sets of disagreeing sources, and two of them were settled in opposite directions. Kept as three.
- **C-13 (do the rich menus exist?), C-14 (are typed keywords allowed?), C-15 (can a button start a flow?).** All three touch REQ-079 rule 2 and all three were sighted around the same days. They are three separate factual questions and answering one does not answer the others.
- **C-45 (the 6-digit refusal, two dates two quotes) vs C-05 (the accepted phone-only risk) and C-16 (can 2FA be switched on?).** C-45 is about *what was said, when* — the provenance of the refusal. C-05 is about the *posture* toward the exposure and C-16 about whether the built switch is usable. Folding C-45 into C-05 would have made the date and quote divergence disappear into the very entry it undermines.

---

## Ledger

- **64 raw sightings** across 30 daily logs (2026-07-20 → 2026-09-04) → **45 distinct contradictions**, C-01 … C-45.
- `log/2026-07-26.md` and `log/2026-09-04.md` reported no contradiction of their own; 07-26 contributed the adjacency in C-20 and 09-04 contributed Side D of C-02 and its never-read-back clause.
- **Second pass (added after the first, nothing renumbered):** **C-45** new · **C-13** gained Sides C and D (the live 6-cell menu on `sid` and the source read that it is the old REQ-015/042 menu) · **C-02** gained the clause that the resulting `sid` link state **has never been read back by anyone**.
- **Resolved by any agent: none — not one, at any point.** That discipline held through the whole archaeology run and still holds. No side of any entry was omitted, ranked or preferred.
- **Answered by the OWNER himself on 2026-09-04: six — C-04, C-05, C-08, C-11, C-22, C-31.** That is the **only** way an entry here is ever closed. An entry closed by the owner is **settled**; an entry closed by an agent would be a **defect**.
- **Answered by the OWNER himself on 2026-09-05: eight — C-01, C-03, C-12, C-23, C-27, C-29, C-35, C-41.** Six of the eight were confirmations of his own earlier words: Porter located each quote in the logs and put it back to him verbatim, and he confirmed the set with *"ใช่ทั้ง 6 ข้อ"*. **C-01 and C-03 were new answers.** Porter recorded them; Porter settled nothing.
- **The remaining 31 still read `_(unanswered)_`, and nobody may build on them.**



