# RUN PLAN — <project> — long dispatcher run

> Stage 1 (readiness) is done with the operator present; Stage 2 runs without asking.
> The dispatcher starts only when the last line is signed. Re-sign after any change.
> Rules: `DISPATCHER.md` § "Long run".

```yaml
mode: dispatcher
date: YYYY-MM-DD
models:            # operator's choice 2026-10-06
  PM: opus
  SA: opus
  QA: opus
  FE: sonnet
  BE: sonnet
effort: medium
```

## Items — each must be 100 % before it enters the run

| # | Item (REQ / TASK ids) | Team | Depends on (# of items) | Where in the spec (node ids · screens · repo) | Spec damage check | Decisions it relies on (DECISIONS lines) | Open questions | Hops (est.) |
|---|---|---|---|---|---|---|---|---|
| 1 | | | — | | none / amendment `<id>` approved | | **0** | |

**Total hops: ___** (includes one fix-round allowance per item)

Items dropped as not ready (stay for manual mode): <list, with why>

## Allowed in Stage 2

- Edit only files on a TASK's closed list; local branches in per-team worktrees; local commits in host style.
- Unit/widget tests, static analysis; local web run per the desk's environment rules (`PROTOCOL.md`).

## Forbidden (the guard hook blocks the technical ones)

push · tag · PR · `--force` · deleting branches · deploys · SQL · editing office files (xlsx/docx/pptx) ·
contacting anyone · asking the operator · picking up items not listed above.

---

confirmed: `[operator YYYY-MM-DD HH:MM] hops: ___` — ____________
