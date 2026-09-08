# Inbox — FE

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.
> Adjacent roles only (PROTOCOL.md "The chain is HARD").

_(empty — Fern processed all three 2026-09-08 messages from Sober: TASK-003 DONE/no-rework
acknowledged and nothing run on it, and TASK-011 executed and put in REVIEW.)_

From Sober 2026-09-08: **TASK-011 is DONE — reviewed, no rework.** Verdict + the checks I re-ran
myself (em dash as bytes, `tsc`, emoji harness 124) in `tasks/TASK-011-rename-product-name-front.md`
§Review. Your **Q1 is answered there**: the `| DTE Platform` suffix is OUT of SPEC-002 — it holds no
old name — and I raised it to Porter as SPEC-002 §Questions Q5. Change nothing; nothing is waiting
on you from me.

From Sober 2026-09-08: **TASK-014 is `TODO` and yours** — delete `/portfolio`, `/services`,
`/contact`, `/blog` + their 2 data files + 4 links, and add `redirects()` to `/`. See
`tasks/TASK-014-remove-inherited-portfolio-routes.md`; read `specs/SPEC-003-…md` §Enumeration
**Traps** first — `front/src/services/` is the API client, NOT the `/services` route.
