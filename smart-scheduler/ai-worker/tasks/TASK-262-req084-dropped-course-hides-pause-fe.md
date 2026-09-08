# TASK-262 — REQ-084 defect half: a `DROPPED` course must stop offering `พักคอร์ส`

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-06)
**Requirement:** `REQ-084` **AC-A / AC-B / AC-C** (the defect half only — the feature half is still open).
**`uat` batch #4.** ⚠️ **Small**, and it is the last unbuilt item in the batch.
**Status: DONE — code (Sober 09-06, reviewed) — tsc 0 / 109 pass 0 fail. Root cause → TASK-263 (BE, one field). Original note: REVIEW (Fern 2026-09-06)** — AC-A/B/C done; the root cause was a MISSING PAYLOAD FIELD, not the control, and the sweep found a second surface. Two questions.

> 🔴 **This task exists because I mis-assigned it.** I handed *"REQ-084's defect half"* to @Jason four times. **It
> is frontend work, it never had a TASK file, and his read proved the backend has nothing to do.** The delay is
> mine, not his.

---

## §1 What the defect actually is — @Jason's read, and it narrows the work

**The API has always refused this.** `dropCourse` throws `ALREADY_DROPPED` (*"คอร์สนี้พักอยู่แล้ว"*) and
`resumeCourse` throws `NOT_DROPPED` on a course that is not paused.
⇒ **The defect is that a control is offered for a call the server rejects.** Nothing is corrupted; an admin is
invited to do something and then told no. **Hiding the control is the whole fix.**

📌 **And the REQ's premise is wrong in a way worth knowing before you build:** it says *"we shipped the drop and
not the un-drop."* **`resumeCourse` exists** (`POST /courses/:id/resume`) and `git log -S` puts it in the **same
commit as the drop** (`bcb0ee6`). **What is missing is the button, not the endpoint.** @Porter is correcting the
REQ; nothing about your work changes either way.

## §2 The work
- **AC-A** — a `DROPPED` course does **not** offer `พักคอร์ส`.
- **AC-B** — a course that is **not** `DROPPED` offers it **exactly as today**. ⚠️ **This is the regression that
  matters**: every course in the product is in this state, and the paused one is the rare case.
- 🔴 **AC-C — check lists, cards AND search, not just the course-plan modal.** **A defect visible in one place has
  usually shipped in several**, and the REQ calls this out itself. **Name every surface you checked, including
  the ones that turned out to be fine** — that is what makes the sweep reviewable.

## §3 What is NOT in this task
- 🚫 **The resume button** (`ปุ่มนำคอร์สที่พักกลับมา`) — that is REQ-084's **feature** half, and it is blocked on
  an owner question @Porter is carrying. **Do not build it as a bonus.**
- 🚫 **Any backend change.** `assertCourseWritable` already guards every write path (six call sites); @Jason swept
  it. **If you find a surface where the API allows something it should not, that is a finding — report it, do not
  fix it here.**
- 🚫 REQ-071's own wording — untouched.

## Definition of Done
- [ ] Typecheck clean; state the command *(⚠️ `bun run lint` fails repo-wide — `next lint`, removed in Next 16.
      Pre-existing; do not fix it inside this task.)*
- [ ] AC-A asserted — a `DROPPED` course offers no `พักคอร์ส`, **as a rule in a pure function**, not an `&&` in JSX
- [ ] AC-B asserted — a live course is **unchanged**
- [ ] **AC-C: every surface named** — the ones you changed *and* the ones you checked and left
- [ ] 🚫 No backend change · nothing in REQ-084's feature half

## Question
**Is the pause control derived from one rule or written per surface?** If each surface decides for itself, the
sweep will find three copies — **and then the fix is one predicate, the way `canPauseBooking` went in TASK-261.**
Say which you found.

---

## Implementation Notes (Fern, 2026-09-06)

| | |
|---|---|
| Repo | `smart-scheduler-front` → the `machine.local.md` row · `git rev-parse --short HEAD` = **`4cd2645`** |
| Status | **REVIEW** — AC-A/B/C done. **The root cause was not what the task expected**, and the sweep found a second surface. |

### 🔴 Findings — the defect was the INPUT, not the control, and it explains BOTH halves of the owner's report

**`PlanModal` already had the right condition.** `courseWritable = !courseEnded && !courseDropped`, and
`พักคอร์ส` already sat inside it — since `32474d7`. **So did the resume button** (`endCourse.resume`, green,
`PlayCircle`), gated on `courseDropped`.

**Neither ever worked, because the status never arrived.** The gate read `plan.summary.status`, and
**`GET /entitlements/:id`'s course summary does not carry it.** The BE builds that summary as its own object
literal — `size · leaveUsed · leaveQuota · maxWeek · owedCount · expiryDate` — with **no `status` and no
`endedAt`** (`scheduler.service.ts:1818-1827`), unlike `toCourseSummary` (`lib/leave.ts`), which carries both.

⇒ `courseStatus` was `undefined` on **every** course ⇒ `courseDropped` **false** on every course ⇒
`courseWritable` **true** on every course. Therefore:

| The owner said | Why |
|---|---|
| *"คอร์สที่พักไว้ แต่ยังมีปุ่มพักคอร์สอยู่"* | `courseWritable` never went false — **AC-A** |
| *"ไม่มีปุ่มเอากลับไป"* | the resume button is gated on the **same** `DROPPED` that never arrived — **it has been in the code all along and rendered on nothing** |

📌 **So the REQ's premise is wrong a second time.** @Sober already corrected *"we shipped the drop and not the
un-drop"* → the **endpoint** exists. It goes further: **the button exists too.** One missing field on one
payload produced both symptoms, and the feature half may be much smaller than REQ-084 assumes — 🔴 **worth
telling @Porter before he takes the owner's two questions**, because *"where does the resume button go"* has an
answer already sitting in `PlanModal`.

### The fix

**The real fix is one line of backend** — add `status` (and `endedAt`) to the plan summary — and I have not made
it (🚫 no backend change, per §3). **See Q1: I recommend it, and the FE is already written for it.**

What I did instead, FE-only and reversible: the caller hands the status down. `CoursePackagePanel` already holds
the server's one `status` on the row the admin clicks, so `onManage(c.id, c.status)` → `BookingsContent` →
`PlanModal`'s new `courseStatus` prop. **The payload's own field is still preferred when present**
(`plan.summary.status ?? courseStatusProp`), so **the prop deletes itself the day the BE sends it** — the
comment at the call site says exactly that.
🚫 Nothing re-derives lifecycle from `endedAt` or dates. **TASK-189's rule stands**: lifecycle is the server's
one `status` field; I changed only how it reaches the modal.

### Your Question — one rule or one per surface?

**One surface offered `พักคอร์ส` — there were no copies to unify.** But the gate was a chain of `&&` in JSX, so
it is now a predicate anyway, for the same reason `canPauseBooking` is: **a rule that only lives in JSX cannot
be tested, and that is precisely how this one came to be wrong with nothing failing.**
`lib/scheduler/course-lifecycle.ts` — `canPauseCourse` · `canResumeCourse` · `isCourseWritable`.
📌 **`undefined` is an explicit case in it, not a default**, because the two possible defaults are wrong in
opposite directions: unknown-as-writable **is** this defect; unknown-as-unwritable would strip the button from
*every* course, which is AC-B and far worse. A test pins that.

### AC-C — the full sweep. Surfaces CHANGED, and surfaces CHECKED AND LEFT.

**Changed (2):**

| Surface | What was wrong |
|---|---|
| `PlanModal.tsx` | the gate above — `พักคอร์ส` on a `DROPPED` course, and resume on nothing |
| **`CoursePackagePanel.tsx` — unlock / relock** | 🔴 **the second instance, and it is the same defect.** Gated on `leaveLocked`/`adminUnlocked` alone — on the **leave** state, never on lifecycle — so a `DROPPED` or ended course still offered **ปลดล็อก**. `updateCourse` runs through `assertCourseWritable` (`scheduler.service.ts:3224`) and **refuses it** ⇒ *a control offered for a call the server rejects*, exactly AC-A's shape in a different button. Now gated on the same predicate. |

**Checked and left, with the reason each was fine:**

| Surface | Why nothing to do |
|---|---|
| `CoursePackagePanel` — cards / **list / search / status filter** | one component renders all four; the only course actions are Manage, History and unlock/relock. Manage + History are **reads**; unlock/relock is the row above. **No `พักคอร์ส` anywhere on the card.** |
| `CourseHistoryModal` | read-only |
| `EndCourseDialog` · `DropResumeDialog` | opened *from* `PlanModal`, behind the gate that is now correct — not independent entry points |
| `BookingsTable` (the "all" tab) | acts on **bookings**, not courses; no course lifecycle action |
| `VoucherPanel` | vouchers have no course lifecycle — the `onManage` there passes no status by design |
| `CreateCourseModal` · `CreatePlanFlow` | create mode; `isCreate` already excludes every one of these controls |
| Calendar `BookingModal` | bookings; course sessions are cancelled from the plan (TASK-105), not here |
| People screen | no course actions at all |

🚫 **`grep -rn "dropCourse\|endCourse.drop\|DropResume"` returns exactly the sites above** — there is no third
place offering the control.

### Verified

```
bunx tsc --noEmit   → exit 0
bun test            → 109 pass / 0 fail, 239 expect(), 12 files   (was 99/0 across 11 → +10)
bun run build       → ok
```
⚠️ `bun run lint` still fails repo-wide (`next lint`, removed in Next 16) — pre-existing, untouched per §DoD.

**The 10 assertions** (`lib/scheduler/course-lifecycle.test.ts`): AC-A (paused offers no pause; offers resume) ·
**AC-B** (ACTIVE unchanged; COMPLETED/EXPIRED/CANCELLED offer neither; **every** status in `COURSE_STATUSES`
covered, so a new one cannot land unconsidered) · the unknown-status case · **AC-C** (the card's unlock/relock
is gated on lifecycle) · and 🔴 **the wiring**, which is the block that matters: *a predicate is only as good as
what is fed to it.* The old code's condition was correct and still broken, so a unit test of the predicate alone
**would have passed on the broken build** — these assert that `PlanModal` is actually *given* the status.

## Questions — FE

**Q1 (recommended, small, and it deletes code): add `status` — and `endedAt` — to the entitlement plan's course
summary.** The FE type has declared `status?: CourseStatus` all along and `PlanModal` has read it all along;
only the BE literal omits it. One field, and the `courseStatus` prop plus its whole hand-down path
(`CoursePackagePanel` → `BookingsContent` → `PlanModal`) can be deleted. **I did not do it — §3 says no backend
change — but leaving the payload permanently silent about lifecycle is how the next screen repeats this.**

**Q2 (for @Porter, via you): REQ-084's feature half may be nearly done already.** The resume button exists in
`PlanModal` and the endpoint exists; both were invisible for the same reason. **His two open questions (does
resume move the expiry · is there a list to resume from) are still real and still his** — but *"build the
button"* is not the work it looks like, and he should know that before he ranks it.


## Review — Sober, 2026-09-06: ✅ **PASS. TASK-262 is DONE (code).** You found the root cause, and it is not what the task said.

**Reproduced:** `bunx tsc --noEmit` → **0** · `bun test` → **109 pass / 0 fail** (12 files, 239 expects).

### 🔴 The defect was the INPUT, not the control — and it explains BOTH of the owner's complaints
`PlanModal`'s condition was **already right**, and the resume button **already existed**. Neither worked because
`GET /entitlements/:id`'s summary is its own literal with **no `status` and no `endedAt`** — so `courseStatus` was
`undefined` on **every** course, `courseDropped` false on every course, `courseWritable` true on every course.

| The owner said | Why |
|---|---|
| *"คอร์สที่พักไว้ แต่ยังมีปุ่มพักคอร์สอยู่"* | the gate never went false |
| *"ไม่มีปุ่มเอากลับไป"* | the resume button is gated on **the same** missing status — **it has been there all along, rendering on nothing** |

📌 **One missing field produced both symptoms.** ⇒ **TASK-263 → @Jason**, the one-line backend fix you recommended
and did not take. **Your workaround is the right shape meanwhile:** the payload is preferred when present
(`plan.summary.status ?? courseStatusProp`), so **your prop deletes itself the day his lands** — and you said so at
the call site rather than leaving it to be discovered.

### 🔴 REQ-084's premise is now wrong for the third time, and the third is yours
@Jason: **the endpoint exists** (`resumeCourse`, same commit as the drop). **You: the button exists too.**
⇒ *"we shipped the drop and not the un-drop"* is false at every layer, and **the feature half may be nearly
done.** ✅ **Correctly routed as Q2 rather than acted on** — @Porter's two owner questions stay real, but
*"build the button"* is not the work it looks like, and **he should know that before he ranks it.**

### ✅ AC-C found a second surface — this is exactly why AC-C is written that way
`CoursePackagePanel`'s **unlock / relock** was gated on `leaveLocked`/`adminUnlocked` alone — **on the leave state,
never on lifecycle** — so a `DROPPED` course still offered **ปลดล็อก**, which `assertCourseWritable` refuses.
**A control offered for a call the server rejects: AC-A's shape wearing a different button.**
✅ **And the surfaces you checked and LEFT are named with the reason each was fine** — eight of them, plus a grep
proving there is no third. **That is what makes a sweep reviewable rather than a claim.**

### ✅ The predicate, and the `undefined` case done right
One surface offered it, so there were no copies to unify — **and you made it a predicate anyway**, for the reason
that matters: *"a rule that only lives in JSX cannot be tested, and that is precisely how this one came to be
wrong with nothing failing."*
🔴 **`undefined` as an explicit case, not a default**, is the sharpest decision in the task: **unknown-as-writable
IS this defect; unknown-as-unwritable would strip the button from every course** — AC-B, and far worse. **Both
defaults are wrong in opposite directions, so neither is a default.** Pinned by a test.

### ✅ And the test block that would have caught the original
> *"A unit test of the predicate alone would have passed on the broken build."*

**The old condition was correct and still broken**, so you asserted that `PlanModal` is actually **given** the
status. 📌 **A predicate is only as good as what is fed to it** — and this whole defect lived in the gap between a
right rule and a wrong input. **Testing the wiring is what closes it.**

**Status → DONE (code).** ⇒ **The `uat` batch's code is complete.**
