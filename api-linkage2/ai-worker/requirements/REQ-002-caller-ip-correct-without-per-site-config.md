# REQ-002: The caller's IP must be recorded correctly without per-deployment configuration
- Status: DRAFT
- Priority: HIGH
- Requested: 2026-08-11 by the stakeholder (human)
- Deadline: none stated. Follows REQ-001; do not let it delay REQ-001's remaining rollout.

## Problem / Goal

REQ-001 is proven working on DOPA in UAT, but only after someone added an
`app.audit.trusted-proxies` list to that environment's `application.yml` by hand. That
list is a per-deployment step that a human must remember, in a file that lives outside
the code repositories.

The stakeholder's concern, in their words:

> "ทำให้ ไม่ต้องใส่ได้มั้ย ให้มันรับไปเลยได้มั้ย trusted-proxies
> เพราะ ทุกที่ที่เรียกควรเก็บลง logstash อย่างเที่ยงตรง"

The business point: **every deployment of every one of these services should record the
caller accurately, by default.** An audit trail whose correctness depends on someone
remembering a configuration step is one forgotten step away from silently recording the
wrong IP again — and today proved that failure is silent. Run 1 looked like a normal
successful call; the audit field was simply wrong.

This is not hypothetical. There are three more services to deploy for REQ-001, plus
whatever environments exist beyond this UAT box, each needing the same manual edit.

## Requirement

1. A freshly deployed service must record the originating caller's IP correctly **without
   any environment-specific configuration being added by hand**.
2. Deployments that *do* supply configuration must keep working — REQ-002 must not break
   the arrangement REQ-001 just proved on DOPA.
3. The protection REQ-001 established must not be weakened: a caller must not be able to
   put a value of their own choosing into the audit trail. (See Constraints — this is the
   crux.)

## Acceptance Criteria

- [ ] A service deployed with **no** `app.audit.*` configuration records the real caller's
      IP in the audit log, verified in the deployed environment.
- [ ] A deployment that does supply the configuration behaves the same as it does today.
- [ ] A caller supplying their own forwarding headers still cannot control the recorded
      value.
- [ ] Applies to all four services.

## Constraints

- **The tension in this REQ must be resolved, not ignored.** `trusted-proxies` is what
  tells the code which addresses are our own infrastructure and which is a real caller.
  It is also the mechanism that stops a caller forging their own IP into the audit trail —
  the defect class REQ-001 exists to prevent, and which Sober caught twice during REQ-001
  (SPEC-001 Amendments 1 and 2). "Just accept whatever arrives" is therefore not
  automatically safe, and the stakeholder should be told plainly what any proposed
  approach trades away.
- Known environment fact (REQ-001 Q10): legitimate callers are **mixed** — external
  customers *and* server machines — so a blanket "trust all private addresses" rule is not
  obviously correct either.
- Known deployment fact: these services run with `SPRING_CONFIG_LOCATION` pointing at a
  bind-mounted server-side `application.yml`, which **replaces** the file packaged in the
  jar. Any default that lives only in the repo's `application.yml` will not apply in these
  deployments. This is the specific reason the values did not reach UAT today.
- Standing project rules: nobody on the team commits; the stakeholder builds, deploys and
  tests.
- HOW to achieve this is the SA Lead's decision. This REQ states the outcome only.

## Out of Scope

- Changing the audit log format, the Logstash pipeline, or any other audit field.
- REQ-001's remaining rollout (DGA, RD, IEAT) — that proceeds on the arrangement already
  proven, and must not wait for this REQ.
- The forged-header probe still outstanding on REQ-001 (SPEC-001 Appendix D4). Its result
  is an input to this REQ, not part of it.

## Questions

- **Q1 (Porter → Sober): is this achievable, and what does it cost?** The stakeholder is
  asking for correct-by-default. Three things I need in language I can put in front of
  them:
  1. Can a sensible default live somewhere that survives `SPRING_CONFIG_LOCATION`
     replacing the packaged `application.yml` — so a deployment with no configuration at
     all still behaves correctly?
  2. If a safe default is possible, what exactly does it trust, and what is the failure
     mode when a deployment's topology differs from that default?
  3. If it is **not** safely possible, say so plainly and say what the honest alternative
     is. A clear "no, and here is why" is a good answer to this REQ.
- **Q2 (Porter → Sober): does the Appendix D4 forged-header result change your answer?**
  It has not been run yet. If the front server passes a caller-supplied `X-Real-IP`
  through, then loosening anything is dangerous and this REQ may need to be answered
  differently. Say whether you want to wait for it.

- **Q1 answer (Sober → Porter, 2026-08-11 18:12): yes, it is achievable, it is a small
  change, and here is what it costs.** Design in `specs/SPEC-002-built-in-trusted-proxy-default.md`,
  work in `tasks/TASK-004-built-in-trusted-proxy-default.md`.

  **1. Can a default survive `SPRING_CONFIG_LOCATION` replacing the packaged file?**
  Yes — by not being configuration. The reason today's default vanished is that it lives in
  `src/main/resources/application.yml`, and that file is replaced wholesale. Move the default
  **into the code**: `ClientIpResolver` already receives its list through its constructor, so
  when that list arrives empty — exactly what happens when no `app.audit.*` config exists —
  it uses a list compiled into the class instead. A config file cannot replace code, so it
  applies everywhere, with no deployment step. Configuration, when present, still wins, so
  the DOPA arrangement proven today is untouched.

  **2. What does it trust, and what is the failure mode?**
  Loopback, the three private ranges (`10/8`, `172.16/12`, `192.168/16` — the middle one
  covers Docker bridges) and link-local. Every deployment of these services sits behind
  privately-addressed infrastructure, which is what "API Gateway → nginx → Docker" means, so
  the peer is always recognised and the caller resolves correctly out of the box.

  The cost is narrow and specific, and I would rather you put it in front of the stakeholder
  than have it discovered later. Widening the trusted set does **not** make the normal path
  more forgeable — the peer is trusted either way. The difference appears only for a caller
  who can reach a service **directly**, bypassing the front server, **from a private
  address**: with an explicit narrow list we record their real address; with the built-in
  default we would treat them as one of our own hops and believe the header they send.
  Whether that path exists at all is REQ-001 **Q9**, still unanswered.

  **Why I still recommend doing it.** The comparison is not "default versus narrow list".
  A deployment that reaches this code path has **no list at all** — and with no list, nothing
  is trusted, the peer is returned, and the front server's IP goes into the audit log. That is
  REQ-001's original bug, arriving silently. Against *that*, the default is a clear
  improvement, and any deployment wanting the stronger guarantee sets the list explicitly and
  loses nothing.

  **3. One thing I insisted on in the design, and it is the part I care most about:** when the
  built-in default is used, the service logs a `WARN` at startup naming the ranges. "Correct by
  default" must never become "wrong by default and nobody noticed" — today's whole incident was
  a wrong audit value that looked like a perfectly normal successful call.

  **And a recommendation beyond this REQ, which is yours to route, not mine to change.**
  REQ-002 is a symptom. `SPRING_CONFIG_LOCATION` **replaces** the packaged configuration, so
  *every* setting these services ship with is silently ignored in the deployed environment.
  Today it was `trusted-proxies` and `forward-headers-strategy`; next time it will be something
  else, and it will fail just as quietly. Changing that one environment variable to
  `SPRING_CONFIG_ADDITIONAL_LOCATION` makes the packaged file load first and the server-side
  file override it — defaults ship with the code, per-site values stay per-site, nothing is
  silently dropped. One word in the deployment definition, fixes the whole class, and it is
  outside our repositories. SPEC-002 does not depend on it and is worth having either way.

- **Q2 answer (Sober → Porter, 2026-08-11 18:12): no, D4 does not change the design — but do
  not let that make it sound optional, because D4 matters more than this REQ does.**

  It does not change the answer because the built-in default only decides *which addresses we
  treat as our own hops*. Whether the front server passes a caller-supplied `X-Real-IP`
  through is a separate question about whether that header can be trusted **at all**, and it
  applies identically with a narrow list, with the built-in default, and to what is running in
  UAT right now. So there is nothing to wait for: TASK-004 can proceed.

  But please do not let it slide down the list. **If D4 comes back showing the header passes
  through, then the audit trail on a deployed, "verified working" service is caller-forgeable
  today** — someone can put any IP they like into a government data-access evidence log. That
  would be more serious than anything REQ-002 is about, and it would need its own REQ. One
  extra call answers it. I would run it before, or alongside, the DGA/RD/IEAT rollout rather
  than after.
