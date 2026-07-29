# Demo runbook — REQ-005 visual sign-off (local)

> Written by Sober (SA Lead) for the stakeholder's **live** review of the redesign.
> **Who runs it:** operating the live servers is engineer/ops (Fern + Jason) or the human
> **at this machine** — not the SA lane, and a persistent server can't live inside an SA turn.
> Every command is here; it's ~2 min. Follow baseline §7 (stop only the PIDs you start).
>
> **Reachability caveat:** `http://localhost:3020` is only reachable **on this machine**. Fine
> if the stakeholder reviews here. A remote-accessible URL = the **parked deployment** (hosting +
> push + remote migrate) — out of scope for this sign-off.
>
> **Note:** this is also the **first full integration** of the redesigned frontend against the
> real Postgres backend (Fern verified the restyle vs a mock; Jason's PG suite is green). Expect
> it to work; if anything is off, it's a normal integration nit for the owning engineer.

## Prereqs
- Local Postgres running with the `manager_gold` db (creds = the answered DATA REQUEST /
  `project-docs/db-postgres-access.md`). Bun installed.

## 1. Backend — `H:\manager-gold\manager-gold-back`
Create `.env` (git-ignored; local creds only — do NOT commit):
```
PORT=4020
DATABASE_URL=postgresql://postgres:smart2026@localhost:5432/manager_gold
FRONT_ORIGIN=http://localhost:3020
AI_CENTER_BASE_URL=https://ai.develyst.online
NODE_ENV=development
```
Then:
```bash
bun install
bun run migrate      # creates the schema on manager_gold (bigint timestamps)
bun run start        # serves on http://localhost:4020
```
Verify: `curl http://localhost:4020/` → `{"ok":true,"service":"manager-gold-back"}`.

## 2. Frontend — `H:\manager-gold\manager-gold-front`
Create `.env` (git-ignored):
```
NEXT_PUBLIC_API_BASE=http://localhost:4020
```
Then:
```bash
bun install
bun run dev          # serves on http://localhost:3020
```

## 3. Review — open **http://localhost:3020**
- Register a new account → land in the app.
- Click through the redesign: people list + filters/export, create/edit a person, a person profile,
  the Approach Advisor + Notes-summary cards (real AI via the live gateway).
- Toggle **light/dark** in the header; reload → the choice persists.
- Try a narrow window (mobile width) — layout stays tidy.

## 4. After the review
- Stop **only the PIDs you started** (backend :4020, frontend :3020) — never a broad kill (§7).
- Porter records the stakeholder's **approve / change-requests** → REQ-005 DELIVERED on approval,
  or Sober specs the requested tweaks.
