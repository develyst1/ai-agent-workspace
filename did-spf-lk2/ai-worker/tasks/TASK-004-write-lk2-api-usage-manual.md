# TASK-004: Write the customer-facing LK2 API usage manual (Thai, Markdown)
- Source: SPEC-004
- Status: DONE (Sober, 2026-09-10 — see `## Review`. Q-BE-7 upheld: SPEC-004's `401` row was wrong and is corrected there; the manual needed no change. Q-BE-8 folded into SA-6.)
- Depends on: none (parallel with TASK-005)
- Repo: logical name **`did-spf`** — real path from workspace-root `machine.local.md`.
- **Output file:** `DidSpf.WebApi.LK2/docs/lk2-api-manual-th.md` (create the `docs/`
  folder). One file. No code changes anywhere in this TASK.

## What to do

Write a plain Thai-language Markdown manual for the **customer's technical team**,
so they can call the API from
`https://e-connect-did.mod.go.th/service-did-dopa/swagger/index.html`.

**Read SPEC-004 first, and write from its fact table — not from `CLAUDE.md`,
`DATA-MAPPING.md`, or Swagger's `Required` flags.** All three are wrong or
misleading on at least one point, which is the entire reason this TASK exists. If
the fact table and any other document disagree, the fact table wins; if you think
the fact table itself is wrong, ask in `## Questions` rather than picking.

### Suggested structure (adjust freely; the content requirements are what matter)

1. **ภาพรวม** — what the API is, that it is **read-only** and every endpoint is a
   `GET`, and the base URL `https://e-connect-did.mod.go.th/service-did-dopa`.
2. **การยืนยันตัวตน (Basic auth)** — how it works, and the point that catches
   people: **one credential per licence family**; the username can look the same
   across families and only the password differs, so a password that works on one
   endpoint gives `401` on another. Say the stakeholder issues the passwords.
3. **Header ที่ต้องส่งทุกครั้ง** — the four headers, what happens when one is
   missing (`400` with `missingHeaders`), and the debugging point that **a missing
   header is never a `401`**, because the header check runs before auth.
4. **รายการ endpoint** — the ten families × three variants, with the parameter
   rules per family, taken from SPEC-004's table.
5. **พารามิเตอร์การค้นหา** — including that `licenseNo` is **mandatory** on the four
   families that take it.
6. **รูปแบบผลลัพธ์** — the success envelope, and a dedicated short section on
   **`data: []` meaning "ไม่พบข้อมูล", not an error**.
7. **ข้อผิดพลาดที่พบบ่อย** — `400` (headers), `400` (parameters), `401` (credential),
   with the shapes from SPEC-004.
8. **ตัวอย่างการเรียก** — leave clearly marked placeholders (see below).

### Hard content rules

- **Thai prose. Identifiers stay English** — endpoint paths, header names, query
  parameters and JSON field names exactly as the API spells them. Never translate
  something the reader has to type.
- **`/servicelk2` must not appear anywhere.** It is the local path base; the
  customer's base URL is `/service-did-dopa`. Do not mention both.
- **No credential values.** Not the `LicenseTransit` password, not any other.
  Explain the mechanism only.
- **Do not describe the Basic-auth *section key* as something the customer sends.**
  It is server-side configuration; the caller transmits only username and password.
  You may name the family (e.g. "ชุดรหัสสำหรับ `license-import`") — do not instruct
  them to put `LicenseImport` in a header.
- **Do not promise validation the code does not perform.** Tell them to send an
  integer `X-Office-Request` and a 13-digit `X-User-Request` as the expected
  contract, but do **not** write that the API rejects other values — it does not
  (SPEC-004 fact table). Do not mention `UserAgentPrefix` at all; it is dead config.
- **External audience.** Nothing about this team, REQ/TASK numbers, the
  `LicenseShipment`→`LicenseTransit` rename, Linkage Management, `service_code`, or
  the `STATUS=30`/`STATUS=40` data situation.
- **Plain Markdown only** — headings, paragraphs, tables, fenced code blocks. No
  HTML, no images, no mermaid. The stakeholder converts it to PDF.

### Examples — placeholders, not inventions

Real example values come from REQ-005 and do not exist yet. Where an example
request/response belongs, leave a clearly marked placeholder such as:

```
<!-- TODO(REQ-005): ตัวอย่างจริง รอผลการเรียกจากผู้ดูแลระบบ -->
```

**Do not compose a plausible licence number, company name or citizen ID.** A
fabricated example in a customer manual is worse than an obvious gap: they will
paste it, get an empty result, and open a support ticket. Placeholders are the
correct output of this TASK.

You **may** show the *shape* of a response using the `-sandbox` dummy values, which
are already fake and committed in the controllers — clearly labelled as ตัวอย่าง
โครงสร้าง (structure example), not as real data.

## Definition of Done

> ⚠️ **`dotnet build` is not evidence here** — this TASK adds one Markdown file and
> touches no code. Do not cite it.
>
> ⚠️ **If you run the app at all**, only as `dotnet run --no-launch-profile` with
> `ASPNETCORE_ENVIRONMENT=Production`. A bare `dotnet run` loads
> `appsettings.Local.json` and reaches the **real** Logstash/Oracle.

- [ ] The file exists at `DidSpf.WebApi.LK2/docs/lk2-api-manual-th.md`, is valid
      plain Markdown, and contains **no HTML tags** other than the `<!-- TODO -->`
      placeholder comments. Show `grep -c "<" ` output or equivalent and account for
      any hits.
- [ ] **All 30 endpoints are present** (10 families × 3 variants). Check it, do not
      count by eye:
      ```bash
      grep -o "license-[a-z0-9-]*" DidSpf.WebApi.LK2/docs/lk2-api-manual-th.md | sort -u | wc -l
      ```
      Cross-check the list against the routes actually in the code:
      ```bash
      grep -rho 'HttpGet("[^"]*"' DidSpf.WebApi.LK2/Controllers/License*.cs | sort -u
      ```
      **Both lists must contain the same 30 names.** Paste both and state that they
      match — a name in the manual that is not in the code is a broken instruction.
- [ ] **`/servicelk2` appears zero times:**
      `grep -c "servicelk2" DidSpf.WebApi.LK2/docs/lk2-api-manual-th.md` → **0**.
- [ ] **No credential leaked.** Verify no password from `appsettings.json` appears
      in the manual — compare programmatically rather than by reading:
      ```bash
      python3 -c "
      import re
      a=open('DidSpf.WebApi.LK2/appsettings.json',encoding='utf-8-sig').read()
      pws=set(re.findall(r'\"Password\":\s*\"([0-9a-f]{40})\"',a))
      m=open('DidSpf.WebApi.LK2/docs/lk2-api-manual-th.md',encoding='utf-8').read()
      leaked=[p for p in pws if p in m]
      print('passwords in appsettings:',len(pws),'| leaked into manual:',leaked or 'NONE')
      "
      ```
      Expect **`NONE`**. This one varies with the answer — a leak shows as a list.
- [ ] **The four parameter rules are right per family.** For each of the ten
      families, the manual's `licenseNo` claim matches the controller. State the
      check you used. The expected split is 4 mandatory / 6 not accepted — if your
      reading of the code disagrees with SPEC-004's table, **stop and ask**, do not
      silently follow either one.
- [ ] The manual states explicitly that `data: []` is a normal "ไม่พบข้อมูล" result
      with HTTP `200` and `responseCode "000"` — quote the line in your notes.
- [ ] The manual does **not** claim `X-Office-Request` or `X-User-Request` are
      format-validated, and does not mention `UserAgentPrefix`. Confirm by grep.
- [ ] **Observable behaviour — observe it, do not transcribe it.** These two are
      reachable without a database, because the middleware and the auth filter both
      run *before* the controller is constructed. Run the app as above and record
      the real status + body:
  - [ ] a request with **no headers** → `400`, body listing `missingHeaders`
  - [ ] a request with all four headers but a **wrong password** → `401` with
        **no body**
      Paste both. If what you observe differs from SPEC-004's table, the table is
      wrong — tell me, do not quietly follow the observation into the manual.
- [ ] **Not observable, and you must not fake it:** the two `REQUIRE_*` `400` bodies
      come from inside the controller, which cannot be constructed without Oracle.
      Transcribe those shapes from `Utils/ModelStateHelper.cs` +
      `Utils/TextConstant.cs` and **say in your notes that they were transcribed
      from source, not observed.** I will route them as a DATA REQUEST if the
      stakeholder wants them confirmed.
- [ ] No file outside `DidSpf.WebApi.LK2/docs/` was created or modified. Show
      `git status --porcelain`. **Do not commit.**

## Implementation Notes

**Jason (BE), 2026-09-10.** Manual written at
`DidSpf.WebApi.LK2/docs/lk2-api-manual-th.md` (11 sections, Thai prose, English
identifiers). Every DoD check ran and passed.

**One thing needs your ruling before this ships: SPEC-004's fact table is wrong
about the `401` body.** Details in Q-BE-7 — I did not quietly follow either version.

### I re-verified your fact table against source before writing from it

You asked me to write from the table, not from `CLAUDE.md`/`DATA-MAPPING.md`/Swagger.
I did — but I checked the table itself first. **It is accurate on every point I
could test**, and two of its claims I was able to confirm *empirically*, not just by
reading code:

| Fact-table claim | How I confirmed it | Result |
|---|---|---|
| 30 routes, 10 families × 3 | `grep HttpGet(` over the controllers | ✅ exactly 30 |
| `licenseNo` mandatory on 4, not accepted on 6 | `REQUIRE_LICENSE_NO` present in exactly 4 controllers; `licenseNo` absent from the other 6 | ✅ 4 / 6 |
| `licenseNo` checked *before* trader/personal | read `GetData` in `LicenseImportsController` | ✅ confirmed, and `-sandbox` enforces identically |
| `X-Office-Request` not integer-validated | sent `X-Office-Request: NOT-A-NUMBER` | ✅ **passed the header check** (reached the controller) |
| `X-User-Request` not 13-digit-validated | sent `X-User-Request: 42` | ✅ **passed the header check** |
| `UserAgentPrefix` is dead config | grep across the project | ✅ appears only in `appsettings.json` + `ConfigurationsModel`, read nowhere |
| Success envelope is `responseCode` | read `Utils/ResponseResult.cs:9` | ✅ (note: the **solution-level** `CLAUDE.md` says `status_code` — that describes a *different* `ResponseResult`; LK2 has its own. Your table is right.) |

### Observable behaviour — observed, not transcribed

Run as mandated: `dotnet run --no-launch-profile`, `ASPNETCORE_ENVIRONMENT=Production`,
port 5099, throwaway Oracle values, Logstash off. Startup logged
`Hosting environment: Production` and **no** Logstash connection.

**(1) No headers → `400` with `missingHeaders`** — exactly as the table says:

```
HTTP/1.1 400 Bad Request
{"message":"Missing or invalid required headers","errors":{},
 "traceId":"7cacfd5ff0f49776ead02fbc79eedfd7",
 "missingHeaders":["Authorization","X-Office-Request","X-User-Request","User-Agent"]}
```

Two extra cases I ran because the manual documents them:
- `Authorization: Bearer xyz` → `400`, `missingHeaders: ["Authorization"]` (confirms
  the "must start with `Basic `" rule surfaces as a *missing header*, not a 401)
- non-integer office id + 2-digit user id + **valid** credential → reached the
  controller (500 from Oracle), i.e. **not** format-validated. This is the empirical
  proof for the two `CLAUDE.md` errors.

**(2) Valid headers + wrong password → `401`** — status correct, **body is not**:

```
HTTP/1.1 401 Unauthorized
Content-Type: application/problem+json; charset=utf-8
Content-Length: 165

{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.2","title":"Unauthorized",
 "status":401,"traceId":"00-a3f5248b1c260fd5114137a36f2176f6-ce063880c4ad2f24-00"}
```

**Transcribed from source, NOT observed** (the controller cannot be constructed
without Oracle, exactly as you predicted): the two `REQUIRE_*` `400` message strings,
taken verbatim from `Utils/TextConstant.cs:31-32` —
`REQUIRE_AT_LEAST_ONE_FIELD` = "กรุณาระบุ ชื่อ-นามสกุล/ชื่อบริษัท หรือ เลขประจำตัวผู้ภาษี
อย่างใดอย่างหนึ่งเป็นอย่างน้อย", `REQUIRE_LICENSE_NO` = "กรุณาระบุเลขที่หนังสืออนุญาต" —
and their envelope shape from `Utils/ModelStateHelper.cs:33-40` (`GetErrorsMessage`
leaves `missingHeaders` empty). **I am flagging these as transcribed, not observed.**

### DoD checks

**All 30 endpoints present, cross-checked against the code:**

```
manual: 30 | code: 30
RESULT: identical sets of 30 names
```

*(First run of this check reported `manual: 14`. The manual described the
`-sandbox`/`-health-check` pattern generically instead of naming all 30, so the
check correctly failed — I added an explicit 30-row table, which the customer
benefits from anyway. Also worth noting: my first attempt ran from the wrong
directory and both sides came back **empty**, which made `diff` report "identical".
I added a guard that fails when either side is 0 — an empty-vs-empty comparison is
the same class of false pass we have hit before.)*

**`/servicelk2`: 0 occurrences. `UserAgentPrefix`: 0 occurrences.**

**No HTML** — every `<` in the file accounted for: 2 × `<!-- TODO(REQ-005) -->`
comments, the rest are `<placeholder>` angle brackets inside code blocks and tables.

**No credential leaked:**

```
passwords in appsettings: 11 | leaked into manual: NONE
```

And the check discriminates — the same code against the client tool (which does
contain passwords) reports `leaked: 9 of 11`. Not a vacuous check.

**No internal section key presented to the customer:** `LicenseImport`,
`LicenseTransit`, `LicenseExport`, `LicenseYp2` → all `False` (absent). The manual
describes families as "ชุดรหัสสำหรับ `license-import`", never as something to send.

**`licenseNo` claim per family matches the controller — all 10:**

```
license-import              mandatory     mandatory     YES
license-move                mandatory     mandatory     YES
license-sale-domestic       mandatory     mandatory     YES
license-sale-international  mandatory     mandatory     YES
license-export              not-accepted  not-accepted  YES
license-transit             not-accepted  not-accepted  YES
license-yp2..yp5            not-accepted  not-accepted  YES
disagreements: 0 | split -> mandatory: 4  not-accepted: 6
```

Method: parsed the manual's parameter table, and derived truth from the code by
testing whether each controller contains `REQUIRE_LICENSE_NO`.

**`data: []` section** — the manual states it in its own section (§7, "กรณีค้นไม่พบ
ข้อมูล — `data: []` ไม่ใช่ข้อผิดพลาด"):

> **HTTP status = `200 OK`** · **`responseCode` = `"000"` (สำเร็จ)** · **`data` = array ว่าง**
> นี่คือ **ผลลัพธ์ปกติ** ที่แปลว่า "ไม่พบข้อมูลตามเงื่อนไขที่ค้น" ระบบ **ไม่** ตอบเป็น `404`

It also lists the three usual causes and tells the caller not to auto-retry.

**Nothing outside `docs/` created or modified:**

```
$ git status --porcelain
 M DidSpf.WebApi.Center/DidSpf.WebApi.Center.csproj.user
 M DidSpf.WebApi.Center/Properties/PublishProfiles/FolderProfile.pubxml
 M DidSpf.WebApi.Center/Properties/PublishProfiles/FolderProfile.pubxml.user
 M DidSpf.WebApi.LK2/DidSpf.WebApi.LK2.csproj.user
?? DidSpf.WebApi.LK2/docs/
```

Only the new `docs/` folder. The 4 modified files are the known pre-existing IDE
artifacts. Nothing committed. I did not cite `dotnet build` anywhere.

### Structure written

1 ภาพรวม · 2 การยืนยันตัวตน (one credential per family) · 3 Header 4 ตัว + the
`400`-never-`401` debugging point · 4 endpoint ทั้ง 30 · 5 พารามิเตอร์ (licenseNo
บังคับ 4 ประเภท) · 6 รูปแบบผลลัพธ์ + field tables for the 3 response shapes ·
7 `data: []` · 8 ข้อผิดพลาดที่พบบ่อย · 9 ตารางตรวจสอบปัญหาอย่างรวดเร็ว ·
10 ตัวอย่าง (placeholders) · 11 ติดต่อสอบถาม.

Response-shape tables were built from the model classes directly. Structure examples
use the committed `-sandbox` dummy values, labelled "ตัวอย่างโครงสร้าง ... ไม่ใช่ข้อมูลจริง".
**No invented licence number, company name or citizen ID anywhere** — §10 is two
marked `TODO(REQ-005)` placeholders plus a `curl` skeleton with `<...>` slots.

## Questions

(Jason asks; Sober answers as `> answer: ...`)

- **Q-BE-7 (Jason → Sober) — SPEC-004's fact table is wrong about the `401` body,
  and I have not written either version as fact.** The table says
  *"`401` | **no body at all** — `UnauthorizedResult`"*. Observed, it has a
  **165-byte `application/problem+json` body**: ASP.NET Core's standard
  `ProblemDetails` (`type`/`title`/`status`/`traceId`). The inference from
  `UnauthorizedResult` is reasonable but wrong — `[ApiController]` turns a bare
  status result into a ProblemDetails response.
  Per the TASK ("if what you observe differs, the table is wrong — tell me, do not
  quietly follow the observation into the manual") I wrote neither claim. The manual
  says: `401` means the credential was rejected, and **"`401` ไม่มีข้อมูลรายละเอียดที่ใช้
  ระบุสาเหตุได้ — ควรตัดสินจาก HTTP status code เท่านั้น ไม่ควรเขียนโปรแกรมให้ขึ้นกับเนื้อหาใน
  body ของ `401`"**. That is true under both readings and is the advice I would give
  regardless — the `traceId` in that body is the ASP.NET activity id, not the
  `traceId` the API's own error envelope returns, so a customer parsing it would be
  correlating on the wrong value.
  **Your call:** leave the wording as-is (my recommendation), or document the
  ProblemDetails shape explicitly. If you want it explicit, note it is framework
  behaviour and could change with a .NET upgrade — which is the second reason I would
  rather not have customers depend on it.

- **Q-BE-8 (Jason → Sober, non-blocking) — a fourth `CLAUDE.md` inaccuracy for SA-6.**
  While gathering response shapes I found `DidSpf.WebApi.LK2/CLAUDE.md`'s
  "Response models" table is also out of date, independently of the three you
  listed: it says `LicenseSaleResponse` lives in `LicenseMoveModel.cs` and is
  "same as Move + `LicenseMoveNo`", and that `LicenseMoveResponse` has
  `PurchasePermit[]`. In the actual code there is **no `LicenseSaleResponse` class
  at all** — there are `LicenseSaleDomesticResponse` (`LicenseSaleDomesticModel.cs`,
  with `recipientName`/`recipientProvince`) and `LicenseSaleInternationalResponse`
  (`LicenseSaleInternationalModel.cs`, with `recipientCountry`), and
  `LicenseMoveResponse` has `locationOrigin`/`locationDestination`, **no
  `PurchasePermit`**. The customer manual is unaffected (I read the model classes,
  not that table). Worth folding into whatever TASK comes out of SA-6.

## Review

**Sober (SA), 2026-09-10 — verdict: `DONE`.**

Re-ran the checks on the file myself:

| Check | Result |
|---|---|
| Endpoint coverage, manual **vs the controllers** | code has **30** routes, manual has **30**; `in code not in manual: NONE`, `in manual not in code: NONE` — set-equal both directions |
| `/servicelk2` | **0** occurrences |
| `UserAgentPrefix` | **0** occurrences |
| Credential leak (all 11 passwords vs the manual) | **NONE** |
| `licenseNo` split | 4 mandatory / 6 not accepted, matching each controller |
| Tree | only `DidSpf.WebApi.LK2/docs/` is new; the 4 other dirty files are the known IDE artifacts. Nothing committed |

The empty-result section, the "a missing header is never a `401`" debugging note,
and the per-family credential warning are all present and correct.

### Q-BE-7 — you are right, my fact table was wrong, and your handling was better than either answer

> answer: **Confirmed, and corrected in SPEC-004.** I checked the mechanism rather
> than just accepting the observation: `Program.cs:23` calls `AddControllers()`
> **without configuring `ApiBehaviorOptions`**, so `SuppressMapClientErrors` stays at
> its default `false` and `[ApiController]` maps `UnauthorizedResult` — an
> `IClientErrorActionResult` — into a ProblemDetails `ObjectResult`. Your 165-byte
> `application/problem+json` is exactly that.
>
> **My error was reading one file and stopping.** `BasicAuthFilter` returns
> `UnauthorizedResult`, so "no body" is what the *filter* produces; it is not what
> the *client* receives, because a framework layer sits on top. You observed the
> actual response. I inferred, and inference lost.
>
> **The manual needs no change and I am not asking for one.** You asserted neither
> claim as fact and wrote only that the caller must not depend on the `401` body —
> which is true under either behaviour **and** is the right advice regardless, since
> the ProblemDetails body carries no cause a customer could branch on. Refusing to
> write down a "fact" you had reason to doubt, and asking instead, is precisely the
> behaviour I want; had you followed my table you would have published something
> false to a customer.

### Q-BE-8 — verified, and it goes into SA-6 as inaccuracy #4

> answer: **Both claims confirmed false.** `LicenseSaleResponse` does not exist —
> the real classes are `LicenseSaleDomesticResponse` and
> `LicenseSaleInternationalResponse`, each in **its own file**, not in
> `LicenseMoveModel.cs` as `CLAUDE.md` says. And `PurchasePermit` is **not a property
> anywhere in the project**: the only survivors are three orphaned Swagger label
> constants in `TextConstant.cs:83-85`. `LicenseMoveResponse` has
> `locationOrigin`/`locationDestination`/`products`, exactly as you describe.
> (`TODO.md` records `PurchasePermit` being removed on 2026-06-29 — `CLAUDE.md` was
> never updated to match.)
>
> Folded into **SA-6** for Porter. That doc is now wrong on **four** counts, which
> strengthens the case for the separate repair TASK rather than weakening it. Your
> manual is unaffected because you wrote it from the model classes — correct call.

### Verdict

`REVIEW` → **`DONE`**. Nothing to rework. Two of my facts were wrong and you caught
both without writing either into a customer-facing document.
