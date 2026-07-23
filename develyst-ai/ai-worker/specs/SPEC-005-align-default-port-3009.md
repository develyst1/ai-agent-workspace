# SPEC-005: Align server default port to 3009

- Source: REQ-005
- Status: ACTIVE

## Overview

Single-value alignment: make **3009** the one consistent default port across the
code default, `.env.example`, all in-repo docs, and Bruno — removing the 3002/3009
split surfaced in REQ-004. The port is already read from `process.env.PORT`; this
only changes the fallback default and the reference values. No logic change.

## Change set (all in the repo `C:\Users\Admin\develyst\develyst-ai`)

| File | Now | After |
|---|---|---|
| `src/index.ts` | `Number(process.env.PORT) \|\| 3002` | `... \|\| 3009` |
| `.env.example` | `PORT=3002` | `PORT=3009` |
| `README.md` | `3002` in overview note, quickstart `curl`, port note | `3009` |
| `docs/consumer-guide.md` | base URL + every `curl` example `:3002` | `:3009` |
| `CLAUDE.md` (repo) | PORT row states `3002` (corrected under REQ-004) | `3009` (now matches code) |
| `bruno/environments/local.bru` | already `3009` (verify) | `3009` (leave) |

Sweep the whole repo for any other lingering `3002` (e.g. `production.bru`, code
comments) and align. Do **not** touch auth, providers, or web-search logic.

## Non-functional

- Surgical; no behavior change beyond the default value + reference consistency.
- Docs were delivered under REQ-004; updating their port refs here is expected
  (this REQ owns the alignment).
- No secrets involved.

## Tasks

- TASK-008: Align default port to 3009 across code + example + docs + Bruno.
  Depends on: —

## Questions

(Jason asks here; Sober answers as `> answer: ...`)
