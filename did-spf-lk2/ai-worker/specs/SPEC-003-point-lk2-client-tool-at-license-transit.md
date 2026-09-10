# SPEC-003: Point the LK2 client tool at `license-transit`
- Source: REQ-003
- Status: ACTIVE

## Overview

Four values change on **two adjacent lines** of one static file,
`lk2-client-tool/index.html`: the credential key + its password (line 181) and
the form-9 catalog entry's label, auth key and route (line 191). Nothing else.

I read the file before designing. The tool holds two parallel structures, and
they are joined by name, which is the only thing that makes this change subtle:

```js
const CREDS  = { LicenseShipment: "<pw>", … };                    // line 171-182
const GROUPS = [ { label, auth:"LicenseShipment", base:"license-shipment", params:"flat" }, … ];
…
$("pass").value = CREDS[g.auth] || "";                            // line 251
```

`CREDS` is keyed by `auth`, so **renaming one without the other silently yields
an empty password** — `|| ""` swallows the miss, the page still loads, and the
call just returns 401 with no clue why. That is the one real trap here, and the
TASK's checks are built to catch exactly it rather than to admire the diff.

Also confirmed while reading: `g.base` is used for the option value and to build
the path as `"/api/v1/" + g.base` (line 214). The tool never appends `-sandbox`
or `-health-check`, so `base` is the whole route and there is no second place to
update.

## Repo boundary — confirmed, this is ours to change

Porter asked me to rule on this rather than let it pass. **Yes: it is in scope
for this team.** `lk2-client-tool/index.html` exists only to exercise the LK2 API
this team owns, and the stakeholder asked for the fix. Sitting outside the
`DidSpf.WebApi.LK2` folder makes it out of scope for an *LK2-project-scoped
grep*, not out of scope for the team.

> **CORRECTION, Sober 2026-09-10 (Q-BE-5).** I originally justified this with
> "it is inside the `did-spf` repository". **That premise was wrong.** The file is
> in the `did-spf` working *directory* but is **gitignored** (`.gitignore:40`) and
> has never been tracked — I verified this myself: `git check-ignore` matches,
> `git ls-files` does not know it, and `git log --all` on the path is empty.
> The **ruling stands** on the parts that were actually load-bearing (it is the
> team's tool, it exercises our API, the stakeholder asked), but the reasoning is
> corrected here rather than left to look verified. The consequence — this fix does
> not travel with the repo — is a delivery question I have put to Porter as SA-5,
> not something I can decide.

**The lesson I am taking from it, since this is the second time scoping bit us:**
an acceptance search must be scoped to *everything the change can break*, not to
the folder the change happens in. REQ-001's criterion said "over the LK2 project"
and was satisfied while this file was already broken. SPEC-003 therefore scopes
its search to the file itself, and I checked the whole `did-spf` tree for other
callers before writing this (there are none — Porter's sweep agrees).

## Interface Design

No API changes. The four edited values:

| Line | Before | After |
|---|---|---|
| 181 | `LicenseShipment:  "68ec2218…001aa1",` | `LicenseTransit:   "30cb2c7a…b569",` |
| 191 | `label:"หนังสืออนุญาตขนย้าย (Shipment)"` | `label:"หนังสืออนุญาตผ่านแดนซึ่งยุทธภัณฑ์"` |
| 191 | `auth:"LicenseShipment"` | `auth:"LicenseTransit"` |
| 191 | `base:"license-shipment"` | `base:"license-transit"` |

**On the label — I am tightening REQ-003 item 3, not departing from it.** The REQ
offers "หนังสืออนุญาตผ่านแดน (Transit)" as an example and asks for the name used
"everywhere else". Everywhere else — `SwaggerTags.LICENSE_TRANSIT`,
`DATA-MAPPING.md`, the controller comment — form 9 is
**"หนังสืออนุญาตผ่านแดนซึ่งยุทธภัณฑ์"**. Its sibling entry in this same catalog,
`license-export`, uses its own Swagger tag verbatim
("หนังสืออนุญาตส่งออกซึ่งยุทธภัณฑ์"). Matching that is more consistent than the
illustrative wording, and it satisfies the actual requirement — the label no
longer says ขนย้าย and now correctly describes form 9.

The password's authoritative source is
`DidSpf.WebApi.LK2/appsettings.json → Configurations.BasicAuth.LicenseTransit`,
per REQ-003 item 2. I have **not** written the value into this SPEC or the TASK —
it must be copied from that file, which is also how the TASK's check is phrased
(a comparison against the file, not against a number I retyped).

## Data Model

None. Static file, no build, no schema, no server change.

## Flow

Unchanged. For the record: pick a licence from the dropdown → `refresh()` sets
`$("pass").value = CREDS[g.auth]` → the request goes to `"/api/v1/" + g.base`
with `Authorization: Basic btoa(user:pass)`. After this change the form-9 option
resolves to `license-transit` with the `LicenseTransit` credential.

**The failure mode to design against:** if `CREDS` and `auth` disagree,
`CREDS[g.auth]` is `undefined`, `|| ""` makes it an empty string, and the tool
sends `Basic base64("Linkage Service:")` → **401**, with a page that looks
perfectly healthy. The TASK checks the two names agree *programmatically* rather
than by reading them side by side.

## Non-functional

- **`dotnet build` proves nothing here** and must not be cited as evidence — this
  file is not compiled and not part of any project. REQ-003 says so and I am
  repeating it because "build passes" is the habitual close on this project.
  The available automated gate is a **JS syntax check** on the extracted
  `<script>` block; I ran it on the current file before specifying it, and it
  passes (`node --check` → rc 0, 10 `GROUPS` entries), so it is a real gate with
  a known-good baseline rather than a hopeful instruction.
- **Do not restructure the credential handling.** All ten passwords are in
  plaintext in this file by existing design (REQ-003 constraint). Out of scope.
- **Run the app only as** `dotnet run --no-launch-profile` with
  `ASPNETCORE_ENVIRONMENT=Production` *if* the API is started at all — though
  this TASK does not require starting it (see below).
- **Live end-to-end 200 is not achievable locally** and is not being asked for:
  the endpoint needs Oracle, which no agent here may touch. That evidence, if the
  stakeholder wants it, is a DATA REQUEST — the same route SA-2/SA-3 took.

## Tasks

- TASK-003: Point the client tool's form-9 entry at `license-transit` (depends on: —)

**Numbering note:** this is the *first real* TASK-003. Earlier drafts of SPEC-002
and TASK-002 referred to a "TASK-003" for the `services` row that was never
created — Jason caught that as Q-BE-4 and I corrected both files on 2026-09-10.
That phantom is unrelated to this TASK; the `services` row remains the SQL
deliverable `specs/SPEC-002-linkage-management-services-row.sql`.

## Out of Scope

- The other nine catalog entries, their routes, auth keys and passwords
  (**but see Question SA-4 — one of them is already broken**).
- Any change to the LK2 API. REQ-001/REQ-002 are DELIVERED.
- Restructuring, restyling or refactoring the tool; the plaintext credentials.
- `did-045-api-linkage-management` and its `V18` migration — stakeholder's.
- Stale published output (`_build-out-lk2/`, `spf-build/`).

## Questions

- **SA-4 (Sober → Porter, open, NON-BLOCKING) — the tool's `license-export`
  entry is broken too, and it is not our doing.** While verifying that form 9 was
  the only stale entry, I reconciled **all ten** of the tool's passwords against
  `appsettings.json` rather than assuming. Nine match. One does not:

  | entry | tool | `appsettings.json` |
  |---|---|---|
  | `LicenseExport` | `da26c2e922…` | `adda97fb54…` |

  So the tool's **export** button also gets a 401 today. This is **pre-existing
  drift, unrelated to REQ-001/002** — the form-9 password in the tool still
  matches the old `LicenseShipment` value exactly, i.e. form 9 worked until we
  changed the route.

  REQ-003 item 4 says the other nine entries stay untouched, so I have **kept it
  out of TASK-003** rather than quietly widening the change. My recommendation:
  fix it in the same pass — it is one 40-character string, the fix is mechanical,
  and shipping a "tool now works" message while a second button silently 401s
  invites the stakeholder to rediscover this the hard way. It is their tool and
  their call. A "yes" is a one-line addition to TASK-003 and delays nothing.

  *(I am not touching it meanwhile, and TASK-003's checks assert the other nine
  lines are byte-identical to `HEAD` — including the wrong export value.)*
