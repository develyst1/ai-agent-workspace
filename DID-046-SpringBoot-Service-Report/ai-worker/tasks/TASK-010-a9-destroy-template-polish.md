# TASK-010: อ.9 destroy — page-1 binding (DEF-4a) + null-date (DEF-5) + item-12(1) date

- Source: SPEC-019 audit / DEF-4a, DEF-5. No data/human needed — all template/builder + verifiable in
  the A9PreviewTest mock loop.
- Status: TODO
- Depends on: none

Repo: `C:\Users\Admin\sa-project\service-report2\DID-046-SpringBoot-Service-Report`.
**Verify everything via `./mvnw -o -Dtest=A9PreviewTest -DfailIfNoTests=false test` → `target/a9-preview.pdf`**
(the mock sets a name + destroyLocation, so a correct fix makes them appear on page 1). Do NOT hit the DB.

## DEF-4a — item 1 (ชื่อผู้ขอ) & item 5 (สถานที่กำจัด/ทำลาย) render BLANK
SA diagnosis (confirmed): **reproduces in the mock preview** (mock name "บริษัท ตัวอย่าง จำกัด" and the
mock destroyLocation do NOT appear on page 1), so it's a pure template defect. The field declarations +
JSON expressions are **correct** (`applicant.name`, `applicant.destroyLocation` — same pattern as the
working `permitType`/`objective`). Root suspect = **layout overlap**: in `request-a9-main.jrxml` the value
textFields sit ON TOP of their static labels —
- item 1: `$F{applicantName}` textField at **x=17** (same x as the "1. ชื่อผู้ขออนุญาต" label), hTextAlign=Center;
- item 5: `$F{destroyLocation}` textField at **x=148** (inside the "5. สถานที่…" label which spans x=17–197);
whereas the working item 2 (x=118) / item 4 (x=106) value fields sit **clear to the right** of their labels.
**Fix:** reposition/resize the item-1 and item-5 value textFields so they render clear of the static labels
(mirror item 2's layout: value textField starting after the label ends), then confirm in the preview PDF
that the mock name + destroyLocation now print. (If repositioning alone doesn't fix it, iterate in the
preview loop — the mock reproduces it, so no DB is needed.)

## DEF-5 — literal "null" printed for a null date
Page-2 item 2 prints "ลงวันที่ **null**" when the doc has no date. Stop rendering the string "null":
null date/text → blank (or the dotted write-in), and **sweep the other evidence date/text fields**
(issue/expiry inlines, item-5 sub-doc dates, etc.) for the same leak. Fix at the source — e.g. the builder
passes `""` not `null`, or the a9 evidence subreport expression guards `$F{x}==null?"":$F{x}`. Confirm no
"null" text anywhere in the preview PDF.

## item 12(1) destroy-date VALUE — not wired
`buildEvidences` item 12(1) ("(1) วัน เดือน ปี ที่จะทำการกำจัดหรือทำลาย") currently has label+tick only.
Wire its value = `T_T_REQUEST_MOVE.WRITE_OFF_DESTROY_DATE` (Thai date via `ThaiDateFormatUtil`), blank when
null (graceful). (This one needs the DB to see a real value, but the wiring + null-safety is verifiable in
code/compile; QA confirms the printed value later.)

## NOT in this task (clarified)
- **DEF-6 headings:** the current output (page 1 "…ขนย้ายอาวุธ", page 2 "…ขายและขนย้ายอาวุธ") **already
  matches the official DESTROY PDF** — the two headings differ *by design* in the official form, so no change
  for the destroy variant. Variant-correct headings for TRANSPORT are REQ-019 step 2. (SA flagged to Porter.)

## Definition of Done
- [ ] Preview PDF (A9PreviewTest): page-1 item 1 shows the mock name and item 5 shows the mock destroyLocation.
- [ ] No literal "null" anywhere in the preview PDF; date/text fields blank when empty.
- [ ] item 12(1) value wired to `WRITE_OFF_DESTROY_DATE` (null-safe).
- [ ] `./mvnw -o -DskipTests=false test-compile` green; A9PreviewTest green; a6 + a9 mock preview unaffected.
- [ ] Re-hand: SA reviews the preview PDF; QA later confirms on a real destroy sample.

## Implementation Notes
(Jason: what moved/changed in the jrxml + builder; the preview-PDF result for item 1/5 and the "null" sweep.)

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW: verdict + reasons.)
