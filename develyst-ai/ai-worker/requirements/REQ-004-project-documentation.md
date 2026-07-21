# REQ-004: Documentation so the project is easy to understand and use

- Status: DELIVERED (accepted by Porter 2026-07-21 — all AC met; every doc example SA-verified against running code; a code defect found in passing is routed separately, not fixed under this docs REQ)
- Priority: MEDIUM
- Requested: 2026-07-21 by human (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal

develyst-ai is now a shared "AI Center" API that other projects call, with two
new capabilities just shipped (per-project auth — REQ-001; real-time knowledge /
web search — REQ-002). The stakeholder wants documentation that makes the project
**easy to understand and easy to use**, so that new people can onboard without
reading the source.

The docs must serve **three audiences** (stakeholder chose all):
1. **API consumers** — developers of *other* projects who will call this gateway.
2. **Repo maintainers** — engineers who will run, extend, or debug this repo.
3. **Team / leadership** — a high-level "what is this and what can it do" overview.

The repo already has some material (`README.md`, `CLAUDE.md`, a Bruno collection
in `bruno/`). This REQ is about **reviewing what exists and filling the gaps**,
not duplicating — the team decides what to reuse, update, or add.

## Requirement

Documentation must let each audience succeed without asking a person:

1. **Overview (all audiences).** A short, plain-language explanation of what the
   AI Center is, what it does (multi-provider chat, model tiers, multi-model,
   current date/time awareness, web search with sources), and when to use it.
2. **Consumer / integration guide (audience 1).** How to call the API end to end:
   how to obtain and send a project API key (auth header), the available
   endpoints and what each does, request and response shapes (including the
   normalized `AIResponse` and the new optional `sources` field), how to pick a
   provider/tier, how to trigger/benefit from web search, and copy-pasteable
   working examples (curl and/or the Bruno collection). Must state current limits
   honestly (e.g. web search runs on OpenAI-compatible providers, not Gemini yet;
   Tavily free tier).
3. **Maintainer guide (audience 2).** How to run locally, required environment
   variables and where secrets live, how auth keys are managed
   (`api-keys.json` + example), the request flow / architecture at a glance, and
   the recipe for extending it (e.g. adding a provider). Reuse/point to
   `CLAUDE.md` where it already covers this rather than repeating.
4. **Discoverability.** A reader landing on the repo can find the right doc for
   their need within a click or two (clear entry point / index).
5. **Accuracy.** Every documented endpoint, header, field, env var, and example
   must match the actual current code and be verified to work (no aspirational or
   stale content).

## Acceptance Criteria

- [x] A developer from another project can, using only the docs, send an authenticated `/chat` request and get a successful response — including how to supply the API key. — `docs/consumer-guide.md` quickstart executed → 200.
- [x] The docs describe every caller-facing endpoint with its request/response shape, and explain the `sources` field and web-search behavior. — field lists match `src/types` exactly (SA-verified).
- [x] The docs state current limitations honestly (Gemini web search not yet; Tavily free tier; auth required on `/chat*`). — all present in the guide.
- [x] A new engineer can, using only the docs, run the project locally and knows where env vars / keys go and how to add a provider. — README quickstart + maintainer content routed to existing `CLAUDE.md`.
- [x] There is a clear overview a non-engineer can read to understand what the service is and does. — README Overview section (boilerplate removed).
- [x] Every example in the docs actually runs against the current code (verified, not assumed). — every example executed on a running server; §6.2 printed command == verified command (green trace pasted).
- [x] No secret/key values appear anywhere in the docs; keys are referred to by name/placeholder only. — SA-verified, placeholders only.

## Constraints

- Documentation only — this REQ does not ask for code/behavior changes. If the
  team finds a code/doc mismatch, note it (a bug) rather than silently "fixing"
  it under this REQ.
- Must reflect the delivered scope of REQ-001 and REQ-002 exactly, including the
  known caveats (Gemini web search phased; Tavily free tier only).
- Never include real secret values; use placeholders (`TAVILY_API_KEY=...`, etc.).
- Format, file layout, and tooling (Markdown, a `docs/` folder, expanding README,
  Bruno examples, etc.) are the team's design choice.

## Out of Scope

- New API features or behavior changes (docs describe what exists today).
- Public hosting / a docs website / auto-generated API reference tooling — unless
  the team judges it the simplest path; not required.
- Documenting the phased/future items beyond noting they are not available yet.

## Questions

(SA Lead asks here; Porter answers as `> answer: ...`)
