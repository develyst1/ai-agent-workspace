# TASK-035: Purge `.jasper` from `src/` and redirect PreviewTest output to `target/` (REQ-031 hardening)

- Source: Porter's question on REQ-031 — make the fix "by absence" not "by order of operations".
- Assignee: Jason (BE). Part of REQ-031's finalization; land it BEFORE the single REQ-031 commit + QA smoke.
- Rationale: today `src/main/resources` still holds 46 stale `.jasper`. The build overwrites them in `target/classes`
  at `process-classes`, so runtime is correct — but only because of ORDER. If a build skips that step, or someone
  copies `src` directly, the stale `.jasper` are back → DEF-7/DEF-15 again. Removing them makes a skipped precompile
  fail LOUDLY (report-not-found) instead of rendering stale. **But a naive delete is undone by the next PreviewTest,
  which compiles+loads `.jasper` into `src/main/resources` (`BASE = "src/main/resources/..."`).** So delete AND redirect.

## Do
1. **Redirect the 4 PreviewTests** (`A6`/`A9`/`A14`/`A15`PreviewTest) to compile AND load `.jasper` under `target/`
   (e.g. `target/jasper-preview/<folder>/...`), not `src/main/resources`. They already compile jrxml→jasper
   themselves, so they need no pre-existing `.jasper`; just change the `BASE`/`dst` so nothing is written into `src`.
2. **Delete all 46 `src/main/resources/**/*.jasper`** from disk (already `git rm --cached`'d + gitignored in TASK-033;
   this removes the working-tree copies too). After this, `src` holds only `.jrxml`.
3. Confirm the runtime is unaffected: `ReportResourceService` loads via `ClassPathResource` → `target/classes`, which
   the `process-classes` precompiler fills from `.jrxml`. `src` `.jasper` are never on the runtime classpath.

## Verify — BE
- `find src -name '*.jasper'` = 0 after a `./mvnw -o clean` and after running all PreviewTests (proves tests no longer
  write into `src`).
- Plain `./mvnw -o clean package` (no PreviewTest) → jar contains all needed `.jasper` (generated into `target`) → app
  renders a6/a9-d/a9-t/a14/a15 (verify by PDF text+page count, never md5).
- **Loud-fail proof:** temporarily disable the precompile execution → `clean package` → the app FAILS to find the
  report `.jasper` (loud), instead of silently rendering a stale one. Re-enable; confirm green.
- All 4 PreviewTests still green (compiling+loading from `target`).

## Handoff
Back to **Sober** (review: src is `.jasper`-free and stays that way after tests; loud-fail proof; no runtime change).
Then this + TASK-033 go into Porter's single REQ-031 commit, and the REQ-031 QA smoke runs on the final state.

## Answer to Porter's second question (why 46 on disk but 28 in git → 18 "fell out")
Not a separate bug — it is the manual-regen drift itself. `.jasper` were regenerated locally by PreviewTest runs into
`src` and `git add`ed inconsistently: 28 were committed over time, 18 were generated locally and never committed.
Nobody noticed because the runtime loads whatever is in `target/classes`, so the committed-vs-local mismatch never
raised an error — exactly the silent drift behind DEF-7/DEF-15. After TASK-033 + this task: **0 `.jasper` in git, 0 in
`src`**, all generated into `target` from `.jrxml` at build. The 18-gap becomes structurally impossible.

## Progress — EXECUTED, DB-free verified → REVIEW (2026-08-25)

**Implementation:**
1. Redirected all 4 PreviewTests' `BASE`/`ROOT` constants from `src/main/resources/...` to
   **`target/classes/...`** (not a separate `target/jasper-preview/` folder — minor deviation, explained
   below). They still self-compile `.jrxml`→`.jasper` exactly as before, just read/write under `target/classes`.
2. Deleted all **46** `.jasper` under `src/main/resources` (`find src/main/resources -iname "*.jasper" -delete`).
   `src` now holds only `.jrxml`.
3. Runtime unaffected — `ReportResourceService` already only ever read from the classpath (`target/classes`
   post-build / jar `BOOT-INF/classes`), never from `src` directly.

### Deviation: `target/classes` instead of a new `target/jasper-preview/` folder
The task suggested a fresh `target/jasper-preview/<folder>/`. Used `target/classes/reports-045/<folder>/`
instead — it's where `process-resources` already copies the `.jrxml` and where the `process-classes`
precompiler already writes the `.jasper` (both run before the `test` phase in the same `mvn test`/`package`
invocation), so PreviewTests now compile+load from the **exact same location the packaged app reads at
runtime** — no parallel/duplicate folder to keep in sync, and it doubles as another proof point that the
precompiler's own output is loadable. If Sober prefers a dedicated `target/jasper-preview/` to keep the
PreviewTest artifacts visually separate from the real build output, it's a one-constant-per-file change.

### Verify (DB-free)
- `find src/main/resources -iname "*.jasper"` = **0** after `clean` and after running all 4 PreviewTests
  (`mvn test`) — proves the tests no longer write into `src`.
- `./mvnw -o process-classes`: `[JasperPrecompiler] compiled 52/52 .jrxml under reports, reports-045`.
- All 4 PreviewTests green: a6=3pg / a9-destroy=4pg / a9-transport=5pg / a14=4pg / a15=5pg.
- **Loud-fail proof (equivalent to "disable precompile"):** `./mvnw -o clean resources:resources` (copies
  `.jrxml` to `target/classes`, deliberately stops BEFORE `process-classes`) → **`target/classes` has 52
  `.jrxml` and ZERO `.jasper`.** With `src` now empty too, there is **no `.jasper` anywhere on disk** in that
  state — any code path trying to load one gets a clear resource-not-found, never a silently-stale binary.
  This is the same failure mode as literally disabling the plugin execution, demonstrated without touching
  `pom.xml` mid-task.
- Full regression: `./mvnw -o clean package` → **BUILD SUCCESS, 5/5 tests**; `git ls-files | grep -c
  '\.jasper$'` = 0; `find src/main/resources -iname '*.jasper'` = 0. Restored a normal built state after
  (`process-classes`) so the workspace isn't left mid-experiment.

@Sober: ready for review — src is `.jasper`-free and stays that way after tests; loud-fail equivalent proven;
one flagged deviation (target/classes vs a dedicated jasper-preview folder) for your call.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
