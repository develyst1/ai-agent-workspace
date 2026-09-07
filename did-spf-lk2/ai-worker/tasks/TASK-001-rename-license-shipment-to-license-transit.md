# TASK-001: Rename the form-9 endpoint family to `license-transit`
- Source: SPEC-001
- Status: DONE (Sober, 2026-09-07 — see `## Review`. The 4 DB-dependent DoD
  checks were struck from this TASK as impossible for BE by construction; the
  residual runtime evidence moved to a DATA REQUEST at REQ level.)
- Depends on: none
- Repo: logical name **`did-spf`** — resolve the real path from the
  workspace-root `machine.local.md`. All paths below are relative to
  `DidSpf.WebApi.LK2/` unless stated otherwise.

## What to do

A **surface-only rename** of one controller family: `license-shipment` →
`license-transit`. Behaviour must not change at all — same query, same filter,
same response fields, same auth. If you find yourself changing logic, stop and
ask in `## Questions`.

Read SPEC-001 first; its "Rename map" table is authoritative. Exactly **8 files**
in this project contain "shipment" and they are all accounted for below.

### 1. Rename the controller file and its contents

`Controllers/LicenseShipmentController.cs` → **`Controllers/LicenseTransitController.cs`**
(rename the file, not just the class).

Inside it:
- class `LicenseShipmentController` → `LicenseTransitController` (and the constructor)
- `private const int FORM_ID_SHIPMENT = 9;` → `FORM_ID_TRANSIT` — **value stays `9`**
- the three route literals:
  - `[HttpGet("license-shipment")]` → `[HttpGet("license-transit")]`
  - `[HttpGet("license-shipment-health-check")]` → `[HttpGet("license-transit-health-check")]`
  - `[HttpGet("license-shipment-sandbox")]` → `[HttpGet("license-transit-sandbox")]`
- `SwaggerTags.LICENSE_SHIPMENT` → `SwaggerTags.LICENSE_TRANSIT` (3 places)
- every `LicenseShipmentResponse` → `LicenseTransitResponse` (the 3
  `ProducesResponseType` attributes, the local in `GetData`, the return types of
  `GetDataReal`/`GetDataDummy`, and the 3 dummy rows)

**Delete the old routes — do not keep them as aliases.** The stakeholder chose a
hard cut. After this, `api/v1/license-shipment` must 404.

### 2. 🚫 Do NOT touch the Basic-auth key — add a comment instead

Leave `[BasicAuth("LicenseShipment")]` **exactly as it is**, and leave
`appsettings.json`'s `"LicenseShipment"` section **exactly as it is**.

This looks like a missed rename, so make it obviously deliberate. Add a comment
directly above the attribute — this is the **only** non-rename line you add:

```csharp
// ⚠️ ห้ามเปลี่ยนชื่อ section นี้เป็น "LicenseTransit" (REQ-001 ข้อ 5)
// "LicenseShipment" ไม่ใช่ชื่อภายใน แต่เป็น service_code ที่ระบบ Linkage Management
// เก็บไว้ และเป็นค่า basicAuthSection ที่ log ส่งออกไปให้ LogService.java ใช้ resolve
// ชื่อใบอนุญาตภาษาไทยบน dashboard — เปลี่ยนแล้ว dashboard จะ resolve ชื่อไม่ได้
[BasicAuth("LicenseShipment")]
```

(Thai comment is deliberate — it matches the existing comment style in this
controller. Reword if you prefer, but keep the *why*.)

Also verified already, so you do not need to check: `appsettings.Development.json`,
`appsettings.Local.json` and `appsettings.Local.json.example` contain no
"shipment" at all — **no edit needed in any of them**.

### 3. Rename the model file and class

`Models/LicenseShipmentModel.cs` → **`Models/LicenseTransitModel.cs`**;
class `LicenseShipmentResponse` → `LicenseTransitResponse`.

Keep all seven properties and all seven `[SwaggerSchema(...)]` attribute values
untouched — the JSON on the wire must not change.

### 4. Rename the Swagger tag **constant name only**

`Utils/TextConstant.cs` → in `SwaggerTags`:

```csharp
// before
public const string LICENSE_SHIPMENT = "ข้อมูลหนังสืออนุญาตผ่านแดนซึ่งยุทธภัณฑ์";
// after — identifier renamed, string value IDENTICAL
public const string LICENSE_TRANSIT   = "ข้อมูลหนังสืออนุญาตผ่านแดนซึ่งยุทธภัณฑ์";
```

**Do not translate or edit the Thai value.** The form's Thai name did not change,
so the tag shown in Swagger UI must look exactly the same as before.

### 5. Update the comments and docs inside this project

- `Utils/ELicenseFlatLicenseHelper.cs` (~line 7) — comment
  `"...(ใช้ร่วม yp2/3/4/5, export, shipment)"` → `"...export, transit)"`
- `Utils/LicenseSearchParamHelper.cs` (~line 20) — `<summary>`
  `"ELicensing (yp/export/shipment): ..."` → `"(yp/export/transit): ..."`
- `CLAUDE.md` (~line 68) — the response-model table row. Update all three cells
  (`LicenseShipmentResponse`, `LicenseShipmentModel.cs`, `license-shipment`) to
  the transit names.
- `DATA-MAPPING.md` (~lines 42, 56, 100, 153, 208, 216) — every mention of
  `license-shipment` / "shipment" that means form 9 → transit. **Keep every fact
  as-is**: the Thai `(ผ่านแดน)`, `LICENSE_FORM_ID = 9`, the table names, and the
  `STATUS=30` / 0-rows notes. You are changing the word, not the content.

### 6. Do NOT touch (out of scope for this TASK)

- `_build-out-lk2/appsettings.json` — already checked, its only hit is the auth
  key, which stays. Nothing to do.
- `task.md`, `lk2-real-data-plan.md`, `understanding-cdss.md` at the solution
  root — open question with Porter (REQ-001 Q4).
- `DidSpf.Oracle.DataAccess.ELicensing/Repositories/TTLicenseRepository.cs:39` —
  a comment mentioning "shipment (9)". Open question SA-1 in SPEC-001. **Leave
  it.** If Porter says include it, I will send it as a one-line follow-up.
- Anything in `did-045-api-linkage-management`.

## Definition of Done

> ⚠️ **This solution has no test project** (`DidSpf.WebApi.LK2/CLAUDE.md`: "No
> test project exists in this solution"). `dotnet build` is the only automated
> gate. Do **not** write "tests pass" anywhere — there are none to run.

- [ ] `dotnet build` from the solution root succeeds — **0 errors, and no new
      warnings** compared to before your change. Paste the tail of the output
      into `## Implementation Notes`.
- [ ] `grep -rin "shipment" DidSpf.WebApi.LK2/ --exclude-dir=bin --exclude-dir=obj`
      returns **exactly two** hits, both the deliberate Basic-auth key:
      `Controllers/LicenseTransitController.cs` (the `[BasicAuth("LicenseShipment")]`
      line) and `appsettings.json`. Paste the actual output.
      *(Your new explanatory comment adds a few more lines containing the word —
      that is fine and expected; just show the output and say which is which.)*
- [ ] `Controllers/LicenseShipmentController.cs` and `Models/LicenseShipmentModel.cs`
      no longer exist; `LicenseTransitController.cs` and `LicenseTransitModel.cs` do.
- [ ] **Manual verification — run the app freshly built** (`dotnet run` on this
      project; do not test against a stale `_build-out-lk2/` copy) and record the
      result of each call. All calls need the 4 required headers
      (`Authorization: Basic …`, `X-Office-Request`, `X-User-Request` (13 digits),
      `User-Agent`) or the middleware returns 400 before the controller runs:
  - [ ] `GET /servicelk2/api/v1/license-transit-health-check` → **200**, `data: []`
  - [ ] `GET /servicelk2/api/v1/license-transit-sandbox?traderName=บริษัท`
        → **200** with the **3 dummy rows**, fields exactly as before
        (`citizenId, issueDate, expireDate, juristicId, licenseNo, productName, traderName`)
  - [ ] `GET /servicelk2/api/v1/license-transit-sandbox` (no params) → **400**
        `REQUIRE_AT_LEAST_ONE_FIELD`
  - [ ] `GET /servicelk2/api/v1/license-transit?traderName=บริษัท` → **200**.
        An **empty `data: []` is the correct result** — form-9 rows are `STATUS=30`
        while the query filters `STATUS=40`. Pre-existing, not your bug.
  - [ ] `GET /servicelk2/api/v1/license-shipment` → **404** (old route is gone)
  - [ ] The **same username/password as before** still authenticate on the new
        route — you changed no credential. A 401 here means you touched the key.
- [ ] Swagger UI (`IsShowSwagger: true`) lists the three `license-transit`
      endpoints under the **unchanged** Thai tag
      "ข้อมูลหนังสืออนุญาตผ่านแดนซึ่งยุทธภัณฑ์", and no `license-shipment`
      endpoint appears.
- [ ] **If Logstash is enabled in your environment** (`Configurations.Logstash.Enabled`):
      an audit event for the new route shows `endpointTemplate: "api/v1/license-transit"`
      **and** `basicAuthSection: "LicenseShipment"` (the old value — this is the
      point of keeping the key). If Logstash is off locally, say so explicitly in
      the notes rather than guessing — do not claim you saw it.
- [ ] No other endpoint changed: no file outside the 8 listed in SPEC-001's
      rename map was modified. `git status` / `git diff --stat` output pasted in
      the notes. **Do not commit — the human handles git.**

## Implementation Notes

**Jason (BE), 2026-09-07.** Rename implemented in full. Build and static checks
pass. **4 of the manual HTTP checks could not be run by me** — see Q-BE-1; they
need a reachable Oracle instance, which my role forbids me from touching.

### Files changed (all 8 SPEC files, nothing else)

| File | Change |
|---|---|
| `Controllers/LicenseShipmentController.cs` → `Controllers/LicenseTransitController.cs` | file renamed; class, ctor, `FORM_ID_TRANSIT` (value still `9`), 3 route literals, 3 `SwaggerTags.LICENSE_TRANSIT` refs, all `LicenseTransitResponse` refs; **added the 4-line Thai comment above `[BasicAuth("LicenseShipment")]`** |
| `Models/LicenseShipmentModel.cs` → `Models/LicenseTransitModel.cs` | file renamed; class → `LicenseTransitResponse`. All 7 properties and all 7 `[SwaggerSchema]` values untouched |
| `Utils/TextConstant.cs` | `LICENSE_SHIPMENT` → `LICENSE_TRANSIT`; **Thai string value byte-identical** |
| `Utils/ELicenseFlatLicenseHelper.cs` | comment `export, shipment` → `export, transit` |
| `Utils/LicenseSearchParamHelper.cs` | `<summary>` `(yp/export/shipment)` → `(yp/export/transit)` |
| `CLAUDE.md` | response-model table row → all three transit names |
| `DATA-MAPPING.md` | 6 lines (42, 56, 100, 153, 208, 216) — word only; form id, Thai `(ผ่านแดน)`, table names, `STATUS=30`/0-rows notes all kept verbatim |
| `appsettings.json` | **not modified** (auth key stays, as specified) |

Verified before starting that no source outside LK2 references the renamed
symbols — only the two out-of-scope notes (`task.md`, `understanding-cdss.md`,
REQ-001 Q4) and `.vs/` IDE caches mention them. So the rename breaks no other project.

### `dotnet build` — 0 errors, no new warnings

Baseline captured **before** any edit, then compared after, both full rebuilds
(`--no-incremental`; a plain incremental build reports a misleading "0 Warnings"
because it skips unchanged projects):

```
BEFORE:  277 Warning(s)   0 Error(s)   (dotnet build DidSpf.sln)
AFTER:   277 Warning(s)   0 Error(s)   (dotnet build DidSpf.sln --no-incremental)
Build succeeded.
```

Warnings attributable to `DidSpf.WebApi.LK2`: **0 before, 0 after**
(`grep -c "WebApi.LK2.*warning"` on both outputs). No test project exists in this
solution, so no test claim is made.

### Acceptance grep — exactly the expected hits

```
$ grep -rin "shipment" DidSpf.WebApi.LK2/ --exclude-dir=bin --exclude-dir=obj
DidSpf.WebApi.LK2/appsettings.json:81:      "LicenseShipment": {
DidSpf.WebApi.LK2/Controllers/LicenseTransitController.cs:13:    // "LicenseShipment" ไม่ใช่ชื่อภายใน แต่เป็น service_code ที่ระบบ Linkage Management
DidSpf.WebApi.LK2/Controllers/LicenseTransitController.cs:16:    [BasicAuth("LicenseShipment")]
```

Which is which: line 81 of `appsettings.json` and line 16 of the controller are
the **two deliberate Basic-auth key hits** required by the DoD. Line 13 is the
explanatory comment the TASK asked me to add. No other hit remains.

File renames confirmed: `LicenseShipmentController.cs` / `LicenseShipmentModel.cs`
no longer exist; `LicenseTransitController.cs` / `LicenseTransitModel.cs` do.

### Manual verification — how I ran it

`appsettings.Local.json` on this machine holds **real** Oracle host/password and
`Logstash.Enabled: true` pointing at a real Logstash host. I must not touch real
DBs/environments, so I ran the freshly built app (not `_build-out-lk2/`) as
`ASPNETCORE_ENVIRONMENT=Production --no-launch-profile` on port 5099, which skips
`appsettings.Local.json` entirely, with throwaway Oracle values (`127.0.0.1`) and
Logstash off. `appsettings.Local.json` was never edited (still gitignored, mtime unchanged).

| DoD check | Result |
|---|---|
| `license-transit-health-check` → 200 `data: []` | ❌ **not verified — 500**, see Q-BE-1 |
| `license-transit-sandbox?traderName=บริษัท` → 200, 3 dummy rows | ❌ **not verified — 500**, see Q-BE-1 |
| `license-transit-sandbox` (no params) → 400 `REQUIRE_AT_LEAST_ONE_FIELD` | ❌ **not verified — 500**, see Q-BE-1 |
| `license-transit?traderName=บริษัท` → 200 empty `data: []` | ❌ **not verified — 500**, see Q-BE-1 |
| `GET api/v1/license-shipment` → **404** | ✅ **404** (also `license-shipment-sandbox` → 404) |
| Same unchanged username/password still authenticates on the new route | ✅ **verified** — see below |
| Swagger: 3 transit endpoints under the unchanged Thai tag, no shipment | ✅ **verified** |
| Logstash `endpointTemplate` / `basicAuthSection` | ⚠️ **not observed** — Logstash was deliberately disabled in my run. Not claiming it |

**Why the four 500s are not a rename defect.** `UnitOfWorkELicensing`'s
constructor calls `connection.Open()` (`DidSpf.Oracle.DataAccess.ELicensing/UnitOfWorkELicensing.cs:60-66`),
so the controller cannot be constructed at all without a reachable Oracle — this
hits *every* endpoint on the controller including health-check and sandbox, which
otherwise touch no data. Control test on a controller I did **not** touch, same DAL:

```
license-export-health-check (untouched)      → HTTP 500   ← same failure
license-transit-health-check (mine)          → HTTP 500
```

Identical behaviour on untouched code ⇒ environmental (no DB), not the rename.

**Auth proof (this one is solid and needs no DB).** `BasicAuthFilter` runs
*before* the controller is constructed, so it is testable independently:

```
wrong password    → HTTP 401
correct password  → HTTP 500   (passes auth, then fails at the DB ctor)
missing headers   → HTTP 400  {"missingHeaders":["X-Office-Request","X-User-Request"]}
```

The unchanged credential gets **past** auth on the new route (401 → not-401), which
is exactly what the DoD's "a 401 here means you touched the key" is checking for.

**Swagger (`/servicelk2/swagger/v1/swagger.json`, HTTP 200):**

```
/api/v1/license-transit               -> ['ข้อมูลหนังสืออนุญาตผ่านแดนซึ่งยุทธภัณฑ์']
/api/v1/license-transit-health-check  -> ['ข้อมูลหนังสืออนุญาตผ่านแดนซึ่งยุทธภัณฑ์']
/api/v1/license-transit-sandbox       -> ['ข้อมูลหนังสืออนุญาตผ่านแดนซึ่งยุทธภัณฑ์']
license-shipment* paths: (none)
```

Tag value identical to before. Response schema unchanged on the wire:

```
LicenseTransitResponse -> ['citizenId','expireDate','issueDate','juristicId',
                           'licenseNo','productName','traderName']
LicenseTransitResponseListResponseResult -> ['data','message','responseCode']
```

All 7 camelCase fields and the envelope are exactly as before.

### ⚠️ Disclosure — I briefly connected to the real Logstash server

My **first** launch attempt used plain `dotnet run`, which silently applied
`Properties/launchSettings.json` and forced `ASPNETCORE_ENVIRONMENT=Development`,
overriding the `Production` I had set. That loaded the real `appsettings.Local.json`
and the app opened a TCP connection to the real Logstash host (`192.168.33.161:5000`,
logged as `[Logstash] Connected`). I killed the process as soon as I saw it.

Scope of the breach: **the TCP connection was established; no HTTP request was
ever served in that run, so no audit event was enqueued or sent, and no Oracle
query ran.** No data was written anywhere. I re-ran with `--no-launch-profile`,
which is what all evidence above comes from. Flagging it rather than burying it —
it was my mistake and it touched a real environment, which I am not allowed to do.

### Working tree (not committed — the human handles git)

```
$ git status --porcelain
 M DidSpf.WebApi.LK2/CLAUDE.md
 D DidSpf.WebApi.LK2/Controllers/LicenseShipmentController.cs
 M DidSpf.WebApi.LK2/DATA-MAPPING.md
 D DidSpf.WebApi.LK2/Models/LicenseShipmentModel.cs
 M DidSpf.WebApi.LK2/Utils/ELicenseFlatLicenseHelper.cs
 M DidSpf.WebApi.LK2/Utils/LicenseSearchParamHelper.cs
 M DidSpf.WebApi.LK2/Utils/TextConstant.cs
?? DidSpf.WebApi.LK2/Controllers/LicenseTransitController.cs
?? DidSpf.WebApi.LK2/Models/LicenseTransitModel.cs
```

Plus 4 files that were **already modified before I started** and are not mine —
`DidSpf.WebApi.Center/DidSpf.WebApi.Center.csproj.user`,
`DidSpf.WebApi.Center/Properties/PublishProfiles/FolderProfile.pubxml{,.user}`,
`DidSpf.WebApi.LK2/DidSpf.WebApi.LK2.csproj.user` (IDE/publish artifacts; I
captured this in `git status` before my first edit). Branch is `feat/dashboard`.
Nothing committed, added, stashed or branched.

## Questions

(Jason asks; Sober answers as `> answer: ...`)

- **Q-BE-1 (Jason → Sober) — how should the 4 DB-dependent DoD checks be run?**
  These four cannot be executed by me under my own rules, and it is structural,
  not a missing-config problem: `UnitOfWorkELicensing`'s constructor opens the
  Oracle connection, so **every** endpoint on this controller — including
  `-health-check` and `-sandbox`, which use no data — returns 500 unless a real
  Oracle is reachable. Running against the real DB is exactly what BE.md forbids.
  Unverified: (1) health-check 200 `data: []`, (2) sandbox 200 with the 3 dummy
  rows, (3) sandbox no-params 400 `REQUIRE_AT_LEAST_ONE_FIELD`, (4) `license-transit`
  200 with empty `data`.
  Everything not requiring the DB **is** verified: build, grep, file renames, old
  route 404, unchanged credential passing auth, Swagger routes + unchanged Thai
  tag + unchanged response schema. A control test on the untouched
  `license-export` controller 500s identically, so the rename is not implicated.
  Three options as I see them — your call:
  (a) accept the static + Swagger + auth evidence as sufficient for this
      surface-only rename (my recommendation — the 4 checks exercise the DB stack,
      not the rename, and the schema/route/tag evidence already proves the shape);
  (b) route a DATA REQUEST so the human runs those 4 calls on an environment that
      has Oracle and pastes the output into `../project-docs/`;
  (c) tell me the checks are mandatory for BE and I will mark this BLOCKED until
      an environment I am permitted to use exists.

- **Q-BE-2 (Jason → Sober) — Logstash field check.** The DoD says to verify
  `endpointTemplate: "api/v1/license-transit"` + `basicAuthSection: "LicenseShipment"`
  *if* Logstash is enabled. I deliberately ran with it **off** (enabling it here
  means pointing at the real Logstash server). So I have **not** observed those
  fields and am not claiming them. Note `basicAuthSection` is sourced from the
  unchanged `[BasicAuth("LicenseShipment")]` argument, and `endpointTemplate` from
  the route — but that is code reading, not evidence. Fold into (b) above if you
  want it actually observed.

## Review

**Sober (SA), 2026-09-07 — verdict: `DONE`.**

I did not review off Jason's file list. I re-ran the checks on the working tree
myself; every number below is one I produced.

### What I verified independently

| Check | How I checked it | Result |
|---|---|---|
| Rename is mechanical, no logic drift | `diff` of the **old controller with the 5 words substituted** against the new file | Differs by **exactly the 4 comment lines** — nothing else. Conclusive. |
| Model unchanged but for the class name | same technique, CR-normalised | **Identical.** All 7 properties + all 7 `[SwaggerSchema]` values intact |
| Swagger tag *value* untouched | `md5sum` of the old value vs the new value | **Same hash** (`4d46a1f6…`). Identifier renamed, Thai string byte-identical |
| Acceptance grep | ran it myself over LK2 | 3 hits: `appsettings.json:81`, controller `:16` (the key), controller `:13` (the explanatory comment). **No stray "shipment" remains** |
| No dangling old symbols anywhere | grepped the **whole solution** for all 5 old identifiers + the old route | **None** |
| `dotnet build DidSpf.sln --no-incremental` | ran it myself | **277 Warning(s), 0 Error(s)** — matches the pre-change baseline exactly; **0** warnings attributable to LK2 |
| Whole working tree, not the claimed files | `git status --porcelain` + `git diff` over the full repo | Only the 9 expected entries. The 4 other modified files are IDE/publish artifacts (`D:\…` → `C:\…` machine-path rewrites, history timestamped 2026-08-17) — **pre-existing, not Jason's**. Nothing committed |
| Docs changed word-only | read all 6 `DATA-MAPPING.md` hunks + `CLAUDE.md` | Word swapped; form id, Thai `(ผ่านแดน)`, table names and the `STATUS=30`/0-rows facts all preserved verbatim |

Acceptance criteria that are now genuinely met: same response shape, the
`-health-check`/`-sandbox` variants exist under the new name, old routes gone,
auth key unchanged in both places, no other endpoint touched, nothing needed in
`did-045-api-linkage-management`.

### Q-BE-1 — answered, and the fault was mine

> answer: **Option (a) — accepted, and the four checks are struck from this
> TASK's DoD. This is my error, not yours.** I wrote a Definition of Done that
> was impossible to satisfy under your own rules, then asked you to satisfy it.
>
> I confirmed your diagnosis in the source rather than taking it on trust:
> `UnitOfWorkELicensing`'s constructor calls `connection.Open()` and
> `BeginTransaction()` (`DidSpf.Oracle.DataAccess.ELicensing/UnitOfWorkELicensing.cs:60-65`),
> so the controller cannot be **constructed** without a reachable Oracle. That
> takes down `-health-check` and `-sandbox` too, even though neither reads data.
> There was no way for you to run those four without touching a real DB, which
> BE.md forbids. A DoD that can only be met by breaking a hard boundary is a
> defective DoD — I should have caught that when I wrote it.
>
> Your control test was the right instinct and it is what makes (a) safe:
> untouched `license-export-health-check` 500s identically, so the failure is
> environmental and provably not implicated in the rename. On top of that, my
> substituted-diff shows the controller body is character-identical to the old
> one, and your Swagger evidence came off a **live instance** — so routing, the
> tag and the response schema are runtime-verified, not just code-read.
>
> Not raising a DATA REQUEST *for you*: nothing is left for BE to do. The
> residual runtime evidence is a REQ-001 acceptance matter, so I am routing it to
> Porter instead (below). You are not blocked and not waiting on it.

### Q-BE-2 — answered

> answer: **Correct call, and thank you for not claiming it.** Enabling Logstash
> locally means pointing at the real server, which you must not do. Reading
> `basicAuthSection` off the unchanged attribute argument is inference, not
> evidence, and you were right to label it as such. Folded into the DATA REQUEST
> to Porter.

### On the self-disclosed Logstash connection

Reported, not buried — that is exactly the behaviour I want, and it is being
recorded as a process finding, not a mark against the work.

I verified your account rather than just accepting it: every profile in
`Properties/launchSettings.json` hard-sets `ASPNETCORE_ENVIRONMENT=Development`,
so a plain `dotnet run` does silently override an exported `Production` and load
`appsettings.Local.json`, which on this machine has `Logstash.Enabled: true` and
real hosts. The mechanism is real and it is a **trap in the repo**, not
carelessness on your part. `appsettings.Local.json` mtime is 2026-06-29 —
untouched today, confirming you never edited it. A TCP connect with no request
served enqueues no audit event, so the "no data written" scope holds.

**Standing rule I am adopting for every future LK2 TASK, so this trap cannot be
stepped in again:** any instruction to run this app must say
`dotnet run --no-launch-profile` with `ASPNETCORE_ENVIRONMENT=Production`, and
must state that a bare `dotnet run` reaches real infrastructure. I will carry
this into TASK-002 onward. The fix belongs in my instructions, not in your care.

### Nothing to rework

The two things I flagged as easiest to get wrong — the Basic-auth key and the
Thai tag value — are both correct, and the key now carries the comment that
explains itself to the next reader. Status `REVIEW` → **`DONE`**.
