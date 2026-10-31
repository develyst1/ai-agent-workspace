# TASK-001: Requirement md + 4 Mermaid diagrams + README in buddy-screen-spec
- Source: SPEC-002 (§1, AC-1, AC-2 of REQ-002)
- Owner: FE (Fern)
- Status: DONE (2026-10-28, SA review)
- Depends on: none
- Repo: `buddy-screen-spec` (path in the workspace-root `machine.local.md`) — write access for this TASK only (DECISIONS 2026-10-28 19:58). **No git writes** (no add/commit/push).

## What to do
1. Create `REQUIREMENTS-V1.md` at the repo root: **§1–§16 of `buddy-screen/project-docs/requirements-v1.md`, copied word for word** (tables, tags, numbers, Thai text unchanged). Above §1, replace the source's header block (its lines 1–15) with:
   - the title line `# AI for Kids (buddy-screen) — Version 1 requirements, complete`;
   - one paragraph: "This document is self-contained. It was written by the project's PM on 2026-10-28 from the owner's requirement and decisions. Provenance tags: `[owner]` · `[owner-approved]` · `[Atom-decided]` (decided on the owner's delegation, reversible) · `[needs owner]` (deliberately open)." — plus the 🔴 children's-data line exactly as in the source.
   - No path into the AI workspace (`ai-worker/…`) may appear; a fresh clone does not have it.
2. Create `diagrams/` with four files, each = a heading, one sentence and one ```` ```mermaid ```` block:
   - `01-system-context.md` — `flowchart`: TV app (home device: on-device recognition/pose) ↔ backend (main server: ledger, memory, LINE gateway, encrypted templates) ↔ owner's LLM gateway (text) · speech service (STT/TTS) · LINE (parent chat + LIFF) · payment provider (open). Label the TV→backend arrow "results only, no images" (R-ID-6).
   - `02-engagement-states.md` — `stateDiagram-v2` with exactly `active`, `idle_present`, `idle_absent`, `sleep` and the transitions of requirement §6, with labels `10 s`, `20 s`, `out of frame`. A note on each state: counted / not counted.
   - `03-overtime-borrowing.md` — `flowchart`: daily limit reached → setting "no overtime" → end · else LINE message (อนุมัติ / ไม่อนุมัติ) → approve = paid extension 12.50 THB/h per minute · decline = session ends · no answer in **3 h** → borrow from **Sunday** → Sunday used up → approval + payment only · buy-back 12.50 THB/h.
   - `04-childrens-data.md` — `flowchart` of requirement §10: camera frames stay on the home device; templates → encrypted on the server + temp cache; voice → speech service, not stored by us; transcripts 30 days; memory 30 days after the subscription ends.
3. Replace the content of `README.md` with: `# buddy-screen-spec`, one line on what the product is (requirement §1, first sentence), and links to `REQUIREMENTS-V1.md`, `diagrams/` (all four files) and `demo/` (with the command `cd demo && npm install && npm run dev`, which TASK-002 creates).

## Definition of Done
- [ ] Content check: `diff <(sed -n '/^## 1\./,$p' <workspace>/buddy-screen/project-docs/requirements-v1.md) <(sed -n '/^## 1\./,$p' REQUIREMENTS-V1.md)` → **no output** (§1–§16 identical). Run from the spec repo; paste the command and its (empty) output.
- [ ] No workspace path: `grep -n "ai-worker" REQUIREMENTS-V1.md README.md diagrams/*.md` → no output.
- [ ] All four diagrams render, run from the spec repo (proven on a sample by the SA 2026-10-28):
      `echo '{"args":["--no-sandbox"]}' > /tmp/pp.json && for f in diagrams/*.md; do PUPPETEER_EXECUTABLE_PATH=$(command -v google-chrome) PUPPETEER_SKIP_DOWNLOAD=1 npx -y @mermaid-js/mermaid-cli@11 -p /tmp/pp.json -i "$f" -o "/tmp/mmd-$(basename "$f")" || echo "FAIL $f"; done`
      → four `✅` lines, no `FAIL`. The outputs go to `/tmp`, **never into the repo**.
- [ ] Numbers in the diagrams: `grep -nE "10 s|20 s|3 h|Sunday|12.50" diagrams/*.md` → each appears in the diagram it belongs to (paste).
- [ ] `git -C <spec repo> status --porcelain` → exactly `M README.md`, `?? REQUIREMENTS-V1.md`, `?? diagrams/`. No commit: `git log --oneline -1` still `0e6e911`.

## Implementation Notes
2026-10-28, Fern (FE). Repo `buddy-screen-spec`, branch `main`, HEAD `0e6e911`, clean before and after (`git log --oneline -1` → `0e6e911 Initial commit`). `buddy-screen-front` read-only check: clean, HEAD `8a3280c`.

Changed: `REQUIREMENTS-V1.md` (new, 199 lines: SPEC header + source §1–§16 appended by `sed -n '/^## 1\./,$p' … >>`, a file copy, no retyping) · `diagrams/01..04-*.md` (new) · `README.md` (replaced as ordered, demo line included).

- Content diff (src = `project-docs/requirements-v1.md`) → printed `DIFF EMPTY` (§1–§16 identical).
- `grep -n "ai-worker" REQUIREMENTS-V1.md README.md diagrams/*.md` → no output.
- Mermaid render, the DoD loop, outputs in `/tmp`: four `✅ /tmp/mmd-0N-….md` lines (01 system-context, 02 engagement-states, 03 overtime-borrowing, 04 childrens-data), no `FAIL`.
- Numbers grep: `10 s` (02 l.8), `20 s` (02 l.14–15), `3 h` / `Sunday` / `12.50` (03 l.12, 13, 10, 15, 16).
- `git status --porcelain` → ` M README.md`, `?? REQUIREMENTS-V1.md`, `?? diagrams/`.

Assumptions (SA may veto): (1) the header's children's-data line is kept as a blockquote, text identical to the source. (2) In diagram 02 the `sleep → active` arrow uses the §6 wording "Buddy recognised and invitation, gesture or name call"; `[*] → active` is added as the entry point. (3) Diagram 03 shows buy-back as a branch off "borrow" (§7 R-Q-7).
UNVERIFIED — how the diagrams look on GitHub's Mermaid renderer (only mermaid-cli was run); a person viewing the rendered SVGs would settle visual layout.

## Questions

## Review
**2026-10-28 — the SA — verdict: DONE.**
I re-ran the decisive checks myself, in the spec repo:
- §1–§16 diff against `project-docs/requirements-v1.md` → empty (`DIFF-EMPTY`).
- `grep -n "ai-worker"` → nothing.
- mermaid-cli@11 on all four diagrams → four `✅ …svg`, outputs in the SA's scratchpad, not in the repo.
- `git status --porcelain` → ` M README.md`, `?? REQUIREMENTS-V1.md`, `?? diagrams/`; HEAD still `0e6e911`; `buddy-screen-front` clean.

Content read against requirement §6, §7 and §10: states, transitions and numbers (10 s, 20 s, 3 h, Sunday, 12.50) match. "Results only, no images" is on the TV→backend arrow. The header and README are as ordered.
Assumptions (1)–(3): accepted.
Two omissions, accepted as summary-level (they contradict nothing; the full text is in `REQUIREMENTS-V1.md`):
- diagram 02 `active → sleep` omits "or the child says stop";
- diagram 04 omits the template retention ("until deleted, or 30 days after the subscription ends").
The PM/QA may ask for them; a one-line edit each.
UNVERIFIED (as the FE says): rendering on GitHub's own Mermaid. mermaid-cli uses the same library, so the risk is low.
