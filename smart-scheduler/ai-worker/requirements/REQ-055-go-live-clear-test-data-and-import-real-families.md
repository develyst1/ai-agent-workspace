# REQ-055: Go-live — wipe the test data, then load the customer's real families and students
- Status: **READY_FOR_SA** (with two DATA REQUESTs open — they gate the import, not the wipe)
- Priority: 🔴 **HIGHEST** — the customer wants to start using the system; nothing else outranks this
- Requested: 2026-08-16 by stakeholder (owner)
- Deadline: none stated, but treat as "the customer is waiting"
- Source: owner, 2026-08-16 — customer sent `Student list.xlsx` and asked us to load their children and families,
  *"และบอกให้เราเคลียร์ข้อมูลเทสก่อนด้วย"*. Owner's decision: **clear first, then load, then hand it to them.**

## Problem / Goal
The customer is ready to use the product for real. Two things stand in the way:
1. The environment is full of **our test data** — QA students, demo parents, throwaway courses/vouchers, and the
   `QA-prod-*` residue the board has been carrying as housekeeping.
2. Their **real families and students are not in the system**; they exist only in a spreadsheet.

**Goal: the customer opens the system and sees their own school — their children, their families, nobody else's,
and none of ours.**

## What the file actually contains (Porter, read-only inspection — SA to verify against the real file)
`Student list.xlsx`, one sheet, columns **A–H**:

| Col | Header | Notes |
|---|---|---|
| A | `Date` | populated on every row — appears to be the **day-of-week grouping** (Monday / Tuesday / Wed / Thu …) |
| B | `No.` | row numbering |
| C | `Name` | the student — **mostly Thai nicknames**, some English, a few "nickname (nickname)" forms |
| D | `DOB` | date of birth, `DD/MM/YYYY` text in at least some rows |
| E | `Thai or Foreign` | `Thai` / `Foreign` |
| F | `Gender` | `Male` / `Female` |
| G | `Parant Phone Number` *(sic)* | the parent's phone — at least one value appears as `964635154` (**9 digits, leading zero lost** — a classic spreadsheet number-format casualty) |
| H | *(no header)* | ~172 values, contents unclear; at least one reads `Voucher` |

Roughly **175 rows carry a name**. 🔴 **What the file does NOT contain: teacher, time, program/sport, package
size, sessions already used, or expiry.** So this file can create **people**; it **cannot** create their courses.

### 🔴 Owner-confirmed, plus what a screenshot of the real sheet revealed (2026-08-16)
Confirmed by the owner: **column D = the child's date of birth** · **column H = a family/parent note** (e.g.
*"คุณแม่จิ๋ว"*), not a voucher marker · **the teacher roster in the system is already the real one** — this import
is people only ·
**Column A = the child’s class day** — **confirmed by the owner in the evening of 2026-08-16** (see the UPDATE block at the end of this file). Earlier in the day Porter had inferred this, been corrected for presenting an inference as the owner’s answer, and marked it unknown; the owner then checked and confirmed it himself. It is **not used in wave 1** (*“ไม่เกี่ยว ช่างมันไป”*) — it is preserved per AC-12 and it **orders the import batches**. ·
**courses come later**: the customer will send them and will want our help loading them, but *"ตอนนี้ยัง เขาให้แค่
เด็กๆ มา เราแค่เอาเข้า master เด็กๆ และครอบครัวรอ"* ⇒ **wave 1 = master data only, confirmed.**

**Five data hazards visible in the sheet itself — every one of them will produce a wrong or missing family if the
import is written optimistically:**
1. **Phones have lost their leading zero** — the sheet shows `864197169`, `819255015`, `992649191` (9 digits) and
   at least one `81296989` (**8 digits**). They are `0` + the value, but the 8-digit case needs a decision, not a
   guess.
2. **Some students have NO phone at all** (several rows are blank in column G). Requirement 4 keys families by
   phone — so these children **cannot be attached to a parent** and must be reported, not dropped.
3. **The same phone appears on more than one child** (`656269656` on two different rows) — this is the
   two-children-one-family case working as intended (AC-3), *provided* the import merges instead of duplicating.
4. **Dates of birth are inconsistently formatted** — `9/3/2024` and `22/4/2020` alongside `22022020` (no
   separators) and `3072021` (**7 digits — ambiguous**: 3/07/2021? 30/7/2021?). Some rows have no DOB at all.
5. **Some rows are a PARENT, not a child** — e.g. a row whose name reads *"คุณแม่น้อง Peeta"* sits in the student
   list next to the child *"Peeta"*. Importing that row as a student invents a child who does not exist.
6. **Some rows are highlighted yellow** in the sheet; the meaning is the customer's, not ours (Q6 below).

## Requirement
1. **Back up first.** A full DB backup, verified non-zero, before anything is deleted. Nothing in this REQ starts
   without it.
2. **Remove all test/demo data** from the customer environment — QA students/parents, demo courses, vouchers,
   bookings and their sessions, including the `QA-prod-*` residue already on the housekeeping list.
3. **Import the customer's real parents and students** from their file: student name/nickname, DOB, gender,
   Thai/foreign, and the parent, keyed by the parent's phone.
4. **One parent per phone, children attached to that parent** — two children sharing a phone become **one family
   with two students**, never two parents.
5. **The import is repeatable and reversible**: run it twice and nothing duplicates; if it goes wrong, the backup
   restores a clean state.
6. **A written result the owner can hand to the customer**: how many families, how many students, and **an
   explicit list of every row that was skipped or needed a judgement call** — not a silent "done".
7. **Nothing invented.** Where the file is silent (course, program, teacher, time, remaining sessions), the import
   leaves it empty. Courses are a separate step (REQ-025 exists for mid-course migration) once the missing data
   arrives.

## Acceptance Criteria
- [ ] **AC-1 (clean slate)** — **Given** the import has run, **When** staff search the system, **Then** **no**
      test/demo/QA record is findable (students, parents, courses, vouchers, bookings), and the customer's own
      records are.
- [ ] **AC-2 (counts match)** — **Given** the source file has N rows with a name, **When** the import finishes,
      **Then** the report accounts for **every** row: imported + skipped-with-reason = N. No row disappears.
- [ ] **AC-3 (families, not duplicates)** — **Given** two students share one parent phone, **When** imported,
      **Then** there is **one** parent with **two** students — verifiable on the People screen.
- [ ] **AC-4 (phones get their leading zero back — owner's instruction)** — **Given** a phone stored in the sheet
      without its leading zero (Excel dropped it on **every** row; they arrive as `8.64197169E8`), **When**
      imported, **Then** it is stored as `0` + those digits (`864197169` → `0864197169`). **A result that is not
      exactly 10 digits is never stored** — it goes on the hold-back list instead (1 row today: an 8-digit value).
- [ ] **AC-5 (Thai text intact)** — Thai nicknames render correctly everywhere they appear (no mojibake, no
      truncation), including the calendar cell and the LINE bot.
- [ ] **AC-6 (idempotent)** — Running the import a second time changes nothing and creates no duplicates.
- [ ] **AC-7 (no invention)** — No student ends up with a course, voucher, program or booking that the file did
      not contain.
- [ ] **AC-8 (rollback proven)** — The backup taken in requirement 1 is confirmed restorable **before** the wipe,
      not assumed.
- [ ] **AC-9 (no phone ⇒ HELD BACK, on a list — owner chose (ข))** — **Given** a row with a name but **no** parent
      phone, **When** the import runs, **Then** that child is **not imported**, and appears on the hold-back list
      the owner sends to the customer. They are imported in a later pass once the phone comes back. **32 rows are
      in this state today.**
- [ ] **AC-10 (ambiguous DOB is never guessed)** — **Given** a DOB the parser cannot read unambiguously (`3072021`,
      `22022020`, blank), **When** the import runs, **Then** it is left **empty** and listed in the report. A
      child's birthday is not a field to invent — it drives nothing today and can be filled in later by staff.
- [ ] **AC-11 (parent rows are not turned into children)** — **Given** a row whose name is plainly a parent
      (*"คุณแม่น้อง …"*), **When** the import runs, **Then** it is **not** created as a student; it is reported for
      a human decision.
- [ ] **AC-12 (column A is preserved verbatim, and interpreted by nobody)** — **Given** column A's meaning is
      **unknown** (Q3), **When** the import runs, **Then** its raw value is **kept as an untouched note** on the
      imported row and used for **nothing** — no schedule, no day-of-week, no inference. If the customer's answer
      later gives it meaning, it is already there; if it turns out to be an internal working note, nothing in the
      product ever depended on it.

## Constraints
- **The file contains real children's personal data** (names, dates of birth, parents' phone numbers). It lives in
  `../project-docs/` **only** — which is gitignored — and **never** in a tracked file, a REQ/SPEC/TASK, a log
  entry, or pasted output. Row-level examples in any artifact must be anonymised.
- **The team never runs this against the customer environment.** The owner runs every step; the team supplies the
  exact commands and reads back what he returns (PROTOCOL brownfield rule).
- The wipe and the import are **one operation in the owner's mind but two gates in ours**: nothing is deleted until
  the backup is verified, and nothing is imported until the wipe is confirmed clean.

## Out of Scope
- Creating the customer's **courses / packages / schedules** — the data isn't in this file (see DATA REQUEST 1).
- LINE pairing for the imported parents (they pair themselves; REQ-020's flow is unchanged).
- Any change to how People/parents/students work — this is a data operation, not a feature.

## Questions / DATA REQUESTs
- **DATA REQUEST 1 (to owner → customer — this is the big one):** the file has **no program, teacher, time,
  package size, sessions used, or expiry**. Their children are presumably **mid-course right now**. To put their
  real schedule in we need, per student: **which program, which package (4/6/10), how many sessions already used,
  which day + time, and which coach.** Without it we can import people but their timetable stays empty.
  **Porter's recommendation: import the people now (it is safe, useful and unblocks LINE pairing), and treat the
  schedule as a second wave** once the customer sends the missing columns.
- **Q2 (to owner): what is column H?**
  > **answered 2026-08-16: a family / mother's name note** (*"เห็นมีแค่บอกชื่อครอบครัว ชื่อแม่"*), e.g. `คุณแม่จิ๋ว`.
  > ⇒ **Import it as the parent's name** where present — it is the only parent *name* the file carries, and a
  > family called "0864197169" is a worse product than a family called "คุณแม่จิ๋ว". Where absent, the parent is
  > created from the phone and staff can name them later.
- **Q3 (to owner): is column A the day of the week?**
  > **CORRECTION 2026-08-16 — still UNANSWERED. Porter previously recorded this as "owner-confirmed: yes"; that
  > was wrong.** The owner did not say it — Porter inferred it from the merged Wed/Thu/Fri labels and wrote it up
  > as his answer. His actual position: *"ฉันไม่รู้ว่ามันคืออะไร เดี๋ยวถามลูกค้าให้ … นี่คือ MASTER student เพราะงั้น
  > เลยไม่คิดว่าจะเป็นวันที่เด็กมาเรียน น่าจะเป็นวันที่ต้องใช้งาน เช่น ใช้งานวันจันทร์ ให้ฉันทำให้ก่อนวันจันทร์"* — i.e. on a
  > master list a weekday is at least as likely to be a **deadline the customer set us** as a class day.
  > ⇒ **Owner is asking the customer.** Until then: **AC-12 keeps the raw value and nobody interprets it**, and no
  > wave-2 assumption may lean on it. This is the second time today I have relayed an inference as a confirmed
  > fact (REQ-044 was the first) — both times about a screen or file I had not verified. Recording it here rather
  > than quietly fixing it, because a REQ that says "owner confirmed" is trusted by everyone downstream.
- **Q4 (to owner): are the teachers in the system already the real ones?**
  > **answered 2026-08-16: yes.** ⇒ the roster is out of scope here; this import is families + students only.
- **Q5 (to owner): are the courses coming?**
  > **answered 2026-08-16: yes, later** — the customer will send them and wants our help loading them; for now
  > *"เราแค่เอาเข้า master เด็กๆ และครอบครัว"*. ⇒ **Wave 1 = master data. Confirmed, and the REQ is scoped to it.**
- **Q6 (to owner — new, from the sheet):** several rows are **highlighted yellow**. That is the customer's marking
  and we should not guess at it — please ask them what it means. If it marks "not active / left / on hold", those
  children may not belong in the import at all.
  > answer: _pending_
- **Q7 (to owner — decides AC-9):** children with no parent phone — import anyway, or hold back?
  > **answer (owner, 2026-08-16): (ข) hold them back** and put them on a list for the customer. My lean was (a);
  > overruled, and his reasoning is the stronger one for a **go-live**: a child with no parent in the system is a
  > family nobody can contact, cannot pair to LINE, and cannot be found by the walk-in page — importing them just
  > moves the gap somewhere less visible. **32 rows today.**
- **Q8 (to owner):** rows that are a parent, not a child.
  > **answer (owner, 2026-08-16): use them as the family / parent's name** — *"แถวที่มีชื่อแม่ ชื่อ ผปค. ก็เอาไป
  > ตั้งชื่อครอบครัวไป หรือก็คือชื่อ ผปค. นั่นแหละ"*. Same treatment as column H. **They are never created as
  > students** (AC-11 stands). **4 rows today.**
- **Owner's instruction on phones (2026-08-16):** *"นายทำข้อมูลลงโดยมี 0 ข้างหน้าเลย"* ⇒ AC-4 rewritten: prefix the
  `0` automatically; anything that isn't then exactly 10 digits goes on the hold-back list rather than into the DB.
- **Owner's instruction on the problem list (2026-08-16):** *"ไอ่คนที่มีปัญหา ให้ลิสต์มาให้ฉัน จะเอาไปแจ้งลูกค้าให้ ทั้งชื่อ
  และปัญหาที่เป็น"* ⇒ **Porter produced it from the file** (read-only, no import run):
  **`../project-docs/2026-08-16-student-import-issues.md`** — 176 named rows · **124 clean** · **52 needing the
  customer's confirmation** · **21 families with more than one child**. Breakdown: 32 no phone · 40 no DOB · 11 DOB
  needing confirmation (e.g. `22022020` → almost certainly 22/02/2020 typed without slashes; one reads as 1985,
  which is not a child's birth year) · 4 parent-rows · 1 phone that is 9 digits even after the leading zero.
  The file stays in gitignored `project-docs/`; **this REQ carries the counts, never the rows.**
- **Q5 (to SA):** does an import path exist today (REQ-019's People screens, a script, a CSV route), or does this
  need a one-off importer? Say which, and whether it can produce the AC-2 reconciliation report.

---

## 🔄 UPDATE 2026-08-16 (evening) — the last two unknowns are answered, and the import is now a plan, not a blob

**Owner's answers:**
- **Yellow highlight = "ยังไม่พร้อม" (not ready).** ⇒ **those rows are excluded from this import entirely** — not
  "imported with a flag", not "imported and hidden". **27 rows.** They come back in a later pass when the customer
  says they are ready.
- **Column A *is* the child's class day** — *"ตารางเรียนน้องวันไหน"* — but it is **not needed for wave 1**
  (*"ไม่เกี่ยว ช่างมันไป"*). It stays preserved per AC-12 and becomes wave 2's starting point.
  *(Note for the record: this is what Porter originally inferred, then correctly retracted when the owner said he
  had not confirmed it. It is confirmed now — by him, not by me.)*
- 🔴 **The import runs DAY BY DAY, top-down** — *"เราจะเริ่มทำจากข้างบนทีละวัน"*. Not one 176-row transaction.

## Re-analysis with those rules applied (Porter, from the file)
**176 named rows → ✅ 110 import now · ⚠️ 39 need the customer's confirmation · ⛔ 27 not ready (yellow) ·
21 families with more than one child.**
Remaining issues among the 39: 23 no phone · 31 no DOB · 8 DOB needing confirmation · 4 parent-rows.

**Day batches (the order of work):**

| วัน | ทั้งหมด | ✅ นำเข้าได้ | ⚠️ ต้องยืนยัน | ⛔ ยังไม่พร้อม |
|---|---|---|---|---|
| Monday | 9 | 5 | 4 | 0 |
| Tuesday | 9 | 4 | 2 | 3 |
| Wed | 4 | 4 | 0 | 0 |
| Thu | 11 | 5 | 2 | 4 |
| Fri | 3 | 2 | 1 | 0 |
| **Sat** | **55** | 41 | 10 | 4 |
| **Sun** | **80** | 44 | 20 | 16 |
| Voucher | 5 | 5 | 0 | 0 |

*(per-day breakdown in `../project-docs/2026-08-16-student-import-issues.md`)*

**Two things this table changes about the plan:**
1. **The weekend is the product.** Sat + Sun = **135 of 176** children. A day-by-day run means Mon–Fri (36 rows) is
   a genuine rehearsal — small, low-risk, and it proves the importer before it touches the bulk. **Porter's
   recommendation: run Monday first, stop, and have the owner look at the result on screen before continuing.**
2. **Column A also contains a `Voucher` group (5 rows)** — that is not a weekday, so those children attend on no
   fixed day. They are imported as people like everyone else; the label matters only to wave 2.

## Additional acceptance criteria from this update
- [ ] **AC-13 (yellow rows are excluded, visibly)** — **Given** the 27 not-ready rows, **When** the import runs,
      **Then** none of them exists in the system afterwards, and they appear as their own list — never mixed into
      the "needs confirmation" list, because the two need different actions from the customer.
- [ ] **AC-14 (day-by-day, resumable)** — **Given** the owner runs one day's batch, **When** it finishes,
      **Then** the result is reviewable on screen before the next day starts, and re-running a completed day
      changes nothing (AC-6 idempotency applies per batch, not just overall).

## 🔄 UPDATE 2 (2026-08-16, evening) — the report is a WORK CHECKLIST for the owner, not a letter to the customer
Porter had framed the output as "a list to send the customer". **Wrong shape.** The owner corrected the workflow:
the customer keeps the sheet as a **live Excel Online document**; he only downloaded a copy for us. What he
actually needs is: *"ทีมนายแค่ทำสิ่งที่ทำได้ แล้วบอกฉันว่าใครทำไปแล้วบ้าง และใครติด เพราะอะไร"* — **he then colours
the finished rows green in the online sheet himself.**

**Consequences for what this REQ delivers:**
1. **The report is keyed to the Excel ROW NUMBER and sorted by it**, top-down, so he can walk the online sheet in
   order without hunting. Grouping by problem type made him cross-reference; grouping by row lets him work.
2. **Three states per row, and only three:** ✅ ทำได้ (imported / importable) · ⚠️ ติด + **the reason in the same
   row** · ⛔ ยังไม่พร้อม (the customer's own yellow — the team does not touch these at all).
3. **The report is produced again after every batch actually runs**, listing what really landed — not only the
   pre-run prediction. Green in the sheet must mean "in the system", so the list he colours from has to be the
   post-run truth.
4. **We do not write to the customer.** Anything that needs the customer goes to the owner, in his list, and he
   carries it.

- [ ] **AC-15 (row-keyed reconciliation)** — **Given** a batch has run, **When** the report is produced, **Then**
      every line carries the **source Excel row number**, its status (✅/⚠️/⛔) and, when stuck, the reason — and the
      ✅ set is exactly what exists in the system, verifiable by opening the People screen.
- [ ] **AC-16 (nothing yellow is touched)** — no row the customer highlighted yellow is created, updated or
      reported as done, in any batch.

## 🔄 UPDATE 3 (2026-08-19) — the owner's actual plan: BOTH environments, and `sid` is the rehearsal
Porter had scoped this REQ to the customer box only. **Wrong.** The owner's instruction:
*"ให้นายทำการเคลียร์ข้อมูลทั้งหมดที่ sid และ uat พวกข้อมูลเทสๆ เอาออก แล้วเราจะเอาข้อมูลขึ้น sid ดู ถ้ามัน work ก็จะเอาขึ้น uat"*

⇒ **The data operation follows the same rule he set for migrations: `sid` first, prove it, then `uat`.**

**Revised sequence (both environments, in this order):**
1. **`sid`**: verified backup → wipe test data → import the top day → **look at it in the product** → continue
   day by day.
2. **Only when `sid` looks right**: the identical run on **`uat`**, which is what the customer receives.

**Why this is better than what I had written, and worth saying rather than quietly patching:** the wipe and the
import both run for the first time in their lives. On `uat` a mistake costs the customer their opening day; on
`sid` it costs a re-run. The rehearsal is free and I should have proposed it — he did.

- [ ] **AC-17 (`sid` rehearsal first)** — **Given** the wipe + import have never been run, **When** they are run,
      **Then** they run on **`sid`** first and the owner confirms the result **in the product** before `uat` is
      touched at all.
- [ ] **AC-18 (both environments end clean)** — **Given** both runs are complete, **When** staff look at either
      environment, **Then** neither contains QA/demo/test records, and both contain the same real families and
      students for the days imported so far.

**Consequence for the reset script (REQ-040's `db:reset`, still unbuilt):** it is now needed **twice**, on two
environments, by someone who should not be hand-deleting rows in a UI. That settles the "could the owner just
click them away tonight" question — for `sid` maybe, for a repeatable two-environment operation, no. **It is the
critical-path item.**
