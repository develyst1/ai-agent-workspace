# Board archive — closed rows, portfolio-nichaphon

> Swept off `board.md` by Porter (PM) in the housekeeping hop of **2026-09-05**,
> because the hygiene gate said the live board must carry CURRENT state only.
> **Every row below is byte-verbatim from the board** — nothing was reworded,
> shortened or dropped. The pre-sweep board is also kept whole at
> `archive/board-2026-09-05-precompaction-2.md`.
>
> A row here is closed, not deleted: its detail always lived in the TASK / REQ /
> SPEC / TEST file the row points at, and those files are untouched.

## Requirements — DELIVERED (3)

> All three are DELIVERED by Porter and **still awaiting the owner's sign-off**;
> that pending sign-off stays on the live board as one Blocked/waiting row.

| ID | Title | Priority | Status | Owner of next step |
|----|-------|----------|--------|--------------------|
| REQ-001 | Visual identity rebuild — Home page first | HIGH | DELIVERED 2026-09-02, Porter — 11/11 AC ticked, 5/5 TASKs DONE, TEST-001 PASSED; B/C/D/F/G/H + N4/N5 carried forward, not closed — see requirements/REQ-001-ui-visual-redesign.md §Delivery | Human (sign-off) |
| REQ-002 | Whole-site visual step-up (AI/robotic/IoT) + the five remaining routes | HIGH | **DELIVERED 2026-09-05, Porter** — 8/8 AC ticked (AC3+AC7 on TEST-005, AC8 on TEST-003), 10/10 TASKs DONE; carries SQ7-look/H5-Q25/Q18/SQ8-SQ13/Q26 survive and are NOT closed — see requirements/REQ-002-whole-site-step-up-five-routes.md §Delivery | Human (sign-off) |
| REQ-003 | Portfolio content refresh — his real projects on the site (N5) | HIGH | **DELIVERED 2026-09-05, Porter** — 8/8 AC ticked (AC-d on TEST-006), 2/2 TASKs DONE; not a deploy, not his sign-off; **Q28 + OBS-8 ANSWERED 2026-09-05** (OBS-8 → REQ-004), Q22-b/Q29 still survive — see requirements/REQ-003-portfolio-content-refresh.md §Delivery. **FILE IS 53 BYTES FROM THE 45KB CAP — consolidate before any further write** | Human (sign-off) |

## Tasks — DONE (18)

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
| TASK-016 | Source read + draft pack for the two new entries | SPEC-003 | **DONE** 2026-09-05, Sober — see tasks/TASK-016-source-read-and-draft-pack.md §Review | — | none |
| TASK-017 | Place the approved entries + the `/portfolio` intro numeral | SPEC-003 | **DONE** 2026-09-05, Sober — shipped strings **24/24 character-exact** vs the approved DRAFT-001, re-derived by Sober; scope 2 files, tsc 0; modal pixels UNVERIFIED (QA) — see tasks/TASK-017-place-approved-project-entries.md §Review | — | TASK-016 (DONE) + approval record (RECORDED 2026-09-05) |
| TASK-018 | Pin the project modal's footer to the modal's foot | SPEC-004 | **DONE** 2026-09-05, Sober — scope/diff/tsc 0/build 0 (0 error, 0 warn) re-run by me, and **the six properties survive minification in the built CSS**; neutrality now proven by construction too (one token in 3 places); FQ47 answered + SPEC arithmetic corrected, FQ48 → SQ21 — see tasks/TASK-018-pin-project-modal-footer.md §Review | — | none |

## Blocked / waiting — rows that closed (12)

> Struck through on the live board when they closed; swept here 2026-09-05.

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| ~~REQ-002 AC7~~ — **TICKED 2026-09-05** by TEST-005 check 3 | — (nothing) | 0 colour-scheme controls on all five non-Home routes, desktop + mobile + inside the open drawer; header holds only the burger. Now REGRESSION **S15** — see tests/TEST-005-req002-closing-round.md |
| ~~REQ-002 AC6~~ — **TICKED 2026-09-05** by TEST-004; QQ4-QQ7 all answered by Porter | — (nothing) | R9 clean: 0/96 text + 0/96 source, six routes, both viewports — see requirements/REQ-002-...md §TEST-004 intake |
| ~~DEF-2 — Home hero at 360x740~~ — **CLOSED 2026-09-05** by TEST-005 check 1 | — (nothing) | **REGRESSION H8 PASSES**: all six parts above the fold with 49px to spare (CTA 2 600–644, quote 664–691, fold 740). **AC3 ticked** — see tests/TEST-005-req002-closing-round.md |
| ~~DEF-3 — `/services` table at 360~~ — **CLOSED 2026-09-05** by TEST-005 checks 2, 4, 5 | — (nothing) | **REGRESSION S14 PASSES** (8px scrollbar + directional edge shadow, both seen). Both TASK-014 carries settled: `/services` at 1280 now **seen** and fine; arrow keys work, scroller is the 4th Tab stop (new S16) — see tests/TEST-005-req002-closing-round.md |
| ~~REGRESSION S11 = REQ-002 **AC8**'s open half~~ — **CLOSED 2026-09-05** by TEST-003 | — (nothing) | **S11 PASSES**: `npm run build` exit 0, zero error and zero warning lines, 10/10 pages; the built output then served all six routes clean at both viewports. AC8's build half is met by measurement — the tick is Porter's — see tests/TEST-003-sq7-build-round.md |
| ~~N5 / REQ-003 — Q20/Q21/Q22/Q27~~ — **UNBLOCKED 2026-09-05** by his four answers | — (nothing) | Publish permitted for both projects, team drafts, he approves every entry (R7); REQ-003 is `READY_FOR_SA` and Sober may start — see requirements/REQ-003-portfolio-content-refresh.md §His answers |
| ~~**REQ-003 R7 approval gate**~~ — **CLOSED 2026-09-05, Porter** by the owner's `อนุมัติ` | — (nothing) | All 4 decisions settled on the SA defaults: entries as drafted · `Learning Curve` · `Ong Match` · `Eleven projects, and what each one had to solve`. **AC-g ticked, TASK-017 unblocked** — see requirements/REQ-003-portfolio-content-refresh.md §R7 approval record |
| ~~**SPEC-003 SQ17**~~ — **CLOSED 2026-09-05, Sober** in his own file | — (nothing) | Closed against the state, not re-put: `ca5c097` sits on `D1` = `origin/D1` = `develop` = `origin/develop`, so no branch choice is left. Survives it, and is NOT SQ17: `main`/`production` do not carry the work and moving it there is **a deploy, the owner's hand** — see specs/SPEC-003-portfolio-content-refresh.md §Questions SQ17 |
| ~~**REQ-003 AC-d**~~ — **TICKED 2026-09-05, Porter** on TEST-006 `TEST_PASSED` | — (nothing) | Both modals seen as pictures at 1280 + 360 on a fresh build; hrefs `https://learning.develyst.online/` + `https://ong.develyst.online/`, `_blank noopener noreferrer`. REQ-003 is now `DELIVERED` — see requirements/REQ-003-portfolio-content-refresh.md §Delivery |
| ~~**QQ11 + QQ12**~~ — **BOTH ANSWERED 2026-09-05, Porter** | — (nothing) | QQ11: git state re-read, SQ17 answered by that state (row above), no role committed. QQ12: **OBS-8 goes to the owner alone, NOT with SQ13** — see requirements/REQ-003-portfolio-content-refresh.md §TEST-006 intake |
| ~~**REQ-003 OBS-8**~~ — **ANSWERED 2026-09-05 by the owner: `ยกปุ่มขึ้น`** (raise the button) | — (nothing) | He picked the "raise it" option he was offered, so it becomes work, not an observation: **REQ-004** (now `IN_SPEC`, row above) carries the measurements (360x740: button top y=1255 / y=1293, modal fold ~703). Q30/Q31/Q32 opened there, all non-blocking — see requirements/REQ-004-portfolio-modal-live-link-button-on-phones.md |
| ~~TEST-002 DEF-1 / SQ10~~ — CLEARED 2026-09-04 | — (nothing) | Owner answered `SQ10=รวมใน REQ-002`: the repair ships inside REQ-002, no separate defect REQ. TASK-012 unblocked — see requirements/REQ-002-whole-site-step-up-five-routes.md §Questions DEF-1 |
