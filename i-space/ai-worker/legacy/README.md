# legacy/ — the old team's memory (Blueprint + CAW, built by an earlier AI desk)

> Created 2026-10-29 by Marie (ORDER 39). Docs filed 2026-10-29 by Marie (ORDER 40) under
> `intelligence-space/` — **read "What arrived / the gap" at the bottom first: no old
> SPEC/REQ/DECISIONS text arrived.**

## What will go here

- The old team's **SPEC / REQ / DECISIONS**, copied in **verbatim** — no paraphrase, no
  renumbering — per the owner, 2026-10-29 00:19 (via Atom):
  *"ให้ย้ายสเปคกับการตัดสินใจของทีมเก่าตามนั้นมาเลย"*.
- Source: the old desk's folder `~/Develyst/intelligence-space` on the owner's machine (one plan
  file in the code points at its `docs/`). It is **not on this box**, and no branch of this
  workspace holds it. Atom brings it; a later order imports it here.
- Until then the code itself is the only record of what the old IDs mean.

## The old IDs are kept as they are

The code cites them in comments and tests, so they are never renamed and never reused. Ranges
cited in the four repos on branch `atom` (Marie, `git grep` 2026-10-29; lockfiles and
`openapi.json` excluded):

| Series | Range cited in the code | Notes |
|---|---|---|
| `REQ-NNN` | REQ-001 … REQ-017 | REQ-006 not cited |
| `SPEC-A-NNN` | SPEC-A-001 … SPEC-A-009 | spans all four repos (backs and seam) |
| `SPEC-B-NNN` | SPEC-B-001 … SPEC-B-005 | both fronts (themes, overlays); 004 not cited |
| `SPEC-C-NNN` | SPEC-C-001 … SPEC-C-006 | blueprint-front screens, caw-back runner settings; 005 not cited |
| `TASK-A-NNN` | TASK-A-001 … TASK-A-096 | gaps |
| `TASK-B-NNN` | TASK-B-001 … TASK-B-121 | gaps |
| `TASK-C-NNN` | TASK-C-002 … TASK-C-048 | gaps |
| `D-NNN` | D-003 … D-112 | decisions; gaps |
| `STUDY-NNN` | STUDY-001 … STUDY-002 | |

Not cited anywhere: unlettered `SPEC-NNN` / `TASK-NNN`, `TEST-NNN`. The old folder may hold
numbers the code does not cite, so the true ranges can be higher — the import will tell.

## New desk IDs — start at 101, no team letter

- **Every new number on this desk starts at 101:** `REQ-101`, `SPEC-101`, `TASK-101`,
  `TEST-101` (and `D-201` if the desk ever numbers decisions — `DECISIONS.md` lines are dated,
  not numbered).
- **No team letter in new IDs.** The template's multi-team form (`SPEC-A-NNN`, `TASK-A-NNN`)
  would collide head-on with the old series above, which are *spec series by repo*, not teams.
  Both teams share one `SPEC-NNN` / `TASK-NNN` sequence, as smart-scheduler does (`TEAMS.md`).
- Why 101 and not 018: REQ-017 is the highest REQ the code cites, but the old folder is not here
  to check, so 101 leaves a clear margin and reads as "new desk" at a glance.
- When citing an old ID in a new file, write it as it is (`SPEC-A-008`, `D-105`, `REQ-014`) and,
  where it could be misread, add "(old team)".

## What arrived / the gap (2026-10-29)

Atom copied the old team folder from the owner's Mac (Atom's note 2026-10-29 00:40). Marie filed
it here **byte-exact** (each copy checked with `cmp`; macOS `._*` resource-fork files skipped),
keeping the relative paths, under `intelligence-space/`:

| File | Bytes | What it is |
|---|---|---|
| `docs/specs/2026-10-08-blueprint-design.md` | 18699 | Blueprint design spec — opens with a **PARTLY SUPERSEDED** box (Atlas, 2026-10-09) |
| `blueprint-back/docs/superpowers/plans/2026-10-08-blueprint-back-foundation.md` | 26718 | blueprint-back foundation plan (1 of 4) — marked **SUPERSEDED, do not execute** (Atlas, 2026-10-09) |
| `blueprint-back/README.md` | 16 | title only |
| `blueprint-front/README.md` | 17 | title only |
| `caw-back/README.md` | 10 | title only |
| `caw-front/README.md` | 2293 | how to run caw-front and the four apps together |

That is all of it — only md files. **No `ai-worker/` folder exists on the Mac** (Atom 00:40).

**The gap.** The old desk's `REQ-001…017`, `SPEC-A/B/C-…`, `TASK-A/B/C-…`, `D-003…112` and
`STUDY-001…002` (ranges in the table above) exist **only as citations in the code**. Their texts
were not found on the owner's Mac (Atom 00:40). The design spec above cites the old desk's
`DECISIONS.md`, `REQ-001` and `SPEC-A-001` as binding — those files did not arrive either.

**Rule for the team:**
- When the code cites an old ID, **the code and its comments are the only evidence** of what it
  meant. **Never invent or reconstruct the old text.**
- A design question that needs the old text goes **to the owner through the PM**.
- The design spec and the plan are **history, not instructions**: where they carry a
  SUPERSEDED / history note, that note wins. Never execute the plan.
