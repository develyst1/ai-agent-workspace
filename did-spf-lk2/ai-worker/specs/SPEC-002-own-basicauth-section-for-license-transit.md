# SPEC-002: Give `license-transit` its own Basic-auth section `LicenseTransit`
- Source: REQ-002
- Status: ACTIVE

## Overview

Form 9 stops borrowing the `LicenseShipment` credential and gets its own
Basic-auth section, `LicenseTransit`. Three edits in the LK2 project — a new
`appsettings.json` section, the controller attribute argument, and the now-wrong
explanatory comment REQ-001 asked for — plus one SQL statement authored **as text
only** for the stakeholder to run in their own system.

**This supersedes REQ-001 Requirement 5.** REQ-001 is not reopened; it was correct
for what was asked at the time. The comment Jason added ("never rename this key")
becomes false the moment this lands, which is exactly why REQ-002 item 5 exists.

### The one real risk, found by reading the filter — this REQ reintroduces the deployment coupling REQ-001 removed

`BasicAuthFilter` resolves the section with a **direct dictionary indexer**:

```csharp
var section = _config.BasicAuth[_sectionName];   // Filters/BasicAuthFilter.cs:24
```

That is not a `TryGetValue`. If `Configurations.BasicAuth` has no `LicenseTransit`
key, this throws `KeyNotFoundException` at request time → **HTTP 500 on every call
to `license-transit`, not 401.** Consequences that must be designed around:

1. **The attribute change and the `appsettings.json` change are one atomic unit.**
   They must ship in the same release. Deploying the new binary over a settings
   file that lacks the section takes the endpoint down completely — a much louder
   failure than the misconfiguration usually implies. REQ-001 deliberately had
   **zero** code/config coupling; REQ-002 brings it back. That is inherent to the
   requirement, not avoidable, so it has to be stated rather than engineered away.
2. **The stale published copy is now dangerous.** `_build-out-lk2/appsettings.json`
   was harmless under REQ-001 (its only hit was a key that never moved). Under
   REQ-002 it is a settings file **without** the new section — deploy code against
   it and the endpoint 500s. It is out of scope to edit, but it must be named in
   the release note.
3. A 500 here is therefore *diagnostic*: it means the section is missing, not that
   auth failed.

### Why the old credential correctly yields 401

Same file, lines 55-60: the filter compares **both** username and password with
`string.Equals(..., StringComparison.Ordinal)` against the resolved section. Every
section shares `Username = "Linkage Service"`, so the old `LicenseShipment`
credential is rejected purely because the **password** differs. That makes
REQ-002's "old credential → 401" criterion sound — **provided the new password is
genuinely different from `LicenseShipment`'s.** If the two passwords ever matched,
the old credential would silently keep working and that criterion would pass for
the wrong reason. Hence the explicit "distinct from every other section" check.

### Why `basicAuthSection` starts logging the new value

Line 61: `HttpContext.Items["BasicAuthSection"] = _sectionName`. The audit field is
sourced from the attribute argument, so changing the argument to `LicenseTransit`
is exactly what makes the log carry the new code. No logging code changes.

## API / Interface Design

No route, parameter, response or status-code change. The only externally visible
difference: `api/v1/license-transit` (and its `-sandbox` / `-health-check`
variants) now authenticate against the `LicenseTransit` credential.

| | Before (REQ-001 state) | After |
|---|---|---|
| Controller attribute | `[BasicAuth("LicenseShipment")]` | `[BasicAuth("LicenseTransit")]` |
| Credential accepted | `LicenseShipment` password | **new** `LicenseTransit` password |
| Old credential | accepted | **401** |
| `basicAuthSection` in audit log | `LicenseShipment` | `LicenseTransit` |
| `LicenseShipment` section in `appsettings.json` | in use | **retained, unused**, reserved for form 18 |

## Data Model

**Nothing in any Oracle schema.** No entity, repository, query or response field
is touched — the endpoint's data path is untouched from REQ-001.

The only data-shaped artifact is one row in **another system's** PostgreSQL
(`linkage_management.services`), delivered as text. Schema confirmed by reading
`V1__init_schema.sql`, `V10`, `V15` and `V17` in `did-045-api-linkage-management`:

| Column | Value for the new row | Why |
|---|---|---|
| `id` | `gen_random_uuid()` | UUID PK since V10 |
| `provider_id` | provider where `code = 'DID'` | same provider as every license row |
| `service_code` | `'LicenseTransit'` | must equal the `basicAuthSection` LK2 now logs |
| `name` | `'ข้อมูลหนังสืออนุญาตผ่านแดนซึ่งยุทธภัณฑ์'` | identical to the `LicenseShipment` row |
| `description` | `NULL` | V15 seeds `NULL` for all license rows |
| `seq` | `MAX(seq) + 1` for provider DID | `uq_services_provider_seq UNIQUE (provider_id, seq)` is **table-wide** — it counts soft-deleted rows, so `MAX+1` over all rows of that provider is required |
| `is_active` | `true` | copies the shipment row |
| `is_deleted` | **`true`** | **not a mistake — mandatory.** See below |
| `created_by` / `updated_by` | `'system'` | matches V15 |

**`is_deleted = true` is load-bearing, not rot.** Name resolution runs through
`ServiceRepository.findHiddenByProviderCode`:

```java
// modules/service/repository/ServiceRepository.java:25
@Query("SELECT s FROM ServiceEntity s WHERE s.provider.code = :code AND s.isDeleted = true ORDER BY s.seq")
```

`licenseNameMap()` and `LogService.buildLicenseIndex()` both read through it, so a
row inserted with `is_deleted = false` would be **invisible to the dashboard** —
the opposite of the intent. Anyone "tidying up" that flag silently breaks name
resolution. The SQL states this inline.

Secondary note: `uq_services_service_code_active` (V17) is a **partial** unique
index `WHERE is_deleted = false`, so the hidden license rows are outside it. The
`INSERT` therefore carries its own `WHERE NOT EXISTS` guard for idempotency,
mirroring V15.

## Flow

Unchanged except at step 3.

1. `UsePathBase("/servicelk2")`.
2. `RequestAuditMiddleware` validates the 4 required headers → 400 if any missing.
3. `BasicAuthFilter` resolves `Configurations.BasicAuth["LicenseTransit"]`:
   - section missing → `KeyNotFoundException` → **500** (see Overview)
   - username or password mismatch → **401** (this is where the old credential lands)
   - match → sets `HttpContext.Items["BasicAuthSection"] = "LicenseTransit"`
4. Action runs — identical logic, validation and data path to REQ-001.
5. Audit event now carries `basicAuthSection = "LicenseTransit"`;
   `endpointTemplate` stays `api/v1/license-transit`.

**Cross-system consequence, already decided by the stakeholder (REQ-002 Q2-2/Q2-3):**
until the `services` row exists, the dashboard shows the raw string
`LicenseTransit` instead of the Thai name for new records. Because the old row is
**kept**, historical records continue to resolve. Nothing crashes either way.

## Non-functional

- **Auth:** the whole point of the change. New credential required; old one rejected.
- **Password:** generated by BE per REQ-002 item 1 (stakeholder authorised:
  *"gen เองไปเลย"*). Convention from `appsettings.json`: 40-char lowercase hex.
  Must be distinct from every other section — see the 401 reasoning above.
  Committed in `appsettings.json`, which `DidSpf.WebApi.LK2/CLAUDE.md` records as
  this project's deliberate practice for BasicAuth passwords. The value goes to
  the stakeholder via Jason → Sober → Porter; it is **not** written into any
  workspace coordination file.
- **Release coupling:** code + `appsettings.json` must deploy together (Overview).
- **Consumer impact:** Linkage Center 2 breaks a **second** time — new password on
  top of REQ-001's new URL, and per REQ-001 Q7 they have not been told about the
  URL yet. Both must be communicated together. Stakeholder's action, not ours.
- **Verification limits:** no test project. `dotnet build` plus described manual
  checks. No TASK may claim "tests pass".
- **Running the app locally — mandatory form:** `dotnet run --no-launch-profile`
  with `ASPNETCORE_ENVIRONMENT=Production`. Every profile in
  `Properties/launchSettings.json` hard-sets `Development`, so a bare `dotnet run`
  loads `appsettings.Local.json` and connects to the **real** Logstash and Oracle.
  This is the standing rule I adopted after TASK-001; it is not optional.
- **Known environment limit, carried from TASK-001:** `UnitOfWorkELicensing`'s
  constructor opens the Oracle connection, so *every* endpoint on this controller
  500s locally without a DB — including `-sandbox` and `-health-check`. Auth is
  still testable because `BasicAuthFilter` runs **before** the controller is
  constructed: 401 vs "past auth" is observable, which is precisely what this REQ
  needs. TASK-002's DoD is built around that and asks for nothing BE cannot do.

## Tasks

- TASK-002: Switch `license-transit` to its own `LicenseTransit` Basic-auth section (depends on: —)

**REQ-002 item 6 is not a TASK — it is already delivered.** The stakeholder asked
*me* to write the SQL (*"ให้ sober เขียนให้เลย"*), so making it a TASK would have
handed my own assignment to Jason. It is authored as a SPEC deliverable:

**→ `specs/SPEC-002-linkage-management-services-row.sql`** — ready for Porter to
relay. It contains a read-only pre-check, the idempotent `INSERT`, a verification
`SELECT`, a commented-out undo, and the two traps documented inline
(`is_deleted = true` is mandatory; `seq` must clear a table-wide unique). It is
labelled as reviewed-but-untested, because no one here may run it, and it lists the
exact files every fact was read from. It also raises two decisions for the
stakeholder: whether it should be a Flyway `V18__` migration instead of ad-hoc SQL
(their repo uses Flyway, so hand-run SQL is absent from migration history), and
that the row should land before or with the LK2 release.

## Out of Scope

- Building the form-18 `license-shipment` endpoint.
- Renaming or re-passwording any other section.
- Any change to data, query, filters or response shape.
- **Editing `did-045-api-linkage-management` or touching its database.** The
  deliverable `specs/SPEC-002-linkage-management-services-row.sql` is text only.
  The `services` row itself and any Flyway migration there are the stakeholder's,
  per Q2-4.
  *(Corrected by Sober 2026-09-10: this said "TASK-003", which never existed —
  Q-BE-4 in TASK-002.)*
- `_build-out-lk2/appsettings.json` — not edited, but flagged in the release note
  as a settings file that now lacks a required section.
- Notifying Linkage Center 2.

## Questions

(Jason asks here; Sober answers as `> answer: ...`)
