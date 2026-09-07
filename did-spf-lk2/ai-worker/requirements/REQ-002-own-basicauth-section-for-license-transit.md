# REQ-002: Give `license-transit` its own Basic-auth section, separate from `LicenseShipment`
- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-09-07 by stakeholder (human)
- Deadline: none

## Problem / Goal

REQ-001 renamed the form-9 endpoint family to `license-transit` but deliberately
**kept** its Basic-auth section key as `LicenseShipment`, because that key doubles
as `service_code` in Linkage Management and as `basicAuthSection` in the audit log.

The stakeholder now wants form 9 to have **its own Basic-auth section, a different
one from shipment's** — stakeholder's words: *"เห้ย เพิ่มในappsettingด้วย basic auth
คนละอันกับ shipment"*.

This is consistent with the plan behind REQ-001: the name **and** the credential
`LicenseShipment` are being reserved for the future form-18 endpoint
("หนังสือแจ้งรายละเอียดการส่งออกแต่ละครั้ง"). Form 9 should not be borrowing them.

**This supersedes REQ-001 Requirement 5.** REQ-001 itself is not reopened — its
work is done and correct for what was asked at the time.

## Requirement

1. A **new** Basic-auth section named **`LicenseTransit`** must be added to
   `Configurations.BasicAuth` in `appsettings.json`, with
   `Username = "Linkage Service"` (same as every other section) and its **own new
   password** — not a rename or reuse of `LicenseShipment`, and not a copy of any
   other section's password.
   **The stakeholder has authorised the team to generate the password value**
   (2026-09-07: *"gen เองไปเลย"*). Match the existing convention in this file: a
   40-character lowercase hex string, distinct from every other section. Committing
   it in `appsettings.json` follows this project's existing practice, which
   `DidSpf.WebApi.LK2/CLAUDE.md` records as deliberate for BasicAuth section
   passwords. The generated value must be reported back to the stakeholder, since
   they have to give it to Linkage Center 2.
2. The transit controller must authenticate against `LicenseTransit` instead of
   `LicenseShipment` — i.e. `[BasicAuth("LicenseTransit")]`.
3. The existing `LicenseShipment` section must **stay in `appsettings.json`**,
   unused for now, reserved for the future form-18 endpoint.
4. Nothing else about the endpoint changes: same routes, same data, same response
   shape, same behaviour as delivered by REQ-001.
5. The stale explanatory comment above the auth attribute (added by REQ-001,
   telling the reader *not* to change this key) must be corrected — it will be
   wrong the moment this REQ lands.
6. **Deliver the SQL statement for the Linkage Management `services` row** — as
   text, for the stakeholder to run themselves. Requested by the stakeholder on
   2026-09-07 (*"ให้ sober เขียนให้เลย"*). It is an `INSERT` modelled on the existing
   `LicenseShipment` row (id `acea81e1-4dec-4342-a3da-cb10843f6153`, provider
   `288f6f06-388e-429f-af22-9e2f631eb438`): same provider, same Thai
   `name`/`description` ("ข้อมูลหนังสืออนุญาตผ่านแดนซึ่งยุทธภัณฑ์"), same
   `is_active`/`is_deleted` flags, with `service_code = 'LicenseTransit'` and a
   fresh `id` and `seq`.
   Two things the author must respect, both visible in
   `db/migration/V15__seed_license_services_did.sql`: the unique constraint
   `uq_services_provider_seq` (so `seq` must not collide within that provider), and
   that `is_deleted = true` on those rows is **intentional** — the license services
   are hidden from the agency list but still used for name resolution. Copying the
   shipment row's flags verbatim is therefore correct.
   **Nobody on this team runs it.** The output is a statement in the TASK/SPEC for
   the stakeholder to execute.

## Acceptance Criteria

- [ ] `appsettings.json` contains both sections: the new transit one **and**
      `LicenseShipment`, untouched.
- [ ] A call to `api/v1/license-transit` with the **new** credential succeeds.
- [ ] A call to `api/v1/license-transit` with the **old** `LicenseShipment`
      credential is rejected (401).
- [ ] The audit log for a call to `api/v1/license-transit` shows
      `basicAuthSection` = the **new** section name.
- [ ] The comment above the auth attribute no longer tells the reader to keep
      `LicenseShipment`.
- [ ] No other endpoint in LK2 changed behaviour.
- [ ] The generated password is a new value, not reused from another section, and
      has been reported to the stakeholder.
- [ ] The `INSERT` statement for the `services` row is written out for the
      stakeholder to run, and **was not run by anyone on this team**.

## Constraints

- **This breaks the external consumer a second time.** Linkage Center 2 will need
  the new password in addition to the new URL from REQ-001. The stakeholder has
  not yet notified them about the URL either (REQ-001 Q7), so both changes should
  be communicated together.
- **Dependency outside this team:** REQ-001 kept the old key precisely so Linkage
  Management could keep resolving the Thai license name from `basicAuthSection`.
  Once form 9 logs `LicenseTransit`, that resolution needs a matching `services`
  row. The stakeholder is adding one (Q2-2) and keeping the old row, so both
  historical and new log records resolve. **That row should land before or with
  this deployment**, or new log lines show the raw code until it does.
- **The stakeholder owns both sides.** Stated 2026-09-07: *"ความจริงคือ คนที่ทำ
  linkage management api ก็ฉันนี่แหละ ทำได้เลย"* — they are the author of the Linkage
  Management API. So the `services` row is not a cross-team negotiation and carries
  no scheduling risk; it lands when they choose. This does **not** by itself put the
  `did-045-api-linkage-management` repository into this team's scope — see Q2-4.
- **Credentials are the stakeholder's to supply.** Existing sections use
  `Username: "Linkage Service"` with a per-section password committed in
  `appsettings.json`. Neither PM nor the team invents or chooses a password —
  see Q2-1.
- No test project exists in this solution; verification is `dotnet build` plus
  described manual checks (same standing constraint as REQ-001).

## Out of Scope

- Building the future form-18 `license-shipment` endpoint.
- Renaming or re-passwording any other endpoint's Basic-auth section.
- Any change to the data, query, filters or response shape of `license-transit`.
- **Editing the `did-045-api-linkage-management` repository, or running anything
  against its database.** Requirement 6 delivers the `INSERT` **as text only**; the
  stakeholder runs it and owns that system (Q2-4).

## Questions

- **Q2-1 — PARTLY ANSWERED by the stakeholder, 2026-09-07** (*"LicenseTransit
  ชื่อนี้แหละ username เดิม"*):
  - **section name = `LicenseTransit`** ✅ — this is also the value that will appear
    as `basicAuthSection` in the audit log and as `service_code` in Linkage
    Management.
  - **username = `"Linkage Service"`** ✅ — same as every other section.
  - **password — RESOLVED 2026-09-07.** PM said the team does not invent
    credentials; the stakeholder answered *"gen เองไปเลย"*, explicitly authorising
    the team to generate it. Folded into Requirement 1: a new 40-char hex value,
    distinct from every other section, reported back to the stakeholder. **This was
    the last blocker — REQ-002 is now READY_FOR_SA.**
- **Q2-2 / Q2-3 — SETTLED by the stakeholder, 2026-09-07 (final):**
  *"เอาตามที่แนะนำ เพิ่มแถว LicenseTransit เก็บแถวเดิมไว้"* — in the Linkage
  Management `services` table, **ADD a new row** with
  `service_code = "LicenseTransit"` (provider `288f6f06-…`, Thai name
  "ข้อมูลหนังสืออนุญาตผ่านแดนซึ่งยุทธภัณฑ์") and **KEEP** the existing
  `LicenseShipment` row (id `acea81e1-4dec-4342-a3da-cb10843f6153`) untouched.
  Result: historical log records keep resolving their Thai name, new records
  resolve under the new code, and the `LicenseShipment` row stays reserved for the
  future form-18 endpoint. Earlier "update the row in place" instruction is
  withdrawn. **Their system, their action — not this team's work.**
  Trail of how this was decided (kept because it is the reason, not the decision):
  PM checked how the dashboard resolves names (`LogService.mapLicenseResponse`,
  `did-045-api-linkage-management`): the lookup happens **at read time**, not at
  ingest. `buildLicenseIndex()` reads `services` fresh on every query and matches it
  against each Elasticsearch record's `basicAuthSection`. Consequences of updating
  the row in place:
  - **New log records** (`basicAuthSection = LicenseTransit`) resolve correctly ✅
  - **All historical records** — everything logged before this change, including the
    2026-09-07 evidence record — carry `basicAuthSection = LicenseShipment`. Once no
    row has that `service_code`, they stop resolving and the dashboard falls back to
    showing the raw code `"LicenseShipment"` instead of the Thai license name. The
    per-service filter (`basicAuthSection.keyword`) also splits history in two.
  - Nothing crashes; it is a display/filter regression on past data only.
  PM recommended keeping both rows rather than renaming in place; the stakeholder
  accepted that recommendation — see the settled answer above.
- **Q2-4 — ANSWERED by the stakeholder, 2026-09-07: option (ก).**
  *"ฉันจัดการแถวเอง ทีมทำแค่ฝั่ง LK2"* — the stakeholder handles the `services` row
  themselves; this team works only inside `DidSpf.WebApi.LK2`.
  `did-045-api-linkage-management` stays firmly **Out of Scope**. Settled.
  **Amended later the same day:** the stakeholder then asked that Sober *write* the
  `INSERT` for them (*"ให้ sober เขียนให้เลย"*). That is Requirement 6 — SQL as text
  only. The repo and its database remain out of scope and unexecuted by this team;
  only the statement is authored here.
