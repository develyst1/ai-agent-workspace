# SPEC-004: Customer-facing usage manual for the LK2 API
- Source: REQ-004
- Status: ACTIVE

## Overview

One Thai-language Markdown file for the customer's technical team, describing how
to call the deployed LK2 API from its Swagger page. No code changes anywhere.

The whole risk in this REQ is **writing down something the code does not do**.
Porter flagged that `DidSpf.WebApi.LK2/CLAUDE.md` overstates the header rules, and
asked me to verify against the code rather than the docs. I did. **Porter was
right, and there is more divergence than he found** — plus one place where the
REQ's own description understates the API. All of it is in the fact table below,
which is the single source of truth for TASK-004. **The writer must copy from this
table, not from `CLAUDE.md`, `DATA-MAPPING.md`, or Swagger's `Required` flags.**

## The authoritative fact base (SA verified against source, 2026-09-10)

### Header rules — `Middleware/RequestAuditMiddleware.cs:68-73`

All four are checked in the middleware, **before** any controller runs. Failure is
`400`, never `401`.

| Header | What the code **actually** enforces | What `CLAUDE.md` claims |
|---|---|---|
| `Authorization` | non-empty **and** must start with `Basic ` (case-insensitive) | same — accurate |
| `X-Office-Request` | **non-empty only** | "must be an integer" — **NOT enforced** |
| `X-User-Request` | **non-empty only** | "13-digit citizen ID" — **NOT enforced** |
| `User-Agent` | **non-empty only** | — |

Two further findings, both mine, neither in `CLAUDE.md`:

- **`X-Office-Request` is parsed as an integer only to populate the log field**
  (`int.TryParse(xOffice, out …) ? parsed : null`, line 92). A non-numeric value
  **passes the request through** and merely logs `officeId: null`. It is not
  validation.
- **`Configurations.UserAgentPrefix` (`"Linkage Center 2/"`) is dead config.** It is
  bound to `ConfigurationsModel.UserAgentPrefix` and **read nowhere in the
  codebase** — I grepped the whole project. Any `User-Agent` string passes.

**How the manual must handle this** (REQ-004's own rule: stricter is harmless,
looser is not): tell the customer to send an integer office id and a 13-digit
citizen id **as the expected contract**, and do **not** state that the API
validates or rejects otherwise. Never write "must be 13 digits or you get an
error" — that is a promise the code does not keep. Never document
`UserAgentPrefix` as a requirement.

### Endpoints and parameters — read from each controller, not from a neighbour

Ten licence families × 3 variants = 30 endpoints. Every one is `GET`. Base URL is
`https://e-connect-did.mod.go.th/service-did-dopa`, routes appended as
`/api/v1/<endpoint>`. **`/servicelk2` must not appear in the manual** (REQ-004 Q4-2).

| Endpoint family | Basic-auth section | `licenseNo` | `traderName` / `personalId` |
|---|---|---|---|
| `license-import` | `LicenseImport` | **mandatory** | ≥1 required |
| `license-move` | `LicenseMove` | **mandatory** | ≥1 required |
| `license-sale-domestic` | `LicenseSaleDomestic` | **mandatory** | ≥1 required |
| `license-sale-international` | `LicenseSaleInternational` | **mandatory** | ≥1 required |
| `license-export` | `LicenseExport` | not accepted | ≥1 required |
| `license-transit` | `LicenseTransit` | not accepted | ≥1 required |
| `license-yp2` | `LicenseYp2` | not accepted | ≥1 required |
| `license-yp3` | `LicenseYp3` | not accepted | ≥1 required |
| `license-yp4` | `LicenseYp4` | not accepted | ≥1 required |
| `license-yp5` | `LicenseYp5` | not accepted | ≥1 required |

**Correction to REQ-004 item 5, which understates the API.** The REQ says the first
four *"accept `licenseNo` as well as `traderName`/`personalId`"*. In the code
`licenseNo` is **mandatory** on those four — omit it and you get
`400 "กรุณาระบุเลขที่หนังสืออนุญาต"` (`REQUIRE_LICENSE_NO`) **before** the
trader/personal check runs. A customer following the REQ's wording would send only
`traderName` and get a 400 they were told not to expect. The manual must say
mandatory. *(Do not be misled the other way either: Swagger shows
`Required = true` on `licenseNo` for those four, but the C# parameter still
defaults to `""` — the enforcement is the explicit check in `GetData`, not model
binding.)*

**The `-sandbox` variants enforce the identical validation** — same
`REQUIRE_LICENSE_NO` and same "at least one of" rule. Only `-health-check` takes no
parameters and skips all validation.

Variant meanings, per `GetData`'s switch:
- `<endpoint>` → real data from Oracle
- `<endpoint>-sandbox` → three fixed dummy rows, same response shape
- `<endpoint>-health-check` → **always an empty `data` array**, no parameters, no
  validation. It proves the service is up; it is not a data query.

### Response shapes — three different envelopes, which the manual must not blur

| Case | HTTP | Body shape |
|---|---|---|
| Success (incl. no match) | `200` | `ResponseResult` → `responseCode: "000"`, `message: "success"`, `data: [ … ]` |
| Validation failure (missing `licenseNo` / no trader-or-personal) | `400` | `ValidationErrorResponse` → `message`, `errors`, `traceId` (`missingHeaders` empty) |
| Missing/invalid headers | `400` | same `ValidationErrorResponse`, but **`missingHeaders` lists the offending header names** |
| Bad credential | `401` | ~~**no body at all**~~ → **a `application/problem+json` ProblemDetails body** — see correction |

> **CORRECTION — Sober, 2026-09-10 (Q-BE-7). My `401` row was wrong.**
> I read `BasicAuthFilter`'s `UnauthorizedResult` and concluded "no body". That is
> what the filter *returns*, but not what the client *receives*: `Program.cs:23`
> calls `AddControllers()` **without configuring `ApiBehaviorOptions`**, so
> `SuppressMapClientErrors` keeps its default of `false`, and `[ApiController]`
> maps `UnauthorizedResult` (an `IClientErrorActionResult`) into a **ProblemDetails
> `ObjectResult`**. Jason observed exactly that on a live run: a 165-byte
> `application/problem+json`. **He observed; I inferred from one file and missed the
> framework layer sitting on top of it.**
>
> **The manual's wording does not need to change**, and this is why his handling was
> right: he asserted *neither* claim as fact and wrote only that the caller must not
> depend on the `401` body. That is true under either behaviour, and it remains the
> correct advice — the ProblemDetails body carries no cause information a customer
> could act on, so branching on it would be a bug in their client.

Sources: `Utils/ResponseResult.cs`, `Utils/ModelStateHelper.cs`,
`Controllers/BaseController.cs`. `responseCode "000"` is
`ResponseStatusCode.OK` (`DidSpf.Helper/TextConstants/ResponseStatusCode.cs:6`).
JSON is camelCase.

**The empty-result point (REQ-004 item 6 — the most likely support question):**
a search that matches nothing returns **`200` with `responseCode: "000"`,
`message: "success"` and `data: []`**. It is *not* an error, not a `404`, and does
not use the `"004" DATA_NOT_FOUND` code that exists elsewhere in the solution. The
manual must state this in its own short section, not as a footnote.

### Basic auth — the part that surprises people (REQ-004 item 3)

Every licence family has its **own** `appsettings.json` section, and the
`[BasicAuth("…")]` attribute on each controller names it. In the current file all
sections share the **same username** and differ **only by password**, so a customer
who receives one password and tries it on a second endpoint gets a `401` that looks
like a broken credential. The manual must state plainly: **one credential per
licence family; the username may look identical, the password is what differs.**

**No credential value goes in the document** (REQ-004 item 8 + constraint). Describe
the mechanism and say the stakeholder issues the passwords. Do not include the
`LicenseTransit` password, and do not name internal section keys as if the customer
sends them — **the section key is server-side only; the caller never transmits it.**

## Flow

Not applicable — documentation only. The pipeline order the manual should reflect
when explaining failures: path base → header check (`400`) → Basic auth (`401`) →
controller parameter validation (`400`) → data. That order is why a missing header
never produces a `401`, which is worth one sentence for the customer's debugging.

## Non-functional

- **Thai prose; identifiers in English** (REQ-004 Q4-1) — endpoint paths, header
  names, query parameters and JSON field names exactly as the API spells them.
- **Plain Markdown**: headings, short paragraphs, tables, fenced code blocks. No
  HTML, no images, no diagram syntax — the stakeholder generates the PDF.
- **Read-only API**: every endpoint is a `GET`; say so plainly (Q4-2).
- **External audience.** Nothing about this team, REQ/TASK numbers, the
  `LicenseShipment`→`LicenseTransit` rename, Linkage Management, `service_code`, or
  the `STATUS=30`/`STATUS=40` data situation.
- **What is NOT locally verifiable, and must not be invented.** The two
  `REQUIRE_*` `400` bodies come from inside the controller, and the controller
  cannot be constructed without a reachable Oracle (`UnitOfWorkELicensing`'s ctor
  opens the connection). So those exact bodies are **not observable** on a dev
  machine. The **missing-header `400` is** observable (middleware runs first), as is
  the `401`. TASK-004 therefore asks for the observable ones to be observed and the
  rest to be transcribed from source with a marker, never guessed. This is me not
  repeating the TASK-001 mistake of specifying a check nobody can run.

## Tasks

- TASK-004: Write the customer manual (depends on: —)

A later TASK will slot REQ-005's **observed** examples into the placeholders once
the stakeholder returns output; that is not this TASK and not TASK-005 either.

## Out of Scope

- Any code change. Any credential value. Generating the PDF.
- Real example values — REQ-005 / SPEC-005. This manual leaves marked placeholders.
- Fixing the `CLAUDE.md` divergences found above. **I am deliberately not folding a
  doc-repair into a customer-manual TASK** — see Question SA-6.

## Questions

- **SA-6 (Sober → Porter, open, NON-BLOCKING) — the internal `CLAUDE.md` is wrong
  and will mislead the next reader.** Verifying REQ-004's facts turned up three
  inaccuracies in `DidSpf.WebApi.LK2/CLAUDE.md`: it claims `X-Office-Request` is
  validated as an integer and `X-User-Request` as a 13-digit citizen ID (**neither
  is** — non-empty only), and it presents `UserAgentPrefix` as part of the pipeline
  when the value is **read nowhere**. Porter spotted the first two while scoping;
  the dead config is mine.

  The customer manual will be correct regardless, because TASK-004 writes from the
  table above. But `CLAUDE.md` is what every future agent and developer reads first
  — it is how this error propagates. **Recommendation: a small separate TASK to
  correct those three statements** (plus a note that `UserAgentPrefix` is unused, so
  nobody "fixes" the config by enforcing it). I have not folded it into TASK-004
  because a customer-facing document and an internal-doc repair have different
  reviewers and different risk, and bundling them hides the second one.
  Not blocking: TASK-004 proceeds either way.
