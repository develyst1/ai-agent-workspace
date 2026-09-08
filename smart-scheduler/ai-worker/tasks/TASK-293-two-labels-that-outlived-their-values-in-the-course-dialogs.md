**Status:** DONE — code (Sober 09-08, reviewed) — tsc 0 / 159 pass 0 fail / build ok / no backend change. @Porter s copy already existed as `endCourse.resumeDone` since TASK-287 — reused, not duplicated. The owner s four sentences are now pinned byte-for-byte as EVIDENCE. Follow-up: TASK-294 (the Thai collision).

# TASK-293 — two LABELS that outlived their values: *"Resume this course?"* on a done act, and `Ends` on a non-date

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-08)
**Source:** the owner's own four screenshots on `sid` — 🎉 **the summary dialog EXISTS and reads true.**
📌 **Small, and neither is a data defect.** 🚫 No backend change.

---

## §1 🔴 The dialog asks a question it has already answered — @Porter's defect, and his copy
**Title: *"Resume this course?"*** — a question, with a `?`.
**Body: *"4 session(s) put back on the schedule."*** — **past tense, already done.**
**Only button: `Close`.**
⇒ **An admin reading top-to-bottom meets a confirmation prompt and discovers on line 2 that the act is
finished.** 🔴 **The one dialog whose whole job is to say *"here is what I DID"* opens by sounding like
*"may I?"***

✅ **His replacement, verbatim — do not reword it:**
> **Title: *"Course resumed"***

📌 **And the evidence is in his own screenshot: the plan behind the dialog is ALREADY updated.** ⇒ **the title is
the only thing on that screen still claiming the act has not happened.**
⚠️ **The pause face keeps its question** — *"Pause this course?"* is asked **before** the act and is correct.
**One title changes, not both.** **Assert that.**

## §2 🟡 `Ends no live sessions` — the value is right and the LABEL is wrong
While paused, `deriveLiveEndDate` returns `null` — **correctly: there is no end date, because there is no live
plan.** The header then renders that non-answer in the slot that says **`Ends 12 Oct 26`** every other time.
⇒ **a category error, not a missing value: the answer does not fit the question the label asks.**
✅ **While the course is paused, the header should say what IS true** — *the course is paused; it has no dates
until it is resumed* — **rather than answering `Ends` with a sentence.**
🚫 **Do not invent a date, and do not fall back to the expiry.** **`deriveLiveEndDate` returning `null` is
correct and must not change** — the expiry is a ceiling, not an end, and TASK-282 §7 was built on that.
⚠️ **Wording is yours** *(the pause face already says "paused" elsewhere; reuse that vocabulary rather than
inventing a third phrasing)*.

## §3 🔑 Why these two are ONE task
**Both are a LABEL that outlived its VALUE** — a title that still asks after the act, and a field name that still
promises a date after there are none.
📌 **Same family as the three stale comments in TASK-291 and the pause copy @Porter corrected: a string written
for a state the code no longer produces.** **The difference is that a user reads these**, which is why they are
worth a task at all and why neither is worth more than one.

## §4 What must not change
- 🚫 The body sentences — **the owner has now read them and they are true** (*"the expiry is unchanged"* fired
  correctly, which nobody had seen before).
- 🚫 `deriveLiveEndDate`, the counts, `visiblePlanRows`, the server-sourced pause count (TASK-291).
- 🚫 The pause face's title and its copy. 🚫 No backend change.

## Definition of Done
- [ ] Typecheck clean; **state the command**
- [ ] The resume summary's title is **"Course resumed"**, verbatim
- [ ] 🔑 **The PAUSE face still asks its question** — asserted, because that one is asked before the act
- [ ] The paused header no longer answers `Ends` with a non-date — asserted, **and `deriveLiveEndDate` is
      untouched**
- [ ] 🚫 The body sentences byte-identical · no backend change

## Question
**Is there a third label in these dialogs whose value can be absent or already-true?** You have now swept this
component for computed numbers (TASK-291) and I am asking for the same sweep on **words**. 📌 *A label is a
promise about its value; both defects here are the promise outliving it.* **Name any others; change only these
two.**

---

## §5 ✅ IMPLEMENTED — Fern, 2026-09-08. **Both labels. And §1 needed no new string — @Porter's copy was already in the dictionary.**

**Verified:** `bunx tsc --noEmit` → **exit 0** · `bun test` → **159 pass / 0 fail** (was 148 — **+11**) ·
`bun run build` ok. 🚫 No backend change.

### §1 — the title
`title={t(isDrop ? "endCourse.dropTitle" : result ? "endCourse.resumeDone" : "endCourse.resumeTitle")}`

✅ **`endCourse.resumeDone` already WAS *"Course resumed"*** — it is the toast fired the instant the re-plan
lands, and it has said exactly @Porter's replacement, word for word, since TASK-287. 🚫 **So I reused it rather
than adding a second copy.** **Two strings for one fact is the drift class this week has been spent on**, and
here the toast and the title are the same sentence about the same act. *(Thai already said it too:
`กลับมาเรียนแล้ว`.)*

⚠️ **`isDrop` is tested FIRST, and that is the assertion.** `result` is only ever set on the resume face today,
so the pause title was already safe — **writing the branch this way makes it structural rather than
incidental**, and the test pins the branch shape, not just the strings.
✅ **The pause face's question is asserted in both languages**, and so is the resume face's question *before*
the act: **three titles, one changed.**

### §2 — the paused header
`plan.pausedNoEnd` — **"Paused — no dates until it resumes"** / **"พักอยู่ — ยังไม่มีวันเรียนจนกว่าจะกลับมาเรียน"**,
rendered instead of the `Ends {date}` slot when `plan.summary.status === "DROPPED"`.
✅ **The server's own lifecycle field** — the same one the badge reads (TASK-188/189). 🚫 Nothing re-derived from
the rows.
🚫 **No date invented and no fall back to the expiry** — asserted, including that the header's only date source
is still `plan.liveEndDate`. **`deriveLiveEndDate` is backend-side and untouched; nothing here asks it to
change.**
📌 **Vocabulary reused, not invented a third time**: `course.DROPPED` = *"Paused"*, `course.droppedNoWrites` =
*"This course is paused — …"*.

### §4 — what must not change, asserted rather than promised
**The four body sentences the owner actually read are pinned byte-for-byte, in both languages** — including
`resumeExpirySame`, **the branch nobody had ever seen run until his screenshot.** ⇒ **they are evidence now, not
copy**, and a reword has to go through a failing test. @Porter's pause line is pinned the same way.
✅ **Thai completeness is free here:** `const th: typeof en` means the compiler demands the new key — a missing
translation is a type error, not a runtime fallback. *(`keys.test.ts` covers the other direction: a `t()` key
that resolves to nothing.)*

### Definition of Done
- [x] **Typecheck clean** — `bunx tsc --noEmit`, exit 0
- [x] The resume summary's title is **"Course resumed"**, verbatim — and it is the string that already said it
- [x] 🔑 **The PAUSE face still asks its question** — asserted in both languages **and at the branch**
- [x] The paused header no longer answers `Ends` with a non-date — asserted; **`deriveLiveEndDate` untouched**,
      no expiry fallback, asserted
- [x] 🚫 The body sentences byte-identical — **asserted, not just left alone** · no backend change

## Question — **a third label whose value can be absent or already-true?** Three, and one is a Thai-only defect

| Label | Where | Verdict |
|---|---|---|
| 🔴 **`plan.noLiveEnd`** *"no live sessions"* | still poured into `Ends {date}` | **The same category error, for the OTHER causes.** A COMPLETED or never-started plan still reads *"Ends no live sessions"*. **Your §2 ruled on paused only, so I changed only that** — but the label is unfixed for two more states, and it is the identical defect. |
| 🔴 **`plan.noSessions` vs `plan.noLiveEnd` in THAI** | `dictionaries.ts` | **Two different English facts, ONE Thai string: both are `ยังไม่มีคาบ`.** *"No sessions yet"* (never started) and *"no live sessions"* (none live NOW) are **opposite situations** — and REQ-036 already had to add a whole branch because *"ยังไม่มีคาบ"* on an ENDED course *"is the opposite of the truth"*. ⇒ **that fix addressed the ended case; the collision itself is still there.** 📌 **A Thai reader cannot distinguish them at all**, which no English-side review would catch. |
| 🟡 **`Paused` — the word, twice** | `course.DROPPED` = *"Paused"* · `bookingStatus.PAUSED` = *"Paused"* | **One word, two mechanisms** — REQ-076's booking tray and a paused COURSE. Different predicates, different components; `PlanModal`'s own flag comment already warns *"they share a word and nothing else."* ⇒ **the label is accurate for each and ambiguous across them.** Not a defect today; **it is why any future copy about "paused" has to name which.** |
| ✅ **`endCourse.dropDone`** *"Course paused"* | the toast after a pause | **Clean — and it is the mirror of §1**: past tense, fired after the act. It is what the resume title now matches. |
| ✅ **`resumeConfirm` / `dropConfirm` / `common.close`** | the buttons | **Clean.** Both confirms are read before their act; `Close` is the only control left after one. |
| ✅ **`plan.owed` / `plan.size` / `plan.leave`** | `SummaryBar` | **Clean** — each names a value the server sends and that a pause does not change (the course keeps its `size`; that is the point of a pause). |

📌 **The sweep's own lesson, stated because you asked for the method and not just the list:** the numbers sweep
(TASK-291) could be automated — a count either reads a field or computes one. **A label sweep cannot**: nothing
distinguishes *"Ends"* over a date from *"Ends"* over a sentence except reading it. ⇒ **the two I could pin, I
pinned as byte-exact tests; the rest is an eye, and the Thai one needed a Thai eye.**

## Review — Sober, 2026-09-08: ✅ **PASS. TASK-293 is DONE.** 🔴 **And your sweep found a defect that is invisible in English.**

**Reproduced:** `bunx tsc --noEmit` → **0** · `bun test` → **159 pass / 0 fail** (+11) · build ok ·
`resumeDone: "Course resumed"` at `dictionaries.ts:115` **and `กลับมาเรียนแล้ว` at `:1232` — both pre-existing** ·
`pausedNoEnd` added in both languages. 🚫 No backend change.

### 🔑 §1 needed no new string, and that is better than the task I wrote
> *"`endCourse.resumeDone` already WAS 'Course resumed' — the toast fired the instant the re-plan lands, word for
> word, since TASK-287. So I reused it rather than adding a second copy."*

✅ **Two strings for one fact is the drift class this week has been spent on**, and **the toast and the title are
the same sentence about the same act.** 📌 **Worth telling @Porter: the copy he supplied as a replacement was
already in the product, one component away** — **his instinct matched the string that existed.**
✅ **And `isDrop` tested FIRST makes the pause title's safety structural rather than incidental** — *"the test
pins the branch shape, not just the strings."* **Three titles, one changed, all asserted.**

### 🔑 §4 — you turned the owner's screenshots into TESTS
> *"The four body sentences the owner actually read are pinned byte-for-byte, in both languages — including
> `resumeExpirySame`, the branch nobody had ever seen run until his screenshot. They are evidence now, not copy."*

**That is the right thing to do with a verification that cost the owner his night.** ⇒ **a reword now has to go
through a failing test**, and the one branch that had never fired is the one most likely to be "tidied" by
someone who has never seen it. 🔑 **Evidence decays into copy unless something holds it in place.**

### 🔴 The Question — a defect only a Thai reader could find, and I verified it
`dictionaries.ts:1711` **`noLiveEnd: "ยังไม่มีคาบ"`** and `:1715` **`noSessions: "ยังไม่มีคาบ"`** — **identical**,
while the English is *"no live sessions"* versus *"No sessions yet"*.
🔴 **Two OPPOSITE situations — a plan that has none left, and a plan that has not started — reading as one
sentence.** ⚠️ **And `REQ-036` already had to add a branch because *"ยังไม่มีคาบ"* on an ENDED course *"is the
opposite of the truth"* — that fix addressed the ended CASE and left the COLLISION.**
📌 ***"No English-side review would catch it"* is the part that matters**: every reviewer on this project reads
the English column. ⇒ **TASK-294.**
✅ **And `plan.noLiveEnd` is still poured into `Ends {date}` for COMPLETED and never-started plans** — **my §2
ruled on paused only and you changed only that, correctly.** **The same category error, unfixed for two more
states, named rather than quietly widened.**

### 🔑 Your closing paragraph is the one I will reuse
> *"The numbers sweep could be automated — a count either reads a field or computes one. A label sweep cannot:
> nothing distinguishes 'Ends' over a date from 'Ends' over a sentence except reading it. The two I could pin, I
> pinned; the rest is an eye, and the Thai one needed a Thai eye."*

**That is a real statement about the limits of the method we have been building all week.** ⇒ **we have made
numbers, statuses, keys and comments fail on their own. A LABEL cannot be made to fail** — it is correct or
incorrect only against a meaning, and meaning does not compile. 📌 **Recorded, because it says where the tests
stop and a reader has to start.**
