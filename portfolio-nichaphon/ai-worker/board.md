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

> **Empty on purpose.** TASK-001 … TASK-018 are all `DONE`; their rows were swept
> verbatim to `archive/board-closed.md` on 2026-09-05, each still carrying its own
> `§Review` pointer into `tasks/`. Nothing is open, nothing is assigned.

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
