# REQ-068: โน้ตประจำคาบ — บอกครูและแอดมินหน้างานว่า "คาบนี้มีใครมาบ้าง"
- Status: READY_FOR_SA
- Priority: **HIGH** — it is a real operational gap the customer hits every time a voucher is used
- Requested: 2026-08-23 by stakeholder (owner)
- Source: owner — *"voucher เวลาเขามาใช้สิทธิ์ เขาจะเอาให้คุ้มๆ เขาจะพาพี่ๆ น้องๆ นักเรียนที่ไม่ใช่แค่เจ้าของ course
  มาเรียนด้วย จึงอยากจะโน้ตชื่อนักเรียนไว้ เพื่อไป noti line ให้ครู และตัวเอง(admin)ที่หน้างาน รู้ตัวด้วยว่านักเรียนจะมากี่คน ใครบ้าง"*

## Problem / Goal
A booking today records **one** student. **Reality does not.** When a family uses a voucher they bring siblings
and friends to get value from the hour — so **the teacher arrives expecting one child and meets four**, and the
admin on the floor finds out when they walk in.

**Badges already exist** and are the wrong tool: they are a **fixed vocabulary** chosen in Settings (branch,
province, promotion). What is needed here is **free text that is different every time** — *"มากับพี่สาว 2 คน:
มะปราง, ปุ๊กปิ๊ก"*.

**Goal: a note on the session that reaches the people who have to be ready for it — the teacher and the admin at
the venue — before it starts.**

## Requirement
1. **A `note` field on a booking, on every booking type** — 1st Trial · 1 HR · course · voucher — **and editable
   from manage-course** for a course's individual sessions.
2. **It is per SESSION, not per course.** *"This week she is bringing her brother"* is about one hour, not about
   the whole package. ⚠️ On a course, editing the note on one session must **not** write it to the other nine.
3. **The note travels to the people who need it:**
   - **the teacher's LINE schedule** (today's and this week's) — the message REQ-067 Part B is already making
     readable, so **the note lands there rather than in a new message nobody asked for**;
   - **the admin's view on the day** — wherever staff look at "what is happening today".
4. **Free text, short.** A cap (SA to choose, Porter suggests ~200 chars) so it stays a note and does not become a
   place people write records that belong elsewhere.
5. **Visible where the booking is visible** — the booking detail, and the calendar cell **subject to REQ-052's
   display toggle** (see that REQ; the two must be designed together or the cell bloats).
6. **Optional everywhere.** Nothing requires a note; no flow changes when it is empty.

## Acceptance Criteria
- [ ] **AC-1** — **Given** a voucher booking, **When** an admin types *"มากับพี่ 2 คน: มะปราง, ปุ๊กปิ๊ก"*,
      **Then** it is saved on that booking and shown on its detail.
- [ ] **AC-2** — the same field is available on **1st Trial, 1 HR and course** bookings, and from **manage-course**
      on an individual session.
- [ ] **AC-3 (🔴 the one that is easy to get wrong)** — editing the note on **one** session of a course leaves the
      other sessions' notes **untouched**.
- [ ] **AC-4** — the **teacher's LINE schedule** shows the note for a session that has one, and looks unchanged for
      sessions that do not.
- [ ] **AC-5** — an empty note changes nothing anywhere: no blank line in LINE, no empty row in the UI, no change
      to any existing behaviour.
- [ ] **AC-6** — TH/EN, no raw i18n key.
- [ ] **AC-7 (regression)** — badges are untouched and keep working exactly as today. **This adds a field; it does
      not reorganise the ones that exist.**

## Constraints
- **Do not extend badges to do this.** Badges are a controlled vocabulary and this is deliberately not one —
  merging them would ruin both.
- **The note is not a place for personal data beyond what staff already hold.** It goes to a teacher's phone;
  it should carry names and logistics, not phone numbers, addresses or anything medical. **Wording should make
  that plain** (Porter to draft) rather than relying on people to guess.

## Out of Scope
- **Adding the extra children as real students on the booking.** That is a different and much larger thing
  (attendance, entitlement, revenue — do those siblings consume voucher hours?). **The owner asked for a note, and
  a note is what this REQ delivers.** If the answer later is "they should be real attendees", that is its own REQ
  and it will need pricing decisions, not a text field.
- Notifying the **parent**. This is for the teacher and the on-site admin.

## Questions
- **Q1 (to owner):** should the note appear in the **daily report** as well, or only on the calendar/booking and in
  the teacher's LINE? *(Porter's lean: yes to the daily report — it is the sheet the on-floor admin actually holds.)*
- **Q2 (to owner):** when a note is added to a session **later the same day**, should the teacher get a **fresh
  LINE message**, or is it enough that it appears next time they open their schedule? *(Porter's lean: no extra
  message. An edit that pings a teacher's phone every time is how a useful feature becomes one people mute.)*
- **Q3 (to SA):** `bookings.note` **already exists** (`schema.ts`) and is written by the importer and some flows.
  **Is it free for this, or is it already carrying meaning we would collide with?** Say which — reusing an occupied
  column is how two features quietly overwrite each other.

---

## ✅ OWNER ANSWERS — 2026-08-23
**Q1 — daily report: ไม่.** The note does **not** appear in the daily report.
⇒ **Scope shrinks**, and it sharpens what the note is *for*: a **heads-up before the session**, not a record of it.
The daily report is the after-the-fact sheet; a note about who is turning up belongs where people look **beforehand**
— the calendar and the teacher's LINE. **Recorded as a boundary, so nobody "helpfully" adds it later.**

**Q2 — re-notify on edit: ไม่.** Editing a note sends **no** new LINE message; it simply appears the next time the
teacher opens their schedule.
⇒ **AC-8 (new):** adding or editing a note **must not enqueue any notification** — provable by the outbox staying
empty on an edit. *(A feature that pings a teacher's phone on every small correction is one they mute, and then the
notes they actually needed go unread too.)*

**Still open: Q3 (to SA — is `bookings.note` already occupied?)** — that one is a code question, not the owner's.
**Q6 on REQ-052 (does the toggle cover the day view too) is unanswered and non-blocking**; Porter proceeds on
**both views, one control**, and will change it on one word.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-068 | 📝 **A note on the session** — staff need somewhere to write what happened in a class (owner, 2026-08-23) | MEDIUM | ✅ **DELIVERED 2026-08-25** — session note live on `uat` (`attendee_note`, migration `0022`) and verified on the customer's own calendar. 🔴 Open follow-up: the **display toggle does not re-render** when ticked — the content is correct, it just does not redraw. Normal priority; no data and no money affected. _Prior:_ 🔨 **READY_FOR_SA — bundled with REQ-052 into one re-cut of TASK-142 (Porter 2026-08-23).** Scope SHRANK after the owner answered **Q1 and Q2 both "ไม่"**: no history/audit trail, no per-note visibility rules — one note on the session, that is all. Requirement: `requirements/REQ-068-session-note.md`; the collision write-up is in `log/2026-08-23.md`. **Build the cell once — program + booking type + display toggle + note — not three passes over the same component.** | **@Sober** — re-spec TASK-142 |
```
