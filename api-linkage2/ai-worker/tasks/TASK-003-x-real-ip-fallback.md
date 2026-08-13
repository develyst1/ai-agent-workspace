# TASK-003: Add X-Real-IP as a trusted-peer-only fallback, in all four services
- Source: SPEC-001 (Amendment 2)
- Status: DONE

> **The header is confirmed present in UAT.** Run 3's diagnostic line
> (`../project-docs/2026-08-11-uat-run-3-the-decisive-diagnostic-line.md`):
> `X-Forwarded-For=[] X-Real-IP=[110.171.40.169] remoteAddr=[10.32.1.60]` — `X-Real-IP`
> carries the caller's real public IP and `X-Forwarded-For` is empty. This task was deferred
> at 16:38 precisely until that line proved the header exists. It does, and `X-Real-IP` is
> now the **only** source of the caller's address in this environment — so this task is what
> closes REQ-001, not an optional hardening.
>
> **Nothing in the task below changes.** The design in SPEC-001 Amendment 2 was written for
> exactly this case, and I have re-checked every safeguard against `X-Real-IP` being the
> primary path rather than a fallback (SPEC-001 Appendix D). The trusted-peer gate matters
> **more** now, not less: it is the only thing standing between a forged single-value header
> and our audit evidence. Keep the ordering too — `X-Forwarded-For` first — even though it is
> empty today; if the front server is ever reconfigured to send it, the chain is the better
> source.
- Depends on: TASK-002 (DONE) — the four `ClientIpResolver` copies must already be identical

## Why this exists

A sibling Smart-Alliance service fixed this same symptom on 2026-08-07
(`did-047-api-management-sso` `c5c4650`; diff in
`../project-docs/2026-08-11-reference-did047-client-ip-fix.patch`). Two things in it matter:

1. Their resolver reads **`X-Real-IP` first**. We do not read it at all — we only print it in
   the DEBUG diagnostic.
2. One of their tests carries the comment *"เคสที่เห็นบน UAT ตอนนี้: nginx ไม่ส่ง IP จริงมา"* —
   on UAT, nginx was sending only container hops in `X-Forwarded-For`.

If that is also true of our vhosts, our four services will log `UNKNOWN` after deployment and
`X-Real-IP` may be the only header actually carrying the caller. This is cheap insurance
against a second deploy-and-observe round on an urgent REQ.

Strictly additive: when `X-Real-IP` is absent, behaviour is byte-identical to today.

## What to do

Same change in all four repos — `DID-dopa-linkage2` first (it stays the reference copy), then
`DID-dga-api-v2`, `DID-rd-api-v2`, `DID-ieat-api-v2`.

**1. `ClientIpResolver`** — new overload, keeping the existing two-argument one working:

```java
String resolve(String xForwardedForHeader, String xRealIpHeader, String remoteAddr)
```

Rule (SPEC-001 Amendment 2), inserted as a **fallback after** the existing chain walk:

```
peer = parse(remoteAddr)
if peer is null                 -> UNKNOWN
if peer is NOT trusted          -> peer                                   # unchanged
walk X-Forwarded-For right-to-left; first non-trusted entry -> that entry # unchanged
realIp = parse(X-Real-IP); if realIp != null and NOT trusted -> realIp    # NEW
return UNKNOWN
```

Three things that are not negotiable, because they are what makes ours safer than the
reference implementation:

- `X-Real-IP` is consulted **only inside the trusted-peer branch**. On a direct connection it
  is as forgeable as any other header, and the reference has exactly this hole — their
  `resolve()` trusts `X-Real-IP` with no peer check, so a direct caller sending
  `X-Real-IP: 8.8.8.8` wins outright.
- `X-Forwarded-For` keeps priority over `X-Real-IP`. XFF preserves the whole chain;
  `X-Real-IP` is a single value an intermediate hop may have overwritten with its own address.
  (The reference orders these the other way; do not copy that.)
- The final fallback stays `UNKNOWN`, never `remoteAddr`. The reference returns the
  container's own address there — that is the silent substitution REQ-001 requirement 3
  forbids, and it is what produced the misleading `10.32.1.60` in the first place.

Keep everything else: parse-once trusted list, no-DNS literal validation, port stripping,
`::ffff:` unwrapping, never-throw.

**2. `RequestAuditFilter.getClientIp`** — pass `req.getHeader("X-Real-IP")` into the new
overload. The DEBUG diagnostic already prints `X-Real-IP`; leave it as it is.

**3. Do not change `trusted-proxies`.** The reference deliberately excludes `10.0.0.0/8` and
`192.168.0.0/16` because *their* users sit on the internal LAN. Whether ours can is REQ-001
Q10 and is not yet answered — changing those values on a guess could make us skip a genuine
caller. If Q10 comes back "yes, callers can be internal", that is a config change and I will
raise it separately.

## Definition of Done

- [x] New tests, written first and watched fail, in `DID-dopa-linkage2`:
      - peer trusted, no XFF, `X-Real-IP: 203.0.113.5` → `203.0.113.5`
      - peer trusted, XFF yields a caller, `X-Real-IP` set to something else → **XFF wins**
      - peer trusted, `X-Real-IP` is itself a trusted address → `UNKNOWN` (not the proxy)
      - **peer NOT trusted, forged `X-Real-IP: 8.8.8.8`** → the peer, not `8.8.8.8`
      - `X-Real-IP` absent → identical result to the two-argument call
- [x] All thirteen existing `ClientIpResolver` tests still pass **unedited** in every repo.
      If any needs editing, stop and ask in `## Questions`.
- [x] `mvn test` and `mvn clean package -DskipTests` pass in all four repos — paste all four
      surefire summaries.
- [x] `diff` of the three copied `ClientIpResolver` files against DOPA's still shows the
      package line only — paste it. The four must not drift.
- [x] One local run on any one service showing `X-Real-IP` being used when XFF is absent.
      No need to repeat the full four-service local matrix from TASK-002.

## Implementation Notes

Strictly additive, as specified. DOPA first, then copied to the other three; all four still
hold the same class character for character apart from the package line.

### The change

`ClientIpResolver` — the existing two-argument `resolve` is kept and now delegates:

```java
public String resolve(String xForwardedForHeader, String remoteAddr) {
    return resolve(xForwardedForHeader, null, remoteAddr);
}
```

The three-argument overload is the old body with one block added **after** the chain walk,
inside the trusted-peer branch:

```java
// XFF ไม่ให้คำตอบ → ลอง X-Real-IP (อยู่ในสาขา peer เชื่อถือได้แล้วเท่านั้น)
InetAddress realIp = parseAddress(xRealIpHeader);
if (realIp != null && !isTrusted(realIp)) return realIp.getHostAddress();

return UNKNOWN;
```

All three non-negotiables hold, and each is pinned by a test rather than by my say-so:

- `X-Real-IP` is read **only** after the peer-trust gate — a direct connection returns the
  peer before this line is ever reached (`directConnection_ignoresAForgedXRealIpToo`).
- `X-Forwarded-For` keeps priority (`forwardedForKeepsPriorityOverXRealIp`).
- The final fallback is still `UNKNOWN`, never `remoteAddr`
  (`xRealIpThatIsItselfTrusted_isNotTheCaller`).

`RequestAuditFilter.getClientIp` passes `req.getHeader("X-Real-IP")` into the new overload and
now feeds the same local variable to the DEBUG line instead of re-reading the header; the line
itself is unchanged. `trusted-proxies` untouched in all four, per step 3.

Files: `BaseUtil/ClientIpResolver.java` and `BaseFilter/RequestAuditFilter.java` in each of the
four repos, plus `BaseUtil/ClientIpResolverTests.java`. Filter diff is **24 added / 3 removed**
in all four (`git diff --numstat`) — one line more than TASK-002's 23/3, which is the added
`realIp` variable.

### Verification

**1. New tests written first and watched fail** (DoD item 1). Five added, covering the five
listed cases; before the overload existed they failed to compile against `resolve(String,
String)`:

```
required: java.lang.String,java.lang.String
found:    <nulltype>,java.lang.String,java.lang.String     ← xRealIp_isUsedWhenForwardedForYieldsNothing
found:    java.lang.String,java.lang.String,java.lang.String ← forwardedForKeepsPriorityOverXRealIp
...
```

**2. The thirteen existing tests were not edited** (DoD item 2) — the test-file change is
again a pure insertion, and all thirteen pass unchanged in every repo. Resolver tests are now
**18** everywhere.

**3. `mvn test` in all four** (DoD item 3):

```
DID-dopa-linkage2 : ClientIpResolverTests 18 · total  Tests run: 48, Failures: 0, Errors: 0 — BUILD SUCCESS
DID-dga-api-v2    : ClientIpResolverTests 18 · total  Tests run: 27, Failures: 0, Errors: 0 — BUILD SUCCESS
DID-rd-api-v2     : ClientIpResolverTests 18 · total  Tests run: 27, Failures: 0, Errors: 0 — BUILD SUCCESS
DID-ieat-api-v2   : ClientIpResolverTests 18 · total  Tests run: 27, Failures: 0, Errors: 0 — BUILD SUCCESS
```

`mvn clean package -DskipTests` — BUILD SUCCESS in all four.

**4. `diff` against DOPA — still package line only** (DoD item 4), for both the resolver and
its tests:

```
== DID-dga-api-v2 ==      == DID-rd-api-v2 ==       == DID-ieat-api-v2 ==
1c1                       1c1                       1c1
< package com.smart.dopa.BaseUtil;
> package com.smart.dga.BaseUtil;   > package com.smart.rd.BaseUtil;   > package com.smart.ieat.BaseUtil;
(same single hunk for ClientIpResolverTests.java)
```

**5. Local run reproducing the UAT shape** (DoD item 5) — DOPA jar, port 30106, Logstash off,
dummy `jwk-set-uri`, diagnostic at DEBUG. First call sends **only** `X-Real-IP`, exactly like
run 3:

```
X-Forwarded-For=[] X-Real-IP=[110.171.40.169] Forwarded=[] True-Client-IP=[]
CF-Connecting-IP=[] remoteAddr=[127.0.0.1] resolved=[110.171.40.169]
→ audit record: "clientIp":"110.171.40.169"
```

Second call sends both headers, to prove the ordering on a live request:

```
X-Forwarded-For=[203.0.113.5, 10.32.1.60] X-Real-IP=[198.51.100.7] remoteAddr=[127.0.0.1]
resolved=[203.0.113.5]
→ audit record: "clientIp":"203.0.113.5"      (XFF wins, X-Real-IP ignored)
```

The local peer is `127.0.0.1`, which is in `trusted-proxies`, so this exercises the same
trusted-peer branch UAT will take with `10.32.1.60`.

**Note on the working tree:** patching the three copies programmatically rewrote their line
endings; I converted those three `RequestAuditFilter.java` files back to CRLF so each working
copy is left as I found it, and re-ran their tests afterwards. The new files stay LF to match
DOPA's, which is what keeps the `diff` above to one hunk.

## Questions

(Jason asks; Sober answers as `> answer: ...`)

## Review

(Sober fills this in at REVIEW: verdict + reasons.)

---

## Review (Sober, 2026-08-11 18:02)

### Verdict: DONE

Built exactly as specified, and the three non-negotiables are each pinned by a test rather
than by assertion. Verified myself rather than from the write-up:

- **`mvn test` run by me in all four repos:** DOPA **48/48** (was 43), DGA/RD/IEAT **27/27**
  each (was 22). 0 failures, 0 errors everywhere. `ClientIpResolverTests` at **18** in each —
  your 13 plus 5.
- **The thirteen existing tests are unedited** — same method names, same order, the five new
  ones inserted around them. That was the thing that could have hidden a regression.
- **`diff` against DOPA for the other three:** `ClientIpResolver.java` and
  `ClientIpResolverTests.java` differ by the package line and nothing else, in all three. The
  four services still hold the same rule character for character.
- **`git status` in all four:** the same file set as before this task, nothing added, nothing
  committed. The standing no-commit rule is intact.

**The ordering is right where it counts.** `X-Real-IP` is read *after* the peer-trust gate and
*after* the chain walk, so `directConnection_ignoresAForgedXRealIpToo` passes for the right
reason — a direct caller never reaches the `X-Real-IP` line at all. That gate is now
load-bearing rather than defensive, and it is the part I said I would look hardest at.

`xRealIpAbsent_behavesExactlyLikeTheTwoArgumentCall` is a good test to have written without
being asked: it pins the delegation, so the two-argument overload cannot drift from the
three-argument one later.

### Trace against the real UAT observation

With the Appendix C trusted list and run 3's actual inputs —
`resolve("", "110.171.40.169", "10.32.1.60")`:
peer `10.32.1.60` is trusted → chain empty → `X-Real-IP` parses, is not trusted →
returns **`110.171.40.169`**. That is the value REQ-001 asks for.

### One gap, not a rework

No test pins the **production** trusted list (the three named hosts from Appendix C) against
run 3's inputs — the suite uses the wide RFC1918 list throughout. The behaviour is proven by
the general cases and the values live in server-side config rather than in the repo, so this
does not hold the task up. But if you touch this file again, add one case built from the real
Appendix C list and the real run-3 headers: it is the single scenario this whole REQ exists
for, and right now nothing in the suite would notice if a future edit broke it.

### Nothing further from you

TASK-003 completes SPEC-001. The remaining steps are the stakeholder's: the Appendix C config
plus this build, deployed together in one go (Appendix D2), and the optional forged-header
probe in Appendix D4.
