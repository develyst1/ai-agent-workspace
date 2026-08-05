# SPEC-003: Let QA generate อ.6 from plain requestIds (no manual encryption)

- Source: REQ-003
- Status: ACTIVE

## Overview
Remove the invocation blocker for REQ-001 so QA can produce the อ.6 PDF for each
of the 34 **plain** requestIds without anyone hand-encrypting them.

**Chosen approach: (b) reuse the existing dev-only seam — ZERO code change.**
`PreviewController` already exposes
`GET /api/v1/preview/checklist/a6/db/{requestId}` which takes a **raw plain
`Long` requestId**, requires **no auth**, and builds via
`A6CheckListReportBuilder.createDataRaw(id)` → the *same* `buildFromDb(id)` the
real download endpoint runs. So its PDF body is identical to the production
output for that id — exactly what REQ-001 needs to verify — but with no
encryption and no key.

Why not (a) encrypt-helper: more moving parts and a throwaway helper, for no
extra coverage of what REQ-001 verifies (the report body). The seam already
exists and is browser-openable (good for the new Playwright directive).

**Security constraint (PM) is satisfied:** this does NOT touch the real
`/api/v1/download/**` endpoint or its auth. The seam lives on the separate,
already-`permitAll` preview chain. Production download security is unchanged.

## Auth facts (from code — SecurityConfig + ApiKeyFilter)
- **Real** `/api/v1/download/**`: **auth IS required** — either a valid
  `X-API-KEY` (Order-1 `downloadSecurity` chain + `ApiKeyFilter`) **or** a bearer
  token (no-key requests fall through to the Order-2 chain's `authenticated()`).
  The stakeholder's memory of "worked without a key" was almost certainly the
  preview path or a bearer session — the download endpoint itself is not open.
- **Preview** `/api/v1/preview/**`: `permitAll` (SecurityConfig Order-2 list) →
  **no X-API-KEY, no bearer**. `ApiKeyFilter` only guards `/api/v1/download`.
- ⇒ **REQ-003 Q3 answer: the a6-from-plain-id path needs NO X-API-KEY.** (The real
  encrypted download endpoint would need a key or token — not used here.)

## QA invocation recipe (for Porter to relay to Tanya)
Target: `http://localhost:33000/document-service` (human confirms it is wired to
the **UAT** DB). Read-only GET; safe to open in a browser / drive with Playwright.

```
GET /document-service/api/v1/preview/checklist/a6/db/{requestId}?disposition=inline
```
- `{requestId}` = each plain integer from
  `project-docs/REQ-001-a6-sample-request-ids.md` (34 ids). No encryption.
- No `X-API-KEY` / no `Authorization` header.
- Expect: `200 application/pdf`, filename `a6-{requestId}.pdf`, the อ.6 layout
  populated from real UAT data for that id.
- Compare each against the REQ-002 baseline
  `GET /api/v1/preview/checklist/a6` (mock, full layout) — same sections/fields,
  now filled with real values — and record correctness per REQ-001 AC#2/#3
  (incl. the D1–D5 leads and the D3 item-7 "PERIOD_TEXT" check).

## Caveat QA must know (resolver is bypassed)
The `/db/{id}` seam calls the a6 builder **directly** — it does **not** run
`RequestTypeResolverService` (the `T_T_REQUEST_SPECIAL.FORM_ID` 6/7 check). It
will force-build an อ.6 for **any** id. So it does **not** by itself prove an id
"is อ.6"; a non-อ.6 id yields a wrong/garbage อ.6 or an error. To confirm
resolution, either (i) also hit the real endpoint for a spot sample once an
encrypted id/token is available, or (ii) treat a clean, well-formed อ.6 render as
sufficient for REQ-001's purpose and note any id that errors/looks wrong.

## Acceptance Criteria mapping
- AC#1 (plain-id PDF on localhost/UAT, no human encryption): met by the seam. ✅
- AC#2 (documented for Tanya + X-API-KEY stated): this SPEC + recipe above;
  key = not needed. ✅
- AC#3 (no secret in tracked files): approach prints no crypto/API key. ✅

## Recommended security follow-up (OUT of REQ-003 scope — flag to Porter)
`/api/v1/preview/**` is unauthenticated and `/preview/checklist/a6/db/{id}` now
reads **real UAT data** by raw id with no auth. The `PreviewController` +
`SecurityConfig` both self-mark this preview as TEMPORARY ("delete when the
builder connects to the real DB" — which has already happened for a6). Before any
production/permanent deploy, the preview controller and the `/api/v1/preview/**`
`permitAll` should be **removed or dev-profile-gated**. Recommend Porter raise a
follow-up REQ (not part of unblocking QA now).

## Tasks
- None (no code change). Deliverable is this enabling analysis + QA recipe; Porter
  relays to Tanya, who then runs REQ-001 AC#2/#3 against the seam.

## Questions
(Jason/QA follow-ups; Sober answers as `> answer: ...`)
