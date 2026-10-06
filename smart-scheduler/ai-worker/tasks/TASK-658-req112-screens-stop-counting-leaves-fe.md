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

---

# 📋 BUILD REPORT — @Fern → @Sober (2026-10-06) — **TASK-658 DONE: no screen says quota, locked or "x of y" about a leave.**

**Front repo re-read first, and the tree was CLEAN (nothing uncommitted of anyone's) before I started.** The **owner's approval is recorded** in `COPY-REVIEW §T-658` ("ตามแนะนำ", line 461) — checked before reporting, as you asked. **D6 and D14 built as chosen.** 🚫 **No string was "improved" on the way in.**

## §3.1 The three gates, separately
| gate | result |
|---|---|
| **`tsc --noEmit`** | ✅ **exit 0** |
| **`bun test`** | ✅ **1053 pass / 0 fail across 117 files**, and **0 "unhandled error between tests"** (see §5 for why I count that) |
| **`bun run build`** | ✅ **exit 0** |
**Break-and-watch: 17 mutations, 17 BITES, 0 SURVIVED, 0 NO RESULT, 0 ANCHOR, baseline 94 clean, CHECKSUM identical.**

## §3.2 The grep, stated — and the test that keeps it true
- **A test over the WHOLE dictionary, both languages, not a scope list:** `src/lib/i18n/leave-copy-no-quota.test.ts`. It bans *quota · locked · unlock · relock · `{quota}` · `{used}/{quota}`* and, in Thai, *โควตา · ปลดล็อก · ล็อก* — **with the Thai lookbehinds that make it honest**: ล็อก is also *แคตตาล็อก* (catalogue) and *บล็อก* (block), and a ban that cried wolf on those would be switched off within a week (**Q16 removes the lookbehind and bites**).
- **The allowlist is FOUR, not the three I estimated, and the derivation is why:** `plan.locked` (an attended session is frozen) · `course.createdAlertTitle` (*schedule locked* on a new course) · **`voucher.infoAlert` and `bookings.vouchersHint`** (*vouchers don't lock a teacher or time* — about what a voucher IS). **Each has a written reason, each is asserted to STILL match the ban (a stale entry fails), and the SIZE is asserted** (**Q17** adds a fifth and bites) — *a quietly growing allowlist is how a ban like this dies.*
- **Grep of CODE** (`src`, non-test, comments excluded) for *โควตา · leave quota · ปลดล็อก · unlock* outside the dictionary: **0 hits** — nothing is hard-coded past `t()`.
- **Self-proving:** the ban is run on fixtures (it catches *Leave quota*, *ลาเกินโควตา*, *Unlock (admin)*, *ปลดล็อก (แอดมิน)*, *`{used}/{quota}`* and does NOT catch *แคตตาล็อก*, *บล็อกของวันแล้ว*, *blocked*), so "zero hits" cannot mean "the regex is broken" (**Q15** blinds the Thai regex and bites).

## §2 What was built
**DELETED (no copy needed, all in `COPY-REVIEW §T-658`'s GO):** the whole **UNLOCK/RELOCK flow** — 14 dictionary keys × 2 languages, the confirm `Modal`, `useSetCourseAdminUnlock`, `setCourseAdminUnlock` (service + mock) · the card's **quota block** (label, *N left*, progress bar, colour) and **lock/special-unlock badges** · the `locked` toast and its two keys · `plan.leave` and its summary line · `bookings.coursesHint` (the layout keeps the buttons on the right) · **`undo.previewLeaveBack` and `undo.previewExpiry`** · **the expiry-edit preview's *"room for N leaves"*** (`expiry.previewLeaveOk/Tight`, the display, the `ExpiryLeaveRoom` type, the mock) — **the half that is still TRUE (`expiryWarning`, the sessions a date would fall outside) stays.**
**REPLACED, exactly as approved (both languages):** D1 `leaveMsg` · D2 `leaveMsgNoCourse` (a pure deletion of its quota clause) · D3 `leaveMsgCourseDeclared` (now says the end date moves one week) · D4 `leaveExtendedDesc` · **D6 `course.usage` = *Valid until week {week}* / *ใช้ได้ถึงสัปดาห์ที่ {week}*** · D7 `sizeOption` · D8 `infoAlert` · D9 the import field · D10 · D11 · D12 (EN only) · D13 · **D14 (โควตา → ยอดคงเหลือ in the three Undo bodies)**.
**Code:** the leave dialog has **THREE bodies, not four** (the locked one is gone with its constant, its mapper fact `courseLeaveLocked` and its type field) · `leave.ts` has no quota arithmetic, no lock, **no `canTakeLeave`** · `leaveRemaining` / `leaveLocked` / `adminUnlocked` are gone from every type a screen reads (`contract.ts` keeps `locked?` and the Undo's `leaveRefunded?` / `expiry?` **optional and unread**, because the server still sends them) · **`LEAVE_QUOTA_BY_SIZE` → `EXTRA_WEEKS_BY_SIZE`** (it stopped being a quota; the wire name `leaveQuota` is unchanged) · the import field's **dictionary KEYS were renamed too** (`importBalance.leaveQuota` → `extraWeeks`) — *a key that still says "quota" is a lie for the next reader.*
**Not built, by your ruling:** D5 (the screen toast for "a make-up cannot fit") — the admins get a LINE notice and a refused leave arrives as the server's own sentence.

## §4 🔑 The finding that is NOT a quota string: the field that must survive
**`leaveQuota` on the import form is relabelled, NOT removed — and nothing in the suite would have noticed if it had been.** The wire-name pin checks that keys the form sends reach the service; it cannot see a key the form STOPPED sending. So I added a pin asserting it **three ways** (rendered with the new label · sent at **both** call sites, preview and commit · forwarded by the service). **Q4 and Q5 each remove one site and each bites.** *A tidy-up that deleted "the quota field" would have silently broken every off-card import.*

## §5 ⚠️ A module-level import error silently DROPS a whole file — and I nearly reported green over one
`leave-claim.test.ts` imported `LEAVE_MSG_COURSE_LOCKED`, which no longer exists. **That does not fail a test — it deletes every test in the file**, printing one *"unhandled error between tests"* line and a count that is merely lower. 🔑 **I caught it only because I read the log rather than the summary.** I rewrote the file: **17 tests before, 17 after** (counted on the file, `git show HEAD:` vs now) — the lock's seven tests became the pins that it STAYS gone. **The report now states `unhandled-between-tests: 0` for exactly this reason**, and it is the second time this has hidden a file from me (TASK-593).

## §6 Declared pin updates — every one with its reason in the file
| file | what moved | why |
|---|---|---|
| `approved-copy.test.ts` | 31 → **28 rows**; 3 rows deleted (`leaveMsgCourseLocked`, `previewLeaveBack`, `previewExpiry`); 4 re-approved by value (D2 D3 D13 D14); the 09-28 marker count ≥3 → ≥2 and the new `§T-658` marker count ≥10 | the model under them changed; the pin's claim (the owner's words, by value) is unchanged |
| `leave-claim.test.ts` | rewritten, **17 → 17** | the lock is gone; its tests became absence pins |
| `undo-preview.test.ts` | nine keys → seven; the three-fact line test → *one* line + *no line for `leaveRefunded`/`expiry`*; `previewNothingElse(ok({leaveRefunded:true}))` false → **true** | no quota to return; the Undo never moves the end date |
| `undo-control.test.ts` | `undo` keys 21 → **19**; the REQ-073 `leaveMsg` byte-pin → D1 by value | two forecast lines deleted; the old sentence is false |
| `undo-control.dom.test.tsx` | the clicked forecast: server sends all three facts, **only the make-up renders**, the other two asserted ABSENT **by count** | same |
| `expiry-preview.test.ts` | *"the leave verdict is the server's boolean"* → *"nothing about a leave count is read"*; *"the SPENT case renders no leave line"* → *"there is no leave line at all"* | `leaveRoom` is gone from the server and the screen |
| `mapper-drops.test.ts` | course drops 17 → 15, total 28 → 26, summary fields 19 → 16; `leaveLocked` read asserted **false** | the two lock-recomputation drops left with the lock |
| `course-rental.test.ts`, `duo.test.ts` | stale fixture fields removed | the fields no longer exist |
📌 **Under @Porter's TASK-638 rule a co-located test comes with its file — and I did NOT touch `teacher-scope.test.ts` (frozen until TASK-653).**

## §7 ⚠️ For you — four things, none blocking
1. **Files outside the 16-file list that I touched, because your inventory said to:** `Bookings/BookingsContent.tsx` (the `coursesHint` delete) · `Bookings/CreateCourseModal.tsx` (the size option and the blue line) · `Bookings/EditExpiryDialog.tsx` (the `leaveRoom` display) · `hooks/scheduler/useScheduler.ts` (the unlock hook) · `lib/scheduler/undo-preview.ts`. **The tree was clean when I started, so there is no uncommitted collision — but if Team B holds any of them this batch, say so and I will hand it over.**
2. **A SERVER sentence still says quota:** the Undo's *`UNDO_LEAVE_CHARGE_UNKNOWN`* refusal (§T-G, owner-approved 10-04) reads *"…ไม่ทราบว่าการลานี้ใช้โควตาลาหรือไม่…"* — it is the server's, the screen shows it verbatim, and my dictionary test cannot see it. **It may be exactly right for a pre-migration leave, or it may be the last quota sentence in the product — that is a question for @Jason/@Porter, not for me to rewrite.**
3. **The card shows the server's week as sent.** I read `maxWeek` and nothing else, so **a card whose expiry was moved earlier now says the earlier week — which is what the owner's *"valid until"* requires.** (The *offline/mock* `toCourseView` still uses the base-window table; that is demo data only.) 📌 **Nothing in my sentences promises a make-up past the end date or a held make-up — asserted by test over the leave strings.**
4. **Honest limit of the ban:** it reads the dictionary and the code for the **words**; it cannot know that a *sentence* has become false for a reason that is not a word (the way D3 changed meaning while keeping its words' shape). That is what the by-value approved set is for.

## Mutation test list (recorded here until TASK-637 lets the set carry it)
```
src/lib/i18n/leave-copy-no-quota.test.ts
src/lib/i18n/approved-copy.test.ts
src/lib/scheduler/leave-claim.test.ts
src/lib/scheduler/undo-preview.test.ts
src/lib/scheduler/undo-control.test.ts
src/components/common/undo-control.dom.test.tsx
src/lib/scheduler/expiry-preview.test.ts
src/lib/api/mapper-drops.test.ts
```
📌 **Eight files, and I derived them rather than typed them:** each mutation in `scripts/mutation/task-658.json` was assigned to the file that holds its pin, **and Q7/Q8 (restoring a deleted key's call site) only bite because of the *deleted-keys* pin in `leave-copy-no-quota.test.ts`, which first SURVIVED and is why that pin exists.**

| # | mutation | verdict |
|---|---|---|
| Q1 | 🔴 the card's *"Used {used}/{quota}"* is restored | **BITES** 92/2 |
| Q2 | 🔴 the unlock control returns (its icon with it) | **BITES** 93/1 |
| Q3 | 🔴 a leave claim says it *uses a leave* again | **BITES** 90/4 |
| Q4 | 🔴 the import PREVIEW stops sending `leaveQuota` | **BITES** 93/1 |
| Q5 | 🔴 the import COMMIT stops sending `leaveQuota` | **BITES** 93/1 |
| Q6 | 🔴 the `locked` toast is restored | **BITES** 92/2 |
| Q7 | 🔴 the plan's *"Leave {used}/{quota}"* is restored | **BITES** 93/1 |
| Q8 | ⚠️ the list hint about the quota/lock returns | **BITES** 93/1 |
| Q9 | 🔴 the Undo forecast says *return the leave to the quota* | **BITES** 90/4 |
| Q10 | 🔴 the expiry preview renders the leave-room line | **BITES** 90/4 |
| Q11 | ⚠️ D6 overwritten with the draft it replaced | **BITES** 93/1 |
| Q12 | 🔴 D3 stops saying the end date moves | **BITES** 91/3 |
| Q13 | ⚠️ a lock fact is carried on a booking row | **BITES** 92/2 |
| Q14 | 🔴 `canTakeLeave` is re-exported | **BITES** 93/1 |
| Q15 | 🔴 the Thai ban goes blind | **BITES** 92/2 |
| Q16 | ⚠️ the ban cries wolf on *catalogue* | **BITES** 92/2 |
| Q17 | ⚠️ the allowlist grows by one | **BITES** 93/1 |

## Files
- **Edited (28):** the card, list, create/import/plan/history screens, `BookingModal`, `EditExpiryDialog`, `leave.ts`, `leave-claim.ts`, `undo-preview.ts`, mappers, service + mock + data, hook, both type files, the dictionary, and 11 test files (§6).
- **New:** `src/lib/i18n/leave-copy-no-quota.test.ts` (11 tests: the ban, the allowlist, the approved set by value, the code sweep, the import-field pin, the deleted-keys pin) · `scripts/mutation/task-658.json` (Q1–Q17).
