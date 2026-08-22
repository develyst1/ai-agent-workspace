# SPEC-054: Importer normalises gender & nationality on write (REQ-060 **Part A**)

- Source: REQ-060 Part A (requirements 1 + 2; AC-1 / AC-2 / AC-3)
- Author: Sober (SA) 2026-08-22
- Status: READY — task cut (TASK-154). **BE-only, no migration, no FE.** This is the single thing gating 111
  verified students (owner chose to hold the import until it lands).
- Scope note: **Part B** (forgiving readers + the in-place repair of the 25/130 already-stored rows — AC-4→8) is a
  **separate later task**; this spec is Part A only.

## The whole of Part A in one sentence

The importer currently stores column E/F **verbatim** (`student-import.ts:262-263` → `nationality: at(4)`,
`gender: at(5)`), so `Male` / `Thai` reach the DB and the product — which only understands `male` / `ไทย` — shows
nothing (gender) or something false (Thai child in the Foreign branch). **Part A puts a normaliser between the
parsed row and the write** so the stored value is what every existing reader already expects. No reader changes; the
fix is entirely on write.

## Design

### 1. A pure module `src/lib/demographics.ts` (mirrors the house "pure rule, unit-tested" pattern)

Two functions, each returning both the normalised value **and** whether a *non-empty* input was unreadable (so the
importer can report it per requirement 2 without guessing):

```
normalizeGender(raw: string): { value: "male" | "female" | "other" | null; unreadable: string | null }
normalizeNationality(raw: string): { value: string | null; unreadable: string | null }
```

- **Gender mapping** (case-insensitive, trimmed): `male` ← `Male`, `M`, `male`, `ช`, `ชาย`; `female` ← `Female`,
  `F`, `female`, `ญ`, `หญิง`; `other` ← `other`, `อื่น`, `อื่นๆ`.
  - **Empty input → `{ value: null, unreadable: null }`** — an empty gender cell is a legitimate "no gender"
    (the REQ's own analysis: 8 source rows are genuinely blank), **not** an error, and must **not** appear in the
    report. Only a **non-empty** value that matches nothing → `{ value: null, unreadable: raw }` (AC-3).
- **Nationality mapping** (case-insensitive, trimmed): `ไทย` ← `Thai`, `ไทย`, `TH`, `thai`. **Anything else is a
  real free-text nationality and passes through verbatim** (`Japan`, `Taiwan`, `Foreign`) → `{ value: raw,
  unreadable: null }`. Empty → `{ value: null, unreadable: null }`. Nationality is a free-text field with a binary
  `ไทย`-vs-foreign reader, so pass-through is faithful and needs no guessing.
  - **Documented consequence (not a question, not a defect):** a literal `Foreign` with no country stored as
    `Foreign` will display in the product's Foreign branch with the country text "Foreign" until the customer
    supplies the real country. That is honest to the source; inventing a country would not be. It is a data gap for
    the customer, adjacent to REQ-059, **out of Part A's scope.**

### 2. Wire it into the importer only

In the importer's row→student mapping (the path that today passes `gender`/`nationality` straight to
`createStudentForParent` → `parent.service.ts:112-114`), replace the raw values with
`normalizeGender(row.gender).value` / `normalizeNationality(row.nationality).value`, and when either returns a
non-null `unreadable`, add a line to the **existing per-row report** naming the `excelRow` and the unreadable value
(reuse the report channel the importer already writes; do not invent a new one).

**Do NOT touch the API write path (`parent.service` / `validation.ts`) in Part A.** The UI already writes lowercase
via its `<Select>`, so the live path is not the bug, and changing it here would widen the blast radius onto the
customer's daily-used form for no Part-A benefit. **Q2 answered: yes, one shared normaliser — and it now exists in
`lib/demographics.ts`; the API adopting it is a trivial, safe follow-up, filed with Part B, not smuggled into A.**

## Acceptance mapping

- **AC-1** — `Male` → stored `male` → visible in the People list and edit form ⇐ `normalizeGender` + the existing
  lowercase readers (`GENDERS`, `PeopleContent.tsx:62`) now match.
- **AC-2** — `Thai` → stored `ไทย` → edit form shows Thai, not Foreign-with-country-"Thai" ⇐ `normalizeNationality`
  maps to `ไทย`, so `StudentFormModal.tsx`'s `nat === THAI_NATIONALITY` branch is taken.
- **AC-3** — a non-empty unreadable gender (e.g. `?`) → child still imports, gender empty, **report names the row
  and the value** ⇐ `{ value: null, unreadable: "?" }` + the report line; the row is **not** held.

## Verification the design must preserve (owner re-runs)

Normalisation changes **what is written**, never **who is importable**. So after Part A, the four dry runs must
**still report `3 · 47 · 55 · 6`** (Fri/Sat/Sun/Voucher). A change in those counts means the normaliser altered the
hold/import decision — which it must not: an unreadable gender leaves the field empty and the child **still
imports**. The task's DoD asserts this explicitly.

## Q1 — the full reader list (so Part B's forgiving readers are scoped, not rediscovered)

Readers of `students.gender` / `students.nationality`: **FE** — `StudentFormModal.tsx` (edit form),
`PeopleContent.tsx:62` (list), `OverviewContent.tsx:121-126` + `SomContent.tsx:102` (SOM demographics). **BE** —
`som-report.service.ts:118,121` (the demographics breakdown that silently mis-buckets), `attention.ts:72`
(own-missing check). **None require changes for Part A** (normalise-on-write makes them correct); making them
case-insensitive / show-unknown-as-is is **Part B requirement 3** — defence-in-depth so no single bad row can make
a value invisible again.

## Out of scope (Part A)

- The in-place repair of already-stored rows and the no-clobber rule (`คุณมะเหมี่ยว`) — **Part B (AC-4→8)**.
- Forgiving readers — Part B requirement 3.
- Names — REQ-059. Storage redesign — explicitly excluded by REQ-060.
