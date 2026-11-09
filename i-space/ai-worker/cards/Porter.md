# Card — Porter (PM, i-space)

> **For Porter only** — the memory-card pilot (MARIE.md ORDER 43, owner GO 2026-10-30 14:43). Injected into
> Porter's context at every session start (scripts/hooks/memory-cards.sh), so it is what survives a `/clear`.
> **Cap 4 KB** (check-hygiene WARNs above it). **Only Porter edits this card**, at a distill review
> (`node scripts/memory/distill.mjs Porter` → review `cards/Porter.proposed.md` → move kept lines here →
> `node scripts/memory/distill.mjs Porter --done`).
> One line per item: `- <habit / correction / owner preference / decision> — source: <quote> (<log line | transcript file:line | DECISIONS/REQ/TASK pointer>)`.
> Pointers, never copied content.

- decision: Git runs only on the owner's own words — typed in the PM pane, or typed there by Atom (Atom typing = owner typing, ATOM.md 914450f). A relay ("เจ้าของเลือก…") is not. Quote the words to the SA with QA's tree fp; one commit per REQ; before reporting hashes verify HEAD = origin/atom, author, files, and tree-fp = QA's. — source: "Atom พิมพ์ = เจ้าของพิมพ์ สำหรับ git และการอนุมัติ" (DECISIONS 2026-10-30 08:4x)
- owner-preference: Never stop and wait for the owner — decide, log under DECISIONS § "ตัดสินใจแทนเจ้าของ รอทบทวน"; my own scope line excludes deploy/money/customer, git origination; gateway ≤ 6 per test round. — source: "ให้ตัดสินใจเองไปก่อนเลย … ห้ามหยุดรอ" (DECISIONS 2026-10-30 08:40)
- owner-preference: Goal = a project built through I-Space, full loop, locally; every REQ closed. Deployment / server / pm2 / SIT / `sit` branch / real .env: never touched. Deleting: show the owner the list first. — source: "ให้ทำงานโปรเจคนี้ให้จบ แค่นั้น" (DECISIONS 2026-10-30 23:3x)
- correction: Every time I write into a file comes from `date`, never copied from another file's stamp. — source: "ผมลงเวลาในไฟล์เป็นเวลาที่ยังมาไม่ถึง" (FAILURES F-044)
- correction: A requirement names only what the system can observe (REQ-119 req 4). — source: "ระบบมองไม่เห็นว่า worker เขียนไฟล์" (REQ-119 Q4b)
- correction: Relay an owner's place/name in his exact words, not my paraphrase. — source: log 2026-10-30.2 18:0x
- correction: Write the file, read it back, THEN nudge — never in the same batch as the write. — source: "files first, then nudge" (FAILURES F-030)
- habit: An inbox `>>` and `drain-inbox.mjs` each go alone in their own Bash call — no `&&`, `;` or `| tail` (hooks block chains). — source: F-030; log 2026-10-31 13:3x
- correction: Need Atlas? Write the file, then nudge its session myself (nudge-session), never wait. — source: "มึงก็สะกิดเองสิวะ" (capture 2026-10-31 14:45)
- correction: A slow turn → say why in one line; never pad the work. — source: "ถ้ามันนานเพราะเพ้อไปเองก็บอกสิ" (capture 2026-10-31 18:04)
- habit: An owner product statement goes into SYSTEM-FACTS before the REQ is opened. — source: transcript b0a428f4…jsonl:1423
- habit: A role "busy" for long reads no inbox/nudge — peek its tmux pane read-only, never type in it; stuck/no watcher → owner/Atom type there. Low memory → `ps`/`free -m`, name whose process; every live-run hand-off says "free -m first, stop < 3 GB". — source: Sober stuck 32 min on pm2 (log 2026-10-30.2 19:4x, F-048)
- habit: Before relaying a DATA REQUEST, check the owner has not already let the team do it (DECISIONS 2026-10-29 12:54). — source: REQ-123 R1
- habit: A live model failing differently each round → the server checks it on keys it holds, never on model wording (REQ-114 r2, REQ-126 r2). — source: DECISIONS 2026-10-30 10:1x, 2026-10-31 03:2x
