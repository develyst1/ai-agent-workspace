# ORDER for Marie — memory web, full build (from Atlas, 2026-10-20)

> **This workspace's copy, for reference only — NOT an order to this workspace's Marie.** Taken 2026-10-21 by Marie
> from the sibling workspace `ai-agent-workspace-entronica` (`MARIE.md` ORDER 29.2) because `memory-cue.sh` and
> `session-desk.mjs` cite it as their origin. Executed there, not here (report: the sibling's
> `MARIE-REPORT-2026-10-20-memory-web-full-build.md`). One change: the absolute path of another machine in §4 is
> replaced by a name (`CLAUDE.md` → "Paths & machines"); every other line is verbatim.

Approved by the operator 2026-10-20 (*"ได้ สร้างเต็มรูปแบบ ตั้ง 23:00 เลย"*). Design: `BUNNY-DESIGN-2026-10-20.md`
(§4–§6; small test passed, §10). Your small-test tools stay as they are (`scripts/memory/extract-day.mjs`, `recall.mjs`).
Atlas creates the 23:00 schedule himself. Pilot desk: usb-oda (the tools work for any desk with a `memory/MAP.md`).

## 1. Which desk is this session — `scripts/memory/session-desk.mjs`

Hooks get `session_id` and `transcript_path`. Resolve and cache `<desk> <Name> <ROLE>` in
`.claude/session-desk/<session_id>` (git-ignored):
- a prompt matching `/desk <desk> <Name>` → write it at once (the role row from `<desk>/ai-worker/TEAMS.md`);
- otherwise, on first need, read the transcript with the same rules as `extract-day.mjs` (latest `/desk`, else the
  identity line + desk-path majority); cache the answer, or cache `none` so it is not re-read every prompt.
- Sessions with no desk (Atlas, Marie, Bunny) → `none` → no cue.

## 2. One hook script, four moments — `scripts/hooks/memory-cue.sh`

Wired in `.claude/settings.json` (and `scripts/run/run-settings.json` if it carries the other hooks):
- **A** `UserPromptSubmit` → text = the prompt. Skip a bare `reset` (reset-word owns it).
- **B** `PreToolUse` `Write|Edit` when the path matches `project-docs/**/owner-notes/**`, `**/pr-bodies/**` or
  `**/drafts/**` → text = path + the content / new_string.
- **C** `PreToolUse` `Bash` when the command contains `git branch|checkout|switch|merge|push|rebase|commit|tag` or
  `gh pr` → text = the command.
- **D** `PreToolUse` `Bash` when the command contains `ssh`, `helm`, `argocd`, `kubectl`, `gh workflow`, or a word
  `loadtest|sit|uat` → text = the command.
- Then `recall.mjs <desk> --hook <text>`; output → `additionalContext` (UserPromptSubmit / PreToolUse form). No hit,
  no desk, no `memory/MAP.md`, any error → no output, exit 0. **Never blocks.** Must finish under 2 s.
- Test table (≥ 12 piped cases, real desk off — use a scratch copy): each moment hit / miss, reset skipped, a
  no-desk session silent, a desk without MAP silent, a slow/failed recall silent.

## 3. Gate (check-hygiene.mjs §6f)

If `ai-worker/memory/` exists: FAIL a knot > 4 KB or `MAP.md` > 12 KB; FAIL a line in `memory/*.md` that looks like a
secret (password/token/key = value, a 10-digit phone or customer number, `Bearer …`); WARN a knot not listed in
MAP.md. Never read `memory/digest/`. Test on a scratch copy.

## 4. Template and v1

- Template: `_templates/project/ai-worker/memory/` (`MAP.md` header, empty `struck.md`), `talks/README.md`; harness
  lists `memory/` and `talks/` as desk-owned. `.gitignore` lines for `*/ai-worker/memory/digest/` and
  `.claude/session-desk/`. Bump `harness.json`; `install.mjs` all desks; `check-harness` → all current.
- Mirror scripts, hooks, settings, gate, template, `.gitignore`, `BUNNY.md` and `BUNNY-DESIGN-2026-10-20.md` into
  the sibling's team copy `ai-agent-workspace-v1` (its path is on another machine and is not recorded here). **No digest, no knot, no real name** there — grep v1 after (the
  design §10 table names people: in v1 replace that section with the counts only).

## 5. Live check

In a real Claude session on usb-oda you may not type for the operator — so: run one prompt through a headless
`claude -p` from the workspace root with a session that resolved to usb-oda (or explain why not), and show the
`additionalContext`. Otherwise NOT VERIFIED live.

No git. Edit/Write for files you author. Report: `MARIE-REPORT-2026-10-20-memory-web-full-build.md` (no chat text).
