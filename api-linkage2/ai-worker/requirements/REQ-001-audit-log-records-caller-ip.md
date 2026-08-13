# REQ-001: Audit log must record the caller's IP, not the linkage server's IP
- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-11 by the stakeholder (human)
- Deadline: none fixed — stakeholder says **urgent** ("ด่วน"). Treat as top of queue.

## Problem / Goal

These four linkage services are the gateway through which external parties reach
Thai government data services. Every call is permission-checked and written to an
audit log (shipped to Logstash). The IP address in that audit log is what tells us
**who actually made the request** — it is the evidence trail for "which external
party looked at which citizen's data".

After deployment, that evidence is wrong. The stakeholder reports that the audit
log records **the IP of the machine/environment the linkage services are deployed
on**, instead of the IP of the external user who called the API. Every call
therefore looks like it came from the linkage service itself.

Impact: the audit trail cannot identify the caller. For a government data-access
gateway this defeats the purpose of the log — it breaks accountability,
investigation of misuse, and any per-caller reporting.

The stakeholder's own words (Thai):

> "ตอนเก็บ log stash มันเก็บ ip ยังไง ตอนเราเอาไป deploy พบว่า เวลาเรียกใช้ api
> แล้ว มันเก็บ ip ที่ใช้ deploy linkage พวกนี้ ลง log แทนที่จะเป็น ip user ที่
> เรียก api"

## Requirement

1. The audit log entry for an API call must record the IP address of the
   **end user who originated the request** — the party that called our API, not
   any intermediary and not our own deployment. (Confirmed by the stakeholder,
   see Q4.)
2. This must hold when the services run in the deployed environment, not only on
   a developer machine.
3. When the originating caller's IP genuinely cannot be determined, the log must
   make that explicit (an unambiguous marker) rather than silently substituting
   the linkage server's own IP.
4. Existing audit fields and the existing data-masking behaviour must not be
   degraded by this change.

## Acceptance Criteria

- [ ] A call made from a known external IP produces an audit log entry in
      Logstash whose IP field equals that external IP.
- [ ] The same call no longer records the linkage service's own deployment IP as
      the caller.
- [ ] Verified on the deployed environment, not only locally — with before/after
      evidence (log lines) attached to the REQ or `project-docs/`.
- [ ] Applies to every service in scope (see Q1).
- [ ] No other audit field is lost, and masked fields stay masked.

## Evidence (before-state)

`../project-docs/2026-08-11-evidence-log-detail-wrong-ip.md` — transcription of a
real log-detail record supplied by the stakeholder on 2026-08-11:
DOPA Linkage2, `serviceId: 1`, status 200, **IP ADDRESS = `10.32.1.60`** (a private
address, i.e. not an external caller). The `แอปพลิเคชัน` (application) field on the
same record is also empty — noted, not yet in scope (see Q6).

## Constraints

- **Deployed topology (stakeholder, Q2): API Gateway → nginx → Docker.** The
  services sit behind at least these three hops. Whatever the fix is, it must work
  with that path as it actually exists in the deployed environment — including any
  hop that has to be configured to pass the caller's IP through. If a change is
  needed outside the four code repos (gateway or nginx configuration), that is a
  legitimate outcome: raise it via Porter rather than working around it in code.
- No real database access or production querying by the team. Evidence and
  environment facts come from the stakeholder.
- **The stakeholder owns all git commits and all deployment.** (2026-08-11 16:39) No
  role on this team commits anything, in any repo. The stakeholder will not commit until
  the change is deployed and verified working, so the change ships to UAT as
  uncommitted working-tree code. They also deploy and run the test call themselves —
  they hold the environment and the token.
- HOW to obtain the caller IP is a technical decision for the SA Lead — this REQ
  states only the required outcome.

## Out of Scope

- Changing what else is logged, the log format, or the Logstash pipeline itself.
- Permission/authorization logic.
- Adding new linkage services or new upstream integrations.

## Questions

(SA Lead asks here; Porter answers as `> answer: ...`)

- Q1 (Porter → stakeholder): Which services are in scope — all four
  (`DID-dopa-linkage2`, `DID-dga-api-v2`, `DID-rd-api-v2`, `DID-ieat-api-v2`), or
  only the one where the problem was observed?
  > answer (stakeholder, 2026-08-11): **All four.**
- Q2 (Porter → stakeholder): What sits in front of the services in the deployed
  environment (load balancer, ingress, nginx, API gateway, Docker/Kubernetes), and
  how many hops? This decides what the services can even see.
  > answer (stakeholder, 2026-08-11): **API Gateway → nginx → Docker.**
  > (Vendor/product names and per-hop configuration not yet supplied — ask via
  > Porter if the design needs them.)
- Q3 (Porter → stakeholder, DATA REQUEST): A real audit log line from the deployed
  environment showing the wrong IP, plus the IP the call was actually made from.
  > answer (stakeholder, 2026-08-11): Supplied a log-detail screenshot, transcribed
  > to `../project-docs/2026-08-11-evidence-log-detail-wrong-ip.md` — recorded IP is
  > `10.32.1.60`. The stakeholder does **not** know where to obtain the true caller
  > IP and asked the team to understand the code first ("ลองคุยกับ sober ทำความเข้าใจ
  > code ดู"). So the "should have been X" half of the comparison is still open.
  > **@Sober:** read the code, then raise a narrow, copy-pasteable DATA REQUEST for
  > exactly what you need observed (e.g. which headers actually arrive at the app,
  > or the nginx/gateway config lines) — Porter will get it from the stakeholder.
  > Do not connect to any environment yourself.
- Q4 (Porter → stakeholder): Is "the external caller" the end user's own IP, or the
  IP of the partner system that integrates with us? (i.e. what should the audit
  trail hold accountable?)
  > answer (stakeholder, 2026-08-11): **The end user's own IP** — the person who
  > called our API. That is what must be stored in the log.
- Q5 (Porter → stakeholder): Deadline / urgency — is this blocking a production
  go-live or an audit?
  > answer (stakeholder, 2026-08-11): **Urgent** ("ด่วน"). No fixed date given.
- Q7 (Sober → Porter, **DATA REQUEST** — 2026-08-11, after reading the code):
  I have designed SPEC-001 and it is safe to build now, but **it cannot be proven to
  fix the symptom without these facts**, and one of them may move the fix outside our
  repos entirely. Nothing here needs a database or a login — it is configuration text
  and a header capture. Please ask the stakeholder for, in priority order:

  **(a) The nginx config for these services — the `location`/`server` block.**
  Specifically whether it contains lines like:
  ```
  proxy_set_header X-Real-IP        $remote_addr;
  proxy_set_header X-Forwarded-For  $proxy_add_x_forwarded_for;
  ```
  What matters is `$proxy_add_x_forwarded_for` (**appends**, keeps the caller) versus
  `$remote_addr` (**overwrites**, destroys the caller). If it overwrites, or the lines
  are absent, **no code change in the four repos can recover the caller's IP** and the
  fix is an nginx change — which per this REQ's Constraints comes back to you, not a
  workaround in code.

  **(b) The same question for the API Gateway hop** (the one in front of nginx): does
  it forward the caller in `X-Forwarded-For`, and does it *preserve* an inbound
  `X-Forwarded-For` or replace it? Product/vendor name is enough to start.

  **(c) The public IP that a test call is made from** — just "I called it from
  x.x.x.x at HH:MM". Needed for the before/after evidence the Acceptance Criteria
  require; without it we still cannot say "it should have read X".

  **(d) The internal addresses of the nginx host and the Docker gateway/bridge**
  (e.g. is `10.32.1.60` one of them?). Used to narrow `app.audit.trusted-proxies` from
  the wide RFC1918 default to the real hops. The change is deployable without this;
  the list is just safer once it is known.

  If (a) and (b) cannot be obtained: TASK-001 adds a `DEBUG` diagnostic that dumps the
  forwarding headers exactly as they arrive at the application. Deploy it, switch that
  logger to `DEBUG`, make one call, and send the resulting line — that answers (a),
  (b) and (d) at once from the application's own point of view.

- Q8 (Sober → Porter, 2026-08-11): Two facts I need before I can call REQ-001 done,
  neither of which I may go and check myself:
  1. **Is the log-viewer screen in the evidence fed by our Logstash?** The record's
     response body `{"message":"","statusCode":200,"traceId":""}` matches the string
     our `RequestAuditFilter.buildResponseBody()` constructs, character for character,
     which is strong evidence that it is ours. But the screenshot also showed
     `pamt-linkage-service` behind the dialog. If that screen is actually fed by the
     API Gateway's own logging rather than our Logstash, then fixing the four services
     will not change what the stakeholder sees, and we would be reporting success
     against the wrong pipe.
  2. **Can a legitimate caller ever reach us from a private/internal address**
     (an intranet client, another government system on the same network)? SPEC-001
     logs `UNKNOWN` when the resolved address is a trusted internal hop. If real
     internal callers exist, some genuine calls would read `UNKNOWN`, and you should
     know that is by design rather than a new defect.

- Q9 (Sober → Porter, 2026-08-11 — **the one new fact the post-merge review added**;
  you said at 15:12 you would ask for anything new separately, this is it):
  **Are the services' published container ports reachable without going through nginx?**
  i.e. can anything on the internal network hit `10.32.x.x:30006` (DOPA), `:30004` (RD),
  `:30003` (IEAT) or the DGA port directly, or does the firewall/Docker port binding force
  every call through the API Gateway → nginx path?

  Why it matters: our whole defence rests on the request arriving through a proxy we trust.
  If a caller can connect directly, they can hand us any `X-Forwarded-For` they like and we
  would have no way to tell. I have already hardened the code against it (SPEC-001
  Amendment 1) so **this does not block anything** — but if the answer is "yes, they are
  reachable directly", that is an exposure worth telling the stakeholder about on its own
  merits, separately from REQ-001.

  Not urgent, and not a DATA REQUEST in the strict sense — a yes/no from whoever runs the
  deployment is enough.

- **Q7/Q8/Q9 — stakeholder response, 2026-08-11 16:04 (Porter):**
  > answer: The stakeholder **cannot answer Q7, Q8 or Q9** — verbatim: "ฉันไม่รู้จะ
  > ตอบไง". They are not the person who runs the deployment. Instead they offered a
  > different kind of evidence: **another Smart-Alliance team has already shipped a
  > fix for this same symptom**, in `did-047-api-management-sso`, commit `c5c4650`
  > (2026-08-07) "fix(audit): resolve the real client IP behind the proxy chain" —
  > a new `ClientIpResolver` + tests, plus a small change to `DbAuditHelper`.
  >
  > Collected into `../project-docs/`:
  > - `2026-08-11-reference-did047-client-ip-fix.md` (provenance + what to look for)
  > - `2026-08-11-reference-did047-client-ip-fix.patch` (the full diff)
  >
  > The GitHub link is a private repo and not reachable anonymously; Porter
  > extracted the diff from the existing local clone
  > `C:\Users\Admin\sa-project\did-047-api-management-sso` after `git fetch --all`,
  > read-only.
  >
  > Stakeholder's instruction, verbatim: **"เอาไปคุยและ ดูกันนะ ว่าใช่แบบที่เข้าใจมั้ย"**
  > — compare it against our understanding and report back whether it matches.
  >
  > **@Sober:** this does **not** close Q7/Q8/Q9 and does not satisfy the Acceptance
  > Criteria (which still require before/after evidence from the deployed
  > environment). What Porter needs from you is a comparison: does that team's
  > resolver agree with SPEC-001, and does anything in it — trusted-proxy list,
  > header choice, hop addresses — tell us what the nginx / API Gateway hops
  > actually send, which is what Q7 was trying to find out? If it disagrees with
  > SPEC-001, say which one is right and why. Note the caveat in the .md: that is a
  > different service with a database audit path (`DbAuditHelper`), not our
  > `RequestAuditFilter` → Logstash path.

- Q10 (Sober → Porter, 2026-08-11 16:05, **after reading the did-047 reference**):
  The reference was genuinely useful — thank you for collecting it, and the caveat you
  attached to it was the right one. Assessment in SPEC-001 Amendment 2; three consequences
  for you.

  **(a) Q7(a) may already be answered, and the answer is the bad branch.** One of their
  tests carries the comment *"เคสที่เห็นบน UAT ตอนนี้: nginx ไม่ส่ง IP จริงมา"* — as of
  2026-08-07 nginx was sending only container hops, no real caller IP. If that is also true
  of our vhosts, then **our four services will log `UNKNOWN` after deployment**, correctly
  and by design, and the remaining fix is `proxy_set_header` at nginx — outside our repos,
  and yours to route. Different service and possibly a different vhost, so treat it as
  strong evidence, not proof. It does mean nobody should be surprised by `UNKNOWN`.

  **(b) The stakeholder is the wrong person for Q7/Q8/Q9 — please re-route, don't re-ask.**
  They said so themselves ("ฉันไม่รู้จะตอบไง"), and pushing the same questions at them again
  will only cost time on an urgent REQ. Two better sources, either of which unblocks us:
  the person who runs the deployment, or **the did-047 team** (commit author
  `punyanuch463`) — they clearly already looked at these hops and may simply be able to say
  what nginx sends and what their trusted addresses are. If reaching another team needs the
  stakeholder's blessing, that is a one-line ask rather than an environment interrogation.

  **(c) NEW and the one that could still make us get this wrong: can a legitimate caller of
  our four services ever arrive from an internal/private address** (10.x, 192.168.x) —
  an intranet user or another government system on the same network? This is Q8(b) sharpened
  into a decision. The did-047 team deliberately **excluded** `10.0.0.0/8` and
  `192.168.0.0/16` from their "infrastructure" list because *their* users sit on the internal
  LAN. Our `trusted-proxies` currently **includes** both ranges. If our callers can be
  internal too, our resolver would treat a genuine caller as a proxy hop, skip them, and log
  `UNKNOWN` — safe, but it would fail this REQ's first Acceptance Criterion. **I am not
  changing those values on a guess.** A plain answer is enough: "callers are always external
  / callers can be internal / mixed".

- Q11 answer (Sober → Porter, 2026-08-11 16:47):

  **Yes — your reading is correct, and it is worth telling the stakeholder plainly.**
  On the did-047 team's own UAT, their service records the container's own address as the
  caller. It is not an inference from two facts placed side by side; their code and their
  test say it outright. `ClientIpResolver.resolve()` ends with
  `if (resolved == null) resolved = remoteAddr;`, and the test
  `forwardedForWithOnlyContainerHops_fallsBackToRemoteAddr` asserts the result is
  `172.22.0.4` — a Docker bridge address — under the comment *"เคสที่เห็นบน UAT ตอนนี้:
  nginx ไม่ส่ง IP จริงมา"*. So they know it, and they shipped it that way deliberately.

  **So the answer to "ถ้าเราทำตามมันจะใช้งานได้แบบเขาเลยมั้ย" is: yes, it would work
  exactly like theirs — and theirs does not fix this symptom.** Copying them would
  reproduce our own bug in a new outfit: instead of recording `10.32.1.60` (our front
  server) we would record the container address. Different number, same defect — our own
  infrastructure's IP recorded as if it were the caller's.

  Two things to be fair to them about, so this does not read as criticism of their work:
  their code is sound and well-reasoned, and the reason their fix does not solve it is
  **not** a coding mistake — it is that nginx never sent them the caller's IP. No code
  can recover information that never arrived. Our version differs on one deliberate point:
  where they fall back to the container address, we return `UNKNOWN`, because REQ-001
  requirement 3 says an undeterminable caller must be marked as such rather than silently
  replaced. That is the whole difference, and it is the difference the stakeholder actually
  asked for.

  **Anything else in their diff we are still missing, beyond `X-Real-IP`?** I went through
  the whole change. Only one thing, and it is **configuration, not code**:

  - They treat **link-local addresses** as infrastructure to be skipped — `169.254.0.0/16`
    and IPv6 `fe80::/10`. Our `trusted-proxies` does not list either, so if such an address
    ever appeared in the chain we would report it as the caller. It has never been observed
    in our environment and it is a one-line YAML addition whenever we next touch that list —
    no rebuild, no task. Noted so it is not lost.
  - Everything else in their diff we already have or deliberately do differently: port
    stripping, `::ffff:` unwrapping, bracketed IPv6, right-to-left walking, DEBUG header
    logging — all present. Their literal `"unknown"` handling we get for free, since our
    parser skips anything that is not a valid IP. Their `DbAuditHelper` edit is the
    equivalent of our filter wiring. Their `isInfrastructure` is string-prefix matching
    where ours is real CIDR from configuration — ours is the stronger of the two.

  Net: **we are not behind them anywhere.** We are ahead on two points that matter for this
  REQ (the peer-trust gate and `UNKNOWN`), level everywhere else, and the one thing they had
  that we lacked — `X-Real-IP` — is TASK-003, which the stakeholder has sensibly deferred
  until the diagnostic says whether that header is even present.

- Q12 (Sober → Porter, 2026-08-11 16:47) — **the facts I want from the infrastructure team,
  now that a channel exists.** You asked me to name them rather than invent a list yourself;
  here it is, deliberately short, because the UAT deployment is about to answer the biggest
  one for free.

  **Do NOT ask yet:** whether the front server forwards the caller in `X-Forwarded-For` /
  `X-Real-IP` (Q7(a)/(b)). **The DEBUG line from the UAT run answers that empirically within
  one call**, and an answer we observe ourselves beats one relayed through three people.
  Hold it in reserve — if the diagnostic shows nothing arriving, *then* the nginx
  `location` block for the DOPA UAT path is exactly what we need, and by then we will be
  asking for a specific fix rather than a survey.

  **Worth asking now, because the deployment cannot answer either and both decide
  `trusted-proxies`:**
  1. **Do the "server machine" callers sit inside `10.32.x`?** If yes, our current
     `trusted-proxies` of `10.0.0.0/8` would swallow a genuine caller and log `UNKNOWN`.
     If they are elsewhere, the current values are safe as they stand.
  2. **Is `10.32.1.60` the nginx host, the API Gateway, or both on one box — and is there
     any hop between it and `10.32.1.62` that we have not been told about?** This decides
     whether a narrow trusted list can be just those two addresses.

  Both are one-line answers. Neither blocks the deployment; they shape the config change
  that follows it.

- Q6 (Porter, raised from the evidence): The same log record has an empty
  `แอปพลิเคชัน` (application) field. Possibly related, possibly a separate defect.
  **Not in scope for REQ-001** unless the stakeholder confirms. Porter to ask; if
  confirmed it becomes its own REQ, not a silent addition to this one.

- **Q11 (Porter → Sober, 2026-08-11 16:16) — asked directly by the stakeholder:**
  *"ถ้าเราทำตามมันจะใช้งานได้แบบเขาเลยมั้ย"* — if we do exactly what did-047 did, will
  it work the way theirs works?

  I am not answering this by inference. Two facts recorded side by side in SPEC-001
  Amendment 2 point at an uncomfortable conclusion:
  (i) their resolver falls back to `remoteAddr`, asserted by their own test; and
  (ii) their test comment says that on UAT as of 2026-08-07, nginx sent only container
  hops. Taken together, **their own service on that UAT would log the container's
  address** — the same defect the stakeholder reported to us. If so, "copy them exactly"
  reproduces our bug instead of fixing it, and the stakeholder must hear that plainly.

  **@Sober:** please confirm or refute, and cover the whole diff — is there anything
  else in their change we are still missing beyond `X-Real-IP` (TASK-003)? The
  stakeholder's question is about the whole thing, not only the part that became a task.
  The hold stands; this is a question, not a restart.

- **Q10 + Q7(d) — answered by the stakeholder's team, 2026-08-11 16:25.**
  Full record with the stakeholder's verbatim words:
  `../project-docs/2026-08-11-network-facts-from-stakeholder.md`

  > answer: **Callers are mixed** — both external customers from arbitrary internet
  > locations *and* server machines. Not "always external".
  >
  > **Named hosts:** requests hit `10.32.1.60` **first**, which then forwards to the
  > backend server `10.32.1.62` where the four linkage services run. Logstash is
  > `10.32.2.62`.
  >
  > **`10.32.1.60` is the front server** — the same address recorded in the bad log
  > entry. Q7(d) asked "is `10.32.1.60` one of the hops?" and the answer is yes,
  > confirmed by the people who run it.
  >
  > **@Sober:** Q10's answer is the awkward one you were guarding against — legitimate
  > callers are not all external. Judgement is yours; two things Porter can still fetch
  > now that the stakeholder is relaying to their infrastructure team, if you want them:
  > (i) do the "server machine" callers sit inside `10.32.x`, i.e. do they collide with
  > our trusted ranges; (ii) is `10.32.1.60` the nginx host, the API Gateway, or both on
  > one box. Ask and Porter will get them.
  >
  > Still **not** answered: Q7(a)/(b) — what that front server actually sends. Knowing
  > its address does not tell us whether it forwards or overwrites the caller's IP.

- **Q7(c) — ANSWERED by the stakeholder, 2026-08-11 16:50.**
  > answer: The public IP the test call will be made from is **`110.171.40.169`**.
  >
  > This closes the half of the evidence that has been missing since Q3. We have always
  > had the IP the audit log *recorded* (`10.32.1.60`) and never the IP the call was
  > actually *made from*. With both, the before/after comparison the Acceptance Criteria
  > demand is finally constructible:
  > **expected `110.171.40.169` · recorded `10.32.1.60`.**
  >
  > Caveat: if the stakeholder's connection is dynamic, this value must be re-confirmed
  > at the moment of the call rather than assumed to still hold. Porter has told them.
