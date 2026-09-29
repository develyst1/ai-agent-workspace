# Board — possibility

> Single source of truth for CURRENT state. Update me at the end of every session
> (see PROTOCOL.md). **File discipline:** detail lives in the TASK/REQ/TEST file;
> a board cell is ONE line (status + date + owner + pointer); a log entry is ≤ 15
> lines. Never paste evidence or keep old text here.

## Project info

- Description: **Possibility** — a platform for taking on freelance / innovation
  work. A user says what they want; the AI analyses it for feasibility, impact
  on society, and how interesting it is. Five user tiers: Ordinary · Seeker ·
  Raw Diamond · Visionary · The Possibility. Everything the owner has said about
  it is in **`SYSTEM-FACTS.md` — read it first, every session.**
- Repos (three, **greenfield**, logical names only — absolute paths in the
  workspace-root `machine.local.md`): `possibility-back` (Jason) ·
  `possibility-front` (Fern) · `possibility-spec` (the owner's requirement repo,
  read-only for every role).
- Stack: **DECIDED 2026-09-18 by the owner** — Bun+Hono · PostgreSQL 18 (shared SIT DB, no local DB) · Next.js 16 + Ant Design · AI via the owner's gateway. Facts in SYSTEM-FACTS §Stack, design in `specs/SPEC-001`.
- Mode: **manual** — one session per role, the owner nudges. Starters in the
  workspace-root `SESSION-STARTERS.md`.
- Environments: apps run locally; **the database is the shared SIT PostgreSQL** (`possibility_db`, owner-supplied `.env`) — no local DB, no production. Rules in SPEC-001 §D8b.
- Team: Porter (PM / BA / PO / UX writer) · Sober (SA) · Jason (BE) · Fern (FE)
  · Tanya (QA). Chain: Human ↔ Porter ↔ Sober ↔ (Jason, Fern); Tanya ↔ Porter.
- Read first: `SYSTEM-FACTS.md`, then `PROTOCOL.md` + your role file, then this
  board, then your inbox, then today's log.
- Desk opened: 2026-09-17 by Marie (workspace operations), on the owner's
  instruction. First session: Porter — turn the owner's intent and
  `possibility-spec` into REQ-001, and raise the open questions in
  `SYSTEM-FACTS.md` §Open questions.

## Requirements

| Id | Title | Priority | Status (date, owner, pointer) | Ball |
|----|-------|----------|-------------------------------|------|
| REQ-001 | User tiers — definitions, discounts, score→tier rule | HIGH | DELIVERED — 2026-09-22, Porter; TEST_PASSED in `tests/TEST-002-user-tiers.md` (AC-7 NOT_TESTED-on-SIT, local evidence) | — |
| REQ-002 | Sign in with Google | HIGH | DELIVERED — 2026-09-21, Porter; TEST_PASSED 18/0/0 in `tests/TEST-001-google-sign-in.md`; AC-5 W-3-on-cancel amended to best-effort (gap recorded) | — |
| REQ-003 | Submit an idea and see the AI analysis | HIGH | DELIVERED — 2026-09-22, Porter; TEST_PASSED in `tests/TEST-003-submit-idea-and-analysis.md` (AC-7/12 NOT_TESTED-on-SIT, local evidence) | — |
| REQ-004 | Hire request + owner’s admin page | HIGH | DELIVERED — 2026-09-23, Porter; TEST_PASSED round 2 on SIT (admin half green); admin-page copy folded into TASK-015 | — |
| REQ-005 | Bilingual UI TH/EN with switch | MEDIUM | IN_SPEC — 2026-09-21, Sober, `specs/SPEC-006-bilingual-ui.md` (rules already built to; TASK-010 sweep after TASK-009) | Fern (after 009) |
| REQ-006 | Email + password sign-up/sign-in (Google stays prominent) | HIGH | DELIVERED — 2026-09-22, Porter; TEST_PASSED round 2 in `tests/TEST-004-email-password-login.md` | — |
| REQ-007 | Visual redesign — "you are the possibility" (dark theme, tier imagery, new tier wording) | HIGH | DELIVERED — 2026-09-22, Porter; TEST_PASSED round 2 in `tests/TEST-005-visual-redesign.md` | — |
| REQ-008 | UI redesign v2 — design first, no photographs | HIGH | REJECTED — 2026-09-25 by the owner (look); superseded by REQ-009. Work not wasted: TASK-015 code is the base and its stage system carries forward | — |
| REQ-009 | UI redesign v3 — redo everything, with an image-request loop | HIGH | SPEC_DONE — 2026-09-26, Sober; B live on every page, IMG-002 placed; **ready to deploy** → AC-1 is the owner’s look verdict, then Tanya | Porter → owner (deploy + judge) → Tanya |

## Tasks

| Id | Title | Source SPEC | Status (date, owner, pointer) | Owner | Depends on |
|----|-------|-------------|-------------------------------|-------|------------|
| TASK-001 | Scaffold `possibility-back` (Bun+Hono+Drizzle, health route) | SPEC-001 | DONE — 2026-09-19, Sober review in `tasks/TASK-001-scaffold-back.md` §Review (db:ok UNVERIFIED → TASK-003) | Jason | — |
| TASK-002 | Scaffold `possibility-front` (Next.js 16 + Ant Design) | SPEC-001 | DONE — 2026-09-20, Sober review in `tasks/TASK-002-scaffold-front.md` §Review | Fern | — |
| TASK-003 | BE users table + Google auth endpoints + session middleware | SPEC-002 | DONE — 2026-09-20, Sober review in `tasks/TASK-003-be-google-auth.md` §Review (real-token line → Tanya via FE) | Jason | TASK-001 ✓ |
| TASK-004 | FE Google button, AuthContext, header, guard | SPEC-002 | DONE — 2026-09-20, Sober review in `tasks/TASK-004-fe-google-sign-in.md` §Review (real Google flow → Tanya after DR-7) | Fern | TASK-002 ✓, TASK-003 ✓ |
| TASK-005 | BE ideas + 5-step AI chain + tier + endpoints | SPEC-003 | DONE — 2026-09-20, Sober review in `tasks/TASK-005-be-idea-analysis-chain.md` §Review (admin-200 line → Tanya/owner via FE) | Jason | TASK-003 ✓ |
| TASK-006 | FE idea box, result page, My ideas | SPEC-003 | DONE — 2026-09-21, Sober review in `tasks/TASK-006-fe-idea-and-result.md` §Review | Fern | TASK-004 ✓, TASK-005 ✓ |
| TASK-007 | FE header tier badge + /me profile | SPEC-004 | DONE — 2026-09-21, Sober review in `tasks/TASK-007-fe-tier-badge-and-profile.md` §Review | Fern | TASK-004 ✓ |
| TASK-008 | BE hire_requests + hire endpoint + admin list/PATCH | SPEC-005 | DONE — 2026-09-20, Sober review in `tasks/TASK-008-be-hire-request-and-admin.md` §Review (real-owner admin cookie → Tanya via FE) | Jason | TASK-005 ✓ |
| TASK-009 | FE hire button + /admin page | SPEC-005 | DONE — 2026-09-23, Sober review in `tasks/TASK-009-fe-hire-button-and-admin-page.md` §Review (admin-as-owner → Tanya on SIT) | Fern | TASK-006 ✓, TASK-008 ✓ |
| TASK-010 | FE bilingual sweep + i18n guard script | SPEC-006 | TODO — 2026-09-26, next FE task after the B rollout is accepted, `tasks/TASK-010-fe-bilingual-sweep.md` | Fern | TASK-021 ✓ |
| TASK-019 | FE message when sign-in cannot reach the server (W-11) | TASK-015 observation | DONE — 2026-09-26, Sober review in `tasks/TASK-019-fe-network-failure-message.md` §Review (Google-callback branch → Tanya on SIT) | Fern | — |
| TASK-020 | FE reference study + result page in 3 directions + IMG batch | SPEC-010 | DONE — 2026-09-26, Sober review in `tasks/TASK-020-fe-three-directions-preview.md` §Review; **ready to deploy (preview route)**; Fern recommends B | Fern | — |
| TASK-021 | FE apply direction B to every page + place IMG-002 | SPEC-010 | DONE — 2026-09-26, Sober review in `tasks/TASK-021-fe-apply-chosen-direction.md` §Review; **ready to deploy** | Fern | TASK-020 ✓ |
| TASK-015 | FE redesign v2: remove photos, StageMark + StageScale + the light | SPEC-009 | DONE — 2026-09-23, Sober review in `tasks/TASK-015-fe-redesign-v2-no-photos.md` §Review (loading + admin copy → Tanya on SIT) | Fern | TASK-009 ✓ |
| TASK-016 | BE admin = ADMIN_EMAILS list (any sign-in method) | SPEC-005 §Amendment | DONE — 2026-09-23, Sober review in `tasks/TASK-016-be-admin-email-list.md` §Review | Jason | — |
| TASK-017 | BE startup diagnosability + `/health` degraded + `bun run doctor` | SIT incident 2026-09-23 | DONE — 2026-09-23, Sober review in `tasks/TASK-017-be-startup-diagnosability.md` §Review | Jason | — |
| TASK-018 | BE quote-tolerant ADMIN_EMAILS + honest gateway health | TASK-017 Q-1/Q-2 | DONE — 2026-09-23, Sober review; **live on SIT 2026-09-25** with TASK-017 in the combined deploy | Jason | TASK-017 ✓ |
| TASK-011 | BE email+password register/login (same session) | SPEC-007 | DONE — 2026-09-22, Sober review in `tasks/TASK-011-be-email-password-login.md` §Review | Jason | — |
| TASK-012 | FE email sign-in/sign-up block under Google | SPEC-007 | DONE — 2026-09-22, Sober review in `tasks/TASK-012-fe-email-password-forms.md` §Review (Enter-to-submit → Tanya) | Fern | TASK-011 ✓ |
| TASK-013 | FE visual redesign (dark theme, imagery, result order, W-3 lines, W-8/W-9) | SPEC-008 | DONE — 2026-09-22, Sober review in `tasks/TASK-013-fe-visual-redesign.md` §Review (3 tier images → Tanya via fixtures) | Fern | — |
| TASK-014 | FE fix DEF-1 (error Alert contrast) + DEF-2 (Thai hero break) | SPEC-008 | DONE — 2026-09-22, Sober review in `tasks/TASK-014-fe-fix-def1-def2.md` §Review (14.16:1 measured) | Fern | — |

## QA / Tests

| REQ | TEST | Status (date, pointer) | Verdict |
|-----|------|------------------------|---------|
| REQ-002 | TEST-001 | TEST_PASSED — 2026-09-21, `tests/TEST-001-google-sign-in.md` | TEST_PASSED — 0 defects; W-3-on-cancel observed not shown, AC-5 amended (gap recorded); REQ DELIVERED |
| REQ-001 | TEST-002 | TEST_PASSED — 2026-09-22, `tests/TEST-002-user-tiers.md` | TEST_PASSED — 7 PASS / 0 FAIL; AC-7 NOT_TESTED-on-SIT (local pointer, Q-2 to Porter) |
| REQ-003 | TEST-003 | TEST_PASSED — 2026-09-22, `tests/TEST-003-submit-idea-and-analysis.md` | TEST_PASSED — 10 PASS / 0 FAIL; AC-7/12 NOT_TESTED-on-SIT (accepted); W-6 Alert re-tokened by TASK-014 (not re-triggered) |
| REQ-006 | TEST-004 | TEST_PASSED — 2026-09-22 round 2, `tests/TEST-004-email-password-login.md` | TEST_PASSED — DEF-1 fixed (14.16:1); gaps stated (hire half → TASK-009, SIT logs on Jason's grep) |
| REQ-007 | TEST-005 | TEST_PASSED — 2026-09-22 round 2, `tests/TEST-005-visual-redesign.md` | TEST_PASSED — DEF-1 + DEF-2 fixed; observation: GIS button now light theme (not an AC) |
| REQ-004 | TEST-006 | TEST_PASSED — 2026-09-23 round 2, `tests/TEST-006-hire-request-and-admin.md` | TEST_PASSED — user side 8/8 + admin half (list, newest-first, expand, steps drawer, contacted toggle persists, non-admin 404) on SIT; DEF-1 (SIT login outage) fixed by owner, verified; gaps: empty-state NOT_TESTED, admin copy mismatch O-3 with Porter |

## Blocked / waiting

| Item | Waiting on | Since | Pointer |
|------|-----------|-------|---------|
| ~~DR-9~~ closed 2026-09-23 — the owner declines the password rotation and accepts the risk; the string is in no file (Porter searched) | — | 2026-09-23 | `tasks/TASK-016-be-admin-email-list.md` §Questions Q-1 |
| DR-5 company reference text (`config/company-reference.md`) — placeholder used until supplied | the owner, via Porter | 2026-09-19 | `specs/SPEC-003-idea-analysis-chain.md` §Chain |
