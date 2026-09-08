**Status:** DONE — code (Sober 09-08, reviewed) — tsc 0 / 148 pass 0 fail / build ok / no backend change. The count is the server s. 🔻 She corrected me TWICE: there ARE two live-status copies on the FE (one 28 lines above the defect — I grepped for a NAME when the risk was a VALUE), and the modal was NEVER unscrollable (Mantine caps it) ⇒ the unseen summary dialog is a HARNESS problem, not ours. Follow-up: TASK-292.

# TASK-291 — the pause dialog says **9** and the pause will cancel **4** — and the summary dialog has still never been seen

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-08)
**Cause:** @Tanya's second UI round — **both her checks PASSED**, and these are what she found beside them.
⛔ **`uat` waits.** 🚫 No backend change *(the route already exists — §1)*.

---

## §1 🔴 The count is not "rows the admin cannot see" — it is WRONG ABOUT WHAT THE PAUSE WILL DO

**@Porter reported it as *"the count counts rows the admin cannot see"*. It is worse than that. I checked both
sides:**

| | |
|---|---|
| **The dialog** | `remaining={liveSessions.length}` (`PlanModal.tsx:569`), and `liveSessions = sessions.filter(x => x.status !== "SICK_LEAVE")` (`:185`) |
| **The server** | `endableSessions` = `COURSE_LIVE` = **`PENDING · CONFIRMED · EXTENDED`** (`course-plan.ts:277`) |

Her course: 3 `PENDING` · 1 hand-`CANCELLED` · 4 pause-`CANCELLED` · 1 `EXTENDED`.
⇒ **the dialog says 9. The pause will cancel 4.** 🔴 **The number is not merely inconsistent with the list below
it — it is inconsistent with the ACT**, by more than double, **in the sentence the admin acts on.**
📌 **An EXCLUSION list (`!== SICK_LEAVE`) where the server uses an INCLUSION list (`COURSE_LIVE`)**: the two
agreed while every row was live, and diverged the moment anything was cancelled.

### The fix — ask the server. 🚫 Do NOT add a status list to the client.
✅ **`POST /courses/:id/cancel/preview` already exists and is routed** (`api.ts:99`) → `previewCourseEnd` →
**`removedSessions: endableSessions(rows).length`** — **the exact number, from the function that will do the
work.**
🔑 **Pause and end cancel the same set**, so this is not a coincidence to be exploited: it is the same question.
⚠️ **The route is NAMED for cancel.** **Say so at the call site** — the name is under-descriptive now, and
renaming a route is a contract change I am not making tonight.
🚫 **The alternative — filtering on three statuses in the FE — would create the FIRST copy of `COURSE_LIVE` on
the client.** **There is none today; I checked.** **We are not starting one at 06:00.**
⚠️ **The dialog's own comment says *"there is no `/drop/preview` on the server. Rather than invent a count, the
pause sentence uses the same facts the plan already has."*** **The intent was right and the fact was wrong** —
and there IS a preview. **Correct that comment too.**

## §2 🔴 The summary dialog has STILL never been seen — and it carries the owner's answer
@Tanya: **NOT_TESTED, twice** — a session expiry, then the primary button at `y=533` in an **800×450** pane that
**would not scroll**, and a `1280×900` emulation that rendered a zoomed fragment.
🔻 **Her line, and I am adopting it: *"this line is not evidence that it does."*** **My review says the dialog
exists. Nobody has looked at it.**

**She and @Porter both declined to file the 450px viewport, and they are right that 450px is not a real admin
screen. I am still asking for the modal to SCROLL, and the reason is not the viewport:**
🔑 **We cannot otherwise SEE the thing the owner's answer depends on.** ⇒ **a dialog whose primary action can be
unreachable is a dialog that cannot be verified**, and this one **grew** when the summary panel was added.
✅ **Make the modal body scroll so the action is always reachable.** *(Mantine gives this; do not restructure the
dialog.)*
📌 **And @Porter's second observation is the real finding: your four viewport checks are ALL WIDTHS. Heights have
never been checked, by anyone, on any dialog.** ⇒ **add a height to your standing check.** **That is a gap in the
method, not a bug in this component**, and it is worth more than tonight.

## §3 ⚪ Recorded, not tasks
- **The Time field's underlying value is `10:00:00`** — **seconds, in the same week as DEF-3.** **Displays as
  `10:00` ⇒ harmless as seen.** **Do not chase it here**; noted so the next person meets it as a known thing.
- ✅ **@Porter's replaced pause copy verified verbatim on `sid`** — *"the time and the expiry date can move."*
  **He asked me to tell you it reads true.**

## §4 What must not change
- 🚫 `visiblePlanRows` and the filtered table — **CHECK 2 passed and depends on it.**
- 🚫 `sessions`, `courseSlot`, the resume defaults — **TASK-289's whole point was that these read the full plan.**
- 🚫 The re-plan, the two-field body, the derived expiry. 🚫 No backend change.

## Definition of Done
- [ ] Typecheck clean; **state the command**
- [ ] 🔑 **The pause sentence's number comes from the SERVER** — asserted, **and asserted that no status list
      was added to the client**
- [ ] **@Tanya's exact shape:** 3 `PENDING` · 1 hand-`CANCELLED` · 4 pause-`CANCELLED` · 1 `EXTENDED` ⇒ the
      dialog says **4**
- [ ] The stale *"there is no `/drop/preview`"* comment is corrected
- [ ] 🔑 **The modal scrolls; the primary action is reachable at 450px height** — asserted
- [ ] **A height is added to your standing viewport checks** — say which
- [ ] 🚫 `visiblePlanRows`, `courseSlot` and the resume defaults untouched · no backend change

## Question
**Is the pause count the only number in that dialog with its own derivation?** 📌 *The `Ends` date, the session
list and the expiry sentence all read the plan too.* **Name any other figure the dialog computes rather than
reads** — **that is the same defect waiting, and this time I would rather find it than be shown it.**

---

## §5 ✅ IMPLEMENTED — Fern, 2026-09-08. **The count is the server's. Plus two corrections to the task, one of which changes an argument.**

**Verified:** `bunx tsc --noEmit` → **exit 0** · `bun test` → **148 pass / 0 fail** (was 140 — **+8**) ·
`bun run build` ok. 🚫 No backend change.

### §1 — the number
`DropResumeDialog` asks **`POST /courses/:id/cancel/preview`** on every open of the pause face and renders
`removedSessions`. **The `remaining` prop is deleted from both sides** — a count cannot be handed in again
without the sweep below failing.
🚫 **No fallback.** Until the server answers there is a loader and no sentence; a `?? 0` would put a
client-invented number in the sentence this task exists to make true. **And the confirm button is disabled until
the count arrives** — the admin is agreeing to a number, so there has to be one and it must not be ours.
✅ **Verified the premise at source rather than taking it:** `dropCourse` cancels `endableSessions(rows)` and
`previewCourseEnd` counts `endableSessions(rows)` — **the same function, not two lists that agree.** Said at the
call site, along with why a route named `/cancel/preview` is the right one to call from a pause.

### 🔴 §1 correction — **"there is no copy of the live-status list on the front end today" is not true. There are TWO.**
Both predate this task, neither is a count, neither is in the pause path — and I would not have found them if I
had only followed the instruction:

| | |
|---|---|
| `PlanModal.tsx:78` | `isLiveStatus` — `s === "PENDING"` / `"CONFIRMED"` / `"EXTENDED"`, **28 lines above the defect**, deciding whether a row offers a plain cancel |
| `BookingModal.tsx:95` | `MOVABLE_STATUSES: ["PENDING", "CONFIRMED", "EXTENDED"]` — UC-003, whether a booking can be dragged |

📌 **Your instruction was right and its reason was stronger than you stated it: we were refusing to add a
THIRD.** ⇒ I asserted it as a **pinned sweep** — every `.ts/.tsx` under `src/` is scanned for the triple and the
result must equal exactly those two files by name. **A third fails the test and the failure says where.**
⚠️ **This is TASK-286's problem in the wild** — nothing makes a hand-written triple follow the server's
`COURSE_LIVE_STATUSES` when that changes. **Not fixed here** (three different questions, three call sites, and
none of them tonight's defect); **named, and now watched.**

### §2 — the modal scrolls
`scrollAreaComponent={ScrollArea.Autosize}`, asserted.
⚠️ **But a correction worth more than the prop: Mantine v9 already caps `.mantine-Modal-content` at
`calc(100dvh - 2 × 5dvh)` with `overflow-y: auto`** (`@mantine/core/styles.css:4895`). **This dialog was never
unscrollable.** ⇒ **what @Tanya hit was almost certainly the harness** — she reported the `1280×900` emulation
rendering a *zoomed fragment*, which is a pane smaller than the viewport it was emulating, not a modal without a
scrollbar. **The check she could not complete is still not done, and the prop does not do it.**
✅ The prop stays anyway: it makes the body its own scroll region and states the intent where the next person
edits the dialog. 🚫 Nothing restructured.

### §2 — the height, added to the standing check
**Added to the board's STANDING RULE:** heights **900 / 650**, and **the primary action must stay reachable at
450** — 650 because a 1366×768 laptop leaves roughly that after browser chrome and it is the commonest real
admin screen; 450 because it is the harness height that exposed this, and a floor that only holds on real
screens is not a floor.

### 🧹 The stale comments — there were THREE, not one
1. `DropResumeDialog`'s header — *"there is no `/drop/preview`… so the pause sentence uses the number on screen"*.
2. `PlanModal`'s comment above the call site — the same claim, second copy.
3. **`scheduler.service.ts:963`** — the same claim **and** *"`resume` rebuilds on that same slot"*, **false since
   TASK-287**, and **the very sentence TASK-288 corrected in the component header last night.** It survived one
   directory away. 📌 **A comment that outlives its mechanism cannot go red** — so the sweep is now a test: no
   file may still claim the count cannot be asked for.

⚠️ All three were **true about the route and wrong about the fact**, which is worse than a plain error: it made
the defect look deliberate.

### 📌 The string trap — fixed for the class this time, not for the instance
Three times now a test of mine has forbidden a STRING and failed on the comment explaining that string's
absence. Slicing fixed each instance. **These files now discuss `PENDING · CONFIRMED · EXTENDED` at length**, so
slicing would not have been enough — the tests **strip comments before asserting** (`codeOf`). **That is the fix
for the class, and it is what makes the status sweep possible at all.**

### Definition of Done
- [x] **Typecheck clean** — `bunx tsc --noEmit`, exit 0
- [x] 🔑 **The number comes from the SERVER** — asserted (`usePreviewEndCourse`, `n: pausePreview.removedSessions`,
      no `remaining` on either side, no `??` fallback) **and no status list was added** — asserted by the pinned
      two-file sweep above
- [~] **@Tanya's shape ⇒ 4** — ⚠️ **honest state:** the FE no longer computes this, so it cannot assert it. **Each
      component of her shape is asserted where it IS computed** (`course-end.test.ts`: `CANCELLED` never in the
      set, `EXTENDED` always in it ⇒ her 3 `PENDING` + 1 `EXTENDED` = 4, her 5 cancelled excluded). **The
      composite is not asserted anywhere, and it is hers to see.**
- [x] The stale comment corrected — **all three of them**
- [x] 🔑 **The modal scrolls** — `scrollAreaComponent` asserted. ⚠️ **"Reachable at 450px" is NOT asserted and
      cannot be from here** — see the correction above; it needs an eye
- [x] **A height added to the standing checks** — **900 / 650, floor 450**
- [x] 🚫 `visiblePlanRows`, `courseSlot`, the resume defaults, the re-plan body — untouched · no backend change

## Question — **name any other figure the dialog computes rather than reads**

**Two that matter, and the first is in the same sentence I just fixed.**

| Figure | Where | Verdict |
|---|---|---|
| 🔴 **`program`** | `PlanModal:567` — `plan.sessions[0]?.subject?.name` | **Same class, same sentence.** `sessions[0]` is an ARBITRARY row: a soft-linked `SINGLE_SESSION` extra sorts into the plan and carries its own subject — **exactly the case `courseSlot` excludes for the resume default, one line below.** ✅ **And the preview response already carries `program` and `student`**, so this costs nothing whenever you want it. 🚫 **Not done — outside the DoD, and it changes what staff read.** |
| 🟡 **`student`** | `PlanModal:568` | Same shape, lower risk (one student per plan). |
| 🟡 **the create-mode preview line** | `PlanModal:198` — `plan.liveEndDate ?? liveSessions[last].date` | An **OR-fallback that computes an end date when the server didn't send one**. Create mode only, where every row is live by construction ⇒ not tonight's defect, but the same silent-substitute shape. |
| 🔴 **`pendingCount`** | `PlanModal:247` → `t("plan.confirmCourse", { n })` | **The closest sibling: a CLIENT count on the button of a BULK ACT.** The `skips` panel exists precisely because the server confirms fewer than the button offered — ⇒ **the divergence is already known and is handled AFTER the act instead of before it.** **This is the same defect waiting, and it is the one I would take next.** |
| ✅ **`Ends`, the leave/owed/size figures** | `SummaryBar` | **Clean** — every one reads `plan.summary.*` / `plan.liveEndDate`. |
| ✅ **the re-plan summary, the expiry sentence** | `DropResumeDialog`, `ExpiryWarningAlert` | **Clean** — the server's response, rendered. `ExpiryWarningAlert:39`'s `outsideCount - listed.length` is arithmetic over the server's own two fields, not a re-count. |
| ✅ **`preview.moves.*.length`** | `PlanModal:1185` | **Clean** — counting the server's own arrays is reading. |

## Review — Sober, 2026-09-08: ✅ **PASS. TASK-291 is DONE.** 🔻 **You corrected me TWICE and both corrections dismantle a premise I stated as checked.**

**Reproduced:** `bunx tsc --noEmit` → **0** · `bun test` → **148 pass / 0 fail** (+8) · build ok ·
`n: pausePreview.removedSessions` (`DropResumeDialog:222`) — **the count is the server's** · `remaining` gone
from both sides. 🚫 No backend change.

### 🔻 1. *"There is no copy of the live-status list on the front end today; I checked."* **There are TWO.**
`isLiveStatus` at **`PlanModal.tsx:78`** — **twenty-eight lines above the defect** — and the movable triple in the
booking modal. **I verified `:78` myself just now.**
🔴 **And the way I was wrong is the week's own lesson, one more time: I grepped for a NAME (`COURSE_LIVE`,
`LIVE_STATUSES`) when the risk was a VALUE.** ⇒ **the thing I was looking for does not wear that name.** **Same
shape as `t()` being the wrong net, and as my `grep -c` on a bare identifier.** **I asserted the result as
checked, and "checked" is what made it dangerous.**
✅ **Your framing is right and I am not softening it into agreement:** *"your instruction was right and its
reason was stronger than you stated it — we were refusing to add a THIRD."*
🔑 **And you made it a PINNED SWEEP rather than a fact:** every `.ts/.tsx` scanned for the triple, the result
must equal exactly those two files **by name**, and a third fails **saying where.** ⇒ **the claim I could not
make correctly is now something no one has to make.**

### 🔻 2. *"A dialog whose primary action can be unreachable cannot be verified."* **The dialog was never unreachable.**
> *"Mantine v9 already caps `.mantine-Modal-content` at `calc(100dvh − 2 × 5dvh)` with `overflow-y: auto`. This
> dialog was never unscrollable. What @Tanya hit was almost certainly the harness — a `1280×900` emulation
> rendering a zoomed FRAGMENT is a pane smaller than the viewport it was emulating, not a modal without a
> scrollbar."*

🔴 **My §2 argument rested on a premise I did not check, in a framework file I could have opened.** ✅ **And you
kept the prop anyway for intent while saying plainly that it does not do the verification** — *"the check she
could not complete is still not done, and the prop does not do it."* **Refusing to let a change look like an
answer is worth more than the change.**

### 🔑 The height rule is the durable part
**900 / 650, floor 450** — *"650 because a 1366×768 laptop leaves roughly that after browser chrome and it is
the commonest real admin screen; 450 because it is the harness height that exposed this, and a floor that only
holds on real screens is not a floor."* **Both numbers argued, neither picked.** ✅ **On the board's standing
rule, so it outlives this release.**

### 🧹 THREE stale comments — and the third is the one that matters
`scheduler.service.ts:963` carried **the same false claim AND *"resume rebuilds on that same slot"*, false since
TASK-287 — the very sentence TASK-288 corrected in the component header last night. It survived one directory
away.**
🔑 **Which is exactly why you made it a TEST:** *"a comment that outlives its mechanism cannot go red"* ⇒ **no
file may still claim the count cannot be asked for.** **That converts the one member of this family that is
invisible by construction into one that fails.** 📌 **And *"true about the route and wrong about the fact"* names
why it was worse than a plain error: it made the defect look deliberate.**

### 🔑 The string trap — fixed for the CLASS
**Fourth encounter, and slicing would no longer have been enough because these files now discuss
`PENDING · CONFIRMED · EXTENDED` at length.** ⇒ **the tests strip comments before asserting (`codeOf`)** — **and
that is what makes the status sweep possible at all.** **You did not fix the instance; you removed the way it
recurs.**

### ✅ The `[~]` is the right mark, and I want it on the record
> *"The FE no longer computes this, so it cannot assert it. Each component of her shape is asserted where it IS
> computed. The composite is not asserted anywhere, and it is hers to see."*

**A half-tick with the reason beats a tick that is not true.** 📌 **And it is the correct consequence of the fix:
moving a number to the server moves its assertion there too.**

### 🔴 Your Question answer — `pendingCount` is the one I would have missed
> *"A CLIENT count on the button of a BULK ACT. The `skips` panel exists precisely because the server confirms
> fewer than the button offered ⇒ the divergence is already KNOWN and is handled AFTER the act instead of before
> it."*

**That is the same defect as tonight's, already shipped, already visible, and already worked around.** ⇒ **cut as
TASK-292 with `program`** — 🚫 **not tonight**, both are outside the DoD and `program` changes what staff read.
✅ **And `program` from `sessions[0]` being *"exactly the case `courseSlot` excludes one line below"* is the
detail that makes it real** rather than theoretical.
