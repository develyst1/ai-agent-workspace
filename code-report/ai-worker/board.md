# Board — code-report

> Single source of truth for CURRENT state. Update me at the end of every session
> (see PROTOCOL.md). **File discipline (workspace-root `DISPATCHER.md`, binds all
> roles):** detail lives in the TASK/REQ file; a board cell is ONE line (status +
> date + owner + pointer); a log entry is ≤ 15 lines. Never paste evidence or
> keep old text here. Full pre-compaction board:
> `archive/board-2026-08-21-pre-compaction.md`.

## Project info

- Description: web tool that takes a git repository (public, or private via PAT),
  analyses the codebase + commits for a chosen day/date range, accepts extra
  free-text context, and produces a readable written dev-work summary — on
  screen, later optionally emailed. Stakeholder infrastructure: AI API CENTER
  (his multi-provider AI API), PostgreSQL, SMTP.
- Product name on screen: `KnowCode` (REQ-001 Req 14; repos/folders NOT renamed).
- Repos: `C:\Users\Admin\develyst\code-report\code-report-back` (Jason) ·
  `C:\Users\Admin\develyst\code-report\code-report-front` (Fern).
- Team: Porter (PM) · Sober (SA Lead) · Jason (BE) · Fern (FE) · Tanya (QA) —
  QA now OPERATIONAL 2026-08-21 (Q20 = c, Q21 = "เขียนเลย"): `ai-worker/QA.md`
  written, PROTOCOL.md amended (chain `Porter ↔ Tanya`, REQ leg `IN_TEST` →
  `TEST_PASSED`/`TEST_FAILED`), `ai-worker/tests/` created. Tanya is **local-only
  here** (this project has no deployed environment) and the no-SQL rule is not
  relaxed for her. Nothing handed to her yet. **PROTOCOL.md's team + chain
  tables now also list Fern (FE)** — Q22 "เพิ่มเลย", 2026-08-21, bookkeeping only.
- 🧪 Trial ground for the DISPATCHER (workspace-root `DISPATCHER.md`): one
  session spawns the roles as subagents. Files remain the only channel;
  PROTOCOL unchanged.
- Standing rules still live: no SQL / real environments for the team (human is
  the data source, via DATA REQUEST); copy bundle CLOSED by Q14 (new strings
  need a TASK line + human yes/no); dates rendered `DD/MMM/YY` per Req 15.
- **Copy rule refined 2026-08-24 (Q37):** an English word sitting inside a Thai
  screen is **not** an inconsistency on this project — he counts such a word as
  Thai — and **he edits Thai copy himself**. Reinforces Q14; does not open it.
- **Language scope 2026-08-24 (Q39):** "ไทยหลัก อังกฤษรอง" applies to everything
  **the stakeholder reads** (product UI, docs/output produced for him). **Team-
  internal artifacts stay English** — REQ/SPEC/TASK, board, log (he doesn't read
  them; PROTOCOL unchanged).
- **UI reword 2026-08-24 (Q40 = "แก้เลย"):** the team DOES go reword the *existing*
  UI strings to Thai-primary — **overrides Q37** (he no longer edits that copy
  himself for this pass). Captured as **REQ-007** (`READY_FOR_SA`, Sober's).
  `KnowCode` (Req 14) + `DD/MMM/YY` (Req 15) excluded; the form of "อังกฤษรอง" is
  Sober's wording call. **Q41 open (NON-BLOCKING):** do reworded strings still
  come back for his yes/no (Q14) — working default = yes; drafting can start.
- **Frontend toolchain 2026-08-24 (Q34/Q35): bun only, npm dropped permanently.**
  He committed the lockfile swap himself at `d44f523`; the FE tree is clean.

## Requirements

| ID | Title | Priority | Status | Owner of next step |
|----|-------|----------|--------|--------------------|
| REQ-001 | Generate a readable dev-work report from a git repository | HIGH | IN_SPEC — Reqs 16/17/18 added 2026-08-20, TASK lines still unwritten (Sober's queue) | Sober (queue) + engineers on open TASKs; see Tasks |
| REQ-002 | *(planned, number RESERVED — see parked facts: ID desync)* Email the finished report | — | not written yet | Porter (PM) |
| REQ-003 | Frontend UI quality + folder-structure overhaul (`code-report-front`) | HIGH | IN_SPEC — TASK-015 open, TASK-016's block is GONE (Q-SA-17 = "ก", answer in REQ-003 §Questions for Sober to transcribe + move). **Q30 narrows the verdict: redesign NOT rejected, not accepted either** — REQ-003 §Questions | Sober (transcribe Q-SA-17, move TASK-016) · Fern (TASK-015) |
| REQ-004 | New-report form usability (branch list, committer, dates) + back from the report page | HIGH | **IN_SPEC 2026-08-21 — SPEC-003 ACTIVE**; 017 + 018 + 019 all `DONE` (Reqs 1/1a/2/2a/3/4a/4b/6 built and SA-verified); only **TASK-020** is left, and Q32/Req 7d's freeze widening is still unwritten | Fern (TASK-020) · Sober (the 7d widening) |
| REQ-005 | Frontend repo runs on **bun** instead of npm (stakeholder-mandated toolchain) | HIGH | **DELIVERED 2026-08-24 — Porter acceptance check PASSED.** All 4 ACs met; AC 2/3/4 independently re-verified by Porter at `d44f523` (clean tree; `diff f70fb02..HEAD` = two lockfiles only, zero source diff; open FE tasks + board proxy rule carry no npm), AC 1 on TASK-021's SA-corroborated evidence. No team code work was ever required (stakeholder did the lockfile swap himself). Human informed in Thai | — (delivered) |
| REQ-007 | Reword existing UI strings to Thai-primary / English-secondary (Q40 = "แก้เลย") | MEDIUM | **IN_SPEC 2026-08-24 — SPEC-006 ACTIVE, TASK-024 created (BLOCKED on sign-off).** Form ruled = Form 2 (Thai-led, English kept only for no-Thai-equiv terms); scope = `th` values in `dictionaries.ts` only (`en` untouched). `th` already ~90% Thai-primary → finite candidate set. **Q-SA-22 up (loanword policy + Q41 sign-off): does Q37's "keep Branch" generalise to repository/branch/PAT?** — routed to human via Porter | Porter (relay Q-SA-22 to human) → then Fern (TASK-024) |
| REQ-006 | Inconsistencies on the new-report screen (his own screenshot, `project-docs/image-1787542760015.png`) | HIGH | **SPEC_DONE 2026-08-24 — both SPEC-005 tasks reviewed DONE by Sober (TASK-022 at `859148a`, TASK-023 at `68a1475`).** Req 1 (load-button alignment) + Req 3 (`DD/MMM/YY` period inputs) built and SA-verified; no backend, no dependency, no string change. Awaiting Porter's acceptance check. | Porter (acceptance) |
| REQ-008 | Deeper backend AI analysis pipeline — 5-stage redesign (AI_PROJECT → AI_COMMITS → AI_CURIOUSNESS → AI_UNDERSTANDING → AI_WRITING), model + max_tokens explicit & env-configurable per stage | HIGH | **IN_SPEC 2026-08-24 — SPEC-007 ACTIVE.** **Q-BE-25 RULED 2026-08-24 (Option 2):** the `client.ts` required-field flip moved TASK-025→TASK-027 (contract change lands with its sole caller `pipeline.ts` in one green commit; verified only `.chat(` caller read-only at `d1f0993`). TASK-025 now `config.ts`-only (config half already green → Jason commits + REVIEW); TASK-027 carries the client flip. Q-REQ008-2 answered (D2), Q-REQ008-3 confirmed. Model→stage defaults **pending Q-REQ008-1**; **Q-SA-23** (surface 2 stages in FE bar?) NON-BLOCKING with Porter. | Jason (TASK-025 unblocked→commit+REVIEW; TASK-026 startable; TASK-027 startable after 025) · Porter (relay Q-REQ008-1 + Q-SA-23) |

## Specs

| ID | Title | Source | Status | Owner of next step |
|----|-------|--------|--------|--------------------|
| SPEC-001 | Git-repo dev-work report — API, data model, git + AI pipeline | REQ-001 | ACTIVE | engineers via TASK rows; amendments queued (Sober) |
| SPEC-002 | Frontend UI redesign + folder-structure rebuild | REQ-003 | ACTIVE — Decision 3.4 stays WITHDRAWN (no new dependency); **freeze items 1 + 4 now PARTIALLY RELEASED 2026-08-21 for SPEC-003 only** (item 4 = the board's "item 3"; see the annotations in SPEC-002) | Fern (TASK-015) |
| SPEC-003 | New-report form usability (loaded branch + committer lists, one date range) + back from the report page | REQ-004 | **ACTIVE 2026-08-21** — 2 new read-only BE endpoints, no schema/contract change; **017 + 018 + 019 all `DONE`**, only 020 open; all four freeze-item-4 clauses built **and SA-verified**; how much further 7d opens the freeze is still unwritten | Fern (TASK-020) · Sober (freeze widening) |
| SPEC-004 | Frontend toolchain — bun replaces npm (team wording alignment, no product change) | REQ-005 | **DONE 2026-08-24** — no repo code work; command mapping + DONE-vs-open ruling recorded; Req 3+5 wording edits executed by Sober; **TASK-021 reviewed DONE (bun toolchain verified, AC 1 evidence in hand)**. REQ-005 now `SPEC_DONE` | — (REQ-005 with Porter) |
| SPEC-005 | New-report screen inconsistencies — load-button alignment + date-format parity | REQ-006 | **DONE 2026-08-24** — both tasks reviewed DONE (TASK-022 at `859148a`, TASK-023 at `68a1475`); Req 1 + Req 3 built and SA-verified. REQ-006 → `SPEC_DONE` | — (REQ-006 with Porter) |
| SPEC-006 | Reword existing UI strings to Thai-primary / English-secondary | REQ-007 | **ACTIVE 2026-08-24** — form ruled Form 2 (Thai-led, English only for no-Thai-equiv terms); scope = `th` values in `dictionaries.ts` only; grounded audit done (`th` already ~90% Thai-primary, finite candidate set); reword drafts gated on human sign-off (Q-SA-22) | Porter (relay Q-SA-22) · Fern (TASK-024, blocked) |
| SPEC-007 | Deeper backend AI pipeline — 5 stages, explicit env-configurable model+max_tokens per call | REQ-008 | **ACTIVE 2026-08-24** — 5-stage flow designed on the real backend; pipeline stays pure (RepoInspector + CuriosityInvestigator injected); wire progress kept at 6 stages (D-wire, backend-only); AI_CURIOUSNESS = text-action loop over live clone (D4); AI_WRITING = multi-pass by-topic + concat assembly (D2); model defaults pending Q-REQ008-1. TASK-025 config half done, BLOCKED on Q-BE-25 (client-field-vs-pipeline sequencing); 026 startable; 027/028 pending | Jason (TASK-026) · Sober (Q-BE-25) |

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-001 | BE — skeleton, config, Postgres schema + migration, seed | SPEC-001 | IN_PROGRESS — code complete; migrate/seed evidence in `../project-docs/` (2026-08-20/21), DoD close is Sober's review call (queue item 3) | Jason (BE) | none |
| TASK-002 | BE — auth: login/logout/me, sessions | SPEC-001 | DONE — reviewed 2026-08-20, evidence in TASK-002 §Review | Jason (BE) | TASK-001 |
| TASK-003 | BE — git layer: clone, tree, commits, PAT redactor | SPEC-001 | DONE — rework reviewed 2026-08-20, commit `2e441bf`, evidence in TASK-003 §Review | Jason (BE) | TASK-001 |
| TASK-004 | BE — AI API CENTER client + 3-stage pipeline | SPEC-001 | DONE — rework reviewed 2026-08-20, commit `e3453a8`, evidence in TASK-004 §Review | Jason (BE) | TASK-001 |
| TASK-005 | BE — report endpoints + worker + statuses | SPEC-001 | DONE — rework reviewed 2026-08-21, commit `4101551`, evidence in TASK-005 §Review | Jason (BE) | 002, 003, 004 |
| TASK-006 | FE — app shell, login, session, i18n scaffold | SPEC-001 | DONE — reviewed 2026-08-20, evidence in TASK-006 §Review | Fern (FE) | none |
| TASK-007 | FE — new-report form | SPEC-001 | DONE — reviewed 2026-08-20, evidence in TASK-007 §Review | Fern (FE) | TASK-006 |
| TASK-008 | FE — report view: polling, progress, sanitized Markdown | SPEC-001 | DONE — rework reviewed 2026-08-20, commit `f00e78d`, evidence in TASK-008 §Review | Fern (FE) | TASK-006 |
| TASK-009 | BE+FE — acceptance run, th + en; carries runs 1–11 | SPEC-001 | TODO — pause lifted; **Q24 answered by delegation 2026-08-21** ("เอาตามที่แนะนำ"): working answer = team writes the click-through script, he runs the eleven UI runs. Re-scoping is Sober's; reversible by one line | Jason + Fern | 005, 008 (DONE) |
| TASK-010 | FE — folder-structure rebuild, no visual change | SPEC-002 | DONE — reviewed 2026-08-21, commit `9b6345c`, gates re-run by Sober; evidence in TASK-010 §Review | Fern (FE) | none |
| TASK-011 | FE — shell + login, Mantine-first + `hallmark redesign` (picks theme; folds in `KnowCode` name) | SPEC-002 | DONE — reviewed 2026-08-21 by Sober at `0b63dec`, gates re-run + contrast re-derived from tokens; theme = hallmark `cobalt`; evidence in TASK-011 §Review | Fern (FE) | TASK-010 (DONE) |
| TASK-012 | FE — new-report form, Mantine-first + `hallmark redesign` | SPEC-002 | DONE — reviewed 2026-08-21 by Sober at `8cac881`; all gates re-run, `globals.css` deletions proved safe by a defined-vs-used class inventory; all 3 `[~]` lines ruled; evidence in TASK-012 §Review | Fern (FE) | TASK-011 (DONE) |
| TASK-013 | FE — report view, Mantine-first + `hallmark redesign` | SPEC-002 | DONE — reviewed 2026-08-21 by Sober at `1f90b87`; all gates re-run, repo-wide token gate verified **0 colour + 0 font**, token block proved unchanged (38 = 38, none added/changed), Q-FE-19 ruled; evidence in TASK-013 §Review | Fern (FE) | TASK-011, TASK-012 (both DONE) |
| TASK-015 | FE — show the session-expired line (Q-SA-14, the one release of freeze item 2) | SPEC-002 | TODO — written 2026-08-21; behaviour only, no new string, no redesign, no dependency | Fern (FE) | TASK-013 (DONE) |
| TASK-016 | FE — local acceptance hand-over: the URL + steps the stakeholder opens (Q-SA-15 + Q23) | SPEC-002 | BLOCKED on paper only — **Q-SA-17 ANSWERED 2026-08-21 "ก" (he starts the backend too, all 3 screens)**; only Sober may move the status and re-scope the hand-over | Fern (FE), via Sober | TASK-015 |
| TASK-019 | FE — back from the report page (`replace`→`push`, explicit control, filled form both ways) | SPEC-003 | **DONE — reviewed 2026-08-21 by Sober at `32e8eed`**; all gates re-run, every deleted line opened, Q-FE-20/21/22 ruled; one finding = Sober's own DoD gap (`extraContext` not restored → Q-SA-20); evidence in TASK-019 §Review | Fern (FE) | TASK-013 (DONE) |
| TASK-017 | BE — repository inspection endpoints (`/api/repos/branches`, `/api/repos/committers`) | SPEC-003 | **DONE — reviewed 2026-08-21 by Sober at `d1f0993`**; all gates re-run + behaviour re-measured outside his suite, Q-BE-17/18/19/20 all ruled; evidence in TASK-017 §Review | Jason (BE) | none |
| TASK-018 | FE — the re-shaped form (branch list + gate, one range today→today, committer list) | SPEC-003 | **DONE — reviewed 2026-08-21 by Sober at `f70fb02`**; all gates re-run, contract re-derived from the real backend, Q-FE-23/24/25/26 all ruled; 2 named gaps carried into TASK-020; evidence in TASK-018 §Review | Fern (FE) | TASK-017, TASK-019 (both DONE) |
| TASK-020 | FE — Requirement 7 usability pass, every screen | SPEC-003 | **TODO — STARTABLE 2026-08-21** (018 `DONE`); **last SPEC-003 TASK**; ceiling still Req 7c until Sober writes the 7d widening; 2 carried-in gaps in its file | Fern (FE) | TASK-018 (DONE) |
| TASK-014 | BE — one real API-driven job: prove the PostgreSQL path (ex-run 13) + record the AI tier (ex-run 12) | SPEC-001 | **PHASE A DONE — Thai pass ACCEPTED 2026-08-24 by Sober; the runbook is FINAL and handed to @Porter for relay.** TASK now `BLOCKED (waiting: the stakeholder via @Porter — his run output into `../project-docs/`)`; Q-BE-24 answered (`Step N` stays English). Verdict + verification in TASK-014 §Review → "Phase A Thai pass" | Porter (relay to the human) → then Jason (Phase B) | TASK-005 (DONE) |
| TASK-021 | FE — verify `code-report-front` type-checks, builds and boots under **bun** (REQ-005 AC 1 evidence) | SPEC-004 | **DONE — reviewed 2026-08-24 by Sober at `d44f523`**; HEAD/clean-tree/scripts/four-routes independently re-verified read-only, DoD rows 1–6 all met, Q-FE-27 answered NON-BLOCKING (boot sanity satisfied by Ready line + green build on identical source; unknown PID 7380 correctly not killed). Evidence in TASK-021 §Review | Fern (FE) | none |
| TASK-022 | FE — each load button reads as one row with its dropdown (REQ-006 Req 1, the item he named) | SPEC-005 | **DONE — reviewed 2026-08-24 by Sober at `859148a`.** Diff independently corroborated read-only: clean tree, only `NewReportFields.tsx`, **exactly two lines** (`sm:items-end` on the branch-row L225 + committer-row L343 `<Group>`s); layout-only proved BY the diff (only a className literal moved → REQ-006 Req 2 holds). Only the two matching rows changed (other 3 Groups are different layouts, correctly untouched). Cascade mechanism verified (sm+ `@media` utility wins → flex-end; mobile `items-stretch` stack intact). Build gate not re-run — a className-only diff is inert to typecheck/build; evidence in TASK-022 §Review | Fern (TASK-023) |
| TASK-023 | FE — period inputs render `DD/MMM/YY`, matching the summary card (REQ-006 Req 3) | SPEC-005 | **DONE — reviewed 2026-08-24 by Sober at `68a1475`.** Diff independently corroborated read-only: clean tree, parent `859148a`, only `globals.css` (+52) + `NewReportFields.tsx` (+88/−15); `package.json`/i18n not in diff. Read-face driven by the **same** `formatIsoDate(value)` the summary uses (`NewReportContent.tsx` L452–453) → parity by construction; native `type="date"` value/onChange/picker unchanged → wire + behavioural rows inert to the diff (logic files `NewReportContent.tsx`/`NewReport.config.ts` confirmed absent from diff). Gates re-run by me: `typecheck` exit 0, token gate real zero outside `globals.css` (neither touched file appears); build not re-run (live-server PID 7380 collision — inert for a render/CSS diff, Fern's green evidence stands, same as TASK-022). Q-FE-28 answered NON-BLOCKING: by-construction sufficient, no authed render required (creds prohibited / real backend not team's to stop; pixel-alignment low-risk, derived from Mantine `--input-padding`). Evidence in TASK-023 §Review | Fern (FE) | none (after TASK-022, done) |

| TASK-024 | FE — apply the stakeholder-approved Thai-primary `th` strings to `dictionaries.ts` | SPEC-006 | **BLOCKED (waiting: stakeholder sign-off on the reword drafts via Porter — Q-SA-22).** Strings-only; only `th` values in the one dictionary file; `en`/keys/excluded-terms untouched; apply ONLY approved copy | Fern (FE), after Q-SA-22 | Q-SA-22 answered |
| TASK-025 | BE — per-stage `model`+`max_tokens` **config** (config.ts only) | SPEC-007 | **IN_PROGRESS 2026-08-24 — UNBLOCKED (Q-BE-25 ruled Option 2 by Sober).** Scope narrowed to `config.ts`; the `client.ts` flip moved to TASK-027. Config half is DONE & green: `Config.aiStages` {model,maxTokens}×5 + curiosity/writing limits, 12 env vars + D3 defaults, unknown-model / over-cap → fatal `ConfigError`, `describeConfig` + `.env.example` + config tests; `typecheck` 0, `bun test` 235 pass. **Nothing further to implement — Jason commits the config half and moves to REVIEW.** `console.log` item moot. | Jason (BE) | none |
| TASK-026 | BE — `RepoInspector` over the live clone (list tree / read file / search word), path-confined + capped | SPEC-007 | **TODO 2026-08-24 — STARTABLE.** New `src/git/inspect.ts`, reuses existing caps; local-file-only, no network/PAT/DB; injectable for AI_CURIOUSNESS | Jason (BE) | none |
| TASK-027 | BE — **client.ts required-field flip (Q-BE-25)** + 5-stage pipeline: stages/prompts, AI_UNDERSTANDING, AI_WRITING multi-pass by-topic + concat assembly | SPEC-007 | **TODO 2026-08-24.** Now also owns making `ChatRequest.model`/`max_tokens` required + `chatBody` always emits both + `ai-client.test` (moved from TASK-025, lands green with the 3 pipeline call sites it updates). Curiosity loop behind an injected seam (pass-through here); every call threads per-stage model+max_tokens; unit-tested against fakes | Jason (BE) | TASK-025 |
| TASK-028 | BE — AI_CURIOUSNESS loop (text-action protocol) + worker wiring + internal→wire stage mapping | SPEC-007 | **TODO 2026-08-24.** Real investigator over RepoInspector, env loop cap (default 5), safe exit; worker maps curiosity→AI_COMMITS, understanding→AI_WRITING (progress.total stays 6) | Jason (BE) | TASK-026, TASK-027 |

**Next (2026-08-24, SA unit): Q-BE-25 RULED → Option 2. Re-scoped TASK-025 (config.ts
only) + TASK-027 (gains the client.ts contract flip); TASK-025 UNBLOCKED.** Jason hit a
real sequencing conflict I authored: TASK-025's DoD made `ChatRequest.model`/`max_tokens`
required AND demanded `typecheck` 0, but the only caller `pipeline.ts` passes neither, and
threading them is TASK-027 (depends on 025) — the two couldn't both be green as written.
**Ruling = Option 2 (Jason's lean, confirmed):** move the `client.ts` required-field flip
into TASK-027, which rewrites `pipeline.ts` wholesale and threads per-stage model+max_tokens
anyway, so the contract change and its sole consumer land in ONE green commit — no throwaway
per-stage wiring of the 3-stage pipeline that 027 deletes (Option 1). **Load-bearing fact
verified read-only at `d1f0993`:** `grep -rn "\.chat(" src/` = exactly the three
`pipeline.ts` sites (L84/97/111), `ChatRequest`/`client.chat` has **no other consumer** — so
the required-field flip has exactly one place to break, and it's the file 027 rewrites.
**Applied (SA owns specs/tasks):** TASK-025 → `config.ts`-only (its §1 + the `chatBody`/
`ai-client.test` DoD rows moved out); the config half Jason already delivered
(`Config.aiStages`, 12 env vars, `APPROVED_MODEL_CAPS`, `.env.example`, config tests;
typecheck 0 / 235 tests pass) **is the whole task and is green** → status BLOCKED→IN_PROGRESS.
TASK-027 gains a §"What to do" #0 (client flip) + 2 DoD rows; SPEC-007 §Tasks + both TASK
files annotated with the Q-BE-25 ref for traceability. Answer written in TASK-025 §Questions.
No code, no SQL, no environment; SA edits to SA-owned files only (+ the read-only grep to
verify). **@Jason: TASK-025 is unblocked — commit the config half and move it to REVIEW; do
NOT touch `client.ts`/`pipeline.ts` in 025. TASK-026 still startable; TASK-027 now carries
the client contract change from the top (still `depends on: 025`).** @Porter: nothing new —
Q-REQ008-1 + Q-SA-23 still awaiting your relay (both NON-BLOCKING). @Fern: nothing new is
yours (TASK-024 still BLOCKED on Q-SA-22).

**Next (2026-08-24, SA unit): REQ-008 picked up → `IN_SPEC`; SPEC-007 written;
TASK-025/026/027/028 created (all TODO for Jason).** Designed read-only against the
real backend `code-report-back` at `d1f0993` (I did NOT commit; note: the working
tree has one uncommitted line — a stray `console.log("request:", request)` in
`src/ai/client.ts`, almost certainly the stakeholder's own during his real run —
TASK-025 lands client.ts without it). No code, no SQL, no environment; SA edits to
SA-owned files only (+ my answers inside REQ-008 §Questions, which is permitted).
**Shape:** the current 3-stage pipeline is pure/injected (`pipeline.ts` runs inside
`withClone`, so the clone is alive for the whole run) — I preserved that: the two
new needs are met by **injecting** a `RepoInspector` (list tree / read file / search
word, path-confined + capped — TASK-026) and a `CuriosityInvestigator` seam, so the
pipeline stays unit-testable with zero network/fs. **Client gap closed** (TASK-025):
`chatBody` today sends NO `model` and only-if-present `max_tokens`; both become
required per call + env-configurable per stage (12 new env vars, mandated defaults,
config rejects unknown model / over-cap budget). **Two design calls I made, not
guessed:** D2 — AI_WRITING = multi-pass by-topic then **deterministic concat, no
extra stitch call**; D4 — AI_CURIOUSNESS is a **text-action loop** (`/chat` has no
tool-calling), model emits `list_tree`/`read_file`/`search`/`done`, BE executes via
the inspector and feeds results back as DATA, safe-exit on unparseable. **Q-REQ008-3
confirmed** (budgets = max_tokens). **Q-REQ008-1 (model→stage) stays with the human**
— I proposed defaults within his tier/cap rules (CURIOUSNESS/UNDERSTANDING/WRITING
forced to the deep tier by their 40–50k budgets), env-overridable, nothing ships as
final until he confirms. **One thing I refused to fold in silently → Q-SA-23
(Sober→Porter, NON-BLOCKING):** REQ-008 is backend-only, but the FE progress ledger
hardcodes six stages + i18n labels, so emitting two new wire stages would break it —
SPEC keeps the wire at six (map curiosity→AI_COMMITS, understanding→AI_WRITING); if
the stakeholder wants the new depth shown as its own steps, that is a **separate FE
REQ**, Porter's to raise. BE is not blocked. @Jason: **TASK-025 + TASK-026 are
startable now** (independent); 027 needs 025, 028 needs 026+027 — read SPEC-007
first. @Porter: please relay **Q-REQ008-1** (model→stage confirmation) and **Q-SA-23**
(surface new stages in the progress UI?) — both NON-BLOCKING; the BE work proceeds on
the safe defaults meanwhile. @Fern: nothing new is yours (TASK-024 still BLOCKED on
Q-SA-22).

**Next (2026-08-24, PM unit): new stakeholder requirement captured → `REQ-008`
(`READY_FOR_SA`) — the backend AI pipeline redesign.** No `specs/`, no `tasks/`, no
code, no TASK status moved, no SQL, no environment, no engineer addressed. Writes:
new `requirements/REQ-008-deeper-backend-ai-pipeline.md`, the REQ-008 board row, this
narrative, today's log line. **What it is:** replace the current 3-stage pipeline
(AI_PROJECT → AI_COMMITS → AI_WRITING; REQ-001/SPEC-001/TASK-004) with a **deeper
5-stage** one — AI_PROJECT (×1, file tree + `.md` digest + extra context) → AI_COMMITS
(×N, 20/batch, **sequential**) → **AI_CURIOUSNESS** (env loop, default 5: judges
missing info, may read a path / list the folder tree / search a word in the real repo,
re-asks, exits when satisfied) → **AI_UNDERSTANDING** (writes its own reasoning as a
thought block first, not a pass-through translation) → AI_WRITING (env pass-limit,
splits material by topic across passes → one final report). **The gap it closes**
(stakeholder confirmed after a real run today): every AI call goes out with **NO
`model` and NO `max_tokens`** — both must become explicit and **env-configurable per
stage**. **Stakeholder-mandated numbers recorded verbatim** (default max_tokens:
PROJECT 20000, COMMITS 20000, CURIOUSNESS 50000, UNDERSTANDING 40000, WRITING 50000;
approved models by exact id + tier + per-call cap: `gpt-4.1`/`grok-4-latest` ≤50000,
`gpt-4.1-mini`/`deepseek-v4-pro` ≤30000). **The one thing I refused to guess →
Q-REQ008-1 (routed to human, NON-BLOCKING):** he gave the models + tiers + caps but no
explicit **model→stage** mapping, and three stages' default budgets exceed the cheap
tier's 30000 cap — so does he confirm a per-stage model or delegate the mapping to the
team within his tier rules? Working default = team proposes, he confirms before ship;
spec structure does not wait on it. **@Sober: REQ-008 is yours to pick up** —
ordering it against REQ-007's TASK-024 (blocked on Q-SA-22) and your other queue items
is your call; two design questions are parked in REQ-008 §Questions (AI_WRITING
assembly Q-REQ008-2; the max_tokens-vs-context interpretation Q-REQ008-3). @Fern/@Jason:
nothing new reaches you except as Sober's TASKs. **This is a PM intake unit only — I
did not design the pipeline.**

**Previous (2026-08-24, SA unit): REQ-007 picked up → `IN_SPEC`; SPEC-006 written;
TASK-024 created (BLOCKED on sign-off).** Read-only against the real repo
`code-report-front` at `68a1475` (clean tree); no code, no SQL, no environment; SA
edits to SA-owned files only. **Every user-facing string lives in ONE file** —
`src/constant/text/dictionaries.ts` (`th` + `en` objects) — verified nothing
user-visible is hardcoded (the only other Thai in `src/` is a code comment). **The
`th` object is already ~90% Thai-primary**, so the reword is a small finite
consistency pass, not a rewrite. **Form ruled (REQ-007 Req 5, my call) = Form 2**:
Thai text keeping English only where a term has no natural/adopted Thai equivalent
— NOT the two-line bilingual form, because that would be a layout change (Req 3
forbids) and English is already a switchable mode. **Scope = `th` values only**
(the copy he reads, Q39); `en` object untouched, no key added/removed. **Grounded
audit**: the only `th` strings still leading with English are git technical terms
(`Repository` label, `Personal access token`, `repository`/`branch` loanwords);
`Branch` is EXCLUDED (Q37, he kept it), as are `KnowCode`/URL/`Asia/Bangkok`/`TH`/
`EN`. **The one thing I refused to assume → Q-SA-22 (to human via Porter):** Q37
proves keeping English git terms is his deliberate taste, so whether that
generalises to repository/branch/PAT is HIS call, not a translation I invent — I
propose drafts (repository→`ที่เก็บโค้ด`, keep `branch`, PAT→Thai+English-in-parens)
and gate them on his yes/no (also the Q41/Q14 sign-off). No proposed string ships
without his answer. **@Porter: relay Q-SA-22** (one-line answerable; NON-BLOCKING
for you — you can relay now; it BLOCKS Fern's TASK-024 apply). **@Fern: TASK-024 is
yours but BLOCKED until Q-SA-22 lands — do not start.** @Jason: nothing new is
yours (TASK-014 Phase B still waits on the human's run output via Porter).

**Previous (2026-08-24, SA unit): TASK-023 reviewed → `DONE` at `68a1475`; REQ-006 →
`SPEC_DONE`, SPEC-005 → `DONE`, handed to @Porter for acceptance.** Both SPEC-005
tasks are now SA-verified (TASK-022 layout at `859148a`, TASK-023 date-format at
`68a1475`). Corroborated read-only against the real repo `code-report-front`:
clean tree at `68a1475` (parent `859148a`); `git diff 859148a..68a1475` = **only
two files** — `globals.css` (+52, the `.cr-datefield` read-face, unlayered on
purpose to override Mantine's unlayered input colour) and `NewReportFields.tsx`
(+88/−15, a new `PeriodField` the two period inputs point at). `package.json` and
all i18n/constant files are **absent from the diff** (no new dep, empty dictionary
diff). The read-face is driven by the **same** `formatIsoDate(value)` the summary
card calls on the **same** state value (`NewReportContent.tsx` L11/L452–453), so
`DD/MMM/YY` parity holds **by construction**; `formatIsoDate` reads ISO parts
directly (no `Date` round-trip, `null` on malformed → no half-render), keeping the
timezone-day-shift trap avoided. The native `type="date"` value/onChange/picker
are unchanged (onChange semantics byte-equivalent), and the behavioural-DoD logic
files (`NewReportContent.tsx`, `NewReport.config.ts`) are confirmed **not in the
diff** → wire, 366/367, presets, invalidation, prefill, gate are inert to this
change. Gates re-run by me read-only: `bun run typecheck` **exit 0**; SPEC-002
token gate **real zero** outside `globals.css` (only comment/config false-positives
in `layout.tsx`/`theme.ts`; neither touched file appears). **`bun run build`
deliberately NOT re-run** — a render-face + CSS diff is inert beyond typecheck, and
re-running risks the known live dev server (PID 7380, Q-FE-27); Fern's green build
(same four routes, isolated :3100 `/login` 200) stands, same handling as TASK-022.
**Q-FE-28 answered NON-BLOCKING**: by-construction is sufficient — no authed
`/reports/new` render required, because reaching it needs credentials (a hard
safety prohibition for both Fern and me) or stopping the real backend on :8080 (not
the team's call), obtainable only via the human; the one genuinely unmeasured item
(read-face pixel alignment) is low-risk, derived from Mantine's own
`--input-padding` (42px÷3) + `cr-nums`/md font-size. No code, no SQL, no
environment; SA edits to SA-owned files only. @Porter: **REQ-006 is `SPEC_DONE` —
ready for your acceptance check.** @Fern: TASK-023 is closed; nothing new is yours
on REQ-006. @Jason: nothing new is yours (TASK-014 Phase B still waits on the
human's run output via Porter).
**Previous (2026-08-24, SA unit): TASK-022 reviewed → `DONE` at `859148a`. REQ-006
Req 1 (load-button alignment) is built and SA-verified; TASK-023 (Req 3,
date-format) is now the STARTABLE top of Fern's queue.** Corroborated read-only
against the real repo `code-report-front`: clean tree at `859148a` (parent
`d44f523`), `git diff d44f523..859148a` = **only** `NewReportFields.tsx`, **exactly
two lines** — `sm:items-end` appended to the branch-row (L225) and committer-row
(L343) `<Group>`s. Layout-only (REQ-006 Req 2) is proved BY the diff: only a
className string literal moved, so no string/control/value/gating/invalidation/
load change is possible. Grep confirms only the two `align="flex-end" …
items-stretch sm:flex-row` rows were touched; the other three `<Group>`s on the
screen are different layouts and correctly left alone. Mechanism sound
(same-layer Tailwind, `sm:items-end` in a later `@media` block wins at sm+ →
flex-end on the control line; mobile `items-stretch` stack intact). **Build gate
deliberately NOT re-run** — a className-only diff is inert to `typecheck`/`build`
and re-running risks colliding with the known live dev server (PID 7380, Q-FE-27);
the diff + cascade reasoning are the strongest evidence for this class of change,
both verified. No question was open on the TASK; none raised. **REQ-006 stays
`IN_SPEC`** — not `SPEC_DONE` until TASK-023 lands and is reviewed. No code, no
SQL, no environment; SA edits to SA-owned files only. @Fern: TASK-023 is yours,
STARTABLE now. @Jason: nothing new is yours (TASK-014 Phase B still waits on the
human's run output via Porter).
**Previous (2026-08-24, SA unit): REQ-006 picked up → IN_SPEC; SPEC-005 written;
TASK-022 (Req 1, layout) + TASK-023 (Req 3, date-format) created, both TODO for
Fern.** Read-only against the real repo `code-report-front` `d44f523` (clean
tree); no code, no SQL, no environment. **Req 1** (the item he named, Q36) is a
layout-only fix: both load buttons and their dropdowns are already identical
markup — a Mantine `Group align="flex-end"` whose un-prefixed Tailwind
`items-stretch` (hypothesis, Fern to measure) overrides the align so the
label-less button stretches past `--control-h` and rides high. **Req 3** (Q38 =
"ทำให้หมดอ่ะ" → GO): the native `<TextInput type="date">` shows OS-locale
`24/08/2026` while the summary uses `formatIsoDate` → `24/Aug/26`; a native date
input's display is **not** page-reformattable, so the fix is a no-dependency
custom render bringing the inputs to `DD/MMM/YY` with the wire staying
`YYYY-MM-DD`. **Design ruled, not guessed:** REQ-004 Req 7d licences it (7d names
`DD/MMM/YY`; usability reason to be written in the TASK), summary card unchanged,
no new string, no new dependency; mechanism left to Fern (TASK-018 §5 precedent),
with a `## Questions` line owed to me if the outcome needs a new string/dep.
**No question to the human — nothing about REQ-006 was ambiguous once read
against the repo and the answered Q36/Q38.** @Fern: TASK-022 is STARTABLE now;
TASK-023 after it (same file). @Jason: nothing new is yours.
**Previous (2026-08-24, FE unit): TASK-021 executed → `REVIEW`. The bun toolchain is
proven on `code-report-front` (REQ-005 AC 1 evidence).** Ran against HEAD
`d44f523` (the migration commit), clean tree, `bun 1.3.13`: `bun install` = "no
changes" with **zero `bun.lock` churn**; `bun run typecheck` exit 0; `bun run build`
green, printing the **same four routes** (`/`, `/login`, `/reports/[jobId]`,
`/reports/new`); `bun run dev` compiled and reached `✓ Ready in 478ms` under bun,
and `/login` renders **HTTP 200** (KnowCode shell, `lang="th"`). No `package.json`,
dependency, or source file touched; tree still clean at `d44f523`; no secret
pasted. **One NON-BLOCKING Q-FE-27:** a pre-existing Next dev server (PID 7380)
already held this project dir, so my bun instance self-exited after Ready (Next 16
= one dev server per dir) and the `/login` check was made against that live server
rather than an isolated bun-only boot; I did **not** kill PID 7380 (not mine).
Evidence bun boots = the Ready line + green build. **@Sober: TASK-021 is ready for
review.** Nothing else touched — TASK-015/020 unchanged, no SQL, no environment.
**Previous (2026-08-24, SA unit): REQ-005 picked up → IN_SPEC, SPEC-004 ACTIVE, and
its self-contained wording alignment executed.** Grounded in the real repo:
`code-report-front` HEAD `d44f523`, clean tree, `package.json` scripts
runner-agnostic (`next dev/build/start`, `tsc --noEmit`), repo docs carry no npm
— so **there is no frontend code work in REQ-005**. Ruled (recorded, not guessed):
DONE FE tasks + their SPECs are historical and left as written; only **open/future**
instructions are rewritten. Executed the npm→bun swap in `TASK-015`, `TASK-016`,
`TASK-020`, `TASK-009` (frontend line) and the **standing FE proxy rule** (now
`before bun run build`, history note kept). AC 4 (three screens unchanged) is met
**by construction** — the only commit since `f70fb02` is `d44f523`, a lockfile
swap with zero source diff. The one thing needing a live run is **TASK-021** (FE):
prove `bun run typecheck`/`build`/`dev` succeed — AC 1 evidence, no code change
allowed. **@Fern: TASK-021 is yours, STARTABLE now.** No SQL, no environment, no
code; SA edits to SA-owned files only. **No question to the human — nothing about
REQ-005 was ambiguous once read against the repo. REQ-006 NOT started (second
unit); it remains my queue top.** @Jason: nothing new is yours.
**Previous (2026-08-24, PM unit): the human's two pending answers (Q38, Q39) are
recorded and routed; no work started, only requirements clarified.** **Q38 =
"ทำให้หมดอ่ะ" → REQ-006 Req 3 (date-format) is now GO**, hold lifted, both
requirements active — *how* the OS-locale input matches `DD/MMM/YY`, and whether
Req 7d covers it (Q-SA-10), stays @Sober's design call, not mine. **Q39 = "แค่
เอกสารที่ฉันต้องอ่าน หรือ UI หรือ อะไรก็ตามที่ฉันต้องอ่าน"** → the language line is
drawn by the **reader**: "ไทยหลัก อังกฤษรอง" covers everything **he** reads (UI,
docs/output for him), and **team-internal artifacts stay English** (REQ/SPEC/TASK,
board, log — PROTOCOL intact). **The one thing I refused to assume → Q40:** he
named "UI", but Q37 (same day) says he edits Thai copy himself and Q14 keeps the
copy bundle closed, so whether the team rewords *existing* UI strings is unasked —
**forward-only meanwhile, no UI-language TASK, no existing string touched.** Both
Q38 and Q39 answered; **Q40 is new and NON-BLOCKING.** No `specs/`/`tasks/`/code,
no TASK status moved, no SQL, no engineer addressed. **REQ-005 + REQ-006 remain
@Sober's queue top** (REQ-006 now fully specified, both requirements live).
@Fern: nothing new is yours; the TASK-014 runbook relay is a separate PM unit,
not this one.
**Previous (2026-08-24, SA unit): the Thai pass is ACCEPTED — TASK-014 Phase A is
DONE and the runbook is OUT to @Porter.** The form was verified against his own
collection rather than against the rule: `GET Info.bru` heads a block
`# ผลลัพธ์ที่คาดว่าจะได้ (200 OK)` and Jason's reads `## ผลลัพธ์ที่คาดว่าจะได้
(200 OK)` — the same heading, character for character. **"Nothing else opened"
was proved by diff, not read:** the working copy against `4166722` still deletes
exactly 25 lines in the same six regions recorded at the last review (status
header, §"What to do", Step 1, Step 5, the Step 6 table, Q-BE-14) and **no new
deletion region appeared** — so the `curl` Steps 2–4 are byte-identical for the
second time by measurement, and DoD row 9 holds. **Every fact the Thai now
carries was re-derived from the code at `d1f0993`, not from the English it
replaced:** 12 hours (`SESSION_TTL_SECONDS = 12 * 60 * 60`), `SameSite=Lax`,
`QUEUED → RUNNING → DONE` plus exactly two non-`DONE` endings (`JOB_STATUSES` is
those five), `Asia/Bangkok`, and 404 ⇒ `REPO_AUTH_FAILED` **with its reason
intact** — the part that stops him filing it as a bug. Twenty-one headings, none
still English but the `Step N` label. **Q-BE-24 answered: `Step N` stays** — the
runbook's own headings outside the collection read `Step 2`…`Step 5` in English,
the blocks point at two of them, so the label is a name of a thing, which is the
carve-out in the form. **One observation was deliberately NOT turned into an
eleventh edit:** the `curl` form has him `rm` the cookie jar but the Bruno form
never tells him to clear the real password out of `POST Login.bru` — pre-existing,
accepted twice, file never leaves his machine, so it rides with the hand-over as
a spoken line for Porter instead of re-opening a sheet he is about to paste.
**@Porter: the sheet is final** — §Implementation Notes, "#### Runbook for the
stakeholder" to "#### End of runbook"; one file comes back into `../project-docs/`
per Step 5; two things to say to him in Thai are named in the §Review.
**@Jason: nothing on TASK-014 is yours until that file lands** — you do not poll
for it. No code, no SQL, no server, no environment: read-only at `d1f0993`, clean
tree. **REQ-005 + REQ-006 are still untouched and are now my only queue top.**
@Fern: nothing new is yours.
**Previous (2026-08-24, BE unit): the Q-SA-21 Thai pass is IN and TASK-014 is back at
`REVIEW` — language only, six blocks, nothing else opened.** Sober's form applied
line by line off his own eight `.bru` files: Thai prose for what the step is for,
what to expect, what a failure means and what to do next; English left on every
*name of a thing* — endpoint paths, `202`/`401`/`AUTH_REQUIRED`/`NO_COMMITS`/
`REPO_AUTH_FAILED`, field names, env vars, source-file citations, filenames,
Bruno's own UI strings and the request names. **Every fenced block inside the six
`docs` blocks is byte-identical** — the six JSON samples were not retyped — and
`meta`, `get`/`post`, `body:json`, `bruno.json`, `environments\local.bru`, the
`curl` fallback and Steps 1/5/6 were never opened. The pass added no sentence and
dropped none. **One decision is on the record rather than assumed — Q-BE-24,
NON-BLOCKING:** `Step N` stayed English inside the headings because those blocks
point him at `Step 5` and `Step 1`, which are English headings *outside* the
collection and outside what Q-SA-21 covers; translating only inside would leave
him matching "ขั้นตอนที่ 5" against a heading that says `Step 5`. Mechanical to
reverse on Sober's word, but not without also ruling those two references, which
sit in text Jason was told not to open. **@Sober: TASK-014 is yours** — the
hand-over to Porter rides with your verdict, one relay, as you set it up. No
code, no server, no `DATABASE_URL`, no SQL, no DB, no login, Bruno never
launched, no file created on disk; `git status --porcelain` empty at `d1f0993`.
Phase B unchanged and still not startable. **Nothing here touches REQ-005 or
REQ-006 — still Sober's queue top. @Fern: nothing new is yours.**
**Previous (2026-08-24, SA unit): TASK-014 Phase A is REVIEWED and its content is
ACCEPTED — all ten DoD rows pass at `d1f0993`.** D1's absolute path lands in the
folder the team actually reads; D2's `2>&1 | tee` creates the file both `grep`s
need and its `console.error` reason is right in `src/index.ts`; D3's eight blocks
match the shape of his own Bruno collection file for file. **DoD row 9 was
verified objectively rather than read:** the workspace repo tracks this TASK, so
I diffed the working copy against `4166722` and every deleted line falls outside
the `curl` Steps 2–4 — that text is byte-identical to what I verified on
2026-08-21. Bruno's session carry is a quoted mechanism plus a one-request proof
plus a labelled fallback, which is the correct shape for a third-party fact.
**Q-BE-21 answered: keep the `d1f0993` anchor** (I re-derived the whole delta —
`validate.ts` is a verbatim move, `clone.ts` only exports, `/api/health` still
sits before all four `requireSession` lines). **Q-BE-22: the
`NODE_ENV=production` caution stays** — same class of defect as D1/D2, a login
that looks fine and `AUTH_REQUIRED` two steps later. **Q-BE-23: no `tests` blocks**
— `NO_COMMITS` and `FAILED` are legitimate outcomes here and a red test on a
correct run misinforms. **One bounded unit is left and it is NOT Jason's defect:
Q-SA-21 came back "ไทยหลัก อังกฤษรอง" after he had complied with my English
ruling, so the six `docs` blocks get a Thai pass** — Thai prose, English kept for
every name of a thing, nothing inside a fenced block translated, the `curl`
fallback and Steps 1/5/6 untouched; the form is ruled from **his own eight
`.bru` files**, not guessed. The Thai is authored **in the TASK** because the
text reaches him verbatim and a hand-over translation would create a second
source of truth — the failure I froze the `curl` block to avoid. **The
hand-over to @Porter goes out WITH that pass, not before it.** Phase B unchanged:
not startable, no evidence file. **REQ-005 + REQ-006 remain my queue top and are
untouched today** — one unit, and this was it. No code, no SQL, no environment,
no human contact.
**Previous (2026-08-24, PM unit): the human answered FIVE questions and one of them
was the project's only blocker — Q34 is CLOSED and the FE lane is OPEN.**
He committed the bun lockfile swap himself (`d44f523`, re-verified: clean tree),
so REQ-005 Req 2 is satisfied and what remains there is **Req 3 + new Req 5**
(npm dropped permanently — our own `npm ...` wording is the only work left, and
it is @Sober's to rewrite). **REQ-006 changed shape:** the mismatch he
photographed is **layout** — the two load buttons do not line up with their
dropdowns — now Req 1 with measurements read off his image; the date-format item
is demoted to **Req 3 and HELD pending Q38** (he said it is *not* what he saw,
and Q-SA-10 makes it a real change on a frozen screen). Q37 closed with no work:
`Branch` stays, English inside Thai is not a fault here, and he edits Thai copy
himself. **@Sober: Q-SA-21 came back "ไทยหลัก อังกฤษรอง" — your English ruling is
reversed for the Bruno `docs` blocks and the re-ruling is yours; I read it
narrowly (those blocks only) and asked Q39 about anything wider.** Two new
NON-BLOCKING questions up (Q38, Q39); nothing waits on either. Porter wrote no
`specs/`, no `tasks/`, no code, moved no TASK status, ran no SQL, addressed no
engineer.
**Previous (2026-08-24, BE unit): TASK-014 Phase A is REWORKED and back at `REVIEW` —
@Sober, D1 + D2 + D3 are all fixed on the one trip you asked for.** D1: the
evidence file's destination is now the **absolute**
`…\ai-agent-workspace\code-report\project-docs\` in both Windows and Git-Bash
form. D2: Step 1 starts the server through `2>&1 | tee server-output.txt` (the
`2>&1` because `app.onError` uses `console.error`), and the pipe's block-buffering
is **stated in the sheet** rather than left to surprise him — he judges progress
from the polled `GET`, not from the window, and the file is complete after
`Ctrl-C`. D3: Steps 2–4 exist as an eight-file Bruno collection **authored as
fenced blocks in the TASK**, every `.bru` carrying a `docs { … }` block in
English; the folder he creates is absolute and **outside both repos**; Steps 1, 5
and 6 stayed shell/prose; the `curl` text was **not moved and not re-typed** —
a heading above it, an end-marker below it, nothing else. **The one thing you did
not rule, I established rather than assumed: Bruno's cookie jar is real and both
its preferences default to on** — quoted from the Bruno application installed on
his own machine (`saveCookies` → `addCookieToJar`; `getCookieStringForUrl(request.url)`
gated on `shouldSendCookies()`; `request.storeCookies` / `request.sendCookies`
defaulted `true`, the two "…automatically" checkboxes). **Bruno is therefore
primary and `curl` is the labelled fallback**, and because a *setting* is still
his, the sheet has him check the two boxes and proves it with a one-second
`GET /api/auth/me` before anything expensive runs. Three questions, **all
NON-BLOCKING**: Q-BE-21 (the anchor moved `4101551` → `d1f0993`; I diffed it and
**no quoted fact changed** — validate.ts is a verbatim move, clone.ts only
exports a helper, `/api/health` is still ahead of every session gate),
Q-BE-22 (`NODE_ENV=production` marks the cookie `Secure` and would kill the
session over plain http in **both** forms — one caution line added), Q-BE-23 (no
`tests { … }` blocks, because Run A may legitimately end `NO_COMMITS` and Run B
is *meant* to be `FAILED`). Your "three, not four" correction to Q-BE-14 is made.
**No code written, no server started, no SQL, no database, no login, Bruno never
launched; `git status --porcelain` empty at `d1f0993`.** @Fern: nothing of mine
touches your lane.
**Previous (2026-08-24, SA unit): Q-SA-18 + Q33 are TRANSCRIBED and RULED into
TASK-014 — @Jason, your return trip now carries THREE defects, not two, and it is
still ONE trip.** The ruling is a **split, not a replacement**: Bruno takes Steps
2, 3 and 4 (the requests); Steps 1, 5 and 6 stay shell/prose, because a request
runner starts no server, greps no log file and writes no evidence file, and
"Bruno instead of the sheet" would drop exactly the half that produces the
evidence. **The `curl` block for Steps 2–4 survives verbatim as a labelled
fallback** — it is already re-verified against `4101551` and discarding verified
work for tidiness buys nothing; it is frozen text, changed for D1/D2 only.
**The collection is authored as fenced blocks inside the TASK file, not created
on disk** (Phase A's DoD demands a clean tree and no production-code change;
`project-docs/` is the human's drop folder, not ours to author into), and the
sheet names the **absolute** folder he pastes them into — D1's lesson applied
before it bites twice. **Q33's consequence is a DoD row: every `.bru` carries a
`docs { … }` block**, which is where the prose now surrounding the `curl` lines
goes, so the re-format loses nothing; ruled explicitly **not** a copy question
(Q14 governs the product's strings, and a runbook is not the product).
`baseUrl` = `http://localhost:8080` from the verified `PORT` default, in an
environment file, mirroring his own `local.bru`. **One thing I deliberately did
NOT rule: whether Bruno carries `cr_session` from Step 2 into Steps 3/4 by
itself** — third-party behaviour, PROTOCOL forbids assuming it, and the run dies
at Step 3 if it is wrong; @Jason establishes it and quotes his source, or says he
cannot and leaves `curl` primary. That outcome is an accepted result of the
rework, not a failure of it. **@Porter: one NON-BLOCKING question goes up —
Q-SA-21**, English or Thai for the `docs` blocks; I ruled English and Phase A
proceeds either way, but a `.bru` file reaches him *verbatim* with no relay step,
and his own eight document themselves in Thai. **@Fern: nothing new is yours** —
TASK-020 and TASK-015 are unchanged, and the Q34 clean-tree gate is untouched by
this session. **REQ-005 and REQ-006 were deliberately NOT picked up here** and
are the new top of my queue: the FE lane they both land in is the lane Q34 has
stopped, so writing FE TASKs today would produce work that cannot tick its own
DoD. No code written, no SQL, no environment touched, no artifact of another role
edited.
**Previous (2026-08-24, PM unit): TWO new stakeholder inputs are on file — `REQ-005`
(frontend moves to **bun**) and `REQ-006` (the mismatch on his screenshot), both
`READY_FOR_SA`. @Sober: both are yours to pick up; ordering between them and
your existing queue is your call.** REQ-005 is the one with a hard edge:
Porter verified on disk that `code-report-front` is **half-migrated and dirty**
(`bun.lock` untracked, `package-lock.json` deleted, neither committed at
`f70fb02`), so **the FE clean-tree DoD gate cannot be ticked today** — that is
**Q34** with the human and it is the one blocking question. REQ-006 carries one
objective item read off his own image (period `24/08/2026` in the fields vs
`24/Aug/26` in the summary card); Q36/Q37 are non-blocking, and **Q37 is a
reword, so nobody on the team may decide it**. Porter moved no TASK status, wrote
nothing in `specs/`, `tasks/` or code, ran no SQL, and addressed no engineer.
**Previous (2026-08-21, SA unit): TASK-018 is reviewed → `DONE` at `f70fb02`. SPEC-003
is three-quarters built and @Fern owns the last TASK — TASK-020 is STARTABLE.**
Every gate re-run by Sober (typecheck 0, build green with the same four routes,
**0 colour utilities** + the same nine known `--font-*` false positives with **no
touched file among them**, clean tree, the declared 12-file `+773/−183`) plus
three checks the DoD did not ask for: the **frozen/untouched diff prints nothing**
over `hooks/reports`, `context/session`, `globals.css`, `package.json`,
`package-lock.json`, `report.service.ts`, `types/api/main/report.ts` and `app/`
— so freeze item 5's polling is byte-identical, `SessionProvider` was not opened
and "no new dependency" is proof; the **six dictionary deletions are safe by
construction** (`MessageKey` is derived from `th` and `en` is
`Record<MessageKey, string>`, so a surviving reader or a one-sided key is a *type
error* — typecheck 0 proves both dictionaries still match key-for-key); and the
**client contract was re-derived from TASK-017's real code, not from her fake
server** — both response shapes match `types/api/main/repos.ts` exactly, and the
≤366 bound is the *same number and the same comparison* on both sides
(`span > 366` client, `(to−from)/MS_PER_DAY > 366` server), so 366-accepted /
367-rejected is agreement rather than coincidence. Read structurally: the gate is
one expression that reaches every control, `disabled` on submit **and** an early
`return` in `handleSubmit`, so the **Enter key cannot pass it either**; the branch
`Select` is `searchable={false}`, so "nowhere to type a branch" is a property of
the control; `invalidateBranches()` fires on all three of URL, private toggle and
token and itself invalidates the committers. **Q-SA-20 accepted and her mechanism
beats the one I would have named** — `RunRetryParams = Omit<RetryParams,
"extraContext">` makes "the report page must not write that key" a compile error.
**All four questions ruled, none escalated: Q-FE-23 → my own instruction conflict,
item 3 is SUPERSEDED by §5, keep the code where it is; Q-FE-24 → keep the
deferred committer** (auto-loading is a clone nobody asked for, a synthetic option
would put an `author` on the wire that matches nobody) **→ carried into TASK-020**;
**Q-FE-25 → nothing is wrong**: the hint describes how commits are *counted*, and
that really is `REPORT_TIMEZONE` = `Asia/Bangkok` (`config.ts:81`,
`commits.ts:103`), while §2's "today" is only the pre-filled *default* — they
diverge only on a browser outside Asia/Bangkok, and only in a default;
**Q-FE-26 → keep `back: 0/6/29`**, presets are inclusive of today. **Two named
gaps, both mine and both accepted rather than reworked, both carried into
TASK-020:** the committer's deferred restore, and the **second round trip**
(form → report → Back → Forward → Back) losing the extra-context box, which is the
price of take-and-remove (Q-FE-21) plus the API's missing field (Q-SA-20).
**Fern's port-8080 disclosure is CLOSED with no action** — one unauthenticated
request, rejected, nothing written, nothing to undo. **@Jason: nothing new is
yours** — TASK-014 Phase A's D1/D2 rework is still your next unit. **@Porter:
nothing needs you; no question goes up.**
**Previous (2026-08-21, FE unit): TASK-018 was BUILT and `REVIEW` at `f70fb02`.** `+773/−183` over 12 files
(2 new: `types/api/main/repos.ts`, `services/repo.service.ts`). **Every DoD row
measured on a production build** against a throwaway fake backend that lived
outside the repo and **is stopped and deleted** (both ports free). The gate is
real: with no branch list, the period, committer, extra context, language and
submit are all `disabled`, a failed load shows the **server's own message** and
leaves nothing to type a branch into, and `branches: []` locks with its own
line. Presets, `366 accepted / 367 rejected`, `YYYY-MM-DD` on the wire, no
`author` key on "everyone", `author` = the e-mail when there is one, date-change
invalidation, and **no mode switch anywhere in either language** — all measured,
evidence in TASK-018 §Implementation Notes. **Q-SA-20's mechanism, which is the
part that could quietly fail:** the writer is split in two —
`writeRetryParams` (form side, seven keys) and `writeRunRetryParams` (report
side, six keys, read-merge-write) — and `RunRetryParams = Omit<RetryParams,
"extraContext">` makes "the report page must not write that key" a **type
error**. Proved by sentinel: all six job-sourced keys were overwritten from
`job.params` while `extraContext` survived. `RetryParams` gained **exactly one**
key and no `pat`; storage after a private run holds only `cr.retryParams` with
no token, and the token appears in **three request bodies** and nowhere else.
Dictionary: **+12 ×2, −6 ×2, nothing reworded** (the two typing hints were
removed, not replaced). **Four questions, ALL NON-BLOCKING and all for Sober:**
**Q-FE-23** — carried-in item 3 says "change no code in `retryParams.ts`" but §5
requires exactly that, so I followed the later, more specific §5 and am naming
the conflict; **Q-FE-24** — Back leaves the *committer* on "everyone" until that
list is loaded (the literal instruction, but Req 4a says "filled");
**Q-FE-25** — `reports.new.date.hint` says Asia/Bangkok while §2 defines "today"
as the browser's local day, and I changed neither (approved copy vs your §2);
**Q-FE-26** — "last 7 days" is built inclusive of today. **One disclosure:**
something not mine is listening on `localhost:8080`; before I noticed, my server's
first start sent it **one** unauthenticated request, which it rejected. I moved
to 8099 and never connected to any database or ran any SQL. **@Sober: TASK-018 is
ready for review; TASK-020 stays blocked on it and TASK-015 is still mine.**
**Previous (2026-08-21, SA unit): Q-SA-19 + Q-SA-20 are TRANSCRIBED — and Q-SA-20
turned out NOT to be the two-line change I costed.** Both answers are now in
SPEC-003 §Questions with their consequences, and Q-SA-20's work is written into
**TASK-018 §5** (plus one DoD row and a `RetryParams` diff row). **@Fern: read
TASK-018 §5 before you start — the shape changed, not just the scope.**
**Measured in the real code rather than assumed:** `GET /api/reports/:jobId`
returns `params` with **exactly six keys** and `extraContext` is not one of them
(`jobResponse`, `src/reports/jobs.ts`), so **the report-page writer cannot source
that value at all** — and because it rewrites the *whole* payload from
`job.params`, a naive "add it to the form-side writer" ships a value the next
poll silently wipes. **Ruling: `RetryParams` gains one key, only the form-side
writer populates it, the report-side writer must not destroy it (mechanism is
Fern's), and adding the field to the API is explicitly NOT the answer** — that is
a SPEC-001 contract change Q-SA-20 does not authorise. **Q-SA-19 = "ok" recorded
as approving the 12 TASK-018 strings + `reports.view.back` AS AUTHORED**: they
are an `[x]` at review, changing one is now a question, and the two *false* hints
are still NOT covered (replacing approved text is a reword, freeze item 10).
**Freeze item 4 gains a fourth clause** (extra context's *value on back* only —
its bound, wire key, optionality and label stay frozen). **One stale fact
corrected while in the file:** SPEC-003's freeze section still asserted "Q32 is
open"; it is answered, so 7c → 7d — **but the widening itself is deliberately NOT
done here**, because deciding how far the freeze opens is a design unit about
TASK-020's ceiling, not a transcription. Until it is written, TASK-018's
boundaries stand and TASK-020 has no new licence in its file. **@Jason: nothing
new is yours** — TASK-014 Phase A's D1/D2 rework is still your next unit.
**@Porter: nothing needs you; no question goes up.**
**Previous (2026-08-21, SA unit): TASK-019 is reviewed → `DONE` at `32e8eed`, and
TASK-018 is now STARTABLE — @Fern, it is yours.** Every gate re-run by Sober
(typecheck 0, build green with the same four routes, **0 colour utilities** and
the same nine known `--font-*` false positives, none in a touched file, clean
tree, `+83/−14` over three files) plus three checks the DoD did not ask for:
**all 14 deleted lines opened** and each accounted for as moved-not-removed; the
nine-path "untouched" diff prints **nothing** (so freeze item 5's polling and
`retryParams.ts` itself are byte-identical); and `dictionaries.ts` is `+2/−0`, so
freeze item 10 could not have been touched — the pair shipped is the one Q-SA-19
approved as authored. **Verified structurally rather than trusting her harness:**
`ReportViewContent` has **no early return**, so the back control is above the
`job ? … : null` branch and present even with no job — stronger than the five
states the DoD names; and the handoff cannot carry the token by construction
(`RetryParams` has no `pat`, one writer builds from a wiped `body`, the other
from `job.params`). **All three questions ruled, none escalated: Q-FE-20 → KEEP
the second writer** (my preferred shape was falsified by measurement, and it
cannot write what the page does not yet have), **Q-FE-21 → the handoff may live
until the next form mount consumes it; do NOT touch `SessionProvider`** (bounded:
if the payload ever gains a non-user-input field the lifetime becomes a question
again), **Q-FE-22 → noted, carried into TASK-020 as a one-line tidy.**
**One finding, and it is MY DoD's gap rather than her defect: `extraContext` does
not come back** — the handoff carries six values and the free-text box is not one
of them, while Q29 said "มีค่าเดิม". Not resolved by assumption → **Q-SA-20 to
Porter, NON-BLOCKING** (SPEC-003 §Questions); a "yes" is one key plus two lines
and lands in TASK-018. **Also recorded: commit `42b396e` (`.gitignore` += `.agent/`)
is named by no TASK** — harmless, nothing to undo, but @Fern should mention such
commits in the TASK. **@Jason: nothing new is yours** — TASK-014 Phase A's D1/D2
rework is still your next unit.
**Previous (2026-08-21, FE unit): TASK-019 is BUILT and `REVIEW` at `32e8eed` — the
ball is @Sober's.** `replace`→`push`, an explicit back control in all five
states, and both ways back land on a filled form. Three files, `+83/−14`;
`reports.view.back` added to both dictionaries and **no existing string
touched**. Measured on a production build against a throwaway fake (deleted,
ports dead, `.env.production.local` deleted and the manifest rebuilt back to
8080): **15/15**, `before` vs `afterBack` compared as measured states.
**One departure from the preferred shape, falsified rather than argued:** the
report page writes the handoff when it has the job (Sober's shape) **and** the
form writes it once before navigating — because between `push` and the first
poll the page has no `params`, and at `a3a848f` (no form-side write, `GET`
delayed 4 s) browser Back produced a **completely empty form**. With it, 4/4.
**Freeze item 6 re-measured on a private run:** token in exactly one request
body, absent from storage and URL, back returns with the PAT field not mounted.
**Q-FE-20** (keep the second writer?), **Q-FE-21** (how long may the handoff
live — a form reached later by a non-back route also opens prefilled; not
cleared on logout because that is frozen `SessionProvider`) and **Q-FE-22**
(noted only) are **all NON-BLOCKING**. **TASK-018 needs this review plus
TASK-017 (`DONE`) before it is startable; TASK-015 is still Fern's and untouched.**
**Previous (2026-08-21, SA unit): TASK-017 is reviewed → `DONE` at `d1f0993`, and
`POST /api/repos/*` is now built, gated and proved.** Every gate re-run by Sober
(typecheck 0, `bun test` 230/0, clean tree, the 10-file `+1268/−24` stat) plus two
checks the DoD did not ask for: the `test/` diff is **721 insertions and zero
deleted lines**, so "31 added, none removed" is proof rather than arithmetic, and
the six-file "untouched" diff prints **nothing**. Behaviour re-measured outside
Jason's suite (PAT only in `http.extraHeader`, `parseLsRemote` edge cases, the
four failure mappings, 366 accepted / 367 rejected through the *same* function,
`groupCommitters` order). **All four questions ruled, none escalated: Q-BE-17 and
Q-BE-18 keep what he shipped** (reuse beats tidiness; the duplicate holds no
bound) and both become **one parked tidy-up**; **Q-BE-19 → `email` is always a
string, `""` when the commit has none** — a wire shape, so Sober's call, not the
human's, and it is written into **SPEC-003 §API + TASK-018** so Fern reads it
where she works. **One finding, and it is Sober's own SPEC gap, not a defect:**
the committers clone runs with **no concurrency bound** while the worker's runs
behind `MAX_CONCURRENT_JOBS` — parked as a SPEC-003 decision (queue item 14),
blocks nobody. **@Fern: TASK-019 is now the only thing between TASK-018 and
startable.** **@Jason: nothing new is yours** — TASK-014 Phase A's D1/D2 rework
is still your next unit.
**Previous (2026-08-21, PM unit): the four outstanding answers came back and are
TRANSCRIBED — this project has ZERO questions open with the human.** **Q32 =
"ใช่หากมันดีขึ้นต่อการใช้งานก็จัดการเลย"** → REQ-004 Req **7c released → 7d**:
REQ-001-named behaviour (366-day cap, `DD/MMM/YY`, th/en, PAT rules,
`NO_COMMITS`, polling) is the team's to change **when the change improves
usability**, with that reason written in the TASK — **@Sober, TASK-020's ceiling
has moved and how much of SPEC-002's freeze that releases is yours to write.**
**Q-SA-19 = "ok"** → the 13 th/en strings approved **as authored**; answer is in
**REQ-004 §Questions** for @Sober to transcribe into SPEC-003. **Q33 = the docs
live INSIDE the `.bru` files** (verified: all 8 carry a Thai `docs { … }` block)
→ joins Q-SA-18 in the TASK-014 transcription; curl-vs-Bruno is still Sober's
call. **Q24 is CLOSED by Porter, not re-asked**: he has now twice said he does
not understand it, so Porter withdrew his own question and the existing
reversible arrangement stands — it commits nothing today and grants no database.
**Two limits Porter refused to smooth over: Req 7e** — Q32's wording never named
the **sanitizer**, and the **PAT rules** are safety rather than usability, so 7d
is not read as authorising either (blocks nobody; one question if a TASK ever
wants one) — and Q-SA-19 is recorded as approving **only** the strings that exist
today, not the Q14 bundle re-opening. Porter moved no TASK status, wrote nothing
in `specs/`/`tasks/`/code, ran no SQL and addressed no engineer.
**Previous (2026-08-21, BE unit): TASK-017 is BUILT and `REVIEW` at `d1f0993` — the
ball is @Sober's.** Both endpoints exist behind the session gate, mounted before
the routes. No new error code, string, config key, table or migration, and
`POST /api/reports` is unchanged (proved by an empty `git diff --stat` over
`errors/messages.ts`, `config.ts`, `db/`, `reports/{routes,worker,jobs}.ts`).
Reused rather than re-derived, as instructed: `credentialSecrets` (now exported
from `clone.ts`), `classifyCloneFailure`, `parseRepoUrl`/`assertSafeRepoUrl`,
`withClone`+`jobTempDir`, `readCommits`, and the report's date rules — the date
block was **moved verbatim** out of `validateCreateReport` as
`applyDateWindowRules` (the three named re-exports are `applyDateWindowRules`,
`optionalText`, `requiredText`). **TASK-018 still needs TASK-019 as well, and
neither is DONE.** Three questions for Sober, all NON-BLOCKING: **Q-BE-17**
(importing `classifyRunFailure` from `reports/worker.ts`), **Q-BE-18** (a
`renderIssues` duplicated because the DoD forbids touching `reports/routes.ts`),
**Q-BE-19** (`email: ""` for a commit with no author e-mail — TASK-018 branches
on that value, so it is asked, not decided). Q-BE-20 is a noted fact, no answer
owed. **TASK-014 Phase A's D1/D2 rework is still open and is Jason's next unit**
unless Sober's Q-SA-18 transcription changes the sheet first.
**Previous (2026-08-21, latest SA unit): SPEC-003's four TASK files are WRITTEN, and
two of them are startable right now — @Jason TASK-017, @Fern TASK-019.** Order is
019 → 017 → 018 → 020 by dependency, but 017 and 019 touch nothing in common, so
both engineers have work at the same time. **TASK-018 is explicitly not startable
until 017 and 019 are `DONE`.** Three things were decided while writing, all
recorded in the files rather than left to be discovered: (1) **`push` alone does
not satisfy Requirement 4a** — the browser's Back button remounts the form empty,
so *both* ways back must land on a filled form, and the handoff must not depend on
which affordance was used (SPEC-003's back section annotated; mechanism left to
Fern); (2) **4a ∩ 1a**: a restored branch/author string is not evidence the branch
still exists, so it is applied as a *pending selection* after the list loads and
submit stays gated on a loaded list; (3) **the two false hints and the dead
`mode`/`date.day` keys** — deleting a key with no reader is not a reword, but
*replacing* hint text is, so it is a question, not a decision. **13 new user-facing
strings are authored across TASK-018/019 with their th/en pairs** for the one
Q-SA-19 yes/no round — nothing waits on it. No code written, no SQL, no
environment touched, no artifact of another role edited.
**Previous (2026-08-21, SA unit): REQ-004 `IN_SPEC`, `SPEC-003` written + `ACTIVE`.**
Two **read-only** endpoints (`/api/repos/branches` = `git ls-remote --symref
--heads`, no clone; `/api/repos/committers` = metadata-only clone, range-scoped,
on demand), **no new table, error code or config key and no `POST /api/reports`
contract change**. Requirement 4 traced to `NewReportContent.tsx:169`
(`router.replace`). SPEC-002 freeze released narrowly: item 4 (three clauses) +
item 1 (`replace`→`push`); **everything Q31 puts "in reach" stays frozen** (Q32
open, Req 7c). Bookkeeping: the "freeze item 3" everyone cites is **item 4**.
**Q-SA-19 raised, NON-BLOCKING.**
**Previous (2026-08-21, PM unit): the last two open questions came back and are
TRANSCRIBED — nothing on this project waits on a human answer.** **Q31 =
"ทุกหน้า แก้พฤติกรรมได้ด้วย"** → REQ-004 Requirement 7a's narrow hold is RELEASED
and becomes **7b: every screen, behaviour as well as usability**. REQ-004 stays
`READY_FOR_SA`; Requirements 1–6 are untouched. **@Sober: the consequence is
yours to write** — SPEC-002's behaviour freeze now has to be released much wider
than freeze item 3 alone. **Q-SA-18 = Bruno**, with a verified path
(`C:\Users\Admin\Downloads\bruno\bruno` — an AI API CENTER collection, 8 `.bru` +
`bruno.json` + `environments\`); the answer is in **REQ-001 §Questions** for
@Sober to transcribe into TASK-014, and whether it is a re-format or a
replacement of Jason's `curl` sheet is his call. **Two residuals Porter refused to
close by assumption, both NON-BLOCKING: Q32** (does "แก้พฤติกรรมได้" reach
behaviour REQ-001 itself specified? — Req 7c holds the conservative line) and
**Q33** (which "docs" — that path contains none). Porter moved no TASK status,
wrote nothing in `specs/`/`tasks/`/code, ran no SQL and addressed no engineer.
**Previous (2026-08-21, latest SA unit): TASK-014 Phase A reviewed → `REWORK`, and
the evidence hand-over does NOT leave for Porter yet.** Every fact in Jason's
runbook was re-derived from the real code by Sober and held (config loader,
routes, cookie, validate bounds, both log-line shapes key-for-key, the three
no-secrets claims) — but **two lines make it unfollowable on the stakeholder's
machine**: **D1** Step 5 sends the evidence to `../project-docs/`, which from his
shell resolves to `C:\Users\Admin\develyst\code-report\project-docs` — **verified
not to exist** (the real folder is under `ai-agent-workspace\code-report\`), and
**D2** Step 5 greps `server-output.txt`, which Step 1 never creates. Both are
one-line fixes; nothing else in the sheet is to be touched. **All four questions
ANSWERED and none changes the sheet:** Q-BE-13 keep `REPO_AUTH_FAILED` (the TASK
text was Sober's error, corrected in §4; the unresolvable-host alternative is
refused as cosmetics over coverage), **Q-BE-14 ruled (b) — indirect proof, and
bounded**: a Postgres `UPDATE` fails whole, so `status: DONE` proves `finishDone`
and a returned `error_code` proves `finishFailed`, but **`finishNoCommits` stays
unproven**; (c) refused — no field goes on the wire for a tidier evidence line.
Q-BE-15 accepted, Phase B DoD amended to "every AI call, grouped by stage" plus a
**tier-stability-across-batches** verdict. Q-BE-16 noted; if Run A needs a PAT
that settles REQ-001 Q8 as a side effect. **New parked candidate: should
`finished_at` be readable through the API at all** (application writes it on
every terminal transition; no consumer can see it).
**Previous (2026-08-21, SA unit): Q-SA-16 is transcribed and TASK-014 is
re-scoped and `TODO` — Jason has work again for the first time since the split.**
Under "ค" the keyboard is the stakeholder's, so TASK-014 is now **Phase A** (Jason
authors the runbook the stakeholder executes — quoted from the real config
loader, routes and log lines; `curl` form) and **Phase B** (Jason reads the pasted
evidence). The DoD is split to match, and Phase A is ticked without any
environment. **Sober did not write the runbook himself** — it is engineer work out
of the real code, and writing it would have been implementation. **One new
NON-BLOCKING question, Q-SA-18** (curl or Bruno). **The evidence hand-over is now
recorded as gated on Phase A**: Porter's ask told him *what* to paste, nothing on
file tells him *how*, and `../project-docs/` is still empty of it.
**Previous (2026-08-21, PM unit): the whole outstanding answer set came back in
one round and is TRANSCRIBED — `REQ-004` is `READY_FOR_SA`.** Q25 = "ค" (committer
becomes a **loaded list**, field NOT removed → Req 6), Q26 = "ก" (team's own
judgement, his eyes are the test → Req 7), Q27 = "ไปต่อไม่ได้เลย" (no branch list,
no continuing → Req 1a), Q28 = today→today + the 366-day cap stays (Req 2a),
Q29 = "มีค่าเดิม" (back keeps his values → Req 4a). **Q30 = "โค้ดล่าสุด": he was on
the reworked build and can see it is Mantine — the redesign is NOT what he
rejected, so TASK-010/011/012/013 stand; but he did not say the screens are
acceptable either, so REQ-003 stays `IN_SPEC` and TASK-016 still produces that
verdict.** **Q-SA-17 = "ก" — he starts the backend too, so all three screens are
openable; TASK-016's cause of blocking is gone and only @Sober may move it.**
**Q24 was answered by delegation** ("คืออะไร เอาตามที่แนะนำ") — Porter explained it
back in Thai and recorded a reversible recommendation; the TASK-009 re-scope is
still Sober's. **Two things Porter refused to smooth over:** Q26's second half
(how far "และอีกหลายอย่าง" reaches) was never answered → **Q31**, non-blocking,
with REQ-004 Req 7a holding the scope to the two screens he named meanwhile; and
REQ-003 is recorded as *neither* accepted *nor* rejected rather than being read
as delivered. **@Sober: REQ-004 is yours now** — and SPEC-002's freeze item 3
still has to be released for it, which is yours to write, not Porter's.
**Previous (2026-08-21, PM): NEW stakeholder feedback on the running app
→ `REQ-004` written, `DRAFT`.** He wants the branch **loaded as a list** after the
git URL (reversing REQ-001 Req 4.6 / Q-SA-2), **one date-range control** with the
single-day mode removed (merging REQ-001 Req 4.1 + 4.2), an **easier** period
picker, and a **way back from the report page** — all now carried by the
`READY_FOR_SA` REQ above.
**Previous (2026-08-21, latest SA unit):** **the six-answer backlog is cleared and
REQ-003's two missing TASK lines exist.** Q-SA-12/13/14/15/**Q23** are
transcribed into SPEC-002 `## Questions` with their consequences, **freeze item 2
is partially released** (the *silent* redirect only — everything else stays
frozen), and two TASKs are written: **TASK-015** (show the session-expired line —
`TODO`, Fern's, startable now) and **TASK-016** (the localhost hand-over —
`BLOCKED`). **Q-SA-16 → TASK-014 is the one transcription NOT done here**: it
carries a second decision (what TASK-014 becomes for Jason once the evidence
lands) and is the next SA unit. **New question Q-SA-17 (human via Porter,
BLOCKS TASK-016 only):** Q23 settled `localhost` but not what runs behind it —
with the frontend alone he can open **one** of the three reworked screens, since
`/reports/*` need an authenticated session. Not guessed: option (ข) is real FE
work that shows fabricated data, and Q-SA-16's "เดี๋ยวรันเอง" was about two API
jobs, not about running a server to look at screens. **Ordering 015 → 016 is
deliberate** — 015 changes a screen he will open. REQ-003 stays `IN_SPEC`.
Older state, kept because it is still current:
**TASK-013 is `DONE` at `1f90b87` (reviewed 2026-08-21) — the whole
SPEC-002 redesign (010/011/012/013) is now built and SA-reviewed, and no TASK is
in anyone's court.** Every gate was re-run by Sober: typecheck 0, build green
with the same four routes, repo-wide Decision 3 gate a real **0 colour + 0 font**
with all nine font hits opened and confirmed as `--font-*` references, the
`cr-*` inventory reproducing at 29 = 29, and two checks the DoD did not ask for
— the **token block proved unchanged as values (38 = 38, none added or
changed)** and **freeze item 5's polling shown to be untouched code**
(`useReportJob.ts` is not among the commit's five files), so the tiers and stops
could not have regressed. Q-FE-19 was **ruled, not escalated**: derived,
language-invariant, `aria-hidden` numerals are design, not copy.
**Two consequences, both stated rather than smoothed over:** (1) **TASK-009's
pause is LIFTED but it is still not startable** — Q24 (who performs the eleven UI
runs) is now DUE with Porter, and the team hits the same real-environment wall
that produced Q-SA-16; (2) **REQ-003 is deliberately NOT `SPEC_DONE`** — every
SPEC-002 TASK is DONE, but **Q-SA-14** (session-expired line, approved NEW
behaviour) and the **Q-SA-15/Q23 acceptance-URL DoD line** still have no TASK,
and REQ-003's final criterion is that URL. **Both lines are now written
(TASK-015 / TASK-016) and five of the six transcriptions are done — see "Next"
above.**
The earlier TASK-012 review changed one thing beyond the verdict: **SPEC-002 Decision
3.4's `@mantine/dates` authorisation is withdrawn** — its stated premise ("rule 2
cannot otherwise be honoured") was Sober's and was false, and the package cannot
be installed without `dayjs`, which Q-SA-12 declined. The SPEC now authorises no
new dependency at all. **The TASK-009
split is DONE — and it did NOT unpark Jason, which is the finding of that
session:** TASK-014 exists, is BE-only and is free of the FE rework, but runs 12
and 13 are by definition a *real-database* run and **no database is authorised
for the team** (the stakeholder ran `migrate`/`seed:users` himself for exactly
that reason). **Q-SA-16 is now ANSWERED 2026-08-21 — "ค เดี๋ยวรันเอง": the
stakeholder runs TASK-014's two jobs himself and pastes the output into
`../project-docs/`; the team never connects and the `admin` password is not
needed. Nothing on this project is blocked on a human answer any more.**
**TASK-014's row still reads BLOCKED because only Sober may move a TASK status** —
its cause is gone, and what TASK-014 becomes for Jason (evidence review vs.
rewritten instructions) is Sober's call. **Of the six answers that waited on Sober, five are
transcribed 2026-08-21 (Q-SA-12/13/14/15/Q23 → SPEC-002); only **Q-SA-16** →
TASK-014 remains.** **Q23 = "localhost"**, so with Q-SA-15 the
stakeholder opens a **local** URL and captures himself — the DoD line is about
leaving something openable on his own machine, **not** pasting images and **not**
deploying. Porter carries **Q24** (whether he also runs TASK-009's eleven UI runs
himself) — **now DUE, since TASK-013 has landed**.
Q-SA-14 ("ขึ้นข้อความ") is still approved NEW behaviour needing a TASK line of
his. QA (Tanya) has a charter but no work.

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| ~~FE probe reached port 8080~~ CLOSED 2026-08-21 at the TASK-010 review | closed — Porter informed, no action | Nothing written, so nothing to undo; standing FE rule added (confirm the proxy target before a harness's first request). Detail: TASK-010 §Review |
| ~~Q-FE-10~~ ANSWERED 2026-08-21 — not TASK-010's, and not Sober's to decide | escalated as Q-SA-14 | Detail: TASK-010 §Questions |
| ~~Q-FE-11~~ ANSWERED 2026-08-21 "no barrels under `src/app/`" | closed — SPEC-002 Decision 2 reworded | Fern's reading upheld; no files to add. Detail: TASK-010 §Questions |
| ~~Q-SA-14~~ TRANSCRIBED + TASKED 2026-08-21 | closed — TASK-015 written (`TODO`, Fern) | Freeze item 2 partially released in SPEC-002; no new string. Detail: SPEC-002 §Questions + TASK-015 |
| ~~Q-SA-12~~ TRANSCRIBED 2026-08-21 | closed — no SPEC change; Decision 1 stands | Also the reason `dayjs`/`@mantine/dates` stay unauthorised. Detail: SPEC-002 §Questions |
| ~~Q-SA-13~~ TRANSCRIBED 2026-08-21 | closed — folded into the Q-SA-15/Q23 hand-over | He captures, we do not; no "paste screenshots" DoD line anywhere. Detail: SPEC-002 §Questions |
| ~~Q21~~ ANSWERED 2026-08-21 "เขียนเลย" — Porter wrote `QA.md` + PROTOCOL amendment | closed | Three self-imposed limits recorded (local-only, no retro-testing, FE row left alone). Detail: REQ-003 §Questions |
| ~~Q22~~ ANSWERED 2026-08-21 "เพิ่มเลย" — Porter added the FE row + chain pair | closed | Tables only (prose bullets + the one-line chain sentence still say BE — residual, NON-BLOCKING). Detail: REQ-003 §Questions |
| ~~Q-FE-12~~ ANSWERED 2026-08-21 "no toggle, and it does not go up" | closed — `TextInput type=password` stands | A reveal is behaviour SPEC-002 lacks; escalating it would invent scope. Cost if ever asked: SPEC line + th/en pair + human yes/no. Detail: TASK-011 §Questions |
| ~~Q-FE-13~~ ANSWERED 2026-08-21 — reading (b), and the DoD was Sober's to fix | closed — TASK-012 rescoped, TASK-013 owns repo-wide zero | Residual re-measured independently: 29 colour + 10 font, all in `partials/NewReport` + `partials/ReportView`. Detail: TASK-011 §Questions |
| ~~Q-FE-15~~ ANSWERED 2026-08-21 — derivation accepted, `cobalt` stands | closed — no separate mood question goes up | Folded into Q-SA-15's conversation as FYI; a theme change is ~20 token values. Detail: TASK-011 §Questions |
| ~~Q-SA-15~~ TRANSCRIBED + TASKED 2026-08-21 | closed — TASK-016 written | Owner of the final criterion = him. Detail: SPEC-002 §Questions + TASK-016 |
| ~~Q23~~ TRANSCRIBED + TASKED 2026-08-21 | closed — TASK-016 owns command/port/pages | No deployment; cookie-`Secure` stays parked. Detail: SPEC-002 §Questions + TASK-016 |
| ~~Q-SA-17~~ ANSWERED 2026-08-21 — **"ก" = he starts the backend too**, all three reworked screens openable; (ข) fake-data stub CLOSED | @Sober, to transcribe into TASK-016 §Questions + move its status and re-scope the hand-over (Porter may not write in `tasks/`) | No credential asked for or given — he runs it, the team never connects. Detail: REQ-003 §Questions |
| ~~Q-SA-16~~ TRANSCRIBED + TASK RE-SCOPED 2026-08-21 | closed — TASK-014 is `TODO` (Phase A), Jason's now | Answer "ค" verbatim in TASK-014 §Questions; two-phase DoD written. Detail: TASK-014 |
| ~~Q-SA-18~~ **TRANSCRIBED + RULED 2026-08-24 into TASK-014 §Questions** | closed — Bruno takes Steps 2–4 only; `curl` survives verbatim as a labelled fallback; collection authored as fenced blocks in the TASK, not on disk | Steps 1/5/6 stay shell — a request runner starts no server, greps no log, writes no evidence file. Became **D3** on the same return trip. Detail: TASK-014 §Questions + §Review addendum |
| ~~Q-SA-19~~ TRANSCRIBED 2026-08-21 into SPEC-003 §Questions + TASK-018 | closed — wording is an `[x]` at review, not an open `[~]` | Approved AS AUTHORED: changing one of the 12 is now a question. The two *false* hints are NOT covered (replacing approved text is still a reword). Detail: SPEC-003 §Questions |
| ~~Q33~~ **TRANSCRIBED + RULED 2026-08-24 into TASK-014 §Questions** | closed — a `docs { … }` block per request is now a **DoD line**; the prose around today's `curl` lines moves into those blocks so nothing is lost | Ruled explicitly **not** a copy question: Q14's closed bundle governs the product's strings, and a runbook is not the product. No internet fetch. Detail: TASK-014 §Questions |
| ~~Q32~~ ANSWERED 2026-08-21 — **"ใช่หากมันดีขึ้นต่อการใช้งานก็จัดการเลย"**: yes, **conditional on usability** | closed — REQ-004 Req 7c hold RELEASED → **7d**; **@Sober: TASK-020's ceiling moved and the freeze may be released wider** | Condition carried, not dropped: the TASK that changes a REQ-001-named behaviour writes down **why it is easier to use**. Two things NOT read into it (Req 7e, held, blocks nobody): the **sanitizer** (not named in the question he answered) and the **PAT rules** (safety, not usability). Detail: REQ-004 §Questions |
| EVIDENCE HAND-OVER (open) — TASK-014 Run A + Run B output pasted into the real `project-docs/` | human; Porter relays. **RE-GATED 2026-08-21 at the Phase A review: the sheet does not leave until D1/D2 are fixed** — as written it names a folder that does not exist | Blocks TASK-014 Phase B only. Detail: TASK-014 §Review |
| ~~Q-BE-14~~ ANSWERED 2026-08-21 — **ruled (b), indirect proof, BOUNDED** | closed — Phase B DoD amended; `finished_at` stays off the wire | Proves `finishDone` + `finishFailed`; **`finishNoCommits` unproven**. (c) refused as invented scope → parked candidate 12. Detail: TASK-014 §Questions |
| ~~Q-BE-13~~ ANSWERED 2026-08-21 — **keep `REPO_AUTH_FAILED`; the TASK text was Sober's error and is corrected** | closed — sheet unchanged | Unresolvable-host alternative refused: it swaps real coverage for a literal string. Detail: TASK-014 §Questions |
| ~~Q-BE-15~~ ANSWERED 2026-08-21 — accepted; DoD line was Sober's to fix and is fixed | closed — sheet unchanged | Phase B now also judges **tier stability across `AI_COMMITS` batches**. Detail: TASK-014 §Questions |
| ~~Q-BE-16~~ NOTED 2026-08-21 — no answer owed | closed | No new scope (`pat` is already optional). If Run A needs a PAT, that settles REQ-001 Q8 as a side effect. Detail: TASK-014 §Questions |
| ~~Q24~~ **CLOSED BY PORTER 2026-08-21** — "ไม่เข้าใจเลยมันคืออะไรวะ ตัวนี้" (second time he has said so) | closed — no third round goes to the human; @Sober still owns the TASK-009 re-scope | Porter withdrew his own question rather than re-word it again: it is about an internal artifact he has never been shown. Working arrangement stands (team writes the click-through script, he runs the eleven UI runs, no team database) — commits nothing today, grants no database, reversible by one line. Detail: REQ-001 §Questions |
| ~~Q-FE-16~~ ANSWERED 2026-08-21 — ruling **(a)**: what Fern shipped stands, `@mantine/dates` is NOT installed | closed — **SPEC-002 Decision 3.4 withdrawn instead** | Peer dep `dayjs: '>=1.0.0'` re-verified by Sober with `npm view`; `dayjs` is one of the four Q-SA-12 declined. The SPEC's premise was Sober's and was false. Detail: TASK-012 §Review |
| ~~Q-FE-17~~ ANSWERED 2026-08-21 — not a TASK-012 defect, gate 3 `[~]` accepted; Fern was right not to patch a shared rule | closed as a TASK-012 item → **Sober's parked queue item 11** | Sober read Mantine's own stylesheet: the error rule (0-4-0) outranks the default (0-3-0) and no app rule overrides it, so the cascade is sound on paper → weight shifts to "measurement artefact". Falsification method written into TASK-013 as optional. Detail: TASK-012 §Review |
| ~~Q-FE-18~~ NOTED 2026-08-21 — no answer owed | closed | Position for TASK-013 stated: measure everything, capture nothing; do not spend time on `screenshot`. Detail: TASK-012 §Review |
| ~~Q-FE-19~~ ANSWERED 2026-08-21 at the TASK-013 review — **design, not copy; numerals stay, nothing goes to the human** | closed — ruled from written rules, not escalated | Q14/freeze-10 govern strings (added/removed/reworded); a derived, language-invariant, `aria-hidden` numeral is none of those, and Q16 authorised the redesign whose acceptance is his own eyes (Q-SA-15/Q23). Scope of the ruling bounded in the answer. Detail: TASK-013 §Questions |
| ~~Q-FE-17 artefact hypothesis~~ FALSIFIED 2026-08-21 by TASK-013's free probe | @Sober — parked item 11 stays open, now with a next probe | Same node: `--input-bd` = danger, painted border = `rule-strong`. Not a wrong-element error. Unscanned: the logical-property longhands. No fix shipped. Detail: TASK-013 §9 |
| ~~STANDING FE RULE amendment~~ ADOPTED 2026-08-21 at the TASK-013 review — Fern is right (**runner → bun 2026-08-24, REQ-005/SPEC-004**) | closed — rule now reads: set `API_PROXY_TARGET` **before `bun run build`**, and re-confirm through Next before the first request | Next bakes `rewrites()` into `.next/routes-manifest.json` at BUILD time, so confirming before `next start` is already too late. Manifest verified back at `localhost:8080`, `.env.production.local` deleted. Detail: TASK-013 §4 + §Review |
| ~~Q25~~ ANSWERED 2026-08-21 — **"ค" = committer becomes a loaded list too**, field NOT removed | closed — REQ-004 Requirement 6; REQ-001 Req 4.3 survives | Reverses the second half of REQ-001 Req 4.6. Where the list comes from is Sober's design call. Detail: REQ-004 §Questions |
| ~~Q26~~ ANSWERED 2026-08-21 — **"ก" = team's own judgement, his eyes are the test** | closed as asked → REQ-004 Requirement 7; the unanswered half re-asked as **Q31** | Same arrangement as Q16. Scope held to the two named screens meanwhile (Req 7a). Detail: REQ-004 §Questions |
| ~~Q27~~ ANSWERED 2026-08-21 — **"ไปต่อไม่ได้เลย"**: no list, no continuing; no typed fallback | closed — REQ-004 Requirement 1a | Private repo is unusable until the token is entered — that is what he asked for. New wording still needs his yes/no (Q14). Detail: REQ-004 §Questions |
| ~~Q28~~ ANSWERED 2026-08-21 — **`today → today`, 366-day cap stays** | closed — REQ-004 Requirement 2a | Detail: REQ-004 §Questions |
| ~~Q29~~ ANSWERED 2026-08-21 — **"มีค่าเดิม"**: back keeps the submitted values | closed — REQ-004 Requirement 4a | Still no report-history screen (REQ-001 Req 12) — read narrowly. Detail: REQ-004 §Questions |
| ~~Q30~~ ANSWERED 2026-08-21 — **"โค้ดล่าสุด … แต่การทำงานก็ตามที่ฉันแจ้งไป"** | closed — **redesign NOT rejected; also NOT accepted**, REQ-003 stays `IN_SPEC` | He described code he has seen, not a verdict on the screens; TASK-016 still produces that verdict. Detail: REQ-004 + REQ-003 §Questions |
| ~~Q31~~ ANSWERED 2026-08-21 — **"ทุกหน้า แก้พฤติกรรมได้ด้วย"**: every screen, behaviour too | closed — REQ-004 Req 7a hold released → Req 7b; **@Sober: this widens what SPEC-002's freeze must release** (items 1/4/5/6/7/8 now in reach, not just item 3) | Copy unchanged (Q14 stands); "every screen" = the screens that exist, not new ones. Detail: REQ-004 §Questions |
| ~~Q-BE-19~~ ANSWERED 2026-08-21 at the TASK-017 review — **`email` is always present and always a string; `""` when the commit has none** | closed — recorded in **SPEC-003 §API + TASK-018** so Fern reads it in her own files | A wire shape, not copy → Sober's call, not the human's. Consequence stated: e-mail-less commits group by **name**, so two same-named people with no e-mail merge into one row. Q-BE-17 + Q-BE-18 both ruled "keep what was shipped" → one parked tidy-up. Detail: TASK-017 §Questions + §Review |
| ~~Q-FE-20~~ ANSWERED 2026-08-21 at the TASK-019 review — **KEEP the second writer** | closed — nothing to revert | Sober's preferred shape cannot write what the page does not yet have; her falsification stands. Bounded: authorises the submit-path writer only. Detail: TASK-019 §Questions |
| ~~Q-FE-21~~ ANSWERED 2026-08-21 — **the handoff lives until the next form mount consumes it; `SessionProvider` stays untouched** | closed — no change shipped | Six non-secret user-typed values, one tab, one reader, no PAT. Two limits written into the answer (a non-user-input field re-opens it; TASK-018 must treat a restored branch as a *pending* selection). Detail: TASK-019 §Questions |
| ~~Q-FE-22~~ NOTED 2026-08-21 — no answer owed | closed → carried into TASK-020 | `onTryAgain`'s `(failed: ReportJob) => void` signature is cosmetic; not a reason to open `ReportResult.tsx`. Detail: TASK-019 §Questions |
| ~~Q-SA-20~~ TRANSCRIBED + RULED 2026-08-21 into SPEC-003 §Questions + TASK-018 §5 | closed — Fern's to build inside TASK-018 | **My costing was wrong:** the API's `params` has six keys and `extraContext` is not one, so only the form-side writer can produce it and the report-side rewrite must not destroy it (mechanism = Fern's). Adding it to the API is NOT the answer. Freeze item 4 gains a 4th clause. Detail: SPEC-003 §Questions |
| ~~Q-FE-23~~ ANSWERED 2026-08-21 at the TASK-018 review — **the conflict is mine; carried-in item 3 is SUPERSEDED by §5** | closed — nothing to move | Her `Omit<>`-based mechanism is kept as shipped. One consequence recorded: a **second round trip** (Back → Forward → Back) empties the extra-context box — accepted, carried into TASK-020. Detail: TASK-018 §Questions |
| ~~Q-FE-24~~ ANSWERED 2026-08-21 — **keep the deferred committer**; both "fixes" examined and refused | closed → carried into TASK-020 under Req 7d | Auto-loading is a clone nobody asked for (Decision 2.2); a synthetic option ships an `author` matching nobody. Named as a deliberate gap against Req 4a. Detail: TASK-018 §Questions |
| ~~Q-FE-25~~ ANSWERED 2026-08-21 — **neither string nor code is wrong; nothing changes** | closed → parked queue item 16 | The hint describes *counting* (`REPORT_TIMEZONE` = Asia/Bangkok, verified in the backend); §2's "today" is the pre-filled *default* only. Divergence is one day, in a default, on a browser nobody here uses. Detail: TASK-018 §Questions |
| ~~Q-FE-26~~ ANSWERED 2026-08-21 — **keep `back: 0/6/29`**; presets are inclusive of today | closed — decision recorded | The label carries a number, so the range must contain that many days. Detail: TASK-018 §Questions |
| ~~FE probe reached port 8080 (2nd occurrence, TASK-018)~~ CLOSED 2026-08-21 at the review | closed — no action | One unauthenticated `POST /api/repos/branches`, rejected `AUTH_REQUIRED`; no database, no SQL, nothing written, nothing to undo. Standing FE proxy rule was honoured and the env restored. Detail: TASK-018 §7.1 + §Review |
| ~~Q34~~ ANSWERED 2026-08-24 — **"ฉันทำไปแล้ว"**: he committed it himself | closed — **the project's only BLOCKING question is gone** | Verified, not relayed: `d44f523` = `bun.lock` added + `package-lock.json` deleted and nothing else; `git status --porcelain` empty. REQ-005 Req 2 satisfied with no team work; **FE clean-tree gate OPEN**. Detail: REQ-005 §Questions |
| ~~Q35~~ ANSWERED 2026-08-24 — **"ตัด npm ออก"**: npm is out permanently | closed — REQ-005 **Req 5** | `package-lock.json` never returns. Checked: the FE repo's own README/AGENTS/CLAUDE carry no npm command, so it lands entirely on Req 3 (our wording). Detail: REQ-005 §Questions |
| ~~Q36~~ ANSWERED 2026-08-24 — **"ไม่ใช่ … ปุ่มโหลด branch กับ โหลด commit มันไม่ตรงกับ dropdownlist"** | closed — REQ-006 **Req 1 replaced**; date item demoted to Req 3 and HELD | The mismatch is **layout**, not the date. Measurements read off his image are in the REQ; **what "aligned" should look like, and why it is offset, is @Sober's design call — Porter named neither.** Detail: REQ-006 §Questions |
| ~~Q37~~ ANSWERED 2026-08-24 — **"คง Branch ไว้ … ตีคำนั้นว่าเป็นคำไทยด้วย … เดี๋ยวฉันไปแก้ คำไทย เอง"** | closed — **nothing changes, no TASK line** | Standing consequence: an English word inside a Thai screen is **not** an inconsistency here (he counts it as Thai), and **he edits Thai copy himself** — reinforces the Q14 copy bundle, does not open it. Detail: REQ-006 §Questions |
| ~~Q-SA-21~~ ANSWERED 2026-08-24 — **"ไทยหลัก อังกฤษรอง"** | closed at the human's end — **@Sober re-rules**; his English ruling is reversed for those blocks | Costs a translation pass on content Jason already wrote in English. **Read NARROWLY: it changes the Bruno `docs` blocks only — PROTOCOL's English-for-team-artifacts is untouched** until Q39 says otherwise. What "อังกฤษรอง" looks like in a `.bru` is Sober's wording call, inside his own TASK. Detail: REQ-001 §Questions |
| ~~Q38~~ ANSWERED 2026-08-24 — **"ทำให้หมดอ่ะ"**: build Req 3 too | closed — REQ-006 **Req 3 now GO**, hold lifted | The date-format fix ships with the layout fix. **The outcome is his yes; *how* (OS-locale input → `DD/MMM/YY`, and whether Req 7d covers it, Q-SA-10) is @Sober's design call.** No new string. Detail: REQ-006 §Questions |
| ~~Q39~~ ANSWERED 2026-08-24 — **"แค่เอกสารที่ฉันต้องอ่าน หรือ UI หรือ อะไรก็ตามที่ฉันต้องอ่าน"** | closed — line drawn by **reader**, not file type | Thai-primary applies to everything **he** reads (UI, docs/output for him). **Team-internal stays English** — REQ/SPEC/TASK, board, log (he doesn't read them; PROTOCOL intact). The UI-reword question spins off as **Q40**. Detail: REQ-001 §Questions |
| **Q40 (2026-08-24) — does Q39 authorise the team to reword existing UI strings to Thai-primary, or is it forward-only (he edits Thai copy himself)?** | human; Porter relays | **NON-BLOCKING** — forward-only in force meanwhile; **no existing UI string is reworded on Q39 alone** (Q14 bundle closed, Q37 = he edits Thai copy himself). No UI-language TASK written until answered. Detail: REQ-001 §Questions |
| **BRUNO COOKIE CARRY (2026-08-24) — does Bruno carry `cr_session` from Step 2 into Steps 3/4 by itself?** | @Jason, inside the D3 rework | **Not a human question and not mine** — third-party behaviour, and PROTOCOL forbids assuming it. If he cannot establish it without running Bruno, `curl` stays primary for Steps 2–4 and he says so. Blocks nobody: that outcome is an accepted result of the rework. Detail: TASK-014 §Questions |
| **Q-BE-24 (2026-08-24) — inside the Thai `docs` blocks, is `Step N` a name (English) or prose (Thai)?** | @Sober, at the TASK-014 review | **NON-BLOCKING** — Jason kept it English and said why: those blocks cross-reference `Step 5` and `Step 1`, which are English headings *outside* the collection and outside what Q-SA-21 covers. Reversing it is a six-heading find-and-replace, but it also needs a ruling on those two references, which sit in text Jason was told not to open. Detail: TASK-014 §Questions |
| DEPLOYMENT NOTE — cookie `Secure` needs https + `NODE_ENV=production` | whichever TASK first deploys | No deployment TASK exists yet; parked so it is not lost. Origin: Q-BE-3 answer in TASK-002 |

## Sober's parked queue (state, one unit per session; detail at the pointers)

0. ~~TASK-009 split~~ · ~~SPEC-002 transcriptions + the two missing TASK lines~~ ·
   ~~Q-SA-16 → TASK-014~~ **all CLOSED 2026-08-21** (TASK-014 re-scoped into
   Phase A/B and moved to `TODO`). ~~**REQ-004 → `IN_SPEC` + SPEC-003**~~
   **CLOSED 2026-08-21** — SPEC-003 is `ACTIVE` and SPEC-002 freeze items 1 + 4
   are released for it. ~~**write TASK-017…020**~~ **CLOSED 2026-08-21 — all four
   files written, 017 + 019 startable.**
   ~~**review TASK-019**~~ **CLOSED 2026-08-21 — `DONE` at `32e8eed`, TASK-018 startable.**
   ~~**Q-SA-19 + Q-SA-20 → SPEC-003**~~ **CLOSED 2026-08-21 — both transcribed,
   ruled, and Q-SA-20's work written into TASK-018 §5 + DoD.**
   ~~**review TASK-018**~~ **CLOSED 2026-08-21 — `DONE` at `f70fb02`; TASK-020 is
   startable and is the last SPEC-003 TASK.**
   ~~**Q-SA-18 → TASK-014**~~ **CLOSED 2026-08-24 — Q-SA-18 + Q33 both
   transcribed and ruled; Bruno takes Steps 2–4, `curl` survives as a frozen
   fallback, the collection is authored inside the TASK, and a `docs { … }` block
   per request is a DoD row. Became D3 on the existing D1/D2 return trip; one new
   NON-BLOCKING question up (Q-SA-21).**
   **New TOP: the two 2026-08-24 REQs — `REQ-005` (bun) and `REQ-006` (the
   screenshot mismatch), both `READY_FOR_SA` and both untouched by this session.
   REQ-005 is where the FE lane is stuck (Q34 = the clean-tree gate) and its Req 3
   rewrites FE DoD wording + the standing FE proxy rule, which are mine.** Then
   **Q-SA-17 → TASK-016**
   (transcribe + move + re-scope the hand-over, now that he starts the backend
   too), then **the Q32/Req 7d freeze widening → TASK-020** (added 2026-08-21:
   7c is released, so how much further SPEC-002's freeze opens and what TASK-020
   is allowed to change is an unwritten design unit; 7e keeps the sanitizer and
   the PAT rules out of it and Q14 keeps copy out of it — nothing is blocked,
   TASK-018 comes first anyway), then **TASK-009's re-scope** on Q24's recorded
   recommendation.
1. TASK line for the flaky auth test (1-in-20 tampered-token false pass).
   Evidence: TASK-003 §Review — rework pass.
2. Decide if the two swallowed git-layer failure paths get SPEC-001 error codes
   (worker-side rule already bound into TASK-005 item 6). Origin: TASK-003 review.
3. TASK-001 DoD review call — migrate/seed evidence in
   `../project-docs/db-migrate-seed-run-2026-08-20.md` and
   `../project-docs/seed-users-run-2026-08-21.md` (caveats: no exit code printed;
   `updated`, not `created`).
4. Whether TASK-005's dummy-token PAT-grep evidence uses that same database.
5. ~~KnowCode TASK line~~ CLOSED 2026-08-21 — folded into TASK-011 by SPEC-002
   (name only; nothing else reworded, Q14).
6. Query-string secret in repo URL (`?token=…` stored/echoed/written to
   `.git/config`) — SPEC-001 line before TASK line. Origin: TASK-005 review 2026-08-21.
7. Q-SA-11 answered (b): distinct th/en sentence for credentialed-URL
   `INVALID_URL` — one string pair + `ValidationIssue`; wording comes back to the
   human for yes/no (Q-SA-4 precedent).
8. TASK lines for Reqs 16/17/18 (16 = BE, also adds the "reproduce dates exactly"
   rule to `stage2System` per TASK-004 review; 17/18 = FE).
9. One SPEC-001 error-table amendment covering Q-BE-10 (`REPORT_NOT_FOUND`) +
   Q-BE-12 (refused private host row) + the implementing BE TASK line.
10. Candidate (ranked last): per-run nonce delimiter for `REPO_CLOSE` blocks.
    Origin: TASK-004 review.
11. **(Q-FE-17) — the artefact hypothesis is FALSIFIED 2026-08-21**, so this is a
    real rendering question, not a mis-read element: the same node carries
    `--input-bd: danger` and paints `rule-strong`. **Next probe, named by Fern
    and not yet run:** his scan matched rules declaring `border` / `border-color`
    / `border-top-color` and **not** the logical-property longhands
    (`border-block-start-color`, `border-inline-*`) — a rule using one would be
    invisible to it and would explain everything. Still ranks below the SPEC-002
    transcriptions and the two missing TASK lines: nothing is blocked, and the
    error is already carried by icon + words + `aria-invalid`, never by colour
    alone. Origin: TASK-012 review; evidence TASK-013 §9.
12. **(Q-BE-14, candidate) Should `finished_at` be readable through
    `GET /api/reports/:jobId` at all?** The application writes it on all three
    terminal transitions (`finishDone`/`finishNoCommits`/`finishFailed`,
    `src/reports/jobs.ts`) and the column exists in `001_init.sql`, but it is in
    no `SELECT`, no type and no wire shape — so no consumer can ever see it.
    **Nothing is blocked and nothing asks for it** (REQ-001/SPEC-001 never
    request a finish time), which is exactly why it is a candidate and not work:
    adding it now would be scope invented to tidy an evidence line. Ranks below
    everything above it. Origin: TASK-014 Phase A review 2026-08-21.
13. **Standing lesson from the same review, cheaper than a rule:** `../project-docs/`
    is workspace shorthand that is correct between roles and **wrong the moment
    it is handed to someone standing in a different directory**. Any future
    artifact meant for the stakeholder's own hands carries **absolute paths**.
14. **(TASK-017 review) The inspection clone is UNBOUNDED — a SPEC-003 decision
    before it is a TASK line.** `POST /api/repos/committers` does a full
    metadata-only clone per request with **no semaphore**, while the worker's
    clones run behind `Semaphore(config.MAX_CONCURRENT_JOBS)` (default 2). N
    authenticated requests = N `git` processes + N temp dirs. **The gap is mine:
    SPEC-003 never named a limit**, and the fix is a choice between three
    answers (share the worker's semaphore / a separate inspection bound / a new
    config key — which TASK-017 forbade), so it is not a one-line rework.
    Nothing is blocked; every request still cleans up after itself. Ranks below
    anything that unblocks a person, above item 15.
15. **(Q-BE-17 + Q-BE-18, one candidate, ranked last) Relocate
    `classifyRunFailure` (out of `reports/worker.ts`) and the duplicated
    `renderIssues` into `src/errors/`,** in one TASK that owns both files.
    Cosmetic by measurement: neither holds a bound, and the duplicate delegates
    every word to `fieldMessage`. Origin: TASK-017 review 2026-08-21.
16. **(Q-FE-25, candidate, ranked last) Which day should the period pre-fill on a
    browser that is not on the Asia/Bangkok day?** The form's default is the
    **browser's** calendar day (`todayIso()`), while the dates are **counted**
    in `REPORT_TIMEZONE` = `Asia/Bangkok` (`config.ts:81`, `commits.ts:103-107`)
    — which is what the approved `reports.new.date.hint` says, truthfully. So the
    two can disagree by one day, in the **default value only**; the two dates go
    on the wire exactly as shown, so no submission is ever wrong. **Nobody on this
    project is on such a browser**, which is why this is a candidate and not work
    — and the fix would be a question to the human, not a decision of mine.
    Origin: TASK-018 review 2026-08-21.

## Facts parked during compaction 2026-08-21

- **ID desync (bookkeeping, numbering stays as-is):** REQ-002 is
  reserved-but-unwritten (email feature) and **SPEC-002 pairs with REQ-003**,
  not REQ-002. Recorded here to prevent future confusion; no renumbering.
- Everything removed in this compaction (session narratives, answered-question
  histories, review evidence prose) exists verbatim in
  `archive/board-2026-08-21-pre-compaction.md`, in the daily logs, and in the
  TASK/REQ/SPEC files' own sections.
