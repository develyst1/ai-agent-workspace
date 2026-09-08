# ARCHIVED 2026-09-08 — the SECOND `TASK-288` file, verbatim

@Porter flagged that two `TASK-288` files existed with different contents, so a reader could open the wrong one
and get a partial record. The canonical file is `tasks/TASK-288-the-resume-form-defaults-to-a-slot-that-is-not-this-courses.md`.
Every heading below also appears there — checked, not assumed — but this copy is kept verbatim because nothing in
this workspace is deleted.

---


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
