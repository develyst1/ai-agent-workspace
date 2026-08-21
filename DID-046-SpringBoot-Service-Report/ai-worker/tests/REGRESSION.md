# REGRESSION — DID-046-SpringBoot-Service-Report

> The living checklist of everything the product must still do. Re-run the
> relevant rows whenever code near them changes. All checks are **read-only**
> (GET/read + report generation) on **local** or the UAT-wired env — never production.

## Preview endpoints (no-auth, mock data — dev/baseline only)

| # | Check | Endpoint | Expected | Last verified | By |
|---|-------|----------|----------|---------------|-----|
| R1 | a6 preview renders full อ.6 layout, no auth | `GET /document-service/api/v1/preview/checklist/a6?disposition=inline` | 200 `application/pdf`, 3-page complete อ.6 layout, `filename=a6-preview.pdf` | 2026-08-05 (TEST-001) | Tanya |
| R2 | a9 preview still works, no auth (parity) | `GET /document-service/api/v1/preview/checklist/a9?disposition=inline` | 200 `application/pdf`, `filename=a9-preview.pdf` | 2026-08-05 (TEST-001) | Tanya |
| R3 | disposition=attachment honored | `GET /.../checklist/a6?disposition=attachment` | 200 pdf, `Content-Disposition: attachment` | 2026-08-05 (TEST-001) | Tanya |
| R4 | preview needs no X-API-KEY | any `/api/v1/preview/**` with no auth header | not 401/403 | 2026-08-05 (TEST-001) | Tanya |

## Real-data อ.6 via /a6/db seam (UAT-wired :33000, dev profile, read-only)

| # | Check | Endpoint / method | Expected | Last verified | By |
|---|-------|-------------------|----------|---------------|-----|
| R5 | Real อ.6 generates from plain id, no key | `GET /api/v1/preview/checklist/a6/db/{id}` | 200 `application/pdf`, real data | 2026-08-05 (TEST-002, ids 38240/272/273) | Tanya |
| R6 | Real อ.6 layout parity vs mock baseline | render (PyMuPDF) real vs mock pages | same sections/boxes/positions | 2026-08-05 (TEST-002, 38272) | Tanya |
| R7 | D4 signature 4-cell quadrant order renders correctly | render signatures page | 4 signers, clean row-major 2×2 | 2026-08-05 (TEST-002) | Tanya |

## Known defect (open — fix tracked as REQ-005)

| # | Check | Expected | Actual (last run) | Status |
|---|-------|----------|-------------------|--------|
| R8 | Item 7 "ระยะเวลาการอนุญาต" source | `T_T_LICENSE.PERIOD_TEXT` | 38272/38273 = correct PERIOD_TEXT sentence, 38240 blank, no " วัน" | **PASS — DEF-1 closed** (REQ-005 rework, TEST-003 round 2, 2026-08-05) |
| R9b | a6/db report generates at all (item-7 lookup) | 200 `application/pdf`, no ORA error | all 3 ids 200, 0 ORA-00933 (rework uses `List`+first-in-Java, no `FETCH FIRST`) | **PASS — DEF-2 closed** (TEST-003 round 2). ⚠️ regression watch: Oracle 11.2 rejects `FETCH FIRST`/12c SQL |

## Still uncovered (need DB truth / extra inputs)

| # | Check | Depends on | Status |
|---|-------|-----------|--------|
| R9 | D1 person expiry source (idCardExpiryDate vs DOC.EXPIRY_DATE) | DB truth (DATA REQUEST) | not verifiable read-only from PDF |
| R10 | D5 tick rule vs real `ATTACH_FILE_ID` | DB truth (DATA REQUEST) | visual plausible; DB confirm pending |
| R11 | D2 history path `/checklist/history/{formId}` | checklist-form ids | NOT_TESTED |

## Family checklist reports — content on real data (2026-08-21, /aN/db seams, read-only)

> ⚠️ These verify report CONTENT only. `/aN/db` calls each builder directly and does NOT exercise the
> family resolver — main routing (which form a REQUEST_TYPE maps to) is a `/download`-only check, owned by the human.

| # | Check | Endpoint | Expected | Last verified | By |
|---|-------|----------|----------|---------------|-----|
| R12 | อ.15 content | `/a15/db/18041` | 200; ข้อ5 = org name (DEF-12 fixed, not `-`); ข้อ2 = มาตรา-7 นอกหน่วยงาน const | 2026-08-21 (TEST-004) | Tanya |
| R13 | อ.14 content | `/a14/db/27300` | 200; heading = ...ส่งออกนอกราชอาณาจักร; ข้อ12 = `เอกสารขอผู้ซื้อ`; empty law-ref block = OK (data-driven) | 2026-08-21 (TEST-004) | Tanya |
| R14 | อ.9 transport | `/a9/db/38336` | 200; resolver→transport; ข้อ2 = ขนย้ายให้หน่วยงาน มาตรา 7 | 2026-08-21 (TEST-004) | Tanya |
| R15 | อ.9 destroy | `/a9/db/38362` | 200, 4p; resolver→destroy; ข้อ2 = ขนย้ายเพื่อทำลาย; matches official DESTROY form | 2026-08-21 (TEST-004) | Tanya |
| R16 | ข้อ7 PERIOD_TEXT — licence-present | `/a9/db/38362` | ข้อ7 = `180 วัน นับแต่วันที่ได้รับอนุญาต` (verbatim, not blank/date-range) — REQ-023 positive | 2026-08-21 (TEST-004) | Tanya |
| — | every family: no literal `null`, 4 signature slots, ข้อ7 = PERIOD_TEXT-or-blank | all `/aN/db` | holds | 2026-08-21 | Tanya |
