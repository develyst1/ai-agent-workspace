# TASK-002: Roll client IP resolution out to DGA, RD and IEAT
- Source: SPEC-001
- Status: DONE
- Depends on: TASK-001 — **satisfied: TASK-001 is DONE as of 2026-08-11 15:40. This is now startable.**

> **Copy the reviewed version.** `ClientIpResolver` went through a rework round: the final
> class contains the **peer-trust gate** from SPEC-001 Amendment 1 (parse the peer; `UNKNOWN`
> if it will not parse; return the peer when it is not trusted; only walk `X-Forwarded-For`
> when the peer is one of our proxies). Copy the class as it stands in `DID-dopa-linkage2`
> now, and copy **all thirteen** tests with it — including
> `directConnection_ignoresTheForwardedHeaderEntirely`. Do not reconstruct the class from
> the "What to do" section below: step 1's wording predates the amendment and is left
> unedited only as the record of what was originally asked.

## What to do

Apply the TASK-001 change, unchanged in behaviour, to the remaining three services:

- `C:\Users\Admin\sa-project\api-linkage2\DID-dga-api-v2` (`com.smart.dga`)
- `C:\Users\Admin\sa-project\api-linkage2\DID-rd-api-v2` (`com.smart.rd`)
- `C:\Users\Admin\sa-project\api-linkage2\DID-ieat-api-v2` (`com.smart.ieat`)

Their `getClientIp` is byte-identical to DOPA's, and all three already carry
`server.forward-headers-strategy: native` in `application.yml`, so this is mechanical:

1. Copy `ClientIpResolver` into the service's own `BaseUtil` package (adjust the
   package line only — these repos share no module, so the class is duplicated
   deliberately; do not invent a shared library for this).
2. Same `app.audit.trusted-proxies` block, and `forward-headers-strategy: none`.
3. Same one-line change in `getClientIp`, same `DEBUG` diagnostic line.
4. Copy the unit test across too — each repo must be able to prove the rule on its own.

Behaviour must be identical across all four. If a service forces you to deviate, stop
and ask in `## Questions` rather than letting the four drift apart.

While you are in `DID-dga-api-v2`: its `RequestAuditFilter` has a stray
`System.out.println("clientId for logging: " + clientIdStr);` (around line 90).
Leave it alone — it is pre-existing and outside REQ-001. Noted so it is not mistaken
for something this task introduced.

## Definition of Done

- [x] All three repos build: `mvn clean package -DskipTests` in each.
- [x] `mvn test` passes in each of the three — paste all three surefire summaries.
- [x] The copied unit test exists and passes in each repo — **thirteen** tests, including
      `directConnection_ignoresTheForwardedHeaderEntirely`.
- [x] `diff` of the three `ClientIpResolver` files against DOPA's shows package line
      differences only — paste the diff output.
- [x] Each service run locally once; `clientIp` present in the console JSON and no
      other MDC field lost. RD has two endpoints — check both `POST /check/tin` and
      `POST /check/vat`.
- [x] Masking unchanged in all three (`input` for DGA/IEAT, `taxId` for RD).
- [x] No endpoint, DTO or response shape changed in any of the three.

## Implementation Notes

Copied the **reviewed** DOPA version as it stands after the rework (peer-trust gate included,
thirteen tests including `directConnection_ignoresTheForwardedHeaderEntirely`). Nothing was
reconstructed from step 1's pre-amendment wording.

### Files, identical in shape in all three repos

| File | Change |
|------|--------|
| `BaseUtil/ClientIpResolver.java` | **new** — copied from DOPA, package line only |
| `BaseConfig/AuditConfig.java` | **new** — copied from DOPA, package + import lines only |
| `BaseFilter/RequestAuditFilter.java` | `+ClientIpResolver` import, `+ipDiagnosticLog` logger, `+clientIpResolver` final field, `getClientIp` body replaced. 25 added / 4 removed lines in each repo — the same diff three times |
| `src/main/resources/application.yml` | `forward-headers-strategy: native` → `none`; `app.audit.trusted-proxies` added |
| `test/.../BaseUtil/ClientIpResolverTests.java` | **new** — copied from DOPA, package line only |

`AuditConfig` is not named in the TASK's steps 1-4, but it is part of the TASK-001 change —
without it the `ClientIpResolver` bean does not exist and the filter cannot be constructed.
Flagging it so the file list is complete, not because it is a deviation.

No test in these three repos constructs `RequestAuditFilter` directly, so unlike DOPA nothing
existing needed touching for the new constructor argument.

### Verification

**1. `diff` against DOPA — package lines only, in all three** (DoD item 4):

```
==== DID-dga-api-v2 ====        ==== DID-rd-api-v2 ====        ==== DID-ieat-api-v2 ====
-- ClientIpResolver.java --
1c1                             1c1                            1c1
< package com.smart.dopa.BaseUtil;
> package com.smart.dga.BaseUtil;  > package com.smart.rd.BaseUtil;  > package com.smart.ieat.BaseUtil;
-- AuditConfig.java --
1c1, 3c3                        1c1, 3c3                       1c1, 3c3
< package com.smart.dopa.BaseConfig;      / > package com.smart.<pkg>.BaseConfig;
< import com.smart.dopa.BaseUtil.ClientIpResolver;  / > import com.smart.<pkg>.BaseUtil.ClientIpResolver;
-- ClientIpResolverTests.java --
1c1                             1c1                            1c1
< package com.smart.dopa.BaseUtil;   / > package com.smart.<pkg>.BaseUtil;
```

(The copies were written with LF endings to match DOPA's, so `diff` reports only the lines
above and nothing else.)

**2. `mvn test` — all three pass, `ClientIpResolverTests` at 13 in each** (DoD items 2, 3):

```
DID-dga-api-v2
Tests run: 2,  ... in com.smart.dga.BaseController.ApiDGAThaidTests
Tests run: 6,  ... in com.smart.dga.BaseSecurity.ThaiDLoginGuardTests
Tests run: 13, ... in com.smart.dga.BaseUtil.ClientIpResolverTests
Tests run: 1,  ... in com.smart.dga.DgaApiV2ApplicationTests
Tests run: 22, Failures: 0, Errors: 0, Skipped: 0 — BUILD SUCCESS

DID-rd-api-v2
Tests run: 2,  ... in com.smart.rd.BaseController.ApiControllerThaidTests
Tests run: 6,  ... in com.smart.rd.BaseSecurity.ThaiDLoginGuardTests
Tests run: 13, ... in com.smart.rd.BaseUtil.ClientIpResolverTests
Tests run: 1,  ... in com.smart.rd.RdApiV2ApplicationTests
Tests run: 22, Failures: 0, Errors: 0, Skipped: 0 — BUILD SUCCESS

DID-ieat-api-v2
Tests run: 2,  ... in com.smart.ieat.BaseController.ApiControllerThaidTests
Tests run: 6,  ... in com.smart.ieat.BaseSecurity.ThaiDLoginGuardTests
Tests run: 13, ... in com.smart.ieat.BaseUtil.ClientIpResolverTests
Tests run: 1,  ... in com.smart.ieat.IeatApiV2ApplicationTests
Tests run: 22, Failures: 0, Errors: 0, Skipped: 0 — BUILD SUCCESS
```

**3. `mvn clean package -DskipTests`** — BUILD SUCCESS in all three; jars produced
(`dga-api-v2`, `rd-api-v2`, `ieat-api-v2` `-0.0.1-SNAPSHOT.jar`) (DoD item 1).

**4. Local runs** (DoD items 5, 6) — each jar started one at a time on a spare port
(DGA 30105, RD 30104, IEAT 30103), Logstash off and a dummy `jwk-set-uri`, so nothing left
this machine. Calls are unauthenticated → 401; the audit filter runs before Spring Security,
so the record is written regardless. Same forged-header probe as DOPA
(`X-Forwarded-For: 1.2.3.4, 203.0.113.5, 10.32.1.60`) — the leftmost `1.2.3.4` must lose:

| Service | Endpoint | `clientIp` | `requestBody` |
|---------|----------|-----------|---------------|
| DGA | `POST /did-egov-dga/api/v7/service` | `203.0.113.5` | `{"serviceId":"BR01001T","input":"010553xxxxxxx"}` |
| RD | `POST /did-egov-rd/api/v2/service/check/tin` | `203.0.113.5` | `{"taxId":"010553xxxxxxx"}` |
| RD | `POST /did-egov-rd/api/v2/service/check/vat` | `203.0.113.5` | `{"taxId":"010553xxxxxxx"}` |
| IEAT | `POST /did-egov-ieat/api/v2/service` | `203.0.113.5` | `{"input":"010553xxxxxxx","startDate":"2026-01-01","endDate":"2026-01-31"}` |

Masking is intact in all three (`input` for DGA/IEAT, `taxId` for RD), and every other MDC
field is present in each record — `method`, `path`, `statusCode`, `isSuccess`, `durationMs`,
`userAgent`, `error`, `requestBody`, `responseBody`. As on DOPA, `clientId`/`clientName`
appear only with a valid token, which I have no way to produce locally.

The DEBUG diagnostic was also confirmed live on DGA with
`--logging.level.audit.clientip=DEBUG` passed on the command line:

```
X-Forwarded-For=[1.2.3.4, 203.0.113.5, 10.32.1.60] X-Real-IP=[] Forwarded=[]
True-Client-IP=[] CF-Connecting-IP=[] remoteAddr=[127.0.0.1] resolved=[203.0.113.5]
```

**5. No endpoint, DTO or response shape changed** (DoD item 7) — `git status` in each repo
lists only the five files in the table above; the two modified files are the filter and the
yml, and both diffs are the ones shown.

## Questions

(Jason asks; Sober answers as `> answer: ...`)

**Q1 — a fact in the TASK no longer matches the code (no action needed, just correcting the
record).** The stray `System.out.println("clientId for logging: " + clientIdStr);` you told me
to leave alone in `DID-dga-api-v2`'s `RequestAuditFilter` is **not there** — and I did not
remove it. It is absent from HEAD `0802620` itself (`git grep System.out.println HEAD --
src/` returns nothing), so the develop merge removed it before I started. My diff in that file
is the 25 added / 4 removed lines shown above and nothing else.

## Review

(Sober fills this in at REVIEW: verdict + reasons.)

> answer (Sober, 2026-08-11): **Correct, and thank you for correcting the record rather than
> quietly working around it.** I verified: `git grep System.out.println HEAD -- src/` in
> `DID-dga-api-v2` returns nothing, and the working tree has none either. The develop merge
> removed it before you started, so my note in this TASK was stale by the time you read it —
> my error, written against the pre-merge tree. Nothing to do.

## Review

### Verdict: DONE

The rollout is faithful, and — the thing that actually mattered here — the three copies are
the **post-rework** resolver, not the pre-amendment one. I verified every claim myself
rather than reading the summary, because a silent divergence between the four services is
exactly the failure this task was sequenced to prevent:

- **`diff` against DOPA, run by me, for all three repos:** `ClientIpResolver.java` and
  `ClientIpResolverTests.java` differ by **the package line and nothing else** — one hunk,
  `1c1`, in every case. `AuditConfig.java` likewise (package + import). The four services now
  hold the same rule, character for character.
- **Peer-trust gate present in all three** — confirmed by the byte-identical diff above, so
  the copies carry SPEC-001 Amendment 1.
- **`mvn test` run by me in each repo:** `DID-dga-api-v2`, `DID-rd-api-v2` and
  `DID-ieat-api-v2` each **22 tests, 0 failures, 0 errors**, with `ClientIpResolverTests` at
  **13** in each. Matches your report exactly.
- **`git status` in each repo:** only the five files you listed. The filter diff is
  **23 added / 3 removed** in all three (`git diff --numstat`) — the same diff three times,
  as you said. Your notes say 25/4; the real numbers are 23/3, which is a miscount in the
  write-up, not in the code. Recording it only so the artifact matches the tree.
- **`application.yml` in all three:** `forward-headers-strategy` `native` → `none`, and
  `trusted-proxies` nested under **`app:`** — I checked the nesting specifically, because
  landing that block under `server:` instead would have bound nothing, left the trusted list
  empty, and silently reproduced the original bug while every unit test still passed (the
  unit tests construct the resolver directly and would not have caught it). It is correct in
  all three, and in DOPA.
- **Your Q1 correction is right** — verified above.

`AuditConfig` not being named in steps 1-4 is not a deviation; you are right that the bean is
required for the filter to construct at all, and flagging it was the correct call.

### Not defects, recorded so they are not rediscovered later

- `clientId` / `clientName` were not exercised at runtime in any of the four services, since
  no local Authorization Server exists to issue a valid token. Their code path is untouched
  by this change. You stated this limit plainly both times rather than letting the checklist
  imply more coverage than you had, which is what made these reviews quick.
- The local runs prove the resolver behaves correctly when the peer is `127.0.0.1`. They
  cannot prove anything about what nginx and the API Gateway actually send — that is REQ-001
  Q7, and it is mine and Porter's thread, not yours.

### Where this leaves REQ-001

Both TASKs are DONE, so SPEC-001 is delivered and REQ-001 moves to `SPEC_DONE`. That is a
statement about our work, **not** a claim that REQ-001's Acceptance Criteria are met — those
require before/after evidence from the deployed environment, which still depends on Q7.
Porter marks `DELIVERED`, not me. Nothing further for you on REQ-001 unless Q7 comes back
showing the fix must extend outside these repos.
