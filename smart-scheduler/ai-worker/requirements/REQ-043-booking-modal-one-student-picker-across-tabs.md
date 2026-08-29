# REQ-043: Booking modal — one student picker, the same on all four tabs
- Status: READY_FOR_SA
- Priority: MEDIUM–HIGH (owner raised it as the next thing to fix; it is the screen staff use all day)
- Requested: 2026-08-16 by stakeholder (owner)
- Deadline: none
- Source: owner, 2026-08-16, with screenshots of the **Single session** and **Weekly course** tabs.

## Problem / Goal
On the New-booking modal the **same job — "pick the student" — looks like two different screens**
depending on the tab:

| Tab | What the user sees today |
|---|---|
| Trial · Single session | **One** combined control: `Type a name or phone to search / add new` — type, filter, pick, or create a new student inline. |
| Weekly course · Voucher | **Two** stacked controls: a search box `Search by name, nickname or parent phone`, **plus** a separate select `Select a student with a course`. |

The owner's question is the right one: *why are the first two a search-and-list in one, while
course/voucher are split into two boxes?* Staff booking all day have to re-learn the same action per
tab, and the split version makes it unclear whether typing filters the list below or does something
else. **Goal: picking a student is one control that behaves identically on all four tabs.**

## Why the difference exists (Porter, read-only observation — SA to confirm the mechanics)
This is not arbitrary, and the fix must keep the meaning:
- **Trial / Single session** may book **any** student, including one who doesn't exist yet — hence
  "search **/ add new**".
- **Weekly course / Voucher** may only book a student who **already owns** the relevant entitlement (a
  course / a voucher), and the pick is really "which entitlement", not just "which person" — hence a
  list of eligible entries.
- **REQ-029 item 3 already asked for this** ("Add a student search to the Course and Voucher tabs,
  **consistent with the Trial/Single picker**"). The search arrived; the **consistency did not**. So
  this REQ is the unfinished half of REQ-029, not a new idea.

## Requirement
1. **All four tabs use the same student-picking control** — one field, type to filter, pick from the
   results. No tab shows a separate search box stacked above a separate list.
2. **The rules per tab stay exactly as they are today** — this is a presentation fix, not a behaviour
   change:
   - Trial / Single session keep the ability to **create a new student inline**.
   - Weekly course / Voucher keep listing **only eligible students/entitlements**, and keep whatever the
     picked entry means downstream (course/voucher identity, program, quota).
3. **A student with more than one eligible entitlement must still be distinguishable** in the list —
   REQ-029's hard-won result (two courses must not look identical) must not regress.
4. **Empty and no-match states are explicit**, in the owner's wording below — never a silently empty box.

## Acceptance Criteria
- [ ] **AC-1** — **Given** the New-booking modal, **When** the user switches between Trial, Single
      session, Weekly course and Voucher, **Then** the student field is **visually and behaviourally the
      same control** on all four (one field; typing filters; selecting fills it).
- [ ] **AC-2** — **Given** the Weekly course tab, **When** the user types part of a name, nickname or
      parent phone, **Then** the eligible list filters as they type — with no second search box present.
- [ ] **AC-3 (regression, REQ-029)** — **Given** a student who owns **two** courses/vouchers, **When**
      they appear in the list, **Then** each entry is still distinguishable (program · remaining · expiry
      as today) and booking the second one books the second one.
- [ ] **AC-4 (regression)** — **Given** the Trial or Single session tab, **When** the typed name matches
      nobody, **Then** the user can still **add the new student inline**, exactly as today.
- [ ] **AC-5 (negative/empty)** — **Given** a tab where nobody is eligible (e.g. no student holds a
      voucher), **When** the picker is opened, **Then** it shows the empty-state wording below — not a
      blank dropdown.
- [ ] **AC-6 (regression)** — Booking end-to-end still works on all four tabs and writes the same data as
      before this change (program/subject on voucher bookings included).

## User-facing wording (Porter as UX writer)
One placeholder, used on every tab, differing only where the meaning genuinely differs:
- Trial · Single session — TH: `พิมพ์ชื่อ ชื่อเล่น หรือเบอร์ผู้ปกครอง / เพิ่มนักเรียนใหม่` · EN:
  `Search by name, nickname or parent phone / add new`
- Weekly course · Voucher — TH: `พิมพ์ชื่อ ชื่อเล่น หรือเบอร์ผู้ปกครอง` · EN:
  `Search by name, nickname or parent phone`
- No match — TH: `ไม่พบนักเรียนที่ตรงกัน` · EN: `No matching student`
- Nobody eligible — TH (course): `ยังไม่มีนักเรียนที่มีคอร์ส` · EN: `No student has a course yet` ·
  TH (voucher): `ยังไม่มีนักเรียนที่มีบัตร` · EN: `No student has a voucher yet`

## Constraints
- Presentation only. **No change to what a booking writes**, to eligibility rules, or to REQ-027's
  voucher exclusions.
- Must not regress REQ-022 (type-driven tabs), REQ-029 (voucher program + distinguishable courses), or
  REQ-024's search behaviour (`name · nickname · parent phone`).

## Out of Scope
- Redesigning the rest of the booking modal (fields, layout, tab order).
- Adding inline "create student" to the Course/Voucher tabs — a student with no entitlement cannot be
  booked there anyway; if the owner wants that, it is a separate requirement.

## Questions
- **Q1 (to owner):** Confirm the intent is **"make them look and behave the same"**, not "let me create a
  brand-new student on the Course/Voucher tabs too". (Porter's reading: the former.)
  > answer: _pending_
- **Q2 (to SA):** Is there a technical reason the Course/Voucher tabs were built as search + separate
  select (e.g. the option identity is an *entitlement*, not a student)? If unifying costs a real
  behavioural compromise, say so and Porter re-decides the trade — do not silently drop AC-3.
  > answer (Sober 2026-08-16): **Two real reasons — neither forces two boxes, so there is no trade to
  > re-decide; unification is free.** (1) The option identity **is an entitlement** (`courseId`/
  > `voucherId`), not a student, and one student can be several rows (their 2 courses) — that's why it's
  > a list of enriched entitlement rows, and it **stays** (AC-3 preserved). (2) The search is
  > **server-side** because it must match **parent phone**, which isn't in the option label — Mantine's
  > local `searchable` filter *cannot* match a phone (that's the TASK-088/REQ-024 fix), which is why the
  > original author used a separate `TextInput`→debounced server query feeding a plain `Select`. **But
  > the app already has the unified pattern:** `StudentSelect` (the Trial/Single control) is a single
  > Mantine `Combobox` whose typing fires a **server-side** search (`useStudentSearch`) and lists
  > results in the same field. The Course/Voucher picker just needs to do the same against
  > `useEligibleStudents(type, enabled, q)` (which already takes a server `q`) instead of the two-box
  > layout — **one field, type-to-filter server-side, entitlement rows, no add-new.** Zero behavioural
  > compromise, **zero BE change.** Spec'd in SPEC-039 / TASK-131.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-043 | Booking modal — **one** student picker, identical on all four tabs (Trial/Single = combined search+add-new; Course/Voucher = split search box + separate select today) | **MEDIUM–HIGH** | ✅ **DELIVERED 2026-08-23** — verified on `uat` from the owner’s screenshot: one combined student picker on every tab. The Voucher tab omitting `เพิ่มนักเรียนใหม่` is **intended** (owner-confirmed) · _prior:_ **TASK-131 code DONE (SA-reviewed) → awaiting @Tanya visual pass to close (Sober 2026-08-16)** — Q2 answered: yes the option identity is an **entitlement** (kept, AC-3) and the search is **server-side** for parent-phone (kept), **but neither forces two boxes** — the app already has the unified pattern (`StudentSelect` = one Combobox firing a server search). Fix = a sibling `EligibleStudentSelect` (one Combobox → `useEligibleStudents(type,enabled,q)`), swap the two-box branch for it. **FE-only, zero BE change, zero behaviour change.** — _prior:_ **@Sober — please pick up REQ-043.** Owner 2026-08-16 (with screenshots): "ทำไมสองหมวดแรกเป็น search+dropdown ในอันเดียว แล้ว course + voucher หน้าตาแยกกันแบบนั้น". **This is the unfinished half of REQ-029 item 3** — which asked for Course/Voucher search *"consistent with the Trial/Single picker"*; the search shipped, the consistency did not. **Presentation only**: eligibility rules, what a booking writes, inline add-new on Trial/Single, and REQ-029's distinguishable-entitlements result must all be preserved (ACs cover each as regressions). Q2 in the REQ is yours: if the split exists because the option identity is an *entitlement* rather than a student, say so and Porter re-decides the trade rather than losing AC-3. |
```
