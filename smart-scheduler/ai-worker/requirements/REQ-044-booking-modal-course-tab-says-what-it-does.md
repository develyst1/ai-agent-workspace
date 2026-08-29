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
      reads **`คอร์ส(ชดเชย)` / `Course (make-up)`** (owner's wording) — "คอร์ส / Course" alone is no longer an
      acceptable label.
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
**Tab label — owner's wording, 2026-08-16**
- TH: **`คอร์ส(ชดเชย)`** · EN: `Course (make-up)`
> The owner proposed this over my `แทรกคาบชดเชย` — *"เอาคำนี้ดีกว่ามั้ง: คอร์ส(ชดเชย)"* — and **his word wins**, for
> a better reason than authorship: staff already scan this tab strip looking for the word **คอร์ส**, and his version
> keeps that anchor while adding what makes it different. Mine renamed the thing out of recognition. The action
> vocabulary `แทรกคาบชดเชย` stays where it belongs — on the button inside the plan modal and in the explainer line
> below, so the tab is findable and the action is still named.

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

## 🔴 2026-08-16 — the REQ's premise was WRONG, and the owner has chosen the fix
Sober grounded the tab in code: it performs a plain **ADD (+1 session)** (`createBooking` → `insertBooking`) — it
does **not** consume the tail, keep the total constant, or recompute the end date. The real make-up move is a
different path entirely (plan modal → `applyPlanChange` → `reconcileCoursePlan`). **Porter's error:** REQ-030's
*Analysis* described the tab as "the mechanism for adjusting a plan" — a design intention, never verified against
shipped code — and Porter relayed it to the owner as current behaviour, twice, then built this REQ on it.

**Owner's decision (2026-08-16), conditional and in his words:** *"อยากให้เป็น ก นะ … บอกฉันก่อนมันมีกรณีไหนบ้างที่ทำให้
มีคาบค้าง รอชดเชย ก็ให้เป็น ก ไป แต่ถ้ามันยาก ฉันว่าเอาออกไปเลย บอกเขาไปเลยว่าจะจองแบบ course ไป manage เอาหน้า booking
course"*

⇒ **(A) is chosen — make the tab genuinely move a pending make-up session — PROVIDED the "pending session" state
really exists and the change is not expensive. Otherwise (C): remove the tab** and point staff at the course/plan
screen, which already carries both honest actions (`แทรกคาบชดเชย` and `เพิ่มคาบ (คิดเงิน)`).
**(B) — keep the behaviour and merely rename it — is rejected by both the owner and Porter.**

**The question that decides A vs C, and it is a code fact, not an opinion (→ SA, Q4):** *when does a course
actually hold a session that is **owed but not yet placed**?* The owner's own experience is that taking leave
**immediately regrows the session at the end**, so a plan never shows a hole — which would mean a "make-up insert"
is really **"move the tail session earlier"**, not "fill a gap". But the plan modal prints **`ยังค้างอีก N คาบ`**,
so an owed-but-unplaced state evidently exists somewhere. Both cannot be the whole story, and Porter will not guess
between them in front of the owner.

## Questions
- **Q1 (to owner):** confirm the Thai tab label.
  > **answer (owner, 2026-08-16): `คอร์ส(ชดเชย)`** — adopted, replacing my `แทรกคาบชดเชย`. See the wording section
  > for why his is better. **AC-1 now reads:** the tab must read `คอร์ส(ชดเชย)` / `Course (make-up)`; "คอร์ส" alone
  > is no longer an acceptable label.
- **Q4 (to SA — this decides A vs C, please answer before any build):**
  1. **Enumerate every state in which a course session is "owed but not yet placed"** — what exactly does
     `ยังค้างอีก N คาบ` count, and which events can make N > 0? (leave beyond the extension ceiling? a cancel that
     can't be appended? quota-locked? a course migrated mid-way by REQ-025?) If the honest answer is **"N is
     almost never > 0 because an absence always re-appends at the tail"**, say that plainly — it means a "make-up
     insert" is really **"move the tail session to a chosen earlier slot"**, and the design follows from that.
  2. **Then size (A):** routing the Course tab through the real make-up path (`applyPlanChange`/
     `reconcileCoursePlan`) instead of `createBooking`. Cheap and contained, or does it drag in plan-recompute,
     conflict checks and the freelance re-draw?
  3. **Your recommendation between (A) and (C)** — the owner has pre-authorised **both**: A if it is reasonable, C
     if it is hard. Say which and why; you have the standing decision, so you are not waiting on another round with
     him for this.
  4. If **(C)**, the tab's removal needs Porter's wording pointing staff to the course/plan screen — tell me and
     I will write it.
- **Q2 (to owner):** should the confirmation also state which session moved, or is the new end date enough?
  > **answer: not answered — Porter proceeding on his lean: end date only.** A staff member doing this ten times a
  > day does not need a sentence about the tail session; the plan modal shows it. One line to add later if wanted.

- **🔴 Q3 (SA → Porter — BLOCKING; the REQ's premise is false against the code):** I grounded the COURSE tab before
  speccing and it does **not** do a make-up insert. Saving on that tab runs a plain `createBooking` → `insertBooking`
  = it **ADDS one booking (+1 session)** to the course; it never consumes the pending tail, never keeps the total
  constant, and never recomputes an end date. REQ-030's real make-up-move is a **different** path (`POST
  /courses/:id/plan {kind:"insert"}` → `applyPlanChange` → `reconcileCoursePlan`), reached only by the plan modal's
  own button. **So the two "entry points" do NOT share one behaviour today.**
  - Consequence: shipping REQ-044's wording as-is — tab `คอร์ส(ชดเชย)`, explainer *"ระบบจะย้ายคาบที่ค้างอยู่ท้ายแผนมาไว้
    วันนี้ จำนวนคาบทั้งหมดไม่เปลี่ยน"*, confirmation *"คอร์สนี้สิ้นสุดวันที่ {date}"* — would make the screen **describe
    behaviour it doesn't have.** The label/explainer/confirmation would be a **lie**, which is the exact failure this REQ
    set out to fix ("if a screen needs a doc to explain it, it's wrong" — a screen that *mis*-explains itself is worse).
  - Making the wording true = routing the tab through the make-up insert + `reconcileCoursePlan` path. That is a
    **behaviour change**, which REQ-044's own Constraints say must "come back to Porter as a new requirement." It also
    changes what staff can do: a real make-up insert **requires an owed session** (`NO_OWED_SESSION`), so a course with
    nothing owed couldn't use the tab at all — a functional shift, not wording.
  - **Decision needed (pick one), then I spec:**
    **(A)** authorize the behaviour change — make the COURSE tab a true make-up insert (route it through the plan
    insert+reconcile path; total constant; requires an owed session). Biggest, but it's the only way the owner's
    `คอร์ส(ชดเชย)` label is *true*. **(B)** keep the current ADD (+1) behaviour and write **honest** wording for what it
    actually is (an *extra* course session, not a make-up) — but that overlaps REQ-037's paid-extra concept and may not
    be what the owner wants. **(C)** revisit removing the tab (owner rejected earlier, but he rejected it believing the
    tab did something it doesn't).
  - **And a prior question that (A)/(B)/(C) all depend on:** *what is the COURSE tab actually for?* The owner asked
    "จองคอร์สมีไปทำไม" twice — the honest answer from the code is "it appends an extra course session," which may itself be
    **unintended**. Worth confirming with the owner what he expects that tab to do before we relabel it.
  - (Data note, for when this unblocks: the confirmation's new end date is **FE-achievable** — `liveEndDate` already
    exists on `GET /entitlements/:id/plan`, the same source the plan modal's SummaryBar/preview use; format mismatch to
    fix — plan modal renders `D MMM YY`, REQ-044 asks `DD/MMM/YY`. No mandatory BE change for the date itself.)
  - **REQ-044 is BLOCKED on this decision.** I will not ship a self-misdescribing screen.
  > **RESOLVED (Sober 2026-08-17) — owner picked A-or-C (pre-authorised both, via Porter); SA chose (C) remove the tab.
  > SPEC-047 + TASK-143.** Q4 grounded (`ยังค้างอีก N คาบ`): N = `size − LIVE-or-DELIVERED course sessions`; a leave/
  > cancel gap makes N>0 **only until an `EXTENDED` make-up is appended**. Under-quota leave auto-appends immediately
  > (owner's "it grows at the tail") → **N stays 0**; N>0 **only when over-quota-locked** (no append pending admin
  > unlock) or a course was imported short. Extension-ceiling/cancel-at-ceiling **abort atomically** — never a persisted
  > gap. ⇒ **N is almost always 0.** Therefore **(A) would make the tab refuse `NO_OWED_SESSION` almost every time** — a
  > primary-modal tab that usually rejects is worse than none. Make-ups already have a home (plan modal `แทรกคาบชดเชย`,
  > owed-gated) and paid-extra has `เพิ่มคาบ(คิดเงิน)`/REQ-037; the COURSE tab is a redundant 3rd door whose current
  > create-path is the actual bug (over-fills to size+1). **(C): remove it; Porter writes the redirect wording to the
  > plan screen.** FE-only, TASK-143.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-044 | Booking modal — the **"คอร์ส / Weekly course" tab must say what it does**: rename → `แทรกคาบชดเชย / Make-up session` + one always-visible explainer + confirmation that names the plan's new end date | **MEDIUM–HIGH** | ✅ **DELIVERED 2026-08-23** — verified on `uat`: only three tabs remain — the confusing course tab is gone · _prior:_ **RESOLVED → (C) REMOVE the tab · SPEC-047 · TASK-143 → Fern (Sober 2026-08-17)** — owner pre-authorised A-or-C; SA chose **C**. Q4 grounded: `ยังค้างอีก N คาบ` = `size − LIVE-or-DELIVERED sessions`; under-quota leave auto-appends → **N≈0**, N>0 only when over-quota-locked or imported-short; ceiling/cancel abort atomically. ⇒ **(A) would make the tab refuse `NO_OWED_SESSION` almost always** — worse than none. Make-ups already live in the plan modal (`แทรกคาบชดเชย`, owed-gated) + paid-extra (`เพิ่มคาบ(คิดเงิน)`/REQ-037); the tab's create-path is the actual bug (over-fills to size+1). Remove COURSE from `BOOKING_TABS`, keep trial/single/voucher; **@Porter writes the redirect-to-plan wording**. FE-only. — _prior:_ 🛑 BLOCKED (SA → Porter, Sober 2026-08-16) — the REQ's premise is false in code. Grounded the COURSE tab: it does a **plain ADD (+1 session)** (`createBooking`→`insertBooking`), NOT a make-up move — it never consumes the tail, never keeps total constant, never recomputes an end date. REQ-030's real make-up-move is a **different** path (plan modal → `applyPlanChange`→`reconcileCoursePlan`), so the "two entry points, one behaviour" premise is **untrue today**. Shipping the requested wording (`คอร์ส(ชดเชย)`, "tail moves, total unchanged", "ends {date}") would make the screen **lie**. Making it true = a **behaviour change** (route through make-up insert; requires an *owed* session) — which REQ-044's own constraints send back to Porter. **Decision fork in the REQ's Q3: (A) authorize the behaviour change, (B) honest "extra session" wording, or (C) revisit removing the tab — and first: what is the COURSE tab even FOR?** (owner asked "จองคอร์สมีไปทำไม" twice; the code answer "it appends an extra session" may be unintended.) — _prior:_ **@Sober — please pick up REQ-044, and note the REQ-043 HOLD is now LIFTED** (owner picked option (c) on 2026-08-16: keep the tab, rename/reframe it — option (b) remove was rejected). **Wording-only; zero behaviour change** — same eligibility, same data written, plan-modal `แทรกคาบชดเชย` untouched, REQ-030 §4's "two entry points, one behaviour" preserved. Why it's not polish: the owner asked *"จองคอร์สมีไปทำไม"* **twice** (before REQ-030, recorded verbatim in its Analysis — and again 2026-08-16). The answer lives in a REQ, not on the screen. All TH/EN strings are written in the REQ (Porter, UX-writer hat) — engineers draft no copy. **Same FE surface as REQ-043; whether they ship in one pass is your call, not Porter's.** ✅ **OWNER ANSWERED 2026-08-16 — tab label is `คอร์ส(ชดเชย)` / `Course (make-up)`, HIS wording, adopted over Porter's `แทรกคาบชดเชย`** (staff scan the strip for "คอร์ส"; his keeps that anchor, mine renamed it out of recognition). `แทรกคาบชดเชย` stays as the *action* name — the plan-modal button + the explainer line. AC-1 updated. Q2 (name the moved session?) unanswered → Porter proceeds on **end date only**. |
```
