# SPEC-033: Compile `.jrxml`→`.jasper` in the Maven build (REQ-031) — kill the stale-binary class of bug

- Source: REQ-031. Root cause of **DEF-7 AND DEF-15** (same failure twice): Maven only COPIES precompiled
  `.jasper`; a correct `.jrxml` fix ships stale with no error and no failing test.
- Status: ACTIVE (SA spec). Build/packaging change only — **no `.jrxml` content changes**, no report behavior change.

## Problem (grounded)
- `pom.xml` has JasperReports **7.0.4** (`jasperreports` + `-json` + `-pdf`) but **no jasper-compile plugin**.
- `.jasper` are **tracked in git and NOT gitignored**; repo is drifting: **52 `.jrxml` tracked vs 28 `.jasper`**.
- The only thing that regenerates `.jasper` today is manually running a `*PreviewTest`
  (`JasperCompileManager.compileReportToFile`). Runtime loads `.jasper` from the classpath (`ClassPathResource`
  → `target/classes`/jar), so an un-regenerated fix never reaches the PDF.

## Approach (compile with the project's OWN JR 7.0.4 — do NOT add a version-mismatched plugin)
Porter's hard constraint: the compiler's JasperReports version MUST be 7.0.4. The safest way to guarantee that is
to compile using the project's existing JR 7.0.4 dependency, not a third-party plugin on its own JR version.

1. **Add a build-time precompiler** that walks every `*.jrxml` under `target/classes/reports*/**` and compiles
   each to a sibling `.jasper` via `net.sf.jasperreports.engine.JasperCompileManager.compileReportToFile`.
   - Preferred: a tiny `JasperPrecompiler` main (in `src/main/java`) invoked by **`exec-maven-plugin`** bound to
     phase **`process-classes`** (AFTER resources are copied to `target/classes`, BEFORE `package`/spring-boot
     `repackage`) — so the fat jar always carries `.jasper` matching the `.jrxml`. `exec` runs with the project
     classpath ⇒ JR 7.0.4 is used inherently, nothing to pin separately.
   - Acceptable alt: `maven-antrun-plugin` with JR 7.0.4 on the plugin `<dependencies>` calling the same API.
   - Compile into `target/classes` (not `src`) so the build is the single source of truth; local dev still uses the
     PreviewTests. Fail the build if any targeted `.jrxml` fails to compile (that is the point — no silent stale binary).
2. **Stop tracking `.jasper` in git:** add `**/*.jasper` to `.gitignore` and `git rm --cached` the 28 tracked
   `.jasper`. After this, `.jasper` are pure build artifacts; the 52-vs-28 drift becomes impossible.
3. **Keep the PreviewTests working** (they still compile+preview from mock; no conflict). Optionally refactor them
   to reuse the new precompiler walk, but not required.

## Risks the implementer MUST resolve
- **24 `.jrxml` have no committed `.jasper`** (52 tracked vs 28). Compiling ALL of them may surface `.jrxml` that
  don't compile (drafts/WIP). First run: compile everything; if some are not build-ready, either fix them or scope
  the walk to the folders actually shipped (`reports/`, `reports-045/`) and LIST what was scoped out (no silent skip).
- **Non-deterministic compile:** never assert `.jasper` equality by md5. Verify by rendered PDF **text + page count**.
- Ensure the precompile runs BEFORE `spring-boot:repackage` so the executable jar contains the fresh `.jasper`.
- Compilation is font-independent (TH SarabunPSK is only needed at fill/render), so no font on the compile classpath.

## Acceptance (Porter's proof that the failure mode is closed)
1. Edit one `.jrxml` with a visible, harmless change (e.g. a static label on a report we can render, like a6/38272).
2. Run a PLAIN `./mvnw clean package` — **without** running any PreviewTest.
3. Render that report; the change **appears in the PDF**. (Today it would not.) Revert the probe edit after.
4. `git status` shows no `.jasper` tracked; `.gitignore` covers them; build is green; all existing PreviewTests pass.
5. a6/38272 + a9 destroy/transport + a14/a15 still render identically (structure/labels/ticks unchanged) — the
   compile must reproduce the current templates, not alter them.

## Task
- TASK-033 (Jason, BE): implement the precompile plugin binding + `.gitignore`/`git rm --cached`, resolve the
  24-uncompiled-`.jrxml` risk, and demonstrate the acceptance probe. Back to Sober for review, then a build-only
  QA smoke (render one real report to confirm the packaged jar carries fresh `.jasper`).

## Questions
(Jason asks; Sober answers as `> answer: ...`)
