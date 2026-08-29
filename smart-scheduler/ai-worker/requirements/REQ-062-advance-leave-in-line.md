# REQ-062: ลาล่วงหน้าในไลน์ — พ่อแม่ต้องเลือกคาบของวันข้างหน้าได้ ไม่ใช่แค่คาบวันนี้
- Status: READY_FOR_SA
- Priority: **HIGH** — it is the half of "การลาล่วงหน้า" that was never built, and the customer asked for it in a meeting
- Requested: 2026-08-22 by stakeholder (owner) — *"ให้เลือกคาบวันข้างหน้าได้ด้วย"*
- Source: the owner's meeting note of 2026-08-16 (*"ตอนสร้างคอร์ส ต้อง manage ลาล่วงหน้าได้เลย"* → REQ-045) had a
  second half nobody had checked: **the parent's own advance leave, in LINE.** Porter raised it as an open
  question on 2026-08-19; answered today.

## Problem / Goal
**The LINE leave flow can only cancel a session that is happening today.** Grounded, not assumed —
`checkin.service.ts:87`:
```ts
and(eq(b.date, date), eq(b.status, "CONFIRMED"), inArray(b.studentId, ids))
```
`eq(b.date, date)` is an **exact match on today**. So a parent who knows on Saturday that their child cannot come
next Tuesday has **no way to say so**: they must wait until Tuesday, and if they forget, the session is consumed
as a no-show. REQ-046 made a leave target a **session** rather than a day — this REQ makes it reach a session that
is not today.

**Goal: in the LINE leave flow, a parent can pick any upcoming session of their child, not only today's.**

## Requirement
1. **The leave picker lists upcoming sessions, not just today's** — today first, then forward.
2. **Each row is unambiguous about which session it is** — REQ-046's whole point. A future row must name the
   **date** as well as the child, time and program, or a parent with a weekly course cannot tell two rows apart.
3. **A window, not "everything"** — a 10-session course books ~10 weeks forward, and a family with two children
   would face a wall of rows on a phone. **Porter's proposal: the next 14 days**, capped and grouped by date, with
   the existing "…and N more" pattern (REQ-016) rather than a scroll with no end. See Q1.
4. **REQ-047's cut-off only ever applies to today.** A future session is by definition outside any hours-before
   window, so **an advance leave needs no approval and no admin** — it is the easy path, and it must stay easy.
5. **An advance leave is a normal leave in every other respect** — it re-owes the session, the plan extends
   exactly as REQ-030 defines, REQ-049's notification fires with the same setting, and it **consumes leave quota
   exactly as a same-day leave does**. This REQ adds *when* a parent may say it, not *what it means*. ⚠️ It is
   explicitly **not** REQ-045's planned-absence-at-creation, which is free and staff-declared —
   see "Not to be confused with", below.
6. **The confirmation states the date back to the parent** — a leave taken for a session eight days away must not
   read like one taken for today.

## Acceptance Criteria
- [ ] **AC-1** — **Given** a parent whose child has a course session next Tuesday, **When** they open แจ้งลา in
      LINE today, **Then** that Tuesday session is listed and can be chosen.
- [ ] **AC-2** — **Given** a weekly course, **When** the list is shown, **Then** every row names the **date**, and
      two sessions of the same course at the same time on different dates are visibly different rows.
- [ ] **AC-3** — **Given** an advance leave, **When** it is confirmed, **Then** the reply names the **child, date,
      time and program**, and the session is cancelled, re-owed and the plan extended exactly as a same-day leave.
- [ ] **AC-4 (no approval for the easy case)** — **Given** a session more than REQ-047's cut-off away, **When**
      leave is taken, **Then** it is recorded immediately with **no admin approval step**.
- [ ] **AC-5 (regression — today still works)** — Today's sessions still appear first and behave exactly as they
      do now, including the cut-off refusal and its explanation (REQ-047).
- [ ] **AC-6 (quota)** — An advance leave consumes leave quota identically to a same-day leave; REQ-045's
      `plannedAtCreation` sessions are untouched and remain free.
- [ ] **AC-7 (no leave twice)** — A session already on leave cannot be picked again, and the list says so rather
      than failing on submit.
- [ ] **AC-8 (bilingual)** — TH and EN, no raw i18n key, dates rendered in the parent's language.

## Not to be confused with — three near-identical things that must stay distinct
| | Who declares it | When | Costs quota? |
|---|---|---|---|
| **REQ-045** planned absence | **staff**, at course creation | before the course starts | **No** (`plannedAtCreation`) |
| **REQ-062 (this)** advance leave | **parent**, in LINE | any time before the session | **Yes** |
| same-day leave (today) | parent, in LINE | on the day, before the cut-off | **Yes** |

## User-facing wording (Porter as UX writer)
- List heading — TH: `เลือกคาบที่ต้องการลา` · EN: `Which session are you cancelling?`
- Row (today) — TH: `วันนี้ · {time} น. · {nickname} · {program}` · EN: `Today · {time} · {nickname} · {program}`
- Row (future) — TH: `{วันอังคาร 26 ส.ค.} · {time} น. · {nickname} · {program}` ·
  EN: `{Tue 26 Aug} · {time} · {nickname} · {program}`
- Confirmation — TH: `แจ้งลาแล้ว: {nickname} · {วันอังคาร 26 ส.ค.} {time} น. · {program} — คาบนี้จะถูกเลื่อนไปต่อท้ายคอร์สค่ะ` ·
  EN: `Leave recorded: {nickname} · {Tue 26 Aug} {time} · {program} — this session moves to the end of the course.`
- Nothing to show — TH: `ตอนนี้ยังไม่มีคาบเรียนที่จะลาได้ค่ะ` · EN: `There are no upcoming sessions to cancel.`
- More than the cap — TH: `…และอีก {n} คาบ` · EN: `…and {n} more`

## Constraints
- **Do not re-invent leave.** Same cancellation, same re-owe, same extension, same notification — one rulebook.
- REQ-046's session-level targeting and REQ-047's cut-off behaviour are untouched for today's sessions.

## Out of Scope
- **Undoing** an advance leave (see Q2 — it is a real gap, but it is its own decision).
- Staff-side advance leave — staff already edit the plan (REQ-030).
- Advance **check-in** — meaningless, and nobody has asked.

## Questions
- **Q1 (to owner):** how far ahead should a parent be able to look — **14 days** (Porter's proposal), the whole
  remaining course, or a fixed number of sessions? Porter's reason for 14 days: it covers "next week, and the week
  after", which is how families actually plan, without turning the picker into a scroll.
- **Q2 (to owner):** if a parent takes leave for next Tuesday and then **can** come after all, should they be able
  to undo it in LINE? Today nothing can. **Porter's view: this becomes much more likely the moment advance leave
  exists** — a week is long enough for plans to change — but it is a separate REQ, not a silent addition here.
- **Q3 (to SA):** `findTodayBookingsForParent` is shared by **check-in and leave** (`line-webhook.service.ts` uses
  it at seven call sites). Widening the date range must **not** widen check-in — a parent must not be able to
  check a child in for next Tuesday. Say how you intend to separate them.

---

## 🔻 Porter correction + the real design problem this REQ actually has — 2026-08-22
**Correction: the confirm step is a designed, visible action, not a missing one.** The owner sent a screenshot of
the booking modal: it carries **`ยืนยัน + แจ้งเตือน Line`** and **`มาเรียน`**. My inference that "ten one-at-a-time
confirms doesn't read like an intended workflow" was **wrong about the mechanism** — the mechanism exists and is
deliberate.

**What is NOT resolved, and what this REQ now has to answer:**

`checkin.service.ts:87` filters on `eq(b.status, "CONFIRMED")`. A course's sessions are created **`PENDING`**
(`uat`: **106 PENDING, 0 CONFIRMED**). So:

> **A future session cannot be cancelled by a parent until staff have confirmed it — and confirming it also
> pushes a LINE notification to that parent.**

That is a real tension, and REQ-062 walks straight into it:
- If staff confirm sessions **shortly before each one** (the natural reading of a button that also notifies), then
  next Tuesday's session is still `PENDING` today ⇒ **widening the date range achieves nothing**, because the
  status filter removes it anyway. **REQ-062 would ship and appear to do nothing.**
- If staff confirm **all ten at course creation** so they are all cancellable, then the parent receives **ten LINE
  notifications at once**, which is not what that button is for.

⇒ **Requirement 7 (new):** the advance-leave picker must show a parent's **upcoming sessions that they are
entitled to cancel**, and the definition of that set **cannot simply be "CONFIRMED"**. Options for SA to weigh
(Porter's lean is the first, because it changes no existing behaviour and sends no extra messages):
- **(a) Leave the status model alone; the picker admits `PENDING` *and* `CONFIRMED` future sessions.** Cancelling a
  `PENDING` future session is still a leave — the entitlement is real whether or not staff have announced it yet.
  **Check-in keeps its `CONFIRMED`-only rule** (Q3), so nothing about attendance loosens.
- (b) Course sessions are born `CONFIRMED` and the notification is decoupled from the status change.
- (c) A bulk "confirm this course's sessions" action with one summary notification.
- [ ] **AC-9** — **Given** a course session next week that staff have **not** confirmed, **When** the parent opens
      แจ้งลา, **Then** it is listed and can be cancelled, **and** the parent receives **no** confirmation-style
      notification as a side effect.
- [ ] **AC-10 (check-in unchanged)** — Check-in still refuses a session that is not `CONFIRMED`, today or ever.

- **Q4 (to owner):** in real daily use, **when do staff press `ยืนยัน + แจ้งเตือน Line`** — when the course is
  created, the day before, or on the day? The answer decides between (a), (b) and (c) above, and Porter will not
  guess it: the button sends a message to a customer, so the wrong choice is a wrong message, not just a wrong
  status.

---

## ✅ Q4 ANSWERED — 2026-08-22, and it **dissolves** most of the design problem I raised
Owner: *"ตอนสร้างคอร์สสิ แล้วเขาจะดูว่าแน่ใจไม่เปลี่ยนแผน เขาก็กดยืนยัน มันก็ส่งไลน์ครูนะ ปกติ ปุ่มนี้"*

⇒ **Staff confirm at course creation**, once they are sure the plan is settled.

### 🔻 Porter correction — I had this wrong, and it was the whole basis of requirement 7
I wrote that confirming ten sessions up front would fire **"ten LINE notifications to the parent"**. **It does not
notify the parent at all.** `scheduler.service.ts:1801` — `recipientType: "teacher"`, payload
`kind: "booking_confirmed"`. **The message goes to the TEACHER**, which is exactly who wants to know a session is
now firm. The owner said so plainly and the code agrees with him.

**So the tension I built requirement 7 around does not exist:**
- Sessions are **meant to be `CONFIRMED` from creation**. That is the normal working state, not an edge case.
- ⇒ the leave picker's `eq(b.status, "CONFIRMED")` filter is **correct and stays**.
- ⇒ **REQ-062 really is just "widen the date range"** — requirement 7's options (a)/(b)/(c) are **withdrawn**, and
  **AC-9 is withdrawn** with them. AC-10 (check-in stays `CONFIRMED`-only) still stands and is now trivially true.

### What remains true, and is now a fact rather than a defect
`uat` currently holds **106 `PENDING` bookings** because those courses were created **without** anyone pressing
confirm. That is **a data state, not a bug** — and it means **advance leave (and check-in) will find nothing for
those sessions until staff confirm them.** Worth one line to the customer: *confirm the course once the plan is
settled, and the parent's LINE leave/check-in works for it.*

- **Q5 (new, to SA — not the owner):** is confirming a course's sessions **one click per session**, or is there a
  confirm-the-whole-course path? Ten clicks per course is the difference between "they'll do it" and "they won't",
  and 106 unconfirmed bookings on `uat` is weak evidence for the latter. **Do not design a bulk confirm on my
  say-so** — just report what exists, and Porter will raise it separately if it is one-at-a-time.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-062 | 🗓️ **ลาล่วงหน้าในไลน์ — พ่อแม่ต้องเลือกคาบวันข้างหน้าได้ ไม่ใช่แค่วันนี้** | **HIGH** | **READY_FOR_SA** (owner 2026-08-22: *“ให้เลือกคาบวันข้างหน้าได้ด้วย”*) | @Sober. Grounded: `checkin.service.ts:87` uses `eq(b.date, date)` — an **exact match on today**, so the picker structurally cannot show tomorrow. Advance leave needs **no approval** (REQ-047’s cut-off only ever applies to today) but **does** consume quota — it is NOT REQ-045’s free staff-declared planned absence; the REQ carries a 3-row table keeping the three apart. ⚠️ **Q3 → SA: the same function feeds CHECK-IN at seven call sites — widening the date range must NOT let a parent check a child in for next Tuesday.** Q1 (how far ahead — Porter proposes 14 days) + Q2 (undo an advance leave — own REQ) → owner.
```
