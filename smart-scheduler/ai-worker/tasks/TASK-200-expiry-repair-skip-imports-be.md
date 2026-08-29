
## Implementation Notes
**Files:** `lib/expiry-repair-plan.ts` (the exclusion) · `lib/expiry-repair-plan.test.ts` (fixture default +5) ·
`scripts/repair-course-expiry.ts` (the skipped count is now printed).

**The exclusion is `.filter((c) => c.source !== "IMPORT")` placed BEFORE the map**, and where it sits is the
point. Filtering afterwards — or leaning on the branch inside `correctExpiry` — is exactly what made this wrong
the first time: **the branch existed, so the code looked source-aware while still rewriting every import.** A
course that never enters the list cannot reach the changes, the counts or the flip list by any later edit.

**`importedCourseExpiry` is kept, unused by the repair**, with a comment saying why: it is correct, and it is
what *future* imports should compute once the import form is fixed. What the owner banned is retro-rewriting
rows a human already filled in — not the formula.

🔴 **The fixture default was the real trap, and it caught me.** The test factory defaulted to `source: "IMPORT"`,
so the moment I added the exclusion **five existing tests went empty-but-passing-shaped** and had to be
re-pointed. A fixture defaulting to the excluded kind would have quietly asserted nothing at all from then on.
Default is now `SALE`, with the reason in the comment, and the import cases are explicit.

**The new tests assert the OUTCOME, not the branch** (the lesson from the review miss): an import with a
deliberately wrong stored expiry is *still* left alone; in a mixed set only the SALE ids appear **and
`repairSummary().changed` is 2** — the counts matter because that is the number the owner reads before
committing, and a leak there is where the damage would happen; a set of only imports produces an **empty**
repair and an all-zero summary.

**The script now prints what it skipped** — `ข้ามคอร์สนำเข้า (IMPORT) ไม่แตะเลย: N` on the line above the
numbers, and in the report header. The owner asked for imports to be left alone; he should be able to **see**
that they were, not trust a filter he cannot see.

**Verified:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun test` **854 pass / 0 fail** (+5).
No migration.

### ⛔ The DoD line I cannot close — and it is the important one
**"The `uat` dry-run is re-run and the `later` count collapses toward 0"** is an *outcome on real data*, and I
run nothing against a database. Unit tests prove imports cannot enter the plan; they cannot prove what `uat`
holds. **@Porter — the owner re-runs `bun run course:repair-expiry` (dry run) and posts:**
- `ข้ามคอร์สนำเข้า (IMPORT) ไม่แตะเลย:` — expected ≈ **74**
- `ต้องแก้วันหมดอายุ:` with `ช้าลง (later)` — **expected to collapse toward 0**

**If `later` is still ~74, the exclusion is not doing what I think it is — STOP, do not commit, tell me.**
Until those numbers come back this task is **code-complete, outcome-UNVERIFIED**, and I would rather say that
than repeat the miss this task exists to correct.
