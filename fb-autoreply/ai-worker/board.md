# Board — fb-autoreply

> Single source of truth for CURRENT state. Update me at the end of every session
> (see PROTOCOL.md). **File discipline:** detail lives in the TASK/REQ/TEST file;
> a board cell is ONE line (status + date + owner + pointer); a log entry is ≤ 15
> lines. Never paste evidence or keep old text here. Sweep `DONE` / `DELIVERED`
> rows to `archive/board-closed.md` the moment they close.

## Project info

- Description: a **backend only** service that auto-answers a Facebook page's messages
  through the owner's own LLM gateway, over his five-layer pipeline (classify → generate a
  query → **the backend runs it** → analyse → answer). No screen; an admin view is
  explicitly out of scope for now. Everything the owner has said is in
  **`SYSTEM-FACTS.md` — read it first, every session.**
- Repos (logical names only — absolute paths in the workspace-root `machine.local.md`):
  `fb-autoreply-back` (Jason) — a clone of the owner's GitHub repo, **branch `main`, one
  "Initial commit" holding only `.gitignore` + a one-line `README.md`**; working tree clean
  (verified read-only 2026-10-20 22:17). 🔑 **There is no `develop` branch — do not assume
  one**, and **no agent runs git.**
- Stack: **Bun** + **Postgres** (owner, 2026-10-20). Postgres connection env is a **named,
  empty variable the owner supplies** — never invented.
- Mode: **manual** (one session per role; roles wake each other via `nudge-session`)
- Environments: **local only.** No dev server, no production for this product — neither
  exists. **The test surface is a quiet page the owner owns**, usable only while the App's
  DEVELOPMENT-mode isolation holds — 🛑 **unverified, and verifying it is the first task.**
  See `SYSTEM-FACTS.md` → Environments, which is the only control.
- Team: Porter (PM / BA / PO / UX writer) · Sober (SA) · Jason (BE) · Tanya (QA) — **no FE**
- Read first: `SYSTEM-FACTS.md`, then `PROTOCOL.md` + your role file, then this
  board, then your inbox, then today's log.

## Requirements

| Id | Title | Priority | Status (date, owner, pointer) | Ball |
|----|-------|----------|-------------------------------|------|

*(empty — no requirement has been written yet; the desk opened 2026-10-20)*

## Tasks

| Id | Title | Source SPEC | Status (date, owner, pointer) | Owner | Depends on |
|----|-------|-------------|-------------------------------|-------|------------|

## QA / Tests

| REQ | TEST | Status (date, pointer) | Verdict |
|-----|------|------------------------|---------|

## Blocked / waiting

> Open items only. Three were settled on 2026-10-20 (the gateway contract · the gateway
> project key · the test-page decision); **what was settled and how is in `SYSTEM-FACTS.md`**,
> which is where history belongs — not here.

| Item | Waiting on | Since | Pointer |
|------|-----------|-------|---------|
| Four binding security constraints → copy into the first REQ as constraints | **Porter** | 2026-10-20 | `SYSTEM-FACTS.md` § Security constraints |
| Five Facebook identifiers (page name · page ID · App ID · page token · verify token) — webhook cannot start without them | **the owner** | 2026-10-20 | `SYSTEM-FACTS.md` § Open questions 5 |
| 🛑 Test-page isolation (App in DEVELOPMENT mode) is UNVERIFIED — first task; if it fails, stop and tell him | **Tanya**, then the owner | 2026-10-20 | `SYSTEM-FACTS.md` § The test page |
| Tavily key — without it `/search` (layer 3) is HTTP 500 | **the owner** | 2026-10-20 | `SYSTEM-FACTS.md` § The LLM gateway |
| Postgres connection env — named and empty | **the owner** | 2026-10-20 | `SYSTEM-FACTS.md` § Repos and environments |
| `prompt-system.json` content — what the bot may answer about | **the owner** | 2026-10-20 | `SYSTEM-FACTS.md` § Open questions 6 |
| Branch for the work — repo holds only `main`, nobody assumes `develop` | **the owner** | 2026-10-20 | `SYSTEM-FACTS.md` § Repos and environments |
| Is auth ON where this product runs? His call per environment; needs a gateway restart | **the owner** | 2026-10-20 | `SYSTEM-FACTS.md` § The LLM gateway |
