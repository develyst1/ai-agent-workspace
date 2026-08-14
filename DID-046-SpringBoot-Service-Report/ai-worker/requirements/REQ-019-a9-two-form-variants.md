# REQ-019: อ.9 has TWO form variants — split by MOVE_REQUEST_TYPE

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-05 by human (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal
อ.9 is not one form. There are **two official variants**, and the report must pick the right one:

| Variant | When | Official form (in `project-docs/`) |
|---|---|---|
| **อ.9 แบบทำลาย** (destroy) | `T_T_REQUEST_MOVE.MOVE_REQUEST_TYPE = 2` ("ขนย้ายเพื่อทำลาย") | `A9-form-DESTROY-official.pdf` |
| **อ.9 แบบขนย้าย** (normal transport) | any other MOVE_REQUEST_TYPE (0,1,3,4,5) | `A9-form-TRANSPORT-official.pdf` |

**Selection rule (human, verbatim):** *"if moverequesttype = 2 ไป form ทำลาย else ไป form ปกติ"*

The team has so far built only the **destroy** variant (what TASK-008 produced).

## MOVE_REQUEST_TYPE code list (confirmed from `T_S_COMMON_CODE` GROUP_CODE='MoveRequestType')
| CODE_INT | CODE_NAME |
|---|---|
| 0 | ขนย้ายให้หน่วยงานตามมาตรา 7 |
| 1 | ขายและขนย้ายให้บุคคลอื่นนอกหน่วยงานตามมาตรา 7 |
| **2** | **ขนย้ายเพื่อทำลาย** ← destroy variant |
| 3 | ขนย้ายเพื่อทดสอบ |
| 4 | ขนย้ายเพื่อจัดแสดง |
| 5 | ขนย้ายกลับโรงงาน |

> Note: the sample used for testing (**18847**) is `MOVE_REQUEST_TYPE = 0` → it is actually a
> **transport** request. The human is knowingly using it to exercise the destroy form **because no
> destroy-type sample exists** in the data. Keep that in mind when judging output.

## Requirement
1. The อ.9 report must select the variant by `MOVE_REQUEST_TYPE` (2 → destroy, otherwise → transport).
2. Differences to implement (per the human):
   - **the top/header text** differs;
   - **some page-1 wording** differs;
   - **page 2 evidence items** differ (their own `T_T_REQUEST_DOC` / `T_S_REQUEST_CHECKLIST` set).
   The two official PDFs in `project-docs/` are the source of truth for the exact wording/items.
3. **Destroy variant specifics:** item 12 (2) "ตัวอย่างลายมือชื่อผู้รับอาวุธ" comes from
   **`T_T_REQUEST_EXAMPLE_SIGN`** (already wired in TASK-008).
4. **Transport variant specifics:** it has additional fields/items (e.g. ป.3, ป.5 and others visible
   in the official PDF). Their sources are to be identified from the **data dictionary**
   (`project-docs/DIDPERMIT-data-dictionary.xlsx`); raise a DATA REQUEST only for what the
   dictionary cannot answer.
5. **Page-2 evidence while the data team's master is pending:** the human wants it **mocked for now**
   so the layout can be reviewed — built so the real data can be plugged in later without rework.
   (This supersedes the "render blank until seeded" stance for the review period.)

## Acceptance Criteria
- [ ] A request with `MOVE_REQUEST_TYPE = 2` renders the **destroy** form; any other value renders the
      **transport** form.
- [ ] Header + page-1 wording of each variant matches its official PDF.
- [ ] Destroy: item 12 (2) sourced from `T_T_REQUEST_EXAMPLE_SIGN`.
- [ ] Transport: its extra items are present and sourced (or explicitly mocked pending data).
- [ ] Page-2 evidence renders with mock content that is trivially switchable to the real master data.
- [ ] No regression to the อ.6 reports.

## Constraints
- Backend + Jasper templates. Oracle 11.2-safe. Graceful degradation still applies.
- Real destroy-type sample data does not exist yet — verification of the destroy variant will use a
  transport-type id (e.g. 18847) with the variant forced/explained, until real data appears.

## Reference material (in `project-docs/`, gitignored)
- `A9-form-DESTROY-official.pdf` — the destroy variant (what we built)
- `A9-form-TRANSPORT-official.pdf` — the transport variant (new work)
- `DIDPERMIT-data-dictionary.xlsx` — field sources
- The human has already fixed the law-reference display and some UI margins directly in the code.

## Open question to answer FIRST (human asked)
**"Is the destroy variant done?"** — SA to do a gap analysis of the current `/a9/db/18847` output
against `A9-form-DESTROY-official.pdf` and report: what matches, what is missing/wrong, what is
pending data. That verdict gates whether we move on to the transport variant.

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
