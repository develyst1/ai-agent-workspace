# REQ-060: เพศและสัญชาติของเด็กที่ import เข้าไป "มองไม่เห็น" ในระบบ — ลูกค้าจึงต้องกรอกใหม่เองทั้งหมด
- Status: READY_FOR_SA
- Priority: 🔴 **HIGH** — it is already costing the customer manual work on live data, every day
- Requested: 2026-08-22 by stakeholder (owner) — *"การสร้างนักเรียนที่เราทำไป มีข้อผิดพลาด คือไม่ทำเรื่องเพศเลย
  ลูกค้าต้องไปใส่เองหมด"*
- Source: owner's report, **now grounded in code and in `uat` data** (DATA REQUEST 2026-08-22)

## 🔻 Correction on the record
Porter previously reported this as **"not an import defect — the source sheet simply had 8 blank rows"**. That was
**wrong**, and it was wrong in the way that matters: it took a real customer-visible fault and closed it. The 8
blank source rows are true but irrelevant. **The owner was right.** The evidence below is the retraction.

## Problem — the value is in the database and the product still shows nothing
The importer writes column F **verbatim**: `student-import.ts:264` → `gender: at(5)`. No normalisation anywhere in
the file (`grep gender` returns exactly two lines: the type and that assignment). The customer's sheet says
`Male` / `Female`, so **`"Male"` is what is stored.**

The product only understands **lowercase**:
- `types/app/people/index.ts:36` — `export const GENDERS = ["male", "female", "other"] as const;`
- `StudentFormModal.tsx:140` — `<Select data={GENDERS.map(...)} value={gender} />` → a value of `"Male"` is **not
  in the option list, so the Select renders EMPTY.**
- `PeopleContent.tsx:62` — `g === "male" ? … : g === "female" ? … : g === "other" ? … : null` → `"Male"` falls
  through to **`null`, so the list prints nothing.**

⇒ **Every imported child displays no gender, in both the list and the edit form, while the database holds it.**
That is precisely what the customer experienced, and re-picking it from the dropdown writes the lowercase value —
which is why exactly one imported row (`คุณมะเหมี่ยว`) now reads `female` while every other imported row still
reads `Female`. **That single row is the fingerprint of the customer doing our work by hand.**

### The same bug, second field: nationality — and this one shows something *false*
`types/app/people/index.ts:40` — `export const THAI_NATIONALITY = "ไทย"`. The importer stored `"Thai"`.
- `StudentFormModal.tsx:52-62` — `nat === THAI_NATIONALITY ? "thai" : "foreign"`. `"Thai" !== "ไทย"` ⇒ the form
  puts every imported **Thai child into the FOREIGN branch** with country text `Thai`.
- ⇒ **The product is not merely silent here, it is wrong**: it presents Thai children as foreign nationals.
- Rows written through the UI store `"ไทย"`; imported rows store `"Thai"` / `"Foreign"`. Both are in `uat` now.

### Blast radius beyond the two screens
The SOM dashboard buckets demographics by these same keys (`OverviewContent.tsx:121-126`, `SomContent.tsx:102`
switch on `"male"`). So the gender and nationality breakdowns **silently split into an unlabelled bucket** for
every imported child — the reports are wrong, quietly, exactly like REQ-053's defect class.

## Measured scope (from the `uat` DATA REQUEST, 2026-08-22)
- **32 students**: 25 created by our importer (08-19 / 08-20 bulk timestamps), 7 typed by hand (08-21).
- **Every importer row carries `Male`/`Female` + `Thai`/`Foreign`** — i.e. all 25 are affected on `uat`.
- **`sid` carries the full rehearsal import (130 students) and has the same fault.**
- ⛔ **16 of these students already have courses attached** — so this is a *repair in place*, never a re-import.

## Requirement
1. **The importer normalises on write** — gender to `male` / `female` / `other`, nationality to `ไทย` for any
   Thai spelling, and a real country name otherwise. It must accept what humans actually type in that sheet
   (`Male`, `M`, `ช`, `ชาย`, `Female`, `F`, `ญ`, `หญิง`, `Thai`, `ไทย`, `TH`).
2. **An unrecognised value is never guessed and never silently dropped** — the row still imports, the field is
   left empty, and the **report says which row and what the unreadable value was**.
3. **The readers are made forgiving** so no single bad row can make a value invisible again: match
   case-insensitively, and show an unknown value **as-is** rather than rendering nothing.
4. **A repair for the data already in `uat` and `sid`** — normalise existing rows **in place**, touching only
   `students.gender` and `students.nationality`, never a name, never a course, never a booking. It must be a
   dry-run-first tool with a per-row report, like every other tool we ship. **The owner runs it.**
5. **A row the customer has already fixed by hand is not overwritten** (`คุณมะเหมี่ยว` must stay `female`).

## Acceptance Criteria
- [ ] **AC-1** — **Given** a sheet row with `Male`, **When** it is imported, **Then** the stored value is `male`
      and the child's gender **is visible in both the People list and the edit form**.
- [ ] **AC-2** — **Given** a sheet row with nationality `Thai`, **When** it is imported, **Then** the edit form
      shows **Thai**, not Foreign-with-country-"Thai".
- [ ] **AC-3** — **Given** a sheet row with an unreadable gender (e.g. `?`), **Then** the child still imports, the
      field is empty, and the report names the row and the value.
- [ ] **AC-4 (the repair)** — **Given** `uat` as it stands today, **When** the repair runs in dry-run, **Then** it
      reports exactly which of the 25 rows it would change, from what to what, and changes nothing.
- [ ] **AC-5 (the repair, committed)** — **When** it is committed, **Then** those students show gender and
      nationality in the product, and **`course_packages`, `bookings`, names and LINE links are byte-identical
      before and after** — verified by count and by spot-check.
- [ ] **AC-6 (no clobber)** — `คุณมะเหมี่ยว`, already corrected by the customer, is reported as
      **"already correct — skipped"**, not rewritten.
- [ ] **AC-7 (reports)** — the SOM demographics breakdown counts every repaired student in a **named** bucket.
- [ ] **AC-8 (regression)** — students created through the UI are unaffected in every respect.

## Constraints
- **Repair in place only.** 16 of the 32 students on `uat` already carry courses — delete-and-re-import is
  forbidden, and this REQ must not become a reason to reopen that idea.
- The team does not run it. Owner runs it, `sid` first, dry-run first (standing rule).

## Out of Scope
- Any other field of the import (names are **REQ-059**; that problem is real but separate).
- Redesigning how demographics are stored (free text stays free text).

## Questions
- **Q1 (to SA):** is `students.gender` read anywhere else we have not listed — LINE flows, exports, the SOM
  service on the back end? Requirement 3 needs the full list of readers, not the two screens Porter found.
- **Q2 (to SA):** should the normaliser live in one shared place used by **both** the importer and the API, so a
  value typed through any door is consistent? Porter's instinct is yes; say if that widens the change too far.

---

## 🚦 SPLIT + PRIORITY — 2026-08-22 (owner's decision: wait for this before importing)
The owner chose to **hold the remaining import until requirement 1 lands**. That makes one part of this REQ
urgent and the rest normal, so the REQ says which rather than leaving SA to guess:

**🔴 PART A — blocking 111 real students, and only this part is blocking**
- **Requirement 1 only: the importer normalises gender and nationality on write** (+ requirement 2's
  "unrecognised is reported, never guessed"). Small, self-contained, no migration, no FE.
- **AC-1 · AC-2 · AC-3** belong to Part A.
- **Why it is worth holding 111 students for:** the alternative is importing them with `Male`/`Thai`, having the
  customer hand-type 111 genders *again* (the exact complaint of 2026-08-22 morning, at 4× scale), and then
  running a repair that must carefully avoid the rows they fixed by hand. **Doing it in the right order removes
  all of that work instead of scheduling it.**

**🟡 PART B — normal priority, nothing waits on it**
- Requirement 3 (forgiving readers), requirement 4 (repair the rows already stored), requirement 5 (never
  overwrite a hand-fixed row) — **AC-4 · AC-5 · AC-6 · AC-7 · AC-8**.
- Part B's repair then only has to cover the **25 rows already on `uat`** (and `sid`'s rehearsal), **not 136**.

**Verification the owner can do himself once Part A ships:** re-run the four dry runs — they must report the same
**3 · 47 · 55 · 6** — then commit. A change in those numbers means the normalisation altered who is importable,
which it must not.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-060 | 🔴 **Imported gender + nationality are INVISIBLE in the product** — the customer has been re-typing by hand | 🔴 **HIGH** | ✅ **PART A DONE (SA-reviewed, tsc 0 · 592/0)** — normalise-on-write; 111 arrived with readable gender (104/105 readable, 1 blank). 🔨 **PART B.1 cut — SPEC-057 + TASK-157 → @Jason (Sober 2026-08-22):** `demographics:repair` in-place fix of the **24** stored `Male`/`Thai` rows on `uat` (+~130 on `sid`), reusing `lib/demographics.ts`; already-normalised skipped (`คุณมะเหมี่ยว` untouched, no special case); never blanks; writes only gender/nationality; PII console counts-only + named report to gitignored project-docs; owner runs on BOTH boxes. **PART B.2 (forgiving readers, req 3) — SPECced, NOT cut: LOW priority, FE+BE, needs Fern → Porter to schedule.** | @Sober. **Porter's earlier "not a defect" verdict is retracted; the owner was right.** `student-import.ts:264` stores column F **verbatim** (`Male`/`Female`, `Thai`), but the product only understands lowercase — `GENDERS = ["male","female","other"]` (`types/app/people/index.ts:36`), so the edit-form `Select` renders **empty** and `PeopleContent.tsx:62` falls through to **`null`**. Nationality is worse: `THAI_NATIONALITY = "ไทย"` ⇒ every imported Thai child is shown as **FOREIGN**. SOM demographics buckets switch on the same lowercase keys ⇒ **the reports are quietly wrong too**. Fix = normalise on write · forgiving readers · **in-place repair** of the 25 rows on `uat` + 130 on `sid` (dry-run first, owner runs it) · **never overwrite a row the customer already fixed** (`คุณมะเหมี่ยว`). |
```
