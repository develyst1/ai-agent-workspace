# Board — api-linkage2

> Single source of truth. Update me at the end of every session (see PROTOCOL.md).

## Project info

- Description: Four Thai government API linkage services (proxy/middleware). Each
  receives a request, validates JWT, exchanges a token with the upstream agency,
  forwards the call, and returns the result while logging it.
- Code repository: `C:\Users\Admin\sa-project\api-linkage2`
  - `DID-dopa-linkage2` — Department of Provincial Administration (LK2 hub)
  - `DID-dga-api-v2` — Department of Business Development
  - `DID-rd-api-v2` — Revenue Department
  - `DID-ieat-api-v2` — Industrial Estate Authority of Thailand
- Reference docs in repo root: `LK2.md` (summary), `LK2.json`, `LK2.pdf` (linkage status report)
- Team: Porter (PM) · Sober (SA Lead) · Jason (BE)

> ## 🚫 STANDING RULE — git commits (stakeholder, 2026-08-11 16:39)
>
> **Nobody on this team commits anything, in any of the code repos, ever.** The
> stakeholder does all commits personally, and will **not** commit until the change is
> deployed and verified working. Their words: "เรื่อง commit ฉันเป็นคนทำเอง ฉันจะยัง
> ไม่ commit จนกว่าจะ deploy แล้วทำงานได้ผ่านนะ ห้ามใครทำ".
>
> This applies to every role and is not scoped to REQ-001. No `git commit`, `git add`,
> `git stash`, branch creation, or anything else that mutates git state. Work stays as
> uncommitted working-tree changes until the stakeholder says otherwise. If a task ever
> seems to need a commit, stop and route it to Porter.

## Requirements

| ID | Title | Priority | Status | Owner of next step |
|----|-------|----------|--------|--------------------|
| REQ-001 | Audit log must record the caller's IP, not the linkage server's IP | HIGH (urgent) | **SPEC_DONE — verified working on DOPA in UAT (run 4, 18:06): `clientIp=110.171.40.169`.** NOT `DELIVERED`: the REQ covers all four services (Q1) and only DOPA is deployed. Evidence: `../project-docs/2026-08-11-uat-run-4-AFTER-evidence-dopa-fixed.md` | **Stakeholder** — deploy DGA/RD/IEAT (same two-part change, Appendix C4) + run the forged-header probe (Appendix D4). Then Porter sets DELIVERED. |

| REQ-002 | Caller's IP recorded correctly **without per-deployment config** | HIGH | **IN_SPEC** → SPEC-002 written, TASK-004 raised (Sober, 18:12). Answer to Porter's Q1/Q2 is in the REQ. | Jason (TASK-004) |

## Specs

| ID | Title | Source | Status |
|----|-------|--------|--------|
| SPEC-001 | Record the originating caller's IP in the audit log | REQ-001 | **DONE** (18:02 — Amendments 1 & 2, Appendices A-D) |
| SPEC-002 | Correct caller IP without per-deployment configuration | REQ-002 | **ACTIVE** (18:12) |

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-001 | Client IP resolution + diagnostics in DID-dopa-linkage2 | SPEC-001 | **DONE** (Sober, 15:40 — verified 43/43 by re-running the suite) | Jason | — |
| TASK-002 | Roll client IP resolution out to DGA, RD and IEAT | SPEC-001 | **DONE** (Sober, 15:58 — verified 22/22 in each of the three, resolver diff = package line only) | Jason | TASK-001 (satisfied) |
| TASK-003 | Add `X-Real-IP` as a trusted-peer-only fallback, all four services | SPEC-001 (Amendment 2) | **DONE** (Sober, 18:02 — verified by re-running all four suites: DOPA 48/48, other three 27/27, resolver diff = package line only, 13 original tests unedited) | Jason | TASK-002 (satisfied) |
| TASK-004 | Built-in trusted-proxy default + startup warning, all four services | SPEC-002 | **BLOCKED (Jason, 18:36 — waiting: Sober, Q1)** — implementation + 5 new tests done in DOPA; `emptyTrustedList_meansNoProxyIsTrusted` asserts the exact behaviour SPEC-002 removes, so it cannot pass unedited. Not propagated to the other three. | Jason | TASK-003 (satisfied) |

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| **TASK-004 (Jason → Sober)** | **Sober — TASK-004 Q1** | An existing resolver test, `emptyTrustedList_meansNoProxyIsTrusted`, asserts that an empty configured list means trust nothing — the exact behaviour SPEC-002 replaces. It cannot pass unedited and the DoD says stop rather than work around it. Implementation + 5 new tests are done in DOPA (22 of 23 pass); nothing propagated to DGA/RD/IEAT. |
| REQ-001 acceptance | **Deployment owner (via Porter)**, then deployment itself | Sober's assessment of the did-047 reference is **done (16:05)** — see SPEC-001 Amendment 2 and REQ-001 Q10. Q7/Q8/Q9 stay open but must now be re-routed to the deployment owner or the did-047 team, **not re-asked of the stakeholder**. New **Q10**: can a legitimate caller ever arrive from an internal address (10.x / 192.168.x)? That one decides whether our `trusted-proxies` values are right. |
| ~~UAT run 1 result~~ | — | **Diagnosed (Sober, 17:12) — SPEC-001 Appendix B. Almost certainly (a): the running artifact is not the fixed build.** Decisive argument: with `trusted-proxies` containing `10.0.0.0/8`, the fixed resolver has **no code path that can output `10.32.1.60`** — that value is the pre-fix behaviour — and the `audit.clientip` logger does not exist in the old code, which explains the missing DEBUG line too. Likely mechanism: the fix exists only in the local working tree (no-commit rule), so anything built from git `HEAD` lacks it. |
| **REQ-001 Q7(a) — ANSWERED, on the good branch (run 3, 17:41)** | — | `X-Real-IP=[110.171.40.169]`, `X-Forwarded-For=[]`. **The caller's IP does reach the application.** The standing risk since 15:58 — "nginx discards it, no code change can recover it" — is closed. **No nginx change is required for REQ-001.** |
| **UAT run 4 — needs the stakeholder (code side is complete)** | **Stakeholder** | **TASK-003 is DONE and verified, so the code half of REQ-001 is finished in all four services.** Two things must ship **together in one deployment**: (1) the Appendix C lines in the server-side `/config/application.yml`, (2) a **freshly built jar** — `mvn clean package -DskipTests` in `DID-dopa-linkage2`, from the working tree, no git operation. Expected result: `clientIp = 110.171.40.169`. **Deploy once, with both changes** — Appendix C's server-side config **and** TASK-003. Confirmed in **Appendix D2**: config alone → `UNKNOWN`; TASK-003 alone → `10.32.1.60`; both → `110.171.40.169`. Also in **D4**: one free extra call with a bogus `X-Real-IP: 8.8.8.8` header settles whether the front server overwrites it — the one residual integrity question now that a single-value header is our only source. |
| ~~UAT run 2~~ | — | **Root cause found (Porter 17:23 + Sober 17:28): the jar is correct; the config never reached UAT.** The container reads a bind-mounted **server-side** `/config/application.yml` via `SPRING_CONFIG_LOCATION`, which *replaces* the packaged one — so `trusted-proxies` and `forward-headers-strategy: none` are simply absent there, and the empty trusted list makes the fixed code return the untrusted peer `10.32.1.60`. **SPEC-001 Appendix C** has the exact lines to add to that server-side file, the reasoning for the narrow trusted list, and how to read the next run. Sober's Appendix B explanation (a) was **wrong** and is corrected in C. |
| ~~Deploying the fix~~ | — | **Done (stakeholder, 17:05) — DOPA is deployed to UAT and a call was made.** Runbook was SPEC-001 Appendix A (Sober, 16:47). | Everything Sober owed is delivered: **SPEC-001 Appendix A** is the copy-pasteable runbook — both forms of the diagnostic switch (the env-var form **verified by Sober by running it**, not inferred), where the line comes out (**service stdout, NOT Logstash / not the log-viewer screen**), a real sample line, good-vs-bad readings, and what to send back. Build with `mvn clean package -DskipTests` from the working tree — no git operation of any kind. |
| ~~SPEC-001 post-merge re-verification~~ | — | **Done (Sober, 15:28): SPEC-001 stands. `getClientIp` and `forward-headers-strategy: native` are unchanged by the merge in all four services.** |
| ~~TASK-001 SA review~~ | — | **Done. Round 1 (15:28): REWORK — defect caused by an error in my SPEC, corrected in Amendment 1. Round 2 (15:40): DONE — fix verified, 43/43 tests re-run by Sober, the 12 original tests unedited.** |

> **[Sober, 2026-08-11 15:28] Post-merge re-verification: SPEC-001 stands.** Re-read all
> four services at the merged HEADs. `getClientIp` is still byte-identical everywhere and
> all four still carry `forward-headers-strategy: native`, so the diagnosis is unchanged.
> `9af4da9` (async body copy) restructured `RequestAuditFilter` but did not touch
> `getClientIp`; `c077c7b` is about our **outbound** egress to DGA, not the inbound caller.
> SPEC-001 moved DRAFT → ACTIVE, with **Amendment 1** correcting a genuine flaw in my own
> resolution rule (details in the SPEC and in TASK-001 `## Review`).

> **[Porter, 2026-08-11 16:04] Q7/Q8/Q9 came back unanswered — with a substitute.**
> The stakeholder is not the person who runs the deployment and cannot answer the
> environment questions. They pointed instead at a fix another Smart-Alliance team
> already shipped for the same symptom: `did-047-api-management-sso` commit
> `c5c4650` (2026-08-07) — a new `ClientIpResolver` + tests + a `DbAuditHelper`
> change. Diff and provenance collected into `../project-docs/`
> (`2026-08-11-reference-did047-client-ip-fix.md` / `.patch`). Their instruction:
> "เอาไปคุยและ ดูกันนะ ว่าใช่แบบที่เข้าใจมั้ย". **@Sober to assess — this does NOT
> close Q7/Q8/Q9 and does not satisfy the Acceptance Criteria.** Q7/Q8/Q9 now need
> to reach the deployment owner, and Porter needs to know from Sober which of them
> still genuinely matter after reading the reference.

> **[Porter, 2026-08-11 16:25] Real network facts arrived — Q7(d) and Q10 answered.**
> From the stakeholder's own infrastructure team, recorded in
> `../project-docs/2026-08-11-network-facts-from-stakeholder.md`: requests hit
> **`10.32.1.60` first** → backend **`10.32.1.62`** (the four services) → Logstash
> **`10.32.2.62`**. **`10.32.1.60` is the front server** — the same address in the bad
> log record, so Q7(d) is answered by the people who run it. **Q10 = mixed**: callers
> are both external customers and server machines, *not* always external — the branch
> Sober refused to guess about. Also new: the stakeholder now has a working channel to
> their infrastructure team, so **Q7(a)/(b) is finally askable**. @Sober to say which
> facts he wants; Porter fetches them. Hold on TASK-003 still stands.

Open threads (not blocking TASK-001, but **blocking REQ-001 acceptance**):

- **REQ-001 Q7 (DATA REQUEST, Sober → Porter → stakeholder)** — nginx and API Gateway
  forwarding config, the public IP of a test call, and the internal nginx/Docker
  addresses. If nginx or the gateway overwrites `X-Forwarded-For` instead of appending,
  **the real fix is outside the four repos** and comes back to Porter as a config change.
- **REQ-001 Q8 (Sober → Porter)** — is the log-viewer screen in the evidence fed by our
  Logstash or by the API Gateway's own logging? And can legitimate callers ever arrive
  from an internal/private address?
- **REQ-001 Q9 (Sober → Porter, new from the post-merge review)** — are the services'
  published container ports reachable without going through nginx? Code is already
  hardened against the case (SPEC-001 Amendment 1), so it blocks nothing; but a "yes"
  is an exposure worth raising with the stakeholder on its own merits.
- Q6 (empty `แอปพลิเคชัน` field on the same record) is parked — Porter to confirm
  with the stakeholder; it becomes its own REQ if in scope, never a silent addition
  to REQ-001.

## Known context (from `LK2.md` in the code repo — background only, not a requirement)

- Already linked: DOPA civil registration(1), house registration(38), labour(82),
  factory(152); DGA juristic person(BR01001T), shareholders(BR02001T),
  foreigner(BR05001T); RD Por.Por.20; IEAT industrial-estate land (code ready,
  upstream data not ready).
- Not linked yet (correctly absent from code): bankruptcy(24), land title(18),
  mining concession(500), all weapons/ordnance (อท.) services.
- Caveat: DOPA accepts **production** service IDs only (1, 38, 82, 152). The LK2
  mockup IDs (labour=39, factory=40) will fail if used for testing.
