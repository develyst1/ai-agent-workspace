# REQ-036: End a course early (the customer asks to cancel a course they bought)
- Status: READY_FOR_SA
- Priority: **HIGH — a real customer is waiting, and there is no way to serve her today**
- Requested: 2026-08-24 by the customer, relayed by the owner — *"ขอรบกวนยกเลิกคอร์สนี้ค่ะ"*
- Long-standing: named in code since SPEC-028 (`scheduler.service.ts:1965` — *"Fix rides REQ-036 (early
  termination)"*), never built. **It has now been asked for by a paying customer.**

## The problem — verified in code, not assumed
**There is no way to cancel or end a course anywhere in the product.**
- `routes/api.ts` exposes `GET /courses`, `POST /courses`, `/preview`, `/import`, `/:id/plan`,
  `/:id/extra-session`, `/:id/history`, `PATCH /:id`. **No delete, no cancel, no terminate.**
- **`PATCH /courses/:id` accepts exactly one field — `adminUnlocked`** (`validation.ts:339`). `size` is not editable.
- **Cancelling the sessions one by one does not work.** SPEC-028 §11.3: *"EVERY course-session cancel is a
  reschedule, not a forfeit"* — `reconcileCoursePlan` re-owes a make-up so the plan returns to `size`. **The
  sessions grow back.** (Proven live today on เภา: one cancel produced an `EXTENDED` make-up on 01/Nov.)
- `course:cleanup` (REQ-057) **refuses any course with a posted sale**, and every purchased course has one. Also
  wrong tool: that deletes test residue, this ends a real, paid, partly-taught course.

⇒ Doing nothing is not neutral either: **the remaining `PENDING` sessions stay on the calendar every week**, and
staff will see and teach them.

## Requirement
1. **End a named course early.** After it, the course owes **zero** further sessions: remaining `PENDING` sessions
   are removed and **no make-up is re-owed** — this is a forfeit/settlement, explicitly *not* a reschedule.
2. **Sessions already delivered stay delivered.** History, `used_sessions`, and any posted revenue are untouched.
3. **The money is recorded, not silently dropped.** SA to design the shape with Porter; the *decision* (refund /
   credit / no refund) is the owner's per case, but the system must **record what was decided** rather than leave
   a paid course that simply stops.
4. **Staff-operable**, with a reason. A customer cancelling a course is normal business, not an engineering event.
5. **Refuses** on a course that is already finished or already ended early (idempotent).

## Acceptance Criteria
- [ ] **AC-1** — Given a course with sessions remaining, when it is ended early with a reason, then remaining
      `PENDING` sessions are gone, **no make-up is appended**, and the plan shows **0 owed**.
- [ ] **AC-2** — Delivered sessions, `used_sessions` and course history are **unchanged**.
- [ ] **AC-3** — The reason and the money decision are stored and visible in the course history.
- [ ] **AC-4** — Re-running on an already-ended course changes nothing and says so.
- [ ] **AC-5** — No other course, student or parent is touched.

## The three candidate courses (customer sent all three; **which one is not yet stated**)
| student | course | used | expires | note |
|---|---|---|---|---|
| **Peace ญดา** | 6-session Inline Skate | **0/6** | 2026-10-17 | nothing consumed — the cleanest case |
| **ยูจีน** | 10-session Surfskate | **2/10** | 2026-10-24 | partly used |
| **Jasper** | 10-session Surfskate | **3/10** | **2026-08-22** | **already expired** — may not need cancelling at all |

## Questions for the owner (both block the *action*, not the *build*)
- **Q1: which course?**
- **Q2: money — refund, credit for future use, or no refund?** Porter will not assume a number or a policy.

## Question for SA
- **Q3:** the cleanest mechanism — reduce `size` to `used_sessions` so `reconcileCoursePlan` naturally owes zero,
  or an explicit `endedAt`/status on the course? The first reuses the existing invariant; the second is more
  honest about what happened. **Ground it; do not take Porter's suggestion as the design.**

---

## ⏱️ SCOPE CUT — owner, 2026-08-24: **build the cancel button NOW. 30–40 minutes.**
> *"ไม่ต้องทำละ ไปทำ ปุ่มยกเลิกคอร์ส แบบรัดกุมมาแทน เอาก่อนเลย"*

**Q1 (which course) and Q2 (refund policy) are DROPPED as blockers.** We are not deciding a money policy tonight —
we are giving staff the ability to end a course, safely. **The money decision stays a human one, per case; the
system only records what was said.**

### In scope — and nothing else
1. **`POST /courses/:id/cancel`** — body `{ reason: string (required, non-empty) }`.
   - Deletes the course's remaining **`PENDING`** sessions. **`reconcileCoursePlan` must NOT run** — this is the
     whole point. Ending early is a **forfeit, not a reschedule**; if a make-up gets re-owed the feature is wrong.
   - **Touches nothing delivered:** `ATTENDED` / `EXTENDED` / `SICK_LEAVE` / `CANCELLED` rows stay exactly as they are.
   - **`used_sessions` unchanged. No ledger write, no revenue reversal, no notification.** Revenue posted at sale
     stays posted — reversing it is a finance decision nobody has made.
   - Records `reason` (+ actor) so the course history shows **who ended it and why**.
   - **Idempotent:** a course with no remaining `PENDING` returns "already ended / nothing to remove", not an error.
2. **FE: a `ยกเลิกคอร์ส` button** on the course card / plan modal, with a confirm dialog that states, in words:
   **the student's name · how many sessions will be removed · that it cannot be undone**, and a **required reason
   box** (button disabled while empty).

### Explicitly OUT — do not build, do not sneak in
Refund / credit / partial-refund maths · any `bo.movement` write · notifying the parent · re-owing anything ·
bulk cancel · cancelling someone else's course from the same screen.

### 🔒 "รัดกุม" means these five, and a reviewer should check them by name
1. **No make-up is ever re-owed.** (The single most likely way to get this wrong — the existing cancel path does
   exactly the opposite by design.)
2. **Delivered history is immutable.** Nothing already taught changes state or count.
3. **Reason is mandatory** — server-side, not just the form.
4. **One course, by id.** No predicate, no cascade to the student, parent, or other courses.
5. **The confirm dialog names the human**, not a count alone: *"ยกเลิกคอร์ส Surfskate ของ ยูจีน — จะลบคาบที่เหลือ 8 คาบ
   ทำแล้วย้อนกลับไม่ได้"*.

### 🏃 To fit the window: the contract is FIXED HERE so BE and FE build in parallel
**Request** `POST /api/courses/:id/cancel` → `{ "reason": "ลูกค้าขอยกเลิก" }`
**Response 200** → `{ "cancelled": true, "removedSessions": 8, "course": <CourseDTO> }`
**409** `ALREADY_ENDED` → `{ "cancelled": false, "removedSessions": 0 }` · **400** `REASON_REQUIRED`.
**@Jason takes the BE, @Fern takes the FE, at the same time.** Neither waits for the other.

### ➕ AMENDMENT — owner, same session: **the reason is a CHOICE, not free text**
> *"ลูกค้ามีการแจ้งแอดมินเปลี่ยนกิจกรรมด้วย หรือ ยกเลิกไม่เอาแล้ว หรือ แอดมินพิมพ์ผิดเอง ต่างๆ ต้องยกเลิกได้"*

Three real reasons, and **they are not the same event** — they differ in what should happen to the money later:

| choice | meaning | what the money means (LATER, not tonight) |
|---|---|---|
| `PROGRAM_CHANGED` | ลูกค้าเปลี่ยนกิจกรรม | **carries over** to the replacement course — not a refund |
| `CUSTOMER_CANCELLED` | ลูกค้าไม่เอาแล้ว | a **settlement** — refund or credit, owner decides per case |
| `ADMIN_ERROR` | แอดมินคีย์ผิด | **the sale should never have existed** — the posted revenue is fake |

⇒ **`reason` = a required enum (one of the three) + an optional free-text note.** Free text alone would make these
three indistinguishable in the data, and **which one it was cannot be reconstructed afterwards** — the admin who
knew is the one clicking the button. **Capturing it costs nothing tonight and is impossible to recover tomorrow.**

**Still NOT building money tonight** — no refund maths, no ledger write. But `ADMIN_ERROR` in particular means
**revenue was posted at sale for a course that never should have existed**, so those rows must be *findable* later.
Recording the enum is what makes that possible. (Contract: `{ reason: "ADMIN_ERROR", note?: string }`.)

**AC-6** — the three reasons are distinguishable in the data and in the course history, and `ADMIN_ERROR` courses
can be listed with one query.

---

## 🔒 RIGOUR PASS — owner gave +40 minutes and asked for **รัดกุม รอบคอบ**
Not more feature. **More certainty about the same feature.** Five additions, each checkable by name.

### R1. 🔴 Soft-cancel, not delete — **the biggest call in this REQ, and it is @Sober's to make**
The scope above said *"deletes the remaining `PENDING` sessions"*. **With time to think, deleting is the wrong
default.** Prefer: **set them to `CANCELLED` with the end-reason, and do not run `reconcileCoursePlan`.**
- **Nothing is destroyed.** An `ADMIN_ERROR` cancel can be inspected — and undone — tomorrow. A deleted row cannot.
- The history stays truthful: *"these sessions existed and were ended on 24/8 because X"* is a fact worth keeping.
- **It is the same one-line risk either way** — the danger was never the delete, it is the re-owe.
⚠️ **@Sober must verify one thing before choosing:** do `CANCELLED` sessions **disappear from the calendar** and
**stop holding the teacher's slot**? If they still render, staff will see ghost classes and the feature fails its
purpose. `scheduler.service.ts:2374` already excludes `CANCELLED` from at least one query — **confirm it is the
one that matters, do not assume.** If they do render, delete is the correct fallback and we accept it knowingly.

### R2. The confirm dialog is powered by the SERVER, not by the client's guess
`POST /courses/:id/cancel/preview` — same shape, **writes nothing**, returns exactly what the real call would do:
`{ removedSessions, sessions: [{date, time, teacher}], student, program }`.
**This is the team's own proven pattern** (`db:reset`, `import:students`, `course:cleanup`, plan-preview) and it is
what the owner has trusted a dozen times. **The dialog must show what the server will actually do — not what the
front end believes it will do.** The two have disagreed before.

### R3. The refusal list, explicit — refuse, do not warn
- Course **already ended** (`409 ALREADY_ENDED`) — idempotent, not an error to the user.
- **Nothing remaining to cancel** (every session already delivered) — say so; changing nothing is the right outcome.
- **`reason` missing or not one of the three enum values** (`400 REASON_REQUIRED` / `400 INVALID_REASON`) —
  **server-side**, never trusting the form.
- **Course id not found / belongs to nobody** — 404, no partial work.
Everything runs in **one transaction**: a refusal leaves **zero** rows changed.

### R4. What must be provable by test, not by reading
1. **No make-up is re-owed.** Plan count before vs after — `size` and end-date unchanged, **no `EXTENDED` row
   appears.** ← *the one way this ships wrong; the existing cancel path does the opposite by design.*
2. **Delivered rows are byte-identical after the call** — `ATTENDED` / `EXTENDED` / `SICK_LEAVE` untouched.
3. **`used_sessions` unchanged.**
4. **No `bo.movement` row is written** — assert the ledger count is identical.
5. **Idempotent** — second call changes nothing and reports it.
6. **Each of the three reasons round-trips** and is distinguishable in the course history.

### R5. The owner's post-deploy check, written before the deploy so it cannot be improvised
On `sid`, on a throwaway course: **preview → read the named sessions → cancel → confirm** the plan shows **0
remaining, no new `EXTENDED`**, `used_sessions` unchanged, and the history names **who, when, why**. Then re-run and
confirm nothing changes. **Only then does it go near `uat`** — where the first real use is a real family's course.

### One thing deliberately still OUT, so nobody adds it under time pressure
**No money movement of any kind.** Not a refund, not a credit, not a reversal — even for `ADMIN_ERROR`, where the
revenue is genuinely fake. **Recording the reason is what makes cleaning that up possible later**; doing it tonight
would be inventing a finance policy at speed, which is exactly how this project has hurt itself before.

---

# 🔴 REQ-036 PART B — owner, 2026-08-25 00:1x. **The cancel is not finished.**
Found by the owner within minutes of the acceptance pass, by using the product rather than reading the numbers.
**All three items below are the same failure: the course is ended in the data and nowhere else.**

## B1. 🔴 An ended course still accepts writes — **this is the defect, the rest is presentation**
**Proven on `sid`:** after ending มิลล่า's course (`ended_at` set, `end_reason ADMIN_ERROR`, 6 sessions cancelled),
pressing **`เพิ่มคาบ (คิดเงิน)`** **succeeded** — a new **25/Aug 09:00 Onewheel E-Skate** session now sits on the
cancelled course. `addExtraSession` (`scheduler.service.ts:920`) has **no `ended_at` check**, and it creates a
**`SINGLE_SESSION`** — which posts revenue at day-end once it is `ATTENDED`. **A cancelled course can still take
money.**

⚠️ **Sober's earlier note — *"re-booking is already server-guarded (`insertable=false`)"* — is true for the plan
path and does NOT cover this one.** Extra-session is a different door. **Assume there are others.**

**Requirement: an ended course refuses EVERY write, server-side.** Not a disabled button — buttons are not the
only door. Sweep and guard: `POST /courses/:id/extra-session` · `POST /courses/:id/plan` (insert make-up, move,
edit) · anything else that writes into a course or its sessions. Return `409 COURSE_ENDED` with a message naming
why. **@Sober — enumerate the write paths from the routes, do not take my list as complete.**

- [ ] **AC-B1** — Given an ended course, every write path returns `409 COURSE_ENDED` and **changes nothing**.
- [ ] **AC-B2** — The `25/Aug` stray session created on `sid` during this test is removed or explained.

## B2. The course CARD must say it is cancelled
Today the card shows a green **`ปกติ`** badge on a cancelled course — **the single most misleading thing on the
screen.** Staff decide from this card.
**Requirement:** when `ended_at` is set, the card shows **`ยกเลิกแล้ว`** (not `ปกติ`), visually distinct from a
normal course, and `จัดการแผน` either opens read-only or is not offered. The BE **already emits** `endedAt` /
`endReason` on the course DTO (`contract.ts:111-112`) — **this is FE type + mapper only**, the TASK-179-Q2 pattern.
Also fix the plan-modal header, which now reads **`สิ้นสุด ยังไม่มีคาบ`** — it reads like a course that never
started, on one that was deliberately ended.

## B3. Filter the course list: **active / inactive, default `active`**
The list will fill with dead courses; staff should not have to look at them.
**Default = `active`.** Owner's instruction.
❓ **One decision needed — Porter is NOT assuming it:** does **`inactive`** mean *cancelled only*, or also
**expired** (past `expires`) and **fully used** (`used = size`)? All three are "done with", but only one is a
*decision someone made*. **Ask the owner; do not infer.** Porter's lean: **cancelled + expired** are inactive;
**fully used** stays active until it expires, because a finished course is still a live customer relationship.

- [ ] **AC-B3** — The list defaults to active only; switching to inactive shows the ended/expired ones; the count
      of the two together equals the unfiltered total (nothing is hidden by both).

## B3 — ANSWERED by the owner: **not a toggle. A proper status type that covers every case.**
> *"แยกประเภทไป ทำประเภทขึ้นมาคลุมเลย"*

**Four statuses, first match wins:**
| status | ไทย | rule |
|---|---|---|
| `CANCELLED` | **ยกเลิกแล้ว** | `ended_at` is set |
| `COMPLETED` | **เรียนครบแล้ว** | `used_sessions >= size` |
| `EXPIRED` | **หมดอายุ** | past `expires`, with sessions still unused |
| `ACTIVE` | **กำลังเรียน** | everything else (default filter) |

**Why that precedence:** `CANCELLED` is a **decision a human made** and outranks any computed state.
`COMPLETED` beats `EXPIRED` because a family that used all their sessions has no problem — while
**`EXPIRED` with sessions left is a family that paid for classes they never got.** Collapsing those two would hide
the only one that costs the customer money. (Worth surfacing on the attention list later — **not this REQ.**)

### 🔴 Compute it ON THE SERVER, put it on the course DTO
There is **no course-status concept in the BE today** — `ปกติ` is derived in the FE. If we leave it there, **the
badge and the filter each compute "is this course over?" separately and will drift**, which is how the `ปกติ`
badge came to sit on a cancelled course in the first place.
⇒ **One `status` field on the DTO. The badge renders it; the filter filters on it. One definition, one place.**
This makes **B2 and B3 the same piece of work**, not two — the owner asked for a badge and a filter and the honest
answer is they are one thing.

- [ ] **AC-B4** — `status` is computed server-side and returned on the course DTO.
- [ ] **AC-B5** — The card badge renders that field verbatim; **no status logic in the FE**.
- [ ] **AC-B6** — Filter defaults to **`ACTIVE`**; the four filtered counts sum to the unfiltered total (**nothing
      falls between two categories, nothing lands in both**).
- [ ] **AC-B7** — A course that is both expired and fully used reads **`COMPLETED`**; a cancelled course reads
      **`CANCELLED`** regardless of its dates or usage.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-036 | End a course early — the `ยกเลิกคอร์ส` button (owner cut scope, build-now 2026-08-24) | 🔴 HIGH | ✅ **DELIVERED 2026-08-25** — built overnight from the owner's 30-minute ask, then hardened twice. Cancel button + **server guard refusing every write on an ended course** (machine-checked route enumeration — a new unclassified write route now fails the test) + **four-status list** (`ACTIVE`/`COMPLETED`/`EXPIRED`/`CANCELLED`, computed server-side; badge and filter read the ONE field) + reason enum (`PROGRAM_CHANGED`/`CUSTOMER_CANCELLED`/`ADMIN_ERROR`). Tanya `TEST_PASSED` on `sid` (TEST-058/059); re-checked on `uat`: **Active 151 · Completed 18 · Expired 2 · Cancelled 0**, leave-locked course renders **ACTIVE + a separate LOCKED chip** on real data. ⚠️ Shipped knowingly: 375 badge clip · the other two reasons not individually round-tripped · rental toggle item inert until TASK-190. _Prior:_ **Part A CODE-COMPLETE + `sid`-accepted (owner's before/after table all ✅, no money moved, no re-owe); Part B: **TASK-185 (BE B1 🔴🔴 money) ✅ DONE (Sober 2026-08-25, 795/0)** — `assertCourseWritable`→409 COURSE_ENDED at the createBooking chokepoint; enumeration is a machine-checked completeness test (all 44 routes, fails on omission); rentals/updateCourse calls accepted. **Live `sid` re-break check (extra-session on cancelled course→409, zero rows) = Part B acceptance → @Tanya via @Porter.** + **TASK-183 (FE B2) ✅ DONE (Sober 2026-08-25) — root cause was dtoToCourseView dropping the fields; now required on the view type; ENDED badge first, write actions withdrawn; rendered pass rides @Tanya** + B3 (owner overruled the binary → **computed four-status** CANCELLED→COMPLETED→EXPIRED→ACTIVE, server-side single source for badge+filter; AC-B6 counts sum to total): **TASK-188 (BE) ✅ DONE (Sober 2026-08-25, 806/0 — pure rule, AC-B6 partition-tested) + TASK-189 (FE) ✅ DONE; TASK-186 SUPERSEDED. **REQ-036 FULLY CODE-COMPLETE (A+B1+B2+B3) — last gate = @Tanya rendered pass on B2/B3 + owner residual cleanup****. B1 verified LIVE on sid (billing hole closed); Part A signed by Tanya (TEST_PASSED sid). SA owns the Part-A miss: R4 tested the action not the resulting state.** TASK-181 (BE) ✅ + TASK-182 (FE) ✅ (Sober-reviewed 2026-08-24) · needs @Tanya rendered/live pass + owner deploy `0023` (sid-first, migration before code) — **FE:** `ยกเลิกคอร์ส` on the plan modal's course footer, red and apart from the add-a-session actions, **opens a confirm instead of acting on the click**; renders only for `isCourse && !isCreate` with `courseId = plan.id`, so it is **structurally incapable** of ending another course from the same screen. Dialog re-calls **`/cancel/preview` on every open** (never cached — a stale preview could describe a changed plan) and renders REQ-036's sentence from **the server's** numbers: 🔴 **no client re-count anywhere** (R2; the two have disagreed before and this is irreversible). Reason = the three contract values (`Radio.Group`) + optional note, **Confirm disabled until one is picked with the reason for the disabling stated on screen**; no fourth invented. **`alreadyEnded`** → says so and **omits the Confirm button entirely** rather than offering one whose only outcome is a 409. Server refusals show the **server's own** message; success invalidates everything (owed→0, sessions gone) and closes the plan. tsc **0** · build ok · **40/0** · §3.5 0/0/0/0. 🔴 rendered → @Tanya, **deserves a real pass** (irreversible; the previewed number IS the safety mechanism) — test on a course that took a **leave** so the count and what disappears are compared on the same course. **Fern's Q1:** nothing marks a course *ended* afterwards — the plan just returns empty, so a cancelled course reads like a finished one; an `ended` flag + reason on the summary would let it say *cancelled — {reason}*. Follow-up. | Owner asked for it live (~40 min, rigour window). Porter fixed the contract; SA owns R1+Q3. **R1 = SOFT-CANCEL not delete** (verified: `getCalendar:407` excludes CANCELLED + slot-block frees it → sessions vanish from calendar & free slot, nothing destroyed). **Q3 = a new `endedAt` flag not size-reduction** (soft-cancel alone leaves `owedCount = size−current` non-zero → staff re-insert → re-owe; `endedAt` guards `owedCount→0`/`insertable→false`/`reconcile→no-op`, keeps purchased `size` honest per REQ-064). `POST /courses/:id/cancel {reason:enum,note?}` → 200 `{cancelled,removedSessions,course}` · 409 ALREADY_ENDED · 400 REASON_REQUIRED/INVALID_REASON · + `/cancel/preview` (server-powers the dialog). NO refund/credit/ledger/notify (recording the reason enum = `ADMIN_ERROR` findable later). R4: 6 tests, #1 = **no make-up re-owed**. **OUT (owner/Porter):** Q1 which-course, Q2 refund decision. |
```
