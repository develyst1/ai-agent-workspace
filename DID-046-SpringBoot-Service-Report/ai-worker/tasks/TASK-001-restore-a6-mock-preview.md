# TASK-001: Restore the อ.6 (a6) mock preview endpoint

- Source: SPEC-002
- Status: DONE
- Depends on: none

## What to do
Restore a no-auth, mock-data preview at `GET /api/v1/preview/checklist/a6`,
mirroring the existing `previewA9()`. Do **not** modify the DB-connected
`A6CheckListReportBuilder`, and do **not** touch `SecurityConfig` (the
`/api/v1/preview/**` path is already `permitAll`).

Repo: `C:\Users\Admin\sa-project\service-report2\DID-046-SpringBoot-Service-Report`

1. **Recover the old a6 mock data.** It lived in
   `A6CheckListReportBuilder.buildMock(...)` at commit `b0d9a84~1`. Get it with:
   ```bash
   git show b0d9a84~1:src/main/java/com/smart/report/report/checklist/a6/builder/A6CheckListReportBuilder.java
   ```
   Take the `buildMock(...)` body and its constants — that is the full sample
   data that renders the complete อ.6 layout. The `A6CheckListReportData` record
   shape is unchanged, so it compiles as-is (no field remapping needed).

2. **Add a self-contained mock provider** (new file), e.g.
   `report/checklist/a6/builder/A6CheckListPreviewBuilder.java`:
   - `@Component`, no dependencies on repositories.
   - Method `public A6CheckListReportData createPreviewData()` returning the
     restored mock (use `ReportDefinition.A6.getDocumentTitle()` for the title,
     as the old `buildMock` did).
   - Keep a `// ⚠️ TEMPORARY mock preview` note consistent with `PreviewController`.

3. **Wire the endpoint** in `PreviewController`:
   - Inject `A6CheckListPreviewBuilder`.
   - Add `previewA6()` at `@GetMapping("/checklist/a6")`, structured exactly like
     `previewA9()` (same `disposition` handling, filename `a6-preview.pdf`,
     `produces = application/pdf`):
     ```java
     A6CheckListReportData data = a6CheckListPreviewBuilder.createPreviewData();
     byte[] pdf = jasperPdfReportService.exportPdfA6(data);
     ```
   - Leave the existing `/checklist/a6/db/{requestId}` and `/checklist/a9` untouched.

## Definition of Done
- [ ] New `A6CheckListPreviewBuilder` returns the full mock `A6CheckListReportData`.
- [ ] `PreviewController` exposes `GET /api/v1/preview/checklist/a6` mirroring a9.
- [ ] `A6CheckListReportBuilder` (DB) and `SecurityConfig` are unchanged.
- [ ] Compiles: `./mvnw -DskipTests compile` (show the BUILD SUCCESS line).
- [ ] Manual check (report the result): run `./mvnw spring-boot:run`, open
      `http://localhost:33000/document-service/api/v1/preview/checklist/a6?disposition=inline`
      with **no auth header** → HTTP 200, a valid PDF showing the complete อ.6
      layout (all sections/fields). Compare visually against
      `.../preview/checklist/a9` for parity of behavior.

## Implementation Notes
**Changed (2 files, both in scope):**
- NEW `report/checklist/a6/builder/A6CheckListPreviewBuilder.java` — `@Component`, no
  repo deps. `createPreviewData()` returns the full mock `A6CheckListReportData`, lifted
  verbatim from `A6CheckListReportBuilder.buildMock(...)` at `b0d9a84~1`. Title comes from
  `ReportDefinition.A6.getDocumentTitle()` (as the old buildMock did). Marked `⚠️ TEMPORARY`.
- MOD `controller/PreviewController.java` — injected `A6CheckListPreviewBuilder`; added
  `previewA6()` at `@GetMapping("/checklist/a6")`, structured exactly like `previewA9()`
  (same disposition handling, filename `a6-preview.pdf`, `produces=application/pdf`).
- `A6CheckListReportBuilder` (DB) and `SecurityConfig` **unchanged** — verified via
  `git diff --stat` (empty). `/checklist/a6/db/{requestId}` and `/checklist/a9` untouched.

**Verification (evidence):**
- Compile: `./mvnw -o -DskipTests compile` → `BUILD SUCCESS` (81 sources; only pre-existing
  Lombok/unchecked warnings in unrelated files).
- Runtime: booted my build via `spring-boot:run --server.port=33099` (`:33000` was already
  occupied by a pre-existing instance) → `Started ... in 7.985s`, beans wired (new builder
  injection resolved, no missing-bean error).
- Manual no-auth GET `…:33099/document-service/api/v1/preview/checklist/a6?disposition=inline`
  → **HTTP 200, `application/pdf`, 272,739 bytes**, `Content-Disposition: inline; filename=a6-preview.pdf`,
  valid `%PDF-1.5` … `%%EOF`, **3 pages** (full อ.6 layout). No X-API-KEY / bearer sent.
- Parity: a9 on the same build → HTTP 200 application/pdf (468,814 bytes). Same behavior shape.
- Instance stopped after verification (`:33099` down); pre-existing `:33000` left untouched.

Note (FYI, no action): the pre-existing `:33000` instance already answered `/checklist/a6`
with a 200 PDF before my change — I did not rely on it; all evidence above is from my own
freshly-compiled build on `:33099`.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** (Sober, 2026-08-05).

Verified independently against SPEC-002 + DoD (not taken on trust):
- **Scope claim confirmed:** `git status`/`git diff --stat` = only `PreviewController.java`
  modified (+23) and new `A6CheckListPreviewBuilder.java` (untracked).
  `A6CheckListReportBuilder` (DB) and `SecurityConfig` produce an **empty diff** — untouched. ✅
- **Design matches SPEC:** `A6CheckListPreviewBuilder` is `@Component`, **no repo deps**,
  `createPreviewData()` → `buildMock(ReportDefinition.A6.getDocumentTitle())`, marked TEMPORARY.
  Mock lifted from `b0d9a84~1`. DB path left clean. ✅
- **Endpoint parity:** `previewA6()` at `GET /checklist/a6` mirrors `previewA9()` exactly
  (same disposition handling, `a6-preview.pdf`, `produces=application/pdf`); existing
  `/checklist/a6/db/{id}` and `/checklist/a9` untouched. No security change (path already permitAll). ✅
- **Constructor well-formed:** `new A6CheckListReportData(...)` passes all 8 fields in record order. ✅
- **Compile:** re-ran `./mvnw -o -DskipTests compile` myself → **exit 0** (independent of Jason's run). ✅
- **Runtime (Jason's evidence, consistent + detailed):** no-auth GET → HTTP 200, `application/pdf`,
  272,739 bytes, 3-page full อ.6 layout, `%PDF`…`%%EOF`; a9 parity 200/pdf. Accepted. ✅

FYI (no action — not a defect): mock uses placeholder filler (`sss`/`กกก`) and a hardcoded
`"180 วัน"` duration — expected for a layout baseline; REQ-002 asks for full layout with sample
data, which this satisfies.
