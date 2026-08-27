# TASK-182: `ยกเลิกคอร์ส` button + confirm dialog (REQ-036) (FE)

- Source: REQ-036 (owner: build now). **Build in PARALLEL with TASK-181** — contract fixed below, neither waits.
- Status: ✅ **FE code DONE (Sober 2026-08-24)** — reviewed, tsc 0 reproduced, no client re-count verified. Only the **rendered pass (Tanya)** remains before REQ-036 delivers.
- Assignee: @Fern (FE)
- Repo: **smart-scheduler-front**.

## What to build
- A **`ยกเลิกคอร์ส`** action on the course card / plan modal → a **confirm dialog** that (R2) is **server-powered**:
  call **`POST /courses/:id/cancel/preview`** and show, in words, what the server will actually do — **the student's
  name · how many sessions will be removed · that it cannot be undone**. Do not compute the count on the client.
  Wording: *"ยกเลิกคอร์ส {program} ของ {student} — จะลบคาบที่เหลือ {n} คาบ ทำแล้วย้อนกลับไม่ได้"*.
- **Reason is a CHOICE, not free text** (three options) + an **optional note**:
  `PROGRAM_CHANGED` (ลูกค้าเปลี่ยนกิจกรรม) · `CUSTOMER_CANCELLED` (ลูกค้าไม่เอาแล้ว) · `ADMIN_ERROR` (แอดมินคีย์ผิด).
  **Confirm disabled until a reason is chosen.**
- On confirm → **`POST /courses/:id/cancel { reason, note? }`**; on success refresh the plan (owed → 0, remaining
  sessions gone). Surface the server's `409 ALREADY_ENDED` / `400` messages if they occur.
- Bilingual via `t(...)`, no raw key. One course only, from its own card — never another course from the same screen.

## Definition of Done
- [ ] The button opens a dialog naming the student + the **server's** removed-session count + the irreversibility;
      Confirm is disabled until a reason is picked.
- [ ] Confirm cancels the course; the plan then shows 0 owed and no remaining sessions; an already-ended course
      surfaces the 409 gracefully.
- [ ] `bunx tsc --noEmit` 0 · `bun run build` ok · FRONTEND-STANDARD holds · rendered verdict pasted (rides @Tanya if
      the modal won't composite headless).

## Notes / Questions
(Fern fills in. The count in the dialog MUST come from `/cancel/preview`, not the client — R2, and the two have
disagreed before. The reason enum values are the contract; do not invent a fourth.)

---

## Implementation Notes (Fern 2026-08-24)
**`smart-scheduler-front@dong`, uncommitted — 6 files** (1 new: `Bookings/EndCourseDialog.tsx`).

### Built
- **`ยกเลิกคอร์ส` action on the plan modal's course footer** — red/`light`, sat apart from the add-a-session actions,
  and it **opens a confirm rather than acting on the click**. It renders only for `isCourse && !isCreate`, and its
  `courseId` is `plan.id` — so it is structurally incapable of ending a different course from the same screen.
- **`EndCourseDialog`** — on open it calls **`POST /courses/:id/cancel/preview`** and renders REQ-036's sentence from
  **the server's** numbers: *"ยกเลิกคอร์ส {program} ของ {student} — จะลบคาบที่เหลือ {n} คาบ ทำแล้วย้อนกลับไม่ได้"*.
  🔴 **No client re-count anywhere** — R2 exists because the two have disagreed before, and this is irreversible.
  The preview is re-fetched on **every** open, never cached: a preview from a previous open could describe a plan
  that has since changed.
- **Reason = a choice of three** (`PROGRAM_CHANGED` · `CUSTOMER_CANCELLED` · `ADMIN_ERROR`) as a `Radio.Group` +
  optional note. **Confirm is disabled until one is picked, and the reason for the disabling is stated on screen**
  (not left to guess). The three values are the contract — no fourth invented.
- **`alreadyEnded` handled with Jason's additive:** an already-cancelled course shows *"คอร์สนี้ถูกยกเลิกไปแล้ว"* and
  **the Confirm button is not rendered at all** — better than offering a button whose only outcome is a 409.
- Server refusals (`409 ALREADY_ENDED`, `400 REASON_REQUIRED`, …) surface **the server's own message**, not a generic
  failure. On success: toast, the mutation invalidates everything (plan owed → 0, sessions gone, calendar + attention
  panel re-read), and the plan modal closes behind it.
- Service + hooks + an offline mock for both endpoints, so the dialog is exercisable without a server.

**Evidence:** `bunx tsc --noEmit` **0** · `bun run build` **ok** ·
`bun test src/lib/scheduler/ src/services/` **40 pass / 0 fail** · FRONTEND-STANDARD §3.5 on the new dialog
**0/0/0/0**.
🔴 **Rendered verdict NOT done** — Mantine modal, headless pane. → @Tanya, and this one deserves a real pass more
than most: it is **irreversible**, and the number in the sentence is the whole safety mechanism. Worth checking
against a course that has taken a **leave** (the EXTENDED make-up case Jason's revision fixed) so the previewed count
and what actually disappears are compared on the same course.

## Questions
- **Q1 (not blocking, but someone should decide before this is called delivered):** the dialog reports what the
  server *will* remove, but nothing on the FE shows a course as **ended afterwards** — the plan just comes back empty.
  `alreadyEnded` exists on the preview, so a cancelled course opened later shows nothing distinguishing it from a
  finished one until you press the button. If the DTO/summary carried an `ended` flag (+ reason), the plan could say
  *"cancelled — {reason}"* outright. That's a follow-up, not this task, but REQ-036's record is only half visible
  without it.

## Review — ✅ FE code DONE (Sober 2026-08-24)
Reproduced `bunx tsc --noEmit` **0**; build ok + `src/lib+services` 40/0 per Fern. Spot-read `EndCourseDialog.tsx`:
the removed-session count is **the server's** (`data.removedSessions`, :102), preview re-fetched on **every** open
(:52-59) so a stale plan can't be described, `alreadyEnded` shows the message and **renders no Confirm button** (:90,
:133), Confirm is `disabled` until a reason is picked **with the reason-for-disabling on screen** (:138, :147), server
refusals (409/400) surface **the server's own message** (:70), and the action is structurally bound to its own
`courseId` (can't end a sibling course). No client re-count anywhere — R2 satisfied. Strong.

**Only open item: the rendered verdict → @Tanya (via Porter).** Fern's own flag stands and I agree it earns a real
pass — irreversible, and the number in the sentence is the entire safety mechanism. Check it against a course that
**took a leave** (the EXTENDED make-up case), so the previewed count and what actually disappears are compared on the
same course.

### Q1 answer (Sober): follow-up, and it's BE-free — the field already exists
You asked whether a cancelled course should **look** cancelled afterward (the plan just comes back empty). Decision:
**follow-up, not a delivery blocker** — the *dangerous* path (re-booking an ended course) is already guarded on the
server (`insertable=false`, `owedCount=0`), so this is purely informational, not a safety hole. And it's cheaper than
you framed it: **the BE already emits it** — `endedAt` + `endReason` are on the course DTO (`smart-scheduler-back
/src/types/contract.ts:111-112`, Jason's note #7). The **front** course type/mapper just drop them — the same
response-mapper omission you named in TASK-179 Q2. So the follow-up is FE-only: thread those two fields onto the front
course type + mapper, then the plan/card can render *"ยกเลิกแล้ว — {reason}"*. Cutting it as a small queued item
(TASK-183), behind the urgent lane and your TASK-179 finish.
