# TASK-658 — FE: **REQ-112 — no screen says "x of y leaves" or "locked" any more; every leave sentence tells the NEW truth** — @Fern, Wed–Thu
**From @Sober to @Fern.** ⚖️ **REQ-112 §11 + §⚖️ 2026-10-06 (owner rulings, IN FORCE). The back end is `TASK-656` / `TASK-657` (@Jason).** **What changes for the screens, in one line: there is NO leave quota any more — every leave adds ONE WEEK to the course's expiry; nothing is ever "locked"; the base weeks (4⇒5 · 6⇒8 · 10⇒13) stay.**
✅ **Claim (Team A):** the 16 front files that read the counter — `Bookings/CourseHistoryModal.tsx` · `Bookings/CoursePackagePanel.tsx` · `Bookings/CreatePlanFlow.tsx` · `Bookings/ImportBalanceModal.tsx` · `Bookings/PlanModal.tsx` · `Calendar/Modal/BookingModal.tsx` · `lib/api/mappers.ts` · `lib/scheduler/course-lifecycle.ts` · `lib/scheduler/leave-claim.ts` · `lib/scheduler/leave.ts` · `lib/mock/data.ts` · `services/scheduler.mock.service.ts` · `services/scheduler.service.ts` · `types/api/contract.ts` · `types/app/scheduler/index.ts` · and **the quota/lock keys** in `lib/i18n/dictionaries.ts` — with co-located tests. 🚫 **Not `teacher-scope.test.ts` (frozen until `TASK-653`).** 🚫 **No Team B file** — if a Team B screen shows the counter, LIST it for me.
🔴 **SHIP-SET with `TASK-656` + `TASK-657` — sid batch #2.** 🔑 *A screen still showing "2 of 4 leaves used" after the rule is gone is worse than no screen at all* — @Porter's biggest fear for this round, and mine.

---

## 1. 🔴 WEDNESDAY FIRST — the INVENTORY, and the DRAFTS, to me by end of day
**Many of these strings are OWNER-APPROVED (`✅ APPROVED 2026-09-28 …`) and are now FALSE.** **Approved strings are never "improved" — but a false one must be REPLACED, and a replacement is new copy the owner approves.** ⇒ **so the copy goes to him FIRST, as one set, via @Porter.**
▶️ **Deliver a table** — every string (TH + EN) and every control that mentions or depends on the quota / lock / "x of y" / "uses quota" / "returns to quota":
| key / control | file:line | says today | why it is false now | **proposal: DELETE · KEEP · REPLACE with DRAFT** |
**What I already found, so you start ahead (not the full list):** `course.usage` *"Used {used}/{quota} · extendable to week {week}"* · `…leave` *"Leave {used}/{quota}"* · `leaveLockedTitle/Desc` · the quota-size hint *"4 → 1 · 6 → 2 · 10 → 3 · exceeding it locks…"* · `unlockConfirmMsg` / `relockConfirmMsg` (the UNLOCK / RELOCK controls) · `leaveMsg` *"จะใช้โควตาลาของคอร์ส 1 ครั้ง…"* · `leaveMsgCourseLocked` · `leaveMsgCourseDeclared` · `previewLeaveBack` *"return the leave to the family's quota"* · `attendanceMsg` (TH mentions โควตา) · `insertHint` *"(uses quota…)"* · `leaveQuota` / `leaveQuotaHint` (create/import forms).
**Rules for the drafts:**
- **Prefer DELETE.** A sentence that only existed to talk about the quota goes, if the screen still makes sense without it. **The card keeps "ขยายได้ถึงสัปดาห์ที่ N" — it is still true and now grows with each leave.**
- **A REPLACE says the new truth, plainly:** *a leave adds a make-up session and pushes the course's expiry one week later* — **and nothing about a limit, a lock or a quota.**
- 🔴 **The `leaveQuota` FIELD on create/import:** under the ruled model the number is the BASE of the validity window, not a leave allowance. **Propose a relabel (DRAFT) — do not remove the field: it still sets the expiry.**
- **The UNLOCK / RELOCK controls:** nothing is ever locked ⇒ **DELETE the controls** (no copy needed).

## 2. THURSDAY — build it, with the APPROVED wording only
- **Every row of your table done as approved.** 🚫 **No string ships that the owner has not approved — if one is still pending Thursday night, the old false one does NOT stay: tell me, and we decide together.**
- **The front's own rule mirrors (`leave-claim.ts`, `lib/scheduler/leave.ts`, `course-lifecycle.ts`) follow the server: no lock, no quota spend; a leave on a course ⇒ a make-up + one week.** **Pin by value that no claim ever says "quota" or "locked" again.**
- **Types/mappers:** keep `leaveUsed` as a plain COUNT if the server sends it (@Jason makes it "leaves taken"); **drop `leaveRemaining` / `leaveLocked` / `adminUnlocked` from what any screen READS.** **If the server still sends a field, the screen ignores it — 🚫 do not make the screen depend on @Jason's exact Thursday state.**

## 3. ✅ Done means
1. **FE `tsc` 0 · `bun test` with COUNTS · `bun run build` 0.**
2. **A grep, stated in the report:** no rendered string (TH or EN) in your files says โควตา / quota / ล็อก / locked / "x of y" about leaves — **and a TEST that asserts it over the dictionary**, so the next string cannot bring it back.
3. **Mutations (front runner — the test list RECORDED in this TASK file until `TASK-637` lands):** an "x of y" restored on the card · the unlock control restored · a leave claim saying "uses quota" · the `leaveQuota` field removed (must BITE — it still sets the expiry).
4. **The Wednesday table, and which rows the owner approved.**

---

# 📋 WEDNESDAY INVENTORY — @Fern → @Sober (2026-10-06) — TASK-658 §1

**Front repo re-read first.** Derived by **dumping every dictionary string (EN + TH) that mentions quota / lock / "x of y" / the expiry** (92 hits, filtered by hand to the leave-related ones) **and then grepping the CODE for every reader of `leaveUsed · leaveRemaining · leaveLocked · adminUnlocked · leaveQuota`** — not from memory. 🚫 **Nothing is built yet.** Thursday builds only what the owner approves.
**The model I wrote these against is the FINAL one:** a leave adds a make-up in the next free week · **the course's end date does NOT move** — except three cases that add one week each (absence declared before the course starts · a coach's leave · a class the school cancels with *ปัญหาจากทางเรา*) · no quota, no "x of y", nothing locked. ⚠️ **Every row that mentions the end date is marked 📅** so you can re-check it against the final ruling.

## A. What an admin reads when recording a leave (`BookingModal.handleSickLeave` → `leaveClaimKey`)
| # | key (EN line · TH line) | says today | why false now | proposal |
|---|---|---|---|---|
| A1 | `confirmAction.leaveMsg` (138 · 2294) | *"This uses one of the course's leaves and adds a make-up session at the end."* / *จะใช้โควตาลาของคอร์ส 1 ครั้ง…* | **no leave is "used"** — there is no quota; and the make-up is not "at the end", it goes to the next free week | **REPLACE** 📅 (D1) |
| A2 | `confirmAction.leaveMsgNoCourse` (148 · 2296) ✅ *approved 09-28* | *"…so no leave quota is used and no make-up session is added."* | the clause **implies a quota exists** | **REPLACE — a pure deletion of the quota clause** (D2). ⚠️ approved string, so owner approves the set |
| A3 | `confirmAction.leaveMsgCourseLocked` (154 · 2298) ✅ *approved 09-28* | *"…the course has no leave left… rescheduling stays locked until an admin unlocks it."* | **nothing is ever locked** | **DELETE** the key **and** the `LEAVE_MSG_COURSE_LOCKED` branch in `leave-claim.ts` **and** `courseLeaveLocked` in `mappers.ts` |
| A4 | `confirmAction.leaveMsgCourseDeclared` (158 · 2300) ✅ *approved 09-28* | *"…declared when the course was created, so no leave quota is used — a make-up session is still added at the end."* | no quota; and **this is one of the three cases that adds a week** | **REPLACE** 📅 (D3) |
| A5 | `booking.leaveLockedTitle` / `…Desc` (1028–1029 · 3032–3033) | *"Leave over quota — rescheduling locked"* / *"…an admin must unlock it on the Bookings/Students page"* | the server never answers `locked` | **DELETE** both keys **and** the `res.locked` toast branch (`BookingModal.tsx:429`) |
| A6 | `booking.leaveExtendedDesc` (1031 · 3035) | *"Auto-created a make-up session **next week** ({date})"* | the make-up goes to the **next FREE** week, not necessarily next week | **REPLACE** (D4) — one clause |
| A7 | **NEW — needed** | — | *"a make-up that cannot fit ⇒ the admin is told"* has **no string today** | **DRAFT** 📅 (D5) — ⚠️ **I need the server's response shape from @Jason first** (see §G); I will not guess a field name |

## B. The course card (`CoursePackagePanel.tsx`)
| # | key / control (line) | says today | why false now | proposal |
|---|---|---|---|---|
| B1 | `course.leaveQuota` (1273 · 3256) + `course.leftN` (1274 · 3257) + the **progress bar** + `leaveColor` (`:195`, `:281–287`) | *"Leave quota · 2 left"* and a bar | **there is no quota to be left of** | **DELETE** the whole block |
| B2 | `course.usage` (1275 · 3258) | *"Used {used}/{quota} · extendable to week {week}"* | **"x of y"** | **REPLACE** 📅 (D6): drop *Used x/y*, **keep** *extendable to week {week}* as you asked |
| B3 | `course.locked` (1252 · 3236) + `course.specialUnlock` (1253 · 3237) + the two badges (`:249–256`) | *Locked* / *Special unlock* | nothing is locked | **DELETE** keys + badges |
| B4 | **UNLOCK / RELOCK controls** — `course.unlockBtn` (1276) · `relockBtn` (1243) · `unlockConfirmTitle/Msg` · `relockConfirmTitle/Msg` · `unlockedTitle/Desc` · `unlockFailTitle/Generic` · `relockedTitle/Desc` · `relockFailTitle/Generic` (**14 keys × 2 languages**) + the confirm `Modal` + `useSetCourseUnlock` + `setCourseUnlock` (service, `scheduler.service.ts:833`) + the mock | the whole unlock/relock flow | nothing is ever locked | **DELETE** (no copy needed) |

## C. Create / import forms and the course list
| # | key (line) | says today | why false now | proposal |
|---|---|---|---|---|
| C1 | `course.sizeOption` (1283 · 3265) — the size picker | *"{size} sessions ({leave} leave · extend to week {week})"* | **a leave allowance per size** | **REPLACE** 📅 (D7): drop *{leave} leave* |
| C2 | `course.infoAlert` (1282 · 3264) | *"…· {leave} leave · extend to week {week}"* | same | **REPLACE** 📅 (D8) |
| C3 | **`importBalance.leaveQuota` + `…Hint`** (1903–1904 · 3831–3832) — the field | *"Leave quota"* — *"How many leaves this package allows"* | **it is not an allowance any more: the number is the BASE of the validity window** (`maxWeek = size + n`) | **RELABEL — field stays, it still sets the expiry** 📅 (D9). Wire name `leaveQuota` unchanged until @Jason says otherwise |
| C4 | `bookings.coursesHint` (1181 · 3169) — the list page hint | *"Leave quota depends on course size: 4 → 1 · 6 → 2 · 10 → 3 · exceeding it locks rescheduling…"* | **entirely about the quota and the lock** | **DELETE** — the screen makes sense without it |

## D. The plan editor and history
| # | key (line) | says today | why false now | proposal |
|---|---|---|---|---|
| D-1 | `plan.leave` (1332 · 3309) — `PlanModal.tsx:686` | *"Leave {used}/{quota}"* | **"x of y"** | **DELETE** the summary line |
| D-2 | `plan.insertHint` (1404 · 3370) | *"…(uses quota — no charge)"* | no quota | **REPLACE** (D10): *"(no charge)"* |
| D-3 | `plan.extraHint` (1401 · 3367) | *"…separate from the course quota. Doesn't change the course size or end date."* | no quota | **REPLACE** 📅 (D11): delete the quota clause; *end date* clause stays true |
| D-4 | `history.sumLeave` (1427 · 3386) — `CourseHistoryModal.tsx:62` | EN *"Leave **used**"* (TH *ลาไป* is fine) | *"used"* implies an allowance | **REPLACE EN only** (D12) → *"Leaves taken"*; stays a plain COUNT of `leaveUsed` |

## E. Undo (`UndoControl` / `undo-preview.ts`)
| # | key (line) | says today | why false now | proposal |
|---|---|---|---|---|
| E1 | `undo.previewLeaveBack` (746 · 2790) ✅ *approved 09-28, pinned by value* | *"return the leave to the family's quota"* | **no quota to return** | **DELETE** the key and the `leaveRefunded` push at `undo-preview.ts:55`; the server's `leaveRefunded` field is **ignored**, not read |
| E2 | `undo.previewNothingElse` (749 · 2796) ✅ *approved, pinned* | *"…no leave is returned and no make-up is cancelled"* (TH *ไม่คืนโควตาลา*) | refers to a returned quota | **REPLACE** (D13): *"…no make-up is cancelled."* |
| E3 | `undo.attendanceMsg` · `undo.checkinMsg` · `undo.leaveMsg` (737–739 · 2785–2787) ✅ *`leaveMsg` approved, pinned* | **TH only:** *…คืนคาบเข้า**โควตา**ของลูกค้า* (EN already says *"family's balance"*) | it means the **session** balance, not the leave quota — **true, but the word is the same one the test must ban**, and the two languages disagree | **REPLACE TH word only** (D14): *โควตา* → *ยอดคงเหลือ*. ⚖️ **Owner's call — low priority; if he says no, the test allowlists these three with this reason** |
| E4 | `undo.previewExpiry` (747 · 2791) ✅ approved | *"move the course expiry from {from} back to {to}"* | **still true** for the three cases that move the end date | **KEEP** 📅 — ⚠️ depends on @Jason: does undo restore the +1 week for those three? |

## F. Mentions the end date or leave days that I am KEEPING — flagged so you can re-check them 📅
| key | why it stays | what I need confirmed |
|---|---|---|
| `expiry.previewLeaveOk` / `previewLeaveTight` (*"…remaining leave day(s) still fit before this date"*) | it is about **leaves whose make-up must fit before an expiry**, which is still the model | ⚠️ **does the server's `remaining` change meaning?** (it was *remaining quota*-adjacent) |
| `teacherLeave.warning` (*"Families … told; their make-ups are added by the system"*) | true — but **a coach's leave is one of the three cases that adds a week**, and the sentence says nothing about the end date | **owner's call** whether to add *"and the course's end date moves one week later"* (optional DRAFT, not proposed as work) |
| `endCourse.dropLine` · `resumeExpiryMoved/Same` · `courseStart.warnExpiry` · `expiryMoved` | about pause/resume and moving a start date, **not** leave | none |

## G. Code (Thursday) — not strings
- **Types / contract:** `contract.ts:133–138` · `types/app/scheduler/index.ts:192–195, 309–310, 352–354, 391–395, 533–534` — **drop `leaveRemaining` / `leaveLocked` / `adminUnlocked` from everything a screen READS**; keep `leaveUsed` as a plain count.
- **Mappers:** `mappers.ts:43–46` (`courseLeaveLocked`) and `:121–130`.
- **The front's own rule mirror:** `lib/scheduler/leave.ts` (`toCourseView` derives `leaveRemaining`/`leaveLocked`; `canTakeLeave`) · `leave-claim.ts` (the LOCKED branch + its long comment) · `course-lifecycle.ts:11` (comment). 🔑 **After this the mock must stop spending a quota too** (`scheduler.mock.service.ts:303–307, 359–360, 474, 532, 560, 730, 793–794, 1178`; `lib/mock/data.ts`).
- **`LEAVE_QUOTA_BY_SIZE`** (`types/app/scheduler/index.ts:334`) is the base-weeks table; **it stays, renamed so it stops lying** (proposal: `EXTRA_WEEKS_BY_SIZE`), because `MAX_WEEK_BY_SIZE` and the create flow's `leaveQuota` payload still need it.
- **Tests that pin the old words** (each gets a *declared* update, not a quiet one): `approved-copy.test.ts` (A2, A3, A4 + `previewLeaveBack` + `previewNothingElse`) · `leave-claim.test.ts` · `undo-preview.test.ts` · `undo-control.test.ts` · `course-lifecycle.test.ts` and the fixtures that carry `leaveRemaining/leaveLocked` (`course-rental.test.ts:79`, `duo.test.ts:115`, `eligible.test.ts:23`).
- **Team B screens that show the counter: NONE found** — I searched `smart-scheduler-front/src` and `smart-scheduler-backoffice-front/src`. (The parents' LINE messages are server-side, @Jason's.)

## H. The dictionary test (Thursday)
**A test that no leave string says โควตา / quota / ล็อก / locked / "x of y" / `{used}/{quota}` again** — over an explicit scope (`confirmAction.leave*` · `booking.leave*` · `course.*` · `plan.*` · `history.*` · `importBalance.*` · `bookings.coursesHint` · `undo.*`), with an **allowlist of exactly the strings that say "lock" about something that is NOT a leave**, each with its reason, **and the allowlist's size asserted** (a quietly growing allowlist is how the test dies):
`plan.locked` (*"Attended — locked"*: an attended session is frozen) · `course.createdAlertTitle` (*"…schedule locked"*: the generated schedule) · `course.courseSubjectLocked` (a course's subject is fixed) · + E3 **if the owner declines D14**.

## I. Questions for @Jason — I will not read his repo for these (TASK-658 §2: *the screen must not depend on his exact Thursday state*)
1. **The leave response:** does `locked` disappear from the answer, and what is the shape when a make-up **cannot fit**? (A5/A7 depend on it.)
2. **`leaveUsed`:** does it keep meaning *leaves taken*? **`leaveQuota`:** does the wire name stay for the create/import body?
3. **Undo:** does it restore the +1 week for the three cases (E4), and is `leaveRefunded` still sent (E1)?
4. **`expiry.preview*.remaining`:** does it change meaning (F)?
