# REQ-064: 🔴 คอร์สที่นำเข้าแบบ "เรียนไปแล้วบางส่วน" — ลาครั้งเดียวแล้วระบบแถมคาบให้ฟรี 5 คาบ
- Status: READY_FOR_SA
- Priority: 🔴 **HIGHEST — this is live on the customer's system and it gives away lessons**
- Requested: 2026-08-22 by stakeholder (owner), from his own testing on `sid`
- Source: owner, 2026-08-22 — three observations on the **"Already in progress"** (import) course flow

## Why this is urgent, in one line
**`uat` holds 17 courses and 16 of them are `source = IMPORT`.** Every one of those is a real family. **The first
time any of them takes a single leave, the system appends several extra sessions the family never bought.**

## The three symptoms the owner reported
1. **The course is described by what is LEFT, not by what was BOUGHT.** A 10-session course with 4 already taught
   shows as a **"6-session course"**, ring **0/6** — and, worse, its **leave quota follows the same wrong number**:
   the card reads `Used 0/2`, which is the quota for a **6**-session course (`4→1 · 6→2 · 10→3`). A family who
   bought a 10-session course is being given **2 leaves instead of 3**.
2. 🔴 **One leave creates FIVE extended sessions.** Owner: *"กดลาครั้งเดียว มันจะสร้าง extended มา 5 ครั้งเฉยเลย"* —
   his own read was right: **1 for the leave he took, plus 4 more for the sessions that were already taught before
   the import.**
3. **The plan modal reports the course as `10` with `4` owed** — the system believes it still owes four sessions
   that were taught before we ever knew about this family.

**They are one defect with three faces**, and #3 is the one that explains the other two.

## Root cause — grounded in the code, not inferred from the screen
`importCoursePackage` (`scheduler.service.ts:924`) is **correct and deliberate**: it stores `size = 10`,
`usedSessions = 4`, and creates **only the 6 remaining bookings**, with an explicit comment saying why —
*"we don't have that history, and inventing past bookings to make a number look right would put fictional
attendance in the reports."* **That decision is right and must not be undone.**

The bug is downstream, in the plan reconciler:
- `reconcileCoursePlan` (`:1546`) calls `planCourseMoves(rows, **course.size**)`
- `rows` = the bookings that exist = **6**
- `planCourseMoves` (`course-plan.ts:98-101`): `if (current < size) { const need = size - current; … }`
⇒ `current = 6`, `size = 10` ⇒ **`need = 4`**, appended **on top of** the makeup for the actual leave ⇒ **5**.

**The reconciler is measuring the plan against the whole purchase, when the plan only ever held the remainder.**

## 🪤 The trap — a naive fix breaks every NORMAL course. Read this before touching it.
The obvious fix is *"pass `size − usedSessions`"*. **Do not ship that without thinking it through.**
On a normal `SALE` course all 10 bookings exist and `usedSessions` **grows as sessions are attended**. After three
attended sessions that formula gives `10 − 3 = 7` against `current = 10`, and `planCourseMoves`'s other branch
(`current > size`) would start **CANCELLING three real future sessions of a paying family.**

**The quantity the plan needs is "how many sessions is THIS PLAN responsible for" — which is
`size − (sessions already taught BEFORE the import)`, a number that is fixed at import time and does not move.**
Today `usedSessions` carries the import value **and** the running attendance count in the same field, so the two
cannot be told apart after the first attendance. **How to separate them is SA's design call** — record the
import-time figure, derive it, or reshape what the reconciler is given. **Porter is not choosing; Porter is
insisting that whatever is chosen cannot make a `SALE` course cancel a session.**

## Requirement
1. **An imported course's plan is responsible only for its remaining sessions.** Reconciling it must never append
   sessions to "make up" lessons taught before the import.
2. **A leave on an imported course creates exactly ONE make-up session**, the same as on any other course.
3. **A normal (`SALE`) course is completely unaffected** — no session is ever cancelled or appended as a side
   effect of this fix.
4. **The course is described by what the family BOUGHT.** A 10-session course with 4 taught is a **10-session
   course with 6 remaining**, not a "6-session course".
5. **Leave quota is computed from the purchased size** — a 10-session course gets the 10-session quota, whether it
   was sold here or imported.
6. **Existing imported courses are assessed, not silently rewritten.** 16 live imported courses exist on `uat`;
   some may already carry invented EXTENDED sessions from a leave taken before this fix. **Report them; the owner
   decides what to do with each.** Nothing is deleted from a family's plan without him.

## Acceptance Criteria
- [ ] **AC-1** — **Given** a course imported as bought 10 / used 4 (6 bookings created), **When** the parent takes
      **one** leave, **Then** **exactly one** EXTENDED session is created.
- [ ] **AC-2** — Same course, **When** the plan is opened, **Then** it reports **10 bought · 4 already taught ·
      6 in this plan · 0 owed** — no phantom debt.
- [ ] **AC-3** — The course is labelled by its **purchased** size everywhere it is named (card, ring, plan modal).
- [ ] **AC-4 (quota)** — That course's leave quota is the **10-session** quota (3), not the 6-session quota (2).
- [ ] **AC-5 (🔴 regression, the one that matters most)** — **Given** an ordinary `SALE` 10-session course with 3
      sessions attended, **When** anything reconciles its plan, **Then** **nothing is appended and nothing is
      cancelled.** This must be tested explicitly; it is the way a fix here goes wrong.
- [ ] **AC-6 (regression)** — Leave, make-up, extension-ceiling and the `plannedAtCreation` free-absence rule
      (REQ-045) all behave exactly as today on normal courses.
- [ ] **AC-7 (existing data)** — A read-only report lists every `IMPORT` course whose live session count does not
      match `size − usedSessions`, with what it would take to correct each. **Report only — no writes.**

## Constraints
- **Do not "fix" this by creating the already-taught bookings.** `importCoursePackage`'s comment explains why:
  fictional attendance would land in REQ-013/REQ-014's reports and in every attendance figure.
- **Nothing about a family's existing plan is changed without the owner** (requirement 6).

## Out of Scope
- Changing how imports are entered, or the import screen's fields.
- Any redesign of the plan editor (REQ-030).

## Questions
- **Q1 (to SA):** how do you intend to separate "taught before import" from "attended since"? Both live in
  `usedSessions` today. Say whether it needs a migration — Porter expects it does, and would rather hear that than
  a clever derivation that is right once and wrong after the next attendance.
- **Q2 (to SA → Porter):** how many of the 16 imported courses on `uat` already have invented EXTENDED sessions?
  **Give Porter the query; do not run it.** That number decides whether requirement 6 is a five-minute
  conversation with the owner or a real cleanup.

---

## 🎨 UI — added 2026-08-22 (owner). **This is what he was actually pointing at.**
> *"UI ตรงวันที่เริ่ม กับ เวลา text box ไม่ตรงกัน"*

**On the "Already in progress" modal, `Remaining sessions start` and `Time` sit in the same two-column row, but
their inputs are not on the same line.** The left field carries a **two-line** helper (*"The first session from
here on — not the original start"*) while the right field has **none**, so the left input is pushed down and the
two boxes are visibly out of step.

**Porter's note for whoever fixes it:** the cause is the helper text, not the inputs — so **do not fix it by
nudging one box.** Either the row aligns its **inputs** rather than its tops, or every field in the row reserves
the same helper slot. Otherwise the next field whose helper wraps to two lines re-opens the same bug, and this
form is full of helper text.

- [ ] **AC-8** — in the "Already in progress" modal, the `Remaining sessions start` and `Time` inputs are aligned
      on the same line, **and remain aligned when a helper text wraps** (check at 1440 / 768 / 375 per REQ-041).

### 🔻 Porter's note on his own answer
The owner asked *"เห็นอะไรแปลกๆ มั้ย"* and **I answered with a data defect** (the course labelled by its remaining
count, and the leave quota short by one). **He meant the visual misalignment.** My finding stands and is
requirement 4 + 5 of this REQ — but it was **not** the answer to the question he asked, and reporting it as though
it were is how a question gets treated as answered when it has not been.

---

## ✅ OWNER DECISIONS — 2026-08-22
> *"course ที่ทำไปแล้ว พลาดไปแล้วไม่ต้องแก้"*
> *"ฉันจะให้เทสที่ sid ก่อน ค่อยขึ้น และก่อนขึ้นหลังเทสแล้ว ฉันจะเทสด้วย แล้วเราค่อยขึ้น"*

### 1. Existing imported courses are NOT corrected — **requirement 6 is withdrawn**
Courses that already carry invented sessions **stay as they are.** The owner absorbs it. The fix is
**forward-only**: from TASK-165 onward no new phantom sessions are created.

**Requirement 6 and AC-7's "what it would take to correct each" are withdrawn as work.** The audit
(`courses:audit-imports`) stays — **read-only, informational** — because knowing the size of the exposure costs one
command and no writes, and because of the question below.

### ⚠️ 2. One distinction Porter is NOT folding into "ไม่ต้องแก้" without asking
The audit reports **two opposite faults**, and the owner's decision plainly covers one of them:
| | Who is out of pocket | Covered by *"ไม่ต้องแก้"*? |
|---|---|---|
| **Over** — phantom sessions appended | **the shop** gives away lessons | ✅ Yes — his loss, his call, absorbed |
| **Under** — a make-up short-appended | **a family** gets less than they paid for | ❓ **Asked, not assumed** |

The second is not the owner absorbing a cost — it is **a customer's family quietly receiving fewer sessions than
they bought**, and it surfaces as a complaint months later with no way to reconstruct why. **Porter has asked
whether "ไม่ต้องแก้" extends to that case.** Until answered, the audit is run for **information only** and nothing
is changed either way.

### 3. The release path — owner's process, adopted
**`sid` → Tanya tests → the OWNER tests → then lift to `uat`.**
The owner adding his own pass before the lift is **not redundant with QA** and is recorded as part of the gate:
Tanya answers *"does it do what the AC says"*; **he** answers *"is this what my customer will actually do with it"*.
Two different questions, and today produced three examples of the second one catching what the first would not.
⇒ **The UAT gate for this block = Tanya's pass + Porter's sign + the owner's own run.**
