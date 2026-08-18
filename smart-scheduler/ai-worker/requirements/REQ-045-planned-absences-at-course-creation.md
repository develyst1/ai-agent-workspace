# REQ-045: Mark planned absences while CREATING the course — not only after it exists
- Status: **READY_FOR_SA** (unblocked 2026-08-16 — owner picked **(B)**)
- Priority: **HIGH** — this is how admins say they actually work, on the screen they use most
- Requested: 2026-08-16 by stakeholder (owner), from a customer meeting
- Deadline: none stated
- Source: owner, 2026-08-16 — *"ตอนสร้างคอร์ส ต้อง manage ลาล่วงหน้าได้เลย แต่ไม่ตัดโควตาลา … ส่วนใหญ่จะลงเหมือนว่า
  week ที่ 3 ไม่มาแน่ๆ ก็แก้ไปเลยว่าไม่มาแน่ๆ แล้วเอาไปต่อ week สุดท้าย เหมือนตอนแก้ไขเลย"*

## Problem / Goal
When a family registers, they often **already know** which week they cannot come ("week 3 we're away"). Today the
**create-course** screen only lets staff **change a date** — so to express "week 3 doesn't happen, push it to the
end" the admin has to hand-shuffle every following date. It is fiddly enough that, in the owner's words, **admins
mostly don't do it** — they create the course and fix it afterwards, or don't fix it at all.

Meanwhile the **plan editor** (REQ-030) does exactly this in one click: mark the session as a planned absence, the
course extends, the end date follows. **Goal: the same action, available at creation time.**

## Requirement
1. **The create-course screen can mark one or more sessions as a planned absence**, before the course is saved.
2. Marking one behaves **exactly like the plan editor's planned absence** — the session is not scheduled, one is
   appended at the end, the stated end date moves out, and the **total number of sessions is unchanged**.
3. The staff member **sees the resulting plan before saving** — the same preview REQ-030/OBS-3 established
   ("your plan will become …"), so the course is created right the first time.
4. The extension ceiling (`MAX_WEEK_BY_SIZE`) still applies and is **refused with a reason**, never silently
   truncated.

## 🔴 The open question this REQ is BLOCKED on — the owner just reversed an earlier decision
The owner now says planned absences **must NOT consume the leave quota** (*"แต่ไม่ตัดโควตาลา"*).
**That is the opposite of what he decided during REQ-030** (REQ-030 `## Questions` Q1, answered *"ควรสิ"*):

> a planned absence **DOES consume the leave quota** — it increments `leaveUsed` and **earns the extension** — but
> going **over** quota this way **does NOT lock the course**.

This is not a detail to quietly re-write, because **in the current design the quota is what drives the extension**.
If a planned absence stops consuming quota, we must say what earns the extension instead, and what — if anything —
now limits how far a course can be pushed out. Three readings, and I will not guess between them:

- **(A)** Planned absences are **free and unlimited** — they never touch `leaveUsed`; only the extension ceiling
  (`MAX_WEEK_BY_SIZE`) limits them. Sick leave keeps its quota.
- **(B)** Planned absences are **free only at creation time** (declared up front, before the course runs); marking
  one **later** still consumes quota as decided in REQ-030.
- **(C)** The REQ-030 decision stands (quota consumed, never locking) and *"ไม่ตัดโควตาลา"* really means *"it must
  not **lock** the course"* — which is already true today, and then this REQ is only about the creation screen.

**Porter's lean: (B).** It matches what he described — the family declares up front, honestly, at registration — and
it keeps the quota meaningful for absences that appear mid-course. But this is a commercial rule about what families
are owed, so it is the owner's call, not mine.

## Acceptance Criteria
*(AC-1..4 hold under any answer; AC-5 is written for **(B)** and must be re-stated if the owner picks (A) or (C).)*
- [ ] **AC-1** — **Given** the create-course screen with a 6-session weekly course, **When** staff mark week 3 as a
      planned absence, **Then** the preview shows **6 sessions** with week 3 absent and the end date **one week
      later**, before anything is saved.
- [ ] **AC-2** — **Given** that preview, **When** staff save, **Then** the created plan matches the preview exactly
      (same dates, same teacher, same count) — no re-shuffling on save.
- [ ] **AC-3** — **Given** several planned absences that would push the course past `MAX_WEEK_BY_SIZE`, **When**
      staff try to save, **Then** it is **refused with a reason naming the ceiling** — never silently trimmed.
- [ ] **AC-4 (regression)** — Creating a course **without** marking any absence produces exactly the same plan as
      today, and the plan editor's own planned-absence action is unchanged.
- [ ] **AC-5 (the quota rule, pending the answer)** — **Given** a 6-session course (quota 2) created with 3 planned
      absences declared up front, **When** it is saved, **Then** `leaveUsed` is **0**, the course is **not locked**,
      and a later *sick* leave still consumes quota normally.

## User-facing wording (Porter as UX writer)
- Control on the create screen — TH: `ไม่มาแน่นอน (ลาล่วงหน้า)` · EN: `Planned absence`
- Preview line — TH: `แผนใหม่: {n} คาบ · ไม่มา {d} · สิ้นสุด {date}` · EN: `New plan: {n} sessions · absent {d} · ends {date}`
- Ceiling refusal — TH: `เลื่อนได้ถึงสัปดาห์ที่ {max} เท่านั้น — ลดจำนวนวันที่ลาล่วงหน้า หรือเลือกวันเริ่มใหม่` ·
  EN: `This course can only extend to week {max} — reduce the planned absences or pick a different start date.`

## Constraints
- Same behaviour as the plan editor — **one behaviour, two entry points** (REQ-030 §4). If they ever disagree, the
  plan editor is right and creation is wrong.
- No change to sick-leave handling, check-in, or money.

## Out of Scope
- Changing the extension ceiling values themselves (that is REQ-031 settings territory).
- Letting a *parent* declare planned absences at registration — staff-side only in this REQ.

## Questions
- **Q1 (to owner — this REQ was BLOCKED on it):** (A), (B) or (C)?
  > **answer (owner, 2026-08-16): (B).** Planned absences declared **at creation** are **free** — they do not
  > touch `leaveUsed` — but a planned absence marked **later**, once the course is running, still consumes the
  > quota exactly as REQ-030 decided. So the rule is about *when* it was declared, not about weakening the quota.
  > **Consequences the SPEC must handle explicitly:**
  > 1. **The extension ceiling (`MAX_WEEK_BY_SIZE`) becomes the only limit on creation-time absences** — so AC-3's
  >    refusal is now load-bearing, not a nicety.
  > 2. **"Declared at creation" must be a real distinction in the data**, not a timing coincidence — a session
  >    absent from birth is not the same event as one cancelled in week 3, and the plan/history should be able to
  >    tell them apart (it is also what makes AC-5 verifiable).
  > 3. REQ-030's behaviour for everything after creation is **unchanged**.
- **Q2 (to owner):** Can staff mark **consecutive** weeks absent (e.g. weeks 3 and 4 — a family travelling for two
  weeks)? Porter assumes yes.
  > **answer: not answered — Porter proceeding on "yes"** (a two-week family trip is the obvious real case, and
  > the extension ceiling already caps the damage). Say so if that is wrong; it is a one-line change.
