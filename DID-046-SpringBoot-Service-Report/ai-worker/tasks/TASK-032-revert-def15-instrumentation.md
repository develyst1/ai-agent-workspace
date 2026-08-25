# TASK-032: Revert the TASK-031 `A9D-JSON` debug instrumentation (DEF-15 closed)

- Source: Porter (DEF-15 CLOSED, REQ-030 DELIVERED). Instrumentation did its job → remove.
- Assignee: Jason (BE). Trivial, log-only revert.

## Do (both edits are tagged `// TASK-031 TEMP DEBUG — remove after DEF-15`)
1. `JasperPdfReportService.exportPdfA9(...)`: remove the temp block (the comment + the
   `if ("request-a9-destroy".equals(folder)) { log.debug("A9D-JSON {}", json); }`). Leave the pre-existing
   `System.out.println(...)` exactly as it was before TASK-031 (don't touch unrelated lines).
2. `application.yml` (repo root): remove the temp `logging.level` block scoping DEBUG to
   `...JasperPdfReportService` (lines tagged TASK-031).
3. Nothing else — no behavior change; the `json`/`JsonDataSource` fill path stays intact.

## Verify / handoff
- BE: `grep -rn "A9D-JSON\|TASK-031"` returns 0 in src + application.yml; test-compile + A9 PreviewTests green; boots.
- Back to Sober to confirm 0 refs + a9 destroy/transport still render (PreviewTests). No QA needed (log-only revert).

## Progress — EXECUTED, DB-free verified → REVIEW (2026-08-24)
- Removed the temp block from `JasperPdfReportService.exportPdfA9` (comment + the `if("request-a9-destroy"...)
  log.debug(...)`); the pre-existing `System.out.println(json)` line is untouched, exactly as before TASK-031.
  Also removed the `Logger`/`LoggerFactory` field+imports I'd added for TASK-031 (unused after the revert — no
  other caller in this class).
- Removed the temp `logging.level` block from `application.yml` (repo root); nothing else in that file touched.

**Verify:** `grep -rn "A9D-JSON\|TASK-031" src application.yml` = **0 hits**. test-compile SUCCESS; all 5
PreviewTests render (a6/a9-destroy/a9-transport/a14/a15); clean compile + boot :33102 Started clean.

@Sober: reverted cleanly, 0 refs, green build. TASK-032 done.
