# REQ-001: Free the term "shipment" in the LK2 API — rename form 9 to "transit"
- Status: DELIVERED (2026-09-10 — all 8 acceptance criteria observed)
- Priority: HIGH
- Requested: 2026-09-07 by stakeholder (human)
- Deadline: none

> Renamed from `REQ-001-rename-license-shipment-to-license-shipping.md` on
> 2026-09-07 when the stakeholder changed the replacement word from "shipping" to
> "transit". Same REQ, same number — only the chosen word changed.

## Problem / Goal

`DidSpf.WebApi.LK2` exposes one outward endpoint family named **`license-shipment`**
(controller `LicenseShipmentController`, `LICENSE_FORM_ID = 9`, the Thai form
"หนังสืออนุญาตส่งผ่านแดน" / ผ่านแดน — `FOR_CROSS_BORDER` in `T_R_LICENSE_FORM`).

The stakeholder is **reserving the word "shipment" for a different, future
endpoint** — form 18, "หนังสือแจ้งรายละเอียดการส่งออกแต่ละครั้ง", the per-consignment
export declaration sent to Customs, which is what "shipment" actually describes
(see Q1). Form 9 is holding a name that belongs to something else.

So form 9 is renamed to **"transit"** (`license-transit`), which is the trade term
for ผ่านแดน. This leaves `license-shipment` free for form 18 later, and the two
names stay far enough apart that a caller cannot confuse them.

Stakeholder's own words: *"อยากยกเลิก controller license shipment ไปใช้คำอื่นแทน
เพราะคำนี้มีใช้อยู่แล้ว"* and *"มันยังไม่ชนแบบที่เป็นของที่มีอยู่แล้ว แต่มันชนในความหมาย
ของสิ่งที่จะเกิดขึ้นมาในอนาคต"*.

## Requirement

1. The API must no longer expose the term **"shipment"** for form 9 in anything a
   person reads or calls: the URL, the class/model names, the Swagger tag, and the
   project documentation. **The Basic-auth section key is deliberately excluded —
   see item 5.**
2. The replacement term must be **"transit"**, i.e. the public route becomes
   `api/v1/license-transit` (with the matching `-health-check` and `-sandbox`
   variants), and the internal names follow the same word.
3. The rename must be **surface-only**: behaviour, data source, filters and
   response shape stay exactly as they are today. This is a naming change, not a
   functional change.
4. The old `license-shipment` routes must be **removed outright** — no alias, no
   deprecation window. The stakeholder chose a hard cut ("ตัดทิ้งเลย").
5. **The Basic-auth section key must stay exactly `LicenseShipment`** — in
   `[BasicAuth("LicenseShipment")]` on the controller and in every
   `appsettings*.json`. It is not a name, it is the identifier that Linkage
   Management stores as `service_code` and that the audit log carries as
   `basicAuthSection`. Leaving it untouched is what keeps the other system, the
   logs and the dashboard working with no coordinated release.
   *(This supersedes the stakeholder's earlier "ทุกที่ รวม BasicAuth key"; the
   stakeholder chose option (b) on 2026-09-07 once the linkage was found.)*
6. Project documentation that describes this endpoint must be updated so it does
   not contradict the shipped API.

## Acceptance Criteria

- [ ] `GET api/v1/license-transit` returns the same data, in the same shape, that
      `api/v1/license-shipment` returned before the change.
- [ ] The `-health-check` and `-sandbox` variants exist under the new name and
      behave as before.
- [ ] The old `license-shipment` routes no longer exist (a call to them fails).
- [ ] The Basic-auth section key is **still** `LicenseShipment`, unchanged, in the
      controller attribute and in every `appsettings*.json`; the existing
      username/password still authenticate successfully against the new route.
- [ ] The audit log for a call to the new route still shows
      `basicAuthSection = "LicenseShipment"` (so Linkage Management can still
      resolve it to its registered service).
- [ ] A case-insensitive search for "shipment" over the LK2 project finds no
      remaining occurrence describing this endpoint **except** the deliberate
      Basic-auth key (controller attribute + `appsettings*.json`).
- [ ] No other endpoint in LK2 changed behaviour.
- [ ] Nothing in the `did-045-api-linkage-management` repository or its database
      needs to change for this REQ.

## PM acceptance check (Porter, 2026-09-07)

Checks I ran myself against the working tree, rather than accepting the team's
file list:

- **Evidenced (6 of 8).** Case-insensitive "shipment" search over LK2 returns
  exactly 3 hits, all deliberate: `appsettings.json:81` (the auth key),
  `Controllers/LicenseTransitController.cs:16` (the same key on the attribute) and
  `:13` (the comment explaining why it stays). The three routes
  `license-transit`, `-health-check`, `-sandbox` exist; no `license-shipment`
  route remains; the files are now `LicenseTransitController.cs` /
  `LicenseTransitModel.cs`. The auth key is unchanged in both places. Nothing in
  `did-045-api-linkage-management` was touched.
- **Now observed (7th criterion, closed 2026-09-07)** — the audit-log criterion.
  Stakeholder supplied a Kibana record, archived at
  `../project-docs/2026-09-07-SA-2-kibana-audit-record.md`: a real 200 on
  `api/v1/license-transit` carrying `endpointTemplate = api/v1/license-transit`
  **and** `basicAuthSection = LicenseShipment`. Exactly the split this REQ asked
  for. **Observed, not inferred.**
- **8th criterion — CLOSED 2026-09-10. "Returns the same data, in the same shape"
  is now OBSERVED.** Stakeholder supplied a live response body, archived at
  `../project-docs/2026-09-10-SA-2-response-body-and-services-row.md`.
  PM checked it field by field against `Models/LicenseTransitModel.cs`: the model
  declares exactly `CitizenId, IssueDate, ExpireDate, JuristicId, LicenseNo,
  ProductName, TraderName`, and the response carries exactly those seven,
  camelCase, same order, nothing added or missing, inside the standard
  `ResponseResult<T>` envelope (`responseCode "000"`). Dates still `yyyyMMdd`.
  Two real rows, not an empty list — SA-2's "expect empty" prediction was based on
  form-9 rows sitting at `STATUS=30`; they have since reached `STATUS=40`, so the
  evidence is stronger than anticipated, not contradictory.

**Verdict: all 8 acceptance criteria observed. REQ-001 is `DELIVERED` (2026-09-10).**

## Constraints

- **Naming history, for the record.** The stakeholder first asked for a word
  containing "ship" and chose **"shipping"**. PM flagged that "shipping" means the
  act of sending goods rather than transit, and the stakeholder confirmed
  "shipping" at that point. Later, once Q1 revealed that the reserved word
  "shipment" belongs to form 18 and both endpoints will live in the **same API**,
  PM raised that `license-shipping` and `license-shipment` would sit side by side
  differing by three letters while meaning unrelated things. On that new
  information the stakeholder switched to **"transit"**. This is the final word.
- This is an outward, read-only API consumed by an external party (Linkage
  Center 2). **Removing the old route is a breaking change for that consumer** —
  the stakeholder has accepted this. The consumer must be told the new URL.
- **The Basic-auth section key is NOT an internal name — it is a cross-system
  identifier.** Stakeholder supplied a `services` table dump from the Linkage
  Management system on 2026-09-07 (in chat; see the stakeholder for the file).
  Under provider `288f6f06-388e-429f-af22-9e2f631eb438` the registered
  `service_code` values are **character-for-character the LK2 BasicAuth section
  keys**: `LicenseShipment`, `LicenseExport`, `LicenseYp2/3/4/5`, `LicenseImport`,
  `LicenseMove`, `LicenseSaleDomestic`, `LicenseSaleInternational`. The row for
  this endpoint is `service_code = "LicenseShipment"`,
  `name = "ข้อมูลหนังสืออนุญาตผ่านแดนซึ่งยุทธภัณฑ์"`, id
  `acea81e1-4dec-4342-a3da-cb10843f6153`.
  So renaming the key would be a **change to a value another system stores**, not
  a local refactor. **Decision (stakeholder, 2026-09-07): do not rename it.**
- **Verified in the Linkage Management source** (`did-045-api-linkage-management`,
  read-only inspection by PM on 2026-09-07): the value is not hardcoded in
  application code — it appears only in the Flyway seed migration
  `backend/src/main/resources/db/migration/V15__seed_license_services_did.sql`,
  whose own header states the license services are seeded "จาก C#
  DidSpf.WebApi.LK2 basicAuthSection" with `service_code` = the license code.
  `LogService.java` reads the `basicAuthSection` field off each incoming log event
  and looks it up against those `services` rows to resolve the Thai license name
  shown on the dashboard. **This is the concrete reason item 5 keeps the key:**
  rename it and the dashboard stops resolving the Thai name for new log lines
  until that database is updated too.
- The `is_deleted = true` on those rows is intentional, not rot — the same
  migration hides the อท. provider and its license services from the agency list
  while still using them to resolve names.
- **Correction to two earlier PM statements** (both made before the `services`
  dump existed): (1) I first said renaming the key breaks the caller's
  credentials — it does not; every section shares `Username = "Linkage Service"`
  and differs only by `Password`, and the caller never sends the key. (2) I then
  said the key is therefore internal-only — also wrong. The credentials stay
  valid; the *identifier* is shared with another system.
- **Deployment risk is now small, but not zero:** because the auth key does not
  move, there is no code/config mismatch to coordinate. What remains is the
  ordinary one — the external caller must switch to the new URL, since the old
  route is deleted.

## Known related surface (PM sweep of the whole `did-spf` solution, 2026-09-07)

Context only — SA owns the authoritative sweep and decides what is in the change.

- **Inside `DidSpf.WebApi.LK2`:** `Controllers/LicenseShipmentController.cs`
  (23 hits), `Models/LicenseShipmentModel.cs`, `Utils/TextConstant.cs`
  (`SwaggerTags.LICENSE_SHIPMENT`), `Utils/LicenseSearchParamHelper.cs` and
  `Utils/ELicenseFlatLicenseHelper.cs` (comments), `appsettings.json`, `CLAUDE.md`,
  `DATA-MAPPING.md`.
- **Outside the LK2 project:** `_build-out-lk2/appsettings.json` (published
  output), `DidSpf.Oracle.DataAccess.ELicensing/Repositories/TTLicenseRepository.cs`
  (comment), and solution-level notes `task.md`, `lk2-real-data-plan.md`,
  `understanding-cdss.md`.
- **Original ticket:** `task.md` records this endpoint as **DID045-381**
  ("หนังสืออนุญาตผ่านแดนซึ่งยุทธภัณฑ์", `license-shipment`, BasicAuth `LicenseShipment`).
- **Observability impact (limited):** the audit event logs both `endpointTemplate`
  and `basicAuthSection`. `basicAuthSection` does **not** change, so service
  resolution keeps working; `endpointTemplate` does, so anything that filters logs
  by the literal path `api/v1/license-shipment` will stop matching new records.
  Old records keep the old path — expected, not a defect.
- **"transit" already matches the consumer-side vocabulary:**
  `lk2-real-data-plan.md` maps the consumer concept for form 9 as
  `TransitLicenses`. The new name lines up with it, which the previous candidate
  ("shipping") did not.
- **Current data reality (unchanged by this REQ):** form 9 rows are `STATUS=30`
  in the DB while the endpoint filters `STATUS=40`, so this endpoint returns 0
  rows today. The rename neither causes nor fixes that.

## Out of Scope

- Any change to what the endpoint returns, how it queries, or its status filter.
- Renaming any other endpoint (export / imports / move / sale / yp2-5).
- **Building the future form-18 `license-shipment` endpoint.** This REQ only frees
  the word; it does not create anything for form 18.
- Notifying or coordinating with the external consumer — that is the
  stakeholder's own action, outside this team's work.
- **The `did-045-api-linkage-management` repository and its database.** Nothing
  there changes: `service_code` stays `LicenseShipment`, the V15 seed migration is
  not touched, and no data edit is required.
- The Basic-auth section key and the credentials behind it.

## Questions

- **Q1 — ANSWERED 2026-09-07.** The clash is **not with something that exists
  today — it is with something planned.** Stakeholder pointed at
  `T_R_LICENSE_FORM.LICENSE_ID = 18`, **"หนังสือแจ้งรายละเอียดการส่งออกแต่ละครั้ง"**
  (`IS_SEND_TO_CUSTOMS = 1`, `FOR_TRUNCATE = 1`, report `rptDocDescExToCustoms`).
  That form is a per-consignment export declaration — genuinely "a shipment" — so
  the word is being reserved for it. Form 9 (ผ่านแดน) has to give the word up.
  (Related forms in the same family, for future reference: 26 = the same document
  as a form, 28 = the import equivalent.)
- **Q2 — CLOSED 2026-09-07.** Basic-auth credentials: not touched at all, since
  the section key stays. No rotation as part of this REQ.
- **Q3 — CLOSED 2026-09-07.** No longer relevant: the auth key does not move, so
  there is no code/config rename to synchronise at deploy time.
- **Q5 — ANSWERED 2026-09-07: option (b).** Stakeholder: *"เอา ข"*. The BasicAuth
  section key stays `LicenseShipment`; only the URL, class/model names, Swagger
  tag and docs change. Folded into Requirement 5 and Out of Scope.
- **Q6 — ANSWERED 2026-09-07.** Replacement word changed from "shipping" to
  **"transit"** after PM raised that `license-shipping` and the future
  `license-shipment` would coexist in the same API.
- **SA-2 — DATA REQUEST (Sober → Porter, open, added 2026-09-07 by SA).**
  TASK-001 is `DONE` and the code is fully verified statically plus partly at
  runtime — but **two of this REQ's acceptance criteria have not been *observed***,
  and I will not report them as met on inference.

  Why they could not be checked here: `UnitOfWorkELicensing`'s constructor opens
  the Oracle connection, so the controller cannot even be constructed without a
  reachable database — that 500s *every* endpoint on it, including
  `-health-check` and `-sandbox`, which read no data. BE must not touch a real
  DB, and neither may I. So this needs the human, on an environment that already
  has Oracle and Logstash.

  **What I need the human to do** — run these five calls against a deployed LK2
  build that includes this change, and paste the status code + response body of
  each into `../project-docs/`:

  1. `GET /servicelk2/api/v1/license-transit-health-check` → expect **200**, `data: []`
  2. `GET /servicelk2/api/v1/license-transit-sandbox?traderName=บริษัท` → expect
     **200** with **3 dummy rows** (fields `citizenId, issueDate, expireDate,
     juristicId, licenseNo, productName, traderName`)
  3. `GET /servicelk2/api/v1/license-transit-sandbox` (no query params) → expect
     **400** `REQUIRE_AT_LEAST_ONE_FIELD`
  4. `GET /servicelk2/api/v1/license-transit?traderName=บริษัท` → expect **200**
     with **empty `data: []`** — empty is CORRECT here (form-9 rows are
     `STATUS=30`, the query filters `STATUS=40`); an empty list is not a defect
  5. `GET /servicelk2/api/v1/license-shipment` → expect **404**

  All five need the four required headers (`Authorization: Basic …`,
  `X-Office-Request`, `X-User-Request` = 13 digits, `User-Agent`) or the
  middleware returns 400 before the controller runs. **Existing credentials —
  nothing was rotated.**

  **And from Kibana**, one audit record for call 1 or 2, showing both fields:
  `endpointTemplate` (expect `api/v1/license-transit` — changed) and
  `basicAuthSection` (expect **`LicenseShipment`** — deliberately unchanged; this
  is what keeps Linkage Management resolving the Thai license name).

  Until this comes back, the honest status of two acceptance criteria — "returns
  the same data in the same shape" and "the audit log still shows
  `basicAuthSection = LicenseShipment`" — is **code-verified, not observed.**
  Everything else in the acceptance list **is** evidenced. Please don't report
  those two to the stakeholder as confirmed until the output exists.

- **SA-1 (Sober → Porter, open, NON-BLOCKING — added 2026-09-07 by SA):** My own
  sweep found one "shipment" mention describing this endpoint that sits **outside**
  the LK2 project and is **not** one of Q4's three notes: a Thai comment in
  `DidSpf.Oracle.DataAccess.ELicensing/Repositories/TTLicenseRepository.cs:39`
  ("export (8/19/20) และ shipment (9) ใน DB เป็น STATUS=30"). Comment only, zero
  behavioural risk, but including it makes the change touch a second project in
  the solution. This REQ's acceptance criterion scopes the search to the LK2
  project, so I **excluded it** from TASK-001. SA's recommendation: fold it in —
  one word in one comment, and otherwise the solution still says "shipment" about
  form 9. Please confirm either way; a "yes" is a one-line follow-up TASK and does
  not delay TASK-001.
  > answer (Porter, 2026-09-07): **No — leave it. Do nothing.**
  > I first answered "yes, fold it in"; the stakeholder overrode that within the
  > hour and their answer wins. Their reasoning: *"ของ shipment ที่เหลือไม่ต้องทำ
  > อะไรมันหรอก เพราะในอนาคตอาจจะมาทำ หนังสือแจ้งรายละเอียดการส่งออกแต่ละครั้ง"* —
  > the word is coming back to this solution for form 18, so scrubbing the last
  > mentions now is churn.
  > **No follow-up TASK. Nothing to do in the ELicensing DAL.**
  > PM note for whoever builds form 18 later: that comment currently reads
  > "shipment (9)". Once "shipment" means form 18, it will point at the wrong
  > form — fix it *then*, as part of that work, not now.
- **Q4 — ANSWERED by the stakeholder, 2026-09-07: leave all three alone.**
  `task.md`, `lk2-real-data-plan.md` and `understanding-cdss.md` are **not** touched
  by this REQ. (PM had proposed updating the `task.md` DID045-381 row; the
  stakeholder's answer covers the remaining "shipment" mentions as a whole —
  leave them, the word is returning for form 18.) **Nothing to do.**
- **Q7 — ANSWERED by the stakeholder, 2026-09-07.** The external consumer
  (Linkage Center 2) has **not** been told yet; the stakeholder is handling it
  personally *("ยังไม่ได้แจ้ง เดี๋ยวจัดการ")*. Outside this team's work — but note
  the old route is already deleted in code, so the consumer breaks the moment this
  build is deployed. Sequencing that is the stakeholder's call.
