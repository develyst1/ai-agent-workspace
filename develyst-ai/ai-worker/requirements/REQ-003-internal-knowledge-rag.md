# REQ-003: Let the AI answer from our own internal knowledge (RAG)

- Status: CANCELLED — de-scoped 2026-07-21 (RAG belongs to consuming projects, not this gateway)
- Priority: —
- Requested: 2026-07-21 by human (dev@smartalliance.co.th)
- Deadline: none

## Decision (2026-07-21)

**Cancelled by the stakeholder.** develyst-ai is a stateless "AI Center" API for
Q&A; RAG is inherently project-specific (each caller's private documents, access
rules, freshness). Centralising RAG here would couple the gateway to every
consumer's domain and force it to gate everyone's private data. The chosen pattern
is **RAG at the edge**: each consuming project retrieves its own context and
passes it into this API's prompt; the gateway stays dumb and generic. LangChain /
LlamaIndex therefore live in the consuming projects, not in develyst-ai.

Optional future consideration (NOT a commitment): confirm the gateway's request
contract lets callers cleanly inject their own retrieved context (system prompt /
message context). If that ever needs work, it would be a small new REQ — not this
one.

## Problem / Goal (obsolete — kept for traceability)

Beyond public/world information, the stakeholder wants the AI to be able to answer
using **our own internal knowledge** — so calling projects can ask questions about
our documents/data and get grounded answers instead of generic model output.
This is a distinct deliverable from REQ-002 (public web/financial data) because
the data sources are internal and the freshness/privacy concerns differ.

Held in DRAFT: the concrete internal sources have not been defined yet. Porter
must confirm the sources with the human before this is ready for SA design.

## Requirement (draft — pending source definition)

1. The system must be able to ground answers in a defined set of our internal
   documents/data (e.g. answer "what does our policy say about X?" from our own
   material rather than from the model's general knowledge).
2. Answers grounded in internal data should indicate what internal source(s) they
   drew from, so callers can trust and trace them.
3. Access to internal knowledge must respect the same per-project auth as the
   rest of the gateway (REQ-001) — external partners must not read internal data
   they are not entitled to.

## Acceptance Criteria (draft)

- [ ] A question answerable only from an internal document returns the correct grounded answer.
- [ ] The response points to which internal source was used.
- [ ] A caller/project without entitlement to a source cannot retrieve its content.

## Constraints

- Internal data privacy: external partners call this gateway, so internal
  knowledge must be gated, not world-readable.
- Any real internal data (documents, exports, DB dumps) must be supplied by the
  human via DATA REQUEST into `../project-docs/` — the team never pulls it from
  real systems itself.
- **Stakeholder note (2026-07-21):** the human is interested in LangChain. Unlike
  REQ-002 (where native tool-calling was chosen), RAG is the fitting place for it.
  When this REQ moves to SA, Sober should explicitly evaluate LangChain vs.
  LlamaIndex vs. a hand-rolled pipeline and record the trade-off. Recorded as an
  idea to evaluate, not a mandate.

## Out of Scope

- Public web / financial data (that is REQ-002).

## Questions

- Porter → human (blocking, must answer before READY_FOR_SA):
  1. What are the internal sources to start with? (e.g. which documents, formats
     — PDF/Markdown/DB — roughly how many, and where they live.)
  2. Is the same knowledge available to every calling project, or must some
     sources be restricted to specific projects/partners?
  3. How often does this internal data change (static docs vs. frequently-updated
     records)?

(SA Lead asks here too; Porter answers as `> answer: ...`)
