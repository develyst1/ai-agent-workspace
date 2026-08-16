# REQ-052: The calendar cell must say what the session IS — program and booking type, not just a name
- Status: READY_FOR_SA
- Priority: **MEDIUM–HIGH** — the schedule is the screen staff live on all day
- Requested: 2026-08-16 by stakeholder (owner), same customer meeting
- Deadline: none stated
- Source: owner, 2026-08-16 (with a weekly-schedule screenshot) — *"จำเป็นต้องมีชื่อกิจกรรมในตารางด้วย ถ้าเป็น skate
  หรือ onetime / first trial / course / Voucher ก็ต้องเขียนกำกับด้วย"*

## Problem / Goal
A cell on the schedule currently reads `09:00 QA-prod-student` — a time and a name. It does not say **what the
child is doing** (Surfskate? Onewheel? Bike/Scooter?) or **what kind of booking it is** (first trial, one-off paid
session, course session, voucher session). Staff have to open each booking to find out, and coaches reading the
week ahead cannot tell a trial from a course session — which are different lessons to prepare and different money.

**Goal: one glance at a cell tells you the student, the program, and the booking type.**

## Requirement
1. **Every session cell shows the booking type** — trial · single session · course · voucher — as **text or a
   labelled badge**, never colour alone (the FRONTEND-STANDARD rule the team already adopted in REQ-041: status
   must not be hue-only).
2. **Every session cell shows the program** (Surfskate / Freeskate / Onewheel / Bike-Scooter-Balance Cruiser / …).
3. **This must not collide with the existing status legend** (ยืนยันแล้ว · มาเรียน · รอยืนยัน · ลา/ป่วย · ขยายคาบ ·
   รอย้าย) — a reader must be able to tell *status* from *type* without learning a colour code.
4. **Nothing may be truncated into meaninglessness.** REQ-041 closed "0 truncated badges" as a standard; this REQ
   must not re-open it. If the weekly cell genuinely cannot hold everything, the **type wins** (see Q1) and the
   program shortens — with the full text visible in the day view and the booking detail.
5. Applies to **both** the weekly (`รายสัปดาห์`) and daily (`รายวัน`) views.
6. **Type carries its own colour, as a second channel — never as the only one** (owner's answer to Q1). The cell
   ends up with **two** colour signals: **status = primary** (the existing legend, unchanged), **type = secondary,
   smaller and quieter** — a stripe, dot, or edge marker, at the SPEC's discretion. Guardrails, non-negotiable:
   - The **type text label stays** (requirement 1). Colour is redundant reinforcement, never the carrier — a
     colour-blind or tired reader must lose nothing.
   - **No new status colours, and no reuse of a status hue for a type** — a reader must never have to ask "is this
     green a status or a type?".
   - **Nobody has to memorise a colour code**: whatever a colour means is legible as text on the cell itself, and
     the legend names both dimensions.
   - The palette comes from the existing token set (FRONTEND-STANDARD / REQ-041's one-source rule) — no inline hex.
   - The owner named `first trial = red`, `course = dark green` as *examples*, not a fixed palette; the SPEC picks
     the final set and shows it to Porter before build.

## Acceptance Criteria
- [ ] **AC-1** — **Given** the weekly schedule, **When** a cell renders, **Then** it shows **student · program ·
      booking type**, with the type readable as **text/label**, not implied by colour.
- [ ] **AC-2** — **Given** four sessions of different types on one day, **When** staff scan the column, **Then**
      each type is distinguishable **without** referring to a legend or opening the booking.
- [ ] **AC-3 (the standard we already hold ourselves to)** — At **1440 / 768 / 375** px: **0 truncated** labels,
      **0 clipped** cells, no page horizontal scroll, and the type label is never the thing that gets cut.
- [ ] **AC-4** — **Given** the daily view, **When** a session renders, **Then** the **full** program name is shown.
- [ ] **AC-5 (no collision)** — **Given** a session that is `ลา/ป่วย` or `ขยายคาบ`, **When** it renders, **Then**
      both its **status** and its **type** are readable at once and cannot be confused for each other.
- [ ] **AC-6 (regression)** — The existing status legend, the `ประเภท` filter, click-through to the booking, and
      REQ-041's conformance (tabular-nums, one date format, instant focus ring) all still hold.
- [ ] **AC-7 (bilingual)** — Type and program labels render in TH and EN with the language toggle; no raw i18n key.
- [ ] **AC-8 (type colour is redundant, never load-bearing)** — **Given** the cell rendered in greyscale (or read by
      a colour-blind person), **When** staff read it, **Then** the booking type is still fully identifiable **from
      the text label alone**, and no status hue has been reused for a type.
- [ ] **AC-9 (legend)** — **Given** the schedule header, **When** staff look at the legend, **Then** it names
      **both** dimensions — status and type — so neither colour has to be learned by trial and error.

## User-facing wording (Porter as UX writer)
**Booking type labels** — short form for the weekly cell, full form for the day view / detail:

| Type | TH (short · full) | EN (short · full) |
|---|---|---|
| First trial | `ทดลอง` · `เรียนทดลอง` | `Trial` · `First trial` |
| One-off paid session | `คาบเดี่ยว` · `คาบเดี่ยว (เก็บเงิน)` | `Single` · `Single session` |
| Course session | `คอร์ส` · `คาบในคอร์ส` | `Course` · `Course session` |
| Voucher session | `บัตร` · `ใช้บัตร` | `Voucher` · `Voucher session` |

**Program** — the program's own name as it already appears elsewhere in the product (Surfskate, Freeskate,
Onewheel E-Skate, Bike / Scooter / Balance Cruiser). **Do not invent new abbreviations for programs** — if one is
too long for the weekly cell, that is a layout decision for the SPEC, not a new vocabulary for staff to learn.

**Cell reading order (Porter's proposal, SA may adjust for layout):** `{time} {nickname}` on the first line,
`{type} · {program}` on the second.

## Constraints
- Presentation only — no change to what a booking is or does.
- Must satisfy **FRONTEND-STANDARD.md** §3 as REQ-041 established it (this is the same screen family, and the
  standard is why the FE stopped looking AI-generated).

## Out of Scope
- Redesigning the schedule grid, adding new filters, or changing the status vocabulary.
- Showing the teacher on the cell (the row already is the teacher).
- **DEFERRED — the owner's option (ii), not rejected: the `สถานะ > ประเภท` / `ประเภท > สถานะ` view-mode switch.**
  Porter's call: ship the dual-colour cell first. The switch adds a persisted preference, a second visual language
  and a toolbar control whose value nobody can judge until staff have lived with the simpler version. If it is
  still wanted after real use it becomes a small follow-up REQ — raised from experience instead of from a guess.

## Questions
- **Q1 (to owner):** if a narrow weekly cell can only hold **one** of the two, which do you want kept — the
  **booking type** or the **program**? *(Porter's lean: **type** …)*
  > **answer (owner, 2026-08-16): neither is dropped — add colour as a SECOND channel, and design it properly.**
  > His words: *"กิจกรรม ส่วนประเภท แยกที่แถบสีเพิ่มได้ เช่น สีแดง first trial สีเขียวเข้ม คอร์ส บลาๆ ไปคิดเอา แสดงว่า
  > การจองนึงจะมีสองสี สีแรกสีสถานะ สีสองเล็กๆ ซ่อนๆ ก็ได้ เป็นประเภท … หรือทำให้ calendar เปลี่ยนโหมดการมองก็ได้ เช่น
  > ตอนนี้จะดูแบบ สถานะ > ประเภท สีสถานะก็จะเด่นกว่า หรือปรับเป็น ประเภท > สถานะ สีประเภทก็จะไปใส่ container หลักของ
  > การ์ด … หรืออื่นๆ ไปคิดเอา ทำออกมาให้ดี"*
  > **Two options he named:** (i) **dual-colour cell** — status is the primary colour, type is a second, smaller,
  > quieter marker; (ii) **a view-mode switch** — `สถานะ > ประเภท` or `ประเภท > สถานะ`, where whichever is primary
  > takes the card's main colour. He explicitly delegated the visual design (*"ไปคิดเอา ทำออกมาให้ดี"*).
  > **Porter's scoping call on that delegation** (PO hat, stated so nobody has to guess): **build (i) now**; treat
  > (ii) as **deferred** — see Out of Scope. Reason: (i) satisfies the whole requirement, while (ii) adds a
  > persisted user preference, a second visual language and a control to the toolbar, for a benefit we cannot
  > judge until staff have used (i). If they still want it after a week of real use, it is a small follow-up REQ
  > and we will have earned the opinion instead of guessing it.
- **Q2 (to owner):** nickname or full name on the weekly view?
  > **answer (owner, 2026-08-16): ชื่อเล่น — nickname.**
- **Q3 (to SA):** does the cell already receive program and type from the API, or is this a data-shape change as
  well as a layout one? Say which, because it decides whether this is FE-only.
