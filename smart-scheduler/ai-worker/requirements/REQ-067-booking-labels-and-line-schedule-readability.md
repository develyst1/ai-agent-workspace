# REQ-067: ชื่อประเภทการจองให้ตรงกับป้ายราคา + ข้อความตารางสอนในไลน์ให้อ่านง่าย
- Status: READY_FOR_SA
- Priority: **MEDIUM** — no money at risk, but both are read many times a day by staff and teachers
- Requested: 2026-08-23 by stakeholder (owner)
- Source: owner's annotated screenshot (booking modal) + his screenshot of a teacher's LINE schedule message

## Part A — ชื่อประเภทการจอง ต้องตรงกับป้ายราคาที่ลูกค้าใช้
Owner: rename the booking-type tabs

| ตอนนี้ | เปลี่ยนเป็น |
|---|---|
| `ทดลองเรียน` / `Trial` | **`1st Trial`** |
| `จองรายครั้ง` / `Single session` | **`1 HR`** |

**Why this is worth doing rather than cosmetic:** those are **the exact words on the customer's own printed price
card** (`1ST TRIAL · 1 HR`). Staff read the card and the screen all day; two vocabularies for one product is a
translation staff perform in their heads on every booking, and it is where mistakes come from.
**The system should speak the customer's language, not ours.**

- [ ] **AC-1** — the two tabs read **`1st Trial`** and **`1 HR`** in **both** TH and EN. `1st Trial` and `1 HR`
      stay as-is in Thai — **they are product names on a printed card, not phrases to translate.**
- [ ] **AC-2** — the rename is **labels only**. `bookingType` values (`FIRST_TRIAL` / `SINGLE_SESSION`), stored
      data, reports and sale codes are **untouched**. ⚠️ A rename that reaches the data model is a different and
      much larger change, and is **not** what was asked for.
- [ ] **AC-3** — anywhere else these two types are named to staff (calendar legend, booking detail, REQ-052's type
      label, daily report) uses the same two words. **One vocabulary, everywhere, or we have made it worse.**

## Part B — ข้อความตารางสอนในไลน์ของครู อ่านยาก
Owner: *"ข้อความไลน์ของครูตอนแจ้งตารางสอน ดูยาก อยากให้ดูง่ายขึ้น มีขีด หรือเว้นบรรทัดได้"*

**The problem, from his screenshot:** every session is one long unbroken line —
`2026-08-29 11:00 · นะโม · Bike · รอยืนยัน` — which **wraps mid-word on a phone**, so a teacher cannot tell where
one session ends and the next begins. Seven sessions become a wall of text. **The information is all there and it
is unreadable, which for a message a teacher checks before leaving the house is the same as being wrong.**

**Requirement: group by day, separate visibly, and put the time first** — time is what a teacher scans for.
Shape (SA/FE to finalise; LINE text messages support newlines, not markdown):
```
🗓️ ตารางสัปดาห์นี้
━━━━━━━━━━━━━━
📅 ศุกร์ 29 ส.ค.
  10:00  Ally
         Inline Skate · รอยืนยัน

  11:00  นะโม
         Bike · รอยืนยัน
━━━━━━━━━━━━━━
```
- [ ] **AC-4** — sessions are **grouped by day** with the day named once as a heading, not repeated per row.
- [ ] **AC-5** — each session is **visually separated** (blank line and/or rule) and **starts with the time**.
- [ ] **AC-6** — readable on a phone **without horizontal scrolling or mid-word wrapping** — check on a real
      device, which is the only place this can be judged.
- [ ] **AC-7** — applies to **both** `ตารางวันนี้` and `ตารางสัปดาห์นี้`, and to **TH and EN**.
- [ ] **AC-8 (regression)** — the existing cap (20 rows + "…and N more") and the empty state still behave as today;
      the quick-reply buttons still work.

## Out of Scope
- Changing **what** the schedule contains (no new fields, no links).
- Flex/bubble messages — **plain text with better structure first.** If the owner later wants a card layout that
  is its own REQ with its own cost.
- Anything in the parent-facing LINE messages; this REQ is the **teacher** schedule only.

## Questions
- **Q1 (to owner, non-blocking):** should the teacher's message also show **where** (branch/room), or is time ·
  student · program · status the complete set? Porter is **not adding fields on assumption** — the ask was
  readability, and adding content while fixing legibility is how a small change becomes a redesign.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-067 | 🏷️ **Booking-type labels `1st Trial`/`1 HR` (Part A) + teacher LINE schedule readability (Part B)** | MEDIUM | 🔨 **Part B → TASK-175 (with REQ-069); Part A → TASK-176 @Fern (Sober 2026-08-23).** A: rename tabs + everywhere the types are named, labels-only (AC-2, data/codes untouched), card words not translated. B: group LINE schedule by day, time-first, TH/EN, keep cap/empty/quick-replies — ships with the Mon→Sun range fix. Q1 (location on the LINE msg) = owner, non-blocking. | @Sober + owner |
```
