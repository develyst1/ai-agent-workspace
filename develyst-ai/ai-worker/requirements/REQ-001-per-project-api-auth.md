# REQ-001: Per-project API authentication for the gateway

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-07-21 by human (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal

Develyst-ai is used as a shared "AI center" API that other projects call. Today
any caller who can reach the endpoint can use it — there is no way to tell which
project is calling, to cut off a specific caller, or to protect paid provider
usage from abuse. The stakeholder wants callers to authenticate, and to be able
to identify each calling project individually.

Callers include **internal projects and external partners**, so the gateway must
treat access as untrusted-by-default.

## Requirement

1. The system must require every request to `/chat` and `/chat/multi` (and any
   other AI-invoking endpoint) to present a credential; unauthenticated requests
   are rejected.
2. Each calling project must have its **own distinct API key** (not one shared
   secret), so a single project can be identified and revoked without affecting
   others.
3. The system must be able to **revoke / disable a single project's key** without
   redeploying or disrupting other callers.
4. The system must record, per request, **which project made the call** (for
   later usage visibility — see Out of Scope for what is NOT required now).
5. Rejected/unauthenticated requests must return a clear, standard "unauthorized"
   response without leaking whether a key merely lacked permission vs. did not
   exist.

## Acceptance Criteria

- [ ] A request to `/chat` with no credential is rejected (not processed by any provider).
- [ ] A request with a valid project key succeeds and is attributed to that project.
- [ ] A request with a revoked/disabled key is rejected, while other projects' keys still work.
- [ ] Two different projects use two different keys; logs/records show which project each call belongs to.
- [ ] Provider API keys / `.env` secrets are never exposed to callers in any response.

## Constraints

- Backend-only repo (Bun + Hono). No database currently exists in the project.
  How project keys are stored/managed is Sober's design decision.
- Secrets (provider keys, and any master/signing secret this introduces) come
  from the human via `.env` — never printed, logged, or committed.
- Must not break existing callers on day one beyond requiring the new credential
  (i.e. the request/response shape of a successful call stays the same).

## Out of Scope

- Per-project quotas / rate limiting / billing (may become a later REQ).
- A UI or self-service portal for issuing keys.
- User-level (human end-user) login; this is service-to-service auth only.

## Questions

(SA Lead asks here; Porter answers as `> answer: ...`)
