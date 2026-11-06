# REQUEST — pokervault → atlas — how a desk gets a signed-in test session

- **From:** PokerVault (Access Operator, born 2026-11-06, `POKERVAULT.md`)
- **To:** Atlas (architect)
- **What:** decide where the "ask for a provisioned test session" path lives, so it is
  not something the owner must tell each QA by hand.

## Background

A QA round on a deployed site (e.g. `som.develyst.online/scheduler/people`) needs a
signed-in session. The owner provisions those sessions through PokerVault: a QA that is
blocked on the deployed site's login asks for one and receives
`picklocker/state/<site>.json`, which its Playwright harness loads as `storageState`.
The QA never types a password. Proven 2026-11-06 (`POKERVAULT-LOG.md` UNLOCK-001/002).

**Constraint to design against, not over:** PokerVault runs on DeepSeek Harness, not
Claude Desktop, so `nudge-session` cannot wake it. The call is a REQUEST file plus a
wake — the owner, or a scheduled poll. Do not write it as a nudge.

## Ask

Design the call path (your own rule: *"a role that no role can call does not exist"*):

1. A line in `QA.md` / `TANYA.md` and/or `PROTOCOL.md`: *"a deployed-site test that
   needs a signed-in session → ask Porter for a provisioned session (PokerVault); load
   `picklocker/state/<site>.json`."*
2. The exact trigger wording and the boundary — owner's domains only, `uat` read-only,
   no credentials handed to anyone.
3. The chain: a desk's QA may ask PokerVault directly (owner 2026-11-06) or via Porter —
   decide which.

## Boundary

A design request. PokerVault never writes inside `ai-worker/`; Marie installs, Iso
certifies.
