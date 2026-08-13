# SPEC-002: Correct caller IP without per-deployment configuration
- Source: REQ-002
- Status: ACTIVE

## Overview

**The answer to REQ-002 is yes, and it is a small change.** The reason `trusted-proxies`
has to be added by hand today is not that the value is unknowable — it is that our default
lives in `src/main/resources/application.yml`, and these deployments run with
`SPRING_CONFIG_LOCATION`, which **replaces** that file rather than merging with it. Anything
we put there is invisible in UAT by construction.

So: **move the default out of configuration and into the code.** `ClientIpResolver` already
receives its list through the constructor. When that list arrives empty — which is exactly
what happens when no `app.audit.*` configuration exists — fall back to a list compiled into
the class. Code cannot be replaced by a config file, so the default applies everywhere,
with no deployment step at all.

That satisfies REQ-002 requirements 1 and 2 directly: no configuration → the built-in list;
configuration present → it wins, and today's proven DOPA arrangement is untouched.

## The honest part — what the default trusts, and what it costs

REQ-002 requirement 3 says the protection REQ-001 established must not be weakened. The
built-in default is **weaker than an explicit narrow list in one specific case**, and this
SPEC does not pretend otherwise.

Built-in default (only used when nothing is configured):

```
127.0.0.0/8, ::1/128        loopback
10.0.0.0/8                  private
172.16.0.0/12               private, includes Docker bridges
192.168.0.0/16              private
169.254.0.0/16, fe80::/10   link-local
```

**What it gets right.** Every deployment of these services sits behind private-addressed
infrastructure — that is what "API Gateway → nginx → Docker" means. So the peer is always a
private address, the default recognises it, and the caller is resolved correctly out of the
box. The case REQ-002 is about is fixed.

**What it costs, precisely.** Widening the trusted set does **not** make the normal path more
forgeable — the peer is trusted either way, so a caller-supplied `X-Real-IP` is believed to
exactly the same degree under a narrow list as under this default. That is not where the
difference is. The difference is a caller who can reach a service **directly**, bypassing the
front server, **from a private address**:

| | direct caller from `10.x` | what we record |
|---|---|---|
| explicit narrow list | their address is not trusted | **their real address** — correct, unforgeable |
| built-in default | their address is inside `10.0.0.0/8`, so we treat them as one of our hops | **whatever header they send** — forgeable |

Whether that path exists is **REQ-001 Q9** — are the container ports reachable without going
through the front server — and it is still unanswered. So this is a real, if narrow, exposure
and it should be stated to the stakeholder rather than buried.

**Why it is still the right change.** The comparison that matters is not "default versus
narrow list". A deployment that reaches this code path has **no list at all**, and with no
list nothing is trusted, so the peer is returned and the front server's own IP goes into the
audit log — REQ-001's original bug, silently. Against that, the default is a clear
improvement. A deployment that wants the stronger guarantee sets the list explicitly, exactly
as DOPA does now, and loses nothing.

## Design

1. `ClientIpResolver` gains a compiled-in `DEFAULT_TRUSTED_PROXIES`. When the constructor is
   given a null or empty list — or one whose every entry failed to parse — it uses that
   default instead.
2. **The fallback is announced, not silent.** A `WARN` at startup naming the ranges in use,
   so "correct by default" never becomes "wrong by default and nobody noticed". This is the
   part that keeps the failure mode visible; without it we would be trading one silent
   assumption for another.
3. Nothing else changes. Resolution order, the peer-trust gate, `X-Real-IP` handling and
   `UNKNOWN` are all exactly as SPEC-001 leaves them.

Keeping `app.audit.trusted-proxies` in each repo's `application.yml` is still worthwhile —
it documents the intent and it applies wherever the packaged config *is* read — but nothing
depends on it any more.

### One behaviour is deliberately removed (found by Jason, TASK-004 Q1)

Before this SPEC, an **empty** configured list meant "trust nothing". It is now the main
trigger for the built-in default, so that meaning is gone and a deployment can no longer
express "trust nothing" by supplying an empty list. This is a real, if small, loss of
expressiveness and it is intentional, not an oversight.

Nobody has asked for "trust nothing", so no flag is being added for it. If it is ever needed
— most plausibly for a deployment whose ports are directly reachable, which is REQ-001 **Q9**
and still unanswered — it can be expressed today as a list containing one address that can
never be a peer (`192.0.2.1/32`, TEST-NET-1), and we revisit properly at that point.

The existing test that pinned the old meaning (`emptyTrustedList_meansNoProxyIsTrusted`) is
renamed and re-asserted under TASK-004. That is the single authorised edit to the inherited
test suite.

## API / Interface Design

None. No endpoint, DTO, response shape or audit field changes.

## Data Model

None.

## Flow

Unchanged from SPEC-001 (Amendments 1 and 2). The only difference is where the trusted list
comes from when configuration does not supply one.

## Non-functional

- **Visibility over silence.** The startup `WARN` is a requirement, not a nicety: today's
  whole incident was a wrong audit value that looked like a normal successful call.
- **No behavioural change for configured deployments.** DOPA in UAT must behave identically
  after this change; that is a test, not an assumption.
- **Startup cost.** A handful of extra CIDR parses, once.

## Tasks

- TASK-004: Built-in trusted-proxy default + startup warning, all four services
  (depends on: TASK-003)

## Recommendation beyond this SPEC — route via Porter, not ours to change

This REQ is one symptom of something larger, and it will keep producing symptoms:
**`SPRING_CONFIG_LOCATION` replaces the packaged configuration**, so *every* setting these
services ship with is silently ignored in the deployed environment. Today it was
`trusted-proxies` and `forward-headers-strategy`. Next time it will be something else, and
it will fail just as quietly.

Changing that environment variable to `SPRING_CONFIG_ADDITIONAL_LOCATION` would make the
packaged `application.yml` load first and the server-side file override it — defaults ship
with the code, per-site values stay per-site, and nothing is silently dropped. That is a
one-word change in the deployment definition, it fixes the class of problem rather than this
instance, and it is **outside our repositories**, so it belongs to whoever owns the
deployment. SPEC-002 does not depend on it: the built-in default works either way, and is
worth having regardless.

## Questions

(Jason asks here; Sober answers as `> answer: ...`)
