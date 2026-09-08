**Status:** DONE — code (Sober 09-08, reviewed) — tsc 0 / 133 pass 0 fail / build ok / no backend change. §2: the summary dialog rendered ZERO ms — onDone fired in the same tick as setResult; one cause, both symptoms. It carries a CORRECTION to what we told the owner: read-AFTER was true in design and false in the build.

# TASK-288 — FE: the resume form defaults to a slot that is not this course's, the summary dialog may never appear, and the pause copy is now false

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-08)
**Cause:** @Tanya's UI round on the deployed `sid` — **clicked, not called.** ⛔ **`uat` is off until this lands.**
🚫 No backend change. 🔻 **Item 1 is my instruction's fault, not yours — see §1.**

---

## §1 🔴 The defaults — and this one is mine
`DropResumeDialog.tsx:63-64`:
```ts
const [startDate, setStartDate] = useState(dayjs().add(7, "day").format("YYYY-MM-DD"));
const [startTime, setStartTime] = useState("10:00");
```
**A `17:00` course was resumed on the defaults and every session came back at `10:00`.** ⇒ **the course's time
moved, silently, on the path an admin actually takes.**
🔻 **I told you to reuse the creation form's fields, and you reused their DEFAULTS — correctly, because that is
what I asked.** **For CREATION `10:00` and `today+7` are sensible. For a RE-PLAN they are not: this course
already has a slot.**
✅ **The fix: default to the COURSE'S OWN `startTime`.** The plan modal has it.
⚠️ **The DATE is a real choice and I am not pretending otherwise** — the old dates are behind us or the admin
would not be re-planning. **`today + 7` is defensible; the TIME is not.** 🔑 **If you can default the date to the
course's own weekday (the next one on or after today+7), do — it makes "the same slot, later" the one-click
answer and moving it deliberate.**
📌 **This is what made her screen look like DEF-2 had survived.** **A form that asks with the wrong answer
pre-filled produces the same screenshot as a bug that never asked.**

## §2 🔴 The summary dialog did not appear — and it carries an answer I gave the owner
She saw **no post-resume summary**; instead the **PAUSE** dialog re-rendered empty for seconds —
*"Pause — for — — the remaining 0 sessions come off the schedule."* **The same empty flash follows PAUSE**, so it
is not resume-specific.
🔴 **This is load-bearing.** Your *"read AFTER, not before"* — which @Porter and I both took to the owner as the
answer — **depends on that dialog existing.** ⇒ **if it never shows, the admin has NO way to learn the new dates
and our answer was wrong.**
⚠️ **@Tanya captured at +8s and +16s and declared it: a dialog living under 8 seconds would be missed.** **That
may be the whole story.** ⇒ **Answer it directly: does it render, for how long, and what closes it?**
**And the empty re-render is a second thing in the same component — one answer should cover both.**

## §3 ✅ The pause copy — @Porter's own correction, verbatim
**Current, and false since the owner's re-plan ruling:**
> *"…the remaining 4 sessions come off the schedule. **The course keeps its slot and can be resumed.**"*

**Replace with his wording exactly:**
> *"…the remaining 4 sessions come off the schedule. **Resuming re-plans the course from a date you choose — the
> time and the expiry date can move.**"*

📌 **It is told to the admin at the exact moment they decide to pause**, which is why it matters more than its
size. 🚫 **Do not reword it.** **He wrote it, he owns it, and he found it himself.**

## §4 What must not change
- 🚫 The two-field body, the re-plan itself, the result panel's *"compute nothing"* rule.
- 🚫 `REQ-076`'s booking pause tray. 🚫 `REQ-082`'s expiry edit.
- 🚫 No backend change.

## Definition of Done
- [ ] Typecheck clean; **state the command**
- [ ] 🔑 **The time defaults to the COURSE'S own slot** — asserted with a `17:00` course, **because that is the
      exact case that failed**
- [ ] The date default is stated and defended in one line — **the course's weekday if you can, `today+7` if not**
- [ ] 🔑 **§2 ANSWERED IN WRITING:** does the summary dialog render, for how long, what closes it — **and if it
      does not, it is fixed here.** **This is the item the release turns on.**
- [ ] The empty PAUSE re-render is explained — **fixed, or named as cosmetic with the reason**
- [ ] @Porter's pause copy is in, **verbatim**
- [ ] 🚫 No backend change · the tray and REQ-082's edit asserted untouched

## Question
**Does the dialog have anything else that survives from the pre-re-plan design?** You corrected three false
comments last round; **this one is false COPY, in front of an admin.** 📌 *A string written for a behaviour that
has since been ruled away is the same class as a comment — and it is worse, because a user reads it.* **Sweep
this component's strings once and name anything else.**

---

## Implementation Notes (Fern, 2026-09-08)

| | |
|---|---|
| Repo | `smart-scheduler-front` · `git rev-parse --short HEAD` = **`098a1d2`** |
| Status | **REVIEW** — tsc 0 · **133/0** (+9) · build ok. 🚫 No backend change. |

### 🔴 §2 ANSWERED — **it never rendered at all. It is not a timing problem, and @Tanya's 8s capture was not the cause.**

**Does it render?** **No — not once, not briefly. Zero milliseconds.**
**What closed it?** **My own `onDone`, in the same tick as the summary was set.**

`PlanModal` passes **`onDone={onClose}`** — `onClose` is the **PLAN MODAL's** close. My TASK-287 code called
`onDone?.()` immediately beside `setResult(res)`. So:

1. `onDone()` → the plan modal closes;
2. its `useEffect` on `!opened` → `setDropMode(null)`;
3. `DropResumeDialog`'s `opened={dropMode !== null}` → **false** — unmounted in the same commit that set the
   summary state;
4. and on the way out **`mode={dropMode ?? "drop"}` fell back to the PAUSE face**, re-rendered against a `plan`
   that was already gone → ***"Pause — for — — the remaining 0 sessions come off the schedule."***

📌 **That last line is the whole of the second symptom, and it explains why the same flash followed a PAUSE:**
the drop path called `onDone?.(); onClose();` too. **One cause, both bugs**, exactly as you predicted one answer
should cover.

**The fix, both halves:**
- **`onDone` now fires in exactly one place** — a new `finish()`, called when the admin *dismisses* the dialog
  (Close button, ✕ or overlay). The act and the acknowledgement are separated, which is what *"read AFTER"*
  needed all along.
- **The dialog is mounted only while a mode is chosen** (`{dropMode && <DropResumeDialog …>}`), so there is no
  fallback face to render and nothing to flash.

⚠️ **So your answer to the owner stands — but it was not true when you gave it.** It is now.

### 🔑 §1 — the defaults, and the time is the one that mattered

`resumeDefaultTime(courseStartTime)` → the **course's own** time; `defaultResumeDate(weekday)` → the first
**course weekday** on or after `today + 7`. Both extracted to `lib/scheduler/resume-defaults.ts` so *"a 17:00
course defaults to 17:00"* is an assertion rather than a hope — the TASK-147/237 rule again.

**Where the slot comes from:** the course's **own session rows** (`plan.sessions`), not an assumption. A pause
cancels those rows but leaves their `date`/`startTime` intact, so **the slot survives the pause** — which is
precisely the state that needs it. 🚫 **Extras are excluded**: a soft-linked `SINGLE_SESSION` (SPEC-033) can sit
at any hour, and letting one seed the default would move the whole course to it.

**The date default, defended in one line as asked:** `today + 7` **landed on the course's own weekday** — the
date is a real choice (the old dates are behind us or nobody would be re-planning), so this makes *"the same
slot, a fortnight later"* one click and moving it deliberate. Falls back to plain `today + 7` when the weekday
cannot be read.

⚠️ **Seeded on OPEN, not at mount** — the plan may not have loaded when this component first mounted, and a
default that arrives after the admin is looking at the form is the same defect wearing a different hat.

### ✅ §3 — @Porter's copy, verbatim, both languages. Not reworded.

### Your Question — **the sweep found one more, and it was a comment, not a string**

`DropResumeDialog`'s own header said the course *"keeps its `size`, its slot and its history, and resume
rebuilds on that same slot"* — **false since the re-plan ruling**, and it is the component's first paragraph.
Corrected: it now says the re-plan opens *on the old slot as a default*, which is a different and weaker promise.

Also removed while I was there (you named one; there were **two**): `useScheduler.ts` carried **three stacked
comment blocks** on `useResumeCourse` — TASK-199's *"back on its own slot under a NEW expiry"* and TASK-264's
*"`expiryDate` is optional … `EXPIRY_REQUIRED`"*. **Neither described anything the code did.**
📌 `endCourse.resumeExpiry` / `resumeExpiryWhy` are already gone. **No other user-facing string in this
component survives from the pre-re-plan design** — `dropTitle`, `dropReason`, `resumeTitle`, `resumeLine`,
`resumeConfirm`, `dropDone`, `resumeDone` all still describe what happens.

### Verified

```
bunx tsc --noEmit   → exit 0
bun test            → 133 pass / 0 fail, 319 expect(), 14 files   (was 124/0 → +9)
bun run build       → ok
```
⚠️ `bun run lint` fails repo-wide (`next lint`, Next 16) — pre-existing.
🚫 REQ-076's tray and REQ-082's edit asserted untouched.

📌 **And I walked into the trap you named this morning, again.** My first §2 assertion forbade the string
`mode={dropMode ?? "drop"}` — and failed on **the comment documenting its removal**. *"A test that forbids a
STRING will always catch the explanation of why the string is absent."* It now slices the JSX. **Twice in one
day; the rule is now written at the assertion.**

### 🔴 Not verified

Auth wall — **I have still not seen any of this rendered**, including the summary I have just argued renders.
**The reasoning is from the component lifecycle and it is checkable at a screen in under a minute**, and given
this is the item the release turns on, it should be: **pause a 17:00 course, resume it, and confirm (a) the time
field says 17:00, (b) the summary appears and stays until Close, (c) no empty PAUSE flash.** The mock covers all
three ⇒ **LOCAL**.

## Review — Sober, 2026-09-08: ✅ **PASS. TASK-288 is DONE.** 🔴 **And §2's answer is the most important sentence anyone has written tonight.**

**Reproduced:** `bunx tsc --noEmit` → **0** · `bun test` → **133 pass / 0 fail** (+9) · build ok ·
`resumeDefaultTime(courseStartTime)` and `defaultResumeDate(courseWeekday)` at `:78-79`, **re-seeded on open at
`:87-88`** · `onDone` in one place. 🚫 No backend change.

### 🔴 §2 — **"it never rendered at all"**, and the cause was mine to have created
> *"Does it render? No — not once, not briefly. Zero milliseconds. What closed it? My own `onDone`, in the same
> tick as the summary was set."*

`onDone={onClose}` is the **plan modal's** close ⇒ `setResult(res)` and `onDone()` in one tick ⇒ modal closes ⇒
`setDropMode(null)` ⇒ `opened` false ⇒ **unmounted in the same commit that set the summary** — and on the way out
**`mode={dropMode ?? "drop"}` fell back to the PAUSE face against a `plan` that was already gone.**
🔑 **That last step is the whole second symptom, and it is why the same flash followed a PAUSE.** **One cause,
both bugs** — you found the single explanation rather than two fixes that each looked plausible.

🔻 **And your last line is the one that matters, so I am quoting it back rather than softening it:**
> *"So your answer to the owner stands — but it was not true when you gave it. It is now."*

**@Porter and I told the owner that reading the new dates AFTER the act was acceptable. At that moment there was
no after.** ⇒ **we defended an ordering against a screen that never existed.** 📌 **It is going to @Porter in
those words tonight** — **not as a defect report, as a correction to something we told him.**
🔑 **The structural half is the fix, not the timing:** *"the act and the acknowledgement are separated, which is
what read-AFTER needed all along"*, and the dialog is now mounted only while a mode is chosen **so there is no
fallback face to render.** **A dialog that cannot fall back cannot flash.**

### 🔑 §1 — you took the slot from the DATA, not from an assumption
**The course's own session rows**, `plan.sessions` — *"a pause cancels those rows but leaves their `date`/
`startTime` intact, so the slot survives the pause, which is precisely the state that needs it."*
✅ **And excluding a soft-linked `SINGLE_SESSION` extra is the judgement I did not ask for and would not have
thought of** — *"letting one seed the default would move the whole course to it."*
✅ **Extracted so *"a 17:00 course defaults to 17:00"* is an assertion rather than a hope**, and ⚠️ **seeded on
OPEN, not at mount** — *"a default that arrives after the admin is looking at the form is the same defect wearing
a different hat."* **That is the sharpest line in the report and it is about a bug you did not have.**

### ✅ The date default, defended as asked
`today + 7` **advanced to the course's own weekday**, falling back when the weekday cannot be read. ⇒ ***"the same
slot, a fortnight later" is one click and moving it is deliberate.*** **That is exactly the shape I asked for and
you closed the fallback too.**

### ✅ @Porter's copy is in verbatim
**Not reworded.** He wrote it, he found his own line, and it is told to the admin at the moment they decide to
pause.
