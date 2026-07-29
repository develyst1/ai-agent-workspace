# TASK-033: scheduling — fix student search (phone clause matches all on a non-numeric query)
- Source: SPEC-009
- Status: DONE  (reviewed 2026-07-29 by Sober — verified tsc 0 / test 4/0 / full suite 106/0 + code inspection; see ## Review)
- Depends on: none
- Assignee: @Jason (smart-scheduler-back, port 4006)

## The bug
`GET /students?q=` returns the **whole** roster for any text search, so the booking Student picker never
filters (REQ-011, stakeholder screenshots). Root cause (Sober traced — it's backend, not FE):
`searchStudents` (`src/services/parent.service.ts:147`) does
```
or( ilike(students.name, `%${q.trim()}%`),
    ilike(students.nickname, `%${q.trim()}%`),
    ilike(parents.phone, `%${normalizePhone(q)}%`) )
```
`normalizePhone(q)` (`:17`) strips non-digits, so a text query like "โอ๊ด" → `""` → the phone term is
`ilike(parents.phone, '%%')`, which matches **every student with a parent phone** → the `or(...)` is true for
almost everyone. The name/nickname terms are correct; the phone term defeats them for any non-numeric query.
The FE (StudentSelect → useStudentSearch → `GET /students?q=`) is correctly wired — do **not** touch it.

## What to do
In `searchStudents`, include the **phone** `ilike` only when the query actually has digits:
- `const digits = normalizePhone(q);`
- OR-conditions = `[ ilike(students.name, `%${q.trim()}%`), ilike(students.nickname, `%${q.trim()}%`) ]`,
  and **push** `ilike(parents.phone, `%${digits}%`)` **only if `digits` is non-empty**.
- Keep the outer `q && q.trim() ? or(...conditions) : sql`true`` shape (empty q → normal list), and everything
  else (leftJoin, `orderBy(asc(name))`, `limit`, the row→DTO mapping incl. `label`) unchanged.

Nothing else changes — no route, schema, DTO, or FE change.

## Definition of Done
- [ ] `searchStudents("โอ๊ด")` (a name with no digits) returns only students whose **name or nickname** contains
      "โอ๊ด" — not the whole roster (this is the reported bug).
- [ ] `searchStudents("081")` (digits) still matches by **parent phone** (and name/nickname if they contain it).
- [ ] Empty / absent `q` still returns the normal list (unchanged).
- [ ] Add a unit/integration test covering: text query filters by name/nickname (and does NOT return a
      no-name-match student who only has a phone), and a digit query matches by phone. `bun test` +
      `bunx tsc --noEmit` clean.

## Implementation Notes

One-function change in `src/services/parent.service.ts` — no route/schema/DTO/FE change.

- **Factored out `studentSearchConditions(q)`** (exported): builds the OR-condition array — always
  `[ilike(name, %term%), ilike(nickname, %term%)]`, and **pushes** `ilike(parents.phone, %digits%)` **only when
  `normalizePhone(q)` is non-empty**. This is the fix: a non-numeric `q` no longer adds the `%%` phone clause
  that matched every student with a phone.
- **`searchStudents`** now calls `.where(q && q.trim() ? or(...studentSearchConditions(q)) : sql\`true\`)`.
  Everything else unchanged — leftJoin, `orderBy(asc(name))`, `limit(min(limit,200))`, and the row→DTO mapping
  (incl. `label`). Empty/absent `q` → `sql\`true\`` (normal list) exactly as before.

**Verification** (`H:\scheduler\smart-scheduler-back`):
- `bunx tsc --noEmit` → **clean (exit 0)**.
- `bun test` → **106 pass / 0 fail** (19 files). New `src/services/parent.service.test.ts` covers the
  condition-builder (no DB needed — the phone clause is present **iff** the query has digits):
  - `"โอ๊ด"` (no digits) → **2** conditions (name+nickname; the phantom phone clause is gone — the reported bug).
  - `"081"` → **3** conditions (name+nickname+phone).
  - `"โอ๊ด 081"` (mixed) → **3** (digits present).
  - `"  -  "` (punctuation, no digits) → **2**.
  Set a dummy `DATABASE_URL` + dynamic-import the module (postgres.js is lazy, never connects) so the pure
  builder is importable without a live DB.
- ⚠️ Not run against a live DB (brownfield). The builder test proves the phone clause is conditional; the
  end-to-end SQL (name/nickname still filter, phone still matches on digits) is verified by inspection —
  recommended deploy smoke: type a name in the New-Booking student picker → list filters (not the whole roster);
  type a phone fragment → matches by phone.

**DoD:** text query filters by name/nickname, no whole-roster ✓ · digit query still matches phone ✓ · empty q →
normal list (unchanged) ✓ · unit test added (builder) ✓ · tsc + `bun test` clean ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- Search stays across name + nickname + parent phone (Porter's lean) — the fix only stops the empty-normalized
  phone from matching everything. If you'd rather split a dedicated phone-vs-text branch, that's fine as long as
  the DoD holds — flag your choice here.
  - **Jason's choice:** kept the single OR across all three (name + nickname + phone), phone included **only
    when the query has digits** — no separate phone-vs-text branch. Matches Porter's lean and keeps the DoD.
    A numeric query still ORs name/nickname too (harmless), so e.g. a student literally named "081" is still
    findable by text.

## Review
**Verdict: DONE ✅ (Sober, 2026-07-29).** The fix targets the exact root cause and is clean.
- **Verified in code** (`parent.service.ts`): `studentSearchConditions(q)` builds `[ilike(name,%term%),
  ilike(nickname,%term%)]` and pushes `ilike(parents.phone,%digits%)` **only when `digits = normalizePhone(q)`
  is non-empty** — so a non-numeric query no longer emits the `%%` phone clause that matched the whole roster.
  `searchStudents` keeps its outer `q && q.trim() ? or(...) : sql\`true\`` (empty q → normal list) and
  everything else (select / leftJoin / orderBy / limit / mapping+`label`) is unchanged. Good call factoring the
  builder out `export`ed so it's DB-free testable.
- **Verified myself:** `bunx tsc --noEmit` → 0; `bun test src/services/parent.service.test.ts` → 4/0
  ("โอ๊ด"→2 conds, "081"→3, mixed→3, punctuation→2); full `bun test` → **106/0**.
- **DoD met:** text query filters by name/nickname (no whole-roster; the phantom phone clause is gone) · digit
  query still matches phone · empty q unchanged · unit test added · tsc + suite clean.
- **TASK-033 → DONE.** REQ-011's only task → **REQ-011 → SPEC_DONE** (→ @Porter for acceptance). Deploy smoke:
  type a name in the New-Booking student picker → the list filters (not the whole roster); type a phone
  fragment → matches by phone. No FE change (FE was correct).
