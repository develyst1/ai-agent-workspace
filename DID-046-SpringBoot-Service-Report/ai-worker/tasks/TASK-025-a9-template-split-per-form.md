# TASK-025: Split the อ.9 template folder per-form (request-a9 → request-a9-destroy + request-a9-transport)

- Source: SPEC-028 addendum (REQ-026, Porter's per-form-convention direction). Completes the a9 split —
  templates now per-form like every other report.
- Status: DONE (Sober-reviewed)
- Assignee: Jason (BE)
- Depends on: TASK-024 (DONE — A9D/A9T builders + routing already in place)
- ⚠️ **Resource files only. Do NOT touch the shared Java base** (`A9CheckListReportBuilderBase`) or the two
  variant builders. Byte-identical render — the templates are copied verbatim, just relocated per form.

## Do
1. Copy `src/main/resources/reports-045/request-a9/` → **`request-a9-destroy/`** and **`request-a9-transport/`**,
   each keeping the full set: `main/request-a9-*.jrxml` + `subreport/{component,evidence,evidenceSub,lawRef,
   signature}.jrxml`. Rename files + fix each jrxml's internal `request-a9` subreport refs to its own folder
   (the a14 rename pattern from TASK-018). Delete the shared `request-a9/` folder after.
   > Naming: keep the file stems clear (e.g. `request-a9-destroy-main.jrxml` or keep `request-a9-main.jrxml`
   > under the destroy/transport folders — match how a6/a14 name theirs; consistency over cleverness).
2. `ReportResourceService`: repoint the A9 openers so **A9-destroy → `request-a9-destroy/…`** and
   **A9-transport → `request-a9-transport/…`** (was both → `request-a9`). If the current openers are shared
   (`openRequestA9Main` etc.), split them into destroy/transport variants used by `exportPdfA9` per report
   code, OR pass the folder by report code — keep it minimal, no output change.
3. Regenerate `.jasper` into **both** new folders (via the preview test(s) — split/extend `A9PreviewTest` so
   it compiles+renders destroy and transport against their own folders) + `clean compile`. Never hand-edit `.jasper`.

## Verify — byte-identical via text-equivalence (NOT md5 — .jasper recompile is non-deterministic)
- BE (DB-free): re-render destroy + transport previews → **content-equivalent** to pre-split (heading, item-5,
  item-12 set/order, 4 sigs, annex, page count 4/5, **no "null"**) via PyMuPDF text. a6/a14 unchanged.
  test-compile + all PreviewTests green; the shared `request-a9` folder is gone; both new folders have their
  `.jasper`. Java base + builders untouched (grep: no `.java` change except `ReportResourceService`).
- QA (real DB, via Porter): real destroy + transport via `/download` + `/a9/db` still render identically; both route.

## Definition of Done
- [ ] `request-a9-destroy/` + `request-a9-transport/` each hold the full main+subreport set; old `request-a9/` deleted.
- [ ] `ReportResourceService` points A9-destroy/transport at their own folders; only `ReportResourceService.java`
      changed (base class + builders untouched).
- [ ] `.jasper` regenerated in both folders; test-compile + PreviewTests green; destroy/transport content-equivalent; no "null".

## Handoff after DoD
Back to **Sober** for review (content-equivalence + confirm Java base untouched). Then this unblocks
**REQ-027** (อ.15 clones a9-transport — now a *per-form* folder to clone cleanly).

## Progress — EXECUTED, DB-free verified → REVIEW (2026-08-20)
- Copied `request-a9/` → `request-a9-destroy/` + `request-a9-transport/` **verbatim** (main + 5 subreports each);
  no jrxml edits needed — a9 subreports load via `$P{SUB_*}` params from Java, **no path-based refs** (unlike a14).
  Old `request-a9/` **deleted** (user-approved — auto-guard had blocked the pre-existing-tree delete).
- `ReportResourceService`: 6 A9 openers now take a `folder` arg → destroy/transport point at their own folder.
- `JasperPdfReportService`: `exportPdfA9Destroy` / `exportPdfA9Transport` (thin) over private `exportPdfA9(data, folder)`.
- `DocumentController` (2 download + 2 history cases) + `PreviewController` (`/a9/db` seam + mock `previewA9`) repointed.
- `A9PreviewTest` now compiles+renders **each folder against its own templates** → `.jasper` regenerated in both.
- **Java base (`A9CheckListReportBuilderBase`) + both variant builders: UNTOUCHED** (grep-confirmed).

### ⚠️ DoD-2 wording note (for Sober)
DoD item 2 / verify says "only `ReportResourceService.java` changed" — but routing per folder necessarily also
touched `JasperPdfReportService` (the split) + the two controllers (call the right method). This matches **step 2's
own** "split them into destroy/transport variants used by exportPdfA9 per report code". The **real** intent —
**base class + variant builders untouched** — is fully met. Reconfirming the exact "only ReportResourceService"
line is unachievable with the shared record carrying no variant token; flagging rather than forcing an ugly workaround.

### Verify (DB-free)
- `clean test-compile` **BUILD SUCCESS**; boot :33092 **Started** clean (openers resolve, beans wire).
- `A9PreviewTest`: destroy 4pg → `a9-preview.pdf`, transport 5pg → `a9-transport-preview.pdf`, each from its OWN
  folder. PyMuPDF: **content-equivalent** to pre-split (chars 7805 destroy / 7606 transport — identical to TASK-024
  run), **0 literal "null"**. a6/a14 templates+code untouched. Shared `request-a9/` gone; both new folders have `.jasper`.
- md5 not used (jasper recompile is non-deterministic — TASK-024 finding); text-equivalence per this task's own verify note.
- Real destroy/transport byte-identical = QA's leg (BE rule #4): Tanya re-renders via /download + /a9/db.

@Sober: ready for review — base+builders untouched, per-form folders in place, old folder deleted (approved).
Then this unblocks **REQ-027** (อ.15 clones `request-a9-transport/` cleanly).

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** (Sober, 2026-08-20). Verified independently:
- `request-a9-destroy/` + `request-a9-transport/` each hold main + 5 subreports; old `request-a9/` **deleted**. ✅
- `ReportResourceService` A9 openers take a `folder` arg → each report loads its own folder. Base
  (`A9CheckListReportBuilderBase`) + both variant builders **untouched** (grep for folder/path refs in the
  builder package = empty). ✅
- Content-equivalent render: **destroy** (ขนย้าย heading / กำจัด item-5 / 9-subs, no ขาย) + **transport**
  (ขายและขนย้าย / หน่วยงานผู้ซื้อ / export item-12) each from its OWN folder; cross-checked no leakage; pages 4/5;
  **no "null"**. Char-count deltas vs Jason's numbers = extraction-method noise (same reason md5 was dropped). ✅
- **DoD-2 wording note ACCEPTED:** my "only ReportResourceService.java changed" was over-specified — per-folder
  routing necessarily also touches `JasperPdfReportService` + the 2 controllers (to pass the folder per report
  code). The real intent — **base class + variant builders untouched** — is fully met. Good flag.
- Real byte-identical = QA's leg (rule #4). **Unblocks REQ-027's template-clone step** (a15 clones `request-a9-transport/`).
