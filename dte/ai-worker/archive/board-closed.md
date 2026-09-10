# Board archive — closed rows, dte

> Swept off `board.md` by Porter (PM) in the housekeeping hop of **2026-09-09**,
> because the hygiene gate said the live board must carry CURRENT state only
> (11 closed rows on a live board, and one of them over the 300-char cell cap).
> **Every row below is byte-verbatim from the board** — nothing was reworded,
> shortened or dropped.
>
> A row here is closed, not deleted: its detail always lived in the TASK / REQ /
> SPEC file the row points at, and those files are untouched.

## Requirements — DELIVERED (1)

| ID | Title | Priority | Status | Owner of next step |
|----|-------|----------|--------|--------------------|
| REQ-004 | Replace the superseded product name "Disrupt Thai Education" everywhere | MEDIUM | **DELIVERED** — 2026-09-08, Porter · all 6 ACs met; AC 5's owner half closed `Q4=ผ่าน` (A33); DELIVERED ≠ deployed — see `requirements/REQ-004-product-name-rename-everywhere.md` §"Porter's acceptance check" | **nobody — closed** |

## Tasks — DONE (10)

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-001 | Upgrade `front/` — Next 15→16 + Tailwind 3→4 | SPEC-001 | **DONE** — reviewed 2026-09-07, Sober · Q1–Q4 answered; 3 UNVERIFIED items accepted and owed to the owner's eyes — see `tasks/TASK-001-next16-tailwind4-upgrade.md` §Review | FE (Fern) — closed | none |
| TASK-002 | Folder skeleton + `FRONTEND-CONVENTIONS.md` + no-emoji harness | SPEC-001 | **DONE** — reviewed 2026-09-07, Sober · Q1–Q3 answered, 6 DoD checks re-run by me, 3 UNVERIFIED accepted; its git finding **struck 2026-09-07** per A23 — see `tasks/TASK-002-folder-skeleton-conventions-emoji-harness.md` §Review | FE (Fern) — closed | TASK-001 ✅ |
| TASK-003 | Install Ant Design v6 + registry, theme-token bridge, first 2 `ui/` wrappers | SPEC-001 | **DONE** — reviewed 2026-09-08, Sober · no rework; Q1–Q4 answered, 13 DoD checks re-run by me, 1 UNVERIFIED carried (compressed bundle delta) — see `tasks/TASK-003-antd-install-and-theme-bridge.md` §Review | FE (Fern) — closed | TASK-002 ✅ |
| TASK-011 | Product-name rename in `front/` — 3 occurrences, 2 files (`metadata` only) | SPEC-002 | **DONE** — reviewed 2026-09-08, Sober · no rework; em dash re-verified as bytes, `tsc` + emoji harness (124) re-run by me, Q1 answered → SPEC-002 Q5 — see `tasks/TASK-011-rename-product-name-front.md` §Review | FE (Fern) — closed | none |
| TASK-012 | Product-name rename in `back/` — 7 occurrences, 6 files (Swagger + AI prompt) | SPEC-002 | **DONE** — reviewed 2026-09-08, Sober · no rework; all 7 substitutions + banner width re-verified by me, `/docs` browser evidence accepted, no DB touched; Q1 answered (banner is pre-existing, no TASK) — see `tasks/TASK-012-rename-product-name-back.md` §Review | BE (Jason) — closed | none |
| TASK-013 | Product-name rename in the repo-root `README.md` — 1 line (Rule S, whole sentence) | SPEC-002 | **DONE** — reviewed 2026-09-08, Sober · no rework; literal re-read as bytes, one line changed, enumeration re-run by me; Q1 answered (pre-existing U+FFFD → no TASK) — see `tasks/TASK-013-rename-product-name-readme.md` §Review | BE (Jason) — closed | none |
| TASK-014 | Remove 4 inherited routes + 2 data files + 4 links; add `redirects()` to `/` | SPEC-003 | **DONE** — reviewed 2026-09-09, Sober · no rework; all 8 DoD checks re-run by me (build 0, `tsc` 0, four 307s, `/blog/` 2 hops, kept 200, 3 greps empty, emoji 124), Q1 answered → SPEC-003 §Flow corrected; 3 UNVERIFIED accepted — see `tasks/TASK-014-remove-inherited-portfolio-routes.md` §Review | FE (Fern) — closed | none |
| TASK-015 | Unify the page titles — root `title.template` + `/`, `/about`, `/courses` (4 edits) | SPEC-004 | **DONE** — reviewed 2026-09-09, Sober · no rework; 10 DoD checks re-run, Q1 answered, 3 UNVERIFIED carried — see `tasks/TASK-015-unify-page-titles-front.md` §Review | FE (Fern) — closed | none |
| TASK-016 | Part B page titles — 4 new pass-through `layout.tsx` for `/login` `/register` `/teach` `/verify-email` | SPEC-004 | **DONE** — reviewed 2026-09-09, Sober · no rework; all 12 DoD checks re-run by me, Q1+Q2 answered (both defects mine), 4 UNVERIFIED carried — see `tasks/TASK-016-part-b-page-titles-four-client-routes.md` §Review | FE (Fern) — closed | TASK-015 ✅ |
| TASK-017 | Part B's 5th route — one pass-through `layout.tsx` for `/classroom/[id]` (`ห้องเรียน`) | SPEC-004 | **DONE** — reviewed 2026-09-09, Sober · no rework; all 14 DoD re-run by me (A37 byte-match, build 0, tsc 0, 8/8 titles live, 3 ids 200 + identical, `/` pipe-free, 14 `DTE Platform`, emoji 124, mtimes = 1 file); Q1+Q2 answered (Q2's defect mine); 3 UNVERIFIED carried — see `tasks/TASK-017-classroom-page-title.md` §Review | FE (Fern) — closed | TASK-016 ✅ |

## Requirements — DELIVERED (1) — swept 2026-09-09 (second housekeeping hop)

| ID | Title | Priority | Status | Owner of next step |
|----|-------|----------|--------|--------------------|
| REQ-005 | Unify the browser page titles across the whole site | LOW | **DELIVERED** — 2026-09-09, Porter · all 6 AC MET on evidence; 3 UNVERIFIED carried, none blocking — see `requirements/REQ-005-unify-page-titles-site-wide.md` §"Porter's acceptance check (2026-09-09)" | **none** — closed |

## Tasks — DONE (6) — swept 2026-09-09 (second housekeeping hop)

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-004 | Migrate the `/login` screen — partial extraction, `ui/` antd wrappers (+ a new `ui/Checkbox`), 5 emoji → icons, `alert()` → antd `message` | SPEC-001 | **DONE** — reviewed 2026-09-09, Sober · its look is an **interim state, not the reference**; re-authored in SPEC-006 Phase 3 — see `tasks/TASK-004-login-screen-migration.md` §Review addendum (third) | FE (Fern) | TASK-003 (`DONE`) |
| TASK-005 | The `/` (home) screen — SPEC-001 migration **+** the first visual pass (spacing + colour, modern), 7 Heroicons → lucide, 5 emoji → icons | SPEC-006 (+ SPEC-001 §Decision 9) | **DONE** — reviewed 2026-09-09, Sober · 5 of 9 DoD re-run by me, no rework; all 4 Questions answered, Q2/Q3/Q4 → TASK-020; 1 UNVERIFIED carried — see `tasks/TASK-005-home-screen-migration-and-visual-pass.md` §Review | FE (Fern) | TASK-003 (`DONE`) |
| TASK-006 | `/courses` (SPEC-006 **Phase 2**) — extract to `partials/Courses/`, 4 Heroicons → lucide, 3 emoji + 2 `→` → icons, the full visual pass incl. the card interior | SPEC-006 | **DONE** — reviewed 2026-09-09, Sober · 5 of 11 DoD re-run by me + a line-by-line read, no rework; both §Questions answered (Q1 → new §R-COLOUR-7, Q2 → keep full-width); 2 UNVERIFIED carried — see `tasks/TASK-006-courses-screen-migration-and-visual-pass.md` §Review | FE (Fern) | TASK-005 + TASK-020 (both `DONE`) |
| TASK-018 | Replace `DTE Platform` → `DTE` on 5 body-copy lines in 4 files (`/about` ×2, `/login`, `/register`, `/teach`) | SPEC-005 | **DONE** — reviewed 2026-09-09, Sober · all 14 DoD re-run by me (own server 3041, id 42), no rework — see `tasks/TASK-018-replace-dte-platform-body-copy.md` §Review | FE (Fern) | none |
| TASK-019 | Measure the antd shared-chunk cost **compressed** (gzip + Brotli), A/B on today's tree | SPEC-001 §Decision 6 | **DONE** — reviewed 2026-09-09, Sober · every number re-run by me (own server 3053, State A reproduced byte-identically), no rework — see `tasks/TASK-019-antd-shared-chunk-compressed-measurement.md` §Review | FE (Fern) | none |
| TASK-020 | `/` (home) — the three SPEC-006 §Rulings: real band background, theme-scoped `--color-primary-strong`, badge text on `--text-inverse` | SPEC-006 §Rulings | **DONE** — reviewed 2026-09-09, Sober · 7 of 10 DoD re-run by me + all 4 ratios recomputed + production CSS bundle checked, no rework; 1 UNVERIFIED (band painted) — see `tasks/TASK-020-home-look-rulings.md` §Review | FE (Fern) | TASK-005 (`DONE`) |
