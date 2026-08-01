# REQ-025: Go-live — bring the courses that are already running (from Excel) into the system

- Status: **READY_FOR_SA (scope-shaping needed — see the 2026-08-01 reframe)**
- Priority: **MEDIUM — bounded and late-scheduled.** Runs **mid-August, ≤7 working days**, ~20–36 families. It gates go-live but is NOT the biggest piece of work before it — see the 2026-08-01 owner correction.
- Requested: 2026-08-01 by the project owner
- Deadline: 🔴 **GO-LIVE = 2026-08-20 — 19 days from 2026-08-01. HARD DATE.**
- Source: stakeholder, raised while answering the revenue-backfill question:
  > *"ถ้าเปิดระบบ แล้ว ระบบ frontoffice มันต้องรับข้อมูล คอร์สที่มันกำลังเดินอยู่ มาระบบเรา จาก เดิม เป็น excel อะไรงี้"*

## Problem / Goal

On launch day the school does **not** start from zero. Children are **mid-course** right now: a family bought a
10-session package in Excel, the child has attended 4, **6 remain**, and the course has an expiry. Vouchers have
hours partly spent. Those courses keep running across the switchover — the business does not pause.

If the system starts empty, then on day one **every one of those children looks like a new customer with no
entitlement.** Staff would have to either re-sell them a course they already paid for, or book them outside any
course — which is exactly the "free sessions" hole TASK-052/055 was built to close. **The safest state of the
new system becomes unusable on the first morning.**

Goal: **the courses and vouchers that are already running come across, with the right balance remaining**, so
launch day is an ordinary day.

## Requirement

1. **Import in-flight entitlements** — course packages and vouchers that are still valid, each with **how much
   has been used and how much remains**, and the correct **expiry**.
2. **Import the people they belong to** — parents and their students, so the entitlement attaches to the right
   child.
3. **Import the sessions already scheduled** beyond the switchover date, so the calendar is not blank on day one.
4. 🔴 **Imported entitlements must NOT post revenue.** That money was **already collected and already counted**
   in the old system. Only **new** sales post revenue.
5. The import must be **checkable before it counts** — staff must be able to see what will be created, and fix
   it, rather than discovering a wrong balance when a parent complains.
6. It must be **re-runnable** — the first attempt will be wrong somewhere, and "fix the spreadsheet and run it
   again" must not create duplicate families or double entitlements.

## Acceptance Criteria

- [ ] A child who is mid-course in Excel appears in the system with the **correct remaining sessions** and the
      **correct expiry**, and can be booked without buying anything.
- [ ] A partly-used voucher shows the **correct remaining hours**.
- [ ] Importing these entitlements produces **no revenue** in the P&L; a sale made **after** go-live does.
- [ ] Staff can review the import before it takes effect and correct it.
- [ ] Running the import twice does not duplicate families, courses or vouchers.
- [ ] Existing behaviour is untouched for customers created normally.

## Analysis / current state (Porter, read-only — for SA to verify)

- **Nothing like this exists.** Every entitlement in the system today is created by *selling* it, and selling is
  precisely the path that posts revenue — so the obvious shortcut (just sell them all again at go-live) would
  **double-count revenue** for money collected months ago. That is the crux of this REQ.
- The pieces to attach to already exist: parents + students (REQ-019), course packages with size/used/expiry,
  vouchers with hours/expiry, and bookings. This is mostly **an import path and a "don't post revenue" flag**,
  not new domain concepts.
- ⚠️ **Directly relevant to the sales repair (TASK-066):** revenue posting now happens at the point of sale.
  Whatever the SA designs here must make "created by import" distinguishable from "sold", or launch day will
  post a large, entirely fictional month of revenue.
- The 2026-07-25 meeting defines "current customers" as **course/voucher not expired, or a trial within the last
  3 months** — a reasonable definition of *what to import*, and it already feeds REQ-013's dashboard.

## Constraints

- Frontoffice + scheduling API. **Never run SQL against a real database** — whatever is built must be usable by
  the stakeholder, not by an engineer with database access.
- The source data is a **spreadsheet maintained by hand**; assume it is inconsistent, incomplete and contains
  duplicates. A design that only works on clean data does not work.
- HOW (file upload vs paste vs a staff screen, matching rules, staging) is the SA's design.

## Out of Scope

- Historical revenue and past attendance — **not** being imported (see Questions Q1).
- The old Excel file's own structure. We define what we need; the stakeholder maps it.

## Questions

(Porter → stakeholder. These are needed before this can go to the SA.)

1. **Confirm the money rule:** courses already paid for in Excel come in **as entitlement only, with no
   revenue recorded**, because that money was already counted in the old system. Only sales made in the new
   system count as revenue. *(Porter's strong recommendation — recording it again would inflate the launch month
   by the value of every outstanding course.)*
2. **How much history do you want?** My recommendation is **only what is still live** — unexpired courses and
   vouchers, plus sessions from the switchover date forward. Past attendance and finished courses stay in the
   spreadsheet as the historical record. Importing dead data multiplies the work and the risk of errors for
   information nobody acts on.
3. **How many are we talking about?** Roughly how many families, and how many live courses/vouchers? A few
   dozen and a few hundred are different designs — a staff screen versus a file import.
4. **When is go-live?** This has no deadline pressure until there is a date, and then it has a hard one.
5. **Can we see a copy of the spreadsheet** (or a few example rows, names removed)? What it actually contains
   decides the entire design — and I would rather look at the real thing than build against an assumption.
   ⚠️ If it contains customers' personal data, please **remove names and phone numbers first**; the structure
   is what matters, not the contents.

---

## ✅ ANSWERS + 🔁 REFRAME (Porter, from the project owner 2026-08-01)

**Q1 (money rule) — answered, and it is NOT the constraint I thought it was.**
> *"ฉันว่ารายได้อะ ย้ายมาจากระบบเก่า ไม่ติด"*

Revenue migration is **not a problem to solve**. I had built this REQ around the double-counting trap; the owner
is untroubled by it. **So the money question stops driving the design** — recording or not recording historical
revenue is a detail, not the point. Keep the safe default (**import creates entitlement, not revenue**) unless
someone asks otherwise, but do **not** spend design effort on it.

**Q4 (date) — 🔴 GO-LIVE IS 2026-08-20.** Nineteen days. This REQ went from undated to the hardest date in the
project in one message.

**Q5 (spreadsheet) — on hold at the owner's request** (*"excel รอก่อน"*). So the file's shape is still unknown.

---

### 🔁 The reframe — this is probably NOT a spreadsheet importer

The owner restated the actual requirement, and it is narrower and more human than what I wrote:

> *"คุณฟีนต้องการให้ frontoffice สามารถเดินคอร์สต่อจากระบบเดิมได้ โดยง่าย"*

The goal is **"continue an existing course, easily"** — a **staff** capability, not a data-migration project.
Note the word **โดยง่าย**: the person doing this is an admin at a desk, not an engineer.

**What that changes.** The system today can only create a course by **selling** a brand-new one, which always
starts at **0 sessions used**. The single missing thing may be as small as:

> **let staff register a course that is already part-way through — "10 sessions, 4 already used, expires X"**

If that exists, launch day is: staff enter the families that are mid-course, as they come, and everything else
(booking, quota, leave, extension, expiry) works because it is a normal course from that point on. Same for a
part-used voucher.

**Why this reading is worth taking seriously in a 19-day window:**
- It needs **no file parsing, no matching rules, no staging screen, no PII handling** — the four expensive and
  risky parts of the version I wrote.
- It is **incremental and self-correcting**: a wrong balance is fixed by editing one course, not by re-running
  an import and reconciling duplicates.
- It stays useful **after** go-live — a family who bought elsewhere, a correction, a course rebuilt after a
  mistake. A one-shot importer is dead code the day after launch.
- **The trade-off, stated honestly:** it does not scale. Entering a few hundred families by hand is a bad day;
  entering a few dozen is an afternoon. **This is exactly why Q3 (how many?) is now the load-bearing question,**
  and it is the one still unanswered.

**⚠️ Not a decision — a proposal to size.** The SA should judge whether the small version is sufficient, and say
so plainly if the volume or the spreadsheet's shape makes a real importer unavoidable. **What I do not want is
a full migration tool built by reflex when a "used count" field would have done**, three weeks before launch.

### Still open (Porter → owner)
- **Q3 — how many families / live courses?** Now the single most important unanswered question: it decides
  small-feature vs importer.
- **Q2 — confirm "only what is still live"** (unexpired courses/vouchers + sessions from 2026-08-20 forward).
- **Q5 — the spreadsheet**, when the owner is ready. Structure only; names and phone numbers removed.

---

## 🔻 OWNER CORRECTION 2026-08-01 — Porter over-sized this, and mis-ranked it

> *"ประมาณ 20-36 ครอบครัว · อย่าเรียงความสำคัญผิดไป · เราสามารถมารันเรื่องนี้ประมาณกลางเดือนได้ แล้วมีเวลา
> 1 week ในการทำ · ฉันว่าไม่น่ายาก"*

**Q3 answered: ~20–36 families.** That settles it — **the small version is correct**, and the importer version
of this REQ is over-engineering. At that volume the data entry itself is roughly an afternoon.

**Scheduling: run this MID-AUGUST with ~7 working days.** It does not need to compete with the rest of the work
now, and treating it as the project's centre of gravity was my error.

### 🔁 The owner's framing, which is better than mine

> *"ซึ่งมันคือเรื่อง booking ซะส่วนใหญ่ ซึ่งก็มีแค่สี่ไทป์ ก็แค่เตรียมใจ เตรียมสมอง รอทำงานย้ายให้เสร็จ"*

**Migration is mostly a booking problem, and there are only four booking types.** So this is not separate work
competing for time — **it falls out of a booking system that is correct and complete.** Get the core right and
the migration is data entry; get the core wrong and no importer saves it.

**What this means concretely:** the preparation for REQ-025 is **not** building an import tool now. It is making
sure the booking core can express *"this course is already part-way through"* cleanly — which is a small,
well-placed capability inside work that is happening anyway, not a project.

### Revised scope
1. Staff can register a **course already in progress** (size, sessions already used, expiry) — the whole feature.
2. Same for a **partly-used voucher** (hours remaining, expiry).
3. Usable by an admin at a desk (**"โดยง่าย"**), re-editable when a number is wrong.
4. No file import, no matching rules, no staging screen, no PII handling. ~20–36 families does not justify them.

### Withdrawn from this REQ
- The importer, the review/staging screen, and the re-runnable de-duplication (requirement items 5–6 above).
  Written for an unknown volume; the volume is now known and does not support them.
- **Q5 (see the spreadsheet)** — no longer blocking. Useful to eyeball before the mid-August run, not before design.
