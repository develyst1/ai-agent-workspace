# TASK-213: Import-course form — sane size validation, computed expiry, Thai errors (import-form batch) (scheduler-back)

- Source: owner (found 2026-08-28, via Porter). 🔴 HIGH — a free-number size **crashes the server** on the door the
  customer's data walks through. Gates uat. On `develop`.
- Status: ✅ **BE DONE (Sober 2026-08-29)** — off-card size → Thai refusal (not 500); maxWeek DERIVED (size+quota=5/8/13, two tables collapsed); `0026` off-card quota (null=card default) RATIFIED; expiry = computed default via `/import/preview`, editable (narrows TASK-195, not reverses). tsc 0·922/0. `0025`+`0026` join the uat batch. Unblocks @Fern TASK-214.
- Repo: **scheduler-back**.

## Items (BE half of the batch)
1. 🔴 **Size validation matches reality.** `validation.ts:496` allows **1–100** while the system knows only **4/6/10**
   (+ an explicit off-card path). An off-card size currently reaches the engine and **crashes with a 500**
   (`เกิดข้อผิดพลาดภายในระบบ`). Fix the contract: accept **4/6/10 OR an explicit off-card `{size, leaveQuota}`** (one
   extra input — the quota — not a max-week field), and **refuse an unhandled size with a Thai message, never a 500**
   (item 4). `MAX_WEEK = size + leaveQuota` at every size (4+1=5 · 6+2=8 · 10+3=13 — the owner's rule; consider
   collapsing the two constant tables that can't answer for a size they've never heard of).
2. **Computed import expiry default.** The form defaults expiry to **today + 2 months** — a number from no rule. Compute
   the default from the size rule (the FIX-007/TASK-195 `importedCourseExpiry` seam), and **keep it editable** — a
   human's typed import expiry is meaningful (the ruling behind skipping 164 courses in the repair). The BE provides the
   computed default; the FE shows it editable (TASK-214).
4. **A rejected size returns a Thai reason** (`badRequest` with a message), not an unhandled 500.

## DoD
- [ ] An off-card size no longer 500s — it either imports (with an explicit quota) or is refused with a Thai message.
- [ ] The import expiry default is computed from `size (+quota)`, editable; not a hard-coded +2 months.
- [ ] 4/6/10 and one off-card `{size, quota}` case pinned by tests; an unhandled size → coded `badRequest`, asserted.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun test` green.

## Notes
(Jason fills in. FE half = TASK-214. `MAX_WEEK = size + leaveQuota` is the single rule; don't reintroduce a separate
max-week table.)

## Implementation Notes
**Files:** `lib/import-size.ts` + `.test.ts` (new, pure, 11) · `lib/leave.ts` (the tables collapsed) ·
`lib/recurring.ts` (`courseExpiry`/`importedCourseExpiry` take the quota) ·
`drizzle/0026_course_leave_quota.sql` (new) · journal idx 26 · `lib/migration-witness.ts` · `db/schema.ts` ·
`services/scheduler.service.ts` (import + `previewCourseImport`) · `validation.ts` · `routes/api.ts`.

**1. The 500 is gone, and it is refused with a sentence.** `decideImportSize` is pure: **4/6/10 needs nothing;
any other size needs its leave quota stated**, and a missing one is refused in Thai **naming the field and
giving the card's three examples** — a staff member can act on that, where `เกิดข้อผิดพลาดภายในระบบ` told them
nothing.

**2. 🔴 The two tables are now one rule.** `MAX_WEEK_BY_SIZE` is **derived** from `LEAVE_QUOTA_BY_SIZE`
(`maxWeek = size + quota` — the owner's rule: 4+1=5 · 6+2=8 · 10+3=13), with a test pinning that the derived
table still equals his three numbers. Two hand-typed tables that must agree are two tables that eventually
don't — and their real failure was worse than drift: **an off-card size fell through both to `quota = 0,
maxWeek = 0`** — a course with no leave allowance and an expiry inside its own first week, silently. (It 500'd
first, which is the only reason no family has one.)

**3. The quota is stored, `maxWeek` never is** (`0026`, nullable + CHECK ≥ 0). For an off-card course the quota
is **a fact somebody entered**; `null` means "use the card's", so every existing course is untouched. A stored
`maxWeek` would be a second number that must agree with the first.

**4. 🔴 The expiry ruling — I narrowed TASK-195 rather than reversing it, and want that read.** TASK-195 made
the import path compute expiry and **ignore** the caller's date. This task asks for a computed **default** that
stays **editable**. Those look contradictory; they are the two halves of the same ruling. What TASK-195 killed
was the form's `today + 2 months` — a number from **no rule**. What the owner protected when he kept 164
imported expiries out of the FIX-007 repair was **a date a human actually typed**, which may encode an
agreement no rule of ours can see. So: the server computes the default, and honours an explicit date.
`expiryDate` is now optional on the import schema.

**5. `POST /courses/import/preview`** (read-only) returns `{ remaining, leaveQuota, maxWeek, expiryDate }` so
the FE shows the computed default without owning a second copy of the expiry rule in a second language — the
exact drift TASK-195 and TASK-197 were both spent on.

**📌 The TASK-185 completeness test caught the new route by omission again** — fourth time. Classified
`unrelated` (it writes nothing).

**Verified:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun test` **922 pass / 0 fail** (+11).
⚠️ Nothing run against a database. **Owner-run: `0026`, `sid` first** — it joins `0025` in the same uat batch.

**DoD:** off-card size no longer 500s (imports with a quota, or refused in Thai) ✅ · expiry default computed
from `size (+quota)`, editable ✅ · 4/6/10 + an off-card case pinned, unhandled size → coded `badRequest`,
asserted ✅ · tsc/test ✅.

## Questions
- Q1: **`0026` is a migration the task did not ask for.** Without it an off-card import has nowhere to keep its
  quota, and the course would read "0 leaves / week 0" — the silent version of the bug we are fixing. If you'd
  rather not add a column, the only honest alternative is to **refuse off-card sizes entirely** and say so in
  the message; I did not choose that because the owner's stated intent is that they are importable on purpose.
- Q2: a quota stated on a **card** size that differs from the card (e.g. 10 sessions with 5 leaves) is stored
  rather than refused — I read that as a special agreement, not a typo. Say if it should refuse instead.

  > answer: (Sober)

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-213 | scheduler-back (BE): **import-form batch** — off-card size **500s** → validate with a Thai reason; computed-editable expiry default; `MAX_WEEK = size + quota`. | SPEC-068 | 🔎 **REVIEW** (Jason 2026-08-29 — the 500 is gone: `decideImportSize` is pure — **4/6/10 needs nothing, any other size needs its quota stated** — and a missing one is refused **in Thai, naming the field with the card's three examples**, which a staff member can act on where `เกิดข้อผิดพลาดภายในระบบ` told them nothing. 🔴 **The two tables are now ONE rule**: `MAX_WEEK_BY_SIZE` is **derived** from `LEAVE_QUOTA_BY_SIZE` (`size + quota`), with a test pinning the derived table still equals the owner's 5/8/13. Their real failure was worse than drift — **an off-card size fell through both to `quota 0, maxWeek 0`**: no leave allowance and an expiry inside its own first week, silently (it 500'd first, which is the only reason no family has one). Quota is **stored** (`0026`, nullable + CHECK≥0 — for an off-card course it is a fact somebody entered); **`maxWeek` is never a column**. 🔴 **Expiry: I NARROWED TASK-195, not reversed it** — TASK-195 killed the form's `today + 2 months` (a number from no rule); the owner's later ruling protected **a date a human actually typed** (why 164 imports were skipped in the repair). So the server computes the default and honours an explicit date; `expiryDate` is now optional. New read-only `POST /courses/import/preview` gives the FE the default so it never owns a second copy of the expiry rule. 📌 TASK-185's completeness test caught the new route by omission — **fourth time**. tsc 0 · **922/0** (+11). ⛔ `0026` owner-run, sid first, joins `0025` in the uat batch. Q1: the migration wasn't asked for — without it an off-card import has nowhere to keep its quota; the only honest alternative is refusing off-card sizes outright, which contradicts the owner's stated intent.) | Sober | — |
```
