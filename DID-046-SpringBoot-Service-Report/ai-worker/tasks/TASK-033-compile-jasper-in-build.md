# TASK-033: Compile `.jrxml`→`.jasper` in the Maven build (REQ-031 / SPEC-033)

- Source: SPEC-033 (REQ-031). Prevents the DEF-7/DEF-15 stale-`.jasper` class. Build change only; no `.jrxml` edits.
- Assignee: Jason (BE).

## Do
1. **Precompiler:** add a build step that compiles every shipped `*.jrxml` in `target/classes/reports*/**` →
   sibling `.jasper` via `JasperCompileManager.compileReportToFile`, using the project's JR **7.0.4**.
   - Preferred: small `JasperPrecompiler` main + `exec-maven-plugin` bound to **`process-classes`** (after resources
     copied, before `package`/`repackage`). Alt: `maven-antrun-plugin` with JR 7.0.4 in its plugin `<dependencies>`.
   - Build MUST fail if any targeted `.jrxml` fails to compile.
2. **Git:** add `**/*.jasper` to `.gitignore`; `git rm --cached` the 28 tracked `.jasper` (keep working-tree copies).
3. **Resolve the 24-uncompiled risk:** compile all 52; if some `.jrxml` are not build-ready, fix or scope the walk to
   `reports/` + `reports-045/` and LIST what's excluded in the task notes (no silent skip).

## Verify — BE
- `./mvnw clean package` green; jar under `target/` contains fresh `.jasper` matching the `.jrxml`.
- **Acceptance probe:** edit one static label in a renderable report's `.jrxml` → plain `./mvnw clean package`
  (NO PreviewTest) → render → the label change appears in the PDF → revert the probe. (Verify by PDF text+page
  count, NEVER md5.)
- All existing PreviewTests still pass; a6/a9-d/a9-t/a14/a15 render identically (structure/labels/ticks unchanged).
- `git status`: no `.jasper` tracked.

## Handoff
Back to **Sober** (review: plugin binding order vs repackage, git untrack, acceptance-probe evidence, no template
drift). Then a build-only QA smoke: render one REAL report from the packaged jar to confirm fresh `.jasper` ships.

## Progress — EXECUTED, DB-free verified → REVIEW (2026-08-25)

**Implementation (deviated from the preferred exec-maven-plugin `java` goal — explained below):**
- New `com.smart.report.build.JasperPrecompiler` (plain `main()`, not a Spring bean): walks
  `target/classes/{reports,reports-045}/**/*.jrxml`, compiles each to its sibling `.jasper` via
  `JasperCompileManager.compileReportToFile` (project's own JR 7.0.4 on the classpath). Collects failures,
  prints them, `System.exit(1)` if any — build fails, no silent stale binary.
- `pom.xml`: `exec-maven-plugin:3.2.0` bound to **`process-classes`** (after resources copied, before
  package/repackage) — **using the `exec:exec` goal, not `exec:java`.**
- `.gitignore`: added `**/*.jasper`. `git rm --cached` the 28 tracked `.jasper` (working-tree copies kept,
  confirmed present after).

### ⚠️ Deviation from spec: `exec:java` doesn't work here — used `exec:exec` instead
Tried the spec's preferred `exec:java` goal first. It **never forks** in exec-maven-plugin 3.2.0 (confirmed:
`fork` isn't even a valid parameter for that goal) — it runs the precompiler in Maven's own JVM via a custom
classloader. JasperReports' report-expression compiler reads `System.getProperty("java.class.path")` (not the
classloader) to build javac's classpath, so every subreport with a dynamic `$F{...}`/`$P{...}` expression
failed with `package net.sf.jasperreports.engine does not exist` — the in-process JVM's `java.class.path` is
just the Maven wrapper's own bootstrap jar, not the project's. **Switched to `exec:exec`** (executable=
`${java.home}/bin/java`, classpath via `<classpath/>` magic argument, `classpathScope=compile`) — this truly
spawns a child process with a real `-cp`, so `java.class.path` is correct and all 52 `.jrxml` compile.
Also: `maven-antrun-plugin` (the spec's "acceptable alt") is unusable here — no `ant`/`ant-launcher` jar is
cached in this offline `.m2`, and this environment builds with `-o` (no network fetch possible).

**24-uncompiled-jrxml risk: resolved, no exclusions needed.** All 52 `.jrxml` compiled cleanly first try —
none were drafts/WIP; the 24 gap was purely "never regenerated," not "won't compile."

### Verify (DB-free)
- `./mvnw -o process-classes` alone: `[JasperPrecompiler] compiled 52/52 .jrxml under reports, reports-045`.
- **Build-fails-on-error proof:** corrupted one `.jrxml` attribute (`height="18"`→`height="not-a-number"`) →
  `./mvnw -o process-classes` → **BUILD FAILURE, exit 1** (exec-maven-plugin propagates the precompiler's
  non-zero exit). Reverted via `git checkout --` immediately after, confirmed 0 diff.
- **Acceptance probe (per spec, exact procedure):**
  1. First attempt appended text to an *existing* static-text element — the render **dropped the appended
     text** on TWO different elements, reproduced identically even via the long-proven `A6PreviewTest` path
     (JasperCompileManager+JasperFillManager directly, zero relation to this task's build change). This is a
     **pre-existing JasperReports/template rendering quirk, unrelated to REQ-031** — flagging it below rather
     than silently working around it, since SPEC-033 forbids `.jrxml` content changes as the deliverable and I
     didn't want to debug an unrelated defect mid-task. Reverted that probe cleanly (`git diff` empty after).
  2. Re-probed with a **brand-new** static-text element in empty band space (`TASK033PROBE`, band height bumped
     175→193 to fit it) — confirmed reachable via `A6PreviewTest` first (fast loop), then the real acceptance:
     `./mvnw -o clean package -DskipTests` (no PreviewTest ran) → booted the packaged jar
     (`java -jar target/*.jar --spring.profiles.active=dev`) → `GET /api/v1/preview/checklist/a6` → **PDF text
     extraction confirms `TASK033PROBE` present** (verified via PyMuPDF, not md5). **Today, before this task,
     this same probe would NOT have reached the PDF without a manual `.jasper` regen — that's the exact failure
     mode DEF-7/DEF-15 hit.** Reverted the probe via `git checkout --`, confirmed 0 diff.
- **Full regression:** `./mvnw -o clean package` (with tests) → **BUILD SUCCESS, 5/5 tests pass**; all 5
  PreviewTests (a6/a9-destroy/a9-transport/a14/a15) render their expected page counts, no "null". `git status`:
  no `.jasper` tracked (`git ls-files | grep -c '\.jasper$'` = 0); 28 files show as staged deletions (`D `,
  pending — not committed per protocol).

### ⚠️ Flag for Sober: pre-existing template rendering quirk found (out of scope, not touched)
While probing, found that **appending text to the existing a6-main static element `"1.  ชื่อผู้ขออนุญาต"` (and
separately, `"3.  ส่วนประกอบ...แนบ"`) silently drops the appended text from the rendered PDF** — reproduced
under both the new build pipeline AND the original `A6PreviewTest`/`JasperFillManager` path, so it predates
this task and is unrelated to REQ-031. Not diagnosed (out of scope; SPEC-033 = build-only, no template
changes). Worth a look if anyone ever needs to append to those two specific labels.

@Sober: ready for review — precompiler + exec:exec binding + git untrack all verified; the `exec:java`→`exec:exec`
swap is the only implementation deviation (documented above, required by this offline environment). Then a
build-only QA smoke (render one real report from the packaged jar).

## Questions
(Jason asks; Sober answers as `> answer: ...`)
