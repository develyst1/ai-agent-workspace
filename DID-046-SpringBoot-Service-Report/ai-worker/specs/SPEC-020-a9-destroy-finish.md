# SPEC-020: Finish อ.9 DESTROY by construction — checklist locked in report, ticks from DB, ZERO mock

- Source: REQ-020 (human's FINAL ruling — rules complete, nothing blocked, no external dependency)
- Status: ACTIVE

## Settled rules (from the human, via Porter — the source of truth)
1. **Form structure + all 19 checklist lines are LOCKED IN THE REPORT** — labels are hardcoded (already
   are, in `buildEvidences`); layout = the official destroy PDF, **NOT** derived from `T_S_REQUEST_CHECKLIST`.
2. **Tick** = a `T_T_REQUEST_DOC` row joined to the checklist id, ticked only when `ATTACH_FILE_ID` is
   not null **and** > 0. Currently all-unticked (no matching docs) → **CORRECT, not a bug.**
3. **Law references** = `T_T_REQUEST_LAW_REF` (data-driven); empty block when absent = accepted.
4. **Item 12(2)** = `T_T_REQUEST_EXAMPLE_SIGN` (real rows w/ attachments; exclude `STATUS='D'`; show the
   `EXAMPLE_SIGN_TYPE` label for the attached ID copy).
5. **Missing data → render blank. NO mock, NO fabricated values anywhere.** "Blank" = a blank field /
   dotted line, **never the literal string "null"**.
6. **Page-1 sources** already proven: name/type/itemCount/destroyLocation/objective/duration.

## What actually changes (the code set for TASK-012)
Current DB build already: hardcoded labels, ticks from DB (unticked now = correct), lawRefs data-driven,
item 12(2) via `buildPerson2`(EXAMPLE_SIGN), no mock in the DB builder. Remaining:
1. **DEF-4a (template):** item 1 (ชื่อผู้ขอ) + item 5 (สถานที่กำจัด/ทำลาย) render blank though the JSON has
   the values — **reproduces in the A9PreviewTest mock**. Field decls + JSON expressions are CORRECT; the
   value textFields **overlap their static labels** (item 1 x=17 = label x; item 5 x=148 inside label
   x=17–197) unlike the working item 2/4/6. **Fix:** reposition/resize them clear of the labels; confirm
   the mock name + destroyLocation print in the preview PDF.
2. **DEF-5 (null leak):** page-2 item 2 prints "ลงวันที่ **null**". Null date/text → blank (or dotted),
   never "null". **Sweep** all evidence date/text fields (source: builder passes `""` not `null`, or the
   subreport guards `$F{x}==null?"":$F{x}`). Confirm no "null" text anywhere in the preview PDF.
3. **item 12(1):** wire the value = `T_T_REQUEST_MOVE.WRITE_OFF_DESTROY_DATE` (Thai date), **blank when
   null** (no mock). Currently label+tick only.
4. **`ReqMoveDestroyer` constant:** rename `A9CheckListReportBuilder.CHECKLIST_GROUP` `"ReqMove"` →
   `"ReqMoveDestroyer"` (destroy-variant group; transport gets its own later).
5. **item 12(2) label:** in `buildPerson2`, show the `EXAMPLE_SIGN_TYPE` label alongside the receiver —
   `1`=สำเนาบัตรประจำตัวประชาชน · `2`=สำเนาบัตรประจำตัวข้าราชการกลาโหม · `3`=สำเนาบัตรประจำตัวเจ้าหน้าที่ของรัฐ.
6. **DEF-6 (headings): NO CHANGE — verified.** `ReportDefinition.A9` documentTitle = "…ขนย้ายอาวุธ" (no
   "ขาย") = official destroy p.1; page-2 static = "…ขายและขนย้ายอาวุธ" = official p.2. They differ *by design*
   in the official destroy PDF — current output already matches. (Variant-correct headings for the
   TRANSPORT form = REQ-019 step 2.)

## Verify without the DB
DEF-4a, DEF-5, item-12(2) label, headings → all visible in the **A9PreviewTest** preview PDF (the mock
carries name/destroyLocation/person2). item 12(1) value + real ticks need a DB render (QA later). NO mock,
no data-team dependency for the code.

## Not in this task
- The `.jasper` load guard = TASK-011 (companion, already spec'd).
- TRANSPORT variant = REQ-019 step 2. Restore REQ-004 gate = REQ-018 step 2 (deferred).

## Tasks
- TASK-012: the code set above (supersedes TASK-010, which was a subset).

## Questions
(Jason asks; Sober answers as `> answer: ...`)
