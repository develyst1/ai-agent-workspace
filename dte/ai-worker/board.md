# Board — dte

> Single source of truth for CURRENT state. Update me at the end of every session
> (see PROTOCOL.md). **File discipline:** detail lives in the TASK/REQ file; a
> board cell is ONE line (status + date + owner + pointer); a log entry is ≤ 15
> lines. Never paste evidence or keep old text here.

## Project info

- Description: **DTE — "Develyst The Education"** (name settled by the owner
  2026-09-07; *"Disrupt Thai Education"* is superseded — see `SYSTEM-FACTS.md` A6),
  an online learning platform with a per-course **AI Teacher**. Live at
  `dte.develyst.online`. Product vision (Thai) is the owner's `DTE.md` in the
  repo — background, not a requirement.
- Code repository (single repo, **brownfield — production serves real users**):
  logical name **`dte`**, containing `back/` and `front/`. Absolute path only in
  the workspace-root `machine.local.md`.
- Stack: `back/` = **Bun + ElysiaJS + PostgreSQL, raw SQL, no ORM**
  (`back/db/schema.sql`) · `front/` = **Next.js 15 App Router + React 19 +
  Tailwind**. AI calls go through the **`develyst-ai`** gateway (a separate
  project). 🔴 The repo-root `README.md` is **stale** — `back/README.md` is the
  accurate one; see `SYSTEM-FACTS.md`.
- **`SYSTEM-FACTS.md`** — read it first, every session. Owner-stated facts and
  survey findings live there. Of the original Q1–Q4, **Q1/Q2/Q4 were answered
  2026-09-07**; **Q3 was answered 2026-09-07 too — "ลบ"** (§"…three re-asked questions"
  A7–A9). All of Q1–Q4 are now closed; the revenue model is settled at **2% of the GROSS sale
  price of paid courses, no course-opening fee, the platform absorbing the payment-gateway fee**
  (A9/A13/A14). Open items: "Blocked / waiting" below.
- As-built survey (read-only, gathered before the team existed):
  `../project-docs/as-built-survey-2026-09-06.md`. Source material, not a
  requirement — Porter still writes the first REQ from the owner's words.
- Team: Porter (PM) · Sober (SA Lead) · Jason (BE — `back/`) · Fern (FE —
  `front/`). **No QA role** — verification is engineer evidence plus the
  owner's eyes; see PROTOCOL.md "Evidence and the missing QA role".
- 🤖 Run mode: **DISPATCHER** (workspace-root `DISPATCHER.md`) — one session
  spawns the roles as subagents. Files remain the only channel; PROTOCOL
  unchanged. Dispatcher run log: `dispatcher-state.md` — last 5 runs; older runs
  rotated verbatim to `archive/dispatcher-state-2026-09-07.md` (2026-09-07).
- Branch: work happens on **`develop`**. Git writes and both workflow scripts
  are the human's alone.
- 🔴 Standing rule (owner, 2026-09-07 — "เลิกยุ่งกับการ commit หรือ git ของฉัน ทำงาน
  code กันไป"): **git is OUT OF THE TEAM'S SCOPE** — branches, commit hashes, what
  is merged/pushed/uncommitted, which branch production runs. Nobody asks about
  them, reports on them, or gates work on them; no Blocked row, no ⚠️, ever again.
  Unchanged: **no agent commits, pushes, merges, deploys or touches production**;
  work is handed off as edited files on `develop`. See `SYSTEM-FACTS.md` A23.
- 🔴 Standing rule: **no agent touches production or the production database —
  ever.** Not a deploy, not ssh, not `pm2`, not a GET. Real-world material
  arrives via DATA REQUEST into `../project-docs/`.
- 🧹 Standing rule (owner, 2026-09-07 — "housekeeping แก้ได้"): a **housekeeping
  hop MAY rewrite** `log/*.md` and `dispatcher-state.md`; append-only binds
  ordinary role sessions, not housekeeping. Every such edit stays marked inside
  the file it touched. Scope of a hop is `DISPATCHER.md`'s rule, not his — see
  `SYSTEM-FACTS.md` A18.

## Requirements

| ID | Title | Priority | Status | Owner of next step |
|----|-------|----------|--------|--------------------|
| REQ-001 | Frontend foundation — house folder pattern, component library, icons not emoji | HIGH | IN_SPEC — 2026-09-08, Sober · SPEC-001 **ACTIVE**, no gate open; TASK-001…003 all **DONE**; next units are Sober's: the §Decision 6 bundle measurement, then TASK-004 (`/login`) — see `specs/SPEC-001-frontend-foundation.md` §Tasks | **Sober (SA)** — write the next TASK |
| REQ-002 | Course creation via the teacher-side AI training loop | (unset) | DRAFT — 2026-09-07, Porter · INTAKE only; **Q1 fully CLOSED** (2% of gross price, no opening fee, platform pays gateway); Q2–Q7 open — see `requirements/REQ-002-course-creation-ai-training-loop.md` §Open questions | **Human (owner)** |
| REQ-003 | Remove the inherited portfolio-site routes from the frontend | MEDIUM — after REQ-001 | IN_SPEC — 2026-09-08, Sober · SPEC-003 **ACTIVE**, its one unit TASK-014 is `TODO` with Fern; nothing blocked — see `specs/SPEC-003-remove-inherited-portfolio-routes.md` | **Fern (FE)** — build TASK-014 |
| REQ-004 | Replace the superseded product name "Disrupt Thai Education" everywhere | MEDIUM | **SPEC_DONE** — 2026-09-08, Porter · acceptance check DONE, held for the owner's eyes (AC 5) — see `requirements/REQ-004-product-name-rename-everywhere.md` §"Porter's acceptance check" | **Human (owner)** — look, then Porter sets `DELIVERED` |
| REQ-005 | Unify the browser page titles across the whole site | LOW | DRAFT — 2026-09-08, Porter · Q1 ANSWERED `Q2=ข` (A29) = page name + one common tail; **Q2 open** (separator/word order + what `/` reads) — see `requirements/REQ-005-unify-page-titles-site-wide.md` §Open questions | **Human (owner)** |

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-001 | Upgrade `front/` — Next 15→16 + Tailwind 3→4 | SPEC-001 | **DONE** — reviewed 2026-09-07, Sober · Q1–Q4 answered; 3 UNVERIFIED items accepted and owed to the owner's eyes — see `tasks/TASK-001-next16-tailwind4-upgrade.md` §Review | FE (Fern) — closed | none |
| TASK-002 | Folder skeleton + `FRONTEND-CONVENTIONS.md` + no-emoji harness | SPEC-001 | **DONE** — reviewed 2026-09-07, Sober · Q1–Q3 answered, 6 DoD checks re-run by me, 3 UNVERIFIED accepted; its git finding **struck 2026-09-07** per A23 — see `tasks/TASK-002-folder-skeleton-conventions-emoji-harness.md` §Review | FE (Fern) — closed | TASK-001 ✅ |
| TASK-003 | Install Ant Design v6 + registry, theme-token bridge, first 2 `ui/` wrappers | SPEC-001 | **DONE** — reviewed 2026-09-08, Sober · no rework; Q1–Q4 answered, 13 DoD checks re-run by me, 1 UNVERIFIED carried (compressed bundle delta) — see `tasks/TASK-003-antd-install-and-theme-bridge.md` §Review | FE (Fern) — closed | TASK-002 ✅ |
| TASK-011 | Product-name rename in `front/` — 3 occurrences, 2 files (`metadata` only) | SPEC-002 | **DONE** — reviewed 2026-09-08, Sober · no rework; em dash re-verified as bytes, `tsc` + emoji harness (124) re-run by me, Q1 answered → SPEC-002 Q5 — see `tasks/TASK-011-rename-product-name-front.md` §Review | FE (Fern) — closed | none |
| TASK-012 | Product-name rename in `back/` — 7 occurrences, 6 files (Swagger + AI prompt) | SPEC-002 | **DONE** — reviewed 2026-09-08, Sober · no rework; all 7 substitutions + banner width re-verified by me, `/docs` browser evidence accepted, no DB touched; Q1 answered (banner is pre-existing, no TASK) — see `tasks/TASK-012-rename-product-name-back.md` §Review | BE (Jason) — closed | none |
| TASK-013 | Product-name rename in the repo-root `README.md` — 1 line (Rule S, whole sentence) | SPEC-002 | **DONE** — reviewed 2026-09-08, Sober · no rework; literal re-read as bytes, one line changed, enumeration re-run by me; Q1 answered (pre-existing U+FFFD → no TASK) — see `tasks/TASK-013-rename-product-name-readme.md` §Review | BE (Jason) — closed | none |

| TASK-014 | Remove 4 inherited routes + 2 data files + 4 links; add `redirects()` to `/` | SPEC-003 | **TODO** — 2026-09-08, Sober · enumerated against the real tree; 3 traps called out (`src/services/` is NOT the route) — see `tasks/TASK-014-remove-inherited-portfolio-routes.md` | FE (Fern) | none |

> Numbering note: **TASK-004…010 stay reserved for SPEC-001's per-screen units**, so SPEC-002's
> tasks start at 011 and SPEC-003's at 014. Numbers are never reused (PROTOCOL.md §Artifact
> numbering).

## Blocked / waiting

| Item | Waiting on | Since | Note |
|------|-----------|-------|------|
| The API port `4013` — needs a REQ | **Porter (PM)**, then Sober | 2026-09-07 | ANSWERED "ทั้งคู่" = prod AND local; all 4 places in the repo are wrong. Porter writes the REQ next session. See `SYSTEM-FACTS.md` A7. |
| DATA REQUEST — the Thai copy for the DTE `/about` page | **Human (owner)** | 2026-09-07 | `/about` stays ("about for DTE", `SYSTEM-FACTS.md` A10) but he gave no text; no agent invents it. Not blocking REQ-003 — see REQ-003 §Out of Scope. |
| antd shared-chunk cost `+100.8 kB` uncompressed on every route | **Sober (SA)** | 2026-09-08 | Measured in TASK-003, not a defect. Remedy open (route-group scoping) and needs the compressed delta first — `UNVERIFIED`. Not blocking TASK-004+. See `specs/SPEC-001-frontend-foundation.md` §Decision 6. |
| REQ-005 — the exact separator/word order + what `/` reads | **Human (owner)** | 2026-09-08 | Shape settled (A29 `Q2=ข`); the string is not. Re-asked in Thai 2026-09-08 by Porter · blocks only REQ-005, still `DRAFT` — see `requirements/REQ-005-unify-page-titles-site-wide.md` §Open questions **Q2**. |
| REQ-002 scoping | **Human (owner)** | 2026-09-06 | Q1 closed 2026-09-07; **Q2–Q7 still open** — see REQ-002 §Open questions. |
| Owner's own eyes — the upgrade AND the folder moves | **Human (owner)**, via Porter | 2026-09-07 | `/teach` + `/classroom/[id]` (auth-guarded), below-the-fold everywhere, and routes other than `/` after the moves. No QA here; nobody claims these work until he looks. See TASK-001 §Review + TASK-002 §Review. |
| Owner's own eyes — the renamed page titles (REQ-004 AC 5) | **Human (owner)**, via Porter | 2026-09-08 | Asked in Thai 2026-09-08 by Porter · rename evidenced, REQ-004 held at `SPEC_DONE` for his eyes only — see REQ-004 §"Porter's acceptance check" (⚠️ what to look at, and why the live site is unchanged). |

> **Closed 2026-09-08:** the *"`DTE Platform` suffix — unify or leave"* row is replaced by the REQ-005
> row above — the owner answered **"ให้เหมือนกันทั้งเว็บ"** = unify (`SYSTEM-FACTS.md` **A27**), which by the
> framing of the question makes it a **NEW REQ (REQ-005), never a widening of SPEC-002**. SPEC-002
> §Questions **Q5 is ANSWERED** and no TASK in it changes. In the same reply he declined to overturn the
> TASK-013 → Jason routing — **"โอเค"** (**A28**): an accepted one-off, `PROTOCOL.md` still unamended,
> no repo-root precedent.

> **Closed 2026-09-08:** the *"Who edits the repo-root `README.md` (TASK-013)"* row is removed —
> Porter answered SPEC-002 **Q4**: **TASK-013 goes to Jason (BE)**, a one-off for that one line.
> `PROTOCOL.md` is **not** amended and no repo-root precedent is created; the reasoning, and the
> fact that the owner was told so he can overturn it in one word, are in
> `requirements/REQ-004-product-name-rename-everywhere.md` §Questions.

> **Closed 2026-09-08:** the *"Owner-only rename occurrences + 2 copy questions"* row is removed —
> the owner answered all three on 2026-09-08 (`SYSTEM-FACTS.md` **A24–A26**) and takes the
> owner-only occurrences himself, so REQ-004 AC 6 is met and nothing on REQ-004 waits on him.

> **Closed 2026-09-07 by the owner's standing ruling (`SYSTEM-FACTS.md` A23):** the
> `origin/production`-vs-`develop` commit row is **struck and will not return** — git is
> outside the team's scope. Nothing that was waiting on it is waiting any more.
