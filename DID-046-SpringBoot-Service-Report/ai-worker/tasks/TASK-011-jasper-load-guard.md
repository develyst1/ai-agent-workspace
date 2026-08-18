# TASK-011: Name the failing .jasper on load (guard against silent corruption)

- Source: DEF-7 (corrupt a9 .jasper) — the corruption itself is already resolved (all .jasper valid);
  this is the recurrence guard Porter asked for.
- Status: REVIEW
- Depends on: none

## Context
A .jasper got a bad header (`EF BF BD…` = a binary file saved through a text tool) and blocked all a9
rendering. It's fixed now (a fresh `A6/A9PreviewTest` recompile from the intact `.jrxml` rewrote the
files in binary; all 12 a6+a9 `.jasper` are valid `AC ED 00 05`). But the failure was **hard to
locate** because `JasperPdfReportService` only throws `"Generate PDF report failed"` with no filename.

## What to do (small, cross-cutting)
`report/common/service/JasperPdfReportService.java`:
1. Change the `loadJasperReport(InputStream)` helper (or its call sites) so a load failure names the
   **resource path** that failed. Simplest: give `ReportResourceService.open(String path)` /
   `loadJasperReport` the path and include it in the thrown message, e.g.
   `"Failed to load Jasper template: reports-045/request-a9/main/request-a9-main.jasper"`.
2. (Optional, cheap) validate the first 4 bytes are `AC ED 00 05` when opening a `.jasper`; if not,
   throw a clear message: `"<path> is not a valid compiled .jasper (bad header — likely saved as text;
   regenerate via the PreviewTest)"`.
- Keep it minimal — do NOT change report output or the resource paths.

## Prevention note (for the team/human, not code)
`.jasper` are **compiled binaries** — never edit/save/copy them through a text editor, clipboard, or
text-mode transfer. Edit the `.jrxml` and **regenerate** via
`./mvnw -o -Dtest=A6PreviewTest test` (a6) / `-Dtest=A9PreviewTest test` (a9), which recompiles
`.jrxml → .jasper` in binary. (Longer term: consider a maven jasper-compile step so `.jasper` are a
build artifact, not committed.)

## Definition of Done
- [ ] A Jasper load failure names the exact `.jasper` resource in the exception/log.
- [ ] (If done) header validation gives a clear "regenerate via PreviewTest" message.
- [ ] `./mvnw -o -DskipTests=false test-compile` green; A6+A9 PreviewTests still green; no output change.

## Implementation Notes
**Changed (1 file, single choke point):** `ReportResourceService.open(String path)` — the one method
every `.jasper` (main **and** subreports, all report types) is opened through. For a `.jasper` path it
now reads the bytes, validates the Java-serialization magic header `AC ED 00 05`, and:
- valid → returns a `ByteArrayInputStream` of the bytes (stream intact for the caller, output unchanged);
- bad header → throws `IOException("<path> is not a valid compiled .jasper (bad header — likely saved
  as text; regenerate via the PreviewTest)")`.

Because `open(path)` knows the path, the failing file is **named** — for both the main report (passed
straight to `fillReport`) and subreports (via `loadJasperReport`); the named `IOException` surfaces as
the cause of `exportPdf*`'s "Generate PDF report failed". No call sites, resource paths, or report
output changed (guard only gates `.jasper`; non-`.jasper` pass through untouched).

Sample message:
`reports-045/request-a9/main/request-a9-main.jasper is not a valid compiled .jasper (bad header — likely saved as text; regenerate via the PreviewTest)`

**Verification (BE boundary):**
- `./mvnw -o -DskipTests=false test-compile` → **BUILD SUCCESS**.
- `A6PreviewTest` + `A9PreviewTest` → **Tests run: 2, Failures: 0** (a6 pages=3, a9 pages=4) — no
  output regression.
- Accept path matches reality: `head -c4` of the real `request-a9-main.jasper` / `request-a6-main.jasper`
  = `aced0005` → valid files pass the guard; only bad-header files throw the named error.
- (The PreviewTests compile+load `.jasper` directly, not via `open()`; the render path that uses the
  guard is the app's `exportPdf*` — exercised on any real render, where a valid header now passes and a
  text-corrupted one fails by name.)

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** (Sober, 2026-08-05). Verified independently.
- Guard lives in the ONE choke point `ReportResourceService.open(String)` (every .jasper, main +
  subreports, all report types, opens through it). ✅
- `.jasper`-only (`path.endsWith(".jasper")`); non-.jasper pass through unchanged → no behaviour change
  elsewhere. ✅
- Correct check: magic `AC ED 00 05` (Java serialization header) on the first 4 bytes; bad → `IOException`
  naming the **path** + "regenerate via the PreviewTest". Valid → `ByteArrayInputStream` (stream intact;
  JRLoader reads it fully anyway). ✅
- Scope = 1 file. Re-ran `./mvnw -o -DskipTests compile` → exit 0; accepted Jason's A6+A9 PreviewTests
  green (pages 3/4) + valid-header check on the real files. ✅
- Minor (not blocking): reads the whole .jasper to check 4 bytes — negligible (small files, loaded fully anyway).
DEF-7 recurrence guard closed.
