# REQ-005: Align the server default port to 3009

- Status: DELIVERED (accepted by Porter 2026-07-21 — all AC met; SA-verified default :3009 + repo-wide grep of 3002 clean)
- Priority: LOW
- Requested: 2026-07-21 by human (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal

The repo is inconsistent about the server port: `src/index.ts` and `.env.example`
default to **3002**, while the local `.env` and the Bruno `local` environment use
**3009** (and `CLAUDE.md` previously said 3009). This mismatch was surfaced while
delivering REQ-004 (docs). The stakeholder has decided the intended default is
**3009**. This REQ aligns everything to 3009 so there is one consistent port.

## Requirement

1. The server's default port (used when `.env` does not set `PORT`) must be
   **3009**, consistently across the code default and the example/config files.
2. All in-repo references to the port (docs, examples, Bruno) must agree on 3009.
3. No behavior change other than the port default and the reference alignment.

## Acceptance Criteria

- [x] With no `PORT` set in `.env`, the server listens on 3009. — `index.ts` default `|| 3009`; proven with PORT unset → `:3009`.
- [x] `.env.example` shows 3009. — aligned.
- [x] README / `docs/consumer-guide.md` / `CLAUDE.md` and the Bruno `local` environment all reference 3009 consistently (no lingering 3002). — repo-wide `grep 3002` CLEAN (SA-verified).
- [x] A quickstart example from the docs still works against the aligned port. — docs examples executed green.

## Constraints

- Small, surgical change — port alignment only; do not touch auth, providers, or
  web-search logic.
- Docs were delivered under REQ-004; updating their port references here is
  expected (this REQ owns the alignment).

## Out of Scope

- Making the port configurable in any new way (it already reads `PORT` from
  `.env`); this is only about the default value and consistency.

## Questions

(SA Lead asks here; Porter answers as `> answer: ...`)
