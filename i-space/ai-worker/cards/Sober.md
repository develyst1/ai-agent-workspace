# Card — Sober (SA, Team A, i-space)

> **For Sober only** — the memory-card pilot (MARIE.md ORDER 43, owner GO 2026-10-30 14:43). Injected into
> Sober's context at every session start (scripts/hooks/memory-cards.sh), so it is what survives a `/clear`.
> **Cap 4 KB** (check-hygiene WARNs above it). **Only Sober edits this card**, at a distill review
> (`node scripts/memory/distill.mjs Sober` → review `cards/Sober.proposed.md` → move kept lines here →
> `node scripts/memory/distill.mjs Sober --done`).
> One line per item: `- <habit / correction / owner preference / decision> — source: <quote> (<log line | transcript file:line | DECISIONS/REQ/TASK pointer>)`.
> Pointers, never copied content.

- correction: every consumer grep runs over `src test`, once per changed schema/type name (not per field), re-run at TASK release on the current commit — source: "I grepped `insert(changeSets)` in `src` only, not in `test`." (F-034, F-042; transcript 2dc3fb00-47aa-4513-824d-52509dbff66a.jsonl:2064)
- correction: any TASK whose diff touches `openapi.json` gets a paired front `gen:api` TASK, and its review runs the front `check:api` — source: SPEC-106 said "Front: no change" (FAILURES F-036)
- correction: a rule computed per anchor (context, coverage) is simulated for every anchor kind the consumer uses (work, step, screen, data, decision) before cutting — source: "สาเหตุคือผมออกแบบพลาดเอง" (FAILURES F-037; transcript 2dc3fb00-…:3491)
- correction: run `date +%H:%M` before writing any time stamp; my stamps drifted ahead of the real clock — source: "I wrote 12:2x but the real clock is 11:49." (transcript 2dc3fb00-…:2533)
- habit: review = re-run the decisive checks myself (tsc, the new tests, the suites the change reaches; screenshots read by eye) before DONE — source: "Re-running the new tests, the probe and tsc myself." (transcript 2dc3fb00-…:1538)
- habit: at release, re-measure every DoD base on the commit the TASK starts from and fill the Depends hash — source: "Re-measuring them on `9578d51`." (transcript 2dc3fb00-…:1973)
- habit: at git, QA's fp = `git diff HEAD | sha256sum | cut -c1-12` (matched REQ-116 329169c658bb); no `git` identity on this box → `git -c user.name=develyst -c user.email=develyst1@hotmail.com commit`, no config change — source: "The fingerprint matches QA's tested tree exactly" (transcript 99bf0035-…:226,242)
- decision: one topic per commit per repo; the next topic in that repo depends on the previous commit hash — source: "ตามกติกา F-013 (commit ทีละเรื่อง)" (F-013; transcript 2dc3fb00-…:1517)
- owner-preference: git only on the owner's words relayed by the PM (DECISIONS line), via the git-command skill — source: owner's order lines in DECISIONS.md 2026-10-30 (transcript 2dc3fb00-…:2607)
- habit: set a SPEC's status to DONE as soon as its last TASK is committed (ready-to-clear refuses while one says IN_PROGRESS) — source: "SPEC-106 still shows IN_PROGRESS" (transcript 2dc3fb00-…:3787)
- habit: an inbox is written only by `echo '…' >> inbox/X.md` alone and drained by `drain-inbox.mjs` alone (Edit is blocked); then ring by session name (`Porter-ISP`), not socket address — source: "The hook only allows `>>` to append to an inbox" (transcript 99bf0035-…:270)
- owner-preference: any live gateway call needs the owner's word; tests use stubs — source: "เพราะนับเป็นการใช้ gateway ที่ต้องได้คำเจ้าของก่อน" (transcript 2dc3fb00-…:1800)

