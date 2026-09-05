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
- Branches on the repo: `develop` (current checkout) · `main` · `production`
  (+ `origin/D1`). Which branch a change targets is the human's call via Porter.

## Requirements

| ID | Title | Priority | Status | Owner of next step |
|----|-------|----------|--------|--------------------|
| REQ-001 | Visual identity rebuild — Home page first | HIGH | DELIVERED 2026-09-02, Porter — 11/11 AC ticked, 5/5 TASKs DONE, TEST-001 PASSED; B/C/D/F/G/H + N4/N5 carried forward, not closed — see requirements/REQ-001-ui-visual-redesign.md §Delivery | Human (sign-off) |
| REQ-002 | Whole-site visual step-up (AI/robotic/IoT) + the five remaining routes | HIGH | **DELIVERED 2026-09-05, Porter** — 8/8 AC ticked (AC3+AC7 on TEST-005, AC8 on TEST-003), 10/10 TASKs DONE; carries SQ7-look/H5-Q25/Q18/SQ8-SQ13/Q26 survive and are NOT closed — see requirements/REQ-002-whole-site-step-up-five-routes.md §Delivery | Human (sign-off) |
| REQ-003 | Portfolio content refresh — his real projects on the site (N5) | HIGH | **IN_SPEC — AT THE R7 GATE 2026-09-05, Porter** — the draft pack is RELAYED to the owner; 4 decisions on his desk (entries as drafted · 2 titles · 1 intro numeral), 3 of them a tick on an SA default. **AC-g unticked and TASK-017 `BLOCKED` until his approved text + date are recorded** in requirements/REQ-003-portfolio-content-refresh.md §R7 approval record | **Human (R7 approval)** |

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-001 | Token layer + fonts + dark-only mount | SPEC-001 | DONE 2026-08-30, Sober — see tasks/TASK-001-token-layer-fonts-dark-only.md §Review | — | — |
| TASK-002 | Shared primitives + quotes content | SPEC-001 | DONE 2026-08-30, Sober — see tasks/TASK-002-shared-primitives-and-quotes.md §Review | — | TASK-001 |
| TASK-003 | Shell rebuild (header, footer, eyebrow) | SPEC-001 | DONE 2026-08-30, Sober — FQ3/FQ4/FQ5 answered; drawer check carried to TASK-005 #18-19; see tasks/TASK-003-shell-rebuild.md §Review | — | TASK-001 |
| TASK-004 | Home rebuild — four sections | SPEC-001 | DONE 2026-08-30, Sober — FQ8 answered (min-height is a floor); 2 boxes carried to TASK-005 c16/c20; see tasks/TASK-004-home-rebuild.md §Review | — | TASK-002, TASK-003 |
| TASK-005 | Acceptance sweep before handover | SPEC-001 | DONE 2026-08-30, Sober — FQ9-FQ12 answered, c20(a) text corrected; see tasks/TASK-005-acceptance-sweep.md §Review | — | — |
| TASK-006 | Token + theme step-up layer | SPEC-002 | DONE 2026-09-02, Sober — FQ13-FQ18 answered; Modal skin stays UNVERIFIED (SQ7) — see tasks/TASK-006-token-theme-step-up-layer.md §Review | — | — |
| TASK-007 | Shared step-up devices + RouteHero | SPEC-002 | DONE 2026-09-02, Sober — gate met (D1 contributes 0, worst L 0.04116); edits + paint order + tsc re-verified by me; FQ21→TASK-008, FQ23→QA stay unticked — see tasks/TASK-007-shared-step-up-devices.md §Review | — | TASK-006 |
| TASK-008 | About + Services rebuild (incl. q3, q1, FQ21 heading fix) | SPEC-002 | DONE 2026-09-04, Sober — A1-A5/B1-B5 verified in the real tree, close-out diff is the 1 CSS line, scope provable by git (`46aef59` = exactly the 12 files); SQ7 §4 + DEF-1 correctly left alone — see tasks/TASK-008-about-services-rebuild.md §Review | — | TASK-007 |
| TASK-009 | Portfolio + Blog rebuild | SPEC-002 | DONE 2026-09-04, Sober — scope/tsc/`use client`-identity/greps/P2/P4 re-verified by me in the tree; FQ28-FQ30 answered; SQ7 + FQ30 stay UNVERIFIED into TASK-011 — see tasks/TASK-009-portfolio-blog-rebuild.md §Review | — | TASK-007 |
| TASK-010 | Contact rebuild + FQ14/FQ17/FQ18 theme follow-ups | SPEC-002 | DONE 2026-09-04, Sober — round 2: theme diff = 4 hunks, both resolvers HEAD-identical, tsc+2 greps re-run by me, T3 blast radius checked in Mantine's own CSS; 4 UNVERIFIED carried to TASK-011 §7 + SQ8 — see tasks/TASK-010-contact-rebuild-theme-followups.md §Review | — | TASK-007 |
| TASK-011 | Site-wide acceptance sweep (six routes) | SPEC-002 | DONE 2026-09-04, Sober — 0 files changed re-verified (20+`.next.zip`), tsc/greps/`use client`/pkg-diff re-run by me; all 5 findings adjudicated + placed (FQ36 human, FQ37 SQ11, FQ38 SQ12) — see tasks/TASK-011-site-wide-acceptance-sweep.md §Review | — | TASK-008, TASK-009, TASK-010, TASK-012 (all DONE) |
| TASK-012 | DEF-1 — `/about` lightbox thumbnails render 0x0 | DEF-1, inside REQ-002 per SQ10 | DONE 2026-09-04, Sober — 1 file / 1 line; scope + `<span>` + import graph + `tsc` re-verified by me, rendered A/B closes my §Diagnosis limit; modal (FQ35) + painted pixel stay UNVERIFIED — see tasks/TASK-012-image-lightbox-thumbnail-collapse.md §Review | — | none by file |
| TASK-013 | DEF-2 — Home hero must fit above the fold at 360x740 | SPEC-002 (owner Q23) | **DONE** 2026-09-05, Sober — scope/diff/tsc re-verified by me; >=48em frozen structurally (the whole diff is one `max-width:47.99em` block); FQ39 answered (mobile lead stays 17px); AC3 still ticks on QA H8 only — see tasks/TASK-013-def2-home-hero-mobile-fold.md §Review | — | none |
| TASK-014 | DEF-3 — visible scroll signal on the `/services` table | SPEC-002 (owner Q24) | **DONE** 2026-09-05, Sober — FQ40 ruled (rule now in SPEC-002), FQ41 → SQ13; both carries settled by TEST-005 — see tasks/TASK-014-def3-services-table-scroll-affordance.md §Review | — | none |
| TASK-015 | Remove the dead `ColorSchemeToggle` + its `ui` barrel re-export | SPEC-002 (owner AC7) | **DONE** 2026-09-05, Sober — 3 paths, greps 0/0, `forceColorScheme` 3, zero `use client` in `ui`, tsc 0, all re-run by me; FQ42 confirmed (my DoD wording was wrong), FQ43 ruled (SQ11 lead struck, no follow-up task); AC7 still QA — see tasks/TASK-015-remove-dead-colorscheme-toggle.md §Review | — | none |

| TASK-016 | Source read + draft pack for the two new entries | SPEC-003 | **DONE** 2026-09-05, Sober — ids/type/links/SKILL_GROUPS/greps/`git status` re-run by me + 10 citations re-read at 2 re-cloned pinned SHAs (10/10 exact); FQ44/FQ46 ruled (no owner question), FQ45 corrected (Entry 1 IS a real disagreement); approval sheet = 4 lines, 3 of them a tick — see tasks/TASK-016-source-read-and-draft-pack.md §Review | — | none |
| TASK-017 | Place the approved entries + the `/portfolio` intro numeral | SPEC-003 | **BLOCKED** (waiting: Human via Porter — the R7 approval record in REQ-003) | Fern | TASK-016 + approval record |

## QA / Tests

| ID | Title | Source REQ | Status | Tester |
|----|-------|------------|--------|--------|
| TEST-001 | REQ-001 Home acceptance — independent QA round | REQ-001 | TEST_PASSED 2026-09-02, Tanya — partial closed; every quote on / is R5-exact — see tests/TEST-001-req001-home-acceptance.md §Confirm-tick round | Tanya |
| REGRESSION | Standing site regression checklist | — | OPEN 2026-09-05, Tanya — 24 checks, **23 PASS**: S11 now PASSES on the build (TEST-003), which also adds build legs to S6/S12/S13. **H5 alone is NOT_TESTED** and stays so per QQ8 — see tests/REGRESSION.md | Tanya |
| TEST-002 | SQ7 repro — do Modal + Drawer ever open? | REQ-002 (defect predating it) | CANNOT_REPRODUCE 2026-09-03, Tanya — verdict accepted as written by Porter; QQ1/QQ2/QQ3 all answered 2026-09-03 — see tests/TEST-002-sq7-modal-drawer-repro.md §Questions | Tanya |
| TEST-003 | The BUILD round — SQ7 triggers, S13 and S11 on a `npm run build` output | REQ-002 AC8 | **TEST_PASSED 2026-09-05, Tanya** — 13/13, 0 defects; **S11 PASSES** (build exit 0, no error/warning line), 12/12 loads console-clean; **QQ10 ANSWERED, Porter** (→ owner as Q26) — see tests/TEST-003-sq7-build-round.md |
| TEST-004 | REQ-002 site-wide acceptance round (full REGRESSION re-run + R9 sweep + the 7 SQ8 eyes) | REQ-002 | **TEST_FAILED 2026-09-05, Tanya** — AC6 PASS (0/96 R9 hits, six routes); AC3 partial (H8 FAIL = DEF-2, H5 + S11 NOT_TESTED); new DEF-3; DEF-1 closed; all 7 eyes answered, SQ12 settled — see tests/TEST-004-req002-site-wide-acceptance.md | Tanya |
| TEST-005 | REQ-002 closing round — H8, S14, the five-route AC7 look, `/services` at 1280, arrow keys | REQ-002 | **TEST_PASSED 2026-09-05, Tanya** — 5/5 pass, 0 new defects; AC3 + AC7 tick, DEF-2 + DEF-3 closed, both TASK-014 carries settled; QQ8 (H5) + QQ9 (OBS-5) open for Porter — see tests/TEST-005-req002-closing-round.md | Tanya |

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| ~~REQ-002 AC7~~ — **TICKED 2026-09-05** by TEST-005 check 3 | — (nothing) | 0 colour-scheme controls on all five non-Home routes, desktop + mobile + inside the open drawer; header holds only the burger. Now REGRESSION **S15** — see tests/TEST-005-req002-closing-round.md |
| ~~REQ-002 AC6~~ — **TICKED 2026-09-05** by TEST-004; QQ4-QQ7 all answered by Porter | — (nothing) | R9 clean: 0/96 text + 0/96 source, six routes, both viewports — see requirements/REQ-002-...md §TEST-004 intake |
| ~~DEF-2 — Home hero at 360x740~~ — **CLOSED 2026-09-05** by TEST-005 check 1 | — (nothing) | **REGRESSION H8 PASSES**: all six parts above the fold with 49px to spare (CTA 2 600–644, quote 664–691, fold 740). **AC3 ticked** — see tests/TEST-005-req002-closing-round.md |
| ~~DEF-3 — `/services` table at 360~~ — **CLOSED 2026-09-05** by TEST-005 checks 2, 4, 5 | — (nothing) | **REGRESSION S14 PASSES** (8px scrollbar + directional edge shadow, both seen). Both TASK-014 carries settled: `/services` at 1280 now **seen** and fine; arrow keys work, scroller is the 4th Tab stop (new S16) — see tests/TEST-005-req002-closing-round.md |
| REGRESSION H5 — unrunnable as written (no baseline exists anywhere QA may read) | **Human (Q25)** only — QQ8 answered | **QQ8 answered 2026-09-05, Porter: do NOT rewrite; H5 stays `NOT_TESTED` and REGRESSION says so.** The (a)/(b) pick IS Q25 and only the owner may make it — see log/2026-09-05.md |
| ~~REGRESSION S11 = REQ-002 **AC8**'s open half~~ — **CLOSED 2026-09-05** by TEST-003 | — (nothing) | **S11 PASSES**: `npm run build` exit 0, zero error and zero warning lines, 10/10 pages; the built output then served all six routes clean at both viewports. AC8's build half is met by measurement — the tick is Porter's — see tests/TEST-003-sq7-build-round.md |
| **Q26** (new 2026-09-05, was QQ10 — ANSWERED) | Human (owner) | DATA REQUEST, non-blocking: which surface his droplet serves — `next start` or `node .next/standalone/server.js`. QA ran both and they agreed, so AC8 ticked either way; it only decides what future rounds mirror — see requirements/REQ-002-...md §Questions Q26 |
| **OBS-5 / SQ13 overlap** (new 2026-09-05) — the `/services` scroller is 1156px tall on a 740px phone, so its scrollbar is off-screen while the visitor reads the top of the table | Human (owner), **inside SQ13** — QQ9 answered | **QQ9 answered 2026-09-05, Porter: it rides with SQ13** (one fact, one owner, one question); stays in TEST-005 only, no separate QA note. Not a defect, not blocking — see log/2026-09-05.md |
| REQ-001 carry-forward items | Human (owner) | 6 non-blocking calls survive DELIVERED: B, C, D, F, G, H — see requirements/REQ-001-ui-visual-redesign.md §Delivery |
| ~~N5 / REQ-003 — Q20/Q21/Q22/Q27~~ — **UNBLOCKED 2026-09-05** by his four answers | — (nothing) | Publish permitted for both projects, team drafts, he approves every entry (R7); REQ-003 is `READY_FOR_SA` and Sober may start — see requirements/REQ-003-portfolio-content-refresh.md §His answers |
| **SPEC-003 SQ14 / SQ15 / SQ16** (new 2026-09-05) — three SA notices; **SQ15 + SQ16b RELAYED 2026-09-05 inside the R7 sheet** (decisions 4, 2 and 3), SQ14 relayed as FYI | Human (owner) | SQ14 no screenshot ships (no image slot; R5) so Q29 cannot bite this REQ · SQ15 `/portfolio` intro numeral "Nine"→the real count, sentence untouched · SQ16 new entries placed first + he picks the name if sources disagree — **SQ16b now carries an SA default per title (2026-09-05), so each pick is a tick, not an open question** — see specs/SPEC-003-portfolio-content-refresh.md §Questions + tasks/TASK-016-…md §Review §4 |
| **REQ-003 R7 approval gate** — **RELAYED 2026-09-05, Porter; now the owner's only** | **Human (owner)** | 4 decisions on his desk, 3 a tick on an SA default: entries as drafted · Entry 1 title (default `Learning Curve`) · Entry 2 title (default `Ong Match`) · intro numeral (default `Eleven projects, and what each one had to solve`). His answer → Porter records the exact text + date in REQ-003 §R7 approval record (= AC-g) → TASK-017 unblocks — see requirements/REQ-003-portfolio-content-refresh.md §R7 approval gate |
| REQ-003 **Q22-b / Q28 / Q29** (new 2026-09-05) — all NON-blocking | Human (owner) | Q22-b dates + result per project · Q28 keep or remove the old `/portfolio` entries (default: keep) · Q29 screenshots showing other people's data (default: not published, R8) — see requirements/REQ-003-portfolio-content-refresh.md §Questions |
| SPEC-002 SQ1-SQ6 | Porter (PM) | 6 SA notices, none blocking — SQ2 updated 2026-09-02: ordinals ALREADY ship on /portfolio + Home, so existing ones are kept and no new one is added until he answers — see specs/SPEC-002-site-wide-step-up-five-routes.md §Questions |
| SPEC-002 SQ7 — scope half only (the "never opens" claim did not reproduce) | Human (owner) → then Sober | STILL UNANSWERED, and REQ-002 went `DELIVERED` 2026-09-05 with the modal *look* UNVERIFIED — his sign-off is where he answers it; the gate-lift itself is Sober's — see requirements/REQ-002-...md §Questions SQ7 |
| ~~TEST-002 DEF-1 / SQ10~~ — CLEARED 2026-09-04 | — (nothing) | Owner answered `SQ10=รวมใน REQ-002`: the repair ships inside REQ-002, no separate defect REQ. TASK-012 unblocked — see requirements/REQ-002-whole-site-step-up-five-routes.md §Questions DEF-1 |
| SPEC-002 SQ8 — opening-block heights + the QA eye checks | Human (heights/FQ29) only | **All 7 eyes answered 2026-09-05 by TEST-004** (all seven positive; `/services` = the missing 5th height, 742.59 / 371.52). Heights + FQ29 remain the owner's — see tests/TEST-004-req002-site-wide-acceptance.md §The 7 SQ8 eye checks |
| SPEC-002 SQ11 — `/blog` + `/portfolio` ship ~123 kB more First Load JS than HEAD | Porter (PM) → human | **Named lead FALSIFIED 2026-09-05** by TASK-015 build A/B; no replacement cause named, no follow-up task. Non-blocking; the ask is unchanged and still the owner's — see specs/SPEC-002-site-wide-step-up-five-routes.md §Questions SQ11 |
| SPEC-002 **SQ13** (new 2026-09-05) — `/services` is 1156px tall on a phone, one column beside ~530px of empty rows | Porter (PM) → human, **after** he sees the DEF-3 fix | NOT a defect and NOT blocking: DEF-3 is fixed as asked. The layout underneath is scope, so it is the owner's call whether the phone layout gets rethought later — see specs/SPEC-002-site-wide-step-up-five-routes.md §Questions SQ13 |
| SPEC-002 SQ12 — **settled 2026-09-05 by TEST-004's 6th eye** | Porter (PM) → human | SETTLED 2026-09-05: there IS a visible focus indicator (Sober's read correct, Fern's was taken unfocused). Left with the owner: is a 1px border change enough under WCAG 2.4.7 — see tests/TEST-004-req002-site-wide-acceptance.md §The 7 SQ8 eye checks |
| SPEC-002 SQ9 — the lattice will no longer read behind Home's hero or a route's opening block | Porter (PM) → human (owner) | Non-blocking, SA already decided it (aurora is the ground where it paints). Only a decision if the owner dislikes the look — see specs/SPEC-002-site-wide-step-up-five-routes.md §Questions SQ9 |
| REQ-002 **Q18** (Q19 is closed) | Human (owner) | Q18 still open: AI/robotic/IoT = visual only, or also positioning in words? Non-blocking. **Q19 CLOSED 2026-09-05 `เอาออก`** — the five routes lose the toggle too — see requirements/REQ-002-whole-site-step-up-five-routes.md §Questions Q19 |
| REQ-002 label-recipe casing (FYI, not a question) | Porter (PM) → human | **14** visible labels change letter case (8 `/about`, 3 `/services`, +3 `/contact` added 2026-09-04) — no source string touched; an intended, SA-owned consequence of the label recipe. Rule now in SPEC-002 §Retired patterns — see tasks/TASK-010-...md §Questions FQ31 |
| SQ7 gate — does TEST-002's cannot-reproduce lift it? | Sober (SA), via Porter | **TEST-003 is now DONE and the gate is still untouched**: overlays open, paint and close on the build too, but the modal/drawer **look** was explicitly not ticked by QA — see tests/TEST-003-sq7-build-round.md §Scope |
