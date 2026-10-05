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
