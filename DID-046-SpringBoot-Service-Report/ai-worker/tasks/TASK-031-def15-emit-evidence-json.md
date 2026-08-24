# TASK-031: DEF-15 diagnostic — capture 38362's emitted `evidences` JSON (locate builder-vs-render gap)

- Source: DEF-15. 🔴 TOP. Prereq to fixing — static trace is clean, so we must see the runtime JSON.
- Assignee: Jason (BE, tiny temp instrumentation) → then QA captures → back to Sober to diagnose.

## Why (SA static trace is exhausted and CLEAN)
- `A9DestroyReportBuilder`: group=`ReqMoveDestroyer`, no `createData`/`buildEvidences` override.
- Base `createData → createDataRaw → buildEvidences` (the ONLY evidence source): builds ONE entry **per printed
  line**, each ticking by `checked(checkedIds, idFor(idByCode, "<suffix>"))` — code-based, NOT per-master-row/positional.
  `idByCode` keyed by full `CHECKLIST_CODE`; `checkedIds` = docs with `ATTACH_FILE_ID != null && != 0` by `REQUEST_CHECKLIST_ID`.
- Templates `request-a9-evidence.jrxml` (main, per item) + `request-a9-evidenceSub.jrxml` (doc/employer subs) both
  bind the checkbox to `Boolean.TRUE.equals($F{checked})`. Pairing is correct in source.
- **Hand-trace against Porter's 38362 dump → the CORRECT 7 ticks.** Yet a clean-built render (17:17, byte-identical
  to 15:18) shows the WRONG 7. ⇒ the divergence is in the RUNTIME JSON, not the pairing logic. Record uses
  `@JsonInclude(NON_NULL)` — a candidate (e.g. a `checked=false` vs omitted interaction, or a data-linkage where the
  real `CHECKLIST_CODE`/`REQUEST_CHECKLIST_ID` differ from the dump). Only the emitted JSON tells us which.

## Do (temporary, revert after diagnosis)
1. In `JasperPdfReportService.exportPdfA9Destroy(...)` (just before `JasperFillManager.fillReport`), log the exact
   JSON string being handed to `JsonDataSource`:  `log.debug("A9D-JSON {}", json);` (use the SAME `json` variable that
   feeds the datasource — do not re-serialize with a different mapper). Ensure that logger is at DEBUG.
   - If a `json` string isn't in scope there, log `objectMapper.writeValueAsString(data)` with the service's mapper.
2. No behavior change; no other file touched. Mark the line `// TASK-031 TEMP DEBUG — remove after DEF-15`.

## Verify / handoff
- BE: compiles/boots; the log line emits on an A9D download; test-compile + A9 PreviewTests green.
- QA (real, via Porter): download 38362 (A9D) once, capture the `A9D-JSON` line, paste the `evidences` array (esp.
  each line's `orderNo/title/checked` and item-5/item-12 `subItems[].label/checked`) into the log for Sober.
- Sober: read the emitted booleans. **Correct booleans** ⇒ Jasper/template fill issue (dig there). **Wrong booleans**
  ⇒ builder/data-linkage (trace `idFor` vs the REAL master ID/CODE + docs' REQUEST_CHECKLIST_ID). Then real fix + revert this.

## Progress — EXECUTED, DB-free verified → REVIEW (2026-08-24)
- Added `log.debug("A9D-JSON {}", json)` inside the shared **private** `exportPdfA9(data, folder)`, gated on
  `"request-a9-destroy".equals(folder)` — logs the **exact same `json` variable** that feeds `JsonDataSource`
  (not re-serialized; the pre-existing `System.out.println` of the same var stays untouched, in case that's
  still useful). Tagged `// TASK-031 TEMP DEBUG — remove after DEF-15`.
- **DEBUG wasn't visible under default Spring Boot logging** (root=INFO), so added a temp `logging.level` block
  to `application.yml` (repo root, the runtime config) scoping DEBUG to just
  `com.smart.report.report.common.service.JasperPdfReportService` — tagged with the same removal marker.
- No other file touched; no behavior change (log-only); the pre-existing `System.out.println(json)` for ALL
  variants is unchanged.

**Verify (DB-free):** test-compile SUCCESS; `A9PreviewTest` green (destroy 4pg / transport 5pg — preview path
bypasses this service, so it can't exercise the new log line, only proves no regression); clean compile + boot
:33101 Started clean (the new `logging.level` key parses fine). **Emitting the line on a real A9D download is
QA's leg** (rule #4 — I don't touch the real DB/seam myself).

@Sober / @Tanya: ready — download 38362 (A9D) via `/a9/db/38362` or `/download/checklist/{encId}`, grep the
console/log for `A9D-JSON`, paste the `evidences` array back. Both edits (JasperPdfReportService.java +
application.yml) are marked TEMP for easy revert once DEF-15 closes.

## Note to Porter (answering your question)
The destroy evidence list is built **one entry per printed line, each carrying its own code** — NOT one per master
row. So `สลักหลัง 12305` (master row, no printed line) is simply never referenced, and `เปิดดำเนินการ` (printed line,
no master row) is hardcoded `false` — no position-for-position pairing across item 5, so a master/form count mismatch
can't desync it. That's why I'm going to the emitted JSON rather than the pairing: statically the pairing is correct.
