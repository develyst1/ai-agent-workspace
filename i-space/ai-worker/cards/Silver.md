# Card — Silver (SA, Team B, i-space)

> **For Silver only** — the memory-card pilot (MARIE.md ORDER 43, owner GO 2026-10-30 14:43). Injected into
> Silver's context at every session start (scripts/hooks/memory-cards.sh), so it is what survives a `/clear`.
> **Cap 4 KB** (check-hygiene WARNs above it). **Only Silver edits this card**, at a distill review
> (`node scripts/memory/distill.mjs Silver` → review `cards/Silver.proposed.md` → move kept lines here →
> `node scripts/memory/distill.mjs Silver --done`).
> One line per item: `- <habit / correction / owner preference / decision> — source: <quote> (<log line | transcript file:line | DECISIONS/REQ/TASK pointer>)`.
> Pointers, never copied content.

- correction: a consumer list is grepped over `src` AND `test` (both roots), and for a type change the schema/type name too, not only field names — source: "my search … covered caw-back's `src` folder but not its `test` folder" (FAILURES F-035; also F-027/F-028/F-029)
- correction: every NEW file a TASK names is checked with `git check-ignore -v <path>` at cut time (exit 1 = fine) — source: "`.gitignore:31` (`coverage`) hides the whole `src/coverage/` folder" (FAILURES F-033)
- correction: a SPEC rule that derives a state from the same data as an existing rule (waiting vs workable) cites that rule's line and works one boundary case — source: "a card whose own dependencies are all done can be worked" (FAILURES F-038; SPEC-114 D3)
- habit: edit scripts use `replace(a, () => b)` (never a string `b` with `$`), then read the changed lines back with grep/sed — source: "pasted the whole file into SPEC-110" (FAILURES F-025; Atlas practice relayed by the PM 2026-10-30)
- habit: no experimental git command in a team's working tree — fingerprints and checks are read-only (`git diff HEAD | sha256sum`); anything else in a scratch copy — source: "I ran `git add -N .` in caw-back" (FAILURES F-031)
- habit: at review I re-run the decisive checks myself (tests, tsc, scope via `git status --untracked-files=all`, e2e when the engineer left it UNVERIFIED) and open the screenshot — source: TASK-116/122/139/144 § Review
- habit: every DoD base is a real run on the current tree, refreshed when a held TASK is released — source: "DoD 5's base result has to be a real run, not my expectation" (TASK-143 DoD 5; PROTOCOL § Evidence)
- owner-preference: git only on the owner's OWN words typed in the PM pane (DECISIONS row says so), tree = QA's fp checked first, stage by name, author `develyst`, hashes to the PM — source: DECISIONS 2026-10-30 09:1x; CONVENTIONS.md § Git
- owner-preference: questions for the owner no longer block — the PM decides and logs them; git/deploy/money/customer text still wait for him — source: DECISIONS 2026-10-30 08:40
- habit: distill again after ANY later log entry (a git push counts) — ready-to-clear compares the last distill with the last log — source: "ready-to-clear บอกว่า NOT READY เพราะ distill ล่าสุด 14:57 ก่อน log 15:05" (Atom, 2026-10-30 15:1x, this session)
- habit: when QA's fp can't be reproduced (untracked files; QA's recipe is not written down), check read-only instead — path counts = QA's, no file newer than QA's "unchanged at" time, nothing ignored — and write that method into the hash report — source: log 2026-10-30 Silver 15:0x (REQ-117 git); same at REQ-105 09:2x
- correction: a SPEC claim about a value's uniqueness, nullability or range cites the schema line that decides it (`grep -n` on the table) — source: "Bob is right and my SPEC was wrong. I wrote that worker names can repeat, without checking the schema." (FAILURES F-040; TASK-147 Q2, `caw-back → src/db/schema.ts:24`)
- habit: caw-back DoD/test commands are copied from the last TASK's form `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT … bun --no-env-file …` so no run reads the remote TEST DB or starts real claude — source: "copying the exact base test commands from TASK-143" (transcript a1acc171…jsonl:469; SYSTEM-FACTS 12:54)

