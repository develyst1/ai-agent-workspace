# Board — portfolio-nichaphon

> Single source of truth for CURRENT state. Update me at the end of every session
> (see PROTOCOL.md). **File discipline (workspace-root `DISPATCHER.md`, binds all
> roles):** detail lives in the TASK/REQ file; a board cell is ONE line (status +
> date + owner + pointer); a log entry is ≤ 15 lines. Never paste evidence or
> keep old text here.

## Project info

- Description: **Personal portfolio / freelance-services website for Nichaphon
  Sayvav**, live at `portfolio.develyst.online`. Six routes — Home, About,
  Services, Portfolio, Blog, Contact — all static content, no backend.
- Code repository (single repo, brownfield — a working site already ships):
  logical name **`portfolio-nichaphon-web`**; absolute path only in the
  workspace-root `machine.local.md`. Frontend lives in `front/`.
- Stack (verified from the repo 2026-08-29): Next.js 15.5.24 App Router ·
  React 19.2 · TypeScript 5 · **Mantine 8.3.18** + `@tabler/icons-react` ·
  CSS Modules via `postcss-preset-mantine`. **No Tailwind, no backend, no
  database** — the repo-root `README.md` claiming NestJS + Prisma + Tailwind is
  stale; `front/README.md` is the accurate one.
- As-built survey (read-only, gathered before the team existed):
  `../project-docs/as-built-survey-2026-08-29.md`. It is source material, not a
  requirement — Porter still writes the first REQ from the human's words.
- Team: Porter (PM) · Sober (SA Lead) · Fern (FE — the only engineer) ·
  Tanya (QA — Senior Tester, local Playwright only).
  **No BE role** (no backend exists). A **QA role (Tanya)** now exists — she
  runs acceptance tests on local only and reports to Porter; the human still
  gives final business sign-off via Porter. If a backend ever appears, that is
  the human's scope decision, not a team improvisation.
- **SCOPE CHANGE 2026-09-09, the owner's own decision (recorded, not improvised):
  the project gains a backend** — `back/` (Bun + Hono) at the repo root, a **client** of his
  gateway `https://ai.develyst.online` (no keys here, **no auth**), plus an "ask the AI about
  me" feature on Home over a **real WebSocket** (his Q37b). **A database is NOT in scope —
  Q44 answered `ไว้คราวหลัง` (later)**, and **no usage cap ships (Q38)**: the endpoint is open
  and each question is 3+ paid calls on his account — his call, exposure written down in
  requirements/REQ-006-back-bun-hono-llm-gateway-client.md §Owner decisions. Until REQ-006
  lands, every "no backend" line above still describes what actually ships. **First thing to
  appear under `back/` is REQ-005's profile knowledge (two Markdown files, SPEC-005 §D1/SQ26)
  — text only, no code, no dependency, nothing to run.**
- 🤖 Run mode: **DISPATCHER** (workspace-root `DISPATCHER.md`) — one session
  spawns the roles as subagents. Files remain the only channel; PROTOCOL
  unchanged. Dispatcher run log: `dispatcher-state.md`.
- Standing rules: git writes (`add`/`commit`/`push`, branches) are the human's
  alone — the team hands work off as edited files on `develop`. **Nobody
  deploys**: the live droplet, `pm2`, ssh, `merge-workflow.sh` and
  `release-workflow.sh` are the human's hands only. Real-world material (copy,
  screenshots, client facts) arrives via DATA REQUEST into `../project-docs/`.
- Branches on the repo (git read 2026-09-13, Porter — replaces the stale 2026-09-05 line
  SA flagged): **checkout is `D1`, clean tree, HEAD `1dcc9b8`** — the human committed
  TASK-018 as `6c17609` and TASK-019 as `1dcc9b8`, both on `D1` = `origin/D1`.
  **`develop` = `origin/develop` = `ca5c097` — the branches have diverged.** `main`
  `d30dfea` and `origin/production` `ed2eb5d` carry none of it; `back/` was empty then — **untracked `back/` present since 2026-09-13 (TASK-022…025 DONE incl. generated `back/knowledge/PROJECTS.md` and `GET /ws`; plus, since TASK-021/026 2026-09-13, `back/knowledge/PROFILE*.md` and **13 `front/` files** (8 `M` + 5 `??`) — all uncommitted; git write still his)**.
  No role committed anything — git stays the human's.

## Requirements

| ID | Title | Priority | Status | Owner of next step |
|----|-------|----------|--------|--------------------|
| REQ-005 | Profile source-of-truth MD from the 2026-09-06 resume + reconcile 8 site-vs-resume fact conflicts | HIGH | **DELIVERED 2026-09-13, Porter — 5/5 AC ticked** (AC-d on TEST-008 `TEST_PASSED`; meta strings byte-equal to C5.a/b). Not signed off, not deployed — see requirements/REQ-005-…md §Delivery | **Human (owner)** — sign-off; Q52 (H8 margin), OBS-12 |
| REQ-006 | `back/` service (Bun + Hono) that calls the owner's LLM gateway, incl. one recorded real test fire | HIGH | **DELIVERED 2026-09-13, Porter — 6/6 AC ticked** on TASK-022/023 §Review + own read-only git/grep re-checks; no QA round (PM call, overrulable); 3 / 5 calls spent. Not signed off, not deployed — see requirements/REQ-006-…md §Delivery | **Human (owner)** — sign-off |
| REQ-007 | Home "ask the AI about me" — 3+ stacked gateway calls as thinking steps; depends on REQ-005 + REQ-006 | HIGH | **DELIVERED 2026-09-13, Porter — 8/8 AC ticked** (AC-a/d/e/h on TEST-008 + TEST-009 `TEST_PASSED`, `calls=3`); ledger **`10 / 30`** (rows 8–10 filled by Sober 2026-09-13, 20 unallocated). Not signed off, not deployed — see requirements/REQ-007-…md §Delivery | **Human (owner)** — sign-off; SQ34–38, OBS-14/15/16 |
| REQ-008 | Local ports — `back/` on 4014 by env (R1); `front/` on 3023 only if the owner confirms (R2, held on Q54) | MEDIUM | **IN_SPEC 2026-09-13, Sober — SPEC-008 ACTIVE (R1/R1a/R3), TASK-028 `TODO`; Q53 SA default = code default 4014; R2 NOT specced (Q54)** — see specs/SPEC-008-back-port-4014-by-env.md | **Fern (FE)** — TASK-028 · **Human** — Q53 (non-blocking), Q54 (blocks R2) |
| REQ-004 | "Open live project" button reachable without scrolling on a phone (from OBS-8) | MEDIUM | **DELIVERED 2026-09-05, Porter — 7/7 AC ticked** on TEST-007 (`TEST_PASSED`, 12/12, 0 defects, built surface). Not signed off, not deployed — see requirements/REQ-004-portfolio-modal-live-link-button-on-phones.md §Delivery | **Human (owner)** — sign-off |

> **Swept 2026-09-05 (PM housekeeping):** REQ-001 / REQ-002 / REQ-003 are all
> `DELIVERED` and their rows now live verbatim in `archive/board-closed.md`.
> None of the three is signed off — that pending sign-off is a Blocked/waiting
> row below. **`requirements/REQ-003-portfolio-content-refresh.md` is 46027 bytes,
> 53 bytes under the 45 KB hygiene cap** — consolidate (archive verbatim first)
> before writing anything more than a few characters there.

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-019 | Apply the ten decided resume-fact corrections (C1×5, C2, C3×2, C4, C6) | SPEC-005 | **DONE 2026-09-09, Sober** — 10/10 re-verified by SA (diff, 4 greps, tsc 0, build 0 clean, CRLF by bytes, and the un-photographable "4" found in the **built** HTML); FQ32 answered, SQ22's five stands — see tasks/TASK-019-apply-decided-resume-fact-corrections.md §Review | Fern (FE) | none |
| TASK-020 | Draft the profile source-of-truth pack + approval sheet (no code edited) | SPEC-005 | **DONE 2026-09-09, Sober** — re-verified by SA's own scan: 22 of 66 unbacked, 22 flagged, 0 mismatch; sheet 6 lines; zero code touched; FQ36 answered → SQ29 — see tasks/TASK-020-profile-source-of-truth-draft-pack.md §Review | Fern (FE) | none |
| TASK-021 | Place the approved profile, C5/C8/**C9** and the Class 1 skill additions | SPEC-005 | **DONE 2026-09-13, Sober** — every DoD line re-run by SA (both files diff-empty vs DRAFT-002, 42/42 + `/health profile:true` on the dead-port pin, build 0, strings in the built HTML); FQ45 answered; zero real calls — see tasks/TASK-021-place-approved-profile-and-additions.md §Review | Fern (FE) | TASK-019, TASK-020, owner approval (all met) |
| TASK-022 | Scaffold `back/`: the one gateway operation, failure classes, routes, stub + tests — NO real call | SPEC-006 | **DONE 2026-09-13, Sober** — every DoD line re-run by SA (18/18, greps, tsc 0, stub round-trip 200 + 503, logs content-free, header not forwardable); FQ37 → TASK-023 step 0, FQ38 reject stands; ledger 2/5 — see tasks/TASK-022-scaffold-back-gateway-client.md §Review | Fern (FE) | none |
| TASK-023 | The one recorded real round-trip through `back/` (call #3 of 5) + REQ-006 AC checklist | SPEC-006 | **DONE 2026-09-13, Sober** — every DoD line re-run by SA on a dead-port gateway (18/18, tsc 0, blank → 400 pre-network, build 0 + both AC-d greps empty, README = `1dcc9b8`); FQ39 answered; zero real calls in review, ledger 3 / 5 — see tasks/TASK-023-recorded-real-round-trip.md §Review | Fern (FE) | TASK-022 DONE (met) |
| TASK-024 | Knowledge loader + generated `PROJECTS.md` + the three-step chain, on the stub — NO real call | SPEC-007 | **DONE 2026-09-13, Sober** — every DoD line re-run by SA on a dead-port gateway (31/31, tsc 0, greps, sha256 idempotent, 11 ids in order, /health both ways); FQ40 → TASK-025 step 0, FQ41 accepted; zero real calls — see tasks/TASK-024-knowledge-loader-and-three-step-chain.md §Review | Fern (FE) | none |
| TASK-025 | `GET /ws` — the real WebSocket over the chain: frames, abort, `busy`, `ws-client`, tests — NO real call | SPEC-007 | **DONE 2026-09-13, Sober** — every DoD line re-run by SA on a dead-port pin (42/42, tsc 0, greps, own stub run, bad-frame probe); FQ42 accepted → SPEC-007 §Frames amended; zero real calls — see tasks/TASK-025-websocket-endpoint-over-the-chain.md §Review | Fern (FE) | TASK-024 DONE (met) |
| TASK-026 | Home "Ask" section — chips, live steps, answer + citations, badge, 3 failure pictures, phone — NO real call | SPEC-007 | **DONE 2026-09-13, Sober** — every DoD line re-run by SA on the stub (tsc 0, build 0, greps, happy/none/offtopic + all 3 failures reproduced live, fold 741/741 at 360, theme tokens verified); FQ46-49 answered; zero real calls — see tasks/TASK-026-home-ask-section.md §Review | Fern (FE) | TASK-025 DONE (met) |
| TASK-027 | The first real chain runs + REQ-007 AC checklist — the only task that spends money | SPEC-007 | **DONE 2026-09-13, Sober** — frames + log diff-identical to project-docs, 7 `step ok` / 0 retries, AC-d trace + D6 re-done by SA (7/7, "Yes." backed → D15/SQ38), AC-f/g greps re-run, no code changed; zero calls in review — see tasks/TASK-027-first-real-chain-runs-and-ac-checklist.md §Review | Fern (FE) | TASK-026, TASK-021 (both DONE) |
| TASK-028 | `back/` on 4014 — default, README, `ws-client`, front constant, guard test, fresh build, stub AC-b — NO real call | SPEC-008 | **BLOCKED 2026-09-13, Fern (waiting: Sober — FQ53)** — 6 files edited, tests 45/45, fresh build; DoD 1/3/5/9/12 unrun: 4014 is held by the human's own `bun run dev` (PID 16964), zero calls fired — see tasks/TASK-028-back-port-4014-follow-the-port.md §Questions | Sober (SA) → human | none |

> TASK-001 … TASK-018 are all `DONE`; their rows were swept verbatim to
> `archive/board-closed.md` on 2026-09-05, each still carrying its own `§Review`
> pointer into `tasks/`.

## QA / Tests

| ID | Title | Source REQ | Status | Tester |
|----|-------|------------|--------|--------|
| TEST-001 | REQ-001 Home acceptance — independent QA round | REQ-001 | TEST_PASSED 2026-09-02, Tanya — partial closed; every quote on / is R5-exact — see tests/TEST-001-req001-home-acceptance.md §Confirm-tick round | Tanya |
| REGRESSION | Standing site regression checklist | — | OPEN 2026-09-13, Tanya — **32 checks, 31 PASS** (H9–H12 + A1 added; H8 PASS with zero margin = QQ14; `© 2025` note closed); **H5 alone NOT_TESTED** per QQ8 — see tests/REGRESSION.md | Tanya |
| TEST-002 | SQ7 repro — do Modal + Drawer ever open? | REQ-002 (defect predating it) | CANNOT_REPRODUCE 2026-09-03, Tanya — verdict accepted as written by Porter; QQ1/QQ2/QQ3 all answered 2026-09-03 — see tests/TEST-002-sq7-modal-drawer-repro.md §Questions | Tanya |
| TEST-003 | The BUILD round — SQ7 triggers, S13 and S11 on a `npm run build` output | REQ-002 AC8 | **TEST_PASSED 2026-09-05, Tanya** — 13/13, 0 defects; **S11 PASSES** (build exit 0, no error/warning line), 12/12 loads console-clean; **QQ10 ANSWERED, Porter** (→ owner as Q26) — see tests/TEST-003-sq7-build-round.md |
| TEST-004 | REQ-002 site-wide acceptance round (full REGRESSION re-run + R9 sweep + the 7 SQ8 eyes) | REQ-002 | **TEST_FAILED 2026-09-05, Tanya** — AC6 PASS (0/96 R9 hits, six routes); AC3 partial (H8 FAIL = DEF-2, H5 + S11 NOT_TESTED); new DEF-3; DEF-1 closed; all 7 eyes answered, SQ12 settled — see tests/TEST-004-req002-site-wide-acceptance.md | Tanya |
| TEST-005 | REQ-002 closing round — H8, S14, the five-route AC7 look, `/services` at 1280, arrow keys | REQ-002 | **TEST_PASSED 2026-09-05, Tanya** — 5/5 pass, 0 new defects; AC3 + AC7 tick, DEF-2 + DEF-3 closed, both TASK-014 carries settled; QQ8 (H5) + QQ9 (OBS-5) open for Porter — see tests/TEST-005-req002-closing-round.md | Tanya |
| TEST-006 | REQ-003 AC-d — `/portfolio` + both new modals SEEN as pictures, each live href read | REQ-003 | **TEST_PASSED 2026-09-05, Tanya** — 10/10, 0 defects; 11 cards + intro line, both modals painted at 1280 and 360, hrefs `learning.develyst.online/` + `ong.develyst.online/`; new OBS-8, QQ11 + QQ12 for Porter — see tests/TEST-006-req003-acd-portfolio-modal-pictures.md | Tanya |
| TEST-007 | REQ-004 AC-a/b/c/d/g — the 7 linked modals + the 4 link-less ones SEEN at 360x740, both new at 1280x900, plus the SQ19 "intrusive?" pictures | REQ-004 | **TEST_PASSED 2026-09-05, Tanya** — 12/12, 0 defects; 11/11 modals shot at 360 with `scrollTop 0`, bar **89px**, SQ21 reproduced (5 of 7 moved); OBS-9 + OBS-10 raised, **QQ13 ANSWERED 2026-09-05, Porter**; all 5 held AC now ticked — see tests/TEST-007-req004-pinned-footer-picture-round.md | Tanya |
| TEST-008 | REQ-005 AC-d strings SEEN on `/` + `/about` (both sizes) + REQ-007 AC-e three failure pictures re-taken on the stub / AC-h 360 fold / stub happy path | REQ-005, REQ-007 | **TEST_PASSED 2026-09-13, Tanya** — 24/24, 0 defects, 0 gateway requests; **accepted as written by Porter 2026-09-13** (REQ-005 AC-d + REQ-007 AC-e/h ticked; QQ14 answered → Q52) — see tests/TEST-008-req005-strings-and-req007-stub-pictures.md | Tanya |
| TEST-009 | REQ-007 AC-a Home + real provider in one picture, AC-d QA sample (one claim unbacked = FAIL), AC-g live frames — ONE question, planned 3 / max 5 real calls | REQ-007 | **TEST_PASSED 2026-09-13, Tanya — `calls=3`** (planned 3, cap 5, one press); AC-d 6/6 backed, AC-g 0 hits; **accepted as written by Porter 2026-09-13** (AC-a/d ticked, `calls=3` relayed to Sober, OBS-14/15/16 routed) — see tests/TEST-009-req007-real-gateway-in-a-real-browser.md | Tanya |

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| ~~**NEW INTAKE 2026-09-09 — 9 blocking questions**~~ **CLEARED 2026-09-09, Porter** | — (nothing) | All 9 answered by the owner and recorded verbatim; **REQ-005/006/007 are all `READY_FOR_SA`**. Q44 answered too. Nothing on this intake waits on him to start work — see each REQ's §Owner decisions |
| ~~**TEST-009 real-call allocation**~~ **FILLED 2026-09-13, Sober** — rows 8–10 actual 3, reserve 11–12 released | — (nothing) | Ledger **`10 / 30`**, 20 unallocated, Sober's word only; owner FYI (Q49 = 30) — see specs/SPEC-007-…md §Call ledger |
| **TASK-028 FQ53** (new 2026-09-13, Fern) — port 4014 held by the human's own `bun run dev` (VS Code terminal, PID 16964, hot-reloaded onto 4014 at Fern's edit; gateway target unknown) → DoD 1/3/5/9/12 + AC-b not run | Sober (SA) → Porter → human | Stop it, or confirm it is on the stub; then one short FE session — see tasks/TASK-028-back-port-4014-follow-the-port.md §Questions (FQ54 non-blocking: DoD 8 grep wording) |
| **SPEC-008 SQ39** (new 2026-09-13) — `docker-compose.yml` still pins `back/` at 3001 + a `/api` healthcheck that does not exist; left as found (his deployment file) | Porter (PM) → human, FYI, non-blocking | Follows 4014 only on his word as a TASK naming the file; same for `front/Dockerfile` once Q54 is answered — see specs/SPEC-008-back-port-4014-by-env.md §Questions |
| **Q52** (new 2026-09-13, was TEST-008 QQ14 / OBS-13) — hero at 360×740 holds with ZERO margin (quote line box 740.41 on a 740 fold; was 49 px) — spent by REQ-005's C1/C2 words | Human (owner) | Non-blocking: keep as is, or restore margin (copy or layout — his, then Sober) — see requirements/REQ-005-…md §Delivery |
| **REQ-008 Q53 / Q54** (new 2026-09-13) — Q53 non-blocking (**SA default taken 2026-09-13: code default 4014**, env overrides; he may overrule) · **Q54 blocks R2** (front not locked in scripts, pinned 3000 in Docker — make 3023 the fixed local port anyway?) | Human (owner) | See requirements/REQ-008-local-ports-back-4014-front-3023.md §Questions; R1 (`back/` 4014) proceeds regardless |
| **OBS-11 / 12 / 14 / 15 / 16** (new 2026-09-13, QA, not defects) | Human (owner) at sign-off; OBS-14/15 also FYI to Sober | OBS-11 header role hidden at 360 (pre-existing) · OBS-12 `2025` ×4 cert years + "Solutions" inside a cert PNG · OBS-14 "the owner" voice (rides with SQ38(b)) · OBS-15 `coverage:partial` invisible · OBS-16 five identical citation labels — see REQ-005 / REQ-007 §Delivery |
| **SPEC-007 SQ38** (new 2026-09-13) — is a capability "Yes." a backed claim under AC-d? SA default: yes (D15), non-blocking | Porter (PM) → human | Run A's real answer opens "Yes." to his own WebSocket question; every fact under it is a verified line, nothing new named. If he wants evidence-only answers: one prompt line + one paid re-run (3 calls). (b) FYI `none` answer says "the owner" — see specs/SPEC-007-…md §Questions SQ38 |
| **SPEC-007 SQ34 / SQ35 / SQ36 / SQ37** (new 2026-09-13) — four SA notices from REQ-007; **none blocks TASK-024/025/026** | Porter (PM) → human | SQ34 chips 3–6 (default: his two ship) · SQ35 H's chip answers = new copy about him (H1 ships, H2 needs his words) · SQ36 deploy-day FYI (WS URL at build, nginx, `wss://`) · SQ37 FYI (off-topic stops at step 1; step results in frames) — see specs/SPEC-007-…md §Questions |
| ~~**Q49 blocks TASK-027**~~ **ANSWERED 2026-09-13 — 30 real calls; ledger opened `0 / 30` (Sober, SPEC-007 §Call ledger)** | — (nothing) | His word `Q49=30`, REQ-007 §Owner decisions. TASK-027 waits on TASK-021 (`PROFILE.md`) + TASK-026. REQ-006's 2 unspent calls: disposition his (SQ31) |
| **SPEC-006 SQ30 / SQ31 / SQ32 / SQ33** (new 2026-09-13) — four SA notices from REQ-006; **none blocks any task** | Porter (PM) → human | SQ30 gateway checkout v1.0.0 behind prod v1.1.0 · SQ31 does a provider-free `GET /` count as one of the 5? (SA counted it: 2/5) · SQ32 ~60 s worst-case wait, only last provider's error visible (FYI) · SQ33 rewrite stale root README? — see specs/SPEC-006-back-gateway-client.md §Questions |
| **ACCEPTED EXPOSURE 2026-09-09 (his call, not a team default)** — open gateway, no cap | Human (owner) — FYI, no action | Q35 `ไม่มี auth` + Q38 `ปล่อย ไม่จำกัดไปก่อน`: once Home ships, nothing known to this team stops a stranger's script spending his provider credit. Cap must stay **cheap to add later** (REQ-007 R6) — see requirements/REQ-006-...md §Owner decisions |
| ~~**SPEC-005 SQ27**~~ **SETTLED 2026-09-13** (C9 = sheet line 5) | — (nothing) | Owner picked **A**: `/about` `<h1>` = "Four years of shipping the thing nobody there had shipped before". The career-total-or-one-pattern half went unanswered; nothing depends on it — REQ-005 §Approval record |
| ~~**SPEC-005 SQ28**~~ **SETTLED 2026-09-13** (sheet line 6) | — (nothing) | Owner: `เก็บทั้งหมด` — all 22 site-only claims stay in the profile, his word now — REQ-005 §Approval record |
| ~~**SPEC-005 SQ29**~~ **SETTLED 2026-09-13** (line-1 clause) | — (nothing; TASK-021 step 9 note is Sober's/Fern's) | Owner: `ก+ข คนละโปรเจกต์` — the two ICM four-month CRM AI bullets are **two separate projects**; two bullets stay, no merge; the relationship is now STATED, not unstated — REQ-005 §Approval record + §Owner decisions |
| ~~**SPEC-005 SQ22-SQ26**~~ **all SETTLED 2026-09-13** | — (nothing) | SQ22 C1 = five (REQ-005 AC-c) · SQ23 three strings move (C5 approved) · SQ24 → Q51 **`ไม่แสดง`**, profile-only · SQ25 no auto-year (C8 = "2026" constant) · SQ26 `back/knowledge/` (as built) — REQ-005 §Owner decisions 2026-09-13 |
| **Q50** — non-blocking (~~Q47 / Q48 / Q49~~ ANSWERED 2026-09-13: "AI Engineer / Senior Software Engineer" · 2026 · 30 calls) | Human (owner) | Q50 answer language: default deliberately NOT applied, one isolated function in the chain (SPEC-007) — until he answers, English — see requirements/REQ-007-…md §Questions Q50 |
| **Q43 / Q46** (2026-09-09) — non-blocking, written defaults stand | Human (owner) | Q43 deploy `back/` this round (default: **local only**; when he does deploy, a WebSocket needs nginx upgrade headers — REQ-006 §Questions Q43) · Q46 placement on Home (default: added below the hero, nothing removed) |
| **REQ-001 / 002 / 003 / 004 / 005 / 006 / 007 — all DELIVERED, none signed off** (001-003 rows in archive/board-closed.md; 005/006/007 added 2026-09-13) | Human (owner) | Seven sign-offs still his, plus the deploy call (`back/` untracked, Q43 default local-only): `main` `d30dfea` and `production` `ed2eb5d` do **not** carry `D1`'s `1dcc9b8` (git read 2026-09-13) — moving any of it is his hand alone |
| **OBS-9** (new 2026-09-05, QA) — the pinned bar costs **89px = 13.4%** of the 664px phone scrollport and at open hides the whole "What it does" list on Learning Curve + Ong Match | Human (owner), **inside SQ19** | **QQ13 ANSWERED 2026-09-05, Porter: OBS-9 rides WITH the SQ19 pictures as one question** (one fact, one owner, one question — same rule as QQ9). Not a defect — see REQ-004 §Delivery |
| REGRESSION H5 — unrunnable as written (no baseline exists anywhere QA may read) | **Human (Q25)** only — QQ8 answered | **QQ8 answered 2026-09-05, Porter: do NOT rewrite; H5 stays `NOT_TESTED` and REGRESSION says so.** The (a)/(b) pick IS Q25 and only the owner may make it — see log/2026-09-05.md |
| **Q26** (new 2026-09-05, was QQ10 — ANSWERED) | Human (owner) | DATA REQUEST, non-blocking: which surface his droplet serves — `next start` or `node .next/standalone/server.js`. QA ran both and they agreed, so AC8 ticked either way; it only decides what future rounds mirror — see requirements/REQ-002-...md §Questions Q26 |
| **OBS-5 / SQ13 overlap** (new 2026-09-05) — the `/services` scroller is 1156px tall on a 740px phone, so its scrollbar is off-screen while the visitor reads the top of the table | Human (owner), **inside SQ13** — QQ9 answered | **QQ9 answered 2026-09-05, Porter: it rides with SQ13** (one fact, one owner, one question); stays in TEST-005 only, no separate QA note. Not a defect, not blocking — see log/2026-09-05.md |
| REQ-001 carry-forward items | Human (owner) | 6 non-blocking calls survive DELIVERED: B, C, D, F, G, H — see requirements/REQ-001-ui-visual-redesign.md §Delivery |
| **SPEC-003 SQ14 / SQ15 / SQ16** (new 2026-09-05) — three SA notices; **SQ15 + SQ16b SETTLED 2026-09-05** by the owner's `อนุมัติ` (SA defaults taken); SQ14 was FYI only | — (nothing) | Full text of all three notices — see specs/SPEC-003-portfolio-content-refresh.md §Questions; the picks he settled are in requirements/REQ-003-portfolio-content-refresh.md §R7 approval record |
| REQ-003 **Q22-b / Q29** — still NON-blocking; **~~Q28~~ ANSWERED 2026-09-05** | Human (owner) | **Q28 CLOSED: `เก็บไว้` = keep, the nine stay (his word now, not a default)** · Q22-b dates + result per project · Q29 screenshots showing other people's data (default: not published, R8) — see requirements/REQ-003-portfolio-content-refresh.md §Questions |
| **SPEC-004 SQ18 / SQ19 / SQ20 / SQ21** — four SA notices from REQ-004; all four survive DELIVERED and go to the owner at sign-off | Human (owner) | Scope is 7 of 11 · **SQ19 now carries OBS-9 + the pictures** (bar measured 89px; SQ7 still open) · Q32's default NOT consumed · the fix moved **5 of the 7** — see specs/SPEC-004-portfolio-modal-live-link-on-phones.md §Questions |
| **REQ-004 Q30 / Q31 / Q32** (new 2026-09-05) — all NON-blocking, all with written defaults | Human (owner) | Q30 is the bar "no scrolling at all" · Q31 all eleven or only the two new · Q32 may the button move up the reading order (SQ20: that default is **not** consumed) — see requirements/REQ-004-portfolio-modal-live-link-button-on-phones.md §Questions |
| SPEC-002 SQ1-SQ6 | Porter (PM) | 6 SA notices, none blocking — SQ2 updated 2026-09-02: ordinals ALREADY ship on /portfolio + Home, so existing ones are kept and no new one is added until he answers — see specs/SPEC-002-site-wide-step-up-five-routes.md §Questions |
| SPEC-002 SQ7 — scope half only (the "never opens" claim did not reproduce) | Human (owner) → then Sober | STILL UNANSWERED, and REQ-002 went `DELIVERED` 2026-09-05 with the modal *look* UNVERIFIED — his sign-off is where he answers it; the gate-lift itself is Sober's — see requirements/REQ-002-...md §Questions SQ7 |
| SPEC-002 SQ8 — opening-block heights + the QA eye checks | Human (heights/FQ29) only | **All 7 eyes answered 2026-09-05 by TEST-004** (all seven positive; `/services` = the missing 5th height, 742.59 / 371.52). Heights + FQ29 remain the owner's — see tests/TEST-004-req002-site-wide-acceptance.md §The 7 SQ8 eye checks |
| SPEC-002 SQ11 — `/blog` + `/portfolio` ship ~123 kB more First Load JS than HEAD | Porter (PM) → human | **Named lead FALSIFIED 2026-09-05** by TASK-015 build A/B; no replacement cause named, no follow-up task. Non-blocking; the ask is unchanged and still the owner's — see specs/SPEC-002-site-wide-step-up-five-routes.md §Questions SQ11 |
| SPEC-002 **SQ13** (new 2026-09-05) — `/services` is 1156px tall on a phone, one column beside ~530px of empty rows | Porter (PM) → human, **after** he sees the DEF-3 fix | NOT a defect and NOT blocking: DEF-3 is fixed as asked. The layout underneath is scope, so it is the owner's call whether the phone layout gets rethought later — see specs/SPEC-002-site-wide-step-up-five-routes.md §Questions SQ13 |
| SPEC-002 SQ12 — **settled 2026-09-05 by TEST-004's 6th eye** | Porter (PM) → human | SETTLED 2026-09-05: there IS a visible focus indicator (Sober's read correct, Fern's was taken unfocused). Left with the owner: is a 1px border change enough under WCAG 2.4.7 — see tests/TEST-004-req002-site-wide-acceptance.md §The 7 SQ8 eye checks |
| SPEC-002 SQ9 — the lattice will no longer read behind Home's hero or a route's opening block | Porter (PM) → human (owner) | Non-blocking, SA already decided it (aurora is the ground where it paints). Only a decision if the owner dislikes the look — see specs/SPEC-002-site-wide-step-up-five-routes.md §Questions SQ9 |
| REQ-002 **Q18** (Q19 is closed) | Human (owner) | Q18 still open: AI/robotic/IoT = visual only, or also positioning in words? Non-blocking. **Q19 CLOSED 2026-09-05 `เอาออก`** — the five routes lose the toggle too — see requirements/REQ-002-whole-site-step-up-five-routes.md §Questions Q19 |
| REQ-002 label-recipe casing (FYI, not a question) | Porter (PM) → human | **14** visible labels change letter case (8 `/about`, 3 `/services`, +3 `/contact` added 2026-09-04) — no source string touched; an intended, SA-owned consequence of the label recipe. Rule now in SPEC-002 §Retired patterns — see tasks/TASK-010-...md §Questions FQ31 |
| SQ7 gate — does TEST-002's cannot-reproduce lift it? | Sober (SA), via Porter | **TEST-003 is now DONE and the gate is still untouched**: overlays open, paint and close on the build too, but the modal/drawer **look** was explicitly not ticked by QA — see tests/TEST-003-sq7-build-round.md §Scope |
