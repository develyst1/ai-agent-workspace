# REQ-044: Booking modal — the "คอร์ส / Weekly course" tab must say what it actually does (make-up insert)
- Status: READY_FOR_SA
- Priority: MEDIUM–HIGH (same screen as REQ-043 — the owner picked option (c) on 2026-08-16)
- Requested: 2026-08-16 by stakeholder (owner)
- Deadline: none
- Source: owner, 2026-08-16 — *"เราจะไปใช้จองคอร์สที่หน้าแรกได้ยังไง ในเมื่อหน้าสมัครคอร์สและหน้าแก้ไขคอร์สไม่เคย
  ปล่อยให้ว่างเลย … เพราะงั้นหน้าแรกที่มีให้จองประเภทคอร์สได้ ทำไปทำไม"* → after discussion he chose **option (c):
  keep the tab, rename and reframe it.**

## Problem / Goal
The tab is labelled **"คอร์ส / Weekly course"**, which reads as *"สมัครคอร์ส"* (buy/enrol a course). Its real job is
**"แทรกคาบชดเชยให้เด็กที่มีคอร์สอยู่แล้ว"** — pick a day + teacher, and the session still owed at the tail of that
child's plan **moves** to that slot. Nothing is added; the total number of sessions never changes.

**Evidence this is a real failure, not polish:** the owner — who commissioned the feature — asked *"จองคอร์สมีไป
ทำไม"* **twice**: once before REQ-030 (recorded verbatim in REQ-030's Analysis, where the answer was written down)
and again on 2026-08-16 looking at a live plan. The answer exists in a REQ; it does not exist **on the screen**. Staff
who never read a REQ have no chance. **If a screen needs a requirements document to explain it, the screen is wrong.**

Goal: a member of staff opening this modal can tell, without training, that this tab is for **moving a make-up
session for an existing course**, and can see what it did to the plan afterwards.

## Requirement
1. **Rename the tab** from "คอร์ส / Weekly course" to wording that names the action (below).
2. **Add one line of explanation inside the tab** stating (a) it is for students who already have a course, and
   (b) the total number of sessions does not change — the pending session at the end moves here.
3. **The confirmation after saving must state the effect on the plan**, including the course's new end date, so the
   move is visible rather than something staff have to go and verify in the plan modal.
4. **No behaviour change.** What the action does, what it writes, eligibility, quota, and the plan-modal's own
   `แทรกคาบชดเชย` entry point all stay exactly as they are. The two entry points keep sharing one behaviour
   (REQ-030 §4 "two entry points, one behaviour").
5. **The other three tab labels are reviewed for the same failure** and corrected only where they mislead —
   especially that **"คาบเดี่ยว / Single session" is the paid extra session (REQ-037)** and is the tab to use when a
   family genuinely wants an *additional* lesson beyond what they bought. If a label is already right, leave it.

## Acceptance Criteria
- [ ] **AC-1** — **Given** the New-booking modal, **When** a user looks at the tab strip, **Then** the course tab
      reads **`แทรกคาบชดเชย` / `Make-up session`** — the word "คอร์ส / Course" no longer stands alone as its label.
- [ ] **AC-2** — **Given** that tab is selected, **When** it renders, **Then** the explanatory line below the tab is
      visible **before** any field is filled (not a tooltip, not on hover), in the exact wording below.
- [ ] **AC-3** — **Given** a student with a course whose plan ends on date X, **When** staff insert a make-up on an
      earlier date, **Then** the confirmation names **the new end date**, and opening the plan shows the tail session
      gone and the total session count **unchanged**.
- [ ] **AC-4 (regression)** — The action itself is unchanged: same eligibility list, same data written, the plan
      modal's `แทรกคาบชดเชย` button still does the same thing, and quota/expiry behave exactly as before.
- [ ] **AC-5 (regression)** — Trial / คาบเดี่ยว / บัตร tabs still do what they did; any label changed under
      Requirement 5 changes **wording only**.
- [ ] **AC-6 (bilingual)** — Every string below exists in **both** TH and EN and switches with the language toggle;
      no raw i18n key is ever visible.

## User-facing wording (Porter as UX writer — this is the deliverable, engineers draft nothing)
**Tab label**
- TH: `แทรกคาบชดเชย` · EN: `Make-up session`

**Explanatory line inside the tab (always visible, above the fields)**
- TH: `สำหรับนักเรียนที่มีคอร์สอยู่แล้ว — เลือกวันและครูที่ต้องการ ระบบจะย้ายคาบที่ค้างอยู่ท้ายแผนมาไว้วันนี้ จำนวนคาบทั้งหมดไม่เปลี่ยน`
- EN: `For a student who already has a course — pick a day and teacher, and the session still pending at the end of their plan moves here. The total number of sessions does not change.`

**Save button**
- TH: `แทรกคาบ` · EN: `Insert session`

**Confirmation after saving** (`{date}` = the plan's new end date, same format as the plan modal, `DD/MMM/YY`)
- TH: `แทรกคาบชดเชยแล้ว — คอร์สนี้สิ้นสุดวันที่ {date}`
- EN: `Make-up inserted — this course now ends {date}.`

**If the chosen slot is refused** (busy teacher / taken slot / ceiling) — reuse the existing refusal reason from
REQ-030; do not invent a second vocabulary for the same rejection.

## Constraints
- **Wording and framing only.** Any proposal that changes what the action *does* stops and comes back to Porter as a
  new requirement.
- Same screen as **REQ-043** (one student picker across tabs). They are separate requirements but one FE surface —
  **whether they ship in one pass is Sober's call**, not Porter's; flagging only that they collide in the same files.

## Out of Scope
- Removing the tab (option (b) — considered and **rejected** by the owner on 2026-08-16).
- Changing the plan modal's own `แทรกคาบชดเชย` button or the plan-editing behaviour (REQ-030 territory).
- Anything about REQ-037's paid extra session beyond making sure its tab label doesn't mislead.

## Questions
- **Q1 (to owner):** Confirm the Thai tab label **`แทรกคาบชดเชย`** and the explanatory line above. If the centre's
  staff use a different everyday word for a make-up lesson, use theirs — their vocabulary beats mine.
  > answer: _pending_
- **Q2 (to owner):** Should the confirmation also state which session moved (e.g. *"คาบวันที่ 18 Oct ถูกย้ายมา"*), or
  is the new end date enough? Porter's lean: end date is enough — more text on a routine action is noise.
  > answer: _pending_
