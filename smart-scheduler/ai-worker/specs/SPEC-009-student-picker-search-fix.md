# SPEC-009: Fix the student picker not filtering when you type
- Source: REQ-011
- Status: ACTIVE

## Overview
The Student dropdown in the booking flow shows the **full** student list no matter what you type. I traced the
whole chain and the root cause is a **backend bug in `searchStudents`** — **not** FE wiring (this corrects the
REQ's "likely FE fix" hypothesis; the FE is correct and needs no change).

**Root cause (verified in code).** `parent.service.ts` `searchStudents(q)` (`:147`) filters with:
```
or( ilike(name, %q%), ilike(nickname, %q%), ilike(parents.phone, %normalizePhone(q)%) )
```
`normalizePhone(x) = x.replace(/\D/g, "")` strips **all non-digits** (`:17`). So for a **text** query like
"โอ๊ด" (no digits) `normalizePhone(q) = ""` → the phone clause becomes `ilike(parents.phone, '%%')`, which
matches **every student that has a parent phone**. The `or(...)` is therefore true for ~the whole roster →
the API returns everyone → the dropdown looks unfiltered. (The name/nickname clauses work fine; the phone
clause silently defeats them for any non-numeric search.)

**FE is correct — verified, no change:** `StudentSelect.tsx` (Mantine low-level `Combobox`, which does NOT
client-filter — it renders exactly what it's given) → `search` → `useDebouncedValue(250ms)` →
`useStudentSearch(q)` (TanStack query **keyed by `q`**, refetches per term) → `searchStudents(q)` which sends
`GET /students?q=…&limit=50`. The typed value reaches the backend correctly; the backend just over-matches.

**Scope check:** this `normalizePhone`-inside-`ilike` pattern exists **only** at `parent.service.ts:164`
(grep). Voucher search (`getVouchers`) filters in-memory by name/nickname `.includes` (no phone) — not
affected. So the fix is one function.

## API / Interface
No change. `GET /students?q=&limit=` keeps its shape and response.

## Data Model
None.

## Flow — the fix (backend `searchStudents`)
Apply the **phone clause only when the query actually contains digits**:
- Compute `const digits = normalizePhone(q)`.
- Build the OR conditions as: `ilike(name, %q%)`, `ilike(nickname, %q%)`, **and** — only if `digits` is
  non-empty — `ilike(parents.phone, %digits%)`.
- Keep the `q` empty/absent → `sql\`true\`` (return the normal list) branch exactly as-is.
Net: a text search filters by name/nickname (no phantom phone match); a numeric search still finds by phone;
a mixed/numeric term still works. Everything else (ordering, limit, mapping, `label`) unchanged.

Search stays across **name + nickname + parent phone** (REQ open Q — matches Porter's lean "keep all three";
the fix preserves all three, only stopping the empty-normalized phone from matching all).

## Non-functional
- Backend source of truth; one surgical query change, no schema/endpoint change. No FE change.

## Tasks
- TASK-033: scheduling — fix `searchStudents` phone clause (only match phone when the query has digits) + test.
  (Jason) (depends on: —)

_(No FE task — the picker, hook, and service are correctly wired; verified.)_

## Questions
(Sober asks; Porter answers as `> answer: ...`)
- Heads-up (not a blocker): the REQ framed this as "likely a small FE fix"; the trace shows it's a **backend**
  one-liner (the phone `ilike` matching all rows on a non-numeric query). Routing the build to **Jason**, not
  Fern. Search remains name + nickname + phone (your lean) — flag if คุณฟีน wants name-only instead.
