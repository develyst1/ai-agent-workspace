# REQ-029: Booking modal — a voucher must choose its program, and the student list needs a search box

- Status: READY_FOR_SA
- Priority: 🔴 **HIGH** — one half is a **silent data-corruption bug**, not a usability gap
- Requested: 2026-08-01 by the project owner, after presenting to the customer
- Deadline: go-live **2026-08-20**
- Source: owner — *"จอง voucher ควรเลือกลงได้สิว่าจะนำ voucher มาใช้ program ไหน ขอช่อง search เด็ก ในหน้านั้นด้วย"*

## Problem / Goal

### 1. 🔴 A voucher booking silently records the wrong sport

A voucher is deliberately **program-agnostic** — it is a bucket of hours, and the family decides what to spend
them on. But the booking modal never asks. Verified in `BookingModal.tsx:582-623`:

```ts
const slotSubjectId   = slotTeacher?.subjectOptions?.[0]?.id   ?? "";
const slotSubjectName = slotTeacher?.subjectOptions?.[0]?.name ?? ...;
// … VOUCHER payload:  subject: slotSubjectName, subjectId: slotSubjectId
```

**The program is silently taken as the teacher's FIRST subject in the slot.** A teacher who coaches Surfskate,
Skateboard and Inline gets Surfskate recorded every time, regardless of what the child actually did.

**This is worse than a missing field, for three reasons:**
- The wrong sport is **written to the booking** and nobody is told — the booking looks complete and correct.
- 💰 **It corrupts REQ-014's revenue-by-activity and REQ-013's sport-share at the source.** Both read the
  session's sport. We are currently building reports on top of a value that is, for every voucher booking, a
  guess made by array position.
- ⚠️ It interacts with **REQ-027**: vouchers may not be used for Onewheel or Balance Play. A rule about which
  program a voucher may pay for **cannot be enforced while the program is auto-filled.**

### 2. The student list on this screen has no search
Trial and Single use a searchable picker. **Course and Voucher render a plain list of eligible students** — fine
for the handful in test data, unusable at real volume, and REQ-025 is about to load 20–36 families of real ones.
It is the same complaint the customer already made about the Bookings page (REQ-024), on a different screen.

## Requirement

1. **A voucher booking must ask which program the session is for**, and record that choice. It must **not**
   fall back to the teacher's first subject.
2. The choice should be limited to what is actually possible — programs that teacher can coach — and must
   respect **REQ-027's voucher exclusions** once those land.
3. **Add a student search** to the Course and Voucher tabs, consistent with the Trial/Single picker and with
   `studentSearchConditions()` (name · nickname · parent phone) so the same query works everywhere.
4. If the program genuinely cannot be determined, **stop and ask — never guess silently.**

## Acceptance Criteria

- [ ] Booking a voucher session asks for the program; the booking records **what was chosen**.
- [ ] A teacher with several sports no longer produces bookings that all claim the first one.
- [ ] Course and Voucher tabs have a working student search (name / nickname / parent phone).
- [ ] Trial and Single are unchanged.
- [ ] The sport shown on the calendar and in reports matches what was picked.

## Analysis / current state (Porter, read-only — for SA to verify)

- **Course is correct and should stay as-is:** it takes the subject from the course itself
  (`ctx?.subject?.id`) — a course *is* a program, so there is nothing to ask.
- **Voucher is the broken case** precisely because it has no program of its own. The current code fills the hole
  with `subjectOptions[0]`, which is not a business rule, it's whatever came back first.
- `subjectOptions` already exists per teacher on the calendar payload, so the input for a proper picker is
  already on the client. The auto-select-when-only-one behaviour (`:576`) is good and should be kept — the ask
  is only for the case where there is more than one.
- ⚠️ **Historical data is already affected.** Voucher bookings made before this fix carry a guessed sport. I am
  **not** proposing to correct them — but nobody should present sport-share or revenue-by-sport as accurate for
  that period. **@Porter will tell the owner** rather than let a chart imply a precision it doesn't have.

## Constraints

- Frontoffice + scheduling API. The booking payload already carries `subjectId` — this is about **asking**, not
  a new contract.
- HOW (dropdown placement, whether it appears before or after the teacher) is the SA's design.

## Out of Scope

- Voucher program **restrictions** (no Onewheel / Balance Play) → **REQ-027**; this REQ makes them enforceable.
- Weekly-default calendar, branch/province filters, teacher-availability filter → deferred by the owner
  (*"ไม่ด่วน จดไว้ ทำทีหลัง"*), tracked separately from the 2026-08-01 meeting doc.

## Questions

1. **Should the program picker offer everything that teacher coaches, or every program the school runs?**
   *(Porter's lean: what the teacher coaches — you cannot book a sport the person in front of the child can't
   teach, and a shorter list is a faster desk.)*
2. **Non-blocking:** should the voucher's program be **changeable afterwards** if staff pick wrong? Today the
   sport is set at booking. *(Porter's lean: yes, before attendance — a typo shouldn't need the booking deleted
   and rebuilt, and this value now feeds money reports.)*

---

## ➕ ADDED 2026-08-01 — 🔴 a student with TWO courses shows as two identical rows

Owner: *"ถ้านักเรียนคนนึงมีสองคอร์สล่ะ น้อง H มีคอร์ส skate และคอร์ส freeskate … มันจะมีให้เลือกมั้ยว่า
เราจะจองลงโดยใช้โควตาคอร์สไหนมาใช้ในการจองแทรกครั้งนั้น"*

**Verified — the data is right and the label is wrong.** `BookingModal.tsx:740`:

```ts
data={eligible.map((e) => ({ value: entKey(e), label: e.nickname || e.name }))}
```

The backend already returns **one row per entitlement** (keyed by `courseId`/`voucherId`) — so the *choice
exists*. But **the label is only the child's nickname**, so น้อง H with two courses renders as **two rows both
reading "น้อง H"**, identical on screen and identical when you type into the searchable box. Staff pick one at
random, and the session silently draws from the wrong course's quota.

**Everything needed to fix it is already fetched** — the `ContextCard` below the picker already shows subject ·
`used`/`size` · `leaveUsed`/`leaveQuota` · expiry, but **only after you have already chosen.** The information
arrives one step too late to inform the decision.

### Added requirement
5. **Each entitlement row must identify itself** — at minimum the child **and the program**, and ideally the
   remaining balance (e.g. *"น้อง H — Freeskate (4/6 ใช้แล้ว, หมดอายุ 30 ก.ย.)"*). Two entitlements for the
   same child must be **distinguishable without selecting them**.

### Added acceptance criteria
- [ ] A student with two courses shows **two rows that can be told apart**, and the booking draws from the one
      that was chosen.
- [ ] The same holds for a student with more than one voucher.

⚠️ **Consequence worth stating:** until this is fixed, any child with two entitlements may have sessions
deducted from the wrong course — which shows up later as a course that ends early and one that never finishes.
**@Porter is telling the owner** rather than letting it be discovered by a parent.
