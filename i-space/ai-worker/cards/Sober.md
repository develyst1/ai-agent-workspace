# Card — Sober (SA, Team A, i-space)

> **For Sober only** — the memory-card pilot (MARIE.md ORDER 43, owner GO 2026-10-30 14:43). Injected into
> Sober's context at every session start (scripts/hooks/memory-cards.sh), so it is what survives a `/clear`.
> **Cap 4 KB** (check-hygiene WARNs above it). **Only Sober edits this card**, at a distill review
> (`node scripts/memory/distill.mjs Sober` → review `cards/Sober.proposed.md` → move kept lines here →
> `node scripts/memory/distill.mjs Sober --done`).
> One line per item: `- <habit / correction / owner preference / decision> — source: <quote> (<log line | transcript file:line | DECISIONS/REQ/TASK pointer>)`.
> Pointers, never copied content.

- correction: consumers come from `tools/probe-change.sh <repo> <patch>` (patch by `diff -u` of copies), pasted + ticked, re-run at release; grep only as extra — source: "rules now require a scripted check" (spec-rules.md §1; F-034, F-042; 1ccec1f0-…:263)
- correction: any TASK whose diff touches `openapi.json` gets a paired front `gen:api` TASK, and its review runs the front `check:api` — source: SPEC-106 said "Front: no change" (FAILURES F-036)
- correction: a rule computed per anchor is simulated for every anchor kind the consumer uses before cutting — source: "สาเหตุคือผมออกแบบพลาดเอง" (F-037; 2dc3fb00-…:3491)
- correction: `date +%H:%M` in view BEFORE typing any stamp (incl. WAKE) — source: "I wrote 12:2x but the real clock is 11:49." (2dc3fb00-…:2533; F-049, F-053)
- correction: server trials end with `ps`+`free -m` pasted; stop only my own pid/port group, never by name; no pm2/deploy at all — source: "หยุดทดสอบ pm2 ทันที" (F-048; SYSTEM-FACTS 2026-10-30 23:31)
- habit: a permission refusal is reported (file + PM), never routed around; owner's word in my pane ⇒ rerun it unchanged — source: "I didn't go round the refusal" (2b665df1-…:401; 2ce1ff7a-…:376)
- habit: joint REQ AC check = my rows re-run, B's cited, joint path UNVERIFIED for QA — source: REQ-118 § AC check (log 2026-10-30.2 17:31)
- habit: review = re-run the decisive checks myself (tsc, new tests, reached suites) before DONE; last TASK DONE ⇒ SPEC DONE — source: "Re-running the new tests, the probe and tsc myself." (2dc3fb00-…:1538, :3787)
- habit: at release, re-measure DoD bases on the TASK's start commit, quiet box — source: "Re-measuring them on `9578d51`." (2dc3fb00-…:1973)
- habit: before ขึ้น git: `tools/tree-fp.sh` = QA's, paths = TASK list, `check-ignore` exit 1, `.env` ignored, no secret in diff; author develyst via `git -c` (CONVENTIONS § Git) — source: "fps matched QA" (spec-rules.md §4; 2b665df1-…:335)
- decision: one topic per commit per repo; the next topic in that repo depends on the previous commit hash — source: "ตามกติกา F-013 (commit ทีละเรื่อง)" (F-013; 2dc3fb00-…:1517)
- owner-preference: git only on the owner's words via the PM (Atom typing = owner typing), only the REQ named — source: ATOM.md 914450f; DECISIONS 2026-10-30
- habit: inbox written only by `echo '…' >> inbox/X.md` alone, drained by `drain-inbox.mjs` alone; then ring; no peer → one `inbox/WAKE.md` line; log part by `ls log/` — source: "The hook only allows `>>` to append to an inbox" (99bf0035-…:270; 74ea2f44-…:303)
- owner-preference: a live gateway call needs the owner's word; tests use stubs — source: DECISIONS 13:01 (2dc3fb00-…:1800)
- habit: my watcher survives /clear — `pgrep -af watch-inbox` before arming; exit 3 = already armed, not a wake — source: "already watching: inbox/SA.md" (74ea2f44-…:169)
- correction: last act of every session, even a no-work one = distill after my last log entry — source: "last distill 00:34 is before your 00:37 log entry" (8464fcb1-…:170)
- decision: owner's git line ≠ QA verdict (defect PM-accepted) → commit as ordered, tell the PM; board: my TASK rows only — source: "I committed as the owner ordered" (74ea2f44-…:270)

