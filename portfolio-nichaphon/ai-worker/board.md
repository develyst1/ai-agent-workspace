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
- Branches on the repo: **checkout is `D1` with a CLEAN tree as of 2026-09-05**
  (was `develop`). **All team work to date is committed at `ca5c097` and that SHA
  sits on `D1` = `origin/D1` = `develop` = `origin/develop` (read 2026-09-05,
  Porter); `main` `d30dfea` and `production` `ed2eb5d` do NOT carry it.** No role
  committed anything — git stays the human's — see requirements/REQ-003-portfolio-content-refresh.md §TEST-006 intake QQ11.

## Requirements

| ID | Title | Priority | Status | Owner of next step |
|----|-------|----------|--------|--------------------|
| REQ-005 | Profile source-of-truth MD from the 2026-09-06 resume + reconcile 8 site-vs-resume fact conflicts | HIGH | **IN_SPEC 2026-09-09 — TASK-019 + TASK-020 `DONE`, TASK-021 `BLOCKED` on the owner. The pack is READY: `drafts/DRAFT-002-req005-profile-pack.md`, 6-line sheet; FQ33-FQ36 all answered** — see specs/SPEC-005-profile-source-of-truth-and-fact-reconciliation.md | **Porter (PM)** — put the 6-line sheet to the owner (+ SQ29's clause on line 1) |
| REQ-006 | `back/` service (Bun + Hono) that calls the owner's LLM gateway, incl. one recorded real test fire | HIGH | **READY_FOR_SA 2026-09-09, Porter — Q33/Q34/Q35/Q36/Q44 answered: `back/` at repo root, CLIENT of `https://ai.develyst.online`, no auth, 5 real calls, no DB** — see requirements/REQ-006-back-bun-hono-llm-gateway-client.md §Owner decisions | **Sober (SA)** |
| REQ-007 | Home "ask the AI about me" — 3+ stacked gateway calls as thinking steps; depends on REQ-005 + REQ-006 | HIGH | **READY_FOR_SA 2026-09-09, Porter — Q37/Q38/Q45 answered: real WebSocket (owner-mandated), NO cap, ideas A+B+C+D+G+H; build after 005+006; Q50 language held** — see requirements/REQ-007-home-ask-ai-about-me.md §Owner decisions | **Sober (SA)** |
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
| TASK-020 | Draft the profile source-of-truth pack + approval sheet (no code edited) | SPEC-005 | **DONE 2026-09-09, Sober** — rework re-verified by SA's own scan: **22 of 66 unbacked, 22 flagged, 0 mismatch**, bridge clause gone, sheet 6 lines asking all five; certificates + xAI rows re-checked; zero code touched (`6c17609`, `back/` empty). **FQ36 answered → SQ29**, no third pass — see tasks/TASK-020-profile-source-of-truth-draft-pack.md §Review | Fern (FE) | none |
| TASK-021 | Place the approved profile, C5/C8/**C9** and the Class 1 skill additions | SPEC-005 | **BLOCKED 2026-09-09, Sober (waiting: Human via Porter — TASK-020's approval sheet)** — now **three** conditional steps: Class 1b (line 2), delete-what-he-names (line 6), and the ICM one-project-or-two merge (SQ29, step 9) — see tasks/TASK-021-place-approved-profile-and-additions.md | Fern (FE) | TASK-019, TASK-020, owner approval |

> TASK-001 … TASK-018 are all `DONE`; their rows were swept verbatim to
> `archive/board-closed.md` on 2026-09-05, each still carrying its own `§Review`
> pointer into `tasks/`.

## QA / Tests

| ID | Title | Source REQ | Status | Tester |
|----|-------|------------|--------|--------|
| TEST-001 | REQ-001 Home acceptance — independent QA round | REQ-001 | TEST_PASSED 2026-09-02, Tanya — partial closed; every quote on / is R5-exact — see tests/TEST-001-req001-home-acceptance.md §Confirm-tick round | Tanya |
| REGRESSION | Standing site regression checklist | — | OPEN 2026-09-05, Tanya — **27 checks, 26 PASS**: **P3** (pinned modal footer) added and **P2's OBS-8 note rewritten + widened to all 7 linked entries** by TEST-007. **H5 alone is NOT_TESTED** and stays so per QQ8 — see tests/REGRESSION.md | Tanya |
| TEST-002 | SQ7 repro — do Modal + Drawer ever open? | REQ-002 (defect predating it) | CANNOT_REPRODUCE 2026-09-03, Tanya — verdict accepted as written by Porter; QQ1/QQ2/QQ3 all answered 2026-09-03 — see tests/TEST-002-sq7-modal-drawer-repro.md §Questions | Tanya |
| TEST-003 | The BUILD round — SQ7 triggers, S13 and S11 on a `npm run build` output | REQ-002 AC8 | **TEST_PASSED 2026-09-05, Tanya** — 13/13, 0 defects; **S11 PASSES** (build exit 0, no error/warning line), 12/12 loads console-clean; **QQ10 ANSWERED, Porter** (→ owner as Q26) — see tests/TEST-003-sq7-build-round.md |
| TEST-004 | REQ-002 site-wide acceptance round (full REGRESSION re-run + R9 sweep + the 7 SQ8 eyes) | REQ-002 | **TEST_FAILED 2026-09-05, Tanya** — AC6 PASS (0/96 R9 hits, six routes); AC3 partial (H8 FAIL = DEF-2, H5 + S11 NOT_TESTED); new DEF-3; DEF-1 closed; all 7 eyes answered, SQ12 settled — see tests/TEST-004-req002-site-wide-acceptance.md | Tanya |
| TEST-005 | REQ-002 closing round — H8, S14, the five-route AC7 look, `/services` at 1280, arrow keys | REQ-002 | **TEST_PASSED 2026-09-05, Tanya** — 5/5 pass, 0 new defects; AC3 + AC7 tick, DEF-2 + DEF-3 closed, both TASK-014 carries settled; QQ8 (H5) + QQ9 (OBS-5) open for Porter — see tests/TEST-005-req002-closing-round.md | Tanya |
| TEST-006 | REQ-003 AC-d — `/portfolio` + both new modals SEEN as pictures, each live href read | REQ-003 | **TEST_PASSED 2026-09-05, Tanya** — 10/10, 0 defects; 11 cards + intro line, both modals painted at 1280 and 360, hrefs `learning.develyst.online/` + `ong.develyst.online/`; new OBS-8, QQ11 + QQ12 for Porter — see tests/TEST-006-req003-acd-portfolio-modal-pictures.md | Tanya |
| TEST-007 | REQ-004 AC-a/b/c/d/g — the 7 linked modals + the 4 link-less ones SEEN at 360x740, both new at 1280x900, plus the SQ19 "intrusive?" pictures | REQ-004 | **TEST_PASSED 2026-09-05, Tanya** — 12/12, 0 defects; 11/11 modals shot at 360 with `scrollTop 0`, bar **89px**, SQ21 reproduced (5 of 7 moved); OBS-9 + OBS-10 raised, **QQ13 ANSWERED 2026-09-05, Porter**; all 5 held AC now ticked — see tests/TEST-007-req004-pinned-footer-picture-round.md | Tanya |

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| ~~**NEW INTAKE 2026-09-09 — 9 blocking questions**~~ **CLEARED 2026-09-09, Porter** | — (nothing) | All 9 answered by the owner and recorded verbatim; **REQ-005/006/007 are all `READY_FOR_SA`**. Q44 answered too. Nothing on this intake waits on him to start work — see each REQ's §Owner decisions |
| **ACCEPTED EXPOSURE 2026-09-09 (his call, not a team default)** — open gateway, no cap | Human (owner) — FYI, no action | Q35 `ไม่มี auth` + Q38 `ปล่อย ไม่จำกัดไปก่อน`: once Home ships, nothing known to this team stops a stranger's script spending his provider credit. Cap must stay **cheap to add later** (REQ-007 R6) — see requirements/REQ-006-...md §Owner decisions |
| **SPEC-005 SQ27** (new 2026-09-09) — applying C6 correctly left the site stating his career length twice, `/` "4 Years experience" vs `/about` `<h1>` "Three years…", both in **built** HTML | Porter (PM) → human, **inside TASK-020's sheet** | Not a new hop and not a defect: it becomes **C9** in SPEC-005 Group B, so the sheet grew to 5 lines (and to **6** at TASK-020's review, see SQ28) — line 5 asks him to pick the `/about` headline (two candidates + the "career total or one pattern of work?" question). Reverting the `4` is not offered — it is his Q40 decision — see specs/SPEC-005-profile-source-of-truth-and-fact-reconciliation.md §Questions SQ27 |
| **SPEC-005 SQ28** (new 2026-09-09) — **22 of the 66 citation rows cite only a shipped site string** (no resume line, no owner decision); the draft flagged 5 and called it six | Porter (PM) → human, **inside TASK-020's sheet** | Not a defect and nothing waits on Porter: all 22 are copy already on his site and **all are kept**. The unflagged 16 include the **four certificates** (the resume names none) and "GFAI had no product of its own and resold third-party hardware" — a claim about a named third-party company. **The sheet is now 6 lines, not 5**: line 6 names these in plain words and asks keep-all-or-name-what-to-remove, because line 1 cannot be answered honestly otherwise — see specs/SPEC-005-profile-source-of-truth-and-fact-reconciliation.md §Questions SQ28 |
| **SPEC-005 SQ29** (new 2026-09-09) — striking one unsourced inference exposed its mirror: two adjacent ICM bullets each describe a four-month CRM AI build | Porter (PM) → human, **as one clause on sheet line 1** | Not a defect and not a 7th line: SA decided the body does **not** change (every repair asserts *same* or *different*, both unsourced). When Porter puts line 1 into Thai he names the spot — one project or two? Silence is safe: TASK-021 step 9 then ships them as drafted — see specs/SPEC-005-profile-source-of-truth-and-fact-reconciliation.md §Questions SQ29 |
| **Git state on the board is stale — verified 2026-09-09 by SA, one line for Porter** | Porter (PM) | The §Project info bullet says team work sits at `ca5c097` on `D1` = `develop` and that TASK-018's file is unstaged. Neither still holds: the human committed TASK-018 as **`6c17609`**, and **`D1` = `origin/D1` = `6c17609` while `develop` = `ca5c097`** — the branches have diverged. SA read git but will not rewrite Porter's bullet |
| **SPEC-005 SQ22 / SQ23 / SQ24 / SQ25 / SQ26** (new 2026-09-09) — five SA notices from REQ-005; **none blocks any task** | Porter (PM) → human | SQ22 **C1 is FIVE strings, not the two AC-c names** (one is visible Home copy, two are indexed metadata) — Porter records the count · SQ23 Q47's answer moves **three** strings · SQ24 Education/Languages need NEW UI that §Out of Scope bars → profile-only, site question is his; **Porter must copy the approved add-list into REQ-005 §Owner decisions** (SA/FE may not) · SQ25 auto-year answered NO by SA · SQ26 profile placed at `back/knowledge/` (FYI) — see specs/SPEC-005-profile-source-of-truth-and-fact-reconciliation.md §Questions |
| **Q47 / Q48 / Q49 / Q50** (new 2026-09-09) — non-blocking, none stops Sober | Human (owner) | Q47 C5 two resume title lines into one `SITE.role` (default: "AI Engineer / Senior Software Engineer") · Q48 footer year still 2025 (default: 2026) · **Q49 test-call budget for REQ-007** — the 5 of Q36 cover REQ-006 only, one visitor question is 3+ calls (suggested 30) · Q50 answer language — Q39's default vs Q45 omitting idea F; **default deliberately NOT applied** |
| **Q43 / Q46** (2026-09-09) — non-blocking, written defaults stand | Human (owner) | Q43 deploy `back/` this round (default: **local only**; when he does deploy, a WebSocket needs nginx upgrade headers — REQ-006 §Questions Q43) · Q46 placement on Home (default: added below the hero, nothing removed) |
| **REQ-001 / REQ-002 / REQ-003 / REQ-004 — all DELIVERED, none signed off** (001-003 rows in archive/board-closed.md) | Human (owner) | Four sign-offs still his, plus the deploy call: `main` `d30dfea` and `production` `ed2eb5d` do **not** carry `ca5c097` and TASK-018's file is still unstaged — moving any of it is his hand alone |
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
