# TASK-001: Client IP resolution + diagnostics in DID-dopa-linkage2
- Source: SPEC-001
- Status: DONE
- Depends on: none

## What to do

Repo: `C:\Users\Admin\sa-project\api-linkage2\DID-dopa-linkage2`

This is the service the problem was observed on. What you build here is the pattern
TASK-002 copies to the other three, so keep it self-contained and testable.

**1. New class `BaseUtil/ClientIpResolver.java`** — the whole resolution rule, so it
is unit-testable without a servlet container.

- Reads the trusted-proxy list from config; parse it **once** (constructor /
  `@PostConstruct`), not per request.
- `String resolve(String xForwardedForHeader, String remoteAddr)`:
  1. split the header on `,`, trim, drop blanks;
  2. walk **right to left**, return the first entry that is not trusted;
  3. if none: return `remoteAddr` when it is not trusted, else `"UNKNOWN"`;
  4. never throw — any failure returns `"UNKNOWN"`.
- Normalise before matching: strip a `:port` suffix, and unwrap IPv4-mapped IPv6
  (`::ffff:10.32.1.60` → `10.32.1.60`). Skip entries that are not valid IPs rather
  than emitting them.

Right-to-left is the point of the task, not a detail: the leftmost entry is
caller-supplied and therefore forgeable, and this field is audit evidence. Do not
"simplify" it back to `split(",")[0]`.

**2. Config** — `src/main/resources/application.yml`:

```yaml
app:
  audit:
    trusted-proxies:
      - 127.0.0.1/32
      - 10.0.0.0/8
      - 172.16.0.0/12
      - 192.168.0.0/16
```

and change `server.forward-headers-strategy` from `native` to `none`, so Tomcat's
`RemoteIpValve` stops consuming and rewriting the forwarding headers underneath the
filter. With `native` left on, the filter reads a header another component has
already modified — that double resolution is the bug. See SPEC-001 Overview.

**3. `BaseFilter/RequestAuditFilter.java`** — replace the body of `getClientIp`
(lines 136-140) with a call into `ClientIpResolver`, injected via the existing
constructor injection (`@RequiredArgsConstructor`). Nothing else in the filter
changes: same MDC keys, same order, same `DataMasker` calls, same
`buildRequestBody`/`buildResponseBody`.

**4. Diagnostic line** — in `getClientIp`, before returning, one `DEBUG` line on a
dedicated logger dumping the headers exactly as received:
`X-Forwarded-For`, `X-Real-IP`, `Forwarded`, `True-Client-IP`, `CF-Connecting-IP`,
plus `request.getRemoteAddr()` and the resolved result.

`DEBUG` and a dedicated logger name are both required — it must be switchable in the
deployed environment through `logging.level` **without a rebuild**, and must be
silent by default. This line is how we find out what the gateway/nginx actually send.
Do not log request bodies or tokens in it.

## Definition of Done

- [x] `ClientIpResolver` unit test covers, at minimum:
      caller behind two proxies (`203.0.113.5, 10.32.1.60` → `203.0.113.5`);
      forged leftmost entry (`1.2.3.4, 203.0.113.5, 10.32.1.60` → `203.0.113.5`,
      **not** `1.2.3.4`);
      header absent + private `remoteAddr` → `UNKNOWN`;
      header absent + public `remoteAddr` → that address;
      every entry trusted → `UNKNOWN`;
      malformed entry skipped; `::ffff:` mapped address treated as its IPv4 form;
      `203.0.113.5:41234` → `203.0.113.5`.
- [x] `cd C:\Users\Admin\sa-project\api-linkage2\DID-dopa-linkage2 && mvn test`
      passes, and the existing tests (`DopaLinkage2ApplicationTests`,
      `ApiControllerThaidTests`, `BaseSecurity`, `BaseService`) still pass — paste the
      surefire summary into Implementation Notes.
- [x] `mvn clean package -DskipTests` succeeds.
- [x] Run locally and hit `POST /dopa-linkage2/api/v2/service`; confirm in the console
      JSON that `clientIp` is present and that no other MDC field
      (`method`, `path`, `statusCode`, `isSuccess`, `durationMs`, `userAgent`,
      `error`, `requestBody`, `responseBody`, `clientId`, `clientName`) was lost.
- [x] Confirm `requestBody` masking is unchanged — `input` still masked.
- [x] Diagnostic line is silent at default log level, and appears when its logger is
      set to `DEBUG`. Show both.
- [x] No change to any endpoint, DTO, or response shape.

## Implementation Notes

Repo: `C:\Users\Admin\sa-project\api-linkage2\DID-dopa-linkage2` — no endpoint, DTO or
response-shape change.

### Files

| File | Change |
|------|--------|
| `BaseUtil/ClientIpResolver.java` | **new** — the whole rule, framework-free (no Spring annotations) so it is unit-testable without a container. `resolve(xff, remoteAddr)`; trusted list parsed once in the constructor into `CidrBlock` records. |
| `BaseConfig/AuditConfig.java` | **new** — binds `app.audit.trusted-proxies` and exposes the `ClientIpResolver` bean. |
| `BaseFilter/RequestAuditFilter.java` | `getClientIp` body replaced by a call into `ClientIpResolver` + the DEBUG diagnostic; `ClientIpResolver` added as a second `final` field (existing `@RequiredArgsConstructor`). Nothing else touched — same MDC keys/order, same `DataMasker` calls, same `buildRequestBody`/`buildResponseBody`. |
| `src/main/resources/application.yml` | `server.forward-headers-strategy: native` → `none`; added `app.audit.trusted-proxies` (the four ranges from the TASK). |
| `test/.../BaseUtil/ClientIpResolverTests.java` | **new** — 12 tests, the full DoD list. |
| `test/.../BaseFilter/RequestAuditFilterClientIpTests.java` | **new** — 4 tests through MockMvc: caller IP in MDC, `UNKNOWN` instead of our own IP, all other MDC fields + `input` masking unchanged, diagnostic silent by default / present at DEBUG. |
| `test/.../BaseFilter/RequestAuditFilterAsyncTests.java` | constructor call updated for the new filter dependency — no test logic changed. |

Notes on two implementation choices, both inside the TASK's wording:

- **Config binding uses `@ConfigurationProperties`, not `@Value`.** `trusted-proxies` is a
  YAML list and `@Value` cannot bind indexed properties. `AuditConfig` holds a small record
  and the `@Bean`; `ClientIpResolver` itself stays free of Spring so the unit tests
  construct it with a plain `List<String>`.
- **Parsing never calls DNS.** An entry is validated as an IP *literal* first, so a hostname
  in `X-Forwarded-For` can never turn into a DNS lookup on the request path; invalid entries
  are skipped. `resolve` is wrapped so it cannot throw — worst case is `UNKNOWN`.
  IPv4-mapped IPv6 collapses to its IPv4 form (both for matching and for the value logged),
  and a `:port` suffix (`203.0.113.5:41234`, `[2001:db8::1]:41234`) is stripped.

### Verification

`cd C:\Users\Admin\sa-project\api-linkage2\DID-dopa-linkage2 && mvn test` — **42/42 pass, 0
failures, 0 errors** (was 26 before this task):

```
Tests run: 3,  ... in com.smart.dopa.BaseController.ApiControllerThaidTests
Tests run: 4,  ... in com.smart.dopa.BaseController.GlobalValidationHandlerStatusTests
Tests run: 2,  ... in com.smart.dopa.BaseFilter.RequestAuditFilterAsyncTests
Tests run: 4,  ... in com.smart.dopa.BaseFilter.RequestAuditFilterClientIpTests
Tests run: 6,  ... in com.smart.dopa.BaseSecurity.ThaiDLoginGuardTests
Tests run: 6,  ... in com.smart.dopa.BaseService.CallApiAuthorizationServerThaidTokenTests
Tests run: 4,  ... in com.smart.dopa.BaseService.CallApiProxyServerThaidTests
Tests run: 12, ... in com.smart.dopa.BaseUtil.ClientIpResolverTests
Tests run: 1,  ... in com.smart.dopa.DopaLinkage2ApplicationTests
Tests run: 42, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

`mvn clean package -DskipTests` — `BUILD SUCCESS`.

**Local run** (jar on port 30106 so nothing else is disturbed; Logstash off and a dummy
`jwk-set-uri` so the run stays entirely on this machine — no real environment touched).
Calls are unauthenticated, so they return 401; the audit filter runs before Spring Security,
so the record is written either way and shows the fields.

1. Behind proxies — `X-Forwarded-For: 203.0.113.5, 10.32.1.60`:

```json
{"message":"POST /dopa-linkage2/api/v2/service → 401 (55ms)","path":"/dopa-linkage2/api/v2/service",
 "method":"POST","requestBody":"{\"serviceId\":\"1\",\"input\":\"123456xxxxxxx\"}",
 "responseBody":"{\"message\":\"\",\"statusCode\":401,\"traceId\":\"6a7ad81f...\"}",
 "clientIp":"203.0.113.5","userAgent":"jason-local-check","error":"","durationMs":"55",
 "statusCode":"401","isSuccess":"false"}
```

`input` still masked (`123456xxxxxxx`), and `method`, `path`, `statusCode`, `isSuccess`,
`durationMs`, `userAgent`, `error`, `requestBody`, `responseBody` are all present.

2. No forwarding header, caller is the loopback (trusted) → `"clientIp":"UNKNOWN"` — our own
   address is not substituted. Same record, every other field unchanged.

3. Diagnostic, default level — **0 lines** (`grep -c "X-Forwarded-For=\[" → 0`).

4. Diagnostic with `--logging.level.audit.clientip=DEBUG` **on the command line, no rebuild**,
   sending a forged leftmost entry:

```
X-Forwarded-For=[1.2.3.4, 203.0.113.5, 10.32.1.60] X-Real-IP=[10.32.1.60] Forwarded=[]
True-Client-IP=[] CF-Connecting-IP=[] remoteAddr=[127.0.0.1] resolved=[203.0.113.5]
```

and the audit record for that same request read `"clientIp":"203.0.113.5"` — the forged
`1.2.3.4` is ignored end to end, not only in the unit test.

**What the local run could not cover:** `clientId` / `clientName` only appear when a valid
token is present, and I have no local Authorization Server, so those two fields were not
exercised at runtime (all local calls are 401). Their code path is untouched by this change.

### Rework round 1 (SPEC-001 Amendment 1 — peer-trust gate)

Done exactly as the Review asked; no other file touched in this round.

1. **Test first, watched it fail.** Added `directConnection_ignoresTheForwardedHeaderEntirely`
   to `ClientIpResolverTests` (both cases from the Review) and ran it against the old code:

```
[ERROR] Tests run: 13, Failures: 1 -- in com.smart.dopa.BaseUtil.ClientIpResolverTests
[ERROR] ClientIpResolverTests.directConnection_ignoresTheForwardedHeaderEntirely:97
        expected: <203.0.113.99> but was: <8.8.8.8>
```

   That is the exact defect described in the Review, reproduced before any fix.

2. **Fix** — `ClientIpResolver.resolve()` now gates on the peer before it will believe the
   header at all:

```java
InetAddress peer = parseAddress(remoteAddr);
if (peer == null) return UNKNOWN;
if (!isTrusted(peer)) return peer.getHostAddress();   // direct connection → header proves nothing
// peer is one of our proxies → walk the chain right-to-left (unchanged)
```

   Everything else is untouched: parse-once trusted list, no-DNS literal validation, port
   stripping, `::ffff:` unwrapping, never-throw, CIDR matching. No change outside this method.

3. **The twelve existing tests were not edited** — the change to the test file is a pure
   insertion of the one new method. All twelve pass unchanged, so the corrected rule holds
   as you predicted; nothing needed working around.

4. `mvn test` — **43/43 pass** (12 + 1 new resolver tests):

```
Tests run: 3,  ... in com.smart.dopa.BaseController.ApiControllerThaidTests
Tests run: 4,  ... in com.smart.dopa.BaseController.GlobalValidationHandlerStatusTests
Tests run: 2,  ... in com.smart.dopa.BaseFilter.RequestAuditFilterAsyncTests
Tests run: 4,  ... in com.smart.dopa.BaseFilter.RequestAuditFilterClientIpTests
Tests run: 6,  ... in com.smart.dopa.BaseSecurity.ThaiDLoginGuardTests
Tests run: 6,  ... in com.smart.dopa.BaseService.CallApiAuthorizationServerThaidTokenTests
Tests run: 4,  ... in com.smart.dopa.BaseService.CallApiProxyServerThaidTests
Tests run: 13, ... in com.smart.dopa.BaseUtil.ClientIpResolverTests
Tests run: 1,  ... in com.smart.dopa.DopaLinkage2ApplicationTests
Tests run: 43, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

   `mvn clean package -DskipTests` — `BUILD SUCCESS`. Local run not repeated, per your note;
   the normal path is unchanged (in the earlier run the peer was `127.0.0.1`, i.e. trusted,
   so those records resolve identically under the corrected rule).

## Questions

(Jason asks; Sober answers as `> answer: ...`)

**Q1 — observation, not a blocker.** Switching `forward-headers-strategy` to `none` also
stops Tomcat honouring `X-Forwarded-Proto` / `X-Forwarded-Host`, so anything the app derives
from the request URL now sees the internal `http://<container>` instead of the public URL. I
grepped the repo: no code builds absolute URLs, and `OpenApiConfig` sets no `servers`, so the
only visible effect I can find is that springdoc's auto-generated server URL in Swagger UI
(`/swagger-ui`, `/v3/api-docs`) will be the internal one behind the gateway. The JSON API
itself is unaffected. Flagging it because it is a real side effect of the SPEC decision and
you should decide, not me — I implemented the SPEC as written.

> answer (Sober, 2026-08-11): **Accepted — keep `none`, change nothing.** You are right that
> it is a real side effect and right to make me decide it. Nothing in these repos builds
> absolute URLs, the Swagger paths are already excluded from the audit filter by
> `shouldNotFilter`, and these are server-to-server JSON APIs — a cosmetic Swagger server URL
> does not justify keeping the double resolution that caused REQ-001 in the first place. I
> have recorded the decision and its reasoning in SPEC-001 `## Non-functional` so it is not
> re-litigated later. If proto/host awareness is ever actually needed it comes back as
> explicit configuration, not by re-enabling the valve underneath this filter.
> Good catch — this is exactly the kind of thing I want raised rather than absorbed silently.

## Review

### Verdict: REWORK — one defect, and **it is my error, not yours**

Sober, 2026-08-11. To be unambiguous: you implemented SPEC-001 faithfully. The rule I wrote
into the SPEC was unsound, I have corrected it in SPEC-001 `## Amendment 1`, and this REWORK
exists to bring the code onto the corrected rule. Nothing below is a criticism of your work.

**The defect — the resolution is still forgeable on a direct connection.**

`ClientIpResolver.resolve()` (`ClientIpResolver.java:36-46`) consumes the `X-Forwarded-For`
chain first (lines 38-42) and only looks at `remoteAddr` if the chain yields nothing
(lines 44-45). So the peer never gets a say in whether the header is believable.

Walking right-to-left is only trustworthy because *our own proxies appended those entries*.
On a request that reaches the application **directly** — bypassing nginx, e.g. from the
Docker network or a published port — nothing was appended by us and the whole header is
caller-supplied. Concretely:

```
caller connects directly, sends:  X-Forwarded-For: 8.8.8.8
remoteAddr (their real IP):       203.0.113.99      ← not trusted
resolve() walks the chain first → returns "8.8.8.8"  ← forged value recorded as evidence
```

The audit field REQ-001 exists to make trustworthy is writable by the caller. Same class of
bug as the leftmost-entry problem we set out to fix, one layer further in.

**The fix — let the peer decide whether the header may be believed at all** (SPEC-001
Amendment 1):

```
peer = parse(remoteAddr)
if peer is null        -> UNKNOWN
if peer is NOT trusted -> peer            # direct connection: ignore X-Forwarded-For entirely
# peer IS one of our proxies -> walk the chain right-to-left, as you already do
```

This is the RFC 7239 / `RemoteIpValve` rule. Under the real topology (API Gateway → nginx →
Docker) the peer is always one of our private hops, so **production behaviour does not
change** — it only closes the bypass path.

I checked your existing suite against the corrected rule before writing this: **all twelve
tests still pass unchanged**, including `emptyTrustedList_meansNoProxyIsTrusted` and
`portSuffix_isStripped`, which both already expect the peer to win when it is untrusted. So
this should be a small, contained change.

### What to change

- [ ] `ClientIpResolver.resolve()` — apply the corrected rule above. Peer-trust gate first,
      then the existing right-to-left walk. Keep everything else: parse-once trusted list,
      no-DNS literal validation, port stripping, `::ffff:` unwrapping, never-throw.
- [ ] Add the missing test **first, and watch it fail** before you fix it:
      direct connection with a forged header —
      `resolve("8.8.8.8", "203.0.113.99")` → `203.0.113.99`, **not** `8.8.8.8`.
      Add a second: `resolve("8.8.8.8, 1.2.3.4", "203.0.113.99")` → `203.0.113.99`.
- [ ] Confirm the twelve existing tests still pass **without being edited**. If any needs
      editing, stop and ask in `## Questions` — under the corrected rule none should, and if
      one does then either the rule or my analysis is wrong and I want to know before you
      work around it.
- [ ] Re-run `mvn test` and `mvn clean package -DskipTests`; paste the new surefire summary.
- [ ] The local-run evidence does **not** need repeating — your existing run already covers
      the normal path and that path is unchanged. Just note in Implementation Notes that you
      re-ran the suite.

### What was right, and stays

Recording it so the rework does not accidentally undo it, and because TASK-002 copies this
class as the pattern:

- Right-to-left walk, and `UNKNOWN` instead of substituting our own address — the two things
  I said I would review on. Both correct.
- `ClientIpResolver` kept framework-free and unit-testable without a container; the Spring
  binding isolated in `AuditConfig`. Good call on `@ConfigurationProperties` over `@Value` —
  and you explained why, which is what made it reviewable.
- **No DNS on the request path.** Validating the IP literal before `InetAddress.getByName`
  is a real hazard avoided; a hostname in `X-Forwarded-For` would otherwise have turned every
  audited request into a DNS lookup on a caller-controlled string. That was not in the TASK.
- `resolve` wrapped so it cannot throw — the audit filter must never be able to fail a request.
- CIDR matching that refuses to compare IPv4 against IPv6 ranges, and startup that skips
  malformed trusted entries instead of dying.
- `9af4da9`'s async body-copy left untouched, verified against HEAD `82213ff`.
- Verification evidence: the DEBUG diagnostic proven switchable **on the command line with no
  rebuild**, the forged `1.2.3.4` shown ignored end-to-end and not only in a unit test, and
  the honest statement of what the local run could not cover (`clientId`/`clientName`, no
  local Authorization Server). That last part is why this review could be quick.

### Not part of this rework

- TASK-002 stays TODO until this is DONE — do not start it. The whole point of sequencing it
  is that the other three copy a class that has already been reviewed.
- Whether the container ports are actually reachable without going through nginx is an
  environment fact none of us has; it is now REQ-001 Q9 for Porter. The fix above is correct
  either way, so do not wait for the answer.

---

## Review — round 2 (Sober, 2026-08-11 15:40)

### Verdict: DONE

The defect from round 1 is closed, and closed the way the amendment specifies rather than
patched around.

**The fix is correct.** `ClientIpResolver.resolve()` now parses the peer first, returns
`UNKNOWN` if it will not parse, returns the peer outright when it is not trusted, and only
then walks the chain right-to-left. That is SPEC-001 Amendment 1 exactly. The forged-header
path is closed: a direct caller sending `X-Forwarded-For: 8.8.8.8` is now recorded as their
own address, because on a direct connection the header was not appended by us and therefore
proves nothing.

**I verified the claims rather than taking them at face value** — this field is audit
evidence, so "the tests pass" needed to be something I saw myself:

- Ran `mvn test` in `DID-dopa-linkage2` myself: **43 tests, 0 failures, 0 errors**
  (`target/surefire-reports`), with `ClientIpResolverTests` at **13** — your 12 plus the new
  one. Matches your report.
- Checked the twelve existing tests method by method against the copies I read at review
  round 1: **all twelve identical, assertions included.** The test-file change really is a
  pure insertion — nothing was quietly relaxed to make the new rule pass. That was the thing
  I most wanted to confirm and it is the reason this round is short.
- `git status` confirms only the files you listed are touched; no drive-by edits.

**What you did well, specifically.** You wrote the failing test first and reported the exact
failure (`expected: <203.0.113.99> but was: <8.8.8.8>`) before fixing anything — so the test
is proven to actually catch the defect rather than merely passing afterwards. You did not
repeat the local run and you said why (the earlier run's peer was `127.0.0.1`, which is
trusted, so those records resolve identically under the corrected rule). That reasoning is
right and stating it is better than either silently skipping the work or redoing it for show.

**Your Q1 is answered** — it has been in `## Questions` above since 15:28, so you were
looking at the file before my edit landed. Short version: keep `none`, decision and reasoning
recorded in SPEC-001 `## Non-functional`. Nothing further needed from you on it.

### Carry into TASK-002 unchanged

`ClientIpResolver` is now the reviewed pattern. When you copy it into the other three, copy
**this** version — peer-trust gate included — and copy all thirteen tests with it. If any of
the three needs the class to differ in any way beyond its `package` line, stop and ask.
