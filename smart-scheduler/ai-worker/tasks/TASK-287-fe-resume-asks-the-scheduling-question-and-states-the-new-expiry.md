**Status:** DONE — code (Sober 09-08, reviewed) — tsc 0 / 124 pass 0 fail / build ok / no backend change. THE RELEASE IS COMPLETE. §2 read-before-confirming is NOT buildable (no preview route) — she broke my ordering rather than the compute-nothing rule, which is right; put to @Porter as a question.

**Status: REVIEW (Fern 2026-09-08) — READY, ships with TASK-282.** 2-field body verified at source · flag flipped in THIS commit · `EXPIRY_REQUIRED` handler deleted · `ExpiryWarningAlert` kept for REQ-082 only · ⚠️ §2's "before confirming" is NOT reachable — no preview endpoint; see notes. tsc 0 · 124/0 · build ok.

🔴 **CORRECTED — READ §5 FIRST. The body is TWO fields (`startDate`, `startTime`), not three. §3 above is WRONG.** `EXPIRY_REQUIRED` is gone; delete the handler. The re-enable of `PlanModal.tsx:79` is YOURS, in your commit.

# TASK-287 — FE: resume asks the scheduling question, and STATES the expiry it moved

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-08)
⏱️ **TONIGHT — the owner chose to finish it all.** ⛔ **Ships with TASK-282; neither works alone.**
🚫 No backend change. 🚫 No migration.

---

## §1 The owner's ruling, and what it makes this screen
> *"ให้ไปเริ่มตามสูตรใหม่ เหมือนวางแผนใหม่ … เอาเหมือนตอนสร้างคอร์สเลย … วันหมดอายุก็งอกไปสิ เรื่องปกติ"*

**Resume is a RE-PLAN, not a restoration.** ⇒ **the resume dialog asks the same scheduling question as course
creation — weekday · start time · start date — and the remaining sessions are laid out from there.**
✅ **"เอาเหมือนตอนสร้างคอร์สเลย" is an instruction to you: reuse the creation form's fields.** 🚫 **Do not design a
new control** — there is to be no new concept for staff to learn.

## §2 🔴 The expiry MOVES, and you must SAY SO
@Porter: *"the expiry moves because the course moved, not as a separate admin act — an expiry that shifts
silently is exactly what `REQ-082`'s audit trail exists to make answerable."*
⇒ **the confirmation states BOTH the new last session and the new expiry**, from the response — 🚫 **compute
neither.** TASK-282 returns them.
🔑 **This is the ONE place that differs from `REQ-082`'s "warn, do not act"** — **here we ARE acting**, so the
admin must read what we did **before** confirming, not discover it after.
⚠️ **Not a blocking confirm that cannot be passed** — the owner's rule still holds. **State it, then let them go.**

## §3 What changes, and what the API now demands
- **The body is REQUIRED**: `{ weekday, startTime, startDate }`. 🔴 **`POST …/resume` with `{}` is now REFUSED** —
  that is deliberate (it removes the second, untested path that produced DEF-2's non-determinism). **Your call
  site must always send a schedule.**
- ⚠️ **`EXPIRY_REQUIRED` may cease to exist on this path** — the expiry is derived now. **Do not delete your
  handler until @Jason's report says it is unreachable; then delete it and say so.**
- ✅ **`ExpiryWarningAlert` — check whether it still has a job here.** The warning existed because a resume could
  push sessions past the expiry; **if the expiry now always covers them, it cannot fire.** ⚠️ **Say which, rather
  than leaving a component mounted that can never render** — that is the `AUDIENCE_OMITS` lesson.
- ✅ **Re-enable the control**: `PlanModal.tsx:79`, `COURSE_PAUSE_RESUME_ENABLED = true`. **Both faces come back
  together — that is why it was built as one flag.**

## §4 What must not change
- 🚫 `REQ-076`'s booking pause tray. **Different feature, shipped, untouched.**
- 🚫 `REQ-082`'s expiry EDIT control and its warning — **that path still warns and still does not act.**
- 🚫 The drop/pause face of the dialog beyond re-enabling it.
- 🚫 No backend change.

## Definition of Done
- [ ] Typecheck clean; **state the command** *(⚠️ `bun run lint` fails repo-wide — pre-existing.)*
- [ ] The resume dialog asks **weekday · start time · start date**, **reusing the creation form's fields** —
      asserted that no new bespoke control was introduced
- [ ] 🔑 **The confirmation states the new LAST SESSION and the new EXPIRY, from the response** — asserted, **and
      asserted that the screen computes neither**
- [ ] **The call always sends a schedule** — asserted; no path can send `{}`
- [ ] `COURSE_PAUSE_RESUME_ENABLED` is **`true`**, both faces back — asserted
- [ ] **`ExpiryWarningAlert` and the `EXPIRY_REQUIRED` handler: kept with a reason, or removed with one** — say
      which, do not leave either standing unexamined
- [ ] 🚫 No backend change · the booking tray and REQ-082's edit asserted untouched

## Question
**Does the creation form's scheduling group come apart cleanly, or is it welded to the enrolment flow?**
📌 *"Reuse the creation fields" is the owner's instruction and the right one — but if extracting them is a
refactor rather than an import, **say so and copy the three inputs instead.*** ⏱️ **Tonight is not the night to
untangle a form**, and a copy you have named is better than a refactor nobody reviewed at 05:00.

---

## §5 🔴 CORRECTED 2026-09-08 — **the body is TWO fields. §3 above was WRONG.**

**`POST /courses/:id/resume` takes `{ startDate, startTime }`. BOTH required. There is NO `weekday`.**
Verified in the shipped schema — `validation.ts:697`.
🔴 **zod STRIPS an unknown `weekday` SILENTLY** ⇒ a three-field form would look right, send three, and lose one
with no error. **The TASK-215 failure mode.**

**@Jason's reasoning, which is better than my §3:**
📌 **This IS the creation question** — `createCoursePackage` has no `weekday` field either; the service derives
it (`weekday: weekdayOf(input.startDate)`, `scheduler.service.ts:1523`/`:1640`), and resume now uses that line.
🔑 *"A three-field body can contradict itself. `{ startDate: Tue 3 Nov, weekday: FRIDAY }` has no correct answer:
either it is refused for something that can only ever be a typo, or one field silently wins. Two fields cannot
disagree."*
✅ **And it makes the screen smaller: no day picker. The DATE carries the weekday.**

## §6 Two more corrections, both simplifications
1. ⛔ **`EXPIRY_REQUIRED` is GONE from the backend** — not *"may be unreachable"*, **gone**, asserted across the
   whole service. ⇒ **DELETE the prompt-and-retry handler and say you did.** No judgement call left.
2. ✅ **`COURSE_PAUSE_RESUME_ENABLED = true` is YOURS, in YOUR commit.** @Jason deliberately did not flip it:
   **the backend already refuses the old body, so re-enabling before your form exists turns a hidden feature
   into a visibly broken one.** 🔑 **He is right, and my TASK-282 DoD had the ordering wrong.** ⇒ **the re-enable
   belongs beside the form that makes it work.**
⚠️ **`ExpiryWarningAlert`: still yours to judge** — the expiry is derived now, so it may have nothing left to
warn about on this path. **Keep it with a reason or remove it with one.** *(It still serves REQ-082's EDIT.)*

## §7 The response fields, by name
**`lastSession` · `expiryDate` · `expiryExtended`.** 🚫 **Compute none of them.**

## §8 Definition of Done — replaces §3's field list
- [ ] The dialog asks **start date · start time** — **two inputs, no day picker** — reusing the creation form's
- [ ] 🔑 **The request body is exactly `{ startDate, startTime }`** — asserted. **No `weekday` is sent.**
- [ ] The confirmation states **`lastSession` and `expiryDate`** from the response — asserted, **computing neither**
- [ ] **The `EXPIRY_REQUIRED` handler is deleted** — say so
- [ ] **`COURSE_PAUSE_RESUME_ENABLED = true`**, both faces back — asserted
- [ ] **`ExpiryWarningAlert` kept with a reason or removed with one** — say which
- [ ] 🚫 No backend change · the booking tray and REQ-082's edit asserted untouched

---

## Implementation Notes (Fern, 2026-09-08)

| | |
|---|---|
| Repo | `smart-scheduler-front` · `git rev-parse --short HEAD` = **`db1ac1b`** |
| Status | **REVIEW — ready to ship with TASK-282.** tsc 0 · **124/0** · build ok. 🚫 No backend change. |

🔑 **I verified the corrected contract at source before writing a line**, because §3 and §5 disagree in the same
file: `validation.ts:697` is `z.object({ startDate: DATE, startTime: TIME })` — **two fields, no `weekday`** — and
`EXPIRY_REQUIRED` appears nowhere in the service except in tests asserting its absence. **§5/§6 are right; §3 is
superseded.** Response fields confirmed too (`scheduler.service.ts:3895-3903`): `lastSession`, `expiryDate`,
`expiryExtended`, **and no `expiryWarning`.**

### The Question — **the scheduling group does NOT come apart. I copied the two inputs, as you allowed.**

`CreateCourseModal`'s date and time are **two plain Mantine inputs inline in the JSX** (`:249-266`), not a
component — inside a ~400-line form whose `bookableTeachers` filter and live preview both derive from
`startDate`. **Extracting them is a refactor of the enrolment flow, not an import**, and your escape says
exactly what to do with that on deploy night.

⇒ **Copied, and copied precisely so staff see the same control:** same labels (`course.firstDate`,
`course.time`), same `TIME_SLOTS` source, same `valueFormat="D MMM YYYY"`, same `minDate`, same defaults
(`today + 7`, `10:00`). 📌 **That is what *"เอาเหมือนตอนสร้างคอร์สเลย"* actually asks for** — the same question in
the same words, not a shared module. The copy is named in a comment at the site so nobody thinks it is
divergence.

### What the dialog does now

| | |
|---|---|
| **Before** | two inputs: start date · start time. **No day picker** — the DATE carries the weekday. |
| **On confirm** | `{ startDate, startTime }`, always. **There is no path that can send `{}`.** |
| **After** | the same dialog states **what the re-plan did**: sessions put back · `lastSession` · and the expiry, as **one of two separate sentences** — moved, or unchanged. Only Close remains. |

🚫 **The screen computes none of it** — asserted: no `dayjs(` and no `.add(` anywhere in the result panel.
`expiryExtended` is the server's, because *"the expiry moved because the course moved"* and *"a number changed"*
are different claims and only the server can tell them apart.

### ⚠️ One thing in §2 I could not build as written — and it is not a blocker

> *"the admin must read what we did **before** confirming, not discover it after"*

**There is no preview endpoint.** `POST …/resume` is the only route (`api.ts:116`), and `lastSession` /
`expiryDate` **exist only in its response** — i.e. only after the act. So *"before confirming"* is not reachable
without a `resume/preview`, and I did not invent one or fake it by computing the dates client-side (which would
have broken §7's *"compute none of them"* to satisfy §2's ordering).

⇒ **What I built is the achievable half, and it serves §2's stated purpose:** the dialog **holds open** and
states both facts, with the primary button gone, so the admin reads them rather than finding them later on a
card. 📌 **If the owner wants it genuinely before the act, that is a `POST …/resume/preview` and a BE task** —
worth knowing before someone reads §2 and assumes it shipped.

### §6 — both cleanups, done and stated

1. ⛔ **`EXPIRY_REQUIRED` handler: DELETED**, and the mock's rejection with it. A comment at the site says why,
   so it is not restored from git history by someone who finds the removal puzzling. Asserted gone from both.
2. ✅ **`COURSE_PAUSE_RESUME_ENABLED = true`** — `PlanModal.tsx:71`, **in this commit**, beside the form that
   makes it work. @Jason was right not to flip it: the backend already refuses the old body, so re-enabling
   before this form existed would have turned a hidden feature into a visibly broken one. **Both faces still
   read the one flag** — asserted, still exactly two gates.

### `ExpiryWarningAlert` — **KEPT, with the reason, and with one caller by design**

It is **removed from the resume** (its condition cannot occur there any more — the expiry is derived from the
very sessions it used to warn about, and the BE dropped `expiryWarning` from that response), and **kept for
REQ-082's EDIT**, which genuinely still has the question: that verb takes a date the admin chose and has nothing
to infer from.

🔴 **And I corrected three comments that had quietly become false** — the component's own header
(*"Both endpoints return the identical shape"*), `EditExpiryDialog`'s (*"the same one the resume path uses"*),
and the mock's (which described the `EXPIRY_REQUIRED` branch it no longer has). **A comment asserting a
behaviour the code no longer has is worse than no comment** — my own TASK-191 lesson, and it would have been the
easiest thing to leave.

### Tests — 3 of mine failed, and all three were *correct* failures

- `course-pause-disabled.test.ts` — **deleted.** It said at the top that it was temporary and died with the
  flag. The flag is on; keeping it would have been a test asserting a shipped feature is hidden.
- `expiry-warning.test.ts` — the five assertions pinning TASK-265's resume shape (optional date, the prompt, the
  warning) were pinning a product that no longer exists. **Rewritten to the new truth**; REQ-082's edit
  assertions are unchanged, because that path did not change.

📌 **One of my own assertions was wrong twice and is worth recording**: I first asserted *"the word `weekday`
appears nowhere"* — which failed on the **comments explaining why there is no weekday**. A test that forbids a
word deletes its own explanation. It now asserts on the **payload slice**, anchored at `api.post` (my first
attempt anchored on `` /resume` `` and hit the comment above it).

### Verified

```
bunx tsc --noEmit   → exit 0
bun test            → 124 pass / 0 fail, 280 expect(), 13 files
bun run build       → ok
```
⚠️ `bun run lint` fails repo-wide (`next lint`, Next 16) — pre-existing.
🚫 No backend change · REQ-076's booking tray and REQ-082's expiry edit both asserted untouched.

### 🔴 Not verified — nothing was seen rendered

Auth wall. **Named, since this ships tonight:** the two-input resume dialog and its result panel have not been
seen; nor has the re-enabled pause button. The mock covers the whole flow, so it is a **LOCAL** check.
📌 **If anyone is at a screen tonight, the thirty seconds worth spending is: pause a course, resume it, and read
the expiry sentence.** That is the one the owner asked to be told about, and it is the one no test can judge.

## Review — Sober, 2026-09-08: ✅ **PASS. TASK-287 is DONE. The release is COMPLETE.** 🔻 **And §2's ordering was impossible — my error, and you were right to break it rather than §7.**

**Reproduced:** `bunx tsc --noEmit` → **0** · `bun test` → **124 pass / 0 fail** · build ok ·
`COURSE_PAUSE_RESUME_ENABLED = true` at `PlanModal.tsx:74` with **exactly two gates** ·
`resumeCourse(courseId, { startDate, startTime })` — **two fields** · 🚫 no backend change.

### 🔑 You verified the contract at source **because my own task contradicted itself**
> *"§3 and §5 disagree in the same file."*

**They did — I corrected §3 by appending §5 rather than replacing it.** ✅ **You went to `validation.ts:697` and
`scheduler.service.ts:3895-3903` and built from the code, not from the task.** 📌 **That is the right response to
a document that argues with itself, and the document was mine.**

### 🔻 §2's "before confirming" is NOT buildable, and you chose the correct thing to break
> *"`lastSession` / `expiryDate` exist only in the response — i.e. only after the act. I did not invent a preview
> or fake it by computing the dates client-side, which would have broken §7's 'compute none of them' to satisfy
> §2's ordering."*

🔴 **My §2 demanded the admin read values that do not exist until the act is done.** ⇒ **the two halves of my own
task could not both be satisfied**, and **you broke the ORDERING rather than the CORRECTNESS rule.** ✅ **That is
the right ranking:** a computed preview that drifts from the server is a worse failure than reading the outcome a
second later. 🔑 **And what you built serves §2's stated PURPOSE** — the dialog holds open, states both facts,
primary button gone, *"so the admin reads them rather than finding them later on a card."*
📌 **Recorded, and going to @Porter as a question rather than a task:** *"genuinely before the act"* needs
`POST …/resume/preview`. **My recommendation is that we do not build it tonight** and I have said why.

### 🔑 The Question — you took the escape, and named exactly what it bought
`CreateCourseModal`'s inputs are **two plain Mantine inputs inline in a ~400-line form** whose teacher filter and
live preview both derive from `startDate`. ⇒ **extraction is a refactor of the enrolment flow, not an import.**
✅ **Copied — same labels, same `TIME_SLOTS`, same format, same `minDate`, same defaults — and NAMED as a copy at
the site.**
🔑 *"That is what 'เอาเหมือนตอนสร้างคอร์สเลย' actually asks for — the same question in the same words, not a
shared module."* **Correct, and it is the distinction that makes the copy right rather than lazy.**

### ✅ Three false comments corrected — and the discipline is yours, from TASK-191
The component header (*"both endpoints return the identical shape"*), `EditExpiryDialog`'s, and the mock's.
**A comment asserting a behaviour the code no longer has is worse than no comment**, and **all three would have
been the easiest thing to leave.**

### ⚠️ ONE more, which you missed — and it is the same class, in the same repo
**`hooks/scheduler/useScheduler.ts:309`** still reads *"the server asks for one (`EXPIRY_REQUIRED`) only when the
sessions it would create fall outside the…"* ⇒ **a fourth comment describing the gate you just deleted, as
though it were current.**
📌 **And it pairs with one I owe @Jason:** `smart-scheduler-back/src/services/scheduler.service.ts:15` says the
same thing. ⇒ **both repos carry a comment for a mechanism that no longer exists — one line each.** **Not a
blocker; do it in the same commit if you are still at the keyboard.**

### ✅ Your three test failures were all correct failures
The temporary flag test **deleted** because it announced its own expiry and the flag is on — *"keeping it would
have been a test asserting a shipped feature is hidden."* And TASK-265's five assertions rewritten because they
**pinned a product that no longer exists**, with REQ-082's edit assertions untouched **because that path did not
change.** 🔑 **Knowing which half of a test file to leave alone is the part that usually goes wrong.**
📌 **And your own assertion being wrong twice — *"the word `weekday` appears nowhere"* failing on the comments
explaining why there is no weekday — is worth the line you gave it.** **A test that forbids a STRING will always
catch the explanation of why the string is absent.**
