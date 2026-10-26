# REQ-032: ตรวจสอบประวัติ checklist report — finish the abandoned `personCheck` work

- Status: READY_FOR_SA — RELEASED 2026-08-27, nothing outstanding from the human
- Priority: HIGH — the UI already offers the button and it returns an error
- Requested: 2026-08-27 by human
- Official form: `project-docs/PersonCheck-form-official.pdf`

## Problem
The UI has a checklist button on **ตรวจสอบประวัติ** requests. Clicking it returns
`400 Unsupported requestType: CHECKPERSON`. The request resolves and its data loads; there is simply
no report registered for `CHECKPERSON`.

## This is abandoned work, not a new build — evidence
Three of the four layers already exist:

| layer | state |
|---|---|
| Routing | ✅ `RequestTypeResolverService:41` — `case 0 → "CHECKPERSON"` |
| Checklist master | ✅ `BgChk`, **7 rows**, seeded |
| **Templates** | ✅ **`src/main/resources/reports/request-personCheck/` — 6 `.jrxml`** |
| Builder + report definition | ❌ **missing — this is the whole gap** |

`request-personCheck` is the **only** template folder in the project with no matching builder
(a1, a3, a6, a9-destroy, a9-transport, a14, a15, personChange, expand, open, planChange all have one).
That is what makes this identifiable as *the* unfinished document the team remembered.

## Form ↔ template confirmation (verified, not assumed)
The official PDF and the abandoned templates line up 1:1:

| official form section | template |
|---|---|
| 5 evidence items ๑–๕ | `request-personCheck-documentItems.jrxml` |
| รายชื่อกรรมการ/ผู้ถือหุ้น/ผู้จัดการโรงงาน + สำเนาบัตรประชาชน + สำเนาทะเบียนบ้าน (5 rows) | `request-personCheck-list.jrxml` |
| เอกสารประกอบเรื่อง — ครบ / ไม่ครบ ขาดเอกสารดังนี้ (๑–๓) / เอกสารที่หมดอายุ (๑–๓) | `verificationResult` + `-Sections` + `-Sections-Item` |
| ผู้มายื่นเรื่อง · เจ้าหน้าที่รับเรื่อง · วันที่มาติดต่อ | `request-personCheck-main.jrxml` |

The three strings in `main` match the form's footer exactly. **The templates are this form.**

## Form structure (surveyed from the official PDF)
Single page. Heading:
`หลักฐานประกอบการตรวจสอบประวัติกรรมการ/ผู้ถือหุ้น/ผู้จัดการโรงงานของบริษัทฯ`

Five evidence items:
1. สำเนาบัญชีรายชื่อผู้ถือหุ้นซึ่งแสดงรายละเอียดเกี่ยวกับชื่อ สัญชาติ และจำนวนที่ถือ
2. สำเนาหนังสือบริคนห์สนธิ
3. สำเนาหนังสือรับรองบริษัทฯ
4. สำเนาบัตรประจำตัวประชาชน สำเนาทะเบียนบ้านของกรรมการ, กรรมการซึ่งมีอำนาจลงนามผูกพันนิติบุคคล,
   ผู้จัดการ หรือผู้ถือหุ้น → followed by the **person table** (5 rows × บัตรประชาชน / ทะเบียนบ้าน)
5. หนังสือมอบอำนาจ ในกรณีที่ผู้อื่นคำขอได้รับมอบอำนาจให้ยื่นคำขอแทน

Then `เอกสารประกอบเรื่อง`: ☐ ครบ ☐ ไม่ครบ ขาดเอกสารดังนี้ (๑–๓) · เอกสารที่หมดอายุ (๑–๓)
Footer: ผู้มายื่นเรื่อง · เจ้าหน้าที่รับเรื่อง · วันที่มาติดต่อ

⚠️ **This form is unlike the others we've built.** It is one page, it has no
signature block, no law-reference section, no annex, and it carries a
**ครบ/ไม่ครบ verification result** that none of อ.6/อ.9/อ.14/อ.15 has. Do **not** clone an
อ.9-family builder — the closest existing shape is **a1/a3**, which is also why the abandoned
templates mirror their structure.

## Requirement
1. Build the missing **report definition + builder** so `CHECKPERSON` renders, reusing the existing
   `request-personCheck` templates. Do not redesign them.
2. Evidence ticks follow the standing **TICK RULE** (`CHECKLIST_CODE` → checklist id →
   `T_T_REQUEST_DOC`, tick iff `ATTACH_FILE_ID` not null/0 and `STATUS` ≠ D). Codes from `BgChk`.
3. Structure locked to the official form; blank never `null`.

## ⚠️ Known defect already present in the abandoned templates
`request-personCheck-list.jrxml` contains a **hardcoded sample person**:
`1. นายทศนิยม หน้าสองหลังสาม`. That is leftover test data and will print on real documents. It must
be removed/replaced with the real binding — flagging it now so it is not discovered on a rendered
government form.


## ✅ `BgChk` mapping — COMPLETE (2026-08-27)

7 master rows, 6 active. Reconciled against the official form:

| official form line | CHECKLIST_CODE | IS_ACTIVE |
|---|---|---|
| ๑ บัญชีรายชื่อผู้ถือหุ้น (ชื่อ/สัญชาติ/จำนวนหุ้น) | `BgChk00701` | 1 |
| ๒ สำเนาหนังสือบริคณห์สนธิ | `BgChk00302` | 1 |
| ๓ สำเนาหนังสือรับรองบริษัทฯ | `BgChk00203` | 1 |
| ๔ person table → **สำเนาบัตรประจำตัวประชาชน** column | `BgChk10204` | 1 |
| ๔ person table → **สำเนาทะเบียนบ้าน** column | `BgChk10305` | 1 |
| ๕ หนังสือมอบอำนาจ (กรณีมอบอำนาจให้ยื่นแทน) | `BgChk00606` | 1 |
| *(master-only, not on the form)* สำเนา อ.2 | `BgChk00001` | **0** |

**The 7-vs-5 arithmetic resolves neatly, and it tells us something useful:** form item ๔ is not one
tick — it is the **person table's two columns**, each with its own code. That is exactly why the
abandoned `request-personCheck-list.jrxml` has two tick columns
(`สำเนาบัตรประชาชน` / `สำเนาทะเบียนบ้าน`). The template and the master agree; the design was already
coherent before it was abandoned.

⚠️ **`SEQUENCE` is duplicated here** — both `BgChk00001` (inactive) and `BgChk00701` are `SEQUENCE 1`.
One more reason the TICK RULE binds by `CHECKLIST_CODE` and nothing else. Do not sort or index by
SEQUENCE in this group; it is not unique.

**REQ-032 is now fully specified — nothing further is needed from the human to start.**

## Open — for SA (no longer blocking the start)
- Where the person table, the ครบ/ไม่ครบ result and the footer fields source from — SA to identify
  from the templates' existing field names plus `T_T_REQUEST_PER` / `T_T_REQUEST_LOC_CHK`.


## 📐 ADDENDUM (2026-08-27) — stakeholder revised the layout; write-in rows + หมายเหตุ

The human edited the template's layout/margins themselves and handed back a revised target. **Their
version supersedes my earlier reading of the official PDF** for this section — the form has more
verification options than the PDF I surveyed.

### Current verification block (as now rendered)
☐ ครบ · ☐ ไม่ครบ ขาดเอกสารดังนี้ · ☐ **แก้ไข** · ☐ เอกสารที่หมดอายุ · ☐ **เอกสารเพิ่มเติม อื่น ๆ**

(`แก้ไข` and `เอกสารเพิ่มเติม อื่น ๆ` were not in `PersonCheck-form-official.pdf`.)

### What the team must change

1. **Person table — minimum 5 rows.** Always print at least 5 rows; **grow beyond 5** when the request
   has more people. Today it prints only the rows that exist (the sample render shows a single row).
   This is a paper form: the empty rows are there to be written on by hand.

2. **Minimum 3 numbered write-in rows under each of these four sections:**
   - ไม่ครบ ขาดเอกสารดังนี้
   - แก้ไข
   - เอกสารที่หมดอายุ
   - เอกสารเพิ่มเติม อื่น ๆ

   Numbered (๑. ๒. ๓. …) with a ruled write-in line each, exactly as in the stakeholder's revision.

3. **Add a `หมายเหตุ` section after เอกสารเพิ่มเติม อื่น ๆ**, before the footer — ruled write-in lines,
   per their revision.

### 🎯 This resolves the "accepted limitation" I recorded earlier
I logged `เอกสารที่หมดอายุ ๑–๓` as an accepted gap because no data source exists for it. **That was
the wrong frame.** These sections are **hand-written on the printed form** — they need blank ruled
lines, not a data binding. The limitation disappears; it was never a data problem.

Same reasoning applies to the person table's empty rows: officers fill them in by hand.

### Observation for the team to confirm, not assume
The current render shows `วันที่มาติดต่อ  08/05/2569 **14:22**`; the stakeholder's revision shows
`08/05/2569` with **no time**. Match their revision (date only) — but if the time is deliberate,
raise it to me rather than deciding silently.

### Unchanged
Structure otherwise stays locked to the form; blank never `null` (see DEF-18); ticks per the TICK RULE.


## 🔴 ADDENDUM 2 (2026-08-27) — TWO entry points, and the verification block is DATA, not hand-fill

The stakeholder corrected my understanding. This supersedes Addendum 1 on the verification block.

### The form is reachable two ways
| # | entry point | data source |
|---|---|---|
| **1** | the normal **ดู checklist** button on a ตรวจสอบประวัติ request | the live request — `T_T_REQUEST` + the joins we already use |
| **2** | the **ดู checklist** button inside the request's **history / activity** log | the **`T_T_REQUEST_CHECKLIST_FORM` snapshot family** |

Entry 2 is a **stored snapshot** — what the checklist looked like when it was recorded. The resolver
already has the hook for it: `resolveChecklistRequestTypeByChecklistFormId`.

### The snapshot family (worked example: `REQUEST_CHECKLIST_FORM_ID = 211`)

**`T_T_REQUEST_CHECKLIST_FORM`** — the header, and the footer fields:
| column | prints as |
|---|---|
| `REQUEST_PERSON_NAME` | ผู้มายื่นเรื่อง |
| `CREATE_NAME` | เจ้าหน้าที่รับเรื่อง |
| `REQUEST_CONTACT_DATE` | วันที่มาติดต่อ |
| `FORM_CODE` = `BgChk` | which checklist group this snapshot belongs to |
| `REQUEST_ID`, `REQUEST_DATE`, `OBJECTIVE_TYPE`, `REASON` | header context |

**`T_T_REQUEST_CHECKLIST_DOC`** — the evidence items, already flattened with their ticks:
`CHECKLIST_NAME` (the printed label) · `SEQUENCE` · **`HAS_FILE`** (the tick) · `CHECKLIST_ID`.
Six rows for 211, `SEQUENCE` 1–6, matching the six active `BgChk` rows in order.

**`T_T_REQUEST_CHECKLIST_PER`** — the person table, ticks included:
`REQUEST_CHECKLIST_PERSON` · **`HAS_ID_CARD_NO_FILE`** · **`HAS_HOUSE_REG_NO_FILE`** — i.e. the two
tick columns are stored per person, not derived.

**`T_T_REQUEST_CHECKLIST_DTL`** — ⚠️ **the verification block**, keyed by `TITLE_CHECKLIST_CODE`:
| code | section on the form |
|---|---|
| `DocIncomp` | เอกสารไม่ครบ |
| `DocEdit` | แก้ไขเอกสาร |
| `DocExpire` | เอกสารหมดอายุ |
| `DocExtra` | เอกสารเพิ่มเติม |
| `Other` | อื่น ๆ |

(titles from `T_S_COMMON_CODE` `GROUP_CODE = 'TitleChecklist'`; each row carries `REASON` +
`DESCRIPTION`.)

### ⚠️ What this reverses
**Addendum 1 said those four sections are blank hand-fill rows. That is wrong for entry point 2** —
they are stored rows and must be printed from `T_T_REQUEST_CHECKLIST_DTL`. The blank ruled rows remain
as *padding* to the minimum row counts, not as the whole design.

The ครบ/ไม่ครบ computation rule from the previous entry still applies to **entry point 1** (the live
path), where there is no snapshot to read.

### Requirement
1. **Support both entry points** through the same template — one report, two data paths.
2. Entry 2 reads the snapshot **verbatim**: labels, ticks, person rows and verification text as stored.
   Do **not** recompute anything for a historical record; it is a record of what was, and recomputing
   it from today's data would silently rewrite history.
3. Entry 1 keeps the live behaviour already built, plus the ครบ/ไม่ครบ rule.
4. Minimum row counts (5 persons, 3 per verification section) and หมายเหตุ still apply to both.

### Open — SA to determine, not guess
- Whether entry 1 should also **write** a snapshot row, or only entry 2 reads them.
- `T_T_REQUEST_CHECKLIST_DTL` has `REASON` **and** `DESCRIPTION`. In the samples `DESCRIPTION` looks
  like the document name and `REASON` like the officer's note. **Confirm which prints on which line**
  before wiring — this is exactly the kind of pair that renders plausibly when swapped.

## Acceptance Criteria
- [ ] Request **38237** renders a PDF instead of `400`.
- [ ] Output matches `PersonCheck-form-official.pdf` — heading, 5 items, person table,
      ครบ/ไม่ครบ block, footer.
- [ ] Ticks reflect real attachments per the TICK RULE.
- [ ] **No hardcoded sample person appears.**
- [ ] อ.6 / อ.9 / อ.14 / อ.15 / a1 / a3 unaffected.
- [ ] Person table prints **≥5 rows** and grows past 5 when there are more people.
- [ ] ไม่ครบ / แก้ไข / เอกสารที่หมดอายุ / เอกสารเพิ่มเติม each print **≥3 numbered write-in rows**.
- [ ] `หมายเหตุ` section prints after เอกสารเพิ่มเติม อื่น ๆ.
- [ ] No literal `null` anywhere (DEF-18).

## Out of scope
**ตรวจโรงงาน (REQUEST_TYPE 1)** — no master, no resolver case, no templates, no evidence anyone
started it. Pending the system owner confirming whether that button should exist at all; removing a
button is cheaper than building an unspecified report.
