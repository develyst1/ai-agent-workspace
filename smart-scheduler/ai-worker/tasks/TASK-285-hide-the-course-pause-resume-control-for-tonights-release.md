**Status:** DONE — code (Sober 09-08, reviewed) — tsc 0 / 131 pass 0 fail / build ok / no backend change. REVERT LINE: PlanModal.tsx:79, read by BOTH faces so it cannot come back by halves. She gated the BUTTONS, not courseDropped — gating there would have made a paused course say "this course has ended".

# TASK-285 — hide the COURSE pause/resume control so tonight's release can ship without DEF-2

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-08)
⏱️ **TONIGHT — this is what lets the rest of the release go.** 🚫 **No backend change.**
**Status: REVIEW (Fern 2026-09-08) — READY.** Both halves off from ONE flag · **revert line: `PlanModal.tsx:79`** · booking tray asserted untouched · tsc 0 · 131/0 · build ok.
**Cause:** DEF-2 — **resume RELOCATES a course into the wrong week** (a November course came back as September,
and its sessions are on this week's calendar). **TASK-282 fixes it; this hides the door until it does.**

---

## §1 🔴 HIDE BOTH HALVES. Hiding only the resume is worse than shipping the defect.
**`พักคอร์ส` (course pause) AND its resume.** Both open `DropResumeDialog` (`isDrop` picks the face); the gate is
`PlanModal.tsx:198`, `courseDropped = canResumeCourse(courseStatus)`.
🔴 **If you hide only the resume, an admin can still PAUSE a course and then cannot bring it back.** ⇒ **a
stranded course with no control that touches it** — worse than the defect, and unreachable without us.
⇒ **One gate, both entry points, off together.**

## §2 What this must NOT be
- 🚫 **Not a backend change.** `resumeCourse` and `dropCourse` stay exactly as they are — **TASK-282 is fixing
  that code and two people editing it tonight is its own accident.** The route stays live; **nothing calls it.**
- 🚫 **Not a deletion.** A flag/const or a single gate, **one line to put back**, because it goes back the moment
  TASK-282 lands.
- 🚫 **Not the BOOKING pause tray** (`REQ-076`). **Different feature, different function, tested, passed, and it
  is one of the things shipping tonight.** ⚠️ **Read this twice — the two features share a word and nothing else.**
- 🚫 Not `canPauseCourse`'s REQ-084 guard — see §3.

## §3 REQ-084's defect half RIDES, dormant
Your guard that stops `พักคอร์ส` being offered on an already-paused course **stays in the build.** It is a guard
on a control that is now hidden ⇒ **it changes nothing visible**, and **taking it back out tonight would be a
second edit to the same components on deploy night.** **Ship it asleep.**

## §4 🔴 The re-enable is TASK-282's job, and that is written down here so it is not a note
**A disabled feature with nobody's name on turning it back on is exactly the shape this project keeps paying
for.** ⇒ **TASK-282's Definition of Done carries "re-enable the control (TASK-285) and verify pause→resume keeps
the course's own dates."** 📌 **If you see this task closed and the control still hidden a week from now, that is
a defect and it is mine.**

## Definition of Done
- [ ] Typecheck clean; **state the command** *(⚠️ `bun run lint` fails repo-wide — `next lint`, Next 16.
      Pre-existing, not yours.)*
- [ ] **Neither `พักคอร์ส` nor its resume is reachable** from any course — asserted, **both**, not one
- [ ] 🔑 **The BOOKING pause tray and its resume are UNTOUCHED** — asserted explicitly, because the two features
      share a word and this is the one thing that must not break tonight
- [ ] **`REQ-082`'s expiry control and its warning still work** — asserted; they do not go through this dialog
- [ ] **One line to revert** — say which line, in your report, so TASK-282 does not have to look for it
- [ ] 🚫 No backend change, no deletion of the dialog or the guard

## Question
**Is `DropResumeDialog` reachable from anywhere other than `PlanModal`?** I checked the backend side and the
route has one caller; **the screen side is yours.** **If there is a second entry point, it must be gated by the
same flag** — a hidden button with a live second door is the failure this task exists to prevent.

---

## Implementation Notes (Fern, 2026-09-08)

| | |
|---|---|
| Repo | `smart-scheduler-front` → the `machine.local.md` row · `git rev-parse --short HEAD` = **`dbf21fc`** (3 ahead of `develop`, 0 behind) |
| Status | **REVIEW — ready for tonight.** tsc 0 · **131/0** · build ok. 🚫 No backend change, nothing deleted. |

### 🔑 THE REVERT LINE — `PlanModal.tsx:79`

```ts
const COURSE_PAUSE_RESUME_ENABLED = false;   // ← TASK-282: set to `true`
```

**That is the whole re-enable.** One line, one file, no other edit. Both faces read it, so they come back
together and cannot come back by halves.

### §1 — both halves, from one flag

| Site | What it is |
|---|---|
| `PlanModal.tsx` ~`:406` | **`พักคอร์ส`** (`endCourse.drop`) — the pause |
| `PlanModal.tsx` ~`:334` | **the resume** (`endCourse.resume`) — the other face of the same dialog |

Both are now `{COURSE_PAUSE_RESUME_ENABLED && …}`. A test asserts there are **exactly two** gates, because the
failure this task exists to prevent is hiding one of them: **an admin pauses a course, and then there is no
control that touches it** — stranded, and unreachable without us.

### ⚠️ The gate is on the BUTTONS, deliberately NOT on `courseDropped`

Gating the flag itself would have been shorter and **wrong**: `courseEnded = !courseWritable && !courseDropped`,
so a paused course would compute as **ended** and the screen would say *"this course has ended"* — a different
and false claim, on a course that is merely on hold. The *"a paused course takes no writes"* sentence still
shows; **only the way back is withdrawn.** Asserted (`courseDropped` is still `canResumeCourse(courseStatus)`).

### §2/§3 — what was NOT done

- 🚫 **No backend change.** `resumeCourse` / `dropCourse` untouched — @Jason is in that file for TASK-282.
  **The routes stay live; nothing on the screen calls them.**
- 🚫 **Nothing deleted.** `DropResumeDialog` is still imported and still mounted; only its two doors are shut.
- ✅ **REQ-084's guard rides dormant**, as instructed — it guards a control that is now hidden, so it changes
  nothing visible, and removing it tonight would be a second edit to these components on deploy night.

### 🔑 The BOOKING pause tray (REQ-076) — asserted untouched, because it ships tonight

I read §2's warning twice, and then made it a test rather than a promise:
- `canPauseBooking` / `canResumeBooking` still return `true` for their cases — **a different predicate in a
  different file** (`lib/scheduler/pause-booking.ts`) from `course-lifecycle.ts`;
- **none** of `PausedTray.tsx`, `CalendarContent.tsx`, the calendar `BookingModal.tsx` or `pause-booking.ts`
  contains `COURSE_PAUSE_RESUME_ENABLED`;
- the tray is still mounted and both booking controls still render.

**REQ-082's expiry control is likewise asserted unaffected** — it never went through this dialog, and
`CoursePackagePanel` does not mention the flag.

### Answer to your Question — **one entry point, no second door**

`grep -rn "DropResumeDialog|setDropMode|dropMode" src/` → **`PlanModal.tsx` only.** The component is imported
once, mounted once, and `dropMode` is set from exactly the two buttons above (`:334` resume, `:406` pause).
**There is no other screen that opens it**, so the two gates are the complete set.

### Verified

```
bunx tsc --noEmit   → exit 0
bun test            → 131 pass / 0 fail, 287 expect(), 14 files   (was 120/0 across 13 → +11)
bun run build       → ok
```
⚠️ `bun run lint` fails repo-wide (`next lint`, removed in Next 16) — pre-existing, not mine, not touched.

📌 **`lib/scheduler/course-pause-disabled.test.ts` is temporary and says so at the top: it dies with the flag.**
It exists because "the button is hidden" is an **absence**, and an absence cannot be asserted by calling
something — the same shape TASK-261 used for AC-8.

### 🔴 Not verified — nothing was seen rendered

Auth wall as always (no password from me). **What I could not check:** that a course's plan modal now shows
neither control, and that the booking tray still looks right beside it. Both are **LOCAL** checks — no `sid`
needed — and if anyone is at a screen tonight, the second one is the one worth thirty seconds, because it is
the feature that must not break.

## Review — Sober, 2026-09-08: ✅ **PASS. TASK-285 is DONE. The release can ship.** 🔑 **And you caught a false claim my task would have shipped.**

**Reproduced:** `bunx tsc --noEmit` → **0** · `bun test` → **131 pass / 0 fail**, 14 files ·
`COURSE_PAUSE_RESUME_ENABLED` at **`PlanModal.tsx:79`** with **exactly two gates** (`:352`, `:408`) ·
**the flag appears in TWO files only** — `PlanModal.tsx` and your temporary test · **`PausedTray.tsx` and
`pause-booking.ts` contain zero occurrences.** 🚫 No backend change.

### 🔑 Gating the BUTTONS instead of `courseDropped` — you prevented a false claim I did not see
> *"`courseEnded = !courseWritable && !courseDropped`, so a paused course would compute as **ended** and the
> screen would say 'this course has ended' — a different and false claim, on a course that is merely on hold."*

**That is the best thing in the task and it is not in the task.** My §1 named the gate at `:198` and **the
shorter version of what I asked for would have told an admin something untrue about a real course.** ⇒ **you read
what the flag was wired into rather than where I pointed.** ✅ **And the *"a paused course takes no writes"*
sentence still shows — only the way back is withdrawn**, which is the honest state.

### 🔑 One flag, both faces — better than the "one line to revert" I asked for
> *"Both faces read it, so they come back together and cannot come back by halves."*

**I asked for one line to revert. You made it one line that CANNOT be half-reverted** — which is the actual risk
§1 was written about, closed structurally instead of by instruction. ✅ **And a test asserts there are exactly
TWO gates**, so hiding one of them fails here.

### ✅ You made the tray claim a TEST rather than a promise, after being told to read it twice
`canPauseBooking` / `canResumeBooking` still true · **none of `PausedTray` · `CalendarContent` · the calendar
`BookingModal` · `pause-booking.ts` mentions the flag** · the tray still mounted, both controls still render.
📌 **That is the one thing tonight that must not break, and it is now asserted rather than believed.** **I
checked it myself and it holds.**

### ✅ The temporary test says it is temporary
> *"`course-pause-disabled.test.ts` is temporary and says so at the top: it dies with the flag."*

**An absence cannot be asserted by calling something** — the same shape as TASK-261's AC-8 — **and a temporary
test that does not announce its own expiry is how a flag becomes permanent.** **Naming it in the file is the
control.**

### ✅ And you said what you could NOT verify, and which check is worth thirty seconds
> *"Both are LOCAL checks — no `sid` needed — and if anyone is at a screen tonight, the second one is the one
> worth thirty seconds, because it is the feature that must not break."*

🔑 **Naming the priority inside the limitation is what makes a limitation useful.** **I have passed exactly that
to @Porter for the deploy: the booking tray, thirty seconds, before the release goes.**

### The answer — one entry point, no second door
`DropResumeDialog` imported once, mounted once, `dropMode` set from the two gated buttons only. **The two gates
are the complete set**, which is what the Question was for.

📌 **The re-enable is `PlanModal.tsx:79`, and it is written into TASK-282's Definition of Done — not remembered.**
