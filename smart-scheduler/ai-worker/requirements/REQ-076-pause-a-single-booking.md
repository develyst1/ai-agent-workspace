# REQ-076: พักการจองรายครั้ง / Voucher / 1st Trial (owner's **REQ-013**)

- Status: **DRAFT — captured, NOT `READY_FOR_SA`.** Questions below block the spec.
- Priority: TBD — the owner has not ranked it against REQ-005 or the `REQ-BO` block
- Requested: 2026-08-30 by the owner, relaying the customer
- Deadline: none stated

## Problem / Goal

A **course** can already be paused — REQ-071 / board REQ-071 gave it a 5th status (`DROPPED`), it leaves the
calendar without being deleted, it does not fall into Expire, and an admin resumes it later by editing the
expiry. **A single booking cannot.** The customer wants the same escape hatch for the three non-course types.

The owner's words, verbatim:

> *"การจองแบบรายครั้ง หรือ voucher หรือ first trial เขาอยากได้ พัก ด้วยเหมือนคอร์สที่มี พักคอร์ส เหมือนพักไว้ก่อน
> แล้วมีกล่องบอกว่ามีรายการที่พักไว้ ให้แอดมินไปเอาออกมาลงได้ ตอนไหนก็ได้"*

Two halves, and the second is the one that makes it usable:
1. **Pause** a 1HR / Voucher / 1st Trial booking — off the calendar, not cancelled, not lost.
2. **A visible box listing what is paused**, from which an admin can put it back on the schedule **at any time**.

## Why this is not simply "reuse REQ-071"

Grounded, not assumed — but stated as the reason the questions below exist, not as a design:

- A **course** pause has an obvious anchor: the course still exists, and the sessions it owns move with it. A
  **single booking IS the session** — pausing it means the booking exists with no date at all, which is a state
  the calendar has never had to render.
- **The three types differ in what was already consumed.** A Voucher session draws on an entitlement; a 1HR and
  a 1st Trial **post revenue at day-end once `ATTENDED`**. So "pause" has a different money meaning per type,
  and that is a business decision, not a technical one.

⚠️ **`FIRST_TRIAL` is a single one-off session.** Pausing it is coherent, but worth confirming the customer
really means all three and not just 1HR/Voucher — Porter is not assuming it (the owner's REQ-009 had exactly
this shape of gap: it named 1HR/Voucher and 1st Trial was silently missing).

## Acceptance Criteria

🔴 **Not written yet — deliberately.** Every AC here would encode a guess about the questions below. Porter
writes them the moment the owner answers; a vague AC is a defect shipped into the process (`PM.md`).

## User-facing wording (Porter, UX writer)

To be written with the ACs. The one word already in play is the customer's own — **"พัก"**, matching the
course-pause vocabulary they already use, **not** "ระงับ" or "Hold".

## Out of Scope (proposed — owner to confirm)

- Refunding or reversing money at the moment of pause. Reversal stays a backoffice decision (the line the owner
  has held twice: money never moves as a side effect of a staff click).
- Pausing a **course** — that already exists (REQ-071).

## Questions — @Porter to the owner (do NOT invent any of these)

1. **All three types, or only 1HR + Voucher?** A 1st Trial is a single one-off session.
2. **What happens to the money?** A 1HR / 1st Trial posts revenue at day-end once `ATTENDED`.
   - (a) Pause is only allowed **before** it is attended, so no money is ever involved, or
   - (b) it can be paused after, and the posted revenue simply stays until someone reverses it in the backoffice?
3. **A Voucher session draws on the voucher's quota — does pausing give the session back to the quota, or hold it?**
4. **Where is the box?** The customer asked for "กล่องบอกว่ามีรายการที่พักไว้" — which screen: the calendar page,
   the bookings page, or the student's own card?
5. **Does the expiry keep running while paused?** A course resumes with an admin-edited expiry (REQ-071). A
   voucher has its own expiry — does a paused session keep burning it, or is the clock stopped?
6. **Does the teacher get a LINE message when a booking is paused, and again when it is put back?** (The teacher
   had it on their schedule; it silently disappearing is how a teacher shows up for nothing.)
7. **Priority against REQ-005 and the `REQ-BO` block** — this is new scope; something else moves.

---

## 🔻 The 7 questions, re-worked into 3 — Porter, 2026-09-05

**Why this rewrite:** the owner has answered a great deal since 2026-08-30, and **four of my seven questions were
already answered by decisions on the record.** Asking him again would be asking him to repeat himself, which this
project has done to him more than once. **Each of the four below carries the decision it rests on — if I have
read any of them wrong, that is a correction, not a new decision.**

### ✅ Already answered — stated as proposals, correct me rather than answer them

| # | Was | Now, and what it rests on |
|---|---|---|
| **7** | Priority | **Answered 2026-09-01.** REQ-013 is **#3**, after REQ-005 and REQ-016. No question left. |
| **2** | What happens to posted money | ⇒ **Pause is only allowed BEFORE the session is attended.** Rests on the line the owner has held twice — *money never moves as a side effect of a staff click* — and on the fact that **an attended session already happened; pausing it is not a thing to want.** After attendance, the existing path is cancel-with-reason + a backoffice reversal. **No money is ever involved in a pause.** |
| **5** | Does the expiry keep running | ⇒ **Yes, the clock keeps running; the admin extends the expiry if it matters.** Rests on **REQ-071**, where a paused course resumes by an admin editing the expiry, **and on the owner's brand-new REQ-017** (*ขยับวันหมดอายุได้ด้วยทุกคอร์ส*) — he is already asking for manual expiry control as a general tool. **Stopping a clock automatically would be a second, hidden mechanism doing the same job.** |
| **6** | Does the teacher get a LINE message | ⇒ **Yes — on pause AND on resume, and only when a teacher is assigned.** Rests on the owner's 2026-09-02 ruling for อื่นๆ bookings: *"ถ้ามีครูก็ส่งไลน์ ไม่มีครูก็ไม่ต้อง"*. 📌 **The reason it must be both directions:** a teacher had this on their schedule. **A booking that vanishes silently is how a teacher shows up for nothing** — and a booking that silently reappears is how they miss it. |

### 🔴 Genuinely open — three, and none can be derived from anything on record

1. **All three types, or only 1HR + Voucher?** A **1st Trial is a single one-off session** — pausing it is
   coherent, but the customer may not have meant it. ⚠️ **Asked because REQ-009 had this exact gap:** it named
   1HR/Voucher and 1st Trial was silently missing until it surfaced late.
2. **A Voucher session draws on the voucher's quota — does pausing GIVE THE SESSION BACK to the quota, or HOLD
   it?** **Pure business.** Give-back is generous and risks a family parking sessions to dodge an expiry; hold is
   tighter and means a paused session still counts against them while they are not using it. **His call.**
3. **Where is the box?** *"กล่องบอกว่ามีรายการที่พักไว้"* — the **calendar page** (beside the schedule it left),
   the **bookings page** (with its siblings), or the **student's own card** (with that child's history)?
   ⇒ **Porter's read, to overrule:** the **bookings page**. A paused booking has no date, and a dateless thing on
   a calendar has nowhere to sit — that is the same shape as DEF-4 on REQ-078, where an item the calendar could
   not render became an invisible double-booking.

**When these three land, the ACs get written the same day.** Nothing else blocks this REQ.

---

# ✅ ANSWERED 2026-09-05 — the REQ is now specified

**Owner's three answers, verbatim where it matters:**

1. **All three types** — 1HR · Voucher · 1st Trial.
2. **HOLD, not give back.** *"ค้างไว้ เพราะฉันพยายามให้มันเป็นอะไรที่มันง่าย ๆ แบบเดียว ๆ กัน ไม่หลากหลายแบบ"*
   🔴 **And he split a REQ off while answering:** *"ส่วนการยกเลิกพิเศษ หรือยกเลิกการจอง voucher แล้วได้สิทธิ์คืน
   ควรจะเป็นอีกเรื่องนึงต่างหาก แยกไว้"* ⇒ **new board `REQ-081`, captured, not queued.**
3. **The calendar page — as a TRAY, not a calendar entry.** *"ทำเป็นแทบช่องเก็บ ที่เตะตาแอดมินที่กำลังทำงานการ
   จองปกติ ได้เห็นว่า อ๋อ มีอะไรค้างมั้ยในรายการพัก"*

📌 **He answered my objection better than I asked it.** I argued for the bookings page because **a dateless item
cannot sit in a calendar grid** — which is true, and is the shape of REQ-078's DEF-4. **A tray is not in the
grid.** It sits beside it. ⇒ **The visibility he wants and the constraint I raised are both satisfied**, and the
requirement below states the tray is **never** a calendar cell so nobody re-introduces the problem later.

## 🔴 What this feature IS — the sentence everything else must agree with

**A hold, and nothing else.** *"เป็นกรณีพิเศษที่ลูกค้าโทรมา แอดมินทำให้"* — the parent phones, the admin parks the
booking, and later puts it back. **It moves no money, returns no entitlement, forgives no expiry, and asks for no
reason.** Every richer behaviour anyone imagines for it belongs to `REQ-081` or to the existing cancel flow.

## Acceptance Criteria

### Pausing

- [ ] **AC-1** — **Given** a `1HR`, `VOUCHER` or `FIRST_TRIAL` booking that is **not yet attended**, **When** the
      admin pauses it, **Then** it leaves the calendar, is **not** cancelled or deleted, and appears in the tray.
- [ ] **AC-2** — **Given** a booking that is already **`ATTENDED`**, **When** the admin looks for pause,
      **Then** it is **not offered**. *(An attended session has happened; the existing path is cancel-with-reason
      plus a backoffice reversal.)*
- [ ] **AC-3** — **Given** a **course** booking, **When** the admin looks for pause, **Then** this feature is not
      offered — REQ-071 already owns that, and its wording must not change.
- [ ] **AC-4** — **Given** any pause, **When** it completes, **Then** **no revenue is posted, reversed or moved**,
      and no entitlement changes. *(The rule the owner has held three times: money never moves as a side effect
      of a staff click.)*
- [ ] **AC-5** — **Given** a **Voucher** booking, **When** it is paused, **Then** the session **stays consumed** —
      the quota is **not** given back. *(Owner, 2026-09-05. Give-back is `REQ-081`.)*
- [ ] **AC-6** — **Given** any paused booking, **When** time passes, **Then** **the expiry clock keeps running**
      exactly as if it were not paused. An admin extends the expiry by hand if it matters *(REQ-071's pattern,
      and the owner's own REQ-017)*.
- [ ] **AC-7** — **Given** a booking **with a teacher assigned**, **When** it is paused, **Then** that teacher is
      told on LINE. **Given a booking with no teacher, no message is sent.** *(Owner, 2026-09-02.)*
- [ ] **AC-8** — Pause asks for **no reason code**. *(It is not a cancellation. REQ-009's reason list must not
      appear here — offering it would teach staff that pause and cancel are the same act.)*

### The tray

- [ ] **AC-9** — **Given** the calendar page, **When** an admin opens it, **Then** a **tray** shows what is
      paused, **visible without navigating away and without opening anything** — the owner's test is that an
      admin doing ordinary booking work *notices* it.
- [ ] **AC-10** — 🔴 **The tray is NOT a calendar cell and never renders inside the grid.** A paused booking has
      **no date**; anything dateless placed in a dated grid is invisible or wrong. *(This is REQ-078's DEF-4 in
      advance: an item the calendar could not render became a double-booking nobody could see.)*
- [ ] **AC-11** — **Given** an empty tray, **When** the admin opens the calendar, **Then** the tray reads as
      **deliberately empty**, not missing. *(A control that vanishes when it has nothing in it teaches staff it
      is not there.)*
- [ ] **AC-12** — Each tray row names **the student · the booking type · the original date/time**, so an admin
      can tell two paused bookings apart without opening either.

### Resuming

- [ ] **AC-13** — **Given** a paused booking, **When** the admin puts it back, **Then** it may go to **any**
      date and time — *"ตอนไหนก็ได้"* — not only its original slot.
- [ ] **AC-14** — **Given** a resume onto a slot, **When** it would clash, **Then** it is refused with the same
      message shape as REQ-078's AC-24 *(names the teacher and the clashing booking)* — **one clash rule in the
      product, not two.**
- [ ] **AC-15** — **Given** a resume, **When** it completes, **Then** the assigned teacher is told on LINE.
      *(Both directions. A booking that silently reappears is how a teacher misses it.)*
- [ ] **AC-16** — **Given** a resumed booking, **When** it is later attended, **Then** it posts revenue and
      consumes entitlement **exactly as an un-paused booking of that type would.** Pausing changes nothing
      permanent about it.

### Not allowed

- [ ] **AC-17** — **Given** a paused booking, **When** anything looks at teacher availability, capacity or the
      day-end sweep, **Then** it is **absent** — a paused booking must never hold a slot or be auto-attended.
- [ ] **AC-18** — **Given** a paused booking, **When** the parent looks in LINE (`คอร์สของฉัน`), **Then** it is
      **not** shown as an upcoming session. ⚠️ **Whether it is shown at all is not specified here** — see Open.

## User-facing wording (Porter, UX writer)

| Where | Thai |
|---|---|
| The action | **พัก** *(the customer's own word, matching the course vocabulary — never "ระงับ" or "Hold")* |
| The tray | **รายการที่พักไว้** |
| Empty tray | **ไม่มีรายการที่พักไว้** |
| Resume | **นำกลับมาลงตาราง** |
| Teacher LINE, paused | **คาบนี้ถูกพักไว้ชั่วคราวค่ะ — {ชื่อน้อง} · {วันที่เดิม} {เวลา} · ยังไม่มีกำหนดใหม่** |
| Teacher LINE, resumed | **คาบที่พักไว้ กลับมาลงตารางแล้วค่ะ — {ชื่อน้อง} · {วันที่ใหม่} {เวลา}** |

## Open — NOT blocking, for the owner when he passes by

1. **AC-18's other half:** should a parent see a paused booking in `คอร์สของฉัน` at all? **Hiding it entirely
   risks *"ที่โทรไปเลื่อนไว้ หายไปไหน"*.** Porter's read: show it in a separate line labelled **พักไว้**, with no
   date. **Not blocking — it is one line of LINE copy and can follow.**
2. 💡 **The owner's own floated idea, recorded as a candidate and NOT as scope:** *"หน้ารายการจอง ถ้าทำให้หน้า
   ปฏิทินมีปุ่มพามาก็น่าจะดี มั้ยนะ ลองคิดเฉย ๆ นะ"* — a button on the calendar that jumps to the bookings page.
   **He explicitly floated it, so it is not a requirement.** It is cheap, it is unrelated to pausing, and it
   would fit REQ-017/FIX-009's small-items batch better than here. **Porter is not building it into this REQ.**

**Status: `READY_FOR_SA` on everything except the two Open items, neither of which blocks a spec.**
