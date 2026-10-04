# Harness Console — design plan (Atlas, 2026-10-04)

> A local control plane for this workspace: see every project's agent chain, who holds
> the ball, and whether the rules are being kept — then eventually change the rules
> from the same screen.
>
> **Owner's decision 2026-10-04: build it for himself first.** He has 13 live projects
> as a test bed; if it does not help him, it will not help a company.

---

## The one architectural rule

**The files stay the truth. The console is a lens.**

It reads and writes the same repo the agents read. Git stays the record. **There is no
database holding a second copy of state** — a second store is the drift problem at a
new level, and this workspace has already paid for that lesson three times
(board vs knowledge file, knowledge file vs archive, personal config vs repo).

## Why this is worth building — the four measured pains it removes

Not speculation; every row is something that happened here and was measured.

| Pain, measured | What the console does |
|---|---|
| **Nobody runs the gate.** smart-scheduler went FAIL 12 → 19 in two days while the gate sat there, correct and unread | runs it on a timer, shows red without being asked |
| **`RESUME-HERE.md` went 9 days stale** — a cold PM read a nine-day-old situation | shows staleness as a number on the screen |
| **Inboxes reached ~1 MB**, boot read 755 KB per session | shows the sizes, with a button that calls Marie |
| **The owner is the router** — he pokes 8 sessions to find out who is waiting | one screen: who holds the ball, on every project |

🔑 **None of these needs an LLM, and none needs edit capability.** That is why v1 is
read-and-run.

---

## v1 — read and run (build this first)

### The key design decision: the gate becomes the API

`check-hygiene.mjs` already knows how to find and parse every coordination file.
**Do not write a second markdown parser in the UI.** Instead:

1. **Add `--json` to `check-hygiene.mjs`** (Marie's tooling, her hands). It emits the
   same checks it prints today, plus the raw numbers: file sizes, boot read per role,
   staleness in days, closed-row counts, inbox message lengths with senders.
2. The console shells out to it per project and renders the JSON.

⇒ one source of truth for *what the rules are*, and the UI can never disagree with the
gate. When a rule changes, both change together.

### Screens

1. **Workspace** — one card per project: PASS/FAIL, the worst three lines, last activity
   date, mode (manual / dispatcher).
2. **Project** — gate detail · file-health table (board, knowledge file, each inbox,
   `RESUME-HERE` with its staleness) · **who holds the ball** (from the board's owner
   column plus which inboxes are non-empty) · `FAILURES.md` entries with status `NEW`.
3. Click anything → open that file.

Auto-refresh every 60 s. Nothing else in v1.

### Stack — use what the house already uses

**One Next.js app** (App Router + antd, the house pattern), reading `H:\` server-side.
No separate backend: for a local single-user tool a second service is pure cost.
Bun + Hono only if it later needs to run somewhere shared.

---

## v2 — the chain, and the stale-session trap

- **Chain graph** per project: roles as nodes, the allowed hops as edges, the ball
  highlighted. This is the picture the owner has been assembling in his head for months.
- 🔴 **Show which sessions are running stale rules.** A session that has already read
  `PM.md` never re-reads it, so editing a charter does nothing until that session is
  restarted. Without this the console will silently lie to its user. Each role card
  shows the charter version it booted with, and a **restart** prompt when it differs.
- **Mode / hop / autonomy controls.** ⚠️ **Prerequisite, and it is not UI work:** those
  settings are prose inside `DISPATCHER.md` and the charters today. They must first be
  lifted into data — front-matter on each charter, or one `workspace.config.json`.
  Until that is done there is nothing for a control to bind to.

### The autonomy dial — the owner's own idea, and the best one in this plan

Three levels, replacing a paragraph of prose with a setting:

| Level | The role may decide |
|---|---|
| 1 | nothing — ask about everything (new customer work, sensitive) |
| 2 | **anything the user cannot see** — names, file layout, which of two equivalent implementations; ask whenever the user would notice |
| 3 | anything reversible; ask only for the irreversible |

Level 2 is the rule already written into the charters on 2026-10-02 (ORDER 14.4 #4).
**Turning this dial is turning speed ↔ safety directly**, and it is the clearest piece
of product in the whole idea.

---

## v3 — editing the rules from the screen

The owner's original picture: click a role, type *"ให้ Porter อ่าน log ย้อนหลังมากขึ้น"*,
an LLM turns that into an edit to `PM.md`, save, carry on.

**Buildable, and the most dangerous part of the product.** `PM.md` is the most important
file in the system; an LLM rewriting it can weaken a hard boundary where nobody is
looking. This workspace has already seen a subagent change a status while reporting
that it changed nothing.

**Three guardrails, non-negotiable:**

1. **Diff then approve.** The LLM proposes; the human sees a diff; nothing is written
   without a click.
2. **Protected sections.** The Hard-boundaries card, the chain, and "never weaken your
   own boundaries" are **locked** — the editor may not touch them at all. A request to
   change one is routed to the human as a question, never as an edit.
3. **Archive before every write** — Marie's existing rule, applied by the tool.

---

## How to build it — dogfood

**This should become a project desk in this workspace, with its own team**, not a side
script the owner writes alone at night. He now has two parallel teams, a QA role and a
release engineer; a small greenfield Next.js app is exactly what they are for.

- Marie opens the desk (`harness-console`), dispatcher mode, Porter · Sober · Fern.
- The owner writes the requirement; this file is the design input.
- **Start with v1 only.** If the console does not change how the owner's own week feels
  within two weeks, v2 and v3 are not worth building.

**And it is the honest demo for the company**: a tool built by the workforce it manages.
