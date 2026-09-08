# Dispatcher state — dte

> Written ONLY by the dispatcher (workspace-root `DISPATCHER.md`): one line per
> hop, a run header per run, and the digest that ended the run. Keep the last 5
> runs here; older runs go verbatim to `archive/` in a PM housekeeping hop.

_(no runs yet — desk opened 2026-09-06. First run starts when the owner gives
Porter a requirement, or says "ไปเลย".)_

## RUN 2026-09-07-l — N=4 — started from: standing instruction (stop asking about git) + code work
hop 1 | PM  | did: recorded owner's standing ruling as SYSTEM-FACTS A23 (git/branches/commits are outside the team's scope — never asked, never reported, never a gate; the no-commit/no-deploy guard is unchanged), closed every board item that existed only for that subject | ball_to: SA | flags: 1 low-confidence assumption, and it is itself a git-scope boundary note — not raised to the owner, per A23
hop 2 | SA  | did: struck the closed git item in TASK-002 per A23, wrote TASK-003 (antd 6.4.3 + nextjs-registry, themes.css->antd token bridge with drift-guard, 2 ui/ wrappers, probe route deleted before close) for Fern | ball_to: FE | flags: 2 low-confidence assumptions, both hazards TASK-003 makes Fern measure in a browser — not owner questions
hop 3 | FE  | did: TASK-003 -> REVIEW: antd 6.4.3 + registry at exact pins, theme-token bridge browser-verified in both themes, 2 ui/ wrappers, probe route deleted, build+tsc green | ball_to: SA | flags: 1 low-confidence assumption, 4 questions for Sober (biggest: +100.8 kB First Load JS on all 13 routes)
STOPPED hop 3/4 — condition 3 (low-confidence assumption)
Digest sent (Thai): foundation ครบ 3 tasks. ประเด็นที่ owner ควรรู้: antd ทำให้ First Load JS +100.8 kB ทุก route
(ยังไม่ได้วัดแบบ gzip). Sober ต้อง review TASK-003 แล้วตัดสิน 4 ข้อ. REQ-003/REQ-004 ยังรอ SA.

## RUN 2026-09-08-a — N=4 — started from: ไปเลย
hop 1 | SA  | did: reviewed TASK-003 -> DONE no rework (re-ran 13 DoD checks himself, AFTER bundle numbers reproduced exactly), answered Fern's Q1-Q4, opened SPEC-001 Decision 6 for the bundle cost | ball_to: SA | flags: 1 low-confidence assumption (no performance budget exists, so the bundle remedy is treated as SA's call)
hop 2 | SA  | did: REQ-004 -> IN_SPEC: enumerated 14 old-name hits in 9 files (front 3 / back 7 / docs 1 / owner-only 3), wrote SPEC-002 + TASK-011 (FE) + TASK-012 (BE) | ball_to: FE | flags: 3 questions, 2 irreversible_pending
STOPPED hop 2/4 — condition 1 (questions for human)
Digest sent (Thai): TASK-003 ปิด DONE. REQ-004 แตกเป็น 2 tasks ทำขนานกันได้ (Fern + Jason ซึ่งยังไม่เคยถูกปลุกเลย).
3 คำถาม: README บรรทัด "Disrupting Thai Education" เป็นประโยคไม่ใช่ชื่อ / ตัดคำโปรยไทยใน tab title ทิ้งจริงไหม / ของนอก repo owner จัดการเอง.
พบว่า back/ โดนด้วยจริง รวมถึง Swagger info.title ที่ /docs และ system prompt ภาษาไทยใน src/routes/ai.ts.

## RUN 2026-09-08-b — N=4 — started from: answers (README sentence / cut taglines / owner handles the rest) + ไปเลย
hop 1 | PM  | did: recorded A24-A26 (README line 3 replaced whole-sentence with the bare name; taglines may be cut; owner-only items are his and the team stops chasing them), scoped AC-2's zero-search to front/+back/+README.md | ball_to: SA | flags: none
hop 2 | SA  | did: folded A24-A26 into SPEC-002 (Rule S + exact README literal), wrote TASK-013 (README, BLOCKED pending a routing call), TASK-011 unblocked | ball_to: PM | flags: none for the owner; SPEC-002 Q4 is a routing question for Porter (repo root belongs to neither engineer)
hop 3 | FE  | did: TASK-011 -> REVIEW: 3 line edits in front/ (2 Rule T titles, em dash byte-verified; 1 Rule N creator), build+tsc green, browser tab checked via next start | ball_to: SA | flags: 1 irreversible_pending (stale next dev PID 8400 on port 3000, not his to kill)
hop 4 | BE  | did: TASK-012 -> REVIEW: 7 substring swaps across 6 back/ files (Swagger info.title, console banner, Thai AI system prompt, 2 SQL comments, package.json, back/README.md), /docs checked in a browser, no DB touched | ball_to: SA | flags: 1 low-confidence assumption (banner box was already misaligned before this task)
STOPPED hop 4/4 — condition 5 (hop budget reached)
Digest sent (Thai): REQ-004 ลงมือแล้วทั้งสองฝั่ง — Fern (front 3 จุด) + Jason (back 7 จุด) รอ Sober review ทั้งคู่.
ค้าง: TASK-013 (README) ยังไม่มีคนรับ เพราะ repo root ไม่ใช่ของ engineer คนไหนตาม PROTOCOL — Porter ต้องตัดสิน.
owner อาจต้องฆ่า process next dev PID 8400 ที่ค้างบน port 3000.

## RUN 2026-09-08-c — N=4 — started from: ไปเลย
hop 1 | SA  | did: reviewed TASK-011 + TASK-012 as one unit -> both DONE no rework; zero old-name hits left in front/ + back/; answered both engineers' Q1; trimmed inbox 2.6KB->0.9KB | ball_to: PM | flags: 1 question (unify other tab titles?), REQ-004 still IN_SPEC only because TASK-013 has no assignee
hop 2 | PM  | did: answered SPEC-002 Q4 as a routing call — TASK-013 (repo-root README) to Jason as a one-off, PROTOCOL unamended; confirmed the exact literal; carried Q5 to the owner | ball_to: SA | flags: 2 questions (both optional/non-blocking), 1 low-confidence assumption
hop 3 | SA  | did: assigned TASK-013 to Jason and moved it BLOCKED -> TODO, recorded the one-off limits in TASK/SPEC-002 Q4/board | ball_to: BE | flags: none
hop 4 | BE  | did: TASK-013 -> REVIEW: repo-root README.md:3 replaced with `> **Develyst The Education**`, verified byte-exact | ball_to: SA | flags: none; 1 non-blocking Q1 for Sober (pre-existing U+FFFD chars in README lines 5 and 157)
STOPPED hop 4/4 — condition 5 (hop budget reached)
Digest sent (Thai): REQ-004 แก้ครบทุกจุดที่ทีมดูแลแล้ว (front 3 + back 7 + README 1) เหลือ Sober review TASK-013 ตัวเดียว.
ค้างที่ owner: Q5 ชื่อแท็บหน้าอื่นจะทำให้เหมือนกันทั้งเว็บไหม (ไม่บล็อก) + veto การให้ Jason แก้ README ได้.

## RUN 2026-09-08-d — N=4 — started from: answers (unify titles site-wide / veto declined) + ไปเลย
hop 1 | PM  | did: recorded A27/A28, opened REQ-005 (unify page titles) at DRAFT with one owner question about the title shape, closed SPEC-002 Q5 | ball_to: SA | flags: 1 question (a vs b title shape, non-blocking), 1 low-confidence assumption (REQ-005 priority LOW)
hop 2 | SA  | did: reviewed TASK-013 -> DONE, re-ran the full-repo enumeration himself (0 hits in front/+back/+README, 3 left in DTE.md = owner-only), SPEC-002 -> DONE, REQ-004 -> SPEC_DONE | ball_to: PM | flags: none
hop 3 | PM  | did: REQ-004 acceptance check — AC 1/2/3/4/6 MET, AC 5 met only on its engineer half, so REQ-004 held at SPEC_DONE pending the owner's eyes | ball_to: HUMAN | flags: 2 questions
STOPPED hop 3/4 — conditions 1 + 7
Digest sent (Thai): REQ-004 เสร็จหมดฝั่งทีม รอ owner ดูด้วยตาแล้วพูดคำเดียวถึงจะเป็น DELIVERED.
คำถามค้าง: REQ-005 ต้องเลือกว่า title เหมือนกันแบบ (ก) ทุกหน้าข้อความเดียวกัน หรือ (ข) ชื่อหน้า + หางเดียวกัน.
Sober เดินต่อได้เองโดยไม่ต้องรอ owner: REQ-003, วัด bundle, TASK-004 (/login).

## RUN 2026-09-08-e — N=4 — started from: answer (REQ-005 shape = b) + ไปเลย
hop 1 | PM  | did: housekeeping — compacted 3 over-length board cells after moving the one board-only fact into REQ-004; gate back to PASS | ball_to: HUMAN | flags: none (pipeline not actually blocked — SA queue is full)
hop 2 | PM  | did: recorded A29 (title shape = page name + common tail), closed REQ-005 Q1, opened Q2 for the exact separator + what `/` reads; REQ-005 held at DRAFT | ball_to: HUMAN | flags: 2 questions, non-blocking
hop 3 | SA  | did: REQ-003 -> IN_SPEC: wrote SPEC-003 + TASK-014 (remove 4 inherited routes + 2 data files + 4 links, 307 redirects via next.config.ts), enumerated against the real tree | ball_to: FE | flags: 2 non-blocking questions (no support-contact affordance after /contact goes; stray about-page files)
