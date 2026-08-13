# SPEC-001: Record the originating caller's IP in the audit log
- Source: REQ-001
- Status: ACTIVE again (2026-08-11 16:05 — **reopened by me**; TASK-001/002 remain DONE, but new
  evidence arrived after I closed this and it adds TASK-003. See Amendment 2.)

## Amendment 2 (2026-08-11, Sober) — reopened after the did-047 reference landed

I set this SPEC to DONE at 15:58. Porter then delivered the stakeholder's substitute answer
to Q7/Q8/Q9: a fix another Smart-Alliance team shipped on 2026-08-07 for the same symptom
(`did-047-api-management-sso` `c5c4650`, diff in
`../project-docs/2026-08-11-reference-did047-client-ip-fix.patch`). Reading it changes two
things, so I am reopening rather than leaving a SPEC marked DONE that I no longer believe is
complete. TASK-001 and TASK-002 stay DONE — nothing shipped is wrong; this adds to it.

### What the reference confirms (independent corroboration, not new design)

Their resolver walks `X-Forwarded-For` **right to left** for exactly the reason SPEC-001
gives — the leftmost entry is client-supplied and forgeable. They strip ports, unwrap
`::ffff:`, handle bracketed IPv6, and log the headers at `DEBUG` to discover what actually
arrives. Same diagnosis, same shape, arrived at independently. That is good news for our
direction.

Their class javadoc also states outright that if nginx sends neither header, the caller's IP
never reaches the service and only `proxy_set_header` at nginx can fix it — the same
conclusion I put in "What this SPEC cannot fix".

### What the reference tells us that we did not know — this is the valuable part

**(a) A dated observation that nginx is not currently forwarding the caller.** Their test
`forwardedForWithOnlyContainerHops_fallsBackToRemoteAddr` carries the comment
*"เคสที่เห็นบน UAT ตอนนี้: nginx ไม่ส่ง IP จริงมา"* — on UAT, as of 2026-08-07, nginx did not
send the real IP; only container hops arrived. If that holds for our vhosts too, then
**REQ-001 Q7(a) is effectively already answered**, our four services will log `UNKNOWN` after
deployment, and the remaining fix is an nginx configuration change outside these repos. It is
a sibling service and possibly a different vhost, so this is strong evidence, not proof.

**(b) They read `X-Real-IP` first, and we do not read it at all.** nginx commonly sets
`X-Real-IP $remote_addr` even where `X-Forwarded-For` is missing or useless. In precisely the
situation (a) describes, `X-Real-IP` may be the only header carrying the answer — and
SPEC-001 currently ignores it. That is a real gap, and it is the difference between REQ-001
being fixed by our change and being fixed only after someone edits nginx.

**(c) They deliberately exclude `10.0.0.0/8` and `192.168.0.0/16` from "infrastructure",**
with the comment that their users sit on the internal LAN. Our `trusted-proxies` currently
contains both ranges. If our callers are also internal users, our resolver would treat a
genuine caller as a trusted hop, skip them, and log `UNKNOWN` — safe but wrong for REQ-001's
first Acceptance Criterion. **I am not changing those values on a guess**: whether our
callers can be internal is REQ-001 Q8(b), now sharpened into Q10.

### Where our design is stronger, and stays

Recording this so nobody "aligns" us to the reference and reintroduces what we fixed:

- **They have no peer-trust gate.** `resolve()` reads `X-Real-IP` and `X-Forwarded-For` with
  no notion of whether the request arrived through a proxy at all, so on a direct connection
  a forged `X-Real-IP: 8.8.8.8` wins outright. That is exactly the defect I caught in
  TASK-001 review round 1 (Amendment 1). We keep our gate; any `X-Real-IP` support goes
  **inside** the trusted-peer branch.
- **They fall back to `remoteAddr` — the container's own address — and record it as the
  caller.** Their own test asserts that. That is the silent substitution REQ-001 requirement 3
  forbids, and it would still produce exactly the misleading record the stakeholder
  complained about. We keep `UNKNOWN`.
- Their `isInfrastructure` is string-prefix matching; ours is real CIDR matching from
  configuration. Ours is narrower and changeable without a rebuild.

### Change to the design

Read `X-Real-IP` as an additional source, **only when the peer is trusted**, and only as a
fallback when the `X-Forwarded-For` walk yields nothing:

```
peer = parse(remoteAddr)
if peer is null                 -> UNKNOWN
if peer is NOT trusted          -> peer                    # unchanged (Amendment 1)
walk X-Forwarded-For right-to-left; first non-trusted entry -> that entry   # unchanged
realIp = parse(X-Real-IP);  if realIp is not null and NOT trusted -> realIp # NEW
return UNKNOWN
```

`X-Forwarded-For` stays ahead of `X-Real-IP`: XFF preserves the whole chain, whereas
`X-Real-IP` is a single value that an intermediate hop may have overwritten with its own
address. Strictly additive — when the header is absent, behaviour is identical to today.
Implemented by **TASK-003**.

> **What DONE means here.** The design is implemented and reviewed in all four services.
> It does **not** mean REQ-001 is satisfied: the Acceptance Criteria require before/after
> evidence from the deployed environment, which depends on REQ-001 Q7. If Q7 shows that
> nginx or the API Gateway overwrites `X-Forwarded-For` rather than appending to it, the
> deployed log will read `UNKNOWN` — correctly, per requirement 3 — and the remaining fix
> is a configuration change outside these repos, which belongs to Porter.

## Amendment 1 (2026-08-11, Sober) — the resolution rule was forgeable. My error.

The original Flow below walked `X-Forwarded-For` right-to-left **without first checking
whether the request actually arrived through one of our proxies**. That is unsound, and
TASK-001 implemented it faithfully, so the defect is in this SPEC, not in the
implementation.

Walking from the right is only trustworthy because *our own proxies appended those
entries*. If a caller reaches the application **directly** — bypassing nginx, e.g. on the
Docker network or via the published port — then nothing was appended by us, the entire
header is caller-supplied, and the rightmost entry is just as forged as the leftmost one.
A caller connecting directly with `X-Forwarded-For: 8.8.8.8` would be recorded as
`8.8.8.8`. For the field REQ-001 exists to make trustworthy, that is a hole.

**Corrected rule — the peer decides whether the header may be believed at all:**

```
peer = parse(remoteAddr)
if peer is null                 -> UNKNOWN
if peer is NOT trusted          -> peer          # direct connection: ignore X-Forwarded-For entirely
                                                # (it was not appended by us, so it proves nothing)
# peer IS one of our proxies -> the header was built by our chain, so walk it right-to-left
for entry in chain, right to left:
    if entry is NOT trusted     -> entry
return UNKNOWN
```

This is the RFC 7239 / `RemoteIpValve` rule: start from the peer and only step back through
hops you trust. Under the documented topology (API Gateway → nginx → Docker) the peer is
always one of our private hops, so **production behaviour is unchanged** — this closes the
bypass path, it does not alter the normal path. All twelve of TASK-001's existing unit tests
still hold under the corrected rule; it needs one added case (direct connection + forged
header → the peer wins).

Whether the published container ports are in fact reachable without going through nginx is
an environment fact I do not have — it is now REQ-001 Q9. The hardening is cheap and correct
either way, so it does not wait for the answer.

Everything else in this SPEC stands as written.

## Post-merge re-verification (2026-08-11, Sober)

Porter relayed at 14:43 that `develop` was merged after this SPEC was written. Re-read the
four services at the new HEADs. **The SPEC's premise survives unchanged:**

- `getClientIp()` is still byte-identical in all four services — the merge did not touch it
  (`DID-dopa-linkage2` HEAD `82213ff`: `RequestAuditFilter.java:191-195`; same body in
  `dga`/`rd`/`ieat`).
- All four still set `server.forward-headers-strategy: native`, so the double-resolution
  diagnosis is unchanged.
- `9af4da9` (copy response body after async dispatch) restructured `RequestAuditFilter`
  around async dispatch but left `getClientIp` alone. It changes *when* the audit record is
  written, not *how* the IP is derived — no impact on this SPEC. TASK-001 must not disturb it.
- `c077c7b` ("route DGA calls through the whitelisted nginx front-end") is about our
  **outbound** egress to DGA, not the inbound caller, so it does not affect this SPEC. It
  does confirm independently that an nginx front-end sits in the path and that DGA sees our
  egress as `210.246.94.2` — consistent with the topology in REQ-001 Q2.

## Overview

REQ-001 assumes the services never look at forwarding headers. **They already do.**
Reading the real code changes the diagnosis, so this SPEC starts from what the code
actually does.

`RequestAuditFilter.getClientIp()` is **byte-identical in all four services**:

```java
// DID-dopa-linkage2/.../BaseFilter/RequestAuditFilter.java:136-140  (same in dga/rd/ieat)
private String getClientIp(HttpServletRequest req) {
    String forwarded = req.getHeader("X-Forwarded-For");
    if (forwarded != null && !forwarded.isBlank()) return forwarded.split(",")[0].trim();
    return req.getRemoteAddr();
}
```

and all four `application.yml` set `server.forward-headers-strategy: native`.

That combination is the core problem. Two independent IP resolutions run per request:

1. **Tomcat `RemoteIpValve`** (switched on by `forward-headers-strategy: native`)
   consumes the forwarding headers, rewrites `getRemoteAddr()` to the resolved
   client, and **modifies/removes the `X-Forwarded-For` header** as it consumes it.
2. **Our filter**, which runs *after* the valve, then re-reads the raw
   `X-Forwarded-For` header and, when anything is left in it, **overrides** the
   valve's answer with `split(",")[0]` — the leftmost entry.

So the filter cannot tell whether it determined the caller or just re-read a
leftover proxy address, and it silently falls back to `getRemoteAddr()` — which,
with no usable header, is the nginx/Docker peer. That is exactly the reported
symptom: recorded IP `10.32.1.60`, a private address.

Two further defects in the same three lines, both independent of topology:

- **Leftmost `X-Forwarded-For` is caller-controllable.** Any client may send
  `X-Forwarded-For: 1.2.3.4` and that value lands in the audit log verbatim. For a
  government data-access accountability trail this is a forgeable evidence field.
  The correct value is the **rightmost entry that is not a trusted proxy**.
- **Silent substitution.** When the caller cannot be determined the filter logs our
  own address as if it were the caller — REQ-001 requirement 3 forbids exactly this.

### Approach

Make the four services resolve the client IP in **one place, deterministically**:

- Turn the double resolution off — `server.forward-headers-strategy: none` — so the
  filter is the single authority and its answer is not built on a header another
  component has already rewritten.
- Resolve **right-to-left** over `X-Forwarded-For` against a configured trusted-proxy
  list; the first non-trusted address is the caller.
- When every entry is trusted, or the header is absent, log the literal string
  `UNKNOWN` — never our own address.

Chosen over the alternative (keep the valve, delete the filter's XFF branch, rely on
`getRemoteAddr()`) because after the valve has run, the filter can no longer tell
"resolved the real caller" apart from "no header arrived" — and REQ-001 requirement 3
requires exactly that distinction.

### What this SPEC cannot fix

If nginx and the API Gateway do **not** append the caller to `X-Forwarded-For`, no
change inside these four repos can recover the caller's IP — the information never
reaches the application. In that case this SPEC's value is that the log will read
`UNKNOWN` instead of a misleading `10.32.1.60`, and the real fix is a configuration
change on the gateway/nginx hop, which per REQ-001 Constraints goes back to Porter.
`REQ-001 Q7` (DATA REQUEST) is what decides this branch.

## API / Interface Design

No public API change. No request/response DTO change. No new endpoint.

Audit field `clientIp` (MDC → logback `<mdc/>` → Logstash) keeps its name and type;
only how the value is derived changes, plus the new `UNKNOWN` sentinel.

New configuration key, same in all four services:

```yaml
app:
  audit:
    trusted-proxies:            # CIDR or exact IP; hops we sit behind
      - 127.0.0.1/32
      - 10.0.0.0/8
      - 172.16.0.0/12
      - 192.168.0.0/16
```

Defaults above are the RFC1918 + loopback ranges, so the change is deployable before
the exact gateway/nginx addresses are known. Narrow it to the real addresses once
REQ-001 Q7 is answered — a wide list is safe for correctness here (a trusted hop is
skipped over) but a hop wrongly listed as trusted would let a caller on that range be
skipped, so tighten it when the facts land.

## Data Model

None. No database, no migration, no persisted schema. Log fields only.

## Flow

> **Superseded by Amendment 1 at the top of this SPEC** — steps 1-3 below are missing the
> peer-trust gate. Build Amendment 1's rule; the edge cases below still all apply.

Per request, inside `RequestAuditFilter`:

1. Read `X-Forwarded-For`. Split on `,`, trim, drop blanks.
2. Walk the list **right to left**; return the first entry that is not matched by
   `app.audit.trusted-proxies`.
3. If the list is empty or every entry is trusted:
   - if `getRemoteAddr()` is not trusted, return it (direct call, no proxy in front);
   - otherwise return `"UNKNOWN"`.
4. Put the result in MDC `clientIp` exactly as today.

Edge cases:

- Header absent → step 3.
- Malformed entry (not a valid IP) → skip it and keep walking; never emit garbage.
- IPv6 and IPv4-mapped IPv6 (`::ffff:10.32.1.60`) → normalise before matching, so a
  mapped private address is still recognised as trusted.
- Port suffix on an entry (`203.0.113.5:41234`) → strip the port before matching.
- Resolution must never throw: any failure ⇒ `"UNKNOWN"`, and the request still
  completes and is still logged. The audit filter must not be able to fail a request.

## Non-functional

- **Security / integrity.** `clientIp` is evidence. Right-to-left resolution against a
  trusted list is what makes it non-forgeable by the caller; leftmost-entry parsing
  must not come back.
- **Honesty over completeness.** `UNKNOWN` is a correct audit value; our own IP
  presented as the caller's is not.
- **No regression.** Every other MDC field (`method`, `path`, `statusCode`,
  `isSuccess`, `durationMs`, `userAgent`, `error`, `requestBody`, `responseBody`,
  `clientId`, `clientName`) and all `DataMasker` behaviour stay exactly as they are.
  `requestBody` masking is verified untouched.
- **Diagnostics.** A `DEBUG`-level line on a dedicated logger dumping the raw
  forwarding headers as received (`X-Forwarded-For`, `X-Real-IP`, `Forwarded`,
  `True-Client-IP`, `CF-Connecting-IP`) plus `getRemoteAddr()`. `DEBUG`, so it is off
  by default and can be switched on in the deployed environment via `logging.level`
  without a rebuild. This is what produces the evidence REQ-001 Q3 is still missing if
  the stakeholder cannot supply the nginx/gateway config instead.
- **Performance.** Per-request cost is a split of a short header plus a few CIDR
  comparisons. Parse the trusted list once at startup, not per request.
- **Accepted side effect of `forward-headers-strategy: none`** (raised by Jason,
  TASK-001 Q1). Tomcat also stops honouring `X-Forwarded-Proto` / `X-Forwarded-Host`.
  Nothing in these repos builds absolute URLs, so the only effect is that springdoc's
  auto-generated Swagger server URL shows the internal address. Accepted: these are
  server-to-server JSON APIs, the Swagger paths are already excluded from the audit
  filter via `shouldNotFilter`, and a cosmetic Swagger URL does not justify keeping the
  double resolution that caused REQ-001. If proto/host awareness is ever needed, it comes
  back as explicit configuration, not by re-enabling the valve underneath this filter.

## Tasks

- TASK-001: Client IP resolution + diagnostics in `DID-dopa-linkage2` (depends on: —)
- TASK-002: Roll the same change out to `DID-dga-api-v2`, `DID-rd-api-v2`,
  `DID-ieat-api-v2` (depends on: TASK-001) — **DONE**
- TASK-003: Add `X-Real-IP` as a trusted-peer-only fallback, in all four services
  (depends on: TASK-002) — see Amendment 2

TASK-001 takes the service the problem was actually observed on and establishes the
pattern; TASK-002 replicates it. The three remaining filters are identical to DOPA's
apart from comments and one stray `System.out.println` in `DID-dga-api-v2` — so
TASK-002 is mechanical once TASK-001 is reviewed.

Neither task closes REQ-001 on its own: acceptance requires deployed-environment
before/after evidence, which depends on Q7.

## Questions

(Jason asks here; Sober answers as `> answer: ...`)

Open items routed to Porter live in `REQ-001 ## Questions` (Q7, Q8) — not here.

---

# Appendix A — UAT diagnostic runbook (Sober, 2026-08-11 16:47)

For the stakeholder, via Porter. Everything here is **verified by me on this machine**, not
inferred from someone else's notes. Nothing in it touches a real environment.

## A1. Switching the diagnostic on — two forms, both confirmed

Pick whichever matches how DOPA is actually started in UAT.

**If it is started as a jar** (`java -jar ...`) — add the flag after the jar name:

```bash
java -jar dopa-linkage2-0.0.1-SNAPSHOT.jar --logging.level.audit.clientip=DEBUG
```

**If it is started in a container or via a service manager** — set the environment variable:

```bash
LOGGING_LEVEL_AUDIT_CLIENTIP=DEBUG
```

- The jar-flag form is the one Jason evidenced in TASK-001.
- The environment-variable form **I verified myself at 16:47** by running the built jar with
  `LOGGING_LEVEL_AUDIT_CLIENTIP=DEBUG` and confirming the line appeared. Environment-variable
  binding to `logging.level.<logger>` is the one place Spring Boot's relaxed binding is easy
  to get wrong, which is why I ran it rather than asserting it.
- **No rebuild and no code change** — it is a runtime setting. Restarting the service with
  the setting removed turns it off again.

## A2. Where the line comes out — this one matters

**The diagnostic goes to the service's own console/stdout, NOT to Logstash and NOT to the
log-viewer screen.** In `logback-spring.xml` the Logstash appender is attached only to the
`access` logger, with `additivity="false"`; the `audit.clientip` logger inherits the root
logger, which writes to the JSON console appender alone.

So: read the process/container stdout (`docker logs`, the systemd journal, or whatever
captures the service's output). Looking for it in the log-viewer UI will show nothing, and
that absence would mean nothing at all.

To find it quickly, search the output for:

```
X-Forwarded-For=[
```

## A3. What the line looks like, and how to read it

A real line from my verification run (one call, wrapped here for readability):

```json
{"level":"DEBUG","service":"dopa-linkage2","message":"X-Forwarded-For=[1.2.3.4, 203.0.113.5, 10.32.1.60] X-Real-IP=[203.0.113.5] Forwarded=[] True-Client-IP=[] CF-Connecting-IP=[] remoteAddr=[127.0.0.1] resolved=[203.0.113.5]", ...}
```

Read it as: the raw headers exactly as they reached the application, then `resolved=` — what
our code decided the caller is, which is also what goes into the audit log's IP field.

**The good case — the front server is forwarding the caller.** Something that is not one of
our own addresses appears in `X-Forwarded-For=[...]` or `X-Real-IP=[...]`:

```
X-Forwarded-For=[203.0.113.7, 10.32.1.60] X-Real-IP=[203.0.113.7] remoteAddr=[10.32.1.60] resolved=[203.0.113.7]
```

Here `203.0.113.7` should equal the public IP the stakeholder made the call from. REQ-001 is
then fixed by our change alone.

**The bad case — the front server is not forwarding the caller.** The headers are empty, or
contain only our own addresses (`10.32.1.60`, `10.32.1.62`, `172.x`, `127.0.0.1`):

```
X-Forwarded-For=[] X-Real-IP=[] Forwarded=[] remoteAddr=[10.32.1.60] resolved=[UNKNOWN]
```

`resolved=[UNKNOWN]` is **the fix working correctly**, not a failure — requirement 3 says an
undeterminable caller must be marked explicitly rather than silently replaced by our own
address, which is what produced the misleading `10.32.1.60`. But it means the caller's IP
never reached the application, and the remaining fix is `proxy_set_header` on the front
server — outside these four repos.

**Either way this single line decides the rest of REQ-001**, including whether TASK-003
(`X-Real-IP`) is worth building and what `trusted-proxies` should contain.

## A4. What to send back

One call is enough. Please capture, together, so they can be matched up:

1. The public IP the call was made from, and the time.
2. The whole `X-Forwarded-For=[...]` DEBUG line from the service's stdout.
3. The matching log-detail record from the log-viewer screen (LOG ID + IP ADDRESS field),
   so we can confirm the audit record and the diagnostic agree.

## A5. Reminder about the build

Per the standing rule on `board.md`, this ships from the **uncommitted working tree** —
nobody on the team commits anything. `mvn clean package -DskipTests` in
`DID-dopa-linkage2` produces `target/dopa-linkage2-0.0.1-SNAPSHOT.jar` from the working
tree as it stands, with no git operation of any kind.

---

# Appendix B — UAT run 1 diagnosis and what to check next (Sober, 2026-08-11 17:12)

Evidence: `../project-docs/2026-08-11-uat-run-1-dopa-docker-logs.md`.

## B1. The decisive argument: our fixed code **cannot** produce `clientIp = 10.32.1.60`

This is not a judgement call, it follows from the code and the config as written.

`trusted-proxies` contains `10.0.0.0/8`, so `10.32.1.60` **is** a trusted address. Trace it
through `ClientIpResolver.resolve()`:

- peer is `10.32.1.60` → trusted → we do **not** return the peer, we walk `X-Forwarded-For`;
- the walk returns only a **non-trusted** entry, so it can never return `10.32.1.60`;
- if the walk finds nothing → `UNKNOWN`.

There is no path through the fixed resolver that outputs `10.32.1.60`. The observed value is
the **pre-fix** behaviour exactly (old `getClientIp`: first `X-Forwarded-For` entry, else
`remoteAddr`). Combined with the total absence of the `audit.clientip` DEBUG line — a logger
that does not exist in the old code at all — the reading is:

**Explanation (a): the artifact running in UAT is not the fixed build.**

Two further details from the same log support it, though each could also be an environment
override, so I weight them lower:

- `"environment":"uat"` — our working tree sets `app.logging.environment: dev`, and the repo
  has **no** `application-uat.yml` (only `application.yml` and `logback-spring.xml`).
- Port `http-nio-4001` — our `application.yml` sets `server.port: 30006`.

**The likely mechanism, and it is worth saying plainly:** the fix exists **only** as
uncommitted changes in the local working tree, by the stakeholder's own deliberate rule. If
the UAT artifact is built on the server, or from a git checkout/pull anywhere, it is built
from `HEAD` — which does not contain the fix. Nothing about that is a mistake by anyone; it
is the predictable consequence of "deploy before commit", and it just needs the built jar to
be carried up from the working tree rather than rebuilt from source at the far end.

## B2. The one thing that could still make it explanation (b)/(c)

If `app.audit.trusted-proxies` failed to bind in the deployed environment, the trusted list
would be **empty**, nothing would be trusted, the peer `10.32.1.60` would be returned as the
caller — and the same `10.32.1.60` would appear. That requires *two* independent failures
(config not binding **and** the diagnostic not switched on), where (a) explains both symptoms
with one. B3 distinguishes them without guessing.

## B3. Three checks, cheapest first — all read-only, none changes anything

**Check 1 — is our code even in the running jar?** This alone settles (a) versus (b)/(c):

```bash
sudo docker exec dopa-linkage2 sh -c 'J=$(find / -maxdepth 4 -name "*.jar" 2>/dev/null | head -1); echo "JAR=$J"; ls -l "$J"; grep -ac ClientIpResolver "$J"'
```

- `0`, or no match → **the fix is not in the running artifact.** Explanation (a) confirmed;
  go to B4. Nothing else needs checking.
- a number `>= 1` → the fix **is** deployed, and we are in (b)/(c). Continue to checks 2 and 3.

**Check 2 — did the diagnostic setting actually reach the container?** The most common way
this fails is setting the variable in the host shell without passing it in with `-e`:

```bash
sudo docker inspect dopa-linkage2 --format '{{json .Config.Env}}'
sudo docker exec dopa-linkage2 printenv | grep -i -e logging -e audit
```

Expected if it was passed in: `LOGGING_LEVEL_AUDIT_CLIENTIP=DEBUG` appears. If it does not,
that alone explains the missing DEBUG line.

**Check 3 — what image is running and when was it built:**

```bash
sudo docker inspect dopa-linkage2 --format '{{.Config.Image}} created={{.Created}}'
```

Built before the fix was written (roughly 15:30 today) → (a) again.

## B4. If the fix is not in the artifact — how to get it there, without any commit

Build the jar **from the working tree on the machine that holds it** and carry that jar up.
Do not rebuild on the server and do not `git pull` first; either would produce `HEAD`, which
does not contain the fix.

```bash
cd C:\Users\Admin\sa-project\api-linkage2\DID-dopa-linkage2
mvn clean package -DskipTests
# produces target\dopa-linkage2-0.0.1-SNAPSHOT.jar  — this is the file to deploy
```

Then deploy *that file*, restart the container with `LOGGING_LEVEL_AUDIT_CLIENTIP=DEBUG`
passed **into** the container, and repeat the run-1 call. No `git add`, `git commit` or
`git stash` at any point — the standing rule holds.

Two sanity signals that the right jar is running, visible in the first lines of
`docker logs` without making any call:

- the diagnostic logger exists at all (a DEBUG line appears on the first request);
- `clientIp` is either a public address or `UNKNOWN` — **never** `10.32.1.60`. Under the
  fixed code that value is impossible, so if it appears again the artifact is still wrong.

## B5. Not the cause — ruled out, so nobody spends time on it

The logback startup warnings (`<if> elements cannot be nested within an <appender>,
<logger> or <root> element`) are **pre-existing and unrelated**. I saw the identical warnings
in my own local runs today, in which the `audit.clientip` DEBUG line printed correctly. The
`<if>` sits inside the `access` logger and governs only whether the Logstash appender is
attached to it; the diagnostic logger inherits the **root** logger and its console appender,
which the warning does not touch.

Worth noting separately, though — **not** part of REQ-001 and not to be fixed inside it: if
that `<if>` is being ignored, the Logstash appender may not be attached to the `access`
logger at all. That would bear on REQ-001 Q8 (whether the log-viewer screen is fed by our
Logstash). Flagged for later, not now.

## B6. A tentative read on the environment — explicitly not a conclusion

With the **old** code and `forward-headers-strategy: native`, if `X-Forwarded-For` had
carried `110.171.40.169`, Tomcat's `RemoteIpValve` would most likely have resolved
`remoteAddr` to it, and the recorded value would have been the public address rather than
`10.32.1.60`. That it was not is weak evidence that **the front server is not forwarding the
caller at all** — i.e. REQ-001 Q7(a)'s bad branch, matching the did-047 team's UAT
observation. Valve behaviour varies with configuration, so I am not treating this as
established. **The DEBUG line from a correct redeploy settles it properly**, which is why
B3/B4 come first.

---

# Appendix C — the server-side `/config/application.yml` change (Sober, 2026-08-11 17:28)

**Correction to Appendix B first.** My primary explanation (a) — "the artifact is not the
fixed build" — was **wrong**. Check 1 returned `4` against a jar dated 17:03, so the fixed
code is deployed. The live branch is **B2**, the one I kept open but weighted lower: the
trusted list is empty in the deployed environment, so the peer `10.32.1.60` is untrusted and
is returned as the caller. That output is the **fixed code behaving exactly as specified** on
a configuration it never received. My reasoning that the fixed code cannot output `10.32.1.60` was
sound only under the assumption that it was reading our `application.yml` — and it is not.

The mechanism, from Porter's 17:23 entry: the container runs with `SPRING_CONFIG_LOCATION`
pointing at a bind-mounted **server-side** `/config/application.yml`, and only the jar was
copied up. `spring.config.location` **replaces** the default config locations, so the
`application.yml` packaged inside our jar is never read at all. Everything TASK-001 and
TASK-002 put in `src/main/resources/application.yml` — `trusted-proxies` and
`forward-headers-strategy: none` — is therefore absent in UAT.

## C1. What to add to `/config/application.yml`

**Read this before pasting.** That file almost certainly already has top-level `server:`,
`app:` and possibly `logging:` sections — it is where `environment: uat` and port `4001` come
from. YAML does **not** merge two blocks with the same top-level key; a second `app:` would
discard the first. So **add each item underneath the section that is already there**, and do
not create a second copy of any top-level key.

```yaml
server:
  # ...keep everything already here...
  forward-headers-strategy: none      # stop Tomcat's RemoteIpValve consuming X-Forwarded-For

app:
  # ...keep everything already here (logging.environment: uat etc.)...
  audit:
    trusted-proxies:
      - 127.0.0.1/32                  # loopback
      - ::1/128                       # loopback, IPv6
      - 10.32.1.60/32                 # front server — every request lands here first
      - 10.32.1.62/32                 # backend server, where these services run
      - 172.16.0.0/12                 # docker bridge networks
      - 169.254.0.0/16                # link-local
      - fe80::/10                     # link-local, IPv6

logging:
  level:
    audit.clientip: DEBUG             # the diagnostic — remove this line to turn it off again
```

Then restart the container and repeat the same call. No environment variable is needed —
putting the level in this file does the same job and survives restarts.

## C2. Why the narrow list, and not `10.0.0.0/8`

This is the judgement Porter asked me to make rather than make for me.

**Use the three named hosts, not the wide range.** Q10 came back **mixed** — legitimate
callers include server machines, not only external customers — and Q12(1) (do those server
callers sit inside `10.32.x`?) is still unanswered. Trusting all of `10.0.0.0/8` would mean
that if any genuine caller lives anywhere in that range, we would classify them as one of our
own hops, skip them, and log `UNKNOWN`. That is a silent wrong answer, and it would fail
REQ-001's first Acceptance Criterion while looking like correct behaviour.

Trusting only the addresses we have been told are ours has the opposite failure mode: if
there is an extra hop between the front server and the backend that nobody has mentioned
(Q12(2), also unanswered), its address would be reported as the caller. That is wrong too —
but **visibly** wrong, it shows up immediately in the DEBUG line as an unexpected `10.32.x`
value, and we fix it by adding one line. A visible wrong answer beats a silent one for an
audit field.

`10.32.2.62` (Logstash) is deliberately **not** in the list: it is a destination we ship logs
to, never a hop that inbound requests arrive through, and trusting addresses that cannot
appear as a peer adds risk without benefit.

`169.254.0.0/16` and `fe80::/10` are the one thing worth borrowing from the did-047 team's
implementation (see REQ-001 Q11) — they skip link-local and we did not.

## C3. What the next run should show, and how to read it

- **A DEBUG line must appear** on the first call. If it still does not, the level line is in
  the wrong place in the file — check it is under a top-level `logging:` that appears only
  once.
- **`clientIp` must never be `10.32.1.60` again.** With that address now trusted, the fixed
  code has no path that returns it. If it reappears, the file is still not being read.
- **Good outcome:** `clientIp` equals the public IP the call was made from
  (`110.171.40.169` in run 1). REQ-001 is then fixed by our change alone.
- **Expected-but-not-failure outcome:** `resolved=[UNKNOWN]` with the DEBUG line showing
  empty or all-internal headers. That is requirement 3 working, and it means the front server
  is not forwarding the caller — the remaining fix is `proxy_set_header` on `10.32.1.60`,
  outside these repos. The DEBUG line is the evidence to hand to whoever owns that server.

## C4. Consequence for the other three services — not a task yet

DGA, RD and IEAT will be deployed the same way, so their server-side config files will need
the same three additions with their own values. Nothing to do until DOPA is proven; recording
it so it is not discovered again from scratch at deployment time.

Also worth noting for whoever maintains these deployments: because
`spring.config.location` replaces rather than adds, **every** configuration key these
services need must exist in the server-side file. Any future setting added to a repo's
`application.yml` will be silently ignored in UAT unless it is also added there. That is a
standing trap, not a REQ-001 problem.

---

# Appendix D — after run 3: what is required, and one new risk (Sober, 2026-08-11 17:47)

Evidence: `../project-docs/2026-08-11-uat-run-3-the-decisive-diagnostic-line.md`.

```
X-Forwarded-For=[]  X-Real-IP=[110.171.40.169]  Forwarded=[]
True-Client-IP=[]  CF-Connecting-IP=[]  remoteAddr=[10.32.1.60]  resolved=[10.32.1.60]
```

## D1. Two corrections to my own earlier readings

**Appendix B6 is refuted.** I wrote that `clientIp=10.32.1.60` under `native` was weak
evidence that the front server forwards nothing. It forwards the caller perfectly well — just
in a header our code does not read. I flagged B6 as tentative and said the DEBUG line would
settle it; it did, against me.

**Porter's 17:38 reading — the same inference from Spring Security's
`RemoteIpAddress=10.32.1.60` — is also refuted, and it was right to ask rather than publish
it.** The explanation is specific and worth keeping: Tomcat's `RemoteIpValve` reads
**`X-Forwarded-For` only** (plus the protocol header). It does not look at `X-Real-IP` at all.
`X-Forwarded-For` was empty, so the valve had nothing to rewrite and `getRemoteAddr()` stayed
`10.32.1.60`. So `RemoteIpAddress=10.32.1.60` is exactly what you would expect **even when
the caller is being forwarded** — it says nothing about whether the front server forwards, and
must not be presented to the stakeholder as if it did.

## D2. Both changes are required; neither alone is enough

Confirming Porter's reading. Three traces through the fixed resolver, peer = `10.32.1.60`:

| Deployed state | Trace | `clientIp` |
|---|---|---|
| **Config only** (trusted-proxies added, no TASK-003) | peer trusted → walk `X-Forwarded-For`: empty → `X-Real-IP` not read | **`UNKNOWN`** |
| **TASK-003 only** (no trusted-proxies) | trusted list empty → peer untrusted → return peer | **`10.32.1.60`** — no change |
| **Both** | peer trusted → `X-Forwarded-For` empty → `X-Real-IP` = `110.171.40.169`, not trusted | **`110.171.40.169`** ✅ |

So: **deploy once, with both.** Shipping either alone produces a result that looks like
failure and costs a round trip.

`forward-headers-strategy: none` is in Appendix C's paste and should stay there, but be aware
it is **not** load-bearing in the environment as it stands: the valve only acts on
`X-Forwarded-For`, which is empty, so `native` and `none` behave identically here. Keep it
because it removes the double-resolution hazard if that header ever starts arriving — not
because it is what makes this fix work. One less mystery variable if the next run misbehaves.

## D3. The new risk — `X-Real-IP` is a single value, and it is now our only source

Amendment 2 put `X-Real-IP` behind the trusted-peer gate on the reasoning that a single
overwritable value is weaker evidence than a chain. That reasoning was written when it was a
fallback. It is now the primary path, so the safeguard matters **more**, and one residual
question opens that the chain form did not have:

**If the front server does not overwrite `X-Real-IP`, a caller can set it themselves.** Our
peer gate does not help here — the request genuinely arrives through `10.32.1.60`, which we
trust, so a client-supplied `X-Real-IP` would be accepted as evidence. With
`X-Forwarded-For` there is at least a chain structure; with a single header there is nothing
but the hop's own discipline.

The standard nginx directive `proxy_set_header X-Real-IP $remote_addr;` **overwrites**
unconditionally, which would make forgery impossible — and the fact that we saw the correct
public IP strongly suggests that is what is configured. But "strongly suggests" is not what an
audit evidence field should rest on.

**This does not block TASK-003** — nothing about the build changes either way.

## D4. A free test to settle D3, in the same run

The stakeholder is already at the console making a call. Ask them to make **one extra call**
with a bogus header added, and send the DEBUG line for it:

```bash
curl -i -X POST 'https://e-connect-did.mod.go.th/test-api-gateway/service-dopa-linkage2/dopa-linkage2/api/v2/service' \
  -H 'Authorization: Bearer <their token>' \
  -H 'Content-Type: application/json' \
  -H 'X-Real-IP: 8.8.8.8' \
  -d '{"serviceId":"1","input":"<the same id they used before>"}'
```

Reading the resulting DEBUG line:

- `X-Real-IP=[110.171.40.169]` → the front server **overwrites** the header. Forgery
  impossible, D3 closed, nothing further to do. This is the expected and hoped-for result.
- `X-Real-IP=[8.8.8.8]` → the header **passes through**. Our audit field would be
  caller-forgeable, and that needs addressing before REQ-001 can honestly be called done —
  either `proxy_set_header X-Real-IP $remote_addr;` on the front server, or a design change
  from me. Better to learn this now than after the log is treated as evidence.

Costs one call and no deployment. If they would rather not, it can wait — but it should not
be forgotten, so it is recorded here either way.
