# TEST-007: REQ-032 ตรวจสอบประวัติ (personCheck) checklist report

- Source: REQ-032 / SPEC-035 / TASK-038
- Status: CORE PASS + 1 defect (DEF-18 null leak) → NOT closed until DEF-18 fixed
- Environment: own clean build, `:33013`, dev, UAT-wired, read-only. Reached via the REAL
  `/download/checklist/{token}` (the download auth gate is currently OFF — REQ-018 step 2 deferred —
  so no key needed; token from log 2026-08-27 TASK-037).
- Tested: 2026-08-27 by Tanya

## Cases
| # | Check (acceptance) | Expected | Actual (38237) | Result |
|---|--------------------|----------|----------------|--------|
| 1 | Renders instead of 400 | 200 PDF (was `400 Unsupported requestType: CHECKPERSON`) | **HTTP 200 application/pdf**, 103,807 B, 1 page | ✅ PASS |
| 2 | Matches the official form | per `PersonCheck-form-official.pdf` | heading `หลักฐานประกอบการตรวจสอบประวัติกรรมการ/ผู้ถือหุ้น/ผู้จัดการโรงงานของบริษัทฯ`; items ๑–๕ present; person table header = รายชื่อ… \| สำเนาบัตรประชาชน \| สำเนาทะเบียนบ้าน; เอกสารประกอบเรื่อง ครบ/ไม่ครบ/แก้ไข/หมดอายุ/เพิ่มเติม; footer ผู้มายื่นเรื่อง·เจ้าหน้าที่รับเรื่อง·วันที่มาติดต่อ | ✅ PASS |
| 3 | Per-person ticks (TICK RULE) | real person + per-person บัตร/ทะเบียนบ้าน ticks | item ๔ table: **1. นายแพทย์ มงคล มีชัย** — both สำเนาบัตรประชาชน + สำเนาทะเบียนบ้าน **ticked**; items (1)(2)(3)(5) ticked; เอกสารประกอบเรื่อง = **ครบ** ticked | ✅ PASS |
| 4 | No hardcoded sample person | `นายทศนิยม หน้าสองหลังสาม` gone | **absent** (grep 0) — real `$F{name}` binding | ✅ PASS |
| 5 | Header labels fixed | 3rd col = สำเนาทะเบียนบ้าน (was duplicate บัตรประชาชน) | correct | ✅ PASS |
| 6 | Canaries unaffected | a6/38272 etc. 200 | a6/38272 → **200** | ✅ PASS |
| 7 | **No literal `null`** | blank, never `null` | ❌ **footer `วันที่มาติดต่อ` prints literal `"null"`** | **FAIL → DEF-18** |

## DEF-18 — `วันที่มาติดต่อ` (contactDate) renders literal "null" — MINOR (user-visible on a gov doc)
- On 38237 the footer line reads `วันที่มาติดต่อ   null`. The contactDate is null for this request and
  the report prints the literal string `"null"` instead of leaving it blank.
- Violates SPEC-035's "blank never null" and the standing project must-hold "no literal `null`" (REQ-021).
- Only occurrence in the PDF (the other footer field `เจ้าหน้าที่รับเรื่อง` blanks correctly). Likely the
  contactDate mapping isn't `nz()`-guarded like the other fields.
- QA can't fix (boundary). Route to Sober → Jason.
- Evidence: rendered page 1 inspected (footer), then deleted (real-person PII in the person table).

## Verdict
The REQ-032 core is right: **38237 now returns 200 instead of 400**, the output matches the official
ตรวจสอบประวัติ form, per-person ticks land by the TICK RULE, the hardcoded sample person is gone, and
the canaries are unaffected. **One defect blocks a clean close: DEF-18** (literal `null` at
`วันที่มาติดต่อ`). Fix DEF-18, re-render 38237 → then REQ-032 closes.
