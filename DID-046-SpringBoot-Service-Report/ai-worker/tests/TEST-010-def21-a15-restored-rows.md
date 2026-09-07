# TEST-010: DEF-21 close — do the restored อ.15 rows render on real data? (refrow4/refrow5)

- Source: DEF-21 / TASK-047 close gate (Porter, 2026-09-03)
- Status: **DEF-21 STRUCTURAL FIX CONFIRMED · tick/value branch = ACCEPTED GAP (unexercised on all 9)**
- Environment: own clean build, `:33023`, dev, UAT-wired (DID_SPF), read-only
- Tested: 2026-09-07 by Tanya

## What DEF-21 was
`A15ReportBuilder` reuses `buildTransportItem12`, which emits `refrow4` (`ตาม …`, code **00014**) and
`refrow5` (`สำเนาบัตรประชาชนผู้รับมอบอำนาจ`, code **00020**). Those two bands existed only in a9-transport,
so on the real a15 path Jasper matched no band and **silently dropped both rows** (tick + value + all).
TASK-047 gave a15 its own refrow4/refrow5 bands. Close gate = render real อ.15 and confirm the rows come back.

## Method
Real-DB seam `GET /api/v1/preview/checklist/a15/db/{id}` — this calls `a15ReportBuilder.createDataRaw(id)`,
the **same builder + same DB queries** `/download` uses (only the id-decryption differs; data is identical).
Not the mock (`previewA9`/`createPreviewData`) — the mock is what hid DEF-21. Rendered all **9** stakeholder-
supplied อ.15 samples (type=5 with a buyer row): `35429 · 35273 · 35141 · 35155 · 34950 · 34614 · 34903 ·
34885 · 34916`. Extracted with PyMuPDF (fitz decodes the TH-SarabunPSK Thai; `pdftotext` does not). Tick =
presence of a CHECK_IMAGE placement (`get_image_info`) on the row's y-band; verified the detector on
known-ticked requests (a9 37956 → 1 image, a9-destroy 38362 → 16).

## Result — all 9
| Request | HTTP | refrow4 `ตาม` present? | tick | value | refrow5 `บัตรผู้รับมอบอำนาจ` present? | tick | value |
|---------|------|------------------------|------|-------|--------------------------------------|------|-------|
| 35429 | 200 | ✅ | ✗ | — | ✅ | ✗ | — |
| 35273 | 200 | ✅ | ✗ | — | ✅ | ✗ | — |
| 35141 | 200 | ✅ | ✗ | — | ✅ | ✗ | — |
| 35155 | 200 | ✅ | ✗ | — | ✅ | ✗ | — |
| 34950 | 200 | ✅ | ✗ | — | ✅ | ✗ | — |
| 34614 | 200 | ✅ | ✗ | — | ✅ | ✗ | — |
| 34903 | 200 | ✅ | ✗ | — | ✅ | ✗ | — |
| 34885 | 200 | ✅ | ✗ | — | ✅ | ✗ | — |
| 34916 | 200 | ✅ | ✗ | — | ✅ | ✗ | — |
| — | — | **9/9 present** | **0/9** | **0/9** | **9/9 present** | **0/9** | **0/9** |

- **0 ORA of any code** across all 9 renders. **0 CHECK_IMAGE placements** anywhere in any of the 9 (no
  ticks on the whole checklist, not just these two rows → these requests have no attached-file documents).

## Distinguishing "empty" from "absent" (Porter's warning #2)
The two decisive facts, kept separate:
1. **The rows RENDER.** `refrow5`'s label `สำเนาบัตรประชาชนผู้รับมอบอำนาจ` is unique to the restored band —
   it appears on **9/9**. Pre-TASK-047 (Jason's probe) it was **MISSING**. So the band exists and Jasper
   emits it → **the DEF-21 structural regression is fixed, confirmed on real data.**
2. **The rows are empty of tick/value because the DATA is null**, not because the render is broken —
   item-12 otherwise carries real data on every request (person2 signature rows show 13-digit ID cards +
   expiry dates, 2–6 per request, rendering correctly). These 9 simply have no `BUYER_DOC_TYPE` /
   `BUYER_DOC_NO` / `ATTORNEY_ID_CARD_NO`, and no 00014/00020 attachment docs.

## Verdict
- **DEF-21 structural fix = CONFIRMED.** refrow4 + refrow5 render on 9/9 real อ.15; the silent-drop is gone.
- **Ticked/populated branch of these two rows = ACCEPTED GAP** — none of the 9 exercises a tick or value on
  00014/00020. Per Porter's instruction, do **not** mark DEF-21 fully closed on an unexercised render; record
  the populated branch as an accepted gap (same treatment as อ.14 ticks / อ.4 อ.8 columns). Re-verify if a
  real อ.15 with 00014 or 00020 attached ever appears.
- Note: `/a15/db` bypasses the family resolver (routing is REQ-028's gate); data & form are identical to
  what `/download` produces for a type-5 request.
