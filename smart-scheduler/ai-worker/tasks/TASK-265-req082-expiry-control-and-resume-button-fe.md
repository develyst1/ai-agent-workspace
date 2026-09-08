# TASK-265 — REQ-082 FE: the expiry control + its warning, and REQ-084's resume button

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-06)
**Spec:** `SPEC-076` §6 · **Requirements:** `REQ-082` AC-1/AC-4 (the screen half) **and `REQ-084`'s feature half**.
⛔ **Ships with TASK-260's siblings — DEPLOY RULE 3.** An editable expiry with no control is a server-side gate
with no screen. 📌 **No clock on this** (@Porter, owner's *"completeness over speed"*).
**Status: DONE — code (Sober 09-06, reviewed) — tsc 0 / 120 pass 0 fail / build ok. ⏳ Deployed checks owed to the batch check. Original note: REVIEW (Fern 2026-09-06)** — one warning component · resume without a date · the TASK-262 prop deleted · Q1 answered by NOT building. tsc 0 · 120/0 · build ok.

> 🔴 **The contract is written this time.** @Jason sent it as a contract rather than leaving it to be discovered —
> **the exact failure I caused on TASK-261 and he closed before it could repeat.** It is §1, verbatim from him.

---

## §1 The contract — @Jason's, as delivered

| | |
|---|---|
| **Edit the expiry** | `PATCH /courses/:id/expiry` → returns `expiryWarning: { expiryDate, warn, outside[], outsideCount }` |
| **Resume a course** | `POST /courses/:id/resume` — 🔴 **`expiryDate` is now OPTIONAL.** Sending it always still works, so **your current code does not break** — but *resume without asking for a date* is now legal **and is the normal case.** |
| **`EXPIRY_REQUIRED` (400)** | still exists, but fires **only** when the sessions the resume would create fall outside the existing expiry. Its message names the count and the old date. |
| **History** | `GET /courses/:id/expiry-history` → the audit rows, newest first |

🔑 **`expiryWarning` is the SAME shape from both endpoints** — *"so one warning component serves both REQs."*
⇒ **Build one component.** That is what makes the owner's *"one rule across both"* true in the code rather than in
the REQ text.

## §2 The expiry control (REQ-082 AC-1 / AC-4)
- **Editable on any course** — AC-1 says *any*, and TASK-264 deliberately does **not** gate it on
  `assertCourseWritable`, **because REQ-084's resume warning points at this control on a course that is DROPPED at
  that moment.** ⚠️ **So do not add a lifecycle gate here** — it would point the warning at a control that
  refuses. *(This is the one place today where `canPauseCourse`'s sibling reasoning does NOT apply, and it is
  deliberate.)*
- 🔴 **AC-4: warn, and still save.** When `warn` is true, show **which sessions fall outside** (`outside[]`,
  `outsideCount`) — **and let the admin save anyway.** 🚫 **Not a refusal. Not a blocking confirm that cannot be
  passed.** The owner's rule is *warn, do not act*, and a dialog the admin cannot get past is acting.
- 🚫 **Do not compute the warning.** It is on the response. **A second derivation on the screen is how the warning
  and the truth come apart** — the same rule as TASK-261's clash message.

## §3 REQ-084's feature half — the resume button
📌 **It already exists** in `PlanModal` (`endCourse.resume`, gated on `courseDropped`) and **has been rendering on
nothing** until TASK-263 fixed the payload. ⇒ **Most of this is already yours and already correct.**
**What changes:** the resume call may now go **without** an `expiryDate`, and the response may carry
`expiryWarning`. ⇒ **Ask for a date only when the server says one is needed** — that is (ข), the owner's own
*"warn, do not act"* applied to his own prompt.
⚠️ **Handle `EXPIRY_REQUIRED` (400) as a prompt, not an error banner:** it means *"this resume needs a date"*, and
the message names the count and the old date. **Show that, ask for the date, retry.**

## §4 What must not move
- 🚫 **REQ-071's course-pause wording** — untouched, again.
- 🚫 **@Fern's `courseStatus` prop from TASK-262 can now be DELETED** — TASK-263 landed the payload field it was
  standing in for, and your own call site says so. ✅ **Delete it here**; that was the plan when you wrote it.
- 🚫 No second warning shape, no second clash message, no recomputation of anything the server returned.

## Definition of Done
- [ ] Typecheck clean; state the command *(⚠️ `bun run lint` fails repo-wide — `next lint`, Next 16. Pre-existing.)*
- [ ] The expiry is editable and **saves when `warn` is true** — asserted that nothing blocks the save
- [ ] The warning names the sessions outside, **from the response** — asserted that the screen computes none of it
- [ ] **ONE warning component**, used by both the edit and the resume — asserted there is not a second
- [ ] Resume works **without** a date; `EXPIRY_REQUIRED` prompts for one and retries — both asserted
- [ ] The `courseStatus` prop and its hand-down path are **gone**
- [ ] 🚫 No backend change
- [ ] ⏳ **Deployed measurement:** this and TASK-261's tray both need the app. **Say what you could not verify** —
      do not dress arithmetic as a measurement, as you did not last time.

## Questions
1. **Where does the expiry history (`GET .../expiry-history`) belong** — in `PlanModal`, in `CourseHistoryModal`,
   or nowhere yet? **Nobody has asked for a screen for it.** 🚫 **Do not build one on spec** — if it has no
   obvious home, say so and leave the endpoint unused. **An audit nobody reads is still worth having; a screen
   nobody asked for is not.**
2. **Does the resume dialog still make sense** if the date is usually not asked for? It may now be a plain confirm
   most of the time and a date prompt occasionally. **That is a real UX shape change and it is yours.**

---

## Implementation Notes (Fern, 2026-09-06)

| | |
|---|---|
| Repo | `smart-scheduler-front` → the `machine.local.md` row · `git rev-parse --short HEAD` = **`4cd2645`** (2 ahead of `develop`, 0 behind — checked) |
| Status | **REVIEW** — REQ-082's screen half and REQ-084's feature half both done. Q1 answered **by not building**; Q2 answered by a real shape change. |

🔑 **Building against a written contract instead of a guessed one is a different job.** TASK-261 cost a Q3 and a
reconciliation risk; this had none — I read §1, checked it against `validation.ts` and the two service functions,
and wrote code. **Worth saying plainly since you named it.**

### What changed

| File | Change |
|---|---|
| `components/common/ExpiryWarningAlert.tsx` **(new)** | 🔑 **THE one warning** — both endpoints, one component |
| `components/partials/Bookings/EditExpiryDialog.tsx` **(new)** | REQ-082 AC-1/AC-4 — the expiry control |
| `CoursePackagePanel.tsx` | the control on the card's expiry line, **un-gated** · mounts the dialog |
| `DropResumeDialog.tsx` | resume **without** a date · `EXPIRY_REQUIRED` as a prompt · renders the warning |
| `services/scheduler.service.ts` · `scheduler.mock.service.ts` · `hooks/…/useScheduler.ts` | the two calls, offline too |
| `types/api/contract.ts` | `ExpiryWarning` + the two response shapes |
| `PlanModal.tsx` · `BookingsContent.tsx` · `CoursePackagePanel.tsx` | 🧹 **the TASK-262 `courseStatus` prop and its whole hand-down path — DELETED** |

### 🔑 One warning component, and it is asserted to be the only one

`expiryWarning` is byte-identical from `PATCH /courses/:id/expiry` and `POST /courses/:id/resume`, so
`ExpiryWarningAlert` renders both. **A test asserts there is no second component** — the owner's *"one rule
across both"* is only true in the code if there is literally one, and a sibling built beside it is exactly how
the two come to say different things about the same fact.
🚫 **It computes nothing** — asserted: no date comparison, no `dayjs`, no `.filter(... date <)`. It reads
`warn`, `outside`, `outsideCount` and stops. Same rule as TASK-261's clash message.
🔴 **It owns no button and disables nothing.** That is structural, not a promise: a warning component that
cannot block cannot become a gate later by accident.

### 🔴 AC-4 — warn, and still save. And the ordering is the reason it is easy to get right.

📌 **The warning only exists AFTER the save.** `PATCH …/expiry` writes the date and *then* reports what that
left outside, so there is no moment at which a warning could block anything — the dialog asks, saves, and shows
what happened. Asserted anyway, because the tempting "improvement" is to gate the save on `warn`:
- the expiry submit is `disabled={!course || !expiry}` and **no `disabled=` expression mentions `warn`**;
- the resume submit is never disabled by the warning either.

📌 One deliberate UX call: **when `warn` fires the dialog stays open** to show it, with the primary button gone
(the save already happened) and Cancel becoming Close. A warning this specific disappearing into a toast is a
warning nobody reads.

### REQ-084 §3 — the resume, and Q2's answer

**Q2: yes, it is a real shape change, and I made it.** The dialog is now a **plain confirm**, and the date field
does not exist until the server says `EXPIRY_REQUIRED`. Before TASK-264 the field was always rendered and always
required; now most resumes never see it.
⚠️ **`EXPIRY_REQUIRED` is handled as a prompt, not an error banner** — its message names the count and the old
date, so it is shown, the field appears with a line saying *why it suddenly appeared*, and the admin retries.
An error banner would read as a refusal of something they can simply answer.
🚫 The service sends **no `expiryDate` key at all** when there is none — asserted — because the point of (ข) is
that a resume can legitimately carry no date, not that it carries an empty one.

### §2 — the expiry control is NOT lifecycle-gated, and that is deliberate

It sits on the **course card**, on the expiry line, reachable for **every** status the filter can show —
`DROPPED` included, which is the case that matters: REQ-084's resume warning points the admin at this control on
a course that is dropped **at that moment**.
⚠️ **This is the one place today where TASK-262's *"gate the control on lifecycle"* instinct does NOT apply**,
and I have written that on the control itself and asserted it in a test, precisely because my own last task
argued the opposite everywhere else. @Jason left the endpoint un-gated for the same reason.
📌 It is on the **card**, not in `PlanModal`, for a structural reason: `PlanModal` shows a dropped course only
its resume action (`courseWritable` is false), so an expiry control placed there would be unreachable in exactly
the state REQ-084 needs it in.

### §4 — the TASK-262 stand-in is gone

`courseStatus` prop, the widened `onManage(id, status)`, and `BookingsContent`'s `{id, courseStatus}` state:
**all deleted.** `PlanModal` reads `plan.summary.status` again, as it always did — TASK-263 put the field back.
**Three of my own TASK-262 tests failed on this and that was correct** — they pinned the stand-in. They now
assert the opposite: the payload field is read, **and the prop and its path are absent.**

### Verified

```
bunx tsc --noEmit   → exit 0
bun test            → 120 pass / 0 fail, 264 expect(), 13 files   (was 109/0 across 12 → +11)
bun run build       → ok
```
⚠️ `bun run lint` still fails repo-wide (`next lint`, removed in Next 16) — pre-existing, untouched.

### 🔴 What I could NOT verify — no arithmetic dressed as measurement

**Nothing here was seen rendered.** `/scheduler/*` is behind the auth proxy and the only way through is a
password field I may not fill. Specifically unverified:
1. **That the warning READS well** — the list of outside sessions, and whether *"saved, but…"* lands as
   reassurance rather than alarm. **That is a judgement about words on a screen and I have not seen it.**
2. **The resume dialog's two shapes** — plain confirm, and the prompt after `EXPIRY_REQUIRED`. The mock reaches
   both (a course id ending in an odd digit has sessions outside), so this is a **LOCAL** check, not a `sid` one.
3. **The card's expiry control at any width.** It adds an icon to an existing line inside a 3-column grid; I did
   **not** measure it and I am not going to compute it and call that a measurement.
4. ⏳ **Still owed from TASK-261:** the tray at 1600 / 1280 / 768 / 375, once TASK-260 is on a box.

```bash
NEXT_PUBLIC_USE_MOCK=true NEXT_PUBLIC_API_URL="http://127.0.0.1:9/api" AUTH_URL="http://localhost:3017" PORT=3017 bun run dev
```

## Questions — FE

**Q1 — the expiry history: I did not build a screen, and I did not wire the endpoint either.**
`GET /courses/:id/expiry-history` has **no obvious home**. `CourseHistoryModal` is the closest, but it is
REQ-035's *session-deduction* history — a different question with a different audience, and merging two audit
trails into one modal makes both harder to read. `PlanModal` is per-course but is about the schedule.
⇒ **Left unused, per your own line: *an audit nobody reads is still worth having; a screen nobody asked for is
not.*** 🔴 **The rows are being written either way**, so nothing is lost by waiting for someone to ask. If the
owner does ask, the natural home is a tab beside the deduction history rather than inside it.

**Q2 — answered above by building it: the resume is now a plain confirm that becomes a date prompt.** Worth one
check from someone who can see it: with the field gone, the dialog is *very* short — if it now reads as too
slight for an action that regenerates real sessions, the fix is a sentence, not a field.

## Review — Sober, 2026-09-06: ✅ **PASS. TASK-265 is DONE (code).** ⇒ **The re-opened batch is CODE-COMPLETE again.**

**Reproduced:** `bunx tsc --noEmit` → **0** · `bun test` → **120 pass / 0 fail** (13 files, 264 expects) ·
`ExpiryWarningAlert` is **one** component, imported by **both** dialogs · `courseStatus` is now a local const read
from `plan.summary.status` — **the prop and its hand-down path are gone**, exactly as planned when you wrote them.

### 🔴 The ordering makes AC-4 structural rather than promised
> *"The warning only exists AFTER the save… there is no moment at which a warning could block anything."*

**That is the strongest form of "warn, do not act":** not a rule anyone has to keep, but a sequence in which
blocking is not available. ✅ **And you asserted it anyway**, because *"the tempting improvement is to gate the
save on `warn`"* — **no `disabled=` expression mentions it, on either dialog.**
📌 **And the warning component owns no button and disables nothing** — *"a warning component that cannot block
cannot become a gate later by accident."* **Structural again, not a comment.**

### ✅ The UX call I would not have specified and would have been wrong to
**When `warn` fires the dialog stays open**, primary gone, Cancel becomes Close.
> *"A warning this specific disappearing into a toast is a warning nobody reads."*

**The save has already happened, so the dialog is no longer asking — it is reporting**, and that is the right
shape for a message naming individual sessions a family will notice.

### 🔴 The placement decision is the best thing in this task, and my spec did not contain it
The control is on the **card**, not in `PlanModal`, and the reason is structural:
> *"`PlanModal` shows a dropped course only its resume action (`courseWritable` is false), so an expiry control
> placed there would be unreachable in exactly the state REQ-084 needs it in."*

⇒ **Putting it where my spec implied would have made the feature dead in the one case it exists for** — the same
class as the resume button that rendered on nothing. **You found it by asking where the admin actually is when
the warning tells them to go there.**

### ✅ You recorded an exception against your own precedent
*"This is the one place today where TASK-262's 'gate the control on lifecycle' instinct does NOT apply"* — written
**on the control** and **asserted in a test**, *"precisely because my own last task argued the opposite
everywhere else."*
📌 **An exception nobody wrote down is a defect waiting for a tidy-up**, and you were the person most likely to
tidy it.

### ✅ Q2 answered by building it — and the detail that shows it was thought through
The dialog is a **plain confirm**; the date field does not exist until the server asks. ⚠️ And the field appears
**with a line saying why it suddenly appeared** — *"an error banner would read as a refusal of something they can
simply answer."*
🔑 **And no `expiryDate` key at all when there is none** — asserted — because *"the point of (ข) is that a resume
can legitimately carry no date, not that it carries an empty one."* **That is the difference between implementing
the shape and implementing the meaning.**

### ✅ Q1 answered by NOT building, which is what I asked for
No home for the history: `CourseHistoryModal` is REQ-035's **session-deduction** history — *"a different question
with a different audience, and merging two audit trails into one modal makes both harder to read."*
🔑 **The rows are written either way, so nothing is lost by waiting for someone to ask.** ⇒ endpoint left unused,
deliberately, with the natural home named for when the owner does ask.

### ✅ And what you could not verify, listed without dressing
Four items, and you drew the line I care about: the resume dialog's two shapes are a **LOCAL mock** check, *"not
a `sid` one"*. ⚠️ **Your own flag goes into the batch check:** with the field gone the dialog is *very* short —
*"if it now reads as too slight for an action that regenerates real sessions, the fix is a sentence, not a
field."* **That is a judgement for someone who can see it, and it is now on @Porter's list.**

**Status → DONE (code).** ⇒ **Every build item in the re-opened batch is complete.**
