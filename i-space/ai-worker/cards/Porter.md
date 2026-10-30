# Card — Porter (PM, i-space)

> **For Porter only** — the memory-card pilot (MARIE.md ORDER 43, owner GO 2026-10-30 14:43). Injected into
> Porter's context at every session start (scripts/hooks/memory-cards.sh), so it is what survives a `/clear`.
> **Cap 4 KB** (check-hygiene WARNs above it). **Only Porter edits this card**, at a distill review
> (`node scripts/memory/distill.mjs Porter` → review `cards/Porter.proposed.md` → move kept lines here →
> `node scripts/memory/distill.mjs Porter --done`).
> One line per item: `- <habit / correction / owner preference / decision> — source: <quote> (<log line | transcript file:line | DECISIONS/REQ/TASK pointer>)`.
> Pointers, never copied content.

- decision: Git runs only on the owner's own words — typed in the PM pane, or typed there by Atom (Atom typing = owner typing, ATOM.md "Ruled by the owner — 2026-10-29", 914450f). A relay like "เจ้าของเลือก…" is not that. Quote the words to the SA with QA's tree fp (`tools/tree-fp.sh`, ORDER 45); one commit per REQ; verify HEAD = origin/atom, author, file count before reporting hashes. — source: "Atom พิมพ์ = เจ้าของพิมพ์ สำหรับ git และการอนุมัติ" (DECISIONS 2026-10-30 08:4x)
- owner-preference: Never stop and wait for the owner — decide, log under DECISIONS § "ตัดสินใจแทนเจ้าของ รอทบทวน"; my own scope line excludes deploy/money/customer, git origination; gateway ≤ 6 per test round. — source: "ให้ตัดสินใจเองไปก่อนเลย … ห้ามหยุดรอ" (DECISIONS 2026-10-30 08:40)
- owner-preference: Desk goal "100%" = owner deploys to SIT, runs a real project through I-Space full loop, team finishes it like him; SIT loop = stuck → fix locally → git → owner deploys → retest; deploy is his by hand (pm2); CI/CD design is an open topic I raise after the dress rehearsal. Team never touches SIT until recorded. — source: "จบงานได้เหมือนฉันทำเอง 100%" (SYSTEM-FACTS § "100% done"; plan `project-docs/plan-sit-th.md`)
- correction: Write the file, read it back, THEN nudge — never in the same batch as the write. — source: "files first, then nudge" (FAILURES F-030)
- habit: An inbox `>>` and `drain-inbox.mjs` each go alone in their own Bash call (hooks block chains, and a blocked chain writes nothing). — source: RESUME-HERE "What did NOT work"; F-030
- habit: Engineers are woken only via a line in inbox/WAKE.md (doorbell), never by the PM directly. — source: "the PM never addresses an engineer directly" (transcript b0a428f4…jsonl:1332)
- habit: An owner product statement goes into SYSTEM-FACTS before the REQ is opened. — source: "writing the owner's words into SYSTEM-FACTS, since it's a product intent" (transcript b0a428f4…jsonl:1423)
- habit: On "rule changed — re-read …", re-read those sections before writing anything else. — source: "re-reading the sections she named before writing anything else" (transcript b0a428f4…jsonl:2767)
- habit: When a live model keeps failing differently each round, stop chasing it — make the server check it deterministically (REQ-114 req 4). — source: "5 live runs, the model put the services somewhere different each time" (DECISIONS 2026-10-30 10:1x)
