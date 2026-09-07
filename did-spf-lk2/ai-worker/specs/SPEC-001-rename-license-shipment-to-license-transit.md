# SPEC-001: Rename the form-9 endpoint family from `license-shipment` to `license-transit`
- Source: REQ-001
- Status: ACTIVE

## Overview

Pure surface rename of one controller family in `DidSpf.WebApi.LK2`. The word
"shipment" is being freed for a future form-18 endpoint, so form 9 (ผ่านแดน,
`LICENSE_FORM_ID = 9`) takes the word **transit**.

Approach: rename the public route, the C# type names and the two files that hold
them, plus the Swagger tag **constant name** and every LK2 doc/comment that
describes this endpoint. **Nothing else moves** — no query, no filter, no
response field, no auth.

Two deliberate non-moves that are the heart of this SPEC:

1. **`[BasicAuth("LicenseShipment")]` and the `appsettings*.json` key stay
   exactly as they are** (REQ-001 item 5). That string is not a name — it is a
   cross-system identifier: Linkage Management stores it as `service_code` and
   `LogService.java` resolves the Thai license name from it off the
   `basicAuthSection` field of every audit event. Renaming it would break name
   resolution on that dashboard until a foreign database is updated.
   Because a rename looks obviously "missed" to the next reader, the TASK adds a
   short C# comment on the attribute stating why it must not be changed. That
   comment is the only line added to the codebase that is not a rename.
2. **The Swagger tag's *value* stays** — `SwaggerTags.LICENSE_SHIPMENT` holds the
   Thai text `"ข้อมูลหนังสืออนุญาตผ่านแดนซึ่งยุทธภัณฑ์"`, which contains no
   English word at all. Only the **constant's identifier** carries "SHIPMENT", so
   only the identifier is renamed to `LICENSE_TRANSIT`. The tag a human sees in
   Swagger UI is unchanged, which is correct: the Thai form name did not change.

Why one TASK and not several: the acceptance test is a single case-insensitive
search for "shipment" across the LK2 project. Splitting code from docs would
leave the repo failing that check between tasks, for no benefit — the whole
change is mechanical and fits one session.

## API / Interface Design

| Before | After |
|---|---|
| `GET /servicelk2/api/v1/license-shipment` | `GET /servicelk2/api/v1/license-transit` |
| `GET /servicelk2/api/v1/license-shipment-health-check` | `GET /servicelk2/api/v1/license-transit-health-check` |
| `GET /servicelk2/api/v1/license-shipment-sandbox` | `GET /servicelk2/api/v1/license-transit-sandbox` |

Unchanged for all three: HTTP verb, `[Route("api/v1")]`, the `/servicelk2`
path base, query parameters (`traderName`, `personalId`), the
"at least one of traderName/personalId" rule on the main and sandbox actions,
the `ResponseResult<List<T>>` envelope, every response field name and its
`[SwaggerSchema]` description, and the Basic-auth credentials.

The old routes are **deleted outright** — no alias, no `[HttpGet]` kept
alongside, no deprecation attribute (REQ-001 item 4, stakeholder's "ตัดทิ้งเลย").
A call to `api/v1/license-shipment` must return 404 after this change.

### Rename map (authoritative — SA's own sweep of the LK2 project, 2026-09-07)

Exactly **8 files** in `DidSpf.WebApi.LK2` contain the string "shipment"
(case-insensitive, excluding `bin/` and `obj/`). All 8 are listed here.

**Renamed — code:**

| File | Symbol / literal | Before | After |
|---|---|---|---|
| `Controllers/LicenseShipmentController.cs` → **`Controllers/LicenseTransitController.cs`** | class | `LicenseShipmentController` | `LicenseTransitController` |
| ″ | route literal ×3 | `license-shipment`, `license-shipment-health-check`, `license-shipment-sandbox` | `license-transit`, `license-transit-health-check`, `license-transit-sandbox` |
| ″ | const | `FORM_ID_SHIPMENT` | `FORM_ID_TRANSIT` (value stays `9`) |
| ″ | ctor | `LicenseShipmentController(...)` | `LicenseTransitController(...)` |
| ″ | tag ref ×3 | `SwaggerTags.LICENSE_SHIPMENT` | `SwaggerTags.LICENSE_TRANSIT` |
| ″ | type refs (`ProducesResponseType` ×3, locals, `GetDataReal`, `GetDataDummy`, 3 dummy rows) | `LicenseShipmentResponse` | `LicenseTransitResponse` |
| `Models/LicenseShipmentModel.cs` → **`Models/LicenseTransitModel.cs`** | class | `LicenseShipmentResponse` | `LicenseTransitResponse` |
| `Utils/TextConstant.cs` | constant **name** only | `SwaggerTags.LICENSE_SHIPMENT` | `SwaggerTags.LICENSE_TRANSIT` — **value unchanged** |

**Renamed — comments and docs (all inside the LK2 project):**

| File | What |
|---|---|
| `Utils/ELicenseFlatLicenseHelper.cs` line ~7 | XML comment `"...yp2/3/4/5, export, shipment"` → `"...export, transit"` |
| `Utils/LicenseSearchParamHelper.cs` line ~20 | `<summary>` `"ELicensing (yp/export/shipment)..."` → `"(yp/export/transit)"` |
| `CLAUDE.md` line ~68 | response-model table row: `LicenseShipmentResponse` / `LicenseShipmentModel.cs` / `license-shipment` → the transit names |
| `DATA-MAPPING.md` lines ~42, 56, 100, 153, 208, 216 | every mention of `license-shipment` / "shipment" describing form 9 → transit. Keep the Thai `(ผ่านแดน)` wording and every fact (form id, DB, `STATUS` note) exactly as-is |

**Deliberately NOT renamed:**

| File | What | Why |
|---|---|---|
| `Controllers/LicenseTransitController.cs` | `[BasicAuth("LicenseShipment")]` | REQ-001 item 5 — cross-system `service_code`. **Add an explanatory comment above it.** |
| `appsettings.json` line ~81 | `"LicenseShipment": { Username, Password }` | same key must resolve at request time |
| `appsettings.Development.json`, `appsettings.Local.json`, `appsettings.Local.json.example` | — | verified: none of them contain "shipment"; **no edit needed** |

## Data Model

None. No table, column, entity, repository, DTO field or migration is touched.
`FORM_ID_TRANSIT = 9` and `ELicenseFlatLicenseHelper.GetActiveFlatAsync` are
called with identical arguments, so the generated SQL is byte-identical.
`LicenseTransitResponse` keeps all seven properties and all seven
`[SwaggerSchema]` values, so the JSON on the wire is unchanged.

## Flow

Unchanged end to end. For the record, so the reviewer can confirm nothing shifted:

1. `UsePathBase("/servicelk2")`.
2. `RequestAuditMiddleware` validates the 4 required headers (`Authorization`,
   `X-Office-Request`, `X-User-Request`, `User-Agent`) → 400 if any missing.
3. `BasicAuthFilter` decodes the credential and matches it against
   `Configurations.BasicAuth["LicenseShipment"]` — **the same section as before**,
   because the attribute argument did not change — then sets
   `HttpContext.Items["BasicAuthSection"] = "LicenseShipment"`.
4. Action runs:
   - `license-transit` → requires `traderName` or `personalId`, else
     `BadRequestWithTrace(ErrorMessage.REQUIRE_AT_LEAST_ONE_FIELD)`; otherwise
     real data via `GetActiveFlatAsync(_uow, new[]{ FORM_ID_TRANSIT }, ...)`.
   - `license-transit-sandbox` → same validation, 3 dummy rows.
   - `license-transit-health-check` → empty list, no params, no validation.
5. Response: `ResponseResult<List<LicenseTransitResponse>>.SuccessResult(...)`,
   Newtonsoft camelCase.
6. Audit event is emitted to Logstash. Two fields differ from before, both
   expected:
   - `endpointTemplate` — now `api/v1/license-transit` (**changes**; any Kibana
     query filtering on the literal old path stops matching new records. Old
     records keep the old value. Not a defect.)
   - `basicAuthSection` — still `"LicenseShipment"` (**must not change**; this is
     what keeps Linkage Management's dashboard resolving the Thai license name).

**Error cases:** unchanged in every respect. Missing headers → 400 from the
middleware; both search params empty → 400 `REQUIRE_AT_LEAST_ONE_FIELD`; bad
credential → 401 from `BasicAuthFilter`; unknown `typeApi` → 400
`ErrorMessage.NotTypeAPI` (unreachable, kept as-is).

**New error case, by design:** `GET api/v1/license-shipment*` → **404**. That is
the intended hard cut, not a regression.

## Non-functional

- **Auth:** unchanged. Same username (`Linkage Service`) and same password
  resolve against the same config section. The caller sends no section key, so
  the external consumer's credentials keep working untouched.
- **Behaviour:** this endpoint returns **0 rows against real data today**, because
  form-9 rows are `STATUS=30` in the DB while the query filters `STATUS=40`
  (recorded in `DATA-MAPPING.md`). That is pre-existing and out of scope — an
  empty `data: []` from `license-transit` is the correct, expected result and
  must **not** be treated as a rename defect. Use `-sandbox` to prove the shape.
- **Validation, performance, logging:** no change beyond the `endpointTemplate`
  value noted above.
- **Verification limits:** this solution has **no test project**
  (`DidSpf.WebApi.LK2/CLAUDE.md`: "No test project exists in this solution").
  The only automated gate available is `dotnet build`. Everything else is a
  described manual check. No TASK under this SPEC may claim "tests pass".
- **Build gotcha to watch:** a stale `bin/`/`obj/` or the published copy at
  `_build-out-lk2/` can serve the old routes and make a correct change look
  broken (or a broken one look fine). Verify against a freshly built run of the
  project, not a pre-existing published output.

## Tasks

- TASK-001: Rename the form-9 endpoint family to `license-transit` (depends on: —)

## Out of Scope

Carried from REQ-001, plus SA's sweep decisions:

- Any behavioural change: query, `STATUS` filter, response shape, field names.
- Any other endpoint (import / export / move / sale / yp2-5).
- Building the future form-18 `license-shipment` endpoint.
- The Basic-auth section key, its credentials, and the
  `did-045-api-linkage-management` repo and database.
- **`_build-out-lk2/appsettings.json`** — SA checked it: its only "shipment" hit
  is the Basic-auth key, which does not change. So, unlike what the REQ's
  "Known related surface" anticipated, **there is nothing to update there and no
  code/config release coupling at all.**
- **Solution-level notes** `task.md`, `lk2-real-data-plan.md`,
  `understanding-cdss.md` — REQ-001 Q4, still open with Porter, non-blocking.
  Excluded from TASK-001 by default. If Porter answers "update them", it becomes
  a separate small TASK; it does not change TASK-001.
- **`DidSpf.Oracle.DataAccess.ELicensing/Repositories/TTLicenseRepository.cs`
  line ~39** — a Thai comment mentioning "shipment (9)". It is outside the LK2
  project, so REQ-001's acceptance search does not reach it. See Question SA-1.

## Questions

- **SA-1 (Sober → Porter, non-blocking).** One "shipment" mention describing this
  endpoint lives outside the LK2 project: a comment in
  `DidSpf.Oracle.DataAccess.ELicensing/Repositories/TTLicenseRepository.cs:39`
  ("export (8/19/20) และ shipment (9) ใน DB เป็น STATUS=30"). It is a comment
  only — zero behavioural risk — but changing it means TASK-001 touches a second
  project in the solution. REQ-001's acceptance criterion scopes the search to
  the LK2 project, so I have **excluded it** and Jason will leave it alone.
  My recommendation: fold it in, since it is one word in one comment and leaving
  it means the solution still says "shipment" about form 9. Please confirm either
  way — this does not block TASK-001; a "yes" is a one-line follow-up.
  (Note this is *not* Q4: Q4 is about the three solution-level `.md` notes, and
  this comment is not one of them.)
