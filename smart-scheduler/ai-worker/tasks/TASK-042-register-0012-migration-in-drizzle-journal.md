# TASK-042: scheduling (BE) — make `bun run db:migrate` actually apply 0012 (migration not registered)
- Source: SPEC-012 (REQ-015 release defect, found by Porter + the stakeholder's challenge)
- Status: DONE  (reviewed 2026-07-30 by Sober — journal + folder audit re-run independently, README/trap verified, repo diff clean, tsc 0 / suite 126/0; see ## Review). ✅ **REQ-015 release unblocked**
- Depends on: none
- Assignee: @Jason (smart-scheduler-back, port 4006)

## The defect (Sober verified in the repo — confirmed, not assumed)
`drizzle/0012_line_lang.sql` **exists on disk**, but **`drizzle/meta/_journal.json` ends at idx 11 /
`0011_freelance_budgets`** — grep for `0012` in the journal → **0 hits**. `drizzle-kit migrate` applies **what
the journal lists**, not what's in the folder ⇒ **`bun run db:migrate` silently skips 0012**, so
`parents.line_lang` / `teachers.line_lang` never get created and REQ-015's per-user language breaks at runtime.
Root cause: 0012 was hand-authored (TASK-039) instead of produced by `drizzle-kit generate`, so no journal entry
(and no meta snapshot) was written.

**Do NOT "fix" this with a psql side-channel.** The standard command must be the whole DB step — that's the
point of the stakeholder's objection, and a manual apply would leave the repo broken for the next developer.

## What to do
**Part 1 — the blocker (small, precise):** register 0012 so the standard command applies it.
- Add the idx-12 entry to `drizzle/meta/_journal.json` following the existing shape exactly
  (`{"idx": 12, "version": "7", "when": <timestamp continuing the file's pattern>, "tag": "0012_line_lang",
  "breakpoints": true}`) — the file's later `when` values are synthetic/incrementing (…0007 at idx 11), so keep
  that convention.
- Leave the SQL as-is: it's already idempotent (`ADD COLUMN IF NOT EXISTS`) and uses `--> statement-breakpoint`
  correctly, so it's safe if some environment already applied it by hand.
- **Verify the whole folder:** confirm every `drizzle/*.sql` has a journal entry and no journal entry lacks a
  file (i.e. 0012 was the only unregistered one).

**Part 2 — the second gap (assess; fix only if safe — must NOT hold the release):** `drizzle/meta/` contains
only `0000–0003_snapshot.json` while the journal lists 12 entries. `drizzle-kit generate` diffs the schema
against the **latest snapshot**, so the next `db:generate` looks likely to diff against the 0003-era state and
emit SQL that re-creates everything added in 0004–0012.
- Confirm whether that's the real behavior in this drizzle-kit version (a dry `db:generate` in a scratch copy is
  fine — **do not** commit generated noise, and **never** point it at a real DB).
- Then either (a) restore/regenerate the snapshot chain properly if that can be done safely, **or** (b) if a safe
  restore isn't clean, leave the SQL alone and **document the trap** (in `drizzle/README.md` or the repo
  `CLAUDE.md`): what a developer must do before running `db:generate` here.
- **Report your finding + which option you took in Implementation Notes** — this is a pre-existing hazard, so a
  documented, deliberate state is an acceptable outcome; a silently broken `generate` is not.

**Part 3 — runbook wording:** state plainly in the notes that the REQ-015 DB step is **`bun run db:migrate`**
(with the prod `DATABASE_URL`), no psql side-channel, and that it is safe to re-run.

## Definition of Done
- [ ] `drizzle/meta/_journal.json` includes 0012 in the correct shape; every `.sql` in `drizzle/` is registered
      and every journal entry has a file (state the check result).
- [ ] `bun run db:migrate` would apply 0012 via the normal path (verify however you safely can without a real
      DB — e.g. drizzle-kit resolves 12 pending/known migrations; state exactly what you verified and how).
- [ ] SQL unchanged and still idempotent (safe if an env already applied it manually).
- [ ] Part 2 assessed: the snapshot gap is either fixed safely **or** documented with the exact caveat for the
      next `db:generate`. Finding recorded either way.
- [ ] `bunx tsc --noEmit` clean; `bun test` green (no app-code change expected).
- [ ] Notes state the deploy DB step as `bun run db:migrate` (re-runnable, no psql).

## Implementation Notes

**Part 1 — registered 0012 (the blocker).** Added the idx-12 entry to `drizzle/meta/_journal.json`, exact shape,
continuing the synthetic `when` (idx 11 = `1783000000007` → idx 12 = `1783000000008`):
`{"idx":12,"version":"7","when":1783000000008,"tag":"0012_line_lang","breakpoints":true}`. **SQL unchanged**
(still `ADD COLUMN IF NOT EXISTS` + `--> statement-breakpoint` → idempotent).
- **Folder/journal audit (scripted cross-check):** **13 journal entries = 13 `.sql` files**, valid JSON, idx
  contiguous 0–12, **no `.sql` without an entry and no entry without a `.sql`** → 0012 was the only unregistered
  one; the folder is now consistent.
- **How `db:migrate` will apply it (verified without a real DB):** `drizzle-kit migrate` applies the journal
  entries not yet recorded in the DB's `__drizzle_migrations` table. 0012 is now journal-registered, so the next
  `bun run db:migrate` applies it via the normal path (creating `parents.line_lang` / `teachers.line_lang`). Its
  `IF NOT EXISTS` SQL is a no-op if some env already applied it by hand. (Can't exercise `migrate` end-to-end
  here — brownfield/no DB — but the registration is exactly what was missing; confirmed by the audit above.)

**Part 2 — snapshot gap: CONFIRMED live, then documented (option b).** `meta/` holds snapshots for **only
0000–0003** while the journal lists 0000–0012 (0004–0012 were hand-authored, no snapshots). **Confirmed the
hazard with a real probe** (safe — isolated): ran `drizzle-kit generate` (offline, no DB) via a temp in-repo
config whose `out` pointed at a **scratch copy** of `meta/` → it emitted **one full-schema migration re-creating
all 18 tables** (incl. `parents/teachers.line_lang`, `freelance_budgets`, the `bo` `item`/`movement`, badges,
etc.), because it can't reconstruct the 0004–0012 state. So a plain `bun run db:generate` here would produce a
schema-recreating migration → breakage if committed/applied. **The real repo `drizzle/` was untouched** (probe
config removed; still 13 `.sql`).
- **Decision: documented the trap, did NOT rebuild the snapshot chain.** Hand-fabricating 0004–0012 snapshots I
  can't verify is exactly what your `## Questions` warns against. Wrote **`drizzle/README.md`**: the deploy step
  (`db:migrate`, re-runnable, no psql), the journal-entry rule, and the **do-NOT-`db:generate`** trap + the
  established add-a-migration pattern (hand-write `NNNN_*.sql` + a journal entry, like 0010–0012). Rebuilding the
  snapshot chain so `generate` works again is a separate careful task (flagged, out of scope).

**Part 3 — runbook.** REQ-015 DB step = **`bun run db:migrate`** with the prod `DATABASE_URL`. **No psql
side-channel.** Safe to re-run (skips applied migrations; idempotent SQL).

**Verification:** `bunx tsc --noEmit` → clean (exit 0); `bun test` → **126/0** (no app-code change). Journal audit
+ probe generate as above. Repo left clean (no probe artifacts).

**DoD:** 0012 registered, folder/journal consistent (audited) ✓ · `db:migrate` applies 0012 via the normal path
(registration verified) ✓ · SQL unchanged/idempotent ✓ · Part 2 assessed = **confirmed live + documented** with
the exact `db:generate` caveat ✓ · tsc clean + `bun test` green ✓ · runbook = `db:migrate`, re-runnable, no psql ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- If registering 0012 turns out to need more than a journal entry in this drizzle-kit version (e.g. it insists on
  a matching snapshot), **stop and tell me** rather than hand-writing a snapshot you can't verify — I'd rather
  re-scope than ship a plausible-looking meta file.
- Don't touch the already-applied migrations 0000–0011 or the prod `__drizzle_migrations` bookkeeping; this task
  is about making the *next* run correct.

## Review
**Verdict: DONE ✅ (Sober, 2026-07-30).** Blocker fixed the right way, and Part 2 was handled exactly as asked —
**investigated, then documented instead of faked.**
- **Part 1 verified myself:** `meta/_journal.json` now carries
  `{"idx":12,"version":"7","when":1783000000008,"tag":"0012_line_lang","breakpoints":true}` — correct shape,
  `when` continuing the file's synthetic sequence. **13 journal entries = 13 `.sql` files**, and I re-ran the
  cross-check independently (every `drizzle/*.sql` basename appears in the journal): **no unregistered file**.
  The SQL is untouched — still `ADD COLUMN IF NOT EXISTS` + `--> statement-breakpoint`, so it's a no-op if an
  env already applied it by hand. ⇒ `bun run db:migrate` will now apply 0012 through the normal path.
- **Part 2 — the right call, and he actually proved the hazard.** He ran a **probe `generate` against a scratch
  copy** (offline, no DB) and it emitted **one full-schema migration re-creating all 18 tables** — so Gap B is
  real, not theoretical. He then **documented it rather than hand-fabricating 0004–0012 snapshots**, which is
  precisely the line I drew in `## Questions`. `drizzle/README.md` states the deploy step, the
  journal-entry rule, the **do-NOT-`db:generate`** trap with the verified evidence, and the established
  add-a-migration pattern.
- **Repo cleanliness checked (this is where a probe usually leaves a mess):** `git status drizzle/` shows
  **exactly** `M meta/_journal.json` + `?? README.md` — no probe config, no scratch dir, no generated migration
  leaked into the repo. Clean.
- **Part 3:** README says the DB step is `bun run db:migrate` (re-runnable, **no psql side-channel**) — the
  stakeholder's objection is answered structurally, not with a workaround.
- **Verified myself:** `bunx tsc --noEmit` → 0; `bun test` → **126/0** (no app-code change, as expected).
- **Known follow-up recorded (not cut as a task — deliberate):** rebuilding the 0004–0012 snapshot chain so
  `db:generate` works again is real tech debt. It's now *documented and safe* (a developer is warned before they
  can be bitten), it blocks nothing, and doing it carelessly is worse than leaving it — so it stays a flagged
  maintenance item rather than competing with the release and the feature backlog.
- **TASK-042 → DONE. REQ-015's release blocker is cleared** — the DB step is now `bun run db:migrate`.
