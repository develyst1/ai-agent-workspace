# TASK-004: Built-in trusted-proxy default + startup warning, all four services
- Source: SPEC-002
- Status: TODO — **unblocked 2026-08-11 18:20, Q1 answered. Resume.**
- Depends on: TASK-003 (DONE)

## What to do

Small and additive. Same change in all four repos, DOPA first as the reference copy, then
`DID-dga-api-v2`, `DID-rd-api-v2`, `DID-ieat-api-v2`.

**1. `ClientIpResolver`** — add a compiled-in default, used only when configuration supplies
nothing usable:

```java
static final List<String> DEFAULT_TRUSTED_PROXIES = List.of(
        "127.0.0.0/8", "::1/128",              // loopback
        "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16",   // private (172.16/12 covers Docker bridges)
        "169.254.0.0/16", "fe80::/10");        // link-local
```

In the constructor: parse the supplied list as today; **if the parsed result is empty** —
null list, empty list, or every entry unparseable — parse `DEFAULT_TRUSTED_PROXIES` instead
and use that.

Note the condition is on the **parsed** result, not the raw input. A list of three typos
should fall back to something sane rather than trusting nothing.

**2. Announce the fallback — this is required, not optional.** When the default is used, log
one `WARN` at construction naming the ranges. Today's entire incident was a wrong audit value
that looked like a perfectly normal successful call; a silent default would set up the same
trap again. Use a normal class logger — this one must be visible at default level, unlike the
`audit.clientip` DEBUG diagnostic.

Do not warn when configuration was supplied. That is the intended path and must stay quiet.

**3. Nothing else changes.** Resolution order, the peer-trust gate, `X-Real-IP`, `UNKNOWN` —
all exactly as TASK-003 leaves them. Leave `app.audit.trusted-proxies` in each repo's
`application.yml` as it is; it still documents intent and still applies where the packaged
config is read.

## Definition of Done

- [ ] New tests, written first and watched fail, in `DID-dopa-linkage2`:
      - `new ClientIpResolver(List.of())` → resolves a caller behind a `10.32.1.60` peer
        exactly as the explicitly-configured resolver does
      - `new ClientIpResolver(null)` → same
      - a list of only-unparseable entries → falls back to the default, does **not** end up
        trusting nothing
      - **a supplied list still wins**: `new ClientIpResolver(List.of("127.0.0.1/32"))` does
        **not** trust `10.32.1.60` — proves the default is not silently merged in
      - the direct-connection guarantee still holds under the default: peer `203.0.113.99`
        with a forged `X-Real-IP: 8.8.8.8` → `203.0.113.99`
- [ ] **Seventeen** of the eighteen existing `ClientIpResolver` tests pass **unedited** in
      every repo. The eighteenth — `emptyTrustedList_meansNoProxyIsTrusted` — is renamed and
      re-asserted per the Q1 answer below; that one edit is authorised and is the **only** one.
      If any other test needs editing, stop and ask.
- [ ] Final count is **23** `ClientIpResolver` tests in each of the four repos.
- [ ] `mvn test` and `mvn clean package -DskipTests` pass in all four repos — paste all four
      surefire summaries.
- [ ] `diff` of the three copied `ClientIpResolver` files against DOPA's still shows the
      package line only — paste it.
- [ ] Show the `WARN` appearing on a local run with no `app.audit` config, **and** not
      appearing when the config is present. Both, briefly.

## Implementation Notes

**Stopped at the point the DoD told me to stop.** One of the eighteen existing tests cannot
pass unedited under SPEC-002 — it asserts exactly the behaviour SPEC-002 removes. Per DoD item
2 I have not touched it and have not propagated anything to the other three repos. Q1 below.

### What is in the working tree (DOPA only)

`ClientIpResolver`:

```java
static final List<String> DEFAULT_TRUSTED_PROXIES = List.of(
        "127.0.0.0/8", "::1/128",
        "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16",
        "169.254.0.0/16", "fe80::/10");
```

Constructor parses the supplied list, and **if the parsed result is empty** parses the default
instead and logs one `WARN` naming the ranges. The condition is on the parsed result, so three
typos fall back to the default rather than to trusting nothing. Parsing moved into a private
`parse(List<String>)` helper so both paths use the same code. `WARN` on a normal class logger
(`ClientIpResolver`), visible at default level; silent when configuration was supplied.
Resolution order, peer-trust gate, `X-Real-IP` and `UNKNOWN` are untouched.

The five new tests are written and passing:
`emptyConfig_fallsBackToTheBuiltInDefault` (including run 3's real inputs —
`resolve("", "110.171.40.169", "10.32.1.60")` → `110.171.40.169`),
`nullConfig_fallsBackToTheBuiltInDefault`,
`onlyUnparseableEntries_fallBackToTheDefault_ratherThanTrustingNothing`,
`aSuppliedListStillWins_theDefaultIsNotMergedIn` (a `127.0.0.1/32`-only resolver still does
**not** trust `10.32.1.60`), and
`directConnectionGuarantee_holdsUnderTheDefaultToo`.

### Current state — one known failure, deliberately left

```
[ERROR] Tests run: 23, Failures: 1, Errors: 0 -- in com.smart.dopa.BaseUtil.ClientIpResolverTests
[ERROR] ClientIpResolverTests.emptyTrustedList_meansNoProxyIsTrusted:185
        expected: <10.32.1.60> but was: <203.0.113.5>
```

That is the collision, not a defect: the other 22 pass, including all seventeen other
pre-existing tests. Nothing is propagated to DGA/RD/IEAT, nothing is committed, and no
`application.yml` was touched.

## Questions

(Jason asks; Sober answers as `> answer: ...`)

**Q1 — BLOCKING. `emptyTrustedList_meansNoProxyIsTrusted` cannot survive SPEC-002 unedited.**

The test, written under TASK-001 and unchanged since:

```java
@Test
void emptyTrustedList_meansNoProxyIsTrusted() {
    ClientIpResolver noTrust = new ClientIpResolver(List.of());
    assertEquals("10.32.1.60", noTrust.resolve("203.0.113.5, 10.32.1.60", "10.32.1.60"));
}
```

It pins "an empty configured list means trust nothing", which is the precise behaviour
SPEC-002 replaces — `List.of()` is now the main trigger for the built-in default. The two
cannot both hold, so this is a direct contradiction between the old test and the new SPEC,
not something I can implement around. You said to stop rather than work around it, so I have.

For what it is worth, the two behaviours it was really guarding are both still covered:

- "a supplied list is honoured exactly, nothing extra merged in" → my new
  `aSuppliedListStillWins_theDefaultIsNotMergedIn`, which is the same assertion with a
  non-empty list (`127.0.0.1/32`) and therefore still meaningful after SPEC-002.
- "an untrusted peer wins over the chain" → `directConnection_ignoresTheForwardedHeaderEntirely`
  and `directConnectionGuarantee_holdsUnderTheDefaultToo`.

**My recommendation, but it is your call and I will do whichever you say:** replace its body
so the name stays true to the new rule — `new ClientIpResolver(List.of())` now asserting
`203.0.113.5` — or rename it to `emptyTrustedList_fallsBackToTheDefault` and delete my
`emptyConfig_fallsBackToTheBuiltInDefault`, which would then be a duplicate. Either way the
count changes from eighteen to twenty-two or twenty-three, so please confirm the number you
expect at review.

Two smaller points, neither blocking:

- The DoD says "eighteen existing tests"; with the new ones DOPA will end at **23** (or 22 if
  we merge the duplicate above). Just so the review is not counting against eighteen.
- `172.16.0.0/12` and the RFC1918 ranges are already in every repo's `application.yml`, so on
  a deployment that reads the packaged config nothing changes and the `WARN` will not appear —
  which matches step 3, but it does mean the local "WARN appears" demonstration (DoD item 5)
  has to be run with the config explicitly emptied. I will do exactly that once Q1 is answered.

## Review

(Sober fills this in at REVIEW: verdict + reasons.)

> answer to Q1 (Sober, 2026-08-11 18:20) — **you are right, it is a genuine contradiction,
> and stopping was the correct call. Thank you for not editing it quietly.**
>
> That test pins behaviour SPEC-002 deliberately removes. It has to change; there is no way
> to implement the SPEC and keep it. **This is the single authorised exception** to the
> "existing tests pass unedited" rule — it exists to catch a regression sneaking through as a
> test edit, and the way it does that is by making you stop and me decide. It worked exactly
> as intended. Do not treat this as a precedent for the other seventeen.
>
> **Take your option B, with one correction: do not delete your new test.**
>
> 1. Rename the old one to `emptyTrustedList_fallsBackToTheDefault` and flip its assertion to
>    `203.0.113.5`. The name then tells the truth about the new rule, and the git history
>    still shows what it used to guard.
> 2. **Keep `emptyConfig_fallsBackToTheBuiltInDefault`.** It is not a duplicate — the renamed
>    test goes through the `X-Forwarded-For` chain, yours goes through `X-Real-IP`. They cover
>    different paths.
>
> More importantly: yours carries run 3's **real** inputs
> (`resolve("", "110.171.40.169", "10.32.1.60")` → `110.171.40.169`). That is the exact gap I
> flagged in the TASK-003 review as the one scenario this whole REQ exists for and which
> nothing in the suite pinned. You closed it without being asked. Keep it, and do not let it
> get folded into anything else later.
>
> **Expected count: 23 per repo**, in all four. Your DoD has been updated to say so.
>
> On your two smaller points: the count is answered above; and yes, run the `WARN`
> demonstration with the packaged config explicitly emptied — that is the right way to
> exercise it and your reading of step 3 is correct.
>
> One consequence I am recording rather than solving, so it is not discovered as a surprise:
> after this change an empty configured list no longer means "trust nothing", so a deployment
> that genuinely wanted that can no longer express it that way. Nobody has asked for it, so I
> am not adding a flag for it. The workaround if it is ever needed is a list containing one
> address that can never be a peer (e.g. `192.0.2.1/32`, TEST-NET-1). If REQ-001 Q9 comes
> back saying the container ports **are** reachable directly, that is when we revisit it —
> not now.
