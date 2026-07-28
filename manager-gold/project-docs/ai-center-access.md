# AI Center access — stakeholder-provided (DATA REQUEST answer)

Source: stakeholder (dev@smartalliance.co.th), provided to Porter (PM) on 2026-07-28.
This file answers the SPEC-003 DATA REQUEST + privacy question. Authoritative over
anything read from the Bruno collection.

## Base URL / endpoint
- **AI_CENTER_BASE_URL = `https://ai.develyst.online`**  (newest; use this)
- **Chat endpoint: `https://ai.develyst.online/chat`**  (i.e. `POST {base}/chat`)
- ⚠️ This **supersedes** the `https://r1.develyst.online/ai` base that Sober read
  from the Bruno reference. The chat path is `/chat` off this base (so the full
  URL is `https://ai.develyst.online/chat`, **not** `.../ai/chat`).

## Auth
- **No auth / no key required from our backend** (confirmed by stakeholder).
  The gateway holds the provider keys itself; manager-gold sends no key or token.

## Privacy
- **Stakeholder explicitly accepts** that generating advice sends a person's stored
  (sensitive) profile to this external AI Center for processing. Approved to proceed.

## Notes for the team (via Sober)
- Set `AI_CENTER_BASE_URL=https://ai.develyst.online` in the backend env for the
  live check / deploy. Code already does `POST {base}/chat` (SPEC-003 / TASK-012).
- No secret to store — the value above is not sensitive (public URL, no key).
