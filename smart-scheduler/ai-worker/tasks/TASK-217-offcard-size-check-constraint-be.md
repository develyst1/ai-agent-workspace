# TASK-217: Off-card import 500s — the DB `course_size_chk` still forbids off-card sizes (scheduler-back)

- Source: Tanya's sid pass, item 4 (via Porter, 2026-08-29). 🔴🔴 **HARD uat BLOCKER — the batch cannot ship until this
  lands.** BE + a migration. On `develop`.
- Status: ✅ **BE code DONE (Sober 2026-08-29)** — `0027` relaxes size CHECK to 1–100 (new name = witnessable); schema agrees. tsc 0·936/0. 🔴 off-card-row-saves-201 = Tanya re-run on sid after `0027`.
- Repo: **scheduler-back**.

## Root cause (diagnosed — Sober, read-only)
The off-card feature (TASK-213/215) allows any size WITH an explicit quota at the **app** layer (`decideImportSize`
passes for size 8 q3). But the DB still enforces
`CONSTRAINT "course_size_chk" CHECK ("size" in (4, 6, 10))` (`drizzle/0000_supreme_zarek.sql:37`, `schema.ts:305`).
So the `INSERT` of an off-card `course_packages` row **violates the CHECK → Postgres throws → 500
`เกิดข้อผิดพลาดภายในระบบ`** — the exact generic error TASK-213 set out to kill, now one layer down. Matches Tanya
exactly: card size 6 → 201, off-card 8/5 → 500, **preview green** (no DB write), on a **free slot**. The whole off-card
path is impossible while this CHECK stands.

**Attribution:** TASK-213 built the off-card path at the app layer but did not relax the DB constraint; **my TASK-213
review verified `decideImportSize` but not the actual INSERT against the schema — and I flagged "row-in-Postgres = Tanya
sid" without checking the very constraint that blocks it.** Mechanism, not outcome, again — the `attendee_note`-without-
`0022` class (app allows what the DB forbids).

## Fix
1. **Migration `0027`** — relax `course_size_chk`: replace `size in (4, 6, 10)` with a sanity floor (e.g.
   `size >= 1`, or a range like `size between 1 and 100`). **The app (`decideImportSize`) is now the authority on which
   sizes are sellable/importable**; the DB keeps only a sanity bound, not the card list. Update `schema.ts:305` to match
   so the schema and the DB agree. Hand-authored + journal-registered, `sid` first, **migrate BEFORE code**.
2. Confirm no OTHER off-card-hostile constraint/lookup remains in the import save path (enumerate — the crash was one
   constraint; verify it's the only one).

## Definition of Done — the OUTCOME (a row lands), not "the constraint changed"
- [ ] 🔴 An **off-card import (size 8, quota 3) SAVES** — `POST /courses/import` returns 201 and the row exists with the
      derived expiry/quota. A card size still saves. (The real check is a landed row — proven on `sid` by Tanya/owner
      after `0027`; from here, a test that the save path completes for an off-card size without throwing.)
- [ ] `schema.ts` and the DB constraint agree (no drift). `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun test`
      green. `0027` owner-run, `sid` first, joins the uat batch (now `0024/0025/0026/0027`).

## Notes
(Jason fills in. This is the one thing between a code-complete batch and uat. After it lands, Tanya re-runs item 4 on
`sid`; the off-card save must return 201 + a real row.)

## Implementation Notes
**Files:** `drizzle/0027_course_size_sanity.sql` (new) · journal idx 27 · `lib/migration-witness.ts` ·
`db/schema.ts` · `src/db/course-size-constraint.test.ts` (new, 6).

**The card list is out of the database.** `size in (4, 6, 10)` → `size >= 1 AND size <= 100`, matching the zod
bound on the same field so the two agree rather than one being silently narrower. **The app is the authority**:
`decideImportSize` for imports, `isCourseSize` for sales — and the sale path is untouched, with a test pinning
that relaxing the DB did **not** quietly make off-card courses *sellable*.

### 🔴 The new constraint has a NEW NAME, and that is not cosmetic
Replacing `course_size_chk` in place would have made this migration **unwitnessable**: "does `course_size_chk`
exist?" is true before *and* after, so a box where `0027` never ran would look **identical** to one where it
did. That is exactly how `0022` and the day-end job hid for weeks. `course_size_sanity_chk` exists only after
this ran, so the witness probe is a real question. The old name is dropped explicitly.

**I enumerated rather than assuming this was the only blocker**, as the task asked: `course_packages` carries
four other constraints (`source_chk`, `end_reason_chk`, `leave_quota_chk`, the student FK) — none size-aware —
and the two `isCourseSize` gates in the service are on `createCoursePackage` (sale) and `previewCourse`,
**neither on the import path**. A test pins that the import body contains `decideImportSize` and **not**
`isCourseSize`, so a future edit can't reintroduce the gate one layer up.

**The schema/migration pair is tested against each other**, because that pair is what diverged: `schema.ts` is
what a future `db:generate` compares against, and leaving it on the old CHECK would make the next generated
migration try to put the card list back.

**Verified:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun test` **936 pass / 0 fail** (+6).

### ⛔ The DoD is a landed row, and that is not mine
I cannot INSERT from here — which is precisely how this shipped: TASK-213's tests covered the pure rule,
TASK-215's covered the schema round trip, and **nothing covered the row landing against a constraint.**

**@Porter / @Tanya, on `sid`, in this order:** apply **`0027` BEFORE the code**, then re-run item 4 — an
**off-card import (e.g. size 8, quota 3) must return 201 and the row must exist**, and a card size must still
work. **If it 500s again, stop and send me the Postgres error text** — the generic message is what hid this
one, and the next constraint would hide the same way.

## Questions
- Q1: the sanity bound is **1..100**, matching zod. A tighter business bound (say 1..20) would catch a typo
  like "80 sessions" at the door — but it is a number nobody has stated, and I would rather not invent one in a
  CHECK that needs a migration to change. Say if the owner wants a real ceiling.
